# AI Provider Architecture - OpenRouter.io & Azure AI Foundry Integration

This document describes the AI execution architecture in the MCP ADR Analysis Server, including multi-provider support for OpenRouter.io, Azure AI Foundry, and OpenAI.

## Overview

The MCP ADR Analysis Server uses a **three-tier architecture** for AI execution that abstracts provider-specific details and enables seamless switching between AI backends.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TIER 1: TOOL LAYER                                  │
│                                                                             │
│   src/tools/*.ts - 27+ MCP tools that provide AI-powered analysis          │
│   Examples: adr-suggestion-tool, deployment-readiness-tool,                 │
│             tool-chain-orchestrator, research-question-tool                 │
│                                                                             │
│   Usage: executePromptWithFallback() or getAIExecutor().executePrompt()     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 2: PROMPT EXECUTION LAYER                           │
│                                                                             │
│   src/utils/prompt-execution.ts                                             │
│                                                                             │
│   - executePromptWithFallback() - Primary entry point for tools             │
│   - Handles AI/prompt-only mode switching                                   │
│   - Graceful fallback on AI failure (returns prompt for manual execution)   │
│   - JSON response parsing and validation                                    │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TIER 3: AI EXECUTOR LAYER                              │
│                                                                             │
│   src/utils/ai-executor.ts                                                  │
│                                                                             │
│   - AIExecutor class (singleton pattern via getAIExecutor())                │
│   - Provider-agnostic OpenAI SDK client                                     │
│   - Multi-provider support: OpenRouter, Azure AI Foundry, OpenAI            │
│   - Response caching with configurable TTL                                  │
│   - Retry logic with exponential backoff                                    │
│   - Structured JSON response handling                                       │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI PROVIDER APIs                                    │
│                                                                             │
│   ┌─────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐   │
│   │  OpenRouter.ai  │  │  Azure AI Foundry    │  │      OpenAI         │   │
│   │                 │  │  (Azure OpenAI)      │  │                     │   │
│   │ openrouter.ai/  │  │ <resource>.openai.   │  │  api.openai.com/v1  │   │
│   │ api/v1          │  │ azure.com            │  │                     │   │
│   └─────────────────┘  └──────────────────────┘  └─────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Provider Selection

The AI provider is selected via the `AI_PROVIDER` environment variable:

```bash
# Options: 'openrouter' (default), 'azure', 'openai'
export AI_PROVIDER=azure
```

### Environment Variables by Provider

#### OpenRouter (Default)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `openrouter` | Set to `openrouter` |
| `OPENROUTER_API_KEY` | **Yes** | - | API key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `AI_MODEL` | No | `anthropic/claude-3-sonnet` | Model identifier (provider/model format) |
| `SITE_URL` | No | GitHub repo URL | For OpenRouter rankings |
| `SITE_NAME` | No | `MCP ADR Analysis Server` | For OpenRouter rankings |

#### Azure AI Foundry

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | **Yes** | - | Set to `azure` |
| `AZURE_OPENAI_ENDPOINT` | **Yes** | - | Azure OpenAI endpoint URL (e.g., `https://<resource>.openai.azure.com`) |
| `AZURE_OPENAI_API_KEY` | **Yes** | - | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | **Yes** | - | Deployment name (e.g., `gpt-4-turbo`) |
| `AZURE_OPENAI_API_VERSION` | No | `2024-08-01-preview` | API version |

#### OpenAI Direct

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | **Yes** | - | Set to `openai` |
| `OPENAI_API_KEY` | **Yes** | - | OpenAI API key |
| `AI_MODEL` | No | `gpt-4o` | Model identifier |

### Common Configuration (All Providers)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EXECUTION_MODE` | `'full'` \| `'prompt-only'` | `'full'` | AI execution mode |
| `AI_TIMEOUT` | number | `60000` | Request timeout (ms) |
| `AI_MAX_RETRIES` | number | `3` | Max retry attempts |
| `AI_TEMPERATURE` | float | `0.1` | Response temperature (0-1) |
| `AI_MAX_TOKENS` | number | `4000` | Max response tokens |
| `AI_CACHE_ENABLED` | boolean | `true` | Enable response caching |
| `AI_CACHE_TTL` | number | `3600` | Cache TTL (seconds) |

## Key Components

### 1. AI Configuration (`src/config/ai-config.ts`)

Manages AI provider configuration with:

- **`AIConfig` interface**: Provider-agnostic configuration structure
- **`loadAIConfig()`**: Loads and validates configuration from environment
- **`validateAIConfig()`**: Validates required fields per provider (fails fast)
- **`isAIExecutionEnabled()`**: Checks if AI execution is available

```typescript
// Example configuration loading
const config = loadAIConfig();
// Throws descriptive error if required env vars missing for selected provider
```

### 2. AI Executor (`src/utils/ai-executor.ts`)

Core execution service with:

- **Singleton pattern**: `getAIExecutor()` returns global instance
- **Provider-aware client**: Uses `OpenAI` or `AzureOpenAI` SDK based on provider
- **Caching**: In-memory cache with configurable TTL
- **Retry logic**: Exponential backoff (1s, 2s, 4s... up to 10s max)
- **Structured responses**: `executeStructuredPrompt<T>()` for JSON parsing

```typescript
// Basic prompt execution
const executor = getAIExecutor();
const result = await executor.executePrompt('Analyze this architecture...', {
  temperature: 0.1,
  maxTokens: 4000,
});

// Structured JSON response
const { data } = await executor.executeStructuredPrompt<AnalysisResult>(
  'Return analysis as JSON...',
  AnalysisSchema
);
```

### 3. Prompt Execution (`src/utils/prompt-execution.ts`)

High-level abstraction providing:

- **Fallback behavior**: Returns prompt text if AI execution fails
- **Mode switching**: Respects `EXECUTION_MODE` setting
- **Error handling**: Graceful degradation without throwing

```typescript
const result = await executePromptWithFallback(prompt, instructions, {
  temperature: 0.1,
  maxTokens: 5000,
  responseFormat: 'json',
});

if (result.mode === 'prompt-only') {
  // AI unavailable, result.content contains the prompt for manual execution
}
```

## Provider-Specific Details

### OpenRouter.ai

OpenRouter acts as a unified gateway to multiple AI providers:

- **Multi-model access**: Claude, GPT-4, Mistral, Llama, etc.
- **Model format**: `provider/model-name` (e.g., `anthropic/claude-3-sonnet`)
- **Custom headers**: `HTTP-Referer` and `X-Title` for usage tracking
- **Cost tracking**: Per-request pricing varies by model

### Azure AI Foundry

Azure OpenAI Service integration:

- **Deployment-based**: Uses deployment names instead of model names
- **Enterprise features**: Private networking, RBAC, audit logs
- **Regional endpoints**: `https://<resource-name>.openai.azure.com`
- **API versioning**: Must specify `api-version` query parameter

### OpenAI Direct

Standard OpenAI API:

- **Direct access**: No intermediary routing
- **Model names**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, etc.
- **Simple auth**: Bearer token authentication

## Caching System

The AI Executor implements an in-memory cache:

```typescript
// Cache key generation (base64 hash of prompt + model + options)
const cacheKey = generateCacheKey(prompt, model, options);

// Cache entry structure
interface CacheEntry {
  result: AIExecutionResult;
  expiry: number; // Unix timestamp
}

// Automatic cleanup when cache exceeds 100 entries
```

**Cache behavior:**
- Enabled by default (`AI_CACHE_ENABLED=true`)
- 1-hour TTL (`AI_CACHE_TTL=3600`)
- Identical prompts with same model/options return cached result
- Cache cleared on configuration change

## Error Handling

### Startup Validation

The configuration system performs **fail-fast validation**:

```typescript
// Missing required env vars throw descriptive errors
loadAIConfig();
// Error: Azure AI Foundry requires AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, 
//        and AZURE_OPENAI_DEPLOYMENT environment variables
```

### Runtime Errors

```typescript
interface AIExecutionError extends Error {
  code: string;           // 'AI_UNAVAILABLE', 'AI_EXECUTION_FAILED', etc.
  retryable: boolean;     // Whether retry might succeed
  originalError?: unknown; // Underlying error
}
```

**Error codes:**
| Code | Description | Retryable |
|------|-------------|-----------|
| `AI_UNAVAILABLE` | AI execution not configured/enabled | No |
| `AI_EXECUTION_FAILED` | API call failed after retries | No |
| `AI_JSON_PARSE_ERROR` | Response not valid JSON | No |
| `AI_UNEXPECTED_ERROR` | Unknown error | No |

## Usage Patterns

### Pattern 1: Tool with Fallback (Recommended)

```typescript
// Most tools use this pattern
import { executePromptWithFallback } from '../utils/prompt-execution.js';

const result = await executePromptWithFallback(
  prompt,
  'You are an architecture expert...',
  { temperature: 0.1, maxTokens: 4000 }
);

return {
  content: [{ type: 'text', text: result.content }],
};
```

### Pattern 2: Direct Executor (For JSON Responses)

```typescript
import { getAIExecutor } from '../utils/ai-executor.js';

const executor = getAIExecutor();
const { data } = await executor.executeStructuredPrompt<MySchema>(
  prompt,
  MyZodSchema
);
```

### Pattern 3: Check Before Execute

```typescript
import { isAIExecutionEnabled, loadAIConfig } from '../config/ai-config.js';

const config = loadAIConfig();
if (!isAIExecutionEnabled(config)) {
  return { content: 'AI execution not available. Configure API key.' };
}
```

## File Structure

```
src/
├── config/
│   └── ai-config.ts        # Configuration loading, validation, provider selection
├── utils/
│   ├── ai-executor.ts      # Core AI execution with caching and retries
│   └── prompt-execution.ts # High-level abstraction with fallback
└── tools/
    └── *.ts                # MCP tools using AI execution
```

## Testing

### Unit Tests

```bash
npm test -- --testPathPattern=ai-config
npm test -- --testPathPattern=ai-executor
```

### Integration Testing

```bash
# Test with OpenRouter
export AI_PROVIDER=openrouter
export OPENROUTER_API_KEY=your-key
npm run test:integration

# Test with Azure
export AI_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_API_KEY=your-key
export AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
npm run test:integration
```

### Prompt-Only Mode Testing

```bash
# Disable AI execution for testing tool logic
export EXECUTION_MODE=prompt-only
npm test
```

## Migration Guide

### From OpenRouter-Only to Multi-Provider

1. **No code changes required** for existing OpenRouter setups
2. **To use Azure**: Set `AI_PROVIDER=azure` and Azure env vars
3. **To use OpenAI**: Set `AI_PROVIDER=openai` and `OPENAI_API_KEY`

### Adding New Providers

1. Add provider type to `AIProvider` enum in `ai-config.ts`
2. Add provider case in `loadAIConfig()` switch statement
3. Add validation logic in `validateProviderConfig()`
4. Add client initialization in `AIExecutor.initializeClient()`
5. Update tests and documentation

## Security Considerations

- **API keys**: Never commit to source control; use environment variables
- **Azure**: Supports managed identity for keyless authentication
- **Caching**: Disable for sensitive prompts (`AI_CACHE_ENABLED=false`)
- **Logging**: API keys are never logged; only model and token counts

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "AI execution not available" | Missing API key or wrong mode | Check env vars and `EXECUTION_MODE` |
| "Azure requires..." error | Missing Azure env vars | Set all required Azure variables |
| Slow responses | No caching or cold start | Enable caching, check timeout settings |
| Rate limiting | Too many requests | Increase retry delays, use caching |

### Debug Mode

```bash
# Enable verbose logging
export LOG_LEVEL=debug
npm run dev
```
