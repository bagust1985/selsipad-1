'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Share2,
  MoreHorizontal,
  Link as LinkIcon,
  Send,
  BadgeCheck,
} from 'lucide-react';
import { LikeButton } from './LikeButton';
import { PostMenu } from './PostMenu';
import { CommentModal } from './CommentModal';
import { sharePost } from '../../app/feed/interactions';

import { type Post as FeedDataPost } from '@/lib/data/feed';

interface FeedPostProps {
  post: FeedDataPost;
  currentUserId?: string;
  onDelete?: () => void;
}

export function FeedPost({ post, currentUserId, onDelete }: FeedPostProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [reposting, setReposting] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repost_count || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.replies || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUserId === post.author.id;

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside the share menu ref or anywhere inside the portal dropdown
      if (shareMenuRef.current && shareMenuRef.current.contains(target)) return;
      if (target.closest('[data-share-portal]')) return;
      setShowShareMenu(false);
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  // Prevent hydration mismatch for dates
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const { trackView: track } = await import('../../app/feed/interactions');
        if (track) await track(post.id);
      } catch (error) {
        // Silently fail
      }
    };
    trackView();

    // Check follow status
    const checkFollow = async () => {
      if (!currentUserId || isAuthor) return;
      try {
        const response = await fetch(`/api/feed/follow/${post.author.id}`);
        const data = await response.json();
        setIsFollowing(data.following);
      } catch (error) {
        // Silently fail
      }
    };
    checkFollow();

    // Fetch comment count
    const fetchCommentCount = async () => {
      try {
        const response = await fetch(`/api/feed/comments/${post.id}`);
        const data = await response.json();
        setCommentCount(data.comments?.length || 0);
      } catch (error) {
        // Silently fail
      }
    };
    fetchCommentCount();
  }, [post.id, post.author.id, currentUserId, isAuthor]);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || saving) return;

    setSaving(true);
    try {
      const { editPost } = await import('../../app/feed/interactions');
      await editPost(post.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit post:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRepost = async () => {
    if (reposting) return;

    if (reposted) {
      if (!confirm('Remove this repost?')) return;
      setReposting(true);
      try {
        const response = await fetch(`/api/feed/repost/${post.id}`, { method: 'DELETE' });
        if (response.ok) {
          setReposted(false);
          setRepostCount((prev) => Math.max(prev - 1, 0));
        } else alert('Failed to remove repost');
      } catch (error) {
        alert('Failed to remove repost');
      } finally {
        setReposting(false);
      }
    } else {
      if (!confirm('Repost this to your followers?')) return;
      setReposting(true);
      try {
        const response = await fetch(`/api/feed/repost/${post.id}`, { method: 'POST' });
        if (response.ok) {
          setReposted(true);
          setRepostCount((prev) => prev + 1);
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to repost');
        }
      } catch (error) {
        alert('Failed to repost');
      } finally {
        setReposting(false);
      }
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || followLoading) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/feed/follow/${post.author.id}`, { method });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/feed/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
      setShowShareMenu(false);
      sharePost(post.id, 'link').catch(() => {});
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const handleShareTo = (platform: 'twitter' | 'telegram' | 'whatsapp') => {
    const postUrl = `${window.location.origin}/feed/post/${post.id}`;
    const shareContent =
      post.type === 'repost' && post.reposted_post ? post.reposted_post.content : post.content;
    const text = `Check out this post: ${shareContent.slice(0, 100)}${shareContent.length > 100 ? '...' : ''}`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
        break;
    }

    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
    sharePost(post.id, 'link').catch(() => {});
  };

  // Format time ago (Twitter style)
  const getTimeAgo = () => {
    if (!mounted) return '';
    const now = new Date();
    const postDate = new Date(post.created_at);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format counts (1000 -> 1K, 1000000 -> 1M)
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // For reposts, show the original post's content
  const displayPost = post.type === 'repost' && post.reposted_post ? post.reposted_post : post;

  return (
    <div className="font-twitter group/post mb-6 rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 hover:border-[#39AEC4]/30 transition-all p-4 sm:p-5 shadow-lg hover:shadow-xl hover:shadow-[#756BBA]/5">
      {/* Repost Banner */}
      {post.type === 'repost' && (
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 pl-10">
          <Repeat2 className="w-3.5 h-3.5 text-green-400" />
          <span className="font-semibold">{post.author.username}</span>
          <span>Reposted</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/feed/profile/${displayPost.author.id}`} className="flex-shrink-0">
          {displayPost.author.avatar_url ? (
            <img
              src={displayPost.author.avatar_url}
              alt={displayPost.author.username}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#39AEC4]/40 bg-gradient-to-br from-[#39AEC4]/30 to-[#756BBA]/30 p-[1px] ring-2 ring-transparent group-hover/post:ring-[#39AEC4]/20 transition-all"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#39AEC4]/30 to-[#756BBA]/30 border border-[#39AEC4]/40 flex items-center justify-center text-white font-semibold text-sm sm:text-base group-hover/post:from-[#39AEC4]/40 group-hover/post:to-[#756BBA]/40 transition-all">
              {displayPost.author.username[0]?.toUpperCase()}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <Link
                  href={`/feed/profile/${displayPost.author.id}`}
                  className="font-semibold text-sm sm:text-base text-white hover:text-[#39AEC4] transition-colors truncate"
                >
                  {displayPost.author.username}
                </Link>
                {displayPost.author.bluecheck && (
                  <BadgeCheck className="w-4 h-4 text-[#39AEC4] fill-[#39AEC4]/20 flex-shrink-0" />
                )}

                {!isAuthor && currentUserId && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all flex-shrink-0 ${
                      isFollowing
                        ? 'text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-400/50'
                        : 'text-[#39AEC4] hover:text-white border border-[#39AEC4]/30 hover:border-[#39AEC4]/60 bg-[#39AEC4]/10 hover:bg-[#39AEC4]/20'
                    }`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-gray-400 text-xs sm:text-sm hover:text-[#39AEC4] hover:underline transition-colors cursor-pointer">
                  @{displayPost.author.username.toLowerCase().replace(/\s/g, '')}
                </span>
                <span className="text-gray-600 text-xs">·</span>
                <span className="text-gray-500 text-xs">{getTimeAgo()}</span>
                {/* @ts-ignore - edit_count optional */}
                {post.edit_count && post.edit_count > 0 && (
                  <span className="text-gray-600 text-xs">(edited)</span>
                )}
              </div>
            </div>

            {/* More Options — hover reveal */}
            <PostMenu
              postId={post.id}
              isAuthor={isAuthor}
              onEdit={() => setIsEditing(true)}
              onDelete={onDelete}
            />
          </div>

          {/* Post Content */}
          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-black/40 border border-[#39AEC4]/20 text-white rounded-xl focus:outline-none focus:border-[#39AEC4]/50 transition-colors resize-none backdrop-blur-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white text-sm font-bold rounded-full disabled:opacity-50 transition-all shadow-lg shadow-[#756BBA]/20 hover:shadow-[#756BBA]/40"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <Link href={`/feed/post/${displayPost.id}`} className="block cursor-pointer">
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed mt-2 whitespace-pre-wrap break-words">
                {/* Highlight hashtags */}
                {displayPost.content.split(/(\s+)/).map((part, i) => {
                  if (part.startsWith('#')) {
                    return (
                      <span key={i} className="text-[#39AEC4] hover:underline cursor-pointer">
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </p>

              {/* Image Grid */}
              {displayPost.image_urls && displayPost.image_urls.length > 0 && (
                <div
                  className={`mt-3 grid gap-2 ${
                    displayPost.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}
                >
                  {displayPost.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Post image ${index + 1}`}
                      className={`rounded-2xl border border-[#39AEC4]/10 object-cover bg-black/40 ${
                        displayPost.image_urls!.length === 1 ? 'max-h-96 w-full' : 'h-64 w-full'
                      }`}
                    />
                  ))}
                </div>
              )}
            </Link>
          )}

          {/* Project Tag */}
          {/* @ts-ignore */}
          {post.project_id && (
            <Link href={`/project/${post.project_id}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 bg-[#39AEC4]/5 border border-[#39AEC4]/20 rounded-full hover:border-[#39AEC4]/40 hover:bg-[#39AEC4]/10 transition-all">
                <span className="text-xs font-medium text-[#39AEC4]">
                  {/* @ts-ignore */}
                  🏷️ {post.project_name}
                </span>
              </div>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-3 mt-3 border-t border-[#39AEC4]/5">
            {/* Comment */}
            <button
              onClick={() => setCommentModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 hover:text-[#39AEC4] transition-colors group/btn"
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover/btn:bg-[#39AEC4]/10 transition-colors">
                <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-xs sm:text-sm font-medium">
                {commentCount > 0 ? formatCount(commentCount) : ''}
              </span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              disabled={reposting}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors group/btn ${
                reposted ? 'text-green-400' : 'hover:text-green-400'
              }`}
            >
              <div
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  reposted ? 'bg-green-400/10' : 'group-hover/btn:bg-green-400/10'
                }`}
              >
                <Repeat2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-xs sm:text-sm font-medium">
                {reposting ? '...' : repostCount > 0 ? formatCount(repostCount) : ''}
              </span>
            </button>

            {/* Like */}
            <div className="flex items-center gap-1.5 transition-colors">
              <LikeButton postId={post.id} initialLiked={post.is_liked} initialCount={post.likes} />
            </div>

            {/* Views */}
            <button className="flex items-center gap-1.5 sm:gap-2 hover:text-[#39AEC4] transition-colors group/btn">
              <div className="p-1.5 sm:p-2 rounded-full group-hover/btn:bg-[#39AEC4]/10 transition-colors">
                <BarChart3 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              {/* @ts-ignore - view_count optional */}
              <span className="text-xs sm:text-sm font-medium">
                {post.view_count && post.view_count > 0 ? formatCount(post.view_count) : ''}
              </span>
            </button>

            {/* Share */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="group/btn p-1.5 sm:p-2 rounded-full hover:bg-[#39AEC4]/10 hover:text-[#39AEC4] transition-colors"
              >
                <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Share Menu Dropdown — Portal to escape stacking context */}
              {showShareMenu &&
                typeof document !== 'undefined' &&
                createPortal(
                  <div
                    data-share-portal
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowShareMenu(false)}
                  >
                    <div
                      className="absolute bg-black/95 backdrop-blur-xl border border-[#39AEC4]/20 rounded-2xl shadow-xl shadow-black/50 py-2 w-48"
                      style={{
                        top: shareMenuRef.current
                          ? shareMenuRef.current.getBoundingClientRect().top - 8
                          : 0,
                        left: shareMenuRef.current
                          ? shareMenuRef.current.getBoundingClientRect().right - 192
                          : 0,
                        transform: 'translateY(-100%)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleShareTo('twitter')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#39AEC4]/10 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share to X
                      </button>
                      <button
                        onClick={() => handleShareTo('telegram')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#39AEC4]/10 transition-colors flex items-center gap-3"
                      >
                        <Send className="w-4 h-4" />
                        Share to Telegram
                      </button>
                      <button
                        onClick={() => handleShareTo('whatsapp')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#39AEC4]/10 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Share to WhatsApp
                      </button>
                      <div className="border-t border-[#39AEC4]/10 my-1"></div>
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#39AEC4]/10 transition-colors flex items-center gap-3"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Copy Link
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        postId={post.id}
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
      />
    </div>
  );
}
