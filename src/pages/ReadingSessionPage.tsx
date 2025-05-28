import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Check, X } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import { useReadingTimer } from '../hooks/useReadingTimer';
import { v4 as uuidv4 } from 'uuid';
import { ReadingNote } from '../types';
import { getBookCoverUrl } from '../services/api';

const ReadingSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBook, addSession, addNote } = useBooks();
  const { updatePetFromReading } = usePet();
  
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteChapter, setNoteChapter] = useState('');
  
  // Initialize timer
  const { isActive, elapsedTime, startTimer, pauseTimer, stopTimer, resetTimer } = 
    useReadingTimer({ 
      bookId: currentBook?.key || '', 
      startPage: startPage 
    });
  
  // Initialize start page from latest session
  useEffect(() => {
    if (currentBook) {
      // Start from the last read page if available
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
    }
  }, [currentBook]);
  
  if (!currentBook) {
    navigate('/');
    return null;
  }
  
  const handleFinishSession = () => {
    if (endPage < startPage) {
      alert('End page cannot be less than start page');
      return;
    }
    
    const session = stopTimer(endPage);
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
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3] pb-20">
      <header className="p-4 bg-[#F0EDE8] flex items-center gap-3 shadow-sm">
        <button
          onClick={() => {
            if (isActive) {
              if (confirm('Do you want to discard this reading session?')) {
                resetTimer();
                navigate(-1);
              }
            } else {
              navigate(-1);
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F5F3] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
        </button>
        
        <h1 className="font-serif text-lg font-medium text-[#3A3A3A]">Reading Session</h1>
      </header>
      
      <main className="p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center p-4 border-b border-[#F0EDE8]">
            <div className="w-12 h-16 rounded overflow-hidden mr-3">
              {currentBook.cover_i ? (
                <img
                  src={getBookCoverUrl(currentBook.cover_i, 'S')}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#8B7355]"></div>
              )}
            </div>
            
            <div>
              <h2 className="font-serif text-base font-medium text-[#3A3A3A] line-clamp-1">
                {currentBook.title}
              </h2>
              
              {currentBook.author_name && currentBook.author_name.length > 0 && (
                <p className="text-sm text-[#8B7355]">by {currentBook.author_name[0]}</p>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#F7F5F3] flex items-center justify-center shadow-inner">
                <span className="font-serif text-2xl font-medium text-[#3A3A3A]">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <button
                onClick={isActive ? pauseTimer : startTimer}
                className="w-16 h-16 rounded-full bg-[#D2691E] text-white flex items-center justify-center shadow-md hover:bg-[#A0522D] transition-colors"
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
            </div>
            
            <div className="flex gap-6 mb-4">
              <div className="flex-1">
                <label className="block text-sm text-[#8B7355] mb-2">Start Page</label>
                <input
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                  min="1"
                  max={currentBook.number_of_pages_median || 1000}
                  className="w-full p-2 border border-[#E5E5E5] rounded-md text-[#3A3A3A]"
                  disabled={isActive || elapsedTime > 0}
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-[#8B7355] mb-2">End Page</label>
                <input
                  type="number"
                  value={endPage}
                  onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                  min={startPage}
                  max={currentBook.number_of_pages_median || 1000}
                  className="w-full p-2 border border-[#E5E5E5] rounded-md text-[#3A3A3A]"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="w-full py-2 text-sm text-[#D2691E] mb-2"
            >
              {showNoteForm ? 'Hide Note Form' : '+ Add a note about this session'}
            </button>
            
            {showNoteForm && (
              <div className="space-y-4 mb-4 p-4 bg-[#F7F5F3] rounded-lg">
                <div>
                  <label className="block text-sm text-[#8B7355] mb-2">Chapter (optional)</label>
                  <input
                    type="text"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    placeholder="e.g. Chapter 5"
                    className="w-full p-2 border border-[#E5E5E5] rounded-md text-[#3A3A3A]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#8B7355] mb-2">Note</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your thoughts about this reading session..."
                    rows={4}
                    className="w-full p-2 border border-[#E5E5E5] rounded-md text-[#3A3A3A] resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F0EDE8] flex gap-4 max-w-md mx-auto">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to cancel this session?')) {
              resetTimer();
              navigate(-1);
            }
          }}
          className="flex-1 py-3 px-4 bg-white border border-[#E5E5E5] text-[#8B7355] rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        
        <button
          onClick={handleFinishSession}
          className="flex-1 py-3 px-4 bg-[#D2691E] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
          disabled={!elapsedTime}
        >
          <Check className="w-5 h-5" />
          Finish
        </button>
      </div>
    </div>
  );
};

export default ReadingSessionPage;