import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, ReadingSession, ReadingNote } from '../types';
import syncedStorage from '../services/syncedStorage';
import { getCachedBookDetails } from '../services/storage';

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
  }, [currentBook]);

  const addBook = async (book: Book) => {
    const updatedBooks = [...books];
    const existingIndex = updatedBooks.findIndex(b => b.key === book.key);
    
    if (existingIndex >= 0) {
      updatedBooks[existingIndex] = book;
    } else {
      updatedBooks.push(book);
    }
    
    setBooks(updatedBooks);
    await syncedStorage.saveBooks(updatedBooks);
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

  return (
    <BookContext.Provider
      value={{
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
        deleteNote
      }}
    >
      {children}
    </BookContext.Provider>
  );
};