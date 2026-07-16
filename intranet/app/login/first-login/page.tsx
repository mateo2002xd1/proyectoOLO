'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/auth';

const TOTAL_STEPS = 3;
const TOTAL_QUESTIONS = 3;

interface CatalogQuestion {
  key: string;
  label: string;
}

export default function FirstLoginPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Step 1 - Passwords
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2 - Security questions
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));
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

    if (!selectedQuestions[currentQuestion]) {
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
        selectedQuestions.map((q, i) => {
          // Find the key for the selected label, fallback to label if not found
          const qObj = catalogQuestions.find(c => c.label === q);
          return {
            key: qObj ? qObj.key : q,
            answer: answers[i]
          };
        })
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

        <div className="fl-field">
          <div className="fl-password-wrap">
            <input
              type={showTemp ? 'text' : 'password'}
              placeholder="mínimo 8 caracteres"
              value={tempPassword}
              onChange={(e) => { setTempPassword(e.target.value); setErrors({}); }}
              className={`fl-input fl-input-password ${errors.tempPassword ? 'fl-input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowTemp(!showTemp)} className="fl-eye-btn" aria-label={showTemp ? 'Ocultar' : 'Mostrar'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showTemp ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
              </svg>
            </button>
          </div>
          {errors.tempPassword && <span className="fl-error">{errors.tempPassword}</span>}
        </div>

        <h2 className="fl-card-title">Nuevo passcode</h2>

        <div className="fl-field">
          <div className="fl-password-wrap">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }}
              className={`fl-input fl-input-password ${errors.newPassword ? 'fl-input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="fl-eye-btn" aria-label={showNew ? 'Ocultar' : 'Mostrar'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showNew ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
              </svg>
            </button>
          </div>
          {errors.newPassword && <span className="fl-error">{errors.newPassword}</span>}
        </div>

        <h2 className="fl-card-title">Ingresa nuevamente el passcode</h2>

        <div className="fl-field">
          <div className="fl-password-wrap">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="mínimo 8 caracteres"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
              className={`fl-input fl-input-password ${errors.confirmPassword ? 'fl-input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="fl-eye-btn" aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showConfirm ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
              </svg>
            </button>
          </div>
          {errors.confirmPassword && <span className="fl-error">{errors.confirmPassword}</span>}
        </div>

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

        <div className="fl-field">
          <select
            className={`fl-select ${errors.question ? 'fl-input-error' : ''}`}
            value={selectedQuestions[currentQuestion]}
            onChange={(e) => {
              const newSelected = [...selectedQuestions];
              newSelected[currentQuestion] = e.target.value;
              setSelectedQuestions(newSelected);
              setErrors({});
            }}
          >
            <option value="" disabled>Selecciona una opción...</option>
            {catalogQuestions.map((q) => (
              <option
                key={q.key}
                value={q.label}
                disabled={selectedQuestions.includes(q.label) && selectedQuestions[currentQuestion] !== q.label}
              >
                {q.label}
              </option>
            ))}
          </select>
          {errors.question && <span className="fl-error">{errors.question}</span>}
        </div>

        <div className="fl-field">
          <input
            type="text"
            placeholder="Respuesta"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
              setErrors({});
            }}
            className={`fl-input ${errors.answer ? 'fl-input-error' : ''}`}
          />
          {errors.answer && <span className="fl-error">{errors.answer}</span>}
        </div>

        <div className="fl-progress">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <div
              key={i}
              className={`fl-progress-dot ${i === currentQuestion ? 'fl-progress-active' : ''} ${i < currentQuestion ? 'fl-progress-done' : ''}`}
            />
          ))}
        </div>

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

        <Link href="http://localhost:3000" className="fl-return">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Regresar al sitio web del Observatorio
        </Link>
      </div>
    </div>
  );
}
