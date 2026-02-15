'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAMA } from '../../app/admin/ama/actions';

interface QuickStartButtonProps {
  amaId: string;
  scheduledAt: string;
}

export function QuickStartButton({ amaId, scheduledAt }: QuickStartButtonProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(scheduledAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Ready!');
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

  const handleStartNow = async () => {
    if (!isReady || isStarting) return;

    setIsStarting(true);
    try {
      const result = await startAMA(amaId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to start AMA');
      }

      // Success! Refresh page
      router.refresh();
    } catch (error: any) {
      console.error('Error starting AMA:', error);
      alert(error.message || 'Failed to start AMA. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Countdown Timer */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
          isReady ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'
        }`}
      >
        <span className="text-lg">{isReady ? '🔴' : '⏱️'}</span>
        <span>{timeLeft}</span>
      </div>

      {/* Quick Start Button (only when ready) */}
      {isReady && (
        <button
          onClick={handleStartNow}
          disabled={isStarting}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all animate-pulse hover:animate-none flex items-center gap-2"
        >
          {isStarting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <span>▶️</span>
              START NOW
            </>
          )}
        </button>
      )}
    </div>
  );
}
