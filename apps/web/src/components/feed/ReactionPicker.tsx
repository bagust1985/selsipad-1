'use client';

import { useState } from 'react';

interface ReactionPickerProps {
  postId: string;
  currentReaction?: string;
  onReactionChange?: (reaction: string | null) => void;
}

const reactions = [
  { type: 'love', emoji: '😍', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
];

export function ReactionPicker({ postId, currentReaction, onReactionChange }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(currentReaction);
  const [loading, setLoading] = useState(false);

  const handleReact = async (reactionType: string) => {
    if (loading) return;

    const previousReaction = selected;
    setSelected(reactionType);
    setIsOpen(false);
    setLoading(true);

    try {
      const { reactToPost } = await import('../../../app/feed/interactions');
      await reactToPost(postId, reactionType as any);
      onReactionChange?.(reactionType);
    } catch (error) {
      setSelected(previousReaction);
      console.error('Failed to react:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentEmoji = reactions.find((r) => r.type === selected)?.emoji;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-1.5 rounded-full transition-all
          ${
            selected
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }
          ${loading ? 'opacity-50' : ''}
        `}
      >
        <span className="text-lg">{currentEmoji || '👍'}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex gap-1">
            {reactions.map(({ type, emoji, label }) => (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className="hover:scale-125 transition-transform p-2 rounded-lg hover:bg-gray-100"
                title={label}
              >
                <span className="text-2xl">{emoji}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
