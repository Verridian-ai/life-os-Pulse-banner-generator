/**
 * Subscription Status Component
 *
 * Displays current subscription status with manage options.
 */

import React, { useState } from 'react';
import {
  createPortal,
  cancelSubscription,
  resumeSubscription,
  type SubscriptionInfo,
  type TierType,
} from '../services/billingApi';

interface SubscriptionStatusProps {
  subscription: SubscriptionInfo | null;
  credits: {
    balance: number;
    tier: TierType;
  };
  onRefresh?: () => void;
}

export function SubscriptionStatus({
  subscription,
  credits,
  onRefresh,
}: SubscriptionStatusProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createPortal();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.',
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await cancelSubscription();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await resumeSubscription();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return (
        <span className='px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400'>
          Cancelling
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400'>
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400'>
            Trial
          </span>
        );
      case 'past_due':
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400'>
            Past Due
          </span>
        );
      default:
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400'>
            {status}
          </span>
        );
    }
  };

  return (
    <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>Your Subscription</h3>
          <p className='text-sm text-zinc-400 mt-1'>Manage your plan and billing</p>
        </div>
        {subscription && getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
      </div>

      {error && (
        <div className='mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>
          {error}
        </div>
      )}

      <div className='mt-6 grid grid-cols-2 gap-6'>
        {/* Current Plan */}
        <div>
          <p className='text-sm text-zinc-400'>Current Plan</p>
          <p className='text-xl font-bold text-white capitalize mt-1'>
            {subscription?.tier || credits.tier}
          </p>
        </div>

        {/* Credit Balance */}
        <div>
          <p className='text-sm text-zinc-400'>Credit Balance</p>
          <p className='text-xl font-bold text-purple-400 mt-1'>
            {credits.balance.toLocaleString()}
          </p>
        </div>

        {/* Billing Period */}
        {subscription && (
          <>
            <div>
              <p className='text-sm text-zinc-400'>Current Period</p>
              <p className='text-white mt-1'>
                {formatDate(subscription.currentPeriodStart)} -{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>

            <div>
              <p className='text-sm text-zinc-400'>Next Billing</p>
              <p className='text-white mt-1'>
                {subscription.cancelAtPeriodEnd
                  ? 'Subscription ends ' + formatDate(subscription.currentPeriodEnd)
                  : formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className='mt-6 flex gap-3'>
        {subscription && (
          <button
            onClick={handleManageBilling}
            disabled={isLoading}
            className='px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50'
          >
            {isLoading ? 'Loading...' : 'Manage Billing'}
          </button>
        )}

        {subscription && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition disabled:opacity-50'
          >
            Cancel Subscription
          </button>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <button
            onClick={handleResume}
            disabled={isLoading}
            className='px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium rounded-lg transition disabled:opacity-50'
          >
            Resume Subscription
          </button>
        )}
      </div>
    </div>
  );
}
