'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { authApi } from '@/features/auth';

interface SecurityQuestion {
  key: string;
  label: string;
}
export default function SecurityQuestionsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(3).fill(''));
  const [errors, setErrors] = useState<{ answer?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('recoveryEmail');
    const savedQuestions = sessionStorage.getItem('recoveryQuestions');
    if (savedEmail && savedQuestions) {
      setEmail(savedEmail);
      setQuestions(JSON.parse(savedQuestions));
    } else {
      window.location.href = '/login/recovery';
    }
  }, []);

  const totalQuestions = questions.length || 3;

  const validate = (): boolean => {
    const currentAnswer = answers[currentStep];
    if (!currentAnswer.trim()) {
      setErrors({ answer: 'La respuesta es requerida' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload = questions.map((q, i) => ({
        key: q.key,
        answer: answers[i]
      }));
      
      const data = await authApi.verifyAnswers(email, payload);
      // Guardamos email y respuestas verificadas para el paso de reset-password
      sessionStorage.setItem('recoveryAnswers', JSON.stringify(payload));
      // data.message = 'Respuestas correctas' en caso de éxito
      void data;
      window.location.href = '/login/reset-password';
    } catch (error: any) {
      setErrors({ general: error.message || 'Las respuestas no coinciden. Intenta de nuevo.' });
      setCurrentStep(0);
      setAnswers(Array(totalQuestions).fill(''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
    setErrors({});
  };

  return (
    <div className="sq-page">
      {/* Panel izquierdo — Branding */}
      <div className="sq-left">
        <div className="sq-left-content">
          <h1 className="sq-brand-title">
            Por tu seguridad...
          </h1>
          <p className="sq-brand-subtitle">
            Responde correctamente a las 3 preguntas.
          </p>
          <p className="sq-brand-hint">
            Recuerda que las respuestas deben coincidir exactamente con las que asignaste la primera vez.
          </p>
        </div>
      </div>

      {/* Panel derecho — Card */}
      <div className="sq-right">
        <div className="sq-card" key={currentStep}>
          <form onSubmit={handleSubmit} className="sq-form">
            <h2 className="sq-card-title">Responde tus preguntas</h2>

            <div className="sq-field">
              <label className="sq-label-question">
                {questions[currentStep]?.label}
              </label>
              <input
                type="text"
                placeholder="Respuesta"
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className={`sq-input ${errors.answer ? 'sq-input-error' : ''}`}
                autoFocus
              />
              {errors.answer && <span className="sq-error">{errors.answer}</span>}
            </div>

            <div className="sq-progress">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  className={`sq-progress-dot ${i === currentStep ? 'sq-progress-active' : ''} ${i < currentStep ? 'sq-progress-done' : ''}`}
                />
              ))}
            </div>

            {errors.general && (
              <div className="sq-general-error">{errors.general}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`sq-submit ${isLoading ? 'sq-submit-disabled' : ''}`}
            >
              {isLoading ? 'Verificando...' : currentStep === totalQuestions - 1 ? 'Verificar respuestas' : 'Continuar'}
            </button>

            <Link href="/login" className="sq-login-link">
              Iniciar sesión
            </Link>
          </form>
        </div>

        <Link href="http://localhost:3000" className="sq-return">
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
