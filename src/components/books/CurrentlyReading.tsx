import React, { useEffect, useState } from 'react';
import { useBooks } from '../../context/BookContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen } from 'lucide-react';

interface CurrentlyReadingProps {
  onContinueReading: () => void;
}

const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({ onContinueReading }) => {
  const { currentBook, sessions, setActiveBook } = useBooks();
  const { theme } = useTheme();
  const [isBookInLibrary, setIsBookInLibrary] = useState(true);
  
  // Check if current book is still in library
  useEffect(() => {
    if (currentBook) {
      const savedBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const bookExists = savedBooks.some((book: any) => book.key === currentBook.key);
      setIsBookInLibrary(bookExists);
      
      // If book was removed from library, clear it as current book
      if (!bookExists) {
        setActiveBook(null);
      }
    }
  }, [currentBook, setActiveBook]);
    if (!currentBook || !isBookInLibrary) {
    return (
      <div 
        className="p-4 rounded-xl shadow-sm"
        style={{ backgroundColor: theme.colors.surfaceSecondary }}
      >
        <div 
          className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg"
          style={{ borderColor: theme.colors.textSecondary }}
        >
          <div className="text-center">
            <BookOpen 
              className="w-8 h-8 mx-auto mb-2" 
              style={{ color: theme.colors.textSecondary }}
            />
            <h3 
              className="font-serif text-lg font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              No book selected
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Search for a book to start reading
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Find the latest reading session to get current page
  const latestSession = [...sessions].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0];
  
  const currentPage = latestSession?.endPage || latestSession?.startPage || 1;
  const totalPages = currentBook.number_of_pages_median || 0;
  const progressPercent = totalPages > 0 ? Math.min(Math.round((currentPage / totalPages) * 100), 100) : 0;

  // Determine if we should show progress or just current page
  const showProgress = totalPages > 0;
  const hasValidProgress = showProgress && progressPercent > 0;
  return (
    <div 
      className="p-4 rounded-xl shadow-sm"
      style={{ backgroundColor: theme.colors.surfaceSecondary }}
    >
      <h2 
        className="font-serif text-lg font-medium mb-3"
        style={{ color: theme.colors.textPrimary }}
      >
        Currently Reading
      </h2>
      
      <div className="flex gap-4">
        <div className="w-24 h-36 rounded-md overflow-hidden shadow-md flex-shrink-0">
          {currentBook.cover_i ? (
            <img 
              src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-M.jpg`} 
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white p-2"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              <span className="text-xs text-center font-serif">{currentBook.title}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 
            className="font-serif text-base font-medium line-clamp-2 mb-1"
            style={{ color: theme.colors.textPrimary }}
          >
            {currentBook.title}
          </h3>
          
          {currentBook.author_name && currentBook.author_name.length > 0 && (
            <p 
              className="text-sm mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              by {currentBook.author_name[0]}
            </p>
          )}
          
          {hasValidProgress ? (
            <>
              <div 
                className="flex items-center gap-2 text-xs mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                <span>{progressPercent}%</span>
                <div 
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: theme.colors.border }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: theme.colors.primary
                    }}
                  />
                </div>
              </div>
              
              <div 
                className="text-xs mb-4"
                style={{ color: theme.colors.textSecondary }}
              >
                Page {currentPage} of {totalPages}
              </div>
            </>
          ) : showProgress ? (
            <div 
              className="text-xs mb-4"
              style={{ color: theme.colors.textSecondary }}
            >
              Page {currentPage} of {totalPages}
            </div>
          ) : (
            <div 
              className="text-xs mb-4"
              style={{ color: theme.colors.textSecondary }}
            >
              Currently on page {currentPage}
              <div className="text-xs opacity-75 mt-1">
                Page count unavailable
              </div>
            </div>
          )}
          
          <button
            onClick={onContinueReading}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textInverse
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
            }}
          >
            <BookOpen className="w-4 h-4" />
            Continue Reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentlyReading;