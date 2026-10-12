import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  accesoCampoClass,
  accesoErrorClass,
  accesoEtiquetaClass,
  accesoHuecoClass,
  accesoIconoCampoClass,
  accesoOpcionesClass,
} from './acceso-ui';
import { BarrasDeAvance } from './barras-de-avance';

export interface CatalogQuestion {
  key: string;
  label: string;
}

interface QuestionPickerProps {
  catalogQuestions: CatalogQuestion[];
  totalQuestions: number;
  currentIndex: number;
  selectedKeys: string[];
  answers: string[];
  errors: { question?: string; answer?: string };
  onSelectQuestion: (key: string) => void;
  onAnswerChange: (value: string) => void;
}

/**
 * La pregunta de seguridad que toca, su respuesta y las barras de avance, en el primer
 * ingreso.
 *
 * Copia el paso de preguntas del sitio web (`AuthSelectField`, `AuthTextField` y
 * `AuthProgressDots` en `first-login-flow.tsx`), sobre el azul de la intranet (2026-10-11).
 * Hasta entonces iba con las clases `fl-*` de `globals.css`. El número de la pregunta no está
 * a la vista (lo dan las barras): lo dice la etiqueta oculta del desplegable.
 */
export function QuestionPicker({
  catalogQuestions,
  totalQuestions,
  currentIndex,
  selectedKeys,
  answers,
  errors,
  onSelectQuestion,
  onAnswerChange,
}: QuestionPickerProps) {
  const valor = selectedKeys[currentIndex] || '';

  return (
    <>
      <div className={accesoHuecoClass}>
        <label htmlFor="pregunta-seguridad" className="sr-only">
          Pregunta {currentIndex + 1} de {totalQuestions}
        </label>
        <div className="relative">
          <select
            id="pregunta-seguridad"
            value={valor}
            onChange={(e) => onSelectQuestion(e.target.value)}
            aria-invalid={errors.question ? true : undefined}
            aria-describedby={errors.question ? 'pregunta-seguridad-error' : undefined}
            // Sin elegir, el texto en el tono del marcador de los campos. Se cambia el color
            // en vez de añadir otro: dos clases de color en el mismo elemento las resuelve el
            // orden del CSS, no el del atributo.
            className={(() => {
              const clases = accesoCampoClass(
                !!errors.question,
                `appearance-none pr-12 ${accesoOpcionesClass}`,
                'rounded-[16px]',
              );
              return valor ? clases : clases.replace(' text-white ', ' text-white/65 ');
            })()}
          >
            <option value="" disabled>
              Selecciona una opción...
            </option>
            {catalogQuestions.map((q) => (
              <option
                key={q.key}
                value={q.key}
                // Ya elegida en otra pregunta: se ve, pero no se puede repetir.
                disabled={selectedKeys.includes(q.key) && selectedKeys[currentIndex] !== q.key}
              >
                {q.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className={`pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 ${accesoIconoCampoClass}`}
          />
        </div>
        {errors.question && (
          <p id="pregunta-seguridad-error" className={accesoErrorClass}>
            {errors.question}
          </p>
        )}
      </div>

      <div className={accesoHuecoClass}>
        <label htmlFor="respuesta-seguridad" className={accesoEtiquetaClass}>
          Respuesta
        </label>
        <input
          id="respuesta-seguridad"
          type="text"
          maxLength={255}
          placeholder="Tu respuesta"
          value={answers[currentIndex]}
          onChange={(e) => onAnswerChange(e.target.value)}
          // Se compara en minúsculas y sin espacios en el servidor: el autocorrector del
          // móvil solo puede estorbar.
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={errors.answer ? true : undefined}
          aria-describedby={errors.answer ? 'respuesta-seguridad-error' : undefined}
          className={accesoCampoClass(!!errors.answer)}
        />
        {errors.answer && (
          <p id="respuesta-seguridad-error" className={accesoErrorClass}>
            {errors.answer}
          </p>
        )}
      </div>

      <BarrasDeAvance total={totalQuestions} actual={currentIndex} />
    </>
  );
}
