import { getSupabaseServiceClient, Chain, TxStatus } from '@selsipad/shared';

/**
 * Transaction Manager Client
 * Tracks transaction status across chains
 */
export class TxManager {
    /**
     * Submit a transaction for tracking
     */
    static async submitTx(params: {
        chain: Chain;
        txHash: string;
        type: string;
        userId?: string;
        projectId?: string;
        roundId?: string;
        metadata?: Record<string, any>;
    }) {
        const supabase = getSupabaseServiceClient();

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                chain: params.chain,
                tx_hash: params.txHash,
                type: params.type,
                status: 'SUBMITTED',
                user_id: params.userId,
                project_id: params.projectId,
                round_id: params.roundId,
                metadata: params.metadata || {}
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to submit transaction: ${error.message}`);
        }

        return data;
    }

    /**
     * Update transaction status
     */
    static async updateTxStatus(
        txId: string,
        status: TxStatus,
        errorMessage?: string
    ) {
        const supabase = getSupabaseServiceClient();

        const { data, error } = await supabase
            .from('transactions')
            .update({
                status,
                error_message: errorMessage,
                updated_at: new Date().toISOString()
            })
            .eq('id', txId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update transaction: ${error.message}`);
        }

        return data;
    }

    /**
     * Get transaction by hash
     */
    static async getTxByHash(chain: Chain, txHash: string) {
        const supabase = getSupabaseServiceClient();

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('chain', chain)
            .eq('tx_hash', txHash)
            .single();

        if (error) {
            return null;
        }

        return data;
    }

    /**
     * Get pending transactions (for reconcile worker)
     */
    static async getPendingTxs(limit = 100) {
        const supabase = getSupabaseServiceClient();

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .in('status', ['SUBMITTED', 'PENDING'])
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to fetch pending transactions: ${error.message}`);
        }

        return data;
    }
}
