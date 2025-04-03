/**
 * Simple proxy implementation for making API calls to AI services
 * 
 * For development only: Uses mock implementations to avoid CORS issues
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
 * Mock response generator for OpenAI streaming format
 */
const createOpenAIMockStream = () => {
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
};

/**
 * Mock response generator for Anthropic streaming format
 */
const createAnthropicMockStream = () => {
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
      
      // Delay function to simulate network latency
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Send chunks asynchronously
      (async () => {
        // Send event for message start
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'message_start',
          message: { id: 'mock-message-id', model: 'claude-3-opus-20240229' }
        }) + '\n'));
        
        await delay(100);
        
        // Send content blocks with delays
        for (let i = 0; i < messages.length; i++) {
          const chunk = {
            type: 'content_block_delta',
            delta: { text: messages[i] },
            index: 0
          };
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
          
          // Add a small delay between chunks
          await delay(300);
        }
        
        // Send message stop event
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'message_stop',
          stop_reason: 'end_turn'
        }) + '\n'));
        
        controller.close();
      })();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};

/**
 * Mock response generator - for development when API keys are not available
 * or when CORS issues prevent direct API calls
 */
const createMockResponse = (endpoint: string, body: any) => {
  console.log('Using mock response for endpoint:', endpoint);
  
  // Parse request body
  const requestBody = typeof body === 'string' ? JSON.parse(body) : body;
  const isStream = requestBody.stream;
  
  // For OpenAI chat completions
  if (endpoint.includes('/chat/completions')) {
    if (isStream) {
      return createOpenAIMockStream();
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
    if (isStream) {
      return createAnthropicMockStream();
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
 * For development: ALWAYS use mock mode to avoid CORS issues
 * In production, this should be replaced with a proper backend API
 */
export const createProxyFetch = (baseUrl: string, apiKey: string, useMock = true) => {
  console.log(`Creating proxy fetch for ${baseUrl}, mock mode: ${useMock}`);
  
  // FORCE mock mode for development to avoid CORS issues
  return (url: string, options: FetchOptions = {}) => {
    console.log(`Mock request to: ${url}`);
    
    // Extract the endpoint path
    const endpoint = url.replace(baseUrl, '');
    
    // Create a mock response based on the endpoint and request body
    return createMockResponse(endpoint, options.body);
  };
};
