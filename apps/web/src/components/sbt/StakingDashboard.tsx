'use client';

import React, { useState, useEffect } from 'react';
import type { SbtRule, SbtStake } from '@selsipad/shared';

export default function StakingDashboard() {
  const [wallet, setWallet] = useState('');
  const [eligibility, setEligibility] = useState<{
    eligible_rules: any[];
    total_eligible: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch Eligibility
  const checkEligibility = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/sbt/eligibility?wallet=${wallet}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEligibility(data);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stake Action
  const handleStake = async (ruleId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sbt/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId, wallet_address: wallet }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(`Success: ${data.message} (ID: ${data.stake_id})`);
      // Refresh stakes... (Mock refresh)
    } catch (err: any) {
      setMessage(`Stake Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">SBT Staking Dashboard</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Connect Wallet (Mock Input)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Enter wallet address (e.g. valid_sol_...)"
            className="flex-1 bg-gray-800 border border-gray-600 rounded p-2"
          />
          <button
            onClick={checkEligibility}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-medium"
          >
            Check Eligibility
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-gray-800 border-l-4 border-yellow-500">{message}</div>
      )}

      {eligibility && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Eligible Rules ({eligibility.total_eligible})</h3>
          {eligibility.eligible_rules.length === 0 ? (
            <p className="text-gray-400">No eligible SBT rules found for this wallet.</p>
          ) : (
            <div className="grid gap-4">
              {eligibility.eligible_rules.map((item: any) => (
                <div
                  key={item.rule_id}
                  className="p-4 bg-gray-800 rounded flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-lg">{item.collection}</span>
                    <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded uppercase">
                      {item.chain}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStake(item.rule_id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm"
                  >
                    Stake Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
