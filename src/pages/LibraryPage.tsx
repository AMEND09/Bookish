import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, MoreVertical, Trash2, Check, Move } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import { getSessionsByBook } from '../services/storage';

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { updatePetFromBookCompletion } = usePet();const [showDropdown, setShowDropdown] = useState<string | null>(null);
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
  };
  const handleRemoveBook = (bookKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this book from your library?')) {
      // Remove book from local storage using the same key structure as the app
      const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const updatedBooks = savedBooks.filter((book: any) => book.key !== bookKey);
      localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
      
      // Also remove from the old storage key for backward compatibility
      const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
      const oldUpdatedBooks = oldSavedBooks.filter((book: any) => book.key !== bookKey);
      localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
      
      // Update local state instead of page refresh
      setLocalBooks(updatedBooks);
    }
    setShowDropdown(null);
  };  const handleMoveBook = (bookKey: string, newCategory: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Update book category in storage
    const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
    const updatedBooks = savedBooks.map((book: any) => 
      book.key === bookKey ? { ...book, category: newCategory } : book
    );
    localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
    
    // Also update old storage for backward compatibility
    const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
    const oldUpdatedBooks = oldSavedBooks.map((book: any) => 
      book.key === bookKey ? { ...book, category: newCategory } : book
    );
    localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
    
    // Update local state instead of page refresh
    setLocalBooks(updatedBooks);
    setShowMoveModal(null);
    setShowDropdown(null);
  };
  const handleMarkAsCompleted = (bookKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Mark this book as completed? This will give your pet a big experience boost!')) {
      handleMoveBook(bookKey, 'completed');
      
      // Trigger pet reward
      updatePetFromBookCompletion();
      
      // Show success message
      setTimeout(() => {
        alert('🎉 Book marked as completed! Check your pet for an experience boost!');
      }, 100);
    }
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
      if (window.confirm('Are you sure you want to remove this book from your library?')) {
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
      }
    };

    const cancelDelete = () => {
      setSwipeStates(prev => ({
        ...prev,
        [book.key]: { translateX: 0, isDeleting: false }
      }));
    };
      return (
      <div
        key={book.key}
        className="bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow relative"
        style={{
          transform: `translateX(${swipeState.translateX}px)`,
          transition: swipeState.isDeleting || swipeState.translateX === 0 ? 'transform 0.3s ease' : 'none',
          overflow: swipeState.isDeleting ? 'hidden' : 'visible'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex gap-3 p-4" onClick={() => !swipeState.isDeleting && handleBookClick(book)}>
          <div className="w-12 h-16 bg-[#F0EDE8] rounded flex-shrink-0 flex items-center justify-center">
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
            <BookOpen className={`w-6 h-6 text-[#8B7355] ${book.cover_i ? 'hidden' : ''}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-medium text-[#3A3A3A] text-sm leading-tight mb-1 truncate">
              {book.title}
            </h3>
            {book.author_name && (
              <p className="text-xs text-[#8B7355] mb-2 truncate">
                by {book.author_name[0]}
              </p>
            )}
            
            {progress > 0 && progress < 100 && (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#8B7355]">Progress</span>
                  <span className="text-xs text-[#8B7355]">{progress}%</span>
                </div>
                <div className="w-full bg-[#F0EDE8] rounded-full h-1.5">
                  <div
                    className="bg-[#8B7355] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
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
              <div className="flex items-center gap-1 text-xs text-[#8B7355]">
                <Clock className="w-3 h-3" />
                <span>{formatTime(readingTime)} read</span>
              </div>
            )}
          </div>
        </div>
        
        {!swipeState.isDeleting && (
          <button
            onClick={(e) => handleDropdownToggle(book.key, e)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#F0EDE8] flex items-center justify-center hover:bg-[#E8E3DD] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[#8B7355]" />
          </button>
        )}        {showDropdown === book.key && !swipeState.isDeleting && (
          <div className="absolute top-10 right-3 bg-white rounded-lg shadow-lg border border-[#E8E3DD] py-1 z-50 min-w-[180px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveModal(book.key);
                setShowDropdown(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#8B7355] hover:bg-[#F0EDE8] w-full text-left"
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
            <div className="flex gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 text-xs bg-white text-red-500 rounded"
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
      <div className="mb-8">
        <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4 flex items-center gap-2">
          {title}
          <span className="text-sm text-[#8B7355] font-normal">({books.length})</span>
        </h2>
        <div className="space-y-3">
          {books.map(renderBookCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3]">
      <header className="p-4 bg-[#F7F5F3] border-b border-[#E8E3DD]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
          </button>
          <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">My Library</h1>
        </div>
      </header>      <main className="p-4">
        {displayBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">No books yet</h2>
            <p className="text-sm text-[#8B7355] mb-6">
              Start building your library by searching for books to read
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-[#8B7355] text-white px-6 py-3 rounded-xl font-medium"
            >
              Find Books
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#8B7355]">{displayBooks.length} book{displayBooks.length !== 1 ? 's' : ''} in your library</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4">Move Book</h3>
            <p className="text-sm text-[#8B7355] mb-6">Choose a new category:</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleMoveBook(showMoveModal, 'want-to-read')}
                className="w-full p-3 bg-[#F0EDE8] rounded-lg text-left hover:bg-[#E8E3DD] transition-colors"
              >
                <div className="font-medium text-[#3A3A3A]">Want to Read</div>
                <div className="text-xs text-[#8B7355]">Books you plan to read</div>
              </button>
              
              <button
                onClick={() => handleMoveBook(showMoveModal, 'currently-reading')}
                className="w-full p-3 bg-[#E8E3DD] rounded-lg text-left hover:bg-[#DDD8CE] transition-colors"
              >
                <div className="font-medium text-[#3A3A3A]">Currently Reading</div>
                <div className="text-xs text-[#8B7355]">Books you're actively reading</div>
              </button>
              
              <button
                onClick={() => handleMoveBook(showMoveModal, 'completed')}
                className="w-full p-3 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
              >
                <div className="font-medium text-[#3A3A3A]">Completed</div>
                <div className="text-xs text-green-600">Books you've finished</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowMoveModal(null)}
              className="w-full mt-4 py-2 text-sm text-[#8B7355] hover:text-[#3A3A3A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;