import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Theme and language are managed globally via Navbar; we still consume language to localize labels
import { useLanguage } from '../contexts/LanguageContext';
import type { FilterState, DeleteConfirmState, ReflectionFormData, Reflection } from '../types/content';

// Types moved to shared file: src/types/content.ts


const defaultFormData: ReflectionFormData = {
  id: null,
  title: { vi: '', en: '' },
  content: { vi: '', en: '' },
  date: new Date().toISOString().split('T')[0],
  author: 'Cộng đoàn'
};

// Storage Functions
function getReflections(): Reflection[] {
  try {
    const data = localStorage.getItem("reflections");
    if (!data) return [];
    
    const parsed = JSON.parse(data) as Array<Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'> & { id?: string, createdAt?: string, updatedAt?: string }>;
    
    return parsed.map(item => ({
      id: item.id || uuidv4(),
      title: {
        vi: item.title?.vi || '',
        en: item.title?.en || ''
      },
      content: {
        vi: item.content?.vi || '',
        en: item.content?.en || ''
      },
      date: item.date || new Date().toISOString().split('T')[0],
      author: item.author || 'Cộng đoàn',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error loading reflections:', error);
    return [];
  }
}

function saveReflections(reflections: Reflection[]) {
  const dataToSave = reflections.map(reflection => ({
    id: reflection.id,
    title: { ...reflection.title },
    content: { ...reflection.content },
    date: reflection.date,
    author: reflection.author,
    createdAt: reflection.createdAt,
    updatedAt: reflection.updatedAt
  }));
  
  localStorage.setItem("reflections", JSON.stringify(dataToSave));
};

// Main Component
const AdminReflections: React.FC = () => {
  const { language } = useLanguage();

  // State for reflections data
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [formData, setFormData] = useState<ReflectionFormData>({
    ...defaultFormData,
    author: language === 'vi' ? 'Cộng đoàn' : 'Community',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    startDate: '',
    endDate: '',
    author: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false, id: null });
  const [autoTranslate, setAutoTranslate] = useState(true);

  // Load reflections on component mount
  useEffect(() => {
    const loadReflections = () => {
      try {
        setIsLoading(true);
        const savedReflections = getReflections();
        setReflections(savedReflections);
      } catch (err) {
        setError(language === 'vi' ? 'Không thể tải bài suy niệm' : 'Failed to load reflections');
        console.error('Error loading reflections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReflections();
  }, [language]);

  // Theme class is applied globally (Navbar). No local theme effect.

  // Memoize filtered reflections to prevent unnecessary recalculations
  const displayedReflections = useMemo(() => {
    return reflections.filter((reflection: Reflection) => {
      // Filter by search term
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        reflection.title?.vi?.toLowerCase().includes(searchTerm) ||
        reflection.content?.vi?.toLowerCase().includes(searchTerm) ||
        reflection.title?.en?.toLowerCase().includes(searchTerm) ||
        reflection.content?.en?.toLowerCase().includes(searchTerm) ||
        reflection.author?.toLowerCase().includes(searchTerm) ||
        false;
      
      // Filter by date range
      const reflectionDate = reflection.date ? new Date(reflection.date) : null;
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      const matchesDate = 
        (!startDate || (reflectionDate && reflectionDate >= startDate)) &&
        (!endDate || (reflectionDate && reflectionDate <= endDate));
      
      const matchesAuthor = 
        !filters.author || 
        (reflection.author && reflection.author.toLowerCase().includes(filters.author.toLowerCase()));
      
      return matchesSearch && matchesDate && matchesAuthor;
    }).sort((a: Reflection, b: Reflection) => {
      // Sort by date (newest first)
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [reflections, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      author: ''
    });
  };
  
  // Handle delete confirmation
  const handleShowDeleteConfirm = (id: string) => {
    setDeleteConfirm({ show: true, id });
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.vi.trim() || !formData.content.vi.trim()) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin bắt buộc (tiêu đề và nội dung tiếng Việt)' : 'Please fill in required fields (Vietnamese title and content)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const now = new Date().toISOString();
      let updatedReflections: Reflection[];
      let isNew = false;
      
      if (editingId) {
        // Update existing reflection
        updatedReflections = reflections.map(r => 
          r.id === editingId 
            ? { ...r, ...formData, id: editingId, updatedAt: now } 
            : r
        );
      } else {
        // Add new reflection
        const newReflection: Reflection = {
          ...defaultFormData,
          ...formData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        updatedReflections = [newReflection, ...reflections];
        isNew = true;
      }
      
      // Update state and save to storage
      setReflections(updatedReflections);
      saveReflections(updatedReflections);
      
      // Show success message
      setSuccess(isNew ? (language === 'vi' ? 'Đã thêm bài suy niệm mới thành công!' : 'New reflection added successfully!') : (language === 'vi' ? 'Đã cập nhật bài suy niệm thành công!' : 'Reflection updated successfully!'));
      
      // Reset form
      setFormData(defaultFormData);
      setEditingId(null);
      
      // Scroll to top of the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error saving reflection:', errorMessage);
      setError(language === 'vi' ? 
        `Có lỗi xảy ra khi lưu bài suy niệm: ${errorMessage}` : 
        `Error saving reflection: ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit button click
  const handleEdit = (reflection: Reflection) => {
    setFormData({
      id: reflection.id,
      title: { 
        vi: reflection.title?.vi || '',
        en: reflection.title?.en || '' 
      },
      content: { 
        vi: reflection.content?.vi || '',
        en: reflection.content?.en || '' 
      },
      date: reflection.date || new Date().toISOString().split('T')[0],
      author: reflection.author || ''
    });
    setEditingId(reflection.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle deletion of a reflection
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      setIsLoading(true);
      const updatedReflections = reflections.filter(r => r.id !== deleteConfirm.id);
      saveReflections(updatedReflections);
      setReflections(updatedReflections);
      setSuccess(language === 'vi' ? 'Đã xóa bài suy niệm thành công' : 'Reflection deleted successfully');
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error deleting reflection:', errorMessage);
      setError(language === 'vi' ? 
        `Có lỗi xảy ra khi xóa bài suy niệm: ${errorMessage}` : 
        `Error deleting reflection: ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form fields with proper type safety
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Handle nested fields (title.vi, title.en, etc.)
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData((prev: ReflectionFormData) => {
        const currentField = prev[field as keyof typeof prev];
        if (typeof currentField === 'object' && currentField !== null) {
          const updatedField = {
            ...currentField,
            [lang]: value
          };
          // Auto-translate if enabled and editing Vietnamese field
          let updatedForm = {
            ...prev,
            [field]: updatedField
          } as ReflectionFormData;
          if (autoTranslate && lang === 'vi' && field === 'title') {
            updatedForm = {
              ...updatedForm,
              title: {
                ...updatedField,
                en: value // Simple 1:1 translation for demo
              }
            };
          }
          if (autoTranslate && lang === 'vi' && field === 'content') {
            updatedForm = {
              ...updatedForm,
              content: {
                ...updatedField,
                en: value // Simple 1:1 translation for demo
              }
            };
          }
          return updatedForm;
        }
        return prev;
      });
    } else {
      setFormData((prev: ReflectionFormData) => ({
        ...prev,
        [name]: value
      }));
    }
  };


    // Handle auto-translation
  // handleAutoTranslate removed (no longer used)

  // Format date for display
  const formatDate = (dateString: string) => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-AU';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{language === 'vi' ? 'Quản lý Bài Suy Niệm' : 'Manage Reflections'}</h1>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? (language === 'vi' ? 'Chỉnh sửa bài suy niệm' : 'Edit Reflection') : (language === 'vi' ? 'Thêm bài suy niệm mới' : 'Add New Reflection')}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tiêu đề (Tiếng Việt) *' : 'Title (Vietnamese) *'}</label>
                <input type="text" name="title.vi" value={formData.title.vi} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tiêu đề (Tiếng Anh) *' : 'Title (English) *'}</label>
                <input type="text" name="title.en" value={formData.title.en} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Nội dung (Tiếng Việt) *' : 'Content (Vietnamese) *'}</label>
                <textarea name="content.vi" value={formData.content.vi} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={6} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Nội dung (Tiếng Anh) *' : 'Content (English) *'}</label>
                <textarea name="content.en" value={formData.content.en} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={6} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Ngày *' : 'Date *'}</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tác giả *' : 'Author *'}</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Translate buttons removed, auto-translate checkbox is used instead */}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                {editingId ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes') : (language === 'vi' ? 'Tạo mới' : 'Create')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(defaultFormData);
                  }}
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

        {/* Filters Section - refactored to match AdminEvents */}
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
                  placeholder={language === 'vi' ? 'Tìm theo tiêu đề, nội dung...' : 'Search by title, content...'}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tác giả' : 'Author'}</label>
                <input
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  placeholder={language === 'vi' ? 'Lọc theo tác giả...' : 'Filter by author...'}
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
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {language === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Reflections List - refactored to table style like AdminEvents */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'vi' ? 'Danh sách Bài Suy Niệm' : 'Reflections List'}
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-300">{language === 'vi' ? `Tổng cộng: ${displayedReflections.length} bài` : `Total: ${displayedReflections.length} reflections`}</span>
          </div>
          {displayedReflections.length === 0 ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Không có bài suy niệm nào' : 'No reflections found'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (VI)' : 'Title (VI)'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (EN)' : 'Title (EN)'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{language === 'vi' ? 'Ngày' : 'Date'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {displayedReflections.map((reflection) => (
                    <tr key={reflection.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {reflection.title.vi}
                        </div>
                        {reflection.content.vi && (
                          <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                            {reflection.content.vi.length > 50 ? `${reflection.content.vi.substring(0, 50)}...` : reflection.content.vi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {reflection.title.en}
                        </div>
                        {reflection.content.en && (
                          <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                            {reflection.content.en.length > 50 ? `${reflection.content.en.substring(0, 50)}...` : reflection.content.en}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(reflection.date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {language === 'vi' ? 'Cập nhật:' : 'Updated:'} {new Date(reflection.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {reflection.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(reflection)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {language === 'vi' ? 'Sửa' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleShowDeleteConfirm(reflection.id)}
                          className="text-red-600 hover:text-red-900"
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
        
        {/* Scroll to top button */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          aria-label={language === 'vi' ? 'Lên đầu trang' : 'Scroll to top'}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCancelDelete}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">{language === 'vi' ? 'Xác nhận xóa' : 'Delete confirmation'}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {language === 'vi' ? 'Bạn có chắc chắn muốn xóa bài suy niệm này? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete this reflection? This action cannot be undone.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {language === 'vi' ? 'Xóa' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReflections;
