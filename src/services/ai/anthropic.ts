import { BaseAIService } from './base';
import { AIMessage, AICompletionResponse, AIStreamChunk, AIServiceConfig, AIServiceFactory, AIModelOption, ANTHROPIC_MODELS } from './types';
import Anthropic from '@anthropic-ai/sdk';
import { createProxyFetch } from './proxy';

/**
 * Custom implementation for streaming that doesn't rely on Anthropic's SDK
 * This is needed because the SDK's stream handling doesn't work well with our mock implementation
 */
async function* createCustomStream(response: Response): AsyncIterable<any> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          yield JSON.parse(line);
        } catch (e) {
          console.warn('Error parsing JSON from stream:', e, 'Line:', line);
        }
      }
    }

    if (buffer) {
      try {
        yield JSON.parse(buffer);
      } catch (e) {
        console.warn('Error parsing JSON from final buffer:', e);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Anthropic service adapter
 */
export class AnthropicService extends BaseAIService {
  private client: Anthropic;
  private proxyFetch: typeof fetch;
  
  id = 'anthropic';
  name = 'Anthropic';
  
  constructor(config: AIServiceConfig) {
    super(config);
    
    // Create a fetch function that uses our proxy to avoid CORS issues
    this.proxyFetch = createProxyFetch(
      config.baseUrl || 'https://api.anthropic.com',
      config.apiKey,
      config.useMock || false
    );
    
    // Initialize the Anthropic client with our custom fetch
    this.client = new Anthropic({
      apiKey: config.apiKey || 'mock-key',
      baseURL: config.baseUrl || undefined,
      fetch: this.proxyFetch as any, // Type assertion needed for compatibility
    });
  }
  
  /**
   * Get available models for this service
   */
  getAvailableModels(): AIModelOption[] {
    return ANTHROPIC_MODELS;
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
    // Build the request body
    const requestBody: any = {
      model: this.config.model,
      messages: formattedData.messages,
      max_tokens: this.config.maxTokens || 1024,
      temperature: this.config.temperature || 0.7,
      stream: stream,
    };
    
    if (formattedData.system) {
      requestBody.system = formattedData.system;
    }
    
    try {
      // For streaming, we need to use a custom implementation to avoid SDK issues
      if (stream) {
        const response = await this.proxyFetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey || 'mock-key',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(requestBody),
        });
        
        // Return a custom stream iterator that doesn't depend on Anthropic's SDK
        return createCustomStream(response);
      } else {
        // For non-streaming, we can use the SDK as normal
        return this.client.messages.create(requestBody);
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
  
  protected parseStreamChunk(chunk: any): AIStreamChunk {
    // Handle our custom stream format which matches Anthropic's event types
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
    // Set default model if not specified
    if (!config.model) {
      config.model = ANTHROPIC_MODELS[0].id;
    }
    
    return new AnthropicService(config);
  }
}
