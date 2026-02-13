'use client';

import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File | null) => void;
  required?: boolean;
}

export function FileUpload({
  label,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSize = 10,
  onFileSelect,
  required = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      onFileSelect(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(',').some((type) => selectedFile.type.match(type.trim()))) {
      setError('Invalid file type');
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-white/[0.03] transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-7 h-7 mb-2 text-gray-600 group-hover:text-cyan-400 transition-colors" />
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-400 group-hover:text-cyan-400 transition-colors">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-600 mt-1">JPG, PNG or PDF (max {maxSize}MB)</p>
          </div>
          <input type="file" className="hidden" accept={accept} onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative border border-green-500/30 rounded-xl p-4 bg-green-500/5">
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-white/10 rounded-full hover:bg-red-500/20 transition-colors group"
          >
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400" />
          </button>

          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-32 object-contain rounded-lg" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
