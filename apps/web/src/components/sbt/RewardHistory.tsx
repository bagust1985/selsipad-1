'use client';

import React, { useState, useEffect } from 'react';
import type { SbtClaimStatus } from '@selsipad/shared';

export default function RewardHistory() {
  const [history, setHistory] = useState<any>(null); // Replace with strict type
  const [loading, setLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/sbt/history'); // Need to implement this endpoint!
      // Placeholder since endpoint doesn't exist yet in Task list Phase 8.3
      // Wait, Plan Phase 8.3 didn't list GET history explicitly in Task MD, but Plan Document in Phase 8 spec mentioned it.
      // I should implement GET history endpoint too if missing.
      // For now, assume mock empty.
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimIntent = async () => {
    setLoading(true);
    setClaimStatus('Initiating Claim...');
    try {
      // 1. Intent
      const intentRes = await fetch('/api/v1/sbt/claim/intent', { method: 'POST' });
      const intent = await intentRes.json();

      if (intent.error) throw new Error(intent.error);

      // 2. Mock Pay Fee ($10)
      const feeTx = `mock_fee_tx_${Date.now()}`;
      setClaimStatus(`Please pay $10 to ${intent.treasury_address}... (Mocking payment)`);

      await new Promise((r) => setTimeout(r, 1000));

      // 3. Confirm
      const confirmRes = await fetch('/api/v1/sbt/claim/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent_id: intent.intent_id,
          fee_tx_hash: feeTx,
        }),
      });
      const confirm = await confirmRes.json();

      if (confirm.error) throw new Error(confirm.error);

      setClaimStatus(`Claim Confirmed! ID: ${confirm.claim_id}`);
    } catch (err: any) {
      setClaimStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg border border-gray-700 mt-6">
      <h2 className="text-2xl font-bold mb-4">Rewards & Claims</h2>

      <div className="flex justify-between items-center bg-gray-800 p-4 rounded mb-6">
        <div>
          <p className="text-gray-400 text-sm">Claimable Balance</p>
          <p className="text-3xl font-bold text-green-400">-- SBT_REWARD</p>
          {/* Need to fetch balance */}
        </div>
        <button
          onClick={handleClaimIntent}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
        >
          {loading ? 'Processing...' : 'Claim Rewards ($10 Fee)'}
        </button>
      </div>

      {claimStatus && (
        <div className="p-4 bg-gray-800 rounded border border-purple-500 mb-4 animate-pulse">
          {claimStatus}
        </div>
      )}

      <h3 className="font-semibold mb-3">Claim History</h3>
      <div className="text-gray-500 text-sm italic">No history fetching implemented yet.</div>
    </div>
  );
}
