import { pgTable, text, timestamp, boolean, jsonb, integer, uuid, numeric } from 'drizzle-orm/pg-core';

// ============================================================================
// AUTHENTICATION (Replaces auth.users)
// ============================================================================

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Lucia uses string IDs
    email: text('email').notNull().unique(),
    hashedPassword: text('hashed_password'),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
    lockedUntil: timestamp('locked_until'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// ============================================================================
// USER PROFILE & PREFERENCES
// ============================================================================

export const profiles = pgTable('profiles', {
    id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    fullName: text('full_name'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    username: text('username').unique(),
    avatarUrl: text('avatar_url'),

    // Preferences
    defaultImageQuality: text('default_image_quality').default('2K'),
    preferredModel: text('preferred_model').default('gemini-3-pro-image-preview'),

    // Usage
    imagesGenerated: integer('images_generated').default(0),
    storageUsedMb: numeric('storage_used_mb').default('0'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    theme: text('theme').default('dark'),
    language: text('language').default('en'),

    // JSON settings
    chatSettings: jsonb('chat_settings').default({
        auto_save: true,
        save_images: true,
        default_mode: 'design',
        voice_provider: 'gemini',
        auto_approve_actions: false
    }),
    notifications: jsonb('notifications').default({
        email_updates: true,
        in_app_sounds: true,
        action_confirmations: true
    }),

    storageUsedBytes: integer('storage_used_bytes').default(0),
    lastSyncAt: timestamp('last_sync_at').defaultNow(),
});

export const userApiKeys = pgTable('user_api_keys', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'), // For anonymous users

    geminiApiKey: text('gemini_api_key'),
    openaiApiKey: text('openai_api_key'),
    openrouterApiKey: text('openrouter_api_key'),
    replicateApiKey: text('replicate_api_key'),

    llmProvider: text('llm_provider').default('gemini'),
    voiceProvider: text('voice_provider').default('gemini'),

    llmModel: text('llm_model'),
    llmImageModel: text('llm_image_model'),
    llmUpscaleModel: text('llm_upscale_model'),
    llmMagicEditModel: text('llm_magic_edit_model'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// TEAMS & BRAND PROFILES
// ============================================================================

export const teams = pgTable('teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const teamMembers = pgTable('team_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
    joinedAt: timestamp('joined_at').defaultNow(),
});

export const brandProfiles = pgTable('brand_profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }), // Optional: can be personal or team
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // If personal
    name: text('name').notNull().default('My Brand'),

    colors: jsonb('colors').default([]), // [{ hex: '#...', name: 'Primary', usage: 'main' }]
    fonts: jsonb('fonts').default([]),   // [{ family: 'Inter', usage: 'heading' }]
    logoUrl: text('logo_url'),

    styleKeywords: text('style_keywords').array(),
    isDefault: boolean('is_default').default(false),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// CHAT & CONVERSATIONS
// ============================================================================

export const chatConversations = pgTable('chat_conversations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('New Conversation'),
    mode: text('mode').notNull().default('design'), // 'design', 'search', 'voice'
    isArchived: boolean('is_archived').default(false),
    isPinned: boolean('is_pinned').default(false),
    metadata: jsonb('metadata').default({}),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastMessageAt: timestamp('last_message_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'user', 'assistant', 'system'
    content: text('content').notNull(),

    toolCalls: jsonb('tool_calls'),
    toolResults: jsonb('tool_results'),
    images: text('images').array(),
    generatedImages: text('generated_images').array(),

    modelUsed: text('model_used'),
    tokensUsed: integer('tokens_used'),
    responseTimeMs: integer('response_time_ms'),

    createdAt: timestamp('created_at').defaultNow(),
});

export const voiceTranscripts = pgTable('voice_transcripts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id').references(() => chatConversations.id, { onDelete: 'set null' }),
    role: text('role').notNull(), // 'user', 'assistant'
    content: text('content').notNull(),
    audioDurationMs: integer('audio_duration_ms'),
    toolCalls: jsonb('tool_calls'),
    provider: text('provider'), // 'gemini', 'openai'
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// IMAGES & GALLERY
// ============================================================================

export const images = pgTable('images', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    storageUrl: text('storage_url').notNull(),
    fileName: text('file_name').notNull(),
    prompt: text('prompt'),
    modelUsed: text('model_used'),
    quality: text('quality'),
    generationType: text('generation_type').default('generate'), // 'generate', 'edit', etc.

    tags: text('tags').array(),
    isFavorite: boolean('is_favorite').default(false),

    fileSizeBytes: integer('file_size_bytes'),
    width: integer('width'),
    height: integer('height'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PROMPT LIBRARY
// ============================================================================

export const promptLibrary = pgTable('prompt_library', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    prompt: text('prompt').notNull(),
    title: text('title').default('Untitled Prompt'),
    category: text('category').default('general'),
    tags: text('tags').array().default([]),
    isFavorite: boolean('is_favorite').default(false),
    isPublic: boolean('is_public').default(false),
    usageCount: integer('usage_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================

// SHARING & COMMENTS

// ============================================================================



export const sharedLinks = pgTable('shared_links', {

    id: uuid('id').defaultRandom().primaryKey(),

    designId: uuid('design_id').notNull(), // Assuming designs table exists or will exist, referencing loosely for now or TODO: add designs table

    token: text('token').notNull().unique(),

    expiresAt: timestamp('expires_at'),

    canComment: boolean('can_comment').default(true),

    createdAt: timestamp('created_at').defaultNow(),

});



export const comments = pgTable('comments', {

    id: uuid('id').defaultRandom().primaryKey(),

    designId: uuid('design_id').notNull(),

    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // Optional: registered user

    authorName: text('author_name').default('Anonymous'), // For guest comments

    content: text('content').notNull(),



    // Pin position (percentage 0-100)

    x: numeric('x'),

    y: numeric('y'),



    isResolved: boolean('is_resolved').default(false),

    createdAt: timestamp('created_at').defaultNow(),

    updatedAt: timestamp('updated_at').defaultNow(),

});



// ============================================================================

// EMAIL VERIFICATION & PASSWORD RESET

// ============================================================================

export const emailVerificationTokens = pgTable('email_verification_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// ============================================================================
// DESIGNS
// ============================================================================

export const designs = pgTable('designs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Untitled Design'),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    designUrl: text('design_url'),
    canvasData: jsonb('canvas_data'),
    width: integer('width').default(1920),
    height: integer('height').default(568),
    tags: text('tags').array(),
    isPublic: boolean('is_public').default(false),
    viewCount: integer('view_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// ADMIN SYSTEM
// ============================================================================

export const adminUsers = pgTable('admin_users', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('admin'),
    permissions: jsonb('permissions').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: text('created_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const adminAuditLog = pgTable('admin_audit_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    adminUserId: text('admin_user_id').notNull(),
    action: text('action').notNull(),
    resource: text('resource'),
    resourceId: text('resource_id'),
    details: jsonb('details'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    status: text('status').default('success'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminRateLimits = pgTable('admin_rate_limits', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    endpoint: text('endpoint').notNull(),
    requestCount: integer('request_count').default(1),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// AGENT CONFIGURATION SYSTEM
// ============================================================================

export const agentConfigs = pgTable('agent_configs', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    model: text('model'),
    provider: text('provider'),
    systemPrompt: text('system_prompt'),
    capabilities: jsonb('capabilities').default([]),
    parameters: jsonb('parameters').default({}),
    enabled: boolean('enabled').default(true),
    version: integer('version').default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentSkills = pgTable('agent_skills', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type').notNull(),
    definition: jsonb('definition').notNull(),
    priority: integer('priority').default(0),
    enabled: boolean('enabled').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const agentMcpConnections = pgTable('agent_mcp_connections', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id').notNull(),
    name: text('name').notNull(),
    serverUrl: text('server_url').notNull(),
    transport: text('transport').notNull(),
    config: jsonb('config').default({}),
    discoveredTools: jsonb('discovered_tools').default([]),
    enabled: boolean('enabled').default(true),
    lastConnected: timestamp('last_connected'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const agentContextDocs = pgTable('agent_context_docs', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    cogneeDocId: text('cognee_doc_id'),
    filePath: text('file_path'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const agentRuntimeState = pgTable('agent_runtime_state', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id').notNull(),
    configVersion: integer('config_version').default(1),
    lastReloaded: timestamp('last_reloaded'),
    status: text('status').default('idle'),
    metrics: jsonb('metrics').default({
        errorCount: 0,
        totalCalls: 0,
        avgLatencyMs: 0,
        successCount: 0
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentAuditLogs = pgTable('agent_audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    agentId: text('agent_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    userId: text('user_id'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// ============================================================================
// CREDIT & BILLING SYSTEM
// ============================================================================

export const creditTiers = pgTable('credit_tiers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    displayName: text('display_name').notNull(),
    monthlyCredits: integer('monthly_credits').notNull(),
    priceUsd: integer('price_usd').notNull(),
    features: jsonb('features'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const userCreditAccounts = pgTable('user_credit_accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tierId: text('tier_id').references(() => creditTiers.id),
    creditBalance: integer('credit_balance').notNull().default(100),
    lifetimeCreditsUsed: integer('lifetime_credits_used').default(0),
    lifetimeCreditsGranted: integer('lifetime_credits_granted').default(100),
    lastRefillAt: timestamp('last_refill_at'),
    nextRefillAt: timestamp('next_refill_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const creditTransactions = pgTable('credit_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    type: text('type').notNull(), // 'usage', 'refill', 'purchase', 'bonus'
    description: text('description'),
    modelUsed: text('model_used'),
    operationType: text('operation_type'),
    langfuseTraceId: text('langfuse_trace_id'),
    balanceAfter: integer('balance_after').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const tierFeatureLimits = pgTable('tier_feature_limits', {
    id: uuid('id').defaultRandom().primaryKey(),
    tierId: text('tier_id').notNull().references(() => creditTiers.id),
    featureKey: text('feature_key').notNull(),
    limitValue: text('limit_value').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// OBSERVABILITY & LOGGING
// ============================================================================

export const llmTraces = pgTable('llm_traces', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id'),
    sessionId: text('session_id'),
    traceId: text('trace_id').notNull(),
    name: text('name').notNull(),
    model: text('model').notNull(),
    provider: text('provider'),
    input: jsonb('input'),
    output: jsonb('output'),
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),
    costUsd: numeric('cost_usd'),
    latencyMs: integer('latency_ms'),
    status: text('status').default('success'),
    errorMessage: text('error_message'),
    tags: jsonb('tags'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const apiMetrics = pgTable('api_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    endpoint: text('endpoint').notNull(),
    method: text('method').notNull(),
    statusCode: integer('status_code').notNull(),
    latencyMs: integer('latency_ms').notNull(),
    userId: text('user_id'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const requestLogs = pgTable('request_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    traceId: text('trace_id').notNull(),
    userId: text('user_id'),
    endpoint: text('endpoint').notNull(),
    method: text('method').notNull(),
    statusCode: integer('status_code'),
    responseTimeMs: integer('response_time_ms'),
    requestHeaders: jsonb('request_headers'),
    requestBody: jsonb('request_body'),
    responseSize: integer('response_size'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const errorLogs = pgTable('error_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    traceId: text('trace_id').notNull(),
    userId: text('user_id'),
    errorType: text('error_type').notNull(),
    errorMessage: text('error_message').notNull(),
    stackTrace: text('stack_trace'),
    endpoint: text('endpoint'),
    method: text('method'),
    requestBody: jsonb('request_body'),
    context: jsonb('context'),
    severity: text('severity').default('error'),
    resolved: boolean('resolved').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const dailyStats = pgTable('daily_stats', {
    id: uuid('id').defaultRandom().primaryKey(),
    date: timestamp('date').notNull(),
    totalRequests: integer('total_requests').default(0),
    totalLlmCalls: integer('total_llm_calls').default(0),
    totalTokens: integer('total_tokens').default(0),
    totalCostUsd: numeric('total_cost_usd').default('0'),
    uniqueUsers: integer('unique_users').default(0),
    avgLatencyMs: integer('avg_latency_ms'),
    errorCount: integer('error_count').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
