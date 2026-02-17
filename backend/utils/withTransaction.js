/**
 * Database Session Utility
 * 
 * Wraps operations in a MongoDB session/transaction when available.
 * Gracefully falls back to non-transactional execution on standalone MongoDB.
 * 
 * On standalone MongoDB, startSession() succeeds but startTransaction() throws:
 *   "Transaction numbers are only allowed on a replica set member or mongos"
 * This utility catches that specific error and re-runs without a session.
 */

import mongoose from 'mongoose';

/**
 * Execute a callback within a MongoDB transaction if supported,
 * otherwise execute without a transaction.
 * 
 * @param {Function} callback - Async function receiving (session | null)
 * @returns {*} The return value of the callback
 */
export async function withTransaction(callback) {
    let session = null;

    try {
        session = await mongoose.startSession();
        session.startTransaction();
    } catch (err) {
        // Standalone MongoDB — transactions not supported
        // Clean up the session if it was created
        if (session) {
            try { session.endSession(); } catch { }
        }
        // Execute without a session
        return await callback(null);
    }

    try {
        const result = await callback(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        try {
            await session.abortTransaction();
        } catch {
            // Session abort can fail if the transaction was already aborted
        }

        // If the error is about transactions not being supported,
        // retry without a session
        if (error.code === 20 || error.codeName === 'IllegalOperation' ||
            error.message?.includes('Transaction numbers')) {
            session.endSession();
            return await callback(null);
        }

        throw error;
    } finally {
        if (session) {
            try { session.endSession(); } catch { }
        }
    }
}

export default withTransaction;
