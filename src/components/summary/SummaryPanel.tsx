import React from 'react'
import styled from 'styled-components'
import CategorySection from './CategorySection'
import DecisionCard, { DecisionStatus } from './DecisionCard'

export interface Decision {
  id: string
  title: string
  details: string
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
  categories: Category[]
  decisions: Decision[]
  expandedCategories: string[]
  onToggleCategory: (categoryId: string) => void
  onViewDecision: (messageIds: string[]) => void
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  categories,
  decisions,
  expandedCategories,
  onToggleCategory,
  onViewDecision,
}) => {
  const getDecisionsForCategory = (categoryId: string) => {
    return decisions.filter(decision => decision.category === categoryId)
  }

  return (
    <Container>
      <Header>
        <Title>App Summary</Title>
      </Header>
      <Content>
        {categories.length === 0 ? (
          <EmptyState>
            Your app details will appear here as we discuss your requirements.
          </EmptyState>
        ) : (
          categories.map(category => {
            const categoryDecisions = getDecisionsForCategory(category.id)
            
            return (
              <CategorySection
                key={category.id}
                title={category.title}
                icon={category.icon}
                expanded={expandedCategories.includes(category.id)}
                onToggle={() => onToggleCategory(category.id)}
              >
                {categoryDecisions.length === 0 ? (
                  <EmptyCategory>No decisions in this category yet.</EmptyCategory>
                ) : (
                  categoryDecisions.map(decision => (
                    <DecisionCard
                      key={decision.id}
                      title={decision.title}
                      details={decision.details}
                      status={decision.status}
                      relatedMessageIds={decision.relatedMessageIds}
                      onView={onViewDecision}
                    />
                  ))
                )}
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
  flex: 2;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
`

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
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

const EmptyCategory = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  font-style: italic;
  text-align: center;
`

export default SummaryPanel
