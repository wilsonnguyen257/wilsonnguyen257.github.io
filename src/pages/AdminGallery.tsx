import React, { useState, useEffect } from 'react';
import { getJson, saveJson, saveItem, deleteItem } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/image';

type GalleryItem = { id: string; url: string; name: string; created: number; path?: string };

export default function AdminGallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  // Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Load gallery metadata from Firebase Storage JSON
  useEffect(() => {
    setUploading(true);
    let active = true;
    (async () => {
      try {
        const items = await getJson<GalleryItem[]>('gallery');
        if (active) setImages(items || []);
      } catch {
        toast.error(t('admin.gallery.error_load'));
      } finally {
        if (active) setUploading(false);
      }
    })();
    return () => { active = false; };
  }, [t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      const compressedFile = await compressImage(file);
      const uid = uuidv4();
      let url = '';
      let path: string | undefined;
      if (IS_FIREBASE_CONFIGURED && fbStorage) {
        // Upload to Firebase Storage and get a public URL
        path = `gallery/${uid}/${compressedFile.name}`;
        const objectRef = ref(fbStorage, path);
        await uploadBytes(objectRef, compressedFile);
        url = await getDownloadURL(objectRef);
      } else {
        // Fallback: data URL for local/preview-only storage
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(compressedFile);
        });
      }
      const newItem: GalleryItem = { id: uid, url, name: compressedFile.name || 'image', created: Date.now(), path };
      const updated = [...images, newItem];
      await saveItem('gallery', newItem);
      setImages(updated);
      setFile(null);
      toast.success(t('admin.gallery.upload_success') || 'Upload successful');
    } catch (err) {
      toast.error(t('admin.gallery.error_upload'));
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (img: GalleryItem) => {
    setEditingId(img.id);
    setEditName(img.name);
    setEditDate(new Date(img.created).toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDate('');
  };

  const saveEdit = async (id: string) => {
    try {
      const itemToUpdate = images.find(img => img.id === id);
      if (!itemToUpdate) return;
      
      const newItem = {
        ...itemToUpdate,
        name: editName,
        created: new Date(editDate).getTime()
      };
      
      const updated = images.map(img => img.id === id ? newItem : img);
      await saveItem('gallery', newItem);
      setImages(updated);
      cancelEdit();
      toast.success(t('admin.gallery.update_success') || 'Update successful');
    } catch (err) {
      toast.error(t('admin.gallery.error_update'));
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.gallery.confirm_delete'))) return;
    try {
      const image = images.find(i => i.id === id);
      if (!image) throw new Error('Image not found');
      // Try to delete from Firebase Storage if configured and path recorded
      if (IS_FIREBASE_CONFIGURED && fbStorage && image.path) {
        try {
          await deleteObject(ref(fbStorage, image.path));
        } catch (err) {
          console.warn('Failed to delete storage object; proceeding to update index', err);
        }
      }
      const updated = images.filter(img => img.id !== id);
      await deleteItem('gallery', id);
      setImages(updated);
      toast.success(t('admin.gallery.delete_success') || 'Delete successful');
    } catch (err) {
      toast.error(t('admin.gallery.error_delete'));
      console.error('Delete error:', err);
    }
  };

  // Filter and Pagination
  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice(
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
              {t('admin.manage_gallery')}
            </h1>
            <p className="text-gray-500 mt-1">
              {t('admin.gallery.total') || 'Total images:'} <span className="font-semibold text-brand-600">{images.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <input 
                    placeholder={t('admin.gallery.search') || 'Search images...'}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-brand-100 text-brand-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('admin.gallery.upload_new')}</h2>
        </div>

        <p className="text-sm text-slate-600 mb-6 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <span>{IS_FIREBASE_CONFIGURED ? t('admin.gallery.firebase_desc') : t('admin.gallery.no_firebase')}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                file ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className={`w-10 h-10 mb-3 ${file ? 'text-brand-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{file ? file.name : t('admin.gallery.choose_file')}</span>
                </p>
                {!file && <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>}
              </div>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('admin.gallery.uploading')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{t('admin.gallery.upload_button')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
        
      {/* Toolbar for Gallery */}
      <div className="mb-6 flex justify-end">
          <div className="relative w-full sm:w-64">
            <input 
                placeholder={t('admin.gallery.search') || 'Search images...'}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
      </div>

      {paginatedImages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-lg">{searchTerm ? 'No matching images found' : t('admin.gallery.no_images')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedImages.map((img) => (
              <div key={img.id} className="relative group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                    <button
                        onClick={() => startEdit(img)}
                        className="flex-1 bg-white/90 backdrop-blur-sm text-brand-700 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
                    >
                        {t('admin.gallery.edit')}
                    </button>
                    <button
                        onClick={() => handleDelete(img.id)}
                        className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                        {t('admin.gallery.delete')}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {editingId === img.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder={t('admin.gallery.name')}
                        autoFocus
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(img.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors"
                        >
                          {t('admin.gallery.save')}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {t('admin.gallery.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-gray-900 truncate mb-1" title={img.name}>
                        {img.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(img.created).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                    {t('admin.pagination.prev') || 'Previous'}
                </button>
                <span className="px-4 py-2 bg-white border rounded-lg text-gray-700 font-medium">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                    {t('admin.pagination.next') || 'Next'}
                </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
