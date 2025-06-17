/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          DEFAULT: '#D2691E',
          light: '#E89556',
          dark: '#B8571A',
        },
        secondary: {
          DEFAULT: '#8B7355',
          light: '#A68B6B',
          dark: '#6B5A47',
        },
        background: '#F7F5F3',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FEFEFE',
          secondary: '#F5F5F5',
        },
        text: {
          primary: '#3A3A3A',
          secondary: '#8B7355',
          tertiary: '#A0A0A0',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E8E3DD',
          light: '#F0EDE8',
          dark: '#D4C4B0',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        category: {
          'want-to-read': '#FEF3C7',
          'want-to-read-text': '#D97706',
          'currently-reading': '#DBEAFE',
          'currently-reading-text': '#2563EB',
          'completed': '#D1FAE5',
          'completed-text': '#059669',
        },
      },
      // Dark mode color overrides
      backgroundColor: {
        'dark-primary': '#E89556',
        'dark-background': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-surface-elevated': '#2A2A2A',
        'dark-surface-secondary': '#252525',
      },
      textColor: {
        'dark-primary': '#FFFFFF',
        'dark-secondary': '#B0B0B0',
        'dark-tertiary': '#808080',
        'dark-inverse': '#121212',
      },
      borderColor: {
        'dark-default': '#3A3A3A',
        'dark-light': '#2A2A2A',
        'dark-dark': '#4A4A4A',
      },
    },
  },
  plugins: [],
};
