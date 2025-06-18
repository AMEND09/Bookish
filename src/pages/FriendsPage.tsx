import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, Users, Check, X, Trophy, Clock, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import Toast from '../components/ui/Toast';

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { 
    friends, 
    friendRequests, 
    friendActivity, 
    loading, 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest, 
    removeFriend,
    refreshFriendActivity,
    searchUsers 
  } = useFriends();
    const [activeTab, setActiveTab] = useState<'activity' | 'friends' | 'requests'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName?: string }[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    refreshFriendActivity();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers(searchQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);  const handleSendFriendRequest = async (username: string) => {
    setSendingRequest(username);
    try {
      const success = await sendFriendRequest(username);
      if (success) {
        setSearchQuery('');
        setSearchResults([]);
        setShowAddFriend(false);
        setToast({ message: `Friend request sent to ${username}!`, type: 'success' });
      } else {
        setToast({ message: 'Failed to send friend request', type: 'error' });
      }
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId: string, username: string) => {
    setAcceptingRequest(requestId);
    try {
      const success = await acceptFriendRequest(requestId);
      if (success) {
        setToast({ message: `You're now friends with ${username}!`, type: 'success' });
      } else {
        setToast({ message: 'Failed to accept friend request', type: 'error' });
      }
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const success = await declineFriendRequest(requestId);
    if (success) {
      setToast({ message: 'Friend request declined', type: 'info' });
    } else {
      setToast({ message: 'Failed to decline friend request', type: 'error' });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book_completed':
        return <BookOpen className="w-4 h-4" />;
      case 'reading_session':
        return <Clock className="w-4 h-4" />;
      case 'achievement_unlocked':
        return <Trophy className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.primary }} />
            </button>
            <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>
              Friends
            </h1>
          </div>
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Add Friend Section */}
      {showAddFriend && (
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary
              }}
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                      {user.displayName || user.username}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      @{user.username}
                    </p>
                  </div>                  <button
                    onClick={() => handleSendFriendRequest(user.username)}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: theme.colors.primary }}
                    disabled={loading || sendingRequest === user.username}
                  >
                    {sendingRequest === user.username ? 'Sending...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.colors.border }}>
        {[
          { id: 'activity', label: 'Activity', count: friendActivity.length },
          { id: 'friends', label: 'Friends', count: friends.length },
          { id: 'requests', label: 'Requests', count: friendRequests.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-opacity-100' : 'border-transparent'
            }`}
            style={{
              color: activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary,
              borderColor: activeTab === tab.id ? theme.colors.primary : 'transparent'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  color: theme.colors.primary
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {friendActivity.length > 0 ? (
              friendActivity.map(activity => (
                <div
                  key={activity.id}
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.borderLight }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                          {activity.displayName || activity.username}
                        </span>
                        <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: theme.colors.textPrimary }}>
                        {activity.description}
                      </p>
                      {activity.metadata && (
                        <div className="flex gap-4 text-xs" style={{ color: theme.colors.textSecondary }}>
                          {activity.metadata.pagesRead && (
                            <span>{activity.metadata.pagesRead} pages</span>
                          )}
                          {activity.metadata.duration && (
                            <span>{activity.metadata.duration} min</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textSecondary }}>No friend activity yet</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Friend activity will appear here when your friends complete books or reading sessions
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friends.length > 0 ? (
              friends.map(friend => (
                <div
                  key={friend.id}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.borderLight }}
                      >
                        <Users className="w-5 h-5" style={{ color: theme.colors.primary }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                          {friend.displayName || friend.username}
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: theme.colors.borderLight,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  {friend.stats && (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold" style={{ color: theme.colors.primary }}>
                          {friend.stats.totalBooksRead}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Books Read</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: theme.colors.primary }}>
                          {friend.stats.currentStreak}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Day Streak</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textSecondary }}>No friends yet</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Start by searching for users to add as friends!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {friendRequests.length > 0 ? (
              friendRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.borderLight }}
                      >
                        <Users className="w-5 h-5" style={{ color: theme.colors.primary }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                          {request.fromDisplayName || request.fromUsername}
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          @{request.fromUsername}
                        </p>
                      </div>
                    </div>
                      <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id, request.fromUsername)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: acceptingRequest === request.id ? '#6B7280' : '#10B981' }}
                        disabled={loading || acceptingRequest === request.id}
                      >
                        {acceptingRequest === request.id ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#EF4444' }}
                        disabled={loading || acceptingRequest === request.id}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textSecondary }}>No friend requests</p>              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default FriendsPage;
