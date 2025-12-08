import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Theme and language are managed globally via Navbar; we still consume language to localize labels
import { useLanguage } from '../contexts/LanguageContext';
import { logAuditAction } from '../lib/audit';
import type { FilterState, DeleteConfirmState, ReflectionFormData, Reflection } from '../types/content';
import type { ToastType } from '../components/Toast';
import { subscribeJson, saveJson } from '../lib/storage';
import VisualEditor from '../components/VisualEditor';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PreviewModal from '../components/PreviewModal';

// Types moved to shared file: src/types/content.ts


const defaultFormData: ReflectionFormData = {
  id: null,
  title: { vi: '', en: '' },
  content: { vi: '', en: '' },
  date: new Date().toISOString().split('T')[0],
  author: 'Cộng đoàn',
  status: 'draft'
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
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false, id: null });
  const [preview, setPreview] = useState<Reflection | null>(null);
  const [selectedReflections, setSelectedReflections] = useState<Set<string>>(new Set());
  const [autoTranslate, setAutoTranslate] = useState(true);

  // Load and keep in sync with Firebase Storage JSON
  useEffect(() => {
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
          status: it.status || 'published',
          createdAt: it.createdAt || new Date().toISOString(),
          updatedAt: it.updatedAt || new Date().toISOString(),
        }));
        setReflections(mapped);
      },
      (err) => {
        console.error('Failed to load reflections from Storage JSON:', err);
        setToast({ message: language === 'vi' ? 'Không thể tải bài suy niệm' : 'Failed to load reflections', type: 'error' });
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.vi.trim()) {
      setToast({ message: language === 'vi' ? 'Tiêu đề tiếng Việt là bắt buộc' : 'Vietnamese title is required', type: 'error' });
      return;
    }
    if (!formData.content.vi.trim()) {
      setToast({ message: language === 'vi' ? 'Nội dung tiếng Việt là bắt buộc' : 'Vietnamese content is required', type: 'error' });
      return;
    }
    if (!formData.date) {
      setToast({ message: language === 'vi' ? 'Ngày đăng là bắt buộc' : 'Date is required', type: 'error' });
      return;
    }
    if (!formData.author.trim()) {
      setToast({ message: language === 'vi' ? 'Tác giả là bắt buộc' : 'Author is required', type: 'error' });
      return;
    }
    
    // Validate content length
    const contentLen = formData.content.vi.trim().length;
    if (contentLen < 20) {
      setToast({ message: language === 'vi' ? 'Nội dung quá ngắn (ít nhất 20 ký tự)' : 'Content too short (minimum 20 characters)', type: 'error' });
      return;
    }
    if (contentLen > 5000) {
      setToast({ message: language === 'vi' ? 'Nội dung quá dài (tối đa 5000 ký tự)' : 'Content too long (max 5000 characters)', type: 'error' });
      return;
    }
    
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
            status: formData.status || 'draft',
            createdAt: now,
            updatedAt: now,
          }, ...reflections];

      await saveJson('reflections', updated);
      setReflections(updated);

      // Log audit action
      await logAuditAction(editingId ? 'reflection.update' : 'reflection.create', {
        reflectionId: idToUse,
        title: formData.title.vi,
        status: formData.status
      });

      // Show success toast
      setToast({ 
        message: editingId 
          ? (language === 'vi' ? 'Đã cập nhật bài suy niệm thành công!' : 'Reflection updated successfully!') 
          : (language === 'vi' ? 'Đã thêm bài suy niệm mới thành công!' : 'New reflection added successfully!'),
        type: 'success'
      });
      
      // Reset form
      setFormData({ ...defaultFormData, author: language === 'vi' ? 'Cộng đoàn' : 'Community' });
      setEditingId(null);
      
      // Scroll to top of the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error saving reflection:', errorMessage);
      setToast({ 
        message: language === 'vi' ? 
          `Có lỗi xảy ra khi lưu bài suy niệm: ${errorMessage}` : 
          `Error saving reflection: ${errorMessage}`,
        type: 'error'
      });
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
      author: reflection.author || '',
      status: reflection.status || 'draft'
    });
    setEditingId(reflection.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle duplicate reflection
  const handleDuplicate = (reflection: Reflection) => {
    setFormData({
      id: null,
      title: { 
        vi: `${reflection.title?.vi || ''} (Copy)`,
        en: `${reflection.title?.en || ''} (Copy)` 
      },
      content: { 
        vi: reflection.content?.vi || '',
        en: reflection.content?.en || '' 
      },
      date: new Date().toISOString().split('T')[0],
      author: reflection.author || '',
      status: 'draft'
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Log audit action
    void logAuditAction('reflection.duplicate', {
      sourceReflectionId: reflection.id,
      title: reflection.title.vi
    });
    
    setToast({ message: language === 'vi' ? 'Đã sao chép bài suy niệm. Vui lòng chỉnh sửa và lưu.' : 'Reflection duplicated. Please edit and save.', type: 'info' });
  };

  // Bulk selection functions
  const toggleSelectReflection = (id: string) => {
    const newSelected = new Set(selectedReflections);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReflections(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReflections.size === displayedReflections.length) {
      setSelectedReflections(new Set());
    } else {
      setSelectedReflections(new Set(displayedReflections.map(r => r.id)));
    }
  };

  const confirmBulkDelete = () => {
    if (selectedReflections.size === 0) return;
    setDeleteConfirm({ show: true, id: 'bulk' });
  };

  const handleBulkDelete = async () => {
    try {
      const updated = reflections.filter(r => !selectedReflections.has(r.id));
      await saveJson('reflections', updated);
      setReflections(updated);
      
      // Log audit action
      await logAuditAction('reflection.bulk_delete', {
        count: selectedReflections.size,
        reflectionIds: Array.from(selectedReflections)
      });
      
      setSelectedReflections(new Set());
      setDeleteConfirm({ show: false, id: null });
      setToast({ 
        message: language === 'vi' ? 
          `Đã xóa ${selectedReflections.size} bài suy niệm thành công!` : 
          `Successfully deleted ${selectedReflections.size} reflections!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting reflections:', err);
      setToast({ 
        message: language === 'vi' ? 'Có lỗi xảy ra khi xóa' : 'Error deleting reflections',
        type: 'error'
      });
    }
  };

  // Handle deletion of a reflection
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    
    if (deleteConfirm.id === 'bulk') {
      await handleBulkDelete();
      return;
    }
    
    try {
      const reflectionToDelete = reflections.find(r => r.id === deleteConfirm.id);
      const filtered = reflections.filter(r => r.id !== deleteConfirm.id);
      await saveJson('reflections', filtered);
      setReflections(filtered);
      
      // Log audit action
      await logAuditAction('reflection.delete', {
        reflectionId: deleteConfirm.id,
        title: reflectionToDelete?.title.vi || 'Unknown'
      });
      
      setToast({ message: language === 'vi' ? 'Đã xóa bài suy niệm thành công' : 'Reflection deleted successfully', type: 'success' });
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error deleting reflection:', errorMessage);
      setToast({ 
        message: language === 'vi' ? 
          `Có lỗi xảy ra khi xóa bài suy niệm: ${errorMessage}` : 
          `Error deleting reflection: ${errorMessage}`,
        type: 'error'
      });
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

  return (
    <div className="min-h-screen bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={deleteConfirm.id === 'bulk' 
          ? (language === 'vi' ? `Xóa ${selectedReflections.size} bài suy niệm?` : `Delete ${selectedReflections.size} reflections?`)
          : (language === 'vi' ? 'Xóa bài suy niệm?' : 'Delete reflection?')
        }
        message={deleteConfirm.id === 'bulk'
          ? (language === 'vi' ? 'Bạn có chắc muốn xóa các bài suy niệm đã chọn? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete the selected reflections? This action cannot be undone.')
          : (language === 'vi' ? 'Bạn có chắc muốn xóa bài suy niệm này? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete this reflection? This action cannot be undone.')
        }
        confirmText={language === 'vi' ? 'Xóa' : 'Delete'}
        cancelText={language === 'vi' ? 'Hủy' : 'Cancel'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        type="danger"
      />

      {/* Preview Modal */}
      {preview && (
        <PreviewModal
          isOpen={true}
          title={preview.title[language]}
          content={preview.content[language]}
          onClose={() => setPreview(null)}
          language={language}
        />
      )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? (language === 'vi' ? 'Chỉnh sửa bài suy niệm' : 'Edit Reflection') : (language === 'vi' ? 'Thêm bài suy niệm mới' : 'Add New Reflection')}
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Tiêu đề (Tiếng Việt)' : 'Title (Vietnamese)'} <span className="text-red-500">*</span></label>
                <input type="text" name="title.vi" value={formData.title.vi} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Tiêu đề (Tiếng Anh)' : 'Title (English)'} <span className="text-red-500">*</span></label>
                <input type="text" name="title.en" value={formData.title.en} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="md:col-span-2">
                <VisualEditor
                  label={language === 'vi' ? 'Nội dung (Tiếng Việt)' : 'Content (Vietnamese)'}
                  value={formData.content.vi}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, content: { ...prev.content, vi: value } }))}
                  placeholder={language === 'vi' ? 'Nhập nội dung bài suy niệm...' : 'Enter reflection content...'}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <VisualEditor
                  label={language === 'vi' ? 'Nội dung (Tiếng Anh)' : 'Content (English)'}
                  value={formData.content.en}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, content: { ...prev.content, en: value } }))}
                  placeholder={language === 'vi' ? 'Nhập nội dung bài suy niệm...' : 'Enter reflection content...'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Ngày' : 'Date'} <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border rounded [color-scheme:light]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Tác giả' : 'Author'} <span className="text-red-500">*</span></label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Trạng thái' : 'Status'} <span className="text-red-500">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="draft">{language === 'vi' ? 'Bản nháp' : 'Draft'}</option>
                  <option value="published">{language === 'vi' ? 'Đã xuất bản' : 'Published'}</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 py-2.5 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-all duration-300 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{editingId ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes') : (language === 'vi' ? 'Tạo mới' : 'Create')}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(defaultFormData);
                  }}
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

        {/* Filters Section - refactored to match AdminEvents */}
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
                  placeholder={language === 'vi' ? 'Tìm theo tiêu đề, nội dung...' : 'Search by title, content...'}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'vi' ? 'Tác giả' : 'Author'}</label>
                <input
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  placeholder={language === 'vi' ? 'Lọc theo tác giả...' : 'Filter by author...'}
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
            </div>
            <div className="mt-4">
              <button
                type="button"
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

        {/* Reflections List - refactored to table style like AdminEvents */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'vi' ? 'Danh sách Bài Suy Niệm' : 'Reflections List'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedReflections.size > 0 && (
                <button
                  onClick={confirmBulkDelete}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {language === 'vi' ? `Xóa (${selectedReflections.size})` : `Delete (${selectedReflections.size})`}
                </button>
              )}
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{language === 'vi' ? `Tổng cộng: ${displayedReflections.length} bài` : `Total: ${displayedReflections.length} reflections`}</span>
            </div>
          </div>
          {displayedReflections.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-500 font-medium">{language === 'vi' ? 'Không có bài suy niệm nào' : 'No reflections found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedReflections.size === displayedReflections.length && displayedReflections.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-brand-600 border-slate-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (VI)' : 'Title (VI)'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề (EN)' : 'Title (EN)'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Ngày' : 'Date'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {displayedReflections.map((reflection) => (
                    <tr key={reflection.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReflections.has(reflection.id)}
                          onChange={() => toggleSelectReflection(reflection.id)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {reflection.title.vi}
                        </div>
                        {reflection.content.vi && (
                          <div className="text-sm text-slate-500 mt-1">
                            {reflection.content.vi.length > 50 ? `${reflection.content.vi.substring(0, 50)}...` : reflection.content.vi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {reflection.title.en}
                        </div>
                        {reflection.content.en && (
                          <div className="text-sm text-slate-500 mt-1">
                            {reflection.content.en.length > 50 ? `${reflection.content.en.substring(0, 50)}...` : reflection.content.en}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {formatDate(reflection.date)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {language === 'vi' ? 'Cập nhật:' : 'Updated:'} {new Date(reflection.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-AU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {reflection.author}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reflection.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reflection.status === 'published' 
                            ? (language === 'vi' ? 'Đã xuất bản' : 'Published') 
                            : (language === 'vi' ? 'Bản nháp' : 'Draft')
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreview(reflection)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title={language === 'vi' ? 'Xem trước' : 'Preview'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{language === 'vi' ? 'Xem' : 'Preview'}</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(reflection)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            title={language === 'vi' ? 'Sao chép' : 'Duplicate'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{language === 'vi' ? 'Sao' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => handleEdit(reflection)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                            title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ show: true, id: reflection.id })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            title={language === 'vi' ? 'Xóa' : 'Delete'}
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
      </div>
    </div>
  );
};

export default AdminReflections;
