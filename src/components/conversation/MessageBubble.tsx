import styled from 'styled-components'
import { motion } from 'framer-motion'

export type MessageSender = 'user' | 'ai' | 'system'

export interface MessageBubbleProps {
  sender: MessageSender
  content: string
  timestamp?: string
  status?: 'sent' | 'delivered' | 'read' | 'error'
  isTyping?: boolean
  children?: React.ReactNode
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  content,
  timestamp,
  status,
  isTyping = false,
  children,
}) => {
  return (
    <MessageContainer
      sender={sender}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessageContent>
        {isTyping ? (
          <TypingIndicator>
            <Dot delay={0} />
            <Dot delay={0.2} />
            <Dot delay={0.4} />
          </TypingIndicator>
        ) : (
          content
        )}
        {children}
      </MessageContent>
      {(timestamp || status) && (
        <MessageMeta>
          {timestamp && <Timestamp>{timestamp}</Timestamp>}
          {status && <Status status={status} />}
        </MessageMeta>
      )}
    </MessageContainer>
  )
}

interface MessageContainerProps {
  sender: MessageSender
}

const MessageContainer = styled(motion.div)<MessageContainerProps>`
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  ${({ sender, theme }) => {
    if (sender === 'user') {
      return `
        background-color: ${theme.colors.message.user};
        color: ${theme.colors.text.primary};
        align-self: flex-end;
        margin-left: auto;
        border-bottom-right-radius: ${theme.borderRadius.sm};
      `
    } else if (sender === 'ai') {
      return `
        background-color: ${theme.colors.message.ai};
        color: ${theme.colors.text.primary};
        align-self: flex-start;
        margin-right: auto;
        border-bottom-left-radius: ${theme.borderRadius.sm};
        box-shadow: ${theme.shadows.sm};
      `
    } else {
      return `
        background-color: ${theme.colors.message.system};
        color: ${theme.colors.text.primary};
        align-self: center;
        font-style: italic;
        font-size: ${theme.typography.body.small.fontSize};
      `
    }
  }}
`

const MessageContent = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`

const MessageMeta = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.body.tiny.fontSize};
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Timestamp = styled.span`
  margin-right: ${({ theme }) => theme.spacing.xs};
`

interface StatusProps {
  status: 'sent' | 'delivered' | 'read' | 'error'
}

const Status = styled.span<StatusProps>`
  ${({ status, theme }) => {
    if (status === 'error') {
      return `color: ${theme.colors.status.error};`
    }
    return ''
  }}
`

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
`

interface DotProps {
  delay: number
}

const Dot = styled.span<DotProps>`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: ${({ theme }) => theme.colors.text.tertiary};
  border-radius: 50%;
  animation: pulse 1.5s infinite;
  animation-delay: ${({ delay }) => delay}s;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(0.7);
      opacity: 0.5;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }
`

export default MessageBubble
