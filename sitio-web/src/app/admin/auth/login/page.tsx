'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { FirstLoginFlow } from '@/features/administracion/components/first-login-flow';
import {
  AuthCardHeader,
  AuthGeneralError,
  AuthPageShell,
  BackToSiteLink,
  PasswordField,
  authCardClass,
  authErrorTextClass,
  authInputClass,
  authLabelClass,
} from '@/features/administracion/components/auth-ui';
import { Button } from '@/shared/ui/atoms/button';
import { ThemeToggle } from '@/shared/ui/molecules/theme-toggle';

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
      className="block rounded-[10px] border border-gray-200 dark:border-[#1e293b] px-[18px] py-4 transition-colors hover:border-brand hover:bg-gray-50 dark:hover:bg-[#131b2f]/50"
    >
      <span className="block text-[15px] font-semibold text-gray-900 dark:text-[#f6f6f6]">{title}</span>
      <span className="mt-0.5 block text-[13px] text-gray-500 dark:text-slate-400">{description}</span>
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
    if (!email.trim()) next.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingrese un correo válido';
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
      <div className={authCardClass}>
        <AuthCardHeader className="mb-7">
          <p className="text-lg font-light text-gray-900 dark:text-[#f6f6f6]">¿Qué deseas editar?</p>
        </AuthCardHeader>

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
            variant="success"
            className="mt-1 w-full gap-2"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/admin/auth/login';
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

          <BackToSiteLink className="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className={authCardClass}>
      <AuthCardHeader className="mb-[30px]">
        <p className="text-xl font-light text-[#757575] dark:text-slate-400">¡Bienvenido de nuevo!</p>
      </AuthCardHeader>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <div className="mb-4">
          <label htmlFor="email" className={authLabelClass}>
            Correo SENA
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@sena.edu.co"
            className={authInputClass(!!errors.email)}
          />
          {errors.email && <p className={authErrorTextClass}>{errors.email}</p>}
        </div>

        <PasswordField
          id="password"
          label="Passcode"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          className="mb-6"
        />

        <Button type="submit" variant="success" disabled={isLoading} className="w-full">
          {isLoading ? 'INICIANDO SESIÓN' : 'INGRESAR'}
        </Button>

        <BackToSiteLink className="mt-4" />
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <ThemeToggle />
      <AuthPageShell>
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </AuthPageShell>
    </>
  );
}
