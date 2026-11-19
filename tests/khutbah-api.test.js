import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/khutbah.js';

const session = '875da112-af44-4444-b89d-6ff364304458';
const rpcUrl = 'https://test.supabase.invalid/rest/v1/rpc/khutbah_control';
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
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, 'https://api.openai.com/v1/chat/completions', rpcUrl]);
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

test('an incomplete clip does not publish partial output and the next clip can publish', async t => {
  const truncated = { choices: [{ finish_reason: 'length', message: { content: 'Dit is slechts een' } }] };
  const calls = upstream(t, true, truncated, true, audioResult('Heb geduld.'), true);
  const first = await handler.fetch(request());
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { caption: '', skipped: 'incomplete' });
  assert.equal(calls.length, 2);
  const next = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': '3' }));
  assert.equal(next.status, 200);
  assert.deepEqual(await next.json(), { caption: 'Heb geduld.' });
  assert.deepEqual(JSON.parse(calls.at(-1).body), { p_action: 'publish', p_session: session, p_seq: 3, p_caption: 'Heb geduld.' });
});

for (const [reason, result] of [
  ['missing choice', { choices: [] }],
  ['missing caption', audioResult(null)],
  ['oversized caption', audioResult('a'.repeat(481))],
  ['unexpected metadata', audioResult('{"finish_reason":"stop"}')],
  ['unexpected tool output', { choices: [{ finish_reason: 'tool_calls', message: { content: 'Metadata' } }] }],
]) {
  test(`skips ${reason} without a retry or publication`, async t => {
    const calls = upstream(t, true, result);
    const response = await handler.fetch(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { caption: '', skipped: 'incomplete' });
    assert.equal(calls.length, 2);
  });
}

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
  const caption = 'Wees goed voor je buren.';
  const transcript = 'أحسنوا إلى جيرانكم';
  const missingModel = Response.json({ error: { code: 'model_not_found' } }, { status: 404 });
  const calls = upstream(t,
    true, missingModel, { text: transcript }, modelResult(caption), true,
    true, { text: '', languages: [] },
    true, { text: '…', languages: [] },
    true, { text: transcript }, { status: 'incomplete', output: modelResult('Gedeeltelijk.').output },
    true, { text: transcript }, { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{' }] }] },
    true, audioResult(caption), true,
  );
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { caption });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, 'https://api.openai.com/v1/chat/completions',
    'https://api.openai.com/v1/audio/transcriptions', 'https://api.openai.com/v1/responses', rpcUrl]);
  assert.equal(calls[2].body.get('model'), 'gpt-transcribe');
  assert.equal(calls[2].body.get('languages[]'), 'ar');
  assert.deepEqual(Buffer.from(await calls[2].body.get('file').arrayBuffer()), wav());
  assert.equal(JSON.parse(calls[3].body).input, transcript);
  assert.equal(JSON.parse(calls[3].body).store, false);
  for (const sequence of ['3', '4']) {
    const skipped = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': sequence }));
    assert.deepEqual(await skipped.json(), { caption: '' });
  }
  assert.deepEqual(calls.slice(5).map(call => call.url), [rpcUrl, 'https://api.openai.com/v1/audio/transcriptions',
    rpcUrl, 'https://api.openai.com/v1/audio/transcriptions']);
  for (const sequence of ['5', '6']) {
    const skipped = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': sequence }));
    assert.equal(skipped.status, 200);
    assert.deepEqual(await skipped.json(), { caption: '', skipped: 'incomplete' });
  }
  assert.equal(calls.length, 15);
  now += 5 * 60_000 + 1;
  const recovered = await handler.fetch(request(wav(), { 'X-Khutbah-Sequence': '7' }));
  assert.deepEqual(await recovered.json(), { caption });
  assert.deepEqual(calls.slice(15).map(call => call.url), [rpcUrl, 'https://api.openai.com/v1/chat/completions', rpcUrl]);
});
