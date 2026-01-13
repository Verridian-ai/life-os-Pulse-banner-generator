import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { getFinanceStats, listTransactions, getBillingMetrics, FinanceStats, CreditTransaction, BillingMetrics } from '../services/adminApi';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
};

interface RevenueBarProps {
    date: string;
    revenue: number;
    maxRevenue: number;
}

const RevenueBar: React.FC<RevenueBarProps> = ({ date, revenue, maxRevenue }) => {
    const barRef = useRef<HTMLDivElement>(null);
    const heightPercentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

    useLayoutEffect(() => {
        if (barRef.current) {
            barRef.current.style.height = `${Math.max(heightPercentage, 4)}%`;
        }
    }, [heightPercentage]);

    return (
        <div
            ref={barRef}
            className="flex-1 bg-purple-500/30 hover:bg-purple-500/50 rounded-t transition-all cursor-pointer group relative"
            title={`${date}: ${formatUSD(revenue)}`}
        >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {formatUSD(revenue)}
            </div>
        </div>
    );
};

export function AdminFinance(): React.ReactElement {
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [billingMetrics, setBillingMetrics] = useState<BillingMetrics | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [statsData, txData, billingData] = await Promise.all([
                getFinanceStats(),
                listTransactions({ limit: 50 }),
                getBillingMetrics().catch(() => null), // Handle Stripe not configured
            ]);
            setStats(statsData);
            setTransactions(txData.transactions);
            setBillingMetrics(billingData);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load financial data');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <AdminGuard>
            <AdminLayout activeSection="finance">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
                            <p className="text-zinc-400 mt-1">Monitor credit usage and transactions</p>
                        </div>
                        <button
                            onClick={loadData}
                            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                            title="Refresh Data"
                        >
                            <span className="material-icons">refresh</span>
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 h-32"></div>
                            ))}
                        </div>
                    ) : stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-zinc-500 text-sm">Total Granted</p>
                                    <span className="material-icons text-purple-400">payments</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{formatCurrency(stats.granted)}</p>
                                <p className="text-zinc-500 text-xs mt-1">Lifetime credits issued</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-zinc-500 text-sm">Total Consumed</p>
                                    <span className="material-icons text-blue-400">data_usage</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{formatCurrency(stats.used)}</p>
                                <p className="text-zinc-500 text-xs mt-1">Lifetime credits burned</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-zinc-500 text-sm">Current Float</p>
                                    <span className="material-icons text-green-400">account_balance_wallet</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{formatCurrency(stats.float)}</p>
                                <p className="text-zinc-500 text-xs mt-1">Outstanding user balances</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-zinc-500 text-sm">24h Volume</p>
                                    <span className="material-icons text-amber-400">trending_up</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{formatCurrency(stats.volume24h)}</p>
                                <p className="text-zinc-500 text-xs mt-1">Credits moved today</p>
                            </div>
                        </div>
                    )}

                    {/* Stripe Billing Metrics */}
                    {billingMetrics?.enabled && (
                        <>
                            <div className="flex items-center gap-2 mt-8 mb-4">
                                <span className="material-icons text-purple-500">credit_card</span>
                                <h2 className="text-xl font-bold text-white">Stripe Billing</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-purple-300 text-sm font-medium">MRR</p>
                                        <span className="material-icons text-purple-400">attach_money</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{formatUSD(billingMetrics.mrr)}</p>
                                    <p className="text-purple-300/60 text-xs mt-1">Monthly Recurring Revenue</p>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-zinc-500 text-sm">Active Subscribers</p>
                                        <span className="material-icons text-green-400">group</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{billingMetrics.totalActiveSubscribers}</p>
                                    <div className="flex gap-2 mt-2 text-xs">
                                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                                            Basic: {billingMetrics.subscribersByTier.basic}
                                        </span>
                                        <span className="px-2 py-0.5 bg-purple-500/20 rounded text-purple-300">
                                            Premium: {billingMetrics.subscribersByTier.premium}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-zinc-500 text-sm">Churn Rate</p>
                                        <span className="material-icons text-red-400">trending_down</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{billingMetrics.churnRate}%</p>
                                    <p className="text-zinc-500 text-xs mt-1">
                                        {billingMetrics.cancelledThisMonth} cancelled this month
                                    </p>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-zinc-500 text-sm">Monthly Revenue</p>
                                        <span className="material-icons text-green-400">payments</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{formatUSD(billingMetrics.monthlyRevenue)}</p>
                                    <p className="text-zinc-500 text-xs mt-1">
                                        +{billingMetrics.newSubscribersThisMonth} new this month
                                    </p>
                                </div>
                            </div>

                            {/* Revenue Chart (Simple) */}
                            {billingMetrics.dailyRevenue.length > 0 && (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mt-4">
                                    <h3 className="text-lg font-bold text-white mb-4">Daily Revenue (Last 30 Days)</h3>
                                    <div className="flex items-end gap-1 h-32">
                                        {(() => {
                                            const maxRevenue = Math.max(...billingMetrics.dailyRevenue.map(d => d.revenue));
                                            return billingMetrics.dailyRevenue.map((day, i) => (
                                                <RevenueBar
                                                    key={i}
                                                    date={day.date}
                                                    revenue={day.revenue}
                                                    maxRevenue={maxRevenue}
                                                />
                                            ));
                                        })()}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-zinc-600">
                                        <span>{billingMetrics.dailyRevenue[0]?.date}</span>
                                        <span>{billingMetrics.dailyRevenue[billingMetrics.dailyRevenue.length - 1]?.date}</span>
                                    </div>
                                </div>
                            )}

                            {/* Lifetime Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Revenue (Lifetime)</p>
                                    <p className="text-2xl font-bold text-white mt-1">{formatUSD(billingMetrics.totalRevenue)}</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Invoices</p>
                                    <p className="text-2xl font-bold text-white mt-1">{billingMetrics.invoiceCount}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stripe Not Configured Notice */}
                    {billingMetrics && !billingMetrics.enabled && (
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-amber-500">info</span>
                                <p className="text-amber-400 text-sm">
                                    Stripe billing is not configured. Set STRIPE_SECRET_KEY to enable billing metrics.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Transactions Table */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Description</th>
                                        <th className="p-4 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                                Loading transactions...
                                            </td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition">
                                                <td className="p-4 text-zinc-400 whitespace-nowrap">
                                                    {formatDate(tx.createdAt)}
                                                </td>
                                                <td className="p-4 text-white font-medium">
                                                    {tx.userEmail}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${tx.type === 'purchase' ? 'bg-green-500/20 text-green-400' :
                                                        tx.type === 'usage' ? 'bg-blue-500/20 text-blue-400' :
                                                            tx.type === 'adjustment' ? 'bg-purple-500/20 text-purple-400' :
                                                                'bg-zinc-700 text-zinc-400'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-zinc-300">
                                                    {tx.description}
                                                </td>
                                                <td className={`p-4 text-right font-mono font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-zinc-200'
                                                    }`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
