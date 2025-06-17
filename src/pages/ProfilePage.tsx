import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gunService } from '../services/gun';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../services/localStorage';
import Layout from '../components/Layout';
import Toast from '../components/ui/Toast';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface UserProfile {
  displayName: string;
  bio: string;
  favoriteGenres: string[];
  readingGoal: number;
  joinedDate?: string;
}

const ProfilePage: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    favoriteGenres: [],
    readingGoal: 12
  });  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isGuest = user?.id?.startsWith('guest-');
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);  // Also update local profile state when user profile changes in AuthContext
  useEffect(() => {
    if (user?.profile && !isGuest) {
      setProfile({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
        favoriteGenres: user.profile.favoriteGenres || [],
        readingGoal: user.profile.readingGoal || 12,
        joinedDate: user.profile.joinedDate || user.createdAt
      });
    }
  }, [user?.profile, isGuest]);  const loadProfile = async () => {
    console.log('ProfilePage: Loading profile for user:', user?.id, 'isGuest:', isGuest);
    try {
      if (isGuest) {        // For guest users, try to load from localStorage using the service
        const savedProfile = LocalStorageService.getGuestProfile() as any;
        console.log('ProfilePage: Loaded guest profile from localStorage:', savedProfile);
        if (savedProfile) {
          setProfile({
            displayName: savedProfile.displayName || 'Guest User',
            bio: savedProfile.bio || 'Browsing as a guest',
            favoriteGenres: savedProfile.favoriteGenres || [],
            readingGoal: savedProfile.readingGoal || 12,
            joinedDate: savedProfile.joinedDate || user?.createdAt
          });
          return;
        }
        
        // Fallback to user object if no localStorage data
        if (user?.profile) {
          console.log('ProfilePage: Using fallback guest profile from user object');
          setProfile({
            displayName: user.profile.displayName || 'Guest User',
            bio: user.profile.bio || 'Browsing as a guest',
            favoriteGenres: user.profile.favoriteGenres || [],
            readingGoal: user.profile.readingGoal || 12,
            joinedDate: user.createdAt
          });
        }
        return;
      }

      console.log('ProfilePage: Loading profile from Gun service');
      const result = await gunService.getProfile();
      console.log('ProfilePage: Gun service profile result:', result);
      
      if (result.success && result.profile) {
        const loadedProfile = {
          displayName: result.profile.displayName || '',
          bio: result.profile.bio || '',
          favoriteGenres: result.profile.favoriteGenres || [],
          readingGoal: result.profile.readingGoal || 12,
          joinedDate: result.profile.joinedDate || result.profile.lastUpdated
        };
        console.log('ProfilePage: Setting profile to:', loadedProfile);
        setProfile(loadedProfile);
      } else {
        console.log('ProfilePage: No profile found or error loading profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };const saveProfile = async () => {
    if (!user) return;
    
    console.log('ProfilePage: Saving profile:', profile);
    setIsSaving(true);
    try {      if (isGuest) {
        // For guest users, save to localStorage using the service
        LocalStorageService.setGuestProfile(profile);
        setIsEditing(false);
        console.log('Guest profile saved to localStorage:', profile);
        setToast({ message: 'Profile saved successfully!', type: 'success' });
        return;
      }

      // Save profile for authenticated users - use AuthContext updateProfile method
      console.log('ProfilePage: Calling updateProfile with:', profile);
      const result = await updateProfile(profile);
      console.log('ProfilePage: updateProfile result:', result);
      
      if (result.success) {
        setIsEditing(false);
        console.log('Profile saved successfully');
        setToast({ message: 'Profile saved successfully!', type: 'success' });
        // Reload the profile to ensure we have the latest data
        console.log('ProfilePage: Reloading profile after save');
        await loadProfile();
      } else {
        console.error('Error saving profile:', result.error);
        setToast({ message: `Failed to save profile: ${result.error || 'Unknown error'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({ message: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !profile.favoriteGenres.includes(newGenre.trim())) {
      setProfile(prev => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genre: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.filter(g => g !== genre)
    }));
  };
  const handleLogout = () => {
    signOut();
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-800 mb-4">Please sign in to view your profile</h1>
          </div>
        </div>
      </Layout>
    );
  }  return (
    <Layout>
      <div 
        className="min-h-screen py-8 transition-colors duration-200"
        style={{ backgroundColor: theme.colors.background }}
      >
        
        {/* Guest Mode Notification */}
        {isGuest && (          <div className="max-w-4xl mx-auto px-4 mb-4">
            <div 
              className="border px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.colors.wantToRead,
                borderColor: theme.colors.border,
                color: theme.colors.wantToReadText
              }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>                <span className="font-medium">Guest Mode</span>
                <span className="ml-2">- Profile changes saved locally. Create an account to sync across devices!</span>
              </div>
            </div>
          </div>
        )}
          <div className="max-w-4xl mx-auto px-4">
          <div 
            className="rounded-2xl shadow-xl overflow-hidden transition-colors duration-200" 
            style={{ backgroundColor: theme.colors.surface }}
          >            {/* Header Section */}
            <div 
              className="px-8 py-12 text-white relative"
              style={{ 
                background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primaryLight})` 
              }}
            >
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {profile.displayName || user?.username || 'Book Lover'}
                  </h1>
                  <p className="text-amber-100 text-lg">
                    {profile.bio || 'A passionate reader exploring new worlds through books'}
                  </p>
                  {profile.joinedDate && (
                    <p className="text-amber-200 text-sm mt-2">
                      Member since {new Date(profile.joinedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500/80 hover:bg-red-600/80 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-amber-800 mb-4">Personal Information</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent input-field"
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                          color: theme.colors.textPrimary
                        }}
                        placeholder="Your display name"
                      />
                    ) : (
                      <p className="text-gray-900 px-4 py-3 bg-amber-50 rounded-lg">
                        {profile.displayName || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="Tell us about yourself and your reading interests..."
                      />
                    ) : (
                      <p className="text-gray-900 px-4 py-3 bg-amber-50 rounded-lg min-h-[100px] whitespace-pre-wrap">
                        {profile.bio || 'No bio added yet'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reading Goal (books per year)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={profile.readingGoal}
                        onChange={(e) => setProfile(prev => ({ ...prev, readingGoal: parseInt(e.target.value) || 12 }))}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 px-4 py-3 bg-amber-50 rounded-lg">
                        {profile.readingGoal} books per year
                      </p>
                    )}
                  </div>
                </div>

                {/* Favorite Genres */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-amber-800 mb-4">Favorite Genres</h2>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addGenre()}
                        placeholder="Add a genre..."
                        className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        onClick={addGenre}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteGenres.map((genre, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                      >
                        {genre}
                        {isEditing && (
                          <button
                            onClick={() => removeGenre(genre)}
                            className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </span>
                    ))}                    {profile.favoriteGenres.length === 0 && (
                      <p className="text-gray-500 italic">No favorite genres added yet</p>
                    )}
                  </div>

                  {/* App Settings */}
                  <div className="space-y-6 mt-8">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>
                      App Settings
                    </h2>
                    
                    <div 
                      className="p-6 rounded-xl border"
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                      }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-1"
                              style={{ color: theme.colors.textPrimary }}
                            >
                              Appearance
                            </h3>
                            <p 
                              className="text-sm"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              Choose your preferred theme for the app
                            </p>
                          </div>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </div>                  {/* Reading Statistics */}
                  <div 
                    className="mt-8 p-6 rounded-xl"
                    style={{ 
                      background: `linear-gradient(to right, ${theme.colors.surfaceSecondary}, ${theme.colors.surfaceElevated})`
                    }}
                  >
                    <h3 
                      className="text-lg font-bold mb-4"
                      style={{ color: theme.colors.primary }}
                    >
                      Reading Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.primary }}
                        >
                          0
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Books Read
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.primary }}
                        >
                          0
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Pages Read
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div className="mt-8">
                    <h3 
                      className="text-lg font-bold mb-4"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      Preferences
                    </h3>
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: theme.colors.surface }}
                    >
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

export default ProfilePage;
