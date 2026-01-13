import { TxManager, getChainAdapter } from '@selsipad/sdk';

/**
 * Transaction Manager Service
 * Worker that reconciles pending transactions and updates their status
 */

async function reconcilePendingTransactions() {
    console.log('[Tx Manager] Starting reconciliation...');

    try {
        // Get all pending transactions
        const pendingTxs = await TxManager.getPendingTxs(100);
        console.log(`[Tx Manager] Found ${pendingTxs.length} pending transactions`);

        for (const tx of pendingTxs) {
            try {
                // Get chain adapter
                const adapter = getChainAdapter(tx.chain);

                // Check transaction status on-chain
                const receipt = await adapter.getTxReceipt(tx.tx_hash);

                if (receipt) {
                    // Transaction confirmed
                    const newStatus = receipt.status === 'success' ? 'CONFIRMED' : 'FAILED';
                    await TxManager.updateTxStatus(tx.id, newStatus);
                    console.log(`[Tx Manager] Updated tx ${tx.tx_hash}: ${newStatus}`);
                } else {
                    // Still pending - check if too old (>30 min = likely failed)
                    const createdAt = new Date(tx.created_at);
                    const now = new Date();
                    const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

                    if (ageMinutes > 30 && tx.status === 'SUBMITTED') {
                        // Mark as pending (waiting for confirmation)
                        await TxManager.updateTxStatus(tx.id, 'PENDING');
                    }

                    if (ageMinutes > 60) {
                        // Timeout - mark as failed
                        await TxManager.updateTxStatus(
                            tx.id,
                            'FAILED',
                            'Transaction timeout after 60 minutes'
                        );
                        console.log(`[Tx Manager] Tx ${tx.tx_hash} timed out`);
                    }
                }
            } catch (error: any) {
                console.error(`[Tx Manager] Error processing tx ${tx.id}:`, error.message);
            }
        }

        console.log('[Tx Manager] Reconciliation complete');
    } catch (error: any) {
        console.error('[Tx Manager] Reconciliation error:', error);
    }
}

// Run reconciliation every 2 minutes
async function main() {
    console.log('[Tx Manager] Service starting...');

    // Initial run
    await reconcilePendingTransactions();

    // Schedule recurring runs
    setInterval(reconcilePendingTransactions, 2 * 60 * 1000); // Every 2 minutes
}

main().catch(console.error);

// - Monitor transaction status
