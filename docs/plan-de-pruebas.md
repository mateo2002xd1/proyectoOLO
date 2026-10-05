# Plan de Pruebas: Autenticación y Panel Administrativo
Guía interna y compacta de escenarios y pasos para verificación funcional del sistema OLO según el formato institucional de pruebas.

---

### Escenario 1: Proceso de Primer Ingreso (Sitio Web e Intranet)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-16 — Módulo de Autenticación / Caso de uso: Configuración obligatoria de cuenta en primer ingreso |
| **Resultado Esperado:** | Detección obligatoria de primer ingreso, validación de clave provisoria, registro de contraseña definitiva bajo política, configuración de 3 preguntas secretas y confirmación de acceso exitoso. |
| **Precondición:** | Cuenta creada por el Administrador con contraseña provisoria y flags `must_change_password` y `must_setup_security_questions` activos en base de datos. |
| **Datos de entrada** | **Usuario:** `funcionario.nuevo@sena.edu.co` (Roles: Administrador, Editor o Directivo)<br>**Contraseña:** Contraseña temporal provisoria asignada<br>**Nueva contraseña:** Clave con mín. 12 caracteres (mayúscula, minúscula, número y símbolo)<br>**Preguntas secretas:** 3 preguntas seleccionadas del catálogo y respuestas confidenciales |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Entrar a login de Sitio Web con clave temporal | Detecta primer ingreso y traslada forzosamente a pantalla de configuración (`/first-login`) | | |
| **2.** Entrar a login de Intranet con clave temporal | Detecta primer ingreso y traslada forzosamente a pantalla de configuración (`/first-login`) | | |
| **3.** Configurar nueva clave en Sitio Web | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas | | |
| **4.** Configurar 3 preguntas de seguridad en Sitio Web | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión | | |
| **5.** Configurar nueva clave en Intranet | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas | | |
| **6.** Configurar 3 preguntas de seguridad en Intranet | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión | | |

---

### Escenario 2: Validaciones de Acceso y Formulario de Login

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-16, RF-04 — Módulo de Autenticación / Caso de uso: Validación de entradas, credenciales y control de acceso |
| **Resultado Esperado:** | Intercepción inmediata de correos con formato inválido o no corporativo, credenciales erróneas, cuentas inactivas y perfiles sin permisos para el entorno solicitado. |
| **Precondición:** | Formularios de inicio de sesión cargados en Sitio Web (`/login`) o Intranet (`/login`). |
| **Datos de entrada** | **Usuario:** Correo vacío, correo con formato inválido, correo externo (`usuario@gmail.com`), cuenta suspendida (`status: inactive`), o cuenta sin permisos de portal<br>**Contraseña:** Contraseña vacía, clave incorrecta o credenciales no registradas |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Probar correo no permitido (vacío, sintaxis errónea o dominio no institucional) | Alertas en tiempo real: *"El correo es requerido"*, *"El correo no tiene un formato válido"* o *"Debe ser un correo institucional @sena.edu.co"* | | |
| **2.** Probar contraseña vacía y credenciales incorrectas | Resalta *"La contraseña es requerida"* o alerta general *"Correo o contraseña incorrectos"* sin filtrar datos confidenciales | | |
| **3.** Probar acceso con cuenta inactiva o suspendida | Bloquea la autenticación inmediatamente y muestra la alerta: *"Cuenta inactiva o suspendida"* | | |
| **4.** Probar acceso a Sitio Web con rol sin permisos (Directivo / Subdirector) | Autentica pero detiene el acceso con alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."* | | |
| **5.** Probar acceso a Intranet con rol sin autorización interna | Bloquea la entrada al entorno privado con alerta: *"No tienes permisos para ingresar a la intranet."* | | |

---

### Escenario 3: Restablecimiento de Contraseña desde el Portal de Login (Sitio Web e Intranet)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-16 — Módulo de Autenticación / Caso de uso: Restablecimiento autónomo por preguntas de seguridad |
| **Resultado Esperado:** | Restablecimiento exitoso y autónomo de la clave personal mediante verificación de las 3 preguntas secretas, sincronizando de inmediato el acceso en ambos portales. |
| **Precondición:** | Funcionario con cuenta activa y sus 3 preguntas de seguridad previamente configuradas en el primer ingreso. |
| **Datos de entrada** | **Usuario:** `funcionario@sena.edu.co` (cuenta activa con preguntas registradas)<br>**Contraseña:** Contraseña actual olvidada / no requerida durante el restablecimiento<br>**Respuestas secretas:** Respuestas confidenciales coincidentes con las registradas<br>**Nueva contraseña:** Clave con mín. 12 caracteres (mayúscula, minúscula, número y símbolo) |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Clic en "¿Olvidaste tu contraseña?" en login de Sitio Web o Intranet | Traslada a pantalla `/recovery` solicitando correo institucional | | |
| **2.** Ingresar correo institucional `@sena.edu.co` y dar Continuar | Valida sintaxis, comprueba preguntas configuradas y navega a `/security-questions` | | |
| **3.** Responder secuencialmente las 3 preguntas de seguridad | Valida respuestas confidenciales en servidor sin depender de correo externo y traslada a `/reset-password` | | |
| **4.** Definir nueva contraseña cumpliendo requisitos y confirmar | Valida política de seguridad (12 caracteres, símbolos, etc.) y coincidencia exacta | | |
| **5.** Confirmar cambio y retornar al login | Muestra `/reset-success` y botón para volver a `/login` con la nueva clave activa en ambos portales | | |

---

### Escenario 4: Cierre de Sesión y Control de Inactividad

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-16 — Módulo de Sesión y Seguridad / Caso de uso: Cierre de sesión seguro y temporizador de inactividad |
| **Resultado Esperado:** | Destrucción de tokens de sesión tras logout, bloqueo de historial de navegación e interrupción preventiva al minuto 14 con expiración automática al minuto 15 de inactividad. |
| **Precondición:** | Sesión activa iniciada en el Sitio Web Público, la Intranet o el Panel Administrativo. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` o `editor@sena.edu.co` (cuenta con sesión abierta)<br>**Contraseña:** Contraseña activa de la sesión<br>**Tiempos:** 14 minutos sin eventos (advertencia) / 15 minutos (cierre forzoso) |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Cerrar sesión en Sitio Web, Intranet y Panel Admin | Destruye tokens de sesión y redirige a pantallas de login | | |
| **2.** Probar botón "Atrás" del navegador tras cerrar sesión | Bloquea visualización privada en caché y redirige forzosamente a login | | |
| **3.** Dejar sesión inactiva (14 min) y probar "Seguir conectado" | Modal "¿Sigues ahí?" renueva token y continúa sesión tras clic en "Seguir trabajando" | | |
| **4.** Dejar expirar contador de 60s sin interacción | Cierra sesión automáticamente y muestra alerta de expiración en login | | |

---

### Escenario 5: Entorno Visual, Navegación y Buscador Interno

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-01, RF-14 — Módulo de Interfaz y Panel / Caso de uso: Navegación modular, adaptabilidad móvil y búsqueda |
| **Resultado Esperado:** | Navegación lateral estructurada, adaptabilidad fluida a vista móvil (doble barra), alternancia de modo claro/oscuro, centro de notificaciones y búsqueda a pantalla completa. |
| **Precondición:** | Funcionario autenticado con rol `Administrador` (permiso `acceso.panel`) dentro de `/admin`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Términos de búsqueda:** "usuarios", "roles", "auditoria", "respaldos" |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Hacer clic en "Accesos" en el menú lateral | Despliega y contrae las opciones de "Usuarios" y "Roles y Permisos" | | |
| **2.** Probar vista móvil en pantalla reducida (< 1024px) | Oculta sidebar; habilita barra inferior fija (Accesos, Revisión, Dashboard, Auditoría, Más) y barra superior de acciones | | |
| **3.** Alternar interruptor de tema Claro / Oscuro | Conmuta instantáneamente la paleta visual del panel (`#0b1121` en oscuro) desde el sidebar o barra superior móvil | | |
| **4.** Abrir campana de notificaciones (Sidebar / Barra superior) | Despliega modal `ModalAlertas` con avisos de cuentas por vencer y páginas en revisión, permitiendo descartar o navegar | | |
| **5.** Abrir buscador interno a pantalla completa (`BuscadorModal`) | Despliega capa modal interactiva, filtra módulos en tiempo real por palabras o sinónimos y navega con Enter o clic | | |
| **6.** Desplegar menú de usuario en el pie del menú lateral | Muestra nombre y correo del funcionario con accesos directos a "Mi perfil", "Configuración" y "Cerrar sesión" | | |

---

### Escenario 6: Tablero de Control (Dashboard)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-01, RF-07 — Módulo de Administración / Caso de uso: Consulta de métricas clave y accesos rápidos |
| **Resultado Esperado:** | Carga consolidada y actualizada de indicadores de gestión (usuarios, páginas publicadas, borradores pendientes) y navegación directa desde tarjetas operativas. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/dashboard`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Ingresar a `/admin/dashboard` y revisar métricas | Muestra cifras actualizadas de usuarios, páginas publicadas, borradores pendientes y gráficos de actividad | | |
| **2.** Probar accesos rápidos en las tarjetas | Redirige de forma directa a cada submódulo administrativo correspondiente | | |

---

### Escenario 7: Gestión de Usuarios (`/admin/users`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-04, RF-16 — Módulo de Accesos / Caso de uso: Alta, edición, suspensión y restablecimiento de credenciales |
| **Resultado Esperado:** | Registro exitoso de usuarios con emisión de contraseña temporal, modificación de perfiles, bloqueo preventivo por suspensión y forzado de clave restablecida. |
| **Precondición:** | Funcionario autenticado con rol Administrador en el submódulo `/admin/users`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo usuario:** Nombre completo, correo `@sena.edu.co`, rol asignado y caducidad opcional |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Crear nuevo usuario con nombre, correo y rol | Modal emite correo y contraseña temporal provisoria generada de un solo uso con opción de copiado | | |
| **2.** Editar usuario existente con ícono de Lápiz | Permite actualizar nombre y rol asignado con confirmación en tabla y base de datos | | |
| **3.** Suspender usuario con interruptor de estado | Cuenta cambia a Inactiva, revoca tokens activos y bloquea su inicio de sesión | | |
| **4.** Reactivar usuario con interruptor de estado | Cuenta vuelve a Activa y funcionario puede reanudar inicios de sesión en el portal | | |
| **5.** Restablecer credenciales de usuario por Administrador | Activar casilla "Restablecer contraseña"; modal genera nueva clave temporal de un solo uso y fuerza reconfiguración | | |

---

### Escenario 8: Gestión de Roles y Permisos (`/admin/roles`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-04, RF-05 — Módulo de Accesos / Caso de uso: Matriz de permisos RBAC y protección de perfiles |
| **Resultado Esperado:** | Creación de roles derivados configurables, bloqueo de edición/borrado sobre roles base del sistema y restricción de eliminación ante dependencias de usuarios activas. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/roles`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo rol:** Nombre de rol hijo (ej. "Editor Regional"), descripción y selección granular de permisos |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Crear nuevo rol derivado con matriz de permisos | Registra nuevo rol hijo configurable en la tabla con permisos asignados | | |
| **2.** Comprobar protección de roles base (Admin / Editor) | Botón de eliminar deshabilitado o no visible (roles base inmutables protegidos por arquitectura) | | |
| **3.** Intentar eliminar rol derivado con usuarios asignados | Alerta roja bloquea la acción por dependencias activas e instruye reasignar usuarios previamente | | |
| **4.** Reasignar usuarios y eliminar rol huérfano | Permite confirmación y elimina definitivamente el rol derivado del sistema | | |

---

### Escenario 9: Páginas en Revisión y Control de Permisos de Edición (`/admin/revision` y `/editor`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-01, RF-05, RF-06 — Ciclo Editorial y Permisos Granulares / Caso de uso: Control de edición y aprobación editorial |
| **Resultado Esperado:** | Cumplimiento estricto de permisos de edición por página (visibilidad del botón flotante y redirección por URL), envío a revisión, previsualización fidedigna y aprobación/rechazo motivado. |
| **Precondición:** | Páginas creadas en el CMS y cuentas configuradas: Editor con permiso en página A, Editor sin permiso en página B, y Administrador aprobador. |
| **Datos de entrada** | **Usuario:** `editor.tendencias@sena.edu.co` (Rol Editor con permiso `editar.sitio.tendencias`) / `editor.limitado@sena.edu.co` (Rol Editor sin permiso sobre `/monitoreo`) / `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Claves definitivas activas de cada perfil |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Editor con permisos asignados edita página autorizada | Botón flotante de edición visible en la esquina inferior; al pulsar abre editor Puck (`/editor/tendencias`) | | |
| **2.** Editor intenta editar página SIN permisos asignados | Botón flotante de edición permanece completamente oculto en la interfaz pública | | |
| **3.** Editor intenta forzar acceso por URL a página no autorizada | Servidor valida permisos granulares, bloquea la carga del editor y redirige a la ruta pública (`/monitoreo`) | | |
| **4.** Usuario sin autenticación intenta ingresar a editor | Intercepta acceso no autenticado y realiza redirección 307 al login con parámetro de retorno (`?redirect=...`) | | |
| **5.** Enviar modificaciones de página a revisión | Rol Editor en editor Puck realiza cambios y envía a revisión; borrador entra en cola y suma contador | | |
| **6.** Administrador previsualiza borrador con ícono de Ojo | Abre vista previa fidedigna del diseño propuesto en visor Puck | | |
| **7.** Administrador aprueba borrador pendiente | Publica inmediatamente la página en el portal público y limpia la cola de revisión | | |
| **8.** Administrador rechaza borrador con justificación | Devuelve el borrador al editor con motivo obligatorio registrado para corrección | | |
| **9.** Descartar borrador con ícono de basurero | Elimina borrador de raíz y depura recursos multimedia huérfanos asociados | | |

---

### Escenario 10: Auditoría y Bitácora (`/admin/auditoria`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-07 — Módulo de Trazabilidad y Seguridad / Caso de uso: Bitácora inmutable, filtros y exportación |
| **Resultado Esperado:** | Registro fidedigno e inmutable de eventos de seguridad y gobernanza, filtrado dinámico de eventos y descarga de bitácora en formatos estructurados. |
| **Precondición:** | Funcionario autenticado con rol Administrador en `/admin/auditoria`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Tipo de evento ("seguridad", "inactivar"), usuario responsable o rango de fechas |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Consultar historial cronológico de eventos | Registros inmutables con fecha, usuario, acción, severidad, IP y resumen de cambios | | |
| **2.** Filtrar por tipo de evento, usuario o fechas | Tabla filtra dinámicamente los registros según los criterios aplicados sin recargar página | | |
| **3.** Exportar bitácora en formato CSV y JSON | Descarga archivos estructurados correspondientes con la información filtrada | | |

---

### Escenario 11: Respaldos de Páginas y Restauración de Versiones (`/admin/respaldos`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-17 — Módulo de Versiones y Recuperación / Caso de uso: Consulta de versiones, previsualización y reversión |
| **Resultado Esperado:** | Visualización de versiones archivadas históricas, vista previa fidedigna antes de restaurar, reversión exitosa a producción y depuración selectiva. |
| **Precondición:** | Páginas con versiones archivadas previas generadas tras publicaciones en el portal. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Ámbito (Sitio Web / Intranet), editor responsable o fecha |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Consultar historial en `/admin/respaldos` y aplicar filtros (ámbito, editor, fechas) | Lista páginas con versiones anteriores archivadas disponibles para restaurar | | |
| **2.** Clic en ícono de Ojo ("Ver versión anterior") en una página | Despliega modal de respaldo con metadatos y enlace a vista previa en visor Puck | | |
| **3.** Clic en "Restaurar versión anterior" y confirmar | Valida que no esté en edición activa por otro usuario y restaura la versión a producción | | |
| **4.** Probar botón "Depurar" en la cabecera superior | Abre modal de depuración para limpiar versiones históricas obsoletas manteniendo integridad | | |

---

### Escenario 12: Carga Masiva en Excel (`/admin/actualizaciones`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-02, RF-09 — Módulo de Actualizaciones / Caso de uso: Carga masiva de datos en formato Excel |
| **Resultado Esperado:** | Descarga de la plantilla oficial `.xlsx`, importación exitosa de lotes válidos con barra de progreso y reporte exacto de inconsistencias fila por fila. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin/actualizaciones`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Archivos de prueba:** Plantilla `.xlsx` diligenciada correctamente y archivo `.xlsx` con errores de formato provocados |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Descargar plantilla oficial `.xlsx` del sistema | Descarga archivo modelo con columnas y formatos establecidos | | |
| **2.** Cargar archivo con datos válidos y procesar | Muestra barra de progreso y alerta verde de éxito con registros procesados | | |
| **3.** Cargar archivo con errores de formato | Reporta filas erróneas y detalle del problema fila por fila | | |

---

### Escenario 13: Mi Perfil y Configuración (`/admin/mi-perfil`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | RF-16 — Módulo de Cuenta Personal / Caso de uso: Consulta institucional y actualización de preguntas secretas |
| **Resultado Esperado:** | Consulta de datos de cuenta en modo solo lectura y actualización segura de preguntas secretas mediante confirmación obligatoria con clave vigente. |
| **Precondición:** | Usuario autenticado en el Panel Administrativo dentro de la ruta `/admin/mi-perfil`. |
| **Datos de entrada** | **Usuario:** Funcionario autenticado (`admin@sena.edu.co` o `editor@sena.edu.co`)<br>**Contraseña:** Contraseña actual vigente para reautenticación<br>**Nuevas preguntas:** 3 preguntas seleccionadas del catálogo oficial y nuevas respuestas |

| Descripción de pasos a realizar | Resultado obtenido | Prueba Exitosa (S/N) | Observaciones |
| :--- | :--- | :---: | :--- |
| **1.** Consultar datos institucionales en "Mi Perfil" | Muestra nombre, correo, rol y fecha en modo solo lectura | | |
| **2.** Cambiar a pestaña "Configuración" | Permite seleccionar 3 nuevas preguntas y respuestas secretas | | |
| **3.** Confirmar con contraseña actual y guardar | Actualiza preguntas en base de datos con confirmación de éxito | | |
