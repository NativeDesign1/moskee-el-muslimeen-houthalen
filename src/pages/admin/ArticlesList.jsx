import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import AdminLayout from './AdminLayout';

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  async function fetchArticles() {
    try {
      setLoading(true);
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'published') {
        query = query.eq('is_published', true);
      } else if (filter === 'draft') {
        query = query.eq('is_published', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id) {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Fout bij het verwijderen van artikel');
    }
  }

  async function togglePublish(article) {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ 
          is_published: !article.is_published,
          published_at: !article.is_published ? new Date().toISOString() : article.published_at
        })
        .eq('id', article.id);

      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error updating article:', error);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Kennisbank Artikelen</h2>
            <p className="text-zinc-400">Beheer alle artikelen van de kennisbank</p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-amber-400 text-black font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            <span>+</span>
            <span>Nieuw Artikel</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'published', label: 'Gepubliceerd' },
            { value: 'draft', label: 'Concepten' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-zinc-400 mb-4">Geen artikelen gevonden</p>
            <Link
              to="/admin/articles/new"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <span>+</span>
              <span>Maak je eerste artikel</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${article.is_published ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <h3 className="text-xl font-bold">{article.title}</h3>
                      {article.category && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                      )}
                    </div>
                    {article.excerpt && (
                      <p className="text-zinc-400 text-sm mb-3">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>📝 {article.author || 'Onbekend'}</span>
                      <span>📅 {new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
                      <span>🔗 /{article.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(article)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        article.is_published
                          ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                          : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      }`}
                    >
                      {article.is_published ? '👁️ Verbergen' : '✅ Publiceren'}
                    </button>
                    <Link
                      to={`/admin/articles/${article.id}`}
                      className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      ✏️ Bewerken
                    </Link>
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
