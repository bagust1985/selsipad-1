import { Chain } from '@selsipad/shared';

/**
 * Chain Adapter Interface
 * Unified interface for interacting with different blockchains
 */
export interface IChainAdapter {
    chainId: string;
    chainType: 'EVM' | 'SOLANA';

    /**
     * Build unsigned transaction
     */
    buildTx(params: BuildTxParams): Promise<UnsignedTx>;

    /**
     * Send signed transaction to network
     */
    sendTx(signedTx: SignedTx): Promise<TxHash>;

    /**
     * Wait for transaction finality
     */
    waitForFinality(txHash: TxHash, confirmations?: number): Promise<TxReceipt>;

    /**
     * Get current block height
     */
    getBlockHeight(): Promise<number>;

    /**
     * Get transaction receipt
     */
    getTxReceipt(txHash: TxHash): Promise<TxReceipt | null>;
}

export interface BuildTxParams {
    from: string;
    to: string;
    value?: string;
    data?: string;
    gas?: string;
}

export interface UnsignedTx {
    from: string;
    to: string;
    value?: string;
    data?: string;
    chainId?: string;
    nonce?: number;
    gas?: string;
    gasPrice?: string;
}

export interface SignedTx {
    raw: string;
    hash: string;
}

export type TxHash = string;

export interface TxReceipt {
    txHash: string;
    blockNumber: number;
    status: 'success' | 'failed';
    from: string;
    to: string;
    gasUsed?: string;
    logs?: any[];
}

/**
 * Chain Adapter Factory
 */
export function getChainAdapter(chain: Chain): IChainAdapter {
    if (chain.startsWith('EVM')) {
        return new EVMAdapter(chain);
    } else if (chain.startsWith('SOLANA')) {
        return new SolanaAdapter(chain);
    }
    throw new Error(`Unsupported chain: ${chain}`);
}

/**
 * EVM Chain Adapter (using viem)
 */
export class EVMAdapter implements IChainAdapter {
    chainId: string;
    chainType: 'EVM' = 'EVM';

    constructor(chain: Chain) {
        // Map chain to actual chain ID
        const chainIdMap: Record<string, string> = {
            'EVM_1': '1',
            'EVM_56': '56',
            'EVM_137': '137',
            'EVM_97': '97'
        };
        this.chainId = chainIdMap[chain] || '1';
    }

    async buildTx(params: BuildTxParams): Promise<UnsignedTx> {
        // TODO: Implement with viem
        return {
            from: params.from,
            to: params.to,
            value: params.value || '0',
            data: params.data || '0x',
            chainId: this.chainId
        };
    }

    async sendTx(signedTx: SignedTx): Promise<TxHash> {
        // TODO: Implement with viem publicClient.sendRawTransaction
        console.log('Sending EVM tx:', signedTx.hash);
        return signedTx.hash;
    }

    async waitForFinality(txHash: TxHash, confirmations = 12): Promise<TxReceipt> {
        // TODO: Implement with viem publicClient.waitForTransactionReceipt
        return {
            txHash,
            blockNumber: 0,
            status: 'success',
            from: '0x',
            to: '0x'
        };
    }

    async getBlockHeight(): Promise<number> {
        // TODO: Implement with viem publicClient.getBlockNumber
        return 0;
    }

    async getTxReceipt(txHash: TxHash): Promise<TxReceipt | null> {
        // TODO: Implement with viem publicClient.getTransactionReceipt
        return null;
    }
}

/**
 * Solana Chain Adapter (using @solana/web3.js)
 */
export class SolanaAdapter implements IChainAdapter {
    chainId: string;
    chainType: 'SOLANA' = 'SOLANA';

    constructor(chain: Chain) {
        this.chainId = chain === 'SOLANA' ? 'mainnet-beta' : 'devnet';
    }

    async buildTx(params: BuildTxParams): Promise<UnsignedTx> {
        // TODO: Implement with @solana/web3.js Transaction
        return {
            from: params.from,
            to: params.to,
            value: params.value || '0'
        };
    }

    async sendTx(signedTx: SignedTx): Promise<TxHash> {
        // TODO: Implement with Connection.sendRawTransaction
        console.log('Sending Solana tx:', signedTx.hash);
        return signedTx.hash;
    }

    async waitForFinality(txHash: TxHash, confirmations = 32): Promise<TxReceipt> {
        // TODO: Implement with Connection.confirmTransaction
        return {
            txHash,
            blockNumber: 0,
            status: 'success',
            from: '',
            to: ''
        };
    }

    async getBlockHeight(): Promise<number> {
        // TODO: Implement with Connection.getSlot
        return 0;
    }

    async getTxReceipt(txHash: TxHash): Promise<TxReceipt | null> {
        // TODO: Implement with Connection.getTransaction
        return null;
    }
}
