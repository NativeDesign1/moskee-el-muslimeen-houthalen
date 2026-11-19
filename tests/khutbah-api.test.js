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

test('an authorized WAV fragment is transcribed and only the Dutch caption is published', async t => {
  const caption = 'Wees goed voor je buren.';
  const transcript = 'أحسنوا إلى جيرانكم';
  const calls = upstream(t, true, { text: transcript }, modelResult(caption), true);
  const audio = wav();
  const response = await handler.fetch(request(audio));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { caption });
  assert.deepEqual(calls.map(call => call.url), [rpcUrl, 'https://api.openai.com/v1/audio/transcriptions', 'https://api.openai.com/v1/responses', rpcUrl]);
  assert.deepEqual(calls.map(call => call.headers.Authorization), ['Bearer user-test', 'Bearer server-key-test', 'Bearer server-key-test', 'Bearer user-test']);
  assert.equal(calls[0].headers.apikey, 'public-test');
  assert.deepEqual(JSON.parse(calls[0].body), { p_action: 'claim', p_session: session, p_seq: 2 });
  assert.equal(calls[1].body.get('model'), 'gpt-transcribe');
  assert.equal(calls[1].body.get('languages[]'), 'ar');
  assert.deepEqual(Buffer.from(await calls[1].body.get('file').arrayBuffer()), audio);
  assert.equal(JSON.parse(calls[2].body).input, transcript);
  assert.equal(JSON.parse(calls[2].body).store, false);
  assert.deepEqual(JSON.parse(calls[3].body), { p_action: 'publish', p_session: session, p_seq: 2, p_caption: caption });
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
  ['silence', 0, []], ['empty transcript', 3000, [{ text: ' ' }]],
  ['undetected input language', 3000, [{ text: '…', languages: [] }]],
  ['unclear translation', 3000, [{ text: '…' }, modelResult('')]],
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
  const calls = upstream(t, true, { text: 'السلام' }, modelResult('Vrede.'), false);
  const result = await handler.fetch(request());
  assert.equal(result.status, 409);
  assert.equal(calls.length, 4);
  assert.equal((await result.json()).caption, undefined);
});

test('an incomplete AI response is never published', async t => {
  const calls = upstream(t, true, { text: 'السلام' }, { ...modelResult('Vrede.'), status: 'incomplete' });
  const result = await handler.fetch(request());
  assert.equal(result.status, 502);
  assert.equal(calls.length, 3);
});
