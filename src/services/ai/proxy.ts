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
 * Create a fetch function for API calls
 * Attempts to make direct API calls - note that this may encounter CORS issues in the browser
 */
export const createProxyFetch = (baseUrl: string, apiKey: string, useMock = false) => {
  console.log(`Creating fetch for ${baseUrl}, direct API call mode`);

  // Return real fetch implementation
  return async (url: string, options: FetchOptions = {}) => {
    console.log(`Making API request to: ${url}`);
    
    try {
      // Try with direct fetch
      return await fetchWithTimeout(url, options);
    } catch (error) {
      console.error(`Error making API request to ${url}:`, error);
      
      // Provide helpful error information
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`
          CORS Error: Browser security prevented direct API call.
          
          To make real API calls, you need to:
          1. Use a backend proxy service
          2. Use a CORS proxy (not recommended for production/API keys)
          3. Create a simple local proxy server
        `);
      }
      
      throw error;
    }
  };
};
