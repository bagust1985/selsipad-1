/**
 * FASE 3: Validation Utilities
 * Request validation for KYC, SC Scans, and Badge operations
 */

import type {
  KYCSubmissionRequest,
  KYCReviewRequest,
  SCScanRequest,
  SCScanWebhookPayload,
  BadgeAwardRequest,
} from '../types/fase3';

// ============================================
// Validation Errors
// ============================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================
// KYC Validation
// ============================================

export function validateKYCSubmission(data: unknown): KYCSubmissionRequest {
  const req = data as KYCSubmissionRequest;

  if (!req.submission_type || !['INDIVIDUAL', 'BUSINESS'].includes(req.submission_type)) {
    throw new ValidationError('submission_type must be INDIVIDUAL or BUSINESS', 'submission_type');
  }

  if (!req.documents_url || typeof req.documents_url !== 'string') {
    throw new ValidationError('documents_url is required and must be a string', 'documents_url');
  }

  // Validate URL format
  try {
    new URL(req.documents_url);
  } catch {
    throw new ValidationError('documents_url must be a valid URL', 'documents_url');
  }

  if (req.project_id && typeof req.project_id !== 'string') {
    throw new ValidationError('project_id must be a string', 'project_id');
  }

  return {
    submission_type: req.submission_type,
    documents_url: req.documents_url,
    project_id: req.project_id,
    metadata: req.metadata || {},
  };
}

export function validateKYCReview(data: unknown): KYCReviewRequest {
  const req = data as KYCReviewRequest;

  if (!req.status || !['APPROVED', 'REJECTED'].includes(req.status)) {
    throw new ValidationError('status must be APPROVED or REJECTED', 'status');
  }

  if (req.status === 'REJECTED' && (!req.rejection_reason || req.rejection_reason.trim() === '')) {
    throw new ValidationError(
      'rejection_reason is required when status is REJECTED',
      'rejection_reason'
    );
  }

  return {
    status: req.status,
    rejection_reason: req.rejection_reason,
  };
}

// ============================================
// Smart Contract Scan Validation
// ============================================

const VALID_SCAN_PROVIDERS = ['CERTIK', 'HACKEN', 'SLOWMIST', 'INTERNAL'];

export function validateSCScanRequest(data: unknown): SCScanRequest {
  const req = data as SCScanRequest;

  if (!req.project_id || typeof req.project_id !== 'string') {
    throw new ValidationError('project_id is required and must be a string', 'project_id');
  }

  if (!req.contract_address || typeof req.contract_address !== 'string') {
    throw new ValidationError(
      'contract_address is required and must be a string',
      'contract_address'
    );
  }

  // Basic Ethereum address validation (0x + 40 hex chars)
  if (!/^0x[a-fA-F0-9]{40}$/.test(req.contract_address)) {
    throw new ValidationError(
      'contract_address must be a valid Ethereum address',
      'contract_address'
    );
  }

  if (!req.chain || typeof req.chain !== 'string') {
    throw new ValidationError('chain is required and must be a string', 'chain');
  }

  if (!req.scan_provider || !VALID_SCAN_PROVIDERS.includes(req.scan_provider)) {
    throw new ValidationError(
      `scan_provider must be one of: ${VALID_SCAN_PROVIDERS.join(', ')}`,
      'scan_provider'
    );
  }

  return {
    project_id: req.project_id,
    contract_address: req.contract_address,
    chain: req.chain,
    scan_provider: req.scan_provider,
  };
}

export function validateSCScanWebhook(data: unknown): SCScanWebhookPayload {
  const req = data as SCScanWebhookPayload;

  if (!req.scan_id || typeof req.scan_id !== 'string') {
    throw new ValidationError('scan_id is required and must be a string', 'scan_id');
  }

  if (!req.status || !['PENDING', 'PASSED', 'FAILED', 'WARNING'].includes(req.status)) {
    throw new ValidationError('status must be one of: PENDING, PASSED, FAILED, WARNING', 'status');
  }

  if (
    req.score !== undefined &&
    (typeof req.score !== 'number' || req.score < 0 || req.score > 100)
  ) {
    throw new ValidationError('score must be a number between 0 and 100', 'score');
  }

  return {
    scan_id: req.scan_id,
    status: req.status,
    score: req.score,
    report_url: req.report_url,
    findings_summary: req.findings_summary,
  };
}

// ============================================
// Badge Validation
// ============================================

export function validateBadgeAward(data: unknown): BadgeAwardRequest {
  const req = data as BadgeAwardRequest;

  if (!req.project_id || typeof req.project_id !== 'string') {
    throw new ValidationError('project_id is required and must be a string', 'project_id');
  }

  if (!req.badge_key || typeof req.badge_key !== 'string') {
    throw new ValidationError('badge_key is required and must be a string', 'badge_key');
  }

  if (req.reason && typeof req.reason !== 'string') {
    throw new ValidationError('reason must be a string', 'reason');
  }

  return {
    project_id: req.project_id,
    badge_key: req.badge_key,
    reason: req.reason,
  };
}

// ============================================
// Project Submission Validation
// ============================================

export function validateProjectData(project: {
  name?: string;
  symbol?: string;
  description?: string;
  status?: string;
}): void {
  if (!project.name || project.name.trim().length < 3 || project.name.length > 100) {
    throw new ValidationError('Project name must be between 3 and 100 characters', 'name');
  }

  if (!project.symbol || !/^[A-Z]{2,10}$/.test(project.symbol)) {
    throw new ValidationError('Project symbol must be 2-10 uppercase letters', 'symbol');
  }

  if (project.description && project.description.length > 5000) {
    throw new ValidationError('Description must not exceed 5000 characters', 'description');
  }
}

export function validateProjectForSubmission(project: {
  name?: string;
  symbol?: string;
  status?: string;
}): void {
  // Ensure project meets minimum requirements for submission
  validateProjectData(project);

  if (project.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT projects can be submitted', 'status');
  }
}
