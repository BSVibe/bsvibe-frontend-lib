import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AuditFilters } from './AuditFilters.js';
import { EMPTY_FILTER, type AuditFilterState } from '../types.js';

const meta: Meta<typeof AuditFilters> = {
  title: 'Audit/AuditFilters',
  component: AuditFilters,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AuditFilters>;

interface DemoProps {
  initial: AuditFilterState;
  disabled?: boolean;
}

function Demo({ initial, disabled }: DemoProps) {
  const [value, setValue] = useState<AuditFilterState>(initial);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <AuditFilters value={value} onChange={setValue} disabled={disabled} />
      <pre
        style={{
          background: '#0a0b0f',
          color: '#9ca3af',
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export const Empty: Story = {
  render: () => <Demo initial={EMPTY_FILTER} />,
};

export const PopulatedActor: Story = {
  render: () => (
    <Demo
      initial={{
        ...EMPTY_FILTER,
        actor_id: 'user:usr_admin1',
      }}
    />
  ),
};

export const PopulatedDateRange: Story = {
  render: () => (
    <Demo
      initial={{
        ...EMPTY_FILTER,
        since: '2026-04-01',
        until: '2026-04-26',
      }}
    />
  ),
};

export const PopulatedEventTypes: Story = {
  render: () => (
    <Demo
      initial={{
        ...EMPTY_FILTER,
        event_types: ['auth.member.role_changed', 'nexus.project.created'],
      }}
    />
  ),
};

export const FullyPopulated: Story = {
  render: () => (
    <Demo
      initial={{
        actor_id: 'user:usr_admin1',
        since: '2026-04-01',
        until: '2026-04-26',
        event_types: ['auth.member.role_changed', 'nexus.project.created'],
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo
      initial={{
        actor_id: 'user:usr_admin1',
        since: '2026-04-01',
        until: '2026-04-26',
        event_types: ['auth.member.role_changed'],
      }}
      disabled
    />
  ),
};
