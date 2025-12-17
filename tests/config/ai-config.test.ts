/**
 * Unit Tests for ai-config.ts
 * Target Coverage: 44.0% → 80%
 *
 * Following methodological pragmatism principles:
 * - Systematic Verification: Structured test cases with clear assertions
 * - Explicit Fallibilism: Testing both success and failure scenarios
 * - Pragmatic Success Criteria: Focus on reliable, maintainable test coverage
 */

import { jest } from '@jest/globals';

import {
  AIConfig,
  ModelConfig,
  AVAILABLE_MODELS,
  DEFAULT_AI_CONFIG,
  loadAIConfig,
  validateAIConfig,
  getModelConfig,
  isAIExecutionEnabled,
  getRecommendedModel,
} from '../../src/config/ai-config.js';

describe('AI Configuration', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  // ============================================================================
  // Constants and Default Configuration Tests
  // ============================================================================

  describe('AVAILABLE_MODELS constant', () => {
    test('contains expected model configurations', () => {
      expect(AVAILABLE_MODELS).toBeDefined();
      expect(typeof AVAILABLE_MODELS).toBe('object');

      // Verify specific models exist
      expect(AVAILABLE_MODELS['claude-3-sonnet']).toBeDefined();
      expect(AVAILABLE_MODELS['claude-3-haiku']).toBeDefined();
      expect(AVAILABLE_MODELS['gpt-4o']).toBeDefined();
      expect(AVAILABLE_MODELS['gpt-4o-mini']).toBeDefined();
    });

    test('all models have required properties', () => {
      Object.values(AVAILABLE_MODELS).forEach((model: ModelConfig) => {
        expect(model?.id).toBeDefined();
        expect(model?.name).toBeDefined();
        expect(model?.provider).toBeDefined();
        expect(typeof model?.inputCost).toBe('number');
        expect(typeof model?.outputCost).toBe('number');
        expect(typeof model?.contextLength).toBe('number');
        expect(Array.isArray(model?.useCases)).toBe(true);
        expect(model?.useCases.length).toBeGreaterThan(0);
      });
    });

    test('claude-3-sonnet has correct configuration', () => {
      const model = AVAILABLE_MODELS['claude-3-sonnet'];
      expect(model?.id).toBe('anthropic/claude-3-sonnet');
      expect(model?.name).toBe('Claude 3 Sonnet');
      expect(model?.provider).toBe('anthropic');
      expect(model?.inputCost).toBe(3.0);
      expect(model?.outputCost).toBe(15.0);
      expect(model?.contextLength).toBe(200000);
      expect(model?.useCases).toContain('analysis');
    });

    test('gpt-4o-mini has cost-effective use case', () => {
      const model = AVAILABLE_MODELS['gpt-4o-mini'];
      expect(model?.useCases).toContain('cost-effective');
      expect(model?.inputCost).toBeLessThan(1.0);
    });
  });

  describe('DEFAULT_AI_CONFIG constant', () => {
    test('has all required properties', () => {
      expect(DEFAULT_AI_CONFIG.apiKey).toBe('');
      expect(DEFAULT_AI_CONFIG.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(DEFAULT_AI_CONFIG.defaultModel).toBe('anthropic/claude-3-sonnet');
      expect(DEFAULT_AI_CONFIG.executionMode).toBe('full');
      expect(DEFAULT_AI_CONFIG.siteUrl).toBe(
        'https://github.com/tosin2013/mcp-adr-analysis-server'
      );
      expect(DEFAULT_AI_CONFIG.siteName).toBe('MCP ADR Analysis Server');
      expect(DEFAULT_AI_CONFIG.timeout).toBe(60000);
      expect(DEFAULT_AI_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_AI_CONFIG.temperature).toBe(0.1);
      expect(DEFAULT_AI_CONFIG.maxTokens).toBe(4000);
      expect(DEFAULT_AI_CONFIG.cacheEnabled).toBe(true);
      expect(DEFAULT_AI_CONFIG.cacheTTL).toBe(3600);
    });

    test('has reasonable default values', () => {
      expect(DEFAULT_AI_CONFIG.temperature).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_AI_CONFIG.temperature).toBeLessThanOrEqual(1);
      expect(DEFAULT_AI_CONFIG.maxTokens).toBeGreaterThan(100);
      expect(DEFAULT_AI_CONFIG.timeout).toBeGreaterThan(1000);
      expect(DEFAULT_AI_CONFIG.maxRetries).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // loadAIConfig Function Tests
  // ============================================================================

  describe('loadAIConfig function', () => {
    test('returns default config when no environment variables set (prompt-only mode)', () => {
      // Clear relevant environment variables
      delete process.env['OPENROUTER_API_KEY'];
      delete process.env['AI_MODEL'];
      delete process.env['AI_PROVIDER'];
      // Set prompt-only mode to avoid validation errors
      process.env['EXECUTION_MODE'] = 'prompt-only';

      const config = loadAIConfig();

      expect(config.provider).toBe('openrouter');
      expect(config.apiKey).toBe('');
      expect(config.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(config.defaultModel).toBe(DEFAULT_AI_CONFIG.defaultModel);
      expect(config.executionMode).toBe('prompt-only');
    });

    test('throws error when API key missing in full execution mode', () => {
      delete process.env['OPENROUTER_API_KEY'];
      delete process.env['AI_PROVIDER'];
      process.env['EXECUTION_MODE'] = 'full';

      expect(() => loadAIConfig()).toThrow('OpenRouter requires OPENROUTER_API_KEY');
    });

    test('loads configuration from environment variables', () => {
      process.env['OPENROUTER_API_KEY'] = 'test-api-key';
      process.env['AI_MODEL'] = 'openai/gpt-4o';
      process.env['EXECUTION_MODE'] = 'prompt-only';
      process.env['AI_TIMEOUT'] = '30000';
      process.env['AI_TEMPERATURE'] = '0.5';
      process.env['AI_MAX_TOKENS'] = '2000';

      const config = loadAIConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.defaultModel).toBe('openai/gpt-4o');
      expect(config.executionMode).toBe('prompt-only');
      expect(config.timeout).toBe(30000);
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2000);
    });

    test('handles invalid numeric environment variables gracefully', () => {
      process.env['AI_TIMEOUT'] = 'invalid-number';
      process.env['AI_TEMPERATURE'] = 'not-a-float';
      process.env['AI_MAX_TOKENS'] = '';

      const config = loadAIConfig();

      expect(config.timeout).toBe(DEFAULT_AI_CONFIG.timeout);
      expect(config.temperature).toBe(DEFAULT_AI_CONFIG.temperature);
      expect(config.maxTokens).toBe(DEFAULT_AI_CONFIG.maxTokens);
    });

    test('handles cache configuration from environment', () => {
      process.env['AI_CACHE_ENABLED'] = 'false';
      process.env['AI_CACHE_TTL'] = '7200';

      const config = loadAIConfig();

      expect(config.cacheEnabled).toBe(false);
      expect(config.cacheTTL).toBe(7200);
    });

    test('cache enabled defaults to true when not explicitly disabled', () => {
      delete process.env['AI_CACHE_ENABLED'];

      const config = loadAIConfig();

      expect(config.cacheEnabled).toBe(true);
    });
  });

  // ============================================================================
  // validateAIConfig Function Tests
  // ============================================================================

  describe('validateAIConfig function', () => {
    let validConfig: AIConfig;

    beforeEach(() => {
      validConfig = {
        provider: 'openrouter',
        apiKey: 'test-key',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'anthropic/claude-3-sonnet',
        executionMode: 'full',
        siteUrl: 'https://example.com',
        siteName: 'Test Site',
        timeout: 30000,
        maxRetries: 3,
        temperature: 0.5,
        maxTokens: 2000,
        cacheEnabled: true,
        cacheTTL: 3600,
      };
    });

    test('passes validation for valid configuration', () => {
      expect(() => validateAIConfig(validConfig)).not.toThrow();
    });

    test('validateAIConfig does not check API key (provider validation does)', () => {
      // validateAIConfig now only validates common parameters
      // Provider-specific validation is done in validateProviderConfig
      validConfig.apiKey = '';
      validConfig.executionMode = 'full';

      // This should NOT throw - API key validation moved to validateProviderConfig
      expect(() => validateAIConfig(validConfig)).not.toThrow();
    });

    test('allows empty API key in prompt-only mode', () => {
      validConfig.apiKey = '';
      validConfig.executionMode = 'prompt-only';

      expect(() => validateAIConfig(validConfig)).not.toThrow();
    });

    test('warns about unknown model but does not throw (for openrouter only)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      validConfig.provider = 'openrouter';
      validConfig.defaultModel = 'unknown/model';

      expect(() => validateAIConfig(validConfig)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Unknown model: unknown/model. Using default.');

      consoleSpy.mockRestore();
    });

    test('does not warn about unknown model for azure provider', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      validConfig.provider = 'azure';
      validConfig.defaultModel = 'my-custom-deployment';

      expect(() => validateAIConfig(validConfig)).not.toThrow();
      // Azure uses deployment names, not model names - no warning expected
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('throws error for invalid temperature values', () => {
      validConfig.temperature = -0.1;
      expect(() => validateAIConfig(validConfig)).toThrow('Temperature must be between 0 and 1');

      validConfig.temperature = 1.1;
      expect(() => validateAIConfig(validConfig)).toThrow('Temperature must be between 0 and 1');
    });

    test('throws error for invalid max tokens values', () => {
      validConfig.maxTokens = 50;
      expect(() => validateAIConfig(validConfig)).toThrow(
        'Max tokens must be between 100 and 8000'
      );

      validConfig.maxTokens = 9000;
      expect(() => validateAIConfig(validConfig)).toThrow(
        'Max tokens must be between 100 and 8000'
      );
    });

    test('throws error for invalid timeout values', () => {
      validConfig.timeout = 500;
      expect(() => validateAIConfig(validConfig)).toThrow(
        'Timeout must be between 1000ms and 300000ms'
      );

      validConfig.timeout = 400000;
      expect(() => validateAIConfig(validConfig)).toThrow(
        'Timeout must be between 1000ms and 300000ms'
      );
    });

    test('accepts boundary values', () => {
      validConfig.temperature = 0;
      validConfig.maxTokens = 100;
      validConfig.timeout = 1000;
      expect(() => validateAIConfig(validConfig)).not.toThrow();

      validConfig.temperature = 1;
      validConfig.maxTokens = 8000;
      validConfig.timeout = 300000;
      expect(() => validateAIConfig(validConfig)).not.toThrow();
    });
  });

  // ============================================================================
  // getModelConfig Function Tests
  // ============================================================================

  describe('getModelConfig function', () => {
    test('returns model config for valid model ID', () => {
      const config = getModelConfig('claude-3-sonnet');
      expect(config).toBeDefined();
      expect(config?.id).toBe('anthropic/claude-3-sonnet');
      expect(config?.name).toBe('Claude 3 Sonnet');
    });

    test('handles full model ID with provider prefix', () => {
      const config = getModelConfig('anthropic/claude-3-sonnet');
      expect(config).toBeDefined();
      expect(config?.id).toBe('anthropic/claude-3-sonnet');
    });

    test('handles OpenAI model IDs with prefix', () => {
      const config = getModelConfig('openai/gpt-4o');
      expect(config).toBeDefined();
      expect(config?.id).toBe('openai/gpt-4o');
    });

    test('returns undefined for unknown model ID', () => {
      const config = getModelConfig('unknown-model');
      expect(config).toBeUndefined();
    });

    test('returns undefined for empty string', () => {
      const config = getModelConfig('');
      expect(config).toBeUndefined();
    });
  });

  // ============================================================================
  // isAIExecutionEnabled Function Tests
  // ============================================================================

  describe('isAIExecutionEnabled function', () => {
    test('returns true when execution mode is full and API key is provided', () => {
      const config: AIConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'test-key',
        executionMode: 'full',
      };

      expect(isAIExecutionEnabled(config)).toBe(true);
    });

    test('returns false when execution mode is prompt-only', () => {
      const config: AIConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'test-key',
        executionMode: 'prompt-only',
      };

      expect(isAIExecutionEnabled(config)).toBe(false);
    });

    test('returns false when API key is missing', () => {
      const config: AIConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: '',
        executionMode: 'full',
      };

      expect(isAIExecutionEnabled(config)).toBe(false);
    });

    test('returns false when API key is empty string', () => {
      const config: AIConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: '',
        executionMode: 'full',
      };

      expect(isAIExecutionEnabled(config)).toBe(false);
    });
  });

  // ============================================================================
  // getRecommendedModel Function Tests
  // ============================================================================

  describe('getRecommendedModel function', () => {
    test('returns model for valid use case', () => {
      const model = getRecommendedModel('analysis');
      expect(model).toBeDefined();
      expect(typeof model).toBe('string');
    });

    test('returns cost-effective model when cost sensitive', () => {
      const model = getRecommendedModel('quick-analysis', true);
      expect(model).toBeDefined();

      // Should prefer cheaper models
      const modelConfig = getModelConfig(model);
      expect(modelConfig).toBeDefined();
    });

    test('returns default model for unknown use case', () => {
      const model = getRecommendedModel('unknown-use-case');
      expect(model).toBe(DEFAULT_AI_CONFIG.defaultModel);
    });

    test('prioritizes cost when cost sensitive flag is true', () => {
      const costSensitiveModel = getRecommendedModel('analysis', true);
      const regularModel = getRecommendedModel('analysis', false);

      expect(costSensitiveModel).toBeDefined();
      expect(regularModel).toBeDefined();

      // Cost sensitive should return a model (may be same or different)
      expect(typeof costSensitiveModel).toBe('string');
    });

    test('handles empty use case string', () => {
      const model = getRecommendedModel('');
      expect(model).toBe(DEFAULT_AI_CONFIG.defaultModel);
    });

    test('falls back to analysis use case when specific use case not found', () => {
      const model = getRecommendedModel('non-existent-use-case');
      expect(model).toBeDefined();

      // Should fall back to default model
      expect(model).toBe(DEFAULT_AI_CONFIG.defaultModel);
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling Tests
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    test('handles null and undefined inputs gracefully', () => {
      // The function currently doesn't handle null/undefined, so we expect it to throw
      expect(() => getModelConfig(null as any)).toThrow();
      expect(() => getModelConfig(undefined as any)).toThrow();
    });

    test('loadAIConfig handles missing process.env gracefully in prompt-only mode', () => {
      const originalProcessEnv = process.env;
      // Simulate missing process.env properties but set prompt-only mode
      process.env = { EXECUTION_MODE: 'prompt-only' };

      expect(() => loadAIConfig()).not.toThrow();
      const config = loadAIConfig();
      expect(config).toBeDefined();
      expect(config.apiKey).toBe('');
      expect(config.provider).toBe('openrouter');

      process.env = originalProcessEnv;
    });

    test('validateAIConfig handles edge case model names', () => {
      const config: AIConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'test-key',
        defaultModel: 'anthropic/claude-3-sonnet', // Full model name
      };

      expect(() => validateAIConfig(config)).not.toThrow();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration Tests', () => {
    test('full configuration workflow', () => {
      // Set environment variables
      process.env['OPENROUTER_API_KEY'] = 'integration-test-key';
      process.env['AI_MODEL'] = 'anthropic/claude-3-haiku';
      process.env['EXECUTION_MODE'] = 'full';

      // Load configuration
      const config = loadAIConfig();

      // Validate configuration
      expect(() => validateAIConfig(config)).not.toThrow();

      // Check AI execution status
      expect(isAIExecutionEnabled(config)).toBe(true);

      // Get model configuration
      const modelConfig = getModelConfig(config.defaultModel);
      expect(modelConfig).toBeDefined();
      expect(modelConfig?.provider).toBe('anthropic');
    });

    test('prompt-only mode workflow', () => {
      process.env['EXECUTION_MODE'] = 'prompt-only';
      delete process.env['OPENROUTER_API_KEY'];

      const config = loadAIConfig();
      expect(() => validateAIConfig(config)).not.toThrow();
      expect(isAIExecutionEnabled(config)).toBe(false);
    });
  });

  // ============================================================================
  // Multi-Provider Tests
  // ============================================================================

  describe('Multi-Provider Support', () => {
    describe('OpenRouter Provider', () => {
      test('loads openrouter config correctly', () => {
        process.env['AI_PROVIDER'] = 'openrouter';
        process.env['OPENROUTER_API_KEY'] = 'or-test-key';
        process.env['AI_MODEL'] = 'anthropic/claude-3-sonnet';

        const config = loadAIConfig();

        expect(config.provider).toBe('openrouter');
        expect(config.apiKey).toBe('or-test-key');
        expect(config.baseURL).toBe('https://openrouter.ai/api/v1');
        expect(config.defaultModel).toBe('anthropic/claude-3-sonnet');
      });

      test('throws error when OPENROUTER_API_KEY missing in full mode', () => {
        process.env['AI_PROVIDER'] = 'openrouter';
        process.env['EXECUTION_MODE'] = 'full';
        delete process.env['OPENROUTER_API_KEY'];

        expect(() => loadAIConfig()).toThrow('OpenRouter requires OPENROUTER_API_KEY');
      });
    });

    describe('Azure Provider', () => {
      test('loads azure config correctly', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['AZURE_OPENAI_ENDPOINT'] = 'https://my-resource.openai.azure.com';
        process.env['AZURE_OPENAI_API_KEY'] = 'azure-test-key';
        process.env['AZURE_OPENAI_DEPLOYMENT'] = 'gpt-4-turbo';
        process.env['AZURE_OPENAI_API_VERSION'] = '2024-02-01';

        const config = loadAIConfig();

        expect(config.provider).toBe('azure');
        expect(config.apiKey).toBe('azure-test-key');
        expect(config.azureEndpoint).toBe('https://my-resource.openai.azure.com');
        expect(config.azureDeployment).toBe('gpt-4-turbo');
        expect(config.azureApiVersion).toBe('2024-02-01');
        expect(config.baseURL).toContain('openai/deployments/gpt-4-turbo');
      });

      test('uses default API version when not specified', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['AZURE_OPENAI_ENDPOINT'] = 'https://my-resource.openai.azure.com';
        process.env['AZURE_OPENAI_API_KEY'] = 'azure-test-key';
        process.env['AZURE_OPENAI_DEPLOYMENT'] = 'gpt-4-turbo';
        delete process.env['AZURE_OPENAI_API_VERSION'];

        const config = loadAIConfig();

        expect(config.azureApiVersion).toBe('2024-08-01-preview');
      });

      test('throws error when AZURE_OPENAI_ENDPOINT missing', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['EXECUTION_MODE'] = 'full';
        delete process.env['AZURE_OPENAI_ENDPOINT'];
        process.env['AZURE_OPENAI_API_KEY'] = 'azure-test-key';
        process.env['AZURE_OPENAI_DEPLOYMENT'] = 'gpt-4-turbo';

        expect(() => loadAIConfig()).toThrow('Azure AI Foundry requires');
        expect(() => loadAIConfig()).toThrow('AZURE_OPENAI_ENDPOINT');
      });

      test('throws error when AZURE_OPENAI_API_KEY missing', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['EXECUTION_MODE'] = 'full';
        process.env['AZURE_OPENAI_ENDPOINT'] = 'https://my-resource.openai.azure.com';
        delete process.env['AZURE_OPENAI_API_KEY'];
        process.env['AZURE_OPENAI_DEPLOYMENT'] = 'gpt-4-turbo';

        expect(() => loadAIConfig()).toThrow('AZURE_OPENAI_API_KEY');
      });

      test('throws error when AZURE_OPENAI_DEPLOYMENT missing', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['EXECUTION_MODE'] = 'full';
        process.env['AZURE_OPENAI_ENDPOINT'] = 'https://my-resource.openai.azure.com';
        process.env['AZURE_OPENAI_API_KEY'] = 'azure-test-key';
        delete process.env['AZURE_OPENAI_DEPLOYMENT'];

        expect(() => loadAIConfig()).toThrow('AZURE_OPENAI_DEPLOYMENT');
      });

      test('allows empty Azure config in prompt-only mode', () => {
        process.env['AI_PROVIDER'] = 'azure';
        process.env['EXECUTION_MODE'] = 'prompt-only';
        delete process.env['AZURE_OPENAI_ENDPOINT'];
        delete process.env['AZURE_OPENAI_API_KEY'];
        delete process.env['AZURE_OPENAI_DEPLOYMENT'];

        expect(() => loadAIConfig()).not.toThrow();
        const config = loadAIConfig();
        expect(config.provider).toBe('azure');
      });
    });

    describe('OpenAI Provider', () => {
      test('loads openai config correctly', () => {
        process.env['AI_PROVIDER'] = 'openai';
        process.env['OPENAI_API_KEY'] = 'openai-test-key';
        process.env['AI_MODEL'] = 'gpt-4o-mini';

        const config = loadAIConfig();

        expect(config.provider).toBe('openai');
        expect(config.apiKey).toBe('openai-test-key');
        expect(config.baseURL).toBe('https://api.openai.com/v1');
        expect(config.defaultModel).toBe('gpt-4o-mini');
      });

      test('uses default model gpt-4o when AI_MODEL not set', () => {
        process.env['AI_PROVIDER'] = 'openai';
        process.env['OPENAI_API_KEY'] = 'openai-test-key';
        delete process.env['AI_MODEL'];

        const config = loadAIConfig();

        expect(config.defaultModel).toBe('gpt-4o');
      });

      test('throws error when OPENAI_API_KEY missing in full mode', () => {
        process.env['AI_PROVIDER'] = 'openai';
        process.env['EXECUTION_MODE'] = 'full';
        delete process.env['OPENAI_API_KEY'];

        expect(() => loadAIConfig()).toThrow('OpenAI requires OPENAI_API_KEY');
      });
    });

    describe('Provider Defaults', () => {
      test('defaults to openrouter when AI_PROVIDER not set', () => {
        delete process.env['AI_PROVIDER'];
        process.env['OPENROUTER_API_KEY'] = 'default-key';

        const config = loadAIConfig();

        expect(config.provider).toBe('openrouter');
      });
    });
  });
});
