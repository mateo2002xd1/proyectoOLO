import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/**
 * Tabla `paginas_versiones`: cada versión del contenido Puck de una página, con su estado en el
 * ciclo editorial (borrador, en revisión, publicado, rechazado, archivado) y su autoría.
 */
export class PaginaVersion extends Model {
  declare id: string;
  declare paginaId: string;
  declare contenido: any;
  declare layout: any;
  declare numeroVersion: number;
  declare estado: 'borrador' | 'en_revision' | 'publicado' | 'rechazado' | 'archivado';
  declare motivoRechazo: string | null;
  declare comentarioCambios: string | null;
  declare creadoPor: string | null;
  declare revisadoEn: Date | null;
  declare revisorId: string | null;
  declare publicadoPor: string | null;
  declare publicadoEn: Date | null;
  declare creadoEn: Date;
  declare pagina?: any;
  declare revisor?: any;
  declare publicador?: any;
  declare autor?: any;
}

PaginaVersion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    paginaId: { type: DataTypes.UUID, allowNull: false },
    contenido: { type: DataTypes.JSONB, allowNull: false },
    layout: { type: DataTypes.JSONB },
    numeroVersion: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.STRING(20), defaultValue: 'borrador' },
    motivoRechazo: { type: DataTypes.TEXT },
    // El «commit» de la versión: qué cambió, en palabras de quien la envió a revisión.
    // Obligatorio para pasar a `en_revision` (migración 029, `ck_paginas_versiones_comentario`).
    comentarioCambios: { type: DataTypes.STRING(100) },
    // Quién escribió la versión. Antes solo se guardaba quién la revisó y quién la
    // publicó, así que el historial de RF-07 no sabía decir quién editó.
    creadoPor: { type: DataTypes.UUID },
    revisadoEn: { type: DataTypes.DATE },
    revisorId: { type: DataTypes.UUID },
    publicadoPor: { type: DataTypes.UUID },
    publicadoEn: { type: DataTypes.DATE },
  },
  { sequelize, tableName: 'paginas_versiones', timestamps: true, underscored: true, createdAt: 'creadoEn', updatedAt: false }
);
