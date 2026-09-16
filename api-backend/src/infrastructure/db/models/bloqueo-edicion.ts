import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../config/database';

/**
 * Quién tiene abierta ahora mismo la mesa de trabajo de una página.
 *
 * Ver la migración `020-bloqueos-edicion` para el porqué de la tabla y por qué
 * `usuario_id` es texto y no una clave foránea a `usuarios`.
 */
export class BloqueoEdicion extends Model {
  declare ambito: string;
  declare slug: string;
  declare usuarioId: string;
  declare usuarioNombre: string;
  declare adquiridoEn: Date;
  declare expiraEn: Date;
}

// Sin `id` propio: la pareja ámbito-slug es la identidad de la fila, igual que en
// el índice único `uq_paginas_ambito_slug` de `paginas`.
BloqueoEdicion.init(
  {
    ambito: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
    slug: { type: DataTypes.TEXT, allowNull: false, primaryKey: true },
    usuarioId: { type: DataTypes.TEXT, allowNull: false },
    usuarioNombre: { type: DataTypes.TEXT, allowNull: false },
    adquiridoEn: { type: DataTypes.DATE, allowNull: false },
    expiraEn: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: 'bloqueos_edicion',
    // La tabla lleva sus propias marcas de tiempo con nombres de dominio
    // (`adquirido_en` / `expira_en`); las de Sequelize sobrarían.
    timestamps: false,
    underscored: true,
  }
);
