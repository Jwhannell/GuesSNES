import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/GuesSNES/',
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  test: {
    globals: true
  }
});
