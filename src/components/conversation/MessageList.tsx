import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import MessageBubble, { MessageSender } from './MessageBubble'

export interface Message {
  id: string
  sender: MessageSender
  content: string
  timestamp?: string
  status?: 'sent' | 'delivered' | 'read' | 'error'
}

interface MessageListProps {
  messages: Message[]
  isTyping?: boolean
  highlightedMessageIds?: string[]
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  highlightedMessageIds = [],
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive or typing starts/stops
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <Container>
      {messages.map((message) => (
        <MessageWrapper
          key={message.id}
          isHighlighted={highlightedMessageIds.includes(message.id)}
        >
          <MessageBubble
            sender={message.sender}
            content={message.content}
            timestamp={message.timestamp}
            status={message.status}
          />
        </MessageWrapper>
      ))}

      {isTyping && (
        <MessageBubble
          sender="ai"
          content=""
          isTyping={true}
        />
      )}
      
      <div ref={messagesEndRef} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  scroll-behavior: smooth;
  flex: 1;
`

interface MessageWrapperProps {
  isHighlighted: boolean
}

const MessageWrapper = styled.div<MessageWrapperProps>`
  position: relative;
  
  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    `
      &::before {
        content: '';
        position: absolute;
        left: -${theme.spacing.md};
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: ${theme.colors.primary};
        border-radius: ${theme.borderRadius.sm};
      }
    `}
`

export default MessageList
