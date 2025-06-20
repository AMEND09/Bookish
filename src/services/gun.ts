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
  peers: ['https://gun-ad4i.onrender.com/gun',
          'https://bewildered-dulcy-amend09-294cb39e.koyeb.app/gun',
          'https://amend09.hackclub.app/gun'
  ] 
});

console.log('🔫 GunJS initialized with Render peer and Nest peer');
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
              
              // Add user to public users index
              this.addToPublicUsersIndex(username, username);
              
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
          
          // Add user to public users index on signin
          this.addToPublicUsersIndex(username, profile?.displayName || username);
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

  // User search and public profile methods
  async addToPublicUsersIndex(username: string, displayName?: string): Promise<void> {
    try {
      if (!this.user.is) return;
      
      const userEntry = {
        id: this.user.is.pub,
        username: username,
        displayName: displayName || username,
        joinedAt: new Date().toISOString()
      };
      
      // Add to public users index
      this.gun.get('publicUsers').get(this.user.is.pub).put(userEntry);
      
      console.log('🔫 GunJS: Added user to public index:', userEntry);
    } catch (err) {
      console.error('🔫 GunJS: Error adding user to public index:', err);
    }
  }

  async searchPublicUsers(query: string): Promise<{ id: string; username: string; displayName?: string }[]> {
    return new Promise((resolve) => {
      if (!query.trim()) {
        resolve([]);
        return;
      }

      const results: { id: string; username: string; displayName?: string }[] = [];
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: User search timed out');
        resolve(results);
      }, 5000);

      try {
        this.gun.get('publicUsers').map().on((userData: any) => {
          if (userData && userData.username && userData.id) {
            const matchesQuery = 
              userData.username.toLowerCase().includes(query.toLowerCase()) ||
              (userData.displayName && userData.displayName.toLowerCase().includes(query.toLowerCase()));
            
            if (matchesQuery && userData.id !== this.user.is?.pub) {
              // Check if already in results
              const existingIndex = results.findIndex(r => r.id === userData.id);
              if (existingIndex === -1) {
                results.push({
                  id: userData.id,
                  username: userData.username,
                  displayName: userData.displayName
                });
              }
            }
          }
        });

        // Return results after a short delay to allow for data collection
        setTimeout(() => {
          clearTimeout(timeout);
          resolve(results);
        }, 2000);
      } catch (err) {
        clearTimeout(timeout);
        console.error('🔫 GunJS: Error searching users:', err);
        resolve([]);
      }
    });
  }

  async getPublicProfile(userId: string): Promise<{ success: boolean; profile?: any; error?: string }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Profile request timed out' });
      }, 3000);

      try {
        this.gun.get('publicUsers').get(userId).once((userData: any) => {
          clearTimeout(timeout);
          if (userData) {
            resolve({ success: true, profile: userData });
          } else {
            resolve({ success: false, error: 'User not found' });
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        resolve({ success: false, error: 'Error fetching profile' });
      }
    });
  }

  // Friend request methods
  async sendFriendRequest(fromUserId: string, fromUsername: string, fromDisplayName: string, toUserId: string, toUsername: string, toDisplayName: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.user.is) {
        return { success: false, error: 'User not authenticated' };
      }

      const requestId = `req_${Date.now()}_${fromUserId}_${toUserId}`;
      const friendRequest = {
        id: requestId,
        fromUserId,
        fromUsername,
        fromDisplayName,
        toUserId,
        toUsername,
        toDisplayName,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Store the request in both users' friend request collections
      this.gun.get('friendRequests').get(toUserId).get(requestId).put(friendRequest);
      this.gun.get('sentRequests').get(fromUserId).get(requestId).put(friendRequest);

      return { success: true };
    } catch (err) {
      console.error('🔫 GunJS: Error sending friend request:', err);
      return { success: false, error: 'Failed to send friend request' };
    }
  }

  async getFriendRequests(): Promise<{ success: boolean; requests?: any[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      const requests: any[] = [];
      const timeout = setTimeout(() => {
        resolve({ success: true, requests });
      }, 3000);

      try {
        this.gun.get('friendRequests').get(this.user.is.pub).map().on((request: any) => {
          if (request && request.id && request.status === 'pending') {
            const existingIndex = requests.findIndex(r => r.id === request.id);
            if (existingIndex === -1) {
              requests.push(request);
            }
          }
        });

        setTimeout(() => {
          clearTimeout(timeout);
          resolve({ success: true, requests });
        }, 2000);
      } catch (err) {
        clearTimeout(timeout);
        resolve({ success: false, error: 'Error fetching friend requests' });
      }
    });
  }
  async acceptFriendRequest(requestId: string, fromUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.user.is) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('🔫 GunJS: Accepting friend request:', requestId, 'from:', fromUserId);

      // Update the request status
      const updatedRequest = {
        status: 'accepted',
        respondedAt: new Date().toISOString()
      };

      // Update request in both locations
      this.gun.get('friendRequests').get(this.user.is.pub).get(requestId).put(updatedRequest);
      this.gun.get('sentRequests').get(fromUserId).get(requestId).put(updatedRequest);

      // Create bidirectional friendship
      const friendshipId = [this.user.is.pub, fromUserId].sort().join('_');
      const friendship = {
        id: friendshipId,
        user1: this.user.is.pub,
        user2: fromUserId,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      console.log('🔫 GunJS: Creating friendship:', friendshipId);
      this.gun.get('friendships').get(friendshipId).put(friendship);

      // Also store in a reverse lookup for faster queries
      this.gun.get('userFriends').get(this.user.is.pub).get(fromUserId).put({
        friendId: fromUserId,
        since: new Date().toISOString()
      });
      
      this.gun.get('userFriends').get(fromUserId).get(this.user.is.pub).put({
        friendId: this.user.is.pub,
        since: new Date().toISOString()
      });

      console.log('🔫 GunJS: Friend request accepted successfully');
      return { success: true };
    } catch (err) {
      console.error('🔫 GunJS: Error accepting friend request:', err);
      return { success: false, error: 'Failed to accept friend request' };
    }
  }

  async declineFriendRequest(requestId: string, fromUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.user.is) {
        return { success: false, error: 'User not authenticated' };
      }

      // Update the request status
      const updatedRequest = {
        status: 'declined',
        respondedAt: new Date().toISOString()
      };

      this.gun.get('friendRequests').get(this.user.is.pub).get(requestId).put(updatedRequest);
      this.gun.get('sentRequests').get(fromUserId).get(requestId).put(updatedRequest);

      return { success: true };
    } catch (err) {
      console.error('🔫 GunJS: Error declining friend request:', err);
      return { success: false, error: 'Failed to decline friend request' };
    }
  }
  async getFriends(): Promise<{ success: boolean; friends?: any[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.user.is) {
        resolve({ success: false, error: 'User not authenticated' });
        return;
      }

      const friends: any[] = [];
      const processedFriendships = new Set<string>();
      let processingCount = 0;

      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: getFriends timeout, returning', friends.length, 'friends');
        resolve({ success: true, friends });
      }, 4000);

      try {
        // Listen for all friendships
        this.gun.get('friendships').map().on((friendship: any, key: string) => {
          if (!friendship || !key || processedFriendships.has(key)) {
            return;
          }

          if (friendship.user1 === this.user.is.pub || friendship.user2 === this.user.is.pub) {
            processedFriendships.add(key);
            processingCount++;
            
            const friendId = friendship.user1 === this.user.is.pub ? friendship.user2 : friendship.user1;
            
            // Get friend's public profile
            this.gun.get('publicUsers').get(friendId).once((friendData: any) => {
              processingCount--;
              
              if (friendData && !friends.find(f => f.id === friendId)) {
                friends.push({
                  id: friendId,
                  username: friendData.username,
                  displayName: friendData.displayName,
                  status: 'accepted',
                  addedAt: friendship.createdAt
                });
                console.log('🔫 GunJS: Added friend:', friendData.username);
              }
              
              // If we've finished processing and have been waiting, resolve
              if (processingCount === 0) {
                setTimeout(() => {
                  clearTimeout(timeout);
                  resolve({ success: true, friends });
                }, 500); // Small delay to ensure all data is processed
              }
            });
          }
        });

        // Also resolve after a reasonable time even if we're still processing
        setTimeout(() => {
          if (processingCount === 0) {
            clearTimeout(timeout);
            resolve({ success: true, friends });
          }
        }, 2000);
        
      } catch (err) {
        clearTimeout(timeout);
        resolve({ success: false, error: 'Error fetching friends' });
      }
    });
  }

  async removeFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.user.is) {
        return { success: false, error: 'User not authenticated' };
      }      // Remove the friendship
      const friendshipId = [this.user.is.pub, friendId].sort().join('_');
      this.gun.get('friendships').get(friendshipId).put(null);

      return { success: true };
    } catch (err) {
      console.error('🔫 GunJS: Error removing friend:', err);
      return { success: false, error: 'Failed to remove friend' };
    }
  }
  // Public stats methods for leaderboard functionality  // Public stats methods for leaderboard functionality
  async updatePublicStats(stats: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        if (!this.user.is) {
          console.error('🔫 GunJS: Cannot update public stats - user not authenticated');
          resolve({ success: false, error: 'User not authenticated' });
          return;
        }

        const publicStats = {
          userId: this.user.is.pub,
          totalBooksRead: stats.totalBooksRead || 0,
          totalPagesRead: stats.totalPagesRead || 0,
          totalReadingTime: stats.totalReadingTime || 0,
          currentStreak: stats.currentStreak || 0,
          lastUpdated: new Date().toISOString()
        };

        console.log('🔫 GunJS: Updating public stats for user:', this.user.is.pub);
        console.log('🔫 GunJS: Stats being updated:', publicStats);

        // Store public stats for leaderboard with callback to ensure success
        this.gun.get('publicStats').get(this.user.is.pub).put(publicStats, (ack: any) => {
          if (ack.err) {
            console.error('🔫 GunJS: ❌ Error updating public stats:', ack.err);
            resolve({ success: false, error: ack.err });
          } else {
            console.log('🔫 GunJS: ✅ Public stats updated successfully with ack:', ack);
            
            // Verify the update by reading it back
            setTimeout(() => {
              this.gun.get('publicStats').get(this.user.is.pub).once((verifyStats: any) => {
                console.log('🔫 GunJS: Verified stats after update:', verifyStats);
                resolve({ success: true });
              });
            }, 500);
          }
        });
      } catch (err) {
        console.error('🔫 GunJS: ❌ Error updating public stats:', err);
        resolve({ success: false, error: 'Failed to update public stats' });
      }
    });
  }

  async getPublicStats(userId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Stats request timed out' });
      }, 3000);

      try {
        this.gun.get('publicStats').get(userId).once((stats: any) => {
          clearTimeout(timeout);
          if (stats) {
            resolve({ success: true, stats });
          } else {
            resolve({ success: false, error: 'Stats not found' });
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        resolve({ success: false, error: 'Error fetching stats' });
      }
    });
  }
  async getAllPublicStats(): Promise<{ success: boolean; allStats?: any[]; error?: string }> {
    return new Promise((resolve) => {
      const allStats: any[] = [];
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: getAllPublicStats timeout, returning', allStats.length, 'stats');
        resolve({ success: true, allStats });
      }, 4000);

      try {
        console.log('🔫 GunJS: Starting to fetch all public stats...');
        this.gun.get('publicStats').map().on((stats: any, userId: string) => {
          if (stats && userId && !allStats.find(s => s.userId === userId)) {
            console.log('🔫 GunJS: Found public stats for user:', userId, stats);
            allStats.push({
              ...stats,
              userId
            });
          }
        });

        setTimeout(() => {
          clearTimeout(timeout);
          console.log('🔫 GunJS: Returning', allStats.length, 'public stats');
          resolve({ success: true, allStats });
        }, 2000);
      } catch (err) {
        clearTimeout(timeout);
        console.error('🔫 GunJS: Error fetching all public stats:', err);
        resolve({ success: false, error: 'Failed to fetch public stats' });
      }
    });
  }

  // Public activity feed methods
  async publishActivity(activity: {
    type: 'book_completed' | 'reading_session' | 'note_added' | 'achievement_unlocked';
    title: string;
    description: string;
    bookTitle?: string;
    bookCover?: string;
    metadata?: {
      pagesRead?: number;
      duration?: number;
      achievement?: string;
    };
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.user.is) {
        return { success: false, error: 'User not authenticated' };
      }      // Get current user info
      const currentUser = this.getCurrentUser();
      
      // Get user profile for display name
      const profileResult = await this.getProfile();
      const displayName = profileResult.success ? 
        (profileResult.profile?.displayName || profileResult.profile?.username || currentUser?.username) : 
        currentUser?.username || 'Unknown';
      
      const activityEntry = {
        id: `activity_${Date.now()}_${this.user.is.pub}`,
        userId: this.user.is.pub,
        username: currentUser?.username || 'Unknown',
        displayName: displayName,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: new Date().toISOString(),
        bookTitle: activity.bookTitle,
        bookCover: activity.bookCover,
        metadata: activity.metadata
      };

      // Store in public activity feed
      this.gun.get('publicActivity').get(activityEntry.id).put(activityEntry);
      
      // Also store in user's activity history for friends to query
      this.gun.get('userActivity').get(this.user.is.pub).set(activityEntry);

      console.log('🔫 GunJS: Published activity:', activityEntry);
      return { success: true };
    } catch (err) {
      console.error('🔫 GunJS: Error publishing activity:', err);
      return { success: false, error: 'Failed to publish activity' };
    }
  }

  async getFriendActivities(friendIds: string[]): Promise<{ success: boolean; activities?: any[]; error?: string }> {
    return new Promise((resolve) => {
      const allActivities: any[] = [];
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: getFriendActivities timeout, returning', allActivities.length, 'activities');
        resolve({ success: true, activities: allActivities });
      }, 4000);

      try {
        console.log('🔫 GunJS: Fetching activities for friends:', friendIds);
        
        if (friendIds.length === 0) {
          clearTimeout(timeout);
          resolve({ success: true, activities: [] });
          return;        }

        const processFriend = (friendId: string) => {
          this.gun.get('userActivity').get(friendId).map().once((activity: any) => {
            if (activity && activity.id && activity.timestamp) {
              // Check if activity is recent (last 30 days)
              const activityDate = new Date(activity.timestamp);
              const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
              
              if (activityDate > thirtyDaysAgo && !allActivities.find(a => a.id === activity.id)) {
                allActivities.push(activity);
              }
            }
          });
        };

        friendIds.forEach(processFriend);
        
        // Also fetch from public activity feed as backup
        this.gun.get('publicActivity').map().on((activity: any) => {
          if (activity && activity.userId && friendIds.includes(activity.userId)) {
            const activityDate = new Date(activity.timestamp);
            const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
            
            if (activityDate > thirtyDaysAgo && !allActivities.find(a => a.id === activity.id)) {
              allActivities.push(activity);
            }
          }
        });

        setTimeout(() => {
          clearTimeout(timeout);
          // Sort activities by timestamp (newest first)
          const sortedActivities = allActivities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ).slice(0, 20); // Limit to 20 most recent activities
          
          console.log('🔫 GunJS: Returning', sortedActivities.length, 'friend activities');
          resolve({ success: true, activities: sortedActivities });
        }, 2000);
      } catch (err) {
        clearTimeout(timeout);
        console.error('🔫 GunJS: Error fetching friend activities:', err);
        resolve({ success: false, error: 'Failed to fetch activities' });
      }
    });
  }

  async getRecentPublicActivity(limit: number = 50): Promise<{ success: boolean; activities?: any[]; error?: string }> {
    return new Promise((resolve) => {
      const allActivities: any[] = [];
      const timeout = setTimeout(() => {
        console.log('🔫 GunJS: getRecentPublicActivity timeout, returning', allActivities.length, 'activities');
        resolve({ success: true, activities: allActivities });
      }, 3000);

      try {
        this.gun.get('publicActivity').map().on((activity: any) => {
          if (activity && activity.id && activity.timestamp) {
            // Check if activity is recent (last 7 days for public feed)
            const activityDate = new Date(activity.timestamp);
            const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
            
            if (activityDate > sevenDaysAgo && !allActivities.find(a => a.id === activity.id)) {
              allActivities.push(activity);
            }
          }
        });

        setTimeout(() => {
          clearTimeout(timeout);
          // Sort activities by timestamp (newest first) and limit
          const sortedActivities = allActivities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ).slice(0, limit);
          
          resolve({ success: true, activities: sortedActivities });
        }, 2000);
      } catch (err) {
        clearTimeout(timeout);
        console.error('🔫 GunJS: Error fetching recent public activity:', err);
        resolve({ success: false, error: 'Failed to fetch public activity' });
      }
    });
  }

}

export const gunService = new GunService();
export default gunService;
