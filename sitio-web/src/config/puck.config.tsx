'use client';

import { useState, useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  primitiveComponents,
  crearGridConfig,
  conCaja,
  conCajaEnTodos,
  BLOQUES_SIN_CAJA,
  campoColor,
  TextoRico,
  ImagenDestacada,
  BotonPersonalizado,
  SeccionBotonesIcono,
  campoIcono,
  campoDestinoBoton,
} from '@olo/blocks-renderer';
import { ExternalPortals } from '@/shared/lib/blocks/ExternalPortals';
import { Services } from '@/shared/lib/blocks/Services';
import { DatoOloSemana } from '@/shared/lib/blocks/DatoOloSemana';
import { RecursosVisualesBloque } from '@/shared/lib/blocks/RecursosVisualesBloque';
import { Publicaciones } from '@/shared/lib/blocks/Publicaciones';
import { PoliticaPrivacidadEncabezado } from '@/shared/lib/blocks/PoliticaPrivacidadEncabezado';
import { VisorDocumentosNormativos, type DocumentoNormativo } from '@/shared/lib/blocks/VisorDocumentosNormativos';
import { CanalesAtencion, type CanalDeAtencion } from '@/shared/lib/blocks/CanalesAtencion';
import { Header } from '@/shared/lib/blocks/Header';
import { Footer } from '@/shared/lib/blocks/Footer';
import { IntranetTopbar } from '@/shared/lib/blocks/IntranetTopbar';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { defaultIdentidadVisual } from '@/features/identidad-visual/client';
import { HeroBuscadorOcupaciones } from '@/features/sitio-web/buscador-ocupaciones';
import { EditorjsWrapper } from '@/features/paginas/components/editorjs-wrapper';
import { ImageUploaderField } from '@/features/paginas/components/image-uploader-field';
import { ArchivoUploaderField } from '@/features/paginas/components/archivo-uploader-field';
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
  fields: {
    content: {
      type: 'custom' as const,
      render: ({ value, onChange }: CustomFieldRender<OutputData>) => (
        <EditorjsWrapper data={value} onChange={onChange} />
      ),
    },
  },
  defaultProps: { content: { blocks: [] } },
  render: ({ content }: BlockRender<{ content?: OutputData }>) => (
    <EditorjsWrapper data={content || { blocks: [] }} readOnly />
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
        'Publicaciones',
        'RichText',
        'PoliticaPrivacidadEncabezado',
        'VisorDocumentosNormativos',
        'CanalesAtencion',
      ],
    },
    'Texto e imagen': {
      components: ['TextoRico', 'ImagenDestacada'],
    },
    'Botones y enlaces': {
      components: ['BotonPersonalizado', 'SeccionBotonesIcono'],
    },
    'Portales': {
      components: ['ExternalPortals'],
    },
    'Maquetación': {
      components: ['Grid', 'Flex', 'Space', 'SeccionPestanasLaterales'],
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
    // Los pinta `app/(public)/layout.tsx` leyendo esa página, no el contenido de
    // cada sección: así el menú es uno solo para todo el sitio.
    Header: {
      label: 'Cabecera / Menú',
      fields: {
        govBannerEnabled: {
          type: 'radio',
          label: 'Mostrar franja superior GOV.CO',
          options: [
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ],
        },
        govBannerImageUrl: {
          type: 'custom',
          label: 'Imagen de la franja (opcional)',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        mainLogoUrl: {
          type: 'custom',
          label: 'Logo principal (opcional)',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
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
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
        },
        intranetText: { type: 'text', label: 'Texto del botón de intranet', contentEditable: true },
        intranetUrl: { type: 'text', label: 'URL de la intranet' },
      },
      // Los mismos valores que sirve `identidad-visual` cuando no hay plantilla:
      // arrastrar el bloque al lienzo da la cabecera que ya se ve hoy, no una vacía.
      defaultProps: { ...defaultIdentidadVisual },
      render: (props: BlockRender<Omit<ComponentProps<typeof Header>, 'block'>>) => (
        <Header {...props} block={{ id: props.id || 'header-preview' }} />
      ),
    },
    Footer: {
      // Sin campos a propósito: el pie todavía tiene su contenido escrito en el
      // JSX, así que aquí solo se decide si aparece o no. Parametrizarlo (como
      // `IntranetFooter` en la intranet) es una tanda aparte.
      label: 'Pie de página',
      render: (props: BlockRender<unknown>) => (
        <Footer block={{ id: props.id || 'footer-preview' }} />
      ),
    },
    IntranetTopbar: {
      label: 'Intranet Topbar',
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
        logoUrl: {
          type: 'custom',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        menuItems: {
          type: 'array',
          label: 'Menú de Navegación',
          arrayFields: {
            label: { type: 'text', label: 'Texto del enlace', contentEditable: true },
            href: { type: 'text', label: 'URL' },
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Enlace',
        },
      },
      defaultProps: {
        brandText: 'Intranet',
        // Igual al comportamiento de hoy (`.intranet-brand` en globals.css):
        // fila pegada a la izquierda, centrada verticalmente con el logo.
        alineacionMarca: { horizontal: 'flex-start', vertical: 'center' },
        logoUrl: '/assets/svg/olo-logo-blanco.svg',
        menuItems: [
          { href: "/intranet", label: "Inicio" },
          { href: "#", label: "Tasa de Vinculación y Empleabilidad" },
          { href: "#", label: "Matriz de Pertinencia" },
          { href: "#", label: "Encuestas" },
        ],
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetTopbar>>) => {
        return <IntranetTopbar {...props} />;
      },
    },
    IntranetHero: {
      label: 'Intranet Banner Principal',
      fields: {
        imageSrc: {
          type: 'custom',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        imageAlt: { type: 'text', label: 'Texto alternativo' },
      },
      defaultProps: {
        imageSrc: '/assets/img/banner1.png',
        imageAlt: 'Banner principal de la intranet',
      },
      render: (props: BlockRender<ComponentProps<typeof IntranetHero>>) => <IntranetHero {...props} />,
    },
    /**
     * Banner de la portada.
     *
     * Tres cosas que el bloque pintaba y el editor no dejaba tocar: el titular
     * —escrito a mano en el JSX de `OcupacionSearchBanner`—, la ilustración de
     * fondo (`modelSrc`) y el color del banner. El JSON guardado llegó a llevar
     * un prop `heading` con la frase del titular, pero no había campo que lo
     * editara ni render que lo leyera: se guardaba y se ignoraba.
     */
    Hero: {
      label: 'Buscador de Ocupaciones (Banner)',
      fields: {
        titulo: {
          type: 'richtext' as const,
          label: 'Titular sobre el buscador',
          contentEditable: true,
        },
        searchPlaceholder: {
          type: 'text' as const,
          label: 'Texto de ejemplo dentro del buscador',
          contentEditable: true,
        },
        imageUrl: campoImagen('Logo (esquina superior)'),
        imageAlt: {
          type: 'text' as const,
          label: 'Texto alternativo del logo',
        },
        modelSrc: campoImagen('Ilustración de fondo'),
        modelAlt: {
          type: 'text' as const,
          label: 'Texto alternativo de la ilustración',
        },
        // Campo personalizado que integra ColorPickerField para definir el color de fondo del banner 
        // (si se deja vacío, conserva el estilo CSS por defecto).
        colorFondo: campoColor('Color del banner'),
      },
      defaultProps: {
        id: 'hero-1',
        titulo:
          '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>',
        searchPlaceholder: 'Buscar ocupación, código o denominación',
        imageUrl: '/assets/img/nos-ocupa-el-pais.png',
        imageAlt: 'Nos ocupa el país',
        modelSrc: '/assets/img/modelo-uno.png',
        modelAlt: 'Modelo',
        colorFondo: '',
      },
      render: ({
        titulo,
        searchPlaceholder,
        imageUrl,
        imageAlt,
        modelSrc,
        modelAlt,
        colorFondo,
      }: BlockRender<{
        // `ReactNode` y no `string`: Puck convierte los campos `richtext` a nodos
        // antes de llamar al render, igual que en `TextoRico` de la intranet.
        titulo?: ReactNode;
        searchPlaceholder?: string;
        imageUrl?: string;
        imageAlt?: string;
        modelSrc?: string;
        modelAlt?: string;
        colorFondo?: string;
      }>) => (
        <HeroBuscadorOcupaciones
          titulo={titulo}
          searchPlaceholder={searchPlaceholder}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          modelSrc={modelSrc}
          modelAlt={modelAlt}
          colorFondo={colorFondo}
        />
      ),
    },
    Services: {
      label: 'Servicios',
      fields: {
        sectionTitle: {
          type: 'text' as const,
          label: 'Título de la sección',
          contentEditable: true,
        },
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
        services,
      }: {
        id: string;
        sectionTitle?: ReactNode;
        services?: { id: string; title: ReactNode; description: ReactNode }[];
      }) => (
        <Services
          block={{ id: id || 'services-preview' }}
          sectionTitle={sectionTitle}
          services={services}
        />
      ),
    },
    DatoOloSemana: {
      label: 'Dato OLO de la semana',
      fields: {
        tituloResaltado: {
          type: 'text' as const,
          label: 'Título (parte destacada)',
          contentEditable: true,
        },
        tituloNormal: {
          type: 'text' as const,
          label: 'Título (resto)',
          contentEditable: true,
        },
        imagenSrc: {
          type: 'custom',
          label: 'Infografía del dato',
          render: ({ value, onChange }: CustomFieldRender<string>) => (
            <ImageUploaderField value={value} onChange={onChange} />
          ),
        },
        imagenAlt: {
          type: 'text' as const,
          label: 'Texto alternativo de la imagen',
        },
      },
      defaultProps: {
        id: 'dato-olo-semana-1',
        tituloResaltado: 'Dato OLO',
        tituloNormal: 'de la semana',
        imagenSrc: '/assets/img/dato-olo-semana.png',
        imagenAlt: 'Dato OLO de la semana',
      },
      render: ({
        id,
        tituloResaltado,
        tituloNormal,
        imagenSrc,
        imagenAlt,
      }: {
        id: string;
        tituloResaltado?: ReactNode;
        tituloNormal?: ReactNode;
        imagenSrc?: string;
        imagenAlt?: string;
      }) => (
        <DatoOloSemana
          block={{ id: id || 'dato-olo-semana-preview' }}
          tituloResaltado={tituloResaltado}
          tituloNormal={tituloNormal}
          imagenSrc={imagenSrc}
          imagenAlt={imagenAlt}
        />
      ),
    },
    RecursosVisualesBloque: {
      label: 'Recursos Visuales',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título', contentEditable: true },
        videos: {
          type: 'array' as const,
          label: 'Videos',
          arrayFields: {
            youtubeId: { type: 'text' as const, label: 'Identificador de YouTube (los 11 caracteres)' },
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
          getItemSummary: (item: { titulo?: string }) => item.titulo || 'Video',
        },
      },
      defaultProps: {
        id: 'recursos-visuales-1',
        titulo: '<p><strong>Recursos</strong> visuales</p>',
        videos: [],
      },
      render: ({
        id,
        titulo,
        videos,
      }: BlockRender<{
        titulo?: ReactNode;
        videos?: { youtubeId?: string; titulo?: ReactNode; canal?: ReactNode; miniatura?: string }[];
      }>) => (
        <RecursosVisualesBloque
          block={{ id: id || 'recursos-visuales-preview' }}
          titulo={titulo}
          videos={videos}
        />
      ),
    },
    Publicaciones: {
      label: 'Últimas publicaciones',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título', contentEditable: true },
        publicaciones: {
          type: 'array' as const,
          label: 'Publicaciones',
          arrayFields: {
            titulo: { type: 'text' as const, label: 'Título', contentEditable: true },
            pdfUrl: {
              type: 'custom',
              label: 'Archivo PDF',
              render: ({ value, onChange }: CustomFieldRender<string>) => (
                <ArchivoUploaderField
                  value={value}
                  onChange={onChange}
                  accept=".pdf"
                  etiquetaBoton="Subir PDF"
                />
              ),
            },
            etiqueta: { type: 'text' as const, label: 'Etiqueta (#OLOtecuenta)', contentEditable: true },
            mes: { type: 'text' as const, label: 'Mes', contentEditable: true },
            dia: { type: 'text' as const, label: 'Día', contentEditable: true },
          },
          getItemSummary: (item: { titulo?: string }) => item.titulo || 'Publicación',
        },
        porPagina: { type: 'number' as const, label: 'Tarjetas visibles a la vez', min: 1, max: 6 },
      },
      defaultProps: {
        id: 'publicaciones-1',
        titulo: '<p><strong>Ultimas</strong> publicaciones</p>',
        publicaciones: [],
        porPagina: 4,
      },
      render: ({
        id,
        titulo,
        publicaciones,
        porPagina,
      }: BlockRender<{
        titulo?: ReactNode;
        publicaciones?: { titulo?: ReactNode; pdfUrl?: string; etiqueta?: ReactNode; mes?: ReactNode; dia?: ReactNode }[];
        porPagina?: number;
      }>) => (
        <Publicaciones
          block={{ id: id || 'publicaciones-preview' }}
          titulo={titulo}
          publicaciones={publicaciones}
          porPagina={porPagina}
        />
      ),
    },
    PoliticaPrivacidadEncabezado: {
      label: 'Encabezado de política',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título (h1 de la página)', contentEditable: true },
        intro: { type: 'richtext' as const, label: 'Párrafos de introducción', contentEditable: true },
      },
      defaultProps: {
        id: 'politica-encabezado-1',
        titulo: 'Políticas de Seguridad, Privacidad y Tratamiento de Datos',
        intro:
          '<p>El <strong>Servicio Nacional de Aprendizaje SENA</strong>, a través del <strong>Observatorio Laboral y Ocupacional</strong>, dispone para consulta ciudadana los lineamientos oficiales de la Política de Seguridad y Privacidad de la Información y la Política de Tratamiento para Protección de Datos Personales, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Sistema de Gestión CompromISO.</p><p>A continuación, seleccione el documento normativo que desea consultar para leerlo directamente en formato PDF o descargar una copia oficial.</p>',
      },
      render: ({
        id,
        titulo,
        intro,
      }: BlockRender<{ titulo?: ReactNode; intro?: ReactNode }>) => (
        <PoliticaPrivacidadEncabezado
          block={{ id: id || 'politica-encabezado-preview' }}
          titulo={titulo}
          intro={intro}
        />
      ),
    },
    VisorDocumentosNormativos: {
      label: 'Visor de documentos normativos',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título de la sección', contentEditable: true },
        documentos: {
          type: 'array' as const,
          label: 'Documentos',
          arrayFields: {
            etiquetaTab: { type: 'text' as const, label: 'Texto de la pestaña', contentEditable: true },
            titulo: { type: 'text' as const, label: 'Título del documento', contentEditable: true },
            descripcion: { type: 'text' as const, label: 'Descripción breve', contentEditable: true },
            documentoId: { type: 'text' as const, label: 'ID en CompromISO SENA (ej. 6701)' },
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
        documentos,
      }: BlockRender<{ titulo?: ReactNode; documentos?: DocumentoNormativo[] }>) => (
        <VisorDocumentosNormativos
          block={{ id: id || 'visor-documentos-preview' }}
          titulo={titulo}
          documentos={documentos}
        />
      ),
    },
    CanalesAtencion: {
      label: 'Canales de atención',
      fields: {
        titulo: { type: 'richtext' as const, label: 'Título de la sección', contentEditable: true },
        intro: { type: 'richtext' as const, label: 'Párrafo de introducción', contentEditable: true },
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
        canales,
      }: BlockRender<{ titulo?: ReactNode; intro?: ReactNode; canales?: CanalDeAtencion[] }>) => (
        <CanalesAtencion
          block={{ id: id || 'canales-atencion-preview' }}
          titulo={titulo}
          intro={intro}
          canales={canales}
        />
      ),
    },
    ExternalPortals: {
      label: 'Portales Externos',
      fields: {
        title: {
          type: 'richtext' as const,
          label: 'Título de la sección',
          contentEditable: true,
        },
        subtitle: {
          type: 'text' as const,
          label: 'Subtítulo (opcional)',
          contentEditable: true,
        },
        portals: {
          type: 'array' as const,
          label: 'Lista de portales',
          arrayFields: {
            id: { type: 'text' as const, label: 'Identificador' },
            label: { type: 'text' as const, label: 'Etiqueta', contentEditable: true },
            description: { type: 'richtext' as const, label: 'Descripción', contentEditable: true },
            href: { type: 'text' as const, label: 'URL de destino' },
            imagen: campoImagen('Ilustración de fondo (se pinta al 60%)'),
            /**
             * El degradado de la tarjeta, en dos colores en vez de una línea de CSS.
             *
             * Antes era un campo de texto donde había que escribir
             * `linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)` a mano: sintaxis
             * de programador en un panel que usa un funcionario, y un paréntesis
             * mal cerrado deja la tarjeta sin fondo sin decir por qué.
             *
             * `gradient` se conserva como respaldo para las tarjetas ya guardadas
             * que todavía no tengan los dos colores; ver `ExternalPortals.tsx`.
             */
            colorInicio: campoColor('Color del degradado · arriba'),
            colorFin: campoColor('Color del degradado · abajo'),
            gradient: { type: 'text' as const, label: 'Degradado CSS (heredado, opcional)' },
          },
          defaultItemProps: {
            id: 'nuevo-portal',
            label: 'Nuevo portal',
            description: '<p>Descripción del portal.</p>',
            href: '#',
            imagen: '',
            colorInicio: '#0b4ea2',
            colorFin: '#0a2f6b',
          },
          getItemSummary: (item: { label?: string }) => item.label || 'Portal',
        },
      },
      defaultProps: {
        id: 'portals-1',
        title: '<p><strong>Portales externos</strong> de la ciudadanía</p>',
        subtitle: '',
        portals: [
          {
            id: 'pqrs',
            label: 'PQRS',
            description:
              '<p><strong>Registrar tus peticiones, quejas, reclamos y sugerencias</strong>. Tu participación es fundamental para seguir mejorando.</p>',
            href: '#',
            imagen: '/assets/img/pqrs.png',
            colorInicio: '#0b4ea2',
            colorFin: '#0a2f6b',
          },
          {
            id: 'denuncias',
            label: 'Denuncias por corrupción',
            description:
              '<p><strong>Reportar actos de corrupción</strong> por un canal seguro. Tu identidad será protegida en todo momento.</p>',
            href: '#',
            imagen: '/assets/img/corrupcion.png',
            colorInicio: '#0d1526',
            colorFin: '#1a2e50',
          },
          {
            id: 'transparencia',
            label: 'Transparencia',
            description:
              '<p><strong>Consultar información pública</strong> y datos abiertos del observatorio, con rendición de cuentas al día.</p>',
            href: '#',
            imagen: '/assets/img/transparencia.png',
            colorInicio: '#1478c6',
            colorFin: '#0d4f8b',
          },
        ],
      },
      render: ({
        id,
        title,
        subtitle,
        portals,
      }: {
        id: string;
        title?: ReactNode;
        subtitle?: ReactNode;
        portals?: {
          id: string;
          label: ReactNode;
          description: ReactNode;
          href: string;
          gradient?: string;
          colorInicio?: string;
          colorFin?: string;
          imagen?: string;
        }[];
      }) => (
        <ExternalPortals
          block={{ id: id || 'portals-preview' }}
          title={title}
          subtitle={subtitle}
          portals={portals}
        />
      ),
    },
    // ─── Texto e imagen ───
    TextoRico: {
      label: 'Texto con formato',
      fields: {
        titulo: { type: 'richtext', label: 'Título', contentEditable: true },
        contenido: { type: 'richtext', label: 'Contenido', contentEditable: true },
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
    ImagenDestacada: {
      label: 'Imagen destacada',
      fields: {
        titulo: { type: 'richtext', label: 'Título', contentEditable: true },
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
        titulo: { type: 'text', label: 'Título de la sección (opcional)', contentEditable: true },
        subtitulo: { type: 'textarea', label: 'Descripción / Subtítulo (opcional)' },
        columnas: {
          type: 'radio',
          label: 'Columnas en escritorio',
          options: [
            { label: '1 columna', value: 1 },
            { label: '2 columnas', value: 2 },
            { label: '3 columnas', value: 3 },
            { label: '4 columnas', value: 4 },
          ],
        },
        items: {
          type: 'slot',
          allow: ['BotonPersonalizado'],
        },
      },
      defaultProps: {
        titulo: '',
        subtitulo: '',
        columnas: 3,
        items: [],
      },
      render: (props: BlockRender<ComponentProps<typeof SeccionBotonesIcono>>) => (
        <SeccionBotonesIcono {...props} />
      ),
    },
    // Bloque de texto enriquecido — usa EditorJS internamente
    RichText: RichTextBlock,
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
  components: conCajaEnTodos(puckConfigBase.components, { excepto: BLOQUES_SIN_CAJA }),
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
 * `Header` y `Footer` NO están en `inicio`: los pinta `app/(public)/layout.tsx` a
 * partir de la página `plantilla`, y ofrecerlos en una sección dejaría volver a
 * tener una cabecera distinta por página, que es justo lo que se acaba de quitar.
 */
/**
 * La página que guarda la cabecera y el pie comunes.
 *
 * Espejo de `SLUG_PLANTILLA` en `features/paginas/lib/plantilla.ts`. No se importa de
 * allí para no atar el catálogo de bloques a una feature: aquí solo hace falta el
 * literal, y si algún día cambia, cambia en los dos sitios.
 */
const SLUG_DE_PLANTILLA = 'menu-y-pie';

const BLOQUES_PAGINA_SITIO_DEFECTO: string[] = [
  'Hero',
  'Services',
  'DatoOloSemana',
  'RecursosVisualesBloque',
  'Publicaciones',
  'RichText',
  'PoliticaPrivacidadEncabezado',
  'VisorDocumentosNormativos',
  'CanalesAtencion',
  'TextoRico',
  'ImagenDestacada',
  'ExternalPortals',
  'Grid',
  'Flex',
  'Space',
  'SeccionPestanasLaterales',
  'BotonPersonalizado',
  'SeccionBotonesIcono',
];

const COMPONENTES_POR_SLUG: Record<string, string[]> = {
  // La plantilla es lo contrario a una página: solo la cabecera y el pie, que es
  // justo lo que las páginas ya no pueden tocar.
  [SLUG_DE_PLANTILLA]: ['Header', 'Footer'],
  inicio: [
    'Hero',
    'Services',
    'DatoOloSemana',
    'RecursosVisualesBloque',
    'Publicaciones',
    'ExternalPortals',
    'RichText',
    'TextoRico',
    'ImagenDestacada',
    'Grid',
    'Flex',
    'Space',
    'SeccionPestanasLaterales',
    'BotonPersonalizado',
    'SeccionBotonesIcono',
  ],
  'politica-de-privacidad': ['PoliticaPrivacidadEncabezado', 'VisorDocumentosNormativos', 'CanalesAtencion'],
};

/**
 * Lo que el lienzo enseña alrededor de lo que se está editando.
 *
 * Son datos YA PUBLICADOS que se pintan de contexto: lo mismo que ve quien visita
 * el sitio. Los resuelve el Server Component del editor y llegan hasta aquí por
 * props — ver `app/admin/editor/[slug]/page.tsx`.
 */
export interface ContextoDeEdicion {
  /** Cabecera y pie publicados. Se usa al editar una página normal. */
  plantilla?: {
    cabecera?: Omit<ComponentProps<typeof Header>, 'block'> | null;
    /** El pie no tiene campos: solo se pone o se quita. */
    pie?: boolean;
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
  // Las páginas creadas a mano reciben el catálogo de bloques de contenido de sitio,
  // nunca los bloques de 'Plantilla' (Header/Footer), que solo se ofrecen en 'menu-y-pie'.
  const permitidos = COMPONENTES_POR_SLUG[slug] ?? BLOQUES_PAGINA_SITIO_DEFECTO;

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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
              <Footer block={{ id: 'contexto-footer' }} />
            </Inerte>
          )}
        </div>
      ),
    } as Config['root'],
  };
}
