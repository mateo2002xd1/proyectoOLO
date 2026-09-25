'use client';

import { useState, FormEvent, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
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
  const { user, isLoading: authLoading, logout } = useAuth();
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

  useEffect(() => {
    if (mode === 'forced' && !authLoading && !user) {
      router.push('/login');
    }
  }, [mode, authLoading, user, router]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (mode === 'forced' && !currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Consideración 4: recuperación y cambio forzado aplican exactamente las mismas
    // reglas que el primer ingreso. `currentPassword` no se mide contra la política
    // —es la que el usuario ya tiene, no la que está eligiendo—.
    if (!password) {
      newErrors.password = 'El passcode es requerido';
    } else if (!cumplePolitica(password)) {
      newErrors.password = primerFallo(password) ?? '';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Confirma tu passcode';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Los passcodes no coinciden';
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
        sessionStorage.removeItem('recoveryEmail');
        sessionStorage.removeItem('recoveryQuestions');
        sessionStorage.removeItem('recoveryAnswers');
      } else {
        await authApi.changePassword(currentPassword, password);
      }

      router.push('/reset-success');
    } catch (error) {
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === null || (mode === 'forced' && (authLoading || !user))) {
    return null;
  }

  return (
    <div className="rp-page">
      {/* Panel izquierdo — Branding */}
      <div className="rp-left">
        <div className="rp-left-content">
          {mode === 'forced' ? (
            <>
              <h1 className="rp-brand-title">
                Hola {user?.name ? user.name.split(' ')[0] : ''}, Actualiza tu seguridad.
              </h1>
              <p className="rp-brand-subtitle">
                Has ingresado con un código temporal. Por tu seguridad, es necesario que crees un nuevo código de acceso personal y privado que solo tú conozcas.
              </p>
            </>
          ) : (
            <>
              <h1 className="rp-brand-title">Crea tu nuevo passcode</h1>
              <p className="rp-brand-subtitle">
                Elige un nuevo passcode personal y privado que solo tú conozcas para volver a acceder a tu cuenta.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Panel derecho — Card */}
      <div className="rp-right">
        <div className="rp-card">
          <form onSubmit={handleSubmit} className="rp-form">
            <h2 className="rp-card-title">Crea tu nuevo passcode</h2>

            {mode === 'forced' && (
              <PasswordField
                id="currentPassword"
                classPrefix="rp"
                label="Contraseña actual"
                placeholder="Tu contraseña actual"
                value={currentPassword}
                onChange={(v) => { setCurrentPassword(v); setErrors({}); }}
                error={errors.currentPassword}
              />
            )}

            <PasswordField
              id="password"
              classPrefix="rp"
              label="Nuevo passcode"
              value={password}
              onChange={(v) => { setPassword(v); setErrors({}); }}
              error={errors.password}
            />
            <PasswordRequisitos classPrefix="rp" password={password} />

            <PasswordField
              id="confirmPassword"
              classPrefix="rp"
              label="Ingresa nuevamente el passcode"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirm}
            />

            {errors.general && (
              <div className="rp-general-error">{errors.general}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`rp-submit ${isLoading ? 'rp-submit-disabled' : ''}`}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>

            <button type="button" onClick={() => logout()} className="rp-login-link">
              Iniciar sesión
            </button>
          </form>
        </div>

        <ReturnToSiteLink classPrefix="rp" />
      </div>
    </div>
  );
}
