import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Ongeldige inloggegevens. Controleer je email en wachtwoord.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-24 mx-auto rounded-full border-2 border-primary/50 mb-4"
            style={{ boxShadow: "0 0 40px rgba(199, 168, 31, 0.3)" }}
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-zinc-400 mt-2">Log in om het dashboard te beheren</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="admin@moskee.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-amber-400 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              Geen account? Neem contact op met de beheerder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
