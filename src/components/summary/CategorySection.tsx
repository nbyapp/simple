import React from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

interface CategorySectionProps {
  title: string
  icon?: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <Container>
      <Header onClick={onToggle}>
        <HeaderLeft>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <Title>{title}</Title>
        </HeaderLeft>
        <ExpandIcon expanded={expanded}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ExpandIcon>
      </Header>
      <AnimatePresence>
        {expanded && (
          <ContentWrapper
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Content>{children}</Content>
          </ContentWrapper>
        )}
      </AnimatePresence>
    </Container>
  )
}

const Container = styled.div`
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  user-select: none;
  transition: background-color ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.text.tertiary}11`};
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

interface ExpandIconProps {
  expanded: boolean
}

const ExpandIcon = styled.div<ExpandIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  transition: transform ${({ theme }) => theme.transitions.quick};
  transform: ${({ expanded }) => expanded ? 'rotate(180deg)' : 'rotate(0)'};
`

const ContentWrapper = styled(motion.div)`
  overflow: hidden;
`

const Content = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
`

export default CategorySection
