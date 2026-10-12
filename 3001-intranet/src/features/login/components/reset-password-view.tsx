'use client';

import { useState, FormEvent, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/login';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { PasswordField } from '@/shared/ui/molecules/password-field';
import { PasswordRequisitos } from '@/shared/ui/molecules/password-requisitos';
import { MarcoAcceso } from './marco-acceso';
import {
  accesoBotonClass,
  accesoBotonEnBlancoClass,
  accesoEnlaceClass,
  accesoEnlaceEnBlancoClass,
  accesoErrorGeneralClass,
  accesoHuecoArribaClass,
  accesoHuecoClass,
  accesoTarjetaBlancaClass,
} from './acceso-ui';
import { mensajeDeError } from '@/shared/lib/errors';

/* sessionStorage es un sistema externo a React. Se lee con useSyncExternalStore
   en vez de copiarlo a un useState desde un efecto: getServerSnapshot devuelve
   null, asi que el servidor y la hidratacion coinciden, y tras montar el cliente
   ya lee el valor real. El snapshot es un string primitivo, por lo que no hace
   falta cachearlo. No hay evento de cambio, de ahi la suscripcion vacia. */
function subscribeToSessionStorage() {
  return () => { };
}

const getModeSnapshot = (): 'recovery' | 'forced' =>
  sessionStorage.getItem('recoveryEmail') && sessionStorage.getItem('recoveryAnswers')
    ? 'recovery'
    : 'forced';

/** En el servidor no hay sessionStorage: sin modo aun. */
const getModeServerSnapshot = (): null => null;

/** Primer nombre que dio el servidor al verificar las respuestas (`recoveryName`). */
const getNombreSnapshot = (): string | null => sessionStorage.getItem('recoveryName');
const getNombreServerSnapshot = (): null => null;

/** Datos de recuperacion guardados por el paso anterior del flujo. */
function leerDatosDeRecuperacion(): { email: string; answers: Array<{ key: string; answer: string }> } {
  const email = sessionStorage.getItem('recoveryEmail') ?? '';
  const crudas = sessionStorage.getItem('recoveryAnswers');
  try {
    return { email, answers: crudas ? JSON.parse(crudas) : [] };
  } catch {
    return { email, answers: [] };
  }
}

export function ResetPasswordView() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Solo `mode` necesita ser reactivo: el correo y las respuestas se leen
  // directamente al enviar, que es el unico sitio donde se usan.
  const mode = useSyncExternalStore(
    subscribeToSessionStorage,
    getModeSnapshot,
    getModeServerSnapshot,
  );
  const nombre = useSyncExternalStore(subscribeToSessionStorage, getNombreSnapshot, getNombreServerSnapshot);

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; password?: string; confirm?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    if (mode === 'forced' && !authLoading && !user) {
      router.push('/login');
    }
  }, [mode, authLoading, user, router, isSubmitted]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (mode === 'forced' && !currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Consideración 4: recuperación y cambio forzado aplican exactamente las mismas
    // reglas que el primer ingreso. `currentPassword` no se mide contra la política
    // —es la que el usuario ya tiene, no la que está eligiendo—.
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!cumplePolitica(password)) {
      newErrors.password = primerFallo(password) ?? '';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'recovery') {
        const { email, answers } = leerDatosDeRecuperacion();
        await authApi.recoverPassword(email, answers, password);
      } else {
        await authApi.changePassword(currentPassword, password);
      }

      setIsSubmitted(true);
      router.push('/reset-success');
    } catch (error) {
      setIsSubmitted(false);
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSubmitted && (mode === null || (mode === 'forced' && (authLoading || !user)))) {
    return null;
  }

  // La recuperación va en tarjeta blanca desde `md`, como el login (2026-10-12). El cambio
  // forzado sigue sobre el azul.
  const enBlanco = mode === 'recovery';

  return (
    <MarcoAcceso
      claseTarjeta={enBlanco ? accesoTarjetaBlancaClass : ''}
      // En la recuperación, los textos del sitio web (pedido del usuario, 2026-10-11): el
      // saludo con el primer nombre y dos párrafos. Antes, «Crea tu nueva contraseña» y «Elige
      // una clave que no hayas usado antes.». El cambio forzado (con sesión) no cambia.
      titulo={
        mode === 'forced'
          ? 'Crea tu nueva contraseña'
          : nombre
            ? `¡Enhorabuena, ${nombre}!`
            : '¡Enhorabuena!'
      }
      descripcion={
        mode === 'forced'
          ? 'Has ingresado con un código temporal. Por tu seguridad, crea una nueva clave privada.'
          : [
              'Ahora puedes crear tu nueva contraseña.',
              'Asegúrate de que sea fácil de recordar para ti, pero difícil de adivinar para otros.',
            ]
      }
      cerrarSesionAlSalir={mode === 'forced'}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div className={accesoErrorGeneralClass} role="alert">
            {errors.general}
          </div>
        )}

        {mode === 'forced' && (
          <PasswordField
            id="currentPassword"
            label="Contraseña actual"
            placeholder="Tu contraseña actual"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(v) => { setCurrentPassword(v); setErrors({}); }}
            error={errors.currentPassword}
            enBlanco={enBlanco}
            className={accesoHuecoClass}
          />
        )}

        <PasswordField
          id="password"
          label="Nueva contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          value={password}
          onChange={(v) => { setPassword(v); setErrors({}); }}
          error={errors.password}
          enBlanco={enBlanco}
          className="mb-2 md:mb-3"
        />
        <PasswordRequisitos password={password} variant="solid" className={accesoHuecoClass} resumirAlCumplir enBlanco={enBlanco} />

        <PasswordField
          id="confirmPassword"
          label="Ingresa nuevamente la contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
          error={errors.confirm}
          enBlanco={enBlanco}
          className={accesoHuecoClass}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={enBlanco ? `${accesoBotonClass} ${accesoBotonEnBlancoClass}` : accesoBotonClass}
        >
          {isLoading ? 'Guardando…' : 'Guardar contraseña'}
        </button>

        {/* Cancelar: la contraseña sigue siendo la de antes. Solo texto, sin fondo, como
            los demás enlaces de salida del acceso. Con sesión (cambio forzado) hay que
            cerrarla, o el proxy devolvería aquí; en la recuperación se sueltan sus datos
            para que el próximo intento empiece por el correo. */}
        <div className={`${accesoHuecoArribaClass} text-center`}>
          {mode === 'forced' ? (
            <button
              type="button"
              onClick={() => logout()}
              className={accesoEnlaceClass}
            >
              Cancelar
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => {
                sessionStorage.removeItem('recoveryEmail');
                sessionStorage.removeItem('recoveryQuestions');
                sessionStorage.removeItem('recoveryAnswers');
                sessionStorage.removeItem('recoveryName');
              }}
              className={`${accesoEnlaceClass} ${accesoEnlaceEnBlancoClass}`}
            >
              Cancelar
            </Link>
          )}
        </div>
      </form>
    </MarcoAcceso>
  );
}
