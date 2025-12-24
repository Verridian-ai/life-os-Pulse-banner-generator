# Nanobanna Pro Backend API

This is the Node.js/Hono/Drizzle backend that replaces the Supabase infrastructure.

## Prerequisites

1. **Node.js 20+**
2. **Neon Database**: You need a Postgres connection string.
3. **Google Cloud Storage**: Standard bucket with credentials.

## Setup

1. **Install Dependencies**:

    ```bash
    cd server
    npm install
    ```

2. **Environment Variables**:
    Copy `.env.example` to `.env` and fill in:
    - `DATABASE_URL`: Your Neon DB connection string.
    - `GCS_CREDENTIALS`: Service account JSON for GCS.

3. **Database Migration**:
    Push the schema to your Neon DB:

    ```bash
    npx drizzle-kit push
    ```

4. **Running Locally**:

    ```bash
    npm run dev
    ```

    Server runs on `http://localhost:3000`.

## Deployment

The backend is deployed to **Google Cloud Run** using the `deploy-server.ps1` script in the root directory.

```powershell
./deploy-server.ps1
```

This script will:

1. Submit a Cloud Build job to create the Docker image.
2. Deploy the image to Cloud Run (`nanobanna-api`).

## Infrastructure

- **Database**: Neon (Postgres)
- **Auth**: Lucia Auth (Self-hosted on Neon)
- **Storage**: Google Cloud Storage (`nanobanna-pro-user-data-v1`)

## API Routes

- `/api/auth/*`: Signup, Login, Logout, Me.
- `/api/user/*`: Profile, Preferences, API Keys.
- `/api/storage/*`: Signed URLs for file uploads/downloads.
