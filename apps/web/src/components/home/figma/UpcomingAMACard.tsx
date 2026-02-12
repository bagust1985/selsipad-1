'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Calendar, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface AMASession {
  id: string;
  project_name: string;
  description: string;
  scheduled_at: string;
  status: string;
  is_pinned: boolean;
  profiles?: {
    nickname?: string;
    avatar_url?: string;
  };
}

export function UpcomingAMACard() {
  const [sessions, setSessions] = useState<AMASession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const resp = await fetch('/api/ama/upcoming');
        if (resp.ok) {
          const data = await resp.json();
          setSessions((data.sessions || []).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load AMA sessions', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const hasSessions = sessions.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PINNED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ENDED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <Card className="rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/20 shadow-xl shadow-[#756BBA]/10">
      <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-8">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-white">
          Upcoming AMAs
        </CardTitle>
        <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#39AEC4]" />
      </CardHeader>

      {loading ? (
        <CardContent className="p-5 sm:p-8 pt-0 sm:pt-0">
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#39AEC4] animate-spin" />
          </div>
        </CardContent>
      ) : hasSessions ? (
        <CardContent className="space-y-3 sm:space-y-4 p-5 sm:p-8 pt-0 sm:pt-0">
          {sessions.map((session) => (
            <Link key={session.id} href="/ama" className="block">
              <div className="rounded-[20px] bg-gradient-to-br from-[#39AEC4]/10 to-[#39AEC4]/5 border border-[#39AEC4]/20 p-4 hover:border-[#39AEC4]/40 transition-all group">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* AMA Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-[#39AEC4]/20 border border-purple-500/40 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base sm:text-lg text-white truncate">
                        {session.project_name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}
                      >
                        {session.status === 'LIVE' ? '🔴 LIVE' : session.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">{session.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.scheduled_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* View All Button */}
          <Link href="/ama" className="block mt-4 sm:mt-6">
            <Button className="w-full py-6 rounded-[20px] bg-gradient-to-r from-[#39AEC4] to-[#756BBA] hover:from-[#4EABC8] hover:to-[#756BBA] transition-all shadow-lg shadow-[#756BBA]/50 font-semibold text-sm sm:text-base text-white border-0">
              View All AMAs
            </Button>
          </Link>
        </CardContent>
      ) : (
        <CardContent className="p-5 sm:p-8 pt-0 sm:pt-0">
          <div className="text-center py-6 text-gray-400">
            <Mic className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">No upcoming AMAs scheduled</p>
          </div>
          <Link href="/ama" className="block mt-2">
            <Button className="w-full py-6 rounded-[20px] bg-gradient-to-r from-[#39AEC4] to-[#756BBA] hover:from-[#4EABC8] hover:to-[#756BBA] transition-all shadow-lg shadow-[#756BBA]/50 font-semibold text-sm sm:text-base text-white border-0">
              Explore AMAs
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
