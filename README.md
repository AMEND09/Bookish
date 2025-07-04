# 📚 Bookish - Your Personal Reading Companion

> A Progressive Web App that makes reading more engaging with virtual pets, progress tracking, and comprehensive book management.

[![PWA](https://img.shields.io/badge/PWA-enabled-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.7.4-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Features

### 📖 Book Management
- **Search & Discover**: Find books using the OpenLibrary API
- **Personal Library**: Organize books by reading status (Want to Read, Currently Reading, Completed)
- **Reading Sessions**: Track your reading time and progress
- **Notes & Highlights**: Take notes while reading with timestamp tracking

### 🐾 Virtual Pet System
- **Reading Companion**: Your virtual pet grows as you read more
- **Mood System**: Pet's mood reflects your reading consistency
- **Interactive Features**: Feed, play, and care for your reading buddy
- **Achievements**: Unlock new pet features through reading milestones

### 📊 Progress Tracking
- **Reading Statistics**: Track pages read, time spent, books completed
- **Visual Progress**: Beautiful charts and progress bars
- **Reading Streaks**: Maintain daily reading habits
- **Goal Setting**: Set and achieve personal reading targets

### 🔄 Progressive Web App Features
- **Offline Support**: Read your library even without internet
- **Install on Device**: Add to home screen like a native app
- **Fast Loading**: Optimized caching for instant access
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Background Sync**: Sync data when connection is restored

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amend09/Bookish.git
   cd Bookish
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` to see the app in action!

### Building for Production

```bash
# Build the app
npm run build

# Preview the build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🛠 Technology Stack

### Frontend
- **React 18.2** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **React Router** - Client-side routing for single-page application
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Lucide React** - Beautiful and consistent icons

### Build Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting for consistent code quality
- **PostCSS** - CSS processing and optimization

### PWA Features
- **Service Worker** - Background processing and caching
- **Web App Manifest** - Native app-like installation
- **IndexedDB** - Client-side database for offline storage
- **Background Sync** - Sync data when connectivity returns

### APIs & Services
- **Google Books API** - Book search and metadata
- **Local Storage** - User preferences and settings
- **GitHub Pages** - Free hosting and deployment

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the Bookish website
2. Look for the install icon in the address bar
3. Click "Install Bookish" 
4. The app will be added to your applications

### Mobile (iOS Safari)
1. Open Bookish in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add" to install

### Mobile (Android Chrome)
1. Visit the Bookish website
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Tap "Add" to install

## 🎨 Design System

Bookish follows a comprehensive design system with:

- **Color Palette**: Warm, book-inspired colors with chocolate orange (#D2691E) as primary
- **Typography**: Clear, readable fonts optimized for long reading sessions
- **Spacing**: Consistent 8px grid system for perfect alignment
- **Components**: Reusable UI components with accessibility in mind

See [STYLEGUIDE.md](STYLEGUIDE.md) for complete design specifications.

## 📁 Project Structure

```
Bookish/
├── public/                 # Static assets
│   ├── icons/             # PWA icons (72x72 to 512x512)
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/          # React context providers
│   ├── pages/            # Application pages/screens
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── STYLEGUIDE.md         # Complete design system
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run predeploy    # Build before deploy
npm run deploy       # Deploy to GitHub Pages

# Legacy (React Scripts)
npm start           # Alternative dev server
npm test            # Run tests
npm run eject       # Eject from Create React App
```

### Environment Setup

1. **Development Environment**
   ```bash
   # Install recommended VS Code extensions
   # - ES7+ React/Redux/React-Native snippets
   # - Tailwind CSS IntelliSense
   # - TypeScript Importer
   ```

2. **API Configuration**
   ```bash
   # Google Books API (optional for enhanced features)
   # No API key required for basic functionality
   ```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: React and TypeScript rules configured
- **Prettier**: Code formatting (recommended)
- **Husky**: Git hooks for pre-commit checks (optional)

## 🔧 Customization

### Adding New Book Sources
```typescript
// src/utils/bookApi.ts
export const searchBooks = async (query: string) => {
  // Add your custom book API integration
};
```

### Extending Pet Features
```typescript
// src/context/PetContext.tsx
export const PetProvider = ({ children }) => {
  // Add new pet behaviors and interactions
};
```

### Custom Themes
```css
/* src/index.css */
:root {
  --primary-color: #D2691E;
  --background-color: #F7F5F3;
  /* Customize the color palette */
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run the tests**
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Add TypeScript types for new features
- Update documentation as needed
- Test your changes thoroughly
- Keep commits focused and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Books API** for comprehensive book data
- **Lucide Icons** for beautiful, consistent iconography
- **Tailwind CSS** for rapid UI development
- **React Community** for excellent documentation and tools
- **Open Source Contributors** who make projects like this possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/amend09/Bookish/issues)
- **Discussions**: [GitHub Discussions](https://github.com/amend09/Bookish/discussions)
- **Documentation**: [Project Wiki](https://github.com/amend09/Bookish/wiki)

## 🗺 Roadmap

### Version 2.0 (Planned)
- [ ] Social features (friend recommendations, reading groups)
- [ ] Advanced statistics and insights
- [ ] Book club integration
- [ ] Multiple pet types and customization
- [ ] Dark mode theme
- [ ] Export/import library data
- [ ] Reading challenges and competitions

### Version 2.1 (Future)
- [ ] AI-powered book recommendations
- [ ] Audiobook support
- [ ] Multi-language support
- [ ] Advanced note-taking with markdown
- [ ] Integration with e-readers
- [ ] Reading analytics dashboard

---

**Happy Reading! 📚✨**

*Made with ❤️ by the Bookish team*
