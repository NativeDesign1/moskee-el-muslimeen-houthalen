import test from 'node:test';
import assert from 'node:assert/strict';
import { guardKhutbahCaption, checkKhutbahSource } from '../lib/khutbah-guard.js';
import { KHUTBAH_OUTPUT_SCHEMA, parseKhutbahOutput } from '../lib/khutbah-caption.js';

const held = { caption: '', skipped: 'unverified' };
const auto = (source, caption = 'Een verkeerde modelvertaling.', kind = 'speech') => guardKhutbahCaption({ source, caption, kind });

test('the spoken portions of the shahada determine the exact fixed Dutch text', () => {
  for (const [source, expected] of [
    ['لَا إِلَٰهَ إِلَّا ٱللَّهُ', 'Niemand heeft het recht om aanbeden te worden behalve Allah.'],
    ['أشهد أن لا إله إلا الله', 'Ik getuig dat niemand het recht heeft om aanbeden te worden behalve Allah.'],
    ['أشهد ألا إله إلا الله وأشهد أن محمدًا رسول الله', 'Ik getuig dat niemand het recht heeft om aanbeden te worden behalve Allah, en ik getuig dat Mohammed de boodschapper van Allah is.'],
    ['لا إله إلا الله محمد رسول الله', 'Niemand heeft het recht om aanbeden te worden behalve Allah. Mohammed is de boodschapper van Allah.'],
    ['وأشهد أن محمدا عبده ورسوله', 'En ik getuig dat Mohammed Zijn dienaar en Zijn boodschapper is.'],
    ['لا إله إلا الله وحده لا شريك له', 'Niemand heeft het recht om aanbeden te worden behalve Allah, Hij alleen, zonder deelgenoot.'],
  ]) {
    for (const kind of ['shahada', 'speech']) {
      const answer = auto(source, 'Er is geen andere god.', kind);
      assert.deepEqual(answer, { caption: expected, verified: true });
      assert.deepEqual(checkKhutbahSource(source, 'sources'), answer);
    }
  }
});

test('fixed Al-Fātiḥah meaning preserves the reading, script and actual words of the verse', () => {
  for (const [source, expected] of [
    ['مَـٰلِكِ يَوْمِ ٱلدِّينِ', 'Meester van de Dag van de Vergelding. (Al-Fātiḥah 1:4)'],
    ['مالك يوم الدين', 'Meester van de Dag van de Vergelding. (Al-Fātiḥah 1:4)'],
    ['مَلِكِ يَوْمِ الدِّينِ', 'Koning van de Dag van de Vergelding. (Al-Fātiḥah 1:4)'],
    ['إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'U alleen aanbidden wij en U alleen vragen wij om hulp. (Al-Fātiḥah 1:5)'],
  ]) {
    assert.deepEqual(auto(source, 'Iets anders.', 'quran'), { caption: expected, verified: true });
  }
  for (const source of ['ملك يوم الدين', 'مُلْكِ يوم الدين', 'مالك يوم', 'مَلِكِ يَوْمِ الدِّينِ؟',
    'أهدنا الصراط المستقيم', 'إياكِ نعبد وإياك نستعين', 'صراط الذين أَنْعَمْتُ عليهم غير المغضوب عليهم ولا الضالين']) {
    assert.deepEqual(auto(source), held, source);
    assert.deepEqual(checkKhutbahSource(source), held);
  }
});

test('all seven catalog verses match common Uthmani spelling', () => {
  const verses = [
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
    'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
  ];
  for (const [index, verse] of verses.entries()) {
    const answer = checkKhutbahSource(verse);
    assert.equal(answer?.verified, true, verse);
    assert.ok(answer.caption.includes('Al-Fātiḥah 1:' + (index + 1)));
  }
});

test('a complete hadith excerpt uses a pinned rendering and collection', () => {
  for (const [arabic, dutch] of [
    ['مَنْ غَشَّنَا فَلَيْسَ مِنَّا', 'Wie ons bedriegt, hoort niet bij ons. (Ṣaḥīḥ Muslim 101, fragment)'],
    ['الدِّينُ النَّصِيحَةُ', 'De godsdienst is oprechtheid. (Ṣaḥīḥ Muslim 55a, fragment)'],
  ]) {
    assert.deepEqual(auto(arabic, 'Spreuken 9:99', 'hadith'), { caption: dutch, verified: true });
    assert.deepEqual(auto(arabic, 'irrelevant', 'quran'), held);
    assert.deepEqual(auto(arabic, '', 'uncertain'), held);
  }
});

test('holds unsupported, ambiguous, negated or mixed quotations, even when labelled ordinary', () => {
  for (const source of ['الحمد لله', 'غشنا', 'اليوم نتكلم عن مالك يوم الدين يا إخوتي', 'إله إلا الله', 'لا إله إلا',
    'لا إله سوى الله', 'لم يقل أشهد أن لا إله إلا الله', 'قال رسول الله الطهور شطر الإيمان', 'إياك نعبد ولا نستعين',
    'لم يقل الدين النصيحة', 'عن أبي هريرة رضي الله عنه', 'أخبرنا سفيان بهذا', 'من غشنا فهو منا', 'الرحمن الرحيم تفسير', 'بسم الله الرحمن الرحيم ٣:٨',
    'صحيح blah', 'لا إله إلا الله؟', 'Heerser van de Dag des Oordeels']) {
    assert.deepEqual(auto(source), held, source);
  }
  for (const kind of ['quran', 'hadith', 'shahada', 'uncertain']) assert.deepEqual(auto('اليوم نفتح الباب', 'Vandaag openen we de deur.', kind), held);
  for (const caption of ['De Profeet zei dat jullie moeten doorgaan.', 'Koran 37:6', 'Volgens de hadith…', 'Er is geen andere god.',
    'De Profeet (vrede zij met hem) heeft gezegd dat je moet wachten.', 'Heerser van de Dag des Oordeels.', '[GEEN_ONDERTITEL]', '{"caption":"ok"}']) {
    assert.deepEqual(auto('اليوم نفتح الباب', caption), held, caption);
  }
});

test('ordinary speech is automatic only in auto mode; a known source may pass either mode', () => {
  const source = 'اليوم غادي نهضرو على الجيران';
  const caption = 'Vandaag praten we over onze buren.';
  assert.equal(checkKhutbahSource(source), null);
  assert.deepEqual(guardKhutbahCaption({ kind: 'speech', source, caption }), { caption });
  assert.deepEqual(guardKhutbahCaption({ kind: 'speech', source, caption }, 'sources'), held);
  assert.deepEqual(checkKhutbahSource(source, 'sources'), held);
  assert.deepEqual(checkKhutbahSource('الدين النصيحة', 'typo'), held);
});

test('invalid source or schema cannot produce display text', () => {
  for (const value of [null, {}, { kind: 'speech', source: '', caption: 'Vrede.' },
    { kind: 'speech', source: 'السلام', caption: null }, { kind: 'sources', source: 'السلام', caption: 'Vrede.' },
    { kind: 'silence', source: 'مالك يوم الدين', caption: '' }]) assert.deepEqual(guardKhutbahCaption(value), held);
  assert.deepEqual(guardKhutbahCaption({ kind: 'silence', source: '', caption: '' }), { caption: '' });
});

test('a whole verse outside the local catalog becomes a lookup request, never its own authority', () => {
  const source = 'قل هو الله أحد';
  const lookup = { caption: '', skipped: 'unverified', quran: '112:1' };
  assert.deepEqual(auto(source, 'Een verzonnen zin met een fout nummer.', 'quran'), lookup);
  assert.deepEqual(auto(source, 'Het model miste het citaat.', 'speech'), lookup);
  assert.deepEqual(checkKhutbahSource(source, 'sources'), lookup);
  assert.deepEqual(auto(source, 'Een verzonnen hadith.', 'hadith'), held);
  assert.deepEqual(auto('إن الصلاة تنهى عن الفحشاء', 'Een onvolledig citaat.', 'speech'), held);
  assert.deepEqual(auto('فبأي آلاء ربكما تكذبان', 'Deze regel komt meermaals voor.', 'speech'), held);
});

test('an audible unfinished ordinary clause requests context, including the standalone subtitle reported on TV', () => {
  const needsContext = { caption: '', skipped: 'needs_context' };
  const source = 'واللي كيشوف هاد المنظر'; // Illustrative speech for the test.
  assert.ok(KHUTBAH_OUTPUT_SCHEMA.properties.kind.enum.includes('continuation'));
  const value = { source, kind: 'continuation', caption: '' };
  assert.deepEqual(parseKhutbahOutput(JSON.stringify(value)), needsContext);
  assert.deepEqual(parseKhutbahOutput(JSON.stringify(value), 'auto', 'مشى للدار'), held);
  for (const caption of ['En wie naar deze landelijkheid kijkt.', 'Wie naar de oude akkers kijkt', 'Maar wie op de bus wacht…']) {
    assert.deepEqual(auto(source, caption), needsContext, caption);
  }
});

test('preserves completed clauses, genuine questions and valid uses of the same words', () => {
  const source = 'غادي نهضرو على الموضوع';
  for (const caption of ['Wie kijkt naar de natuur?', 'Wie goed luistert begrijpt de uitleg.',
    'En wie naar de akkers kijkt, ziet de eerste bloemen.', 'Wie naar buiten kijkt ziet de regen.',
    'De landelijkheid van deze streek spreekt hem aan.', 'En wij kijken naar deze landelijkheid.']) {
    assert.deepEqual(auto(source, caption), { caption }, caption);
  }
});

test('a continuation cannot override source checks or recover uncertain content as ordinary speech', () => {
  for (const source of ['قل هو الله أحد', 'لا إله إلا الله', 'قال رسول الله', 'الحمد لله', 'een gok', '']) {
    assert.deepEqual(auto(source, '', 'continuation'), held, source);
  }
  const source = 'واللي كيشوف هاد المنظر';
  assert.deepEqual(auto(source, 'De profeet zei dat', 'continuation'), held);
  assert.deepEqual(auto(source, '', 'uncertain'), held);
  assert.deepEqual(guardKhutbahCaption({ source, kind: 'continuation', caption: '' }, 'sources'), held);
});

test('returns the heard Arabic only when requested for an accepted ordinary caption', () => {
  const source = 'الْيَوْم نعاون الجيران';
  const transcript = 'اليوم نعاون الجيران';
  const caption = 'Vandaag helpen we onze buren.';
  const value = { kind: 'speech', caption, source };
  const wire = JSON.stringify(value);
  assert.deepEqual(parseKhutbahOutput(wire), { caption });
  assert.deepEqual(parseKhutbahOutput(wire, 'auto', undefined, true, true), { caption, heard: source });
  assert.deepEqual(parseKhutbahOutput(wire, 'auto', transcript, true, true), { caption, heard: transcript });
  assert.deepEqual(parseKhutbahOutput(JSON.stringify({ ...value, kind: 'uncertain' }), 'auto', undefined, true, true), held);
  assert.deepEqual(parseKhutbahOutput(JSON.stringify({ ...value, kind: 'continuation', caption: '' }), 'auto', undefined, true, true),
    { caption: '', skipped: 'needs_context' });
});
