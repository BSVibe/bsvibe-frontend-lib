import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveTable, type ResponsiveTableColumn } from './ResponsiveTable.js';
import { Badge } from './Badge.js';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'draft';
  owner: string;
  updatedAt: string;
}

const ROWS: Project[] = [
  {
    id: 'p1',
    name: 'BSGateway hub',
    status: 'active',
    owner: 'admin@bsvibe.dev',
    updatedAt: '2026-04-26',
  },
  {
    id: 'p2',
    name: 'BSupervisor analytics',
    status: 'active',
    owner: 'data@bsvibe.dev',
    updatedAt: '2026-04-25',
  },
  {
    id: 'p3',
    name: 'Phase A archive',
    status: 'archived',
    owner: 'admin@bsvibe.dev',
    updatedAt: '2026-03-18',
  },
];

const COLS: ResponsiveTableColumn<Project>[] = [
  { key: 'name', header: 'Name', cell: (r) => r.name },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => (
      <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge>
    ),
  },
  { key: 'owner', header: 'Owner', cell: (r) => r.owner },
  { key: 'updated', header: 'Updated', cell: (r) => r.updatedAt },
];

const meta: Meta<typeof ResponsiveTable> = {
  title: 'Primitives/ResponsiveTable',
  component: ResponsiveTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsiveTable<Project>>;

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
  render: () => (
    <ResponsiveTable<Project>
      columns={COLS}
      rows={ROWS}
      rowKey={(r) => r.id}
    />
  ),
};

export const Mobile: Story = {
  // Card-stack layout kicks in below the sm breakpoint (640px).
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <ResponsiveTable<Project>
      columns={COLS}
      rows={ROWS}
      rowKey={(r) => r.id}
    />
  ),
};

export const CustomMobileCard: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <ResponsiveTable<Project>
      columns={COLS}
      rows={ROWS}
      rowKey={(r) => r.id}
      renderMobileCard={(row) => (
        <article
          key={row.id}
          style={{
            border: '1px solid #1f2937',
            borderRadius: 8,
            padding: 12,
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <strong style={{ color: '#e5e7eb' }}>{row.name}</strong>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>
            owner: {row.owner} · {row.updatedAt}
          </span>
          <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
            {row.status}
          </Badge>
        </article>
      )}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <ResponsiveTable<Project>
      columns={COLS}
      rows={[]}
      rowKey={(r) => r.id}
      emptyMessage="No projects yet — create your first one."
    />
  ),
};
