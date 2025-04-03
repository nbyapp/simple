import { BaseAIService } from './base';
import { AIMessage, AICompletionResponse, AIStreamChunk, AIServiceConfig, AIServiceFactory, AIModelOption, OPENAI_MODELS } from './types';
import OpenAI from 'openai';
import { createProxyFetch } from './proxy';

/**
 * Custom implementation for streaming that doesn't rely on OpenAI's SDK
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
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
        try {
          const data = line.replace(/^data: /, '');
          yield JSON.parse(data);
        } catch (e) {
          console.warn('Error parsing JSON from stream:', e, 'Line:', line);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * OpenAI service adapter
 */
export class OpenAIService extends BaseAIService {
  private client: OpenAI;
  private proxyFetch: typeof fetch;
  
  id = 'openai';
  name = 'OpenAI';
  
  constructor(config: AIServiceConfig) {
    super(config);
    
    // Create a fetch function that uses our proxy to avoid CORS issues
    this.proxyFetch = createProxyFetch(
      config.baseUrl || 'https://api.openai.com',
      config.apiKey,
      config.useMock || false
    );
    
    // Initialize the OpenAI client with our custom fetch
    this.client = new OpenAI({
      apiKey: config.apiKey || 'mock-key',
      baseURL: config.baseUrl || undefined,
      fetch: this.proxyFetch as any, // Type assertion needed for compatibility
    });
  }
  
  /**
   * Get available models for this service
   */
  getAvailableModels(): AIModelOption[] {
    return OPENAI_MODELS;
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
      // Build the request body
      const requestBody = {
        model: this.config.model,
        messages: formattedMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens,
        stream: stream,
      };
      
      // For streaming, we need to use a custom implementation to avoid SDK issues
      if (stream) {
        const response = await this.proxyFetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey || 'mock-key'}`,
          },
          body: JSON.stringify(requestBody),
        });
        
        // Return a custom stream iterator that doesn't depend on OpenAI's SDK
        return createCustomStream(response);
      } else {
        // For non-streaming, we can use the SDK as normal
        return this.client.chat.completions.create(requestBody);
      }
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
  
  protected parseStreamChunk(chunk: any): AIStreamChunk {
    // Handle our custom stream format
    const content = chunk.choices?.[0]?.delta?.content || '';
    const finishReason = chunk.choices?.[0]?.finish_reason;
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
    // Set default model if not specified
    if (!config.model) {
      config.model = OPENAI_MODELS[0].id;
    }
    
    return new OpenAIService(config);
  }
}
