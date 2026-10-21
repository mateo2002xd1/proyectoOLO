'use client';

import { useState, FormEvent, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, useAuth } from '@/features/login';
import {
  cumplePolitica,
  esPasswordRepetida,
  MENSAJE_PASSWORD_REPETIDA,
  primerFallo,
  repiteLaPassword,
} from '@olo/password-policy';
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
} from './acceso-ui';
import { mensajeDeError } from '@/shared/lib/api/errors';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

/**
 * Para qué se usa la pantalla. Lo dice la página que la monta, porque cada flujo tiene
 * su dirección (2026-10-15):
 *
 * - `recuperacion` — `/login/recovery/reset-password`: quien olvidó su contraseña y ya
 *   respondió sus preguntas. Sin sesión; los datos los deja el paso anterior.
 * - `cambio-obligatorio` — `/login/first-login/change-password`: quien entró con una
 *   temporal que restableció un administrador. Con sesión; pide la contraseña actual.
 *
 * Antes la vista adivinaba el modo por lo que hubiera en `sessionStorage`, y unos datos
 * de una recuperación a medias la ponían en el modo equivocado.
 */
export type ModoCambioDePassword = 'recuperacion' | 'cambio-obligatorio';

/* sessionStorage es un sistema externo a React. Se lee con useSyncExternalStore
   en vez de copiarlo a un useState desde un efecto: getServerSnapshot devuelve
   null, asi que el servidor y la hidratacion coinciden, y tras montar el cliente
   ya lee el valor real. El snapshot es un string primitivo, por lo que no hace
   falta cachearlo. No hay evento de cambio, de ahi la suscripcion vacia. */
function subscribeToSessionStorage() {
  return () => { };
}

/** `'si'` si el paso de las preguntas dejó el correo y las respuestas; `''` si no. */
const getDatosSnapshot = (): string =>
  sessionStorage.getItem('recoveryEmail') && sessionStorage.getItem('recoveryAnswers') ? 'si' : '';

/** En el servidor no hay sessionStorage: aún no se sabe. */
const getDatosServerSnapshot = (): null => null;

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

export function ResetPasswordView({ modo }: { modo: ModoCambioDePassword }) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Solo hace falta saber si los datos están: el correo y las respuestas se leen
  // directamente al enviar, que es el unico sitio donde se usan.
  const datos = useSyncExternalStore(
    subscribeToSessionStorage,
    getDatosSnapshot,
    getDatosServerSnapshot,
  );
  const nombre = useSyncExternalStore(subscribeToSessionStorage, getNombreSnapshot, getNombreServerSnapshot);

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; password?: string; confirm?: string; general?: string }>({});
  // Rechazada aunque cumple todos los requisitos (repite la actual o la anterior): el aviso
  // rojo va en el lugar de «Cumple todos los requisitos».
  const rechazoDeLaNueva = errors.password && cumplePolitica(password) ? errors.password : undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    if (modo === 'cambio-obligatorio' && !authLoading && !user) {
      router.push('/login');
    }
    // Sin lo que deja el paso de las preguntas no hay nada que recuperar: al principio.
    if (modo === 'recuperacion' && datos === '') {
      router.push('/login/recovery');
    }
  }, [modo, datos, authLoading, user, router, isSubmitted]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (modo === 'cambio-obligatorio' && !currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Consideración 4: recuperación y cambio forzado aplican exactamente las mismas
    // reglas que el primer ingreso. `currentPassword` no se mide contra la política
    // —es la que el usuario ya tiene, no la que está eligiendo—.
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!cumplePolitica(password)) {
      newErrors.password = primerFallo(password) ?? '';
    } else if (modo === 'cambio-obligatorio' && repiteLaPassword(password, currentPassword)) {
      // Igual a la actual que acaba de escribir: no hace falta preguntar al servidor.
      newErrors.password = MENSAJE_PASSWORD_REPETIDA;
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
      if (modo === 'recuperacion') {
        const { email, answers } = leerDatosDeRecuperacion();
        await authApi.recoverPassword(email, answers, password);
      } else {
        await authApi.changePassword(currentPassword, password);
      }

      setIsSubmitted(true);
      // Cada flujo cierra en su propia dirección.
      router.push(modo === 'recuperacion' ? '/login/recovery/reset-success' : '/login/first-login/change-success');
    } catch (error) {
      setIsSubmitted(false);
      // Repite la actual o la anterior: el aviso va en el campo de la nueva, con su borde
      // rojo (pedido del usuario, 2026-10-15).
      if (esPasswordRepetida(error)) {
        setErrors({ password: mensajeDeError(error) });
        return;
      }
      setErrors({ general: mensajeDeError(error, 'Error de conexión con el servidor') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSubmitted && (modo === 'recuperacion' ? !datos : authLoading || !user)) {
    return null;
  }

  return (
    // Tarjeta blanca desde `md`, como el login (2026-10-12): primero en la recuperación y el
    // mismo día también en el cambio forzado del primer ingreso.
    <MarcoAcceso
      enBlanco
      // En la recuperación, los textos del sitio web (pedido del usuario, 2026-10-11): el
      // saludo con el primer nombre y dos párrafos. Antes, «Crea tu nueva contraseña» y «Elige
      // una clave que no hayas usado antes.». El cambio forzado (con sesión) no cambia.
      titulo={
        modo === 'cambio-obligatorio'
          ? 'Crea tu nueva contraseña'
          : nombre
            ? `¡Enhorabuena, ${nombre}!`
            : '¡Enhorabuena!'
      }
      descripcion={
        modo === 'cambio-obligatorio'
          ? 'Has ingresado con un código temporal. Por tu seguridad, crea una nueva clave privada.'
          : [
              'Ahora puedes crear tu nueva contraseña.',
              'Asegúrate de que sea fácil de recordar para ti, pero difícil de adivinar para otros.',
            ]
      }
      cerrarSesionAlSalir={modo === 'cambio-obligatorio'}
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <MensajeEstado tipo="error" rol="alert" className={accesoErrorGeneralClass}>
            {errors.general}
          </MensajeEstado>
        )}

        {modo === 'cambio-obligatorio' && (
          <PasswordField
            id="currentPassword"
            label="Contraseña actual"
            placeholder="Tu contraseña actual"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(v) => { setCurrentPassword(v); setErrors({}); }}
            error={errors.currentPassword}
            enBlanco
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
          textoDeErrorAparte={Boolean(rechazoDeLaNueva)}
          enBlanco
          className="mb-2 md:mb-3"
        />
        <PasswordRequisitos
          password={password}
          variant="solid"
          className={accesoHuecoClass}
          resumirAlCumplir
          rechazo={rechazoDeLaNueva}
          enBlanco
        />

        <PasswordField
          id="confirmPassword"
          label="Ingresa nuevamente la contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setErrors({}); }}
          error={errors.confirm}
          enBlanco
          className={accesoHuecoClass}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`${accesoBotonClass} ${accesoBotonEnBlancoClass}`}
        >
          {isLoading ? 'Guardando…' : 'Guardar contraseña'}
        </button>

        {/* Cancelar: la contraseña sigue siendo la de antes. Solo texto, sin fondo, como
            los demás enlaces de salida del acceso. Con sesión (cambio forzado) hay que
            cerrarla, o el proxy devolvería aquí; en la recuperación se sueltan sus datos
            para que el próximo intento empiece por el correo. */}
        <div className={`${accesoHuecoArribaClass} text-center`}>
          {modo === 'cambio-obligatorio' ? (
            <button
              type="button"
              onClick={() => logout()}
              className={`${accesoEnlaceClass} ${accesoEnlaceEnBlancoClass}`}
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
