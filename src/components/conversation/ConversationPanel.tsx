import React, { useState } from 'react'
import styled from 'styled-components'
import MessageList, { Message } from './MessageList'
import InputArea from './InputArea'

interface ConversationPanelProps {
  initialMessages?: Message[]
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  highlightedMessageIds?: string[]
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  initialMessages = [],
  onSendMessage,
  isProcessing = false,
  highlightedMessageIds = [],
}) => {
  const [messages] = useState<Message[]>(initialMessages)
  const [suggestions] = useState<string[]>([
    'I want to build a fitness app',
    'Create a photo sharing app',
    'I need a task management app',
  ])

  return (
    <Container>
      <MessageList 
        messages={messages} 
        isTyping={isProcessing}
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
  flex: 1;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

export default ConversationPanel
