const OUTPUT_RATE = 16000;
const FRAME_MS = 40;
const SPEECH_FLOOR = 0.004;
const MAX_CLIP_MS = 4000;
const WAV_HEADER_BYTES = 44;
const PCM_BYTES_PER_SECOND = OUTPUT_RATE * 2;

function wavHeader(dataBytes) {
  const header = new DataView(new ArrayBuffer(WAV_HEADER_BYTES));
  function writeText(position, value) {
    for (let i = 0; i < value.length; i++) header.setUint8(position + i, value.charCodeAt(i));
  }
  writeText(0, 'RIFF');
  header.setUint32(4, 36 + dataBytes, true);
  writeText(8, 'WAVEfmt ');
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, OUTPUT_RATE, true);
  header.setUint32(28, PCM_BYTES_PER_SECOND, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  writeText(36, 'data');
  header.setUint32(40, dataBytes, true);
  return header.buffer;
}

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
  const pcm = new DataView(new ArrayBuffer(count * 2));
  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    const value = Math.max(-1, Math.min(1, sum / (end - start)));
    pcm.setInt16(i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Blob([wavHeader(pcm.byteLength), pcm.buffer], { type: 'audio/wav' });
}

// Combine waiting clips in order without decoding or resampling their PCM.
export function joinKhutbahWav(clips) {
  if (clips.length === 1) return clips[0];
  const payloads = clips.map(clip => clip.slice(WAV_HEADER_BYTES));
  const bytes = payloads.reduce((total, part) => total + part.size, 0);
  return new Blob([wavHeader(bytes), ...payloads], { type: 'audio/wav' });
}

export function khutbahWavDurationMs(clip) {
  return (clip.size - WAV_HEADER_BYTES) * 1000 / PCM_BYTES_PER_SECOND;
}

export function adjacentAudio(first, second, maxGap) {
  return Boolean(first && second && !first.combined && !second.combined &&
    second.capture === first.capture + 1 && first.boundary === second.boundary &&
    second.startedAt - first.closedAt <= maxGap &&
    khutbahWavDurationMs(first.clip) + khutbahWavDurationMs(second.clip) <= 8000);
}

// Keep a short lead-in for soft consonants. Prefer pauses and cap continuous speech.
export function speechSegments(rate, onClip, { onStart, onDiscard, isRealtime, isSourceReading } = {}) {
  let lead = [];
  let frames = [];
  let voicedMs = 0;
  let quietMs = 0;
  let softMs = 0;
  let voiceLevel = 0;
  let idleMs = 0;

  return (frame, rms) => {
    const speech = rms >= SPEECH_FLOOR;
    if (!frames.length && !speech) {
      lead.push(frame);
      if (lead.length > 4) lead.shift();
      idleMs += FRAME_MS;
      if (idleMs >= 1200) {
        onDiscard?.();
        idleMs = 0;
      }
      return;
    }
    if (!frames.length) {
      idleMs = 0;
      onStart?.();
      frames = lead;
      lead = [];
    }
    frames.push(frame);
    // A breath can stay above the silence floor on a loud mixer feed.
    softMs = rms < Math.max(SPEECH_FLOOR, voiceLevel * 0.3) ? softMs + FRAME_MS : 0;
    if (speech) {
      voiceLevel += (rms - voiceLevel) * 0.1;
      voicedMs += FRAME_MS;
    }
    quietMs = speech ? 0 : quietMs + FRAME_MS;
    const duration = frames.length * FRAME_MS;
    const streaming = isRealtime?.();
    // On a live connection a clear pause can release a phrase early. Allow
    // extra silence after a short utterance so a hesitation stays in the clip.
    const pauseMs = streaming
      ? (voicedMs >= 800 ? 240 : 400)
      : (duration >= 1800 ? 280 : 520);
    const softBreak = duration >= (streaming ? 2000 : 3000) && softMs >= 120;
    // In source review a full recited verse matters. A soft vowel or the usual
    // four-second cap can divide it into two fragments that cannot be verified.
    const complete = isSourceReading?.()
      ? quietMs >= 440 || duration >= 12000
      : quietMs >= pauseMs || softBreak || duration >= (streaming ? 2800 : MAX_CLIP_MS);
    if (complete) {
      if (voicedMs >= 160) onClip(encodeWav(frames, rate));
      else onDiscard?.();
      frames = [];
      quietMs = 0;
      voicedMs = 0;
      softMs = 0;
      voiceLevel = 0;
    }
  };
}

export async function openKhutbahMicrophone({ deviceId, signal, onLevel, live, onClip, onFailure, onStart, onDiscard, isRealtime, isSourceReading }) {
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
    const collect = speechSegments(context.sampleRate, onClip, { onStart, onDiscard, isRealtime, isSourceReading });
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
    return stream;
  } catch (error) {
    // getUserMedia can resolve after a cancelled permission dialog.
    signal.removeEventListener('abort', release);
    release();
    throw error;
  }
}
