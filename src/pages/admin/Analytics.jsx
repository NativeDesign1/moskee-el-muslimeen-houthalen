import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAnalytics } from '../../utils/analytics';

// Helper function to get flag emoji from country name
function getFlagEmoji(countryName) {
  const countryFlags = {
    'Belgium': '🇧🇪',
    'Netherlands': '🇳🇱',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Morocco': '🇲🇦',
    'Turkey': '🇹🇷',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Canada': '🇨🇦',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Luxembourg': '🇱🇺',
    'Poland': '🇵🇱',
    'Sweden': '🇸🇪',
    'Denmark': '🇩🇰',
    'Norway': '🇳🇴',
    'Finland': '🇫🇮',
  };
  return countryFlags[countryName] || '🌍';
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    const data = await getAnalytics();
    console.log('Analytics data:', data);
    console.log('Top Countries:', data?.topCountries);
    console.log('Top Cities:', data?.topCities);
    setStats(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-zinc-400">Statistieken laden...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-400">Fout bij laden van statistieken</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">📊 Analytics & Statistieken</h2>
          <p className="text-zinc-400">Overzicht van website bezoekers en pagina views</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Views */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-medium">Totaal Views</span>
              <span className="text-2xl">👁️</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">Alle tijd</p>
          </div>

          {/* Views Today */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">Views Vandaag</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold">{stats.viewsToday.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">Laatste 24 uur</p>
          </div>

          {/* Views This Week */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">Views Deze Week</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold">{stats.viewsThisWeek.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">Laatste 7 dagen</p>
          </div>

          {/* Views This Month */}
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-medium">Views Deze Maand</span>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold">{stats.viewsThisMonth.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">Laatste 30 dagen</p>
          </div>
        </div>

        {/* Unique Visitors Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium">Unieke Bezoekers Vandaag</span>
              <span className="text-xl">👤</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.uniqueVisitorsToday.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Gem. {stats.uniqueVisitorsToday > 0 ? (stats.viewsToday / stats.uniqueVisitorsToday).toFixed(1) : '0'} pagina's/bezoek
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium">Unieke Bezoekers Deze Week</span>
              <span className="text-xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.uniqueVisitorsWeek.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Gem. {stats.uniqueVisitorsWeek > 0 ? (stats.viewsThisWeek / stats.uniqueVisitorsWeek).toFixed(1) : '0'} pagina's/bezoek
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium">Unieke Bezoekers Deze Maand</span>
              <span className="text-xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.uniqueVisitorsMonth.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Gem. {stats.uniqueVisitorsMonth > 0 ? (stats.viewsThisMonth / stats.uniqueVisitorsMonth).toFixed(1) : '0'} pagina's/bezoek
            </p>
          </div>
        </div>

        {/* Device & Browser Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📱 Apparaat Type</h3>
            <div className="space-y-3">
              {stats.deviceBreakdown.map((item, index) => {
                const total = stats.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{item.device}</span>
                      <span className="text-sm text-zinc-400">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-amber-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browser Breakdown */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🌐 Browser</h3>
            <div className="space-y-3">
              {stats.browserBreakdown.map((item, index) => {
                const total = stats.browserBreakdown.reduce((sum, b) => sum + b.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.browser}</span>
                      <span className="text-sm text-zinc-400">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        {stats.topReferrers && stats.topReferrers.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🔗 Top Verwijzers</h3>
            <div className="space-y-2">
              {stats.topReferrers.map((ref, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-zinc-600">#{index + 1}</span>
                    <span className="font-medium text-sm">{ref.referrer}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{ref.count} bezoeken</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geographic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Countries */}
          {stats.topCountries && stats.topCountries.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">🌍 Top Landen</h3>
              <div className="space-y-3">
                {stats.topCountries.map((item, index) => {
                  const total = stats.topCountries.reduce((sum, c) => sum + c.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const flagEmoji = getFlagEmoji(item.country);
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{flagEmoji}</span>
                          <span className="text-sm font-medium">{item.country}</span>
                        </div>
                        <span className="text-sm text-zinc-400">{item.count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Cities */}
          {stats.topCities && stats.topCities.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">🏙️ Top Steden</h3>
              <div className="space-y-2">
                {stats.topCities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-zinc-600">#{index + 1}</span>
                      <span className="font-medium text-sm">{item.city}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{item.count} bezoeken</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hourly Activity */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🕐 Activiteit per Uur (Laatste 30 dagen)</h3>
          <div className="flex items-end justify-between gap-1 h-40">
            {stats.hourlyStats.map((count, hour) => {
              const maxCount = Math.max(...stats.hourlyStats);
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-zinc-800 rounded-t relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-amber-400 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count} views
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">{hour}u</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Stats Chart */}
        {stats.dailyStats && stats.dailyStats.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📅 Dagelijkse Statistieken (Laatste 30 dagen)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Datum</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Totaal Views</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Unieke Bezoekers</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Pagina's</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyStats.map((day, index) => (
                    <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        {new Date(day.date).toLocaleDateString('nl-NL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">{day.total_views}</td>
                      <td className="text-right py-3 px-4 text-zinc-400">{day.unique_visitors}</td>
                      <td className="text-right py-3 px-4 text-zinc-400">{day.pages_viewed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Popular Pages */}
        {stats.pageStats && stats.pageStats.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🔥 Populaire Pagina's</h3>
            <div className="space-y-3">
              {stats.pageStats.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{page.page_title || page.page_path}</p>
                    <p className="text-sm text-zinc-500">{page.page_path}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{page.views}</p>
                      <p className="text-xs text-zinc-500">views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-400">{page.unique_visitors}</p>
                      <p className="text-xs text-zinc-500">uniek</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
          >
            🔄 Ververs Statistieken
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
