# Simple

A conversational app creation platform with real-time visual feedback.

## Overview

Simple helps you build apps through natural conversation, instantly visualizing your ideas as you describe them. This platform combines an intuitive chat interface with real-time mockup generation to streamline the app creation process.

## Features

- Conversational UI for app ideation and design
- Real-time visual feedback and mockup generation
- Decision tracking and summary panel
- Guided conversation flows for app requirements gathering
- Integration with multiple AI providers (OpenAI and Anthropic)
- Support for model selection with various capabilities and costs

## Technology Stack

- React with TypeScript
- Vite for fast development and building
- Styled Components for styling
- Zustand for state management
- Framer Motion for animations
- OpenAI and Anthropic APIs for AI capabilities

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/nbyapp/simple.git
cd simple
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

### Development Mode

In development mode, the application automatically uses mock implementations for API calls to avoid CORS issues. This allows you to develop and test the UI without needing actual API keys or dealing with cross-origin restrictions.

> **Note**: For production deployment, you would need to create a backend proxy for the API calls or use a service like Netlify Functions, AWS Lambda, or similar serverless solutions to handle the API calls securely.

## Project Structure

```
src/
  ├── components/          # Reusable UI components
  │   ├── conversation/    # Conversation interface components
  │   ├── settings/        # Settings components
  │   └── summary/         # Summary panel components
  ├── config/              # Configuration files
  ├── pages/               # Application pages
  ├── services/            # Service layer
  │   └── ai/              # AI service integration
  ├── store/               # State management
  └── styles/              # Global styles and theme
```

## AI Service Integration

The platform supports multiple AI providers through a flexible adapter pattern:

- **OpenAI API**: Used for generating conversational responses, extracting decisions, and providing suggestions
  - Supported models: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Anthropic API**: Alternative provider with Claude models for enhanced creativity and safety
  - Supported models: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

You can switch between providers and models at runtime using the selector in the application header.

### Mock Mode

To simplify development and avoid CORS issues that arise from making direct API calls to third-party services from the browser, the application uses a mock implementation for API calls in development mode. This means:

1. All API calls to OpenAI and Anthropic are intercepted and replaced with mock responses
2. The responses simulate the behavior of real APIs, including streaming
3. Both services are always available in the UI for testing, regardless of API keys

For production deployment, you would need to implement a proper backend proxy or use serverless functions to handle the API calls securely.

### Adding a New AI Provider

To add a new AI provider:

1. Create a new adapter class that extends `BaseAIService`
2. Implement the required methods for your provider
3. Create a factory class that implements `AIServiceFactory`
4. Register the factory in the `AIServiceProvider`

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build
- `npm run storybook` - Start Storybook for component development
- `npm run build-storybook` - Build Storybook for deployment

## Implementation Phases

### Phase 1: Foundation and Core Conversation Engine

- Basic chat UI with message bubbles, typing indicators
- Input area with suggestions
- Split-screen layout with summary panel
- Basic state management for conversation flow
- Decision tracking and categorization

### Phase 2: AI Integration and Enhanced Capabilities

- Flexible AI service integration with multiple providers
- Support for multiple models with different capabilities
- Mock mode for development without API keys
- Context-aware conversations with the ability to extract decisions
- Real-time streaming of AI responses
- Dynamic suggestion generation
