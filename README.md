# Simple

A conversational app creation platform with real-time visual feedback.

## Overview

Simple helps you build apps through natural conversation, instantly visualizing your ideas as you describe them. This platform combines an intuitive chat interface with real-time mockup generation to streamline the app creation process.

## Features

- Conversational UI for app ideation and design
- Real-time visual feedback and mockup generation
- Decision tracking and summary panel
- Guided conversation flows for app requirements gathering

## Technology Stack

- React with TypeScript
- Vite for fast development and building
- Styled Components for styling
- Zustand for state management
- Framer Motion for animations

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

## Project Structure

```
src/
  ├── components/          # Reusable UI components
  │   ├── conversation/    # Conversation interface components
  │   └── summary/         # Summary panel components
  ├── pages/               # Application pages
  ├── store/               # State management
  └── styles/              # Global styles and theme
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build
- `npm run storybook` - Start Storybook for component development
- `npm run build-storybook` - Build Storybook for deployment

## Phase 1 Implementation

This repository contains the implementation of Phase 1 of the Simple platform, focusing on:

1. **Conversation Interface Design**
   - Basic chat UI with message bubbles, typing indicators
   - Input area with suggestions
   - Split-screen layout with summary panel

2. **Conversation Understanding Engine**
   - Basic state management for conversation flow
   - Mock responses for demonstration purposes
   - Decision tracking and categorization

3. **Visual Representation Engine**
   - Summary panel with categorized decisions
   - Visual highlighting of related messages
   - Expandable/collapsible sections for organization
