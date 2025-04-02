import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Message } from '../components/conversation/MessageList'
import { Decision, Category } from '../components/summary/SummaryPanel'

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
  
  // Actions
  sendMessage: (content: string) => void
  highlightMessages: (messageIds: string[]) => void
  toggleCategory: (categoryId: string) => void
  addDecision: (decision: Omit<Decision, 'id'>) => void
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id'>>) => void
}

// Initial categories
const initialCategories: Category[] = [
  { id: 'purpose', title: 'App Purpose' },
  { id: 'users', title: 'User Personas' },
  { id: 'features', title: 'Key Features' },
  { id: 'technology', title: 'Technical Requirements' },
]

// For demonstration purposes only - in a real app, this would come from the AI service
const mockAIResponse = (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        resolve('Hello! I\'m here to help you create your app. What kind of app are you looking to build?')
      } else if (userMessage.toLowerCase().includes('app')) {
        resolve('Great! Could you tell me more about what problem your app is trying to solve?')
      } else {
        resolve('I understand. Let\'s explore that further. What features would be most important for your app?')
      }
    }, 1500)
  })
}

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
  
  // Actions
  sendMessage: async (content) => {
    // Add user message
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
    
    // In a real app, we would call the AI service here
    try {
      const aiResponse = await mockAIResponse(content)
      
      // Add AI response
      const aiMessage: Message = {
        id: uuidv4(),
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      
      set((state) => ({
        messages: [...state.messages, aiMessage],
        isProcessing: false,
        suggestions: [
          'Tell me more about that',
          'What features do you need?',
          'Who are your target users?',
        ],
      }))
      
      // For demonstration - add a sample decision when the user mentions an app
      if (content.toLowerCase().includes('app')) {
        const decision: Omit<Decision, 'id'> = {
          title: 'App Type Identified',
          details: `Based on your description, it sounds like you're interested in building ${
            content.toLowerCase().includes('social') ? 'a social networking app' :
            content.toLowerCase().includes('e-commerce') ? 'an e-commerce platform' :
            'a mobile application'
          }.`,
          status: 'pending',
          category: 'purpose',
          relatedMessageIds: [userMessageId],
        }
        
        get().addDecision(decision)
      }
    } catch (error) {
      // Handle error
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            sender: 'system',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
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
