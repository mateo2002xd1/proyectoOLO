import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import { ReactNode } from 'react';

export function Field({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Headless.Field className={clsx('w-full flex flex-col gap-y-1.5', className)}>
      {children}
    </Headless.Field>
  );
}

export function Label({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Headless.Label className={clsx('block text-sm font-medium text-gray-700 dark:text-gray-200', className)}>
      {children}
    </Headless.Label>
  );
}
