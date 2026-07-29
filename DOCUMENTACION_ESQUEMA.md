# Esquema de Base de Datos - Observatorio Laboral y Ocupacional (OLO)

**Fecha de generación:** 29 de julio de 2026  
**Base de datos:** PostgreSQL (Neon)  
**Entorno:** Producción

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Tablas** | 24 |
| **Relaciones (FK)** | ~15 |
| **Constraints** | 708 |
| **Índices** | 557 |

---

## 📋 Tablas Principales

### 1. **usuarios** 
Usuarios administradores del sistema con control de acceso basado en roles.

**Columnas clave:**
- `id` (UUID): Identificador único
- `nombre`: Nombre completo del usuario
- `email`: Email único para login
- `rol_id` (FK): Determina permisos del usuario
- `estado`: active/inactive/locked
- `fecha_caducidad`: Vencimiento de cuenta (NULL = sin vencimiento)
- `ultimo_acceso_en`: Última sesión
- `debe_cambiar_password`: Flag para forzar cambio en próximo login

### 2. **usuarios_sitio**
Usuarios públicos del sitio web con permisos limitados.

**Columnas clave:**
- `id` (UUID)
- `email`: Único
- `password_hash`: Contraseña cifrada
- `status`: active/inactive
- `created_by` (FK): Quién los creó

### 3. **roles**
Definición de roles de acceso (administrador, editor, etc.).

**Columnas clave:**
- `id` (UUID)
- `name`: Nombre único del rol
- `description`: Descripción del rol

### 4. **permissions**
Permisos granulares del sistema.

**Valores estándar:**
- `acceso.sitio`: Acceso al sitio público
- `acceso.intranet`: Acceso a la intranet

### 5. **role_permissions**
Relación muchos-a-muchos entre roles y permisos.

---

## 📄 Gestión de Contenidos

### 6. **paginas**
Páginas publicables del sitio e intranet con versionado.

**Columnas clave:**
- `id` (UUID)
- `slug` (VARCHAR): URL amigable (único por ámbito)
- `titulo`: Título visible
- `version_publicada_id` (FK): Qué versión está en vivo
- `creado_por` (FK): Usuario que creó la página
- `ambito` (TEXT): 'sitio' o 'intranet'
- `created_at`, `updated_at`

**Nota:** El slug es único **por ámbito**, permitiendo `/inicio` en sitio e intranet.

### 7. **paginas_versiones**
Historial de versiones de páginas con estados (borrador, revisión, publicado).

**Columnas clave:**
- `id` (UUID)
- `pagina_id` (FK): Página asociada
- `contenido` (JSONB): Bloques Puck del contenido
- `layout` (JSONB): Configuración de layout
- `numero_version` (INTEGER)
- `estado`: borrador/en_revisión/publicado/rechazado
- `motivo_rechazo` (TEXT): Razón si fue rechazada
- `revisor_id` (FK): Usuario que revisó
- `publicado_por` (FK): Usuario que publicó
- `publicado_en` (TIMESTAMPTZ)
- `creado_por` (FK): Usuario que escribió la versión
- `revisado_en` (TIMESTAMPTZ)

### 8. **contenidos**
Artículos y posts publicables con metadatos SEO.

**Columnas clave:**
- `id` (UUID)
- `titulo`, `slug`: Identificadores públicos
- `resumen`, `cuerpo`: Contenido
- `seccion_id` (FK): Categoría
- `autor_id` (FK): Usuario autor
- `publicado_en` (TIMESTAMPTZ)

### 9. **contenidos_archivos**
Asociación entre contenidos y archivos (adjuntos, portadas, galerías).

**Columnas clave:**
- `contenido_id`, `archivo_id` (PK compuesta)
- `orden` (SMALLINT): Posición en el contenido
- `rol`: adjunto / portada / galeria

---

## 📁 Gestión de Archivos

### 10. **archivos**
Almacenamiento centralizado de archivos con validación de integridad.

**Columnas clave:**
- `id` (UUID)
- `nombre_original`: Nombre subido por el usuario
- `nombre_almacenado`: Nombre en disco
- `ruta_relativa`: Ruta en el servidor
- `mime_type`: Tipo de archivo
- `tamano_bytes` (BIGINT): Validado en servidor (RF-02)
- `hash_sha256` (CHAR 64): Checksum para integridad y duplicados
- `ambito`: publico / interno (controla visibilidad)
- `estado`: pendiente / disponible / rechazado / eliminado
- `texto_alternativo`: Descripción para accesibilidad (WCAG)
- `subido_por` (FK): Usuario que subió

**Nota:** Los archivos se guardan desacoplados del contenido. Una imagen subida desde Puck no pertenece a ningún contenido específico, pertenece al bloque.

### 11. **archivos_metadatos**
Información adicional y análisis de archivos.

---

## ⚙️ Configuración y Customización

### 12. **configuraciones**
Configuración del sistema editable en tiempo de ejecución.

**Columnas clave:**
- `clave` (TEXT): Identificador único
- `valor` (JSONB): Valor configurable
- `descripcion`: Qué controla
- `actualizado_por` (FK)

**Ejemplos de configuraciones:**
- `archivos.tamano_maximo_bytes`: 10485760 (10 MB)
- `archivos.tipos_permitidos`: Lista blanca de MIME (PDF, Excel, imágenes, SVG)
- `powerbi.dominios_permitidos`: ["app.powerbi.com"]
- `respaldos.frecuencia_cron`: "0 3 * * *"
- `respaldos.retencion_dias`: 30

### 13. **marca_versiones**
Versiones de identidad visual con tokens de diseño.

**Columnas clave:**
- `id` (UUID)
- `version` (INTEGER): Número de versión único
- `tokens` (JSONB): Colores, tipografías, logos
- `activa` (BOOLEAN): Versión en uso
- `contraste_validado` (BOOLEAN): Cumple WCAG
- `creado_por` (FK)
- `aprobado_por` (FK)

**Nota:** Los logotipos dentro de tokens son IDs de archivos, no rutas.

### 14. **tableros_bi**
Referencias a tableros Power BI embebidos en páginas.

**Columnas clave:**
- `id` (UUID)
- `nombre` (TEXT): Identificador único
- `url` (TEXT): URL del tablero en Power BI
- `page_name`: Página específica del tablero
- `ambito`: sitio / intranet (dónde aparece)
- `activo` (BOOLEAN)

**Ventaja:** Cambiar el informe se hace una vez en la BD, no en tres bloques diferentes.

---

## 🔐 Privacidad y Cumplimiento Normativo

### 15. **politicas_privacidad**
Políticas de privacidad versionadas (Ley 1581/2012 - Habeas Data).

**Columnas clave:**
- `id` (UUID)
- `version` (TEXT): Identificador único
- `titulo`, `cuerpo`: Contenido
- `vigente_desde`, `vigente_hasta` (TIMESTAMPTZ)
- Constraint: `vigente_hasta > vigente_desde`

### 16. **consentimientos**
Registro de aceptaciones de políticas de privacidad.

**Columnas clave:**
- `id` (UUID)
- `politica_id` (FK): **ON DELETE RESTRICT** (prueba legal)
- `formulario` (TEXT): Dónde se aceptó
- `titular_identificador` (TEXT): Quién aceptó
- `aceptado` (BOOLEAN): Solo `true` - registra aceptación explícita
- `aceptado_en` (TIMESTAMPTZ)
- `ip` (INET): Para auditoría
- `user_agent` (TEXT): Navegador/dispositivo

**Nota:** Las políticas con consentimientos registrados **no se pueden borrar** (prueba legal).

---

## 📢 Notificaciones y Avisos

### 17. **notificaciones**
Avisos del sistema para usuarios (cambios, rechazos, tareas).

**Columnas clave:**
- `id` (UUID)
- `destinatario_id` (FK): Usuario que recibe la notificación
- `tipo` (TEXT): Tipo de notificación
- `entidad_tipo`, `entidad_id`: Qué entidad se notifica
- `datos` (JSONB): Parámetros del mensaje
- `leida_en` (TIMESTAMPTZ): Cuándo se leyó

**Ventaja:** El texto se compone en el frontend a partir del tipo, así el contenido vive en un solo lugar.

---

## 📊 Auditoría

### 18. **auditoria_accesos**
Registro de descargas y visualizaciones de archivos y páginas.

**Columnas clave:**
- `id` (UUID)
- `usuario_id` (FK): **NULL** = descarga pública anónima
- `recurso_tipo`: archivo / pagina_interna / tablero
- `recurso_id` (UUID)
- `accion`: ver / descargar
- `ip` (INET), `user_agent` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Nota:** Separada de auditoria_cambios por volumen, retención y columnas diferentes.

### 19. **auditoria_cambios** (anteriormente content_audit_logs)
Historial de cambios en contenidos.

**Columnas clave:**
- `id` (UUID)
- `entidad_id`, `entidad_tipo`: Qué se modificó
- `usuario_id`, `usuario_nombre`: Quién la hizo
- `accion` (TEXT): Tipo de cambio
- `campos_modificados` (JSONB): Diff de cambios
- `ip`, `user_agent`: Para auditoría
- `created_at`

---

## 💾 Respaldos

### 20. **respaldos**
Registro de respaldos automáticos y manuales de la BD.

**Columnas clave:**
- `id` (UUID)
- `disparado_por`: programado / manual
- `usuario_id` (FK)
- `iniciado_en`, `terminado_en` (TIMESTAMPTZ)
- `estado`: en_curso / exitoso / fallido
- `destino` (TEXT): Dónde se guardó
- `tamano_bytes` (BIGINT)
- `checksum_sha256` (CHAR 64)
- `cifrado` (BOOLEAN)
- `retencion_hasta` (TIMESTAMPTZ): Cuándo se puede borrar (RF-17)
- `error` (TEXT): Mensaje si falló
- Constraints:
  - `terminado_en >= iniciado_en`
  - Si `estado = 'fallido'`, entonces `error NOT NULL`

---

## 🔑 Seguridad

### 21. **security_questions**
Preguntas de seguridad personalizadas para autenticación multifactor.

**Columnas clave:**
- `id` (UUID)
- `user_id` (FK): FK a usuarios
- `question_key` (TEXT): Identificador de la pregunta
- `answer_hash` (TEXT): Respuesta hasheada
- `sort_order` (INTEGER)
- Constraint único: `(user_id, question_key)`

---

## 📚 Tablas Heredadas (En Migración)

### 22. **Section**
Secciones de contenido heredadas. **Migración pendiente** a tabla `secciones`.

### 23. **Post**
Posts heredados de versión anterior. **Migración pendiente** a tabla `contenidos`.

### 24. **Attachment**
Adjuntos heredados. **Migración pendiente** — usar tabla `archivos`.

---

## 🏗️ Relaciones Principales (Foreign Keys)

```
usuarios ──┬─→ roles
           └─→ security_questions
           └─→ files (uploaded_by)

roles ──→ role_permissions ←── permissions

paginas ──┬─→ paginas_versiones (version_publicada_id)
          ├─→ usuarios (creado_por)
          └─→ secciones (seccion_id)

paginas_versiones ──┬─→ paginas
                    ├─→ usuarios (revisor_id)
                    ├─→ usuarios (publicado_por)
                    └─→ usuarios (creado_por)

contenidos ──┬─→ archivos (vía contenidos_archivos)
             ├─→ usuarios (autor_id)
             └─→ secciones (seccion_id)

archivos ──┬─→ usuarios (subido_por)
           └─→ contenidos_archivos

notificaciones ──→ usuarios (destinatario_id)

consentimientos ──→ politicas_privacidad (RESTRICT)

auditoria_accesos ──→ usuarios (usuario_id, nullable)
auditoria_cambios ──→ usuarios (usuario_id, nullable)

marca_versiones ──→ usuarios (creado_por, aprobado_por)
tableros_bi ──→ usuarios (creado_por)

respaldos ──→ usuarios (usuario_id, nullable)
```

---

## 🔄 Flujos de Datos Principales

### Publicación de Página
1. Usuario crea página (`paginas`)
2. Crea múltiples versiones (`paginas_versiones`)
3. Versiones pasan por revisión (estado: borrador → en_revisión → publicado)
4. Cuando se publica, `paginas.version_publicada_id` apunta a esa versión
5. Se registra quién revisó y quién publicó
6. Se registra cambio en `auditoria_cambios`

### Subida de Archivo
1. Usuario sube archivo a `/uploads`
2. Se valida tipo MIME (lista blanca en `configuraciones`)
3. Se calcula SHA-256 para deduplicación
4. Se inserta en `archivos` con estado = 'pendiente'
5. Admin revisa en `FileStatuses` y cambia estado a 'disponible' o 'rechazado'
6. Contenidos pueden referenciar el archivo via `contenidos_archivos`

### Consentimiento de Privacidad
1. Usuario ve `politicas_privacidad` vigente
2. Acepta explícitamente checkbox (nunca premarcado)
3. Se inserta en `consentimientos` con `aceptado = true`
4. Se registra IP y User-Agent
5. Política **no se puede eliminar** (prueba legal)

---

## 📝 Notas de Diseño

### UUIDs vs Secuenciales
- Todas las tablas usan `UUID` (gen_random_uuid())
- Ventaja: Pueden generarse cliente-side sin coordinar con BD
- Sin exposición de información (no se sabe cuántas tablas hay)

### JSONB para Flexibilidad
- `paginas_versiones.contenido`: Bloques Puck (estructura variable)
- `paginas_versiones.layout`: Configuración de layout
- `marca_versiones.tokens`: Tokens de diseño
- `configuraciones.valor`: Valores heterogéneos
- `notificaciones.datos`: Parámetros de mensajes
- `auditoria_cambios.campos_modificados`: Diffs

### Timestamps
- `created_at`, `updated_at`: Manejados por `DEFAULT now()`
- `TIMESTAMPTZ`: Zona horaria automática (UTC)
- `updated_at` se actualiza automáticamente en UPDATE

### Constraints de Integridad
- Foreign keys con `ON DELETE CASCADE` (adjuntos/versiones se borran con contenido)
- FK con `ON DELETE SET NULL` (auditoría/referencias siguen existiendo)
- FK con `ON DELETE RESTRICT` (consentimientos, políticas con prueba legal)
- CHECK constraints para valores permitidos (ambito IN, estado IN, etc.)
- UNIQUE para identificadores únicos (email, slug, nombre)

---

## 🔐 Consideraciones de Seguridad

1. **Contraseñas:** Todas hasheadas con bcryptjs
2. **Checksums:** SHA-256 en archivos para verificar integridad
3. **Auditoría completa:** Quién hizo qué, cuándo, desde dónde (IP)
4. **Normativa:** Cumple Ley 1581/2012 (Habeas Data)
5. **Acceso:** RBAC basado en roles y permisos granulares
6. **Pruebas legales:** Consentimientos y políticas inmutables

---

## 📈 Índices Principales

Se han creado índices sobre:
- PKs (automático)
- FKs (para búsquedas cruzadas)
- `email` (login rápido)
- `slug` (búsquedas por URL)
- `usuario_id` (auditoría)
- `estado` (búsquedas de estado)
- `created_at` (ordenamiento temporal)

Total: 557 índices

---

## 📞 Contacto y Soporte

Para cambios en el esquema:
1. Crear migración en `src/infrastructure/db/migrations`
2. Actualizar modelos Sequelize en `src/infrastructure/db/models`
3. Ejecutar `npm run migrate`
4. Ejecutar `npm run db:verificar` para validar consistencia

---

**Documento generado automáticamente** — 29 de julio de 2026
