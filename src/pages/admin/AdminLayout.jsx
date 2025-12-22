import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/articles', label: 'Kennisbank', icon: '📚' },
    { path: '/admin/activities', label: 'Activiteiten', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="mx-auto w-[min(1400px,96%)] flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              🛠️ Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              👤 {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm px-4 py-2 border border-zinc-700 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-zinc-800 min-h-[calc(100vh-73px)] bg-zinc-900/30">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
