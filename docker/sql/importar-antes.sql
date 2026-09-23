-- Primera parte de `./docker/deploy.sh importar`. Va, en la MISMA transacción, antes
-- del volcado de la base de origen y de `importar-despues.sql`: si algo falla, no queda
-- nada a medias.
--
-- Vacía todas las tablas menos `migraciones_aplicadas`, que describe el esquema de ESTA
-- base (lo crearon sus migraciones) y no los datos. Hace falta vaciar también lo que
-- sembraron las migraciones (roles, permisos): el volcado trae las mismas filas y
-- chocarían por clave primaria. Incluye `usuarios`: importar es para una instalación
-- nueva, y la primera cuenta se crea después con `deploy.sh crear-admin`.

DO $$
DECLARE
  tablas text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO tablas
    FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename <> 'migraciones_aplicadas';

  EXECUTE 'TRUNCATE ' || tablas || ' RESTART IDENTITY CASCADE';
END $$;
