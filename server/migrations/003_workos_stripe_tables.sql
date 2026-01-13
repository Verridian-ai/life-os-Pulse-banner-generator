-- WorkOS and Stripe Tables Migration
-- Run this migration to add WorkOS authentication and Stripe billing support

-- ============================================================================
-- Add WorkOS fields to users table
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS workos_user_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'password';

-- ============================================================================
-- WorkOS Organizations
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workos_org_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    domains TEXT[] DEFAULT '{}',
    allow_profiles_outside_org BOOLEAN DEFAULT TRUE,
    sso_enabled BOOLEAN DEFAULT FALSE,
    scim_enabled BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WorkOS SSO Connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_sso_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workos_connection_id TEXT NOT NULL UNIQUE,
    workos_org_id TEXT REFERENCES workos_organizations(workos_org_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    connection_type TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'draft',
    domains TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WorkOS Directories (SCIM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_directories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workos_directory_id TEXT NOT NULL UNIQUE,
    workos_org_id TEXT REFERENCES workos_organizations(workos_org_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'linked',
    primary_endpoint TEXT,
    bearer_token TEXT,
    user_count INTEGER DEFAULT 0,
    group_count INTEGER DEFAULT 0,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WorkOS Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workos_session_id TEXT UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    auth_provider TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WorkOS Webhook Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WorkOS Auth Attempts (Security Audit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workos_auth_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    auth_method TEXT NOT NULL,
    provider TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Stripe Customers
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    default_payment_method_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Stripe Subscriptions
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    tier_id TEXT REFERENCES credit_tiers(id),
    price_id TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Stripe Invoices
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT NOT NULL UNIQUE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    amount_due INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Stripe Webhook Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workos_sessions_user_id ON workos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workos_sessions_expires_at ON workos_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_workos_webhook_events_event_type ON workos_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workos_webhook_events_processed ON workos_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_workos_auth_attempts_email ON workos_auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_workos_auth_attempts_created_at ON workos_auth_attempts(created_at);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_user_id ON stripe_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
