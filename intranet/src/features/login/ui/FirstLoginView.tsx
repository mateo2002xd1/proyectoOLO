'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/auth';
import { PasswordField } from '@/shared/ui/molecules/PasswordField';
import { ReturnToSiteLink } from '@/shared/ui/molecules/ReturnToSiteLink';
import { QuestionPicker, type CatalogQuestion } from './QuestionPicker';

const TOTAL_QUESTIONS = 3;

export function FirstLoginView() {
  const { user } = useAuth();
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

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tempPassword) {
      newErrors.tempPassword = 'La contraseña temporal es requerida';
    } else if (tempPassword.length < 8) {
      newErrors.tempPassword = 'Mínimo 8 caracteres';
    }

    if (!newPassword) {
      newErrors.newPassword = 'El nuevo passcode es requerido';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mínimo 8 caracteres';
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

  const handleNextStep1 = () => {
    if (!validateStep1()) return;
    setCurrentStep(2);
    setErrors({});
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

  const handleSubmitStep2 = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authApi.firstLogin(
        tempPassword,
        newPassword,
        selectedKeys.map((key, i) => ({ key, answer: answers[i] }))
      );

      setCurrentStep(3);
    } catch (error: any) {
      setErrors({ general: error.message || 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
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
      <form onSubmit={(e) => { e.preventDefault(); currentQuestion === TOTAL_QUESTIONS - 1 ? handleSubmitStep2() : handleNextQuestion(); }} className="fl-form">
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
      <p className="fl-success-text">
        Es muy importante que recuerdes o guardes tus respuestas en un lugar seguro, ya que serán el único método para validar tu identidad y permitirte cambiar tu clave en el futuro si llegas a olvidarla.
      </p>
      <Link href="/login" className="fl-success-btn">Iniciar sesión</Link>
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
        subtitle: 'Elige 3 preguntas de seguridad de la lista y asigna una respuesta para cada una. Estas preguntas nos servirán para verificar tu identidad de forma segura en caso de que necesites recuperar tu cuenta.',
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
        <div className="fl-pagination">
          <button
            onClick={() => {
              if (currentStep === 2 && currentQuestion > 0) {
                handlePrevQuestion();
              } else if (currentStep > 1 && currentStep < 3) {
                if (currentStep === 2) setCurrentQuestion(0);
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={currentStep === 1}
            className="fl-pagination-btn"
          >
            ← Previous
          </button>

          {[1, 2, 3].map((step) => (
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
              {step}
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
