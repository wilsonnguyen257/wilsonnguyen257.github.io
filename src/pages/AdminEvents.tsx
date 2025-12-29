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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  // Import XML
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
          alert('XML Parse Error: ' + parserError.textContent);
          return;
      }

      const items = doc.querySelectorAll('item');
      
      const newEvents: Event[] = [];
      
      // Helper to get text content from multiple possible selectors
      const getText = (el: Element, ...selectors: string[]) => {
        for (const s of selectors) {
          // Try with namespace prefix if not included, using getElementsByTagName which is namespace-safe
          if (!s.includes(':')) {
            // Check for namespaced tag first (e.g. wp:post_type)
            const tagsNS = el.getElementsByTagName('wp:' + s);
            if (tagsNS.length > 0 && tagsNS[0].textContent) return tagsNS[0].textContent;
            
            // Standard tag
            const tags = el.getElementsByTagName(s);
            if (tags.length > 0 && tags[0].textContent) return tags[0].textContent;
          } else {
            // Already has namespace, just use it
            const tags = el.getElementsByTagName(s);
            if (tags.length > 0 && tags[0].textContent) return tags[0].textContent;
          }

          // Only use querySelector for non-namespaced selectors to avoid syntax errors
          if (!s.includes(':')) {
            try {
              const found = el.querySelector(s);
              if (found?.textContent) return found.textContent;
            } catch (e) {
              // Ignore syntax errors
            }
          }
        }
        return '';
      };

      items.forEach((item) => {
        const postType = getText(item, 'post_type', 'wp:post_type');
        
        if (postType !== 'event') return;

        const title = getText(item, 'title');
        
        // Content: try encoded content module
        let contentEncoded = '';
        const contentModules = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded');
        if (contentModules.length > 0) {
            contentEncoded = contentModules[0].textContent || '';
        } else {
            // Fallback to various tag names
            contentEncoded = getText(item, 'content:encoded', 'encoded');
        }
        
        // Parse meta
        // Try both standard and namespaced selectors for meta items
        const metas = [...Array.from(item.querySelectorAll('postmeta')), ...Array.from(item.getElementsByTagName('wp:postmeta'))];
        
        const meta: Record<string, string> = {};
        metas.forEach(m => {
          const key = getText(m, 'meta_key', 'wp:meta_key');
          const value = getText(m, 'meta_value', 'wp:meta_value');
          if (key && value) meta[key] = value;
        });

        // Date parsing
        let date = meta['event_start_date'] || meta['event_date'] || '';
        
        // Convert "Nov 10 2016" or "2024/02/11" to "YYYY-MM-DD"
        try {
          if (date.trim()) {
            if (date.includes('/')) {
                // Handle YYYY/MM/DD
                date = date.replace(/\//g, '-');
            } else {
                // Handle "Nov 10 2016"
                const d = new Date(date);
                if (!isNaN(d.getTime())) {
                    // Adjust for timezone offset to prevent date shifting
                    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                    const adjustedDate = new Date(d.getTime() - userTimezoneOffset);
                    date = adjustedDate.toISOString().split('T')[0];
                }
            }
          }
        } catch (e) {
          console.error('Date parse error', date);
        }

        // Time parsing
        let time = meta['event_start_time'] || meta['event_time'] || '';
        
        // Location
        const location = meta['event_location'] || '';

        if (title) {
            // If date is missing, default to today
            if (!date) {
                date = new Date().toISOString().split('T')[0];
            }
            
            newEvents.push({
                id: uuidv4(),
                name: { vi: title, en: title },
                date,
                time,
                location,
                content: { vi: contentEncoded, en: contentEncoded },
                status: 'published'
            });
        }
      });

      if (newEvents.length > 0) {
        if (confirm(`Found ${newEvents.length} events. Import them?`)) {
          // Import in chunks to avoid memory/size limits
          const CHUNK_SIZE = 50;
          for (let i = 0; i < newEvents.length; i += CHUNK_SIZE) {
            const chunk = newEvents.slice(i, i + CHUNK_SIZE);
            const currentEvents = await getJson<Event[]>('events') || [];
            
            // Merge chunk into existing
            const updated = [...currentEvents, ...chunk];
            // Remove duplicates by ID if any
            const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
            
            await saveJson('events', unique);
          }
          
          await logAuditAction('event.import', { count: newEvents.length });
          // Force reload
          await loadEvents();
          alert('Import successful!');
        }
      } else {
        alert('No events found in XML.');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Error importing file. See console for details.');
    }
    
    // Reset input
    e.target.value = '';
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

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      paginatedEvents.forEach(event => newSelected.add(event.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      paginatedEvents.forEach(event => newSelected.delete(event.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(language === 'vi' 
      ? `Xóa ${selectedIds.size} sự kiện đã chọn?` 
      : `Delete ${selectedIds.size} selected events?`)) return;

    // Delete images first (optional, best effort)
    if (IS_FIREBASE_CONFIGURED && fbStorage) {
        const eventsToDelete = events.filter(e => selectedIds.has(e.id));
        for (const event of eventsToDelete) {
            if (event.thumbnail) {
                try {
                    const fileRef = ref(fbStorage, event.thumbnail);
                    await deleteObject(fileRef);
                } catch { /* ignore */ }
            }
        }
    }

    const updated = events.filter(e => !selectedIds.has(e.id));
    await saveJson('events', updated);
    await logAuditAction('event.bulk_delete', { count: selectedIds.size });
    setSelectedIds(new Set());
    loadEvents();
  };

  return (
    <div className="container-xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          {language === 'vi' ? 'Quản Lý Sự Kiện' : 'Manage Events'}
          <span className="ml-4 text-lg font-normal text-gray-500">
            ({events.length})
          </span>
        </h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search */}
            <input 
                placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="border rounded px-3 py-2"
            />
            
            {/* Sort */}
            <select 
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={e => {
                    const [key, direction] = e.target.value.split('-');
                    setSortConfig({ key: key as 'date'|'name', direction: direction as 'asc'|'desc' });
                }}
                className="border rounded px-3 py-2 bg-white"
            >
                <option value="date-desc">{language === 'vi' ? 'Mới nhất' : 'Newest'}</option>
                <option value="date-asc">{language === 'vi' ? 'Cũ nhất' : 'Oldest'}</option>
                <option value="name-asc">{language === 'vi' ? 'Tên (A-Z)' : 'Name (A-Z)'}</option>
            </select>

            {/* Import */}
            <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer whitespace-nowrap">
                {language === 'vi' ? 'Nhập XML' : 'Import XML'}
                <input type="file" accept=".xml" onChange={handleImport} className="hidden" />
            </label>
        </div>
      </div>

      {/* Bulk Delete Warning */}
      {selectedIds.size > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>
                {language === 'vi' 
                    ? `Đã chọn ${selectedIds.size} sự kiện` 
                    : `Selected ${selectedIds.size} events`}
            </span>
            <button 
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 text-sm font-medium"
            >
                {language === 'vi' ? 'Xóa mục đã chọn' : 'Delete Selected'}
            </button>
        </div>
      )}

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
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-4 py-3 w-10">
                    <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={paginatedEvents.length > 0 && paginatedEvents.every(e => selectedIds.has(e.id))}
                        className="rounded border-gray-300"
                    />
                </th>
                <th className="px-4 py-3 text-left">{language === 'vi' ? 'Sự kiện' : 'Event'}</th>
                <th className="px-4 py-3 text-left">{language === 'vi' ? 'Ngày' : 'Date'}</th>
                <th className="px-4 py-3 text-left">{language === 'vi' ? 'Giờ' : 'Time'}</th>
                <th className="px-4 py-3 text-left">{language === 'vi' ? 'Địa điểm' : 'Location'}</th>
                <th className="px-4 py-3 text-right">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
                </tr>
            </thead>
            <tbody>
                {paginatedEvents.map(e => (
                <tr key={e.id} className={`border-t hover:bg-gray-50 ${selectedIds.has(e.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                        <input 
                            type="checkbox" 
                            checked={selectedIds.has(e.id)}
                            onChange={() => handleSelectOne(e.id)}
                            className="rounded border-gray-300"
                        />
                    </td>
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
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
