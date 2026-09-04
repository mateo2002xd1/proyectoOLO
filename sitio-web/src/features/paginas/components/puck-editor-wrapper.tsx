'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Puck, createUsePuck, Data } from '@puckeditor/core';
import '@puckeditor/core/dist/index.css';
import { configDeEdicion, type ContextoDeEdicion } from '@/config/puck.config';
import { resolverRutaDeVuelta } from '../lib/ruta-de-vuelta';
import { Bloque, PuckData, EstadoPagina } from '../types';
import { AvisoRechazo, type Rechazo } from './aviso-rechazo';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { validarAccesibilidad, mensajeDeViolacion, type ViolacionAccesibilidad } from '@olo/accessibility-policy';

/**
 * Cómo se nombra cada estado en la bandera.
 *
 * Se escriben a mano en vez de sacarlos de la clave con un `replace('_',' ')`:
 * así «en_revision» sale como «En revisión», con su tilde.
 *
 * El color de cada uno vive en `globals.css` y no aquí: la bandera se pinta
 * sobre el marcado que trae Puck, al que solo se llega por CSS.
 */
const ETIQUETA_ESTADO: Record<string, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  rechazado: 'Rechazado',
  archivado: 'Archivado',
};

interface PuckEditorWrapperProps {
  /** Slug editado. Decide el catálogo de bloques y se pinta en la bandera. */
  slug: string;
  initialData?: PuckData | Bloque[];
  onSave: (contenido: PuckData) => Promise<unknown>;
  onPublish?: () => Promise<unknown>;
  /** A dónde vuelve "Salir" si no llegó un `?volver=` en la URL. */
  rutaPorDefecto: string;
  /** Estado de la versión que se está editando. Tiñe la bandera. */
  estado?: EstadoPagina | null;
  /** Presente solo si la versión que se está editando fue rechazada. */
  rechazo?: Rechazo;
  /**
   * El resto de la página, para pintarlo inerte alrededor de lo editable.
   * Lo resuelve el Server Component del editor; ver `configDeEdicion`.
   */
  contexto?: ContextoDeEdicion;
  /**
   * Nombre de quien nos quitó el candado de edición mientras trabajábamos.
   *
   * Con esto puesto el editor sigue en pantalla —para poder copiar lo que se llevara
   * hecho— pero no deja guardar: quien tiene ahora la página no debe recibir un
   * borrador nuestro encima del suyo.
   */
  candadoPerdidoPor?: string | null;
}

/** Con selector, para no re-renderizar la cabecera ante cualquier cambio del editor. */
const usePuckSel = createUsePuck();

interface AccionesCabeceraProps {
  bloqueado: boolean;
  busy: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  puedeEnviar: boolean;
  /** Punto de la historia de Puck en el que se guardó por última vez. */
  indiceGuardado: number;
  /** Reciben el índice actual para poder marcar hasta dónde quedó guardado. */
  onGuardar: (indiceHistoria: number) => void;
  onEnviar: (indiceHistoria: number) => void;
  onSalir: (hayCambiosSinGuardar: boolean) => void;
  /**
   * Sube al wrapper el índice de la historia y si hay cambios pendientes.
   *
   * La historia de Puck solo se puede leer desde dentro de su árbol, y el cierre por
   * inactividad se decide fuera. Sin este puente, guardar antes de cerrar tendría que
   * hacerse a ciegas —creando una versión nueva en cada cierre aunque nadie hubiera
   * tocado nada— o no hacerse.
   */
  onEstadoDeCambios: (indiceHistoria: number, hayCambiosSinGuardar: boolean) => void;
  /** Nos quitaron el candado: se puede mirar y copiar, pero no guardar. */
  sinCandado: boolean;
}

/**
 * Acciones de la cabecera del editor.
 *
 * Vive dentro del árbol de Puck para poder leer su historia, que es la señal
 * fiable de "aquí se ha tocado algo": cada acción deshacible avanza el índice.
 * Comparar el JSON contra el contenido inicial no vale — Puck no emite `onChange`
 * al montar, así que el primer cambio de verdad se confundía con la línea base y
 * salir descartaba trabajo sin avisar.
 *
 * La ruta y el estado no están aquí: van en la bandera de la izquierda, junto a
 * los iconos de plegar las barras. Son información, no acciones, y en este
 * extremo se leían como una etiqueta más de la fila de botones.
 */
function AccionesCabecera({
  bloqueado,
  busy,
  isSaving,
  isSubmitting,
  puedeEnviar,
  indiceGuardado,
  onGuardar,
  onEnviar,
  onSalir,
  onEstadoDeCambios,
  sinCandado,
}: AccionesCabeceraProps) {
  const indiceHistoria = usePuckSel((s) => s.history.index);
  // Deshacer hasta el punto guardado vuelve a dejarlo limpio, y eso es correcto.
  const hayCambiosSinGuardar = indiceHistoria !== indiceGuardado;

  useEffect(() => {
    onEstadoDeCambios(indiceHistoria, hayCambiosSinGuardar);
  }, [indiceHistoria, hayCambiosSinGuardar, onEstadoDeCambios]);

  return (
    <div className="olo-editor-acciones">
      {hayCambiosSinGuardar && <span className="olo-editor-aviso">Sin guardar</span>}
      {/* Salir es la única acción que puede perder trabajo, así que va en rojo:
          antes iba en gris para no competir con guardar y enviar, pero eso lo
          dejaba a un clic de distancia sin que nada avisara del riesgo. */}
      <button
        type="button"
        onClick={() => onSalir(hayCambiosSinGuardar)}
        disabled={busy}
        title="Volver a la página sin publicar nada"
        className="olo-editor-btn olo-editor-btn--salir"
      >
        Salir
      </button>
      <button
        type="button"
        onClick={() => onGuardar(indiceHistoria)}
        disabled={busy || sinCandado}
        title={sinCandado ? 'Ya no tienes esta página reservada' : undefined}
        className="olo-editor-btn olo-editor-btn--guardar"
      >
        {isSaving ? 'Guardando…' : 'Guardar borrador'}
      </button>
      {puedeEnviar && (
        <button
          type="button"
          onClick={() => onEnviar(indiceHistoria)}
          disabled={busy || bloqueado || sinCandado}
          title={sinCandado ? 'Ya no tienes esta página reservada' : undefined}
          className="olo-editor-btn olo-editor-btn--enviar"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      )}
    </div>
  );
}

/**
 * Por qué "Enviar a revisión" no hizo nada.
 *
 * `9-accesibilidad.md` Fase 5: alt de imagen y título de iframe son obligatorios
 * para pasar a revisión, no solo para "Guardar borrador" (un borrador a medio
 * llenar se puede seguir guardando). Este aviso es lo único que le dice al editor
 * *qué* falta — sin él, el botón simplemente no responde y no hay forma de saber
 * por qué.
 */
function AvisoAccesibilidad({ violaciones }: { violaciones: ViolacionAccesibilidad[] }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth: 360,
        padding: '8px 12px',
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: 6,
        color: '#b91c1c',
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      <strong>No se puede enviar a revisión:</strong>
      {violaciones.map((v, indice) => (
        <span key={indice}>{mensajeDeViolacion(v)}</span>
      ))}
    </div>
  );
}

interface ModalSalirProps {
  abierto: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

/**
 * Confirmación antes de salir con cambios sin guardar.
 *
 * Es un `<dialog>` nativo y no un `<div>` flotante por dos razones prácticas: se
 * pinta en la capa superior del navegador, así que no hay que pelear con el
 * apilamiento del editor, y trae gratis el foco atrapado y el cierre con Escape.
 * Sustituye a un `window.confirm`, que no se puede leer con calma ni distingue
 * cuál de las dos opciones es la que destruye trabajo.
 */
function ModalSalir({ abierto, onCancelar, onConfirmar }: ModalSalirProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="olo-modal"
      aria-labelledby="olo-modal-titulo"
      // Escape dispara `cancel`. Se corta el cierre por defecto para que el
      // estado de React no se quede creyendo que el diálogo sigue abierto.
      onCancel={(evento) => {
        evento.preventDefault();
        onCancelar();
      }}
      // Pulsar fuera de la tarjeta equivale a «seguir editando»: ante la duda,
      // la opción que no borra nada.
      onClick={(evento) => {
        if (evento.target === ref.current) onCancelar();
      }}
    >
      <div className="olo-modal-caja">
        <h2 id="olo-modal-titulo" className="olo-modal-titulo">
          Hay cambios sin guardar
        </h2>
        <p className="olo-modal-texto">
          Si sales ahora, <strong>todo lo que hayas editado desde el último guardado se
            pierde</strong> y no se puede recuperar. La página seguirá mostrando la última
          versión publicada.
        </p>
        <p className="olo-modal-texto olo-modal-texto--apunte">
          Si prefieres conservarlo, vuelve y pulsa «Guardar borrador»: el borrador queda
          guardado sin publicarse.
        </p>
        <div className="olo-modal-acciones">
          <button type="button" className="olo-modal-btn" onClick={onCancelar} autoFocus>
            Seguir editando
          </button>
          <button
            type="button"
            className="olo-modal-btn olo-modal-btn--peligro"
            onClick={onConfirmar}
          >
            Salir y perder los cambios
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function PuckEditorWrapper({
  slug,
  initialData,
  onSave,
  onPublish,
  rutaPorDefecto,
  estado,
  rechazo,
  contexto,
  candadoPerdidoPor,
}: PuckEditorWrapperProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avisosAccesibilidad, setAvisosAccesibilidad] = useState<ViolacionAccesibilidad[]>([]);

  // Snapshot del layout actual de Puck — actualizado por onChange
  const currentDataRef = useRef<Data | null>(null);

  // La historia arranca en 0; tras cada guardado exitoso se mueve al punto actual.
  const [indiceGuardado, setIndiceGuardado] = useState(0);

  // Salida pedida con cambios sin guardar, a la espera de que se confirme.
  const [salidaPendiente, setSalidaPendiente] = useState(false);

  // Lo que `AccionesCabecera` ve de la historia de Puck, para poder consultarlo desde
  // fuera de su árbol. En refs y no en estado: cambia con cada pulsación y solo se lee
  // en el momento de cerrar por inactividad, así que provocar un render por cada tecla
  // sería trabajo tirado.
  const indiceHistoriaRef = useRef(0);
  const hayCambiosSinGuardarRef = useRef(false);

  const registrarEstadoDeCambios = useCallback((indice: number, hayCambios: boolean) => {
    indiceHistoriaRef.current = indice;
    hayCambiosSinGuardarRef.current = hayCambios;
  }, []);

  // Datos iniciales con identidad estable (evita re-render infinito en Puck).
  // Va en useState con inicializador diferido, no en useRef: los refs no deben
  // leerse durante el render, y así el objeto se construye una sola vez.
  const [initialPuckData] = useState<Data>(() =>
    Array.isArray(initialData)
      ? {
          content: initialData.map((bloque) => ({
            type: bloque.type,
            props: bloque.props,
          })),
          root: {},
        }
      : (initialData as Data) ?? { content: [], root: {} }
  );

  // El selector solo ofrece los bloques que tienen sentido en esta página, y la
  // config trae además el resto de la página pintado inerte alrededor. Se memoriza
  // porque Puck reconstruye su store cuando cambia la identidad de la config, y eso
  // reiniciaría el editor en cada render; `contexto` viene de props del Server
  // Component, así que su identidad es estable mientras el editor está montado.
  const config = useMemo(() => configDeEdicion(slug, contexto), [slug, contexto]);

  const estadoActual = estado ?? 'borrador';
  /**
   * Lo único que de verdad no se puede repetir: una versión que ya está esperando en
   * la cola de aprobación. Mandarla otra vez la duplicaría para quien revisa.
   *
   * `publicado` estaba aquí también, y era lo que rompía el ciclo editorial:
   * `/editable` devuelve la última versión sea cual sea su estado, así que toda
   * página ya publicada —el caso normal de una página viva— abría el editor con
   * «Enviar a revisión» desactivado, y solo se podían acumular borradores. Enviar
   * desde `publicado` es correcto: `handleSubmitForReview` guarda antes un borrador
   * nuevo y `enviar-a-revision.usecase.ts` toma justo ese, el de número más alto.
   */
  const bloqueado = estadoActual === 'en_revision';

  const handleChange = useCallback((data: Data) => {
    currentDataRef.current = data;
  }, []);

  const handleSaveDraft = useCallback(
    async (indiceHistoria: number) => {
      // El contenido se toma antes del await, así que corresponde al índice del
      // clic: si alguien sigue editando mientras se guarda, esos cambios quedan
      // fuera y deben seguir contando como pendientes.
      const data = currentDataRef.current ?? initialPuckData;
      setIsSaving(true);
      try {
        await onSave(data as PuckData);
        // Solo se llega aquí si la API aceptó el borrador.
        setIndiceGuardado(indiceHistoria);
      } finally {
        setIsSaving(false);
      }
    },
    [onSave, initialPuckData]
  );

  /** Vuelve a la ruta desde la que se abrió el editor. */
  const salir = useCallback(() => {
    router.push(resolverRutaDeVuelta(rutaPorDefecto));
  }, [router, rutaPorDefecto]);

  /** Sin cambios pendientes no hay nada que perder: se sale sin preguntar. */
  const handleSalir = useCallback(
    (hayCambiosSinGuardar: boolean) => {
      if (hayCambiosSinGuardar) {
        setSalidaPendiente(true);
        return;
      }
      salir();
    },
    [salir]
  );

  const handleSubmitForReview = useCallback(
    async (indiceHistoria: number) => {
      if (!onPublish) return;

      // Aviso de cliente, no autoritativo: evita el viaje de red en el caso común,
      // pero el 400 de la API (mismo `@olo/accessibility-policy`) es quien manda de
      // verdad — ver `enviar-a-revision.usecase.ts`.
      const data = currentDataRef.current ?? initialPuckData;
      const violaciones = validarAccesibilidad(data, 'sitio');
      if (violaciones.length > 0) {
        setAvisosAccesibilidad(violaciones);
        return;
      }
      setAvisosAccesibilidad([]);

      setIsSubmitting(true);
      try {
        // Guardar antes de enviar a revisión (regla: contenido siempre consistente).
        // Si el guardado falla no se envía nada: quedaría pendiente la versión vieja.
        await handleSaveDraft(indiceHistoria);
        await onPublish();
        salir(); // Salir del editor tras enviar a revisión con éxito
      } finally {
        setIsSubmitting(false);
      }
    },
    [onPublish, handleSaveDraft, initialPuckData, salir]
  );

  /**
   * Lo que el vigilante de inactividad ejecuta antes de cerrar la sesión.
   *
   * Solo guarda si de verdad hay algo pendiente: el editor crea una versión nueva en
   * cada guardado, y hacerlo a ciegas llenaría `paginas_versiones` de copias idénticas
   * cada vez que alguien deja la pantalla abierta y se va.
   *
   * No se atrapa el error a propósito. Si el guardado falla, el vigilante lo recoge y
   * cierra igual, pero cambiando el motivo para que el login lo diga: cerrar en
   * silencio después de perder el trabajo sería lo peor de las dos opciones.
   */
  const guardarAntesDeCerrar = useCallback(async () => {
    if (!hayCambiosSinGuardarRef.current) return;
    await handleSaveDraft(indiceHistoriaRef.current);
  }, [handleSaveDraft]);

  const busy = isSaving || isSubmitting;

  // Un onClick no puede devolver una promesa rechazada; el error de guardado lo
  // recoge `usePagina` y lo muestra la página del editor.
  const alPulsarGuardar = useCallback(
    (indiceHistoria: number) => {
      void handleSaveDraft(indiceHistoria).catch(() => undefined);
    },
    [handleSaveDraft]
  );

  const alPulsarEnviar = useCallback(
    (indiceHistoria: number) => {
      void handleSubmitForReview(indiceHistoria).catch(() => undefined);
    },
    [handleSubmitForReview]
  );

  // Memorizado porque Puck reconstruye su store cada vez que cambia la identidad
  // de `overrides`.
  const overrides = useMemo(
    () => ({
      headerActions: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Antes que nada: explica por qué los botones de guardar están apagados. */}
          {candadoPerdidoPor && (
            <span className="olo-editor-perdido" role="alert">
              {candadoPerdidoPor} tomó el control. Copia lo que necesites: ya no se
              puede guardar.
            </span>
          )}
          {/* Antes que las acciones: se lee el porqué antes de volver a tocar nada. */}
          {rechazo && <AvisoRechazo {...rechazo} />}
          {avisosAccesibilidad.length > 0 && (
            <AvisoAccesibilidad violaciones={avisosAccesibilidad} />
          )}
          <AccionesCabecera
            bloqueado={bloqueado}
            busy={busy}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            puedeEnviar={!!onPublish}
            indiceGuardado={indiceGuardado}
            onGuardar={alPulsarGuardar}
            onEnviar={alPulsarEnviar}
            onSalir={handleSalir}
            onEstadoDeCambios={registrarEstadoDeCambios}
            sinCandado={Boolean(candadoPerdidoPor)}
          />
        </div>
      ),
    }),
    [
      candadoPerdidoPor,
      bloqueado,
      busy,
      isSaving,
      isSubmitting,
      onPublish,
      indiceGuardado,
      alPulsarGuardar,
      alPulsarEnviar,
      handleSalir,
      registrarEstadoDeCambios,
      rechazo,
      avisosAccesibilidad,
    ]
  );

  return (
    // El estado viaja en un `data-` porque quien lo pinta es el CSS: la bandera
    // se monta sobre el marcado de la cabecera de Puck, que no es nuestro.
    <div className="olo-editor" data-estado={estadoActual}>
      <Puck
        config={config}
        data={initialPuckData}
        onChange={handleChange}
        // Las dos mitades de la bandera. Son los únicos huecos que Puck deja en
        // el centro de su cabecera, y `headerPath` es el único que se puede
        // estilar aparte —lo saca en un `<code>`—, así que ahí va el estado.
        headerTitle={`/${slug}`}
        headerPath={ETIQUETA_ESTADO[estadoActual] ?? estadoActual}
        // El botón "Publish" de serie no llega a dibujarse: `headerActions` lo
        // sustituye por Salir / Guardar / Enviar. `onPublish` queda como no-op.
        onPublish={() => undefined}
        overrides={overrides}
      />

      <ModalSalir
        abierto={salidaPendiente}
        onCancelar={() => setSalidaPendiente(false)}
        onConfirmar={salir}
      />

      {/* Se monta aquí y no en la página: cuando este componente existe, el editor ya
          está en pantalla. Arrancar el reloj antes le restaría a quien edita los ocho
          segundos del loader (`MIN_LOADER_MS` en `editor-client.tsx`). */}
      <VigilanteSesion alExpirar={guardarAntesDeCerrar} />
    </div>
  );
}
