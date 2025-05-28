export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  description?: string;
  number_of_pages_median?: number;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startPage: number;
  endPage: number | null;
  startTime: string;
  endTime: string | null;
  duration: number | null; // in minutes
}

export interface ReadingNote {
  id: string;
  bookId: string;
  page?: number;
  chapter?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export interface VirtualPet {
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  happiness: number; // 0-100
  lastFed: string;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingTime: number; // in minutes
  readingTimeToday: number; // in minutes
  readingTimeThisWeek: number; // in minutes
  booksFinishedThisYear: number;
}

export interface ReadingReminder {
  enabled: boolean;
  time: string; // HH:MM format
  days: string[]; // 'monday', 'tuesday', etc.
}

export interface UserSettings {
  reminders: ReadingReminder[];
  theme: 'light' | 'dark';
  petName: string;
}