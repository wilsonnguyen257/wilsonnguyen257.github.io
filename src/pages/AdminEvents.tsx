import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { getJson, saveJson } from '../lib/storage';
import { logAuditAction } from '../lib/audit';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import VisualEditor from '../components/VisualEditor';
import type { Event } from '../types/content';

export default function AdminEvents() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    date: new Date().toISOString().split('T')[0],
    time: '5:00 PM',
    location: '',
    contentVi: '',
    contentEn: '',
    thumbnail: '',
  });

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await getJson<Event[]>('events');
    setEvents(data || []);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nameVi: '',
      nameEn: '',
      date: new Date().toISOString().split('T')[0],
      time: '5:00 PM',
      location: '',
      contentVi: '',
      contentEn: '',
      thumbnail: '',
    });
    setEditingId(null);
  };

  // Edit event
  const handleEdit = (e: Event) => {
    setFormData({
      nameVi: e.name.vi,
      nameEn: e.name.en,
      date: e.date,
      time: e.time,
      location: e.location,
      contentVi: e.content?.vi || '',
      contentEn: e.content?.en || '',
      thumbnail: e.thumbnail || '',
    });
    setEditingId(e.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upload image
  const handleImageUpload = async (file: File) => {
    if (!IS_FIREBASE_CONFIGURED || !fbStorage) return '';
    
    setUploading(true);
    try {
      const filename = `event-thumbnails/${uuidv4()}-${file.name}`;
      const storageRef = ref(fbStorage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
      return '';
    } finally {
      setUploading(false);
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    const event: Event = editingId
      ? {
          ...events.find(e => e.id === editingId)!,
          name: { vi: formData.nameVi, en: formData.nameEn },
          date: formData.date,
          time: formData.time,
          location: formData.location,
          content: { vi: formData.contentVi, en: formData.contentEn },
          thumbnail: formData.thumbnail,
        }
      : {
          id: uuidv4(),
          name: { vi: formData.nameVi, en: formData.nameEn },
          date: formData.date,
          time: formData.time,
          location: formData.location,
          content: { vi: formData.contentVi, en: formData.contentEn },
          thumbnail: formData.thumbnail,
          status: 'published',
        };

    const updated = editingId
      ? events.map(e => e.id === editingId ? event : e)
      : [...events, event];

    await saveJson('events', updated);
    await logAuditAction(editingId ? 'event.update' : 'event.create', { id: event.id });
    resetForm();
    loadEvents();
  };

  // Delete event
  const handleDelete = async (id: string) => {
    if (!confirm(language === 'vi' ? 'Xóa sự kiện?' : 'Delete event?')) return;
    
    const event = events.find(e => e.id === id);
    if (event?.thumbnail && IS_FIREBASE_CONFIGURED && fbStorage) {
      try {
        const fileRef = ref(fbStorage, event.thumbnail);
        await deleteObject(fileRef);
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }

    const updated = events.filter(e => e.id !== id);
    await saveJson('events', updated);
    await logAuditAction('event.delete', { id });
    loadEvents();
  };

  return (
    <div className="container-xl py-8">
      <h1 className="text-3xl font-bold mb-8">
        {language === 'vi' ? 'Quản Lý Sự Kiện' : 'Manage Events'}
      </h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? (language === 'vi' ? 'Sửa' : 'Edit') : (language === 'vi' ? 'Thêm Mới' : 'Add New')}
        </h2>
        
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder={language === 'vi' ? 'Tên (VI)' : 'Name (Vietnamese)'}
              value={formData.nameVi}
              onChange={e => setFormData({ ...formData, nameVi: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder={language === 'vi' ? 'Tên (EN)' : 'Name (English)'}
              value={formData.nameEn}
              onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="5:00 PM"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder={language === 'vi' ? 'Địa điểm' : 'Location'}
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'vi' ? 'Mô tả (VI)' : 'Description (Vietnamese)'}
              </label>
              <VisualEditor
                value={formData.contentVi}
                onChange={(value) => setFormData({ ...formData, contentVi: value })}
                placeholder={language === 'vi' ? 'Nhập mô tả...' : 'Enter description...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'vi' ? 'Mô tả (EN)' : 'Description (English)'}
              </label>
              <VisualEditor
                value={formData.contentEn}
                onChange={(value) => setFormData({ ...formData, contentEn: value })}
                placeholder={language === 'vi' ? 'Nhập mô tả...' : 'Enter description...'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'vi' ? 'Hình ảnh' : 'Image'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleImageUpload(file);
                  if (url) setFormData({ ...formData, thumbnail: url });
                }
              }}
              className="border rounded px-3 py-2 w-full"
              disabled={uploading}
            />
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="Preview" className="mt-2 h-32 rounded" />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (language === 'vi' ? 'Đang tải...' : 'Uploading...') : (language === 'vi' ? 'Lưu' : 'Save')}
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
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Sự kiện' : 'Event'}</th>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Ngày' : 'Date'}</th>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Giờ' : 'Time'}</th>
              <th className="px-4 py-3 text-left">{language === 'vi' ? 'Địa điểm' : 'Location'}</th>
              <th className="px-4 py-3 text-right">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {e.thumbnail && (
                      <img src={e.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                    )}
                    <span>{e.name.vi || e.name.en}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3">{e.time}</td>
                <td className="px-4 py-3">{e.location}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    {language === 'vi' ? 'Sửa' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
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
