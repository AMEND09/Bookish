export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  description?: string;
  number_of_pages_median?: number;
  category?: 'reading' | 'completed' | 'wishlist';
  completedAt?: string;
  addedAt?: string;
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

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  profile?: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    favoriteGenres?: string[];
    readingGoal?: number; // books per year
    joinedDate?: string;
    originalUsername?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Friend and Social Features
export interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  status: 'pending' | 'accepted' | 'blocked';
  addedAt: string;
  stats?: {
    totalBooksRead: number;
    totalPagesRead: number;
    totalReadingTime: number;
    currentStreak: number;
  };
  recentActivity?: FriendActivity[];
}

export interface FriendActivity {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  type: 'book_completed' | 'reading_session' | 'note_added' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: string;
  bookTitle?: string;
  bookCover?: string;
  metadata?: {
    pagesRead?: number;
    duration?: number;
    achievement?: string;
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  rank: number;
  score: number;
  period: 'week' | 'month' | 'year' | 'alltime';
  metric: 'books_read' | 'pages_read' | 'reading_time' | 'streak';
  details?: {
    booksRead?: number;
    pagesRead?: number;
    readingTime?: number;
    currentStreak?: number;
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName?: string;
  toUserId: string;
  toUsername?: string;
  toDisplayName?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}