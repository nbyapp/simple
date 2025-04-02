import { create } from 'zustand'
import { Message } from '../components/conversation/MessageList'
import { Decision, Category } from '../components/summary/SummaryPanel'

interface ConversationState {
  // Conversation data
  messages: Message[]
  isProcessing: boolean
  suggestions: string[]
  highlightedMessageIds: string[]
  
  // Summary panel data
  decisions: Decision[]
  categories: Category[]
  expandedCategories: string[]
  
  // Actions
  addMessage: (message: Message) => void
  setProcessing: (isProcessing: boolean) => void
  setSuggestions: (suggestions: string[]) => void
  highlightMessages: (messageIds: string[]) => void
  clearHighlightedMessages: () => void
  
  addDecision: (decision: Decision) => void
  updateDecision: (decisionId: string, updates: Partial<Decision>) => void
  removeDecision: (decisionId: string) => void
  toggleCategory: (categoryId: string) => void
}

// Mock categories for initial state
const initialCategories: Category[] = [
  { id: 'purpose', title: 'App Purpose' },
  { id: 'users', title: 'User Personas' },
  { id: 'features', title: 'Features' },
  { id: 'technical', title: 'Technical Requirements' },
]

export const useConversationStore = create<ConversationState>((set) => ({
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
    'I want to build a social media app',
    'Create an app for managing tasks',
    'I need a delivery tracking app',
  ],
  highlightedMessageIds: [],
  
  decisions: [],
  categories: initialCategories,
  expandedCategories: ['purpose'],
  
  // Actions
  addMessage: (message) => 
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  setSuggestions: (suggestions) => set({ suggestions }),
  
  highlightMessages: (messageIds) => set({ highlightedMessageIds: messageIds }),
  
  clearHighlightedMessages: () => set({ highlightedMessageIds: [] }),
  
  addDecision: (decision) => 
    set((state) => ({
      decisions: [...state.decisions, decision],
    })),
  
  updateDecision: (decisionId, updates) =>
    set((state) => ({
      decisions: state.decisions.map((decision) =>
        decision.id === decisionId ? { ...decision, ...updates } : decision
      ),
    })),
  
  removeDecision: (decisionId) =>
    set((state) => ({
      decisions: state.decisions.filter((decision) => decision.id !== decisionId),
    })),
  
  toggleCategory: (categoryId) =>
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(categoryId)
        ? state.expandedCategories.filter((id) => id !== categoryId)
        : [...state.expandedCategories, categoryId],
    })),
}))
