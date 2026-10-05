# Plan de Pruebas: Autenticación y Panel Administrativo
Guía interna y compacta de escenarios y pasos para verificación funcional del sistema OLO.

---

## 1. Módulos de Autenticación y Sesión (Sitio Web e Intranet)

### Escenario 1: Proceso de Primer Ingreso (Sitio Web e Intranet)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Entrar a login de Sitio Web con clave temporal | Detecta primer ingreso y traslada a pantalla de configuración | [ ] | |
| **2** | Entrar a login de Intranet con clave temporal | Detecta primer ingreso y traslada a pantalla de configuración | [ ] | |
| **3** | Configurar nueva clave en Sitio Web | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas | [ ] | |
| **4** | Configurar 3 preguntas de seguridad en Sitio Web | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión | [ ] | |
| **5** | Configurar nueva clave en Intranet | Valida requisitos de política en tiempo real y traslada a pantalla de preguntas | [ ] | |
| **6** | Configurar 3 preguntas de seguridad en Intranet | Guarda respuestas, presenta confirmación exitosa y botón para iniciar sesión | [ ] | |

---

### Escenario 2: Validaciones de Acceso y Formulario de Login
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Probar correo no permitido (vacío, sintaxis errónea o dominio no institucional) | Alertas en tiempo real: *"El correo es requerido"*, *"El correo no tiene un formato válido"* o *"Debe ser un correo institucional @sena.edu.co"* | [ ] | |
| **2** | Probar contraseña vacía y credenciales incorrectas | Resalta *"La contraseña es requerida"* o alerta general *"Correo o contraseña incorrectos"* sin filtrar datos confidenciales | [ ] | |
| **3** | Probar acceso con cuenta suspendida o sin permisos del entorno | Bloquea ingreso de cuenta inactiva o muestra alerta (*"Tu cuenta no tiene permisos..."* / *"No tienes permisos para ingresar a la intranet"*) | [ ] | |

---

### Escenario 3: Restablecimiento de Contraseña desde el Portal de Login (Sitio Web e Intranet)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Clic en "¿Olvidaste tu contraseña?" en login de Sitio Web o Intranet | Traslada a pantalla `/recovery` solicitando correo institucional | [ ] | |
| **2** | Ingresar correo institucional `@sena.edu.co` y dar Continuar | Valida sintaxis, comprueba preguntas configuradas y navega a `/security-questions` | [ ] | |
| **3** | Responder secuencialmente las 3 preguntas de seguridad | Valida respuestas confidenciales en servidor y traslada a `/reset-password` | [ ] | |
| **4** | Definir nueva contraseña cumpliendo requisitos y confirmar | Valida política de seguridad (12 caracteres, símbolos, etc.) y coincidencia | [ ] | |
| **5** | Confirmar cambio y retornar al login | Muestra `/reset-success` y botón para volver a `/login` con la nueva clave activa | [ ] | |

---

### Escenario 4: Cierre de Sesión y Control de Inactividad
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Cerrar sesión en Sitio Web, Intranet y Panel Admin | Destruye tokens de sesión y redirige a pantallas de login | [ ] | |
| **2** | Probar botón "Atrás" del navegador tras cerrar sesión | Bloquea visualización privada y redirige a login | [ ] | |
| **3** | Dejar sesión inactiva (14 min) y probar "Seguir conectado" | Modal "¿Sigues ahí?" renueva token y continúa sesión | [ ] | |
| **4** | Dejar expirar contador de 60s sin interacción | Cierra sesión automáticamente y muestra alerta en login | [ ] | |

---

## 2. Panel Administrativo (`/admin`)

### Escenario 5: Entorno Visual, Navegación y Buscador Interno
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Navegar por menú lateral desplegando acordeones | Despliega y contrae submenús ("Accesos", "Páginas") | [ ] | |
| **2** | Probar vista móvil en pantalla reducida | Despliega menú hamburguesa y drawer lateral funcional | [ ] | |
| **3** | Alternar interruptor de tema Claro / Oscuro | Cambia la paleta visual instantáneamente en todo el panel | [ ] | |
| **4** | Abrir campana de notificaciones en cabecera | Despliega modal flotante de alertas recientes | [ ] | |
| **5** | Digitar módulos en el buscador y dar clic | Lista resultados en tiempo real y navega directo al módulo | [ ] | |

---

### Escenario 6: Tablero de Control (Dashboard)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Ingresar a `/admin/dashboard` y revisar métricas | Muestra cifras actualizadas de usuarios, páginas y borradores | [ ] | |
| **2** | Probar accesos rápidos en las tarjetas | Redirige de forma directa a cada submódulo administrativo | [ ] | |

---

### Escenario 7: Gestión de Usuarios (`/admin/users`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Crear nuevo usuario con nombre, correo y rol | Modal emite correo y **contraseña temporal** generada | [ ] | |
| **2** | Editar usuario existente con ícono de Lápiz | Permite actualizar datos o rol asignado | [ ] | |
| **3** | Suspender usuario con interruptor de estado | Cuenta cambia a Inactiva y se bloquea su inicio de sesión | [ ] | |
| **4** | Reactivar usuario con interruptor de estado | Cuenta vuelve a Activa y funcionario puede iniciar sesión | [ ] | |

---

### Escenario 8: Gestión de Roles y Permisos (`/admin/roles`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Crear nuevo rol derivado con matriz de permisos | Registra nuevo rol hijo configurable en la tabla | [ ] | |
| **2** | Comprobar protección de roles base (Admin/Editor) | Botón de eliminar deshabilitado o no visible | [ ] | |
| **3** | Intentar eliminar rol con usuarios asignados | Alerta roja bloquea la acción por dependencias activas | [ ] | |
| **4** | Reasignar usuarios y eliminar rol huérfano | Permite confirmación y elimina definitivamente el rol | [ ] | |

---

### Escenario 9: Páginas en Revisión (`/admin/revision`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Previsualizar borrador con ícono de Ojo | Abre vista previa exacta del diseño propuesto | [ ] | |
| **2** | Aprobar borrador pendiente | Publica inmediatamente la página en el portal público | [ ] | |
| **3** | Rechazar borrador con justificación | Devuelve el borrador al editor con motivo obligatorio | [ ] | |
| **4** | Descartar borrador con ícono de basurero | Elimina borrador de raíz y depura archivos huérfanos | [ ] | |

---

### Escenario 10: Auditoría y Bitácora (`/admin/auditoria`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Consultar historial cronológico de eventos | Registros inmutables con fecha, usuario, acción e IP | [ ] | |
| **2** | Filtrar por tipo de evento, usuario o fechas | Tabla filtra los registros según los criterios aplicados | [ ] | |
| **3** | Exportar bitácora en formato CSV y JSON | Descarga archivos estructurados correspondientes | [ ] | |

---

### Escenario 11: Respaldos de Páginas y Restauración de Versiones (`/admin/respaldos`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Consultar historial en `/admin/respaldos` y aplicar filtros (ámbito, editor, fechas) | Lista páginas con versiones anteriores archivadas disponibles para restaurar | [ ] | |
| **2** | Clic en ícono de Ojo ("Ver versión anterior") en una página | Despliega modal de respaldo con metadatos y enlace a vista previa en visor Puck | [ ] | |
| **3** | Clic en "Restaurar versión anterior" y confirmar | Valida que no esté en edición activa por otro usuario y restaura la versión a producción | [ ] | |
| **4** | Probar botón "Depurar" en la cabecera superior | Abre modal de depuración para limpiar versiones históricas obsoletas | [ ] | |

---

### Escenario 12: Carga Masiva en Excel (`/admin/actualizaciones`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Descargar plantilla oficial `.xlsx` del sistema | Descarga archivo modelo con columnas establecidas | [ ] | |
| **2** | Cargar archivo con datos válidos y procesar | Muestra barra de progreso y alerta verde de éxito | [ ] | |
| **3** | Cargar archivo con errores de formato | Reporta filas erróneas y detalle del problema fila por fila | [ ] | |

---

### Escenario 13: Mi Perfil y Configuración (`/admin/mi-perfil`)
| Paso | Descripción del Paso | Resultado Esperado | Estado | Observaciones |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Consultar datos institucionales en "Mi Perfil" | Muestra nombre, correo, rol y fecha en modo solo lectura | [ ] | |
| **2** | Cambiar a pestaña "Configuración" | Permite seleccionar 3 nuevas preguntas y respuestas | [ ] | |
| **3** | Confirmar con contraseña actual y guardar | Actualiza preguntas con confirmación de éxito | [ ] | |
