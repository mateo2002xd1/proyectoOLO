'use client';

import React, { useState, useMemo, useId, type ComponentType, type ReactElement } from 'react';
import type { ConfigDeBloque } from './controles-de-caja';
import { DestinoTabField, type DestinoTabConfig } from './destino-tab-field';

export interface TabItem {
  titulo: string;
  slotId?: string;
  tipoDestino?: 'contenido' | 'enlace' | 'archivo';
  urlEnlace?: string;
  abrirNuevaPestana?: 'si' | 'no';
  urlArchivo?: string;
  nombreArchivo?: string;
  destino?: DestinoTabConfig;
}

/** Límite máximo de pestañas permitidas por sección */
export const MAX_TABS = 15;

const TODOS_LOS_SLOTS = Array.from({ length: MAX_TABS }, (_, i) => `tab${i + 1}`);

// Generar dinámicamente campos de tipo slot para soportar hasta 15 pestañas
const slotFields: Record<string, { type: 'slot' }> = {};
for (let i = 1; i <= MAX_TABS; i++) {
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

  const tieneSidebar = mostrarSidebar === 'si' && tabsConSlots.length > 0;
  const esSuperior = posicionMenu === 'superior';
  const anchoPx = Number(anchoSidebar) || 280;

  const varianteClase =
    varianteEstilo === 'verde'
      ? ' olo-tabs--verde'
      : varianteEstilo === 'azul'
      ? ' olo-tabs--azul'
      : '';

  return (
    <div
      className={`olo-tabs${varianteClase} w-full`}
      style={{ width: '100%' }}
    >
      <div
        className="olo-tabs-layout w-full"
        style={{
          display: tieneSidebar ? 'flex' : 'block',
          flexDirection: esSuperior ? 'column' : 'row',
          alignItems: 'flex-start',
          gap: '24px',
          width: '100%',
        }}
      >
        {/* Columna Izquierda: Barra de pestañas */}
        {tieneSidebar && (
          <aside
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
                  borderRadius: '6px',
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
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
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
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`olo-tabs-btn ${estaActiva ? 'olo-tabs-btn--active' : ''}`}
                      style={estiloBotonComun}
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
          </aside>
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
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#4b5563' }}>
                        Archivo adjunto:{' '}
                        {urlArchivo ? (
                          <span style={{ color: '#0033a0', wordBreak: 'break-all' }}>{urlArchivo}</span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>(Sin archivo subido en el panel lateral)</span>
                        )}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        Por ser una descarga directa, esta pestaña no admite bloques ni contenido interno.
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
  );
}

/** Configuración de Puck para el bloque de pestañas */
export const tabsConfig: ConfigDeBloque = {
  label: 'Sección con Pestañas',
  fields: {
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

    return {
      ...fields,
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
