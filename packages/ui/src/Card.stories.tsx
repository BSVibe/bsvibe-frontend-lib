import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card.js';
import { Button } from './Button.js';
import { Badge } from './Badge.js';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    hover: { control: 'boolean' },
    clickable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Plain: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <CardBody>
        <p style={{ color: 'var(--text-primary)' }}>Just a card with body text.</p>
      </CardBody>
    </Card>
  ),
};

export const HeaderBodyFooter: Story = {
  render: () => (
    <Card style={{ width: 360 }}>
      <CardHeader>
        <strong style={{ color: 'var(--text-primary)' }}>Project Atlas</strong>
      </CardHeader>
      <CardBody>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Three deliverables in flight, one decision pending.
        </p>
      </CardBody>
      <CardFooter>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button size="sm">Open</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Run #42</strong>
          <Badge variant="success" dot>
            done
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Completed in 1.2s</p>
      </CardBody>
    </Card>
  ),
};

export const Hover: Story = {
  render: () => (
    <Card hover style={{ width: 320 }}>
      <CardBody>
        <p style={{ color: 'var(--text-primary)' }}>Hover me — surface lifts.</p>
      </CardBody>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Card clickable onClick={() => alert('clicked')} style={{ width: 320 }}>
      <CardBody>
        <p style={{ color: 'var(--text-primary)' }}>Click or press Enter.</p>
      </CardBody>
    </Card>
  ),
};
