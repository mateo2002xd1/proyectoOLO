# MANUAL DE USUARIO DEL SISTEMA
## Observatorio Laboral y Ocupacional (OLO) — SENA

---

## 5. Público objetivo

El manual de usuario está dirigido a los diferentes perfiles que interactúan con la plataforma del Observatorio Laboral y Ocupacional (OLO):

### 5.1. Ciudadanía y Usuarios de Consulta Abierta
Personas que acceden al portal web público para consultar el catálogo de ocupaciones, clasificaciones CUOC y CNO, tendencias del mercado laboral y descargar documentos o informes sin requerir autenticación ni registro previo.

### 5.2. Directores y Subdirectores
Personal directivo institucional del SENA que inicia sesión con cuenta corporativa `@sena.edu.co` para consultar en modalidad de solo lectura tableros gerenciales de Power BI, matrices de pertinencia e indicadores de inserción laboral en la Intranet.

### 5.3. Editores de Contenido y Roles Hijos Derivados
Funcionarios autorizados para maquetar, estructurar y actualizar el contenido de las páginas web y boletines informativos mediante el editor visual de páginas, ajustándose a las secciones y permisos concedidos por la administración.

### 5.4. Administradores del Sistema
Personal responsable de la gestión integral de cuentas de usuario, creación de nuevos roles personalizados (exclusivamente para roles de editores), asignación manual de permisos, aprobación y publicación de contenidos, procesamiento de cargas masivas de datos en Excel, consulta de la bitácora de auditoría y configuración general del sistema en el Panel Administrativo.

---

## 6. Requisitos de acceso

Para garantizar el funcionamiento óptimo de las interfaces y la seguridad de las transacciones, se deben satisfacer las siguientes condiciones técnicas:

### 6.1. Requisitos de Hardware y Conectividad
* **Dispositivos compatibles:**
  * **Computadores de escritorio y portátiles:** Compatible con sistemas operativos Windows, macOS y Linux.
  * **Dispositivos móviles y tabletas:** Compatible con smartphones y tablets (Android e iOS) mediante su diseño responsivo y su arquitectura de **Aplicación Web Progresiva (PWA)**, lo que permite instalar el aplicativo directamente en la pantalla de inicio del dispositivo como una app independiente y ligera.

> **[Pegar captura de pantalla aquí]**
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo.*

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
* **Contraseña (Passcode) robusta:** Debe satisfacer los 5 lineamientos de la política institucional de seguridad:
  1. Longitud mínima de **12 caracteres**.
  2. Al menos una letra **mayúscula** (`A-Z`).
  3. Al menos una letra **minúscula** (`a-z`).
  4. Al menos un dígito **numérico** (`0-9`).
  5. Al menos un **carácter especial** o símbolo (`!@#$%^&*()_+-=[]{}|;:,.<>?`).

> **[Pegar captura de pantalla aquí]**
> *Pantalla de acceso institucional requiriendo correo con dominio corporativo y validación de los lineamientos de seguridad para la contraseña.*

---

## 7. Roles y permisos

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los perfiles institucionales autorizados.

### 7.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, consultar el catálogo ocupacional (CUOC y CNO), revisar las cifras del observatorio y descargar libremente archivos, boletines e informes en formato PDF sin necesidad de iniciar sesión.
3. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con correo institucional (`@sena.edu.co`) a la Intranet, al editor visual de páginas o al Panel Administrativo.

> **[Pegar captura de pantalla aquí]**
> *Exploración del catálogo ocupacional y consulta de indicadores laborales disponible de forma abierta para la ciudadanía.*

### 7.2. Qué puede hacer cada tipo de usuario

#### 7.2.1. Administrador
Es el rol de máxima autoridad operativa del sistema y el encargado de la gestión general:
* **Acceso exclusivo al Panel Administrativo:** Es el único rol autorizado para ingresar al Panel Administrativo. Ningún otro rol puede visualizar ni acceder a este entorno.
* **Gestión de usuarios:** Creación de nuevas cuentas institucionales, asignación de roles, activación o suspensión de usuarios y restablecimiento de contraseñas ante olvidos o bloqueos.
* **Creación de roles de editor y configuración de permisos:** Creación de nuevos roles personalizados en el sistema (facultad restringida de forma exclusiva a la creación de roles de editor, registrados en el sistema bajo el formato «Editor [Nombre]») y asignación manual («a mano») de los permisos específicos sobre las páginas y secciones que podrá intervenir cada rol.
* **Aprobación y gestión de publicaciones en revisión:** Recibe las páginas enviadas por los editores en la bandeja de revisión, examina los cambios propuestos mediante la vista previa interactiva y dispone de tres acciones operativas sobre cada versión:
  * *Aprobar:* Autoriza la publicación inmediata de la versión revisada para que quede visible de forma definitiva en el portal web o la Intranet.
  * *Rechazar:* Devuelve el borrador al editor responsable junto con las observaciones y justificación de los ajustes requeridos para que realice las correcciones pertinentes.
  * *Eliminar / Descartar (botón con ícono de basurero):* Permite descartar y eliminar definitivamente esa versión de borrador sin publicarla. Al pulsar el botón de basurero, se despliega una ventana de confirmación donde el Administrador debe ingresar obligatoriamente el motivo de la eliminación para garantizar la trazabilidad forense en la bitácora. Esta acción descarta el trabajo no deseado o enviado por error sin alterar la versión que ya se encuentra publicada y activa para los usuarios, depurando además del servidor cualquier archivo o imagen huérfana vinculada exclusivamente a ese borrador descartado.

> **[Pegar captura de pantalla aquí]**
> *Bandeja de páginas en revisión en el Panel Administrativo con los controles directos para previsualizar, aprobar, rechazar o descartar borradores mediante el botón de basurero.*

> **[Pegar captura de pantalla aquí]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, mostrando la exigencia del registro obligatorio del motivo para auditoría.*

* **Edición integral y gestión de páginas:** Posee permisos plenos para acceder al editor visual, modificar directamente cualquier bloque de contenido en el Sitio Web y en la Intranet, así como crear páginas nuevas y eliminar definitivamente páginas dinámicas creadas por los usuarios.
* **Carga masiva de datos en Excel:** Actualización masiva de las ocupaciones, cifras y estadísticas del observatorio mediante la carga de planillas de cálculo en formato Excel (`.xlsx`).
* **Consulta de bitácora de auditoría:** Supervisión del historial completo de actividades del sistema, permitiendo conocer qué usuario realizó cada acción, qué cambios efectuó y en qué fecha y hora.

#### 7.2.2. Editor (Rol Base de Maquetación)
Es el rol encargado de la producción, diseño y actualización visual de los contenidos:
* **Acceso al Editor Visual:** Ingresa con sus credenciales institucionales al editor visual de páginas tanto en el Sitio Web como en la Intranet.
* **Maquetación interactiva:** Arma y actualiza páginas agregando componentes prediseñados como textos, imágenes, tarjetas informativas, carruseles, acordeones y enlaces de descarga.
* **Creación y eliminación de secciones por defecto:** Dentro del editor visual cuenta por defecto con las facultades activas para **crear secciones nuevas** (incorporar nuevas páginas al portal) y **eliminar secciones** creadas por usuarios que ya no se requieran, cumpliendo con las validaciones de seguridad del sistema.

> **[Pegar captura de pantalla aquí]**
> *Entorno del editor visual interactivo mostrando el panel de componentes prediseñados y el menú flotante para la creación y eliminación de secciones.*

* **Garantía de accesibilidad:** Diligencia obligatoriamente la descripción textual de todas las imágenes que incorpora en las páginas para facilitar la lectura accesible.
* **Flujo de trabajo mediante borradores:** Guarda los cambios en modo de borrador y, una vez completada la edición, envía la página a revisión para que sea evaluada por el Administrador. Toda página nueva o editada debe ser aprobada antes de ser visible al público o en la Intranet.
* **Límites operativos del rol:**
  * No tiene acceso al Panel Administrativo.
  * No puede publicar páginas directamente en producción (siempre requiere aprobación previa del Administrador).
  * No puede eliminar las páginas base del sistema (de fábrica).
  * No puede crear ni modificar cuentas de usuarios.
  * No tiene acceso a la bitácora de auditoría.

#### 7.2.3. Roles Hijos o Derivados de Editor
Para responder a requerimientos organizativos y de gobernanza específicos en el SENA, el Administrador puede crear **roles hijos o derivados de Editor** desde el Panel Administrativo:
* **Exclusividad en la creación de roles (solo para editores):** En la plataforma, la creación de nuevos roles está diseñada y habilitada **únicamente para roles de tipo editor**. El sistema no permite la creación de nuevos roles de Administrador ni de Director; cualquier rol creado corresponde siempre a un rol de editor y se registra obligatoriamente bajo el prefijo fijo *«Editor [Nombre]»* (por ejemplo: *Editor Inicio*, *Editor Ocupaciones*, etc.).
* **Configuración manual de permisos («a mano»):** Al crear un rol nuevo de editor, este nace **sin ningún permiso por defecto**. El Administrador debe asignarle y activar los permisos manualmente, uno a uno, mediante los interruptores de la interfaz de permisos.

> **[Pegar captura de pantalla aquí]**
> *Formulario de creación de nuevos roles en el Panel Administrativo evidenciando el prefijo obligatorio para editores y la interfaz de asignación manual de permisos.*

* **Principio de mínimo privilegio:**
  * Si a un rol nuevo no se le asigna ningún permiso, el usuario que lo tenga **no podrá hacer nada en el sistema**.
  * El Administrador va concediendo acceso selectivo según la responsabilidad asignada al funcionario (por ejemplo: editar únicamente páginas del Sitio Web público, una sección temática específica o una página de encuestas en la Intranet).
* **Capacidad equivalente al rol Editor base:** En su núcleo funcional y operativo, estos roles comparten exactamente la misma estructura que el rol Editor principal. Por tanto, **si el Administrador le otorga los permisos suficientes (activando todas las secciones, la creación y la eliminación de páginas), el nuevo rol podrá hacer exactamente lo mismo que el rol Editor base**.
* **Gestión de la plantilla global (cabecera y pie de página):** Al configurar los permisos manualmente, el Administrador decide si otorga o reserva la edición de la cabecera y el pie de página institucional, evitando modificaciones no autorizadas en la identidad global del portal.
* **Límites infranqueables de seguridad:** Independientemente de cuántos permisos de edición se le asignen, ningún rol hijo puede ingresar al Panel Administrativo, no puede publicar directamente en producción sin revisión previa del Administrador, y no tiene acceso a la gestión de usuarios ni a la bitácora de auditoría.

#### 7.2.4. Director / Subdirector
Es el rol institucional enfocado en el seguimiento gerencial, la consulta estratégica y la toma de decisiones:
* **Acceso a la Intranet Institucional:** Inicia sesión con su cuenta institucional `@sena.edu.co` para ingresar al portal interno de la entidad.
* **Consulta gerencial en solo lectura:** Navega y consulta los tableros analíticos de Power BI integrados en la Intranet (indicadores de tasa de ocupación, matrices de pertinencia educativa y resultados de encuestas a egresados y calidad de formación).
* **Descarga de presentaciones e informes:** Descarga reportes, presentaciones y boletines internos en formatos PDF o PowerPoint para uso en reuniones de planeación y comités directivos.

> **[Pegar captura de pantalla aquí]**
> *Interfaz de consulta gerencial en la Intranet institucional con tableros interactivos integrados en modalidad de solo lectura.*

* **Límites operativos del rol:**
  * No tiene acceso al Panel Administrativo.
  * No tiene permisos de edición (no puede modificar contenidos, textos ni la estructura de las páginas).
  * No puede crear ni eliminar páginas del sistema.
  * No gestiona usuarios, roles ni configuraciones de la plataforma.

### 7.3. Reglas para la Creación y Eliminación de Páginas
El sistema aplica controles estrictos para salvaguardar la estabilidad, coherencia de navegación e integridad del portal:
1. **Crear una página no la publica:** La acción de crear una página únicamente genera la estructura vacía en el sistema. La página no es visible para la ciudadanía ni en la Intranet hasta que se le agregue contenido, se guarde el borrador, se envíe a revisión y un Administrador apruebe su publicación definitiva. Al crearse, el rol del creador queda facultado automáticamente para editarla.
2. **Protección absoluta de páginas base (de fábrica):** Las páginas indispensables del sistema (como Inicio, Tasas de ocupación, Matrices de pertinencia, Encuestas institucionales y la cabecera/pie de página global) están blindadas y **nunca pueden ser eliminadas por ningún rol** (ni por Administradores ni por Editores), garantizando la estabilidad operativa del portal.
3. **Solo aplica sobre páginas creadas por usuarios:** Únicamente se permite eliminar páginas dinámicas o secciones adicionales creadas por el personal del observatorio.
4. **Protección contra enlaces rotos:** Antes de procesar el borrado, el sistema inspecciona todo el portal; si otra página o menú institucional contiene un enlace activo que apunta hacia la página a eliminar, el borrado se bloquea automáticamente hasta que dichos enlaces sean retirados, impidiendo que los usuarios encuentren enlaces rotos (error 404).
5. **Confirmación de seguridad obligatoria:** Para evitar eliminaciones accidentales por un clic involuntario, el sistema despliega una ventana de confirmación donde el usuario debe escribir exactamente el título de la página antes de autorizar su borrado definitivo.

> **[Pegar captura de pantalla aquí]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página.*

6. **Registro inmutable:** La eliminación retira la página y sus versiones de la plataforma, pero la bitácora de auditoría conserva de forma permanente el registro histórico de quién la creó, quién la editó y quién la eliminó.

### 7.4. Matriz Comparativa de Acceso y Capacidades

| Capacidad / Entorno del Sistema | Ciudadanía (Sin rol) | Director / Subdirector | Editor Base | Roles Hijos de Editor | Administrador |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Navegar Sitio Web Público y descargar archivos** | Permitido | Permitido | Permitido | Permitido | Permitido |
| **Inicio de sesión institucional (`@sena.edu.co`)** | No aplica | Permitido | Permitido | Permitido | Permitido |
| **Consultar tableros de Power BI en Intranet** | Sin acceso | Permitido (Solo lectura) | Permitido | Permitido | Permitido |
| **Descargar informes y presentaciones internas** | Sin acceso | Permitido | Permitido | Permitido | Permitido |
| **Ingresar al editor visual de páginas** | Sin acceso | Sin acceso | Permitido | Permitido | Permitido |
| **Editar páginas asignadas del Sitio Web e Intranet** | Sin acceso | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Modificar cabecera y pie de página institucional** | Sin acceso | Sin acceso | Permitido | No (Por defecto) | Permitido |
| **Crear nuevas páginas en el portal** | Sin acceso | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Eliminar páginas creadas por usuarios** | Sin acceso | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Eliminar páginas base del sistema (de fábrica)** | Sin acceso | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) |
| **Guardar borradores y enviar a revisión** | Sin acceso | Sin acceso | Permitido | Permitido | Permitido |
| **Aprobar y publicar páginas en producción** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Rechazar páginas en revisión con observaciones** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Descartar versiones en revisión (botón de basurero)** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Ingresar al Panel Administrativo** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido (Exclusivo) |
| **Crear, editar y suspender cuentas de usuario** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Crear roles (exclusivo para roles de Editor) y asignar permisos a mano** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Restablecer contraseñas de otros usuarios** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Carga masiva de datos ocupacionales en Excel** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |
| **Consultar la bitácora de auditoría del sistema** | Sin acceso | Sin acceso | Sin acceso | Sin acceso | Permitido |

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

#### 8.1.1. Consulta Abierta y Navegación sin Autenticación
El ingreso al portal web público se realiza directamente mediante la dirección web (URL) institucional, garantizando el libre acceso a la información:
* **Disponibilidad universal para todos los perfiles:** Cualquier persona (ciudadanos, aprendices, investigadores, empresas y funcionarios institucionales con cualquier rol) puede navegar libremente, consultar el catálogo ocupacional bajo las clasificaciones CUOC y CNO, revisar las cifras estadísticas y descargar informes en formato PDF sin necesidad de registrarse ni iniciar sesión.
* **Punto de acceso institucional:** En la cabecera del sitio web se dispone del botón de inicio de sesión, habilitado para que el personal autorizado pueda autenticarse e ingresar a las herramientas de edición o administración.

> **[Pegar captura de pantalla aquí]**
> *Cabecera y navegación del Sitio Web Público con acceso directo a los módulos informativos y botón de ingreso institucional.*

#### 8.1.2. Inicio de Sesión Institucional en el Portal Web
Permite a cualquier usuario institucional registrado acceder con su cuenta corporativa al portal:
* **Autenticación abierta para todo usuario institucional:** Cualquier funcionario que cuente con una cuenta activa registrada puede iniciar sesión en la plataforma, independiente de su rol (Administrador, Director / Subdirector, Editor base o Roles hijos derivados de Editor).
* **Alcance según el perfil del usuario:**
  * *Editores y Administradores:* Al identificarse, el sistema habilita las barras de herramientas operativas, el acceso al editor visual de páginas y, en el caso exclusivo del Administrador, el ingreso al Panel Administrativo.
  * *Directores y Subdirectores:* Su función dentro del sistema es actuar como cualquier **usuario registrado legítimo**, pero **sin permisos administrativos ni facultades de edición**. Por lo tanto, al iniciar sesión en el sitio web interactúan con la plataforma de forma autenticada, pero sin visualizar herramientas de maquetación, botones de edición ni accesos de configuración.
* **Credenciales requeridas:**
  * Correo electrónico corporativo con dominio institucional `@sena.edu.co`.
  * Contraseña (Passcode) robusta configurada en la plataforma.
* **Enlace de recuperación:** La pantalla de autenticación dispone del acceso directo para el restablecimiento de contraseñas ante olvidos *(¿Olvidaste tu passcode?)*.

> **[Pegar captura de pantalla aquí]**
> *Formulario de inicio de sesión del Sitio Web Público con campos de correo institucional `@sena.edu.co`, contraseña y enlace de recuperación.*

### 8.2. Intranet Institucional

#### 8.2.1. Inicio de Sesión en el Entorno Privado
La Intranet es una plataforma privada orientada al seguimiento gerencial, análisis ocupacional y trabajo interno del SENA:
* **Acceso restringido con autenticación obligatoria:** A diferencia del portal público, la Intranet no permite navegación anónima ni libre. Toda persona debe autenticarse para ingresar.
* **Perfiles habilitados:**
  * *Directores y Subdirectores:* Ingresan como usuarios registrados institucionales para consultar los tableros de Power BI e indicadores de gestión en modalidad de solo lectura, manteniendo protegidos los datos y la estructura interna al no contar con permisos de edición ni facultades de administración.
  * *Editores y Administradores:* Ingresan para maquetar secciones internas o realizar labores de supervisión según sus atribuciones.
* **Credenciales de ingreso:** Correo corporativo `@sena.edu.co` y passcode institucional. Al iniciar sesión, el sistema redirige al usuario a los tableros analíticos de Power BI o a sus secciones asignadas según el rol.

> **[Pegar captura de pantalla aquí]**
> *Pantalla de acceso a la Intranet Institucional para consulta directiva de tableros analíticos y reportes.*

### 8.3. Procedimiento de Recuperación de Contraseña (Preguntas de Seguridad)
El mecanismo de recuperación de acceso opera de manera unificada para todos los usuarios registrados (incluyendo Directores, Subdirectores, Editores y Administradores) que hayan olvidado su contraseña, tanto en el Sitio Web como en la Intranet:
1. **Solicitud de recuperación:** El funcionario pulsa el enlace *(¿Olvidaste tu passcode?)* e ingresa su correo electrónico corporativo `@sena.edu.co`.
2. **Validación de identidad por preguntas de seguridad:** Para comprobar que quien solicita el acceso es el titular de la cuenta, la plataforma despliega el cuestionario con las **preguntas de seguridad** que el funcionario seleccionó y contestó durante su primer ingreso al sistema.
3. **Restablecimiento de contraseña:** Una vez verificadas correctamente las respuestas, el sistema habilita el formulario para ingresar la nueva clave, la cual debe cumplir estrictamente con los 5 lineamientos de la política institucional de seguridad detallados en la Sección 6.3 (mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos).
4. **Confirmación y reingreso:** El sistema confirma el cambio exitoso y redirige al funcionario a la pantalla de inicio de sesión con su nueva contraseña activa.

> **[Pegar captura de pantalla aquí]**
> *Interfaz de recuperación de acceso con solicitud de correo institucional corporativo.*

> **[Pegar captura de pantalla aquí]**
> *Cuestionario de validación de identidad mediante preguntas de seguridad para el restablecimiento de contraseña.*

### 8.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet:
  1. El Administrador accede al Panel Administrativo y navega hasta el módulo **Accesos / Usuarios** (`/admin/users`).
  2. Pulsa el botón **«Crear Usuario»** en la barra superior.
  3. Completa el formulario de alta registrando:
     * Nombre y apellidos del funcionario.
     * Correo electrónico corporativo (dominio obligatorio `@sena.edu.co`).
     * Asignación del rol correspondiente:
       * *Director / Subdirector:* Cuenta registrada para la consulta gerencial de tableros en Intranet, creada expresamente sin permisos de edición ni acceso al panel administrativo.
       * *Editor base o Roles hijos derivados de Editor:* Cuentas asignadas a la maquetación y actualización de páginas.
       * *Administrador:* Cuentas de gestión operativa y técnica del sistema.
     * Parámetros de vigencia de la cuenta (fecha de expiración si aplica).
  4. Al confirmar el registro, el sistema da de alta al usuario, permitiéndole iniciar sesión en su respectivo entorno y requiriéndole en su primer ingreso la configuración de su contraseña definitiva y sus preguntas de seguridad.

> **[Pegar captura de pantalla aquí]**
> *Panel de gestión de cuentas en Accesos / Usuarios con el botón para la creación de un nuevo usuario institucional.*

> **[Pegar captura de pantalla aquí]**
> *Formulario modal para el registro de nuevos usuarios institucionales con asignación de rol corporativo.*

---

## 16. Glosario de términos técnicos e institucionales

El presente glosario define y consolida de forma exclusiva los términos, conceptos, siglas y herramientas institucionales que aparecen textualmente a lo largo de las secciones anteriores del presente manual de usuario:

* **Bandeja de Revisión:** Módulo del Panel Administrativo donde el Administrador visualiza y gestiona las versiones y páginas enviadas por los editores para evaluar los cambios propuestos mediante vista previa, permitiendo aprobar su publicación, rechazarlas con observaciones o descartar borradores mediante el botón de basurero.
* **Bitácora de Auditoría:** Historial cronológico permanente e inmutable que registra las acciones realizadas por los usuarios autenticados en la plataforma (quién ejecutó la acción, qué modificó, fecha y hora), garantizando la trazabilidad operativa y la supervisión del sistema.
* **Bloque de Contenido:** Componente prediseñado de interfaz (textos, imágenes, tarjetas informativas, carruseles, acordeones o enlaces) que los editores configuran e incorporan en el editor visual para maquetar las páginas del Sitio Web y la Intranet.
* **Borrador (Modo de Borrador):** Estado de trabajo privado en el que los editores maquetan y estructuran una página sin que los cambios sean visibles al público o en la Intranet, hasta que sean enviados a revisión y aprobados por el Administrador.
* **Carga Masiva en Excel:** Función exclusiva del Administrador para ingresar o actualizar grandes volúmenes de estadísticas, datos ocupacionales e indicadores mediante planillas de cálculo en formato `.xlsx`.
* **CNO (Clasificación Nacional de Ocupaciones):** Estructura de clasificación ocupacional utilizada por el SENA para agrupar y organizar las ocupaciones en el mercado laboral colombiano, disponible para consulta abierta de la ciudadanía.
* **CUOC (Clasificación Única de Ocupaciones para Colombia):** Marco taxonómico oficial del Estado colombiano que clasifica las ocupaciones del país para estandarizar el mercado laboral y formativo, consultable libremente en el portal público.
* **Descarte de Versión (Botón de Basurero):** Acción de control en la bandeja de revisión que permite al Administrador eliminar definitivamente un borrador no deseado o enviado por error. Exige registrar de forma obligatoria el motivo en la bitácora de auditoría y depura archivos huérfanos sin afectar la versión ya publicada.
* **Diseño Responsivo:** Capacidad de las interfaces del portal web y de la Intranet para adaptarse de manera automática y fluida a diferentes tamaños y resoluciones de pantalla, tanto en computadores de escritorio como en tabletas y dispositivos móviles.
* **Dominio Corporativo (`@sena.edu.co`):** Dominio de correo electrónico oficial e institucional exigido como requisito estricto y excluyente para la creación de cuentas, inicio de sesión y recuperación de contraseña del personal autorizado.
* **Editor Visual:** Herramienta interactiva de maquetación que permite a los editores y administradores estructurar, diseñar y actualizar visualmente las páginas del Sitio Web y la Intranet mediante bloques y componentes prediseñados.
* **Intranet Institucional:** Entorno privado del SENA con autenticación obligatoria para directivos, editores y administradores, destinado a la consulta de tableros analíticos gerenciales de Power BI, descarga de informes internos y maquetación de secciones institucionales.
* **Modo de Solo Lectura:** Modalidad de acceso asignada a Directores y Subdirectores que les permite explorar tableros analíticos en la Intranet y descargar reportes, operando como usuarios autenticados pero sin facultades de edición ni acceso al Panel Administrativo.
* **OLO (Observatorio Laboral y Ocupacional):** Instancia del SENA encargada de recolectar, analizar y divulgar información y estadísticas sobre el mercado laboral, las ocupaciones y la pertinencia de la formación en Colombia.
* **Página Base (Página de Fábrica):** Página estructural e indispensable del sistema (como Inicio, Tasas de ocupación, Matrices de pertinencia o Encuestas) blindada permanentemente para que ningún usuario ni rol pueda eliminarla, asegurando la estabilidad del portal.
* **Páginas Dinámicas:** Páginas y secciones adicionales creadas por los usuarios autorizados en la plataforma, las cuales sí pueden ser eliminadas siempre que no cuenten con enlaces activos que provoquen enlaces rotos.
* **Panel Administrativo:** Entorno web privado y de acceso exclusivo para el rol Administrador (`/admin`), desde el cual se gestionan usuarios, se crean roles derivados de editor, se asignan permisos manuales, se gestiona la bandeja de revisión y se revisa la auditoría.
* **Passcode (Contraseña Robusta):** Contraseña requerida para el inicio de sesión institucional, la cual debe cumplir estrictamente con los lineamientos de seguridad establecidos (mínimo 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Power BI:** Herramienta de visualización analítica de datos integrada en la Intranet para que directores y administradores consulten tableros interactivos de indicadores de inserción laboral y pertinencia educativa.
* **Preguntas de Seguridad:** Método de comprobación de identidad configurado por cada funcionario en su primer ingreso, utilizado para validar al titular de la cuenta durante el procedimiento de recuperación de contraseña ante olvidos.
* **Protección contra Enlaces Rotos:** Validación automática que impide la eliminación de una página creada si existen menús u otras páginas que contengan enlaces activos hacia ella, evitando errores de navegación 404.
* **PWA (Aplicación Web Progresiva):** Tecnología que permite instalar la plataforma del observatorio en la pantalla de inicio de computadores o dispositivos móviles como una aplicación ligera e independiente desde el navegador web.
* **Rol Hijo / Derivado de Editor:** Rol personalizado creado exclusivamente bajo la estructura de editor con el prefijo «Editor [Nombre]», el cual nace sin permisos por defecto y al que el Administrador le asigna manualmente permisos específicos sobre páginas o secciones.
* **SENA (Servicio Nacional de Aprendizaje):** Entidad pública colombiana de formación técnica y profesional, titular de la plataforma tecnológica y responsable del Observatorio Laboral y Ocupacional.
* **Sitio Web Público:** Portal web de libre acceso y consulta abierta para la ciudadanía y comunidad en general, donde se consultan ocupaciones, boletines y cifras sin necesidad de contar con usuario ni iniciar sesión.
