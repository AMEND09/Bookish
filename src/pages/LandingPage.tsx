import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Timer, PenLine, Trophy, Heart, Sparkles, ArrowRight, Star, Users, Target } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Track Your Reading",
      description: "Organize your books into 'Want to Read', 'Currently Reading', and 'Completed' categories with beautiful progress tracking."
    },
    {
      icon: Timer,
      title: "Reading Sessions",
      description: "Time your reading sessions and watch your progress grow. See exactly how much time you've invested in each book."
    },
    {
      icon: PenLine,
      title: "Take Notes",
      description: "Capture your thoughts, favorite quotes, and insights as you read. Never lose track of those brilliant moments."
    },
    {
      icon: Heart,
      title: "Virtual Pet Companion",
      description: "Care for your adorable reading companion that grows and evolves as you complete books and reading sessions."
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock achievements and watch your reading streaks grow. Gamify your reading journey and stay motivated."
    },
    {
      icon: Sparkles,
      title: "Beautiful Interface",
      description: "Enjoy a warm, book-inspired design that makes reading tracking a delightful experience every day."
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Build Better Habits",
      description: "Turn reading into a consistent, rewarding habit with gentle gamification and progress tracking."
    },
    {
      icon: Star,
      title: "Stay Motivated",
      description: "Your virtual pet and achievement system keep you engaged and excited about your reading journey."
    },
    {
      icon: Users,
      title: "Mindful Reading",
      description: "Take notes and track your thoughts to engage more deeply with every book you read."
    }
  ];
  return (
    <div className="min-h-screen bg-[#F7F5F3] max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#8B7355] rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-[#3A3A3A] mb-2">Bookish</h1>
            <p className="text-lg lg:text-xl text-[#8B7355] font-medium">Your Reading Companion</p>
          </div>

          {/* Hero Message */}
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl lg:text-3xl font-medium text-[#3A3A3A] mb-4 leading-tight">
              Transform Your Reading Journey with a Delightful Digital Companion
            </h2>
            <p className="text-[#8B7355] leading-relaxed mb-6 text-base lg:text-lg">
              Track your books, time your sessions, take meaningful notes, and care for your virtual pet 
              as you build the reading habit you've always wanted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-[#8B7355] text-white px-8 py-4 rounded-xl font-medium text-lg flex items-center gap-2 justify-center hover:bg-[#7A6349] transition-colors shadow-lg"
              >
                Start Reading Today
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/search')}
                className="bg-transparent border-2 border-[#8B7355] text-[#8B7355] px-8 py-4 rounded-xl font-medium text-lg hover:bg-[#8B7355] hover:text-white transition-colors"
              >
                Browse Books
              </button>
            </div>
          </div>

          {/* Mock App Preview */}
          <div className="relative mb-12 max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-[#F0EDE8]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-[#F0EDE8] rounded w-3/4"></div>
                <div className="flex gap-3">
                  <div className="w-12 h-16 bg-[#8B7355] rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#F0EDE8] rounded w-full"></div>
                    <div className="h-2 bg-[#F0EDE8] rounded w-2/3"></div>
                    <div className="h-2 bg-[#E59554] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-12 h-16 bg-[#D2691E] rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#F0EDE8] rounded w-full"></div>
                    <div className="h-2 bg-[#F0EDE8] rounded w-2/3"></div>
                    <div className="h-2 bg-[#E59554] rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-serif text-2xl lg:text-3xl font-medium text-[#3A3A3A] mb-3">Everything You Need</h3>
          <p className="text-[#8B7355] text-base lg:text-lg">Powerful features designed to enhance your reading experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#F0EDE8] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-[#8B7355]" />
                </div>
                <h4 className="font-serif font-medium text-[#3A3A3A] mb-3 text-lg">{feature.title}</h4>
                <p className="text-sm text-[#8B7355] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-[#F0EDE8] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl lg:text-3xl font-medium text-[#3A3A3A] mb-3">Why Choose Bookish?</h3>
            <p className="text-[#8B7355] text-base lg:text-lg">Join thousands of readers who've transformed their reading habits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-[#8B7355] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-serif font-medium text-[#3A3A3A] mb-3 text-lg">{benefit.title}</h4>
                <p className="text-sm text-[#8B7355] leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 lg:px-8">
        <div className="bg-gradient-to-r from-[#8B7355] to-[#D2691E] rounded-2xl p-8 lg:p-12 text-white text-center">
          <h3 className="font-serif text-xl lg:text-2xl font-medium mb-8">Join the Reading Revolution</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-1">10K+</div>
              <div className="text-sm opacity-90">Books Tracked</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-1">5K+</div>
              <div className="text-sm opacity-90">Happy Readers</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-1">50K+</div>
              <div className="text-sm opacity-90">Reading Hours</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-1">25K+</div>
              <div className="text-sm opacity-90">Notes Written</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-white text-[#8B7355] px-8 py-4 rounded-xl font-medium flex items-center gap-2 mx-auto hover:bg-gray-50 transition-colors text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#3A3A3A] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center lg:px-8">
          <h3 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-4">Ready to Begin?</h3>
          <p className="text-gray-300 mb-8 leading-relaxed text-base lg:text-lg max-w-2xl mx-auto">
            Start your reading journey today. Search for your first book, 
            meet your virtual companion, and begin building the reading habit that will last a lifetime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-[#D2691E] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#B8541A] transition-colors"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/library')}
              className="flex-1 bg-transparent border-2 border-gray-500 text-gray-300 px-6 py-4 rounded-xl font-medium hover:border-gray-400 hover:text-gray-200 transition-colors"
            >
              View Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;