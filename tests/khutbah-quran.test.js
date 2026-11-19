import assert from 'node:assert/strict';
import test from 'node:test';
import { fingerprints } from '../lib/quran-fingerprints.js';
import { hasQuranExcerpt, quranCandidate, quranReference, quranVerseId } from '../lib/quran-index.js';
import { normalizeQuranArabic } from '../lib/quran-text.js';

const phrase = 'قل هو الله أحد';
const record = {
  id: '6222', sura: '112', aya: '1', arabic_text: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ',
  translation: 'Een ongewijzigde vertaling [1].', footnotes: '[1] Een bronnoot.',
};
const version = { translations: [{ key: 'dutch_center', version: '2.0.10' }] };
const credit = 'Koran 112:1 · Nederlands Islamitisch Centrum / Rowwad · QuranEnc.com v2.0.10';
const withheld = { caption: '', skipped: 'unverified' };
let run = 0;
async function fixture(t, row = record, edition = version) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url);
    assert.equal(options.redirect, 'error');
    assert.ok(url.startsWith('https://quranenc.com/api/v1/'));
    return Response.json(url.endsWith('translations/list/nl') ? edition : { result: row });
  });
  const { verifyQuranVerse } = await import('../lib/quran-verse.js?fixture=' + ++run);
  return { calls, verify: verifyQuranVerse };
}

test('looks up unique complete verses across all 114 surahs including equivalent written forms', () => {
  assert.equal(fingerprints.length, 114);
  assert.equal(fingerprints.flat().length, 6236);
  assert.equal(quranVerseId('114:6'), 6236);
  assert.equal(quranVerseId('0:1'), null);
  assert.equal(quranVerseId('1:8'), null);
  assert.equal(quranReference('قُلْ هُوَ اللَّهُ أَحَدٌ.'), '112:1');
  assert.equal(quranReference('ذلك الكتاب لا ريب فيه هدى للمتقين'), '2:2');
  assert.equal(quranReference('مَٰلِكِ يَوۡمِ ٱلدِّينِ'), '1:4');
  assert.equal(quranReference('مالك يوم الدين'), '1:4');
  assert.equal(quranReference('مَلِكِ يَوْمِ الدِّينِ'), null);
  assert.notEqual(normalizeQuranArabic('مالِك'), normalizeQuranArabic('مَلِك'));
  assert.notEqual(normalizeQuranArabic('لا إله'), normalizeQuranArabic('إله'));
});

test('duplicate verses and possible partial quotations can only hold captions', () => {
  assert.equal(quranCandidate('فبأي آلاء ربكما تكذبان'), false);
  assert.equal(quranReference('فبأي آلاء ربكما تكذبان'), null);
  assert.equal(quranReference('إن الصلاة تنهى عن الفحشاء'), null);
  assert.equal(hasQuranExcerpt('إن الصلاة تنهى عن الفحشاء'), true);
  assert.equal(hasQuranExcerpt('والعصر إن الإنسان لفي'), true); // cross-verse
  assert.equal(hasQuranExcerpt('اليوم غادي نتكلمو على نظافة الحومة'), false);
  assert.equal(quranReference('explanation ' + phrase), null);
});

test('verifies exact Arabic, version and intact notes, and checks input again on cache hits', async t => {
  const { verify, calls } = await fixture(t);
  const result = await verify(phrase, '112:1');
  assert.deepEqual(result, { caption: [record.translation, record.footnotes, credit].join('\n'), verified: true });
  assert.equal(calls.length, 2);
  assert.deepEqual(await verify('قُلْ هو الله أحد', '112:1'), result);
  assert.deepEqual(await verify('قِلْ هو الله أحد', '112:1'), withheld);
  assert.deepEqual(await verify(phrase, '112:2'), withheld);
  assert.deepEqual(await verify('فبأي آلاء ربكما تكذبان', '55:13'), withheld);
  assert.equal(calls.length, 2);
});

test('checks an additional model hearing against the original, even when STT supplied no vowels', async t => {
  const { verify } = await fixture(t);
  for (const witness of ['قِلْ هو الله أحد', 'الله أحد', '', null]) {
    assert.deepEqual(await verify(phrase, '112:1', undefined, { witness, includeArabic: true }), withheld);
  }
  const result = await verify(phrase, '112:1', undefined, { witness: 'قُلْ هو الله أحد', includeArabic: true });
  assert.equal(result.verified, true);
  assert.equal(result.referenceArabic, record.arabic_text);
  assert.equal(result.caption.includes(record.arabic_text), false);
  assert.equal((await verify(phrase, '112:1', undefined, { witness: phrase })).referenceArabic, undefined);
});

for (const [reason, row, metadata] of [
  ['a wrong Arabic source', { ...record, arabic_text: 'هذه عبارة أخرى' }, version],
  ['mismatched reference', { ...record, aya: '2' }, version],
  ['mismatched verse id', { ...record, id: '1' }, version],
  ['missing footnote metadata', { ...record, footnotes: null }, version],
  ['absent translation', { ...record, translation: '  ' }, version],
  ['source and attribution exceed TV capacity', { ...record, translation: 'x'.repeat(430) }, version],
  ['unconfirmed edition', record, { translations: [] }],
]) test('withholds a verse on ' + reason, async t => {
  const { verify } = await fixture(t, row, metadata);
  assert.deepEqual(await verify(phrase, '112:1'), withheld);
});

for (const [translation, accepted] of [
  ['Allah, er is geen andere god dan Hij.', false],
  ['Allah! Niemand heeft het recht om aanbeden te worden behalve Hij.', true],
  ['Er is niemand die het recht heeft op aanbidding behalve Allah.', true],
]) test('preserves the requested meaning of tawhid in the publisher translation: ' + accepted, async t => {
  const source = 'الله لا إله إلا هو الحي القيوم';
  const { verify } = await fixture(t, { id: '295', sura: '3', aya: '2', arabic_text: source, translation, footnotes: '' });
  const result = await verify(source, '3:2');
  if (accepted) assert.equal(result.caption.split('\n')[0], translation);
  else assert.deepEqual(result, withheld);
});

test('on outage, timeout or cancellation the publisher check withholds', async t => {
  const { verifyQuranVerse } = await import('../lib/quran-verse.js?fixture=' + ++run);
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('Timeout', 'TimeoutError'); });
  assert.deepEqual(await verifyQuranVerse(phrase, '112:1'), withheld);
  mock.mock.resetCalls();
  assert.deepEqual(await verifyQuranVerse(phrase, '112:1', AbortSignal.abort()), withheld);
  assert.equal(mock.mock.callCount(), 0);
});
