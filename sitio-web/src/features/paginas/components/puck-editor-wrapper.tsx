'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Puck, createUsePuck, Data } from '@puckeditor/core';
import '@puckeditor/core/dist/index.css';
import { configDeEdicion, type ContextoDeEdicion } from '@/config/puck.config';
import { resolverRutaDeVuelta } from '../lib/ruta-de-vuelta';
import { PaginaEnEdicionContext } from '../lib/pagina-en-edicion';
import { Bloque, PuckData, EstadoPagina } from '../types';
import { AvisoRechazo, type Rechazo } from './aviso-rechazo';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { validarAccesibilidad, mensajeDeViolacion, type ViolacionAccesibilidad } from '@olo/accessibility-policy';
import { TITULOS_TENDENCIA, type TipoTendenciaOcupacional } from '@/features/sitio-web/tendencia-ocupacional';

/**
 * Íconos de las tres acciones de la cabecera, en blanco fijo.
 *
 * Reemplazan el texto de los botones: son los únicos SVG de este toolbar sin
 * texto acompañante, así que el nombre de la acción se mueve entero a
 * `aria-label`/`title` del botón — nada se pierde para quien usa lector de
 * pantalla, solo deja de estar escrito en pantalla.
 */
function IconoDetener() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 0C5.57174 0 4.6815 0.368749 4.02513 1.02513C3.36875 1.6815 3 2.57174 3 3.5V20.5C3 21.4283 3.36875 22.3185 4.02513 22.9749C4.6815 23.6313 5.57174 24 6.5 24C7.42826 24 8.3185 23.6313 8.97487 22.9749C9.63125 22.3185 10 21.4283 10 20.5V3.5C10 2.57174 9.63125 1.6815 8.97487 1.02513C8.3185 0.368749 7.42826 0 6.5 0Z" fill="#fff" />
      <path d="M17.5 0C16.5717 0 15.6815 0.368749 15.0251 1.02513C14.3687 1.6815 14 2.57174 14 3.5V20.5C14 21.4283 14.3687 22.3185 15.0251 22.9749C15.6815 23.6313 16.5717 24 17.5 24C18.4283 24 19.3185 23.6313 19.9749 22.9749C20.6313 22.3185 21 21.4283 21 20.5V3.5C21 2.57174 20.6313 1.6815 19.9749 1.02513C19.3185 0.368749 18.4283 0 17.5 0Z" fill="#fff" />
    </svg>
  );
}

function IconoGuardar() {
  return (
    <svg width="19" height="20" viewBox="0 0 34 35" fill="none" aria-hidden="true">
      <path d="M13 27.3691V33.1464C13 33.3728 13.0899 33.5899 13.25 33.75C13.4101 33.9101 13.6272 34 13.8536 34H19.1716C19.702 34 20.2107 33.7893 20.5858 33.4142L26.0858 27.9142C26.8668 27.1332 26.8668 25.8668 26.0858 25.0858L21.8663 20.8663C21.1042 20.1042 19.8753 20.083 19.0874 20.8184L13.6354 25.907C13.2301 26.2852 13 26.8147 13 27.3691Z" fill="#fff" stroke="#fff" />
      <path d="M9.62617 5V1.5H20V5C20 6.10457 19.1046 7 18 7H11.6262C10.5216 7 9.62617 6.10457 9.62617 5Z" fill="#fff" />
      <path d="M20.5 13.9999H9C7.89543 13.9999 7 14.8954 7 15.9999V31.5M9.62617 31.5H7C5.16667 31.1667 1.5 29.9 1.5 27.5C1.5 25.1169 1.5 11.6913 1.5 5.13862C1.5 5.04398 1.50609 4.95345 1.52181 4.86013C1.72447 3.65697 2.46166 1.5 4 1.5C4.6217 1.5 6.82366 1.5 9.62617 1.5M30 11V7.9276C30 7.3393 29.741 6.78083 29.2919 6.40083L24.0593 1.97323C23.6982 1.66767 23.2405 1.5 22.7675 1.5C21.93 1.5 20.9945 1.5 20 1.5M9.62617 1.5V5C9.62617 6.10457 10.5216 7 11.6262 7H18C19.1046 7 20 6.10457 20 5V1.5M9.62617 1.5C12.7886 1.5 16.7158 1.5 20 1.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M28.5663 24.1194C26.6294 22.5491 22.5325 19.0455 23.0438 17.895C23.7105 16.395 28.0438 12.3968 32.0438 15.8973C34.9471 19.2155 32.4603 22.6466 30.5767 24.1957C29.9854 24.6819 29.161 24.6015 28.5663 24.1194Z" fill="#fff" stroke="#fff" strokeLinecap="round" />
    </svg>
  );
}

function IconoEnviar() {
  return (
    <svg width="19" height="18" viewBox="0 0 33 31" fill="none" aria-hidden="true">
      <path d="M15.9294 28.262L12.8702 17.9991C12.6962 17.4153 12.2655 16.9426 11.7004 16.7151L1.75305 12.7106C0.00411272 12.0065 0.111537 9.49512 1.9142 8.94295L29.177 0.592166C30.8384 0.0832753 32.3138 1.78922 31.5706 3.35985L19.6539 28.5461C18.8694 30.204 16.4533 30.0197 15.9294 28.262Z" fill="#fff" stroke="#fff" />
    </svg>
  );
}

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
        aria-label="Salir"
        title="Volver a la página sin publicar nada"
        className="olo-editor-btn olo-editor-btn--salir"
      >
        <IconoDetener />
      </button>
      <button
        type="button"
        onClick={() => onGuardar(indiceHistoria)}
        disabled={busy || sinCandado}
        aria-label={isSaving ? 'Guardando…' : 'Guardar borrador'}
        title={sinCandado ? 'Ya no tienes esta página reservada' : (isSaving ? 'Guardando…' : 'Guardar borrador')}
        className="olo-editor-btn olo-editor-btn--guardar"
      >
        <IconoGuardar />
      </button>
      {puedeEnviar && (
        <button
          type="button"
          onClick={() => onEnviar(indiceHistoria)}
          disabled={busy || bloqueado || sinCandado}
          aria-label={isSubmitting ? 'Enviando…' : 'Enviar a revisión'}
          title={sinCandado ? 'Ya no tienes esta página reservada' : (isSubmitting ? 'Enviando…' : 'Enviar a revisión')}
          className="olo-editor-btn olo-editor-btn--enviar"
        >
          <IconoEnviar />
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

interface ModalConfirmarAccionProps {
  contenido: { titulo: string; descripcion: string; textoConfirmar: string } | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

/**
 * Confirmación antes de «Guardar borrador» o «Enviar a revisión».
 *
 * `ModalSalir` ya avisaba antes de la única acción que pierde trabajo; estas dos
 * no pierden nada, pero tienen consecuencias que conviene leer antes del clic —
 * sobre todo enviar, que le llega al administrador. Un solo componente para las
 * dos en vez de copiar `ModalSalir`: mismo `<dialog>`, mismas clases, el texto es
 * lo único que cambia según `contenido`.
 */
function ModalConfirmarAccion({ contenido, onCancelar, onConfirmar }: ModalConfirmarAccionProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const abierto = contenido !== null;

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
      aria-labelledby="olo-modal-confirmar-titulo"
      onCancel={(evento) => {
        evento.preventDefault();
        onCancelar();
      }}
      onClick={(evento) => {
        if (evento.target === ref.current) onCancelar();
      }}
    >
      {contenido && (
        <div className="olo-modal-caja">
          <h2 id="olo-modal-confirmar-titulo" className="olo-modal-titulo">
            {contenido.titulo}
          </h2>
          <p className="olo-modal-texto">{contenido.descripcion}</p>
          <div className="olo-modal-acciones">
            <button type="button" className="olo-modal-btn" onClick={onCancelar} autoFocus>
              Cancelar
            </button>
            <button
              type="button"
              className="olo-modal-btn olo-modal-btn--principal"
              onClick={onConfirmar}
            >
              {contenido.textoConfirmar}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
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

/**
 * Pantalla completa que confirma el envío a revisión.
 *
 * A pantalla completa y no un modal chico a propósito: es el último paso del
 * ciclo del editor, no un aviso de paso, y quien la ve ya no tiene nada más que
 * hacer aquí — solo volver a la página desde la que entró a editar, que es
 * justo lo que hace la `x`. No se cierra sola ni con Escape/clic afuera: que
 * quien acaba de enviar decida cuándo salir, no un timer.
 */
function PantallaEnvioExitoso({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Envío a revisión exitoso"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#fff',
      }}
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar e ir a la página desde la que editaste"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: 8,
          color: '#374151',
          cursor: 'pointer',
          fontSize: 20,
        }}
      >
        ✕
      </button>

      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(125, 184, 40, 0.15)',
            color: '#4C7A1C',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 style={{ margin: '20px 0 0', fontSize: 22, fontWeight: 700, color: '#111827' }}>
          Tu edición se envió con éxito
        </h2>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: '#4b5563' }}>
          Comunícale al administrador tu avance para que apruebe y publique tu trabajo en el sitio.
        </p>
      </div>
    </div>
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

  // Se llegó a mostrar la pantalla de «enviado con éxito»: reemplaza la salida
  // automática de antes, que sacaba del editor sin dar tiempo a leer nada.
  const [envioExitoso, setEnvioExitoso] = useState(false);

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
  const [initialPuckData] = useState<Data>(() => {
    const raw = Array.isArray(initialData)
      ? {
          content: initialData.map((bloque) => ({
            type: bloque.type,
            props: bloque.props,
          })),
          root: {},
        }
      : (initialData as Data) ?? { content: [], root: {} };

    const contentNormalizado = (raw.content ?? []).map((item: any, idx: number) => {
      const id = item.props?.id || `${item.type || 'bloque'}-${idx + 1}`;

      if (item.type === 'TendenciaOcupacional') {
        const tipo = (item.props?.tipoTendencia as TipoTendenciaOcupacional) || 'mas-menos';
        const tituloPorDefecto = TITULOS_TENDENCIA[tipo] || TITULOS_TENDENCIA['mas-menos'];
        const tieneTitulo = typeof item.props?.titulo === 'string' && item.props.titulo.trim() !== '';

        const esSubtituloAntiguo =
          item.props?.subtitulo === 'Demanda laboral y ocupaciones más solicitadas';

        return {
          ...item,
          props: {
            ...item.props,
            id,
            tipoTendencia: tipo,
            modoSeleccionDepartamento: item.props?.modoSeleccionDepartamento || 'lista',
            mostrarDefiniciones: item.props?.mostrarDefiniciones ?? true,
            mostrarTotales: item.props?.mostrarTotales ?? false,
            mostrarBannerDepartamento: false,
            mostrarTitulo: item.props?.mostrarTitulo ?? true,
            titulo: tieneTitulo ? item.props.titulo : tituloPorDefecto,
            alineacionTitulo: item.props?.alineacionTitulo || 'centro',
            colorTitulo: item.props?.colorTitulo || '',
            mostrarSubtitulo: esSubtituloAntiguo ? false : Boolean(item.props?.mostrarSubtitulo),
            subtitulo: esSubtituloAntiguo ? '' : (item.props?.subtitulo || ''),
            alineacionSubtitulo: item.props?.alineacionSubtitulo || 'centro',
            colorSubtitulo: item.props?.colorSubtitulo || '',
            mostrarDescripcion: Boolean(item.props?.mostrarDescripcion),
            descripcion: item.props?.descripcion || '',
            alineacionDescripcion: item.props?.alineacionDescripcion || 'centro',
            colorDescripcion: item.props?.colorDescripcion || '',
          },
        };
      }

      if (item.type === 'FuentesFuturasEmpleo') {
        const tieneTitulo = typeof item.props?.titulo === 'string' && item.props.titulo.trim() !== '';

        return {
          ...item,
          props: {
            ...item.props,
            id,
            modoSeleccionDepartamento: item.props?.modoSeleccionDepartamento || 'mapa',
            mostrarBannerDepartamento: item.props?.mostrarBannerDepartamento ?? true,
            subtituloInfoDepto:
              item.props?.subtituloInfoDepto !== undefined
                ? item.props.subtituloInfoDepto
                : 'Proyectos de inversión nuevos y/o en expansión potencialmente generadores de empleo.',
            descripcionInfoDepto:
              item.props?.descripcionInfoDepto !== undefined
                ? item.props.descripcionInfoDepto
                : 'En lo corrido del año se han detectado {proyectos} proyectos, con una participación del {porcentaje}% sobre el total nacional.',
            colorBanner: item.props?.colorBanner || '',
            mostrarTotales: item.props?.mostrarTotales ?? true,
            mostrarTitulo: item.props?.mostrarTitulo ?? true,
            titulo: tieneTitulo ? item.props.titulo : 'Fuentes futuras de empleo',
            alineacionTitulo: item.props?.alineacionTitulo || 'centro',
            mostrarSubtitulo: item.props?.mostrarSubtitulo ?? false,
            subtitulo: item.props?.subtitulo || '',
            alineacionSubtitulo: item.props?.alineacionSubtitulo || 'centro',
            colorSubtitulo: item.props?.colorSubtitulo || '',
            mostrarDescripcion: item.props?.mostrarDescripcion ?? false,
            descripcion: item.props?.descripcion || '',
            alineacionDescripcion: item.props?.alineacionDescripcion || 'centro',
            colorDescripcion: item.props?.colorDescripcion || '',
          },
        };
      }

      if (item.type === 'ProgramasSobresalientes') {
        return {
          ...item,
          props: {
            ...item.props,
            id,
            modoSeleccionDepartamento: item.props?.modoSeleccionDepartamento || 'mapa',
            mostrarTitulo: item.props?.mostrarTitulo ?? true,
            titulo: item.props?.titulo ?? 'Programas + sobresalientes SENA',
            alineacionTitulo: item.props?.alineacionTitulo || 'centro',
            colorTitulo: item.props?.colorTitulo || '',
            mostrarDescripcion: item.props?.mostrarDescripcion ?? true,
            descripcion:
              item.props?.descripcion ??
              'Consulte los programas de formación con mayor tasa de vinculación laboral por departamento.',
            alineacionDescripcion: item.props?.alineacionDescripcion || 'centro',
            colorDescripcion: item.props?.colorDescripcion || '',
          },
        };
      }

      return {
        ...item,
        props: {
          ...item.props,
          id,
        },
      };
    });

    return {
      ...raw,
      content: contentNormalizado,
    };
  });

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
        // Ya no sale sola: muestra la pantalla de éxito y espera a que la cierren.
        setEnvioExitoso(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onPublish, handleSaveDraft, initialPuckData]
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

  // Qué botón se pulsó y con qué índice de historia, a la espera de que se
  // confirme en `ModalConfirmarAccion`. El índice se captura en el momento del
  // clic y no en el de confirmar: si se sigue editando con el modal abierto, la
  // acción debe corresponder a lo que había cuando se pidió, no a lo último.
  const [accionPendiente, setAccionPendiente] = useState<
    { tipo: 'guardar'; indiceHistoria: number } | { tipo: 'enviar'; indiceHistoria: number } | null
  >(null);

  const alPulsarGuardar = useCallback((indiceHistoria: number) => {
    setAccionPendiente({ tipo: 'guardar', indiceHistoria });
  }, []);

  const alPulsarEnviar = useCallback((indiceHistoria: number) => {
    setAccionPendiente({ tipo: 'enviar', indiceHistoria });
  }, []);

  // Un onClick no puede devolver una promesa rechazada; el error de guardado lo
  // recoge `usePagina` y lo muestra la página del editor.
  const confirmarAccionPendiente = useCallback(() => {
    if (!accionPendiente) return;
    const { tipo, indiceHistoria } = accionPendiente;
    setAccionPendiente(null);
    if (tipo === 'guardar') {
      void handleSaveDraft(indiceHistoria).catch(() => undefined);
    } else {
      void handleSubmitForReview(indiceHistoria).catch(() => undefined);
    }
  }, [accionPendiente, handleSaveDraft, handleSubmitForReview]);

  const contenidoConfirmacion = !accionPendiente
    ? null
    : accionPendiente.tipo === 'guardar'
      ? {
          titulo: '¿Guardar como borrador?',
          descripcion:
            'Se guarda tu progreso actual. Todavía no se envía a revisión ni se publica en el sitio.',
          textoConfirmar: 'Guardar borrador',
        }
      : {
          titulo: '¿Enviar a revisión?',
          descripcion:
            'El administrador recibirá tu trabajo para revisarlo, aprobarlo y publicarlo en el sitio.',
          textoConfirmar: 'Enviar a revisión',
        };

  // Memorizado porque Puck reconstruye su store cada vez que cambia la identidad
  // de `overrides`.
  const overrides = useMemo(
    () => ({
      headerActions: () => (
        // Puck envuelve esto en su propio `PuckHeader-tools`, que es
        // `display:flex; justify-content:flex-end` — un `marginRight:auto` interno
        // no alcanza porque este `<div>` no ocupaba ese ancho, solo el de su
        // contenido. Con `width:100%` sí lo ocupa, y `space-between` entre los DOS
        // grupos (campana / resto) manda la campana al extremo izquierdo de esta
        // columna, justo donde termina la bandera del estado.
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {rechazo && <AvisoRechazo {...rechazo} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Antes que nada: explica por qué los botones de guardar están apagados. */}
            {candadoPerdidoPor && (
              <span className="olo-editor-perdido" role="alert">
                {candadoPerdidoPor} tomó el control. Copia lo que necesites: ya no se
                puede guardar.
              </span>
            )}
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
      <PaginaEnEdicionContext.Provider value={slug}>
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
      </PaginaEnEdicionContext.Provider>

      <ModalSalir
        abierto={salidaPendiente}
        onCancelar={() => setSalidaPendiente(false)}
        onConfirmar={salir}
      />

      <ModalConfirmarAccion
        contenido={contenidoConfirmacion}
        onCancelar={() => setAccionPendiente(null)}
        onConfirmar={confirmarAccionPendiente}
      />

      <PantallaEnvioExitoso abierto={envioExitoso} onCerrar={salir} />

      {/* Se monta aquí y no en la página: cuando este componente existe, el editor ya
          está en pantalla. Arrancar el reloj antes le restaría a quien edita los ocho
          segundos del loader (`MIN_LOADER_MS` en `editor-client.tsx`). */}
      <VigilanteSesion alExpirar={guardarAntesDeCerrar} />
    </div>
  );
}
