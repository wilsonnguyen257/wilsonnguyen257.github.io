import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import { EVENTS as DEFAULT_EVENTS } from '../data/events';

type Event = {
  id: string;
  name: {
    vi: string;
    en: string;
  };
  date: string;
  time: string;
  location: string;
  description?: {
    vi: string;
    en: string;
  };
  isDefault?: boolean;
};

// Helper functions
const getEvents = (): Event[] => {
  try {
    const saved = localStorage.getItem('events');
    const customEvents = saved ? JSON.parse(saved) : [];
    const defaultEvents = DEFAULT_EVENTS.map(ev => ({ ...ev, isDefault: true }));
    return [...defaultEvents, ...customEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

const saveEvents = (events: Event[]) => {
  try {
    const customEvents = events.filter(ev => !ev.isDefault);
    localStorage.setItem('events', JSON.stringify(customEvents));
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

const AdminEvents = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    date: '',
    time: '',
    location: '',
    descriptionVi: '',
    descriptionEn: ''
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(true);
  
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
        event.description?.vi?.toLowerCase().includes(searchLower) ||
        event.description?.en?.toLowerCase().includes(searchLower)
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
  
  // Load events on mount
  useEffect(() => {
    try {
      const loadedEvents = getEvents();
      setEvents(loadedEvents);
      setFilteredEvents(loadedEvents);
    } catch {
      setError(language === 'vi' ? 'Không thể tải sự kiện' : 'Failed to load events');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.nameVi || !formData.date || !formData.time || !formData.location) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ các trường bắt buộc' : 'Please fill in all required fields');
      return;
    }

    try {
      const newEvent: Event = {
        id: editId || uuidv4(),
        name: {
          vi: formData.nameVi,
          en: formData.nameEn || formData.nameVi
        },
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.descriptionVi || formData.descriptionEn ? {
          vi: formData.descriptionVi,
          en: formData.descriptionEn || formData.descriptionVi
        } : undefined
      };

      if (editId) {
        // Update existing event
        setEvents(prev => {
          const updated = prev.map(ev => ev.id === editId ? newEvent : ev);
          saveEvents(updated);
          return updated;
        });
      } else {
        // Add new event
        setEvents(prev => {
          const updated = [...prev, newEvent];
          saveEvents(updated);
          return updated;
        });
      }

      // Reset form
      setFormData({
        nameVi: '',
        nameEn: '',
        date: '',
        time: '',
        location: '',
        descriptionVi: '',
        descriptionEn: ''
      });
      setEditId(null);
      setError('');
    } catch (err) {
      setError(language === 'vi' ? 'Có lỗi xảy ra khi lưu sự kiện' : 'Error saving event');
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    const event = events.find(ev => ev.id === id);
    if (!event) return;

    setFormData({
      nameVi: event.name.vi,
      nameEn: event.name.en,
      date: event.date,
      time: event.time,
      location: event.location,
      descriptionVi: event.description?.vi || '',
      descriptionEn: event.description?.en || ''
    });
    setEditId(id);
    setError('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa sự kiện này?' : 'Are you sure you want to delete this event?')) {
      try {
        setEvents(prev => {
          const updated = prev.filter(ev => ev.id !== id);
          saveEvents(updated);
          return updated;
        });
      } catch (err) {
        setError(language === 'vi' ? 'Có lỗi xảy ra khi xóa sự kiện' : 'Error deleting event');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nameVi: '',
      nameEn: '',
      date: '',
      time: '',
      location: '',
      descriptionVi: '',
      descriptionEn: ''
    });
    setEditId(null);
    setError('');
  };

  if (loading) {
    return <div>{language === 'vi' ? 'Đang tải sự kiện...' : 'Loading events...'}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{language === 'vi' ? 'Quản lý Sự Kiện' : 'Manage Events'}</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? (language === 'vi' ? 'Chỉnh sửa sự kiện' : 'Edit Event') : (language === 'vi' ? 'Thêm Sự Kiện Mới' : 'Add New Event')}
        </h2>
        
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
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Giờ *' : 'Time *'}
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Mô tả (Tiếng Việt)' : 'Description (Vietnamese)'}
              </label>
              <textarea
                name="descriptionVi"
                value={formData.descriptionVi}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Mô tả (Tiếng Anh)' : 'Description (English)'}
              </label>
              <textarea
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {editId ? (language === 'vi' ? 'Cập nhật sự kiện' : 'Update Event') : (language === 'vi' ? 'Thêm sự kiện' : 'Add Event')}
            </button>
            
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
            )}
            
            <div className="flex items-center ml-auto">
              <input
                type="checkbox"
                id="auto-translate"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="auto-translate" className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'vi' ? 'Tự động dịch sang tiếng Anh' : 'Auto-translate to English'}
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden mb-6 border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{language === 'vi' ? 'Bộ lọc' : 'Filters'}</h2>
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
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Đến ngày' : 'To Date'}</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {language === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {language === 'vi' ? 'Danh sách Sự Kiện' : 'Events List'}
          </h2>
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
          <div className="p-6 text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Không có sự kiện nào' : 'No events found'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-slate-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Ngày & Giờ' : 'Date & Time'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Địa điểm' : 'Location'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'vi' ? 'Hành động' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
            {event.name.vi}
                      </div>
                      {event.description?.vi && (
                        <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                          {event.description.vi.length > 50 
                            ? `${event.description.vi.substring(0, 50)}...` 
                            : event.description.vi}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
              {event.name.en}
                      </div>
                      {event.description?.en && (
                        <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                          {event.description.en.length > 50 
                            ? `${event.description.en.substring(0, 50)}...` 
                            : event.description.en}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
              {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {event.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(event.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={event.isDefault}
                      >
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={event.isDefault}
                        title={event.isDefault ? (language === 'vi' ? 'Không thể xóa sự kiện mặc định' : 'Default events cannot be deleted') : ''}
                      >
                        {language === 'vi' ? 'Xóa' : 'Delete'}
                      </button>
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
