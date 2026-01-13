/**
 * Credit Service
 *
 * Handles credit deduction, balance checking, and transaction recording
 * for all AI operations in the application.
 */

import { db } from '../db';
import { userCreditAccounts, creditTransactions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

// Credit costs per operation (configurable)
export const CREDIT_COSTS = {
    // Image generation
    'image_generate': 10,
    'image_generate_hd': 20,

    // Image processing
    'image_upscale': 5,
    'image_remove_bg': 3,
    'image_restore': 5,
    'image_enhance_face': 5,
    'image_magic_edit': 15,

    // AI chat/analysis
    'chat_message': 1,
    'prompt_enhance': 2,
    'image_analyze': 3,
    'banner_analyze': 3,

    // Voice
    'voice_transcribe': 2,
    'voice_command': 1,
} as const;

export type OperationType = keyof typeof CREDIT_COSTS;

interface DeductCreditsParams {
    userId: string;
    operation: OperationType;
    description?: string;
    modelUsed?: string;
    langfuseTraceId?: string;
    metadata?: Record<string, unknown>;
}

interface DeductCreditsResult {
    success: boolean;
    newBalance: number;
    creditsDeducted: number;
    transactionId?: string;
    error?: string;
}

/**
 * Check if user has sufficient credits for an operation
 */
export async function checkCredits(userId: string, operation: OperationType): Promise<{
    hasCredits: boolean;
    currentBalance: number;
    requiredCredits: number;
}> {
    const cost = CREDIT_COSTS[operation];

    const account = await db.select()
        .from(userCreditAccounts)
        .where(eq(userCreditAccounts.userId, userId))
        .limit(1);

    // If no account, create one with default credits
    if (!account[0]) {
        const [newAccount] = await db.insert(userCreditAccounts).values({
            userId,
            tierId: 'free',
            creditBalance: 100,
            lifetimeCreditsGranted: 100,
            lifetimeCreditsUsed: 0,
        }).returning();

        return {
            hasCredits: newAccount.creditBalance >= cost,
            currentBalance: newAccount.creditBalance,
            requiredCredits: cost,
        };
    }

    return {
        hasCredits: account[0].creditBalance >= cost,
        currentBalance: account[0].creditBalance,
        requiredCredits: cost,
    };
}

/**
 * Deduct credits for an operation and record the transaction
 */
export async function deductCredits(params: DeductCreditsParams): Promise<DeductCreditsResult> {
    const { userId, operation, description, modelUsed, langfuseTraceId, metadata } = params;
    const cost = CREDIT_COSTS[operation];

    try {
        // Get current balance
        const account = await db.select()
            .from(userCreditAccounts)
            .where(eq(userCreditAccounts.userId, userId))
            .limit(1);

        // Create account if doesn't exist
        if (!account[0]) {
            const [newAccount] = await db.insert(userCreditAccounts).values({
                userId,
                tierId: 'free',
                creditBalance: 100,
                lifetimeCreditsGranted: 100,
                lifetimeCreditsUsed: 0,
            }).returning();
            account[0] = newAccount;
        }

        const currentBalance = account[0].creditBalance;

        // Check sufficient credits
        if (currentBalance < cost) {
            return {
                success: false,
                newBalance: currentBalance,
                creditsDeducted: 0,
                error: `Insufficient credits. Required: ${cost}, Available: ${currentBalance}`,
            };
        }

        const newBalance = currentBalance - cost;

        // Update balance and lifetime used atomically
        await db.update(userCreditAccounts)
            .set({
                creditBalance: newBalance,
                lifetimeCreditsUsed: sql`${userCreditAccounts.lifetimeCreditsUsed} + ${cost}`,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        // Record transaction
        const [transaction] = await db.insert(creditTransactions).values({
            userId,
            amount: -cost, // Negative for deduction
            type: 'usage',
            description: description || `${operation} operation`,
            modelUsed,
            operationType: operation,
            langfuseTraceId,
            balanceAfter: newBalance,
            metadata: metadata || {},
        }).returning();

        console.log(`[Credits] Deducted ${cost} credits from user ${userId} for ${operation}. New balance: ${newBalance}`);

        return {
            success: true,
            newBalance,
            creditsDeducted: cost,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error('[Credits] Failed to deduct credits:', error);
        return {
            success: false,
            newBalance: 0,
            creditsDeducted: 0,
            error: 'Failed to process credit deduction',
        };
    }
}

/**
 * Add credits to user account (for purchases, bonuses, refills)
 */
export async function addCredits(params: {
    userId: string;
    amount: number;
    type: 'purchase' | 'bonus' | 'refill';
    description?: string;
    metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const { userId, amount, type, description, metadata } = params;

    if (amount <= 0) {
        return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    try {
        const account = await db.select()
            .from(userCreditAccounts)
            .where(eq(userCreditAccounts.userId, userId))
            .limit(1);

        if (!account[0]) {
            // Create with bonus amount
            const [newAccount] = await db.insert(userCreditAccounts).values({
                userId,
                tierId: 'free',
                creditBalance: 100 + amount,
                lifetimeCreditsGranted: 100 + amount,
                lifetimeCreditsUsed: 0,
            }).returning();

            await db.insert(creditTransactions).values({
                userId,
                amount,
                type,
                description: description || `${type} credits`,
                balanceAfter: newAccount.creditBalance,
                metadata: metadata || {},
            });

            return { success: true, newBalance: newAccount.creditBalance };
        }

        const newBalance = account[0].creditBalance + amount;

        await db.update(userCreditAccounts)
            .set({
                creditBalance: newBalance,
                lifetimeCreditsGranted: sql`${userCreditAccounts.lifetimeCreditsGranted} + ${amount}`,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        await db.insert(creditTransactions).values({
            userId,
            amount,
            type,
            description: description || `${type} credits`,
            balanceAfter: newBalance,
            metadata: metadata || {},
        });

        return { success: true, newBalance };
    } catch (error) {
        console.error('[Credits] Failed to add credits:', error);
        return { success: false, newBalance: 0, error: 'Failed to add credits' };
    }
}

/**
 * Get user's current credit balance
 */
export async function getBalance(userId: string): Promise<number> {
    const account = await db.select()
        .from(userCreditAccounts)
        .where(eq(userCreditAccounts.userId, userId))
        .limit(1);

    return account[0]?.creditBalance ?? 0;
}
