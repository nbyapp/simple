import { AIMessage, AIService, AICompletionRequest, AICompletionResponse, AIStreamChunk, AIServiceConfig } from './types';

/**
 * Abstract base class for AI services that implements common functionality
 */
export abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig;
  
  constructor(config: AIServiceConfig) {
    this.config = config;
  }
  
  abstract id: string;
  abstract name: string;
  
  /**
   * Process messages to format them for the specific AI service
   * To be implemented by each service adapter
   */
  protected abstract formatMessages(messages: AIMessage[], systemPrompt?: string): any;
  
  /**
   * Make the actual API call to the AI service
   * To be implemented by each service adapter
   */
  protected abstract makeCompletionRequest(formattedMessages: any, stream: boolean): Promise<any>;
  
  /**
   * Parse the API response into our standard format
   * To be implemented by each service adapter
   */
  protected abstract parseCompletionResponse(response: any): AICompletionResponse;
  
  /**
   * Parse a streaming chunk into our standard format
   * To be implemented by each service adapter
   */
  protected abstract parseStreamChunk(chunk: any): AIStreamChunk;
  
  /**
   * Get a completion from the AI service
   */
  async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const formattedMessages = this.formatMessages(request.messages, request.systemPrompt);
      const response = await this.makeCompletionRequest(formattedMessages, false);
      return this.parseCompletionResponse(response);
    } catch (error) {
      console.error(`Error in ${this.name} service:`, error);
      throw new Error(`Failed to get completion from ${this.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get a streaming completion from the AI service
   */
  async *getCompletionStream(request: AICompletionRequest): AsyncIterable<AIStreamChunk> {
    try {
      const formattedMessages = this.formatMessages(request.messages, request.systemPrompt);
      const stream = await this.makeCompletionRequest(formattedMessages, true);
      
      for await (const chunk of stream) {
        const parsedChunk = this.parseStreamChunk(chunk);
        yield parsedChunk;
        
        if (parsedChunk.done) {
          break;
        }
      }
    } catch (error) {
      console.error(`Error in ${this.name} stream:`, error);
      throw new Error(`Failed to get completion stream from ${this.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
