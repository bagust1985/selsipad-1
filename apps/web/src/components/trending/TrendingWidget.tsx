'use client';

import React, { useState, useEffect } from 'react';

export default function TrendingWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/trending')
      .then((res) => res.json())
      .then((json) => {
        if (json.trending) setData(json.trending);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 bg-gray-900 rounded animate-pulse h-48"></div>;
  if (!data.length)
    return <div className="p-4 bg-gray-900 rounded text-gray-500">No trending data yet.</div>;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <span className="text-red-500 text-xl">🔥</span>
        <h3 className="font-bold text-white">Trending Projects (24h)</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {data.map((item) => (
          <div
            key={item.project?.id || item.rank}
            className="p-3 hover:bg-gray-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-gray-500 w-6 text-center">{item.rank}</span>
              {item.project?.logo_url ? (
                <img
                  src={item.project.logo_url}
                  className="w-8 h-8 rounded-full bg-gray-700"
                  alt={item.project.symbol}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                  ?
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-white">
                  {item.project?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-400">${item.project?.symbol || '---'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-blue-400">{item.score} pts</div>
              <div className="text-xs text-gray-500">{item.post_count_24h} posts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
