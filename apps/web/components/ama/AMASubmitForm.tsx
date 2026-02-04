'use client';

import { useState } from 'react';
import { MessageSquare, Mic, Video, Calendar, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AMASubmitFormProps {
  userProjects: Array<{ id: string; name: string }>;
  isDevVerified: boolean;
}

type AMAType = 'TEXT' | 'VOICE' | 'VIDEO';

const typeOptions: Array<{
  value: AMAType;
  label: string;
  icon: typeof MessageSquare;
  description: string;
  color: string;
}> = [
  {
    value: 'TEXT',
    label: 'Text Chat',
    icon: MessageSquare,
    description: 'Live chat with your community',
    color: 'border-gray-500 hover:border-gray-400',
  },
  {
    value: 'VOICE',
    label: 'Voice Session',
    icon: Mic,
    description: 'Voice-only Q&A session',
    color: 'border-indigo-500 hover:border-indigo-400',
  },
  {
    value: 'VIDEO',
    label: 'Video Conference',
    icon: Video,
    description: 'Full video meeting with community',
    color: 'border-purple-500 hover:border-purple-400',
  },
];

const timezones = [
  { value: '+7', label: 'WIB (UTC+7)', name: 'Jakarta, Surabaya' },
  { value: '+8', label: 'WITA (UTC+8)', name: 'Makassar, Bali' },
  { value: '+9', label: 'WIT (UTC+9)', name: 'Jayapura, Maluku' },
  { value: '0', label: 'UTC (Global)', name: 'Universal Time' },
];

export function AMASubmitForm({ userProjects, isDevVerified }: AMASubmitFormProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AMAType>('TEXT');
  const [selectedTimezone, setSelectedTimezone] = useState('+7'); // Default WIB
  const [formData, setFormData] = useState({
    projectId: userProjects[0]?.id || '',
    projectName: userProjects[0]?.name || '',
    description: '',
    scheduledAt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert local time to UTC before submission
  const convertToUTC = (localDateTime: string, timezoneOffset: string): string => {
    const offset = parseInt(timezoneOffset);
    const localDate = new Date(localDateTime);
    const utcDate = new Date(localDate.getTime() - offset * 60 * 60 * 1000);
    return utcDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert local time to UTC
      const utcScheduledAt = convertToUTC(formData.scheduledAt, selectedTimezone);

      const response = await fetch('/api/v1/ama/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          projectName: formData.projectName,
          description: formData.description,
          scheduledAt: utcScheduledAt, // Send UTC time to API
          type: selectedType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit AMA request');
      }

      const data = await response.json();
      router.push(`/ama/${data.id}`);
    } catch (err: any) {
      console.error('[AMA Submit] Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = userProjects.find((p) => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      projectName: project?.name || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AMA Type Selector */}
      <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-6">
        <label className="block text-sm font-medium text-white mb-4">AMA Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${option.color} bg-white/10`
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`}
                />
                <p className={`font-medium mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Selection */}
      <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-6">
        <label className="block text-sm font-medium text-white mb-2">Select Project *</label>
        <select
          value={formData.projectId}
          onChange={handleProjectChange}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          required
        >
          {userProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-6">
        <label className="block text-sm font-medium text-white mb-2">AMA Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you'll discuss in this AMA..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          required
        />
      </div>

      {/* Scheduled Date/Time */}
      <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-6">
        <label className="block text-sm font-medium text-white mb-2">Preferred Date & Time *</label>

        {/* Timezone Selector */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-2">🌍 Your Timezone</label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-[#14142b]">
                {tz.label} - {tz.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pilih timezone kamu, nanti otomatis convert ke UTC
          </p>
        </div>

        {/* Date Time Input */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="mt-2 bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-3">
          <p className="text-xs text-indigo-300">
            💡 <strong>Contoh:</strong> Mau live jam 00:10 tanggal 5?
            {selectedTimezone === '+7' &&
              ' Pilih 00:10 di input, otomatis jadi 17:10 UTC tanggal 4.'}
            {selectedTimezone === '+8' &&
              ' Pilih 00:10 di input, otomatis jadi 16:10 UTC tanggal 4.'}
            {selectedTimezone === '+9' &&
              ' Pilih 00:10 di input, otomatis jadi 15:10 UTC tanggal 4.'}
            {selectedTimezone === '0' && ' Input langsung dalam UTC.'}
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-2">Final schedule subject to admin approval</p>
      </div>

      {/* Fee Info */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-indigo-300">Payment Required</h3>
        </div>
        <p className="text-indigo-200 text-sm mb-2">
          ⏱️ 60 minutes session • 💰 $100 USD (paid in BNB)
        </p>
        <p className="text-xs text-indigo-300/70">
          Price calculated via Chainlink oracle at time of payment
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? 'Submitting...' : 'Submit AMA Request'}
      </button>
    </form>
  );
}
