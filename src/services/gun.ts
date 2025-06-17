import Gun from 'gun';

declare module 'gun' {
  interface IGunInstance<TNode = any> {
    SEA?: any; 
               
  }
}

console.log('🔫 GunJS service file loading...');
console.log('🔫 Imported Gun:', typeof Gun);

// CRITICAL FIX: Import SEA and then modules explicitly
// Using dynamic import instead of require for ES6 compatibility
import 'gun/sea';
import 'gun/lib/then';

console.log('🔫 After importing gun/sea and gun/lib/then');
console.log('🔫 Gun.SEA is available:', !!Gun.SEA);

// Double-check SEA is available
if (!Gun.SEA) {
  console.error('🔫 CRITICAL ERROR: Gun.SEA is NOT DEFINED after import. Trying alternative method...');
  
  // Alternative: Try to access SEA from the Gun instance after creation
  console.log('🔫 Will check SEA availability after Gun instance creation...');
} else {
  console.log('🔫 ✅ Gun.SEA is properly initialized');
  console.log('🔫 Gun.SEA methods:', Gun.SEA ? Object.keys(Gun.SEA) : 'undefined');
}

console.log('🔫 About to initialize Gun instance...');

const gun = Gun({
  peers: ['https://gun-manhattan.herokuapp.com/gun'] 
});

console.log('🔫 GunJS initialized with Manhattan peer');
console.log('🔫 Gun instance created:', typeof gun);
console.log('🔫 Gun instance properties:', Object.keys(gun));

// Check if SEA is available after Gun instance creation
console.log('🔫 Checking Gun.SEA after instance creation:', !!Gun.SEA);

// Sometimes SEA is attached to the gun instance instead of the Gun constructor
// @ts-ignore
if (gun.SEA) {
  console.log('🔫 Found SEA on gun instance:', !!gun.SEA);
  // @ts-ignore
  Gun.SEA = gun.SEA; // Copy to Gun constructor if needed
}

// Test that gun.user() works (this requires Gun.SEA)
console.log('🔫 Testing gun.user() method availability...');
if (typeof gun.user === 'function') {
  console.log('🔫 ✅ gun.user() method is available');
} else {
  console.error('🔫 ❌ gun.user() method is NOT available');
  console.error('🔫 Available gun methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(gun)));
}

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
console.log('🔫 Creating user instance...');

let user: any;
try {
  user = gun.user();
  console.log('🔫 ✅ User instance created successfully:', typeof user);
  console.log('🔫 User instance properties:', Object.keys(user));
  
  // Test user methods that require SEA
  if (typeof user.create === 'function') {
    console.log('🔫 ✅ user.create() method is available');
  } else {
    console.error('🔫 ❌ user.create() method is NOT available');
  }

  if (typeof user.auth === 'function') {
    console.log('🔫 ✅ user.auth() method is available');
  } else {
    console.error('🔫 ❌ user.auth() method is NOT available');
  }
} catch (error) {
  console.error('🔫 ❌ FAILED to create user instance:', error);
  console.error('🔫 This confirms that SEA is not properly loaded');
  
  // Create a dummy user object to prevent further errors
  user = {
    create: () => console.error('SEA not loaded - user.create() unavailable'),
    auth: () => console.error('SEA not loaded - user.auth() unavailable'),
    is: null
  };
}

// SEA for encryption
const SEA = Gun.SEA;
console.log('🔫 SEA reference:', typeof SEA);

if (SEA && typeof SEA.encrypt === 'function') {
  console.log('🔫 ✅ SEA.encrypt() method is available');
} else {
  console.error('🔫 ❌ SEA.encrypt() method is NOT available');
  console.error('🔫 Final Gun.SEA status:', Gun.SEA);
}

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
  SEA: any;  constructor() {
    console.log('GunJS: GunService constructor called');
    this.gun = gun;
    this.user = user;
    this.SEA = SEA;
    console.log('GunJS: GunService initialized');  }

  // Authentication methods
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
          // After successful signup, store the original username in the profile
        this.user.auth(username, password, (authAck: any) => {
          if (!authAck.err) {
            const initialProfile = {
              originalUsername: username,
              displayName: username,
              bio: '',
              favoriteGenres: JSON.stringify([]), // Store as serialized array
              readingGoal: 12,
              joinedDate: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            };
            
            this.user.get('profile').put(initialProfile, () => {
              console.log('🔫 GunJS: Initial profile created with original username');
              this.user.leave(); // Sign out after setup
            });
          }
        });
        
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
      }, 10000);      this.user.auth(username, password, (ack: any) => {
        clearTimeout(timeout);
        console.log('🔫 GunJS: Sign in response:', ack);
        if (ack.err) {
          console.log('🔫 GunJS: Sign in error:', ack.err);
          resolve({ success: false, error: ack.err });
          return;
        }
        console.log('🔫 GunJS: Sign in successful, user:', this.user.is);
          // Check if the profile has originalUsername, if not, store it
        this.user.get('profile').once((profile: any) => {
          if (!profile?.originalUsername) {
            console.log('🔫 GunJS: Storing original username in profile');
            const updatedProfile = {
              ...profile,
              originalUsername: username,
              favoriteGenres: profile?.favoriteGenres || JSON.stringify([]), // Ensure it's serialized
              lastUpdated: new Date().toISOString()
            };
            this.user.get('profile').put(updatedProfile);
          }
        });
        
        resolve({ 
          success: true, 
          user: {
            id: this.user.is.pub,
            username: username, // Use the original username instead of alias
            email: '', // Add empty email field for consistency
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
      username: this.user.is.alias || 'Unknown User' // Fallback for missing alias
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
          
          // Try to get the stored username from profile or use alias as fallback
          this.user.get('profile').once((profile: any) => {
            const storedUsername = profile?.originalUsername || this.user.is.alias || 'Unknown User';
            resolve({
              success: true,
              user: {
                id: this.user.is.pub,
                username: storedUsername,
                email: '',
                createdAt: new Date().toISOString()
              }
            });
          });
        } else {
          console.log('🔫 GunJS: No user to recall');
          resolve({ success: false });
        }
      });
    });
  }  // Profile methods
  async updateProfile(profileData: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: updateProfile timed out');
        resolve({ success: false, error: 'Profile update request timed out' });
      }, 5000);      // First get the existing profile to preserve the originalUsername
      this.user.get('profile').once((existingProfile: any) => {
        console.log('🔫 GunJS: Existing profile:', existingProfile);
        
        // Preserve the originalUsername from existing profile or use alias as fallback
        const originalUsername = existingProfile?.originalUsername || this.user.is.alias;
        
        // Convert arrays to Gun.js compatible format (serialize favoriteGenres)
        const gunCompatibleProfile = {
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          favoriteGenres: JSON.stringify(profileData.favoriteGenres || []), // Serialize array
          readingGoal: profileData.readingGoal || 12,
          joinedDate: profileData.joinedDate || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          originalUsername: originalUsername // Preserve the original username
        };

        console.log('🔫 GunJS: Updating profile with Gun-compatible data:', gunCompatibleProfile);

        this.user.get('profile').put(gunCompatibleProfile, (ack: any) => {
          clearTimeout(timeout);
          console.log('🔫 GunJS: Profile update response:', ack);
          if (ack.err) {
            console.log('🔫 GunJS: Profile update error:', ack.err);
            resolve({ success: false, error: ack.err });
            return;
          }
          console.log('🔫 GunJS: Profile updated successfully');
          
          // Verify the update by reading it back
          this.user.get('profile').once((verifyProfile: any) => {
            console.log('🔫 GunJS: Profile after update:', verifyProfile);
            resolve({ success: true });
          });
        });
      });
    });
  }  async getProfile(): Promise<{ success: boolean; profile?: any; error?: string }> {
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
        console.log('🔫 GunJS: Raw profile loaded:', profile);
        
        if (profile) {
          // Deserialize favoriteGenres array and clean up Gun.js metadata
          const cleanProfile = {
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            favoriteGenres: profile.favoriteGenres ? JSON.parse(profile.favoriteGenres) : [],
            readingGoal: profile.readingGoal || 12,
            joinedDate: profile.joinedDate,
            lastUpdated: profile.lastUpdated,
            originalUsername: profile.originalUsername
          };
          console.log('🔫 GunJS: Cleaned profile:', cleanProfile);
          resolve({ success: true, profile: cleanProfile });
        } else {
          resolve({ success: true, profile: {} });
        }
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
