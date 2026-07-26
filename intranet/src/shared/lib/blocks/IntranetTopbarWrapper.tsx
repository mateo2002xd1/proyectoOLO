'use client';

import type { ComponentProps } from 'react';
import { IntranetTopbar } from './IntranetTopbar';
import { useAuth } from '@/features/auth';

/** El wrapper inyecta `onLogout` e `isLoading` desde useAuth, asi que los
 *  excluye de las props que recibe de fuera. */
type IntranetTopbarWrapperProps = Omit<
  ComponentProps<typeof IntranetTopbar>,
  'onLogout' | 'isLoading'
>;

export function IntranetTopbarWrapper(props: IntranetTopbarWrapperProps) {
  const { logout, isLoading } = useAuth();
  return <IntranetTopbar {...props} onLogout={logout} isLoading={isLoading} />;
}
