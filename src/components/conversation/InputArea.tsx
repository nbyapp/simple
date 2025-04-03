import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

interface InputAreaProps {
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
}

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isProcessing = false,
  suggestions = [],
  onSuggestionClick,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Auto resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`
    }
  }, [inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim())
      setInputValue('')

      // Reset height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Container>
      <InputContainer isFocused={isFocused}>
        <StyledForm onSubmit={handleSubmit}>
          <StyledTextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isProcessing}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
          />
          <SendButtonContainer>
            <AnimatePresence>
              {inputValue.trim() && (
                <SendButton
                  type="submit"
                  disabled={isProcessing}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isProcessing ? (
                    <LoadingIndicator />
                  ) : (
                    <SendIcon />
                  )}
                </SendButton>
              )}
            </AnimatePresence>
          </SendButtonContainer>
        </StyledForm>
      </InputContainer>
      
      {isProcessing && (
        <ProcessingIndicator>
          AI is thinking<Dot>.</Dot><Dot>.</Dot><Dot>.</Dot>
        </ProcessingIndicator>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;
`

const ProcessingIndicator = styled.div`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.onPrimary};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.body.tiny.fontSize};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
`

const Dot = styled.span`
  animation: pulse 1.5s infinite;
  animation-delay: ${(props) => props.children === '.' ? '0s' : props.children === '..' ? '0.5s' : '1s'};
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
`

interface InputContainerProps {
  isFocused: boolean
}

const InputContainer = styled.div<InputContainerProps>`
  display: flex;
  border: 1px solid ${({ theme, isFocused }) => 
    isFocused 
      ? theme.colors.primary
      : theme.colors.divider
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.quick};
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme, isFocused }) => 
    isFocused 
      ? theme.shadows.focus
      : 'none'
  };
`

const StyledForm = styled.form`
  display: flex;
  flex: 1;
  align-items: flex-end;
`

const StyledTextArea = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  outline: none;
  resize: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  max-height: 200px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`

const SendButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
  padding-right: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`

const SendButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.circular};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    cursor: not-allowed;
  }
`

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

const LoadingIndicator = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

export default InputArea
