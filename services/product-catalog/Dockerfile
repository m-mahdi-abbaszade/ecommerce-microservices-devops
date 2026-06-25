# ─── Stage 1: Install dependencies ───
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# ─── Stage 2: Production image ───
FROM node:20-alpine AS production
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Remove dev files if they exist
RUN rm -f .env .env.* .dockerignore Dockerfile

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
