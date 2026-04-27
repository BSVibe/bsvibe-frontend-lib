import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'bsvibe-dark',
      values: [
        { name: 'bsvibe-dark', value: '#0a0b0f' },
        { name: 'bsvibe-surface', value: '#111218' },
      ],
    },
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
