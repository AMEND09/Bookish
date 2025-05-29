import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Timer, PenLine, PlayCircle, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { getBookDetails } from '../services/api';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';

const BookDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { books, setActiveBook, sessions, notes } = useBooks();
  const { updatePetFromBookCompletion } = usePet();
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

      // Fetch additional book details if needed
      if (!currentBook.description) {
        setLoading(true);
        
        getBookDetails(currentBook.key)
          .then(details => {
            if (details) {
              setCurrentBook((prev: any) => ({
                ...prev,
                description: details.description,
                number_of_pages_median: details.number_of_pages_median || prev.number_of_pages_median
              }));
            }
          })
          .catch(error => {
            console.error('Error fetching book details:', error);
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
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3]">
      {/* Header with back button */}
      <div className="p-4 bg-[#F7F5F3]">
        <button
          onClick={handleBackNavigation}
          className="w-8 h-8 flex items-center justify-center bg-[#F0EDE8] rounded-full hover:bg-[#E8E3DD] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
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
              />
            ) : (
              <div className="w-full h-full bg-[#8B7355] flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          {/* Book title and author */}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl font-medium text-[#3A3A3A] mb-2 leading-tight">
              {currentBook.title}
            </h1>
            
            {currentBook.author_name && currentBook.author_name.length > 0 && (
              <p className="text-sm text-[#8B7355] mb-3">by {currentBook.author_name[0]}</p>
            )}
            
            {/* Book metadata */}
            <div className="space-y-1">
              {currentBook.first_publish_year && (
                <p className="text-xs text-[#8B7355]">First published: {currentBook.first_publish_year}</p>
              )}
              {totalPages > 0 && (
                <p className="text-xs text-[#8B7355]">{totalPages} pages</p>
              )}
            </div>
          </div>
        </div>
        {isInLibrary && totalPages > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#8B7355]">Progress</span>
                <span className="text-xs font-medium text-[#3A3A3A]">{progressPercent}%</span>
              </div>
              
              <div className="w-full h-2 bg-[#F0EDE8] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#E59554] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <span className="text-xs text-[#8B7355]">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <div className="w-px bg-[#F0EDE8]"></div>
            
            <div className="flex flex-col items-center justify-center w-24">
              <Timer className="w-5 h-5 text-[#8B7355] mb-1" />
              <span className="text-sm font-medium text-[#3A3A3A]">{formattedTime}</span>
              <span className="text-xs text-[#8B7355]">Total Time</span>
            </div>
          </div>
        )}
        
        {/* Description */}
        {loading ? (
          <div className="h-32 bg-[#F0EDE8] animate-pulse rounded-lg mb-6"></div>
        ) : currentBook.description ? (
          <div className="mb-6">
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">About this book</h2>
            <div className="relative">
              <p className={`text-sm text-[#3A3A3A] leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                {typeof currentBook.description === 'string' 
                  ? currentBook.description 
                  : 'No description available.'}
              </p>
              
              {currentBook.description && currentBook.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-[#8B7355] hover:text-[#3A3A3A] transition-colors"
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
                {bookNotes.slice(0, 2).map(note => (
                  <div key={note.id} className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#8B7355]">
                        {note.chapter ? `Chapter: ${note.chapter}` : ''}
                        {note.chapter && note.page ? ' • ' : ''}
                        {note.page ? `Page ${note.page}` : ''}
                      </span>
                      <span className="text-xs text-[#8B7355]">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#3A3A3A] line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <PenLine className="w-6 h-6 text-[#8B7355] mx-auto mb-2" />
                  <p className="text-sm text-[#8B7355] mb-1">No notes yet</p>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F0EDE8] flex gap-4 max-w-md mx-auto">
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
                    className="flex-1 py-3 px-4 bg-white border border-[#D2691E] text-[#D2691E] rounded-lg font-medium text-sm flex items-center justify-center gap-2"
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
                className="flex-1 py-3 px-4 bg-white border border-[#8B7355] text-[#8B7355] rounded-lg font-medium text-sm"
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
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4">Add to Library</h3>
            <p className="text-sm text-[#8B7355] mb-6">Choose where to add this book:</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleAddToLibrary('want-to-read')}
                className="w-full p-4 bg-[#F0EDE8] rounded-lg text-left hover:bg-[#E8E3DD] transition-colors"
              >
                <div className="font-medium text-[#3A3A3A] mb-1">Want to Read</div>
                <div className="text-xs text-[#8B7355]">Save for later reading</div>
              </button>
              
              <button
                onClick={() => handleAddToLibrary('currently-reading')}
                className="w-full p-4 bg-[#8B7355] text-white rounded-lg text-left hover:bg-[#7A6349] transition-colors"
              >
                <div className="font-medium mb-1">Start Reading Now</div>
                <div className="text-xs opacity-90">Add to library and begin reading session</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-4 py-2 text-sm text-[#8B7355] hover:text-[#3A3A3A] transition-colors"
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