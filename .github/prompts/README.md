# GitHub Copilot Prompts

This directory contains reusable prompt files for GitHub Copilot Chat. These prompts are sourced from [github/awesome-copilot](https://github.com/github/awesome-copilot) and customized for the MCP ADR Analysis Server project.

## Available Prompts

| Prompt | Description | Usage |
|--------|-------------|-------|
| [create-architectural-decision-record.prompt.md](create-architectural-decision-record.prompt.md) | Create AI-optimized ADR documents with structured formatting | `/create-architectural-decision-record` |
| [architecture-blueprint-generator.prompt.md](architecture-blueprint-generator.prompt.md) | Generate comprehensive architecture documentation | `/architecture-blueprint-generator` |
| [create-implementation-plan.prompt.md](create-implementation-plan.prompt.md) | Create structured implementation plans for features, refactoring, or upgrades | `/create-implementation-plan` |

## Using Prompts

In VS Code with GitHub Copilot Chat:

1. **Slash Command**: Type `/` followed by the prompt name (without `.prompt.md`)
   ```
   /create-architectural-decision-record
   ```

2. **With Context**: Add context after the slash command
   ```
   /create-architectural-decision-record for caching layer using Redis
   ```

3. **With Agent**: Combine with an agent for specialized handling
   ```
   @ADR-Agent /create-architectural-decision-record for authentication strategy
   ```

## Prompt Structure

Each prompt follows the VS Code Copilot prompt file format:

```markdown
---
description: 'Brief description of what the prompt does'
agent: 'agent'  # or specific agent name like 'ADR-Agent'
tools:
  - tool1
  - tool2
---

# Prompt Title

[Prompt instructions and template]
```

## ADR-Specific Prompts

The `create-architectural-decision-record.prompt.md` uses coded bullet points for machine-parseability:

- **CTX-xxx**: Context items
- **DEC-xxx**: Decision details
- **POS-xxx**: Positive consequences
- **NEG-xxx**: Negative consequences
- **ALT-xxx**: Alternatives considered
- **IMP-xxx**: Implementation notes
- **REF-xxx**: References

## Adding New Prompts

1. Create a new `.prompt.md` file in this directory
2. Add YAML frontmatter with `description`, `agent`, and `tools`
3. Write prompt instructions in the body
4. Update this README with the new prompt

## Source

These prompts are adapted from [github/awesome-copilot](https://github.com/github/awesome-copilot) - a community collection of Copilot customizations including prompts, agents, instructions, and chat modes.

## Related Resources

- [ADR-Agent](../agents/adr-generator.agent.md) - Custom agent for ADR creation
- [Markdown Instructions](../instructions/markdown.instructions.md) - Formatting rules for documentation
- [Copilot Instructions](../copilot-instructions.md) - Project-level Copilot configuration
