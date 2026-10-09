'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthGeneralError,
  AuthProgressDots,
  authPasosCardClass,
  authPasosCardHeadingClass,
  authPasosErrorTextClass,
  authPasosInputClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
} from './auth-ui';
import { MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { verificarRespuestas } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña (RF-05), paso 2 de 4: las preguntas de seguridad, de
 * una en una.
 *
 * En la intranet esta misma ruta sirve también para configurar las preguntas cuando
 * es lo único que le falta a la cuenta. Aquí no: esa configuración, sola o junto a la
 * contraseña, la resuelve entera `/first-login`, que pregunta al servidor qué falta.
 *
 * Diseño nuevo desde el 2026-10-09 (mockups de tablet): el número de la pregunta va en
 * el título, y en la tarjeta la pregunta se ve en una caja con la forma de un campo.
 * Esa caja es la `<label>` de la respuesta: pulsarla lleva al campo y el lector de
 * pantalla anuncia la pregunta al entrar en él.
 */
export function SecurityQuestionsView() {
  const router = useRouter();
  const { recuperacion, confirmarRespuestas } = useFlujoDeRecuperacion();
  const datos = recuperacion && recuperacion.etapa !== 'terminada' ? recuperacion : null;
  const total = datos?.preguntas.length ?? 0;

  const [respuestas, setRespuestas] = useState<string[]>(() => Array(total).fill(''));
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sin correo ni preguntas (se abrió la URL a mano, o se recargó) no hay nada que
  // preguntar: el flujo empieza por el correo.
  useEffect(() => {
    if (!datos) router.replace('/recovery');
  }, [datos, router]);

  if (!datos) return null;

  const respuestasParaApi = () =>
    datos.preguntas.map((pregunta, i) => ({ key: pregunta.key, answer: respuestas[i] ?? '' }));

  const siguientePregunta = async (e: FormEvent) => {
    e.preventDefault();
    if (!respuestas[preguntaActual]?.trim()) {
      setErrors({ answer: 'La respuesta es requerida' });
      return;
    }
    setErrors({});

    if (preguntaActual < total - 1) {
      setPreguntaActual((n) => n + 1);
      return;
    }

    // En la última se verifican las tres de golpe. Comprobarlas de una en una
    // convertiría la pantalla en un oráculo: se sabría cuál de las tres se falló.
    setIsLoading(true);
    try {
      const verificadas = respuestasParaApi();
      const { nombre } = await verificarRespuestas(datos.email, verificadas);
      confirmarRespuestas(verificadas, nombre);
      router.push('/reset-password');
    } catch (error) {
      setErrors({ general: (error as Error).message });
      // Se vuelve al principio del cuestionario: dejar las respuestas puestas
      // invitaría a ir cambiando una a una hasta acertar.
      setRespuestas(Array(total).fill(''));
      setPreguntaActual(0);
    } finally {
      setIsLoading(false);
    }
  };

  const anteriorPregunta = () => {
    setErrors({});
    setPreguntaActual((n) => Math.max(0, n - 1));
  };

  const pregunta = datos.preguntas[preguntaActual];

  return (
    <MarcoDePasos
      titulo={
        <>
          Validación de identidad{' '}
          <span className="block">
            (Pregunta de seguridad {preguntaActual + 1} de {total})
          </span>
        </>
      }
      descripcion={[
        'Responde correctamente a tus preguntas de seguridad.',
        // El mockup dice «coincidir exactamente», pero el servidor compara sin
        // mayúsculas y sin los espacios de los extremos (`trim().toLowerCase()`).
        'Recuerda que las respuestas deben coincidir con las que asignaste la primera vez. No importan las mayúsculas.',
      ]}
    >
      <div className={authPasosCardClass}>
        <form onSubmit={siguientePregunta} noValidate>
          {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

          <h2 className={`mb-3 ${authPasosCardHeadingClass}`}>Responde tus preguntas</h2>

          {/* Mide lo mismo que un campo (`authPasosInputClass`): 44 px de alto y el mismo
              relleno. Si la pregunta es larga, crece hacia abajo; por eso sus esquinas son de
              16 (`rounded-xl` en este sitio), como los mensajes de estado, y no de 32. */}
          <label
            htmlFor="respuesta"
            className="mb-6 block min-h-11 rounded-xl border border-[#d9d9d9] px-5 py-2 text-base text-[#001a39]"
          >
            <span className="sr-only">
              Pregunta {preguntaActual + 1} de {total}:{' '}
            </span>
            {pregunta?.label}
          </label>

          <div className="mb-6">
            <input
              id="respuesta"
              type="text"
              placeholder="Respuesta"
              value={respuestas[preguntaActual] ?? ''}
              onChange={(e) => {
                const copia = [...respuestas];
                copia[preguntaActual] = e.target.value;
                setRespuestas(copia);
                setErrors({});
              }}
              autoComplete="off"
              // La respuesta se compara en minúsculas y sin espacios en el servidor,
              // así que el autocorrector del móvil solo puede estorbar.
              autoCapitalize="none"
              autoCorrect="off"
              aria-invalid={errors.answer ? true : undefined}
              aria-describedby={errors.answer ? 'respuesta-error' : undefined}
              className={authPasosInputClass(!!errors.answer)}
            />
            {errors.answer && (
              <p id="respuesta-error" className={authPasosErrorTextClass}>
                {errors.answer}
              </p>
            )}
          </div>

          <AuthProgressDots total={total} current={preguntaActual} className="mb-6" />

          <button type="submit" disabled={isLoading} className={authPasosPrimaryClass}>
            {isLoading ? 'Verificando…' : 'Continuar'}
          </button>
        </form>

        {/* En la primera pregunta, la salida al login del mockup; en las siguientes, el
            mockup deja ese hueco vacío y aquí va la vuelta a la pregunta anterior. */}
        <div className="mt-6 text-center">
          {preguntaActual === 0 ? (
            <Link href="/login" className={authPasosQuietLinkClass}>
              Iniciar sesión
            </Link>
          ) : (
            <button type="button" onClick={anteriorPregunta} className={authPasosQuietLinkClass}>
              Volver a la pregunta anterior
            </button>
          )}
        </div>
      </div>
    </MarcoDePasos>
  );
}
