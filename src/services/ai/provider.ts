import { AIService, AIServiceFactory, AIServiceConfig, AIModelOption } from './types';
import { OpenAIServiceFactory } from './openai';
import { AnthropicServiceFactory } from './anthropic';

/**
 * AI Service Provider - manages available AI services
 */
export class AIServiceProvider {
  private factories: Map<string, AIServiceFactory>;
  private services: Map<string, AIService>;
  private defaultServiceId: string | null = null;
  
  constructor() {
    this.factories = new Map();
    this.services = new Map();
    
    // Register the default service factories
    this.registerFactory('openai', new OpenAIServiceFactory());
    this.registerFactory('anthropic', new AnthropicServiceFactory());
  }
  
  /**
   * Register a new AI service factory
   */
  registerFactory(id: string, factory: AIServiceFactory): void {
    this.factories.set(id, factory);
  }
  
  /**
   * Initialize an AI service from a registered factory
   */
  initializeService(id: string, config: AIServiceConfig): AIService | null {
    console.log(`Initializing AI service: ${id}`);
    
    // Skip initialization if no API key is provided
    if (!config.apiKey) {
      console.warn(`Skipping initialization of ${id} service - no API key provided`);
      return null;
    }
    
    const factory = this.factories.get(id);
    
    if (!factory) {
      throw new Error(`No factory registered for service ID: ${id}`);
    }
    
    try {
      const service = factory.create(config);
      this.services.set(id, service);
      
      // Set as default if it's the first one
      if (this.defaultServiceId === null) {
        this.defaultServiceId = id;
      }
      
      return service;
    } catch (error) {
      console.error(`Error creating service ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Set the default service ID
   */
  setDefaultService(id: string): void {
    if (!this.services.has(id)) {
      throw new Error(`Service with ID ${id} is not initialized`);
    }
    
    this.defaultServiceId = id;
  }
  
  /**
   * Get a specific AI service by ID
   */
  getService(id: string): AIService {
    const service = this.services.get(id);
    
    if (!service) {
      throw new Error(`Service with ID ${id} is not initialized`);
    }
    
    return service;
  }
  
  /**
   * Get the default AI service
   */
  getDefaultService(): AIService {
    if (this.defaultServiceId === null) {
      throw new Error('No default service has been set');
    }
    
    return this.getService(this.defaultServiceId);
  }
  
  /**
   * Get all initialized services
   */
  getAllServices(): AIService[] {
    return Array.from(this.services.values());
  }
  
  /**
   * Get available models for a specific service
   */
  getModels(serviceId: string): AIModelOption[] {
    const service = this.getService(serviceId);
    return service.getAvailableModels();
  }
  
  /**
   * Get the current model for a specific service
   */
  getSelectedModel(serviceId: string): string {
    const service = this.getService(serviceId);
    return service.getSelectedModel();
  }
  
  /**
   * Set the model for a specific service
   */
  setModel(serviceId: string, modelId: string): void {
    const service = this.getService(serviceId);
    service.setModel(modelId);
  }
  
  /**
   * Check if a specific service ID is initialized
   */
  hasService(id: string): boolean {
    return this.services.has(id);
  }
}

// Create and export a singleton instance
export const aiServiceProvider = new AIServiceProvider();
