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
}

export interface AIService {
  id: string;
  name: string;
  getCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  getCompletionStream(request: AICompletionRequest): AsyncIterable<AIStreamChunk>;
}

export interface AIServiceFactory {
  create(config: AIServiceConfig): AIService;
}
