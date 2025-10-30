import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Theme and language are managed globally via Navbar; we still consume language to localize labels
import { useLanguage } from '../contexts/LanguageContext';
import type { FilterState, DeleteConfirmState, ReflectionFormData, Reflection } from '../types/content';
import { subscribeJson, saveJson } from '../lib/storage';
import VisualEditor from '../components/VisualEditor';

// Types moved to shared file: src/types/content.ts


const defaultFormData: ReflectionFormData = {
  id: null,
  title: { vi: '', en: '' },
  content: { vi: '', en: '' },
  date: new Date().toISOString().split('T')[0],
  author: 'Cộng đoàn'
};

// Storage now handled by Firestore via helpers above

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

  // Load and keep in sync with Firebase Storage JSON
  useEffect(() => {
    setIsLoading(true);
    type RawReflection = Reflection & { id: string };
    const unsubscribe = subscribeJson<RawReflection[]>(
      'reflections',
      (items) => {
        const mapped: Reflection[] = (items || []).map((it) => ({
          id: it.id,
          title: { vi: it.title?.vi || '', en: it.title?.en || it.title?.vi || '' },
          content: { vi: it.content?.vi || '', en: it.content?.en || it.content?.vi || '' },
          date: it.date || new Date().toISOString().split('T')[0],
          author: it.author || (language === 'vi' ? 'Cộng đoàn' : 'Community'),
          createdAt: it.createdAt || new Date().toISOString(),
          updatedAt: it.updatedAt || new Date().toISOString(),
        }));
        setReflections(mapped);
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load reflections from Storage JSON:', err);
        setError(language === 'vi' ? 'Không thể tải bài suy niệm' : 'Failed to load reflections');
        setIsLoading(false);
      }
    );
    return () => { unsubscribe(); };
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
    // Simple content length check
    const contentLen = formData.content.vi.trim().length;
    if (contentLen < 20) {
      setError(language === 'vi' ? 'Nội dung quá ngắn (ít nhất 20 ký tự)' : 'Content too short (minimum 20 characters)');
      return;
    }
    if (contentLen > 5000) {
      setError(language === 'vi' ? 'Nội dung quá dài (tối đa 5000 ký tự)' : 'Content too long (max 5000 characters)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const now = new Date().toISOString();
      const idToUse = editingId || uuidv4();
      const updated = editingId
        ? reflections.map(r => r.id === editingId ? { ...r, ...formData, id: editingId, updatedAt: now } : r)
        : [{
            id: idToUse,
            title: { vi: formData.title.vi, en: formData.title.en || formData.title.vi },
            content: { vi: formData.content.vi, en: formData.content.en || formData.content.vi },
            date: formData.date,
            author: formData.author,
            createdAt: now,
            updatedAt: now,
          }, ...reflections];

      await saveJson('reflections', updated);
      setReflections(updated);

      // Show success message
      setSuccess(editingId ? (language === 'vi' ? 'Đã cập nhật bài suy niệm thành công!' : 'Reflection updated successfully!') : (language === 'vi' ? 'Đã thêm bài suy niệm mới thành công!' : 'New reflection added successfully!'));
      
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
    const reflectionDate = reflection.date || new Date().toISOString().split('T')[0];
    
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
      date: reflectionDate,
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
      const filtered = reflections.filter(r => r.id !== deleteConfirm.id);
      await saveJson('reflections', filtered);
      setReflections(filtered);
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
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-200 px-6 py-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-md">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>{success}</span>
          </div>
        )}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingId ? (language === 'vi' ? 'Chỉnh sửa bài suy niệm' : 'Edit Reflection') : (language === 'vi' ? 'Thêm bài suy niệm mới' : 'Add New Reflection')}
            </h2>
          </div>
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
                <VisualEditor
                  label={language === 'vi' ? 'Nội dung (Tiếng Việt) *' : 'Content (Vietnamese) *'}
                  value={formData.content.vi}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, content: { ...prev.content, vi: value } }))}
                  placeholder={language === 'vi' ? 'Nhập nội dung bài suy niệm...' : 'Enter reflection content...'}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <VisualEditor
                  label={language === 'vi' ? 'Nội dung (Tiếng Anh) *' : 'Content (English) *'}
                  value={formData.content.en}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, content: { ...prev.content, en: value } }))}
                  placeholder={language === 'vi' ? 'Nhập nội dung bài suy niệm...' : 'Enter reflection content...'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Ngày *' : 'Date *'}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Tác giả *' : 'Author *'}</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 py-2.5 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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
                    <span>{editingId ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes') : (language === 'vi' ? 'Tạo mới' : 'Create')}</span>
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(defaultFormData);
                  }}
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

        {/* Filters Section - refactored to match AdminEvents */}
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
            </div>
            <div className="mt-4">
              <button
                type="button"
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

        {/* Reflections List - refactored to table style like AdminEvents */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Danh sách Bài Suy Niệm' : 'Reflections List'}
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">{language === 'vi' ? `Tổng cộng: ${displayedReflections.length} bài` : `Total: ${displayedReflections.length} reflections`}</span>
          </div>
          {displayedReflections.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{language === 'vi' ? 'Không có bài suy niệm nào' : 'No reflections found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (VI)' : 'Title (VI)'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (EN)' : 'Title (EN)'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{language === 'vi' ? 'Ngày' : 'Date'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {displayedReflections.map((reflection) => (
                    <tr key={reflection.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {reflection.title.vi}
                        </div>
                        {reflection.content.vi && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {reflection.content.vi.length > 50 ? `${reflection.content.vi.substring(0, 50)}...` : reflection.content.vi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {reflection.title.en}
                        </div>
                        {reflection.content.en && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {reflection.content.en.length > 50 ? `${reflection.content.en.substring(0, 50)}...` : reflection.content.en}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatDate(reflection.date)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {language === 'vi' ? 'Cập nhật:' : 'Updated:'} {new Date(reflection.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {reflection.author}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(reflection)}
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold mr-4 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => handleShowDeleteConfirm(reflection.id)}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{language === 'vi' ? 'Xóa' : 'Delete'}</span>
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
          className="fixed bottom-6 right-6 p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-all duration-300 hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
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
