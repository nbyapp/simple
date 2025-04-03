import React from 'react';
import styled from 'styled-components';
import { aiServiceProvider } from '../../services/ai';
import { useConversationStore } from '../../store/conversationStore';
import ModelSelector from './ModelSelector';

/**
 * Component for selecting the active AI service and model
 */
const AIServiceSelector: React.FC = () => {
  const { aiServiceId, setAIService } = useConversationStore();
  
  // Get available AI services
  const availableServices = aiServiceProvider.getAllServices();
  
  // Handle service change
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newServiceId = e.target.value;
    setAIService(newServiceId);
  };
  
  // If no services are available, show a message
  if (availableServices.length === 0) {
    return (
      <Container>
        <NoServicesMessage>
          API key missing. See .env.example.
        </NoServicesMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <SelectorGroup>
        <Label>AI:</Label>
        <Select 
          value={aiServiceId || ''} 
          onChange={handleServiceChange}
          disabled={availableServices.length <= 1}
        >
          {availableServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
        {aiServiceId && <ModelSelector serviceId={aiServiceId} />}
      </SelectorGroup>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const SelectorGroup = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Select = styled.select`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => `${theme.colors.text.tertiary}66`};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  background-color: white;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const NoServicesMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.status.warning};
  background-color: ${({ theme }) => `${theme.colors.status.warning}11`};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export default AIServiceSelector;
