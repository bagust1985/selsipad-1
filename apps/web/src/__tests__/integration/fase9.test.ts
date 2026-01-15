/**
 * FASE 9 Integration Tests
 * Trending Engine Logic & API
 */

import { createClient } from '@/lib/supabase/server';
import { runTrendingAggregator } from '../../../../../services/worker/jobs/trending-aggregator';

// Mock Dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('FASE 9: Trending Engine', () => {
  // Mock implementations...
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    require('@/lib/supabase/server').createClient.mockReturnValue(mockSupabase);
    require('@supabase/supabase-js').createClient.mockReturnValue(mockSupabase);
  });

  test('Aggregator Logic: Verified Only + Weighting', async () => {
    // Arrange: Mock Data
    const mockPosts = [
      {
        id: '1',
        project_id: 'proj-A',
        type: 'POST',
        author_id: 'u1',
        profiles: { bluecheck_status: 'VERIFIED' },
      },
      {
        id: '2',
        project_id: 'proj-A',
        type: 'REPLY',
        author_id: 'u2',
        profiles: { bluecheck_status: 'ACTIVE' },
      },
      {
        id: '3',
        project_id: 'proj-B',
        type: 'POST',
        author_id: 'u3',
        profiles: { bluecheck_status: 'NONE' },
      }, // Ignored
    ];

    // Build chain mock
    const select = jest.fn();
    const gt = jest.fn();
    const not = jest.fn();
    const filter = jest.fn();
    const insert = jest.fn();
    const single = jest.fn();

    mockSupabase.from.mockReturnValue({ select, insert });
    select.mockReturnValue({ gt });
    gt.mockReturnValue({ not });
    not.mockReturnValue({ not }); // Chain
    not.mockReturnValue({ filter });
    filter.mockResolvedValue({ data: mockPosts, error: null });

    insert.mockReturnValue({
      select: jest
        .fn()
        .mockReturnValue({ single: () => ({ data: { id: 'snap-1' }, error: null }) }),
    });

    // Act
    await runTrendingAggregator();

    // Assert
    // Proj-A: 1 Post (10) + 1 Reply (1) = 11 pts
    // Proj-B: Ignored (0 pts)

    expect(insert).toHaveBeenCalledTimes(2); // Snapshot + Projects

    // Check Project Insert
    const projectInsertCall = insert.mock.calls.find(
      (call) => Array.isArray(call[0]) && call[0][0].project_id
    );
    const projects = projectInsertCall[0];

    expect(projects).toHaveLength(1);
    expect(projects[0].project_id).toBe('proj-A');
    expect(projects[0].score).toBe(11);
  });

  test('API Endpoint: Returns Cached Snapshot', async () => {
    const { GET } = require('../../../../app/api/v1/trending/route');

    // Mock Snapshot fetch
    const select = jest.fn();
    const order = jest.fn();
    const limit = jest.fn();
    const single = jest.fn();
    const eq = jest.fn();

    mockSupabase.from.mockReturnValue({ select });
    select.mockReturnValue({ order, eq });
    order.mockReturnValue({ limit });
    limit.mockReturnValue({ single });

    // Snapshot
    single.mockResolvedValueOnce({ data: { id: 'snap-1' } });

    // Projects
    limit.mockResolvedValueOnce({ data: [{ project_id: 'p1', rank: 1 }] });

    const res = await GET({} as any);
    const json = await res.json();

    expect(json.trending).toHaveLength(1);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=60');
  });
});
