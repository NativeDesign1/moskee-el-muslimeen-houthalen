import { consistentQuranVowels, normalizeQuranArabic } from './quran-text.js';
import { quranReference, quranVerseId } from './quran-index.js';

const API = 'https://quranenc.com/api/v1/';
const EDITION = 'dutch_center';
const CACHE_MS = 60 * 60 * 1000;
const MAX_CACHE = 128;
const held = () => ({ caption: '', skipped: 'unverified' });
const verses = new Map();
let release;
const tawhid = /(?:^| )(?:و|ف)?لا إله إلا (?:الله|هو|أنا|أنت)(?: |$)/u;
const rightfulWorship = /(?:het recht (?:heeft |hebben )?(?:om )?aanbeden te worden|het recht (?:heeft |hebben )?op aanbidding|(?:met recht|terecht|rechtmatig) (?:wordt |kan worden )?aanbeden|waardig (?:is )?(?:om )?aanbeden te worden|(?:aanbidding|aanbeden te worden) (?:toekomt|waardig|verdient)|aanbiddenswaardig)/iu;

// Only public source records are cached. Never store audio, transcripts or operator details.
async function getJson(path, signal) {
  const response = await fetch(API + path, { headers: { Accept: 'application/json' }, redirect: 'error', signal });
  if (!response.ok) throw new Error('Bron niet beschikbaar.');
  return response.json();
}

async function versionAtSource(signal) {
  if (release?.expires > Date.now()) return release.version;
  const data = await getJson('translations/list/nl', signal);
  const version = data?.translations?.find(entry => entry.key === EDITION)?.version;
  if (typeof version !== 'string' || !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(version)) throw new Error('Onbekende bronversie.');
  if (release?.version !== version) verses.clear();
  release = { version, expires: Date.now() + CACHE_MS };
  return version;
}

export async function verifyQuranVerse(source, reference, signal, { witness, includeArabic = false } = {}) {
  if (signal?.aborted || quranReference(source) !== reference) return held();
  const id = quranVerseId(reference);
  if (!id) return held();
  const [surah, ayah] = reference.split(':');
  try {
    const timeout = AbortSignal.timeout(8000);
    const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const cached = verses.get(reference);
    // Entries and version expire together. A new edition is always checked against fresh text.
    const useCache = cached && release?.expires > Date.now() && cached.version === release.version;
    const [version, result] = await Promise.all([
      versionAtSource(requestSignal),
      useCache ? cached.result : getJson('translation/aya/' + EDITION + '/' + surah + '/' + ayah, requestSignal).then(data => data.result),
    ]);
    requestSignal.throwIfAborted();
    if (!result || result.id !== String(id) || result.sura !== surah || result.aya !== ayah ||
        typeof result.translation !== 'string' || !result.translation.trim() || typeof result.footnotes !== 'string') return held();
    const original = normalizeQuranArabic(result.arabic_text);
    const matchesOriginal = input => typeof input === 'string' && original && normalizeQuranArabic(input) === original &&
      consistentQuranVowels(input, result.arabic_text);
    if (!matchesOriginal(source) || (witness !== undefined && !matchesOriginal(witness))) return held();
    // Use the publisher verbatim or withhold. For tawhid the mosque requires explicit rightful worship.
    if (tawhid.test(original) && !rightfulWorship.test(result.translation)) return held();
    // Preserve the publisher's wording and any notes. Never shorten a verse to fit the screen.
    const caption = [result.translation, result.footnotes, 'Koran ' + reference +
      ' · Nederlands Islamitisch Centrum / Rowwad · QuranEnc.com v' + version].filter(Boolean).join('\n');
    if (caption.length > 480) return held();
    if (!useCache) {
      if (verses.size >= MAX_CACHE) verses.delete(verses.keys().next().value);
      verses.set(reference, { version, result });
    }
    return includeArabic ? { caption, verified: true, referenceArabic: result.arabic_text } : { caption, verified: true };
  } catch {
    // A later utterance may still succeed after a publisher timeout or outage.
    return held();
  }
}
