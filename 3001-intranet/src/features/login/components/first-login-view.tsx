'use client';

import { useState, useEffect } from 'react';
import { authApi, useAuth } from '@/features/login';
import {
  cumplePolitica,
  esPasswordRepetida,
  MENSAJE_PASSWORD_REPETIDA,
  primerFallo,
  repiteLaPassword,
} from '@olo/password-policy';
import { PasswordField } from '@/shared/ui/molecules/password-field';
import { PasswordRequisitos } from '@/shared/ui/molecules/password-requisitos';
import { QuestionPicker, type CatalogQuestion } from './question-picker';
import { mensajeDeError } from '@/shared/lib/api/errors';
import { MarcoAcceso } from './marco-acceso';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import {
  accesoBotonClass,
  accesoBotonEnBlancoClass,
  accesoBotonSecundarioClass,
  accesoBotonSecundarioEnBlancoClass,
  accesoEncabezadoClass,
  accesoEncabezadoEnBlancoClass,
  accesoEnlaceClass,
  accesoEnlaceEnBlancoClass,
  accesoErrorGeneralClass,
  accesoHuecoClass,
  accesoHuecoArribaClass,
  accesoTextoEnBlancoClass,
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
  // Rechazada aunque cumple todos los requisitos (repite la temporal, la actual o la
  // anterior): el aviso rojo va en el lugar de «Cumple todos los requisitos».
  const rechazoDeLaNueva = errors.newPassword && cumplePolitica(newPassword) ? errors.newPassword : undefined;
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
    } else if (repiteLaPassword(newPassword, tempPassword)) {
      // Igual a la temporal que acaba de escribir: se avisa aquí y no al final, después de
      // las preguntas (2026-10-15). La anterior a la temporal solo la sabe el servidor.
      newErrors.newPassword = MENSAJE_PASSWORD_REPETIDA;
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
      // Repite la temporal o la que tenía antes: se vuelve al paso de la contraseña con el
      // aviso en el campo de la nueva y su borde rojo (pedido del usuario, 2026-10-15). Las
      // respuestas ya escritas se conservan.
      if (esPasswordRepetida(error)) {
        setCurrentStep(1);
        setErrors({ newPassword: mensajeDeError(error) });
        return;
      }
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep2 = async () => {
    if (!validateStep2()) return;
    await enviar();
  };

  /* ---------- Mientras se sabe qué falta ---------- */
  if (!pendiente) {
    return (
      <MarcoAcceso cerrarSesionAlSalir titulo="Configura tu acceso" claseTarjeta="text-center">
        {errors.general ? (
          <>
            <MensajeEstado tipo="error" rol="alert" className={accesoErrorGeneralClass}>{errors.general}</MensajeEstado>
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
        // Texto del usuario (2026-10-11); antes «Tu cuenta ya está configurada» y «No hay nada
        // pendiente: tu contraseña y tus preguntas de seguridad están al día.».
        titulo="¡Configuración completada con éxito!"
        descripcion={[
          'Tu cuenta ya es segura.',
          'Guarda tus respuestas en un lugar seguro, las usarás para validar tu identidad y restablecer tu clave si la olvidas.',
        ]}
        // Desde la tablet, el texto dentro del formulario, encima de «Iniciar sesión».
        descripcionEnTarjeta
        claseTarjeta="text-center"
        enBlanco
      >
        <button type="button" onClick={() => logout()} className={`${accesoBotonClass} ${accesoBotonEnBlancoClass}`}>
          Iniciar sesión
        </button>
      </MarcoAcceso>
    );
  }

  // Sin paginador «← Anterior 1 2 3 Siguiente →» ni insignia de check: los quitó el usuario
  // el 2026-10-11. Se avanza con el botón del formulario; «Atrás» mueve entre preguntas.

  /* ---------- Paso 3: listo ---------- */
  if (currentStep === 3) {
    return (
      <MarcoAcceso
        cerrarSesionAlSalir
        titulo="¡Configuración completada con éxito!"
        // Texto del usuario (2026-10-11). Desde la tablet va dentro del formulario, encima
        // del botón; en el móvil, bajo el título. El aviso sobre las respuestas solo tiene
        // sentido si se acaban de elegir: a quien solo cambió la contraseña le queda la
        // primera frase.
        descripcion={[
          'Tu cuenta ya es segura.',
          ...(pendiente.debeConfigurarPreguntas
            ? ['Guarda tus respuestas en un lugar seguro, las usarás para validar tu identidad y restablecer tu clave si la olvidas.']
            : []),
        ]}
        descripcionEnTarjeta
        claseTarjeta="text-center"
        enBlanco
      >
        <p className={`${accesoHuecoClass} text-base text-white/85 ${accesoTextoEnBlancoClass}`}>
          Vuelve a iniciar sesión para entrar a la intranet.
        </p>
        <button type="button" onClick={() => logout()} className={`${accesoBotonClass} ${accesoBotonEnBlancoClass}`}>
          Iniciar sesión
        </button>
      </MarcoAcceso>
    );
  }

  // Los pasos 1 y 2 y las dos de «¡Configuración completada con éxito!» van en tarjeta blanca
  // desde `md`, como el login (pedido del usuario, 2026-10-12). «Comprobando tu cuenta…»
  // sigue sobre el azul.

  /* ---------- Paso 1: contraseñas ---------- */
  if (currentStep === 1) {
    return (
      <MarcoAcceso
        cerrarSesionAlSalir
        enBlanco
        titulo="Actualiza tu seguridad"
        // Acortado el 2026-10-10 para que el paso quepa sin scroll en el móvil; es el mismo
        // texto que en el acceso del sitio web.
        descripcion="Has ingresado con una contraseña temporal. Por tu seguridad, crea una contraseña personal que solo tú conozcas."
        claveTarjeta={currentStep}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep1(); }} noValidate>
          {errors.general && <MensajeEstado tipo="error" rol="alert" className={accesoErrorGeneralClass}>{errors.general}</MensajeEstado>}

          <PasswordField
            id="temp-password"
            label="Contraseña temporal"
            // La da el administrador al crear o restablecer la cuenta; no llega por correo.
            placeholder="Ingresar contraseña"
            autoComplete="current-password"
            value={tempPassword}
            onChange={(v) => { setTempPassword(v); setErrors({}); }}
            error={errors.tempPassword}
            enBlanco
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
              textoDeErrorAparte={Boolean(rechazoDeLaNueva) && verRequisitos}
              enBlanco
              className={verRequisitos ? 'mb-2 md:mb-3' : accesoHuecoClass}
            />
          </div>
          {verRequisitos && (
            <PasswordRequisitos
              password={newPassword}
              variant="solid"
              resumirAlCumplir
              rechazo={rechazoDeLaNueva}
              className={accesoHuecoClass}
              enBlanco
            />
          )}
          <PasswordField
            id="confirm-password"
            label="Ingresa nuevamente la contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
            error={errors.confirmPassword}
            enBlanco
            className={accesoHuecoClass}
          />

          <button type="submit" disabled={isLoading} className={`${accesoBotonClass} ${accesoBotonEnBlancoClass}`}>
            {isLoading ? 'Guardando…' : 'Continuar'}
          </button>
        </form>
      </MarcoAcceso>
    );
  }

  /* ---------- Paso 2: preguntas de seguridad ---------- */
  return (
    <MarcoAcceso
      cerrarSesionAlSalir
      enBlanco
      titulo="Protege el acceso a tu cuenta"
      // El texto cambia según por qué se está aquí: a quien solo le restablecieron
      // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez
      // ni si su contraseña sigue sirviendo.
      descripcion={
        pendiente.debeCambiarPassword
          ? 'Elige 3 preguntas y responde cada una. Con ellas verificaremos tu identidad si necesitas recuperar tu cuenta.'
          : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 y asigna una respuesta a cada una; tu contraseña actual no cambia.'
      }
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
        {errors.general && <MensajeEstado tipo="error" rol="alert" className={accesoErrorGeneralClass}>{errors.general}</MensajeEstado>}

        <h2 className={`mb-3 ${accesoEncabezadoClass} ${accesoEncabezadoEnBlancoClass}`}>Preguntas de seguridad</h2>

        <QuestionPicker
          catalogQuestions={catalogQuestions}
          totalQuestions={TOTAL_QUESTIONS}
          currentIndex={currentQuestion}
          selectedKeys={selectedKeys}
          answers={answers}
          errors={errors}
          enBlanco
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
            <button type="button" onClick={handlePrevQuestion} className={`${accesoBotonSecundarioClass} ${accesoBotonSecundarioEnBlancoClass} shrink-0`}>
              Atrás
            </button>
          )}
          <button type="submit" disabled={isLoading} className={`${accesoBotonClass} ${accesoBotonEnBlancoClass} flex-1`}>
            {isLoading ? 'Guardando…' : currentQuestion === TOTAL_QUESTIONS - 1 ? 'Guardar' : 'Continuar'}
          </button>
        </div>

        {/* Solo en la primera pregunta (pedido del usuario, 2026-10-11); desde la segunda está
            «Atrás». Solo texto, como «Cancelar» de la nueva contraseña. Cierra la sesión
            temporal y va al login sin guardar nada: la contraseña y las preguntas se envían
            juntas al final. */}
        {currentQuestion === 0 && (
          <div className={`${accesoHuecoArribaClass} text-center`}>
            <button type="button" onClick={() => logout()} className={`${accesoEnlaceClass} ${accesoEnlaceEnBlancoClass}`}>
              Cancelar
            </button>
          </div>
        )}
      </form>
    </MarcoAcceso>
  );
}
