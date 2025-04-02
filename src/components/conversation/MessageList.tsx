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

  // Scroll to bottom when messages change or when typing starts/stops
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Group messages by sender to create visual clusters
  const getMessageGroups = () => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []
    
    messages.forEach((message, index) => {
      // Start a new group if sender changes
      if (index === 0 || message.sender !== messages[index - 1].sender) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup])
        }
        currentGroup = [message]
      } else {
        // Add to current group if sender is the same
        currentGroup.push(message)
      }
    })
    
    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    
    return groups
  }

  const messageGroups = getMessageGroups()

  return (
    <Container>
      {messageGroups.map((group, groupIndex) => (
        <MessageGroup 
          key={`group-${groupIndex}`}
          sender={group[0].sender}
        >
          {group.map((message, messageIndex) => (
            <MessageWrapper 
              key={message.id}
              isHighlighted={highlightedMessageIds.includes(message.id)}
            >
              <MessageBubble
                sender={message.sender}
                content={message.content}
                timestamp={message.timestamp}
                status={message.status}
                isTyping={isTyping && messageIndex === group.length - 1 && groupIndex === messageGroups.length - 1}
              />
            </MessageWrapper>
          ))}
        </MessageGroup>
      ))}

      {/* Add a typing indicator for the AI if needed */}
      {isTyping && messages.length > 0 && messages[messages.length - 1].sender !== 'ai' && (
        <MessageGroup sender="ai">
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

interface MessageGroupProps {
  sender: MessageSender
}

const MessageGroup = styled.div<MessageGroupProps>`
  display: flex;
  flex-direction: column;
  align-items: ${({ sender }) => 
    sender === 'user' 
      ? 'flex-end' 
      : sender === 'system' 
        ? 'center' 
        : 'flex-start'
  };
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

interface MessageWrapperProps {
  isHighlighted: boolean
}

const MessageWrapper = styled.div<MessageWrapperProps>`
  position: relative;
  max-width: 100%;
  
  ${({ isHighlighted, theme }) => isHighlighted && `
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: ${theme.borderRadius.md};
      background-color: ${theme.colors.primary}22;
      z-index: -1;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 ${theme.colors.primary}44;
      }
      70% {
        box-shadow: 0 0 0 6px ${theme.colors.primary}00;
      }
      100% {
        box-shadow: 0 0 0 0 ${theme.colors.primary}00;
      }
    }
  `}
`

export default MessageList
