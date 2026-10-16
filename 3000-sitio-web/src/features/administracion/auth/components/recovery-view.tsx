'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import {
  AuthGeneralError,
  AuthTextField,
  authPasosCardClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
  authPasosHuecoClass,
  authPasosHuecoArribaClass,
} from './auth-ui';
import { MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { obtenerPreguntas } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña por preguntas de seguridad (RF-05), paso 1 de 4: el
 * correo. Siguen `/login/recovery/security-questions`,
 * `/login/recovery/reset-password` y `/login/recovery/reset-success`.
 *
 * Es la única pantalla del flujo que se puede abrir suelta: las demás dependen de
 * lo que esta deja en `useFlujoDeRecuperacion` (ver `flujo-de-recuperacion.tsx`).
 *
 * Diseño nuevo desde el 2026-10-09 (mockups de tablet y de móvil): `MarcoDePasos`.
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
      router.push('/login/recovery/security-questions');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarcoDePasos
      // El mockup corta tras «acceso»; en el móvil el corte lo decide el ancho.
      titulo={
        <>
          Recupera el acceso <span className="md:block">a tu cuenta</span>
        </>
      }
      descripcion="No te preocupes, vamos a ayudarte a restablecer tu contraseña de ingreso. Verifica que eres tú."
    >
      <div className={authPasosCardClass}>
        <form onSubmit={enviarCorreo} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <AuthTextField
            id="email-recuperacion"
            type="email"
            label="Ingresa tu correo SENA"
            placeholder="usuario@sena.edu.co"
            autoComplete="email"
            value={email}
            onChange={(valor) => { setEmail(valor); setErrors({}); }}
            error={errors.email}
            className={authPasosHuecoClass}
          />

          <button type="submit" disabled={isLoading} className={authPasosPrimaryClass}>
            {isLoading ? 'Buscando…' : 'Comenzar'}
          </button>
        </form>

        <div className={`${authPasosHuecoArribaClass} text-center`}>
          <Link href="/login" className={authPasosQuietLinkClass}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </MarcoDePasos>
  );
}
