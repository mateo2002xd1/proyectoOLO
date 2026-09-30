# MANUAL DE USUARIO DEL SISTEMA
## Observatorio Laboral y Ocupacional (OLO) — SENA

---

*Nota de estilo: Las capturas de pantalla integradas deben tener un tamaño pequeño o mediano (optimizadas) para mantener el manual intuitivo sin saturar el documento.*

## 5. Público objetivo

El manual de usuario está dirigido a los diferentes perfiles que interactúan con la plataforma del Observatorio Laboral y Ocupacional (OLO):

### 5.1. Directores y Subdirectores
Personal directivo institucional del SENA que inicia sesión con cuenta corporativa `@sena.edu.co` para consultar en modalidad de solo lectura tableros gerenciales de Power BI, matrices de pertinencia e indicadores de inserción laboral en la Intranet.

### 5.2. Editores de Contenido y Roles Hijos Derivados
Funcionarios autorizados para maquetar, estructurar y actualizar el contenido de las páginas web y boletines informativos mediante el editor visual de páginas, ajustándose a las secciones y permisos concedidos por la administración.

### 5.3. Administradores del Sistema
Personal responsable de la gestión integral de cuentas de usuario, creación de nuevos roles personalizados (exclusivamente para roles de editores), asignación manual de permisos, aprobación y publicación de contenidos, procesamiento de cargas masivas de datos en Excel, consulta de la bitácora de auditoría y configuración general del sistema en el Panel Administrativo.

> **[Captura: Perfiles de Usuario]**
> *Esquema visual ilustrativo de los tres perfiles principales de usuario (Directivos, Editores y Administradores) interactuando con los distintos módulos de la plataforma.*
>
> **[Captura: Perfiles de Usuario (Móvil)]**
> *Esquema visual ilustrativo de los tres perfiles principales de usuario (Directivos, Editores y Administradores) interactuando con los distintos módulos de la plataforma. (Vista en dispositivo móvil).*

---

## 6. Requisitos de acceso

Para garantizar el funcionamiento óptimo de las interfaces y la seguridad de las transacciones, se deben satisfacer las siguientes condiciones técnicas:

### 6.1. Requisitos de Hardware y Conectividad
* **Dispositivos compatibles:**
  * **Computadores de escritorio y portátiles:** Compatible con sistemas operativos Windows, macOS y Linux.
  * **Dispositivos móviles y tabletas:** Compatible con smartphones y tablets (Android e iOS) mediante su diseño responsivo y su arquitectura de **Aplicación Web Progresiva (PWA)**, lo que permite instalar el aplicativo directamente en la pantalla de inicio del dispositivo como una app independiente y ligera.

> **[Captura: PWA en Navegador]**
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo.*
>
> **[Captura: PWA en Navegador (Móvil)]**
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo. (Vista en dispositivo móvil).*

* **Resolución de pantalla:**
  * *Entorno de escritorio:* Mínimo 1280 × 800 píxeles (Recomendada: 1920 × 1080 Full HD para tableros analíticos y el Panel Administrativo).
  * *Entorno móvil:* Compatible y optimizado desde 360 × 640 píxeles en adelante.
* **Conectividad a Internet:** Conexión de banda ancha o red de datos móviles estable (Mínimo: 5 Mbps para consulta ciudadana; Recomendado: 10 Mbps o superior para funciones operativas, analíticas y administrativas).

### 6.2. Requisitos de Navegadores Web
El sistema es una aplicación web moderna y requiere navegadores con soporte completo de HTML5, cookies y almacenamiento local:
* **Google Chrome:** Versión 110 o superior (Recomendado).
* **Microsoft Edge:** Versión 110 o superior.
* **Mozilla Firefox:** Versión 115 o superior.
* **Safari:** Versión 16 o superior.

> **Nota técnica:** No se requiere la instalación de complementos, Java runtime ni extensiones adicionales en el navegador.

### 6.3. Requisitos de Credenciales Institucionales
Para acceder a los entornos privados (Panel Administrativo, Editor Visual e Intranet):
* **Cuenta de correo obligatoria:** Debe pertenecer estrictamente al dominio corporativo institucional `@sena.edu.co`. Cualquier intento de autenticación o registro con dominios públicos o ajenos es rechazado automáticamente.

> **[Captura: Rechazo de Correo no SENA]**
> *Intento de inicio de sesión o registro con un correo ajeno al dominio institucional `@sena.edu.co` mostrando la alerta o mensaje de restricción.*
>
> **[Captura: Rechazo de Correo no SENA (Móvil)]**
> *Intento de inicio de sesión o registro con un correo ajeno al dominio institucional `@sena.edu.co` mostrando la alerta o mensaje de restricción. (Vista en dispositivo móvil).*

* **Contraseña robusta:** Debe satisfacer los 5 lineamientos de la política institucional de seguridad:
  1. Longitud mínima de **12 caracteres**.
  2. Al menos una letra **mayúscula** (`A-Z`).
  3. Al menos una letra **minúscula** (`a-z`).
  4. Al menos un dígito **numérico** (`0-9`).
  5. Al menos un **carácter especial** o símbolo (`!@#$%^&*()_+-=[]{}|;:,.<>?`).

> **[Captura: Ingreso y Validación de Contraseña]**
> *Visual del formulario mostrando el campo de ingreso de contraseña y la validación dinámica de los lineamientos de seguridad requeridos.*
>
> **[Captura: Ingreso y Validación de Contraseña (Móvil)]**
> *Visual del formulario mostrando el campo de ingreso de contraseña y la validación dinámica de los lineamientos de seguridad requeridos. (Vista en dispositivo móvil).*

---

## 7. Roles y permisos

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los perfiles institucionales autorizados.

### 7.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, realizar búsquedas mediante los componentes interactivos, consultar indicadores, reproducir contenidos en los visores de videos y acceder a documentos mediante los visores de PDFs o botones de descarga libre en formato PDF sin necesidad de iniciar sesión.
3. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con correo institucional (`@sena.edu.co`) a la Intranet, al editor visual de páginas o al Panel Administrativo.

> **[Captura: Consulta Ciudadana]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía.*
>
> **[Captura: Consulta Ciudadana (Móvil)]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía. (Vista en dispositivo móvil).*

### 7.2. Qué puede hacer cada tipo de usuario

#### 7.2.1. Administrador
Corresponde a la máxima autoridad técnica y operativa dentro de la plataforma del observatorio.

* **Propósito del perfil:**
  Garantizar la administración integral, gobernanza, disponibilidad operativa y seguridad técnica del sistema. Es el encargado de la gestión de usuarios, el control editorial de publicaciones, la importación masiva de datos y la fiscalización del sistema mediante la bitácora de auditoría.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante credenciales corporativas institucionales obligatorias (`@sena.edu.co`). Dispone de acceso exclusivo al Panel Administrativo (`/admin`), entorno inaccesible para los demás perfiles. Asimismo, puede navegar libremente por el Sitio Web público y por la Intranet institucional con plenas facultades de visualización y edición en línea.

* **Funciones y facultades principales:**
  * *Gestión integral de cuentas de usuario:* Registra nuevos usuarios institucionales, asigna o revoca roles, activa o suspende cuentas y ejecuta el restablecimiento de contraseñas ante eventualidades o bloqueos.
  * *Creación de roles de editor y parametrización de permisos:* Crea perfiles personalizados exclusivamente bajo la tipología de editor (bajo la nomenclatura fija «Editor [Nombre]») y define manualmente («a mano») los accesos e interruptores de permisos sobre cada página o sección.
  * *Aprobación y control en la bandeja de revisión:* Examina los borradores remitidos por los editores mediante la previsualización interactiva y dispone de tres decisiones operativas:
    * *Aprobar:* Autoriza la publicación inmediata de la versión revisada para su despliegue público o en la Intranet.
    * *Rechazar:* Devuelve la versión al editor responsable con las observaciones y justificación de los cambios requeridos.
    * *Descartar / Eliminar (ícono de basurero):* Elimina definitivamente el borrador no procedente o enviado por error. Esta acción exige registrar obligatoriamente el motivo para la bitácora de auditoría y depura los archivos e imágenes huérfanas sin alterar la versión publicada.
  * *Edición integral y gestión de páginas:* Accede al editor visual para maquetar directamente cualquier contenido en el Sitio Web o la Intranet, crear nuevas páginas y eliminar páginas dinámicas creadas por los editores.
  * *Carga masiva de información en Excel:* Importa y procesa actualizaciones masivas de datos institucionales, estadísticas e indicadores mediante archivos en formato `.xlsx`.
  * *Supervisión mediante bitácora de auditoría:* Inspecciona el registro cronológico inmutable de eventos para verificar qué usuario realizó cada acción, los cambios ejecutados, las marcas de tiempo y las direcciones de origen.

> **[Captura: Bandeja de Revisión]**
> *Bandeja de páginas en revisión en el Panel Administrativo con los controles directos para previsualizar, aprobar, rechazar o descartar borradores mediante el botón de basurero.*
>
> **[Captura: Bandeja de Revisión (Móvil)]**
> *Bandeja de páginas en revisión en el Panel Administrativo con los controles directos para previsualizar, aprobar, rechazar o descartar borradores mediante el botón de basurero. (Vista en dispositivo móvil).*

> **[Captura: Confirmación Descarte]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, mostrando la exigencia del registro obligatorio del motivo para auditoría.*
>
> **[Captura: Confirmación Descarte (Móvil)]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, mostrando la exigencia del registro obligatorio del motivo para auditoría. (Vista en dispositivo móvil).*

> **[Captura: Carga Masiva Excel]**
> *Módulo administrativo de carga masiva mostrando la interfaz y zona de arrastre para importar el archivo Excel.*
>
> **[Captura: Carga Masiva Excel (Móvil)]**
> *Módulo administrativo de carga masiva mostrando la interfaz y zona de arrastre para importar el archivo Excel. (Vista en dispositivo móvil).*

* **Límites operativos y restricciones de seguridad:**
  * No puede modificar ni eliminar mediante el editor visual las rutas y vistas que no son gestionables desde el editor de páginas, tales como las interfaces de autenticación (inicio de sesión, recuperación de credenciales y preguntas de seguridad) y todas las rutas funcionales del Panel Administrativo (`/admin`), las cuales corresponden a la arquitectura fija de código del aplicativo.
  * No puede crear roles dentro de las jerarquías de Administrador ni de Director; la creación de roles nuevos se encuentra restringida exclusivamente a roles hijos de editor.
  * No puede omitir ni alterar el registro de auditoría; todas las acciones administrativas quedan grabadas de forma obligatoria e irreversible en la base de datos.

#### 7.2.2. Editor (Rol Base)
Corresponde al perfil técnico general facultado para la producción, maquetación y diseño de los contenidos institucionales.

* **Propósito del perfil:**
  Construir, actualizar y diseñar visualmente las páginas y boletines de la plataforma mediante el editor interactivo de bloques, manteniendo la pertinencia informativa y la coherencia gráfica institucional.

* **Entorno de acceso y autenticación:**
  Inicia sesión con su cuenta corporativa institucional (`@sena.edu.co`) desde el Sitio Web público o desde la Intranet. Al autenticarse, el sistema retorna al usuario a la página de inicio correspondiente según el ambiente donde ingresó. Al navegar por las diferentes páginas, se le despliega un menú flotante con los botones de acción para editar página, editar cabecera/pie, crear o eliminar páginas.

* **Funciones y facultades principales:**
  * *Maquetación interactiva con bloques:* Diseña y estructura contenidos directamente en el editor visual mediante su entorno de tres paneles: seleccionando bloques prediseñados del catálogo izquierdo (textos, imágenes, tarjetas de indicadores, carruseles, acordeones), arrastrándolos al lienzo central en tiempo real y personalizando sus propiedades en el panel lateral derecho.
  * *Cobertura total de edición:* Accede a la edición de cualquier página del portal o de la Intranet a través del botón flotante en pantalla (opción **"Editar página"**), disponiendo de permisos plenos sobre todos los contenidos existentes, sin importar qué editor los haya creado originalmente.
  * *Creación y eliminación de páginas dinámicas:* Gestiona páginas dinámicas desde el menú del botón flotante mediante las opciones **"Crear página"** (definiendo título y ruta URL) y **"Eliminar página"** (con validaciones de seguridad y protección contra enlaces rotos). Al crear una nueva página, el sistema otorga permisos de edición automáticos al rol del editor que la creó, al rol padre Editor base y al rol de Administrador; de este modo, ningún otro rol de editor tiene acceso a intervenirla a menos que el Administrador se lo conceda manualmente.
  * *Flujo de trabajo mediante borradores:* Guarda su progreso de forma privada mediante el botón **"Guardar Borrador"** sin alterar el portal público, y traslada los cambios terminados mediante **"Enviar a revisión"** hacia la sección **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación final por parte del Administrador.

> **[Captura: Editor Visual Componentes]**
> *Entorno del editor visual interactivo mostrando el panel de componentes prediseñados y el menú flotante para la creación y eliminación de secciones.*
>
> **[Captura: Editor Visual Componentes (Móvil)]**
> *Entorno del editor visual interactivo mostrando el panel de componentes prediseñados y el menú flotante para la creación y eliminación de secciones. (Vista en dispositivo móvil).*

* **Límites operativos y restricciones de seguridad:**
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No puede publicar directamente en los entornos productivos; requiere obligatoriamente la aprobación previa de un Administrador.
  * No puede intervenir ni eliminar las rutas fijas del aplicativo (como las interfaces de inicio de sesión o las rutas administrativas), ya que corresponden a la estructura de código del sistema y no a páginas gestionables desde el editor visual.
  * Si bien está facultado para eliminar páginas dinámicas creadas en el sistema, no puede borrarlas si se encuentran vinculadas a algún elemento del menú de navegación institucional o a otros enlaces del portal; en dichos casos, el sistema bloquea la acción y le exige retirar previamente esos enlaces desde la edición del menú para evitar enlaces rotos.
  * No puede crear, modificar ni gestionar cuentas de usuario ni roles.
  * No tiene acceso a la bitácora de auditoría ni al módulo de carga masiva de datos en Excel.

#### 7.2.3. Roles Hijos o Derivados de Editor
Corresponden a perfiles editoriales especializados creados por el Administrador para delimitar responsabilidades por dependencia o temática.

* **Propósito del perfil:**
  Permitir la participación distribuida de funcionarios en la maquetación y actualización de contenidos concretos, aplicando el principio de mínimo privilegio para limitar el alcance de su intervención únicamente a las páginas autorizadas.

* **Entorno de acceso y autenticación:**
  Inician sesión con credenciales corporativas institucionales (`@sena.edu.co`) en el Sitio Web público o en la Intranet. Al ingresar, el sistema redirige al usuario al inicio del portal y despliega el menú flotante de edición únicamente cuando navega por las páginas y secciones específicas que le hayan sido habilitadas.

* **Funciones y facultades principales:**
  * *Exclusividad de tipología:* Todo rol derivado creado en la plataforma pertenece obligatoriamente a la familia de editores y se registra bajo el formato estricto «Editor [Nombre]».
  * *Configuración manual de permisos («a mano»):* Nace sin ningún permiso predeterminado (privilegio cero). El Administrador habilita de forma selectiva los interruptores de acceso para las páginas, secciones o funciones específicas requeridas.
  * *Capacidad equivalente según asignación:* Si el Administrador le otorga permisos completos (activando todas las páginas, la creación y el borrado), el rol hijo adquiere las mismas facultades operativas que el rol Editor base.
  * *Control de componentes globales:* La modificación de la cabecera y pie de página institucional permanece bloqueada por defecto, salvo concesión expresa del Administrador.
  * *Ciclo editorial de borradores:* Maqueta los bloques en las páginas asignadas y remite las versiones trabajadas a la sección de **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación definitiva por parte del Administrador.
  * *Asignación automática y delegación de nuevas páginas:* Cuando un rol hijo que cuenta con permiso de creación genera una nueva página, el sistema otorga permisos de edición inmediatos únicamente a su propio rol, al rol padre Editor base y al Administrador. Los demás roles hijos de editor quedan sin acceso a dicha página; si otro rol especializado necesita colaborar o editarla, el Administrador debe otorgarle el permiso de forma manual («a mano») desde la opción de editar rol en el Panel Administrativo.

> **[Captura: Formulario Crear Rol]**
> *Formulario de creación de nuevos roles en el Panel Administrativo evidenciando el prefijo obligatorio para editores y la interfaz de asignación manual de permisos.*
>
> **[Captura: Formulario Crear Rol (Móvil)]**
> *Formulario de creación de nuevos roles en el Panel Administrativo evidenciando el prefijo obligatorio para editores y la interfaz de asignación manual de permisos. (Vista en dispositivo móvil).*

* **Límites operativos y restricciones de seguridad:**
  * No tienen acceso al Panel Administrativo (`/admin`).
  * No pueden publicar páginas directamente en producción sin la aprobación del Administrador.
  * No pueden intervenir ni editar páginas o secciones ajenas a las asignadas de forma explícita en su perfil.
  * No pueden crear ni eliminar páginas a menos que cuenten con el permiso manual activado específicamente para ello.
  * No pueden intervenir ni eliminar las rutas no gestionables desde el editor visual (pantallas de inicio de sesión y rutas administrativas), ni gestionar usuarios, roles, auditoría o cargas masivas.

#### 7.2.4. Director / Subdirector
Corresponde al perfil institucional de dirección enfocado en el monitoreo gerencial, el análisis estratégico y la toma de decisiones institucionales.

* **Propósito del perfil:**
  Facilitar la consulta directa, ágil y protegida de la información estadística, los indicadores del mercado laboral y los resultados de pertinencia educativa para respaldar la planeación y la gestión directiva.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante su cuenta institucional corporativa (`@sena.edu.co`) directamente en la Intranet institucional. El sistema valida su identidad y despliega el entorno privado con acceso inmediato a los módulos gerenciales.

* **Funciones y facultades principales:**
  * *Consulta gerencial en solo lectura:* Explora e interactúa con los tableros analíticos de Power BI integrados en la Intranet (tasas de ocupación, matrices de pertinencia educativa e indicadores de encuestas a egresados y calidad formativa).
  * *Descarga de presentaciones e informes internos:* Descarga informes analíticos, boletines ejecutivos y presentaciones en formato PDF o PowerPoint para comités de dirección y mesas de trabajo técnico.
  * *Monitoreo estratégico sin fricción operativa:* Realiza análisis comparativos y seguimiento a las metas institucionales sobre información consolidada y oficial.

> **[Captura: Intranet Director]**
> *Interfaz de consulta gerencial en la Intranet institucional con tableros interactivos integrados en modalidad de solo lectura.*
>
> **[Captura: Intranet Director (Móvil)]**
> *Interfaz de consulta gerencial en la Intranet institucional con tableros interactivos integrados en modalidad de solo lectura. (Vista en dispositivo móvil).*

* **Límites operativos y restricciones de seguridad:**
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No posee facultades de edición ni maquetación; no se despliega el menú flotante de edición ni tiene acceso al editor visual.
  * No puede crear, modificar ni eliminar páginas, menús ni contenidos de la plataforma.
  * No administra cuentas de usuario, no crea roles ni configura permisos.
  * No ejecuta cargas masivas de datos en Excel ni accede a la bitácora de auditoría técnica.

### 7.3. Reglas para la Creación y Eliminación de Páginas
El sistema aplica controles estrictos para salvaguardar la estabilidad, coherencia de navegación e integridad del portal:
1. **Crear una página no la publica:** La acción de crear una página únicamente genera la estructura vacía en el sistema. La página no es visible para la ciudadanía ni en la Intranet hasta que se le agregue contenido, se guarde el borrador, se envíe a revisión y un Administrador apruebe su publicación definitiva.
2. **Asignación jerárquica de permisos al crear páginas:** Al crearse una nueva página, el sistema confiere de manera automática e inmediata permisos de edición exclusivamente a tres roles:
   * Al **rol del editor que creó la página** (sea el rol Editor base o un rol hijo con permiso de creación).
   * Al **rol padre Editor (Rol Base)**, asegurando que mantenga su cobertura general de edición sobre todos los contenidos de la plataforma.
   * Al rol **Administrador**, garantizando la supervisión y control técnico de la plataforma.
   Ningún otro rol hijo o derivado de editor recibe permisos automáticamente sobre dicha página. Por lo tanto, si otro rol requiere intervenir o colaborar en su maquetación, el Administrador debe ingresar al Panel Administrativo y otorgarle el acceso de forma manual («a mano») mediante la opción de editar rol.
3. **Protección de rutas fijas del aplicativo:** Las vistas y pantallas que no son gestionables mediante el editor visual (tales como las interfaces de inicio de sesión, flujos de autenticación y las rutas del Panel Administrativo) forman parte del código base del sistema y **nunca pueden ser eliminadas ni alteradas desde el editor visual**.
4. **Ámbito de eliminación en páginas gestionadas por el editor:** La eliminación únicamente aplica sobre las páginas dinámicas y secciones de contenido creadas o administradas en la plataforma, las cuales sí pueden ser retiradas siempre que no cuenten con enlaces activos.
5. **Protección contra enlaces rotos:** Antes de procesar el borrado, el sistema inspecciona todo el portal; si otra página o menú institucional contiene un enlace activo que apunta hacia la página a eliminar, el borrado se bloquea automáticamente hasta que dichos enlaces sean retirados, impidiendo que los usuarios encuentren enlaces rotos (error 404).
6. **Confirmación de seguridad obligatoria:** Para evitar eliminaciones accidentales por un clic involuntario, el sistema despliega una ventana de confirmación donde el usuario debe escribir exactamente el título de la página antes de autorizar su borrado definitivo.

> **[Captura: Modal Eliminar Página]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página.*
>
> **[Captura: Modal Eliminar Página (Móvil)]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página. (Vista en dispositivo móvil).*

7. **Registro inmutable:** La eliminación retira la página y sus versiones de la plataforma, pero la bitácora de auditoría conserva de forma permanente el registro histórico de quién la creó, quién la editó y quién la eliminó.

### 7.4. Matriz Comparativa de Acceso y Capacidades

| Capacidad / Entorno del Sistema | Director / Subdirector | Editor Base | Roles Hijos de Editor | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Navegar Sitio Web Público y descargar archivos** | Permitido | Permitido | Permitido | Permitido |
| **Inicio de sesión institucional (`@sena.edu.co`)** | Permitido | Permitido | Permitido | Permitido |
| **Consultar tableros de Power BI en Intranet** | Permitido (Solo lectura) | Permitido | Permitido | Permitido |
| **Descargar informes y presentaciones internas** | Permitido | Permitido | Permitido | Permitido |
| **Ingresar al editor visual de páginas** | Sin acceso | Permitido | Permitido | Permitido |
| **Editar páginas asignadas del Sitio Web e Intranet** | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Modificar cabecera y pie de página institucional** | Sin acceso | Permitido | No (Por defecto) | Permitido |
| **Crear nuevas páginas en el portal** | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Eliminar páginas creadas por usuarios** | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Eliminar páginas base del sistema (de fábrica)** | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) |
| **Guardar borradores y enviar a revisión** | Sin acceso | Permitido | Permitido | Permitido |
| **Aprobar y publicar páginas en producción** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Rechazar páginas en revisión con observaciones** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Descartar versiones en revisión (botón de basurero)** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Ingresar al Panel Administrativo** | Sin acceso | Sin acceso | Sin acceso | Permitido (Exclusivo) |
| **Crear, editar y suspender cuentas de usuario** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Crear roles (exclusivo para roles de Editor) y asignar permisos a mano** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Restablecer contraseñas de otros usuarios** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Carga masiva de datos ocupacionales en Excel** | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Consultar la bitácora de auditoría del sistema** | Sin acceso | Sin acceso | Sin acceso | Permitido |

### 7.5. Flujo de Separación de Funciones y Control Operativo
1. **Separación entre redacción y publicación:** Quienes redactan y diseñan el contenido preparan sus borradores sin publicarlos inmediatamente hacia el público general.
2. **Revisión previa:** El Administrador revisa el material propuesto, valida su pertinencia y decide su publicación definitiva, remite observaciones de ajuste al editor, o descarta la versión mediante el botón de basurero si el borrador fue enviado por error o no procede.
3. **Control en la creación y borrado:** La creación de nuevas estructuras de páginas está regulada para evitar páginas vacías en producción, y el borrado cuenta con validación de enlaces y protección inmutable para las páginas estructurales del portal.
4. **Protección de la administración central:** Las herramientas de configuración y control de accesos se mantienen reservadas exclusivamente para la administración. Asimismo, la creación de nuevos roles en la plataforma está restringida exclusivamente a roles de editor («Editor [Nombre]») con permisos acotados, garantizando que no se puedan crear roles administrativos ni directivos adicionales.
5. **Consulta directiva sin riesgos de alteración:** Los directores y subdirectores disponen de toda la información gerencial de forma inmediata y protegida, sin peligro de modificar inadvertidamente las páginas ni los datos del observatorio.

---

## 8. Acceso al sistema

El acceso al ecosistema tecnológico del Observatorio Laboral y Ocupacional comprende los mecanismos de navegación pública abierta y los procedimientos de autenticación, recuperación de credenciales y administración de cuentas institucionales para el personal autorizado.

### 8.1. Sitio Web Público

#### 8.1.1. Portal Web Público (Cara visible)
El portal web público es la plataforma principal que refleja el trabajo realizado por los editores y administradores. Es un entorno dinámico y adaptable donde se publican las páginas maquetadas con diversos componentes interactivos (buscadores, visores de videos, visores de documentos PDF, tarjetas de indicadores y enlaces de descarga). La apariencia y distribución de los contenidos varían según las prioridades institucionales de cada momento. Aunque su contenido principal es público y consumido por la ciudadanía sin requerir autenticación, el personal administrativo y editorial utiliza este mismo entorno como punto de acceso institucional.

#### 8.1.2. Inicio de Sesión Institucional en el Portal Web
Permite a cualquier usuario institucional registrado acceder con su cuenta corporativa al portal:
* **Autenticación abierta para todo usuario institucional:** Cualquier funcionario que cuente con una cuenta activa registrada puede iniciar sesión en la plataforma, independiente de el rol asignado (Administrador, Director / Subdirector, Editor base o Roles hijos derivados de Editor).
* **Alcance según el perfil del usuario:**
  * *Editores y Administradores:* Al identificarse, el sistema habilita las barras de herramientas operativas, el acceso al editor visual de páginas y, en el caso exclusivo del Administrador, el ingreso al Panel Administrativo.
  * *Directores y Subdirectores:* Su función dentro del sistema es actuar como cualquier **usuario registrado legítimo**, pero **sin permisos administrativos ni facultades de edición**. Por lo tanto, al iniciar sesión en el sitio web interactúan con la plataforma de forma autenticada, pero sin visualizar herramientas de maquetación, botones de edición ni accesos de configuración.
* **Credenciales requeridas:**
  * Correo electrónico corporativo con dominio institucional `@sena.edu.co`.
  * Contraseña robusta configurada en la plataforma.
* **Enlace de recuperación:** La pantalla de autenticación dispone del acceso directo para el restablecimiento de contraseñas ante olvidos *(¿Olvidaste tu contraseña?)*.

> **[Captura: Login Intranet]**
> *Formulario de inicio de sesión del Sitio Web Público con campos de correo institucional `@sena.edu.co`, contraseña y enlace de recuperación.*
>
> **[Captura: Login Intranet (Móvil)]**
> *Formulario de inicio de sesión del Sitio Web Público con campos de correo institucional `@sena.edu.co`, contraseña y enlace de recuperación. (Vista en dispositivo móvil).*

### 8.2. Intranet Institucional

#### 8.2.1. Inicio de Sesión en el Entorno Privado
La Intranet es una plataforma privada orientada al seguimiento gerencial, análisis ocupacional y trabajo interno del SENA:
* **Acceso restringido con autenticación obligatoria:** A diferencia del portal público, la Intranet no permite navegación anónima ni libre. Toda persona debe autenticarse para ingresar.
* **Perfiles habilitados:**
  * *Directores y Subdirectores:* Ingresan como usuarios registrados institucionales para consultar los tableros de Power BI e indicadores de gestión en modalidad de solo lectura, manteniendo protegidos los datos y la estructura interna al no contar con permisos de edición ni facultades de administración.
  * *Editores y Administradores:* Ingresan para maquetar secciones internas o realizar labores de supervisión según sus atribuciones.
* **Credenciales de ingreso:** Correo corporativo `@sena.edu.co` y contraseña institucional. Al iniciar sesión, el sistema redirige al usuario a los tableros analíticos de Power BI o a sus secciones asignadas según el rol.

> **[Captura: Recuperación Correo]**
> *Pantalla de acceso a la Intranet Institucional para consulta directiva de tableros analíticos y reportes.*
>
> **[Captura: Recuperación Correo (Móvil)]**
> *Pantalla de acceso a la Intranet Institucional para consulta directiva de tableros analíticos y reportes. (Vista en dispositivo móvil).*

### 8.3. Procedimiento de Recuperación de Contraseña (Preguntas de Seguridad)
El mecanismo de recuperación de acceso opera de manera unificada para todos los usuarios:

1. **Inicio del proceso:** En la pantalla de inicio de sesión (ya sea del Sitio Web o de la Intranet), se debe ubicar el enlace inferior.

> **[Captura: Paso 1]**
> *Ubicación del enlace de recuperación en la pantalla de inicio de sesión.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del enlace de recuperación en la pantalla de inicio de sesión. (Vista en dispositivo móvil).*

2. **Clic en el enlace:** Se debe hacer clic en el texto **"*(¿Olvidaste tu contraseña?)* / Recuperar contraseña"**.

> **[Captura: Paso 2]**
> *Acción de hacer clic en el enlace de recuperación.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Acción de hacer clic en el enlace de recuperación. (Vista en dispositivo móvil).*

3. **Identificación de cuenta:** El sistema desplegará un campo para digitar el correo. Se debe ingresar el correo corporativo `@sena.edu.co`.

> **[Captura: Paso 3]**
> *Ingreso del correo institucional en el campo de recuperación.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ingreso del correo institucional en el campo de recuperación. (Vista en dispositivo móvil).*

4. **Confirmación de identidad:** Se debe pulsar el botón **"Continuar"** para que el sistema busque la cuenta.

> **[Captura: Paso 4]**
> *Clic en el botón continuar.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Clic en el botón continuar. (Vista en dispositivo móvil).*

5. **Preguntas de seguridad:** Se desplegará el formulario de preguntas de seguridad. Se debe seleccionar la respuesta correcta para cada menú desplegable.

> **[Captura: Paso 5]**
> *Selección de respuestas en el formulario de preguntas de seguridad.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Selección de respuestas en el formulario de preguntas de seguridad. (Vista en dispositivo móvil).*

6. **Envío de validación:** Se debe hacer clic en **"Validar Identidad"**.

> **[Captura: Paso 6]**
> *Clic en el botón Validar Identidad.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Clic en el botón Validar Identidad. (Vista en dispositivo móvil).*

7. **Restablecimiento:** Si es correcto, aparecerán los campos de nueva contraseña. Se debe digitar la nueva contraseña cumpliendo las políticas de seguridad.

> **[Captura: Paso 7]**
> *Ingreso de la nueva contraseña en los campos correspondientes.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Ingreso de la nueva contraseña en los campos correspondientes. (Vista en dispositivo móvil).*

8. **Confirmación final:** Se debe pulsar el botón **"Guardar nueva contraseña"** para finalizar el proceso. El sistema devolverá al usuario al login.

### 8.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet. El procedimiento operativo paso a paso y la interfaz para llevar a cabo esta labor se explican a detalle en la **Sección 10.3.1** de este manual.

## 8.5. Primer Ingreso al Sistema (Onboarding)

Cuando el Administrador crea una cuenta nueva, el funcionario debe completar la configuración inicial antes de poder operar con normalidad.

### 8.5.1. Recepción de Credenciales Iniciales

Al crear la cuenta, el Administrador establece una **contraseña temporal** y la comunica de forma manual al funcionario a través del canal institucional que considere apropiado (correo electrónico, mensaje de chat corporativo u otro medio). **El sistema no envía ningún correo automático de bienvenida.** La contraseña temporal no tiene fecha de expiración: permanece activa hasta que el funcionario la use para completar su primer ingreso.

### 8.5.2. Flujo de Primer Ingreso Paso a Paso

1. **Inicio de sesión con contraseña temporal:** El funcionario accede al portal (Sitio Web o Intranet, según su rol) e ingresa su correo corporativo `@sena.edu.co` y la contraseña temporal recibida.

> **[Captura: Login Primer Ingreso]**
> *Formulario de inicio de sesión con las credenciales temporales.*
>
> **[Captura: Login Primer Ingreso (Móvil)]**
> *Formulario de inicio de sesión con las credenciales temporales. (Vista en dispositivo móvil).*

2. **Detección automática del primer ingreso:** El sistema detecta que la cuenta tiene pendiente un cambio de contraseña e interrumpe el flujo de redirección normal, mostrando obligatoriamente la pantalla de configuración inicial.

> **[Captura: Pantalla Configuración Inicial]**
> *Pantalla de configuración obligatoria que aparece tras el primer inicio de sesión.*
>
> **[Captura: Pantalla Configuración Inicial (Móvil)]**
> *Pantalla de configuración obligatoria que aparece tras el primer inicio de sesión. (Vista en dispositivo móvil).*

3. **Establecimiento de nueva contraseña:** El sistema solicitará al funcionario crear su contraseña definitiva. Se debe digitar la nueva contraseña en el primer campo y repetirla en el segundo campo de confirmación, cumpliendo estrictamente los 5 lineamientos de la política de seguridad (ver sección 6.3).

> **[Captura: Nueva Contraseña Primer Ingreso]**
> *Campos de nueva contraseña y confirmación con indicador visual de cumplimiento de políticas de seguridad.*
>
> **[Captura: Nueva Contraseña Primer Ingreso (Móvil)]**
> *Campos de nueva contraseña y confirmación con indicador visual de cumplimiento de políticas de seguridad. (Vista en dispositivo móvil).*

4. **Configuración de preguntas de seguridad:** A continuación, el sistema solicitará configurar **tres preguntas de seguridad**. Para cada pregunta, se debe:
   * Desplegar el menú y seleccionar la pregunta deseada de la lista predefinida.
   * Digitar la respuesta exacta en el campo de texto correspondiente (la respuesta es sensible a mayúsculas).

> **[Captura: Configurar Preguntas de Seguridad]**
> *Formulario de configuración inicial de las tres preguntas de seguridad con sus respectivos campos de respuesta.*
>
> **[Captura: Configurar Preguntas de Seguridad (Móvil)]**
> *Formulario de configuración inicial de las tres preguntas de seguridad con sus respectivos campos de respuesta. (Vista en dispositivo móvil).*

5. **Confirmación y acceso:** Se debe hacer clic en el botón **"Guardar y continuar"**. Si todo es correcto, el sistema redirigirá automáticamente al entorno correspondiente según el rol asignado.

## 8.6. Cierre de Sesión

El cierre de sesión seguro es una práctica obligatoria para proteger la información institucional, especialmente en equipos compartidos.

### 8.6.1. Cerrar Sesión desde el Panel Administrativo

El Panel Administrativo dispone del botón de cierre de sesión en el menú lateral izquierdo:

1. **Acceso al menú de perfil:** En la parte inferior del menú lateral, hacer clic sobre el nombre o foto de perfil del usuario.
2. **Selección de la opción:** En el menú desplegable oscuro que aparece, hacer clic en **"Cerrar sesión"**.
3. **Confirmación:** El sistema cerrará la sesión activa, invalidará el token de autenticación y redirigirá automáticamente a la pantalla de inicio de sesión del Sitio Web.

> **[Captura: Logout Panel Admin]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo con la opción "Cerrar sesión" visible.*
>
> **[Captura: Logout Panel Admin (Móvil)]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo con la opción "Cerrar sesión" visible. (Vista en dispositivo móvil).*

### 8.6.2. Cerrar Sesión desde el Sitio Web Público

Los Editores y demás usuarios autenticados que operan directamente desde el Sitio Web (sin ingresar al Panel Administrativo) cierran su sesión desde la cabecera del portal:

1. **Acceso al menú de perfil:** En la esquina superior derecha de la cabecera del Sitio Web Público, hacer clic sobre el nombre del usuario o su foto de perfil.
2. **Selección de la opción:** En el menú desplegable que se despliega, hacer clic en **"Cerrar sesión"**.
3. **Confirmación:** El sistema cerrará la sesión y recargará la cabecera mostrando nuevamente el botón **"Iniciar Sesión"**, confirmando que el usuario ha salido correctamente.

> **[Captura: Logout Sitio Web]**
> *Menú desplegable de perfil en la cabecera del Sitio Web Público mostrando la opción de cierre de sesión.*
>
> **[Captura: Logout Sitio Web (Móvil)]**
> *Menú desplegable de perfil en la cabecera del Sitio Web Público mostrando la opción de cierre de sesión. (Vista en dispositivo móvil).*

### 8.6.3. Cierre de Sesión en la Intranet

El proceso es equivalente al del Sitio Web: se accede al menú de perfil en la cabecera de la Intranet y se selecciona **"Cerrar sesión"**. El sistema redirige a la pantalla de bloqueo de la Intranet.

> **Nota técnica:** Las sesiones inactivas expiran automáticamente tras **30 minutos** sin actividad. Al detectar la expiración, el sistema cierra la sesión de forma preventiva y solicita al usuario autenticarse de nuevo.



---

## 9. Interfaz general

La interfaz de usuario del Observatorio Laboral y Ocupacional ha sido diseñada bajo principios de claridad, accesibilidad y consistencia. Esta sección detalla la disposición de los elementos en pantalla y las reglas de interacción, enfatizando la coexistencia de componentes estructurales fijos y áreas de contenido dinámico.

### 9.1. Disposición General de la Pantalla (Anatomía)

La pantalla se divide en tres zonas principales que facilitan la orientación y la navegación del usuario en cualquier módulo del sistema:
* **Zona superior (Cabecera):** Contiene la identidad institucional (logotipo del SENA), el nombre oficial del sistema, el menú de navegación principal y los controles de acceso (botón de inicio de sesión o menú del perfil de usuario).
* **Zona central (Área de contenido):** Es el espacio principal donde se despliega la información pública, los tableros analíticos o las herramientas del editor visual. Su diseño es responsivo y se adapta automáticamente a la resolución del dispositivo.
* **Zona inferior (Pie de página):** Despliega la información de contacto, políticas de privacidad, enlaces de interés institucional y los créditos de la plataforma.

> **[Captura: Lienzo Edición Flexible]**
> *Esquema general de la pantalla mostrando la cabecera institucional, el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Lienzo Edición Flexible (Móvil)]**
> *Esquema general de la pantalla mostrando la cabecera institucional, el área de contenido dinámico central y el pie de página. (Vista en dispositivo móvil).*

### 9.2. Elementos Estructurales Fijos (Inmutables)

Para garantizar la estabilidad operativa del portal, la coherencia en la navegación ciudadana y la identidad gráfica del SENA, el sistema cuenta con componentes base que están protegidos de manera estricta contra eliminación o alteración estructural:
* **Menús principales y barras de navegación:** El esqueleto de la navegación superior se mantiene constante. Aunque el sistema permite acoplar dinámicamente nuevas páginas a la navegación, las rutas estructurales base de las categorías principales no pueden ser suprimidas.
* **Rutas fijas del aplicativo:** Las vistas y componentes programados fijos en el código fuente que no se gestionan mediante el editor visual (como las interfaces de inicio de sesión, flujos de autenticación y las pantallas del Panel Administrativo) son permanentes y no se pueden eliminar. Por el contrario, las páginas de contenido que se abren desde el portal público o la Intranet son dinámicamente editables y ajustables a través del editor visual.
* **Cabecera y Pie de página globales:** Elementos estructurales bloqueados para la edición general, cuyo propósito es garantizar la homogeneidad en la identidad en todo el ecosistema del portal.

### 9.3. Elementos Dinámicos y Flexibles (Entorno de Edición)

El área central de las páginas representa el entorno dinámico y flexible del sistema. En estas zonas, los usuarios con roles y permisos de edición tienen plena facultad operativa para construir y actualizar la información de forma interactiva:
* **Naturaleza adaptable de las páginas (Guía y Plantilla):** El presente manual opera como una guía metodológica y una plantilla referencial sobre las capacidades de la plataforma. Debido a que las páginas se maquetan dinámicamente mediante el editor visual, la disposición de los bloques, su orden, sus títulos y sus elementos visuales específicos variarán según las necesidades institucionales del momento y el diseño implementado por los editores.
* **Catálogo de componentes disponibles:** Dentro del lienzo de edición, el usuario puede incorporar, reordenar y configurar componentes prediseñados de la plataforma:
  * *Contenido textual y gráfico:* Texto enriquecido, títulos, imágenes con descripción accesible y tarjetas de artículos.
  * *Tarjetas e indicadores:* Módulos de servicios, tarjetas de cifras clave y resúmenes informativos.
  * *Visualización multimedia:* **Visor de videos** (para reproducir contenido audiovisual institucional) y **visor de documentos y PDFs** (para explorar publicaciones e informes normativos sin abandonar el portal).
  * *Analítica y datos:* **Tableros BI** interactivos (Power BI) embebidos para la consulta gerencial y ciudadana de estadísticas e indicadores.
  * *Acción y descargas:* Botones de acción, enlaces de **descarga de documentos**, menús acordeón y canales de atención.
* **Creación de nuevas páginas:** Capacidad para generar páginas adicionales que se incorporan a la plataforma de forma flexible, respetando las validaciones contra enlaces rotos y las reglas de publicación mediante revisión.

> **[Captura: Botones Estandarizados]**
> *Área central en modo de edición mostrando los límites flexibles del lienzo y la estructura de los bloques de contenido apilados.*
>
> **[Captura: Botones Estandarizados (Móvil)]**
> *Área central en modo de edición mostrando los límites flexibles del lienzo y la estructura de los bloques de contenido apilados. (Vista en dispositivo móvil).*

### 9.4. Estandarización de Botones y Controles de Acción

Las interacciones dentro de la plataforma, en especial dentro del Panel Administrativo y el Editor Visual, obedecen a convenciones estandarizadas para agilizar el trabajo y prevenir errores operativos:
* **Controles de confirmación y flujo de estado:** Botones destinados a preservar el trabajo (guardar borradores) o a avanzar en el flujo de publicación (enviar a revisión, o aprobar definitivamente desde la administración).
* **Controles destructivos o de descarte:** Acciones orientadas a la eliminación de bloques de contenido, descarte de versiones en revisión o borrado de páginas dinámicas. Por lineamientos de seguridad, las acciones de carácter destructivo que comprometen páginas o versiones siempre están condicionadas a validaciones secundarias, como ventanas de confirmación o justificaciones obligatorias para la auditoría.
* **Controles de previsualización:** Herramientas que habilitan la visualización del contenido en su formato final antes de aplicar los cambios en producción, permitiendo al editor o administrador certificar la calidad visual y la funcionalidad de los enlaces.

> **[Captura: Buscador Global]**
> *Conjunto de botones estandarizados de la plataforma: guardado (verde), descarte/eliminación (rojo con ícono de basurero) y previsualización (ícono de ojo).*
>
> **[Captura: Buscador Global (Móvil)]**
> *Conjunto de botones estandarizados de la plataforma: guardado (verde), descarte/eliminación (rojo con ícono de basurero) y previsualización (ícono de ojo). (Vista en dispositivo móvil).*

---

## 10. Funcionalidades (Flujo Operativo Paso a Paso)

Esta sección detalla de forma exhaustiva los flujos de trabajo de la plataforma, guiando al usuario paso a paso desde la interacción con botones específicos en la interfaz hasta la ejecución de procesos centrales en el Panel Administrativo. *(Nota: El proceso de maquetación y edición de páginas mediante el Editor Visual se explica exclusivamente en la sección 12).*

### 10.1. Ingreso y Recuperación de Contraseña

#### 10.1.1. Inicio de Sesión en el Sitio Web Público
Este proceso es la puerta de entrada principal para Editores y Administradores en la plataforma.

1. **Ubicación del acceso:** En la cabecera (zona superior derecha) del portal web, se debe ubicar y hacer clic en el botón **"Iniciar Sesión"**.

> **[Captura: Botón Iniciar Sesión]**
> *Ubicación del botón de 'Iniciar Sesión' en la esquina superior derecha de la cabecera del Sitio Web Público.*
>
> **[Captura: Botón Iniciar Sesión (Móvil)]**
> *Ubicación del botón de 'Iniciar Sesión' en la esquina superior derecha de la cabecera del Sitio Web Público. (Vista en dispositivo móvil).*

2. **Formulario de credenciales:** El sistema desplegará una ventana modal o dirigirá al formulario de acceso. Se debe ingresar el correo institucional (estrictamente `@sena.edu.co`) en el primer campo de texto.

> **[Captura: Campo Correo Institucional]**
> *Vista del formulario de ingreso resaltando el campo para digitar el correo corporativo.*
>
> **[Captura: Campo Correo Institucional (Móvil)]**
> *Vista del formulario de ingreso resaltando el campo para digitar el correo corporativo. (Vista en dispositivo móvil).*

3. **Ingreso de Contraseña:** En el segundo campo, se debe digitar la contraseña institucional.

> **[Captura: Campo Contraseña]**
> *Vista del formulario de ingreso resaltando el campo de contraseña.*
>
> **[Captura: Campo Contraseña (Móvil)]**
> *Vista del formulario de ingreso resaltando el campo de contraseña. (Vista en dispositivo móvil).*

4. **Ejecución:** Se debe hacer clic en el botón principal **"Ingresar"** (habitualmente destacado en color institucional).

> **[Captura: Botón Ingresar]**
> *Acción de hacer clic sobre el botón principal para ejecutar el inicio de sesión.*
>
> **[Captura: Botón Ingresar (Móvil)]**
> *Acción de hacer clic sobre el botón principal para ejecutar el inicio de sesión. (Vista en dispositivo móvil).*

5. **Resultado y Redirección por Rol:** Si las credenciales son correctas, el sistema evaluará el rol asignado para determinar a qué entorno dirigir al usuario automáticamente:
   * **Editores:** Serán devueltos al **Sitio Web Público**. La página se recargará mostrando el nombre del usuario en la cabecera y habilitará de inmediato las herramientas necesarias para la maquetación y edición de páginas en el portal.
   * **Administradores:** Serán redirigidos de inmediato e ingresarán directamente al **Panel Administrativo**, donde tendrán acceso al *Dashboard* y a todas las herramientas operativas y de gestión de la plataforma.

> **[Captura: Redirección de Rol]**
> *Ejemplo visual de la redirección exitosa, ya sea mostrando la cabecera con el perfil del Editor o el Dashboard del Administrador.*
>
> **[Captura: Redirección de Rol (Móvil)]**
> *Ejemplo visual de la redirección exitosa, ya sea mostrando la cabecera con el perfil del Editor o el Dashboard del Administrador. (Vista en dispositivo móvil).*

#### 10.1.2. Inicio de Sesión en la Intranet Institucional
Este acceso está diseñado principalmente para Directores y Subdirectores que consultan tableros privados, así como para personal administrativo que entra directamente al entorno interno.

1. **Acceso a la URL:** Se debe ingresar a la dirección web específica de la Intranet Institucional. Al ser un entorno privado, el sistema bloqueará la navegación y mostrará inmediatamente la pantalla central de acceso.

> **[Captura: Pantalla Bloqueo Intranet]**
> *Pantalla de bloqueo de la Intranet Institucional exigiendo autenticación obligatoria.*
>
> **[Captura: Pantalla Bloqueo Intranet (Móvil)]**
> *Pantalla de bloqueo de la Intranet Institucional exigiendo autenticación obligatoria. (Vista en dispositivo móvil).*

2. **Diligenciamiento:** Se deben completar los campos de correo corporativo (`@sena.edu.co`) y contraseña.

> **[Captura: Credenciales Intranet]**
> *Ingreso de correo y contraseña en el portal de la Intranet.*
>
> **[Captura: Credenciales Intranet (Móvil)]**
> *Ingreso de correo y contraseña en el portal de la Intranet. (Vista en dispositivo móvil).*

3. **Ejecución:** Se debe presionar el botón **"Acceder a la Intranet"**.

> **[Captura: Botón Acceder Intranet]**
> *Clic en el botón de acceso para enviar las credenciales.*
>
> **[Captura: Botón Acceder Intranet (Móvil)]**
> *Clic en el botón de acceso para enviar las credenciales. (Vista en dispositivo móvil).*

4. **Resultado:** El usuario será redirigido automáticamente al *dashboard* gerencial de Power BI o a la pantalla de inicio privada correspondiente al rol asignado.

> **[Captura: Dashboard Intranet]**
> *Pantalla de inicio exitosa en la Intranet mostrando el tablero correspondiente al rol.*
>
> **[Captura: Dashboard Intranet (Móvil)]**
> *Pantalla de inicio exitosa en la Intranet mostrando el tablero correspondiente al rol. (Vista en dispositivo móvil).*

#### 10.1.3. Procedimiento de Recuperación de Contraseña (Ambos Portales)
1. **Inicio del proceso:** En la pantalla de inicio de sesión (ya sea del Sitio Web o de la Intranet), se debe ubicar el enlace inferior.

> **[Captura: Paso 1]**
> *Ubicación del enlace de recuperación en la pantalla de inicio de sesión.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del enlace de recuperación en la pantalla de inicio de sesión. (Vista en dispositivo móvil).*

2. **Clic en el enlace:** Se debe hacer clic en el texto **"*(¿Olvidaste tu contraseña?)* / Recuperar contraseña"**.

> **[Captura: Paso 2]**
> *Acción de hacer clic en el enlace de recuperación.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Acción de hacer clic en el enlace de recuperación. (Vista en dispositivo móvil).*

3. **Identificación de cuenta:** El sistema desplegará un campo para digitar el correo. Se debe ingresar el correo corporativo `@sena.edu.co`.

> **[Captura: Paso 3]**
> *Ingreso del correo institucional en el campo de recuperación.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ingreso del correo institucional en el campo de recuperación. (Vista en dispositivo móvil).*

4. **Confirmación de identidad:** Se debe pulsar el botón **"Continuar"** para que el sistema busque la cuenta.

> **[Captura: Paso 4]**
> *Clic en el botón continuar.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Clic en el botón continuar. (Vista en dispositivo móvil).*

5. **Preguntas de seguridad:** Se desplegará el formulario de preguntas de seguridad. Se debe seleccionar la respuesta correcta para cada menú desplegable.

> **[Captura: Paso 5]**
> *Selección de respuestas en el formulario de preguntas de seguridad.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Selección de respuestas en el formulario de preguntas de seguridad. (Vista en dispositivo móvil).*

6. **Envío de validación:** Se debe hacer clic en **"Validar Identidad"**.

> **[Captura: Paso 6]**
> *Clic en el botón Validar Identidad.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Clic en el botón Validar Identidad. (Vista en dispositivo móvil).*

7. **Restablecimiento:** Si es correcto, aparecerán los campos de nueva contraseña. Se debe digitar la nueva contraseña cumpliendo las políticas de seguridad.

> **[Captura: Paso 7]**
> *Ingreso de la nueva contraseña en los campos correspondientes.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Ingreso de la nueva contraseña en los campos correspondientes. (Vista en dispositivo móvil).*

8. **Confirmación final:** Se debe pulsar el botón **"Guardar nueva contraseña"** para finalizar el proceso. El sistema devolverá al usuario al login.

### 10.2. Panel Administrativo: Interfaz General y Dashboard
Al iniciar sesión con el rol de Administrador y ser dirigido al Panel Administrativo, el usuario encontrará un entorno compuesto por un menú lateral de navegación y un área central de trabajo.

#### 10.2.1. Navegación Lateral y Menú de Perfil
El menú lateral izquierdo concentra todas las herramientas de acceso rápido del sistema:

1. **Redirección al Sitio Web:** En la parte superior, al hacer clic sobre el logo blanco del Observatorio Laboral y Ocupacional (OLO), el sistema actuará como un botón de retorno, llevando al administrador de vuelta a la página principal del sitio web público.
2. **Alertas de revisión pendientes:** En el menú lateral, si existen borradores enviados por los editores, el ítem **"Páginas en revisión"** mostrará un círculo rojo con el número exacto de solicitudes pendientes.
3. **Menú de Perfil y Campanita:** En la parte inferior, junto al correo del usuario, se ubica el ícono de campana para alertas generales. Al hacer clic sobre el nombre o foto de perfil, se desplegará un menú oscuro con las opciones **"Mi perfil"**, **"Configuración"** y el botón de salida segura **"Cerrar sesión"**.

> **[Captura: Navegación y Perfil Admin]**
> *Menú lateral mostrando el logo superior (retorno al sitio web), la alerta numérica roja en revisión y el menú desplegable de perfil.*
>
> **[Captura: Navegación y Perfil Admin (Móvil)]**
> *Menú lateral mostrando el logo superior (retorno al sitio web), la alerta numérica roja en revisión y el menú desplegable de perfil. (Vista en dispositivo móvil).*

#### 10.2.2. Tablero Principal (Dashboard)
En la vista central inicial, se presentan los indicadores clave de la plataforma:

1. **Tarjetas de métricas (Cards):** En la zona superior, se visualizará una serie de tarjetas numéricas que resumen el estado actual del sistema (ej. "Usuarios Activos", "Páginas Publicadas", "Borradores en Revisión").

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Vista en dispositivo móvil).*

2. **Gráficos de actividad:** En la zona central, diagramas de barras o líneas mostrarán el flujo de visitas al observatorio o la frecuencia de actualizaciones en las últimas semanas.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

3. **Actividad reciente:** En la parte inferior o lateral, un panel resumido muestra las últimas 5 acciones ejecutadas en la plataforma, permitiéndole un vistazo rápido de quién está operando el sistema.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*



### 10.3. Panel Administrativo: Accesos (Usuarios y Roles)
En la barra de navegación lateral izquierda del panel, al desplegar la pestaña **"Accesos"**, se encontrarán dos submenús críticos para el control de la plataforma:

#### 10.3.1. Submenú: Usuarios
1. **Acceso al módulo:** En el menú lateral izquierdo, se debe desplegar "Accesos" y hacer clic en **"Usuarios"**.

> **[Captura: Paso 1]**
> *Ubicación y clic en el submenú de Usuarios.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación y clic en el submenú de Usuarios. (Vista en dispositivo móvil).*

2. **Apertura del formulario:** En la esquina superior derecha de la tabla, se debe hacer clic en el botón **"Crear Usuario"**.

> **[Captura: Paso 2]**
> *Ubicación del botón Crear Usuario.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Ubicación del botón Crear Usuario. (Vista en dispositivo móvil).*

3. **Diligenciamiento de datos:** En la ventana emergente, se debe escribir el nombre completo y el correo corporativo (`@sena.edu.co`) del nuevo funcionario.

> **[Captura: Paso 3]**
> *Ingreso de datos personales en el formulario modal.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ingreso de datos personales en el formulario modal. (Vista en dispositivo móvil).*

4. **Asignación de rol:** Se debe desplegar el menú de roles y seleccionar el perfil adecuado (Director, Editor, Administrador).

> **[Captura: Paso 4]**
> *Selección del rol desde la lista desplegable.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Selección del rol desde la lista desplegable. (Vista en dispositivo móvil).*

5. **Guardado:** Se debe hacer clic en el botón **"Guardar usuario"** para registrar la cuenta en el sistema.

> **[Captura: Paso 5]**
> *Clic en el botón Guardar para confirmar la creación.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Clic en el botón Guardar para confirmar la creación. (Vista en dispositivo móvil).*

6. **Edición o Suspensión:** Si se desea modificar un usuario existente, se debe ubicar en la tabla y hacer clic en el ícono de **Lápiz** (para editar) o en el **Interruptor** (para suspender).

> **[Captura: Paso 6]**
> *Uso de los botones de acción en la fila de un usuario.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Uso de los botones de acción en la fila de un usuario. (Vista en dispositivo móvil).*

#### 10.3.2. Submenú: Roles
1. **Vista principal:** Muestra la lista de roles creados en la plataforma (recordando que todos derivan de la jerarquía Editor).

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Vista en dispositivo móvil).*

2. **Botón "Crear Rol":** Ubicado en la esquina superior derecha.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

3. **Formulario de Permisos:** Al crear o editar un rol, la pantalla muestra una lista de módulos y páginas. Junto a cada uno, existen **botones tipo interruptor (switch)** (encendido/apagado) para habilitar permisos de lectura, creación, edición o eliminación de forma manual (permisos granulares). Se confirman los cambios con el botón **"Guardar Rol"**.
   * *Delegación de páginas nuevas a otros roles:* Cuando un editor crea una página nueva en el sistema, esta solo queda habilitada automáticamente para el rol creador, para el rol base Editor y para el Administrador. Si otros roles hijos requieren intervenir o editar esa página, el Administrador debe ingresar a este submenú, pulsar en **"Editar Rol"** sobre el perfil correspondiente y activar manualmente el interruptor de edición para dicha página.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*

### 10.3.3. Eliminación de Roles (Submenú: Roles)

1. **Verificación previa:** El Administrador debe confirmar que ningún usuario activo tenga ese rol asignado. Si existen usuarios con el rol, el sistema bloqueará la eliminación.

> **[Captura: Bloqueo Eliminar Rol]**
> *Alerta del sistema bloqueando la eliminación de un rol que aún tiene usuarios asignados.*
>
> **[Captura: Bloqueo Eliminar Rol (Móvil)]**
> *Alerta del sistema bloqueando la eliminación de un rol que aún tiene usuarios asignados. (Vista en dispositivo móvil).*

2. **Reasignación obligatoria:** Si el rol tiene usuarios asignados, el Administrador debe primero editar cada uno de esos usuarios (sección 10.3.1, paso 6) y asignarles otro rol antes de continuar.

3. **Eliminación del rol:** Una vez el rol no tenga usuarios asignados, en la lista de roles se debe hacer clic en el **ícono de basurero** de la fila correspondiente.

4. **Confirmación:** El sistema mostrará una ventana de confirmación. Se debe hacer clic en **"Eliminar rol"** para confirmar. La acción quedará registrada en la bitácora de auditoría.



### 10.4. Panel Administrativo: Páginas en Revisión
Módulo vital para el flujo de publicación, accesible desde el menú lateral bajo **"Páginas en Revisión"**.

1. **Acceso a la bandeja:** Se debe hacer clic en el ítem **"Páginas en Revisión"** en el menú lateral.

> **[Captura: Paso 1]**
> *Clic en el ítem Páginas en Revisión.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Clic en el ítem Páginas en Revisión. (Vista en dispositivo móvil).*

2. **Revisión de la tabla:** El sistema mostrará la lista de borradores. Se debe identificar la página a evaluar.

> **[Captura: Paso 2]**
> *Tabla de borradores pendientes mostrando título y editor.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Tabla de borradores pendientes mostrando título y editor. (Vista en dispositivo móvil).*

3. **Previsualización:** Se debe hacer clic en el botón con **ícono de Ojo** en la fila del borrador.

> **[Captura: Paso 3]**
> *Clic en el botón de previsualización.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Clic en el botón de previsualización. (Vista en dispositivo móvil).*

4. **Verificación visual:** Se abrirá una ventana inmersiva. Se debe revisar el diseño de la página.

> **[Captura: Paso 4]**
> *Ventana inmersiva mostrando la página.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Ventana inmersiva mostrando la página. (Vista en dispositivo móvil).*

5. **Toma de decisión:** Se debe utilizar uno de los botones de acción: Botón Verde para **Aprobar** (pasa a producción), Botón Naranja para **Rechazar** (devuelve al editor) o el Basurero para **Descartar**.

> **[Captura: Paso 5]**
> *Uso de los botones de decisión.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Uso de los botones de decisión. (Vista en dispositivo móvil).*

### 10.5. Panel Administrativo: Auditoría
Herramienta de control forense, accesible desde el menú lateral bajo **"Auditoría"** o **"Bitácora"**.
1. **Filtros de Búsqueda:** En la parte superior existen barras desplegables para filtrar el historial por fecha (calendario), por correo del usuario que ejecutó la acción, o por tipo de evento (ej. "Borrado", "Edición", "Login"). Botón **"Aplicar Filtros"**.

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Vista en dispositivo móvil).*

2. **Tabla de Registros Inmutables:** Despliega cronológicamente los eventos, mostrando la marca de tiempo (fecha y hora exacta), la dirección IP, el actor y el detalle técnico de la operación realizada. Estos registros no poseen botón de eliminación, garantizando transparencia total.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

### 10.5.1. Exportación de la Bitácora de Auditoría

Tras aplicar los filtros deseados, el sistema permite exportar los registros visibles en la tabla:

1. **Botón de exportación:** En la parte superior derecha de la tabla de auditoría, hacer clic en el botón **"Exportar"**.
2. **Selección de formato:** El sistema ofrecerá los formatos de descarga disponibles (`.xlsx` o `.csv`).
3. **Descarga:** El archivo se generará con los registros actualmente filtrados y se descargará automáticamente al dispositivo del Administrador.

> **[Captura: Exportar Auditoría]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles.*
>
> **[Captura: Exportar Auditoría (Móvil)]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles. (Vista en dispositivo móvil).*

> **Nota sobre retención de registros:** La bitácora conserva el historial de eventos de forma permanente e indefinida. Los registros no tienen fecha de expiración y no pueden ser eliminados por ningún rol.

#### Tipos de Eventos Registrados en la Bitácora

| Tipo de Evento | Descripción |
| :--- | :--- |
| `LOGIN` | Inicio de sesión exitoso |
| `LOGIN_FAILED` | Intento de inicio de sesión fallido |
| `LOGOUT` | Cierre de sesión |
| `USER_CREATED` | Creación de nuevo usuario |
| `USER_UPDATED` | Modificación de datos de usuario |
| `USER_SUSPENDED` | Suspensión de cuenta |
| `ROLE_CREATED` | Creación de nuevo rol |
| `ROLE_UPDATED` | Modificación de permisos de un rol |
| `ROLE_DELETED` | Eliminación de un rol |
| `PAGE_CREATED` | Creación de nueva página |
| `PAGE_DRAFT_SAVED` | Guardado de borrador |
| `PAGE_SENT_TO_REVIEW` | Envío de borrador a revisión |
| `PAGE_APPROVED` | Aprobación y publicación de página |
| `PAGE_REJECTED` | Rechazo de borrador con observaciones |
| `PAGE_DRAFT_DISCARDED` | Descarte de borrador (botón de basurero) |
| `PAGE_DELETED` | Eliminación definitiva de página |
| `DATA_BULK_UPLOAD` | Carga masiva de datos en Excel |
| `BACKUP_GENERATED` | Generación de respaldo de base de datos |
| `PASSWORD_RESET` | Restablecimiento de contraseña |
| `SECURITY_QUESTIONS_UPDATED` | Actualización de preguntas de seguridad |



### 10.6. Panel Administrativo: Respaldos
Espacio técnico y de salvaguarda, ubicado en el menú lateral como **"Respaldos"** (o "Backups").
1. **Vista de copias de seguridad:** Lista los respaldos históricos de las bases de datos (si el sistema tiene configurado el historial visual).

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Vista en dispositivo móvil).*

2. **Botón "Generar Respaldo Manual":** Botón de acción principal que ordena al sistema crear un volcado inmediato de la base de datos y de la configuración del sistema.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

3. **Descarga de archivos:** Cada fila de respaldo generado incluye un botón con **Ícono de Descarga (Nube con flecha)** para guardar el archivo `.sql` o `.zip` en el almacenamiento local del administrador.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*

### 10.6.1. Frecuencia y Restauración de Respaldos

#### Respaldos Automáticos

El sistema genera respaldos automáticos con la siguiente frecuencia:

* **Respaldo diario:** Se ejecuta automáticamente cada día a las **2:00 a.m.** (hora del servidor).
* **Retención:** El sistema conserva los últimos **30 respaldos diarios**. Los respaldos más antiguos son eliminados automáticamente al superar este límite.
* **Respaldos manuales:** Los generados manualmente por el Administrador no cuentan dentro del límite de 30 y son conservados indefinidamente hasta que el espacio del servidor lo requiera.

> **[Captura: Lista de Respaldos]**
> *Lista de respaldos disponibles mostrando los automáticos y los manuales con su respectiva fecha y tamaño.*
>
> **[Captura: Lista de Respaldos (Móvil)]**
> *Lista de respaldos disponibles mostrando los automáticos y los manuales con su respectiva fecha y tamaño. (Vista en dispositivo móvil).*

#### Restauración de un Respaldo

La restauración es un proceso técnico de alto impacto que **reemplaza toda la base de datos activa** con la versión guardada. Debe ejecutarse únicamente como medida de recuperación ante fallos críticos.

> **⚠️ Advertencia:** Restaurar un respaldo eliminará de forma irreversible todos los cambios realizados después de la fecha del respaldo seleccionado. Esta acción no puede deshacerse.

Para solicitar la restauración, el Administrador debe contactar al equipo técnico responsable del servidor, ya que esta operación se ejecuta a nivel de infraestructura y no está disponible como botón de autoservicio dentro del Panel Administrativo.

### 10.7. Panel Administrativo: Carga Masiva de Datos en Excel

Módulo exclusivo del Administrador para importar o actualizar de forma masiva datos institucionales, estadísticas e indicadores del observatorio.

#### 10.7.1. Preparación del Archivo Excel

Antes de realizar la carga, el archivo debe estar correctamente estructurado:

* **Formato obligatorio:** `.xlsx` (Excel 2007 o superior). No se aceptan archivos `.xls`, `.csv` ni otros formatos.
* **Estructura de columnas:** El sistema espera columnas en un orden y con encabezados específicos. Para obtener la plantilla oficial con los encabezados correctos, se debe descargar desde el módulo de carga (ver paso 2).
* **Límite de filas:** Se recomienda no superar las **10.000 filas** por carga para garantizar el rendimiento del sistema.
* **Celdas vacías:** Las celdas vacías en columnas obligatorias generarán errores de validación. El usuario debe verificar que todos los campos requeridos se encuentren diligenciados antes de realizar la carga.

#### 10.7.2. Flujo de Carga Masiva Paso a Paso

1. **Acceso al módulo:** En el menú lateral del Panel Administrativo, se debe hacer clic en **"Carga Masiva"** o **"Datos"**.

> **[Captura: Paso 1]**
> *Ubicación del módulo de Carga Masiva en el menú lateral del Panel Administrativo.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del módulo de Carga Masiva en el menú lateral del Panel Administrativo. (Vista en dispositivo móvil).*

2. **Descarga de plantilla:** Se debe hacer clic en el enlace **"Descargar plantilla Excel"** para obtener el archivo base con los encabezados correctos y un ejemplo de fila como referencia.

> **[Captura: Paso 2]**
> *Enlace de descarga de la plantilla oficial con la estructura de columnas requerida.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Enlace de descarga de la plantilla oficial con la estructura de columnas requerida. (Vista en dispositivo móvil).*

3. **Selección del archivo:** Se debe hacer clic en el botón **"Seleccionar archivo"** o arrastrar el archivo `.xlsx` preparado directamente hacia la zona de arrastre habilitada (área punteada en el centro del módulo).

> **[Captura: Paso 3]**
> *Zona de arrastre (drag and drop) para la selección del archivo Excel a importar.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Zona de arrastre para la selección del archivo Excel a importar. (Vista en dispositivo móvil).*

4. **Validación previa (pre-vuelo):** Tras seleccionar el archivo, el sistema ejecutará automáticamente una validación de estructura y formato. Si detecta errores (columnas faltantes, tipos de dato incorrectos, celdas obligatorias vacías), mostrará una tabla de errores detallada indicando la **fila** y la **columna** problemática. Se deberá corregir el archivo y volver al paso 3.

> **[Captura: Paso 4 — Errores]**
> *Tabla de errores de validación indicando las filas y columnas con problemas detectados antes de la carga.*
>
> **[Captura: Paso 4 — Errores (Móvil)]**
> *Tabla de errores de validación indicando las filas y columnas con problemas detectados. (Vista en dispositivo móvil).*

5. **Inicio de la carga:** Si el archivo pasa la validación sin errores, el botón **"Iniciar carga"** se habilitará. Se debe hacer clic para comenzar el proceso de importación.

> **[Captura: Paso 5]**
> *Botón "Iniciar carga" habilitado tras pasar la validación sin errores.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Botón "Iniciar carga" habilitado tras pasar la validación sin errores. (Vista en dispositivo móvil).*

6. **Barra de progreso:** El sistema mostrará una barra de progreso con el porcentaje completado. No se debe cerrar el navegador ni navegar fuera del módulo mientras la carga esté en proceso.

> **[Captura: Paso 6]**
> *Barra de progreso de la carga masiva mostrando el porcentaje de avance.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Barra de progreso de la carga masiva mostrando el porcentaje de avance. (Vista en dispositivo móvil).*

7. **Confirmación de éxito:** Al finalizar, el sistema mostrará un resumen con el número de registros **procesados**, **creados**, **actualizados** y **omitidos**. Una notificación *toast* verde confirmará que la operación fue exitosa y el evento quedará registrado en la bitácora de auditoría.

> **[Captura: Paso 7]**
> *Resumen de resultados de la carga masiva con el conteo de registros procesados, creados, actualizados y omitidos.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Resumen de resultados de la carga masiva. (Vista en dispositivo móvil).*

### 10.8. Instalación como Aplicación Web Progresiva (PWA)

La plataforma del OLO puede instalarse en el dispositivo del usuario como una aplicación independiente.

#### 10.8.1. Instalación en Computador de Escritorio (Chrome / Edge)

1. El usuario debe abrir el portal del OLO en un navegador web compatible.
2. En la barra de direcciones superior, se debe hacer clic en el **ícono de instalación** (pantalla con flecha hacia abajo) o acceder al menú de tres puntos del navegador y seleccionar la opción **"Instalar [nombre de la aplicación]..."**.

> **[Captura: Instalar PWA Desktop]**
> *Ícono de instalación de PWA visible en la barra de direcciones del navegador de escritorio.*

3. En el cuadro de diálogo emergente, se debe hacer clic en **"Instalar"** para autorizar el procedimiento.
4. La aplicación se abrirá en una ventana independiente y el sistema operativo creará un acceso directo en el escritorio y en el menú de aplicaciones.

#### 10.8.2. Instalación en Dispositivo Móvil (Android — Chrome)

1. El usuario debe acceder al portal del OLO desde el navegador Google Chrome en su dispositivo móvil.
2. El navegador desplegará una notificación inferior con el texto **"Añadir a pantalla de inicio"**, en la cual se debe pulsar para continuar.
3. De forma alternativa, el usuario puede abrir el menú principal del navegador (ícono de tres puntos) y seleccionar la opción **"Añadir a pantalla de inicio"**.
4. Finalmente, se debe confirmar el nombre de la aplicación y pulsar en **"Añadir"**.

#### 10.8.3. Instalación en Dispositivo Móvil (iOS — Safari)

1. El usuario debe ingresar al portal del OLO desde el navegador Safari en su dispositivo iOS.
2. Se debe presionar el botón de **compartir** (ícono de recuadro con flecha vertical) ubicado en la barra de navegación inferior.
3. En el menú desplegado, se debe seleccionar la opción **"Agregar a pantalla de inicio"**.
4. Se debe confirmar el nombre asignado a la aplicación y pulsar en **"Agregar"** en la esquina superior derecha.

> **[Captura: PWA iOS]**
> *Secuencia de pasos para agregar la PWA a la pantalla de inicio en un dispositivo iOS con Safari.*

### 10.9. Panel Administrativo: Perfil de Usuario ("Mi perfil" y "Configuración")

Accesible desde el menú desplegable de perfil ubicado en la parte inferior del menú lateral del Panel Administrativo. Permite al Administrador —y a cualquier usuario autenticado con acceso al panel— gestionar su información personal y preferencias.

#### 10.9.1. Sección "Mi Perfil"

Contiene la información de identificación del usuario dentro del sistema:

* **Nombre completo:** Nombre registrado en la cuenta. Puede ser actualizado por el propio usuario desde este campo.
* **Correo corporativo:** Muestra el correo `@sena.edu.co` vinculado a la cuenta. Este campo es de solo lectura y no puede ser modificado por el usuario; cualquier cambio de correo debe ser gestionado por el Administrador.
* **Foto de perfil:** Campo opcional. El usuario puede subir una imagen desde su dispositivo (formatos permitidos: `.jpg`, `.png`; tamaño máximo: 2 MB).
* **Rol asignado:** Muestra el rol activo del usuario en el sistema (solo lectura).
* **Cambio de contraseña:** Permite al usuario actualizar su contraseña actual sin necesidad de pasar por el flujo de recuperación. Para ello, se debe ingresar la contraseña actual, la nueva contraseña y su confirmación, cumpliendo la política de seguridad (sección 6.3).

> **[Captura: Mi Perfil]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, foto, correo y cambio de contraseña.*
>
> **[Captura: Mi Perfil (Móvil)]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, foto, correo y cambio de contraseña. (Vista en dispositivo móvil).*

Flujo para actualizar los datos:
1. El usuario modifica los campos deseados en el formulario.
2. Se debe hacer clic en el botón **"Guardar cambios"**.
3. El sistema muestra una notificación *toast* verde confirmando la actualización exitosa de la información.

#### 10.9.2. Sección "Configuración"

Contiene las preferencias operativas del usuario:

* **Actualización de preguntas de seguridad:** Permite al usuario reconfigurar sus tres preguntas y respuestas de seguridad. Requiere confirmar la contraseña actual antes de realizar cambios.
* **Notificaciones:** Activa o desactiva la recepción de alertas del sistema (ej. notificación cuando un borrador es aprobado o rechazado).

> **[Captura: Configuración Usuario]**
> *Vista del módulo "Configuración" en el Panel Administrativo con las opciones de preguntas de seguridad y notificaciones.*
>
> **[Captura: Configuración Usuario (Móvil)]**
> *Vista del módulo "Configuración" en el Panel Administrativo con las opciones de preguntas de seguridad y notificaciones. (Vista en dispositivo móvil).*



---

## 11. Consultas y búsquedas

### 11.1. Uso del Buscador Global
El sistema cuenta con un motor de búsqueda global accesible desde la cabecera. El proceso para realizar una consulta es el siguiente:

1. **Ubicación de la barra:** En la parte superior de la interfaz, se debe ubicar el campo de texto con el ícono de lupa correspondiente al buscador rápido.

> **[Captura: Paso 1]**
> *Ubicación del buscador global en la cabecera.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del buscador global en la cabecera. (Vista en dispositivo móvil).*

2. **Ingreso de términos:** Se deben digitar las palabras clave relacionadas con la temática, contenido, boletín o documento que se desea localizar.

> **[Captura: Paso 2]**
> *Ingreso de términos clave en el campo de texto del buscador.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Ingreso de términos clave en el campo de texto del buscador. (Vista en dispositivo móvil).*

3. **Ejecución y resultados:** Al presionar la tecla *Enter* o hacer clic en la lupa, el sistema procesará la solicitud y cargará una página con la lista de resultados organizados por relevancia.

> **[Captura: Paso 3]**
> *Página de resultados desplegando las coincidencias encontradas por el sistema.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Página de resultados desplegando las coincidencias encontradas por el sistema. (Vista en dispositivo móvil).*

### 11.2. Búsqueda con Filtros Avanzados y Consulta de Información
Para consultas específicas en catálogos y listados, el sistema ofrece herramientas de segmentación y filtrado dinámico:

1. **Apertura de filtros:** En la vista correspondiente, se debe ubicar el panel lateral (o menú desplegable en dispositivos móviles) de "Filtros Avanzados".

> **[Captura: Paso 1]**
> *Ubicación del panel de filtros avanzados en la vista de consulta.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del panel de filtros avanzados en la vista de consulta. (Vista en dispositivo móvil).*

2. **Selección de criterios:** Se pueden marcar casillas o seleccionar opciones en menús desplegables para filtrar por categorías, áreas temáticas, niveles o palabras clave. El listado de resultados se actualizará dinámicamente según las opciones seleccionadas.

> **[Captura: Paso 2]**
> *Selección de criterios específicos en el panel de filtros.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Selección de criterios específicos en el panel de filtros. (Vista en dispositivo móvil).*

3. **Visualización de detalles y fichas informativas:** Al hacer clic sobre cualquiera de los registros listados, el sistema despliega su vista en detalle o ficha técnica con la información completa del elemento seleccionado.

> **[Captura: Paso 3]**
> *Vista en detalle o ficha informativa del registro seleccionado.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Vista en detalle o ficha informativa del registro seleccionado. (Vista en dispositivo móvil).*

4. **Descargas y visualización de documentos (Visor de PDF):** Si el usuario requiere consultar o conservar un respaldo formal de la información, puede utilizar los botones de **"Descargar Documento"** o **"Exportar PDF"** disponibles en la interfaz, o bien explorar el documento directamente mediante el visor de PDFs integrado.

> **[Captura: Paso 4]**
> *Botón de descarga o exportación dentro de la ficha de información.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Botón de descarga o exportación dentro de la ficha de información. (Vista en dispositivo móvil).*

### 11.3. Buscador Interno del Panel Administrativo
El Panel Administrativo cuenta con su propia herramienta de búsqueda para facilitar la gestión de usuarios, roles, registros de auditoría y páginas en revisión. El flujo de uso es el siguiente:

1. **Ubicación de la barra interna:** En la parte superior del Panel Administrativo (o justo encima de la tabla de datos correspondiente), se debe ubicar el campo de búsqueda rápida.

> **[Captura: Paso 1]**
> *Barra de búsqueda interna ubicada en el entorno del Panel Administrativo.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Barra de búsqueda interna ubicada en el entorno del Panel Administrativo. (Vista en dispositivo móvil).*

2. **Ingreso del criterio a gestionar:** Se debe digitar la palabra clave relacionada con el dato que se requiere (por ejemplo, el nombre de un funcionario, un correo corporativo, o el título de un borrador). El sistema filtrará instantáneamente los registros de la tabla.

> **[Captura: Paso 2]**
> *Filtro dinámico en acción mostrando únicamente los resultados que coinciden con el término ingresado.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Filtro dinámico en acción mostrando únicamente los resultados que coinciden con el término ingresado. (Vista en dispositivo móvil).*

3. **Interacción con el resultado:** Una vez el registro deseado aparezca aislado en la tabla, el Administrador puede utilizar los botones de acción habituales (editar, descartar, suspender) de forma directa.

> **[Captura: Paso 3]**
> *Uso de los botones de acción sobre el registro filtrado y aislado en la tabla.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Uso de los botones de acción sobre el registro filtrado y aislado en la tabla. (Vista en dispositivo móvil).*

---

## 12. Gestión de información (Editor Visual)

Esta sección aborda el uso de la herramienta del Editor Visual, exclusiva para usuarios con rol de Editor, mediante la cual se diseña y actualiza el contenido del portal.

### 12.1. Acceso a las opciones de Edición (Botón Flotante)
1. **Visualización del botón:** Al iniciar sesión como Editor, se debe ubicar el **botón circular flotante con un ícono de lápiz** en la pantalla del portal.

> **[Captura: Paso 1]**
> *Ubicación del botón flotante de edición.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Ubicación del botón flotante de edición. (Vista en dispositivo móvil).*

2. **Despliegue del menú:** Se debe hacer clic sobre el botón circular. Se desplegará un menú con cuatro opciones (Editar pie, Editar página, Crear página, Eliminar página).

> **[Captura: Paso 2]**
> *Menú de opciones desplegado.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Menú de opciones desplegado. (Vista en dispositivo móvil).*

### 12.2. Creación y Edición en el Lienzo
1. **Creación:** Se debe seleccionar la opción **"Crear página"** en el menú del botón flotante; el sistema solicitará digitar un título y una ruta URL. Al completar y confirmar el formulario, la nueva página se crea en estado de borrador.
   * *Asignación automática de permisos:* De forma inmediata, el sistema habilita el permiso de edición únicamente para el rol del editor que la creó, para el rol padre Editor base y para el Administrador. Los demás roles hijos de editor quedan sin acceso a la página a menos que un Administrador les conceda el permiso manualmente desde el Panel Administrativo (**Accesos > Roles > Editar Rol**).

> **[Captura: Paso 1]**
> *Formulario de título y URL para la nueva página.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Formulario de título y URL para la nueva página. (Vista en dispositivo móvil).*

2. **Acceso al lienzo:** Al crear o al seleccionar **"Editar página"**, se abrirá la interfaz del Editor Visual dividida en tres paneles (catálogo, lienzo y propiedades).

> **[Captura: Paso 2]**
> *Interfaz de 3 paneles del Editor Visual.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Interfaz de 3 paneles del Editor Visual. (Vista en dispositivo móvil).*

3. **Arrastrar componente:** Se debe hacer clic sostenido sobre un componente del panel izquierdo y arrastrarlo hacia el centro.

> **[Captura: Paso 3]**
> *Acción de arrastrar un componente al lienzo.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Acción de arrastrar un componente al lienzo. (Vista en dispositivo móvil).*

4. **Soltar componente:** Se debe soltar el clic para que el componente quede fijado en el lienzo de trabajo.

> **[Captura: Paso 4]**
> *Componente fijado en el lienzo central.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Componente fijado en el lienzo central. (Vista en dispositivo móvil).*

5. **Configuración de propiedades:** Se debe hacer clic sobre el componente recién colocado. El panel derecho mostrará sus campos editables (textos, colores, imágenes).

> **[Captura: Paso 5]**
> *Panel derecho habilitado con las propiedades del componente.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Panel derecho habilitado con las propiedades del componente. (Vista en dispositivo móvil).*

6. **Ingreso de contenido:** Se deben digitar los textos o cargar las imágenes necesarias en el panel derecho. Los cambios se reflejarán en tiempo real en el centro.

> **[Captura: Paso 6]**
> *Ingreso de datos y visualización en tiempo real.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Ingreso de datos y visualización en tiempo real. (Vista en dispositivo móvil).*

7. **Guardado y Revisión:** Finalmente, se debe hacer clic en el botón superior **"Guardar Borrador"** o **"Enviar a revisión"** para terminar el trabajo.

> **[Captura: Paso 7]**
> *Clic en los botones de guardado o revisión.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Clic en los botones de guardado o revisión. (Vista en dispositivo móvil).*

### 12.3. Gestión Avanzada en el Editor Visual

Esta sección complementa la sección 12.2, cubriendo las operaciones sobre componentes ya colocados en el lienzo.

#### 12.3.1. Reordenar Componentes en el Lienzo

1. **Selección del componente:** El usuario debe hacer clic sobre el componente que desea mover. El sistema resaltará un borde de selección a su alrededor.
2. **Arrastre de reposicionamiento:** Se debe mantener presionado el botón izquierdo del ratón sobre la barra de control superior del componente (ícono de agarradera de seis puntos) y desplazarlo hacia la nueva posición requerida.
3. **Soltado:** Al soltar el botón del ratón, el componente queda fijado en su nueva ubicación y el lienzo reorganiza los demás bloques de forma automática.

> **[Captura: Reordenar Componente]**
> *Arrastre de un componente seleccionado hacia una nueva posición en el lienzo del Editor Visual.*
>
> **[Captura: Reordenar Componente (Móvil)]**
> *Arrastre de un componente seleccionado hacia una nueva posición en el lienzo del Editor Visual. (Vista en dispositivo móvil).*

#### 12.3.2. Eliminar un Componente del Lienzo

1. **Selección:** Se debe hacer clic sobre el componente que se desea retirar del lienzo.
2. **Botón de eliminación:** En la barra de control superior del componente seleccionado, se debe hacer clic en el **ícono de basurero** (destacado en rojo).
3. **Resultado:** El componente se retira del lienzo de manera inmediata. Esta acción puede revertirse mediante la función Deshacer (sección 12.3.3) mientras no se guarde el borrador.

> **[Captura: Eliminar Componente]**
> *Barra de control del componente seleccionado mostrando el ícono de basurero para su eliminación.*
>
> **[Captura: Eliminar Componente (Móvil)]**
> *Barra de control del componente seleccionado mostrando el ícono de basurero para su eliminación. (Vista en dispositivo móvil).*

#### 12.3.3. Deshacer y Rehacer Cambios

El Editor Visual dispone de un historial de acciones en sesión:

* **Deshacer (Ctrl + Z / Cmd + Z):** Revierte la última acción realizada en el lienzo. Puede aplicarse múltiples veces de forma consecutiva.
* **Rehacer (Ctrl + Y / Cmd + Shift + Z):** Vuelve a aplicar la acción que fue deshecha.

> **Nota importante:** El historial de deshacer/rehacer es exclusivo de la sesión activa de edición. Al hacer clic en **"Guardar Borrador"** o al cerrar el editor, el historial se reinicia y no es posible revertir los cambios guardados mediante esta función.

> **[Captura: Botones Deshacer Rehacer]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual.*
>
> **[Captura: Botones Deshacer Rehacer (Móvil)]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual. (Vista en dispositivo móvil).*

#### 12.3.4. Edición de la Cabecera y Pie de Página Globales

La cabecera y el pie de página son componentes institucionales globales. Su edición está disponible para el rol **Editor base** y para los **Roles hijos** a quienes el Administrador haya habilitado explícitamente este permiso.

1. **Acceso:** Desde el menú del botón flotante de edición en cualquier página, el usuario debe seleccionar la opción **"Editar cabecera"** o **"Editar pie"**.

> **[Captura: Menú Editar Cabecera]**
> *Opción de edición de cabecera en el menú flotante del editor.*
>
> **[Captura: Menú Editar Cabecera (Móvil)]**
> *Opción de edición de cabecera en el menú flotante del editor. (Vista en dispositivo móvil).*

2. **Lienzo de cabecera/pie:** Se abrirá el Editor Visual en modo de edición del componente global seleccionado. Los cambios aquí realizados se propagarán a **todas las páginas del portal simultáneamente**.

> **⚠️ Advertencia:** Dado que la cabecera y el pie son globales, cualquier modificación aprobada afectará la apariencia de toda la plataforma. Se recomienda especial cuidado y la previsualización detallada antes de enviar a revisión.

3. **Guardado:** Al finalizar, se debe hacer clic en **"Guardar Borrador"** y enviar a revisión. El Administrador deberá aprobar los cambios antes de que sean visibles en el portal.


## 13. Reportes y visualización de recursos

La plataforma ofrece múltiples formas de consultar y explorar la información generada por el observatorio. Dado que las páginas son editables mediante bloques, los editores pueden disponer estos componentes en distintas secciones según los requerimientos del momento:

### 13.1. Uso de tableros BI en la Intranet (Power BI)
En las secciones analíticas de la Intranet, los directivos y funcionarios autorizados pueden consultar tableros interactivos de Power BI embebidos. Utilizando los controles internos del tablero (filtros por período, región o sector), los gráficos y tablas se actualizan en tiempo real sin recargar la página.

> **[Captura: Tablero BI]**
> *Tablero interactivo de Power BI embebido en la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis.*
>
> **[Captura: Tablero BI (Móvil)]**
> *Tablero interactivo de Power BI embebido en la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis. (Vista en dispositivo móvil).*

### 13.2. Visor de PDFs y Documentos Normativos
El componente de visor de documentos permite a los usuarios leer y revisar archivos PDF oficiales (boletines, resoluciones, manuales o informes) directamente dentro de la interfaz del portal, con controles integrados de navegación de páginas y opción de lectura inmersiva.

> **[Captura: Visor de PDF]**
> *Visor de documentos y publicaciones en PDF integrado en la página.*
>
> **[Captura: Visor de PDF (Móvil)]**
> *Visor de documentos y publicaciones en PDF integrado en la página. (Vista en dispositivo móvil).*

### 13.3. Visor de Videos y Recursos Multimedia
A través del bloque de recursos visuales, los usuarios pueden reproducir contenido audiovisual institucional y cápsulas informativas directamente en la página, con controles de reproducción estándar y adaptabilidad a dispositivos móviles.

> **[Captura: Visor de Videos]**
> *Bloque de recursos audiovisuales con reproductor de video institucional.*
>
> **[Captura: Visor de Videos (Móvil)]**
> *Bloque de recursos audiovisuales con reproductor de video institucional. (Vista en dispositivo móvil).*

### 13.4. Descarga directa de archivos y boletines
En las distintas páginas del portal y de la Intranet, los documentos cuentan con botones estandarizados de **"Descargar Documento"** o enlaces de descarga directa. Los archivos se suministran en formatos estandarizados (como PDF o planillas), listos para su consulta y archivo fuera de línea.

---

## 14. Mensajes del sistema

### 14.1. Confirmaciones de éxito
Cuando una acción se ejecuta correctamente (ej. "Usuario creado", "Página enviada a revisión", "Carga masiva completada"), el sistema muestra una notificación tipo *toast* (barra emergente verde) en la parte superior derecha de la pantalla, que desaparece a los pocos segundos.

> **[Captura: Imagen]**
> *Notificación verde emergente (toast) en la esquina superior de la pantalla confirmando el éxito de la operación.*
>
> **[Captura: Imagen (Móvil)]**
> *Notificación verde emergente (toast) en la esquina superior de la pantalla confirmando el éxito de la operación. (Vista en dispositivo móvil).*

### 14.2. Ventanas de alerta y validaciones de seguridad
Para acciones críticas, el sistema interrumpe el flujo con una ventana emergente en el centro de la pantalla. Por ejemplo, al intentar descartar un borrador, la ventana exigirá que se digite una justificación antes de habilitar el botón de confirmación en rojo.

> **[Captura: Imagen]**
> *Ventana de alerta crítica interrumpiendo el flujo operativo para exigir una justificación antes de ejecutar acciones destructivas.*
>
> **[Captura: Imagen (Móvil)]**
> *Ventana de alerta crítica interrumpiendo el flujo operativo para exigir una justificación antes de ejecutar acciones destructivas. (Vista en dispositivo móvil).*

### 14.3. Prevención de enlaces rotos (Bloqueos de eliminación)
Si un editor o administrador intenta eliminar una página hacia la cual apuntan otros botones en el portal, el sistema arrojará una alerta roja de bloqueo. No se permitirá la eliminación hasta que los enlaces entrantes sean retirados.

### 14.4. Errores habituales y solución

**Situación:** Alerta de "Correo institucional inválido".
**Posible causa:** Intento de inicio de sesión con un correo fuera del dominio `@sena.edu.co`.
**Acción recomendada:** El usuario debe ingresar estrictamente la cuenta corporativa oficial asignada por la entidad.

**Situación:** Alerta de "Credenciales incorrectas".
**Posible causa:** Se ha digitado mal la contraseña o el correo electrónico.
**Acción recomendada:** Se debe verificar la escritura correcta de los datos o hacer uso de la opción "Recuperar contraseña".

**Situación:** Mensaje de "Permisos insuficientes".
**Posible causa:** El rol asignado al usuario no tiene autorización para acceder a esa URL o ejecutar esa acción.
**Acción recomendada:** El usuario debe solicitar al Administrador del sistema la revisión y asignación del permiso correspondiente.

### 14.5. Mensajes de Error Adicionales

**Situación:** Mensaje de "Sesión expirada. Por favor, inicie sesión de nuevo."
**Posible causa:** La sesión del usuario estuvo inactiva durante más de 30 minutos y el sistema la cerró automáticamente por seguridad.
**Acción recomendada:** Se debe hacer clic en el botón de inicio de sesión e ingresar las credenciales nuevamente. Si existía trabajo no guardado en el editor, el usuario debe comprobar si el sistema conservó el último borrador guardado.

**Situación:** Error al cargar el archivo en la Carga Masiva ("Formato de archivo no válido").
**Posible causa:** El archivo cargado no es un `.xlsx` válido, está corrupto o fue generado con una versión de Excel incompatible.
**Acción recomendada:** Se debe descargar nuevamente la plantilla oficial desde el módulo de carga, trasladar los datos al nuevo archivo y repetir la operación.

**Situación:** El tablero de Power BI en la Intranet no carga o aparece en blanco.
**Posible causa:** (1) La conexión a Internet es inestable o lenta. (2) La sesión de Power BI expiró internamente.
**Acción recomendada:** (1) El usuario debe verificar la conexión a Internet (se recomiendan al menos 10 Mbps para tableros analíticos). (2) Se debe recargar la página con la tecla F5. (3) Si la eventualidad persiste, se debe cerrar sesión y volver a iniciarla.

**Situación:** El Editor Visual no carga o aparece en blanco al intentar editar una página.
**Posible causa:** Caché del navegador desactualizado o incompatibilidad con una versión de navegador antigua.
**Acción recomendada:** Se debe limpiar la caché del navegador (Ctrl + Shift + Delete) y recargar la página, verificando que el navegador cumpla con los requisitos mínimos de la sección 6.2.

**Situación:** Mensaje de "Cuenta suspendida".
**Posible causa:** El Administrador ha suspendido la cuenta del usuario.
**Acción recomendada:** El usuario debe contactar directamente al Administrador del sistema para conocer el motivo de la suspensión y solicitar la reactivación correspondiente.

---

## 15. Preguntas frecuentes (Solución de problemas)

### 15.1. Problemas de acceso por bloqueo
**Situación:** El sistema bloquea el acceso por múltiples intentos fallidos.
**Posible causa:** Se ha ingresado repetidamente una contraseña incorrecta superando el límite de seguridad.
**Acción:** Se debe esperar 15 minutos para que el bloqueo expire automáticamente, o comunicarse con el Administrador para un desbloqueo manual.

### 15.2. Visibilidad de páginas editadas
**Situación:** La página recién editada no es visible en el portal público.
**Posible causa:** La página se encuentra en estado de borrador y no ha completado el flujo de revisión.
**Acción:** El editor debe enviar la página a revisión y esperar a que el Administrador la apruebe definitivamente para su publicación.

### 15.3. Bloqueo al intentar eliminar páginas
**Situación:** El sistema no muestra la opción o bloquea el borrado de una página.
**Posible causa:** Se está intentando eliminar una ruta fija del sistema (como las interfaces de inicio de sesión o rutas administrativas), o bien la página seleccionada cuenta con enlaces activos en menús u otras secciones que provocarían errores de navegación 404.
**Acción:** Las rutas fijas del sistema no son eliminables. Si se trata de una página de contenido, se deben retirar primero todos los enlaces activos que apunten hacia ella en el menú institucional y en las demás páginas antes de proceder con el borrado.

### 15.4. Imposibilidad de crear nuevas secciones
**Situación:** Un editor no encuentra o no puede usar la opción para crear páginas nuevas.
**Posible causa:** Al usuario se le asignó un "Rol derivado de Editor" que no tiene activado el permiso manual de "Crear secciones".
**Acción:** El usuario debe solicitar al Administrador del sistema la activación de dicho permiso en el Panel Administrativo.

### 15.5. Timeout de Sesión y Pérdida de Trabajo No Guardado

**Situación:** El editor cierra el navegador o la sesión expira mientras tenía cambios sin guardar en el Editor Visual.
**Posible causa:** Se cerró el navegador accidentalmente, o la sesión expiró por inactividad antes de guardar el borrador.
**Acción:** Al volver a iniciar sesión y acceder a la página que se estaba editando, el sistema intentará recuperar el último borrador guardado. Los cambios realizados después del último guardado manual no podrán recuperarse. Se recomienda usar el botón **"Guardar Borrador"** con frecuencia durante sesiones de edición largas.

---

## 16. Glosario de términos técnicos e institucionales

El presente glosario define y consolida de forma exclusiva los términos, conceptos, siglas y herramientas institucionales que aparecen textualmente a lo largo de las secciones anteriores del presente manual de usuario:

* **Bandeja de Revisión:** Módulo del Panel Administrativo donde el Administrador visualiza y gestiona las versiones y páginas enviadas por los editores para evaluar los cambios propuestos mediante vista previa, permitiendo aprobar su publicación, rechazarlas con observaciones o descartar borradores mediante el botón de basurero.
* **Bitácora de Auditoría:** Historial cronológico permanente e inmutable que registra las acciones realizadas por los usuarios autenticados en la plataforma (quién ejecutó la acción, qué modificó, fecha y hora), garantizando la trazabilidad operativa y la supervisión del sistema.
* **Bloque de Contenido:** Componente prediseñado de interfaz (textos, imágenes, tarjetas informativas, carruseles, acordeones o enlaces) que los editores configuran e incorporan en el editor visual para maquetar las páginas del Sitio Web y la Intranet.
* **Borrador (Modo de Borrador):** Estado de trabajo privado en el que los editores maquetan y estructuran una página sin que los cambios sean visibles al público o en la Intranet, hasta que sean enviados a revisión y aprobados por el Administrador.
* **Botón Flotante (Floating Action Button):** Botón circular ubicado en la interfaz pública que despliega las opciones rápidas de edición, creación y eliminación de páginas para los usuarios con rol de Editor.
* **Carga Masiva en Excel:** Función exclusiva del Administrador para ingresar o actualizar grandes volúmenes de datos institucionales, estadísticas e indicadores mediante planillas de cálculo en formato `.xlsx`.
* **Contraseña (Contraseña Robusta):** Clave requerida para el inicio de sesión institucional, la cual debe cumplir estrictamente con los lineamientos de seguridad establecidos (mínimo 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Dashboard (Tablero Principal):** Pantalla de inicio del Panel Administrativo que resume en tiempo real el estado del sistema mediante tarjetas de métricas numéricas y gráficos de actividad.
* **Descarte de Versión (Botón de Basurero):** Acción de control en la bandeja de revisión que permite al Administrador eliminar definitivamente un borrador no deseado o enviado por error. Exige registrar de forma obligatoria el motivo en la bitácora de auditoría y depura archivos huérfanos sin afectar la versión ya publicada.
* **Diseño Responsivo:** Capacidad de las interfaces del portal web y de la Intranet para adaptarse de manera automática y fluida a diferentes tamaños y resoluciones de pantalla, tanto en computadores de escritorio como en tabletas y dispositivos móviles.
* **Dominio Corporativo (`@sena.edu.co`):** Dominio de correo electrónico oficial e institucional exigido como requisito estricto y excluyente para la creación de cuentas, inicio de sesión y recuperación de contraseña del personal autorizado.
* **Drag and Drop (Arrastrar y Soltar):** Acción interactiva que permite a los editores seleccionar un bloque de contenido con el ratón y moverlo hacia el lienzo de trabajo para maquetar la página.
* **Editor Visual:** Herramienta interactiva de maquetación que permite a los editores y administradores estructurar, diseñar y actualizar visualmente las páginas del Sitio Web y la Intranet mediante bloques y componentes prediseñados.
* **Exportación (Descarga PDF):** Funcionalidad que permite al usuario consolidar los resultados de una búsqueda o consulta en un documento descargable en formato PDF u hoja de cálculo.
* **Ficha Técnica / Vista en Detalle:** Pantalla o módulo que despliega la información detallada y completa de un registro seleccionado a través del buscador o catálogos interactivos.
* **Filtros Avanzados:** Herramientas de segmentación dinámica que permiten refinar las búsquedas por áreas temáticas, niveles, categorías o palabras clave.
* **Intranet Institucional:** Entorno privado del SENA con autenticación obligatoria para directivos, editores y administradores, destinado a la consulta de tableros analíticos gerenciales de Power BI, descarga de informes internos y maquetación de secciones institucionales.
* **Modo de Solo Lectura:** Modalidad de acceso asignada a Directores y Subdirectores que les permite explorar tableros analíticos en la Intranet y descargar reportes, operando como usuarios autenticados pero sin facultades de edición ni acceso al Panel Administrativo.
* **OLO (Observatorio Laboral y Ocupacional):** Instancia del SENA encargada de recolectar, analizar y divulgar información y estadísticas sobre el mercado laboral, las ocupaciones y la pertinencia de la formación en Colombia.
* **Rutas Fijas del Aplicativo:** Vistas y pantallas programadas en el código base que no se gestionan a través del editor visual (como las interfaces de inicio de sesión, recuperación de credenciales y las rutas del Panel Administrativo), las cuales no pueden ser alteradas ni eliminadas desde el entorno de edición.
* **Páginas Dinámicas y Gestionables:** Páginas y secciones de contenido del Sitio Web público y de la Intranet que pueden maquetarse y actualizarse mediante el editor visual, y que pueden ser eliminadas siempre que no cuenten con enlaces activos que provoquen enlaces rotos.
* **Panel Administrativo:** Entorno web privado y de acceso exclusivo para el rol Administrador (`/admin`), desde el cual se gestionan usuarios, se crean roles derivados de editor, se asignan permisos manuales, se gestiona la bandeja de revisión y se revisa la auditoría.
* **Power BI:** Herramienta de visualización analítica de datos integrada en la Intranet para que directores y administradores consulten tableros interactivos de indicadores de inserción laboral y pertinencia educativa.
* **Preguntas de Seguridad:** Método de comprobación de identidad configurado por cada funcionario en el primer ingreso, utilizado para validar al titular de la cuenta durante el procedimiento de recuperación de contraseña ante olvidos.
* **Protección contra Enlaces Rotos:** Validación automática que impide la eliminación de una página creada si existen menús u otras páginas que contengan enlaces activos hacia ella, evitando errores de navegación 404.
* **PWA (Aplicación Web Progresiva):** Tecnología que permite instalar la plataforma del observatorio en la pantalla de inicio de computadores o dispositivos móviles como una aplicación ligera e independiente desde el navegador web.
* **Respaldo de Base de Datos (Backup):** Copia de seguridad integral de la información del sistema generada desde el Panel Administrativo y empaquetada en un archivo comprimido con marca de tiempo.
* **Rol Hijo / Derivado de Editor:** Rol personalizado creado exclusivamente bajo la estructura de editor con el prefijo «Editor [Nombre]», el cual nace sin permisos por defecto y al que el Administrador le asigna manualmente permisos específicos sobre páginas o secciones.
* **SENA (Servicio Nacional de Aprendizaje):** Entidad pública colombiana de formación técnica y profesional, titular de la plataforma tecnológica y responsable del Observatorio Laboral y Ocupacional.
* **Sitio Web Público:** Portal web de libre acceso y consulta abierta para la ciudadanía y comunidad en general, donde se consultan páginas dinámicas, boletines, estadísticas y contenidos institucionales.
* **Tablero BI (Power BI):** Módulo interactivo de análisis de datos integrado en la plataforma que permite visualizar gráficos dinámicos y métricas institucionales con filtros en tiempo real.
* **Visor de Documentos y PDFs:** Componente de interfaz que permite visualizar, leer y explorar documentos oficiales, boletines y publicaciones en formato PDF directamente en la pantalla sin descargarlos obligatoriamente.
* **Visor de Videos:** Componente interactivo para la reproducción de recursos audiovisuales institucionales y cápsulas de video integradas en las páginas del portal.
