import { AIServiceConfig } from '../services/ai/types';

// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Default configurations for AI services
export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'mock-key',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2048,
    useMock: true, // Always use mock in development to avoid CORS
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || 'mock-key',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
    useMock: true, // Always use mock in development to avoid CORS
  },
};

// Default AI service - can be overridden with an environment variable
export const DEFAULT_AI_SERVICE = 
  import.meta.env.VITE_DEFAULT_AI_SERVICE || 'openai';

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  // In development, we always use mock mode
  if (isDevelopment) {
    return true;
  }
  
  // In production, we require at least one valid API key
  const hasOpenAI = !!AI_SERVICE_CONFIGS.openai.apiKey && AI_SERVICE_CONFIGS.openai.apiKey !== 'mock-key';
  const hasAnthropic = !!AI_SERVICE_CONFIGS.anthropic.apiKey && AI_SERVICE_CONFIGS.anthropic.apiKey !== 'mock-key';
  
  if (!hasOpenAI && !hasAnthropic) {
    console.error('No API keys found for any AI service');
    return false;
  }
  
  return true;
}
