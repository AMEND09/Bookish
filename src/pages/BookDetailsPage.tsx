import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Timer, PenLine, PlayCircle, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { getBookDetails } from '../services/api';
import { getCachedBookDetails, cacheBookDetails } from '../services/storage';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';

const BookDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { books, setActiveBook, sessions, notes } = useBooks();
  const { updatePetFromBookCompletion } = usePet();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const modal = useConfirmationModal();
  
  const bookKey = searchParams.get('book');

  useEffect(() => {
    // First try to get book from location state (from SearchPage)
    if (location.state?.bookData) {
      setCurrentBook(location.state.bookData);
    } else {
      // Fall back to finding it in the books context
      const book = books.find(b => b.key === bookKey);
      if (book) {
        setCurrentBook(book);
      } else {
        navigate('/');
        return;
      }
    }
  }, [bookKey, books, location.state, navigate]);

  useEffect(() => {
    if (currentBook) {
      // Check if book is already in library
      const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const isAlreadyInLibrary = savedBooks.some((b: any) => b.key === currentBook.key);
      setIsInLibrary(isAlreadyInLibrary);

      // Try to get cached details first for offline support
      const cachedDetails = getCachedBookDetails(currentBook.key);
      if (cachedDetails && cachedDetails.description && !currentBook.description) {
        setCurrentBook((prev: any) => ({
          ...prev,
          description: cachedDetails.description,
          number_of_pages_median: cachedDetails.number_of_pages_median || prev.number_of_pages_median
        }));
        return;
      }

      // Fetch additional book details if needed and not cached
      if (!currentBook.description) {
        setLoading(true);
        
        getBookDetails(currentBook.key)
          .then(details => {
            if (details) {
              const updatedBook = {
                ...currentBook,
                description: details.description,
                number_of_pages_median: details.number_of_pages_median || currentBook.number_of_pages_median
              };
              setCurrentBook(updatedBook);
              
              // Cache the enhanced book details
              cacheBookDetails(updatedBook);
            }
          })
          .catch(error => {
            console.error('Error fetching book details:', error);
            // If offline and we have cached data, use it
            if (cachedDetails) {
              setCurrentBook((prev: any) => ({
                ...prev,
                ...cachedDetails
              }));
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [currentBook]);

  if (!currentBook) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8B7355] mb-4">Book not found</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-[#8B7355] text-white px-6 py-3 rounded-xl font-medium"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleAddToLibrary = (category: 'want-to-read' | 'currently-reading') => {
    const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
    
    if (!savedBooks.some((b: any) => b.key === currentBook.key)) {
      const bookWithCategory = {
        ...currentBook,
        category,
        dateAdded: new Date().toISOString()
      };
      
      savedBooks.push(bookWithCategory);
      localStorage.setItem('bookish_books', JSON.stringify(savedBooks));
      
      // Cache book details for offline access
      cacheBookDetails(bookWithCategory);
      
      // Also save to old storage for backward compatibility
      const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
      if (!oldSavedBooks.some((b: any) => b.key === currentBook.key)) {
        oldSavedBooks.push(bookWithCategory);
        localStorage.setItem('myBooks', JSON.stringify(oldSavedBooks));
      }
      
      setIsInLibrary(true);
      setShowCategoryModal(false);
      
      // If adding as currently reading, set as active book
      if (category === 'currently-reading') {
        setActiveBook(currentBook);
        navigate('/reading');
      }
    }
  };

  const handleMarkAsCompleted = () => {
    modal.showConfirm(
      'Mark as Completed',
      'Mark this book as completed? This will give your pet a big experience boost!',
      () => {
        // Update book category in storage
        const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
        const updatedBooks = savedBooks.map((book: any) => 
          book.key === currentBook.key ? { ...book, category: 'completed', completedAt: new Date().toISOString() } : book
        );
        localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
        
        // Also update old storage for backward compatibility
        const oldSavedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const oldUpdatedBooks = oldSavedBooks.map((book: any) => 
          book.key === currentBook.key ? { ...book, category: 'completed', completedAt: new Date().toISOString() } : book
        );
        localStorage.setItem('myBooks', JSON.stringify(oldUpdatedBooks));
        
        // Reward the pet for completing a book
        updatePetFromBookCompletion();
        
        // Clear as active book if it was currently reading
        if (currentBook.key === (JSON.parse(localStorage.getItem('bookish_current_book') || 'null'))?.key) {
          setActiveBook(null);
        }
        
        // Show success message and navigate back
        modal.showAlert(
          'Congratulations!',
          '🎉 You\'ve completed the book and your pet gained experience!',
          'success'
        );
        
        setTimeout(() => {
          navigate('/library');
        }, 1500);
      },
      {
        confirmText: 'Mark Complete',
        cancelText: 'Cancel'
      }
    );
  };

  // Calculate reading progress
  const totalPages = currentBook.number_of_pages_median || 0;
  const latestSession = [...sessions]
    .filter(s => s.bookId === currentBook.key)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
  
  const currentPage = latestSession?.endPage || latestSession?.startPage || 1;
  const progressPercent = totalPages > 0 ? Math.min(Math.round((currentPage / totalPages) * 100), 100) : 0;
  
  // Calculate total reading time for this book
  const totalMinutes = sessions
    .filter(s => s.bookId === currentBook.key)
    .reduce((total, session) => total + (session.duration || 0), 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedTime = hours > 0 
    ? `${hours} hr${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`
    : `${minutes} min`;
  
  // Get book notes
  const bookNotes = notes.filter(note => note.bookId === currentBook.key);

  // Check if book is completed
  const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
  const bookInLibrary = savedBooks.find((b: any) => b.key === currentBook.key);
  const isCompleted = bookInLibrary?.category === 'completed';

  const handleBackNavigation = () => {
    // Simple back navigation
    navigate(-1);
  };
  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      {/* Header with back button */}
      <div className="p-4" style={{ backgroundColor: theme.colors.background }}>
        <button
          onClick={handleBackNavigation}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-colors"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.primary }} />
        </button>
      </div>

      {/* Book info section with cover and title side by side */}
      <div className="p-6">
        <div className="flex gap-4 mb-6">
          {/* Book cover */}
          <div className="w-24 h-32 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            {currentBook.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-M.jpg`}
                alt={currentBook.title}
                className="w-full h-full object-cover"
              />            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          {/* Book title and author */}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl font-medium mb-2 leading-tight" style={{ color: theme.colors.textPrimary }}>
              {currentBook.title}
            </h1>
            
            {currentBook.author_name && currentBook.author_name.length > 0 && (
              <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>by {currentBook.author_name[0]}</p>
            )}
            
            {/* Book metadata */}
            <div className="space-y-1">
              {currentBook.first_publish_year && (
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>First published: {currentBook.first_publish_year}</p>
              )}
              {totalPages > 0 && (
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{totalPages} pages</p>
              )}
            </div>
          </div>
        </div>        {isInLibrary && totalPages > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Progress</span>
                <span className="text-xs font-medium" style={{ color: theme.colors.textPrimary }}>{progressPercent}%</span>
              </div>
              
              <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: theme.colors.borderLight }}>
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: theme.colors.secondary
                  }}
                />
              </div>
              
              <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <div className="w-px" style={{ backgroundColor: theme.colors.border }}></div>
            
            <div className="flex flex-col items-center justify-center w-24">
              <Timer className="w-5 h-5 mb-1" style={{ color: theme.colors.textSecondary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{formattedTime}</span>
              <span className="text-xs text-[#8B7355]">Total Time</span>
            </div>
          </div>
        )}
          {/* Description */}
        {loading ? (
          <div className="h-32 animate-pulse rounded-lg mb-6" style={{ backgroundColor: theme.colors.borderLight }}></div>
        ) : currentBook.description ? (
          <div className="mb-6">
            <h2 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>About this book</h2>
            <div className="relative">
              <p className={`text-sm leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`} style={{ color: theme.colors.textPrimary }}>
                {typeof currentBook.description === 'string' 
                  ? currentBook.description 
                  : 'No description available.'}
              </p>
              
              {currentBook.description && currentBook.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Read more
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : null}
        
        {/* Notes */}
        {isInLibrary && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-serif text-lg font-medium text-[#3A3A3A]">My Notes</h2>
              <button 
                onClick={() => navigate('/notes')}
                className="text-xs font-medium text-[#D2691E]"
              >
                View All
              </button>
            </div>
            
            {bookNotes.length > 0 ? (
              <div className="space-y-2">
                {bookNotes.slice(0, 2).map(note => (                  <div key={note.id} className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {note.chapter ? `Chapter: ${note.chapter}` : ''}
                        {note.chapter && note.page ? ' • ' : ''}
                        {note.page ? `Page ${note.page}` : ''}
                      </span>
                      <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: theme.colors.textPrimary }}>{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (              <div className="p-4 rounded-lg shadow-sm flex items-center justify-center" style={{ backgroundColor: theme.colors.surface }}>
                <div className="text-center">
                  <PenLine className="w-6 h-6 mx-auto mb-2" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>No notes yet</p>
                  <button 
                    onClick={() => navigate('/notes/add')}
                    className="text-xs font-medium text-[#D2691E]"
                  >
                    Add Your First Note
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t flex gap-4 max-w-md mx-auto" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
          {isInLibrary ? (
            <>
              {isCompleted ? (
                <div className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Completed
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/notes/add')}
                    className="flex-1 py-3 px-4 border border-[#D2691E] text-[#D2691E] rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <PenLine className="w-5 h-5" />
                    Add Note
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveBook(currentBook);
                      navigate('/reading');
                    }}
                    className="flex-1 py-3 px-4 bg-[#D2691E] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Reading
                  </button>
                  
                  <button
                    onClick={handleMarkAsCompleted}
                    className="py-3 px-3 bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center"
                    title="Mark as Completed"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/library')}
                className="flex-1 py-3 px-4 border border-[#8B7355] text-[#8B7355] rounded-lg font-medium text-sm"
                style={{ backgroundColor: theme.colors.surface }}
              >
                View Library
              </button>
              
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex-1 py-3 px-4 bg-[#8B7355] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Library
              </button>
            </>
          )}
        </div>
      </div>      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-6 w-full max-w-sm" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Add to Library</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>Choose where to add this book:</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleAddToLibrary('want-to-read')}
                className="w-full p-4 rounded-lg text-left hover:opacity-80 transition-colors"
                style={{ backgroundColor: theme.colors.borderLight }}
              >
                <div className="font-medium mb-1" style={{ color: theme.colors.textPrimary }}>Want to Read</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Save for later reading</div>
              </button>
              
              <button
                onClick={() => handleAddToLibrary('currently-reading')}
                className="w-full p-4 text-white rounded-lg text-left hover:opacity-90 transition-colors"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <div className="font-medium mb-1">Start Reading Now</div>
                <div className="text-xs opacity-90">Add to library and begin reading session</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-4 py-2 text-sm hover:opacity-80 transition-colors"
              style={{ color: theme.colors.textSecondary }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
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
  );
};

export default BookDetailsPage;