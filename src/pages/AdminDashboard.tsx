import { useState } from "react";
import AdminReflections from "./AdminReflections";
import AdminEvents from "./AdminEvents";

export default function AdminDashboard() {
  const [tab, setTab] = useState<'reflections' | 'events'>('reflections');
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_PASS = "admin2025";

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === ADMIN_PASS) setIsAdmin(true);
    else alert("Sai mật khẩu!");
  }

  if (!isAdmin) {
    return (
      <section className="container-xl py-12 max-w-md mx-auto">
        <h1 className="h1 mb-4">Đăng nhập Admin</h1>
        <form onSubmit={handleLogin} className="card grid gap-4">
          <input
            type="password"
            placeholder="Mật khẩu admin"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400"
          />
          <button className="btn btn-primary">Đăng nhập</button>
        </form>
      </section>
    );
  }

  return (
    <section className="container-xl py-12">
      <h1 className="h1 mb-6">Quản trị Website</h1>
      <div className="mb-6 flex gap-4">
        <button
          className={`btn ${tab === 'reflections' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('reflections')}
        >
          Quản lý Phúc Âm
        </button>
        <button
          className={`btn ${tab === 'events' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('events')}
        >
          Quản lý Sự kiện
        </button>
      </div>
      {tab === 'reflections' && <AdminReflections isAdmin />}
      {tab === 'events' && <AdminEvents isAdmin />}
    </section>
  );
}
