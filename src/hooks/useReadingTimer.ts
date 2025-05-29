import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReadingSession } from '../types';

interface UseReadingTimerProps {
  bookId: string;
  startPage: number;
}

interface TimerState {
  sessionId: string | null;
  startTime: string | null;
  totalElapsed: number;
  lastPauseTime: string | null;
  isActive: boolean;
}

const TIMER_STORAGE_KEY = 'bookish_active_timer';

export const useReadingTimer = ({ bookId, startPage }: UseReadingTimerProps) => {
  const [timerState, setTimerState] = useState<TimerState>({
    sessionId: null,
    startTime: null,
    totalElapsed: 0,
    lastPauseTime: null,
    isActive: false
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();

  // Load existing timer state on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        // Only restore if it's for the same book
        if (parsed.bookId === bookId) {
          setTimerState(parsed.timerState);
        } else {
          // Clear timer for different book
          localStorage.removeItem(TIMER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    }
  }, [bookId]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (timerState.sessionId) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
        bookId,
        startPage,
        timerState
      }));
    }
  }, [timerState, bookId, startPage]);

  // Set up interval for UI updates when timer is active
  useEffect(() => {
    if (timerState.isActive) {
      intervalRef.current = setInterval(() => {
        // Force re-render to update elapsed time display
        setTimerState(prev => ({ ...prev }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive]);

  // Calculate current elapsed time
  const calculateElapsedTime = (): number => {
    if (!timerState.startTime) return 0;

    let elapsed = timerState.totalElapsed;
    
    if (timerState.isActive && timerState.lastPauseTime === null) {
      // Timer is currently running
      const now = Date.now();
      const startTime = new Date(timerState.startTime).getTime();
      elapsed += Math.floor((now - startTime) / 1000);
    }

    return elapsed;
  };

  const elapsedTime = calculateElapsedTime();

  const startTimer = () => {
    const now = new Date().toISOString();
    
    if (timerState.sessionId) {
      // Resume existing timer
      setTimerState(prev => ({
        ...prev,
        startTime: now,
        lastPauseTime: null,
        isActive: true
      }));
    } else {
      // Start new timer
      setTimerState({
        sessionId: uuidv4(),
        startTime: now,
        totalElapsed: 0,
        lastPauseTime: null,
        isActive: true
      });
    }
  };

  const pauseTimer = () => {
    if (!timerState.isActive || !timerState.startTime) return;

    const now = Date.now();
    const startTime = new Date(timerState.startTime).getTime();
    const sessionElapsed = Math.floor((now - startTime) / 1000);

    setTimerState(prev => ({
      ...prev,
      totalElapsed: prev.totalElapsed + sessionElapsed,
      lastPauseTime: new Date().toISOString(),
      isActive: false
    }));
  };

  const stopTimer = (endPage: number): ReadingSession => {
    const finalElapsed = calculateElapsedTime();
    
    const session: ReadingSession = {
      id: timerState.sessionId || uuidv4(),
      bookId,
      startTime: timerState.startTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      startPage,
      endPage,
      duration: Math.floor(finalElapsed / 60) // Convert to minutes
    };

    // Clear timer state
    setTimerState({
      sessionId: null,
      startTime: null,
      totalElapsed: 0,
      lastPauseTime: null,
      isActive: false
    });

    // Remove from localStorage
    localStorage.removeItem(TIMER_STORAGE_KEY);

    return session;
  };

  const resetTimer = () => {
    setTimerState({
      sessionId: null,
      startTime: null,
      totalElapsed: 0,
      lastPauseTime: null,
      isActive: false
    });
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  return {
    isActive: timerState.isActive,
    elapsedTime,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  };
};