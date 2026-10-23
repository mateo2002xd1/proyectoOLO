/**
 * Prueba del tamaño de la sesión y de que un cambio de permisos se note al instante.
 *
 * Dos defectos que este script vigila, los dos con la misma causa —el token de sesión llevaba
 * **todas** las claves de permiso del rol—:
 *
 *  1. **El token crecía con cada sección.** Cada sección que se crea desde el editor suma una
 *     clave `editar.<ámbito>.<slug>` al rol Editor, y el JWT las copiaba todas. Con unas
 *     doscientas el token pasaba de 8 KB: la cabecera `Authorization` de la API respondía
 *     `431 Headers Overflow` y, antes, el navegador **descartaba en silencio la cookie** (el
 *     límite es de 4 KB), con lo que la persona se quedaba «sin sesión» sin razón aparente.
 *  2. **Revocar un permiso no surtía efecto hasta que caducaba el token** (8 h). El rol sí se
 *     leía de la fila, pero las policies que miran `req.user.permisos` leían los del token.
 *
 * Lo que se comprueba, contra el login y la API reales (cuenta y rol de verdad, HTTP real):
 *
 *  - el token de un rol con 300 claves de sección pesa lo mismo que el de uno con ninguna
 *    (solo viajan las claves del catálogo fijo), y cabe en una cookie;
 *  - a cambio, el token lleva `edita`, que es lo que necesita el borde del sitio web para dejar
 *    entrar al editor a quien solo edita secciones creadas a mano;
 *  - la respuesta del login **sí** trae la lista completa (la pantalla de acceso la usa) y
 *    `/api/me` también;
 *  - **con el mismo token**, quitarle `acceso.intranet` al rol hace que la petición siguiente dé
 *    403, sin volver a iniciar sesión; y devolvérselo la deja pasar otra vez.
 *
 * Escribe en la base (un rol, una cuenta y claves `editar.sitio.sesion-prueba-N`) y lo borra al
 * terminar. Solo corre contra una base y un Redis locales (`carreras-comun.ts`).
 *
 * Uso (Postgres y Redis desechables):
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:56379/7 JWT_SECRET=<uno de prueba> npm run sesion:permisos
 */
import './carreras-comun';
import http from 'http';
import jwt from 'jsonwebtoken';
import type { AddressInfo } from 'net';
import { QueryTypes } from 'sequelize';

// `require` por lo mismo que en `verificar-idor.ts`: la configuración no debe cargarse antes
// de la salvaguarda de `carreras-comun`.
const sequelize = require('../../src/config/database').default as import('sequelize').Sequelize;
const { hashearPassword } = require('../../src/shared/password-policy') as typeof import('../../src/shared/password-policy');
const { app } = require('../../src/app') as typeof import('../../src/app');
const { CLAVES_DEL_CATALOGO } = require('../../src/shared/catalogo-permisos') as typeof import('../../src/shared/catalogo-permisos');
const { revokePermission, assignPermission } =
  require('../../src/use-cases/usuarios/role-permissions.usecase') as typeof import('../../src/use-cases/usuarios/role-permissions.usecase');

const ROL = 'Editor Sesion Prueba';
const CORREO = `sesion-prueba-${Date.now()}@sena.edu.co`;
const PASSWORD = 'Sesion-Prueba-2026!x';
const SECCIONES = 300;
/** Lo que aguanta una cookie en los navegadores (RFC 6265: 4096 bytes por cookie). */
const LIMITE_DE_COOKIE = 4096;

let fallos = 0;
let comprobaciones = 0;
const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

const consulta = async <T = any>(sql: string, replacements: Record<string, unknown> = {}): Promise<T[]> =>
  (await sequelize.query(sql, { type: QueryTypes.SELECT, replacements, logging: false })) as T[];
const ejecutar = (sql: string, replacements: Record<string, unknown> = {}) =>
  sequelize.query(sql, { replacements, logging: false });

async function limpiar(): Promise<void> {
  await ejecutar('DELETE FROM usuarios WHERE email = :correo', { correo: CORREO });
  await ejecutar('DELETE FROM roles WHERE nombre = :rol', { rol: ROL });
  await ejecutar("DELETE FROM permisos WHERE clave LIKE 'editar.sitio.sesion-prueba-%'");
}

async function principal(): Promise<void> {
  const servidor = http.createServer(app as never);
  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  const base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;

  const pedir = async (ruta: string, init: RequestInit = {}) => {
    const r = await fetch(`${base}${ruta}`, init);
    const texto = await r.text();
    let json: any = null;
    try {
      json = JSON.parse(texto);
    } catch {
      /* no era JSON */
    }
    return { status: r.status, json };
  };

  try {
    await limpiar();

    // Un rol con nombre propio: las policies no lo conocen y deciden por sus claves, que es
    // justo el camino que leía el token.
    const [{ id: rolId }] = await consulta<{ id: string }>(
      'INSERT INTO roles (nombre, descripcion) VALUES (:rol, :d) RETURNING id',
      { rol: ROL, d: 'Rol de la prueba de sesión' }
    );
    const fijas = ['acceso.intranet', 'acceso.sitio', 'editar.sitio.inicio'];
    for (const clave of fijas) {
      await ejecutar('INSERT INTO roles_permisos (rol_id, permiso_id) SELECT :rolId, id FROM permisos WHERE clave = :clave', { rolId, clave });
    }
    const dinamicas = Array.from({ length: SECCIONES }, (_, i) => `editar.sitio.sesion-prueba-${i}`);
    for (const clave of dinamicas) {
      await ejecutar('INSERT INTO permisos (clave) VALUES (:clave)', { clave });
      await ejecutar('INSERT INTO roles_permisos (rol_id, permiso_id) SELECT :rolId, id FROM permisos WHERE clave = :clave', { rolId, clave });
    }

    const hash = await hashearPassword(PASSWORD);
    const [{ id: usuarioId }] = await consulta<{ id: string }>(
      `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id, estado, debe_configurar_preguntas, debe_cambiar_password)
       VALUES ('Sesion', 'Prueba', :correo, :hash, :rolId, 'active', false, false) RETURNING id`,
      { correo: CORREO, hash, rolId }
    );
    for (const [orden, pregunta] of ['pet_name', 'birth_city', 'favorite_food'].entries()) {
      await ejecutar(
        'INSERT INTO preguntas_seguridad (usuario_id, pregunta_clave, respuesta_hash, orden) VALUES (:id, :p, :h, :o)',
        { id: usuarioId, p: pregunta, h: hash, o: orden }
      );
    }

    console.log(`\n=== Sesión de un rol con ${fijas.length + SECCIONES} claves (${SECCIONES} de secciones creadas a mano) ===`);
    const entrada = await pedir('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: CORREO, password: PASSWORD }),
    });
    const token: string = entrada.json?.token ?? '';
    informar(entrada.status === 200 && token !== '', 'el login real responde 200 con token', `HTTP ${entrada.status}`);

    const antes = Buffer.byteLength(JSON.stringify({ permisos: [...fijas, ...dinamicas] }));
    informar(token.length < LIMITE_DE_COOKIE / 2, `el token cabe de sobra en una cookie (${token.length} de ${LIMITE_DE_COOKIE} bytes)`, `con todas las claves dentro habría pasado de ${antes} bytes solo en permisos`);

    const carga = jwt.decode(token) as { permisos?: string[]; edita?: boolean } | null;
    const permisosDelToken = carga?.permisos ?? [];
    informar(
      permisosDelToken.length > 0 && permisosDelToken.every((p) => CLAVES_DEL_CATALOGO.includes(p)),
      'el token solo lleva claves del catálogo fijo',
      `${permisosDelToken.length} claves`
    );
    informar(!permisosDelToken.some((p) => p.startsWith('editar.sitio.sesion-prueba-')), 'ninguna clave de sección creada a mano viaja en el token');
    informar(permisosDelToken.includes('acceso.intranet'), 'las claves del borde (acceso.intranet) siguen en el token');
    informar(carga?.edita === true, 'el token lleva `edita`: el borde del sitio deja entrar al editor a quien solo edita secciones creadas a mano');

    const delLogin: string[] = entrada.json?.user?.permisos ?? [];
    informar(dinamicas.every((c) => delLogin.includes(c)), 'la respuesta del login sí trae la lista completa (la pantalla de acceso la usa)', `${delLogin.length} claves`);

    const yo = await pedir('/api/me', { headers: { authorization: `Bearer ${token}` } });
    const delMe: string[] = yo.json?.permisos ?? [];
    informar(yo.status === 200 && dinamicas.every((c) => delMe.includes(c)), '/api/me devuelve la lista completa', `HTTP ${yo.status}, ${delMe.length} claves`);

    console.log('\n=== Un cambio de permisos se nota con el mismo token, sin volver a entrar ===');
    // `puedeVer` de la intranet: para este rol solo lo da la clave `acceso.intranet`.
    const leer = () => pedir('/api/paginas/titulos', { headers: { authorization: `Bearer ${token}`, 'x-ambito': 'intranet' } });
    const conPermiso = await leer();
    informar(conPermiso.status === 200, 'control: con `acceso.intranet` la lectura de la intranet pasa', `HTTP ${conPermiso.status}`);

    const [{ id: permisoId }] = await consulta<{ id: string }>("SELECT id FROM permisos WHERE clave = 'acceso.intranet'");
    await revokePermission(rolId, permisoId);
    const sinPermiso = await leer();
    informar(sinPermiso.status === 403, 'tras revocarlo, la petición siguiente con el MISMO token da 403', `HTTP ${sinPermiso.status}`);

    await assignPermission(rolId, permisoId);
    const devuelto = await leer();
    informar(devuelto.status === 200, 'al devolverlo, vuelve a pasar con el mismo token', `HTTP ${devuelto.status}`);
  } finally {
    await limpiar().catch((e) => console.error('No se pudo limpiar:', e));
    servidor.close();
    await sequelize.close().catch(() => undefined);
  }

  console.log(`\n${comprobaciones - fallos}/${comprobaciones} comprobaciones en orden.`);
  process.exit(fallos > 0 ? 1 : 0);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
