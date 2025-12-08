import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import type { Event } from '../types/content';
import { getJson, saveJson } from '../lib/storage';
import { logAuditAction } from '../lib/audit';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import VisualEditor from '../components/VisualEditor';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PreviewModal from '../components/PreviewModal';

const AdminEvents = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [preview, setPreview] = useState<{ show: boolean; title: string; content: string } | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  
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
    contentEn: '',
    status: 'published' as 'draft' | 'published'
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
          status: d.status || 'published'
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (active) {
          setEvents(events);
          setFilteredEvents(events);
        }
      } catch (err) {
        console.error('Failed to load events from Storage JSON:', err);
        setToast({ message: language === 'vi' ? 'Không thể tải sự kiện' : 'Failed to load events', type: 'error' });
        if (active) {
          setEvents([]);
          setFilteredEvents([]);
        }
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
    
    // Reset errors
    const errors: Record<string, string> = {};
    
    // Validation
    if (!formData.nameVi.trim()) {
      errors.nameVi = language === 'vi' ? 'Tên tiếng Việt là bắt buộc' : 'Vietnamese name is required';
    }
    if (!formData.date) {
      errors.date = language === 'vi' ? 'Ngày là bắt buộc' : 'Date is required';
    }
    if (!formData.time) {
      errors.time = language === 'vi' ? 'Giờ là bắt buộc' : 'Time is required';
    } else if (!isValidTime(formData.time)) {
      errors.time = language === 'vi' ? 'Giờ không hợp lệ. Định dạng đúng: 5:00 PM hoặc 07:30PM' : 'Invalid time. Expected format: 5:00 PM or 07:30PM';
    }
    if (!formData.location.trim()) {
      errors.location = language === 'vi' ? 'Địa điểm là bắt buộc' : 'Location is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setToast({ message: language === 'vi' ? 'Vui lòng kiểm tra các trường bắt buộc' : 'Please check required fields', type: 'error' });
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
        thumbnailPath: thumbnailPath,
        status: formData.status
      };

      const updated = editId
        ? events.map(ev => ev.id === editId ? newEvent : ev)
        : [...events, newEvent];

      // Sort events by date
      const sorted = updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Persist all events to Firebase Storage JSON
      await saveJson('events', sorted);
      setEvents(sorted);
      
      // Log audit action
      await logAuditAction(editId ? 'event.update' : 'event.create', {
        eventId,
        eventName: formData.nameVi,
        status: formData.status
      });
      
      // Show success toast
      setToast({
        message: editId 
          ? (language === 'vi' ? 'Đã cập nhật sự kiện thành công!' : 'Event updated successfully!')
          : (language === 'vi' ? 'Đã thêm sự kiện mới thành công!' : 'New event added successfully!'),
        type: 'success'
      });

      // Reset form
      resetForm();
    } catch (err) {
      setToast({ message: language === 'vi' ? 'Có lỗi xảy ra khi lưu sự kiện' : 'Error saving event', type: 'error' });
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
      contentEn: event.content?.en || '',
      status: event.status || 'published'
    });
    setThumbnailFile(null);
    setThumbnailPreview(event.thumbnail || '');
    setEditId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      const eventToDelete = events.find(ev => ev.id === deleteConfirm.id);
      
      // Delete thumbnail from Firebase Storage if exists
      if (eventToDelete?.thumbnailPath && IS_FIREBASE_CONFIGURED && fbStorage) {
        try {
          await deleteObject(ref(fbStorage, eventToDelete.thumbnailPath));
        } catch (err) {
          console.warn('Failed to delete thumbnail from storage:', err);
        }
      }
      
      const remaining = events.filter(ev => ev.id !== deleteConfirm.id);
      await saveJson('events', remaining);
      setEvents(remaining);
      
      // Log audit action
      await logAuditAction('event.delete', {
        eventId: deleteConfirm.id,
        eventName: eventToDelete?.name.vi || 'Unknown'
      });
      
      setToast({ message: language === 'vi' ? 'Đã xóa sự kiện thành công!' : 'Event deleted successfully!', type: 'success' });
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      setToast({ message: language === 'vi' ? 'Có lỗi xảy ra khi xóa sự kiện' : 'Error deleting event', type: 'error' });
      console.error(err);
    }
  };

  const handleDuplicate = (id: string) => {
    const event = events.find(ev => ev.id === id);
    if (!event) return;

    setFormData({
      nameVi: event.name.vi + ' (Copy)',
      nameEn: event.name.en + ' (Copy)',
      date: event.date,
      time: event.time,
      location: event.location,
      contentVi: event.content?.vi || '',
      contentEn: event.content?.en || '',
      status: 'draft'
    });
    setThumbnailFile(null);
    setThumbnailPreview(event.thumbnail || '');
    setEditId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Log audit action
    void logAuditAction('event.duplicate', {
      sourceEventId: id,
      eventName: event.name.vi
    });
    
    setToast({ message: language === 'vi' ? 'Đã sao chép sự kiện. Vui lòng chỉnh sửa và lưu.' : 'Event duplicated. Please edit and save.', type: 'info' });
  };

  const toggleSelectEvent = (id: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEvents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;
    setDeleteConfirm({ show: true, id: 'bulk' });
  };

  const confirmBulkDelete = async () => {
    try {
      // Delete thumbnails from storage
      for (const id of selectedEvents) {
        const event = events.find(ev => ev.id === id);
        if (event?.thumbnailPath && IS_FIREBASE_CONFIGURED && fbStorage) {
          try {
            await deleteObject(ref(fbStorage, event.thumbnailPath));
          } catch (err) {
            console.warn('Failed to delete thumbnail:', err);
          }
        }
      }
      
      const eventNames = events.filter(ev => selectedEvents.has(ev.id)).map(ev => ev.name.vi);
      const remaining = events.filter(ev => !selectedEvents.has(ev.id));
      await saveJson('events', remaining);
      setEvents(remaining);
      
      // Log audit action
      await logAuditAction('event.bulk_delete', {
        count: selectedEvents.size,
        eventIds: Array.from(selectedEvents),
        eventNames
      });
      
      setToast({ message: language === 'vi' ? `Đã xóa ${selectedEvents.size} sự kiện` : `Deleted ${selectedEvents.size} events`, type: 'success' });
      setSelectedEvents(new Set());
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      setToast({ message: language === 'vi' ? 'Có lỗi xảy ra khi xóa sự kiện' : 'Error deleting events', type: 'error' });
      console.error(err);
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
      contentEn: '',
      status: 'published'
    });
    setTimeComponents({
      hour: '5',
      minute: '00',
      period: 'PM'
    });
    setThumbnailFile(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setEditId(null);
  };
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={deleteConfirm.id === 'bulk' 
          ? (language === 'vi' ? 'Xóa nhiều sự kiện?' : 'Delete multiple events?')
          : (language === 'vi' ? 'Xóa sự kiện?' : 'Delete event?')
        }
        message={deleteConfirm.id === 'bulk'
          ? (language === 'vi' ? `Bạn có chắc chắn muốn xóa ${selectedEvents.size} sự kiện đã chọn?` : `Are you sure you want to delete ${selectedEvents.size} selected events?`)
          : (language === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.')
        }
        confirmText={language === 'vi' ? 'Xóa' : 'Delete'}
        cancelText={language === 'vi' ? 'Hủy' : 'Cancel'}
        onConfirm={deleteConfirm.id === 'bulk' ? confirmBulkDelete : confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        type="danger"
      />
      
      {/* Preview Modal */}
      {preview && (
        <PreviewModal
          isOpen={preview.show}
          title={preview.title}
          content={preview.content}
          onClose={() => setPreview(null)}
          language={language}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {editId ? (language === 'vi' ? 'Chỉnh sửa sự kiện' : 'Edit Event') : (language === 'vi' ? 'Thêm Sự Kiện Mới' : 'Add New Event')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Tên sự kiện (Tiếng Việt)' : 'Event Name (Vietnamese)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameVi"
                value={formData.nameVi}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Tên sự kiện (Tiếng Anh)' : 'Event Name (English)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Ngày' : 'Date'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded [color-scheme:light]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Giờ' : 'Time'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={timeComponents.hour}
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  className="flex-1 p-2 border rounded"
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
                  className="flex-1 p-2 border rounded"
                  required
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={timeComponents.period}
                  onChange={(e) => handleTimeChange('period', e.target.value)}
                  className="flex-1 p-2 border rounded"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Địa điểm' : 'Location'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Hình ảnh thumbnail' : 'Thumbnail Image'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full p-2 border rounded"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'vi' ? 'Trạng thái' : 'Status'} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                className="w-full p-2 border rounded"
              >
                <option value="published">{language === 'vi' ? '✓ Đã xuất bản' : '✓ Published'}</option>
                <option value="draft">{language === 'vi' ? '📝 Bản nháp' : '📝 Draft'}</option>
              </select>
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
                className="inline-flex items-center gap-2 py-2.5 px-6 text-sm font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{language === 'vi' ? 'Hủy' : 'Cancel'}</span>
              </button>
            )}
            
            <div className="flex items-center ml-auto bg-slate-50 rounded-lg px-4 py-2">
              <input
                type="checkbox"
                id="auto-translate"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 mr-2"
              />
              <label htmlFor="auto-translate" className="text-sm font-medium text-slate-700 cursor-pointer">
                {language === 'vi' ? 'Tự động dịch sang tiếng Anh' : 'Auto-translate to English'}
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{language === 'vi' ? 'Bộ lọc' : 'Filters'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Tìm kiếm' : 'Search'}</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={language === 'vi' ? 'Tìm sự kiện...' : 'Search events...'}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Từ ngày' : 'From Date'}</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded [color-scheme:light]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Đến ngày' : 'To Date'}</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded [color-scheme:light]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Địa điểm' : 'Location'}</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder={language === 'vi' ? 'Lọc theo địa điểm' : 'Filter by location'}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{language === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'vi' ? 'Danh sách Sự Kiện' : 'Events List'}
              </h2>
              {selectedEvents.size > 0 && (
                <p className="text-sm text-brand-600 font-medium">
                  {selectedEvents.size} {language === 'vi' ? 'đã chọn' : 'selected'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {selectedEvents.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {language === 'vi' ? `Xóa ${selectedEvents.size}` : `Delete ${selectedEvents.size}`}
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{language === 'vi' ? 'Sắp xếp:' : 'Sort:'}</span>
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-') as ['date' | 'name' | 'location', 'asc' | 'desc'];
                  setSortConfig({ key, direction });
                }}
                className="border rounded px-3 py-1.5 text-sm"
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
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 font-medium">{language === 'vi' ? 'Không có sự kiện nào' : 'No events found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEvents.size === filteredEvents.length && filteredEvents.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Ngày & Giờ' : 'Date & Time'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Địa điểm' : 'Location'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Trạng thái' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {language === 'vi' ? 'Hành động' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => toggleSelectEvent(event.id)}
                        className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {event.name.vi}
                      </div>
                      {event.content?.vi && (
                        <div className="text-sm text-slate-500 mt-1">
                          {event.content.vi.length > 50 
                            ? `${event.content.vi.substring(0, 50)}...` 
                            : event.content.vi}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {event.name.en}
                      </div>
                      {event.content?.en && (
                        <div className="text-sm text-slate-500 mt-1">
                          {event.content.en.length > 50 
                            ? `${event.content.en.substring(0, 50)}...` 
                            : event.content.en}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                      </div>
                      <div className="text-sm text-slate-500">
                        {event.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {event.status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ {language === 'vi' ? 'Đã xuất bản' : 'Published'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📝 {language === 'vi' ? 'Bản nháp' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2 flex-wrap justify-end">
                        {event.content?.vi && (
                          <button
                            onClick={() => setPreview({ show: true, title: event.name.vi, content: event.content?.vi || '' })}
                            className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            title={language === 'vi' ? 'Xem trước' : 'Preview'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(event.id)}
                          className="inline-flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(event.id)}
                          className="inline-flex items-center justify-center gap-1.5 text-green-600 hover:text-green-800 font-semibold transition-colors"
                          title={language === 'vi' ? 'Sao chép' : 'Duplicate'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-800 font-semibold transition-colors"
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
    </div>
  );
};

export default AdminEvents;
