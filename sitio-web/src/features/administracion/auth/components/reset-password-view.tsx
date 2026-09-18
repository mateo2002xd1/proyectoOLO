'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { Button } from '@/shared/ui/atoms/button';
import {
  AuthCardTitle,
  AuthGeneralError,
  PasswordField,
  PasswordRequisitos,
  authSolidCardClass,
} from './auth-ui';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { recuperarPassword } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña (RF-05), paso 3 de 4: la contraseña nueva.
 *
 * En la intranet esta ruta sirve también para el cambio forzado de una cuenta con
 * sesión. Aquí no: ese caso lo resuelve `/first-login`.
 */
export function ResetPasswordView() {
  const router = useRouter();
  const { recuperacion, terminarRecuperacion } = useFlujoDeRecuperacion();
  const datos = recuperacion?.etapa === 'nueva-contrasena' ? recuperacion : null;
  // Recién guardada, el contexto ya soltó los datos pero la navegación a
  // `/reset-success` aún no terminó: no es motivo para devolver al principio.
  const terminada = recuperacion?.etapa === 'terminada';

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sin respuestas verificadas no hay con qué cambiar la contraseña: el flujo
  // empieza por el correo.
  useEffect(() => {
    if (!datos && !terminada) router.replace('/recovery');
  }, [datos, terminada, router]);

  if (!datos && !terminada) return null;

  const guardarPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!datos) return;
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
      await recuperarPassword(datos.email, datos.respuestas, password);
      terminarRecuperacion();
      router.push('/reset-success');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

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

        <Button type="submit" variant="navy" disabled={isLoading || terminada} className="w-full">
          {isLoading ? 'Guardando…' : 'Guardar passcode'}
        </Button>
      </form>
    </div>
  );
}
