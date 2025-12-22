import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';

export default function Kennisbank() {
  const { articles, loading, error } = useArticles();

  return (
    <div>
      <Nav />
      
      <section className="border-b border-zinc-800 bg-gradient-to-b from-emerald-900/10 to-transparent">
        <div className="mx-auto w-[min(1100px,92%)] text-center py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-extrabold">Kennisbank</h1>
          <p className="text-zinc-300 max-w-2xl mx-auto mt-2">
            Ontdek artikelen over Islam, gebed, Ramadan en meer
          </p>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="mx-auto w-[min(1100px,92%)]">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-zinc-400">Artikelen laden...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-400">
                Er is een fout opgetreden: {error}
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                Controleer of Supabase correct is geconfigureerd in .env
              </p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400">Nog geen artikelen beschikbaar.</p>
              <p className="text-sm text-zinc-500 mt-2">
                Voeg artikelen toe via Supabase dashboard of bouw een admin panel.
              </p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/kennisbank/${article.slug}`}
                  className="bg-[#141414] border border-zinc-800 rounded-xl overflow-hidden hover:border-primary transition-colors group"
                >
                  {article.image_url && (
                    <div className="aspect-video overflow-hidden bg-zinc-900">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {article.category}
                      </span>
                    )}
                    <h3 className="text-xl font-bold mt-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-zinc-400 mt-2 text-sm line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                      {article.author && <span>Door {article.author}</span>}
                      {article.published_at && (
                        <span>
                          {new Date(article.published_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)] flex flex-wrap items-center justify-between gap-3 py-4">
          <p>&copy; {new Date().getFullYear()} {MOSQUE.name}. Alle rechten voorbehouden.</p>
          <div className="flex gap-3 text-zinc-400">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to="/kennisbank">Kennisbank</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
