'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, useAuth } from '@/features/auth';

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryAnswers, setRecoveryAnswers] = useState<Array<{ key: string; answer: string }>>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('recoveryEmail');
    const savedAnswers = sessionStorage.getItem('recoveryAnswers');
    if (savedEmail) setRecoveryEmail(savedEmail);
    if (savedAnswers) {
      try { setRecoveryAnswers(JSON.parse(savedAnswers)); } catch { }
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'El passcode es requerido';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Confirma tu passcode';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Los passcodes no coinciden';
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
      if (recoveryEmail && recoveryAnswers.length > 0) {
        // Flujo de recuperación (olvidé mi contraseña)
        await authApi.recoverPassword(recoveryEmail, recoveryAnswers, password);
        sessionStorage.removeItem('recoveryEmail');
        sessionStorage.removeItem('recoveryQuestions');
        sessionStorage.removeItem('recoveryAnswers');
      } else {
        // Flujo de cambio obligatorio (mustChangePassword) — requiere sesión activa
        // En este caso el backend necesita la contraseña actual; como no la tenemos,
        // redirigimos al login para que vuelva a autenticarse.
        setErrors({ general: 'No hay datos de recuperación. Por favor inicia el flujo desde "¿Olvidaste tu contraseña?".' });
        setIsLoading(false);
        return;
      }

      router.push('/login/reset-success');
    } catch (error: any) {
      setErrors({ general: error.message || 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rp-page">
      {/* Panel izquierdo — Branding */}
      <div className="rp-left">
        <div className="rp-left-content">
          <h1 className="rp-brand-title">
            Hola {user?.name ? user.name.split(' ')[0] : ''}, Actualiza tu seguridad.
          </h1>
          <p className="rp-brand-subtitle">
            Has ingresado con un código temporal. Por tu seguridad, es necesario que crees un nuevo código de acceso personal y privado que solo tú conozcas.
          </p>
        </div>
      </div>

      {/* Panel derecho — Card */}
      <div className="rp-right">
        <div className="rp-card">
          <form onSubmit={handleSubmit} className="rp-form">
            <h2 className="rp-card-title">Crea tu nuevo passcode</h2>

            <div className="rp-field">
              <label htmlFor="password" className="rp-label">Nuevo passcode</label>
              <div className="rp-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                  className={`rp-input rp-input-password ${errors.password ? 'rp-input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rp-eye-btn"
                  aria-label={showPassword ? 'Ocultar passcode' : 'Mostrar passcode'}
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
              {errors.password && <span className="rp-error">{errors.password}</span>}
            </div>

            <div className="rp-field">
              <label htmlFor="confirmPassword" className="rp-label">Ingresa nuevamente el passcode</label>
              <div className="rp-password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="mínimo 8 caracteres"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                  className={`rp-input rp-input-password ${errors.confirm ? 'rp-input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="rp-eye-btn"
                  aria-label={showConfirm ? 'Ocultar passcode' : 'Mostrar passcode'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showConfirm ? (
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
              {errors.confirm && <span className="rp-error">{errors.confirm}</span>}
            </div>

            {errors.general && (
              <div className="rp-general-error">{errors.general}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`rp-submit ${isLoading ? 'rp-submit-disabled' : ''}`}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>

            <Link href="/login" className="rp-login-link">
              Iniciar sesión
            </Link>
          </form>
        </div>

        <Link href="http://localhost:3000" className="rp-return">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Regresar al sitio web del Observatorio
        </Link>
      </div>
    </div>
  );
}
