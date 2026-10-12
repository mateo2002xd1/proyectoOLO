'use client';

import { useState, useEffect } from 'react';
import { authApi, useAuth } from '@/features/login';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { PasswordField } from '@/shared/ui/molecules/password-field';
import { PasswordRequisitos } from '@/shared/ui/molecules/password-requisitos';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/20/solid';
import { QuestionPicker, type CatalogQuestion } from './question-picker';
import { mensajeDeError } from '@/shared/lib/errors';
import { MarcoAcceso } from './marco-acceso';
import {
  accesoBotonClass,
  accesoBotonSecundarioClass,
  accesoEncabezadoClass,
  accesoEnlaceClass,
  accesoErrorGeneralClass,
  accesoHuecoArribaClass,
  accesoHuecoClass,
} from './acceso-ui';

const TOTAL_QUESTIONS = 3;

/**
 * Qué le falta a la cuenta. `null` mientras se consulta.
 *
 * Lo dice el servidor: un administrador puede restablecer solo las preguntas, solo la
 * contraseña, o ambas, y cada caso pide una pantalla distinta.
 */
type Pendiente = { debeCambiarPassword: boolean; debeConfigurarPreguntas: boolean };

export function FirstLoginView() {
  const { logout } = useAuth();
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Step 1 - Passwords
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 - Security questions
  const [selectedKeys, setSelectedKeys] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));
  const [answers, setAnswers] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Los requisitos de la nueva contraseña aparecen al entrar en el campo (o si ya tiene
  // algo) y desde entonces se quedan, como en el acceso del sitio web. En reposo no ocupan
  // sitio: con ellos a la vista el paso no cabía en el móvil sin scroll (2026-10-10). No se
  // ocultan al salir del campo: el formulario encogería justo al pulsar el de abajo.
  const [requisitosEnfocados, setRequisitosEnfocados] = useState(false);
  const verRequisitos = requisitosEnfocados || newPassword !== '';
  const [catalogQuestions, setCatalogQuestions] = useState<CatalogQuestion[]>([]);

  useEffect(() => {
    authApi.getCatalog()
      .then(setCatalogQuestions)
      .catch(() => setErrors({ general: 'No se pudieron cargar las preguntas de seguridad' }));
  }, []);

  // Qué falta de verdad, según la base. Si la contraseña ya está cambiada, el paso 1
  // no tiene nada que pedir: no hay temporal que verificar, y obligar a cambiarla
  // otra vez era justo el fallo que esto arregla.
  useEffect(() => {
    authApi.firstLoginStatus()
      .then((estado) => {
        setPendiente(estado);
        if (!estado.debeCambiarPassword) setCurrentStep(2);
      })
      .catch(() =>
        setErrors({ general: 'No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión.' })
      );
  }, []);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // La temporal se *comprueba*, no se elige: la emitió el sistema y ya cumple la
    // política. Medirla contra §1 aquí solo podría rechazar una clave válida.
    if (!tempPassword) {
      newErrors.tempPassword = 'La contraseña temporal es requerida';
    }

    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (!cumplePolitica(newPassword)) {
      newErrors.newPassword = primerFallo(newPassword) ?? '';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedKeys[currentQuestion]) {
      newErrors.question = 'Selecciona una pregunta';
    }

    if (!answers[currentQuestion].trim()) {
      newErrors.answer = 'La respuesta es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = async () => {
    if (!validateStep1()) return;
    setErrors({});

    // Si las preguntas ya están configuradas, no hay segundo paso que dar.
    if (!pendiente?.debeConfigurarPreguntas) {
      await enviar();
      return;
    }
    setCurrentStep(2);
  };

  const handleNextQuestion = () => {
    if (!validateStep2()) return;

    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setErrors({});
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setErrors({});
    }
  };

  /**
   * Envía lo pendiente.
   *
   * Se manda el cuerpo completo; el servidor usa solo lo que la cuenta tenga
   * pendiente e ignora el resto. Los campos que no aplican van vacíos porque su paso
   * ni siquiera se pintó.
   */
  const enviar = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await authApi.firstLogin(
        tempPassword,
        newPassword,
        selectedKeys.map((key, i) => ({ key, answer: answers[i] }))
      );

      setCurrentStep(3);
    } catch (error) {
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep2 = async () => {
    if (!validateStep2()) return;
    await enviar();
  };

  /* ---------- Piezas comunes ---------- */

  /** «Iniciar sesión», bajo el botón: cierra la sesión a medias y vuelve al login. */
  const enlaceIniciarSesion = (
    <div className={`${accesoHuecoArribaClass} text-center`}>
      <button type="button" onClick={() => logout()} className={accesoEnlaceClass}>
        Iniciar sesión
      </button>
    </div>
  );

  /** Insignia de «listo», como en los avisos de éxito de la recuperación. */
  const insignia = (
    <div className="mx-auto mb-[clamp(0.75rem,2.2dvh,1.5rem)] flex size-12 items-center justify-center rounded-full bg-white">
      <CheckIcon aria-hidden="true" className="size-6 text-[#0d1526]" />
    </div>
  );

  /* ---------- Mientras se sabe qué falta ---------- */
  if (!pendiente) {
    return (
      <MarcoAcceso cerrarSesionAlSalir titulo="Configura tu acceso" claseTarjeta="text-center">
        {errors.general ? (
          <>
            <div className={accesoErrorGeneralClass} role="alert">{errors.general}</div>
            <button type="button" onClick={() => logout()} className={accesoEnlaceClass}>
              Volver a iniciar sesión
            </button>
          </>
        ) : (
          <p className="text-base text-white/85" role="status">
            Comprobando tu cuenta…
          </p>
        )}
      </MarcoAcceso>
    );
  }

  /* ---------- Nada pendiente ---------- */
  // Puede pasar si se llega por la URL, o si se completó en otra pestaña. Antes el
  // formulario se pintaba igual y pedía una contraseña temporal que ya no existía.
  if (!pendiente.debeCambiarPassword && !pendiente.debeConfigurarPreguntas && currentStep !== 3) {
    return (
      <MarcoAcceso
        cerrarSesionAlSalir
        titulo="Tu cuenta ya está configurada"
        descripcion="No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día."
        claseTarjeta="text-center"
        antesDelFormulario={insignia}
      >
        <button type="button" onClick={() => logout()} className={accesoBotonClass}>
          Iniciar sesión
        </button>
      </MarcoAcceso>
    );
  }

  // El paso 1 (contraseñas) solo existe si hay contraseña que cambiar.
  const primerPaso = pendiente.debeCambiarPassword ? 1 : 2;
  const pasosVisibles = pendiente.debeCambiarPassword ? [1, 2, 3] : [2, 3];

  /* ---------- Paginador ---------- */
  // «← Anterior 1 2 3 Siguiente →» bajo el texto del paso, como en el primer ingreso del
  // sitio web (`PaginadorDePasos` en `marco-de-pasos.tsx`), en blanco sobre el azul (pedido
  // del usuario, 2026-10-11; antes iba debajo del formulario y en inglés).
  //
  // Los pasos se acotan a los que aplican: sin `primerPaso`, quien solo tiene que configurar
  // preguntas podía retroceder al paso 1 y encontrarse otra vez el formulario de contraseña
  // temporal — el fallo que esto arregla, por la puerta de atrás. Se numeran por posición
  // para no mostrar un «2 3» suelto. Hacia adelante solo se avanza por el formulario, con sus
  // validaciones: «Siguiente» hace lo mismo que el botón principal. Terminado, ya no hay
  // nada a lo que volver.
  const NOMBRES_DE_PASO: Record<number, string> = { 1: 'Contraseña', 2: 'Preguntas de seguridad', 3: 'Listo' };
  const puedeVolver = currentStep < 3 && (currentStep > primerPaso || (currentStep === 2 && currentQuestion > 0));
  const volver = () => {
    if (currentStep === 2 && currentQuestion > 0) {
      handlePrevQuestion();
    } else if (currentStep > primerPaso && currentStep < 3) {
      if (currentStep === 2) setCurrentQuestion(0);
      setCurrentStep(currentStep - 1);
    }
  };
  const avanzar = () => {
    if (currentStep === 1) {
      handleNextStep1();
    } else if (currentStep === 2) {
      if (currentQuestion < TOTAL_QUESTIONS - 1) handleNextQuestion();
      else handleSubmitStep2();
    }
  };
  const flecha =
    'inline-flex h-8 items-center gap-2 rounded-full px-3 text-base text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default disabled:text-white/40 disabled:hover:bg-transparent';
  const numero = 'flex size-8 items-center justify-center rounded-full text-base';
  const total = pasosVisibles.length;

  // Por debajo de 384 px de ancho disponible (`@sm` del contenedor, que pone el marco),
  // «Anterior» y «Siguiente» se quedan en la flecha; el nombre lo da su `aria-label`.
  const paginador = (
    <nav aria-label="Pasos para configurar tu cuenta" className="flex items-center justify-center gap-3 @sm:gap-5">
      <button type="button" aria-label="Anterior" className={flecha} disabled={!puedeVolver} onClick={volver}>
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        <span aria-hidden="true" className="hidden @sm:inline">Anterior</span>
      </button>

      <ol className="flex items-center gap-2.5">
        {pasosVisibles.map((step, i) => {
          const etiqueta = `Paso ${i + 1} de ${total}: ${NOMBRES_DE_PASO[step]}`;
          return (
            <li key={step}>
              {step === currentStep ? (
                <span aria-current="step" className={`${numero} bg-white text-[#0d1526]`}>
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{etiqueta}</span>
                </span>
              ) : step < currentStep && currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2) setCurrentQuestion(0);
                    setCurrentStep(step);
                  }}
                  aria-label={`Volver al ${etiqueta.charAt(0).toLowerCase()}${etiqueta.slice(1)}`}
                  className={`${numero} text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                >
                  {i + 1}
                </button>
              ) : (
                <span className={`${numero} text-white`}>
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{etiqueta}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <button type="button" aria-label="Siguiente" className={flecha} disabled={currentStep === 3} onClick={avanzar}>
        <span aria-hidden="true" className="hidden @sm:inline">Siguiente</span>
        <ArrowRightIcon aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );

  /* ---------- Paso 3: listo ---------- */
  if (currentStep === 3) {
    return (
      <MarcoAcceso
        cerrarSesionAlSalir
        titulo="¡Configuración completada!"
        descripcion={
          // El aviso sobre las respuestas solo tiene sentido si se acaban de elegir.
          pendiente.debeConfigurarPreguntas
            ? 'Guarda tus respuestas en un lugar seguro: serán el único método para validar tu identidad si olvidas tu clave en el futuro.'
            : 'Tu cuenta ya es segura.'
        }
        pasos={paginador}
        claseTarjeta="text-center"
        antesDelFormulario={insignia}
      >
        <p className={`${accesoHuecoClass} text-base text-white/85`}>
          Vuelve a iniciar sesión para entrar a la intranet.
        </p>
        <button type="button" onClick={() => logout()} className={accesoBotonClass}>
          Iniciar sesión
        </button>
      </MarcoAcceso>
    );
  }

  /* ---------- Paso 1: contraseñas ---------- */
  if (currentStep === 1) {
    return (
      <MarcoAcceso
        cerrarSesionAlSalir
        titulo="Actualiza tu seguridad"
        // Acortado el 2026-10-10 para que el paso quepa sin scroll en el móvil; es el mismo
        // texto que en el acceso del sitio web.
        descripcion="Has ingresado con una contraseña temporal. Por tu seguridad, crea una contraseña personal que solo tú conozcas."
        pasos={paginador}
        claveTarjeta={currentStep}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep1(); }} noValidate>
          {errors.general && <div className={accesoErrorGeneralClass} role="alert">{errors.general}</div>}

          <PasswordField
            id="temp-password"
            label="Contraseña temporal"
            // La da el administrador al crear o restablecer la cuenta; no llega por correo.
            placeholder="Ingresar contraseña"
            autoComplete="current-password"
            value={tempPassword}
            onChange={(v) => { setTempPassword(v); setErrors({}); }}
            error={errors.tempPassword}
            className={accesoHuecoClass}
          />
          {/* `contents`: la envoltura solo está para enterarse del foco. */}
          <div className="contents" onFocus={() => setRequisitosEnfocados(true)}>
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              autoComplete="new-password"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setErrors({}); }}
              error={errors.newPassword}
              className={verRequisitos ? 'mb-2 md:mb-3' : accesoHuecoClass}
            />
          </div>
          {verRequisitos && (
            <PasswordRequisitos password={newPassword} variant="solid" resumirAlCumplir className={accesoHuecoClass} />
          )}
          <PasswordField
            id="confirm-password"
            label="Ingresa nuevamente la contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
            error={errors.confirmPassword}
            className={accesoHuecoClass}
          />

          <button type="submit" disabled={isLoading} className={accesoBotonClass}>
            {isLoading ? 'Guardando…' : 'Continuar'}
          </button>
        </form>
        {enlaceIniciarSesion}
      </MarcoAcceso>
    );
  }

  /* ---------- Paso 2: preguntas de seguridad ---------- */
  return (
    <MarcoAcceso
      cerrarSesionAlSalir
      titulo="Protege el acceso a tu cuenta"
      // El texto cambia según por qué se está aquí: a quien solo le restablecieron
      // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez
      // ni si su contraseña sigue sirviendo.
      descripcion={
        pendiente.debeCambiarPassword
          ? 'Elige 3 preguntas y responde cada una. Con ellas verificaremos tu identidad si necesitas recuperar tu cuenta.'
          : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta a cada una; tu contraseña actual no cambia.'
      }
      pasos={paginador}
      claveTarjeta={currentStep}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentQuestion === TOTAL_QUESTIONS - 1) handleSubmitStep2();
          else handleNextQuestion();
        }}
        noValidate
      >
        {errors.general && <div className={accesoErrorGeneralClass} role="alert">{errors.general}</div>}

        <h2 className={`mb-3 ${accesoEncabezadoClass}`}>Preguntas de seguridad</h2>

        <QuestionPicker
          catalogQuestions={catalogQuestions}
          totalQuestions={TOTAL_QUESTIONS}
          currentIndex={currentQuestion}
          selectedKeys={selectedKeys}
          answers={answers}
          errors={errors}
          onSelectQuestion={(key) => {
            const newSelected = [...selectedKeys];
            newSelected[currentQuestion] = key;
            setSelectedKeys(newSelected);
            setErrors({});
          }}
          onAnswerChange={(value) => {
            const newAnswers = [...answers];
            newAnswers[currentQuestion] = value;
            setAnswers(newAnswers);
            setErrors({});
          }}
        />

        <div className="flex gap-2.5">
          {currentQuestion > 0 && (
            <button type="button" onClick={handlePrevQuestion} className={`${accesoBotonSecundarioClass} shrink-0`}>
              Atrás
            </button>
          )}
          <button type="submit" disabled={isLoading} className={`${accesoBotonClass} flex-1`}>
            {isLoading ? 'Guardando…' : currentQuestion === TOTAL_QUESTIONS - 1 ? 'Guardar' : 'Continuar'}
          </button>
        </div>
      </form>
      {enlaceIniciarSesion}
    </MarcoAcceso>
  );
}
