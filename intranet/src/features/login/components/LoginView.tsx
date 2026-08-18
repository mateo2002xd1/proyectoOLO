'use client';

import { Suspense, useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { useAuth } from '@/features/login';
import { PasswordField } from '@/shared/ui/molecules/PasswordField';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';
import { GooLoader } from '@/shared/ui/atoms/GooLoader';
import { mensajeDeError } from '@/shared/lib/errors';
import { mensajeDeCierre } from '@/shared/lib/inactividad';

/**
 * El formulario en sí. Se separó de `LoginView` al empezar a leer `?motivo=`:
 * `useSearchParams` obliga a un límite de Suspense y, sin él, el prerender de `/login`
 * falla en el build en vez de avisar en desarrollo.
 */
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Por qué se llegó aquí, si es que se llegó desde un cierre automático. El valor lo
  // traduce `mensajeDeCierre`, que solo reconoce los motivos propios: el parámetro
  // viene de la URL y pintarlo tal cual dejaría escribir cualquier texto sobre el
  // formulario de acceso con solo preparar un enlace.
  const avisoDeCierre = mensajeDeCierre(searchParams.get('motivo'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Forma y dominio institucional. El servidor responde 401 genérico a un dominio
    // ajeno —a propósito, para no ser un detector de dominios—, así que el motivo
    // real solo se ve si se comprueba aquí.
    const falloEmail = validarEmail(email);
    if (falloEmail) {
      newErrors.email = falloEmail;
    }

    // Solo se comprueba que no esté vacía. Un formulario de *inicio de sesión* no
    // debe medir la contraseña contra la política: quien la fijó cuando el mínimo
    // era 8 no podría ni enviar el formulario —ni llegar a recuperación, que está
    // detrás— y quedaría fuera de su cuenta sin haber hecho nada mal. La política
    // se aplica donde se *elige* contraseña, y el servidor la exige al cambiarla.
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
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
      const data = await login(email, password);

      setIsSuccess(true);

      setTimeout(() => {
        if (data.mustSetupSecurityQuestions && data.mustChangePassword) {
          router.push('/login/first-login');
        } else if (data.mustSetupSecurityQuestions) {
          router.push('/login/security-questions');
        } else if (data.mustChangePassword) {
          router.push('/login/reset-password');
        } else {
          window.location.href = '/inicio';
        }
      }, 1200);

    } catch (error) {
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo — Branding */}
      <div className="login-left">
        <div className="login-left-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            className="mx-auto w-[210px]"
          />
          <h1 className="text-4xl font-light text-white">
            Bienvenido a <span className="font-bold"><br />NUESTRA INTRANET</span>
          </h1>
        </div>
      </div>

      {/* Panel derecho — Login Card */}
      <div className="login-right">
        <div className="login-card">
          {isSuccess ? (
            <div className="login-success-loader">
              <GooLoader label="Preparando tu espacio..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="email" className="login-label">Correo SENA</label>
                <input
                  id="email"
                  type="email"
                  maxLength={100}
                  placeholder="usuario@sena.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                />
                {errors.email && <span className="login-error">{errors.email}</span>}
              </div>

              <PasswordField
                id="password"
                classPrefix="login"
                label="Contraseña"
                value={password}
                onChange={setPassword}
                error={errors.password}
              />

              {/* Antes que el error: explica por qué se está aquí, no qué se hizo mal. */}
              {avisoDeCierre && (
                <div className="login-general-notice" role="status">{avisoDeCierre}</div>
              )}

              {errors.general && (
                <div className="login-general-error">{errors.general}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`login-submit ${isLoading ? 'login-submit-disabled' : ''}`}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>

              <Link href="/login/recovery" className="login-forgot">
                ¿Olvidaste tu contraseña?
              </Link>

              <ReturnToSiteLink classPrefix="login" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoginView() {
  return (
    <Suspense fallback={<div className="login-card" />}>
      <LoginForm />
    </Suspense>
  );
}
