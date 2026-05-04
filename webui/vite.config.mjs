import { defineConfig } from 'vite';

export default defineConfig({
  base: '/static/',
  publicDir: 'src',
  build: {
    outDir: 'static',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8080'
    }
  }
});
