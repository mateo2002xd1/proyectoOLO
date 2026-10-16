# Plan de Pruebas: Sistema Integral OLO
Guía institucional de escenarios y casos de prueba para verificación funcional, técnica y operativa del Observatorio Laboral y Ocupacional (Sitio Web Público, Intranet y Panel Administrativo).

---

## MÓDULO 1: Autenticación, Sesión y Seguridad de Acceso

### Escenario 1: Proceso de Primer Ingreso (Sitio Web e Intranet)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Configuración obligatoria de cuenta en primer ingreso |
| **Resultado Esperado:** | Detección obligatoria de primer ingreso, validación de clave provisoria, registro de contraseña definitiva bajo política, configuración de 3 preguntas secretas y confirmación de acceso exitoso. |
| **Precondición:** | Cuenta creada por el Administrador con contraseña temporal, configurada para exigir el cambio obligatorio de clave y el registro de preguntas secretas en el primer acceso. |
| **Datos de entrada** | **Usuario:** `funcionario.nuevo@sena.edu.co` (Roles: Administrador, Editor o Directivo)<br>**Contraseña:** Contraseña temporal provisoria asignada<br>**Nueva contraseña:** Clave con mín. 12 caracteres (mayúscula, minúscula, número y símbolo)<br>**Preguntas secretas:** 3 preguntas seleccionadas del catálogo y respuestas confidenciales |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Entrar a login de Sitio Web con clave temporal | Detecta primer ingreso y traslada forzosamente a pantalla de configuración (`/login/first-login`) |
| **2.** Configurar nueva clave definitiva en Sitio Web | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas |
| **3.** Configurar 3 preguntas de seguridad en Sitio Web | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión |
| **4.** Entrar a login de Intranet con clave temporal | Detecta primer ingreso y traslada forzosamente a pantalla de configuración (`/login/first-login`) |
| **5.** Configurar nueva clave definitiva en Intranet | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas |
| **6.** Configurar 3 preguntas de seguridad en Intranet | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión |

---

### Escenario 2: Validaciones de Acceso y Formulario de Login

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Validación de entradas, credenciales y control de acceso |
| **Resultado Esperado:** | Intercepción inmediata de correos con formato inválido o no corporativo, credenciales erróneas, cuentas inactivas y perfiles sin permisos para el entorno solicitado. |
| **Precondición:** | Formularios de inicio de sesión cargados en Sitio Web (`/login`) o Intranet (`/login`). |
| **Datos de entrada** | **Usuario:** Correo vacío, correo con formato inválido, correo externo no institucional (`usuario@gmail.com`), cuenta suspendida o inactiva, o cuenta sin permisos de portal<br>**Contraseña:** Contraseña vacía, clave incorrecta o credenciales no registradas |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Probar correo vacío en formulario de login | Muestra alerta de validación: *"El correo es requerido"* |
| **2.** Probar campo de contraseña vacío | Muestra alerta de validación: *"La contraseña es requerida"* |
| **3.** Probar correo con sintaxis inválida (ej. correo-invalido) | Muestra alerta de formato: *"El correo no tiene un formato válido"* |
| **4.** Probar correo externo no institucional (`usuario@gmail.com`) | Muestra alerta de dominio: *"Debe ser un correo institucional @sena.edu.co"* |
| **5.** Probar credenciales incorrectas (correo y clave no coincidentes) | Muestra alerta general de seguridad: *"Correo o contraseña incorrectos"* sin filtrar datos confidenciales |
| **6.** Probar acceso con cuenta suspendida o inactiva | Bloquea la autenticación de inmediato con alerta: *"Cuenta inactiva o suspendida"* |
| **7.** Probar acceso a Sitio Web con rol sin permisos (Directivo / Subdirector) | Autentica pero detiene el acceso con alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."* |
| **8.** Probar acceso a Intranet con rol sin autorización interna | Bloquea la entrada al entorno privado con alerta: *"No tienes permisos para ingresar a la intranet."* |

---

### Escenario 3: Restablecimiento de Contraseña desde el Portal de Login (Sitio Web e Intranet)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Restablecimiento autónomo por preguntas de seguridad |
| **Resultado Esperado:** | Restablecimiento exitoso y autónomo de la clave personal mediante verificación de las 3 preguntas secretas, sincronizando de inmediato el acceso en ambos portales. |
| **Precondición:** | Funcionario con cuenta activa y sus 3 preguntas de seguridad previamente configuradas en el primer ingreso. |
| **Datos de entrada** | **Usuario:** `funcionario@sena.edu.co` (cuenta activa con preguntas registradas)<br>**Contraseña:** Contraseña actual olvidada / no requerida durante el restablecimiento<br>**Respuestas secretas:** Respuestas confidenciales coincidentes con las registradas<br>**Nueva contraseña:** Clave con mín. 12 caracteres (mayúscula, minúscula, número y símbolo) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Clic en "¿Olvidaste tu contraseña?" en login de Sitio Web | Traslada a pantalla `/login/recovery` solicitando correo institucional |
| **2.** Ingresar correo institucional `@sena.edu.co` y dar Continuar | Valida sintaxis, comprueba preguntas configuradas y navega a `/login/recovery/security-questions` |
| **3.** Responder secuencialmente las 3 preguntas de seguridad | Valida respuestas confidenciales en servidor sin depender de correo externo y traslada a `/login/recovery/reset-password` |
| **4.** Definir nueva contraseña cumpliendo requisitos y confirmar | Valida política de seguridad (12 caracteres, símbolos, etc.) y coincidencia exacta |
| **5.** Confirmar cambio de clave en Sitio Web | Muestra pantalla `/login/recovery/reset-success` y botón para volver a `/login` |
| **6.** Iniciar sesión en Intranet con la nueva contraseña | Comprueba acceso exitoso en Intranet validando la sincronización de la nueva clave |

---

### Escenario 4: Cierre de Sesión y Control de Inactividad

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Cierre de sesión seguro y temporizador de inactividad |
| **Resultado Esperado:** | Cierre seguro de sesión, bloqueo de historial de navegación para evitar volver atrás e interrupción preventiva al minuto 14 con cierre automático al minuto 15 de inactividad. |
| **Precondición:** | Sesión activa iniciada en el Sitio Web Público, la Intranet o el Panel Administrativo. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` o `editor@sena.edu.co` (cuenta con sesión abierta)<br>**Contraseña:** Contraseña activa de la sesión<br>**Tiempos:** 14 minutos sin eventos (advertencia) / 15 minutos (cierre forzoso) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Cerrar sesión desde el Panel Administrativo | Cierra la sesión activa y redirige a la pantalla de login del Panel Administrativo |
| **2.** Cerrar sesión desde el Sitio Web Público | Cierra la sesión activa y redirige a la pantalla de login del Sitio Web |
| **3.** Cerrar sesión desde la Intranet | Cierra la sesión activa y redirige a la pantalla de login de la Intranet |
| **4.** Probar botón "Atrás" del navegador tras cerrar sesión | Bloquea visualización privada en caché y redirige forzosamente a login |
| **5.** Dejar sesión inactiva (14 min) y probar "Seguir conectado" | Modal "¿Sigues ahí?" renueva la sesión tras clic en "Seguir trabajando" |
| **6.** Dejar expirar contador de 60s sin interacción | Cierra sesión automáticamente por inactividad y muestra alerta de expiración en login |

---

## MÓDULO 2: Navegación, Interfaz y Experiencia Visual del Panel

### Escenario 5: Entorno Visual, Navegación y Buscador Interno

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Navegación modular, adaptabilidad móvil y búsqueda |
| **Resultado Esperado:** | Navegación lateral estructurada, adaptabilidad fluida a vista móvil (doble barra), alternancia de modo claro/oscuro, centro de notificaciones y búsqueda a pantalla completa. |
| **Precondición:** | Funcionario autenticado con rol Administrador con permisos de acceso al panel administrativo (`/admin`). |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Términos de búsqueda:** "usuarios", "roles", "auditoria", "respaldos" |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Hacer clic en "Accesos" en el menú lateral | Despliega y contrae las opciones de "Usuarios" y "Roles y Permisos" |
| **2.** Alternar interruptor de tema (Modo claro / Modo oscuro) | Conmuta instantáneamente la apariencia visual del panel administrativo |
| **3.** Desplegar menú de usuario en el pie del menú lateral | Muestra nombre y correo del funcionario con accesos directos a "Mi perfil", "Configuración" y "Cerrar sesión" |
| **4.** Probar vista móvil en pantalla reducida (< 1024px) | Oculta el menú lateral; habilita barra inferior fija (Accesos, Revisión, Dashboard, Auditoría, Más) y barra superior de acciones |
| **5.** Abrir campana de notificaciones (Barra superior) | Abre el panel de alertas con avisos de cuentas por vencer y páginas en revisión, permitiendo descartar o navegar |
| **6.** Abrir buscador global a pantalla completa | Abre ventana de búsqueda rápida, filtra módulos en tiempo real por palabras o sinónimos y navega con Enter o clic |

---

## MÓDULO 3: Tablero de Control y Métricas — Dashboard

### Escenario 6: Tablero de Control (Dashboard)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta de métricas clave y accesos rápidos |
| **Resultado Esperado:** | Carga consolidada y actualizada de indicadores de gestión (usuarios, páginas publicadas, borradores pendientes) y navegación directa desde tarjetas operativas. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/dashboard`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Ingresar a `/admin/dashboard` y revisar métricas | Muestra cifras actualizadas de usuarios, páginas publicadas, borradores pendientes y gráficos de actividad |
| **2.** Probar accesos rápidos en las tarjetas | Redirige de forma directa a cada submódulo administrativo correspondiente |

---

## MÓDULO 4: Control de Accesos y Gobierno de Usuarios — RBAC

### Escenario 7: Gestión de Usuarios (`/admin/users`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Alta, edición, suspensión y restablecimiento de credenciales |
| **Resultado Esperado:** | Registro exitoso de usuarios con emisión de contraseña temporal, modificación de perfiles, bloqueo preventivo por suspensión y forzado de clave restablecida. |
| **Precondición:** | Funcionario autenticado con rol Administrador en el submódulo `/admin/users`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo usuario:** Nombre completo, correo `@sena.edu.co`, rol asignado y caducidad opcional |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Crear nuevo usuario con nombre, correo y rol | Modal emite correo y contraseña temporal provisoria generada de un solo uso con opción de copiado |
| **2.** Editar usuario existente con ícono de Lápiz | Permite actualizar nombre y rol asignado con confirmación en tabla y base de datos |
| **3.** Suspender usuario con interruptor de estado | Cuenta cambia a Inactiva, cierra las sesiones abiertas y bloquea su inicio de sesión |
| **4.** Reactivar usuario con interruptor de estado | Cuenta vuelve a Activa y funcionario puede reanudar inicios de sesión en el portal |
| **5.** Restablecer credenciales de usuario por Administrador | Activar casilla "Restablecer contraseña"; modal genera nueva clave temporal de un solo uso y fuerza reconfiguración |

---

### Escenario 8: Gestión de Roles y Permisos (`/admin/roles`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Matriz de permisos por roles y protección de perfiles |
| **Resultado Esperado:** | Creación de nuevos roles configurables, protección para evitar editar o borrar los roles base del sistema y bloqueo de eliminación si el rol aún tiene usuarios asignados. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/roles`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo rol:** Nombre del nuevo rol (ej. "Editor Regional"), descripción y selección de permisos asignados |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Crear nuevo rol personalizado con permisos | Registra el nuevo rol en la tabla con los permisos asignados |
| **2.** Comprobar protección de roles base (Admin / Editor) | Botón de eliminar deshabilitado o no visible (los roles principales están protegidos por el sistema para evitar su eliminación) |
| **3.** Intentar eliminar rol con usuarios asignados | Alerta roja bloquea la acción porque aún hay usuarios con ese rol e indica reasignarlos primero |
| **4.** Reasignar usuarios vinculados a otro rol en `/admin/users` | Desvincula los usuarios del rol personalizado dejándolo con 0 usuarios asignados |
| **5.** Eliminar rol personalizado ya sin usuarios | Permite confirmación y elimina definitivamente el nuevo rol del sistema |

---

## MÓDULO 5: Gobernanza Editorial y Ciclo de Publicación

### Escenario 9: Páginas en Revisión y Control de Permisos de Edición (`/admin/revision` y `/editor`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Control de edición y aprobación editorial |
| **Resultado Esperado:** | Cumplimiento estricto de permisos de edición por página (visibilidad del botón flotante y redirección por URL), envío a revisión, previsualización fidedigna y aprobación/rechazo motivado. |
| **Precondición:** | Páginas creadas en el CMS y cuentas configuradas: Editor con permiso en página A, Editor sin permiso en página B, y Administrador aprobador. |
| **Datos de entrada** | **Usuario:** `editor.tendencias@sena.edu.co` (Rol Editor con permiso en la página de tendencias) / `editor.limitado@sena.edu.co` (Rol Editor sin permiso en `/monitoreo`) / `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Claves definitivas activas de cada perfil |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Editor con permisos asignados edita página autorizada | Botón flotante de edición visible en la esquina inferior; al pulsar abre el editor visual (`/editor/tendencias`) |
| **2.** Editor intenta editar página SIN permisos asignados | Botón flotante de edición permanece completamente oculto en la interfaz pública |
| **3.** Editor intenta forzar acceso por URL a página no autorizada | El sistema valida permisos, bloquea la carga del editor y redirige a la vista pública normal (`/monitoreo`) |
| **4.** Usuario sin autenticación intenta ingresar a editor | Bloquea el acceso y redirige automáticamente a la pantalla de inicio de sesión |
| **5.** Enviar modificaciones de página a revisión | El Editor realiza cambios y los envía a revisión; el borrador entra en la lista de espera para aprobación |
| **6.** Administrador previsualiza borrador con ícono de Ojo | Abre vista previa del diseño propuesto tal como se verá en el portal |
| **7.** Administrador aprueba borrador pendiente | Publica inmediatamente la página en el portal público y limpia la cola de revisión |
| **8.** Administrador rechaza borrador con justificación | Devuelve el borrador al editor con motivo obligatorio registrado para corrección |
| **9.** Descartar borrador con ícono de basurero | Elimina el borrador descartado y limpia imágenes o archivos no utilizados |

---

## MÓDULO 6: Trazabilidad, Auditoría y Seguridad Forense

### Escenario 10: Auditoría y Bitácora (`/admin/auditoria`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Bitácora inmutable, filtros y exportación |
| **Resultado Esperado:** | Registro seguro y protegido contra alteraciones de todas las actividades del sistema, filtrado dinámico de eventos y descarga de bitácora en formatos estructurados (CSV y JSON). |
| **Precondición:** | Funcionario autenticado con rol Administrador en `/admin/auditoria`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Tipo de evento ("seguridad", "inactivar"), usuario responsable o rango de fechas |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Consultar historial cronológico de eventos | Lista organizada por fecha con usuario, acción realizada, nivel de importancia, dirección IP y detalle de cambios |
| **2.** Filtrar por tipo de evento, usuario o fechas | Tabla filtra dinámicamente los registros según los criterios aplicados sin recargar página |
| **3.** Exportar bitácora en formato CSV | Descarga archivo estructurado `.csv` correspondiente con la información filtrada |
| **4.** Exportar bitácora en formato JSON | Descarga archivo estructurado `.json` correspondiente con la información filtrada |

---

## MÓDULO 7: Versiones, Respaldos y Continuidad Operativa

### Escenario 11: Respaldos de Páginas y Restauración de Versiones (`/admin/respaldos`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta de versiones, previsualización y reversión |
| **Resultado Esperado:** | Visualización de versiones archivadas históricas, vista previa fidedigna antes de restaurar, reversión exitosa a producción y depuración selectiva. |
| **Precondición:** | Páginas con versiones archivadas previas generadas tras publicaciones en el portal. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Ámbito (Sitio Web / Intranet), editor responsable o fecha |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Consultar historial en `/admin/respaldos` y aplicar filtros (ámbito, editor, fechas) | Lista páginas con versiones anteriores archivadas disponibles para restaurar |
| **2.** Clic en ícono de Ojo ("Ver versión anterior") en una página | Abre ventana con información de la versión y enlace para ver cómo se veía la página |
| **3.** Clic en "Restaurar versión anterior" y confirmar | Valida que no esté en edición activa por otro usuario y restaura la versión a producción |
| **4.** Probar botón "Depurar" en la cabecera superior | Abre ventana para eliminar versiones antiguas que ya no se necesiten, conservando las versiones actuales |

---

## MÓDULO 8: Actualizaciones y Carga Masiva de Datos

### Escenario 12: Carga Masiva en Formato Excel (`/admin/actualizaciones`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Carga masiva de datos ocupacionales en formato Excel |
| **Resultado Esperado:** | Descarga de la plantilla oficial `.xlsx`, procesamiento por lotes con barra de progreso, confirmación con reporte de registros procesados y detección de inconsistencias fila por fila. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/actualizaciones`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Archivos de prueba:** Plantilla `.xlsx` diligenciada correctamente y archivo con celdas requeridas vacías o errores de tipo |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Descargar plantilla oficial `.xlsx` del sistema | Descarga archivo modelo estructurado con columnas y tipos de datos normalizados |
| **2.** Cargar archivo con registros válidos mediante arrastre o explorador | Valida el archivo, muestra barra de porcentaje de avance y notificación de éxito |
| **3.** Verificar resumen de procesamiento al finalizar carga válida | Muestra conteo exacto de registros procesados, creados, actualizados y omitidos |
| **4.** Cargar archivo con errores de estructura o tipos de datos incorrectos | Detiene el procesamiento y despliega reporte de errores fila por fila con el detalle de cada falla |
| **5.** Consultar historial de cargas masivas en la tabla inferior | Presenta registros históricos de importación con fecha, nombre de archivo y usuario responsable |

---

## MÓDULO 9: Cuenta Personal y Configuración

### Escenario 13: Mi Perfil y Configuración (`/admin/perfil`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta institucional y actualización de preguntas secretas |
| **Resultado Esperado:** | Consulta de datos de cuenta en modo solo lectura y actualización segura de preguntas secretas mediante confirmación obligatoria con clave vigente. |
| **Precondición:** | Usuario autenticado en el Panel Administrativo dentro de la ruta `/admin/perfil`. |
| **Datos de entrada** | **Usuario:** Funcionario autenticado (`admin@sena.edu.co` o `editor@sena.edu.co`)<br>**Contraseña:** Contraseña actual para confirmar la identidad del usuario<br>**Nuevas preguntas:** 3 preguntas seleccionadas del catálogo oficial y nuevas respuestas |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Consultar datos institucionales en "Mi Perfil" | Muestra nombre, correo, rol y fecha en modo solo lectura |
| **2.** Cambiar a pestaña "Configuración" | Permite seleccionar 3 nuevas preguntas y respuestas secretas |
| **3.** Confirmar con contraseña actual y guardar | Guarda las nuevas preguntas y muestra mensaje de éxito |

---

## MÓDULO 10: Composición Visual y Gestión Editorial — Editor Puck

### Escenario 14: Maquetación y Manipulación de Bloques en el Editor Visual (`/editor/[slug]`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Maquetación visual, inserción, reordenamiento y eliminación de bloques |
| **Resultado Esperado:** | Composición fluida de páginas mediante catálogo de componentes institucionales, edición de textos y propiedades, reordenamiento por arrastre y guardado en borrador. |
| **Precondición:** | Funcionario autenticado con rol Editor o Administrador sobre una página autorizada en modo edición (`/editor/[slug]`). |
| **Datos de entrada** | **Usuario:** `editor@sena.edu.co` (Rol Editor autorizado)<br>**Contraseña:** Contraseña definitiva activa<br>**Componentes:** Título institucional, párrafo, tarjeta de contenido, botón de enlace |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Abrir editor visual desde el botón flotante de lápiz | Abre la mesa de trabajo Puck con panel lateral de bloques, lienzo central y barra superior |
| **2.** Arrastrar nuevo componente desde el panel lateral al lienzo | Inserta el bloque seleccionado en la posición deseada dentro de la estructura visual |
| **3.** Modificar textos y propiedades del bloque en el panel de configuración | Refleja los cambios tipográficos, imágenes o enlaces en tiempo real en la vista previa del lienzo |
| **4.** Reordenar bloques en el lienzo mediante arrastre vertical | Desplaza la posición del bloque seleccionado hacia arriba o abajo sin alterar los demás elementos |
| **5.** Probar botones de Deshacer y Rehacer en la barra superior | Revierte la última acción ejecutada en el lienzo y permite restablecerla de forma inmediata |
| **6.** Eliminar un componente con el ícono de basurero | Remueve el bloque seleccionado de la estructura de la página |
| **7.** Guardar cambios mediante el botón "Guardar Borrador" | Almacena el progreso en estado borrador sin publicar modificaciones en el portal público |

---

### Escenario 15: Gestión de Cabecera (Header), Pie de Página (Footer) y Páginas Dinámicas

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Actualización de componentes globales y ciclo de páginas dinámicas |
| **Resultado Esperado:** | Modificación sincronizada de elementos transversales de marca (cabecera/pie), creación exitosa de páginas dinámicas y protección contra eliminación de páginas fijas del sistema. |
| **Precondición:** | Funcionario autenticado con rol Administrador con facultades sobre componentes globales y páginas dinámicas. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nueva página:** Título de página y dirección de enlace (*slug*) única |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Editar Cabecera institucional (Header) desde el editor visual | Actualiza menú de enlaces y elementos de cabecera reflejando los cambios en todo el portal |
| **2.** Editar Pie de página (Footer) desde el editor visual | Actualiza información de contacto, enlaces y avisos legales transversales en todas las páginas |
| **3.** Crear nueva página dinámica desde el menú flotante de edición | Solicita título y dirección web (*slug*), generando el nuevo lienzo en blanco para maquetación |
| **4.** Comprobar protección contra eliminación en páginas fijas (`/inicio`, `/monitoreo`) | El botón de eliminar página permanece deshabilitado o no visible para proteger la arquitectura del portal |
| **5.** Eliminar página dinámica creada sin dependencias activas | Despliega modal de confirmación y elimina definitivamente la página dinámica del sistema |

---

## MÓDULO 11: Portal Ciudadano, Búsquedas y Visualizadores Públicos

### Escenario 16: Buscador de Ocupaciones CNO / CUOC y Filtros Ocupacionales

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta ocupacional ciudadana, correlación CNO/CUOC y filtrado |
| **Resultado Esperado:** | Búsqueda predictiva ágil en el catálogo de ocupaciones, aplicación de filtros temáticos y despliegue completo de la ficha técnica ocupacional. |
| **Precondición:** | Usuario ciudadano o funcionario navegando en el Sitio Web Público en la sección del buscador ocupacional (`/ocupaciones`). |
| **Datos de entrada** | **Términos de búsqueda:** Palabras clave de ocupación (ej. "desarrollador", "enfermería")<br>**Filtros:** Área de desempeño o nivel de cualificación |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Escribir término de ocupación en la barra de búsqueda | Despliega lista predictiva de coincidencias en tiempo real con código CNO y denominación |
| **2.** Aplicar filtros por área ocupacional o nivel de cualificación | Filtra dinámicamente el listado de resultados sin recargar la página |
| **3.** Seleccionar una ocupación de la lista de resultados | Abre la ficha técnica completa con descripción de funciones, habilidades requeridas y correlación CUOC |
| **4.** Probar búsqueda con términos sin coincidencias | Presenta mensaje amigable de sin resultados con recomendaciones y botón para reiniciar filtros |

---

### Escenario 17: Visores de Documentos (PDF), Recursos Multimedia y Descarga Directa

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Visualización interactiva y descarga libre de publicaciones del OLO |
| **Resultado Esperado:** | Carga fluida de visores en pantalla de documentos normativos (PDF), reproducción de video institucional y descarga directa de boletines sin solicitud de registro. |
| **Precondición:** | Usuario navegando en el Sitio Web Público sobre páginas con publicaciones descargables o contenido multimedia. |
| **Datos de entrada** | Selección de documentos normativos en PDF, videos institucionales o boletines estadísticos |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Abrir un documento normativo o informe técnico en formato PDF | Despliega visor integrado interactivo en pantalla con controles de zoom, cambio de página y búsqueda |
| **2.** Presionar botón de descarga directa de documento o boletín | Descarga el archivo inmediatamente al computador o dispositivo sin solicitar inicio de sesión ni registro |
| **3.** Reproducir video o recurso interactivo embebido | Inicia la reproducción en el contenedor con controles accesibles de pausa, volumen y pantalla completa |

---

## MÓDULO 12: Entorno Privado Intranet y Analítica Estratégica

### Escenario 18: Tableros Analíticos en Power BI y Consulta Gerencial en la Intranet

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta gerencial de tableros de Power BI e indicadores estratégicos |
| **Resultado Esperado:** | Carga protegida de tableros analíticos en la Intranet, interacción fluida con segmentadores de datos, modo pantalla completa y preservación de la modalidad de solo lectura. |
| **Precondición:** | Funcionario autenticado con rol Director o Subdirector en la Intranet privada (`/inicio`). |
| **Datos de entrada** | **Usuario:** `directivo@sena.edu.co` (Rol Director o Subdirector)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Selección de vigencia anual, región o sector económico en el tablero |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Acceder a la página principal de la Intranet con rol directivo | Presenta la cabecera privada, navegación interna y contenedores de tableros analíticos |
| **2.** Cargar tablero de Power BI integrado | Renderiza el tablero interactivo con datos analíticos de empleabilidad sin requerir inicio de sesión adicional |
| **3.** Interactuar con segmentadores de fecha y región en el tablero | Actualiza dinámicamente las gráficas y tablas de indicadores según los filtros seleccionados |
| **4.** Activar botón de pantalla completa en el visor del tablero | Expande la visualización a monitor completo y retorna a la vista normal con tecla `Esc` o botón salir |
| **5.** Verificar entorno de solo lectura gerencial | Comprueba que la interfaz no muestre botones de edición ni accesos al Panel Administrativo |

---

## MÓDULO 13: Accesibilidad Universal e Instalación PWA

### Escenario 19: Accesibilidad Web y Navegación por Teclado (Resolución 1519 de 2020)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Navegación por teclado, contraste y compatibilidad con lectores de pantalla |
| **Resultado Esperado:** | Desplazamiento lógico y visible mediante teclado por todos los controles interactivos, contraste adecuado de color y etiquetado accesible de elementos visuales. |
| **Precondición:** | Portal cargado en Sitio Web Público o Intranet sin uso de mouse o dispositivos apuntadores. |
| **Datos de entrada** | **Navegación:** Teclas `Tab`, `Shift + Tab`, `Enter`, `Espacio` y flechas direccionales |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Recorrer la página secuencialmente con tecla Tabulador (`Tab`) | El foco de navegación avanza en orden lógico de lectura a través de enlaces, botones y formularios |
| **2.** Verificar indicador visual de foco en cada elemento enfocado | Despliega un contorno nítido y de alto contraste que resalta con claridad el elemento seleccionado |
| **3.** Activar botones y desplegar menús con tecla `Enter` o `Espacio` | Ejecuta las acciones correspondientes sin requerir interacción por mouse |
| **4.** Comprobar etiquetado accesible en imágenes y controles sin texto | Inspeccionar que imágenes cuenten con texto alternativo (`alt`) y botones iconográficos con etiqueta accesible (`aria-label`) |

---

### Escenario 20: Instalación y Funcionamiento como Aplicación Web Progresiva (PWA)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Instalación de la aplicación en escritorio/móvil y respuesta sin conexión |
| **Resultado Esperado:** | Detección del manifiesto web, instalación como aplicación independiente con icono institucional y despliegue de pantalla informativa ante desconexión de red. |
| **Precondición:** | Navegación en el Sitio Web Público o Intranet desde un navegador compatible (Chrome, Edge o Safari móvil). |
| **Datos de entrada** | Acción de instalación desde la barra de direcciones o el menú del navegador |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Localizar opción o aviso de instalación en el navegador | Muestra el icono de "Instalar aplicación" en la barra de direcciones o banner inferior en dispositivos móviles |
| **2.** Confirmar la instalación de la aplicación | Agrega el acceso directo en el escritorio o menú de aplicaciones con el logotipo oficial del OLO |
| **3.** Abrir la aplicación instalada desde el acceso directo | Ejecuta la plataforma en ventana independiente de aplicación sin barras de navegación del explorador |
| **4.** Probar navegación básica con interrupción de conectividad a internet | Presenta pantalla de cortesía institucional informando la ausencia de conexión a red sin que la aplicación se rompa |
