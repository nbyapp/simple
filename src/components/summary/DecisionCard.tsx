import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export type DecisionStatus = 'confirmed' | 'pending' | 'conflict'

export interface DecisionCardProps {
  title: string
  description?: string
  status: DecisionStatus
  category?: string
  relatedMessageIds?: string[]
  onViewRelatedMessages?: (messageIds: string[]) => void
  onEdit?: () => void
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  title,
  description,
  status,
  relatedMessageIds = [],
  onViewRelatedMessages,
  onEdit,
}) => {
  const handleViewMessages = () => {
    if (relatedMessageIds.length > 0 && onViewRelatedMessages) {
      onViewRelatedMessages(relatedMessageIds)
    }
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      status={status}
    >
      <Header>
        <StatusIndicator status={status} />
        <Title>{title}</Title>
      </Header>
      
      {description && (
        <Description>{description}</Description>
      )}
      
      <ActionsContainer>
        {relatedMessageIds.length > 0 && (
          <ActionButton onClick={handleViewMessages}>
            View conversation
          </ActionButton>
        )}
        
        {onEdit && (
          <ActionButton onClick={onEdit}>
            Edit
          </ActionButton>
        )}
      </ActionsContainer>
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
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-left: 4px solid ${({ status, theme }) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.status.success
      case 'pending':
        return theme.colors.status.warning
      case 'conflict':
        return theme.colors.status.error
      default:
        return theme.colors.status.info
    }
  }};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

interface StatusIndicatorProps {
  status: DecisionStatus
}

const StatusIndicator = styled.div<StatusIndicatorProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.status.success
      case 'pending':
        return theme.colors.status.warning
      case 'conflict':
        return theme.colors.status.error
      default:
        return theme.colors.status.info
    }
  }};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const ActionButton = styled.button`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`

export default DecisionCard
