/**
 * Billing API Service
 *
 * Client-side API for Stripe billing operations.
 */

const API_BASE = '/api/billing';

async function fetchWithCredentials<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export type TierType = 'free' | 'basic' | 'premium';

export interface TierInfo {
  price: number;
  credits: number;
  priceId: string;
}

export interface BillingStatus {
  enabled: boolean;
  tiers: {
    free: TierInfo;
    basic: TierInfo;
    premium: TierInfo;
  };
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  tier: TierType;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string | null;
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo | null;
  credits: {
    balance: number;
    tier: TierType;
  };
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface Invoice {
  id: string;
  stripeInvoiceId: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  createdAt: string;
}

/**
 * Get billing status (tiers, prices)
 */
export async function getBillingStatus(): Promise<BillingStatus> {
  return fetchWithCredentials<BillingStatus>(`${API_BASE}/status`);
}

/**
 * Get current subscription
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  return fetchWithCredentials<SubscriptionResponse>(`${API_BASE}/subscription`);
}

/**
 * Create checkout session
 */
export async function createCheckout(
  tier: 'basic' | 'premium',
  successUrl?: string,
  cancelUrl?: string,
): Promise<CheckoutResponse> {
  return fetchWithCredentials<CheckoutResponse>(`${API_BASE}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ tier, successUrl, cancelUrl }),
  });
}

/**
 * Create customer portal session
 */
export async function createPortal(returnUrl?: string): Promise<PortalResponse> {
  return fetchWithCredentials<PortalResponse>(`${API_BASE}/portal`, {
    method: 'POST',
    body: JSON.stringify({ returnUrl }),
  });
}

/**
 * Get invoice history
 */
export async function getInvoices(limit = 10): Promise<{ invoices: Invoice[] }> {
  return fetchWithCredentials<{ invoices: Invoice[] }>(`${API_BASE}/invoices?limit=${limit}`);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  return fetchWithCredentials<{ success: boolean; message: string }>(`${API_BASE}/cancel`, {
    method: 'POST',
  });
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(): Promise<{ success: boolean; message: string }> {
  return fetchWithCredentials<{ success: boolean; message: string }>(`${API_BASE}/resume`, {
    method: 'POST',
  });
}

/**
 * Format currency amount (cents to dollars)
 */
export function formatAmount(amount: number, currency = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount / 100);
}
