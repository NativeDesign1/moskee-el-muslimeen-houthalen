import { fingerprints } from './quran-fingerprints.js';
import { excerptFilter } from './quran-excerpts.js';
import { excerptBits, normalizeQuranArabic, verseFingerprint } from './quran-text.js';

let references;
let excerptBytes;

function verseReferences() {
  if (references) return references;
  references = new Map();
  fingerprints.forEach((surah, s) => surah.forEach((hash, a) => {
    // Both identical ayat and hash collisions are deliberately ambiguous.
    references.set(hash, references.has(hash) ? false : (s + 1) + ':' + (a + 1));
  }));
  return references;
}

// false means that the same fingerprint occurs at more than one place. Hold that caption.
export function quranCandidate(source) {
  const text = normalizeQuranArabic(source);
  if (!text) return null;
  return verseReferences().get(verseFingerprint(text)) ?? null;
}

export function quranReference(source) {
  return quranCandidate(source) || null;
}

// Four matching consecutive words trigger a hold, never a translation or an attribution.
export function hasQuranExcerpt(source) {
  const words = normalizeQuranArabic(source).split(' ');
  if (words.length < 4) return false;
  if (!excerptBytes) excerptBytes = Uint8Array.from(atob(excerptFilter), char => char.charCodeAt(0));
  for (let i = 0; i + 4 <= words.length; i++) {
    if (excerptBits(words.slice(i, i + 4).join(' '), bit => excerptBytes[bit >>> 3] & (1 << (bit & 7)))) return true;
  }
  return false;
}

export function quranVerseId(reference) {
  if (typeof reference !== 'string' || !/^[1-9]\d{0,2}:[1-9]\d{0,2}$/.test(reference)) return null;
  const [surah, ayah] = reference.split(':').map(Number);
  if (!fingerprints[surah - 1] || ayah > fingerprints[surah - 1].length) return null;
  let id = ayah;
  for (let s = 0; s < surah - 1; s++) id += fingerprints[s].length;
  return id;
}
