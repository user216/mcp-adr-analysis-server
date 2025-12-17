---
title: "ADR-013: Mandatory ADR Agent Usage for Documentation"
status: "Proposed"
date: "2025-12-16"
authors: "Development Team"
tags:
  - architecture
  - governance
  - tooling
  - documentation
supersedes: ""
superseded_by: ""
---

# ADR-013: Mandatory ADR Agent Usage for Documentation

## Status

**Proposed**

## Context

The project maintains Architectural Decision Records (ADRs) in `/docs/adrs/` to document significant technical decisions. Currently, ADRs can be created manually or via the ADR-Agent (`@ADR-Agent`).

**Problems with manual ADR creation:**

1. Inconsistent structure - some ADRs missing sections like "Alternatives" or "Consequences"
2. Varying front matter formats - different YAML field names and styles
3. No enforcement of quality standards
4. Time-consuming to ensure all sections are complete
5. Formatting inconsistencies across documents

**Available tooling:**

- ADR-Agent at `.github/agents/adr-generator.agent.md`
- Azure AI Foundry (gpt-4o) backend for intelligent generation
- MCP ADR tools for validation and analysis
- Markdown instructions at `.github/instructions/markdown.instructions.md`

## Decision

**All new ADRs must be created using the `@ADR-Agent` agent in VS Code Copilot Chat.**

Rationale:

- Ensures consistent structure across all ADRs
- Enforces markdown formatting standards automatically
- Provides AI-assisted content suggestions for alternatives and consequences
- Integrates with validation workflows via handoffs
- Reduces review cycles by catching issues at creation time

Exceptions:

- Emergency situations when VS Code/Copilot unavailable (must document reason)
- Existing ADRs (001-012) grandfathered, no regeneration required

## Consequences

### Positive

- Uniform ADR quality regardless of author
- Automatic compliance with project formatting standards
- Faster ADR creation with AI assistance
- Built-in quality checklist verification
- Handoffs enable seamless review workflows

### Negative

- Requires VS Code + GitHub Copilot
- Dependency on Azure AI Foundry availability
- Learning curve for new team members
- Cannot create ADRs offline

## Alternatives Considered

### 1. Keep manual creation optional

Allow both manual and agent-assisted creation.

**Rejected**: Leads to inconsistent quality; defeats standardization purpose.

### 2. Static template only

Provide a template file without AI assistance.

**Rejected**: Templates don't provide intelligent suggestions; sections often skipped or shallow.

### 3. CI/CD validation only

Lint ADRs in CI pipeline, reject non-compliant ones.

**Rejected**: Too late in workflow; creates frustrating rejection cycles.

### 4. Do nothing

Continue current approach.

**Rejected**: Quality issues persist and worsen over time.

## Implementation

1. Update `CONTRIBUTING.md` with ADR creation requirements
2. Add team onboarding documentation for agent workflow
3. Consider pre-commit hook to detect non-agent ADRs
4. Track quality metrics to measure policy effectiveness

## References

- [ADR-Agent](.github/agents/adr-generator.agent.md)
- [Markdown Instructions](.github/instructions/markdown.instructions.md)
- [Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
