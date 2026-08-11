'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { validarEmail } from '@olo/email-policy';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { Button } from '@/shared/ui/atoms/button';
import {
  AuthCardHeader,
  AuthGeneralError,
  BackToSiteLink,
  PasswordField,
  PasswordRequisitos,
  authCardClass,
  authErrorTextClass,
  authInputClass,
  authLabelClass,
} from './auth-ui';
import {
  obtenerPreguntas,
  verificarRespuestas,
  recuperarPassword,
  type PreguntaDeUsuario,
} from '../services/recuperacion.service';

/**
 * Recuperación de contraseña por preguntas de seguridad (RF-05).
 *
 * ## Por qué un componente con pasos y no cuatro rutas
 *
 * La intranet reparte este mismo flujo en `/auth/recovery`,
 * `/auth/security-questions`, `/auth/reset-password` y `/auth/reset-success`, y
 * arrastra el estado entre ellas por `sessionStorage` — **incluidas las respuestas
 * en claro**, que se quedan escritas en el navegador hasta que algo las borra. Aquí
 * el estado vive en el componente: al salir de la pantalla desaparece solo, y no hay
 * nada que limpiar ni que se quede olvidado si el usuario abandona a medias.
 *
 * Es además el idioma que ya usa `first-login-flow.tsx` en esta app.
 */

type Paso = 'correo' | 'preguntas' | 'password' | 'listo';

export function RecuperarPasswordFlow() {
  const [paso, setPaso] = useState<Paso>('correo');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [email, setEmail] = useState('');
  const [preguntas, setPreguntas] = useState<PreguntaDeUsuario[]>([]);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  const respuestasParaApi = () =>
    preguntas.map((pregunta, i) => ({ key: pregunta.key, answer: respuestas[i] ?? '' }));

  /* ---------- Paso 1: correo ---------- */

  const enviarCorreo = async (e: FormEvent) => {
    e.preventDefault();
    const fallo = validarEmail(email);
    if (fallo) {
      setErrors({ email: fallo });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const encontradas = await obtenerPreguntas(email);

      // El backend devuelve lista vacía tanto si el correo no existe como si existe
      // sin preguntas configuradas, para no delatar qué cuentas hay. Se responde con
      // el mismo mensaje en ambos casos, que es justo lo que sostiene esa decisión.
      if (encontradas.length === 0) {
        setErrors({
          general:
            'No hay preguntas de seguridad asociadas a ese correo. Contacta al administrador para restablecer tu acceso.',
        });
        return;
      }

      setPreguntas(encontradas);
      setRespuestas(Array(encontradas.length).fill(''));
      setPreguntaActual(0);
      setPaso('preguntas');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Paso 2: preguntas, de una en una ---------- */

  const siguientePregunta = async (e: FormEvent) => {
    e.preventDefault();
    if (!respuestas[preguntaActual]?.trim()) {
      setErrors({ answer: 'La respuesta es requerida' });
      return;
    }
    setErrors({});

    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual((n) => n + 1);
      return;
    }

    // En la última se verifican las tres de golpe. Comprobarlas de una en una
    // convertiría la pantalla en un oráculo: se sabría cuál de las tres se falló.
    setIsLoading(true);
    try {
      await verificarRespuestas(email, respuestasParaApi());
      setPaso('password');
    } catch (error) {
      setErrors({ general: (error as Error).message });
      // Se vuelve al principio del cuestionario: dejar las respuestas puestas
      // invitaría a ir cambiando una a una hasta acertar.
      setRespuestas(Array(preguntas.length).fill(''));
      setPreguntaActual(0);
    } finally {
      setIsLoading(false);
    }
  };

  const anteriorPregunta = () => {
    setErrors({});
    setPreguntaActual((n) => Math.max(0, n - 1));
  };

  /* ---------- Paso 3: nueva contraseña ---------- */

  const guardarPassword = async (e: FormEvent) => {
    e.preventDefault();
    const problemas: Record<string, string> = {};

    if (!password) problemas.password = 'El nuevo passcode es requerido';
    else if (!cumplePolitica(password)) problemas.password = primerFallo(password) ?? '';

    if (!confirmacion) problemas.confirmacion = 'Confirma tu passcode';
    else if (password !== confirmacion) problemas.confirmacion = 'Los passcodes no coinciden';

    if (Object.keys(problemas).length > 0) {
      setErrors(problemas);
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      // El servidor vuelve a verificar las respuestas aquí: llegar a este paso desde
      // el cliente no basta para cambiar una contraseña.
      await recuperarPassword(email, respuestasParaApi(), password);
      setPaso('listo');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Vistas ---------- */

  if (paso === 'listo') {
    return (
      <div className={authCardClass}>
        <AuthCardHeader className="mb-6">
          <p className="text-lg font-light text-gray-900 dark:text-[#f6f6f6]">
            Tu passcode se actualizó
          </p>
        </AuthCardHeader>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          Ya puedes iniciar sesión con tu nuevo passcode.
        </p>
        <Link href="/admin/auth/login" className="block">
          <Button type="button" variant="success" className="w-full">
            IR A INICIAR SESIÓN
          </Button>
        </Link>
      </div>
    );
  }

  if (paso === 'password') {
    return (
      <div className={authCardClass}>
        <AuthCardHeader className="mb-7">
          <p className="text-lg font-light text-gray-900 dark:text-[#f6f6f6]">Crea tu nuevo passcode</p>
        </AuthCardHeader>

        <form onSubmit={guardarPassword} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <PasswordField
            id="nuevo-password"
            label="Nuevo passcode"
            autoComplete="new-password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors({}); }}
            error={errors.password}
            className="mb-2"
          />
          <PasswordRequisitos password={password} />

          <PasswordField
            id="confirmar-password"
            label="Ingresa nuevamente el passcode"
            autoComplete="new-password"
            value={confirmacion}
            onChange={(v) => { setConfirmacion(v); setErrors({}); }}
            error={errors.confirmacion}
            className="mb-6"
          />

          <Button type="submit" variant="success" disabled={isLoading} className="w-full">
            {isLoading ? 'GUARDANDO' : 'GUARDAR PASSCODE'}
          </Button>
        </form>
      </div>
    );
  }

  if (paso === 'preguntas') {
    const pregunta = preguntas[preguntaActual];
    const esUltima = preguntaActual === preguntas.length - 1;

    return (
      <div className={authCardClass}>
        <AuthCardHeader className="mb-7">
          <p className="text-lg font-light text-gray-900 dark:text-[#f6f6f6]">
            Verifica tu identidad
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Pregunta {preguntaActual + 1} de {preguntas.length}
          </p>
        </AuthCardHeader>

        <form onSubmit={siguientePregunta} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <div className="mb-4">
            <label htmlFor="respuesta" className={authLabelClass}>
              {pregunta?.label}
            </label>
            <input
              id="respuesta"
              type="text"
              autoComplete="off"
              // La respuesta se compara en minúsculas y sin espacios en el servidor,
              // así que el autocorrector del móvil solo puede estorbar.
              autoCapitalize="none"
              autoCorrect="off"
              value={respuestas[preguntaActual] ?? ''}
              onChange={(e) => {
                const copia = [...respuestas];
                copia[preguntaActual] = e.target.value;
                setRespuestas(copia);
                setErrors({});
              }}
              className={authInputClass(!!errors.answer)}
            />
            {errors.answer && <p className={authErrorTextClass}>{errors.answer}</p>}
          </div>

          <Button type="submit" variant="success" disabled={isLoading} className="w-full">
            {isLoading ? 'VERIFICANDO' : esUltima ? 'VERIFICAR' : 'SIGUIENTE'}
          </Button>

          {preguntaActual > 0 && (
            <button
              type="button"
              onClick={anteriorPregunta}
              className="mt-3 w-full text-xs text-gray-500 dark:text-slate-400 hover:underline"
            >
              Volver a la pregunta anterior
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className={authCardClass}>
      <AuthCardHeader className="mb-7">
        <p className="text-lg font-light text-gray-900 dark:text-[#f6f6f6]">
          ¿Olvidaste tu passcode?
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Escribe tu correo institucional y responde tus preguntas de seguridad.
        </p>
      </AuthCardHeader>

      <form onSubmit={enviarCorreo} noValidate>
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <div className="mb-6">
          <label htmlFor="email-recuperacion" className={authLabelClass}>
            Correo SENA
          </label>
          <input
            id="email-recuperacion"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
            placeholder="usuario@sena.edu.co"
            className={authInputClass(!!errors.email)}
          />
          {errors.email && <p className={authErrorTextClass}>{errors.email}</p>}
        </div>

        <Button type="submit" variant="success" disabled={isLoading} className="w-full">
          {isLoading ? 'BUSCANDO' : 'CONTINUAR'}
        </Button>

        <div className="mt-4 text-center">
          <Link
            href="/admin/auth/login"
            className="text-xs text-gray-500 dark:text-slate-400 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>

        <BackToSiteLink className="mt-2" />
      </form>
    </div>
  );
}
