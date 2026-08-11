'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { useAuth } from '@/features/auth';
import { PasswordField } from '@/shared/ui/molecules/PasswordField';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';
import { GooLoader } from '@/shared/ui/atoms/GooLoader';
import { mensajeDeError } from '@/shared/lib/errors';

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

      setIsSuccess(true);

      setTimeout(() => {
        if (data.mustSetupSecurityQuestions && data.mustChangePassword) {
          router.push('/auth/first-login');
        } else if (data.mustSetupSecurityQuestions) {
          router.push('/auth/security-questions');
        } else if (data.mustChangePassword) {
          router.push('/auth/reset-password');
        } else {
          window.location.href = '/inicio';
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
              <GooLoader label="Preparando tu espacio..." />
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

              <Link href="/auth/recovery" className="login-forgot">
                ¿Olvidaste tu contraseña?
              </Link>

              <ReturnToSiteLink classPrefix="login" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
