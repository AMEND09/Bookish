import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Calendar, Edit3, Trash2 } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import { useTheme } from '../context/ThemeContext';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, books, deleteNote } = useBooks();
  const { theme } = useTheme();
  const modal = useConfirmationModal();

  const handleDeleteNote = (noteId: string) => {
    modal.showConfirm(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      () => {
        deleteNote(noteId);
      },
      {
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    );
  };

  const getBookTitle = (bookId: string) => {
    const book = books.find(b => b.key === bookId);
    return book ? book.title : 'Unknown Book';
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <header className="p-4" style={{ backgroundColor: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.borderLight }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </button>
            <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>My Notes</h1>
          </div>

          <button
            onClick={() => navigate('/notes/add')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.secondary }}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>      <main className="p-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <Edit3 className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <h2 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>No notes yet</h2>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Start taking notes while reading to remember important thoughts and insights
            </p>
            <button
              onClick={() => navigate('/notes/add')}
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              Add Your First Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>            {notes.map((note) => (
              <div key={note.id} className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                      <span className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                        {getBookTitle(note.bookId)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.textSecondary }}>
                      {note.chapter && (
                        <span>Chapter: {note.chapter}</span>
                      )}
                      {note.page && (
                        <span>Page {note.page}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ color: theme.colors.textPrimary }}>
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default NotesPage;