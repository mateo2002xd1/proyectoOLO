import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';
import { DepartamentosRepository } from '../../repositories/departamentos.repository';

export class ErrorDeAltaManual extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface DatosProyectoManual {
  tipo: 'nuevo' | 'expansion';
  descripcion: string;
  empresa: string;
  seccionId: string;
  claseId: string | null;
  fechaAnuncio: string;
  fuenteUrl: string;
  fuenteMedio: string | null;
  inversionCop: number | null;
  empleosEstimados: number | null;
  departamento: string;
  ciudad: string | null;
}

/**
 * Alta manual de un proyecto desde el formulario del panel — la segunda vía de
 * entrada de datos, junto a la carga de Excel. Nace `publicado` de una vez (mismo
 * criterio de "sin paso de aprobación" del resto de "Actualizaciones"): quien tiene
 * el permiso de actualizar ya es Administrador o Superadmin.
 */
export async function crearProyectoInversionManual(
  datos: DatosProyectoManual,
  creadoPor: string | null
) {
  const departamentos = await DepartamentosRepository.resolverPorNombres([datos.departamento]);
  const departamento = departamentos.get(datos.departamento);
  if (!departamento) {
    throw new ErrorDeAltaManual(
      `Departamento no reconocido: "${datos.departamento}". Use el nombre oficial del departamento.`,
      400
    );
  }

  const empresa = await Repo.resolverOCrearEmpresa(datos.empresa);

  let municipioId: string | null = null;
  if (datos.ciudad) {
    const municipio = await Repo.resolverOCrearMunicipio(departamento.id, datos.ciudad);
    municipioId = municipio.get('id') as string;
  }

  return Repo.crearProyecto({
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    empresaId: empresa.get('id') as string,
    seccionId: datos.seccionId,
    claseId: datos.claseId,
    fechaAnuncio: datos.fechaAnuncio,
    fuenteUrl: datos.fuenteUrl,
    fuenteMedio: datos.fuenteMedio,
    inversionCop: datos.inversionCop,
    empleosEstimados: datos.empleosEstimados,
    ubicaciones: [{ departamentoId: departamento.id, municipioId }],
    creadoPor,
    estado: 'publicado',
  });
}
