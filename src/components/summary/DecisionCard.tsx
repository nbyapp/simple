import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export type DecisionStatus = 'confirmed' | 'pending' | 'conflicting'

export interface DecisionCardProps {
  title: string
  description: string
  status: DecisionStatus
  relatedMessageIds?: string[]
  onHighlightConversation?: (messageIds: string[]) => void
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  title,
  description,
  status,
  relatedMessageIds = [],
  onHighlightConversation,
}) => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      status={status}
      onClick={() => {
        if (relatedMessageIds.length > 0 && onHighlightConversation) {
          onHighlightConversation(relatedMessageIds)
        }
      }}
    >
      <Header>
        <Title>{title}</Title>
        <StatusBadge status={status}>
          {status === 'confirmed' && 'Confirmed'}
          {status === 'pending' && 'Pending'}
          {status === 'conflicting' && 'Conflicting'}
        </StatusBadge>
      </Header>
      <Description>{description}</Description>
      {relatedMessageIds.length > 0 && (
        <SourceLink onClick={(e) => {
          e.stopPropagation()
          if (onHighlightConversation) {
            onHighlightConversation(relatedMessageIds)
          }
        }}>
          View in conversation
        </SourceLink>
      )}
    </Container>
  )
}

interface ContainerProps {
  status: DecisionStatus
}

const Container = styled(motion.div)<ContainerProps>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: box-shadow ${({ theme }) => theme.transitions.quick};
  border-left: 4px solid transparent;
  
  ${({ status, theme }) => {
    if (status === 'confirmed') {
      return `border-left-color: ${theme.colors.status.success};`
    } else if (status === 'pending') {
      return `border-left-color: ${theme.colors.status.info};`
    } else if (status === 'conflicting') {
      return `border-left-color: ${theme.colors.status.warning};`
    }
    return '';
  }}
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

interface StatusBadgeProps {
  status: DecisionStatus
}

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.body.tiny.fontSize};
  font-weight: 500;
  
  ${({ status, theme }) => {
    if (status === 'confirmed') {
      return `
        background-color: ${theme.colors.status.success}22;
        color: ${theme.colors.status.success};
      `
    } else if (status === 'pending') {
      return `
        background-color: ${theme.colors.status.info}22;
        color: ${theme.colors.status.info};
      `
    } else if (status === 'conflicting') {
      return `
        background-color: ${theme.colors.status.warning}22;
        color: ${theme.colors.status.warning};
      `
    }
    return '';
  }}
`

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SourceLink = styled.button`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.body.tiny.fontSize};
  background: none;
  border: none;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`

export default DecisionCard
