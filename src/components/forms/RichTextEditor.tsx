import { useEffect, useRef, forwardRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

/**
 * Simple rich text editor using contentEditable
 * In production, consider replacing with TipTap or React Quill
 */
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, label, required, error }, ref) => {
    const { language } = useLanguage();
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingRef = useRef(false);

    // Update editor content when value changes
    useEffect(() => {
      if (editorRef.current && !isUpdatingRef.current) {
        editorRef.current.innerHTML = value;
      }
    }, [value]);

    const handleInput = () => {
      if (editorRef.current) {
        isUpdatingRef.current = true;
        const content = editorRef.current.innerHTML;
        onChange(content);
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    };

    const execCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    };

    const insertLink = () => {
      const url = prompt(
        language === 'vi' ? 'Nhập URL:' : 'Enter URL:'
      );
      if (url) {
        execCommand('createLink', url);
      }
    };

    const formatBlocks = [
      { label: 'H1', value: 'h1' },
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'P', value: 'p' },
    ];

    const formatButtons = [
      { icon: 'B', command: 'bold', title: 'Bold' },
      { icon: 'I', command: 'italic', title: 'Italic' },
      { icon: 'U', command: 'underline', title: 'Underline' },
      { icon: 'S', command: 'strikeThrough', title: 'Strikethrough' },
    ];

    const listButtons = [
      { icon: '• List', command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: '1. List', command: 'insertOrderedList', title: 'Numbered List' },
    ];

    const alignButtons = [
      { icon: '≡', command: 'justifyLeft', title: 'Align Left' },
      { icon: '≡', command: 'justifyCenter', title: 'Align Center' },
      { icon: '≡', command: 'justifyRight', title: 'Align Right' },
    ];

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Toolbar */}
        <div className="bg-slate-50 border border-slate-200 rounded-t-lg p-2 flex flex-wrap gap-1">
          {/* Format buttons */}
          <div className="flex gap-1 pr-2 border-r border-slate-300">
            {formatButtons.map((btn) => (
              <button
                key={btn.command}
                type="button"
                onClick={() => execCommand(btn.command)}
                title={btn.title}
                className="px-3 py-1.5 text-sm font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Block format */}
          <div className="flex gap-1 pr-2 border-r border-slate-300">
            {formatBlocks.map((block) => (
              <button
                key={block.value}
                type="button"
                onClick={() => execCommand('formatBlock', block.value)}
                title={block.label}
                className="px-3 py-1.5 text-sm font-semibold bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
              >
                {block.label}
              </button>
            ))}
          </div>

          {/* Lists */}
          <div className="flex gap-1 pr-2 border-r border-slate-300">
            {listButtons.map((btn) => (
              <button
                key={btn.command}
                type="button"
                onClick={() => execCommand(btn.command)}
                title={btn.title}
                className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Alignment */}
          <div className="flex gap-1 pr-2 border-r border-slate-300">
            {alignButtons.map((btn) => (
              <button
                key={btn.command}
                type="button"
                onClick={() => execCommand(btn.command)}
                title={btn.title}
                className="px-3 py-1.5 text-sm bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Link */}
          <button
            type="button"
            onClick={insertLink}
            title={language === 'vi' ? 'Chèn link' : 'Insert Link'}
            className="px-3 py-1.5 text-sm bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
          >
            🔗
          </button>

          {/* Clear formatting */}
          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            title={language === 'vi' ? 'Xóa định dạng' : 'Clear Formatting'}
            className="px-3 py-1.5 text-sm bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Editor */}
        <div
          ref={(node) => {
            editorRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          contentEditable
          onInput={handleInput}
          className="w-full min-h-[200px] p-4 border border-slate-200 border-t-0 rounded-b-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-auto"
          data-placeholder={placeholder}
          suppressContentEditableWarning
          style={{
            lineHeight: '1.6',
          }}
        />

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}

        {/* Styles */}
        <style>{`
          [contentEditable]:empty:before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
            position: absolute;
          }
          [contentEditable] h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 0.67em 0;
          }
          [contentEditable] h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.75em 0;
          }
          [contentEditable] h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 0.83em 0;
          }
          [contentEditable] p {
            margin: 1em 0;
          }
          [contentEditable] ul,
          [contentEditable] ol {
            margin: 1em 0;
            padding-left: 2.5em;
          }
          [contentEditable] ul {
            list-style-type: disc;
          }
          [contentEditable] ol {
            list-style-type: decimal;
          }
          [contentEditable] li {
            margin: 0.5em 0;
          }
          [contentEditable] a {
            color: #3b82f6;
            text-decoration: underline;
          }
          [contentEditable] strong,
          [contentEditable] b {
            font-weight: bold;
          }
          [contentEditable] em,
          [contentEditable] i {
            font-style: italic;
          }
          [contentEditable] u {
            text-decoration: underline;
          }
          [contentEditable] strike,
          [contentEditable] s {
            text-decoration: line-through;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
