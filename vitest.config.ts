import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@utils-core': path.resolve(__dirname, 'src/utils/index.ts'),
      '@middleware-core': path.resolve(__dirname, 'src/middlewares/index.ts'),
      '@schema-models': path.resolve(__dirname, 'src/schema/index.ts'),
      middlewares: path.resolve(__dirname, 'src/middlewares'),
      modules: path.resolve(__dirname, 'src/modules'),
    },
  },
});
