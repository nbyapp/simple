import { AIServiceConfig } from '../services/ai/types';

// Default configurations for AI services
// In a real app, these would be loaded from environment variables

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

export const DEFAULT_AI_SERVICE = 'openai';

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  const defaultConfig = AI_SERVICE_CONFIGS[DEFAULT_AI_SERVICE];
  
  if (!defaultConfig || !defaultConfig.apiKey) {
    console.error(`Missing API key for default AI service: ${DEFAULT_AI_SERVICE}`);
    return false;
  }
  
  return true;
}
