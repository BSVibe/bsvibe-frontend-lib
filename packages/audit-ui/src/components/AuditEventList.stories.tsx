import type { Meta, StoryObj } from '@storybook/react';
import { AuditEventList } from './AuditEventList.js';
import type { AuditEvent } from '../types.js';

const SAMPLE_EVENTS: AuditEvent[] = [
  {
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
  },
  {
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
  },
  {
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
    },
  },
  {
    id: 'evt_04',
    event_type: 'auth.session.created',
    occurred_at: '2026-04-25T08:00:00.000Z',
    ingested_at: '2026-04-25T08:00:00.500Z',
    tenant_id: 'tnt_acme',
    actor: {
      type: 'user',
      id: 'usr_jane2',
      email: 'jane@acme.dev',
    },
    event_data: {
      ip: '203.0.113.4',
      user_agent: 'Mozilla/5.0',
    },
  },
];

const meta: Meta<typeof AuditEventList> = {
  title: 'Audit/AuditEventList',
  component: AuditEventList,
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean' },
    onLoadMore: { action: 'load-more' },
    onSelectEvent: { action: 'select-event' },
  },
};

export default meta;
type Story = StoryObj<typeof AuditEventList>;

export const Loading: Story = {
  args: {
    events: [],
    isLoading: true,
    error: null,
    nextCursor: null,
    onLoadMore: () => {},
  },
};

export const Error: Story = {
  args: {
    events: [],
    isLoading: false,
    error: new Error('Failed to load audit events: 500 Internal Server Error'),
    nextCursor: null,
    onLoadMore: () => {},
  },
};

export const EmptyNoResults: Story = {
  args: {
    events: [],
    isLoading: false,
    error: null,
    nextCursor: null,
    onLoadMore: () => {},
  },
};

export const Populated: Story = {
  args: {
    events: SAMPLE_EVENTS,
    isLoading: false,
    error: null,
    nextCursor: null,
    onLoadMore: () => {},
  },
};

export const PopulatedClickable: Story = {
  args: {
    events: SAMPLE_EVENTS,
    isLoading: false,
    error: null,
    nextCursor: null,
    onLoadMore: () => {},
    onSelectEvent: (event: AuditEvent) => {
      // eslint-disable-next-line no-alert
      alert(`Selected ${event.event_type}`);
    },
  },
};

export const WithLoadMore: Story = {
  args: {
    events: SAMPLE_EVENTS,
    isLoading: false,
    error: null,
    nextCursor: '2026-04-25T08:00:00.000Z',
    onLoadMore: () => {},
  },
};

export const LoadMoreInFlight: Story = {
  args: {
    events: SAMPLE_EVENTS,
    isLoading: true,
    error: null,
    nextCursor: '2026-04-25T08:00:00.000Z',
    onLoadMore: () => {},
  },
};
