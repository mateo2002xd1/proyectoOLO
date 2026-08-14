'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { validarEmail } from '@olo/email-policy';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { Button } from '@/shared/ui/atoms/button';
import {
  AuthCardTitle,
  AuthGeneralError,
  AuthProgressDots,
  AuthSuccessBadge,
  AuthTextField,
  PasswordField,
  PasswordRequisitos,
  authNavyActionClass,
  authQuietLinkClass,
  authSolidCardClass,
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
 *
 * El marco (`AuthSplitShell`) lo monta la ruta, igual que en el primer ingreso:
 * aquí solo va la tarjeta, para que las tres pantallas de autenticación se vean
 * como una sola cosa.
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
      <div className={`${authSolidCardClass} text-center`}>
        <AuthSuccessBadge />
        <AuthCardTitle
          className="mb-6"
          title="Tu passcode se actualizó"
          description="Ya puedes entrar al panel con tu nuevo passcode."
        />
        <Link href="/admin/login" className={authNavyActionClass}>
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  if (paso === 'password') {
    return (
      <div className={authSolidCardClass}>
        <AuthCardTitle
          title="Crea tu nuevo passcode"
          description="Verificamos tu identidad. Elige una clave que no hayas usado antes."
        />

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
          <PasswordRequisitos password={password} variant="solid" />

          <PasswordField
            id="confirmar-password"
            label="Ingresa nuevamente el passcode"
            autoComplete="new-password"
            value={confirmacion}
            onChange={(v) => { setConfirmacion(v); setErrors({}); }}
            error={errors.confirmacion}
            className="mb-6"
          />

          <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
            {isLoading ? 'Guardando…' : 'Guardar passcode'}
          </Button>
        </form>
      </div>
    );
  }

  if (paso === 'preguntas') {
    const pregunta = preguntas[preguntaActual];
    const esUltima = preguntaActual === preguntas.length - 1;

    return (
      <div className={authSolidCardClass}>
        <AuthCardTitle
          title="Verifica tu identidad"
          description={`Responde las ${preguntas.length} preguntas que elegiste al configurar tu cuenta.`}
        />

        <form onSubmit={siguientePregunta} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <AuthTextField
            id="respuesta"
            label={
              <>
                {/* `gray-500` y no `gray-400`: es texto, y el 400 se queda en 2.6:1
                    contra el blanco de la tarjeta (9-accesibilidad.md §2.1). */}
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Pregunta {preguntaActual + 1} de {preguntas.length}
                </span>
                {pregunta?.label}
              </>
            }
            value={respuestas[preguntaActual] ?? ''}
            onChange={(valor) => {
              const copia = [...respuestas];
              copia[preguntaActual] = valor;
              setRespuestas(copia);
              setErrors({});
            }}
            error={errors.answer}
            autoComplete="off"
            // La respuesta se compara en minúsculas y sin espacios en el servidor,
            // así que el autocorrector del móvil solo puede estorbar.
            autoCapitalize="none"
            autoCorrect="off"
            className="mb-5"
          />

          <AuthProgressDots total={preguntas.length} current={preguntaActual} />

          <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
            {isLoading ? 'Verificando…' : esUltima ? 'Verificar' : 'Siguiente'}
          </Button>

          {preguntaActual > 0 && (
            <div className="mt-4 text-center">
              <button type="button" onClick={anteriorPregunta} className={authQuietLinkClass}>
                Volver a la pregunta anterior
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className={authSolidCardClass}>
      <AuthCardTitle
        title="¿Olvidaste tu passcode?"
        description="Escribe tu correo institucional y te preguntaremos por tus preguntas de seguridad."
      />

      <form onSubmit={enviarCorreo} noValidate>
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <AuthTextField
          id="email-recuperacion"
          type="email"
          label="Correo SENA"
          placeholder="usuario@sena.edu.co"
          autoComplete="email"
          value={email}
          onChange={(valor) => { setEmail(valor); setErrors({}); }}
          error={errors.email}
          className="mb-6"
        />

        <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
          {isLoading ? 'Buscando…' : 'Continuar'}
        </Button>

        <div className="mt-4 text-center">
          <Link href="/admin/login" className={authQuietLinkClass}>
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
