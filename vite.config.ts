import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Environment variables in Vite config:');
  console.log('OpenAI API key exists:', !!env.VITE_OPENAI_API_KEY);
  console.log('OpenAI API key length:', env.VITE_OPENAI_API_KEY ? env.VITE_OPENAI_API_KEY.length : 0);
  console.log('OpenAI API key format:', env.VITE_OPENAI_API_KEY ? `starts with ${env.VITE_OPENAI_API_KEY.substring(0, 5)}...` : 'N/A');
  console.log('Anthropic API key exists:', !!env.VITE_ANTHROPIC_API_KEY);
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', function(proxyReq, req, res, options) {
              proxyReq.setHeader('x-api-key', env.VITE_ANTHROPIC_API_KEY)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true')
              console.log('Anthropic request headers set');
            })
          }
        },
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', function(proxyReq, req, res, options) {
              if (env.VITE_OPENAI_API_KEY) {
                console.log('Setting OpenAI Authorization header');
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_OPENAI_API_KEY}`)
              } else {
                console.error('OpenAI API key not found in environment');
              }
            })
          }
        },
      },
    },
  }
})