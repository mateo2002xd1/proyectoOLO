import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class MarcaVersion extends Model {
  declare id: string;
  declare version: number;
  declare tokens: Record<string, unknown>;
  declare activa: boolean;
  declare contrasteValidado: boolean;
  declare creadoPor: string | null;
  declare aprobadoPor: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// RF-03: colores, tipografías y logotipos configurables desde el panel.
// Versionada para que cambiar la identidad no borre la anterior. Solo una fila puede
// tener `activa = true`, y lo impone un índice único parcial (invariante I7).
// Dentro de `tokens` los logotipos son `archivo_id`, no rutas copiadas.
MarcaVersion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    version: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    tokens: { type: DataTypes.JSONB, allowNull: false },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Resultado de la validación de contraste AA (T-03.8, Res. 1519 de 2020).
    contrasteValidado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'contraste_validado',
    },
    creadoPor: { type: DataTypes.UUID, field: 'creado_por' },
    aprobadoPor: { type: DataTypes.UUID, field: 'aprobado_por' },
  },
  { sequelize, tableName: 'marca_versiones', timestamps: true, underscored: true }
);
