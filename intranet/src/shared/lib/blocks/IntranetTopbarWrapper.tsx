'use client';

import React from 'react';
import { IntranetTopbar } from './IntranetTopbar';
import { useAuth } from '@/features/auth';

export function IntranetTopbarWrapper(props: any) {
  const { logout, isLoading } = useAuth();
  return <IntranetTopbar {...props} onLogout={logout} isLoading={isLoading} />;
}
