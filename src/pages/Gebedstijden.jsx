import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';

export default function Gebedstijden() {
  return (
    <div>
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-emerald-900/20 via-transparent to-amber-900/20">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent">
            🕌 Gebedstijden
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-4 text-lg">
            Actuele tijden voor de vijf dagelijkse gebeden in {MOSQUE.city}
          </p>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 bg-primary/5 border-y border-primary/20">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="flex items-center gap-4 justify-center flex-wrap text-center">
            <span className="text-3xl">📅</span>
            <p className="text-zinc-300">
              <strong className="text-primary">Let op:</strong> Controleer altijd de exacte tijden lokaal. 
              Gebeden worden 10-15 minuten na de aangegeven tijd gehouden.
            </p>
          </div>
        </div>
      </section>

      {/* Gebedstijden Widgets */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-[min(1100px,92%)]">
          {/* Desktop Widget */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 hidden md:block bg-[#141414] shadow-2xl">
            <iframe
              src="https://mawaqit.net/en/w/masjid-al-muslimeen-houthalen-helchteren-3530-belgium?showOnly5PrayerTimes=0"
              title="Gebedstijden — MAWAQIT"
              className="w-full"
              style={{ height: 520, border: 0, display: "block" }}
              frameBorder="0"
              loading="lazy"
              referrerPolicy="no-referrer"
              scrolling="no"
              allow="fullscreen"
            />
          </div>

          {/* Mobile Widget */}
          <div className="rounded-2xl border border-zinc-800 bg-[#141414] overflow-hidden md:hidden shadow-2xl">
            <iframe
              src="https://mawaqit.net/en/m/masjid-al-muslimeen-houthalen-helchteren-3530-belgium?showNotification=0&showSearchButton=0&showFooter=0&showFlashMessage=0&view=mobile"
              title="Gebedstijden — MAWAQIT (Mobiel)"
              className="w-full"
              style={{ height: 750, border: 0, display: "block" }}
              frameBorder="0"
              scrolling="no"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-xs text-zinc-500 mt-4 text-center">
            Tijden worden automatisch bijgewerkt via MAWAQIT
          </p>
        </div>
      </section>

      {/* Gebedsinformatie */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Over De Gebeden
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Fajr (Ochtendgebed)',
                icon: '🌅',
                time: 'Voor zonsopgang',
                desc: 'Het eerste gebed van de dag, verricht in de laatste periode van de nacht voor de dageraad.',
                rakats: '2 Sunnah + 2 Fard'
              },
              {
                name: 'Dhuhr (Middaggebed)',
                icon: '☀️',
                time: 'Middag',
                desc: 'Verricht nadat de zon zijn hoogste punt heeft bereikt en begint te dalen.',
                rakats: '4 Sunnah + 4 Fard + 2 Sunnah'
              },
              {
                name: 'Asr (Middaggebed)',
                icon: '🌤️',
                time: 'Late middag',
                desc: 'Het derde gebed, verricht in de late namiddag voor zonsondergang.',
                rakats: '4 Sunnah + 4 Fard'
              },
              {
                name: 'Maghrib (Avondgebed)',
                icon: '🌅',
                time: 'Bij zonsondergang',
                desc: 'Verricht direct na zonsondergang, wanneer de zon volledig onder de horizon verdwijnt.',
                rakats: '3 Fard + 2 Sunnah'
              },
              {
                name: 'Isha (Nachtgebed)',
                icon: '🌙',
                time: 'Nacht',
                desc: 'Het laatste verplichte gebed van de dag, verricht wanneer de rode gloed is verdwenen.',
                rakats: '4 Sunnah + 4 Fard + 2 Sunnah + 3 Witr'
              },
              {
                name: 'Jumu\'ah (Vrijdag)',
                icon: '🕌',
                time: 'Vrijdagmiddag',
                desc: 'Vervangt het Dhuhr-gebed op vrijdag. Inclusief khutbah (preek).',
                rakats: '2 Fard + 4 Sunnah'
              }
            ].map((prayer, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3">{prayer.icon}</div>
                <h3 className="text-lg font-bold mb-1 text-primary">{prayer.name}</h3>
                <p className="text-sm text-emerald-400 mb-3 font-semibold">{prayer.time}</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">{prayer.desc}</p>
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">{prayer.rakats}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips voor Gebedsbezoekers */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Tips Voor Moskeebezoek
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '👟', title: 'Schoenen', desc: 'Trek je schoenen uit bij de ingang. Er zijn schoenrekken beschikbaar.' },
              { icon: '🚿', title: 'Wudhu', desc: 'Faciliteiten voor wudhu (rituele wassing) zijn beschikbaar voor mannen en vrouwen.' },
              { icon: '👔', title: 'Kleding', desc: 'Draag respectvolle, bedekte kleding. Voor vrouwen is een hoofddoek gewaardeerd.' },
              { icon: '⏰', title: 'Timing', desc: 'Kom 10-15 minuten van tevoren om op tijd te zijn voor het congregatiegebed.' },
              { icon: '📵', title: 'Telefoons', desc: 'Zet je telefoon op stil tijdens het gebed om afleiding te voorkomen.' },
              { icon: '🤝', title: 'Welkom', desc: 'Voel je vrij om vragen te stellen. Onze gemeenschap staat klaar om te helpen.' }
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-primary/50 transition-colors">
                <div className="text-3xl flex-shrink-0">{tip.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{tip.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)] text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Kom Bidden Met Ons</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Het congregatiegebed in de moskee heeft een grote beloning. We verwelkomen je graag!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <span>📍</span>
              <span>Locatie & Routebeschrijving</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-bold border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all duration-300"
            >
              <span>🏠</span>
              <span>Terug naar Home</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto w-[min(1100px,92%)] py-6 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} {MOSQUE.name}. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}
