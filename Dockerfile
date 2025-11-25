# STAGE: build
FROM python:3.13.7-slim-trixie AS build

# Install necessary packages
RUN apt-get update && apt-get install -y make wget npm gh

RUN npm install --global corepack@latest && \
    corepack enable pnpm && \
    corepack use pnpm@latest-10

# STAGE: claude
FROM build AS claude

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

RUN useradd --create-home --shell /bin/bash agents

USER agents

# STAGE: development
FROM claude AS development

WORKDIR /home/agents

COPY . .

RUN pnpm install

CMD ["pnpm", "dev"]
