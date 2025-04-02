import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'
import { useConversationStore } from './store/conversationStore'

// Initialize AI services on startup
const initializeAI = () => {
  // Get the initialization function from the store
  const initializeAIServices = useConversationStore.getState().initializeAIServices
  
  // Initialize AI services
  initializeAIServices()
}

// Call initialization
initializeAI()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
