import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo>/. Override with BASE_PATH if the repo is renamed.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/pantry-pal/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
