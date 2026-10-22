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
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin-panel/dashboard`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Ingresar a `/admin-panel/dashboard` y revisar métricas | Muestra cifras actualizadas de usuarios, páginas publicadas, borradores pendientes y gráficos de actividad |
| **2.** Probar accesos rápidos en las tarjetas | Redirige de forma directa a cada submódulo administrativo correspondiente |

---

## MÓDULO 4: Control de Accesos y Gobierno de Usuarios — RBAC

### Escenario 7: Gestión de Usuarios (`/admin-panel/users`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Alta, edición, suspensión y restablecimiento de credenciales |
| **Resultado Esperado:** | Registro exitoso de usuarios con emisión de contraseña temporal, modificación de perfiles, bloqueo preventivo por suspensión y forzado de clave restablecida. |
| **Precondición:** | Funcionario autenticado con rol Administrador en el submódulo `/admin-panel/users`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo usuario:** Nombre completo, correo `@sena.edu.co`, rol asignado y caducidad opcional |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Crear nuevo usuario con nombre, correo y rol | Modal emite correo y contraseña temporal provisoria generada de un solo uso con opción de copiado |
| **2.** Editar usuario existente con ícono de Lápiz | Permite actualizar nombre y rol asignado con confirmación en tabla y base de datos |
| **3.** Suspender usuario con interruptor de estado | Cuenta cambia a Inactiva, cierra las sesiones abiertas y bloquea su inicio de sesión |
| **4.** Reactivar usuario con interruptor de estado | Cuenta vuelve a Activa y funcionario puede reanudar inicios de sesión en el portal |
| **5.** Restablecer credenciales de usuario por Administrador | Activar casilla "Restablecer contraseña"; modal genera nueva clave temporal de un solo uso y fuerza reconfiguración |

---

### Escenario 8: Gestión de Roles y Permisos (`/admin-panel/roles-and-permissions`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Matriz de permisos por roles y protección de perfiles |
| **Resultado Esperado:** | Creación de nuevos roles configurables, protección para evitar editar o borrar los roles base del sistema y bloqueo de eliminación si el rol aún tiene usuarios asignados. |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin-panel/roles-and-permissions`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Datos nuevo rol:** Nombre del nuevo rol (ej. "Editor Regional"), descripción y selección de permisos asignados |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Crear nuevo rol personalizado con permisos | Registra el nuevo rol en la tabla con los permisos asignados |
| **2.** Comprobar protección de roles base (Admin / Editor) | Botón de eliminar deshabilitado o no visible (los roles principales están protegidos por el sistema para evitar su eliminación) |
| **3.** Intentar eliminar rol con usuarios asignados | Alerta roja bloquea la acción porque aún hay usuarios con ese rol e indica reasignarlos primero |
| **4.** Reasignar usuarios vinculados a otro rol en `/admin-panel/users` | Desvincula los usuarios del rol personalizado dejándolo con 0 usuarios asignados |
| **5.** Eliminar rol personalizado ya sin usuarios | Permite confirmación y elimina definitivamente el nuevo rol del sistema |

---

## MÓDULO 5: Gobernanza Editorial y Ciclo de Publicación

### Escenario 9: Páginas en Revisión y Control de Permisos de Edición (`/admin-panel/review-section` y `/editor`)

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

### Escenario 10: Auditoría, Bitácora y Trazabilidad Forense (`/admin-panel/changelog-view`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Bitácora inmutable, filtros combinados por categoría y acción, paginación, modal forense y depuración con respaldo en CSV |
| **Resultado Esperado:** | Registro inalterable de todos los eventos del sistema, filtrado dinámico por categoría (*Todas*, *Contenido editorial*, *Administración*, *Seguridad*), fechas con bloqueo cruzado (*Desde* / *Hasta*), usuario y acción contextual; paginación configurable; vista adaptada en móviles (acordeón explicativo); modal de detalle con metadatos técnicos y comparativo antes/después; y protocolo de depuración con regla de conservación de 365 días y descarga obligatoria de respaldo en CSV (`respaldo-auditoria-depurada-[FECHA].csv`). |
| **Precondición:** | Funcionario autenticado con rol Administrador en la ruta `/admin-panel/changelog-view`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Categoría, selectores de fecha (*Desde* / *Hasta*), Usuario responsable, Acción contextual<br>**Paginador:** Selección de filas por página (15, 25, 50, 100) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Consultar historial cronológico de eventos en `/admin-panel/changelog-view` | Despliega tabla de 5 columnas con Fecha/hora (con segundos abajo), Usuario (o *"Sin usuario"* atenuado), etiqueta de Acción con código cromático, Cambios (resumen con tooltip) y botón de Detalle |
| **2.** Filtrar por Categoría (*Contenido editorial*, *Administración*, *Seguridad*) | La tabla actualiza los registros y adapta dinámicamente las opciones del selector de Acción según la categoría elegida |
| **3.** Validar selectores de fecha con calendario (*Desde* / *Hasta*) | Bloquea automáticamente en *Desde* fechas posteriores a *Hasta*, y en *Hasta* fechas anteriores a *Desde* |
| **4.** Probar botón "Limpiar filtros" | Se hace visible al activar cualquier filtro y restablece los selectores a sus valores predeterminados con un solo clic |
| **5.** Ajustar paginador y filas por pantalla | Alterna entre páginas de registros y permite cambiar el número de filas mostradas (15, 25, 50 o 100 registros) recalculando el total |
| **6.** Consultar registros en pantalla móvil o tableta (< 1024px) | La tabla se adapta en formato acordeón resumiendo el evento en lenguaje natural (*«El usuario [Nombre] hizo la acción de...»*); al pulsar sobre una fila, expone la fecha exacta y el botón "Ver detalle" |
| **7.** Abrir modal de detalle forense con el botón de ojo | Despliega ventana emergente con metadatos de red (fecha y hora con segundos, usuario, acción, entidad, ID de entidad, dirección IP, navegador y sistema operativo) y el cuadro comparativo de campos modificados (Antes vs Después) |
| **8.** Abrir modal "Depurar" desde la cabecera y comprobar regla de conservación | Evalúa la base de datos protegiendo de forma inmutable todos los registros del último año (365 días continuos), calculando la cantidad de registros candidatos a depurar y el peso en disco |
| **9.** Comprobar bloqueo de depuración y descargar respaldo en CSV | El botón de confirmación permanece inactivo hasta pulsar el botón circular de descarga; genera el archivo oficial `respaldo-auditoria-depurada-[FECHA].csv` y habilita el botón de confirmación de depuración |
| **10.** Confirmar depuración definitiva | Elimina los registros respaldados, muestra resumen con cantidad de eventos depurados y espacio liberado, y asienta automáticamente la depuración como un nuevo registro en la bitácora de auditoría |

---

## MÓDULO 7: Versiones, Respaldos y Continuidad Operativa

### Escenario 11: Respaldos de Páginas y Restauración de Versiones (`/admin-panel/backup-section`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta de versiones anteriores, previsualización fidedigna en pestaña nueva, restauración protegida y depuración selectiva |
| **Resultado Esperado:** | Identificación automática de páginas con versiones previas retiradas de publicación, filtros con bloqueo cruzado de fechas, vista previa independiente, restauración segura con prevención de concurrencia y depuración selectiva con regla de respaldo protegido y cierre automático. |
| **Precondición:** | Páginas con versiones archivadas previas generadas tras publicaciones en el portal público o la Intranet. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Filtros:** Ámbito (*Todos*, *Sitio web*, *Intranet*), Autor, Publicado por, Fechas (*Publicado desde* / *Publicado hasta*) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Consultar listado de respaldos en `/admin-panel/backup-section` y aplicar filtros | Lista únicamente las páginas con versiones previas retiradas de publicación; en escritorio muestra 6 columnas (Página con ámbito arriba y ruta · versión abajo, Autor, Publicado por, Editado el con hora, Publicado el con hora, y botón "Ver versión") |
| **2.** Probar bloqueo cruzado de fechas en filtros y botón "Limpiar filtros" | El calendario interactivo impide rangos incoherentes y el botón dinámico restablece los filtros activos con un toque |
| **3.** Consultar adaptabilidad en dispositivos móviles | La tabla se transforma en acordeón interactivo (*«[Nombre] publicó la versión [N] de [Página]...»*) desplegando fechas exactas y botón "Ver versión [N]" |
| **4.** Pulsar botón de ojo ("Ver versión") en una página | Abre ventana modal detallando la versión archivada, ruta, número de versión previa, fecha y hora exacta de reemplazo, autor y funcionario que aprobó |
| **5.** Probar botón "Ver vista previa" en el modal | Abre la página archivada en una nueva pestaña del navegador para navegar e inspeccionar su diseño fidedigno previo (bloques, textos e imágenes) |
| **6.** Ejecutar "Restaurar versión" en página sin edición activa | Valida ausencia de candado de edición, abre modal de confirmación advirtiendo que la previa se publicará y la actual pasará a respaldo, publica de inmediato y asienta el evento en auditoría |
| **7.** Intentar restaurar versión en página con edición activa por otro usuario | El sistema detecta la sesión concurrente, bloquea el proceso y despliega el modal *«Página en uso»* informando qué editor la tiene abierta |
| **8.** Abrir modal "Depurar versiones antiguas" desde la cabecera | Muestra aviso de *«Respaldo siempre protegido»*, filtros por ámbito y página, y panel de impacto en vivo con total encontradas, páginas afectadas y espacio estimado en MB a liberar |
| **9.** Confirmar depuración selectiva en dos pasos | Valida que ninguna página esté en edición activa, solicita confirmación en diálogo de advertencia, elimina las versiones históricas que exceden la política, y despliega la pantalla *«¡Depuración completada!»* con cierre automático |

---

## MÓDULO 8: Actualizaciones y Carga Masiva de Datos

### Escenario 12: Ingesta de "Programa + Sobresalientes" y "Alertas de Inversión" (`/admin-panel/update-section`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Carga masiva de programas destacados, gestión de alertas de inversión masivas/manuales y actualización de sectores CIIU |
| **Resultado Esperado:** | Descarga de plantillas oficiales `.xlsx`, barra de progreso con etapas de procesamiento, actualización directa en portal sin borrado de datos preexistentes, registro manual de proyectos vía ventana modal, actualización de actividades económicas CIIU y gestión en tablas de proyectos e historial. |
| **Precondición:** | Funcionario autenticado en `/admin-panel/update-section`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Archivos:** `formato-programas-sobresalientes.xlsx`, `formato-alertas-inversion.xlsx`, `formato-actualizar-ciiu.xlsx`<br>**Formulario manual:** Título, entidad promotora, sector económico, monto de inversión, vigencia y descripción |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Desplegar acordeón "Programa + Sobresalientes" y descargar formato | Descarga archivo oficial `.xlsx` estructurado con columnas y tipos de datos normalizados |
| **2.** Cargar archivo `.xlsx` de programas sobresalientes | Muestra barra de progreso indicando porcentaje y fase (*«Leyendo el archivo»* < 60% y *«Guardando en la base de datos»* >= 60%), publicando directamente en el portal al alcanzar el 100% |
| **3.** Consultar y gestionar historial de cargas de programas | Lista las cargas con fecha, nombre de archivo, registros procesados y estado (*Completado*, *Procesando*, *Error*), permitiendo eliminar una carga para revertirla |
| **4.** Desplegar acordeón "Alertas de inversión" y descargar formatos oficiales | Descarga `formato-alertas-inversion.xlsx` y `formato-actualizar-ciiu.xlsx` |
| **5.** Cargar archivo masivo de alertas de inversión | Muestra barra interactiva de avance y actualiza automáticamente el listado de proyectos registrados de forma acumulativa |
| **6.** Probar botón "Agregar manualmente" en Alertas de inversión | Abre ventana modal con formulario completo; permite registrar un proyecto individual digitando título, entidad, sector, monto, vigencia y descripción sin requerir archivo Excel |
| **7.** Probar botón "Actualizar sectores CIIU" | Permite cargar la actualización de la tabla maestra de actividades económicas mediante archivo Excel |
| **8.** Gestionar tabla de proyectos registrados | Permite consultar las iniciativas vigentes, eliminar un proyecto individual o limpiar el listado completo mediante diálogo de confirmación |

---

### Escenario 13: Matriz de Percentiles y Ciclo de Publicación de Tendencia Ocupacional (`/admin-panel/update-section`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Carga de percentiles por año/periodo, regla de celda libre, validación en 4 fases y ciclo de publicación de borradores |
| **Resultado Esperado:** | Autodetección de año y periodo por nombre de archivo, bloqueo de sobreescritura si la celda está ocupada, barra de avance en 4 fases, retención inicial en estado Borrador («Sin publicar») y publicación controlada hacia el sitio web público. |
| **Precondición:** | Funcionario autenticado en `/admin-panel/update-section` con el acordeón "Criterios de clasificación de resultados" abierto. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Archivos:** Archivo `.xlsx` con hojas obligatorias *«percentiles nacional»* y *«percentiles departamental»* (ej. `percentiles_2025_T1.xlsx`)<br>**Selectores:** Año y Periodo |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Descargar formato oficial de Tendencia Ocupacional | Descarga plantilla `.xlsx` obligatoria conteniendo las hojas predefinidas *«percentiles nacional»* y *«percentiles departamental»* |
| **2.** Seleccionar archivo con año y periodo en el nombre (ej. `percentiles_2025_T1.xlsx`) | El sistema identifica automáticamente el nombre y precompleta los selectores de Año y Periodo |
| **3.** Intentar cargar en un año y periodo que ya cuenta con datos cargados | Activa la advertencia de celda ocupada y bloquea el botón "Cargar", indicando eliminar la carga previa en el historial si se desea reemplazar |
| **4.** Ejecutar carga en celda libre con validación en 4 fases | Barra de progreso interactiva avanza por 4 fases: *«Leyendo el archivo»* (0% - 39%), *«Preparando las filas»* (40% - 59%), *«Validando (V1–V9)»* (60% - 84%) y *«Guardando en la base de datos»* (85% - 100%) |
| **5.** Verificar estado inicial tras carga exitosa | Los percentiles quedan almacenados en estado **Borrador («Sin publicar»)** con resumen de filas procesadas y botón de reporte de validaciones; la información aún no se muestra en el portal público |
| **6.** Publicar corte desde "Pendientes de publicar" o desde el historial | Pulsar botón "Publicar" (o "Publicar todos"); el estado cambia a **Publicado** y los percentiles se proyectan inmediatamente en los bloques de Tendencia Ocupacional del sitio web |
| **7.** Despublicar corte desde la tabla de historial | Vuelve el corte a estado **Borrador** retirándolo de la vista de los usuarios del portal |
| **8.** Eliminar corte desde el historial para liberar la celda | Retira los percentiles y habilita nuevamente la combinación de año y periodo para una futura carga |

---

## MÓDULO 9: Gestión de Cuenta y Configuración del Panel

### Escenario 14: Gestión de Cuenta y Cambio Voluntario de Contraseña (`/admin-panel/users`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Actualización de datos de identidad y cambio voluntario de contraseña en la propia cuenta |
| **Resultado Esperado:** | Apertura de ventana de edición desde la propia fila del usuario en Usuarios, actualización de datos personales, despliegue de sección «Cambiar contraseña» sin exigencia de clave anterior, validación en tiempo real de condiciones de seguridad y registro del evento en la bitácora de auditoría. |
| **Precondición:** | Funcionario autenticado con rol Administrador en el submódulo `/admin-panel/users`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co`<br>**Nueva contraseña:** Clave con mín. 8 caracteres, mayúsculas, minúsculas, números o símbolos, sin emojis<br>**Confirmación:** Clave coincidente |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Localizar la propia cuenta en la tabla de usuarios | La fila del usuario autenticado se visualiza en la tabla con sus datos de nombre, correo, rol y estado |
| **2.** Hacer clic en el botón con ícono de lápiz («Editar usuario») | Abre la ventana modal «Editar usuario» mostrando los datos de la cuenta y, de forma exclusiva para la propia cuenta, la sección desplegable **«Cambiar contraseña»** |
| **3.** Modificar datos de nombre, apellidos o vigencia de la cuenta | Permite editar directamente los campos de texto y la fecha de caducidad |
| **4.** Desplegar la sección «Cambiar contraseña» | Al presionar sobre el encabezado, se revelan los campos «Contraseña nueva» y «Repetir contraseña nueva» junto con la lista interactiva de requisitos de seguridad |
| **5.** Probar botón de visibilidad de contraseña | El botón con ícono de ojo conmuta la visualización de los caracteres entre texto visible y oculto en ambos campos |
| **6.** Probar digitación de clave sin cumplir requisitos de seguridad | La lista interactiva mantiene advertencias sobre las condiciones insatisfechas y el sistema no permite guardar |
| **7.** Probar discrepancia entre la nueva contraseña y su confirmación | Al ingresar textos diferentes y pulsar «Guardar», el sistema interrumpe el guardado, mantiene la sección abierta y resalta el aviso *«Las contraseñas no coinciden»* |
| **8.** Probar contraseña repetida | Al ingresar una clave igual a la actual o recientemente utilizada y pulsar «Guardar», el sistema muestra el aviso de advertencia y no aplica modificaciones parciales a los datos del funcionario |
| **9.** Confirmar nueva contraseña válida y presionar «Guardar» | Guarda simultáneamente la nueva contraseña y los cambios de datos de la cuenta, cierra la ventana modal y registra el evento en la bitácora de auditoría |
| **10.** Probar edición de datos personales con campos de contraseña vacíos | Dejar ambos campos de contraseña en blanco y pulsar «Guardar»; el sistema actualiza los datos personales conservando la contraseña activa sin alteraciones |

---

### Escenario 15: Configuración de Identidad Visual, Colores y Sonido (`/admin-panel/configuration`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Carga de logotipo/ícono, modo oscuro, contraste accesible y sonido de avisos |
| **Resultado Esperado:** | Carga de logo e ícono PNG por clic o arrastre directo con guardado inmediato, previsualizaciones en tema claro y oscuro, ajuste para modo oscuro, personalización de colores con validador accesible y control de sonido de notificaciones en el navegador. |
| **Precondición:** | Funcionario autenticado en la ruta `/admin-panel/configuration`. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Archivos:** Imagen PNG horizontal (hasta 1 MB) para logotipo y PNG cuadrado (hasta 512 KB, mín. 64x64 px) para favicon<br>**Colores:** Selección de colores para fondo y letra de etiquetas y botones |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Acceder a "Configuración" en escritorio y dispositivo móvil | En computador desde el menú de usuario en la base de la barra lateral; en móvil pulsando «Más» en la barra inferior |
| **2.** Cargar logotipo de barra lateral mediante clic o arrastre directo | Sube y guarda automáticamente el archivo PNG (hasta 1 MB), actualizando en vivo las previsualizaciones en tema claro y oscuro |
| **3.** Cargar ícono de pestaña (Favicon) cuadrado | Actualiza el ícono en la pestaña del navegador y en la barra superior móvil |
| **4.** Probar botón "Volver al de fábrica" en logo e ícono | Restablece los distintivos gráficos predeterminados originales del sistema |
| **5.** Alternar interruptor "Pasar a blanco en modo oscuro" | Aplica ajuste de alto contraste a gráficos oscuros con fondo transparente al pasar a tema oscuro para preservar su legibilidad |
| **6.** Personalizar colores en acordeones de etiquetas y botones | Acordeones interactivos (*«En el panel»* / *«En el editor»* para etiquetas, y *«En las pantallas»* / *«En los modales»* para botones) permiten seleccionar combinaciones de fondo y texto con muestra previa en vivo |
| **7.** Evaluar validador de contraste accesible en tiempo real | Si el contraste cumple el estándar mínimo marca *«Se lee bien»*; si no lo alcanza, emite advertencia de *«Poco contraste»* y ofrece opciones asistidas para corregirlo con un toque |
| **8.** Guardar colores o probar botones "Descartar cambios" y "Volver a los de fábrica" | Confirma los nuevos colores en el panel o revierte a los valores guardados / originales de fábrica |
| **9.** Alternar interruptor de "Sonido de los avisos" y probar botones de muestra | Activa o silencia el aviso sonoro de notificaciones guardado localmente en el navegador y reproduce las muestras sonoras de *Éxito*, *Advertencia* y *Error* |

---

## MÓDULO 10: Composición Visual y Gestión Editorial — Editor Visual

### Escenario 16: Maquetación, Bloques y Flujo de Revisión en el Editor Visual (`/editor/[slug]` o `/edit/[slug]`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Despliegue de opciones flotantes, maquetación de bloques temáticos, accesibilidad, autoguardado y envío con comentario |
| **Resultado Esperado:** | Despliegue fluido del menú flotante con sus 5 acciones (*Editar página*, *Menú y pie*, *Nueva página*, *Editar dirección*, *Eliminar página* y *Salir del modo edición*), arrastre y configuración de bloques (incluyendo Buscador de Ocupaciones, Resultados de Ocupaciones, Alertas de Inversión, Video Embebido con fondo decorativo y Dato OLO de la Semana), autoguardado periódico, comprobación de accesibilidad y envío a revisión con comentario obligatorio. |
| **Precondición:** | Usuario autenticado navegando en una página con modo edición habilitado (en Sitio Web o Intranet). |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` o `editor@sena.edu.co`<br>**Contraseña:** Contraseña definitiva activa<br>**Bloques:** Tarjetas, columnas, títulos, Buscador de Ocupaciones, Resultados de Ocupaciones, Alertas de Inversión, Video Embebido, Dato OLO de la Semana<br>**Comentario de revisión:** Texto explicativo de cambios (entre 10 y 100 caracteres) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Hacer clic en el botón circular flotante de lápiz | El botón rota a una cruz (**X**) y despliega el menú de acciones (*Editar página*, *Menú y pie*, *Nueva página*, *Editar dirección*, *Eliminar página*, *Salir del modo edición*) |
| **2.** Seleccionar "Editar página" | Abre el Editor Visual con panel lateral de bloques, lienzo central de trabajo, panel de opciones y barra superior con ruta (`/{slug}`) |
| **3.** Arrastrar nuevo bloque desde el catálogo al lienzo central | Inserta el componente en la posición seleccionada reorganizando fluidamente los demás bloques |
| **4.** Probar bloque «Buscador de Ocupaciones» | Inserta el bloque en la página y permite personalizar el texto orientativo de ayuda en el panel lateral; despliega la barra interactiva de consulta de clasificaciones CNO y CUOC y evalúa el interruptor general Activo / Apagado |
| **5.** Probar bloque «Resultados de Ocupaciones» | Permite estructurar la página de destino de resultados sin barra duplicada, mostrando la lista de coincidencias según el parámetro `?buscar=…` y la ficha técnica de la ocupación |
| **6.** Probar bloque «Alertas de Inversión» | Inserta el bloque en el lienzo, permite configurar título y descripción en el panel de opciones y presenta de forma automática los filtros temáticos y la lista de iniciativas de inversión |
| **7.** Probar bloque «Video Embebido» con fondo decorativo | Permite ingresar el enlace de YouTube, seleccionar una imagen decorativa de fondo, regular el control de transparencia de 0% a 100% y seleccionar la modalidad de fondo (pantalla completa o repetición en mosaico), garantizando que los textos y el reproductor permanezcan completamente legibles |
| **8.** Probar bloque «Dato OLO de la Semana» | Permite configurar infografías destacadas con imágenes de fondo independientes y transiciones fluidas al alternar entre contenidos |
| **9.** Reordenar bloques con la agarradera y eliminar con ícono de papelera | Desplaza verticalmente el bloque seleccionado o lo retira inmediatamente del lienzo |
| **10.** Probar botones de Deshacer y Rehacer en la barra superior | Revierte y reaplica modificaciones durante la sesión activa sin alterar el borrador guardado en el servidor |
| **11.** Verificar autoguardado y botón de guardado manual | La barra superior exhibe avisos informativos (*«Guardando…»*, *«Sin guardar»*, *«Guardado a las [hora]»*) y permite guardar manualmente mediante el botón correspondiente |
| **12.** Intentar enviar a revisión con una imagen sin texto alternativo descriptivo | El sistema efectúa una comprobación automática de accesibilidad obligatoria, bloquea el envío y despliega alerta exigiendo la descripción para personas con discapacidad visual |
| **13.** Pulsar "Enviar a revisión" con accesibilidad aprobada | Abre ventana modal exigiendo comentario de cambios obligatorio (10 a 100 caracteres); al confirmar, remite la página a la bandeja de revisión y libera la edición |
| **14.** Probar botón "Salir sin publicar" (ícono de detención) | Advierte sobre cambios pendientes sin guardar y libera la reserva de edición de la página |
| **15.** Probar opción "Salir de modo edición" desde el menú flotante público | Despliega ventana modal de confirmación y, al aceptar, cierra la sesión local del editor y recarga la página para visualizarla exactamente como un visitante ciudadano |

---

### Escenario 17: Gestión Global de «Menú y pie», Creación y Eliminación Segura de Páginas Dinámicas

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Edición de cabecera/pie global con URLs dinámicas, creación de páginas y procedimiento seguro de eliminación guiada |
| **Resultado Esperado:** | Propagación universal de cabecera y pie, asignación jerárquica de URLs por desplegables y páginas internas, creación de página con ruta en tiempo real, bloqueo de eliminación ante enlaces activos con guía paso a paso en 4 puntos (bloque, panel lateral, campo y revisión), y confirmación por digitación idéntica del título en ambos entornos (Sitio Web e Intranet). |
| **Precondición:** | Usuario autenticado con facultades editoriales en el portal público o en la intranet. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa<br>**Nueva página:** Nombre de la página (*«Bolsa de empleo»*)<br>**Eliminación:** Nombre exacto de la página a retirar |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Seleccionar "Menú y pie" en el menú flotante de edición | Abre el Editor Visual enfocado en los componentes globales de cabecera y pie de página |
| **2.** Modificar enlaces o textos en cabecera/pie, guardar borrador y enviar a revisión | Tras su aprobación, las modificaciones se propagan de manera uniforme e inmediata a todas las páginas de la aplicación correspondiente |
| **3.** Probar asignación de rutas jerárquicas dinámicas bajo menú desplegable | Al ubicar una página hija dentro de un ítem desplegable en «Menú y pie», su dirección canónica pública adopta automáticamente el prefijo `/{desplegable}/{pagina}`, redirigiendo de forma canónica si el usuario escribe la URL plana |
| **4.** Probar configuración de «Páginas dentro de esta página» (`internas`) | Al editar las propiedades de una página en la cabecera, añadir una página interna subordinada (ej. `/resultado`); su ruta se construye en triple tramo (`/{desplegable}/{padre}/{interna}`) sin saturar visualmente el menú principal |
| **5.** Seleccionar "Nueva página" en el botón flotante | Despliega ventana modal solicitando *«¿Cómo se llama?»*; genera la ruta (`/{slug}`) automáticamente en tiempo real a partir del nombre digitado |
| **6.** Pulsar "Crear y editar" en el modal de nueva página | Crea la página vacía en estado de borrador y redirige de inmediato a su lienzo en el Editor Visual |
| **7.** Intentar eliminar página que tiene enlaces entrantes activos (en menú, pie o dentro de páginas) | El sistema analiza en tiempo real todo el portal, bloquea el borrado con aviso de advertencia (*«Página en uso en la navegación»* o *«Página en uso en el portal»*) y despliega la **guía paso a paso en 4 puntos** con los nombres exactos del editor: 1. Ir a la sección o página; 2. Localizar el bloque (ej. «Pie de página») y abrir el campo en el panel derecho (ej. «Enlaces inferiores · fila 3»); 3. Eliminar o reasignar el enlace exacto; 4. Pulsar «Enviar a revisión» |
| **8.** Desvincular enlaces dependientes, publicar la actualización y volver a seleccionar "Eliminar página" | El análisis confirma 0 dependencias y habilita la ventana de confirmación con el resumen de ruta y el conteo de versiones a borrar |
| **9.** Digitar idénticamente el título de la página en la casilla de confirmación | Escribir el nombre exacto en *«Escribe «[Nombre]» para confirmar»* para desbloquear el botón de confirmación "Eliminar" |
| **10.** Confirmar eliminación definitiva | Retira la página y sus versiones, redirige automáticamente a `/inicio` y registra el evento en la bitácora de auditoría tanto en el Sitio Web como en la Intranet |

---

### Escenario 18: Cambio de Dirección de Páginas Web y Actualización Atómica de Enlaces (Botón «Editar dirección»)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Modificación controlada del slug/ruta de una página, validación anti-rebote en vivo, bloqueo ante candados de edición, consentimiento de actualización de hipervínculos y reescritura atómica en Sitio Web e Intranet |
| **Resultado Esperado:** | Despliegue de la opción «Editar dirección» en el botón flotante (ícono de cadena) para usuarios con rol Administrador o roles autorizados con el permiso `secciones.cambiar-direccion`; validación asíncrona de nueva ruta; bloqueo preventivo en páginas protegidas del sistema; detección y bloqueo por candados de edición concurrente; tarjeta amarilla detallando ubicaciones exactas (bloque y campo) de enlaces entrantes; botón dinámico de consentimiento («Actualizar enlaces y cambiar»); reescritura atómica en base de datos de enlaces vigentes y archivados; actualización de clave de permiso `editar.{ambito}.{slug}`; redirección canónica y registro inmutable en auditoría. |
| **Precondición:** | Funcionario autenticado con rol Administrador o rol con permiso `secciones.cambiar-direccion` activo, posicionado sobre una página dinámica no protegida. |
| **Datos de entrada** | **Usuario:** `admin@sena.edu.co`<br>**Contraseña:** Contraseña definitiva activa<br>**Página origen:** Página existente (ej. `/bolsa-empleo`)<br>**Nueva dirección:** Texto normalizado (ej. `empleo-nacional-2025`) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Comprobar disponibilidad de la opción en el menú flotante | En páginas dinámicas se despliega el botón circular con ícono de eslabón de cadena (`.fab-speed-dial__btn--direccion`) entre *Nueva página* y *Eliminar página*; en la portada (`/inicio`) el botón no se ofrece |
| **2.** Abrir «Editar dirección» en página protegida del sistema (`inicio`, `menu-y-pie`, secciones de fábrica de sitio o intranet como `tasa`, `matriz`, `encuestas-*`) | La ventana modal despliega la tarjeta de advertencia *«Dirección del sistema: La dirección /[slug] la usa el sistema y no se puede cambiar.»* presentando como única acción el botón **«Entendido»** |
| **3.** Abrir «Editar dirección» en página dinámica y consultar estado inicial | El diálogo consulta asíncronamente a la API el uso de la dirección y los candados de edición vigentes; muestra la dirección actual en etiqueta `code` y enfoca el campo «Nueva dirección» |
| **4.** Escribir nueva dirección y comprobar validación en tiempo real (espera de 350 ms) | Al teclear, el sistema normaliza en minúsculas y guiones; si la ruta es inválida, tiene menos de 2 caracteres, coincide con la actual o está ocupada por otra página, despliega tarjeta de error roja con el motivo exacto y deshabilita el botón de confirmación |
| **5.** Probar intento de cambio mientras otro funcionario edita la página o una página que la enlaza | El sistema detecta el candado de edición concurrente activo (`enEdicion`) y despliega tarjeta de error: *«No se puede cambiar ahora: [Página] ([Usuario]) tiene abierto el editor. Espera a que lo cierre e inténtalo de nuevo.»* impidiendo el guardado |
| **6.** Escribir dirección válida en página que tiene enlaces entrantes en el portal | El diálogo detecta las referencias activas (`referencias`) y despliega la tarjeta amarilla de aviso: *«La dirección actual está en uso: Hay [N] enlaces a /[slug] en [M] páginas. Al continuar se actualizan a /[nueva]»*, detallando la lista con bloque, campo del editor y textos visibles |
| **7.** Verificar botón de consentimiento dinámico | Al haber enlaces dependientes, el botón de confirmación adopta estilo de aviso (`nueva-seccion-boton--aviso`) con borde amarillo (#b48a00) y texto **«Actualizar enlaces y cambiar»**; los dos botones del diálogo son simétricos |
| **8.** Escribir dirección válida en página libre de enlaces | Despliega tarjeta verde de confirmación: *«Dirección disponible: /[nueva] está libre y ningún enlace del portal apunta a /[slug].»*, y el botón principal adopta estilo estándar azul con el texto **«Cambiar dirección»** |
| **9.** Confirmar el cambio de dirección | El sistema ejecuta la transacción atómica: renombra la página, actualiza en bloque el contenido JSON de las versiones afectadas (reescribiendo enlaces a la nueva ruta), renombra la clave de permiso de edición sin revocar accesos a los editores asignados, registra el evento en la bitácora de auditoría y redirige el navegador a la nueva URL canónica (`router.push`) |
| **10.** Comprobar funcionamiento en ambos entornos (Sitio Web e Intranet) | Ejecutar el procedimiento tanto en el Sitio Web Público como en la Intranet privada, verificando que la API backend acepte ambos ámbitos (`AMBITOS_HABILITADOS`) y redirija a las rutas canónicas correspondientes (`rutaPublicaDeSlug` en intranet) |

---

## MÓDULO 11: Portal Ciudadano, Búsquedas y Visualizadores Públicos

### Escenario 19: Buscador Global del Portal y Catálogo Ocupacional CNO / CUOC (`/clasificacion`)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Búsqueda global en cabecera con página de resultados configurada, consulta ocupacional CNO y CUOC por código o palabra clave y ficha técnica con correlativas cruzadas |
| **Resultado Esperado:** | Despliegue fluido del buscador en cabecera con navegación por teclado, redirección a la página de resultados configurada en «Menú y pie» (`?buscar=…`), validación de código numérico (4 dígitos CNO / 5 dígitos CUOC), despliegue de ficha ocupacional a pantalla completa con funciones y correlativas cruzadas CNO ↔ CUOC, y opciones de descarga oficial. |
| **Precondición:** | Usuario ciudadano o funcionario navegando en el Sitio Web Público. |
| **Datos de entrada** | **Términos de búsqueda:** Palabras clave en cabecera o catálogo ocupacional (ej. "sistemas", "enfermería")<br>**Códigos ocupacionales:** Códigos numéricos de 4 dígitos (CNO) o 5 dígitos (CUOC) |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Utilizar el buscador global desplegable en la cabecera del portal | Hacer clic sobre el ícono de lupa; el campo de búsqueda se despliega fluidamente hacia la izquierda; digitar términos y presionar Enter; el sistema redirige automáticamente a la página de resultados asignada en la cabecera (`?buscar=…`) |
| **2.** Acceder a la sección de clasificación ocupacional (`/clasificacion` o ruta asignada en el menú) | Despliega la interfaz oficial de consulta ocupacional con acceso a los catálogos CNO y CUOC |
| **3.** Consultar por código numérico oficial (4 dígitos para CNO o 5 dígitos para CUOC) | Valida la estructura del código y despliega inmediatamente la ocupación correspondiente sin peticiones innecesarias |
| **4.** Consultar por denominaciones o palabras clave | Muestra el listado de ocupaciones coincidentes con su denominación oficial y código de clasificación |
| **5.** Abrir la ficha técnica detallada de una ocupación | Despliega la ventana a pantalla completa con descripción de funciones, conocimientos, habilidades y la tabla de equivalencias correlativas cruzadas CNO ↔ CUOC |
| **6.** Probar respuesta ante código inválido o sin coincidencias | Presenta mensaje de orientación amigable indicando verificar el código o término de búsqueda |
| **7.** Descargar o exportar información oficial | Permite generar y descargar la ficha técnica completa en el computador o dispositivo móvil |

---

### Escenario 20: Visores de Documentos (PDF), Recursos Multimedia y Descarga Directa

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Visualización interactiva y descarga libre de publicaciones del OLO |
| **Resultado Esperado:** | Carga fluida de visor integrado de documentos PDF con navegación y modo inmersivo, reproducción accesible de contenidos audiovisuales y descarga directa de boletines sin solicitud de registro. |
| **Precondición:** | Usuario navegando en el Sitio Web Público sobre páginas con publicaciones descargables o contenido multimedia. |
| **Datos de entrada** | Selección de documentos normativos en PDF, videos informativos o boletines estadísticos |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Abrir un documento normativo, informe técnico o boletín en formato PDF | Despliega visor integrado interactivo en pantalla con controles de cambio de página, zoom y modo de lectura inmersiva |
| **2.** Presionar botón estandarizado de "Descargar Documento" o descarga directa | Descarga el archivo de inmediato al dispositivo local sin solicitar inicio de sesión ni registro previo |
| **3.** Reproducir video o recurso audiovisual embebido | Inicia la reproducción en el contenedor con controles accesibles de reproducción/pausa, barra de progreso, volumen y pantalla completa |
| **4.** Comprobar adaptabilidad en pantallas móviles y tabletas | El visor de PDF y el reproductor de video escalan correctamente a los anchos de pantalla táctil preservando los controles accesibles |

---

## MÓDULO 12: Entorno Privado Intranet y Analítica Estratégica

### Escenario 21: Tableros Analíticos en Power BI y Gestión Editorial Paritaria en la Intranet

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Consulta gerencial de tableros de Power BI e indicadores estratégicos, y validación de herramientas editoriales paritarias en el entorno privado |
| **Resultado Esperado:** | Carga protegida de tableros analíticos en la Intranet, interacción fluida con segmentadores de datos, modo pantalla completa; para usuarios directivos, preservación de la modalidad de solo lectura; para usuarios editores, disponibilidad completa del botón flotante (`PaginasFabSpeedDial`) con soporte para *Editar página*, *Menú y pie*, *Nueva página*, *Editar dirección* y *Eliminar página* con la misma paridad del Sitio Web. |
| **Precondición:** | Funcionario autenticado en la Intranet privada (`/inicio`). |
| **Datos de entrada** | **Usuario directivo:** `directivo@sena.edu.co` (Rol Director o Subdirector)<br>**Usuario editor:** `admin@sena.edu.co` (Rol Administrador)<br>**Contraseña:** Contraseña definitiva activa |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Acceder a la página principal de la Intranet con rol directivo | Presenta la cabecera privada, navegación interna y contenedores de tableros analíticos en modo de solo lectura (sin botón flotante) |
| **2.** Cargar tablero de Power BI integrado | Muestra el componente integrado con indicadores analíticos de empleabilidad sin requerir inicio de sesión adicional |
| **3.** Interactuar con segmentadores de periodo, región y sector en el tablero | Actualiza dinámicamente las gráficas y tablas de indicadores en tiempo real sin recargar la página |
| **4.** Activar botón de pantalla completa en el visor del tablero | Expande la visualización a monitor completo y retorna a la vista normal con botón de salir o tecla Escape |
| **5.** Acceder a la Intranet con cuenta de Administrador o Editor | La interfaz despliega en la esquina inferior el botón flotante de edición (`PaginasFabSpeedDial`), ofreciendo las opciones correspondientes a sus permisos |
| **6.** Probar herramientas editoriales en la Intranet | Permite ingresar a maquetar páginas (`/edit/[slug]`), editar la envoltura global (`/edit/menu-y-pie`), crear nuevas secciones privadas, cambiar la dirección de páginas dinámicas con «Editar dirección» y ejecutar el retiro seguro con «Eliminar página» |

---

## MÓDULO 13: Accesibilidad Universal e Instalación PWA

### Escenario 22: Accesibilidad Web y Navegación por Teclado (Resolución 1519 de 2020)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Navegación por teclado, contraste y compatibilidad con lectores de pantalla |
| **Resultado Esperado:** | Desplazamiento lógico y visible mediante teclado por todos los controles interactivos, contraste adecuado de color (mínimo 4,5:1) y etiquetado accesible de elementos visuales. |
| **Precondición:** | Portal cargado en Sitio Web Público o Intranet sin uso de mouse o dispositivos apuntadores. |
| **Datos de entrada** | **Navegación:** Teclas `Tab`, `Shift + Tab`, `Enter`, `Espacio` y flechas direccionales |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Recorrer la página secuencialmente con tecla Tabulador (`Tab`) y reversa con (`Shift + Tab`) | El foco de navegación avanza en orden lógico de lectura a través de enlaces, botones y formularios |
| **2.** Verificar indicador visual de foco en cada elemento enfocado | Despliega un contorno nítido y de alto contraste que resalta con claridad el elemento seleccionado |
| **3.** Activar botones y desplegar menús con tecla `Enter` o `Espacio` | Ejecuta las acciones correspondientes sin requerir interacción por mouse |
| **4.** Comprobar etiquetado accesible en imágenes y controles sin texto | Inspeccionar que las imágenes cuenten con texto alternativo (`alt`) descriptivo y los botones iconográficos con etiqueta accesible (`aria-label`) |
| **5.** Verificar estructura semántica de encabezados y compatibilidad con lector de pantalla | Cuenta con un único encabezado principal `<h1>` por página y jerarquía coherente de `<h2>` y `<h3>` para síntesis de voz |
| **6.** Comprobar contraste accesible en modo claro y modo oscuro | Garantiza que los textos y fondos cumplan con la relación mínima de 4,5:1 establecida en WCAG 2.1 nivel AA |

---

### Escenario 23: Instalación y Funcionamiento como Aplicación Web Progresiva (PWA)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Instalación de la aplicación en escritorio y dispositivos móviles (Android / iOS) y respuesta sin conexión |
| **Resultado Esperado:** | Detección del manifiesto web, instalación como aplicación independiente con icono oficial en escritorio y móviles, ejecución sin barras de navegador y despliegue de pantalla informativa ante desconexión de red. |
| **Precondición:** | Navegación en el Sitio Web Público o Intranet desde un navegador compatible (Chrome, Edge o Safari). |
| **Datos de entrada** | Acción de instalación desde barra de direcciones, menú del navegador o botón compartir |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Probar instalación en computador de escritorio (Chrome / Edge) | Hacer clic en el ícono de instalación en la barra de direcciones o menú del navegador, pulsar "Instalar" en el diálogo modal y verificar acceso directo en escritorio |
| **2.** Probar instalación en dispositivo móvil Android (Chrome) | Pulsar sobre la notificación inferior "Añadir a pantalla de inicio" o desde el menú de tres puntos, confirmar el nombre y pulsar "Añadir" |
| **3.** Probar instalación en dispositivo móvil iOS (Safari) | Presionar el botón de compartir (recuadro con flecha hacia arriba) en la barra inferior, seleccionar "Agregar a pantalla de inicio" y pulsar "Agregar" |
| **4.** Abrir la aplicación instalada desde el acceso directo | Ejecuta la plataforma en ventana independiente de aplicación con logotipo del OLO, sin barras de navegación del explorador |
| **5.** Probar navegación con interrupción de conectividad a internet | Presenta pantalla de cortesía informando la ausencia de conexión a red sin que la aplicación se rompa ni pierda consistencia visual |

---

### Escenario 24: Panel de Preferencias de Accesibilidad e Inclusión Ciudadana (Sitio Web Público)

| **RESULTADO PRUEBA FUNCIONAL Y/O TÉCNICA** | |
| :--- | :--- |
| **Escenario:** | Verificación funcional del Panel de Accesibilidad («Personaliza tu experiencia»), controles de inclusión, persistencia y botón «Subir» |
| **Resultado Esperado:** | Despliegue interactivo desde la pestaña lateral flotante, ajuste dinámico de los 8 controles principales (lector de pantalla, tamaño de texto en 4 niveles, alto contraste, saturación en 4 niveles, pausar animación, fuente dislexia, interlineado e interletrado), selector de daltonismo (protanopía, deuteranopía, tritanopía), opciones avanzadas con interruptores, restablecimiento a valores base, conservación de preferencias en el navegador y retorno al inicio con el botón flotante «Subir». |
| **Precondición:** | Portal público cargado en el navegador (`/` o cualquier página pública) sin requerir inicio de sesión. |
| **Datos de entrada** | **Interacción:** Clic en pestaña flotante lateral de accesibilidad o tecla `Enter`/`Espacio`, pulsación de tarjetas de ajuste, alternancia de interruptores, botón "Restablecer configuración" y desplazamiento vertical |

| Descripción de pasos a realizar | Resultado obtenido |
| :--- | :--- |
| **1.** Desplegar el panel desde la pestaña lateral flotante con ratón y teclado | Abre el panel lateral manteniendo la página visible detrás, traslada el foco automáticamente a la cabecera del panel y permite cerrar con tecla `Escape`, botón de cierre o clic exterior |
| **2.** Probar botón "Lector de pantalla" | Activa la síntesis de voz del navegador emitiendo confirmación hablada; si el navegador no lo soporta, muestra la tarjeta inhabilitada con mensaje explicativo |
| **3.** Probar tarjeta "Tamaño del texto" (AA) en sus 4 niveles | Cicla sucesivamente entre Normal (1 barra), Grande (2 barras), Más grande (3 barras) y Máximo (4 barras), escalando las fuentes tipográficas en vivo sin romper la maquetación |
| **4.** Activar "Alto contraste" | Invierte la interfaz con esquema de máxima luminosidad y contraste para facilitar la lectura |
| **5.** Probar tarjeta "Saturación" en sus 4 niveles | Cicla entre Normal (0 barras), Baja (1 barra), Alta (2 barras) y Sin color / Monocromático (3 barras), alterando la intensidad de color de imágenes y bloques |
| **6.** Activar "Pausar animación" | Detiene instantáneamente las animaciones y el desplazamiento automático de carruseles de imágenes y cintas de publicaciones |
| **7.** Activar "Fuente dislexia" | Sustituye la fuente institucional por una tipografía adaptada en todos los títulos y textos de la página |
| **8.** Probar niveles de "Interlineado" e "Interletrado" | Incrementa el espaciado vertical entre renglones y la separación horizontal entre caracteres según el nivel seleccionado |
| **9.** Activar interruptor de "Daltonismo" y probar opciones | Despliega los botones de selección para Protanopía, Deuteranopía y Tritanopía, aplicando el filtro visual correspondiente en todo el portal; al apagar el interruptor, repliega la sección |
| **10.** Probar interruptores de "Opciones avanzadas" | Resalta títulos con contorno, resalta enlaces con subrayado, convierte textos a negrita, activa regla de guía de lectura que sigue el cursor y agranda el puntero del ratón |
| **11.** Probar botón "Restablecer configuración" | Revierte inmediatamente todos los cambios visuales y auditivos a los valores predeterminados originales |
| **12.** Verificar persistencia en el navegador | Recargar la página (`F5`) o navegar a otra sección pública y comprobar que las preferencias seleccionadas se mantienen activas automáticamente sin parpadeos |
| **13.** Probar botón flotante «Subir» | Al desplazarse hacia abajo en la página, se despliega el botón flotante en la esquina inferior; al pulsarlo, desplaza suavemente la pantalla hacia el inicio de la página |

