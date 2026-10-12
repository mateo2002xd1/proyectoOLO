'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthGeneralError,
  AuthProgressDots,
  authPasosCardClass,
  authPasosErrorTextClass,
  authPasosInputClass,
  authPasosPrimaryClass,
  authPasosQuietLinkClass,
  authPasosHuecoClass,
  authPasosHuecoArribaClass,
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
 * Diseño nuevo desde el 2026-10-09 (mockups de tablet): bajo «Preguntas de seguridad»
 * la pregunta se ve en una caja con la forma de un campo, y el avance en tres barras.
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
      titulo="Validación de identidad"
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

          {/* El diseño de «Verifica tu identidad» de la intranet (pedido del usuario,
              2026-10-11): «PREGUNTA 1 DE 3» en pequeño y mayúsculas, la pregunta como
              etiqueta del campo y, bajo el campo, los puntos de avance. Antes iba el
              encabezado «Preguntas de seguridad», la pregunta en una caja con borde y sin el
              número a la vista (que el usuario había quitado el 2026-10-09). */}
          <div className={authPasosHuecoClass}>
            <label htmlFor="respuesta" className="mb-1 block text-sm font-medium text-[#001a39] md:mb-2 md:text-base">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                Pregunta {preguntaActual + 1} de {total}
              </span>
              {pregunta?.label}
            </label>
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

          <AuthProgressDots total={total} current={preguntaActual} variante="puntos" className={authPasosHuecoClass} />

          <button type="submit" disabled={isLoading} className={authPasosPrimaryClass}>
            {isLoading ? 'Verificando…' : 'Continuar'}
          </button>
        </form>

        {/* En la primera pregunta, la salida al login del mockup; en las siguientes, el
            mockup deja ese hueco vacío y aquí va la vuelta a la pregunta anterior. */}
        <div className={`${authPasosHuecoArribaClass} text-center`}>
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
