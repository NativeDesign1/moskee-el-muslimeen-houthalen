import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import Home from './pages/Home';
import OverOns from './pages/OverOns';
import Gebedstijden from './pages/Gebedstijden';
import Kennisbank from './pages/Kennisbank';
import ArticleDetail from './pages/ArticleDetail';
import Activiteiten from './pages/Activiteiten';
import Contact from './pages/Contact';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ArticlesList from './pages/admin/ArticlesList';
import ArticleEditor from './pages/admin/ArticleEditor';
import ActivitiesManager from './pages/admin/ActivitiesManager';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/over-ons" element={<OverOns />} />
          <Route path="/gebedstijden" element={<Gebedstijden />} />
          <Route path="/kennisbank" element={<Kennisbank />} />
          <Route path="/kennisbank/:slug" element={<ArticleDetail />} />
          <Route path="/activiteiten" element={<Activiteiten />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute>
                <ArticlesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/:id"
            element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activities"
            element={
              <ProtectedRoute>
                <ActivitiesManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

