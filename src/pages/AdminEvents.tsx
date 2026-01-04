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
  
  // Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'name', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      const filename = `events/${uuidv4()}-${file.name}`;
      const storageRef = ref(fbStorage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
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
        // ignore
      }
    }

    const updated = events.filter(e => e.id !== id);
    await saveJson('events', updated);
    await logAuditAction('event.delete', { id });
    loadEvents();
  };

  // --- Management Logic ---

  // Filter and Sort
  const filteredEvents = events
    .filter(e => {
      const searchLower = searchTerm.toLowerCase();
      return (
        e.name.vi.toLowerCase().includes(searchLower) ||
        e.name.en.toLowerCase().includes(searchLower) ||
        e.location.toLowerCase().includes(searchLower) ||
        e.date.includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else {
        const nameA = a.name.vi || a.name.en;
        const nameB = b.name.vi || b.name.en;
        return sortConfig.direction === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container-xl py-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'vi' ? 'Quản Lý Sự Kiện' : 'Manage Events'}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === 'vi' ? 'Tổng số:' : 'Total events:'} <span className="font-semibold text-brand-600">{events.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {editingId ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              )}
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? (language === 'vi' ? 'Chỉnh Sửa Sự Kiện' : 'Edit Event') : (language === 'vi' ? 'Thêm Sự Kiện Mới' : 'Add New Event')}
          </h2>
        </div>
        
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Tên (Tiếng Việt)' : 'Name (Vietnamese)'}
              </label>
              <input
                placeholder={language === 'vi' ? 'Nhập tên sự kiện...' : 'Enter event name...'}
                value={formData.nameVi}
                onChange={e => setFormData({ ...formData, nameVi: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Tên (Tiếng Anh)' : 'Name (English)'}
              </label>
              <input
                placeholder={language === 'vi' ? 'Nhập tên sự kiện...' : 'Enter event name...'}
                value={formData.nameEn}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Ngày' : 'Date'}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Giờ' : 'Time'}
              </label>
              <input
                placeholder="e.g. 5:00 PM"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Địa điểm' : 'Location'}
              </label>
              <div className="relative">
                <input
                  placeholder={language === 'vi' ? 'Nhập địa điểm...' : 'Enter location...'}
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Mô tả (Tiếng Việt)' : 'Description (Vietnamese)'}
              </label>
              <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <VisualEditor
                  value={formData.contentVi}
                  onChange={(value) => setFormData({ ...formData, contentVi: value })}
                  placeholder={language === 'vi' ? 'Nhập mô tả chi tiết...' : 'Enter detailed description...'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Mô tả (Tiếng Anh)' : 'Description (English)'}
              </label>
              <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <VisualEditor
                  value={formData.contentEn}
                  onChange={(value) => setFormData({ ...formData, contentEn: value })}
                  placeholder={language === 'vi' ? 'Nhập mô tả chi tiết...' : 'Enter detailed description...'}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'vi' ? 'Hình ảnh' : 'Image'}
            </label>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{language === 'vi' ? 'Nhấn để tải lên' : 'Click to upload'}</span>
                    </p>
                  </div>
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
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {formData.thumbnail && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md group">
                  <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {editingId && (
              <button
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'vi' ? 'Hủy Bỏ' : 'Cancel'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {language === 'vi' ? 'Đang tải...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingId ? (language === 'vi' ? 'Cập Nhật' : 'Update Event') : (language === 'vi' ? 'Lưu Sự Kiện' : 'Save Event')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto ml-auto">
              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <input 
                    placeholder={language === 'vi' ? 'Tìm kiếm sự kiện...' : 'Search events...'}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Sort */}
              <select 
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onChange={e => {
                      const [key, direction] = e.target.value.split('-');
                      setSortConfig({ key: key as 'date'|'name', direction: direction as 'asc'|'desc' });
                  }}
                  className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer w-full sm:w-auto"
              >
                  <option value="date-desc">{language === 'vi' ? 'Mới nhất' : 'Newest First'}</option>
                  <option value="date-asc">{language === 'vi' ? 'Cũ nhất' : 'Oldest First'}</option>
                  <option value="name-asc">{language === 'vi' ? 'Tên (A-Z)' : 'Name (A-Z)'}</option>
              </select>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                {paginatedEvents.map(e => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        {e.thumbnail && (
                        <img src={e.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                        )}
                        <span className="font-medium text-gray-900">{e.name.vi || e.name.en}</span>
                    </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{e.time}</td>
                    <td className="px-4 py-3 text-gray-500">{e.location}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                    </button>
                    <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                    >
                        {language === 'vi' ? 'Xóa' : 'Delete'}
                    </button>
                    </td>
                </tr>
                ))}
                {paginatedEvents.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            {language === 'vi' ? 'Không tìm thấy sự kiện nào' : 'No events found'}
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                    {language === 'vi' 
                        ? `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} đến ${Math.min(currentPage * itemsPerPage, filteredEvents.length)} trong số ${filteredEvents.length}`
                        : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredEvents.length)} of ${filteredEvents.length}`}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        {language === 'vi' ? 'Trước' : 'Previous'}
                    </button>
                    <span className="px-3 py-1 bg-white border rounded">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        {language === 'vi' ? 'Sau' : 'Next'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
