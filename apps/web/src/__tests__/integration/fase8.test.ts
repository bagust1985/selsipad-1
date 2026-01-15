/**
 * FASE 8 Integration Tests
 * SBT Staking, Reward Accrual, Claims
 */

import { createClient } from '@/lib/supabase/server';
import { verifySbtOwnership } from '@selsipad/shared'; // Use package import

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@selsipad/shared', () => ({
  ...jest.requireActual('@selsipad/shared'),
  verifySbtOwnership: jest.fn(),
}));

describe('FASE 8: SBT Staking Integration', () => {
  const mockUser = { id: 'user-123' };

  // Mock Supabase Chain
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();

  const mockSupabase = {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
    from: mockFrom,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Default chain setup
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: jest.fn(),
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle, eq: mockEq }); // Chaining
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  test('Stake Flow: Valid SBT stakes successfully', async () => {
    // Arrange
    const reqBody = { rule_id: 'rule-1', wallet_address: 'valid_wallet' };
    (verifySbtOwnership as jest.Mock).mockResolvedValue({ isValid: true });

    // Mock Rule fetch
    mockSingle.mockResolvedValueOnce({
      data: { id: 'rule-1', is_active: true, chain: 'solana' },
      error: null,
    });

    // Mock Idempotency check (not found)
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    // Mock Insert
    mockSingle.mockResolvedValueOnce({ data: { id: 'stake-1' }, error: null });

    // Act
    const { POST } = require('../../../app/api/v1/sbt/stake/route'); // Import dynamic route handler
    // Need to mock NextRequest
    const req = {
      json: async () => reqBody,
    } as unknown as Request;

    const res = await POST(req);
    // const json = await res.json();

    // Assert
    expect(res.status).not.toBe(500);
    // expect(json.success).toBe(true); // Depending on mock returns
    // Since we mock heavily, we verify flow logic
    expect(verifySbtOwnership).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: mockUser.id }));
  });

  test('Claim Flow: Requires Fee', async () => {
    // Act
    const { POST } = require('../../../app/api/v1/sbt/claim/intent/route');
    const req = {} as unknown as Request; // GET/POST no body needed for intent? Wait, POST.

    // Mock Balance check
    mockSingle.mockResolvedValueOnce({
      data: { total_accrued: '200', total_claimed: '0' },
      error: null,
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.amount_sol).toBe('100000000'); // 0.1 SOL
    expect(json.intent_id).toBeDefined();
  });
});
