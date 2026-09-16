import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export type EstadoCargaDatos = 'procesando' | 'completado' | 'error';

/**
 * Auditoría de cada carga de Excel hecha desde "Actualizaciones" (panel de
 * administración). Sin estado de aprobación: solo el Administrador sube y el
 * procesamiento arranca de inmediato — ver `027-cargas-datos` para el porqué.
 *
 * Sin relación de esquema con `programas_sobresalientes` (la tabla de hechos del
 * observatorio, de Mateo): la carga es "vaciar y recargar" completo, así que no hay
 * una versión vigente por fila que enlazar — solo el hecho de que una carga
 * ocurrió y cómo salió.
 *
 * `modulo` distingue de qué tarjeta viene la carga (hoy solo
 * `programa_sobresalientes`; las otras tres tarjetas de "Actualizaciones" siguen sin
 * especificar).
 */
export class CargaDatos extends Model {
  declare id: string;
  declare modulo: string;
  declare archivoId: string | null;
  declare estado: EstadoCargaDatos;
  declare progreso: number;
  declare filasProcesadas: number;
  declare filasTotales: number | null;
  declare mensaje: string | null;
  declare subidoPor: string | null;
  declare creadoEn: Date;
  declare completadoEn: Date | null;
}

CargaDatos.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    modulo: { type: DataTypes.STRING, allowNull: false, defaultValue: 'programa_sobresalientes' },
    archivoId: { type: DataTypes.UUID, field: 'archivo_id' },
    estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'procesando' },
    progreso: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    filasProcesadas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'filas_procesadas' },
    filasTotales: { type: DataTypes.INTEGER, field: 'filas_totales' },
    mensaje: { type: DataTypes.TEXT },
    subidoPor: { type: DataTypes.UUID, field: 'subido_por' },
    creadoEn: { type: DataTypes.DATE, field: 'creado_en' },
    completadoEn: { type: DataTypes.DATE, field: 'completado_en' },
  },
  { sequelize, tableName: 'cargas_datos', timestamps: false, underscored: true }
);
