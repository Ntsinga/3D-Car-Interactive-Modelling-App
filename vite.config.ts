import { defineConfig } from 'vite';

export default defineConfig({
  build: { target: 'es2020', outDir: 'dist', sourcemap: true },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
} as any);
