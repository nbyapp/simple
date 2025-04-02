import { aiServiceProvider } from './provider';
import { PromptManager } from './prompts';
import { AIMessage, AIStreamChunk } from './types';
import { Decision } from '../../components/summary/SummaryPanel';

/**
 * Callback for handling streaming responses
 */
export type StreamCallback = (chunk: AIStreamChunk) => void;

/**
 * Result of a conversation message
 */
export interface ConversationResult {
  message: string;
  suggestions: string[];
  decisions: Partial<Decision>[];
}

/**
 * Service for managing conversations with AI
 */
export class ConversationService {
  private messages: AIMessage[] = [];
  
  constructor() {
    // Initialize with any existing messages if needed
  }
  
  /**
   * Add a message to the conversation history
   */
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.messages.push({ role, content });
  }
  
  /**
   * Get all messages in the conversation
   */
  getMessages(): AIMessage[] {
    return [...this.messages];
  }
  
  /**
   * Clear the conversation history
   */
  clearMessages(): void {
    this.messages = [];
  }
  
  /**
   * Send a user message and get a response
   */
  async sendMessage(content: string): Promise<ConversationResult> {
    // Add user message to history
    this.addMessage('user', content);
    
    // Get the default AI service
    const aiService = aiServiceProvider.getDefaultService();
    
    // Get completion from AI
    const response = await aiService.getCompletion({
      messages: this.messages,
      systemPrompt: PromptManager.getMainSystemPrompt(),
    });
    
    // Add assistant response to history
    this.addMessage('assistant', response.content);
    
    // Generate suggestions based on the conversation
    const suggestions = await this.generateSuggestions();
    
    // Extract decisions from the conversation
    const decisions = await this.extractDecisions();
    
    return {
      message: response.content,
      suggestions,
      decisions,
    };
  }
  
  /**
   * Send a user message and get a streaming response
   */
  async streamMessage(content: string, onChunk: StreamCallback): Promise<ConversationResult> {
    // Add user message to history
    this.addMessage('user', content);
    
    // Get the default AI service
    const aiService = aiServiceProvider.getDefaultService();
    
    // Get streaming completion from AI
    let fullResponse = '';
    
    for await (const chunk of aiService.getCompletionStream({
      messages: this.messages,
      systemPrompt: PromptManager.getMainSystemPrompt(),
      stream: true,
    })) {
      // Call the callback with the chunk
      onChunk(chunk);
      
      // Accumulate the response
      fullResponse += chunk.content;
      
      // If it's the last chunk, finalize the message
      if (chunk.done) {
        break;
      }
    }
    
    // Add assistant response to history
    this.addMessage('assistant', fullResponse);
    
    // Generate suggestions based on the conversation
    const suggestions = await this.generateSuggestions();
    
    // Extract decisions from the conversation
    const decisions = await this.extractDecisions();
    
    return {
      message: fullResponse,
      suggestions,
      decisions,
    };
  }
  
  /**
   * Generate suggestions based on the conversation
   */
  private async generateSuggestions(): Promise<string[]> {
    try {
      // Get the default AI service
      const aiService = aiServiceProvider.getDefaultService();
      
      // Format the conversation for the suggestions prompt
      const conversationText = PromptManager.formatConversationText(this.messages);
      
      // Get suggestions from AI
      const response = await aiService.getCompletion({
        messages: [
          {
            role: 'user',
            content: PromptManager.createSuggestionsPrompt(conversationText),
          },
        ],
      });
      
      // Parse the JSON response
      try {
        const suggestions = JSON.parse(response.content) as string[];
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (error) {
        console.error('Failed to parse suggestions:', error);
        return [];
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }
  
  /**
   * Extract decisions from the conversation
   */
  private async extractDecisions(): Promise<Partial<Decision>[]> {
    try {
      // Get the default AI service
      const aiService = aiServiceProvider.getDefaultService();
      
      // Format the conversation for the decision extraction prompt
      const conversationText = PromptManager.formatConversationText(this.messages);
      
      // Get decisions from AI
      const response = await aiService.getCompletion({
        messages: [
          {
            role: 'user',
            content: PromptManager.createDecisionExtractionPrompt(conversationText),
          },
        ],
      });
      
      // Parse the JSON response
      try {
        const decisions = JSON.parse(response.content) as Partial<Decision>[];
        return Array.isArray(decisions) ? decisions : [];
      } catch (error) {
        console.error('Failed to parse decisions:', error);
        return [];
      }
    } catch (error) {
      console.error('Failed to extract decisions:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const conversationService = new ConversationService();
