import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/just-goofin/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  test: {
    globals: true
  }
});
