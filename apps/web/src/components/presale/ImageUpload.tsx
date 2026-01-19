'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  description?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'presale-assets',
  folder = 'logos',
  maxSizeMB = 2,
  accept = 'image/*',
  label = 'Upload Image',
  description = 'PNG, JPG or GIF (max 2MB)',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const publicUrl = await uploadFile(file);
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && <label className="block text-sm font-medium text-white">{label}</label>}

      {/* Upload Area */}
      <div className="relative">
        {preview ? (
          // Preview Mode
          <div className="relative group">
            <div className="aspect-video w-full bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>

            {/* Uploading Indicator */}
            {uploading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                  <div className="text-sm text-white mt-2">Uploading...</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Upload Button Mode
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-full aspect-video border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-colors flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-gray-300"
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                <div className="text-sm font-medium">Uploading...</div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-800 rounded-full">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">{label}</div>
                  {description && <div className="text-xs text-gray-500">{description}</div>}
                </div>
              </>
            )}
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-400">{error}</div>
        </div>
      )}

      {/* Helper Text */}
      {!error && description && !preview && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}
