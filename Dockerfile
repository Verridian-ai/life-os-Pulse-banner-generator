# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app-frontend
COPY package*.json ./
RUN npm ci
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Stage 2: Backend & Runtime
FROM node:20-alpine
WORKDIR /app

# Copy Backend dependencies
COPY server/package.json ./
# Install dependencies (including devDependencies for tsx)
RUN npm install

# Copy Backend source code
COPY server/ ./

# Copy Frontend Build to 'public' folder served by Hono
COPY --from=frontend-builder /app-frontend/dist ./public

# Expose port (Cloud Run defaults to 8080 usually, but we expose what we use)
# Hono server listens on 3000 by default (hardcoded in index.ts) or process.env.PORT
# We should update server to respect PORT env var if not already.

ENV PORT=8080
# Hono index.ts needs to be checked if it uses PORT env var.

EXPOSE 8080
CMD ["npm", "start"]
