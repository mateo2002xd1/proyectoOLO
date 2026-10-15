'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import {
  AuthGeneralError,
  PasswordField,
  PasswordRequisitos,
  authPasosCardClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
  authPasosHuecoClass,
  authPasosHuecoArribaClass,
} from './auth-ui';
import { MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { useRequisitosAlEnfocar } from '../hooks/use-requisitos-al-enfocar';
import { recuperarPassword } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña (RF-05), paso 3 de 4: la contraseña nueva.
 *
 * En la intranet esta ruta sirve también para el cambio forzado de una cuenta con
 * sesión. Aquí no: ese caso lo resuelve `/login/first-login`.
 *
 * Diseño nuevo desde el 2026-10-09 (mockup de tablet): saluda por el primer nombre, que
 * el servidor da al verificar las respuestas del paso anterior.
 */
export function ResetPasswordView() {
  const router = useRouter();
  const { recuperacion, terminarRecuperacion } = useFlujoDeRecuperacion();
  const datos = recuperacion?.etapa === 'nueva-contrasena' ? recuperacion : null;
  // Recién guardada, el contexto ya soltó los datos pero la navegación a
  // `/login/recovery/reset-success` aún no terminó: no es motivo para devolver al principio.
  const terminada = recuperacion?.etapa === 'terminada';

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const requisitos = useRequisitosAlEnfocar(password);

  // Sin respuestas verificadas no hay con qué cambiar la contraseña: el flujo
  // empieza por el correo.
  useEffect(() => {
    if (!datos && !terminada) router.replace('/login/recovery');
  }, [datos, terminada, router]);

  if (!datos && !terminada) return null;

  const guardarPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!datos) return;
    const problemas: Record<string, string> = {};

    if (!password) problemas.password = 'La nueva contraseña es requerida';
    else if (!cumplePolitica(password)) problemas.password = primerFallo(password) ?? '';

    if (!confirmacion) problemas.confirmacion = 'Confirma tu contraseña';
    else if (password !== confirmacion) problemas.confirmacion = 'Las contraseñas no coinciden';

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
      router.push('/login/recovery/reset-success');
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const nombre = datos?.nombre;

  return (
    <MarcoDePasos
      titulo={nombre ? `¡Enhorabuena, ${nombre}!` : '¡Enhorabuena!'}
      descripcion={[
        'Ahora puedes crear tu nueva contraseña.',
        'Asegúrate de que sea fácil de recordar para ti, pero difícil de adivinar para otros.',
      ]}
    >
      <div className={authPasosCardClass}>
        <form onSubmit={guardarPassword} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          {/* Sin el encabezado «Crea tu nueva contraseña» (lo quitó el usuario el 2026-10-11). */}
          <PasswordField
            id="nuevo-password"
            label="Nueva contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors({}); }}
            onFocus={requisitos.alEnfocar}
            describedBy={requisitos.visibles ? 'requisitos-nueva' : undefined}
            error={errors.password}
            className={requisitos.visibles ? 'mb-2 md:mb-3' : authPasosHuecoClass}
          />
          {requisitos.visibles && (
            <PasswordRequisitos id="requisitos-nueva" password={password} variant="solid" resumirAlCumplir className={authPasosHuecoClass} />
          )}

          <PasswordField
            id="confirmar-password"
            label="Ingresa nuevamente la contraseña"
            autoComplete="new-password"
            value={confirmacion}
            onChange={(v) => { setConfirmacion(v); setErrors({}); }}
            error={errors.confirmacion}
            className={authPasosHuecoClass}
          />

          <button type="submit" disabled={isLoading || terminada} className={authPasosPrimaryClass}>
            {isLoading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>

        {/* Cancelar: sale del flujo y la contraseña sigue siendo la de antes. Solo texto,
            sin fondo, como en la intranet. */}
        <div className={`${authPasosHuecoArribaClass} text-center`}>
          <Link href="/login" className={authPasosQuietLinkClass}>
            Cancelar
          </Link>
        </div>
      </div>
    </MarcoDePasos>
  );
}
