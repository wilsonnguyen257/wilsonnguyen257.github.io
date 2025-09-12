import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Theme and language are managed globally via Navbar; we still consume language to localize labels
import { useLanguage } from '../contexts/LanguageContext';
import type { FilterState, DeleteConfirmState, ReflectionFormData, Reflection } from '../types/content';

// Types moved to shared file: src/types/content.ts

// Mock translation function - replace with actual API call
const mockTranslate = (text: string, _from: string, to: string): Promise<string> => {
  return new Promise((resolve) => {
    // In a real app, this would call a translation API
    setTimeout(() => {
      const translations: Record<string, string> = {
        'Chào bạn': 'Hello',
        'Cảm ơn': 'Thank you',
        'Xin chào': 'Hello',
        'Tạm biệt': 'Goodbye',
        'bài suy niệm': 'reflection',
        'suy niệm': 'reflection',
        'ngày lễ': 'feast day',
        'thánh lễ': 'mass',
        'cầu nguyện': 'prayer',
        'kinh thánh': 'bible',
        'Kinh Thánh': 'Bible',
        'Tin Mừng': 'Gospel',
        'Thư': 'Letter',
        'Công Vụ Tông Đồ': 'Acts of the Apostles',
        'Khải Huyền': 'Revelation',
        'Phúc âm': 'Gospel',
        'Lời Chúa': 'Word of God',
        'Cầu nguyện': 'Prayer',
        'Thánh lễ': 'Holy Mass',
        'Giáo xứ': 'Parish',
        'Cộng đoàn': 'Community'
      };
      
      // Simple mapping for demo
      const translated = translations[text] || `[Translated to ${to.toUpperCase()}: ${text}]`;
      resolve(translated);
    }, 500);
  });
};

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
  }, []);

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
      console.error('Error saving reflection:', err);
      setError(language === 'vi' ? 'Có lỗi xảy ra khi lưu bài suy niệm. Vui lòng thử lại.' : 'An error occurred while saving. Please try again.');
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
      setError(language === 'vi' ? 'Có lỗi xảy ra khi xóa bài suy niệm' : 'An error occurred while deleting the reflection');
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
          return {
            ...prev,
            [field]: {
              ...currentField,
              [lang]: value
            }
          } as ReflectionFormData;
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
  const handleAutoTranslate = async (sourceField: string, targetField: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the source text to translate
      const [field, lang] = sourceField.split('.');
      const fieldData = formData[field as keyof typeof formData];
      
      if (typeof fieldData === 'object' && fieldData !== null) {
        const fieldObj = fieldData as unknown as Record<string, string>;
        const sourceText = fieldObj[lang];
        
        if (!sourceText?.trim()) {
          setError(language === 'vi' ? 'Không có nội dung để dịch' : 'No content to translate');
          return;
        }
        
        // Mock translation - replace with actual API call
        const translatedText = await mockTranslate(sourceText, 'vi', 'en');
        
        // Update the target field with translated text
        const [targetFieldName, targetLang] = targetField.split('.');
        setFormData((prev: ReflectionFormData) => {
          const currentField = prev[targetFieldName as keyof typeof prev];
          if (typeof currentField === 'object' && currentField !== null) {
            const updatedField = {
              ...currentField,
              [targetLang]: translatedText
            };
            return {
              ...prev,
              [targetFieldName]: updatedField
            } as ReflectionFormData;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(language === 'vi' ? 'Có lỗi xảy ra khi dịch. Vui lòng thử lại.' : 'An error occurred during translation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'vi' ? 'Quản lý Bài Suy Niệm' : 'Manage Reflections'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {language === 'vi' ? 'Thêm, chỉnh sửa và quản lý các bài suy niệm' : 'Add, edit and manage reflections'}
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div id="reflection-form" className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-gray-200 dark:border-slate-700">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {editingId ? (language === 'vi' ? 'Chỉnh sửa bài suy niệm' : 'Edit Reflection') : (language === 'vi' ? 'Thêm bài suy niệm mới' : 'Add New Reflection')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(defaultFormData);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {language === 'vi' ? 'Thêm Mới' : 'Add New'}
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="title.vi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tiêu đề (VI)</label>
                <input type="text" name="title.vi" id="title.vi" value={formData.title.vi} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="title.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (EN)</label>
                <input type="text" name="title.en" id="title.en" value={formData.title.en} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="content.vi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nội dung (VI)</label>
                <textarea name="content.vi" id="content.vi" value={formData.content.vi} onChange={handleInputChange} required rows={14} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 min-h-[240px] focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="content.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (EN)</label>
                <textarea name="content.en" id="content.en" value={formData.content.en} onChange={handleInputChange} rows={14} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 min-h-[240px] focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tác giả</label>
                <input type="text" name="author" id="author" value={formData.author} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent caret-brand-600 dark:caret-brand-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
            </div>
            <div className="pt-5">
              <div className="flex justify-end">
                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                  {editingId ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes') : (language === 'vi' ? 'Tạo mới' : 'Create')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-gray-200 dark:border-slate-700">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {language === 'vi' ? 'Bộ lọc' : 'Filters'}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Tìm kiếm' : 'Search'}
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                  placeholder={language === 'vi' ? 'Tìm theo tiêu đề, nội dung...' : 'Search by title, content...'}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Tác giả' : 'Author'}
                </label>
                <input
                  type="text"
                  name="author"
                  id="author-filter"
                  value={filters.author}
                  onChange={handleFilterChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                  placeholder={language === 'vi' ? 'Lọc theo tác giả...' : 'Filter by author...'}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Từ ngày' : 'From date'}
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Đến ngày' : 'To date'}
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {language === 'vi' ? 'Xóa' : 'Clear'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reflections List */}
        <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {language === 'vi' ? 'Danh sách Bài Suy Niệm' : 'Reflections List'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {language === 'vi' ? `Tổng cộng: ${displayedReflections.length} bài` : `Total: ${displayedReflections.length} reflections`}
            </p>
          </div>
          
          {displayedReflections.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{language === 'vi' ? 'Không có bài suy niệm nào' : 'No reflections'}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {reflections.length === 0 
                  ? (language === 'vi' ? 'Hãy bắt đầu bằng cách thêm bài suy niệm mới.' : 'Start by adding a new reflection.')
                  : (language === 'vi' ? 'Không tìm thấy bài suy niệm nào phù hợp với bộ lọc.' : 'No reflections match the filters.')}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {displayedReflections.map((reflection) => (
                <li key={reflection.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 truncate">
                        {language === 'vi' ? (reflection.title.vi || reflection.title.en || 'Không có tiêu đề') : (reflection.title.en || reflection.title.vi || 'No title')}
                      </h3>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <button type="button" onClick={() => reflection.id && handleEdit(reflection)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title={language === 'vi' ? 'Sửa' : 'Edit'}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button type="button" onClick={() => reflection.id && handleShowDeleteConfirm(reflection.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title={language === 'vi' ? 'Xóa' : 'Delete'}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-y-2 sm:space-y-0 sm:space-x-6">
                        {reflection.date && (
                          <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatDate(reflection.date)}
                          </p>
                        )}
                        {reflection.author && (
                          <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {reflection.author}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {language === 'vi' ? 'Cập nhật:' : 'Updated:'} {new Date(reflection.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
