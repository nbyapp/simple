import { AIServiceConfig } from '../services/ai/types';

// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Default configurations for AI services
export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2048,
    useMock: isDevelopment && !import.meta.env.VITE_OPENAI_API_KEY,
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
    useMock: isDevelopment && !import.meta.env.VITE_ANTHROPIC_API_KEY,
  },
};

// Default AI service - can be overridden with an environment variable
export const DEFAULT_AI_SERVICE = 
  import.meta.env.VITE_DEFAULT_AI_SERVICE || 
  (AI_SERVICE_CONFIGS.openai.apiKey ? 'openai' : 
   (AI_SERVICE_CONFIGS.anthropic.apiKey ? 'anthropic' : 'openai'));

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  // In development, we can use mock mode without API keys
  if (isDevelopment) {
    return true;
  }
  
  // In production, we require at least one valid API key
  const hasOpenAI = !!AI_SERVICE_CONFIGS.openai.apiKey;
  const hasAnthropic = !!AI_SERVICE_CONFIGS.anthropic.apiKey;
  
  if (!hasOpenAI && !hasAnthropic) {
    console.error('No API keys found for any AI service');
    return false;
  }
  
  // If default service is specified but the API key is missing
  const defaultConfig = AI_SERVICE_CONFIGS[DEFAULT_AI_SERVICE];
  if (!defaultConfig || !defaultConfig.apiKey) {
    console.warn(`Missing API key for default AI service: ${DEFAULT_AI_SERVICE}. Using fallback.`);
    return false;
  }
  
  return true;
}
