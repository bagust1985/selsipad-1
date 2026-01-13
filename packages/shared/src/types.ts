/**
 * Chain identifiers
 */
export type Chain =
    | 'EVM_1'      // Ethereum Mainnet
    | 'EVM_56'     // BSC Mainnet
    | 'EVM_137'    // Polygon
    | 'EVM_97'     // BSC Testnet
    | 'SOLANA'     // Solana Mainnet
    | 'SOLANA_DEVNET';

/**
 * Transaction status
 */
export type TxStatus = 'CREATED' | 'SUBMITTED' | 'PENDING' | 'CONFIRMED' | 'FAILED';

/**
 * Project status
 */
export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'ENDED';

/**
 * Blue Check status
 */
export type BlueCheckStatus = 'NONE' | 'PENDING' | 'ACTIVE' | 'VERIFIED' | 'REVOKED';

/**
 * Database types (auto-generated from Supabase later)
 */
export interface Profile {
    id: string;
    user_id: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    bluecheck_status: BlueCheckStatus;
    privacy_hide_address: boolean;
    created_at: string;
    updated_at: string;
}

export interface Wallet {
    id: string;
    user_id: string;
    chain: Chain;
    address: string;
    is_primary: boolean;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    chain: Chain;
    tx_hash?: string;
    type?: string;
    status: TxStatus;
    user_id?: string;
    project_id?: string;
    round_id?: string;
    metadata?: Record<string, any>;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    owner_user_id: string;
    name: string;
    symbol?: string;
    description?: string;
    logo_url?: string;
    banner_url?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    status: ProjectStatus;
    chains_supported: Chain[];
    created_at: string;
    updated_at: string;
}
