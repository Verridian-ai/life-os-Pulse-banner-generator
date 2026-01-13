# Signal — Data Model

## Overview

This document defines the core entities and relationships in Signal. These are the "nouns" of the system that appear across multiple sections.

## Core Entities

### User
The authenticated user of Signal.

**Key Attributes:**
- `id` — Unique identifier
- `email` — User's email address
- `username` — Display username
- `full_name` — Full name (optional)
- `avatar_url` — Profile image URL
- `subscription_tier` — 'free' | 'pro' | 'team'
- `created_at` — Account creation timestamp

**Relationships:**
- Has many Designs
- Has many Projects
- Has one BrandKit
- Has many Templates (saved/favorited)

---

### Design
A generated or created visual asset.

**Key Attributes:**
- `id` — Unique identifier
- `title` — Design title
- `description` — Optional description
- `platform` — Target platform ('linkedin' | 'instagram' | 'tiktok' | etc.)
- `aspect_ratio` — Dimensions ratio (e.g., '1:1', '16:9', '9:16')
- `status` — 'draft' | 'generating' | 'completed' | 'failed'
- `image_url` — Generated image URL
- `thumbnail_url` — Thumbnail for previews
- `prompt` — Generation prompt used
- `style_tokens` — Applied style configuration
- `created_at` — Creation timestamp
- `updated_at` — Last modification timestamp

**Relationships:**
- Belongs to User
- Belongs to Project (optional)
- Based on Template (optional)
- Uses BrandKit colors/fonts (optional)

---

### Project
A collection of related designs.

**Key Attributes:**
- `id` — Unique identifier
- `name` — Project name
- `description` — Optional description
- `cover_image_url` — Cover thumbnail
- `is_archived` — Archive status
- `created_at` — Creation timestamp

**Relationships:**
- Belongs to User
- Has many Designs

---

### Template
A reusable design starting point.

**Key Attributes:**
- `id` — Unique identifier
- `name` — Template name
- `description` — Template description
- `category` — Category classification
- `platform` — Target platform
- `thumbnail_url` — Preview image
- `is_premium` — Requires pro subscription
- `is_public` — Available to all users
- `usage_count` — Popularity metric

**Relationships:**
- Created by User (for custom templates)
- Used by many Designs

---

### BrandKit
User's brand assets and guidelines.

**Key Attributes:**
- `id` — Unique identifier
- `name` — Brand name
- `logo_url` — Primary logo
- `logo_light_url` — Light mode logo variant
- `logo_dark_url` — Dark mode logo variant
- `primary_color` — Primary brand color (hex)
- `secondary_color` — Secondary brand color (hex)
- `accent_color` — Accent color (hex)
- `heading_font` — Heading font family
- `body_font` — Body text font family
- `voice_guidelines` — Brand voice description

**Relationships:**
- Belongs to User
- Applied to many Designs

---

### Platform
Supported output platforms.

**Key Attributes:**
- `id` — Platform identifier (e.g., 'linkedin', 'instagram')
- `name` — Display name
- `icon` — Platform icon
- `aspect_ratios` — Supported aspect ratios
- `safe_zones` — Safe zone specifications
- `max_dimensions` — Maximum output dimensions

**Relationships:**
- Has many Designs
- Has many Templates

---

### Generation
An AI generation request/job.

**Key Attributes:**
- `id` — Unique identifier
- `prompt` — User's text prompt
- `status` — 'pending' | 'processing' | 'completed' | 'failed'
- `result_url` — Generated image URL
- `model_version` — AI model used
- `duration_ms` — Processing time
- `credits_used` — Generation credits consumed
- `created_at` — Request timestamp
- `completed_at` — Completion timestamp

**Relationships:**
- Belongs to User
- Creates Design (on success)

---

### Subscription
User's billing/subscription state.

**Key Attributes:**
- `id` — Unique identifier
- `tier` — 'free' | 'pro' | 'team'
- `status` — 'active' | 'cancelled' | 'past_due'
- `credits_remaining` — Generation credits left
- `credits_reset_at` — Credit refresh date
- `period_start` — Current billing period start
- `period_end` — Current billing period end

**Relationships:**
- Belongs to User

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                                │
│  ┌─────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐  │
│  │BrandKit │ │Subscription│ │  Projects  │ │   Designs    │  │
│  └─────────┘ └───────────┘ └──────┬─────┘ └───────┬──────┘  │
│                                    │               │         │
│                                    └───────┬───────┘         │
│                                            │                 │
│                              Designs belong to Projects      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        TEMPLATES                             │
│                            │                                 │
│                            ▼                                 │
│                   Designs based on Templates                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        PLATFORMS                             │
│                            │                                 │
│                            ▼                                 │
│                   Designs target Platforms                   │
└─────────────────────────────────────────────────────────────┘
```

## Notes

- This data model is intentionally minimal, focusing on entity descriptions rather than implementation details
- Schema specifics (column types, indexes, constraints) are left for implementation
- Authentication/authorization is implementation-dependent
- File storage details (S3, Cloudflare, etc.) are implementation-dependent
