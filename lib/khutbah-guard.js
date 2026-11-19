import { hasQuranExcerpt, quranCandidate } from './quran-index.js';

// Exact Arabic excerpts are paired with our Dutch renderings of their meaning.
// Both the browser and the server use this catalog. Model-generated references never reach the TV.
const entries = new Map();
const partials = new Set();
const individualWords = new Set();

export function normalizeKhutbahSource(text) {
  if (typeof text !== 'string') return '';
  return text.normalize('NFKC')
    // In the verse below the small alif distinguishes Mālik from Malik. It is
    // also written in words such as ṣirāṭ, but omitted in modern spelling of ar-Raḥmān.
    .replace(/\u0640/g, '').replace(/\u0670/g, 'ا')
    .replace(/[\u0610-\u061a\u064b-\u065f\u06d6-\u06ed]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/الرحمان/g, 'الرحمن').replace(/للاه/g, 'لله').replace(/الاه/g, 'اله')
    .replace(/[.,،؛;:!«»“”"'()\[\]﴿﴾]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Preserve explicit vowels for the final local match. A transcriber commonly
// omits them, but a written first-person verb must not become a second-person one.
function writtenWords(text) {
  return text.normalize('NFKC').replace(/[\u0640\u0610-\u061a\u06d6-\u06ed]/gu, '')
    .replace(/ٱ/gu, 'ا').replace(/\u0670/gu, 'ا').match(/[\p{Script=Arabic}\u064b-\u065f]+/gu) || [];
}

function consistentWithEntry(source, entry) {
  const words = writtenWords(source);
  if (words.length !== entry.words.length) return false;
  return words.every((word, index) => {
    const letters = word.match(/[\p{L}][^\p{L}]*/gu) || [];
    const template = entry.words[index].match(/[\p{L}][^\p{L}]*/gu) || [];
    // Orthographic variants such as the dagger alif in ar-Raḥmān have already
    // passed the whole-source key check. Compare vowels only at aligned letters.
    if (letters.length !== template.length) return true;
    return letters.every((letter, i) => {
      const expected = template[i];
      if (/[أإ]/u.test(letter[0]) && letter[0] !== expected[0]) return false;
      const vowel = letter.match(/[َُِ]/u)?.[0];
      const expectedVowel = expected.match(/[َُِ]/u)?.[0];
      return !vowel || !expectedVowel || vowel === expectedVowel;
    });
  });
}

function register(kind, arabic, caption) {
  const source = normalizeKhutbahSource(arabic);
  entries.set(source, { kind, caption, words: writtenWords(arabic) });
  const words = source.split(' ');
  for (const word of words) individualWords.add(word);
  for (let i = 0; i < words.length - 1; i++) partials.add(words.slice(i, i + 2).join(' '));
}

// Al-Fātiḥah, numbered according to the muṣḥaf shown at https://quran.com/1.
// 1:4 has two readings: https://quran.com/nl/de-opening/4/qiraat . Apply this numbering
// consistently rather than inferring the reciter's system of verse numbers.
const fatiha = [
  [1, 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', 'In de naam van Allah, de Erbarmer, de Barmhartige.'],
  [2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'Alle lof komt Allah toe, de Heer van de werelden.'],
  [3, 'الرَّحْمَنِ الرَّحِيمِ', 'De Erbarmer, de Barmhartige.'],
  [4, 'مَالِكِ يَوْمِ الدِّينِ', 'Meester van de Dag van de Vergelding.'],
  [4, 'مَلِكِ يَوْمِ الدِّينِ', 'Koning van de Dag van de Vergelding.'],
  [5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'U alleen aanbidden wij en U alleen vragen wij om hulp.'],
  [6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Leid ons op het rechte pad.'],
  [7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'Het pad van hen aan wie U Uw gunst hebt geschonken, niet van hen op wie de toorn rust en evenmin van de dwalenden.'],
];
for (const [verse, arabic, text] of fatiha) {
  // These opening formulas also occur elsewhere and can be spoken as invocations.
  const reference = (verse <= 3 ? 'vgl. ' : '') + 'Al-Fātiḥah 1:' + verse;
  register('quran', arabic, text + ' (' + reference + ')');
}

// These are excerpts, with their collection and number, not claims about an entire sermon or narration.
// https://sunnah.com/muslim:55a  https://sunnah.com/muslim:101  https://sunnah.com/bukhari:5027
register('hadith', 'الدِّينُ النَّصِيحَةُ', 'De godsdienst is oprechtheid. (Ṣaḥīḥ Muslim 55a, fragment)');
register('hadith', 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا', 'Wie ons bedriegt, hoort niet bij ons. (Ṣaḥīḥ Muslim 101, fragment)');
register('hadith', 'وَمَنْ غَشَّنَا فَلَيْسَ مِنَّا', 'En wie ons bedriegt, hoort niet bij ons. (Ṣaḥīḥ Muslim 101, fragment)');
register('hadith', 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'De besten onder jullie zijn degenen die de Koran leren en onderwijzen. (Ṣaḥīḥ al-Bukhārī 5027)');

// The meaning of lā ilāha illā Allāh: https://binbaz.org.sa/fatwas/6840/مظاهر-مصداقية-النطق-بالشهادتين
// For the variant with "His servant and Messenger": https://sunnah.com/bukhari:3435 .
const worship = 'niemand het recht heeft om aanbeden te worden behalve Allah';
const first = [
  ['لَا إِلَهَ إِلَّا اللَّهُ', 'Niemand heeft het recht om aanbeden te worden behalve Allah'],
  ['أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ', 'Ik getuig dat ' + worship],
  ['أَشْهَدُ أَلَّا إِلَهَ إِلَّا اللَّهُ', 'Ik getuig dat ' + worship],
  ['وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ', 'En ik getuig dat ' + worship],
  ['وَأَشْهَدُ أَلَّا إِلَهَ إِلَّا اللَّهُ', 'En ik getuig dat ' + worship],
];
const second = [];
for (const [arabic, text] of [['رَسُولُ اللَّهِ', 'de boodschapper van Allah'], ['عَبْدُهُ وَرَسُولُهُ', 'Zijn dienaar en Zijn boodschapper']]) {
  second.push(['مُحَمَّدٌ ' + arabic, 'Mohammed is ' + text]);
  for (const name of ['مُحَمَّدًا', 'مُحَمَّد']) second.push(['أَشْهَدُ أَنَّ ' + name + ' ' + arabic, 'Ik getuig dat Mohammed ' + text + ' is']);
}
for (const [arabic, text] of second) {
  register('shahada', arabic, text + '.');
  register('shahada', 'و' + arabic, 'En ' + (text.startsWith('Ik ') ? 'i' + text.slice(1) : text) + '.');
}
for (const [opening, dutch] of first) {
  for (const extended of [false, true]) {
    const arabic = opening + (extended ? ' وَحْدَهُ لَا شَرِيكَ لَهُ' : '');
    const text = dutch + (extended ? ', Hij alleen, zonder deelgenoot' : '');
    register('shahada', arabic, text + '.');
    for (const [ending, translation] of second) {
      const joined = translation.startsWith('Ik ') ? 'ik' + translation.slice(2) : translation;
      register('shahada', arabic + ' و' + ending, text + ', en ' + joined + '.');
      // The two independent declarations can also follow each other without wāw.
      register('shahada', arabic + ' ' + ending, text + '. ' + translation + '.');
    }
  }
}

const HOLD = Object.freeze({ caption: '', skipped: 'unverified' });
const KINDS = new Set(['speech', 'quran', 'hadith', 'shahada', 'uncertain', 'silence']);
const hasArabic = /[\u0621-\u063a\u0641-\u064a\u0671]/u;
const arabicCues = [
  /(?:قال|يقول) (?:الله|تعالى|سبحانه|عز وجل|رسول الله|النبي)|قوله تعالى|عن (?:رسول الله|النبي)/u,
  /في (?:القران|الحديث)|رواه |اخرجه |حدثنا |اخبرنا |حديث (?:شريف|صحيح)|رضي الله عنه|صل[ىي] الله عليه وسلم|عليه الصلاة والسلام|صدق الله العظيم/u,
  /الا الله|لا اله|رسول الله|اشهد ان|ملك يوم|يوم الدين/u,
];
const dutchCues = [
  /\b(?:soera|sura|surah|hadith|hadieth|overgeleverd|overleverde|shahada|shahāda)\b/iu,
  /\b(?:koran|qur[’'ʾ]?an|allah|god|de profeet|de boodschapper)\s+(?:(?:de verhevene|heeft)\s+)?(?:zegt|zei|gezegd|spreekt|verklaart)\b/iu,
  /profeet.{0,55}(?:heeft gezegd|zei)|(?:in|volgens|uit) (?:de |het )?(?:koran|qur[’'ʾ]?an|overlevering)/iu,
  /\b(?:geen (?:andere? )?(?:god|godheid)|(?:niemand|niets).{0,55}(?:aanbeden|aanbidding)|boodschapper van allah|dag (?:des oordeels|van (?:het oordeel|de vergelding)))\b/iu,
  /\b(?:bukh[aā]r[iī]|boekhari|moeslim|muslim)\s*\d|\d{1,3}\s*[:/]\s*\d{1,3}/iu,
];

function sourceEvidence(source) {
  if (typeof source !== 'string' || source.length > 1200 || !hasArabic.test(source)) return {};
  // A Latin gloss, schema fragment or reference number is not an Arabic transcript.
  if (/[{}<>`]/u.test(source) || /[\d٠-٩۰-۹]+\s*[:/]\s*[\d٠-٩۰-۹]+/u.test(source)
      || /\p{L}/u.test(source.replace(/[\p{Script=Arabic}\u0640]/gu, ''))) return {};
  const words = normalizeKhutbahSource(source);
  // In unvocalised muṣḥaf spelling bare ملك leaves the two readings ambiguous.
  if (words === 'ملك يوم الدين' && !/^\s*[«﴿"']?مَلِك/u.test(source.replace(/\u0640/g, ''))) return { protected: true };
  const entry = entries.get(words);
  const question = /[؟?]/u.test(source);
  if (entry) return !question && consistentWithEntry(source, entry) ? { entry } : { protected: true };
  // A fingerprint proposes a publisher lookup. Never let a model's own Dutch
  // caption or a verse number derived from a fingerprint establish the wording.
  const quran = quranCandidate(question ? source.replace(/[؟?]/gu, ' ') : source);
  if (typeof quran === 'string') return question ? { protected: true } : { quran };
  if (quran === false || hasQuranExcerpt(source)) return { protected: true };
  const tokens = words.split(' ');
  const overlaps = tokens.some((word, i) => i + 1 < tokens.length && partials.has(word + ' ' + tokens[i + 1]));
  const singlePartial = tokens.length === 1 && individualWords.has(words);
  return { ordinary: true, protected: overlaps || singlePartial || arabicCues.some(cue => cue.test(words)) || /[﴿﴾]/u.test(source) };
}

// The transcription fallback already has an independent Arabic transcript. Avoid a
// second model call if local evidence settles the decision. Null asks for a translation.
export function checkKhutbahSource(source, mode = 'auto') {
  if (!['auto', 'sources'].includes(mode)) return HOLD;
  const evidence = sourceEvidence(source);
  if (evidence.entry) return { caption: evidence.entry.caption, verified: true };
  if (evidence.quran) return { ...HOLD, quran: evidence.quran };
  return mode === 'auto' && evidence.ordinary && !evidence.protected ? null : HOLD;
}

export function guardKhutbahCaption(value, mode = 'auto') {
  if (!['auto', 'sources'].includes(mode) || !value || !KINDS.has(value.kind)
      || typeof value.caption !== 'string' || typeof value.source !== 'string') return HOLD;
  if (value.kind === 'silence') return !value.source.trim() && !value.caption.trim() ? { caption: '' } : HOLD;
  if (value.kind === 'uncertain') return HOLD;
  const evidence = sourceEvidence(value.source);
  if (evidence.entry) {
    if (value.kind !== 'speech' && value.kind !== evidence.entry.kind) return HOLD;
    return { caption: evidence.entry.caption, verified: true };
  }
  if (evidence.quran && ['speech', 'quran'].includes(value.kind)) return { ...HOLD, quran: evidence.quran };
  if (mode !== 'auto' || value.kind !== 'speech' || !evidence.ordinary || evidence.protected) return HOLD;
  const text = value.caption.trim();
  if (!text || text.length > 480 || !/\p{Script=Latin}/u.test(text) || hasArabic.test(text)
      || /[{}\[\]<>`]|[\x00-\x1f]/u.test(text) || dutchCues.some(cue => cue.test(text))) return HOLD;
  return { caption: text };
}
