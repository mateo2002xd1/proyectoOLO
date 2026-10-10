'use client';

import { useState, FormEvent, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { type CatalogQuestion } from './question-picker';
import { AuthSuccessScreen } from './auth-success-screen';
import { mensajeDeError } from '@/shared/lib/errors';

const TOTAL_SETUP_QUESTIONS = 3;

/* sessionStorage es un sistema externo a React. Se lee con useSyncExternalStore
   en vez de copiarlo a un useState desde un efecto: getServerSnapshot devuelve
   null, asi que servidor e hidratacion coinciden, y tras montar el cliente ya
   lee el valor real. No hay evento de cambio, de ahi la suscripcion vacia. */
function subscribeToSessionStorage() {
  return () => { };
}

const getModeSnapshot = (): 'verify' | 'setup' =>
  sessionStorage.getItem('recoveryEmail') && sessionStorage.getItem('recoveryQuestions')
    ? 'verify'
    : 'setup';

/** En el servidor no hay sessionStorage: sin modo aun. */
const getModeServerSnapshot = (): null => null;

/** Preguntas que dejo guardadas el paso anterior del flujo de recuperacion. */
function leerPreguntasGuardadas(): CatalogQuestion[] {
  try {
    const crudas = sessionStorage.getItem('recoveryQuestions');
    return crudas ? JSON.parse(crudas) : [];
  } catch {
    return [];
  }
}

export function SecurityQuestionsView() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  const mode = useSyncExternalStore(
    subscribeToSessionStorage,
    getModeSnapshot,
    getModeServerSnapshot,
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(3).fill(''));
  const [errors, setErrors] = useState<{ question?: string; answer?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Modo verify (recuperación de contraseña). Se derivan del modo en vez de
  // copiarse a estado: mientras `mode` es null (servidor e hidratacion) no se
  // toca sessionStorage, asi que no hay desajuste de hidratacion.
  const questions = useMemo<CatalogQuestion[]>(
    () => (mode === 'verify' ? leerPreguntasGuardadas() : []),
    [mode],
  );

  // Modo setup (primer inicio de sesión / preguntas pendientes)
  const [catalogQuestions, setCatalogQuestions] = useState<CatalogQuestion[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(Array(TOTAL_SETUP_QUESTIONS).fill(''));
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (mode !== 'setup') return;
    authApi.getCatalog()
      .then(setCatalogQuestions)
      .catch(() => setErrors({ general: 'No se pudieron cargar las preguntas de seguridad' }));
  }, [mode]);

  useEffect(() => {
    if (mode === 'setup' && !authLoading && !user) {
      router.push('/login');
    }
  }, [mode, authLoading, user, router]);

  const totalQuestions = mode === 'verify' ? (questions.length || 3) : TOTAL_SETUP_QUESTIONS;

  const validate = (): boolean => {
    const currentAnswer = answers[currentStep];

    if (mode === 'setup' && !selectedKeys[currentStep]) {
      setErrors({ question: 'Selecciona una pregunta' });
      return false;
    }

    if (!currentAnswer.trim()) {
      setErrors((prev) => ({ ...prev, answer: 'La respuesta es requerida' }));
      return false;
    }
    return true;
  };

  const handleSubmitVerify = async (payload: Array<{ key: string; answer: string }>) => {
    setIsLoading(true);
    setErrors({});

    try {
      // El correo solo hace falta aquí, así que se lee directo del storage.
      await authApi.verifyAnswers(sessionStorage.getItem('recoveryEmail') ?? '', payload);
      sessionStorage.setItem('recoveryAnswers', JSON.stringify(payload));
      router.push('/reset-password');
    } catch (error) {
      setErrors({ general: mensajeDeError(error, 'Las respuestas no coinciden. Intenta de nuevo.') });
      setCurrentStep(0);
      setAnswers(Array(totalQuestions).fill(''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSetup = async (payload: Array<{ key: string; answer: string }>) => {
    setIsLoading(true);
    setErrors({});

    try {
      await authApi.setupQuestions(payload);
      setSetupComplete(true);
    } catch (error) {
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      return;
    }

    if (mode === 'verify') {
      const payload = questions.map((q, i) => ({ key: q.key, answer: answers[i] }));
      await handleSubmitVerify(payload);
    } else {
      const payload = selectedKeys.map((key, i) => ({ key, answer: answers[i] }));
      await handleSubmitSetup(payload);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
    setErrors({});
  };

  const handleSelectQuestion = (key: string) => {
    const newSelected = [...selectedKeys];
    newSelected[currentStep] = key;
    setSelectedKeys(newSelected);
    setErrors({});
  };

  if (mode === null || (mode === 'setup' && (authLoading || !user))) {
    return null;
  }

  if (setupComplete) {
    return (
      <AuthSuccessScreen
        title="¡Preguntas de seguridad configuradas!"
        subtitle="Tu cuenta ya es segura."
        hint="Vuelve a iniciar sesión para continuar a la intranet."
      />
    );
  }

  return (
    <div className="login-page">
      {/* Panel izquierdo — Branding institucional con logo blanco de la intranet */}
      <div className="login-left">
        <div className="login-left-content">
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

      {/* Panel derecho — Card con la misma estructura y estilos del Sitio Web */}
      <div className="login-right">
        <div
          key={currentStep}
          className="w-full max-w-[380px] rounded-[24px] bg-white px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10"
        >
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="text-[19px] font-bold leading-snug text-[#0d1526]">
              {mode === 'setup' ? 'Protege el acceso a tu cuenta' : 'Verifica tu identidad'}
            </h2>
            <p className="mb-6 mt-1.5 text-[13px] leading-relaxed text-gray-500">
              {mode === 'setup'
                ? 'Elige 3 preguntas de seguridad y asigna una respuesta para cada una.'
                : `Responde las ${totalQuestions} preguntas que elegiste al configurar tu cuenta.`}
            </p>

            {errors.general && (
              <div
                className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            {mode === 'verify' ? (
              <div className="mb-5">
                <label htmlFor="respuesta-seguridad" className="mb-1.5 block text-sm font-semibold text-[#0d1526]">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pregunta {currentStep + 1} de {totalQuestions}
                  </span>
                  {questions[currentStep]?.label}
                </label>
                <input
                  id="respuesta-seguridad"
                  type="text"
                  value={answers[currentStep]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoFocus
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.answer
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                  }`}
                />
                {errors.answer && <p className="mt-1 text-xs text-red-600">{errors.answer}</p>}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="select-pregunta" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pregunta {currentStep + 1} de {totalQuestions}
                  </label>
                  <div className="relative">
                    <select
                      id="select-pregunta"
                      className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
                        errors.question
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                      }`}
                      value={selectedKeys[currentStep] || ''}
                      onChange={(e) => handleSelectQuestion(e.target.value)}
                    >
                      <option value="" disabled>Selecciona una opción...</option>
                      {catalogQuestions.map((q) => (
                        <option
                          key={q.key}
                          value={q.key}
                          disabled={selectedKeys.includes(q.key) && selectedKeys[currentStep] !== q.key}
                        >
                          {q.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  {errors.question && <p className="mt-1 text-xs text-red-600">{errors.question}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="respuesta-setup" className="mb-1.5 block text-sm font-semibold text-[#0d1526]">
                    Tu respuesta
                  </label>
                  <input
                    id="respuesta-setup"
                    type="text"
                    maxLength={255}
                    placeholder="Escribe tu respuesta..."
                    value={answers[currentStep]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.answer
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
                    }`}
                  />
                  {errors.answer && <p className="mt-1 text-xs text-red-600">{errors.answer}</p>}
                </div>
              </>
            )}

            {/* Indicador de progreso (Progress Dots) exactamente como en Sitio Web */}
            <div className="mb-5 flex justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep
                      ? 'w-6 bg-[#0d1526]'
                      : i < currentStep
                        ? 'w-1.5 bg-[#0d1526]/45'
                        : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? (mode === 'verify' ? 'Verificando…' : 'Guardando…')
                : currentStep === totalQuestions - 1
                  ? (mode === 'verify' ? 'Verificar' : 'Guardar')
                  : 'Siguiente'}
            </button>

            {currentStep > 0 ? (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((n) => Math.max(0, n - 1));
                    setErrors({});
                  }}
                  className="rounded text-xs text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
                >
                  Volver a la pregunta anterior
                </button>
              </div>
            ) : mode === 'setup' ? (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded text-xs text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
                >
                  Iniciar sesión
                </button>
              </div>
            ) : null}
          </form>
        </div>

        <ReturnToSiteLink classPrefix="login" cerrarSesion={mode === 'setup'} />
      </div>
    </div>
  );
}
