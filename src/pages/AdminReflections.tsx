import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reflection } from '../types/content';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import BilingualForm from '../components/forms/BilingualForm';
import { Link } from 'react-router-dom';

// Mock translation function (replace with real API)
const mockTranslate = async (from: 'vi' | 'en', to: 'vi' | 'en', text: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Mock translation - in real app, call translation API
  return `[Translated from ${from} to ${to}]: ${text}`;
};

export default function AdminReflections() {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Reflection | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    id: null as string | null,
    title: { vi: '', en: '' },
    content: { vi: '', en: '' },
    date: new Date().toISOString().split('T')[0],
    author: '',
    facebookLink: '',
    youtubeLink: '',
    driveLink: '',
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      title: { vi: '', en: '' },
      content: { vi: '', en: '' },
      date: new Date().toISOString().split('T')[0],
      author: '',
      facebookLink: '',
      youtubeLink: '',
      driveLink: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  // Edit existing reflection
  const handleEdit = (item: Reflection) => {
    setFormData({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date,
      author: item.author,
      facebookLink: item.facebookLink || '',
      youtubeLink: item.youtubeLink || '',
      driveLink: item.driveLink || '',
    });
    setEditingItem(item);
    setShowForm(true);
  };

  // Save reflection
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.title.vi.trim() && !formData.title.en.trim()) {
        toast.error('Title is required in at least one language');
        return;
      }
      if (!formData.content.vi.trim() && !formData.content.en.trim()) {
        toast.error('Content is required in at least one language');
        return;
      }
      if (!formData.author.trim()) {
        toast.error('Author is required');
        return;
      }

      // Save to storage
      const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
      const reflectionData = {
        id: formData.id || uuidv4(),
        title: formData.title,
        content: formData.content,
        date: formData.date,
        author: formData.author,
        facebookLink: formData.facebookLink,
        youtubeLink: formData.youtubeLink,
        driveLink: formData.driveLink,
        status: 'published',
        createdAt: formData.id ? reflections.find((r: Reflection) => r.id === formData.id)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.id) {
        // Update existing
        const index = reflections.findIndex((r: Reflection) => r.id === formData.id);
        reflections[index] = reflectionData;
        toast.success('Reflection updated successfully');
      } else {
        // Add new
        reflections.push(reflectionData);
        toast.success('Reflection created successfully');
      }

      localStorage.setItem('reflections', JSON.stringify(reflections));
      
      // Log audit - commented out since logAuditAction module is not available
      // logAuditAction(formData.id ? 'update' : 'create', 'reflection', reflectionData.id);
      
      resetForm();
      
      // Reload reflections
      loadReflections();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    }
  };

  // Load reflections
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReflections = () => {
    const stored = localStorage.getItem('reflections');
    if (stored) {
      setReflections(JSON.parse(stored));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReflections();
  }, []);

  // Published reflections sorted by date (newest first)
  const publishedReflections = reflections
    .filter(r => r.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="container-xl py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Manage Gospel Reflections" />
      
      <div className="container-xl py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {language === 'vi' ? 'Quản lý Suy Niệm' : 'Manage Gospel Reflections'}
            </h1>
            <p className="text-slate-600">
              {language === 'vi' ? 'Quản lý các bài suy niệm và nội dung tâm linh' : 'Manage gospel reflections and spiritual content'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {language === 'vi' ? 'Tự động dịch' : 'Auto-translate'}
            </label>
            
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              {language === 'vi' ? 'Thêm Suy Niệm Mới' : 'Add New Reflection'}
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingItem ? (language === 'vi' ? 'Chỉnh Sửa Suy Niệm' : 'Edit Reflection') : (language === 'vi' ? 'Thêm Suy Niệm Mới' : 'Add New Reflection')}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <BilingualForm
                  title={language === 'vi' ? 'Tiêu đề' : 'Title'}
                  value={formData.title}
                  onChange={(title) => setFormData({ ...formData, title })}
                  placeholder={{
                    vi: 'Nhập tiêu đề tiếng Việt...',
                    en: 'Enter English title...'
                  }}
                  type="input"
                  autoTranslate={autoTranslate}
                  onAutoTranslate={mockTranslate}
                />

                {/* Content */}
                <BilingualForm
                  title={language === 'vi' ? 'Nội dung' : 'Content'}
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder={{
                    vi: 'Nhập nội dung tiếng Việt...',
                    en: 'Enter English content...'
                  }}
                  type="editor"
                  autoTranslate={autoTranslate}
                  onAutoTranslate={mockTranslate}
                />

                {/* Date and Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {language === 'vi' ? 'Ngày' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {language === 'vi' ? 'Tác giả' : 'Author'}
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder={language === 'vi' ? 'Nhập tên tác giả...' : 'Enter author name'}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {language === 'vi' ? 'Liên kết ngoài' : 'External Links'}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Facebook Link
                    </label>
                    <input
                      type="url"
                      value={formData.facebookLink}
                      onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      YouTube Link
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeLink}
                      onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Google Drive Link
                    </label>
                    <input
                      type="url"
                      value={formData.driveLink}
                      onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {language === 'vi' ? 'Hủy Bỏ' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    {editingItem ? (language === 'vi' ? 'Cập Nhật' : 'Update') : (language === 'vi' ? 'Lưu Suy Niệm' : 'Save Reflection')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reflections List */}
        <div className="space-y-4">
          {publishedReflections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <div className="text-slate-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {language === 'vi' ? 'Chưa có suy niệm nào' : 'No reflections yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {language === 'vi' ? 'Tạo suy niệm đầu tiên của bạn để bắt đầu' : 'Create your first gospel reflection to get started'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                {language === 'vi' ? 'Thêm Suy Niệm Đầu Tiên' : 'Add First Reflection'}
              </button>
            </div>
          ) : (
            publishedReflections.map((reflection) => (
              <div
                key={reflection.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {reflection.title[language] || reflection.title.vi}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span>{language === 'vi' ? 'Tác giả:' : 'By:'} {reflection.author}</span>
                      <span>•</span>
                      <span>
                        {new Date(reflection.date).toLocaleDateString(
                          language === 'vi' ? 'vi-VN' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </span>
                    </div>

                    <p className="text-slate-700 line-clamp-3">
                      {reflection.content[language]?.replace(/<[^>]*>/g, '').substring(0, 200) || 
                       reflection.content.vi?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/reflections/${reflection.id}`}
                      className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title={language === 'vi' ? 'Xem' : 'View'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleEdit(reflection)}
                      className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}