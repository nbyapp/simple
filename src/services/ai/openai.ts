import { BaseAIService } from './base';
import { AIMessage, AICompletionResponse, AIStreamChunk, AIServiceConfig, AIServiceFactory } from './types';
import OpenAI from 'openai';
import { createProxyFetch } from './proxy';

/**
 * OpenAI service adapter
 */
export class OpenAIService extends BaseAIService {
  private client: OpenAI;
  
  id = 'openai';
  name = 'OpenAI';
  
  constructor(config: AIServiceConfig) {
    super(config);
    
    // Create a fetch function that uses our proxy to avoid CORS issues
    const proxyFetch = createProxyFetch(
      config.baseUrl || 'https://api.openai.com',
      config.apiKey
    );
    
    // Initialize the OpenAI client with our custom fetch
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined,
      fetch: proxyFetch as any, // Type assertion needed for compatibility
    });
  }
  
  protected formatMessages(messages: AIMessage[], systemPrompt?: string): OpenAI.Chat.ChatCompletionMessageParam[] {
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    // Map our message format to OpenAI's format
    messages.forEach((message) => {
      formattedMessages.push({
        role: message.role,
        content: message.content,
      });
    });
    
    return formattedMessages;
  }
  
  protected async makeCompletionRequest(formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[], stream: boolean): Promise<any> {
    try {
      return this.client.chat.completions.create({
        model: this.config.model,
        messages: formattedMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens,
        stream: stream,
      });
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      throw error;
    }
  }
  
  protected parseCompletionResponse(response: OpenAI.Chat.ChatCompletion): AICompletionResponse {
    const message = response.choices[0].message;
    
    return {
      content: message.content || '',
      finishReason: response.choices[0].finish_reason || null,
      model: response.model,
    };
  }
  
  protected parseStreamChunk(chunk: OpenAI.Chat.ChatCompletionChunk): AIStreamChunk {
    const content = chunk.choices[0]?.delta?.content || '';
    const finishReason = chunk.choices[0]?.finish_reason;
    const done = !!finishReason;
    
    return {
      content,
      finishReason: finishReason || null,
      done,
    };
  }
}

/**
 * Factory for creating OpenAI service instances
 */
export class OpenAIServiceFactory implements AIServiceFactory {
  create(config: AIServiceConfig): OpenAIService {
    return new OpenAIService(config);
  }
}
