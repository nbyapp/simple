import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Message } from '../components/conversation/MessageList'
import { Decision, Category } from '../components/summary/SummaryPanel'
import { conversationService, aiServiceProvider } from '../services/ai'
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
  aiServiceId: string
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  highlightMessages: (messageIds: string[]) => void
  toggleCategory: (categoryId: string) => void
  addDecision: (decision: Omit<Decision, 'id'>) => void
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id'>>) => void
  setAIService: (serviceId: string) => void
  initializeAIServices: () => void
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
  aiServiceId: DEFAULT_AI_SERVICE,
  
  // Initialize AI services
  initializeAIServices: () => {
    // Initialize available AI services
    Object.entries(AI_SERVICE_CONFIGS).forEach(([id, config]) => {
      if (config.apiKey) {
        try {
          aiServiceProvider.initializeService(id, config)
          console.log(`Initialized AI service: ${id}`)
        } catch (error) {
          console.error(`Failed to initialize AI service ${id}:`, error)
        }
      }
    })
    
    // Set default service
    if (aiServiceProvider.hasService(DEFAULT_AI_SERVICE)) {
      aiServiceProvider.setDefaultService(DEFAULT_AI_SERVICE)
      set({ aiServiceId: DEFAULT_AI_SERVICE })
    } else {
      // Use the first available service as default if the specified default is not available
      const availableServices = aiServiceProvider.getAllServices()
      if (availableServices.length > 0) {
        const firstServiceId = availableServices[0].id
        aiServiceProvider.setDefaultService(firstServiceId)
        set({ aiServiceId: firstServiceId })
      }
    }
  },
  
  // Set active AI service
  setAIService: (serviceId: string) => {
    if (aiServiceProvider.hasService(serviceId)) {
      aiServiceProvider.setDefaultService(serviceId)
      set({ aiServiceId: serviceId })
    } else {
      console.error(`AI service ${serviceId} is not initialized`)
    }
  },
  
  // Send message
  sendMessage: async (content: string) => {
    // Add user message to the UI
    const userMessageId = uuidv4()
    const userMessage: Message = {
      id: userMessageId,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      isProcessing: true,
      suggestions: [],
    }))
    
    try {
      // Add message to conversation service
      conversationService.addMessage('user', content)
      
      // Create a placeholder for the assistant's response
      const assistantMessageId = uuidv4()
      const assistantMessage: Message = {
        id: assistantMessageId,
        sender: 'ai',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      
      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }))
      
      // Get streaming response from AI
      let messageContent = ''
      
      const result = await conversationService.streamMessage(content, (chunk) => {
        messageContent += chunk.content
        
        // Update the message in the UI
        set((state) => ({
          messages: state.messages.map((msg) => 
            msg.id === assistantMessageId
              ? { ...msg, content: messageContent }
              : msg
          ),
        }))
      })
      
      // Process decisions from AI
      if (result.decisions && result.decisions.length > 0) {
        result.decisions.forEach((decisionData) => {
          const decision: Omit<Decision, 'id'> = {
            title: decisionData.title || 'Untitled Decision',
            details: decisionData.details || '',
            status: decisionData.status as Decision['status'] || 'pending',
            category: decisionData.category || 'purpose',
            relatedMessageIds: [userMessageId, assistantMessageId],
          }
          
          get().addDecision(decision)
        })
      }
      
      // Update with suggestions and finish
      set((state) => ({
        isProcessing: false,
        suggestions: result.suggestions || [],
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            sender: 'system',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'error',
          },
        ],
        isProcessing: false,
      }))
    }
  },
  
  highlightMessages: (messageIds) => {
    set({ highlightedMessageIds: messageIds })
    
    // Clear the highlight after 3 seconds
    setTimeout(() => {
      set((state) => {
        if (state.highlightedMessageIds.toString() === messageIds.toString()) {
          return { highlightedMessageIds: [] }
        }
        return {}
      })
    }, 3000)
  },
  
  toggleCategory: (categoryId) => {
    set((state) => {
      const isCurrentlyExpanded = state.expandedCategories.includes(categoryId)
      
      if (isCurrentlyExpanded) {
        return {
          expandedCategories: state.expandedCategories.filter(id => id !== categoryId),
        }
      } else {
        return {
          expandedCategories: [...state.expandedCategories, categoryId],
        }
      }
    })
  },
  
  addDecision: (decision) => {
    const newDecision: Decision = {
      ...decision,
      id: uuidv4(),
    }
    
    set((state) => ({
      decisions: [...state.decisions, newDecision],
      // Automatically expand the category if it's not already expanded
      expandedCategories: state.expandedCategories.includes(decision.category)
        ? state.expandedCategories
        : [...state.expandedCategories, decision.category],
    }))
  },
  
  updateDecision: (id, updates) => {
    set((state) => ({
      decisions: state.decisions.map(decision => 
        decision.id === id ? { ...decision, ...updates } : decision
      ),
    }))
  },
}))
