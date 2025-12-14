import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env vars from .env files
  const env = loadEnv(mode, '.', '');

  // Also load from process.env (Vercel provides them here)
  const processEnv = process.env;

  return {
    server: {
      port: 5173,
      strictPort: true,
      host: '0.0.0.0',
      hmr: {
        clientPort: 5173,
      },
      proxy: {
        '/api/replicate': {
          target: 'https://api.replicate.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
          headers: {
            'Content-Type': 'application/json',
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Get the token from custom header
              const token = req.headers['x-replicate-token'];

              console.log('[Vite Proxy] Request to:', req.url);
              console.log('[Vite Proxy] Token present:', !!token);

              if (token) {
                // Remove custom header and add proper Authorization
                proxyReq.removeHeader('x-replicate-token');
                proxyReq.setHeader('Authorization', `Token ${token}`);
                console.log('[Vite Proxy] Authorization header set');
              } else {
                console.warn('[Vite Proxy] No token found in request');
              }

              // Ensure Content-Type is set
              if (!proxyReq.getHeader('Content-Type')) {
                proxyReq.setHeader('Content-Type', 'application/json');
              }
            });
          },
        },
      },
    },
    plugins: [react()],
    define: {
      // Expose all VITE_* environment variables from both .env files and process.env (Vercel)
      // Note: Vite automatically exposes VITE_* variables.
      // Removing manual defines for keys to let Vite handle it automatically.

    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split large vendor libraries into separate chunks
            if (id.includes('node_modules')) {
              // React libraries in one chunk
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Supabase in separate chunk
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              // Google AI in separate chunk
              if (id.includes('@google/genai')) {
                return 'google-vendor';
              }
              // All other node_modules into vendor chunk
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB for main chunk
      sourcemap: false, // Disable sourcemaps for smaller builds
      minify: 'esbuild', // Use esbuild for faster minification
      target: 'esnext',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/setupTests.ts',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
          'dist/',
          '.github/',
        ],
        statements: 70,
        branches: 65,
        functions: 65,
        lines: 70,
      },
    },
  };
});
