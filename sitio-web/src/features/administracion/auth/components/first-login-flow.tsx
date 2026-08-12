'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/atoms/button';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import {
  AuthGeneralError,
  PasswordField,
  PasswordRequisitos,
  authCardClass,
  authErrorTextClass,
  authInputClass,
  authLabelClass,
} from './auth-ui';

const TOTAL_QUESTIONS = 3;

type CatalogQuestion = { key: string; label: string };

interface FirstLoginFlowProps {
  /** Nombre del usuario para el saludo del panel izquierdo. */
  name?: string;
}

/* ---------- Puntos de progreso ---------- */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-[18px] mt-1 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`size-2 rounded-full transition-colors ${
            // Indicador de estado: usa el token interactivo para que el paso
            // actual se distinga del pendiente (SC 1.4.11).
            i === current
              ? 'bg-brand-interactive'
              : i < current
                ? 'bg-brand-interactive/50'
                : 'bg-gray-300'
            }`}
        />
      ))}
    </div>
  );
}

/**
 * Qué le falta a la cuenta. `null` mientras se consulta.
 *
 * Lo dice el servidor, no el formulario: un administrador puede restablecer solo las
 * preguntas, solo la contraseña, o las dos cosas, y cada combinación pide una
 * pantalla distinta.
 */
type Pendiente = { debeCambiarPassword: boolean; debeConfigurarPreguntas: boolean };

export function FirstLoginFlow({ name }: FirstLoginFlowProps) {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Paso 1 — contraseñas
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Paso 2 — preguntas de seguridad
  const [selectedKeys, setSelectedKeys] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));
  const [answers, setAnswers] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));
  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/security-questions/catalog')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setCatalog(Array.isArray(data) ? data : data?.questions ?? []))
      .catch(() => setErrors({ general: 'No se pudieron cargar las preguntas de seguridad' }));
  }, []);

  // Qué falta de verdad. Se pregunta a la base en vez de mirar las cookies de sesión,
  // que se escriben al iniciar sesión y no reflejan lo hecho después.
  useEffect(() => {
    fetch('/api/auth/first-login/status')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Pendiente) => {
        setPendiente(data);
        // Si la contraseña ya está cambiada, el paso 1 no tiene nada que pedir: no
        // hay contraseña temporal que verificar y obligar a cambiarla otra vez sería
        // justo el fallo que esto arregla.
        if (!data.debeCambiarPassword) setStep(2);
      })
      .catch(() =>
        setErrors({ general: 'No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión.' })
      );
  }, []);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    // La temporal se *comprueba*, no se elige: la emitió el sistema y ya cumple la
    // política. Medirla contra §1 aquí solo podría rechazar una clave válida.
    if (!tempPassword) e.tempPassword = 'La contraseña temporal es requerida';
    if (!newPassword) e.newPassword = 'El nuevo passcode es requerido';
    else if (!cumplePolitica(newPassword)) e.newPassword = primerFallo(newPassword) ?? '';
    if (!confirmPassword) e.confirmPassword = 'Confirma tu passcode';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Los passcodes no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateQuestion = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedKeys[currentQuestion]) e.question = 'Selecciona una pregunta';
    if (!answers[currentQuestion].trim()) e.answer = 'La respuesta es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * Envía lo pendiente.
   *
   * Se manda siempre el cuerpo completo; el servidor usa solo lo que corresponda
   * según lo que la cuenta tenga pendiente e ignora el resto. Los campos que no
   * aplican van vacíos porque su paso ni siquiera se pintó.
   */
  const enviar = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/first-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempPassword,
          newPassword,
          securityQuestions: selectedKeys.map((key, i) => ({ key, answer: answers[i] })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrors({ general: data?.error || 'No se pudo completar la configuración' });
        return;
      }
      setStep(3);
    } catch {
      setErrors({ general: 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1 = async () => {
    if (!validateStep1()) return;
    setErrors({});

    // Si las preguntas ya están configuradas, no hay segundo paso que dar.
    if (!pendiente?.debeConfigurarPreguntas) {
      await enviar();
      return;
    }
    setStep(2);
  };

  const handleQuestionNext = async () => {
    if (!validateQuestion()) return;
    setErrors({});
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion((q) => q + 1);
      return;
    }
    await enviar();
  };

  const leftContent =
    step === 1
      ? {
        title: `Hola ${name ? name.split(' ')[0] : ''}, actualiza tu seguridad.`,
        subtitle:
          'Has ingresado con un código temporal. Por tu seguridad, crea un nuevo código de acceso personal y privado que solo tú conozcas.',
      }
      : step === 2
        ? {
          title: 'Protege el acceso a tu cuenta',
          // El texto cambia según por qué se está aquí: a quien solo le restablecieron
          // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez.
          subtitle: pendiente?.debeCambiarPassword
            ? 'Elige 3 preguntas de seguridad y asigna una respuesta para cada una. Nos servirán para verificar tu identidad si necesitas recuperar tu cuenta.'
            : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta para cada una; tu contraseña actual no cambia.',
        }
        : null;

  /* ---------- Mientras se sabe qué falta ---------- */
  if (!pendiente) {
    return (
      <div className={`${authCardClass} text-center`}>
        {errors.general ? (
          <>
            <AuthGeneralError>{errors.general}</AuthGeneralError>
            <Link href="/admin/login" className="text-sm text-brand-blue-dark hover:underline">
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-slate-400">Comprobando tu cuenta…</p>
        )}
      </div>
    );
  }

  /* ---------- Nada pendiente ---------- */
  // Puede pasar si alguien llega a esta pantalla por la URL, o si completó la
  // configuración en otra pestaña. Antes el formulario se pintaba igual y pedía una
  // contraseña temporal que ya no existía.
  if (!pendiente.debeCambiarPassword && !pendiente.debeConfigurarPreguntas && step !== 3) {
    return (
      <div className={`${authCardClass} text-center`}>
        <h1 className="mb-2 text-[22px] font-bold text-gray-900 dark:text-[#f6f6f6]">
          Tu cuenta ya está configurada
        </h1>
        <p className="mb-6 text-[13px] leading-normal text-gray-500 dark:text-slate-400">
          No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día.
        </p>
        <Link
          href="/admin/dashboard"
          className="block rounded-xl bg-brand-interactive px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus"
        >
          Ir al panel
        </Link>
      </div>
    );
  }

  /* ---------- Paso 3: éxito ---------- */
  if (step === 3) {
    return (
      <div className={`${authCardClass} text-center`}>
        <h1 className="mb-2 text-[22px] font-bold text-gray-900">¡Configuración completada!</h1>
        <p className="mb-3 text-[15px] text-gray-600">Tu cuenta ya es segura.</p>
        {/* El aviso sobre las respuestas solo tiene sentido si se acaban de elegir. */}
        {pendiente.debeConfigurarPreguntas && (
          <p className="mb-6 text-[13px] leading-normal text-gray-500">
            Guarda tus respuestas en un lugar seguro: serán el único método para validar tu identidad si
            olvidas tu clave en el futuro.
          </p>
        )}
        <Link
          href="/admin/login"
          className="block rounded-xl bg-brand-interactive px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] transition hover:bg-brand-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {leftContent && (
        <div className="max-w-[400px] text-center">
          <h1 className="mb-1.5 text-xl font-bold text-gray-900">{leftContent.title}</h1>
          <p className="text-[13px] leading-normal text-gray-500">{leftContent.subtitle}</p>
        </div>
      )}

      {/* Paso 1 — contraseñas */}
      {step === 1 && (
        <div className={authCardClass}>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleStep1(); }} noValidate>
            {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}
            <PasswordField
              id="temp-password"
              label="Contraseña temporal"
              placeholder="Tu contraseña temporal"
              value={tempPassword}
              onChange={(v) => { setTempPassword(v); setErrors({}); }}
              error={errors.tempPassword}
            />
            <PasswordField
              id="new-password"
              label="Nuevo passcode"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setErrors({}); }}
              error={errors.newPassword}
              className="mb-2"
            />
            <PasswordRequisitos password={newPassword} />
            <PasswordField
              id="confirm-password"
              label="Ingresa nuevamente el passcode"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirmPassword}
            />
            <Button type="submit" variant="success" className="w-full">
              Continuar
            </Button>
          </form>
        </div>
      )}

      {/* Paso 2 — preguntas de seguridad */}
      {step === 2 && (
        <div className={authCardClass}>
          <form
            onSubmit={(e: FormEvent) => { e.preventDefault(); handleQuestionNext(); }}
            noValidate
          >
            <p className="mb-4 text-base font-semibold text-gray-900">
              Escoge tus preguntas y respuestas
            </p>

            <div className="mb-4">
              <label htmlFor="security-question" className={authLabelClass}>
                Pregunta {currentQuestion + 1} de {TOTAL_QUESTIONS}
              </label>
              <select
                id="security-question"
                value={selectedKeys[currentQuestion] || ''}
                onChange={(e) => {
                  const next = [...selectedKeys];
                  next[currentQuestion] = e.target.value;
                  setSelectedKeys(next);
                  setErrors({});
                }}
                className={`${authInputClass(!!errors.question)} appearance-auto`}
              >
                <option value="" disabled>Selecciona una opción...</option>
                {catalog.map((q) => (
                  <option
                    key={q.key}
                    value={q.key}
                    disabled={selectedKeys.includes(q.key) && selectedKeys[currentQuestion] !== q.key}
                  >
                    {q.label}
                  </option>
                ))}
              </select>
              {errors.question && <p className={authErrorTextClass}>{errors.question}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="security-answer" className={authLabelClass}>Respuesta</label>
              <input
                id="security-answer"
                type="text"
                placeholder="Tu respuesta"
                value={answers[currentQuestion]}
                onChange={(e) => {
                  const next = [...answers];
                  next[currentQuestion] = e.target.value;
                  setAnswers(next);
                  setErrors({});
                }}
                className={authInputClass(!!errors.answer)}
              />
              {errors.answer && <p className={authErrorTextClass}>{errors.answer}</p>}
            </div>

            <ProgressDots total={TOTAL_QUESTIONS} current={currentQuestion} />

            {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

            <div className="flex gap-2.5">
              {currentQuestion > 0 && (
                <Button
                  type="button"
                  plain
                  onClick={() => { setCurrentQuestion((q) => q - 1); setErrors({}); }}
                  className="shrink-0"
                >
                  Atrás
                </Button>
              )}
              <Button type="submit" variant="success" disabled={isLoading} className="flex-1">
                {isLoading
                  ? 'Guardando...'
                  : currentQuestion === TOTAL_QUESTIONS - 1
                    ? 'Guardar'
                    : 'Continuar'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
