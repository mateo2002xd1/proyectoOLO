'use client';

import { useState, FormEvent, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, useAuth } from '@/features/login';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { QuestionPicker, type CatalogQuestion } from './question-picker';
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
    <div className="sq-page">
      {/* Panel izquierdo — Branding */}
      <div className="sq-left">
        <div className="sq-left-content">
          <h1 className="sq-brand-title">
            {mode === 'setup' ? 'Protege el acceso a tu cuenta' : 'Por tu seguridad...'}
          </h1>
          <p className="sq-brand-subtitle">
            {mode === 'setup'
              ? 'Elige 3 preguntas de seguridad de la lista y asigna una respuesta para cada una.'
              : 'Responde correctamente a las 3 preguntas.'}
          </p>
          {mode === 'verify' && (
            <p className="sq-brand-hint">
              Recuerda que las respuestas deben coincidir exactamente con las que asignaste la primera vez.
            </p>
          )}
        </div>
      </div>

      {/* Panel derecho — Card */}
      <div className="sq-right">
        <div className="sq-card" key={currentStep}>
          <form onSubmit={handleSubmit} className="sq-form">
            <h2 className="sq-card-title">
              {mode === 'setup' ? 'Escoge tus preguntas y respuestas' : 'Responde tus preguntas'}
            </h2>

            {mode === 'verify' ? (
              <>
                <div className="sq-field">
                  <label className="sq-label-question">
                    {questions[currentStep]?.label}
                  </label>
                  <input
                    type="text"
                    placeholder="Respuesta"
                    value={answers[currentStep]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className={`sq-input ${errors.answer ? 'sq-input-error' : ''}`}
                    autoFocus
                  />
                  {errors.answer && <span className="sq-error">{errors.answer}</span>}
                </div>

                <div className="sq-progress">
                  {Array.from({ length: totalQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`sq-progress-dot ${i === currentStep ? 'sq-progress-active' : ''} ${i < currentStep ? 'sq-progress-done' : ''}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <QuestionPicker
                classPrefix="sq"
                catalogQuestions={catalogQuestions}
                totalQuestions={totalQuestions}
                currentIndex={currentStep}
                selectedKeys={selectedKeys}
                answers={answers}
                errors={errors}
                onSelectQuestion={handleSelectQuestion}
                onAnswerChange={handleAnswerChange}
              />
            )}

            {errors.general && (
              <div className="sq-general-error">{errors.general}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`sq-submit ${isLoading ? 'sq-submit-disabled' : ''}`}
            >
              {isLoading
                ? (mode === 'verify' ? 'Verificando...' : 'Guardando...')
                : currentStep === totalQuestions - 1
                  ? (mode === 'verify' ? 'Verificar respuestas' : 'Guardar')
                  : 'Continuar'}
            </button>

            <button type="button" onClick={() => logout()} className="sq-login-link">
              Iniciar sesión
            </button>
          </form>
        </div>

        <ReturnToSiteLink classPrefix="sq" cerrarSesion={mode === 'setup'} />
      </div>
    </div>
  );
}
