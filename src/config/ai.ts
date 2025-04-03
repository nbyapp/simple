import { AIServiceConfig } from '../services/ai/types';

// Default configurations for AI services
export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2048,
    useMock: false, // Use real API calls
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
    useMock: false, // Use real API calls
  },
};

// Default AI service - can be overridden with an environment variable
export const DEFAULT_AI_SERVICE = 
  import.meta.env.VITE_DEFAULT_AI_SERVICE || 'openai';

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  // Check if API keys are available
  const hasOpenAI = !!AI_SERVICE_CONFIGS.openai.apiKey;
  const hasAnthropic = !!AI_SERVICE_CONFIGS.anthropic.apiKey;
  
  if (!hasOpenAI && !hasAnthropic) {
    console.error('No API keys found for any AI service - please add API keys to .env file');
    return false;
  }
  
  return true;
}
