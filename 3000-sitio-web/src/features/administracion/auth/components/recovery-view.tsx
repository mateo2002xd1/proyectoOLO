'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { Button } from '@/shared/ui/atoms/button';
import {
  AuthCardTitle,
  AuthGeneralError,
  AuthTextField,
  authQuietLinkClass,
  authSolidCardClass,
} from './auth-ui';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { obtenerPreguntas } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña por preguntas de seguridad (RF-05), paso 1 de 4: el
 * correo. Siguen `/security-questions`, `/reset-password` y `/reset-success`.
 *
 * Es la única pantalla del flujo que se puede abrir suelta: las demás dependen de
 * lo que esta deja en `useFlujoDeRecuperacion` (ver `flujo-de-recuperacion.tsx`).
 */
export function RecoveryView() {
  const router = useRouter();
  const { empezarRecuperacion } = useFlujoDeRecuperacion();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

      empezarRecuperacion(email, encontradas);
      router.push('/security-questions');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={authSolidCardClass}>
      <AuthCardTitle
        title="¿Olvidaste tu contraseña?"
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
          <Link href="/login" className={authQuietLinkClass}>
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
