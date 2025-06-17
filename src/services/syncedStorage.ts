import { Book, ReadingSession, ReadingNote, VirtualPet, ReadingStats, UserSettings, ReadingStreak } from '../types';
import gunService from './gun';

class SyncedStorageService {
  private isOnline = true;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async syncData(key: string, data: any): Promise<void> {
    if (gunService.isAuthenticated() && this.isOnline) {
      try {
        await gunService.syncUserData(key, data);
      } catch (error) {
        console.warn('Failed to sync data to server:', error);
        // Continue with local storage as fallback
      }
    }
  }

  private async getData<T>(key: string, defaultValue: T): Promise<T> {
    if (gunService.isAuthenticated() && this.isOnline) {
      try {
        const result = await gunService.getUserData(key);
        if (result.success && result.data && Object.keys(result.data).length > 0) {
          return result.data as T;
        }
      } catch (error) {
        console.warn('Failed to get data from server:', error);
      }
    }
    
    // Fallback to local storage
    const item = localStorage.getItem(`bookish_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(`bookish_${key}`, JSON.stringify(value));
  }

  private async syncPendingChanges(): Promise<void> {
    if (!gunService.isAuthenticated()) return;

    // Sync all data types
    const dataTypes = ['books', 'current_book', 'reading_sessions', 'notes', 'pet', 'stats', 'settings', 'streak'];
    
    for (const dataType of dataTypes) {
      try {
        const localData = localStorage.getItem(`bookish_${dataType}`);
        if (localData) {
          await gunService.syncUserData(dataType, JSON.parse(localData));
        }
      } catch (error) {
        console.warn(`Failed to sync ${dataType}:`, error);
      }
    }
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return this.getData<Book[]>('books', []);
  }

  async saveBooks(books: Book[]): Promise<void> {
    this.setLocalStorage('books', books);
    await this.syncData('books', books);
  }

  async getCurrentBook(): Promise<Book | null> {
    return this.getData<Book | null>('current_book', null);
  }

  async setCurrentBook(book: Book | null): Promise<void> {
    this.setLocalStorage('current_book', book);
    await this.syncData('current_book', book);
  }

  // Reading Sessions
  async getReadingSessions(): Promise<ReadingSession[]> {
    return this.getData<ReadingSession[]>('reading_sessions', []);
  }

  async saveReadingSessions(sessions: ReadingSession[]): Promise<void> {
    this.setLocalStorage('reading_sessions', sessions);
    await this.syncData('reading_sessions', sessions);
  }

  // Notes
  async getNotes(): Promise<ReadingNote[]> {
    return this.getData<ReadingNote[]>('notes', []);
  }

  async saveNotes(notes: ReadingNote[]): Promise<void> {
    this.setLocalStorage('notes', notes);
    await this.syncData('notes', notes);
  }

  // Pet
  async getPet(): Promise<VirtualPet> {
    const defaultPet: VirtualPet = {
      name: 'Bookworm',
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      happiness: 80,
      lastFed: new Date().toISOString(),
    };
    return this.getData<VirtualPet>('pet', defaultPet);
  }

  async savePet(pet: VirtualPet): Promise<void> {
    this.setLocalStorage('pet', pet);
    await this.syncData('pet', pet);
  }

  // Stats
  async getStats(): Promise<ReadingStats> {
    const defaultStats: ReadingStats = {
      totalBooksRead: 0,
      totalPagesRead: 0,
      totalReadingTime: 0,
      readingTimeToday: 0,
      readingTimeThisWeek: 0,
      booksFinishedThisYear: 0,
    };
    return this.getData<ReadingStats>('stats', defaultStats);
  }

  async saveStats(stats: ReadingStats): Promise<void> {
    this.setLocalStorage('stats', stats);
    await this.syncData('stats', stats);
  }

  // Settings
  async getSettings(): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      reminders: [],
      theme: 'light',
      petName: 'Bookworm',
    };
    return this.getData<UserSettings>('settings', defaultSettings);
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    this.setLocalStorage('settings', settings);
    await this.syncData('settings', settings);
  }

  // Streak
  async getStreak(): Promise<ReadingStreak> {
    const defaultStreak: ReadingStreak = {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
    return this.getData<ReadingStreak>('streak', defaultStreak);
  }

  async saveStreak(streak: ReadingStreak): Promise<void> {
    this.setLocalStorage('streak', streak);
    await this.syncData('streak', streak);
  }

  // Migration method to sync existing local data to server
  async migrateLocalDataToServer(): Promise<void> {
    if (!gunService.isAuthenticated()) return;

    const dataTypes = [
      { key: 'books', getter: () => JSON.parse(localStorage.getItem('bookish_books') || '[]') },
      { key: 'current_book', getter: () => JSON.parse(localStorage.getItem('bookish_current_book') || 'null') },
      { key: 'reading_sessions', getter: () => JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]') },
      { key: 'notes', getter: () => JSON.parse(localStorage.getItem('bookish_notes') || '[]') },
      { key: 'pet', getter: () => JSON.parse(localStorage.getItem('bookish_pet') || 'null') },
      { key: 'stats', getter: () => JSON.parse(localStorage.getItem('bookish_stats') || 'null') },
      { key: 'settings', getter: () => JSON.parse(localStorage.getItem('bookish_settings') || 'null') },
      { key: 'streak', getter: () => JSON.parse(localStorage.getItem('bookish_streak') || 'null') },
    ];

    for (const dataType of dataTypes) {
      try {
        const localData = dataType.getter();
        if (localData !== null && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0)) {
          await gunService.syncUserData(dataType.key, localData);
        }
      } catch (error) {
        console.warn(`Failed to migrate ${dataType.key}:`, error);
      }
    }
  }
}

export const syncedStorage = new SyncedStorageService();
export default syncedStorage;
