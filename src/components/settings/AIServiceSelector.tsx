import React from 'react';
import styled from 'styled-components';
import { aiServiceProvider } from '../../services/ai';
import { useConversationStore } from '../../store/conversationStore';

/**
 * Component for selecting the active AI service
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
          No AI services configured. Please add API keys in environment variables.
        </NoServicesMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Label>AI Service:</Label>
      <Select value={aiServiceId} onChange={handleServiceChange}>
        {availableServices.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </Select>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  padding: ${({ theme }) => theme.spacing.sm};
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
`;

const NoServicesMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.status.warning};
`;

export default AIServiceSelector;
