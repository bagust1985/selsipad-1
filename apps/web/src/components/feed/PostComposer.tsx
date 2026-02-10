'use client';

import { useState, useRef, useEffect } from 'react';
import { Image, Smile, X, User, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PostComposerProps {
  userProfile?: {
    avatar_url?: string;
    username: string;
  };
  isEligible: boolean;
  onSubmit: (content: string, imageUrls?: string[]) => Promise<void>;
}

/**
 * Twitter-style inline post composer
 * Displays at the top of the feed for creating new posts
 */
export function PostComposer({ userProfile, isEligible, onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Extract hashtags for counting
  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches ? [...new Set(matches.map((tag) => tag.toLowerCase()))] : [];
  };

  const hashtags = extractHashtags(content);
  const hashtagCount = hashtags.length;

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  // Common emojis
  const emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '🤗',
    '🤩',
    '🤔',
    '🤨',
    '😐',
    '😑',
    '😶',
    '🙄',
    '😏',
    '😣',
    '😥',
    '😮',
    '🤐',
    '😯',
    '😪',
    '😫',
    '🥱',
    '😴',
    '😌',
    '😛',
    '😜',
    '😝',
    '🤤',
    '😒',
    '😓',
    '😔',
    '😕',
    '🙃',
    '🤑',
    '😲',
    '☹️',
    '🙁',
    '😖',
    '😞',
    '😟',
    '😤',
    '😢',
    '😭',
    '😦',
    '😧',
    '😨',
    '😩',
    '🤯',
    '😬',
    '😰',
    '😱',
    '🥵',
    '🥶',
    '😳',
    '🤪',
    '😵',
    '🥴',
    '😠',
    '😡',
    '🤬',
    '😷',
    '🤒',
    '🤕',
    '🤢',
    '🤮',
    '🤧',
    '😇',
    '🥳',
    '🥺',
    '🤠',
    '🤡',
    '🤥',
    '🤫',
    '🤭',
    '🧐',
    '🤓',
    '😈',
    '👻',
    '💀',
    '☠️',
    '👽',
    '👾',
    '🤖',
    '🎃',
    '😺',
    '😸',
    '😹',
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '☮️',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '☝️',
    '👍',
    '👎',
    '✊',
    '👊',
    '🤛',
    '🤜',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🤝',
    '🙏',
    '✍️',
    '💅',
    '🤳',
    '💪',
    '🦾',
    '🦿',
    '🦵',
    '🔥',
    '⭐',
    '🌟',
    '✨',
    '💫',
    '💥',
    '💯',
    '🎉',
    '🎊',
    '🎁',
  ];

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);

      // Set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + emoji.length;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(content + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        console.log('[Upload] Starting upload:', {
          fileName,
          filePath,
          size: file.size,
          type: file.type,
        });

        const { data, error } = await supabase.storage.from('public-files').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (error) {
          console.error('[Upload] Storage upload error:', error);
          console.error('[Upload] Error details:', JSON.stringify(error, null, 2));
          throw error;
        }

        console.log('[Upload] Upload success:', data);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('public-files').getPublicUrl(filePath);

        console.log('[Upload] Public URL:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      setImages([...images, ...uploadedUrls]);
    } catch (error: any) {
      console.error('[Upload] Error uploading images:', error);
      console.error('[Upload] Error name:', error?.name);
      console.error('[Upload] Error message:', error?.message);
      console.error('[Upload] Error details:', error?.details);
      alert(
        `Failed to upload images: ${error.message || 'Unknown error'}. Check console for details.`
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!content.trim() && images.length === 0) || submitting || !isEligible) return;

    setSubmitting(true);
    try {
      await onSubmit(content, images.length > 0 ? images : undefined);
      setContent('');
      setImages([]);
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const maxLength = 500;
  const charCount = content.length;
  const isOverLimit = charCount > maxLength;
  // Removed hashtag requirement - trending is based on aggregation across posts, not per-post
  const canPost = (content.trim() || images.length > 0) && !isOverLimit && isEligible;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5 shadow-xl backdrop-blur-sm relative overflow-hidden group/composer transition-all hover:bg-white/[0.07] hover:border-cyan-500/30 hover:shadow-cyan-500/10">
      {/* Background Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover/composer:bg-purple-500/30 transition-all pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl group-hover/composer:bg-cyan-500/30 transition-all pointer-events-none" />

      <div className="flex gap-4 relative z-10">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/10 ring-2 ring-transparent group-hover/composer:ring-cyan-500/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-gray-400 font-semibold group-hover/composer:text-white transition-colors">
              <User className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Composer Content */}
        <div className="flex-1 space-y-4">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in crypto?"
            className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-500 resize-none min-h-[100px] text-white font-twitter disabled:opacity-50 disabled:cursor-not-allowed selection:bg-cyan-500/30"
            disabled={!isEligible}
            maxLength={maxLength + 50}
          />

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {/* Media Icons */}
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isEligible || uploading}
                className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/icon"
                title="Add image"
              >
                <Image className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
              </button>
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={!isEligible}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/icon"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
                </button>

                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-3 w-72 max-h-64 overflow-y-auto z-50 backdrop-blur-xl">
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="p-2 hover:bg-white/10 rounded-lg text-xl transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Character Count and Post Button */}
            <div className="flex items-center gap-4">
              {/* Hashtag Counter - Info Only */}
              {hashtagCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <span className="text-cyan-400">#</span>
                  <span>{hashtagCount}</span>
                </div>
              )}
              {charCount > 0 && (
                <span
                  className={`text-xs font-medium ${
                    isOverLimit ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {charCount}/{maxLength}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canPost || submitting}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-full hover:shadow-[0_0_20px_-5px_var(--color-cyan-500)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>Post</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
