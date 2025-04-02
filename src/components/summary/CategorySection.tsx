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
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <Title>{title}</Title>
        <ExpandIcon expanded={expanded} />
      </Header>
      
      <AnimatePresence>
        {expanded && (
          <Content
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </Content>
        )}
      </AnimatePresence>
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  user-select: none;
  transition: background-color ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.text.tertiary}11`};
  }
`

const IconWrapper = styled.div`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`

const Title = styled.h2`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`

interface ExpandIconProps {
  expanded: boolean
}

const ExpandIcon = styled.div<ExpandIconProps>`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.text.secondary};
    transition: transform ${({ theme }) => theme.transitions.quick};
  }
  
  &::before {
    top: 9px;
    left: 2px;
    width: 16px;
    height: 2px;
  }
  
  &::after {
    top: 2px;
    left: 9px;
    width: 2px;
    height: 16px;
    transform: ${({ expanded }) => expanded ? 'scaleY(0)' : 'scaleY(1)'};
  }
`

const Content = styled(motion.div)`
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`

export default CategorySection
