export interface RegistroFuenteFutura {
  id: string;
  departamento: string;
  sector: string;
  cuentaProyecto: number;
  principalesFuentes?: string;
}

export interface FiltrosFuentesFuturas {
  departamento: string;
}

export interface FuentesFuturasEmpleoViewProps {
  modoSeleccionDepartamento?: 'lista' | 'mapa';
  mostrarTotales?: boolean;
  mostrarBannerDepartamento?: boolean;
  subtituloInfoDepto?: string;
  descripcionInfoDepto?: string;
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
  ocultarEncabezado?: boolean;
}
