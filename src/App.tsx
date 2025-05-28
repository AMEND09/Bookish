
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookProvider } from './context/BookContext';
import { PetProvider } from './context/PetContext';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReadingSessionPage from './pages/ReadingSessionPage';
import LibraryPage from './pages/LibraryPage';
import StatsPage from './pages/StatsPage';
import NotesPage from './pages/NotesPage';
import AddNotePage from './pages/AddNotePage';
import PetPage from './pages/PetPage';

function App() {
  return (
    <PetProvider>
      <BookProvider>
        <Router basename="/Bookish">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/book" element={<BookDetailsPage />} />
            <Route path="/reading" element={<ReadingSessionPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/add" element={<AddNotePage />} />
            <Route path="/pet" element={<PetPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </Router>
      </BookProvider>
    </PetProvider>
  );
}

export default App;