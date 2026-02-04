'use client';

import { useEffect, useState, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

interface AgoraVoiceRoomProps {
  amaId: string;
  channelName: string;
  token: string;
  appId: string;
  userRole: 'publisher' | 'subscriber';
  onLeave?: () => void;
}

export function AgoraVoiceRoom({
  amaId,
  channelName,
  token,
  appId,
  userRole,
  onLeave,
}: AgoraVoiceRoomProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<number>(1);
  const [isConnecting, setIsConnecting] = useState(true);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Create Agora client
        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });
        clientRef.current = client;

        // Event listeners
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
          setParticipants((prev) => prev + 1);
        });

        client.on('user-unpublished', (user) => {
          setParticipants((prev) => Math.max(1, prev - 1));
        });

        client.on('user-left', (user) => {
          setParticipants((prev) => Math.max(1, prev - 1));
        });

        // Join channel
        await client.join(appId, channelName, token, null);
        setIsJoined(true);

        // Create and publish audio track if publisher
        if (userRole === 'publisher') {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          audioTrackRef.current = audioTrack;
          await client.publish([audioTrack]);
        }

        setIsConnecting(false);
      } catch (error) {
        console.error('[Agora Voice] Error:', error);
        setIsConnecting(false);
      }
    };

    init();

    return () => {
      // Cleanup
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [amaId, channelName, token, appId, userRole]);

  const toggleMute = async () => {
    if (!audioTrackRef.current) return;

    if (isMuted) {
      await audioTrackRef.current.setEnabled(true);
      setIsMuted(false);
    } else {
      await audioTrackRef.current.setEnabled(false);
      setIsMuted(true);
    }
  };

  const handleLeave = async () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    setIsJoined(false);
    onLeave?.();
  };

  if (isConnecting) {
    return (
      <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/30 p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-indigo-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Mic className="w-8 h-8 text-indigo-300" />
          </div>
          <p className="text-white font-medium">Connecting to voice room...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-medium">Voice Room Active</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="w-4 h-4" />
          <span className="text-sm">{participants} participants</span>
        </div>
      </div>

      {/* Audio Visualizer */}
      <div className="bg-black/20 rounded-lg p-8 mb-6 flex items-center justify-center">
        <div className="flex gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-indigo-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 40 + 20}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {userRole === 'publisher' && (
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        )}

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
          title="Leave voice room"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Role indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-400">
          {userRole === 'publisher' ? 'You are hosting' : 'Listening mode'}
        </span>
      </div>
    </div>
  );
}
