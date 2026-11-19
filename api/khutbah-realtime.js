import { DIRECT_TRANSLATION_INSTRUCTIONS } from '../lib/khutbah-caption.js';
import { RequestError, control, json, readSessionHeaders, serverConfig } from '../lib/khutbah-server.js';

const MAX_SDP_BYTES = 64 * 1024;
const SESSION = {
  type: 'realtime',
  model: 'gpt-realtime-2.1',
  output_modalities: ['text'],
  audio: { input: { turn_detection: null } },
  reasoning: { effort: 'minimal' },
  instructions: DIRECT_TRANSLATION_INSTRUCTIONS,
  max_output_tokens: 300,
};

async function readSdp(message, signal, upstream = false) {
  const invalid = new RequestError(upstream ? 502 : 400, upstream
    ? 'De vertaaldienst gaf geen geldige verbindingsgegevens terug.'
    : 'De verbindingsgegevens voor de microfoon zijn ongeldig.');
  const tooLarge = upstream ? invalid : new RequestError(413, 'De verbindingsgegevens zijn te groot.');
  if (Number(message.headers.get('content-length')) > MAX_SDP_BYTES) throw tooLarge;
  if (!message.body) throw invalid;
  signal.throwIfAborted();
  const reader = message.body.getReader();
  const cancel = () => { reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SDP_BYTES) {
        cancel();
        throw tooLarge;
      }
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener('abort', cancel);
    reader.releaseLock();
  }
  const sdp = Buffer.concat(chunks, size).toString('utf8');
  if (!/^v=0\r?\n/.test(sdp) || !/^m=audio /m.test(sdp) || !/^m=application /m.test(sdp) || sdp.includes('\0')) throw invalid;
  return sdp;
}

// SDP is exchanged once. The browser then sends microphone audio over the peer connection.
export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Gebruik POST om de liveverbinding te openen.' }, 405, { Allow: 'POST' });
    try {
      const { authorization, session } = readSessionHeaders(request);
      if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/sdp') {
        throw new RequestError(415, 'Stuur de verbindingsgegevens als application/sdp.');
      }
      const signal = AbortSignal.any([request.signal, AbortSignal.timeout(15000)]);
      const offer = await readSdp(request, signal);
      const { apiKey, publicKey, supabaseUrl } = serverConfig();
      // heartbeat checks both operator membership and ownership of an unexpired broadcast.
      await control('heartbeat', { authorization, session, publicKey, supabaseUrl, signal });
      signal.throwIfAborted();
      const body = new FormData();
      body.set('sdp', offer);
      body.set('session', JSON.stringify(SESSION));
      const response = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body, signal,
      });
      if (response.status === 429) throw new RequestError(429, 'De gebruikslimiet van de livevertaling is bereikt.');
      if ([401, 403, 404].includes(response.status)) {
        throw new RequestError(503, 'Controleer de API-sleutel en toegang tot het realtime-model.');
      }
      if (!response.ok) throw new RequestError(502, 'De vertaaldienst kon de liveverbinding niet openen.');
      const answer = await readSdp(response, signal, true);
      return new Response(answer, { headers: { 'Content-Type': 'application/sdp', 'Cache-Control': 'no-store' } });
    } catch (error) {
      if (error instanceof RequestError) return json({ error: error.message }, error.status);
      if (['TimeoutError', 'AbortError'].includes(error.name)) return json({ error: 'Het openen van de liveverbinding duurde te lang of werd onderbroken.' }, 504);
      return json({ error: 'De verbinding met de vertaal- of uitzenddienst is mislukt.' }, 502);
    }
  },
};
