'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/atoms/button';
import {
  AuthCardTitle,
  AuthGeneralError,
  AuthProgressDots,
  AuthTextField,
  authQuietLinkClass,
  authSolidCardClass,
} from './auth-ui';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';
import { verificarRespuestas } from '../services/recuperacion.service';

/**
 * Recuperación de contraseña (RF-05), paso 2 de 4: las preguntas de seguridad, de
 * una en una.
 *
 * En la intranet esta misma ruta sirve también para configurar las preguntas cuando
 * es lo único que le falta a la cuenta. Aquí no: esa configuración, sola o junto a la
 * contraseña, la resuelve entera `/first-login`, que pregunta al servidor qué falta.
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
      await verificarRespuestas(datos.email, verificadas);
      confirmarRespuestas(verificadas);
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
  const esUltima = preguntaActual === total - 1;

  return (
    <div className={authSolidCardClass}>
      <AuthCardTitle
        title="Verifica tu identidad"
        description={`Responde las ${total} preguntas que elegiste al configurar tu cuenta.`}
      />

      <form onSubmit={siguientePregunta} noValidate>
        {errors.general && <AuthGeneralError>{errors.general}</AuthGeneralError>}

        <AuthTextField
          id="respuesta"
          label={
            <>
              {/* `gray-500` y no `gray-400`: es texto, y el 400 se queda en 2.6:1
                  contra el blanco de la tarjeta (9-accesibilidad.md §2.1). */}
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Pregunta {preguntaActual + 1} de {total}
              </span>
              {pregunta?.label}
            </>
          }
          value={respuestas[preguntaActual] ?? ''}
          onChange={(valor) => {
            const copia = [...respuestas];
            copia[preguntaActual] = valor;
            setRespuestas(copia);
            setErrors({});
          }}
          error={errors.answer}
          autoComplete="off"
          // La respuesta se compara en minúsculas y sin espacios en el servidor,
          // así que el autocorrector del móvil solo puede estorbar.
          autoCapitalize="none"
          autoCorrect="off"
          className="mb-5"
        />

        <AuthProgressDots total={total} current={preguntaActual} />

        <Button type="submit" variant="navy" disabled={isLoading} className="w-full">
          {isLoading ? 'Verificando…' : esUltima ? 'Verificar' : 'Siguiente'}
        </Button>

        {preguntaActual > 0 && (
          <div className="mt-4 text-center">
            <button type="button" onClick={anteriorPregunta} className={authQuietLinkClass}>
              Volver a la pregunta anterior
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
