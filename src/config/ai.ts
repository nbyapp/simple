import { AIServiceConfig } from '../services/ai/types';

// Load configurations for AI services from environment variables
export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2048,
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 2048,
  },
};

// Get default AI service from environment variables or fallback to 'openai'
export const DEFAULT_AI_SERVICE = import.meta.env.VITE_DEFAULT_AI_SERVICE || 'openai';

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  const defaultService = DEFAULT_AI_SERVICE;
  const defaultConfig = AI_SERVICE_CONFIGS[defaultService];
  
  if (!defaultConfig || !defaultConfig.apiKey) {
    console.error(`Missing API key for default AI service: ${defaultService}`);
    return false;
  }
  
  return true;
}

// Function to get available AI services (those with API keys)
export function getAvailableAIServices(): string[] {
  return Object.entries(AI_SERVICE_CONFIGS)
    .filter(([_, config]) => !!config.apiKey)
    .map(([id]) => id);
}
