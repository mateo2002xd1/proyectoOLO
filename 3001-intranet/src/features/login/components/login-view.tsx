'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { GooLoader } from '@/shared/ui/atoms/goo-loader';
import { mensajeDeError } from '@/shared/lib/errors';
import { mensajeDeCierre } from '@/shared/lib/inactividad';
import { SITE_URL } from '@/shared/lib/constants';

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
/**
 * Tarjeta del formulario. Por debajo de `xl` no es tarjeta: el formulario va directo
 * sobre el azul, con etiquetas y textos en blanco (diseño de móvil y tablet). Desde
 * `xl` vuelve la tarjeta blanca, igual que el login del panel del sitio web.
 *
 * Las medidas de letra son las del acceso del sitio web (`acceso-ui.ts`, 2026-10-11): título
 * de 20-24 px en el móvil y 30 desde `md`; etiquetas y enlaces de 14/16; campos y botón de
 * 44 px con texto de 16; errores y el aviso de privacidad, de 14.
 */
const TARJETA_LOGIN =
  'w-full max-w-[380px] md:max-w-[452px] xl:rounded-[24px] xl:bg-white xl:px-9 xl:py-10 xl:shadow-[0_25px_60px_rgba(0,0,0,0.35)]';

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
          router.push('/first-login');
        } else if (data.mustSetupSecurityQuestions) {
          router.push('/security-questions');
        } else if (data.mustChangePassword) {
          router.push('/reset-password');
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
          {/* Por debajo de `xl` (móvil y tablet, ver globals.css) manda el diseño de
              móvil: el título primero y el logo debajo, grande y atenuado, como fondo
              de marca antes del formulario. Desde `xl`, logo arriba y título debajo.
              En el móvil el logo y los huecos se encogen con el alto de la pantalla
              (`dvh`), para que el login quepa entero sin scroll (2026-10-10). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            className="order-2 mx-auto w-[clamp(4.5rem,14dvh,12rem)] opacity-30 sm:w-56 xl:order-1 xl:w-[210px] xl:opacity-100"
          />
          <h1 className="order-1 mb-[clamp(0.75rem,3dvh,2rem)] text-[clamp(1.25rem,3.6dvh,1.5rem)] font-bold leading-tight text-white sm:mb-8 md:text-3xl xl:order-2 xl:mb-0 xl:font-light">
            Bienvenido a <span className="font-bold xl:uppercase"><br />nuestra Intranet</span>
          </h1>
        </div>
      </div>

      {/* Panel derecho — Login Card */}
      <div className="login-right">
        {/* Desde `xl`, misma tarjeta que el login del panel de administración:
            clases de Tailwind literales, no la hoja `.login-*` que tenía valores
            propios y se desalineaba de sitio-web cada vez que uno de los dos
            cambiaba. Por debajo, sin tarjeta (ver `TARJETA_LOGIN`). */}
        <div className={TARJETA_LOGIN}>
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

              <div className="mb-3 sm:mb-4">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-white md:mb-2 md:text-base xl:text-[#0d1526]">
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
                  className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-[#0d1526] focus:ring-white xl:focus:ring-[#0d1526]'
                  }`}
                />
                {errors.email && <p className="mt-1.5 text-sm text-red-300 xl:text-red-600">{errors.email}</p>}
              </div>

              <div className="mb-3 sm:mb-5">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-white md:mb-2 md:text-base xl:text-[#0d1526]">
                  Contraseña
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
                    className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 pr-10 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-[#0d1526] focus:ring-white xl:focus:ring-[#0d1526]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
                  >
                    <IconoMascara nombre={showPassword ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-300 xl:text-red-600">{errors.password}</p>}
              </div>

              {/* RF-13: aviso de políticas de privacidad y datos.

                  Los dos enlaces apuntan al SITIO WEB, no a la intranet: la política es
                  una sección del portal público y aquí no existe esa ruta. Eran
                  relativas (`/politica-de-privacidad`, `/privacidad`), así que el
                  middleware las tomaba por pantalla protegida y devolvía a quien las
                  pulsara al propio login del que venía. */}
              <p className="mb-[clamp(0.75rem,2.5dvh,1.5rem)] text-sm leading-relaxed text-white/85 sm:mb-6 xl:text-gray-500">
                Al ingresar a este sitio aceptas la{' '}
                <a href={`${SITE_URL}/politica-de-privacidad`} className="font-semibold text-white hover:underline xl:text-gray-700">
                  política de privacidad
                </a>{' '}
                y{' '}
                <a href={`${SITE_URL}/politica-de-privacidad`} className="font-semibold text-white hover:underline xl:text-gray-700">
                  protección de datos
                </a>
                .
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center h-11 rounded-[16px] bg-white px-6 text-base font-medium text-[#0d1526] shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A39] disabled:cursor-not-allowed disabled:opacity-50 xl:bg-[#0d1526] xl:text-white xl:hover:bg-[#1a2340] xl:focus-visible:ring-[#0d1526] xl:focus-visible:ring-offset-white"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>

              <div className="mt-[clamp(0.5rem,2dvh,1rem)] text-center sm:mt-4">
                <Link
                  href="/recovery"
                  className="rounded px-1 py-1 text-sm text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-base xl:text-[#0d1526] xl:hover:text-[#0d1526] xl:focus-visible:ring-[#0d1526]"
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
            <div className={TARJETA_LOGIN} />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
