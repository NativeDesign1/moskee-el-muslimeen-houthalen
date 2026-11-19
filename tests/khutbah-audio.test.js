import assert from 'node:assert/strict';
import test from 'node:test';
import { joinKhutbahWav, khutbahWavDurationMs, speechSegments } from '../src/utils/khutbahAudio.js';

function recorder(sampleRate = 16000, options) {
  const clips = [];
  let time = 0;
  const record = speechSegments(sampleRate, wav => clips.push({ time, wav }), options);
  return {
    clips,
    feed(ms, level) {
      const frame = new Float32Array(sampleRate * 0.04).fill(level);
      for (let i = 0; i < ms; i += 40) {
        time += 40;
        record(frame, level);
      }
    },
  };
}

test('sustained speech produces complete four-second mono WAV files', async () => {
  for (const rate of [16000, 44100, 48000]) {
    const mic = recorder(rate);
    mic.feed(8000, 0.1);
    assert.deepEqual(mic.clips.map(clip => clip.time), [4000, 8000]);
    for (const { wav } of mic.clips) {
      const data = Buffer.from(await wav.arrayBuffer());
      assert.equal(wav.type, 'audio/wav');
      assert.equal(data.toString('ascii', 0, 4), 'RIFF');
      assert.equal(data.readUInt16LE(20), 1); // PCM
      assert.equal(data.readUInt16LE(22), 1); // mono
      assert.equal(data.readUInt32LE(24), 16000);
      assert.equal(data.readUInt16LE(34), 16);
      assert.equal(data.readUInt32LE(40), data.length - 44);
      assert.equal(data.length, 44 + 4 * 16000 * 2);
    }
  }
});

test('keeps brief hesitations together and ends a phrase at a natural pause', () => {
  const mic = recorder();
  mic.feed(1000, 0.12);
  mic.feed(160, 0);
  mic.feed(840, 0.12);
  mic.feed(240, 0);
  assert.equal(mic.clips.length, 0);
  mic.feed(40, 0);
  assert.deepEqual(mic.clips.map(clip => clip.time), [2280]);
});

test('joining queued WAVs keeps a single valid header and chronological PCM', async () => {
  const mic = recorder();
  mic.feed(4000, 0.1);
  mic.feed(4000, 0.2);
  const clips = mic.clips.map(clip => clip.wav);
  assert.equal(joinKhutbahWav([clips[0]]), clips[0]);
  const merged = joinKhutbahWav(clips);
  const bytes = Buffer.from(await merged.arrayBuffer());
  const parts = await Promise.all(clips.map(async clip => Buffer.from(await clip.slice(44).arrayBuffer())));
  assert.equal(merged.type, 'audio/wav');
  assert.equal(khutbahWavDurationMs(clips[0]), 4000);
  assert.equal(khutbahWavDurationMs(merged), 8000);
  assert.equal(bytes.toString('ascii', 8, 16), 'WAVEfmt ');
  assert.equal(bytes.readUInt32LE(4), bytes.length - 8);
  assert.equal(bytes.readUInt32LE(24), 16000);
  assert.equal(bytes.readUInt32LE(40), bytes.length - 44);
  assert.deepEqual(bytes.subarray(44), Buffer.concat(parts));
});

test('near the duration limit, a softer break splits continuous sound without losing frames', async () => {
  const mic = recorder();
  mic.feed(3000, 0.1);
  mic.feed(120, 0.017); // above the absolute speech floor
  mic.feed(4000, 0.2);
  assert.deepEqual(mic.clips.map(clip => clip.time), [3120, 7120]);

  const samples = [];
  for (const { wav } of mic.clips) {
    const bytes = Buffer.from(await wav.arrayBuffer());
    for (let offset = 44; offset < bytes.length; offset += 2) samples.push(bytes.readInt16LE(offset));
  }
  let offset = 0;
  for (const [ms, level] of [[3000, 0.1], [120, 0.017], [4000, 0.2]]) {
    const pcm = Math.round(Math.fround(level) * 32767);
    const length = 16000 * ms / 1000;
    assert.ok(samples.slice(offset, offset + length).every(value => value === pcm));
    offset += length;
  }
  assert.equal(samples.length, offset);
});

test('silence and a brief click produce no upload; a short phrase ends after a pause', () => {
  const mic = recorder();
  mic.feed(600, 0);
  mic.feed(80, 0.1);
  mic.feed(600, 0);
  assert.equal(mic.clips.length, 0);
  mic.feed(800, 0.1);
  mic.feed(520, 0);
  assert.equal(mic.clips.length, 1);
});

test('streaming bounds continuous audio without shortening a clip that started before connection', () => {
  let connected = false;
  let realtimeAtStart = false;
  let starts = 0;
  const mic = recorder(48000, {
    onStart: () => { starts++; realtimeAtStart = connected; },
    isRealtime: () => realtimeAtStart,
  });
  mic.feed(1000, 0.1);
  connected = true;
  mic.feed(3000 + 2800 + 2800, 0.1);
  assert.equal(starts, 3);
  assert.deepEqual(mic.clips.map(({ wav }) => khutbahWavDurationMs(wav)), [4000, 2800, 2800]);
});

test('idle audio and clicks clear the streaming buffer only between spoken clips', () => {
  const events = [];
  const mic = recorder(16000, {
    isRealtime: () => true,
    onStart: () => events.push('start'),
    onDiscard: () => events.push('clear'),
  });
  mic.feed(1200, 0);
  mic.feed(80, 0.1);
  mic.feed(520, 0);
  mic.feed(2400, 0.1);
  mic.feed(280, 0);
  assert.deepEqual(events, ['clear', 'start', 'clear', 'start']);
  assert.equal(mic.clips.length, 1);
});

test('a live phrase closes on a clear pause but keeps a brief hesitation and every spoken frame', async () => {
  const mic = recorder(16000, { isRealtime: () => true });
  mic.feed(480, 0.12);
  mic.feed(200, 0);
  mic.feed(480, 0.2);
  mic.feed(200, 0);
  assert.equal(mic.clips.length, 0);
  mic.feed(40, 0);
  assert.deepEqual(mic.clips.map(clip => clip.time), [1400]);
  assert.equal(khutbahWavDurationMs(mic.clips[0].wav), 1400);
  const [clip] = mic.clips;
  const data = Buffer.from(await clip.wav.arrayBuffer());
  assert.equal(data.readInt16LE(44), Math.round(0.12 * 32767));
  assert.equal(data.readInt16LE(44 + 32 * 680), Math.round(0.2 * 32767));
  assert.equal(data.readInt16LE(44 + 32 * 1160), 0);
});

test('a short live utterance waits through 360 ms of silence and closes at 400 ms', () => {
  const mic = recorder(16000, { isRealtime: () => true });
  mic.feed(400, 0.12);
  mic.feed(360, 0);
  assert.equal(mic.clips.length, 0);
  mic.feed(40, 0);
  assert.deepEqual(mic.clips.map(clip => clip.time), [800]);
});

test('source review keeps long recitation and soft voiced syllables together until a pause', () => {
  const mic = recorder(16000, { isSourceReading: () => true });
  mic.feed(3200, 0.12);
  mic.feed(200, 0.02);
  mic.feed(3680, 0.12);
  mic.feed(400, 0);
  assert.equal(mic.clips.length, 0);
  mic.feed(40, 0);
  mic.feed(12000, 0.12);
  assert.deepEqual(mic.clips.map(({ wav }) => khutbahWavDurationMs(wav)), [7520, 12000]);
});
