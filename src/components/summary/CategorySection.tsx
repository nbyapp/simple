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
        <ExpandIcon isExpanded={expanded} />
      </Header>
      
      <AnimatePresence>
        {expanded && (
          <Content
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </Content>
        )}
      </AnimatePresence>
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  user-select: none;
  background-color: ${({ theme }) => `${theme.colors.primary}11`};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary}22`};
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
`

const Title = styled.h3`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`

interface ExpandIconProps {
  isExpanded: boolean
}

const ExpandIcon = styled.div<ExpandIconProps>`
  width: 18px;
  height: 18px;
  position: relative;
  transition: transform ${({ theme }) => theme.transitions.quick};
  transform: rotate(${({ isExpanded }) => (isExpanded ? '180deg' : '0deg')});
  
  &:before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${({ theme }) => theme.colors.text.secondary};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -25%);
  }
`

const Content = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: white;
  overflow: hidden;
`

export default CategorySection
