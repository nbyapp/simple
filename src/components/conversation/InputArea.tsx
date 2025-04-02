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
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
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
      {suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion) => (
            <SuggestionChip
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              {suggestion}
            </SuggestionChip>
          ))}
        </SuggestionsContainer>
      )}

      <InputContainer isFocused={isFocused}>
        <StyledForm onSubmit={handleSubmit}>
          <StyledTextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app idea..."
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
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}33`};
`

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SuggestionChip = styled.button`
  background-color: ${({ theme }) => `${theme.colors.primary}11`};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  transition: all ${({ theme }) => theme.transitions.quick};
  white-space: nowrap;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}22`};
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
      : `${theme.colors.text.tertiary}66`
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: border-color ${({ theme }) => theme.transitions.quick};
  background-color: ${({ theme }) => theme.colors.background};
`

const StyledForm = styled.form`
  display: flex;
  flex: 1;
`

const StyledTextArea = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  outline: none;
  resize: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  max-height: 150px;
  background-color: transparent;
  
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
  padding: ${({ theme }) => theme.spacing.sm};
`

const SendButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  
  &:disabled {
    background-color: ${({ theme }) => `${theme.colors.primary}88`};
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
  width: 18px;
  height: 18px;
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
