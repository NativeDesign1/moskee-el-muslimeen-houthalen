import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import logo from '../assets/logo.png';
import { MOSQUE } from '../config';
import { supabase } from '../supabaseClient';

const CAPTION_LIFETIME_MS = 30_000;
const LIVE_POLL_MS = 600;
const STANDBY_POLL_MS = 1500;
const OFFLINE_RETRY_MS = 5000;
const SIZES = { Klein: 0.035, Normaal: 0.05, Groot: 0.065 };
const SIZE_KEY = 'khutbah.tv.lettergrootte';
const STATUS = { connecting: 'Verbinden', idle: 'Stand-by', live: 'Live', offline: 'Geen verbinding' };
const WAITING = {
  connecting: 'Verbinding maken…',
  idle: 'Wachten op de khutbah',
  live: 'Wachten op de volgende ondertiteling…',
  offline: 'De verbinding wordt automatisch hersteld.',
};

function useKhutbahDisplay() {
  const [display, setDisplay] = useState({ mode: 'connecting', caption: '' });

  useEffect(() => {
    let closed = false;
    let controller;
    let pollTimer;
    let expiryTimer;

    async function refresh() {
      const started = Date.now();
      let nextPoll = OFFLINE_RETRY_MS;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const { data, error } = await supabase.rpc('khutbah_display').abortSignal(controller.signal);
        if (closed) return;
        if (error || typeof data?.live !== 'boolean') throw new Error('Geen schermgegevens');
        clearTimeout(expiryTimer);
        const mode = data.live ? 'live' : 'idle';
        const age = data.age_ms;
        // Include the entire request time so a slow response never prolongs an old caption.
        const remaining = Number.isFinite(age) && age >= 0
          ? CAPTION_LIFETIME_MS - age - (Date.now() - started)
          : 0;
        const caption = data.live && remaining > 0 && typeof data.caption === 'string'
          ? data.caption.trim()
          : '';
        setDisplay(previous => previous.mode === mode && previous.caption === caption ? previous : { mode, caption });
        if (caption) {
          expiryTimer = setTimeout(() => setDisplay({ mode: 'live', caption: '' }), remaining);
        }
        // Count network time towards the live interval, leaving breathing room on slow links.
        nextPoll = data.live ? Math.max(200, LIVE_POLL_MS - (Date.now() - started)) : STANDBY_POLL_MS;
      } catch {
        if (!closed) {
          clearTimeout(expiryTimer);
          setDisplay({ mode: 'offline', caption: '' });
        }
      } finally {
        clearTimeout(timeout);
        if (!closed) pollTimer = setTimeout(refresh, nextPoll);
      }
    }

    refresh();
    return () => {
      closed = true;
      controller?.abort();
      clearTimeout(pollTimer);
      clearTimeout(expiryTimer);
    };
  }, []);

  return display;
}

function Caption({ caption, size }) {
  const container = useRef(null);
  const paragraph = useRef(null);

  useLayoutEffect(() => {
    const box = container.current;
    const text = paragraph.current;
    function fit() {
      let pixels = Math.max(26, Math.round(window.innerWidth * SIZES[size]));
      text.style.fontSize = pixels + 'px';
      while (text.scrollHeight > box.clientHeight && pixels > 16) {
        pixels = Math.max(16, Math.floor(pixels * 0.9));
        text.style.fontSize = pixels + 'px';
      }
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [caption, size]);

  return (
    <div ref={container} className="flex h-full min-h-0 w-full flex-col overflow-y-auto">
      <p ref={paragraph} className="my-auto shrink-0 whitespace-pre-line text-center font-semibold leading-tight [overflow-wrap:anywhere]">
        {caption}
      </p>
    </div>
  );
}

export default function KhutbahScreen() {
  const { mode, caption } = useKhutbahDisplay();
  const [size, setSize] = useState(() => {
    try {
      const stored = localStorage.getItem(SIZE_KEY);
      return Object.hasOwn(SIZES, stored) ? stored : 'Normaal';
    } catch {
      return 'Normaal';
    }
  });
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const [fullscreenError, setFullscreenError] = useState('');

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Live khutbah · ' + MOSQUE.name;
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.title = oldTitle;
    };
  }, []);

  function changeSize(event) {
    const next = event.target.value;
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, next);
    } catch {
      // Some TV browsers have no persistent storage.
    }
  }

  async function toggleFullscreen() {
    setFullscreenError('');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setFullscreenError('Gebruik de optie voor volledig scherm in je browser.');
    }
  }

  return (
    <main lang="nl" className="grid h-screen grid-rows-[auto_minmax(0,1fr)_auto] gap-[3vh] bg-zinc-950 px-[6vw] py-[5vh] text-zinc-50">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-[2vh]">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 rounded-full object-contain md:h-14 md:w-14" />
          <h1 className="text-base font-semibold sm:text-xl lg:text-2xl">{MOSQUE.name}</h1>
        </div>
        <p className={'shrink-0 text-sm font-semibold sm:text-lg ' + (mode === 'live' ? 'text-emerald-300' : 'text-zinc-300')}>
          {STATUS[mode]}
        </p>
      </header>

      <section aria-live="polite" aria-atomic="true" aria-label="Ondertiteling" className="flex min-h-0 items-center justify-center">
        {caption ? <Caption caption={caption} size={size} /> : (
          <p className="text-center text-2xl font-medium text-zinc-300 sm:text-4xl lg:text-5xl">{WAITING[mode]}</p>
        )}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-[2vh]">
        <p className="font-medium text-amber-200 sm:text-lg">Automatische vertaling · Nederlands</p>
        <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
          <label className="flex items-center gap-2">
            Lettergrootte
            <select value={size} onChange={changeSize} className="rounded border border-zinc-600 bg-zinc-900 px-2 py-1.5">
              {Object.keys(SIZES).map(label => <option key={label}>{label}</option>)}
            </select>
          </label>
          {document.fullscreenEnabled && (
            <button onClick={toggleFullscreen} className="rounded border border-zinc-600 px-3 py-1.5 hover:bg-zinc-800">
              {fullscreen ? 'Volledig scherm sluiten' : 'Volledig scherm'}
            </button>
          )}
          {fullscreenError && <span role="status">{fullscreenError}</span>}
        </div>
      </footer>
    </main>
  );
}
