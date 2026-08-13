'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validarEmail } from '@olo/email-policy';
import { Button } from '@/shared/ui/atoms/button';
import { FirstLoginFlow } from './first-login-flow';
import {
  AuthGeneralError,
  AuthSplitShell,
  AuthTextField,
  PasswordField,
  authQuietLinkClass,
  authSolidCardClass,
} from './auth-ui';

/**
 * Pantalla de acceso al panel de administración.
 *
 * Toda la pantalla vive aquí y no en `app/`: la ruta solo la monta. Antes el
 * `page.tsx` traía las tres vistas, la validación y la llamada a la API, con lo
 * que la capa de enrutamiento acababa siendo la que decidía a dónde va cada rol.
 *
 * Son tres pantallas sobre el mismo marco, y cuál se pinta lo dice la respuesta
 * del servidor, no la URL:
 *   1. el formulario;
 *   2. la configuración de primer ingreso, si la cuenta la debe;
 *   3. la elección de editor, si quien entra es Editor y puede ir a dos sitios.
 *
 * @see 1-guia-del-proyecto.md §4.2  (app/ solo enrutamiento; la lógica en features/)
 * @see 3-seguridad-del-proyecto.md  (la sesión la emite y valida la API :4000)
 */

const INTRANET_EDITOR_URL =
  process.env.NEXT_PUBLIC_INTRANET_EDITOR_URL || 'http://localhost:3001/editor/inicio';

/** Tarjeta de acceso a un editor, en la pantalla de elección. */
function EditorChoiceLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-[10px] border border-gray-200 px-[18px] py-4 transition-colors hover:border-[#0d1526] hover:bg-gray-50"
    >
      <span className="block text-[15px] font-semibold text-gray-900">{title}</span>
      <span className="mt-0.5 block text-[13px] text-gray-500">{description}</span>
    </a>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [editorChoice, setEditorChoice] = useState(false);
  const [firstLogin, setFirstLogin] = useState<{ name?: string } | null>(null);

  // Si el usuario venía a editar una página concreta del sitio, respetamos ese destino;
  // si no, el editor del sitio abre la página de inicio.
  const sitioEditorHref =
    redirectParam && redirectParam.startsWith('/admin/editor') ? redirectParam : '/admin/editor/inicio';

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
        setFirstLogin({ name: data.user?.name });
        return;
      }

      const role = data.user?.role ?? '';

      if (role === 'Superadmin' || role === 'Administrador') {
        window.location.href = redirectParam ? redirectTo : '/admin/dashboard';
        return;
      }

      if (role === 'Editor') {
        setEditorChoice(true);
        return;
      }

      setErrors({ general: 'Tu cuenta no tiene permisos de edición.' });
    } catch {
      setErrors({ general: 'Error de conexión. Verifique que la API esté activa.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (firstLogin) {
    return <FirstLoginFlow name={firstLogin.name} />;
  }

  if (editorChoice) {
    return (
      <div className={authSolidCardClass}>
        <p className="mb-7 text-center text-lg font-light text-gray-900">¿Qué deseas editar?</p>

        <div className="flex flex-col gap-3">
          <EditorChoiceLink
            href={sitioEditorHref}
            title="Editar sitio web"
            description="Editor visual del sitio público"
          />
          <EditorChoiceLink
            href={INTRANET_EDITOR_URL}
            title="Editar intranet"
            description="Editor visual de la intranet"
          />

          <Button
            type="button"
            plain
            className="mt-1 w-full gap-2"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={authSolidCardClass}>
      <form onSubmit={handleSubmit} noValidate>
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

        {/* RF-13: el aviso va antes de enviar nada, no después. */}
        <p className="mb-6 text-xs leading-relaxed text-gray-500">
          Al ingresar a este sitio aceptas la{' '}
          <Link href="/politica-de-privacidad" className="font-semibold text-gray-700 hover:underline">
            política de privacidad
          </Link>{' '}
          y{' '}
          <Link href="/privacidad" className="font-semibold text-gray-700 hover:underline">
            protección de datos
          </Link>
          .
        </p>

        <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
          {isLoading ? 'Iniciando sesión…' : 'Ingresar'}
        </Button>

        <div className="mt-4 text-center">
          <Link href="/admin/recuperar" className={authQuietLinkClass}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
}

export function LoginView() {
  return (
    <AuthSplitShell>
      {/* `useSearchParams` obliga a un límite de Suspense: sin él, la ruta entera
          se renderiza en cliente. */}
      <Suspense fallback={<div className={`${authSolidCardClass} text-center`}>Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </AuthSplitShell>
  );
}
