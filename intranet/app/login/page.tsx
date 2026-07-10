'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

      if (data.mustSetupSecurityQuestions && data.mustChangePassword) {
        window.location.href = '/login/first-login';
      } else if (data.mustSetupSecurityQuestions) {
        window.location.href = '/login/security-questions';
      } else if (data.mustChangePassword) {
        window.location.href = '/login/reset-password';
      } else {
        window.location.href = '/inicio';
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Error de conexión con el servidor' });
    } finally {
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
            alt="OLO Logo"
            width={180}
            height={180}
            className="login-logo"
          />
        </div>
      </div>

      {/* Panel derecho — Login Card */}
      <div className="login-right">
        <div className="login-card">
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

            <div className="login-field">
              <label htmlFor="password" className="login-label">Contraseña</label>
              <div className="login-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`login-input login-input-password ${errors.password ? 'login-input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && <span className="login-error">{errors.password}</span>}
            </div>

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

            <a href="/login/recovery" className="login-forgot">
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>

        <a href="http://localhost:3000" className="login-return">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Regresar al sitio web del Observatorio
        </a>
      </div>
    </div>
  );
}
