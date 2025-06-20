import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookProvider } from './context/BookContext';
import { PetProvider } from './context/PetContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FriendsProvider } from './context/FriendsContext';
import AuthGuard from './components/auth/AuthGuard';

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
import PetShopPage from './pages/PetShopPage';
import MinigamesPage from './pages/MinigamesPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Components
import PetStatusMonitor from './components/pet/PetStatusMonitor';

const App: React.FC = () => {
  return (
    <>
      {/* Custom titlebar for PWA window controls overlay - desktop only */}
      <div className="app-titlebar hidden">
        <div className="app-titlebar-content">
          <div className="app-titlebar-icon">📚</div>
          <span>Bookish</span>
        </div>
      </div>      <AuthProvider>
        <ThemeProvider>
          <FriendsProvider>
            <PetProvider>
              <BookProvider>                <Router basename="/Bookish">
                  <AuthGuard>
                    <PetStatusMonitor />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/welcome" element={<LandingPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/library" element={<LibraryPage />} />
                      <Route path="/book" element={<BookDetailsPage />} />
                      <Route path="/reading" element={<ReadingSessionPage />} />
                      <Route path="/notes" element={<NotesPage />} />                      <Route path="/notes/add" element={<AddNotePage />} />
                      <Route path="/pet" element={<PetPage />} />
                      <Route path="/pet-shop" element={<PetShopPage />} />
                      <Route path="/minigames" element={<MinigamesPage />} />
                      <Route path="/stats" element={<StatsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/friends" element={<FriendsPage />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                    </Routes>                  </AuthGuard>
                </Router>
              </BookProvider>
            </PetProvider>
          </FriendsProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
};

export default App;