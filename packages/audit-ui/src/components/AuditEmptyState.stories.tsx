import type { Meta, StoryObj } from '@storybook/react';
import { AuditEmptyState } from './AuditEmptyState.js';

const meta: Meta<typeof AuditEmptyState> = {
  title: 'Audit/AuditEmptyState',
  component: AuditEmptyState,
  tags: ['autodocs'],
  argTypes: {
    reason: {
      control: { type: 'inline-radio' },
      options: ['no-results', 'plan', 'permission'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AuditEmptyState>;

export const NoResults: Story = {
  args: {
    reason: 'no-results',
  },
};

export const PlanGated: Story = {
  args: {
    reason: 'plan',
  },
};

export const PermissionDenied: Story = {
  args: {
    reason: 'permission',
  },
};

export const CustomCopy: Story = {
  args: {
    reason: 'no-results',
    title: 'No matches in the last 24 hours',
    description: 'Widen the time range or clear the actor filter to see more events.',
  },
};

export const PlanCustomDescription: Story = {
  args: {
    reason: 'plan',
    description:
      'This workspace is on the Team plan. Audit logs are available on Enterprise — talk to billing to upgrade.',
  },
};
