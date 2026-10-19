-- Última parte de `./docker/deploy.sh importar-paginas`, en la misma transacción que las
-- páginas traídas del origen.
--
-- Las páginas se cargaron con los triggers apagados (`pg_dump --disable-triggers`): así
-- entran aunque su autor sea una cuenta que en este servidor no existe. Aquí se arregla
-- eso y se comprueba antes de confirmar. Todo va con `public.` / `pg_temp.` delante: el
-- volcado deja el search_path vacío.

-- Los pasos 1 y 2 corren con las llaves foráneas sin comprobar (ver la nota del mismo
-- paso en `importar-despues.sql`); el paso 4 las comprueba a mano.
SET session_replication_role = replica;

-- 1. Autoría. Cada columna de `paginas` y `paginas_versiones` que apunta a `usuarios`
--    (creado_por, revisor_id, publicado_por…) pasa a la cuenta de este servidor con el
--    mismo correo; si no hay ninguna, queda vacía. Se leen las columnas del catálogo para
--    que una columna nueva no se escape.
DO $$
DECLARE
  r record;
  n bigint;
BEGIN
  FOR r IN
    SELECT con.conrelid::regclass AS tabla, a.attname AS columna, a.attnotnull AS obligatoria
      FROM pg_constraint con
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY (con.conkey)
     WHERE con.contype = 'f'
       AND con.confrelid = 'public.usuarios'::regclass
       AND con.conrelid IN ('public.paginas'::regclass, 'public.paginas_versiones'::regclass)
  LOOP
    EXECUTE format(
      'UPDATE %s t SET %I = d.id
         FROM pg_temp.origen_usuarios o
         JOIN public.usuarios d ON lower(d.email) = lower(o.email)
        WHERE t.%I = o.id',
      r.tabla, r.columna, r.columna);

    IF r.obligatoria THEN
      EXECUTE format(
        'SELECT count(*) FROM %s t WHERE NOT EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = t.%I)',
        r.tabla, r.columna) INTO n;
      IF n > 0 THEN
        RAISE EXCEPTION '%.% es obligatoria y % filas apuntan a una cuenta que no existe en este servidor. '
                        'No se importó nada: crea esas cuentas (mismo correo) o decide a quién asignarlas.',
                        r.tabla, r.columna, n;
      END IF;
    ELSE
      EXECUTE format(
        'UPDATE %s t SET %I = NULL
          WHERE t.%I IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = t.%I)',
        r.tabla, r.columna, r.columna, r.columna);
    END IF;
  END LOOP;
END $$;

SET session_replication_role = DEFAULT;

-- Las visitas que llevaba cada página en este servidor (apartadas en el «antes»). Una
-- página que aquí no existía se queda con las del origen.
UPDATE public.paginas p
   SET visitas = v.visitas
  FROM pg_temp.visitas_servidor v
 WHERE v.ambito = p.ambito AND v.slug = p.slug;

-- 2. Permiso de edición de cada página: una página viva son tres filas (`paginas`, la
--    clave `editar.{ambito}.{slug}` en `permisos` y su concesión en `roles_permisos`).
--    Sin la clave, una página creada desde el editor existe pero nadie puede editarla
--    (salvo Superadmin) y el botón «Editar» redirige sin decir nada.
INSERT INTO public.permisos (id, clave, created_at, updated_at)
SELECT gen_random_uuid(), 'editar.' || p.ambito || '.' || p.slug, now(), now()
  FROM public.paginas p
ON CONFLICT (clave) DO NOTHING;

-- 3. Las concesiones del origen, por nombre de rol. Solo se AÑADEN: lo que este servidor
--    ya concedía se queda. Un rol que aquí no existe se cuenta y se avisa.
INSERT INTO public.roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
  FROM pg_temp.origen_permisos_paginas o
  JOIN public.roles r ON r.nombre = o.rol
  JOIN public.permisos p ON p.clave = o.clave
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  sin_rol text;
BEGIN
  SELECT string_agg(DISTINCT o.rol, ', ')
    INTO sin_rol
    FROM pg_temp.origen_permisos_paginas o
   WHERE NOT EXISTS (SELECT 1 FROM public.roles r WHERE r.nombre = o.rol);
  IF sin_rol IS NOT NULL THEN
    RAISE WARNING 'Roles del origen que no existen en este servidor (sus permisos de edición no se copiaron): %', sin_rol;
  END IF;
END $$;

-- 4. Ninguna llave foránea de las páginas puede quedar rota.
DO $$
DECLARE
  r record;
  n bigint;
BEGIN
  FOR r IN
    SELECT con.conrelid::regclass AS tabla, a.attname AS columna,
           con.confrelid::regclass AS destino, af.attname AS columna_destino
      FROM pg_constraint con
      JOIN pg_attribute a  ON a.attrelid  = con.conrelid  AND a.attnum  = con.conkey[1]
      JOIN pg_attribute af ON af.attrelid = con.confrelid AND af.attnum = con.confkey[1]
     WHERE con.contype = 'f'
       AND con.conrelid IN ('public.paginas'::regclass, 'public.paginas_versiones'::regclass)
       AND cardinality(con.conkey) = 1
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM %s x WHERE x.%I IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM %s y WHERE y.%I = x.%I)',
      r.tabla, r.columna, r.destino, r.columna_destino, r.columna
    ) INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'Referencia rota: %.% -> % (% filas). No se importó nada.',
                      r.tabla, r.columna, r.destino, n;
    END IF;
  END LOOP;

  -- La de dos columnas (I23): la versión publicada de cada página es suya.
  SELECT count(*) INTO n
    FROM public.paginas p
   WHERE p.version_publicada_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.paginas_versiones v
                      WHERE v.id = p.version_publicada_id AND v.pagina_id = p.id);
  IF n > 0 THEN
    RAISE EXCEPTION '% páginas publican una versión que no es suya. No se importó nada.', n;
  END IF;
END $$;
