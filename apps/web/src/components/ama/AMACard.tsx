'use client';

/**
 * AMACard Component
 * 
 * Display card for upcoming/pinned AMAs
 * Premium glassmorphism design
 */

import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface AMACardProps {
  id: string;
  projectName: string;
  description: string;
  scheduledAt: string;
  developerName: string;
  developerAvatar?: string;
  status: 'PINNED' | 'LIVE' | 'ENDED';
  isLive?: boolean;
}

export function AMACard({
  id,
  projectName,
  description,
  scheduledAt,
  developerName,
  developerAvatar,
  status,
  isLive = false,
}: AMACardProps) {
  const scheduledDate = new Date(scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const timeUntil = isUpcoming
    ? formatDistanceToNow(scheduledDate, { addSuffix: false })
    : null;
  
  return (
    <div className="group relative bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {status === 'LIVE' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold tracking-wide">LIVE NOW</span>
          </div>
        ) : status === 'ENDED' ? (
          <div className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 rounded-full">
            <span className="text-gray-400 text-xs font-medium">ENDED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
            <span className="text-indigo-400 text-xs font-bold tracking-wide">UPCOMING</span>
          </div>
        )}
      </div>
      
      {/* Glow Effect */}
      {status === 'LIVE' && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Developer Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            {developerAvatar ? (
              <img
                src={developerAvatar}
                alt={developerName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {developerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
              {projectName} AMA
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 text-sm">@{developerName}</span>
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">
                ✓ Dev Verified
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
          {description}
        </p>
        
        {/* Schedule */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
          <span className="text-2xl">📅</span>
          <div>
            <p className="text-white font-medium" suppressHydrationWarning>
              {format(scheduledDate, 'MMMM d, yyyy')} at {format(scheduledDate, 'HH:mm')} UTC
            </p>
            {isUpcoming && timeUntil && (
              <p className="text-indigo-400 text-sm" suppressHydrationWarning>
                ⏰ Starts in {timeUntil}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          {status === 'LIVE' ? (
            <Link
              href={`/ama/${id}`}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-xl text-center hover:from-red-500 hover:to-red-400 transition-all flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Join Live AMA
            </Link>
          ) : status === 'ENDED' ? (
            <Link
              href={`/ama/${id}`}
              className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-xl text-center hover:bg-white/20 transition-all"
            >
              View Chat Archive
            </Link>
          ) : (
            <>
              <button className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <span>🔔</span>
                Set Reminder
              </button>
              <Link
                href={`/project/${id}`}
                className="px-4 py-3 bg-indigo-500/20 text-indigo-400 font-medium rounded-xl hover:bg-indigo-500/30 transition-all flex items-center gap-2"
              >
                <span>👁️</span>
                View Project
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

/**
 * AMACardSkeleton
 * Loading placeholder for AMA cards
 */
export function AMACardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
      <div className="h-12 bg-white/10 rounded-xl mb-4" />
      <div className="h-12 bg-white/10 rounded-xl" />
    </div>
  );
}

export default AMACard;
