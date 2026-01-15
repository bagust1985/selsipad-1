'use client';

import { useState, useEffect } from 'react';
import { Share2, Link, Repeat, Quote } from 'lucide-react';

interface ShareButtonProps {
  postId: string;
  postContent: string;
}

export function ShareButton({ postId, postContent }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/feed/post/${postId}`);
    }
  }, [postId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      const { sharePost } = await import('../../../app/feed/interactions');
      await sharePost(postId, 'link');

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleRepost = async () => {
    try {
      const { sharePost } = await import('../../../app/feed/interactions');
      await sharePost(postId, 'repost');
      // TODO: Navigate to create repost page
      alert('Repost functionality coming soon!');
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left text-gray-900"
            >
              <Link className="w-5 h-5" />
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
            <button
              onClick={handleRepost}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left text-gray-900"
            >
              <Repeat className="w-5 h-5" />
              <span>Repost</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
