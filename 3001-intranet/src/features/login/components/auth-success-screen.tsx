'use client';

import { useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  hint?: string;
  loginLabel?: string;
}

export function AuthSuccessScreen({
  title,
  subtitle,
  hint,
  loginLabel = 'Ir a iniciar sesión',
}: AuthSuccessScreenProps) {
  const { logout } = useAuth();

  return (
    <div className="login-page">
      {/* Panel izquierdo — Branding institucional con logo blanco de la intranet */}
      <div className="login-left">
        <div className="login-left-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            className="mx-auto w-[96px] sm:w-[150px] lg:w-[210px]"
          />
          <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            INTRANET
          </h1>
        </div>
      </div>

      {/* Panel derecho — Card */}
      <div className="login-right">
        <div className="w-full max-w-[380px] rounded-[24px] bg-white px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10 text-center">
          {/* Badge con check institucional */}
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-[#0d1526]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-[19px] font-bold leading-snug text-[#0d1526]">
            {title}
          </h2>
          <p className="mb-6 mt-1.5 text-[13px] leading-relaxed text-gray-500">
            {subtitle}
          </p>
          {hint && (
            <p className="-mt-4 mb-6 text-xs text-gray-400">
              {hint}
            </p>
          )}

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526]"
          >
            {loginLabel}
          </button>
        </div>

        <ReturnToSiteLink classPrefix="login" />
      </div>
    </div>
  );
}
