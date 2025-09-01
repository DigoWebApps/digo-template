import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import tsconfigPaths    from 'vite-tsconfig-paths';
import tailwindcss      from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    host:         '0.0.0.0',
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
