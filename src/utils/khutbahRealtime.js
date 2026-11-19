import { parseKhutbahOutput } from '../../lib/khutbah-caption.js';

const SETUP_TIMEOUT_MS = 8000;
const RESPONSE_TIMEOUT_MS = 4000;
const MAX_PENDING = 3;
const MAX_FAILURES = 3;

function completedCaption(response) {
  if (response.status_details?.reason === 'content_filter') return { caption: '' };
  if (response.status !== 'completed' || !Array.isArray(response.output)) return null;
  const messages = response.output.filter(item => item?.type !== 'reasoning');
  if (messages.length !== 1) return null;
  const [message] = messages;
  if (message?.type !== 'message' || message.role !== 'assistant'
      || (message.status && message.status !== 'completed') || !Array.isArray(message.content)) return null;
  if (message.content.some(part => part?.type === 'refusal')) return { caption: '' };
  if (!message.content.every(part => ['text', 'output_text'].includes(part?.type) && typeof part.text === 'string')) return null;
  const text = message.content.map(part => part.text).join('').trim();
  return parseKhutbahOutput(text, 'auto', undefined, true);
}

// Microphone media uses WebRTC. The ordered data channel carries clip boundaries and final captions.
export async function openKhutbahRealtime({ stream, signal, exchangeSdp, onDisconnect }) {
  signal.throwIfAborted();
  const [track] = stream.getAudioTracks();
  if (!track || track.readyState === 'ended') throw new Error('De microfoon is niet beschikbaar.');
  const peer = new RTCPeerConnection();
  const lifetime = new AbortController();
  const pending = new Map();
  const unacknowledged = [];
  let channel;
  let nextClip = 0;
  let consecutiveFailures = 0;
  let setupComplete = false;
  let configured = false;
  let resolveReady;
  let rejectReady;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });

  function close(unexpected = false) {
    if (lifetime.signal.aborted) return;
    lifetime.abort();
    signal.removeEventListener('abort', stop);
    for (const clip of pending.values()) {
      clearTimeout(clip.timer);
      clip.resolve(null);
    }
    pending.clear();
    unacknowledged.length = 0;
    channel?.close();
    peer.close(); // The same track still feeds the local WAV fallback.
    rejectReady(new Error('De liveverbinding is onderbroken.'));
    if (unexpected && setupComplete) onDisconnect?.();
  }

  function stop() { close(); }
  function disconnected() { close(true); }

  function send(event) {
    if (lifetime.signal.aborted) return;
    try {
      channel.send(JSON.stringify(event));
    } catch {
      disconnected();
    }
  }

  function checkReady() {
    if (configured && channel.readyState === 'open') resolveReady();
  }

  function onMessage({ data }) {
    let event;
    try { event = JSON.parse(data); } catch { return disconnected(); }
    if (!event || typeof event !== 'object') return disconnected();
    if (event.type === 'session.created') {
      const session = event.session;
      if (!session || session.audio?.input?.turn_detection != null) return disconnected();
      // Optional fields may be omitted from the server's session echo. The SDP
      // endpoint already fixed these defaults; an explicit contradiction is unsafe.
      const modalities = session.output_modalities;
      if (modalities !== undefined && (!Array.isArray(modalities) || modalities.length !== 1
          || modalities[0] !== 'text')) return disconnected();
      configured = true;
      checkReady();
    } else if (event.type === 'input_audio_buffer.committed') {
      // The server assigns item IDs. With manual turn detection there is exactly one ack per commit.
      const clip = unacknowledged.shift();
      if (!clip || !event.item_id) return disconnected();
      clip.item = event.item_id;
      send({ type: 'response.create', response: {
        conversation: 'none',
        metadata: { clip: clip.id },
        output_modalities: ['text'],
        input: [{ type: 'item_reference', id: clip.item }],
      } });
    } else if (event.type === 'response.created') {
      const id = event.response?.metadata?.clip;
      const clip = pending.get(id);
      if (clip) clip.responseId = event.response.id;
      else if (id) cancelResponse(id, event.response.id); // Its WAV fallback already started.
    } else if (event.type === 'response.done') {
      const clip = pending.get(event.response?.metadata?.clip);
      if (!clip?.item) return;
      finish(clip, completedCaption(event.response));
    } else if (event.type === 'error') {
      // A late cleanup can target a response or input already gone.
      if (/^(cancel|delete)_\d+$/.test(event.error?.event_id)) return;
      // Keeping this channel after a missing acknowledgment could attach the next caption to the wrong WAV.
      disconnected();
    }
  }

  function cancelResponse(clipId, responseId) {
    if (responseId) send({ type: 'response.cancel', event_id: 'cancel_' + clipId, response_id: responseId });
  }

  function deleteInput(clip) {
    send({ type: 'conversation.item.delete', event_id: 'delete_' + clip.id, item_id: clip.item });
  }

  function finish(clip, caption) {
    clearTimeout(clip.timer);
    pending.delete(clip.id);
    deleteInput(clip);
    clip.resolve(caption);
    consecutiveFailures = caption === null ? consecutiveFailures + 1 : 0;
    if (consecutiveFailures >= MAX_FAILURES) disconnected();
  }

  function expire(clip) {
    // A missing commit ack makes later acks ambiguous. A slow response already has an item ID
    // and can fall back independently while new speech continues through the live connection.
    if (!clip.item) return disconnected();
    cancelResponse(clip.id, clip.responseId);
    finish(clip, null);
  }

  function discard() { send({ type: 'input_audio_buffer.clear' }); }

  function commit() {
    if (lifetime.signal.aborted) return Promise.resolve(null);
    if (pending.size >= MAX_PENDING) {
      discard();
      return Promise.resolve(null);
    }
    return new Promise(resolve => {
      const clip = { id: String(++nextClip), resolve };
      clip.timer = setTimeout(() => expire(clip), RESPONSE_TIMEOUT_MS);
      pending.set(clip.id, clip);
      unacknowledged.push(clip);
      send({ type: 'input_audio_buffer.commit' });
    });
  }

  async function negotiate() {
    const opts = { signal: lifetime.signal };
    peer.addEventListener('connectionstatechange', () => {
      if (['disconnected', 'failed', 'closed'].includes(peer.connectionState)) disconnected();
    }, opts);
    peer.addTrack(track, stream);
    channel = peer.createDataChannel('oai-events');
    channel.addEventListener('message', onMessage, opts);
    channel.addEventListener('open', checkReady, opts);
    channel.addEventListener('close', disconnected, opts);
    channel.addEventListener('error', disconnected, opts);
    const offer = await peer.createOffer();
    lifetime.signal.throwIfAborted();
    await peer.setLocalDescription(offer);
    lifetime.signal.throwIfAborted();
    const answer = await exchangeSdp(offer.sdp, lifetime.signal);
    lifetime.signal.throwIfAborted();
    await peer.setRemoteDescription({ type: 'answer', sdp: answer });
  }

  signal.addEventListener('abort', stop, { once: true });
  const timer = setTimeout(disconnected, SETUP_TIMEOUT_MS);
  try {
    await Promise.all([ready, negotiate()]);
    lifetime.signal.throwIfAborted();
    discard(); // Do not commit audio accumulated while the SDP handshake was finishing.
    lifetime.signal.throwIfAborted();
    setupComplete = true;
    return { commit, discard, close: stop, get active() { return !lifetime.signal.aborted; } };
  } catch (error) {
    close();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
