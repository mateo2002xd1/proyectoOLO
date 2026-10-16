'use client';

import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  RUTAS_DEL_PRIMER_INGRESO,
  modoDelPrimerIngreso,
  type ModoPrimerIngreso,
  type Pendiente,
} from '@/shared/lib/ruta-del-primer-ingreso';
import {
  cumplePolitica,
  esPasswordRepetida,
  MENSAJE_PASSWORD_REPETIDA,
  primerFallo,
  repiteLaPassword,
} from '@olo/password-policy';
import {
  AuthGeneralError,
  AuthProgressDots,
  AuthSelectField,
  AuthTextField,
  PasswordField,
  PasswordRequisitos,
  authPasosCardClass,
  authPasosCardHeadingClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
  authPasosSecondaryClass,
  authPasosHuecoClass,
  authPasosHuecoArribaClass,
} from './auth-ui';
import { DescripcionEnTarjeta, MarcoDePasos } from './marco-de-pasos';
import { useRequisitosAlEnfocar } from '../hooks/use-requisitos-al-enfocar';

/**
 * Configuración obligatoria de primer ingreso: contraseña definitiva y preguntas
 * de seguridad.
 *
 * Vive en tres direcciones, una por caso, como en la intranet (2026-10-15):
 * `/login/first-login` (cuenta nueva), `/login/first-login/security-questions` (solo
 * faltan las preguntas) y `/login/first-login/change-password` (solo falta la
 * contraseña). Cada página le dice su `modo`; la pantalla es la misma y lo que pide lo
 * decide el servidor. Si la dirección no es la del caso (alguien la escribió a mano, o
 * la cuenta cambió desde otra pestaña), se corrige sola. Llegan aquí el login y el proxy,
 * que mandan a la dirección del caso (`rutaDelPrimerIngreso`). Hasta el 2026-09-18 el
 * login la pintaba dentro de su propia pantalla.
 *
 * Desde el 2026-10-09 lleva el diseño nuevo (`MarcoDePasos`): el título y lo que se
 * pide en cada paso van fuera de la tarjeta (con un paginador debajo hasta el 2026-10-11), y la tarjeta
 * solo trae el formulario. Ese mismo día pasó del azul al fondo blanco, como la
 * recuperación.
 */

const TOTAL_QUESTIONS = 3;

type CatalogQuestion = { key: string; label: string };

// Qué le falta a la cuenta (`Pendiente`, en `ruta-del-primer-ingreso.ts`). Lo dice el
// servidor, no el formulario: un administrador puede restablecer solo las preguntas, solo
// la contraseña, o las dos cosas, y cada combinación pide una pantalla distinta.

async function cerrarSesionEIrAlLogin() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Si falla la petición de logout, igualmente se va al login.
  }
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa a propósito: tras cerrar sesión no debe quedar nada de ella en la caché del cliente
  window.location.href = '/login';
}

export function FirstLoginFlow({ modo }: { modo: ModoPrimerIngreso }) {
  const router = useRouter();
  /** Qué le falta a la cuenta. `null` mientras se consulta. */
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
  // Rechazada aunque cumple todos los requisitos (repite la temporal, la actual o la
  // anterior): el aviso rojo va en el lugar de «Cumple todos los requisitos».
  const rechazoDeLaNueva = errors.newPassword && cumplePolitica(newPassword) ? errors.newPassword : undefined;
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
        // La dirección tiene que decir el caso de verdad: si no, a la del caso. Sin nada
        // pendiente se queda donde está, que ya sabe decirlo.
        const caso = modoDelPrimerIngreso(data);
        if (caso && caso !== modo) router.replace(RUTAS_DEL_PRIMER_INGRESO[caso]);
        setPendiente(data);
        // Si la contraseña ya está cambiada, el paso 1 no tiene nada que pedir: no
        // hay contraseña temporal que verificar y obligar a cambiarla otra vez sería
        // justo el fallo que esto arregla.
        if (!data.debeCambiarPassword) setStep(2);
      })
      .catch(() =>
        setErrors({ general: 'No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión.' })
      );
  }, [modo, router]);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    // La temporal se *comprueba*, no se elige: la emitió el sistema y ya cumple la
    // política. Medirla contra §1 aquí solo podría rechazar una clave válida.
    if (!tempPassword) e.tempPassword = 'La contraseña temporal es requerida';
    if (!newPassword) e.newPassword = 'La nueva contraseña es requerida';
    else if (!cumplePolitica(newPassword)) e.newPassword = primerFallo(newPassword) ?? '';
    // Igual a la temporal que acaba de escribir: se avisa aquí y no al final, después de las
    // preguntas (2026-10-15). La anterior a la temporal solo la sabe el servidor.
    else if (repiteLaPassword(newPassword, tempPassword)) e.newPassword = MENSAJE_PASSWORD_REPETIDA;
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
        // Repite la temporal o la que tenía antes: se vuelve al paso de la contraseña con
        // el aviso en el campo de la nueva y su borde rojo (pedido del usuario,
        // 2026-10-15). Las respuestas ya escritas se conservan.
        if (esPasswordRepetida(data)) {
          setStep(1);
          setErrors({ newPassword: data.error });
          return;
        }
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
      <MarcoDePasos cerrarSesionAlSalir titulo="Configura tu acceso">
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
    // Texto del usuario (2026-10-11); antes «Tu cuenta ya está configurada» y «No hay nada
    // pendiente: tu contraseña y tus preguntas de seguridad están al día.». Desde la tablet va
    // dentro de la tarjeta, encima del botón; en el móvil, bajo el título.
    const aviso = [
      'Tu cuenta ya es segura.',
      'Guarda tus respuestas en un lugar seguro, las usarás para validar tu identidad y restablecer tu clave si la olvidas.',
    ];
    return (
      <MarcoDePasos
        cerrarSesionAlSalir
        titulo="¡Configuración completada con éxito!"
        descripcion={aviso}
        descripcionEnTarjeta
      >
        <div className={`${authPasosCardClass} text-center`}>
          <DescripcionEnTarjeta descripcion={aviso} />
          {/* Cierra la sesión y va al login, como el botón del paso 3 y la intranet. Hasta el
              2026-10-11 decía «Ir al panel» y era un enlace a `/admin/dashboard`; al renombrarlo
              «Iniciar sesión» siguió llevando al panel. */}
          <button type="button" onClick={cerrarSesionEIrAlLogin} className={authPasosPrimaryClass}>
            Iniciar sesión
          </button>
        </div>
      </MarcoDePasos>
    );
  }

  // Sin el paginador «← Anterior 1 2 3 Siguiente →» bajo el texto: lo quitó el usuario el
  // 2026-10-11. Se avanza con el botón del formulario; «Atrás» mueve entre preguntas.

  /* ---------- Paso 3: éxito ---------- */
  if (step === 3) {
    // Texto del usuario (2026-10-11). Desde la tablet va dentro de la tarjeta, encima del
    // botón; en el móvil, bajo el título. El aviso sobre las respuestas solo tiene sentido si
    // se acaban de elegir: a quien solo cambió la contraseña le queda la primera frase.
    const aviso = [
      'Tu cuenta ya es segura.',
      ...(pendiente.debeConfigurarPreguntas
        ? ['Guarda tus respuestas en un lugar seguro, las usarás para validar tu identidad y restablecer tu clave si la olvidas.']
        : []),
    ];
    return (
      <MarcoDePasos
        cerrarSesionAlSalir
        titulo="¡Configuración completada con éxito!"
        descripcion={aviso}
        descripcionEnTarjeta
      >
        <div className={`${authPasosCardClass} text-center`}>
          <DescripcionEnTarjeta descripcion={aviso} />
          <p className={`${authPasosHuecoClass} text-base text-[#001a39]`}>Vuelve a iniciar sesión para entrar a la intranet.</p>
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
        cerrarSesionAlSalir
        titulo="Actualiza tu seguridad"
        // Acortado el 2026-10-10 para que el paso quepa sin scroll en el móvil; antes decía «es
        // necesario que crees una contraseña personal y privada que solo tú conozcas».
        descripcion="Has ingresado con una contraseña temporal. Por tu seguridad, crea una contraseña personal que solo tú conozcas."
      >
        <Tarjeta>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleStep1(); }} noValidate>
            {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

            <PasswordField
              id="temp-password"
              label="Contraseña temporal"
              // La da el administrador al crear o restablecer la cuenta; no llega por correo.
              placeholder="Ingresar contraseña"
              autoComplete="current-password"
              value={tempPassword}
              onChange={(v) => { setTempPassword(v); setErrors({}); }}
              error={errors.tempPassword}
              className={authPasosHuecoClass}
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
              textoDeErrorAparte={Boolean(rechazoDeLaNueva) && requisitos.visibles}
              className={requisitos.visibles ? 'mb-2 md:mb-3' : authPasosHuecoClass}
            />
            {requisitos.visibles && (
              <PasswordRequisitos
                id="requisitos-contrasena"
                password={newPassword}
                variant="solid"
                resumirAlCumplir
                rechazo={rechazoDeLaNueva}
                className={authPasosHuecoClass}
              />
            )}
            <PasswordField
              id="confirm-password"
              label="Ingresa nuevamente la contraseña"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirmPassword}
              className={authPasosHuecoClass}
            />

            <button type="submit" disabled={isLoading} className={authPasosPrimaryClass}>
              {isLoading ? 'Guardando…' : 'Continuar'}
            </button>
          </form>
        </Tarjeta>
      </MarcoDePasos>
    );
  }

  /* ---------- Paso 2 — preguntas de seguridad ---------- */
  return (
    <MarcoDePasos
      cerrarSesionAlSalir
      titulo="Protege el acceso a tu cuenta"
      // El texto cambia según por qué se está aquí: a quien solo le restablecieron
      // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez.
      descripcion={
        pendiente.debeCambiarPassword
          ? 'Elige 3 preguntas y responde cada una. Con ellas verificaremos tu identidad si necesitas recuperar tu cuenta.'
          : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta a cada una; tu contraseña actual no cambia.'
      }
    >
      <Tarjeta>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleQuestionNext(); }} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          {/* Como en la recuperación: el encabezado, sin el número de la pregunta a la vista
              (el avance lo dan las barras). Hasta el 2026-10-09 el número lo decía la etiqueta
              del desplegable, que ahora solo la oye el lector de pantalla. */}
          <h2 className={`mb-3 ${authPasosCardHeadingClass}`}>Preguntas de seguridad</h2>

          <AuthSelectField
            id="security-question"
            etiquetaOculta
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
            className={authPasosHuecoClass}
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
            className={authPasosHuecoClass}
          />

          <AuthProgressDots total={TOTAL_QUESTIONS} current={currentQuestion} className={authPasosHuecoClass} />

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

          {/* Solo en la primera pregunta (pedido del usuario, 2026-10-11); desde la segunda
              está «Atrás». Solo texto, como «Cancelar» de la nueva contraseña. Cierra la
              sesión temporal y va al login sin guardar nada: la contraseña y las preguntas
              se envían juntas al final. */}
          {currentQuestion === 0 && (
            <div className={`${authPasosHuecoArribaClass} text-center`}>
              <button type="button" onClick={cerrarSesionEIrAlLogin} className={authPasosQuietLinkClass}>
                Cancelar
              </button>
            </div>
          )}
        </form>
      </Tarjeta>
    </MarcoDePasos>
  );
}

function Tarjeta({ children }: { children: ReactNode }) {
  return <div className={authPasosCardClass}>{children}</div>;
}
