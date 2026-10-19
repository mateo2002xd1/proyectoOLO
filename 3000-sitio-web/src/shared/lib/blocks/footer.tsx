import type { CSSProperties, ReactNode } from 'react';
import { estiloDeFranjaGov } from './tinta-de-franja';
import { ALINEACIONES_FRANJA, SEPARACIONES_FRANJA, rellenoDeImagenDeFranja } from './disposicion-de-franja';

export interface RedSocialItem {
  red: 'x' | 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'radio' | 'otro';
  nombre: string;
  url: string;
  iconoPersonalizado?: string;
}

export interface EnlacePieItem {
  texto: string;
  url: string;
}

export interface FooterLogosProps {
  footerPersonalizado?: boolean;
  logoSenaUrl?: string;
  logoSenaAlt?: string;
  logoOloUrl?: string;
  logoOloAlt?: string;
  /** Símbolo de separación entre el logo SENA y OLO. Si está vacío, no se pinta nada. */
  separadorLogos?: string;
  /** Tamaño del separador en píxeles. */
  tamanoSeparadorLogos?: number;
  logoMintrabajoUrl?: string;
  logoMintrabajoAlt?: string;
}

export interface FooterInstitucionalProps {
  nombreEntidad?: string;
  direccion?: string;
  atencionPresencial?: string;
  puntosAtencionTexto?: string;
  puntosAtencionUrl?: string;
  whatsappTitulo?: string;
  whatsappNumero?: string;
  lineasAtencionTitulo?: string;
  lineasAtencionTexto?: string;
  mesaAyudaTitulo?: string;
  mesaAyudaTelefono?: string;
  mesaAyudaEmail?: string;
  horarioTitulo?: string;
  horarioTexto?: string;
  colorFondo?: string;
  colorFondoSuperior?: string;
  colorTarjeta?: string;
}

export interface FooterProps extends FooterLogosProps, FooterInstitucionalProps {
  block?: { id: string };
  // Redes sociales y certificaciones
  redesSociales?: RedSocialItem[];
  certificacionImgUrl?: string;
  certificacionImgAlt?: string;
  // Enlaces inferiores (filas)
  enlacesFila1?: EnlacePieItem[];
  enlacesFila2?: EnlacePieItem[];
  enlacesFila3?: EnlacePieItem[];
  // Franja GOV.CO inferior
  mostrarFranjaGov?: boolean;
  rutaCoImgUrl?: string;
  rutaCoImgAlt?: string;
  /** Fondo de la franja GOV.CO inferior; vacío la deja blanca con la marca en azul (ver `tinta-de-franja.ts`). */
  colorFranjaGov?: string;
  /** Marca GOV.CO subida; vacía, la franja no la muestra (ya no va dibujada en el código). */
  govCoImgUrl?: string;
  govCoImgAlt?: string;
  /** Relleno en px arriba y abajo de la caja de cada imagen: achica la imagen sin agrandar la franja. */
  rutaCoMargenArriba?: number | '';
  rutaCoMargenAbajo?: number | '';
  govCoMargenArriba?: number | '';
  govCoMargenAbajo?: number | '';
  /** Clave de `ALINEACIONES_FRANJA`; vacío = izquierda. */
  alineacionFranjaGov?: string;
  /** Clave de `SEPARACIONES_FRANJA` (espacio entre las imágenes); vacío = 12 px del CSS. */
  separacionFranjaGov?: string;
}

export const VALORES_PIE_POR_DEFECTO: Required<Omit<FooterProps, 'block'>> = {
  footerPersonalizado: false,
  colorFondo: '',
  colorFondoSuperior: '',
  colorTarjeta: '',
  logoSenaUrl: '/assets/logos/logo-sena.svg',
  logoSenaAlt: 'Logotipo oficial del SENA con la palabra SENA y simbolo institucional en color verde, presentado en la cabecera del pie de pagina de un sitio gubernamental educativo',
  logoOloUrl: '/assets/logos/olo-logo-horizontal.svg',
  logoOloAlt: 'Logotipo horizontal del Observatorio Laboral y Ocupacional con el texto Observatorio Laboral y Ocupacional, ubicado junto al logo del SENA en la parte superior del pie de pagina',
  separadorLogos: '|',
  tamanoSeparadorLogos: 30,
  logoMintrabajoUrl: '/assets/img/mintrabajo.webp',
  logoMintrabajoAlt: 'Logotipo del Ministerio del Trabajo de Colombia con texto institucional, mostrado en el extremo derecho de la franja superior del pie de pagina en un contexto oficial',

  nombreEntidad: 'Servicio Nacional de Aprendizaje SENA',
  direccion: 'Direccion: Calle 57 No. 8 - 69 Bogota D.C. (Cundinamarca), Colombia.',
  atencionPresencial: 'El SENA brinda a la ciudadania, atencion presencial en las 33 Regionales y 118 Centros de Formacion',
  puntosAtencionTexto: 'Conozca aqui los puntos de atencion',
  puntosAtencionUrl: '#',

  whatsappTitulo: 'Linea de WhatsApp:',
  whatsappNumero: '3112545028',

  lineasAtencionTitulo: 'Lineas de atencion al ciudadanos, empresarios y linea PQRS:',
  lineasAtencionTexto: 'Bogota +(57) 601 736 60 60 - Linea gratuita y resto del pais 018000 910270',

  mesaAyudaTitulo: 'Mesa de ayuda:',
  mesaAyudaTelefono: 'PBX (+57) 1 5461500 IP: 13037',
  mesaAyudaEmail: 'olaboralyocupacional@sena.edu.co',

  horarioTitulo: 'Horario de atencion:',
  horarioTexto: 'Lunes a viernes de 8:00 am a 5:30 pm',

  redesSociales: [
    { red: 'x', nombre: '@SENAComunica', url: 'https://x.com/SENAComunica' },
    { red: 'facebook', nombre: '@SENA', url: 'https://www.facebook.com/SENA/?locale=es_LA' },
    { red: 'instagram', nombre: '@senacomunica', url: 'https://www.instagram.com/senacomunica/?hl=es-la' },
    { red: 'youtube', nombre: '@SENATV', url: 'https://www.youtube.com/@SENAComunica' },
    { red: 'linkedin', nombre: '@SENA', url: 'https://www.linkedin.com/school/servicio-nacional-de-aprendizaje-sena-/posts/?feedView=all' },
    { red: 'radio', nombre: '@senacolombia', url: 'https://sonic.paulatina.co/8176/stream' },
  ],

  certificacionImgUrl: '/assets/img/icontec.png',
  certificacionImgAlt: 'Sello de certificacion ICONTEC con texto de certificacion visible, presentado en la seccion de certificaciones del pie de pagina para transmitir cumplimiento y confianza institucional',

  enlacesFila1: [
    { texto: 'Directorio SENA', url: '#' },
    { texto: 'Chat en linea', url: '#' },
    { texto: 'Notificaciones judiciales', url: '#' },
    { texto: 'Terminos y condiciones del portal web', url: '#' },
  ],
  enlacesFila2: [
    { texto: 'Derechos de autor y/o autorizacion de uso sobre contenidos', url: '#' },
    { texto: 'Politica de Tratamiento para Proteccion de Datos Personales', url: '/politica-de-privacidad' },
  ],
  enlacesFila3: [
    { texto: 'Mapa del sitio', url: '#' },
    { texto: 'Politica de seguridad y privacidad de la informacion', url: '/politica-de-privacidad' },
  ],

  mostrarFranjaGov: true,
  rutaCoImgUrl: '/assets/img/ruta-co-colombia.png',
  rutaCoImgAlt: 'Marca pais de Colombia con el texto CO Colombia, ubicada en la franja inferior del sitio junto al distintivo gov para identificar el entorno digital gubernamental',
  colorFranjaGov: '',
  govCoImgUrl: '',
  govCoImgAlt: 'Portal del Estado Colombiano GOV.CO',
  rutaCoMargenArriba: '',
  rutaCoMargenAbajo: '',
  govCoMargenArriba: '',
  govCoMargenAbajo: '',
  alineacionFranjaGov: '',
  separacionFranjaGov: '',
};

/* Margen arriba/abajo por defecto de cada imagen (`rellenoDeImagenDeFranja`). A los
   lados no hay: la separación entre imágenes es de la franja entera. */
const MARGENES_RUTA_CO: [number, number] = [7, 7];
const MARGENES_GOV_CO: [number, number] = [10, 10];

/** Fondo y tinta (`estiloDeFranjaGov`) más la alineación y la separación elegidas. */
function estiloDeFranjaInferior(color: string, alineacion: string, separacion: string): CSSProperties | undefined {
  const estilo: CSSProperties = { ...estiloDeFranjaGov(color) };
  const justificar = ALINEACIONES_FRANJA[alineacion]?.valor;
  const espacio = SEPARACIONES_FRANJA[separacion]?.valor;
  if (justificar) estilo.justifyContent = justificar;
  if (espacio) estilo.gap = espacio;
  return Object.keys(estilo).length > 0 ? estilo : undefined;
}

function renderIconoRedSocial(red: RedSocialItem['red'], iconoPersonalizado?: string): ReactNode {
  if (iconoPersonalizado) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL o SVG) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns
      <img
        src={iconoPersonalizado}
        alt=""
        aria-hidden="true"
        className="w-[22px] h-[22px] object-contain"
      />
    );
  }

  switch (red) {
    case 'x':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 2C0 0.89543 0.895431 0 2 0H20C21.1046 0 22 0.895431 22 2V20C22 21.1046 21.1046 22 20 22H2C0.89543 22 0 21.1046 0 20V2Z" fill="#00AA00" />
          <path d="M4.00168 4.00001C5.91027 6.60908 7.80652 9.20214 9.70669 11.7998C7.80652 13.8739 5.90971 15.9451 4.00056 18.0295C4.03478 18.0295 4.04825 18.0295 4.06171 18.0295C4.42974 18.0295 4.79833 18.0313 5.16636 18.0284C5.19722 18.0284 5.23593 18.0061 5.25837 17.9815C6.12346 17.0374 6.98631 16.092 7.85028 15.1467C8.54482 14.3866 9.2388 13.6264 9.93334 12.8668C10.0349 12.756 10.137 12.6456 10.2419 12.5319C10.3261 12.6468 10.4057 12.7554 10.4854 12.8645C11.1272 13.7424 11.769 14.6203 12.4108 15.4976C13.0145 16.3224 13.6187 17.1471 14.2212 17.9724C14.2504 18.0124 14.2784 18.0307 14.3278 18.0307C15.7113 18.0295 17.0948 18.0295 18.4783 18.0295C18.4951 18.0295 18.5114 18.0261 18.5366 18.0238C16.5517 15.3302 14.573 12.6451 12.592 9.95771C14.4052 7.9739 16.214 5.9941 18.0294 4.00744C18.007 4.00401 17.998 4.00173 17.989 4.00173C17.6255 4.00173 17.2614 4.00001 16.8979 4.00344C16.8664 4.00344 16.8283 4.02688 16.8058 4.05088C16.4496 4.43667 16.0956 4.82474 15.741 5.21167C14.5511 6.51077 13.3617 7.8093 12.1718 9.10783C12.1348 9.14784 12.0994 9.18899 12.0602 9.23357C12.0243 9.18614 11.9973 9.15127 11.971 9.11584C11.2489 8.13565 10.5269 7.1549 9.80431 6.17471C9.28929 5.47572 8.77259 4.7773 8.25926 4.07717C8.21718 4.02002 8.17399 3.99944 8.10498 4.00001C6.76527 4.00173 5.42555 4.00115 4.08583 4.00115C4.06339 4.00115 4.04095 4.00115 4 4.00115L4.00168 4.00001Z" fill="white" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M19.5312 0H2.34375C1.72215 0 1.12601 0.24693 0.686468 0.686469C0.24693 1.12601 0 1.72215 0 2.34375L0 19.5312C0 20.1529 0.24693 20.749 0.686468 21.1885C1.12601 21.6281 1.72215 21.875 2.34375 21.875H9.04541V14.438H5.96924V10.9375H9.04541V8.26953C9.04541 5.23486 10.8521 3.55859 13.6191 3.55859C14.9443 3.55859 16.3301 3.79492 16.3301 3.79492V6.77344H14.8032C13.2988 6.77344 12.8296 7.70703 12.8296 8.66455V10.9375H16.188L15.6509 14.438H12.8296V21.875H19.5312C20.1529 21.875 20.749 21.6281 21.1885 21.1885C21.6281 20.749 21.875 20.1529 21.875 19.5312V2.34375C21.875 1.72215 21.6281 1.12601 21.1885 0.686469C20.749 0.24693 20.1529 0 19.5312 0Z" fill="#00AA00" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 2C0 0.89543 0 2 0H19.88C20.9846 0 21.88 0.89543 21.88 2V19.88C21.88 20.9846 20.9846 21.88 19.88 21.88H2C0.89543 21.88 0 20.9846 0 19.88V2Z" fill="#00AA00" />
          <path d="M11.0018 6.8978C8.73162 6.8978 6.9005 8.72933 6.9005 11C6.9005 13.2707 8.73162 15.1022 11.0018 15.1022C13.2719 15.1022 15.1031 13.2707 15.1031 11C15.1031 8.72933 13.2719 6.8978 11.0018 6.8978ZM11.0018 13.667C9.53475 13.667 8.33542 12.4709 8.33542 11C8.33542 9.52906 9.53118 8.33304 11.0018 8.33304C12.4724 8.33304 13.6682 9.52906 13.6682 11C13.6682 12.4709 12.4688 13.667 11.0018 13.667ZM16.2274 6.73C16.2274 7.26197 15.7991 7.68682 15.2708 7.68682C14.739 7.68682 14.3142 7.2584 14.3142 6.73C14.3142 6.20161 14.7426 5.77318 15.2708 5.77318C15.7991 5.77318 16.2274 6.20161 16.2274 6.73ZM18.9438 7.70111C18.8831 6.41939 18.5904 5.28406 17.6516 4.34866C16.7165 3.41325 15.5814 3.1205 14.2999 3.05623C12.9793 2.98126 9.02075 2.98126 7.70006 3.05623C6.4222 3.11693 5.28712 3.40968 4.34835 4.34509C3.40959 5.28049 3.12047 6.41582 3.05622 7.69753C2.98126 9.01852 2.98126 12.9779 3.05622 14.2989C3.1169 15.5806 3.40959 16.7159 4.34835 17.6513C5.28712 18.5867 6.41863 18.8795 7.70006 18.9438C9.02075 19.0187 12.9793 19.0187 14.2999 18.9438C15.5814 18.8831 16.7165 18.5903 17.6516 17.6513C18.5868 16.7159 18.8795 15.5806 18.9438 14.2989C19.0187 12.9779 19.0187 9.02209 18.9438 7.70111ZM17.2376 15.7163C16.9592 16.416 16.4202 16.9551 15.717 17.2372C14.664 17.6549 12.1654 17.5585 11.0018 17.5585C9.83815 17.5585 7.33597 17.6513 6.28656 17.2372C5.58695 16.9587 5.04796 16.4196 4.76598 15.7163C4.34835 14.6631 4.44473 12.1639 4.44473 11C4.44473 9.8361 4.35192 7.33337 4.76598 6.28372C5.04439 5.58396 5.58338 5.04485 6.28656 4.7628C7.33954 4.34509 9.83815 4.44148 11.0018 4.44148C12.1654 4.44148 14.6676 4.34866 15.717 4.7628C16.4166 5.04128 16.9556 5.58039 17.2376 6.28372C17.6552 7.33694 17.5588 9.8361 17.5588 11C17.5588 12.1639 17.6552 14.6666 17.2376 15.7163Z" fill="white" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9.12109 8.30566L13.7695 10.9473L9.12109 13.5889V8.30566ZM21.875 2.34375V19.5312C21.875 20.8252 20.8252 21.875 19.5312 21.875H2.34375C1.0498 21.875 0 20.8252 0 19.5312V2.34375C0 1.0498 1.0498 0 2.34375 0H19.5312C20.8252 0 21.875 1.0498 21.875 2.34375ZM19.8242 10.9521C19.8242 10.9521 19.8242 8.04199 19.4531 6.64551C19.248 5.87402 18.6475 5.26855 17.8809 5.06348C16.499 4.6875 10.9375 4.6875 10.9375 4.6875C10.9375 4.6875 5.37598 4.6875 3.99414 5.06348C3.22754 5.26855 2.62695 5.87402 2.42188 6.64551C2.05078 8.03711 2.05078 10.9521 2.05078 10.9521C2.05078 10.9521 2.05078 13.8623 2.42188 15.2588C2.62695 16.0303 3.22754 16.6113 3.99414 16.8164C5.37598 17.1875 10.9375 17.1875 10.9375 17.1875C10.9375 17.1875 16.499 17.1875 17.8809 16.8115C18.6475 16.6064 19.248 16.0254 19.4531 15.2539C19.8242 13.8623 19.8242 10.9521 19.8242 10.9521Z" fill="#00AA00" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20.3125 0H1.55762C0.698242 0 0 0.708008 0 1.57715V20.2979C0 21.167 0.698242 21.875 1.55762 21.875H20.3125C21.1719 21.875 21.875 21.167 21.875 20.2979V1.57715C21.875 0.708008 21.1719 0 20.3125 0ZM6.61133 18.75H3.36914V8.31055H6.61621V18.75H6.61133ZM4.99023 6.88477C3.9502 6.88477 3.11035 6.04004 3.11035 5.00488C3.11035 3.96973 3.9502 3.125 4.99023 3.125C6.02539 3.125 6.87012 3.96973 6.87012 5.00488C6.87012 6.04492 6.03027 6.88477 4.99023 6.88477ZM18.7646 18.75H15.5225V13.6719C15.5225 12.4609 15.498 10.9033 13.8379 10.9033C12.1484 10.9033 11.8896 12.2217 11.8896 13.584V18.75H8.64746V8.31055H11.7578V9.73633H11.8018C12.2363 8.91602 13.2959 8.05176 14.873 8.05176C18.1543 8.05176 18.7646 10.2148 18.7646 13.0273V18.75Z" fill="#00AA00" />
        </svg>
      );
    case 'radio':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 2C0 0.89543 0.89543 0 2 0H19.88C20.9846 0 21.88 0.89543 21.88 2V19.88C21.88 20.9846 20.9846 21.88 19.88 21.88H2C0.89543 21.88 0 20.9846 0 19.88V2Z" fill="#00AA00" />
          <path d="M17.4943 4.37712C17.8664 4.26872 18.0802 3.87615 17.9718 3.50409C17.8634 3.13202 17.4709 2.91816 17.0989 3.02948L4.51739 6.71791C4.24204 6.79701 3.99304 6.92885 3.7792 7.1017C3.30758 7.44447 3 7.99817 3 8.62512V16.125C3 17.1592 3.84072 18 4.87477 18H16.1234C17.1575 18 17.9982 17.1592 17.9982 16.125V8.62512C17.9982 7.59095 17.1575 6.75014 16.1234 6.75014H9.40059L17.4943 4.37712ZM13.7799 10.0313C15.0747 10.0313 16.1234 11.0802 16.1234 12.3751C16.1234 13.67 15.0747 14.7188 13.7799 14.7188C12.4852 14.7188 11.4365 13.67 11.4365 12.3751C11.4365 11.0802 12.4852 10.0313 13.7799 10.0313ZM4.87477 11.2032C4.87477 10.8136 5.18821 10.5001 5.57781 10.5001H8.85867C9.24827 10.5001 9.56171 10.8136 9.56171 11.2032C9.56171 11.5929 9.24827 11.9063 8.85867 11.9063H5.57781C5.18821 11.9063 4.87477 11.5929 4.87477 11.2032ZM4.87477 14.0157C4.87477 13.626 5.18821 13.3126 5.57781 13.3126H8.85867C9.24827 13.3126 9.56171 13.626 9.56171 14.0157C9.56171 14.4053 9.24827 14.7188 8.85867 14.7188H5.57781C5.18821 14.7188 4.87477 14.4053 4.87477 14.0157Z" fill="white" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer({
  block,
  footerPersonalizado,
  colorFondo = VALORES_PIE_POR_DEFECTO.colorFondo,
  colorFondoSuperior = VALORES_PIE_POR_DEFECTO.colorFondoSuperior,
  colorTarjeta = VALORES_PIE_POR_DEFECTO.colorTarjeta,
  logoSenaUrl = VALORES_PIE_POR_DEFECTO.logoSenaUrl,
  logoSenaAlt = VALORES_PIE_POR_DEFECTO.logoSenaAlt,
  logoOloUrl = VALORES_PIE_POR_DEFECTO.logoOloUrl,
  logoOloAlt = VALORES_PIE_POR_DEFECTO.logoOloAlt,
  separadorLogos = VALORES_PIE_POR_DEFECTO.separadorLogos,
  tamanoSeparadorLogos = VALORES_PIE_POR_DEFECTO.tamanoSeparadorLogos,
  logoMintrabajoUrl = VALORES_PIE_POR_DEFECTO.logoMintrabajoUrl,
  logoMintrabajoAlt = VALORES_PIE_POR_DEFECTO.logoMintrabajoAlt,
  nombreEntidad = VALORES_PIE_POR_DEFECTO.nombreEntidad,
  direccion = VALORES_PIE_POR_DEFECTO.direccion,
  atencionPresencial = VALORES_PIE_POR_DEFECTO.atencionPresencial,
  puntosAtencionTexto = VALORES_PIE_POR_DEFECTO.puntosAtencionTexto,
  puntosAtencionUrl = VALORES_PIE_POR_DEFECTO.puntosAtencionUrl,
  whatsappTitulo = VALORES_PIE_POR_DEFECTO.whatsappTitulo,
  whatsappNumero = VALORES_PIE_POR_DEFECTO.whatsappNumero,
  lineasAtencionTitulo = VALORES_PIE_POR_DEFECTO.lineasAtencionTitulo,
  lineasAtencionTexto = VALORES_PIE_POR_DEFECTO.lineasAtencionTexto,
  mesaAyudaTitulo = VALORES_PIE_POR_DEFECTO.mesaAyudaTitulo,
  mesaAyudaTelefono = VALORES_PIE_POR_DEFECTO.mesaAyudaTelefono,
  mesaAyudaEmail = VALORES_PIE_POR_DEFECTO.mesaAyudaEmail,
  horarioTitulo = VALORES_PIE_POR_DEFECTO.horarioTitulo,
  horarioTexto = VALORES_PIE_POR_DEFECTO.horarioTexto,
  redesSociales = VALORES_PIE_POR_DEFECTO.redesSociales,
  certificacionImgUrl = VALORES_PIE_POR_DEFECTO.certificacionImgUrl,
  certificacionImgAlt = VALORES_PIE_POR_DEFECTO.certificacionImgAlt,
  enlacesFila1 = VALORES_PIE_POR_DEFECTO.enlacesFila1,
  enlacesFila2 = VALORES_PIE_POR_DEFECTO.enlacesFila2,
  enlacesFila3 = VALORES_PIE_POR_DEFECTO.enlacesFila3,
  mostrarFranjaGov = VALORES_PIE_POR_DEFECTO.mostrarFranjaGov,
  rutaCoImgUrl = VALORES_PIE_POR_DEFECTO.rutaCoImgUrl,
  rutaCoImgAlt = VALORES_PIE_POR_DEFECTO.rutaCoImgAlt,
  colorFranjaGov = VALORES_PIE_POR_DEFECTO.colorFranjaGov,
  govCoImgUrl = VALORES_PIE_POR_DEFECTO.govCoImgUrl,
  govCoImgAlt = VALORES_PIE_POR_DEFECTO.govCoImgAlt,
  rutaCoMargenArriba = VALORES_PIE_POR_DEFECTO.rutaCoMargenArriba,
  rutaCoMargenAbajo = VALORES_PIE_POR_DEFECTO.rutaCoMargenAbajo,
  govCoMargenArriba = VALORES_PIE_POR_DEFECTO.govCoMargenArriba,
  govCoMargenAbajo = VALORES_PIE_POR_DEFECTO.govCoMargenAbajo,
  alineacionFranjaGov = VALORES_PIE_POR_DEFECTO.alineacionFranjaGov,
  separacionFranjaGov = VALORES_PIE_POR_DEFECTO.separacionFranjaGov,
}: FooterProps) {
  const redes = footerPersonalizado ? redesSociales : (redesSociales && redesSociales.length > 0 ? redesSociales : VALORES_PIE_POR_DEFECTO.redesSociales);
  const fila1 = footerPersonalizado ? enlacesFila1 : (enlacesFila1 && enlacesFila1.length > 0 ? enlacesFila1 : VALORES_PIE_POR_DEFECTO.enlacesFila1);
  const fila2 = footerPersonalizado ? enlacesFila2 : (enlacesFila2 && enlacesFila2.length > 0 ? enlacesFila2 : VALORES_PIE_POR_DEFECTO.enlacesFila2);
  const fila3 = footerPersonalizado ? enlacesFila3 : (enlacesFila3 && enlacesFila3.length > 0 ? enlacesFila3 : VALORES_PIE_POR_DEFECTO.enlacesFila3);

  const hasText = (val: unknown) => {
    if (typeof val === 'string') {
      const cleaned = val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
      return cleaned.length > 0;
    }
    return !!val;
  };

  // Si es un pie nuevo (personalizado) y borran el color, usamos blanco en lugar de dejar que el CSS ponga el azul antiguo
  const fondoInferiorAplicar = colorFondo || (footerPersonalizado ? '#ffffff' : undefined);
  const fondoSuperiorAplicar = colorFondoSuperior || (footerPersonalizado ? '#ffffff' : 'transparent');
  
  const estiloWrapper = fondoInferiorAplicar 
    ? { background: `linear-gradient(to bottom, ${fondoSuperiorAplicar} 120px, ${fondoInferiorAplicar} 120px)` } 
    : undefined;

  const colorTarjetaAplicar = colorTarjeta || (footerPersonalizado ? '#ffffff' : undefined);

  return (
    <>
      <footer 
        className="olo-footer-wrapper" 
        id="main-footer" 
        role="contentinfo" 
        data-block-id={block?.id || 'main-footer'}
        style={estiloWrapper}
      >
        <div className="olo-footer-card" style={colorTarjetaAplicar ? { backgroundColor: colorTarjetaAplicar } : undefined}>
          <div className="olo-logos-top">
            <div className="olo-logos-left">
              {logoSenaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL o SVG) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns
                <img src={logoSenaUrl} alt={logoSenaAlt || 'Logotipo del SENA'} className="olo-logo" />
              ) : null}
              {(logoSenaUrl && logoOloUrl && separadorLogos) ? (
                <span 
                  className="olo-logo-separator" 
                  style={{ 
                    display: 'inline-block',
                    fontSize: '20px',
                    lineHeight: 1,
                    transform: tamanoSeparadorLogos ? `scaleY(${tamanoSeparadorLogos / 20})` : undefined 
                  }}
                >
                  {separadorLogos}
                </span>
              ) : null}
              {logoOloUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL o SVG) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns
                <img src={logoOloUrl} alt={logoOloAlt || 'Logotipo del OLO'} className="olo-logo" />
              ) : null}
            </div>
            <div className="olo-logos-right">
              {logoMintrabajoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL o SVG) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns
                <img src={logoMintrabajoUrl} alt={logoMintrabajoAlt || 'Logotipo del Ministerio del Trabajo'} className="olo-logo" />
              ) : null}
            </div>
          </div>
          <div className="olo-content-blocks">
            {(hasText(nombreEntidad) || hasText(direccion) || hasText(atencionPresencial) || hasText(puntosAtencionTexto)) ? (
              <div className="olo-block">
                {hasText(nombreEntidad) ? <h3 className="olo-title-main">{nombreEntidad}</h3> : null}
                {hasText(direccion) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{direccion}</p> : null}
                {hasText(atencionPresencial) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{atencionPresencial}</p> : null}
                {hasText(puntosAtencionTexto) ? (
                  <a href={puntosAtencionUrl || '#'} className="olo-link" style={{ whiteSpace: 'pre-wrap' }}>
                    {puntosAtencionTexto}
                  </a>
                ) : null}
              </div>
            ) : null}

            {(hasText(whatsappTitulo) || hasText(whatsappNumero)) ? (
              <div className="olo-block">
                {hasText(whatsappTitulo) ? <h4 className="olo-title">{whatsappTitulo}</h4> : null}
                {hasText(whatsappNumero) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{whatsappNumero}</p> : null}
              </div>
            ) : null}

            {(hasText(lineasAtencionTitulo) || hasText(lineasAtencionTexto)) ? (
              <div className="olo-block">
                {hasText(lineasAtencionTitulo) ? <h4 className="olo-title">{lineasAtencionTitulo}</h4> : null}
                {hasText(lineasAtencionTexto) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{lineasAtencionTexto}</p> : null}
              </div>
            ) : null}

            {(hasText(mesaAyudaTitulo) || hasText(mesaAyudaTelefono) || hasText(mesaAyudaEmail)) ? (
              <div className="olo-block">
                {hasText(mesaAyudaTitulo) ? <h4 className="olo-title">{mesaAyudaTitulo}</h4> : null}
                {hasText(mesaAyudaTelefono) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{mesaAyudaTelefono}</p> : null}
                {hasText(mesaAyudaEmail) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{mesaAyudaEmail}</p> : null}
              </div>
            ) : null}

            {(hasText(horarioTitulo) || hasText(horarioTexto)) ? (
              <div className="olo-block">
                {hasText(horarioTitulo) ? <h4 className="olo-title">{horarioTitulo}</h4> : null}
                {hasText(horarioTexto) ? <p className="olo-text" style={{ whiteSpace: 'pre-wrap' }}>{horarioTexto}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="olo-social-and-certs">
            {redes.length > 0 ? (
              <div className="olo-social-links">
                {redes.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="olo-social-item"
                  >
                    {renderIconoRedSocial(item.red, item.iconoPersonalizado)}
                    <span className="olo-social-text">{item.nombre}</span>
                  </a>
                ))}
              </div>
            ) : null}

            {certificacionImgUrl ? (
              <div className="olo-certifications">
                {/* eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL o SVG) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns */}
                <img
                  src={certificacionImgUrl}
                  alt={certificacionImgAlt || 'Sello de certificación'}
                  className="w-[clamp(140px,26vw,220px)] h-auto object-contain"
                />
              </div>
            ) : null}
          </div>

          {(fila1.length > 0 || fila2.length > 0 || fila3.length > 0) ? (
            <div className="olo-bottom-links">
              {fila1.length > 0 ? (
                <div className="olo-links-row">
                  {fila1.map((enlace, idx) => (
                    <a key={idx} href={enlace.url || '#'}>
                      {enlace.texto}
                    </a>
                  ))}
                </div>
              ) : null}
              {fila2.length > 0 ? (
                <div className="olo-links-row">
                  {fila2.map((enlace, idx) => (
                    <a key={idx} href={enlace.url || '#'}>
                      {enlace.texto}
                    </a>
                  ))}
                </div>
              ) : null}
              {fila3.length > 0 ? (
                <div className="olo-links-row">
                  {fila3.map((enlace, idx) => (
                    <a key={idx} href={enlace.url || '#'}>
                      {enlace.texto}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </footer>
      {mostrarFranjaGov && (
        <div
          className="olo-gov-banner-bottom"
          style={estiloDeFranjaInferior(colorFranjaGov, alineacionFranjaGov, separacionFranjaGov)}
        >
          {/* Cada imagen va en una caja del alto de la franja: por grande que se suba, se
              ajusta dentro, y el relleno elegido en el editor la achica sin mover la franja. */}
          {rutaCoImgUrl && (
            <span
              className="olo-franja-imagen"
              style={rellenoDeImagenDeFranja([rutaCoMargenArriba, rutaCoMargenAbajo], MARGENES_RUTA_CO)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns */}
              <img src={rutaCoImgUrl} alt={rutaCoImgAlt || 'Marca país de Colombia'} />
            </span>
          )}
          {rutaCoImgUrl && govCoImgUrl && <p aria-hidden="true">|</p>}
          {govCoImgUrl && (
            <a
              href="https://www.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="olo-franja-imagen"
              aria-label={govCoImgAlt || 'Portal del Estado Colombiano GOV.CO'}
              style={rellenoDeImagenDeFranja([govCoMargenArriba, govCoMargenAbajo], MARGENES_GOV_CO)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor y su tamaño va por CSS */}
              <img src={govCoImgUrl} alt="" />
            </a>
          )}
        </div>
      )}
    </>
  );
}
