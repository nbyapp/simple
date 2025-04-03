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
   * Get a mock response when APIs fail - for demo purposes only
   */
  private getMockResponse(userMessage: string): string {
    // Simple fallback responses
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! I'm here to help you create your app. What kind of app are you looking to build?";
    } else if (userMessage.toLowerCase().includes('app')) {
      return "Great! Could you tell me more about what problem your app is trying to solve?";
    } else {
      return "I understand. Let's explore that further. What features would be most important for your app?";
    }
  }
  
  /**
   * Send a user message and get a response
   */
  async sendMessage(content: string): Promise<ConversationResult> {
    // Add user message to history
    this.addMessage('user', content);
    
    try {
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
    } catch (error) {
      console.error('Error in AI service:', error);
      
      // Fallback to mock response for demo purposes
      const mockResponse = this.getMockResponse(content);
      this.addMessage('assistant', mockResponse);
      
      return {
        message: mockResponse,
        suggestions: [
          'Tell me more about that',
          'What features do you need?',
          'Who are your target users?',
        ],
        decisions: [],
      };
    }
  }
  
  /**
   * Send a user message and get a streaming response
   */
  async streamMessage(content: string, onChunk: StreamCallback): Promise<ConversationResult> {
    // Add user message to history
    this.addMessage('user', content);
    
    try {
      // Get the default AI service
      const aiService = aiServiceProvider.getDefaultService();
      
      // Get streaming completion from AI
      let fullResponse = '';
      
      try {
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
      } catch (streamError) {
        console.error('Error in streaming response:', streamError);
        
        // If streaming fails, fall back to non-streaming completion
        const fallbackResponse = await this.sendMessage(content);
        return fallbackResponse;
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
    } catch (error) {
      console.error('Error in AI service:', error);
      
      // Fallback to mock response for demo purposes
      const mockResponse = this.getMockResponse(content);
      
      // Simulate streaming for mock response
      const words = mockResponse.split(' ');
      for (const word of words) {
        onChunk({
          content: word + ' ',
          finishReason: null,
          done: false,
        });
        
        // Add a small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Signal completion
      onChunk({
        content: '',
        finishReason: 'stop',
        done: true,
      });
      
      this.addMessage('assistant', mockResponse);
      
      return {
        message: mockResponse,
        suggestions: [
          'Tell me more about that',
          'What features do you need?',
          'Who are your target users?',
        ],
        decisions: [],
      };
    }
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
      return [
        'Tell me more about that',
        'What features do you need?',
        'Who are your target users?',
      ];
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
        // First, try to clean the response to handle potential formatting issues
        let jsonContent = response.content.trim();
        
        // Check if content starts with ``` or ``` (code block markers)
        const codeBlockStart = jsonContent.indexOf('```');
        if (codeBlockStart !== -1) {
          const codeBlockEnd = jsonContent.lastIndexOf('```');
          // Extract content between code blocks
          if (codeBlockEnd > codeBlockStart) {
            jsonContent = jsonContent.substring(codeBlockStart + 3, codeBlockEnd).trim();
            
            // Remove language identifier if present (e.g., ```json)
            const firstLineBreak = jsonContent.indexOf('\n');
            if (firstLineBreak !== -1 && !jsonContent.substring(0, firstLineBreak).includes('{') && !jsonContent.substring(0, firstLineBreak).includes('[')) {
              jsonContent = jsonContent.substring(firstLineBreak).trim();
            }
          }
        }
        
        // Ensure it's a valid JSON array
        if (!jsonContent.startsWith('[')) {
          const arrayStart = jsonContent.indexOf('[');
          if (arrayStart !== -1) {
            jsonContent = jsonContent.substring(arrayStart);
          } else {
            throw new Error('Response does not contain a JSON array');
          }
        }
        
        // Parse the cleaned JSON string
        console.log('Attempting to parse decisions JSON:', jsonContent);
        const decisions = JSON.parse(jsonContent) as Partial<Decision>[];
        return Array.isArray(decisions) ? decisions : [];
      } catch (error) {
        console.error('Failed to parse decisions:', error);
        console.log('Raw response content:', response.content);
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
