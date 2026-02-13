import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/GuesSNES/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  test: {
    globals: true
  }
});
