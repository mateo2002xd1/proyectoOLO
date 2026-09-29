import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import Empresa from './empresa';
import CiiuSeccion from './ciiu-seccion';
import CiiuClase from './ciiu-clase';

export type TipoProyectoInversion = 'nuevo' | 'expansion';
export type EstadoProyectoInversion = 'borrador' | 'en_revision' | 'publicado' | 'rechazado';

/**
 * Tabla `proyectos_inversion`: una fila por proyecto de inversión anunciado. Mismo
 * ciclo editorial de `paginas_versiones` (D8: borrado lógico por `estado`), no uno
 * propio.
 */
class ProyectoInversion extends Model {
  declare id: string;
  declare tipo: TipoProyectoInversion;
  declare descripcion: string;
  declare empresa_id: string;
  declare seccion_id: string;
  declare clase_id: string | null;
  declare fecha_anuncio: string;
  declare fuente_url: string;
  declare fuente_medio: string | null;
  declare inversion_cop: string | null;
  declare empleos_estimados: number | null;
  declare estado: EstadoProyectoInversion;
  declare creado_por: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare empresa?: Empresa;
  declare seccion?: CiiuSeccion;
  declare clase?: CiiuClase;
}

ProyectoInversion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING(10), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    empresa_id: { type: DataTypes.UUID, allowNull: false, references: { model: Empresa, key: 'id' } },
    seccion_id: { type: DataTypes.UUID, allowNull: false, references: { model: CiiuSeccion, key: 'id' } },
    clase_id: { type: DataTypes.UUID, allowNull: true, references: { model: CiiuClase, key: 'id' } },
    fecha_anuncio: { type: DataTypes.DATEONLY, allowNull: false },
    fuente_url: { type: DataTypes.TEXT, allowNull: false },
    fuente_medio: { type: DataTypes.STRING(120), allowNull: true },
    inversion_cop: { type: DataTypes.DECIMAL(18, 0), allowNull: true },
    empleos_estimados: { type: DataTypes.INTEGER, allowNull: true },
    estado: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'borrador' },
    creado_por: { type: DataTypes.UUID, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'proyectos_inversion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ProyectoInversion;
