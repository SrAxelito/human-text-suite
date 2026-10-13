import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@domain': path.resolve(__dirname, './src/core/domain'),
      '@services': path.resolve(__dirname, './src/core/services'),
      '@infra': path.resolve(__dirname, './src/core/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/core/**/*.ts'],
      exclude: ['src/core/domain/interfaces/**', '**/*.d.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      }
    }
  }
});
