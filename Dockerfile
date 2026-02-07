# Use Node.js 22 as base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the application
# Set NODE_ENV to production AFTER build to ensure devDependencies are available
RUN pnpm run build

# Remove devDependencies after build to reduce image size
RUN pnpm prune --prod

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=7860
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
