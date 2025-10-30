import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import type { Event } from '../types/content';
import { getJson, saveJson } from '../lib/storage';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import VisualEditor from '../components/VisualEditor';

const AdminEvents = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize with current date
  const today = new Date();
  const initialYear = today.getFullYear().toString();
  const initialMonth = (today.getMonth() + 1).toString();
  const initialDay = today.getDate().toString();
  const initialDate = `${initialYear}-${initialMonth.padStart(2, '0')}-${initialDay.padStart(2, '0')}`;
  
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    date: initialDate,
    time: '5:00 PM', // Initialize with default time
    location: '',
    contentVi: '',
    contentEn: ''
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [timeComponents, setTimeComponents] = useState({
    hour: '5',
    minute: '00',
    period: 'PM'
  });
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    location: ''
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'name' | 'location';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  // Apply filters and sorting when events or filters change
  useEffect(() => {
    let result = [...events];
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(event => 
        event.name.vi.toLowerCase().includes(searchLower) || 
        event.name.en.toLowerCase().includes(searchLower) ||
        event.content?.vi?.toLowerCase().includes(searchLower) ||
        event.content?.en?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.startDate) {
      result = result.filter(event => event.date >= filters.startDate);
    }
    
    if (filters.endDate) {
      result = result.filter(event => event.date <= filters.endDate);
    }
    
    if (filters.location) {
      result = result.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'name') {
        const nameA = a.name.en.toLowerCase();
        const nameB = b.name.en.toLowerCase();
        return sortConfig.direction === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        // location
        return sortConfig.direction === 'asc'
          ? a.location.localeCompare(b.location)
          : b.location.localeCompare(a.location);
      }
    });
    
    setFilteredEvents(result);
  }, [events, filters, sortConfig]);
  
  // Load events from Firebase Storage JSON
  useEffect(() => {
    setLoading(true);
    let active = true;
    (async () => {
      try {
        const eventsRaw = await getJson<Event[]>('events');
        const events: Event[] = (eventsRaw || []).map((d) => ({
          id: d.id,
          name: { vi: d.name?.vi || '', en: d.name?.en || d.name?.vi || '' },
          date: d.date,
          time: d.time,
          location: d.location,
          content: d.content ? { vi: d.content.vi || '', en: d.content.en || d.content.vi || '' } : undefined,
          thumbnail: d.thumbnail,
          thumbnailPath: d.thumbnailPath,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (active) {
          setEvents(events);
          setFilteredEvents(events);
        }
      } catch (err) {
        console.error('Failed to load events from Storage JSON:', err);
        setError(language === 'vi' ? 'Không thể tải sự kiện' : 'Failed to load events');
        if (active) {
          setEvents([]);
          setFilteredEvents([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [language]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      location: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-translate if enabled and nameVi is being changed
    if (autoTranslate && name === 'nameVi' && !editId) {
      setFormData(prev => ({
        ...prev,
        nameEn: value // Simple 1:1 translation for demo
      }));
    }
  };

  const handleTimeChange = (field: 'hour' | 'minute' | 'period', value: string) => {
    const newTimeComponents = { ...timeComponents, [field]: value };
    setTimeComponents(newTimeComponents);
    
    // Update formData.time with formatted string
    const formattedTime = `${newTimeComponents.hour}:${newTimeComponents.minute} ${newTimeComponents.period}`;
    setFormData(prev => ({ ...prev, time: formattedTime }));
  };

  const isValidTime = (val: string) => /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i.test(val.trim());
  const normalizeTime = (val: string) => {
    const m = val.trim().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);
    if (!m) return val.trim();
    const hh = String(parseInt(m[1], 10));
    const mm = m[2];
    const ampm = m[3].toUpperCase();
    return `${hh}:${mm} ${ampm}`;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const uploadThumbnail = async (eventId: string): Promise<{ url: string; path?: string }> => {
    if (!thumbnailFile) return { url: '' };
    
    if (IS_FIREBASE_CONFIGURED && fbStorage) {
      const path = `events/${eventId}/${thumbnailFile.name}`;
      const storageRef = ref(fbStorage, path);
      await uploadBytes(storageRef, thumbnailFile);
      const url = await getDownloadURL(storageRef);
      return { url, path };
    } else {
      // Fallback: use data URL for local development
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: String(reader.result) });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(thumbnailFile);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.nameVi || !formData.date || !formData.time || !formData.location) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ các trường bắt buộc' : 'Please fill in all required fields');
      return;
    }
    // Time format validation (e.g., 5:00 PM or 07:30PM)
    if (!isValidTime(formData.time)) {
      setError(language === 'vi' ? 'Giờ không hợp lệ. Định dạng đúng: 5:00 PM hoặc 07:30PM' : 'Invalid time. Expected format: 5:00 PM or 07:30PM');
      return;
    }
    const timeNormalized = normalizeTime(formData.time);

    try {
      setUploading(true);
      const eventId = editId || uuidv4();
      
      // Upload thumbnail if provided
      let thumbnail = '';
      let thumbnailPath: string | undefined;
      if (thumbnailFile) {
        const uploaded = await uploadThumbnail(eventId);
        thumbnail = uploaded.url;
        thumbnailPath = uploaded.path;
      } else if (editId) {
        // Keep existing thumbnail when editing
        const existingEvent = events.find(ev => ev.id === editId);
        if (existingEvent) {
          thumbnail = existingEvent.thumbnail || '';
          thumbnailPath = existingEvent.thumbnailPath;
        }
      }

      const newEvent: Event = {
        id: eventId,
        name: {
          vi: formData.nameVi,
          en: formData.nameEn || formData.nameVi
        },
        date: formData.date,
        time: timeNormalized,
        location: formData.location,
        content: formData.contentVi || formData.contentEn ? {
          vi: formData.contentVi,
          en: formData.contentEn || formData.contentVi
        } : undefined,
        thumbnail: thumbnail || undefined,
        thumbnailPath: thumbnailPath
      };

      const updated = editId
        ? events.map(ev => ev.id === editId ? newEvent : ev)
        : [...events, newEvent];

      // Sort events by date
      const sorted = updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Persist all events to Firebase Storage JSON
      await saveJson('events', sorted);
      setEvents(sorted);

      // Reset form
      resetForm();
    } catch (err) {
      setError(language === 'vi' ? 'Có lỗi xảy ra khi lưu sự kiện' : 'Error saving event');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    const event = events.find(ev => ev.id === id);
    if (!event) return;

    // Parse time string (e.g., "5:00 PM")
    const timeMatch = event.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      setTimeComponents({
        hour: timeMatch[1],
        minute: timeMatch[2],
        period: timeMatch[3].toUpperCase()
      });
    }

    setFormData({
      nameVi: event.name.vi,
      nameEn: event.name.en,
      date: event.date,
      time: event.time,
      location: event.location,
      contentVi: event.content?.vi || '',
      contentEn: event.content?.en || ''
    });
    setThumbnailFile(null);
    setThumbnailPreview(event.thumbnail || '');
    setEditId(id);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa sự kiện này?' : 'Are you sure you want to delete this event?')) {
      try {
        const eventToDelete = events.find(ev => ev.id === id);
        
        // Delete thumbnail from Firebase Storage if exists
        if (eventToDelete?.thumbnailPath && IS_FIREBASE_CONFIGURED && fbStorage) {
          try {
            await deleteObject(ref(fbStorage, eventToDelete.thumbnailPath));
          } catch (err) {
            console.warn('Failed to delete thumbnail from storage:', err);
          }
        }
        
        const remaining = events.filter(ev => ev.id !== id);
        await saveJson('events', remaining);
        setEvents(remaining);
      } catch (err) {
        setError(language === 'vi' ? 'Có lỗi xảy ra khi xóa sự kiện' : 'Error deleting event');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonth = (today.getMonth() + 1).toString();
    const currentDay = today.getDate().toString();
    
    setFormData({
      nameVi: '',
      nameEn: '',
      date: `${currentYear}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`,
      time: '5:00 PM',
      location: '',
      contentVi: '',
      contentEn: ''
    });
    setTimeComponents({
      hour: '5',
      minute: '00',
      period: 'PM'
    });
    setThumbnailFile(null);
    setThumbnailPreview('');
    setEditId(null);
    setError('');
  };

  if (loading) {
    return <div>{language === 'vi' ? 'Đang tải sự kiện...' : 'Loading events...'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 px-6 py-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-md">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editId ? (language === 'vi' ? 'Chỉnh sửa sự kiện' : 'Edit Event') : (language === 'vi' ? 'Thêm Sự Kiện Mới' : 'Add New Event')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Tên sự kiện (Tiếng Việt) *' : 'Event Name (Vietnamese) *'}
              </label>
              <input
                type="text"
                name="nameVi"
                value={formData.nameVi}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Tên sự kiện (Tiếng Anh) *' : 'Event Name (English) *'}
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Ngày *' : 'Date *'}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Giờ *' : 'Time *'}
              </label>
              <div className="flex gap-2">
                <select
                  value={timeComponents.hour}
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="flex items-center text-lg">:</span>
                <select
                  value={timeComponents.minute}
                  onChange={(e) => handleTimeChange('minute', e.target.value)}
                  className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  required
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={timeComponents.period}
                  onChange={(e) => handleTimeChange('period', e.target.value)}
                  className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Địa điểm *' : 'Location *'}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Hình ảnh thumbnail' : 'Thumbnail Image'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                disabled={uploading}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-32 w-auto rounded border object-cover"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <VisualEditor
                label={language === 'vi' ? 'Nội dung (Tiếng Việt)' : 'Content (Vietnamese)'}
                value={formData.contentVi}
                onChange={(value: string) => setFormData(prev => ({ ...prev, contentVi: value }))}
                placeholder={language === 'vi' ? 'Nhập nội dung sự kiện...' : 'Enter event content...'}
              />
            </div>

            <div className="md:col-span-2">
              <VisualEditor
                label={language === 'vi' ? 'Nội dung (Tiếng Anh)' : 'Content (English)'}
                value={formData.contentEn}
                onChange={(value: string) => setFormData(prev => ({ ...prev, contentEn: value }))}
                placeholder={language === 'vi' ? 'Nhập nội dung sự kiện...' : 'Enter event content...'}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 py-2.5 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{language === 'vi' ? 'Đang xử lý...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{editId ? (language === 'vi' ? 'Cập nhật sự kiện' : 'Update Event') : (language === 'vi' ? 'Thêm sự kiện' : 'Add Event')}</span>
                </>
              )}
            </button>
            
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 py-2.5 px-6 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{language === 'vi' ? 'Hủy' : 'Cancel'}</span>
              </button>
            )}
            
            <div className="flex items-center ml-auto bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-2">
              <input
                type="checkbox"
                id="auto-translate"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 mr-2"
              />
              <label htmlFor="auto-translate" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                {language === 'vi' ? 'Tự động dịch sang tiếng Anh' : 'Auto-translate to English'}
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-6 border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === 'vi' ? 'Bộ lọc' : 'Filters'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tìm kiếm' : 'Search'}</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={language === 'vi' ? 'Tìm sự kiện...' : 'Search events...'}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Từ ngày' : 'From Date'}</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Đến ngày' : 'To Date'}</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Địa điểm' : 'Location'}</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder={language === 'vi' ? 'Lọc theo địa điểm' : 'Filter by location'}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{language === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'vi' ? 'Danh sách Sự Kiện' : 'Events List'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">{language === 'vi' ? 'Sắp xếp theo:' : 'Sort by:'}</span>
            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-') as ['date' | 'name' | 'location', 'asc' | 'desc'];
                setSortConfig({ key, direction });
              }}
              className="border rounded p-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="date-asc">{language === 'vi' ? 'Ngày (Cũ đến mới)' : 'Date (Oldest First)'}</option>
              <option value="date-desc">{language === 'vi' ? 'Ngày (Mới đến cũ)' : 'Date (Newest First)'}</option>
              <option value="name-asc">{language === 'vi' ? 'Tên (A-Z)' : 'Name (A-Z)'}</option>
              <option value="name-desc">{language === 'vi' ? 'Tên (Z-A)' : 'Name (Z-A)'}</option>
              <option value="location-asc">{language === 'vi' ? 'Địa điểm (A-Z)' : 'Location (A-Z)'}</option>
              <option value="location-desc">{language === 'vi' ? 'Địa điểm (Z-A)' : 'Location (Z-A)'}</option>
            </select>
          </div>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{language === 'vi' ? 'Không có sự kiện nào' : 'No events found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Ngày & Giờ' : 'Date & Time'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Địa điểm' : 'Location'}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Hành động' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {event.name.vi}
                      </div>
                      {event.content?.vi && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {event.content.vi.length > 50 
                            ? `${event.content.vi.substring(0, 50)}...` 
                            : event.content.vi}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {event.name.en}
                      </div>
                      {event.content?.en && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {event.content.en.length > 50 
                            ? `${event.content.en.substring(0, 50)}...` 
                            : event.content.en}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {event.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(event.id)}
                          className="inline-flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{language === 'vi' ? 'Xóa' : 'Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminEvents;
