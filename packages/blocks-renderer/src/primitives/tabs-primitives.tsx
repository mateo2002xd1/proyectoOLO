'use client';

import React, { useState, useMemo, useId, type ComponentType, type ReactElement } from 'react';
import type { ConfigDeBloque } from './controles-de-caja';
import { DestinoTabField, type DestinoTabConfig } from './destino-tab-field';
import { campoColor } from './color-picker-field';

export interface TabItem {
  titulo: React.ReactNode | string;
  slotId?: string;
  tipoDestino?: 'contenido' | 'enlace' | 'archivo';
  urlEnlace?: string;
  abrirNuevaPestana?: 'si' | 'no';
  urlArchivo?: string;
  nombreArchivo?: string;
  pesoArchivo?: string;
  destino?: DestinoTabConfig;
}

/** Límite máximo de pestañas permitidas por sección */
export const MAX_TABS = 15;

const TODOS_LOS_SLOTS = Array.from({ length: MAX_TABS }, (_, i) => `tab${i + 1}`);

// Generar dinámicamente campos de tipo slot para soportar hasta 15 pestañas
const slotFields: Record<string, { type: 'slot' }> = {};
// Puck renderiza los slots de los objetos en un orden que causa que se vean al revés.
// Insertamos de mayor a menor para que en la lista visual salgan del 1 al 15 hacia abajo.
for (let i = MAX_TABS; i >= 1; i--) {
  slotFields[`tab${i}`] = { type: 'slot' };
}

/**
 * Garantiza que cada pestaña tenga un `slotId` único y persistente ('tab1' ... 'tab15').
 * De este modo, si el usuario reordena las pestañas en el editor de Puck, el contenido
 * de cada pestaña viaja con ella y NO se mezcla con el contenido de las otras.
 */
export function asegurarSlotsEnTabs(tabs: TabItem[] = []): Array<TabItem & { slotId: string }> {
  const tabsLimitadas = tabs.slice(0, MAX_TABS);
  const slotsOcupados = new Set<string>();

  // Paso 1: Respetar los slotId válidos y únicos ya asignados
  const tabsConSlotsPrevios = tabsLimitadas.map((tab) => {
    const slotActual = tab.slotId;
    if (slotActual && TODOS_LOS_SLOTS.includes(slotActual) && !slotsOcupados.has(slotActual)) {
      slotsOcupados.add(slotActual);
      return { ...tab, slotId: slotActual };
    }
    return { ...tab, slotId: '' };
  });

  // Paso 2: Asignar el primer slot disponible a pestañas nuevas, sin slotId o duplicadas
  return tabsConSlotsPrevios.map((tab, idx) => {
    if (tab.slotId) return tab as TabItem & { slotId: string };
    const slotLibre = TODOS_LOS_SLOTS.find((s) => !slotsOcupados.has(s)) || `tab${idx + 1}`;
    slotsOcupados.add(slotLibre);
    return {
      ...tab,
      slotId: slotLibre,
    };
  });
}

export interface TabsProps {
  id?: string;
  titulo?: React.ReactNode | string;
  mostrarTitulo?: boolean;
  alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
  subtitulo?: React.ReactNode | string;
  mostrarSubtitulo?: boolean;
  colorTitulo?: string;
  colorSubtitulo?: string;
  mostrarSidebar?: 'si' | 'no';
  posicionMenu?: 'lateral' | 'superior';
  anchoSidebar?: '240' | '280' | '320';
  varianteEstilo?: 'auto' | 'verde' | 'azul';
  tabs?: TabItem[];
  puck?: { isEditing?: boolean };
  [key: string]: any;
}

/**
 * Primitivo de Pestañas (Tabs) compartido entre sitio-web e intranet.
 * 
 * Admite 3 tipos de pestañas:
 * - Contenido: Permite arrastrar componentes en el slot correspondiente.
 * - Hipervínculo: Enlace web directo (no admite bloques internos).
 * - Descarga de archivo: Descarga directa de documento adjunto (no admite bloques internos).
 */
export function TabsRender({
  id,
  titulo = '',
  mostrarTitulo = true,
  alineacionTitulo = 'izquierda',
  subtitulo = '',
  mostrarSubtitulo = true,
  colorTitulo,
  colorSubtitulo,
  mostrarSidebar = 'si',
  posicionMenu = 'lateral',
  anchoSidebar = '280',
  varianteEstilo = 'auto',
  tabs = [],
  puck,
  ...restProps
}: TabsProps): ReactElement {
  const baseId = useId();

  // Asegurar que cada pestaña tenga su slotId estable y memorizar la lista
  const tabsConSlots = useMemo(() => asegurarSlotsEnTabs(tabs), [tabs]);
  const primerSlotId = tabsConSlots[0]?.slotId || 'tab1';

  // Estado local que guarda el slotId activo
  const [tabActivaSlot, setTabActivaSlot] = useState<string>(() => primerSlotId);

  // Si el slot activo actual no existe en la lista (p. ej. se eliminó la pestaña), mostrar el primero
  const slotActivoReal = tabsConSlots.some((t) => t.slotId === tabActivaSlot)
    ? tabActivaSlot
    : primerSlotId;

  // Estado para feedback visual de descarga (alerta)
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  const dispararDescarga = (tab: TabItem, url: string) => {
    const nombre = tab.destino?.nombreArchivo || tab.nombreArchivo || (url ? url.split('/').pop() : '') || 'archivo';
    const peso = tab.destino?.pesoArchivo || tab.pesoArchivo || '';
    const textoPeso = peso ? ` (${peso})` : '';
    setMensajeToast(`Descargando archivo: ${decodeURIComponent(nombre)}${textoPeso}`);
    setTimeout(() => {
      setMensajeToast(null);
    }, 3500);
  };

  const tieneSidebar = mostrarSidebar === 'si' && tabsConSlots.length > 0;
  const esSuperior = posicionMenu === 'superior';
  const anchoPx = Number(anchoSidebar) || 280;

  const varianteClase =
    varianteEstilo === 'verde'
      ? ' olo-tabs--verde'
      : varianteEstilo === 'azul'
      ? ' olo-tabs--azul'
      : '';

  const claseAlineacion =
    alineacionTitulo === 'centro'
      ? 'text-center items-center'
      : alineacionTitulo === 'derecha'
      ? 'text-right items-end'
      : 'text-left items-start';

  const sectionId = restProps.id || id;

  return (
    <section
      id={sectionId}
      data-block-id={sectionId}
      className={`olo-tabs-section olo-tabs${varianteClase} w-full`}
      style={{ width: '100%' }}
    >
      <div className="olo-tabs-container">
        {((mostrarTitulo && titulo) || (mostrarSubtitulo && subtitulo)) && (
          <div className={`olo-tabs-header mb-6 flex flex-col ${claseAlineacion} w-full`}>
            {mostrarTitulo && titulo && (
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#002237] tracking-tight mb-2 w-full"
                style={colorTitulo ? { color: colorTitulo } : undefined}
              >
                {titulo}
              </h2>
            )}
            {mostrarSubtitulo && subtitulo && (
              <div
                className="text-sm sm:text-base text-gray-600 max-w-3xl w-full"
                style={colorSubtitulo ? { color: colorSubtitulo } : undefined}
              >
                {subtitulo}
              </div>
            )}
          </div>
        )}
        <div
          className={`olo-tabs-layout ${
            esSuperior ? 'olo-tabs-layout--superior' : 'olo-tabs-layout--lateral'
          } w-full`}
          style={{
            display: tieneSidebar ? 'flex' : 'block',
            flexDirection: esSuperior ? 'column' : 'row',
            alignItems: 'flex-start',
            gap: esSuperior ? '16px' : '28px',
            width: '100%',
          }}
        >
          {/* Columna Izquierda: Barra de pestañas */}
          {tieneSidebar && (
            <div
              role="tablist"
              aria-label="Pestañas de la sección"
              data-puck-overlay-portal=""
              className="olo-tabs-sidebar shrink-0"
              style={{
                width: esSuperior ? '100%' : `${anchoPx}px`,
                minWidth: esSuperior ? '100%' : `${anchoPx}px`,
                maxWidth: esSuperior ? '100%' : `${anchoPx}px`,
                flexShrink: 0,
                pointerEvents: 'auto',
              }}
            >
              <div
                className="olo-tabs-nav"
                style={{
                  display: 'flex',
                  flexDirection: esSuperior ? 'row' : 'column',
                  flexWrap: esSuperior ? 'wrap' : 'nowrap',
                  gap: '10px',
                  width: '100%',
                }}
              >
                {tabsConSlots.map((tab, idx) => {
                  const estaActiva = tab.slotId === slotActivoReal;
                  const tabButtonId = `tab-btn-${baseId}-${tab.slotId}`;
                  const tabpanelId = `tab-panel-${baseId}-${tab.slotId}`;

                  const destino: DestinoTabConfig = tab.destino || { tipo: 'contenido' };
                  const tipoDestino = destino.tipo || tab.tipoDestino || 'contenido';
                  const urlEnlace = destino.urlEnlace || tab.urlEnlace || '';
                  const abrirNuevaPestana = destino.abrirNuevaPestana || tab.abrirNuevaPestana || 'si';
                  const urlArchivo = destino.urlArchivo || tab.urlArchivo || '';
                  const nombreArchivo = destino.nombreArchivo || tab.nombreArchivo;

                  const esEnlace = tipoDestino === 'enlace';
                  const esArchivo = tipoDestino === 'archivo';

                  const estiloBotonComun: React.CSSProperties = {
                    pointerEvents: 'auto',
                    textAlign: 'left',
                    width: esSuperior ? 'auto' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '1.3',
                    transition: 'all 150ms ease',
                    outline: 'none',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  };

                const contenidoBoton = (
                  <span
                    style={{
                      display: 'block',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.35',
                      pointerEvents: 'none',
                      flex: 1,
                    }}
                  >
                    {tab.titulo || `Pestaña ${idx + 1}`}
                  </span>
                );

                // En sitio público, el hipervínculo es un enlace <a> real
                if (!puck?.isEditing && esEnlace && urlEnlace) {
                  return (
                    <a
                      key={tab.slotId}
                      id={tabButtonId}
                      href={urlEnlace}
                      target={abrirNuevaPestana === 'no' ? '_self' : '_blank'}
                      rel={abrirNuevaPestana === 'no' ? undefined : 'noopener noreferrer'}
                      className={`olo-tabs-btn ${estaActiva ? 'olo-tabs-btn--active' : ''}`}
                      style={estiloBotonComun}
                    >
                      {contenidoBoton}
                    </a>
                  );
                }

                // En sitio público, la descarga de archivo es un enlace <a> con download
                if (!puck?.isEditing && esArchivo && urlArchivo) {
                  return (
                    <a
                      key={tab.slotId}
                      id={tabButtonId}
                      href={urlArchivo}
                      download={nombreArchivo || true}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`olo-tabs-btn ${estaActiva ? 'olo-tabs-btn--active' : ''}`}
                      style={estiloBotonComun}
                      onClick={() => dispararDescarga(tab, urlArchivo)}
                    >
                      {contenidoBoton}
                    </a>
                  );
                }

                // En editor de Puck o pestaña de contenido normal: botón interactivo
                return (
                  <button
                    key={tab.slotId}
                    id={tabButtonId}
                    role="tab"
                    type="button"
                    aria-selected={estaActiva}
                    aria-controls={tabpanelId}
                    data-slot-id={tab.slotId}
                    data-tab-title={typeof tab.titulo === 'string' ? tab.titulo : undefined}
                    tabIndex={estaActiva ? 0 : -1}
                    data-puck-overlay-portal=""
                    style={estiloBotonComun}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      // Evita que Puck intercepte el click para arrastrar o seleccionar el bloque
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTabActivaSlot(tab.slotId);
                    }}
                    className={`olo-tabs-btn ${
                      estaActiva ? 'olo-tabs-btn--active' : ''
                    }`}
                  >
                    {contenidoBoton}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Columna Derecha: Contenido vinculado a cada slotId */}
        <main
          className="olo-tabs-content"
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
          }}
        >
          {tabsConSlots.length === 0 ? (
            restProps.tab1 ? (
              <div style={{ width: '100%', minHeight: '140px' }}>
                {React.createElement(restProps.tab1)}
              </div>
            ) : null
          ) : (
            tabsConSlots.map((tab) => {
              const estaActiva = tab.slotId === slotActivoReal;
              const tabpanelId = `tab-panel-${baseId}-${tab.slotId}`;
              const tabButtonId = `tab-btn-${baseId}-${tab.slotId}`;

              const destino: DestinoTabConfig = tab.destino || { tipo: 'contenido' };
              const tipoDestino = destino.tipo || tab.tipoDestino || 'contenido';
              const urlEnlace = destino.urlEnlace || tab.urlEnlace || '';
              const urlArchivo = destino.urlArchivo || tab.urlArchivo || '';
              const nombreArchivo = destino.nombreArchivo || tab.nombreArchivo;
              const pesoArchivo = destino.pesoArchivo || tab.pesoArchivo;
              const nombreVisible =
                nombreArchivo ||
                (urlArchivo ? decodeURIComponent(urlArchivo.split('?')[0].split('/').pop() ?? '') : '');

              // Si es hipervínculo
              if (tipoDestino === 'enlace') {
                if (!puck?.isEditing) return null;
                return (
                  <div
                    key={tab.slotId}
                    id={tabpanelId}
                    role="tabpanel"
                    aria-labelledby={tabButtonId}
                    style={{
                      display: estaActiva ? 'block' : 'none',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        padding: '32px 20px',
                        borderRadius: '4px',
                        border: '1px dashed #ccc',
                        background: '#f9fafb',
                        textAlign: 'center',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#001A39' }}>
                        Pestaña configurada como enlace
                      </h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#4b5563' }}>
                        Destino:{' '}
                        {urlEnlace ? (
                          <span style={{ color: '#0033a0', wordBreak: 'break-all' }}>{urlEnlace}</span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>(Sin URL definida en el panel lateral)</span>
                        )}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        Por ser un enlace directo, esta pestaña no admite bloques ni contenido interno.
                      </p>
                    </div>
                  </div>
                );
              }

              // Si es descarga de archivo
              if (tipoDestino === 'archivo') {
                if (!puck?.isEditing) return null;
                return (
                  <div
                    key={tab.slotId}
                    id={tabpanelId}
                    role="tabpanel"
                    aria-labelledby={tabButtonId}
                    style={{
                      display: estaActiva ? 'block' : 'none',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        padding: '32px 20px',
                        borderRadius: '4px',
                        border: '1px dashed #ccc',
                        background: '#f9fafb',
                        textAlign: 'center',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#001A39' }}>
                        Pestaña configurada para descarga de archivo
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>
                        Archivo adjunto:{' '}
                        {urlArchivo ? (
                          <span style={{ color: '#0033a0', fontWeight: 600, wordBreak: 'break-all' }}>
                            {nombreVisible}
                            {pesoArchivo ? ` (${pesoArchivo})` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>(Sin archivo subido en el panel lateral)</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              }

              // Pestaña de contenido estándar: renderiza el Slot de Puck
              const SlotComponent: ComponentType<any> | undefined = restProps[tab.slotId];
              if (!SlotComponent) return null;

              return (
                <div
                  key={tab.slotId}
                  id={tabpanelId}
                  role="tabpanel"
                  aria-labelledby={tabButtonId}
                  data-slot-id={tab.slotId}
                  data-tab-title={typeof tab.titulo === 'string' ? tab.titulo : undefined}
                  style={{
                    display: estaActiva ? 'block' : 'none',
                    width: '100%',
                    minHeight: '140px',
                  }}
                  className="focus:outline-none"
                >
                  <SlotComponent />
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>

      {/* Notificación Toast flotante al descargar archivo (alerta abajo a la izquierda) */}
      {mensajeToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            backgroundColor: '#001A39',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'none',
            maxWidth: 'calc(100vw - 48px)',
          }}
          role="status"
          aria-live="polite"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mensajeToast}
          </span>
        </div>
      )}
    </section>
  );
}

/** Configuración de Puck para el bloque de pestañas */
export const tabsConfig: ConfigDeBloque = {
  label: 'Sección con Pestañas',
  fields: {
    mostrarTitulo: {
      type: 'radio',
      label: 'Mostrar título de la sección',
      options: [
        { label: 'Sí', value: true },
        { label: 'No', value: false },
      ],
    },
    titulo: {
      type: 'text',
      label: 'Título de la sección (opcional)',
      contentEditable: true,
    },
    alineacionTitulo: {
      type: 'radio',
      label: 'Alineación del título',
      options: [
        { label: 'Izquierda', value: 'izquierda' },
        { label: 'Centro', value: 'centro' },
        { label: 'Derecha', value: 'derecha' },
      ],
    },
    subtitulo: {
      type: 'textarea',
      label: 'Descripción / Subtítulo (opcional)',
    },
    mostrarSubtitulo: {
      type: 'radio',
      label: 'Mostrar subtítulo',
      options: [
        { label: 'Sí', value: true },
        { label: 'No', value: false },
      ],
    },
    colorTitulo: campoColor('Color del título (opcional)'),
    colorSubtitulo: campoColor('Color del subtítulo / descripción (opcional)'),
    mostrarSidebar: {
      type: 'radio',
      label: 'Mostrar barra de pestañas',
      options: [
        { label: 'Sí (menú a la izquierda, contenido a la derecha)', value: 'si' },
        { label: 'No (ocultar menú, contenido a ancho completo)', value: 'no' },
      ],
    },
    posicionMenu: {
      type: 'radio',
      label: 'Disposición del menú',
      options: [
        { label: 'Lateral izquierdo (2 columnas)', value: 'lateral' },
        { label: 'Superior horizontal', value: 'superior' },
      ],
    },
    anchoSidebar: {
      type: 'select',
      label: 'Ancho de la columna lateral',
      options: [
        { label: 'Estrecho (240px)', value: '240' },
        { label: 'Normal (280px)', value: '280' },
        { label: 'Amplio (320px)', value: '320' },
      ],
    },
    varianteEstilo: {
      type: 'select',
      label: 'Tema visual de las pestañas',
      options: [
        { label: 'Automático (del sitio actual)', value: 'auto' },
        { label: 'Verde institucional (SENA)', value: 'verde' },
        { label: 'Azul corporativo (OLO)', value: 'azul' },
      ],
    },
    tabs: {
      type: 'array',
      label: 'Lista de Pestañas (máx. 15)',
      max: MAX_TABS,
      min: 1,
      getItemSummary: (item: any, index?: number) => {
        return `${Number(index ?? 0) + 1}. ${item?.titulo || 'Pestaña'}`;
      },
      defaultItemProps: (index: number) => ({
        titulo: '',
        slotId: `tab${Math.min(index + 1, MAX_TABS)}`,
        destino: { tipo: 'contenido' },
      }),
      arrayFields: {
        titulo: {
          type: 'text',
          label: 'Texto visible del botón',
          contentEditable: true,
        },
        destino: {
          type: 'custom',
          render: ({ value, onChange }: any) => (
            <DestinoTabField value={value} onChange={onChange} />
          ),
        },
      },
    },
    // Slots nativos de Puck (tab1 hasta tab15)
    ...slotFields,
  },
  defaultProps: {
    mostrarTitulo: true,
    titulo: '',
    alineacionTitulo: 'izquierda',
    mostrarSubtitulo: true,
    subtitulo: '',
    colorTitulo: '',
    colorSubtitulo: '',
    mostrarSidebar: 'si',
    posicionMenu: 'lateral',
    anchoSidebar: '280',
    varianteEstilo: 'auto',
    tabs: [
      {
        titulo: '',
        slotId: 'tab1',
        destino: { tipo: 'contenido' },
      },
    ],
  },
  resolveData: (data: any) => {
    const tabs = data?.props?.tabs || [];
    const tabsConSlots = asegurarSlotsEnTabs(tabs);
    const tabsNormalizadas = tabsConSlots.map((tab) => ({
      ...tab,
      destino: tab.destino || { tipo: tab.tipoDestino || 'contenido' },
    }));

    return {
      props: {
        ...data.props,
        tabs: tabsNormalizadas,
      },
    };
  },
  resolveFields: (data: any, { fields }: any) => {
    const tabs = asegurarSlotsEnTabs(data?.props?.tabs || []);
    const cantidad = tabs.length;
    const esMaximo = cantidad >= MAX_TABS;
    const slotsActivos = new Set(tabs.map((t) => t.slotId));

    // Filtramos los fields para remover los slots (`tab1`...`tab15`) que no están en uso.
    // Esto oculta los huecos inactivos del panel lateral de Puck.
    const camposFiltrados = Object.fromEntries(
      Object.entries(fields).filter(([key]) => {
        if (key.startsWith('tab') && parseInt(key.replace('tab', ''), 10) > 0) {
          return slotsActivos.has(key);
        }
        return true;
      })
    );

    return {
      ...camposFiltrados,
      tabs: {
        ...fields.tabs,
        label: esMaximo
          ? `Lista de Pestañas (Máximo alcanzado: ${cantidad}/${MAX_TABS})`
          : `Lista de Pestañas (${cantidad} de ${MAX_TABS})`,
      },
    };
  },
  render: (props: any) => <TabsRender {...props} />,
};
