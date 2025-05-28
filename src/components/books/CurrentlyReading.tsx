import React from 'react';
import { useBooks } from '../../context/BookContext';
import { BookOpen } from 'lucide-react';

interface CurrentlyReadingProps {
  onContinueReading: () => void;
}

const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({ onContinueReading }) => {
  const { currentBook, sessions } = useBooks();
  
  if (!currentBook) {
    return (
      <div className="p-4 bg-[#F0EDE8] rounded-xl shadow-sm">
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-[#8B7355] rounded-lg">
          <div className="text-center">
            <BookOpen className="w-8 h-8 mx-auto text-[#8B7355] mb-2" />
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-1">No book selected</h3>
            <p className="text-sm text-[#8B7355]">Search for a book to start reading</p>
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

  return (
    <div className="p-4 bg-[#F0EDE8] rounded-xl shadow-sm">
      <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Currently Reading</h2>
      
      <div className="flex gap-4">
        <div className="w-24 h-36 rounded-md overflow-hidden shadow-md flex-shrink-0">
          {currentBook.cover_i ? (
            <img 
              src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-M.jpg`} 
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#8B7355] flex items-center justify-center text-white p-2">
              <span className="text-xs text-center font-serif">{currentBook.title}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-serif text-base font-medium text-[#3A3A3A] line-clamp-2 mb-1">{currentBook.title}</h3>
          
          {currentBook.author_name && currentBook.author_name.length > 0 && (
            <p className="text-sm text-[#8B7355] mb-2">by {currentBook.author_name[0]}</p>
          )}
          
          {totalPages > 0 && (
            <>
              <div className="flex items-center gap-2 text-xs text-[#8B7355] mb-2">
                <span>{progressPercent}%</span>
                <div className="flex-1 h-1.5 bg-[#F7F5F3] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E59554] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="text-xs text-[#8B7355] mb-4">
                Page {currentPage} of {totalPages}
              </div>
            </>
          )}
          
          {totalPages === 0 && (
            <div className="text-xs text-[#8B7355] mb-4">
              Page count unavailable
            </div>
          )}
          
          <button
            onClick={onContinueReading}
            className="w-full py-2 px-4 bg-[#D2691E] text-white rounded-lg text-sm font-medium hover:bg-[#A0522D] transition-colors flex items-center justify-center gap-2"
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