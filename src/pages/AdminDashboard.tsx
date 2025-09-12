import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { login, logout, onAuthStateChanged } from "../lib/firebase";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  useEffect(() => {
    console.log('AdminDashboard: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged((user) => {
      console.log('AdminDashboard: Auth state changed, isAdmin:', !!user);
      if (user) {
        console.log('AdminDashboard: User is authenticated, setting isAdmin to true');
        setIsAdmin(true);
      } else {
        console.log('AdminDashboard: No user, redirecting to /admin');
        setIsAdmin(false);
        navigate('/admin');
      }
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
        console.log('AdminDashboard: Login successful, navigating to /admin/reflections');
        navigate('/admin/reflections');
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
        <h1 className="h1 mb-4 text-center">Đăng nhập Admin</h1>
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
              className="w-full rounded-xl border border-slate-300 p-2 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400"
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
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full py-2 px-4 rounded-xl"
            disabled={!email || !password}
          >
            Đăng nhập
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
        <h1 className="h1">Quản trị Website</h1>
        <button 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l6.293 6.293a1 1 0 101.414-1.414L5.414 4H17a1 1 0 100-2H3z" clipRule="evenodd" />
          </svg>
          Đăng xuất
        </button>
      </div>
      <div className="mb-6 flex gap-4">
        <Link
          to="/admin/reflections"
          className={`btn ${location.pathname.includes('reflections') ? 'btn-primary' : 'btn-outline'}`}
        >
          Quản lý Phúc Âm
        </Link>
        <Link
          to="/admin/events"
          className={`btn ${location.pathname.includes('events') ? 'btn-primary' : 'btn-outline'}`}
        >
          Quản lý Sự kiện
        </Link>
      </div>
      <Outlet />
    </section>
  );
}
