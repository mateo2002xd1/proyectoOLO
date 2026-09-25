-- Semilla de Roles y Permisos del Sistema OLO

BEGIN;

-- 1. Insertar los 6 roles base del sistema
INSERT INTO "roles" ("id", "nombre", "descripcion", "es_sistema", "created_at", "updated_at") VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Superadmin', 'Control total del sistema y acceso a todas las configuraciones', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'Administrador', 'Gestión de contenidos, usuarios, roles y autorizaciones', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'Editor', 'Edición y redacción de contenidos para revisión', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'Director', 'Consulta ejecutiva y dashboards de dirección', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'Subdirector', 'Consulta y seguimiento de indicadores', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000006', 'visitante_interno', 'Acceso de solo lectura a la intranet institucional', true, now(), now())
ON CONFLICT ("nombre") DO UPDATE SET
  "es_sistema" = true,
  "descripcion" = EXCLUDED.descripcion;

-- 2. Insertar catálogo de permisos
INSERT INTO "permisos" ("id", "clave", "created_at", "updated_at") VALUES
  (gen_random_uuid(), 'acceso.sitio', now(), now()),
  (gen_random_uuid(), 'acceso.intranet', now(), now()),
  (gen_random_uuid(), 'acceso.panel', now(), now()),
  (gen_random_uuid(), 'editor.eliminar-bloques', now(), now()),
  (gen_random_uuid(), 'editor.enviar-revision', now(), now()),
  (gen_random_uuid(), 'secciones.crear', now(), now()),
  (gen_random_uuid(), 'secciones.eliminar', now(), now()),
  (gen_random_uuid(), 'usuarios.crear', now(), now()),
  (gen_random_uuid(), 'usuarios.editar', now(), now()),
  (gen_random_uuid(), 'usuarios.eliminar', now(), now()),
  (gen_random_uuid(), 'usuarios.permisos', now(), now()),
  (gen_random_uuid(), 'auditoria.ver', now(), now()),
  (gen_random_uuid(), 'editar.sitio.menu-y-pie', now(), now()),
  (gen_random_uuid(), 'editar.sitio.inicio', now(), now()),
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
INSERT INTO "roles_permisos" ("rol_id", "permiso_id")
SELECT r.id, p.id
  FROM "roles" r
  JOIN "permisos" p ON p.clave IN (
    'acceso.sitio',
    'acceso.intranet',
    'acceso.panel',
    'editor.eliminar-bloques',
    'editor.enviar-revision',
    'editar.sitio.menu-y-pie',
    'editar.sitio.inicio',
    'editar.intranet.menu-y-pie',
    'editar.intranet.inicio',
    'editar.intranet.tasa',
    'editar.intranet.matriz',
    'editar.intranet.encuestas-calidad-de-formacion',
    'editar.intranet.encuestas-seguimiento-laboral'
  )
 WHERE r.nombre = 'Editor'
ON CONFLICT DO NOTHING;

-- 5. Asignar acceso a la intranet para Director, Subdirector y visitante_interno
INSERT INTO "roles_permisos" ("rol_id", "permiso_id")
SELECT r.id, p.id
  FROM "roles" r
  JOIN "permisos" p ON p.clave = 'acceso.intranet'
 WHERE r.nombre IN ('Director', 'Subdirector', 'visitante_interno')
ON CONFLICT DO NOTHING;

COMMIT;
