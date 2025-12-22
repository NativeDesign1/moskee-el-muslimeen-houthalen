import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useArticles } from '../../hooks/useArticles';

export default function AdminDashboard() {
  const { articles } = useArticles();

  const stats = [
    {
      title: 'Totaal Artikelen',
      value: articles.length,
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/articles'
    },
    {
      title: 'Gepubliceerd',
      value: articles.filter(a => a.is_published).length,
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      link: '/admin/articles'
    },
    {
      title: 'Concepten',
      value: articles.filter(a => !a.is_published).length,
      icon: '📝',
      color: 'from-yellow-500 to-orange-500',
      link: '/admin/articles'
    },
    {
      title: 'Activiteiten',
      value: '12',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      link: '/admin/activities'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welkom Terug! 👋</h2>
          <p className="text-zinc-400">Beheer je moskee website vanaf één plek</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Link
              key={idx}
              to={stat.link}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.title}</div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold mb-4">Snelle Acties</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/admin/articles/new"
              className="bg-gradient-to-br from-primary/10 to-amber-900/10 border border-primary/30 rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">📝</div>
              <div className="font-bold mb-1">Nieuw Artikel</div>
              <div className="text-sm text-zinc-400">Voeg een artikel toe aan de kennisbank</div>
            </Link>
            
            <Link
              to="/admin/activities"
              className="bg-gradient-to-br from-emerald-900/10 to-cyan-900/10 border border-emerald-800/30 rounded-xl p-6 hover:border-emerald-500 transition-colors"
            >
              <div className="text-3xl mb-3">🎯</div>
              <div className="font-bold mb-1">Beheer Activiteiten</div>
              <div className="text-sm text-zinc-400">Wijzig of voeg activiteiten toe</div>
            </Link>

            <Link
              to="/"
              target="_blank"
              className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-800/30 rounded-xl p-6 hover:border-purple-500 transition-colors"
            >
              <div className="text-3xl mb-3">🌐</div>
              <div className="font-bold mb-1">Bekijk Website</div>
              <div className="text-sm text-zinc-400">Open de publieke website</div>
            </Link>
          </div>
        </div>

        {/* Recent Articles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recente Artikelen</h3>
            <Link to="/admin/articles" className="text-primary hover:underline text-sm">
              Bekijk alle →
            </Link>
          </div>
          <div className="space-y-3">
            {articles.slice(0, 5).map((article) => (
              <Link
                key={article.id}
                to={`/admin/articles/${article.id}`}
                className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${article.is_published ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-zinc-500">
                      {article.category} • {new Date(article.created_at).toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                </div>
                <span className="text-zinc-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
