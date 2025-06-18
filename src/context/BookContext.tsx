import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, ReadingSession, ReadingNote } from '../types';
import syncedStorage from '../services/syncedStorage';
import { getCachedBookDetails } from '../services/storage';
import gunService from '../services/gun';

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
  }, [currentBook]);  const addBook = async (book: Book) => {
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
    
    // Save to both synced storage and local storage immediately
    await syncedStorage.saveBooks(updatedBooks);
    
    // Force immediate localStorage update for stats calculation
    localStorage.setItem('bookish_books', JSON.stringify(updatedBooks));
    
    // Publish activity if book was just completed
    if (!wasCompleted && isNowCompleted) {
      try {
        console.log('📚 Book marked as completed, triggering all sync mechanisms...');
        
        // 1. Publish activity
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
        console.log('✅ Published book completion activity:', book.title);

        // 2. Wait a moment for localStorage to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Force sync local stats to GunJS
        const syncSuccess = await forceSyncLocalStatsToGunJS();
        if (!syncSuccess) {
          // Fallback to regular stats update
          await updatePublicStatsAfterBookCompletion();
        }
        
        console.log('✅ All book completion sync mechanisms completed');
      } catch (err) {
        console.error('❌ Error in book completion sync:', err);
        // Fallback: try regular stats update
        try {
          await updatePublicStatsAfterBookCompletion();
        } catch (fallbackErr) {
          console.error('❌ Fallback stats update also failed:', fallbackErr);
        }
      }
    }
  };// Function to recalculate and update public stats
  const updatePublicStatsAfterBookCompletion = async () => {
    try {
      console.log('📊 Updating public stats after book completion...');
      
      // Get fresh data from local storage first (most up-to-date)
      const localBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const localSessions = JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]');
      
      console.log('📊 Local books data:', localBooks.length, 'books');
      console.log('📊 Local sessions data:', localSessions.length, 'sessions');
      
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
      
      // Ensure we have minimum reasonable stats
      const stats = {
        totalBooksRead: Math.max(completedBooks.length, 0),
        totalPagesRead: Math.max(totalPagesRead, completedBooks.length * 200), // Minimum estimate
        totalReadingTime: Math.max(totalReadingTime, 0),
        currentStreak: Math.max(currentStreak, 0)
      };
      
      console.log('📊 Final calculated stats:', stats);
      
      // Ensure user is authenticated before updating
      const isAuthenticated = await gunService.getCurrentUser();
      if (!isAuthenticated.success) {
        console.error('❌ User not authenticated, cannot update public stats');
        return;
      }
      
      // Update public stats in GunJS with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        const result = await gunService.updatePublicStats(stats);
        if (result.success) {
          console.log('✅ Public stats updated successfully');
          break;
        } else {
          retryCount++;
          console.error(`❌ Failed to update public stats (attempt ${retryCount}/${maxRetries}):`, result.error);
          
          if (retryCount < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
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
  // Debug function to test stats calculation and update
  const debugStatsAndUpdate = async () => {
    console.log('🔍 DEBUG: Starting comprehensive stats debug...');
    
    // Check all data sources
    const localBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
    const localSessions = JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]');
    const syncedBooks = await syncedStorage.getBooks();
    const syncedSessions = await syncedStorage.getReadingSessions();
    
    console.log('📚 Local books:', localBooks.length, localBooks);
    console.log('📖 Local sessions:', localSessions.length, localSessions);
    console.log('🔄 Synced books:', syncedBooks.length, syncedBooks);
    console.log('🔄 Synced sessions:', syncedSessions.length, syncedSessions);
    
    // Check authentication status
    const authStatus = await gunService.getCurrentUser();
    console.log('🔐 Auth status:', authStatus);
    
    // Test stats calculation
    await updatePublicStatsAfterBookCompletion();
    
    // Test leaderboard fetch
    console.log('📊 Testing leaderboard fetch...');
    const allStats = await gunService.getAllPublicStats();
    console.log('📊 All public stats:', allStats);
    
    return {
      localBooks: localBooks.length,
      localSessions: localSessions.length,
      syncedBooks: syncedBooks.length,
      syncedSessions: syncedSessions.length,
      authStatus,
      allStats
    };
  };
  // Test function to simulate book completion
  const testBookCompletion = async () => {
    console.log('🧪 Testing book completion flow...');
    
    const testBook = {
      key: `test-book-${Date.now()}`,
      title: `Test Book ${Date.now()}`,
      author_name: ['Test Author'],
      category: 'completed' as const,
      status: 'read' as const,
      cover_i: undefined,
      number_of_pages_median: 250,
      progress: 100,
      dateCompleted: new Date().toISOString()
    };
    
    try {
      // Add the test book using the same method as the real flow
      await addBook(testBook);
      console.log('✅ Test book added successfully');
      
      // Force stats update
      await updatePublicStatsAfterBookCompletion();
      console.log('✅ Stats updated after test book completion');
      
      return testBook;
    } catch (error) {
      console.error('❌ Error in test book completion:', error);
      throw error;
    }
  };

  // Force synchronization of local stats to GunJS
  const forceSyncLocalStatsToGunJS = async () => {
    try {
      console.log('🔄 Force syncing local stats to GunJS...');
      
      // Get the most recent local data
      const localBooks = JSON.parse(localStorage.getItem('bookish_books') || '[]');
      const localSessions = JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]');
      
      // Recalculate stats
      const completedBooks = localBooks.filter((book: any) => book.category === 'completed');
      const totalReadingTime = localSessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      const totalPagesRead = localSessions.reduce((total: number, session: any) => {
        const pagesRead = (session.endPage || 0) - (session.startPage || 0);
        return total + Math.max(0, pagesRead);
      }, 0);
      const currentStreak = calculateReadingStreak(localSessions);
      
      const stats = {
        totalBooksRead: completedBooks.length,
        totalPagesRead: Math.max(totalPagesRead, completedBooks.length * 200),
        totalReadingTime,
        currentStreak
      };
      
      console.log('🔄 Syncing stats to GunJS:', stats);
      
      // Force update to GunJS with retries
      for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await gunService.updatePublicStats(stats);
        if (result.success) {
          console.log('✅ Stats successfully synced to GunJS');
          return true;
        } else {
          console.warn(`⚠️ Sync attempt ${attempt} failed:`, result.error);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      console.error('❌ Failed to sync stats to GunJS after 3 attempts');
      return false;
    } catch (error) {
      console.error('❌ Error in force sync:', error);
      return false;
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

  // Debug: Expose debugging functions to window for manual testing
  React.useEffect(() => {
    // @ts-ignore
    window.debugUpdateStats = updatePublicStatsAfterBookCompletion;
    // @ts-ignore
    window.debugStatsAndUpdate = debugStatsAndUpdate;    // @ts-ignore
    window.debugTestBookCompletion = testBookCompletion;
    // @ts-ignore
    window.debugForceSyncStats = forceSyncLocalStatsToGunJS;
    // @ts-ignore
    window.debugVerifyStatsSync = async () => {
      const result = await gunService.verifyStatsSync();
      console.log('📊 Stats sync verification:', result);
      return result;
    };
    // @ts-ignore
    window.debugForceStatsUpdate = async () => {
      console.log('🔧 Force updating stats...');
      await updatePublicStatsAfterBookCompletion();
      console.log('✅ Force update completed');
    };
  }, []);

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};