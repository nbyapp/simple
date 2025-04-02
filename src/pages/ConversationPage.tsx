import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ConversationPanel from '../components/conversation/ConversationPanel'
import SummaryPanel from '../components/summary/SummaryPanel'
import AIServiceSelector from '../components/settings/AIServiceSelector'
import { useConversationStore } from '../store/conversationStore'

const ConversationPage: React.FC = () => {
  const {
    messages,
    isProcessing,
    suggestions,
    highlightedMessageIds,
    decisions,
    categories,
    expandedCategories,
    sendMessage,
    highlightMessages,
    toggleCategory,
  } = useConversationStore()

  return (
    <PageContainer>
      <Header>
        <LogoLink to="/">
          <Title>Simple</Title>
        </LogoLink>
        <AIServiceSelector />
      </Header>
      
      <MainContent>
        <ConversationPanel
          messages={messages}
          onSendMessage={sendMessage}
          isProcessing={isProcessing}
          suggestions={suggestions}
          highlightedMessageIds={highlightedMessageIds}
        />
        
        <SummaryPanel
          categories={categories}
          decisions={decisions}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
          onViewDecision={highlightMessages}
        />
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

const LogoLink = styled(Link)`
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
  }
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

export default ConversationPage
