# Backend API Contracts

This document outlines the API endpoints provided by the Nanobanna Pro backend, including request/response schemas and authentication requirements.

## Base URL
All API routes are prefixed with `/api`. In production, the frontend and backend are served from the same origin.

## Authentication
Most endpoints require an active session cookie (`lucia_session`).
- **Header**: `Cookie: lucia_session=<id>`
- **Response if missing**: `401 Unauthorized`

---

## AI Services (`/api/ai`)

### `POST /chat`
Conversational interface with tool calling support.
- **Request Body**:
  ```json
  {
    "messages": [ { "role": "user", "content": "..." } ],
    "model": "google/gemini-2.5-pro",
    "tools": [ ... ],
    "tool_choice": "auto"
  }
  ```
- **Response**:
  - Without tools: `{ "text": "AI response" }`
  - With tools: Full OpenRouter/OpenAI compatible response object.

### `POST /image/generate`
Generates a banner background using Replicate.
- **Request Body**:
  ```json
  {
    "prompt": "Professional banner with...",
    "model": "black-forest-labs/flux-schnell",
    "width": 1584,
    "height": 396
  }
  ```
- **Response**: `{ "url": "https://..." }`

### `POST /image/edit`
Instruction-based image editing (Magic Edit).
- **Request Body**:
  ```json
  {
    "image": "data:image/png;base64,...",
    "prompt": "Add a mountain in the background",
    "mask": "optional-base64-mask"
  }
  ```
- **Response**: `{ "url": "https://..." }`

---

## Image Management (`/api/images`)

### `GET /`
Fetch user's generated images.
- **Query Params**:
  - `search`: Filter by prompt text.
  - `type`: Filter by `generate`, `edit`, `upscale`, etc.
  - `favorites`: `true` to only show favorites.
- **Response**: `{ "images": [ { "id": "...", "storageUrl": "...", ... } ] }`

### `POST /persist`
Uploads an image from a URL to GCS and saves a DB record.
- **Request Body**:
  ```json
  {
    "url": "https://...",
    "prompt": "...",
    "generation_type": "generate",
    "width": 1584,
    "height": 396
  }
  ```
- **Response**: `{ "image": { ... } }`

---

## User & API Keys (`/api/user`)

### `GET /api-keys`
Returns masked API keys and AI preferences.
- **Response**:
  ```json
  {
    "apiKeys": {
      "hasGeminiKey": true,
      "llmModel": "...",
      "openrouterApiKey": "****abcd"
    },
    "hasProductKeys": true
  }
  ```

### `POST /api-keys`
Update user's Bring-Your-Own-Key (BYOK) settings.
- **Request Body**: Same fields as the response object (full keys).
- **Response**: `{ "success": true }`

---

## Security & Rate Limiting
- **Global AI Rate Limit**: 30 requests per minute per user.
- **Auth Rate Limit**:
  - Signup: 3 per minute.
  - Login: 5 per minute.
  - Password Reset: 3 per minute.
- **CSRF**: All state-changing requests (POST, PATCH, DELETE) must include a valid `Origin` or `Referer` header matching the allowed domains.
