import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { normalizarParaComparar } from '../shared/normalizar-texto';

export interface DepartamentoCatalogo {
  id: string;
  codigoDane: string;
  nombre: string;
}

/**
 * El catálogo único de los 33 departamentos (migración 032), compartido por
 * "Programa + Sobresalientes" y por la tendencia ocupacional.
 *
 * Ningún importador crea departamentos: los resuelve por `departamentos_alias` o
 * rechaza la fila. Es lo que impide que el catálogo vuelva a llenarse de variantes
 * ("Valle", "Vupes"...) como pasaba cuando se creaba uno por cada nombre nuevo.
 */
export const DepartamentosRepository = {
  /**
   * Resuelve nombres "tal como vienen" en el Excel. La clave del mapa es el nombre
   * original; el valor, `null` si ningún alias coincide.
   */
  async resolverPorNombres(
    nombres: Iterable<string>,
    transaction?: Transaction
  ): Promise<Map<string, DepartamentoCatalogo | null>> {
    const originales = Array.from(new Set(nombres));
    const normalizados = Array.from(new Set(originales.map(normalizarParaComparar)));

    const filas =
      normalizados.length === 0
        ? []
        : await sequelize.query<{ alias: string; id: string; codigo_dane: string; nombre: string }>(
            `SELECT a.alias_normalizado AS alias, d.id, d.codigo_dane, d.nombre
               FROM departamentos_alias a
               JOIN departamentos d ON d.id = a.departamento_id
              WHERE a.alias_normalizado IN (:normalizados)`,
            { replacements: { normalizados }, type: QueryTypes.SELECT, transaction }
          );

    const porAlias = new Map(
      filas.map((f) => [f.alias, { id: f.id, codigoDane: f.codigo_dane, nombre: f.nombre }])
    );

    return new Map(originales.map((nombre) => [nombre, porAlias.get(normalizarParaComparar(nombre)) ?? null]));
  },

  /** Los 33, por nombre. Alimenta el filtro "Departamento" del buscador. */
  listar: () =>
    sequelize.query<{ codigo_dane: string; nombre: string }>(
      'SELECT codigo_dane, nombre FROM departamentos ORDER BY nombre',
      { type: QueryTypes.SELECT }
    ),
};
