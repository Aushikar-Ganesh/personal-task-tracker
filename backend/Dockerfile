
# Stage 1: Build the application and native dependencies
FROM node:22-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript into JavaScript
RUN npm run build

# Remove development dependencies after building
RUN npm prune --omit=dev && npm cache clean --force


# Stage 2: Production runtime
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/tasks.db

WORKDIR /app

# Copy production dependencies compiled in the builder stage
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy compiled JavaScript only
COPY --from=builder --chown=node:node /app/dist ./dist

# Prepare persistent database directory
RUN mkdir -p /data && chown node:node /data

USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
