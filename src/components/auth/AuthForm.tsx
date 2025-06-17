import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, error, clearError, continueAsGuest } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      let result;
      if (isSignUp) {
        result = await signUp(username.trim(), password);
        if (result.success) {
          // Show success message and switch to sign in
          setIsSignUp(false);
          setPassword('');
          alert('Account created successfully! Please sign in.');
        }
      } else {
        result = await signIn(username.trim(), password);
        if (result.success && onClose) {
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    clearError();
  };

  const handleGuestLogin = () => {
    continueAsGuest();
    if (onClose) {
      onClose();
    }
  };

  return (    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-[#F0EDE8]">
      <div className="text-center mb-8">
        <div className="bg-[#F0EDE8] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-[#8B7355]" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#3A3A3A] mb-2">
          {isSignUp ? 'Join Bookish' : 'Welcome Back'}
        </h2>
        <p className="text-[#8B7355]">
          {isSignUp 
            ? 'Start your reading journey with your virtual pet companion'
            : 'Continue your reading adventure with your book buddy'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[#3A3A3A] mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border-2 border-[#F0EDE8] rounded-xl focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] transition-colors bg-[#F7F5F3] text-[#3A3A3A]"
              placeholder="Enter your username"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#3A3A3A] mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]" />            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-12 py-3 w-full border-2 border-[#F0EDE8] rounded-xl focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] transition-colors bg-[#F7F5F3] text-[#3A3A3A]"
              placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
              minLength={isSignUp ? 8 : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] hover:text-[#3A3A3A] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isSignUp && (
            <p className="text-sm text-[#8B7355] mt-1">
              Password must be at least 8 characters long
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#8B7355] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#6B5B45] focus:ring-2 focus:ring-[#8B7355] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full bg-gray-100 text-[#8B7355] py-3 px-4 rounded-xl font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 border border-gray-200"
        >
          Continue as Guest
        </button>
          <p className="text-sm text-center text-[#8B7355] mt-2">
          Guest mode: Explore the app with local storage (data saved on this device only)
        </p>
      </form>      <div className="mt-6 text-center">
        <p className="text-[#8B7355]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-[#3A3A3A] hover:text-[#8B7355] font-medium transition-colors underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8B7355] hover:text-[#3A3A3A] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AuthForm;
