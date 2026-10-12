'use client';

import { useState, FormEvent, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import { BarrasDeAvance } from './barras-de-avance';
import {
  accesoBotonClass,
  accesoBotonEnBlancoClass,
  accesoCampoClass,
  accesoCampoEnBlancoClass,
  accesoEnlaceClass,
  accesoEnlaceEnBlancoClass,
  accesoErrorClass,
  accesoErrorEnBlancoClass,
  accesoErrorGeneralClass,
  accesoHuecoArribaClass,
  accesoHuecoClass,
  accesoEtiquetaClass,
  accesoEtiquetaEnBlancoClass,
  accesoIconoCampoClass,
  accesoOpcionesClass,
  accesoRotuloClass,
  accesoRotuloEnBlancoClass,
  accesoTarjetaBlancaClass,
} from './acceso-ui';
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
      const respuesta = await authApi.verifyAnswers(sessionStorage.getItem('recoveryEmail') ?? '', payload);
      sessionStorage.setItem('recoveryAnswers', JSON.stringify(payload));
      // El primer nombre que da el servidor, para el saludo de la nueva contraseña
      // («¡Enhorabuena, <nombre>!»), como en el sitio web.
      const nombre = typeof respuesta?.nombre === 'string' ? respuesta.nombre.trim() : '';
      if (nombre) sessionStorage.setItem('recoveryName', nombre);
      else sessionStorage.removeItem('recoveryName');
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

  // Verificar la identidad (la recuperación) va en tarjeta blanca desde `md`, como el login
  // (2026-10-12). Las preguntas pendientes (`setup`) siguen sobre el azul.
  const enBlanco = mode === 'verify';
  const botonClass = enBlanco ? `${accesoBotonClass} ${accesoBotonEnBlancoClass}` : accesoBotonClass;
  const enlaceClass = enBlanco ? `${accesoEnlaceClass} ${accesoEnlaceEnBlancoClass}` : accesoEnlaceClass;

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
    <MarcoAcceso
      titulo={mode === 'setup' ? 'Protege el acceso a tu cuenta' : 'Verifica tu identidad'}
      descripcion={
        mode === 'setup'
          ? 'Elige 3 preguntas de seguridad y asigna una respuesta para cada una.'
          : 'Responde las preguntas de seguridad que elegiste al configurar tu cuenta.'
      }
      cerrarSesionAlSalir={mode === 'setup'}
      claveTarjeta={currentStep}
      claseTarjeta={enBlanco ? accesoTarjetaBlancaClass : ''}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div
            className={accesoErrorGeneralClass}
            role="alert"
          >
            {errors.general}
          </div>
        )}

        {mode === 'verify' ? (
          <div className={accesoHuecoClass}>
            <label htmlFor="respuesta-seguridad" className={`${accesoEtiquetaClass} ${accesoEtiquetaEnBlancoClass}`}>
              <span className={`mb-1 ${accesoRotuloClass} ${accesoRotuloEnBlancoClass}`}>
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
              className={accesoCampoClass(!!errors.answer, accesoCampoEnBlancoClass(!!errors.answer))}
            />
            {errors.answer && <p className={`${accesoErrorClass} ${accesoErrorEnBlancoClass}`}>{errors.answer}</p>}
          </div>
        ) : (
          <>
            <div className={accesoHuecoClass}>
              <label htmlFor="select-pregunta" className={`mb-1.5 ${accesoRotuloClass}`}>
                Pregunta {currentStep + 1} de {totalQuestions}
              </label>
              <div className="relative">
                <select
                  id="select-pregunta"
                  className={accesoCampoClass(!!errors.question, `appearance-none pr-10 ${accesoOpcionesClass}`, 'rounded-[16px]')}
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
                <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${accesoIconoCampoClass}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              {errors.question && <p className={accesoErrorClass}>{errors.question}</p>}
            </div>

            <div className={accesoHuecoClass}>
              <label htmlFor="respuesta-setup" className={accesoEtiquetaClass}>
                Tu respuesta
              </label>
              <input
                id="respuesta-setup"
                type="text"
                maxLength={255}
                placeholder="Escribe tu respuesta..."
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className={accesoCampoClass(!!errors.answer)}
              />
              {errors.answer && <p className={accesoErrorClass}>{errors.answer}</p>}
            </div>
          </>
        )}

        <BarrasDeAvance total={totalQuestions} actual={currentStep} variante="puntos" enBlanco={enBlanco} />

        <button
          type="submit"
          disabled={isLoading}
          className={botonClass}
        >
          {isLoading
            ? (mode === 'verify' ? 'Verificando…' : 'Guardando…')
            : currentStep === totalQuestions - 1
              ? (mode === 'verify' ? 'Verificar' : 'Guardar')
              : 'Siguiente'}
        </button>

        {currentStep > 0 ? (
          <div className={`${accesoHuecoArribaClass} text-center`}>
            <button
              type="button"
              onClick={() => {
                setCurrentStep((n) => Math.max(0, n - 1));
                setErrors({});
              }}
              className={enlaceClass}
            >
              Volver a la pregunta anterior
            </button>
          </div>
        ) : mode === 'setup' ? (
          <div className={`${accesoHuecoArribaClass} text-center`}>
            <button
              type="button"
              onClick={() => logout()}
              className={accesoEnlaceClass}
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          // En la recuperación no hay sesión que cerrar: se vuelve al login, como desde
          // el paso del correo (`recovery-view.tsx`).
          <div className={`${accesoHuecoArribaClass} text-center`}>
            <Link
              href="/login"
              className={enlaceClass}
            >
              Volver a iniciar sesión
            </Link>
          </div>
        )}
      </form>
    </MarcoAcceso>
  );
}
