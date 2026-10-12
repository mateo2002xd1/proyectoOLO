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

Define lo que el usuario necesita tener o saber listo antes de poder utilizar la aplicación: requerimientos técnicos y de conectividad, credenciales institucionales, asignación de roles y permisos, y los mecanismos de acceso a los portales del observatorio.

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
* **Contraseña robusta:** Debe satisfacer los 5 lineamientos de la política de seguridad de contraseñas de la plataforma:
  1. Longitud mínima de **12 caracteres**.
  2. Al menos una letra **mayúscula** (`A-Z`).
  3. Al menos una letra **minúscula** (`a-z`).
  4. Al menos un dígito **numérico** (`0-9`).
  5. Al menos un **carácter especial** o símbolo (`!@#$%^&*()_+-=[]{}|;:,.<>?`).
  *(El flujo de primer ingreso, la validación interactiva de credenciales y el procedimiento de recuperación se detallan en [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso) y [Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)).*

---

### 3.2.2. Roles y permisos

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los roles autorizados del OLO.

#### 3.2.2.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, realizar búsquedas mediante los componentes interactivos, consultar indicadores, reproducir contenidos en los visores de videos y acceder a documentos mediante los visores de PDFs o botones de descarga libre en formato PDF sin necesidad de iniciar sesión.
3. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con cuenta corporativa (`@sena.edu.co`) al Panel Administrativo, al editor visual de páginas o a la Intranet del OLO.

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
  * *Edición integral y gestión de páginas:* Accede al editor visual para maquetar directamente cualquier contenido en el Sitio Web o la Intranet, crear nuevas páginas y eliminar páginas dinámicas creadas por los editores (ver [Sección 3.4.3.2: Creación y Edición en el Lienzo](#3432-creación-y-edición-en-el-lienzo) y [Sección 3.4.3.4: Eliminación de Páginas Dinámicas](#3434-eliminación-de-páginas-dinámicas-paso-a-paso)).
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
  * *Maquetación interactiva con bloques:* Diseña y estructura contenidos directamente en el editor visual mediante su entorno de tres paneles: seleccionando bloques prediseñados del catálogo izquierdo (textos, imágenes, tarjetas de indicadores, carruseles, acordeones), arrastrándolos al lienzo central en tiempo real y personalizando sus propiedades en el panel lateral derecho (ver paso a paso en [Sección 3.4.3.2: Creación y Edición en el Lienzo](#3432-creación-y-edición-en-el-lienzo)).
  * *Cobertura total de edición:* Accede a la edición de cualquier página del portal o de la Intranet a través del botón flotante en pantalla (opción **"Editar página"**), disponiendo de permisos plenos sobre todos los contenidos existentes, sin importar qué editor los haya creado originalmente.
  * *Creación y eliminación de páginas dinámicas:* Gestiona páginas dinámicas desde el menú del botón flotante mediante las opciones **"Crear página"** (definiendo título y ruta URL) y **"Eliminar página"** (con validaciones de seguridad y protección contra enlaces rotos). (Ver paso a paso de creación en [Sección 3.4.3.2: Creación y Edición en el Lienzo](#3432-creación-y-edición-en-el-lienzo) y de eliminación en [Sección 3.4.3.4: Eliminación de Páginas Dinámicas](#3434-eliminación-de-páginas-dinámicas-paso-a-paso)).
  * *Flujo de trabajo mediante borradores:* Guarda su progreso de forma privada mediante el botón **"Guardar Borrador"** sin alterar el portal público, y traslada los cambios terminados mediante **"Enviar a revisión"** hacia la sección **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación final por parte del Administrador (ver paso a paso en [Sección 3.4.3.2: Creación y Edición en el Lienzo](#3432-creación-y-edición-en-el-lienzo)).

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

> [!IMPORTANT]
> **Regla de credenciales únicas e inicio de sesión independiente:**
> * **Credenciales idénticas para ambos portales:** Cada funcionario dispone de una **cuenta institucional única**. Su correo corporativo (`@sena.edu.co`) y su contraseña son exactamente los mismos para entrar tanto al **Sitio Web** como a la **Intranet**.
> * **Autenticación por separado en cada portal:** Las sesiones de usuario son independientes entre portales. Iniciar sesión en el Sitio Web **no** inicia sesión automáticamente en la Intranet (ni viceversa). Por lo tanto, si un funcionario necesita trabajar en ambos entornos, debe autenticarse en el formulario de acceso de cada portal por separado utilizando esas mismas credenciales.

#### 3.2.3.1. Sitio Web Público

##### 3.2.3.1.1. Portal Web Público (Cara visible)
El portal web público es la plataforma principal que refleja el trabajo del Observatorio Laboral y Ocupacional (OLO). Es un entorno dinámico y adaptable donde se publican las páginas maquetadas con diversos componentes interactivos (buscadores de ocupaciones, visores de videos, visores de documentos PDF, tarjetas de indicadores y enlaces de descarga). La apariencia y distribución de los contenidos varían según las prioridades informativas del observatorio. Aunque su contenido principal es público y consultado por la ciudadanía sin requerir autenticación, el personal administrativo y editorial utiliza este mismo entorno como punto de acceso al sistema.

##### 3.2.3.1.2. Inicio de Sesión en el Sitio Web Público (Banner GOV.CO)
El Sitio Web Público no cuenta con un botón directo de "Iniciar Sesión" para la ciudadanía, ya que la navegación por todos sus contenidos es totalmente libre y abierta. Para los funcionarios del SENA, la vía de entrada para autenticarse en el Sitio Web es el enlace interactivo ubicado en la franja azul superior del Estado:
* **Punto de acceso en el Sitio Web (Banner GOV.CO):** En la parte superior de la página, dentro de la franja azul de GOV.CO, se ubica a la derecha el reloj interactivo con la **fecha y hora en vivo**. Al hacer clic sobre este texto (identificado con el mensaje de ayuda *"Iniciar sesión"*), el sistema abre la pantalla de inicio de sesión.
* **Credenciales requeridas:**
  * Correo electrónico corporativo con dominio `@sena.edu.co`.
  * Contraseña robusta configurada en la plataforma.
* **Redirección por rol (Exclusivo para el Sitio Web Público):**
  * *Administradores:* Al contar con facultades de gobierno y permisos de administración, el sistema los redirige de manera directa al **Panel Administrativo** (`/admin/dashboard`).
  * *Editores (y roles derivados de Editor):* Al validar sus credenciales y permisos editoriales, el sistema los redirige de vuelta a la página de **Inicio del Sitio Web Público** (`/inicio`), donde se activa y despliega el botón flotante de edición para maquetar páginas y gestionar cabecera y pie.
  * *Directores y Subdirectores:* Al no contar con permisos de edición ni de acceso al panel administrativo en este portal, el sistema muestra la alerta *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolos a ingresar a la Intranet para consultar sus tableros analíticos e indicadores gerenciales.
* **Enlace de recuperación:** La pantalla de autenticación dispone del acceso directo para el restablecimiento de contraseñas ante olvidos *(¿Olvidaste tu contraseña?)*. *(Para consultar la guía visual paso a paso de este acceso, ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).*
* **Aviso de privacidad y protección de datos:** En la base del formulario se ubican los hipervínculos a la **política de privacidad y protección de datos**, los cuales permiten al usuario consultar el documento normativo institucional (`/politica-de-privacidad`) antes de ingresar al sistema.

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
* **Cuenta única y sincronización de clave:** Al tratarse de un usuario institucional único y compartido entre ambas plataformas, recuperar o actualizar la contraseña desde cualquiera de los dos portales sincroniza de forma automática e inmediata el acceso en ambos.
* **Política de seguridad:** Una vez validadas con éxito las respuestas correspondientes, el usuario puede establecer de inmediato una nueva contraseña que satisfaga los lineamientos de seguridad de la plataforma (longitud mínima de 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Guía operativa paso a paso:** Para consultar el procedimiento interactivo en pantalla con las capturas de cada paso, remitirse a la **[Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)**.

#### 3.2.3.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet. El procedimiento operativo paso a paso y la interfaz para llevar a cabo esta labor se explican a detalle en la **[Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)** de este manual.

#### 3.2.3.5. Primer Ingreso al Sistema (Configuración Inicial de la Cuenta)

Cuando el Administrador crea una cuenta nueva, el funcionario debe completar obligatoriamente la configuración inicial de seguridad antes de poder operar en la plataforma.

##### 3.2.3.5.1. Recepción de Credenciales Iniciales

Al crear la cuenta (cuyo procedimiento paso a paso se detalla en la [Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)), el Administrador establece una **contraseña temporal** y la comunica de forma manual al funcionario a través del canal corporativo que considere apropiado (correo electrónico, mensaje de chat interno u otro medio). **El sistema no envía ningún correo automático de bienvenida.** La contraseña temporal no tiene fecha de expiración: permanece activa hasta que el funcionario la use para completar su primer ingreso.

Al acceder por primera vez con estas credenciales provisorias, el sistema solicita de manera obligatoria al funcionario completar la configuración inicial de seguridad:
* **Establecimiento de contraseña definitiva:** Registro de una clave personal e intransferible que cumpla con los 5 requisitos de la política de contraseñas robustas (ver [Sección 3.2.1.3: Requisitos de Credenciales](#3213-requisitos-de-credenciales-y-cuentas-de-acceso)).
* **Parametrización de preguntas de seguridad:** Selección y respuesta obligatoria de tres preguntas que habilitan el mecanismo autónomo de recuperación de cuenta ante eventuales bloqueos u olvidos.

El procedimiento se efectúa según el portal de acceso utilizado por el funcionario (Sitio Web Público o Intranet del OLO). Una vez validados estos datos, el sistema guarda la configuración definitiva y concede el acceso formal al portal o sección correspondiente según el rol asignado. *(Para consultar la guía visual paso a paso con las capturas de pantalla de este procedimiento para ambos ámbitos, ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).*

#### 3.2.3.6. Cierre de Sesión y Expiración Preventiva

El cierre de sesión seguro es una práctica obligatoria para salvaguardar la privacidad de las cuentas y proteger la información del observatorio, especialmente al operar en estaciones de trabajo compartidas o redes abiertas:
* **Cierre de sesión en el Panel Administrativo:** Los administradores finalizan su sesión activa mediante el menú desplegable de perfil, ubicado en la parte inferior del menú lateral izquierdo en computadores o en la barra superior en dispositivos móviles, seleccionando la opción **"Cerrar sesión"**.
* **Cierre de sesión en el Sitio Web Público:** Los usuarios con permisos de edición disponen de un botón flotante de salida ubicado en la esquina inferior derecha de la pantalla, justo debajo del botón de edición (ícono de lápiz). Al presionarlo, el sistema despliega una ventana de confirmación (*"¿Cerrar sesión?"*); tras confirmar, se cierra la sesión, desaparecen los controles de edición y la página regresa a la vista de consulta ciudadana habitual.
* **Cierre de sesión en la Intranet:** Opera de manera diferenciada según las funciones del rol asignado:
  * *Usuarios con permisos de edición (Administrador o Editor):* Cierran sesión desde el botón flotante ubicado en la esquina inferior derecha (justo debajo del botón de lápiz), el cual abre una ventana de confirmación (*"¿Cerrar sesión?"*). En este caso, el botón de salida de la barra superior se oculta automáticamente.
  * *Usuarios de solo consulta sin permisos de edición (como Director o Subdirector):* No visualizan controles flotantes en pantalla; en su lugar, utilizan el botón **"Cerrar sesión"** ubicado en el extremo derecho de la barra superior de navegación.
* **Expiración preventiva por inactividad:** Como salvaguarda de seguridad institucional, toda sesión expira de forma automática tras **15 minutos** continuos sin interacción, protegiendo las estaciones de trabajo desatendidas.

*(Para consultar la guía visual paso a paso con las capturas de pantalla del cierre de sesión, ver [Sección 3.4.1.4: Procedimiento de Cierre de Sesión](#3414-procedimiento-de-cierre-de-sesión)).*

---

## 3.3. Guía de navegación e interfaz general.

Familiariza al usuario con el diseño gráfico, los componentes estructurales fijos, los botones estandarizados de acción y las convenciones visuales del sistema de notificaciones y alertas de la plataforma.

---

### 3.3.1. Interfaz General y Menús

La plataforma del Observatorio Laboral y Ocupacional (OLO) articula su experiencia de navegación y administración mediante una clara diferenciación entre las **páginas y controles fijos del sistema**, los **componentes ajustables de cabecera y pie** y el **área central de contenido dinámico maquetable**. Esta sección detalla la disposición visual en los tres portales del ecosistema (**Panel Administrativo**, **Sitio Web Público** e **Intranet**), aclarando qué elementos son estructuralmente fijos, cómo operan los componentes configurables en el editor visual y bajo qué reglas se despliega el botón de edición.

#### 3.3.1.1. Estructura y Elementos del Sistema en los Tres Portales

El sistema se compone de tres portales complementarios, cada uno con propósitos y características de interfaz claramente definidos:

1. **Panel Administrativo (`/admin`):**
   * **Propósito:** Entorno privado de gestión técnica, auditoría y control editorial de acceso exclusivo para el rol de Administrador.
   * **Estructura fija del aplicativo:** A diferencia de las páginas de contenido, el Panel Administrativo **no utiliza el editor visual para sus propias pantallas**. Todas sus vistas están programadas como páginas fijas para garantizar la seguridad transaccional y la inmutabilidad de sus funciones de gobierno.
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
     * *Franja superior GOV.CO (Fecha y hora en vivo):* Barra azul fija superior donde se ubica el texto interactivo de fecha y hora, que sirve como punto de acceso para que el personal administrativo y editorial inicie sesión (`/login`) en el portal.
     * *Botón de Búsqueda (Buscador Global):* Control fijo e inamovible ubicado en la zona superior, diseñado para consultar en tiempo real ocupaciones, publicaciones y páginas de todo el observatorio sin depender de la maquetación de la página.
     * *Botón de Acceso a la Intranet:* Enlace fijo permanente ubicado en la esquina superior derecha del menú de navegación hacia el portal privado independiente de la Intranet del OLO.
     * *Páginas fijas del aplicativo:* Interfaces programadas de autenticación (`/login`, `/recuperar-password`) y pantallas de primer ingreso (`/first-login`), las cuales no forman parte de las páginas dinámicas y no pueden ser alteradas ni eliminadas desde el editor.
   * **Componentes ajustables de Cabecera y Pie de página:**
     * Tanto la cabecera como el pie de página funcionan mediante componentes maquetables del editor visual: los editores autorizados (a través de la opción de plantilla "Menú y pie") pueden personalizar los enlaces del menú, logos, redes y textos informativos. Estos componentes son flexibles y ajustables, pudiendo adaptarse a las necesidades informativas de la plataforma o configurarse según el diseño requerido.
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
  * El botón flotante **no se muestra en pantalla** para los visitantes. La página pública se presenta completamente limpia, sin barras ni herramientas de edición, garantizando una lectura despejada y cómoda para la ciudadanía.

> **[Captura: Vista Ciudadana sin Botón Flotante]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla.*
>
> **[Captura: Vista Ciudadana sin Botón Flotante (Móvil)]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla. (Móvil).*

* **Caso 2: Usuario autenticado con rol de Administrador o Editor (y roles hijos autorizados):**
  * Si el funcionario cuenta con sesión activa y permisos administrativos o editoriales, el sistema despliega el botón circular flotante en la esquina inferior de la pantalla. Al hacer clic o pasar el cursor, el botón despliega exclusivamente las opciones para las que el usuario está autorizado:
    * **"Editar sección":** Aparece si el usuario es Administrador o tiene asignado el permiso para editar esa página específica (del Sitio Web o de la Intranet).
    * **"Menú y pie":** Se activa si el usuario es Administrador o si el rol posee el permiso explícito para editar la cabecera y el pie de página de la plantilla en el editor visual.
    * **"Nueva página":** Disponible si el usuario es Administrador o cuenta con la facultad de crear nuevas páginas en el sistema.
    * **"Eliminar página":** Se visualiza exclusivamente en páginas dinámicas creadas por usuarios, siempre que el usuario sea Administrador o que su rol tenga el permiso de borrado y la página no posea enlaces activos que generen enlaces rotos.
  * **Regla de restricción por página:** Si un editor con un rol personalizado navega por una página para la cual no tiene permisos asignados, las opciones no autorizadas no estarán visibles; si no tiene permisos para ninguna acción en dicha página, el botón flotante completo se oculta automáticamente.

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

#### 3.3.2.1. Estandarización de Botones y Controles de Acción

Todas las interfaces del Panel Administrativo y del Editor Visual comparten un patrón estandarizado de controles para brindar una experiencia consistente y prevenir pérdidas accidentales de información:
* **Controles de confirmación y guardado:** Botones destacados (color corporativo o verde) para guardar borradores en edición o avanzar versiones hacia la bandeja de revisión.
* **Controles de previsualización:** Botones identificados con ícono de ojo para verificar el resultado final de la página antes de someterla a aprobación.
* **Controles destructivos o de descarte:** Botones en color rojo (ícono de papelera o basurero) utilizados para borrar páginas dinámicas o descartar borradores en revisión. Todo control destructivo requiere obligatoriamente una ventana modal de confirmación secundaria y el ingreso de una justificación para la auditoría técnica.

> **[Captura: Botones Estandarizados]**
> *Conjunto de botones estandarizados de la plataforma: guardado, descarte/eliminación con confirmación modal y previsualización.*
>
> **[Captura: Botones Estandarizados (Móvil)]**
> *Conjunto de botones estandarizados de la plataforma: guardado, descarte/eliminación con confirmación modal y previsualización. (Móvil).*

---

### 3.3.3. Mensajes del Sistema y Notificaciones

La plataforma del Observatorio Laboral y Ocupacional (OLO) implementa un sistema unificado y consistente de retroalimentación visual, alertas y notificaciones en pantalla. Su función principal es guiar la experiencia del usuario, advertir sobre condiciones de riesgo, prevenir inconsistencias o pérdidas de información y confirmar el resultado de cada acción en tiempo real.

Esta sección presenta las convenciones visuales, formatos de notificación y código cromático adoptados en los tres entornos del sistema (**Sitio Web Público**, **Intranet** y **Panel Administrativo**), sirviendo como marco de referencia para identificar e interpretar adecuadamente los mensajes durante los procedimientos descritos en la [Sección 3.4: Funcionalidades](#34-funcionalidades).

#### 3.3.3.1. Tipos y Formatos de Notificaciones en Pantalla

El sistema clasifica sus avisos e interacciones en cinco formatos principales según su nivel de criticidad e impacto en el flujo operativo:

1. **Notificaciones Flotantes (Toasts):**
   * **Descripción y ubicación:** Mensajes compactos y dinámicos que se despliegan en la esquina superior o inferior derecha de la pantalla.
   * **Comportamiento:** Permanecen visibles entre 3 y 5 segundos y se desvanecen automáticamente sin interrumpir la labor del funcionario. Opcionalmente, cuentan con un control de cierre rápido ("✕").
   * **Propósito:** Confirmar la finalización correcta de operaciones no destructivas (por ejemplo: *"Borrador guardado exitosamente"*, *"Carga de archivo completada"* o *"Enlace copiado"*).

2. **Alertas en Línea (Validación de Formularios):**
   * **Descripción y ubicación:** Textos contextuales breves que emergen inmediatamente debajo del campo de captura correspondiente (casillas de correo, contraseñas, selectores, campos de texto).
   * **Comportamiento:** Se activan en tiempo real al perder el foco del campo (*on blur*) o al presionar el botón de envío del formulario si los datos no cumplen con las reglas establecidas. Persisten hasta que el usuario corrija el dato ingresado.
   * **Propósito:** Señalar errores puntuales de formato (por ejemplo: correo no perteneciente al dominio `@sena.edu.co`, longitud de contraseña menor a 8 caracteres, ausencia de caracteres especiales o falta de coincidencia entre claves).

3. **Banners y Recuadros Destacados (Alertas en Bloque):**
   * **Descripción y ubicación:** Contenedores rectangulares con fondo coloreado y borde distintivo ubicados en la parte superior del formulario, en el encabezado de la página o como tarjeta principal de aviso.
   * **Comportamiento:** Permanecen fijos en la interfaz mientras persista la situación que los originó. No desaparecen de forma automática.
   * **Propósito:** Comunicar advertencias estructurales, restricciones de acceso por permisos no concedidos o bloqueos de seguridad (por ejemplo: *"Tu cuenta no tiene permisos de edición ni de acceso al panel"*, *"No tienes permisos para ingresar a la intranet"* o *"Cuenta bloqueada temporalmente por exceso de intentos"*).

4. **Ventanas Modales de Diálogo y Confirmación:**
   * **Descripción y ubicación:** Cuadros de diálogo emergentes centrados en pantalla con oscurecimiento y bloqueo del fondo (*focus trap*).
   * **Comportamiento:** Detienen toda interacción con la página hasta que el usuario elija expresamente una acción (**"Confirmar"**, **"Aceptar"** o **"Cancelar"**).
   * **Propósito:** Salvaguardar al usuario de acciones irreversibles o destructivas (por ejemplo: confirmar la eliminación de un rol, justificar el rechazo de una página en revisión mediante un motivo obligatorio, o alertar sobre la imposibilidad de eliminar una página que posee enlaces activos en menús o contenidos).

5. **Indicadores Numéricos y Centro de Notificaciones:**
   * **Descripción y ubicación:** Círculos rojos con un contador numérico superpuestos al ícono de una campana interactiva y junto a elementos específicos del menú lateral (como la opción *"Páginas en revisión"*).
   * **Comportamiento:** Se actualizan automáticamente de fondo. Al hacer clic sobre el ícono de la campana, se despliega la ventana del Centro de Notificaciones listando en detalle cada aviso pendiente. Desde allí, el administrador puede ir directamente al origen del aviso o descartarlo marcándolo como resuelto.
   * **Propósito:** Alertar de forma proactiva y no intrusiva sobre tareas administrativas que requieren atención (por ejemplo: advertir sobre cuentas de usuario que están próximas a caducar o notificar la llegada de nuevos borradores que esperan aprobación editorial).

#### 3.3.3.2. Código Cromático y Convenciones Visuales

La plataforma emplea una paleta estandarizada de colores e iconografía institucional para que el usuario identifique instantáneamente la naturaleza y gravedad del aviso:

| Tono / Color | Severidad | Ícono Asociado | Significado y Contexto de Uso |
| :--- | :--- | :---: | :--- |
| **Verde** | **Éxito (Success)** | Check en círculo (✓) | Operación procesada de manera correcta. Se presenta al guardar borradores, publicar páginas aprobadas, actualizar contraseñas o culminar cargas masivas. |
| **Rojo** | **Error / Restricción (Danger / Error)** | Cruz o exclamación en círculo (✕ / ⨂) | Error crítico, datos no válidos, autenticación fallida, permisos insuficientes o bloqueo por protección contra enlaces rotos. |
| **Amarillo / Ámbar** | **Advertencia (Warning)** | Triángulo de precaución (⚠) | Situación que demanda atención o cautela del usuario para prevenir pérdidas de información, como sesiones inactivas próximas a expirar o confirmación previa a la eliminación de registros. |
| **Azul** | **Informativo (Info)** | Círculo con letra "i" (ℹ) | Instrucciones de apoyo, estados en espera, guías de diligenciamiento o aclaraciones operativas sobre el funcionamiento de un módulo. |

> **[Captura: Tipos de Alertas y Notificaciones en Pantalla]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante (toast), mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal de confirmación.*
>
> **[Captura: Tipos de Alertas y Notificaciones en Pantalla (Móvil)]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante (toast), mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal de confirmación. (Móvil).*

---

> [!NOTE]
> **Consulta de Errores Específicos y Catálogo de Validaciones:**
> Para consultar el desglose detallado de validaciones campo a campo, los mensajes de error específicos de cada formulario, sus causas técnicas y las instrucciones de solución paso a paso, remitirse a la [Sección 3.5.1: Catálogo de Validaciones y Solución de Problemas](#351-catálogo-de-validaciones-y-solución-de-problemas).

---

## 3.4. Funcionalidades

Paso a paso de las operaciones y flujos de trabajo de la plataforma: autenticación, búsquedas y filtros, gestión integral de información (CRUD), generación de reportes en pantalla, exportación de datos y demas procesos existentes en el aplicativo.

---

### 3.4.1. Procedimientos de Autenticación y Acceso

Paso a paso de las cuatro operaciones fundamentales de acceso y salida de la plataforma: primer ingreso para cuentas nuevas, inicio de sesión habitual, recuperación autónoma de contraseña olvidada mediante preguntas de seguridad y procedimiento de cierre de sesión seguro en todos los entornos.

#### 3.4.1.1. Flujo de Primer Ingreso

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema asociadas a este proceso con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.1: Validaciones en el Primer Ingreso](#3511-validaciones-en-el-primer-ingreso)).*

Cuando el Administrador crea una cuenta de usuario en la plataforma (procedimiento detallado paso a paso en la [Sección 3.4.2.4.1: Submenú Usuarios](#34241-submenú-usuarios)), el sistema genera una **contraseña temporal provisoria**. Dado que la plataforma no envía correos automáticos ni notificaciones de bienvenida, el Administrador es el responsable de hacer llegar al nuevo funcionario, a través del canal o medio de comunicación que considere más conveniente (correo del SENA, chat interno, mensajería u otro medio), tanto el **correo corporativo registrado** como dicha **contraseña temporal**. Todo funcionario nuevo del SENA (Administradores, Editores de Contenido y Directores o Subdirectores) debe realizar de manera obligatoria esta configuración inicial por única vez antes de poder operar normalmente en el aplicativo.

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

3. **Pantalla de bienvenida y configuración obligatoria:** Al comprobar los datos de acceso, el sistema identifica que se trata del primer ingreso del funcionario y presenta de forma automática la pantalla de primer ingreso (`/first-login`). En esta vista se solicita actualizar la seguridad de la cuenta antes de continuar hacia el portal. A un lado (arriba en el móvil y la tablet) se indica qué se pide en cada paso; al otro lado está el formulario. Como el inicio de sesión y la recuperación de contraseña, en el móvil y la tablet va sobre fondo blanco; en el computador, el logo y lo que se pide quedan a la izquierda sobre blanco y el formulario a la derecha, sobre el azul institucional.

> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web]**
> *Pantalla de primer ingreso en el Sitio Web con la indicación del paso y el formulario de actualización de seguridad.*
>
> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web (Móvil)]**
> *Pantalla de primer ingreso en el Sitio Web con la indicación del paso y el formulario de actualización de seguridad. (Móvil).*

4. **Establecimiento de la contraseña definitiva (paso 1, «Actualiza tu seguridad»):** En la pantalla de cambio de clave, el funcionario debe registrar su nueva contraseña personal:
   * En el campo **"Contraseña temporal"**, se digita la clave provisoria recibida.
   * En el campo **"Nueva contraseña"**, se escribe la nueva clave personal. Al entrar en este campo aparece la lista de requisitos de la política (mínimo 12 caracteres, combinar 3 de 4 opciones: mayúsculas, minúsculas, números o símbolos, sin emojis ni tabulaciones, y no demasiado larga), que se van marcando a medida que se cumplen; cuando se cumplen todos, la lista se resume en una línea: **"Cumple todos los requisitos"**.
   * En el campo **"Ingresa nuevamente la contraseña"**, se reescribe la nueva clave para certificar la coincidencia exacta.
   * El ícono del ojo muestra u oculta lo escrito en cada campo: cerrado mientras la clave está oculta, abierto cuando se ve.
   * Se hace clic en el botón oscuro **"Continuar"**, que revisa los tres campos y pasa al paso 2. Si algo falta o no coincide, lo indica debajo del campo.

> **[Captura: Contraseña Definitiva Sitio Web]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web.*
>
> **[Captura: Contraseña Definitiva Sitio Web (Móvil)]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web. (Móvil).*

5. **Configuración de preguntas de seguridad (paso 2):** En la pantalla "Protege el acceso a tu cuenta", se deben configurar obligatoriamente las tres preguntas de seguridad, una a la vez, bajo el encabezado **"Preguntas de seguridad"**; tres barras indican en cuál se va. Así se habilita la recuperación de la cuenta ante un posible olvido:
   * Se despliega el menú selector y se elige una pregunta de la lista predefinida del sistema. Una pregunta ya elegida no se puede repetir.
   * Se escribe la respuesta correspondiente en el campo de texto. La respuesta es confidencial; no distingue mayúsculas de minúsculas ni tiene en cuenta los espacios al principio o al final.
   * Se pulsa el botón **"Continuar"** para repetir la selección con la segunda y tercera pregunta del catálogo. En la tercera, el botón dice **"Guardar"**.
   * **"Atrás"** vuelve a la pregunta anterior. Para corregir la contraseña del paso 1 hay que salir con **"Regresar al sitio web del Observatorio"** y entrar otra vez con la contraseña temporal.

> **[Captura: Preguntas de Seguridad Sitio Web]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad Sitio Web (Móvil)]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos (paso 3):** Al procesar las respuestas de seguridad, el sistema guarda la configuración definitiva y muestra el mensaje de confirmación **"¡Configuración completada con éxito! Tu cuenta ya es segura."**, recordando guardar las respuestas en un lugar seguro, porque serán el único método para validar la identidad y cambiar la clave si se olvida. Al presionar el botón **"Iniciar sesión"**, el sistema finaliza la sesión provisional y regresa a la pantalla de inicio de sesión (`/login`). Si se quiere salir antes de terminar, **"Regresar al sitio web del Observatorio"** cierra la sesión temporal sin guardar nada. El funcionario debe iniciar sesión con su contraseña definitiva recién creada, tras lo cual el aplicativo evalúa los permisos específicos de su cuenta:
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

1. **Acceso a la Intranet:** El funcionario hace clic en el botón fijo **"Intranet"** ubicado en la esquina superior derecha de la cabecera del Sitio Web Público, o ingresa mediante la dirección web (URL) de la Intranet del OLO. Al tratarse de una plataforma privada que requiere autenticación, el sistema presenta la pantalla de acceso institucional (`/login`), estructurada en diseño dividido: a la izquierda, el panel de marca corporativo con el logotipo blanco institucional y el encabezado principal **INTRANET**; a la derecha, la tarjeta blanca con el formulario de credenciales y el enlace inferior de retorno al portal público.

> **[Captura: Acceso a la Intranet]**
> *Pantalla de acceso institucional de la Intranet del OLO con panel de marca a la izquierda ('INTRANET') y formulario en el panel derecho.*
>
> **[Captura: Acceso a la Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet del OLO con formulario en el panel derecho. (Móvil).*

2. **Ingreso con credenciales temporales:** En el formulario de la Intranet, se debe digitar el correo electrónico corporativo (`@sena.edu.co`) y la contraseña provisoria entregada por el Administrador. Luego, se debe presionar el botón principal **"Ingresar"** (o "Acceder a la Intranet").

> **[Captura: Formulario de Inicio de Sesión Intranet]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet.*
>
> **[Captura: Formulario de Inicio de Sesión Intranet (Móvil)]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet. (Móvil).*

3. **Bienvenida y pasos guiados de configuración:** Al verificar las credenciales temporales, el aplicativo reconoce que la cuenta requiere su configuración inicial y da paso a la pantalla de primer ingreso de la Intranet (`/first-login`). En esta vista se despliega un panel explicativo que indica qué se pide en cada paso (a la izquierda en el computador, arriba en el móvil) y el formulario.

> **[Captura: Pantalla de Pasos Guiados Intranet]**
> *Interfaz de primer ingreso de la Intranet con panel informativo izquierdo y formulario de configuración.*
>
> **[Captura: Pantalla de Pasos Guiados Intranet (Móvil)]**
> *Interfaz de primer ingreso de la Intranet con panel informativo y formulario de configuración. (Móvil).*

4. **Establecimiento de la contraseña definitiva:** En el formulario de cambio de clave, el usuario registra su nueva contraseña personal:
   * En el primer campo, se digita la clave provisoria en **"Contraseña temporal"**.
   * En el segundo campo, se escribe la **"Nueva contraseña"**. Al entrar en este campo aparece la lista de requisitos de la política (mínimo 12 caracteres, combinar 3 de 4 opciones: mayúsculas, minúsculas, números o símbolos, sin emojis ni tabulaciones, y no demasiado larga), que se van marcando en tiempo real; cuando se cumplen todos, la lista se resume en una línea: **"Cumple todos los requisitos"**.
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
   * Se presiona el botón **"Continuar"** para responder secuencialmente la segunda y tercera pregunta.
   * Al completar la tercera respuesta, el botón principal cambia a **"Guardar"**. Al pulsarlo, el sistema almacena de forma segura las tres preguntas y respuestas de recuperación.

> **[Captura: Preguntas de Seguridad Intranet]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet.*
>
> **[Captura: Preguntas de Seguridad Intranet (Móvil)]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet. (Móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:** La pantalla presenta la confirmación: **"¡Configuración completada con éxito! Tu cuenta ya es segura."**, recordando guardar las respuestas en un lugar seguro, porque serán el único método para validar la identidad y cambiar la clave si se olvida. Al hacer clic en el botón **"Iniciar sesión"**, el sistema cierra la sesión provisional y regresa al formulario de acceso de la Intranet (`/login`). El usuario debe ingresar sus nuevas credenciales definitivas, momento en el cual el sistema valida su identidad y los permisos asignados:
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

> [!NOTE]
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

2. **Visualización de la pantalla de inicio de sesión:** La pantalla presenta el logotipo institucional del observatorio con el título **"Panel de Administración"**, las casillas **"Correo SENA"** y **"Contraseña"**, el aviso de privacidad, el botón **"Ingresar"** y, debajo, el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"** para restablecer la clave en caso de pérdida. En el móvil y la tablet va sobre fondo blanco; en el computador, el logotipo y el título quedan a la izquierda sobre blanco y el formulario en una tarjeta a la derecha, sobre el azul institucional, como en el primer ingreso y la recuperación de contraseña.

> **[Captura: Formulario de Autenticación Sitio Web]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación.*
>
> **[Captura: Formulario de Autenticación Sitio Web (Móvil)]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación. (Móvil).*

3. **Diligenciamiento de correo y contraseña:** En el formulario de acceso, se completan ambas casillas:
   * En la casilla superior **"Correo SENA"**, se escribe la cuenta corporativa institucional (`@sena.edu.co`).
   * En la casilla inferior **"Contraseña"**, se escribe la clave definitiva personal. Se puede hacer clic sobre el **ícono de ojo** situado a la derecha de la casilla para ver u ocultar los caracteres escritos y confirmar que la escritura sea correcta: el ojo está cerrado mientras la clave está oculta y abierto cuando se ve.

> **[Captura: Credenciales Definitivas en Sitio Web]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión.*
>
> **[Captura: Credenciales Definitivas en Sitio Web (Móvil)]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión. (Móvil).*

4. **Clic en el botón Ingresar:** Se hace clic sobre el botón principal **"Ingresar"**. La interfaz muestra una breve animación de carga mientras procesa el acceso hacia el portal.

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
   * **Administradores:** La pantalla muestra el **Panel Administrativo** (`/admin/dashboard`), con el menú lateral de fondo oscuro a la izquierda (Usuarios, Roles, Auditoría y Revisión) y las tarjetas de resumen informativo en el centro.
   * **Editores de Contenido:** El navegador regresa a la portada del **Sitio Web Público** (`/inicio`), donde aparece de inmediato en la esquina inferior derecha el **botón flotante circular de edición** (ícono de lápiz) para comenzar a maquetar y modificar páginas autorizadas.

> **[Captura: Redirección y Despliegue de Rol Sitio Web]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores.*
>
> **[Captura: Redirección y Despliegue de Rol Sitio Web (Móvil)]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores. (Móvil).*

##### Inicio de Sesión Habitual en la Intranet del OLO

La Intranet es una plataforma privada e independiente del Sitio Web Público, concebida para el seguimiento gerencial, análisis de indicadores y trabajo interno. Su sistema de inicio de sesión es totalmente independiente:

*(Aclaración de acceso: Para ingresar a la Intranet se utiliza el **mismo correo institucional y la misma contraseña** configurados en el Sitio Web. No obstante, al tratarse de entornos separados, el usuario debe autenticarse directamente en la Intranet para habilitar su acceso privado, incluso si ya tenía una sesión iniciada en el Sitio Web).*

*(Nota: Si un nuevo funcionario (Administrador, Editor o Directivo) accede por primera vez con su contraseña temporal provisoria, el sistema activará de forma automática el flujo de primer ingreso descrito en [Primer Ingreso desde la Intranet del OLO](#primer-ingreso-desde-la-intranet-del-olo)).*

1. **Ubicación del botón de acceso a la Intranet:** Desde la página del Sitio Web Público, se hace clic sobre el botón destacado **"Intranet"** en la parte superior derecha de la cabecera, o bien se ingresa la dirección web oficial de la Intranet en el navegador.

> **[Captura: Botón Acceso Intranet en Cabecera]**
> *Botón 'Intranet' visible en la cabecera superior derecha del Sitio Web para dirigirse al entorno privado.*
>
> **[Captura: Botón Acceso Intranet en Cabecera (Móvil)]**
> *Botón 'Intranet' visible en la cabecera del Sitio Web para dirigirse al entorno privado. (Móvil).*

2. **Visualización de la pantalla institucional de acceso:** Al tratarse de un espacio privado, se despliega una pantalla dividida en dos áreas: a la izquierda, el panel corporativo institucional con el logotipo blanco del OLO y el título principal **INTRANET**; a la derecha, la tarjeta blanca flotante con el formulario de ingreso, el botón principal de acceso y el enlace exterior de retorno al sitio web.

> **[Captura: Pantalla Bloqueo Intranet]**
> *Pantalla de acceso de la Intranet con panel institucional a la izquierda ('INTRANET') y tarjeta de ingreso a la derecha.*
>
> **[Captura: Pantalla Bloqueo Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet con formulario de ingreso centrado en dispositivos móviles.*

3. **Diligenciamiento de credenciales en el formulario y aviso legal:** En la tarjeta de acceso, se completan los campos requeridos:
   * **Correo SENA:** Se digita la cuenta corporativa institucional (`@sena.edu.co`).
   * **Contraseña:** Se ingresa la clave personal definitiva. El usuario puede utilizar el botón interactivo con el **ícono de ojo** situado a la derecha del campo para alternar la visualización de los caracteres y verificar la escritura correcta.
   * **Vínculos de política de privacidad y protección de datos:** En la base del formulario, el sistema informa que el ingreso implica la aceptación de los lineamientos institucionales. Al pulsar sobre los enlaces destacados de *"política de privacidad"* o *"protección de datos"*, la plataforma traslada al usuario al documento normativo del Observatorio (`/politica-de-privacidad` en el portal público) para consultar las directivas de seguridad de la información y tratamiento de datos personales.

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
> *Mensaje informativo en pantalla confirmando el acceso o con alerta de falta de permiso institucional.*
>
> **[Captura: Verificación de Autorización en Intranet (Móvil)]**
> *Mensaje informativo en pantalla confirmando el acceso o con alerta de falta de permiso institucional. (Móvil).*

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

1. **Ubicación del enlace de recuperación en el Sitio Web:** En la pantalla de inicio de sesión del Sitio Web (`/login`), a la cual se accede mediante el texto interactivo de fecha y hora de la franja GOV.CO, se ubica en la parte inferior de la tarjeta central el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"**. Al hacer clic sobre él, el sistema traslada al usuario a la pantalla de recuperación (`/recovery`).

> **[Captura: Enlace de Recuperación en Sitio Web]**
> *Enlace '¿Olvidaste tu contraseña?' en la parte inferior del formulario de inicio de sesión del Sitio Web.*
>
> **[Captura: Enlace de Recuperación en Sitio Web (Móvil)]**
> *Enlace '¿Olvidaste tu contraseña?' en el formulario de inicio de sesión del Sitio Web. (Móvil).*

2. **Ingreso del correo corporativo institucional:** En la pantalla con el título *"Recupera el acceso a tu cuenta"*, se digita la cuenta de correo corporativo institucional (`@sena.edu.co`) en la casilla **"Ingresa tu correo SENA"** y se presiona el botón principal **"Comenzar"**. El sistema valida el formato del correo y comprueba si la cuenta dispone de preguntas de seguridad configuradas. El enlace **"Iniciar sesión"** bajo el botón regresa a la pantalla de acceso. En el móvil y la tablet esta pantalla y las siguientes van sobre fondo blanco; en el computador, el logo y el título quedan a la izquierda sobre blanco y el formulario a la derecha, sobre el azul institucional.

> **[Captura: Ingreso de Correo de Recuperación Sitio Web]**
> *Casilla de correo institucional diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web.*
>
> **[Captura: Ingreso de Correo de Recuperación Sitio Web (Móvil)]**
> *Casilla de correo institucional diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web. (Móvil).*

3. **Respuesta a las preguntas de seguridad:** En la pantalla *"Validación de identidad"*, la interfaz despliega una a una las tres preguntas de seguridad seleccionadas por el usuario durante su primer ingreso; el avance se indica con tres barras. Bajo **"Preguntas de seguridad"** se muestra la pregunta en un recuadro; se digita la respuesta en el campo **"Respuesta"** y se pulsa **"Continuar"**. La respuesta no distingue mayúsculas de minúsculas ni tiene en cuenta los espacios al principio o al final. Desde la segunda pregunta, **"Volver a la pregunta anterior"** permite corregir la anterior. Las tres se verifican juntas al final: si alguna no coincide, el sistema lo indica sin decir cuál y el cuestionario vuelve a empezar desde la primera pregunta.

> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web]**
> *Cuestionario presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web (Móvil)]**
> *Cuestionario presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web. (Móvil).*

4. **Establecimiento de la nueva contraseña:** Al validar satisfactoriamente las respuestas, la pantalla saluda por el nombre (*"¡Enhorabuena, [nombre]!"*) y, bajo **"Crea tu nueva contraseña"**, habilita los campos **"Nueva contraseña"** e **"Ingresa nuevamente la contraseña"**. Al entrar en el primero aparece la lista de requisitos de la política de seguridad, que se van marcando a medida que se cumplen y se resumen en **"Cumple todos los requisitos"** cuando se cumplen todos. El usuario digita su nueva clave personal y presiona el botón **"Guardar"**. El enlace **"Cancelar"**, debajo del botón, abandona el proceso sin cambiar la contraseña y vuelve al inicio de sesión.

> **[Captura: Restablecimiento de Contraseña Sitio Web]**
> *Formulario de ingreso de nueva contraseña con validador de requisitos de seguridad en el Sitio Web.*
>
> **[Captura: Restablecimiento de Contraseña Sitio Web (Móvil)]**
> *Formulario de ingreso de nueva contraseña con validador de requisitos de seguridad en el Sitio Web. (Móvil).*

5. **Confirmación de actualización y retorno al acceso:** La interfaz presenta la pantalla de confirmación exitosa con el mensaje: *"¡Genial, tu clave ha sido actualizada con éxito! Ya puedes ingresar a tu cuenta con tu nueva contraseña. ¡Tu seguridad es nuestra prioridad!"*. Al presionar el botón **"Iniciar sesión"**, el sistema redirige a la pantalla de acceso (`/login`) para ingresar con la nueva clave (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

> **[Captura: Confirmación de Clave Actualizada Sitio Web]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión.*
>
> **[Captura: Confirmación de Clave Actualizada Sitio Web (Móvil)]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión. (Móvil).*

##### Recuperación de Contraseña desde la Intranet del OLO

1. **Ubicación del enlace de recuperación en la Intranet:** En la pantalla institucional de acceso de la Intranet (`/login`), se ubica bajo el formulario de credenciales el enlace interactivo **"¿Olvidaste tu contraseña?"**. Al hacer clic sobre dicho enlace, la pantalla se traslada a la vista de recuperación de la Intranet (`/recovery`).

> **[Captura: Enlace de Recuperación en Intranet]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet.*
>
> **[Captura: Enlace de Recuperación en Intranet (Móvil)]**
> *Enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet. (Móvil).*

2. **Ingreso del correo corporativo institucional:** En la pantalla con el título *"Ingresa tu correo SENA"*, se digita la cuenta de correo corporativo institucional (`@sena.edu.co`) en la casilla correspondiente y se presiona el botón principal **"Comenzar"**. El sistema valida el formato del correo y comprueba si la cuenta dispone de preguntas de seguridad configuradas.

> **[Captura: Ingreso de Correo de Recuperación Intranet]**
> *Tarjeta de recuperación de la Intranet con el campo de correo institucional y botón 'Comenzar'.*
>
> **[Captura: Ingreso de Correo de Recuperación Intranet (Móvil)]**
> *Tarjeta de recuperación de la Intranet con el campo de correo institucional y botón 'Comenzar'. (Móvil).*

3. **Respuesta a las preguntas de seguridad:** En la pantalla *"Verifica tu identidad"*, la interfaz despliega una a una las tres preguntas de seguridad seleccionadas por el usuario durante su primer ingreso, indicando el avance mediante puntos indicadores. Se digita la respuesta confidencial correspondiente en el campo de texto y se pulsa el botón **"Siguiente"** (o **"Verificar"** en la última pregunta) para validar las respuestas. Por motivos de seguridad institucional, el sistema otorga un margen de hasta **3 intentos consecutivos**; si se fallan las respuestas 3 veces seguidas, la cuenta se bloquea automáticamente por **30 minutos**.

> **[Captura: Preguntas de Seguridad en Recuperación Intranet]**
> *Asistente guiado de preguntas de seguridad con indicador de avance mediante puntos de progreso en la Intranet.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Intranet (Móvil)]**
> *Asistente guiado de preguntas de seguridad con indicador de avance en la Intranet. (Móvil).*

4. **Establecimiento de la nueva contraseña:** Al validar satisfactoriamente las respuestas, la pantalla *"Crea tu nueva contraseña"* habilita los campos **"Nueva contraseña"** y **"Ingresa nuevamente la contraseña"**. El usuario digita su nueva clave personal verificando que cumpla con los requisitos de la política de seguridad institucional y presiona el botón **"Guardar contraseña"**. El enlace **"Cancelar"**, debajo del botón, abandona el proceso sin cambiar la contraseña y vuelve al inicio de sesión.

> **[Captura: Restablecimiento de Contraseña Intranet]**
> *Formulario de nueva contraseña con lista interactiva de requisitos y botón 'Guardar contraseña' en la Intranet.*
>
> **[Captura: Restablecimiento de Contraseña Intranet (Móvil)]**
> *Formulario de nueva contraseña con lista interactiva de requisitos en la Intranet. (Móvil).*

5. **Confirmación de actualización y retorno al acceso:** La interfaz presenta la pantalla de confirmación exitosa con la insignia de confirmación y el mensaje: *"Tu contraseña se actualizó. Ya puedes entrar a la intranet con tu nueva contraseña."*. Al presionar el botón **"Ir a iniciar sesión"**, el sistema redirige automáticamente a la pantalla de acceso de la Intranet (`/login`) para ingresar con la nueva clave (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

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

1. **Ubicación del control de salida flotante:** Mientras exista una sesión activa con privilegios de edición (roles de Administrador o Editor), en la esquina inferior derecha de la pantalla se visualiza el menú flotante de acciones. Justo debajo del botón principal de edición (ícono de lápiz), se encuentra permanentemente visible el **botón circular de salida** (con ícono de puerta y flecha, y texto indicativo *"Salir de modo edición"* al pasar el cursor).

> **[Captura: Botón Flotante de Salida en Sitio Web]**
> *Botón circular de salida situado justo debajo del botón del lápiz en la esquina inferior derecha del Sitio Web Público.*
>
> **[Captura: Botón Flotante de Salida en Sitio Web (Móvil)]**
> *Botón circular de salida situado justo debajo del botón del lápiz en la esquina inferior derecha del Sitio Web Público. (Móvil).*

2. **Confirmación de salida:** Al presionar el botón de salida, el sistema despliega una ventana de confirmación titulada **"¿Cerrar sesión?"** con dos opciones:
   * **Cancelar:** Cierra la ventana emergente y mantiene la sesión abierta.
   * **Cerrar sesión:** Confirma la salida del sistema y finaliza el modo de edición.

> **[Captura: Modal de Confirmación Cerrar Sesión Sitio Web]**
> *Ventana de confirmación '¿Cerrar sesión?' en el Sitio Web Público.*
>
> **[Captura: Modal de Confirmación Cerrar Sesión Sitio Web (Móvil)]**
> *Ventana de confirmación '¿Cerrar sesión?' en el Sitio Web Público. (Móvil).*

3. **Retorno a la vista pública:** Al confirmar la salida, el sistema finaliza la sesión activa, oculta los botones flotantes de edición y recarga la página en la vista ciudadana habitual.

> **[Captura: Vista estándar del Sitio Web (Sesión cerrada)]**
> *Pantalla recargada tras salir, mostrando la interfaz libre de controles flotantes de edición.*
>
> **[Captura: Vista estándar del Sitio Web (Móvil - Sesión cerrada)]**
> *Pantalla recargada tras salir, mostrando la interfaz libre de controles flotantes de edición. (Móvil).*

##### Cierre de Sesión desde la Intranet

La Intranet adapta el mecanismo de salida según los permisos del rol asignado:

* **Caso 1: Funcionarios con permisos de edición (Administradores y Editores):**
  1. **Ubicación del botón flotante:** El botón de salida de la barra superior se oculta automáticamente para mantener limpia la cabecera. El usuario utiliza el **botón circular flotante** situado en la esquina inferior derecha, justo debajo del botón de edición (ícono de lápiz).
  2. **Confirmación de salida:** Al presionar el botón flotante, el sistema abre la ventana de confirmación titulada **"¿Cerrar sesión?"** con dos opciones:
     * **Cancelar:** Cierra la ventana emergente y mantiene la sesión abierta.
     * **Cerrar sesión:** Confirma la salida del sistema.
  3. **Retorno al acceso:** Al confirmar, el sistema cierra la sesión y traslada al usuario a la pantalla de ingreso de la Intranet (`/login`).

> **[Captura: Botón Flotante y Modal de Confirmación en Intranet (Usuarios con edición)]**
> *Botón flotante inferior debajo del lápiz y ventana modal de confirmación '¿Cerrar sesión?' en la Intranet.*
>
> **[Captura: Botón Flotante y Modal de Confirmación en Intranet (Usuarios con edición - Móvil)]**
> *Botón flotante inferior debajo del lápiz y ventana modal de confirmación '¿Cerrar sesión?' en la Intranet. (Móvil).*

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
   * **Logo y Retorno al Sitio Web:** En la parte superior, el logotipo institucional del Observatorio Laboral y Ocupacional (OLO) está siempre visible. Al hacer clic sobre este ícono y título, actúa como un enlace directo que lleva al usuario de regreso a la página principal del sitio web público.
   * **Navegación Modular:** Presenta una lista de accesos directos a los módulos del sistema. El módulo activo en el que se encuentra el usuario se resalta visualmente (con texto y un borde en color verde, como se aprecia en el Dashboard). Los accesos incluyen el **Dashboard**, el grupo colapsable **Accesos** (identificado por una flecha desplegable que contiene submenús), **Páginas en revisión**, **Auditoría**, **Respaldos** y **Actualizaciones**.
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
   * **Campana de Notificaciones:** Junto al bloque de perfil se ubica permanentemente el ícono de una campana, diseñada para alertar y desplegar notificaciones relevantes o novedades del sistema.

> **[Captura: Menú de Perfil y Notificaciones]**
> *Vista de la base de la barra lateral, mostrando la información del usuario, el menú desplegable y la campana de notificaciones.*

4. **Adaptabilidad Estructural en Dispositivos Móviles:**
   Al ingresar desde un celular o tablet, la arquitectura visual del panel cambia automáticamente mediante un diseño responsivo para optimizar el espacio en pantallas táctiles, dividiendo los controles en dos barras fijas:
   * **Barra Superior:** Traslada a la cabecera de la pantalla el nombre del usuario y el menú desplegable de perfil (representado con un ícono de flecha hacia abajo), junto con íconos de acceso rápido para la campana de notificaciones, el buscador global (lupa) y un **alternador de tema visual** (ícono de sol o luna para cambiar entre modo claro y oscuro).
   * **Barra de Navegación Inferior:** Oculta la barra lateral y ubica en la base inferior de la pantalla un menú horizontal persistente. Este menú integra accesos rápidos: *Accesos* (ícono de usuario), *Revisión* (ícono de documento), un botón central destacado del *Dashboard* (representado por el isotipo del OLO en verde), *Auditoría* (escudo) y un botón *Más* (tres puntos) para expandir los módulos restantes.

> **[Captura: Interfaz Adaptativa en Dispositivos Móviles]**
> *Distribución móvil con la barra superior (perfil, notificaciones, buscador y tema) y la barra de navegación inferior con el isotipo del Dashboard destacado en el centro. (Móvil).*

---

#### 3.4.2.2. Buscador Global del Panel Administrativo
El Panel Administrativo cuenta con un buscador global diseñado para navegar ágilmente entre los diferentes módulos, secciones, herramientas de gestión y configuraciones del sistema utilizando palabras clave. Este buscador no filtra registros dentro de tablas individuales, sino que opera como un localizador y acceso directo integral hacia cualquier área de la plataforma administrativa o páginas institucionales asociadas.

*(Nota: Para consultar las posibles situaciones de error, validaciones de búsqueda y solución de problemas al interactuar con el buscador global o utilizar el botón Devolver, remitirse a la [Sección 3.5.1.6: Validaciones y Solución de Problemas en el Buscador Global del Panel Administrativo](#3516-validaciones-y-solución-de-problemas-en-el-buscador-global-del-panel-administrativo)).*

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

2. **Botón Devolver (Cancelación y retorno inmediato sin navegación):**
   * En caso de que el funcionario decida no continuar con la búsqueda o requiera regresar a la sección del panel en la que se encontraba previamente, la interfaz dispone en la esquina superior derecha de un **botón Devolver**, identificado visualmente con el ícono de una **flecha orientada hacia la izquierda**.
   * Al pulsar este botón Devolver, la ventana de búsqueda se cierra de manera instantánea y regresa al usuario exactamente a la vista, formulario o tabla donde estaba trabajando, restaurando el desplazamiento normal del panel sin recargar la página ni perder datos.

> **[Captura: Botón Devolver del Buscador Global]**
> *Ubicación del botón Devolver (flecha de retorno) en la esquina superior derecha de la ventana de búsqueda.*
>
> **[Captura: Botón Devolver del Buscador Global (Móvil)]**
> *Ubicación del botón Devolver en la parte superior derecha de la pantalla del buscador. (Móvil).*

3. **Ingreso del término y localización inteligente por sinónimos:**
   * El usuario introduce la palabra clave, término técnico o concepto deseado. El motor de búsqueda procesa la consulta en tiempo real, normalizando el texto de manera automática (eliminando tildes, mayúsculas y espacios sobrantes) y exigiendo que todas las palabras ingresadas coincidan para ofrecer resultados precisos.
   * La localización no se limita a los nombres exactos de las pantallas, sino que evalúa las descripciones funcionales, categorías y un índice integral de **sinónimos institucionales**, ejemplo:
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

4. **Selección rápida del destino (Interacción por ratón o teclado):**
   * **Selección con ratón o toque táctil:** El usuario hace clic o presiona sobre la tarjeta del resultado elegido. La plataforma cierra la pantalla de búsqueda y traslada la navegación de manera directa hacia la sección seleccionada.

> **[Captura: Navegación hacia el Resultado]**
> *Transición automática hacia el módulo de destino seleccionado en la lista de resultados.*
>
> **[Captura: Navegación hacia el Resultado (Móvil)]**
> *Transición automática hacia el módulo de destino seleccionado en la lista de resultados. (Móvil).*

---

#### 3.4.2.3. Tablero Principal y Métricas de Gestión (Dashboard)

*(Nota: Para consultar las validaciones y solución de problemas relacionados con gráficas que no cargan o tarjetas sin resultados, remitirse a la [Sección 3.5.1.7: Validaciones y Solución de Problemas en el Tablero Principal (Dashboard)](#3517-validaciones-y-solución-de-problemas-en-el-tablero-principal-dashboard)).*

Al ingresar al Panel Administrativo (`/admin/dashboard`), el Administrador visualiza el resumen consolidado de la actividad del observatorio. En pantallas de 1440 px de ancho o más, las tarjetas de *Páginas Publicadas*, *Visitas* y *Usuarios* aparecen en una sola fila; en pantallas más estrechas, la fila muestra solo *Páginas Publicadas* y *Visitas*, y la tarjeta de *Usuarios* pasa debajo, a todo el ancho; en el móvil van una debajo de otra:

1. **Tarjeta de Páginas Publicadas:** Muestra el total de páginas activas en el observatorio y, debajo, un diagrama en forma de árbol con dos ramas: **"Sitio web"** (verde) e **"Intranet"** (azul), cada una con su número de páginas. Al hacer clic (o tocar) una rama, se despliegan sus páginas como hojas unidas por líneas rectas en escalera, como las carpetas de un explorador; al volver a tocarla, se pliega. Al pasar el cursor sobre una página, un recuadro muestra su título completo y su ruta (por ejemplo, */contacto*). Al hacer clic sobre una página, su vista pública se abre en una pestaña nueva del navegador (tanto las del Sitio web como las de la Intranet), de modo que el panel sigue abierto en la pestaña original. Una rama sin páginas aparece en gris y no se despliega. Quien navega con el teclado (tecla *Tab*) o con lector de pantalla encuentra las mismas páginas como una lista de enlaces, que aparece debajo del árbol al llegar a ella; también se abren en una pestaña nueva.

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

3. **Bitácora de Actividad Reciente:** En la zona inferior del tablero, se encuentra una lista con las acciones más recientes ejecutadas en el sistema. Cada línea cuenta un evento completo en una frase: quién lo hizo, la acción (en una etiqueta de color), qué cambió y cuándo; por ejemplo, *«El usuario David Tejada hizo la acción de Autenticación: inició sesión en el sitio web el 10 de octubre de 2026 a las 5:41 p. m.»*. Cuando la acción la realizó el propio sistema (por ejemplo, una cuenta que caducó), la frase empieza por *«El sistema»*. La frase es la misma que se lee en el módulo de Auditoría y se ve igual en el computador y en el móvil, sin nada que desplegar.

   La lista cuenta con **controles de paginación** para navegar por el historial sin salir del panel, y un enlace **"Ver más"** en la cabecera que traslada directamente al módulo completo de Auditoría (Ver [Sección 3.4.2.6: Auditoría y Bitácora de Eventos](#3426-auditoría-y-bitácora-de-eventos)).

> **[Captura: Lista de Actividad Reciente]**
> *Vista general de la lista de Actividad Reciente, con una frase por evento.*
>
> **[Captura: Lista de Actividad Reciente (Móvil)]**
> *Vista general de la lista de Actividad Reciente, con una frase por evento. (Móvil).*

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

2. **Tabla General, Columnas y Búsqueda:** Al ingresar, el sistema despliega el listado completo de los funcionarios registrados. En la parte superior se dispone de un campo de búsqueda interactivo (**"Buscar usuarios..."**) para filtrar resultados en tiempo real por nombre, apellidos, correo electrónico institucional o rol asignado, así como controles de paginación en la parte inferior para recorrer los registros de manera ágil sin saturar la pantalla.
   La tabla expone las siguientes columnas de información:
   * **Nombre:** Nombres y apellidos completos del funcionario.
   * **Correo:** Cuenta corporativa vinculada (`@sena.edu.co`).
   * **Rol:** El rol de acceso asignado en el sistema (ej. Administrador, Editor, o rol derivado).
   * **Estado:** Un interruptor visual que indica si la cuenta está Activa o Inactiva/Suspendida.
   * **Bloqueo:** Indicador de seguridad que señala si la cuenta se encuentra temporalmente bloqueada por exceso de intentos fallidos y el tiempo restante de bloqueo.
   * **Acciones:** Herramientas operativas individuales para interactuar con cada fila:
     * **Ícono de lápiz (Editar Usuario):** Abre la ventana modal para modificar datos del usuario, reasignar rol, gestionar fecha de caducidad y opciones de restablecimiento de contraseña o preguntas de seguridad.
     * **Ícono de basurero (Eliminar usuario):** Despliega la ventana modal de confirmación para eliminar de forma definitiva la cuenta del sistema.

   En el móvil y la tablet la tabla es una lista plegable: cada fila muestra solo el nombre del funcionario. Al tocarla aparecen el correo, el rol, el estado (con su interruptor) y el bloqueo, y debajo los botones **"Editar"** (verde) y **"Eliminar"** (rojo), que hacen lo mismo que el lápiz y el basurero de la tabla; se vuelve a tocar para plegarla.

> **[Captura: Tabla General de Usuarios]**
> *Vista de la tabla de usuarios detallando sus columnas, buscador superior y el paginador inferior.*
>
> **[Captura: Tabla General de Usuarios (Móvil)]**
> *Lista plegable de usuarios, con uno desplegado y sus botones "Editar" y "Eliminar". (Móvil).*

3. **Creación de Cuentas y Generación de Credenciales:** En la cabecera del módulo, hacer clic en el botón **"Crear Usuario"** para abrir el modal de registro de funcionarios. Se deben diligenciar los campos obligatorios:
   * **Nombre y Apellidos**
   * **Correo electrónico** (estrictamente `@sena.edu.co`)
   * **Rol asignado** (Administrador, Editor base o cualquier rol derivado)
   * **Fecha de caducidad (Opcional):** Si se deja en blanco, la cuenta será de carácter permanente y no expirará automáticamente. Si se establece una fecha, el sistema desactivará el acceso del usuario en cuanto se cumpla dicho plazo.
   
   En la parte inferior del formulario de creación se encuentran las opciones de acción:
   * **Cancelar:** Descarta la operación y cierra la ventana sin registrar al funcionario.
   * **Guardar:** Confirma la información ingresada y da de alta al usuario en el sistema.

> **[Captura: Modal Nuevo Usuario]**
> *Formulario modal de registro de nuevo usuario.*
>
> **[Captura: Modal Nuevo Usuario (Móvil)]**
> *Formulario modal de registro de nuevo usuario. (Móvil).*

   Al confirmar la creación mediante el botón **"Guardar"**, el sistema genera automáticamente una **contraseña temporal provisoria** y la despliega en una segunda ventana modal ("Contraseña temporal generada").
   * **Validación de copiado obligatorio:** Por seguridad, el sistema advierte que la contraseña no se podrá volver a visualizar y **bloquea el botón "Cerrar"** de la ventana hasta que el Administrador presione obligatoriamente el botón azul oscuro de **"Copiar"**.
   * **Responsabilidad de comunicación:** Una vez copiada, el Administrador debe hacerle llegar esta clave al nuevo funcionario a través de los canales internos del SENA (correo electrónico corporativo, chat interno u otro medio formal), ya que la plataforma no envía notificaciones de bienvenida de forma automática.
   * En el primer inicio de sesión del funcionario, el sistema le exigirá de forma obligatoria el cambio de clave y la configuración de sus preguntas de seguridad (ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).

> **[Captura: Credenciales Generadas]**
> *Recuadro con la contraseña temporal generada y botón de copiado rápido.*
>
> **[Captura: Credenciales Generadas (Móvil)]**
> *Recuadro con la contraseña temporal generada. (Móvil).*

4. **Edición y Restablecimiento de Cuentas (Ícono de lápiz):**
   Al hacer clic en el ícono de lápiz ubicado en la fila de un usuario, se abre el modal de edición. Desde aquí, el Administrador tiene acceso a dos procesos:
   * **Actualización de datos del usuario:** Permite modificar la información base, incluyendo el nombre, apellidos, el rol asignado (nivel de privilegios) o establecer/quitar la fecha de caducidad de la cuenta. 
   * **Opciones de restablecimiento:** En la base del formulario, se encuentran botones críticos para brindar soporte técnico al funcionario:
     * **Restablecer la contraseña:** Genera una nueva clave temporal y fuerza el flujo de primer ingreso. *(Nota: Esta acción también funciona como un mecanismo de **desbloqueo manual**, eliminando de forma inmediata cualquier bloqueo de 15 minutos por intentos fallidos).*
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
   * **Confirmación obligatoria:** Al seleccionar el ícono, se despliega una ventana modal de advertencia ("¿Eliminar usuario?") indicando el carácter irreversible de la acción. El procedimiento se concreta al seleccionar el botón rojo **"Eliminar"**, o bien se interrumpe mediante la opción **"Cancelar"**.
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

Por motivos de seguridad estructural del sistema, la tabla **oculta** deliberadamente los roles fijos administrativos o gerenciales (`Administrador` y `Director/Subdirector`), puesto que sus facultades son estáticas y están protegidas por código fuente. En este módulo únicamente se visualizan y gestionan el rol base **Editor** y los roles derivados personalizados (hijos de Editor).

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
   * **Acciones:** Herramientas operativas individuales para interactuar con cada fila:
     * **Ícono de lápiz (Editar rol y permisos):** Abre la ventana modal para modificar la denominación, descripción y los permisos asignados al rol.
     * **Ícono de basurero (Eliminar rol):** Permite suprimir roles personalizados derivados. En el rol base **"Editor"**, este botón permanece permanentemente **deshabilitado y bloqueado en gris**, impidiendo su eliminación por ser un componente estructural del sistema.

   En el móvil y la tablet la tabla es una lista plegable: cada fila muestra solo el nombre del rol. Al tocarla aparecen la descripción y el número de permisos, y debajo los botones **"Editar"** (verde) y **"Eliminar"** (rojo); en el rol base **"Editor"** el botón **"Eliminar"** sale en gris, deshabilitado, con la nota *"El rol base de Editor no se puede eliminar."*. Se vuelve a tocar para plegarla.

> **[Captura: Tabla General de Roles]**
> *Vista de la tabla de roles detallando sus columnas, contador de permisos y buscador superior.*
>
> **[Captura: Tabla General de Roles (Móvil)]**
> *Lista plegable de roles, con el rol Editor desplegado y su botón "Eliminar" deshabilitado. (Móvil).*

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
   * **Aviso preventivo del sistema:** Se presenta una alerta informativa destacada en recuadro ámbar que advierte: *«Esto afecta a todas las personas con el rol «[Nombre]», no solo a la que estés editando. El cambio se aplica en cuanto guardas.»*, recordando que la modificación no es individual, sino que impacta de inmediato a todos los funcionarios que tengan asignado dicho rol.
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
   * **Interruptores (`Switch`) e insignias de cambio en tiempo real:** Cada permiso cuenta con un interruptor individual. Al cambiar el estado de cualquier interruptor, el sistema compara la selección con la configuración original y despliega una insignia visual inmediata:
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

   Una vez procesada la actualización, la ventana modal se cierra de forma automática y la plataforma emite una notificación flotante de confirmación (toast) en pantalla:
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
     * **Eliminar:** Botón destructivo en color rojo que retira de forma definitiva el rol de la base de datos y registra el evento en la bitácora de auditoría. Al completarse, el sistema emite la notificación flotante de confirmación (*«Rol eliminado - El rol «[Nombre]» se eliminó exitosamente.»*).

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
Módulo vital para el flujo de publicación, accesible desde el menú lateral (o barra inferior en móviles) bajo **"Páginas en Revisión"**.

1. **Acceso a la bandeja:** Se debe hacer clic en el ítem **"Páginas en Revisión"** en el menú lateral o en la barra inferior móvil.

> **[Captura: Paso 1]**
> *Clic en el ítem Páginas en Revisión.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Clic en el ítem Páginas en Revisión. (Móvil).*

2. **Revisión de la tabla:** El sistema mostrará la lista de borradores. Se debe identificar la página a evaluar. En el computador es una tabla. En el móvil y la tablet es una lista plegable: cada borrador ocupa una línea («Ana Gómez envió la versión 3 de Contacto»). Al tocarla, la frase se completa con la dirección de la sección, el ámbito y la fecha de envío («… de la sección /contacto del sitio web el 9 de octubre de 2026 a las 5:30 p. m.»), y debajo aparecen el comentario del editor y los botones de acción; se vuelve a tocar para plegarla.

> **[Captura: Paso 2]**
> *Tabla de borradores pendientes mostrando título y editor.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Lista plegable de borradores pendientes, con uno desplegado. (Móvil).*

3. **Previsualización:** Se debe hacer clic en el botón con **ícono de Ojo** en la fila del borrador.

> **[Captura: Paso 3]**
> *Clic en el botón de previsualización.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Clic en el botón de previsualización. (Móvil).*

4. **Verificación visual:** Se abrirá una ventana inmersiva. Se debe revisar el diseño de la página.

> **[Captura: Paso 4]**
> *Ventana inmersiva con página.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Ventana inmersiva con página. (Móvil).*

5. **Toma de decisión:** Se debe utilizar uno de los botones de acción: **Aprobar** (pasa a producción), **Rechazar** (devuelve al editor con observaciones) o el ícono de papelera para **Descartar**.

> **[Captura: Paso 5]**
> *Uso de los botones de decisión.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Uso de los botones de decisión. (Móvil).*

6. **Confirmación obligatoria para descarte:** Si se pulsa el botón de basurero para descartar un borrador no procedente o remitido por error, el sistema desplegará una ventana modal de seguridad. Es obligatorio registrar el motivo de la anulación para la bitácora de auditoría antes de confirmar la eliminación definitiva del borrador.

> **[Captura: Confirmación Descarte]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, con exigencia del registro obligatorio del motivo para auditoría.*
>
> **[Captura: Confirmación Descarte (Móvil)]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, con exigencia del registro obligatorio del motivo para auditoría. (Móvil).*

---

#### 3.4.2.6. Auditoría y Bitácora de Eventos
Herramienta de control forense, accesible desde el menú lateral (o barra inferior en móviles) bajo **"Auditoría"** o **"Bitácora"**.
1. **Filtros de Búsqueda:** En la parte superior existen barras desplegables para filtrar el historial por fecha (calendario), por correo del usuario que ejecutó la acción, o por tipo de evento (ej. "Borrado", "Edición", "Login"). Botón **"Aplicar Filtros"**.

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Móvil).*

2. **Tabla de Registros Inmutables:** Despliega cronológicamente los eventos, mostrando la marca de tiempo (fecha y hora exacta), la dirección IP, el actor y el detalle técnico de la operación realizada. Estos registros no poseen botón de eliminación, garantizando transparencia total. En el móvil y la tablet la tabla es una lista plegable: cada registro ocupa una línea con quién lo hizo y la acción, con su color («El usuario Ana Gómez hizo la acción de Edición»; «El sistema» cuando no lo hizo una persona, como una cuenta que caducó). Al tocarla, la frase se completa con lo que cambió y la fecha («El usuario Ana Gómez hizo la acción de Publicación: publicó la versión 4 de /inicio el 9 de octubre de 2026 a las 3:00 p. m.») y debajo aparece el botón **"Ver detalle"**; se vuelve a tocar para plegarla.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Lista plegable de registros de auditoría, con uno desplegado. (Móvil).*

##### 3.4.2.6.1. Exportación de la Bitácora de Auditoría

Tras aplicar los filtros deseados, el sistema permite exportar los registros visibles en la tabla:

1. **Botón de exportación:** En la cabecera de la tabla de auditoría, se debe hacer clic en el botón **"Exportar"**.
2. **Selección de formato:** El sistema ofrecerá los formatos de descarga disponibles (`.xlsx` o `.csv`).
3. **Descarga:** El archivo se generará con los registros actualmente filtrados y se descargará automáticamente al dispositivo del Administrador.

> **[Captura: Exportar Auditoría]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles.*
>
> **[Captura: Exportar Auditoría (Móvil)]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles. (Móvil).*

> **Nota sobre retención de registros:** La bitácora conserva el historial de eventos de forma permanente e indefinida. Los registros no tienen fecha de expiración y no pueden ser eliminados por ningún rol.

##### 3.4.2.6.2. Tipos de Eventos Registrados en la Bitácora

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
| `BACKUP_GENERATED` | Creación de respaldo o restauración de versión de página |
| `PASSWORD_RESET` | Restablecimiento de contraseña |
| `SECURITY_QUESTIONS_UPDATED` | Actualización de preguntas de seguridad |

---

#### 3.4.2.7. Respaldos y Restauración de Páginas
El módulo de **Respaldos** (`/admin/respaldos`) constituye el centro de control de versiones históricas de todas las páginas creadas y administradas desde el Editor Visual (Puck), tanto para el Sitio Web Público como para la Intranet. Su propósito es permitir al Administrador auditar el historial de publicaciones, previsualizar versiones archivadas que fueron reemplazadas y restaurar cualquiera de ellas de manera atómica a producción en caso de errores o contingencias.

1. **Tabla de páginas con respaldo activo:**
   La interfaz lista de forma automática todas las páginas que cuentan con al menos una **versión anterior archivada** disponible para restaurar. Para cada registro se visualiza:
   * **Página:** Título de la página, distintivo de ámbito (*Sitio web* o *Intranet*) y número de versión activa actual.
   * **Autor:** Nombre del funcionario que elaboró y editó la versión de la página.
   * **Publicado por:** Nombre del funcionario o administrador que aprobó y publicó la versión.
   * **Fechas:** Marcas de tiempo de edición (*Editado el*) y de publicación formal (*Publicado el*).
   * **Versión anterior:** Botón con ícono de **Ojo** (*Ver versión anterior*) para acceder al visor de respaldo.

   En el móvil y la tablet la tabla es una lista plegable, como en *Páginas en revisión* y *Auditoría*: cada publicación ocupa una línea con quién la publicó, qué versión y de qué sección («Carlos Ruiz publicó la versión 43 de /inicio»). Al tocarla, la frase se completa con el ámbito, la fecha de publicación y quién la editó («Carlos Ruiz publicó la versión 43 de la sección /inicio del sitio web el 10 de octubre de 2026 a las 9:00 a. m., editada por Ana Gómez el 9 de octubre de 2026 a las 10:00 a. m.») y debajo aparece el botón verde **"Ver versión 42"**, que abre el visor de la versión anterior; se vuelve a tocar para plegarla.

> **[Captura: Paso 1]**
> *Tabla principal del módulo de Respaldos con listado de páginas con versiones archivadas disponibles.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Lista plegable de respaldos, con una publicación desplegada y su botón "Ver versión". (Móvil).*

2. **Barra de filtros de búsqueda:**
   Permite localizar rápidamente páginas respaldadas mediante criterios específicos:
   * **Ámbito:** Filtrar entre páginas del *Sitio web* o de la *Intranet*.
   * **Autor / Publicado por:** Listas desplegables para filtrar por el autor de la versión o por el funcionario que la publicó.
   * **Rango de fechas:** Selectores de calendario (*Publicado desde* / *Publicado hasta*).
   * **Limpiar filtros:** Botón para reiniciar los parámetros de búsqueda.

> **[Captura: Paso 2]**
> *Uso de la barra de filtros para ubicar versiones por ámbito, autor, publicado por y fechas.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Uso de la barra de filtros para ubicar versiones por ámbito, autor, publicado por y fechas. (Móvil).*

3. **Previsualización de la versión anterior archivada:**
   Al hacer clic en el ícono de **Ojo** de cualquier fila (en el móvil y la tablet, en el botón **"Ver versión"** de la publicación desplegada), el sistema despliega la ventana modal de consulta de respaldo:
   * Presenta los metadatos completos de la versión archivada (número de versión, autor, fecha y ámbito).
   * Proporciona un enlace interactivo directo para **abrir la vista previa de la página** en el visor Puck (`/preview/[slug]?versionId=...`), permitiendo al Administrador inspeccionar con total fidelidad cómo lucía el contenido antes de ser reemplazado.

> **[Captura: Paso 3]**
> *Ventana modal de vista previa de la versión anterior archivada con enlace.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ventana modal de vista previa de la versión anterior archivada con enlace. (Móvil).*

4. **Restauración atómica a producción:**
   Dentro del modal de consulta, el Administrador dispone del botón **"Restaurar versión anterior"**:
   * **Validación de concurrencia (Protección contra sobreescritura):** Antes de ejecutar la restauración, el sistema comprueba en tiempo real si algún editor está modificando la página en ese instante. Si detecta una sesión de edición activa, bloquea el proceso e informa el nombre del funcionario que la está interviniendo.
   * **Confirmación de seguridad:** Si la página no está bloqueada, se abre una ventana modal de confirmación advirtiendo que la versión archivada pasará a ser la versión activa del portal.
   * **Publicación inmediata:** Al confirmar, la versión anterior se publica automáticamente en el portal público o en la Intranet y el evento queda grabado de forma inmutable en la bitácora de auditoría.

> **[Captura: Paso 4]**
> *Ventana modal de confirmación y advertencia previa para restaurar la versión archivada a producción.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Ventana modal de confirmación y advertencia previa para restaurar la versión archivada a producción. (Móvil).*

5. **Depuración y limpieza de versiones antiguas:**
   En la cabecera superior del módulo, el botón **"Depurar"** permite al Administrador abrir el asistente de depuración para eliminar versiones históricas obsoletas o borradores antiguos que ya no sean requeridos, optimizando el rendimiento y almacenamiento de la plataforma.

> **[Captura: Paso 5]**
> *Ventana modal de depuración de versiones históricas de páginas.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Ventana modal de depuración de versiones históricas de páginas. (Móvil).*

---

#### 3.4.2.8. Actualizaciones y Carga Masiva de Datos en Excel
Módulo de procesamiento masivo, accesible desde el menú lateral (o barra inferior en móviles) bajo **"Actualizaciones"** (o "Carga Masiva").

1. **Acceso al módulo:** En el menú lateral o en la barra inferior móvil, se debe hacer clic en **"Actualizaciones"**.

> **[Captura: Paso 1]**
> *Acceso al módulo Carga Masiva en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al módulo Carga Masiva en el menú lateral. (Móvil).*

2. **Descarga de plantilla oficial:** Antes de subir cualquier dato, el usuario debe hacer clic en el botón **"Descargar Plantilla Excel"**. Esto asegura que las columnas, formatos de celda y encabezados coincidan de forma estricta con el esquema esperado por la base de datos.

> **[Captura: Paso 2]**
> *Botón para descargar la plantilla oficial en formato .xlsx.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Botón para descargar la plantilla oficial en formato .xlsx. (Móvil).*

3. **Diligenciamiento de la plantilla:** El usuario diligencia el archivo respetando los tipos de datos de cada columna sin alterar los nombres de las cabeceras.
4. **Carga del archivo:** Se debe arrastrar el archivo diligenciado al área punteada de carga (**"Arrastra tu archivo aquí"**) o hacer clic para seleccionarlo desde el explorador de archivos del sistema operativo (formatos permitidos: `.xlsx`, `.xls`; peso máximo: 10 MB).

> **[Captura: Paso 4]**
> *Zona de arrastre y selección del archivo Excel.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Zona de arrastre y selección del archivo Excel. (Móvil).*

5. **Prevalidación automática:** El sistema analiza la estructura del archivo antes de impactar la base de datos. Si detecta campos vacíos obligatorios, tipos de datos incorrectos o filas duplicadas, mostrará una lista detallada con el **número de fila exacto** y el **error encontrado**. El botón de procesamiento permanecerá bloqueado hasta que el usuario corrija los errores y cargue el archivo corregido.

> **[Captura: Paso 5]**
> *Panel de prevalidación con la lista de errores encontrados por fila.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Panel de prevalidación con la lista de errores encontrados por fila. (Móvil).*

6. **Confirmación y ejecución:** Con la prevalidación aprobada (0 errores), se habilitará el botón **"Procesar Carga"**. Al hacer clic, una barra de progreso indicará el avance del procesamiento.

> **[Captura: Paso 6]**
> *Barra de progreso de la carga masiva con porcentaje de avance.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Barra de progreso de la carga masiva con porcentaje de avance. (Móvil).*

7. **Confirmación de éxito:** Al finalizar, el sistema mostrará un resumen con el número de registros **procesados**, **creados**, **actualizados** y **omitidos**. Una notificación emergente (*toast*) confirmará que la operación fue exitosa y el evento quedará registrado en la bitácora de auditoría.

> **[Captura: Paso 7]**
> *Resumen de resultados de la carga masiva con el conteo de registros procesados, creados, actualizados y omitidos.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Resumen de resultados de la carga masiva. (Móvil).*

---

#### 3.4.2.9. Perfil de Usuario ("Mi perfil" y "Configuración")
Accesible desde el menú desplegable de perfil ubicado en la base inferior del menú lateral izquierdo (en escritorio) o pulsando el nombre de usuario en la barra superior (en móvil). Permite al Administrador gestionar sus datos básicos y actualizar su contraseña institucional.

##### 3.4.2.9.1. Sección "Mi Perfil"

Contiene la información de identificación del usuario dentro del sistema:

* **Nombre y Apellidos:** Campos de texto editables para actualizar los nombres y apellidos del funcionario en el sistema.
* **Correo Electrónico:** Dirección institucional `@sena.edu.co` registrada en la plataforma.
* **Cambiar contraseña:** Opción desplegable interactiva que permite al usuario actualizar su contraseña sin salir del panel. Al activarla, solicita la contraseña actual, la nueva contraseña (con indicador en vivo del cumplimiento de los requisitos de seguridad) y la confirmación de la nueva clave.

> **[Captura: Mi Perfil]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, apellidos, correo y cambio de contraseña.*
>
> **[Captura: Mi Perfil (Móvil)]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, apellidos, correo y cambio de contraseña. (Móvil).*

Flujo para actualizar los datos:
1. El usuario modifica los campos deseados en el formulario.
2. Se debe hacer clic en el botón **"Guardar cambios"**.
3. El sistema muestra una notificación emergente (*toast*) confirmando la actualización exitosa de la información.

##### 3.4.2.9.2. Sección "Configuración"

Contiene las preferencias operativas del usuario:

* **Sonido de los avisos:** Activa o silencia el tono corto que acompaña a los avisos flotantes de éxito, advertencia y error. Viene activado. La elección se guarda en el navegador que se esté usando, así que en otro equipo o navegador hay que volver a elegirla. Los botones **Éxito**, **Advertencia** y **Error** permiten escuchar cada tono.
* **Actualización de preguntas de seguridad:** Permite al usuario reconfigurar sus tres preguntas y respuestas de seguridad. Requiere confirmar la contraseña actual antes de realizar cambios.
* **Notificaciones:** Activa o desactiva la recepción de alertas del sistema (ej. notificación cuando un borrador es aprobado o rechazado).

> **[Captura: Configuración Usuario]**
> *Vista del módulo "Configuración" en el Panel Administrativo con el interruptor del sonido de los avisos y los botones para escuchar cada tono.*
>
> **[Captura: Configuración Usuario (Móvil)]**
> *Vista del módulo "Configuración" en el Panel Administrativo con el interruptor del sonido de los avisos y los botones para escuchar cada tono. (Móvil).*

---

### 3.4.3. Gestión Editorial y Contenido Dinámico en el Editor Visual

Guía de operaciones para el diseño, maquetación y actualización de páginas y contenidos en el Sitio Web Público y la Intranet mediante el editor visual interactivo basado en bloques (Puck).

Esta sección aborda el uso de la herramienta del Editor Visual, disponible para usuarios con rol de Administrador o Editor (incluyendo roles derivados autorizados), mediante la cual se diseña y actualiza el contenido del portal.

#### 3.4.3.1. Acceso a las opciones de Edición (Botón Flotante)
1. **Visualización del botón:** Al iniciar sesión con un rol autorizado (Administrador o Editor), se debe ubicar el **botón circular flotante con un ícono de lápiz** en la pantalla del portal.

> **[Captura: Paso 1]**
> *Botón flotante de edición.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Botón flotante de edición. (Móvil).*

2. **Despliegue del menú:** Se debe hacer clic sobre el botón circular. Se desplegará un menú con cuatro opciones (Editar pie, Editar página, Crear página, Eliminar página).

> **[Captura: Paso 2]**
> *Menú de opciones desplegado.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Menú de opciones desplegado. (Móvil).*

#### 3.4.3.2. Creación y Edición en el Lienzo
1. **Creación:** Se debe seleccionar la opción **"Crear página"** en el menú del botón flotante; el sistema solicitará digitar un título y una ruta URL. Al completar y confirmar el formulario, la nueva página se crea en estado de borrador.
   * *Asignación automática de permisos:* De forma inmediata, el sistema habilita el permiso de edición únicamente para el Administrador, para el rol padre Editor base y para el rol del editor que la creó. Los demás roles hijos de editor quedan sin acceso a la página a menos que un Administrador les conceda el permiso manualmente desde el Panel Administrativo (**Accesos > Roles > Editar Rol**).

> **[Captura: Paso 1]**
> *Formulario de título y URL para la nueva página.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Formulario de título y URL para la nueva página. (Móvil).*

2. **Acceso al lienzo:** Al crear o al seleccionar **"Editar página"**, se abrirá la interfaz del Editor Visual dividida en tres paneles (catálogo, lienzo y propiedades).

> **[Captura: Paso 2]**
> *Interfaz de 3 paneles del Editor Visual.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Interfaz de 3 paneles del Editor Visual. (Móvil).*

3. **Arrastrar componente:** Se debe hacer clic sostenido sobre un componente del panel izquierdo y arrastrarlo hacia el centro.

> **[Captura: Paso 3]**
> *Acción de arrastrar un componente al lienzo.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Acción de arrastrar un componente al lienzo. (Móvil).*

4. **Soltar componente:** Se debe soltar el clic para que el componente quede fijado en el lienzo de trabajo.

> **[Captura: Paso 4]**
> *Componente fijado en el lienzo central.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Componente fijado en el lienzo central. (Móvil).*

5. **Configuración de propiedades:** Se debe hacer clic sobre el componente recién colocado. El panel derecho mostrará sus campos editables (textos, estilos y contenidos visuales).

> **[Captura: Paso 5]**
> *Panel derecho habilitado con las propiedades del componente.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Panel derecho habilitado con las propiedades del componente. (Móvil).*

6. **Ingreso de contenido:** Se deben digitar los textos o cargar las imágenes necesarias en el panel derecho. Los cambios se reflejarán en tiempo real en el centro.

> **[Captura: Paso 6]**
> *Ingreso de datos y visualización en tiempo real.*
>
> **[Captura: Paso 6 (Móvil)]**
> *Ingreso de datos y visualización en tiempo real. (Móvil).*

7. **Guardado y Revisión:** Finalmente, se debe hacer clic en el botón superior **"Guardar Borrador"** o **"Enviar a revisión"** para terminar el trabajo.

> **[Captura: Paso 7]**
> *Clic en los botones de guardado o revisión.*
>
> **[Captura: Paso 7 (Móvil)]**
> *Clic en los botones de guardado o revisión. (Móvil).*

#### 3.4.3.3. Gestión Avanzada en el Editor Visual

Esta sección complementa la Sección 3.4.3.2, cubriendo las operaciones sobre componentes ya colocados en el lienzo.

##### 3.4.3.3.1. Reordenar Componentes en el Lienzo

1. **Selección del componente:** El usuario debe hacer clic sobre el componente que desea mover. El sistema resaltará un borde de selección a su alrededor.
2. **Arrastre de reposicionamiento:** Se debe mantener presionado el botón izquierdo del ratón sobre la barra de control superior del componente (ícono de agarradera de seis puntos) y desplazarlo hacia la nueva posición requerida.
3. **Soltado:** Al soltar el botón del ratón, el componente queda fijado en su nueva ubicación y el lienzo reorganiza los demás bloques de forma automática.

> **[Captura: Reordenar Componente]**
> *Arrastre de un componente seleccionado hacia una nueva posición en el lienzo del Editor Visual.*
>
> **[Captura: Reordenar Componente (Móvil)]**
> *Arrastre de un componente seleccionado hacia una nueva posición en el lienzo del Editor Visual. (Móvil).*

##### 3.4.3.3.2. Eliminar un Componente del Lienzo

1. **Selección:** Se debe hacer clic sobre el componente que se desea retirar del lienzo.
2. **Botón de eliminación:** En la barra de control superior del componente seleccionado, se debe hacer clic en el **ícono de basurero** para retirar el elemento.
3. **Resultado:** El componente se retira del lienzo de manera inmediata. Esta acción puede revertirse mediante la función Deshacer (Sección 3.4.3.3.3) mientras no se guarde el borrador.

> **[Captura: Eliminar Componente]**
> *Barra de control del componente seleccionado con ícono de basurero para su eliminación.*
>
> **[Captura: Eliminar Componente (Móvil)]**
> *Barra de control del componente seleccionado con ícono de basurero para su eliminación. (Móvil).*

##### 3.4.3.3.3. Deshacer y Rehacer Cambios

El Editor Visual dispone de un historial de acciones en sesión:

* **Deshacer (Ctrl + Z / Cmd + Z):** Revierte la última acción realizada en el lienzo. Puede aplicarse múltiples veces de forma consecutiva.
* **Rehacer (Ctrl + Y / Cmd + Shift + Z):** Vuelve a aplicar la acción que fue deshecha.

> **Nota importante:** El historial de deshacer/rehacer es exclusivo de la sesión activa de edición. Al hacer clic en **"Guardar Borrador"** o al cerrar el editor, el historial se reinicia y no es posible revertir los cambios guardados mediante esta función.

> **[Captura: Botones Deshacer Rehacer]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual.*
>
> **[Captura: Botones Deshacer Rehacer (Móvil)]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual. (Móvil).*

##### 3.4.3.3.4. Edición de la Cabecera y Pie de Página Globales

La cabecera y el pie de página son componentes envolventes globales del portal. Su edición está disponible para el rol **Administrador**, el rol **Editor base** y para los **Roles hijos** a quienes el Administrador haya habilitado explícitamente este permiso.

1. **Acceso:** Desde el menú del botón flotante de edición en cualquier página, el usuario debe seleccionar la opción **"Editar cabecera"** o **"Editar pie"**.

> **[Captura: Menú Editar Cabecera]**
> *Opción de edición de cabecera en el menú flotante del editor.*
>
> **[Captura: Menú Editar Cabecera (Móvil)]**
> *Opción de edición de cabecera en el menú flotante del editor. (Móvil).*

2. **Lienzo de cabecera/pie:** Se abrirá el Editor Visual en modo de edición del componente global seleccionado. Los cambios aquí realizados se propagarán a **todas las páginas del portal simultáneamente**.

> **Advertencia:** Dado que la cabecera y el pie son globales, cualquier modificación aprobada afectará la apariencia de toda la plataforma. Se recomienda especial cuidado y la previsualización detallada antes de enviar a revisión.

3. **Guardado:** Al finalizar, se debe hacer clic en **"Guardar Borrador"** y enviar a revisión. El Administrador deberá aprobar los cambios antes de que sean visibles en el portal.

#### 3.4.3.4. Eliminación de Páginas Dinámicas (Paso a Paso)

La eliminación de páginas dinámicas retira de forma definitiva la página y sus versiones del portal. Esta acción está disponible únicamente para el rol **Administrador**, el rol **Editor base** y aquellos **Roles hijos de editor** a los que se les haya concedido manualmente el permiso de eliminación sobre páginas.

1. **Acceso desde el botón flotante:** El editor debe navegar hacia la página dinámica que desea eliminar y hacer clic en el botón circular flotante con ícono de lápiz para desplegar el menú de opciones (Sección 3.4.3.1).
2. **Selección de la opción:** En el menú desplegado, se debe hacer clic en la opción **"Eliminar página"**.

> **[Captura: Menú Flotante Eliminar Página]**
> *Opción "Eliminar página" seleccionada en el menú flotante del editor visual.*
>
> **[Captura: Menú Flotante Eliminar Página (Móvil)]**
> *Opción "Eliminar página" seleccionada en el menú flotante del editor visual. (Móvil).*

3. **Validación automática de enlaces activos (Protección contra enlaces rotos):** El sistema escanea en tiempo real todo el portal. Si la página está vinculada en el menú de navegación principal (cabecera o pie) o referenciada en enlaces de otras páginas, el borrado se bloquea inmediatamente y el sistema arroja una alerta de bloqueo impidiendo la eliminación (ver [Sección 3.5.1.7: Prevención de enlaces rotos](#3517-prevención-de-enlaces-rotos-bloqueos-de-eliminación) y [Sección 3.5.2.3: Bloqueo al intentar eliminar páginas](#3523-bloqueo-al-intentar-eliminar-páginas)). En tal caso, el usuario debe ingresar primero a la edición de la cabecera/pie ([Sección 3.4.3.3: Gestión Avanzada en el Editor Visual](#3433-gestión-avanzada-en-el-editor-visual)) o a las páginas enlazadas para retirar dichos vínculos antes de repetir el intento.

> **[Captura: Alerta Enlaces Rotos Bloqueo]**
> *Alerta del sistema bloqueando el borrado de la página debido a enlaces activos detectados.*
>
> **[Captura: Alerta Enlaces Rotos Bloqueo (Móvil)]**
> *Alerta del sistema bloqueando el borrado de la página debido a enlaces activos detectados. (Móvil).*

4. **Ventana modal de confirmación y digitación obligatoria del título:** Si no existen enlaces dependientes, el sistema desplegará la ventana modal de confirmación de seguridad. Para evitar eliminaciones accidentales, el usuario debe digitar de manera idéntica y exacta el título de la página en el campo de texto requerido.

> **[Captura: Modal Eliminar Página]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página.*
>
> **[Captura: Modal Eliminar Página (Móvil)]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página. (Móvil).*

5. **Confirmación definitiva:** Una vez digitado el título idéntico, se activará el botón de confirmación **"Eliminar definitivamente"**. Al hacer clic, la página y sus borradores quedarán eliminados del sistema.
6. **Constancia en auditoría:** La página desaparece de la vista pública y del editor, pero el evento queda grabado de forma automática e inmutable en la bitácora de auditoría del sistema (Sección 3.4.2.6), conservando el usuario ejecutor, la fecha, la hora y el registro de la acción.

---

### 3.4.4. Consultas Ciudadanas, Búsquedas y Visualizadores de Información

Procedimientos para la localización de contenidos en el portal público, consulta de tableros analíticos en la Intranet, visualización de documentos y descarga directa de información institucional.

#### 3.4.4.1. Búsquedas y Filtros en el Portal Público

##### 3.4.4.1.1. Uso del Buscador Global
El sistema cuenta con un motor de búsqueda global accesible desde la cabecera. El proceso para realizar una consulta es el siguiente:

1. **Ubicación de la barra:** En la parte superior de la interfaz, se debe ubicar el campo de texto con el ícono de lupa correspondiente al buscador rápido.

> **[Captura: Paso 1]**
> *Buscador global en la cabecera.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Buscador global en la cabecera. (Móvil).*

2. **Ingreso de términos:** Se deben digitar las palabras clave relacionadas con la temática, contenido, boletín o documento que se desea localizar.

> **[Captura: Paso 2]**
> *Ingreso de términos clave en el campo de texto del buscador.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Ingreso de términos clave en el campo de texto del buscador. (Móvil).*

3. **Ejecución y resultados:** Al presionar la tecla *Enter* o hacer clic en la lupa, el sistema procesará la solicitud y cargará una página con la lista de resultados organizados por relevancia.

> **[Captura: Paso 3]**
> *Página de resultados desplegando las coincidencias encontradas por el sistema.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Página de resultados desplegando las coincidencias encontradas por el sistema. (Móvil).*

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

### 3.4.5. Instalación como Aplicación Web Progresiva (PWA)

Procedimientos para instalar la plataforma del OLO como aplicación web progresiva (PWA) en equipos de escritorio y teléfonos móviles, facilitando el acceso directo desde el sistema operativo.
La plataforma del OLO puede instalarse en el dispositivo del usuario como una aplicación independiente.

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

Solución de problemas, catálogo detallado de validaciones en pantalla, directrices de seguridad ante fallos operativos y respuestas a preguntas frecuentes sobre el funcionamiento del sistema.

---

### 3.5.1. Catálogo de Validaciones y Solución de Problemas

A continuación se detalla el comportamiento exhaustivo de las validaciones de formulario, alertas de restricción, prevención de enlaces rotos y códigos de error que emite la plataforma durante la autenticación, administración y gestión editorial, junto con sus causas y acciones correctivas.

#### 3.5.1.1. Validaciones en el Primer Ingreso

Durante el primer ingreso (cuyo procedimiento operativo regular se detalla en la [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)), el sistema aplica rigurosas validaciones de formato, comprobaciones de seguridad de contraseñas y restricciones de acceso por rol. Esta sección detalla de forma paralela cada punto del paso a paso, ilustrando los errores comunes de ingreso, los mensajes de advertencia y las alertas establecidas en la plataforma para ambos entornos:

* **[Validaciones en el Primer Ingreso (Sitio Web Público)](#validaciones-en-el-primer-ingreso-sitio-web-público):** Alertas de campos, validaciones del validador de políticas y comprobación de permisos al iniciar sesión en el portal público.
* **[Validaciones en el Primer Ingreso (Intranet del OLO)](#validaciones-en-el-primer-ingreso-intranet-del-olo):** Redirecciones forzosas, validaciones en pantalla de bloqueo, asistencia paso a paso y alertas de autorización en la Intranet.

##### Validaciones en el Primer Ingreso (Sitio Web Público)

1. **Ubicación del acceso en el Sitio Web (Confusión de punto de entrada):**
   * *Acción errónea:* El usuario intenta ingresar a configurar su cuenta haciendo clic sobre el botón interactivo **"Intranet"** en la barra superior en lugar de pulsar el texto de **fecha y hora** en la franja azul de GOV.CO.
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
     * **Credenciales incorrectas:** Si el correo o la clave provisoria contienen erratas o no corresponden a un registro activo, el sistema despliega la alerta general en el recuadro superior: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* El funcionario debe verificar la escritura de su correo institucional `@sena.edu.co` y transcribir con exactitud la contraseña provisoria comunicada por el Administrador.

> **[Captura: Validaciones en Formulario de Acceso Sitio Web]**
> *Mensajes de validación de campos requeridos, dominio institucional y alerta general de credenciales erróneas en el Sitio Web.*
>
> **[Captura: Validaciones en Formulario de Acceso Sitio Web (Móvil)]**
> *Mensajes de validación de campos requeridos, dominio institucional y alerta general de credenciales erróneas en el Sitio Web. (Móvil).*

3. **Pantalla de bienvenida y verificación del estado de cuenta:**
   * *Situaciones anómalas y respuestas del sistema:*
     * **Sesión provisional expirada o no iniciada:** Si el usuario ingresa de forma manual a la ruta `/first-login` sin una sesión activa o si la sesión caducó por inactividad, la plataforma detiene la carga con la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`, facilitando el enlace directo para regresar a la pantalla de acceso.
     * **Cuenta sin configuraciones pendientes:** Si la cuenta ya había completado el proceso con anterioridad (por ejemplo, desde otra pestaña del navegador), el sistema no solicita credenciales temporales inexistentes; en su lugar, presenta el aviso: `"Tu cuenta ya está configurada. No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día."` junto con el botón `"Ir al panel"`.
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
     * **Incumplimiento de requisitos de seguridad:** Al digitar la nueva contraseña, si no se cumplen las condiciones mínimas exigidas por la entidad, los indicadores interactivos permanecen en color gris o rojo y el sistema resalta el primer fallo pendiente bajo el campo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`), bloqueando el avance.
     * **Falta de confirmación o discrepancia:** Si la confirmación está en blanco, se solicita `"Confirma tu contraseña"`. Si el texto digitado no es exactamente idéntico al de la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* El funcionario debe construir una contraseña que cumpla con todos los requisitos resaltados en verde por el verificador interactivo y comprobar la coincidencia exacta en el campo de confirmación.

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
     * **Credenciales incorrectas:** Si se ingresan datos errados o inexistentes, el sistema emite el aviso: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* Digitar el correo corporativo `@sena.edu.co` y escribir con precisión la clave temporal asignada por el Administrador.

> **[Captura: Validaciones en Formulario de Acceso Intranet]**
> *Alertas de campos obligatorios, validación de dominio institucional y mensaje de credenciales no coincidentes en la Intranet.*
>
> **[Captura: Validaciones en Formulario de Acceso Intranet (Móvil)]**
> *Alertas de campos obligatorios, validación de dominio institucional y mensaje de credenciales no coincidentes en la Intranet. (Móvil).*

3. **Bienvenida y pasos guiados de configuración (Control de sesión):**
   * *Situaciones anómalas y validaciones:*
     * **Caducidad de la sesión provisional:** Si el funcionario suspende el proceso y se supera el período de inactividad, el sistema interrumpe la configuración y muestra la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`.
     * **Detección de avances parciales:** Si la cuenta ya había modificado su clave pero tenía pendientes las preguntas de seguridad, la barra guiada desactiva el primer paso y sitúa el formulario directamente en el paso 2 para evitar reprocesos innecesarios.
   * *Acción de corrección:* Reiniciar la sesión si esta caducó y continuar el diligenciamiento de los pasos indicados en la barra guiada.

> **[Captura: Control de Sesión y Pasos Guiados Intranet]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración.*
>
> **[Captura: Control de Sesión y Pasos Guiados Intranet (Móvil)]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración. (Móvil).*

4. **Establecimiento de la contraseña definitiva (Reglas de robustez y coincidencia):**
   * *Acciones erróneas y validaciones:*
     * **Clave temporal en blanco:** Si se omite la clave provisoria en el primer campo, el sistema exige: `"La contraseña temporal es requerida"`.
     * **Clave temporal no válida:** Si la clave temporal ingresada no coincide con la registrada en el sistema, al pulsar "Continuar" el servidor notifica: `"No se pudo completar la configuración"`.
     * **Contraseña débil:** Si la nueva clave no satisface la totalidad de las 5 condiciones exigidas, el panel de requisitos muestra las condiciones no cumplidas y bloquea el avance con el mensaje del primer fallo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`).
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
     * **Respuesta en blanco:** Si la casilla de respuesta se encuentra vacía o solo contiene espacios, se señala: `"La respuesta es requerida"`.
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
     * **Cuentas sin autorización para la Intranet:** Si el funcionario posee una cuenta activa pero no cuenta con el permiso institucional de acceso a la Intranet, el sistema invalida la sesión y despliega la alerta preventiva: *"No tienes permisos para ingresar a la intranet."*.
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
   * *Acción de corrección:* El usuario debe situarse en el Sitio Web Público y pulsar sobre el texto interactivo de **fecha y hora** en el extremo derecho de la franja azul GOV.CO.

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
     * **Dominio institucional SENA:** Si se digita un correo de dominios comerciales (`@gmail.com`, `@outlook.com`, etc.), el validador bloquea en tiempo real con el mensaje: `"Debe ser un correo institucional @sena.edu.co"`.
     * **Contraseña con espacios erróneos:** Si se copian y pegan caracteres con espacios al inicio o final de forma involuntaria, el validador evalúa la cadena exacta y emite error de coincidencia.
   * *Acción de corrección:* Digitar estrictamente el correo corporativo `@sena.edu.co` y transcribir con exactitud la contraseña definitiva sin espacios adicionales.

> **[Captura: Validaciones de Campos en Formulario Sitio Web]**
> *Mensajes de advertencia por campos requeridos, formato inválido y rechazo de dominios externos al SENA en el Sitio Web.*
>
> **[Captura: Validaciones de Campos en Formulario Sitio Web (Móvil)]**
> *Mensajes de advertencia por campos requeridos, formato inválido y rechazo de dominios externos al SENA en el Sitio Web. (Móvil).*

4. **Ejecución y validación de la sesión (Validación de credenciales en el acceso):**
   * *Acción errónea y alerta del sistema:* Al hacer clic en el botón "Ingresar", si la contraseña o el correo no coinciden con los registros activos de la plataforma, se despliega la alerta en la parte superior del formulario: `"Correo o contraseña incorrectos"`.
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

2. **Pantalla de bloqueo y bienvenida institucional:**
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
> *Alerta indicando falta de permisos institucionales para acceder a los módulos internos de la Intranet.*
>
> **[Captura: Alerta de Acceso Denegado a la Intranet (Móvil)]**
> *Alerta indicando falta de permisos institucionales para acceder a los módulos internos de la Intranet. (Móvil).*
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
* **[Validaciones en la Recuperación de Contraseña (Intranet del OLO)](#validaciones-en-la-recuperación-de-contraseña-intranet-del-olo):** Mensajes en el panel institucional, asistencia en preguntas de seguridad y alertas de coincidencia en la Intranet.

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
> *Alertas de formato, dominio institucional y aviso de cuenta sin preguntas registradas en el Sitio Web.*
>
> **[Captura: Validaciones de Correo en Recuperación Sitio Web (Móvil)]**
> *Alertas de formato, dominio institucional y aviso de cuenta sin preguntas registradas en el Sitio Web. (Móvil).*

3. **Verificación de identidad mediante preguntas de seguridad:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta en blanco:** Si se pulsa "Continuar" sin redactar la respuesta a la pregunta activa, el formulario señala: `"La respuesta es requerida"`.
     * **Respuestas no coincidentes:** Al enviar el cuestionario, si las respuestas no coinciden con los registros guardados, el sistema emite la alerta: `"Las respuestas no coinciden con nuestros registros. Intenta nuevamente."`, restableciendo el cuestionario al inicio por seguridad y acumulando un intento fallido en el servidor.
     * **Bloqueo de cuenta por 3 intentos fallidos (30 minutos):** El mecanismo de seguridad interno restringe la recuperación a un máximo de **3 intentos fallidos consecutivos**. Si se alcanza este tope, la cuenta pasa automáticamente a estado bloqueado temporal durante **30 minutos**, impidiendo tanto la recuperación como el acceso normal al sistema con la alerta: `"Cuenta bloqueada temporalmente"`. Dicho evento queda asentado en la bitácora inmutable de auditoría.
     * **Navegación forzada sin correo previo:** Si el usuario intenta cargar directamente la ruta `/security-questions` sin haber validado su correo, el sistema lo reconduce de forma automática a `/recovery`.
   * *Acción de corrección:* Digitar con precisión la respuesta secreta configurada en el primer ingreso respetando caracteres y ortografía. En caso de bloqueo por 3 intentos fallidos, aguardar 30 minutos a que expire la restricción o solicitar el desbloqueo manual al Administrador.

> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web (Móvil)]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web. (Móvil).*

4. **Establecimiento de la nueva contraseña (Políticas y confirmación):**
   * *Acciones erróneas y validaciones:*
     * **Omisión o contraseña débil:** Si se intenta guardar dejando el campo vacío o incumpliendo alguno de los 5 requisitos de seguridad, el sistema resalta el requisito pendiente bajo el campo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`), impidiendo el avance.
     * **Discrepancia en la confirmación:** Si el campo de repetición no coincide de manera exacta con la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Establecer una contraseña que satisfaga todos los indicadores en color verde y reescribirla con exactitud en la casilla de confirmación.

> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web]**
> *Validador de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web.*
>
> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web (Móvil)]**
> *Validador de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web. (Móvil).*

5. **Confirmación y retorno seguro:**
   * *Situación de control:* Tras procesar el cambio en el servidor, la pantalla `/reset-success` confirma la operación y bloquea retornos involuntarios con el botón de retroceso del navegador, obligando a iniciar sesión formalmente.
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
> *Alertas de campo obligatorio, dominio institucional y preguntas no encontradas en la Intranet.*
>
> **[Captura: Validaciones de Correo en Recuperación Intranet (Móvil)]**
> *Alertas de campo obligatorio, dominio institucional y preguntas no encontradas en la Intranet. (Móvil).*

3. **Verificación de identidad mediante preguntas de seguridad:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta en blanco:** Si se pulsa "Siguiente" o "Verificar" sin redactar la respuesta a la pregunta activa, el formulario señala: `"La respuesta es requerida"`.
     * **Respuestas no coincidentes:** Al enviar el cuestionario, si las respuestas no coinciden con los registros guardados, el sistema emite la alerta: `"Las respuestas no coinciden. Intenta de nuevo."`, restableciendo el cuestionario al inicio por seguridad y acumulando un intento fallido en el servidor.
     * **Bloqueo de cuenta por 3 intentos fallidos (30 minutos):** El mecanismo de seguridad interno restringe la recuperación a un máximo de **3 intentos fallidos consecutivos**. Si se alcanza este tope, la plataforma bloquea la cuenta de forma automática durante **30 minutos** con la alerta: `"Cuenta bloqueada temporalmente"`. Dicho evento queda asentado en la bitácora inmutable de auditoría.
     * **Navegación forzada sin correo previo:** Si el usuario intenta cargar directamente la ruta `/security-questions` sin haber validado su correo, el sistema lo reconduce de forma automática a `/recovery`.
   * *Acción de corrección:* Digitar con precisión la respuesta secreta configurada en el primer ingreso respetando caracteres y ortografía. En caso de bloqueo por 3 intentos fallidos, aguardar 30 minutos a que expire la restricción o solicitar el desbloqueo manual al Administrador.

> **[Captura: Alerta de Respuestas No Coincidentes Intranet]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Intranet (Móvil)]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet. (Móvil).*

4. **Establecimiento de la nueva contraseña (Políticas y confirmación):**
   * *Acciones erróneas y validaciones:*
     * **Omisión o contraseña débil:** Si se intenta guardar dejando el campo vacío o incumpliendo los requisitos de seguridad, los indicadores permanecen pendientes, impidiendo el avance.
     * **Discrepancia en la confirmación:** Si el campo de repetición no coincide de manera exacta con la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Registrar una contraseña que satisfaga todos los requisitos y confirmarla con exactitud en la segunda casilla.

> **[Captura: Validaciones de Contraseña en Intranet]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet.*
>
> **[Captura: Validaciones de Contraseña en Intranet (Móvil)]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet. (Móvil).*

5. **Confirmación y retorno seguro:**
   * *Situación de control:* Tras procesar el cambio en el servidor, la pantalla `/reset-success` confirma la operación con la insignia de verificación y el mensaje *"Tu contraseña se actualizó"*, bloqueando retornos involuntarios con el botón de retroceso del navegador y obligando a iniciar sesión formalmente.
   * *Acción de corrección:* Hacer clic sobre el botón "Ir a iniciar sesión" y autenticarse con la nueva contraseña definitiva en la pantalla de acceso de la Intranet (`/login`).

> **[Captura: Pantalla de Éxito en Recuperación Intranet]**
> *Insignia circular de verificación, mensaje 'Tu contraseña se actualizó' y botón 'Ir a iniciar sesión' en la Intranet.*
>
> **[Captura: Pantalla de Éxito en Recuperación Intranet (Móvil)]**
> *Insignia circular de verificación, mensaje 'Tu contraseña se actualizó' y botón 'Ir a iniciar sesión' en la Intranet. (Móvil).*

#### 3.5.1.4. Cierre de Sesión por Inactividad y Alertas de Expiración

La plataforma del OLO cuenta con un mecanismo automático de seguridad que supervisa la interacción del usuario en tiempo real en los tres entornos del sistema (**Sitio Web Público**, **Intranet** y **Panel Administrativo**). Su propósito es proteger la confidencialidad de la información y salvaguardar las cuentas institucionales si un equipo de trabajo queda desatendido.

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
Al completarse el cierre automático, el sistema conduce al usuario a la pantalla de inicio de sesión (`/login`), donde el formulario presenta un **recuadro informativo superior** (banner azul con texto de advertencia) antes de los campos de correo y contraseña:

* **Alerta estándar por inactividad:**
  > *"Cerramos tu sesión porque estuviste 15 minutos sin actividad. Vuelve a entrar para continuar."*
* **Alerta especial en el Editor Visual (si la conexión impidió el autoguardado de emergencia):**
  > *"Cerramos tu sesión por inactividad, pero no pudimos guardar los últimos cambios del editor. Revisa la página antes de seguir."*
* **Alerta por sesión expirada:**
  > *"Tu sesión expiró. Vuelve a entrar para continuar donde estabas."*

Al reintroducir las credenciales corporativas `@sena.edu.co` y la contraseña definitiva, el sistema valida los datos y redirige al usuario de forma transparente a su pantalla de trabajo previa.

> **[Captura: Alerta de Sesión Expirada por Inactividad en Sitio Web]**
> *Recuadro informativo azul en el formulario de acceso del Sitio Web: "Cerramos tu sesión porque estuviste 15 minutos sin actividad. Vuelve a entrar para continuar."*
>
> **[Captura: Alerta de Sesión Expirada por Inactividad en Sitio Web (Móvil)]**
> *Recuadro informativo azul en el formulario de acceso del Sitio Web en dispositivo móvil.*
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
  1. Acceder a la configuración de privacidad del navegador web y asegurarse de que el almacenamiento local y las cookies estén permitidos para el dominio institucional del aplicativo.
  2. Evitar el uso de ventanas de incógnito si se desea conservar la configuración estética de contraste de manera permanente para sesiones futuras.

##### 4. La barra inferior fija en dispositivos móviles cubre botones o las últimas filas de una tabla
* **Situación:** Al consultar tablas de datos extensas (como usuarios, auditoría o revisiones) desde un teléfono móvil o tableta, la barra inferior fija de navegación (*Bottom Navigation*) parece obstaculizar la visualización de los últimos registros o botones de paginación.
* **Causa técnica y operativa:** Variaciones en el cálculo de la altura visible del navegador móvil provocadas por barras dinámicas del explorador (como la barra de direcciones de Chrome o Safari móvil), las cuales alteran la reserva de espacio inferior antes de que el usuario finalice el desplazamiento.
* **Acción correctiva:**
  1. Desplazar el contenido hacia arriba con el dedo hasta el final de la pantalla; la plataforma incorpora un margen de reserva inferior diseñado específicamente para asegurar que el último elemento quede completamente visible y operable por encima de la barra de botones.
  2. Si la barra del navegador continúa interfiriendo, configurar el explorador móvil para ocultar barras de navegación durante el desplazamiento o girar el dispositivo horizontalmente para ingresar al modo apaisado (*landscape*).

##### 5. Desincronización del contador de "Páginas en revisión"
* **Situación:** El círculo rojo con el número de borradores pendientes junto al ítem "Páginas en revisión" muestra una cifra desactualizada que no concuerda con las páginas que realmente se encuentran en espera dentro del módulo.
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

##### 1. Tarjeta de Páginas Publicadas sin resultados o vacía
* **Situación:** Una rama del árbol (Sitio web o Intranet) aparece en gris con el número **0** y no se despliega al tocarla, o la tarjeta completa no carga (muestra un guion "—" y un mensaje en rojo).
* **Posible causa:** (1) No existen páginas publicadas en ese entorno en el momento de la consulta. (2) Un fallo de red temporal impidió que el componente obtuviera la lista desde la base de datos al abrir el panel.
* **Acción correctiva:**
  1. Verificar en el menú de "Páginas en revisión" si los borradores aún están pendientes de aprobación (las páginas no aprobadas no aparecerán en esta tarjeta).
  2. Presionar la tecla `F5` para recargar el panel y forzar una nueva consulta al servidor.

##### 2. Gráficos de Visitas o Usuarios en blanco
* **Situación:** El diagrama de líneas de tráfico o el gráfico circular de roles se queda en blanco o muestra un indicador de carga permanente.
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
* **Situación:** Al dar clic en "Guardar" en el formulario de Nuevo Usuario, el sistema arroja una alerta roja y rechaza la creación.
* **Posible causa:** El correo ingresado no pertenece al dominio oficial obligatorio.
* **Acción correctiva:** Asegurarse de que el campo de correo termine estrictamente en `@sena.edu.co` sin espacios adicionales al final.

##### 2. Interfaz de Credenciales "Atrapada" (Botón de Cerrar Bloqueado)
* **Situación:** Se acaba de generar la contraseña temporal para un funcionario nuevo (o tras restablecerla), pero el botón de "Cerrar" aparece deshabilitado y no se puede salir de la ventana.
* **Posible causa:** Como mecanismo de prevención contra pérdida de claves irrecuperables, el aplicativo exige constancia de respaldo antes de cerrar.
* **Acción correctiva:** Presionar obligatoriamente el botón azul oscuro **"Copiar"**. Inmediatamente después de pulsarlo, el sistema liberará la acción y habilitará el botón de cierre.

##### 3. Alerta de "Fecha de caducidad vencida" al Intentar Activar
* **Situación:** Al encender el interruptor de "Estado" para devolver el acceso a un funcionario previamente suspendido, el sistema muestra una alerta de error y apaga el interruptor por la fuerza.
* **Posible causa:** La cuenta del usuario tiene configurada una "Fecha de caducidad" que ya expiró, por lo que las políticas le prohíben reactivar su acceso sin extenderle primero el periodo.
* **Acción correctiva:** Abrir el modal de edición mediante el ícono del lápiz en la fila del funcionario. Modificar el campo "Fecha de caducidad" seleccionando un nuevo límite futuro (o borrar el valor para hacer la cuenta permanente). Guardar e intentar activar nuevamente.

##### 4. Bloqueo al Intentar Eliminar al Último Administrador
* **Situación:** El Administrador presiona el botón rojo "Eliminar" en la alerta de advertencia, pero el sistema bloquea la acción y arroja una alerta de error, impidiendo el borrado.
* **Posible causa:** Se intentó borrar al único usuario Administrador activo restante en toda la plataforma. Aunque el sistema permite borrar usuarios con historial (como creadores de páginas), restringe de forma estricta que la plataforma se quede sin gestores.
* **Acción correctiva:** Si ese funcionario definitivamente debe ser retirado, es imperativo que primero se asigne el rol de Administrador a otro usuario activo en el sistema. Una vez exista un relevo, el sistema permitirá eliminar al anterior. Alternativamente, se le puede simplemente **Suspender** (apagar el interruptor de Estado).

#### 3.5.1.9. Validaciones y Solución de Problemas en la Gestión de Roles y Permisos

La configuración de roles y la asignación de permisos (cuyo procedimiento operativo regular se detalla en la [Sección 3.4.2.4.2: Submenú Roles y Permisos](#34242-submenú-roles-y-permisos)) cuenta con mecanismos de protección estructural para preservar la consistencia de los accesos institucionales y la integridad de las cuentas de usuario. A continuación se desglosan las principales situaciones, sus causas y las acciones correctivas correspondientes:

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
* **Situación:** Al hacer clic en el ícono de lápiz para editar un rol, el campo *"Nombre del rol"* se encuentra bloqueado, en tono grisáceo y con la etiqueta *"No modificable"*, sin permitir la edición del texto.
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
* **Situación:** En la fila correspondiente al rol *"Editor"*, el botón de basurero aparece en color gris deshabilitado (*cursor-not-allowed*) y no responde al clic.
* **Causa técnica y operativa:** El rol base `Editor` es el perfil matriz del cual heredan todos los roles derivados de la plataforma. Su existencia es obligatoria para la infraestructura del editor visual y se encuentra protegido por código fuente, por lo que su eliminación está inhabilitada de forma permanente.
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
  3. Pulsar el botón azul oscuro **"Editar permisos"**.
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
* **Acción correctiva:** Si no se requiere efectuar ajustes, cerrar la ventana modal mediante el botón **"Cancelar"** o la *"✕"* superior. Si se desea guardar, verificar que efectivamente se haya cambiado la descripción o alternado al menos un interruptor de permisos.

> **[Captura: Botón Guardar Deshabilitado sin Cambios]**
> *Pie de la ventana modal mostrando el mensaje informativo de ausencia de cambios y el botón deshabilitado.*
>
> **[Captura: Botón Guardar Deshabilitado sin Cambios (Móvil)]**
> *Pie de la ventana modal mostrando el mensaje informativo de ausencia de cambios en dispositivo móvil. (Móvil).*

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
**Situación:** El sistema no muestra la opción o bloquea el borrado de una página.
**Posible causa:** Se está intentando eliminar una ruta fija del sistema (como las interfaces de inicio de sesión o rutas administrativas), o bien la página seleccionada cuenta con enlaces activos en menús u otras secciones que provocarían errores de navegación 404.
**Acción:** Las rutas fijas del sistema no son eliminables. Si se trata de una página de contenido, se deben retirar primero todos los enlaces activos que apunten hacia ella en el menú de navegación y en las demás páginas antes de proceder con el borrado.

#### 3.5.2.4. Imposibilidad de crear nuevas secciones
**Situación:** Un editor no encuentra o no puede usar la opción para crear páginas nuevas.
**Posible causa:** Al usuario se le asignó un "Rol derivado de Editor" que no tiene activado el permiso manual de "Crear secciones".
**Acción:** El usuario debe solicitar al Administrador del sistema la activación de dicho permiso en el Panel Administrativo.

#### 3.5.2.5. Inicio de sesión y credenciales entre Sitio Web e Intranet
**Situación:** Un funcionario tiene dudas sobre si necesita dos contraseñas distintas o por qué debe volver a iniciar sesión al pasar del Sitio Web a la Intranet.
**Aclaración de la plataforma:**
* **Mismas credenciales:** La cuenta de usuario es centralizada y única en todo el sistema. El correo `@sena.edu.co` y la contraseña son exactamente los mismos para ambos portales.
* **Sesiones independientes:** Cada portal opera como un entorno web protegido por separado. Por ello, iniciar sesión en el Sitio Web no abre la sesión en la Intranet (ni viceversa); el usuario debe ingresar sus mismas credenciales en el formulario de acceso de cada portal cuando desee utilizarlo.

