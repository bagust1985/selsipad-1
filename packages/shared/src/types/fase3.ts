/**
 * FASE 3: Project Lifecycle Types
 * TypeScript interfaces for KYC, SC Scans, Badges, and Extended Projects
 */

// ============================================
// KYC Types
// ============================================

export type KYCSubmissionType = 'INDIVIDUAL' | 'BUSINESS';
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYCSubmission {
  id: string;
  user_id: string;
  project_id: string | null;
  submission_type: KYCSubmissionType;
  status: KYCStatus;
  documents_url: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KYCSubmissionRequest {
  submission_type: KYCSubmissionType;
  project_id?: string;
  documents_url: string;
  metadata?: Record<string, unknown>;
}

export interface KYCReviewRequest {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}

// ============================================
// Smart Contract Scan Types
// ============================================

export type SCScanProvider = 'CERTIK' | 'HACKEN' | 'SLOWMIST' | 'INTERNAL';
export type SCScanStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'WARNING';

export interface SCScanResult {
  id: string;
  project_id: string;
  contract_address: string;
  chain: string;
  scan_provider: SCScanProvider;
  score: number | null; // 0-100
  status: SCScanStatus;
  report_url: string | null;
  findings_summary: SCScanFindings;
  scan_requested_at: string;
  scan_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SCScanFindings {
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  informational?: number;
  details?: string;
}

export interface SCScanRequest {
  project_id: string;
  contract_address: string;
  chain: string;
  scan_provider: SCScanProvider;
}

export interface SCScanWebhookPayload {
  scan_id: string;
  status: SCScanStatus;
  score?: number;
  report_url?: string;
  findings_summary?: SCScanFindings;
}

// ============================================
// Badge Types
// ============================================

export type BadgeType = 'KYC' | 'SECURITY' | 'MILESTONE' | 'SPECIAL';

export interface BadgeDefinition {
  id: string;
  badge_key: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  badge_type: BadgeType;
  auto_award_criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ProjectBadge {
  id: string;
  project_id: string;
  badge_id: string;
  awarded_at: string;
  awarded_by: string | null; // null for auto-awards
  reason: string | null;
  badge_definitions?: BadgeDefinition; // joined data
}

export interface BadgeAwardRequest {
  project_id: string;
  badge_key: string;
  reason?: string;
}

// Well-known badge keys
export const BADGE_KEYS = {
  KYC_VERIFIED: 'KYC_VERIFIED',
  SC_AUDIT_PASSED: 'SC_AUDIT_PASSED',
  FIRST_PROJECT: 'FIRST_PROJECT',
  EARLY_ADOPTER: 'EARLY_ADOPTER',
  TRENDING_PROJECT: 'TRENDING_PROJECT',
  VERIFIED_TEAM: 'VERIFIED_TEAM',
} as const;

export type BadgeKey = (typeof BADGE_KEYS)[keyof typeof BADGE_KEYS];

// ============================================
// Extended Project Types
// ============================================

export type ProjectKYCStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProjectSCScanStatus = 'NONE' | 'PENDING' | 'PASSED' | 'FAILED' | 'WARNING';

export interface ProjectWithLifecycle {
  id: string;
  owner_user_id: string;
  name: string;
  symbol: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  chains_supported: string[];
  status: string; // DRAFT, SUBMITTED, APPROVED, REJECTED, LIVE
  kyc_status: ProjectKYCStatus;
  sc_scan_status: ProjectSCScanStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithBadges extends ProjectWithLifecycle {
  project_badges?: Array<{
    awarded_at: string;
    reason: string | null;
    badge_definitions: BadgeDefinition;
  }>;
  sc_scan_results?: SCScanResult[];
}

export interface ProjectSubmitRequest {
  // No body needed - just confirmation that project is ready
}

// ============================================
// API Response Types
// ============================================

export interface BadgesListResponse {
  badges: BadgeDefinition[];
}

export interface ProjectBadgesResponse {
  badges: Array<ProjectBadge & { badge_definitions: BadgeDefinition }>;
}

export interface KYCStatusResponse {
  submission: KYCSubmission | null;
  kyc_status: ProjectKYCStatus;
}

export interface SCScanResultsResponse {
  scans: SCScanResult[];
}
