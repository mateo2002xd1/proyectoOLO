/**
 * Validación de cuerpos de petición con Zod.
 *
 * Zod llevaba desde el principio en `package.json`, y en `validators/` había dos
 * esquemas escritos. No se importaban en ningún sitio: los controladores leían
 * `req.body` directo y lo pasaban al caso de uso tal cual. §3 lo exige desde que se
 * escribió el documento, así que esto no añade una regla nueva, conecta la que ya
 * estaba.
 *
 * Lo que cierra no es solo «campos con formato raro». `createUser` hacía
 * `const { email, password, role_id, ...rest } = data` y le pasaba `rest` entero a
 * Sequelize: cualquier columna del modelo era escribible desde el cuerpo de la
 * petición. Por eso los esquemas son `.strict()` — rechazan lo que no está declarado
 * en vez de ignorarlo, que es la diferencia entre validar y aparentar que se valida.
 *
 * @see 3-seguridad-del-proyecto.md §3 (Validación de entrada con Zod)
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Devuelve un middleware que valida `req.body` contra el esquema.
 *
 * Al pasar, **sustituye** `req.body` por el resultado parseado. Es lo que hace que
 * `.strict()` sirva de algo: si se dejara el cuerpo original, el controlador seguiría
 * viendo los campos que el esquema acaba de rechazar.
 */
export function validarCuerpo(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      // Se devuelve qué campo falla y por qué: quien llama a estas rutas es personal
      // autenticado del panel, no un anónimo al que haya que no darle pistas. Un 400
      // opaco aquí solo consigue tickets de soporte.
      const detalles = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(raíz)',
        mensaje: issue.message,
      }));

      return res.status(400).json({
        error: 'Datos inválidos',
        detalles,
      });
    }

    req.body = resultado.data;
    next();
  };
}
