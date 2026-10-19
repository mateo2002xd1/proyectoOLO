/**
 * Panel del bloque «Pie de página» en el editor: los campos agrupados en tarjetas
 * (acordeones) por lo que tienen en común, en vez de treinta campos sueltos.
 *
 * El pie publicado, `obtenerPlantilla` y `Footer` leen las props sueltas de siempre
 * (`logoSenaUrl`, `direccion`…). Para no migrar nada, cada tarjeta guarda su grupo
 * (`grupoLogos`…) y `resolverGruposDelPie` lo copia a esas props en cada cambio; al
 * abrir un pie guardado antes de las tarjetas, arma los grupos desde ellas. Las
 * props sueltas siguen siendo la fuente para todo lo que no es el panel.
 *
 * No importa nada de `@/features/paginas` ni de `header.tsx`: lo usa
 * `puck.config.tsx` al cargarse (ver `tamanos-texto-menu.ts`).
 */

import {
  campoGrupoEnUnAcordeon,
  campoListaEnAcordeones,
  type CampoDeAcordeon,
} from '@olo/blocks-renderer';
import { ALINEACIONES_FRANJA, SEPARACIONES_FRANJA } from '@/shared/lib/blocks/disposicion-de-franja';
import { resolverGruposDeProps } from './grupos-de-props';

type FabricaImagen = (label: string) => CampoDeAcordeon;

const alt = (de: string): CampoDeAcordeon => ({
  type: 'text',
  label: `Texto alternativo ${de}`,
  ayuda: 'Describe la imagen para quien usa lector de pantalla.',
});

/** Cada tarjeta: su título y sus campos, por la prop suelta que escribe cada uno. */
function gruposDelPie(campoImagen: FabricaImagen): Record<string, { titulo: string; campos: Record<string, CampoDeAcordeon> }> {
  return {
    grupoColores: {
      titulo: 'Colores',
      campos: {
        colorFondoSuperior: { type: 'color', label: 'Fondo de la zona alta', ayuda: 'Vacío deja el de siempre.' },
        colorFondo: { type: 'color', label: 'Fondo de la zona baja' },
        colorTarjeta: { type: 'color', label: 'Color de la tarjeta (interior)' },
      },
    },
    grupoLogos: {
      titulo: 'Logos',
      campos: {
        logoSenaUrl: campoImagen('Logo del SENA'),
        logoSenaAlt: alt('del logo del SENA'),
        logoOloUrl: campoImagen('Logo del OLO (horizontal)'),
        logoOloAlt: alt('del logo del OLO'),
        separadorLogos: { type: 'text', label: 'Símbolo entre los dos logos', placeholder: '|' },
        tamanoSeparadorLogos: {
          type: 'select',
          label: 'Tamaño del símbolo',
          options: [20, 25, 30, 35, 40].map((v) => ({ label: `${v} px`, value: v })),
        },
        logoMintrabajoUrl: campoImagen('Logo del Ministerio del Trabajo'),
        logoMintrabajoAlt: alt('del logo del Ministerio'),
      },
    },
    grupoEntidad: {
      titulo: 'Entidad y dirección',
      campos: {
        nombreEntidad: { type: 'text', label: 'Nombre de la entidad' },
        direccion: { type: 'textarea', label: 'Dirección' },
        atencionPresencial: { type: 'textarea', label: 'Atención presencial' },
        puntosAtencionTexto: { type: 'textarea', label: 'Texto del enlace a puntos de atención' },
        puntosAtencionUrl: { type: 'text', label: 'Hipervínculo de puntos de atención', placeholder: 'https://…' },
      },
    },
    grupoWhatsapp: {
      titulo: 'WhatsApp',
      campos: {
        whatsappTitulo: { type: 'text', label: 'Título' },
        whatsappNumero: { type: 'textarea', label: 'Número' },
      },
    },
    grupoLineasAtencion: {
      titulo: 'Líneas de atención y PQRS',
      campos: {
        lineasAtencionTitulo: { type: 'text', label: 'Título' },
        lineasAtencionTexto: { type: 'textarea', label: 'Líneas y teléfonos' },
      },
    },
    grupoMesaAyuda: {
      titulo: 'Mesa de ayuda',
      campos: {
        mesaAyudaTitulo: { type: 'text', label: 'Título' },
        mesaAyudaTelefono: { type: 'textarea', label: 'Teléfono / PBX' },
        mesaAyudaEmail: { type: 'textarea', label: 'Correo' },
      },
    },
    grupoHorario: {
      titulo: 'Horario de atención',
      campos: {
        horarioTitulo: { type: 'text', label: 'Título' },
        horarioTexto: { type: 'textarea', label: 'Horario' },
      },
    },
    grupoCertificacion: {
      titulo: 'Sello de certificación',
      campos: {
        certificacionImgUrl: campoImagen('Imagen del sello'),
        certificacionImgAlt: alt('del sello'),
      },
    },
    grupoFranjaGov: {
      titulo: 'Franja GOV.CO inferior',
      campos: {
        mostrarFranjaGov: {
          type: 'radio',
          label: 'Franja',
          options: [
            { label: 'Mostrar', value: true },
            { label: 'Ocultar', value: false },
          ],
        },
        colorFranjaGov: {
          type: 'color',
          label: 'Color de fondo',
          ayuda: 'Vacío: franja blanca con la marca en azul. Con un fondo oscuro, la marca pasa a blanco sola.',
        },
        alineacionFranjaGov: {
          type: 'radio',
          label: 'Alineación de las imágenes',
          options: Object.entries(ALINEACIONES_FRANJA).map(([value, { label }]) => ({ label, value })),
          ayuda: 'Si no hay ninguna marcada, van a la izquierda.',
        },
        separacionFranjaGov: {
          type: 'select',
          label: 'Separación entre las imágenes',
          options: [
            { label: 'La de siempre (12 px)', value: '' },
            ...Object.entries(SEPARACIONES_FRANJA).map(([value, { label }]) => ({ label, value })),
          ],
          ayuda: 'Se adapta a la pantalla: más estrecha en el celular y más amplia en el computador.',
        },
        rutaCoImgUrl: campoImagen('Distintivo de Colombia'),
        rutaCoImgAlt: alt('del distintivo'),
        rutaCoMargenArriba: { type: 'number', label: 'Margen arriba', min: 0, max: 40, sufijo: 'px', placeholder: '7' },
        rutaCoMargenAbajo: {
          type: 'number',
          label: 'Margen abajo',
          min: 0,
          max: 40,
          sufijo: 'px',
          placeholder: '7',
          ayuda: 'La franja mide 40 px de alto: más margen arriba y abajo achica la imagen. Vacío usa el valor de siempre.',
        },
        govCoImgUrl: {
          ...campoImagen('Imagen de GOV.CO'),
          ayuda: 'La marca GOV.CO de la franja; enlaza a gov.co. Sin imagen, no se muestra.',
        },
        govCoImgAlt: {
          type: 'text',
          label: 'Nombre del enlace a GOV.CO',
          ayuda: 'Lo que dice un lector de pantalla al llegar al enlace.',
        },
        govCoMargenArriba: { type: 'number', label: 'Margen arriba', min: 0, max: 40, sufijo: 'px', placeholder: '10' },
        govCoMargenAbajo: {
          type: 'number',
          label: 'Margen abajo',
          min: 0,
          max: 40,
          sufijo: 'px',
          placeholder: '10',
          ayuda: 'La franja mide 40 px de alto: más margen arriba y abajo achica la imagen. Vacío usa el valor de siempre.',
        },
      },
    },
  };
}

const REDES_SOCIALES = [
  { label: 'X (Twitter)', value: 'x' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Radio SENA', value: 'radio' },
  { label: 'Otro / personalizado', value: 'otro' },
];

const camposEnlace: Record<string, CampoDeAcordeon> = {
  texto: { type: 'text', label: 'Texto del enlace' },
  url: { type: 'text', label: 'Hipervínculo', placeholder: '/ruta o https://…' },
};

const listaDeEnlaces = (fila: number) =>
  campoListaEnAcordeones(`Enlaces inferiores · fila ${fila}`, camposEnlace, {
    elemento: 'Enlace',
    nuevo: { texto: '', url: '' },
    resumen: (item) => item.texto || 'Sin texto',
  });

/**
 * Los `fields` del bloque, en el orden del pie: de arriba abajo. Las tarjetas de
 * grupo y las listas (redes y enlaces) llevan los mismos controles con borde.
 */
export function crearCamposDelPie(campoImagen: FabricaImagen) {
  const grupos = gruposDelPie(campoImagen);
  const tarjeta = (clave: string) => campoGrupoEnUnAcordeon(grupos[clave].titulo, grupos[clave].campos);

  return {
    grupoColores: tarjeta('grupoColores'),
    grupoLogos: tarjeta('grupoLogos'),
    grupoEntidad: tarjeta('grupoEntidad'),
    grupoWhatsapp: tarjeta('grupoWhatsapp'),
    grupoLineasAtencion: tarjeta('grupoLineasAtencion'),
    grupoMesaAyuda: tarjeta('grupoMesaAyuda'),
    grupoHorario: tarjeta('grupoHorario'),
    redesSociales: campoListaEnAcordeones(
      'Redes sociales',
      {
        red: { type: 'select', label: 'Red social / ícono', options: REDES_SOCIALES },
        nombre: { type: 'text', label: 'Nombre o usuario (@…)' },
        url: { type: 'text', label: 'Hipervínculo del perfil', placeholder: 'https://…' },
        iconoPersonalizado: {
          type: 'text',
          label: 'Ícono propio',
          ayuda: 'Solo si la red es «Otro / personalizado»: la ruta o URL del ícono.',
        },
      },
      {
        elemento: 'Red social',
        nuevo: { red: 'x', nombre: '', url: '', iconoPersonalizado: '' },
        resumen: (item) => item.nombre || REDES_SOCIALES.find((r) => r.value === item.red)?.label || 'Sin nombre',
      }
    ),
    grupoCertificacion: tarjeta('grupoCertificacion'),
    enlacesFila1: listaDeEnlaces(1),
    enlacesFila2: listaDeEnlaces(2),
    enlacesFila3: listaDeEnlaces(3),
    grupoFranjaGov: tarjeta('grupoFranjaGov'),
  };
}

/** Qué props sueltas escribe cada tarjeta. Solo depende de las claves, no de `campoImagen`. */
const CLAVES_POR_GRUPO: Record<string, string[]> = Object.fromEntries(
  Object.entries(gruposDelPie((label) => ({ type: 'text', label }))).map(([grupo, { campos }]) => [
    grupo,
    Object.keys(campos),
  ])
);

/** `resolveData` del bloque: grupos ⇄ props sueltas (ver `grupos-de-props.ts`). */
export function resolverGruposDelPie({ props }: { props: Record<string, any> }) {
  return { props: resolverGruposDeProps(props, CLAVES_POR_GRUPO) };
}
