import Nav from "./components/Nav.jsx";
import logo from "./assets/logo.png";
import { usePrayerTimes } from "./hooks/usePrayerTimes.js";
import { MOSQUE, DONATION_LINKS } from "./config.js";

export default function App() {
  const {
    method, setMethod, madhhab, setMadhhab,
    rows, loading, error, meta, METHODS
  } = usePrayerTimes();

  const openDonate = (kind, amount) => {
    let url = "";
    if (kind === "fixed") {
      url = amount === 5 ? DONATION_LINKS.EUR5
        : amount === 10 ? DONATION_LINKS.EUR10
        : amount === 20 ? DONATION_LINKS.EUR20
        : "";
    } else {
      url = DONATION_LINKS.CUSTOM_BASE;
    }
    if (url) {
      window.open(url, "_blank", "noopener");
    } else {
      alert("Doneren is nog niet geconfigureerd. Voeg jouw Stripe Payment Link(s) toe in src/config.js.");
    }
  };

  return (
    <div id="home">
      <Nav />

      <section className="border-b border-zinc-800 bg-gradient-to-b from-emerald-900/10 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-12 md:py-16">
          <img
            src={logo}
            alt="Logo Marokkaanse Moskee Houthalen"
            className="mx-auto w-[min(160px,22vw)] h-[min(160px,22vw)] object-contain rounded-full border border-zinc-700 shadow-[0_0_0_6px_#0f0f0f]"
            style={{ boxShadow: "0 0 60px rgba(199, 168, 31, 0.73)" }}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4">Welkom bij de {MOSQUE.name}</h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-2">
            Een plek voor gebed, kennis en gemeenschap. Binnenkort voegen we meer pagina&apos;s toe.
          </p>
          <div className="mt-4 flex gap-3 justify-center flex-wrap">
            <a href="#contact" className="inline-block font-bold bg-primary text-black px-4 py-2 rounded-lg shadow-ring hover:brightness-110">
              Bezoek &amp; Contact
            </a>
            <a href="#doneren" className="inline-block font-bold border border-amber-300 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-900/20">
              Doneren
            </a>
          </div>
        </div>
      </section>

      <section id="welkom" className="py-10 md:py-12">
        <div className="mx-auto w-[min(1100px,92%)]">
          <h2 className="text-2xl font-bold">Over ons</h2>
          <p className="text-zinc-300 mt-2">
            Dit is de officiële webpagina van onze moskee. We werken stap voor stap aan meer functionaliteit,
            zoals nieuws, activiteiten en informatie over lessen. Deze eerste versie is mobielvriendelijk en klaar
            om uit te breiden met extra pagina&apos;s.
          </p>
        </div>
      </section>

      <section id="gebedstijden" className="py-10 md:py-12 bg-[#0a0a0a] border-y border-zinc-800">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">Gebedstijden — {MOSQUE.city}</h2>
              {meta && (
                <p className="text-zinc-400 text-sm mt-1">
                  {meta.readable} (Hijri: {meta.hijri.date})
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <select
                className="bg-[#141414] border border-zinc-700 rounded-lg px-3 py-2"
                value={method}
                onChange={(e) => setMethod(Number(e.target.value))}
                aria-label="Berekeningsmethode"
              >
                {METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select
                className="bg-[#141414] border border-zinc-700 rounded-lg px-3 py-2"
                value={madhhab}
                onChange={(e) => setMadhhab(Number(e.target.value))}
                aria-label="Madhhab"
              >
                <option value={0}>Shafi&apos;i</option>
                <option value={1}>Hanafi</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mt-4 rounded-lg border border-zinc-800 bg-[#141414]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#101010]">
                  <th className="text-left px-4 py-3 border-b border-zinc-800">Gebed</th>
                  <th className="text-left px-4 py-3 border-b border-zinc-800">Tijd</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="px-4 py-3 text-zinc-400" colSpan={2}>Laden…</td></tr>
                )}
                {error && (
                  <tr><td className="px-4 py-3 text-red-400" colSpan={2}>Fout: {error}</td></tr>
                )}
                {!loading && !error && rows.map((r) => (
                  <tr key={r.name}>
                    <td className="px-4 py-3 border-b border-zinc-800">{r.name}</td>
                    <td className="px-4 py-3 border-b border-zinc-800">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Tijden via Aladhan API. Controleer lokaal en pas zo nodig aan.</p>
        </div>
      </section>

      <section id="doneren" className="py-10 md:py-12">
        <div className="mx-auto w-[min(1100px,92%)]">
          <h2 className="text-2xl font-bold">Doneren</h2>
          <p className="text-zinc-300 mt-2">Steun de moskee met een bijdrage.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[5,10,20].map((amt) => (
              <button
                key={amt}
                onClick={() => openDonate("fixed", amt)}
                className="font-bold bg-primary text-black px-4 py-2 rounded-lg hover:brightness-110"
              >
                €{amt}
              </button>
            ))}
            <button
              onClick={() => openDonate("custom")}
              className="font-bold border border-amber-400 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-900/20"
            >
              Kies zelf bedrag
            </button>
          </div>
          {/* <p className="text-xs text-zinc-500 mt-2">
            Tip: gebruik Stripe Payment Links en plak de URL&apos;s in <code>src/config.js</code>.
          </p> */}
        </div>
      </section>

      <section id="contact" className="py-10 md:py-12">
        <div className="mx-auto w-[min(1100px,92%)] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold">Locatie &amp; Contact</h2>
            <p className="mt-3"><strong>Adres</strong><br/>Houthalen, Limburg, België</p>
            <p className="mt-3"><strong>Email</strong><br/><a className="text-primary underline" href="mailto:info@moskeehouthalen.be">info@moskeehouthalen.be</a></p>
            <p className="mt-3"><strong>Openingsuren</strong><br/>Dagelijks geopend voor de vijf gebeden. Vrijdaggebed (Jumu&apos;ah) volgens aankondiging.</p>
          </div>
          <div className="bg-[#141414] border border-zinc-800 rounded-xl p-2">
            <iframe
              title="Moskee locatie"
              className="w-full h-64 md:h-80 rounded-lg"
              src={`https://www.google.com/maps?q=${encodeURIComponent("Marokkaanse Moskee Houthalen")}&output=embed`}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)] flex flex-wrap items-center justify-between gap-3 py-4">
          <p>&copy; {new Date().getFullYear()} {MOSQUE.name}. Alle rechten voorbehouden.</p>
          <div className="flex gap-3 text-zinc-400">
            <a className="hover:text-white" href="#home">Home</a>
            <a className="hover:text-white" href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
