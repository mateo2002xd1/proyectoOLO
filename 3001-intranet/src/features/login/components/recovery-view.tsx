'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { authApi } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
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
        router.push('/security-questions');
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            className="mx-auto w-[96px] sm:w-[150px] lg:w-[210px]"
          />
          <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            INTRANET
          </h1>
        </div>
      </div>

      {/* Panel derecho — Recovery Card */}
      <div className="recovery-right">
        <div className="w-full max-w-[380px] rounded-[24px] bg-white px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10">
          <h2 className="text-[19px] font-bold leading-snug text-[#0d1526]">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mb-6 mt-1.5 text-[13px] leading-relaxed text-gray-500">
            Escribe tu correo institucional y te preguntaremos por tus preguntas de seguridad.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {generalError && (
              <div
                className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                role="alert"
              >
                {generalError}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#0d1526]">
                Correo SENA
              </label>
              <input
                id="email"
                type="email"
                maxLength={100}
                placeholder="usuario@sena.edu.co"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                }`}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Continuar'}
            </button>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="rounded text-xs text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        </div>

        <ReturnToSiteLink classPrefix="recovery" />
      </div>
    </div>
  );
}
