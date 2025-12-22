import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useArticles } from '../hooks/useArticles';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';

export default function Kennisbank() {
  const { articles, loading, error } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('alle');
  const [sortBy, setSortBy] = useState('nieuwste');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = articles.map(a => a.category).filter(Boolean);
    return ['alle', ...new Set(cats)];
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'alle') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'nieuwste') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.published_at) - new Date(a.published_at)
      );
    } else if (sortBy === 'oudste') {
      filtered = [...filtered].sort((a, b) => 
        new Date(a.published_at) - new Date(b.published_at)
      );
    } else if (sortBy === 'alfabetisch') {
      filtered = [...filtered].sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    }

    return filtered;
  }, [articles, searchTerm, selectedCategory, sortBy]);

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
          {/* Filter Section */}
          {!loading && !error && articles.length > 0 && (
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Zoek artikelen op titel of inhoud..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-2 font-medium">Categorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-primary outline-none transition-colors capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-2 font-medium">Sorteer op</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-primary outline-none transition-colors"
                  >
                    <option value="nieuwste">Nieuwste eerst</option>
                    <option value="oudste">Oudste eerst</option>
                    <option value="alfabetisch">Alfabetisch</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-zinc-400">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'artikel' : 'artikelen'} gevonden
                </p>
                {(searchTerm || selectedCategory !== 'alle') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('alle');
                    }}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Filters wissen
                  </button>
                )}
              </div>
            </div>
          )}

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

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400">
                {articles.length === 0 
                  ? 'Nog geen artikelen beschikbaar.' 
                  : 'Geen artikelen gevonden met deze filters.'}
              </p>
              {articles.length === 0 ? (
                <p className="text-sm text-zinc-500 mt-2">
                  Voeg artikelen toe via Supabase dashboard of bouw een admin panel.
                </p>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('alle');
                  }}
                  className="mt-4 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Filters wissen
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/kennisbank/${article.slug}`}
                  className="bg-[#141414] border border-zinc-800 rounded-xl overflow-hidden hover:border-primary transition-colors group"
                >
                  {article.image_url && (
                    <div className="aspect-video overflow-hidden bg-zinc-900 relative">
                      {isYouTubeUrl(article.image_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(article.image_url)}
                          title={article.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : article.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || article.image_url.includes('video') ? (
                        <video
                          src={article.image_url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
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
