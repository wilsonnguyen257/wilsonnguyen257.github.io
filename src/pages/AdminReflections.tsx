import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson, saveJson } from '../lib/storage';
import { logAuditAction } from '../lib/audit';
import VisualEditor from '../components/VisualEditor';
import type { Reflection } from '../types/content';

export default function AdminReflections() {
  const { language } = useLanguage();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titleVi: '',
    titleEn: '',
    contentVi: '',
    contentEn: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load reflections
  useEffect(() => {
    const unsubscribe = subscribeJson<Reflection[]>('reflections', (data) => {
      setReflections(data || []);
    });
    return unsubscribe;
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      titleVi: '',
      titleEn: '',
      contentVi: '',
      contentEn: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  // Edit reflection
  const handleEdit = (r: Reflection) => {
    setFormData({
      titleVi: r.title.vi,
      titleEn: r.title.en,
      contentVi: r.content.vi,
      contentEn: r.content.en,
      author: r.author,
      date: r.date,
    });
    setEditingId(r.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save (create or update)
  const handleSave = async () => {
    const reflection: Reflection = editingId
      ? {
          ...reflections.find(r => r.id === editingId)!,
          title: { vi: formData.titleVi, en: formData.titleEn },
          content: { vi: formData.contentVi, en: formData.contentEn },
          author: formData.author,
          date: formData.date,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: uuidv4(),
          title: { vi: formData.titleVi, en: formData.titleEn },
          content: { vi: formData.contentVi, en: formData.contentEn },
          author: formData.author,
          date: formData.date,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const updated = editingId
      ? reflections.map(r => r.id === editingId ? reflection : r)
      : [...reflections, reflection];

    await saveJson('reflections', updated);
    await logAuditAction(editingId ? 'reflection.update' : 'reflection.create', { id: reflection.id });
    resetForm();
  };

  // Delete reflection
  const handleDelete = async (id: string) => {
    if (!confirm(language === 'vi' ? 'Xóa bài suy niệm?' : 'Delete reflection?')) return;
    const updated = reflections.filter(r => r.id !== id);
    await saveJson('reflections', updated);
    await logAuditAction('reflection.delete', { id });
  };

  return (
    <div className="container-xl py-8">
      <h1 className="text-3xl font-bold mb-8">
        {language === 'vi' ? 'Quản Lý Suy Niệm' : 'Manage Reflections'}
      </h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? (language === 'vi' ? 'Sửa' : 'Edit') : (language === 'vi' ? 'Thêm Mới' : 'Add New')}
        </h2>
        
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder={language === 'vi' ? 'Tiêu đề (VI)' : 'Title (Vietnamese)'}
              value={formData.titleVi}
              onChange={e => setFormData({ ...formData, titleVi: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder={language === 'vi' ? 'Tiêu đề (EN)' : 'Title (English)'}
              value={formData.titleEn}
              onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'vi' ? 'Nội dung (VI)' : 'Content (Vietnamese)'}
              </label>
              <VisualEditor
                value={formData.contentVi}
                onChange={(value) => setFormData({ ...formData, contentVi: value })}
                placeholder={language === 'vi' ? 'Nhập nội dung...' : 'Enter content...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'vi' ? 'Nội dung (EN)' : 'Content (English)'}
              </label>
              <VisualEditor
                value={formData.contentEn}
                onChange={(value) => setFormData({ ...formData, contentEn: value })}
                placeholder={language === 'vi' ? 'Nhập nội dung...' : 'Enter content...'}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder={language === 'vi' ? 'Tác giả' : 'Author'}
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {language === 'vi' ? 'Lưu' : 'Save'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Tiêu đề' : 'Title'}</th>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Ngày' : 'Date'}</th>
              <th className="px-4 py-3 text-right">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {reflections.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.title.vi || r.title.en}</td>
                <td className="px-4 py-3">{r.author}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(r)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    {language === 'vi' ? 'Sửa' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:underline"
                  >
                    {language === 'vi' ? 'Xóa' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
