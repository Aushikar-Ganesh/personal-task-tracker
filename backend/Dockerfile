
FROM node:22-bookworm-slim

# Install tools needed to compile better-sqlite3
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

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/tasks.db

RUN mkdir -p /data

EXPOSE 3000

CMD ["npm", "start"]
