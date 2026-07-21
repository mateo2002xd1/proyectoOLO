import * as Headless from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { ReactNode } from 'react';

export function Listbox({
  value,
  onChange,
  children,
  className
}: {
  value: any;
  onChange: (value: any) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Headless.Listbox value={value} onChange={onChange}>
      <div className={clsx('relative w-full', className)}>
        {children}
      </div>
    </Headless.Listbox>
  );
}

export function ListboxLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Headless.ListboxButton className={clsx(
      'relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-100 dark:focus:ring-indigo-500',
      className
    )}>
      <span className="block truncate">{children}</span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </span>
    </Headless.ListboxButton>
  );
}

export function ListboxOptions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Headless.Transition
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Headless.ListboxOptions className={clsx('absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-800 dark:ring-white/10', className)}>
        {children}
      </Headless.ListboxOptions>
    </Headless.Transition>
  );
}

export function ListboxOption({
  value,
  children,
  disabled
}: {
  value: any;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Headless.ListboxOption
      value={value}
      disabled={disabled}
      className={({ focus }) =>
        clsx(
          'relative cursor-default select-none py-2 pl-3 pr-9',
          focus ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        )
      }
    >
      {({ selected, focus }) => (
        <>
          <span className={clsx('block truncate', selected ? 'font-semibold' : 'font-normal')}>
            {children}
          </span>
          {selected ? (
            <span
              className={clsx(
                'absolute inset-y-0 right-0 flex items-center pr-4',
                focus ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
              )}
            >
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Headless.ListboxOption>
  );
}
