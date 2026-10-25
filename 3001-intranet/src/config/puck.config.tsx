'use client';

import { IntranetFooter } from '@/shared/lib/blocks/plantilla/intranet-footer';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/plantilla/intranet-topbar-wrapper';
// La barra "pelada", sin el envoltorio que le inyecta la sesión: el contexto
// inerte del editor no necesita un botón de cerrar sesión que no se puede pulsar.
import { IntranetTopbar } from '@/shared/lib/blocks/plantilla/intranet-topbar';
import { IntranetHero } from '@/shared/lib/blocks/compartidos/intranet-hero';
import { TasaBanner } from '@/shared/lib/blocks/tasa/tasa-banner';
import { TasaConceptos } from '@/shared/lib/blocks/tasa/tasa-conceptos';
import { TasaVideo } from '@/shared/lib/blocks/compartidos/tasa-video';
import { TasaDashboards } from '@/shared/lib/blocks/compartidos/tasa-dashboards';
import { TasaPresentacion } from '@/shared/lib/blocks/compartidos/tasa-presentacion';
import { MatrizBanner } from '@/shared/lib/blocks/matriz/matriz-banner';
import { EncuestaBanner } from '@/shared/lib/blocks/encuestas/encuesta-banner';
import { SeccionCarrusel } from '@/shared/lib/blocks/compartidos/seccion-carrusel';
import { ImagenDestacada } from '@/shared/lib/blocks/compartidos/imagen-destacada';
import { TextoRico } from '@/shared/lib/blocks/compartidos/texto-rico';
import { TextoConImagen } from '@/shared/lib/blocks/compartidos/texto-con-imagen';
import { DescargasConPresentacion } from '@/shared/lib/blocks/compartidos/descargas-con-presentacion';
import { RecursosVisualesBloque, extraerYoutubeId } from '@/shared/lib/blocks/inicio/recursos-visuales-bloque';
import { Publicaciones, VELOCIDADES_CINTA } from '@/shared/lib/blocks/inicio/publicaciones';
import { PreguntasFrecuentes } from '@/shared/lib/blocks/inicio/preguntas-frecuentes';
import { IconoBloque } from '@/shared/lib/blocks/compartidos/icono-bloque';
import {
  primitiveComponents,
  crearGridConfig,
  conCaja,
  conCajaEnTodos,
  campoEnAcordeon,
  campoPaginaEnEdicion,
  BLOQUES_SIN_CAJA,
  campoColor,
  campoIcono,
  TarjetaArticulo,
  BotonPersonalizado,
  migrarBoton,
  SeccionBotonesIcono,
  campoDestinoBotonEnAcordeon,
  crearCampoTextoRico,
} from '@olo/blocks-renderer';
import { Render, RichTextMenu, type Config, type Data } from '@puckeditor/core';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { rutaPublicaDeSlug } from '@/features/editor/model/rutas';
import { ImageUploaderField } from '@/features/editor/edition/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/editor/edition/components/archivo-uploader-field';

/** Props de un componente de Puck. `id` siempre viene inyectado y, al ser
 *  obligatorio, evita que TypeScript trate el tipo como "weak" y rechace el
 *  render por no compartir propiedades con el Config generico. */
type BlockRender<T> = T & { id: string };

/** Campo de imagen con subida, que se repite en casi todos los bloques. */
const campoImagen = (label: string) =>
({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ImageUploaderField value={value} onChange={onChange} />
  ),
});

/**
 * Todos los textos enriquecidos llevan la misma barra que en el sitio-web: H1–H6,
 * viñetas, negrita, cursiva, subrayado y alineación (ver `crearCampoTextoRico`).
 */
const campoTextoRico = crearCampoTextoRico(RichTextMenu);

/**
 * Campo con entrada para enlace o ID de YouTube y vista previa en vivo de la miniatura.
 */
function CampoYoutubePreview({ value = '', onChange }: { value: string; onChange: (v: string) => void }) {
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

// ─── Puck Configuration for Intranet ───
/**
 * El catálogo tal cual lo declara cada bloque.
 *
 * No se exporta: lo que consume la app es el `puckConfig` de más abajo, que es
 * este mismo con los controles de «Espaciado y ancho» ya inyectados. Van por
 * separado porque esos seis campos son idénticos en los veintitantos bloques y
 * declararlos uno a uno solo serviría para que acabaran divergiendo.
 */
const puckConfigBase: Config = {
  categories: {
    'Plantilla': {
      components: ['IntranetTopbar', 'IntranetFooter'],
    },
    'Banner': {
      components: ['IntranetHero'],
    },
    'Texto e imagen': {
      components: ['TextoRico', 'TextoConImagen', 'ImagenDestacada', 'TarjetaArticulo'],
    },
    'Botones y enlaces': {
      components: ['BotonPersonalizado', 'SeccionBotonesIcono'],
    },
    'Multimedia': {
      components: ['SeccionCarrusel', 'TasaVideo', 'RecursosVisualesBloque', 'IconoBloque'],
    },
    'Datos y documentos': {
      components: [
        'TasaDashboards',
        'TasaPresentacion',
        'DescargasConPresentacion',
        'Publicaciones',
      ],
    },
    'Cabeceras de sección': {
      components: ['TasaBanner', 'MatrizBanner', 'EncuestaBanner'],
    },
    'Bloques de una sección': {
      components: ['TasaConceptos', 'PreguntasFrecuentes'],
    },
    'Maquetación': {
      // `SeccionPestanasLaterales` se quitó de aquí el 2026-09-27: no existe ningún
      // componente con ese nombre en el catálogo (ni import, ni entrada en
      // `components:` más abajo, ni en `@olo/blocks-renderer`); esta mención no hacía
      // nada. Mismo hallazgo que en el sitio web, ver 6-auditoria.md.
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
    // Primitivos de maquetación compartidos (Flex / Space)
    ...primitiveComponents,
    // Grid necesita el campo de imagen de esta app inyectado (su fondo sube
    // archivos contra la API de intranet) — ver `crearGridConfig`.
    Grid: conCaja(crearGridConfig(campoImagen)),
    IntranetTopbar: {
      label: 'Barra de navegación',
      fields: {
        brandText: { type: 'text', label: 'Texto de la Marca', contentEditable: true },
        alineacionMarca: {
          type: 'object',
          label: 'Posición de la marca (logo + texto)',
          objectFields: {
            horizontal: {
              type: 'radio',
              label: 'Alineación horizontal',
              options: [
                { label: 'Izquierda', value: 'flex-start' },
                { label: 'Centro', value: 'center' },
                { label: 'Derecha', value: 'flex-end' },
              ],
            },
            vertical: {
              type: 'radio',
              label: 'Alineación vertical',
              options: [
                { label: 'Arriba', value: 'flex-start' },
                { label: 'Centro', value: 'center' },
                { label: 'Abajo', value: 'flex-end' },
              ],
            },
          },
        },
        logoUrl: campoImagen('Logo'),
        fondo: campoColor('Color de fondo (opcional)'),
        // `children` estaba sin declarar aquí y el componente sí lo pinta: por eso
        // el desplegable de «Encuestas» desapareció al pasar el menú a la base.
        // Un `array` dentro de otro `array` es válido en Puck y es lo que hace
        // falta para que el submenú se pueda editar en vez de perderse.
        menuItems: {
          type: 'array',
          label: 'Menú de Navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace', contentEditable: true },
            href: { type: 'text', label: 'URL (usa # si solo abre el submenú)' },
            // Los dos siguientes solo se ven en el móvil, en la navegación de abajo
            // (`shared/lib/mobile/navegacion-mobile-intranet.tsx`). Vacíos, cada sección
            // conocida lleva su icono de `public/assets/svg/mobile/` y el texto se recorta solo.
            icono: campoIcono('Icono en la navegación del móvil'),
            etiquetaMovil: { type: 'text', label: 'Texto corto en el móvil (vacío: se recorta el de arriba)' },
            children: {
              type: 'array',
              label: 'Submenú (déjalo vacío si no despliega)',
              arrayFields: {
                label: { type: 'text', label: 'Texto del enlace', contentEditable: true },
                href: { type: 'text', label: 'URL' },
              },
              getItemSummary: (item) => item.label || 'Enlace del submenú',
            },
          },
          getItemSummary: (item) =>
            item.label
              ? `${item.label}${item.children?.length ? ` (${item.children.length})` : ''}`
              : 'Enlace',
        },
      },
      defaultProps: {
        brandText: 'Intranet',
        // Igual al comportamiento de hoy (`.intranet-brand` en globals.css):
        // fila pegada a la izquierda, centrada verticalmente con el logo.
        alineacionMarca: { horizontal: 'flex-start', vertical: 'center' },
        logoUrl: '/assets/svg/olo-logo-blanco.svg',
        fondo: '',
        menuItems: [
          { href: '/inicio', label: 'Inicio', children: [] },
          { href: '/tasa', label: 'Tasa de Vinculación y Empleabilidad', children: [] },
          { href: '/matriz', label: 'Matriz de Pertinencia', children: [] },
          {
            href: '#',
            label: 'Encuestas',
            children: [
              { href: '/encuestas/calidad-de-formacion', label: 'Calidad de Formación' },
              { href: '/encuestas/seguimiento-laboral', label: 'Seguimiento Laboral' },
            ],
          },
        ],
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetTopbarWrapper>>) => {
        return <IntranetTopbarWrapper {...props} />;
      },
    },
    IntranetHero: {
      label: 'Banner de imagen completa',
      fields: {
        imageSrc: campoImagen('Imagen'),
        imageAlt: { type: 'text', label: 'Texto alternativo' },
      },
      defaultProps: {
        imageSrc: '/assets/img/banner1.png',
        imageAlt: 'Banner principal de la intranet',
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetHero>>) => (
        <IntranetHero {...props} />
      ),
    },
    // ─── Cabeceras propias de una sección ───
    TasaBanner: {
      label: 'Cabecera · Tasa',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera línea)', contentEditable: true },
        tituloDestacado: { type: 'text', label: 'Título en negrita (segunda línea)', contentEditable: true },
        imagenSrc: campoImagen('Ilustración'),
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
      },
      defaultProps: {
        tituloInicio: 'Tasa de',
        tituloDestacado: 'Vinculación y Empleabilidad',
        imagenSrc: '/assets/img/BannerTasa.png',
        imagenAlt: 'Tasa de Vinculación y Empleabilidad',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaBanner>>) => <TasaBanner {...props} />,
    },
    MatrizBanner: {
      label: 'Cabecera · Matriz',
      fields: {
        titulo: campoTextoRico('Título'),
        imagenSrc: campoImagen('Ilustración'),
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
      },
      defaultProps: {
        titulo: '<p>Matriz de <br/><strong>PERTINENCIA</strong></p>',
        imagenSrc: '/assets/img/BannerOficial.png',
        imagenAlt: 'Matriz de Pertinencia',
      },
      render: (props: BlockRender<ComponentProps<typeof MatrizBanner>>) => (
        <MatrizBanner {...props} />
      ),
    },
    EncuestaBanner: {
      label: 'Cabecera · Encuesta',
      fields: {
        antetitulo: { type: 'text', label: 'Línea superior', contentEditable: true },
        titulo: campoTextoRico('Título'),
        imagenSrc: campoImagen('Ilustración'),
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
        imagenDerecha: {
          type: 'radio',
          label: 'Posición de la imagen',
          options: [
            { label: 'Izquierda', value: false },
            { label: 'Derecha', value: true },
          ],
        },
      },
      defaultProps: {
        antetitulo: 'Encuesta de',
        titulo: '<p>SEGUIMIENTO LABORAL</p>',
        imagenSrc: '/assets/img/banner-seguimiento-laboral.png',
        imagenAlt: 'Ilustración encuesta',
        imagenDerecha: false,
      },
      render: (props: BlockRender<ComponentProps<typeof EncuestaBanner>>) => (
        <EncuestaBanner {...props} />
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
    TextoConImagen: {
      label: 'Texto con imagen al lado',
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
        colorTitulo: campoColor('Color del título (opcional)'),
        colorContenido: campoColor('Color del contenido (opcional)'),
        imagenSrc: campoImagen('Imagen (opcional si hay presentación)'),
        imagenAlt: { type: 'text', label: 'Texto alternativo' },
        pieDeImagen: { type: 'text', label: 'Leyenda bajo la imagen', contentEditable: true },
        archivoUrl: {
          type: 'custom',
          label: 'Presentación PPTX (reemplaza la imagen)',
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir archivo"
            />
          ),
        },
        ladoImagen: {
          type: 'radio',
          label: 'Lado de la imagen / presentación',
          options: [
            { label: 'Derecha', value: 'derecha' },
            { label: 'Izquierda', value: 'izquierda' },
          ],
        },
        fondo: campoFondo,
      },
      defaultProps: {
        mostrarTitulo: true,
        titulo: '¿Cuál es el <strong>objetivo</strong>?',
        mostrarSubtitulo: false,
        subtitulo: '',
        contenido: '<p>Escribe aquí el contenido de la sección.</p>',
        colorTitulo: '',
        colorContenido: '',
        imagenSrc: '',
        imagenAlt: '',
        pieDeImagen: '',
        archivoUrl: '',
        ladoImagen: 'derecha',
        fondo: 'gris',
      },
      render: (props: BlockRender<ComponentProps<typeof TextoConImagen>>) => (
        <TextoConImagen {...props} />
      ),
    },
    ImagenDestacada: {
      label: 'Imagen destacada',
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
        colorTitulo: campoColor('Color del título (opcional)'),
        mostrarSubtitulo: {
          type: 'radio',
          label: 'Mostrar subtítulo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        subtitulo: campoTextoRico('Subtítulo'),
        imagenSrc: campoImagen('Imagen'),
        imagenAlt: { type: 'text', label: 'Texto alternativo' },
        ancho: {
          type: 'radio',
          label: 'Ancho',
          options: [
            { label: 'Completo', value: 'completo' },
            { label: 'Caja centrada', value: 'contenido' },
          ],
        },
        fondo: campoFondo,
        // Solo tienen efecto visible en «Completo»: en «Caja centrada» el
        // redondeado ya lo fija el CSS de esa caja con más especificidad.
        ajusteImagen: {
          type: 'radio',
          label: 'Ajuste de la imagen (solo ancho «Completo»)',
          options: [
            { label: 'Cubrir el espacio', value: 'cover' },
            { label: 'Verse completa', value: 'contain' },
          ],
        },
        redondeado: {
          type: 'select',
          label: 'Bordes redondeados (solo ancho «Completo»)',
          options: [
            { label: 'Ninguno', value: 'ninguno' },
            { label: 'Pequeño', value: 'pequeno' },
            { label: 'Grande', value: 'grande' },
            { label: 'Circular', value: 'circular' },
          ],
        },
      },
      defaultProps: {
        mostrarTitulo: true,
        titulo: '',
        colorTitulo: '',
        mostrarSubtitulo: false,
        subtitulo: '',
        imagenSrc: '',
        imagenAlt: '',
        ancho: 'completo',
        fondo: 'blanco',
        ajusteImagen: 'contain',
        redondeado: 'grande',
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
          metadata: { ayuda: 'Lo que dice el botón. También se escribe directo sobre la página.' },
        },
        tamano: campoEnAcordeon({
          type: 'select',
          label: 'Tamaño del botón',
          ayuda: 'Qué tan alto y grande se ve el botón.',
          options: [
            { label: 'Pequeño', value: 'pequeno' },
            { label: 'Mediano', value: 'mediano' },
            { label: 'Grande', value: 'grande' },
            { label: 'Extra grande', value: 'extraGrande' },
          ],
        }),
        ancho: campoEnAcordeon({
          type: 'radio',
          label: 'Ancho del botón',
          ayuda: '«Ajustado» se adapta a su texto; «Completo» ocupa toda la fila.',
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
          ayuda: 'Relleno del botón. Vacío = blanco.',
        }),
        colorTexto: campoEnAcordeon({
          type: 'color',
          label: 'Color del texto',
          ayuda: 'Color de las letras. Vacío = azul oscuro del título.',
        }),
        destino: campoDestinoBotonEnAcordeon(
          'Destino del botón',
          'A dónde lleva el clic: un enlace, un archivo o nada.'
        ),
        resaltado: campoEnAcordeon({
          type: 'radio',
          label: 'Resaltar botón',
          ayuda: 'Añade un borde y un halo de color para que destaque.',
          options: [
            { label: 'Normal', value: false },
            { label: 'Resaltado', value: true },
          ],
        }),
        colorResaltado: campoEnAcordeon({
          type: 'color',
          label: 'Color del resaltado',
          ayuda: 'Color del borde y el halo; solo se ve si el botón está resaltado. Vacío = verde SENA.',
        }),
      },
      defaultProps: {
        texto: 'Nuevo botón',
        tamano: 'mediano',
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
    // ─── Multimedia ───
    SeccionCarrusel: {
      label: 'Carrusel de imágenes',
      fields: {
        titulo: campoTextoRico('Título'),
        imagenes: {
          type: 'array',
          label: 'Imágenes',
          arrayFields: {
            src: campoImagen('Imagen'),
            alt: { type: 'text', label: 'Texto alternativo' },
          },
          getItemSummary: (item, indice) => item.alt || `Imagen ${(indice ?? 0) + 1}`,
        },
        imagenesPorPagina: { type: 'number', label: 'Imágenes visibles a la vez', min: 1, max: 6 },
        autoplay: {
          type: 'radio',
          label: 'Pasar solas',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        mostrarBotones: {
          type: 'radio',
          label: 'Flechas',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        disposicion: {
          type: 'radio',
          label: 'Disposición',
          options: [
            { label: 'Título arriba', value: 'columna' },
            { label: 'Título al lado', value: 'lado-a-lado' },
          ],
        },
        fondo: campoFondo,
      },
      defaultProps: {
        titulo: 'Título del carrusel',
        imagenes: [
          { src: '/assets/img/Carrusel1.png', alt: 'Carrusel 1' },
          { src: '/assets/img/Carrusel2.png', alt: 'Carrusel 2' },
          { src: '/assets/img/Carrusel3.png', alt: 'Carrusel 3' },
        ],
        imagenesPorPagina: 3,
        autoplay: true,
        mostrarBotones: true,
        disposicion: 'columna',
        fondo: 'blanco',
      },
      render: (props: BlockRender<ComponentProps<typeof SeccionCarrusel>>) => (
        <SeccionCarrusel {...props} />
      ),
    },
    TasaVideo: {
      label: 'Video embebido',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera parte)', contentEditable: true },
        tituloDestacado: { type: 'text', label: 'Título en negrita', contentEditable: true },
        videoUrl: { type: 'text', label: 'Enlace del video de YouTube' },
        descargaTexto: { type: 'text', label: 'Texto sobre el botón de descarga (opcional)', contentEditable: true },
        descargaEtiqueta: { type: 'text', label: 'Texto del botón', contentEditable: true },
        descargaNombre: { type: 'text', label: 'Nombre al descargar (opcional)' },
        descargaUrl: {
          type: 'custom',
          label: 'Archivo para descargar (opcional)',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={(url) => onChange(url)}
              accept=".xlsx,.xls,.csv,.pdf"
              etiquetaBoton="Subir archivo"
            />
          ),
        },
      },
      defaultProps: {
        tituloInicio: 'Aquí te contamos todo sobre la estrategia de Tasa de',
        tituloDestacado: 'Vinculación y Empleabilidad',
        videoUrl: 'https://www.youtube.com/embed/4E7Sci4DAVQ',
        descargaTexto: '',
        descargaEtiqueta: 'Descargar',
        descargaNombre: '',
        descargaUrl: '',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaVideo>>) => <TasaVideo {...props} />,
    },
    RecursosVisualesBloque: {
      label: 'Lista de videos',
      fields: {
        titulo: campoTextoRico('Título'),
        videos: {
          type: 'array',
          label: 'Videos',
          arrayFields: {
            youtubeId: {
              type: 'custom',
              label: 'Enlace o ID de YouTube',
              render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                <CampoYoutubePreview value={value} onChange={onChange} />
              ),
            },
            titulo: { type: 'text', label: 'Título', contentEditable: true },
            canal: { type: 'text', label: 'Canal', contentEditable: true },
            miniatura: campoImagen('Miniatura propia (opcional)'),
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
        titulo: '<p><strong>Recursos</strong> visuales</p>',
        videos: [],
      },
      render: ({ puck, ...props }: BlockRender<ComponentProps<typeof RecursosVisualesBloque> & { puck?: { isEditing?: boolean } }>) => (
        <RecursosVisualesBloque {...props} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    // ─── Datos y documentos ───
    TasaDashboards: {
      label: 'Tableros Power BI',
      fields: {
        tableros: {
          type: 'array',
          label: 'Tableros',
          arrayFields: {
            titulo: campoTextoRico('Título'),
            descripcion: campoTextoRico('Descripción'),
            urlPowerBi: { type: 'text', label: 'Enlace de Power BI (Publicar en la web)' },
          },
          getItemSummary: (item) => {
            if (typeof item.titulo === 'string') {
              const limpio = item.titulo.replace(/<[^>]*>/g, '').trim();
              return limpio || 'Tablero';
            }
            return 'Tablero';
          },
        },
      },
      defaultProps: {
        tableros: [],
      },
      render: (props: BlockRender<ComponentProps<typeof TasaDashboards>>) => (
        <TasaDashboards {...props} />
      ),
    },
    TasaPresentacion: {
      label: 'Presentación (PPTX)',
      fields: {
        tituloInicio: { type: 'text', label: 'Título (primera parte)', contentEditable: true },
        tituloDestacado: { type: 'text', label: 'Título en negrita', contentEditable: true },
        archivoUrl: {
          type: 'custom',
          label: 'Archivo de presentación',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={(url) => onChange(url)}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir archivo"
            />
          ),
        },
      },
      defaultProps: {
        tituloInicio: 'Aquí podrás visualizar nuestra',
        tituloDestacado: 'presentación de Tasa de Vinculación y Empleabilidad',
        archivoUrl: '/uploads/documents/tasa.pptx',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaPresentacion>>) => (
        <TasaPresentacion {...props} />
      ),
    },
    DescargasConPresentacion: {
      label: 'Descargas con presentación',
      fields: {
        titulo: campoTextoRico('Título'),
        enlaces: {
          type: 'array',
          label: 'Enlaces',
          arrayFields: {
            etiqueta: { type: 'text', label: 'Texto del enlace', contentEditable: true },
            url: { type: 'text', label: 'URL' },
            nombreArchivo: { type: 'text', label: 'Nombre al descargar (opcional)' },
          },
          getItemSummary: (item) => item.etiqueta || 'Enlace',
        },
        archivoUrl: {
          type: 'custom',
          label: 'Presentación al lado (opcional)',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={(url) => onChange(url)}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir archivo"
            />
          ),
        },
      },
      defaultProps: {
        titulo: '<p><strong>Descargas</strong></p>',
        enlaces: [],
        archivoUrl: '',
      },
      render: (props: BlockRender<ComponentProps<typeof DescargasConPresentacion>>) => (
        <DescargasConPresentacion {...props} />
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
        fondo: campoColor('Color de fondo (opcional)'),
        movimiento: {
          type: 'radio',
          label: 'Se mueve solo',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        velocidad: { type: 'radio', label: 'Velocidad de la cinta', options: VELOCIDADES_CINTA },
        publicaciones: {
          type: 'array',
          label: 'Publicaciones',
          arrayFields: {
            titulo: { type: 'textarea', label: 'Nombre de la publicación (Enter parte la línea)', contentEditable: true },
            detalle: { type: 'text', label: 'Detalle (texto verde sobre el nombre, opcional)', contentEditable: true },
            miniatura: campoImagen('Miniatura (opcional; sin ella, la primera página del PDF)'),
            pdfUrl: {
              type: 'custom',
              label: 'Archivo PDF',
              render: ({ value, onChange }) => (
                <ArchivoUploaderField
                  value={value}
                  onChange={(url) => onChange(url)}
                  accept=".pdf"
                  etiquetaBoton="Subir archivo"
                />
              ),
            },
            nombreArchivo: { type: 'text', label: 'Nombre al descargar (opcional)' },
            url: { type: 'text', label: 'Enlace de la flecha (/ruta o https://…; vacío: abre el PDF)' },
            // Siguen llamándose `mes` y `dia` porque así están en el JSON guardado: el mes
            // (línea pequeña) y el año (línea grande) de la insignia, con formato.
            mes: campoTextoRico('Mes (p. ej. ENE - MAR)'),
            dia: campoTextoRico('Año (p. ej. 2026)'),
          },
          getItemSummary: (item: { titulo?: string; pdfUrl?: string }) => {
            const titulo = typeof item.titulo === 'string' ? item.titulo.replace(/\s+/g, ' ').trim() : '';
            if (titulo) return titulo;
            if (item.pdfUrl) {
              const nombre = item.pdfUrl.split('/').pop() || 'Archivo PDF';
              return `PDF: ${decodeURIComponent(nombre)}`;
            }
            return 'Publicación sin configurar';
          },
        },
      },
      defaultProps: {
        mostrarTitulo: true,
        titulo: '<p><strong>Ultimas</strong> publicaciones</p>',
        fondo: '',
        movimiento: true,
        velocidad: 45,
        publicaciones: [],
      },
      render: ({ puck, ...props }: BlockRender<ComponentProps<typeof Publicaciones> & { puck?: { isEditing?: boolean } }>) => (
        <Publicaciones {...props} esEdicion={Boolean(puck?.isEditing)} />
      ),
    },
    // ─── Bloques de una sola sección ───
    TasaConceptos: {
      label: 'Conceptos en zig-zag',
      fields: {
        conceptos: {
          type: 'array',
          label: 'Conceptos',
          arrayFields: {
            titulo: campoTextoRico('Título'),
            colorTitulo: campoColor('Color del título (opcional)'),
            descripcion: campoTextoRico('Descripción'),
            colorDescripcion: campoColor('Color de la descripción / contenido (opcional)'),
            imagenSrc: campoImagen('Imagen'),
            imagenAlt: { type: 'text', label: 'Texto alternativo' },
          },
          getItemSummary: (item) => {
            if (typeof item.titulo === 'string') {
              const limpio = item.titulo.replace(/<[^>]*>/g, '').trim();
              return limpio || 'Concepto';
            }
            return 'Concepto';
          },
        },
      },
      defaultProps: {
        conceptos: [],
      },
      render: (props: BlockRender<ComponentProps<typeof TasaConceptos>>) => (
        <TasaConceptos {...props} />
      ),
    },
    PreguntasFrecuentes: {
      label: 'Preguntas frecuentes',
      fields: {
        titulo: campoTextoRico('Título'),
        tarjetas: {
          type: 'array',
          label: 'Tarjetas',
          arrayFields: {
            imagenSrc: campoImagen('Imagen'),
            imagenAlt: { type: 'text', label: 'Texto alternativo' },
            texto: campoTextoRico('Texto de la tarjeta'),
            url: { type: 'text', label: 'Enlace (sin él, la tarjeta no es pulsable)' },
          },
          getItemSummary: (item) => {
            if (typeof item.texto === 'string') {
              const limpio = item.texto.replace(/<[^>]*>/g, '').trim();
              return limpio || 'Tarjeta';
            }
            return 'Tarjeta';
          },
        },
      },
      defaultProps: {
        titulo: '<p><strong>Preguntas</strong> Frecuentes</p>',
        tarjetas: [],
      },
      render: (props: BlockRender<ComponentProps<typeof PreguntasFrecuentes>>) => (
        <PreguntasFrecuentes {...props} />
      ),
    },
    IntranetFooter: {
      label: 'Pie de página',
      defaultProps: {
        logos: [],
        columnas: [],
        separadorLogos: '|',
        tamanoSeparadorLogos: 30,
        fondo: ''
      },
      // El pie no tenía ni un campo: se ponía o se quitaba y punto, y para cambiar
      // un teléfono había que tocar el componente. Aquí está todo su contenido.
      fields: {
        fondo: campoColor('Color de fondo (opcional)'),
        separadorLogos: { type: 'text', label: 'Símbolo separador de logos' },
        tamanoSeparadorLogos: {
          type: 'select',
          label: 'Tamaño del separador (px)',
          options: [20, 25, 30, 35, 40].map(v => ({ label: `${v}px`, value: v }))
        },
        logos: {
          type: 'array',
          label: 'Logos',
          arrayFields: {
            src: campoImagen('Imagen'),
            alt: { type: 'text', label: 'Texto alternativo' },
            ancho: { type: 'number', label: 'Ancho en píxeles' },
          },
          getItemSummary: (item) => item.alt || 'Logo',
        },
        columnas: {
          type: 'array',
          label: 'Columnas',
          arrayFields: {
            titulo: campoTextoRico('Título de la columna'),
            orientacionLineas: {
              type: 'radio',
              label: 'Orientación de las líneas',
              options: [
                { label: 'Vertical (Columna)', value: 'column' },
                { label: 'Horizontal (Fila)', value: 'row' },
              ],
            },
            lineas: {
              type: 'array',
              label: 'Líneas',
              arrayFields: {
                texto: campoTextoRico('Texto (opcional si hay ícono)'),
                url: { type: 'text', label: 'Enlace (déjalo vacío si es solo texto)' },
                icono: { type: 'text', label: 'Ruta del ícono SVG (opcional)' },
                separada: {
                  type: 'radio',
                  label: 'Dejar aire encima',
                  options: [
                    { label: 'No', value: false },
                    { label: 'Sí', value: true },
                  ],
                },
              },
              getItemSummary: (item) => {
                if (typeof item.texto === 'string') {
                  const limpio = item.texto.replace(/<[^>]*>/g, '').trim();
                  return limpio || 'Línea';
                }
                return 'Línea';
              },
            },
          },
          getItemSummary: (item) => {
            if (typeof item.titulo === 'string') {
              const limpio = item.titulo.replace(/<[^>]*>/g, '').trim();
              return limpio || 'Columna';
            }
            return 'Columna';
          },
        },
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetFooter>>) => (
        <IntranetFooter {...props} />
      ),
    },
    IconoBloque: {
      label: 'Icono y texto',
      fields: {
        icono: campoIcono('Ícono SVG'),
        colorIcono: campoColor('Color del ícono'),
        texto: { type: 'text', label: 'Texto descriptivo (opcional)', contentEditable: true },
        tamanoTexto: {
          type: 'select',
          label: 'Tamaño del texto',
          options: [
            { label: 'Pequeño (14px)', value: '0.875rem' },
            { label: 'Normal (16px)', value: '1rem' },
            { label: 'Mediano (20px)', value: '1.25rem' },
            { label: 'Grande (24px)', value: '1.5rem' },
            { label: 'Extra Grande (32px)', value: '2rem' },
          ],
        },
        colorTexto: campoColor('Color del texto'),
      },
      defaultProps: {
        icono: '',
        colorIcono: '#002237',
        texto: '',
        tamanoTexto: '1rem',
        colorTexto: '#333333',
      },
      render: (props: BlockRender<ComponentProps<typeof IconoBloque>>) => <IconoBloque {...props} />,
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
 * La barra y el pie quedan fuera (`BLOQUES_SIN_CAJA`): la barra es
 * `position: sticky` y encerrarla en un div que mide lo mismo que ella la
 * dejaría sin recorrido donde pegarse al hacer scroll. Además las coloca la
 * plantilla, no las secciones, así que nadie las va a espaciar desde aquí.
 */
export const puckConfig: Config = {
  ...puckConfigBase,
  components: conCajaEnTodos(puckConfigBase.components, { excepto: BLOQUES_SIN_CAJA }),
};

/**
 * Qué bloques se ofrecen al editar cada sección.
 *
 * El catálogo es uno solo para toda la intranet, así que sin esto quien edita
 * Inicio ve en el selector la cabecera de Tasa, la de Matriz y los bloques
 * heredados del sitio público, ninguno de los cuales pinta nada ahí. El nombre
 * del bloque es la única pista que tiene, y una lista larga de bloques que no
 * vienen a cuento hace que el editor dé miedo tocarlo.
 *
 * Un slug que no esté aquí (una página nueva creada desde el comodín) recibe el
 * catálogo completo, que es lo razonable cuando no se sabe qué va a contener.
 *
 * `IntranetTopbar` e `IntranetFooter` NO están en ninguna sección: los pinta
 * `app/(pages)/layout.tsx` a partir de la página `plantilla`, y ofrecerlos
 * aquí dejaría volver a tener una barra distinta por sección, que es justo el
 * problema que se acaba de quitar. Siguen registrados en `puckConfig` porque
 * puede quedar contenido guardado que los use.
 */
/**
 * La sección que guarda la barra y el pie comunes.
 *
 * Espejo de `SLUG_PLANTILLA` en `features/editor/navegation/menu-y-pie.ts`. No se
 * importa de allí para no atar el catálogo de bloques a una feature: aquí solo hace
 * falta el literal, y si algún día cambia, cambia en los dos sitios.
 */
const SLUG_DE_PLANTILLA = 'menu-y-pie';



/**
 * Lo que el lienzo enseña alrededor de lo que se está editando.
 *
 * Son datos YA PUBLICADOS que se pintan de contexto: lo mismo que ve quien
 * visita la intranet. Los resuelve el Server Component del editor y llegan hasta
 * aquí por props — ver `app/edit/[slug]/page.tsx`.
 */
export interface ContextoDeEdicion {
  /** Barra y pie publicados. Se usa al editar una sección normal. */
  plantilla?: {
    topbar?: Omit<ComponentProps<typeof IntranetTopbar>, 'onLogout' | 'isLoading'> | null;
    pie?: ComponentProps<typeof IntranetFooter> | null;
  } | null;
  /** Sección publicada desde la que se abrió «Menú y pie». */
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
 * `inert` es lo que de verdad lo apaga —quita clic, foco y lectura por lectores
 * de pantalla de una vez—; la clase solo lo atenúa para que se note a simple
 * vista cuál es la parte que esta pantalla no edita.
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
  // Las secciones creadas a mano reciben todo el catálogo de bloques,
  // pero nunca los bloques de 'Plantilla' (IntranetTopbar/IntranetFooter/IconoBloque), que solo se ofrecen en 'menu-y-pie'.
  const permitidos = slug === SLUG_DE_PLANTILLA
    ? ['IntranetTopbar', 'IntranetFooter', 'IconoBloque']
    : Object.keys(puckConfig.components).filter((c) => !['IntranetTopbar', 'IntranetFooter', 'IconoBloque'].includes(c));

  const recortada: Config = {
    ...puckConfig,
    components: Object.fromEntries(
      Object.entries(puckConfig.components).filter(([nombre]) => permitidos.includes(nombre))
    ) as Config['components'],
    categories: Object.fromEntries(
      Object.entries(puckConfig.categories ?? {})
        .map(([nombre, categoria]) => [
          nombre,
          {
            ...categoria,
            components: (categoria.components ?? []).filter((c) => permitidos.includes(c)),
          },
        ])
        // Una categoría que se queda sin bloques no debe salir como grupo vacío.
        .filter(([, categoria]) => (categoria as { components: string[] }).components.length > 0)
    ) as Config['categories'],
    // Sin esto Puck pinta un campo `title` que no cambia nada (el título sale de la base de datos):
    // el panel de la raíz solo dice qué página se edita y que se está en modo edición. `label` es
    // lo que Puck escribe donde antes decía «Page» (la miga de pan «Page › Bloque», el título del panel).
    root: {
      ...puckConfig.root,
      label: slug === SLUG_DE_PLANTILLA ? 'Menú y pie de la intranet' : rutaPublicaDeSlug(slug),
      fields: {
        modoEdicion: campoPaginaEnEdicion(
          slug === SLUG_DE_PLANTILLA
            ? { nombre: 'Menú y pie de la intranet', slug }
            : { ruta: rutaPublicaDeSlug(slug), slug }
        ),
      },
    } as Config['root'],
  };

  if (slug === SLUG_DE_PLANTILLA) {
    const seccion = contexto.seccion;
    if (!seccion) return recortada;

    const topbar = recortada.components.IntranetTopbar;
    if (!topbar) return recortada;

    return {
      ...recortada,
      components: {
        ...recortada.components,
        IntranetTopbar: {
          ...topbar,
          render: (props: Parameters<typeof topbar.render>[0]) => (
            <>
              {topbar.render(props)}
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
  if (!plantilla?.topbar && !plantilla?.pie) return recortada;

  return {
    ...recortada,
    root: {
      ...recortada.root,
      render: ({ children }: { children?: ReactNode }) => (
        <div className="olo-chrome-lienzo">
          {plantilla.topbar && (
            <Inerte etiqueta="Barra - se edita en «Menú y pie»">
              <IntranetTopbar {...plantilla.topbar} />
            </Inerte>
          )}
          {children}
          {plantilla.pie && (
            <Inerte etiqueta="Pie - se edita en «Menú y pie»">
              <IntranetFooter {...plantilla.pie} />
            </Inerte>
          )}
        </div>
      ),
    } as Config['root'],
  };
}