import React, { useState } from 'react'
import styled from 'styled-components'
import MessageList, { Message } from './MessageList'
import InputArea from './InputArea'

interface ConversationPanelProps {
  initialMessages?: Message[]
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  suggestions?: string[]
  highlightedMessageIds?: string[]
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  initialMessages = [],
  onSendMessage,
  isProcessing = false,
  suggestions = [],
  highlightedMessageIds = [],
}) => {
  const [messages] = useState<Message[]>(initialMessages)

  const handleSendMessage = (content: string) => {
    onSendMessage(content)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
  }

  return (
    <Container>
      <MessageList 
        messages={messages}
        isTyping={isProcessing}
        highlightedMessageIds={highlightedMessageIds}
      />
      <InputArea
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  border-right: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

export default ConversationPanel
