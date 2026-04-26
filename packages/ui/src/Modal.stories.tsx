import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { Input } from './Input.js';

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

function Demo({
  title,
  body,
  footer,
  width,
}: {
  title: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={footer ?? null}
        width={width}
      >
        {body}
      </Modal>
    </>
  );
}

export const Basic: Story = {
  render: () => (
    <Demo
      title="Confirm action"
      body={<p style={{ color: 'var(--text-primary)' }}>Are you sure you want to proceed?</p>}
    />
  ),
};

export const WithFooterActions: Story = {
  render: () => {
    function Inner() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Delete project</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Delete project?"
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setOpen(false)}>
                  Delete
                </Button>
              </>
            }
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              This permanently removes all deliverables, runs, and decisions in this project.
            </p>
          </Modal>
        </>
      );
    }
    return <Inner />;
  },
};

export const FormInside: Story = {
  render: () => {
    function Inner() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>New project</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="New project"
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Create</Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Name" placeholder="Untitled" />
              <Input label="Slug" placeholder="my-project" helperText="lowercase + hyphen" />
            </div>
          </Modal>
        </>
      );
    }
    return <Inner />;
  },
};

export const Wide: Story = {
  render: () => (
    <Demo
      title="Wide modal (720px)"
      body={
        <p style={{ color: 'var(--text-primary)' }}>
          Useful for tables, chats, or composition snapshots.
        </p>
      }
      width={720}
    />
  ),
};

export const NoFooter: Story = {
  render: () => (
    <Demo
      title="Notice"
      body={<p style={{ color: 'var(--text-primary)' }}>No footer — close via X, Escape, or backdrop.</p>}
    />
  ),
};
