import React from 'react';
import styled from 'styled-components';
import { useConversationStore } from '../../store/conversationStore';

interface ModelSelectorProps {
  serviceId: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ serviceId }) => {
  const { 
    aiModels, 
    getSelectedModel, 
    setModel 
  } = useConversationStore();
  
  const selectedModel = getSelectedModel(serviceId);
  const models = aiModels[serviceId] || [];
  
  // If no models are available, show nothing
  if (models.length === 0) {
    return null;
  }
  
  // Handle model change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    setModel(serviceId, newModelId);
  };
  
  return (
    <Container>
      <Select value={selectedModel} onChange={handleModelChange}>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </Select>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs};
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

export default ModelSelector;
