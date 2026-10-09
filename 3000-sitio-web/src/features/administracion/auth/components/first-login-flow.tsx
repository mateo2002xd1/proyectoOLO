'use client';

import { useState, useEffect, FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import {
  AuthGeneralError,
  AuthProgressDots,
  AuthSelectField,
  AuthSuccessBadge,
  AuthTextField,
  PasswordField,
  PasswordRequisitos,
  authPasosCardClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
  authPasosSecondaryClass,
} from './auth-ui';
import { MarcoDePasos, type PasosDelMarco } from './marco-de-pasos';
import { useRequisitosAlEnfocar } from '../hooks/use-requisitos-al-enfocar';

/**
 * Configuración obligatoria de primer ingreso: contraseña definitiva y preguntas
 * de seguridad.
 *
 * Vive en `/first-login`. Llegan aquí el login, cuando responde que la cuenta lo
 * debe, y el middleware, que manda a esta ruta a cualquier sesión con algo pendiente.
 * Hasta el 2026-09-18 el login la pintaba dentro de su propia pantalla; ahora es una
 * ruta, como en la intranet.
 *
 * Desde el 2026-10-09 lleva el diseño nuevo (`MarcoDePasos`): el título y lo que se
 * pide en cada paso van fuera de la tarjeta, con el paginador debajo, y la tarjeta
 * solo trae el formulario. Ese mismo día pasó del azul al fondo blanco, como la
 * recuperación.
 */

const TOTAL_QUESTIONS = 3;

type CatalogQuestion = { key: string; label: string };

/**
 * Qué le falta a la cuenta. `null` mientras se consulta.
 *
 * Lo dice el servidor, no el formulario: un administrador puede restablecer solo las
 * preguntas, solo la contraseña, o las dos cosas, y cada combinación pide una
 * pantalla distinta.
 */
type Pendiente = { debeCambiarPassword: boolean; debeConfigurarPreguntas: boolean };

/** Los pasos que puede tener el flujo, en orden. Cuáles salen depende de `Pendiente`. */
type Etapa = 'contrasena' | 'preguntas' | 'listo';
const NOMBRE_DE_ETAPA: Record<Etapa, string> = {
  contrasena: 'Contraseña',
  preguntas: 'Preguntas de seguridad',
  listo: 'Listo',
};
const ETAPA_DEL_PASO: Record<1 | 2 | 3, Etapa> = { 1: 'contrasena', 2: 'preguntas', 3: 'listo' };

const FORM_CONTRASENA = 'form-contrasena';
const FORM_PREGUNTAS = 'form-preguntas';

async function cerrarSesionEIrAlLogin() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Si falla la petición de logout, igualmente se va al login.
  }
  window.location.href = '/login';
}

/**
 * «Iniciar sesión», debajo del botón de la tarjeta, como en el mockup. Cierra la sesión
 * temporal y lleva al login: es la salida para quien entró con otra cuenta o quiere
 * dejarlo para después.
 */
function EnlaceIniciarSesion() {
  return (
    <div className="mt-6 text-center">
      <button type="button" onClick={cerrarSesionEIrAlLogin} className={authPasosQuietLinkClass}>
        Iniciar sesión
      </button>
    </div>
  );
}

export function FirstLoginFlow() {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Paso 1 — contraseñas
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const requisitos = useRequisitosAlEnfocar(newPassword);

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
    if (!newPassword) e.newPassword = 'La nueva contraseña es requerida';
    else if (!cumplePolitica(newPassword)) e.newPassword = primerFallo(newPassword) ?? '';
    if (!confirmPassword) e.confirmPassword = 'Confirma tu contraseña';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
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
      <MarcoDePasos titulo="Configura tu acceso">
        <div className={`${authPasosCardClass} text-center`}>
          {errors.general ? (
            <>
              <AuthGeneralError>{errors.general}</AuthGeneralError>
              <button type="button" onClick={cerrarSesionEIrAlLogin} className={authPasosQuietLinkClass}>
                Volver a iniciar sesión
              </button>
            </>
          ) : (
            <p className="text-base text-[#001a39]" role="status">
              Comprobando tu cuenta…
            </p>
          )}
        </div>
      </MarcoDePasos>
    );
  }

  /* ---------- Nada pendiente ---------- */
  // Puede pasar si alguien llega a esta pantalla por la URL, o si completó la
  // configuración en otra pestaña. Antes el formulario se pintaba igual y pedía una
  // contraseña temporal que ya no existía.
  if (!pendiente.debeCambiarPassword && !pendiente.debeConfigurarPreguntas && step !== 3) {
    return (
      <MarcoDePasos
        titulo="Tu cuenta ya está configurada"
        descripcion="No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día."
      >
        <div className={`${authPasosCardClass} text-center`}>
          <AuthSuccessBadge />
          <Link href="/admin/dashboard" className={authPasosPrimaryClass}>
            Ir al panel
          </Link>
        </div>
      </MarcoDePasos>
    );
  }

  // Los pasos que tiene esta cuenta: el paginador muestra 3 cuando falta todo y 2
  // cuando solo falta la contraseña o solo las preguntas.
  const etapas: Etapa[] = [
    ...(pendiente.debeCambiarPassword ? (['contrasena'] as const) : []),
    ...(pendiente.debeConfigurarPreguntas ? (['preguntas'] as const) : []),
    'listo',
  ];
  const pasos = (formulario?: string): PasosDelMarco => ({
    nombres: etapas.map((e) => NOMBRE_DE_ETAPA[e]),
    actual: etapas.indexOf(ETAPA_DEL_PASO[step]),
    formulario,
    // Solo se vuelve desde las preguntas a la contraseña, que aún no se ha enviado.
    // Terminado, ya no hay nada que corregir.
    volverA:
      step === 2 && pendiente.debeCambiarPassword
        ? (indice) => {
            if (etapas[indice] !== 'contrasena') return;
            setErrors({});
            setStep(1);
          }
        : undefined,
  });

  /* ---------- Paso 3: éxito ---------- */
  if (step === 3) {
    return (
      <MarcoDePasos
        titulo="¡Configuración completada!"
        descripcion={
          // El aviso sobre las respuestas solo tiene sentido si se acaban de elegir.
          pendiente.debeConfigurarPreguntas
            ? 'Guarda tus respuestas en un lugar seguro: serán el único método para validar tu identidad si olvidas tu clave en el futuro.'
            : 'Tu cuenta ya es segura.'
        }
        pasos={pasos()}
      >
        <div className={`${authPasosCardClass} text-center`}>
          <AuthSuccessBadge />
          <p className="mb-6 text-base text-[#001a39]">Vuelve a iniciar sesión para entrar al panel.</p>
          <button type="button" onClick={cerrarSesionEIrAlLogin} className={authPasosPrimaryClass}>
            Iniciar sesión
          </button>
        </div>
      </MarcoDePasos>
    );
  }

  /* ---------- Paso 1 — contraseñas ---------- */
  if (step === 1) {
    return (
      <MarcoDePasos
        titulo="Actualiza tu seguridad"
        descripcion="Has ingresado con una contraseña temporal. Por tu seguridad, es necesario que crees una contraseña personal y privada que solo tú conozcas."
        pasos={pasos(FORM_CONTRASENA)}
      >
        <Tarjeta>
          <form id={FORM_CONTRASENA} onSubmit={(e: FormEvent) => { e.preventDefault(); handleStep1(); }} noValidate>
            {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

            <PasswordField
              id="temp-password"
              label="Contraseña temporal"
              // La da el administrador al crear o restablecer la cuenta; no llega por correo.
              placeholder="La que te entregaron"
              autoComplete="current-password"
              value={tempPassword}
              onChange={(v) => { setTempPassword(v); setErrors({}); }}
              error={errors.tempPassword}
              className="mb-6"
            />
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              autoComplete="new-password"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setErrors({}); }}
              onFocus={requisitos.alEnfocar}
              describedBy={requisitos.visibles ? 'requisitos-contrasena' : undefined}
              error={errors.newPassword}
              className={requisitos.visibles ? 'mb-3' : 'mb-6'}
            />
            {requisitos.visibles && (
              <PasswordRequisitos
                id="requisitos-contrasena"
                password={newPassword}
                variant="solid"
                className="mb-6"
              />
            )}
            <PasswordField
              id="confirm-password"
              label="Ingresa nuevamente la contraseña"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirmPassword}
              className="mb-6"
            />

            <button type="submit" disabled={isLoading} className={authPasosPrimaryClass}>
              {isLoading ? 'Guardando…' : 'Continuar'}
            </button>
          </form>
          <EnlaceIniciarSesion />
        </Tarjeta>
      </MarcoDePasos>
    );
  }

  /* ---------- Paso 2 — preguntas de seguridad ---------- */
  return (
    <MarcoDePasos
      titulo="Protege el acceso a tu cuenta"
      // El texto cambia según por qué se está aquí: a quien solo le restablecieron
      // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez.
      descripcion={
        pendiente.debeCambiarPassword
          ? 'Elige 3 preguntas y asigna una respuesta a cada una. Con ellas verificaremos tu identidad si algún día necesitas recuperar tu cuenta.'
          : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta a cada una; tu contraseña actual no cambia.'
      }
      pasos={pasos(FORM_PREGUNTAS)}
    >
      <Tarjeta>
        <form id={FORM_PREGUNTAS} onSubmit={(e: FormEvent) => { e.preventDefault(); handleQuestionNext(); }} noValidate>
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
            className="mb-6"
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
            className="mb-6"
          />

          <AuthProgressDots total={TOTAL_QUESTIONS} current={currentQuestion} className="mb-6" />

          <div className="flex gap-2.5">
            {currentQuestion > 0 && (
              <button
                type="button"
                onClick={() => { setCurrentQuestion((q) => q - 1); setErrors({}); }}
                className={`${authPasosSecondaryClass} shrink-0`}
              >
                Atrás
              </button>
            )}
            <button type="submit" disabled={isLoading} className={`${authPasosPrimaryClass} flex-1`}>
              {isLoading
                ? 'Guardando…'
                : currentQuestion === TOTAL_QUESTIONS - 1
                  ? 'Guardar'
                  : 'Continuar'}
            </button>
          </div>
        </form>
        <EnlaceIniciarSesion />
      </Tarjeta>
    </MarcoDePasos>
  );
}

function Tarjeta({ children }: { children: ReactNode }) {
  return <div className={authPasosCardClass}>{children}</div>;
}
