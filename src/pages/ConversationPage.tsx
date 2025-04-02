import styled from 'styled-components'
import { useState } from 'react'

// This will be a placeholder until we implement the actual conversation components
const ConversationPage = () => {
  const [messages] = useState([
    { id: '1', sender: 'system', text: 'Welcome to Simple! How can I help you create your app today?' },
  ])

  return (
    <PageContainer>
      <Header>
        <Title>Simple</Title>
      </Header>
      <MainContent>
        <ConversationPanel>
          <MessageList>
            {messages.map((message) => (
              <MessageItem key={message.id} sender={message.sender}>
                {message.text}
              </MessageItem>
            ))}
          </MessageList>
          <InputArea>
            <MessageInput placeholder="Describe your app idea..." />
            <SendButton>Send</SendButton>
          </InputArea>
        </ConversationPanel>
        <SummaryPanel>
          <SummaryHeader>App Summary</SummaryHeader>
          <EmptyState>
            Your app details will appear here as we discuss your requirements.
          </EmptyState>
        </SummaryPanel>
      </MainContent>
    </PageContainer>
  )
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
`

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const ConversationPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3;
  border-right: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const MessageList = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`

interface MessageItemProps {
  sender: string;
}

const MessageItem = styled.div<MessageItemProps>`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-width: 80%;
  
  ${({ sender, theme }) => {
    if (sender === 'user') {
      return `
        background-color: ${theme.colors.message.user};
        color: ${theme.colors.text.primary};
        align-self: flex-end;
        margin-left: auto;
      `
    } else if (sender === 'ai') {
      return `
        background-color: ${theme.colors.message.ai};
        color: ${theme.colors.text.primary};
        box-shadow: ${theme.shadows.sm};
      `
    } else {
      return `
        background-color: ${theme.colors.message.system};
        color: ${theme.colors.text.primary};
        font-style: italic;
      `
    }
  }}
`

const InputArea = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const MessageInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}66`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const SendButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  transition: background-color ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }
`

const SummaryPanel = styled.div`
  flex: 2;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  overflow-y: auto;
`

const SummaryHeader = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 1px dashed ${({ theme }) => theme.colors.text.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
`

export default ConversationPage
