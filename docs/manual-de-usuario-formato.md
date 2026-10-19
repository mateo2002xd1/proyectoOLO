# MANUAL DE USUARIO DEL SISTEMA
## Observatorio Laboral y Ocupacional (OLO) — SENA

---

*Nota de estilo: Las capturas de pantalla integradas deben tener un tamaño pequeño o mediano (optimizadas) para mantener el manual intuitivo sin saturar el documento.*

---

## 3.1. Publico objetivo

El manual de usuario está dirigido a los diferentes roles de usuario que interactúan con la plataforma del Observatorio Laboral y Ocupacional (OLO):

### 3.1.1. Administradores del Sistema
Personal responsable de la gestión integral de cuentas de usuario, creación de nuevos roles personalizados (exclusivamente para roles de editores), asignación manual de permisos, aprobación y publicación de contenidos, procesamiento de cargas masivas de datos en Excel, consulta de la bitácora de auditoría y configuración general del sistema en el Panel Administrativo.

### 3.1.2. Editores de Contenido y Roles Hijos Derivados
Funcionarios autorizados para maquetar, estructurar y actualizar el contenido de las páginas web y boletines informativos mediante el editor visual de páginas, ajustándose a las secciones y permisos concedidos por la administración.

### 3.1.3. Directores y Subdirectores
Personal directivo del SENA que inicia sesión con cuenta corporativa `@sena.edu.co` para consultar en modalidad de solo lectura matrices de pertinencia, indicadores del mercado laboral y tableros analíticos en la Intranet del OLO.

> **[Captura: Roles de Usuario]**
> *Esquema de los tres roles principales de usuario (Administradores, Editores y Directivos) interactuando con los distintos módulos de la plataforma.*
>
> **[Captura: Roles de Usuario (Móvil)]**
> *Esquema de los tres roles principales de usuario (Administradores, Editores y Directivos) interactuando con los distintos módulos de la plataforma. (Móvil).*

---

## 3.2. Prerrequisito de uso

Esta sección define los requerimientos que el usuario debe satisfacer antes de utilizar la plataforma: requerimientos técnicos y de conectividad, credenciales de acceso, asignación de roles y permisos, y los mecanismos de entrada a los portales del observatorio.

---

### 3.2.1. Requisitos de acceso

Para garantizar el funcionamiento óptimo de las interfaces y la seguridad de las transacciones, se deben satisfacer las siguientes condiciones técnicas:

#### 3.2.1.1. Requisitos de Hardware y Conectividad
* **Dispositivos compatibles:**
  * **Computadores de escritorio y portátiles:** Compatible con sistemas operativos Windows, macOS y Linux.
  * **Dispositivos móviles y tabletas:** Compatible con smartphones y tablets (Android e iOS) mediante su diseño responsivo y su arquitectura de **Aplicación Web Progresiva (PWA)**, lo que permite instalar el aplicativo directamente en la pantalla de inicio del dispositivo como una app independiente y ligera.

> **[Captura: PWA en Navegador]**
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo.*
>
> **[Captura: PWA en Navegador (Móvil)]**
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo. (Móvil).*

* **Resolución de pantalla:**
  * *Entorno de escritorio:* Mínimo 1280 × 800 píxeles (Recomendada: 1920 × 1080 Full HD para tableros analíticos y el Panel Administrativo).
  * *Entorno móvil:* Compatible y optimizado desde 360 × 640 píxeles en adelante.
* **Conectividad a Internet:** Conexión de banda ancha o red de datos móviles estable (Mínimo: 5 Mbps para consulta ciudadana; Recomendado: 10 Mbps o superior para funciones operativas, analíticas y administrativas).

#### 3.2.1.2. Requisitos de Navegadores Web
El sistema es una aplicación web moderna y requiere navegadores con soporte completo de HTML5, cookies y almacenamiento local:
* **Google Chrome:** Versión 110 o superior (Recomendado).
* **Microsoft Edge:** Versión 110 o superior.
* **Mozilla Firefox:** Versión 115 o superior.
* **Safari:** Versión 16 o superior.

> **Nota técnica:** No se requiere la instalación de complementos, Java runtime ni extensiones adicionales en el navegador.

#### 3.2.1.3. Requisitos de Credenciales y Cuentas de Acceso
Para acceder a los entornos privados (Panel Administrativo, Editor Visual e Intranet):
* **Cuenta de correo obligatoria:** Debe pertenecer estrictamente al dominio corporativo `@sena.edu.co`. Cualquier intento de autenticación o registro con dominios públicos o ajenos es rechazado automáticamente por la plataforma OLO (ver procedimiento de acceso en [Sección 3.4.1: Procedimientos de Autenticación y Acceso](#341-procedimientos-de-autenticación-y-acceso) y resolución de alertas en [Sección 3.5.2.1: Problemas de Acceso por Bloqueo](#3521-problemas-de-acceso-por-bloqueo)).
* **Contraseña robusta:** Debe satisfacer los lineamientos de la política de seguridad de contraseñas de la plataforma:
  1. Longitud mínima de **12 caracteres** y máxima de **72 caracteres** (donde las tildes y la letra ñ equivalen al doble).
  2. Combinar al menos **3 de 4 categorías**: letras mayúsculas (`A-Z`), minúsculas (`a-z`), dígitos numéricos (`0-9`) y caracteres especiales o símbolos (`!@#$%^&*()_+-=[]{}|;:,.<>?`).
  3. Sin emojis, caracteres invisibles ni tabulaciones.
  4. **Regla de no repetición:** La nueva contraseña no puede coincidir con la contraseña temporal, la contraseña actual ni la contraseña inmediatamente anterior registrada en la cuenta.
  *(El flujo de primer ingreso, la validación interactiva de credenciales y el procedimiento de recuperación se detallan en [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso) y [Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)).*

---

### 3.2.2. Roles y permisos

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los roles autorizados del OLO.

#### 3.2.2.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, realizar búsquedas mediante los componentes interactivos, consultar indicadores, reproducir contenidos en los visores de videos y acceder a documentos mediante los visores de PDFs o botones de descarga libre en formato PDF sin necesidad de iniciar sesión.
3. **Herramientas de accesibilidad e inclusión ciudadana:** Cualquier visitante puede activar en todo momento el panel lateral de accesibilidad para adaptar la experiencia visual y auditiva a sus necesidades particulares (aumentar el tamaño de letra, activar modos de alto contraste, filtros para daltonismo o dislexia, guía de lectura, lector de texto en voz alta y cursor ampliado), sin requerir registro previo ni autenticación.
4. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con cuenta corporativa (`@sena.edu.co`) al Panel Administrativo, al editor visual de páginas o a la Intranet del OLO.

> **[Captura: Consulta Ciudadana]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía.*
>
> **[Captura: Consulta Ciudadana (Móvil)]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía. (Móvil).*

#### 3.2.2.2. Qué puede hacer cada tipo de usuario

##### 3.2.2.2.1. Administrador
Corresponde a la máxima autoridad técnica y operativa dentro de la plataforma del observatorio.

* **Propósito del rol:**
  Garantizar la administración integral, gobernanza, disponibilidad operativa y seguridad técnica del sistema. Es el encargado de la gestión de usuarios, el control editorial de publicaciones, la importación masiva de datos y la fiscalización del sistema mediante la bitácora de auditoría.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante credenciales corporativas obligatorias (`@sena.edu.co`). Dispone de acceso exclusivo al Panel Administrativo (`/admin`), entorno inaccesible para los demás roles. Asimismo, puede navegar libremente por el Sitio Web público y por la Intranet del OLO con plenas facultades de visualización y edición en línea.

* **Funciones y facultades principales:**
  * *Gestión integral de cuentas de usuario:* Registra nuevas cuentas de usuario en el OLO, asigna o revoca roles, activa o suspende cuentas y ejecuta el restablecimiento de contraseñas ante eventualidades o bloqueos (ver paso a paso en [Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)).
  * *Creación de roles de editor y parametrización de permisos:* Crea roles personalizados exclusivamente bajo la tipología de editor (bajo la nomenclatura fija «Editor [Nombre]») y define manualmente («a mano») los accesos e interruptores de permisos sobre cada página o sección (ver paso a paso en [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos)).
  * *Aprobación y control en la bandeja de revisión:* Examina los borradores remitidos por los editores mediante la previsualización interactiva y dispone de tres decisiones operativas:
    * *Aprobar:* Autoriza la publicación inmediata de la versión revisada para su despliegue público o en la Intranet.
    * *Rechazar:* Devuelve la versión al editor responsable con las observaciones y justificación de los cambios requeridos.
    * *Descartar / Eliminar (ícono de basurero):* Elimina definitivamente el borrador no procedente o enviado por error. Esta acción exige registrar obligatoriamente el motivo para la bitácora de auditoría y depura los archivos e imágenes huérfanas sin alterar la versión publicada.
    *(Ver procedimiento operativo de revisión en [Sección 3.4.2.5: Páginas en Revisión](#3425-aprobación-y-publicación-de-contenidos-páginas-en-revisión)).*
  * *Edición integral y gestión de páginas:* Accede al editor visual para maquetar directamente cualquier contenido en el Sitio Web o la Intranet, crear nuevas páginas y eliminar páginas dinámicas creadas por los editores (ver [Sección 3.4.3.3: Estructura y Funcionalidades del Editor Visual](#3433-estructura-y-funcionalidades-del-editor-visual), [Sección 3.4.3.4: Creación de Nuevas Páginas (Paso a Paso)](#3434-creación-de-nuevas-páginas-paso-a-paso) y [Sección 3.4.3.5: Eliminación de Páginas (Procedimiento Seguro)](#3435-eliminación-de-páginas-procedimiento-seguro)).
  * *Carga masiva de información en Excel:* Importa y procesa actualizaciones masivas de datos ocupacionales, estadísticas e indicadores del observatorio mediante archivos en formato `.xlsx` (ver paso a paso en [Sección 3.4.2.8: Carga Masiva de Datos en Excel](#3428-actualizaciones-y-carga-masiva-de-datos-en-excel)).
  * *Supervisión mediante bitácora de auditoría:* Inspecciona el registro cronológico inmutable de eventos para verificar qué usuario realizó cada acción, los cambios ejecutados, las marcas de tiempo y las direcciones de origen (ver paso a paso en [Sección 3.4.2.6: Bitácora de Auditoría](#3426-auditoría-y-bitácora-de-eventos)).

* **Límites operativos y restricciones de seguridad:**
  * No puede modificar ni eliminar mediante el editor visual las rutas y vistas que no son gestionables desde el editor de páginas, tales como las interfaces de autenticación (inicio de sesión, recuperación de credenciales y preguntas de seguridad) y todas las rutas funcionales del Panel Administrativo (`/admin`), las cuales corresponden a la arquitectura fija de código del aplicativo.
  * No puede crear roles dentro de las jerarquías de Administrador ni de Director; la creación de roles nuevos se encuentra restringida exclusivamente a roles hijos de editor.
  * No puede omitir ni alterar el registro de auditoría; todas las acciones administrativas quedan grabadas de forma obligatoria e irreversible en la base de datos.

##### 3.2.2.2.2. Editor (Rol Base)
Corresponde al rol técnico general facultado para la producción, maquetación y diseño de los contenidos del OLO.

* **Propósito del rol:**
  Construir, actualizar y diseñar visualmente las páginas y boletines de la plataforma mediante el editor interactivo de bloques, manteniendo la pertinencia informativa y la identidad gráfica del observatorio.

* **Entorno de acceso y autenticación:**
  Inicia sesión con su cuenta corporativa (`@sena.edu.co`) desde el Sitio Web público o desde la Intranet del OLO. Al autenticarse, el sistema dirige al usuario a la página de inicio correspondiente según el ambiente donde ingresó. Al navegar por las diferentes páginas, se le despliega un menú flotante con los botones de acción para editar página, editar cabecera/pie, crear o eliminar páginas.

* **Funciones y facultades principales:**
  * *Maquetación interactiva con bloques:* Diseña y estructura contenidos directamente en el editor visual mediante su entorno de paneles: seleccionando bloques prediseñados del catálogo izquierdo (textos, imágenes, tarjetas de indicadores, carruseles, acordeones), arrastrándolos al lienzo central en tiempo real y personalizando sus propiedades en el panel lateral derecho (ver paso a paso en [Sección 3.4.3.3: Estructura y Funcionalidades del Editor Visual](#3433-estructura-y-funcionalidades-del-editor-visual)).
  * *Cobertura total de edición:* Accede a la edición de cualquier página del portal o de la Intranet a través del botón flotante en pantalla (opción **«Editar página»**), disponiendo de permisos plenos sobre todos los contenidos existentes, sin importar qué editor los haya creado originalmente.
  * *Creación y eliminación de páginas dinámicas:* Gestiona páginas dinámicas desde el menú del botón flotante mediante las opciones **«Nueva página»** (definiendo título y ruta URL) y **«Eliminar página»** (con validaciones de seguridad y protección contra enlaces rotos). (Ver paso a paso de creación en [Sección 3.4.3.4: Creación de Nuevas Páginas (Paso a Paso)](#3434-creación-de-nuevas-páginas-paso-a-paso) y de eliminación en [Sección 3.4.3.5: Eliminación de Páginas (Procedimiento Seguro)](#3435-eliminación-de-páginas-procedimiento-seguro)).
  * *Flujo de trabajo mediante borradores:* Guarda su progreso de forma privada mediante el botón **«Guardar borrador»** sin alterar el portal público, y traslada los cambios terminados mediante **«Enviar a revisión»** hacia la sección **«Páginas en revisión»** del Panel Administrativo para la evaluación y aprobación final por parte del Administrador (ver paso a paso en [Sección 3.4.3.3: Estructura y Funcionalidades del Editor Visual](#3433-estructura-y-funcionalidades-del-editor-visual)).

* **Límites operativos y restricciones de seguridad:**
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No puede publicar directamente en los entornos productivos; requiere obligatoriamente la aprobación previa de un Administrador.
  * No puede intervenir ni eliminar las rutas fijas del aplicativo (como las interfaces de inicio de sesión o las rutas administrativas), ya que corresponden a la estructura de código del sistema y no a páginas gestionables desde el editor visual.
  * Si bien está facultado para eliminar páginas dinámicas creadas en el sistema, no puede borrarlas si se encuentran vinculadas a algún elemento del menú de navegación del portal o a otros enlaces del sistema; en dichos casos, el sistema bloquea la acción y le exige retirar previamente esos enlaces desde la edición del menú para evitar enlaces rotos.
  * No puede crear, modificar ni gestionar cuentas de usuario ni roles.
  * No tiene acceso a la bitácora de auditoría ni al módulo de carga masiva de datos en Excel.

##### 3.2.2.2.3. Roles Hijos o Derivados de Editor
Corresponden a roles editoriales especializados creados por el Administrador para delimitar responsabilidades por dependencia o temática.

* **Propósito del rol:**
  Permitir la participación distribuida de funcionarios en la maquetación y actualización de contenidos concretos, aplicando el principio de mínimo privilegio para limitar el alcance de su intervención únicamente a las páginas autorizadas.

* **Entorno de acceso y autenticación:**
  Inician sesión con credenciales corporativas (`@sena.edu.co`) en el Sitio Web público o en la Intranet del OLO. Al ingresar, el sistema redirige al usuario al inicio del portal y despliega el menú flotante de edición únicamente cuando navega por las páginas y secciones específicas que le hayan sido habilitadas.

* **Funciones y facultades principales:**
  * *Exclusividad de tipología:* Todo rol derivado creado en la plataforma pertenece obligatoriamente a la familia de editores y se registra bajo el formato estricto «Editor [Nombre]».
  * *Configuración manual de permisos («a mano»):* Nace sin ningún permiso predeterminado (privilegio cero). El Administrador habilita de forma selectiva los interruptores organizados dentro de las 5 secciones de permisos del sistema (ver contexto en [Sección 3.2.2.3: Estructura de Permisos](#3223-estructura-y-ámbitos-de-los-permisos-las-5-secciones-de-control) y procedimiento paso a paso en [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos)).
  * *Capacidad equivalente según asignación:* Si el Administrador le otorga permisos completos (activando todas las páginas, la creación y el borrado), el rol hijo adquiere las mismas facultades operativas que el rol Editor base.
  * *Control de componentes globales:* La modificación de la cabecera y pie de página compartidos permanece bloqueada por defecto, salvo concesión expresa del Administrador.
  * *Ciclo editorial de borradores:* Maqueta los bloques en las páginas asignadas y remite las versiones trabajadas a la sección de **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación definitiva por parte del Administrador.
  * *Asignación automática y delegación de nuevas páginas:* Cuando un rol hijo que cuenta con permiso de creación genera una nueva página, el sistema otorga permisos de edición inmediatos únicamente al Administrador, al rol padre Editor base y a su propio rol creador. Los demás roles hijos de editor quedan sin acceso a dicha página; si otro rol especializado necesita colaborar o editarla, el Administrador debe otorgarle el permiso de forma manual («a mano») desde la opción de editar rol en el Panel Administrativo (ver [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos)).

* **Límites operativos y restricciones de seguridad:**
  * No tienen acceso al Panel Administrativo (`/admin`).
  * No pueden publicar páginas directamente en producción sin la aprobación del Administrador.
  * No pueden intervenir ni editar páginas o secciones ajenas a las asignadas de forma explícita en su rol.
  * No pueden crear ni eliminar páginas a menos que cuenten con el permiso manual activado específicamente para ello.
  * No pueden intervenir ni eliminar las rutas no gestionables desde el editor visual (pantallas de inicio de sesión y rutas administrativas), ni gestionar usuarios, roles, auditoría o cargas masivas.

##### 3.2.2.2.4. Director / Subdirector
Corresponde al rol directivo enfocado en el monitoreo gerencial, el análisis de indicadores del mercado laboral y la toma de decisiones estratégicas del observatorio.

* **Propósito del rol:**
  Facilitar la consulta directa, ágil y protegida de la información estadística, los indicadores del mercado laboral y los resultados de pertinencia educativa para respaldar la planeación y la gestión directiva.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante su cuenta corporativa (`@sena.edu.co`) en la **Intranet del OLO**. Al autenticarse, el sistema despliega el entorno privado con acceso inmediato a los módulos gerenciales, tableros analíticos e indicadores ocupacionales en modalidad de solo lectura.

* **Funciones y facultades principales:**
  * *Consulta gerencial en solo lectura:* Explora e interactúa con los módulos analíticos y tableros de indicadores integrados en las páginas de la Intranet (tasas de ocupación, matrices de pertinencia educativa e indicadores de encuestas a egresados y calidad formativa) (ver [Sección 3.4.4.2.1: Uso de Tableros BI en la Intranet](#34421-uso-de-tableros-bi-en-la-intranet-power-bi)).
  * *Descarga de presentaciones e informes internos:* Descarga informes analíticos, boletines ejecutivos y presentaciones en formato PDF o PowerPoint para comités de dirección y mesas de trabajo técnico (ver [Sección 3.4.4.3: Descarga Directa de Archivos](#3443-descarga-directa-de-archivos-y-boletines)).
  * *Monitoreo estratégico sin fricción operativa:* Realiza análisis comparativos y seguimiento a los indicadores y metas ocupacionales sobre información consolidada y oficial.

* **Límites operativos y restricciones de seguridad:**
  * No tiene permisos para operar ni autenticarse en el Sitio Web Público (su ámbito exclusivo de trabajo autenticado es la Intranet).
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No posee facultades de edición ni maquetación; no se despliega el menú flotante de edición ni tiene acceso al editor visual.
  * No puede crear, modificar ni eliminar páginas, menús ni contenidos de la plataforma.
  * No administra cuentas de usuario, no crea roles ni configura permisos.
  * No ejecuta cargas masivas de datos en Excel ni accede a la bitácora de auditoría técnica.

#### 3.2.2.3. Estructura y Ámbitos de los Permisos (Las 5 Secciones de Control)

Es fundamental tener presente un principio de seguridad central en la plataforma: **los roles base del sistema (Administrador, Editor base y Director / Subdirector) cuentan con permisos fijos y protegidos por código**. Cuando el Administrador crea una cuenta de usuario y le asigna alguno de estos roles, el sistema le otorga automáticamente sus facultades correspondientes, las cuales **no son modificables ni editables** desde el panel.

Por este motivo, **los únicos roles cuyos permisos son personalizables y editables son los roles hijos o derivados de Editor** (creados bajo el formato «Editor [Nombre]»). Para garantizar un control seguro y detallado sobre las facultades de estos roles especializados, la plataforma del OLO organiza los permisos configurables en **5 secciones funcionales**, ordenadas de menor a mayor alcance operativo:

1. **Acceso:** Controla las puertas de entrada a los dos entornos del sistema (el Sitio Web Público y la Intranet del OLO). Sin estos permisos activos, la cuenta no podrá autenticarse ni visualizar el contenido del portal correspondiente.
2. **Editar:** Regula la intervención sobre el menú y pie de página, aplicables de forma independiente para el Sitio Web y para la Intranet (afecta a todas las páginas de la respectiva aplicación).
3. **Secciones del sitio web:** Define de forma detallada, página por página, el acceso de edición sobre los contenidos del portal público (tales como Inicio, Política de Privacidad y cada una de las páginas dinámicas creadas en el sitio).
4. **Secciones de la intranet:** Controla individualmente la facultad de maquetar y actualizar las páginas y módulos analíticos internos de la Intranet del OLO (Inicio, Tasa de vinculación, Matriz de tendencias, Encuestas y páginas dinámicas internas).
5. **Qué puede hacer dentro del editor:** Determina las capacidades de acción estructural que el usuario puede ejercer dentro del lienzo de trabajo interactivo, tales como la creación de nuevas páginas o la eliminación definitiva de páginas dinámicas existentes.

*(Nota: En la [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos) se describe detalladamente cada permiso individual y se ilustra el procedimiento operativo paso a paso para activarlos o desactivarlos mediante interruptores en el Panel Administrativo al crear o editar roles derivados).*

#### 3.2.2.4. Matriz Comparativa de Acceso y Capacidades

| Capacidad / Entorno del Sistema | Administrador | Editor Base | Roles Hijos de Editor | Director / Subdirector |
| :--- | :---: | :---: | :---: | :---: |
| **Navegar Sitio Web Público y descargar archivos** | Permitido | Permitido | Permitido | Permitido |
| **Inicio de sesión con cuenta SENA (`@sena.edu.co`)** | Permitido | Permitido | Permitido | Permitido |
| **Consultar contenidos y módulos analíticos en Intranet** | Permitido | Permitido | Permitido | Permitido (Solo lectura) |
| **Descargar informes y presentaciones internas** | Permitido | Permitido | Permitido | Permitido |
| **Ingresar al editor visual de páginas** | Permitido | Permitido | Permitido | Sin acceso |
| **Editar páginas asignadas del Sitio Web e Intranet** | Permitido | Permitido | Según asignación manual | Sin acceso |
| **Modificar cabecera y pie de página del portal** | Permitido | Permitido | No (Por defecto) | Sin acceso |
| **Crear nuevas páginas en el portal** | Permitido | Permitido | Según asignación manual | Sin acceso |
| **Eliminar páginas creadas por usuarios** | Permitido | Permitido | Según asignación manual | Sin acceso |
| **Eliminar páginas base del sistema (de fábrica)** | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) | No (Bloqueado) |
| **Guardar borradores y enviar a revisión** | Permitido | Permitido | Permitido | Sin acceso |
| **Aprobar y publicar páginas en producción** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Rechazar páginas en revisión con observaciones** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Descartar versiones en revisión (botón de basurero)** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Ingresar al Panel Administrativo** | Permitido (Exclusivo) | Sin acceso | Sin acceso | Sin acceso |
| **Crear, editar y suspender cuentas de usuario** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Crear roles (exclusivo para roles de Editor) y asignar permisos a mano** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Restablecer contraseñas de otros usuarios** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Carga masiva de datos ocupacionales en Excel** | Permitido | Sin acceso | Sin acceso | Sin acceso |
| **Consultar la bitácora de auditoría del sistema** | Permitido | Sin acceso | Sin acceso | Sin acceso |

---

### 3.2.3. Acceso al sistema

El acceso al ecosistema tecnológico del Observatorio Laboral y Ocupacional (OLO) comprende los mecanismos de navegación pública abierta y los procedimientos de autenticación, recuperación de credenciales y administración de cuentas de usuario para el personal autorizado.

> **Regla de credenciales únicas e inicio de sesión independiente:**
> * **Credenciales idénticas para ambos portales:** Cada funcionario dispone de una **cuenta de usuario única**. Su correo corporativo (`@sena.edu.co`) y su contraseña son exactamente los mismos para entrar tanto al **Sitio Web** como a la **Intranet**.
> * **Autenticación por separado en cada portal:** Las sesiones de usuario son independientes entre portales. Iniciar sesión en el Sitio Web **no** inicia sesión automáticamente en la Intranet (ni viceversa). Por lo tanto, si un funcionario necesita trabajar en ambos entornos, debe autenticarse en el formulario de acceso de cada portal por separado utilizando esas mismas credenciales.

#### 3.2.3.1. Sitio Web Público

##### 3.2.3.1.1. Portal Web Público (Cara visible)
El portal web público es la plataforma principal que refleja el trabajo del Observatorio Laboral y Ocupacional (OLO). Es un entorno dinámico y adaptable donde se publican las páginas maquetadas con diversos componentes interactivos (buscadores de ocupaciones, visores de videos, visores de documentos PDF, tarjetas de indicadores y enlaces de descarga). La apariencia y distribución de los contenidos varían según las prioridades informativas del observatorio. Aunque su contenido principal es público y consultado por la ciudadanía sin requerir autenticación, el personal administrativo y editorial utiliza este mismo entorno como punto de acceso al sistema.

##### 3.2.3.1.2. Inicio de Sesión en el Sitio Web Público (Banner GOV.CO)
El Sitio Web Público no cuenta con un botón directo de "Iniciar Sesión" para la ciudadanía, ya que la navegación por todos sus contenidos es totalmente libre y abierta. Para los funcionarios del SENA, la vía de entrada para autenticarse en el Sitio Web es el enlace interactivo ubicado en la franja superior del Estado (GOV.CO):
* **Punto de acceso en el Sitio Web (Banner GOV.CO):** En la parte superior de la página, dentro de la barra superior de GOV.CO, se ubica a la derecha el reloj interactivo con la **fecha y hora en vivo**. Al hacer clic sobre este texto (identificado con el mensaje de ayuda *"Iniciar sesión"*), el sistema abre la pantalla de inicio de sesión.
* **Credenciales requeridas:**
  * Correo electrónico corporativo con dominio `@sena.edu.co`.
  * Contraseña robusta configurada en la plataforma.
* **Redirección por rol (Exclusivo para el Sitio Web Público):**
  * *Administradores:* Al contar con facultades de gobierno y permisos de administración, el sistema los redirige de manera directa al **Panel Administrativo** (`/admin/dashboard`).
  * *Editores (y roles derivados de Editor):* Al validar sus credenciales y permisos editoriales, el sistema los redirige de vuelta a la página de **Inicio del Sitio Web Público** (`/inicio`), donde se activa y despliega el botón flotante de edición para maquetar páginas y gestionar cabecera y pie.
  * *Directores y Subdirectores:* Al no contar con permisos de edición ni de acceso al panel administrativo en este portal, el sistema muestra la alerta *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolos a ingresar a la Intranet para consultar sus tableros analíticos e indicadores gerenciales.
* **Enlace de recuperación:** La pantalla de autenticación dispone del acceso directo para el restablecimiento de contraseñas ante olvidos *(¿Olvidaste tu contraseña?)*. *(Para consultar la guía visual paso a paso de este acceso, ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).*
* **Aviso de privacidad y protección de datos:** En la base del formulario se ubican los hipervínculos a la **política de privacidad y protección de datos**, los cuales permiten al usuario consultar el documento normativo (`/politica-de-privacidad`) antes de ingresar al sistema.

##### 3.2.3.1.3. Enlace a la Intranet (Botón Intranet)
El botón fijo **"Intranet"** ubicado en la cabecera del portal (extremo superior derecho) no corresponde al inicio de sesión del Sitio Web Público, sino que constituye el enlace directo permanente hacia la plataforma privada de la Intranet del OLO. Al pulsarlo, el usuario es dirigido al entorno de la Intranet, cuya plataforma requiere autenticación para los funcionarios.

#### 3.2.3.2. Intranet del OLO

##### 3.2.3.2.1. Inicio de Sesión en el Entorno Privado de la Intranet
La Intranet es una plataforma privada e independiente orientada al seguimiento gerencial, análisis ocupacional y trabajo interno del SENA:
* **Acceso restringido con autenticación obligatoria:** A diferencia del portal público, la Intranet no permite navegación anónima ni libre. Toda persona debe autenticarse para ingresar mediante su propio formulario de acceso.
* **Roles habilitados:**
  * *Administradores:* Ingresan para supervisar contenidos, maquetar secciones internas o fiscalizar el entorno según sus facultades globales de gobierno.
  * *Editores (y roles derivados autorizados):* Ingresan para maquetar y actualizar secciones internas autorizadas en su rol.
  * *Directores y Subdirectores:* Ingresan con cuenta corporativa `@sena.edu.co` para consultar los módulos de información, matrices e indicadores ocupacionales en modalidad de **solo lectura**, manteniendo protegida la información al no contar con permisos de edición ni administración.
* **Credenciales y validación:** Correo corporativo `@sena.edu.co` y contraseña asignada (requiere autorización de acceso a la Intranet). Al iniciar sesión exitosamente, el sistema despliega el entorno privado de la Intranet con los tableros analíticos e indicadores configurados. *(Para consultar la guía visual paso a paso del acceso a la Intranet, ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).*
* **Aviso de privacidad y protección de datos:** En la base del formulario se disponen los enlaces directos a la política de privacidad y protección de datos del portal público (`/politica-de-privacidad`).

#### 3.2.3.3. Procedimiento de Recuperación de Contraseña (Preguntas de Seguridad)
El sistema del Observatorio Laboral y Ocupacional cuenta con un mecanismo autónomo de restablecimiento de contraseña ante olvidos o bloqueos, unificado para todos los funcionarios tanto en el Sitio Web como en la Intranet:
* **Autonomía sin dependencia de correo externo:** A diferencia de plataformas que envían enlaces o códigos a buzones de correo externos, el aplicativo comprueba la identidad del titular validando las **tres preguntas de seguridad** configuradas obligatoriamente durante el primer ingreso al sistema. Esto previene bloqueos por filtros de spam o falta de disponibilidad de servidores de correo externos.
* **Cuenta única y sincronización de clave:** Al tratarse de un usuario único y compartido entre ambas plataformas, recuperar o actualizar la contraseña desde cualquiera de los dos portales sincroniza de forma automática e inmediata el acceso en ambos.
* **Política de seguridad:** Una vez validadas con éxito las respuestas correspondientes, el usuario puede establecer de inmediato una nueva contraseña que satisfaga los lineamientos de seguridad de la plataforma (longitud mínima de 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Guía operativa paso a paso:** Para consultar el procedimiento interactivo en pantalla con las capturas de cada paso, remitirse a la **[Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)**.

#### 3.2.3.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet. El procedimiento operativo paso a paso y la interfaz para llevar a cabo esta labor se explican a detalle en la **[Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)** de este manual.

#### 3.2.3.5. Primer Ingreso al Sistema (Configuración Inicial de la Cuenta)

Cuando el Administrador crea una cuenta nueva, el funcionario debe completar obligatoriamente la configuración inicial de seguridad antes de poder operar en la plataforma.

##### 3.2.3.5.1. Recepción de Credenciales Iniciales

Toda cuenta nueva recibe una **contraseña temporal con vigencia de 72 horas (3 días)** generada desde el panel administrativo ([Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)). Dado que la plataforma no envía correos automáticos de bienvenida, el Administrador entrega directamente estas credenciales al funcionario a través de los canales internos del SENA. Si la clave no se utiliza dentro de ese plazo, caduca por seguridad y debe ser restablecida por el Administrador.

Al acceder por primera vez con estas credenciales provisorias vigentes, el sistema solicita de manera obligatoria al funcionario completar la configuración inicial de seguridad:
* **Establecimiento de contraseña definitiva:** Registro de una clave personal e intransferible que cumpla con los 5 requisitos de la política de contraseñas robustas (ver [Sección 3.2.1.3: Requisitos de Credenciales](#3213-requisitos-de-credenciales-y-cuentas-de-acceso)).
* **Parametrización de preguntas de seguridad:** Selección y respuesta obligatoria de tres preguntas que habilitan el mecanismo autónomo de recuperación de cuenta ante eventuales bloqueos u olvidos.

El procedimiento se efectúa según el portal de acceso utilizado por el funcionario (Sitio Web Público o Intranet del OLO). Una vez validados estos datos, el sistema guarda la configuración definitiva y concede el acceso formal al portal o sección correspondiente según el rol asignado. *(Para consultar la guía visual paso a paso con las capturas de pantalla de este procedimiento para ambos ámbitos, ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).*

#### 3.2.3.6. Cierre de Sesión y Expiración Preventiva

El cierre de sesión seguro es una práctica obligatoria para salvaguardar la privacidad de las cuentas y proteger la información del observatorio, especialmente al operar en estaciones de trabajo compartidas o redes abiertas:
* **Cierre de sesión en el Panel Administrativo:** Los administradores finalizan su sesión activa mediante el menú desplegable de perfil, ubicado en la parte inferior del menú lateral izquierdo en computadores o en la barra superior en dispositivos móviles, seleccionando la opción **"Cerrar sesión"**.
* **Cierre de sesión en el Sitio Web Público:** Los usuarios con permisos de edición disponen de un botón circular de salida ubicado en la esquina inferior derecha de la pantalla, justo debajo del botón de edición (ícono de lápiz). Al presionarlo, el sistema despliega una ventana de confirmación titulada **"Salir del modo edición"**; tras confirmar con **"Aceptar"**, el sistema cierra formalmente la sesión activa, desconecta la cuenta, oculta los controles de edición y recarga la página en la vista de consulta ciudadana habitual.
* **Cierre de sesión en la Intranet:** Opera de manera diferenciada según las funciones del rol asignado:
  * *Usuarios con permisos de edición (Administrador o Editor):* Cierran sesión desde el botón circular flotante ubicado en la esquina inferior derecha (justo debajo del botón de lápiz), el cual abre la ventana de confirmación titulada **"Salir del modo edición"**; tras confirmar, se cierra la sesión por completo y el sistema redirige a la pantalla de acceso. En este caso, el botón de salida de la barra superior se oculta automáticamente.
  * *Usuarios de solo consulta sin permisos de edición (como Director o Subdirector):* No visualizan controles flotantes en pantalla; en su lugar, utilizan el botón **"Cerrar sesión"** ubicado en el extremo derecho de la barra superior de navegación.
* **Expiración preventiva por inactividad:** Como salvaguarda de seguridad, toda sesión expira de forma automática tras **15 minutos** continuos sin interacción, protegiendo las estaciones de trabajo desatendidas.

*(Para consultar la guía visual paso a paso con las capturas de pantalla del cierre de sesión, ver [Sección 3.4.1.4: Procedimiento de Cierre de Sesión](#3414-procedimiento-de-cierre-de-sesión)).*

---

## 3.3. Guía de navegación e interfaz general

Esta sección familiariza al usuario con el diseño gráfico, los componentes estructurales fijos, los botones estandarizados de acción y las convenciones visuales del sistema de notificaciones y alertas de la plataforma.

---

### 3.3.1. Interfaz General y Menús

La plataforma del Observatorio Laboral y Ocupacional (OLO) articula su experiencia de navegación y administración mediante una clara diferenciación entre las **páginas y controles fijos del sistema**, los **componentes ajustables de cabecera y pie** y el **área central de contenido dinámico maquetable**. Esta sección detalla la disposición visual en los tres portales del ecosistema (**Panel Administrativo**, **Sitio Web Público** e **Intranet**), aclarando qué elementos son estructuralmente fijos, cómo operan los componentes configurables en el editor visual y bajo qué reglas se despliega el botón de edición.

#### 3.3.1.1. Estructura y Elementos del Sistema en los Tres Portales

El sistema se compone de tres portales complementarios, cada uno con propósitos y características de interfaz claramente definidos:

1. **Panel Administrativo (`/admin`):**
   * **Propósito:** Entorno privado de gestión técnica, auditoría y control editorial de acceso exclusivo para el rol de Administrador.
   * **Estructura fija del aplicativo:** A diferencia de las páginas de contenido, el Panel Administrativo **no utiliza el editor visual para sus propias pantallas**. Todas sus vistas están programadas como páginas fijas para garantizar la estabilidad y la seguridad de sus funciones de control y gobierno.
   * **Elementos fijos estructurales:**
     * *Menú lateral permanente (Sidebar):* Barra vertical izquierda que contiene el logo del OLO (retorno al sitio web público), accesos directos (*Dashboard*, *Páginas en revisión* con indicador numérico de alertas pendientes, *Accesos* para la administración de usuarios y roles, *Auditoría*, *Respaldos* y *Carga Masiva*), ícono de campanita de alertas y menú inferior de perfil (*Mi perfil*, *Configuración* y *Cerrar sesión*).
     * *Vistas fijas programadas:* Tablero con tarjetas de métricas, formularios de configuración, tablas paginadas de bitácora y ventanas modales de confirmación con registro obligatorio de motivos.

> **[Captura: Elementos Fijos Panel Administrativo]**
> *Esquema general del Panel Administrativo mostrando los elementos fijos estructurales: el menú lateral permanente (sidebar con accesos de navegación y perfil) y el área central de trabajo.*
>
> **[Captura: Elementos Fijos Panel Administrativo (Móvil)]**
> *Esquema general del Panel Administrativo mostrando los elementos fijos estructurales: el menú lateral permanente (sidebar con accesos de navegación y perfil) y el área central de trabajo. (Móvil).*

2. **Sitio Web Público:**
   * **Propósito:** Portal de acceso abierto y consulta libre para la ciudadanía, investigadores y comunidad general, que sirve a su vez como punto de enlace hacia el entorno privado del observatorio.
   * **Controles y páginas fijas del sistema:**
     * *Franja superior GOV.CO (Fecha y hora en vivo):* Barra superior del Estado donde se ubica el texto interactivo de fecha y hora, que sirve como punto de acceso para que el personal administrativo y editorial inicie sesión (`/login`) en el portal.
     * *Buscador desplegable en la cabecera:* Control interactivo con ícono de lupa que al pulsarse despliega un campo blanco redondeado de búsqueda hacia la izquierda, corriendo suavemente los enlaces del menú hacia el logo y desplegando una lista de resultados en vivo debajo del campo con navegación por teclado y cierre por tecla Escape o clic exterior.
     * *Migas de pan fijas (Breadcrumbs):* Franja de navegación jerárquica ubicada debajo de la cabecera que indica dinámicamente la ruta y página activa del usuario con base en la estructura del menú.
     * *Pestaña fija del Panel de Accesibilidad:* Control interactivo fijado permanentemente en el borde lateral derecho (en color azul institucional) con el ícono universal de accesibilidad, permitiendo abrir el panel de preferencias inclusivas (tamaño de letra, contraste, daltonismo, dislexia, guía de lectura, lector de voz y cursor grande).
     * *Botón flotante «Subir»:* Botón redondeado azul oscuro con flecha y texto blanco ubicado en la esquina inferior derecha, que aparece de forma automática al bajar más de 400 píxeles por la página para retornar al inicio con desplazamiento suave y trasladar el foco al contenedor principal (`<main>`).
     * *Botón de Acceso a la Intranet:* Enlace fijo permanente ubicado en la esquina superior derecha del menú de navegación hacia el portal privado independiente de la Intranet del OLO.
     * *Páginas fijas del aplicativo:* Interfaces programadas de autenticación (`/login`, `/login/recovery`) y pantallas de primer ingreso (`/login/first-login`), las cuales no forman parte de las páginas dinámicas y no pueden ser alteradas ni eliminadas desde el editor.
   * **Componentes ajustables de Cabecera y Pie de página:**
     * Tanto la cabecera como el pie de página funcionan mediante componentes maquetables del editor visual: los editores autorizados (a través de la opción «Menú y pie») pueden personalizar los enlaces del menú, logos, redes y textos informativos. Estos componentes son flexibles y ajustables, pudiendo adaptarse a las necesidades informativas de la plataforma o configurarse según el diseño requerido.
   * **Área central dinámica:** Lienzo donde se despliegan los contenidos maquetados mediante bloques (artículos, cifras, visores y publicaciones).

> **[Captura: Elementos Fijos Sitio Web]**
> *Esquema general del Sitio Web Público con franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Sitio Web (Móvil)]**
> *Esquema general del Sitio Web Público con franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página. (Móvil).*

3. **Intranet del OLO:**
   * **Propósito:** Entorno privado y protegido orientado al seguimiento estratégico, consulta de tableros de indicadores y trabajo interno de directivos y funcionarios del SENA.
   * **Elementos y páginas fijas del sistema:**
     * *Pantalla de bloqueo y acceso obligatorio:* Página fija que intercepta cualquier navegación no autenticada, forzando el ingreso exclusivo con cuenta corporativa `@sena.edu.co`.
     * *Botón flotante «Subir»:* Control interactivo en la esquina inferior derecha que aparece automáticamente al descender más de 400 píxeles para volver al inicio rápidamente con desplazamiento suave (adaptado por encima de la barra de navegación en teléfonos móviles).
     * *Control de salida:* Mecanismo seguro de cierre de sesión adaptado según el rol: visible en la barra superior de navegación para roles de solo consulta (como Director o Subdirector) o mediante el botón flotante inferior con ventana modal de confirmación para funcionarios con permisos de edición.
   * **Componentes ajustables de Cabecera y Pie internos:**
     * Al igual que en el sitio público, el marco superior e inferior de la Intranet está respaldado por componentes configurables que los editores pueden adaptar según las secciones internas del observatorio.
   * **Área central dinámica:** Lienzo donde se presentan las secciones analíticas e indicadores, con la posibilidad de incorporar componentes opcionales de visualización como tableros de Power BI.

> **[Captura: Elementos Fijos Intranet]**
> *Esquema general de la Intranet con barra superior con los controles fijos (buscador interno y botón de cierre de sesión para consulta), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Intranet (Móvil)]**
> *Esquema general de la Intranet con barra superior con los controles fijos (buscador interno y botón de cierre de sesión para consulta), el área de contenido dinámico central y el pie de página. (Móvil).*

#### 3.3.1.2. Botón Flotante de Edición: Despliegue Condicional por Sesión y Permisos

Uno de los elementos interactivos más importantes en el Sitio Web y la Intranet es el **Botón Flotante de Edición (Menú de Edición)**. Aunque forma parte de la estructura visual de las páginas, **su visualización en pantalla es estrictamente condicional**: el sistema comprueba en tiempo real si el usuario ha iniciado sesión y cuáles permisos específicos tiene asignados antes de mostrarlo:

* **Caso 1: Usuario no autenticado (Ciudadanía y visitantes anónimos):**
  * El botón flotante de edición **no se muestra en pantalla** para los visitantes. La página pública se presenta completamente limpia, sin barras ni herramientas de edición, garantizando una lectura despejada y cómoda para la ciudadanía (únicamente se desplegará de forma automática el botón flotante «Subir» al descender más de 400 píxeles por el contenido).

> **[Captura: Vista Ciudadana sin Botón Flotante]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla.*
>
> **[Captura: Vista Ciudadana sin Botón Flotante (Móvil)]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla. (Móvil).*

* **Caso 2: Usuario autenticado con rol de Administrador o Editor (y roles hijos autorizados):**
  * Si el funcionario cuenta con sesión activa y permisos administrativos o editoriales, el sistema despliega el botón circular flotante en la esquina inferior derecha de la pantalla. Al hacer clic o pasar el cursor, el botón despliega exclusivamente las opciones para las que el usuario está autorizado:
    * **"Editar sección":** Aparece si el usuario es Administrador o tiene asignado el permiso para editar esa página específica (del Sitio Web o de la Intranet).
    * **"Menú y pie":** Se activa si el usuario es Administrador o si el rol posee el permiso explícito para editar la cabecera y el pie de página («Menú y pie de página») en el editor visual.
    * **"Nueva página":** Disponible si el usuario es Administrador o cuenta con la facultad de crear nuevas páginas en el sistema.
    * **"Eliminar página":** Se visualiza exclusivamente en páginas dinámicas creadas por usuarios, siempre que el usuario sea Administrador o que su rol tenga el permiso de borrado y la página no posea enlaces activos que generen enlaces rotos.
  * **Regla de restricción por página:** Si un editor con un rol personalizado navega por una página para la cual no tiene permisos asignados, las opciones no autorizadas no estarán visibles; si no tiene permisos para ninguna acción en dicha página, el botón flotante de edición completo se oculta automáticamente.
  * **Coexistencia y coordinación con el botón «Subir»:** Si el usuario se desplaza verticalmente y se activa el botón «Subir», el sistema detecta la presencia del botón flotante de edición y desplaza automáticamente el botón «Subir» hacia su izquierda, evitando que ambos controles se solapen o interfieran entre sí.

> **[Captura: Botón Flotante de Edición]**
> *Despliegue condicional del botón flotante de edición en pantalla para un usuario autenticado con permisos activos.*
>
> **[Captura: Botón Flotante de Edición (Móvil)]**
> *Despliegue condicional del botón flotante de edición en pantalla para un usuario autenticado con permisos activos. (Móvil).*

* **Caso 3: Usuario autenticado sin permisos de edición (Directores y Subdirectores):**
  * Al iniciar sesión con cuenta corporativa `@sena.edu.co`, el sistema identifica que el usuario posee un rol configurado en modo de **solo lectura**. Debido a que no cuenta con facultades de edición ni administración, los botones flotantes inferiores **permanecen completamente ocultos**, impidiendo que el personal directivo ingrese por error al modo de diseño o altere contenidos. En este caso, la opción para finalizar la sesión se mantiene accesible y visible permanentemente en la barra superior de navegación.

> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante]**
> *Pantalla de la Intranet para roles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto.*
>
> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante (Móvil)]**
> *Pantalla de la Intranet para roles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto. (Móvil).*

#### 3.3.1.3. Diferenciación entre Páginas Fijas y Lienzo Dinámico del Editor Visual

La frontera entre la infraestructura base y la gestión de contenido define la seguridad del sistema:
* **Límites de las páginas fijas del sistema:** Ningún usuario, independientemente de sus permisos, puede alterar mediante el editor visual las pantallas programadas fijas (como las interfaces de inicio de sesión o recuperación de credenciales), las validaciones de acceso de la sesión ni las vistas del Panel Administrativo.
* **Área central maquetable (Lienzo del Editor Visual):** Corresponde al lienzo central de trabajo de las páginas del Sitio Web y la Intranet. En esta zona, los editores autorizados pueden organizar y apilar bloques prediseñados:
  * *Textos y encabezados:* Párrafos enriquecidos, títulos y tarjetas de artículos.
  * *Multimedia y lectura:* **Visores de PDF** para documentos oficiales y **visores de videos** para cápsulas del observatorio.
  * *Analítica y datos:* **Tableros BI**, como componente opcional maquetable para embeber paneles interactivos de Power BI cuando la página lo requiera.
  * *Navegación e interacción:* Acordeones de preguntas, enlaces de descarga y botones de enlace.

---

### 3.3.2. Botones, Íconos y Convenciones Visuales

Esta sección presenta los controles, íconos y convenciones visuales de la plataforma para reconocer su función en pantalla. El paso a paso detallado de cada procedimiento operativo se encuentra en la [Sección 3.4: Funcionalidades](#34-funcionalidades).

#### Elementos visuales fijos que se pueden ajustar desde Configuración:
Estos ajustes aplican de forma exclusiva a los **elementos fijos de la interfaz** (las pantallas del **Panel Administrativo** y las herramientas del **Editor Visual**). No corresponden a los contenidos generales ni aplican de forma genérica al Sitio Web Público o a la Intranet:

* **Botones en el panel:** Personalización de color para los botones de las pantallas operativas (principales, secundarios o de reintento).
* **Botones dentro de modales:** Personalización de color para los botones de las ventanas emergentes (confirmar, cancelar o peligro).
* **Etiquetas de ayuda contextual (*tooltips*):** Opción de activarlas o desactivarlas, y personalización de sus colores (fondo y texto).
* **Ícono del panel:** Actualización de la imagen del logotipo en la barra lateral fija del panel.
* **Ícono de la pestaña:** Actualización del ícono (favicon) que se muestra en la pestaña del navegador web y en la barra superior móvil.
* **Sonidos de las notificaciones:** Activación o silenciamiento de los tonos de aviso (éxito, advertencia y error) generados en el panel administrativo.

> **Regla de textos fijos en el Panel y en el Editor Visual:** Todos los textos de estas herramientas son **estrictamente fijos y no se pueden cambiar** (los títulos de los botones como *"Guardar"*, *"Publicar"*, *"Eliminar"*, los nombres de los tooltips en tablas y en el Editor Visual, y los encabezados de las ventanas modales). Solo se puede personalizar su apariencia gráfica (colores, imágenes o sonidos), garantizando que las funciones operativas siempre mantengan la misma denominación y coincidan con este manual.

> **[Captura: Convenciones Visuales y Elementos Configurables]**
> *Esquema de convenciones visuales: elementos de apariencia personalizables desde Configuración (botones en pantallas, botones en modales, tooltips, ícono del panel, ícono de pestaña y sonidos) junto a la inmutabilidad de los textos fijos del sistema.*
>
> **[Captura: Convenciones Visuales y Elementos Configurables (Móvil)]**
> *Esquema de convenciones visuales: elementos de apariencia personalizables desde Configuración (botones en pantallas, botones en modales, tooltips, ícono del panel, ícono de pestaña y sonidos) junto a la inmutabilidad de los textos fijos del sistema. (Móvil).*

#### 3.3.2.1. Estandarización de Botones y Controles de Acción

Todas las interfaces del Panel Administrativo y del Editor Visual comparten un patrón estandarizado de controles para brindar una experiencia consistente y prevenir pérdidas accidentales de información:
* **Botones en las pantallas del panel y editor:**
  * *Controles de confirmación y guardado:* Botones de acción principal (con títulos fijos como "Guardar", "Publicar", "Crear" o "Continuar") para almacenar modificaciones, generar nuevos registros o avanzar versiones hacia la bandeja de revisión.
  * *Controles secundarios y de apoyo:* Botones para operaciones secundarias (con títulos fijos como "Cancelar", "Descartar" o controles para reintentar la carga de listas).
  * *Controles de previsualización:* Botones identificados con ícono de ojo para verificar el resultado final de la página antes de someterla a aprobación.
* **Botones dentro de ventanas modales de diálogo:**
  * *Controles principales de modal:* Botones para confirmar o guardar operaciones en curso (con títulos fijos como "Confirmar" o "Guardar").
  * *Controles secundarios de modal:* Botones para desestimar el cuadro de diálogo (con títulos fijos como "Cancelar").
  * *Controles de peligro o destructivos:* Botones de acción crítica o descarte irreversible (con títulos fijos como "Eliminar" o ícono de papelera) utilizados para borrar páginas dinámicas, eliminar usuarios o descartar borradores. Todo control destructivo requiere obligatoriamente una ventana modal de confirmación secundaria y el registro de una justificación para la auditoría técnica.

> **[Captura: Botones Estandarizados]**
> *Conjunto de botones estandarizados de la plataforma en pantallas y modales: guardado, descarte/eliminación con confirmación modal y previsualización.*
>
> **[Captura: Botones Estandarizados (Móvil)]**
> *Conjunto de botones estandarizados de la plataforma en pantallas y modales: guardado, descarte/eliminación con confirmación modal y previsualización. (Móvil).*

#### 3.3.2.2. Etiquetas Emergentes de Ayuda Contextual (Tooltips)

Para facilitar la navegación y mantener las pantallas despejadas, los controles e íconos que no tienen texto visible disponen de **etiquetas de ayuda (*tooltips*)**:

* **Cómo funcionan en pantalla:**
  * Al pasar el cursor sobre un botón con ícono o seleccionarlo con el teclado, aparece un pequeño aviso flotante indicando de inmediato la acción que realiza (por ejemplo: *«Visualizar»*, *«Ver detalle»*, *«Publicar»*, *«Rechazar»*, *«Editar»*, *«Eliminar»*, *«Activar»* o *«Desactivar»*).
  * El aviso se acomoda de forma automática para no obstruir la vista de trabajo y desaparece al retirar el cursor o cambiar de selección.
  * Están adaptadas para que las personas que naveguen con teclado o utilicen lectores de pantalla puedan consultar la función de cada control sin dificultad.
* **Dónde se encuentran:**
  * *Tablas del Panel Administrativo:* En las columnas de acciones de las tablas operativas (como *Páginas en revisión*, *Usuarios*, *Roles*, *Auditoría* y *Respaldos*), orientando sobre la función de cada ícono.
  * *Herramientas del Editor Visual:* En la barra superior de edición (en accesos como guardar borrador o enviar a revisión) y en el botón flotante inferior.

> **[Captura: Etiquetas Emergentes de Ayuda Contextual (Tooltips)]**
> *Despliegue de etiquetas flotantes de ayuda contextual (tooltips) al interactuar con íconos de acción en tablas del panel y herramientas del editor visual.*
>
> **[Captura: Etiquetas Emergentes de Ayuda Contextual (Tooltips) (Móvil)]**
> *Despliegue de etiquetas flotantes de ayuda contextual (tooltips) al interactuar con íconos de acción en tablas del panel y herramientas del editor visual. (Móvil).*

#### 3.3.2.3. Diseño Adaptable Tipo Acordeón en Dispositivos Móviles (Tablas y Listas)

Para ofrecer una navegación cómoda en teléfonos inteligentes y tabletas, las tablas de datos del Panel Administrativo adoptan automáticamente una **vista adaptable en formato acordeón**:

* **¿Por qué se utiliza este formato?:** En computadores de escritorio, las tablas distribuyen la información horizontalmente a lo largo de varias columnas. En dispositivos móviles, una tabla tradicional exigiría desplazarse incómodamente hacia los lados o reduciría el tamaño del texto hasta hacerlo ilegible. Para resolver esto, el sistema reorganiza la tabla en una lista vertical de tarjetas desplegables.
* **Cómo funciona la interacción en modo acordeón:**
  * **Fila compacta inicial (replegada):** Cada registro aparece en pantalla como una fila delgada que contiene únicamente su dato identificador principal (por ejemplo, el nombre de la persona en la lista de usuarios, el nombre del rol, o una frase resumen con el autor y la acción realizada) acompañado en el extremo derecho de un ícono de flecha hacia abajo. Esto permite explorar con agilidad toda la lista de registros sin sobrecargar la pantalla con datos secundarios.
  * **Toque para desplegar información:** Al presionar o pulsar sobre cualquier parte de la fila, esta se expande hacia abajo y la flecha gira hacia arriba indicando su estado abierto. La tarjeta desplegada revela todos los datos secundarios asociados (como correo electrónico, rol, fecha y hora, estado de la cuenta, interruptor de activación o justificaciones).
  * **Botones de acción táctiles y visibles:** En lugar de los íconos pequeños con etiquetas flotantes utilizados en computador, la fila desplegada en el móvil incorpora botones táctiles grandes de ancho completo con títulos e íconos explícitos (como botones con título **"Editar"**, **"Eliminar"** o **"Ver detalle"**), diseñados con un tamaño apropiado para pulsar cómodamente con el dedo.
  * **Toque para replegar:** Al presionar nuevamente sobre la fila, esta se cierra regresando a su formato compacto. El usuario puede mantener abiertas varias filas de manera simultánea si necesita comparar datos entre registros.
  * **Paginador integrado en la base:** En la parte inferior de la lista se conservan el indicador de registros visibles (por ejemplo, *«Mostrando 1–7 de 7 usuarios»*) y el selector de filas por página, garantizando una navegación ordenada en cualquier tamaño de pantalla.
* **Secciones del panel que funcionan en formato acordeón:**
  * **Usuarios** (detallado en la [Sección 3.4.2.4.1](#34241-submenú-usuarios))
  * **Roles y Permisos** (detallado en la [Sección 3.4.2.4.2](#34242-submenú-roles-y-permisos))
  * **Páginas en Revisión** (detallado en la [Sección 3.4.2.5](#3425-aprobación-y-publicación-de-contenidos-páginas-en-revisión))
  * **Auditoría y Bitácora de Eventos** (detallado en la [Sección 3.4.2.6](#3426-auditoría-y-bitácora-de-eventos))
  * **Respaldos y Restauración de Páginas** (detallado en la [Sección 3.4.2.7](#3427-respaldos-y-restauración-de-páginas))

> **[Captura: Tabla General en Formato Acordeón (Móvil)]**
> *Vista de una tabla del panel administrativo en formato acordeón en dispositivos móviles: filas compactas con flecha indicadora y detalle desplegado con botones táctiles.*

---

### 3.3.3. Mensajes del Sistema y Notificaciones

La plataforma del Observatorio Laboral y Ocupacional (OLO) implementa un sistema unificado y consistente de retroalimentación visual, alertas y notificaciones en pantalla. Su función principal es guiar la experiencia del usuario, advertir sobre condiciones de riesgo, prevenir inconsistencias o pérdidas de información y confirmar el resultado de cada acción en tiempo real.

Esta sección presenta las convenciones visuales, formatos de notificación, señales auditivas y tipología de avisos adoptados en los tres entornos del sistema (**Sitio Web Público**, **Intranet** y **Panel Administrativo**), sirviendo como marco de referencia para identificar e interpretar adecuadamente los mensajes durante los procedimientos descritos en la [Sección 3.4: Funcionalidades](#34-funcionalidades).

#### 3.3.3.1. Tipos y Formatos de Notificaciones en Pantalla

El sistema clasifica sus avisos e interacciones en cinco formatos principales según su nivel de criticidad e impacto en el flujo operativo:

1. **Notificaciones Flotantes:**
   * **Descripción y ubicación:** Mensajes compactos y dinámicos que se despliegan en la esquina superior o inferior derecha de la pantalla.
   * **Comportamiento:** Permanecen visibles entre 3 y 5 segundos y se desvanecen automáticamente sin interrumpir la labor del funcionario. Opcionalmente, cuentan con un botón de cierre rápido con ícono de equis.
   * **Propósito:** Confirmar la finalización correcta de operaciones no destructivas (por ejemplo: *"Borrador guardado exitosamente"*, *"Carga de archivo completada"* o *"Enlace copiado"*).

2. **Alertas en Línea (Validación de Formularios):**
   * **Descripción y ubicación:** Avisos breves que aparecen inmediatamente debajo de la casilla correspondiente (correo, contraseña, listas desplegables o campos de texto).
   * **Comportamiento:** Se muestran de inmediato al salir de la casilla o al presionar el botón para enviar el formulario si los datos no cumplen con los requisitos. El mensaje permanece visible hasta que el usuario corrija la información.
   * **Propósito:** Señalar correcciones necesarias (por ejemplo: ingresar un correo `@sena.edu.co`, usar contraseñas de al menos 8 caracteres o completar campos obligatorios).

3. **Banners y Recuadros Destacados (Alertas en Bloque):**
   * **Descripción y ubicación:** Recuadros destacados ubicados en la parte superior del formulario o en el encabezado de la página.
   * **Comportamiento:** Permanecen fijos en la pantalla mientras persista la situación informada.
   * **Propósito:** Comunicar advertencias importantes, restricciones de permisos, bloqueos de seguridad o contingencias de comunicación con el servicio central (por ejemplo: *"Tu cuenta no tiene permisos de edición ni de acceso al panel"*, *"No tienes permisos para ingresar a la intranet"* o *"Cuenta bloqueada temporalmente por exceso de intentos"*).
   * **Recuperación transversal ante interrupciones de carga (Botón «Reintentar»):** Cuando el sistema experimenta demoras o dificultades temporales de comunicación al consultar los registros de cualquier módulo del panel administrativo (como Usuarios, Roles, Auditoría, Páginas en revisión o Respaldos), la plataforma protege la interfaz ocultando temporalmente los botones de acción principal (como «Crear Usuario», «Nuevo Editor» o «Depurar»), los buscadores, los filtros y las tablas de datos para evitar la presentación de información incompleta. En su lugar, despliega un recuadro destacado informando: *«No pudimos cargar [el módulo correspondiente]»*, acompañado del mensaje explicativo: *«El servidor está tardando en responder, posibles causas: tu conexión a internet o que se esté reiniciando. Espera unos minutos y pulsa «Reintentar», si el problema persiste contacta al equipo técnico.»*, incorporando el botón interactivo **«Reintentar»** para reanudar la consulta de datos al instante sin recargar la página web ni abandonar la sección de trabajo.

4. **Ventanas Modales de Diálogo y Confirmación:**
   * **Descripción y ubicación:** Ventanas emergentes en el centro de la pantalla que oscurecen y bloquean temporalmente el resto de la interfaz para captar la atención del usuario.
   * **Comportamiento:** Detienen la navegación hasta que el usuario elija una opción (**"Confirmar"**, **"Aceptar"** o **"Cancelar"**).
   * **Propósito:** Proteger al usuario de acciones que no se pueden deshacer (por ejemplo: confirmar la eliminación de un registro, escribir el motivo al rechazar una página o advertir si una página no se puede borrar porque tiene enlaces activos).

5. **Indicadores Numéricos y Centro de Notificaciones:**
   * **Descripción y ubicación:** Insignias con un contador numérico superpuestas al ícono de una campana interactiva y junto a elementos específicos del menú lateral (como la opción *"Páginas en revisión"*).
   * **Comportamiento:** Se actualizan automáticamente de fondo. Al hacer clic sobre el ícono de la campana, se despliega la ventana del Centro de Notificaciones listando en detalle cada aviso pendiente. Desde allí, el administrador puede ir directamente al origen del aviso o descartarlo marcándolo como resuelto.
   * **Propósito:** Alertar de forma proactiva y no intrusiva sobre tareas administrativas que requieren atención (por ejemplo: advertir sobre cuentas de usuario que están próximas a caducar o notificar la llegada de nuevos borradores que esperan aprobación editorial).

#### 3.3.3.2. Convenciones Visuales y Tipología de Notificaciones

La plataforma emplea una categorización estandarizada de notificaciones e iconografía para que el usuario identifique instantáneamente la naturaleza y propósito del aviso:

| Tipo de Notificación | Estado | Ícono Asociado | Significado y Contexto de Uso |
| :--- | :--- | :--- | :--- |
| **Éxito** | Confirmación | Ícono de verificación o visto bueno | Operación procesada de manera correcta. Se presenta al guardar borradores, publicar páginas aprobadas, actualizar contraseñas o culminar cargas masivas. |
| **Error** | Fallo o restricción | Ícono de equis o de signo de exclamación | Error crítico, datos no válidos, autenticación fallida, permisos insuficientes o bloqueo por protección contra enlaces rotos. |
| **Advertencia** | Precaución | Ícono de triángulo de advertencia | Situación que demanda atención o cautela del usuario para prevenir pérdidas de información, como sesiones inactivas próximas a expirar o confirmación previa a la eliminación de registros. |
| **Informativo** | Orientación | Ícono de información con letra i | Instrucciones de apoyo, estados en espera, guías de diligenciamiento o aclaraciones operativas sobre el funcionamiento de un módulo. |

> **[Captura: Tipos de Alertas y Notificaciones en Pantalla]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante, mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal de confirmación.*
>
> **[Captura: Tipos de Alertas y Notificaciones en Pantalla (Móvil)]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante, mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal de confirmación. (Móvil).*

#### 3.3.3.3. Señales Auditivas y Sonidos de Notificación

Esta función opera de manera **exclusiva en el Panel Administrativo** (no aplica en el Sitio Web Público ni en la Intranet). Como apoyo a las notificaciones flotantes en pantalla, el panel emite un sonido corto según la acción realizada:

* **Tipos de sonido:**
  * **Éxito:** Tono ascendente que confirma una acción completada (como guardar o publicar).
  * **Advertencia:** Tono doble que previene sobre situaciones que requieren atención (como una sesión próxima a vencer).
  * **Error:** Tono descendente más grave que avisa cuando una acción no se pudo procesar o faltan datos por corregir.
  * *(Los avisos meramente informativos no emiten sonido).*
* **Preferencias en el navegador del administrador:**
  * Los sonidos vienen habilitados por defecto y su preferencia se guarda en el navegador del equipo de cada administrador.
  * Desde **Configuración** en el Panel Administrativo ([Sección 3.4.2.9.2: Sección "Configuración"](#34292-sección-configuración)), el administrador puede activar o silenciar los tonos con un interruptor, y presionar los botones de muestra (*«Éxito»*, *«Advertencia»* y *«Error»*) para escucharlos.

> **[Captura: Señales Auditivas y Sonidos de Notificación]**
> *Muestra de la sincronización entre el despliegue de avisos flotantes y la emisión de tonos auditivos de confirmación, advertencia y error.*
>
> **[Captura: Señales Auditivas y Sonidos de Notificación (Móvil)]**
> *Muestra de la sincronización entre el despliegue de avisos flotantes y la emisión de tonos auditivos de confirmación, advertencia y error. (Móvil).*

---

> **Consulta de Errores Específicos y Catálogo de Validaciones:**
> Para consultar el desglose detallado de validaciones campo a campo, los mensajes de error específicos de cada formulario, sus causas técnicas y las instrucciones de solución paso a paso, remitirse a la [Sección 3.5.1: Catálogo de Validaciones y Solución de Problemas](#351-catálogo-de-validaciones-y-solución-de-problemas).

---

## 3.4. Funcionalidades

Esta sección presenta el paso a paso de las operaciones y flujos de trabajo de la plataforma: autenticación, búsquedas y filtros, gestión integral de información (creación, consulta, modificación y eliminación), generación de reportes en pantalla, exportación de datos y demás procesos existentes en el aplicativo.

---

### 3.4.1. Procedimientos de Autenticación y Acceso

Paso a paso de las cuatro operaciones fundamentales de acceso y salida de la plataforma: primer ingreso para cuentas nuevas, inicio de sesión habitual, recuperación autónoma de contraseña olvidada mediante preguntas de seguridad y procedimiento de cierre de sesión seguro en todos los entornos.

#### 3.4.1.1. Flujo de Primer Ingreso

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema asociadas a este proceso con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.1: Validaciones en el Primer Ingreso](#3511-validaciones-en-el-primer-ingreso)).*

Para realizar el primer ingreso, el nuevo funcionario utiliza su correo corporativo `@sena.edu.co` y la **contraseña temporal (con vigencia de 72 horas)** entregada por el Administrador (generada durante la creación de la cuenta en la [Sección 3.4.2.4.1](#34241-submenú-usuarios)). Todo usuario nuevo debe completar este proceso dentro del plazo para registrar su contraseña definitiva y configurar sus preguntas de seguridad.

El sistema del Observatorio Laboral y Ocupacional dispone de dos formularios de inicio de sesión independientes (uno en el Sitio Web Público y otro en la Intranet del OLO). Cualquier usuario creado por el Administrador puede iniciar sesión o completar su primer ingreso desde cualquiera de los dos portales, siempre que su cuenta cuente con los permisos correspondientes para ese entorno:

* **[Primer Ingreso desde el Sitio Web Público](#primer-ingreso-desde-el-sitio-web-público):** Permite configurar la cuenta desde el inicio de sesión del Sitio Web del OLO. Tras ingresar, acceden a operar las cuentas con permisos de administración (Panel Administrativo) o de edición de páginas (quienes no dispongan de estos permisos recibirán la indicación del sistema).
* **[Primer Ingreso desde la Intranet del OLO](#primer-ingreso-desde-la-intranet-del-olo):** Permite configurar la cuenta desde el inicio de sesión de la Intranet del OLO. Tras ingresar, acceden las cuentas autorizadas con permiso de acceso interno a la Intranet, como Administradores, Editores de Contenido o Directores y Subdirectores para consulta de tableros (quienes no cuenten con dicho permiso recibirán la alerta correspondiente).

##### Primer Ingreso desde el Sitio Web Público

Este procedimiento describe el paso a paso para el funcionario que inicia sesión por primera vez a través del Sitio Web Público del OLO:

1. **Ubicación del acceso en el Sitio Web:** En la barra superior del Sitio Web del OLO (banner GOV.CO), el funcionario ubica en el extremo derecho el texto interactivo con la **fecha y hora en vivo**. Al posar el cursor sobre este elemento, el sistema despliega la indicación *"Iniciar sesión"*. Al hacer clic, se abre la pantalla de inicio de sesión (`/login`).

> **[Captura: Acceso a Inicio de Sesión Sitio Web]**
> *Texto de fecha y hora en el banner GOV.CO del Sitio Web Público para acceder al inicio de sesión.*
>
> **[Captura: Acceso a Inicio de Sesión Sitio Web (Móvil)]**
> *Texto de fecha y hora en el banner GOV.CO del Sitio Web Público para acceder al inicio de sesión. (Móvil).*

2. **Ingreso con credenciales temporales:** En el formulario de inicio de sesión, se debe ingresar el correo corporativo asignado (`@sena.edu.co`) y la contraseña temporal comunicada por el Administrador. Luego, se debe presionar el botón **"Ingresar"**.

> **[Captura: Formulario de Inicio de Sesión Sitio Web]**
> *Formulario de acceso del Sitio Web Público diligenciado con correo corporativo y contraseña provisoria.*
>
> **[Captura: Formulario de Inicio de Sesión Sitio Web (Móvil)]**
> *Formulario de acceso del Sitio Web Público diligenciado con correo corporativo y contraseña provisoria. (Móvil).*

3. **Pantalla de bienvenida y configuración obligatoria:** Al comprobar los datos de acceso, el sistema identifica que se trata del primer ingreso del funcionario y presenta de forma automática la pantalla de configuración inicial para actualizar la seguridad de la cuenta antes de ingresar al portal (`/login/first-login`). En los casos en que la cuenta provenga de un restablecimiento administrativo puntual (únicamente de contraseña o únicamente de preguntas), el aplicativo abre directamente la pantalla correspondiente (`/login/first-login/change-password` o `/login/first-login/security-questions`) para completar únicamente el paso requerido.

> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web]**
> *Pantalla de primer ingreso en el Sitio Web con la indicación del paso y el formulario de actualización de seguridad.*
>
> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web (Móvil)]**
> *Pantalla de primer ingreso en el Sitio Web con la indicación del paso y el formulario de actualización de seguridad. (Móvil).*

4. **Establecimiento de la contraseña definitiva (paso 1, «Actualiza tu seguridad»):** En la pantalla de cambio de clave, el funcionario debe registrar su nueva contraseña personal:
   * En el campo **"Contraseña temporal"**, se digita la clave provisoria recibida.
   * En el campo **"Nueva contraseña"**, se escribe la nueva clave personal. Al entrar en este campo aparece la lista de requisitos de la política (mínimo 12 caracteres, combinar 3 de 4 opciones: mayúsculas, minúsculas, números o símbolos, sin emojis ni tabulaciones, y máximo 72 caracteres, donde las tildes y la ñ cuentan doble), que se van marcando a medida que se cumplen; cuando se cumplen todos, la lista se resume en una línea: **"Cumple todos los requisitos"**.
   * **Regla de no repetición de contraseñas:** La nueva clave no puede coincidir con la contraseña temporal recibida ni con una contraseña anterior de la cuenta. Si se escribe una clave coincidente, el sistema no la acepta y emite directamente bajo la casilla el mensaje: *«Esta contraseña no es válida por seguridad, elige otra.»*, marcando el campo con borde de validación.
   * En el campo **"Ingresa nuevamente la contraseña"**, se reescribe la nueva clave para certificar la coincidencia exacta.
   * El ícono del ojo muestra u oculta lo escrito en cada campo: cerrado mientras la clave está oculta, abierto cuando se ve.
   * Se hace clic en el botón con título **"Continuar"**, que revisa los tres campos y pasa al paso 2. Si algo falta o no coincide, lo indica debajo del campo.

> **[Captura: Contraseña Definitiva Sitio Web]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web.*
>
> **[Captura: Contraseña Definitiva Sitio Web (Móvil)]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web. (Móvil).*

5. **Configuración de preguntas de seguridad (paso 2):** En la pantalla "Protege el acceso a tu cuenta", se deben configurar obligatoriamente las tres preguntas de seguridad, una a la vez, bajo el encabezado **"Preguntas de seguridad"**; tres barras indican en cuál se va. Así se habilita la recuperación de la cuenta ante un posible olvido:
   * Se despliega el menú selector y se elige una pregunta de la lista predefinida del sistema. Una pregunta ya elegida no se puede repetir.
   * Se escribe la respuesta correspondiente en el campo de texto. La respuesta es confidencial; no distingue mayúsculas de minúsculas ni tiene en cuenta los espacios al principio o al final.
   * Se pulsa el botón **"Continuar"** para repetir la selección con la segunda y tercera pregunta del catálogo. En la tercera, el botón dice **"Guardar"**.
   * En la primera pregunta, **"Cancelar"** (debajo de "Continuar") cierra la sesión temporal y vuelve al inicio de sesión sin guardar nada: ni la contraseña nueva ni las preguntas.
   * **"Atrás"** vuelve a la pregunta anterior. Para corregir la contraseña del paso 1 hay que salir con **"Regresar al sitio web del Observatorio"** y entrar otra vez con la contraseña temporal.

> **[Captura: Preguntas de Seguridad Sitio Web]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad Sitio Web (Móvil)]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos (paso 3):** Al procesar las respuestas de seguridad, el sistema guarda la configuración definitiva y muestra el mensaje de confirmación **"¡Configuración completada con éxito! Tu cuenta ya es segura."**, recordando guardar las respuestas en un lugar seguro, ya que son el único método para validar la identidad y cambiar la clave si se olvida. Al presionar el botón **"Iniciar sesión"**, el sistema finaliza la sesión provisional y regresa a la pantalla de inicio de sesión (`/login`). Si se quiere salir antes de terminar, **"Regresar al sitio web del Observatorio"** cierra la sesión temporal sin guardar nada. El funcionario debe iniciar sesión con su contraseña definitiva recién creada, tras lo cual el aplicativo evalúa los permisos específicos de su cuenta:
   * **Administradores:** El sistema los redirige de forma directa al **Panel Administrativo** (`/admin/dashboard`) para gestionar usuarios, roles, bitácora de auditoría y revisión de contenidos.
   * **Editores de Contenido (y roles derivados autorizados):** El sistema los redirige a la **página de inicio del Sitio Web Público** (`/inicio`), donde se despliega de inmediato el **botón flotante de edición** en la esquina de la pantalla para maquetar páginas y gestionar contenidos autorizados.
   * **Directores y Subdirectores (cuentas sin permisos para este portal):** Al estar configurados exclusivamente para la consulta analítica en la Intranet y no poseer permisos de edición ni de acceso al panel en el Sitio Web, el sistema detiene el acceso y muestra la alerta: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolos a ingresar a través del portal de la Intranet (ver [Sección 3.5.1.1: Validaciones en el Primer Ingreso](#3511-validaciones-en-el-primer-ingreso)).

> **[Captura: Confirmación de Configuración Exitosa Sitio Web]**
> *Pantalla de éxito confirmando la configuración de la cuenta en el Sitio Web y botón para iniciar sesión.*
>
> **[Captura: Confirmación de Configuración Exitosa Sitio Web (Móvil)]**
> *Pantalla de éxito confirmando la configuración de la cuenta en el Sitio Web y botón para iniciar sesión. (Móvil).*

##### Primer Ingreso desde la Intranet del OLO

Este procedimiento lo ejecutan los funcionarios (Administradores, Editores autorizados y Directores o Subdirectores) que realizan su primer inicio de sesión directamente en el portal privado de la Intranet:

1. **Acceso a la Intranet:** El funcionario hace clic en el botón fijo **"Intranet"** ubicado en la esquina superior derecha de la cabecera del Sitio Web Público, o ingresa mediante la dirección web (URL) de la Intranet del OLO. Al tratarse de una plataforma privada que requiere autenticación, el sistema presenta la pantalla de acceso (`/login`), estructurada en diseño dividido: a la izquierda, el panel de marca con el logotipo del OLO y el encabezado principal **INTRANET**; a la derecha, la tarjeta contenedora con el formulario de credenciales y el enlace inferior de retorno al portal público.

> **[Captura: Acceso a la Intranet]**
> *Pantalla de acceso de la Intranet del OLO con panel de marca a la izquierda ('INTRANET') y formulario en el panel derecho.*
>
> **[Captura: Acceso a la Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet del OLO con formulario en el panel derecho. (Móvil).*

2. **Ingreso con credenciales temporales:** En el formulario de la Intranet, se debe digitar el correo electrónico corporativo (`@sena.edu.co`) y la contraseña provisoria entregada por el Administrador. Luego, se debe presionar el botón principal **"Ingresar"** (o "Acceder a la Intranet").

> **[Captura: Formulario de Inicio de Sesión Intranet]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet.*
>
> **[Captura: Formulario de Inicio de Sesión Intranet (Móvil)]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet. (Móvil).*

3. **Bienvenida y pasos guiados de configuración:** Al verificar las credenciales temporales, el aplicativo reconoce que la cuenta requiere su configuración inicial y presenta la pantalla de primer ingreso para actualizar la seguridad antes de ingresar a la Intranet (`/login/first-login`). Si la cuenta fue objeto de un restablecimiento puntual por parte del Administrador (solo de clave provisoria o solo de preguntas de seguridad), el sistema la conduce de forma directa a la pantalla respectiva (`/login/first-login/change-password` o `/login/first-login/security-questions`) sin solicitar información que ya se encuentre al día.

> **[Captura: Pantalla de Pasos Guiados Intranet]**
> *Interfaz de primer ingreso de la Intranet con panel informativo izquierdo y formulario de configuración.*
>
> **[Captura: Pantalla de Pasos Guiados Intranet (Móvil)]**
> *Interfaz de primer ingreso de la Intranet con panel informativo y formulario de configuración. (Móvil).*

4. **Establecimiento de la contraseña definitiva:** En el formulario de cambio de clave, el usuario registra su nueva contraseña personal:
   * En el primer campo, se digita la clave provisoria en **"Contraseña temporal"**.
   * En el segundo campo, se escribe la **"Nueva contraseña"**. Al entrar en este campo aparece la lista de requisitos de la política (mínimo 12 caracteres, combinar 3 de 4 opciones: mayúsculas, minúsculas, números o símbolos, sin emojis ni tabulaciones, y máximo 72 caracteres, donde las tildes y la ñ cuentan doble), que se van marcando en tiempo real; cuando se cumplen todos, la lista se resume en una línea: **"Cumple todos los requisitos"**.
   * **Regla de no repetición de contraseñas:** La nueva clave no puede coincidir con la contraseña temporal provisoria ni con una contraseña anterior de la cuenta. Si se escribe una clave coincidente, el sistema no la acepta y despliega directamente debajo del campo el mensaje: *«Esta contraseña no es válida por seguridad, elige otra.»*, marcando el campo con borde de validación.
   * En el tercer campo, se reescribe la clave en **"Ingresa nuevamente la contraseña"**.
   * Se hace clic en el botón **"Continuar"** para validar la información y avanzar.

> **[Captura: Contraseña Definitiva Intranet]**
> *Formulario de actualización de contraseña de la Intranet con validador de requisitos de seguridad.*
>
> **[Captura: Contraseña Definitiva Intranet (Móvil)]**
> *Formulario de actualización de contraseña de la Intranet con validador de requisitos de seguridad. (Móvil).*

5. **Configuración de preguntas de seguridad:** En la pantalla "Escoge tus preguntas y respuestas":
   * Mediante el selector interactivo, se elige la primera pregunta de seguridad del catálogo oficial del sistema.
   * Se escribe la respuesta confidencial correspondiente en el campo de texto.
   * Se presiona el botón **"Continuar"** para responder secuencialmente la segunda y tercera pregunta. En la primera, **"Cancelar"** (debajo del botón) cierra la sesión temporal y vuelve al inicio de sesión sin guardar nada.
   * Al completar la tercera respuesta, el botón principal cambia a **"Guardar"**. Al pulsarlo, el sistema almacena de forma segura las tres preguntas y respuestas de recuperación.

> **[Captura: Preguntas de Seguridad Intranet]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet.*
>
> **[Captura: Preguntas de Seguridad Intranet (Móvil)]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:** La pantalla presenta la confirmación: **"¡Configuración completada con éxito! Tu cuenta ya es segura."**, recordando guardar las respuestas en un lugar seguro, ya que son el único método para validar la identidad y cambiar la clave si se olvida. Al hacer clic en el botón **"Iniciar sesión"**, el sistema cierra la sesión provisional y regresa al formulario de acceso de la Intranet (`/login`). El usuario debe ingresar sus nuevas credenciales definitivas, momento en el cual el sistema valida su identidad y los permisos asignados:
   * **Administradores:** Acceden a la Intranet con plenas facultades de visualización, supervisión editorial y navegación global.
   * **Editores de Contenido (y roles derivados autorizados):** Acceden a la Intranet con el botón flotante habilitado para maquetar y actualizar las páginas internas autorizadas en su rol.
   * **Directores y Subdirectores:** Ingresan a la **pantalla principal de la Intranet** (`/inicio`), habilitando la visualización interactiva de tableros de Power BI, indicadores ocupacionales y descarga de reportes en modalidad de **solo lectura**, sin menú de edición ni acceso al Panel Administrativo.
   * **Cuentas sin permiso para la Intranet:** Si el usuario no cuenta con autorización o permisos para ingresar a este portal, el sistema deniega la entrada mostrando la alerta: *"No tienes permisos para ingresar a la intranet."*

> **[Captura: Confirmación de Configuración Exitosa Intranet]**
> *Pantalla de éxito en la Intranet confirmando la correcta configuración y habilitando el botón para el inicio de sesión formal.*
>
> **[Captura: Confirmación de Configuración Exitosa Intranet (Móvil)]**
> *Pantalla de éxito en la Intranet confirmando la correcta configuración y habilitando el botón para el inicio de sesión formal. (Móvil).*

#### 3.4.1.2. Flujo de Inicio de Sesión Habitual

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema en el inicio de sesión con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).*

Una vez completado el primer ingreso y configurada la contraseña definitiva, los funcionarios autorizados acceden al sistema de forma habitual para sus labores operativas, editoriales o de consulta gerencial.

> **Aclaración sobre credenciales y acceso a los portales:**
> Las credenciales de acceso (correo corporativo `@sena.edu.co` y contraseña definitiva) **son las mismas para ambos portales**. Sin embargo, debido a que el Sitio Web Público y la Intranet son plataformas con sesiones independientes, el usuario debe **iniciar sesión por separado en cada una** con esas mismas credenciales cuando requiera utilizarlas. Iniciar sesión en un portal no habilita automáticamente la sesión en el otro.

Al igual que en la configuración inicial, la plataforma dispone de dos puntos de acceso independientes según el entorno de trabajo y el rol del usuario:

* **[Inicio de Sesión Habitual en el Sitio Web Público](#inicio-de-sesión-habitual-en-el-sitio-web-público):** Permite el acceso al personal con facultades de administración o de edición a través del enlace interactivo de fecha y hora en el banner GOV.CO.
* **[Inicio de Sesión Habitual en la Intranet del OLO](#inicio-de-sesión-habitual-en-la-intranet-del-olo):** Permite el ingreso a la plataforma privada para la consulta de módulos analíticos o labores de gestión interna según el rol asignado.

##### Inicio de Sesión Habitual en el Sitio Web Público

El portal web público no requiere inicio de sesión para la consulta de información abierta a la ciudadanía; para el personal del SENA con facultades administrativas o editoriales, la vía de entrada es el enlace interactivo de la franja superior del Estado:

*(Nota: Si el funcionario ingresa por primera vez con su contraseña temporal provisoria, el sistema reconocerá la configuración inicial pendiente y lo guiará de manera obligatoria por el flujo detallado en [Primer Ingreso desde el Sitio Web Público](#primer-ingreso-desde-el-sitio-web-público)).*

1. **Ubicación del enlace de acceso (Banner GOV.CO):** En la parte superior de la página, dentro de la barra superior oficial de GOV.CO, se ubica el texto interactivo de **fecha y hora** en la esquina derecha. Al colocar el cursor sobre el texto, se muestra la etiqueta flotante *"Iniciar sesión"*. Al hacer clic sobre dicho elemento, la pantalla se traslada directamente al formulario de ingreso (`/login`).
   *(Aclaración: El botón "Intranet" en el menú principal no es para iniciar sesión en la web, sino que conduce a la plataforma privada).*

> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO]**
> *Texto de fecha y hora en el extremo derecho de la barra GOV.CO para acceder al inicio de sesión.*
>
> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO (Móvil)]**
> *Texto de fecha y hora en la barra GOV.CO para acceder al inicio de sesión. (Móvil).*

2. **Visualización de la pantalla de inicio de sesión:** La pantalla presenta el logotipo del observatorio con el título **"Panel de Administración"**, las casillas **"Correo SENA"** y **"Contraseña"**, el aviso de privacidad, el botón **"Ingresar"** y el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"** para restablecer la clave en caso de olvido.

> **[Captura: Formulario de Autenticación Sitio Web]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación.*
>
> **[Captura: Formulario de Autenticación Sitio Web (Móvil)]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación. (Móvil).*

3. **Diligenciamiento de correo y contraseña:** En el formulario de acceso, se completan ambas casillas:
   * En la casilla superior **"Correo SENA"**, se escribe la cuenta corporativa (`@sena.edu.co`).
   * En la casilla inferior **"Contraseña"**, se escribe la clave definitiva personal. Se puede hacer clic sobre el **ícono de ojo** situado a la derecha de la casilla para ver u ocultar los caracteres escritos y confirmar que la escritura sea correcta: el ojo está cerrado mientras la clave está oculta y abierto cuando se ve.

> **[Captura: Credenciales Definitivas en Sitio Web]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión.*
>
> **[Captura: Credenciales Definitivas en Sitio Web (Móvil)]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión. (Móvil).*

4. **Envío de credenciales:** Al hacer clic en el botón principal **"Ingresar"**, el sistema muestra un indicador de carga en pantalla mientras valida los datos de acceso y da paso al entorno correspondiente según el rol del usuario.

> **[Captura: Ejecución de Inicio de Sesión Sitio Web]**
> *Botón 'Ingresar' activo para iniciar la sesión en el Sitio Web.*
>
> **[Captura: Ejecución de Inicio de Sesión Sitio Web (Móvil)]**
> *Botón 'Ingresar' activo para iniciar la sesión en el Sitio Web. (Móvil).*

5. **Validación de acceso según el rol del usuario:** La plataforma comprueba el tipo de cuenta:
   * Si la cuenta corresponde a un Administrador o Editor, el sistema autoriza la entrada y da paso inmediato a la vista correspondiente.
   * Si se trata de un Director o Subdirector (cuyo rol está destinado a la Intranet), la pantalla no avanza y muestra un recuadro de aviso con el mensaje: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, indicándole que debe ingresar por el portal de la Intranet (ver [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).

> **[Captura: Verificación de Autorización Sitio Web]**
> *Validación del tipo de usuario en pantalla para dar paso al entorno correspondiente o mostrar la indicación hacia la Intranet.*
>
> **[Captura: Verificación de Autorización Sitio Web (Móvil)]**
> *Validación del tipo de usuario en pantalla para dar paso al entorno correspondiente o mostrar la indicación hacia la Intranet. (Móvil).*

6. **Despliegue del entorno de trabajo en pantalla:** Al completarse el ingreso, la pantalla cambia automáticamente según el rol del funcionario:
   * **Administradores:** La pantalla muestra el **Panel Administrativo** (`/admin/dashboard`), con la barra lateral de navegación a la izquierda (Usuarios, Roles, Auditoría y Revisión) y las tarjetas de resumen informativo en el centro.
   * **Editores de Contenido:** El navegador regresa a la portada del **Sitio Web Público** (`/inicio`), donde aparece de inmediato en la esquina inferior derecha el **botón flotante circular de edición** (ícono de lápiz) para comenzar a maquetar y modificar páginas autorizadas.

> **[Captura: Redirección y Despliegue de Rol Sitio Web]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores.*
>
> **[Captura: Redirección y Despliegue de Rol Sitio Web (Móvil)]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores. (Móvil).*

##### Inicio de Sesión Habitual en la Intranet del OLO

La Intranet es una plataforma privada e independiente del Sitio Web Público, concebida para el seguimiento gerencial, análisis de indicadores y trabajo interno. Su sistema de inicio de sesión es totalmente independiente:

*(Aclaración de acceso: Para ingresar a la Intranet se utiliza el **mismo correo corporativo y la misma contraseña** configurados en el Sitio Web. No obstante, al tratarse de entornos separados, el usuario debe autenticarse directamente en la Intranet para habilitar su acceso privado, incluso si ya tenía una sesión iniciada en el Sitio Web).*

*(Nota: Si un nuevo funcionario (Administrador, Editor o Directivo) accede por primera vez con su contraseña temporal provisoria, el sistema activará de forma automática el flujo de primer ingreso descrito en [Primer Ingreso desde la Intranet del OLO](#primer-ingreso-desde-la-intranet-del-olo)).*

1. **Ubicación del botón de acceso a la Intranet:** Desde la página del Sitio Web Público, se hace clic sobre el botón destacado **"Intranet"** en la parte superior derecha de la cabecera, o bien se ingresa la dirección web oficial de la Intranet en el navegador.

> **[Captura: Botón Acceso Intranet en Cabecera]**
> *Botón 'Intranet' visible en la cabecera superior derecha del Sitio Web para dirigirse al entorno privado.*
>
> **[Captura: Botón Acceso Intranet en Cabecera (Móvil)]**
> *Botón 'Intranet' visible en la cabecera del Sitio Web para dirigirse al entorno privado. (Móvil).*

2. **Visualización de la pantalla de acceso:** Al tratarse de un espacio privado, se despliega una pantalla dividida en dos áreas: a la izquierda, el panel lateral con el logotipo del OLO y el título principal **INTRANET**; a la derecha, la tarjeta contenedora con el formulario de ingreso, el botón principal con título "Ingresar" y el enlace exterior de retorno al sitio web.

> **[Captura: Pantalla Bloqueo Intranet]**
> *Pantalla de acceso de la Intranet con panel de marca a la izquierda ('INTRANET') y tarjeta de ingreso a la derecha.*
>
> **[Captura: Pantalla Bloqueo Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet con formulario de ingreso centrado en dispositivos móviles.*

3. **Diligenciamiento de credenciales en el formulario y aviso legal:** En la tarjeta de acceso, se completan los campos requeridos:
   * **Correo SENA:** Se digita la cuenta corporativa (`@sena.edu.co`).
   * **Contraseña:** Se ingresa la clave personal definitiva. El usuario puede utilizar el botón interactivo con el **ícono de ojo** situado a la derecha del campo para alternar la visualización de los caracteres y verificar la escritura correcta.
   * **Vínculos de política de privacidad y protección de datos:** En la base del formulario, el sistema informa que el ingreso implica la aceptación de los lineamientos de la entidad. Al pulsar sobre los enlaces destacados de *"política de privacidad"* o *"protección de datos"*, la plataforma traslada al usuario al documento normativo del Observatorio (`/politica-de-privacidad` en el portal público) para consultar las directivas de seguridad de la información y tratamiento de datos personales.

> **[Captura: Credenciales Definitivas Intranet]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de la Intranet.*
>
> **[Captura: Credenciales Definitivas Intranet (Móvil)]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de la Intranet. (Móvil).*

4. **Clic en el botón Ingresar:** Se presiona el botón principal **"Ingresar"**. La interfaz muestra una breve animación de carga mientras procesa el acceso hacia el portal.

> **[Captura: Botón Acceder Intranet]**
> *Acción de hacer clic sobre el botón 'Ingresar' en el formulario de la Intranet.*
>
> **[Captura: Botón Acceder Intranet (Móvil)]**
> *Acción de hacer clic sobre el botón 'Ingresar' en el formulario de la Intranet. (Móvil).*

5. **Comprobación de permiso de ingreso a la Intranet:** La plataforma confirma que la cuenta tenga habilitado el acceso a este entorno privado:
   * Si el funcionario tiene permiso concedido, el formulario da paso directo al interior de la Intranet.
   * Si la cuenta no cuenta con permiso asignado para ingresar a este portal, la pantalla muestra una alerta destacada: *"No tienes permisos para ingresar a la intranet."* (ver [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).
   * Si la cuenta se encuentra desactivada o suspendida preventivamente por el Administrador (o vencida por caducidad), el sistema interrumpe el acceso y muestra la alerta: *"Cuenta inactiva o suspendida"*.

> **[Captura: Verificación de Autorización en Intranet]**
> *Mensaje informativo en pantalla confirmando el acceso o con alerta de falta de permiso de acceso.*
>
> **[Captura: Verificación de Autorización en Intranet (Móvil)]**
> *Mensaje informativo en pantalla confirmando el acceso o con alerta de falta de permiso de acceso. (Móvil).*

6. **Despliegue de los módulos y herramientas según rol:** La interfaz se abre mostrando los contenidos correspondientes a cada rol:
   * **Administradores:** Visualizan todas las secciones de la Intranet con libertad de navegación y herramientas de supervisión activas.
   * **Editores de Contenido:** Acceden a las páginas internas autorizadas, visualizando el **botón flotante de edición** para maquetar bloques de contenido.
   * **Directores y Subdirectores:** Ingresan directamente a la **pantalla principal de la Intranet** (`/inicio`), visualizando en pantalla los **tableros interactivos de Power BI**, indicadores del mercado laboral y botones de descarga de reportes en modalidad de **solo lectura** (sin botones de edición ni accesos administrativos).

> **[Captura: Inicio Exitoso Intranet]**
> *Pantalla principal de la Intranet mostrando los tableros analíticos de Power BI e indicadores gerenciales en pantalla.*
>
> **[Captura: Inicio Exitoso Intranet (Móvil)]**
> *Pantalla principal de la Intranet mostrando los tableros analíticos de Power BI e indicadores gerenciales en pantalla. (Móvil).*

#### 3.4.1.3. Procedimiento de Recuperación de Contraseña

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema en este proceso, remitirse a la [Sección 3.5.1.3: Validaciones en la Recuperación de Contraseña](#3513-validaciones-en-la-recuperación-de-contraseña)).*

*(Aclaración — Cuenta única y sincronización de credenciales: Las cuentas de usuario son compartidas entre el Sitio Web y la Intranet; los permisos asignados determinan a qué entorno se puede ingresar. Restablecer la contraseña desde cualquiera de los dos portales actualiza de inmediato el acceso en ambos).*

Este procedimiento permite a cualquier funcionario restablecer de forma autónoma su clave de acceso ante olvidos o bloqueos, validando su identidad mediante las tres preguntas de seguridad configuradas durante el primer ingreso, sin requerir intervención del administrador ni depender del envío de correos electrónicos externos:

* **[Recuperación de Contraseña desde el Sitio Web Público](#recuperación-de-contraseña-desde-el-sitio-web-público):** Flujo de recuperación para funcionarios y editores a partir de la tarjeta de inicio de sesión del portal público.
* **[Recuperación de Contraseña desde la Intranet del OLO](#recuperación-de-contraseña-desde-la-intranet-del-olo):** Flujo de recuperación para directivos y personal interno desde la pantalla de bienvenida y acceso de la Intranet.

##### Recuperación de Contraseña desde el Sitio Web Público

1. **Ubicación del enlace de recuperación en el Sitio Web:** En la pantalla de inicio de sesión del Sitio Web (`/login`), a la cual se accede mediante el texto interactivo de fecha y hora de la franja GOV.CO, se ubica en la parte inferior de la tarjeta central el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"**. Al hacer clic sobre él, el sistema traslada al usuario a la pantalla de recuperación (`/login/recovery`).

> **[Captura: Enlace de Recuperación en Sitio Web]**
> *Enlace '¿Olvidaste tu contraseña?' en la parte inferior del formulario de inicio de sesión del Sitio Web.*
>
> **[Captura: Enlace de Recuperación en Sitio Web (Móvil)]**
> *Enlace '¿Olvidaste tu contraseña?' en el formulario de inicio de sesión del Sitio Web. (Móvil).*

2. **Ingreso del correo corporativo:** En la pantalla con el título *"Recupera el acceso a tu cuenta"*, se digita la cuenta de correo corporativo (`@sena.edu.co`) en la casilla **"Ingresa tu correo SENA"** y se presiona el botón principal **"Comenzar"**. El sistema valida el formato del correo y comprueba si la cuenta dispone de preguntas de seguridad configuradas. El enlace **"Iniciar sesión"** bajo el botón permite regresar a la pantalla de acceso en caso de requerirse.

> **[Captura: Ingreso de Correo de Recuperación Sitio Web]**
> *Casilla de correo corporativo diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web.*
>
> **[Captura: Ingreso de Correo de Recuperación Sitio Web (Móvil)]**
> *Casilla de correo corporativo diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web. (Móvil).*

3. **Respuesta a las preguntas de seguridad:** En la pantalla *"Validación de identidad"* (`/login/recovery/security-questions`), la interfaz despliega una a una las tres preguntas de seguridad seleccionadas por el usuario durante su primer ingreso; el avance se indica con tres barras. Bajo **"Preguntas de seguridad"** se muestra la pregunta en un recuadro; se digita la respuesta en el campo **"Respuesta"** y se pulsa **"Continuar"**. La respuesta no distingue mayúsculas de minúsculas ni tiene en cuenta los espacios al principio o al final. En la primera pregunta, el enlace **"Iniciar sesión"** debajo del botón permite salir y regresar al inicio de sesión; desde la segunda pregunta, **"Volver a la pregunta anterior"** permite corregir la anterior. Las tres se verifican juntas al final: si alguna no coincide, el sistema lo indica sin decir cuál y el cuestionario vuelve a empezar desde la primera pregunta.

> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web]**
> *Cuestionario presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web (Móvil)]**
> *Cuestionario presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web. (Móvil).*

4. **Establecimiento de la nueva contraseña:** En la pantalla de restablecimiento (`/login/recovery/reset-password`), al validar satisfactoriamente las respuestas, la pantalla saluda por el nombre (*"¡Enhorabuena, [nombre]!"*) y, bajo **"Crea tu nueva contraseña"**, habilita los campos **"Nueva contraseña"** e **"Ingresa nuevamente la contraseña"**. Al entrar en el primero aparece la lista de requisitos de la política de seguridad, que se van marcando a medida que se cumplen y se resumen en **"Cumple todos los requisitos"** cuando se cumplen todos. La nueva clave no puede repetir la contraseña actual ni la inmediatamente anterior de la cuenta; de coincidir, el sistema lo indica bajo la casilla con el mensaje: *«Esta contraseña no es válida por seguridad, elige otra.»*, marcando el campo con borde de validación. El usuario digita su nueva clave personal y presiona el botón **"Guardar"**. El enlace **"Cancelar"**, debajo del botón, abandona el proceso sin cambiar la contraseña y vuelve al inicio de sesión.

> **[Captura: Restablecimiento de Contraseña Sitio Web]**
> *Formulario de ingreso de nueva contraseña con validador de requisitos de seguridad en el Sitio Web.*
>
> **[Captura: Restablecimiento de Contraseña Sitio Web (Móvil)]**
> *Formulario de ingreso de nueva contraseña con validador de requisitos de seguridad en el Sitio Web. (Móvil).*

5. **Confirmación de actualización y retorno al acceso:** La interfaz presenta la pantalla de confirmación exitosa (`/login/recovery/reset-success`) con el mensaje *"¡Genial, tu clave ha sido actualizada con éxito!"*, junto a las indicaciones *"Ya puedes ingresar a tu cuenta con tu nueva contraseña. ¡Tu seguridad es nuestra prioridad!"*. Al presionar el botón **"Iniciar sesión"**, el sistema redirige a la pantalla de acceso (`/login`) para ingresar con la nueva clave (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

> **[Captura: Confirmación de Clave Actualizada Sitio Web]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión.*
>
> **[Captura: Confirmación de Clave Actualizada Sitio Web (Móvil)]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión. (Móvil).*

##### Recuperación de Contraseña desde la Intranet del OLO

1. **Ubicación del enlace de recuperación en la Intranet:** En la pantalla de acceso de la Intranet (`/login`), se ubica bajo el formulario de credenciales el enlace interactivo **"¿Olvidaste tu contraseña?"**. Al hacer clic sobre dicho enlace, la pantalla se traslada a la vista de recuperación de la Intranet (`/login/recovery`).

> **[Captura: Enlace de Recuperación en Intranet]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet.*
>
> **[Captura: Enlace de Recuperación en Intranet (Móvil)]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet. (Móvil).*

2. **Ingreso del correo corporativo:** En la pantalla con el título *"Ingresa tu correo SENA"*, se digita la cuenta de correo corporativo (`@sena.edu.co`) en la casilla correspondiente y se presiona el botón principal **"Comenzar"**. El sistema valida el formato del correo y comprueba si la cuenta dispone de preguntas de seguridad configuradas.

> **[Captura: Ingreso de Correo de Recuperación Intranet]**
> *Tarjeta de recuperación de la Intranet con el campo de correo corporativo y botón 'Comenzar'.*
>
> **[Captura: Ingreso de Correo de Recuperación Intranet (Móvil)]**
> *Tarjeta de recuperación de la Intranet con el campo de correo corporativo y botón 'Comenzar'. (Móvil).*

3. **Respuesta a las preguntas de seguridad:** En la pantalla *"Verifica tu identidad"* (`/login/recovery/security-questions`), la interfaz despliega una a una las tres preguntas de seguridad seleccionadas por el usuario durante su primer ingreso, indicando el avance mediante puntos indicadores. Se digita la respuesta confidencial correspondiente en el campo de texto y se pulsa el botón **"Siguiente"** (o **"Verificar"** en la última pregunta) para validar las respuestas. Por motivos de seguridad, el sistema otorga un margen de hasta **3 intentos consecutivos**; si se fallan las respuestas 3 veces seguidas, la cuenta se bloquea automáticamente por **30 minutos**.

> **[Captura: Preguntas de Seguridad en Recuperación Intranet]**
> *Asistente guiado de preguntas de seguridad con indicador de avance mediante puntos de progreso en la Intranet.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Intranet (Móvil)]**
> *Asistente guiado de preguntas de seguridad con indicador de avance en la Intranet. (Móvil).*

4. **Establecimiento de la nueva contraseña:** En la pantalla de restablecimiento (`/login/recovery/reset-password`), al validar satisfactoriamente las respuestas, la pantalla *"Crea tu nueva contraseña"* habilita los campos **"Nueva contraseña"** e **"Ingresa nuevamente la contraseña"**. El usuario digita su nueva clave personal verificando que cumpla con los requisitos de la política de seguridad (no pudiendo repetir la contraseña actual ni la anterior de la cuenta, lo cual se señala bajo el campo con el mensaje: *«Esta contraseña no es válida por seguridad, elige otra.»*, marcando el campo con borde de validación) y presiona el botón **"Guardar contraseña"**. El enlace **"Cancelar"**, debajo del botón, abandona el proceso sin cambiar la contraseña y vuelve al inicio de sesión.

> **[Captura: Restablecimiento de Contraseña Intranet]**
> *Formulario de nueva contraseña con lista interactiva de requisitos y botón 'Guardar contraseña' en la Intranet.*
>
> **[Captura: Restablecimiento de Contraseña Intranet (Móvil)]**
> *Formulario de nueva contraseña con lista interactiva de requisitos en la Intranet. (Móvil).*

5. **Confirmación de actualización y retorno al acceso:** La interfaz presenta la pantalla de confirmación exitosa (`/login/recovery/reset-success`) con el título *"¡Genial, tu clave ha sido actualizada con éxito!"* y el mensaje *"Ya puedes ingresar a tu cuenta con tu nueva contraseña. ¡Tu seguridad es nuestra prioridad!"* (en tablet y escritorio, dentro de la tarjeta contenedora). Al presionar el botón **"Ir a iniciar sesión"**, el sistema redirige automáticamente a la pantalla de acceso de la Intranet (`/login`) para ingresar con la nueva clave (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

> **[Captura: Confirmación de Clave Actualizada Intranet]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión.*
>
> **[Captura: Confirmación de Clave Actualizada Intranet (Móvil)]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión. (Móvil).*

#### 3.4.1.4. Procedimiento de Cierre de Sesión

*(Nota: Para consultar el comportamiento ante el cierre involuntario por inactividad, la advertencia preventiva y las alertas de sesión expirada en la pantalla de acceso, remitirse a la [Sección 3.5.1.4: Cierre de Sesión por Inactividad y Alertas de Expiración](#3514-cierre-de-sesión-por-inactividad-y-alertas-de-expiración)).*

El sistema provee mecanismos específicos de salida segura según el entorno en el que se encuentre trabajando el usuario, adaptando la interfaz para garantizar comodidad visual y prevenir desconexiones involuntarias:

##### Cierre de Sesión desde el Panel Administrativo

El Panel Administrativo mantiene su mecanismo centralizado de salida a través del menú de perfil del usuario:

1. **Acceso al menú desplegable de perfil:** En el entorno de escritorio, se hace clic sobre el bloque interactivo con el nombre y correo del funcionario ubicado en la base inferior del menú lateral izquierdo (acompañado de un ícono de flecha hacia arriba). Si se navega desde un dispositivo móvil, se presiona el bloque interactivo con el nombre del usuario ubicado en la barra superior de navegación.

> **[Captura: Menú de perfil en Panel Admin]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo.*
>
> **[Captura: Menú de perfil en Panel Admin (Móvil)]**
> *Menú desplegable de perfil en la barra superior del Panel Administrativo. (Móvil).*

2. **Ejecución y cierre del sistema:** En el submenú contextual que se despliega en pantalla, se selecciona la opción **"Cerrar sesión"** (identificada con el ícono de puerta y flecha de salida). El sistema finaliza la sesión de inmediato de forma segura y redirige automáticamente al usuario a la pantalla de acceso principal (`/login`).

> **[Captura: Opción de cerrar sesión en Panel Admin]**
> *Opción explícita de 'Cerrar sesión' en escritorio.*
>
> **[Captura: Opción de cerrar sesión en Panel Admin (Móvil)]**
> *Opción explícita de 'Cerrar sesión' en dispositivo móvil.*

##### Cierre de Sesión desde el Sitio Web Público

En el portal público, los usuarios autenticados con permisos de edición disponen de un control flotante con confirmación previa:

1. **Ubicación del control de salida flotante:** Mientras exista una sesión activa con privilegios de edición (roles de Administrador o Editor), en la esquina inferior derecha de la pantalla se visualiza el menú flotante de acciones. Justo debajo del botón principal de edición (ícono de lápiz), se encuentra permanentemente visible el **botón circular de salida** (con ícono de puerta y flecha, y texto indicativo *"Salir del modo edición"* al pasar el cursor).

> **[Captura: Botón Flotante de Salida en Sitio Web]**
> *Botón circular de salida situado justo debajo del botón del lápiz en la esquina inferior derecha del Sitio Web Público.*
>
> **[Captura: Botón Flotante de Salida en Sitio Web (Móvil)]**
> *Botón circular de salida situado justo debajo del botón del lápiz en la esquina inferior derecha del Sitio Web Público. (Móvil).*

2. **Confirmación de salida:** Al presionar el botón de salida, el sistema despliega la ventana de confirmación titulada **"Salir del modo edición"**, la cual incorpora el mensaje informativo: *«Saldrás del modo edición, volverás a la pantalla de inicio de sesión. Requiere volver a iniciar sesión para editar.»*, disponiendo de dos opciones:
   * **Cancelar:** Cierra la ventana emergente y mantiene la sesión activa.
   * **Aceptar:** Cierra la sesión activa en el sistema. Al confirmar esta opción, la sesión del usuario finaliza por completo (no se limita a desactivar el modo de edición), por lo que para realizar nuevas ediciones se requerirá iniciar sesión nuevamente.

> **[Captura: Modal de Confirmación Salir del Modo Edición Sitio Web]**
> *Ventana de confirmación 'Salir del modo edición' en el Sitio Web Público.*
>
> **[Captura: Modal de Confirmación Salir del Modo Edición Sitio Web (Móvil)]**
> *Ventana de confirmación 'Salir del modo edición' en el Sitio Web Público. (Móvil).*

3. **Retorno a la vista pública:** Al confirmar la salida, el sistema finaliza la sesión activa, retira los controles flotantes de edición y recarga la página en la vista de consulta ciudadana habitual.

> **[Captura: Vista estándar del Sitio Web (Sesión cerrada)]**
> *Pantalla recargada tras cerrar sesión, mostrando la interfaz libre de controles flotantes de edición.*
>
> **[Captura: Vista estándar del Sitio Web (Móvil - Sesión cerrada)]**
> *Pantalla recargada tras cerrar sesión, mostrando la interfaz libre de controles flotantes de edición. (Móvil).*

##### Cierre de Sesión desde la Intranet

La Intranet adapta el mecanismo de salida según los permisos del rol asignado:

* **Caso 1: Funcionarios con permisos de edición (Administradores y Editores):**
  1. **Ubicación del botón flotante:** El botón de salida de la barra superior se oculta automáticamente para mantener limpia la cabecera. El usuario utiliza el **botón circular flotante** situado en la esquina inferior derecha, justo debajo del botón de edición (ícono de lápiz).
  2. **Confirmación de salida:** Al presionar el botón flotante, el sistema abre la ventana de confirmación titulada **"Salir del modo edición"**, con el mensaje informativo: *«Saldrás del modo edición, volverás a la pantalla de inicio de sesión. Requiere volver a iniciar sesión para editar.»*, disponiendo de dos opciones:
     * **Cancelar:** Cierra la ventana emergente y mantiene la sesión activa.
     * **Aceptar:** Cierra la sesión activa en el sistema. Al confirmar esta opción, la sesión del usuario finaliza por completo y se traslada la pantalla de inmediato a la vista de autenticación de la Intranet (`/login`).
  3. **Retorno al acceso:** Al confirmarse el cierre de sesión, la interfaz exige digitar nuevamente las credenciales correspondientes para volver a ingresar.

> **[Captura: Botón Flotante y Modal de Confirmación en Intranet (Usuarios con edición)]**
> *Botón flotante inferior debajo del lápiz y ventana modal de confirmación 'Salir del modo edición' en la Intranet.*
>
> **[Captura: Botón Flotante y Modal de Confirmación en Intranet (Usuarios con edición - Móvil)]**
> *Botón flotante inferior debajo del lápiz y ventana modal de confirmación 'Salir del modo edición' en la Intranet. (Móvil).*

* **Caso 2: Funcionarios de solo consulta sin permisos de edición (Directores y Subdirectores):**
  1. **Ausencia de botones flotantes:** Al no contar con facultades de edición, la interfaz no muestra ningún botón flotante en pantalla.
  2. **Ubicación en la barra superior:** El usuario dispone del botón directo **"Cerrar sesión"** ubicado en el extremo superior derecho de la barra de navegación fija (junto al buscador interno). En dispositivos móviles, se ubica en la cabecera superior.
  3. **Ejecución y salida directa:** Al presionar este botón, el sistema cierra la sesión de inmediato y redirige a la pantalla de ingreso de la Intranet (`/login`).

> **[Captura: Botón Cerrar Sesión en Barra Superior Intranet (Roles de consulta)]**
> *Botón directo de 'Cerrar sesión' en el extremo derecho de la barra superior fija de la Intranet para roles de solo consulta.*
>
> **[Captura: Botón Cerrar Sesión en Barra Superior Intranet (Roles de consulta - Móvil)]**
> *Botón directo de 'Cerrar sesión' en la cabecera superior móvil de la Intranet para roles de solo consulta. (Móvil).*
>
> **[Captura: Retorno al Login de Intranet tras cerrar sesión]**
> *Pantalla de acceso de la Intranet (`/login`) desplegada automáticamente tras el cierre de la sesión.*
>
> **[Captura: Retorno al Login de Intranet tras cerrar sesión (Móvil)]**
> *Pantalla de acceso de la Intranet (`/login`) desplegada automáticamente tras el cierre de la sesión. (Móvil).*

---

### 3.4.2. Panel Administrativo

El Panel Administrativo (`/admin`) constituye el centro de gobierno y control integral del Observatorio Laboral y Ocupacional (OLO), de acceso exclusivo para el rol **Administrador**. A continuación se detalla su estructura visual y se consolidan en una única secuencia operativa todos los procedimientos de gestión de usuarios, roles, aprobación editorial, seguridad, auditoría, respaldos y actualizaciones masivas de la plataforma.

#### 3.4.2.1. Estructura Visual, Navegación y Menú de Perfil

*(Nota: Para consultar las posibles situaciones de error, incidencias de visualización en la barra lateral o móvil, persistencia de temas y alertas de interfaz asociadas a este entorno con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.5: Validaciones y Solución de Problemas en la Estructura Visual, Navegación y Menú de Perfil](#3515-validaciones-y-solución-de-problemas-en-la-estructura-visual-navegación-y-menú-de-perfil)).*

El entorno del Panel Administrativo está diseñado para facilitar la gestión eficiente del observatorio, adaptando sus elementos visuales y de navegación tanto para estaciones de trabajo como para dispositivos móviles. Su estructura general se divide en áreas de navegación fijas y un área central de contenido dinámico.

1. **Barra Lateral de Navegación Fija (Entorno Escritorio):**
   En computadores de escritorio, el menú de navegación principal se ancla de forma permanente en el lateral izquierdo de la pantalla. Este menú concentra las herramientas globales:
   * **Logo y Retorno al Sitio Web:** En la parte superior, el logotipo del Observatorio Laboral y Ocupacional (OLO) está siempre visible. Al hacer clic sobre este ícono y título, actúa como un enlace directo que lleva al usuario de regreso a la página principal del sitio web público.
   * **Navegación Modular:** Presenta una lista de accesos directos a los módulos del sistema. El módulo activo en el que se encuentra el usuario se resalta visualmente (con un borde activo de selección y texto resaltado, como se aprecia en el Dashboard). Los accesos incluyen el **Dashboard**, el grupo colapsable **Accesos** (identificado por una flecha desplegable que contiene submenús), **Páginas en revisión**, **Auditoría**, **Respaldos** y **Actualizaciones**.
   * **Buscador Integrado:** En la parte inferior de la barra lateral se ubica un campo fijo interactivo de **Buscar** (identificado con un ícono de lupa y un acceso rápido con símbolo "+"). Este buscador global permite localizar funciones o secciones específicas de manera ágil.

> **[Captura: Barra Lateral de Navegación]**
> *Barra lateral izquierda mostrando el logotipo de retorno, la navegación modular con el módulo activo resaltado, el menú desplegable y el campo fijo de búsqueda.*

2. **Indicador Numérico de Revisiones:**
   Dentro de la lista de navegación modular, la opción **"Páginas en revisión"** integra un contador numérico dinámico cuando hay acciones pendientes. Este elemento visual alerta y muestra en tiempo real la cantidad de borradores que los editores han remitido y que requieren revisión y aprobación por parte del Administrador.

> **[Captura: Indicador Numérico de Revisiones]**
> *Detalle de la opción "Páginas en revisión" en la barra de navegación, exhibiendo el contador numérico de borradores pendientes de revisión.*

3. **Menú de Perfil, Notificaciones y Salida Segura:**
   Los controles de la cuenta de usuario y notificaciones están siempre accesibles:
   * **Bloque de Perfil:** Ubicado en la base inferior de la barra lateral (en escritorio). Muestra el nombre, el correo del usuario en sesión y un ícono de flecha indicadora. Al hacer clic sobre el nombre de usuario, se despliega un **Menú contextual** para ingresar a **"Mi perfil"** o ejecutar la acción de **"Cerrar sesión"** de forma segura.
   * **Campana de Notificaciones:** Junto al bloque de perfil se ubica permanentemente el ícono de una campana, diseñada para alertar y desplegar las novedades del sistema:
     * *Aviso sonoro y alerta emergente:* Al producirse una novedad (como el envío de una página a revisión), la plataforma reproduce un suave aviso sonoro y presenta una notificación temporal en la esquina superior de la pantalla para advertir la llegada del evento en tiempo real.
     * *Listado descriptivo y gestión de alertas:* Al hacer clic en la campana, se despliega el panel de notificaciones, donde cada elemento describe mediante una frase clara la acción o solicitud pendiente. Cada fila dispone de un botón con el **ícono de cerrar** para marcar la alerta como solucionada, además del botón unificado de cierre en la cabecera del panel.
     * *Navegación directa interactiva:* Al presionar sobre cualquier notificación de la lista, el sistema traslada al usuario de forma automática y directa hacia el módulo correspondiente para gestionar la novedad (si corresponde a una página en revisión, conduce a **Páginas en revisión**; si corresponde a una solicitud de cuenta, conduce a **Usuarios**).

> **[Captura: Menú de Perfil y Notificaciones]**
> *Vista de la base de la barra lateral, mostrando la información del usuario, el menú desplegable y la campana de notificaciones.*

4. **Adaptabilidad Estructural en Dispositivos Móviles:**
   Al ingresar desde un celular o tablet, la arquitectura visual del panel cambia automáticamente mediante un diseño responsivo para optimizar el espacio en pantallas táctiles, dividiendo los controles en dos barras fijas:
   * **Barra Superior:** Traslada a la cabecera de la pantalla el nombre del usuario y el menú desplegable de perfil (representado con un ícono de flecha hacia abajo), junto con íconos de acceso rápido para la campana de notificaciones, el buscador global (lupa) y un **alternador de tema visual** (ícono de sol o luna para cambiar entre modo claro y oscuro).
   * **Barra de Navegación Inferior:** Oculta la barra lateral y ubica en la base inferior de la pantalla un menú horizontal persistente. Este menú integra accesos rápidos: *Accesos* (ícono de usuario), *Revisión* (ícono de documento), un botón central destacado del *Dashboard* (representado por el isotipo del OLO), *Auditoría* (escudo) y un botón *Más* (tres puntos) para expandir los módulos restantes.

> **[Captura: Interfaz Adaptativa en Dispositivos Móviles]**
> *Distribución móvil con la barra superior (perfil, notificaciones, buscador y tema) y la barra de navegación inferior con el isotipo del Dashboard destacado en el centro. (Móvil).*

---

#### 3.4.2.2. Buscador Global del Panel Administrativo
*(Nota: Para consultar las posibles situaciones de error, validaciones de búsqueda y solución de problemas al interactuar con el buscador global o utilizar el botón de cierre, remitirse a la [Sección 3.5.1.6: Validaciones y Solución de Problemas en el Buscador Global del Panel Administrativo](#3516-validaciones-y-solución-de-problemas-en-el-buscador-global-del-panel-administrativo)).*

El Panel Administrativo cuenta con un buscador global diseñado para navegar ágilmente entre los diferentes módulos, secciones, herramientas de gestión y configuraciones del sistema utilizando palabras clave. Este buscador no filtra registros dentro de tablas individuales, sino que opera como un localizador y acceso directo integral hacia cualquier área de la plataforma administrativa o páginas asociadas de los portales.


1. **Apertura del buscador y despliegue de la pantalla de búsqueda:**
   * **En computadores de escritorio:** Se hace clic sobre la opción **"Buscar"** (identificada con el ícono de lupa) ubicada en la parte inferior de la barra lateral izquierda, inmediatamente encima del menú de usuario y junto al alternador de tema.
   * **En dispositivos móviles o tabletas:** Se pulsa el botón con el ícono de **lupa** situado en el extremo derecho de la barra de navegación superior.
   * Al activarse, la plataforma despliega una pantalla de búsqueda a tamaño completo que cubre toda la interfaz e inhabilita temporalmente el desplazamiento del panel que está de fondo, permitiendo concentrar la atención exclusivamente en la búsqueda.
   * El cursor se ubica de forma automática dentro del campo de texto central con el mensaje de guía *"Buscar en el panel…"*. En este estado inicial, la lista de destinos permanece oculta para evitar sobrecarga visual antes de escribir.

> **[Captura: Apertura del Buscador Global]**
> *Pantalla completa del buscador global con el campo de texto centrado y listo para escribir.*
>
> **[Captura: Apertura del Buscador Global (Móvil)]**
> *Pantalla completa del buscador global con el campo de texto centrado y listo para escribir. (Móvil).*

2. **Botón de Cierre (Cancelación y retorno inmediato sin navegación):**
   * En caso de que el funcionario decida no continuar con la búsqueda o requiera regresar a la sección del panel en la que se encontraba previamente, la interfaz dispone en la esquina superior derecha de un **botón de cierre**, identificado visualmente con el **ícono de cerrar** (equis).
   * Al pulsar este botón, la ventana de búsqueda se cierra de manera instantánea y regresa al usuario exactamente a la vista, formulario o tabla donde estaba trabajando, restaurando el desplazamiento normal del panel sin recargar la página ni perder datos.

> **[Captura: Botón de Cierre del Buscador Global]**
> *Ubicación del botón de cierre en la esquina superior derecha de la ventana de búsqueda.*
>
> **[Captura: Botón de Cierre del Buscador Global (Móvil)]**
> *Ubicación del botón de cierre en la parte superior derecha de la pantalla del buscador. (Móvil).*

3. **Ingreso del término y localización inteligente por sinónimos:**
   * El usuario introduce la palabra clave, término técnico o concepto deseado. El motor de búsqueda procesa la consulta en tiempo real, normalizando el texto de manera automática (eliminando tildes, mayúsculas y espacios sobrantes) y exigiendo que todas las palabras ingresadas coincidan para ofrecer resultados precisos.
   * La localización no se limita a los nombres exactos de las pantallas, sino que evalúa las descripciones funcionales, categorías y un índice integral de **términos y sinónimos equivalentes**, ejemplo:
     * Al escribir términos como *"bitácora"*, *"historial"*, *"trazabilidad"* o *"log"*, el sistema presenta el módulo de **Auditoría**.
     * Al escribir *"cuentas"*, *"personas"*, *"permisos"* o *"roles"*, sugiere los módulos de **Usuarios** y **Roles y Permisos**.
     
   * **Notificación de ausencia de coincidencias:** Si el texto ingresado no guarda relación con ningún destino disponible, el sistema despliega el mensaje de aviso: *"No hay nada en el panel que coincida con «[término]»."*.
   * **Despliegue de resultados estructurados:** Cuando existen coincidencias, aparece un listado vertical desplazable bajo el campo central, donde cada resultado exhibe de forma diferenciada:
     * El **título** oficial del destino en tipografía destacada.
     * La **descripción** sintética de la función o propósito del área.
     * La **etiqueta de grupo** que clasifica el módulo (*Panel*, *Gestión*, *Contenido*, *Sitio Público*, *Intranet* o *Cuenta*).

> **[Captura: Búsqueda Activa por Sinónimos]**
> *Resultados dinámicos estructurados con título, descripción y categoría que coinciden con el término ingresado.*
>
> **[Captura: Búsqueda Activa por Sinónimos (Móvil)]**
> *Resultados dinámicos estructurados con título, descripción y categoría que coinciden con el término ingresado. (Móvil).*

4. **Selección del destino:** Al hacer clic o presionar sobre el resultado elegido, la plataforma cierra la ventana de búsqueda y traslada la navegación directamente hacia la sección seleccionada.

> **[Captura: Navegación hacia el Resultado]**
> *Transición automática hacia el módulo de destino seleccionado en la lista de resultados.*
>
> **[Captura: Navegación hacia el Resultado (Móvil)]**
> *Transición automática hacia el módulo de destino seleccionado en la lista de resultados. (Móvil).*

---

#### 3.4.2.3. Tablero Principal y Métricas de Gestión (Dashboard)

*(Nota: Para consultar las validaciones y solución de problemas relacionados con gráficas que no cargan o tarjetas sin resultados, remitirse a la [Sección 3.5.1.7: Validaciones y Solución de Problemas en el Tablero Principal (Dashboard)](#3517-validaciones-y-solución-de-problemas-en-el-tablero-principal-dashboard)).*

Al ingresar al Panel Administrativo (`/admin/dashboard`), el Administrador visualiza el resumen consolidado de la actividad del observatorio en tres tarjetas principales de gestión:

1. **Tarjeta de Páginas Publicadas:** Muestra el total de páginas activas en el observatorio y un diagrama en forma de árbol con dos ramas: **"Sitio web"** e **"Intranet"**, indicando el número de páginas de cada ámbito. Al hacer clic sobre una rama, se despliegan sus páginas asociadas; al pulsarla nuevamente, se repliega. Al pasar el cursor sobre una página, se muestra su título completo y su ruta (por ejemplo, */contacto*), y al hacer clic sobre ella, su vista se abre en una pestaña nueva del navegador para conservar el panel abierto. Una rama sin páginas aparece deshabilitada y no se despliega. Para quienes navegan mediante teclado o lectores de pantalla, las páginas se encuentran igualmente disponibles en una lista accesible de enlaces.

> **[Captura: Tarjeta de Páginas Publicadas]**
> *Tarjeta de páginas publicadas con el árbol desplegado: las ramas Sitio web e Intranet y sus páginas.*
>
> **[Captura: Tarjeta de Páginas Publicadas (Móvil)]**
> *Tarjeta de páginas publicadas con el árbol desplegado: las ramas Sitio web e Intranet y sus páginas. (Móvil).*

2. **Gráficos Interactivos de Visitas y Usuarios:** Las tarjetas adyacentes no solo muestran totales numéricos, sino que incluyen visualizaciones con las que se puede interactuar pasando el cursor del mouse (o tocando en la pantalla móvil):

   * **Tarjeta de Visitas:** Incluye un diagrama de área y líneas equipado con pestañas para alternar entre el tráfico del Sitio Web y la Intranet. Al posar el cursor sobre los nodos de la línea, un recuadro flotante indica el título exacto de la página y cuántas visitas específicas ha recibido. Adicionalmente, al hacer clic en cualquier parte de la tarjeta, el gráfico se amplía en una ventana modal que presenta los datos de tráfico de forma extensa y detallada.

> **[Captura: Gráfico Interactivo de Visitas]**
> *Diagrama de líneas de visitas mostrando sus cuadros de detalle al interactuar con la tarjeta.*
>
> **[Captura: Gráfico Interactivo de Visitas (Móvil)]**
> *Diagrama de líneas de visitas mostrando sus cuadros de detalle al interactuar con la tarjeta. (Móvil).*
>
> **[Captura: Modal Ampliado de Visitas]**
> *Ventana modal desplegada tras hacer clic en la tarjeta de visitas, detallando la gráfica interactiva en un tamaño mayor.*
>
> **[Captura: Modal Ampliado de Visitas (Móvil)]**
> *Ventana modal desplegada tras hacer clic en la tarjeta de visitas, detallando la gráfica interactiva en un tamaño mayor. (Móvil).*

   * **Tarjeta de Usuarios:** Muestra un gráfico circular (*pie chart*) que clasifica las cuentas según su rol asignado. Al posar el cursor sobre cada segmento, se visualiza la cantidad exacta de usuarios agrupados en ese rol.

> **[Captura: Gráfico Circular de Usuarios]**
> *Gráfico circular de usuarios mostrando sus cuadros de detalle al interactuar con las proporciones.*
>
> **[Captura: Gráfico Circular de Usuarios (Móvil)]**
> *Gráfico circular de usuarios mostrando sus cuadros de detalle al interactuar con las proporciones. (Móvil).*

3. **Bitácora de Actividad Reciente:** En la zona inferior del tablero, se encuentra una lista con las acciones más recientes ejecutadas en el sistema. Cada línea describe un evento completo: quién lo realizó, el tipo de acción, el cambio efectuado y la marca de tiempo correspondiente; por ejemplo: *«El usuario [Nombre] hizo la acción de Autenticación: inició sesión en el sitio web el 10 de octubre de 2026 a las 5:41 p. m.»*. Cuando la acción la realizó el propio sistema (por ejemplo, una cuenta que caducó), la frase inicia indicando *«El sistema»*.

   La lista cuenta con **controles de paginación** para navegar por el historial sin salir del panel, y un enlace **"Ver más"** en la cabecera que traslada directamente al módulo completo de Auditoría (Ver [Sección 3.4.2.6: Auditoría y Bitácora de Eventos](#3426-auditoría-y-bitácora-de-eventos)).

> **[Captura: Lista de Actividad Reciente]**
> *Vista general de la lista de Actividad Reciente, con una frase por evento.*
>
> **[Captura: Lista de Actividad Reciente (Móvil)]**
> *Vista general de la lista de Actividad Reciente, con una frase por evento. (Móvil).*

4. **Comportamiento ante incidencias de comunicación:** En caso de que se presente una interrupción en la comunicación con el servidor al cargar el panel principal, las tarjetas de métricas permanecen limpias mostrando un guion («—») en lugar de datos incompletos o alertas dispersas en cada tarjeta. La advertencia sobre la imposibilidad de consultar las métricas se concentra en una única notificación superior que incorpora el botón **«Reintentar»**, permitiendo al usuario reanudar la carga de datos de manera inmediata sin recargar toda la ventana del navegador.

---

#### 3.4.2.4. Gestión de Accesos (Usuarios y Roles)
En la barra lateral (escritorio) o barra inferior (móvil), el grupo **"Accesos"** se expande para revelar la administración centralizada de cuentas y permisos.

##### 3.4.2.4.1. Submenú: Usuarios

*(Nota: Para consultar la guía de solución de obstáculos comunes durante estos procesos, como alertas de dominio incorrecto, fechas caducadas o ventanas bloqueadas, remitirse a la [Sección 3.5.1.8: Validaciones y Solución de Problemas en la Gestión de Usuarios](#3518-validaciones-y-solución-de-problemas-en-la-gestión-de-usuarios)).*

En este apartado se gestionan las cuentas individuales de los funcionarios que interactúan con la plataforma del OLO. La interfaz está compuesta por una cabecera con el botón de creación (**"Crear Usuario"**), una barra de búsqueda en tiempo real, una tabla central de datos y un paginador en la base:

1. **Acceso al módulo:** En el menú lateral (o barra inferior de navegación en móviles), desplegar "Accesos" y hacer clic en **"Usuarios"**.

> **[Captura: Paso 1]**
> *Acceso al submenú Usuarios en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al submenú Usuarios en el menú lateral. (Móvil).*

2. **Tabla General, Columnas y Búsqueda:** Al ingresar, el sistema despliega el listado completo de los funcionarios registrados. En la parte superior se dispone de un campo de búsqueda interactivo (**"Buscar usuarios..."**) para filtrar resultados en tiempo real por nombre, apellidos, correo corporativo o rol asignado, así como controles de paginación en la parte inferior para recorrer los registros de manera ágil sin saturar la pantalla.
   La tabla expone las siguientes columnas de información:
   * **Nombre:** Nombres y apellidos completos del funcionario.
   * **Correo:** Cuenta corporativa vinculada (`@sena.edu.co`).
   * **Rol:** El rol de acceso asignado en el sistema (ej. Administrador, Editor, o rol derivado).
   * **Estado:** Un interruptor visual que indica si la cuenta está Activa o Inactiva/Suspendida.
   * **Bloqueo:** Indicador de seguridad que señala si la cuenta se encuentra temporalmente bloqueada por exceso de intentos fallidos y el tiempo restante de bloqueo.
   * **Acciones:** Herramientas operativas individuales para interactuar con cada fila. En computadores de escritorio son botones de solo ícono que despliegan su función mediante tooltip al posar el cursor o enfocarlos con el teclado:
     * **Ícono de lápiz (tooltip «Editar usuario»):** Abre la ventana modal para modificar datos del usuario, reasignar rol, gestionar fecha de caducidad y opciones de restablecimiento de contraseña o preguntas de seguridad.
     * **Ícono de basurero (tooltip «Eliminar»):** Despliega la ventana modal de confirmación para eliminar de forma definitiva la cuenta del sistema.

   En dispositivos móviles y tabletas, la tabla se presenta en formato acordeón: cada fila muestra el nombre del funcionario y, al desplegarla, se accede a sus datos (correo, rol, estado y bloqueo) junto con los botones táctiles con texto visible **"Editar"** y **"Eliminar"**.

> **[Captura: Tabla General de Usuarios]**
> *Vista de la tabla de usuarios detallando sus columnas, buscador superior y el paginador inferior.*
>
> **[Captura: Tabla General de Usuarios (Móvil)]**
> *Lista de usuarios en formato acordeón en dispositivos móviles, mostrando las filas compactas con flecha indicadora, el detalle desplegado y el paginador inferior.*

3. **Creación de Cuentas y Generación de Credenciales:** En la cabecera del módulo, hacer clic en el botón **"Crear Usuario"** para abrir el modal de registro de funcionarios. Se deben diligenciar los campos obligatorios:
   * **Nombre y Apellidos**
   * **Correo electrónico** (estrictamente `@sena.edu.co`)
   * **Rol asignado** (Administrador, Editor base o cualquier rol derivado)
   * **Fecha de caducidad (Opcional):** Si se deja sin diligenciar, la cuenta será de carácter permanente y no expirará automáticamente. Si se establece una fecha, el sistema desactivará el acceso del usuario en cuanto se cumpla dicho plazo.
   
   En la parte inferior del formulario de creación se encuentran las opciones de acción:
   * **Cancelar:** Descarta la operación y cierra la ventana sin registrar al funcionario.
   * **Guardar:** Confirma la información ingresada y da de alta al usuario en el sistema.

> **[Captura: Modal Nuevo Usuario]**
> *Formulario modal de registro de nuevo usuario.*
>
> **[Captura: Modal Nuevo Usuario (Móvil)]**
> *Formulario modal de registro de nuevo usuario. (Móvil).*

   Al confirmar la creación mediante el botón **"Guardar"**, el sistema genera automáticamente una **contraseña temporal provisoria** con una **vigencia de 72 horas** y la despliega en una segunda ventana modal ("Contraseña temporal generada").
   * **Indicador de caducidad en pantalla:** El modal detalla de forma explícita la fecha y hora exacta hasta la cual es válida la credencial provisional (*«Válida hasta: [Fecha y hora]»*), recordando que vencidas las 72 horas el sistema la rechazará de manera automática.
   * **Validación de copiado obligatorio:** Por seguridad, el sistema advierte que la contraseña no se podrá volver a visualizar y **bloquea el botón "Cerrar"** de la ventana hasta que el Administrador presione obligatoriamente el botón con título **"Copiar"**.
   * **Responsabilidad de comunicación:** Una vez copiada, el Administrador debe hacerle llegar esta clave al nuevo funcionario a través de los canales internos del SENA (correo corporativo, chat interno u otro medio formal) junto con el aviso del plazo de 72 horas, ya que la plataforma no envía notificaciones de bienvenida automáticas.
   * En el primer inicio de sesión del funcionario, el sistema le exigirá de forma obligatoria el cambio de clave y la configuración de sus preguntas de seguridad (ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).

> **[Captura: Credenciales Generadas]**
> *Recuadro con la contraseña temporal generada, indicador de vigencia de 72 horas y botón de copiado rápido.*
>
> **[Captura: Credenciales Generadas (Móvil)]**
> *Recuadro con la contraseña temporal generada con indicador de vigencia. (Móvil).*

4. **Edición y Restablecimiento de Cuentas (Ícono de lápiz):**
   Al hacer clic en el ícono de lápiz ubicado en la fila de un usuario, se abre el modal de edición. Desde aquí, el Administrador tiene acceso a dos procesos:
   * **Actualización de datos del usuario:** Permite modificar la información base, incluyendo el nombre, apellidos, el rol asignado (nivel de privilegios) o establecer/quitar la fecha de caducidad de la cuenta. 
   * **Opciones de restablecimiento:** En la base del formulario, se encuentran botones críticos para brindar soporte técnico al funcionario:
     * **Restablecer la contraseña:** Genera una nueva clave temporal (con un nuevo ciclo de validez de 72 horas) y fuerza el flujo de primer ingreso. *(Nota: Esta acción también funciona como un mecanismo de **desbloqueo manual**, eliminando de forma inmediata cualquier bloqueo temporal por intentos fallidos).*
     * **Restablecer las preguntas de seguridad:** Borra las preguntas previamente configuradas por el usuario, obligándolo a elegir y responder un nuevo par de preguntas de seguridad en su próximo inicio de sesión.

> **[Captura: Modal Edición de Usuario]**
> *Modal de edición mostrando los campos del usuario y las opciones de restablecimiento.*
>
> **[Captura: Modal Edición de Usuario (Móvil)]**
> *Modal de edición mostrando los campos del usuario y las opciones de restablecimiento. (Móvil).*

5. **Suspender y Activar Cuentas (Interruptor de Estado):**
   La columna "Estado" permite gestionar el acceso de los funcionarios mediante un interruptor:
   * **Suspender cuenta (Pasar a Inactivo):** Al apagar el interruptor, el sistema revoca de inmediato el acceso. Si la persona estaba conectada, sus sesiones se cierran al instante y se bloquea cualquier intento de ingreso futuro. **Esta es la acción recomendada** para retirar a un usuario, ya que conserva intacto su historial en la bitácora de auditoría.
   * **Activar cuenta (Pasar a Activo):** Al volver a encender el interruptor para restituirle el acceso a un usuario previamente suspendido, el sistema ejecuta dos procesos automáticos:
     1. **Validación de caducidad:** Si la "Fecha de caducidad" de esa cuenta ya está vencida, el sistema bloqueará la activación y desplegará una alerta advirtiendo que primero se debe extender la fecha desde el modal de edición.
     2. **Generación de nueva clave:** Si la fecha es válida, se restablecerá automáticamente su contraseña por seguridad, desplegando en pantalla una credencial temporal nueva que el Administrador deberá compartirle al funcionario.

> **[Captura: Cambiar Estado de Usuario]**
> *Interruptor de estado en la tabla general y alerta de caducidad vencida.*
>
> **[Captura: Cambiar Estado de Usuario (Móvil)]**
> *Interruptor de estado en la tabla general. (Móvil).*

6. **Eliminar Cuentas (Ícono de basurero):**
   El borrado definitivo de una cuenta se ejecuta mediante el ícono de basurero ubicado en la fila correspondiente al funcionario. Es posible eliminar a un usuario incluso si este cuenta con un historial de creación de páginas o registros previos, ya que el sistema está diseñado para conservar dicha trazabilidad de manera segura.
   * **Confirmación obligatoria:** Al seleccionar el ícono, se despliega una ventana modal de advertencia ("¿Eliminar usuario?") indicando el carácter irreversible de la acción. El procedimiento se concreta al seleccionar el botón con título **"Eliminar"**, o bien se interrumpe mediante la opción **"Cancelar"**.
   * **Restricción de seguridad (Último Administrador):** La plataforma cuenta con una única validación estricta de bloqueo: el sistema impedirá el borrado si se intenta eliminar al último usuario con rol de Administrador activo, con el fin de garantizar la gestión continua y evitar que el portal quede sin soporte.

> **[Captura: Confirmación de Eliminación]**
> *Alerta de seguridad para confirmar el borrado definitivo de un usuario.*
>
> **[Captura: Confirmación de Eliminación (Móvil)]**
> *Alerta de seguridad para confirmar el borrado definitivo de un usuario. (Móvil).*

---

##### 3.4.2.4.2. Submenú: Roles y Permisos

*(Nota: Para consultar la guía de solución de obstáculos comunes durante estos procesos, como bloqueos al intentar eliminar roles en uso, nombres no modificables o delegación de páginas nuevas, remitirse a la [Sección 3.5.1.9: Validaciones y Solución de Problemas en la Gestión de Roles y Permisos](#3519-validaciones-y-solución-de-problemas-en-la-gestión-de-roles-y-permisos)).*

En este apartado se gestionan los roles del sistema y se configuran roles a la medida con permisos específicos sobre las páginas y herramientas de la plataforma. La interfaz está compuesta por una cabecera con el botón de creación, una barra de búsqueda en tiempo real, una tabla central de datos y un paginador en la base.

Por motivos de seguridad estructural del sistema, la tabla **oculta** deliberadamente los roles fijos administrativos o gerenciales (`Administrador` y `Director/Subdirector`), puesto que sus facultades son estáticas y están protegidas por el sistema. En este módulo únicamente se visualizan y gestionan el rol base **Editor** y los roles derivados personalizados (hijos de Editor).

1. **Acceso al módulo:** En el menú lateral (o barra inferior de navegación en móviles), bajo "Accesos", hacer clic en **"Roles"** (o "Roles y Permisos").

> **[Captura: Paso 1]**
> *Acceso al submenú Roles en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al submenú Roles en el menú lateral. (Móvil).*

2. **Tabla General, Columnas y Búsqueda:** Al ingresar, el sistema despliega el catálogo de roles gestionables. En la parte superior se dispone de un campo de búsqueda interactivo (**"Buscar roles..."**) para filtrar resultados en tiempo real por nombre o descripción, así como controles de paginación en la parte inferior para recorrer la lista de manera organizada.
   La tabla expone las siguientes columnas de información:
   * **Rol:** Nombre oficial asignado (el rol base predefinido `Editor`, o bien los roles derivados que incorporan el prefijo obligatorio `Editor [Nombre]`).
   * **Descripción:** Detalle textual que resume el alcance, objetivo o dependencia asignada a dicho rol. Si no se especificó un texto al crearlo, el sistema muestra la indicación *"Sin descripción"*.
   * **Permisos:** Etiqueta visual (cápsula interactiva) que contabiliza numéricamente la cantidad exacta de permisos activos asignados al rol (ej. *«14 permisos»*).
   * **Acciones:** Herramientas operativas individuales para interactuar con cada fila. En computadores de escritorio son botones de solo ícono que despliegan su función mediante tooltip:
     * **Ícono de deslizadores (tooltip «Editar rol»):** Abre la ventana modal para modificar la denominación, descripción y los permisos asignados al rol.
     * **Ícono de basurero (tooltip «Eliminar»):** Permite suprimir roles personalizados derivados (deshabilitado en el rol base **"Editor"**).

   En dispositivos móviles y tabletas, la tabla se presenta en formato acordeón: cada fila muestra el nombre del rol y, al desplegarla, se accede a su descripción, número de permisos y los botones táctiles con texto visible **"Editar rol"** y **"Eliminar rol"** (deshabilitado en el rol base *Editor*).

> **[Captura: Tabla General de Roles]**
> *Vista de la tabla de roles detallando sus columnas, contador de permisos y buscador superior.*
>
> **[Captura: Tabla General de Roles (Móvil)]**
> *Lista de roles en formato acordeón en dispositivos móviles, con el rol Editor desplegado y su botón de eliminación deshabilitado.*

3. **Creación de Roles Derivados (Botón "Nuevo Editor"):** En la cabecera superior del módulo, hacer clic en el botón **"Nuevo Editor"** para abrir la ventana modal de configuración. Se deben diligenciar los siguientes campos:
   * **Nombre del rol:** Campo de texto donde el prefijo **"Editor"** ya viene fijado por el sistema de forma obligatoria. Solo se debe ingresar la denominación complementaria según el área o función (ej. *«Inicio»*, *«Prensa»*, *«Regional Antioquia»*, con un máximo de 70 caracteres).
   * **Descripción:** Cuadro de texto para especificar las funciones o el alcance operativo del rol (hasta 200 caracteres).
   * **Permisos:** Se debe hacer clic en el botón **"Añadir permisos"**, el cual abre la ventana modal de permisos y actualiza el contador de permisos elegidos (ej. *«3 seleccionados»*). *(Nota: Para consultar la definición y el alcance de las 5 secciones de control de permisos que componen la plataforma, remitirse a la [Sección 3.2.2.3: Estructura y Ámbitos de los Permisos (Las 5 Secciones de Control)](#3223-estructura-y-ámbitos-de-los-permisos-las-5-secciones-de-control)).*
   
   En la base del formulario se encuentran los controles de confirmación:
   * **Cancelar:** Cierra la ventana y descarta la creación.
   * **Guardar:** Confirma la información e ingresa el nuevo rol derivado a la plataforma.

> **[Captura: Modal Nuevo Editor]**
> *Ventana modal de registro para la creación de un nuevo rol derivado de Editor.*
>
> **[Captura: Modal Nuevo Editor (Móvil)]**
> *Ventana modal de registro para la creación de un nuevo rol derivado de Editor. (Móvil).*

4. **Edición de Roles y Configuración de Permisos (Ícono de lápiz):**
   Para modificar la información o el alcance operativo de un rol existente, el Administrador debe ubicarse en la tabla de datos y hacer clic en el **ícono de lápiz** (*"Editar rol y permisos"*) ubicado en la columna *Acciones* de la fila correspondiente al rol.

   Al pulsar este botón, el sistema despliega la ventana modal **«Permisos del rol «[Nombre del Rol]»»**, la cual presenta los datos base del rol:
   * **Nombre del rol:** Campo informativo de solo lectura y no modificable (acompañado por el distintivo *«No modificable»*). Una vez que un rol ha sido creado en la plataforma, su nombre no se puede alterar desde esta ventana modal (aplica tanto para el rol base «Editor» como para los roles derivados), preservando la estabilidad estructural y la coherencia de las cuentas asociadas. Únicamente es posible actualizar su descripción y sus permisos.
   * **Descripción del rol:** Área de texto editable (hasta 200 caracteres) para actualizar o detallar las responsabilidades del rol.
   * **Aviso preventivo del sistema:** Se presenta una alerta informativa destacada que advierte: *«Esto afecta a todas las personas con el rol «[Nombre]», no solo a la que estés editando. El cambio se aplica en cuanto guardas.»*, recordando que la modificación no es individual, sino que impacta de inmediato a todos los funcionarios que tengan asignado dicho rol.
   * **Botón "Editar permisos":** Al pulsar este botón, la ventana modal expande el catálogo interactivo de permisos y habilita las herramientas de búsqueda y control.

> **[Captura: Modal Edición de Rol - Datos Básicos]**
> *Ventana modal de edición mostrando el nombre del rol no modificable, la descripción, el aviso preventivo y el botón para editar permisos.*
>
> **[Captura: Modal Edición de Rol - Datos Básicos (Móvil)]**
> *Ventana modal de edición mostrando el nombre del rol no modificable, la descripción, el aviso preventivo y el botón para editar permisos. (Móvil).*

   Al pulsar el botón **"Editar permisos"**, la ventana modal despliega las herramientas de control organizadas estrictamente en las **5 secciones de control** establecidas en la plataforma (remitirse a la [Sección 3.2.2.3: Estructura y Ámbitos de los Permisos (Las 5 Secciones de Control)](#3223-estructura-y-ámbitos-de-los-permisos-las-5-secciones-de-control)):
   * **Buscador interno de permisos:** Campo de búsqueda interactivo (*«Buscar un permiso…»*) con ícono de lupa que filtra dinámicamente los permisos visibles conforme el Administrador escribe.
   * **Estructura de las 5 secciones de control:** Cada sección cuenta con su encabezado y un contador numérico de permisos concedidos respecto al total del bloque (ej. *«2/3»*):
     1. **Acceso:** Controla las puertas de entrada a los entornos del sistema (el Sitio Web Público y la Intranet del OLO).
     2. **Editar:** Regula la intervención sobre el menú y pie de página, aplicables de forma independiente para el Sitio Web y para la Intranet (afecta a todas las páginas de la respectiva aplicación).
     3. **Secciones del sitio web:** Control individual página por página para el portal público (*«Inicio»*, *«Política de privacidad»* y páginas dinámicas creadas). Dispone de los botones de acción rápida **"Todas"** (activa simultáneamente todas las páginas del bloque) y **"Quitar todas"** (desactiva todas las páginas del bloque).
     4. **Secciones de la intranet:** Control individual para maquetar y actualizar las páginas y módulos analíticos internos de la Intranet (*«Inicio»*, *«Tasa de vinculación»*, *«Matriz de tendencias»*, *«Encuestas de calidad de la formación»*, *«Encuestas de seguimiento laboral»* y páginas dinámicas internas). Dispone también de los botones de acción rápida **"Todas"** y **"Quitar todas"**.
     5. **Qué puede hacer dentro del editor:** Facultades de acción estructural dentro del lienzo de trabajo interactivo (crear nuevas páginas o eliminar páginas dinámicas creadas).
   * **Interruptores deslizantes e insignias de cambio en tiempo real:** Cada permiso cuenta con un interruptor individual. Al cambiar el estado de cualquier interruptor, el sistema compara la selección con la configuración original y despliega una insignia visual inmediata:
     * **«se añade»:** Indica que el permiso está siendo incorporado al rol.
     * **«se quita»:** Indica que el permiso está siendo revocado del rol.
     * **«solo interfaz»:** Distintivo visible en permisos cuyo control aplica a la visualización del editor de contenidos.

> **[Captura: Despliegue de las 5 Secciones de Permisos]**
> *Catálogo interactivo de permisos desplegado tras pulsar "Editar permisos", detallando el buscador interno y las 5 secciones de control.*
>
> **[Captura: Despliegue de las 5 Secciones de Permisos (Móvil)]**
> *Catálogo interactivo de permisos desplegado tras pulsar "Editar permisos", detallando el buscador interno y las 5 secciones de control. (Móvil).*

   En la parte inferior de la ventana modal se ubican los controles de guardado y confirmación:
   * **Resumen de modificaciones en tiempo real:** En la base de la ventana modal se describe en vivo el balance exacto de cambios detectados (ej. *«Descripción actualizada · 2 permisos añadidos · 1 quitado»* o *«Sin cambios que guardar.»* si no se han realizado variaciones).
   * **Cancelar:** Descarta cualquier modificación pendiente y cierra la ventana modal sin aplicar cambios.
   * **Guardar permisos:** Se activa únicamente si existen modificaciones pendientes. Al pulsarlo, el botón cambia su etiqueta a *«Guardando…»* mientras se transmiten los cambios al servidor.

> **[Captura: Resumen de Cambios en Pie de Modal]**
> *Barra inferior de la ventana modal reflejando en tiempo real las modificaciones realizadas antes de guardar.*
>
> **[Captura: Resumen de Cambios en Pie de Modal (Móvil)]**
> *Barra inferior de la ventana modal reflejando en tiempo real las modificaciones realizadas antes de guardar. (Móvil).*

   Una vez procesada la actualización, la ventana modal se cierra de forma automática y la plataforma emite una notificación flotante de confirmación en pantalla:
   * **Título:** **«Rol actualizado»**
   * **Mensaje:** *«Se aplicaron los cambios para el rol «[Nombre del Rol]».»*
   Asimismo, la tabla central de roles actualiza de inmediato la descripción y el contador total de permisos asignados en su respectiva fila.

> **[Captura: Notificación Rol Actualizado]**
> *Alerta flotante de confirmación en pantalla informando la actualización exitosa del rol.*
>
> **[Captura: Notificación Rol Actualizado (Móvil)]**
> *Alerta flotante de confirmación en pantalla informando la actualización exitosa del rol. (Móvil).*

   * **Inclusión dinámica de páginas creadas:** Cuando se crean nuevas páginas en el sitio web o en la intranet, estas se integran automáticamente a sus secciones correspondientes dentro de este catálogo para permitir su asignación individual a los roles derivados requeridos. *(Nota: Si un funcionario con rol derivado no visualiza el botón de edición en una página nueva, consultar el procedimiento de delegación en la [Sección 3.5.1.9 - Caso 4](#3519-validaciones-y-solución-de-problemas-en-la-gestión-de-roles-y-permisos)).*

5. **Eliminación de Roles Derivados (Ícono de basurero):**
   El borrado de un rol personalizado que no se encuentre en uso se ejecuta desde la tabla mediante el **ícono de basurero** ubicado en la columna *Acciones* de su fila correspondiente.

   * **Confirmación de eliminación definitiva:** Al presionar el botón en un rol derivado apto para borrado (sin funcionarios asignados), el sistema despliega la ventana modal de confirmación (*«¿Eliminar este rol?»*), advirtiendo que la acción es permanente e irreversible:
     * **Cancelar:** Cierra la ventana y conserva el rol intacto en el sistema.
     * **Eliminar:** Botón destructivo con título **"Eliminar"** que retira de forma definitiva el rol de la base de datos y registra el evento en la bitácora de auditoría. Al completarse, el sistema emite la notificación flotante de confirmación (*«Rol eliminado - El rol «[Nombre]» se eliminó exitosamente.»*).

> **[Captura: Confirmación Eliminación de Rol sin Usuarios]**
> *Ventana modal de confirmación definitiva para eliminar un rol derivado sin usuarios asociados.*
>
> **[Captura: Confirmación Eliminación de Rol sin Usuarios (Móvil)]**
> *Ventana modal de confirmación definitiva para eliminar un rol derivado sin usuarios asociados. (Móvil).*

   * **Reglas de integridad y restricciones de seguridad:**
     * **Rol base "Editor":** Su ícono de basurero permanece permanentemente deshabilitado y bloqueado en gris, puesto que es un componente estructural indispensable del sistema y no puede ser eliminado (ver [Sección 3.5.1.9 - Caso 3](#3519-validaciones-y-solución-de-problemas-en-la-gestión-de-roles-y-permisos)).
     * **Roles con usuarios vinculados:** Por regla de integridad, ningún usuario puede quedar sin rol en la plataforma. Si el Administrador intenta eliminar un rol que tenga uno o más funcionarios asignados, el sistema bloquea la acción y presenta una ventana modal informativa orientando a la reasignación previa de cuentas (ver guía detallada de resolución en la [Sección 3.5.1.9 - Caso 1](#3519-validaciones-y-solución-de-problemas-en-la-gestión-de-roles-y-permisos)).

---

#### 3.4.2.5. Aprobación y Publicación de Contenidos: Páginas en Revisión
*(Nota: Para consultar las posibles situaciones de validación, modales bloqueados, límites de caracteres y solución de problemas en este flujo con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.10: Validaciones y Solución de Problemas en la Aprobación y Publicación de Contenidos (Páginas en Revisión)](#35110-validaciones-y-solución-de-problemas-en-la-aprobación-y-publicación-de-contenidos-páginas-en-revisión)).*

Módulo vital para el flujo de publicación, accesible desde el menú lateral (o barra inferior en móviles) bajo **"Páginas en Revisión"**.

1. **Acceso a la bandeja:** Se debe hacer clic en el ítem **"Páginas en Revisión"** en el menú lateral o en la barra inferior móvil.

> **[Captura: Paso 1]**
> *Clic en el ítem Páginas en Revisión.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Clic en el ítem Páginas en Revisión. (Móvil).*

2. **Tabla de Páginas en Revisión y Columnas:** Al ingresar al módulo, la bandeja presenta las páginas pendientes de aprobación editorial. En computadores de escritorio, la tabla organiza la información en 5 columnas:
   * **Página:** Título de la sección junto a su número de versión (ej. *«Inicio · versión 3»*), con la insignia de ámbito (*Sitio web* o *Intranet*) en la parte superior.
   * **Cambios:** Justificación o comentario registrado por el editor al enviar la solicitud (*«...»* o *"Sin comentario"*).
   * **Autor:** Nombre completo y correo corporativo del funcionario que elaboró el contenido.
   * **Enviado el:** Fecha de recepción de la solicitud con la hora exacta visible debajo.
   * **Acciones:** Controles operativos para gestionar cada borrador. En computadores de escritorio, se presentan como botones de solo ícono alineados a la derecha; al colocar el cursor sobre cualquiera de ellos (o enfocarlo con el teclado), se activa una etiqueta flotante de ayuda (tooltip) que indica su acción:
     * **Visualizar (ícono de ojo):** Botón con ícono de ojo (tooltip *«Visualizar»*). Abre la previsualización interactiva de la página para examinar los cambios antes de tomar una decisión.
     * **Publicar (ícono de enviar):** Botón con ícono de enviar (tooltip *«Publicar»*). Abre la ventana modal de confirmación para aprobar el borrador y desplegarlo de inmediato en producción.
     * **Rechazar (ícono de equis):** Botón con ícono de equis (tooltip *«Rechazar»*). Abre la ventana modal para registrar observaciones de rechazo; el borrador conserva todos sus cambios en estado rechazado para poder editarlo, ajustarlo y reenviarlo.
     * **Descartar (ícono de papelera):** Botón con ícono de papelera (tooltip *«Eliminar»*). Abre la ventana modal para anular definitivamente el borrador, requiriendo el registro obligatorio del motivo para auditoría.

   En dispositivos móviles y tabletas, la tabla se presenta en formato acordeón: cada fila resume el envío (*«[Autor] envió la versión [N] de [Título]»*) y, al desplegarla, muestra la ruta, el comentario de cambios y los cuatro botones de acción con su ícono y nombre visible (*"Visualizar"*, *"Publicar"*, *"Rechazar"* y *"Eliminar"*).

> **[Captura: Paso 2]**
> *Tabla de borradores pendientes mostrando título, cambios y editor.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Bandeja de páginas en revisión en formato acordeón en dispositivos móviles, con una solicitud desplegada detallando cambios y controles de decisión.*

3. **Previsualización interactiva (Ícono de ojo):** Para evaluar una solicitud antes de tomar una decisión, se hace clic sobre el botón con **ícono de ojo** (tooltip *«Visualizar»*) en computadores, o sobre el botón **"Visualizar"** en dispositivos móviles.

> **[Captura: Paso 3]**
> *Clic en el botón de previsualización.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Clic en el botón de previsualización. (Móvil).*

4. **Verificación visual del diseño:** El sistema abre una vista previa que refleja fielmente cómo se verá la página publicada en el sitio web o intranet. El Administrador revisa el diseño, textos y contenidos para verificar el cumplimiento de los lineamientos editoriales antes de su aprobación.

> **[Captura: Paso 4]**
> *Vista previa interactiva de la página a publicar, mostrando cómo se verá una vez aprobada.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Vista previa interactiva de la página a publicar en versión móvil, reflejando el diseño final para teléfonos y tabletas.*

5. **Aprobación y publicación en producción (Ícono de enviar):**
   Si la página cumple con todos los requisitos y está lista para ser visible a los usuarios finales:
   * **Apertura de la confirmación:** El Administrador presiona el botón **"Publicar"** (con ícono de enviar en computadores) de la página a aprobar. Esta acción abre la ventana modal de confirmación.
   * **Revisión del resumen de publicación:** El sistema despliega la ventana de confirmación (*«¿Estás seguro de que deseas publicar esta versión?»*), especificando el número de versión, la página y el ámbito correspondiente (*Sitio web* o *Intranet*), e informando que la versión actualmente activa pasará de forma automática al módulo de Respaldos.
   * **Confirmación de publicación:** El Administrador presiona el botón **"Publicar"** dentro de la ventana modal para confirmar el paso inmediato a producción (o presiona **"Cancelar"** para regresar sin aplicar cambios). Esta acción no requiere registrar motivos.

> **[Captura: Paso 5]**
> *Ventana modal de confirmación para publicar la versión directamente en producción.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Ventana modal de confirmación para publicar la versión directamente en producción. (Móvil).*

6. **Rechazo de borrador con observaciones obligatorias (Ícono de equis):**
   Si la versión contiene inconsistencias o requiere ajustes:
   * **Apertura de la ventana modal de rechazo:** El Administrador presiona el botón **"Rechazar"** (con ícono de equis en computadores) de la página a evaluar. El sistema abre la ventana modal *«Rechazar versión [N] de [Página]»* para registrar las observaciones; el borrador pasa a estado rechazado conservando todos sus cambios, de modo que al volver a editar la página se retoma para ajustar y reenviarlo a revisión.
   * **Registro obligatorio de observaciones:** En el campo de texto (*«Explica la razón…»*), el Administrador redacta claramente el motivo del rechazo (hasta 100 caracteres con contador visible).
     * **Validación de seguridad:** El botón de confirmación **"Rechazar"** permanece inactivo mientras el campo esté vacío; es obligatorio escribir las observaciones para habilitarlo.
   * **Confirmación del rechazo:** Al presionar **"Rechazar"**, el borrador queda en estado rechazado con las observaciones registradas, sale de la bandeja de revisión y queda disponible para que al editar la página se ajuste el motivo de rechazo y se vuelva a enviar.

> **[Captura: Modal Rechazo con Observaciones]**
> *Ventana modal de rechazo con registro obligatorio de observaciones para ajustar y reenviar el borrador.*
>
> **[Captura: Modal Rechazo con Observaciones (Móvil)]**
> *Ventana modal de rechazo con registro obligatorio de observaciones para ajustar y reenviar el borrador. (Móvil).*

7. **Descarte definitivo con motivo obligatorio para auditoría (Ícono de papelera):**
   Si el borrador no procede, es un duplicado o fue remitido por error y debe anularse definitivamente:
   * **Apertura de la advertencia destructiva:** El Administrador presiona el botón **"Eliminar"** (con ícono de papelera en computadores) del borrador que se requiere anular. El sistema abre la ventana modal *«Eliminar versión [N] de [Página]»*, advirtiendo que los cambios no publicados se perderán de manera permanente e irreversible.
   * **Registro obligatorio del motivo:** En el campo de texto (*«Explica la razón…»*), registrar la justificación por la cual se descarta la versión (hasta 100 caracteres).
     * **Validación de seguridad:** El botón de confirmación **"Eliminar"** en la ventana modal permanece deshabilitado e inactivo mientras el campo se encuentre vacío. Es obligatorio ingresar el motivo para habilitar la confirmación.
   * **Confirmación del descarte:** Al presionar el botón **"Eliminar"** dentro de la ventana modal, la versión se elimina permanentemente de la plataforma y el motivo queda registrado de forma automática en la bitácora de auditoría.

> **[Captura: Confirmación Descarte]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, con exigencia del registro obligatorio del motivo para auditoría.*
>
> **[Captura: Confirmación Descarte (Móvil)]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, con exigencia del registro obligatorio del motivo para auditoría. (Móvil).*

---

#### 3.4.2.6. Auditoría y Bitácora de Eventos
*(Nota: Para consultar las posibles situaciones de validación, reglas de conservación del último año, descarga obligatoria de respaldos CSV y la tabla de referencia de acciones de la bitácora, remitirse a la [Sección 3.5.1.11: Validaciones y Solución de Problemas en la Bitácora de Auditoría](#35111-validaciones-y-solución-de-problemas-en-la-bitácora-de-auditoría)).*

Módulo de seguimiento y trazabilidad de eventos del sistema, accesible desde el menú lateral (o barra inferior en móviles) bajo **"Auditoría"**. Su propósito es registrar de forma transparente e inmutable las acciones ejecutadas en la plataforma: ciclo editorial de páginas, administración de usuarios, roles, permisos y seguridad.

1. **Barra de Filtros de Búsqueda:** En la parte superior de la vista se dispone de una barra de controles para acotar la consulta en tiempo real (los resultados se actualizan automáticamente al seleccionar cada valor):
   * **Categoría (filtro principal):** Clasifica los eventos según el ámbito operativo del sistema:
     * *Todas:* Muestra la totalidad de los movimientos sin distinción de área.
     * *Contenido editorial:* Agrupa las operaciones realizadas en el editor visual (creación de páginas, ediciones, guardado de borradores, autoguardados y envíos a revisión).
     * *Administración:* Agrupa las decisiones tomadas sobre los borradores (publicaciones, rechazos y archivados).
     * *Seguridad:* Agrupa el control de accesos, cuentas y permisos (autenticaciones, modificaciones de usuario o rol, expiración de vigencias, inactivaciones, bloqueos de cuenta, respuestas a preguntas de seguridad, cambios de contraseña y eliminaciones).
   * **Desde:** Selector de fecha inicial con calendario interactivo. Bloquea automáticamente la selección de fechas posteriores a la indicada en el campo *Hasta*.
   * **Hasta:** Selector de fecha final con calendario interactivo. Bloquea automáticamente la selección de fechas anteriores a la indicada en el campo *Desde*.
   * **Usuario:** Menú desplegable para filtrar por el funcionario responsable de la acción (*"Todos"* o el nombre específico del funcionario).
   * **Acción:** Menú desplegable contextual que adapta automáticamente sus opciones a la *Categoría* seleccionada previamente.
   * **Botón "Limpiar filtros":** Se visualiza dinámicamente cuando hay al menos un criterio activo, permitiendo restablecer la consulta a los valores por defecto con un solo clic.

> **[Captura: Filtros de Auditoría]**
> *Barra de filtros de búsqueda desplegando selectores de categoría, fechas, usuario, acción y botón para limpiar filtros.*
>
> **[Captura: Filtros de Auditoría (Móvil)]**
> *Barra de filtros de auditoría adaptada en dispositivo móvil. (Móvil).*

2. **Tabla de Registros de Auditoría y Columnas:** Despliega cronológicamente los eventos registrados. En computadores de escritorio, la tabla organiza la información en 6 columnas:
   * **Categoría:** Ámbito operativo al que pertenece el registro (*Contenido editorial*, *Administración* o *Seguridad*).
   * **Fecha y hora:** Fecha del suceso (DD/MM/AAAA) con la hora exacta (incluyendo segundos) visible en la línea inferior.
   * **Usuario:** Nombre completo del funcionario que ejecutó la acción, o la indicación *"Sin usuario"* si correspondió a un proceso automatizado del sistema (ej. caducidad programada de cuenta o bloqueo preventivo).
   * **Acción:** Etiqueta visual con la denominación oficial del evento (Creación, Edición, Autoguardado, Modificación, Archivado, Publicación, Rechazo, Expiración, Inactivación, Bloqueo, Autenticación, Preguntas de seguridad, Cambio de contraseña o Eliminación).
   * **Cambios:** Frase descriptiva redactada en lenguaje natural que resume lo ocurrido (ej. *«El usuario [Nombre] envió a revisión la versión [N] de [Página]»* o los comentarios de cambios registrados). En la tabla de escritorio se trunca en una línea mostrando el texto completo al posar el cursor, o hasta en tres líneas al apilarse.
   * **Detalle:** Botón con ícono de ojo (con texto de ayuda *«Ver detalle»* al pasar el cursor) que abre la ventana modal con los detalles completos del registro.

   En dispositivos móviles y tabletas, la tabla se presenta en formato acordeón: cada fila resume el evento mediante una frase explicativa (*«El usuario [Nombre] hizo la acción de...»*, o *«El sistema hizo la acción de...»*) y, al pulsar sobre ella para desplegarla, presenta la fecha exacta, el resumen de lo modificado y el botón **"Ver detalle"** con su ícono y texto visible.

   En la parte inferior de la tabla se ubica el **Paginador**, el cual permite alternar entre páginas de registros y ajustar el número de filas mostradas por pantalla (15, 25, 50 o 100 registros).

> **[Captura: Tabla de Auditoría]**
> *Tabla de registros de auditoría mostrando fecha y hora con segundos, usuario, etiqueta de acción, resumen de cambios y botón de detalle.*
>
> **[Captura: Tabla de Auditoría (Móvil)]**
> *Lista de registros de auditoría en formato acordeón en dispositivos móviles, con una fila desplegada mostrando detalle y botón de acceso.*

3. **Ventana Modal de Detalle del Registro:** Al presionar el botón con ícono de ojo en cualquier fila, el sistema despliega una ventana modal interactiva con la información de trazabilidad:
   * **Metadatos del evento:**
     * *Fecha y hora:* Marca temporal completa en formato largo (día de la semana, fecha y hora con segundos).
     * *Usuario:* Nombre del funcionario responsable o confirmación de ejecución automática por el sistema.
     * *Acción:* Etiqueta visual con la clasificación del evento.
     * *Entidad:* Tipo de elemento involucrado (*Página*, *Usuario*, *Rol*, *Configuración*).
     * *Identificador de la entidad:* Número o código identificador del elemento intervenido.
     * *Dirección IP:* Dirección IP de red desde la cual se emitió la solicitud.
     * *Navegador:* Información del navegador web y sistema operativo utilizado.
   * **Campos modificados:**
     * En eventos de edición y publicación de páginas: Cuadro comparativo con el *«Comentario anterior»* versus *«Comentario después»*, junto con el motivo si se trató de un rechazo o descarte.
     * En eventos de usuarios, roles o configuraciones: Lista detallada de cada atributo intervenido (ej. estado de cuenta, roles, fechas de caducidad) con su valor en estado **Antes** y **Después**.

> **[Captura: Modal Detalle del Registro]**
> *Ventana modal detallando metadatos de red (IP, navegador), entidad afectada y comparativa de campos modificados antes y después.*
>
> **[Captura: Modal Detalle del Registro (Móvil)]**
> *Ventana modal de detalle del registro adaptada a dispositivos móviles. (Móvil).*

4. **Depuración y Respaldo de la Bitácora de Auditoría:** Para prevenir la saturación de la base de datos sin vulnerar la trazabilidad histórica, el sistema incorpora un mecanismo de mantenimiento programado mediante el botón **"Depurar"** (con ícono de papelera), ubicado en la esquina superior derecha del módulo. La depuración opera bajo un estricto protocolo de seguridad:
   * **Criterio de conservación y análisis previo:** El sistema **conserva de forma obligatoria e inmutable todos los registros del último año** (365 días continuos desde el momento de la consulta). Al presionar **"Depurar"**, evalúa la base de datos y calcula la fecha de corte exacta, informando la cantidad de registros mayores a un año candidatos a depuración (con su peso en disco) y los registros protegidos del último año. Si no existen registros con más de un año de antigüedad, emite un aviso informativo indicando que la tabla se encuentra al día.
   * **Descarga obligatoria de respaldo en CSV antes de borrar:** Como salvaguarda de auditoría, el botón de confirmación **"Depurar [N] registros"** permanece **inactivo y bloqueado** hasta que el Administrador descargue el respaldo. Al hacer clic sobre el botón circular con ícono de descarga, el sistema genera y descarga en el equipo local el archivo oficial `respaldo-auditoria-depurada-[FECHA].csv`. Una vez confirmada la descarga, el botón muestra el ícono de verificación (check) y se habilita el botón de confirmación para proceder con el borrado.
   * **Ejecución y registro inmutable:** Al presionar **"Depurar [N] registros"**, el sistema elimina de forma definitiva los registros respaldados y presenta un resumen de confirmación con la cantidad exacta de eventos depurados y el espacio liberado en disco. Esta misma acción de depuración queda grabada automáticamente como un nuevo registro en la bitácora de auditoría, garantizando la trazabilidad total de la operación de mantenimiento.

> **[Captura: Modal de Depuración - Análisis y Respaldo]**
> *Ventana modal de depuración mostrando el análisis de registros mayores a un año y el botón de descarga obligatoria de respaldo en CSV.*
>
> **[Captura: Modal de Depuración - Análisis y Respaldo (Móvil)]**
> *Ventana modal de depuración y descarga de respaldo en dispositivo móvil. (Móvil).*

---

#### 3.4.2.7. Respaldos y Restauración de Páginas
*(Nota: Para consultar las posibles situaciones de validación, control de página en uso, advertencias de restauración y soporte de depuración, remitirse a la [Sección 3.5.1.12: Validaciones y Solución de Problemas en Respaldos y Restauración de Páginas](#35112-validaciones-y-solución-de-problemas-en-respaldos-y-restauración-de-páginas)).*

El módulo de **Respaldos** (`/admin/respaldos`) permite consultar y gestionar las versiones de respaldo de las páginas publicadas en el Sitio Web y en la Intranet. En la plataforma, el respaldo corresponde siempre a la **versión anterior retirada de publicación** cuando se aprobó una nueva publicación. Su objetivo es permitir al Administrador revisar cómo lucía la página antes de su última modificación y restaurar esa versión previa para que vuelva a estar publicada y visible en la plataforma si se necesita revertir algún cambio.

La interfaz lista de forma automática únicamente aquellas páginas que cuentan con una **versión anterior** (la versión previa retirada de publicación) disponible para restaurar.

1. **Barra de filtros de búsqueda:**
   Ubicada en la parte superior de la vista, permite acotar la consulta en tiempo real mediante los siguientes controles:
   * **Página (Ámbito):** Menú desplegable para filtrar por el ámbito operativo de las páginas (*"Todos"*, *"Sitio web"* o *"Intranet"*).
   * **Autor:** Menú desplegable que lista dinámicamente los nombres de los editores que elaboraron las versiones disponibles.
   * **Publicado por:** Menú desplegable para filtrar por el funcionario o administrador que aprobó la versión.
   * **Publicado desde:** Selector de fecha inicial con calendario interactivo. Bloquea automáticamente la selección de fechas posteriores a la indicada en el campo *Publicado hasta*.
   * **Publicado hasta:** Selector de fecha final con calendario interactivo. Bloquea automáticamente la selección de fechas anteriores a la indicada en el campo *Publicado desde*.
   * **Botón "Limpiar filtros":** Se visualiza dinámicamente cuando hay al menos un criterio activo, permitiendo restablecer la consulta a los valores por defecto con un solo clic.

> **[Captura: Filtros de Respaldos]**
> *Barra de filtros de búsqueda desplegando selectores de ámbito, autor, publicado por, fechas y botón de limpieza.*
>
> **[Captura: Filtros de Respaldos (Móvil)]**
> *Barra de filtros de respaldos adaptada en dispositivo móvil. (Móvil).*

2. **Tabla de páginas con respaldo activo y columnas:**
   Presenta el historial cronológico de publicaciones. En computadores de escritorio, la tabla organiza la información en 6 columnas:
   * **Página:** Presenta dos líneas informativas: en la parte superior la etiqueta de ámbito (*Sitio web* o *Intranet*), y en la línea inferior la ruta de la página y su número de versión publicado (ej. */inicio · versión 43*).
   * **Autor:** Nombre completo del funcionario que elaboró y editó la versión.
   * **Publicado por:** Nombre del funcionario o administrador que aprobó y publicó la versión.
   * **Editado el:** Fecha en que se realizó la edición con la hora exacta debajo.
   * **Publicado el:** Fecha formal de publicación con la hora exacta debajo.
   * **Versión anterior:** Botón con ícono de ojo (con texto de ayuda flotante *«Ver versión»* al pasar el cursor) que abre el visor de la versión anterior de respaldo.

   En dispositivos móviles y tabletas, la tabla se adapta en formato acordeón: cada fila resume la publicación mediante una frase explicativa (*«[Nombre] publicó la versión [N] de [Página]...»*); al pulsar sobre ella para desplegarla, expone el ámbito, las fechas exactas de publicación y edición, el nombre del editor responsable y el botón **"Ver versión [N]"** con su ícono y texto visible.

> **[Captura: Tabla de Respaldos]**
> *Tabla principal del módulo de Respaldos con listado de páginas que cuentan con una versión anterior disponible para restaurar.*
>
> **[Captura: Tabla de Respaldos (Móvil)]**
> *Lista de respaldos en formato acordeón en dispositivos móviles, con una fila desplegada mostrando detalle y botón de acceso. (Móvil).*

3. **Ventana modal de consulta y vista previa de la versión anterior:**
   Al hacer clic en el botón con ícono de ojo de cualquier registro (o en el botón **"Ver versión [N]"** en dispositivos móviles), el sistema abre la ventana modal con el detalle del respaldo:
   * **Información del respaldo:** Título de la página (*«Versión anterior de [Nombre de la página]»*) acompañado por su ruta y el número de versión que tenía en ese momento (ej. */inicio · versión 42*). Además, presenta el resumen de publicación: *Reemplazada por la versión* (número de la versión que quedó publicada en su lugar), *Reemplazada el* (fecha completa y hora exacta en que se publicó la nueva versión), *Autor* (editor responsable) y *Publicado por* (funcionario que la autorizó).
   * **Botón "Ver vista previa":** Botón interactivo (con ícono de ojo) que abre en una pestaña nueva del navegador la previsualización de la página. Esta vista permite al Administrador navegar y examinar con total fidelidad los bloques, textos, imágenes y la estructura general tal como lucía antes de que fuera reemplazada.

> **[Captura: Modal de Consulta y Vista Previa de Respaldo]**
> *Ventana modal de consulta de la versión anterior de respaldo con sus datos de publicación y botón de acceso a la vista previa.*
>
> **[Captura: Modal de Consulta y Vista Previa de Respaldo (Móvil)]**
> *Ventana modal de consulta de la versión anterior adaptada a dispositivo móvil. (Móvil).*

4. **Restauración de una versión previa y protección contra ediciones en curso:**
   Dentro de la ventana modal de consulta, el Administrador dispone del botón **"Restaurar versión"**:
   * **Validación de concurrencia en tiempo real (Página en uso):** Antes de autorizar cualquier cambio, el sistema verifica si algún editor se encuentra modificando la página en ese instante. Si detecta una sesión de edición activa, bloquea el proceso y despliega la ventana modal *«Página en uso»* informando: *«No se puede restaurar la página porque está siendo editada por [Nombre del funcionario]»*, evitando sobreescrituras accidentales.
   * **Ventana modal de confirmación:** Si la página no se esta editando, se abre la ventana de confirmación *«¿Restaurar versión anterior?»*, advirtiendo que la versión anterior volverá a quedar publicada en el portal y que la versión actual pasará a ser el nuevo respaldo.
   * **Publicación inmediata y trazabilidad:** Al presionar **"Aceptar"**, la versión anterior queda publicada automáticamente en el portal público o en la Intranet, y el evento queda grabado en la bitácora de auditoría.

> **[Captura: Confirmación de Restauración de Página]**
> *Ventana modal de advertencia y confirmación previa para volver a publicar la versión anterior de respaldo.*
>
> **[Captura: Confirmación de Restauración de Página (Móvil)]**
> *Ventana modal de confirmación de restauración en dispositivo móvil. (Móvil).*

5. **Depuración de versiones anteriores (Ventana modal «Depurar versiones antiguas»):**
   En la cabecera superior del módulo, al hacer clic en el botón **"Depurar"** (con ícono de papelera), el sistema abre la ventana modal **«Depurar versiones antiguas»** para optimizar el almacenamiento en el sistema bajo un estricto protocolo de seguridad:
   * **Regla de seguridad «Respaldo siempre protegido»:** En la parte superior de la ventana modal se destaca un aviso informativo: el sistema **conserva de forma obligatoria la versión anterior retirada de publicación de cada página**. Esto asegura que ninguna operación de depuración elimine el respaldo, garantizando que siempre se pueda regresar a la versión previa.
   * **Filtros de selección:** Menús desplegables para acotar la limpieza por *Ámbito* (*Todos los ámbitos*, *Sitio web*, *Intranet*) y por *Página* específica (o *Todas las páginas*).
   * **Panel de impacto en vivo:** Muestra en tiempo real las métricas de la depuración: *Total encontradas*, *Páginas afectadas*, *Espacio total* estimado a liberar en disco, y el detalle individual por página con la cantidad de versiones antiguas y espacio correspondiente.
   * **Protección contra ediciones en curso:** El sistema valida que ninguna de las páginas seleccionadas esté siendo editada en ese instante; de detectarse una sesión activa, cancela el proceso protegiendo el trabajo del editor.
   * **Confirmación de seguridad en dos pasos:** Al presionar el botón **"Depurar [N] versiones"**, la modal despliega un recuadro de advertencia (*«¿Estás seguro de que deseas eliminar permanentemente estas [N] versiones?»*). El Administrador debe presionar **"Confirmar y eliminar [N] versiones"** para autorizar la eliminación definitiva.
   * **Pantalla de éxito y cierre automático:** Al finalizar la operación, la modal presenta la pantalla informativa **«¡Depuración completada!»** confirmando la cantidad de versiones eliminadas y el espacio liberado en el sistema. Esta ventana se cierra automáticamente tras un breve instante, regresando al usuario a la tabla principal actualizada y registrando el evento en la bitácora de auditoría.

> **[Captura: Modal de Depuración de Versiones Antiguas]**
> *Ventana modal «Depurar versiones antiguas» mostrando los filtros por ámbito, panel de impacto en vivo y métricas de espacio a liberar.*
>
> **[Captura: Modal de Depuración de Versiones Antiguas (Móvil)]**
> *Ventana modal de depuración adaptada a dispositivos móviles. (Móvil).*
>
> **[Captura: Depuración Completada con Cierre Automático]**
> *Pantalla de confirmación «¡Depuración completada!» con métricas de espacio liberado antes de su cierre automático.*
>
> **[Captura: Depuración Completada con Cierre Automático (Móvil)]**
> *Pantalla de depuración completada en dispositivo móvil previa al cierre automático. (Móvil).*

---

#### 3.4.2.8. Actualizaciones y Carga Masiva de Datos en Excel

Disponible en la ruta `/admin/actualizaciones` (accesible desde el menú lateral izquierdo en **«Actualizaciones»** en computador, o desde la barra inferior dentro de **«Más»** en celular), este módulo permite subir, actualizar y administrar la información en archivos de Excel (`.xlsx`) que se muestra en las gráficas, mapas y consultas del sitio web público del observatorio.

**Estructura General y Permisos de Operación:**
* **Control de acceso por roles:** Subir archivos, registrar proyectos manualmente, actualizar sectores y publicar o borrar datos son acciones reservadas únicamente para el rol **Administrador**. Los demás roles con acceso al panel administrativo solo pueden ingresar a esta sección a revisar el historial y los datos cargados en modo de lectura.
* **Organización en tres apartados:** La pantalla organiza las tareas en **tres secciones desplegables** que alimentan directamente bloques específicos en el editor de páginas:
  1. **Programa + Sobresalientes:** Carga mediante archivo de Excel de programas y egresados del SENA para alimentar el bloque **«Programas Sobresalientes»**.
  2. **Alertas de inversión:** Carga masiva mediante archivo de Excel y registro individual de proyectos para alimentar el bloque **«Fuentes futuras de empleo»**, junto con la actualización de actividades económicas CIIU.
  3. **Criterios de clasificación de resultados:** Carga mediante archivo de Excel y publicación por año y periodo de los datos de demanda laboral para alimentar el bloque **«Tendencia Ocupacional»**.
* **Uso fácil e independiente:** Cada apartado funciona como una tarjeta separada con su título y flecha para abrir o cerrar. Al hacer clic o tocar sobre cualquier título, se muestran u ocultan sus opciones sin cerrar las demás, adaptándose cómodamente tanto a computadores como a pantallas de celulares o tabletas.

---

##### 3.4.2.8.1. Apartado «Programa + Sobresalientes»

Este módulo gestiona los datos de los programas y egresados destacados del SENA que alimentan el bloque **«Programas Sobresalientes»** en el editor de páginas. Funciona bajo una regla de reemplazo total: cada nueva carga exitosa reemplaza por completo los datos anteriores, actualizando de inmediato la información que muestra este bloque en el portal público.

###### Descarga y Preparación de la Plantilla Estructurada

1. **Descargar la plantilla:** Hacer clic en el botón **«Descargar formato»** en la parte superior para obtener el archivo oficial `formato-programas-sobresalientes.xlsx`.
2. **Estructura y diligenciamiento de la plantilla:** Diligenciar la hoja en Excel manteniendo el encabezado original en la primera fila:
   * **Nombre de la hoja:** Debe llamarse estrictamente **`Superan el margen`**.
   * **Columnas obligatorias (deben llenarse en cada fila):**
     * **`Cod. Regional`:** Código numérico institucional de la regional SENA.
     * **`Regional`:** Nombre de la regional o departamento (por ejemplo: *Antioquia* o *Cundinamarca*).
     * **`Cod. Centro`:** Código numérico identificador del centro de formación.
     * **`Centro`:** Nombre completo del centro de formación SENA (por ejemplo: *Centro de Comercio y Servicios*).
     * **`Cod. Nivel de formación`:** Código numérico correspondiente al nivel académico.
     * **`Nivel de Formación`:** Nivel educativo del programa (por ejemplo: *Tecnólogo*, *Técnico laboral* o *Especialización Tecnológica*).
     * **`Cod. Programa`:** Código numérico asignado al programa de formación.
     * **`Programa`:** Nombre completo del programa académico impartido.
     * **`Sexo`:** Género de los egresados objeto de la estadística (*Mujer* u *Hombre*).
     * **`Certificados`:** Cantidad de aprendices graduados y certificados en el periodo analizado.
     * **`Vinculados`:** Cantidad de egresados vinculados activamente al mercado de trabajo.
     * **`Tasa de vinculación`:** Porcentaje de inserción laboral alcanzado (puede escribirse con porcentaje o número decimal, por ejemplo: `82,4%` o `82.4`).
     * **`Salario promedio`:** Ingreso mensual promedio devengado por los egresados vinculados, anotado en pesos colombianos como cifra numérica.
3. **Guardar el archivo:** Guardar el documento en formato `.xlsx`.

> **[Captura: Descarga de Plantilla de Sobresalientes]**
> *Botón «Descargar formato» en la cabecera del apartado y aviso de formato admitido .xlsx.*
>
> **[Captura: Descarga de Plantilla de Sobresalientes (Móvil)]**
> *Control de descarga de plantilla adaptado a pantalla móvil. (Móvil).*

###### Carga y Procesamiento del Archivo Excel

1. **Seleccionar el archivo:** Hacer clic en el botón **«Cargar»** y elegir el archivo de Excel (`.xlsx`) diligenciado.
2. **Seguimiento del proceso:** El botón cambia su texto a *«Subiendo...»* y luego a *«Procesando...»*. Una barra en pantalla muestra el avance en dos pasos:
   * **Paso 1 («Leyendo el archivo» - 0% a 59%):** Revisa que las columnas y departamentos estén correctos y reúne los datos repetidos.
   * **Paso 2 («Guardando en la base de datos» - 60% a 100%):** Guarda la información de los programas y niveles de formación.
3. **Resultado:** Al llegar al 100%, la barra desaparece y la información queda actualizada de inmediato en el bloque **«Programas Sobresalientes»** del portal público.

> **[Captura: Carga y Procesamiento de Sobresalientes]**
> *Botón en estado «Procesando...» con la barra de progreso en vivo indicando el avance, conteo de filas y la fase activa.*
>
> **[Captura: Carga y Procesamiento de Sobresalientes (Móvil)]**
> *Seguimiento de la carga de programas con la barra de progreso en pantalla móvil. (Móvil).*

###### Consulta y Gestión del Historial de Cargas

1. **Ubicación del historial:** En la parte inferior, revisar la tabla interactiva **«Historial de cargas»**, la cual lista en orden cronológico inverso cada archivo procesado.
2. **Columnas de trazabilidad:**
   * **Fecha:** Día y hora exacta en que se procesó el archivo.
   * **Estado:** Etiqueta visual de estado con contraste accesible:
     * *Completado:* Fondo verde suave con texto verde oscuro.
     * *Procesando:* Fondo azul con texto azul y punto animado con el porcentaje en curso.
     * *Error:* Fondo rojo con texto rojo por fallas de estructura en el archivo.
   * **Filas:** Cantidad total de registros ingresados al sistema con separador de miles.
   * **Mensaje:** Resumen descriptivo de la operación o explicación de la causa técnica si ocurrió un error.
3. **Eliminación de un registro de auditoría:**
   * Al final de la fila de cada carga, hacer clic en el botón con ícono de papelera.
   * Se abre una ventana modal de confirmación con la advertencia: *«Se borra del historial y, si ningún otro registro usa el mismo archivo, también el Excel guardado en el servidor. Los datos que ya quedaron en el mapa de formación no se tocan — esto solo borra la auditoría de la carga.»*.
   * Para confirmar la acción, hacer clic en el botón **«Eliminar»** (o **«Cancelar»** para desistir sin alterar el registro).

> **[Captura: Historial de Cargas de Sobresalientes]**
> *Tabla del historial de cargas con columnas de fecha, estado, conteo de filas y ventana de confirmación de eliminación.*
>
> **[Captura: Historial de Cargas de Sobresalientes (Móvil)]**
> *Historial de cargas adaptado a dispositivos móviles con botón de eliminación. (Móvil).*

---

##### 3.4.2.8.2. Apartado «Alertas de Inversión»

Este apartado reúne las herramientas para registrar y administrar los proyectos e iniciativas de inversión empresarial que alimentan el bloque **«Fuentes futuras de empleo»** en el editor de páginas. Funciona de manera acumulativa: las cargas por archivo de Excel y los registros manuales agregan nuevos proyectos o actualizan los existentes sin borrar la información registrada anteriormente.

###### Descarga de Formatos Oficiales

1. **Botones de descarga:** En la parte superior se presentan dos opciones de descarga:
   * **Descargar formato:** Plantilla oficial `formato-alertas-inversion.xlsx` para la carga masiva de proyectos de inversión.
   * **Descargar formato CIIU:** Plantilla oficial `formato-actualizar-ciiu.xlsx` para la actualización de actividades económicas.
2. **Descarga:** Al hacer clic en cualquiera de ellos, el archivo se descarga en el equipo para su diligenciamiento.

> **[Captura: Botones de Descarga en Alertas de Inversión]**
> *Controles de descarga en la cabecera mostrando los botones «Descargar formato» y «Descargar formato CIIU».*
>
> **[Captura: Botones de Descarga en Alertas de Inversión (Móvil)]**
> *Botones de descarga de formatos adaptados a pantallas móviles. (Móvil).*

###### Carga Masiva mediante Archivo Excel

1. **Estructura y diligenciamiento de la plantilla:** Diligenciar la plantilla oficial `formato-alertas-inversion.xlsx` en Excel manteniendo los nombres originales de las columnas en la primera fila:
   * **Columnas obligatorias (deben llenarse en cada fila):**
     * **`Código`:** Código de la actividad económica según la clasificación CIIU (número de 4 dígitos o letra de sección de la A a la U).
     * **`Actividad`:** Nombre o descripción del sector o actividad productiva (por ejemplo: *Fabricación de productos farmacéuticos*).
     * **`Departamento`:** Departamento de Colombia donde se localizará la inversión (debe coincidir con la división territorial oficial).
     * **`Ciudad`:** Nombre del municipio o ciudad puntual donde se desarrollará el proyecto.
     * **`Empresa`:** Nombre comercial o razón social de la compañía u organización inversionista.
     * **`Fecha`:** Fecha en que se anunció la noticia o iniciativa, registrada en formato día/mes/año (ejemplo: `15/03/2025`) o aplicando el formato de fecha estándar de Excel.
     * **`Fuente`:** Enlace web completo de la noticia, boletín o portal de origen (debe iniciar con `http://` o `https://`).
     * **`Descripción`:** Resumen explicativo del proyecto, sus objetivos o los productos y servicios vinculados.
     * **`Tipo`:** Modalidad de la iniciativa; se debe escribir estrictamente **«Nuevo»** (inicio de nuevas operaciones) o **«Expansión»** (ampliación de instalaciones o capacidad instalada).
   * **Columnas opcionales (pueden dejarse vacías si no se dispone del dato):**
     * **`Inversión COP`:** Valor monetario estimado de la inversión en pesos colombianos, escribiendo únicamente el número sin letras ni signos de puntuación de moneda (por ejemplo: `5000000000`).
     * **`Empleos estimados`:** Cantidad proyectada de empleos o vacantes que generará la iniciativa (número entero).
     * **`Medio`:** Nombre del periódico, emisora o portal informativo que divulgó la noticia (por ejemplo: *Portafolio*, *La República* o boletín oficial).
2. **Selección del archivo:** Hacer clic en el botón **«Cargar Excel»** y elegir el archivo `.xlsx` diligenciado.
3. **Seguimiento del proceso:** Una barra en pantalla muestra el avance en dos pasos:
   * **Paso 1 («Leyendo el archivo» - 0% a 49%):** Comprueba que no falten datos obligatorios, valida los enlaces web y verifica que los municipios existan en el mapa territorial.
   * **Paso 2 («Guardando en la base de datos» - 50% a 100%):** Registra las empresas y almacena los proyectos.
4. **Resultado:** Al completarse la barra, los nuevos proyectos se suman a los existentes y quedan visibles de inmediato en las consultas del observatorio.

> **[Captura: Carga Masiva de Alertas de Inversión]**
> *Botón «Cargar Excel» en ejecución y barra de progreso interactiva detallando el avance del procesamiento.*
>
> **[Captura: Carga Masiva de Alertas de Inversión (Móvil)]**
> *Carga masiva de proyectos con barra de progreso en pantalla móvil. (Móvil).*

###### Registro Manual de Proyectos Individuales

1. **Apertura del formulario:** En la barra superior, hacer clic en el botón **«Agregar manualmente»** para abrir la ventana modal.
2. **Diligenciar campos obligatorios:**
   * **Tipo de proyecto:** Seleccionar **«Nuevo»** o **«Expansión»**.
   * **Empresa y Descripción:** Indicar la razón social y la síntesis de la iniciativa.
   * **Sección CIIU y Departamento:** Elegir en los menús desplegables correspondientes.
   * **Fecha del anuncio:** Indicar el día en el calendario interactivo.
   * **Enlace de la fuente:** Pegar la dirección web (iniciando con `http://` o `https://`).
3. **Diligenciar campos opcionales:** Indicar clase CIIU (4 dígitos), ciudad/municipio, medio de comunicación, inversión estimada en COP o vacantes estimadas.
4. **Validación y guardado:** Al presionar **«Guardar»**, si falta algún dato requerido el campo se resalta con borde rojo y aviso explicativo. Con los datos correctos, la ventana se cierra y el proyecto se incorpora de inmediato al catálogo y al historial.

> **[Captura: Formulario de Registro Manual de Inversión]**
> *Ventana modal «Agregar proyecto de inversión» mostrando la selección de tipo, campos obligatorios, selectores de sector y departamento, y avisos de validación.*
>
> **[Captura: Formulario de Registro Manual de Inversión (Móvil)]**
> *Formulario modal de registro de proyectos adaptado a una sola columna en dispositivo móvil. (Móvil).*

###### Actualización de Sectores Económicos (CIIU)

1. **Selección del archivo:** En la parte superior, hacer clic en el botón **«Actualizar sectores (CIIU)»** y seleccionar el archivo `formato-actualizar-ciiu.xlsx`. El botón mostrará temporalmente *«Actualizando...»*.
2. **Estructura y requisitos de la hoja:** La hoja debe contener únicamente dos columnas:
   * **`Código`:** Código numérico de 4 dígitos de la actividad económica (las actividades con cero inicial, como `0111`, deben configurarse con formato de texto en Excel). Los códigos de 2 o 3 dígitos se omiten de forma automática.
   * **`Nombre`:** Denominación o nombre formal del sector o actividad económica según la clasificación CIIU.
3. **Resumen de la actualización:** Al terminar de procesar el archivo, el sistema muestra un recuadro con el resultado de la operación:
   * Cantidad de sectores creados como nuevos.
   * Cantidad de sectores con nombre actualizado y sectores que se mantuvieron sin cambios.
   * Conteo de códigos de 2 o 3 dígitos omitidos (si existieron).
   * Lista de filas con errores (indicando el número de fila en Excel y la causa).

> **[Captura: Resumen de Actualización de Sectores CIIU]**
> *Recuadro informativo con el balance de sectores creados, actualizados, sin cambios, códigos omitidos y reporte de inconsistencias.*
>
> **[Captura: Resumen de Actualización de Sectores CIIU (Móvil)]**
> *Balance de actualización de sectores CIIU adaptado a pantalla móvil. (Móvil).*

###### Gestión de Proyectos e Historial

1. **Paneles de consulta:**
   * **Historial de cargas:** Registra las importaciones de Excel con fecha, estado visual, total de filas y botón de papelera para eliminar la auditoría.
   * **Proyectos registrados:** Lista los proyectos visibles en el portal con empresa, tipo, sector, ubicación y fecha.
2. **Eliminación individual de un proyecto:**
   * Hacer clic en el ícono de papelera al final de la fila del proyecto.
   * En la ventana modal (*«¿Eliminar este proyecto? Se borra el proyecto de [Empresa] y deja de verse en el sitio público. Esta acción no se puede deshacer.»*), hacer clic en el botón **«Eliminar»** (o **«Cancelar»** para mantenerlo).
3. **Vaciado general («Limpiar todo»):**
   * En la esquina del listado, hacer clic en el botón **«Limpiar todo»**.
   * Confirmar la advertencia preventiva en la ventana modal para retirar todos los proyectos del catálogo público en una sola acción.

> **[Captura: Gestión de Proyectos de Inversión e Historial]**
> *Paneles de historial de importaciones y catálogo de proyectos registrados con opciones de eliminación individual y botón «Limpiar todo».*
>
> **[Captura: Gestión de Proyectos de Inversión e Historial (Móvil)]**
> *Listado de proyectos registrados e historial en formato acordeón para pantallas móviles. (Móvil).*

---

##### 3.4.2.8.3. Apartado «Criterios de Clasificación de Resultados» (Tendencia Ocupacional)

Este apartado permite cargar y publicar los datos de demanda laboral (inscritos frente a vacantes) que alimentan el bloque **«Tendencia Ocupacional»** en el editor de páginas. Funciona mediante un control de cortes por año y periodo, donde cada carga exitosa se guarda inicialmente en borrador hasta su publicación definitiva.

###### Descarga y Estructura de la Plantilla de Percentiles

1. **Descargar la plantilla:** En la esquina superior derecha, hacer clic en el botón **«Descargar formato»** para obtener el archivo oficial `formato-tendencia-ocupacional.xlsx`.
2. **Estructura y diligenciamiento de la plantilla:** Diligenciar la información respetando estrictamente las dos hojas predefinidas en el libro de Excel, sin alterar sus nombres ni agregar hojas adicionales:
   * **Hoja `percentiles nacional` (datos consolidados de todo el país):**
     * **`N.C.`:** Nivel de cualificación ocupacional (cifra numérica del 1 al 5).
     * **`Código ocupación`:** Código numérico de 4 dígitos que identifica la ocupación en la clasificación nacional.
     * **`Descripción` (u `Ocupación`):** Denominación o nombre formal de la ocupación analizada.
     * **`Inscritos`:** Cantidad de personas registradas que buscan empleo en esa ocupación.
     * **`Vacantes`:** Número de puestos de trabajo requeridos por las empresas.
     * **`Percentil Inscritos`:** Valor de percentil calculado para la oferta de buscadores de empleo.
     * **`Percentil Vacantes`:** Valor de percentil calculado para la demanda empresarial.
     * **Columnas de criterios:** Cuatro columnas que clasifican cada ocupación en los cuadrantes de demanda (más solicitadas y más buscadas, más buscadas y menos solicitadas, más solicitadas y menos buscadas, o menos solicitadas y menos buscadas).
   * **Hoja `percentiles departamental` (datos desglosados por departamento):**
     * Contiene las mismas columnas de la hoja nacional, agregando de manera obligatoria la columna **`Departamento`** con el nombre del departamento correspondiente (homologado con el mapa oficial).
3. **Guardar el archivo:** Guardar el documento en formato `.xlsx`.

> **[Captura: Descarga de Plantilla de Tendencia Ocupacional]**
> *Cabecera del apartado mostrando la descripción funcional y el botón «Descargar formato» para la matriz de percentiles.*
>
> **[Captura: Descarga de Plantilla de Tendencia Ocupacional (Móvil)]**
> *Control de descarga de plantilla de percentiles adaptado a pantallas móviles. (Móvil).*

###### Selección de Año, Periodo y Autodetección Inteligente

1. **Definir corte:** Seleccionar el año y el periodo en el menú desplegable (Trimestres `T1`–`T4`, Semestres `S1`–`S2`, o corte `ANUAL`). Si un periodo ya tiene datos cargados o en curso, el selector lo indica directamente (*«ya cargado»* o *«en curso»*).
2. **Autodetección por nombre de archivo:** Al elegir el archivo `.xlsx`, si su nombre contiene el año y periodo (por ejemplo, `percentiles_2025_T1.xlsx`), el sistema los detecta y asigna automáticamente. Si se modifican a un valor diferente, se muestra un texto preventivo en color ámbar.

> **[Captura: Selección de Año, Periodo y Autodetección Inteligente]**
> *Formulario de corte mostrando los selectores de año y periodo, marcas de estado en el desplegable y mensaje de autodetección por nombre de archivo.*
>
> **[Captura: Selección de Año, Periodo y Autodetección Inteligente (Móvil)]**
> *Selectores de año, periodo y casilla de archivo en pantalla móvil. (Móvil).*

###### Regla de Celda Libre y Control de Reemplazo

* **Una única carga por corte:** Cada combinación de año y periodo admite una sola carga activa en el observatorio.
* **Bloqueo preventivo:** Si el periodo ya tiene datos vigentes, el botón **«Cargar»** se deshabilita con el aviso: *«Ya tiene datos: para cambiarlos, elimine su carga.»* y el enlace **«Ver en el historial»**.
* **Liberación de la celda:** Al pulsar **«Ver en el historial»**, la pantalla se desplaza a la tabla inferior y filtra ese corte. El Administrador puede eliminar la carga previa para liberar la celda y habilitar la nueva subida.

> **[Captura: Regla de Celda Libre y Bloqueo de Periodos Existentes]**
> *Mensaje preventivo de corte ocupado con botón «Cargar» deshabilitado y enlace interactivo «Ver en el historial».*
>
> **[Captura: Regla de Celda Libre y Bloqueo de Periodos Existentes (Móvil)]**
> *Aviso de celda ocupada con enlace de desplazamiento al historial en dispositivo móvil. (Móvil).*

###### Carga y Validación Integral en Cuatro Fases

1. **Iniciar carga:** Con la celda libre y el archivo seleccionado, hacer clic en el botón **«Cargar»**.
2. **Seguimiento del avance:** La barra de progreso avanza en cuatro etapas:
   * **Fase 1 («Leyendo el archivo» - 0% al 39%):** Comprueba el libro Excel y la existencia de las dos hojas requeridas.
   * **Fase 2 («Preparando las filas» - 40% al 59%):** Estandariza registros y homologa departamentos.
   * **Fase 3 («Validando (V1–V9)» - 60% al 84%):** Aplica validaciones bloqueantes (V1 a V5: cancelan la operación y marcan error ante datos inválidos o descuadres) y advertencias de calidad (V6 a V9: generan reporte de hallazgos sin detener la carga).
   * **Fase 4 («Guardando en la base de datos» - 85% al 100%):** Almacena el periodo y genera el registro en la auditoría.
3. **Finalización:** Al completarse el 100%, la casilla de archivo se reinicia y se presenta el recuadro de resultados.

> **[Captura: Barra de Progreso y Validación en Cuatro Fases]**
> *Barra de avance en tiempo real detallando el porcentaje acumulado, conteo de filas y la fase activa de validación (V1-V9).*
>
> **[Captura: Barra de Progreso y Validación en Cuatro Fases (Móvil)]**
> *Seguimiento de la validación en 4 fases adaptado a pantalla de dispositivo móvil. (Móvil).*

###### Estado Borrador, Reporte de Hallazgos y Publicación

1. **Nacimiento en estado Borrador:** Toda carga exitosa inicia en estado **Borrador («Sin publicar»)** en color ámbar, resguardando los datos sin alterar los tableros públicos.
2. **Reporte de validación:** El botón **«Reporte»** detalla las observaciones analíticas indicando hoja, fila de Excel, ocupación y valores calculados.
3. **Publicación en el sitio:** En la bandeja **«Pendientes de publicar»**, hacer clic en **«Publicar»** (corte individual) o **«Publicar todos»** para pasar a estado verde **«Publicado»** y exhibir los datos en el portal.

> **[Captura: Bandeja de Pendientes de Publicar y Reporte de Validación]**
> *Bandeja superior de cortes pendientes en borrador «Sin publicar», botón «Publicar todos», recuadro de resultado y desglose del reporte de hallazgos.*
>
> **[Captura: Bandeja de Pendientes de Publicar y Reporte de Validación (Móvil)]**
> *Bandeja de pendientes de publicar y botón de reporte de validación en pantalla móvil. (Móvil).*

###### Historial Especializado, Despublicación y Eliminación

1. **Filtros de consulta:** Selectores superiores para filtrar rápidamente por año o periodo con paginación de resultados.
2. **Columnas de trazabilidad:** Año y periodo, archivo `.xlsx`, cargado por (con fecha y hora exacta), estado visual (*Publicado*, *Borrador*, *En curso*, *Inactiva*, *Error*), resumen de filas y botón de reporte.
3. **Despublicación:** En cualquier corte *Publicado*, hacer clic en **«Despublicar»** y confirmar en la ventana modal (*«¿Despublicar [Año · Periodo]? El sitio deja de mostrarlo. Los datos quedan en borrador y se pueden volver a publicar.»*). El periodo vuelve a borrador sin borrar los datos del sistema.
4. **Eliminación:** Hacer clic en el ícono de papelera y confirmar en la ventana modal según su estado:
   * *En borrador:* Borra la carga, su reporte y el archivo Excel del servidor.
   * *Publicado:* Deja de mostrar la información en los visores del portal público.
   * *Con error:* Retira el registro fallido y libera la celda para una nueva subida.

> **[Captura: Historial de Tendencia Ocupacional con Filtros y Opciones de Despublicar]**
> *Tabla del historial de tendencia con filtros superiores, banderas cromáticas de estado, botón «Despublicar» y diálogo modal de eliminación.*
>
> **[Captura: Historial de Tendencia Ocupacional con Filtros y Opciones de Despublicar (Móvil)]**
> *Historial de cortes de tendencia ocupacional adaptado a pantallas de dispositivos móviles. (Móvil).*

---

#### 3.4.2.9. Perfil de Usuario ("Mi perfil" y "Configuración")

Esta sección permite consultar los datos personales, cambiar la contraseña y ajustar las preferencias del panel administrativo:

* **En computador:** Ambas opciones se abren haciendo clic sobre el nombre de usuario, al final del menú lateral izquierdo.
* **En celular o tableta:** **"Mi perfil"** se abre tocando el nombre de usuario en la barra superior, y **"Configuración"** pulsando el botón **«Más»** en la barra inferior.

##### 3.4.2.9.1. Sección "Mi Perfil"

*(Nota: Para consultar las posibles situaciones de validación, errores de contraseña actual, discrepancias de confirmación y soporte de campos en solo lectura, remitirse a la [Sección 3.5.1.13: Validaciones y Solución de Problemas en Mi Perfil](#35113-validaciones-y-solución-de-problemas-en-mi-perfil)).*

Disponible en la ruta `/admin/mi-perfil` (accesible desde el menú de usuario en la barra lateral en escritorio o tocando el nombre de usuario en la barra superior móvil), reúne la consulta de la cuenta y la actualización de la contraseña:

1. **Datos del usuario (solo lectura):** Presenta el **Nombre**, **Apellidos** y **Correo Electrónico** (`@sena.edu.co`) asociados a la cuenta. Estos campos son de solo lectura en esta vista; para modificar el nombre, los apellidos o el correo de cualquier funcionario, el cambio se realiza desde el módulo **Accesos > Usuarios** (`/admin/users`), editando el registro correspondiente en la tabla (ver [Sección 3.4.2.4: Gestión de Usuarios y Control de Acceso](#3424-gestión-de-usuarios-y-control-de-acceso)).

2. **Cambio de contraseña:** Para actualizar la clave de acceso, el usuario sigue estos pasos:
   * **Contraseña actual:** Se digita la clave vigente en la primera casilla (incluye botón con ícono de ojo para ver u ocultar los caracteres).
   * **Nueva contraseña:** Se ingresa la nueva clave (con botón para ver u ocultar), guiándose por el panel en vivo que evalúa los requisitos de seguridad (al menos 12 caracteres, máximo 72 caracteres, combinación de mayúsculas, minúsculas, números o símbolos, y sin emojis). Si la clave propuesta coincide con la contraseña actual, con la inmediatamente anterior o no supera la política de seguridad, el formulario despliega directamente bajo la casilla el aviso preventivo: *«Esta contraseña no es válida por seguridad, elige otra.»*.
   * **Confirmar contraseña:** Se vuelve a escribir la nueva clave para asegurar que ambas coincidan.
   * **Guardar cambios:** Se hace clic en el botón **"Cambiar Contraseña"** (mostrará el estado *«Guardando...»* mientras se procesa la solicitud). Al completarse, el sistema confirma la operación con el mensaje *«Contraseña actualizada exitosamente»*, limpia las casillas del formulario y registra el evento en la bitácora de auditoría.

> **[Captura: Mi Perfil]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los datos de cuenta en solo lectura y el formulario de cambio de contraseña.*
>
> **[Captura: Mi Perfil (Móvil)]**
> *Vista del módulo "Mi Perfil" en dispositivo móvil adaptada a una sola columna. (Móvil).*

##### 3.4.2.9.2. Sección "Configuración"

*(Nota: Para consultar las posibles situaciones de validación, restricciones de formato y peso de imagen, alertas de contraste y persistencia local de sonidos, remitirse a la [Sección 3.5.1.14: Validaciones y Solución de Problemas en Configuración](#35114-validaciones-y-solución-de-problemas-en-configuración)).*

Disponible en la ruta `/admin/configuracion` (accesible desde el menú de usuario en la base de la barra lateral izquierda en escritorio, o desde la barra inferior móvil dentro de **«Más»**), permite personalizar la identidad visual del panel y ajustar las preferencias de sonido:

1. **Identidad visual (Logotipo, ícono de pestaña y tema oscuro):**
   Permite personalizar los distintivos gráficos de la plataforma en tiempo real:
   * **Logo de la barra lateral:** Se carga haciendo clic o arrastrando una imagen PNG horizontal (hasta 1 MB, recomendada con fondo transparente). El sistema la guarda de forma inmediata y ofrece previsualizaciones en vivo en modo claro y oscuro, además del botón **«Volver al de fábrica»** para restaurar el diseño original.
   * **Ícono de la pestaña (Favicon):** Se carga arrastrando o seleccionando un PNG cuadrado (hasta 512 KB, mínimo 64 × 64 px) para la pestaña del navegador y la barra móvil, incluyendo su botón para restablecer el de fábrica.
   * **Pasar a blanco en modo oscuro:** Interruptor para fijar en blanco logos o íconos oscuros con fondo transparente cuando se usa el tema oscuro. Debe mantenerse apagado si la imagen tiene fondo propio.

> **[Captura: Configuración - Identidad Visual]**
> *Gestión del logotipo de la barra lateral y del ícono de la pestaña con previsualizaciones simultáneas en tema claro y oscuro, e interruptor de modo oscuro.*
>
> **[Captura: Configuración - Identidad Visual (Móvil)]**
> *Sección de identidad visual adaptada a pantallas móviles. (Móvil).*

2. **Personalización de colores (Botones y Etiquetas):**
   Permite ajustar la paleta de colores de la interfaz asegurando una óptima legibilidad:
   * **Etiquetas de acción (Tooltips) y Botones:** Organizados en acordeones interactivos (*«En el panel»* / *«En el editor»* para etiquetas, y *«En las pantallas»* / *«En los modales»* para botones).
   * **Ajuste y validación de contraste:** Para cada elemento se selecciona el color de **Fondo** y de la **Letra**. El sistema evalúa el contraste en tiempo real: si cumple la norma (mínimo 4,5:1) muestra **«Se lee bien»**; si no, advierte **«Poco contraste»** y ofrece botones asistidos (**«Usar letra blanca»** o **«Usar letra azul oscuro»**) para corregirlo con un clic.
   * **Guardar o revertir:** Los cambios se confirman con **«Guardar colores de las etiquetas»** o **«Guardar colores de los botones»**. También se dispone de **«Descartar cambios»** y **«Volver a los de fábrica»**. Los textos y nombres de los botones son fijos del sistema y no son editables.

> **[Captura: Configuración - Personalización de Colores]**
> *Acordeones de botones y etiquetas con selectores de color, muestra previa interactiva en vivo e indicador de contraste accesible.*
>
> **[Captura: Configuración - Personalización de Colores (Móvil)]**
> *Personalización de colores adaptada a dispositivos móviles con selectores táctiles nativos. (Móvil).*

3. **Sonido de los avisos:**
   Preferencia individual guardada localmente en el navegador web del usuario:
   * **Interruptor de sonido:** Permite activar o silenciar el timbre corto que acompaña a las notificaciones emergentes de éxito, advertencia y error (activo por defecto).
   * **Prueba de tonos:** Incluye los botones interactivos **«Éxito»**, **«Advertencia»** y **«Error»** para reproducir y verificar cada sonido al instante, incluso si el interruptor general está silenciado.

> **[Captura: Configuración - Sonido de los Avisos]**
> *Control del sonido de avisos con interruptor de activación local y botones interactivos para probar cada tono.*
>
> **[Captura: Configuración - Sonido de los Avisos (Móvil)]**
> *Control del sonido de avisos en dispositivo móvil. (Móvil).*

---

### 3.4.3. Gestión Editorial y Contenido Dinámico en el Editor Visual

Esta sección describe el uso del Editor Visual interactivo para diseñar, maquetar, actualizar y administrar las páginas del Observatorio Laboral y Ocupacional (OLO).

Todo lo explicado en este numeral aplica de la misma forma tanto para el **Sitio Web Público** como para la **Intranet**. El botón flotante, la interfaz del editor, las herramientas de trabajo y los pasos para crear o eliminar páginas funcionan exactamente igual en ambos portales; lo único que cambia entre ellos es el catálogo de componentes disponibles para cada uno.

#### 3.4.3.1. Acceso a las Opciones de Edición (Botón Flotante)

El botón flotante permite a los usuarios con facultades editoriales gestionar contenidos directamente mientras navegan por el portal. Las opciones que se despliegan en este botón responden de manera dinámica a los permisos asignados a cada usuario; si cuenta con los permisos correspondientes para la página en la que se encuentra posicionado, podrá acceder a: **Editar página** (para maquetar la página actual), **Menú y pie** (para modificar la cabecera y el pie de página globales), **Nueva página** (para crear una nueva página) y **Eliminar página** (para retirar la página actual), además de disponer de un botón directo para **salir del modo de edición** (para cerrar sesion).

1. **Visibilidad y estructura del botón flotante:**
   El componente se fija en la esquina inferior derecha de la pantalla y permanece visible en cualquier página siempre que el usuario cuente con una sesión activa y permisos editoriales asignados (o rol de Administrador). Para visitantes públicos o usuarios sin facultades de edición, el botón no se dibuja en pantalla.
   La estructura flotante está compuesta por dos controles principales apilados verticalmente:
   * **Disparador principal de opciones (Botón circular con ícono de lápiz):** Botón circular con un ícono de lápiz. Al situar el cursor sobre él, despliega la etiqueta informativa flotante *«Opciones de edición»*.
   * **Botón directo de salida (Botón circular con ícono de salida):** Ubicado de manera permanente justo debajo del disparador principal, con un ícono de puerta y flecha de salida. Al pasar el cursor muestra la etiqueta *«Salir del modo edición»*. Aunque su título indica salir del modo edición, su función real y definitiva es **cerrar la sesión** activa de la cuenta. Al pulsarlo, despliega la ventana modal de confirmación titulada **«Salir del modo edición»** con las opciones **«Cancelar»** y **«Aceptar»**; al confirmar, el sistema cierra la sesión y desactiva el acceso autenticado (ver [Sección 3.4.1.4: Procedimiento de Cierre de Sesión](#3414-procedimiento-de-cierre-de-sesión)).

> **[Captura: Botón Flotante de Edición]**
> *Botón flotante fijado en la esquina inferior derecha con disparador de opciones de edición y botón directo de salida.*
>
> **[Captura: Botón Flotante de Edición (Móvil)]**
> *Visualización del botón flotante adaptado a dispositivos móviles. (Móvil).*

2. **Despliegue del menú de acciones editoriales:**
   Al hacer clic sobre el disparador principal de lápiz, el ícono rota 90° y se transforma en un ícono de equis, la etiqueta cambia a *«Cerrar opciones»*, y el submenú de herramientas se despliega verticalmente hacia arriba con animación fluida. Las opciones disponibles operan bajo la misma interfaz e interactividad en ambos entornos, evaluándose según los permisos concedidos al usuario:
   * **Editar página (Ícono de lápiz sobre documento):** Abre de inmediato la página actual en el Editor Visual para modificar sus textos, imágenes y estructura de bloques. Se muestra si el usuario tiene asignado el permiso para editar esa página específica o si cuenta con el rol de Administrador.
   * **Menú y pie (Ícono de capas):** Permite ingresar al editor para estructurar los elementos globales que comparten todas las páginas del portal (barra superior, menú de navegación principal e información del pie de página). Requiere el permiso de **«Menú y pie de página»** (*«Menú y pie del sitio web»* o *«Menú y pie de la intranet»*, dentro del grupo *Editar*) o el rol de Administrador.
   * **Nueva página (Ícono de suma "+"):** Despliega la ventana modal de creación, solicitando el nombre deseado y generando automáticamente su dirección web de acceso. Requiere el permiso de creación correspondiente o el rol de Administrador.
   * **Eliminar página (Ícono de papelera):** Ubicado en la parte superior del menú desplegado con estilo de advertencia. Inicia el procedimiento de retiro seguro y comprobación previa de enlaces activos. Solo aparece en páginas dinámicas creadas por editores y requiere el permiso para eliminar páginas o el rol de Administrador.

> **[Captura: Menú Flotante de Edición Desplegado]**
> *Menú de herramientas editoriales desplegado verticalmente mostrando las opciones de Editar página, Menú y pie, Nueva página y Eliminar página con sus etiquetas flotantes.*
>
> **[Captura: Menú Flotante de Edición Desplegado (Móvil)]**
> *Menú flotante desplegable adaptado a pantalla móvil. (Móvil).*

3. **Cierre del menú desplegable:**
   El submenú se cierra si el usuario hace clic nuevamente sobre el botón con ícono de equis o si pulsa en cualquier área de la pantalla fuera del menú flotante.

#### 3.4.3.2. Edición de Contenidos: Páginas y «Menú y pie de página»

En la plataforma, una pantalla se divide visualmente en dos componentes fundamentales: el **cuerpo central de contenido** (exclusivo de cada página) y la **envoltura global de navegación** (la cabecera y el pie de página compartidos por todo el portal). Según la zona que se requiera intervenir, el usuario accede a dos modalidades de edición independientes:

1. **Edición de Páginas Dinámicas (Opción «Editar página»):**
   * **Propósito y alcance:** Permite estructurar, diseñar y actualizar los bloques de contenido situados en el cuerpo central de la página activa (por ejemplo: la página de Inicio, una página informativa de normatividad o un boletín temático). Los cambios introducidos afectan exclusivamente a la página en edición, sin alterar el resto de secciones del portal.
   * **Comportamiento en pantalla:** Al pulsar **«Editar página»** en el menú flotante, el sistema carga el Editor Visual abriendo la versión de borrador de la página seleccionada. Los bloques se despliegan en el lienzo central de forma editable, mientras que la cabecera y el pie de página permanecen visibles en modo de solo lectura para brindar una referencia gráfica fiel del diseño final.
   * **Requisitos de acceso:** El botón se habilita únicamente si el usuario cuenta con el permiso específico asignado para maquetar dicha página o si posee el rol de Administrador.

> **[Captura: Acceso a Edición de Página]**
> *Selección de la opción «Editar página» en el menú flotante para ingresar a la maquetación del contenido específico de la página activa.*
>
> **[Captura: Acceso a Edición de Página (Móvil)]**
> *Acceso a la edición de página individual adaptado a pantalla móvil. (Móvil).*

2. **Edición Global de Menú y Pie de Página (Opción «Menú y pie»):**
   * **Propósito y alcance:** Permite configurar y actualizar la estructura de navegación y la información de cabecera y pie que rodea a todas las páginas del portal. Al guardar y aprobar cambios en esta modalidad, las modificaciones se propagan de manera automática y simultánea a la totalidad de las páginas de la aplicación correspondiente (Sitio Web o Intranet).
   * **Elementos que comprende:**
     * *Barra superior del portal:* Enlaces directos a entidades externas, avisos de accesibilidad y enlaces a redes oficiales.
     * *Menú principal de navegación:* Estructura jerárquica de enlaces primarios, botones de acción y menús desplegables multinivel organizados por temáticas.
     * *Pie de página del portal:* Franjas de contacto, logotipos del SENA y del Estado, políticas de tratamiento de datos, enlaces de interés y derechos de autor.
   * **Comportamiento en pantalla:** Al seleccionar **«Menú y pie»**, el Editor Visual enfoca su lienzo de trabajo exclusivamente en los bloques correspondientes a la cabecera y al pie de página, permitiendo ordenar enlaces, agregar nuevos ítems de menú y actualizar datos de contacto.
   * **Requisitos de acceso:** Requiere contar expresamente con el permiso **«Menú y pie del sitio web»** o **«Menú y pie de la intranet»** (según el portal en el que se opere) dentro del grupo *Editar*, o contar con el rol de Administrador.

> **[Captura: Acceso a Edición de Menú y Pie]**
> *Selección de la opción «Menú y pie» en el menú flotante para la personalización de los elementos globales de navegación.*
>
> **[Captura: Acceso a Edición de Menú y Pie (Móvil)]**
> *Acceso a la edición global de menú y pie en dispositivo móvil. (Móvil).*

#### 3.4.3.3. Estructura y Funcionalidades del Editor Visual

El Editor Visual es un entorno interactivo que permite maquetar en vivo los contenidos mediante bloques modulares prediseñados, combinando sencillez de uso con flexibilidad gráfica.

##### 3.4.3.3.1. Estructura y Paneles del Editor

Al ingresar a la edición de una página o del menú y pie, la pantalla se organiza en cuatro zonas de trabajo principales:

> **[Captura: Interfaz General del Editor Visual]**
> *Vista panorámica del Editor Visual mostrando el panel izquierdo (bloques y capas), la barra superior de herramientas, el lienzo interactivo central y el inspector de propiedades derecho.*
>
> **[Captura: Interfaz General del Editor Visual (Móvil)]**
> *Vista general del Editor Visual adaptada a pantallas móviles. (Móvil).*

1. **Panel lateral izquierdo (Selector de modos: Catálogo de Bloques y Explorador de Capas):**
   Ubicado en el costado izquierdo de la pantalla, dispone de un selector superior con dos pestañas para alternar entre dos vistas de trabajo esenciales:
   * **Modo «Bloques» (Ícono de cuadrícula):** Despliega el catálogo de componentes prediseñados organizados por categorías temáticas (textos, llamadas a la acción, multimedia, indicadores, etc.), listos para arrastrar y soltar hacia el lienzo de trabajo.

> **[Captura: Panel Izquierdo - Catálogo de Bloques]**
> *Panel lateral izquierdo desplegando el catálogo de componentes disponibles clasificados por categorías temáticas.*
>
> **[Captura: Panel Izquierdo - Catálogo de Bloques (Móvil)]**
> *Catálogo de componentes en el panel lateral adaptado a dispositivo móvil. (Móvil).*

   * **Modo «Capas» (Ícono de lista jerárquica):** Despliega el árbol ordenado de todos los bloques presentes actualmente en la página; al hacer clic sobre una capa, el bloque correspondiente se resalta de inmediato en el lienzo y abre sus propiedades en el inspector derecho, permitiendo seleccionar cualquier elemento sin tener que desplazarse verticalmente por la página.

> **[Captura: Panel Izquierdo - Explorador de Capas]**
> *Panel lateral izquierdo mostrando el esquema jerárquico de bloques y capas ordenados según su posición en la página.*
>
> **[Captura: Panel Izquierdo - Explorador de Capas (Móvil)]**
> *Explorador jerárquico de capas en el panel lateral adaptado a dispositivo móvil. (Móvil).*

2. **Barra de herramientas superior (Cabecera editorial y controles de sesión):**
   Franja horizontal fija en la parte superior del editor que organiza la información de contexto y los controles operativos:
   * **Sector izquierdo (Identificación y estado de la página):**
     * *Plegado del panel lateral:* Botón con ícono para ocultar o desplegar el panel izquierdo de bloques y capas según se requiera mayor espacio de trabajo en el lienzo.
     * *Bandera de la página (Ruta y estado de versión):* Recuadro informativo que presenta la ruta de la página (por ejemplo: `/inicio`) y la etiqueta con el estado vigente de la versión (*Borrador*, *En revisión*, *Publicado* o *Rechazado*).
     * *Aviso de observaciones de rechazo:* Si la versión fue devuelta previamente por el Administrador, se ubica una alerta interactiva junto a la bandera que permite consultar las correcciones solicitadas sin salir del editor.
   * **Sector derecho (Herramientas, historial y acciones editoriales):**
     * *Historial de edición:* Botones con íconos de flecha curva para **Deshacer** y **Rehacer** modificaciones efectuadas durante la sesión activa en el navegador.
     * *Avisos de accesibilidad y concurrencia:* Mensajes de advertencia contextuales si faltan textos alternativos obligatorios en imágenes antes de remitir a revisión, o si otro funcionario tomó el control de la página.
     * *Indicador de autoguardado:* Notificación en tiempo real que señala el estado del respaldo automático en segundo plano (*«Guardando…»*, *«Sin guardar»* cuando existen cambios recientes o *«Guardado a las [hora]»*).
     * *Botonera de acciones editoriales:*
       * **Botón Salir** (Ícono de detener, con texto de ayuda *«Salir sin publicar»*): Cierra el editor y devuelve al usuario al portal. Si existen cambios pendientes de almacenar, despliega la ventana modal de confirmación (*«¿Salir del editor?»*) para evitar pérdidas involuntarias de trabajo.
       * **Botón Guardar borrador** (Ícono de disquete, con texto de ayuda *«Guardar borrador»*): Almacena manualmente el estado actual del borrador en el servidor sin publicarlo ni remitirlo a revisión.
       * **Botón Enviar a revisión** (Ícono de envío, con texto de ayuda *«Enviar a revisión»*): Disponible para los editores tanto en el Sitio Web como en la Intranet. Despliega la ventana modal para ingresar el comentario descriptivo de cambios obligatorio y traslada la versión a la cola de revisión del Administrador. El editor nunca publica directamente; toda versión requiere obligatoriamente la aprobación y publicación por parte del Administrador desde el Panel Administrativo.

> **[Captura: Barra de Herramientas Superior del Editor]**
> *Barra superior del editor mostrando la bandera de ruta y estado a la izquierda, y el historial, estado de autoguardado y botones de acción a la derecha.*
>
> **[Captura: Barra de Herramientas Superior del Editor (Móvil)]**
> *Barra superior de herramientas adaptada a interfaz móvil. (Móvil).*

3. **Lienzo central de trabajo (Área visual de edición):**
   Espacio principal donde se construye la página y se visualiza en tiempo real tal como la verá el usuario al publicarse. Cada bloque incorporado exhibe sus colores, tipografías y estructura definitiva de forma inmediata, permitiendo maquetar con total fidelidad visual sin requerir ventanas intermedias ni recargas.

> **[Captura: Lienzo Central de Trabajo]**
> *Área central del editor donde se visualiza y construye la página en tiempo real.*
>
> **[Captura: Lienzo Central de Trabajo (Móvil)]**
> *Lienzo central de trabajo adaptado a pantalla móvil. (Móvil).*

4. **Inspector de propiedades (Panel lateral derecho de configuración):**
   Formulario dinámico y contextual que se habilita al seleccionar cualquier bloque del lienzo o del árbol de capas. Presenta los campos para personalizar contenidos, títulos, textos, tipografías, alineación, colores de fondo, márgenes, enlaces de destino y selectores de medios (con carga de imágenes o documentos adjuntos). Si no hay ningún bloque seleccionado, muestra las propiedades generales de la página (título, descripción y metadatos).

> **[Captura: Panel Derecho - Inspector de Propiedades]**
> *Panel lateral derecho para configurar contenidos, medios, enlaces y estilos del bloque seleccionado.*
>
> **[Captura: Panel Derecho - Inspector de Propiedades (Móvil)]**
> *Inspector de propiedades adaptado a pantalla móvil. (Móvil).*

##### 3.4.3.3.2. Barra de Herramientas Contextual del Bloque (Controles de Acción en el Lienzo)

Al hacer clic o situar el cursor sobre cualquier bloque en el lienzo, el componente queda delimitado por un marco de selección y despliega en su parte superior una barra flotante de herramientas con controles de acción directa:

1. **Agarradera de arrastre (Ícono de seis puntos):**
   Permite mantener presionado el botón del ratón sobre el bloque para moverlo y reubicarlo verticalmente a lo largo de la página. Durante el movimiento, el editor traza una línea guía indicadora que señala la posición exacta donde se insertará el bloque al soltar el cursor.

> **[Captura: Agarradera de Arrastre de Bloque]**
> *Uso de la agarradera de arrastre de seis puntos para desplazar libremente un bloque en el lienzo.*
>
> **[Captura: Agarradera de Arrastre de Bloque (Móvil)]**
> *Control de arrastre para mover bloques en pantalla móvil. (Móvil).*

2. **Controles de desplazamiento vertical (Flechas Arriba y Abajo):**
   Permiten subir o bajar el bloque una posición con un solo clic. Esta opción facilita reorganizar el orden de los elementos con total precisión sin necesidad de arrastrar el componente.

> **[Captura: Botones de Desplazamiento Vertical de Bloque]**
> *Controles de flechas en la barra contextual para subir o bajar el bloque una posición.*
>
> **[Captura: Botones de Desplazamiento Vertical de Bloque (Móvil)]**
> *Botones de desplazamiento vertical en dispositivo móvil. (Móvil).*

3. **Botón Duplicar (Ícono de páginas superpuestas):**
   Genera una copia idéntica del bloque seleccionado, duplicando todos sus textos, imágenes, enlaces y opciones de estilo, e insertándolo inmediatamente debajo del original. Resulta de gran utilidad para crear secuencias repetitivas de contenido rápidamente.

> **[Captura: Botón Duplicar Bloque]**
> *Acción de duplicar para clonar un bloque seleccionado conservando todas sus configuraciones.*
>
> **[Captura: Botón Duplicar Bloque (Móvil)]**
> *Botón de duplicación de bloque en vista móvil. (Móvil).*

4. **Botón Eliminar (Ícono de papelera):**
   Retira de inmediato el bloque seleccionado del lienzo. El espacio liberado es reacomodado automáticamente por los componentes adyacentes. En caso de supresión accidental, la acción se puede revertir inmediatamente desde el botón **Deshacer** de la barra superior de herramientas.

> **[Captura: Botón Eliminar Bloque]**
> *Ícono de papelera en la barra flotante para retirar el componente del lienzo.*
>
> **[Captura: Botón Eliminar Bloque (Móvil)]**
> *Botón de eliminación de bloque en interfaz móvil. (Móvil).*

##### 3.4.3.3.3. Opciones de Edición y Configuración de Bloques (Menú Lateral)

Al hacer clic sobre cualquier bloque en el lienzo o al seleccionarlo desde la lista de capas, el menú lateral de configuración despliega el formulario de propiedades correspondiente al elemento activo. Las opciones varían según el tipo de bloque seleccionado, permitiendo personalizar aspectos como la información visual, la estructura, los contenidos y los recursos adjuntos:

1. **Visibilidad de elementos (Mostrar u ocultar títulos y secciones):**
   * **Conmutadores de visibilidad:** Casillas o botones de selección (*«Sí»* / *«No»*) para definir si el bloque debe exhibir u ocultar su título principal, subtítulos, fechas de actualización o franjas informativas.
   * **Adaptabilidad de presentación:** Permite mantener una estructura limpia y compacta cuando se requiere presentar solo el contenido esencial, o desplegar encabezados completos para guiar al lector en secciones más extensas.

2. **Personalización visual y colores de fondo:**
   * **Esquemas y tonalidades de fondo:** Selectores para escoger el estilo de fondo del bloque (como fondo claro, fondo neutro atenuado o tono institucional destacado), facilitando la separación visual ordenada entre las distintas secciones de la página.
   * **Alineación y espaciado:** Opciones para definir la orientación de los contenidos (alineación a la izquierda, centrada o justificada) y regular la separación superior e inferior mediante controles de «Espaciado y Ancho» configurados directamente en píxeles (`px`) y colores de fondo que cubren el ancho completo de la sección.

3. **Redacción de textos y edición enriquecida:**
   * **Campos de texto directo:** Casillas para escribir títulos, subtítulos, nombres de tarjetas y etiquetas breves.
   * **Editor de texto enriquecido:** En bloques descriptivos o de contenido informativo extenso, el menú integra una barra de herramientas de redacción que permite estructurar el texto con formato:
     * Aplicar **negrita**, *cursiva* y destacados.
     * Crear listas con viñetas o listas numeradas ordenadas paso a paso.
     * Insertar citas textuales o párrafos destacados.
     * Vincular palabras clave con enlaces hacia otras secciones del portal o portales externos.

4. **Carga y subida de archivos multimedia:**
   * **Subir imágenes desde el equipo:** Botón de carga directa para incorporar fotografías, gráficos, logotipos o infografías almacenados en el computador del usuario.
   * **Texto alternativo obligatorio:** Para cumplir las normas de accesibilidad y permitir que personas con discapacidad visual o lectores de pantalla comprendan la imagen, el sistema exige ingresar una descripción textual breve en la casilla *«Texto alternativo»*.
   * **Subir documentos adjuntos:** Selector para cargar y asociar archivos descargables en formato PDF o planillas oficiales a los bloques de recursos o boletines.
   * **Enlaces de videos externos («Video embebido»):** Casilla para registrar videos oficiales de YouTube mediante su identificador único (ID) o enlace validado por la plataforma. Permite asociar una imagen de portada o miniatura propia personalizada y utiliza reproducción diferida al presionar reproducir para optimizar la velocidad de carga de la página.

5. **Configuración de enlaces y botones de destino:**
   * **Texto del botón:** Campo para escribir la frase o llamado a la acción visible para el usuario (por ejemplo: *«Consultar catálogo»*, *«Descargar reporte»*).
   * **Dirección de destino:** Casilla para registrar la ruta interna del portal (como `/contacto`) o una dirección web externa protegida.
   * **Estilo y presentación del botón:** Selección del aspecto visual (botón de acción principal con fondo resaltado, botón secundario delineado o botón acompañado de un ícono representativo).

6. **Administración de colecciones y listas de elementos:**
   * En componentes estructurados con múltiples elementos repetitivos (como acordeones de preguntas frecuentes, carruseles de imágenes, tarjetas de publicaciones, enlaces o infografías), el panel lateral organiza los ítems dentro de **acordeones desplegables con bordes visuales y textos de ayuda**, incluyendo controles para:
     * **Añadir nuevos elementos:** Botón con ícono de suma (*«Añadir elemento»*) para agregar una nueva tarjeta o fila a la colección.
     * **Reordenar la lista:** Controles para desplazar los ítems hacia arriba o hacia abajo y modificar su orden de presentación en pantalla.
     * **Eliminar elementos individuales:** Botón de papelera para retirar un ítem específico de la colección sin alterar el resto del bloque.

> **[Captura: Opciones de Edición y Configuración de Bloque]**
> *Menú lateral desplegando los campos para editar textos, visibilidad de títulos, colores, carga de imágenes y enlaces.*
>
> **[Captura: Opciones de Edición y Configuración de Bloque (Móvil)]**
> *Opciones de configuración del bloque adaptadas a pantalla móvil. (Móvil).*

##### 3.4.3.3.4. Funcionalidades y Operación en el Editor

El editor proporciona un conjunto de herramientas y flujos automáticos diseñados para una maquetación fluida y segura:

1. **Inserción y fijación de bloques en el lienzo:**
   * En el panel lateral izquierdo, seleccionar la categoría deseada en el catálogo de bloques.
   * Mantener presionado el botón del ratón sobre el bloque elegido, arrastrarlo hacia el lienzo central y soltarlo en la posición vertical requerida.
   * Al soltar el clic, el componente queda fijado en el lienzo de trabajo y reorganiza automáticamente los bloques adyacentes.

> **[Captura: Inserción de Bloques al Lienzo]**
> *Acción de arrastrar un bloque desde el catálogo izquierdo y soltarlo en la posición deseada del lienzo interactivo.*
>
> **[Captura: Inserción de Bloques al Lienzo (Móvil)]**
> *Inserción de bloque en el lienzo interactivo en dispositivo móvil. (Móvil).*

2. **Configuración de propiedades y edición en vivo:**
   * Hacer clic sobre cualquier bloque en el lienzo o en el árbol de capas para seleccionarlo.
   * En el panel derecho (Inspector de propiedades), ingresar los textos requeridos o seleccionar archivos multimedia mediante el botón de carga.
   * Cada modificación digitada o seleccionada se actualiza en tiempo real en la vista previa del lienzo central sin demoras ni recargas.

> **[Captura: Edición de Propiedades en Vivo]**
> *Modificación de textos y enlaces en el inspector derecho con previsualización en vivo en el lienzo.*
>
> **[Captura: Edición de Propiedades en Vivo (Móvil)]**
> *Edición de propiedades del bloque en pantalla móvil. (Móvil).*

3. **Historial de cambios (Deshacer y Rehacer):**
   * **Botón Deshacer:** Revierte la última acción efectuada en el lienzo (inserción, desplazamiento, cambio de texto o borrado de un bloque).
   * **Botón Rehacer:** Vuelve a aplicar la acción que había sido deshecha previamente.
   *(Nota: El historial opera de manera local durante la sesión activa en el navegador. Al salir del editor o refrescar la página, el historial local se reinicia).*

> **[Captura: Controles de Historial Deshacer Rehacer]**
> *Botones de deshacer y rehacer ubicados en la barra superior de herramientas del editor.*
>
> **[Captura: Controles de Historial Deshacer Rehacer (Móvil)]**
> *Botones de deshacer y rehacer en barra superior móvil. (Móvil).*

4. **Autoguardado inteligente y guardado manual de borradores:**
   * **Autoguardado en segundo plano:** El editor detecta las modificaciones y efectúa guardados automáticos de borrador periódicamente, mostrando avisos dinámicos en la barra superior (*«Guardando…»*, *«Sin guardar»* o *«Guardado a las [hora]»*).
   * **Guardar borrador:** Botón con ícono de disquete que permite almacenar manualmente el estado vigente del borrador en el servidor en cualquier instante sin alterar la versión pública en producción.

> **[Captura: Guardado Manual de Borrador]**
> *Acción de clic sobre el botón «Guardar borrador» y confirmación de almacenamiento exitoso.*
>
> **[Captura: Guardado Manual de Borrador (Móvil)]**
> *Guardado de borrador en interfaz móvil. (Móvil).*

5. **Envío a revisión del contenido:**
   * **Validación automática de accesibilidad:** Al pulsar el botón **«Enviar a revisión»** (disponible tanto en el Sitio Web como en la Intranet), el sistema ejecuta una comprobación preventiva asegurando la presencia de textos alternativos obligatorios en imágenes y títulos en recursos incrustados.
   * **Comentario obligatorio de versión:** Si supera las comprobaciones, el sistema despliega una ventana modal donde es obligatorio redactar un **comentario de cambios** descriptivo (entre 10 y 100 caracteres) que resuma los ajustes efectuados para la bitácora de versiones.
   * **Transferencia de versión a la cola administrativa:** Al confirmar el envío, la versión adquiere el estado *En revisión* y se traslada a la bandeja de **«Páginas en revisión»** del Administrador, quien es la única persona que puede evaluarla, aprobarla y publicarla definitivamente en producción (ver procedimiento de aprobación en [Sección 3.4.2.5: Páginas en Revisión](#3425-aprobación-y-publicación-de-contenidos-páginas-en-revisión)).
   * **Aviso de observaciones de rechazo:** Si una versión anterior fue devuelta por el Administrador, el editor exhibe un panel superior de alerta detallando los motivos del rechazo para guiar las correcciones requeridas.

> **[Captura: Envío a Revisión y Comentario de Versión]**
> *Ventana modal para el ingreso obligatorio del comentario de cambios antes de remitir la página a revisión.*
>
> **[Captura: Envío a Revisión y Comentario de Versión (Móvil)]**
> *Ventana modal de envío a revisión adaptada a dispositivo móvil. (Móvil).*

#### 3.4.3.4. Creación de Nuevas Páginas (Paso a Paso)

El procedimiento para crear una nueva página dinámica en el portal se realiza de forma directa desde la navegación:

1. **Activación de la acción de creación:**
   Navegar a cualquier página del portal, hacer clic sobre el botón flotante de edición en la esquina inferior derecha y seleccionar la opción **«Nueva página»** (ícono de suma "+").

> **[Captura: Menú Flotante Opción Nueva Página]**
> *Selección de la opción «Nueva página» en el menú flotante de acciones editoriales.*
>
> **[Captura: Menú Flotante Opción Nueva Página (Móvil)]**
> *Opción «Nueva página» seleccionada en menú flotante móvil. (Móvil).*

2. **Diligenciamiento del título y generación automática de dirección:**
   Se despliega la ventana modal **«Nueva página»**:
   * **Nombre:** Digitar el título descriptivo en la casilla *«¿Cómo se llama?»* (por ejemplo: *Observatorio Ocupacional Regional*).
   * **Generación automática del enlace web permanente:** En tiempo real, el sistema genera la dirección web de acceso permanente a partir del título digitado (por ejemplo: `/observatorio-ocupacional-regional`), garantizando una nomenclatura normalizada y libre de caracteres especiales.

> **[Captura: Formulario de Nueva Página]**
> *Ventana modal con el campo de título y la dirección web permanente generada automáticamente en tiempo real.*
>
> **[Captura: Formulario de Nueva Página (Móvil)]**
> *Formulario de creación de nueva página adaptado a pantalla móvil. (Móvil).*

3. **Confirmación y asignación automática de permisos:**
   Hacer clic en el botón **«Crear y editar»**:
   * El sistema registra la nueva página en estado inicial de *Borrador*.
   * **Asignación inmediata de permisos:** El sistema concede automáticamente los permisos de edición sobre la nueva página al Administrador, al rol Editor base y a la cuenta del editor que efectuó la creación.
   * **Redirección al Editor Visual:** La aplicación redirige de forma automática al usuario al entorno de maquetación interactiva con un lienzo en limpio, listo para comenzar a arrastrar y configurar bloques.

> **[Captura: Redirección al Editor con Página Creada]**
> *Lienzo del Editor Visual listo para maquetar tras la confirmación de creación de la nueva página.*
>
> **[Captura: Redirección al Editor con Página Creada (Móvil)]**
> *Lienzo en limpio de nueva página en dispositivo móvil. (Móvil).*

#### 3.4.3.5. Eliminación de Páginas (Procedimiento Seguro)

La plataforma incorpora un mecanismo de seguridad para el retiro definitivo de páginas dinámicas que evita la generación de enlaces rotos y previene eliminaciones accidentales:

1. **Acceso desde el botón flotante:**
   Navegar hacia la página que se desea eliminar. Hacer clic en el botón flotante de edición y seleccionar la opción **«Eliminar página»** (ícono de papelera con estilo de advertencia).

> **[Captura: Menú Flotante Eliminar Página]**
> *Opción «Eliminar página» seleccionada en el menú flotante del editor visual.*
>
> **[Captura: Menú Flotante Eliminar Página (Móvil)]**
> *Opción «Eliminar página» seleccionada en el menú flotante del editor visual. (Móvil).*

2. **Análisis automático de enlaces activos y guía paso a paso para desvincular:**
   Antes de permitir la confirmación, el sistema realiza una comprobación automática e integral en todo el portal:
   * Si la página se encuentra enlazada en el menú principal o dentro de otras páginas, la eliminación se bloquea preventivamente y se presenta el mensaje de advertencia: **«Página en uso en la navegación»** (o **«Página en uso en el portal»** si el enlace proviene de otras páginas), explicando: *«Esta página está enlazada en el menú principal, desvincula el botón antes de eliminarla para evitar enlaces rotos.»* (o el aviso correspondiente si está enlazada desde otras secciones).
   * **Paso a paso estructurado:** La ventana modal presenta la secuencia exacta de acciones para retirar la vinculación:
     1. *Ve al botón de «Editar Menú y pie»* (o a la página específica identificada por su nombre).
     2. *Busca el componente que tiene el botón [Nombre del enlace] en el editor* (o los componentes correspondientes si son múltiples).
     3. *Borra el enlace asignado en la configuración del componente*.
   * Al pie de los pasos, la ventana indica: *«Cuando completes estos pasos, vuelve a abrir este diálogo para continuar.»*.

> **[Captura: Alerta Enlaces Rotos Bloqueo]**
> *Alerta del sistema bloqueando el borrado de la página debido a enlaces activos detectados en la plataforma con su guía paso a paso.*
>
> **[Captura: Alerta Enlaces Rotos Bloqueo (Móvil)]**
> *Alerta de bloqueo por enlaces activos adaptada a pantalla móvil. (Móvil).*

3. **Ventana modal de confirmación y comprobación de seguridad:**
   Si la página no tiene enlaces activos dependientes en el portal, el sistema habilita el diálogo de confirmación final:
   * **Alerta de página publicada:** Si la página se encuentra publicada en el portal en ese momento, el sistema resalta un mensaje de advertencia prioritario: *«La página está publicada actualmente, si la eliminas, dejará de estar visible para el público de inmediato.»*.
   * **Información de la página:** Presenta el título de la página y su ruta o dirección web (por ejemplo: `/observatorio-ocupacional-regional`).
   * **Digitación obligatoria de seguridad:** Para habilitar la confirmación, es obligatorio escribir de manera textual y exacta el nombre de la página en la casilla *«Escribe «[Nombre]» para confirmar»*.

> **[Captura: Modal Eliminar Página]**
> *Ventana de confirmación de seguridad para la eliminación de páginas con requisito de digitación exacta del título y advertencia de página publicada.*
>
> **[Captura: Modal Eliminar Página (Móvil)]**
> *Ventana de confirmación de seguridad para eliminación de página adaptada a pantalla móvil. (Móvil).*

4. **Confirmación definitiva y registro de auditoría:**
   Una vez digitado el nombre de forma exacta, hacer clic en el botón **«Eliminar»** (con estilo de confirmación destructiva):
   * La página y todas sus versiones de trabajo se retiran de manera definitiva de la base de datos.
   * El sistema redirige automáticamente al usuario a la página de inicio (`/inicio`).
   * El evento queda registrado de forma inmutable en la bitácora de auditoría con la identificación del usuario, la hora exacta y el nombre de la página eliminada.

> **[Captura: Confirmación de Eliminación de Página]**
> *Notificación de confirmación tras completar la eliminación segura de la página y redirección al inicio.*
>
> **[Captura: Confirmación de Eliminación de Página (Móvil)]**
> *Notificación de eliminación segura en dispositivo móvil. (Móvil).*

#### 3.4.3.6. Catálogo de Componentes del Sitio Web Público

Este apartado reúne la documentación, especificaciones técnicas, campos configurables y directrices de uso de los componentes visuales prediseñados exclusivos para el Sitio Web Público del Observatorio Laboral y Ocupacional (OLO).

*(Esta sección se encuentra reservada para la incorporación detallada de los componentes del Sitio Web Público).*

#### 3.4.3.7. Catálogo de Componentes de la Intranet

Este apartado reúne la documentación, especificaciones técnicas, campos configurables y directrices de uso de los componentes visuales prediseñados exclusivos para la Intranet del Observatorio Laboral y Ocupacional (OLO).

*(Esta sección se encuentra reservada para la incorporación detallada de los componentes de la Intranet).*

---

### 3.4.4. Consultas Ciudadanas, Búsquedas y Visualizadores de Información

Esta sección describe los procedimientos para la localización de contenidos en el portal público, la consulta de tableros analíticos en la Intranet, la visualización de documentos y la descarga directa de información oficial.

#### 3.4.4.1. Búsquedas y Filtros en el Portal Público

##### 3.4.4.1.1. Uso del Buscador Global Desplegable
El sistema cuenta con un motor de búsqueda global accesible directamente desde la cabecera superior del portal público. El proceso para realizar una consulta es el siguiente:

1. **Despliegue del buscador:** En la barra superior de navegación, el usuario debe hacer clic sobre el botón con ícono de lupa. Al interactuar con él, el campo de búsqueda se despliega de manera fluida hacia la izquierda con bordes redondeados y fondo blanco, corriendo armónicamente los enlaces del menú principal hacia el logotipo institucional para no tapar los textos de navegación.

> **[Captura: Paso 1]**
> *Despliegue interactivo del buscador en la cabecera desde el ícono de lupa.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Despliegue interactivo del buscador en la cabecera en dispositivo móvil. (Móvil).*

2. **Ingreso de términos:** Digitar las palabras clave relacionadas con la temática, contenido, boletín, indicador o documento que se desea localizar.

> **[Captura: Paso 2]**
> *Ingreso de términos clave en el campo blanco de búsqueda desplegado.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Ingreso de términos clave en el campo de búsqueda en pantalla móvil. (Móvil).*

3. **Exploración de resultados en vivo:** El sistema evalúa la consulta en tiempo real (por frase exacta, frase difusa o coincidencia de palabras significativas) y despliega automáticamente una lista flotante debajo del campo con los resultados coincidentes, resaltando los términos encontrados y el contexto de origen. El usuario puede desplazarse entre los resultados usando las flechas de dirección del teclado (*Arriba* / *Abajo*) y presionar la tecla *Enter*, o bien hacer clic con el ratón sobre cualquier ítem para navegar de inmediato a la sección o página correspondiente.

> **[Captura: Paso 3]**
> *Lista flotante de resultados en vivo desplegada debajo del buscador con términos resaltados y acceso directo.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Lista de resultados desplegada en dispositivo móvil con acceso directo a la página encontrada. (Móvil).*

*(Nota de uso: Para cerrar el buscador sin seleccionar un resultado, el usuario puede presionar la tecla **Escape**, hacer clic en cualquier punto exterior fuera de la lista o volver a pulsar sobre la lupa sin texto ingresado; el foco de navegación regresará de inmediato a la lupa de la cabecera).*

##### 3.4.4.1.2. Búsqueda con Filtros Avanzados y Consulta de Información
Para consultas específicas en catálogos y listados, el sistema ofrece herramientas de segmentación y filtrado dinámico:

1. **Apertura de filtros:** En la vista correspondiente, se debe ubicar el panel lateral (o menú desplegable en dispositivos móviles) de "Filtros Avanzados".

> **[Captura: Paso 1]**
> *Panel de filtros avanzados en la vista de consulta.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Panel de filtros avanzados en la vista de consulta. (Móvil).*

2. **Selección de criterios:** Se pueden marcar casillas o seleccionar opciones en menús desplegables para filtrar por categorías, áreas temáticas, niveles o palabras clave. El listado de resultados se actualizará dinámicamente según las opciones seleccionadas.

> **[Captura: Paso 2]**
> *Selección de criterios específicos en el panel de filtros.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Selección de criterios específicos en el panel de filtros. (Móvil).*

3. **Visualización de detalles y fichas informativas:** Al hacer clic sobre cualquiera de los registros listados, el sistema despliega su vista en detalle o ficha técnica con la información completa del elemento seleccionado.

> **[Captura: Paso 3]**
> *Vista en detalle o ficha informativa del registro seleccionado.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Vista en detalle o ficha informativa del registro seleccionado. (Móvil).*

4. **Descargas y visualización de documentos (Visor de PDF):** Si el usuario requiere consultar o conservar un respaldo formal de la información, puede utilizar los botones de **"Descargar Documento"** o **"Exportar PDF"** disponibles en la interfaz, o bien explorar el documento directamente mediante el visor de PDFs integrado.

> **[Captura: Paso 4]**
> *Botón de descarga o exportación dentro de la ficha de información.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Botón de descarga o exportación dentro de la ficha de información. (Móvil).*

---

#### 3.4.4.2. Visualizadores y Tableros Analíticos en Pantalla

##### 3.4.4.2.1. Uso de tableros BI en la Intranet (Power BI)
En las páginas o secciones de la Intranet que integren este componente maquetable, los directivos y funcionarios autorizados pueden consultar tableros analíticos interactivos de Power BI embebidos. Cabe destacar que este es un componente opcional en el catálogo de bloques del editor visual, por lo que su visualización depende de la maquetación definida por los editores para cada página. Cuando el componente está presente, los usuarios pueden utilizar sus controles internos (filtros por período, región o sector) para actualizar gráficos y tablas en tiempo real sin recargar la página.

> **[Captura: Tablero BI]**
> *Tablero de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis.*
>
> **[Captura: Tablero BI (Móvil)]**
> *Tablero de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis. (Móvil).*

##### 3.4.4.2.2. Visor de PDFs y Documentos Normativos
El componente de visor de documentos permite a los usuarios leer y revisar archivos PDF oficiales (boletines, resoluciones, manuales o informes) directamente dentro de la interfaz del portal, con controles integrados de navegación de páginas y opción de lectura inmersiva.

> **[Captura: Visor de PDF]**
> *Visor de documentos y publicaciones en PDF integrado en la página.*
>
> **[Captura: Visor de PDF (Móvil)]**
> *Visor de documentos y publicaciones en PDF integrado en la página. (Móvil).*

##### 3.4.4.2.3. Visor de Videos y Recursos Multimedia
A través del bloque de recursos visuales, los usuarios pueden reproducir contenidos audiovisuales, cápsulas informativas y videos del OLO directamente en la página, con controles de reproducción estándar y adaptabilidad a dispositivos móviles.

> **[Captura: Visor de Videos]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio.*
>
> **[Captura: Visor de Videos (Móvil)]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio. (Móvil).*

---

#### 3.4.4.3. Descarga Directa de Archivos y Boletines
En las distintas páginas del portal y de la Intranet, los documentos cuentan con botones estandarizados de **"Descargar Documento"** o enlaces de descarga directa. Los archivos se suministran en formatos estandarizados (como PDF o planillas), listos para su consulta y archivo fuera de línea.

---

#### 3.4.4.4. Panel de Preferencias de Accesibilidad e Inclusión Ciudadana

Para garantizar el cumplimiento de los lineamientos de accesibilidad web (WCAG 2.1 nivel AA y Resolución 1519 de 2020 de MinTIC) y facilitar una experiencia de navegación inclusiva para personas con baja visión, daltonismo, dislexia o dificultades motoras y cognitivas, el Sitio Web Público integra un **Panel de Accesibilidad («Personaliza tu experiencia»)** interactivo, adaptable y persistente.

##### 3.4.4.4.1. Apertura y Navegación del Panel
1. **Pestaña lateral fija:** En el margen lateral derecho de todas las páginas del portal público se ubica permanentemente una pestaña azul institucional con el ícono universal de accesibilidad.
2. **Despliegue del panel:** Al pulsar la pestaña con el ratón o activarla con el teclado, se abre el panel lateral manteniendo visible la página de fondo para que el usuario aprecie en tiempo real los cambios aplicados en pantalla. El foco de navegación ingresa automáticamente al panel para continuar la interacción mediante teclado o lectores de pantalla.
3. **Mecanismos de cierre:** El panel se cierra haciendo clic sobre el botón con ícono de equis (**X**) en la cabecera, presionando la tecla **Escape** o haciendo clic en cualquier área fuera del panel. Al cerrarse, el foco regresa a la pestaña lateral sin perder la posición de lectura.

##### 3.4.4.4.2. Controles Principales de Personalización (Cuadrícula Superior)
La zona superior del panel presenta ocho tarjetas interactivas organizadas en dos columnas:

1. **Lector de pantalla:**
   * **Función:** Activa la síntesis de voz integrada del navegador para leer en voz alta los textos del sitio web y anunciar los cambios de configuración.
   * **Comportamiento:** Si el navegador no dispone de soporte de voz, el botón se muestra atenuado informando: *«tu navegador no puede leer en voz alta»*. Al encenderlo, anuncia verbalmente *«Lector de pantalla activado»*.
2. **Tamaño del texto (Escala tipográfica - «AA»):**
   * **Función:** Incrementa progresivamente el tamaño de las fuentes tipográficas en todo el portal público sin deformar los bloques ni desbordar la pantalla.
   * **Niveles de ajuste:** Cuenta con un indicador visual de 4 barras. Al hacer clic sobre la tarjeta, el tamaño cicla ordenadamente entre:
     * *Normal:* 1 barra activa (tamaño base por defecto).
     * *Grande:* 2 barras activas.
     * *Más grande:* 3 barras activas.
     * *Máximo:* 4 barras activas (máxima escala legible).
3. **Alto contraste:**
   * **Función:** Invierte la paleta cromática a un fondo negro puro con textos y títulos en blanco de máxima luminosidad y enlaces o elementos destacados en amarillo, garantizando óptima visibilidad para personas con baja visión o fatiga ocular.
4. **Saturación:**
   * **Función:** Modifica la intensidad del color de todos los elementos visuales e imágenes de la página.
   * **Niveles de ajuste:** Indicador de 3 barras que cicla entre:
     * *Saturación normal:* 0 barras (color estándar).
     * *Saturación baja:* 1 barra activa (tonalidades suaves).
     * *Saturación alta:* 2 barras activas (colores intensificados y contrastados).
     * *Sin color:* 3 barras activas (modo monocromático / escala de grises completa).
5. **Pausar animación:**
   * **Función:** Detiene inmediatamente las animaciones CSS, transiciones continuas y desplazamientos automáticos de cintas de publicaciones y carruseles, previniendo mareos, distracciones o malestares vestibulares.
6. **Fuente dislexia:**
   * **Función:** Reemplaza la tipografía institucional del portal por la fuente especializada *OpenDyslexic*, diseñada con bases más gruesas y asimétricas en cada carácter para evitar la rotación involuntaria y la confusión de letras similares (como *b*, *d*, *p* y *q*).
7. **Interlineado:**
   * **Función:** Regula la distancia vertical entre las líneas de texto en párrafos y bloques informativos para evitar que las líneas se mezclen durante la lectura.
   * **Niveles de ajuste:** Indicador de 3 barras que alterna entre *Interlineado normal*, *Interlineado amplio*, *Interlineado más amplio* e *Interlineado máximo*.
8. **Interletrado:**
   * **Función:** Ajusta la separación horizontal entre caracteres individuales para mejorar la claridad de palabras en personas con dificultades de procesamiento visual.
   * **Niveles de ajuste:** Indicador de 3 barras que cicla entre *Interletrado normal*, *Interletrado amplio*, *Interletrado más amplio* e *Interletrado máximo*.

##### 3.4.4.4.3. Filtros Especializados de Daltonismo
Debajo de la cuadrícula principal se encuentra la sección de **Daltonismo**:
1. **Interruptor general:** Al activar el interruptor deslizante con ícono de ojo, se despliega una cuadrícula interactiva con tres filtros de compensación cromática:
   * **Protanopía:** Filtro adaptado para personas con deficiencia o ceguera en la percepción de tonos rojos.
   * **Deuteranopía:** Filtro adaptado para dificultades en la percepción de tonos verdes (la variante más común).
   * **Tritanopía:** Filtro adaptado para dificultades en la percepción de tonos azules y amarillos.
2. **Selección y repliegue:** Al seleccionar cualquiera de las tres opciones (mediante botón radial), el filtro SVG se aplica al instante en todo el portal. Al apagar el interruptor general, la corrección se desactiva y el menú se repliega de forma compacta.

##### 3.4.4.4.4. Opciones Avanzadas (Interruptores Deslizantes)
En la parte inferior del panel se ubica la sección **«Opciones avanzadas»**, compuesta por cinco interruptores independientes para refinar la lectura:
1. **Resaltar títulos:** Aplica un contorno visual resaltado a todos los encabezados y títulos de la página, facilitando la identificación de la estructura del contenido.
2. **Resaltar enlaces:** Destaca con color de fondo y subrayado continuo todos los hipervínculos navegables, asegurando que ningún botón o enlace pase desapercibido.
3. **Texto en negrita:** Convierte todas las fuentes tipográficas del portal a peso en negrita (*bold*), otorgando mayor solidez y grosor a los trazos de lectura.
4. **Guía de lectura:** Activa una franja o regla horizontal flotante que acompaña el desplazamiento vertical del puntero del ratón, sirviendo de guía visual para leer renglón por renglón sin saltar de línea.
5. **Cursor grande:** Sustituye el cursor habitual por un puntero ampliado de gran tamaño y contorno contrastado para ubicarlo con facilidad en pantallas amplias o de alta resolución.

##### 3.4.4.4.5. Restablecimiento y Persistencia
* **Botón «Restablecer configuración»:** Ubicado de manera fija en el pie del panel, permite revertir al instante todas las preferencias activas a su valor predeterminado original con un solo clic.
* **Persistencia automática sin cookies invasivas:** Todas las preferencias configuradas por el usuario se guardan de manera segura en la memoria de su propio navegador, de modo que al navegar entre diferentes páginas del observatorio o volver en visitas posteriores, sus ajustes de accesibilidad se mantienen aplicados sin necesidad de iniciar sesión ni reconfigurarlos.

> **[Captura: Panel de Accesibilidad]**
> *Panel de preferencias de accesibilidad desplegado en el portal público mostrando las 8 tarjetas principales, el selector de daltonismo, las opciones avanzadas y el botón de restablecimiento.*
>
> **[Captura: Panel de Accesibilidad (Móvil)]**
> *Panel de preferencias de accesibilidad adaptado a pantalla móvil con cabecera y pie fijos y cuerpo desplazable. (Móvil).*

---

### 3.4.5. Instalación como Aplicación Web Progresiva (PWA)

Esta sección describe los procedimientos para instalar la plataforma del OLO como aplicación web progresiva (PWA) en equipos de escritorio y dispositivos móviles, facilitando el acceso directo desde el sistema operativo como una aplicación independiente.

#### 3.4.5.1. Instalación en Computador de Escritorio (Chrome / Edge)

1. El usuario debe abrir el portal del OLO en un navegador web compatible.
2. En la barra de direcciones superior, se debe hacer clic en el **ícono de instalación** (pantalla con flecha hacia abajo) o acceder al menú de tres puntos del navegador y seleccionar la opción **"Instalar [nombre de la aplicación]..."**.

> **[Captura: Instalar PWA Desktop]**
> *Ícono de instalación de PWA visible en la barra de direcciones del navegador de escritorio.*

3. En el cuadro de diálogo emergente, se debe hacer clic en **"Instalar"** para autorizar el procedimiento.
4. La aplicación se abrirá en una ventana independiente y el sistema operativo creará un acceso directo en el escritorio y en el menú de aplicaciones.

#### 3.4.5.2. Instalación en Dispositivo Móvil (Android — Chrome)

1. El usuario debe acceder al portal del OLO desde el navegador Google Chrome en su dispositivo móvil.
2. El navegador desplegará una notificación inferior con el texto **"Añadir a pantalla de inicio"**, en la cual se debe pulsar para continuar.
3. De forma alternativa, el usuario puede abrir el menú principal del navegador (ícono de tres puntos) y seleccionar la opción **"Añadir a pantalla de inicio"**.
4. Finalmente, se debe confirmar el nombre de la aplicación y pulsar en **"Añadir"**.

#### 3.4.5.3. Instalación en Dispositivo Móvil (iOS — Safari)

1. El usuario debe ingresar al portal del OLO desde el navegador Safari en su dispositivo iOS.
2. Se debe presionar el botón de **compartir** (ícono de recuadro con flecha vertical) ubicado en la barra de navegación inferior.
3. En el menú desplegado, se debe seleccionar la opción **"Agregar a pantalla de inicio"**.
4. Se debe confirmar el nombre asignado a la aplicación y pulsar en **"Agregar"** en el formulario modal.

> **[Captura: PWA iOS]**
> *Secuencia de pasos para agregar la PWA a la pantalla de inicio en un dispositivo iOS con Safari.*

---

## 3.5. Soporte

Esta sección contiene la guía de solución de problemas, el catálogo detallado de validaciones en pantalla, las directrices de seguridad ante fallos operativos y las respuestas a preguntas frecuentes sobre el funcionamiento del sistema.

---

### 3.5.1. Catálogo de Validaciones y Solución de Problemas

A continuación se detalla el comportamiento exhaustivo de las validaciones de formulario, alertas de restricción, prevención de enlaces rotos y códigos de error que emite la plataforma durante la autenticación, administración y gestión editorial, junto con sus causas y acciones correctivas.

#### 3.5.1.1. Validaciones en el Primer Ingreso

Durante el primer ingreso (cuyo procedimiento operativo regular se detalla en la [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)), el sistema aplica rigurosas validaciones de formato, comprobaciones de seguridad de contraseñas y restricciones de acceso por rol. Esta sección detalla de forma paralela cada punto del paso a paso, ilustrando los errores comunes de ingreso, los mensajes de advertencia y las alertas establecidas en la plataforma para ambos entornos:

* **[Validaciones en el Primer Ingreso (Sitio Web Público)](#validaciones-en-el-primer-ingreso-sitio-web-público):** Alertas de campos, validaciones del validador de políticas y comprobación de permisos al iniciar sesión en el portal público.
* **[Validaciones en el Primer Ingreso (Intranet del OLO)](#validaciones-en-el-primer-ingreso-intranet-del-olo):** Redirecciones forzosas, validaciones en pantalla de bloqueo, asistencia paso a paso y alertas de autorización en la Intranet.

##### Validaciones en el Primer Ingreso (Sitio Web Público)

1. **Ubicación del acceso en el Sitio Web (Confusión de punto de entrada):**
   * *Acción errónea:* El usuario intenta ingresar a configurar su cuenta haciendo clic sobre el botón interactivo **"Intranet"** en la barra superior en lugar de pulsar el texto de **fecha y hora** en la barra superior de GOV.CO.
   * *Respuesta del sistema y validación:* El sistema lo traslada a la pantalla de bloqueo y acceso de la Intranet (`/login`), la cual cuenta con un formulario independiente para el personal interno.
   * *Acción de corrección:* El usuario debe regresar a la portada del Sitio Web Público y hacer clic sobre el reloj de fecha y hora ubicado en el extremo derecho del banner GOV.CO.

> **[Captura: Error de Acceso por Botón Intranet en Sitio Web]**
> *Desviación involuntaria hacia la pantalla de acceso de la Intranet al pulsar el botón erróneo en el Sitio Web Público.*
>
> **[Captura: Error de Acceso por Botón Intranet en Sitio Web (Móvil)]**
> *Desviación involuntaria hacia la pantalla de acceso de la Intranet al pulsar el botón erróneo en el Sitio Web Público. (Móvil).*

2. **Ingreso con credenciales temporales (Validaciones de formulario):**
   * *Acciones erróneas y mensajes de validación:*
     * **Correo obligatorio:** Si se pulsa el botón "Ingresar" con la casilla de correo vacía, el sistema interrumpe el envío y resalta bajo el campo: `"El correo es requerido"`.
     * **Formato de correo inválido:** Si se digita un texto sin sintaxis de correo electrónico válida, el formulario señala: `"El correo no tiene un formato válido"`.
     * **Dominio ajeno o no corporativo:** Si se intenta ingresar con un correo personal o externo (`@gmail.com`, `@hotmail.com`, etc.), el validador emite la alerta en tiempo real: `"Debe ser un correo institucional @sena.edu.co"`.
     * **Contraseña vacía:** Si no se ingresa la clave temporal en la casilla correspondiente, el sistema exige: `"La contraseña es requerida"`.
     * **Contraseña temporal vencida (límite de 72 horas):** Si el funcionario intenta autenticarse habiendo superado las 72 horas de emisión de su clave provisional, el sistema comprueba la credencial y rechaza el acceso con la alerta en el recuadro superior: `"Tu contraseña temporal venció (dura 72 horas). Pide al administrador que te genere una nueva."`.
     * **Credenciales incorrectas:** Si el correo o la clave provisoria contienen erratas o no corresponden a un registro activo, el sistema despliega la alerta general en el recuadro superior: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* El funcionario debe verificar la escritura de su correo `@sena.edu.co` y transcribir con exactitud la contraseña provisoria comunicada por el Administrador. Si la credencial superó las 72 horas de vigencia, debe solicitar al Administrador el restablecimiento de su clave desde el módulo de Usuarios.

> **[Captura: Validaciones en Formulario de Acceso Sitio Web]**
> *Mensajes de validación de campos requeridos, dominio corporativo y alerta general de credenciales erróneas en el Sitio Web.*
>
> **[Captura: Validaciones en Formulario de Acceso Sitio Web (Móvil)]**
> *Mensajes de validación de campos requeridos, dominio corporativo y alerta general de credenciales erróneas en el Sitio Web. (Móvil).*

3. **Pantalla de bienvenida y verificación del estado de cuenta:**
   * *Situaciones anómalas y respuestas del sistema:*
     * **Sesión provisional expirada o no iniciada:** Si el usuario intenta acceder directamente a cualquiera de las rutas de configuración inicial (`/login/first-login`, `/login/first-login/change-password` o `/login/first-login/security-questions`) sin una sesión activa o si la sesión caducó por inactividad, la plataforma detiene la carga con la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`, facilitando el enlace directo para regresar a la pantalla de acceso.
     * **Cuenta sin configuraciones pendientes:** Si la cuenta ya había completado el proceso con anterioridad (por ejemplo, desde otra pestaña del navegador), el sistema no solicita credenciales temporales inexistentes; en su lugar, presenta el aviso: `"¡Configuración completada con éxito! Tu cuenta ya es segura."`, con el recordatorio de guardar las respuestas de seguridad en un lugar seguro, junto con el botón `"Iniciar sesión"`, que cierra la sesión y lleva a la pantalla de inicio de sesión.
   * *Acción de corrección:* Iniciar sesión nuevamente en el portal para que el aplicativo evalúe los pendientes activos de la cuenta.

> **[Captura: Alerta de Estado de Cuenta en Primer Ingreso Sitio Web]**
> *Aviso del sistema ante sesiones caducadas o mensaje informativo cuando la cuenta ya completó la configuración inicial.*
>
> **[Captura: Alerta de Estado de Cuenta en Primer Ingreso Sitio Web (Móvil)]**
> *Aviso del sistema ante sesiones caducadas o mensaje informativo cuando la cuenta ya completó la configuración inicial. (Móvil).*

4. **Establecimiento de la contraseña definitiva (Reglas de robustez y coincidencia):**
   * *Acciones erróneas y validaciones:*
     * **Omisión de contraseña temporal:** Si no se ingresa la clave provisoria en la primera casilla, se indica: `"La contraseña temporal es requerida"`.
     * **Contraseña temporal errónea al enviar:** Si la clave temporal ingresada no concuerda con la base de datos, el servidor rechaza la solicitud al presionar "Continuar" con la alerta: `"No se pudo completar la configuración"`.
     * **Incumplimiento de requisitos de seguridad:** Al digitar la nueva contraseña, si no se cumplen las condiciones mínimas exigidas por la entidad, los indicadores interactivos permanecen desmarcados o con aviso de requisito pendiente y el sistema resalta el primer fallo pendiente bajo el campo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`), bloqueando el avance.
     * **Contraseña repetida o no permitida por seguridad:** Si la nueva contraseña coincide con la clave temporal, con una contraseña anterior o no cumple la política de seguridad, se despliega directamente bajo la casilla el aviso: `«Esta contraseña no es válida por seguridad, elige otra.»`.
     * **Falta de confirmación o discrepancia:** Si la confirmación se encuentra vacía, se solicita `"Confirma tu contraseña"`. Si el texto digitado no es exactamente idéntico al de la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* El funcionario debe construir una contraseña que cumpla con todos los requisitos validados por el verificador interactivo y comprobar la coincidencia exacta en el campo de confirmación.

> **[Captura: Errores de Validación de Contraseña Sitio Web]**
> *Validador de requisitos de seguridad con condiciones incompletas y alerta por falta de coincidencia en la confirmación.*
>
> **[Captura: Errores de Validación de Contraseña Sitio Web (Móvil)]**
> *Validador de requisitos de seguridad con condiciones incompletas y alerta por falta de coincidencia en la confirmación. (Móvil).*

5. **Configuración de preguntas de seguridad (Reglas de catálogo y respuestas):**
   * *Acciones erróneas y validaciones:*
     * **Omisión de pregunta:** Si el usuario no despliega el catálogo ni selecciona una pregunta, el sistema bloquea el paso indicando: `"Selecciona una pregunta"`.
     * **Respuesta vacía o con espacios:** Si no se escribe texto en el campo de respuesta o se ingresan únicamente espacios en blanco, se resalta: `"La respuesta es requerida"`.
     * **Preguntas repetidas:** El selector interactivo bloquea y desactiva automáticamente las preguntas seleccionadas en pasos anteriores para impedir la duplicación de ítems en la cuenta.
   * *Acción de corrección:* Seleccionar una pregunta diferente en cada uno de los tres pasos y registrar una respuesta confidencial válida.

> **[Captura: Validaciones en Preguntas de Seguridad Sitio Web]**
> *Alertas por omisión de selección de pregunta del catálogo y validación de respuesta obligatoria en el Sitio Web.*
>
> **[Captura: Validaciones en Preguntas de Seguridad Sitio Web (Móvil)]**
> *Alertas por omisión de selección de pregunta del catálogo y validación de respuesta obligatoria en el Sitio Web. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:**
   * *Acciones erróneas y alertas según rol:*
     * **Uso indebido de la contraseña temporal anterior:** Tras finalizar la configuración e intentar iniciar sesión en `/login`, si el usuario digita la clave temporal previa en lugar de la nueva contraseña recién creada, el sistema rechaza el ingreso con `"Correo o contraseña incorrectos"`, ya que la clave provisional fue reemplazada de forma definitiva.
     * **Roles sin permisos para el Sitio Web (Directores / Subdirectores):** Si un funcionario con rol directivo se autentica correctamente en este portal, el sistema comprueba que no cuenta con facultades de edición ni de acceso al panel administrativo y detiene el acceso mostrando la alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolo a ingresar por la Intranet.
   * *Acción de corrección:* Iniciar sesión estrictamente con la contraseña definitiva personal; si se trata de un funcionario con rol directivo, acceder a través de la Intranet del OLO.

> **[Captura: Alerta de Permisos y Acceso Denegado Sitio Web]**
> *Alerta desplegada al intentar acceder al Sitio Web con una cuenta configurada sin facultades de edición ni de administración.*
>
> **[Captura: Alerta de Permisos y Acceso Denegado Sitio Web (Móvil)]**
> *Alerta desplegada al intentar acceder al Sitio Web con una cuenta configurada sin facultades de edición ni de administración. (Móvil).*

##### Validaciones en el Primer Ingreso (Intranet del OLO)

1. **Acceso a la Intranet (Intento de acceso directo no autenticado):**
   * *Acción errónea:* Intentar acceder a secciones o tableros internos de la Intranet (ej. `/inicio`, `/tasas-vinculacion`) mediante enlaces guardados sin haber iniciado sesión previamente.
   * *Respuesta del sistema y validación:* El mecanismo de seguridad intercepta la navegación no autenticada y redirige automáticamente al usuario hacia el formulario de acceso (`/login`), bloqueando la visualización del entorno privado.
   * *Acción de corrección:* El funcionario debe ingresar a través de la pantalla oficial de acceso de la Intranet para iniciar su flujo de autenticación.

> **[Captura: Intercepción de Acceso No Autenticado Intranet]**
> *Pantalla de bloqueo y acceso obligatorio de la Intranet al interceptar un intento de navegación no autenticada.*
>
> **[Captura: Intercepción de Acceso No Autenticado Intranet (Móvil)]**
> *Pantalla de bloqueo y acceso obligatorio de la Intranet al interceptar un intento de navegación no autenticada. (Móvil).*

2. **Ingreso con credenciales temporales (Validaciones de formulario):**
   * *Acciones erróneas y validaciones:*
     * **Campos vacíos:** Si se pulsa el botón principal sin diligenciar los datos, el sistema resalta: `"El correo es requerido"` y `"La contraseña es requerida"`.
     * **Formato o dominio incorrecto:** Si el correo no tiene formato válido o pertenece a un dominio ajeno a la entidad, el sistema muestra: `"El correo no tiene un formato válido"` o `"Debe ser un correo institucional @sena.edu.co"`.
     * **Contraseña temporal caducada (límite de 72 horas):** Si transcurrieron más de 72 horas continuas desde la emisión de la credencial provisional, el sistema bloquea el ingreso mostrando la alerta: `"Tu contraseña temporal venció (dura 72 horas). Pide al administrador que te genere una nueva."`.
     * **Credenciales incorrectas:** Si se ingresan datos errados o inexistentes, el sistema emite el aviso: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* Digitar el correo corporativo `@sena.edu.co` y escribir con precisión la clave temporal asignada por el Administrador. Si esta ha caducado por superar el plazo de 72 horas, solicitar un restablecimiento de clave al Administrador.

> **[Captura: Validaciones en Formulario de Acceso Intranet]**
> *Alertas de campos obligatorios, validación de dominio corporativo y mensaje de credenciales no coincidentes en la Intranet.*
>
> **[Captura: Validaciones en Formulario de Acceso Intranet (Móvil)]**
> *Alertas de campos obligatorios, validación de dominio corporativo y mensaje de credenciales no coincidentes en la Intranet. (Móvil).*

3. **Bienvenida y pasos guiados de configuración (Control de sesión):**
   * *Situaciones anómalas y validaciones:*
     * **Caducidad de la sesión provisional:** Si el funcionario suspende el proceso y se supera el período de inactividad, el sistema interrumpe la configuración y muestra la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`.
     * **Detección de avances parciales:** Si la cuenta ya había modificado su clave pero tenía pendientes las preguntas de seguridad (o viceversa tras un restablecimiento administrativo puntual), el sistema sitúa al usuario de manera precisa en la pantalla correspondiente (`/login/first-login/security-questions` o `/login/first-login/change-password`) para evitar reprocesos innecesarios.
   * *Acción de corrección:* Reiniciar la sesión si esta caducó y continuar el diligenciamiento de los pasos indicados en la barra guiada.

> **[Captura: Control de Sesión y Pasos Guiados Intranet]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración.*
>
> **[Captura: Control de Sesión y Pasos Guiados Intranet (Móvil)]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración. (Móvil).*

4. **Establecimiento de la contraseña definitiva (Reglas de robustez y coincidencia):**
   * *Acciones erróneas y validaciones:*
     * **Clave temporal vacía o sin ingresar:** Si se omite la clave provisoria en el primer campo, el sistema exige: `"La contraseña temporal es requerida"`.
     * **Clave temporal no válida:** Si la clave temporal ingresada no coincide con la registrada en el sistema, al pulsar "Continuar" el servidor notifica: `"No se pudo completar la configuración"`.
     * **Contraseña débil:** Si la nueva clave no satisface la totalidad de las 5 condiciones exigidas, el panel de requisitos muestra las condiciones no cumplidas y bloquea el avance con el mensaje del primer fallo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`).
     * **Contraseña repetida o no permitida por seguridad:** Si la nueva contraseña coincide con la clave temporal, con una contraseña anterior o no cumple la política de seguridad, se despliega directamente bajo la casilla el aviso: `«Esta contraseña no es válida por seguridad, elige otra.»`.
     * **Contraseñas no coincidentes:** Si el campo de repetición difiere de la nueva clave registrada, se bloquea el guardado indicando: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Establecer una clave que cumpla con todos los requisitos del módulo interactivo y asegurar que el campo de repetición coincida con exactitud.

> **[Captura: Errores de Validación de Contraseña Intranet]**
> *Módulo de requisitos de contraseña con directivas pendientes y alerta por falta de coincidencia en la confirmación.*
>
> **[Captura: Errores de Validación de Contraseña Intranet (Móvil)]**
> *Módulo de requisitos de contraseña con directivas pendientes y alerta por falta de coincidencia en la confirmación. (Móvil).*

5. **Configuración de preguntas de seguridad (Reglas de catálogo y respuestas):**
   * *Acciones erróneas y validaciones:*
     * **Pregunta sin seleccionar:** Si se presiona el botón para avanzar sin haber elegido una opción del menú desplegable, el sistema indica: `"Selecciona una pregunta"`.
     * **Respuesta vacía o sin diligenciar:** Si la casilla de respuesta se encuentra vacía o solo contiene espacios, se señala: `"La respuesta es requerida"`.
     * **Bloqueo de preguntas seleccionadas:** El selector interactivo bloquea las preguntas ya utilizadas en los pasos anteriores para garantizar que se configuren tres opciones distintas.
   * *Acción de corrección:* Elegir una pregunta no seleccionada previamente y redactar una respuesta válida en cada uno de los tres pasos del asistente.

> **[Captura: Validaciones en Preguntas de Seguridad Intranet]**
> *Alertas de selección obligatoria de pregunta y campo de respuesta requerido en la Intranet.*
>
> **[Captura: Validaciones en Preguntas de Seguridad Intranet (Móvil)]**
> *Alertas de selección obligatoria de pregunta y campo de respuesta requerido en la Intranet. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:**
   * *Acciones erróneas y alertas de permisos:*
     * **Autenticación con contraseña temporal:** Si tras finalizar la configuración el usuario digita en el formulario de la Intranet la clave temporal anterior en lugar de la nueva contraseña personal, el sistema deniega el acceso con la alerta: `"Correo o contraseña incorrectos"`.
     * **Cuentas sin autorización para la Intranet:** Si el funcionario posee una cuenta activa pero no cuenta con el permiso de acceso a la Intranet, el sistema invalida la sesión y despliega la alerta preventiva: *"No tienes permisos para ingresar a la intranet."*.
   * *Acción de corrección:* Iniciar sesión ingresando la nueva contraseña definitiva; si la cuenta no tiene habilitado el acceso a la Intranet, solicitar la asignación del permiso al Administrador del sistema.

> **[Captura: Alerta de Acceso Denegado Intranet]**
> *Alerta de falta de permisos para ingresar a la Intranet desplegada tras validar las credenciales de la cuenta.*
>
> **[Captura: Alerta de Acceso Denegado Intranet (Móvil)]**
> *Alerta de falta de permisos para ingresar a la Intranet desplegada tras validar las credenciales de la cuenta. (Móvil).*

#### 3.5.1.2. Validaciones en el Inicio de Sesión Habitual

Durante el inicio de sesión habitual (descrito operativamente en la [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)), el sistema ejecuta comprobaciones inmediatas de identidad, sintaxis de correo corporativo, vigencia de credenciales y autorización por rol. Esta sección detalla de forma paralela las situaciones erróneas, los bloqueos de interfaz y las alertas emitidas por la plataforma en ambos entornos de acceso:

* **[Validaciones en el Inicio de Sesión Habitual (Sitio Web Público)](#validaciones-en-el-inicio-de-sesión-habitual-sitio-web-público):** Errores comunes al autenticarse mediante el banner GOV.CO, validaciones de campos y alertas de denegación de acceso al panel administrativo o portal público.
* **[Validaciones en el Inicio de Sesión Habitual (Intranet del OLO)](#validaciones-en-el-inicio-de-sesión-habitual-intranet-del-olo):** Intercepciones por navegación no autenticada, validaciones del formulario de acceso interno y alertas por falta de autorización para ingresar a la Intranet.

##### Validaciones en el Inicio de Sesión Habitual (Sitio Web Público)

1. **Ubicación del acceso en el Sitio Web (Banner GOV.CO):**
   * *Acción errónea:* El funcionario intenta autenticarse para editar el portal público pulsando el botón **"Intranet"** en la barra de navegación superior en lugar del enlace interactivo de fecha y hora.
   * *Respuesta del sistema y validación:* La plataforma lo traslada a la URL y pantalla de acceso de la Intranet (`/login`), desviándolo del formulario del Sitio Web y Panel Administrativo.
   * *Acción de corrección:* El usuario debe situarse en el Sitio Web Público y pulsar sobre el texto interactivo de **fecha y hora** en el extremo derecho del banner de GOV.CO.

> **[Captura: Error de Enlace de Acceso en Banner GOV.CO]**
> *Redirección errónea hacia la pantalla de acceso de la Intranet por presionar el botón incorrecto en la cabecera.*
>
> **[Captura: Error de Enlace de Acceso en Banner GOV.CO (Móvil)]**
> *Redirección errónea hacia la pantalla de acceso de la Intranet por presionar el botón incorrecto en la cabecera. (Móvil).*

2. **Presentación de la interfaz de autenticación (Acceso directo a rutas protegidas):**
   * *Situación anómala y control:* Si el usuario intenta acceder directamente a una ruta interna administrativa (`/admin`) sin una sesión activa previa, el sistema intercepta la navegación y lo conduce a este formulario de inicio de sesión.
   * *Acción de corrección:* Proceder al diligenciamiento regular de las credenciales corporativas autorizadas para ingresar al entorno administrativo.

3. **Ingreso con credenciales definitivas (Validaciones de campos de entrada):**
   * *Acciones erróneas y validaciones:*
     * **Campos obligatorios:** Si se presiona el botón "Ingresar" dejando la casilla de correo o contraseña vacía, el sistema resalta bajo cada campo: `"El correo es requerido"` o `"La contraseña es requerida"`.
     * **Validación de formato:** Si se escribe una dirección sin `@` o incompleta (ej. `nombre.apellido`), se despliega: `"El correo no tiene un formato válido"`.
     * **Dominio corporativo SENA:** Si se digita un correo de dominios comerciales (`@gmail.com`, `@outlook.com`, etc.), el validador bloquea en tiempo real con el mensaje: `"Debe ser un correo institucional @sena.edu.co"`.
     * **Contraseña con espacios erróneos:** Si se copian y pegan caracteres con espacios al inicio o final de forma involuntaria, el validador evalúa la cadena exacta y emite error de coincidencia.
   * *Acción de corrección:* Digitar estrictamente el correo corporativo `@sena.edu.co` y transcribir con exactitud la contraseña definitiva sin espacios adicionales.

> **[Captura: Validaciones de Campos en Formulario Sitio Web]**
> *Mensajes de advertencia por campos requeridos, formato inválido y rechazo de dominios externos al SENA en el Sitio Web.*
>
> **[Captura: Validaciones de Campos en Formulario Sitio Web (Móvil)]**
> *Mensajes de advertencia por campos requeridos, formato inválido y rechazo de dominios externos al SENA en el Sitio Web. (Móvil).*

4. **Ejecución y validación de la sesión (Validación de credenciales en el acceso):**
   * *Acción errónea y alerta del sistema:* Al hacer clic en el botón "Ingresar", si la contraseña o el correo no coinciden con los registros activos de la plataforma, se despliega la alerta en la parte superior del formulario: `"Correo o contraseña incorrectos"`.
   * *Redirección por primer ingreso pendiente:* Si las credenciales coinciden pero la cuenta aún no ha culminado su configuración inicial, la plataforma detecta este estado y redirige al usuario de manera automática hacia la pantalla de primer ingreso para que establezca su contraseña definitiva y sus preguntas de seguridad.
   * *Acción de corrección:* Comprobar que no esté activada la tecla Bloq Mayús, verificar los caracteres mediante el control de visualización (ícono de ojo) o hacer uso del enlace de recuperación *(¿Olvidaste tu contraseña?)*.

> **[Captura: Alerta de Credenciales Incorrectas en Sitio Web]**
> *Mensaje superior de credenciales incorrectas en el formulario de acceso del Sitio Web Público.*
>
> **[Captura: Alerta de Credenciales Incorrectas en Sitio Web (Móvil)]**
> *Mensaje superior de credenciales incorrectas en el formulario de acceso del Sitio Web Público. (Móvil).*

5. **Verificación de permisos y autorización del portal:**
   * *Acciones erróneas y alertas de permisos:*
     * **Directores y Subdirectores intentando entrar por el Sitio Web Público:** Los directivos no cuentan con facultades de edición ni de acceso al Panel Administrativo en este portal. Al autenticarse correctamente, el sistema detiene el paso y emite la alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, instruyendo al funcionario a dirigirse a la Intranet.
     * **Cuentas inactivas o suspendidas:** Si la cuenta fue desactivada preventivamente por el Administrador, el sistema interrumpe la entrada mostrando el aviso de suspensión correspondiente.
   * *Acción de corrección:* Si se trata de un directivo, hacer clic en el botón "Intranet" e ingresar por dicho portal; si se trata de un editor o administrador con problemas de perfil, solicitar la habilitación correspondiente al Administrador.

> **[Captura: Alerta de Falta de Permisos en Sitio Web]**
> *Alerta informativa impidiendo el acceso a cuentas directivas u operativas sin permisos de edición ni panel en el Sitio Web.*
>
> **[Captura: Alerta de Falta de Permisos en Sitio Web (Móvil)]**
> *Alerta informativa impidiendo el acceso a cuentas directivas u operativas sin permisos de edición ni panel en el Sitio Web. (Móvil).*

6. **Resultado y despliegue del entorno según rol:**
   * *Situaciones anómalas y restricciones de interfaz:* Si un editor ingresa exitosamente pero su rol no tiene permisos asignados sobre la página que está visualizando, las herramientas de edición no se renderizan; si no tiene permisos sobre ninguna sección maquetable, el botón flotante de edición permanece completamente oculto.
   * *Acción de corrección:* Solicitar al Administrador del sistema la asignación de los permisos específicos sobre las páginas o secciones requeridas.

> **[Captura: Restricción de Herramientas de Edición Sitio Web]**
> *Ocultamiento del botón flotante de edición ante falta de permisos sobre la página navegada en el Sitio Web.*
>
> **[Captura: Restricción de Herramientas de Edición Sitio Web (Móvil)]**
> *Ocultamiento del botón flotante de edición ante falta de permisos sobre la página navegada en el Sitio Web. (Móvil).*

##### Validaciones en el Inicio de Sesión Habitual (Intranet del OLO)

1. **Punto de enlace y acceso a la plataforma (Intercepción de navegación no autorizada):**
   * *Acción errónea:* Intentar acceder directamente a rutas privadas de la Intranet (como tableros de Power BI o indicadores en `/inicio`) a través de marcadores del navegador sin haber iniciado sesión previamente.
   * *Respuesta del sistema y validación:* El enrutador de seguridad intercepta la petición y redirige forzosamente al usuario a la pantalla de bloqueo y acceso (`/login`), impidiendo la exposición de datos protegidos.
   * *Acción de corrección:* Autenticarse de forma regular en el formulario presentado en la pantalla de bienvenida.

> **[Captura: Redirección Forzosa a Pantalla de Bloqueo Intranet]**
> *Bloqueo de acceso directo y redirección inmediata al formulario de inicio de sesión de la Intranet.*
>
> **[Captura: Redirección Forzosa a Pantalla de Bloqueo Intranet (Móvil)]**
> *Bloqueo de acceso directo y redirección inmediata al formulario de inicio de sesión de la Intranet. (Móvil).*

2. **Pantalla de bloqueo y bienvenida de la Intranet:**
   * *Situación anómala y control:* La pantalla de bienvenida de la Intranet actúa como barrera de acceso obligatoria frente a cualquier intento de navegación no autenticado.
   * *Acción de corrección:* Introducir las credenciales corporativas `@sena.edu.co` para autenticarse y acceder al entorno privado.

3. **Ingreso con credenciales definitivas (Validaciones de campos de entrada):**
   * *Acciones erróneas y validaciones:*
     * **Campos obligatorios:** Si se omite el correo o la contraseña, el sistema resalta bajo cada casilla correspondiente: `"El correo es requerido"` o `"La contraseña es requerida"`.
     * **Validación de dominio SENA:** Si se introduce un correo que no finaliza en `@sena.edu.co`, el sistema bloquea el envío con: `"Debe ser un correo institucional @sena.edu.co"`.
     * **Formato no válido:** Si la dirección no cumple con el estándar de correo electrónico, se notifica: `"El correo no tiene un formato válido"`.
   * *Acción de corrección:* Digitar el correo corporativo y la contraseña correspondiente sin espacios adicionales.

> **[Captura: Validaciones de Campos en Intranet]**
> *Alertas bajo las casillas de texto por omisión de datos o dominio no corporativo en la Intranet.*
>
> **[Captura: Validaciones de Campos en Intranet (Móvil)]**
> *Alertas bajo las casillas de texto por omisión de datos o dominio no corporativo en la Intranet. (Móvil).*

4. **Ejecución y validación de la sesión (Validación de credenciales en el acceso):**
   * *Acción errónea y respuesta del sistema:* Si el correo electrónico o la clave no coinciden con los registros activos de la plataforma, el sistema emite la alerta general: `"Correo o contraseña incorrectos"`.
   * *Redirección por primer ingreso pendiente:* Si las credenciales ingresadas son válidas pero la cuenta tiene pendiente su configuración inicial, la plataforma lo detecta y lo redirige automáticamente al flujo de primer ingreso para que defina su contraseña personal definitiva y sus tres preguntas de seguridad.
   * *Acción de corrección:* Verificar minuciosamente la clave ingresada mediante el control de visualización (ícono de ojo) o acceder al enlace de recuperación de contraseña *(¿Olvidaste tu contraseña?)*.

> **[Captura: Alerta de Credenciales Inválidas en Intranet]**
> *Mensaje de credenciales erróneas en el panel de acceso de la Intranet.*
>
> **[Captura: Alerta de Credenciales Inválidas en Intranet (Móvil)]**
> *Mensaje de credenciales erróneas en el panel de acceso de la Intranet. (Móvil).*

5. **Verificación de autorización de acceso a la Intranet:**
   * *Acciones erróneas y alertas de permisos:*
     * **Cuentas sin permiso para el entorno interno:** Si el usuario cuenta con un usuario registrado en el OLO pero carece del permiso de acceso al entorno privado interno, el sistema detiene el acceso y despliega la alerta preventiva: *"No tienes permisos para ingresar a la intranet."*.
     * **Cuentas inactivas o suspendidas:** Si la cuenta fue desactivada preventivamente por el Administrador desde el panel de usuarios (o pasó a estado inactivo al cumplirse su fecha de caducidad), el sistema interrumpe de inmediato la autenticación y muestra la alerta en el formulario: `"Cuenta inactiva o suspendida"`.
   * *Acción de corrección:* Si se trata de una cuenta inactiva o suspendida, contactar al Administrador para su reactivación; si carece de permisos de navegación para la Intranet, solicitar la asignación del rol o permiso correspondiente.

> **[Captura: Alerta de Acceso Denegado a la Intranet]**
> *Alerta indicando falta de permisos para acceder a los módulos internos de la Intranet.*
>
> **[Captura: Alerta de Acceso Denegado a la Intranet (Móvil)]**
> *Alerta indicando falta de permisos para acceder a los módulos internos de la Intranet. (Móvil).*
>
> **[Captura: Alerta de Cuenta Inactiva en Intranet]**
> *Alerta desplegada en el formulario de la Intranet impidiendo el acceso a una cuenta inactiva o suspendida.*
>
> **[Captura: Alerta de Cuenta Inactiva en Intranet (Móvil)]**
> *Alerta desplegada en el formulario de la Intranet impidiendo el acceso a una cuenta inactiva o suspendida. (Móvil).*

6. **Resultado y despliegue del entorno según rol en la Intranet:**
   * *Acciones erróneas y control de interfaz:* Si un Director o Subdirector (rol de solo lectura) intenta forzar el acceso a herramientas de edición o maquetación, los controles simplemente no se renderizan, manteniendo el esquema protegido de solo consulta analítica.
   * *Acción de corrección:* Operar dentro del marco de solo lectura asignado al rol o solicitar al Administrador del sistema permisos editoriales si se requiere participar en la creación o modificación de contenidos.

> **[Captura: Restricción de Solo Lectura en Intranet]**
> *Despliegue exclusivo de módulos analíticos y ocultamiento de herramientas de maquetación para roles directivos.*
>
> **[Captura: Restricción de Solo Lectura en Intranet (Móvil)]**
> *Despliegue exclusivo de módulos analíticos y ocultamiento de herramientas de maquetación para roles directivos. (Móvil).*

#### 3.5.1.3. Validaciones en la Recuperación de Contraseña

Durante el procedimiento de recuperación de contraseña (descrito operativamente en la [Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)), el sistema efectúa comprobaciones de existencia de preguntas registradas, validación de sintaxis del correo corporativo, verificación de respuestas confidenciales y cumplimiento de las directivas de seguridad para la nueva clave. Esta sección detalla de forma paralela las incidencias, bloqueos y alertas del sistema en ambos entornos:

* **[Validaciones en la Recuperación de Contraseña (Sitio Web Público)](#validaciones-en-la-recuperación-de-contraseña-sitio-web-público):** Alertas por cuentas sin preguntas configuradas, respuestas no coincidentes y políticas de robustez en el portal web.
* **[Validaciones en la Recuperación de Contraseña (Intranet del OLO)](#validaciones-en-la-recuperación-de-contraseña-intranet-del-olo):** Mensajes en el panel de acceso, asistencia en preguntas de seguridad y alertas de coincidencia en la Intranet.

##### Validaciones en la Recuperación de Contraseña (Sitio Web Público)

1. **Ubicación del enlace de recuperación en el Sitio Web (Punto de acceso):**
   * *Acción errónea:* El usuario intenta recuperar su clave pulsando enlaces externos o buscando la opción fuera del formulario de acceso.
   * *Respuesta del sistema y validación:* La opción de recuperación está disponible exclusivamente mediante el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"** en la tarjeta de `/login`.
   * *Acción de corrección:* Situarse en la pantalla de acceso del Sitio Web Público y hacer clic sobre el enlace interactivo inferior.

> **[Captura: Enlace de Recuperación en Formulario Sitio Web]**
> *Enlace de recuperación en la tarjeta de inicio de sesión del Sitio Web.*
>
> **[Captura: Enlace de Recuperación en Formulario Sitio Web (Móvil)]**
> *Enlace de recuperación en la tarjeta de inicio de sesión del Sitio Web. (Móvil).*

2. **Ingreso y comprobación de la cuenta de correo corporativo:**
   * *Acciones erróneas y validaciones:*
     * **Correo obligatorio:** Si se presiona el botón "Comenzar" con la casilla vacía, el sistema interrumpe el envío indicando: `"El correo es requerido"`.
     * **Formato o dominio ajeno:** Si se escribe un correo con formato inválido o fuera del dominio oficial (`@gmail.com`, `@hotmail.com`), el validador emite en tiempo real: `"El correo no tiene un formato válido"` o `"Debe ser un correo institucional @sena.edu.co"`.
     * **Cuenta sin preguntas de seguridad o inexistente:** Si el correo no cuenta con preguntas de seguridad configuradas en el sistema, la tarjeta despliega la alerta general: `"No hay preguntas de seguridad asociadas a ese correo. Contacta al administrador para restablecer tu acceso."`.
   * *Acción de corrección:* Verificar la correcta escritura del correo corporativo `@sena.edu.co` o solicitar soporte al Administrador si la cuenta nunca completó su configuración inicial de seguridad.

> **[Captura: Validaciones de Correo en Recuperación Sitio Web]**
> *Alertas de formato, dominio corporativo y aviso de cuenta sin preguntas registradas en el Sitio Web.*
>
> **[Captura: Validaciones de Correo en Recuperación Sitio Web (Móvil)]**
> *Alertas de formato, dominio corporativo y aviso de cuenta sin preguntas registradas en el Sitio Web. (Móvil).*

3. **Verificación de identidad mediante preguntas de seguridad:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta vacía o sin diligenciar:** Si se pulsa "Continuar" sin redactar la respuesta a la pregunta activa, el formulario señala: `"La respuesta es requerida"`.
     * **Respuestas no coincidentes:** Al enviar el cuestionario, si las respuestas no coinciden con los registros guardados, el sistema emite la alerta: `"Las respuestas no coinciden con nuestros registros. Intenta nuevamente."`, restableciendo el cuestionario al inicio por seguridad y acumulando un intento fallido en el servidor.
     * **Bloqueo de cuenta por 3 intentos fallidos (30 minutos):** El mecanismo de seguridad interno restringe la recuperación a un máximo de **3 intentos fallidos consecutivos**. Si se alcanza este tope, la cuenta pasa automáticamente a estado bloqueado temporal durante **30 minutos**, impidiendo tanto la recuperación como el acceso normal al sistema con la alerta: `"Cuenta bloqueada temporalmente"`. Dicho evento queda asentado en la bitácora inmutable de auditoría.
     * **Navegación forzada sin correo previo:** Si el usuario intenta cargar directamente la ruta `/login/recovery/security-questions` sin haber validado su correo, el sistema lo reconduce de forma automática a `/login/recovery`.
   * *Acción de corrección:* Digitar con precisión la respuesta secreta configurada en el primer ingreso respetando caracteres y ortografía. En caso de bloqueo por 3 intentos fallidos, aguardar 30 minutos a que expire la restricción o solicitar el desbloqueo manual al Administrador.

> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web (Móvil)]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web. (Móvil).*

4. **Establecimiento de la nueva contraseña (Políticas y confirmación):**
   * *Acciones erróneas y validaciones:*
     * **Omisión o contraseña débil:** Si se intenta guardar dejando el campo vacío o incumpliendo alguno de los 5 requisitos de seguridad, el sistema resalta el requisito pendiente bajo el campo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`), impidiendo el avance.
     * **Contraseña repetida o no permitida por seguridad:** Si la nueva contraseña coincide con la anterior inmediata o se encuentra restringida por la política de seguridad, se despliega directamente bajo la casilla el aviso: `«Esta contraseña no es válida por seguridad, elige otra.»`.
     * **Discrepancia en la confirmación:** Si el campo de repetición no coincide de manera exacta con la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Establecer una contraseña que satisfaga la totalidad de los requisitos validados y reescribirla con exactitud en la casilla de confirmación.

> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web]**
> *Validador de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web.*
>
> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web (Móvil)]**
> *Validador de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web. (Móvil).*

5. **Confirmación y retorno seguro:**
   * *Situación de control:* Tras procesar el cambio en el servidor, la pantalla `/login/recovery/reset-success` confirma la operación y bloquea retornos involuntarios con el botón de retroceso del navegador, obligando a iniciar sesión formalmente.
   * *Acción de corrección:* Hacer clic sobre el botón "Iniciar sesión" y autenticarse con la nueva contraseña definitiva.

> **[Captura: Pantalla de Éxito en Recuperación Sitio Web]**
> *Insignia de confirmación y botón para reanudar el acceso formal en el Sitio Web.*
>
> **[Captura: Pantalla de Éxito en Recuperación Sitio Web (Móvil)]**
> *Insignia de confirmación y botón para reanudar el acceso formal en el Sitio Web. (Móvil).*

##### Validaciones en la Recuperación de Contraseña (Intranet del OLO)

1. **Ubicación del enlace de recuperación en la Intranet (Punto de acceso):**
   * *Acción errónea:* El usuario intenta acceder a la Intranet sin recordar la clave en lugar de utilizar el asistente de restablecimiento.
   * *Respuesta del sistema y validación:* La opción de recuperación está disponible mediante el enlace interactivo **"¿Olvidaste tu contraseña?"** ubicado en el formulario de `/login`.
   * *Acción de corrección:* Situarse en la pantalla de acceso de la Intranet y hacer clic sobre dicho enlace interactivo.

> **[Captura: Enlace de Recuperación en Formulario Intranet]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de ingreso de la Intranet.*
>
> **[Captura: Enlace de Recuperación en Formulario Intranet (Móvil)]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de ingreso de la Intranet. (Móvil).*

2. **Ingreso y comprobación de la cuenta de correo corporativo:**
   * *Acciones erróneas y validaciones:*
     * **Correo obligatorio:** Si se presiona el botón "Comenzar" con la casilla vacía, el sistema interrumpe el envío indicando: `"El correo es requerido"`.
     * **Formato o dominio ajeno:** Si se escribe un correo con formato inválido o fuera del dominio oficial (`@gmail.com`, `@hotmail.com`), el validador emite en tiempo real: `"El correo no tiene un formato válido"` o `"Debe ser un correo institucional @sena.edu.co"`.
     * **Cuenta sin preguntas de seguridad o inexistente:** Si el correo no cuenta con preguntas de seguridad configuradas en el sistema, la tarjeta despliega la alerta: `"No se encontraron preguntas de seguridad para este correo."`.
   * *Acción de corrección:* Digitar el correo corporativo `@sena.edu.co` del funcionario o solicitar apoyo administrativo si la cuenta nunca configuró sus preguntas.

> **[Captura: Validaciones de Correo en Recuperación Intranet]**
> *Alertas de campo obligatorio, dominio corporativo y preguntas no encontradas en la Intranet.*
>
> **[Captura: Validaciones de Correo en Recuperación Intranet (Móvil)]**
> *Alertas de campo obligatorio, dominio corporativo y preguntas no encontradas en la Intranet. (Móvil).*

3. **Verificación de identidad mediante preguntas de seguridad:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta vacía o sin diligenciar:** Si se pulsa "Siguiente" o "Verificar" sin redactar la respuesta a la pregunta activa, el formulario señala: `"La respuesta es requerida"`.
     * **Respuestas no coincidentes:** Al enviar el cuestionario, si las respuestas no coinciden con los registros guardados, el sistema emite la alerta: `"Las respuestas no coinciden. Intenta de nuevo."`, restableciendo el cuestionario al inicio por seguridad y acumulando un intento fallido en el servidor.
     * **Bloqueo de cuenta por 3 intentos fallidos (30 minutos):** El mecanismo de seguridad interno restringe la recuperación a un máximo de **3 intentos fallidos consecutivos**. Si se alcanza este tope, la plataforma bloquea la cuenta de forma automática durante **30 minutos** con la alerta: `"Cuenta bloqueada temporalmente"`. Dicho evento queda asentado en la bitácora inmutable de auditoría.
     * **Navegación forzada sin correo previo:** Si el usuario intenta cargar directamente la ruta `/login/recovery/security-questions` sin haber validado su correo, el sistema lo reconduce de forma automática a `/login/recovery`.
   * *Acción de corrección:* Digitar con precisión la respuesta secreta configurada en el primer ingreso respetando caracteres y ortografía. En caso de bloqueo por 3 intentos fallidos, aguardar 30 minutos a que expire la restricción o solicitar el desbloqueo manual al Administrador.

> **[Captura: Alerta de Respuestas No Coincidentes Intranet]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Intranet (Móvil)]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet. (Móvil).*

4. **Establecimiento de la nueva contraseña (Políticas y confirmación):**
   * *Acciones erróneas y validaciones:*
     * **Omisión o contraseña débil:** Si se intenta guardar dejando el campo vacío o incumpliendo los requisitos de seguridad, los indicadores permanecen pendientes, impidiendo el avance.
     * **Contraseña repetida o no permitida por seguridad:** Si la nueva contraseña coincide con la anterior inmediata o se encuentra restringida por la política de seguridad, se despliega directamente bajo la casilla el aviso: `«Esta contraseña no es válida por seguridad, elige otra.»`.
     * **Discrepancia en la confirmación:** Si el campo de repetición no coincide de manera exacta con la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Registrar una contraseña que satisfaga todos los requisitos y confirmarla con exactitud en la segunda casilla.

> **[Captura: Validaciones de Contraseña en Intranet]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet.*
>
> **[Captura: Validaciones de Contraseña en Intranet (Móvil)]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet. (Móvil).*

5. **Confirmación y retorno seguro:**
   * *Situación de control:* Tras procesar el cambio en el servidor, la pantalla `/login/recovery/reset-success` confirma la operación con el título *"¡Genial, tu clave ha sido actualizada con éxito!"*, bloqueando retornos involuntarios con el botón de retroceso del navegador y obligando a iniciar sesión formalmente.
   * *Acción de corrección:* Hacer clic sobre el botón "Ir a iniciar sesión" y autenticarse con la nueva contraseña definitiva en la pantalla de acceso de la Intranet (`/login`).

> **[Captura: Pantalla de Éxito en Recuperación Intranet]**
> *Título '¡Genial, tu clave ha sido actualizada con éxito!', mensaje en la tarjeta contenedora y botón con título 'Ir a iniciar sesión' en la Intranet.*
>
> **[Captura: Pantalla de Éxito en Recuperación Intranet (Móvil)]**
> *Título '¡Genial, tu clave ha sido actualizada con éxito!', mensaje y botón 'Ir a iniciar sesión' en la Intranet. (Móvil).*

#### 3.5.1.4. Cierre de Sesión por Inactividad y Alertas de Expiración

La plataforma del OLO cuenta con un mecanismo automático de seguridad que supervisa la interacción del usuario en tiempo real en los tres entornos del sistema (**Sitio Web Público**, **Intranet** y **Panel Administrativo**). Su propósito es proteger la confidencialidad de la información y salvaguardar las cuentas de usuario si un equipo de trabajo queda desatendido.

##### 1. Regla de Tiempo y Detección de Inactividad
* **Tiempo límite:** La sesión se considera inactiva tras **15 minutos continuos** sin registrar actividad por parte del usuario (movimientos del cursor, clics, pulsaciones de teclas o pulsaciones táctiles en pantallas móviles).
* **Supervisión continua:** El sistema mantiene un control de tiempo activo en el navegador del funcionario mientras permanezca con la sesión abierta.

##### 2. Advertencia Previa en Pantalla (Ventana Emergente "¿Sigues ahí?")
Para prevenir la pérdida de trabajo o el cierre imprevisto de la sesión, la plataforma emite una advertencia visual anticipada:
* **Momento de activación:** Se despliega exactamente **1 minuto antes** de que se cumpla el límite de tiempo (al minuto 14 de inactividad).
* **Diseño y comportamiento:** Aparece una ventana emergente centrada que atenúa el fondo de la pantalla y concentra la atención del usuario.
* **Elementos de la ventana:**
  * **Título:** `"¿Sigues ahí?"`.
  * **Texto explicativo:** `"Tu sesión se cerrará en [mm:ss] por inactividad. Cerramos las sesiones inactivas para que nadie más pueda usar tu cuenta si dejas el equipo desatendido."`.
  * **Contador regresivo:** Indica claramente los segundos restantes antes del cierre.
  * **Botón principal:** `"Seguir trabajando"`.
* **Acción del usuario:** Si el funcionario pulsa el botón **"Seguir trabajando"**, presiona la tecla **Escape** o hace clic en la pantalla, el temporizador se reinicia a 15 minutos, la ventana se cierra y se continúa trabajando normalmente sin recargar la página.

> **[Captura: Modal de Advertencia por Inactividad "¿Sigues ahí?"]**
> *Ventana modal preventiva desplegada al minuto 14 de inactividad con cuenta regresiva en segundos y botón "Seguir trabajando".*
>
> **[Captura: Modal de Advertencia por Inactividad "¿Sigues ahí?" (Móvil)]**
> *Ventana modal preventiva desplegada al minuto 14 de inactividad con cuenta regresiva en segundos y botón "Seguir trabajando". (Móvil).*

##### 3. Cierre Automático y Protección del Trabajo
Si la cuenta regresiva de la ventana emergente finaliza sin que el usuario interactúe con el sistema:
1. **Desconexión segura:** El sistema cierra de inmediato la sesión activa y desconecta la cuenta en el navegador para evitar accesos no autorizados.
2. **Autoguardado de emergencia en el Editor Visual:** Si el funcionario se encontraba maquetando o editando una página, el sistema intenta guardar automáticamente un borrador antes de cerrar la vista, protegiendo los cambios realizados.
3. **Conservación de la pantalla de trabajo:** El sistema memoriza la página exacta en la que se encontraba el funcionario, de modo que al volver a ingresar no aterriza en la portada general, sino directamente en la pantalla donde estaba operando.

##### 4. Pantalla de Acceso con Alerta Destacada de Expiración
Al completarse el cierre automático, el sistema conduce al usuario a la pantalla de inicio de sesión (`/login`), donde el formulario presenta un **recuadro informativo superior** (banner informativo con texto de advertencia) antes de los campos de correo y contraseña:

* **Alerta estándar por inactividad:**
  > *"Cerramos tu sesión por inactividad. Vuelve a iniciar sesión para continuar."*
* **Alerta especial en el Editor Visual (si la conexión impidió el autoguardado de emergencia):**
  > *"Cerramos tu sesión por inactividad, pero no pudimos guardar los últimos cambios del editor. Vuelve a iniciar sesión para continuar."*
* **Alerta por sesión expirada:**
  > *"Tu sesión expiró. Vuelve a entrar para continuar donde estabas."*

Al reintroducir las credenciales corporativas `@sena.edu.co` y la contraseña definitiva, el sistema valida los datos y redirige al usuario de forma transparente a su pantalla de trabajo previa.

> **[Captura: Alerta de Sesión Expirada por Inactividad en Sitio Web]**
> *Recuadro informativo superior en el formulario de acceso del Sitio Web: "Cerramos tu sesión por inactividad. Vuelve a iniciar sesión para continuar."*
>
> **[Captura: Alerta de Sesión Expirada por Inactividad en Sitio Web (Móvil)]**
> *Recuadro informativo superior en el formulario de acceso del Sitio Web en dispositivo móvil.*
>
> **[Captura: Alerta de Sesión Expirada por Inactividad en Intranet]**
> *Recuadro informativo en la pantalla de bienvenida y acceso de la Intranet tras expirar la sesión.*
>
> **[Captura: Alerta de Sesión Expirada por Inactividad en Intranet (Móvil)]**
> *Recuadro informativo en la pantalla de bienvenida y acceso de la Intranet tras expirar la sesión. (Móvil).*

#### 3.5.1.5. Validaciones y Solución de Problemas en la Estructura Visual, Navegación y Menú de Perfil

Durante la interacción cotidiana con el entorno del Panel Administrativo (cuyo funcionamiento regular se documenta en la [Sección 3.4.2.1: Estructura Visual, Navegación y Menú de Perfil](#3421-estructura-visual-navegación-y-menú-de-perfil)), pueden presentarse situaciones de comportamiento inesperado asociadas a la resolución del monitor, configuración del navegador web, persistencia de preferencias locales o visualización adaptativa en dispositivos móviles. A continuación se detallan las principales incidencias, sus causas y las acciones correctivas correspondientes:

##### 1. La barra lateral de navegación (Sidebar) no se visualiza en computadores de escritorio
* **Situación:** El funcionario ingresa al Panel Administrativo desde un computador y la barra lateral fija izquierda no aparece visible, mostrando en su lugar la barra de navegación superior reducida o la barra inferior fija propia de teléfonos móviles.
* **Causa técnica y operativa:** El sistema aplica un punto de quiebre responsivo automático a los 1024 píxeles de ancho. Esta situación ocurre cuando el monitor cuenta con una resolución horizontal reducida o cuando el nivel de zoom del navegador web se encuentra ampliado al 125%, 150% o más, lo que provoca que el área visible sea interpretada por la interfaz como una pantalla de tableta o teléfono móvil.
* **Acción correctiva:**
  1. Presionar la combinación de teclas `Ctrl + 0` (en Windows) o `Cmd + 0` (en macOS) para restablecer el nivel de zoom del navegador web al 100%.
  2. Maximizar la ventana del navegador web para ocupar la totalidad del monitor de escritorio.
  3. Comprobar en la configuración de pantalla del sistema operativo que la resolución del monitor esté configurada como mínimo en 1280 × 720 píxeles o superior.

> **[Captura: Visualización de Interfaz Adaptativa y Menú Lateral]**
> *Comportamiento de la barra lateral izquierda al restablecer el nivel de zoom estándar en computadores de escritorio.*

##### 2. El menú contextual de perfil no se despliega o se oculta inmediatamente
* **Situación:** Al hacer clic sobre el bloque con el nombre y correo del funcionario en la base de la barra lateral (en escritorio) o sobre el nombre del usuario en la barra superior (en móvil), el menú emergente con las opciones *"Mi perfil"* y *"Cerrar sesión"* no se abre o desaparece de manera instantánea.
* **Causa técnica y operativa:** 
  1. Pulsación rápida de doble clic involuntario que abre y cierra el menú contextual consecutivamente.
  2. Conflicto con extensiones de bloqueo de secuencias de comandos o complementos de terceros instalados en el navegador.
  3. Expiración de la sesión en segundo plano que inhabilita temporalmente los componentes interactivos antes de ejecutar la redirección.
* **Acción correctiva:**
  1. Realizar un único clic pausado sobre la tarjeta de usuario en la base del menú lateral.
  2. Recargar la página mediante la tecla `F5` para reiniciar el estado de los componentes interactivos.
  3. En caso de persistencia, desactivar extensiones invasivas del navegador o verificar en una ventana limpia si la sesión sigue activa.

> **[Captura: Menú Contextual de Perfil y Opciones de Sesión]**
> *Menú contextual emergente desplegado correctamente en la base del menú lateral.*
>
> **[Captura: Menú Contextual de Perfil y Opciones de Sesión (Móvil)]**
> *Menú contextual de usuario desplegado desde la barra superior en dispositivos móviles. (Móvil).*

##### 3. El alternador de tema (Modo claro / Modo oscuro) no conserva la preferencia seleccionada
* **Situación:** El funcionario activa el Modo Oscuro (o Modo Claro), pero al navegar hacia otro módulo administrativo o recargar la página, la apariencia regresa automáticamente al tema anterior.
* **Causa técnica y operativa:** La preferencia visual se almacena localmente en las preferencias del navegador. Si las directivas de seguridad del explorador bloquean los datos de sitios locales, o si se navega en modo de incógnito estricto, el navegador descarta la preferencia al cambiar de página o cerrar la pestaña.
* **Acción correctiva:**
  1. Acceder a la configuración de privacidad del navegador web y asegurarse de que el almacenamiento local y los datos del sitio estén permitidos para el dominio web del aplicativo.
  2. Evitar el uso de ventanas de incógnito si se desea conservar la configuración estética de contraste de manera permanente para sesiones futuras.

##### 4. La barra inferior fija en dispositivos móviles cubre botones o las últimas filas de una tabla
* **Situación:** Al consultar tablas de datos extensas (como usuarios, auditoría o revisiones) desde un teléfono móvil o tableta, la barra inferior fija de navegación (*Bottom Navigation*) parece obstaculizar la visualización de los últimos registros o botones de paginación.
* **Causa técnica y operativa:** Variaciones en el cálculo de la altura visible del navegador móvil provocadas por barras dinámicas del explorador (como la barra de direcciones de Chrome o Safari móvil), las cuales alteran la reserva de espacio inferior antes de que el usuario finalice el desplazamiento.
* **Acción correctiva:**
  1. Desplazar el contenido hacia arriba con el dedo hasta el final de la pantalla; la plataforma incorpora un margen de reserva inferior diseñado específicamente para asegurar que el último elemento quede completamente visible y operable por encima de la barra de botones.
  2. Si la barra del navegador continúa interfiriendo, configurar el explorador móvil para ocultar barras de navegación durante el desplazamiento o girar el dispositivo horizontalmente para ingresar al modo apaisado (*landscape*).

##### 5. Desincronización del contador de "Páginas en revisión"
* **Situación:** La insignia con el contador numérico de borradores pendientes junto al ítem "Páginas en revisión" muestra una cifra desactualizada que no concuerda con las páginas que realmente se encuentran en espera dentro del módulo.
* **Causa técnica y operativa:** Retención de datos en la memoria caché temporal del navegador web o concurrencia operativa, generada cuando otro usuario con rol Administrador aprueba, rechaza o descarta una página simultáneamente desde otra sesión.
* **Acción correctiva:**
  1. Hacer clic sobre el ítem **"Páginas en revisión"** para acceder directamente a la cola de aprobación y consultar los registros reales actualizados en el servidor.
  2. Presionar las teclas `Ctrl + F5` (o forzar recarga en el navegador) para renovar el contador numérico del menú lateral con la información más reciente de la base de datos.

#### 3.5.1.6. Validaciones y Solución de Problemas en el Buscador Global del Panel Administrativo

Durante el uso del buscador global del Panel Administrativo (cuyo procedimiento operativo regular se detalla en la [Sección 3.4.2.2: Buscador Global del Panel Administrativo](#3422-buscador-global-del-panel-administrativo)), pueden suscitarse incidencias operativas relacionadas con la apertura de la capa interactiva, el retorno al área de trabajo mediante el botón Devolver o la interpretación de términos sin coincidencias. A continuación se desglosan las principales situaciones, sus causas y las acciones correctivas correspondientes:

##### 1. La capa a pantalla completa del buscador no se despliega
* **Situación:** Al hacer clic sobre la opción **"Buscar"** en la parte inferior del menú lateral o pulsar el ícono de **lupa** en el encabezado móvil, la interfaz no abre la capa de búsqueda ni enfoca el campo de texto.
* **Causa técnica y operativa:** El cursor del teclado se encuentra capturado dentro de un campo de formulario o componente con foco retenido que intercepta los eventos del mouse o teclado, o existe una ventana modal secundaria en segundo plano que bloquea la interacción.
* **Acción correctiva:**
  1. Presionar la tecla `Escape` (`Esc`) una vez para liberar cualquier foco retenido o cerrar posibles ventanas modales secundarias abiertas previamente.
  2. Hacer clic directamente con el cursor del mouse sobre la opción **"Buscar"** en el menú lateral de escritorio o pulsar el ícono de **lupa** en la barra superior móvil.

> **[Captura: Apertura Exitosa del Buscador Global]**
> *Despliegue correcto de la capa interactiva a pantalla completa con el campo de texto centrado.*
>
> **[Captura: Apertura Exitosa del Buscador Global (Móvil)]**
> *Despliegue correcto de la capa interactiva a pantalla completa en dispositivo móvil. (Móvil).*

##### 2. Dificultad para cerrar la capa interactiva o retornar al panel (Uso del Botón Devolver)
* **Situación:** La capa a pantalla completa se encuentra desplegada pero el funcionario desea cancelar la búsqueda y volver a su trabajo en el panel, sin identificar inicialmente el mecanismo de salida debido a que la interfaz oculta el panel de fondo.
* **Causa técnica y operativa:** La capa del buscador está diseñada a pantalla completa opaca (para prevenir distracciones visuales e inhabilitar el desplazamiento de fondo), por lo que la salida no se realiza mediante un botón tradicional de cancelar en el pie, sino a través de un control de navegación superior.
* **Acción correctiva:**
  1. Hacer clic sobre el **botón Devolver** (identificado con el ícono de una **flecha orientada hacia la izquierda**) ubicado en la esquina superior derecha de la capa, a la izquierda del conmutador de tema.
  2. Como alternativa por teclado, pulsar la tecla `Escape` (`Esc`). Ambas acciones restituyen de forma inmediata la visualización del panel administrativo exactamente en el estado en que se encontraba, sin recargar la página ni perder datos no guardados.

> **[Captura: Botón Devolver y Restitución del Panel]**
> *Ubicación del botón Devolver (flecha hacia la izquierda) y restitución inmediata del panel administrativo.*
>
> **[Captura: Botón Devolver y Restitución del Panel (Móvil)]**
> *Ubicación y uso del botón Devolver en la parte superior derecha de la pantalla del buscador. (Móvil).*

##### 3. Mensaje de ausencia de coincidencias ("No hay nada en el panel que coincida con...")
* **Situación:** Al redactar un término en el campo de texto, no se muestra ningún resultado y la pantalla presenta la notificación: *"No hay nada en el panel que coincida con «[término]»."*.
* **Causa técnica y operativa:** El motor de búsqueda evalúa que **todas** las palabras digitadas coincidan simultáneamente con los títulos, descripciones, categorías o sinónimos registrados en el índice. Si se escribe una frase excesivamente larga, nombres de registros específicos de una tabla (ej. el nombre propio de un funcionario o el código de una ocupación) en lugar de un módulo del sistema, o palabras con errores ortográficos graves en la raíz léxica, el filtro no encontrará correspondencias.
* **Acción correctiva:**
  1. Simplificar la búsqueda utilizando una o dos palabras clave representativas del área o función requerida (por ejemplo: *"usuarios"*, *"roles"*, *"bitácora"*, *"backups"*, *"cola"*, *"contraseña"*, *"actualizaciones"*).
  2. Si se requiere buscar un registro específico dentro de una tabla (por ejemplo, buscar un usuario por su nombre o cédula), utilizar el botón Devolver para ingresar al módulo respectivo (**"Usuarios"**) y emplear los filtros propios de dicha tabla de datos.

> **[Captura: Mensaje de Sin Coincidencias en el Buscador]**
> *Visualización de la alerta informativa cuando el término ingresado no registra coincidencias en el índice.*
>
> **[Captura: Mensaje de Sin Coincidencias en el Buscador (Móvil)]**
> *Visualización de la alerta informativa de ausencia de coincidencias en dispositivo móvil. (Móvil).*

#### 3.5.1.7. Validaciones y Solución de Problemas en el Tablero Principal (Dashboard)

El Tablero Principal (Dashboard) recopila métricas y registros consolidados del observatorio. Al interactuar con este entorno, pueden presentarse las siguientes situaciones:

##### 1. Tarjetas de métricas muestran guion «—» o no cargan datos
* **Situación:** Las tarjetas de páginas publicadas o visitas presentan un guion («—») y en la parte superior del tablero principal se despliega un mensaje de advertencia indicando la imposibilidad de cargar las métricas, acompañado del botón **«Reintentar»**.
* **Posible causa:** Interrupción temporal en la comunicación con el servidor al momento de obtener las estadísticas consolidadas. Para mantener un entorno visual limpio, las tarjetas individuales no repiten textos de error aislados y el aviso se consolida únicamente en la cabecera del panel.
* **Acción correctiva:**
  1. Presionar directamente el botón **«Reintentar»** en la alerta superior para reanudar la consulta de datos de inmediato sin recargar toda la ventana del navegador.
  2. Si la interrupción persiste, verificar la conectividad a internet o presionar la tecla `F5` para recargar el panel administrativo.

##### 2. Gráficos de Visitas o Usuarios no cargan (vacíos)
* **Situación:** El diagrama de líneas de tráfico o el gráfico circular de roles permanece vacío o muestra un indicador de carga permanente.
* **Posible causa:** Lentitud temporal en la conexión al cargar las estadísticas, o el uso de extensiones en el navegador (como bloqueadores de anuncios) que ocultan las gráficas por error.
* **Acción correctiva:**
  1. Revisar y pausar temporalmente cualquier extensión de bloqueo de anuncios (ej. AdBlock) instalada en el navegador, ya que pueden interferir con la visualización.
  2. Recargar el panel administrativo (`F5`). Si el gráfico de usuarios se visualiza pero el de tráfico no, el sistema puede estar procesando aún los datos de visitas de ese periodo.

##### 3. Lista de Actividad Reciente desactualizada
* **Situación:** Se acaba de realizar una acción (ej. aprobar una página) pero no aparece inmediatamente en la lista inferior del tablero principal.
* **Posible causa:** Para agilizar los tiempos de carga, el tablero principal retiene una memoria temporal (*caché*) de las últimas operaciones por breves instantes.
* **Acción correctiva:**
  1. Si se requiere consultar la trazabilidad exacta e inmediata, hacer clic en el enlace **"Ver más"** ubicado en la esquina superior derecha de la lista.
  2. Esto abrirá el módulo de **Auditoría**, el cual extrae los registros en tiempo real directo desde la base de datos sin tiempos de espera.

#### 3.5.1.8. Validaciones y Solución de Problemas en la Gestión de Usuarios

La administración de cuentas en el sistema (detallada operativamente en la [Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)) está protegida por múltiples reglas lógicas para garantizar la seguridad e integridad de la plataforma. Al gestionar funcionarios pueden surgir las siguientes situaciones:

##### 1. Error de Dominio al Crear Usuario
* **Situación:** Al dar clic en "Guardar" en el formulario de Nuevo Usuario, el sistema arroja una alerta de error y rechaza la creación.
* **Posible causa:** El correo ingresado no pertenece al dominio oficial obligatorio.
* **Acción correctiva:** Asegurarse de que el campo de correo termine estrictamente en `@sena.edu.co` sin espacios adicionales al final.

##### 2. Interfaz de Credenciales "Atrapada" (Botón de Cerrar Bloqueado)
* **Situación:** Se acaba de generar la contraseña temporal para un funcionario nuevo (o tras restablecerla), pero el botón de "Cerrar" aparece deshabilitado y no se puede salir de la ventana.
* **Posible causa:** Como mecanismo de prevención contra pérdida de claves irrecuperables, el aplicativo exige constancia de respaldo antes de cerrar.
* **Acción correctiva:** Presionar obligatoriamente el botón con título **"Copiar"**. Inmediatamente después de pulsarlo, el sistema liberará la acción y habilitará el botón de cierre.

##### 3. Alerta de "Fecha de caducidad vencida" al Intentar Activar
* **Situación:** Al encender el interruptor de "Estado" para devolver el acceso a un funcionario previamente suspendido, el sistema muestra una alerta de error y apaga el interruptor por la fuerza.
* **Posible causa:** La cuenta del usuario tiene configurada una "Fecha de caducidad" que ya expiró, por lo que las políticas le prohíben reactivar su acceso sin extenderle primero el periodo.
* **Acción correctiva:** Abrir el modal de edición mediante el ícono del lápiz en la fila del funcionario. Modificar el campo "Fecha de caducidad" seleccionando un nuevo límite futuro (o borrar el valor para hacer la cuenta permanente). Guardar e intentar activar nuevamente.

##### 4. Bloqueo al Intentar Eliminar al Último Administrador
* **Situación:** El Administrador presiona el botón de confirmación con título "Eliminar" en la alerta de advertencia, pero el sistema bloquea la acción y arroja una alerta de error, impidiendo el borrado.
* **Posible causa:** Se intentó borrar al único usuario Administrador activo restante en toda la plataforma. Aunque el sistema permite borrar usuarios con historial (como creadores de páginas), restringe de forma estricta que la plataforma se quede sin gestores.
* **Acción correctiva:** Si ese funcionario definitivamente debe ser retirado, es imperativo que primero se asigne el rol de Administrador a otro usuario activo en el sistema. Una vez exista un relevo, el sistema permitirá eliminar al anterior. Alternativamente, se le puede simplemente **Suspender** (apagar el interruptor de Estado).

##### 5. Funcionario reporta contraseña temporal vencida al realizar el primer ingreso
* **Situación:** Un funcionario recién creado o al que se le brindó soporte de restablecimiento indica que al intentar ingresar el sistema muestra la advertencia: *«Tu contraseña temporal venció (dura 72 horas). Pide al administrador que te genere una nueva.»*.
* **Causa técnica y operativa:** Por política de seguridad, toda contraseña provisional expira automáticamente a las 72 horas continuas de su emisión si el usuario no concluye el proceso de primer ingreso.
* **Acción correctiva:**
  1. Acceder al submenú de Usuarios ([Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)).
  2. Localizar al funcionario en la tabla y presionar el ícono de lápiz de edición en su fila.
  3. En la parte inferior de la ventana modal, hacer clic sobre el botón **"Restablecer la contraseña"**.
  4. El sistema generará una nueva credencial provisional que renueva el ciclo de validez por otras 72 horas y desplegará el modal informativo con la fecha límite.
  5. Presionar obligatoriamente el botón **"Copiar"** (para habilitar el cierre) y remitir la clave al funcionario a través de los canales oficiales.

##### 6. Aviso de «Tu cuenta tiene la configuración pendiente»
* **Situación:** En la parte superior de la tabla de usuarios (o en otros módulos de consulta y gestión del Panel Administrativo), la lista de registros no se despliega y se presenta una tarjeta de advertencia con el título: *«Tu cuenta tiene la configuración pendiente»*, el texto informativo: *«Para continuar, termina de configurar tu contraseña y tus preguntas de seguridad. Si crees que es un error, borra las cookies de este sitio y vuelve a iniciar sesión.»*, y el botón de acción **«Terminar configuración»**.
* **Causa:** Por directriz estricta de seguridad, el sistema restringe la consulta y operación de datos en el observatorio si la cuenta del usuario en sesión tiene pendiente completar los requisitos obligatorios de seguridad (por ejemplo, tras un restablecimiento puntual de contraseña o de preguntas de seguridad efectuado por el Administrador que aún no ha sido concluido por el funcionario). Asimismo, puede originarse si en el mismo navegador quedaron datos residuales de otra sesión que tenía configuraciones pendientes.
* **Acción correctiva:**
  1. Presionar directamente el botón **«Terminar configuración»** para que el sistema traslade de forma automática a la pantalla de configuración obligatoria (`/login/first-login`, `/login/first-login/change-password` o `/login/first-login/security-questions`) y registrar la contraseña definitiva personal y/o responder las preguntas de seguridad secretas.
  2. Si la cuenta ya se encuentra al día y el mensaje se presenta por conflicto de sesiones abiertas previamente en el mismo equipo, borrar las cookies y datos del sitio web en el navegador y volver a iniciar sesión de forma regular.

> **[Captura: Aviso de Configuración Pendiente en el Panel]**
> *Tarjeta de advertencia con el mensaje 'Tu cuenta tiene la configuración pendiente' y el botón interactivo 'Terminar configuración' en el Panel Administrativo.*
>
> **[Captura: Aviso de Configuración Pendiente en el Panel (Móvil)]**
> *Tarjeta de advertencia con el mensaje 'Tu cuenta tiene la configuración pendiente' y el botón interactivo 'Terminar configuración' en el Panel Administrativo. (Móvil).*


#### 3.5.1.9. Validaciones y Solución de Problemas en la Gestión de Roles y Permisos

La configuración de roles y la asignación de permisos (cuyo procedimiento operativo regular se detalla en la [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos)) cuenta con mecanismos de protección estructural para preservar la consistencia de los accesos y la integridad de las cuentas de usuario. A continuación se desglosan las principales situaciones, sus causas y las acciones correctivas correspondientes:

##### 1. Bloqueo al Intentar Eliminar un Rol en Uso (Usuarios Asignados)
* **Situación:** Al presionar el ícono de basurero para eliminar un rol derivado, el sistema no muestra el botón de borrado, sino una ventana modal de advertencia (*«No se puede eliminar este rol»*) con el botón único *"Entendido"*.
* **Causa técnica y operativa:** Todo usuario en la plataforma debe tener obligatoriamente un rol asignado en todo momento. Para prevenir cuentas huérfanas de rol y fallos de autorización en cascada, el sistema comprueba la base de datos y bloquea terminantemente el borrado de cualquier rol que tenga uno o más funcionarios vinculados.
* **Acción correctiva:**
  1. Dirigirse al módulo de Usuarios ([Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)).
  2. Filtrar o localizar a los funcionarios que tienen asignado dicho rol y abrir su formulario mediante el ícono de lápiz.
  3. Reasignarles otro rol adecuado (ej. el rol base Editor u otro rol derivado) y guardar los cambios.
  4. Una vez que el rol tenga 0 usuarios asociados, regresar al módulo de Roles y presionar nuevamente el ícono de basurero; el sistema presentará la confirmación definitiva para proceder con la eliminación.

> **[Captura: Alerta Bloqueo Eliminación Rol en Uso]**
> *Ventana modal informando que el rol no se puede eliminar por contar con usuarios asignados y orientando a la reasignación previa.*
>
> **[Captura: Alerta Bloqueo Eliminación Rol en Uso (Móvil)]**
> *Ventana modal informando que el rol no se puede eliminar por contar con usuarios asignados. (Móvil).*

##### 2. Imposibilidad de Modificar el Nombre de un Rol Creado
* **Situación:** Al hacer clic en el ícono de lápiz para editar un rol, el campo *"Nombre del rol"* se encuentra bloqueado, deshabilitado y con la etiqueta *"No modificable"*, sin permitir la edición del texto.
* **Causa técnica y operativa:** Por motivos de seguridad e integridad en la base de datos, el nombre de un rol queda fijado al momento de su creación para salvaguardar las asignaciones existentes y la coherencia en la bitácora de auditoría técnica. Únicamente es posible actualizar su descripción y sus permisos.
* **Acción correctiva:** Si se requiere un rol con una denominación distinta:
  1. Crear un nuevo rol mediante el botón **"Nuevo Editor"** con el nombre complementario deseado.
  2. Configurar la descripción y activar los permisos necesarios en las 5 secciones de control.
  3. Reasignar a los funcionarios correspondientes a este nuevo rol desde el módulo de Usuarios.
  4. Eliminar el rol anterior una vez quede sin usuarios vinculados.

> **[Captura: Campo Nombre No Modificable]**
> *Visualización del campo de nombre de rol bloqueado y en modo de solo lectura dentro de la modal de edición.*
>
> **[Captura: Campo Nombre No Modificable (Móvil)]**
> *Visualización del campo de nombre de rol bloqueado y en modo de solo lectura en dispositivo móvil. (Móvil).*

##### 3. Ícono de Basurero Bloqueado en el Rol Base "Editor"
* **Situación:** En la fila correspondiente al rol *"Editor"*, el botón con ícono de basurero aparece deshabilitado (*cursor-not-allowed*) y no responde al clic.
* **Causa técnica y operativa:** El rol base `Editor` es el perfil matriz del cual heredan todos los roles derivados de la plataforma. Su existencia es obligatoria para la infraestructura del editor visual y se encuentra protegido por la configuración base de la plataforma, por lo que su eliminación está inhabilitada de forma permanente.
* **Acción correctiva:** El rol base Editor no debe ni puede ser suprimido. Si se necesita limitar las facultades de un usuario que posee este rol, se le debe editar desde el módulo de Usuarios para asignarle un rol derivado con permisos restringidos, o bien suspender su acceso apagando su interruptor de Estado.

> **[Captura: Rol Base Editor con Borrado Bloqueado]**
> *Fila del rol base Editor en la tabla mostrando el ícono de basurero deshabilitado permanentemente.*
>
> **[Captura: Rol Base Editor con Borrado Bloqueado (Móvil)]**
> *Fila del rol base Editor en dispositivo móvil con el control de borrado deshabilitado. (Móvil).*

##### 4. Nuevas Páginas No Editables para Roles Derivados (Falta de Delegación)
* **Situación:** Un funcionario con rol derivado puede ingresar al editor pero no visualiza el botón flotante de edición en una página recién creada en el portal o intranet.
* **Causa técnica y operativa:** Cuando se crea una nueva página, por política de aislamiento inicial esta solo queda habilitada automáticamente para el Administrador, para el rol base Editor y para el rol creador de la misma. Los demás roles derivados no tienen acceso a ella de fábrica.
* **Acción correctiva:**
  1. Ingresar a este módulo (**Roles y Permisos**).
  2. Localizar el rol derivado y hacer clic en el ícono de **lápiz**.
  3. Pulsar el botón con título **"Editar permisos"**.
  4. Ubicar la página creada dentro de la sección correspondiente (*"Secciones del sitio web"* o *"Secciones de la intranet"*), utilizando el buscador interno si es necesario.
  5. Activar el interruptor de la página (el sistema mostrará la insignia *«se añade»*) y hacer clic en **"Guardar permisos"**.

> **[Captura: Delegación de Nueva Página en Catálogo de Permisos]**
> *Activación manual del interruptor de una nueva página en el catálogo de permisos de un rol derivado.*
>
> **[Captura: Delegación de Nueva Página en Catálogo de Permisos (Móvil)]**
> *Activación manual del interruptor de una nueva página en dispositivo móvil. (Móvil).*

##### 5. Botón "Guardar permisos" Inactivo o Deshabilitado
* **Situación:** El Administrador se encuentra en la ventana modal de edición de permisos pero el botón *"Guardar permisos"* permanece inactivo y no permite confirmar la operación.
* **Causa técnica y operativa:** El sistema detecta que no se ha realizado ninguna variación respecto a la configuración original del rol (no se modificó la descripción ni se alteró ningún interruptor). El pie de la modal muestra la indicación informativa *"Sin cambios que guardar."*.
* **Acción correctiva:** Si no se requiere efectuar ajustes, cerrar la ventana modal mediante el botón **"Cancelar"** o el botón de cierre con ícono de equis en la esquina superior. Si se desea guardar, verificar que efectivamente se haya cambiado la descripción o alternado al menos un interruptor de permisos.

> **[Captura: Botón Guardar Deshabilitado sin Cambios]**
> *Pie de la ventana modal mostrando el mensaje informativo de ausencia de cambios y el botón deshabilitado.*
>
> **[Captura: Botón Guardar Deshabilitado sin Cambios (Móvil)]**
> *Pie de la ventana modal mostrando el mensaje informativo de ausencia de cambios en dispositivo móvil. (Móvil).*

#### 3.5.1.10. Validaciones y Solución de Problemas en la Aprobación y Publicación de Contenidos (Páginas en Revisión)

El flujo editorial de revisión y paso a producción (cuyo procedimiento operativo se detalla en la [Sección 3.4.2.5: Aprobación y Publicación de Contenidos: Páginas en Revisión](#3425-aprobación-y-publicación-de-contenidos-páginas-en-revisión)) incorpora reglas estrictas de control y validación para evitar publicaciones incompletas, descartes no justificados o inconsistencias en la bitácora de auditoría. A continuación se presentan las principales situaciones, sus causas y las acciones correctivas correspondientes:

##### 1. Botón "Rechazar" Deshabilitado en la Ventana Modal de Observaciones
* **Situación:** El Administrador presiona el botón "Rechazar" para devolver una versión a corrección pero, dentro de la ventana modal, el botón de confirmación **"Rechazar"** permanece inactivo, deshabilitado y no responde al clic.
* **Causa técnica y operativa:** Por directriz de auditoría y retroalimentación pedagógica, el sistema prohíbe rechazar un borrador sin dejar constancia escrita de los motivos. Mientras el campo de texto (*«Explica la razón…»*) permanezca vacío o contenga únicamente espacios, la validación de seguridad bloquea el envío.
* **Acción correctiva:**
  1. Hacer clic en el campo de texto (*«Explica la razón…»*) dentro de la ventana modal.
  2. Redactar puntualmente los motivos del rechazo o las instrucciones de ajuste para el editor (hasta un máximo de 100 caracteres).
  3. Al registrar el texto, el botón de confirmación **"Rechazar"** se habilitará automáticamente para autorizar el cierre del proceso.

> **[Captura: Botón Rechazar Deshabilitado sin Observaciones]**
> *Ventana modal de rechazo con el botón de confirmación deshabilitado ante la ausencia de observaciones obligatorias.*
>
> **[Captura: Botón Rechazar Deshabilitado sin Observaciones (Móvil)]**
> *Ventana modal de rechazo con el botón deshabilitado en dispositivo móvil. (Móvil).*

##### 2. Botón "Eliminar" Bloqueado en la Modal de Descarte Definitivo
* **Situación:** Al presionar el botón con ícono de papelera para anular un borrador no procedente o duplicado, el botón de confirmación **"Eliminar"** dentro de la ventana modal no permite hacer clic.
* **Causa técnica y operativa:** El descarte de una versión en revisión es una acción destructiva e irreversible que borra permanentemente el borrador. Por políticas de control y trazabilidad, el sistema exige documentar obligatoriamente la justificación del descarte antes de autorizar la acción.
* **Acción correctiva:**
  1. Ingresar en el campo de texto el motivo justificado de la anulación (ej. *«Borrador duplicado remitido por error»* o *«Contenido descartado por actualización directiva»*).
  2. Verificar que no se sobrepase el límite visible de 100 caracteres.
  3. En cuanto exista texto registrado, el botón **"Eliminar"** se activará de inmediato para confirmar la operación y registrar el suceso en la bitácora de auditoría.

> **[Captura: Botón Eliminar Deshabilitado sin Justificación]**
> *Ventana modal de descarte permanente mostrando el botón Eliminar inactivo mientras no se registre el motivo.*
>
> **[Captura: Botón Eliminar Deshabilitado sin Justificación (Móvil)]**
> *Ventana modal de descarte permanente con botón bloqueado en dispositivo móvil. (Móvil).*

##### 3. Bandeja Vacía cuando un Editor Manifiesta Haber Enviado Cambios
* **Situación:** Un funcionario con rol de Editor indica que ya modificó una página y la remitió para visto bueno, pero la bandeja de **Páginas en Revisión** no muestra ninguna solicitud pendiente (o muestra únicamente las de otros funcionarios).
* **Causa técnica y operativa:** El editor guardó sus avances de forma local o como borrador de trabajo mediante el botón "Guardar Borrador", pero no completó la acción final de **"Enviar a revisión"** (o cerró el navegador antes de confirmar el envío). Mientras no se ejecute este paso, el borrador permanece exclusivamente en el entorno de edición y no entra al circuito de aprobación administrativa.
* **Acción correctiva:**
  1. Solicitar al funcionario que ingrese nuevamente al editor visual de la página correspondiente.
  2. Verificar que haga clic en el botón **"Enviar a revisión"** y registre el comentario de cambios.
  3. Tras confirmar el envío en el editor, el Administrador debe refrescar la bandeja de **Páginas en Revisión** para visualizar y gestionar la nueva solicitud.

> **[Captura: Bandeja sin Páginas en Revisión]**
> *Bandeja de revisión informando que no existen solicitudes de aprobación pendientes.*
>
> **[Captura: Bandeja sin Páginas en Revisión (Móvil)]**
> *Bandeja de revisión sin solicitudes pendientes en dispositivo móvil. (Móvil).*

##### 4. Necesidad de Revertir una Publicación Accidental en Producción
* **Situación:** El Administrador aprobó y publicó por equivocación una versión que aún no debía salir a producción o que presentaba errores que pasaron inadvertidos en la revisión previa.
* **Causa técnica y operativa:** Al confirmar la publicación en la ventana modal, la versión se despliega de inmediato en el entorno productivo visible a los usuarios y la versión previamente activa se traslada de forma automática al módulo de Respaldos.
* **Acción correctiva:**
  1. Dirigirse al menú lateral del Panel Administrativo y seleccionar el módulo **Respaldos** (o acceder a la herramienta de historial en el editor de la página).
  2. Localizar la versión previa inmediata (la que se encontraba activa antes de la publicación accidental).
  3. Presionar la opción de **Restaurar** sobre dicha versión para regresarla de inmediato al estado activo en producción, mitigando el impacto público mientras se corrige el nuevo contenido.

> **[Captura: Confirmación de Publicación con Advertencia de Respaldo]**
> *Ventana modal advirtiendo el traslado automático de la versión activa anterior al módulo de Respaldos.*
>
> **[Captura: Confirmación de Publicación con Advertencia de Respaldo (Móvil)]**
> *Ventana modal de confirmación en dispositivo móvil. (Móvil).*

##### 5. Exceso en el Límite de 100 Caracteres en Observaciones o Motivos
* **Situación:** El Administrador intenta ingresar una explicación extensa o detallada en el campo de texto de las ventanas modales de rechazo o eliminación, pero el sistema bloquea la escritura de más caracteres.
* **Causa técnica y operativa:** Para preservar la concisión de los registros y optimizar el almacenamiento en la bitácora inmutable de auditoría, los campos de observaciones y motivos cuentan con un límite estricto de 100 caracteres.
* **Acción correctiva:**
  1. Monitorear el contador numérico visible debajo del campo (ej. `80/100`).
  2. Sintetizar las indicaciones en una frase concisa y concreta con los puntos esenciales a corregir o justificar.
  3. Si se requiere una retroalimentación más extensa para el editor, consignar el resumen esencial en el modal y remitir las especificaciones detalladas por los canales oficiales de comunicación (correo corporativo `@sena.edu.co` o Teams), recordando que el borrador queda en estado rechazado conservando todos los cambios para su posterior ajuste.

> **[Captura: Contador de Caracteres en Modal de Decisión]**
> *Campo de observaciones en ventana modal evidenciando el límite numérico y contador de caracteres.*
>
> **[Captura: Contador de Caracteres en Modal de Decisión (Móvil)]**
> *Campo de observaciones y contador en dispositivo móvil. (Móvil).*

#### 3.5.1.11. Validaciones y Solución de Problemas en la Bitácora de Auditoría

El módulo de Auditoría ([Sección 3.4.2.6](#3426-auditoría-y-bitácora-de-eventos)) garantiza la trazabilidad inmutable de la plataforma mediante reglas de seguridad y respaldo. A continuación se resumen las principales situaciones operativas y su solución:

##### 1. Botón de Confirmación "Depurar" Deshabilitado en la Modal
* **Situación:** El botón de confirmación *«Depurar [N] registros»* permanece inactivo y no responde al clic.
* **Causa:** Es obligatorio resguardar una copia local antes de suprimir cualquier evento de la base de datos.
* **Acción correctiva:** Presionar el botón circular con ícono de descarga (*«Descarga aquí el Logs de respaldo»*). Al completarse la descarga del archivo `respaldo-auditoria-depurada-[FECHA].csv`, el botón de confirmación se habilitará automáticamente.

> **[Captura: Botón Depurar Deshabilitado sin Descarga Previa]**
> *Ventana modal de depuración con botón de confirmación bloqueado a la espera de la descarga obligatoria del respaldo CSV.*
>
> **[Captura: Botón Depurar Deshabilitado sin Descarga Previa (Móvil)]**
> *Ventana modal de depuración con confirmación bloqueada en dispositivo móvil. (Móvil).*

##### 2. Mensaje "No se encontraron registros de auditoría anteriores a [Fecha]"
* **Situación:** La ventana de depuración informa 0 registros a depurar y no ofrece botón de eliminación.
* **Causa:** El sistema aplica la **regla de retención obligatoria del último año** (365 días continuos inmutables). Si no existen movimientos con más de un año de antigüedad, no hay registros depurables.
* **Acción correctiva:** No se requiere acción técnica; la tabla se encuentra al día. Cerrar la ventana mediante **"Cancelar"**.

##### 3. Búsqueda sin Coincidencias o Fechas Bloqueadas en Filtros
* **Situación:** La tabla indica *«Ningún registro coincide con los filtros aplicados»* o los calendarios impiden seleccionar determinados días.
* **Causa:** Combinación de filtros restrictivos o validación cruzada automática (el campo *Desde* bloquea fechas posteriores a *Hasta*, y viceversa).
* **Acción correctiva:** Presionar el botón **"Limpiar filtros"** en la barra superior para reiniciar la consulta a los valores por defecto y seleccionar nuevamente los criterios deseados.

> **[Captura: Estado sin Coincidencias por Filtros]**
> *Tabla de auditoría vacía con mensaje informativo y botón de limpieza de filtros visible.*
>
> **[Captura: Estado sin Coincidencias por Filtros (Móvil)]**
> *Mensaje informativo de ausencia de coincidencias por filtros en dispositivo móvil. (Móvil).*

---

##### Aclaración y Referencia de Acciones Registradas en la Bitácora

Los eventos reflejados en la columna **Acción** y en los filtros se clasifican en tres categorías operativas:

| Categoría | Acciones Visibles | Nivel de Relevancia | Qué Representa en el Sistema |
| :--- | :--- | :--- | :--- |
| **Contenido editorial** | `Creación`, `Edición`, `Autoguardado` | Operación de rutina | Creación y modificación de páginas, guardado de borradores y envíos a revisión desde el editor visual. |
| **Administración** | `Publicación`, `Rechazo`, `Archivado` | Resultado favorable (Publicación)<br>Atención requerida (Rechazo)<br>Registro histórico (Archivado) | Decisiones tomadas por el Administrador sobre borradores y despublicación de contenidos. |
| **Seguridad** | `Autenticación`, `Modificación`, `Expiró`, `Inactivación`, `Bloqueo`, `Preguntas de seguridad`, `Cambio de contraseña`, `Eliminación` | Operación de rutina (Login, cambios de clave/datos)<br>Atención requerida (Expiración de cuenta)<br>Advertencia de seguridad (Inactivación/Bloqueo)<br>Acción crítica (Eliminación definitiva) | Movimientos de cuentas `@sena.edu.co`, asignación de roles, permisos, intentos fallidos y depuraciones. |

---

#### 3.5.1.12. Validaciones y Solución de Problemas en Respaldos y Restauración de Páginas

El módulo de Respaldos ([Sección 3.4.2.7](#3427-respaldos-y-restauración-de-páginas)) protege la integridad de las publicaciones mediante validaciones de concurrencia y reglas de conservación. A continuación se presentan las principales situaciones operativas, sus causas y las acciones correspondientes:

##### 1. Bloqueo de Restauración por Página en Uso
* **Situación:** Al hacer clic en **"Restaurar versión"**, el sistema no abre la confirmación de restauración, sino que despliega la ventana modal **«Página en uso»** informando: *«No se puede restaurar la página porque está siendo editada por [Nombre del funcionario]»*.
* **Causa:** El sistema verifica en tiempo real que ningún usuario tenga abierta la página en el Editor Visual. Si detecta una sesión de edición activa, bloquea la restauración para evitar sobreescrituras accidentales o pérdidas de cambios.
* **Acción correctiva:**
  1. Presionar el botón **"Entendido"** para cerrar el aviso.
  2. Comunicarse con el funcionario indicado para que guarde sus cambios o cierre el Editor Visual liberando la página.
  3. Una vez finalizada la sesión de edición (o transcurrido el tiempo de inactividad de 15 minutos que libera el bloqueo automáticamente), intentar nuevamente la restauración.

> **[Captura: Modal de Bloqueo por Página en Uso]**
> *Ventana modal «Página en uso» con aviso de bloqueo temporal informando el nombre del funcionario que se encuentra editando la página.*
>
> **[Captura: Modal de Bloqueo por Página en Uso (Móvil)]**
> *Ventana modal de página en uso adaptada a dispositivo móvil. (Móvil).*

##### 2. La Última Versión Anterior Sigue Visible tras una Depuración
* **Situación:** El Administrador ejecuta la depuración de versiones de una página, pero observa que en la tabla principal de Respaldos continúa apareciendo un registro disponible para restaurar.
* **Causa:** El sistema aplica la regla estricta **«Respaldo siempre protegido»**. La versión anterior retirada de publicación de cada página nunca se elimina en una depuración, garantizando que el punto de restauración inmediato permanezca siempre disponible.
* **Acción correctiva:** No constituye un error; corresponde al comportamiento previsto por la plataforma para proteger la continuidad operativa del Sitio Web y la Intranet.

> **[Captura: Aviso de Respaldo Protegido en Modal de Depuración]**
> *Mensaje informativo en la ventana modal de depuración destacando la regla de respaldo siempre protegido.*
>
> **[Captura: Aviso de Respaldo Protegido en Modal de Depuración (Móvil)]**
> *Aviso de respaldo siempre protegido en dispositivo móvil. (Móvil).*

##### 3. Mensaje de Ausencia de Respaldos Disponibles
* **Situación:** La interfaz muestra el mensaje *«No hay páginas con versiones anteriores disponibles para restaurar»* y no se listan registros en la tabla.
* **Causa:** Las páginas recién creadas o que únicamente cuentan con su primera versión publicada no tienen aún una versión anterior que haya sido reemplazada.
* **Acción correctiva:** No se requiere acción correctiva. Cuando se elabore y publique una nueva versión sobre cualquiera de estas páginas, la versión saliente se incorporará de forma automática a este listado como su respaldo activo.

> **[Captura: Vista de Respaldos sin Registros]**
> *Pantalla principal de Respaldos mostrando el estado informativo cuando no existen versiones anteriores disponibles.*
>
> **[Captura: Vista de Respaldos sin Registros (Móvil)]**
> *Estado informativo de ausencia de respaldos en dispositivo móvil. (Móvil).*

---

#### 3.5.1.13. Validaciones y Solución de Problemas en Mi Perfil

El módulo de Mi Perfil ([Sección 3.4.2.9.1](#34291-sección-mi-perfil)) gestiona la información de identificación de la cuenta y el cambio voluntario de credenciales bajo estrictas reglas de seguridad y trazabilidad. A continuación se detallan las principales situaciones de soporte, sus causas y las acciones correctivas aplicables:

##### 1. Campos de Identificación Bloqueados (Modo Solo Lectura)
* **Situación:** El funcionario intenta hacer clic o escribir en las casillas de **Nombre**, **Apellidos** o **Correo Electrónico**, pero el cursor muestra el símbolo de bloqueo o no permitido, el fondo aparece en gris atenuado y el sistema no permite editar los textos.
* **Causa:** Regla de integridad de datos maestros. La pantalla de "Mi Perfil" opera en modalidad de solo lectura para los datos personales; la actualización de nombres, apellidos y cuentas de usuario `@sena.edu.co` se encuentra centralizada en el módulo de control de accesos para resguardar la trazabilidad de seguridad y evitar modificaciones no supervisadas.
* **Acción correctiva:** Si el funcionario requiere corregir o actualizar sus datos de identidad, debe solicitar el ajuste a un usuario con rol de Administrador. Si el funcionario cuenta con el permiso de gestión de usuarios, debe ingresar a la ruta `/admin/users` (**Accesos > Usuarios**) y editar el registro correspondiente en la tabla (ver [Sección 3.4.2.4: Gestión de Usuarios y Control de Acceso](#3424-gestión-de-usuarios-y-control-de-acceso)).

> **[Captura: Mi Perfil - Datos en Solo Lectura]**
> *Campos de Nombre, Apellidos y Correo Electrónico en modo solo lectura con cursor deshabilitado y texto explicativo.*
>
> **[Captura: Mi Perfil - Datos en Solo Lectura (Móvil)]**
> *Visualización de datos de identificación en solo lectura adaptada a pantallas móviles. (Móvil).*

##### 2. Error "Contraseña actual incorrecta"
* **Situación:** Al enviar el formulario presionando el botón **"Cambiar Contraseña"**, la interfaz despliega un recuadro de notificación de error con el mensaje: *«Contraseña actual incorrecta»*.
* **Causa:** La clave ingresada en la casilla *Contraseña Actual* no coincide con la contraseña cifrada almacenada actualmente en la base de datos para la cuenta en sesión.
* **Acción correctiva:**
  1. Hacer clic en el botón con ícono de ojo situado al extremo derecho del campo para revisar visualmente los caracteres escritos y confirmar que la tecla Bloq Mayús (Caps Lock) no se encuentre activada de forma inadvertida.
  2. En caso de no recordar la clave vigente, el funcionario debe cerrar la sesión activa y dirigirse al enlace *«¿Olvidaste tu contraseña?»* en la pantalla de inicio de sesión (`/login`), completando el flujo de auto-recuperación mediante la validación de las tres preguntas de seguridad (ver [Sección 3.4.1.3: Flujo de Recuperación de Contraseña Olvidada](#3413-flujo-de-recuperación-de-contraseña-olvidada)).

> **[Captura: Error Contraseña Actual Incorrecta]**
> *Notificación de error informando que la contraseña actual ingresada es incorrecta.*
>
> **[Captura: Error Contraseña Actual Incorrecta (Móvil)]**
> *Notificación de error de contraseña actual incorrecta en dispositivo móvil. (Móvil).*

##### 3. Discrepancia entre la Nueva Contraseña y su Confirmación
* **Situación:** Al intentar guardar el cambio de contraseña, el sistema no efectúa el envío y presenta la advertencia: *«Las contraseñas nuevas no coinciden»*.
* **Causa:** El contenido de la casilla *Nueva Contraseña* difiere en uno o varios caracteres del texto ingresado en la casilla *Confirmar Contraseña*.
* **Acción correctiva:** Hacer clic en los íconos de ojo en ambos campos para descubrir los caracteres y comparar su contenido, asegurando que ambas casillas contengan exactamente los mismos caracteres, respetando mayúsculas, minúsculas, números y símbolos.

> **[Captura: Error Contraseñas No Coinciden]**
> *Alerta en el formulario de Mi Perfil indicando la discrepancia entre la nueva contraseña y su confirmación.*
>
> **[Captura: Error Contraseñas No Coinciden (Móvil)]**
> *Alerta de discrepancia de contraseñas adaptada a dispositivo móvil. (Móvil).*

##### 4. Incumplimiento de la Política de Complejidad de Contraseña
* **Situación:** Durante la digitación de la nueva clave, el panel inferior de verificación mantiene una o más condiciones pendientes o con marca de advertencia, y al intentar enviar el formulario se emite el mensaje específico del requisito no satisfecho (por ejemplo: *«La contraseña debe tener al menos 12 caracteres»*, *«Debe combinar mayúsculas, minúsculas y números o símbolos»* o *«No se permiten emojis»*).
* **Causa:** La contraseña propuesta no cumple los lineamientos obligatorios de la política de seguridad.
* **Acción correctiva:** Ajustar la clave ingresada guiándose en tiempo real por el panel interactivo de requisitos hasta que todos los puntos se transformen en marcas de verificación aprobadas antes de hacer clic en **"Cambiar Contraseña"**.

> **[Captura: Panel de Validación de Contraseña en Vivo]**
> *Panel dinámico de requisitos de seguridad en Mi Perfil mostrando la validación en tiempo real de longitud y composición.*
>
> **[Captura: Panel de Validación de Contraseña en Vivo (Móvil)]**
> *Panel de requisitos de contraseña adaptado a pantallas táctiles móviles. (Móvil).*

##### 5. Rechazo por Contraseña Repetida o No Permitida
* **Situación:** Al ingresar la nueva contraseña, aparece directamente bajo la casilla el mensaje de validación: *«Esta contraseña no es válida por seguridad, elige otra.»*.
* **Causa:** Política de no repetición de contraseñas. El sistema prohíbe reutilizar la contraseña actual o contraseñas anteriores inmediatas.
* **Acción correctiva:** Proponer una contraseña completamente nueva que no haya sido utilizada previamente en la cuenta y que cumpla con los requisitos de longitud y combinación de caracteres.

---

#### 3.5.1.14. Validaciones y Solución de Problemas en Configuración

El módulo de Configuración ([Sección 3.4.2.9.2](#34292-sección-configuración)) permite personalizar la identidad visual del panel administrativo y gestionar las preferencias auditivas del entorno de trabajo. A continuación se presentan las validaciones técnicas, reglas de accesibilidad y acciones correctivas para cada escenario operativo:

##### 1. Rechazo de Archivo por "Formato no admitido"
* **Situación:** Al arrastrar o seleccionar una imagen para el logotipo o para el ícono de la pestaña, el sistema interrumpe la carga y despliega una notificación flotante de advertencia: *«Formato no admitido. Sube una imagen PNG.»*.
* **Causa:** Se intentó cargar un archivo en un formato gráfico no autorizado (por ejemplo: JPG, JPEG, GIF, WEBP, SVG o PDF). La plataforma admite exclusivamente el formato PNG para garantizar la compatibilidad con canales de transparencia y optimización de renderizado en múltiples resoluciones.
* **Acción correctiva:** Abrir la imagen en un editor gráfico y exportarla o guardarla expresamente en formato `.png` (preferiblemente con fondo transparente) antes de repetir la carga en la plataforma.

> **[Captura: Alerta Formato No Admitido PNG]**
> *Notificación de advertencia emergente informando que únicamente se admiten archivos en formato PNG.*
>
> **[Captura: Alerta Formato No Admitido PNG (Móvil)]**
> *Notificación de advertencia de formato no admitido en pantalla móvil. (Móvil).*

##### 2. Rechazo de Archivo por Exceso de Peso ("La imagen pesa demasiado")
* **Situación:** La interfaz rechaza la imagen cargada y emite una alerta flotante indicando: *«La imagen pesa demasiado. El logo de la barra lateral puede pesar hasta 1024 KB.»* (o *«El icono de la pestaña puede pesar hasta 512 KB.»*).
* **Causa:** El peso del archivo seleccionado excede el umbral máximo de almacenamiento permitido por el sistema (1 MB para el logotipo horizontal y 512 KB para el ícono cuadrado de pestaña).
* **Acción correctiva:** Comprimir o redimensionar la imagen PNG mediante una herramienta de optimización gráfica para reducir su peso por debajo de los límites autorizados (máximo 1.024 KB para el logo y 512 KB para el ícono, conservando unas dimensiones recomendadas mínimas de 64 × 64 px para el ícono).

> **[Captura: Alerta Imagen Pesa Demasiado]**
> *Aviso de advertencia flotante por exceso de tamaño en la carga de recursos de identidad visual.*
>
> **[Captura: Alerta Imagen Pesa Demasiado (Móvil)]**
> *Alerta de imagen que pesa demasiado adaptada a pantalla móvil. (Móvil).*

##### 3. Advertencia de "Poco contraste" en Colores de Botones o Etiquetas
* **Situación:** Al ajustar el color de fondo o de texto de un botón o etiqueta de acción, la fila respectiva muestra un ícono de advertencia con el mensaje: *«Poco contraste ([Ratio]:1)»* y un enlace asistido con la recomendación: *«Usar letra blanca»* o *«Usar letra azul oscuro»*.
* **Causa:** La combinación cromática elegida no alcanza la relación mínima de contraste de accesibilidad de 4,5:1 exigida por la normativa técnica WCAG AA, lo que provocaría dificultades de lectura para los usuarios.
* **Acción correctiva:**
  1. Hacer clic directamente en el texto interactivo asistido (**«Usar letra blanca»** o **«Usar letra azul oscuro»**) para que el sistema aplique automáticamente el tono de texto legible sugerido y alcance una relación óptima.
  2. Modificar alternativamente el color de fondo con el selector de color hasta que el indicador cambie al estado favorable: *«Se lee bien ([Ratio]:1)»*.

> **[Captura: Advertencia de Poco Contraste y Corrección Asistida]**
> *Fila de configuración de color exhibiendo el indicador de poco contraste y el botón asistido para corregir la legibilidad.*
>
> **[Captura: Advertencia de Poco Contraste y Corrección Asistida (Móvil)]**
> *Aviso de poco contraste y opción de corrección asistida en vista táctil móvil. (Móvil).*

##### 4. Cambios Pendientes sin Guardar y Reversión
* **Situación:** En la cabecera del acordeón se visualiza el indicador *«[N] sin guardar»*, la fila del elemento muestra la etiqueta *«Sin guardar»*, y los botones de acción inferior permanecen activos esperando confirmación.
* **Causa:** Se modificaron colores en la vista previa interactiva, pero no se ha invocado la persistencia en el servidor. Si el funcionario sale del módulo sin guardar, las personalizaciones se perderán.
* **Acción correctiva:**
  * **Confirmar cambios:** Presionar el botón **«Guardar colores de las etiquetas»** o **«Guardar colores de los botones»** para asentar las configuraciones en la base de datos de manera definitiva.
  * **Descartar ajustes no guardados:** Hacer clic en el botón plano **«Descartar cambios»** para regresar a la última paleta guardada.
  * **Restaurar paleta de fábrica:** Hacer clic en **«Volver a los de fábrica»** para reinstaurar los colores originales predeterminados del sistema.

> **[Captura: Indicador de Cambios Sin Guardar en Colores]**
> *Acordeón de colores destacando elementos pendientes de guardar y botones de confirmación y descarte.*
>
> **[Captura: Indicador de Cambios Sin Guardar en Colores (Móvil)]**
> *Gestión de cambios sin guardar y botones de acción en dispositivo móvil. (Móvil).*

##### 5. Efecto de Bloque Blanco en Modo Oscuro
* **Situación:** Al activar el tema oscuro en el panel administrativo, el logotipo cargado se visualiza como un recuadro o bloque blanco sólido que opaca los detalles del diseño.
* **Causa:** El archivo PNG subido contiene un fondo blanco o coloreado propio (no es transparente). Al encontrarse encendido el interruptor *«Pasar a blanco en modo oscuro»*, la plataforma aplica una conversión de brillo total a la imagen completa, tornando todo el lienzo en blanco.
* **Acción correctiva:**
  1. Apagar el interruptor *«Pasar a blanco en modo oscuro»* para que el logotipo mantenga sus colores e ilustraciones originales en tema oscuro.
  2. Para aprovechar el pase automático a blanco en fondos oscuros sin crear bloques, cargar una versión del logotipo que posea fondo transparente (canal alfa).

> **[Captura: Interruptor Blanco en Modo Oscuro]**
> *Interruptor «Pasar a blanco en modo oscuro» con su texto explicativo sobre imágenes con fondo propio.*
>
> **[Captura: Interruptor Blanco en Modo Oscuro (Móvil)]**
> *Control de blanco en modo oscuro en pantalla móvil. (Móvil).*

##### 6. Alcance Local de la Preferencia de Sonido de Avisos
* **Situación:** El funcionario desactiva el interruptor *«Sonido de los avisos»* en su computador de trabajo, pero al iniciar sesión en un dispositivo móvil o en otro navegador, los avisos emergentes vuelven a emitir sonido audible.
* **Causa:** La preferencia de sonido se guarda de manera exclusiva en la configuración local del navegador específico en uso, permitiendo que cada usuario configure la experiencia auditiva de su equipo de trabajo sin alterar la configuración de los demás usuarios del sistema.
* **Acción correctiva:** Configurar el interruptor en cada navegador o terminal desde donde opere el funcionario. Para comprobar el volumen y funcionamiento del sonido sin esperar alertas reales del sistema, hacer clic en cualquiera de los botones de prueba (**«Éxito»**, **«Advertencia»** y **«Error»**).

> **[Captura: Configuración - Preferencia de Sonido de Avisos]**
> *Bloque de sonido de los avisos con interruptor de activación local y botones interactivos para reproducción de muestras.*
>
> **[Captura: Configuración - Preferencia de Sonido de Avisos (Móvil)]**
> *Preferencia de sonido de los avisos en dispositivo móvil. (Móvil).*

---

### 3.5.2. Preguntas Frecuentes

#### 3.5.2.1. Problemas de acceso por bloqueo
**Situación:** El sistema bloquea el acceso temporalmente impidiendo iniciar sesión o restablecer credenciales.
**Posibles causas y reglas de seguridad aplicadas:**
1. **Bloqueo por intentos fallidos de inicio de sesión (Login):** Se ingresó una contraseña errónea **5 veces consecutivas**. El sistema activa un bloqueo temporal sobre la cuenta de **15 minutos**.
2. **Bloqueo por preguntas de seguridad (Recuperación de contraseña):** Se fallaron las respuestas de seguridad **3 veces consecutivas**. El sistema activa un bloqueo de seguridad sobre la cuenta de **30 minutos**.
3. **Límite perimetral de peticiones (*Rate Limiting*):** Se realizaron demasiadas solicitudes seguidas desde la misma dirección IP o correo en una ventana corta de tiempo (ej. más de 10 peticiones de login o más de 5 verificaciones de preguntas en 15 minutos).
*(Nota: Un **bloqueo temporal** difiere de una cuenta **inactiva o suspendida**. El bloqueo expira por tiempo o se desbloquea en el panel; una cuenta inactiva o caducada por fecha de vigencia requiere activación y ampliación de fecha por parte del Administrador).*
**Acción:** 
* Si el bloqueo se originó por contraseña en el login, esperar **15 minutos** para su desbloqueo automático.
* Si el bloqueo se produjo en las preguntas de seguridad, esperar **30 minutos** para el desbloqueo automático.
* En situaciones urgentes, comunicarse con el Administrador de la plataforma para que ejecute el desbloqueo manual inmediato desde la tabla de usuarios del Panel Administrativo.

#### 3.5.2.2. Visibilidad de páginas editadas
**Situación:** La página recién editada no es visible en el portal público.
**Posible causa:** La página se encuentra en estado de borrador y no ha completado el flujo de revisión.
**Acción:** El editor debe enviar la página a revisión y esperar a que el Administrador la apruebe definitivamente para su publicación.

#### 3.5.2.3. Bloqueo al intentar eliminar páginas
**Situación:** El sistema no muestra la opción o presenta el mensaje de advertencia *«Página en uso en la navegación»* (o *«Página en uso en el portal»*) bloqueando el borrado de una página.
**Posible causa:** Se está intentando retirar una ruta fija protegida del sistema (como las interfaces de inicio de sesión o áreas de gestión), o bien la página seleccionada cuenta con enlaces activos en el menú principal o en botones de otras secciones del portal.
**Acción:** 
* Las rutas fijas del sistema están protegidas permanentemente y no son eliminables.
* Si se trata de una página de contenido, seguir la guía paso a paso que presenta el propio mensaje de advertencia:
  1. Acceder a **«Editar Menú y pie»** o a la página específica indicada donde reside el enlace.
  2. Localizar en el editor el componente que contiene el botón con el enlace a la página.
  3. Borrar el enlace asignado en la configuración del componente y guardar los cambios.
  4. Regresar a la página y abrir de nuevo la opción **«Eliminar página»** para confirmar la operación escribiendo su nombre exacto.
* Si la página se encuentra publicada, tener presente la advertencia en pantalla: una vez confirmada la eliminación, su contenido dejará de estar visible de inmediato para el público.

#### 3.5.2.4. Imposibilidad de crear nuevas secciones
**Situación:** Un editor no encuentra o no puede usar la opción para crear páginas nuevas.
**Posible causa:** Al usuario se le asignó un "Rol derivado de Editor" que no tiene activado el permiso manual de "Crear secciones".
**Acción:** El usuario debe solicitar al Administrador del sistema la activación de dicho permiso en el Panel Administrativo.

#### 3.5.2.5. Inicio de sesión y credenciales entre Sitio Web e Intranet
**Situación:** Un funcionario tiene dudas sobre si necesita dos contraseñas distintas o por qué debe volver a iniciar sesión al pasar del Sitio Web a la Intranet.
**Aclaración de la plataforma:**
* **Mismas credenciales:** La cuenta de usuario es centralizada y única en todo el sistema. El correo `@sena.edu.co` y la contraseña son exactamente los mismos para ambos portales.
* **Sesiones independientes:** Cada portal opera como un entorno web protegido por separado. Por ello, iniciar sesión en el Sitio Web no abre la sesión en la Intranet (ni viceversa); el usuario debe ingresar sus mismas credenciales en el formulario de acceso de cada portal cuando desee utilizarlo.

#### 3.5.2.6. Mensaje de alerta «No pudimos cargar...» con botón «Reintentar» en los módulos del panel
**Situación:** Al ingresar a cualquier módulo de gestión del Panel Administrativo (como Usuarios, Roles, Auditoría, Páginas en revisión o Respaldos), no se visualizan los botones de acción principal (como «Crear Usuario», «Nuevo Editor» o «Depurar»), las herramientas de búsqueda, los filtros ni la tabla de datos, mostrándose en su lugar un recuadro de aviso que indica que no fue posible cargar la información.
**Posible causa:** Demora temporal o interrupción en la comunicación con el servicio central de datos, atribuible a intermitencias en la conexión de red del usuario o a procesos de reinicio del sistema.
**Acción:** 
1. Aguardar breves instantes y presionar directamente el botón **«Reintentar»** incorporado en el recuadro de aviso. El sistema reanudará la consulta de datos de inmediato sin necesidad de recargar la página web ni abandonar la sección de trabajo.
2. Al reanudarse la comunicación con éxito, el mensaje se retira automáticamente y la pantalla recupera de inmediato sus controles habituales (botones de acción, buscadores, filtros y registros).
3. Si tras varios intentos la situación persiste, verificar la conectividad de red de la estación de trabajo o comunicarse con el equipo técnico de soporte.

