'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validarEmail } from '@olo/email-policy';
import { Button } from '@/shared/ui/atoms/button';
import { mensajeDeCierre } from '@/shared/lib/inactividad';
import {
  AuthGeneralError,
  AuthGeneralNotice,
  AuthTextField,
  PasswordField,
  authQuietLinkClass,
  authSolidCardClass,
} from './auth-ui';

/**
 * Pantalla de acceso al panel de administración (`/login`).
 *
 * Toda la pantalla vive aquí y no en `app/`: la ruta solo la monta. Antes el
 * `page.tsx` traía las vistas, la validación y la llamada a la API, con lo que la
 * capa de enrutamiento acababa siendo la que decidía a dónde va cada rol.
 *
 * Solo pinta el formulario. Si la cuenta debe la configuración de primer ingreso,
 * manda a `/first-login` —hasta el 2026-09-18 la pintaba aquí mismo—, y el
 * «¿Olvidaste tu contraseña?» lleva a `/recovery`. El marco (`AuthSplitShell`) lo
 * pone `app/(auth)/layout.tsx`, común a todas esas pantallas.
 *
 * @see 1-guia-del-proyecto.md §4.2  (app/ solo enrutamiento; la lógica en features/)
 * @see 3-seguridad-del-proyecto.md  (la sesión la emite y valida la API :4000)
 */



function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  // `//host-ajeno` también "empieza por barra" y el navegador lo trata como URL
  // absoluta a otro origen: sin descartarlo, `redirect` sería una redirección
  // abierta armable a mano.
  const esRutaSegura = (r: string | null): r is string =>
    !!r && r.startsWith('/') && !r.startsWith('//');
  const redirectTo = esRutaSegura(redirectParam) ? redirectParam : '/admin/dashboard';

  // Por qué se llegó aquí, si es que se llegó desde un cierre automático. El valor lo
  // traduce `mensajeDeCierre`, que solo reconoce los motivos propios: el parámetro
  // viene de la URL y pintarlo tal cual dejaría escribir cualquier texto sobre el
  // formulario de acceso con solo preparar un enlace.
  const avisoDeCierre = mensajeDeCierre(searchParams.get('motivo'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const next: typeof errors = {};
    // Forma y dominio institucional, en una sola comprobación. El servidor lo exige
    // igualmente; esto evita el viaje de ida y vuelta y, sobre todo, da el motivo
    // real: el login responde 401 genérico a un dominio ajeno, a propósito.
    const falloEmail = validarEmail(email);
    if (falloEmail) next.email = falloEmail;
    if (!password) next.password = 'La contraseña es requerida';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || 'Correo o contraseña incorrectos' });
        return;
      }

      if (data.mustChangePassword || data.mustSetupSecurityQuestions) {
        router.push('/first-login');
        return;
      }

      const permisos = data.user?.permisos || [];
      const hasAccesoPanel = permisos.includes('acceso.panel');
      const hasPermisosEdicion = permisos.some((p: string) => 
        p.startsWith('editar.') || p.startsWith('secciones.') || p.startsWith('editor.')
      );

      if (hasAccesoPanel) {
        window.location.href = redirectParam ? redirectTo : '/admin/dashboard';
        return;
      }

      if (hasPermisosEdicion) {
        window.location.href = redirectParam ? redirectTo : '/';
        return;
      }

      setErrors({ general: 'Tu cuenta no tiene permisos de edición ni de acceso al panel.' });
    } catch {
      setErrors({ general: 'Error de conexión. Verifique que la API esté activa.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={authSolidCardClass}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Antes que el error: explica por qué se está aquí, no qué se hizo mal. Al
            escribir credenciales nuevas el error lo sustituye visualmente. */}
        {avisoDeCierre && <AuthGeneralNotice>{avisoDeCierre}</AuthGeneralNotice>}
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <AuthTextField
          id="email"
          type="email"
          label="Correo SENA"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          placeholder="usuario@sena.edu.co"
        />

        <PasswordField
          id="password"
          label="Passcode"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          className="mb-5"
        />

        {/* RF-13: el aviso va antes de enviar nada, no después.

            Los dos enlaces van a `/inicio/politica-de-privacidad`, la ruta canónica.
            `/privacidad` y `/politica-de-privacidad` son alias que redirigen ahí (ver
            `next.config.mjs`): enlazarlos manda al mismo sitio pagando un salto de más. */}
        <p className="mb-6 text-xs leading-relaxed text-gray-500">
          Al ingresar a este sitio aceptas la{' '}
          <Link href="/inicio/politica-de-privacidad" className="font-semibold text-gray-700 hover:underline">
            política de privacidad
          </Link>{' '}
          y{' '}
          <Link href="/inicio/politica-de-privacidad" className="font-semibold text-gray-700 hover:underline">
            protección de datos
          </Link>
          .
        </p>

        <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
          {isLoading ? 'Iniciando sesión…' : 'Ingresar'}
        </Button>

        <div className="mt-4 text-center">
          <Link href="/recovery" className={authQuietLinkClass}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
}

export function LoginView() {
  return (
    // `useSearchParams` obliga a un límite de Suspense: sin él, la ruta entera se
    // renderiza en cliente.
    <Suspense fallback={<div className={`${authSolidCardClass} text-center`}>Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
