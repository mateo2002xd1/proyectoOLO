'use client';

import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { nombreDeArchivoDecodificado } from '@olo/url-policy';
import {
  primitiveComponents,
  crearGridConfig,
  conCaja,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
  campoEnAcordeon,
  campoPaginaEnEdicion,
  campoGrupoEnUnAcordeon,
  campoListaEnAcordeones,
  campoObjetoEnAcordeon,
  crearCampoTextoRico,
  type CampoDeAcordeon,
  TextoRico,
  ImagenDestacada,
  TarjetaArticulo,
  BotonPersonalizado,
  migrarBoton,
  tamanoDelBotonEnPx,
  SeccionBotonesIcono,
  campoDestinoBotonEnAcordeon,
  IconSelectorField,
} from '@olo/blocks-renderer';
import { ExternalPortals, type TarjetaDePortal } from '@/shared/lib/blocks/external-portals';
import { ICONOS_DE_PORTALES } from '@/shared/lib/blocks/iconos-de-portales';
import { VideoEmbebido, idDeVideoDeYoutube } from '@/shared/lib/blocks/video-embebido';
import { REPETICIONES_DE_FONDO } from '@/shared/lib/blocks/imagen-de-fondo';
import { CampoVideoDeYoutube } from '@/shared/lib/blocks/campo-video-de-youtube';
import { CarruselDeImagenes } from '@/shared/lib/blocks/carrusel-de-imagenes';
import { Services } from '@/shared/lib/blocks/services';
import { DatoOloSemana } from '@/shared/lib/blocks/dato-olo-semana';
import { RecursosVisualesBloque, extraerYoutubeId } from '@/shared/lib/blocks/recursos-visuales-bloque';
import { Publicaciones, VELOCIDADES_CINTA, type PublicacionItem } from '@/shared/lib/blocks/publicaciones';
import { PoliticaPrivacidadEncabezado } from '@/shared/lib/blocks/politica-privacidad-encabezado';
import { VisorDocumentosNormativos, type DocumentoNormativo } from '@/shared/lib/blocks/visor-documentos-normativos';
import { CanalesAtencion, type CanalDeAtencion } from '@/shared/lib/blocks/canales-atencion';
import { Header } from '@/shared/lib/blocks/header';
import { TAMANOS_TEXTO_MENU } from '@/shared/lib/blocks/tamanos-texto-menu';
import { rutaPublicaDeSlug } from '@/features/editor/model/rutas';
import { crearCamposDelPie, resolverGruposDelPie } from '@/features/editor/navegation/campos-del-pie';
import { resolverGruposDeProps } from '@/features/editor/navegation/grupos-de-props';
import { ALINEACIONES_FRANJA, SEPARACIONES_FRANJA } from '@/shared/lib/blocks/disposicion-de-franja';
import { Footer } from '@/shared/lib/blocks/footer';
import { MapaSitio, VALORES_MAPA_SITIO_POR_DEFECTO } from '@/shared/lib/blocks/mapa-sitio';
import { obtenerIndiceBusqueda } from '@/features/editor/publishing/services/publicacion.service';
import {
  BuscadorSitioBloque,
  ResultadosBusquedaSitio,
  type BuscadorSitioBloqueProps,
  type ResultadosBusquedaSitioProps,
} from '@/shared/lib/blocks/buscador-sitio';

import { CABECERA_POR_DEFECTO } from '@/features/editor/client';
import {
  HeroBuscadorOcupaciones,
  BuscadorOcupacionesView,
  PaginaDeResultadosOcupaciones,
  CONTENIDO_DEL_BUSCADOR_POR_DEFECTO,
  TEXTO_BLOQUE_POR_DEFECTO,
  contenidoDesdeHtml,
  textoBloqueDesdeHtml,
  separarCitas,
  type TextosEnHtml,
} from '@/shared/lib/buscador-ocupaciones';
import { AlertasInversionView } from '@/shared/lib/alertas-inversion';
import { ProgramasSobresalientesView } from '@/shared/lib/programas-sobresalientes';
import {
  TendenciaOcupacionalView,
  TITULOS_TENDENCIA,
  type TipoTendenciaOcupacional,
} from '@/shared/lib/tendencia-ocupacional';
import { EditorjsWrapper } from '@/features/editor/edition/components/editorjs-wrapper';
import { ImageUploaderField } from '@/features/editor/edition/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/editor/edition/components/archivo-uploader-field';
import { Render, RichTextMenu, type Config, type Data } from '@puckeditor/core';
import type { OutputData } from '@editorjs/editorjs';

/** Props que Puck inyecta en el render de un campo `custom`. */
type CustomFieldRender<T> = { value: T; onChange: (val: T) => void };

/** Props de un componente de Puck. `id` siempre viene inyectado y, al ser
 *  obligatorio, evita que TypeScript trate el tipo como "weak" y rechace el
 *  render por no compartir propiedades con el Config genérico. */
type BlockRender<T> = T & { id: string };

/**
 * Campo de imagen con subida de archivo, en vez de pedir la URL a mano.
 *
 * Mismo helper que ya tenía la intranet. Aquí el bloque de subida estaba escrito
 * siete veces con el mismo cuerpo, y el Hero ni siquiera lo usaba: pedía la ruta
 * de la imagen en un campo de texto, que obliga a saber dónde vive el archivo y
 * a escribirla sin equivocarse.
 */
const campoImagen = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: CustomFieldRender<string>) => (
    <ImageUploaderField value={value} onChange={onChange} />
  ),
});

/**
 * La imagen de fondo de una sección, su transparencia y si se repite: lo que lee
 * `CapaDeImagenDeFondo`. «Video embebido» los agrupa en su tarjeta
 * (`campoImagenDeFondo`); «Dato OLO de la semana» los pone en cada infografía.
 */
const CAMPOS_IMAGEN_DE_FONDO = {
  imagen: {
    ...campoImagen('Imagen'),
    ayuda: 'Va encima del color de fondo y detrás del contenido. Es decorativa: no lleva texto alternativo.',
  },
  transparencia: {
    type: 'number',
    label: 'Transparencia',
    min: 0,
    max: 100,
    sufijo: '%',
    placeholder: '0',
    ayuda: '0 %: la imagen se ve tal cual. 100 %: no se ve y queda solo el color de fondo. Vacío: 0 %.',
  },
  repeticion: {
    type: 'radio',
    label: 'Repetición',
    options: Object.entries(REPETICIONES_DE_FONDO).map(([value, { label }]) => ({ label, value })),
    ayuda: 'No repetir: la imagen cubre toda la sección y se recorta para llenarla. Repetir: la imagen a su tamaño real, repetida a lo ancho y a lo alto como un mosaico.',
  },
} satisfies Record<string, CampoDeAcordeon>;

/** Tarjeta «Imagen de fondo» de una sección. Guarda `{ imagen, transparencia, repeticion }`. */
const campoImagenDeFondo = () =>
  campoGrupoEnUnAcordeon('Imagen de fondo', CAMPOS_IMAGEN_DE_FONDO, {
    resumen: (fondo) => (fondo?.imagen ? 'Cargada' : 'Sin imagen'),
  });

/**
 * Los campos de la tarjeta «Textos del buscador» del buscador de ocupaciones (`Hero`). La
 * tarjeta los guarda en `grupoTextos` y `resolveData` los copia a la prop suelta `contenido`,
 * que es la que lee el render. No hay color global: el color se pone por palabras con la
 * herramienta «Color del texto» del propio Editor.js.
 */
const CAMPOS_TEXTOS_DEL_BUSCADOR = {
  contenido: {
    type: 'custom',
    // Sin etiqueta: la tarjeta ya se llama «Textos del buscador» y no tiene otro campo.
    label: '',
    ayuda: 'El tipo de bloque decide dónde sale cada texto: el encabezado es el titular y los párrafos y las listas son la descripción. Al seleccionar palabras sale su color; la alineación de cada bloque está en su menú «⠿».',
    render: ({ value, onChange }: CustomFieldRender<OutputData>) => (
      <EditorjsWrapper data={value} onChange={onChange} sinCita conFormato />
    ),
  },
} satisfies Record<string, CampoDeAcordeon>;

/**
 * Los campos de la tarjeta «Texto bloque y placeholder» del buscador de ocupaciones
 * (`Hero`). La tarjeta los guarda en `grupoRecuadro` y `resolveData` los copia a las props
 * sueltas `textoBloque`, `searchPlaceholder` y `colorTextoBloque`, que son las que lee el render.
 */
const CAMPOS_RECUADRO_DEL_BUSCADOR = {
  textoBloque: {
    type: 'custom',
    label: 'Texto bloque',
    ayuda: 'El texto del recuadro azul, sobre la casilla del buscador. Al seleccionar palabras sale su color; la alineación de cada bloque está en su menú «⠿».',
    render: ({ value, onChange }: CustomFieldRender<OutputData>) => (
      <EditorjsWrapper data={value} onChange={onChange} sinCita conFormato />
    ),
  },
  searchPlaceholder: {
    type: 'text',
    label: 'Placeholder',
    placeholder: 'Buscar ocupación, código o denominación',
    ayuda: 'El texto de ejemplo que se ve dentro de la casilla del buscador, mientras está vacía.',
  },
  colorTextoBloque: {
    type: 'color',
    label: 'Color del texto bloque',
    ayuda: 'El del texto del recuadro azul. Vacío: blanco.',
  },
} satisfies Record<string, CampoDeAcordeon>;

/**
 * Todos los textos enriquecidos llevan la misma barra: H1–H6, viñetas, negrita,
 * cursiva, subrayado y alineación (ver `crearCampoTextoRico`).
 */
const campoTextoRico = crearCampoTextoRico(RichTextMenu);

/**
 * Un texto enriquecido guardado en una prop que ya no es campo: Puck solo convierte a
 * nodos los `richtext` que declara el bloque. Se pinta como lo pinta Puck, en un
 * `.rich-text`; la API ya lo saneó al guardarlo (`sanitizar-contenido.ts`).
 */
const htmlGuardado = (html?: string): ReactNode =>
  html ? <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} /> : undefined;

/**
 * La tarjeta «Franja superior GOV.CO» de la cabecera. Las opciones siguen siendo props
 * sueltas de `Header`; la tarjeta las guarda en `grupoFranjaGov` y `resolverGruposDeProps`
 * las copia (ver `grupos-de-props.ts`).
 */
const CAMPOS_FRANJA_SUPERIOR = {
  govBannerEnabled: {
    type: 'radio',
    label: 'Franja',
    options: [
      { label: 'Mostrar', value: true },
      { label: 'Ocultar', value: false },
    ],
  },
  govBannerImageUrl: {
    ...campoImagen('Imagen de GOV.CO'),
    ayuda: 'Sin imagen, la franja queda solo con la fecha y la hora.',
  },
  govBannerEnlace: {
    type: 'text',
    label: 'Hipervínculo de la imagen',
    placeholder: 'https://www.gov.co',
    ayuda: 'A dónde lleva la imagen (se abre en otra pestaña). Vacío: gov.co. El de la fecha y la hora no se cambia: lleva siempre al panel.',
  },
  govBannerMargenArriba: { type: 'number', label: 'Margen arriba', min: 0, max: 40, sufijo: 'px', placeholder: '4' },
  govBannerMargenAbajo: {
    type: 'number',
    label: 'Margen abajo',
    min: 0,
    max: 40,
    sufijo: 'px',
    placeholder: '4',
    ayuda: 'La franja mide 40 px de alto: más margen arriba y abajo achica la imagen. Vacío usa el valor de siempre.',
  },
  colorFranjaGov: {
    type: 'color',
    label: 'Color de fondo',
    ayuda: 'Vacío: franja blanca con la fecha en azul. Con un fondo oscuro, la fecha pasa a blanco sola.',
  },
  alineacionFranjaGov: {
    type: 'radio',
    label: 'Alineación de la imagen',
    options: Object.entries(ALINEACIONES_FRANJA).map(([value, { label }]) => ({ label, value })),
    ayuda: 'La fecha y la hora se quedan a la derecha. Si no hay ninguna marcada, la imagen va a la izquierda.',
  },
  separacionFranjaGov: {
    type: 'select',
    label: 'Separación con la fecha',
    options: [
      { label: 'La de siempre (12 px)', value: '' },
      ...Object.entries(SEPARACIONES_FRANJA).map(([value, { label }]) => ({ label, value })),
    ],
    ayuda: 'Solo con la imagen a la derecha. Se adapta a la pantalla.',
  },
} satisfies Record<string, CampoDeAcordeon>;

/**
 * La tarjeta «Separación del menú» de la cabecera (solo computador): mismo mecanismo
 * que la franja, con las props sueltas `separacionLogoMenu` y `separacionMenuAcciones`.
 */
const CAMPOS_SEPARACION_MENU = {
  separacionLogoMenu: {
    type: 'number',
    label: 'Logo ↔ menú',
    min: 0,
    max: 200,
    sufijo: 'px',
    placeholder: 'Automática',
    ayuda: 'Espacio entre el logo y el primer enlace, exacto mientras quepa; si no, se achica solo. Vacío: se reparte según el ancho.',
  },
  separacionMenuAcciones: {
    type: 'number',
    label: 'Menú ↔ lupa e Intranet',
    min: 0,
    max: 200,
    sufijo: 'px',
    placeholder: 'Automática',
    ayuda: 'Espacio mínimo entre el último enlace y la lupa: si sobra ancho, la lupa y el botón se quedan a la derecha. Si el ancho no alcanza, los dos espacios se achican solos; el logo no se encoge.',
  },
} satisfies Record<string, CampoDeAcordeon>;

/**
 * Campo con entrada para enlace o ID de YouTube y vista previa en vivo de la miniatura.
 */
function CampoYoutubePreview({ value = '', onChange }: CustomFieldRender<string>) {
  const idExtraido = extraerYoutubeId(value);
  const miniatura = idExtraido && /^[\w-]{11}$/.test(idExtraido)
    ? `https://img.youtube.com/vi/${idExtraido}/mqdefault.jpg`
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enlace o ID (ej. https://youtube.com/watch?v=...)"
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '13px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {miniatura ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={miniatura}
            alt="Vista previa miniatura"
            style={{
              width: '84px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
              ✓ Vista previa detectada
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
              ID: {idExtraido}
            </span>
          </div>
        </div>
      ) : value && value.trim() ? (
        <span style={{ fontSize: '11px', color: '#ef4444' }}>
          No se detectó un identificador de YouTube válido (11 caracteres).
        </span>
      ) : (
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          Pega el enlace o identificador de 11 caracteres de YouTube para previsualizar.
        </span>
      )}
    </div>
  );
}

/**
 * El interruptor de todo el buscador de ocupaciones, en los dos bloques que pueden vivir en la
 * página de resultados (`BuscadorOcupaciones` y `ResultadosOcupaciones`). La regla que lo lee
 * está en `features/editor/navegation/buscador-ocupaciones.ts`.
 */
const campoActivoDelBuscador = () =>
  campoEnAcordeon(
    {
      type: 'radio',
      label: 'Buscador de ocupaciones',
      options: [
        { label: 'Activo', value: true },
        { label: 'Apagado', value: false },
      ],
      ayuda:
        'Interruptor de todo el sitio: apagado, desaparecen los buscadores de ocupaciones (el de la portada y los demás), los resultados y la consulta al catálogo. Solo cuenta el de la página de resultados que se elige en «Menú y pie»; en cualquier otra página no tiene efecto. Los enlaces con una búsqueda ya guardados llegan a un aviso.',
    },
    { resumen: (activo) => (activo === false ? 'Apagado' : 'Activo') }
  );

const campoFondo = {
  type: 'radio' as const,
  label: 'Fondo',
  options: [
    { label: 'Blanco', value: 'blanco' },
    { label: 'Gris', value: 'gris' },
  ],
};

// ─── RichText block: Puck handles the layout slot, EditorJS handles the content ───
const RichTextBlock = {
  label: 'Texto enriquecido',
  fields: {
    content: {
      type: 'custom' as const,
      label: 'Contenido enriquecido',
      render: ({ value, onChange }: CustomFieldRender<OutputData>) => (
        <EditorjsWrapper data={value} onChange={onChange} conColor />
      ),
    },
    colorTexto: campoEnAcordeon({
      type: 'color',
      label: 'Color del texto',
      ayuda: 'Elige el color de todo el texto.',
    }),
  },
  defaultProps: {
    colorTexto: '',
    content: {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Escribe aquí tu contenido enriquecido. Puedes añadir encabezados, párrafos, listas y citas desde el panel lateral derecho.',
          },
        },
      ],
    },
  },
  render: ({ content, colorTexto }: BlockRender<{ content?: OutputData; colorTexto?: string }>) => (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-6 rich-text">
      <EditorjsWrapper data={content} readOnly colorTexto={colorTexto} />
    </div>
  ),
};

// ─── Puck Configuration: Single source of truth for editor + public rendering ───
/**
 * El catálogo tal cual lo declara cada bloque.
 *
 * No se exporta: lo que consume la app es el `puckConfig` de más abajo, que es
 * este mismo con los controles de «Espaciado y ancho» ya inyectados.
 */
const puckConfigBase: Config = {
  categories: {
    'Plantilla': {
      components: ['Header', 'Footer'],
    },
    'Contenido Principal': {
      components: [
        'Hero',
        'Services',
        'DatoOloSemana',
        'RecursosVisualesBloque',
        'VideoEmbebido',
        'CarruselDeImagenes',
        'Publicaciones',
        'RichText',
        'PoliticaPrivacidadEncabezado',
        'VisorDocumentosNormativos',
        'CanalesAtencion',
        'ProgramasSobresalientes',
        'BuscadorOcupaciones',
        'ResultadosOcupaciones',
        'AlertasInversion',
        'TendenciaOcupacional',
        'MapaSitio',
        'BuscadorSitioWeb',
        'ResultadosBusquedaSitio',
      ],
    },
    'Texto e imagen': {
      components: ['TextoRico', 'ImagenDestacada', 'TarjetaArticulo'],
    },
    'Botones y enlaces': {
      components: ['BotonPersonalizado', 'SeccionBotonesIcono'],
    },
    'Portales': {
      components: ['ExternalPortals'],
    },
    'Maquetación': {
      // `SeccionPestanasLaterales` se quitó de aquí el 2026-09-27: mencionaba un
      // componente que nunca llegó a registrarse en `components` (no hay `import` de
      // `shared/lib/blocks/seccion-pestanas-laterales.tsx` en este archivo), así que
      // este filtro simplemente lo descartaba sin que nadie lo notara.
      components: ['Grid', 'Flex', 'Space'],
    },
    'Ocultos': {
      visible: false,
      components: ['Tabs'],
    },
    other: {
      title: 'Otros',
    },
  },
  components: {
    // Primitivos de maquetación compartidos (Flex / Space / SeccionPestanasLaterales)
    ...primitiveComponents,
    // Grid necesita el campo de imagen de esta app inyectado (su fondo sube
    // archivos contra la API de sitio-web) — ver `crearGridConfig`.
    Grid: conCaja(crearGridConfig(campoImagen)),
    // ─── Plantilla: la cabecera y el pie que rodean a todas las páginas ───
    // Solo se ofrecen al editar el slug `plantilla` (ver COMPONENTES_POR_SLUG).
    // Los pinta `app/(pages)/layout.tsx` leyendo esa página, no el contenido de
    // cada sección: así el menú es uno solo para todo el sitio.
    Header: {
      label: 'Cabecera / Menú',
      // Cada opción en su acordeón, con una línea que dice qué pasa si se deja
      // vacía. El menú sigue siendo la lista de Puck: añadir, quitar y ordenar
      // enlaces es cosa suya.
      fields: {
        grupoFranjaGov: campoGrupoEnUnAcordeon('Franja superior GOV.CO', CAMPOS_FRANJA_SUPERIOR, {
          resumen: (grupo) => (grupo?.govBannerEnabled === false ? 'Oculta' : grupo?.govBannerImageUrl ? 'Con imagen' : 'Sin imagen'),
        }),
        mainLogoUrl: campoEnAcordeon(
          { ...campoImagen('Logo principal'), ayuda: 'Opcional. Si no subes uno, se muestra el logo del SENA con el del OLO.' },
          { resumen: (src) => (src ? 'Propio' : 'Por defecto') }
        ),
        grupoSeparacionMenu: campoGrupoEnUnAcordeon('Separación del menú', CAMPOS_SEPARACION_MENU, {
          resumen: (grupo) =>
            typeof grupo?.separacionLogoMenu === 'number' || typeof grupo?.separacionMenuAcciones === 'number'
              ? 'Personalizada'
              : 'Automática',
        }),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color de fondo de la barra',
          ayuda: 'Vacío deja el blanco. Con un color oscuro, el texto del menú puede dejar de leerse.',
        }),
        botonIntranet: campoGrupoEnUnAcordeon(
          'Botón de intranet',
          {
            texto: {
              type: 'text',
              label: 'Texto',
              placeholder: 'Intranet',
              ayuda: 'Se ve a la derecha del menú. El botón lleva siempre a la intranet.',
            },
            colorFondo: {
              type: 'color',
              label: 'Color del botón',
              ayuda: 'Vacío deja el azul oscuro. Al pasar el cursor se oscurece un poco solo.',
            },
            colorTexto: {
              type: 'color',
              label: 'Color del texto',
              ayuda: 'Vacío deja el blanco. Elige uno que contraste con el color del botón.',
            },
          },
          { resumen: (boton) => boton?.texto || 'Intranet' }
        ),
        paginaDelBuscador: campoEnAcordeon(
          {
            type: 'text',
            label: 'Página de resultados del buscador de ocupaciones',
            placeholder: '/clasificacion-nacional-de-ocupaciones',
            ayuda:
              'Todos los buscadores de ocupaciones del sitio llevan a esta página con lo buscado. Escríbela como un enlace del menú; su ruta completa la da el menú (si está dentro de un desplegable, cuelga de él). Esa página debe llevar el bloque «Buscador de Ocupaciones», que es el que muestra los resultados. Vacío: los resultados salen en la misma página donde se busca.',
          },
          { resumen: (pagina) => pagina || 'Sin página' }
        ),
        navLinks: {
          type: 'array',
          label: 'Menú de navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'Página (/nombre-de-la-página) o dirección completa' },
            active: {
              type: 'radio',
              label: 'Marcar como sección actual',
              options: [
                { label: 'No', value: false },
                { label: 'Sí', value: true },
              ],
            },
            children: {
              type: 'array',
              label: 'Submenú desplegable (opcional). Sus páginas cuelgan de una ruta con el nombre de esta sección',
              arrayFields: {
                label: { type: 'text', label: 'Texto del enlace' },
                href: { type: 'text', label: 'Página (/nombre-de-la-página) o dirección completa' },
                internas: {
                  type: 'array',
                  label: 'Páginas dentro de esta página (no salen en el menú; su ruta cuelga de esta)',
                  arrayFields: {
                    label: { type: 'text', label: 'Nombre de la página' },
                    href: { type: 'text', label: 'Página (/nombre-de-la-página)' },
                  },
                  getItemSummary: (item: { label?: string }) => item.label || 'Página',
                },
              },
              getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
            },
            colorFondoSubmenu: campoEnAcordeon({
              type: 'color',
              label: 'Color de fondo del submenú',
              ayuda: 'Solo se ve si esta sección tiene submenú. Vacío deja el blanco. Con un color oscuro, los enlaces del submenú (azul oscuro) pueden dejar de leerse.',
            }),
            colorTexto: campoEnAcordeon({
              type: 'color',
              label: 'Color del texto',
              ayuda: 'Vacío deja el azul oscuro de siempre.',
            }),
            colorHover: campoEnAcordeon({
              type: 'color',
              label: 'Color al pasar el cursor',
              ayuda: 'El color del texto cuando el visitante pone el cursor encima. Vacío = el mismo color del texto.',
            }),
            tamanoTexto: campoEnAcordeon({
              type: 'select',
              label: 'Tamaño del texto',
              options: Object.entries(TAMANOS_TEXTO_MENU).map(([value, { label }]) => ({ label, value })),
              ayuda: 'Solo en computador; en el celular el menú desplegable conserva su tamaño. Con tamaños grandes, revisa que el menú quepa a lo ancho.',
            }),
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
        },
      },
      // Los mismos valores que usa la cabecera cuando no hay «Menú y pie» guardado:
      // arrastrar el bloque al lienzo da la cabecera que ya se ve hoy, no una vacía.
      defaultProps: {
        ...CABECERA_POR_DEFECTO,
        colorFondo: '',
        colorFranjaGov: '',
        govBannerEnlace: '',
        govBannerMargenArriba: '',
        govBannerMargenAbajo: '',
        alineacionFranjaGov: 'izquierda',
        separacionFranjaGov: '',
        separacionLogoMenu: '',
        separacionMenuAcciones: '',
        botonIntranet: { texto: '', colorFondo: '', colorTexto: '' },
      },
      // El texto del botón vivía en `intranetText`; ahora va en `botonIntranet.texto`.
      // Al abrir una cabecera de antes se pasa una sola vez y `intranetText` queda
      // vacío: si no, borrar el texto del campo lo volvería a rellenar con el viejo.
      // Además, la tarjeta de la franja GOV.CO: grupo ⇄ props sueltas.
      resolveData: ({ props }: { props: Record<string, unknown> }) => {
        const boton = (props.botonIntranet ?? {}) as { texto?: string };
        const migrar = !boton.texto && typeof props.intranetText === 'string' && props.intranetText;
        const conBoton = migrar
          ? { ...props, intranetText: '', botonIntranet: { ...boton, texto: props.intranetText } }
          : props;
        return {
          props: resolverGruposDeProps(conBoton, {
            grupoFranjaGov: Object.keys(CAMPOS_FRANJA_SUPERIOR),
            grupoSeparacionMenu: Object.keys(CAMPOS_SEPARACION_MENU),
          }),
        };
      },
      render: (props: BlockRender<Omit<ComponentProps<typeof Header>, 'block'>>) => (
        <Header {...props} block={{ id: props.id || 'header-preview' }} />
      ),
    },
    Footer: {
      label: 'Pie de página',
      defaultProps: {
        footerPersonalizado: true,
        colorFondo: '',
        colorFondoSuperior: '',
        colorTarjeta: '',
        radioEsquinasTarjeta: '',
        radioEsquinasFondo: '',
        logoSenaUrl: '',
        logoSenaAlt: '',
        logoOloUrl: '',
        logoOloAlt: '',
        separadorLogos: '|',
        tamanoSeparadorLogos: 30,
        logoMintrabajoUrl: '',
        logoMintrabajoAlt: '',
        nombreEntidad: '',
        direccion: '',
        atencionPresencial: '',
        puntosAtencionTexto: '',
        whatsappTitulo: '',
        whatsappNumero: '',
        lineasAtencionTitulo: '',
        lineasAtencionTexto: '',
        mesaAyudaTitulo: '',
        mesaAyudaTelefono: '',
        mesaAyudaEmail: '',
        horarioTitulo: '',
        horarioTexto: '',
        certificacionImgUrl: '',
        certificacionImgAlt: '',
        mostrarFranjaGov: false,
        rutaCoImgUrl: '',
        rutaCoImgAlt: '',
        alineacionFranjaGov: 'izquierda',
        separacionFranjaGov: '',
        redesSociales: [],
        certificaciones: [],
        enlacesFila1: [],
        enlacesFila2: [],
        enlacesFila3: []
      },
      // Tarjetas por tema y listas con «+ Agregar»; las props sueltas que leen el pie
      // publicado y `Footer` las mantiene `resolverGruposDelPie` (ver campos-del-pie.ts).
      fields: crearCamposDelPie(campoImagen),
      resolveData: resolverGruposDelPie,
      render: (props: BlockRender<Omit<ComponentProps<typeof Footer>, 'block'>>) => (
        <Footer {...props} block={{ id: props.id || 'footer-preview' }} />
      ),
    },

    /**
     * Sección «¿Sabes qué es una ocupación?» de la portada: titular, descripción y un
     * recuadro con el buscador, sobre una imagen de fondo (`PortadaBuscadorOcupaciones`).
     *
     * Reemplazó al banner azul con logo e ilustración. Conserva el tipo `Hero` y los
     * nombres `titulo` (ahora el texto del recuadro) y `colorFondo` (ahora el color del
     * recuadro) para que la portada guardada siga sirviendo; `imageUrl`, `imageAlt`,
     * `modelSrc` y `modelAlt` quedan en el JSON viejo y ya no se leen.
     *
     * Los textos van en dos campos de Editor.js: «Textos del buscador» (`contenido`), donde el
     * tipo de bloque decide la zona (encabezado = titular; párrafo y lista = descripción, ver
     * `repartirTextos`), y «Texto bloque» (`textoBloque`), el texto del recuadro azul. Antes eran
     * tres campos `richtext` de Puck, primero sueltos y luego en la tarjeta `textos`:
     * `resolveData` los pasa a los campos nuevos al abrir el editor, y hasta que se vuelva a
     * publicar el render los sigue leyendo como estaban (`htmlGuardado`).
     */
    Hero: {
      label: 'Buscador de ocupaciones',
      fields: {
        grupoTextos: campoGrupoEnUnAcordeon('Textos del buscador', CAMPOS_TEXTOS_DEL_BUSCADOR, { abierto: true }),
        grupoRecuadro: campoGrupoEnUnAcordeon('Texto bloque y placeholder', CAMPOS_RECUADRO_DEL_BUSCADOR),
        imagenFondo: campoEnAcordeon(
          {
            ...campoImagen('Imagen de fondo'),
            ayuda: 'Cubre toda la sección y se recorta para llenarla. Es decorativa: no lleva texto alternativo. Sin imagen, la sección no lleva fondo y se ve el de la página.',
          },
          { abierto: true, resumen: (src) => (src ? 'Cargada' : 'Sin imagen') }
        ),
        transparenciaFondo: campoEnAcordeon({
          type: 'number',
          label: 'Transparencia de la imagen',
          min: 0,
          max: 100,
          sufijo: '%',
          placeholder: '0',
          ayuda: '0 %: la imagen se ve tal cual. 100 %: no se ve. Vacío: 0 %.',
        }),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color del recuadro',
          ayuda: 'El del recuadro del buscador y su botón. Vacío: el azul del diseño.',
        }),
      },
      defaultProps: {
        id: 'hero-1',
        contenido: CONTENIDO_DEL_BUSCADOR_POR_DEFECTO,
        colorTexto: '',
        textoBloque: TEXTO_BLOQUE_POR_DEFECTO,
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        colorTextoBloque: '',
        grupoTextos: { contenido: CONTENIDO_DEL_BUSCADOR_POR_DEFECTO },
        grupoRecuadro: {
          textoBloque: TEXTO_BLOQUE_POR_DEFECTO,
          searchPlaceholder: 'Buscar ocupación, código o denominación',
          colorTextoBloque: '',
        },
        imagenFondo: '',
        transparenciaFondo: '',
        colorFondo: '',
      },
      // Una portada guardada antes de los campos de Editor.js trae los tres textos como HTML,
      // en la tarjeta `textos` o sueltos (y una de antes del rediseño, sin titular ni
      // descripción): se pasan a los campos al abrirla en el editor, completando lo que falte,
      // para que se vean y se puedan corregir. Al final, las dos tarjetas de texto: grupo ⇄
      // props sueltas (ver `grupos-de-props.ts`).
      resolveData: ({ props }: { props: Record<string, unknown> }) => {
        const conTarjetas = (sueltas: Record<string, unknown>) => ({
          props: {
            ...resolverGruposDeProps(sueltas, {
              grupoTextos: Object.keys(CAMPOS_TEXTOS_DEL_BUSCADOR),
              grupoRecuadro: Object.keys(CAMPOS_RECUADRO_DEL_BUSCADOR),
            }),
            // «Textos del buscador» ya no tiene color global (se pone por palabras en el
            // Editor.js): uno guardado antes se vacía, para que no quede aplicado sin campo.
            colorTexto: '',
          },
        });
        const tarjetaTextos = (props.grupoTextos ?? null) as Record<string, unknown> | null;
        const guardado = (tarjetaTextos?.contenido ?? props.contenido) as OutputData | undefined;
        if (guardado) {
          // La primera versión del campo único llevaba el texto del recuadro como una cita de
          // `contenido`; el campo ya no ofrece la cita: pasa a «Texto bloque».
          const { sinCitas, citas } = separarCitas(guardado);
          if (!citas.length) return conTarjetas(props);
          const enParrafos = citas.map(({ data }) => ({ type: 'paragraph', data: { text: data.text } }));
          const textos = tarjetaTextos ?? {};
          const recuadro = (props.grupoRecuadro ?? {
            searchPlaceholder: props.searchPlaceholder,
            colorTextoBloque: props.colorTextoBloque,
          }) as Record<string, unknown>;
          return conTarjetas({
            ...props,
            contenido: sinCitas,
            grupoTextos: { ...textos, contenido: sinCitas },
            grupoRecuadro: { ...recuadro, textoBloque: recuadro.textoBloque ?? props.textoBloque ?? { blocks: enParrafos } },
          });
        }
        const { textos, tituloSeccion, descripcion, titulo, ...resto } = props;
        const enTarjeta = (typeof textos === 'object' && textos !== null ? textos : {}) as Record<string, unknown>;
        const enHtml = (clave: keyof TextosEnHtml, suelto: unknown) => {
          const valor = enTarjeta[clave] ?? suelto;
          return typeof valor === 'string' ? valor : undefined;
        };
        return conTarjetas({
          ...resto,
          contenido: contenidoDesdeHtml({
            tituloSeccion: enHtml('tituloSeccion', tituloSeccion),
            descripcion: enHtml('descripcion', descripcion),
          }),
          textoBloque: textoBloqueDesdeHtml(enHtml('titulo', titulo)),
        });
      },
      render: ({
        puck,
        contenido,
        colorTexto,
        textoBloque,
        colorTextoBloque,
        textos,
        tituloSeccion,
        descripcion,
        titulo,
        searchPlaceholder,
        imagenFondo,
        transparenciaFondo,
        colorFondo,
      }: BlockRender<{
        puck?: { isEditing?: boolean };
        contenido?: OutputData;
        colorTexto?: string;
        textoBloque?: OutputData;
        colorTextoBloque?: string;
        // Los textos de una portada guardada antes de los campos de Editor.js, en la tarjeta o
        // sueltos: HTML que Puck ya no convierte a nodos.
        textos?: TextosEnHtml;
        tituloSeccion?: string;
        descripcion?: string;
        titulo?: string;
        searchPlaceholder?: string;
        imagenFondo?: string;
        transparenciaFondo?: number | '';
        colorFondo?: string;
      }>) => (
        <HeroBuscadorOcupaciones
          contenido={contenido}
          colorTexto={colorTexto}
          textoBloque={textoBloque}
          colorTextoBloque={colorTextoBloque}
          tituloSeccion={htmlGuardado(textos?.tituloSeccion ?? tituloSeccion)}
          descripcion={htmlGuardado(textos?.descripcion ?? descripcion)}
          titulo={htmlGuardado(textos?.titulo ?? titulo)}
          searchPlaceholder={searchPlaceholder}
          imagenFondo={imagenFondo}
          transparenciaFondo={transparenciaFondo}
          colorFondo={colorFondo}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    // Sin campos a propósito (mismo caso que `Footer`): los datos no viven en el
    // JSON de la página, viven en `formacion_sobresalientes` (Postgres). El
    Services: {
      label: 'Servicios',
      fields: {
        sectionTitle: {
          type: 'text' as const,
          label: 'Título de la sección',
          contentEditable: true,
        },
        colorTitle: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        services: {
          type: 'array' as const,
          label: 'Lista de servicios',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            title: { type: 'text' as const, label: 'Título', contentEditable: true },
            description: campoTextoRico('Descripción'),
          },
          defaultItemProps: {
            id: 'nuevo-servicio',
            title: 'Nuevo servicio',
            description: '<p>Descripción del servicio.</p>',
          },
        },
      },
      defaultProps: {
        id: 'services-1',
        sectionTitle: '¿Qué hacemos?',
        colorTitle: '',
        services: [
          {
            id: 'monitoreo',
            title: 'Monitoreo del Mercado',
            description: '<p>Seguimiento riguroso de fuentes de información laboral nacional</p>',
          },
          {
            id: 'orientacion',
            title: 'Orientación y Formación',
            description: '<p>Apoyo a la definición de acciones de capacitación, emprendimiento y empleo</p>',
          },
          {
            id: 'alertas',
            title: 'Generación de Alertas',
            description: '<p>Identificación de proyectos de inversión y alertas regionales y sectoriales</p>',
          },
        ],
      },
      render: ({
        id,
        sectionTitle,
        colorTitle,
        services,
      }: {
        id: string;
        sectionTitle?: ReactNode;
        colorTitle?: string;
        services?: { id: string; title: ReactNode; description: ReactNode }[];
      }) => (
        <Services
          block={{ id: id || 'services-preview' }}
          sectionTitle={sectionTitle}
          colorTitle={colorTitle}
          services={services}
        />
      ),
    },
    /**
     * Mini carrusel de infografías del dato semanal (`DatoOloSemana`): pasa solo, sin
     * flechas, con el ubicador de puntos. Una sola tarjeta «Imágenes» con la lista (cada
     * imagen con su color e imagen de fondo) y el redondeo; «Espaciado y Ancho» va aparte, sin su
     * color de fondo (`sinFondo` en `puckConfig`). Reemplazó a la infografía única con
     * título: una portada guardada así trae `imagenSrc` y se ve con esa imagen sola
     * hasta que se abra en el editor.
     */
    DatoOloSemana: {
      label: 'Dato OLO de la semana',
      fields: {
        galeria: campoObjetoEnAcordeon(
          'Imágenes',
          {
            imagenes: campoListaEnAcordeones(
              'Infografías',
              {
                imagen: { ...campoImagen('Imagen'), ayuda: 'La infografía entera, con el dato dibujado. Todas conviene que tengan la misma proporción.' },
                alt: {
                  type: 'text',
                  label: 'Texto alternativo',
                  placeholder: 'El dato que dice la imagen',
                  ayuda: 'Lo lee el lector de pantalla: escribe el dato completo, porque está dentro de la imagen. Obligatorio para enviar a revisión.',
                },
                colorFondo: {
                  type: 'color',
                  label: 'Color de fondo',
                  ayuda: 'El de la sección mientras se ve esta imagen; por defecto, blanco. Los puntos de abajo van en azul sobre fondos claros y en blanco sobre oscuros.',
                },
                // Como el color: el de la sección mientras se ve esta infografía.
                imagenFondo: {
                  ...CAMPOS_IMAGEN_DE_FONDO.imagen,
                  label: 'Imagen de fondo',
                  ayuda: 'La de la sección mientras se ve esta infografía, encima de su color de fondo. Es decorativa: no lleva texto alternativo.',
                },
                transparenciaFondo: { ...CAMPOS_IMAGEN_DE_FONDO.transparencia, label: 'Transparencia de la imagen de fondo' },
                repeticionFondo: { ...CAMPOS_IMAGEN_DE_FONDO.repeticion, label: 'Repetición de la imagen de fondo' },
              },
              {
                elemento: 'Imagen',
                nuevo: { imagen: '', alt: '', colorFondo: '', imagenFondo: '', transparenciaFondo: '', repeticionFondo: 'no-repeat' },
                resumen: (d) => d?.alt || (d?.imagen ? 'Sin texto alternativo' : 'Vacía'),
                ayuda: 'Pasan solas en este orden y, después de la última, vuelven a la primera. Con una sola, no se mueve.',
              }
            ),
            radioEsquinas: campoEnAcordeon({
              type: 'number',
              label: 'Esquinas redondeadas',
              min: 0,
              max: 100,
              sufijo: 'px',
              placeholder: '0',
              ayuda: 'Redondea las cuatro esquinas de todas las imágenes. Vacío o 0: rectas.',
            }),
            segundos: campoEnAcordeon({
              type: 'number',
              label: 'Tiempo de cada imagen',
              min: 3,
              max: 60,
              sufijo: 's',
              placeholder: '6',
              ayuda: 'Cuántos segundos se ve cada imagen antes de pasar a la siguiente, de 3 a 60. Vacío: 6. Se detiene mientras el cursor está encima.',
            }),
          },
          { abierto: true }
        ),
      },
      defaultProps: {
        id: 'dato-olo-semana-1',
        galeria: { imagenes: [], radioEsquinas: '', segundos: '' },
      },
      // Una portada guardada antes del rediseño trae una sola imagen en `imagenSrc`; la
      // primera versión del carrusel, `imagenes`, `colorFondo` y `radioEsquinas` sueltos.
      // Se pasan a `galeria` al abrirla, para que se puedan editar.
      resolveData: ({ props }: { props: Record<string, unknown> }) => {
        if (props.galeria !== undefined) return { props };
        const anteriores: Record<string, unknown>[] = Array.isArray(props.imagenes)
          ? props.imagenes
          : props.imagenSrc
            ? [{ imagen: props.imagenSrc, alt: props.imagenAlt ?? '' }]
            : [];
        return {
          props: {
            ...props,
            galeria: {
              imagenes: anteriores.map((imagen) => ({ colorFondo: props.colorFondo ?? '', ...imagen })),
              radioEsquinas: props.radioEsquinas ?? '',
              segundos: '',
            },
          },
        };
      },
      render: ({
        id,
        puck,
        ...props
      }: BlockRender<Omit<ComponentProps<typeof DatoOloSemana>, 'block' | 'esEdicion'>> & {
        puck?: { isEditing?: boolean };
      }) => (
        <DatoOloSemana {...props} block={{ id: id || 'dato-olo-semana-preview' }} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    RecursosVisualesBloque: {
      label: 'Lista de videos',
      fields: {
        titulo: campoTextoRico('Título'),
        videos: {
          type: 'array' as const,
          label: 'Videos',
          arrayFields: {
            youtubeId: {
              type: 'custom' as const,
              label: 'Enlace o ID de YouTube',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <CampoYoutubePreview value={value} onChange={onChange} />
              ),
            },
            titulo: { type: 'text' as const, label: 'Título', contentEditable: true },
            canal: { type: 'text' as const, label: 'Canal', contentEditable: true },
            miniatura: {
              type: 'custom',
              label: 'Miniatura propia (opcional)',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ImageUploaderField value={value} onChange={onChange} />
              ),
            },
          },
          getItemSummary: (item: { titulo?: string; youtubeId?: string }) => {
            const titulo = typeof item.titulo === 'string' ? item.titulo.trim() : '';
            if (titulo) return titulo;
            const id = extraerYoutubeId(item.youtubeId);
            if (id) return `Video (${id})`;
            return 'Video sin configurar';
          },
        },
      },
      defaultProps: {
        id: 'recursos-visuales-1',
        titulo: '<p><strong>Recursos</strong> visuales</p>',
        videos: [
          {
            youtubeId: 'm1h4tcLAmEk',
            titulo: '#DatoOLO | Con nuestros servicios apoyamos a los colombianos víctimas del conflicto armado',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'v2imp4BA-Zg',
            titulo: '#DatoOLO | ¡Con nosotros te formas para el éxito!',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'QjPPzJNR9K0',
            titulo: '#DatoOLO | ¿Ya estás preparado para OLO te Cuenta 🤔?',
            canal: '@SENAComunica',
          },
          {
            youtubeId: 'azV9kvP4ikw',
            titulo: '#DatoOLO | ¡No te pierdas ni un minuto de OLO Te Cuenta!',
            canal: '@SENAComunica',
          },
        ],
      },
      render: ({
        id,
        titulo,
        videos,
        puck,
      }: BlockRender<{
        titulo?: ReactNode;
        videos?: { youtubeId?: string; titulo?: ReactNode; canal?: ReactNode; miniatura?: string }[];
        puck?: { isEditing?: boolean };
      }>) => (
        <RecursosVisualesBloque
          block={{ id: id || 'recursos-visuales-preview' }}
          titulo={titulo}
          videos={videos}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    Publicaciones: {
      label: 'Últimas publicaciones',
      fields: {
        mostrarTitulo: {
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        titulo: campoTextoRico('Título'),
        fondo: campoEnAcordeon({ type: 'color', label: 'Color de fondo', ayuda: 'Vacío = el color por defecto del bloque.' }),
        movimiento: {
          type: 'radio' as const,
          label: 'Se mueve solo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        velocidad: { type: 'radio' as const, label: 'Velocidad de la cinta', options: VELOCIDADES_CINTA },
        publicaciones: {
          type: 'array' as const,
          label: 'Publicaciones',
          arrayFields: {
            titulo: { type: 'textarea' as const, label: 'Nombre de la publicación (Enter parte la línea)', contentEditable: true },
            detalle: { type: 'text' as const, label: 'Detalle (texto verde sobre el nombre, opcional)', contentEditable: true },
            miniatura: campoImagen('Miniatura (opcional; sin ella, la primera página del PDF)'),
            pdfUrl: {
              type: 'custom',
              label: 'Archivo PDF',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ArchivoUploaderField
                  value={value}
                  onChange={onChange}
                  accept=".pdf"
                  etiquetaBoton="Subir archivo"
                />
              ),
            },
            nombreArchivo: { type: 'text' as const, label: 'Nombre al descargar (opcional)' },
            url: { type: 'text' as const, label: 'Enlace de la flecha (/ruta o https://…; vacío: abre el PDF)' },
            // Siguen llamándose `mes` y `dia` porque así están en el JSON guardado: el mes
            // (línea pequeña) y el año (línea grande) de la insignia, con formato.
            mes: campoTextoRico('Mes (p. ej. ENE - MAR)'),
            dia: campoTextoRico('Año (p. ej. 2026)'),
          },
          getItemSummary: (item: { titulo?: string; pdfUrl?: string }) => {
            const titulo = typeof item.titulo === 'string' ? item.titulo.replace(/\s+/g, ' ').trim() : '';
            if (titulo) return titulo;
            if (item.pdfUrl) {
              const nombre = nombreDeArchivoDecodificado(item.pdfUrl.split('/').pop() ?? 'Documento PDF');
              return `PDF: ${nombre}`;
            }
            return 'Publicación sin título';
          },
        },
      },
      defaultProps: {
        id: 'publicaciones-1',
        mostrarTitulo: true,
        titulo: '<p><strong>Ultimas</strong> publicaciones</p>',
        fondo: '',
        movimiento: true,
        velocidad: 45,
        // Vacía, como en la intranet: el lienzo enseña la vista previa de ejemplo con el
        // nombre, el mes y el año por rellenar, en vez de publicaciones reales sembradas.
        publicaciones: [],
      },
      render: ({
        id,
        titulo,
        mostrarTitulo,
        publicaciones,
        fondo,
        movimiento,
        velocidad,
        puck,
      }: BlockRender<{
        titulo?: ReactNode;
        mostrarTitulo?: boolean;
        publicaciones?: PublicacionItem[];
        fondo?: string;
        movimiento?: boolean;
        velocidad?: number;
        puck?: { isEditing?: boolean };
      }>) => (
        <Publicaciones
          block={{ id: id || 'publicaciones-preview' }}
          titulo={titulo}
          mostrarTitulo={mostrarTitulo}
          publicaciones={publicaciones}
          fondo={fondo}
          movimiento={movimiento}
          velocidad={velocidad}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    PoliticaPrivacidadEncabezado: {
      label: 'Encabezado de política',
      fields: {
        titulo: campoTextoRico('Título (h1 de la página)'),
        intro: campoTextoRico('Párrafos de introducción'),
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        colorContenido: campoEnAcordeon({ type: 'color', label: 'Color de la introducción / contenido', ayuda: 'Vacío = el color por defecto del bloque.' }),
      },
      defaultProps: {
        id: 'politica-encabezado-1',
        titulo: 'Políticas de Seguridad, Privacidad y Tratamiento de Datos',
        intro:
          '<p>El <strong>Servicio Nacional de Aprendizaje SENA</strong>, a través del <strong>Observatorio Laboral y Ocupacional</strong>, dispone para consulta ciudadana los lineamientos oficiales de la Política de Seguridad y Privacidad de la Información y la Política de Tratamiento para Protección de Datos Personales, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Sistema de Gestión CompromISO.</p><p>A continuación, seleccione el documento normativo que desea consultar para leerlo directamente en formato PDF o descargar una copia oficial.</p>',
        colorTitulo: '',
        colorContenido: '',
      },
      render: ({
        id,
        titulo,
        intro,
        colorTitulo,
        colorContenido,
      }: BlockRender<{
        titulo?: ReactNode;
        intro?: ReactNode;
        colorTitulo?: string;
        colorContenido?: string;
      }>) => (
        <PoliticaPrivacidadEncabezado
          block={{ id: id || 'politica-encabezado-preview' }}
          titulo={titulo}
          intro={intro}
          colorTitulo={colorTitulo}
          colorContenido={colorContenido}
        />
      ),
    },
    VisorDocumentosNormativos: {
      label: 'Visor de documentos normativos',
      fields: {
        titulo: campoTextoRico('Título de la sección'),
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        documentos: {
          type: 'array' as const,
          label: 'Documentos',
          arrayFields: {
            etiquetaTab: { type: 'text' as const, label: 'Texto de la pestaña', contentEditable: true },
            titulo: { type: 'text' as const, label: 'Título del documento', contentEditable: true },
            descripcion: { type: 'text' as const, label: 'Descripción breve', contentEditable: true },
            documentoId: { type: 'text' as const, label: 'ID en CompromISO SENA (ej. 6701)' },
            nombreArchivo: { type: 'text' as const, label: 'Nombre al descargar (opcional)' },
          },
          defaultItemProps: {
            etiquetaTab: 'Nuevo documento',
            titulo: 'Nuevo documento',
            descripcion: '',
            documentoId: '',
          },
          getItemSummary: (item: { titulo?: string }) => item.titulo || 'Documento',
        },
      },
      defaultProps: {
        id: 'visor-documentos-1',
        titulo: 'Documentos y Recursos Normativos Oficiales',
        colorTitulo: '',
        documentos: [
          {
            etiquetaTab: '1. Seguridad y Privacidad (ID: 6701)',
            titulo: 'Política de Seguridad y Privacidad de la Información',
            descripcion:
              'Documento oficial del Sistema Integrado de Gestión y Autocontrol CompromISO SENA. Lineamientos de seguridad digital y confidencialidad institucional.',
            documentoId: '6701',
          },
          {
            etiquetaTab: '2. Tratamiento de Datos (ID: 6914)',
            titulo: 'Política de Tratamiento para Protección de Datos Personales',
            descripcion:
              'Régimen y garantías institucionales para el tratamiento, protección de datos personales y ejercicio de derechos de Habeas Data conforme a la Ley 1581 de 2012.',
            documentoId: '6914',
          },
        ],
      },
      render: ({
        id,
        titulo,
        colorTitulo,
        documentos,
      }: BlockRender<{ titulo?: ReactNode; colorTitulo?: string; documentos?: DocumentoNormativo[] }>) => (
        <VisorDocumentosNormativos
          block={{ id: id || 'visor-documentos-preview' }}
          titulo={titulo}
          colorTitulo={colorTitulo}
          documentos={documentos}
        />
      ),
    },
    CanalesAtencion: {
      label: 'Canales de atención',
      fields: {
        titulo: campoTextoRico('Título de la sección'),
        intro: campoTextoRico('Párrafo de introducción'),
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        colorContenido: campoEnAcordeon({ type: 'color', label: 'Color del contenido / introducción', ayuda: 'Vacío = el color por defecto del bloque.' }),
        canales: {
          type: 'array' as const,
          label: 'Canales',
          arrayFields: {
            etiqueta: { type: 'text' as const, label: 'Etiqueta', contentEditable: true },
            valor: { type: 'text' as const, label: 'Valor', contentEditable: true },
          },
          defaultItemProps: { etiqueta: 'Nuevo canal', valor: '' },
          getItemSummary: (item: { etiqueta?: string }) => item.etiqueta || 'Canal',
        },
      },
      defaultProps: {
        id: 'canales-atencion-1',
        titulo: 'Canales de Atención y Ejercicio de Derechos (Habeas Data)',
        intro:
          '<p>Para ejercer sus derechos de conocer, actualizar, rectificar o suprimir sus datos personales, o para presentar cualquier consulta o reclamo relativo a la protección de datos, el SENA pone a disposición los siguientes canales oficiales:</p>',
        colorTitulo: '',
        colorContenido: '',
        canales: [
          { etiqueta: 'Correo Electrónico', valor: 'servicioalciudadano@sena.edu.co' },
          { etiqueta: 'Línea Gratuita Nacional', valor: '01 8000 910270 • (601) 343 0111' },
          { etiqueta: 'Dirección General', valor: 'Calle 57 No. 8 - 69, Bogotá D.C.' },
          { etiqueta: 'Tiempos de Respuesta', valor: '10 a 15 días hábiles (Ley 1581)' },
        ],
      },
      render: ({
        id,
        titulo,
        intro,
        colorTitulo,
        colorContenido,
        canales,
      }: BlockRender<{
        titulo?: ReactNode;
        intro?: ReactNode;
        colorTitulo?: string;
        colorContenido?: string;
        canales?: CanalDeAtencion[];
      }>) => (
        <CanalesAtencion
          block={{ id: id || 'canales-atencion-preview' }}
          titulo={titulo}
          intro={intro}
          colorTitulo={colorTitulo}
          colorContenido={colorContenido}
          canales={canales}
        />
      ),
    },
    /**
     * Fila de tarjetas de color con ícono y texto, unidas por una flecha
     * (`ExternalPortals`). Reemplazó a la rejilla con título, subtítulo e ilustraciones:
     * una portada guardada así trae `portals` y no `tarjetas`, y se ve con las tres
     * tarjetas del diseño hasta que se abra en el editor.
     */
    ExternalPortals: {
      label: 'Portales Externos',
      fields: {
        tarjetas: {
          type: 'array' as const,
          label: 'Tarjetas',
          arrayFields: {
            icono: campoEnAcordeon(
              {
                type: 'custom',
                label: 'Ícono',
                render: ({ value, onChange }) => (
                  <IconSelectorField
                    value={value}
                    onChange={onChange}
                    catalogo={ICONOS_DE_PORTALES}
                    permitirRuta={false}
                  />
                ),
                ayuda: 'Va en el círculo blanco, en azul.',
              },
              {
                abierto: true,
                resumen: (ruta) =>
                  ICONOS_DE_PORTALES.find((icono) => icono.id === ruta)?.nombre ?? (ruta ? 'Otro' : 'Sin ícono'),
              }
            ),
            // La tarjeta entera ya es un enlace: un enlace dentro de otro no vale.
            texto: campoTextoRico('Texto', { link: false }),
            enlace: campoEnAcordeon({
              type: 'text',
              label: 'Hipervínculo',
              placeholder: '/pqrs o https://…',
              ayuda: 'A dónde lleva la tarjeta al hacer clic en ella. Vacío: no lleva a ningún lado.',
            }),
            colorFondo: campoEnAcordeon({
              type: 'color',
              label: 'Color de fondo',
              ayuda: 'También pinta la flecha hacia la tarjeta siguiente. Vacío: azul #001145.',
            }),
          },
          defaultItemProps: {
            icono: '',
            texto: '<p><strong>Nuevo portal</strong></p>',
            enlace: '',
            colorFondo: '#001145',
          },
          getItemSummary: (tarjeta: { texto?: unknown }) =>
            String(tarjeta?.texto ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Tarjeta',
        },
        radioEsquinas: campoEnAcordeon({
          type: 'number',
          label: 'Esquinas redondeadas',
          min: 0,
          max: 100,
          sufijo: 'px',
          placeholder: '0',
          ayuda: 'Redondea las cuatro esquinas de afuera de la fila; donde se unen las tarjetas quedan rectas. Vacío o 0: rectas.',
        }),
      },
      defaultProps: {
        id: 'portals-1',
        radioEsquinas: '',
        tarjetas: [
          {
            icono: '/assets/svg/portales/pqrs.svg',
            texto: '<p><strong>Molestia referente<br>a PQRS</strong></p>',
            enlace: '#',
            colorFondo: '#001145',
          },
          {
            icono: '/assets/svg/portales/denuncia.svg',
            texto: '<p><strong>Denuncia por<br>corrupción</strong></p>',
            enlace: '#',
            colorFondo: '#85e501',
          },
          {
            icono: '/assets/svg/portales/transparencia.svg',
            texto: '<p><strong>Transparencia</strong></p>',
            enlace: '#',
            colorFondo: '#07ecfc',
          },
        ],
      },
      // Una portada guardada antes del rediseño no trae `tarjetas`: se le ponen las del
      // diseño al abrirla, para que se puedan editar.
      resolveData: ({ props }: { props: Record<string, unknown> }) =>
        props.tarjetas !== undefined
          ? { props }
          : {
              props: {
                ...props,
                tarjetas: [
              {
                icono: '/assets/svg/portales/pqrs.svg',
                texto: '<p><strong>Molestia referente<br>a PQRS</strong></p>',
                enlace: '#',
                colorFondo: '#001145',
              },
              {
                icono: '/assets/svg/portales/denuncia.svg',
                texto: '<p><strong>Denuncia por<br>corrupción</strong></p>',
                enlace: '#',
                colorFondo: '#85e501',
              },
              {
                icono: '/assets/svg/portales/transparencia.svg',
                texto: '<p><strong>Transparencia</strong></p>',
                enlace: '#',
                colorFondo: '#07ecfc',
              },
            ],
              },
            },
      render: ({
        id,
        tarjetas,
        radioEsquinas,
        puck,
      }: {
        id: string;
        tarjetas?: TarjetaDePortal[];
        radioEsquinas?: number | '';
        puck?: { isEditing?: boolean };
      }) => (
        <ExternalPortals
          block={{ id: id || 'portals-preview' }}
          tarjetas={tarjetas}
          radioEsquinas={radioEsquinas}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    /**
     * Un video de YouTube en un marco blanco con titular, sobre un fondo de color
     * (`VideoEmbebido`). Traído del «Video embebido» de la intranet, sin la descarga.
     * Solo acepta YouTube: el ID o un enlace, del que se saca el ID (`idDeVideoDeYoutube`).
     */
    VideoEmbebido: {
      label: 'Video embebido',
      fields: {
        titulo: campoTextoRico('Título'),
        subtitulo: campoTextoRico('Subtítulo (opcional)'),
        video: campoEnAcordeon(
          {
            type: 'custom',
            label: 'Video de YouTube',
            render: ({ value, onChange }) => <CampoVideoDeYoutube value={value} onChange={onChange} />,
          },
          { abierto: true, resumen: (valor) => (idDeVideoDeYoutube(valor) ? 'Reconocido' : valor ? 'No válido' : 'Sin video') }
        ),
        tituloVideo: campoEnAcordeon({
          type: 'text',
          label: 'Nombre del video',
          placeholder: 'Todo lo que somos en un solo video',
          ayuda: 'Lo anuncia el lector de pantalla al llegar al video. Obligatorio para enviar a revisión.',
        }),
        miniatura: campoEnAcordeon(
          {
            ...campoImagen('Miniatura (opcional)'),
            ayuda: 'Se ve en lugar del video, con un botón de reproducir; al pulsarlo arranca el video. Mejor en 16:9: se recorta para llenar el marco. Sin imagen: el reproductor de YouTube directo.',
          },
          { resumen: (src) => (src ? 'Cargada' : 'Sin imagen') }
        ),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color de fondo',
          ayuda: 'El de toda la sección. Vacío: azul #001145. El título va en blanco.',
        }),
        fondo: campoImagenDeFondo(),
      },
      defaultProps: {
        titulo: '<p><em>Todo</em> <strong>lo que somos</strong> <em>en un solo video</em></p>',
        subtitulo: '<p>Aquí te lo explicamos</p>',
        video: '',
        tituloVideo: 'Todo lo que somos en un solo video',
        miniatura: '',
        colorFondo: '',
        fondo: { imagen: '', transparencia: '', repeticion: 'no-repeat' },
      },
      render: ({
        id,
        puck,
        ...props
      }: BlockRender<Omit<ComponentProps<typeof VideoEmbebido>, 'block' | 'esEdicion'>> & {
        puck?: { isEditing?: boolean };
      }) => (
        <VideoEmbebido {...props} block={{ id: id || 'video-preview' }} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    /**
     * Carrusel de imágenes a lo ancho, una por vez, con un párrafo encima, sobre
     * un color de fondo (`CarruselDeImagenes`). Pasa solo y lleva dos flechas de estilo
     * fijo. No es el carrusel de la intranet (`SeccionCarrusel`, varias a la vez).
     */
    CarruselDeImagenes: {
      label: 'Carrusel de imágenes',
      fields: {
        textos: campoObjetoEnAcordeon(
          'Párrafo',
          {
            parrafo: campoTextoRico('Párrafo'),
            // El de la franja del texto, aparte del banner de imágenes.
            colorFondo: campoEnAcordeon({ type: 'color', label: 'Color de fondo', ayuda: 'Vacío = el color por defecto del bloque.' }),
          },
          { abierto: true }
        ),
        diapositivas: campoListaEnAcordeones(
          'Imágenes',
          {
            imagen: { ...campoImagen('Imagen'), ayuda: 'Se ve a lo ancho del carrusel; todas conviene que tengan la misma proporción.' },
            alt: {
              type: 'text',
              label: 'Texto alternativo',
              placeholder: 'Qué muestra la imagen',
              ayuda: 'Lo lee el lector de pantalla. Obligatorio para enviar a revisión.',
            },
            enlace: {
              type: 'text',
              label: 'Hipervínculo (opcional)',
              placeholder: '/alertas-de-inversion o https://…',
              ayuda: 'A dónde lleva el botón de abajo o, si no hay botón, la imagen al hacer clic en ella. Vacío: no lleva a ningún lado.',
            },
            textoBoton: {
              type: 'text',
              label: 'Texto del botón (opcional)',
              placeholder: 'Consulta más proyectos aquí',
              ayuda: 'Pone un botón debajo de la imagen que lleva al hipervínculo. Sin hipervínculo no se muestra.',
            },
            colorFondo: {
              type: 'color',
              label: 'Color de fondo',
              ayuda: 'El de la franja del banner mientras se ve esta imagen; por defecto, blanco (#FFFFFF). El párrafo tiene el suyo, en «Párrafo».',
            },
          },
          {
            elemento: 'Imagen',
            nuevo: { imagen: '', alt: '', enlace: '', textoBoton: '', colorFondo: '#FFFFFF' },
            resumen: (d) => d?.alt || (d?.imagen ? 'Sin texto alternativo' : 'Vacía'),
            ayuda: 'Pasan solas cada 6 segundos, en este orden.',
          }
        ),
      },
      defaultProps: {
        textos: {
          parrafo: '<p>Agrega una descripción</p>',
          colorFondo: '#FFFFFF',
        },
        diapositivas: [],
      },
      render: ({
        id,
        puck,
        ...props
      }: BlockRender<Omit<ComponentProps<typeof CarruselDeImagenes>, 'block' | 'esEdicion'>> & {
        puck?: { isEditing?: boolean };
      }) => (
        <CarruselDeImagenes {...props} block={{ id: id || 'carrusel-preview' }} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    // ─── Texto e imagen ───
    TextoRico: {
      label: 'Texto con formato',
      fields: {
        mostrarTitulo: {
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        titulo: campoTextoRico('Título'),
        mostrarSubtitulo: {
          type: 'radio',
          label: 'Mostrar subtítulo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtitulo: campoTextoRico('Subtítulo'),
        contenido: campoTextoRico('Contenido'),
        fondo: campoFondo,
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        colorContenido: campoEnAcordeon({ type: 'color', label: 'Color del contenido', ayuda: 'Vacío = el color por defecto del bloque.' }),
        colorTexto: campoEnAcordeon({ type: 'color', label: 'Color del texto', ayuda: 'Vacío = el color por defecto del bloque.' }),
        ancho: {
          type: 'radio',
          label: 'Ancho',
          options: [
            { label: 'Estrecho', value: 'estrecho' },
            { label: 'Ancho', value: 'ancho' },
          ],
        },
      },
      defaultProps: {
        mostrarTitulo: true,
        titulo: '¿Qué es?',
        mostrarSubtitulo: false,
        subtitulo: '',
        contenido: '<p>Escribe aquí el contenido de la sección.</p>',
        fondo: 'gris',
        colorTitulo: '',
        colorContenido: '',
        colorTexto: '',
        ancho: 'estrecho',
      },
      render: (props: BlockRender<ComponentProps<typeof TextoRico>>) => <TextoRico {...props} />,
    },
    ImagenDestacada: {
      label: 'Imagen destacada',
      // El alt lo exige @olo/accessibility-policy al enviar a revisión.
      fields: {
        imagenSrc: campoEnAcordeon(campoImagen('Imagen'), {
          abierto: true,
          resumen: (src) => (src ? 'Cargada' : 'Sin imagen'),
        }),
        imagenAlt: campoEnAcordeon({ type: 'text', label: 'Texto alternativo' }),
        colorFondo: campoEnAcordeon({ type: 'color', label: 'Color de fondo' }),
        tarjetas: campoListaEnAcordeones(
          'Tarjetas',
          {
            imagen: { ...campoImagen('Imagen'), ayuda: 'Un icono o logo pequeño; se ve arriba en la tarjeta.' },
            titulo: { type: 'text', label: 'Título', placeholder: 'Emprender' },
            enlace: {
              type: 'text',
              label: 'Hipervínculo',
              placeholder: '/emprender o https://…',
              ayuda: 'A dónde lleva la tarjeta al hacer clic en ella. Vacío: la tarjeta no lleva a ningún lado.',
            },
            nuevaPestana: {
              type: 'radio',
              label: 'Abrir en',
              options: [
                { label: 'La misma pestaña', value: false },
                { label: 'Pestaña nueva', value: true },
              ],
            },
          },
          {
            elemento: 'Tarjeta',
            nuevo: { imagen: '', titulo: '', enlace: '', nuevaPestana: false },
            resumen: (t) => t?.titulo || (t?.imagen ? 'Sin título' : 'Vacía'),
            ayuda: 'Montan sobre el borde inferior de la imagen. Si no caben en una fila, pasan a la siguiente.',
          }
        ),
      },
      defaultProps: {
        imagenSrc: '',
        imagenAlt: '',
        colorFondo: '',
        tarjetas: [],
      },
      // La primera versión tenía dos tarjetas fijas (`tarjeta1`, `tarjeta2`). Un bloque
      // guardado así pasa a la lista al abrirlo; las vacías se descartan.
      resolveData: ({ props }: { props: Record<string, unknown> }) => {
        if (Array.isArray(props.tarjetas) && props.tarjetas.length > 0) return { props };
        const viejas = [props.tarjeta1, props.tarjeta2].filter((t) => {
          const tarjeta = t as { imagen?: unknown; titulo?: unknown } | undefined;
          return tarjeta && (tarjeta.imagen || tarjeta.titulo);
        });
        if (viejas.length === 0) return { props };
        const { tarjeta1: _t1, tarjeta2: _t2, ...resto } = props;
        return { props: { ...resto, tarjetas: viejas } };
      },
      render: ({ puck, ...props }: BlockRender<ComponentProps<typeof ImagenDestacada>> & { puck?: { isEditing?: boolean } }) => (
        <ImagenDestacada {...props} puck={puck} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    TarjetaArticulo: {
      label: 'Tarjeta de artículo',
      fields: {
        imagenSrc: campoImagen('Imagen'),
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
        titulo: { type: 'text', label: 'Título', contentEditable: true },
        descripcion: { type: 'textarea', label: 'Descripción / Resumen', contentEditable: true },
        enlace: { type: 'text', label: 'Enlace de la tarjeta / título' },
        mostrarBoton: {
          type: 'radio',
          label: 'Mostrar botón',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        textoBoton: { type: 'text', label: 'Texto del botón' },
        enlaceBoton: { type: 'text', label: 'Enlace del botón (opcional)' },
        abrirEnNuevaPestana: {
          type: 'radio',
          label: 'Abrir enlace en nueva pestaña',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        ancho: {
          type: 'radio',
          label: 'Ancho de la tarjeta',
          options: [
            { label: 'Estándar (max-w-sm)', value: 'fijo' },
            { label: 'Ancho completo', value: 'completo' },
          ],
        },
        alineacion: {
          type: 'radio',
          label: 'Alineación horizontal',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Centro', value: 'centro' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
      },
      defaultProps: {
        imagenSrc: '',
        imagenAlt: 'Ilustración del artículo',
        titulo: 'Ingresa texto',
        descripcion: 'Ingresa descripción',
        enlace: '#',
        mostrarBoton: true,
        textoBoton: 'Ingresa texto',
        enlaceBoton: '#',
        abrirEnNuevaPestana: false,
        ancho: 'fijo',
        alineacion: 'izquierda',
      },
      render: (props: BlockRender<ComponentProps<typeof TarjetaArticulo>>) => (
        <TarjetaArticulo {...props} />
      ),
    },
    // ─── Botones y Enlaces ───
    BotonPersonalizado: {
      label: 'Botón personalizado',
      fields: {
        // Nativo a propósito: solo un `text` de Puck se edita también sobre la página. Su acordeón
        // lo pone `CamposAgrupados` (ver `GRUPOS_DE_CAMPOS`).
        texto: {
          type: 'text',
          label: 'Texto del botón',
          contentEditable: true,
          // Lo lee `CamposAgrupados` para la línea de ayuda del acordeón.
          metadata: { ayuda: 'Escribe el nombre del botón.' },
        },
        // Un alto libre en px, sin medidas fijas. Vacío = el alto de siempre (42 px). Las medidas fijas
        // de antes (`mediano`…) se enseñan convertidas a px.
        tamano: campoEnAcordeon({
          type: 'medida',
          label: 'Tamaño del botón',
          unidades: ['px'],
          placeholder: 'px',
          vacio: 'Automático',
          normalizar: tamanoDelBotonEnPx,
        }),
        ancho: campoEnAcordeon({
          type: 'radio',
          label: 'Ancho del botón',
          options: [
            { label: 'Ajustado', value: 'auto' },
            { label: 'Mediano', value: 'mediano' },
            { label: 'Grande', value: 'grande' },
            { label: 'Completo', value: 'completo' },
          ],
        }),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color de fondo',
          ayuda: 'Elige el color de fondo.',
        }),
        colorTexto: campoEnAcordeon({
          type: 'color',
          label: 'Color del texto',
          ayuda: 'Elige el color de las letras.',
        }),
        destino: campoDestinoBotonEnAcordeon(
          'Destino del botón',
          'Elige a dónde lleva el clic.'
        ),
        resaltado: campoEnAcordeon({
          type: 'interruptor',
          label: 'Resaltar botón',
          ayuda: 'Actívalo para que el botón destaque.',
        }),
        colorResaltado: campoEnAcordeon({
          type: 'color',
          label: 'Color del resaltado',
          ayuda: 'Elige el color del borde resaltado.',
        }),
      },
      defaultProps: {
        texto: 'Nuevo botón',
        tamano: '',
        ancho: 'mediano',
        colorFondo: '#ffffff',
        colorTexto: '#002237',
        destino: { tipo: 'enlace', urlEnlace: '' },
        resaltado: false,
        colorResaltado: '',
      },
      // La posición ya no es un campo del botón (sale de «Espaciado y Ancho», `caja.alineacion`) y
      // el botón suelto ya no lleva ícono. Al abrir un botón guardado, `migrarBoton` pasa la posición
      // a la caja y limpia el ícono.
      resolveData: migrarBoton,
      render: (props: BlockRender<ComponentProps<typeof BotonPersonalizado>>) => (
        <BotonPersonalizado {...props} />
      ),
    },
    SeccionBotonesIcono: {
      label: 'Sección de botones con íconos',
      fields: {
        mostrarTitulo: {
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        titulo: { type: 'text', label: 'Título de la sección (opcional)', contentEditable: true },
        alineacionTitulo: {
          type: 'radio',
          label: 'Alineación del título',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Centro', value: 'centro' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
        mostrarSubtitulo: {
          type: 'radio',
          label: 'Mostrar subtítulo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtitulo: { type: 'textarea', label: 'Descripción / Subtítulo (opcional)' },
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        colorSubtitulo: campoEnAcordeon({ type: 'color', label: 'Color del subtítulo / contenido', ayuda: 'Vacío = el color por defecto del bloque.' }),
        columnas: {
          type: 'radio',
          label: 'Columnas en escritorio',
          options: [
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
            { label: '5', value: 5 },
            { label: '6', value: 6 },
            { label: '7', value: 7 },
            { label: '8', value: 8 },
          ],
        },
        items: {
          type: 'slot',
          allow: ['BotonPersonalizado'],
        },
      },
      defaultProps: {
        mostrarTitulo: true,
        titulo: '',
        alineacionTitulo: 'centro',
        mostrarSubtitulo: true,
        subtitulo: '',
        colorTitulo: '',
        colorSubtitulo: '',
        columnas: 3,
        items: [],
      },
      render: (props: BlockRender<ComponentProps<typeof SeccionBotonesIcono>>) => (
        <SeccionBotonesIcono {...props} />
      ),
    },
    // Bloque de texto enriquecido — usa EditorJS internamente
    RichText: RichTextBlock,
    ProgramasSobresalientes: {
      label: 'Programas Sobresalientes',
      fields: {
        mostrarTitulo: {
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        titulo: {
          type: 'text',
          label: 'Título',
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
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        mostrarDescripcion: {
          type: 'radio',
          label: 'Mostrar descripción',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        descripcion: {
          type: 'textarea',
          label: 'Descripción',
          contentEditable: true,
        },
        alineacionDescripcion: {
          type: 'radio',
          label: 'Alineación de la descripción',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Centro', value: 'centro' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
        modoSeleccionDepartamento: {
          type: 'radio',
          label: 'Modo de selección de departamento',
          options: [
            { label: 'Por lista', value: 'lista' },
            { label: 'Por mapa', value: 'mapa' },
          ],
        },
        colorDescripcion: campoEnAcordeon({ type: 'color', label: 'Color de la descripción', ayuda: 'Vacío = el color por defecto del bloque.' }),
      },
      defaultProps: {
        modoSeleccionDepartamento: 'mapa',
        mostrarTitulo: true,
        titulo: 'Programas + sobresalientes SENA',
        alineacionTitulo: 'centro',
        colorTitulo: '',
        mostrarDescripcion: true,
        descripcion: 'Consulte los programas de formación con mayor tasa de vinculación laboral por departamento.',
        alineacionDescripcion: 'centro',
        colorDescripcion: '',
      },
      render: (
        props: BlockRender<{
          modoSeleccionDepartamento?: 'lista' | 'mapa';
          mostrarTitulo?: boolean;
          titulo?: string;
          alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
          colorTitulo?: string;
          mostrarDescripcion?: boolean;
          descripcion?: string;
          alineacionDescripcion?: 'izquierda' | 'centro' | 'derecha';
          colorDescripcion?: string;
        }>
      ) => (
        <ProgramasSobresalientesView
          modoSeleccionDepartamento={props.modoSeleccionDepartamento ?? 'mapa'}
          mostrarTitulo={props.mostrarTitulo}
          titulo={props.titulo}
          alineacionTitulo={props.alineacionTitulo}
          colorTitulo={props.colorTitulo}
          mostrarDescripcion={props.mostrarDescripcion}
          descripcion={props.descripcion}
          alineacionDescripcion={props.alineacionDescripcion}
          colorDescripcion={props.colorDescripcion}
        />
      ),
    },
    /**
     * El buscador de ocupaciones completo: el banner de búsqueda con sus resultados y la
     * ficha de cada ocupación, que son parte de la página (la consulta va en la URL,
     * `?buscar=…&ocupacion=…`). Al buscar lleva a la página de resultados que se elige en
     * «Menú y pie»; si esa es esta misma página, los resultados salen aquí debajo.
     */
    BuscadorOcupaciones: {
      label: 'Buscador de Ocupaciones',
      fields: {
        ayuda: {
          type: 'textarea',
          label: 'Texto de ayuda (debajo del buscador; vacío no se muestra)',
        },
        activo: campoActivoDelBuscador(),
      },
      defaultProps: {
        ayuda: 'Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.',
        activo: true,
      },
      render: ({
        puck,
        ...props
      }: BlockRender<{ ayuda?: string; activo?: boolean; puck?: { isEditing?: boolean } }>) => (
        <BuscadorOcupacionesView
          ayuda={props.ayuda ?? ''}
          activo={props.activo !== false}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    /**
     * Solo los resultados del buscador de ocupaciones: la lista (`?buscar=…`) y la ficha de
     * cada ocupación (`?buscar=…&ocupacion=…`), sin el banner de búsqueda. Es lo que lleva la
     * página de resultados que se elige en «Menú y pie», para que los buscadores (el de la
     * portada, el de CNO) estén en una página y la lista en otra. Lleva también el interruptor
     * de todo el buscador.
     */
    ResultadosOcupaciones: {
      label: 'Resultados de ocupaciones',
      fields: {
        activo: campoActivoDelBuscador(),
      },
      defaultProps: { activo: true },
      render: ({ puck, ...props }: BlockRender<{ activo?: boolean; puck?: { isEditing?: boolean } }>) => (
        <PaginaDeResultadosOcupaciones
          activo={props.activo !== false}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
    /**
     * El panel de alertas de inversión: filtros, gráfico por sector y listado de
     * proyectos. Es lo que sirve la página `alertas-inversion`, que hasta la migración
     * 046 era una carpeta propia en `app/(public)/`.
     */
    AlertasInversion: {
      label: 'Alertas de Inversión',
      fields: {
        titulo: {
          type: 'text',
          label: 'Título',
          contentEditable: true,
        },
        descripcion: {
          type: 'textarea',
          label: 'Descripción',
        },
      },
      defaultProps: {
        titulo: 'Alertas de inversión',
        descripcion:
          'Proyectos de inversión, nuevos o de expansión, anunciados en Colombia — agrupados por sector económico.',
      },
      render: (props: BlockRender<{ titulo?: string; descripcion?: string }>) => (
        <AlertasInversionView titulo={props.titulo ?? ''} descripcion={props.descripcion ?? ''} />
      ),
    },
    TendenciaOcupacional: {
      label: 'Tendencia Ocupacional',
      fields: {
        tipoTendencia: {
          type: 'select',
          label: 'Cuadrante / Recurso de Tendencia',
          options: [
            {
              label: 'Más solicitadas por empresarios / Menos registradas por buscadores (+ / -)',
              value: 'mas-menos',
            },
            {
              label: 'Más solicitadas por empresarios / Más registradas por buscadores (+ / +)',
              value: 'mas-mas',
            },
            {
              label: 'Menos solicitadas por empresarios / Menos registradas por buscadores (- / -)',
              value: 'menos-menos',
            },
            {
              label: 'Menos solicitadas por empresarios / Más registradas por buscadores (- / +)',
              value: 'menos-mas',
            },
          ],
        },
        modoSeleccionDepartamento: {
          type: 'radio',
          label: 'Modo de selección de departamento',
          options: [
            { label: 'Por lista', value: 'lista' },
            { label: 'Por mapa', value: 'mapa' },
          ],
        },
        mostrarDefiniciones: {
          type: 'radio',
          label: 'Mostrar caja de definiciones de niveles',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        mostrarTotales: {
          type: 'radio',
          label: 'Mostrar fila de totales (inscritos y vacantes)',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        mostrarTitulo: {
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        titulo: {
          type: 'text',
          label: 'Título',
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
        colorTitulo: campoEnAcordeon({ type: 'color', label: 'Color del título', ayuda: 'Vacío = el color por defecto del bloque.' }),
        mostrarSubtitulo: {
          type: 'radio',
          label: 'Mostrar subtítulo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtitulo: {
          type: 'text',
          label: 'Subtítulo (opcional)',
        },
        alineacionSubtitulo: {
          type: 'radio',
          label: 'Alineación del subtítulo',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Centro', value: 'centro' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
        colorSubtitulo: campoEnAcordeon({ type: 'color', label: 'Color del subtítulo', ayuda: 'Vacío = el color por defecto del bloque.' }),
        mostrarDescripcion: {
          type: 'radio',
          label: 'Mostrar descripción',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        descripcion: {
          type: 'textarea',
          label: 'Descripción',
        },
        alineacionDescripcion: {
          type: 'radio',
          label: 'Alineación de la descripción',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Centro', value: 'centro' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
        colorDescripcion: campoEnAcordeon({ type: 'color', label: 'Color de la descripción', ayuda: 'Vacío = el color por defecto del bloque.' }),
      },
      defaultProps: {
        tipoTendencia: 'mas-menos',
        modoSeleccionDepartamento: 'lista',
        mostrarDefiniciones: true,
        mostrarTotales: false,
        mostrarTitulo: true,
        titulo: TITULOS_TENDENCIA['mas-menos'],
        alineacionTitulo: 'centro',
        colorTitulo: '',
        mostrarSubtitulo: false,
        subtitulo: '',
        alineacionSubtitulo: 'centro',
        colorSubtitulo: '',
        mostrarDescripcion: false,
        descripcion: '',
        alineacionDescripcion: 'centro',
        colorDescripcion: '',
      },
      resolveData: async (data, params) => {
        const tipo = (data.props.tipoTendencia as TipoTendenciaOcupacional) || 'mas-menos';
        const tituloSugerido = TITULOS_TENDENCIA[tipo] || TITULOS_TENDENCIA['mas-menos'];

        const propsActualizadas = { ...data.props };
        let huboCambios = false;

        if (propsActualizadas.mostrarTotales === undefined) {
          propsActualizadas.mostrarTotales = false;
          huboCambios = true;
        }

        if (!propsActualizadas.modoSeleccionDepartamento) {
          propsActualizadas.modoSeleccionDepartamento = 'lista';
          huboCambios = true;
        }

        if (propsActualizadas.mostrarBannerDepartamento === undefined) {
          propsActualizadas.mostrarBannerDepartamento = false;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarDefiniciones === undefined) {
          propsActualizadas.mostrarDefiniciones = true;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarTitulo === undefined) {
          propsActualizadas.mostrarTitulo = true;
          huboCambios = true;
        }

        if (params.changed.tipoTendencia || !propsActualizadas.titulo || !propsActualizadas.titulo.trim()) {
          propsActualizadas.titulo = tituloSugerido;
          huboCambios = true;
        }

        if (huboCambios) {
          return {
            ...data,
            props: propsActualizadas,
          };
        }

        return data;
      },
      render: (
        props: BlockRender<{
          tipoTendencia?: TipoTendenciaOcupacional;
          mostrarDefiniciones?: boolean;
          mostrarTotales?: boolean;
          modoSeleccionDepartamento?: 'lista' | 'mapa';
          mostrarBannerDepartamento?: boolean;
          tituloBanner?: string;
          subtituloBanner?: string;
          descripcionBanner?: string;
          colorBanner?: string;
          mostrarTitulo?: boolean;
          titulo?: string;
          alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
          colorTitulo?: string;
          mostrarSubtitulo?: boolean;
          subtitulo?: string;
          alineacionSubtitulo?: 'izquierda' | 'centro' | 'derecha';
          colorSubtitulo?: string;
          mostrarDescripcion?: boolean;
          descripcion?: string;
          alineacionDescripcion?: 'izquierda' | 'centro' | 'derecha';
          colorDescripcion?: string;
        }>
      ) => (
        <TendenciaOcupacionalView
          tipoTendencia={props.tipoTendencia}
          mostrarDefiniciones={props.mostrarDefiniciones ?? true}
          mostrarTotales={props.mostrarTotales ?? false}
          modoSeleccionDepartamento={props.modoSeleccionDepartamento ?? 'lista'}
          mostrarBannerDepartamento={props.mostrarBannerDepartamento ?? false}
          tituloBanner={props.tituloBanner}
          subtituloBanner={props.subtituloBanner}
          descripcionBanner={props.descripcionBanner}
          colorBanner={props.colorBanner}
          mostrarTitulo={props.mostrarTitulo}
          titulo={props.titulo}
          alineacionTitulo={props.alineacionTitulo}
          colorTitulo={props.colorTitulo}
          mostrarSubtitulo={props.mostrarSubtitulo}
          subtitulo={props.subtitulo}
          alineacionSubtitulo={props.alineacionSubtitulo}
          colorSubtitulo={props.colorSubtitulo}
          mostrarDescripcion={props.mostrarDescripcion}
          descripcion={props.descripcion}
          alineacionDescripcion={props.alineacionDescripcion}
          colorDescripcion={props.colorDescripcion}
        />
      ),
    },
    MapaSitio: {
      label: 'Mapa del Sitio',
      defaultProps: VALORES_MAPA_SITIO_POR_DEFECTO,
      fields: {
        mostrarTitulo: campoEnAcordeon({
          type: 'radio',
          label: 'Mostrar título',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        }),
        titulo: campoEnAcordeon({
          type: 'text',
          label: 'Título',
          placeholder: 'Mapa del sitio',
        }),
        mostrarDescripcion: campoEnAcordeon({
          type: 'radio',
          label: 'Mostrar descripción',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        }),
        descripcion: campoEnAcordeon({
          type: 'textarea',
          label: 'Descripción (Opcional)',
        }),
      },
      resolveData: async (data) => {
        try {
          const paginas = await obtenerIndiceBusqueda();
          return {
            props: {
              ...data.props,
              paginas,
            }
          };
        } catch {
          return { props: data.props };
        }
      },
      render: ({ titulo, mostrarTitulo, mostrarDescripcion, descripcion, paginas }) => (
        <MapaSitio
          titulo={titulo}
          mostrarTitulo={mostrarTitulo}
          mostrarDescripcion={mostrarDescripcion}
          descripcion={descripcion}
          paginas={paginas}
        />
      ),
    },
    BuscadorSitioWeb: {
      label: 'Buscador del Sitio Web',
      fields: {
        paginaResultados: campoEnAcordeon(
          {
            type: 'text',
            label: 'Página de resultados',
            placeholder: '/buscador-general',
            ayuda: 'Ruta relativa hacia la página creada con «Nueva página» donde se mostrarán los resultados (ej: /buscador-general, /consulta).',
          },
          { abierto: true, resumen: (v) => v || '/buscador-general' }
        ),
        placeholder: campoEnAcordeon({
          type: 'text',
          label: 'Texto del campo (placeholder)',
          placeholder: 'Buscar en el sitio web...',
          ayuda: 'Texto indicativo que se muestra dentro del campo mientras está vacío.',
        }),
        textoAyuda: campoEnAcordeon({
          type: 'textarea',
          label: 'Texto de instrucción o ayuda',
          placeholder: 'Escribe tu búsqueda y presiona Enter para buscar',
          ayuda: 'Mensaje visible ubicado debajo del campo de búsqueda.',
        }),
        anchoMaximo: campoEnAcordeon({
          type: 'select',
          label: 'Ancho máximo',
          options: [
            { label: 'Restringido (576 px)', value: 'max-w-xl' },
            { label: 'Medio (768 px)', value: 'max-w-3xl' },
            { label: 'Ancho completo (100%)', value: 'w-full' },
          ],
          ayuda: 'Anchura máxima que ocupará la barra de búsqueda en la pantalla.',
        }),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color de fondo del buscador',
          ayuda: 'Color de fondo de la cápsula de búsqueda.',
        }),
        colorBorde: campoEnAcordeon({
          type: 'color',
          label: 'Color de borde en reposo',
          ayuda: 'Color del contorno del buscador en reposo.',
        }),
        colorBordeHover: campoEnAcordeon({
          type: 'color',
          label: 'Color de borde activo (hover/foco)',
          ayuda: 'Color del borde y anillo activo al pasar el cursor o hacer clic.',
        }),
        colorTexto: campoEnAcordeon({
          type: 'color',
          label: 'Color de la letra (texto escrito)',
          ayuda: 'Color de las letras escritas por el usuario dentro del campo.',
        }),
        colorPlaceholder: campoEnAcordeon({
          type: 'color',
          label: 'Color del texto sugerido (placeholder)',
          ayuda: 'Color del texto informativo mientras el campo está vacío.',
        }),
        colorBoton: campoEnAcordeon({
          type: 'color',
          label: 'Color de fondo del botón de buscar',
          ayuda: 'Color de fondo del botón circular con la lupa.',
        }),
        colorIconoBoton: campoEnAcordeon({
          type: 'color',
          label: 'Color del icono de la lupa',
          ayuda: 'Color de la lupa dentro del botón de búsqueda.',
        }),
        colorBotonLimpiar: campoEnAcordeon({
          type: 'color',
          label: 'Color del botón borrar ("X")',
          ayuda: 'Color del botón para borrar el texto escrito.',
        }),
        colorTextoAyuda: campoEnAcordeon({
          type: 'color',
          label: 'Color del texto de instrucción o ayuda',
          ayuda: 'Color del mensaje de ayuda ubicado debajo del campo.',
        }),
      },
      defaultProps: {
        paginaResultados: '/buscador-general',
        placeholder: 'Buscar en el sitio web...',
        textoAyuda: 'Escribe tu búsqueda y presiona Enter para buscar',
        anchoMaximo: 'max-w-3xl',
      },
      render: ({
        puck,
        ...props
      }: BlockRender<BuscadorSitioBloqueProps & { puck?: { isEditing?: boolean } }>) => (
        <BuscadorSitioBloque {...props} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    ResultadosBusquedaSitio: {
      label: 'Resultados de Búsqueda del Sitio',
      fields: {
        tituloResultados: campoEnAcordeon(
          {
            type: 'text',
            label: 'Título de la sección',
            placeholder: 'Resultados de Búsqueda',
            ayuda: 'Encabezado principal visible sobre el listado de coincidencias encontradas.',
          },
          { abierto: true, resumen: (v) => v || 'Resultados de Búsqueda' }
        ),
        resultadosPorPagina: campoEnAcordeon(
          {
            type: 'number',
            label: 'Resultados por página',
            min: 1,
            max: 50,
            placeholder: '10',
            sufijo: 'resultados',
            ayuda: 'Cantidad máxima de tarjetas de resultados visibles antes de activar la paginación.',
          },
          { abierto: true }
        ),
        mostrarBarraRefinamiento: campoEnAcordeon(
          {
            type: 'radio',
            label: 'Mostrar barra de búsqueda',
            options: [
              { label: 'Sí', value: true },
              { label: 'No', value: false },
            ],
            ayuda: 'Permite realizar una nueva búsqueda o modificar los términos directamente desde esta página de resultados.',
          },
          { resumen: (v) => (v === false ? 'No' : 'Sí') }
        ),
        colorBarraFondo: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color de fondo',
          ayuda: 'Color de fondo de la cápsula de búsqueda superior.',
        }),
        colorBarraBorde: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color de borde en reposo',
          ayuda: 'Color de borde de la barra superior en reposo.',
        }),
        colorBarraBordeHover: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color de borde activo',
          ayuda: 'Color de borde y anillo al enfocar o pasar el cursor.',
        }),
        colorBarraTexto: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color de letra',
          ayuda: 'Color del texto escrito en la barra superior.',
        }),
        colorBarraPlaceholder: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color del placeholder',
          ayuda: 'Color del texto sugerido en la barra superior.',
        }),
        colorBarraBoton: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color del botón de buscar',
          ayuda: 'Color de fondo del botón circular con la lupa.',
        }),
        colorBarraIconoBoton: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color del icono de la lupa',
          ayuda: 'Color de la lupa en el botón superior.',
        }),
        colorBarraBotonLimpiar: campoEnAcordeon({
          type: 'color',
          label: 'Barra superior: Color del botón borrar ("X")',
          ayuda: 'Color del botón para borrar el texto en la barra superior.',
        }),
        colorTitulo: campoEnAcordeon({
          type: 'color',
          label: 'Resultados: Color del título',
          ayuda: 'Color del encabezado principal («Resultados de Búsqueda»).',
        }),
        colorConteo: campoEnAcordeon({
          type: 'color',
          label: 'Resultados: Color del conteo de resultados',
          ayuda: 'Color del texto con el número de resultados encontrados.',
        }),
        colorBordeTabla: campoEnAcordeon({
          type: 'color',
          label: 'Tabla: Color de borde y separadores',
          ayuda: 'Color del marco exterior y líneas de división entre filas.',
        }),
        colorCabeceraTabla: campoEnAcordeon({
          type: 'color',
          label: 'Tabla: Color de fondo de cabecera',
          ayuda: 'Color de fondo de la fila de títulos de columna.',
        }),
        colorTextoCabeceraTabla: campoEnAcordeon({
          type: 'color',
          label: 'Tabla: Color de texto de cabecera',
          ayuda: 'Color de los títulos «Página / Sección» y «Contenido coincidente».',
        }),
        colorFilaHover: campoEnAcordeon({
          type: 'color',
          label: 'Tabla: Color de fila al pasar el cursor',
          ayuda: 'Color de fondo de cada fila al pasar el ratón.',
        }),
        colorBadgeFondo: campoEnAcordeon({
          type: 'color',
          label: 'Badge: Color de fondo de etiqueta',
          ayuda: 'Color de fondo de la pastilla («Página» o «Sección»).',
        }),
        colorBadgeTexto: campoEnAcordeon({
          type: 'color',
          label: 'Badge: Color de texto de etiqueta',
          ayuda: 'Color de la letra dentro de la pastilla.',
        }),
        colorTituloResultado: campoEnAcordeon({
          type: 'color',
          label: 'Resultados: Color del título de coincidencia',
          ayuda: 'Color del nombre de la página o sección en la lista.',
        }),
        colorRutaResultado: campoEnAcordeon({
          type: 'color',
          label: 'Resultados: Color de la ruta o enlace',
          ayuda: 'Color de la URL relativa visible debajo del título.',
        }),
        colorTextoResultado: campoEnAcordeon({
          type: 'color',
          label: 'Resultados: Color del fragmento de texto',
          ayuda: 'Color del extracto o párrafo donde se encontró la coincidencia.',
        }),
        colorResaltado: campoEnAcordeon({
          type: 'color',
          label: 'Resaltado: Color de fondo de la coincidencia',
          ayuda: 'Color de fondo que resalta las palabras coincidentes.',
        }),
        colorTextoResaltado: campoEnAcordeon({
          type: 'color',
          label: 'Resaltado: Color de texto de la coincidencia',
          ayuda: 'Color de las letras dentro del fondo resaltado.',
        }),
      },
      defaultProps: {
        tituloResultados: 'Resultados de Búsqueda',
        resultadosPorPagina: 10,
        mostrarBarraRefinamiento: true,
      },
      // Sin `resolveData`: el índice de todo el sitio no se guarda dentro de esta página (se
      // quedaría viejo y seguiría mostrando páginas retiradas). El bloque lo pide al servicio
      // que se le inyecta aquí, que lo guarda cinco minutos.
      render: ({
        puck,
        ...props
      }: BlockRender<ResultadosBusquedaSitioProps & { puck?: { isEditing?: boolean } }>) => (
        <ResultadosBusquedaSitio
          {...props}
          cargarIndice={obtenerIndiceBusqueda}
          mostrarBarraRefinamiento={props.mostrarBarraRefinamiento !== false}
          esEdicion={Boolean(puck?.isEditing)}
        />
      ),
    },
  },
};

/**
 * El catálogo que usa la app: el de arriba, con los controles de espaciado.
 *
 * Cada bloque gana un grupo «Espaciado y ancho» (relleno, separación con lo de
 * arriba y lo de abajo, ancho máximo y posición) sin tener que declararlo. El
 * envoltorio solo se pinta cuando hay algún valor puesto, así que las páginas ya
 * publicadas producen exactamente el mismo HTML que antes hasta que alguien
 * toque esos campos a propósito.
 *
 * La barra de la intranet queda fuera (`BLOQUES_SIN_CAJA`) porque es
 * `position: sticky`: encerrarla en un div que mide lo mismo que ella la
 * dejaría sin recorrido donde pegarse al hacer scroll.
 */
export const puckConfig: Config = {
  ...puckConfigBase,
  components: conCajaEnTodos(puckConfigBase.components, {
    excepto: BLOQUES_SIN_CAJA,
    sinFondo: ['ImagenDestacada', 'DatoOloSemana'],
    // Su «Color de fondo» va de borde a borde: el ancho elegido estrecha la imagen.
    anchoDentro: ['ImagenDestacada'],
  }),
};

/**
 * Qué bloques se ofrecen al editar cada slug.
 *
 * El catálogo es uno solo para todo el sitio, así que sin esto quien edita la
 * portada ve en el selector la cabecera, el pie y los bloques de la intranet,
 * ninguno de los cuales pinta nada ahí. El nombre del bloque es la única pista
 * que tiene, y una lista larga de bloques que no vienen a cuento hace que el
 * editor dé miedo tocarlo.
 *
 * Un slug que no esté aquí recibe el catálogo completo, que es lo razonable
 * cuando no se sabe qué va a contener.
 *
 * `Header` y `Footer` NO están en `inicio`: los pinta `app/(pages)/layout.tsx` a
 * partir de la página `plantilla`, y ofrecerlos en una sección dejaría volver a
 * tener una cabecera distinta por página, que es justo lo que se acaba de quitar.
 */
/**
 * La página que guarda la cabecera y el pie comunes.
 *
 * Espejo de `SLUG_PLANTILLA` en `features/editor/navegation/menu-y-pie.ts`. No se importa de
 * allí para no atar el catálogo de bloques a una feature: aquí solo hace falta el
 * literal, y si algún día cambia, cambia en los dos sitios.
 */
const SLUG_DE_PLANTILLA = 'menu-y-pie';



/**
 * Lo que el lienzo enseña alrededor de lo que se está editando.
 *
 * Son datos YA PUBLICADOS que se pintan de contexto: lo mismo que ve quien visita
 * el sitio. Los resuelve el Server Component del editor y llegan hasta aquí por
 * props — ver `app/edit/[slug]/page.tsx`.
 */
export interface ContextoDeEdicion {
  /** Cabecera y pie publicados. Se usa al editar una página normal. */
  plantilla?: {
    cabecera?: Omit<ComponentProps<typeof Header>, 'block'> | null;
    /** Props del pie publicado. `null` si la plantilla no lleva pie. */
    pie?: Omit<ComponentProps<typeof Footer>, 'block'> | boolean | null;
  } | null;
  /** Página publicada desde la que se abrió «Menú y pie». */
  seccion?: { slug: string; contenido: unknown } | null;
}

/** El contenido legado se guardaba como array plano; Puck espera `{ content, root }`. */
function datosDePuck(contenido: unknown): Data {
  if (Array.isArray(contenido)) return { content: contenido, root: {} } as Data;
  const objeto = (contenido ?? {}) as { content?: unknown; root?: unknown };
  return { ...objeto, content: objeto.content ?? [], root: objeto.root ?? {} } as Data;
}

/**
 * Envuelve un trozo del lienzo para que se vea pero no se pueda tocar.
 *
 * `inert` es lo que de verdad lo apaga —quita clic, foco y lectura por lectores de
 * pantalla de una vez—; la clase solo lo atenúa para que se note a simple vista
 * cuál es la parte que esta pantalla no edita.
 */
function Inerte({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="olo-chrome-inerte-marco">
      <span className="olo-chrome-inerte-etiqueta">{etiqueta}</span>
      <div className="olo-chrome-inerte" inert>
        {children}
      </div>
    </div>
  );
}

function PreviewIntercalado({
  seccion,
  config,
  etiqueta,
}: {
  seccion: { slug: string; contenido: unknown };
  config: Config;
  etiqueta: string;
}) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const detenerNativo = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const eventos = [
      'mouseover',
      'mouseout',
      'mouseenter',
      'mouseleave',
      'pointerover',
      'pointerout',
      'pointerenter',
      'pointerleave',
      'mousemove',
      'pointermove',
      'mousedown',
      'mouseup',
      'click',
      'contextmenu',
    ];

    for (const ev of eventos) {
      el.addEventListener(ev, detenerNativo, true);
      el.addEventListener(ev, detenerNativo, false);
    }

    return () => {
      for (const ev of eventos) {
        el.removeEventListener(ev, detenerNativo, true);
        el.removeEventListener(ev, detenerNativo, false);
      }
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="olo-preview-intercalado-no-hover"
      style={{
        position: 'relative',
        width: '100%',
        pointerEvents: 'auto',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Inerte etiqueta={etiqueta}>
        <Render config={config} data={datosDePuck(seccion.contenido)} />
      </Inerte>
    </div>
  );
}

export function configDeEdicion(slug: string, contexto: ContextoDeEdicion = {}): Config {
  // Las páginas creadas a mano reciben todo el catálogo de bloques,
  // pero nunca los bloques de 'Plantilla' (Header/Footer), que solo se ofrecen en 'menu-y-pie'.
  const permitidos = slug === SLUG_DE_PLANTILLA
    ? ['Header', 'Footer']
    : Object.keys(puckConfig.components).filter((c) => c !== 'Header' && c !== 'Footer');

  const recortada: Config = {
    ...puckConfig,
    components: Object.fromEntries(
      Object.entries(puckConfig.components).filter(([nombre]) => permitidos.includes(nombre))
    ) as Config['components'],
    categories: Object.fromEntries(
      // El tipo de Puck para `categories` es `Record<CategoryName, Category<...>> &
      // { other?: Category<...> }`: esa intersección hace que `Object.entries` deje de
      // inferir el tipo del valor y devuelva `unknown` (tsc --noEmit fallaba en el
      // spread y en `.components` de abajo). Se anota la forma real a mano.
      (Object.entries(puckConfig.categories ?? {}) as [
        string,
        { components?: string[]; title?: string; visible?: boolean; defaultExpanded?: boolean },
      ][])
        .map(([nombre, categoria]) => [
          nombre,
          {
            ...categoria,
            components: (categoria.components ?? []).filter((c) => permitidos.includes(c)),
          },
        ] as const)
        // Una categoría que se queda sin bloques no debe salir como grupo vacío.
        .filter(([, categoria]) => categoria.components.length > 0)
    ) as Config['categories'],
    // Sin esto Puck pinta un campo `title` que no cambia nada (el título sale de la base de datos):
    // el panel de la raíz solo dice qué página se edita y que se está en modo edición. `label` es
    // lo que Puck escribe donde antes decía «Page» (la miga de pan «Page › Bloque», el título del panel).
    root: {
      ...puckConfig.root,
      label: slug === SLUG_DE_PLANTILLA ? 'Menú y pie del sitio' : rutaPublicaDeSlug(slug),
      fields: {
        modoEdicion: campoPaginaEnEdicion(
          slug === SLUG_DE_PLANTILLA
            ? { nombre: 'Menú y pie del sitio', slug }
            : { ruta: rutaPublicaDeSlug(slug), slug }
        ),
      },
    } as Config['root'],
  };

  if (slug === SLUG_DE_PLANTILLA) {
    const seccion = contexto.seccion;
    if (!seccion) return recortada;

    const cabecera = recortada.components.Header;
    if (!cabecera) return recortada;

    return {
      ...recortada,
      components: {
        ...recortada.components,
        Header: {
          ...cabecera,
          render: (props: Parameters<typeof cabecera.render>[0]) => (
            <>
              {cabecera.render(props)}
              <PreviewIntercalado
                seccion={seccion}
                config={puckConfig}
                etiqueta={`Página /${seccion.slug} · no editable aquí`}
              />
            </>
          ),
        },
      },
    };
  }

  const plantilla = contexto.plantilla;
  if (!plantilla?.cabecera && !plantilla?.pie) return recortada;

  return {
    ...recortada,
    root: {
      ...recortada.root,
      render: ({ children }: { children?: ReactNode }) => (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
          {plantilla.cabecera && (
            <Inerte etiqueta="Cabecera · se edita en «Menú y pie»">
              <Header block={{ id: 'contexto-header' }} {...plantilla.cabecera} />
            </Inerte>
          )}
          <div style={{ flexGrow: 1 }}>
            {children}
          </div>
          {plantilla.pie && (
            <Inerte etiqueta="Pie · se edita en «Menú y pie»">
              <Footer
                block={{ id: 'contexto-footer' }}
                {...(typeof plantilla.pie === 'object' ? plantilla.pie : {})}
              />
            </Inerte>
          )}
        </div>
      ),
    } as Config['root'],
  };
}
