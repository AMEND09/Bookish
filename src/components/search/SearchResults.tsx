import React from 'react';
import { BookOpen } from 'lucide-react';
import { Book } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SearchResultsProps {
  results: Book[];
  onBookSelect: (book: Book) => void;
  loading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onBookSelect, loading = false }) => {
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex gap-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: theme.colors.surface }}>
            <div className="w-16 h-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.textSecondary }} />
        <p style={{ color: theme.colors.textSecondary }}>No books found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((book) => (        <div
          key={book.key}
          onClick={() => onBookSelect(book)}
          className="flex gap-4 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0">
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#8B7355] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-medium text-[#3A3A3A] line-clamp-2 mb-1">
              {book.title}
            </h3>
            
            {book.author_name && book.author_name.length > 0 && (
              <p className="text-sm text-[#8B7355] mb-2">
                by {book.author_name.slice(0, 2).join(', ')}
                {book.author_name.length > 2 && ' et al.'}
              </p>
            )}
            
            <div className="flex gap-4 text-xs text-[#8B7355]">
              {book.first_publish_year && (
                <span>Published: {book.first_publish_year}</span>
              )}
              {book.number_of_pages_median && (
                <span>{book.number_of_pages_median} pages</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;