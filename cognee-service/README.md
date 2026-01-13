# Cognee Service - Self-Hosted AI Memory

Self-hosted Cognee service for Nanobanna Pro, deployed on Google Cloud Run.

## Overview

This service provides AI memory and knowledge graph capabilities for the multi-agent system:

- **Document Ingestion**: Add documents to agent-specific knowledge bases
- **Knowledge Graph**: Generate graph relationships from documents
- **Vector Search**: Semantic search across documents
- **Agent Context**: Retrieve domain knowledge for specialized agents

## Architecture

```
┌─────────────────┐       ┌──────────────────┐
│ Nanobanna Pro   │──────▶│ Cognee Service   │
│ (Cloud Run)     │       │ (Cloud Run)      │
└─────────────────┘       └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Neon PostgreSQL  │
                          │ (pgvector)       │
                          └──────────────────┘
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LLM_API_KEY` | OpenAI API key for embeddings | Yes |
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `LOG_LEVEL` | Logging level (INFO, DEBUG, ERROR) | No |
| `ENVIRONMENT` | Deployment environment | No |

## Deployment

### Manual Deployment

```bash
cd cognee-service

# Build image
docker build -t gcr.io/plated-mantis-477406-i6-477406/cognee-service .

# Push to GCR
docker push gcr.io/plated-mantis-477406-i6-477406/cognee-service

# Deploy to Cloud Run
gcloud run deploy cognee-service \
  --image=gcr.io/plated-mantis-477406-i6-477406/cognee-service \
  --region=us-central1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --memory=2Gi \
  --cpu=2
```

### Automated Deployment

Push to `main` branch with changes in `cognee-service/` triggers automatic deployment via GitHub Actions.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/add` | POST | Add document/text |
| `/api/v1/cognify` | POST | Process into knowledge graph |
| `/api/v1/search` | POST | Search knowledge base |
| `/api/v1/datasets/{name}` | GET | Get dataset documents |
| `/api/v1/datasets/{name}` | DELETE | Clear dataset |

## Usage from Backend

```typescript
import { CogneeService } from './services/cognee';

// Add knowledge to an agent
await CogneeService.addText('benno', 'Benno is the lead prompt strategist...');

// Process into knowledge graph
await CogneeService.cognify('benno');

// Search agent's knowledge
const results = await CogneeService.search('prompt writing', 'benno');

// Query with natural language
const answer = await CogneeService.query('How should I write prompts?', 'benno');
```

## Cost Optimization

- **Min instances: 0** - Scales to zero when idle
- **Max instances: 5** - Limits maximum cost
- **Memory: 2GB** - Sufficient for embeddings
- **CPU: 2** - Good balance of speed/cost

Estimated monthly cost: $10-50 depending on usage (vs $200+ for Cognee Cloud).

## Secrets Configuration

Set up secrets in Google Cloud Secret Manager:

```bash
# Create secrets
echo -n "sk-your-openai-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "postgres://..." | gcloud secrets create neon-database-url --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

## Monitoring

View logs in Cloud Console:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cognee-service" --limit=50
```

## Troubleshooting

### Service won't start
- Check LLM_API_KEY is set correctly
- Verify DATABASE_URL is accessible from Cloud Run

### Search returns empty
- Ensure documents were added with `addDocument` or `addText`
- Run `cognify` after adding documents to build the knowledge graph

### Slow responses
- First request after cold start is slower (10-15s)
- Subsequent requests should be <2s

