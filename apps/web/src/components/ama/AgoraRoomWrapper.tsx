'use client';

import { useState, useEffect } from 'react';
import { AgoraVoiceRoom } from './AgoraVoiceRoom';
import { AgoraVideoRoom } from './AgoraVideoRoom';
import { Video, Mic, Loader2 } from 'lucide-react';

interface AgoraRoomWrapperProps {
  amaId: string;
  amaType: 'VOICE' | 'VIDEO';
  userRole: 'publisher' | 'subscriber';
  onLeave?: () => void;
}

interface AgoraCredentials {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
  expiresAt: number;
  role: string;
}

export function AgoraRoomWrapper({ amaId, amaType, userRole, onLeave }: AgoraRoomWrapperProps) {
  const [credentials, setCredentials] = useState<AgoraCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/ama/${amaId}/agora-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to join room');
        }

        const data = await response.json();
        setCredentials(data);
      } catch (err: any) {
        console.error('[Agora Wrapper] Error:', err);
        setError(err.message || 'Failed to connect');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [amaId]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30 p-12 text-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Preparing room...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl border border-red-500/30 p-12 text-center">
        <div className="text-red-400 mb-4">
          {amaType === 'VIDEO' ? (
            <Video className="w-12 h-12 mx-auto" />
          ) : (
            <Mic className="w-12 h-12 mx-auto" />
          )}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Connection Failed</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!credentials) {
    return null;
  }

  // Render appropriate room based on AMA type
  if (amaType === 'VIDEO') {
    return (
      <AgoraVideoRoom
        amaId={amaId}
        channelName={credentials.channelName}
        token={credentials.token}
        appId={credentials.appId}
        uid={credentials.uid}
        userRole={userRole}
        onLeave={onLeave}
      />
    );
  }

  return (
    <AgoraVoiceRoom
      amaId={amaId}
      channelName={credentials.channelName}
      token={credentials.token}
      appId={credentials.appId}
      uid={credentials.uid}
      userRole={userRole}
      onLeave={onLeave}
    />
  );
}
