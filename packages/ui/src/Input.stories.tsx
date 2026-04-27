import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input.js';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Text: Story = {
  args: { label: 'Project name', placeholder: 'Untitled' },
};

export const Email: Story = {
  args: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
};

export const Password: Story = {
  args: { label: 'Password', type: 'password' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Slug',
    placeholder: 'my-project',
    helperText: 'lowercase letters, numbers and hyphens',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'not-an-email',
    error: 'must be a valid email address',
  },
};

export const Disabled: Story = {
  args: { label: 'API key', disabled: true, defaultValue: 'sk-***' },
};

export const NoLabel: Story = {
  args: { placeholder: 'search…' },
};

// Phase B Batch 1 — mobile a11y story.
export const MobileNoZoom: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    helperText: '16px font + 44px height — iOS Safari does not auto-zoom.',
  },
};
