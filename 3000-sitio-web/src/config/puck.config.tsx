'use client';

import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import {
  primitiveComponents,
  crearGridConfig,
  conCaja,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
  campoColor,
  campoEnAcordeon,
  campoGrupoEnUnAcordeon,
  campoListaEnAcordeones,
  campoObjetoEnAcordeon,
  type CampoDeAcordeon,
  TextoRico,
  ImagenDestacada,
  TarjetaArticulo,
  BotonPersonalizado,
  SeccionBotonesIcono,
  campoIcono,
  campoDestinoBoton,
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
import { crearCamposDelPie, resolverGruposDelPie } from '@/features/paginas/menu-y-pie/campos-del-pie';
import { resolverGruposDeProps } from '@/features/paginas/menu-y-pie/grupos-de-props';
import { ALINEACIONES_FRANJA, SEPARACIONES_FRANJA } from '@/shared/lib/blocks/disposicion-de-franja';
import { Footer } from '@/shared/lib/blocks/footer';
import { MapaSitio, VALORES_MAPA_SITIO_POR_DEFECTO } from '@/shared/lib/blocks/mapa-sitio';
import { obtenerIndiceBusqueda } from '@/features/paginas/publicacion/services/publicacion.service';

import { CABECERA_POR_DEFECTO } from '@/features/paginas/client';
import { HeroBuscadorOcupaciones, BuscadorOcupacionesView } from '@/features/sitio-web/buscador-ocupaciones';
import { AlertasInversionView } from '@/features/sitio-web/alertas-inversion';
import { ProgramasSobresalientesView } from '@/features/sitio-web/programas-sobresalientes';
import {
  TendenciaOcupacionalView,
  TITULOS_TENDENCIA,
  type TipoTendenciaOcupacional,
} from '@/features/sitio-web/tendencia-ocupacional';
import {
  FuentesFuturasEmpleoView,
  CampoDescripcionConVariables,
} from '@/features/sitio-web/fuentes-futuras-empleo';
import { EditorjsWrapper } from '@/features/paginas/edicion/components/editorjs-wrapper';
import { ImageUploaderField } from '@/features/paginas/edicion/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/paginas/edicion/components/archivo-uploader-field';
import { Render, type Config, type Data } from '@puckeditor/core';
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
 * Barra de formato de un titular: negrita, cursiva, subrayado, enlaces y saltos de línea,
 * sin encabezados, listas ni citas. El texto ya va dentro de un `<h2>`, y un encabezado
 * dentro de otro lo parte en dos.
 */
const OPCIONES_TEXTO_EN_LINEA = {
  heading: false,
  blockquote: false,
  bulletList: false,
  orderedList: false,
  codeBlock: false,
  horizontalRule: false,
} as const;

/**
 * Barra de formato del párrafo del carrusel: encabezados H1–H4 para subir o
 * bajar el tamaño, viñetas, negrita, cursiva, subrayado y alineación. Sin citas, código,
 * tachado, listas numeradas ni enlaces.
 */
const OPCIONES_TEXTO_DEL_CARRUSEL = {
  heading: { levels: [1, 2, 3, 4] as (1 | 2 | 3 | 4)[] },
  blockquote: false as const,
  code: false as const,
  codeBlock: false as const,
  horizontalRule: false as const,
  strike: false as const,
  orderedList: false as const,
  link: false as const,
};

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
        <EditorjsWrapper data={value} onChange={onChange} />
      ),
    },
  },
  defaultProps: {
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
  render: ({ content }: BlockRender<{ content?: OutputData }>) => (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-6 rich-text">
      <EditorjsWrapper data={content} readOnly />
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
        'AlertasInversion',
        'TendenciaOcupacional',
        'FuentesFuturasEmpleo',
        'MapaSitio',
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
    // Los pinta `app/(paginas)/layout.tsx` leyendo esa página, no el contenido de
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
        navLinks: {
          type: 'array',
          label: 'Menú de navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'URL' },
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
              label: 'Submenú desplegable (opcional)',
              arrayFields: {
                label: { type: 'text', label: 'Texto del enlace' },
                href: { type: 'text', label: 'URL' },
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
        botonIntranet: { texto: '', colorFondo: '', colorTexto: '' },
      },
      // El texto del botón vivía en `intranetText`; ahora va en `botonIntranet.texto`.
      // Al abrir una cabecera de antes se pasa una sola vez y `intranetText` queda
      // vacío: si no, borrar el texto del campo lo volvería a rellenar con el viejo.
      // Además, la tarjeta de la franja GOV.CO: grupo ⇄ props sueltas.
      resolveData: ({ props }: { props: Record<string, any> }) => {
        const boton = props.botonIntranet ?? {};
        const migrar = !boton.texto && typeof props.intranetText === 'string' && props.intranetText;
        const conBoton = migrar
          ? { ...props, intranetText: '', botonIntranet: { ...boton, texto: props.intranetText } }
          : props;
        return { props: resolverGruposDeProps(conBoton, { grupoFranjaGov: Object.keys(CAMPOS_FRANJA_SUPERIOR) }) };
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
     */
    Hero: {
      label: 'Buscador de Ocupaciones (Banner)',
      fields: {
        tituloSeccion: {
          type: 'richtext' as const,
          label: 'Titular',
          contentEditable: true,
          options: OPCIONES_TEXTO_EN_LINEA,
        },
        descripcion: {
          type: 'richtext' as const,
          label: 'Descripción',
          contentEditable: true,
          options: { heading: false },
        },
        titulo: {
          type: 'richtext' as const,
          label: 'Texto del recuadro',
          contentEditable: true,
          options: OPCIONES_TEXTO_EN_LINEA,
        },
        searchPlaceholder: campoEnAcordeon({
          type: 'text',
          label: 'Texto de ejemplo del buscador',
          placeholder: 'Buscar ocupación, código o denominación',
        }),
        imagenFondo: campoEnAcordeon(
          {
            ...campoImagen('Imagen de fondo'),
            ayuda: 'Cubre toda la sección y se recorta para llenarla. Es decorativa: no lleva texto alternativo. Sin imagen, el fondo queda blanco.',
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
          ayuda: '0 %: la imagen se ve tal cual. 100 %: no se ve y queda el fondo blanco. Vacío: 0 %.',
        }),
        colorFondo: campoEnAcordeon({
          type: 'color',
          label: 'Color del recuadro',
          ayuda: 'El del recuadro del buscador y su botón. Vacío: el azul del diseño.',
        }),
      },
      defaultProps: {
        id: 'hero-1',
        tituloSeccion: '<p>¿Sabes qué es una<br><strong>ocupación?</strong></p>',
        descripcion:
          '<p>Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.</p>',
        titulo:
          '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imagenFondo: '',
        transparenciaFondo: '',
        colorFondo: '',
      },
      // Una portada guardada antes del rediseño no trae titular ni descripción: se
      // completan al abrirla en el editor, para que se vean y se puedan corregir.
      resolveData: ({ props }: { props: Record<string, any> }) => {
        if (props.tituloSeccion !== undefined && props.descripcion !== undefined) return { props };
        return {
          props: {
            ...props,
            tituloSeccion: props.tituloSeccion ?? '<p>¿Sabes qué es una<br><strong>ocupación?</strong></p>',
            descripcion: props.descripcion ?? '<p>Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.</p>',
          },
        };
      },
      render: ({
        tituloSeccion,
        descripcion,
        titulo,
        searchPlaceholder,
        imagenFondo,
        transparenciaFondo,
        colorFondo,
      }: BlockRender<{
        // `ReactNode` y no `string`: Puck convierte los campos `richtext` a nodos
        // antes de llamar al render, igual que en `TextoRico` de la intranet.
        tituloSeccion?: ReactNode;
        descripcion?: ReactNode;
        titulo?: ReactNode;
        searchPlaceholder?: string;
        imagenFondo?: string;
        transparenciaFondo?: number | '';
        colorFondo?: string;
      }>) => (
        <HeroBuscadorOcupaciones
          tituloSeccion={tituloSeccion}
          descripcion={descripcion}
          titulo={titulo}
          searchPlaceholder={searchPlaceholder}
          imagenFondo={imagenFondo}
          transparenciaFondo={transparenciaFondo}
          colorFondo={colorFondo}
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
        colorTitle: campoColor('Color del título (opcional)'),
        services: {
          type: 'array' as const,
          label: 'Lista de servicios',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            title: { type: 'text' as const, label: 'Título', contentEditable: true },
            description: { type: 'richtext' as const, label: 'Descripción', contentEditable: true },
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
      resolveData: ({ props }: { props: Record<string, any> }) => {
        if (props.galeria !== undefined) return { props };
        const anteriores: Record<string, any>[] = Array.isArray(props.imagenes)
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
        titulo: { type: 'richtext' as const, label: 'Título', contentEditable: true },
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
        titulo: { type: 'richtext' as const, label: 'Título', contentEditable: true },
        fondo: campoColor('Color de fondo (opcional)'),
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
            mes: {
              type: 'richtext' as const,
              label: 'Mes (p. ej. ENE - MAR)',
              contentEditable: true,
              options: OPCIONES_TEXTO_EN_LINEA,
            },
            dia: {
              type: 'richtext' as const,
              label: 'Año (p. ej. 2026)',
              contentEditable: true,
              options: OPCIONES_TEXTO_EN_LINEA,
            },
          },
          getItemSummary: (item: { titulo?: string; pdfUrl?: string }) => {
            const titulo = typeof item.titulo === 'string' ? item.titulo.replace(/\s+/g, ' ').trim() : '';
            if (titulo) return titulo;
            if (item.pdfUrl) {
              const nombre = decodeURIComponent(item.pdfUrl.split('/').pop() ?? 'Documento PDF');
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
        titulo: { type: 'richtext' as const, label: 'Título (h1 de la página)', contentEditable: true },
        intro: { type: 'richtext' as const, label: 'Párrafos de introducción', contentEditable: true },
        colorTitulo: campoColor('Color del título (opcional)'),
        colorContenido: campoColor('Color de la introducción / contenido (opcional)'),
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
        titulo: { type: 'richtext' as const, label: 'Título de la sección', contentEditable: true },
        colorTitulo: campoColor('Color del título (opcional)'),
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
        titulo: { type: 'richtext' as const, label: 'Título de la sección', contentEditable: true },
        intro: { type: 'richtext' as const, label: 'Párrafo de introducción', contentEditable: true },
        colorTitulo: campoColor('Color del título (opcional)'),
        colorContenido: campoColor('Color del contenido / introducción (opcional)'),
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
            texto: {
              type: 'richtext' as const,
              label: 'Texto',
              contentEditable: true,
              // La tarjeta entera ya es un enlace: un enlace dentro de otro no vale.
              options: { ...OPCIONES_TEXTO_EN_LINEA, link: false },
            },
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
      resolveData: ({ props }: { props: Record<string, any> }) =>
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
        titulo: {
          type: 'richtext' as const,
          label: 'Título',
          contentEditable: true,
          options: OPCIONES_TEXTO_EN_LINEA,
        },
        subtitulo: {
          type: 'richtext' as const,
          label: 'Subtítulo (opcional)',
          contentEditable: true,
          options: OPCIONES_TEXTO_EN_LINEA,
        },
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
            parrafo: {
              type: 'richtext' as const,
              label: 'Párrafo',
              contentEditable: true,
              options: OPCIONES_TEXTO_DEL_CARRUSEL,
            },
            // El de la franja del texto, aparte del banner de imágenes.
            colorFondo: campoColor('Color de fondo'),
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
        titulo: { type: 'richtext', label: 'Título', contentEditable: true },
        mostrarSubtitulo: {
          type: 'radio',
          label: 'Mostrar subtítulo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtitulo: { type: 'richtext', label: 'Subtítulo', contentEditable: true },
        contenido: { type: 'richtext', label: 'Contenido', contentEditable: true },
        fondo: campoFondo,
        colorTitulo: campoColor('Color del título (opcional)'),
        colorContenido: campoColor('Color del contenido (opcional)'),
        colorTexto: campoColor('Color del texto (opcional)'),
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
      resolveData: ({ props }: { props: Record<string, any> }) => {
        if (Array.isArray(props.tarjetas) && props.tarjetas.length > 0) return { props };
        const viejas = [props.tarjeta1, props.tarjeta2].filter((t) => t && (t.imagen || t.titulo));
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
        texto: { type: 'text', label: 'Texto del botón', contentEditable: true },
        tamano: {
          type: 'select',
          label: 'Tamaño del botón (altura y texto)',
          options: [
            { label: 'Pequeño (sm)', value: 'pequeno' },
            { label: 'Mediano (md - Estilo OLO)', value: 'mediano' },
            { label: 'Grande (lg)', value: 'grande' },
            { label: 'Extra grande (xl)', value: 'extraGrande' },
          ],
        },
        alineacion: {
          type: 'radio',
          label: 'Alineación horizontal',
          options: [
            { label: 'Centrado', value: 'centro' },
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Derecha', value: 'derecha' },
          ],
        },
        ancho: {
          type: 'radio',
          label: 'Ancho del botón',
          options: [
            { label: 'Ajustado al texto (Auto)', value: 'auto' },
            { label: 'Mediano (320px)', value: 'mediano' },
            { label: 'Grande (480px)', value: 'grande' },
            { label: 'Ancho completo (100%)', value: 'completo' },
          ],
        },
        colorFondo: campoColor('Color de fondo (por defecto blanco)'),
        colorTexto: campoColor('Color del texto (por defecto color del título #002237)'),
        icono: campoIcono('Ícono del botón'),
        posicionIcono: {
          type: 'radio',
          label: 'Posición del ícono',
          options: [
            { label: 'Izquierda', value: 'izquierda' },
            { label: 'Derecha', value: 'derecha' },
            { label: 'No mostrar ícono', value: 'ninguno' },
          ],
        },
        destino: campoDestinoBoton('Destino del botón (Enlace o Archivo)'),
        resaltado: {
          type: 'radio',
          label: 'Resaltar botón',
          options: [
            { label: 'Normal', value: false },
            { label: 'Resaltado (Verde SENA)', value: true },
          ],
        },
      },
      defaultProps: {
        texto: 'Nuevo botón',
        tamano: 'mediano',
        alineacion: 'centro',
        ancho: 'mediano',
        colorFondo: '#ffffff',
        colorTexto: '#002237',
        icono: '',
        posicionIcono: 'izquierda',
        destino: { tipo: 'enlace', urlEnlace: '' },
        resaltado: false,
      },
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
        colorTitulo: campoColor('Color del título (opcional)'),
        colorSubtitulo: campoColor('Color del subtítulo / contenido (opcional)'),
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
        colorTitulo: campoColor('Color del título (opcional)'),
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
        colorDescripcion: campoColor('Color de la descripción (opcional)'),
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
     * El buscador de ocupaciones completo: el banner de búsqueda con sus resultados y el
     * detalle en el diálogo. Es lo que sirve la página `clasificacion` (`/clasificacion`),
     * que hasta la migración 046 era una carpeta propia en `app/(public)/`.
     */
    BuscadorOcupaciones: {
      label: 'Buscador de Ocupaciones',
      fields: {
        ayuda: {
          type: 'textarea',
          label: 'Texto de ayuda (debajo del buscador; vacío no se muestra)',
        },
      },
      defaultProps: {
        ayuda: 'Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.',
      },
      render: (props: BlockRender<{ ayuda?: string }>) => (
        <BuscadorOcupacionesView ayuda={props.ayuda ?? ''} />
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
        colorTitulo: campoColor('Color del título (opcional)'),
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
        colorSubtitulo: campoColor('Color del subtítulo (opcional)'),
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
        colorDescripcion: campoColor('Color de la descripción (opcional)'),
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
    FuentesFuturasEmpleo: {
      label: 'Fuentes futuras de empleo',
      fields: {
        modoSeleccionDepartamento: {
          type: 'radio',
          label: 'Modo de selección de departamento',
          options: [
            { label: 'Por lista', value: 'lista' },
            { label: 'Por mapa', value: 'mapa' },
          ],
        },
        mostrarTotales: {
          type: 'radio',
          label: 'Mostrar fila de totales',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        mostrarBannerDepartamento: {
          type: 'radio',
          label: 'Mostrar información por departamento',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtituloInfoDepto: {
          type: 'text',
          label: 'Subtítulo info departamento',
        },
        descripcionInfoDepto: {
          type: 'custom',
          label: 'Descripción info departamento',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <CampoDescripcionConVariables value={value} onChange={onChange} />
          ),
        },
        colorBanner: campoColor('Color de acento información departamento (opcional)'),
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
        colorTitulo: campoColor('Color del título (opcional)'),
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
        colorSubtitulo: campoColor('Color del subtítulo (opcional)'),
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
        colorDescripcion: campoColor('Color de la descripción (opcional)'),
      },
      defaultProps: {
        modoSeleccionDepartamento: 'mapa',
        mostrarTotales: true,
        mostrarTitulo: true,
        titulo: 'Fuentes futuras de empleo',
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
        mostrarBannerDepartamento: true,
        subtituloInfoDepto: 'Proyectos de inversión nuevos y/o en expansión potencialmente generadores de empleo.',
        descripcionInfoDepto: 'En lo corrido del año se han detectado {proyectos} proyectos, con una participación del {porcentaje}% sobre el total nacional.',
        colorBanner: '',
      },
      resolveData: async (data) => {
        const propsActualizadas = { ...data.props };
        let huboCambios = false;

        if (!propsActualizadas.titulo || !propsActualizadas.titulo.trim()) {
          propsActualizadas.titulo = 'Fuentes futuras de empleo';
          huboCambios = true;
        }

        if (!propsActualizadas.modoSeleccionDepartamento) {
          propsActualizadas.modoSeleccionDepartamento = 'mapa';
          huboCambios = true;
        }

        const propsCualquiera = propsActualizadas as Record<string, unknown>;
        if (
          propsCualquiera.subtituloBanner !== undefined ||
          propsCualquiera.tituloBanner !== undefined ||
          propsCualquiera.descripcionBanner !== undefined
        ) {
          delete propsCualquiera.subtituloBanner;
          delete propsCualquiera.tituloBanner;
          delete propsCualquiera.descripcionBanner;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarTotales === undefined) {
          propsActualizadas.mostrarTotales = true;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarTitulo === undefined) {
          propsActualizadas.mostrarTitulo = true;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarSubtitulo === undefined) {
          propsActualizadas.mostrarSubtitulo = false;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarDescripcion === undefined) {
          propsActualizadas.mostrarDescripcion = false;
          huboCambios = true;
        }

        if (propsActualizadas.mostrarBannerDepartamento === undefined) {
          propsActualizadas.mostrarBannerDepartamento = true;
          huboCambios = true;
        }

        if (propsActualizadas.subtituloInfoDepto === undefined) {
          propsActualizadas.subtituloInfoDepto = 'Proyectos de inversión nuevos y/o en expansión potencialmente generadores de empleo.';
          huboCambios = true;
        }

        if (propsActualizadas.descripcionInfoDepto === undefined) {
          propsActualizadas.descripcionInfoDepto = 'En lo corrido del año se han detectado {proyectos} proyectos, con una participación del {porcentaje}% sobre el total nacional.';
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
          modoSeleccionDepartamento?: 'lista' | 'mapa';
          mostrarBannerDepartamento?: boolean;
          subtituloInfoDepto?: string;
          descripcionInfoDepto?: string;
          colorBanner?: string;
          mostrarTotales?: boolean;
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
        <FuentesFuturasEmpleoView
          modoSeleccionDepartamento={props.modoSeleccionDepartamento ?? 'mapa'}
          mostrarBannerDepartamento={props.mostrarBannerDepartamento ?? true}
          subtituloInfoDepto={props.subtituloInfoDepto}
          descripcionInfoDepto={props.descripcionInfoDepto}
          colorBanner={props.colorBanner}
          mostrarTotales={props.mostrarTotales ?? true}
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
          label: 'Descripción (Opcional)',
        },
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
 * `Header` y `Footer` NO están en `inicio`: los pinta `app/(paginas)/layout.tsx` a
 * partir de la página `plantilla`, y ofrecerlos en una sección dejaría volver a
 * tener una cabecera distinta por página, que es justo lo que se acaba de quitar.
 */
/**
 * La página que guarda la cabecera y el pie comunes.
 *
 * Espejo de `SLUG_PLANTILLA` en `features/paginas/menu-y-pie/menu-y-pie.ts`. No se importa de
 * allí para no atar el catálogo de bloques a una feature: aquí solo hace falta el
 * literal, y si algún día cambia, cambia en los dos sitios.
 */
const SLUG_DE_PLANTILLA = 'menu-y-pie';



/**
 * Lo que el lienzo enseña alrededor de lo que se está editando.
 *
 * Son datos YA PUBLICADOS que se pintan de contexto: lo mismo que ve quien visita
 * el sitio. Los resuelve el Server Component del editor y llegan hasta aquí por
 * props — ver `app/editor/[slug]/page.tsx`.
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
