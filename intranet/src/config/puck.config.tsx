'use client';

import {
  IntranetFooter,
  LOGOS_POR_DEFECTO,
  COLUMNAS_POR_DEFECTO,
} from '@/shared/lib/blocks/plantilla/IntranetFooter';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/plantilla/IntranetTopbarWrapper';
import { IntranetHero } from '@/shared/lib/blocks/compartidos/IntranetHero';
import { TasaBanner } from '@/shared/lib/blocks/tasa/TasaBanner';
import { TasaConceptos } from '@/shared/lib/blocks/tasa/TasaConceptos';
import { TasaVideo } from '@/shared/lib/blocks/compartidos/TasaVideo';
import { TasaDashboards } from '@/shared/lib/blocks/compartidos/TasaDashboards';
import { TasaPresentacion } from '@/shared/lib/blocks/compartidos/TasaPresentacion';
import { MatrizBanner } from '@/shared/lib/blocks/matriz/MatrizBanner';
import { EncuestaBanner } from '@/shared/lib/blocks/encuestas/EncuestaBanner';
import { SeccionCarrusel } from '@/shared/lib/blocks/compartidos/SeccionCarrusel';
import { ImagenDestacada } from '@/shared/lib/blocks/compartidos/ImagenDestacada';
import { TextoRico } from '@/shared/lib/blocks/compartidos/TextoRico';
import { TextoConImagen } from '@/shared/lib/blocks/compartidos/TextoConImagen';
import { DescargasConPresentacion } from '@/shared/lib/blocks/compartidos/DescargasConPresentacion';
import { RecursosVisualesBloque } from '@/shared/lib/blocks/inicio/RecursosVisualesBloque';
import { Publicaciones } from '@/shared/lib/blocks/inicio/Publicaciones';
import { PreguntasFrecuentes } from '@/shared/lib/blocks/inicio/PreguntasFrecuentes';
import { IconoBloque } from '@/shared/lib/blocks/compartidos/IconoBloque';
import {
  primitiveComponents,
  crearGridConfig,
  flexConfig,
  spaceConfig,
  conCaja,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
  campoColor,
  campoIcono,
} from '@olo/blocks-renderer';
import type { Config } from '@puckeditor/core';
import type { ComponentProps } from 'react';
import { ImageUploaderField } from '@/features/gestor-secciones/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/gestor-secciones/components/archivo-uploader-field';

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
    'Estructura': {
      components: ['IntranetTopbar', 'IntranetHero', 'IntranetFooter'],
    },
    'Texto e imagen': {
      components: ['TextoRico', 'TextoConImagen', 'ImagenDestacada'],
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
      components: ['Grid', 'Flex', 'Space'],
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
        brandText: { type: 'text', label: 'Texto de la Marca' },
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
            label: { type: 'text', label: 'Texto del enlace' },
            href: { type: 'text', label: 'URL (usa # si solo abre el submenú)' },
            children: {
              type: 'array',
              label: 'Submenú (déjalo vacío si no despliega)',
              arrayFields: {
                label: { type: 'text', label: 'Texto del enlace' },
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
        tituloInicio: { type: 'text', label: 'Título (primera línea)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita (segunda línea)' },
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
        titulo: { type: 'textarea', label: 'Título (usa ** para negrita, Intro para partir línea)' },
        imagenSrc: campoImagen('Ilustración'),
        imagenAlt: { type: 'text', label: 'Texto alternativo de la imagen' },
      },
      defaultProps: {
        titulo: 'Matriz de \n**PERTINENCIA**',
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
        antetitulo: { type: 'text', label: 'Línea superior' },
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
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
        titulo: 'SEGUIMIENTO LABORAL',
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
        titulo: { type: 'richtext', label: 'Título' },
        contenido: { type: 'richtext', label: 'Contenido' },
        fondo: campoFondo,
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
        titulo: '¿Qué es?',
        contenido: '<p>Escribe aquí el contenido de la sección.</p>',
        fondo: 'gris',
        colorTexto: '',
        ancho: 'estrecho',
      },
      render: (props: BlockRender<ComponentProps<typeof TextoRico>>) => <TextoRico {...props} />,
    },
    TextoConImagen: {
      label: 'Texto con imagen al lado',
      fields: {
        titulo: { type: 'richtext', label: 'Título' },
        contenido: { type: 'richtext', label: 'Contenido' },
        imagenSrc: campoImagen('Imagen (opcional si hay presentación)'),
        imagenAlt: { type: 'text', label: 'Texto alternativo' },
        pieDeImagen: { type: 'text', label: 'Leyenda bajo la imagen' },
        archivoUrl: {
          type: 'custom',
          label: 'Presentación PPTX (reemplaza la imagen)',
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir presentación"
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
        titulo: '¿Cuál es el <strong>objetivo</strong>?',
        contenido: '<p>Escribe aquí el contenido de la sección.</p>',
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
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
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
        titulo: '',
        imagenSrc: '',
        imagenAlt: '',
        ancho: 'completo',
        fondo: 'blanco',
        ajusteImagen: 'contain',
        redondeado: 'grande',
      },
      render: (props: BlockRender<ComponentProps<typeof ImagenDestacada>>) => (
        <ImagenDestacada {...props} />
      ),
    },
    // ─── Multimedia ───
    SeccionCarrusel: {
      label: 'Carrusel de imágenes',
      fields: {
        titulo: { type: 'richtext', label: 'Título' },
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
        titulo: '',
        imagenes: [],
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
        tituloInicio: { type: 'text', label: 'Título (primera parte)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita' },
        videoUrl: { type: 'text', label: 'Enlace del video de YouTube' },
        descargaTexto: { type: 'text', label: 'Texto sobre el botón de descarga (opcional)' },
        descargaEtiqueta: { type: 'text', label: 'Texto del botón' },
        descargaUrl: {
          type: 'custom',
          label: 'Archivo para descargar (opcional)',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
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
        descargaUrl: '',
      },
      render: (props: BlockRender<ComponentProps<typeof TasaVideo>>) => <TasaVideo {...props} />,
    },
    RecursosVisualesBloque: {
      label: 'Lista de videos',
      fields: {
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
        videos: {
          type: 'array',
          label: 'Videos',
          arrayFields: {
            youtubeId: { type: 'text', label: 'Identificador de YouTube (los 11 caracteres)' },
            titulo: { type: 'text', label: 'Título' },
            canal: { type: 'text', label: 'Canal' },
            miniatura: campoImagen('Miniatura propia (opcional)'),
          },
          getItemSummary: (item) => item.titulo || 'Video',
        },
      },
      defaultProps: {
        titulo: '**Recursos** visuales',
        videos: [],
      },
      render: (props: BlockRender<ComponentProps<typeof RecursosVisualesBloque>>) => (
        <RecursosVisualesBloque {...props} />
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
            titulo: { type: 'text', label: 'Título' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            urlPowerBi: { type: 'text', label: 'Enlace de Power BI (Publicar en la web)' },
          },
          getItemSummary: (item) => item.titulo || 'Tablero',
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
        tituloInicio: { type: 'text', label: 'Título (primera parte)' },
        tituloDestacado: { type: 'text', label: 'Título en negrita' },
        archivoUrl: {
          type: 'custom',
          label: 'Archivo de presentación',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir presentación"
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
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
        enlaces: {
          type: 'array',
          label: 'Enlaces',
          arrayFields: {
            etiqueta: { type: 'text', label: 'Texto del enlace' },
            url: { type: 'text', label: 'URL' },
          },
          getItemSummary: (item) => item.etiqueta || 'Enlace',
        },
        archivoUrl: {
          type: 'custom',
          label: 'Presentación al lado (opcional)',
          render: ({ value, onChange }) => (
            <ArchivoUploaderField
              value={value}
              onChange={onChange}
              accept=".pptx,.ppt"
              etiquetaBoton="Subir presentación"
            />
          ),
        },
      },
      defaultProps: {
        titulo: '**Descargas**',
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
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
        publicaciones: {
          type: 'array',
          label: 'Publicaciones',
          arrayFields: {
            titulo: { type: 'text', label: 'Título' },
            pdfUrl: {
              type: 'custom',
              label: 'Archivo PDF',
              render: ({ value, onChange }) => (
                <ArchivoUploaderField
                  value={value}
                  onChange={onChange}
                  accept=".pdf"
                  etiquetaBoton="Subir PDF"
                />
              ),
            },
            etiqueta: { type: 'text', label: 'Etiqueta (#OLOtecuenta)' },
            mes: { type: 'text', label: 'Mes' },
            dia: { type: 'text', label: 'Día' },
          },
          getItemSummary: (item) => item.titulo || 'Publicación',
        },
        porPagina: { type: 'number', label: 'Tarjetas visibles a la vez', min: 1, max: 6 },
      },
      defaultProps: {
        titulo: '**Ultimas** publicaciones',
        publicaciones: [],
        porPagina: 4,
      },
      render: (props: BlockRender<ComponentProps<typeof Publicaciones>>) => (
        <Publicaciones {...props} />
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
            titulo: { type: 'text', label: 'Título' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            imagenSrc: campoImagen('Imagen'),
            imagenAlt: { type: 'text', label: 'Texto alternativo' },
          },
          getItemSummary: (item) => item.titulo || 'Concepto',
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
        titulo: { type: 'text', label: 'Título (usa ** para negrita)' },
        tarjetas: {
          type: 'array',
          label: 'Tarjetas',
          arrayFields: {
            imagenSrc: campoImagen('Imagen'),
            imagenAlt: { type: 'text', label: 'Texto alternativo' },
            texto: { type: 'textarea', label: 'Texto de la tarjeta' },
            url: { type: 'text', label: 'Enlace (sin él, la tarjeta no es pulsable)' },
          },
          getItemSummary: (item) => item.texto || 'Tarjeta',
        },
      },
      defaultProps: {
        titulo: '**Preguntas** Frecuentes',
        tarjetas: [],
      },
      render: (props: BlockRender<ComponentProps<typeof PreguntasFrecuentes>>) => (
        <PreguntasFrecuentes {...props} />
      ),
    },
    IntranetFooter: {
      label: 'Pie de página',
      // El pie no tenía ni un campo: se ponía o se quitaba y punto, y para cambiar
      // un teléfono había que tocar el componente. Aquí está todo su contenido.
      fields: {
        fondo: campoColor('Color de fondo (opcional)'),
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
            titulo: { type: 'text', label: 'Título de la columna' },
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
                texto: { type: 'textarea', label: 'Texto (opcional si hay ícono)' },
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
              getItemSummary: (item) => item.texto || 'Línea',
            },
          },
          getItemSummary: (item) => item.titulo || 'Columna',
        },
      },
      // Repiten los valores por defecto del componente: el pie que se ve hoy. Sin
      // esto, arrastrar el bloque al lienzo daría un pie vacío en vez de uno que
      // ya trae el contenido bueno y solo hay que retocar.
      defaultProps: {
        fondo: '',
        logos: LOGOS_POR_DEFECTO,
        columnas: COLUMNAS_POR_DEFECTO,
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
        texto: { type: 'text', label: 'Texto descriptivo (opcional)' },
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
 * `app/(secciones)/layout.tsx` a partir de la página `plantilla`, y ofrecerlos
 * aquí dejaría volver a tener una barra distinta por sección, que es justo el
 * problema que se acaba de quitar. Siguen registrados en `puckConfig` porque
 * puede quedar contenido guardado que los use.
 */
const BLOQUES_COMUNES = [
  'IntranetHero',
  'TextoRico',
  'TextoConImagen',
  'ImagenDestacada',
  'SeccionCarrusel',
  'TasaVideo',
  'Grid',
  'Flex',
  'Space',
  'IconoBloque',
];

const COMPONENTES_POR_SLUG: Record<string, string[]> = {
  // La plantilla es lo contrario a una sección: solo la barra y el pie, que es
  // justo lo que las secciones ya no pueden tocar.
  'menu-y-pie': ['IntranetTopbar', 'IntranetFooter', 'IconoBloque'],
  inicio: [...BLOQUES_COMUNES, 'RecursosVisualesBloque', 'Publicaciones', 'PreguntasFrecuentes'],
  tasa: [...BLOQUES_COMUNES, 'TasaBanner', 'TasaConceptos', 'TasaDashboards', 'TasaPresentacion'],
  matriz: [
    ...BLOQUES_COMUNES,
    'MatrizBanner',
    'TasaDashboards',
    'TasaPresentacion',
    'DescargasConPresentacion',
  ],
  'encuestas-calidad-de-formacion': [
    ...BLOQUES_COMUNES,
    'EncuestaBanner',
    'DescargasConPresentacion',
    'TasaDashboards',
  ],
  'encuestas-seguimiento-laboral': [
    ...BLOQUES_COMUNES,
    'EncuestaBanner',
    'DescargasConPresentacion',
    'TasaDashboards',
  ],
};

/**
 * Los slugs que existen sin que nadie los haya creado.
 *
 * Son las claves de `COMPONENTES_POR_SLUG`, y no una lista aparte, porque son lo mismo
 * visto de dos maneras: una sección tiene catálogo recortado precisamente porque el
 * código sabe qué va en ella. Es el espejo de `SECCIONES_POR_AMBITO` en la API, que es
 * quien decide de verdad —aquí solo sirve para no pintar un botón de borrar que la API
 * va a rechazar—.
 */
export const SLUGS_DE_FABRICA = Object.keys(COMPONENTES_POR_SLUG);

/**
 * Si un slug es de fábrica. Las de fábrica no se pueden eliminar: hay código que da por
 * hecho que existen, y borrar `inicio` deja el portal sin portada.
 */
export const esSeccionDeFabrica = (slug: string): boolean => SLUGS_DE_FABRICA.includes(slug);

/**
 * Config para la mesa de trabajo de un slug.
 *
 * Solo la usa el editor. Para PINTAR una página hay que seguir usando
 * `puckConfig` entero: si un bloque guardado no está en la config con la que se
 * renderiza, Puck no sabe dibujarlo y la sección desaparece sin avisar.
 */
export function configDeEdicion(slug: string): Config {
  const permitidos = COMPONENTES_POR_SLUG[slug];
  if (!permitidos) return puckConfig;

  const components = Object.fromEntries(
    Object.entries(puckConfig.components).filter(([nombre]) => permitidos.includes(nombre))
  ) as Config['components'];

  const categories = Object.fromEntries(
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
  ) as Config['categories'];

  return { ...puckConfig, components, categories };
}