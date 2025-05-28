import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { searchBooks, getBookCoverUrl } from '../services/api';
import { Book } from '../types';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const books = await searchBooks(query);
      setResults(books);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectBook = (book: Book) => {
    // Just navigate to book details without adding to library
    // Pass the book data as state so it's available on the details page
    navigate(`/book?book=${book.key}`, { state: { bookData: book } });
  };
  
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3] pb-6">
      <header className="p-4 bg-[#F0EDE8] flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F5F3] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
        </button>
        
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-full py-2 px-4 pr-10 bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E59554] text-[#3A3A3A]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-[#E59554] text-white"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </header>
      
      <main className="px-4 py-4">
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E59554]"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A]">Search Results</h2>
            
            <div className="space-y-3">
              {results.map((book) => (
                <button
                  key={book.key}
                  onClick={() => handleSelectBook(book)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="w-16 h-24 rounded overflow-hidden bg-[#F0EDE8] flex-shrink-0">
                    {book.cover_i ? (
                      <img
                        src={getBookCoverUrl(book.cover_i, 'S')}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#8B7355]">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-serif text-base font-medium text-[#3A3A3A] line-clamp-2">{book.title}</h3>
                    
                    {book.author_name && book.author_name.length > 0 && (
                      <p className="text-sm text-[#8B7355] mb-1">{book.author_name[0]}</p>
                    )}
                    
                    {book.first_publish_year && (
                      <p className="text-xs text-[#8B7355]">{book.first_publish_year}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Search className="w-12 h-12 text-[#8B7355] mb-4 opacity-70" />
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">Find your next great read</h2>
            <p className="text-sm text-[#8B7355] max-w-xs">
              Search for books by title, author, or ISBN to add them to your library.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;