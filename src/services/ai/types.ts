/**
 * Common types for AI service integration
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AICompletionResponse {
  content: string;
  finishReason: string | null;
  model: string;
}

export interface AIStreamChunk {
  content: string;
  finishReason: string | null;
  done: boolean;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
  useMock?: boolean;
}

export interface AIModelOption {
  id: string;
  name: string;
  contextLength: number;
  description: string;
  capabilities: string[];
}

export interface AIService {
  id: string;
  name: string;
  getCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  getCompletionStream(request: AICompletionRequest): AsyncIterable<AIStreamChunk>;
  getAvailableModels(): AIModelOption[];
  getSelectedModel(): string;
  setModel(modelId: string): void;
}

export interface AIServiceFactory {
  create(config: AIServiceConfig): AIService;
}

// Define available models for each service provider

export const OPENAI_MODELS: AIModelOption[] = [
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    contextLength: 128000,
    description: 'Most capable GPT-4 model with broader general knowledge and improved instruction following',
    capabilities: ['Text Generation', 'Creative Writing', 'Reasoning', 'Code Generation']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    contextLength: 8192,
    description: 'Powerful model for various tasks with strong reasoning and instruction following',
    capabilities: ['Text Generation', 'Creative Writing', 'Reasoning', 'Code Generation']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    contextLength: 4096,
    description: 'Fast, cost-effective model with good general capabilities',
    capabilities: ['Text Generation', 'Creative Writing', 'Summarization']
  }
];

export const ANTHROPIC_MODELS: AIModelOption[] = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    contextLength: 200000,
    description: 'Most powerful Claude model with exceptional intelligence and reasoning',
    capabilities: ['Text Generation', 'Creative Writing', 'Advanced Reasoning', 'Code Generation']
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    contextLength: 200000,
    description: 'Latest Claude model with enhanced reasoning and efficiency',
    capabilities: ['Text Generation', 'Creative Writing', 'Advanced Reasoning', 'Code Generation']
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    contextLength: 200000,
    description: 'Balanced model offering strong performance and efficiency',
    capabilities: ['Text Generation', 'Creative Writing', 'Reasoning', 'Code Generation']
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    contextLength: 150000,
    description: 'Fastest Claude model designed for efficiency and quick responses',
    capabilities: ['Text Generation', 'Creative Writing', 'Basic Reasoning']
  }
];
