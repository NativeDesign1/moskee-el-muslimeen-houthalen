// Keep letters, hamza and word order. The dagger alif is meaningful in words such as Mālik.
export function normalizeQuranArabic(source) {
  if (typeof source !== 'string' || !source || source.length > 5000) return '';
  // In the mushaf, a madd sign on a long ā following fatḥah marks recitation length
  // (e.g. مَآ). It is distinct from the letter آ at the start of a word.
  const text = source.replace(/(َا)ٓ/gu, '$1').normalize('NFKC')
    .replace(/\u0671/gu, 'ا')
    .replace(/[\u0640\u064b-\u0653\u0656-\u065f\u06d6-\u06ed]/gu, '')
    // These words also omit the full alif in standard unvocalized Arabic.
    .replace(/هٰذ/gu, 'هذ').replace(/ذٰلك/gu, 'ذلك').replace(/لٰكن/gu, 'لكن')
    .replace(/رحمٰن/gu, 'رحمن').replace(/لٰه/gu, 'له')
    .replace(/ىٰ/gu, 'ى').replace(/(صل|زك|حي)وٰة/gu, '$1اة').replace(/ءا/gu, 'آ')
    .replace(/\u0670/gu, 'ا')
    .replace(/[،؛؟.!?,…«»“”"()]/gu, ' ')
    .trim().replace(/\s+/gu, ' ');
  // Accept only a complete Arabic span. Numbers, transliteration and citations are not speech.
  if (!/^[\u0621-\u063a\u0641-\u064a\u0654\u0655 ]+$/u.test(text)) return '';
  return text;
}

function markedLetters(word) {
  const letters = [];
  for (const char of word.replace(/ٱ/gu, 'ا').replace(/ۡ/gu, 'ْ').normalize('NFC')) {
    if (/^[\u0621-\u063a\u0641-\u064a]$/u.test(char)) letters.push({ char, marks: '' });
    else if (letters.length && /^[\u064b-\u0652]$/u.test(char)) letters[letters.length - 1].marks += char;
  }
  return letters;
}

export function consistentQuranVowels(source, reference) {
  if (!/[\u064b-\u0652\u06e1]/u.test(source)) return true;
  const split = text => text.replace(/[،؛؟.!?,…«»“”"()\u06d6-\u06dc\u06de\u06e9]/gu, ' ').trim().split(/\s+/u);
  const heard = split(source);
  const published = split(reference);
  if (heard.length !== published.length) return false;
  return heard.every((word, i) => {
    if (!/[\u064b-\u0652\u06e1]/u.test(word)) return true;
    const input = markedLetters(word);
    const original = markedLetters(published[i]);
    // If vocalized standard and Uthmani spellings cannot be aligned, withhold the verse.
    return input.length === original.length && input.every(({ char, marks }, j) =>
      char === original[j].char && [...marks].every(mark => original[j].marks.includes(mark)));
  });
}

// A fingerprint selects a candidate only. Publication requires comparison with its full source.
export function verseFingerprint(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

// This filter is used only to withhold possible excerpts. Two hashes provide eight bit positions.
export const FILTER_BITS = 1 << 20;
export const FILTER_PROBES = 8;

export function excerptBits(words, visit) {
  let first = verseFingerprint(words);
  let second = 5381;
  for (let i = 0; i < words.length; i++) second = Math.imul(second, 33) ^ words.charCodeAt(i);
  first ^= first >>> 16;
  first = Math.imul(first, 0x85ebca6b);
  first ^= first >>> 13;
  second = Math.imul(second ^ (second >>> 16), 0xc2b2ae35) | 1;
  for (let i = 0; i < FILTER_PROBES; i++) {
    if (!visit((first + i * second) & (FILTER_BITS - 1))) return false;
  }
  return true;
}
