-- Última parte de `./docker/deploy.sh importar`, en la misma transacción que el volcado.
--
-- El volcado se carga con los triggers apagados (`pg_dump --disable-triggers`), que es
-- lo que permite que entren filas cuyo autor es un usuario que NO viaja. Aquí se arregla
-- eso antes de confirmar, y se comprueba que no quede ninguna referencia rota.

-- Los pasos 1 y 2 corren con las llaves foráneas sin comprobar. Hace falta: una fila
-- insertada en esta misma transacción vuelve a comprobar TODAS sus llaves en cualquier
-- UPDATE, así que vaciar `revisor_id` fallaba porque `publicado_por` todavía apuntaba a
-- un usuario que no está. El paso 3 las comprueba todas a mano antes de confirmar.
SET session_replication_role = replica;

-- 1. Lo que apuntaba a un usuario queda vacío. Se leen las columnas del catálogo en vez
--    de listarlas a mano, para que una columna nueva que apunte a usuarios no se escape.
--    Una columna OBLIGATORIA no se puede vaciar: si trae filas, se aborta y se explica.
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
       AND con.conrelid <> 'public.usuarios'::regclass
  LOOP
    IF r.obligatoria THEN
      EXECUTE format('SELECT count(*) FROM %s', r.tabla) INTO n;
      IF n > 0 THEN
        RAISE EXCEPTION '%.% es obligatoria y apunta a un usuario que no se importa (% filas). '
                        'No se puede dejar vacía: hay que decidir a quién asignarlas antes de importar.',
                        r.tabla, r.columna, n;
      END IF;
    ELSE
      EXECUTE format('UPDATE %s SET %I = NULL WHERE %I IS NOT NULL', r.tabla, r.columna, r.columna);
    END IF;
  END LOOP;
END $$;

-- 2. Rutas guardadas desde Windows (`uploads\cargas-datos\x.xlsx`). La API corre en
--    Linux dentro del contenedor, donde `\` no separa carpetas y el archivo no aparece.
-- (Todo va con `public.` delante: el volcado deja el search_path vacío.)
UPDATE public.archivos SET ruta_relativa = replace(ruta_relativa, E'\\', '/')
 WHERE ruta_relativa LIKE E'%\\\\%';

SET session_replication_role = DEFAULT;

-- 3. La comprobación de que ninguna llave foránea quedó rota está en `comprobar-llaves.sql`,
--    que `importar` carga a continuación en esta misma transacción.
