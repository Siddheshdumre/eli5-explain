# ============================================
# Stage 1: Build dependencies
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies (some Python packages need gcc to compile)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy only requirements first (Docker layer caching — 
# dependencies are re-installed only when requirements.txt changes)
COPY requirements.txt .

# Install Python packages into a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Production runtime
# ============================================
FROM python:3.12-slim AS runtime

# Security: create a non-root user
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid 1000 --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy the virtual environment from builder stage (no gcc/build tools in final image)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY main.py .
COPY healthcheck.py .

# Security: switch to non-root user
USER appuser

# Expose the backend port
EXPOSE 8000

# Health check — Docker will monitor container health
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
    CMD ["python", "healthcheck.py"]

# Production server: Gunicorn with Uvicorn workers
# - Workers: configurable via GUNICORN_WORKERS env var (default: 4)
# - Graceful timeout: 120s for long Groq API calls
# - Access log to stdout for Docker log collection
CMD ["sh", "-c", "gunicorn main:app \
    --workers ${GUNICORN_WORKERS:-4} \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -"]
