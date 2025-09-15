import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getEditToken, setEditToken, clearEditToken } from '../lib/settings';

export default function AdminSettings() {
  useLanguage();
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getEditToken();
    if (existing) setToken(existing);
  }, []);

  const handleSave = () => {
    setEditToken(token.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearEditToken();
    setToken('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
      <p className="p-muted mb-4">Set the edit token used to save data to the built-in storage API. Ask your admin for the token. Leaving it empty stores data only in this browser.</p>
      <div className="space-y-3 max-w-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Edit Token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          placeholder="Enter token"
        />
        <div className="flex gap-3 mt-2">
          <button onClick={handleSave} className="btn btn-primary">Save</button>
          <button onClick={handleClear} className="btn btn-outline">Clear</button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved</span>}
        </div>
      </div>
      <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        <p>API endpoint examples:</p>
        <ul className="list-disc ml-6">
          <li><code>/api/site-data/events</code></li>
          <li><code>/api/site-data/reflections</code></li>
          <li><code>/api/site-data/gallery</code></li>
        </ul>
      </div>
    </div>
  );
}
