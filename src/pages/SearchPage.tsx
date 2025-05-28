import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, Camera, X, Hash } from 'lucide-react';
import { searchBooks, searchBooksBySubject, searchBookByISBN } from '../services/api';
import { Book } from '../types';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'general' | 'subject'>('general');
  const [showCamera, setShowCamera] = useState(false);
  
  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      // Clean up Quagga if it's running
      if (typeof window !== 'undefined' && (window as any).Quagga) {
        try {
          (window as any).Quagga.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      let books: Book[];
      if (searchType === 'subject') {
        books = await searchBooksBySubject(query);
      } else {
        books = await searchBooks(query);
      }
      setResults(books);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      
      // Start barcode scanner after modal is rendered
      setTimeout(() => {
        startBarcodeScanner();
      }, 300);
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    try {
      // Dynamically import and stop Quagga
      import('quagga').then((QuaggaModule) => {
        const QuaggaJS = QuaggaModule.default;
        QuaggaJS.stop();
        QuaggaJS.offDetected();
        QuaggaJS.offProcessed();
        console.log('Quagga stopped successfully');
      }).catch((e) => {
        console.log('Error stopping Quagga:', e);
      });
    } catch (e) {
      console.log('Quagga cleanup error:', e);
    }
    
    setShowCamera(false);
  };

  const startBarcodeScanner = async () => {
    try {
      const scannerElement = document.querySelector('#barcode-scanner');
      if (!scannerElement) {
        console.error('Scanner element not found');
        return;
      }

      // Dynamically import Quagga
      const QuaggaModule = await import('quagga');
      const QuaggaJS = QuaggaModule.default;
      
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerElement,
          constraints: {
            width: 480,
            height: 320,
            facingMode: "environment"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 1,
        frequency: 5,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader"
          ]
        },
        locate: true
      };

      console.log('Initializing Quagga with config:', config);

      QuaggaJS.init(config, (err: any) => {
        if (err) {
          console.error('QuaggaJS initialization failed:', err);
          alert('Camera access failed. Please ensure you have granted camera permissions and are using HTTPS.');
          stopCamera();
          return;
        }
        console.log('QuaggaJS initialized successfully');
        QuaggaJS.start();
        console.log('QuaggaJS started');
      });

      // Listen for successful barcode detection
      QuaggaJS.onDetected((data: any) => {
        const code = data.codeResult.code;
        console.log('Barcode detected:', code);
        
        // Validate and clean the barcode
        const cleanedCode = cleanBarcode(code);
        console.log('Cleaned barcode:', cleanedCode);
        
        if (isValidISBN(cleanedCode)) {
          console.log('Valid ISBN detected, searching...');
          handleISBNSearch(cleanedCode);
          stopCamera();
        } else {
          console.log('Invalid ISBN format, continuing scan...');
        }
      });

      // Reduce processing logs
      let frameCount = 0;
      QuaggaJS.onProcessed((result: any) => {
        frameCount++;
        if (frameCount % 30 === 0) { // Log every 30 frames
          console.log('Processing frames... Count:', frameCount);
        }
        
        if (result && result.codeResult && result.codeResult.code) {
          console.log('Potential code detected:', result.codeResult.code);
        }
      });

    } catch (error) {
      console.error('Error loading Quagga:', error);
      alert('Failed to load barcode scanner. Please try again.');
      stopCamera();
    }
  };

  const isValidISBN = (code: string): boolean => {
    const cleaned = code.replace(/[^0-9X]/gi, '');
    return cleaned.length === 10 || cleaned.length === 13;
  };

  const cleanBarcode = (code: string): string => {
    // Remove any non-numeric characters except X (for ISBN-10)
    return code.replace(/[^0-9X]/gi, '');
  };

  const handleISBNSearch = async (isbn: string) => {
    setIsSearching(true);
    try {
      const book = await searchBookByISBN(isbn);
      if (book) {
        setResults([book]);
        setQuery(isbn);
      } else {
        alert('No book found for this barcode');
      }
    } catch (error) {
      console.error('Error searching by ISBN:', error);
      alert('Error scanning barcode');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectBook = (book: Book) => {
    navigate(`/book?book=${book.key}`, { state: { bookData: book } });
  };
  
  const renderBookCard = (book: Book) => (
    <button
      key={book.key}
      onClick={() => handleSelectBook(book)}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="w-12 h-16 bg-[#F0EDE8] rounded flex-shrink-0 overflow-hidden">
        {book.cover_i ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${book.cover_i ? 'hidden' : ''}`}>
          <BookOpen className="w-6 h-6 text-[#8B7355]" />
        </div>
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
        {book.first_publish_year && (
          <p className="text-xs text-[#8B7355]">{book.first_publish_year}</p>
        )}
      </div>
    </button>
  );
  
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3] pb-6">
      <header className="p-4 bg-[#F0EDE8] shadow-sm">
        <div className="flex items-center gap-3 mb-3">
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
              placeholder={searchType === 'subject' ? "Search by subject (e.g. science, fiction)..." : "Search for books..."}
              className="w-full py-2 px-4 pr-10 bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E59554] text-[#3A3A3A]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-[#E59554] text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          
          <button
            onClick={startCamera}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E59554] text-white hover:bg-[#D2691E] transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Search Type Toggle */}
        <div className="flex bg-white rounded-lg p-1">
          <button
            onClick={() => setSearchType('general')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              searchType === 'general' 
                ? 'bg-[#E59554] text-white' 
                : 'text-[#8B7355] hover:bg-[#F7F5F3]'
            }`}
          >
            <Search className="w-4 h-4" />
            General
          </button>
          <button
            onClick={() => setSearchType('subject')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              searchType === 'subject' 
                ? 'bg-[#E59554] text-white' 
                : 'text-[#8B7355] hover:bg-[#F7F5F3]'
            }`}
          >
            <Hash className="w-4 h-4" />
            Subject
          </button>
        </div>
      </header>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 m-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-medium text-[#3A3A3A]">Scan ISBN Barcode</h3>
              <button
                onClick={stopCamera}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F5F3] transition-colors"
              >
                <X className="w-5 h-5 text-[#8B7355]" />
              </button>
            </div>
            
            <div className="relative">
              <div 
                id="barcode-scanner"
                className="w-full h-48 bg-black rounded-lg overflow-hidden relative"
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                  <div className="text-center">
                    <div className="mb-2">📷</div>
                    <div>Initializing camera...</div>
                    <div className="text-xs mt-1">Make sure to allow camera access</div>
                  </div>
                </div>
              </div>
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-2 border-[#E59554] rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-16 border-2 border-white rounded">
                  <div className="absolute inset-0 border-t-2 border-[#E59554] animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-[#8B7355] mb-2">
                Point camera at book's barcode
              </p>
              <p className="text-xs text-[#8B7355] mb-2">
                Hold steady and ensure good lighting
              </p>
              <p className="text-xs text-[#8B7355] italic">
                Looking for ISBN-13 barcodes (978...)
              </p>
              
              {/* Manual input fallback */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const isbn = prompt('Enter ISBN manually (if barcode scan fails):');
                    if (isbn) {
                      handleISBNSearch(isbn.trim());
                      stopCamera();
                    }
                  }}
                  className="text-xs text-[#E59554] underline"
                >
                  Enter ISBN manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="px-4 py-4">
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E59554]"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A]">
              {searchType === 'subject' ? 'Books in Subject' : 'Search Results'}
            </h2>
            
            <div className="space-y-3">
              {results.map((book) => renderBookCard(book))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Search className="w-12 h-12 text-[#8B7355] mb-4 opacity-70" />
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">Find your next great read</h2>
            <p className="text-sm text-[#8B7355] max-w-xs mb-4">
              Search for books by title, author, ISBN, or browse by subject. You can also scan a barcode!
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[#8B7355]">
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                Scan
              </div>
              <div className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                Search
              </div>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Browse
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;