import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import logo from "../assets/logo.png";
import { usePrayerTimes } from "../hooks/usePrayerTimes.js";
import { useArticles } from "../hooks/useArticles.js";
import { MOSQUE, DONATION_LINKS } from "../config.js";

export default function Home() {
  const {
    method, setMethod, madhhab, setMadhhab,
    rows, loading, error, meta, METHODS
  } = usePrayerTimes();
  
  const { articles } = useArticles();

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

      {/* Hero Section - Levendig en Modern */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-amber-900/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="relative mx-auto w-[min(1100px,92%)] text-center py-16 md:py-24">
          {/* Logo met Glow Effect */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <img
              src={logo}
              alt="Logo Marokkaanse Moskee Houthalen"
              className="relative mx-auto w-[min(180px,24vw)] h-[min(180px,24vw)] object-contain rounded-full border-2 border-primary/50 shadow-2xl backdrop-blur"
              style={{ boxShadow: "0 0 80px rgba(199, 168, 31, 0.4), 0 0 40px rgba(199, 168, 31, 0.3)" }}
            />
          </div>

          {/* Title met Gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mt-8 bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
            {MOSQUE.name}
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mt-4 leading-relaxed">
            ✨ Een warme gemeenschap waar geloof, kennis en verbinding samenkomen
          </p>

          {/* CTA Buttons met nieuwe styling */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/gebedstijden"
              className="group inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <span>🕌</span>
              <span>Gebedstijden</span>
            </Link>
            <Link
              to="/kennisbank"
              className="group inline-flex items-center gap-2 font-bold border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all duration-300"
            >
              <span>📚</span>
              <span>Kennisbank</span>
            </Link>
            <Link
              to="/activiteiten"
              className="inline-flex items-center gap-2 font-bold border-2 border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-xl hover:bg-emerald-900/30 hover:border-emerald-400 transition-all duration-300"
            >
              <span>🎯</span>
              <span>Activiteiten</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-2">🕌</div>
              <div className="text-2xl font-bold text-primary">5×</div>
              <div className="text-sm text-zinc-400">Dagelijkse gebeden</div>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-2">📖</div>
              <div className="text-2xl font-bold text-primary">{articles.length}+</div>
              <div className="text-sm text-zinc-400">Kennisbank artikelen</div>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-sm text-zinc-400">Gemeenschap</div>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-2">🌙</div>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-zinc-400">Open voor gebed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Over Ons - Verbeterd */}
      <section id="welkom" className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Over Onze Moskee
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-zinc-300 text-lg leading-relaxed">
                Welkom bij de {MOSQUE.name}, een warme plek voor gebed, kennis en gemeenschap in het hart van {MOSQUE.city}.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Onze moskee staat open voor alle moslims en belangstellenden. We organiseren dagelijkse gebeden, 
                vrijdagdiensten, educatieve programma&apos;s en gemeenschapsactiviteiten.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800 px-4 py-2 rounded-lg">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm font-medium">Dagelijkse gebeden</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800 px-4 py-2 rounded-lg">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm font-medium">Vrijdagdiensten</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800 px-4 py-2 rounded-lg">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm font-medium">Educatie & Lessen</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-emerald-900/10 border border-zinc-800 rounded-2xl p-8 backdrop-blur">
                <div className="text-6xl mb-4 text-center">🕌</div>
                <h3 className="text-xl font-bold text-center mb-4">Onze Missie</h3>
                <p className="text-zinc-400 text-center">
                  Het bevorderen van islamitische kennis, gemeenschapsbinding en spirituele groei in een inclusieve en gastvrije omgeving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Laatste Artikelen - NIEUW */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              📚 Kennisbank
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
            <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
              Ontdek artikelen over Islam, gebed, Ramadan en meer
            </p>
          </div>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.slice(0, 3).map((article) => (
                  <Link
                    key={article.id}
                    to={`/kennisbank/${article.slug}`}
                    className="group bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                  >
                    {article.image_url && (
                      <div className="aspect-video overflow-hidden bg-zinc-900 relative">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        {article.category && (
                          <span className="absolute top-3 left-3 text-xs font-bold text-black bg-primary px-3 py-1 rounded-full uppercase tracking-wide">
                            {article.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-zinc-400 mt-3 text-sm line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                        {article.author && (
                          <span className="text-xs text-zinc-500">📝 {article.author}</span>
                        )}
                        <span className="text-xs text-primary font-semibold group-hover:underline">
                          Lees meer →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/kennisbank"
                  className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-amber-400 text-black px-8 py-3 rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
                >
                  <span>Bekijk alle artikelen</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-zinc-400">Binnenkort beschikbaar...</p>
              <p className="text-sm text-zinc-500 mt-2">We werken aan interessante artikelen voor jullie</p>
            </div>
          )}
        </div>
      </section>

      {/* Gebedstijden met betere styling */}
      <section id="gebedstijden" className="py-12 md:py-16 bg-[#0a0a0a] border-y border-zinc-800">
  <div className="mx-auto w-[min(1100px,92%)]">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
        🕌 Gebedstijden
      </h2>
      <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
      {meta && (
        <p className="text-zinc-400 text-sm mt-3">
          {meta.readable} • Hijri: {meta.hijri.date}
        </p>
      )}
    </div>

    <div className="overflow-hidden mt-4 rounded-lg border border-zinc-800 hidden md:block bg-[#141414]">
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
    <div className="mt-4 rounded-lg border border-zinc-800 bg-[#141414] overflow-hidden md:hidden">
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

    <p className="text-xs text-zinc-500 mt-2">
      Tijden via Aladhan API. Controleer lokaal en pas zo nodig aan.
    </p>
  </div>
</section>

      {/* Doneren - Verbeterd */}
      <section id="doneren" className="py-12 md:py-16 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">
              💝 Steun Onze Moskee
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-primary mx-auto mt-3 rounded-full"></div>
            <p className="text-zinc-300 mt-4 max-w-2xl mx-auto leading-relaxed">
              Jouw bijdrage helpt ons om de moskee te onderhouden, educatieve programma&apos;s te organiseren en onze gemeenschap te versterken.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-900/20 to-amber-900/20 border border-emerald-800/50 rounded-2xl p-8 backdrop-blur">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-4xl">🕌</span>
                <span className="text-4xl">❤️</span>
                <span className="text-4xl">🤲</span>
              </div>
              
              <p className="text-center text-zinc-400 mb-6">Kies een bedrag:</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[5,10,20].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => openDonate("fixed", amt)}
                    className="group relative overflow-hidden font-bold bg-gradient-to-br from-primary to-amber-400 text-black px-6 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="text-2xl font-extrabold">€{amt}</div>
                      <div className="text-xs opacity-80">per maand</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => openDonate("custom")}
                className="w-full font-bold border-2 border-emerald-500/50 text-emerald-400 px-6 py-4 rounded-xl hover:bg-emerald-900/30 hover:border-emerald-400 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Kies je eigen bedrag</span>
                <span>→</span>
              </button>

              <p className="text-xs text-zinc-500 text-center mt-6">
                🔒 Veilig en betrouwbaar via Stripe • Eenmalig of maandelijks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact - Verbeterd */}
      <section id="contact" className="py-12 md:py-16 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              📍 Bezoek Ons
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📍</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Adres</h3>
                    <p className="text-zinc-400">Houthalen, Limburg, België</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <a className="text-primary hover:underline" href="mailto:info@imhh.be">
                      info@imhh.be
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏢</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Ondernemingsnummer</h3>
                    <p className="text-zinc-400">BE0443.204.876</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🕐</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Openingsuren</h3>
                    <p className="text-zinc-400">
                      Dagelijks geopend voor de vijf gebeden<br/>
                      <span className="text-primary font-semibold">Jumu&apos;ah</span> volgens aankondiging
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 h-full min-h-[500px]">
              <iframe
                title="Moskee locatie"
                className="w-full h-full rounded-xl"
                src={`https://www.google.com/maps?q=${encodeURIComponent("Marokkaanse Moskee Houthalen")}&output=embed`}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Verbeterd */}
      <footer className="border-t border-zinc-800 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto w-[min(1100px,92%)] py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Column 1 */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Over Ons</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {MOSQUE.name} - Een warme gemeenschap voor gebed, kennis en verbinding.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Snelle Links</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/">Home</Link>
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/over-ons">Over Ons</Link>
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/gebedstijden">Gebedstijden</Link>
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/kennisbank">Kennisbank</Link>
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/activiteiten">Activiteiten</Link>
                <Link className="text-zinc-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Contact</h3>
              <div className="flex flex-col gap-2 text-sm text-zinc-400">
                <p>📍 Houthalen, België</p>
                <a href="mailto:info@imhh.be" className="hover:text-primary transition-colors">
                  📧 info@imhh.be
                </a>
                <p>🕌 Dagelijks open</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} {MOSQUE.name}. Alle rechten voorbehouden.
            </p>
            <p className="text-xs text-zinc-600">
              Made with ❤️ for our community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
