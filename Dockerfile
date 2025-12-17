# Multi-stage Dockerfile for MCP ADR Analysis Server
# Optimized for production deployment with native module support

# ============================================
# Stage 1: Build Stage
# ============================================
FROM node:22-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (tree-sitter)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/
COPY patterns/ ./patterns/

# Build the TypeScript project
RUN npm run build

# ============================================
# Stage 2: Production Stage
# ============================================
FROM node:22-slim AS production

WORKDIR /app

# Install runtime dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

# Copy package files
COPY package*.json ./

# Install production dependencies only, skip prepare scripts (husky)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/patterns ./patterns

# Create cache directory with proper permissions
RUN mkdir -p /tmp/mcp-adr-cache && chown -R mcpuser:mcpuser /tmp/mcp-adr-cache

# Set environment variables
ENV NODE_ENV=production
ENV EXECUTION_MODE=full
ENV LOG_LEVEL=info

# Switch to non-root user
USER mcpuser

# Expose MCP server (uses stdio by default, but expose for potential HTTP transport)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Default command to run the MCP server
CMD ["node", "dist/src/index.js"]

# Labels for container metadata
LABEL org.opencontainers.image.title="MCP ADR Analysis Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for architectural analysis and ADR management"
LABEL org.opencontainers.image.version="2.1.21"
LABEL org.opencontainers.image.source="https://github.com/tosin2013/mcp-adr-analysis-server"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.base.name="node:22-slim"
