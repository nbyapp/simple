import { AIServiceConfig } from '../services/ai/types';

// Function to log API key details for debugging
function logApiKey(key: string | undefined, prefix: string): string {
  if (!key) return '';
  
  const length = key.length;
  const startsWith = key.substring(0, 7);
  console.log(`${prefix} API key: length=${length}, starts with "${startsWith}..."`);
  
  return key;
}

// Default configurations for AI services
export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: logApiKey(import.meta.env.VITE_OPENAI_API_KEY, 'OpenAI'),
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2048,
    useMock: false, // Use real API calls
  },
  anthropic: {
    apiKey: logApiKey(import.meta.env.VITE_ANTHROPIC_API_KEY, 'Anthropic'),
    model: 'claude-3-5-sonnet-20241022', // Update default to 3.5 Sonnet
    temperature: 0.7,
    maxTokens: 4096,
    useMock: false, // Use real API calls
  },
};

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('VITE_ANTHROPIC_API_KEY exists:', !!import.meta.env.VITE_ANTHROPIC_API_KEY);
console.log('VITE_DEFAULT_AI_SERVICE:', import.meta.env.VITE_DEFAULT_AI_SERVICE);

// Default AI service - can be overridden with an environment variable
export const DEFAULT_AI_SERVICE = 
  import.meta.env.VITE_DEFAULT_AI_SERVICE || 'openai';

// Function to validate that required API keys are available
export function validateApiConfig(): boolean {
  // Check if API keys are available
  const hasOpenAI = !!AI_SERVICE_CONFIGS.openai.apiKey;
  const hasAnthropic = !!AI_SERVICE_CONFIGS.anthropic.apiKey;
  
  console.log('API key validation:');
  console.log('- OpenAI API key available:', hasOpenAI);
  console.log('- Anthropic API key available:', hasAnthropic);
  
  if (!hasOpenAI && !hasAnthropic) {
    console.error('No API keys found for any AI service - please add API keys to .env file');
    return false;
  }
  
  return true;
}
