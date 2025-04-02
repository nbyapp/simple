/**
 * Simple proxy implementation for making API calls to AI services
 * 
 * This avoids CORS issues by using a mock implementation for development
 */

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
  timeout?: number;
};

/**
 * Create a proxy fetch function with timeout capability
 */
export const fetchWithTimeout = async (url: string, options: FetchOptions = {}) => {
  const { timeout = 60000, ...fetchOptions } = options;
  
  // Use AbortController for timeout management
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Mock response generator - for development when API keys are not available
 */
const createMockResponse = (endpoint: string, body: any) => {
  // For OpenAI chat completions
  if (endpoint.includes('/chat/completions')) {
    const requestBody = typeof body === 'string' ? JSON.parse(body) : body;
    const isStream = requestBody.stream;
    
    if (isStream) {
      // Create a mock stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Mock response chunks
          const messages = [
            "I'm happy to help you create your app! ",
            "Could you tell me more about what kind of app you're looking to build? ",
            "What problem is it trying to solve?"
          ];
          
          // Send each chunk with a small delay
          const sendChunks = async () => {
            for (let i = 0; i < messages.length; i++) {
              const chunk = {
                choices: [{
                  delta: { content: messages[i] },
                  finish_reason: i === messages.length - 1 ? 'stop' : null
                }]
              };
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(data));
              
              // Add a small delay between chunks
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          };
          
          sendChunks();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Create a mock completion response
      return new Response(JSON.stringify({
        id: 'mock-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: requestBody.model,
        choices: [{
          message: {
            role: 'assistant',
            content: "I'm happy to help you create your app! Could you tell me more about what kind of app you're looking to build? What problem is it trying to solve?"
          },
          finish_reason: 'stop',
          index: 0
        }]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For Anthropic messages
  if (endpoint.includes('/messages')) {
    const requestBody = typeof body === 'string' ? JSON.parse(body) : body;
    const isStream = requestBody.stream;
    
    if (isStream) {
      // Create a mock stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Mock response chunks with Anthropic's format
          const messages = [
            "I'm happy to help you create your app! ",
            "Could you tell me more about what kind of app you're looking to build? ",
            "What problem is it trying to solve?"
          ];
          
          // Send event for message start
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'message_start',
            message: { id: 'mock-message-id', model: requestBody.model }
          }) + '\n'));
          
          // Send content blocks
          const sendChunks = async () => {
            for (let i = 0; i < messages.length; i++) {
              const chunk = {
                type: 'content_block_delta',
                delta: { text: messages[i] },
                index: 0
              };
              controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
              
              // Add a small delay between chunks
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Send message stop event
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'message_stop',
              stop_reason: 'end_turn'
            }) + '\n'));
            
            controller.close();
          };
          
          sendChunks();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Create a mock non-streaming response
      return new Response(JSON.stringify({
        id: 'mock-message-id',
        model: requestBody.model,
        content: [{ text: "I'm happy to help you create your app! Could you tell me more about what kind of app you're looking to build? What problem is it trying to solve?", type: 'text' }],
        role: 'assistant',
        stop_reason: 'end_turn'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Default fallback for other endpoints
  return new Response(JSON.stringify({ error: 'Not implemented in mock mode' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Create a fetch proxy that can use mocks when needed
 */
export const createProxyFetch = (baseUrl: string, apiKey: string, useMock = false) => {
  // Return mock implementation if requested or if API key is not available
  if (useMock || !apiKey) {
    console.log(`Using mock mode for ${baseUrl}`);
    
    return async (url: string, options: FetchOptions = {}) => {
      console.log(`Mock request to: ${url}`);
      
      // Extract the endpoint path
      const endpoint = url.replace(baseUrl, '');
      
      // Create a mock response based on the endpoint and request body
      return createMockResponse(endpoint, options.body);
    };
  }
  
  // For real API calls
  if (baseUrl.includes('openai.com')) {
    return async (url: string, options: FetchOptions = {}) => {
      return fetchWithTimeout(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    };
  }
  
  if (baseUrl.includes('anthropic.com')) {
    return async (url: string, options: FetchOptions = {}) => {
      return fetchWithTimeout(url, {
        ...options,
        headers: {
          ...options.headers,
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      });
    };
  }
  
  // Default fallback
  return fetchWithTimeout;
};
