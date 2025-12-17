---
title: "ADR-0012: ADR-Agent with Azure AI Foundry Integration"
status: "Accepted"
date: "2025-12-15"
authors: ["Development Team"]
tags: ["architecture", "decision", "agent", "azure", "ai-foundry"]
supersedes: ""
superseded_by: ""
---

# ADR-012: ADR-Agent with Azure AI Foundry Integration

## Status

**Accepted**

## Date

2025-12-15

## Context

The MCP ADR Analysis Server project needed a streamlined approach for generating Architectural Decision Records (ADRs). Several challenges existed:

- **CON-001**: Manual ADR creation was time-consuming and inconsistent in formatting
- **CON-002**: No integration between ADR generation and the project's existing MCP tools
- **CON-003**: AI-powered ADR generation required configuration for each use
- **CON-004**: The generic ADR-Agent from awesome-copilot did not leverage project-specific MCP tools
- **CON-005**: ADR directory path was incorrectly specified (`/docs/adr/` vs `/docs/adrs/`)

### Technical Constraints

- Must integrate with Azure AI Foundry (gpt-4o deployment)
- Must reference the correct ADR directory structure
- Should leverage existing MCP ADR Analysis Server tools
- Should be reusable across VS Code agent workflows

## Decision

We configured the ADR-Agent (`.github/agents/adr-generator.agent.md`) with:

### 1. Azure AI Foundry Integration

Updated the agent description to specify the AI backend:

```yaml
---
name: ADR-Agent
description: Expert agent for creating comprehensive Architectural Decision Records (ADRs) 
  using Azure AI Foundry (gpt-4o) with structured formatting optimized for AI consumption 
  and human readability.
---
```

### 2. MCP Server Reference

Added explicit reference to the ADR Analysis Server:

```yaml
mcpServers:
  - adr-analysis-server
```

### 3. MCP Tool Documentation

Documented available MCP tools for ADR workflows:

| Tool | Purpose |
|------|---------|
| `adr-suggestion` | Generate ADR suggestions based on code changes |
| `review-existing-adrs` | Review and analyze existing ADRs |
| `adr-validation` | Validate ADR structure and content |
| `interactive-adr-planning` | Interactive ADR planning workflow |
| `adr-bootstrap-validation` | Bootstrap ADR validation loops |
| `analyze-project-ecosystem` | Understand project architecture |
| `deployment-readiness` | Check deployment readiness |
| `tool-chain-orchestrator` | Orchestrate complex workflows |

### 4. Corrected ADR Directory Path

Changed all references from `/docs/adr/` to `/docs/adrs/` to match actual project structure.

### 5. Environment Configuration

Created `.env` with dual MCP configuration:

```bash
# Azure AI Foundry MCP
AZURE_AI_ENDPOINT=https://ai-azure-project-202510-resource.services.ai.azure.com
AZURE_AI_PROJECT_ENDPOINT=...
AZURE_AI_AGENT_ID=asst_cS1D8CbXdrNGKBEdFYncJIOv

# MCP ADR Analysis Server - Azure OpenAI
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://ai-azure-project-202510-resource.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
EXECUTION_MODE=full
```

## Consequences

### Positive

- **POS-001**: ADR generation now leverages Azure AI Foundry's gpt-4o model for high-quality output
- **POS-002**: Agent has access to 8 specialized MCP tools for ADR workflows
- **POS-003**: Correct directory path prevents file location errors
- **POS-004**: Dual MCP configuration enables both AI Foundry agents and ADR analysis tools
- **POS-005**: Standardized agent format enables VS Code integration

### Negative

- **NEG-001**: Requires Azure AI Foundry credentials to be configured
- **NEG-002**: MCP server must be running for tool access
- **NEG-003**: Agent file format may change as VS Code agent specification evolves

## Alternatives Considered

### Alternative 1: Use OpenRouter Instead of Azure

- **ALT-001**: Description: Keep using OpenRouter.ai as the AI backend
- **ALT-001**: Rejection Reason: Azure AI Foundry provides enterprise features, existing deployment, and cost management

### Alternative 2: Standalone Agent Without MCP Integration

- **ALT-002**: Description: Use the generic awesome-copilot agent without MCP tool references
- **ALT-002**: Rejection Reason: Would not leverage the project's existing 27+ MCP tools for ADR analysis

### Alternative 3: Create New Agent from Scratch

- **ALT-003**: Description: Build a completely custom agent specification
- **ALT-003**: Rejection Reason: The awesome-copilot template provides a solid foundation; modification was more efficient

## Implementation Notes

- **IMP-001**: Files modified: `.github/agents/adr-generator.agent.md`, `.env`, `mcp-inspector-config.json`
- **IMP-002**: Reload VS Code after changes to pick up new agent configuration
- **IMP-003**: Test with `npm run build && node dist/src/index.js --test` to verify server initialization
- **IMP-004**: Available model deployments: gpt-4o (recommended), gpt-5-mini, DeepSeek-R1-0528, DeepSeek-V3.1

## References

- **REF-001**: [ADR-002: AI Integration Strategy](adr-002-ai-integration-and-advanced-prompting-strategy.md)
- **REF-002**: [awesome-copilot ADR-Agent](https://github.com/github/awesome-copilot/blob/main/agents/adr-generator.agent.md)
- **REF-003**: [Azure AI Foundry MCP](https://github.com/azure-ai-foundry/mcp-foundry)
- **REF-004**: [architecture_openio.md](../../architecture_openio.md) - AI Provider Architecture documentation
