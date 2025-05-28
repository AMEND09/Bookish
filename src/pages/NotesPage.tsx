import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Calendar, Edit3, Trash2 } from 'lucide-react';
import { useBooks } from '../context/BookContext';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, books, deleteNote } = useBooks();

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
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
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3]">
      <header className="p-4 bg-[#F7F5F3] border-b border-[#E8E3DD]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
            </button>
            <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">My Notes</h1>
          </div>

          <button
            onClick={() => navigate('/notes/add')}
            className="w-8 h-8 rounded-full bg-[#8B7355] flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="p-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <Edit3 className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
            <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">No notes yet</h2>
            <p className="text-sm text-[#8B7355] mb-6">
              Start taking notes while reading to remember important thoughts and insights
            </p>
            <button
              onClick={() => navigate('/notes/add')}
              className="bg-[#8B7355] text-white px-6 py-3 rounded-xl font-medium"
            >
              Add Your First Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#8B7355]">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-[#8B7355]" />
                      <span className="text-sm font-medium text-[#3A3A3A] truncate">
                        {getBookTitle(note.bookId)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#8B7355]">
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
                  <p className="text-[#3A3A3A] leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotesPage;