FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 

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
ENV DATABASE_URL=${DATABASE_URL}
ARG RIOT_API_KEY
ENV RIOT_API_KEY=${RIOT_API_KEY}
ARG PROCESSING_URL
ENV PROCESSING_URL=${PROCESSING_URL}
ARG MINIO_ENDPOINT
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ARG MINIO_PORT
ENV MINIO_PORT=${MINIO_PORT}
ARG MINIO_ACCESS_KEY
ENV MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
ARG MINIO_SECRET_KEY
ENV MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Omit --production flag for TypeScript devDependencies
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i; \
    # Allow install without lockfile, so example works even without Node.js installed locally
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
    fi

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN \
    if [ -f yarn.lock ]; then yarn prisma generate && yarn build; \
    elif [ -f package-lock.json ]; then npm prisma generate && npm run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm prisma generate && pnpm build; \
    else yarn prisma generate && yarn build; \
    fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/postcss.config.cjs /app/tailwind.config.ts  ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG RIOT_API_KEY
ENV RIOT_API_KEY=${RIOT_API_KEY}
ARG PROCESSING_URL
ENV PROCESSING_URL=${PROCESSING_URL}
ARG MINIO_ENDPOINT
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ARG MINIO_PORT
ENV MINIO_PORT=${MINIO_PORT}
ARG MINIO_ACCESS_KEY
ENV MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
ARG MINIO_SECRET_KEY
ENV MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]