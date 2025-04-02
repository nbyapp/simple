/**
 * Simple proxy implementation for making API calls to AI services
 * 
 * This helps avoid CORS issues when calling external APIs directly from the browser
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
 * For development purposes, we'll use a proxy approach to avoid CORS issues
 * In production, this should be replaced with proper backend API endpoints
 */
export const createProxyFetch = (baseUrl: string, apiKey: string) => {
  // For OpenAI
  if (baseUrl.includes('openai.com')) {
    return async (url: string, options: FetchOptions = {}) => {
      const proxyUrl = 'https://api.openai.com' + url.replace('https://api.openai.com', '');
      
      return fetchWithTimeout(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    };
  }
  
  // For Anthropic - we need to use a CORS proxy for development
  // In production, this should be handled by a proper backend
  if (baseUrl.includes('anthropic.com')) {
    // Using a public CORS proxy for demo purposes only
    // In a real application, use your own backend proxy
    return async (url: string, options: FetchOptions = {}) => {
      // Use a proxy URL for development
      // In a real app, this should be a proper backend endpoint
      const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';
      const proxyUrl = corsAnywhere + url;
      
      return fetchWithTimeout(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'x-anthropic-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      });
    };
  }
  
  // Default fallback
  return fetchWithTimeout;
};
