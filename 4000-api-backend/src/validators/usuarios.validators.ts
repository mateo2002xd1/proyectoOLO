/**
 * Esquemas de usuarios.
 *
 * El esquema anterior era un stub que no correspondía con nada: pedía `nombre`,
 * `email` y `rol` cuando la API trabaja con `name`, `email` y `role_id`. Nunca se
 * importó, así que nunca falló — pero conectarlo tal cual habría roto el alta de
 * usuarios entera. Estos están escritos contra el cuerpo que envía el panel
 * (`NuevoUsuario` y `CambiosUsuario` en `use-usuarios.ts`) y contra las columnas
 * reales del modelo `User`.
 *
 * @see 3-seguridad-del-proyecto.md §3
 */

import { z } from 'zod';

/**
 * `.trim()` antes de medir: un nombre de sólo espacios pasaba `min(1)` y llegaba a la
 * base como texto en blanco.
 */
const textoObligatorio = (max: number) => z.string().trim().min(1).max(max);

/**
 * La fecha llega del calendario del panel como 'YYYY-MM-DD', y limpiarla se hace
 * mandando cadena vacía o `null`. Los tres casos son válidos; cualquier otra cosa no.
 *
 * La cadena vacía sale de aquí convertida en `null`: es lo que entiende la columna
 * `fecha_caducidad`. Pasada tal cual, Postgres la rechaza como fecha y quitar la
 * caducidad respondía con error.
 */
const fechaOpcional = z
  .union([z.string().trim().max(64), z.null()])
  .transform((valor) => (valor === '' ? null : valor))
  .optional();

/**
 * Alta de usuario.
 *
 * `.strict()` es el punto de todo esto: `createUser` desestructura lo que conoce y le
 * pasa el resto a `UserRepository.create`, así que sin esta lista cerrada el cuerpo de
 * la petición podía escribir cualquier columna del modelo —`status`,
 * `must_change_password`, `password_hash`, `created_by`— saltándose las reglas que el
 * caso de uso aplica. Es una ruta de administrador, pero «solo lo tocan
 * administradores» no es un control de seguridad.
 *
 * No se acepta `password`: la contraseña inicial la genera el servidor
 * (`generarPasswordTemporal`) y se devuelve una sola vez. Permitir elegirla desde el
 * alta era la vía para saltarse la política de §S3.
 */
export const crearUsuarioSchema = z
  .object({
    name: textoObligatorio(200),
    apellidos: z.string().trim().max(200).optional(),
    email: z.string().trim().toLowerCase().email().max(320),
    role_id: z.string().uuid(),
    expiration_date: fechaOpcional,
  })
  .strict();

/**
 * Edición de usuario (PATCH parcial).
 *
 * Los campos siguen siendo una lista cerrada, pero todos opcionales. `role_id` se
 * admite aquí porque la ruta ya distingue quién edita: `updateUser` recibe el actor y
 * aplica su propia lista blanca de autoservicio, que no incluye ni el rol ni el
 * estado. Este esquema acota la forma; la decisión de si esta persona puede cambiar
 * ese campo sigue viviendo en el caso de uso, como pide §0.2.
 */
export const actualizarUsuarioSchema = z
  .object({
    name: textoObligatorio(200).optional(),
    apellidos: z.string().trim().max(200).optional(),
    email: z.string().trim().toLowerCase().email().max(320).optional(),
    role_id: z.string().uuid().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    expiration_date: fechaOpcional,
    reset_password: z.boolean().optional(),
    reset_security_questions: z.boolean().optional(),
  })
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No se envió ningún campo para actualizar',
  });

/**
 * Nombre de un rol que se crea o renombra desde el panel: siempre «Editor [Nombre]».
 *
 * El panel ya le antepone «Editor » al texto que se escribe, pero eso solo ordena la
 * pantalla: la API aceptaba cualquier nombre a quien tuviera `usuarios.permisos`, así que
 * una llamada directa podía crear un rol llamado «Administrador 2» o «Director». Los roles
 * base (Superadmin, Administrador, Editor, Director/Subdirector) los siembra
 * `sembrar-permisos-roles.ts`; desde aquí solo nacen roles hijos de Editor.
 */
const nombreDeRolHijo = z
  .string()
  .trim()
  .max(100)
  .regex(
    /^Editor\s+\S/,
    'El nombre del rol debe empezar por «Editor» y seguir con un nombre, por ejemplo «Editor Prensa». Solo se pueden crear roles de editor.'
  );

const descripcionDeRol = z.string().trim().max(500).nullable().optional();

/** Alta de rol. Lista cerrada: sin `es_sistema` ni ninguna otra columna del modelo. */
export const crearRolSchema = z
  .object({
    name: nombreDeRolHijo,
    description: descripcionDeRol,
  })
  .strict();

/** Edición de rol (PATCH parcial): el nombre, si viene, sigue la misma regla. */
export const actualizarRolSchema = z
  .object({
    name: nombreDeRolHijo.optional(),
    description: descripcionDeRol,
  })
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No se envió ningún campo para actualizar',
  });
