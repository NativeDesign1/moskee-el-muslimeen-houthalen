import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/khutbah-realtime.js';
import { DIRECT_TRANSLATION_INSTRUCTIONS } from '../lib/khutbah-caption.js';

const session = '875da112-af44-4444-b89d-6ff364304458';
const endpoint = 'https://moskee.invalid/api/khutbah-realtime';
const rpc = 'https://test.supabase.invalid/rest/v1/rpc/khutbah_control';
const callsApi = 'https://api.openai.com/v1/realtime/calls';
const offer = 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=setup:actpass\r\n';
const answer = offer.replace('actpass', 'active');

process.env.VITE_SUPABASE_URL = 'https://test.supabase.invalid';
process.env.VITE_SUPABASE_ANON_KEY = 'public-test';
process.env.OPENAI_API_KEY = 'server-key-test';

function request(body = offer, headers = {}, signal) {
  return new Request(endpoint, {
    method: 'POST', body, signal, duplex: 'half',
    headers: { Authorization: 'Bearer user-test', 'X-Khutbah-Session': session, 'Content-Type': 'application/sdp', ...headers },
  });
}

function upstream(t, lease, provider) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), ...options });
    const reply = String(url) === rpc ? lease : provider;
    assert.ok(reply, 'unexpected upstream request');
    return typeof reply === 'function' ? reply(options) : reply;
  });
  return calls;
}

test('the operator lease precedes a single server-side SDP exchange for Dutch text captions', async t => {
  const calls = upstream(t, Response.json(true), new Response(answer, { status: 201, headers: { Location: 'internal-call-url' } }));
  const response = await handler.fetch(request());
  assert.equal(response.status, 200);
  assert.equal(await response.text(), answer);
  assert.equal(response.headers.get('content-type'), 'application/sdp');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('location'), null);
  assert.deepEqual(calls.map(call => call.url), [rpc, callsApi]);
  assert.deepEqual(JSON.parse(calls[0].body), { p_action: 'heartbeat', p_session: session });
  assert.deepEqual(calls.map(call => call.headers.Authorization), ['Bearer user-test', 'Bearer server-key-test']);
  assert.equal(calls[0].headers.apikey, 'public-test');
  assert.equal(calls[1].signal, calls[0].signal);
  assert.deepEqual([...calls[1].body.keys()], ['sdp', 'session']);
  assert.equal(calls[1].body.get('sdp'), offer);
  const config = JSON.parse(calls[1].body.get('session'));
  assert.equal(config.type, 'realtime');
  assert.equal(config.model, 'gpt-realtime-2.1');
  assert.equal(config.instructions, DIRECT_TRANSLATION_INSTRUCTIONS);
  assert.match(config.instructions, /Darija naar natuurlijk Nederlands/);
  assert.match(config.instructions, /kind, source en caption/);
  assert.match(config.instructions, /quran, hadith, shahada en uncertain blijft caption leeg/);
  assert.deepEqual(config.output_modalities, ['text']);
  assert.equal(config.audio.input.turn_detection, null);
  assert.equal(config.reasoning.effort, 'minimal');
  assert.ok(config.max_output_tokens <= 480);
});

test('bad method, credentials, content type and size make no upstream calls', async t => {
  const calls = upstream(t);
  const large = 'x'.repeat(65537);
  for (const [input, status] of [
    [new Request(endpoint), 405], [request(offer, { Authorization: '' }), 401],
    [request(offer, { 'X-Khutbah-Session': 'wrong' }), 400], [request(offer, { 'Content-Type': 'text/plain' }), 415],
    [request(''), 400], [request('v=0\nm=audio 9\n'), 400], [request(large), 413],
    [request(offer, { 'Content-Length': String(large.length) }), 413],
  ]) {
    assert.equal((await handler.fetch(input)).status, status);
  }
  assert.equal(calls.length, 0);
});

for (const [title, lease, status] of [
  ['expired login', new Response(null, { status: 401 }), 401],
  ['non-operator', new Response(null, { status: 403 }), 403],
  ['expired lease or other operator', new Response(null, { status: 409 }), 409],
  ['rejected lease', Response.json(false), 409],
  ['unexpected lease result', Response.json({}), 502],
]) {
  test(`${title} cannot open a paid peer connection`, async t => {
    const calls = upstream(t, lease);
    assert.equal((await handler.fetch(request())).status, status);
    assert.deepEqual(calls.map(call => call.url), [rpc]);
  });
}

test('caller cancellation after the lease check prevents a paid connection', async t => {
  const controller = new AbortController();
  const calls = upstream(t, () => {
    controller.abort();
    return Response.json(true);
  });
  assert.equal((await handler.fetch(request(offer, {}, controller.signal))).status, 504);
  assert.deepEqual(calls.map(call => call.url), [rpc]);
});

test('a stalled offer read is cancelled at the setup deadline', async t => {
  const deadline = new AbortController();
  t.mock.method(AbortSignal, 'timeout', () => deadline.signal);
  const calls = upstream(t);
  let cancelled = false;
  const pending = handler.fetch(request(new ReadableStream({
    pull() { deadline.abort(new DOMException('timeout', 'TimeoutError')); },
    cancel() { cancelled = true; },
  })));
  assert.equal((await pending).status, 504);
  assert.equal(cancelled, true);
  assert.equal(calls.length, 0);
});

for (const [upstreamStatus, body, status] of [
  [401, 'secret', 503], [429, 'secret', 429], [500, 'secret', 502],
  [200, '{"unexpected":"secret"}', 502], [200, 'secret'.repeat(12000), 502],
]) {
  test(`unusable provider response (${upstreamStatus}, ${body.length} bytes) returns a generic error`, async t => {
    const calls = upstream(t, Response.json(true), new Response(body, { status: upstreamStatus }));
    const response = await handler.fetch(request());
    assert.equal(response.status, status);
    const result = await response.json();
    assert.equal(typeof result.error, 'string');
    assert.doesNotMatch(JSON.stringify(result), /secret|server-key-test|user-test/);
    assert.deepEqual(calls.map(call => call.url), [rpc, callsApi]);
  });
}
