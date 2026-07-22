'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { PasswordField } from '@/shared/ui/molecules/PasswordField';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';

export function LoginView() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingrese un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
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

    } catch (error: any) {
      setErrors({ general: error.message || 'Error de conexión con el servidor' });
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo — Branding */}
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="login-brand-title">
            Bienvenido a<br />nuestra Intranet
          </h1>
          <Image
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            width={180}
            height={180}
            className="login-logo"
          />
        </div>
      </div>

      {/* Panel derecho — Login Card */}
      <div className="login-right">
        <div className="login-card">
          {isSuccess ? (
            <div className="login-success-loader">
              <div className="loader"></div>
              <p>Preparando tu espacio...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="email" className="login-label">Correo SENA</label>
                <input
                  id="email"
                  type="email"
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
            </form>
          )}
        </div>

        <ReturnToSiteLink classPrefix="login" />
      </div>
    </div>
  );
}
