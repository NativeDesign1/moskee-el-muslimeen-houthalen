import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';

export default function Activiteiten() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Vrijdaggebed (Jumu\'ah)',
      date: 'Elke Vrijdag',
      time: 'Volgens gebedstijden',
      icon: '🕌',
      category: 'Wekelijks',
      description: 'Wekelijks vrijdaggebed met khutbah (preek). Alle mannen zijn welkom.'
    },
    {
      id: 2,
      title: 'Koran Tafsir Lessen',
      date: 'Elke Zondag',
      time: '14:00 - 16:00',
      icon: '📖',
      category: 'Educatie',
      description: 'Diepgaande studie en uitleg van de Koran onder begeleiding van geleerde.'
    },
    {
      id: 3,
      title: 'Jeugdactiviteiten',
      date: 'Elke Zaterdag',
      time: '10:00 - 12:00',
      icon: '👶',
      category: 'Jeugd',
      description: 'Islamitische lessen, spelletjes en activiteiten voor kinderen 6-12 jaar.'
    },
    {
      id: 4,
      title: 'Arabische Taalcursus',
      date: 'Woensdag & Donderdag',
      time: '19:00 - 20:30',
      icon: '🎓',
      category: 'Taal',
      description: 'Leer Arabisch lezen en schrijven. Voor beginners en gevorderden.'
    }
  ];

  const islamicEvents = [
    {
      title: 'Ramadan',
      icon: '🌙',
      desc: 'Vastenmaand met extra gebeden (Taraweeh), iftar maaltijden en spirituele activiteiten.',
      when: 'Jaarlijks - 9e maand Islamitische kalender'
    },
    {
      title: 'Eid al-Fitr',
      icon: '🎉',
      desc: 'Feest na Ramadan met speciaal gebed, gemeenschapsmaaltijd en kinderactiviteiten.',
      when: '1 Shawwal'
    },
    {
      title: 'Eid al-Adha',
      icon: '🕋',
      desc: 'Offerfeest tijdens Hajj periode met gebed, Qurban verdeling aan behoeftigen.',
      when: '10 Dhul Hijjah'
    }
  ];

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-emerald-900/20 via-transparent to-amber-900/20">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent">
            🎯 Activiteiten & Evenementen
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-4 text-lg">
            Ontdek onze wekelijkse programma's en aankomende evenementen
          </p>
        </div>
      </section>

      {/* Wekelijkse Activiteiten */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Wekelijkse Programma's
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{event.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-sm mb-3">
                      <p className="text-emerald-400 font-semibold">📅 {event.date}</p>
                      <p className="text-amber-400 font-semibold">🕐 {event.time}</p>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Islamitische Evenementen */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Jaarlijkse Islamitische Evenementen
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {islamicEvents.map((event, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="text-5xl mb-4">{event.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-primary">{event.title}</h3>
                <p className="text-sm text-emerald-400 font-semibold mb-3">{event.when}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speciale Programma's */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Speciale Programma's
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '👰',
                title: 'Huwelijken',
                desc: 'Begeleiding bij nikah ceremonies en islamitische huwelijken in de moskee.'
              },
              {
                icon: '🤲',
                title: 'Janazah Diensten',
                desc: 'Ondersteuning bij begrafenisrituelen volgens islamitische tradities.'
              },
              {
                icon: '👶',
                title: 'Aqiqah Ceremonies',
                desc: 'Viering van geboorte volgens Sunnah met gemeenschap.'
              },
              {
                icon: '💼',
                title: 'Workshops',
                desc: 'Regelmatige workshops over actuele islamitische onderwerpen.'
              },
              {
                icon: '🎤',
                title: 'Gastlezingen',
                desc: 'Lezingen door gerespecteerde geleerden en sprekers.'
              },
              {
                icon: '🤝',
                title: 'Gemeenschapsbijeenkomsten',
                desc: 'Sociale evenementen om de gemeenschap te versterken.'
              }
            ].map((program, idx) => (
              <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1 text-center">
                <div className="text-5xl mb-3">{program.icon}</div>
                <h3 className="text-lg font-bold mb-2">{program.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educatieve Cursussen */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Educatie & Cursussen
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📖', title: 'Koran Lezen', level: 'Alle Niveaus' },
              { icon: '🎯', title: 'Tajweed', level: 'Beginners & Gevorderd' },
              { icon: '✍️', title: 'Arabisch', level: 'Taal & Grammatica' },
              { icon: '🕋', title: 'Fiqh', level: 'Islamitisch Recht' },
              { icon: '📚', title: 'Hadith Studies', level: 'Gevorderden' },
              { icon: '🌟', title: 'Aqidah', level: 'Geloof & Overtuiging' },
              { icon: '💭', title: 'Tafsir', level: 'Koran Uitleg' },
              { icon: '❤️', title: 'Sirah', level: 'Leven van de Profeet' }
            ].map((course, idx) => (
              <div key={idx} className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-primary/50 transition-colors text-center">
                <div className="text-4xl mb-3">{course.icon}</div>
                <h3 className="font-bold mb-1">{course.title}</h3>
                <p className="text-xs text-primary">{course.level}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-block bg-primary/10 border border-primary/30 rounded-xl p-6">
              <p className="text-zinc-300 mb-4">
                <strong className="text-primary">Geïnteresseerd?</strong> Neem contact op voor meer informatie over inschrijving en roosters.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                <span>📧</span>
                <span>Neem Contact Op</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)] text-center">
          <div className="bg-gradient-to-br from-primary/10 to-emerald-900/10 border border-zinc-800 rounded-2xl p-10">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Doe Mee!</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
              Al onze activiteiten zijn gratis en open voor alle leden van de gemeenschap. 
              Kom langs en word onderdeel van onze diverse en warme gemeenschap!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/gebedstijden"
                className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                <span>🕌</span>
                <span>Bekijk Gebedstijden</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-bold border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all duration-300"
              >
                <span>📍</span>
                <span>Locatie & Contact</span>
              </Link>
            </div>
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
