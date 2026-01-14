/**
 * Billing History Component
 *
 * Displays invoice history with download/view options.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getInvoices, formatAmount, type Invoice } from '../services/billingApi';

interface BillingHistoryProps {
  limit?: number;
}

export function BillingHistory({ limit = 10 }: BillingHistoryProps): React.ReactElement {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getInvoices(limit);
      setInvoices(result.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400'>
            Paid
          </span>
        );
      case 'open':
        return (
          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400'>
            Open
          </span>
        );
      case 'void':
        return (
          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400'>
            Void
          </span>
        );
      case 'uncollectible':
        return (
          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400'>
            Uncollectible
          </span>
        );
      default:
        return (
          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400'>
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4'>Billing History</h3>
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='animate-pulse flex items-center justify-between py-3 border-b border-white/5'
            >
              <div className='flex-1'>
                <div className='h-4 bg-zinc-800 rounded w-24 mb-2'></div>
                <div className='h-3 bg-zinc-800 rounded w-32'></div>
              </div>
              <div className='h-4 bg-zinc-800 rounded w-16'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4'>Billing History</h3>
        <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white'>Billing History</h3>
        <button
          onClick={loadInvoices}
          className='text-sm text-zinc-400 hover:text-white transition'
        >
          Refresh
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className='text-center py-8 text-zinc-500'>
          <svg
            className='w-12 h-12 mx-auto mb-3 opacity-50'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          <p>No invoices yet</p>
        </div>
      ) : (
        <div className='divide-y divide-white/5'>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className='py-4 first:pt-0 last:pb-0 flex items-center justify-between'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3'>
                  <p className='text-white font-medium'>
                    {formatAmount(invoice.amountPaid || invoice.amountDue, invoice.currency)}
                  </p>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className='text-sm text-zinc-400 mt-1'>
                  {invoice.periodStart && invoice.periodEnd
                    ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                    : formatDate(invoice.createdAt)}
                </p>
              </div>

              <div className='flex items-center gap-2 ml-4'>
                {invoice.hostedUrl && (
                  <a
                    href={invoice.hostedUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition'
                    title='View Invoice'
                  >
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  </a>
                )}
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition'
                    title='Download PDF'
                  >
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
