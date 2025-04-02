import React, { useState } from 'react'
import styled from 'styled-components'
import CategorySection from './CategorySection'
import DecisionCard, { DecisionStatus } from './DecisionCard'

export interface Decision {
  id: string
  title: string
  description?: string
  status: DecisionStatus
  category: string
  relatedMessageIds: string[]
}

export interface Category {
  id: string
  title: string
  icon?: React.ReactNode
}

interface SummaryPanelProps {
  decisions: Decision[]
  categories: Category[]
  onViewRelatedMessages: (messageIds: string[]) => void
  onEditDecision?: (decisionId: string) => void
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  decisions,
  categories,
  onViewRelatedMessages,
  onEditDecision,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['purpose'])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleEditDecision = (decisionId: string) => {
    onEditDecision?.(decisionId)
  }

  const isEmpty = decisions.length === 0

  return (
    <Container>
      <Header>
        <Title>App Summary</Title>
      </Header>

      <Content>
        {isEmpty ? (
          <EmptyState>
            Your app details will appear here as we discuss your requirements.
          </EmptyState>
        ) : (
          categories.map(category => {
            const categoryDecisions = decisions.filter(
              decision => decision.category === category.id
            )

            if (categoryDecisions.length === 0) return null

            return (
              <CategorySection
                key={category.id}
                title={category.title}
                icon={category.icon}
                expanded={expandedCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
              >
                {categoryDecisions.map(decision => (
                  <DecisionCard
                    key={decision.id}
                    title={decision.title}
                    description={decision.description}
                    status={decision.status}
                    relatedMessageIds={decision.relatedMessageIds}
                    onViewRelatedMessages={onViewRelatedMessages}
                    onEdit={() => handleEditDecision(decision.id)}
                  />
                ))}
              </CategorySection>
            )
          })
        )}
      </Content>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  flex: 2;
`

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
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

export default SummaryPanel
