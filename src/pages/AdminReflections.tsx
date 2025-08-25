import { useState } from "react";

// Hàm làm sạch và format text từ nhiều nguồn
function cleanAndFormatText(text: string): string {
  if (!text) return '';
  
  return text
    // Loại bỏ các ký tự đặc biệt và encoding
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    .replace(/[\u00A0]/g, ' ') // Non-breaking spaces
    .replace(/[\u2018\u2019]/g, "'") // Smart quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // Em/en dashes
    .replace(/[\u2026]/g, '...') // Ellipsis
    
    // Chuẩn hóa khoảng trắng
    .replace(/\s+/g, ' ') // Multiple spaces → single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks → double line break
    .replace(/^\s+|\s+$/g, '') // Trim start/end
    
    // Chuẩn hóa dấu câu
    .replace(/\s+([.,!?;:])/g, '$1') // Remove space before punctuation
    .replace(/([.,!?;:])([^\s])/g, '$1 $2') // Add space after punctuation
    
    // Chuẩn hóa đoạn văn
    .replace(/([.!?])\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ])/g, '$1\n\n$2'); // New paragraph after sentence
}

// Hàm dịch tự động (mock - có thể tích hợp API thật)
async function translateText(text: string, targetLang: 'en' | 'vi'): Promise<string> {
  if (!text.trim()) return '';
  
  if (targetLang === 'en') {
    const translations: Record<string, string> = {
      'Suy niệm': 'Reflection',
      'Chúa Nhật': 'Sunday',
      'Thường niên': 'Ordinary Time',
      'Năm C': 'Year C',
      'Năm A': 'Year A', 
      'Năm B': 'Year B',
      'Phúc âm': 'Gospel',
      'Lời Chúa': 'Word of God',
      'Cầu nguyện': 'Prayer',
      'Thánh lễ': 'Holy Mass',
      'Giáo xứ': 'Parish',
      'Cộng đoàn': 'Community'
    };
    
    let translated = text;
    Object.entries(translations).forEach(([vi, en]) => {
      translated = translated.replace(new RegExp(vi, 'gi'), en);
    });
    return translated;
  }
  return text;
}


type Reflection = { 
  title: {
    vi: string;
    en: string;
  };
  content: {
    vi: string;
    en: string;
  };
  date?: string; 
  author?: string;
};

function getReflections(): Reflection[] {
  const data = localStorage.getItem("reflections");
  return data ? JSON.parse(data) : [];
}

function saveReflections(reflections: Reflection[]) {
  localStorage.setItem("reflections", JSON.stringify(reflections));
}


type AdminReflectionsProps = { isAdmin?: boolean };

export default function AdminReflections({ isAdmin }: AdminReflectionsProps) {
  const [reflections, setReflections] = useState<Reflection[]>(getReflections());
  const [titleVi, setTitleVi] = useState<string>("");
  const [titleEn, setTitleEn] = useState<string>("");
  const [contentVi, setContentVi] = useState<string>("");
  const [contentEn, setContentEn] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [editIdx, setEditIdx] = useState<number>(-1);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let newList: Reflection[];
    if (editIdx >= 0) {
      newList = reflections.map((r: Reflection, i: number) =>
        i === editIdx ? { 
          ...r, 
          title: { vi: titleVi, en: titleEn },
          content: { vi: contentVi, en: contentEn },
          date, 
          author 
        } : r
      );
      setEditIdx(-1);
    } else {
      newList = [...reflections, { 
        title: { vi: titleVi, en: titleEn },
        content: { vi: contentVi, en: contentEn },
        date: date || new Date().toLocaleDateString('vi-VN'),
        author: author || 'Cộng đoàn'
      }];
    }
    setReflections(newList);
    saveReflections(newList);
    setTitleVi("");
    setTitleEn("");
    setContentVi("");
    setContentEn("");
    setDate("");
    setAuthor("");
  }

  function handleEdit(idx: number) {
    const reflection = reflections[idx];
    
    // Handle both old and new data structures
    if (typeof reflection.title === 'string') {
      setTitleVi(reflection.title);
      setTitleEn('');
    } else {
      setTitleVi(reflection.title.vi || '');
      setTitleEn(reflection.title.en || '');
    }
    
    if (typeof reflection.content === 'string') {
      setContentVi(reflection.content);
      setContentEn('');
    } else {
      setContentVi(reflection.content.vi || '');
      setContentEn(reflection.content.en || '');
    }
    
    setDate(reflection.date || "");
    setAuthor(reflection.author || "");
    setEditIdx(idx);
  }

  // Hàm tự động dịch khi nhập tiếng Việt
  const handleVietnameseInput = async (text: string, setter: (value: string) => void, enSetter: (value: string) => void) => {
    // Làm sạch text trước khi xử lý
    const cleanedText = cleanAndFormatText(text);
    setter(cleanedText);
    
    if (autoTranslate && cleanedText.trim()) {
      try {
        const translated = await translateText(cleanedText, 'en');
        enSetter(translated);
      } catch (error) {
        console.error('Translation failed:', error);
      }
    }
  };
  
  // Hàm format text cho English input
  const handleEnglishInput = (text: string, setter: (value: string) => void) => {
    const cleanedText = cleanAndFormatText(text);
    setter(cleanedText);
  };

  function handleDelete(idx: number) {
    if (!window.confirm("Xoá bài này?")) return;
    const newList = reflections.filter((_: Reflection, i: number) => i !== idx);
    setReflections(newList);
    saveReflections(newList);
  }


  if (!isAdmin) return null;

  return (
    <div className="bg-white dark:bg-slate-900">
      <section className="container-xl py-12">
      <h1 className="h1 mb-4">Quản lý Phúc Âm & Suy Niệm</h1>
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editIdx >= 0 ? 'Chỉnh Sửa Bài Suy Niệm' : 'Thêm Bài Suy Niệm Mới'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">Tự động dịch</label>
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề (Tiếng Việt)</label>
              <input
                placeholder="VD: Suy niệm Chúa Nhật XXI Thường Niên"
                value={titleVi}
                onChange={e => handleVietnameseInput(e.target.value, setTitleVi, setTitleEn)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề (Tiếng Anh)</label>
              <input
                placeholder="VD: Reflection on 21st Sunday in Ordinary Time"
                value={titleEn}
                onChange={e => handleEnglishInput(e.target.value, setTitleEn)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tác giả</label>
            <input
              placeholder="VD: Linh mục Phêrô, Cộng đoàn"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung (Tiếng Việt)</label>
              <textarea
                placeholder="Nhập nội dung bài suy niệm..."
                value={contentVi}
                onChange={e => handleVietnameseInput(e.target.value, setContentVi, setContentEn)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
                rows={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung (Tiếng Anh)</label>
              <div className="relative">
                <textarea
                  placeholder="Enter reflection content..."
                  value={contentEn}
                  onChange={e => handleEnglishInput(e.target.value, setContentEn)}
                  className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700"
                  rows={8}
                />
                <button
                  type="button"
                  onClick={() => handleEnglishInput(contentEn, setContentEn)}
                  className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                  title="Làm sạch format"
                >
                  🧹 Format
                </button>
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-fit">
            {editIdx >= 0 ? "Cập nhật" : "Đăng bài"}
          </button>
        </form>
      </div>
      <div className="grid gap-4">
        {reflections.length === 0 && <p className="p-muted" style={{color: 'var(--color-text-muted)'}}>Chưa có bài nào.</p>}
        {reflections.map((r: Reflection, i: number) => (
          <div key={i} className="card">
            <div className="mb-3">
              <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                Phúc Âm
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mb-2">
              {typeof r.title === 'string' ? r.title : r.title.vi}
            </h2>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span className="flex items-center gap-1">
                📅 {r.date || 'Gần đây'}
              </span>
              {r.author && (
                <span className="flex items-center gap-1">
                  ✍️ {r.author}
                </span>
              )}
            </div>
            
            <p className="p-muted whitespace-pre-line line-clamp-3 mb-4">
              {typeof r.content === 'string' ? r.content : r.content.vi}
            </p>
            
            <div className="flex gap-2">
              <button 
                className="btn btn-outline" 
                onClick={() => handleEdit(i)}
              >
                ✏️ Sửa
              </button>
              <button 
                className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20" 
                onClick={() => handleDelete(i)}
              >
                🗑️ Xoá
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}
