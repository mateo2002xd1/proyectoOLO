/* ================================================================
   NOTA DE USO (añadida el 2026-10-21)
   Esto es una FOTO del esquema de Neon tomada con una consulta de solo lectura
   el 2026-10-21. No se mantiene a mano y se desactualiza con cada migración.
   Si se contradice con otro documento, mandan: 1) las migraciones de
   4000-api-backend/src/infrastructure/db/migrations, 2) 11-base-de-datos.md
   (reglas e invariantes) y 3) 12-diccionario-de-datos.md (significado de cada
   columna). Para actualizarla, volver a correr la consulta y reemplazar el archivo.
   ================================================================ */
/* ================================================================
   INVENTARIO TÉCNICO DE BASE DE DATOS - RESULTADOS
   Motor: PostgreSQL
   ================================================================ */

/* ================================================================
   01. INFORMACIÓN GENERAL DE LA BASE DE DATOS
   ================================================================ */
/*
base_datos | usuario_consulta | esquema_actual | version_postgresql                                                                                                      | fecha_consulta                                               
-----------|------------------|----------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------
neondb     | neondb_owner     | public         | PostgreSQL 18.6 (fd34222) on aarch64-unknown-linux-gnu, compiled by gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 64-bit | Wed Oct 21 2026 11:46:52 GMT-0500 (hora estándar de Colombia)
*/

/* ================================================================
   02. ESQUEMAS
   ================================================================ */
/*
esquema
-------
public 
*/

/* ================================================================
   03. TABLAS
   ================================================================ */
/*
esquema | tabla                           | tipo      
--------|---------------------------------|-----------
public  | archivos                        | BASE TABLE
public  | auditoria_cambios               | BASE TABLE
public  | bloqueos_edicion                | BASE TABLE
public  | cargas_datos                    | BASE TABLE
public  | cargas_datos_ocupacionales      | BASE TABLE
public  | centros_formacion               | BASE TABLE
public  | ciiu_clases                     | BASE TABLE
public  | ciiu_secciones                  | BASE TABLE
public  | configuracion                   | BASE TABLE
public  | cortes_ocupacionales            | BASE TABLE
public  | criterios_ocupacionales         | BASE TABLE
public  | departamentos                   | BASE TABLE
public  | departamentos_alias             | BASE TABLE
public  | empresas                        | BASE TABLE
public  | indicadores_ocupacionales       | BASE TABLE
public  | migraciones_aplicadas           | BASE TABLE
public  | municipios                      | BASE TABLE
public  | niveles_cualificacion           | BASE TABLE
public  | niveles_formacion               | BASE TABLE
public  | niveles_ocupacionales           | BASE TABLE
public  | ocupaciones                     | BASE TABLE
public  | paginas                         | BASE TABLE
public  | paginas_versiones               | BASE TABLE
public  | periodos                        | BASE TABLE
public  | permisos                        | BASE TABLE
public  | preguntas_seguridad             | BASE TABLE
public  | programas_formacion             | BASE TABLE
public  | programas_sobresalientes        | BASE TABLE
public  | proyectos_inversion             | BASE TABLE
public  | proyectos_inversion_ubicaciones | BASE TABLE
public  | roles                           | BASE TABLE
public  | roles_permisos                  | BASE TABLE
public  | subidas_pendientes              | BASE TABLE
public  | usuarios                        | BASE TABLE
public  | v_buscador_ocupacional          | VIEW      
public  | v_estado_cargas_ocupacional     | VIEW      
*/

/* ================================================================
   04. COLUMNAS - DICCIONARIO DE DATOS
   ================================================================ */
/*
esquema | tabla                           | posicion | columna                      | tipo_dato                | tipo_postgresql | longitud | precision | escala | permite_nulos | valor_predeterminado                        
--------|---------------------------------|----------|------------------------------|--------------------------|-----------------|----------|-----------|--------|---------------|---------------------------------------------
public  | archivos                        | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | archivos                        | 2        | nombre_original              | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | archivos                        | 3        | nombre_almacenado            | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | archivos                        | 4        | ruta_relativa                | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | archivos                        | 5        | mime_type                    | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | archivos                        | 6        | extension                    | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | archivos                        | 7        | tamano_bytes                 | bigint                   | int8            | NULL     | 64        | 0      | NO            | NULL                                        
public  | archivos                        | 8        | hash_sha256                  | character                | bpchar          | 64       | NULL      | NULL   | YES           | NULL                                        
public  | archivos                        | 9        | ambito                       | text                     | text            | NULL     | NULL      | NULL   | NO            | 'publico'::text                             
public  | archivos                        | 10       | estado                       | text                     | text            | NULL     | NULL      | NULL   | NO            | 'pendiente'::text                           
public  | archivos                        | 11       | texto_alternativo            | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | archivos                        | 12       | subido_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | archivos                        | 13       | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | archivos                        | 14       | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | auditoria_cambios               | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | auditoria_cambios               | 2        | entidad_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | auditoria_cambios               | 3        | entidad_tipo                 | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | auditoria_cambios               | 4        | usuario_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | auditoria_cambios               | 5        | usuario_nombre               | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | auditoria_cambios               | 6        | accion                       | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | auditoria_cambios               | 7        | campos_modificados           | jsonb                    | jsonb           | NULL     | NULL      | NULL   | NO            | '[]'::jsonb                                 
public  | auditoria_cambios               | 8        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | auditoria_cambios               | 10       | ip                           | inet                     | inet            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | auditoria_cambios               | 11       | user_agent                   | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | bloqueos_edicion                | 1        | ambito                       | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | bloqueos_edicion                | 2        | slug                         | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | bloqueos_edicion                | 3        | usuario_id                   | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | bloqueos_edicion                | 4        | usuario_nombre               | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | bloqueos_edicion                | 5        | adquirido_en                 | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | bloqueos_edicion                | 6        | expira_en                    | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | cargas_datos                    | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | cargas_datos                    | 2        | modulo                       | character varying        | varchar         | NULL     | NULL      | NULL   | NO            | 'programa_sobresalientes'::character varying
public  | cargas_datos                    | 3        | archivo_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | cargas_datos                    | 4        | estado                       | character varying        | varchar         | NULL     | NULL      | NULL   | NO            | 'procesando'::character varying             
public  | cargas_datos                    | 5        | filas_procesadas             | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | cargas_datos                    | 6        | mensaje                      | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | cargas_datos                    | 7        | subido_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | cargas_datos                    | 8        | creado_en                    | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | cargas_datos                    | 9        | completado_en                | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | cargas_datos                    | 10       | progreso                     | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | cargas_datos                    | 11       | filas_totales                | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | cargas_datos_ocupacionales      | 1        | carga_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | cargas_datos_ocupacionales      | 2        | anio                         | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | cargas_datos_ocupacionales      | 4        | reemplazar                   | boolean                  | bool            | NULL     | NULL      | NULL   | NO            | false                                       
public  | cargas_datos_ocupacionales      | 6        | filas_nacional               | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | cargas_datos_ocupacionales      | 7        | filas_departamental          | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | cargas_datos_ocupacionales      | 8        | reporte                      | jsonb                    | jsonb           | NULL     | NULL      | NULL   | NO            | '{"errores": [], "advertencias": []}'::jsonb
public  | cargas_datos_ocupacionales      | 9        | periodo_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | cargas_datos_ocupacionales      | 10       | corte_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | centros_formacion               | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | centros_formacion               | 2        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | centros_formacion               | 3        | nombre                       | character varying        | varchar         | 255      | NULL      | NULL   | NO            | NULL                                        
public  | centros_formacion               | 4        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | centros_formacion               | 5        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | centros_formacion               | 6        | codigo                       | character varying        | varchar         | 20       | NULL      | NULL   | YES           | NULL                                        
public  | ciiu_clases                     | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | ciiu_clases                     | 2        | seccion_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_clases                     | 3        | codigo                       | character                | bpchar          | 4        | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_clases                     | 4        | nombre                       | character varying        | varchar         | 300      | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_clases                     | 5        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | ciiu_clases                     | 6        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | ciiu_secciones                  | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | ciiu_secciones                  | 2        | letra                        | character                | bpchar          | 1        | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_secciones                  | 3        | nombre                       | character varying        | varchar         | 250      | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_secciones                  | 4        | divisiones                   | character varying        | varchar         | 10       | NULL      | NULL   | NO            | NULL                                        
public  | ciiu_secciones                  | 5        | activa                       | boolean                  | bool            | NULL     | NULL      | NULL   | NO            | true                                        
public  | ciiu_secciones                  | 6        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | ciiu_secciones                  | 7        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | configuracion                   | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | configuracion                   | 2        | clave                        | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | configuracion                   | 3        | valor                        | jsonb                    | jsonb           | NULL     | NULL      | NULL   | NO            | '{}'::jsonb                                 
public  | configuracion                   | 4        | actualizado_por              | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | configuracion                   | 5        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | configuracion                   | 6        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | cortes_ocupacionales            | 2        | anio                         | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | cortes_ocupacionales            | 4        | estado                       | character varying        | varchar         | 12       | NULL      | NULL   | NO            | 'borrador'::character varying               
public  | cortes_ocupacionales            | 5        | publicado_en                 | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | cortes_ocupacionales            | 6        | huella_datos                 | character                | bpchar          | 32       | NULL      | NULL   | YES           | NULL                                        
public  | cortes_ocupacionales            | 7        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | cortes_ocupacionales            | 8        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | cortes_ocupacionales            | 9        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | cortes_ocupacionales            | 10       | periodo_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | criterios_ocupacionales         | 2        | codigo                       | character varying        | varchar         | 40       | NULL      | NULL   | NO            | NULL                                        
public  | criterios_ocupacionales         | 3        | nombre                       | character varying        | varchar         | 200      | NULL      | NULL   | NO            | NULL                                        
public  | criterios_ocupacionales         | 4        | regla                        | character varying        | varchar         | 120      | NULL      | NULL   | NO            | NULL                                        
public  | criterios_ocupacionales         | 5        | orden                        | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | criterios_ocupacionales         | 6        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | departamentos                   | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | departamentos                   | 2        | nombre                       | character varying        | varchar         | 100      | NULL      | NULL   | NO            | NULL                                        
public  | departamentos                   | 3        | codigo_dane                  | character                | bpchar          | 2        | NULL      | NULL   | NO            | NULL                                        
public  | departamentos                   | 4        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | departamentos                   | 5        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | departamentos_alias             | 1        | alias_normalizado            | character varying        | varchar         | 120      | NULL      | NULL   | NO            | NULL                                        
public  | departamentos_alias             | 2        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | empresas                        | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | empresas                        | 2        | nombre                       | character varying        | varchar         | 200      | NULL      | NULL   | NO            | NULL                                        
public  | empresas                        | 3        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | empresas                        | 4        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | indicadores_ocupacionales       | 3        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | indicadores_ocupacionales       | 5        | inscritos                    | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | indicadores_ocupacionales       | 6        | vacantes                     | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | indicadores_ocupacionales       | 7        | percentil_inscritos          | double precision         | float8          | NULL     | 53        | NULL   | YES           | NULL                                        
public  | indicadores_ocupacionales       | 8        | percentil_vacantes           | double precision         | float8          | NULL     | 53        | NULL   | YES           | NULL                                        
public  | indicadores_ocupacionales       | 10       | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | indicadores_ocupacionales       | 11       | corte_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | indicadores_ocupacionales       | 12       | ocupacion_id                 | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | indicadores_ocupacionales       | 13       | criterio_codigo              | character varying        | varchar         | 40       | NULL      | NULL   | YES           | NULL                                        
public  | migraciones_aplicadas           | 1        | nombre                       | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | migraciones_aplicadas           | 2        | aplicada_en                  | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | municipios                      | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | municipios                      | 2        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | municipios                      | 3        | nombre                       | character varying        | varchar         | 120      | NULL      | NULL   | NO            | NULL                                        
public  | municipios                      | 4        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | municipios                      | 5        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | niveles_cualificacion           | 1        | codigo_nc                    | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | niveles_cualificacion           | 3        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | niveles_cualificacion           | 4        | nivel_ocupacional_id         | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | niveles_formacion               | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | niveles_formacion               | 2        | nombre                       | character varying        | varchar         | 50       | NULL      | NULL   | NO            | NULL                                        
public  | niveles_formacion               | 3        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | niveles_formacion               | 4        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | niveles_formacion               | 5        | codigo                       | character varying        | varchar         | 20       | NULL      | NULL   | YES           | NULL                                        
public  | niveles_ocupacionales           | 2        | codigo                       | character                | bpchar          | 1        | NULL      | NULL   | NO            | NULL                                        
public  | niveles_ocupacionales           | 3        | etiqueta                     | character varying        | varchar         | 40       | NULL      | NULL   | NO            | NULL                                        
public  | niveles_ocupacionales           | 4        | nombre                       | character varying        | varchar         | 80       | NULL      | NULL   | NO            | NULL                                        
public  | niveles_ocupacionales           | 5        | descripcion                  | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | niveles_ocupacionales           | 6        | orden                        | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | niveles_ocupacionales           | 7        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | ocupaciones                     | 2        | codigo                       | character                | bpchar          | 4        | NULL      | NULL   | NO            | NULL                                        
public  | ocupaciones                     | 3        | nombre                       | character varying        | varchar         | 255      | NULL      | NULL   | NO            | NULL                                        
public  | ocupaciones                     | 4        | codigo_nc                    | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | ocupaciones                     | 5        | nombre_vigencia              | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | ocupaciones                     | 6        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | ocupaciones                     | 7        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | ocupaciones                     | 8        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | paginas                         | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | paginas                         | 2        | slug                         | character varying        | varchar         | 255      | NULL      | NULL   | NO            | NULL                                        
public  | paginas                         | 3        | titulo                       | character varying        | varchar         | 255      | NULL      | NULL   | NO            | NULL                                        
public  | paginas                         | 4        | version_publicada_id         | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas                         | 5        | creado_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas                         | 6        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | paginas                         | 7        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | paginas                         | 8        | ambito                       | text                     | text            | NULL     | NULL      | NULL   | NO            | 'sitio'::text                               
public  | paginas                         | 9        | visitas                      | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | paginas_versiones               | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | paginas_versiones               | 2        | pagina_id                    | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | paginas_versiones               | 3        | contenido                    | jsonb                    | jsonb           | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | paginas_versiones               | 4        | layout                       | jsonb                    | jsonb           | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 5        | numero_version               | integer                  | int4            | NULL     | 32        | 0      | NO            | NULL                                        
public  | paginas_versiones               | 6        | estado                       | character varying        | varchar         | 20       | NULL      | NULL   | NO            | 'borrador'::character varying               
public  | paginas_versiones               | 7        | motivo_rechazo               | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 8        | revisor_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 9        | publicado_por                | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 10       | publicado_en                 | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 11       | creado_en                    | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | paginas_versiones               | 12       | creado_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 13       | revisado_en                  | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | paginas_versiones               | 14       | comentario_cambios           | character varying        | varchar         | 100      | NULL      | NULL   | YES           | NULL                                        
public  | periodos                        | 2        | codigo                       | character varying        | varchar         | 10       | NULL      | NULL   | NO            | NULL                                        
public  | periodos                        | 3        | nombre                       | character varying        | varchar         | 40       | NULL      | NULL   | NO            | NULL                                        
public  | periodos                        | 4        | orden                        | smallint                 | int2            | NULL     | 16        | 0      | NO            | NULL                                        
public  | periodos                        | 5        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | permisos                        | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | permisos                        | 2        | clave                        | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | permisos                        | 3        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | permisos                        | 4        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | preguntas_seguridad             | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | preguntas_seguridad             | 2        | usuario_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | preguntas_seguridad             | 3        | pregunta_clave               | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | preguntas_seguridad             | 4        | respuesta_hash               | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | preguntas_seguridad             | 5        | orden                        | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | preguntas_seguridad             | 6        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | preguntas_seguridad             | 7        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | programas_formacion             | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | programas_formacion             | 2        | nivel_formacion_id           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | programas_formacion             | 3        | nombre                       | character varying        | varchar         | 255      | NULL      | NULL   | NO            | NULL                                        
public  | programas_formacion             | 4        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | programas_formacion             | 5        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | programas_formacion             | 6        | codigo                       | character varying        | varchar         | 20       | NULL      | NULL   | YES           | NULL                                        
public  | programas_sobresalientes        | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | programas_sobresalientes        | 2        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | programas_sobresalientes        | 3        | centro_id                    | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | programas_sobresalientes        | 4        | programa_id                  | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | programas_sobresalientes        | 5        | nivel_formacion_id           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | programas_sobresalientes        | 6        | sexo                         | character                | bpchar          | 1        | NULL      | NULL   | NO            | NULL                                        
public  | programas_sobresalientes        | 7        | certificados                 | integer                  | int4            | NULL     | 32        | 0      | NO            | NULL                                        
public  | programas_sobresalientes        | 8        | vinculados                   | integer                  | int4            | NULL     | 32        | 0      | NO            | NULL                                        
public  | programas_sobresalientes        | 9        | tasa_vinculacion             | numeric                  | numeric         | NULL     | 6         | 4      | NO            | NULL                                        
public  | programas_sobresalientes        | 10       | salario_promedio             | numeric                  | numeric         | NULL     | 12        | 2      | NO            | NULL                                        
public  | programas_sobresalientes        | 11       | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | programas_sobresalientes        | 12       | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | proyectos_inversion             | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | proyectos_inversion             | 2        | tipo                         | character varying        | varchar         | 10       | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 3        | descripcion                  | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 4        | empresa_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 5        | seccion_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 6        | clase_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | proyectos_inversion             | 7        | fecha_anuncio                | date                     | date            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 8        | fuente_url                   | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion             | 9        | fuente_medio                 | character varying        | varchar         | 120      | NULL      | NULL   | YES           | NULL                                        
public  | proyectos_inversion             | 10       | inversion_cop                | numeric                  | numeric         | NULL     | 18        | 0      | YES           | NULL                                        
public  | proyectos_inversion             | 11       | empleos_estimados            | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | proyectos_inversion             | 12       | estado                       | character varying        | varchar         | 12       | NULL      | NULL   | NO            | 'borrador'::character varying               
public  | proyectos_inversion             | 13       | creado_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | proyectos_inversion             | 14       | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | proyectos_inversion             | 15       | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | proyectos_inversion_ubicaciones | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | proyectos_inversion_ubicaciones | 2        | proyecto_id                  | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion_ubicaciones | 3        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | proyectos_inversion_ubicaciones | 4        | municipio_id                 | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | proyectos_inversion_ubicaciones | 5        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | roles                           | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | roles                           | 2        | nombre                       | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | roles                           | 3        | descripcion                  | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | roles                           | 4        | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | roles                           | 5        | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | roles                           | 6        | es_sistema                   | boolean                  | bool            | NULL     | NULL      | NULL   | NO            | false                                       
public  | roles_permisos                  | 1        | rol_id                       | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | roles_permisos                  | 2        | permiso_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | subidas_pendientes              | 1        | pagina_id                    | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | subidas_pendientes              | 2        | ruta                         | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | subidas_pendientes              | 3        | creado_en                    | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | usuarios                        | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | gen_random_uuid()                           
public  | usuarios                        | 2        | nombre                       | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | usuarios                        | 3        | email                        | text                     | text            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | usuarios                        | 4        | rol_id                       | uuid                     | uuid            | NULL     | NULL      | NULL   | NO            | NULL                                        
public  | usuarios                        | 5        | estado                       | text                     | text            | NULL     | NULL      | NULL   | NO            | 'active'::text                              
public  | usuarios                        | 6        | fecha_caducidad              | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 7        | ultimo_acceso_en             | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 9        | password_hash                | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 10       | created_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | usuarios                        | 11       | updated_at                   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | NO            | now()                                       
public  | usuarios                        | 12       | debe_cambiar_password        | boolean                  | bool            | NULL     | NULL      | NULL   | NO            | false                                       
public  | usuarios                        | 13       | debe_configurar_preguntas    | boolean                  | bool            | NULL     | NULL      | NULL   | NO            | true                                        
public  | usuarios                        | 14       | intentos_fallidos            | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | usuarios                        | 15       | bloqueado_hasta              | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 16       | creado_por                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 17       | apellidos                    | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 18       | intentos_fallidos_login      | integer                  | int4            | NULL     | 32        | 0      | NO            | 0                                           
public  | usuarios                        | 19       | password_temporal_vence_en   | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | usuarios                        | 20       | password_hash_anterior       | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 1        | id                           | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 2        | corte_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 3        | anio                         | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | v_buscador_ocupacional          | 4        | periodo_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 5        | periodo_codigo               | character varying        | varchar         | 10       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 6        | periodo_nombre               | character varying        | varchar         | 40       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 7        | corte_estado                 | character varying        | varchar         | 12       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 8        | departamento_id              | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 9        | codigo_dane                  | character                | bpchar          | 2        | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 10       | departamento_nombre          | character varying        | varchar         | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 11       | es_nacional                  | boolean                  | bool            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 12       | ocupacion_id                 | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 13       | ocupacion_codigo             | character                | bpchar          | 4        | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 14       | ocupacion_nombre             | character varying        | varchar         | 255      | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 15       | codigo_nc                    | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | v_buscador_ocupacional          | 16       | nivel_ocupacional_id         | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 17       | nivel_codigo                 | character                | bpchar          | 1        | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 18       | nivel_etiqueta               | character varying        | varchar         | 40       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 19       | nivel_nombre                 | character varying        | varchar         | 80       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 20       | inscritos                    | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | v_buscador_ocupacional          | 21       | vacantes                     | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | v_buscador_ocupacional          | 22       | percentil_inscritos          | double precision         | float8          | NULL     | 53        | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 23       | percentil_vacantes           | double precision         | float8          | NULL     | 53        | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 24       | criterio_codigo              | character varying        | varchar         | 40       | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 25       | criterio_nombre              | character varying        | varchar         | 200      | NULL      | NULL   | YES           | NULL                                        
public  | v_buscador_ocupacional          | 26       | criterio_orden               | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | v_buscador_ocupacional          | 27       | sin_registros                | boolean                  | bool            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 1        | anio                         | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 2        | periodo_id                   | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 3        | periodo_codigo               | character varying        | varchar         | 10       | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 4        | periodo_nombre               | character varying        | varchar         | 40       | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 5        | periodo_orden                | smallint                 | int2            | NULL     | 16        | 0      | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 6        | corte_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 7        | corte_estado                 | character varying        | varchar         | 12       | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 8        | publicado_en                 | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 9        | carga_id                     | uuid                     | uuid            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 10       | carga_estado                 | character varying        | varchar         | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 11       | archivo_nombre               | text                     | text            | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 12       | finalizado_en                | timestamp with time zone | timestamptz     | NULL     | NULL      | NULL   | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 13       | validaciones_con_advertencia | integer                  | int4            | NULL     | 32        | 0      | YES           | NULL                                        
public  | v_estado_cargas_ocupacional     | 14       | estado_celda                 | character varying        | varchar         | NULL     | NULL      | NULL   | YES           | NULL                                        
*/

/* ================================================================
   05. CLAVES PRIMARIAS
   ================================================================ */
/*
esquema | tabla                           | restriccion                          | columna           | posicion
--------|---------------------------------|--------------------------------------|-------------------|---------
public  | archivos                        | archivos_pkey                        | id                | 1       
public  | auditoria_cambios               | content_audit_logs_pkey              | id                | 1       
public  | bloqueos_edicion                | bloqueos_edicion_pkey                | ambito            | 1       
public  | bloqueos_edicion                | bloqueos_edicion_pkey                | slug              | 2       
public  | cargas_datos                    | cargas_datos_pkey                    | id                | 1       
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_pkey      | carga_id          | 1       
public  | centros_formacion               | centros_formacion_pkey               | id                | 1       
public  | ciiu_clases                     | ciiu_clases_pkey                     | id                | 1       
public  | ciiu_secciones                  | ciiu_secciones_pkey                  | id                | 1       
public  | configuracion                   | configuracion_pkey                   | id                | 1       
public  | cortes_ocupacionales            | cortes_ocupacionales_pkey            | id                | 1       
public  | criterios_ocupacionales         | criterios_ocupacionales_pkey         | id                | 1       
public  | departamentos                   | departamentos_pkey                   | id                | 1       
public  | departamentos_alias             | departamentos_alias_pkey             | alias_normalizado | 1       
public  | empresas                        | empresas_pkey                        | id                | 1       
public  | indicadores_ocupacionales       | indicadores_ocupacionales_pkey       | id                | 1       
public  | migraciones_aplicadas           | migraciones_aplicadas_pkey           | nombre            | 1       
public  | municipios                      | municipios_pkey                      | id                | 1       
public  | niveles_cualificacion           | niveles_cualificacion_pkey           | id                | 1       
public  | niveles_formacion               | niveles_formacion_pkey               | id                | 1       
public  | niveles_ocupacionales           | niveles_ocupacionales_pkey           | id                | 1       
public  | ocupaciones                     | ocupaciones_pkey                     | id                | 1       
public  | paginas                         | paginas_pkey                         | id                | 1       
public  | paginas_versiones               | paginas_versiones_pkey               | id                | 1       
public  | periodos                        | periodos_pkey                        | id                | 1       
public  | permisos                        | permissions_pkey                     | id                | 1       
public  | preguntas_seguridad             | security_questions_pkey              | id                | 1       
public  | programas_formacion             | programas_formacion_pkey             | id                | 1       
public  | programas_sobresalientes        | programas_sobresalientes_pkey        | id                | 1       
public  | proyectos_inversion             | proyectos_inversion_pkey             | id                | 1       
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_pkey | id                | 1       
public  | roles                           | roles_pkey                           | id                | 1       
public  | roles_permisos                  | role_permissions_pkey                | rol_id            | 1       
public  | roles_permisos                  | role_permissions_pkey                | permiso_id        | 2       
public  | subidas_pendientes              | subidas_pendientes_pkey              | pagina_id         | 1       
public  | subidas_pendientes              | subidas_pendientes_pkey              | ruta              | 2       
public  | usuarios                        | users_pkey                           | id                | 1       
*/

/* ================================================================
   06. CLAVES FORÁNEAS
   ================================================================ */
/*
esquema | tabla                           | restriccion                                          | columna              | esquema_referenciado | tabla_referenciada      | columna_referenciada
--------|---------------------------------|------------------------------------------------------|----------------------|----------------------|-------------------------|---------------------
public  | archivos                        | archivos_subido_por_fkey                             | subido_por           | public               | usuarios                | id                  
public  | auditoria_cambios               | content_audit_logs_user_id_fkey                      | usuario_id           | public               | usuarios                | id                  
public  | cargas_datos                    | cargas_datos_archivo_id_fkey                         | archivo_id           | public               | archivos                | id                  
public  | cargas_datos                    | cargas_datos_subido_por_fkey                         | subido_por           | public               | usuarios                | id                  
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_carga_id_fkey             | carga_id             | public               | cargas_datos            | id                  
public  | cargas_datos_ocupacionales      | fk_cargas_datos_ocupacionales_corte                  | corte_id             | public               | cortes_ocupacionales    | id                  
public  | cargas_datos_ocupacionales      | fk_cargas_datos_ocupacionales_periodo                | periodo_id           | public               | periodos                | id                  
public  | centros_formacion               | centros_formacion_departamento_id_fkey               | departamento_id      | public               | departamentos           | id                  
public  | ciiu_clases                     | ciiu_clases_seccion_id_fkey                          | seccion_id           | public               | ciiu_secciones          | id                  
public  | configuracion                   | configuracion_actualizado_por_fkey                   | actualizado_por      | public               | usuarios                | id                  
public  | cortes_ocupacionales            | fk_cortes_ocupacionales_periodo                      | periodo_id           | public               | periodos                | id                  
public  | departamentos_alias             | departamentos_alias_departamento_id_fkey             | departamento_id      | public               | departamentos           | id                  
public  | indicadores_ocupacionales       | fk_indicadores_ocupacionales_corte                   | corte_id             | public               | cortes_ocupacionales    | id                  
public  | indicadores_ocupacionales       | fk_indicadores_ocupacionales_criterio                | criterio_codigo      | public               | criterios_ocupacionales | codigo              
public  | indicadores_ocupacionales       | fk_indicadores_ocupacionales_ocupacion               | ocupacion_id         | public               | ocupaciones             | id                  
public  | indicadores_ocupacionales       | indicadores_ocupacionales_departamento_id_fkey       | departamento_id      | public               | departamentos           | id                  
public  | municipios                      | municipios_departamento_id_fkey                      | departamento_id      | public               | departamentos           | id                  
public  | niveles_cualificacion           | fk_niveles_cualificacion_nivel_ocupacional           | nivel_ocupacional_id | public               | niveles_ocupacionales   | id                  
public  | ocupaciones                     | fk_ocupaciones_codigo_nc                             | codigo_nc            | public               | niveles_cualificacion   | codigo_nc           
public  | paginas                         | fk_paginas_version_publicada                         | id                   | public               | paginas_versiones       | pagina_id           
public  | paginas                         | fk_paginas_version_publicada                         | version_publicada_id | public               | paginas_versiones       | id                  
public  | paginas                         | fk_paginas_version_publicada                         | id                   | public               | paginas_versiones       | id                  
public  | paginas                         | fk_paginas_version_publicada                         | version_publicada_id | public               | paginas_versiones       | pagina_id           
public  | paginas                         | paginas_creado_por_fkey                              | creado_por           | public               | usuarios                | id                  
public  | paginas_versiones               | paginas_versiones_creado_por_fkey                    | creado_por           | public               | usuarios                | id                  
public  | paginas_versiones               | paginas_versiones_pagina_id_fkey                     | pagina_id            | public               | paginas                 | id                  
public  | paginas_versiones               | paginas_versiones_publicado_por_fkey                 | publicado_por        | public               | usuarios                | id                  
public  | paginas_versiones               | paginas_versiones_revisor_id_fkey                    | revisor_id           | public               | usuarios                | id                  
public  | preguntas_seguridad             | security_questions_user_id_fkey                      | usuario_id           | public               | usuarios                | id                  
public  | programas_formacion             | programas_formacion_nivel_formacion_id_fkey          | nivel_formacion_id   | public               | niveles_formacion       | id                  
public  | programas_sobresalientes        | fk_sobresalientes_centro_departamento                | centro_id            | public               | centros_formacion       | departamento_id     
public  | programas_sobresalientes        | fk_sobresalientes_centro_departamento                | centro_id            | public               | centros_formacion       | id                  
public  | programas_sobresalientes        | fk_sobresalientes_centro_departamento                | departamento_id      | public               | centros_formacion       | id                  
public  | programas_sobresalientes        | fk_sobresalientes_centro_departamento                | departamento_id      | public               | centros_formacion       | departamento_id     
public  | programas_sobresalientes        | fk_sobresalientes_programa_nivel                     | nivel_formacion_id   | public               | programas_formacion     | id                  
public  | programas_sobresalientes        | fk_sobresalientes_programa_nivel                     | nivel_formacion_id   | public               | programas_formacion     | nivel_formacion_id  
public  | programas_sobresalientes        | fk_sobresalientes_programa_nivel                     | programa_id          | public               | programas_formacion     | id                  
public  | programas_sobresalientes        | fk_sobresalientes_programa_nivel                     | programa_id          | public               | programas_formacion     | nivel_formacion_id  
public  | programas_sobresalientes        | programas_sobresalientes_centro_id_fkey              | centro_id            | public               | centros_formacion       | id                  
public  | programas_sobresalientes        | programas_sobresalientes_departamento_id_fkey        | departamento_id      | public               | departamentos           | id                  
public  | programas_sobresalientes        | programas_sobresalientes_nivel_formacion_id_fkey     | nivel_formacion_id   | public               | niveles_formacion       | id                  
public  | programas_sobresalientes        | programas_sobresalientes_programa_id_fkey            | programa_id          | public               | programas_formacion     | id                  
public  | proyectos_inversion             | fk_proyectos_inversion_clase_seccion                 | clase_id             | public               | ciiu_clases             | id                  
public  | proyectos_inversion             | fk_proyectos_inversion_clase_seccion                 | seccion_id           | public               | ciiu_clases             | id                  
public  | proyectos_inversion             | fk_proyectos_inversion_clase_seccion                 | clase_id             | public               | ciiu_clases             | seccion_id          
public  | proyectos_inversion             | fk_proyectos_inversion_clase_seccion                 | seccion_id           | public               | ciiu_clases             | seccion_id          
public  | proyectos_inversion             | proyectos_inversion_clase_id_fkey                    | clase_id             | public               | ciiu_clases             | id                  
public  | proyectos_inversion             | proyectos_inversion_creado_por_fkey                  | creado_por           | public               | usuarios                | id                  
public  | proyectos_inversion             | proyectos_inversion_empresa_id_fkey                  | empresa_id           | public               | empresas                | id                  
public  | proyectos_inversion             | proyectos_inversion_seccion_id_fkey                  | seccion_id           | public               | ciiu_secciones          | id                  
public  | proyectos_inversion_ubicaciones | fk_proyectos_ubicaciones_municipio_departamento      | departamento_id      | public               | municipios              | id                  
public  | proyectos_inversion_ubicaciones | fk_proyectos_ubicaciones_municipio_departamento      | municipio_id         | public               | municipios              | id                  
public  | proyectos_inversion_ubicaciones | fk_proyectos_ubicaciones_municipio_departamento      | departamento_id      | public               | municipios              | departamento_id     
public  | proyectos_inversion_ubicaciones | fk_proyectos_ubicaciones_municipio_departamento      | municipio_id         | public               | municipios              | departamento_id     
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_departamento_id_fkey | departamento_id      | public               | departamentos           | id                  
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_municipio_id_fkey    | municipio_id         | public               | municipios              | id                  
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_proyecto_id_fkey     | proyecto_id          | public               | proyectos_inversion     | id                  
public  | roles_permisos                  | role_permissions_permission_id_fkey                  | permiso_id           | public               | permisos                | id                  
public  | roles_permisos                  | role_permissions_role_id_fkey                        | rol_id               | public               | roles                   | id                  
public  | subidas_pendientes              | subidas_pendientes_pagina_id_fkey                    | pagina_id            | public               | paginas                 | id                  
public  | usuarios                        | users_role_id_fkey                                   | rol_id               | public               | roles                   | id                  
public  | usuarios                        | usuarios_creado_por_fkey                             | creado_por           | public               | usuarios                | id                  
*/

/* ================================================================
   07. RESTRICCIONES UNIQUE Y CHECK
   ================================================================ */
/*
esquema | tabla                           | restriccion                                              | tipo  
--------|---------------------------------|----------------------------------------------------------|-------
public  | archivos                        | archivos_ambito_check                                    | CHECK 
public  | archivos                        | archivos_ambito_not_null                                 | CHECK 
public  | archivos                        | archivos_created_at_not_null                             | CHECK 
public  | archivos                        | archivos_estado_check                                    | CHECK 
public  | archivos                        | archivos_estado_not_null                                 | CHECK 
public  | archivos                        | archivos_id_not_null                                     | CHECK 
public  | archivos                        | archivos_mime_type_not_null                              | CHECK 
public  | archivos                        | archivos_nombre_almacenado_not_null                      | CHECK 
public  | archivos                        | archivos_nombre_original_not_null                        | CHECK 
public  | archivos                        | archivos_ruta_relativa_not_null                          | CHECK 
public  | archivos                        | archivos_tamano_bytes_check                              | CHECK 
public  | archivos                        | archivos_tamano_bytes_not_null                           | CHECK 
public  | archivos                        | archivos_updated_at_not_null                             | CHECK 
public  | archivos                        | archivos_nombre_almacenado_key                           | UNIQUE
public  | auditoria_cambios               | auditoria_cambios_campos_modificados_not_null            | CHECK 
public  | auditoria_cambios               | auditoria_cambios_entidad_tipo_not_null                  | CHECK 
public  | auditoria_cambios               | ck_auditoria_accion                                      | CHECK 
public  | auditoria_cambios               | ck_auditoria_entidad                                     | CHECK 
public  | auditoria_cambios               | content_audit_logs_action_type_not_null                  | CHECK 
public  | auditoria_cambios               | content_audit_logs_content_id_not_null                   | CHECK 
public  | auditoria_cambios               | content_audit_logs_created_at_not_null                   | CHECK 
public  | auditoria_cambios               | content_audit_logs_id_not_null                           | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_adquirido_en_not_null                   | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_ambito_check                            | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_ambito_not_null                         | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_expira_en_not_null                      | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_slug_not_null                           | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_usuario_id_not_null                     | CHECK 
public  | bloqueos_edicion                | bloqueos_edicion_usuario_nombre_not_null                 | CHECK 
public  | cargas_datos                    | cargas_datos_creado_en_not_null                          | CHECK 
public  | cargas_datos                    | cargas_datos_estado_check                                | CHECK 
public  | cargas_datos                    | cargas_datos_estado_not_null                             | CHECK 
public  | cargas_datos                    | cargas_datos_filas_procesadas_not_null                   | CHECK 
public  | cargas_datos                    | cargas_datos_id_not_null                                 | CHECK 
public  | cargas_datos                    | cargas_datos_modulo_not_null                             | CHECK 
public  | cargas_datos                    | cargas_datos_progreso_not_null                           | CHECK 
public  | cargas_datos                    | ck_cargas_datos_modulo                                   | CHECK 
public  | cargas_datos                    | ck_cargas_datos_progreso                                 | CHECK 
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_anio_not_null                 | CHECK 
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_carga_id_not_null             | CHECK 
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_periodo_id_not_null           | CHECK 
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_reemplazar_not_null           | CHECK 
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_reporte_not_null              | CHECK 
public  | cargas_datos_ocupacionales      | ck_cargas_datos_ocupacionales_anio                       | CHECK 
public  | centros_formacion               | centros_formacion_created_at_not_null                    | CHECK 
public  | centros_formacion               | centros_formacion_departamento_id_not_null               | CHECK 
public  | centros_formacion               | centros_formacion_id_not_null                            | CHECK 
public  | centros_formacion               | centros_formacion_nombre_not_null                        | CHECK 
public  | centros_formacion               | centros_formacion_updated_at_not_null                    | CHECK 
public  | centros_formacion               | ck_centros_formacion_codigo                              | CHECK 
public  | centros_formacion               | uq_centros_formacion_codigo                              | UNIQUE
public  | centros_formacion               | uq_centros_formacion_id_departamento                     | UNIQUE
public  | ciiu_clases                     | ciiu_clases_codigo_not_null                              | CHECK 
public  | ciiu_clases                     | ciiu_clases_created_at_not_null                          | CHECK 
public  | ciiu_clases                     | ciiu_clases_id_not_null                                  | CHECK 
public  | ciiu_clases                     | ciiu_clases_nombre_not_null                              | CHECK 
public  | ciiu_clases                     | ciiu_clases_seccion_id_not_null                          | CHECK 
public  | ciiu_clases                     | ciiu_clases_updated_at_not_null                          | CHECK 
public  | ciiu_clases                     | ck_ciiu_clases_codigo                                    | CHECK 
public  | ciiu_clases                     | uq_ciiu_clases_codigo                                    | UNIQUE
public  | ciiu_clases                     | uq_ciiu_clases_id_seccion                                | UNIQUE
public  | ciiu_secciones                  | ciiu_secciones_activa_not_null                           | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_created_at_not_null                       | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_divisiones_not_null                       | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_id_not_null                               | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_letra_not_null                            | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_nombre_not_null                           | CHECK 
public  | ciiu_secciones                  | ciiu_secciones_updated_at_not_null                       | CHECK 
public  | ciiu_secciones                  | ck_ciiu_secciones_letra                                  | CHECK 
public  | ciiu_secciones                  | uq_ciiu_secciones_letra                                  | UNIQUE
public  | configuracion                   | ck_configuracion_valor_objeto                            | CHECK 
public  | configuracion                   | configuracion_clave_not_null                             | CHECK 
public  | configuracion                   | configuracion_created_at_not_null                        | CHECK 
public  | configuracion                   | configuracion_id_not_null                                | CHECK 
public  | configuracion                   | configuracion_updated_at_not_null                        | CHECK 
public  | configuracion                   | configuracion_valor_not_null                             | CHECK 
public  | configuracion                   | uq_configuracion_clave                                   | UNIQUE
public  | cortes_ocupacionales            | ck_cortes_ocupacionales_anio                             | CHECK 
public  | cortes_ocupacionales            | ck_cortes_ocupacionales_publicado_en                     | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_anio_not_null                       | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_created_at_not_null                 | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_estado_check                        | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_estado_not_null                     | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_id_nuevo_not_null                   | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_periodo_id_not_null                 | CHECK 
public  | cortes_ocupacionales            | cortes_ocupacionales_updated_at_not_null                 | CHECK 
public  | cortes_ocupacionales            | uq_cortes_ocupacionales_anio_periodo                     | UNIQUE
public  | criterios_ocupacionales         | criterios_ocupacionales_codigo_not_null                  | CHECK 
public  | criterios_ocupacionales         | criterios_ocupacionales_id_nuevo_not_null                | CHECK 
public  | criterios_ocupacionales         | criterios_ocupacionales_nombre_not_null                  | CHECK 
public  | criterios_ocupacionales         | criterios_ocupacionales_orden_not_null                   | CHECK 
public  | criterios_ocupacionales         | criterios_ocupacionales_regla_not_null                   | CHECK 
public  | criterios_ocupacionales         | criterios_ocupacionales_codigo_key                       | UNIQUE
public  | departamentos                   | ck_departamentos_codigo_dane                             | CHECK 
public  | departamentos                   | departamentos_codigo_dane_not_null                       | CHECK 
public  | departamentos                   | departamentos_created_at_not_null                        | CHECK 
public  | departamentos                   | departamentos_id_not_null                                | CHECK 
public  | departamentos                   | departamentos_nombre_not_null                            | CHECK 
public  | departamentos                   | departamentos_updated_at_not_null                        | CHECK 
public  | departamentos                   | uq_departamentos_codigo_dane                             | UNIQUE
public  | departamentos_alias             | departamentos_alias_alias_normalizado_not_null           | CHECK 
public  | departamentos_alias             | departamentos_alias_departamento_id_not_null             | CHECK 
public  | empresas                        | empresas_created_at_not_null                             | CHECK 
public  | empresas                        | empresas_id_not_null                                     | CHECK 
public  | empresas                        | empresas_nombre_not_null                                 | CHECK 
public  | empresas                        | empresas_updated_at_not_null                             | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_corte_id_not_null              | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_id_nuevo_not_null              | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_inscritos_check                | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_inscritos_not_null             | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_ocupacion_id_not_null          | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_percentil_inscritos_check      | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_percentil_vacantes_check       | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_vacantes_check                 | CHECK 
public  | indicadores_ocupacionales       | indicadores_ocupacionales_vacantes_not_null              | CHECK 
public  | migraciones_aplicadas           | migraciones_aplicadas_aplicada_en_not_null               | CHECK 
public  | migraciones_aplicadas           | migraciones_aplicadas_nombre_not_null                    | CHECK 
public  | municipios                      | municipios_created_at_not_null                           | CHECK 
public  | municipios                      | municipios_departamento_id_not_null                      | CHECK 
public  | municipios                      | municipios_id_not_null                                   | CHECK 
public  | municipios                      | municipios_nombre_not_null                               | CHECK 
public  | municipios                      | municipios_updated_at_not_null                           | CHECK 
public  | municipios                      | uq_municipios_id_departamento                            | UNIQUE
public  | niveles_cualificacion           | niveles_cualificacion_codigo_nc_not_null                 | CHECK 
public  | niveles_cualificacion           | niveles_cualificacion_id_nuevo_not_null                  | CHECK 
public  | niveles_cualificacion           | niveles_cualificacion_nivel_ocupacional_id_not_null      | CHECK 
public  | niveles_cualificacion           | uq_niveles_cualificacion_codigo_nc                       | UNIQUE
public  | niveles_formacion               | ck_niveles_formacion_codigo                              | CHECK 
public  | niveles_formacion               | niveles_formacion_created_at_not_null                    | CHECK 
public  | niveles_formacion               | niveles_formacion_id_not_null                            | CHECK 
public  | niveles_formacion               | niveles_formacion_nombre_not_null                        | CHECK 
public  | niveles_formacion               | niveles_formacion_updated_at_not_null                    | CHECK 
public  | niveles_formacion               | uq_niveles_formacion_codigo                              | UNIQUE
public  | niveles_ocupacionales           | niveles_ocupacionales_codigo_not_null                    | CHECK 
public  | niveles_ocupacionales           | niveles_ocupacionales_etiqueta_not_null                  | CHECK 
public  | niveles_ocupacionales           | niveles_ocupacionales_id_nuevo_not_null                  | CHECK 
public  | niveles_ocupacionales           | niveles_ocupacionales_nombre_not_null                    | CHECK 
public  | niveles_ocupacionales           | niveles_ocupacionales_orden_not_null                     | CHECK 
public  | niveles_ocupacionales           | niveles_ocupacionales_codigo_key                         | UNIQUE
public  | niveles_ocupacionales           | niveles_ocupacionales_etiqueta_key                       | UNIQUE
public  | ocupaciones                     | ocupaciones_codigo_check                                 | CHECK 
public  | ocupaciones                     | ocupaciones_codigo_not_null                              | CHECK 
public  | ocupaciones                     | ocupaciones_created_at_not_null                          | CHECK 
public  | ocupaciones                     | ocupaciones_id_nuevo_not_null                            | CHECK 
public  | ocupaciones                     | ocupaciones_nombre_not_null                              | CHECK 
public  | ocupaciones                     | ocupaciones_nombre_vigencia_not_null                     | CHECK 
public  | ocupaciones                     | ocupaciones_updated_at_not_null                          | CHECK 
public  | ocupaciones                     | ocupaciones_codigo_key                                   | UNIQUE
public  | paginas                         | ck_paginas_ambito                                        | CHECK 
public  | paginas                         | paginas_ambito_not_null                                  | CHECK 
public  | paginas                         | paginas_created_at_not_null                              | CHECK 
public  | paginas                         | paginas_id_not_null                                      | CHECK 
public  | paginas                         | paginas_slug_not_null                                    | CHECK 
public  | paginas                         | paginas_titulo_not_null                                  | CHECK 
public  | paginas                         | paginas_updated_at_not_null                              | CHECK 
public  | paginas                         | paginas_visitas_not_null                                 | CHECK 
public  | paginas_versiones               | ck_paginas_versiones_comentario                          | CHECK 
public  | paginas_versiones               | ck_paginas_versiones_estado                              | CHECK 
public  | paginas_versiones               | ck_paginas_versiones_motivo                              | CHECK 
public  | paginas_versiones               | ck_paginas_versiones_publicado_en                        | CHECK 
public  | paginas_versiones               | paginas_versiones_contenido_not_null                     | CHECK 
public  | paginas_versiones               | paginas_versiones_creado_en_not_null                     | CHECK 
public  | paginas_versiones               | paginas_versiones_estado_not_null                        | CHECK 
public  | paginas_versiones               | paginas_versiones_id_not_null                            | CHECK 
public  | paginas_versiones               | paginas_versiones_numero_version_not_null                | CHECK 
public  | paginas_versiones               | paginas_versiones_pagina_id_not_null                     | CHECK 
public  | paginas_versiones               | uq_paginas_versiones_id_pagina                           | UNIQUE
public  | paginas_versiones               | uq_paginas_versiones_numero                              | UNIQUE
public  | periodos                        | periodos_codigo_not_null                                 | CHECK 
public  | periodos                        | periodos_id_nuevo_not_null                               | CHECK 
public  | periodos                        | periodos_nombre_not_null                                 | CHECK 
public  | periodos                        | periodos_orden_not_null                                  | CHECK 
public  | periodos                        | periodos_codigo_key                                      | UNIQUE
public  | permisos                        | permissions_created_at_not_null                          | CHECK 
public  | permisos                        | permissions_id_not_null                                  | CHECK 
public  | permisos                        | permissions_name_not_null                                | CHECK 
public  | permisos                        | permissions_updated_at_not_null                          | CHECK 
public  | permisos                        | permissions_name_key61                                   | UNIQUE
public  | preguntas_seguridad             | preguntas_seguridad_orden_not_null                       | CHECK 
public  | preguntas_seguridad             | security_questions_answer_hash_not_null                  | CHECK 
public  | preguntas_seguridad             | security_questions_created_at_not_null                   | CHECK 
public  | preguntas_seguridad             | security_questions_id_not_null                           | CHECK 
public  | preguntas_seguridad             | security_questions_question_key_not_null                 | CHECK 
public  | preguntas_seguridad             | security_questions_updated_at_not_null                   | CHECK 
public  | preguntas_seguridad             | security_questions_user_id_not_null                      | CHECK 
public  | programas_formacion             | ck_programas_formacion_codigo                            | CHECK 
public  | programas_formacion             | programas_formacion_created_at_not_null                  | CHECK 
public  | programas_formacion             | programas_formacion_id_not_null                          | CHECK 
public  | programas_formacion             | programas_formacion_nivel_formacion_id_not_null          | CHECK 
public  | programas_formacion             | programas_formacion_nombre_not_null                      | CHECK 
public  | programas_formacion             | programas_formacion_updated_at_not_null                  | CHECK 
public  | programas_formacion             | uq_programas_formacion_codigo                            | UNIQUE
public  | programas_formacion             | uq_programas_formacion_id_nivel                          | UNIQUE
public  | programas_sobresalientes        | ck_sobresalientes_certificados                           | CHECK 
public  | programas_sobresalientes        | ck_sobresalientes_salario                                | CHECK 
public  | programas_sobresalientes        | ck_sobresalientes_sexo                                   | CHECK 
public  | programas_sobresalientes        | ck_sobresalientes_tasa                                   | CHECK 
public  | programas_sobresalientes        | ck_sobresalientes_vinculados                             | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_centro_id_not_null              | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_certificados_not_null           | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_created_at_not_null             | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_departamento_id_not_null        | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_id_not_null                     | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_nivel_formacion_id_not_null     | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_programa_id_not_null            | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_salario_promedio_not_null       | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_sexo_not_null                   | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_tasa_vinculacion_not_null       | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_updated_at_not_null             | CHECK 
public  | programas_sobresalientes        | programas_sobresalientes_vinculados_not_null             | CHECK 
public  | programas_sobresalientes        | uq_sobresalientes_registro                               | UNIQUE
public  | proyectos_inversion             | ck_proyectos_inversion_empleos                           | CHECK 
public  | proyectos_inversion             | ck_proyectos_inversion_estado                            | CHECK 
public  | proyectos_inversion             | ck_proyectos_inversion_fuente_url                        | CHECK 
public  | proyectos_inversion             | ck_proyectos_inversion_inversion_cop                     | CHECK 
public  | proyectos_inversion             | ck_proyectos_inversion_tipo                              | CHECK 
public  | proyectos_inversion             | proyectos_inversion_created_at_not_null                  | CHECK 
public  | proyectos_inversion             | proyectos_inversion_descripcion_not_null                 | CHECK 
public  | proyectos_inversion             | proyectos_inversion_empresa_id_not_null                  | CHECK 
public  | proyectos_inversion             | proyectos_inversion_estado_not_null                      | CHECK 
public  | proyectos_inversion             | proyectos_inversion_fecha_anuncio_not_null               | CHECK 
public  | proyectos_inversion             | proyectos_inversion_fuente_url_not_null                  | CHECK 
public  | proyectos_inversion             | proyectos_inversion_id_not_null                          | CHECK 
public  | proyectos_inversion             | proyectos_inversion_seccion_id_not_null                  | CHECK 
public  | proyectos_inversion             | proyectos_inversion_tipo_not_null                        | CHECK 
public  | proyectos_inversion             | proyectos_inversion_updated_at_not_null                  | CHECK 
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_created_at_not_null      | CHECK 
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_departamento_id_not_null | CHECK 
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_id_not_null              | CHECK 
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_proyecto_id_not_null     | CHECK 
public  | proyectos_inversion_ubicaciones | uq_proyectos_ubicaciones                                 | UNIQUE
public  | roles                           | roles_created_at_not_null                                | CHECK 
public  | roles                           | roles_es_sistema_not_null                                | CHECK 
public  | roles                           | roles_id_not_null                                        | CHECK 
public  | roles                           | roles_name_not_null                                      | CHECK 
public  | roles                           | roles_updated_at_not_null                                | CHECK 
public  | roles                           | roles_name_key62                                         | UNIQUE
public  | roles_permisos                  | role_permissions_permission_id_not_null                  | CHECK 
public  | roles_permisos                  | role_permissions_role_id_not_null                        | CHECK 
public  | subidas_pendientes              | subidas_pendientes_creado_en_not_null                    | CHECK 
public  | subidas_pendientes              | subidas_pendientes_pagina_id_not_null                    | CHECK 
public  | subidas_pendientes              | subidas_pendientes_ruta_not_null                         | CHECK 
public  | usuarios                        | ck_usuarios_email_minusculas                             | CHECK 
public  | usuarios                        | ck_usuarios_estado                                       | CHECK 
public  | usuarios                        | users_created_at_not_null                                | CHECK 
public  | usuarios                        | users_email_not_null                                     | CHECK 
public  | usuarios                        | users_id_not_null                                        | CHECK 
public  | usuarios                        | users_name_not_null                                      | CHECK 
public  | usuarios                        | users_role_id_not_null                                   | CHECK 
public  | usuarios                        | users_status_not_null                                    | CHECK 
public  | usuarios                        | users_updated_at_not_null                                | CHECK 
public  | usuarios                        | usuarios_debe_cambiar_password_not_null                  | CHECK 
public  | usuarios                        | usuarios_debe_configurar_preguntas_not_null              | CHECK 
public  | usuarios                        | usuarios_intentos_fallidos_login_not_null                | CHECK 
public  | usuarios                        | usuarios_intentos_fallidos_not_null                      | CHECK 
public  | usuarios                        | uq_usuarios_email                                        | UNIQUE
*/

/* ================================================================
   08. ÍNDICES
   ================================================================ */
/*
esquema | tabla                           | indice                                     | definicion                                                                                                                                                                                  
--------|---------------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
public  | archivos                        | archivos_nombre_almacenado_key             | CREATE UNIQUE INDEX archivos_nombre_almacenado_key ON public.archivos USING btree (nombre_almacenado)                                                                                       
public  | archivos                        | archivos_pkey                              | CREATE UNIQUE INDEX archivos_pkey ON public.archivos USING btree (id)                                                                                                                       
public  | archivos                        | uq_archivos_hash                           | CREATE UNIQUE INDEX uq_archivos_hash ON public.archivos USING btree (hash_sha256) WHERE (hash_sha256 IS NOT NULL)                                                                           
public  | auditoria_cambios               | content_audit_logs_pkey                    | CREATE UNIQUE INDEX content_audit_logs_pkey ON public.auditoria_cambios USING btree (id)                                                                                                    
public  | auditoria_cambios               | idx_auditoria_accion                       | CREATE INDEX idx_auditoria_accion ON public.auditoria_cambios USING btree (accion)                                                                                                          
public  | auditoria_cambios               | idx_auditoria_entidad                      | CREATE INDEX idx_auditoria_entidad ON public.auditoria_cambios USING btree (entidad_tipo, entidad_id, created_at DESC)                                                                      
public  | auditoria_cambios               | idx_auditoria_fecha                        | CREATE INDEX idx_auditoria_fecha ON public.auditoria_cambios USING btree (created_at DESC)                                                                                                  
public  | auditoria_cambios               | idx_auditoria_usuario                      | CREATE INDEX idx_auditoria_usuario ON public.auditoria_cambios USING btree (usuario_id)                                                                                                     
public  | bloqueos_edicion                | bloqueos_edicion_pkey                      | CREATE UNIQUE INDEX bloqueos_edicion_pkey ON public.bloqueos_edicion USING btree (ambito, slug)                                                                                             
public  | bloqueos_edicion                | idx_bloqueos_edicion_expira                | CREATE INDEX idx_bloqueos_edicion_expira ON public.bloqueos_edicion USING btree (expira_en)                                                                                                 
public  | cargas_datos                    | cargas_datos_pkey                          | CREATE UNIQUE INDEX cargas_datos_pkey ON public.cargas_datos USING btree (id)                                                                                                               
public  | cargas_datos                    | idx_cargas_datos_modulo_estado             | CREATE INDEX idx_cargas_datos_modulo_estado ON public.cargas_datos USING btree (modulo, estado, creado_en DESC)                                                                             
public  | cargas_datos_ocupacionales      | cargas_datos_ocupacionales_pkey            | CREATE UNIQUE INDEX cargas_datos_ocupacionales_pkey ON public.cargas_datos_ocupacionales USING btree (carga_id)                                                                             
public  | cargas_datos_ocupacionales      | idx_cargas_datos_ocupacionales_celda       | CREATE INDEX idx_cargas_datos_ocupacionales_celda ON public.cargas_datos_ocupacionales USING btree (anio, periodo_id)                                                                       
public  | centros_formacion               | centros_formacion_pkey                     | CREATE UNIQUE INDEX centros_formacion_pkey ON public.centros_formacion USING btree (id)                                                                                                     
public  | centros_formacion               | uq_centros_formacion_codigo                | CREATE UNIQUE INDEX uq_centros_formacion_codigo ON public.centros_formacion USING btree (codigo)                                                                                            
public  | centros_formacion               | uq_centros_formacion_id_departamento       | CREATE UNIQUE INDEX uq_centros_formacion_id_departamento ON public.centros_formacion USING btree (id, departamento_id)                                                                      
public  | ciiu_clases                     | ciiu_clases_pkey                           | CREATE UNIQUE INDEX ciiu_clases_pkey ON public.ciiu_clases USING btree (id)                                                                                                                 
public  | ciiu_clases                     | uq_ciiu_clases_codigo                      | CREATE UNIQUE INDEX uq_ciiu_clases_codigo ON public.ciiu_clases USING btree (codigo)                                                                                                        
public  | ciiu_clases                     | uq_ciiu_clases_id_seccion                  | CREATE UNIQUE INDEX uq_ciiu_clases_id_seccion ON public.ciiu_clases USING btree (id, seccion_id)                                                                                            
public  | ciiu_secciones                  | ciiu_secciones_pkey                        | CREATE UNIQUE INDEX ciiu_secciones_pkey ON public.ciiu_secciones USING btree (id)                                                                                                           
public  | ciiu_secciones                  | uq_ciiu_secciones_letra                    | CREATE UNIQUE INDEX uq_ciiu_secciones_letra ON public.ciiu_secciones USING btree (letra)                                                                                                    
public  | configuracion                   | configuracion_pkey                         | CREATE UNIQUE INDEX configuracion_pkey ON public.configuracion USING btree (id)                                                                                                             
public  | configuracion                   | uq_configuracion_clave                     | CREATE UNIQUE INDEX uq_configuracion_clave ON public.configuracion USING btree (clave)                                                                                                      
public  | cortes_ocupacionales            | cortes_ocupacionales_pkey                  | CREATE UNIQUE INDEX cortes_ocupacionales_pkey ON public.cortes_ocupacionales USING btree (id)                                                                                               
public  | cortes_ocupacionales            | uq_cortes_ocupacionales_anio_periodo       | CREATE UNIQUE INDEX uq_cortes_ocupacionales_anio_periodo ON public.cortes_ocupacionales USING btree (anio, periodo_id)                                                                      
public  | criterios_ocupacionales         | criterios_ocupacionales_codigo_key         | CREATE UNIQUE INDEX criterios_ocupacionales_codigo_key ON public.criterios_ocupacionales USING btree (codigo)                                                                               
public  | criterios_ocupacionales         | criterios_ocupacionales_pkey               | CREATE UNIQUE INDEX criterios_ocupacionales_pkey ON public.criterios_ocupacionales USING btree (id)                                                                                         
public  | departamentos                   | departamentos_pkey                         | CREATE UNIQUE INDEX departamentos_pkey ON public.departamentos USING btree (id)                                                                                                             
public  | departamentos                   | uq_departamentos_codigo_dane               | CREATE UNIQUE INDEX uq_departamentos_codigo_dane ON public.departamentos USING btree (codigo_dane)                                                                                          
public  | departamentos                   | uq_departamentos_nombre                    | CREATE UNIQUE INDEX uq_departamentos_nombre ON public.departamentos USING btree (normalizar_nombre((nombre)::text))                                                                         
public  | departamentos_alias             | departamentos_alias_pkey                   | CREATE UNIQUE INDEX departamentos_alias_pkey ON public.departamentos_alias USING btree (alias_normalizado)                                                                                  
public  | departamentos_alias             | idx_departamentos_alias_departamento       | CREATE INDEX idx_departamentos_alias_departamento ON public.departamentos_alias USING btree (departamento_id)                                                                               
public  | empresas                        | empresas_pkey                              | CREATE UNIQUE INDEX empresas_pkey ON public.empresas USING btree (id)                                                                                                                       
public  | empresas                        | uq_empresas_nombre                         | CREATE UNIQUE INDEX uq_empresas_nombre ON public.empresas USING btree (normalizar_nombre((nombre)::text))                                                                                   
public  | indicadores_ocupacionales       | idx_indicadores_ocupacionales_busqueda     | CREATE INDEX idx_indicadores_ocupacionales_busqueda ON public.indicadores_ocupacionales USING btree (corte_id, departamento_id, criterio_codigo)                                            
public  | indicadores_ocupacionales       | idx_indicadores_ocupacionales_ocupacion    | CREATE INDEX idx_indicadores_ocupacionales_ocupacion ON public.indicadores_ocupacionales USING btree (ocupacion_id, corte_id)                                                               
public  | indicadores_ocupacionales       | indicadores_ocupacionales_pkey             | CREATE UNIQUE INDEX indicadores_ocupacionales_pkey ON public.indicadores_ocupacionales USING btree (id)                                                                                     
public  | indicadores_ocupacionales       | uq_indicadores_ocupacionales_departamental | CREATE UNIQUE INDEX uq_indicadores_ocupacionales_departamental ON public.indicadores_ocupacionales USING btree (corte_id, departamento_id, ocupacion_id) WHERE (departamento_id IS NOT NULL)
public  | indicadores_ocupacionales       | uq_indicadores_ocupacionales_nacional      | CREATE UNIQUE INDEX uq_indicadores_ocupacionales_nacional ON public.indicadores_ocupacionales USING btree (corte_id, ocupacion_id) WHERE (departamento_id IS NULL)                          
public  | migraciones_aplicadas           | migraciones_aplicadas_pkey                 | CREATE UNIQUE INDEX migraciones_aplicadas_pkey ON public.migraciones_aplicadas USING btree (nombre)                                                                                         
public  | municipios                      | municipios_pkey                            | CREATE UNIQUE INDEX municipios_pkey ON public.municipios USING btree (id)                                                                                                                   
public  | municipios                      | uq_municipios_depto_nombre                 | CREATE UNIQUE INDEX uq_municipios_depto_nombre ON public.municipios USING btree (departamento_id, normalizar_nombre((nombre)::text))                                                        
public  | municipios                      | uq_municipios_id_departamento              | CREATE UNIQUE INDEX uq_municipios_id_departamento ON public.municipios USING btree (id, departamento_id)                                                                                    
public  | niveles_cualificacion           | niveles_cualificacion_pkey                 | CREATE UNIQUE INDEX niveles_cualificacion_pkey ON public.niveles_cualificacion USING btree (id)                                                                                             
public  | niveles_cualificacion           | uq_niveles_cualificacion_codigo_nc         | CREATE UNIQUE INDEX uq_niveles_cualificacion_codigo_nc ON public.niveles_cualificacion USING btree (codigo_nc)                                                                              
public  | niveles_formacion               | niveles_formacion_pkey                     | CREATE UNIQUE INDEX niveles_formacion_pkey ON public.niveles_formacion USING btree (id)                                                                                                     
public  | niveles_formacion               | uq_niveles_formacion_codigo                | CREATE UNIQUE INDEX uq_niveles_formacion_codigo ON public.niveles_formacion USING btree (codigo)                                                                                            
public  | niveles_ocupacionales           | niveles_ocupacionales_codigo_key           | CREATE UNIQUE INDEX niveles_ocupacionales_codigo_key ON public.niveles_ocupacionales USING btree (codigo)                                                                                   
public  | niveles_ocupacionales           | niveles_ocupacionales_etiqueta_key         | CREATE UNIQUE INDEX niveles_ocupacionales_etiqueta_key ON public.niveles_ocupacionales USING btree (etiqueta)                                                                               
public  | niveles_ocupacionales           | niveles_ocupacionales_pkey                 | CREATE UNIQUE INDEX niveles_ocupacionales_pkey ON public.niveles_ocupacionales USING btree (id)                                                                                             
public  | ocupaciones                     | idx_ocupaciones_codigo_nc                  | CREATE INDEX idx_ocupaciones_codigo_nc ON public.ocupaciones USING btree (codigo_nc)                                                                                                        
public  | ocupaciones                     | ocupaciones_codigo_key                     | CREATE UNIQUE INDEX ocupaciones_codigo_key ON public.ocupaciones USING btree (codigo)                                                                                                       
public  | ocupaciones                     | ocupaciones_pkey                           | CREATE UNIQUE INDEX ocupaciones_pkey ON public.ocupaciones USING btree (id)                                                                                                                 
public  | paginas                         | idx_paginas_creado_por                     | CREATE INDEX idx_paginas_creado_por ON public.paginas USING btree (creado_por)                                                                                                              
public  | paginas                         | paginas_pkey                               | CREATE UNIQUE INDEX paginas_pkey ON public.paginas USING btree (id)                                                                                                                         
public  | paginas                         | uq_paginas_ambito_slug                     | CREATE UNIQUE INDEX uq_paginas_ambito_slug ON public.paginas USING btree (ambito, slug)                                                                                                     
public  | paginas_versiones               | idx_paginas_versiones_estado               | CREATE INDEX idx_paginas_versiones_estado ON public.paginas_versiones USING btree (estado, creado_en DESC)                                                                                  
public  | paginas_versiones               | paginas_versiones_pkey                     | CREATE UNIQUE INDEX paginas_versiones_pkey ON public.paginas_versiones USING btree (id)                                                                                                     
public  | paginas_versiones               | uq_pagina_version_en_revision              | CREATE UNIQUE INDEX uq_pagina_version_en_revision ON public.paginas_versiones USING btree (pagina_id) WHERE ((estado)::text = 'en_revision'::text)                                          
public  | paginas_versiones               | uq_pagina_version_publicada                | CREATE UNIQUE INDEX uq_pagina_version_publicada ON public.paginas_versiones USING btree (pagina_id) WHERE ((estado)::text = 'publicado'::text)                                              
public  | paginas_versiones               | uq_paginas_versiones_id_pagina             | CREATE UNIQUE INDEX uq_paginas_versiones_id_pagina ON public.paginas_versiones USING btree (id, pagina_id)                                                                                  
public  | paginas_versiones               | uq_paginas_versiones_numero                | CREATE UNIQUE INDEX uq_paginas_versiones_numero ON public.paginas_versiones USING btree (pagina_id, numero_version)                                                                         
public  | periodos                        | periodos_codigo_key                        | CREATE UNIQUE INDEX periodos_codigo_key ON public.periodos USING btree (codigo)                                                                                                             
public  | periodos                        | periodos_pkey                              | CREATE UNIQUE INDEX periodos_pkey ON public.periodos USING btree (id)                                                                                                                       
public  | permisos                        | permissions_name_key61                     | CREATE UNIQUE INDEX permissions_name_key61 ON public.permisos USING btree (clave)                                                                                                           
public  | permisos                        | permissions_pkey                           | CREATE UNIQUE INDEX permissions_pkey ON public.permisos USING btree (id)                                                                                                                    
public  | preguntas_seguridad             | security_questions_pkey                    | CREATE UNIQUE INDEX security_questions_pkey ON public.preguntas_seguridad USING btree (id)                                                                                                  
public  | preguntas_seguridad             | security_questions_user_id_question_key    | CREATE UNIQUE INDEX security_questions_user_id_question_key ON public.preguntas_seguridad USING btree (usuario_id, pregunta_clave)                                                          
public  | programas_formacion             | programas_formacion_pkey                   | CREATE UNIQUE INDEX programas_formacion_pkey ON public.programas_formacion USING btree (id)                                                                                                 
public  | programas_formacion             | uq_programas_formacion_codigo              | CREATE UNIQUE INDEX uq_programas_formacion_codigo ON public.programas_formacion USING btree (codigo)                                                                                        
public  | programas_formacion             | uq_programas_formacion_id_nivel            | CREATE UNIQUE INDEX uq_programas_formacion_id_nivel ON public.programas_formacion USING btree (id, nivel_formacion_id)                                                                      
public  | programas_sobresalientes        | idx_sobresalientes_departamento            | CREATE INDEX idx_sobresalientes_departamento ON public.programas_sobresalientes USING btree (departamento_id)                                                                               
public  | programas_sobresalientes        | idx_sobresalientes_programa                | CREATE INDEX idx_sobresalientes_programa ON public.programas_sobresalientes USING btree (programa_id, nivel_formacion_id)                                                                   
public  | programas_sobresalientes        | programas_sobresalientes_pkey              | CREATE UNIQUE INDEX programas_sobresalientes_pkey ON public.programas_sobresalientes USING btree (id)                                                                                       
public  | programas_sobresalientes        | uq_sobresalientes_registro                 | CREATE UNIQUE INDEX uq_sobresalientes_registro ON public.programas_sobresalientes USING btree (centro_id, programa_id, sexo)                                                                
public  | proyectos_inversion             | idx_proyectos_inversion_fecha              | CREATE INDEX idx_proyectos_inversion_fecha ON public.proyectos_inversion USING btree (fecha_anuncio)                                                                                        
public  | proyectos_inversion             | idx_proyectos_inversion_seccion            | CREATE INDEX idx_proyectos_inversion_seccion ON public.proyectos_inversion USING btree (seccion_id) WHERE ((estado)::text = 'publicado'::text)                                              
public  | proyectos_inversion             | proyectos_inversion_pkey                   | CREATE UNIQUE INDEX proyectos_inversion_pkey ON public.proyectos_inversion USING btree (id)                                                                                                 
public  | proyectos_inversion_ubicaciones | idx_proyectos_ubicaciones_depto            | CREATE INDEX idx_proyectos_ubicaciones_depto ON public.proyectos_inversion_ubicaciones USING btree (departamento_id, proyecto_id)                                                           
public  | proyectos_inversion_ubicaciones | proyectos_inversion_ubicaciones_pkey       | CREATE UNIQUE INDEX proyectos_inversion_ubicaciones_pkey ON public.proyectos_inversion_ubicaciones USING btree (id)                                                                         
public  | proyectos_inversion_ubicaciones | uq_proyectos_ubicaciones                   | CREATE UNIQUE INDEX uq_proyectos_ubicaciones ON public.proyectos_inversion_ubicaciones USING btree (proyecto_id, departamento_id, municipio_id) NULLS NOT DISTINCT                          
public  | roles                           | roles_name_key62                           | CREATE UNIQUE INDEX roles_name_key62 ON public.roles USING btree (nombre)                                                                                                                   
public  | roles                           | roles_pkey                                 | CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id)                                                                                                                             
public  | roles_permisos                  | idx_roles_permisos_permiso                 | CREATE INDEX idx_roles_permisos_permiso ON public.roles_permisos USING btree (permiso_id)                                                                                                   
public  | roles_permisos                  | role_permissions_pkey                      | CREATE UNIQUE INDEX role_permissions_pkey ON public.roles_permisos USING btree (rol_id, permiso_id)                                                                                         
public  | subidas_pendientes              | subidas_pendientes_pkey                    | CREATE UNIQUE INDEX subidas_pendientes_pkey ON public.subidas_pendientes USING btree (pagina_id, ruta)                                                                                      
public  | usuarios                        | idx_usuarios_rol                           | CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol_id)                                                                                                                       
public  | usuarios                        | uq_usuarios_email                          | CREATE UNIQUE INDEX uq_usuarios_email ON public.usuarios USING btree (email)                                                                                                                
public  | usuarios                        | users_pkey                                 | CREATE UNIQUE INDEX users_pkey ON public.usuarios USING btree (id)                                                                                                                          
*/

/* ================================================================
   09. VISTAS
   ================================================================ */
/*
esquema | vista                       | definicion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
--------|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
public  | v_buscador_ocupacional      |  SELECT i.id,     c.id AS corte_id,     c.anio,     p.id AS periodo_id,     p.codigo AS periodo_codigo,     p.nombre AS periodo_nombre,     c.estado AS corte_estado,     i.departamento_id,     d.codigo_dane,     COALESCE(d.nombre, 'Nacional'::character varying) AS departamento_nombre,     (i.departamento_id IS NULL) AS es_nacional,     o.id AS ocupacion_id,     o.codigo AS ocupacion_codigo,     o.nombre AS ocupacion_nombre,     o.codigo_nc,     n.id AS nivel_ocupacional_id,     n.codigo AS nivel_codigo,     n.etiqueta AS nivel_etiqueta,     n.nombre AS nivel_nombre,     i.inscritos,     i.vacantes,     i.percentil_inscritos,     i.percentil_vacantes,     cr.codigo AS criterio_codigo,     cr.nombre AS criterio_nombre,     cr.orden AS criterio_orden,     ((i.inscritos = 0) AND (i.vacantes = 0)) AS sin_registros    FROM (((((((indicadores_ocupacionales i      JOIN cortes_ocupacionales c ON ((c.id = i.corte_id)))      JOIN periodos p ON ((p.id = c.periodo_id)))      JOIN ocupaciones o ON ((o.id = i.ocupacion_id)))      JOIN niveles_cualificacion nc ON ((nc.codigo_nc = o.codigo_nc)))      JOIN niveles_ocupacionales n ON ((n.id = nc.nivel_ocupacional_id)))      JOIN criterios_ocupacionales cr ON (((cr.codigo)::text = (i.criterio_codigo)::text)))      LEFT JOIN departamentos d ON ((d.id = i.departamento_id)));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
public  | v_estado_cargas_ocupacional |  WITH anios AS (          SELECT (generate_series(LEAST(2012, (( SELECT min(cortes_ocupacionales.anio) AS min                    FROM cortes_ocupacionales))::integer, (( SELECT min(cargas_datos_ocupacionales.anio) AS min                    FROM cargas_datos_ocupacionales))::integer), GREATEST((EXTRACT(year FROM now()))::integer, (( SELECT max(cortes_ocupacionales.anio) AS max                    FROM cortes_ocupacionales))::integer, (( SELECT max(cargas_datos_ocupacionales.anio) AS max                    FROM cargas_datos_ocupacionales))::integer)))::smallint AS anio         ), ultima_carga AS (          SELECT DISTINCT ON (co.anio, co.periodo_id) co.anio,             co.periodo_id,             cd.id AS carga_id,             cd.estado AS carga_estado,             ar.nombre_original AS archivo_nombre,             cd.completado_en AS finalizado_en,             co.reporte            FROM ((cargas_datos_ocupacionales co              JOIN cargas_datos cd ON ((cd.id = co.carga_id)))              LEFT JOIN archivos ar ON ((ar.id = cd.archivo_id)))           ORDER BY co.anio, co.periodo_id, cd.creado_en DESC, cd.id DESC         )  SELECT a.anio,     p.id AS periodo_id,     p.codigo AS periodo_codigo,     p.nombre AS periodo_nombre,     p.orden AS periodo_orden,     c.id AS corte_id,     c.estado AS corte_estado,     c.publicado_en,     u.carga_id,     u.carga_estado,     u.archivo_nombre,     u.finalizado_en,     COALESCE(jsonb_array_length((u.reporte -> 'advertencias'::text)), 0) AS validaciones_con_advertencia,         CASE             WHEN (c.id IS NOT NULL) THEN c.estado             WHEN ((u.carga_estado)::text = 'error'::text) THEN 'fallido'::character varying             WHEN ((u.carga_estado)::text = 'procesando'::text) THEN 'procesando'::character varying             ELSE 'pendiente'::character varying         END AS estado_celda    FROM (((anios a      CROSS JOIN periodos p)      LEFT JOIN cortes_ocupacionales c ON (((c.anio = a.anio) AND (c.periodo_id = p.id))))      LEFT JOIN ultima_carga u ON (((u.anio = a.anio) AND (u.periodo_id = p.id))));
*/

/* ================================================================
   10. VISTAS MATERIALIZADAS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   11. FUNCIONES
   ================================================================ */
/*
esquema | funcion               | parametros                         | retorno      | lenguaje | definicion                                                                                                                                                                                                                                                                                                                                                       
--------|-----------------------|------------------------------------|--------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
public  | armor                 | bytea                              | text         | c        | CREATE OR REPLACE FUNCTION public.armor(bytea)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_armor$function$                                                                                                                                                                                                     
public  | armor                 | bytea, text[], text[]              | text         | c        | CREATE OR REPLACE FUNCTION public.armor(bytea, text[], text[])  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_armor$function$                                                                                                                                                                                     
public  | crypt                 | text, text                         | text         | c        | CREATE OR REPLACE FUNCTION public.crypt(text, text)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_crypt$function$                                                                                                                                                                                                
public  | dearmor               | text                               | bytea        | c        | CREATE OR REPLACE FUNCTION public.dearmor(text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_dearmor$function$                                                                                                                                                                                                 
public  | decrypt               | bytea, bytea, text                 | bytea        | c        | CREATE OR REPLACE FUNCTION public.decrypt(bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_decrypt$function$                                                                                                                                                                                   
public  | decrypt_iv            | bytea, bytea, bytea, text          | bytea        | c        | CREATE OR REPLACE FUNCTION public.decrypt_iv(bytea, bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$                                                                                                                                                                      
public  | digest                | text, text                         | bytea        | c        | CREATE OR REPLACE FUNCTION public.digest(text, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_digest$function$                                                                                                                                                                                             
public  | digest                | bytea, text                        | bytea        | c        | CREATE OR REPLACE FUNCTION public.digest(bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_digest$function$                                                                                                                                                                                            
public  | encrypt               | bytea, bytea, text                 | bytea        | c        | CREATE OR REPLACE FUNCTION public.encrypt(bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_encrypt$function$                                                                                                                                                                                   
public  | encrypt_iv            | bytea, bytea, bytea, text          | bytea        | c        | CREATE OR REPLACE FUNCTION public.encrypt_iv(bytea, bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$                                                                                                                                                                      
public  | fips_mode             |                                    | boolean      | c        | CREATE OR REPLACE FUNCTION public.fips_mode()  RETURNS boolean  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_check_fipsmode$function$                                                                                                                                                                                                    
public  | gen_random_bytes      | integer                            | bytea        | c        | CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_random_bytes$function$                                                                                                                                                                                          
public  | gen_random_uuid       |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.gen_random_uuid()  RETURNS uuid  LANGUAGE c  PARALLEL SAFE AS '$libdir/pgcrypto', $function$pg_random_uuid$function$                                                                                                                                                                                                           
public  | gen_salt              | text, integer                      | text         | c        | CREATE OR REPLACE FUNCTION public.gen_salt(text, integer)  RETURNS text  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$                                                                                                                                                                                          
public  | gen_salt              | text                               | text         | c        | CREATE OR REPLACE FUNCTION public.gen_salt(text)  RETURNS text  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_gen_salt$function$                                                                                                                                                                                                          
public  | hmac                  | bytea, bytea, text                 | bytea        | c        | CREATE OR REPLACE FUNCTION public.hmac(bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_hmac$function$                                                                                                                                                                                         
public  | hmac                  | text, text, text                   | bytea        | c        | CREATE OR REPLACE FUNCTION public.hmac(text, text, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pg_hmac$function$                                                                                                                                                                                           
public  | normalizar_nombre     | texto text                         | text         | sql      | CREATE OR REPLACE FUNCTION public.normalizar_nombre(texto text)  RETURNS text  LANGUAGE sql  IMMUTABLE PARALLEL SAFE STRICT AS $function$       SELECT btrim(regexp_replace(lower(translate(texto, 'áàäâãåÁÀÄÂÃÅéèëêÉÈËÊíìïîÍÌÏÎóòöôõÓÒÖÔÕúùüûÚÙÜÛñÑçÇýÿÝŸ', 'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUnNcCyyYY')), '[^a-z0-9]+', ' ', 'g'))     $function$ 
public  | pgp_armor_headers     | text, OUT key text, OUT value text | SETOF record | c        | CREATE OR REPLACE FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text)  RETURNS SETOF record  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$                                                                                                                                           
public  | pgp_key_id            | bytea                              | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_key_id(bytea)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$                                                                                                                                                                                            
public  | pgp_pub_decrypt       | bytea, bytea, text                 | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$                                                                                                                                                                  
public  | pgp_pub_decrypt       | bytea, bytea, text, text           | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$                                                                                                                                                            
public  | pgp_pub_decrypt       | bytea, bytea                       | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$                                                                                                                                                                        
public  | pgp_pub_decrypt_bytea | bytea, bytea, text, text           | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$                                                                                                                                                    
public  | pgp_pub_decrypt_bytea | bytea, bytea, text                 | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$                                                                                                                                                          
public  | pgp_pub_decrypt_bytea | bytea, bytea                       | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$                                                                                                                                                                
public  | pgp_pub_encrypt       | text, bytea, text                  | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$                                                                                                                                                                            
public  | pgp_pub_encrypt       | text, bytea                        | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$                                                                                                                                                                                  
public  | pgp_pub_encrypt_bytea | bytea, bytea, text                 | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$                                                                                                                                                                    
public  | pgp_pub_encrypt_bytea | bytea, bytea                       | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$                                                                                                                                                                          
public  | pgp_sym_decrypt       | bytea, text, text                  | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text, text)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$                                                                                                                                                                   
public  | pgp_sym_decrypt       | bytea, text                        | text         | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text)  RETURNS text  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$                                                                                                                                                                         
public  | pgp_sym_decrypt_bytea | bytea, text, text                  | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$                                                                                                                                                           
public  | pgp_sym_decrypt_bytea | bytea, text                        | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text)  RETURNS bytea  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$                                                                                                                                                                 
public  | pgp_sym_encrypt       | text, text                         | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$                                                                                                                                                                                   
public  | pgp_sym_encrypt       | text, text, text                   | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$                                                                                                                                                                             
public  | pgp_sym_encrypt_bytea | bytea, text, text                  | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$                                                                                                                                                                     
public  | pgp_sym_encrypt_bytea | bytea, text                        | bytea        | c        | CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text)  RETURNS bytea  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$                                                                                                                                                                           
public  | uuid_generate_v1      |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_generate_v1()  RETURNS uuid  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$                                                                                                                                                                                                
public  | uuid_generate_v1mc    |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()  RETURNS uuid  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$                                                                                                                                                                                            
public  | uuid_generate_v3      | namespace uuid, name text          | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$                                                                                                                                                             
public  | uuid_generate_v4      |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_generate_v4()  RETURNS uuid  LANGUAGE c  PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$                                                                                                                                                                                                
public  | uuid_generate_v5      | namespace uuid, name text          | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$                                                                                                                                                             
public  | uuid_nil              |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_nil()  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_nil$function$                                                                                                                                                                                                      
public  | uuid_ns_dns           |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_ns_dns()  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$                                                                                                                                                                                                
public  | uuid_ns_oid           |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_ns_oid()  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$                                                                                                                                                                                                
public  | uuid_ns_url           |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_ns_url()  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$                                                                                                                                                                                                
public  | uuid_ns_x500          |                                    | uuid         | c        | CREATE OR REPLACE FUNCTION public.uuid_ns_x500()  RETURNS uuid  LANGUAGE c  IMMUTABLE PARALLEL SAFE STRICT AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$                                                                                                                                                                                              
*/

/* ================================================================
   12. PROCEDIMIENTOS ALMACENADOS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   13. TRIGGERS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   14. SECUENCIAS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   15. TIPOS PERSONALIZADOS Y ENUM
   ================================================================ */
/*
esquema | tipo                            | tipo_objeto
--------|---------------------------------|------------
public  | archivos                        | COMPOSITE  
public  | auditoria_cambios               | COMPOSITE  
public  | bloqueos_edicion                | COMPOSITE  
public  | cargas_datos                    | COMPOSITE  
public  | cargas_datos_ocupacionales      | COMPOSITE  
public  | centros_formacion               | COMPOSITE  
public  | ciiu_clases                     | COMPOSITE  
public  | ciiu_secciones                  | COMPOSITE  
public  | configuracion                   | COMPOSITE  
public  | cortes_ocupacionales            | COMPOSITE  
public  | criterios_ocupacionales         | COMPOSITE  
public  | departamentos                   | COMPOSITE  
public  | departamentos_alias             | COMPOSITE  
public  | empresas                        | COMPOSITE  
public  | indicadores_ocupacionales       | COMPOSITE  
public  | migraciones_aplicadas           | COMPOSITE  
public  | municipios                      | COMPOSITE  
public  | niveles_cualificacion           | COMPOSITE  
public  | niveles_formacion               | COMPOSITE  
public  | niveles_ocupacionales           | COMPOSITE  
public  | ocupaciones                     | COMPOSITE  
public  | paginas                         | COMPOSITE  
public  | paginas_versiones               | COMPOSITE  
public  | periodos                        | COMPOSITE  
public  | permisos                        | COMPOSITE  
public  | preguntas_seguridad             | COMPOSITE  
public  | programas_formacion             | COMPOSITE  
public  | programas_sobresalientes        | COMPOSITE  
public  | proyectos_inversion             | COMPOSITE  
public  | proyectos_inversion_ubicaciones | COMPOSITE  
public  | roles                           | COMPOSITE  
public  | roles_permisos                  | COMPOSITE  
public  | subidas_pendientes              | COMPOSITE  
public  | usuarios                        | COMPOSITE  
public  | v_buscador_ocupacional          | COMPOSITE  
public  | v_estado_cargas_ocupacional     | COMPOSITE  
*/

/* ================================================================
   16. VALORES DE LOS ENUM
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   17. EXTENSIONES INSTALADAS
   ================================================================ */
/*
extension | version | esquema   
----------|---------|-----------
pgcrypto  | 1.4     | public    
plpgsql   | 1.0     | pg_catalog
uuid-ossp | 1.1     | public    
*/

/* ================================================================
   18. ROLES / USUARIOS
   ================================================================ */
/*
rol                         | superusuario | hereda_privilegios | puede_crear_roles | puede_crear_bd | puede_iniciar_sesion | puede_replicar
----------------------------|--------------|--------------------|-------------------|----------------|----------------------|---------------
cloud_admin                 | true         | true               | true              | true           | true                 | true          
neon_service                | false        | true               | true              | true           | true                 | true          
neon_superuser              | false        | true               | true              | true           | false                | true          
neondb_owner                | false        | true               | true              | true           | true                 | true          
pg_checkpoint               | false        | true               | false             | false          | false                | false         
pg_create_subscription      | false        | true               | false             | false          | false                | false         
pg_database_owner           | false        | true               | false             | false          | false                | false         
pg_execute_server_program   | false        | true               | false             | false          | false                | false         
pg_maintain                 | false        | true               | false             | false          | false                | false         
pg_monitor                  | false        | true               | false             | false          | false                | false         
pg_read_all_data            | false        | true               | false             | false          | false                | false         
pg_read_all_settings        | false        | true               | false             | false          | false                | false         
pg_read_all_stats           | false        | true               | false             | false          | false                | false         
pg_read_server_files        | false        | true               | false             | false          | false                | false         
pg_signal_autovacuum_worker | false        | true               | false             | false          | false                | false         
pg_signal_backend           | false        | true               | false             | false          | false                | false         
pg_stat_scan_tables         | false        | true               | false             | false          | false                | false         
pg_use_reserved_connections | false        | true               | false             | false          | false                | false         
pg_write_all_data           | false        | true               | false             | false          | false                | false         
pg_write_server_files       | false        | true               | false             | false          | false                | false         
*/

/* ================================================================
   19. PERMISOS SOBRE TABLAS
   ================================================================ */
/*
usuario_o_rol | esquema | tabla                           | permiso   
--------------|---------|---------------------------------|-----------
neondb_owner  | public  | archivos                        | DELETE    
neondb_owner  | public  | archivos                        | INSERT    
neondb_owner  | public  | archivos                        | REFERENCES
neondb_owner  | public  | archivos                        | SELECT    
neondb_owner  | public  | archivos                        | TRIGGER   
neondb_owner  | public  | archivos                        | TRUNCATE  
neondb_owner  | public  | archivos                        | UPDATE    
neondb_owner  | public  | auditoria_cambios               | DELETE    
neondb_owner  | public  | auditoria_cambios               | INSERT    
neondb_owner  | public  | auditoria_cambios               | REFERENCES
neondb_owner  | public  | auditoria_cambios               | SELECT    
neondb_owner  | public  | auditoria_cambios               | TRIGGER   
neondb_owner  | public  | auditoria_cambios               | TRUNCATE  
neondb_owner  | public  | auditoria_cambios               | UPDATE    
neondb_owner  | public  | bloqueos_edicion                | DELETE    
neondb_owner  | public  | bloqueos_edicion                | INSERT    
neondb_owner  | public  | bloqueos_edicion                | REFERENCES
neondb_owner  | public  | bloqueos_edicion                | SELECT    
neondb_owner  | public  | bloqueos_edicion                | TRIGGER   
neondb_owner  | public  | bloqueos_edicion                | TRUNCATE  
neondb_owner  | public  | bloqueos_edicion                | UPDATE    
neondb_owner  | public  | cargas_datos                    | DELETE    
neondb_owner  | public  | cargas_datos                    | INSERT    
neondb_owner  | public  | cargas_datos                    | REFERENCES
neondb_owner  | public  | cargas_datos                    | SELECT    
neondb_owner  | public  | cargas_datos                    | TRIGGER   
neondb_owner  | public  | cargas_datos                    | TRUNCATE  
neondb_owner  | public  | cargas_datos                    | UPDATE    
neondb_owner  | public  | cargas_datos_ocupacionales      | DELETE    
neondb_owner  | public  | cargas_datos_ocupacionales      | INSERT    
neondb_owner  | public  | cargas_datos_ocupacionales      | REFERENCES
neondb_owner  | public  | cargas_datos_ocupacionales      | SELECT    
neondb_owner  | public  | cargas_datos_ocupacionales      | TRIGGER   
neondb_owner  | public  | cargas_datos_ocupacionales      | TRUNCATE  
neondb_owner  | public  | cargas_datos_ocupacionales      | UPDATE    
neondb_owner  | public  | centros_formacion               | DELETE    
neondb_owner  | public  | centros_formacion               | INSERT    
neondb_owner  | public  | centros_formacion               | REFERENCES
neondb_owner  | public  | centros_formacion               | SELECT    
neondb_owner  | public  | centros_formacion               | TRIGGER   
neondb_owner  | public  | centros_formacion               | TRUNCATE  
neondb_owner  | public  | centros_formacion               | UPDATE    
neondb_owner  | public  | ciiu_clases                     | DELETE    
neondb_owner  | public  | ciiu_clases                     | INSERT    
neondb_owner  | public  | ciiu_clases                     | REFERENCES
neondb_owner  | public  | ciiu_clases                     | SELECT    
neondb_owner  | public  | ciiu_clases                     | TRIGGER   
neondb_owner  | public  | ciiu_clases                     | TRUNCATE  
neondb_owner  | public  | ciiu_clases                     | UPDATE    
neondb_owner  | public  | ciiu_secciones                  | DELETE    
neondb_owner  | public  | ciiu_secciones                  | INSERT    
neondb_owner  | public  | ciiu_secciones                  | REFERENCES
neondb_owner  | public  | ciiu_secciones                  | SELECT    
neondb_owner  | public  | ciiu_secciones                  | TRIGGER   
neondb_owner  | public  | ciiu_secciones                  | TRUNCATE  
neondb_owner  | public  | ciiu_secciones                  | UPDATE    
neondb_owner  | public  | configuracion                   | DELETE    
neondb_owner  | public  | configuracion                   | INSERT    
neondb_owner  | public  | configuracion                   | REFERENCES
neondb_owner  | public  | configuracion                   | SELECT    
neondb_owner  | public  | configuracion                   | TRIGGER   
neondb_owner  | public  | configuracion                   | TRUNCATE  
neondb_owner  | public  | configuracion                   | UPDATE    
neondb_owner  | public  | cortes_ocupacionales            | DELETE    
neondb_owner  | public  | cortes_ocupacionales            | INSERT    
neondb_owner  | public  | cortes_ocupacionales            | REFERENCES
neondb_owner  | public  | cortes_ocupacionales            | SELECT    
neondb_owner  | public  | cortes_ocupacionales            | TRIGGER   
neondb_owner  | public  | cortes_ocupacionales            | TRUNCATE  
neondb_owner  | public  | cortes_ocupacionales            | UPDATE    
neondb_owner  | public  | criterios_ocupacionales         | DELETE    
neondb_owner  | public  | criterios_ocupacionales         | INSERT    
neondb_owner  | public  | criterios_ocupacionales         | REFERENCES
neondb_owner  | public  | criterios_ocupacionales         | SELECT    
neondb_owner  | public  | criterios_ocupacionales         | TRIGGER   
neondb_owner  | public  | criterios_ocupacionales         | TRUNCATE  
neondb_owner  | public  | criterios_ocupacionales         | UPDATE    
neondb_owner  | public  | departamentos                   | DELETE    
neondb_owner  | public  | departamentos                   | INSERT    
neondb_owner  | public  | departamentos                   | REFERENCES
neondb_owner  | public  | departamentos                   | SELECT    
neondb_owner  | public  | departamentos                   | TRIGGER   
neondb_owner  | public  | departamentos                   | TRUNCATE  
neondb_owner  | public  | departamentos                   | UPDATE    
neondb_owner  | public  | departamentos_alias             | DELETE    
neondb_owner  | public  | departamentos_alias             | INSERT    
neondb_owner  | public  | departamentos_alias             | REFERENCES
neondb_owner  | public  | departamentos_alias             | SELECT    
neondb_owner  | public  | departamentos_alias             | TRIGGER   
neondb_owner  | public  | departamentos_alias             | TRUNCATE  
neondb_owner  | public  | departamentos_alias             | UPDATE    
neondb_owner  | public  | empresas                        | DELETE    
neondb_owner  | public  | empresas                        | INSERT    
neondb_owner  | public  | empresas                        | REFERENCES
neondb_owner  | public  | empresas                        | SELECT    
neondb_owner  | public  | empresas                        | TRIGGER   
neondb_owner  | public  | empresas                        | TRUNCATE  
neondb_owner  | public  | empresas                        | UPDATE    
neondb_owner  | public  | indicadores_ocupacionales       | DELETE    
neondb_owner  | public  | indicadores_ocupacionales       | INSERT    
neondb_owner  | public  | indicadores_ocupacionales       | REFERENCES
neondb_owner  | public  | indicadores_ocupacionales       | SELECT    
neondb_owner  | public  | indicadores_ocupacionales       | TRIGGER   
neondb_owner  | public  | indicadores_ocupacionales       | TRUNCATE  
neondb_owner  | public  | indicadores_ocupacionales       | UPDATE    
neondb_owner  | public  | migraciones_aplicadas           | DELETE    
neondb_owner  | public  | migraciones_aplicadas           | INSERT    
neondb_owner  | public  | migraciones_aplicadas           | REFERENCES
neondb_owner  | public  | migraciones_aplicadas           | SELECT    
neondb_owner  | public  | migraciones_aplicadas           | TRIGGER   
neondb_owner  | public  | migraciones_aplicadas           | TRUNCATE  
neondb_owner  | public  | migraciones_aplicadas           | UPDATE    
neondb_owner  | public  | municipios                      | DELETE    
neondb_owner  | public  | municipios                      | INSERT    
neondb_owner  | public  | municipios                      | REFERENCES
neondb_owner  | public  | municipios                      | SELECT    
neondb_owner  | public  | municipios                      | TRIGGER   
neondb_owner  | public  | municipios                      | TRUNCATE  
neondb_owner  | public  | municipios                      | UPDATE    
neondb_owner  | public  | niveles_cualificacion           | DELETE    
neondb_owner  | public  | niveles_cualificacion           | INSERT    
neondb_owner  | public  | niveles_cualificacion           | REFERENCES
neondb_owner  | public  | niveles_cualificacion           | SELECT    
neondb_owner  | public  | niveles_cualificacion           | TRIGGER   
neondb_owner  | public  | niveles_cualificacion           | TRUNCATE  
neondb_owner  | public  | niveles_cualificacion           | UPDATE    
neondb_owner  | public  | niveles_formacion               | DELETE    
neondb_owner  | public  | niveles_formacion               | INSERT    
neondb_owner  | public  | niveles_formacion               | REFERENCES
neondb_owner  | public  | niveles_formacion               | SELECT    
neondb_owner  | public  | niveles_formacion               | TRIGGER   
neondb_owner  | public  | niveles_formacion               | TRUNCATE  
neondb_owner  | public  | niveles_formacion               | UPDATE    
neondb_owner  | public  | niveles_ocupacionales           | DELETE    
neondb_owner  | public  | niveles_ocupacionales           | INSERT    
neondb_owner  | public  | niveles_ocupacionales           | REFERENCES
neondb_owner  | public  | niveles_ocupacionales           | SELECT    
neondb_owner  | public  | niveles_ocupacionales           | TRIGGER   
neondb_owner  | public  | niveles_ocupacionales           | TRUNCATE  
neondb_owner  | public  | niveles_ocupacionales           | UPDATE    
neondb_owner  | public  | ocupaciones                     | DELETE    
neondb_owner  | public  | ocupaciones                     | INSERT    
neondb_owner  | public  | ocupaciones                     | REFERENCES
neondb_owner  | public  | ocupaciones                     | SELECT    
neondb_owner  | public  | ocupaciones                     | TRIGGER   
neondb_owner  | public  | ocupaciones                     | TRUNCATE  
neondb_owner  | public  | ocupaciones                     | UPDATE    
neondb_owner  | public  | paginas                         | DELETE    
neondb_owner  | public  | paginas                         | INSERT    
neondb_owner  | public  | paginas                         | REFERENCES
neondb_owner  | public  | paginas                         | SELECT    
neondb_owner  | public  | paginas                         | TRIGGER   
neondb_owner  | public  | paginas                         | TRUNCATE  
neondb_owner  | public  | paginas                         | UPDATE    
neondb_owner  | public  | paginas_versiones               | DELETE    
neondb_owner  | public  | paginas_versiones               | INSERT    
neondb_owner  | public  | paginas_versiones               | REFERENCES
neondb_owner  | public  | paginas_versiones               | SELECT    
neondb_owner  | public  | paginas_versiones               | TRIGGER   
neondb_owner  | public  | paginas_versiones               | TRUNCATE  
neondb_owner  | public  | paginas_versiones               | UPDATE    
neondb_owner  | public  | periodos                        | DELETE    
neondb_owner  | public  | periodos                        | INSERT    
neondb_owner  | public  | periodos                        | REFERENCES
neondb_owner  | public  | periodos                        | SELECT    
neondb_owner  | public  | periodos                        | TRIGGER   
neondb_owner  | public  | periodos                        | TRUNCATE  
neondb_owner  | public  | periodos                        | UPDATE    
neondb_owner  | public  | permisos                        | DELETE    
neondb_owner  | public  | permisos                        | INSERT    
neondb_owner  | public  | permisos                        | REFERENCES
neondb_owner  | public  | permisos                        | SELECT    
neondb_owner  | public  | permisos                        | TRIGGER   
neondb_owner  | public  | permisos                        | TRUNCATE  
neondb_owner  | public  | permisos                        | UPDATE    
neondb_owner  | public  | preguntas_seguridad             | DELETE    
neondb_owner  | public  | preguntas_seguridad             | INSERT    
neondb_owner  | public  | preguntas_seguridad             | REFERENCES
neondb_owner  | public  | preguntas_seguridad             | SELECT    
neondb_owner  | public  | preguntas_seguridad             | TRIGGER   
neondb_owner  | public  | preguntas_seguridad             | TRUNCATE  
neondb_owner  | public  | preguntas_seguridad             | UPDATE    
neondb_owner  | public  | programas_formacion             | DELETE    
neondb_owner  | public  | programas_formacion             | INSERT    
neondb_owner  | public  | programas_formacion             | REFERENCES
neondb_owner  | public  | programas_formacion             | SELECT    
neondb_owner  | public  | programas_formacion             | TRIGGER   
neondb_owner  | public  | programas_formacion             | TRUNCATE  
neondb_owner  | public  | programas_formacion             | UPDATE    
neondb_owner  | public  | programas_sobresalientes        | DELETE    
neondb_owner  | public  | programas_sobresalientes        | INSERT    
neondb_owner  | public  | programas_sobresalientes        | REFERENCES
neondb_owner  | public  | programas_sobresalientes        | SELECT    
neondb_owner  | public  | programas_sobresalientes        | TRIGGER   
neondb_owner  | public  | programas_sobresalientes        | TRUNCATE  
neondb_owner  | public  | programas_sobresalientes        | UPDATE    
neondb_owner  | public  | proyectos_inversion             | DELETE    
neondb_owner  | public  | proyectos_inversion             | INSERT    
neondb_owner  | public  | proyectos_inversion             | REFERENCES
neondb_owner  | public  | proyectos_inversion             | SELECT    
neondb_owner  | public  | proyectos_inversion             | TRIGGER   
neondb_owner  | public  | proyectos_inversion             | TRUNCATE  
neondb_owner  | public  | proyectos_inversion             | UPDATE    
neondb_owner  | public  | proyectos_inversion_ubicaciones | DELETE    
neondb_owner  | public  | proyectos_inversion_ubicaciones | INSERT    
neondb_owner  | public  | proyectos_inversion_ubicaciones | REFERENCES
neondb_owner  | public  | proyectos_inversion_ubicaciones | SELECT    
neondb_owner  | public  | proyectos_inversion_ubicaciones | TRIGGER   
neondb_owner  | public  | proyectos_inversion_ubicaciones | TRUNCATE  
neondb_owner  | public  | proyectos_inversion_ubicaciones | UPDATE    
neondb_owner  | public  | roles                           | DELETE    
neondb_owner  | public  | roles                           | INSERT    
neondb_owner  | public  | roles                           | REFERENCES
neondb_owner  | public  | roles                           | SELECT    
neondb_owner  | public  | roles                           | TRIGGER   
neondb_owner  | public  | roles                           | TRUNCATE  
neondb_owner  | public  | roles                           | UPDATE    
neondb_owner  | public  | roles_permisos                  | DELETE    
neondb_owner  | public  | roles_permisos                  | INSERT    
neondb_owner  | public  | roles_permisos                  | REFERENCES
neondb_owner  | public  | roles_permisos                  | SELECT    
neondb_owner  | public  | roles_permisos                  | TRIGGER   
neondb_owner  | public  | roles_permisos                  | TRUNCATE  
neondb_owner  | public  | roles_permisos                  | UPDATE    
neondb_owner  | public  | subidas_pendientes              | DELETE    
neondb_owner  | public  | subidas_pendientes              | INSERT    
neondb_owner  | public  | subidas_pendientes              | REFERENCES
neondb_owner  | public  | subidas_pendientes              | SELECT    
neondb_owner  | public  | subidas_pendientes              | TRIGGER   
neondb_owner  | public  | subidas_pendientes              | TRUNCATE  
neondb_owner  | public  | subidas_pendientes              | UPDATE    
neondb_owner  | public  | usuarios                        | DELETE    
neondb_owner  | public  | usuarios                        | INSERT    
neondb_owner  | public  | usuarios                        | REFERENCES
neondb_owner  | public  | usuarios                        | SELECT    
neondb_owner  | public  | usuarios                        | TRIGGER   
neondb_owner  | public  | usuarios                        | TRUNCATE  
neondb_owner  | public  | usuarios                        | UPDATE    
neondb_owner  | public  | v_buscador_ocupacional          | DELETE    
neondb_owner  | public  | v_buscador_ocupacional          | INSERT    
neondb_owner  | public  | v_buscador_ocupacional          | REFERENCES
neondb_owner  | public  | v_buscador_ocupacional          | SELECT    
neondb_owner  | public  | v_buscador_ocupacional          | TRIGGER   
neondb_owner  | public  | v_buscador_ocupacional          | TRUNCATE  
neondb_owner  | public  | v_buscador_ocupacional          | UPDATE    
neondb_owner  | public  | v_estado_cargas_ocupacional     | DELETE    
neondb_owner  | public  | v_estado_cargas_ocupacional     | INSERT    
neondb_owner  | public  | v_estado_cargas_ocupacional     | REFERENCES
neondb_owner  | public  | v_estado_cargas_ocupacional     | SELECT    
neondb_owner  | public  | v_estado_cargas_ocupacional     | TRIGGER   
neondb_owner  | public  | v_estado_cargas_ocupacional     | TRUNCATE  
neondb_owner  | public  | v_estado_cargas_ocupacional     | UPDATE    
*/

/* ================================================================
   20. FOREIGN DATA WRAPPERS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   21. SERVIDORES EXTERNOS / FOREIGN SERVERS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   22. FOREIGN TABLES
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   23. VERIFICAR EXTENSIÓN DBLINK
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   24. VERIFICAR EXTENSIÓN PG_CRON
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   25. JOBS PG_CRON
   ================================================================ */
/*
No se encontraron resultados (extensión pg_cron no instalada).
*/

/* ================================================================
   26. COMENTARIOS DE OBJETOS
   ================================================================ */
/*
No se encontraron resultados.
*/

/* ================================================================
   27. COMENTARIOS DE COLUMNAS
   ================================================================ */
/*
esquema | tabla                           | columna                    | descripcion
--------|---------------------------------|----------------------------|------------
public  | archivos                        | id                         | NULL       
public  | archivos                        | nombre_original            | NULL       
public  | archivos                        | nombre_almacenado          | NULL       
public  | archivos                        | ruta_relativa              | NULL       
public  | archivos                        | mime_type                  | NULL       
public  | archivos                        | extension                  | NULL       
public  | archivos                        | tamano_bytes               | NULL       
public  | archivos                        | hash_sha256                | NULL       
public  | archivos                        | ambito                     | NULL       
public  | archivos                        | estado                     | NULL       
public  | archivos                        | texto_alternativo          | NULL       
public  | archivos                        | subido_por                 | NULL       
public  | archivos                        | created_at                 | NULL       
public  | archivos                        | updated_at                 | NULL       
public  | auditoria_cambios               | id                         | NULL       
public  | auditoria_cambios               | entidad_id                 | NULL       
public  | auditoria_cambios               | entidad_tipo               | NULL       
public  | auditoria_cambios               | usuario_id                 | NULL       
public  | auditoria_cambios               | usuario_nombre             | NULL       
public  | auditoria_cambios               | accion                     | NULL       
public  | auditoria_cambios               | campos_modificados         | NULL       
public  | auditoria_cambios               | created_at                 | NULL       
public  | auditoria_cambios               | ip                         | NULL       
public  | auditoria_cambios               | user_agent                 | NULL       
public  | bloqueos_edicion                | ambito                     | NULL       
public  | bloqueos_edicion                | slug                       | NULL       
public  | bloqueos_edicion                | usuario_id                 | NULL       
public  | bloqueos_edicion                | usuario_nombre             | NULL       
public  | bloqueos_edicion                | adquirido_en               | NULL       
public  | bloqueos_edicion                | expira_en                  | NULL       
public  | cargas_datos                    | id                         | NULL       
public  | cargas_datos                    | modulo                     | NULL       
public  | cargas_datos                    | archivo_id                 | NULL       
public  | cargas_datos                    | estado                     | NULL       
public  | cargas_datos                    | filas_procesadas           | NULL       
public  | cargas_datos                    | mensaje                    | NULL       
public  | cargas_datos                    | subido_por                 | NULL       
public  | cargas_datos                    | creado_en                  | NULL       
public  | cargas_datos                    | completado_en              | NULL       
public  | cargas_datos                    | progreso                   | NULL       
public  | cargas_datos                    | filas_totales              | NULL       
public  | cargas_datos_ocupacionales      | carga_id                   | NULL       
public  | cargas_datos_ocupacionales      | anio                       | NULL       
public  | cargas_datos_ocupacionales      | reemplazar                 | NULL       
public  | cargas_datos_ocupacionales      | filas_nacional             | NULL       
public  | cargas_datos_ocupacionales      | filas_departamental        | NULL       
public  | cargas_datos_ocupacionales      | reporte                    | NULL       
public  | cargas_datos_ocupacionales      | periodo_id                 | NULL       
public  | cargas_datos_ocupacionales      | corte_id                   | NULL       
public  | centros_formacion               | id                         | NULL       
public  | centros_formacion               | departamento_id            | NULL       
public  | centros_formacion               | nombre                     | NULL       
public  | centros_formacion               | created_at                 | NULL       
public  | centros_formacion               | updated_at                 | NULL       
public  | centros_formacion               | codigo                     | NULL       
public  | ciiu_clases                     | id                         | NULL       
public  | ciiu_clases                     | seccion_id                 | NULL       
public  | ciiu_clases                     | codigo                     | NULL       
public  | ciiu_clases                     | nombre                     | NULL       
public  | ciiu_clases                     | created_at                 | NULL       
public  | ciiu_clases                     | updated_at                 | NULL       
public  | ciiu_secciones                  | id                         | NULL       
public  | ciiu_secciones                  | letra                      | NULL       
public  | ciiu_secciones                  | nombre                     | NULL       
public  | ciiu_secciones                  | divisiones                 | NULL       
public  | ciiu_secciones                  | activa                     | NULL       
public  | ciiu_secciones                  | created_at                 | NULL       
public  | ciiu_secciones                  | updated_at                 | NULL       
public  | configuracion                   | id                         | NULL       
public  | configuracion                   | clave                      | NULL       
public  | configuracion                   | valor                      | NULL       
public  | configuracion                   | actualizado_por            | NULL       
public  | configuracion                   | created_at                 | NULL       
public  | configuracion                   | updated_at                 | NULL       
public  | cortes_ocupacionales            | anio                       | NULL       
public  | cortes_ocupacionales            | estado                     | NULL       
public  | cortes_ocupacionales            | publicado_en               | NULL       
public  | cortes_ocupacionales            | huella_datos               | NULL       
public  | cortes_ocupacionales            | created_at                 | NULL       
public  | cortes_ocupacionales            | updated_at                 | NULL       
public  | cortes_ocupacionales            | id                         | NULL       
public  | cortes_ocupacionales            | periodo_id                 | NULL       
public  | criterios_ocupacionales         | codigo                     | NULL       
public  | criterios_ocupacionales         | nombre                     | NULL       
public  | criterios_ocupacionales         | regla                      | NULL       
public  | criterios_ocupacionales         | orden                      | NULL       
public  | criterios_ocupacionales         | id                         | NULL       
public  | departamentos                   | id                         | NULL       
public  | departamentos                   | nombre                     | NULL       
public  | departamentos                   | codigo_dane                | NULL       
public  | departamentos                   | created_at                 | NULL       
public  | departamentos                   | updated_at                 | NULL       
public  | departamentos_alias             | alias_normalizado          | NULL       
public  | departamentos_alias             | departamento_id            | NULL       
public  | empresas                        | id                         | NULL       
public  | empresas                        | nombre                     | NULL       
public  | empresas                        | created_at                 | NULL       
public  | empresas                        | updated_at                 | NULL       
public  | indicadores_ocupacionales       | departamento_id            | NULL       
public  | indicadores_ocupacionales       | inscritos                  | NULL       
public  | indicadores_ocupacionales       | vacantes                   | NULL       
public  | indicadores_ocupacionales       | percentil_inscritos        | NULL       
public  | indicadores_ocupacionales       | percentil_vacantes         | NULL       
public  | indicadores_ocupacionales       | id                         | NULL       
public  | indicadores_ocupacionales       | corte_id                   | NULL       
public  | indicadores_ocupacionales       | ocupacion_id               | NULL       
public  | indicadores_ocupacionales       | criterio_codigo            | NULL       
public  | migraciones_aplicadas           | nombre                     | NULL       
public  | migraciones_aplicadas           | aplicada_en                | NULL       
public  | municipios                      | id                         | NULL       
public  | municipios                      | departamento_id            | NULL       
public  | municipios                      | nombre                     | NULL       
public  | municipios                      | created_at                 | NULL       
public  | municipios                      | updated_at                 | NULL       
public  | niveles_cualificacion           | codigo_nc                  | NULL       
public  | niveles_cualificacion           | id                         | NULL       
public  | niveles_cualificacion           | nivel_ocupacional_id       | NULL       
public  | niveles_formacion               | id                         | NULL       
public  | niveles_formacion               | nombre                     | NULL       
public  | niveles_formacion               | created_at                 | NULL       
public  | niveles_formacion               | updated_at                 | NULL       
public  | niveles_formacion               | codigo                     | NULL       
public  | niveles_ocupacionales           | codigo                     | NULL       
public  | niveles_ocupacionales           | etiqueta                   | NULL       
public  | niveles_ocupacionales           | nombre                     | NULL       
public  | niveles_ocupacionales           | descripcion                | NULL       
public  | niveles_ocupacionales           | orden                      | NULL       
public  | niveles_ocupacionales           | id                         | NULL       
public  | ocupaciones                     | codigo                     | NULL       
public  | ocupaciones                     | nombre                     | NULL       
public  | ocupaciones                     | codigo_nc                  | NULL       
public  | ocupaciones                     | nombre_vigencia            | NULL       
public  | ocupaciones                     | created_at                 | NULL       
public  | ocupaciones                     | updated_at                 | NULL       
public  | ocupaciones                     | id                         | NULL       
public  | paginas                         | id                         | NULL       
public  | paginas                         | slug                       | NULL       
public  | paginas                         | titulo                     | NULL       
public  | paginas                         | version_publicada_id       | NULL       
public  | paginas                         | creado_por                 | NULL       
public  | paginas                         | created_at                 | NULL       
public  | paginas                         | updated_at                 | NULL       
public  | paginas                         | ambito                     | NULL       
public  | paginas                         | visitas                    | NULL       
public  | paginas_versiones               | id                         | NULL       
public  | paginas_versiones               | pagina_id                  | NULL       
public  | paginas_versiones               | contenido                  | NULL       
public  | paginas_versiones               | layout                     | NULL       
public  | paginas_versiones               | numero_version             | NULL       
public  | paginas_versiones               | estado                     | NULL       
public  | paginas_versiones               | motivo_rechazo             | NULL       
public  | paginas_versiones               | revisor_id                 | NULL       
public  | paginas_versiones               | publicado_por              | NULL       
public  | paginas_versiones               | publicado_en               | NULL       
public  | paginas_versiones               | creado_en                  | NULL       
public  | paginas_versiones               | creado_por                 | NULL       
public  | paginas_versiones               | revisado_en                | NULL       
public  | paginas_versiones               | comentario_cambios         | NULL       
public  | periodos                        | codigo                     | NULL       
public  | periodos                        | nombre                     | NULL       
public  | periodos                        | orden                      | NULL       
public  | periodos                        | id                         | NULL       
public  | permisos                        | id                         | NULL       
public  | permisos                        | clave                      | NULL       
public  | permisos                        | created_at                 | NULL       
public  | permisos                        | updated_at                 | NULL       
public  | preguntas_seguridad             | id                         | NULL       
public  | preguntas_seguridad             | usuario_id                 | NULL       
public  | preguntas_seguridad             | pregunta_clave             | NULL       
public  | preguntas_seguridad             | respuesta_hash             | NULL       
public  | preguntas_seguridad             | orden                      | NULL       
public  | preguntas_seguridad             | created_at                 | NULL       
public  | preguntas_seguridad             | updated_at                 | NULL       
public  | programas_formacion             | id                         | NULL       
public  | programas_formacion             | nivel_formacion_id         | NULL       
public  | programas_formacion             | nombre                     | NULL       
public  | programas_formacion             | created_at                 | NULL       
public  | programas_formacion             | updated_at                 | NULL       
public  | programas_formacion             | codigo                     | NULL       
public  | programas_sobresalientes        | id                         | NULL       
public  | programas_sobresalientes        | departamento_id            | NULL       
public  | programas_sobresalientes        | centro_id                  | NULL       
public  | programas_sobresalientes        | programa_id                | NULL       
public  | programas_sobresalientes        | nivel_formacion_id         | NULL       
public  | programas_sobresalientes        | sexo                       | NULL       
public  | programas_sobresalientes        | certificados               | NULL       
public  | programas_sobresalientes        | vinculados                 | NULL       
public  | programas_sobresalientes        | tasa_vinculacion           | NULL       
public  | programas_sobresalientes        | salario_promedio           | NULL       
public  | programas_sobresalientes        | created_at                 | NULL       
public  | programas_sobresalientes        | updated_at                 | NULL       
public  | proyectos_inversion             | id                         | NULL       
public  | proyectos_inversion             | tipo                       | NULL       
public  | proyectos_inversion             | descripcion                | NULL       
public  | proyectos_inversion             | empresa_id                 | NULL       
public  | proyectos_inversion             | seccion_id                 | NULL       
public  | proyectos_inversion             | clase_id                   | NULL       
public  | proyectos_inversion             | fecha_anuncio              | NULL       
public  | proyectos_inversion             | fuente_url                 | NULL       
public  | proyectos_inversion             | fuente_medio               | NULL       
public  | proyectos_inversion             | inversion_cop              | NULL       
public  | proyectos_inversion             | empleos_estimados          | NULL       
public  | proyectos_inversion             | estado                     | NULL       
public  | proyectos_inversion             | creado_por                 | NULL       
public  | proyectos_inversion             | created_at                 | NULL       
public  | proyectos_inversion             | updated_at                 | NULL       
public  | proyectos_inversion_ubicaciones | id                         | NULL       
public  | proyectos_inversion_ubicaciones | proyecto_id                | NULL       
public  | proyectos_inversion_ubicaciones | departamento_id            | NULL       
public  | proyectos_inversion_ubicaciones | municipio_id               | NULL       
public  | proyectos_inversion_ubicaciones | created_at                 | NULL       
public  | roles                           | id                         | NULL       
public  | roles                           | nombre                     | NULL       
public  | roles                           | descripcion                | NULL       
public  | roles                           | created_at                 | NULL       
public  | roles                           | updated_at                 | NULL       
public  | roles                           | es_sistema                 | NULL       
public  | roles_permisos                  | rol_id                     | NULL       
public  | roles_permisos                  | permiso_id                 | NULL       
public  | subidas_pendientes              | pagina_id                  | NULL       
public  | subidas_pendientes              | ruta                       | NULL       
public  | subidas_pendientes              | creado_en                  | NULL       
public  | usuarios                        | id                         | NULL       
public  | usuarios                        | nombre                     | NULL       
public  | usuarios                        | email                      | NULL       
public  | usuarios                        | rol_id                     | NULL       
public  | usuarios                        | estado                     | NULL       
public  | usuarios                        | fecha_caducidad            | NULL       
public  | usuarios                        | ultimo_acceso_en           | NULL       
public  | usuarios                        | password_hash              | NULL       
public  | usuarios                        | created_at                 | NULL       
public  | usuarios                        | updated_at                 | NULL       
public  | usuarios                        | debe_cambiar_password      | NULL       
public  | usuarios                        | debe_configurar_preguntas  | NULL       
public  | usuarios                        | intentos_fallidos          | NULL       
public  | usuarios                        | bloqueado_hasta            | NULL       
public  | usuarios                        | creado_por                 | NULL       
public  | usuarios                        | apellidos                  | NULL       
public  | usuarios                        | intentos_fallidos_login    | NULL       
public  | usuarios                        | password_temporal_vence_en | NULL       
public  | usuarios                        | password_hash_anterior     | NULL       
*/

/* ================================================================
   28. TAMAÑO DE LAS TABLAS
   ================================================================ */
/*
esquema | tabla                           | tamano_total | tamano_tabla | tamano_indices
--------|---------------------------------|--------------|--------------|---------------
public  | indicadores_ocupacionales       | 7720 kB      | 2912 kB      | 4776 kB       
public  | auditoria_cambios               | 2184 kB      | 1480 kB      | 664 kB        
public  | paginas_versiones               | 952 kB       | 288 kB       | 192 kB        
public  | programas_sobresalientes        | 544 kB       | 112 kB       | 400 kB        
public  | ocupaciones                     | 216 kB       | 128 kB       | 88 kB         
public  | programas_formacion             | 120 kB       | 24 kB        | 64 kB         
public  | proyectos_inversion             | 112 kB       | 32 kB        | 48 kB         
public  | ciiu_clases                     | 112 kB       | 24 kB        | 64 kB         
public  | usuarios                        | 96 kB        | 8192 bytes   | 48 kB         
public  | paginas                         | 96 kB        | 8192 bytes   | 48 kB         
public  | centros_formacion               | 96 kB        | 24 kB        | 48 kB         
public  | permisos                        | 80 kB        | 8192 bytes   | 32 kB         
public  | bloqueos_edicion                | 80 kB        | 8192 bytes   | 32 kB         
public  | roles                           | 80 kB        | 8192 bytes   | 32 kB         
public  | preguntas_seguridad             | 80 kB        | 8192 bytes   | 32 kB         
public  | cargas_datos                    | 80 kB        | 8192 bytes   | 32 kB         
public  | roles_permisos                  | 72 kB        | 8192 bytes   | 32 kB         
public  | proyectos_inversion_ubicaciones | 72 kB        | 8192 bytes   | 48 kB         
public  | archivos                        | 64 kB        | 8192 bytes   | 48 kB         
public  | niveles_ocupacionales           | 64 kB        | 8192 bytes   | 48 kB         
public  | subidas_pendientes              | 64 kB        | 8192 bytes   | 16 kB         
public  | migraciones_aplicadas           | 64 kB        | 8192 bytes   | 16 kB         
public  | municipios                      | 56 kB        | 8192 bytes   | 48 kB         
public  | departamentos                   | 56 kB        | 8192 bytes   | 48 kB         
public  | cargas_datos_ocupacionales      | 48 kB        | 8192 bytes   | 32 kB         
public  | configuracion                   | 48 kB        | 8192 bytes   | 32 kB         
public  | criterios_ocupacionales         | 40 kB        | 8192 bytes   | 32 kB         
public  | ciiu_secciones                  | 40 kB        | 8192 bytes   | 32 kB         
public  | departamentos_alias             | 40 kB        | 8192 bytes   | 32 kB         
public  | niveles_cualificacion           | 40 kB        | 8192 bytes   | 32 kB         
public  | empresas                        | 40 kB        | 8192 bytes   | 32 kB         
public  | niveles_formacion               | 40 kB        | 8192 bytes   | 32 kB         
public  | periodos                        | 40 kB        | 8192 bytes   | 32 kB         
public  | cortes_ocupacionales            | 40 kB        | 8192 bytes   | 32 kB         
*/

/* ================================================================
   29. TAMAÑO TOTAL DE LA BASE DE DATOS
   ================================================================ */
/*
base_datos | tamano_total
-----------|-------------
neondb     | 24 MB       
*/

/* ================================================================
   30. RESUMEN GENERAL DE OBJETOS
   ================================================================ */
/*
tipo_objeto           | cantidad
----------------------|---------
Tablas                | 36      
Vistas                | 2       
Vistas materializadas | 0       
Índices               | 90      
Funciones             | 48      
Procedimientos        | 0       
Triggers              | 0       
Secuencias            | 0       
Extensiones           | 3       
*/

