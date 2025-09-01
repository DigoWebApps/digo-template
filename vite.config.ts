import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import tsconfigPaths    from 'vite-tsconfig-paths';
import tailwindcss      from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['module:@preact/signals-react-transform'],
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    host: 'localhost',
    port: 808,
  },
  resolve: {
    alias: {
      '@':          '/src',
      'app':        '/src/app',
      'components': '/src/components',
      'services':   '/src/services',
      'styles':     '/src/styles',
      'types':      '/src/types',
      'ui-library': '/src/ui-library/index',
      'utils':      '/src/utils',
    },
  },
});
