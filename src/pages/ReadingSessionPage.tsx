import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Check, X, Trophy } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import { useReadingTimer } from '../hooks/useReadingTimer';
import { v4 as uuidv4 } from 'uuid';
import { ReadingNote } from '../types';
import { getBookCoverUrl } from '../services/api';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import { useTheme } from '../context/ThemeContext';

const ReadingSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBook, addSession, addNote } = useBooks();
  const { updatePetFromReading } = usePet();
  const { theme } = useTheme();
  const modal = useConfirmationModal();
  
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteChapter, setNoteChapter] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize timer - remove startPage dependency to avoid circular updates
  const { isActive, elapsedTime, startTimer, pauseTimer, stopTimer, resetTimer } = 
    useReadingTimer({ 
      bookId: currentBook?.key || '', 
      startPage: 1 // Use a default value
    });
  
  // Initialize start page from latest session or active timer
  useEffect(() => {
    if (currentBook && !isInitialized) {
      // Check if there's an active timer first
      const activeTimer = localStorage.getItem('bookish_active_timer');
      if (activeTimer) {
        try {
          const parsed = JSON.parse(activeTimer);
          if (parsed.bookId === currentBook.key) {
            setStartPage(parsed.startPage);
            setEndPage(parsed.startPage);
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.error('Error parsing active timer:', error);
        }
      }

      // If no active timer, start from the last read page
      const latestSessions = JSON.parse(localStorage.getItem('bookish_reading_sessions') || '[]');
      const bookSessions = latestSessions.filter((s: any) => s.bookId === currentBook.key);
      
      if (bookSessions.length > 0) {
        // Sort by most recent
        bookSessions.sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        
        const lastPage = bookSessions[0].endPage || bookSessions[0].startPage;
        setStartPage(lastPage);
        setEndPage(lastPage);
      }
      setIsInitialized(true);
    }
  }, [currentBook, isInitialized]);

  // Warn user when leaving page with active timer
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = 'You have an active reading session. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);
  
  if (!currentBook) {
    navigate('/');
    return null;
  }
  
  const handleFinishSession = () => {
    try {
      // Validate inputs
      if (!currentBook) {
        modal.showAlert('Error', 'No book selected', 'alert');
        return;
      }

      if (endPage < startPage) {
        modal.showAlert(
          'Invalid Page Range',
          'End page cannot be less than start page',
          'alert'
        );
        return;
      }

      if (elapsedTime <= 0) {
        modal.showAlert(
          'No Time Recorded',
          'Please start the timer to record reading time',
          'alert'
        );
        return;
      }
      
      const session = stopTimer(endPage);
      if (!session) {
        throw new Error('Failed to create session');
      }
      
      addSession(session);
      
      // Feed the pet based on reading time
      if (session.duration) {
        updatePetFromReading(session.duration);
      }
      
      // If there's a note, save it
      if (noteContent.trim()) {
        const note: ReadingNote = {
          id: uuidv4(),
          bookId: currentBook.key,
          page: endPage,
          chapter: noteChapter.trim() || undefined,
          content: noteContent.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        addNote(note);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error finishing session:', error);
      modal.showAlert(
        'Error',
        'Failed to save reading session. Please try again.',
        'alert'
      );
    }
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get page limits for input validation
  const maxPages = currentBook.number_of_pages_median || 9999;
  const hasKnownPageCount = currentBook.number_of_pages_median && currentBook.number_of_pages_median > 0;
  
  // Check if user has reached the last page
  const hasReachedLastPage = () => {
    const totalPages = currentBook?.number_of_pages_median || 0;
    return totalPages > 0 && endPage >= totalPages;
  };

  // Handle end page change and check for completion
  const handleEndPageChange = (newEndPage: number) => {
    // Validate the new end page
    const pageNum = Math.max(startPage, Math.min(newEndPage, maxPages));
    setEndPage(pageNum);
    
    // Check if user reached the last page
    if (currentBook?.number_of_pages_median && pageNum >= currentBook.number_of_pages_median) {
      setShowCompletionModal(true);
    }
  };

  const handleMarkAsFinished = () => {
    try {
      // Complete the reading session first
      const session = stopTimer(endPage);
      if (session) {
        addSession(session);
        
        // Feed the pet based on reading time
        if (session.duration) {
          updatePetFromReading(session.duration);
        }
      }
      
      // Save note if exists
      if (noteContent.trim()) {
        const note: ReadingNote = {
          id: uuidv4(),
          bookId: currentBook.key,
          page: endPage,
          chapter: noteChapter.trim() || undefined,
          content: noteContent.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addNote(note);
      }
      
      // Mark book as completed
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
      
      // Clear as active book
      localStorage.removeItem('bookish_current_book');
      
      // Reward the pet for completing a book
      updatePetFromReading(session?.duration || 0, true); // Pass true for book completion
      
      modal.showAlert(
        'Congratulations!',
        '🎉 You\'ve completed the book and your pet gained bonus experience!',
        'success'
      );
      
      setTimeout(() => {
        navigate('/library');
      }, 2000);
    } catch (error) {
      console.error('Error marking book as finished:', error);
      modal.showAlert(
        'Error',
        'Failed to mark book as completed. Please try again.',
        'alert'
      );
    }
  };  return (
    <div className="max-w-md mx-auto min-h-screen pb-20" style={{ backgroundColor: theme.colors.background }}>
      <header className="p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: theme.colors.surface }}>
        <button
          onClick={() => {
            if (isActive || elapsedTime > 0) {
              modal.showConfirm(
                'Leave Reading Session',
                isActive 
                  ? 'Your timer is still running. The session will continue in the background if you leave.'
                  : 'You have an unsaved reading session. Do you want to save it or discard it?',
                () => {
                  if (!isActive && elapsedTime > 0) {
                    // Save the session before leaving
                    handleFinishSession();
                  } else {
                    navigate(-1);
                  }
                },
                {
                  confirmText: isActive ? 'Leave (Keep Timer)' : 'Save & Leave',
                  cancelText: 'Stay'
                }
              );
            } else {
              navigate(-1);
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
          style={{ 
            backgroundColor: theme.colors.borderLight,
            color: theme.colors.textSecondary
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="font-serif text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Reading Session</h1>
        
        {isActive && (
          <div className="ml-auto">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </header>      
      <main className="p-4">
        <div className="rounded-xl shadow-sm overflow-hidden mb-6" style={{ backgroundColor: theme.colors.surface }}>
          <div className="flex items-center p-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
            <div className="w-12 h-16 rounded overflow-hidden mr-3">
              {currentBook.cover_i ? (
                <img
                  src={getBookCoverUrl(currentBook.cover_i, 'S')}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: theme.colors.secondary }}></div>
              )}
            </div>
            
            <div>
              <h2 className="font-serif text-base font-medium line-clamp-1" style={{ color: theme.colors.textPrimary }}>
                {currentBook.title}
              </h2>
              
              {currentBook.author_name && currentBook.author_name.length > 0 && (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>by {currentBook.author_name[0]}</p>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: theme.colors.borderLight }}>
                <span className="font-serif text-2xl font-medium" style={{ color: theme.colors.textPrimary }}>
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <button
                onClick={isActive ? pauseTimer : startTimer}
                className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-md transition-colors hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
            </div>            
            <div className="flex gap-6 mb-4">
              <div className="flex-1">
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Start Page</label>
                <input
                  type="number"
                  value={startPage}
                  onChange={(e) => {
                    const newStartPage = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxPages));
                    setStartPage(newStartPage);
                    // Ensure end page is not less than start page
                    if (endPage < newStartPage) {
                      setEndPage(newStartPage);
                    }
                  }}
                  min="1"
                  max={maxPages}
                  className="w-full p-2 rounded-md"
                  style={{ 
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textPrimary
                  }}
                  disabled={isActive || elapsedTime > 0}
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>End Page</label>
                <input
                  type="number"
                  value={endPage}
                  onChange={(e) => handleEndPageChange(parseInt(e.target.value) || startPage)}
                  min={startPage}
                  max={maxPages}
                  className="w-full p-2 rounded-md"
                  style={{ 
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textPrimary
                  }}
                />
              </div>
            </div>
            
            {hasReachedLastPage() && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Congratulations!</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  You've reached the last page! Would you like to mark this book as completed?
                </p>
                <button
                  onClick={handleMarkAsFinished}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  Mark as Finished
                </button>
              </div>
            )}
            
            {!hasKnownPageCount && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📘 Page count unavailable for this book. You can still track your reading progress by entering the pages you read.
                </p>
              </div>
            )}            
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="w-full py-2 text-sm mb-2"
              style={{ color: theme.colors.primary }}
            >
              {showNoteForm ? 'Hide Note Form' : '+ Add a note about this session'}
            </button>
            
            {showNoteForm && (
              <div className="space-y-4 mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.colors.borderLight }}>
                <div>
                  <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Chapter (optional)</label>
                  <input
                    type="text"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    placeholder="e.g. Chapter 5"
                    className="w-full p-2 rounded-md"
                    style={{ 
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Note</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your thoughts about this reading session..."
                    rows={4}
                    className="w-full p-2 rounded-md resize-none"
                    style={{ 
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>      
      <div className="fixed bottom-0 left-0 right-0 p-4 flex gap-4 max-w-md mx-auto" style={{ 
        backgroundColor: theme.colors.surface, 
        borderTop: `1px solid ${theme.colors.border}` 
      }}>
        <button
          onClick={() => {
            modal.showConfirm(
              'Cancel Session',
              isActive 
                ? 'This will stop your timer and discard the session. Are you sure?'
                : 'Are you sure you want to cancel this session? All progress will be lost.',
              () => {
                resetTimer();
                navigate(-1);
              },
              {
                confirmText: 'Yes, Cancel',
                cancelText: 'Keep Reading'
              }
            );
          }}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:opacity-80"
          style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary
          }}
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        
        {hasReachedLastPage() ? (
          <button
            onClick={handleMarkAsFinished}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Mark as Finished
          </button>
        ) : (
          <button
            onClick={handleFinishSession}
            className="flex-1 py-3 px-4 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
            disabled={elapsedTime <= 0 || endPage < startPage}
          >
            <Check className="w-5 h-5" />
            Finish Session
          </button>
        )}
      </div>      {/* Book Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-6 w-full max-w-sm" style={{ backgroundColor: theme.colors.surface }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                Congratulations!
              </h3>
              
              <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
                You've reached the last page of "{currentBook.title}". Would you like to mark it as completed?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleMarkAsFinished}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  Yes, Mark as Completed
                </button>
                
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary
                  }}
                >
                  Continue Reading
                </button>
              </div>
            </div>
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

export default ReadingSessionPage;