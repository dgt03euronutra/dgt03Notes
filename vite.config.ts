import { defineConfig } from 'vite';

export default defineConfig({
  base: '/dgt03Notes/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
