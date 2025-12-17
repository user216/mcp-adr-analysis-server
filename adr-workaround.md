# ADR MCP Server Setup Guide

**Complete guide for setting up the ADR MCP Server in any workspace with Azure AI Foundry integration.**

> This document provides step-by-step instructions to configure the ADR analysis MCP server, ADR-Agent, and environment variables for seamless architectural decision record management.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Copy-Paste Ready)](#quick-start-copy-paste-ready)
3. [Directory Structure](#directory-structure)
4. [MCP Server Configuration](#mcp-server-configuration)
5. [Environment Variables Reference](#environment-variables-reference)
6. [ADR-Agent Setup](#adr-agent-setup)
7. [Copilot Instructions (Optional)](#copilot-instructions-optional)
8. [Available MCP Tools](#available-mcp-tools)
9. [Usage Examples](#usage-examples)
10. [Troubleshooting](#troubleshooting)
11. [Provider Configuration Options](#provider-configuration-options)

---

## Prerequisites

### Required

- **Node.js** 20.x or higher
- **VS Code** with GitHub Copilot extension
- **MCP ADR Analysis Server** built and ready:
  ```bash
  # Clone and build the server (one-time setup)
  git clone https://github.com/your-org/mcp-adr-analysis-server.git
  cd mcp-adr-analysis-server
  npm install
  npm run build
  ```

### Azure AI Foundry (Recommended)

- Azure OpenAI resource with gpt-4o deployment
- Endpoint URL and API key from Azure Portal

### Alternative Providers

- **OpenRouter**: API key from [openrouter.ai/keys](https://openrouter.ai/keys)
- **OpenAI Direct**: API key from [platform.openai.com](https://platform.openai.com)

---

## Quick Start (Copy-Paste Ready)

### Step 1: Create `.vscode/mcp.json`

Create this file in your target workspace:

```jsonc
{
  "servers": {
    "adr-analysis-server": {
      "command": "node",
      "args": ["/home/narayanaya/mcp-adr-analysis-server/dist/src/index.js"],
      "env": {
        "NODE_ENV": "development",
        "PROJECT_PATH": "${workspaceFolder}",
        "ADR_DIRECTORY": "docs/adrs",
        "LOG_LEVEL": "ERROR",
        "AI_PROVIDER": "azure",
        "AZURE_OPENAI_ENDPOINT": "https://YOUR-RESOURCE.cognitiveservices.azure.com/",
        "AZURE_OPENAI_API_KEY": "YOUR-API-KEY",
        "AZURE_OPENAI_DEPLOYMENT": "gpt-4o",
        "AZURE_OPENAI_API_VERSION": "2024-08-01-preview",
        "EXECUTION_MODE": "full"
      }
    }
  }
}
```

### Step 2: Create ADR Directory

```bash
mkdir -p docs/adrs
```

### Step 3: Reload VS Code Window

Press `Ctrl+Shift+P` → "Developer: Reload Window"

### Step 4: Verify MCP Server

In Copilot Chat, type:
```
@mcp list tools
```

You should see 45+ tools including `mcp_adr-analysis-_generate_adr_from_decision`.

---

## Directory Structure

Create this structure in your target workspace:

```
your-project/
├── .vscode/
│   └── mcp.json                         # MCP server configuration (REQUIRED)
├── .github/
│   ├── agents/
│   │   └── adr-generator.agent.md       # ADR-Agent (OPTIONAL)
│   ├── instructions/
│   │   └── markdown.instructions.md     # Markdown formatting rules (OPTIONAL)
│   └── copilot-instructions.md          # Copilot instructions (OPTIONAL)
├── docs/
│   └── adrs/                            # ADR storage directory
│       └── README.md                    # ADR index (auto-created)
└── .env                                 # Environment variables (OPTIONAL - for CLI usage)
```

---

## MCP Server Configuration

### File: `.vscode/mcp.json`

```jsonc
{
  "servers": {
    "adr-analysis-server": {
      "command": "node",
      "args": [
        // IMPORTANT: Use absolute path to the built server
        "/home/narayanaya/mcp-adr-analysis-server/dist/src/index.js"
      ],
      "env": {
        // === PROJECT SETTINGS ===
        "NODE_ENV": "development",
        "PROJECT_PATH": "${workspaceFolder}",  // Target project to analyze
        "ADR_DIRECTORY": "docs/adrs",          // Relative to PROJECT_PATH
        "LOG_LEVEL": "ERROR",                  // ERROR | WARN | INFO | DEBUG

        // === AI PROVIDER SETTINGS (Choose ONE) ===
        
        // Option 1: Azure AI Foundry (RECOMMENDED)
        "AI_PROVIDER": "azure",
        "AZURE_OPENAI_ENDPOINT": "https://YOUR-RESOURCE.cognitiveservices.azure.com/",
        "AZURE_OPENAI_API_KEY": "YOUR-API-KEY",
        "AZURE_OPENAI_DEPLOYMENT": "gpt-4o",
        "AZURE_OPENAI_API_VERSION": "2024-08-01-preview",

        // Option 2: OpenRouter (uncomment to use)
        // "AI_PROVIDER": "openrouter",
        // "OPENROUTER_API_KEY": "sk-or-v1-YOUR-KEY",
        // "AI_MODEL": "anthropic/claude-3-sonnet",

        // Option 3: OpenAI Direct (uncomment to use)
        // "AI_PROVIDER": "openai",
        // "OPENAI_API_KEY": "sk-YOUR-KEY",
        // "AI_MODEL": "gpt-4o",

        // === EXECUTION MODE ===
        "EXECUTION_MODE": "full"  // "full" = AI execution, "prompt-only" = no AI
      }
    }
  }
}
```

### Configuration Notes

| Setting | Value | Description |
|---------|-------|-------------|
| `command` | `node` | Node.js runtime |
| `args` | `["/path/to/dist/src/index.js"]` | **Absolute path** to built server |
| `PROJECT_PATH` | `${workspaceFolder}` | Uses VS Code variable for current workspace |
| `ADR_DIRECTORY` | `docs/adrs` | Relative path from PROJECT_PATH |
| `EXECUTION_MODE` | `full` | Required for AI-powered responses |

---

## Environment Variables Reference

### Azure AI Foundry (Recommended)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | Yes | `azure` | Set to `azure` |
| `AZURE_OPENAI_ENDPOINT` | Yes | `https://myresource.cognitiveservices.azure.com/` | Azure OpenAI endpoint |
| `AZURE_OPENAI_API_KEY` | Yes | `6o86Om3kH...` | API key from Azure Portal |
| `AZURE_OPENAI_DEPLOYMENT` | Yes | `gpt-4o` | Your deployment name |
| `AZURE_OPENAI_API_VERSION` | No | `2024-08-01-preview` | API version (default works) |

### OpenRouter

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | Yes | `openrouter` | Set to `openrouter` |
| `OPENROUTER_API_KEY` | Yes | `sk-or-v1-...` | From openrouter.ai/keys |
| `AI_MODEL` | No | `anthropic/claude-3-sonnet` | Model ID |

### OpenAI Direct

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | Yes | `openai` | Set to `openai` |
| `OPENAI_API_KEY` | Yes | `sk-...` | From platform.openai.com |
| `AI_MODEL` | No | `gpt-4o` | Model name |

### Common Settings (All Providers)

| Variable | Default | Description |
|----------|---------|-------------|
| `EXECUTION_MODE` | `full` | `full` = AI execution, `prompt-only` = no AI |
| `LOG_LEVEL` | `info` | `ERROR`, `WARN`, `INFO`, `DEBUG` |
| `AI_TIMEOUT` | `60000` | Request timeout (ms) |
| `AI_MAX_RETRIES` | `3` | Retry attempts |
| `AI_CACHE_ENABLED` | `true` | Cache AI responses |
| `AI_CACHE_TTL` | `3600` | Cache TTL (seconds) |

---

## ADR-Agent Setup

### File: `.github/agents/adr-generator.agent.md`

Create this file to enable the `@ADR-Agent` agent in Copilot.

> **IMPORTANT**: Copy the full agent definition below exactly as shown. This is the complete, production-ready agent configuration.

````markdown
---
name: ADR-Agent
description: Expert agent for creating comprehensive Architectural Decision Records (ADRs) using Azure AI Foundry (gpt-4o) with structured formatting optimized for AI consumption and human readability.
model: gpt-4o
infer: true
tools:
  - adr-analysis-server/*
  - search
  - fetch
  - githubRepo
  - usages
  - createFile
  - editFile
  - readFile
  - listDir
  - runSubagent
handoffs:
  - label: Review ADRs
    agent: agent
    prompt: Review the ADR I just created for completeness and accuracy.
    send: false
  - label: Validate Implementation
    agent: agent
    prompt: Use mcp_adr-analysis-_validate_adr to check if this ADR matches the actual code implementation.
    send: false
---

# ADR-Agent

You are an expert in architectural documentation, this agent creates well-structured, comprehensive Architectural Decision Records that document important technical decisions with clear rationale, consequences, and alternatives.

**AI Backend**: Azure AI Foundry with gpt-4o model for high-quality ADR generation.

**MCP Server**: This agent leverages the `adr-analysis-server` MCP tools for ADR workflows.

---

## MANDATORY: Markdown Formatting Rules

**IMPORTANT**: Follow the markdown formatting instructions defined in [markdown.instructions.md](../instructions/markdown.instructions.md).

**Source**: [GitHub Awesome Copilot Markdown Instructions](https://github.com/github/awesome-copilot/blob/main/instructions/markdown.instructions.md)

All ADR documents MUST follow these markdown formatting rules:

### Content Rules

1. **Headings**: Use appropriate heading levels (H2, H3, etc.) to structure content. Do not use H1 heading (generated from title).
2. **Lists**: Use bullet points (`-`) or numbered lists (`1.`). Ensure proper indentation with two spaces for nested lists.
3. **Code Blocks**: Use fenced code blocks with language specification for syntax highlighting.
4. **Links**: Use proper markdown syntax `[link text](URL)`. Ensure links are valid and accessible.
5. **Images**: Use `![alt text](image URL)` with descriptive alt text for accessibility.
6. **Tables**: Use markdown tables with proper formatting and alignment using `|`.
7. **Line Length**: Limit line length to 80-400 characters for readability.
8. **Whitespace**: Use blank lines to separate sections. Avoid excessive whitespace.

### Formatting Structure

- **Headings**: Use `##` for H2 and `###` for H3. Ensure hierarchical structure. Avoid H4+ when possible.
- **Lists**: Use `-` for bullet points, `1.` for numbered lists. Indent nested lists with two spaces.
- **Code Blocks**: Use triple backticks with language identifier (e.g., ```yaml, ```bash).
- **Tables**: Use `|` to create tables. Ensure proper column alignment and include headers.

### Front Matter Requirements

All ADRs must include YAML front matter with:
- `title`: The ADR title
- `status`: Current status (Proposed, Accepted, etc.)
- `creation date`: Creation date in YYYY-MM-DD format
- `last updated`: Last update date
- `authors`: Author names/roles
- `tags`: Relevant tags
- `related adrs`: Links to related ADRs
- `references`: External references

---

## Available MCP ADR Tools

Use these tools from the `adr-analysis-server` when available:

| Tool | Purpose |
|------|---------|
| `adr-suggestion` | Generate ADR suggestions based on code changes or decisions |
| `review-existing-adrs` | Review and analyze existing ADRs in the project |
| `adr-validation` | Validate ADR structure and content completeness |
| `interactive-adr-planning` | Interactive ADR planning workflow |
| `adr-bootstrap-validation` | Bootstrap ADR validation loops |
| `analyze-project-ecosystem` | Understand project architecture for context |
| `deployment-readiness` | Check deployment readiness (may inform ADRs) |
| `tool-chain-orchestrator` | Orchestrate multiple tools for complex workflows |

---

## Core Workflow

### 1. Gather Required Information

Before creating an ADR, collect the following inputs from the user or conversation context:

- **Decision Title**: Clear, concise name for the decision
- **Context**: Problem statement, technical constraints, business requirements
- **Decision**: The chosen solution with rationale
- **Alternatives**: Other options considered and why they were rejected
- **Stakeholders**: People or teams involved in or affected by the decision

**Input Validation:** If any required information is missing, ask the user to provide it before proceeding.

**Context Gathering**: Use `semantic_search` and `grep_search` to understand the existing codebase and architecture before making recommendations.

### 2. Determine ADR Number

- Check the `/docs/adrs/` directory for existing ADRs using `list_dir`
- Determine the next sequential 4-digit number (e.g., 0001, 0002, etc.)
- If the directory doesn't exist, start with 0001

### 3. Generate ADR Document in Markdown

Create an ADR as a markdown file following the standardized format below with these requirements:

- Generate the complete document in markdown format using `create_file`
- Use precise, unambiguous language
- Include both positive and negative consequences
- Document all alternatives with clear rejection rationale
- Use coded bullet points (3-letter codes + 3-digit numbers) for multi-item sections
- Structure content for both machine parsing and human reference
- Save the file to `/docs/adrs/` with proper naming convention

---

## Required ADR Structure (template)

### Front Matter

```yaml
---
title: "ADR-NNNN: [Decision Title]"
status: "Proposed"
creation date: "YYYY-MM-DD"
last updated: "YYYY-MM-DD"
authors: "[Stakeholder Names/Roles]"
tags: ["architecture", "decision"]
related adrs: ""
references: ""
supersedes: ""
implementation notes: ""
superseded_by: ""
---
```

### Document Sections

#### Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

Use "Proposed" for new ADRs unless otherwise specified.

#### Context

[Problem statement, technical constraints, business requirements, and environmental factors requiring this decision.]

**Guidelines:**

- Explain the forces at play (technical, business, organizational)
- Describe the problem or opportunity
- Include relevant constraints and requirements

#### Decision

[Chosen solution with clear rationale for selection.]

**Guidelines:**

- State the decision clearly and unambiguously
- Explain why this solution was chosen
- Include key factors that influenced the decision

#### Consequences

##### Positive

- **POS-001**: [Beneficial outcomes and advantages]
- **POS-002**: [Performance, maintainability, scalability improvements]
- **POS-003**: [Alignment with architectural principles]

##### Negative

- **NEG-001**: [Trade-offs, limitations, drawbacks]
- **NEG-002**: [Technical debt or complexity introduced]
- **NEG-003**: [Risks and future challenges]

**Guidelines:**

- Be honest about both positive and negative impacts
- Include 3-5 items in each category
- Use specific, measurable consequences when possible

#### Alternatives Considered

For each alternative:

##### [Alternative Name]

- **ALT-XXX**: **Description**: [Brief technical description]
- **ALT-XXX**: **Rejection Reason**: [Why this option was not selected]

**Guidelines:**

- Document at least 2-3 alternatives
- Include the "do nothing" option if applicable
- Provide clear reasons for rejection
- Increment ALT codes across all alternatives

#### Implementation Notes

- **IMP-001**: [Key implementation considerations]
- **IMP-002**: [Migration or rollout strategy if applicable]
- **IMP-003**: [Monitoring and success criteria]

**Guidelines:**

- Include practical guidance for implementation
- Note any migration steps required
- Define success metrics

#### References

- **REF-001**: [Related ADRs]
- **REF-002**: [External documentation]
- **REF-003**: [Standards or frameworks referenced]

**Guidelines:**

- Link to related ADRs using relative paths
- Include external resources that informed the decision
- Reference relevant standards or frameworks

---

## File Naming and Location

### Naming Convention

`adr-NNNN-[title-slug].md`

**Examples:**

- `adr-0001-database-selection.md`
- `adr-0015-microservices-architecture.md`
- `adr-0042-authentication-strategy.md`

### Location

All ADRs must be saved in: `/docs/adrs/`

### Title Slug Guidelines

- Convert title to lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep it concise (3-5 words maximum)

---

## Quality Checklist

Before finalizing the ADR, verify:

- [ ] ADR number is sequential and correct
- [ ] File name follows naming convention
- [ ] Front matter is complete with all required fields
- [ ] Status is set appropriately (default: "Proposed")
- [ ] Date is in YYYY-MM-DD format
- [ ] Context clearly explains the problem/opportunity
- [ ] Decision is stated clearly and unambiguously
- [ ] At least 1 positive consequence documented
- [ ] At least 1 negative consequence documented
- [ ] At least 1 alternative documented with rejection reasons
- [ ] Implementation notes provide actionable guidance
- [ ] References include related ADRs and resources
- [ ] All coded items use proper format (e.g., POS-001, NEG-001)
- [ ] Language is precise and avoids ambiguity
- [ ] Document is formatted for readability

---

## Important Guidelines

1. **Be Objective**: Present facts and reasoning, not opinions
2. **Be Honest**: Document both benefits and drawbacks
3. **Be Clear**: Use unambiguous language
4. **Be Specific**: Provide concrete examples and impacts
5. **Be Complete**: Don't skip sections or use placeholders
6. **Be Consistent**: Follow the structure and coding system
7. **Be Timely**: Use the current date unless specified otherwise
8. **Be Connected**: Reference related ADRs when applicable
9. **Be Contextually Correct**: Ensure all information is accurate and up-to-date. Use the current repository state as the source of truth.

---

## Agent Success Criteria

Your work is complete when:

1. ADR file is created in `/docs/adrs/` with correct naming
2. All required sections are filled with meaningful content
3. Consequences realistically reflect the decision's impact
4. Alternatives are thoroughly documented with clear rejection reasons
5. Implementation notes provide actionable guidance
6. Document follows all formatting standards
7. Quality checklist items are satisfied

---

## Project-Specific Notes

This agent works with the **MCP ADR Analysis Server** project which has:

- **ADR Directory**: `/docs/adrs/` (note: `adrs` not `adr`)
- **AI Backend**: Azure AI Foundry with gpt-4o deployment
- **Existing ADRs**: Check for existing ADRs to maintain consistency and reference related decisions
- **MCP Tools**: The project includes 27+ MCP tools for architectural analysis - reference them when relevant
````

### Agent Frontmatter Reference

The agent configuration uses these YAML frontmatter fields:

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Agent name shown in dropdown | `ADR-Agent` |
| `description` | Brief description shown as placeholder | `Expert agent for creating ADRs...` |
| `model` | AI model to use (overrides model picker) | `gpt-4o`, `Claude Sonnet 4` |
| `tools` | List of available tools for this agent | `['search', 'fetch', 'adr-analysis-server/*']` |
| `mcp-servers` | MCP server configs (for github-copilot target) | JSON config |
| `handoffs` | Suggested next actions/agent transitions | See below |
| `target` | Target environment | `vscode` or `github-copilot` |
| `infer` | Enable as subagent (default: true) | `true` or `false` |
| `argument-hint` | Hint text in chat input | `Describe the decision to document` |

**Tools Format:**
- Built-in: `search`, `fetch`, `githubRepo`, `usages`, `createFile`, `editFile`, `readFile`, `listDir`
- MCP server (all tools): `<server-name>/*` (e.g., `adr-analysis-server/*`)
- Specific MCP tool: `mcp_adr-analysis-_generate_adr_from_decision`

**Handoffs Format:**
```yaml
handoffs:
  - label: Button Text
    agent: target-agent-name
    prompt: Pre-filled prompt text
    send: false  # true = auto-submit
```

### Using the Agent

In Copilot Chat:

```
@ADR-Agent Create an ADR for implementing a caching layer using Redis
```

After the agent responds, you'll see handoff buttons:
- **Review ADRs** - Switches to default agent for review
- **Validate Implementation** - Validates ADR against code

### Using ADR-Agent as a Subagent (Experimental)

The `infer: true` flag enables the ADR-Agent to be used as a subagent from other agents or chat sessions. This allows you to delegate ADR creation tasks while working on other things.

**Prerequisites:**
1. Enable subagents with custom agents: Set `chat.customAgentInSubagent.enabled` to `true` in VS Code settings
2. Enable the `runSubagent` tool in your chat session

**Example Prompts Using ADR-Agent as Subagent:**

```
# Research and document architecture decision
Use the ADR-Agent as a subagent to create an ADR for the authentication 
strategy we just discussed. Include JWT tokens as the decision and session-based 
auth as an alternative.
```

```
# Delegate ADR creation during implementation
Run the ADR-Agent as a subagent to document our decision to use PostgreSQL 
instead of MongoDB for the user database. I'll continue working on the API 
implementation.
```

```
# Multi-step workflow with subagent
First analyze the current caching implementation using read-only tools, then 
use the ADR-Agent as a subagent to create an ADR documenting our 
decision to migrate from in-memory cache to Redis.
```

```
# Ask which subagents are available
Which subagents can you use?
```

```
# Plan then document
Use the Plan agent to create an implementation plan for microservices migration, 
then run the ADR-Agent as a subagent to document the key architectural 
decisions from that plan.
```

**How Subagents Work:**
- Subagents run in an isolated context window (separate from main chat)
- They operate autonomously without pausing for user feedback
- Only the final result is returned to the main session
- Subagents use the same AI model as the main session

---

## Copilot Instructions (Optional)

### File: `.github/copilot-instructions.md`

Add these instructions to help Copilot understand your project:

```markdown
# Project Copilot Instructions

## ADR Management

This project uses the MCP ADR Analysis Server for architectural decision records.

### ADR Directory
- Location: `/docs/adrs/`
- Naming: `adr-NNNN-title-slug.md`

### Creating ADRs

Use the `mcp_adr-analysis-_generate_adr_from_decision` tool with:
- `decisionData`: Object with title, context, decision, consequences, alternatives
- `adrDirectory`: `docs/adrs`
- `templateFormat`: `madr` or `nygard`

### Available MCP Tools

The workspace has access to 45+ MCP tools for:
- ADR generation and management
- Project ecosystem analysis
- Deployment validation
- Research and documentation
```

---

## Available MCP Tools

### ADR Management Tools

| Tool | Description |
|------|-------------|
| `mcp_adr-analysis-_generate_adr_from_decision` | Generate complete ADR from decision data |
| `mcp_adr-analysis-_suggest_adrs` | Suggest ADRs based on code analysis |
| `mcp_adr-analysis-_review_existing_adrs` | Review ADRs against code implementation |
| `mcp_adr-analysis-_validate_adr` | Validate ADR against infrastructure |
| `mcp_adr-analysis-_validate_all_adrs` | Validate all ADRs in directory |
| `mcp_adr-analysis-_discover_existing_adrs` | Discover and catalog existing ADRs |
| `mcp_adr-analysis-_interactive_adr_planning` | Interactive ADR planning session |
| `mcp_adr-analysis-_generate_adrs_from_prd` | Generate ADRs from PRD document |
| `mcp_adr-analysis-_analyze_adr_timeline` | Analyze ADR timeline and staleness |

### Analysis Tools

| Tool | Description |
|------|-------------|
| `mcp_adr-analysis-_analyze_project_ecosystem` | Comprehensive project analysis |
| `mcp_adr-analysis-_analyze_environment` | Environment and containerization analysis |
| `mcp_adr-analysis-_get_architectural_context` | Get architectural context for files |
| `mcp_adr-analysis-_compare_adr_progress` | Compare TODO progress against ADRs |

### Planning & Research Tools

| Tool | Description |
|------|-------------|
| `mcp_adr-analysis-_mcp_planning` | Project planning and workflow management |
| `mcp_adr-analysis-_perform_research` | Research using cascading sources |
| `mcp_adr-analysis-_generate_research_questions` | Generate context-aware research questions |
| `mcp_adr-analysis-_get_development_guidance` | Get development guidance from ADRs |

### Deployment Tools

| Tool | Description |
|------|-------------|
| `mcp_adr-analysis-_generate_deployment_guidance` | Generate deployment guidance |
| `mcp_adr-analysis-_generate_adr_bootstrap` | Generate bootstrap validation scripts |
| `mcp_adr-analysis-_troubleshoot_guided_workflow` | Troubleshoot failures with AI |

---

## Usage Examples

### Generate ADR via MCP Tool

In Copilot Chat:

```
Use mcp_adr-analysis-_generate_adr_from_decision to create an ADR for:
- Title: "Mandatory Test Generation After Bug Fixes"
- Context: Bug fixes often lack regression tests, leading to recurring issues
- Decision: Require tests with every bug fix PR
- Alternatives: Optional tests, post-fix tests, QA-only testing
- Consequences: Better coverage but slower delivery
```

### Discover Existing ADRs

```
Use mcp_adr-analysis-_discover_existing_adrs to list all ADRs in this project
```

### Analyze Project Architecture

```
Use mcp_adr-analysis-_analyze_project_ecosystem to understand the architecture before creating ADRs
```

### Validate ADR Against Implementation

```
Use mcp_adr-analysis-_validate_adr to check if ADR-001 matches the actual code implementation
```

---

## Troubleshooting

### MCP Server Not Loading

**Symptoms**: Tools not appearing in Copilot, "MCP server not found" errors

**Solutions**:

1. **Check server path**: Ensure the path in `args` is absolute and correct
   ```bash
   ls -la /home/narayanaya/mcp-adr-analysis-server/dist/src/index.js
   ```

2. **Rebuild server**: 
   ```bash
   cd /home/narayanaya/mcp-adr-analysis-server
   npm run build
   ```

3. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"

4. **Check MCP output**: `View` → `Output` → Select "MCP" from dropdown

### "AI execution not available" Error

**Causes**: Missing or invalid API credentials

**Solutions**:

1. **Verify credentials**: Check API key is correct and not expired
2. **Check provider**: Ensure `AI_PROVIDER` matches your credentials
3. **Test endpoint**: For Azure, verify endpoint URL format:
   ```
   https://YOUR-RESOURCE.cognitiveservices.azure.com/
   ```

### Azure Connection Errors

**Common Issues**:

1. **Wrong endpoint format**: Must be `https://RESOURCE.cognitiveservices.azure.com/` (not openai.azure.com)
2. **Deployment name mismatch**: `AZURE_OPENAI_DEPLOYMENT` must match exactly
3. **API version**: Use `2024-08-01-preview` or later

### Tools Not Responding

**Solutions**:

1. **Increase timeout**: Set `AI_TIMEOUT` to `120000` (2 minutes)
2. **Check logs**: Set `LOG_LEVEL` to `DEBUG`
3. **Test prompt-only mode**: Set `EXECUTION_MODE` to `prompt-only` to verify tool registration

---

## Provider Configuration Options

### Azure AI Foundry Setup

1. **Create Azure OpenAI resource** in Azure Portal
2. **Deploy a model** (e.g., gpt-4o)
3. **Get credentials** from Keys and Endpoint page:
   - Endpoint: `https://YOUR-RESOURCE.cognitiveservices.azure.com/`
   - Key: Copy Key 1 or Key 2
   - Deployment: Your deployment name (e.g., `gpt-4o`)

### OpenRouter Setup

1. **Create account** at [openrouter.ai](https://openrouter.ai)
2. **Generate API key** at [openrouter.ai/keys](https://openrouter.ai/keys)
3. **Choose model**: `anthropic/claude-3-sonnet`, `openai/gpt-4o`, etc.

### OpenAI Direct Setup

1. **Create account** at [platform.openai.com](https://platform.openai.com)
2. **Generate API key** in API settings
3. **Choose model**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`

---

## Checklist for New Workspace Setup

- [ ] MCP server is built (`npm run build` in server directory)
- [ ] `.vscode/mcp.json` created with correct server path
- [ ] API credentials configured for chosen provider
- [ ] `PROJECT_PATH` points to target workspace
- [ ] `ADR_DIRECTORY` exists (`mkdir -p docs/adrs`)
- [ ] VS Code reloaded after configuration changes
- [ ] MCP tools visible in Copilot (`@mcp list tools`)
- [ ] (Optional) ADR-Agent configured
- [ ] (Optional) Copilot instructions added

---

## Quick Reference Card

```bash
# Server Location
/home/narayanaya/mcp-adr-analysis-server/dist/src/index.js

# Required Environment Variables (Azure)
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=YOUR-KEY
AZURE_OPENAI_DEPLOYMENT=gpt-4o
EXECUTION_MODE=full

# Key MCP Tools
mcp_adr-analysis-_generate_adr_from_decision  # Create ADR
mcp_adr-analysis-_discover_existing_adrs       # List ADRs
mcp_adr-analysis-_analyze_project_ecosystem    # Analyze project
mcp_adr-analysis-_validate_adr                 # Validate ADR

# Copilot Commands
@ADR-Agent <request>                       # Use ADR agent
@mcp list tools                                # List available tools
```

---

**Last Updated**: 2025-12-16  
**Server Version**: 2.1.21+  
**Tested With**: VS Code 1.95+, Node.js 20.x/22.x
