FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build step (if we decide to compile TypeScript, otherwise we can run directly with tsx/ts-node)
# For production, we should ideally transpile.
# Let's add a build script to package.json later: "build": "tsc"
# RUN npm run build

# Expose port
EXPOSE 3000

# Start command
# We will ensure package.json has "start": "tsx src/index.ts" or similar
CMD ["npm", "start"]
