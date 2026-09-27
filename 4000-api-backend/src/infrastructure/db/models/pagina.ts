import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/**
 * Tabla `paginas`: una página por slug y ámbito (sitio o intranet), que apunta a su versión
 * publicada. El contenido vive en `paginas_versiones`.
 */
export class Pagina extends Model {
  declare id: string;
  declare slug: string;
  declare ambito: 'sitio' | 'intranet';
  declare titulo: string;
  declare versionPublicadaId: string | null;
  declare creadoPor: string;
  declare visitas: number;
  declare versionPublicada?: any;
  declare creador?: any;
  declare versiones?: any[];
}

Pagina.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // El slug es único dentro de su aplicación, no en toda la tabla: el sitio y la
    // intranet comparten `paginas` y ambos tienen su `/inicio`.
    slug: { type: DataTypes.STRING(255), allowNull: false },
    ambito: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'sitio' },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    versionPublicadaId: { type: DataTypes.UUID, allowNull: true },
    creadoPor: { type: DataTypes.UUID, allowNull: true },
    visitas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'paginas', timestamps: true, underscored: true }
);
