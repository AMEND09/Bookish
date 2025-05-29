import { Book, ReadingSession, ReadingNote, VirtualPet, ReadingStats, UserSettings, ReadingStreak } from '../types';
import { estimatePageCount } from './api';

// Local storage keys
const BOOKS_KEY = 'bookish_books';
const CURRENT_BOOK_KEY = 'bookish_current_book';
const SESSIONS_KEY = 'bookish_reading_sessions';
const NOTES_KEY = 'bookish_notes';
const PET_KEY = 'bookish_pet';
const STATS_KEY = 'bookish_stats';
const SETTINGS_KEY = 'bookish_settings';
const STREAK_KEY = 'bookish_streak';
const CACHED_BOOKS_KEY = 'bookish_cached_books';

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Books
export const getBooks = (): Book[] => {
  return getItem<Book[]>(BOOKS_KEY, []);
};

export const getCachedBookDetails = (bookKey: string): Book | null => {
  const cachedBooks = getItem<Record<string, Book & { cached_at: string }>>(CACHED_BOOKS_KEY, {});
  return cachedBooks[bookKey] || null;
};

export const cacheBookDetails = (book: Book): void => {
  const cachedBooks = getItem<Record<string, Book & { cached_at: string }>>(CACHED_BOOKS_KEY, {});
  cachedBooks[book.key] = {
    ...book,
    cached_at: new Date().toISOString()
  } as Book & { cached_at: string };
  setItem(CACHED_BOOKS_KEY, cachedBooks);
};

export const clearExpiredCache = (maxAgeHours: number = 24 * 7): void => {
  const cachedBooks = getItem<Record<string, Book & { cached_at: string }>>(CACHED_BOOKS_KEY, {});
  const now = new Date().getTime();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  
  Object.keys(cachedBooks).forEach(key => {
    const book = cachedBooks[key];
    if (book.cached_at && (now - new Date(book.cached_at).getTime()) > maxAge) {
      delete cachedBooks[key];
    }
  });
  
  setItem(CACHED_BOOKS_KEY, cachedBooks);
};

export const saveBook = (book: Book): void => {
  const books = getBooks();
  const existingBookIndex = books.findIndex(b => b.key === book.key);
  
  if (existingBookIndex >= 0) {
    books[existingBookIndex] = { ...books[existingBookIndex], ...book };
  } else {
    books.push(book);
  }
  
  setItem(BOOKS_KEY, books);
  
  // Cache book details for offline access
  cacheBookDetails(book);
};

export const removeBook = (bookKey: string): void => {
  const books = getBooks().filter(book => book.key !== bookKey);
  setItem(BOOKS_KEY, books);
  
  // Remove from cache as well
  const cachedBooks = getItem<Record<string, Book & { cached_at: string }>>(CACHED_BOOKS_KEY, {});
  delete cachedBooks[bookKey];
  setItem(CACHED_BOOKS_KEY, cachedBooks);
};

// Current book
export const getCurrentBook = (): Book | null => {
  return getItem<Book | null>(CURRENT_BOOK_KEY, null);
};

export const setCurrentBook = (book: Book | null): void => {
  setItem(CURRENT_BOOK_KEY, book);
};

// Reading sessions
export const getSessions = (): ReadingSession[] => {
  return getItem<ReadingSession[]>(SESSIONS_KEY, []);
};

export const saveSession = (session: ReadingSession): void => {
  const sessions = getSessions();
  const existingSessionIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingSessionIndex >= 0) {
    sessions[existingSessionIndex] = session;
  } else {
    sessions.push(session);
  }
  
  setItem(SESSIONS_KEY, sessions);
  updateStats();
  updateStreak();
};

export const getSessionsByBook = (bookId: string): ReadingSession[] => {
  return getSessions().filter(session => session.bookId === bookId);
};

// Notes
export const getNotes = (): ReadingNote[] => {
  const notes = localStorage.getItem('bookish_notes');
  return notes ? JSON.parse(notes) : [];
};

export const saveNote = (note: ReadingNote): void => {
  const notes = getNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  
  localStorage.setItem('bookish_notes', JSON.stringify(notes));
};

export const getNotesByBook = (bookId: string): ReadingNote[] => {
  return getNotes().filter(note => note.bookId === bookId);
};

export const removeNote = (noteId: string): void => {
  const notes = getNotes().filter(note => note.id !== noteId);
  setItem(NOTES_KEY, notes);
};

// Virtual pet
export const getDefaultPet = (): VirtualPet => ({
  name: 'Bookworm',
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  happiness: 80,
  lastFed: new Date().toISOString()
});

export const getPet = (): VirtualPet => {
  return getItem<VirtualPet>(PET_KEY, getDefaultPet());
};

export const savePet = (pet: VirtualPet): void => {
  setItem(PET_KEY, pet);
};

export const feedPet = (minutes: number): VirtualPet => {
  const pet = getPet();
  const expGain = Math.floor(minutes / 5); // 1 exp per 5 minutes of reading
  
  let newExp = pet.experience + expGain;
  let newLevel = pet.level;
  
  // Level up if enough experience
  while (newExp >= pet.experienceToNextLevel) {
    newExp -= pet.experienceToNextLevel;
    newLevel++;
  }
  
  const newPet: VirtualPet = {
    ...pet,
    level: newLevel,
    experience: newExp,
    experienceToNextLevel: 100 + (newLevel - 1) * 50, // More exp needed for higher levels
    happiness: Math.min(100, pet.happiness + Math.floor(minutes / 10)),
    lastFed: new Date().toISOString()
  };
  
  savePet(newPet);
  return newPet;
};

// Reading stats
export const getDefaultStats = (): ReadingStats => ({
  totalBooksRead: 0,
  totalPagesRead: 0,
  totalReadingTime: 0,
  readingTimeToday: 0,
  readingTimeThisWeek: 0,
  booksFinishedThisYear: 0
});

export const getStats = (): ReadingStats => {
  return getItem<ReadingStats>(STATS_KEY, getDefaultStats());
};

export const updateStats = (): void => {
  const sessions = getSessions();
  const books = getBooks();
  
  // Calculate total reading time
  const totalReadingTime = sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  // Calculate today's reading time
  const today = new Date().setHours(0, 0, 0, 0);
  const readingTimeToday = sessions.reduce((total, session) => {
    const sessionDate = new Date(session.startTime).setHours(0, 0, 0, 0);
    return sessionDate === today ? total + (session.duration || 0) : total;
  }, 0);
  
  // Calculate this week's reading time
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const readingTimeThisWeek = sessions.reduce((total, session) => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startOfWeek ? total + (session.duration || 0) : total;
  }, 0);
  
  // Estimate total pages read - handle missing page counts
  const totalPagesRead = sessions.reduce((total, session) => {
    const pagesInSession = (session.endPage || 0) - (session.startPage || 0);
    return total + Math.max(0, pagesInSession);
  }, 0);
  
  // Count finished books this year - improved logic
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const finishedBookIds = new Set();
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    if (sessionDate >= startOfYear && session.endPage) {
      const book = books.find(b => b.key === session.bookId);
      if (book) {
        const bookPageCount = book.number_of_pages_median;
        
        if (bookPageCount && session.endPage >= bookPageCount) {
          finishedBookIds.add(session.bookId);
        } else if (!bookPageCount) {
          // For books without page count, consider 90% of estimated pages as complete
          const estimatedPages = estimatePageCount(book);
          if (session.endPage >= estimatedPages * 0.9) {
            finishedBookIds.add(session.bookId);
          }
        }
      }
    }
  });
  
  // Also check for books explicitly marked as completed
  const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
  savedBooks.forEach((book: any) => {
    if (book.category === 'completed') {
      finishedBookIds.add(book.key);
    }
  });
  
  const stats: ReadingStats = {
    totalBooksRead: finishedBookIds.size,
    totalPagesRead,
    totalReadingTime,
    readingTimeToday,
    readingTimeThisWeek,
    booksFinishedThisYear: finishedBookIds.size
  };
  
  setItem(STATS_KEY, stats);
};

// User settings
export const getDefaultSettings = (): UserSettings => ({
  reminders: [
    {
      enabled: true,
      time: '20:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }
  ],
  theme: 'light',
  petName: 'Bookworm'
});

export const getSettings = (): UserSettings => {
  return getItem<UserSettings>(SETTINGS_KEY, getDefaultSettings());
};

export const saveSettings = (settings: UserSettings): void => {
  setItem(SETTINGS_KEY, settings);
};

// Reading streak
export const getDefaultStreak = (): ReadingStreak => ({
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null
});

export const getStreak = (): ReadingStreak => {
  return getItem<ReadingStreak>(STREAK_KEY, getDefaultStreak());
};

export const updateStreak = (): void => {
  const streak = getStreak();
  const today = new Date().setHours(0, 0, 0, 0);
  const lastReadDate = streak.lastReadDate ? new Date(streak.lastReadDate).setHours(0, 0, 0, 0) : null;
  
  if (lastReadDate === today) {
    // Already read today, no change needed
    return;
  }
  
  let newStreak = streak.currentStreak;
  
  if (lastReadDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    if (lastReadDate === yesterday.getTime()) {
      // Read yesterday, increment streak
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  } else {
    // First time reading
    newStreak = 1;
  }
  
  const newStreakData: ReadingStreak = {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak.longestStreak),
    lastReadDate: new Date().toISOString()
  };
  
  setItem(STREAK_KEY, newStreakData);
};