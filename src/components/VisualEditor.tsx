import { useRef, useEffect } from 'react';

interface VisualEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function VisualEditor({
  value,
  onChange,
  placeholder,
  label,
  required = false
}: VisualEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatButtons = [
    { icon: '𝐁', command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: '𝐼', command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: 'U̲', command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: 'S̶', command: 'strikeThrough', title: 'Strikethrough' },
  ];

  const headingButtons = [
    { label: 'H1', command: 'formatBlock', value: 'H1', title: 'Heading 1' },
    { label: 'H2', command: 'formatBlock', value: 'H2', title: 'Heading 2' },
    { label: 'H3', command: 'formatBlock', value: 'H3', title: 'Heading 3' },
    { label: 'P', command: 'formatBlock', value: 'P', title: 'Paragraph' },
  ];

  const listButtons = [
    { icon: '• •', command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: '1. 2.', command: 'insertOrderedList', title: 'Numbered List' },
  ];

  const alignButtons = [
    { icon: '≡', command: 'justifyLeft', title: 'Align Left' },
    { icon: '≡', command: 'justifyCenter', title: 'Align Center', style: 'text-center' },
    { icon: '≡', command: 'justifyRight', title: 'Align Right', style: 'text-right' },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="bg-slate-100 border border-slate-300 rounded-t-lg p-2 flex flex-wrap gap-1">
        {/* Format buttons */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          {formatButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              title={btn.title}
              className="px-3 py-1.5 text-sm font-semibold bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Heading buttons */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          {headingButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => execCommand(btn.command, btn.value)}
              title={btn.title}
              className="px-3 py-1.5 text-sm font-semibold bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* List buttons */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          {listButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              title={btn.title}
              className="px-3 py-1.5 text-xs bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Align buttons */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          {alignButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              title={btn.title}
              className={`px-3 py-1.5 text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors ${btn.style || ''}`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Link button */}
        <button
          type="button"
          onClick={insertLink}
          title="Insert Link"
          className="px-3 py-1.5 text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors"
        >
          🔗
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          title="Clear Formatting"
          className="px-3 py-1.5 text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full min-h-[200px] p-4 border border-slate-300 rounded-b-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 overflow-auto"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        [contentEditable] {
          line-height: 1.6;
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
        [contentEditable] ul, [contentEditable] ol {
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
        [contentEditable] strong, [contentEditable] b {
          font-weight: bold;
        }
        [contentEditable] em, [contentEditable] i {
          font-style: italic;
        }
        [contentEditable] u {
          text-decoration: underline;
        }
        [contentEditable] strike, [contentEditable] s {
          text-decoration: line-through;
        }
        .dark [contentEditable] a {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
}
