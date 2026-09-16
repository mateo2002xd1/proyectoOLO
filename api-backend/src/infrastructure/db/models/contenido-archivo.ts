import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class ContenidoArchivo extends Model {
  declare contenidoId: string;
  declare archivoId: string;
  declare orden: number;
  declare rol: 'adjunto' | 'portada' | 'galeria';
  declare createdAt: Date;
}

// Tabla puente: un archivo puede aparecer en varios contenidos sin duplicarse en
// disco, y puede existir sin pertenecer a ninguno.
ContenidoArchivo.init(
  {
    contenidoId: { type: DataTypes.UUID, primaryKey: true, field: 'contenido_id' },
    archivoId: { type: DataTypes.UUID, primaryKey: true, field: 'archivo_id' },
    orden: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
    rol: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'adjunto' },
  },
  {
    sequelize,
    tableName: 'contenidos_archivos',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);
