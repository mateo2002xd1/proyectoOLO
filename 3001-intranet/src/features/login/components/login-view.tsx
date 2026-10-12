'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { useAuth } from '@/features/login';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { GooLoader } from '@/shared/ui/atoms/goo-loader';
import { mensajeDeError } from '@/shared/lib/errors';
import { mensajeDeCierre } from '@/shared/lib/inactividad';
import { SITE_URL } from '@/shared/lib/constants';
import {
  accesoBotonClass,
  accesoCampoClass,
  accesoEnlaceClass,
  accesoErrorClass,
  accesoErrorGeneralClass,
  accesoEtiquetaClass,
  accesoHuecoArribaClass,
  accesoHuecoClass,
  accesoIconoCampoClass,
} from './acceso-ui';
import { MarcoAcceso } from './marco-acceso';

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
    // El mismo marco que el resto del acceso (`MarcoAcceso`, la maqueta del sitio web en
    // azul): logo y título arriba en el móvil, a la izquierda desde `xl`; el formulario
    // directo sobre el azul. Es la única pantalla con el logo en todos los anchos (`conLogo`),
    // como en el sitio.
    <MarcoAcceso
      conLogo
      titulo={
        <>
          {/* El espacio entre los dos es para el nombre accesible: dos `block` seguidos se
              leerían «Bienvenido anuestra Intranet». */}
          <span className="block font-normal">Bienvenido a</span>{' '}
          <span className="block">nuestra Intranet</span>
        </>
      }
    >
      {isSuccess ? (
        <div className="login-success-loader">
          <GooLoader label="Preparando tu espacio..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Antes que el error: explica por qué se está aquí, no qué se hizo mal. */}
          {avisoDeCierre && (
            <div
              className="mb-[clamp(0.75rem,2.2dvh,1.5rem)] rounded-[16px] border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 md:mb-6"
              role="status"
            >
              {avisoDeCierre}
            </div>
          )}

          {errors.general && (
            <div className={accesoErrorGeneralClass} role="alert">
              {errors.general}
            </div>
          )}

          <div className={accesoHuecoClass}>
            <label htmlFor="email" className={accesoEtiquetaClass}>
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
              className={accesoCampoClass(!!errors.email)}
            />
            {errors.email && <p className={accesoErrorClass}>{errors.email}</p>}
          </div>

          <div className={accesoHuecoClass}>
            <label htmlFor="password" className={accesoEtiquetaClass}>
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
                className={accesoCampoClass(!!errors.password, 'pr-14')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${accesoIconoCampoClass}`}
              >
                <IconoMascara nombre={showPassword ? 'eye-open' : 'eye-closed'} tamano="h-4 w-5" />
              </button>
            </div>
            {errors.password && <p className={accesoErrorClass}>{errors.password}</p>}
          </div>

          {/* RF-13: aviso de políticas de privacidad y datos.

              Los dos enlaces apuntan al SITIO WEB, no a la intranet: la política es
              una sección del portal público y aquí no existe esa ruta. Eran
              relativas (`/politica-de-privacidad`, `/privacidad`), así que el
              middleware las tomaba por pantalla protegida y devolvía a quien las
              pulsara al propio login del que venía.

              El texto llena el ancho, como en el sitio web, y dice «nuestra» política
              (las dos apps, 2026-10-11). */}
          <p className={`${accesoHuecoClass} text-sm leading-relaxed text-white/85`}>
            Al ingresar a este sitio aceptas nuestra{' '}
            <a href={`${SITE_URL}/politica-de-privacidad`} className="font-semibold text-white hover:underline">
              política de privacidad
            </a>{' '}
            y{' '}
            <a href={`${SITE_URL}/politica-de-privacidad`} className="font-semibold text-white hover:underline">
              protección de datos
            </a>
            .
          </p>

          <button type="submit" disabled={isLoading} className={accesoBotonClass}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className={`${accesoHuecoArribaClass} text-center`}>
            <Link href="/recovery" className={accesoEnlaceClass}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      )}
    </MarcoAcceso>
  );
}

export function LoginView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-[#001A39]" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
