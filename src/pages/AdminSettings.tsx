import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { BackgroundPattern } from './Home';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSettings() {
  const { language } = useLanguage();
  const [currentPattern, setCurrentPattern] = useState<BackgroundPattern>('dots');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        // Fallback to localStorage if Firebase not configured
        const savedPattern = localStorage.getItem('heroBackgroundPattern') as BackgroundPattern;
        const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
        if (savedPattern) setCurrentPattern(savedPattern);
        if (savedImageUrl) setCustomImageUrl(savedImageUrl);
        setLoading(false);
        return;
      }

      try {
        const settingsRef = doc(db, 'site-settings', 'homepage');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.heroBackgroundPattern) {
            setCurrentPattern(data.heroBackgroundPattern);
          }
          if (data.heroBackgroundImageUrl) {
            setCustomImageUrl(data.heroBackgroundImageUrl);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const patterns: { value: BackgroundPattern; label: string; preview: string }[] = [
    { value: 'dots', label: 'Dots', preview: 'Small circular dots in a grid pattern' },
    { value: 'grid', label: 'Grid', preview: 'Linear grid lines' },
    { value: 'diagonal', label: 'Diagonal', preview: 'Diagonal striped pattern' },
    { value: 'waves', label: 'Waves', preview: 'Wave-like circular pattern' },
    { value: 'crosses', label: 'Crosses', preview: 'Cross/plus sign pattern' },
    { value: 'none', label: 'None', preview: 'Solid background without pattern' },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(language === 'vi' ? 'Vui lòng chọn file hình ảnh!' : 'Please select an image file!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'vi' ? 'Kích thước file không được vượt quá 5MB!' : 'File size must not exceed 5MB!');
      return;
    }

    if (!storage) {
      alert(language === 'vi' ? 'Firebase Storage chưa được cấu hình!' : 'Firebase Storage is not configured!');
      return;
    }

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `hero-backgrounds/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setCustomImageUrl(downloadURL);
      setSaved(false);
      
      alert(language === 'vi' ? 'Tải lên thành công! Nhấn "Lưu Thay Đổi" để áp dụng.' : 'Upload successful! Click "Save Changes" to apply.');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(language === 'vi' ? 'Lỗi khi tải lên hình ảnh!' : 'Error uploading image!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!customImageUrl) return;
    
    if (!confirm(language === 'vi' ? 'Bạn có chắc muốn xóa hình ảnh tùy chỉnh?' : 'Are you sure you want to remove the custom image?')) {
      return;
    }

    try {
      // Try to delete from Firebase Storage if it's a Firebase URL
      if (storage && customImageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, customImageUrl);
        await deleteObject(imageRef);
      }
      
      setCustomImageUrl('');
      localStorage.removeItem('heroBackgroundImageUrl');
      
      // Also remove from Firestore
      if (db) {
        try {
          const settingsRef = doc(db, 'site-settings', 'homepage');
          await setDoc(settingsRef, {
            heroBackgroundPattern: currentPattern,
            heroBackgroundImageUrl: '',
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Error updating Firestore:', err);
        }
      }
      
      setSaved(false);
      alert(language === 'vi' ? 'Đã xóa hình ảnh!' : 'Image removed!');
    } catch (error) {
      console.error('Error deleting image:', error);
      // Still remove from state even if Firebase deletion fails
      setCustomImageUrl('');
      localStorage.removeItem('heroBackgroundImageUrl');
    }
  };

  const handlePatternChange = (pattern: BackgroundPattern) => {
    setCurrentPattern(pattern);
    
    // Apply immediately if the function is available
    if (window.changeHeroBackground) {
      window.changeHeroBackground(pattern);
    }
    
    setSaved(false);
  };

  const handleSave = async () => {
    if (!db) {
      // Fallback to localStorage if Firebase not configured
      localStorage.setItem('heroBackgroundPattern', currentPattern);
      if (customImageUrl) {
        localStorage.setItem('heroBackgroundImageUrl', customImageUrl);
      } else {
        localStorage.removeItem('heroBackgroundImageUrl');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }

    try {
      const settingsRef = doc(db, 'site-settings', 'homepage');
      await setDoc(settingsRef, {
        heroBackgroundPattern: currentPattern,
        heroBackgroundImageUrl: customImageUrl || '',
        updatedAt: new Date().toISOString(),
      });
      
      // Also save to localStorage for immediate local updates
      localStorage.setItem('heroBackgroundPattern', currentPattern);
      if (customImageUrl) {
        localStorage.setItem('heroBackgroundImageUrl', customImageUrl);
      } else {
        localStorage.removeItem('heroBackgroundImageUrl');
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      alert(language === 'vi' ? 'Đã lưu cài đặt thành công!' : 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(language === 'vi' ? 'Lỗi khi lưu cài đặt!' : 'Error saving settings!');
    }
  };

  const handlePreview = () => {
    // Open homepage in new tab to preview
    window.open('/', '_blank');
  };

  if (loading) {
    return (
      <div className="container-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-brand-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'vi' ? 'Đang tải cài đặt...' : 'Loading settings...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {language === 'vi' ? 'Cài Đặt Trang Web' : 'Site Settings'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'vi' 
              ? 'Tùy chỉnh giao diện và cài đặt trang web'
              : 'Customize the appearance and settings of the website'}
          </p>
        </div>

        {/* Background Pattern Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? 'Hoa Văn Trang Chủ' : 'Homepage Background Pattern'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === 'vi' 
                    ? 'Chọn kiểu hoa văn cho phần hero của trang chủ'
                    : 'Select the pattern for the homepage hero section'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Pattern Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {patterns.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => handlePatternChange(pattern.value)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    currentPattern === pattern.value
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 shadow-lg scale-105'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md bg-white dark:bg-slate-800'
                  }`}
                >
                  {/* Pattern Preview */}
                  <div className="mb-3 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative">
                    <div className="absolute inset-0 opacity-20">
                      <div 
                        className="absolute inset-0" 
                        style={getPatternPreviewStyle(pattern.value)}
                      ></div>
                    </div>
                    {currentPattern === pattern.value && (
                      <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 rounded-full p-1">
                        <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Pattern Info */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      {pattern.label}
                      {currentPattern === pattern.value && (
                        <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">
                          {language === 'vi' ? 'Đang dùng' : 'Active'}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pattern.preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Background Image Section */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'vi' ? 'Hình Ảnh Tùy Chỉnh' : 'Custom Background Image'}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {language === 'vi' 
                      ? 'Tải lên hình ảnh riêng để làm nền thay cho hoa văn. Hình ảnh sẽ hiển thị phía sau nội dung hero.'
                      : 'Upload your own image to use as background instead of patterns. The image will be displayed behind the hero content.'}
                  </p>
                  
                  {customImageUrl ? (
                    <div className="space-y-3">
                      {/* Image Preview */}
                      <div className="relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 h-32">
                        <img 
                          src={customImageUrl} 
                          alt="Custom background" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {language === 'vi' ? 'Đã tải lên' : 'Uploaded'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          {uploading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {language === 'vi' ? 'Đang tải...' : 'Uploading...'}
                            </span>
                          ) : (
                            language === 'vi' ? 'Thay Đổi Hình' : 'Change Image'
                          )}
                        </label>
                        <button
                          onClick={handleRemoveImage}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                          disabled={uploading}
                        >
                          {language === 'vi' ? 'Xóa' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="px-6 py-8 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-brand-500 dark:hover:border-brand-400 transition-colors cursor-pointer">
                        <div className="text-center">
                          {uploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <svg className="animate-spin h-10 w-10 text-brand-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-slate-600 dark:text-slate-300 font-medium">
                                {language === 'vi' ? 'Đang tải lên...' : 'Uploading...'}
                              </p>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">
                                {language === 'vi' ? 'Nhấn để tải lên hình ảnh' : 'Click to upload image'}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {language === 'vi' ? 'PNG, JPG, WEBP (tối đa 5MB)' : 'PNG, JPG, WEBP (max 5MB)'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {language === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes'}
                </button>
                
                <button
                  onClick={handlePreview}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {language === 'vi' ? 'Xem Trước' : 'Preview'}
                </button>
              </div>

              {/* Save notification */}
              {saved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium animate-fade-in">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {language === 'vi' ? 'Đã lưu!' : 'Saved!'}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">
                    {language === 'vi' ? 'Thông tin:' : 'Information:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {language === 'vi' 
                        ? 'Cài đặt được lưu trong cơ sở dữ liệu Firebase và áp dụng cho TẤT CẢ người dùng truy cập trang web.'
                        : 'Settings are saved to Firebase database and apply to ALL users visiting the website.'}
                    </li>
                    <li>
                      {language === 'vi' 
                        ? 'Khi bạn tải lên hình ảnh tùy chỉnh, nó sẽ được lưu trữ trên Firebase Storage và hiển thị cho mọi người.'
                        : 'When you upload a custom image, it is stored on Firebase Storage and displayed to everyone.'}
                    </li>
                    <li>
                      {language === 'vi' 
                        ? 'Thay đổi sẽ được cập nhật tự động trên tất cả các trình duyệt đang mở trang web.'
                        : 'Changes are automatically updated on all browsers currently viewing the website.'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get pattern preview styles
function getPatternPreviewStyle(pattern: BackgroundPattern): React.CSSProperties {
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      };
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      };
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, white 35px, white 37px)',
      };
    case 'waves':
      return {
        backgroundImage: 'radial-gradient(circle at 100% 50%, transparent 20%, white 21%, white 22%, transparent 22%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, white 21%, white 22%, transparent 22%, transparent)',
        backgroundSize: '80px 80px',
        backgroundPosition: '0 0, 40px 40px'
      };
    case 'crosses':
      return {
        backgroundImage: 'linear-gradient(white 2px, transparent 2px), linear-gradient(90deg, white 2px, transparent 2px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center center'
      };
    case 'none':
      return {};
    default:
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      };
  }
}
