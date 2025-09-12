import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import AdminReflections from "./AdminReflections";
import AdminEvents from "./AdminEvents";
import AdminGallery from "./AdminGallery";
import { useNavigate, useLocation } from "react-router-dom";
import { login, logout, onAuthStateChanged } from "../lib/firebase";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'reflections' | 'events' | 'gallery'>('reflections');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  useEffect(() => {
    console.log('AdminDashboard: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged((user) => {
      console.log('AdminDashboard: Auth state changed, user:', user?.email);
      setIsAdmin(!!user && user.email === import.meta.env.VITE_ADMIN_EMAIL);
      setLoading(false);
    });

    return () => {
      console.log('AdminDashboard: Cleaning up auth state listener');
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    console.log('AdminDashboard: Login form submitted');
    
    try {
      console.log('AdminDashboard: Calling login function');
      const result = await login(email, password);
      console.log('AdminDashboard: Login result:', result);
      
      if (!result.success) {
        console.log('AdminDashboard: Login failed:', result.error);
        setError(result.error || "Đăng nhập thất bại");
      } else {
        console.log('AdminDashboard: Login successful, navigating to /admin');
        navigate('/admin');
      }
    } catch (err) {
      console.error('AdminDashboard: Login error:', err);
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
    }
  }

  if (loading) {
    console.log('AdminDashboard: Rendering loading state');
    return (
      <section className="container-xl py-12 max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Đang kiểm tra đăng nhập...</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Debug: Loading auth state...</p>
          <p>isAdmin: {String(isAdmin)}</p>
          <p>Current path: {location.pathname}</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    console.log('Rendering login form. isAdmin:', isAdmin, 'loading:', loading);
    return (
      <section className="container-xl py-12 max-w-md mx-auto">
        <h1 className="h1 mb-4 text-center">{t('admin.login')}</h1>
        <form onSubmit={handleLogin} className="card grid gap-4 p-6">
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Debug Info:</strong> {isAdmin ? 'Logged in' : 'Not logged in'}
              <br />
              Path: {location.pathname}
            </p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-400"
          >
            {t('login')}
          </button>
        </form>
      </section>
    );
  }

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      const result = await logout();
      console.log('Logout result:', result);
      if (result.success) {
        // Clear any local state
        setEmail('');
        setPassword('');
        setIsAdmin(false);
        // Force a hard redirect to clear any cached state
        window.location.href = '/admin';
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <section className="container-xl py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="h1">{t('admin.dashboard')}</h1>
        <button 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l6.293 6.293a1 1 0 101.414-1.414L5.414 4H17a1 1 0 100-2H3z" clipRule="evenodd" />
          </svg>
          {t('admin.logout')}
        </button>
      </div>
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('reflections')}
          className={`btn ${view === 'reflections' ? 'btn-primary' : 'btn-outline'}`}
        >
          {t('admin.manage_reflections')}
        </button>
        <button
          onClick={() => setView('events')}
          className={`btn ${view === 'events' ? 'btn-primary' : 'btn-outline'}`}
        >
          {t('admin.manage_events')}
        </button>
        <button
          onClick={() => setView('gallery')}
          className={`btn ${view === 'gallery' ? 'btn-primary' : 'btn-outline'}`}
        >
          {t('admin.manage_gallery')}
        </button>
      </div>
      {view === 'reflections' ? <AdminReflections /> : view === 'events' ? <AdminEvents /> : <AdminGallery />}
    </section>
  );
}
