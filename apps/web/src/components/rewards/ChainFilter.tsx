/**
 * Chain Filter Component
 * Filter selector for multi-chain rewards
 */

'use client';

interface ChainFilterProps {
  chains: string[];
  selectedChain: string;
  onChainChange: (chain: string) => void;
}

export function ChainFilter({ chains, selectedChain, onChainChange }: ChainFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onChainChange('ALL')}
        className={`px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${
          selectedChain === 'ALL'
            ? 'bg-primary-main text-primary-text'
            : 'bg-bg-elevated text-text-secondary hover:bg-bg-elevated-hover'
        }`}
      >
        All Chains
      </button>
      {chains.map((chain) => (
        <button
          key={chain}
          onClick={() => onChainChange(chain)}
          className={`px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${
            selectedChain === chain
              ? 'bg-primary-main text-primary-text'
              : 'bg-bg-elevated text-text-secondary hover:bg-bg-elevated-hover'
          }`}
        >
          {chain}
        </button>
      ))}
    </div>
  );
}
