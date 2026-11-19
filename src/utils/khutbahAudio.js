const OUTPUT_RATE = 16000;
const FRAME_MS = 40;

// Each upload is an independent mono PCM file, including its own WAV header.
function encodeWav(frames, rate) {
  const size = frames.reduce((total, frame) => total + frame.length, 0);
  const samples = new Float32Array(size);
  let offset = 0;
  for (const frame of frames) {
    samples.set(frame, offset);
    offset += frame.length;
  }

  const ratio = rate / OUTPUT_RATE;
  const count = Math.floor(size / ratio);
  const header = new DataView(new ArrayBuffer(44 + count * 2));
  function writeText(position, value) {
    for (let i = 0; i < value.length; i++) header.setUint8(position + i, value.charCodeAt(i));
  }
  writeText(0, 'RIFF');
  header.setUint32(4, 36 + count * 2, true);
  writeText(8, 'WAVEfmt ');
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, OUTPUT_RATE, true);
  header.setUint32(28, OUTPUT_RATE * 2, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  writeText(36, 'data');
  header.setUint32(40, count * 2, true);

  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    const value = Math.max(-1, Math.min(1, sum / (end - start)));
    header.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Blob([header.buffer], { type: 'audio/wav' });
}

// Keep a short lead-in for soft consonants. Prefer pauses and cap continuous speech.
export function speechSegments(rate, onClip) {
  let lead = [];
  let frames = [];
  let voicedMs = 0;
  let quietMs = 0;

  return (frame, rms) => {
    const speech = rms >= 0.004;
    if (!frames.length && !speech) {
      lead.push(frame);
      if (lead.length > 4) lead.shift();
      return;
    }
    if (!frames.length) {
      frames = lead;
      lead = [];
    }
    frames.push(frame);
    if (speech) voicedMs += FRAME_MS;
    quietMs = speech ? 0 : quietMs + FRAME_MS;
    const duration = frames.length * FRAME_MS;
    if (duration >= 8000 || quietMs >= 840 || (duration >= 2800 && quietMs >= 400)) {
      if (voicedMs >= 160) onClip(encodeWav(frames, rate));
      frames = [];
      quietMs = 0;
      voicedMs = 0;
    }
  };
}

export async function openKhutbahMicrophone({ deviceId, signal, onLevel, live, onClip, onFailure }) {
  if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) {
    throw new Error('Open de adminpagina via HTTPS of localhost in een recente browser met microfoontoegang.');
  }

  const context = new AudioContext();
  let stream;
  let node;
  const release = () => {
    if (node) {
      node.port.onmessage = null;
      node.disconnect();
    }
    stream?.getTracks().forEach(track => track.stop());
    if (context.state !== 'closed') context.close().catch(() => {});
  };
  signal.addEventListener('abort', release, { once: true });
  try {
    // Resume during the click gesture, before the microphone permission dialog.
    const resumed = context.resume().catch(() => {});
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    signal.throwIfAborted();
    await resumed;
    await context.audioWorklet.addModule(import.meta.env.BASE_URL + 'khutbah-frames.worklet.js');
    signal.throwIfAborted();
    if (context.state !== 'running') throw new Error('De browser heeft de audio gepauzeerd. Start de microfoon opnieuw.');

    node = new AudioWorkletNode(context, 'khutbah-frames', { channelCount: 1, channelCountMode: 'explicit' });
    const source = context.createMediaStreamSource(stream);
    source.connect(node);
    node.connect(context.destination);
    const collect = speechSegments(context.sampleRate, onClip);
    let nextLevel = 0;
    node.port.onmessage = ({ data }) => {
      let energy = 0;
      for (const sample of data) energy += sample * sample;
      const rms = Math.sqrt(energy / data.length);
      const now = performance.now();
      if (now >= nextLevel) {
        nextLevel = now + 120;
        const db = 20 * Math.log10(Math.max(rms, 0.0001));
        onLevel(Math.round(Math.max(0, Math.min(100, (db + 65) * 100 / 60))));
      }
      if (live()) collect(data, rms);
    };
    const disconnected = () => {
      if (!signal.aborted) onFailure('De geluidsinvoer is onderbroken. Controleer de USB-aansluiting en start opnieuw.');
    };
    node.onprocessorerror = disconnected;
    const [track] = stream.getAudioTracks();
    if (!track || track.readyState === 'ended') throw new Error('De microfoon is losgekoppeld. Kies een beschikbare ingang.');
    track.addEventListener('ended', disconnected, { signal });
    context.addEventListener('statechange', () => {
      if (context.state !== 'running') disconnected();
    }, { signal });
  } catch (error) {
    // getUserMedia can resolve after a cancelled permission dialog.
    signal.removeEventListener('abort', release);
    release();
    throw error;
  }
}
