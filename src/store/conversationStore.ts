import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Message } from '../components/conversation/MessageList'
import { Decision, Category } from '../components/summary/SummaryPanel'
import { conversationService, aiServiceProvider, AIModelOption } from '../services/ai'
import { AI_SERVICE_CONFIGS, DEFAULT_AI_SERVICE } from '../config/ai'

interface ConversationState {
  // Conversation data
  messages: Message[]
  isProcessing: boolean
  suggestions: string[]
  highlightedMessageIds: string[]
  
  // Summary data
  decisions: Decision[]
  categories: Category[]
  expandedCategories: string[]
  
  // AI service configuration
  aiServiceId: string | null
  aiModels: Record<string, AIModelOption[]>
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  highlightMessages: (messageIds: string[]) => void
  toggleCategory: (categoryId: string) => void
  addDecision: (decision: Omit<Decision, 'id'>) => void
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id'>>) => void
  setAIService: (serviceId: string) => void
  setModel: (serviceId: string, modelId: string) => void
  initializeAIServices: () => void
  getSelectedModel: (serviceId: string) => string
}

// Initial categories
const initialCategories: Category[] = [
  { id: 'purpose', title: 'App Purpose' },
  { id: 'users', title: 'User Personas' },
  { id: 'features', title: 'Key Features' },
  { id: 'technology', title: 'Technical Requirements' },
]

export const useConversationStore = create<ConversationState>((set, get) => ({
  // Initial state
  messages: [
    {
      id: '1',
      sender: 'system',
      content: 'Welcome to Simple! How can I help you create your app today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isProcessing: false,
  suggestions: [
    'I want to build a social app',
    'Help me create a productivity tool',
    'I need an e-commerce app',
  ],
  highlightedMessageIds: [],
  decisions: [],
  categories: initialCategories,
  expandedCategories: ['purpose'],
  aiServiceId: null, // Will be set during initialization
  aiModels: {},
  
  // Initialize AI services
  initializeAIServices: () => {
    console.log('Initializing AI services...');
    
    // Track successfully initialized services
    const initializedServices: string[] = [];
    
    try {
      // Initialize services with valid API keys
      Object.entries(AI_SERVICE_CONFIGS).forEach(([id, config]) => {
        try {
          console.log(`Initializing service: ${id}`);
          const service = aiServiceProvider.initializeService(id, config);
          
          if (service) {
            console.log(`Successfully initialized AI service: ${id}`);
            initializedServices.push(id);
            
            // Store the available models for this service
            const models = service.getAvailableModels();
            
            set(state => ({
              aiModels: {
                ...state.aiModels,
                [id]: models
              }
            }));
          }
        } catch (error) {
          console.error(`Failed to initialize AI service ${id}:`, error);
        }
      });
      
      // Handle default service selection
      if (initializedServices.length > 0) {
        // Try to set the specified default service if it was initialized
        if (initializedServices.includes(DEFAULT_AI_SERVICE)) {
          aiServiceProvider.setDefaultService(DEFAULT_AI_SERVICE);
          set({ aiServiceId: DEFAULT_AI_SERVICE });
          console.log(`Set default AI service to: ${DEFAULT_AI_SERVICE}`);
        } else {
          // Otherwise use the first available service
          const firstServiceId = initializedServices[0];
          aiServiceProvider.setDefaultService(firstServiceId);
          set({ aiServiceId: firstServiceId });
          console.log(`Set default AI service to first available: ${firstServiceId}`);
        }
      } else {
        // No services initialized - show a warning
        console.warn('No AI services initialized! Add API keys to .env file');
        
        // Add a system message explaining the issue
        set(state => ({
          messages: [
            ...state.messages,
            {
              id: uuidv4(),
              sender: 'system',
              content: 'No AI services are available. Please add your OpenAI or Anthropic API keys to the .env file.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'error',
            },
          ],
        }));
      }
    } catch (error) {
      console.error('Error initializing AI services:', error);
    }
  },
  
  // Set active AI service
  setAIService: (serviceId: string) => {
    if (aiServiceProvider.hasService(serviceId)) {
      aiServiceProvider.setDefaultService(serviceId);
      set({ aiServiceId: serviceId });
      console.log(`Switched AI service to: ${serviceId}`);
    } else {
      console.error(`AI service ${serviceId} is not initialized`);
    }
  },
  
  // Get the selected model for a service
  getSelectedModel: (serviceId: string) => {
    if (!aiServiceProvider.hasService(serviceId)) {
      return '';
    }
    
    try {
      return aiServiceProvider.getSelectedModel(serviceId);
    } catch (error) {
      console.error(`Error getting selected model for ${serviceId}:`, error);
      return '';
    }
  },
  
  // Set the model for a service
  setModel: (serviceId: string, modelId: string) => {
    if (!aiServiceProvider.hasService(serviceId)) {
      console.error(`AI service ${serviceId} is not initialized`);
      return;
    }
    
    try {
      aiServiceProvider.setModel(serviceId, modelId);
      console.log(`Set model for ${serviceId} to: ${modelId}`);
    } catch (error) {
      console.error(`Error setting model for ${serviceId}:`, error);
    }
  },
  
  // Send message
  sendMessage: async (content: string) => {
    // Check if we have an AI service
    const { aiServiceId } = get();
    if (!aiServiceId) {
      set(state => ({
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            sender: 'user',
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: uuidv4(),
            sender: 'system',
            content: 'No AI services are available. Please add your OpenAI or Anthropic API keys to the .env file.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'error',
          },
        ],
      }));
      return;
    }
    
    // Add user message to the UI
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      isProcessing: true,
      suggestions: [],
    }));
    
    try {
      // Add message to conversation service
      conversationService.addMessage('user', content);
      
      // Create a placeholder for the assistant's response
      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        sender: 'ai',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));
      
      // Get streaming response from AI
      let messageContent = '';
      
      const result = await conversationService.streamMessage(content, (chunk) => {
        messageContent += chunk.content;
        
        // Update the message in the UI
        set((state) => ({
          messages: state.messages.map((msg) => 
            msg.id === assistantMessageId
              ? { ...msg, content: messageContent }
              : msg
          ),
        }));
      });
      
      // Process decisions from AI
      if (result.decisions && result.decisions.length > 0) {
        result.decisions.forEach((decisionData) => {
          const decision: Omit<Decision, 'id'> = {
            title: decisionData.title || 'Untitled Decision',
            details: decisionData.details || '',
            status: decisionData.status as Decision['status'] || 'pending',
            category: decisionData.category || 'purpose',
            relatedMessageIds: [userMessageId, assistantMessageId],
          };
          
          get().addDecision(decision);
        });
      }
      
      // Update with suggestions and finish
      set({
        isProcessing: false,
        suggestions: result.suggestions || [],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback error message if the message wasn't added by conversation service
      set((state) => {
        // Check if an AI message was already added with content
        const hasAiResponse = state.messages.some(m => 
          m.sender === 'ai' && 
          m.content && 
          m.content.length > 0 && 
          state.messages.indexOf(m) > state.messages.findIndex(msg => msg.id === userMessageId)
        );
        
        if (!hasAiResponse) {
          return {
            messages: [
              ...state.messages,
              {
                id: uuidv4(),
                sender: 'system',
                content: 'Error: Could not connect to the AI service. This might be due to CORS restrictions in the browser. Please try setting up a backend proxy server or using a browser extension like CORS Unblock (for testing only).',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'error',
              },
            ],
            isProcessing: false,
            suggestions: [
              'I want to build a social app',
              'Help me create a productivity tool',
              'I need an e-commerce app',
            ],
          };
        }
        
        return {
          isProcessing: false,
        };
      });
    }
  },
  
  highlightMessages: (messageIds) => {
    set({ highlightedMessageIds: messageIds });
    
    // Clear the highlight after 3 seconds
    setTimeout(() => {
      set((state) => {
        if (state.highlightedMessageIds.toString() === messageIds.toString()) {
          return { highlightedMessageIds: [] };
        }
        return {};
      });
    }, 3000);
  },
  
  toggleCategory: (categoryId) => {
    set((state) => {
      const isCurrentlyExpanded = state.expandedCategories.includes(categoryId);
      
      if (isCurrentlyExpanded) {
        return {
          expandedCategories: state.expandedCategories.filter(id => id !== categoryId),
        };
      } else {
        return {
          expandedCategories: [...state.expandedCategories, categoryId],
        };
      }
    });
  },
  
  addDecision: (decision) => {
    const newDecision: Decision = {
      ...decision,
      id: uuidv4(),
    };
    
    set((state) => ({
      decisions: [...state.decisions, newDecision],
      // Automatically expand the category if it's not already expanded
      expandedCategories: state.expandedCategories.includes(decision.category)
        ? state.expandedCategories
        : [...state.expandedCategories, decision.category],
    }));
  },
  
  updateDecision: (id, updates) => {
    set((state) => ({
      decisions: state.decisions.map(decision => 
        decision.id === id ? { ...decision, ...updates } : decision
      ),
    }));
  },
}));
