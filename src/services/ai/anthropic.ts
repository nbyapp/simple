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
        if (line.trim() === '' || line.startsWith('data: ')) {
          const eventData = line.replace(/^data: /, '');
          if (eventData === '[DONE]') continue;
          try {
            if (eventData.trim()) {
              yield JSON.parse(eventData);
            }
          } catch (e) {
            console.warn('Error parsing JSON from stream:', e, 'Line:', eventData);
          }
        }
      }
    }

    if (buffer) {
      try {
        const eventData = buffer.replace(/^data: /, '');
        if (eventData && eventData !== '[DONE]') {
          yield JSON.parse(eventData);
        }
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
  private proxyFetch: (url: string | URL | Request, options?: RequestInit) => Promise<Response>;
  
  id = 'anthropic';
  name = 'Anthropic';
  
  constructor(config: AIServiceConfig) {
    super(config);
    
    // Create a fetch function that uses our proxy to avoid CORS issues
    this.proxyFetch = createProxyFetch(
      config.baseUrl || 'https://api.anthropic.com',
      config.apiKey,
      config.useMock || false
    ) as unknown as (url: string | URL | Request, options?: RequestInit) => Promise<Response>;
    
    // Initialize the Anthropic client with our custom fetch
    this.client = new Anthropic({
      apiKey: config.apiKey || 'mock-key',
      baseURL: config.baseUrl || undefined,
      fetch: this.proxyFetch,
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }
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
      // We'll use our proxy fetch with the appropriate endpoint for both streaming and non-streaming
      if (stream) {
        // Use our proxy endpoint for streaming
        const response = await this.proxyFetch('/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify(requestBody),
        });
        
        // Return a custom stream iterator
        return createCustomStream(response);
      } else {
        // For non-streaming, we can still use the SDK as it will use our proxy fetch
        // Add headers to the client options
        const clientOptions = {
          headers: {
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        };
        return this.client.messages.create(requestBody, clientOptions);
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
    // Handle Anthropic's event format, which is different from OpenAI
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
