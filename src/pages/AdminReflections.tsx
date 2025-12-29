import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson, saveJson } from '../lib/storage';
import { logAuditAction } from '../lib/audit';
import VisualEditor from '../components/VisualEditor';
import type { Reflection } from '../types/content';

export default function AdminReflections() {
  const { language } = useLanguage();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titleVi: '',
    titleEn: '',
    contentVi: '',
    contentEn: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'title', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Clean pasted content from various platforms
  const cleanPastedContent = (text: string): string => {
    return text
      // Remove inline styles and font tags
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/style="[^"]*"/gi, '')
      .replace(/class="[^"]*"/gi, '')
      // Remove span tags but keep content
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      // Remove weird characters from email/web (zero-width, etc)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize line breaks (keep structure)
      .replace(/\r\n/g, '\n')
      // Remove excessive blank lines (3+ becomes 2)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up spaces but preserve line structure
      .replace(/[ \t]+/g, ' ')
      // Trim each line but keep the line breaks
      .split('\n').map(line => line.trim()).join('\n')
      .trim();
  };

  // Auto-clean on paste
  const handleContentPaste = (e: React.ClipboardEvent, field: 'contentVi' | 'contentEn') => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleaned = cleanPastedContent(pastedText);
    setFormData({ ...formData, [field]: cleaned });
  };

  // Load reflections
  useEffect(() => {
    const unsubscribe = subscribeJson<Reflection[]>('reflections', (data) => {
      setReflections(data || []);
    });
    return unsubscribe;
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      titleVi: '',
      titleEn: '',
      contentVi: '',
      contentEn: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  // Edit reflection
  const handleEdit = (r: Reflection) => {
    setFormData({
      titleVi: r.title.vi,
      titleEn: r.title.en,
      contentVi: r.content.vi,
      contentEn: r.content.en,
      author: r.author,
      date: r.date,
    });
    setEditingId(r.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save (create or update)
  const handleSave = async () => {
    const reflection: Reflection = editingId
      ? {
          ...reflections.find(r => r.id === editingId)!,
          title: { vi: formData.titleVi, en: formData.titleEn },
          content: { vi: formData.contentVi, en: formData.contentEn },
          author: formData.author,
          date: formData.date,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: uuidv4(),
          title: { vi: formData.titleVi, en: formData.titleEn },
          content: { vi: formData.contentVi, en: formData.contentEn },
          author: formData.author,
          date: formData.date,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const updated = editingId
      ? reflections.map(r => r.id === editingId ? reflection : r)
      : [...reflections, reflection];

    await saveJson('reflections', updated);
    await logAuditAction(editingId ? 'reflection.update' : 'reflection.create', { id: reflection.id });
    resetForm();
  };

  // Delete reflection
  const handleDelete = async (id: string) => {
    if (!confirm(language === 'vi' ? 'Xóa bài suy niệm?' : 'Delete reflection?')) return;
    const updated = reflections.filter(r => r.id !== id);
    await saveJson('reflections', updated);
    await logAuditAction('reflection.delete', { id });
  };

  // Filter and Sort
  const filteredReflections = reflections
    .filter(r => {
      const searchLower = searchTerm.toLowerCase();
      return (
        r.title.vi.toLowerCase().includes(searchLower) ||
        r.title.en.toLowerCase().includes(searchLower) ||
        r.author.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else {
        const titleA = a.title.vi || a.title.en;
        const titleB = b.title.vi || b.title.en;
        return sortConfig.direction === 'asc'
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
  const paginatedReflections = filteredReflections.slice(
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
              {language === 'vi' ? 'Quản Lý Suy Niệm' : 'Manage Reflections'}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === 'vi' ? 'Tổng số:' : 'Total posts:'} <span className="font-semibold text-brand-600">{reflections.length}</span>
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
            {editingId ? (language === 'vi' ? 'Chỉnh Sửa Bài Viết' : 'Edit Reflection') : (language === 'vi' ? 'Thêm Bài Viết Mới' : 'Add New Reflection')}
          </h2>
        </div>
        
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Tiêu đề (Tiếng Việt)' : 'Title (Vietnamese)'}
              </label>
              <input
                placeholder={language === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'}
                value={formData.titleVi}
                onChange={e => setFormData({ ...formData, titleVi: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Tiêu đề (Tiếng Anh)' : 'Title (English)'}
              </label>
              <input
                placeholder={language === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'}
                value={formData.titleEn}
                onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Nội dung (Tiếng Việt)' : 'Content (Vietnamese)'}
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({language === 'vi' ? 'Tự động làm sạch văn bản' : 'Auto-cleaned on paste'})
                </span>
              </label>
              <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500" onPaste={(e) => handleContentPaste(e, 'contentVi')}>
                <VisualEditor
                  value={formData.contentVi}
                  onChange={(value) => setFormData({ ...formData, contentVi: value })}
                  placeholder={language === 'vi' ? 'Nhập nội dung...' : 'Enter content...'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Nội dung (Tiếng Anh)' : 'Content (English)'}
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({language === 'vi' ? 'Tự động làm sạch văn bản' : 'Auto-cleaned on paste'})
                </span>
              </label>
              <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500" onPaste={(e) => handleContentPaste(e, 'contentEn')}>
                <VisualEditor
                  value={formData.contentEn}
                  onChange={(value) => setFormData({ ...formData, contentEn: value })}
                  placeholder={language === 'vi' ? 'Nhập nội dung...' : 'Enter content...'}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                {language === 'vi' ? 'Tác giả' : 'Author'}
              </label>
              <input
                placeholder={language === 'vi' ? 'Nhập tên tác giả...' : 'Enter author name...'}
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
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
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-sm hover:shadow transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {editingId ? (language === 'vi' ? 'Cập Nhật' : 'Update') : (language === 'vi' ? 'Lưu Bài Viết' : 'Save Reflection')}
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
                    placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
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
                      setSortConfig({ key: key as 'date'|'title', direction: direction as 'asc'|'desc' });
                  }}
                  className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer w-full sm:w-auto"
              >
                  <option value="date-desc">{language === 'vi' ? 'Mới nhất' : 'Newest First'}</option>
                  <option value="date-asc">{language === 'vi' ? 'Cũ nhất' : 'Oldest First'}</option>
                  <option value="title-asc">{language === 'vi' ? 'Tiêu đề (A-Z)' : 'Title (A-Z)'}</option>
              </select>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{language === 'vi' ? 'Tiêu đề' : 'Title'}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{language === 'vi' ? 'Ngày' : 'Date'}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedReflections.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{r.title.vi || r.title.en}</div>
                  {r.title.en && r.title.vi && <div className="text-sm text-gray-500">{r.title.en}</div>}
                </td>
                <td className="px-6 py-4 text-gray-600">{r.author}</td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.date}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
                    >
                      {language === 'vi' ? 'Sửa' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      {language === 'vi' ? 'Xóa' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedReflections.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {language === 'vi' ? 'Không tìm thấy bài viết nào' : 'No reflections found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                    {language === 'vi' 
                        ? `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} đến ${Math.min(currentPage * itemsPerPage, filteredReflections.length)} trong số ${filteredReflections.length}`
                        : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredReflections.length)} of ${filteredReflections.length}`}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                        {language === 'vi' ? 'Trước' : 'Previous'}
                    </button>
                    <span className="px-3 py-1 bg-white border rounded text-gray-700 font-medium">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
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
