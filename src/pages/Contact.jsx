import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';

export default function Contact() {
  return (
    <div>
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-emerald-900/20 via-transparent to-amber-900/20">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent">
            📍 Contact & Locatie
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-4 text-lg">
            Neem contact met ons op of kom langs voor een bezoek
          </p>
        </div>
      </section>

      {/* Contact Info & Map */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📍</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-primary">Bezoekadres</h3>
                    <p className="text-zinc-300 leading-relaxed">
                      Houthalen<br/>
                      Limburg, België
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Marokkaanse Moskee Houthalen')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline mt-3"
                    >
                      <span>Open in Google Maps</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📧</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-primary">Email</h3>
                    <a 
                      href="mailto:info@imhh.be" 
                      className="text-zinc-300 hover:text-primary transition-colors text-lg"
                    >
                      info@imhh.be
                    </a>
                    <p className="text-zinc-500 text-sm mt-2">
                      We proberen binnen 48 uur te reageren
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🕐</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-primary">Openingsuren</h3>
                    <div className="space-y-2 text-zinc-300">
                      <p>🌅 <strong>Fajr:</strong> 1 uur voor zonsopgang</p>
                      <p>☀️ <strong>Dhuhr:</strong> Dagelijks open</p>
                      <p>🌤️ <strong>Asr:</strong> Dagelijks open</p>
                      <p>🌅 <strong>Maghrib:</strong> Bij zonsondergang</p>
                      <p>🌙 <strong>Isha:</strong> Na zonsondergang</p>
                      <p className="text-primary font-semibold mt-3">
                        🕌 Vrijdaggebed (Jumu'ah): Volgens aankondiging
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏢</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-primary">Juridische Info</h3>
                    <p className="text-zinc-300">
                      <strong>Organisatie:</strong> Islamitische Moskee vzw<br/>
                      <strong>Ondernemingsnummer:</strong> BE0443.204.876
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 min-h-[600px]">
                <iframe
                  title="Moskee locatie"
                  className="w-full h-full min-h-[580px] rounded-xl"
                  src={`https://www.google.com/maps?q=${encodeURIComponent("Marokkaanse Moskee Houthalen")}&output=embed`}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Veelgestelde Vragen over Bezoek */}
      <section className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Veelgestelde Vragen
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Zijn niet-moslims welkom?',
                a: 'Ja, absoluut! Iedereen is welkom om onze moskee te bezoeken en meer te leren over Islam. We organiseren ook rondleidingen voor belangstellenden.'
              },
              {
                q: 'Moet ik me vooraf aanmelden voor een bezoek?',
                a: 'Voor de vijf dagelijkse gebeden hoef je je niet aan te melden. Voor speciale evenementen of groepsbezoeken raden we aan vooraf contact op te nemen.'
              },
              {
                q: 'Is er parkeergelegenheid?',
                a: 'Ja, er is parkeergelegenheid beschikbaar rond de moskee. Vooral op vrijdag kan het druk zijn, dus kom iets vroeger.'
              },
              {
                q: 'Welke kledingvoorschriften gelden?',
                a: 'We vragen bezoekers om respectvolle kleding te dragen. Voor vrouwen is een hoofddoek niet verplicht als bezoeker, maar wel gewaardeerd. Schoenen worden uitgetrokken bij binnenkomst.'
              },
              {
                q: 'Zijn er faciliteiten voor wudhu?',
                a: 'Ja, we hebben aparte wudhu-faciliteiten voor mannen en vrouwen beschikbaar.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors group">
                <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                  <span className="text-primary">{faq.q}</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
                </summary>
                <p className="text-zinc-400 mt-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)] text-center">
          <div className="bg-gradient-to-br from-primary/10 to-emerald-900/10 border border-zinc-800 rounded-2xl p-10">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">We Horen Graag Van Je!</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
              Heb je vragen, opmerkingen of wil je meer informatie? Neem gerust contact met ons op 
              via email of kom langs tijdens de gebedstijden.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="mailto:info@imhh.be"
                className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                <span>📧</span>
                <span>Stuur een Email</span>
              </a>
              <Link
                to="/gebedstijden"
                className="inline-flex items-center gap-2 font-bold border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all duration-300"
              >
                <span>🕌</span>
                <span>Bekijk Gebedstijden</span>
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
