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
      <InputArea 
        onSendMessage={onSendMessage}
        isProcessing={isProcessing}
        suggestions={suggestions}
        onSuggestionClick={onSendMessage}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3;
  height: 100%;
  border-right: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
  background-color: ${({ theme }) => theme.colors.background};
`

export default ConversationPanel
