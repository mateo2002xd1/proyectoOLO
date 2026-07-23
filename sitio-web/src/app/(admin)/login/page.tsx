'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FirstLoginFlow } from '@/features/administracion/components/first-login-flow';

const INTRANET_EDITOR_URL =
  process.env.NEXT_PUBLIC_INTRANET_EDITOR_URL || 'http://localhost:3001/editor/inicio';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [editorChoice, setEditorChoice] = useState(false);
  const [firstLogin, setFirstLogin] = useState<{ name?: string } | null>(null);

  // Si el usuario venía a editar una página concreta del sitio, respetamos ese destino;
  // si no, el editor del sitio abre la página de inicio.
  const sitioEditorHref =
    redirectParam && redirectParam.startsWith('/editor') ? redirectParam : '/editor/inicio';

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
        window.location.href = redirectParam ? redirectTo : '/dashboard';
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
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/asset/logos/olo-logo-none.svg"
            alt="OLO Logo"
            style={{ width: 60, height: 'auto', margin: '0 auto 12px' }}
          />
          <p style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#111827' }}>
            ¿Qué deseas editar?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href={sitioEditorHref}
            style={{
              display: 'block',
              padding: '16px 18px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#111827' }}>
              Editar sitio web
            </span>
            <span style={{ display: 'block', fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Editor visual del sitio público
            </span>
          </a>

          <a
            href={INTRANET_EDITOR_URL}
            style={{
              display: 'block',
              padding: '16px 18px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#111827' }}>
              Editar intranet
            </span>
            <span style={{ display: 'block', fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Editor visual de la intranet
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img
          src="/asset/logos/olo-logo-none.svg"
          alt="OLO Logo"
          style={{
            width: 60,
            height: 'auto',
            margin: '0 auto 12px',
          }}
        />
        <p style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#111827' }}>
          Ingrese sus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {errors.general}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}
          >
            Correo SENA
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@sena.edu.co"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${errors.email ? '#f87171' : '#d1d5db'}`,
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              color: '#111827',
            }}
          />
          {errors.email && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}
          >
            Passcode
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                border: `1px solid ${errors.password ? '#f87171' : '#d1d5db'}`,
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#111827',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#6b7280',
              }}
            >
              {showPassword ? (
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
              )}
            </button>
          </div>
          {errors.password && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: isLoading ? '#689b1c' : '#7DB728',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isLoading ? 'Iniciando sesión…' : 'Ingresar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#4B5563',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ir al sitio web
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F3F3',
        padding: 24,
      }}
    >
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
