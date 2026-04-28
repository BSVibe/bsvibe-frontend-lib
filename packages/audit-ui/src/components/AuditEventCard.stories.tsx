import type { Meta, StoryObj } from '@storybook/react';
import { AuditEventCard } from './AuditEventCard.js';
import type { AuditEvent } from '../types.js';

const USER_EVENT: AuditEvent = {
  id: 'evt_01',
  event_type: 'auth.member.role_changed',
  occurred_at: '2026-04-26T09:14:22.000Z',
  ingested_at: '2026-04-26T09:14:23.111Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'user',
    id: 'usr_admin1',
    email: 'admin@acme.dev',
  },
  event_data: {
    target_member_id: 'usr_jane2',
    before: { role: 'member' },
    after: { role: 'admin' },
  },
  trace_id: 'trace_8a7b6c',
};

const SERVICE_EVENT: AuditEvent = {
  id: 'evt_02',
  event_type: 'nexus.project.created',
  occurred_at: '2026-04-26T10:02:11.000Z',
  ingested_at: '2026-04-26T10:02:11.402Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'service',
    id: 'svc_provisioner',
  },
  event_data: {
    project_id: 'prj_atlas',
    name: 'Project Atlas',
    template: 'blank',
  },
  trace_id: null,
};

const SYSTEM_EVENT: AuditEvent = {
  id: 'evt_03',
  event_type: 'system.tenant.plan_upgraded',
  occurred_at: '2026-04-25T18:31:00.000Z',
  ingested_at: '2026-04-25T18:31:00.812Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'system',
    id: 'system',
  },
  event_data: {
    before: { plan: 'team' },
    after: { plan: 'enterprise' },
    reason: 'manual_upgrade',
  },
};

const MINIMAL_EVENT: AuditEvent = {
  id: 'evt_04',
  event_type: 'auth.session.created',
  occurred_at: '2026-04-26T11:00:00.000Z',
  ingested_at: '2026-04-26T11:00:00.500Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'user',
    id: 'usr_minimal',
  },
  event_data: {},
};

const LARGE_EVENT: AuditEvent = {
  id: 'evt_05',
  event_type: 'nexus.project.bulk_import',
  occurred_at: '2026-04-24T14:50:00.000Z',
  ingested_at: '2026-04-24T14:50:01.024Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'user',
    id: 'usr_admin1',
    email: 'admin@acme.dev',
  },
  event_data: {
    items: Array.from({ length: 30 }, (_, i) => ({
      id: `item_${i.toString().padStart(3, '0')}`,
      name: `Imported deliverable ${i + 1}`,
      status: i % 3 === 0 ? 'queued' : 'ready',
      tags: ['phase-a', 'imported', `batch-${Math.floor(i / 5)}`],
    })),
    summary: {
      total: 30,
      queued: 10,
      ready: 20,
    },
  },
  trace_id: 'trace_9c0d1e',
};

const meta: Meta<typeof AuditEventCard> = {
  title: 'Audit/AuditEventCard',
  component: AuditEventCard,
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
};

export default meta;
type Story = StoryObj<typeof AuditEventCard>;

export const NonClickableUser: Story = {
  args: {
    event: USER_EVENT,
  },
};

export const ClickableUser: Story = {
  args: {
    event: USER_EVENT,
    onSelect: (event: AuditEvent) => {
      // eslint-disable-next-line no-alert
      alert(`Selected ${event.event_type}`);
    },
  },
};

export const ServiceActor: Story = {
  args: {
    event: SERVICE_EVENT,
    onSelect: () => {},
  },
};

export const SystemActor: Story = {
  args: {
    event: SYSTEM_EVENT,
  },
};

export const MinimalPayload: Story = {
  args: {
    event: MINIMAL_EVENT,
    onSelect: () => {},
  },
};

export const LargePayloadTruncated: Story = {
  args: {
    event: LARGE_EVENT,
  },
};
