// Shared content types

export interface Translation {
  vi: string;
  en: string;
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
