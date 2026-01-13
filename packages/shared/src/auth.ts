import { createClient } from '@supabase/supabase-js';
import { verifyMessage } from 'viem';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Get Supabase client with service role (bypasses RLS)
 * CRITICAL: Only use server-side, never expose service role key to client
 */
export function getSupabaseServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Get Supabase client (respects RLS)
 */
export function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Generate a nonce for wallet signature challenge
 * @param walletAddress - Wallet address (lowercase for EVM)
 * @param chain - Chain identifier (EVM_1, EVM_56, SOLANA, etc.)
 * @returns Nonce string
 */
export async function generateNonce(
    walletAddress: string,
    chain: string
): Promise<string> {
    const supabase = getSupabaseServiceClient();
    const nonce = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const normalizedAddress = chain.startsWith('EVM')
        ? walletAddress.toLowerCase()
        : walletAddress;

    const { error } = await supabase.from('wallet_link_nonces').insert({
        wallet_address: normalizedAddress,
        chain,
        nonce,
        expires_at: expiresAt.toISOString()
    });

    if (error) {
        throw new Error(`Failed to generate nonce: ${error.message}`);
    }

    return nonce;
}

/**
 * Verify nonce is valid (not used, not expired)
 * @returns Nonce record if valid, null otherwise
 */
export async function verifyNonce(nonce: string, walletAddress: string, chain: string) {
    const supabase = getSupabaseServiceClient();

    const normalizedAddress = chain.startsWith('EVM')
        ? walletAddress.toLowerCase()
        : walletAddress;

    const { data, error } = await supabase
        .from('wallet_link_nonces')
        .select('*')
        .eq('nonce', nonce)
        .eq('wallet_address', normalizedAddress)
        .eq('chain', chain)
        .eq('used', false)
        .single();

    if (error || !data) {
        return null;
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
        return null;
    }

    return data;
}

/**
 * Mark nonce as used (prevent replay attacks)
 */
export async function markNonceUsed(nonceId: string) {
    const supabase = getSupabaseServiceClient();

    await supabase
        .from('wallet_link_nonces')
        .update({ used: true })
        .eq('id', nonceId);
}

/**
 * Verify EVM signature using viem
 * @param walletAddress - EVM address (0x...)
 * @param message - Message that was signed
 * @param signature - Signature (0x...)
 * @returns true if valid
 */
export async function verifySignatureEVM(
    walletAddress: string,
    message: string,
    signature: string
): Promise<boolean> {
    try {
        const isValid = await verifyMessage({
            address: walletAddress as `0x${string}`,
            message,
            signature: signature as `0x${string}`
        });
        return isValid;
    } catch (error) {
        console.error('EVM signature verification error:', error);
        return false;
    }
}

/**
 * Verify Solana signature using tweetnacl
 * @param walletAddress - Solana public key (base58)
 * @param message - Message that was signed
 * @param signature - Signature (base58)
 * @returns true if valid
 */
export async function verifySignatureSolana(
    walletAddress: string,
    message: string,
    signature: string
): Promise<boolean> {
    try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(walletAddress);

        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        return isValid;
    } catch (error) {
        console.error('Solana signature verification error:', error);
        return false;
    }
}

/**
 * Create sign-in message for wallet
 */
export function createSignInMessage(nonce: string, chain: string): string {
    return `Sign this message to log in to SELSIPAD.

Nonce: ${nonce}
Chain: ${chain}
Timestamp: ${new Date().toISOString()}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

/**
 * Link wallet to user account
 */
export async function linkWalletToUser(
    userId: string,
    walletAddress: string,
    chain: string
) {
    const supabase = getSupabaseServiceClient();

    const normalizedAddress = chain.startsWith('EVM')
        ? walletAddress.toLowerCase()
        : walletAddress;

    const { data, error } = await supabase
        .from('wallets')
        .insert({
            user_id: userId,
            chain,
            address: normalizedAddress,
            verified_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to link wallet: ${error.message}`);
    }

    return data;
}

/**
 * Set primary wallet for a chain
 */
export async function setPrimaryWallet(
    userId: string,
    walletId: string,
    chain: string
) {
    const supabase = getSupabaseServiceClient();

    // Transaction: unset all primary for this chain, set new primary
    // First, unset all primary for this user + chain
    await supabase
        .from('wallets')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('chain', chain);

    // Then set the new primary
    const { data, error } = await supabase
        .from('wallets')
        .update({ is_primary: true })
        .eq('id', walletId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to set primary wallet: ${error.message}`);
    }

    return data;
}
