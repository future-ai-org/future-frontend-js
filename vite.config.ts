import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('ethers') || id.includes('viem') || id.includes('wagmi')) {
              return 'web3-vendor';
            }
            if (id.includes('styled-components')) {
              return 'ui-vendor';
            }
            if (id.includes('luxon') || id.includes('i18next')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
        }
      },
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (
          warning.code === 'SOURCEMAP_ERROR' ||
          warning.message.includes('superstruct') ||
          warning.message.includes('Circular dependency') ||
          warning.message.includes('/*#__PURE__*/')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
}); 
