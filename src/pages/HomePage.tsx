import { Link } from 'react-router-dom'
import styled from 'styled-components'

const HomePage = () => {
  return (
    <HomeContainer>
      <Header>
        <Title>Simple</Title>
        <Subtitle>Build apps through conversation</Subtitle>
      </Header>
      <MainContent>
        <Description>
          Create your app by chatting with our AI assistant. Watch your ideas
          transform into visual mockups in real-time as you describe them.
        </Description>
        <StartButton to="/conversation">
          Start a new conversation
        </StartButton>
      </MainContent>
    </HomeContainer>
  )
}

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`

const Header = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  line-height: ${({ theme }) => theme.typography.body.regular.lineHeight};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
`

const StartButton = styled(Link)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: background-color ${({ theme }) => theme.transitions.quick};
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
    text-decoration: none;
  }
`

export default HomePage
