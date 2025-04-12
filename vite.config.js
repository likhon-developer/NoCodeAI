import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add JSX runtime for improved performance
      jsxRuntime: 'automatic',
      // Enable Fast Refresh
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@db': path.resolve(__dirname, './src/database'),
      '@api': path.resolve(__dirname, './src/api'),
      '@features': path.resolve(__dirname, './src/features'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  server: {
    port: 3000,
    open: true,
    // Proxy API requests to prevent CORS issues in development
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1600,
    // Optimize production build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'rxjs', 
            'rxdb', 
            'pouchdb',
            'framer-motion'
          ],
          editor: [
            '@mdxeditor/editor', 
            '@monaco-editor/react', 
            'monaco-editor'
          ],
          ai: [
            'brain.js',
            'googleapis'
          ]
        }
      }
    }
  },
  // Configure environment variables
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'process.env.VITE_APP_NAME': JSON.stringify(process.env.npm_package_name)
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  },
  // Add support for different environments
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
});
