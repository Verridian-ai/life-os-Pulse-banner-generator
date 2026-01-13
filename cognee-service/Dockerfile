# Cognee Service for Nanobanna Pro
# Self-hosted AI memory service on Google Cloud Run
# Based on official Cognee Docker image

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Cognee with required extras
RUN uv pip install --system \
    cognee[api,postgres] \
    openai \
    tiktoken

# Production stage
FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start Cognee API server\n\
python -m cognee.api.v1.main\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Environment defaults
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000
ENV ENVIRONMENT=production
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

