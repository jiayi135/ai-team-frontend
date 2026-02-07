# Multi-stage build for optimized production image
FROM node:22-slim as builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy entire project
COPY . .

# Build frontend and backend
RUN pnpm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only necessary files from builder
COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose Hugging Face Spaces port
EXPOSE 7860

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860/api/health/status', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/index.js"]
