# Configuration Guide

This guide covers all configuration options for the MCP ADR Analysis Server, including multi-provider AI support.

## Quick Start

### OpenRouter (Default)

```bash
export AI_PROVIDER=openrouter
export OPENROUTER_API_KEY=your-api-key
export EXECUTION_MODE=full
```

### Azure AI Foundry

```bash
export AI_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_API_KEY=your-azure-key
export AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
export EXECUTION_MODE=full
```

### OpenAI Direct

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=your-openai-key
export EXECUTION_MODE=full
```

---

## AI Provider Configuration

### Provider Selection

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `AI_PROVIDER` | `openrouter`, `azure`, `openai` | `openrouter` | AI provider to use |
| `EXECUTION_MODE` | `full`, `prompt-only` | `full` | AI execution mode |

### OpenRouter Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | **Yes** (full mode) | - | API key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `AI_MODEL` | No | `anthropic/claude-3-sonnet` | Model ID (format: `provider/model`) |
| `SITE_URL` | No | GitHub repo URL | For OpenRouter rankings |
| `SITE_NAME` | No | `MCP ADR Analysis Server` | For OpenRouter rankings |

**Available Models (via OpenRouter):**
- `anthropic/claude-3-sonnet` - Best for analysis and reasoning
- `anthropic/claude-3-haiku` - Fast, cost-effective
- `openai/gpt-4o` - High capability
- `openai/gpt-4o-mini` - Cost-effective GPT-4

### Azure AI Foundry Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AZURE_OPENAI_ENDPOINT` | **Yes** | - | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | **Yes** | - | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | **Yes** | - | Deployment name (e.g., `gpt-4-turbo`) |
| `AZURE_OPENAI_API_VERSION` | No | `2024-08-01-preview` | API version |

**Example Azure Setup:**

```bash
# Get these from Azure Portal > Azure OpenAI > Keys and Endpoint
export AZURE_OPENAI_ENDPOINT=https://my-resource.openai.azure.com
export AZURE_OPENAI_API_KEY=abc123def456...
export AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo  # Your deployment name
```

### OpenAI Direct Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | **Yes** (full mode) | - | OpenAI API key |
| `AI_MODEL` | No | `gpt-4o` | Model name |

---

## Common AI Settings

These settings apply to all providers:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AI_TIMEOUT` | number | `60000` | Request timeout (ms) |
| `AI_MAX_RETRIES` | number | `3` | Max retry attempts |
| `AI_TEMPERATURE` | float | `0.1` | Response temperature (0-1) |
| `AI_MAX_TOKENS` | number | `4000` | Max response tokens |
| `AI_CACHE_ENABLED` | boolean | `true` | Enable response caching |
| `AI_CACHE_TTL` | number | `3600` | Cache TTL (seconds) |

---

## Project Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PROJECT_PATH` | No | Current directory | Target project for analysis |
| `ADR_DIRECTORY` | No | `docs/adrs` | ADR storage directory |
| `LOG_LEVEL` | No | `info` | Logging verbosity |

---

## Web Research Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIRECRAWL_API_KEY` | No | - | Enable web research tools |

---

## Validation

The server validates configuration on startup:

- **Full mode**: Requires API key for selected provider
- **Prompt-only mode**: No API key required (returns prompts for manual execution)

**Error Example:**
```
Error: Azure AI Foundry requires the following environment variables: 
AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT.
Set AI_PROVIDER=openrouter or AI_PROVIDER=openai to use a different provider,
or set EXECUTION_MODE=prompt-only to disable AI execution.
```

---

## Example Configurations

### Development (Prompt-Only)

```bash
export EXECUTION_MODE=prompt-only
export PROJECT_PATH=/path/to/project
```

### Production with OpenRouter

```bash
export AI_PROVIDER=openrouter
export OPENROUTER_API_KEY=sk-or-v1-...
export EXECUTION_MODE=full
export AI_CACHE_ENABLED=true
export AI_CACHE_TTL=7200
```

### Enterprise with Azure

```bash
export AI_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://mycompany.openai.azure.com
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_DEPLOYMENT=gpt-4-enterprise
export AZURE_OPENAI_API_VERSION=2024-08-01-preview
export EXECUTION_MODE=full
export AI_MAX_TOKENS=8000
```

---

## Troubleshooting

### "AI execution not available"

1. Check `EXECUTION_MODE` is `full`
2. Verify API key is set for your provider
3. Check network connectivity to provider

### Azure Connection Issues

1. Verify endpoint URL format: `https://<resource>.openai.azure.com`
2. Check deployment name matches exactly
3. Ensure API key has correct permissions

### Rate Limiting

Increase retry settings:
```bash
export AI_MAX_RETRIES=5
export AI_TIMEOUT=120000
```

---

## Architecture Reference

See [architecture_openio.md](../architecture_openio.md) for detailed architecture documentation.
