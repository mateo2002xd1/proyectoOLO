export interface RegistroTendenciaOcupacional {
  id: string;
  departamento: string;
  nivelOcupacional: string;
  nivelCodigo: string;
  codigoCno: string;
  nombreOcupacion: string;
  totalInscritos: number;
  totalVacantes: number;
  anio: number;
  periodo: string;
}

export interface DefinicionNivel {
  codigo: string;
  titulo: string;
  descripcion: string;
}

export interface FiltrosTendencia {
  departamento: string;
  anio: string;
  periodo: string;
  nivelOcupacional: string;
}

export type TipoTendenciaOcupacional =
  | 'mas-menos'
  | 'mas-mas'
  | 'menos-menos'
  | 'menos-mas';

export interface TendenciaOcupacionalViewProps {
  tipoTendencia?: TipoTendenciaOcupacional;
  mostrarDefiniciones?: boolean;
  mostrarTotales?: boolean;
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
  ocultarEncabezado?: boolean;
}

