import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, MoreVertical, Trash2, Check, Move } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useFriends } from '../context/FriendsContext';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import { getSessionsByBook } from '../services/storage';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import Layout from '../components/Layout';

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, addBook, updatePublicStatsAfterBookCompletion } = useBooks();
  const { refreshLeaderboard } = useFriends();
  const { updatePetFromBookCompletion } = usePet();
  const { theme } = useTheme();
  const modal = useConfirmationModal();const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<string | null>(null);
  const [swipeStates, setSwipeStates] = useState<Record<string, { translateX: number; isDeleting: boolean; startX?: number; startY?: number }>>({});
  const [localBooks, setLocalBooks] = useState<any[]>([]);
  // Load books from storage and sync with context
  useEffect(() => {
    const loadBooks = () => {
      const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      setLocalBooks(savedBooks);
    };
    
    loadBooks();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  // Use local books if available, otherwise use context books
  const displayBooks = localBooks.length > 0 ? localBooks : books;
  const handleBookClick = (book: any) => {
    // Navigate to book details page with book data
    navigate(`/book?book=${book.key}`, { state: { bookData: book } });
  };  const handleRemoveBook = (bookKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    modal.showConfirm(
      'Remove Book',
      'Are you sure you want to remove this book from your library?',
      () => {
        // Remove book from local storage using the same key structure as the app
        const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
        const updatedBooks = savedBooks.filter((book: any) => book.key !== bookKey);
        localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
        
        // Also remove from the old storage key for backward compatibility
        const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const oldUpdatedBooks = oldSavedBooks.filter((book: any) => book.key !== bookKey);
        localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
        
        // Remove from cached book details
        const cachedBooks = JSON.parse(localStorage.getItem('bookish_cached_books') || '{}');
        delete cachedBooks[bookKey];
        localStorage.setItem('bookish_cached_books', JSON.stringify(cachedBooks));
        
        // Clear as active book if this was the currently reading book
        const currentBook = JSON.parse(localStorage.getItem('bookish_current_book') || 'null');
        if (currentBook && currentBook.key === bookKey) {
          localStorage.removeItem('bookish_current_book');
        }
        
        // Update local state instead of page refresh
        setLocalBooks(updatedBooks);
      },
      {
        confirmText: 'Remove',
        cancelText: 'Keep Book'
      }
    );
    setShowDropdown(null);
  };  const handleMoveBook = async (bookKey: string, newCategory: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Find the book to update
    const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
    const bookToUpdate = savedBooks.find((book: any) => book.key === bookKey);
    
    if (!bookToUpdate) return;
      // Create updated book with new category and completion timestamp if completed
    const updatedBook = { 
      ...bookToUpdate, 
      category: newCategory as 'reading' | 'completed' | 'wishlist',
      ...(newCategory === 'completed' && { completedAt: new Date().toISOString() })
    };
    
    // Use BookContext's addBook method which will handle activity publishing and stats updating
    await addBook(updatedBook);
    
    // Update local storage for backward compatibility
    const updatedBooks = savedBooks.map((book: any) => 
      book.key === bookKey ? updatedBook : book
    );
    localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
    
    // Also update old storage for backward compatibility
    const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
    const oldUpdatedBooks = oldSavedBooks.map((book: any) => 
      book.key === bookKey ? updatedBook : book
    );
    localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
    
    // Update local state instead of page refresh
    setLocalBooks(updatedBooks);
    setShowMoveModal(null);
    setShowDropdown(null);
  };  const handleMarkAsCompleted = (bookKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    modal.showConfirm(
      'Mark as Completed',
      'Mark this book as completed? This will give your pet a big experience boost!',      async () => {
        await handleMoveBook(bookKey, 'completed');
        
        // Manually trigger stats update to ensure immediate refresh
        await updatePublicStatsAfterBookCompletion();
        
        // Trigger pet reward
        updatePetFromBookCompletion();
        
        // Refresh leaderboard to show updated stats
        setTimeout(() => {
          refreshLeaderboard('week', 'books_read');
        }, 1000);
        
        // Show success message
        setTimeout(() => {
          modal.showAlert(
            'Book Completed!',
            '🎉 Book marked as completed! Check your pet for an experience boost!',
            'success'
          );
        }, 100);
      },
      {
        confirmText: 'Mark Complete',
        cancelText: 'Cancel'
      }
    );
    setShowDropdown(null);
  };const handleDropdownToggle = (bookKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(showDropdown === bookKey ? null : bookKey);
  };

  const getBookProgress = (bookId: string) => {
    const sessions = getSessionsByBook(bookId);
    if (sessions.length === 0) return 0;
    
    const lastSession = sessions[sessions.length - 1];
    const book = books.find(b => b.key === bookId);
    
    if (!book?.number_of_pages_median || !lastSession.endPage) return 0;
    
    return Math.min(100, Math.round((lastSession.endPage / book.number_of_pages_median) * 100));
  };

  const getTotalReadingTime = (bookId: string) => {
    const sessions = getSessionsByBook(bookId);
    return sessions.reduce((total, session) => total + (session.duration || 0), 0);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };  const categorizeBooks = () => {
    const currentlyReading: any[] = [];
    const completed: any[] = [];
    const wantToRead: any[] = [];

    displayBooks.forEach((book: any) => {
      const progress = getBookProgress(book.key);
      const readingTime = getTotalReadingTime(book.key);
      
      // Check if book has explicit category
      if (book.category === 'want-to-read') {
        wantToRead.push(book);
      } else if (book.category === 'completed' || progress >= 100) {
        completed.push(book);
      } else if (book.category === 'currently-reading' || progress > 0 || readingTime > 0) {
        currentlyReading.push(book);
      } else {
        // Default to want to read if no progress
        wantToRead.push(book);
      }
    });

    return { currentlyReading, completed, wantToRead };
  };

  const renderBookCard = (book: any) => {
    const progress = getBookProgress(book.key);
    const readingTime = getTotalReadingTime(book.key);
    const swipeState = swipeStates[book.key] || { translateX: 0, isDeleting: false };
    
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setSwipeStates(prev => ({
        ...prev,
        [book.key]: { ...swipeState, startX: touch.clientX, startY: touch.clientY }
      }));
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const state = swipeStates[book.key];
      if (!state?.startX || !state?.startY) return;

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      
      // Only allow horizontal swipes
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      
      if (deltaX < -20) { // Swiping left
        setSwipeStates(prev => ({
          ...prev,
          [book.key]: { ...state, translateX: Math.max(deltaX, -120) }
        }));
      }
    };

    const handleTouchEnd = () => {
      const state = swipeStates[book.key];
      if (!state) return;

      if (state.translateX < -60) {
        // Show delete confirmation
        setSwipeStates(prev => ({
          ...prev,
          [book.key]: { ...state, translateX: -120, isDeleting: true }
        }));
      } else {
        // Snap back
        setSwipeStates(prev => ({
          ...prev,
          [book.key]: { ...state, translateX: 0, isDeleting: false }
        }));
      }
    };    const confirmDelete = () => {
      modal.showConfirm(
        'Remove Book',
        'Are you sure you want to remove this book from your library?',
        () => {
          // Remove from both storage locations
          const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
          const updatedBooks = savedBooks.filter((b: any) => b.key !== book.key);
          localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
          
          const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
          const oldUpdatedBooks = oldSavedBooks.filter((b: any) => b.key !== book.key);
          localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
          
          // Update local state instead of page refresh
          setLocalBooks(updatedBooks);
          
          // Reset swipe state
          setSwipeStates(prev => {
            const newState = { ...prev };
            delete newState[book.key];
            return newState;
          });
        },
        {
          confirmText: 'Remove',
          cancelText: 'Keep Book'
        }
      );
    };

    const cancelDelete = () => {
      setSwipeStates(prev => ({
        ...prev,
        [book.key]: { translateX: 0, isDeleting: false }
      }));
    };
      return (      <div
        key={book.key}
        className="rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow relative"
        style={{
          backgroundColor: theme.colors.surface,
          transform: `translateX(${swipeState.translateX}px)`,
          transition: swipeState.isDeleting || swipeState.translateX === 0 ? 'transform 0.3s ease' : 'none',
          overflow: swipeState.isDeleting ? 'hidden' : 'visible'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex gap-3 p-4" onClick={() => !swipeState.isDeleting && handleBookClick(book)}>          <div className="w-12 h-16 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: theme.colors.borderLight }}>
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt={book.title}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <BookOpen className={`w-6 h-6 ${book.cover_i ? 'hidden' : ''}`} style={{ color: theme.colors.textSecondary }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-medium text-sm leading-tight mb-1 truncate" style={{ color: theme.colors.textPrimary }}>
              {book.title}
            </h3>
            {book.author_name && (
              <p className="text-xs mb-2 truncate" style={{ color: theme.colors.textSecondary }}>
                by {book.author_name[0]}
              </p>
            )}
            
            {progress > 0 && progress < 100 && (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Progress</span>
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{progress}%</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ backgroundColor: theme.colors.borderLight }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: theme.colors.secondary
                    }}
                  />
                </div>
              </div>
            )}
            
            {progress >= 100 && (
              <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                <Check className="w-3 h-3" />
                <span>Completed</span>
              </div>
            )}
            
            {readingTime > 0 && (
              <div className="flex items-center gap-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                <Clock className="w-3 h-3" />
                <span>{formatTime(readingTime)} read</span>
              </div>
            )}
          </div>
        </div>
          {!swipeState.isDeleting && (
          <button
            onClick={(e) => handleDropdownToggle(book.key, e)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.colors.borderLight }}
          >
            <MoreVertical className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        )}        {showDropdown === book.key && !swipeState.isDeleting && (
          <div className="absolute top-10 right-3 rounded-lg shadow-lg py-1 z-50 min-w-[180px]" style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveModal(book.key);
                setShowDropdown(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition-colors hover:opacity-80"
              style={{ 
                color: theme.colors.textSecondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.borderLight}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Move className="w-4 h-4" />
              Move to category
            </button>
            {book.category !== 'completed' && (
              <button
                onClick={(e) => handleMarkAsCompleted(book.key, e)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
              >
                <Check className="w-4 h-4" />
                Mark as completed
              </button>
            )}
            <button
              onClick={(e) => handleRemoveBook(book.key, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <Trash2 className="w-4 h-4" />
              Remove from library
            </button>
          </div>
        )}

        {/* Delete confirmation overlay */}
        {swipeState.isDeleting && (
          <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4">
            <div className="flex gap-2">              <button
                onClick={cancelDelete}
                className="px-3 py-1 text-xs text-red-500 rounded"
                style={{ backgroundColor: theme.colors.surface }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 text-xs bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, books: any[]) => {
    if (books.length === 0) return null;
    
    return (
      <div className="mb-8">        <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
          {title}
          <span className="text-sm font-normal" style={{ color: theme.colors.textSecondary }}>({books.length})</span>
        </h2>
        <div className="space-y-3">
          {books.map(renderBookCard)}
        </div>
      </div>
    );
  };
  return (
    <Layout>
      <div className="max-w-md mx-auto min-h-screen">
        <header 
          className="p-4 border-b"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border 
          }}
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surfaceSecondary }}
            >
              <ArrowLeft 
                className="w-5 h-5" 
                style={{ color: theme.colors.textSecondary }}
              />
            </button>
            <h1 
              className="font-serif text-xl font-medium"
              style={{ color: theme.colors.textPrimary }}
            >
              My Library
            </h1>
          </div>
        </header>

        <main className="p-4">
          {displayBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: theme.colors.textSecondary }}
              />            <h2 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>No books yet</h2>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Start building your library by searching for books to read
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              Find Books
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{displayBooks.length} book{displayBooks.length !== 1 ? 's' : ''} in your library</p>
            </div>
            
            {(() => {
              const { currentlyReading, completed, wantToRead } = categorizeBooks();
              return (
                <>
                  {renderSection("Currently Reading", currentlyReading)}
                  {renderSection("Want to Read", wantToRead)}
                  {renderSection("Completed", completed)}
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* Move Category Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">          <div className="rounded-xl p-6 w-full max-w-sm" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Move Book</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>Choose a new category:</p>
              <div className="space-y-3">
              <button
                onClick={() => handleMoveBook(showMoveModal, 'want-to-read')}
                className="w-full p-3 rounded-lg text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: theme.colors.borderLight }}
              >
                <div className="font-medium" style={{ color: theme.colors.textPrimary }}>Want to Read</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Books you plan to read</div>
              </button>
              
              <button
                onClick={() => handleMoveBook(showMoveModal, 'currently-reading')}
                className="w-full p-3 rounded-lg text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: theme.colors.borderLight }}
              >
                <div className="font-medium" style={{ color: theme.colors.textPrimary }}>Currently Reading</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Books you're actively reading</div>
              </button>
              
              <button
                onClick={() => handleMoveBook(showMoveModal, 'completed')}
                className="w-full p-3 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
              >
                <div className="font-medium" style={{ color: theme.colors.textPrimary }}>Completed</div>
                <div className="text-xs text-green-600">Books you've finished</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowMoveModal(null)}
              className="w-full mt-4 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: theme.colors.textSecondary }}
            >
              Cancel
            </button>          </div>
        </div>
      )}

      {/* Confirmation Modal */}      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onConfirm={modal.onConfirm || undefined}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.config.type}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
      />
      </div>
    </Layout>
  );
};

export default LibraryPage;