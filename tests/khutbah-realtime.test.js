import assert from 'node:assert/strict';
import test from 'node:test';
import { openKhutbahRealtime } from '../src/utils/khutbahRealtime.js';

const session = { audio: { input: { turn_detection: null } }, output_modalities: ['text'] };

class FakeChannel extends EventTarget {
  readyState = 'connecting';
  sent = [];
  open() {
    this.readyState = 'open';
    this.dispatchEvent(new Event('open'));
  }
  receive(event) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(event) }));
  }
  send(text) {
    assert.equal(this.readyState, 'open');
    this.sent.push(JSON.parse(text));
  }
  close() {
    this.readyState = 'closed';
    this.dispatchEvent(new Event('close'));
  }
}

class FakePeer extends EventTarget {
  channel = new FakeChannel();
  connectionState = 'new';
  addTrack(track, stream) { this.track = track; this.stream = stream; }
  createDataChannel(name) { assert.equal(name, 'oai-events'); return this.channel; }
  async createOffer() { return { type: 'offer', sdp: 'offer-sdp' }; }
  async setLocalDescription(offer) { this.localDescription = offer; }
  async setRemoteDescription(answer) { this.remoteDescription = answer; }
  close() { this.connectionState = 'closed'; }
}

function start(t, options = {}) {
  const oldPeer = globalThis.RTCPeerConnection;
  let peer;
  globalThis.RTCPeerConnection = class extends FakePeer {
    constructor() { super(); peer = this; }
  };
  t.after(() => {
    if (oldPeer) globalThis.RTCPeerConnection = oldPeer;
    else delete globalThis.RTCPeerConnection;
  });
  const controller = new AbortController();
  t.after(() => controller.abort());
  const track = { readyState: 'live', stop: t.mock.fn() };
  const stream = { getAudioTracks: () => [track] };
  const onDisconnect = t.mock.fn();
  const ready = openKhutbahRealtime({
    stream, signal: controller.signal, onDisconnect,
    exchangeSdp: async (offer, signal) => {
      assert.equal(offer, 'offer-sdp');
      assert.ok(!signal.aborted);
      return 'answer-sdp';
    }, ...options,
  });
  return { controller, track, ready, peer, stream, channel: peer.channel, onDisconnect };
}

async function connect(t) {
  const setup = start(t);
  setup.channel.open();
  setup.channel.receive({ type: 'session.created', session });
  return { ...setup, client: await setup.ready };
}

function done(channel, clip, text, overrides = {}) {
  channel.receive({ type: 'response.done', response: {
    status: 'completed', metadata: { clip },
    output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text }] }],
    ...overrides,
  } });
}

test('negotiates with the shared track and waits for the configured manual, text-only session', async t => {
  const { ready, peer, channel, track, stream, onDisconnect } = start(t);
  let opened = false;
  void ready.then(() => { opened = true; });
  channel.open();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(opened, false);
  assert.deepEqual(peer.remoteDescription, { type: 'answer', sdp: 'answer-sdp' });
  channel.receive({ type: 'session.created', session });
  const client = await ready;
  assert.equal(peer.track, track);
  assert.equal(peer.stream, stream);
  assert.deepEqual(channel.sent, [{ type: 'input_audio_buffer.clear' }]);
  client.close();
  assert.equal(client.active, false);
  assert.equal(onDisconnect.mock.callCount(), 0);
  assert.equal(track.stop.mock.callCount(), 0);
});

test('references each committed audio item explicitly and matches out-of-order final captions', async t => {
  const { channel, client } = await connect(t);
  const first = client.commit();
  const second = client.commit();
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'first-audio' });
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'second-audio' });
  const responses = channel.sent.filter(event => event.type === 'response.create').map(event => event.response);
  assert.deepEqual(responses, ['first-audio', 'second-audio'].map((id, index) => ({
    conversation: 'none', metadata: { clip: String(index + 1) },
    output_modalities: ['text'], input: [{ type: 'item_reference', id }],
  })));
  channel.receive({ type: 'response.output_text.done', text: 'Afgebroken zin' });
  done(channel, 'unknown', 'Ander antwoord');
  done(channel, '2', 'Tweede ondertitel');
  assert.equal(await second, 'Tweede ondertitel');
  done(channel, '1', '  Eerste ondertitel ');
  assert.equal(await first, 'Eerste ondertitel');
  assert.deepEqual(channel.sent.filter(event => event.type === 'conversation.item.delete').map(event => event.item_id),
    ['second-audio', 'first-audio']);
});

test('only emits complete subtitles and preserves refusal and silence', async t => {
  const cases = [
    ['silence', '[GEEN_ONDERTITEL]', {}, ''],
    ['content filter', 'Onveilige inhoud', { status: 'incomplete', status_details: { reason: 'content_filter' } }, ''],
    ['refusal', 'Niet publiceren', { output: [{ type: 'message', role: 'assistant', content: [{ type: 'refusal' }] }] }, ''],
    ['incomplete', 'Nog niet klaar', { status: 'incomplete' }, null],
    ['missing message', 'Onvolledig', { output: [] }, null],
    ['structured output', '{"caption":"Ongeldig"}', {}, null],
    ['blank text', ' ', {}, null],
    ['overlong text', 'Een te lange zin.'.repeat(40), {}, null],
  ];
  for (const [label, text, overrides, expected] of cases) {
    await t.test(label, async t => {
      const { channel, client } = await connect(t);
      const result = client.commit();
      channel.receive({ type: 'input_audio_buffer.committed', item_id: 'item' });
      done(channel, '1', text, overrides);
      assert.equal(await result, expected);
      client.close();
    });
  }
});

test('drops excess commits cleanly and does not shift acknowledgment order', async t => {
  const { channel, client } = await connect(t);
  const clips = [client.commit(), client.commit(), client.commit()];
  assert.equal(await client.commit(), null);
  assert.equal(channel.sent.at(-1).type, 'input_audio_buffer.clear');
  assert.equal(channel.sent.filter(e => e.type === 'input_audio_buffer.commit').length, 3);
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'original' });
  done(channel, '1', 'Eerste zin.');
  assert.equal(await clips[0], 'Eerste zin.');
  client.close();
  assert.deepEqual(await Promise.all(clips.slice(1)), [null, null]);
});

test('a missing acknowledgment releases all clips to the WAV fallback', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { channel, client, track, onDisconnect } = await connect(t);
  const first = client.commit();
  const second = client.commit();
  t.mock.timers.tick(4000);
  assert.deepEqual(await Promise.all([first, second]), [null, null]);
  assert.equal(await client.commit(), null);
  assert.equal(client.active, false);
  assert.equal(onDisconnect.mock.callCount(), 1);
  assert.equal(track.stop.mock.callCount(), 0);
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'late' });
  assert.ok(!channel.sent.some(e => e.type === 'response.create'));
});

test('provider error falls back without stopping the local microphone', async t => {
  const { channel, client, track, onDisconnect } = await connect(t);
  const clip = client.commit();
  channel.receive({ type: 'error', error: { code: 'rate_limit_exceeded' } });
  assert.equal(await clip, null);
  assert.equal(client.active, false);
  assert.equal(track.stop.mock.callCount(), 0);
  assert.equal(onDisconnect.mock.callCount(), 1);
});

test('operator stop cancels a pending negotiation and does not reopen the peer', async t => {
  let finish;
  let exchangeSignal;
  const { ready, controller, peer, track, onDisconnect } = start(t, { exchangeSdp: (_, signal) => {
    exchangeSignal = signal;
    return new Promise(resolve => { finish = resolve; });
  } });
  await new Promise(resolve => setImmediate(resolve));
  controller.abort();
  await assert.rejects(ready);
  assert.ok(exchangeSignal.aborted);
  finish('late answer');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(peer.remoteDescription, undefined);
  assert.equal(peer.connectionState, 'closed');
  assert.equal(onDisconnect.mock.callCount(), 0);
  assert.equal(track.stop.mock.callCount(), 0);
});

test('does not send a clip to a session with automatic turn detection', async t => {
  const { ready, channel, peer } = start(t);
  channel.open();
  channel.receive({ type: 'session.created', session: { ...session, audio: { input: { turn_detection: { type: 'server_vad' } } } } });
  await assert.rejects(ready);
  assert.equal(peer.connectionState, 'closed');
  assert.equal(channel.sent.length, 0);
});

test('one slow acknowledged response falls back independently and its late caption is ignored', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { channel, client, onDisconnect } = await connect(t);
  const first = client.commit();
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'slow' });
  channel.receive({ type: 'response.created', response: { id: 'response-slow', metadata: { clip: '1' } } });
  t.mock.timers.tick(3000);
  const second = client.commit();
  channel.receive({ type: 'input_audio_buffer.committed', item_id: 'fast' });
  t.mock.timers.tick(1000);
  assert.equal(await first, null);
  const cancel = channel.sent.find(event => event.type === 'response.cancel');
  assert.equal(cancel.response_id, 'response-slow');
  channel.receive({ type: 'error', error: { event_id: cancel.event_id, code: 'response_cancel_not_active' } });
  done(channel, '1', 'Verouderde ondertitel.');
  done(channel, '2', 'Tweede ondertitel.');
  assert.equal(await second, 'Tweede ondertitel.');
  assert.equal(client.active, true);
  assert.equal(onDisconnect.mock.callCount(), 0);
});

test('reads one assistant caption alongside reasoning metadata and rejects additional output', async t => {
  const { channel, client } = await connect(t);
  const message = { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'De zin.' }] };
  for (const [i, [extra, expected]] of [[{ type: 'reasoning' }, 'De zin.'], [message, null], [{ type: 'function_call' }, null]].entries()) {
    const request = client.commit();
    channel.receive({ type: 'input_audio_buffer.committed', item_id: 'audio-' + i });
    done(channel, String(i + 1), null, { output: [extra, message] });
    assert.equal(await request, expected);
  }
});

test('repeated unusable responses release the stream instead of paying for two models on every clip', async t => {
  const { channel, client, onDisconnect } = await connect(t);
  for (let i = 1; i <= 3; i++) {
    const clip = client.commit();
    channel.receive({ type: 'input_audio_buffer.committed', item_id: 'bad-' + i });
    done(channel, String(i), '', { status: 'failed' });
    assert.equal(await clip, null);
  }
  assert.equal(client.active, false);
  assert.equal(onDisconnect.mock.callCount(), 1);
});

test('uses the authenticated SDP configuration when the session echo omits optional fields', async t => {
  const { ready, channel } = start(t);
  channel.open();
  channel.receive({ type: 'session.created', session: { id: 'session-test', type: 'realtime' } });
  const client = await ready;
  assert.equal(client.active, true);
  client.close();
});

test('rejects an explicitly conflicting audio output modality', async t => {
  const { ready, channel, peer } = start(t);
  channel.open();
  channel.receive({ type: 'session.created', session: { output_modalities: ['audio'] } });
  await assert.rejects(ready);
  assert.equal(peer.connectionState, 'closed');
});
