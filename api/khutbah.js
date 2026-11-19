import { DIRECT_TRANSLATION_INSTRUCTIONS, KHUTBAH_OUTPUT_SCHEMA, TRANSLATION_INSTRUCTIONS, parseKhutbahOutput } from '../lib/khutbah-caption.js';
import { checkKhutbahSource, normalizeKhutbahSource } from '../lib/khutbah-guard.js';
import { verifyQuranVerse } from '../lib/quran-verse.js';
import { RequestError, control, json, readSessionHeaders, serverConfig } from '../lib/khutbah-server.js';

// Vercel Node function. Audio is processed in memory for one subtitle at a time.
const MAX_AUDIO_BYTES = 44 + 15 * 16000 * 2;
const AUDIO_MODEL_UNAVAILABLE = Symbol('audio model unavailable');
let retryDirectAudioAt = 0;
class UnavailableAI extends RequestError {}
const CONTINUATION_SCHEMA = {
  ...KHUTBAH_OUTPUT_SCHEMA,
  properties: {
    ...KHUTBAH_OUTPUT_SCHEMA.properties,
    kind: { type: 'string', enum: [...KHUTBAH_OUTPUT_SCHEMA.properties.kind.enum, 'separate'] },
  },
};
const CONTINUATION_INSTRUCTIONS = [
  'De opname bevat twee opeenvolgende fragmenten. Controleer of het tweede de onafgemaakte gewone gedachte van het eerste daadwerkelijk afmaakt.',
  'Geef alleen dan één zelfstandige Nederlandse ondertitel die beide delen getrouw weergeeft. Laat geen deel weg en verzin geen ontbrekende woorden of verbindend verhaal.',
  'Kies separate uitsluitend als je beide delen goed verstaat en het tweede duidelijk een nieuwe, zelfstandige gewone gedachte begint. Neem dan het volledige Arabisch in source op en laat caption leeg.',
  'Bij een onduidelijk verband kies je uncertain. Wacht een goed verstane gewone bijzin nog steeds op haar hoofdzin, kies dan continuation. Laat in beide gevallen caption leeg.',
].join(' ');

async function readAudio(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'audio/wav') {
    throw new RequestError(415, 'Stuur het fragment als WAV-audio.');
  }
  const tooLarge = () => new RequestError(413, 'Het audiofragment is langer dan 15 seconden.');
  if (Number(request.headers.get('content-length')) > MAX_AUDIO_BYTES) throw tooLarge();
  if (!request.body) throw new RequestError(400, 'Het audiofragment ontbreekt.');

  const chunks = [];
  let size = 0;
  const reader = request.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_AUDIO_BYTES) {
        await reader.cancel();
        throw tooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // The recorder emits a standard 44-byte header followed by little-endian PCM.
  const wav = Buffer.concat(chunks, size);
  if (size < 46 || size % 2 || wav.toString('latin1', 0, 4) !== 'RIFF'
      || wav.readUInt32LE(4) !== size - 8 || wav.toString('latin1', 8, 16) !== 'WAVEfmt '
      || wav.readUInt32LE(16) !== 16 || wav.readUInt16LE(20) !== 1 || wav.readUInt16LE(22) !== 1
      || wav.readUInt32LE(24) !== 16000 || wav.readUInt32LE(28) !== 32000
      || wav.readUInt16LE(32) !== 2 || wav.readUInt16LE(34) !== 16
      || wav.toString('latin1', 36, 40) !== 'data' || wav.readUInt32LE(40) !== size - 44) {
    throw new RequestError(400, 'Verwacht mono WAV-audio van 16 kHz en 16 bit.');
  }
  return wav;
}

function hasSignal(wav) {
  for (let offset = 44; offset < wav.length; offset += 2) {
    if (Math.abs(wav.readInt16LE(offset)) >= 32) return true;
  }
  return false;
}

async function openAI(path, body, apiKey, signal) {
  signal.throwIfAborted();
  const headers = { Authorization: `Bearer ${apiKey}` };
  if (typeof body === 'string') headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`https://api.openai.com/v1/${path}`, { method: 'POST', headers, body, signal });
  } catch (error) {
    if (error instanceof TypeError && !signal.aborted) throw new UnavailableAI(502, 'De verbinding met de vertaaldienst is mislukt.');
    throw error;
  }
  if (path === 'chat/completions' && [400, 403, 404].includes(response.status)) {
    const error = (await response.json().catch(() => null))?.error;
    if (response.status === 404 || [
      'model_not_found', 'insufficient_permissions', 'permission_denied', 'model_access_denied',
      'unsupported_parameter', 'unsupported_value', 'unsupported_model',
    ].includes(error?.code) || (response.status === 400 && ['model', 'modalities'].includes(error?.param))) {
      return AUDIO_MODEL_UNAVAILABLE;
    }
  }
  if (response.status === 429) throw new RequestError(429, 'De limiet van de AI-dienst is bereikt. Controleer het API-tegoed en de gebruikslimiet.');
  if (response.status === 404 || (response.status === 403 && (await response.json().catch(() => null))?.error?.code === 'model_access_denied')) {
    throw new UnavailableAI(503, 'Controleer de modeltoegang in OpenAI.');
  }
  if ([401, 403].includes(response.status)) throw new RequestError(503, 'Controleer de API-sleutel en de modeltoegang in OpenAI.');
  if (response.status >= 500) throw new UnavailableAI(502, 'De AI-dienst kon dit fragment niet verwerken.');
  if (!response.ok) throw new RequestError(502, 'De AI-dienst kon dit fragment niet verwerken.');
  try {
    return await response.json();
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof TypeError) throw new UnavailableAI(502, 'De verbinding met de vertaaldienst is mislukt.');
    throw error;
  }
}

async function translateDirectly(wav, apiKey, signal, mode, includeSpeechSource) {
  const result = await openAI('chat/completions', JSON.stringify({
    model: 'gpt-audio-1.5', modalities: ['text'], store: false, max_completion_tokens: 600,
    messages: [
      { role: 'system', content: DIRECT_TRANSLATION_INSTRUCTIONS },
      { role: 'user', content: [
        { type: 'input_audio', input_audio: { format: 'wav', data: wav.toString('base64') } },
      ] },
    ],
  }), apiKey, signal);
  if (result === AUDIO_MODEL_UNAVAILABLE) {
    // Avoid an extra failed round trip per clip on a warm instance with a restricted key.
    retryDirectAudioAt = Date.now() + 5 * 60_000;
    return null;
  }

  const choice = result?.choices?.[0];
  if (choice?.message?.refusal || choice?.finish_reason === 'content_filter') return { caption: '' };
  if (choice?.finish_reason !== 'stop' || choice.message?.tool_calls?.length || choice.message?.function_call) return null;
  return parseKhutbahOutput(choice.message?.content, mode, undefined, true, includeSpeechSource);
}

function incomplete(stage, reason) {
  return { caption: '', skipped: 'incomplete', stage, reason };
}

function translatedCaption(result, mode, transcript, includeSpeechSource, continuation) {
  if (result?.status === 'incomplete') {
    const reason = result.incomplete_details?.reason;
    if (reason === 'content_filter') return { caption: '' };
    return incomplete('translation', reason === 'max_output_tokens' ? 'output_limit' : 'incomplete_output');
  }
  if (result?.status === 'failed' || result?.status === 'cancelled') {
    throw new RequestError(502, 'De AI-dienst kon dit fragment niet verwerken.');
  }
  if (result?.status !== 'completed' || !Array.isArray(result.output)) return incomplete('translation', 'invalid_output');

  // A Responses message can split one complete JSON document across text parts.
  const messages = result.output.filter(item => item?.type === 'message');
  if (!messages.length) return incomplete('translation', 'missing_text');
  if (messages.length !== 1 || result.output.some(item => !['message', 'reasoning'].includes(item?.type))) return incomplete('translation', 'invalid_output');
  const { status, content } = messages[0];
  if (status && status !== 'completed') return incomplete('translation', 'incomplete_output');
  if (!Array.isArray(content) || !content.length) return incomplete('translation', 'missing_text');
  if (content.some(part => part?.type === 'refusal')) return { caption: '' };
  if (!content.every(part => part?.type === 'output_text' && typeof part.text === 'string')) {
    return incomplete('translation', 'invalid_output');
  }
  const text = content.map(part => part.text).join('');
  const decision = parseKhutbahOutput(text, mode, transcript, false, includeSpeechSource);
  if (decision !== null) return decision;
  if (continuation && text.length <= 6000) {
    let output;
    try { output = JSON.parse(text); } catch { return incomplete('translation', 'invalid_output'); }
    if (output?.kind === 'separate') {
      // Only the recovery route understands this marker. Validate it against the
      // complete STT text and the ordinary-source policy before releasing the next clip.
      if (Object.keys(output).length !== 3 || output.caption !== '' || checkKhutbahSource(output.source, mode) !== null ||
          normalizeKhutbahSource(output.source) !== normalizeKhutbahSource(transcript)) {
        return { caption: '', skipped: 'unverified' };
      }
      return { caption: '', skipped: 'separate' };
    }
  }
  return incomplete('translation', 'invalid_output');
}

async function translateTranscript(wav, apiKey, { signal, deadline, requestSignal }, { mode, expected, continuation, includeSpeechSource }) {
  const form = new FormData();
  form.append('model', 'gpt-transcribe');
  form.append('file', new Blob([wav], { type: 'audio/wav' }), 'fragment.wav');
  form.append('languages[]', 'ar');
  form.append('prompt', 'خطبة جمعة بالفصحى والدارجة المغربية. اكتب فقط ما سمعته بحروفه، بما فيه النفي والتكرار. لا تكمل آية أو حديثا أو شهادة من الذاكرة.');
  let stage = 'transcription';
  try {
    const transcript = await openAI('audio/transcriptions', form, apiKey, signal);
    if (typeof transcript?.text !== 'string') return incomplete('transcription', 'missing_text');
    // The transcription API returns an empty language list when it cannot identify the input language reliably.
    if (!transcript.text.trim() || (Array.isArray(transcript.languages) && !transcript.languages.length)) return { caption: '' };
    let checked = checkKhutbahSource(transcript.text, mode);
    // Only ordinary speech qualifies for rejoining. A quote or uncertain source
    // cannot become an automatic subtitle just because the next clip was added.
    if (continuation && checked !== null) return { caption: '', skipped: 'unverified' };
    if (expected) {
      const agrees = expected.quran
        ? checked?.quran === expected.quran
        : checked?.verified && checked.caption === expected.caption;
      if (!agrees || normalizeKhutbahSource(expected.source) !== normalizeKhutbahSource(transcript.text)) {
        return { caption: '', skipped: 'unverified' };
      }
    }
    if (checked?.quran) {
      const reference = checked.quran;
      // The local index only suggests a reference. Compare every Arabic word
      // with the publisher's verse before accepting its Dutch translation.
      checked = await verifyQuranVerse(transcript.text, reference, signal, {
        witness: expected?.source,
        includeArabic: mode === 'sources',
      });
      if (checked.verified) checked = { ...checked, quran: reference };
    }
    if (mode === 'sources') {
      return checked?.verified ? { ...checked, source: transcript.text } : { caption: '', skipped: 'unverified' };
    }
    if (checked !== null) return checked;

    stage = 'translation';
    const result = await openAI('responses', JSON.stringify({
      model: 'gpt-6-luna', store: false, reasoning: { effort: 'none' }, max_output_tokens: 1000,
      instructions: continuation ? TRANSLATION_INSTRUCTIONS + ' ' + CONTINUATION_INSTRUCTIONS : TRANSLATION_INSTRUCTIONS,
      input: transcript.text,
      text: { format: { type: 'json_schema', name: 'ondertitel', strict: true,
        schema: continuation ? CONTINUATION_SCHEMA : KHUTBAH_OUTPUT_SCHEMA } },
    }), apiKey, signal);
    return translatedCaption(result, mode, transcript.text, includeSpeechSource, continuation);
  } catch (error) {
    if (requestSignal.aborted) throw error;
    if (continuation && error instanceof UnavailableAI) return { caption: '', skipped: 'context_unavailable' };
    if (deadline.aborted && ['AbortError', 'TimeoutError'].includes(error?.name)) {
      if (continuation) return { caption: '', skipped: 'context_unavailable' };
      return incomplete(stage, 'timeout');
    }
    throw error;
  }
}

async function translate(wav, apiKey, timing, { route, mode, includeSpeechSource }) {
  const continuation = mode === 'auto' && route === 'continuation';
  let expected;
  if (mode === 'auto' && !continuation && route !== 'transcript' && Date.now() >= retryDirectAudioAt) {
    const result = await translateDirectly(wav, apiKey, timing.signal, mode, includeSpeechSource);
    if (result !== null && !result.verified && !result.quran) return result;
    // A model may complete a familiar quotation from memory. Verify the same audio independently.
    expected = result;
  }
  // The original WAV and deadline also apply to the single recovery attempt.
  const result = await translateTranscript(wav, apiKey, timing, { mode, expected, continuation, includeSpeechSource });
  if (continuation) return { ...result, route: 'continuation' };
  return { ...result, route: expected ? 'source-check' : 'transcript' };
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Gebruik POST voor een audiofragment.' }, 405, { Allow: 'POST' });
    try {
      const { authorization, session } = readSessionHeaders(request);
      const mode = request.headers.get('x-khutbah-mode') ?? 'auto';
      if (!['auto', 'sources'].includes(mode)) throw new RequestError(400, 'Onbekende modus voor broncontrole.');
      const number = request.headers.get('x-khutbah-sequence');
      const sequence = Number(number);
      if (!/^[1-9]\d{0,9}$/.test(number ?? '') || sequence > 2147483647) {
        throw new RequestError(400, 'De sessie of het fragmentnummer is ongeldig.');
      }
      const wav = await readAudio(request);
      const { apiKey, supabaseUrl, publicKey } = serverConfig();
      const deadline = AbortSignal.timeout(30000);
      const signal = AbortSignal.any([request.signal, deadline]);
      const options = { authorization, session, sequence, supabaseUrl, publicKey, signal };
      // Supabase checks the user, session lease and sequence before we incur AI costs.
      await control('claim', options);
      const route = request.headers.get('x-khutbah-route');
      if (!hasSignal(wav)) return json(mode === 'auto' && route === 'continuation' ? { caption: '', route } : { caption: '' });
      const includeSpeechSource = mode === 'auto' && request.headers.get('x-khutbah-include-source') === '1';
      const result = await translate(wav, apiKey, { signal, deadline, requestSignal: request.signal }, { route, mode, includeSpeechSource });
      request.signal.throwIfAborted();
      // Source review returns a candidate to the signed-in operator, who confirms publication.
      if (result.caption && mode === 'auto') {
        signal.throwIfAborted();
        await control('publish', options, result.caption);
      }
      return json(result);
    } catch (error) {
      if (error instanceof RequestError) return json({ error: error.message }, error.status);
      if (['TimeoutError', 'AbortError'].includes(error.name)) return json({ error: 'De verwerking duurde te lang of werd onderbroken.' }, 504);
      return json({ error: 'De verbinding met de vertaal- of uitzenddienst is mislukt.' }, 502);
    }
  },
};
