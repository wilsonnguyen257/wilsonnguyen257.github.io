import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, login, logout } from "../firebase";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Đăng nhập thất bại");
    }
  }

  if (loading) {
    return (
      <section className="container-xl py-12 max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Đang kiểm tra đăng nhập...</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="container-xl py-12 max-w-md mx-auto">
        <h1 className="h1 mb-4 text-center">Đăng nhập Admin</h1>
        <form onSubmit={handleLogin} className="card grid gap-4 p-6">
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

  return (
    <section className="container-xl py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="h1">Quản trị Website</h1>
        <button 
          onClick={async () => {
            await logout();
            window.location.href = '/admin';
          }}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l6.293 6.293a1 1 0 101.414-1.414L5.414 4H17a1 1 0 100-2H3z" clipRule="evenodd" />
          </svg>
          Đăng xuất
        </button>
      </div>
      <div className="mb-6 flex gap-4">
        <a
          href="/admin/reflections"
          className={`btn ${window.location.pathname.includes('reflections') ? 'btn-primary' : 'btn-outline'}`}
        >
          Quản lý Phúc Âm
        </a>
        <a
          href="/admin/events"
          className={`btn ${window.location.pathname.includes('events') ? 'btn-primary' : 'btn-outline'}`}
        >
          Quản lý Sự kiện
        </a>
      </div>
      <Outlet />
    </section>
  );
}
