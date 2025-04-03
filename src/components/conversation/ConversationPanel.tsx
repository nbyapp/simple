import React, { useState } from 'react'
import styled from 'styled-components'
import MessageList, { Message } from './MessageList'
import InputArea from './InputArea'

interface ConversationPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  suggestions?: string[]
  highlightedMessageIds?: string[]
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  onSendMessage,
  isProcessing = false,
  suggestions = [],
  highlightedMessageIds = [],
}) => {
  const [isTyping, setIsTyping] = useState(false)

  // In a real implementation, this would come from the AI response status
  React.useEffect(() => {
    setIsTyping(isProcessing)
  }, [isProcessing])

  return (
    <Container>
      <MessageList 
        messages={messages} 
        isTyping={isTyping}
        highlightedMessageIds={highlightedMessageIds}
      />
      <InputContainer>
        <SuggestionsContainer>
          {suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map((suggestion, index) => (
                <SuggestionChip 
                  key={`${suggestion}-${index}`}
                  onClick={() => onSendMessage(suggestion)}
                >
                  {suggestion}
                </SuggestionChip>
              ))}
            </SuggestionsList>
          )}
        </SuggestionsContainer>
        <InputArea 
          onSendMessage={onSendMessage}
          isProcessing={isProcessing}
          suggestions={[]}
          onSuggestionClick={onSendMessage}
        />
      </InputContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.divider};
  position: relative;
`

const InputContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  background-color: ${({ theme }) => theme.colors.surface};
  padding-top: ${({ theme }) => theme.spacing.sm};
`

const SuggestionsContainer = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SuggestionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 100%;
  overflow-x: auto;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surfaceVariant};
    border-radius: ${({ theme }) => theme.borderRadius.pill};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.text.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.pill};
  }
`

const SuggestionChip = styled.button`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  transition: all ${({ theme }) => theme.transitions.quick};
  white-space: nowrap;
  border: 1px solid ${({ theme }) => theme.colors.primaryLight};
  font-weight: 500;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primaryLight}22`};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
`

export default ConversationPanel
