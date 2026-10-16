'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { authApi } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import {
  accesoBotonClass,
  accesoBotonEnBlancoClass,
  accesoCampoClass,
  accesoCampoEnBlancoClass,
  accesoEnlaceClass,
  accesoEnlaceEnBlancoClass,
  accesoErrorClass,
  accesoErrorEnBlancoClass,
  accesoErrorGeneralClass,
  accesoHuecoArribaClass,
  accesoHuecoClass,
  accesoEtiquetaClass,
  accesoEtiquetaEnBlancoClass,
} from './acceso-ui';
import { mensajeDeError } from '@/shared/lib/errors';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

export function RecoveryView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const validate = (): boolean => {
    const fallo = validarEmail(email);
    if (fallo) {
      setError(fallo);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');
    setGeneralError('');

    try {
      const data = await authApi.getUserQuestions(email);

      if (data.questions && data.questions.length > 0) {
        sessionStorage.setItem('recoveryEmail', email);
        sessionStorage.setItem('recoveryQuestions', JSON.stringify(data.questions));
        router.push('/login/recovery/security-questions');
      } else {
        setGeneralError('No se encontraron preguntas de seguridad para este correo.');
      }
    } catch (error) {
      setGeneralError(mensajeDeError(error, 'Error de conexión con el servidor'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Tarjeta blanca desde `md`, como el login (las clases `…EnBlanco`, 2026-10-12).
    <MarcoAcceso
      enBlanco
      titulo="¿Olvidaste tu contraseña?"
      descripcion="No te preocupes, vamos a ayudarte a restablecerla, verifica que eres tú."
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <MensajeEstado tipo="error" rol="alert" className={accesoErrorGeneralClass}>
            {generalError}
          </MensajeEstado>
        )}

        <div className={accesoHuecoClass}>
          <label htmlFor="email" className={`${accesoEtiquetaClass} ${accesoEtiquetaEnBlancoClass}`}>
            Correo SENA
          </label>
          <input
            id="email"
            type="email"
            maxLength={100}
            placeholder="usuario@sena.edu.co"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className={accesoCampoClass(!!error, accesoCampoEnBlancoClass(!!error))}
          />
          {error && <p className={`${accesoErrorClass} ${accesoErrorEnBlancoClass}`}>{error}</p>}
        </div>

        <button type="submit" disabled={isLoading} className={`${accesoBotonClass} ${accesoBotonEnBlancoClass}`}>
          {isLoading ? 'Buscando...' : 'Continuar'}
        </button>

        <div className={`${accesoHuecoArribaClass} text-center`}>
          <Link href="/login" className={`${accesoEnlaceClass} ${accesoEnlaceEnBlancoClass}`}>
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </MarcoAcceso>
  );
}
