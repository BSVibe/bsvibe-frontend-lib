import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge.js';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
  args: {
    children: 'active',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { variant: 'neutral' } };
export const Info: Story = { args: { variant: 'info', children: 'pending' } };
export const Success: Story = { args: { variant: 'success', children: 'done' } };
export const Warning: Story = { args: { variant: 'warning', children: 'degraded' } };
export const Error: Story = { args: { variant: 'error', children: 'failed' } };

export const WithDot: Story = {
  args: { dot: true, variant: 'success', children: 'live' },
};

export const SmallSize: Story = {
  args: { size: 'sm', children: '3' },
};

export const VariantsRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="neutral">neutral</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="error">error</Badge>
      <Badge variant="success" dot>
        live
      </Badge>
    </div>
  ),
};
