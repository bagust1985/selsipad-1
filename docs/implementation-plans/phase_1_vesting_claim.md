Phase 1: Vesting Claim API - Implementation Walkthrough
Summary
✅ Backend: Complete
⚠️ Frontend: Needs updates
📋 Status: 80% Complete

What Was Implemented

1. Claim Calculation Utilities ✅
   File:
   lib/vesting/claim-utils.ts

Functions:

calculateClaimableAmount()

- Core calculation logic
  TGE unlock (0-100%)
  Cliff period handling
  Linear vesting (daily/monthly intervals)
  Already claimed deduction
  calculateNextUnlock()
- When and how much unlocks next
  generateClaimIdempotencyKey()
- Hourly bucket protection
  Example Usage:

const result = calculateClaimableAmount(allocation, schedule);
// Returns:
// {
// claimable: 1500n,
// claimableFormatted: "1500",
// nextUnlock: {
// amount: 500n,
// unlockAt: Date,
// daysUntil: 15
// },
// vestingProgress: {
// total: 10000n,
// claimed: 2500n,
// unlocked: 4000n,
// locked: 6000n,
// percentUnlocked: 40
// }
//} 2. Claimable Amount API ✅
Endpoint: GET /api/vesting/[allocationId]/claimable

File:
app/api/vesting/[allocationId]/claimable/route.ts

Features:

✅ Session authentication
✅ Allocation ownership verification
✅ Real-time claimable calculation
✅ Next unlock info
✅ Vesting progress stats
Request:

GET /api/vesting/abc-123/claimable
Authorization: Bearer <session_token>
Response:

{
"success": true,
"data": {
"allocationId": "abc-123",
"claimable": "1500",
"nextUnlock": {
"amount": "500",
"unlockAt": "2026-02-01T00:00:00Z",
"daysUntil": 15
},
"vestingProgress": {
"total": "10000",
"claimed": "2500",
"unlocked": "4000",
"locked": "6000",
"percentUnlocked": 40
},
"schedule": {
"tgePercentage": 25,
"tgeAt": "2026-01-15T00:00:00Z",
"cliffMonths": 6,
"vestingMonths": 12,
"intervalType": "MONTHLY"
}
}
} 3. Claim Execution API ✅
Endpoint: POST /api/vesting/claim

File:
app/api/vesting/claim/route.ts

Features:

✅ Ownership verification
✅ Amount validation
✅ Idempotency protection (hourly buckets)
✅ Claim record creation
✅ Allocation update
⚠️ Blockchain tx (mocked for now)
Request:

POST /api/vesting/claim
Content-Type: application/json
{
"allocationId": "abc-123",
"amount": "1500"
}
Response Success:

{
"success": true,
"data": {
"claimId": "claim-456",
"amount": "1500",
"txHash": "0x...",
"status": "CONFIRMED",
"newClaimedTotal": "4000",
"remainingClaimable": "0"
}
}
Response Error (Duplicate):

{
"success": false,
"error": "Duplicate claim detected (hourly limit)",
"existingClaim": {
"id": "claim-123",
"status": "CONFIRMED",
"amount": "1500"
}
}
Frontend Integration Needed ⚠️
Update Required: VestingClaimPanel
File:
src/components/vesting/VestingClaimPanel.tsx

Changes Needed:

Add allocationId prop:
interface VestingClaimPanelProps {
allocationId: string; // ADD THIS
roundId: string;
userAddress?: string;
schedule?: { ... };
}
Update
fetchAllocation
function:
const fetchAllocation = async () => {
try {
// Fetch claimable from new API
const res = await fetch(`/api/vesting/${allocationId}/claimable`);
if (res.ok) {
const data = await res.json();
setClaimable(Number(data.data.claimable) || 0);
// Store nextUnlock info
setNextUnlock(data.data.nextUnlock);
}
} catch (err) {
console.error('Failed to fetch claimable:', err);
} finally {
setLoading(false);
}
};
Update
handleClaim
function:
const handleClaim = async () => {
if (!userAddress || claimable <= 0) return;
setClaiming(true);
setError(null);
setSuccess(false);
try {
const res = await fetch('/api/vesting/claim', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
allocationId,
amount: claimable.toString(),
}),
});
if (!res.ok) {
const errorData = await res.json();
throw new Error(errorData.error || 'Failed to claim');
}
const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || 'Claim failed');
    }
    setSuccess(true);
    await fetchAllocation(); // Refresh

} catch (err: any) {
setError(err.message || 'Failed to claim tokens');
} finally {
setClaiming(false);
}
};
Add Next Unlock Display:
{nextUnlock && claimable === 0 && remainingTokens > 0 && (

  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
    <div className="text-sm text-gray-400 mb-1">Next Unlock</div>
    <div className="text-2xl font-bold text-white">
      {Number(nextUnlock.amount).toLocaleString()} tokens
    </div>
    <div className="text-xs text-blue-400 mt-1">
      in {nextUnlock.daysUntil} days ({new Date(nextUnlock.unlockAt).toLocaleDateString()})
    </div>
  </div>
)}
Testing
Manual Test Steps
Setup Test Data:
-- Create test allocation with past TGE
INSERT INTO vesting_schedules (
  round_id, token_address, chain, total_tokens,
  tge_percentage, tge_at, cliff_months, vesting_months, interval_type, status
) VALUES (
  'round-123', '0xTOKEN', 'bsc', '10000000000000000000000', -- 10,000 tokens
  25, '2026-01-01T00:00:00Z', 6, 12, 'MONTHLY', 'CONFIRMED'
);
-- Create allocation for test user
INSERT INTO vesting_allocations (
  schedule_id, round_id, user_id, allocation_tokens, claimed_tokens
) VALUES (
  'schedule-id', 'round-123', 'user-id', '10000000000000000000000', '0'
);
Test Claimable Calculation:
# Should return TGE amount (25% = 2,500 tokens)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/vesting/ALLOCATION_ID/claimable
Test Claim Execution:
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"allocationId":"ALLOCATION_ID","amount":"2500"}' \
  http://localhost:3000/api/vesting/claim
Verify Database:
-- Check claim record created
SELECT * FROM vesting_claims WHERE allocation_id = 'ALLOCATION_ID';
-- Check allocation updated
SELECT claimed_tokens FROM vesting_allocations WHERE id = 'ALLOCATION_ID';
-- Should show: '2500000000000000000000'
Test Idempotency:
# Try to claim again within same hour - should fail
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"allocationId":"ALLOCATION_ID","amount":"1000"}' \
  http://localhost:3000/api/vesting/claim
# Expected error: "Duplicate claim detected (hourly limit)"
Known Limitations
1. Blockchain Transaction Mocked
Current: Mock tx hash generated
TODO: Integrate with real blockchain tx manager
File: 
app/api/vesting/claim/route.ts
 line 99

// TODO: Execute blockchain transaction here
const txHash = `0x${Date.now().toString(16)}`; // Mock
Real Implementation:

// Use transaction manager
const tx = await transactionManager.createTransaction({
action: 'VESTING_CLAIM',
params: {
contract:schedule.contract_address,
method: 'claim',
args: [allocationId, requestedAmount],
},
});
await tx.execute();
const txHash = tx.hash; 2. Wallet Address from Session
Current: Using session.address || 'UNKNOWN'
TODO: Properly fetch from user profile or active wallet
File:
app/api/vesting/claim/route.ts
line 90

3. External Allocation API
   Current: Component still calls /api/rounds/[id]/vesting/allocations
   TODO: Update to use new endpoint or ensure it provides allocation.id

Files Created
File Purpose Status
lib/vesting/claim-utils.ts
Calculation logic ✅ Complete
app/api/vesting/[allocationId]/claimable/route.ts
GET claimable API ✅ Complete
app/api/vesting/claim/route.ts
POST claim API ✅ Complete
Next Steps
✅ Update
VestingClaimPanel.tsx
to use new APIs
⚠️ Test with real allocation data
❌ Integrate real blockchain transactions
❌ Add claim history display
❌ Implement claim notifications
Estimated Completion: 80% (backend done, frontend needs updates)
