'use client';

import { useState, FormEvent, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, useAuth } from '@/features/login';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { PasswordField } from '@/shared/ui/molecules/password-field';
import { PasswordRequisitos } from '@/shared/ui/molecules/password-requisitos';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { mensajeDeError } from '@/shared/lib/errors';

/* sessionStorage es un sistema externo a React. Se lee con useSyncExternalStore
   en vez de copiarlo a un useState desde un efecto: getServerSnapshot devuelve
   null, asi que el servidor y la hidratacion coinciden, y tras montar el cliente
   ya lee el valor real. El snapshot es un string primitivo, por lo que no hace
   falta cachearlo. No hay evento de cambio, de ahi la suscripcion vacia. */
function subscribeToSessionStorage() {
  return () => { };
}

const getModeSnapshot = (): 'recovery' | 'forced' =>
  sessionStorage.getItem('recoveryEmail') && sessionStorage.getItem('recoveryAnswers')
    ? 'recovery'
    : 'forced';

/** En el servidor no hay sessionStorage: sin modo aun. */
const getModeServerSnapshot = (): null => null;

/** Datos de recuperacion guardados por el paso anterior del flujo. */
function leerDatosDeRecuperacion(): { email: string; answers: Array<{ key: string; answer: string }> } {
  const email = sessionStorage.getItem('recoveryEmail') ?? '';
  const crudas = sessionStorage.getItem('recoveryAnswers');
  try {
    return { email, answers: crudas ? JSON.parse(crudas) : [] };
  } catch {
    return { email, answers: [] };
  }
}

export function ResetPasswordView() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Solo `mode` necesita ser reactivo: el correo y las respuestas se leen
  // directamente al enviar, que es el unico sitio donde se usan.
  const mode = useSyncExternalStore(
    subscribeToSessionStorage,
    getModeSnapshot,
    getModeServerSnapshot,
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; password?: string; confirm?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    if (mode === 'forced' && !authLoading && !user) {
      router.push('/login');
    }
  }, [mode, authLoading, user, router, isSubmitted]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (mode === 'forced' && !currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Consideración 4: recuperación y cambio forzado aplican exactamente las mismas
    // reglas que el primer ingreso. `currentPassword` no se mide contra la política
    // —es la que el usuario ya tiene, no la que está eligiendo—.
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!cumplePolitica(password)) {
      newErrors.password = primerFallo(password) ?? '';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'recovery') {
        const { email, answers } = leerDatosDeRecuperacion();
        await authApi.recoverPassword(email, answers, password);
      } else {
        await authApi.changePassword(currentPassword, password);
      }

      setIsSubmitted(true);
      router.push('/reset-success');
    } catch (error) {
      setIsSubmitted(false);
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSubmitted && (mode === null || (mode === 'forced' && (authLoading || !user)))) {
    return null;
  }

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
        <div className="w-full max-w-[380px] rounded-[24px] bg-white px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10">
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="text-[19px] font-bold leading-snug text-[#0d1526]">
              Crea tu nueva contraseña
            </h2>
            <p className="mb-6 mt-1.5 text-[13px] leading-relaxed text-gray-500">
              {mode === 'forced'
                ? 'Has ingresado con un código temporal. Por tu seguridad, crea una nueva clave privada.'
                : 'Verificamos tu identidad. Elige una clave que no hayas usado antes.'}
            </p>

            {errors.general && (
              <div
                className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            {mode === 'forced' && (
              <PasswordField
                id="currentPassword"
                label="Contraseña actual"
                placeholder="Tu contraseña actual"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(v) => { setCurrentPassword(v); setErrors({}); }}
                error={errors.currentPassword}
                className="mb-4"
              />
            )}

            <PasswordField
              id="password"
              label="Nueva contraseña"
              autoComplete="new-password"
              placeholder="Mínimo 12 caracteres"
              value={password}
              onChange={(v) => { setPassword(v); setErrors({}); }}
              error={errors.password}
              className="mb-2"
            />
            <PasswordRequisitos password={password} variant="solid" className="mb-4" resumirAlCumplir />

            <PasswordField
              id="confirmPassword"
              label="Ingresa nuevamente la contraseña"
              autoComplete="new-password"
              placeholder="Mínimo 12 caracteres"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirm}
              className="mb-6"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        </div>

        <ReturnToSiteLink classPrefix="login" cerrarSesion={mode === 'forced'} />
      </div>
    </div>
  );
}
