/**
 * @bsvibe/ui — UI primitives for the BSVibe ecosystem.
 *
 * Phase A surface (D3 primitives, React 19):
 *  - <Button>   variant + size + loading
 *  - <Modal>    open/close + Escape + backdrop + focus-trap-friendly
 *  - <Badge>    variant tone + optional dot
 *  - <Input>    label + helper text + error message + a11y wiring
 *  - <Card>     CardHeader / CardBody / CardFooter, optional clickable
 *  - cn()       inline class-name combiner (no clsx runtime dep)
 *
 * RSC-first: only interactive components carry 'use client'.
 * Storybook (D5, GitHub Pages) ships from the same source — see `.storybook/`.
 *
 * SoT: BSNexus가 가장 많은 primitive 보유 → 주 추출 소스.
 */

export { Button } from './Button.js';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.js';

export { Modal } from './Modal.js';
export type { ModalProps } from './Modal.js';

export { Badge } from './Badge.js';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge.js';

export { Input } from './Input.js';
export type { InputProps } from './Input.js';

export { Card, CardHeader, CardBody, CardFooter } from './Card.js';
export type { CardProps } from './Card.js';

export { cn } from './cn.js';
export type { ClassValue } from './cn.js';
