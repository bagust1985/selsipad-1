'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  label?: string; // e.g. "Starts in" or "Ends in"
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({
  targetDate,
  label,
  onComplete,
  size = 'md',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const tl = calculateTimeLeft(targetDate);
      setTimeLeft(tl);
      if (!tl && onComplete) onComplete();
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            {label}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {['Days', 'Hrs', 'Min', 'Sec'].map((u, i) => (
            <div key={u} className="flex items-center gap-1.5">
              <div className="w-14 h-14 flex flex-col items-center justify-center rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="font-bold text-white font-mono tabular-nums leading-none">--</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{u}</span>
              </div>
              {i < 3 && <span className="text-gray-600 font-bold text-sm">:</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="text-center">
        <span className="text-sm text-[#39AEC4] font-semibold animate-pulse">Starting now...</span>
      </div>
    );
  }

  const boxSizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-18 h-18 text-2xl',
  };

  const labelSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1.5">
            <div
              className={`${boxSizes[size]} flex flex-col items-center justify-center rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm`}
            >
              <span className="font-bold text-white font-mono tabular-nums leading-none">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className={`${labelSizes[size]} text-gray-500 uppercase tracking-wider mt-0.5`}>
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && <span className="text-gray-600 font-bold text-sm">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
