-- Semilla de Roles y Permisos del Sistema OLO

BEGIN;

-- 1. Insertar los 4 roles base del sistema
--
-- Hasta el 2026-09-15 eran 6: `Director` y `Subdirector` (permisos idénticos) se
-- fundieron en un solo rol, `Director/Subdirector`, para que el panel no pudiera
-- editarlos por separado y desincronizarlos; y `visitante_interno` se retiró por
-- duplicar ese mismo acceso de solo lectura a la intranet (commit 4d5137d6). Ese
-- commit actualizó `sembrar-permisos-roles.ts` —la fuente de verdad, que corre en
-- cada despliegue— pero no este archivo, que solo se usa al sembrar un servidor
-- nuevo desde cero (`deploy.sh sembrar`). Puesto al día el 2026-10-23.
--
-- Si esto se corre contra una base que ya tiene filas `Director`, `Subdirector` o
-- `visitante_interno` de antes de esta fecha, el `ON CONFLICT` no las toca —ninguna
-- se llama igual que `Director/Subdirector`— y hay que reasignar sus usuarios y
-- borrarlas a mano, o dejar que `npm run sembrar:permisos` las ignore como hace hoy.
INSERT INTO "roles" ("id", "nombre", "descripcion", "es_sistema", "created_at", "updated_at") VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Superadmin', 'Control total del sistema y acceso a todas las configuraciones', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'Administrador', 'Gestión de contenidos, usuarios, roles y autorizaciones', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'Editor', 'Edición y redacción de contenidos para revisión', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'Director/Subdirector', 'Consulta ejecutiva de la intranet: dirección y subdirección', true, now(), now())
ON CONFLICT ("nombre") DO UPDATE SET
  "es_sistema" = true,
  "descripcion" = EXCLUDED.descripcion;

-- 2. Insertar catálogo de permisos
--
-- Las 21 claves de `CLAVES_DEL_CATALOGO` (src/shared/catalogo-permisos.ts), que es la
-- autoridad real — la comprueba `npm run sembrar:permisos` en cada despliegue, que
-- borra de `permisos` lo que no esté ahí. Hasta el 2026-10-23 esta lista traía dos
-- claves que el catálogo ya no tiene (`editor.eliminar-bloques`, `editor.enviar-revision`
-- — ninguna ruta las comprueba) y le faltaban dos que sí tiene (`configuracion.identidad`,
-- `editar.sitio.politica-de-privacidad`, de la sección que se añadió después). Puesto
-- al día comparando las dos listas con `ts-node`, no a ojo.
INSERT INTO "permisos" ("id", "clave", "created_at", "updated_at") VALUES
  (gen_random_uuid(), 'acceso.sitio', now(), now()),
  (gen_random_uuid(), 'acceso.intranet', now(), now()),
  (gen_random_uuid(), 'acceso.panel', now(), now()),
  (gen_random_uuid(), 'secciones.crear', now(), now()),
  (gen_random_uuid(), 'secciones.eliminar', now(), now()),
  (gen_random_uuid(), 'secciones.cambiar-direccion', now(), now()),
  (gen_random_uuid(), 'configuracion.identidad', now(), now()),
  (gen_random_uuid(), 'usuarios.crear', now(), now()),
  (gen_random_uuid(), 'usuarios.editar', now(), now()),
  (gen_random_uuid(), 'usuarios.eliminar', now(), now()),
  (gen_random_uuid(), 'usuarios.permisos', now(), now()),
  (gen_random_uuid(), 'auditoria.ver', now(), now()),
  (gen_random_uuid(), 'editar.sitio.menu-y-pie', now(), now()),
  (gen_random_uuid(), 'editar.sitio.inicio', now(), now()),
  (gen_random_uuid(), 'editar.sitio.politica-de-privacidad', now(), now()),
  (gen_random_uuid(), 'editar.intranet.menu-y-pie', now(), now()),
  (gen_random_uuid(), 'editar.intranet.inicio', now(), now()),
  (gen_random_uuid(), 'editar.intranet.tasa', now(), now()),
  (gen_random_uuid(), 'editar.intranet.matriz', now(), now()),
  (gen_random_uuid(), 'editar.intranet.encuestas-calidad-de-formacion', now(), now()),
  (gen_random_uuid(), 'editar.intranet.encuestas-seguimiento-laboral', now(), now())
ON CONFLICT ("clave") DO NOTHING;

-- 3. Asignar todos los permisos a Superadmin y Administrador
INSERT INTO "roles_permisos" ("rol_id", "permiso_id")
SELECT r.id, p.id
  FROM "roles" r
 CROSS JOIN "permisos" p
 WHERE r.nombre IN ('Superadmin', 'Administrador')
ON CONFLICT DO NOTHING;

-- 4. Asignar permisos al Editor
--
-- Igual que `PERMISOS_POR_ROL.Editor` en `sembrar-permisos-roles.ts`: acceso a las dos
-- apps más todas sus secciones editables, ninguna más. Sin `acceso.panel` —el editor
-- visual vive en `/edit`, fuera de `/admin-panel`— ni las dos claves `editor.*` que ya
-- no existen en el catálogo.
INSERT INTO "roles_permisos" ("rol_id", "permiso_id")
SELECT r.id, p.id
  FROM "roles" r
  JOIN "permisos" p ON p.clave IN (
    'acceso.sitio',
    'acceso.intranet',
    'editar.sitio.menu-y-pie',
    'editar.sitio.inicio',
    'editar.sitio.politica-de-privacidad',
    'editar.intranet.menu-y-pie',
    'editar.intranet.inicio',
    'editar.intranet.tasa',
    'editar.intranet.matriz',
    'editar.intranet.encuestas-calidad-de-formacion',
    'editar.intranet.encuestas-seguimiento-laboral'
  )
 WHERE r.nombre = 'Editor'
ON CONFLICT DO NOTHING;

-- 5. Asignar acceso a la intranet para Director/Subdirector
INSERT INTO "roles_permisos" ("rol_id", "permiso_id")
SELECT r.id, p.id
  FROM "roles" r
  JOIN "permisos" p ON p.clave = 'acceso.intranet'
 WHERE r.nombre = 'Director/Subdirector'
ON CONFLICT DO NOTHING;

COMMIT;
