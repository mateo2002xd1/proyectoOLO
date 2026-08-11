'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { authApi } from '@/features/auth';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';
import { mensajeDeError } from '@/shared/lib/errors';

export function RecoveryView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const validate = (): boolean => {
    const fallo = validarEmail(email);
    if (fallo) {
      setError(fallo);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');
    setGeneralError('');

    try {
      const data = await authApi.getUserQuestions(email);

      if (data.questions && data.questions.length > 0) {
        sessionStorage.setItem('recoveryEmail', email);
        sessionStorage.setItem('recoveryQuestions', JSON.stringify(data.questions));
        router.push('/auth/security-questions');
      } else {
        setGeneralError('No se encontraron preguntas de seguridad para este correo.');
      }
    } catch (error) {
      setGeneralError(mensajeDeError(error, 'Error de conexión con el servidor'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      {/* Panel izquierdo — Branding */}
      <div className="recovery-left">
        <div className="recovery-left-content">
          <h1 className="recovery-brand-title">
            Recupera el acceso<br />a tu cuenta
          </h1>
          <p className="recovery-brand-subtitle">
            No te preocupes, vamos a ayudarte a restablecer tu passcode, verifica que eres tú.
          </p>
        </div>
      </div>

      {/* Panel derecho — Recovery Card */}
      <div className="recovery-right">
        <div className="recovery-card">
          <form onSubmit={handleSubmit} className="recovery-form">
              <h2 className="recovery-card-title">Ingresa tu correo SENA</h2>

              <div className="recovery-field">
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@sena.edu.co"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`recovery-input ${error ? 'recovery-input-error' : ''}`}
                />
                {error && <span className="recovery-error">{error}</span>}
              </div>

              {generalError && (
                <div className="recovery-general-error">{generalError}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`recovery-submit ${isLoading ? 'recovery-submit-disabled' : ''}`}
              >
                {isLoading ? 'Enviando...' : 'Comenzar'}
              </button>

              <Link href="/auth" className="recovery-login-link">
                Iniciar sesión
              </Link>
          </form>
        </div>

        <ReturnToSiteLink classPrefix="recovery" />
      </div>
    </div>
  );
}
