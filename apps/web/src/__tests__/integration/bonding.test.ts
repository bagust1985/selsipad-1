/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createMocks } from 'node-mocks-http';
import { POST as deployIntentHandler } from '../../../app/api/v1/bonding/[pool_id]/deploy/intent/route';
import { POST as swapIntentHandler } from '../../../app/api/v1/bonding/[pool_id]/swap/intent/route';

// Mock the module with inline factory to avoid hoisting issues
jest.mock('@/lib/supabase/server', () => {
  // Define shared query builder mock
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: null, error: null });
    }),
    maybeSingle: jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: null, error: null });
    }),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  };

  // Define singleton mock instance
  const mockSupabaseInstance = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn(),
  };

  const createClientMock = jest.fn(() => mockSupabaseInstance);
  // Attach query builder to the mock function for easy access in tests
  (createClientMock as unknown as { mockQueryBuilder: typeof mockQueryBuilder }).mockQueryBuilder =
    mockQueryBuilder;

  return {
    __esModule: true,
    createClient: createClientMock,
  };
});

// Import to access mocks
import { createClient } from '@/lib/supabase/server';

describe('Bonding Curve API Integration Tests', () => {
  const userId = 'user_123';
  const poolId = 'pool_123';

  // Helper to access query builder
  const getMockQueryBuilder = () =>
    (createClient as unknown as { mockQueryBuilder: any }).mockQueryBuilder;

  // Helper to access the mock instance (it's the same instance every time now)
  const getMockSupabase = () => (createClient as jest.Mock)();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset implementations to defaults if needed, but jest.mock factory sets them.
    // However, implementation overrides in tests persist if not cleared.
    // jest.clearAllMocks() clears calls, not implementations.
    // We should reset single() to default.
    getMockQueryBuilder().single.mockImplementation(() => {
      return Promise.resolve({ data: null, error: null });
    });

    const supabase = getMockSupabase();
    // Default auth mock
    (supabase.auth.getUser as jest.Mock).mockImplementation(() => {
      // console.log('Mock getUser called. Returning user:', userId);
      return Promise.resolve({
        data: { user: { id: userId } },
        error: null,
      });
    });
  });

  describe('Deploy Intent Flow', () => {
    it('should generate deploy intent for DRAFT pool', async () => {
      // console.log('Test: should generate deploy intent');
      const mockQueryBuilder = getMockQueryBuilder();

      // Mock pool query returning DRAFT pool owned by user
      mockQueryBuilder.single.mockImplementation(() => {
        return Promise.resolve({
          data: { id: poolId, status: 'DRAFT', creator_id: userId },
          error: null,
        });
      });

      // Mock intent insert is chained after insert().select()
      // We need to ensure insert() returns THIS (it does), select() returns THIS (it does).
      // But wait! insert() usually returns a Builder too.
      // And we are mocking `single()` on the SAME builder.
      // So calling `insert().select().single()` will trigger our `single` mock above!
      // BUT `single` above returns the POOL.
      // The INSERT should return the INTENT.

      // ISSUE: Single mock serves BOTH `from('pools')...single()` AND `from('events').insert()...single()`.
      // We need `mockImplementationOnce`.
      // The Logic calls:
      // 1. Get Pool -> calls single().
      // 2. Insert Event -> insert().(no single for event insert? line 64: insert({...}))?
      // Wait, let's check route.ts line 64:
      // await supabase.from('bonding_events').insert({...}); (It waits promise).

      // It does NOT call single() on insert.
      // My previous test was checking intent insert?

      // Line 64: `await supabase.from('bonding_events').insert({...})`.
      // `insert` mock returns `this` (mockQueryBuilder).
      // We must make `insert` return something awaitable or Promise-like if awaited directly?
      // Supabase `insert` returns `PostgrestFilterBuilder` which is Thenable.
      // If `insert` returns `this`, effectively it returns `mockQueryBuilder`.
      // Is `mockQueryBuilder` Thenable? No. It has methods.
      // Does it have `then`? No.

      // If code awaits `insert(...)`, and it returns `mockQueryBuilder` (object), `await object` resolves to object immediately.
      // This is VALID JS. It won't crash.

      // So route.ts line 64 awaits the builder object. Does nothing.

      // HOWEVER, the test asserted `data.intent_id` is defined.
      // The route returns `intent_id` generated in JS (line 57).
      // It does NOT return DB result.

      // So insert mock is fine as is (fire and forget).

      // Test code:
      // expect(data.intent_id).toBeDefined();

      const { req } = createMocks({
        method: 'POST',
        url: `/api/v1/bonding/${poolId}/deploy/intent`,
        body: { pool_id: poolId },
      });
      // Polyfill json() for App Router
      req.json = jest.fn().mockResolvedValue(req.body);

      // Allow reading params from the request object in Next.js App Router style
      // Note: In real App Router, params are passed as 2nd arg to handler
      const response = await deployIntentHandler(req as unknown as NextRequest, {
        params: { pool_id: poolId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent_id).toBeDefined();
      expect(data.required_amount_lamports).toBe('500000000'); // 0.5 SOL
    });

    it('should reject deploy if user is not creator', async () => {
      getMockQueryBuilder().single.mockResolvedValue({
        data: { id: poolId, status: 'DRAFT', creator_id: 'other_user' },
        error: null,
      });

      const { req } = createMocks({
        method: 'POST',
      });
      req.json = jest.fn().mockResolvedValue({});

      const response = await deployIntentHandler(req as unknown as NextRequest, {
        params: { pool_id: poolId },
      });

      expect(response.status).toBe(403);
    });

    it('should reject deploy if pool not in DRAFT status', async () => {
      getMockQueryBuilder().single.mockResolvedValue({
        data: { id: poolId, status: 'LIVE', creator_id: userId },
        error: null,
      });

      const { req } = createMocks({
        method: 'POST',
      });
      req.json = jest.fn().mockResolvedValue({});

      const response = await deployIntentHandler(req as unknown as NextRequest, {
        params: { pool_id: poolId },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Swap Intent Flow', () => {
    it('should calculate swap output correctly', async () => {
      const mockQueryBuilder = getMockQueryBuilder();

      // Mock LIVE pool
      // Note: Swap intent calls pool query.
      mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: poolId,
          status: 'LIVE',
          virtual_sol_reserves: '10000000000', // 10 SOL
          virtual_token_reserves: '500000000000000', // 500M tokens
          swap_fee_bps: 150,
        },
        error: null,
      });

      // Mock insert is fired and forgotten usually.
      // But verify if it calls single()?
      // The swap intent route might insert and return the inserted data?
      // Let's assume it doesn't need return value for now as per error logs (400)
      // 400 means something else.

      const { req } = createMocks({
        method: 'POST',
        body: {
          swap_type: 'BUY',
          input_amount: '100000000', // 0.1 SOL
        },
      });
      // JSON parsing mock if needed, but node-mocks-http handles body Usually
      // In Next.js App Router, request.json() is async.
      req.json = jest.fn().mockResolvedValue({
        swap_type: 'BUY',
        input_amount: '100000000',
      });

      const response = await swapIntentHandler(req as unknown as NextRequest, {
        params: { pool_id: poolId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.estimated_output).toBeDefined();
      expect(BigInt(data.estimated_output)).toBeGreaterThan(0n);
      // Verify fee split
      expect(data.swap_fee).toBeDefined();
      expect(data.treasury_fee).toBeDefined();
      expect(BigInt(data.treasury_fee) + BigInt(data.referral_pool_fee)).toBe(
        BigInt(data.swap_fee)
      );
    });
  });

  // We can add confirm swap tests here too...
});
