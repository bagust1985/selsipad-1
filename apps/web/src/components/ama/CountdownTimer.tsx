'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  scheduledAt: string;
}

export function CountdownTimer({ scheduledAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(scheduledAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Ready to Start!');
        setIsReady(true);
        return;
      }

      // Calculate time units
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format display
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      setIsReady(diff <= 60000); // Ready when < 1 minute
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [scheduledAt]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
        isReady
          ? 'bg-green-500/20 text-green-400 animate-pulse'
          : 'bg-indigo-500/20 text-indigo-400'
      }`}
    >
      <span className="text-lg">{isReady ? '🔴' : '⏱️'}</span>
      <span>{timeLeft}</span>
    </div>
  );
}
