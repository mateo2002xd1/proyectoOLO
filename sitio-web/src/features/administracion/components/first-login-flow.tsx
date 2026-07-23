'use client';

import { useState, useEffect, FormEvent, CSSProperties } from 'react';

const TOTAL_QUESTIONS = 3;

type CatalogQuestion = { key: string; label: string };

interface FirstLoginFlowProps {
  /** Nombre del usuario para el saludo del panel izquierdo. */
  name?: string;
}

/* ---------- Estilos base (paleta del login del sitio web) ---------- */
const card: CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const label: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
};
const baseInput = (hasError: boolean): CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${hasError ? '#f87171' : '#d1d5db'}`,
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111827',
});
const errorText: CSSProperties = { margin: '4px 0 0', fontSize: 12, color: '#dc2626' };
const primaryBtn = (loading: boolean): CSSProperties => ({
  width: '100%',
  padding: '11px 16px',
  background: loading ? '#689b1c' : '#7DB728',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s',
});

const generalError: CSSProperties = {
  background: '#fef2f2',
  border: '1px solid #fca5a5',
  color: '#dc2626',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  marginBottom: 16,
};

/* ---------- Campo de contraseña con show/hide ---------- */
function PasswordInput({
  id,
  label: labelText,
  value,
  onChange,
  error,
  placeholder = 'Mínimo 8 caracteres',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={label}>
        {labelText}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...baseInput(!!error), padding: '10px 40px 10px 12px' }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: '#6b7280',
          }}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p style={errorText}>{error}</p>}
    </div>
  );
}

/* ---------- Puntos de progreso ---------- */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '4px 0 18px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i === current ? '#7DB728' : i < current ? '#a7d268' : '#d1d5db',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}

export function FirstLoginFlow({ name }: FirstLoginFlowProps) {
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

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!tempPassword) e.tempPassword = 'La contraseña temporal es requerida';
    else if (tempPassword.length < 8) e.tempPassword = 'Mínimo 8 caracteres';
    if (!newPassword) e.newPassword = 'El nuevo passcode es requerido';
    else if (newPassword.length < 8) e.newPassword = 'Mínimo 8 caracteres';
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

  const handleStep1 = () => {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  };

  const handleQuestionNext = async () => {
    if (!validateQuestion()) return;
    setErrors({});
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion((q) => q + 1);
      return;
    }
    // Última pregunta → enviar todo
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
          subtitle:
            'Elige 3 preguntas de seguridad y asigna una respuesta para cada una. Nos servirán para verificar tu identidad si necesitas recuperar tu cuenta.',
        }
      : null;

  /* ---------- Paso 3: éxito ---------- */
  if (step === 3) {
    return (
      <div style={{ ...card, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#111827' }}>
          ¡Configuración completada!
        </h1>
        <p style={{ margin: '0 0 12px', fontSize: 15, color: '#4b5563' }}>Tu cuenta ya es segura.</p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          Guarda tus respuestas en un lugar seguro: serán el único método para validar tu identidad si
          olvidas tu clave en el futuro.
        </p>
        <a
          href="/login"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 16px',
            background: '#7DB728',
            color: 'white',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
      {leftContent && (
        <div style={{ maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
            {leftContent.title}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{leftContent.subtitle}</p>
        </div>
      )}

      {/* Paso 1 — contraseñas */}
      {step === 1 && (
        <div style={card}>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleStep1(); }} noValidate>
            {errors.general && <div style={generalError}>{errors.general}</div>}
            <PasswordInput
              id="temp-password"
              label="Contraseña temporal"
              placeholder="Tu contraseña temporal"
              value={tempPassword}
              onChange={(v) => { setTempPassword(v); setErrors({}); }}
              error={errors.tempPassword}
            />
            <PasswordInput
              id="new-password"
              label="Nuevo passcode"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setErrors({}); }}
              error={errors.newPassword}
            />
            <PasswordInput
              id="confirm-password"
              label="Ingresa nuevamente el passcode"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
              error={errors.confirmPassword}
            />
            <button type="submit" style={primaryBtn(false)}>Continuar</button>
          </form>
        </div>
      )}

      {/* Paso 2 — preguntas de seguridad */}
      {step === 2 && (
        <div style={card}>
          <form
            onSubmit={(e: FormEvent) => { e.preventDefault(); handleQuestionNext(); }}
            noValidate
          >
            <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
              Escoge tus preguntas y respuestas
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Pregunta {currentQuestion + 1} de {TOTAL_QUESTIONS}</label>
              <select
                value={selectedKeys[currentQuestion] || ''}
                onChange={(e) => {
                  const next = [...selectedKeys];
                  next[currentQuestion] = e.target.value;
                  setSelectedKeys(next);
                  setErrors({});
                }}
                style={{ ...baseInput(!!errors.question), appearance: 'auto' }}
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
              {errors.question && <p style={errorText}>{errors.question}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Respuesta</label>
              <input
                type="text"
                placeholder="Tu respuesta"
                value={answers[currentQuestion]}
                onChange={(e) => {
                  const next = [...answers];
                  next[currentQuestion] = e.target.value;
                  setAnswers(next);
                  setErrors({});
                }}
                style={baseInput(!!errors.answer)}
              />
              {errors.answer && <p style={errorText}>{errors.answer}</p>}
            </div>

            <ProgressDots total={TOTAL_QUESTIONS} current={currentQuestion} />

            {errors.general && <div style={generalError}>{errors.general}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              {currentQuestion > 0 && (
                <button
                  type="button"
                  onClick={() => { setCurrentQuestion((q) => q - 1); setErrors({}); }}
                  style={{
                    flex: '0 0 auto',
                    padding: '11px 16px',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Atrás
                </button>
              )}
              <button type="submit" disabled={isLoading} style={{ ...primaryBtn(isLoading), flex: 1 }}>
                {isLoading
                  ? 'Guardando...'
                  : currentQuestion === TOTAL_QUESTIONS - 1
                  ? 'Guardar'
                  : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
