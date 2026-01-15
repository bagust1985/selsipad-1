import { StatusType } from '@/components/ui/StatusBadge';

/**
 * UI Contract: Status mappings from backend to frontend display
 * Based on Phase 0 Design System
 */

export const STATUS_LABELS: Record<StatusType, string> = {
  // Project Sale Status
  live: 'Sedang Berlangsung',
  upcoming: 'Segera Hadir',
  ended: 'Selesai',
  finalizing: 'Proses Finalisasi',

  // Transaction Status
  success: 'Berhasil',
  failed: 'Gagal',
  pending: 'Menunggu Konfirmasi',

  // Verification Status
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  active: 'Aktif',
  inactive: 'Tidak Aktif',

  // General
  warning: 'Peringatan',
};

export const STATUS_INTENT: Record<
  StatusType,
  'success' | 'warning' | 'error' | 'info' | 'neutral'
> = {
  live: 'success',
  success: 'success',
  verified: 'success',
  active: 'info',
  upcoming: 'info',
  pending: 'warning',
  warning: 'warning',
  finalizing: 'warning',
  rejected: 'error',
  failed: 'error',
  ended: 'neutral',
  inactive: 'neutral',
};

/**
 * Get label for status badge
 */
export function getStatusLabel(status: StatusType): string {
  return STATUS_LABELS[status] || status.toUpperCase();
}

/**
 * Get intent color for status
 */
export function getStatusIntent(
  status: StatusType
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  return STATUS_INTENT[status] || 'neutral';
}
