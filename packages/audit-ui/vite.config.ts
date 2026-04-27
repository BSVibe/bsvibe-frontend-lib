import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config for Storybook (`@storybook/react-vite`).
// Vitest has its own config (`vitest.config.ts`) — kept separate to avoid
// pulling Tailwind into the unit-test pipeline.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
