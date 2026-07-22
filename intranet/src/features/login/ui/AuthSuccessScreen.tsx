import Link from 'next/link';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  hint?: string;
  loginLabel?: string;
}

export function AuthSuccessScreen({ title, subtitle, hint, loginLabel = 'Iniciar sesión' }: AuthSuccessScreenProps) {
  return (
    <div className="rs-page">
      <div className="rs-content">
        <h1 className="rs-title">{title}</h1>
        <p className="rs-subtitle">{subtitle}</p>
        {hint && <p className="rs-hint">{hint}</p>}

        <Link href="/login" className="rs-login-btn">
          {loginLabel}
        </Link>

        <ReturnToSiteLink classPrefix="rs" />
      </div>
    </div>
  );
}
