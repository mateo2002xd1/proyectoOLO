'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/atoms/button';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import {
  AuthCardTitle,
  AuthGeneralError,
  AuthProgressDots,
  AuthSelectField,
  AuthSuccessBadge,
  AuthTextField,
  PasswordField,
  PasswordRequisitos,
  authNavyActionClass,
  authQuietLinkClass,
  authSolidCardClass,
} from './auth-ui';

/**
 * Configuración obligatoria de primer ingreso: contraseña definitiva y preguntas
 * de seguridad.
 *
 * Se pinta en dos sitios y en los dos va dentro de `AuthSplitShell`: dentro de la
 * pantalla de acceso —cuando el login responde que la cuenta lo debe— y en
 * `/admin/cambiar-contrasena`. Por eso el marco no se monta aquí: lo pone quien
 * llama, y este componente aporta solo la tarjeta.
 */

const TOTAL_QUESTIONS = 3;

type CatalogQuestion = { key: string; label: string };

interface FirstLoginFlowProps {
  /** Nombre del usuario, para saludar en el primer paso. */
  name?: string;
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

  /* ---------- Mientras se sabe qué falta ---------- */
  if (!pendiente) {
    return (
      <div className={`${authSolidCardClass} text-center`}>
        {errors.general ? (
          <>
            <AuthGeneralError>{errors.general}</AuthGeneralError>
            <Link href="/admin/login" className={authQuietLinkClass}>
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <p className="text-sm text-gray-500">Comprobando tu cuenta…</p>
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
      <div className={`${authSolidCardClass} text-center`}>
        <AuthSuccessBadge />
        <AuthCardTitle
          className="mb-6"
          title="Tu cuenta ya está configurada"
          description="No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día."
        />
        <Link href="/admin/dashboard" className={authNavyActionClass}>
          Ir al panel
        </Link>
      </div>
    );
  }

  /* ---------- Paso 3: éxito ---------- */
  if (step === 3) {
    return (
      <div className={`${authSolidCardClass} text-center`}>
        <AuthSuccessBadge />
        <AuthCardTitle
          className="mb-6"
          title="¡Configuración completada!"
          description={
            // El aviso sobre las respuestas solo tiene sentido si se acaban de elegir.
            pendiente.debeConfigurarPreguntas
              ? 'Guarda tus respuestas en un lugar seguro: serán el único método para validar tu identidad si olvidas tu clave en el futuro.'
              : 'Tu cuenta ya es segura.'
          }
        />
        <Link href="/admin/login" className={authNavyActionClass}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  /* ---------- Paso 1 — contraseñas ---------- */
  if (step === 1) {
    return (
      <div className={authSolidCardClass}>
        <AuthCardTitle
          title={name ? `Hola ${name.split(' ')[0]}, actualiza tu seguridad` : 'Actualiza tu seguridad'}
          description="Ingresaste con un código temporal. Crea ahora un passcode personal que solo tú conozcas."
        />

        <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleStep1(); }} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <PasswordField
            id="temp-password"
            label="Contraseña temporal"
            placeholder="Tu contraseña temporal"
            autoComplete="current-password"
            value={tempPassword}
            onChange={(v) => { setTempPassword(v); setErrors({}); }}
            error={errors.tempPassword}
          />
          <PasswordField
            id="new-password"
            label="Nuevo passcode"
            autoComplete="new-password"
            value={newPassword}
            onChange={(v) => { setNewPassword(v); setErrors({}); }}
            error={errors.newPassword}
            className="mb-2"
          />
          <PasswordRequisitos password={newPassword} variant="solid" />
          <PasswordField
            id="confirm-password"
            label="Ingresa nuevamente el passcode"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
            error={errors.confirmPassword}
            className="mb-6"
          />

          <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
            {isLoading ? 'Guardando…' : 'Continuar'}
          </Button>
        </form>
      </div>
    );
  }

  /* ---------- Paso 2 — preguntas de seguridad ---------- */
  return (
    <div className={authSolidCardClass}>
      <AuthCardTitle
        title="Protege el acceso a tu cuenta"
        // El texto cambia según por qué se está aquí: a quien solo le restablecieron
        // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez.
        description={
          pendiente.debeCambiarPassword
            ? 'Elige 3 preguntas y asigna una respuesta a cada una. Con ellas verificaremos tu identidad si algún día necesitas recuperar tu cuenta.'
            : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta a cada una; tu contraseña actual no cambia.'
        }
      />

      <form
        onSubmit={(e: FormEvent) => { e.preventDefault(); handleQuestionNext(); }}
        noValidate
      >
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <AuthSelectField
          id="security-question"
          label={`Pregunta ${currentQuestion + 1} de ${TOTAL_QUESTIONS}`}
          value={selectedKeys[currentQuestion] || ''}
          onChange={(valor) => {
            const next = [...selectedKeys];
            next[currentQuestion] = valor;
            setSelectedKeys(next);
            setErrors({});
          }}
          error={errors.question}
          options={catalog.map((q) => ({
            value: q.key,
            label: q.label,
            // Ya elegida en otro paso: se ve, pero no se puede repetir.
            disabled: selectedKeys.includes(q.key) && selectedKeys[currentQuestion] !== q.key,
          }))}
        />

        <AuthTextField
          id="security-answer"
          label="Respuesta"
          placeholder="Tu respuesta"
          value={answers[currentQuestion]}
          onChange={(valor) => {
            const next = [...answers];
            next[currentQuestion] = valor;
            setAnswers(next);
            setErrors({});
          }}
          error={errors.answer}
          // Se compara en minúsculas y sin espacios en el servidor, así que el
          // autocorrector del móvil solo puede estorbar.
          autoCapitalize="none"
          autoCorrect="off"
          className="mb-5"
        />

        <AuthProgressDots total={TOTAL_QUESTIONS} current={currentQuestion} />

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
          <Button type="submit" variant="navy" disabled={isLoading} className="flex-1">
            {isLoading
              ? 'Guardando…'
              : currentQuestion === TOTAL_QUESTIONS - 1
                ? 'Guardar'
                : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
