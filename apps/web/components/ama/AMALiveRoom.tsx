'use client';

import { useState, useEffect } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Send } from 'lucide-react';
import { AgoraRoomWrapper } from './AgoraRoomWrapper';

interface Message {
  id: string;
  content: string;
  username: string;
  is_developer: boolean;
  is_verified: boolean;
  is_pinned_message: boolean;
  created_at: string;
}

interface AMALiveRoomProps {
  amaId: string;
  projectName: string;
  developerId: string;
  initialMessages: Message[];
}

export function AMALiveRoom({
  amaId,
  projectName,
  developerId,
  initialMessages,
}: AMALiveRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [amaType, setAMAType] = useState<'TEXT' | 'VOICE' | 'VIDEO'>('TEXT');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Initialize Supabase client and subscription
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setCurrentUserId(user?.id || null);
        }

        // Get AMA type
        const { data: ama } = await supabase
          .from('ama_requests')
          .select('type')
          .eq('id', amaId)
          .single();

        if (mounted && ama) {
          setAMAType(ama.type || 'TEXT');
        }

        // Subscribe to messages
        const messageChannel = supabase
          .channel(`ama-chat:${amaId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ama_messages',
              filter: `ama_id=eq.${amaId}`,
            },
            (payload: any) => {
              if (!mounted) return;

              if (payload.eventType === 'INSERT') {
                setMessages((prev) => [...prev, payload.new as Message]);
              } else if (payload.eventType === 'UPDATE') {
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
                );
              } else if (payload.eventType === 'DELETE') {
                setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
              }
            }
          )
          .subscribe();

        if (mounted) {
          setChannel(messageChannel);
        }
      } catch (error) {
        console.error('[AMA Chat] Init error:', error);
      }
    };

    init();

    return () => {
      mounted = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [amaId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    setIsTyping(true);
    try {
      const response = await fetch(`/api/v1/ama/${amaId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('[AMA Chat] Send error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const isDeveloper = currentUserId === developerId;

  return (
    <div className="space-y-6">
      {/* Voice/Video Room (if applicable) */}
      {(amaType === 'VOICE' || amaType === 'VIDEO') && (
        <AgoraRoomWrapper
          amaId={amaId}
          amaType={amaType}
          userRole={isDeveloper ? 'publisher' : 'subscriber'}
        />
      )}

      {/* Text Chat */}
      <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-indigo-600/20 border-b border-indigo-500/30 p-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            💬 Live Chat
            <span className="text-xs text-indigo-300">({messages.length} messages)</span>
          </h3>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.is_pinned_message
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-medium ${msg.is_developer ? 'text-indigo-400' : 'text-white'}`}
                >
                  {msg.username}
                </span>
                {msg.is_developer && (
                  <span className="text-xs bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                    DEV
                  </span>
                )}
                {msg.is_verified && <span className="text-xs text-emerald-400">✓</span>}
                <span className="text-xs text-gray-500 ml-auto">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-300">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !newMessage.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
