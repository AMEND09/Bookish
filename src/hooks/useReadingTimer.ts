import { useState, useEffect, useRef } from 'react';
import { ReadingSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UseReadingTimerProps {
  bookId: string;
  startPage: number;
}

export const useReadingTimer = ({ bookId, startPage }: UseReadingTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
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
  }, [isActive]);

  const startTimer = () => {
    setIsActive(true);
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const stopTimer = (endPage: number): ReadingSession => {
    setIsActive(false);
    const endTime = new Date().toISOString();
    const durationMinutes = Math.floor(elapsedTime / 60);

    const session: ReadingSession = {
      id: uuidv4(),
      bookId,
      startPage,
      endPage,
      startTime: sessionStartTime || new Date().toISOString(),
      endTime,
      duration: durationMinutes
    };

    return session;
  };

  const resetTimer = () => {
    setIsActive(false);
    setElapsedTime(0);
    setSessionStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return {
    isActive,
    elapsedTime,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  };
};