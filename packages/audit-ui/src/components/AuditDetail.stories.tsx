import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@bsvibe/ui';
import { AuditDetail } from './AuditDetail.js';
import type { AuditEvent } from '../types.js';

const ROLE_CHANGE_EVENT: AuditEvent = {
  id: 'evt_role_01',
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
  id: 'evt_svc_01',
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
};

const SYSTEM_EVENT: AuditEvent = {
  id: 'evt_sys_01',
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
  trace_id: 'trace_plan_99',
};

const NESTED_EVENT: AuditEvent = {
  id: 'evt_nested_01',
  event_type: 'nexus.deliverable.bulk_update',
  occurred_at: '2026-04-24T14:50:00.000Z',
  ingested_at: '2026-04-24T14:50:01.024Z',
  tenant_id: 'tnt_acme',
  actor: {
    type: 'user',
    id: 'usr_admin1',
    email: 'admin@acme.dev',
  },
  event_data: {
    project_id: 'prj_atlas',
    changes: [
      { id: 'dlv_001', field: 'status', before: 'draft', after: 'review' },
      { id: 'dlv_002', field: 'owner', before: 'usr_a', after: 'usr_b' },
      { id: 'dlv_003', field: 'priority', before: 'low', after: 'high' },
    ],
    metadata: {
      reason: 'sprint_kickoff',
      bulk_id: 'bulk_2026_04_24_01',
      tags: ['sprint-12', 'kickoff'],
    },
  },
  trace_id: 'trace_bulk_42',
};

interface DemoProps {
  event: AuditEvent | null;
  buttonLabel?: string;
}

function Demo({ event, buttonLabel = 'Open detail' }: DemoProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <AuditDetail event={open ? event : null} onClose={() => setOpen(false)} />
    </>
  );
}

const meta: Meta<typeof AuditDetail> = {
  title: 'Audit/AuditDetail',
  component: AuditDetail,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuditDetail>;

export const NullEvent: Story = {
  render: () => (
    <div style={{ color: 'var(--text-secondary)' }}>
      <p>
        When <code>event</code> is <code>null</code> the component renders nothing —
        callers can leave it mounted with state. Nothing should appear below this line:
      </p>
      <hr style={{ borderColor: 'var(--border-default)', margin: '12px 0' }} />
      <AuditDetail event={null} onClose={() => {}} />
    </div>
  ),
};

export const UserActorRoleChange: Story = {
  render: () => <Demo event={ROLE_CHANGE_EVENT} buttonLabel="Open role change" />,
};

export const ServiceActor: Story = {
  render: () => <Demo event={SERVICE_EVENT} buttonLabel="Open service event" />,
};

export const SystemActorWithTrace: Story = {
  render: () => <Demo event={SYSTEM_EVENT} buttonLabel="Open plan upgrade" />,
};

export const NestedEventData: Story = {
  render: () => <Demo event={NESTED_EVENT} buttonLabel="Open bulk update" />,
};
