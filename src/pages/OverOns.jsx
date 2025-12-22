import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';

export default function OverOns() {
  return (
    <div>
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-emerald-900/20 via-transparent to-amber-900/20">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent">
            Over Onze Moskee
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-4 text-lg">
            Leer meer over wie we zijn, onze geschiedenis en wat we voor de gemeenschap betekenen
          </p>
        </div>
      </section>

      {/* Missie & Visie */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary/10 to-amber-900/10 border border-zinc-800 rounded-2xl p-8">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-4 text-primary">Onze Missie</h2>
              <p className="text-zinc-300 leading-relaxed">
                Het bevorderen van islamitische kennis en spirituele groei binnen onze gemeenschap. 
                We streven ernaar een inclusieve en gastvrije omgeving te creëren waar iedereen zich 
                welkom voelt om te leren, te bidden en te groeien in geloof.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/10 to-primary/10 border border-zinc-800 rounded-2xl p-8">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-4 text-primary">Onze Visie</h2>
              <p className="text-zinc-300 leading-relaxed">
                Een bloeiende islamitische gemeenschap zijn die een positieve bijdrage levert aan 
                de samenleving. We willen een bron van kennis, steun en inspiratie zijn voor moslims 
                en niet-moslims in {MOSQUE.city} en omgeving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onze Waarden */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Onze Kernwaarden
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '🤝', title: 'Gemeenschap', desc: 'We bouwen aan sterke banden en ondersteunen elkaar in geloof en dagelijks leven.' },
              { emoji: '📚', title: 'Kennis', desc: 'We moedigen levenslang leren aan en delen islamitische wijsheid en kennis.' },
              { emoji: '🙏', title: 'Spiritualiteit', desc: 'We cultiveren een diepe verbinding met Allah door gebed en contemplatie.' },
              { emoji: '❤️', title: 'Gastvrijheid', desc: 'Iedereen is welkom, ongeacht achtergrond of geloof, in onze moskee.' },
              { emoji: '🌍', title: 'Maatschappij', desc: 'We dragen actief bij aan het welzijn van onze lokale gemeenschap.' },
              { emoji: '⚖️', title: 'Rechtvaardigheid', desc: 'We staan voor eerlijkheid, gelijkheid en sociale rechtvaardigheid.' }
            ].map((value, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3">{value.emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-primary">{value.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wat We Doen */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Wat We Bieden
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🕌', title: 'Vijf Dagelijkse Gebeden', desc: 'Gebedsdiensten voor alle vijf verplichte gebeden, inclusief vrijdaggebed (Jumu\'ah).' },
              { icon: '📖', title: 'Koran Lessen', desc: 'Tafsir, tajweed en arabische lessen voor alle leeftijden en niveaus.' },
              { icon: '👶', title: 'Jeugdprogramma\'s', desc: 'Educatieve activiteiten, islamitische studies en sociale evenementen voor jongeren.' },
              { icon: '👵', title: 'Gemeenschapsdiensten', desc: 'Ondersteuning bij huwelijken, begrafenissen en andere belangrijke levensgebeurtenissen.' },
              { icon: '🎓', title: 'Educatie', desc: 'Workshops, seminars en lezingen over islamitische onderwerpen en actuele thema\'s.' },
              { icon: '🤲', title: 'Zakat & Sadaqah', desc: 'Distributie van liefdadigheidsgiften aan behoeftigen in onze gemeenschap.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geschiedenis */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Onze Geschiedenis
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="text-6xl text-center mb-6">📜</div>
            <p className="text-zinc-300 leading-relaxed mb-4">
              De {MOSQUE.name} is opgericht om de groeiende moslimgemeenschap in {MOSQUE.city} te dienen. 
              Wat begon als een klein gebedshuis is uitgegroeid tot een levendig centrum waar honderden 
              gemeenschapsleden samenkomen.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Door de jaren heen hebben we ons ontwikkeld van alleen gebedsdiensten naar een breed scala 
              aan educatieve programma's, jeugdactiviteiten en gemeenschapsevenementen. We zijn trots op 
              de diversiteit van onze gemeenschap en de inclusieve sfeer die we hebben gecreëerd.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Vandaag de dag blijven we groeien en ons aanpassen aan de behoeften van onze gemeenschap, 
              terwijl we trouw blijven aan de fundamentele waarden van Islam.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)] text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Kom Een Keer Langs!</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Iedereen is welkom om onze moskee te bezoeken. Of je nu moslim bent of gewoon meer wilt leren over Islam, 
            we ontvangen je graag met open armen.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <span>📍</span>
              <span>Contact & Locatie</span>
            </Link>
            <Link
              to="/gebedstijden"
              className="inline-flex items-center gap-2 font-bold border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all duration-300"
            >
              <span>🕌</span>
              <span>Gebedstijden</span>
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
