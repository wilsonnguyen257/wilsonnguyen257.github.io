interface PreviewModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  language?: 'vi' | 'en';
}

export default function PreviewModal({
  isOpen,
  title,
  content,
  onClose,
  language = 'vi',
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {language === 'vi' ? 'Xem trước' : 'Preview'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-8 max-h-[70vh] overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-brand-200">
              {title}
            </h1>
            <div 
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-brand-600 prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
