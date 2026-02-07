# Use Node.js 22 as base image
FROM node:22-slim

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy entire project
COPY . .

# Build frontend and backend
# We use esbuild to bundle the backend, but keep dependencies available in node_modules
RUN pnpm run build

# Expose Hugging Face Spaces port
EXPOSE 7860

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860/api/health/status', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/index.js"]
