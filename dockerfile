# syntax=docker.io/docker/dockerfile:1

# Base image with Node and pnpm setup
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 
RUN corepack use pnpm

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

RUN apk add --no-cache git

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY postcss.config.cjs tailwind.config.ts ./

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG DATABASE_URL
ARG RIOT_API_KEY
ARG PROCESSING_URL
ARG MINIO_ENDPOINT
ARG MINIO_PORT
ARG MINIO_ACCESS_KEY
ARG MINIO_SECRET_KEY

ENV DATABASE_URL=${DATABASE_URL}
ENV RIOT_API_KEY=${RIOT_API_KEY}
ENV PROCESSING_URL=${PROCESSING_URL}
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ENV MINIO_PORT=${MINIO_PORT}
ENV MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
ENV MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Omit --production flag for TypeScript devDependencies
RUN pnpm i

RUN pnpm prisma generate;
RUN pnpm build;

# Step 3: Prepare the production environment
FROM base AS runner

WORKDIR /app

# Set up non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only the necessary files for production
COPY --from=builder /app/postcss.config.cjs /app/tailwind.config.ts  ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set up environment variables for runtime
ARG DATABASE_URL
ARG RIOT_API_KEY
ARG PROCESSING_URL
ARG MINIO_ENDPOINT
ARG MINIO_PORT
ARG MINIO_ACCESS_KEY
ARG MINIO_SECRET_KEY

ENV DATABASE_URL=${DATABASE_URL}
ENV RIOT_API_KEY=${RIOT_API_KEY}
ENV PROCESSING_URL=${PROCESSING_URL}
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ENV MINIO_PORT=${MINIO_PORT}
ENV MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
ENV MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]