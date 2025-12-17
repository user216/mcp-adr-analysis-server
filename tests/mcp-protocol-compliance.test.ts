/**
 * MCP Protocol Compliance Tests
 * 
 * These tests verify that the MCP server doesn't corrupt stdout
 * with non-JSON-RPC messages, which causes VS Code MCP client warnings.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('MCP Protocol Compliance', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleDebugSpy: jest.SpiedFunction<typeof console.debug>;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    jest.resetModules();
  });

  describe('EnhancedLogger', () => {
    it('should output all log levels to stderr (console.error), not stdout', async () => {
      const { EnhancedLogger } = await import('../src/utils/enhanced-logging.js');
      const logger = new EnhancedLogger({ level: 'debug' });

      logger.debug('debug message', 'TestComponent');
      logger.info('info message', 'TestComponent');
      logger.warn('warn message', 'TestComponent');
      logger.error('error message', 'TestComponent');

      // All logs should use console.error (which goes to stderr)
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      const allErrorCalls = consoleErrorSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(allErrorCalls).toContain('debug message');
      expect(allErrorCalls).toContain('info message');
      expect(allErrorCalls).toContain('warn message');
      expect(allErrorCalls).toContain('error message');

      // console.log should NOT be called (would corrupt MCP stdout)
      expect(consoleLogSpy).not.toHaveBeenCalled();
      // console.warn and console.debug should NOT be called either (they go to stdout in some envs)
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should respect LOG_LEVEL environment variable', async () => {
      // Set LOG_LEVEL to ERROR before importing
      const originalLogLevel = process.env['LOG_LEVEL'];
      process.env['LOG_LEVEL'] = 'error';

      jest.resetModules();
      const { EnhancedLogger } = await import('../src/utils/enhanced-logging.js');
      const logger = new EnhancedLogger();

      logger.debug('debug should not appear', 'TestComponent');
      logger.info('info should not appear', 'TestComponent');
      logger.warn('warn should not appear', 'TestComponent');
      logger.error('error should appear', 'TestComponent');

      const allErrorCalls = consoleErrorSpy.mock.calls.map(call => call.join(' ')).join('\n');
      
      // Only error should appear when LOG_LEVEL=error
      expect(allErrorCalls).not.toContain('debug should not appear');
      expect(allErrorCalls).not.toContain('info should not appear');
      expect(allErrorCalls).not.toContain('warn should not appear');
      expect(allErrorCalls).toContain('error should appear');

      // Restore
      if (originalLogLevel !== undefined) {
        process.env['LOG_LEVEL'] = originalLogLevel;
      } else {
        delete process.env['LOG_LEVEL'];
      }
    });

    it('should not output structured JSON objects that cause parse warnings', async () => {
      const { EnhancedLogger } = await import('../src/utils/enhanced-logging.js');
      const logger = new EnhancedLogger({ level: 'info' });

      // Log with context (which used to cause JSON object in output)
      logger.info('test message', 'TestComponent', { key: 'value', count: 42 });

      const allErrorCalls = consoleErrorSpy.mock.calls.map(call => call.join(' ')).join('\n');
      
      // Should contain the message
      expect(allErrorCalls).toContain('test message');
      
      // Should NOT output raw structured objects as separate arguments
      // Check that no call has an object argument (which VS Code can't parse)
      const hasObjectArg = consoleErrorSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'object' && arg !== null)
      );
      expect(hasObjectArg).toBe(false);
    });
  });

  describe('AI Executor', () => {
    it('should output initialization messages to stderr, not stdout', async () => {
      const originalEnv = { ...process.env };
      
      // Set up Azure config to trigger initialization message
      process.env['AI_PROVIDER'] = 'azure';
      process.env['AZURE_OPENAI_ENDPOINT'] = 'https://test.openai.azure.com/';
      process.env['AZURE_OPENAI_API_KEY'] = 'test-key';
      process.env['AZURE_OPENAI_DEPLOYMENT'] = 'gpt-4o';
      process.env['EXECUTION_MODE'] = 'full';

      jest.resetModules();
      
      try {
        const { getAIExecutor } = await import('../src/utils/ai-executor.js');
        getAIExecutor(); // This triggers initialization

        // If AI executor logs initialization, it should use console.error
        // console.log should NOT be called (would corrupt MCP stdout)
        expect(consoleLogSpy).not.toHaveBeenCalled();
      } finally {
        // Restore environment
        Object.keys(process.env).forEach(key => {
          if (!(key in originalEnv)) {
            delete process.env[key];
          }
        });
        Object.assign(process.env, originalEnv);
      }
    });
  });
});

describe('Tree-Sitter Analyzer', () => {
  it('should not output warnings when parsers fail to load in test environment', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    try {
      const { TreeSitterAnalyzer } = await import('../src/utils/tree-sitter-analyzer.js');
      const analyzer = new TreeSitterAnalyzer();
      
      // Initialize - in test mode, warnings should be suppressed
      await analyzer.initializeParsers();

      // In test environment (NODE_ENV=test), no warnings should be logged
      // Even if parsers fail to load
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  it('should gracefully fallback to regex analysis when tree-sitter unavailable', async () => {
    const { TreeSitterAnalyzer } = await import('../src/utils/tree-sitter-analyzer.js');
    const analyzer = new TreeSitterAnalyzer();

    // Analyze a TypeScript file - should work even without real tree-sitter
    const result = await analyzer.analyzeFile(
      'test.ts',
      'const API_KEY = "sk-test123"; function hello() { return "world"; }'
    );

    // Should return valid result structure
    expect(result).toHaveProperty('language');
    expect(result).toHaveProperty('secrets');
    expect(result).toHaveProperty('functions');
    expect(Array.isArray(result.secrets)).toBe(true);
    expect(Array.isArray(result.functions)).toBe(true);
  });
});
