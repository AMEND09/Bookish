// localStorage utility for guest user data persistence

import { UserSettings } from '../types';

export const LOCAL_STORAGE_KEYS = {
  GUEST_PROFILE: 'bookish-guest-profile',
  GUEST_BOOKS: 'bookish-guest-books',
  GUEST_READING_SESSIONS: 'bookish-guest-reading-sessions',
  GUEST_NOTES: 'bookish-guest-notes',
  GUEST_PET: 'bookish-guest-pet',
  USER_SETTINGS: 'bookish-user-settings'
} as const;

export class LocalStorageService {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      // Only clear Bookish-related keys
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Guest-specific helpers
  static getGuestProfile() {
    return this.get(LOCAL_STORAGE_KEYS.GUEST_PROFILE);
  }

  static setGuestProfile(profile: any) {
    return this.set(LOCAL_STORAGE_KEYS.GUEST_PROFILE, {
      ...profile,
      lastUpdated: new Date().toISOString()
    });
  }

  static getGuestBooks() {
    return this.get(LOCAL_STORAGE_KEYS.GUEST_BOOKS) || [];
  }

  static setGuestBooks(books: any[]) {
    return this.set(LOCAL_STORAGE_KEYS.GUEST_BOOKS, {
      books,
      lastUpdated: new Date().toISOString()
    });
  }

  static getGuestPet() {
    return this.get(LOCAL_STORAGE_KEYS.GUEST_PET);
  }

  static setGuestPet(pet: any) {
    return this.set(LOCAL_STORAGE_KEYS.GUEST_PET, {
      ...pet,
      lastUpdated: new Date().toISOString()
    });
  }
  // User settings helpers
  static getUserSettings(): UserSettings | null {
    return this.get<UserSettings>(LOCAL_STORAGE_KEYS.USER_SETTINGS);
  }

  static saveUserSettings(settings: UserSettings) {
    return this.set(LOCAL_STORAGE_KEYS.USER_SETTINGS, {
      ...settings,
      lastUpdated: new Date().toISOString()
    });
  }
}

export default LocalStorageService;
