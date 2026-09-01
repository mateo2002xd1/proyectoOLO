'use client';

import { useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  hint?: string;
  loginLabel?: string;
}

export function AuthSuccessScreen({ title, subtitle, hint, loginLabel = 'Iniciar sesión' }: AuthSuccessScreenProps) {
  const { logout } = useAuth();

  return (
    <div className="rs-page">
      <div className="rs-content">
        <h1 className="rs-title">{title}</h1>
        <p className="rs-subtitle">{subtitle}</p>
        {hint && <p className="rs-hint">{hint}</p>}

        <button type="button" onClick={() => logout()} className="rs-login-btn">
          {loginLabel}
        </button>

        <ReturnToSiteLink classPrefix="rs" />
      </div>
    </div>
  );
}
