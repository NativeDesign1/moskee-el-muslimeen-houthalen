import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/khutbah.js';

const session = '875da112-af44-4444-b89d-6ff364304458';
const rpcUrl = 'https://test.supabase.invalid/rest/v1/rpc/khutbah_control';
const audioUrl = 'https://api.openai.com/v1/chat/completions';
const transcriptionUrl = 'https://api.openai.com/v1/audio/transcriptions';
const translationUrl = 'https://api.openai.com/v1/responses';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.invalid';
process.env.VITE_SUPABASE_ANON_KEY = 'public-test';
process.env.OPENAI_API_KEY = 'server-key-test';

function wav({ samples = 16000, level = 3000 } = {}) {
  const body = Buffer.alloc(44 + samples * 2);
  body.write('RIFF');
  body.writeUInt32LE(body.length - 8, 4);
  body.write('WAVEfmt ', 8);
  body.writeUInt32LE(16, 16);
  body.writeUInt16LE(1, 20);
  body.writeUInt16LE(1, 22);
  body.writeUInt32LE(16000, 24);
  body.writeUInt32LE(32000, 28);
  body.writeUInt16LE(2, 32);
  body.writeUInt16LE(16, 34);
  body.write('data', 36);
  body.writeUInt32LE(samples * 2, 40);
  body.writeInt16LE(level, 44);
  return body;
}

function request(body = wav(), headers = {}) {
  return new Request('https://moskee.invalid/api/khutbah', {
    method: 'POST', body,
    headers: { Authorization: 'Bearer user-test', 'Content-Type': 'audio/wav',
      'X-Khutbah-Session': session, 'X-Khutbah-Sequence': '2', ...headers },
  });
}

function modelResult(caption) {
  return { status: 'completed', output: [{ type: 'message', content: [
    { type: 'output_text', text: JSON.stringify({ caption }) },
  ] }] };
}

function audioResult(caption) {
  return { choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: caption } }] };
}

// Record actual REST requests and return responses in provider call order.
function upstream(t, ...responses) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), ...options });
    const value = responses[calls.length - 1];
    assert.notEqual(value, undefined, `Unexpected call to ${url}`);
    if (typeof value === 'function') return value(options);
    return value instanceof Response ? value : Response.json(value);
  });
  return calls;
}

test('one authorized audio request translates a WAV directly to a Dutch caption', async t => {
  const caption = 'Wees goed voor je buren.';
  const calls = upstream(t, true, audioResult(caption), true);
  const audio = wav();
  const response = await handler.fetch(request(audio));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { caption });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, rpcUrl]);
  assert.deepEqual(calls.map(call => call.headers.Authorization), ['Bearer user-test', 'Bearer server-key-test', 'Bearer user-test']);
  assert.equal(calls[0].headers.apikey, 'public-test');
  assert.deepEqual(JSON.parse(calls[0].body), { p_action: 'claim', p_session: session, p_seq: 2 });
  const payload = JSON.parse(calls[1].body);
  assert.equal(payload.model, 'gpt-audio-1.5');
  assert.equal(payload.store, false);
  assert.deepEqual(payload.modalities, ['text']);
  assert.equal(payload.tools, undefined);
  assert.equal(payload.tool_choice, undefined);
  assert.deepEqual(payload.messages[1].content, [{ type: 'input_audio', input_audio: { format: 'wav', data: audio.toString('base64') } }]);
  assert.deepEqual(JSON.parse(calls[2].body), { p_action: 'publish', p_session: session, p_seq: 2, p_caption: caption });
});

test('rejects invalid or oversized input before fetching external services', async t => {
  const calls = upstream(t);
  const badWav = wav();
  badWav.writeUInt16LE(2, 22);
  for (const [req, status] of [
    [new Request('https://moskee.invalid/api/khutbah'), 405],
    [request(wav(), { Authorization: '' }), 401],
    [request(wav(), { 'X-Khutbah-Sequence': '1.5' }), 400],
    [request(wav(), { 'Content-Type': 'text/plain' }), 415],
    [request(badWav), 400], [request(Buffer.from('RIFF')), 400],
    [request(wav({ samples: 16 * 16000 })), 413],
  ]) {
    assert.equal((await handler.fetch(req)).status, status);
  }
  assert.equal(calls.length, 0);
});

for (const [reason, claim, status] of [
  ['expired token', new Response(null, { status: 401 }), 401],
  ['unauthorized user', new Response(null, { status: 403 }), 403],
  ['stale session or sequence', false, 409],
]) {
  test(`no paid requests for ${reason}`, async t => {
    const calls = upstream(t, claim);
    assert.equal((await handler.fetch(request())).status, status);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, rpcUrl);
  });
}

for (const [reason, level, results] of [
  ['silence', 0, []],
  ['unclear translation', 3000, [audioResult('[GEEN_ONDERTITEL]')]],
  ['content filter', 3000, [{ choices: [{ finish_reason: 'content_filter', message: { content: 'Niet publiceren.' } }] }]],
  ['refusal', 3000, [{ choices: [{ finish_reason: 'stop', message: { refusal: '...' } }] }]],
]) {
  test(`skips ${reason} without publishing`, async t => {
    const calls = upstream(t, true, ...results);
    const response = await handler.fetch(request(wav({ level })));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { caption: '' });
    assert.equal(calls.length, 1 + results.length);
  });
}

test('a session stopped during translation cannot publish a late caption', async t => {
  const calls = upstream(t, true, audioResult('Vrede.'), false);
  const result = await handler.fetch(request());
  assert.equal(result.status, 409);
  assert.equal(calls.length, 3);
  assert.equal((await result.json()).caption, undefined);
});

const truncatedAudio = {
  choices: [{ finish_reason: 'length', message: { content: 'Dit is slechts een' } }],
};
const transcript = 'أحسنوا إلى جيرانكم';
const recoveredCaption = 'Wees goed voor je buren.';

test('an incomplete direct answer recovers the same clip and publishes exactly once', async t => {
  const audio = wav({ level: 4321 });
  const calls = upstream(t, true, truncatedAudio, { text: transcript }, modelResult(recoveredCaption), true);
  const response = await handler.fetch(request(audio, { 'X-Khutbah-Sequence': '7' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: recoveredCaption, route: 'transcript' });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl, translationUrl, rpcUrl]);
  assert.deepEqual(JSON.parse(calls[0].body), { p_action: 'claim', p_session: session, p_seq: 7 });
  assert.deepEqual(Buffer.from(await calls[2].body.get('file').arrayBuffer()), audio);
  assert.equal(JSON.parse(calls[3].body).input, transcript);
  assert.deepEqual(JSON.parse(calls[4].body), { p_action: 'publish', p_session: session, p_seq: 7, p_caption: recoveredCaption });
  assert.ok(calls.every(call => call.signal === calls[0].signal));
});

test('a completed answer containing only a JSON caption is usable without another AI call', async t => {
  const calls = upstream(t, true, audioResult(JSON.stringify({ caption: recoveredCaption })), true);
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: recoveredCaption });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, rpcUrl]);
});

test('a client remembering the transcript route skips the direct call on the following clip', async t => {
  const calls = upstream(t, true, { text: transcript }, modelResult(recoveredCaption), true);
  const response = await handler.fetch(request(wav(), { 'X-Khutbah-Route': 'transcript', 'X-Khutbah-Sequence': '8' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: recoveredCaption, route: 'transcript' });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, transcriptionUrl, translationUrl, rpcUrl]);
  assert.equal(JSON.parse(calls.at(-1).body).p_seq, 8);
});

test('translation accepts one complete JSON caption split across output text parts', async t => {
  const splitCaption = { status: 'completed', output: [{ type: 'message', status: 'completed', content: [
    { type: 'output_text', text: '{"caption":"Wees goed ' },
    { type: 'output_text', text: 'voor je buren."}' },
  ] }] };
  const calls = upstream(t, true, truncatedAudio, { text: transcript }, splitCaption, true);
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: recoveredCaption, route: 'transcript' });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl, translationUrl, rpcUrl]);
});

test('a request cancelled after the direct call never starts a paid fallback', async t => {
  const controller = new AbortController();
  const incomplete = Response.json(truncatedAudio);
  t.mock.method(incomplete, 'json', async () => {
    controller.abort();
    return truncatedAudio;
  });
  const calls = upstream(t, true, incomplete);
  const response = await handler.fetch(new Request(request(), { signal: controller.signal }));
  assert.equal(response.status, 504);
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl]);
});

for (const stage of ['transcription', 'translation']) {
  test(`the shared deadline during ${stage} skips the clip and leaves the next request usable`, async t => {
    const firstDeadline = new AbortController();
    const nextDeadline = new AbortController();
    const deadlines = [firstDeadline, nextDeadline];
    t.mock.method(AbortSignal, 'timeout', () => deadlines.shift().signal);
    const expire = ({ signal }) => {
      firstDeadline.abort(new DOMException('Test deadline', 'TimeoutError'));
      signal.throwIfAborted();
    };
    const beforeExpiry = stage === 'translation' ? [{ text: transcript }] : [];
    const calls = upstream(t, true, ...beforeExpiry, expire, true, { text: transcript }, modelResult(recoveredCaption), true);
    const headers = { 'X-Khutbah-Route': 'transcript' };
    const response = await handler.fetch(request(wav(), headers));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { caption: '', skipped: 'incomplete', route: 'transcript', stage, reason: 'timeout' });
    const beforeRecovery = stage === 'translation' ? [rpcUrl, transcriptionUrl, translationUrl] : [rpcUrl, transcriptionUrl];
    assert.deepEqual(calls.map(call => call.url), beforeRecovery);
    const next = await handler.fetch(request(wav(), { ...headers, 'X-Khutbah-Sequence': '3' }));
    assert.equal(next.status, 200);
    assert.deepEqual(await next.json(), { caption: recoveredCaption, route: 'transcript' });
    assert.deepEqual(calls.slice(beforeRecovery.length).map(call => call.url), [rpcUrl, transcriptionUrl, translationUrl, rpcUrl]);
  });
}

test('caller cancellation during transcription is not reported as an expired server deadline', async t => {
  const caller = new AbortController();
  const deadline = new AbortController();
  t.mock.method(AbortSignal, 'timeout', () => deadline.signal);
  const cancel = ({ signal }) => {
    caller.abort();
    signal.throwIfAborted();
  };
  const calls = upstream(t, true, cancel);
  const input = request(wav(), { 'X-Khutbah-Route': 'transcript' });
  const response = await handler.fetch(new Request(input, { signal: caller.signal }));
  assert.equal(response.status, 504);
  assert.equal(deadline.signal.aborted, false);
  const body = await response.json();
  assert.equal(typeof body.error, 'string');
  assert.equal(body.skipped, undefined);
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, transcriptionUrl]);
});

test('recovery cannot publish a caption after its session stops', async t => {
  const calls = upstream(t, true, truncatedAudio, { text: transcript }, modelResult(recoveredCaption), false);
  const response = await handler.fetch(request());
  assert.equal(response.status, 409);
  assert.equal((await response.json()).caption, undefined);
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl, translationUrl, rpcUrl]);
});

for (const [reason, result] of [
  ['missing choice', { choices: [] }],
  ['missing caption', audioResult(null)],
  ['oversized caption', audioResult('a'.repeat(481))],
  ['unexpected metadata', audioResult('{"finish_reason":"stop"}')],
  ['metadata alongside a caption', audioResult(JSON.stringify({ caption: 'Ongeldig.', extra: true }))],
  ['unexpected tool output', { choices: [{ finish_reason: 'tool_calls', message: { content: 'Metadata' } }] }],
]) {
  test(`a direct answer with ${reason} is checked through transcription once`, async t => {
    const calls = upstream(t, true, result, { text: '', languages: [] });
    const response = await handler.fetch(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { caption: '', route: 'transcript' });
    assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl]);
  });
}

for (const [stage, reason, recovery] of [
  ['transcription', 'missing_text', [{ unrelated: true }]],
  ['translation', 'output_limit', [{ text: transcript }, {
    status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: modelResult('Deelzin').output,
  }]],
  ['translation', 'incomplete_output', [{ text: transcript }, { status: 'incomplete', output: [] }]],
  ['translation', 'invalid_output', [{ text: transcript }, {
    status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"caption":' }] }],
  }]],
]) {
  test(`recovery reports ${stage}/${reason} without a retry, publication or content disclosure`, async t => {
    const calls = upstream(t, true, truncatedAudio, ...recovery);
    const response = await handler.fetch(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { caption: '', skipped: 'incomplete', route: 'transcript', stage, reason });
    const expected = [rpcUrl, audioUrl, transcriptionUrl];
    if (stage === 'translation') expected.push(translationUrl);
    assert.deepEqual(calls.map(call => call.url), expected);
  });
}

test('a refusal on the transcript route does not trigger further attempts or a publication', async t => {
  const refusal = { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: '…' }] }] };
  const calls = upstream(t, true, truncatedAudio, { text: transcript }, refusal);
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: '', route: 'transcript' });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl, translationUrl]);
});

for (const [reason, result, status] of [
  ['rate limited', new Response(null, { status: 429 }), 429],
  ['provider timeout', new Response(null, { status: 503 }), 502],
]) {
  test(`${reason} results trigger neither a publication nor a second AI request`, async t => {
    const calls = upstream(t, true, result);
    assert.equal((await handler.fetch(request())).status, status);
    assert.equal(calls.length, 2);
  });
}

test('an unavailable audio model falls back and is retried after the cooldown', async t => {
  let now = Date.now();
  t.mock.method(Date, 'now', () => now);
  const missingModel = Response.json({ error: { code: 'model_not_found' } }, { status: 404 });
  const calls = upstream(t,
    true, missingModel, { text: transcript }, modelResult(recoveredCaption), true,
    true, { text: '…', languages: [] },
    true, audioResult(recoveredCaption), true,
  );
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption: recoveredCaption, route: 'transcript' });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, audioUrl, transcriptionUrl, translationUrl, rpcUrl]);
  assert.equal(calls[2].body.get('model'), 'gpt-transcribe');
  assert.equal(calls[2].body.get('languages[]'), 'ar');
  assert.equal(JSON.parse(calls[3].body).store, false);
  const skipped = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': '3' }));
  assert.deepEqual(await skipped.json(), { caption: '', route: 'transcript' });
  assert.deepEqual(calls.slice(5).map(call => call.url), [rpcUrl, transcriptionUrl]);
  now += 5 * 60_000 + 1;
  const recovered = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': '4' }));
  assert.deepEqual(await recovered.json(), { caption: recoveredCaption });
  assert.deepEqual(calls.slice(7).map(call => call.url), [rpcUrl, audioUrl, rpcUrl]);
});
