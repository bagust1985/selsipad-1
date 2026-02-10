Prompt — Implement Opsi A: Escrow release ke PresaleRound + finalizeSuccessEscrow (idempotent)

Context
Kita punya bug presale: PresaleRound.finalizeSuccess() revert karena memanggil safeTransferFrom(projectOwner, ...), sementara token ada di EscrowVault. Akibatnya presale tidak finalize, status masih ACTIVE, dan BNB stuck di presale contract.

Kita butuh solusi Opsi A: token dilepas dari escrow langsung ke PresaleRound contract, lalu admin panggil finalize versi baru yang:

tidak butuh approval/aksi dari projectOwner

mengerjakan token settlement (fund vesting + burn unsold) dari balance PresaleRound

mengerjakan BNB distribution (fee + net)

update status FINALIZED_SUCCESS

idempotent: bisa dipanggil setelah manual step (mis. vesting already funded atau merkle root already set) tanpa revert

Goal

Implement finalizeSuccessEscrow(...) pada PresaleRound.sol (atau module terkait) untuk menyelesaikan presale sukses tanpa transferFrom(projectOwner).

Requirements
A. EscrowVault integration

Kita butuh cara untuk release token dari escrow ke round contract sebelum finalize.

Cek interface EscrowVault yang ada sekarang. Pilih salah satu:

Jika ada release(projectId, to) atau releaseTo(projectId, to, amount) → gunakan itu.

Jika hanya ada release ke admin → tambahkan fungsi baru yang aman: releaseToRound(projectId, round, amount) atau release(projectId, to, amount).

Security:

Hanya ADMIN_ROLE / factory / round yang valid boleh memerintahkan release.

Pastikan amount yang release tidak melebihi deposit escrow.

Emit event EscrowReleased(projectId, to, token, amount).

Output minimum: pada finalize flow, token tersedia di PresaleRound balance untuk dipakai transfer ke vesting dan burn.

B. finalizeSuccessEscrow() behavior

Tambahkan function baru:

Signature (suggested)

function finalizeSuccessEscrow(
bytes32 merkleRoot,
uint256 totalVestingAllocation,
uint256 unsoldToBurn
) external onlyRole(ADMIN_ROLE) nonReentrant;

Jika root disiapkan off-chain, parameter root dikirim saat finalize.
Kalau merkleRoot sudah diset sebelumnya (manual), maka function harus skip set root.

Hard requirements

Status gating

Round harus ENDED terlebih dahulu (jika ada mekanisme \_syncStatus(), panggil internal sync).

Pastikan raised >= softcap, dan endTime telah lewat.

Prevent double finalize (mis. status sudah FINALIZED_SUCCESS).

Token settlement — no projectOwner

Kontrak TIDAK boleh melakukan safeTransferFrom(projectOwner, ...) sama sekali.

Semua token transfer dilakukan dari IERC20(projectToken).balanceOf(address(this)).

Fund vesting vault (idempotent)

Vesting vault address: vestingVault (MerkleVesting).

Jika vault balance < totalVestingAllocation, top up difference:

token.safeTransfer(vestingVault, diff)

Jika vault sudah cukup, skip.

Set merkle root (idempotent)

Jika MerkleVesting(vestingVault).merkleRoot() == 0, call:

setMerkleRoot(merkleRoot, totalVestingAllocation)

Jika sudah non-zero, skip (jangan revert).

Burn unsold token (idempotent)

Burn address: 0x000000000000000000000000000000000000dEaD

Jika unsoldToBurn > 0, dan round token balance cukup:

token.safeTransfer(dead, unsoldToBurn)

Jika sudah pernah diburn (cek via flag/ledger) atau balance kurang, jangan “silent success”: revert dengan custom error yang jelas atau burn only up to available (pilih 1 dan konsisten).

Rekomendasi: revert kalau balance kurang agar akuntansi jelas.

BNB distribution

Fee 5% dari totalRaised (atau sesuai konfigurasi).

Panggil FeeSplitter distributeFeeNative{value: fee}() dari presale contract (ideal), lalu transfer net ke projectOwner/beneficiary.

Pastikan BNB di contract setelah finalize menjadi 0 (atau hanya sisa dust).

Emit event FinalizedSuccessEscrow(roundId, fee, net, vestingFunded, burned).

Update status

Set status = FINALIZED_SUCCESS.

Emit event status updated.

C. Idempotency / replay protection

Kita butuh finalize bisa “resume” tanpa revert bila sebagian step sudah done.
Implement flags:

bool bnbDistributed;

bool unsoldBurned; (atau track burnedAmount)

bool statusFinalized; (or rely on status enum)
Vesting set root bisa dicek langsung via merkleRoot != 0.

D. Scripts (Hardhat)

Buat script finalize-presale-escrow.ts:

Load round address, escrow address, token address, vestingVault

Compute:

totalVestingAllocation (sum allocation)

unsoldToBurn (formula presale)

merkleRoot (from merkle builder)

Call:

escrow.releaseTo(roundAddress, totalTokenNeeded) (token needed = (topUpForVesting + unsoldToBurn + any other), optionally only topUp+burn)

round.finalizeSuccessEscrow(merkleRoot, totalVestingAllocation, unsoldToBurn)

Post-check asserts:

round.status == FINALIZED_SUCCESS

FeeSplitter got fee

projectOwner got net

vestingVault has enough tokens

Merkle root set

unsold burned (balance of dead increased)

round native balance ~ 0

E. Tests (Hardhat)

Add tests replicating production flow:

Test: presale escrow finalize success

Setup: tokens deposited to escrow, projectOwner has 0 token

Investors contribute BNB to round

Time travel past endTime

Release from escrow to round

Call finalizeSuccessEscrow

Assertions listed in scripts above

Regression test

Calling legacy finalizeSuccess should revert in this scenario (documented), while escrow finalize works.

Notes / constraints

If MerkleVesting.setMerkleRoot() reverts because vault balance insufficient, ensure finalize funds it first.

Merkle leaf encoding includes address(this), chainid, scheduleSalt, etc — ensure merkle root builder matches.

Avoid reentrancy on native transfers (use call pattern; keep nonReentrant).

Emit custom errors for clarity: NotEnded, NotSuccessful, InsufficientTokenBalanceForSettlement, AlreadyFinalized, etc.

Deliverables

Updated PresaleRound.sol with finalizeSuccessEscrow() and flags/events

Updated/extended EscrowVault interface/contract to allow releasing to round

Hardhat script: finalize-presale-escrow.ts

Unit tests for escrow-based finalize
