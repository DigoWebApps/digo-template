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
    port: 8008,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
