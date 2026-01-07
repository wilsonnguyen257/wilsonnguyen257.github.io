import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Translation } from '../../types/content';
import VisualEditor from '../VisualEditor';

interface BilingualFormProps {
  title: string;
  value: Translation;
  onChange: (value: Translation) => void;
  placeholder?: { vi: string; en: string };
  type?: 'input' | 'textarea' | 'editor';
  rows?: number;
  autoTranslate?: boolean;
  onAutoTranslate?: (from: 'vi' | 'en', to: 'vi' | 'en', text: string) => Promise<string>;
}

export default function BilingualForm({
  title,
  value,
  onChange,
  placeholder = { vi: '', en: '' },
  type = 'input',
  rows = 4,
  autoTranslate = false,
  onAutoTranslate
}: BilingualFormProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'vi' | 'en'>('vi');
  const [isTranslating, setIsTranslating] = useState(false);

  // Auto-switch to current language on mount
  useEffect(() => {
    setActiveTab(language);
  }, [language]);

  const handleTextChange = (lang: 'vi' | 'en', text: string) => {
    onChange({ ...value, [lang]: text });
  };

  const handleAutoTranslate = async () => {
    if (!onAutoTranslate || !autoTranslate) return;
    
    const sourceLang = activeTab === 'vi' ? 'vi' : 'en';
    const targetLang = activeTab === 'vi' ? 'en' : 'vi';
    const sourceText = value[sourceLang];
    
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    try {
      const translatedText = await onAutoTranslate(sourceLang, targetLang, sourceText);
      handleTextChange(targetLang, translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      // Could show toast notification here
    } finally {
      setIsTranslating(false);
    }
  };

  const formatText = (lang: 'vi' | 'en') => {
    const text = value[lang] || '';
    // Basic formatting: normalize spaces and punctuation
    const formatted = text
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([.,!?])(?!\s)/g, '$1 ')
      .trim();
    handleTextChange(lang, formatted);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {autoTranslate && (
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={isTranslating || !value[activeTab]?.trim()}
            className="px-3 py-1.5 text-sm bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTranslating ? 'Translating...' : `Translate to ${activeTab === 'vi' ? 'English' : 'Vietnamese'}`}
          </button>
        )}
      </div>

      {/* Language Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab('vi')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'vi'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tiếng Việt
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'en'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          English
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            {activeTab === 'vi' ? 'Nội dung tiếng Việt' : 'English Content'}
          </label>
          <button
            type="button"
            onClick={() => formatText(activeTab)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Format
          </button>
        </div>
        
        {type === 'editor' ? (
          <VisualEditor
            value={value[activeTab] || ''}
            onChange={(newContent) => handleTextChange(activeTab, newContent)}
          />
        ) : type === 'textarea' ? (
          <textarea
            value={value[activeTab] || ''}
            onChange={(e) => handleTextChange(activeTab, e.target.value)}
            placeholder={placeholder[activeTab]}
            rows={rows}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            value={value[activeTab] || ''}
            onChange={(e) => handleTextChange(activeTab, e.target.value)}
            placeholder={placeholder[activeTab]}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        )}
        
        {/* Character count for textarea */}
        {type === 'textarea' && (
          <div className="text-xs text-slate-500 text-right">
            {value[activeTab]?.length || 0} characters
          </div>
        )}
      </div>

      {/* Preview of other language */}
      {value[activeTab === 'vi' ? 'en' : 'vi'] && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-xs font-medium text-slate-600 mb-1">
            Preview ({activeTab === 'vi' ? 'English' : 'Tiếng Việt'}):
          </div>
          <div className="text-sm text-slate-700 truncate">
            {value[activeTab === 'vi' ? 'en' : 'vi']}
          </div>
        </div>
      )}
    </div>
  );
}
