# Vesting & LP Lock UI Components

## Overview
Reusable React components for displaying vesting schedules, LP locks, and claiming vested tokens.

---

## Components

### 1. VestingScheduleDisplay
Displays vesting configuration details including TGE, cliff, and vesting period.

**Props:**
```typescript
interface VestingScheduleDisplayProps {
  schedule: VestingSchedule | null;
  loading?: boolean;
}
```

**Usage:**
```tsx
import { VestingScheduleDisplay } from '@/components/vesting';

// Fetch vesting schedule
const { data } = await fetch(`/api/rounds/${roundId}/vesting`);

<VestingScheduleDisplay 
  schedule={data.schedule} 
  loading={isLoading}
/>
```

**Features:**
- TGE percentage display
- Cliff period warning
- Vesting duration breakdown
- Status indicator (PENDING, CONFIRMED, FAILED)
- Loading state
- Empty state

---

### 2. LPLockDisplay
Shows liquidity lock details with progress tracking.

**Props:**
```typescript
interface LPLockDisplayProps {
  lock: LiquidityLock | null;
  daysRemaining?: number | null;
  unlockProgress?: number;
  loading?: boolean;
}
```

**Usage:**
```tsx
import { LPLockDisplay } from '@/components/vesting';

// Fetch LP lock
const { data } = await fetch(`/api/rounds/${roundId}/lock`);

<LPLockDisplay 
  lock={data.lock}
  daysRemaining={data.days_remaining}
  unlockProgress={data.unlock_progress}
  loading={isLoading}
/>
```

**Features:**
- Lock duration display
- Unlock progress bar
- Days remaining countdown
- Explorer links (chain-specific)
- 12-month minimum indicator
- Status tracking (PENDING, LOCKED, UNLOCKED, FAILED)

---

### 3. VestingClaimPanel
Interactive panel for users to claim vested tokens.

**Props:**
```typescript
interface VestingClaimPanelProps {
  roundId: string;
  userAddress?: string;
  schedule?: {
    tge_percentage: number;
    cliff_months: number;
    vesting_months: number;
    tge_at: string;
    status: string;
  };
}
```

**Usage:**
```tsx
import { VestingClaimPanel } from '@/components/vesting';

<VestingClaimPanel 
  roundId={roundId}
  userAddress={session?.address}
  schedule={vestingSchedule}
/>
```

**Features:**
- Allocation display (total, claimed, remaining)
- Claimable amount calculation
- Claim progress bar
- One-click claim button
- Success/error messaging
- Wallet connection prompt
- Loading states

---

## Example: Complete Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import { VestingScheduleDisplay, LPLockDisplay, VestingClaimPanel } from '@/components/vesting';

export function RoundAntiRugDetails({ roundId, userAddress }: { roundId: string; userAddress?: string }) {
  const [vestingData, setVestingData] = useState(null);
  const [lockData, setLockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/rounds/${roundId}/vesting`).then(r => r.json()),
      fetch(`/api/rounds/${roundId}/lock`).then(r => r.json()),
    ]).then(([vesting, lock]) => {
      setVestingData(vesting);
      setLockData(lock);
      setLoading(false);
    });
  }, [roundId]);

  return (
    <div className="space-y-6">
      {/* Vesting Schedule */}
      <VestingScheduleDisplay 
        schedule={vestingData?.schedule} 
        loading={loading}
      />

      {/* LP Lock */}
      <LPLockDisplay 
        lock={lockData?.lock}
        daysRemaining={lockData?.days_remaining}
        unlockProgress={lockData?.unlock_progress}
        loading={loading}
      />

      {/* Claim Panel (for users) */}
      {userAddress && (
        <VestingClaimPanel 
          roundId={roundId}
          userAddress={userAddress}
          schedule={vestingData?.schedule}
        />
      )}
    </div>
  );
}
```

---

## API Endpoints Used

### Vesting:
- `GET /api/rounds/[id]/vesting` - Get vesting schedule
- `GET /api/rounds/[id]/vesting/allocations` - Get user allocation
- `POST /api/rounds/[id]/vesting/claim-intent` - Create claim intent
- `POST /api/rounds/[id]/vesting/claim-confirm` - Confirm claim

### LP Lock:
- `GET /api/rounds/[id]/lock` - Get lock details with progress

---

## Styling
Components use Tailwind CSS with consistent design:
- Dark theme (gray-900 backgrounds)
- Status-based color coding (green/yellow/red)
- Gradient accents
- Responsive grid layouts
- Icon integration (lucide-react)

---

## States Handled

### Loading State
- Skeleton loaders
- Smooth transitions

### Empty State
- Clear messaging
- Action prompts

### Error State
- User-friendly error messages
- Retry suggestions

### Success State
- Confirmation messages
- Updated data display

---

## Explorer Integration

Automatic chain detection for explorer links:
- Solana → Solscan
- Ethereum → Etherscan
- BSC → BSCScan
- Polygon → PolygonScan

---

## Notes

1. **12-Month Minimum**: LP locks enforce 12-month minimum at database level
2. **Claim Authorization**: Requires wallet connection and signature
3. **Real-time Updates**: Components fetch fresh data on mount
4. **Responsive Design**: Mobile and desktop optimized
5. **Accessibility**: Proper ARIA labels and keyboard navigation

---

## Future Enhancements

- [ ] Multi-signature claim support
- [ ] Batch claim for multiple rounds
- [ ] Export claim history (CSV)
- [ ] Push notifications for unlock events
- [ ] Calendar integration for unlock dates
