import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';
import Departamento from './departamento';
import CentroFormacion from './centro-formacion';
import NivelFormacion from './nivel-formacion';
import ProgramaFormacion from './programa-formacion';

/**
 * Tabla `programas_sobresalientes`: los datos de «Programa + Sobresalientes» que se cargan por
 * Excel (certificados, vinculados, tasa y salario por departamento, centro, programa y sexo).
 */
class ProgramaSobresaliente extends Model {
  declare id: string;
  declare departamento_id: string;
  declare centro_id: string;
  declare programa_id: string;
  declare nivel_formacion_id: string;
  declare sexo: string;
  declare certificados: number;
  declare vinculados: number;
  declare tasa_vinculacion: number;
  declare salario_promedio: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  
  declare departamento?: Departamento;
  declare centro?: CentroFormacion;
  declare nivelFormacion?: NivelFormacion;
  declare programa?: ProgramaFormacion;
}

ProgramaSobresaliente.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    departamento_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Departamento,
        key: 'id',
      },
    },
    centro_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: CentroFormacion,
        key: 'id',
      },
    },
    programa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ProgramaFormacion,
        key: 'id',
      },
    },
    nivel_formacion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: NivelFormacion,
        key: 'id',
      },
    },
    sexo: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      validate: {
        isIn: [['M', 'F']],
      },
    },
    certificados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    vinculados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    tasa_vinculacion: {
      type: DataTypes.DECIMAL(6, 4),
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    salario_promedio: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'programas_sobresalientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['centro_id', 'programa_id', 'sexo'],
        name: 'uq_sobresalientes_registro',
      },
      {
        fields: ['departamento_id'],
        name: 'idx_sobresalientes_departamento',
      },
      // Respalda la FK compuesta `(programa_id, nivel_formacion_id)`. Los de nivel, sexo y
      // tasa se quitaron en la 041: nadie los leía y se reescribían en cada recarga.
      {
        fields: ['programa_id', 'nivel_formacion_id'],
        name: 'idx_sobresalientes_programa',
      },
    ],
  }
);

export default ProgramaSobresaliente;
