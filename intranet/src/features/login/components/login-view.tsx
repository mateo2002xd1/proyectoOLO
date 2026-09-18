'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { GooLoader } from '@/shared/ui/atoms/goo-loader';
import { mensajeDeError } from '@/shared/lib/errors';
import { mensajeDeCierre } from '@/shared/lib/inactividad';
import { SITE_URL } from '@/shared/lib/constants';

/** Ojo abierto/cerrado del campo de contraseña, igual al de la pantalla de acceso del panel. */
function EyeIcon({ crossed }: { crossed: boolean }) {
  return crossed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Mensajes de error del formulario, por campo. `general` es el del servidor, que no
 * pertenece a ningún campo concreto (credenciales inválidas, falta de permiso).
 */
interface ErroresLogin {
  email?: string;
  password?: string;
  general?: string;
}

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

  // A dónde volver tras un cierre por inactividad. Se exige que empiece por `/` y
  // no por `//`: lo primero descarta una URL absoluta a otro origen colada en el
  // parámetro, lo segundo un `//host` que el navegador interpretaría como tal pese
  // a "empezar por barra". Sin ninguna de las dos validaciones, un enlace armado a
  // mano con `?redirect=` sería una redirección abierta.
  const redirectParam = searchParams.get('redirect');
  const rutaDeVuelta =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/inicio';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErroresLogin>(() => {
    const initialErrors: ErroresLogin = {};
    if (searchParams.get('error') === 'acceso_denegado') {
      initialErrors.general = 'No tienes permisos para ingresar a la intranet.';
    }
    return initialErrors;
  });
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

      // Verificamos si el usuario realmente tiene permiso para entrar a la intranet.
      // Si no lo tiene, cerramos la sesión que la API acaba de abrir y mostramos el error.
      if (!data.user.permisos?.includes('acceso.intranet')) {
        try {
          await fetch('/api-backend/logout', { method: 'POST' });
        } catch {}
        setErrors({ general: 'No tienes permisos para ingresar a la intranet.' });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        if (data.mustSetupSecurityQuestions && data.mustChangePassword) {
          router.push('/login/first-login');
        } else if (data.mustSetupSecurityQuestions) {
          router.push('/login/security-questions');
        } else if (data.mustChangePassword) {
          router.push('/login/reset-password');
        } else {
          window.location.href = rutaDeVuelta;
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
        {/* Misma tarjeta que el login del panel de administración: clases de
            Tailwind literales, no la hoja `.login-*` que tenía valores propios
            y se desalineaba de sitio-web cada vez que uno de los dos cambiaba. */}
        <div className="w-full max-w-[380px] rounded-[24px] bg-white px-9 py-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
          {isSuccess ? (
            <div className="login-success-loader">
              <GooLoader label="Preparando tu espacio..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Antes que el error: explica por qué se está aquí, no qué se hizo mal. */}
              {avisoDeCierre && (
                <div
                  className="mb-4 rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-800"
                  role="status"
                >
                  {avisoDeCierre}
                </div>
              )}

              {errors.general && (
                <div
                  className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#0d1526]">
                  Correo SENA
                </label>
                <input
                  id="email"
                  type="email"
                  maxLength={100}
                  placeholder="usuario@sena.edu.co"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#0d1526]">
                  Passcode
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={50}
                    autoComplete="current-password"
                    placeholder="Mínimo 12 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 pr-10 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
                  >
                    <EyeIcon crossed={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* RF-13: aviso de políticas de privacidad y datos.

                  Los dos enlaces apuntan al SITIO WEB, no a la intranet: la política es
                  una sección del portal público y aquí no existe esa ruta. Eran
                  relativas (`/politica-de-privacidad`, `/privacidad`), así que el
                  middleware las tomaba por pantalla protegida y devolvía a quien las
                  pulsara al propio login del que venía. */}
              <p className="mb-6 text-xs leading-relaxed text-gray-500">
                Al ingresar a este sitio aceptas la{' '}
                <a href={`${SITE_URL}/inicio/politica-de-privacidad`} className="font-semibold text-gray-700 hover:underline">
                  política de privacidad
                </a>{' '}
                y{' '}
                <a href={`${SITE_URL}/inicio/politica-de-privacidad`} className="font-semibold text-gray-700 hover:underline">
                  protección de datos
                </a>
                .
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/login/recovery"
                  className="rounded text-xs text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          )}
        </div>
        <ReturnToSiteLink classPrefix="login" />
      </div>
    </div>
  );
}

export function LoginView() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-right w-full">
            <div className="w-full max-w-[380px] rounded-[24px] bg-white px-9 py-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
