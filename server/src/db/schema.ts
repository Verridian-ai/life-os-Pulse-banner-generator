import { pgTable, text, timestamp, boolean, jsonb, integer, uuid, numeric } from 'drizzle-orm/pg-core';

// ============================================================================
// AUTHENTICATION (Replaces auth.users)
// ============================================================================

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Lucia uses string IDs
    email: text('email').notNull().unique(),
    hashedPassword: text('hashed_password'),
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
