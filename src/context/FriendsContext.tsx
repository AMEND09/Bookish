import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Friend, FriendActivity, FriendRequest, LeaderboardEntry } from '../types';
import { useAuth } from './AuthContext';
import gunService from '../services/gun';

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  friendActivity: FriendActivity[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  
  // Friend management
  sendFriendRequest: (username: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  
  // Activity and leaderboard
  refreshFriendActivity: () => Promise<void>;
  refreshLeaderboard: (period: 'week' | 'month' | 'year' | 'alltime', metric: 'books_read' | 'pages_read' | 'reading_time' | 'streak') => Promise<void>;
  
  // Utils
  searchUsers: (query: string) => Promise<{ id: string; username: string; displayName?: string }[]>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshingLeaderboard = useRef(false);
  const refreshingActivity = useRef(false);

  // Load friends data from GunJS on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFriendsData();
    }
  }, [isAuthenticated, user]);
  const loadFriendsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load friends from GunJS
      const friendsResult = await gunService.getFriends();
      if (friendsResult.success && friendsResult.friends) {
        // Calculate stats for each friend
        const friendsWithStats = await Promise.all(
          friendsResult.friends.map(async (friend) => {
            const stats = await calculateUserStats(friend.id);
            return { ...friend, stats };
          })
        );
        setFriends(friendsWithStats);
      }

      // Load friend requests from GunJS
      const requestsResult = await gunService.getFriendRequests();
      if (requestsResult.success && requestsResult.requests) {
        setFriendRequests(requestsResult.requests);
      }
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };
  // Calculate user stats from GunJS data
  const calculateUserStats = async (userId: string) => {
    try {
      if (userId === user?.id) {
        // Use current user's data from GunJS
        const [booksResult, sessionsResult] = await Promise.all([
          gunService.getUserBooks(),
          gunService.getUserSessions()
        ]);
        
        const books = booksResult.success ? booksResult.books || [] : [];
        const sessions = sessionsResult.success ? sessionsResult.sessions || [] : [];
        
        const completedBooks = books.filter((book: any) => book.category === 'completed');
        
        // Calculate total reading time (in minutes)
        const totalReadingTime = sessions.reduce((total: number, session: any) => {
          return total + (session.duration || 0);
        }, 0);
        
        // Calculate total pages read from sessions
        const totalPagesRead = sessions.reduce((total: number, session: any) => {
          const pagesRead = (session.endPage || 0) - (session.startPage || 0);
          return total + Math.max(0, pagesRead);
        }, 0);
          // Calculate current reading streak
        const currentStreak = calculateReadingStreak(sessions);
        
        const stats = {
          totalBooksRead: completedBooks.length,
          totalPagesRead: Math.max(totalPagesRead, completedBooks.length * 200), // Minimum estimate
          totalReadingTime,
          currentStreak
        };
        
        // Update public stats for leaderboard
        gunService.updatePublicStats(stats).catch(console.error);
        
        return stats;      } else {
        // For other users, try to get their public stats from GunJS
        try {
          const publicStatsResult = await gunService.getPublicStats(userId);
          if (publicStatsResult.success && publicStatsResult.stats) {
            return {
              totalBooksRead: publicStatsResult.stats.totalBooksRead || 0,
              totalPagesRead: publicStatsResult.stats.totalPagesRead || 0,
              totalReadingTime: publicStatsResult.stats.totalReadingTime || 0,
              currentStreak: publicStatsResult.stats.currentStreak || 0
            };
          }
        } catch (err) {
          console.error('Error fetching friend public stats:', err);
        }
        
        // If no public stats available, try cached stats from friend object
        const friend = friends.find(f => f.id === userId);
        if (friend && friend.stats) {
          return friend.stats;
        }
        
        // Return zero stats if no data available (no demo data)
        return {
          totalBooksRead: 0,
          totalPagesRead: 0,
          totalReadingTime: 0,
          currentStreak: 0
        };
      }
    } catch (err) {
      console.error('Error calculating user stats:', err);
      return {
        totalBooksRead: 0,
        totalPagesRead: 0,
        totalReadingTime: 0,
        currentStreak: 0
      };
    }
  };

  const calculateReadingStreak = (sessions: any[]) => {
    if (!sessions.length) return 0;
    
    // Sort sessions by date
    const sortedSessions = sessions
      .map(session => new Date(session.startTime).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if user read today or yesterday
    if (sortedSessions[0] === today || sortedSessions[0] === yesterday) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedSessions.length; i++) {
        const currentDate = new Date(sortedSessions[i]);
        const previousDate = new Date(sortedSessions[i - 1]);
        const diffTime = previousDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };
  const sendFriendRequest = async (username: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Search for user by username in GunJS
      const searchResults = await searchUsers(username);
      const targetUser = searchResults.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!targetUser) {
        setError('User not found');
        return false;
      }

      // Check if already friends
      const existingFriend = friends.find(f => f.id === targetUser.id);
      if (existingFriend) {
        setError('Already friends with this user');
        return false;
      }

      // Check if request already sent
      const existingRequest = friendRequests.find(r => 
        (r.fromUserId === user.id && r.toUserId === targetUser.id) ||
        (r.fromUserId === targetUser.id && r.toUserId === user.id)
      );
      if (existingRequest) {
        setError('Friend request already exists');
        return false;
      }
      
      // Send friend request via GunJS
      const result = await gunService.sendFriendRequest(
        user.id,
        user.username,
        user.profile?.displayName || user.username,
        targetUser.id,
        targetUser.username,
        targetUser.displayName || targetUser.username
      );
      
      if (result.success) {
        // Refresh friend requests to show the sent request
        await loadFriendsData();
        return true;
      } else {
        setError(result.error || 'Failed to send friend request');
        return false;
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const request = friendRequests.find(req => req.id === requestId);
      if (!request) {
        setError('Friend request not found');
        return false;
      }
      
      // Accept friend request via GunJS
      const result = await gunService.acceptFriendRequest(requestId, request.fromUserId);
        if (result.success) {
        // Refresh friends data to show the new friend with updated stats
        await loadFriendsData();
        
        // Also refresh friend activity to show new friend's activity
        setTimeout(() => {
          refreshFriendActivity();
        }, 1000);
        
        return true;
      } else {
        setError(result.error || 'Failed to accept friend request');
        return false;
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const request = friendRequests.find(req => req.id === requestId);
      if (!request) {
        setError('Friend request not found');
        return false;
      }
      
      // Decline friend request via GunJS
      const result = await gunService.declineFriendRequest(requestId, request.fromUserId);
      
      if (result.success) {
        // Refresh friend requests to remove the declined request
        await loadFriendsData();
        return true;
      } else {
        setError(result.error || 'Failed to decline friend request');
        return false;
      }
    } catch (err) {
      console.error('Error declining friend request:', err);
      setError('Failed to decline friend request');
      return false;
    }
  };

  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Remove friend via GunJS
      const result = await gunService.removeFriend(friendId);
      
      if (result.success) {
        // Refresh friends data to remove the friend
        await loadFriendsData();
        return true;
      } else {
        setError(result.error || 'Failed to remove friend');
        return false;
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
      return false;
    }
  };  const refreshFriendActivity = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    // Prevent multiple simultaneous calls
    if (refreshingActivity.current) {
      console.log('⚠️ Friend activity refresh already in progress, skipping...');
      return;
    }
    
    refreshingActivity.current = true;
    setLoading(true);
    
    try {
      // Get friend IDs
      const friendIds = friends.map(friend => friend.id);
      
      if (friendIds.length === 0) {
        setFriendActivity([]);
        return;
      }
      
      // Fetch friend activities from GunJS
      const result = await gunService.getFriendActivities(friendIds);
      
      if (result.success && result.activities) {
        setFriendActivity(result.activities);
        console.log('✅ Friend activities loaded:', result.activities.length);
      } else {
        console.log('⚠️ No friend activities found');
        setFriendActivity([]);
      }
    } catch (err) {
      console.error('Error refreshing friend activity:', err);
      setError('Failed to refresh friend activity');
    } finally {
      refreshingActivity.current = false;
      setLoading(false);
    }
  }, [user, friends]);const refreshLeaderboard = useCallback(async (
    period: 'week' | 'month' | 'year' | 'alltime', 
    metric: 'books_read' | 'pages_read' | 'reading_time' | 'streak'
  ): Promise<void> => {
    if (!user) return;
    
    // Prevent multiple simultaneous calls
    if (refreshingLeaderboard.current) {
      console.log('⚠️ Leaderboard refresh already in progress, skipping...');
      return;
    }
    
    refreshingLeaderboard.current = true;
    setLoading(true);
      try {
      console.log('🔄 Refreshing leaderboard for period:', period, 'metric:', metric);
      
      // Get all public stats for leaderboard
      const allStatsResult = await gunService.getAllPublicStats();
      console.log('📊 All public stats result:', allStatsResult);
      
      if (allStatsResult.success && allStatsResult.allStats && allStatsResult.allStats.length > 0) {
        // Get user profiles for display names
        const usersWithStats = await Promise.all(
          allStatsResult.allStats.map(async (userStats) => {
            const profileResult = await gunService.getPublicProfile(userStats.userId);
            return {
              userId: userStats.userId,
              username: profileResult.success ? profileResult.profile?.username || 'Unknown' : 'Unknown',
              displayName: profileResult.success ? profileResult.profile?.displayName || profileResult.profile?.username : 'Unknown',
              stats: {
                booksRead: userStats.totalBooksRead || 0,
                pagesRead: userStats.totalPagesRead || 0,
                readingTime: userStats.totalReadingTime || 0,
                currentStreak: userStats.currentStreak || 0
              }
            };
          })
        );
        
        // Sort by the selected metric
        const sortedUsers = usersWithStats.sort((a, b) => {
          switch (metric) {
            case 'books_read':
              return b.stats.booksRead - a.stats.booksRead;
            case 'pages_read':
              return b.stats.pagesRead - a.stats.pagesRead;
            case 'reading_time':
              return b.stats.readingTime - a.stats.readingTime;
            case 'streak':
              return b.stats.currentStreak - a.stats.currentStreak;
            default:
              return 0;
          }
        });
        
        // Create leaderboard entries
        const leaderboardData: LeaderboardEntry[] = sortedUsers.map((user, index) => ({
          userId: user.userId,
          username: user.username,
          displayName: user.displayName,
          rank: index + 1,
          score: user.stats[metric === 'books_read' ? 'booksRead' : 
                       metric === 'pages_read' ? 'pagesRead' : 
                       metric === 'reading_time' ? 'readingTime' : 'currentStreak'],
          period,
          metric,
          details: {
            booksRead: user.stats.booksRead,
            pagesRead: user.stats.pagesRead,
            readingTime: user.stats.readingTime,
            currentStreak: user.stats.currentStreak
          }
        }));
          setLeaderboard(leaderboardData);
        console.log('✅ Leaderboard updated with', leaderboardData.length, 'entries');
      } else {
        console.log('⚠️ No public stats available, using fallback method');
        // Fallback to friends + current user if public stats aren't available
        const userStats = await calculateUserStats(user.id);
        
        const allUsers = [
          {
            userId: user.id,
            username: user.username,
            displayName: user.profile?.displayName || user.username,
            stats: {
              booksRead: userStats.totalBooksRead,
              pagesRead: userStats.totalPagesRead,
              readingTime: userStats.totalReadingTime,
              currentStreak: userStats.currentStreak
            }
          },
          ...friends.map(friend => ({
            userId: friend.id,
            username: friend.username,
            displayName: friend.displayName || friend.username,
            stats: {
              booksRead: friend.stats?.totalBooksRead || 0,
              pagesRead: friend.stats?.totalPagesRead || 0,
              readingTime: friend.stats?.totalReadingTime || 0,
              currentStreak: friend.stats?.currentStreak || 0
            }
          }))
        ];
        
        // Sort by the selected metric
        const sortedUsers = allUsers.sort((a, b) => {
          switch (metric) {
            case 'books_read':
              return b.stats.booksRead - a.stats.booksRead;
            case 'pages_read':
              return b.stats.pagesRead - a.stats.pagesRead;
            case 'reading_time':
              return b.stats.readingTime - a.stats.readingTime;
            case 'streak':
              return b.stats.currentStreak - a.stats.currentStreak;
            default:
              return 0;
          }
        });
        
        // Create leaderboard entries
        const leaderboardData: LeaderboardEntry[] = sortedUsers.map((user, index) => ({
          userId: user.userId,
          username: user.username,
          displayName: user.displayName,
          rank: index + 1,
          score: user.stats[metric === 'books_read' ? 'booksRead' : 
                       metric === 'pages_read' ? 'pagesRead' : 
                       metric === 'reading_time' ? 'readingTime' : 'currentStreak'],
          period,
          metric,
          details: {
            booksRead: user.stats.booksRead,
            pagesRead: user.stats.pagesRead,
            readingTime: user.stats.readingTime,
            currentStreak: user.stats.currentStreak
          }
        }));
        
        setLeaderboard(leaderboardData);
      }    } catch (err) {
      console.error('Error refreshing leaderboard:', err);
      setError('Failed to refresh leaderboard');    } finally {
      refreshingLeaderboard.current = false;
      setLoading(false);
    }
  }, [user, friends]); // Add dependencies for useCallback

  const searchUsers = async (query: string): Promise<{ id: string; username: string; displayName?: string }[]> => {
    if (!query.trim()) return [];
    
    try {
      console.log('🔍 Searching for users with query:', query);
      // Use GunJS to search through public users index
      const results = await gunService.searchPublicUsers(query);
      console.log('🔍 Search results:', results);
      return results;
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  const value: FriendsContextType = {
    friends,
    friendRequests,
    friendActivity,
    leaderboard,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriendActivity,
    refreshLeaderboard,
    searchUsers
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};
