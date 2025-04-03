import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import AIServiceSelector from '../settings/AIServiceSelector';

interface HeaderProps {
  showAISelector?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showAISelector = false }) => {
  return (
    <HeaderContainer>
      <LogoContainer to="/">
        <LogoText>Simple</LogoText>
      </LogoContainer>
      
      {showAISelector && <AIServiceSelector />}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: opacity ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    opacity: 0.9;
    text-decoration: none;
  }
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export default Header;
