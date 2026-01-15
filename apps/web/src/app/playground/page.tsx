'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  StatusBadge,
  Input,
  AmountInput,
  Modal,
  ConfirmModal,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  EmptyState,
  EmptyIcon,
} from '@/components/ui';
import { StatusType } from '@/components/ui/StatusBadge';

export default function UIPlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [amountValue, setAmountValue] = useState('');

  const statusTypes: StatusType[] = [
    'live',
    'upcoming',
    'ended',
    'pending',
    'verified',
    'rejected',
    'active',
    'inactive',
    'success',
    'failed',
    'warning',
    'finalizing',
  ];

  return (
    <div className="min-h-screen bg-bg-page p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-display-lg text-text-primary mb-2">UI Playground</h1>
          <p className="text-body-sm text-text-secondary">
            Sprint 1 Component Library - Design System Phase 0
          </p>
        </div>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" isLoading>
              Loading...
            </Button>
          </div>
        </Section>

        {/* Status Badges */}
        <Section title="Status Badges">
          <div className="flex flex-wrap gap-3">
            {statusTypes.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <StatusBadge status="live" showDot={false} />
            <StatusBadge status="verified" label="Custom Label" />
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-heading-md">Default Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-text-secondary">
                  This is a default card with header and content.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-heading-md">Elevated Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-text-secondary">Card with shadow elevation.</p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <h3 className="text-heading-md">Hover Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-text-secondary">
                  Interactive card with hover effect.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Text Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helper="This is helper text"
            />
            <Input
              label="Input with Error"
              placeholder="Enter text..."
              error="This field is required"
            />
            <Input
              label="With MAX Button"
              placeholder="0.0"
              showMax
              onMaxClick={() => alert('Max clicked')}
            />
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Amount Input
              </label>
              <AmountInput
                placeholder="0.0"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                balance={2.5}
                currency="SOL"
                onMaxClick={() => setAmountValue('2.5')}
              />
            </div>
          </div>
        </Section>

        {/* Modals */}
        <Section title="Modals">
          <div className="flex gap-3">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button onClick={() => setConfirmOpen(true)} variant="danger">
              Open Confirm
            </Button>
          </div>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
            <p className="text-body-sm text-text-secondary mb-4">
              This is a modal dialog. Press ESC or click backdrop to close.
            </p>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </Modal>

          <ConfirmModal
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              alert('Confirmed!');
              setConfirmOpen(false);
            }}
            title="Confirm Action"
            description="Are you sure you want to proceed with this action?"
            variant="danger"
          />
        </Section>

        {/* Skeletons */}
        <Section title="Skeleton Loaders">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-heading-sm">Individual Skeletons</h4>
              <Skeleton variant="text" />
              <Skeleton variant="button" />
              <Skeleton variant="avatar" />
            </div>
            <div className="space-y-4">
              <h4 className="text-heading-sm">Composite Patterns</h4>
              <SkeletonText lines={4} />
              <SkeletonCard />
            </div>
          </div>
        </Section>

        {/* Empty States */}
        <Section title="Empty States">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <EmptyState
                  icon={<EmptyIcon />}
                  title="No Items Found"
                  description="There are no items to display at the moment."
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <EmptyState
                  icon={<EmptyIcon />}
                  title="Get Started"
                  description="Start by creating your first project."
                  action={{
                    label: 'Create Project',
                    onClick: () => alert('Action clicked'),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-heading-lg text-text-primary mb-4 pb-2 border-b border-border-subtle">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
