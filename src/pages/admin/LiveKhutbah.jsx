import { useEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../supabaseClient';
import { joinKhutbahWav, khutbahWavDurationMs, openKhutbahMicrophone } from '../../utils/khutbahAudio';

const TV_PATH = '/tv/khutbah';
const seconds = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const phaseLabels = {
  idle: 'Microfoon uit',
  opening: 'Microfoon openen…',
  testing: 'Lokale microfoontest',
  starting: 'Vertaling starten…',
  live: 'Live',
  stopping: 'Sessie afsluiten…',
};

function describeError(error) {
  if (error?.name === 'NotAllowedError') return 'Geef deze website microfoontoegang in de browser en probeer opnieuw.';
  if (['NotFoundError', 'OverconstrainedError'].includes(error?.name)) return 'De gekozen microfoon is niet beschikbaar. Sluit hem aan of kies een andere ingang.';
  if (error?.name === 'NotReadableError') return 'De microfoon kan niet worden geopend. Controleer of een ander programma de ingang bezet houdt.';
  if (error?.code === 'PGRST202') return 'De khutbah-module is nog niet ingesteld in Supabase.';
  if (error?.message?.includes('Failed to fetch')) return 'De verbinding is verbroken. Controleer het netwerk en probeer opnieuw.';
  return error?.message || 'De live vertaling is onderbroken. Probeer opnieuw.';
}

async function control(sessionId, action) {
  const { data, error } = await supabase.rpc('khutbah_control', {
    p_action: action,
    p_session: sessionId,
  }).abortSignal(AbortSignal.timeout(10000));
  if (error) throw error;
  if (data !== true) throw new Error('Deze sessie is niet meer actief. Start de vertaling opnieuw.');
}

async function translate(run, clip) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Je bent uitgelogd. Meld je opnieuw aan om de vertaling te starten.');
  const response = await fetch('/api/khutbah', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + data.session.access_token,
      'Content-Type': 'audio/wav',
      'X-Khutbah-Session': run.id,
      'X-Khutbah-Sequence': String(++run.sequence),
    },
    body: clip,
    signal: run.controller.signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.caption !== 'string') {
    throw new Error(typeof result?.error === 'string' ? result.error : 'De vertaalservice is niet bereikbaar. Controleer de serverinstellingen en probeer opnieuw.');
  }
  return result.caption;
}

function takePendingAudio(queue) {
  const first = queue.shift();
  const next = queue[0];
  // Only combine speech that is already waiting. Never hold the first clip for another.
  if (next) {
    const nextDuration = khutbahWavDurationMs(next.clip);
    const gap = next.closedAt - nextDuration - first.closedAt;
    if (gap <= 1200 && khutbahWavDurationMs(first.clip) + nextDuration <= 8000) {
      queue.shift();
      return { clip: joinKhutbahWav([first.clip, next.clip]), closedAt: next.closedAt };
    }
  }
  return first;
}

export default function LiveKhutbah() {
  const active = useRef(null);
  const mounted = useRef(false);
  const [phase, setPhase] = useState('idle');
  const [devices, setDevices] = useState([]);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState('');
  const [published, setPublished] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [skipped, setSkipped] = useState(0);

  async function refreshDevices() {
    try {
      const list = await navigator.mediaDevices?.enumerateDevices();
      if (mounted.current && list) {
        const inputs = list.filter(d => d.kind === 'audioinput' && d.deviceId);
        setDevices(inputs);
        setInput(selected => inputs.some(d => d.deviceId === selected) ? selected : '');
      }
    } catch {
      // Some browsers expose the default input only, until permission is granted.
    }
  }

  async function stop(run, message = '') {
    if (!run || run.controller.signal.aborted) return;
    run.live = false;
    run.controller.abort();
    run.queue.length = 0;
    clearInterval(run.heartbeat);
    clearTimeout(run.uploadTimer);
    if (mounted.current) {
      setLevel(0);
      setProcessing(false);
      setPhase('stopping');
      setError(message);
    }
    // Wait for a pending start before releasing its lease, even if its reply was
    // lost. A second start in this tab stays disabled until this cleanup finishes.
    if (run.startRequest) {
      const confirmed = await run.startRequest.then(() => true, () => false);
      try {
        await control(run.id, 'stop');
      } catch {
        if (confirmed) {
          message = [message, 'De microfoon is uit. Bij verbindingsverlies keert de tv binnen een minuut terug naar de wachtstand.'].filter(Boolean).join(' ');
        }
      }
    }
    if (active.current === run) {
      active.current = null;
      if (mounted.current) {
        setError(message);
        setPhase('idle');
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    refreshDevices();
    const leave = () => { void stop(active.current); };
    navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices);
    window.addEventListener('pagehide', leave);
    return () => {
      mounted.current = false;
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices);
      window.removeEventListener('pagehide', leave);
      leave();
    };
  }, []);

  async function enqueue(run, clip) {
    if (!run.live) return;
    // Prioritise current speech when the provider falls behind.
    if (run.queue.length >= 2) {
      run.queue.shift();
      setSkipped(n => n + 1);
    }
    run.queue.push({ clip, closedAt: performance.now() });
    if (run.uploading) return;
    run.uploading = true;
    setProcessing(true);
    try {
      while (run.live && run.queue.length) {
        run.uploadTimer = setTimeout(() => {
          void stop(run, 'De vertaling duurde te lang. Controleer de verbinding en start de sessie opnieuw.');
        }, 55000);
        const { clip: audio, closedAt } = takePendingAudio(run.queue);
        const text = await translate(run, audio);
        clearTimeout(run.uploadTimer);
        if (run.live && text) setPublished({ text, delayMs: performance.now() - closedAt });
      }
    } catch (err) {
      if (run.live) void stop(run, describeError(err));
    } finally {
      clearTimeout(run.uploadTimer);
      run.uploading = false;
      if (run.live) setProcessing(false);
    }
  }

  async function start(broadcast) {
    // A successful microphone test can become the live input without reopening it.
    const existing = active.current;
    if (existing && (existing.controller.signal.aborted || !existing.testing || !broadcast)) return;
    const run = existing || { controller: new AbortController(), queue: [], sequence: 0 };
    active.current = run;
    run.testing = false;
    setPhase(broadcast ? 'starting' : 'opening');
    setError('');
    setSkipped(0);
    setPublished(null);
    try {
      if (!existing) {
        await openKhutbahMicrophone({
          deviceId: input,
          signal: run.controller.signal,
          onLevel: setLevel,
          live: () => run.live,
          onClip: clip => { void enqueue(run, clip); },
          onFailure: message => { void stop(run, message); },
        });
        if (run.controller.signal.aborted) return;
        void refreshDevices();
      }
      if (!broadcast) {
        run.testing = true;
        setPhase('testing');
        return;
      }
      run.id = crypto.randomUUID();
      run.startRequest = control(run.id, 'start');
      await run.startRequest;
      if (run.controller.signal.aborted) return;
      run.live = true;
      setPhase('live');
      run.heartbeat = setInterval(async () => {
        try {
          await control(run.id, 'heartbeat');
        } catch (err) {
          if (run.live) void stop(run, describeError(err));
        }
      }, 12000);
    } catch (err) {
      if (!run.controller.signal.aborted) void stop(run, describeError(err));
    }
  }

  const button = 'rounded-lg px-4 py-2.5 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6 text-zinc-100">
        <header>
          <h2 className="text-3xl font-bold">Live khutbah</h2>
          <p className="mt-2 text-zinc-300">Nederlandse ondertiteling voor de vrijdagpreek in het Arabisch en de Marokkaanse Darija.</p>
        </header>

        <section className="space-y-5 rounded-xl border border-zinc-700 bg-zinc-900/70 p-5 sm:p-7" aria-labelledby="mic-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="mic-heading" className="text-xl font-semibold">Microfoon</h3>
            <span role="status" className={phase === 'live' ? 'text-emerald-300' : 'text-zinc-300'}>{phaseLabels[phase]}</span>
          </div>
          <div>
            <label htmlFor="khutbah-input" className="mb-2 block font-medium">Geluidsingang</label>
            <select id="khutbah-input" className="w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 text-white disabled:opacity-60"
              value={input} onChange={event => setInput(event.target.value)} disabled={phase !== 'idle'}>
              <option value="">Standaardmicrofoon van dit apparaat</option>
              {devices.filter(d => d.deviceId !== 'default').map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microfoon ' + (i + 1)}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-zinc-400">Gebruik je een mengpaneel? Kies de USB-audio-interface. De microfoontest werkt lokaal.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-300" htmlFor="khutbah-level">Ingangsniveau</label>
            <progress id="khutbah-level" value={level} max="100" className="block h-3 w-full accent-emerald-400" />
          </div>
          <div className="flex flex-wrap gap-3">
            {(phase === 'idle' || phase === 'testing') && (
              <button type="button" className={button + ' bg-primary text-black hover:bg-amber-300'} onClick={() => start(true)}>Start vertaling</button>
            )}
            {phase === 'idle' ? (
              <button type="button" className={button + ' border border-zinc-600 hover:border-zinc-300'} onClick={() => start(false)}>Test microfoon</button>
            ) : (
              <button type="button" className={button + ' border border-zinc-600 hover:border-red-400'} disabled={phase === 'stopping'} onClick={() => stop(active.current)}>
                {phase === 'testing' ? 'Stop test' : phase === 'live' ? 'Stop vertaling' : phase === 'stopping' ? 'Afsluiten…' : 'Annuleren'}
              </button>
            )}
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-200">{error}</p>}
          {skipped > 0 && <p role="status" className="text-amber-300">Door vertraging overgeslagen fragmenten: {skipped}.</p>}
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-5 sm:p-7" aria-labelledby="tv-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id="tv-heading" className="text-xl font-semibold">Tv-scherm</h3>
            <a href={TV_PATH} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-zinc-600 px-4 py-2 font-medium hover:border-primary">Open tv-scherm</a>
          </div>
          <p className="break-all text-zinc-300">Open op elke tv <span className="font-medium text-white">{window.location.origin + TV_PATH}</span></p>
          <div className="rounded-lg border border-zinc-800 bg-black/60 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Laatste Nederlandse ondertiteling</h4>
            <p aria-live="polite" className="text-lg">{published?.text || (phase === 'live' ? (processing ? 'Aan het vertalen…' : 'Wachten op spraak…') : 'Nog geen ondertiteling.')}</p>
            {published && (
              <p className="mt-2 text-sm text-zinc-400">
                Tijd van einde fragment tot bevestigde publicatie · {seconds.format(published.delayMs / 1000)} s
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
