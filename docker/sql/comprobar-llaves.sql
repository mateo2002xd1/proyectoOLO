-- Comprobación común a `./docker/deploy.sh importar` y `./docker/deploy.sh sembrar`: va al
-- final de la misma transacción, después de `importar-despues.sql` o de
-- `importar-paginas-despues.sql`.
--
-- Ninguna llave foránea puede quedar rota. Con los triggers apagados PostgreSQL no lo
--    comprobó al cargar, así que se comprueba aquí, una por una.
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
       AND con.connamespace = 'public'::regnamespace
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
END $$;
