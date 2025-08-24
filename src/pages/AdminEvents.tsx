import { useState } from "react";
import { EVENTS as DEFAULT_EVENTS } from "../data/events";

export type Event = {
  id: string;
  name: {
    vi: string;
    en: string;
  };
  date: string;
  time: string;
  location: string;
  description?: {
    vi: string;
    en: string;
  };
  isDefault?: boolean;
};

// Các hàm quản lý sự kiện
function getEvents(): Event[] {
  const data = localStorage.getItem("events");
  const customEvents = data ? JSON.parse(data) : [];
  
  // Merge default events with custom events, marking default events
  const defaultEvents = DEFAULT_EVENTS.map(event => ({ ...event, isDefault: true }));
  const allEvents = [...defaultEvents, ...customEvents];
  
  // Sort events by date
  return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function saveEvents(events: Event[]) {
  // Only save custom events to localStorage
  const customEvents = events.filter(event => !event.isDefault);
  localStorage.setItem("events", JSON.stringify(customEvents));
}

// Các hàm quản lý địa điểm và giờ đã lưu
function getSavedLocations(): string[] {
  const data = localStorage.getItem("savedLocations");
  return data ? JSON.parse(data) : ["17 Stevens Rd, Vermont VIC 3133"];
}

function saveSavedLocations(locations: string[]) {
  localStorage.setItem("savedLocations", JSON.stringify(locations));
}

function getSavedTimes(): string[] {
  const data = localStorage.getItem("savedTimes");
  return data ? JSON.parse(data) : ["5:00 PM"];
}

function saveSavedTimes(times: string[]) {
  localStorage.setItem("savedTimes", JSON.stringify(times));
}

type AdminEventsProps = { isAdmin?: boolean };

export default function AdminEvents({ isAdmin }: AdminEventsProps) {
  const [events, setEvents] = useState<Event[]>(getEvents());
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [editIdx, setEditIdx] = useState<number>(-1);

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
    
    // Mock translation - trong thực tế có thể dùng Google Translate API
    if (targetLang === 'en') {
      // Một số từ khóa phổ biến
      const translations: Record<string, string> = {
        'CHÚA NHẬT': 'SUNDAY',
        'THƯỜNG NIÊN': 'ORDINARY TIME', 
        'NĂM C': 'YEAR C',
        'NĂM A': 'YEAR A',
        'NĂM B': 'YEAR B',
        'Phấn Đấu': 'Strive',
        'Qua Cửa Hẹp': 'Through the Narrow Gate',
        'Lễ': 'Mass',
        'Thánh': 'Saint',
        'Chúa': 'Lord',
        'Giáo xứ': 'Parish',
        'Suy niệm': 'Reflection',
        'Phúc âm': 'Gospel',
        'Cầu nguyện': 'Prayer',
        'Thánh lễ': 'Holy Mass'
      };
      
      let translated = text;
      Object.entries(translations).forEach(([vi, en]) => {
        translated = translated.replace(new RegExp(vi, 'gi'), en);
      });
      return translated;
    }
    return text; // Fallback
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let newList: Event[];
    if (editIdx >= 0) {
      newList = events.map((ev, i) =>
        i === editIdx
          ? { 
              ...ev, 
              name: { vi: nameVi, en: nameEn },
              date, 
              time, 
              location, 
              description: descriptionVi || descriptionEn ? { vi: descriptionVi, en: descriptionEn } : undefined
            }
          : ev
      );
      setEditIdx(-1);
    } else {
      newList = [
        ...events,
        {
          id: Date.now().toString(),
          name: { vi: nameVi, en: nameEn },
          date,
          time,
          location,
          description: descriptionVi || descriptionEn ? { vi: descriptionVi, en: descriptionEn } : undefined,
        },
      ];
    }
    setEvents(newList);
    saveEvents(newList);
    setNameVi("");
    setNameEn("");
    setDate("");
    setTime("");
    setLocation("");
    setDescriptionVi("");
    setDescriptionEn("");
  }

  function handleEdit(idx: number) {
    const ev = events[idx];
    // Handle both old and new data structures
    if (typeof ev.name === 'string') {
      setNameVi(ev.name);
      setNameEn('');
    } else {
      setNameVi(ev.name.vi || '');
      setNameEn(ev.name.en || '');
    }
    
    setDate(ev.date);
    setTime(ev.time);
    setLocation(ev.location);
    
    if (typeof ev.description === 'string') {
      setDescriptionVi(ev.description || '');
      setDescriptionEn('');
    } else if (ev.description) {
      setDescriptionVi(ev.description.vi || '');
      setDescriptionEn(ev.description.en || '');
    } else {
      setDescriptionVi('');
      setDescriptionEn('');
    }
    
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
    if (!window.confirm("Xoá sự kiện này?")) return;
    const newList = events.filter((_, i) => i !== idx);
    setEvents(newList);
    saveEvents(newList);
  }

  if (!isAdmin) return null;

  return (
    <div className="bg-white dark:bg-slate-900">
      <section className="container-xl py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="h1 mb-8">Quản Lý Sự Kiện</h1>
          
          {/* Form Section */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editIdx >= 0 ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Mới'}
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
                  <label className="block text-sm font-medium mb-1">Tên sự kiện (Tiếng Việt)</label>
                  <input
                    placeholder="VD: CHÚA NHẬT XXI THƯỜNG NIÊN NĂM C"
                    value={nameVi}
                    onChange={(e) => handleVietnameseInput(e.target.value, setNameVi, setNameEn)}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:bg-slate-800 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên sự kiện (Tiếng Anh)</label>
                  <input
                    placeholder="VD: 21st Sunday in Ordinary Time Year C"
                    value={nameEn}
                    onChange={(e) => handleEnglishInput(e.target.value, setNameEn)}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày</label>
                  <input
                    type="date"
                    placeholder="Ngày"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border border-slate-300 p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giờ</label>
                  <input
                    placeholder="Giờ"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-xl border border-slate-300 p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa điểm</label>
                  <input
                    placeholder="Địa điểm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl border border-slate-300 p-2 w-full"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả (Tiếng Việt)</label>
                  <textarea
                    placeholder="VD: Phấn Đấu Qua Cửa Hẹp..."
                    value={descriptionVi}
                    onChange={(e) => handleVietnameseInput(e.target.value, setDescriptionVi, setDescriptionEn)}
                    className="rounded-xl border border-slate-300 p-2 w-full dark:bg-slate-800 dark:border-slate-700"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả (Tiếng Anh)</label>
                  <div className="relative">
                    <textarea
                      placeholder="VD: Strive Through the Narrow Gate..."
                      value={descriptionEn}
                      onChange={(e) => handleEnglishInput(e.target.value, setDescriptionEn)}
                      className="rounded-xl border border-slate-300 p-2 w-full dark:bg-slate-800 dark:border-slate-700"
                      rows={3}
                    />
                    <button
                      type="button"
                      onClick={() => handleEnglishInput(descriptionEn, setDescriptionEn)}
                      className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                      title="Làm sạch format"
                    >
                      🧹 Format
                    </button>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary w-fit">
                {editIdx >= 0 ? "Cập nhật" : "Thêm sự kiện"}
              </button>
            </form>
          </div>
          <div className="grid gap-4">
            {events.length === 0 && (
              <p
                className="p-muted"
                style={{ color: "var(--color-text-muted)" }}
              >
                Chưa có sự kiện nào.
              </p>
            )}
            {events.map((ev, i) => (
              <div
                key={ev.id}
                className="card"
                style={{
                  background: "var(--color-card)",
                  color: "var(--color-text-main)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h2
                  className="h2 mb-2"
                  style={{ color: "var(--color-heading)" }}
                >
                  {typeof ev.name === 'string' ? ev.name : ev.name.vi}
                </h2>
                <p
                  className="p-muted"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {ev.date} · {ev.time} · {ev.location}
                </p>
                {ev.description && (
                  <p
                    className="p-muted mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {typeof ev.description === 'string' ? ev.description : ev.description.vi}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn btn-outline"
                    style={{
                      color: "var(--color-accent)",
                      borderColor: "var(--color-accent)",
                    }}
                    onClick={() => handleEdit(i)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{
                      color: "var(--color-accent)",
                      borderColor: "var(--color-accent)",
                    }}
                    onClick={() => handleDelete(i)}
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
