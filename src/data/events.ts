import type { Translation } from '../types/content';

export type Event = {
  id: string;
  name: Translation;
  date: string; // ISO yyyy-mm-dd
  time: string; // e.g., '5:00 PM'
  location: string;
  description?: Translation;
  thumbnail?: string; // URL to event thumbnail image
  thumbnailPath?: string; // Firebase Storage path
}


export const EVENTS: Event[] = [
  {
    id: 'sunday-mass',
    name: {
      vi: 'CHÚA NHẬT XXI THƯỜNG NIÊN NĂM C',
      en: '21st Sunday in Ordinary Time Year C'
    },
    date: '2025-08-24',
    time: '5:00 PM',
    location: '17 Stevens Rd, Vermont VIC 3133',
    description: {
      vi: 'Phấn Ðấu Qua Cửa Hẹp (Is 66,18-21; Dt 12,5-7.11-13; Lc 13,22-30)',
      en: 'Strive to Enter Through the Narrow Gate (Is 66:18-21; Heb 12:5-7,11-13; Lk 13:22-30)'
    },
  },
  {
    id: 'sunday-mass-next',
    name: {
      vi: 'CHÚA NHẬT XXII THƯỜNG NIÊN NĂM C',
      en: '22nd Sunday in Ordinary Time Year C'
    },
    date: '2025-08-31',
    time: '5:00 PM',
    location: '17 Stevens Rd, Vermont VIC 3133',
    description: {
      vi: 'Nước Trời Dành Cho Kẻ Khiêm Nhượng Bác Ái (Hc 3,19-21.30-31; Dt 12,18-19.22-24; Lc 14,1.7-14)',
      en: 'The Kingdom of Heaven for the Humble and Charitable (Sir 3:19-21,30-31; Heb 12:18-19,22-24; Lk 14:1,7-14)'
    },
  },
];