'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validarEmail } from '@olo/email-policy';
import { authApi } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import {
  accesoBotonClass,
  accesoCampoClass,
  accesoEnlaceClass,
  accesoErrorClass,
  accesoErrorGeneralClass,
  accesoEtiquetaClass,
} from './acceso-ui';
import { mensajeDeError } from '@/shared/lib/errors';

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
        router.push('/security-questions');
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
    <MarcoAcceso
      titulo="¿Olvidaste tu contraseña?"
      descripcion="No te preocupes, vamos a ayudarte a restablecerla, verifica que eres tú."
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <div className={accesoErrorGeneralClass} role="alert">
            {generalError}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="email" className={accesoEtiquetaClass}>
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
            className={accesoCampoClass(!!error)}
          />
          {error && <p className={accesoErrorClass}>{error}</p>}
        </div>

        <button type="submit" disabled={isLoading} className={accesoBotonClass}>
          {isLoading ? 'Buscando...' : 'Continuar'}
        </button>

        <div className="mt-4 text-center">
          <Link href="/login" className={accesoEnlaceClass}>
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </MarcoAcceso>
  );
}
