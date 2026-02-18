Fix Fairlaunch E2E Flow (BSC Testnet) — Complete Audit
DB + On-Chain + Code Audit Summary
DB State
Field Value
Project FAIRLAUNCH SUKSES (FLS)
Round ID b4c48c54
DB Status DEPLOYED
Chain 97 (BSC Testnet)
Contract 0xF0F7A2FC8636388561ea19fea9fA33F93b75718D
Token 0xC5f542... (FLS, 720K in contract)
Vesting 0x11e9cA...
Total Raised 0 BNB, 0 participants
Start/End Feb 17 11:32–12:32 UTC (already passed)
On-Chain State
Field Value
status (stored) 0 = UPCOMING
getStatus()
(dynamic) ENDED (since endTime passed)
softcap 2.0 BNB
tokensForSale 400,000
token balance 720,000 (400K sale + 320K liquidity) ✅
lpLocker 0xd15Fb6... ✅
projectOwner 0xAe6655... ✅
NOTE

The stored status=0 is expected! Fairlaunch uses lazy status updates — \_updateStatus() is called inside
contribute()
/
finalize()
to transition UPCOMING→LIVE→ENDED. The status() public variable returns the stale stored value, while
getStatus()
returns the real-time dynamic status.

Bugs Found
Bug 1: Contribution Form Uses Wrong ABI (CRITICAL) 🔴
ParticipationForm.tsx
always calls presale ABI:

diff

- // Presale ABI: contribute(uint256 amount, address referrer)
- abi: PRESALE_ROUND_ABI, functionName: 'contribute', args: [amount, referrer]

* // Fairlaunch ABI: contribute() payable — no args, BNB sent as msg.value
* abi: FAIRLAUNCH_ABI, functionName: 'contribute', value: amountWei
  The correct
  useFairlaunchContribute
  hook exists at @/hooks/useFairlaunchContribute.ts but is never imported by the form. This is why the deployed fairlaunch has 0 contributions — every attempt reverted because the ABI doesn't match.

Bug 2: Chain Field Parsing (LOW)
Line 142 in
deploy route
:

parseInt(launchRound.chain_id || launchRound.chain || '97')
DB column is
chain
(value "97"), not chain_id. Works accidentally via fallback for testnet.

Proposed Changes
[MODIFY]
ParticipationForm.tsx
Import
useFairlaunchContribute
from @/hooks/useFairlaunchContribute
Import saveFairlaunchContribution from @/actions/fairlaunch/save-contribution
Branch
handleSubmit
by projectType:
presale → existing presaleContribute() + savePresaleContribution()
fairlaunch → fairlaunchContribute() + saveFairlaunchContribution()
Update loading state to check both hooks
[MODIFY]
route.ts
Fix chain field: parseInt(launchRound.chain || '97') (remove chain_id)
Verification Plan
Build to verify no compile errors
Submit new test fairlaunch on BSC Testnet
Admin approve + deploy via UI
Wait for startTime → test contribution with wallet
Verify on-chain totalRaised increments

Comment
Ctrl+Alt+M
