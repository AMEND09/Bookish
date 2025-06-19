import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, ReadingSession, ReadingNote } from '../types';
import syncedStorage from '../services/syncedStorage';
import { getCachedBookDetails, forceStatsUpdate } from '../services/storage';
import gunService from '../services/gun';
import { useAuth } from './AuthContext';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  sessions: ReadingSession[];
  notes: ReadingNote[];
  addBook: (book: Book) => Promise<void>;
  removeBook: (bookKey: string) => Promise<void>;
  setActiveBook: (book: Book | null) => Promise<void>;
  addSession: (session: ReadingSession) => Promise<void>;
  addNote: (note: ReadingNote) => Promise<void>;
  updateNote: (note: ReadingNote) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  updatePublicStatsAfterBookCompletion: () => Promise<void>; // Export this function for manual calls
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

interface BookProviderProps {
  children: ReactNode;
}

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBookState] = useState<Book | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [notes, setNotes] = useState<ReadingNote[]>([]);

  // Initialize from synced storage
  useEffect(() => {
    const loadData = async () => {
      const loadedBooks = await syncedStorage.getBooks();
      
      // Enhance books with cached details for offline support
      const enhancedBooks = loadedBooks.map((book: Book) => {
        const cachedDetails = getCachedBookDetails(book.key);
        return cachedDetails ? { ...book, ...cachedDetails } : book;
      });
      
      setBooks(enhancedBooks);
      
      const currentBookData = await syncedStorage.getCurrentBook();
      setCurrentBookState(currentBookData);
    };
    
    loadData();
  }, []);

  // Update sessions and notes when current book changes
  useEffect(() => {
    const loadBookData = async () => {
      if (currentBook) {
        const allSessions = await syncedStorage.getReadingSessions();
        const allNotes = await syncedStorage.getNotes();
        
        setSessions(allSessions.filter(session => session.bookId === currentBook.key));
        setNotes(allNotes.filter(note => note.bookId === currentBook.key));
      } else {
        setSessions([]);
        setNotes([]);
      }
    };
    
    loadBookData();
  }, [currentBook]);
  const addBook = async (book: Book) => {
    const updatedBooks = [...books];
    const existingIndex = updatedBooks.findIndex(b => b.key === book.key);
    
    // Check if this is a book being marked as completed
    const wasCompleted = existingIndex >= 0 && updatedBooks[existingIndex].category === 'completed';
    const isNowCompleted = book.category === 'completed';
    
    if (existingIndex >= 0) {
      updatedBooks[existingIndex] = book;
    } else {
      updatedBooks.push(book);
    }
      setBooks(updatedBooks);
    await syncedStorage.saveBooks(updatedBooks);
      // Publish activity if book was just completed
    if (!wasCompleted && isNowCompleted) {
      try {
        await gunService.publishActivity({
          type: 'book_completed',
          title: 'Completed a book!',
          description: `Just finished reading "${book.title}"`,
          bookTitle: book.title,
          bookCover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` : undefined,
          metadata: {
            pagesRead: book.number_of_pages_median || 200
          }
        });
        console.log('📚 Published book completion activity:', book.title);

        // Immediately update public stats when a book is completed
        await updatePublicStatsAfterBookCompletion();
      } catch (err) {
        console.error('Error publishing book completion activity:', err);
      }
    }
      // Force stats update when any book is added/updated (especially for completed books)
    await forceStatsUpdate();
  };
  // Function to recalculate and update public stats
  const updatePublicStatsAfterBookCompletion = async () => {
    try {
      console.log('📊 Updating public stats after book completion...');
      
      // Get fresh data from local storage first (most up-to-date)
      const localBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const localSessions = JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]');
      
      console.log('📊 Local books data:', localBooks);
      console.log('📊 Local sessions data:', localSessions);
      
      const completedBooks = localBooks.filter((book: any) => book.category === 'completed');
      console.log('📊 Completed books count:', completedBooks.length);
      
      // Calculate total reading time (in minutes)
      const totalReadingTime = localSessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      // Calculate total pages read from sessions
      const totalPagesRead = localSessions.reduce((total: number, session: any) => {
        const pagesRead = (session.endPage || 0) - (session.startPage || 0);
        return total + Math.max(0, pagesRead);
      }, 0);
      
      // Calculate current reading streak
      const currentStreak = calculateReadingStreak(localSessions);
      
      const stats = {
        totalBooksRead: completedBooks.length,
        totalPagesRead: Math.max(totalPagesRead, completedBooks.length * 200), // Minimum estimate
        totalReadingTime,
        currentStreak
      };
      
      console.log('📊 Calculated stats:', stats);
        // Update public stats in GunJS
      const result = await gunService.updatePublicStats(stats);
      if (result.success) {
        console.log('✅ Public stats updated successfully');
        
        // Wait a moment for the GunJS update to propagate, then dispatch event to refresh leaderboard
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('publicStatsUpdated', { 
            detail: { userId: user?.id, stats } 
          }));
        }, 1000);
      } else {
        console.error('❌ Failed to update public stats:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating public stats:', error);
    }
  };

  // Helper function to calculate reading streak
  const calculateReadingStreak = (sessions: any[]) => {
    if (!sessions.length) return 0;
    
    // Sort sessions by date
    const sortedSessions = sessions
      .map(session => new Date(session.startTime).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if user read today or yesterday
    if (sortedSessions[0] === today || sortedSessions[0] === yesterday) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedSessions.length; i++) {
        const currentDate = new Date(sortedSessions[i]);
        const previousDate = new Date(sortedSessions[i - 1]);
        const diffTime = previousDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };
  const removeBook = async (bookKey: string) => {
    // Remove book from books list
    const updatedBooks = books.filter(book => book.key !== bookKey);
    setBooks(updatedBooks);
    await syncedStorage.saveBooks(updatedBooks);
    
    // Remove related sessions and notes
    const allSessions = await syncedStorage.getReadingSessions();
    const allNotes = await syncedStorage.getNotes();
    
    const updatedSessions = allSessions.filter(session => session.bookId !== bookKey);
    const updatedNotes = allNotes.filter(note => note.bookId !== bookKey);
    
    await syncedStorage.saveReadingSessions(updatedSessions);
    await syncedStorage.saveNotes(updatedNotes);
    
    // Clear current book if it's the one being removed
    if (currentBook && currentBook.key === bookKey) {
      setCurrentBookState(null);
      await syncedStorage.setCurrentBook(null);
    }
    
    // Force stats update when removing books as it affects counters
    await forceStatsUpdate();
  };

  const setActiveBook = async (book: Book | null) => {
    setCurrentBookState(book);
    await syncedStorage.setCurrentBook(book);
  };
  const addSession = async (session: ReadingSession) => {
    const allSessions = await syncedStorage.getReadingSessions();
    const existingIndex = allSessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = session;
    } else {
      allSessions.push(session);
    }
      await syncedStorage.saveReadingSessions(allSessions);
    
    if (currentBook && session.bookId === currentBook.key) {
      setSessions(allSessions.filter(s => s.bookId === currentBook.key));
    }
    
    // Force stats update when adding sessions as they may complete books
    await forceStatsUpdate();
    // Publish reading session activity if it's a substantial session (15+ minutes)
    if (session.duration && session.duration >= 15) {
      try {
        const book = books.find(b => b.key === session.bookId);
        const pagesRead = session.endPage && session.startPage ? session.endPage - session.startPage : 0;
        
        await gunService.publishActivity({
          type: 'reading_session',
          title: 'Had a reading session',
          description: `Read for ${session.duration} minutes${book ? ` in "${book.title}"` : ''}`,
          bookTitle: book?.title,
          bookCover: book?.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` : undefined,
          metadata: {
            duration: session.duration,
            pagesRead: Math.max(0, pagesRead)
          }
        });
        console.log('📖 Published reading session activity:', session.duration, 'minutes');

        // Update public stats after significant reading sessions
        await updatePublicStatsAfterBookCompletion();
      } catch (err) {
        console.error('Error publishing reading session activity:', err);
      }
    }
  };

  const addNote = async (note: ReadingNote) => {
    const allNotes = await syncedStorage.getNotes();
    const updatedNotes = [...allNotes, note];
    await syncedStorage.saveNotes(updatedNotes);
    
    if (currentBook && note.bookId === currentBook.key) {
      setNotes(updatedNotes.filter(n => n.bookId === currentBook.key));
    }
  };

  const updateNote = async (note: ReadingNote) => {
    const allNotes = await syncedStorage.getNotes();
    const updatedNotes = allNotes.map(n => n.id === note.id ? note : n);
    await syncedStorage.saveNotes(updatedNotes);
    
    if (currentBook && note.bookId === currentBook.key) {
      setNotes(updatedNotes.filter(n => n.bookId === currentBook.key));
    }
  };

  const deleteNote = async (noteId: string) => {
    const allNotes = await syncedStorage.getNotes();
    const updatedNotes = allNotes.filter(n => n.id !== noteId);
    await syncedStorage.saveNotes(updatedNotes);
    
    if (currentBook) {
      setNotes(updatedNotes.filter(n => n.bookId === currentBook.key));
    }
  };

  // Update public stats for leaderboard
  const updatePublicStats = async () => {
    try {
      const completedBooks = books.filter(book => book.category === 'completed');
      
      // Calculate total reading time (in minutes)
      const totalReadingTime = sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      // Calculate total pages read from sessions
      const totalPagesRead = sessions.reduce((total: number, session: any) => {
        const pagesRead = (session.endPage || 0) - (session.startPage || 0);
        return total + Math.max(0, pagesRead);
      }, 0);
      
      // Calculate current reading streak
      const calculateReadingStreak = (sessions: any[]) => {
        if (!sessions.length) return 0;
        
        const sortedSessions = sessions
          .map(session => new Date(session.startTime).toDateString())
          .filter((date, index, arr) => arr.indexOf(date) === index)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        let streak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (sortedSessions[0] === today || sortedSessions[0] === yesterday) {
          streak = 1;
          
          for (let i = 1; i < sortedSessions.length; i++) {
            const currentDate = new Date(sortedSessions[i]);
            const previousDate = new Date(sortedSessions[i - 1]);
            const diffTime = previousDate.getTime() - currentDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
        
        return streak;
      };
      
      const currentStreak = calculateReadingStreak(sessions);
      
      const stats = {
        totalBooksRead: completedBooks.length,
        totalPagesRead: Math.max(totalPagesRead, completedBooks.length * 200),
        totalReadingTime,
        currentStreak
      };
      
      // Update public stats in GunJS
      await gunService.updatePublicStats(stats);
    } catch (err) {
      console.error('Error updating public stats:', err);
    }
  };

  // Update public stats whenever books or sessions change
  useEffect(() => {
    if (books.length > 0 || sessions.length > 0) {
      updatePublicStats();
    }
  }, [books, sessions]);

  const value: BookContextProps = {
    books,
    currentBook,
    sessions,
    notes,
    addBook,
    removeBook,
    setActiveBook,
    addSession,
    addNote,
    updateNote,
    deleteNote,    updatePublicStatsAfterBookCompletion // Export this function for manual calls
  };

  // Debug: Expose updatePublicStatsAfterBookCompletion to window for manual testing
  React.useEffect(() => {
    // @ts-ignore
    window.debugUpdateStats = updatePublicStatsAfterBookCompletion;
  }, []);

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};