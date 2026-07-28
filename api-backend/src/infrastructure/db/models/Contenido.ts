import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

export class Contenido extends Model {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare excerpt: string | null;
  declare content: string;
  declare sectionId: string;
  declare authorId: string | null;
  declare tipo: string | null;
  declare estado: 'borrador' | 'en_revision' | 'publicado' | 'rechazado' | 'archivado';
  declare motivoRechazo: string | null;
  declare revisadoPor: string | null;
  declare revisadoEn: Date | null;
  declare destacado: boolean;
  declare publishedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare section?: any;
  declare attachments?: any[];
}

// Los nombres de atributo se mantienen en inglés a propósito: son el contrato que ya
// consumen los frontends (`sitio-web/src/features/contenidos/types.ts`). La columna sí
// sigue la convención del proyecto, y `field` es el puente entre las dos. Alinear
// también los atributos sería un refactor de la API, no de la base de datos.
Contenido.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.TEXT, allowNull: false, field: 'titulo' },
    slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT, field: 'resumen' },
    content: { type: DataTypes.TEXT, allowNull: false, field: 'cuerpo' },
    sectionId: { type: DataTypes.UUID, allowNull: false, field: 'seccion_id' },
    authorId: { type: DataTypes.UUID, field: 'autor_id' },
    tipo: { type: DataTypes.TEXT },
    estado: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'borrador' },
    motivoRechazo: { type: DataTypes.TEXT, field: 'motivo_rechazo' },
    revisadoPor: { type: DataTypes.UUID, field: 'revisado_por' },
    revisadoEn: { type: DataTypes.DATE, field: 'revisado_en' },
    destacado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    publishedAt: { type: DataTypes.DATE, field: 'publicado_en' },
  },
  // Sin `indexes`: el esquema lo definen las migraciones, no el modelo.
  { sequelize, tableName: 'contenidos', timestamps: true, underscored: true }
);
