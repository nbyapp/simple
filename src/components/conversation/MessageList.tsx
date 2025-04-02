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
  
  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Group messages by sender for consecutive messages
  const groupedMessages = messages.reduce<{sender: MessageSender, messages: Message[]}[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1]
    
    if (lastGroup && lastGroup.sender === message.sender) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ sender: message.sender, messages: [message] })
    }
    
    return groups
  }, [])

  return (
    <Container>
      {groupedMessages.map((group, groupIndex) => (
        <MessageGroup key={groupIndex}>
          {group.messages.map((message, messageIndex) => (
            <MessageBubbleWrapper 
              key={message.id}
              isHighlighted={highlightedMessageIds.includes(message.id)}
              isFirstInGroup={messageIndex === 0}
              isLastInGroup={messageIndex === group.messages.length - 1}
            >
              <MessageBubble
                sender={message.sender}
                content={message.content}
                timestamp={message.timestamp}
                status={message.status}
              />
            </MessageBubbleWrapper>
          ))}
        </MessageGroup>
      ))}
      
      {isTyping && (
        <MessageGroup>
          <MessageBubble
            sender="ai"
            content=""
            isTyping={true}
          />
        </MessageGroup>
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
  flex: 1;
`

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

interface MessageBubbleWrapperProps {
  isHighlighted: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
}

const MessageBubbleWrapper = styled.div<MessageBubbleWrapperProps>`
  position: relative;
  
  ${({ isHighlighted, theme }) => isHighlighted && `
    &::before {
      content: '';
      position: absolute;
      top: -${theme.spacing.xs};
      left: -${theme.spacing.xs};
      right: -${theme.spacing.xs};
      bottom: -${theme.spacing.xs};
      background-color: ${theme.colors.primary}22;
      border-radius: ${theme.borderRadius.md};
      z-index: -1;
    }
  `}
  
  /* Adjust spacing between messages in same group */
  ${({ isFirstInGroup, isLastInGroup, theme }) => {
    if (!isFirstInGroup && !isLastInGroup) {
      return `
        margin-top: ${theme.spacing.xs};
        margin-bottom: ${theme.spacing.xs};
      `
    } else if (!isFirstInGroup) {
      return `
        margin-top: ${theme.spacing.xs};
      `
    } else if (!isLastInGroup) {
      return `
        margin-bottom: ${theme.spacing.xs};
      `
    }
    return '';
  }}
`

export default MessageList
