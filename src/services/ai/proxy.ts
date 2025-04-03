/**
 * API call handling for AI services
 */

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
  timeout?: number;
};

/**
 * Create a fetch function with timeout capability
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
 * Create a fetch function that uses our Vite proxy to avoid CORS issues
 */
export const createProxyFetch = (baseUrl: string, apiKey: string, useMock = false) => {
  // Determine which proxy endpoint to use based on the baseUrl
  const isAnthropicApi = baseUrl.includes('anthropic.com');
  const isOpenAIApi = baseUrl.includes('openai.com');
  
  // Get the proxy prefix
  let proxyPrefix = '';
  if (isAnthropicApi) {
    proxyPrefix = '/api/anthropic';
    console.log('Using Anthropic proxy endpoint');
  } else if (isOpenAIApi) {
    proxyPrefix = '/api/openai';
    console.log('Using OpenAI proxy endpoint');
  } else {
    console.warn(`No proxy defined for ${baseUrl}, may encounter CORS issues`);
  }
  
  // Return a fetch implementation that uses the appropriate proxy
  return async (url: string, options: FetchOptions = {}) => {
    // Only proxy external URLs
    if (url.startsWith('http')) {
      // Extract the path from the full URL
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;
      
      // Construct the proxied URL
      const proxiedUrl = proxyPrefix + path;
      console.log(`Proxying request to: ${proxiedUrl}`);
      
      // Make sure to include the API key in the appropriate header
      const headers: Record<string, string> = { ...(options.headers || {}) };
      
      if (isAnthropicApi) {
        // For Anthropic, the server will add the API key from environment
        // We still need to include the anthropic-version header
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
        delete headers['x-api-key']; // Remove it from client-side
      } else if (isOpenAIApi) {
        // For OpenAI, we need to include the API key in Authorization header
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Return the proxied request
      return await fetchWithTimeout(proxiedUrl, {
        ...options,
        headers
      });
    }
    
    // For non-http URLs (already local), pass through
    return await fetchWithTimeout(url, options);
  };
};
