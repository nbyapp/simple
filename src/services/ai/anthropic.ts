import { BaseAIService } from './base';
import { AIMessage, AICompletionResponse, AIStreamChunk, AIServiceConfig, AIServiceFactory } from './types';
import Anthropic from '@anthropic-ai/sdk';
import { createProxyFetch } from './proxy';

/**
 * Anthropic service adapter
 */
export class AnthropicService extends BaseAIService {
  private client: Anthropic;
  
  id = 'anthropic';
  name = 'Anthropic';
  
  constructor(config: AIServiceConfig) {
    super(config);
    
    // Create a fetch function that uses our proxy to avoid CORS issues
    const proxyFetch = createProxyFetch(
      config.baseUrl || 'https://api.anthropic.com',
      config.apiKey
    );
    
    // Initialize the Anthropic client with our custom fetch
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined,
      fetch: proxyFetch as any, // Type assertion needed for compatibility
    });
  }
  
  protected formatMessages(messages: AIMessage[], systemPrompt?: string): {
    messages: Array<Anthropic.MessageParam>;
    system?: string;
  } {
    const formattedMessages: Anthropic.MessageParam[] = [];
    
    // Map our message format to Anthropic's format
    messages.forEach((message) => {
      if (message.role === 'user' || message.role === 'assistant') {
        formattedMessages.push({
          role: message.role,
          content: message.content,
        });
      }
      // Skip 'system' messages as they're handled differently in Anthropic
    });
    
    return {
      messages: formattedMessages,
      system: systemPrompt,
    };
  }
  
  protected async makeCompletionRequest(
    formattedData: { messages: Anthropic.MessageParam[]; system?: string },
    stream: boolean
  ): Promise<any> {
    const params: Anthropic.MessageCreateParams = {
      model: this.config.model,
      messages: formattedData.messages,
      max_tokens: this.config.maxTokens || 1024,
      temperature: this.config.temperature || 0.7,
      stream: stream,
    };
    
    if (formattedData.system) {
      params.system = formattedData.system;
    }
    
    try {
      if (stream) {
        return this.client.messages.create({
          ...params,
          stream: true,
        });
      } else {
        return this.client.messages.create(params);
      }
    } catch (error) {
      console.error("Error in Anthropic API call:", error);
      throw error;
    }
  }
  
  protected parseCompletionResponse(response: Anthropic.Message): AICompletionResponse {
    return {
      content: response.content[0]?.text || '',
      finishReason: response.stop_reason || null,
      model: response.model,
    };
  }
  
  protected parseStreamChunk(chunk: Anthropic.MessageStreamEvent): AIStreamChunk {
    if (chunk.type === 'content_block_delta') {
      return {
        content: chunk.delta?.text || '',
        finishReason: null,
        done: false,
      };
    } else if (chunk.type === 'message_stop') {
      return {
        content: '',
        finishReason: chunk.stop_reason || null,
        done: true,
      };
    } else {
      // Other event types like 'message_start' don't have content to return
      return {
        content: '',
        finishReason: null,
        done: false,
      };
    }
  }
}

/**
 * Factory for creating Anthropic service instances
 */
export class AnthropicServiceFactory implements AIServiceFactory {
  create(config: AIServiceConfig): AnthropicService {
    return new AnthropicService(config);
  }
}
