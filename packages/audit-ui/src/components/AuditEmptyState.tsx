'use client';

import type { ReactNode } from 'react';
import { Card, CardBody } from '@bsvibe/ui';

import { AUDIT_READ_PERMISSION, AUDIT_REQUIRED_PLAN } from '../types';

/**
 * Reasons the audit UI may render an empty state instead of a list.
 *
 *  - `no-results`: query succeeded with zero rows (or no query yet).
 *  - `plan`:       active tenant plan is below the enterprise threshold —
 *                  CTA points to upgrade.
 *  - `permission`: plan is fine but the viewer lacks `core.audit.read` —
 *                  CTA tells them to ask an admin.
 */
export type AuditEmptyReason = 'no-results' | 'plan' | 'permission';

export interface AuditEmptyStateProps {
  /** Why the list is empty — drives default copy. */
  reason: AuditEmptyReason;
  /** Override the headline. */
  title?: ReactNode;
  /** Override the body copy. */
  description?: ReactNode;
}

interface DefaultCopy {
  title: ReactNode;
  description: ReactNode;
}

function defaultCopy(reason: AuditEmptyReason): DefaultCopy {
  switch (reason) {
    case 'plan':
      return {
        title: 'Upgrade required',
        description: `Upgrade to the ${AUDIT_REQUIRED_PLAN} plan to view the audit log for this workspace.`,
      };
    case 'permission':
      return {
        title: 'Access denied',
        description: `Ask a workspace admin to grant the ${AUDIT_READ_PERMISSION} permission.`,
      };
    case 'no-results':
    default:
      return {
        title: 'Nothing here yet',
        description: 'No audit events match the current filter.',
      };
  }
}

/**
 * Empty / blocked state for the audit UI. Renders one of three templates
 * (no-results, plan, permission) with overridable copy.
 */
export function AuditEmptyState({ reason, title, description }: AuditEmptyStateProps) {
  const copy = defaultCopy(reason);
  const finalTitle = title ?? copy.title;
  const finalDescription = description ?? copy.description;

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <p className="text-base font-semibold text-gray-50">{finalTitle}</p>
          <p className="text-sm text-gray-400">{finalDescription}</p>
        </div>
      </CardBody>
    </Card>
  );
}
