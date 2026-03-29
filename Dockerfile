# ──────────────────────────────────────────────────────────
# Stage 1 – builder
# Installs uv, dependencies, and compiles the virtual environment.
# ──────────────────────────────────────────────────────────
FROM python:3.13-slim AS builder


# from Astral's official Docker image. It is much faster and cleaner.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Crucial for multi-stage builds: forces uv to copy files instead of hard-linking them.
# Hard links break when copying the .venv between Docker stages.
ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_NO_DEV=1

# Copy dependency manifests first for layer caching
COPY pyproject.toml uv.lock README.md ./

# Install third-party dependencies into /app/.venv
RUN uv sync --locked --no-install-project

# Copy your project source code
COPY src/ ./src/

# Sync again to install the project package itself into the existing .venv
RUN uv sync --locked

# ──────────────────────────────────────────────────────────
# Stage 2 – final runtime image
# Pure Python runtime. No uv, no apt-get, no curl.
# ──────────────────────────────────────────────────────────
FROM python:3.13-slim AS final

WORKDIR /app

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy only the necessary source code for runtime
COPY src/ ./src/

# Place the virtual environment's bin directory at the front of the PATH.
# This means running "python" will automatically use the isolated .venv!
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8015

# Start the server directly using Python, completely bypassing uv
CMD ["python", "src/__init__.py", "--env", "prod"]