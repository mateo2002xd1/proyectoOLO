-- Primera parte de `./docker/deploy.sh importar-paginas`. Va, en la MISMA transacción,
-- antes de lo que se trae del origen y de `importar-paginas-despues.sql`: si algo falla,
-- no queda nada a medias.
--
-- Solo vacía las PÁGINAS de esta instalación. `paginas_versiones` y `subidas_pendientes`
-- caen en cascada desde `paginas`. NO se tocan `usuarios`, `roles`, `permisos`, la
-- bitácora ni ninguna otra tabla: las cuentas del servidor se quedan como están.

-- Las visitas de cada página son las de ESTE servidor (las reales), no las del origen:
-- se apartan antes de vaciar y `importar-paginas-despues.sql` las devuelve por ámbito y slug.
CREATE TEMP TABLE visitas_servidor ON COMMIT DROP AS
  SELECT ambito, slug, visitas FROM public.paginas;

DELETE FROM public.paginas;

-- Lo que llega del origen y no se guarda tal cual: sirve para traducirlo a esta base.
--  - Los correos de las cuentas del origen, para reasignar la autoría de cada versión a
--    la cuenta del servidor con el mismo correo (los UUID no coinciden entre bases).
--  - Qué rol podía editar cada página en el origen, por NOMBRE de rol: los UUID de
--    `roles` tampoco coinciden si el servidor no se instaló con `importar`.
CREATE TEMP TABLE origen_usuarios (id uuid PRIMARY KEY, email text NOT NULL) ON COMMIT DROP;
CREATE TEMP TABLE origen_permisos_paginas (clave text NOT NULL, rol text NOT NULL) ON COMMIT DROP;
