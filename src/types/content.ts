// Shared content types

export interface Translation {
  vi: string;
  en: string;
  [key: string]: string;
}

export interface FilterState {
  search: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;   // ISO yyyy-mm-dd
  author: string;
}

export interface DeleteConfirmState {
  show: boolean;
  id: string | null;
}

export interface ReflectionFormData {
  id: string | null;
  title: Translation;
  content: Translation;
  date: string;     // ISO yyyy-mm-dd
  author: string;
}

export interface Reflection extends Omit<ReflectionFormData, 'id'> {
  id: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface Event {
  id: string;
  name: Translation;
  date: string; // ISO yyyy-mm-dd
  time: string; // e.g., '5:00 PM'
  location: string;
  description?: Translation;
  thumbnail?: string; // URL to event thumbnail image
  thumbnailPath?: string; // Firebase Storage path
}
