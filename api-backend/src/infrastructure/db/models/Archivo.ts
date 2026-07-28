import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Archivo extends Model {
  declare id: string;
  declare nombreOriginal: string;
  declare nombreAlmacenado: string;
  declare rutaRelativa: string;
  declare mimeType: string;
  declare extension: string | null;
  declare tamanoBytes: number;
  declare hashSha256: string | null;
  declare ambito: 'publico' | 'interno';
  declare estado: 'pendiente' | 'disponible' | 'rechazado' | 'eliminado';
  declare textoAlternativo: string | null;
  declare subidoPor: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Tabla nueva, sin contrato heredado que preservar: aquí los atributos sí van en el
// idioma del dominio. Reemplaza a `Attachment`, que ataba cada archivo a un contenido
// y por eso no tenía dónde guardar una imagen subida desde el editor.
Archivo.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombreOriginal: { type: DataTypes.TEXT, allowNull: false, field: 'nombre_original' },
    nombreAlmacenado: { type: DataTypes.TEXT, allowNull: false, field: 'nombre_almacenado' },
    rutaRelativa: { type: DataTypes.TEXT, allowNull: false, field: 'ruta_relativa' },
    mimeType: { type: DataTypes.TEXT, allowNull: false, field: 'mime_type' },
    extension: { type: DataTypes.TEXT },
    tamanoBytes: { type: DataTypes.BIGINT, allowNull: false, field: 'tamano_bytes' },
    hashSha256: { type: DataTypes.CHAR(64), field: 'hash_sha256' },
    ambito: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'publico' },
    estado: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'pendiente' },
    textoAlternativo: { type: DataTypes.TEXT, field: 'texto_alternativo' },
    subidoPor: { type: DataTypes.UUID, field: 'subido_por' },
  },
  { sequelize, tableName: 'archivos', timestamps: true, underscored: true }
);
