import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useTheme } from '../context/ThemeContext';
import { v4 as uuidv4 } from 'uuid';
import { ReadingNote } from '../types';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';

const AddNotePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books, currentBook, addNote, notes, updateNote } = useBooks();
  const { theme } = useTheme();
  const modal = useConfirmationModal();
  const editId = searchParams.get('edit');
  
  const [selectedBookId, setSelectedBookId] = useState<string>(currentBook?.key || '');
  const [content, setContent] = useState('');
  const [page, setPage] = useState('');
  const [chapter, setChapter] = useState('');

  useEffect(() => {
    if (editId) {
      const noteToEdit = notes.find((note: ReadingNote) => note.id === editId);
      if (noteToEdit) {
        setSelectedBookId(noteToEdit.bookId);
        setContent(noteToEdit.content);
        setPage(noteToEdit.page?.toString() || '');
        setChapter(noteToEdit.chapter || '');
      }
    }
  }, [editId, notes]);

  const handleSave = () => {
    if (!content.trim()) {
      modal.showAlert(
        'Content Required',
        'Please add some content to your note before saving.',
        'alert'
      );
      return;
    }

    const note: ReadingNote = {
      id: editId || uuidv4(),
      bookId: selectedBookId,
      content: content.trim(),
      page: page ? parseInt(page) : undefined,
      chapter: chapter.trim() || undefined,
      createdAt: editId ? notes.find((n: ReadingNote) => n.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editId && updateNote) {
      // Update existing note
      updateNote(note);
    } else {
      // Add new note
      addNote(note);
    }

    modal.showAlert(
      'Note Saved',
      'Your note has been saved successfully!',
      'success'
    );
    
    setTimeout(() => {
      navigate('/notes');
    }, 1500);
  };

  const handleBackPress = () => {
    if (content.trim() || chapter.trim() || page.trim()) {
      modal.showConfirm(
        'Discard Note',
        'You have unsaved changes. Are you sure you want to go back?',
        () => {
          navigate(-1);
        },
        {
          confirmText: 'Discard',
          cancelText: 'Keep Editing'
        }
      );
    } else {
      navigate(-1);
    }
  };
  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <header className="p-4 border-b" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackPress}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surface }}            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </button>
            <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>
              {editId ? 'Edit Note' : 'Add Note'}
            </h1>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#8B7355] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Book Selection */}        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
            Select Book
          </label>
          <div className="relative">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full p-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355] appearance-none"
              style={{ 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border, 
                color: theme.colors.textPrimary 
              }}
            >
              <option value="">Choose a book...</option>
              {books.map((book) => (
                <option key={book.key} value={book.key}>
                  {book.title}
                </option>
              ))}
            </select>
            <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: theme.colors.textSecondary }} />
          </div>
        </div>        {/* Location Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              Chapter (optional)
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g., Chapter 5"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              style={{ 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border, 
                color: theme.colors.textPrimary 
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              Page (optional)
            </label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="Page number"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              style={{ 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border, 
                color: theme.colors.textPrimary 
              }}
            />
          </div>
        </div>        {/* Note Content */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
            Your Note
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts, insights, or reflections about this part of the book..."
            rows={8}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355] resize-none"
            style={{ 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.border, 
              color: theme.colors.textPrimary 
            }}
          />
          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
            {content.length}/500 characters
          </p>
        </div>

        {/* Tips */}
        <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.surface }}>
          <h3 className="font-medium mb-2" style={{ color: theme.colors.textPrimary }}>💡 Note-taking tips:</h3>
          <ul className="text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
            <li>• Write down key insights or quotes that resonate with you</li>
            <li>• Note questions or thoughts the reading sparked</li>
            <li>• Record connections to other books or personal experiences</li>
            <li>• Include your emotional reactions or reflections</li>
          </ul>
        </div>
      </main>

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

export default AddNotePage;