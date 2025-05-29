import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, ReadingSession, ReadingNote } from '../types';
import { getBooks, saveBook, getCurrentBook, setCurrentBook, getSessionsByBook, saveSession, getNotesByBook, saveNote, removeNote, removeBook as removeBookFromStorage, getCachedBookDetails } from '../services/storage';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  sessions: ReadingSession[];
  notes: ReadingNote[];
  addBook: (book: Book) => void;
  removeBook: (bookKey: string) => void;
  setActiveBook: (book: Book | null) => void;
  addSession: (session: ReadingSession) => void;
  addNote: (note: ReadingNote) => void;
  updateNote: (note: ReadingNote) => void;
  deleteNote: (noteId: string) => void;
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

  // Initialize from local storage
  useEffect(() => {
    const loadedBooks = getBooks();
    
    // Enhance books with cached details for offline support
    const enhancedBooks = loadedBooks.map(book => {
      const cachedDetails = getCachedBookDetails(book.key);
      return cachedDetails ? { ...book, ...cachedDetails } : book;
    });
    
    setBooks(enhancedBooks);
    setCurrentBookState(getCurrentBook());
  }, []);

  // Update sessions and notes when current book changes
  useEffect(() => {
    if (currentBook) {
      setSessions(getSessionsByBook(currentBook.key));
      setNotes(getNotesByBook(currentBook.key));
    } else {
      setSessions([]);
      setNotes([]);
    }
  }, [currentBook]);

  const addBook = (book: Book) => {
    saveBook(book);
    setBooks(prevBooks => {
      const existingIndex = prevBooks.findIndex(b => b.key === book.key);
      if (existingIndex >= 0) {
        const updatedBooks = [...prevBooks];
        updatedBooks[existingIndex] = book;
        return updatedBooks;
      } else {
        return [...prevBooks, book];
      }
    });
  };

  const removeBook = (bookKey: string) => {
    // Remove from storage (this also removes from cache)
    removeBookFromStorage(bookKey);
    
    // Update state
    setBooks(prevBooks => prevBooks.filter(book => book.key !== bookKey));
    
    // If this was the current book, clear it
    if (currentBook && currentBook.key === bookKey) {
      setActiveBook(null);
    }
  };

  const setActiveBook = (book: Book | null) => {
    setCurrentBook(book);
    setCurrentBookState(book);
  };

  const addSession = (session: ReadingSession) => {
    saveSession(session);
    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        const updatedSessions = [...prevSessions];
        updatedSessions[existingIndex] = session;
        return updatedSessions;
      } else {
        return [...prevSessions, session];
      }
    });
  };

  const addNote = (note: ReadingNote) => {
    saveNote(note);
    setNotes(prevNotes => [...prevNotes, note]);
  };

  const updateNote = (note: ReadingNote) => {
    saveNote(note);
    setNotes(prevNotes => 
      prevNotes.map(n => n.id === note.id ? note : n)
    );
  };

  const deleteNote = (noteId: string) => {
    removeNote(noteId);
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
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