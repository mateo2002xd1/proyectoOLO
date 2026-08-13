'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/login';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { PasswordField } from '@/shared/ui/molecules/PasswordField';
import { PasswordRequisitos } from '@/shared/ui/molecules/PasswordRequisitos';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';
import { QuestionPicker, type CatalogQuestion } from './QuestionPicker';
import { mensajeDeError } from '@/shared/lib/errors';

const TOTAL_QUESTIONS = 3;

/**
 * Qué le falta a la cuenta. `null` mientras se consulta.
 *
 * Lo dice el servidor: un administrador puede restablecer solo las preguntas, solo la
 * contraseña, o ambas, y cada caso pide una pantalla distinta.
 */
type Pendiente = { debeCambiarPassword: boolean; debeConfigurarPreguntas: boolean };

export function FirstLoginView() {
  const { user, logout } = useAuth();
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
      newErrors.newPassword = 'El nuevo passcode es requerido';
    } else if (!cumplePolitica(newPassword)) {
      newErrors.newPassword = primerFallo(newPassword) ?? '';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu passcode';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Los passcodes no coinciden';
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

  const renderStep1 = () => (
    <div className="fl-card">
      <form onSubmit={(e) => { e.preventDefault(); handleNextStep1(); }} className="fl-form">
        <h2 className="fl-card-title">Contraseña temporal</h2>
        <PasswordField
          classPrefix="fl"
          value={tempPassword}
          onChange={(v) => { setTempPassword(v); setErrors({}); }}
          error={errors.tempPassword}
        />

        <h2 className="fl-card-title">Nuevo passcode</h2>
        <PasswordField
          classPrefix="fl"
          value={newPassword}
          onChange={(v) => { setNewPassword(v); setErrors({}); }}
          error={errors.newPassword}
        />
        <PasswordRequisitos classPrefix="fl" password={newPassword} />

        <h2 className="fl-card-title">Ingresa nuevamente el passcode</h2>
        <PasswordField
          classPrefix="fl"
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
          error={errors.confirmPassword}
        />

        {errors.general && <div className="fl-general-error">{errors.general}</div>}

        <button type="submit" className="fl-submit">Continuar</button>

        <Link href="/login" className="fl-login-link">Iniciar sesión</Link>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="fl-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentQuestion === TOTAL_QUESTIONS - 1) {
            handleSubmitStep2();
          } else {
            handleNextQuestion();
          }
        }}
        className="fl-form"
      >
        <h2 className="fl-card-title">Escoge tus preguntas y respuestas</h2>

        <QuestionPicker
          classPrefix="fl"
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

        {errors.general && <div className="fl-general-error">{errors.general}</div>}

        <button type="submit" className="fl-submit">
          {isLoading ? 'Guardando...' : currentQuestion === TOTAL_QUESTIONS - 1 ? 'Guardar' : 'Continuar'}
        </button>

        <Link href="/login" className="fl-login-link">Iniciar sesión</Link>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="fl-success">
      <h1 className="fl-success-title">¡Configuración completada con éxito!</h1>
      <p className="fl-success-subtitle">Tu cuenta ya es segura.</p>
      {/* El aviso sobre las respuestas solo tiene sentido si se acaban de elegir. */}
      {pendiente?.debeConfigurarPreguntas && (
        <p className="fl-success-text">
          Es muy importante que recuerdes o guardes tus respuestas en un lugar seguro, ya que serán el único método para validar tu identidad y permitirte cambiar tu clave en el futuro si llegas a olvidarla.
        </p>
      )}
      <button type="button" onClick={() => logout()} className="fl-success-btn">Iniciar sesión</button>
    </div>
  );

  const getLeftContent = () => {
    if (currentStep === 1) {
      return {
        title: `Hola ${user?.name ? user.name.split(' ')[0] : ''}, Actualiza tu seguridad.`,
        subtitle: 'Has ingresado con un código temporal. Por tu seguridad, es necesario que crees un nuevo código de acceso personal y privado que solo tú conozcas.',
      };
    }
    if (currentStep === 2) {
      return {
        title: 'Protege el acceso a tu cuenta',
        // El texto cambia según por qué se está aquí: a quien solo le restablecieron
        // las preguntas hay que decírselo, o no entiende por qué se le piden otra vez
        // ni si su contraseña sigue sirviendo.
        subtitle: pendiente?.debeCambiarPassword
          ? 'Elige 3 preguntas de seguridad de la lista y asigna una respuesta para cada una. Estas preguntas nos servirán para verificar tu identidad de forma segura en caso de que necesites recuperar tu cuenta.'
          : 'Tus preguntas de seguridad fueron restablecidas. Elige 3 de la lista y asigna una respuesta para cada una. Tu contraseña actual no cambia.',
      };
    }
    if (currentStep === 3) {
      return {
        title: '¡Configuración completada con éxito!',
        subtitle: 'Tu cuenta ya es segura.',
      };
    }
    return null;
  };

  const leftContent = getLeftContent();

  /* ---------- Mientras se sabe qué falta ---------- */
  if (!pendiente) {
    return (
      <div className="fl-page">
        <div className="fl-right">
          <div className="fl-card">
            {errors.general ? (
              <>
                <div className="fl-general-error">{errors.general}</div>
                <Link href="/login" className="fl-success-btn">Volver a iniciar sesión</Link>
              </>
            ) : (
              <p className="fl-card-title">Comprobando tu cuenta…</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Nada pendiente ---------- */
  // Puede pasar si se llega por la URL, o si se completó en otra pestaña. Antes el
  // formulario se pintaba igual y pedía una contraseña temporal que ya no existía.
  if (!pendiente.debeCambiarPassword && !pendiente.debeConfigurarPreguntas && currentStep !== 3) {
    return (
      <div className="fl-page">
        <div className="fl-right">
          <div className="fl-success">
            <h1 className="fl-success-title">Tu cuenta ya está configurada</h1>
            <p className="fl-success-text">
              No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día.
            </p>
            <button type="button" onClick={() => logout()} className="fl-success-btn">Iniciar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  // El paso 1 (contraseñas) solo existe si hay contraseña que cambiar.
  const primerPaso = pendiente.debeCambiarPassword ? 1 : 2;
  const pasosVisibles = pendiente.debeCambiarPassword ? [1, 2, 3] : [2, 3];

  return (
    <div className="fl-page">
      {/* Panel izquierdo — Branding */}
      {currentStep !== 3 && (
        <div className="fl-left">
          <div className="fl-left-content">
            <h1 className="fl-brand-title">{leftContent?.title}</h1>
            <p className="fl-brand-subtitle">{leftContent?.subtitle}</p>
          </div>
        </div>
      )}

      {/* Panel derecho — Card / Content */}
      <div className="fl-right">
        <div className="fl-step-container" key={currentStep}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Pagination */}
        {/* Los pasos se acotan a los que aplican: sin `primerPaso`, quien solo tiene
            que configurar preguntas podía retroceder al paso 1 y encontrarse otra vez
            el formulario de contraseña temporal — el fallo que esto arregla, por la
            puerta de atrás. Se numeran por posición para no mostrar un «2 3» suelto. */}
        <div className="fl-pagination">
          <button
            onClick={() => {
              if (currentStep === 2 && currentQuestion > 0) {
                handlePrevQuestion();
              } else if (currentStep > primerPaso && currentStep < 3) {
                if (currentStep === 2) setCurrentQuestion(0);
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={currentStep === primerPaso}
            className="fl-pagination-btn"
          >
            ← Previous
          </button>

          {pasosVisibles.map((step, i) => (
            <button
              key={step}
              onClick={() => {
                if (step < currentStep) {
                  if (step === 2) setCurrentQuestion(0);
                  setCurrentStep(step);
                }
              }}
              disabled={step > currentStep}
              className={`fl-pagination-num ${step === currentStep ? 'fl-pagination-active' : ''}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => {
              if (currentStep === 1) {
                handleNextStep1();
              } else if (currentStep === 2) {
                if (currentQuestion < TOTAL_QUESTIONS - 1) {
                  handleNextQuestion();
                } else {
                  handleSubmitStep2();
                }
              }
            }}
            disabled={currentStep === 3}
            className="fl-pagination-btn"
          >
            Next →
          </button>
        </div>

        <ReturnToSiteLink classPrefix="fl" />
      </div>
    </div>
  );
}
