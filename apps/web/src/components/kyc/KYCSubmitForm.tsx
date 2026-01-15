'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  submitKYC,
  uploadKYCDocuments,
  type KYCSubmissionType,
} from '../../../app/profile/kyc/actions';
import { FileUpload } from '@/components/kyc/FileUpload';

interface KYCSubmitFormProps {
  userProjects: Array<{ id: string; name: string }>;
}

export function KYCSubmitForm({ userProjects }: KYCSubmitFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<KYCSubmissionType>('INDIVIDUAL');
  const [projectId, setProjectId] = useState<string>('');

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const canSubmit = idFront && selfie && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);

    try {
      // 1. Convert files to base64
      const filesToUpload = [];

      const frontBase64 = await fileToBase64(idFront);
      filesToUpload.push({ name: `id-front-${Date.now()}.jpg`, data: frontBase64 });

      if (idBack) {
        const backBase64 = await fileToBase64(idBack);
        filesToUpload.push({ name: `id-back-${Date.now()}.jpg`, data: backBase64 });
      }

      const selfieBase64 = await fileToBase64(selfie);
      filesToUpload.push({ name: `selfie-${Date.now()}.jpg`, data: selfieBase64 });

      // 2. Upload to Supabase Storage
      const documentsUrl = await uploadKYCDocuments(filesToUpload);

      // 3. Submit KYC
      await submitKYC({
        submission_type: submissionType,
        documents_url: documentsUrl,
        project_id: projectId || undefined,
      });

      alert('KYC submitted successfully! Awaiting review.');
      router.push('/profile/kyc');
    } catch (error: any) {
      console.error('KYC submission error:', error);
      alert(error.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submission Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Verification Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(['INDIVIDUAL', 'BUSINESS'] as KYCSubmissionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSubmissionType(type)}
              className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                submissionType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {submissionType === 'INDIVIDUAL'
            ? 'For personal verification using government ID'
            : 'For business verification (coming soon)'}
        </p>
      </div>

      {/* Project Association (Optional) */}
      {userProjects.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Link to Project (Optional)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None - Personal verification only</option>
            {userProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Document Uploads */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900">Upload Documents</h3>

        <FileUpload
          label="ID Front Side"
          accept="image/jpeg,image/png"
          maxSize={10}
          onFileSelect={setIdFront}
          required
        />

        <FileUpload
          label="ID Back Side (if applicable)"
          accept="image/jpeg,image/png"
          maxSize={10}
          onFileSelect={setIdBack}
        />

        <FileUpload
          label="Selfie with ID"
          accept="image/jpeg,image/png"
          maxSize={10}
          onFileSelect={setSelfie}
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Tips for good photos:</strong>
            <br />• Use good lighting, avoid glare
            <br />• Ensure all text is readable
            <br />• Hold ID next to your face for selfie
            <br />• All corners of ID must be visible
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        🔒 Your documents are encrypted and securely stored. Review typically takes 2-5 business
        days.
      </p>
    </form>
  );
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
