---
title: "ADR-0013: Mandatory ADR-Agent Usage"
status: "Proposed"
creation date: "2025-12-16"
last updated: "2025-12-16"
authors: ["Development Team"]
tags: ["architecture", "decision", "adr", "agent", "workflow", "governance"]
related adrs: "adr-012-adr-generator-agent-azure-integration.md"
references: ".github/agents/adr-generator.agent.md, .github/instructions/markdown.instructions.md"
supersedes: ""
implementation notes: "Enforce via team policy and code review process"
superseded_by: ""
---

# ADR-013: Mandatory ADR-Agent Usage

## Status

**Proposed**

## Context

The MCP ADR Analysis Server project has established an ADR-Agent configured at `.github/agents/adr-generator.agent.md` that leverages Azure AI Foundry (gpt-4o) for high-quality ADR generation. This agent integrates with the project's MCP ADR tools via `adr-analysis-server/*` and enforces markdown formatting rules from `.github/instructions/markdown.instructions.md`.

Historical analysis of ADRs created in this project reveals significant quality inconsistencies:

- **CTX-001**: Manual ADR creation has led to inconsistent formatting across documents
- **CTX-002**: Several ADRs are missing required sections such as consequences, alternatives, or implementation notes
- **CTX-003**: Front matter metadata is often incomplete or incorrectly formatted
- **CTX-004**: Quality varies significantly between authors and over time
- **CTX-005**: The existing numbered ADRs (001-012) show formatting inconsistencies that could have been prevented with automated generation
- **CTX-006**: Post-creation reviews catch issues late in the process, increasing rework effort

### Technical Environment

- The ADR-Agent is configured with Azure AI Foundry (gpt-4o deployment)
- The agent has access to MCP ADR tools for validation and context gathering
- VS Code with GitHub Copilot Chat is the standard development environment
- The agent enforces a comprehensive quality checklist before finalizing ADRs

### Business Requirements

- Architectural decisions must be documented consistently for team knowledge sharing
- ADRs serve as historical records for future maintainers and auditors
- Documentation quality directly impacts onboarding time for new team members

## Decision

All new Architectural Decision Records (ADRs) in this project **MUST** be created using the `@ADR-Agent` agent in VS Code Copilot Chat.

### Policy Requirements

- **DEC-001**: Authors must invoke the ADR-Agent via `@ADR-Agent` in VS Code Copilot Chat to create new ADRs
- **DEC-002**: Manual creation of ADR files directly in the `/docs/adrs/` directory is prohibited under normal circumstances
- **DEC-003**: The agent ensures consistent structure, proper YAML front matter, and quality checklist compliance
- **DEC-004**: Emergency exceptions require documented justification and subsequent review

### Rationale

The ADR-Agent provides:

1. **Consistent Structure**: Every ADR follows the standardized template with all required sections
2. **Intelligent Assistance**: AI-powered suggestions for consequences, alternatives, and implementation notes
3. **Automatic Validation**: Quality checklist verification before document creation
4. **Context Awareness**: Integration with MCP tools to understand existing architecture and related ADRs
5. **Formatting Compliance**: Enforces markdown rules from project standards

## Consequences

### Positive

- **POS-001**: Consistent ADR quality across all documents regardless of author experience
- **POS-002**: Proper formatting enforced automatically via markdown instruction rules
- **POS-003**: Automatic validation suggestions catch issues before creation, reducing review cycles
- **POS-004**: AI assistance helps authors think through alternatives and consequences thoroughly
- **POS-005**: Reduced time spent on formatting and structure allows focus on decision content
- **POS-006**: Built-in handoffs to review and validation workflows streamline the process

### Negative

- **NEG-001**: Creates dependency on VS Code and GitHub Copilot Chat for ADR creation
- **NEG-002**: Learning curve for team members unfamiliar with agent-based workflows
- **NEG-003**: Requires active Azure AI Foundry subscription with gpt-4o deployment
- **NEG-004**: Cannot create ADRs when offline or when AI services are unavailable
- **NEG-005**: May introduce latency compared to quick manual file creation

### Neutral

- **NEU-001**: Emergency situations still permit manual creation with documented justification
- **NEU-002**: Existing ADRs (001-012) are grandfathered and do not require regeneration

## Alternatives Considered

### Alternative 1: Optional Agent Usage (Allow Manual Creation)

- **ALT-001**: **Description**: Allow team members to choose between agent-assisted and manual ADR creation based on preference
- **ALT-002**: **Rejection Reason**: Historical evidence shows manual creation leads to inconsistent quality; optional adoption results in varied compliance rates and defeats the purpose of standardization

### Alternative 2: Template-Only Approach (No AI Assistance)

- **ALT-003**: **Description**: Provide a static ADR template file that authors copy and fill in manually without AI assistance
- **ALT-004**: **Rejection Reason**: Templates alone do not provide intelligent suggestions for consequences or alternatives; authors may skip sections or provide superficial content without AI guidance to prompt thorough analysis

### Alternative 3: Post-Creation Validation Only

- **ALT-005**: **Description**: Allow any creation method but require validation through MCP tools after the ADR is written
- **ALT-006**: **Rejection Reason**: Fixing issues after creation requires more effort than preventing them; validation-only approaches result in rejection cycles and rework that frustrate authors and delay documentation

### Alternative 4: Custom CI/CD Linting

- **ALT-007**: **Description**: Implement automated linting in the CI/CD pipeline to reject non-compliant ADRs
- **ALT-008**: **Rejection Reason**: CI/CD validation catches issues too late in the workflow; it cannot provide real-time guidance or intelligent suggestions during authoring; still requires manual fixes after rejection

## Implementation Notes

- **IMP-001**: Update team documentation and onboarding materials to reference the mandatory agent workflow
- **IMP-002**: Add a contributing guideline section in `CONTRIBUTING.md` specifying ADR creation requirements
- **IMP-003**: Consider adding a pre-commit hook or PR check that warns if ADR files appear to lack agent-generated markers
- **IMP-004**: Establish a process for documenting emergency manual ADR creation with required justification
- **IMP-005**: Track ADR quality metrics over time to validate the effectiveness of this policy

### Success Criteria

- 100% of new ADRs created after adoption follow the standardized structure
- Reduction in ADR-related review comments by 80% within 3 months
- All team members trained on agent workflow within 2 weeks of adoption

## References

- **REF-001**: [ADR-012: ADR-Agent with Azure AI Foundry Integration](adr-012-adr-generator-agent-azure-integration.md)
- **REF-002**: ADR-Agent Configuration: `.github/agents/adr-generator.agent.md`
- **REF-003**: Markdown Formatting Instructions: `.github/instructions/markdown.instructions.md`
- **REF-004**: MCP ADR Analysis Server Tools: `src/tools/` directory
- **REF-005**: [Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
