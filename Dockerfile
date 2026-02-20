# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first (layer caching — only reinstall when these change)
COPY package.json package-lock.json ./

# npm ci = clean install from lockfile — deterministic, faster than npm install
RUN npm ci --ignore-scripts

# ============================================
# Stage 2: Build the Vite/React app
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# VITE_API_URL is baked into the JS bundle at build time.
# In production with Nginx reverse proxy, API calls go to the same origin
# so we use a relative path — no need for an absolute URL.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle → /app/dist
RUN npm run build

# ============================================
# Stage 3: Serve with Nginx
# ============================================
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx config and static files
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy our custom Nginx config (created in Step 4)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: run Nginx as non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Expose port 8080 (unprivileged — runs as non-root nginx user)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start Nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
