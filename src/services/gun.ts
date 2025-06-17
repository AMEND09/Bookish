import Gun from 'gun';
import 'gun/sea';
import 'gun/lib/then';

console.log('🔫 GunJS service file loading...');

// Initialize Gun with multiple reliable peers for better connectivity
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://peer.evidently.digital/gun',
    'https://gunmeetingserver.herokuapp.com/gun'
  ]
});

console.log('🔫 GunJS initialized with multiple peers');

// Add connection debugging with better error handling
gun.on('hi', (peer: any) => {
  console.log('🔫 GunJS: Connected to peer', peer);
});

gun.on('bye', (peer: any) => {
  console.log('🔫 GunJS: Disconnected from peer', peer);
});

gun.on('out', (msg: any) => {
  if (msg && msg.err) {
    console.warn('🔫 GunJS: Connection error:', msg.err);
  }
});

// Test connection after a short delay
setTimeout(() => {
  console.log('🔫 GunJS connection test - gun object:', gun);
  console.log('🔫 GunJS internal state:', gun._);
  
  // Test basic functionality
  gun.get('test').put({ hello: 'world', timestamp: Date.now() });
  console.log('🔫 GunJS: Test data written');
}, 2000);

// User instance
const user = gun.user();

// SEA for encryption
const SEA = Gun.SEA;

export interface GunUser {
  is: {
    pub: string;
    alias: string;
  };
  pair: () => any;
}

class GunService {
  gun: any;
  user: any;
  SEA: any;
  constructor() {
    console.log('GunJS: GunService constructor called');
    this.gun = gun;
    this.user = user;
    this.SEA = SEA;
    console.log('GunJS: GunService initialized');
  }  // Authentication methods
  async signUp(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    console.log('🔫 GunJS: Attempting to sign up user:', username);
    return new Promise((resolve) => {
      if (password.length < 8) {
        console.log('🔫 GunJS: Password too short');
        resolve({ success: false, error: 'Password must be at least 8 characters' });
        return;
      }

      // Add timeout for signup attempts
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: Sign up timed out');
        resolve({ success: false, error: 'Sign up request timed out. Please check your connection.' });
      }, 10000);

      this.user.create(username, password, (ack: any) => {
        clearTimeout(timeout);
        console.log('🔫 GunJS: Sign up response:', ack);
        if (ack.err) {
          console.log('🔫 GunJS: Sign up error:', ack.err);
          resolve({ success: false, error: ack.err });
          return;
        }
        console.log('🔫 GunJS: Sign up successful');
        resolve({ success: true });
      });
    });
  }

  async signIn(username: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    console.log('🔫 GunJS: Attempting to sign in user:', username);
    return new Promise((resolve) => {
      // Add timeout for signin attempts
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: Sign in timed out');
        resolve({ success: false, error: 'Sign in request timed out. Please check your connection.' });
      }, 10000);

      this.user.auth(username, password, (ack: any) => {
        clearTimeout(timeout);
        console.log('🔫 GunJS: Sign in response:', ack);
        if (ack.err) {
          console.log('🔫 GunJS: Sign in error:', ack.err);
          resolve({ success: false, error: ack.err });
          return;
        }
        console.log('🔫 GunJS: Sign in successful, user:', this.user.is);
        resolve({ 
          success: true, 
          user: {
            id: this.user.is.pub,
            username: this.user.is.alias,
            createdAt: new Date().toISOString()
          }
        });
      });
    });
  }

  signOut(): void {
    this.user.leave();
  }

  isAuthenticated(): boolean {
    return !!this.user.is;
  }

  getCurrentUser(): any {
    if (!this.user.is) return null;
    return {
      id: this.user.is.pub,
      username: this.user.is.alias
    };
  }  // Check if user is already authenticated (session storage)
  async recallUser(): Promise<{ success: boolean; user?: any }> {
    return new Promise((resolve) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: recallUser timed out');
        resolve({ success: false });
      }, 3000);

      this.user.recall({ sessionStorage: true }, () => {
        clearTimeout(timeout);
        if (this.user.is) {
          console.log('🔫 GunJS: User recalled successfully:', this.user.is.alias);
          resolve({
            success: true,
            user: {
              id: this.user.is.pub,
              username: this.user.is.alias,
              createdAt: new Date().toISOString()
            }
          });
        } else {
          console.log('🔫 GunJS: No user to recall');
          resolve({ success: false });
        }
      });
    });
  }

  // Profile methods
  async updateProfile(profileData: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('profile').put(profileData, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }
  async getProfile(): Promise<{ success: boolean; profile?: any; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: getProfile timed out');
        resolve({ success: false, error: 'Profile request timed out' });
      }, 3000);

      this.user.get('profile').once((profile: any) => {
        clearTimeout(timeout);
        console.log('🔫 GunJS: Profile loaded:', profile);
        resolve({ success: true, profile: profile || {} });
      });
    });
  }
  // Data sync methods for user's books, notes, reading sessions, etc.
  async syncUserBooks(books: any[]): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('books').put(books, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async getUserBooks(): Promise<{ success: boolean; books?: any[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('books').once((books: any) => {
        resolve({ success: true, books: books || [] });
      });
    });
  }

  async syncUserNotes(notes: any[]): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('notes').put(notes, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async getUserNotes(): Promise<{ success: boolean; notes?: any[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('notes').once((notes: any) => {
        resolve({ success: true, notes: notes || [] });
      });
    });
  }

  async syncUserSessions(sessions: any[]): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('sessions').put(sessions, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async getUserSessions(): Promise<{ success: boolean; sessions?: any[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('sessions').once((sessions: any) => {
        resolve({ success: true, sessions: sessions || [] });
      });
    });
  }

  async syncPetData(petData: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('pet').put(petData, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async getUserPetData(): Promise<{ success: boolean; petData?: any; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get('pet').once((petData: any) => {
        resolve({ success: true, petData: petData || null });
      });
    });
  }

  // Generic data sync methods for backward compatibility
  async syncUserData(dataType: string, data: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get(dataType).put(data, (ack: any) => {
        if (ack.err) {
          resolve({ success: false, error: ack.err });
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async getUserData(dataType: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      this.user.get(dataType).once((data: any) => {
        resolve({ success: true, data: data || {} });
      });
    });
  }

  // Subscribe to user data changes
  subscribeToUserData(dataType: string, callback: (data: any) => void): void {
    if (!this.user.is) return;

    this.user.get(dataType).on(callback);
  }

  // Unsubscribe from user data changes
  unsubscribeFromUserData(dataType: string): void {
    if (!this.user.is) return;

    this.user.get(dataType).off();
  }
}

export const gunService = new GunService();
export default gunService;
