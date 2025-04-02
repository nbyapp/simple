import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

export type DecisionStatus = 'confirmed' | 'pending' | 'conflicting'

export interface DecisionCardProps {
  title: string
  details: string
  status: DecisionStatus
  relatedMessageIds?: string[]
  onView?: (messageIds: string[]) => void
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  title,
  details,
  status,
  relatedMessageIds = [],
  onView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleView = () => {
    if (relatedMessageIds.length > 0 && onView) {
      onView(relatedMessageIds)
    }
  }

  return (
    <Container
      status={status}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header onClick={handleExpandToggle}>
        <StatusIndicator status={status} />
        <Title>{title}</Title>
        <ExpandIcon isExpanded={isExpanded} />
      </Header>

      <AnimatePresence>
        {isExpanded && (
          <Details
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DetailText>{details}</DetailText>
            {relatedMessageIds.length > 0 && (
              <ViewButton onClick={handleView}>
                View in conversation
              </ViewButton>
            )}
          </Details>
        )}
      </AnimatePresence>
    </Container>
  )
}

interface ContainerProps {
  status: DecisionStatus
}

const Container = styled(motion.div)<ContainerProps>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: white;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ status, theme }) => {
    switch (status) {
      case 'confirmed':
        return `${theme.colors.status.success}66`;
      case 'pending':
        return `${theme.colors.status.info}66`;
      case 'conflicting':
        return `${theme.colors.status.warning}66`;
      default:
        return `${theme.colors.text.tertiary}33`;
    }
  }};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  user-select: none;
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
        return theme.colors.status.success;
      case 'pending':
        return theme.colors.status.info;
      case 'conflicting':
        return theme.colors.status.warning;
      default:
        return theme.colors.text.tertiary;
    }
  }};
`

const Title = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
`

interface ExpandIconProps {
  isExpanded: boolean
}

const ExpandIcon = styled.div<ExpandIconProps>`
  width: 18px;
  height: 18px;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.text.secondary};
    transition: transform ${({ theme }) => theme.transitions.quick};
  }
  
  /* Horizontal line */
  &:before {
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    transform: translateY(-50%);
  }
  
  /* Vertical line */
  &:after {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%) ${({ isExpanded }) => isExpanded ? 'scaleY(0)' : 'scaleY(1)'};
  }
`

const Details = styled(motion.div)`
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`

const DetailText = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`

const ViewButton = styled.button`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => `${theme.colors.primary}11`};
  transition: background-color ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}22`};
  }
`

export default DecisionCard
