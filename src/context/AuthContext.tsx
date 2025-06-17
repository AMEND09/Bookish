import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import gunService from '../services/gun';
import { LocalStorageService } from '../services/localStorage';

interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'SIGN_OUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add timeout to prevent hanging on GunJS server issues
        const authTimeout = new Promise<{ success: boolean }>((_, reject) =>
          setTimeout(() => reject(new Error('Authentication check timeout')), 5000)
        );

        const authCheck = gunService.recallUser();
        
        const result = await Promise.race([authCheck, authTimeout]) as any;
          if (result && result.success && result.user) {
          // Load user profile data with timeout
          const profileTimeout = new Promise<{ success: boolean }>((_, reject) =>
            setTimeout(() => reject(new Error('Profile load timeout')), 3000)
          );
          
          try {
            const profileResult = await Promise.race([
              gunService.getProfile(),
              profileTimeout
            ]) as any;
            
            const user: User = {
              ...result.user,
              // Use the stored username from profile if available, otherwise use the recalled username
              username: (profileResult?.success && profileResult?.profile?.originalUsername) 
                ? profileResult.profile.originalUsername 
                : result.user.username || 'Unknown User',
              profile: (profileResult && profileResult.success) ? profileResult.profile : undefined,
            };
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } catch (profileError) {
            // If profile loading fails, still authenticate the user without profile
            const user: User = {
              ...result.user,
              username: result.user.username || 'Unknown User',
              profile: undefined,
            };
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          }
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch (error) {
        console.log('GunJS auth check failed (servers may be down):', error);
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    };

    checkAuth();
  }, []);
  const signIn = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await gunService.signIn(username, password);
      
      if (result.success && result.user) {
        // Load user profile data
        const profileResult = await gunService.getProfile();
        const user: User = {
          ...result.user,
          username: username, // Ensure we keep the original username
          profile: profileResult.success ? profileResult.profile : undefined,
        };
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.error || 'Sign in failed' });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await gunService.signUp(username, password);
      
      if (result.success) {
        dispatch({ type: 'AUTH_FAILURE', payload: '' }); // Reset to not authenticated state
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.error || 'Sign up failed' });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
  const signOut = () => {
    gunService.signOut();
    dispatch({ type: 'SIGN_OUT' });
  };  const continueAsGuest = () => {
    // Try to load existing guest profile from localStorage using the service
    let guestProfile = {
      displayName: 'Guest User',
      bio: 'Browsing as a guest',
      favoriteGenres: [],
      readingGoal: 0
    };

    const savedProfile = LocalStorageService.getGuestProfile() as any;
    if (savedProfile) {
      guestProfile = {
        displayName: savedProfile.displayName || 'Guest User',
        bio: savedProfile.bio || 'Browsing as a guest',
        favoriteGenres: savedProfile.favoriteGenres || [],
        readingGoal: savedProfile.readingGoal || 0
      };
    }

    const guestUser: User = {
      id: 'guest-' + Date.now(),
      username: 'Guest User',
      email: '',
      createdAt: new Date().toISOString(),
      profile: guestProfile
    };
    
    dispatch({ type: 'AUTH_SUCCESS', payload: guestUser });
  };
  const updateProfile = async (profileData: any): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthContext: updateProfile called with:', profileData);
    try {
      const result = await gunService.updateProfile(profileData);
      console.log('AuthContext: gunService.updateProfile result:', result);
      
      if (result.success) {
        console.log('AuthContext: Updating user state with profile:', profileData);
        dispatch({ type: 'UPDATE_USER', payload: { profile: profileData } });
        return { success: true };
      } else {
        console.log('AuthContext: Profile update failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
    continueAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
