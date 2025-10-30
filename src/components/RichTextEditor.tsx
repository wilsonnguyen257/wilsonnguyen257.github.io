import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
  label,
  required = false
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = beforeText + prefix + selectedText + suffix + afterText;
    onChange(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);

    const newText = beforeText + text + afterText;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    { icon: 'B', title: 'Bold', action: () => applyFormat('**'), style: 'font-bold' },
    { icon: 'I', title: 'Italic', action: () => applyFormat('*'), style: 'italic' },
    { icon: 'U', title: 'Underline', action: () => applyFormat('__'), style: 'underline' },
    { icon: 'H1', title: 'Heading 1', action: () => insertText('# '), style: 'font-bold text-lg' },
    { icon: 'H2', title: 'Heading 2', action: () => insertText('## '), style: 'font-bold' },
    { icon: '•', title: 'Bullet List', action: () => insertText('- '), style: '' },
    { icon: '1.', title: 'Numbered List', action: () => insertText('1. '), style: '' },
    { icon: '""', title: 'Quote', action: () => insertText('> '), style: '' },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-t-lg">
        {formatButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${btn.style}`}
          >
            {btn.icon}
          </button>
        ))}
        
        {/* Divider */}
        <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
        
        {/* Link button */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) applyFormat('[', `](${url})`);
          }}
          title="Insert Link"
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-b-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y font-mono text-sm"
      />

      {/* Helper text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
        <span>Markdown formatting: **bold**, *italic*, __underline__, # heading, - list, [link](url), &gt; quote</span>
      </p>
    </div>
  );
}
