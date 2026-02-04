'use client';

import Link from 'next/link';
import { Calendar, MessageCircle, Mic, Video, MessageSquare } from 'lucide-react';

interface AMACardProps {
  id: string;
  projectName: string;
  description: string;
  scheduledAt: string;
  developerName: string;
  status: string;
  isLive?: boolean;
  type?: 'TEXT' | 'VOICE' | 'VIDEO';
}

const typeIcons = {
  TEXT: MessageSquare,
  VOICE: Mic,
  VIDEO: Video,
};

const typeColors = {
  TEXT: 'text-gray-400',
  VOICE: 'text-indigo-400',
  VIDEO: 'text-purple-400',
};

const typeBadges = {
  TEXT: 'bg-gray-500/20 text-gray-300',
  VOICE: 'bg-indigo-500/20 text-indigo-300',
  VIDEO: 'bg-purple-500/20 text-purple-300',
};

export function AMACard({
  id,
  projectName,
  description,
  scheduledAt,
  developerName,
  status,
  isLive = false,
  type = 'TEXT',
}: AMACardProps) {
  const TypeIcon = typeIcons[type];

  return (
    <Link href={`/ama/${id}`}>
      <div className="group bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-6 flex-1">
          {/* Status & Type Badges */}
          <div className="flex items-center gap-2 mb-4">
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeBadges[type]}`}
            >
              <TypeIcon className="w-3 h-3" />
              {type}
            </div>
          </div>

          {/* Project Name */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {projectName}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {description || 'No description provided'}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(scheduledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 bg-white/5">
          <p className="text-xs text-gray-400">
            Hosted by <span className="text-white font-medium">{developerName}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
