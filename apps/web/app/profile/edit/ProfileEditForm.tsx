'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateProfile, deleteAvatar } from './actions';
import { Card, CardContent } from '@/components/ui';

interface ProfileEditFormProps {
  initialNickname?: string;
  initialAvatarUrl?: string;
}

export function ProfileEditForm({ initialNickname, initialAvatarUrl }: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(initialNickname || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Validate nickname on change
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameError(null);

    if (value && value.length < 3) {
      setNicknameError('Minimum 3 characters');
    } else if (value && value.length > 20) {
      setNicknameError('Maximum 20 characters');
    } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
      setNicknameError('Only letters, numbers, and underscores');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nicknameError) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('nickname', nickname);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const result = await updateProfile(formData);

    if (result.success) {
      router.push('/profile');
      router.refresh();
    } else {
      setError(result.error || 'Failed to update profile');
      setIsSubmitting(false);
    }
  };

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteAvatar();

    if (result.success) {
      setPreviewUrl(null);
      setAvatarFile(null);
      router.refresh();
    } else {
      setError(result.error || 'Failed to delete avatar');
    }

    setIsDeleting(false);
  };

  const currentAvatarUrl = previewUrl || initialAvatarUrl;
  const hasAvatar = currentAvatarUrl || avatarFile;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-heading-md text-text-primary">Profile Picture</h3>

          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-bg-elevated border-2 border-border-subtle">
              {currentAvatarUrl ? (
                <Image src={currentAvatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-text-tertiary">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Upload/Remove Buttons */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-hover transition-colors text-body-sm font-medium"
              >
                {hasAvatar ? 'Change Photo' : 'Upload Photo'}
              </button>

              {hasAvatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-error-main text-white rounded-lg hover:bg-error-hover transition-colors text-body-sm font-medium disabled:opacity-50"
                >
                  {isDeleting ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>

            <p className="text-caption text-text-tertiary text-center">JPG, PNG or WebP. Max 2MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Nickname Section */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-body-md font-medium text-text-primary mb-2"
            >
              Username
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
            {nicknameError && <p className="mt-1 text-caption text-error-main">{nicknameError}</p>}
            <p className="mt-1 text-caption text-text-tertiary">
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-soft border border-error-main rounded-lg">
          <p className="text-body-sm text-error-main">❌ {error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg hover:bg-bg-card transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!nicknameError}
          className="flex-1 px-4 py-3 bg-primary-main text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
