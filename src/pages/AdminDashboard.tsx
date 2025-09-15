import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import AdminReflections from "./AdminReflections";
import AdminEvents from "./AdminEvents";
import AdminGallery from "./AdminGallery";
// No routing deps needed while auth is disabled

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [view, setView] = useState<'reflections' | 'events' | 'gallery'>('reflections');
  // Auth removed; always show admin tools. Use with care.

  return (
    <section className="container-xl py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="h1">{t('admin.dashboard')}</h1>
        <div className="text-sm text-slate-500">Auth disabled</div>
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
