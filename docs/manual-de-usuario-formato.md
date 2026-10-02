# MANUAL DE USUARIO DEL SISTEMA
## Observatorio Laboral y Ocupacional (OLO) — SENA

---

*Nota de estilo: Las capturas de pantalla integradas deben tener un tamaño pequeño o mediano (optimizadas) para mantener el manual intuitivo sin saturar el documento.*

---

## 3.1. Publico objetivo

El manual de usuario está dirigido a los diferentes perfiles que interactúan con la plataforma del Observatorio Laboral y Ocupacional (OLO):

### 3.1.1. Administradores del Sistema
Personal responsable de la gestión integral de cuentas de usuario, creación de nuevos roles personalizados (exclusivamente para roles de editores), asignación manual de permisos, aprobación y publicación de contenidos, procesamiento de cargas masivas de datos en Excel, consulta de la bitácora de auditoría y configuración general del sistema en el Panel Administrativo.

### 3.1.2. Editores de Contenido y Roles Hijos Derivados
Funcionarios autorizados para maquetar, estructurar y actualizar el contenido de las páginas web y boletines informativos mediante el editor visual de páginas, ajustándose a las secciones y permisos concedidos por la administración.

### 3.1.3. Directores y Subdirectores
Personal directivo del SENA que inicia sesión con cuenta corporativa `@sena.edu.co` para consultar en modalidad de solo lectura matrices de pertinencia, indicadores del mercado laboral y tableros analíticos en la Intranet del OLO.

> **[Captura: Perfiles de Usuario]**
> *Esquema visual ilustrativo de los tres perfiles principales de usuario (Administradores, Editores y Directivos) interactuando con los distintos módulos de la plataforma.*
>
> **[Captura: Perfiles de Usuario (Móvil)]**
> *Esquema visual ilustrativo de los tres perfiles principales de usuario (Administradores, Editores y Directivos) interactuando con los distintos módulos de la plataforma. (Vista en dispositivo móvil).*

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
> *Opción nativa del navegador web para la instalación del aplicativo como Aplicación Web Progresiva (PWA) en el dispositivo. (Vista en dispositivo móvil).*

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

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los perfiles autorizados del OLO.

#### 3.2.2.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, realizar búsquedas mediante los componentes interactivos, consultar indicadores, reproducir contenidos en los visores de videos y acceder a documentos mediante los visores de PDFs o botones de descarga libre en formato PDF sin necesidad de iniciar sesión.
3. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con cuenta corporativa (`@sena.edu.co`) al Panel Administrativo, al editor visual de páginas o a la Intranet del OLO.

> **[Captura: Consulta Ciudadana]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía.*
>
> **[Captura: Consulta Ciudadana (Móvil)]**
> *Exploración de contenidos públicos, consulta de indicadores y descarga libre de documentos disponible para la ciudadanía. (Vista en dispositivo móvil).*

#### 3.2.2.2. Qué puede hacer cada tipo de usuario

##### 3.2.2.2.1. Administrador
Corresponde a la máxima autoridad técnica y operativa dentro de la plataforma del observatorio.

* **Propósito del perfil:**
  Garantizar la administración integral, gobernanza, disponibilidad operativa y seguridad técnica del sistema. Es el encargado de la gestión de usuarios, el control editorial de publicaciones, la importación masiva de datos y la fiscalización del sistema mediante la bitácora de auditoría.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante credenciales corporativas obligatorias (`@sena.edu.co`). Dispone de acceso exclusivo al Panel Administrativo (`/admin`), entorno inaccesible para los demás perfiles. Asimismo, puede navegar libremente por el Sitio Web público y por la Intranet del OLO con plenas facultades de visualización y edición en línea.

* **Funciones y facultades principales:**
  * *Gestión integral de cuentas de usuario:* Registra nuevas cuentas de usuario en el OLO, asigna o revoca roles, activa o suspende cuentas y ejecuta el restablecimiento de contraseñas ante eventualidades o bloqueos (ver paso a paso en [Sección 3.4.2.4: Submenú Usuarios](#3424-gestión-de-accesos-usuarios-submenú-usuarios)).
  * *Creación de roles de editor y parametrización de permisos:* Crea perfiles personalizados exclusivamente bajo la tipología de editor (bajo la nomenclatura fija «Editor [Nombre]») y define manualmente («a mano») los accesos e interruptores de permisos sobre cada página o sección (ver paso a paso en [Sección 3.4.2.5: Submenú Roles](#3425-gestión-de-accesos-roles-y-permisos-submenú-roles)).
  * *Aprobación y control en la bandeja de revisión:* Examina los borradores remitidos por los editores mediante la previsualización interactiva y dispone de tres decisiones operativas:
    * *Aprobar:* Autoriza la publicación inmediata de la versión revisada para su despliegue público o en la Intranet.
    * *Rechazar:* Devuelve la versión al editor responsable con las observaciones y justificación de los cambios requeridos.
    * *Descartar / Eliminar (ícono de basurero):* Elimina definitivamente el borrador no procedente o enviado por error. Esta acción exige registrar obligatoriamente el motivo para la bitácora de auditoría y depura los archivos e imágenes huérfanas sin alterar la versión publicada.
    *(Ver procedimiento operativo de revisión en [Sección 3.4.2.6: Páginas en Revisión](#3426-aprobación-y-publicación-de-contenidos-páginas-en-revisión)).*
  * *Edición integral y gestión de páginas:* Accede al editor visual para maquetar directamente cualquier contenido en el Sitio Web o la Intranet, crear nuevas páginas y eliminar páginas dinámicas creadas por los editores (ver [Sección 3.4.3.2: Creación y Edición en el Lienzo](#3432-creación-y-edición-en-el-lienzo) y [Sección 3.4.3.4: Eliminación de Páginas Dinámicas](#3434-eliminación-de-páginas-dinámicas-paso-a-paso)).
  * *Carga masiva de información en Excel:* Importa y procesa actualizaciones masivas de datos ocupacionales, estadísticas e indicadores del observatorio mediante archivos en formato `.xlsx` (ver paso a paso en [Sección 3.4.2.9: Carga Masiva de Datos en Excel](#3429-actualizaciones-y-carga-masiva-de-datos-en-excel)).
  * *Supervisión mediante bitácora de auditoría:* Inspecciona el registro cronológico inmutable de eventos para verificar qué usuario realizó cada acción, los cambios ejecutados, las marcas de tiempo y las direcciones de origen (ver paso a paso en [Sección 3.4.2.7: Bitácora de Auditoría](#3427-auditoría-y-bitácora-de-eventos)).

* **Límites operativos y restricciones de seguridad:**
  * No puede modificar ni eliminar mediante el editor visual las rutas y vistas que no son gestionables desde el editor de páginas, tales como las interfaces de autenticación (inicio de sesión, recuperación de credenciales y preguntas de seguridad) y todas las rutas funcionales del Panel Administrativo (`/admin`), las cuales corresponden a la arquitectura fija de código del aplicativo.
  * No puede crear roles dentro de las jerarquías de Administrador ni de Director; la creación de roles nuevos se encuentra restringida exclusivamente a roles hijos de editor.
  * No puede omitir ni alterar el registro de auditoría; todas las acciones administrativas quedan grabadas de forma obligatoria e irreversible en la base de datos.

##### 3.2.2.2.2. Editor (Rol Base)
Corresponde al perfil técnico general facultado para la producción, maquetación y diseño de los contenidos del OLO.

* **Propósito del perfil:**
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
Corresponden a perfiles editoriales especializados creados por el Administrador para delimitar responsabilidades por dependencia o temática.

* **Propósito del perfil:**
  Permitir la participación distribuida de funcionarios en la maquetación y actualización de contenidos concretos, aplicando el principio de mínimo privilegio para limitar el alcance de su intervención únicamente a las páginas autorizadas.

* **Entorno de acceso y autenticación:**
  Inician sesión con credenciales corporativas (`@sena.edu.co`) en el Sitio Web público o en la Intranet del OLO. Al ingresar, el sistema redirige al usuario al inicio del portal y despliega el menú flotante de edición únicamente cuando navega por las páginas y secciones específicas que le hayan sido habilitadas.

* **Funciones y facultades principales:**
  * *Exclusividad de tipología:* Todo rol derivado creado en la plataforma pertenece obligatoriamente a la familia de editores y se registra bajo el formato estricto «Editor [Nombre]».
  * *Configuración manual de permisos («a mano»):* Nace sin ningún permiso predeterminado (privilegio cero). El Administrador habilita de forma selectiva los interruptores organizados dentro de las 5 secciones de permisos del sistema (ver contexto en [Sección 3.2.2.3: Estructura de Permisos](#3223-estructura-y-ámbitos-de-los-permisos-las-5-secciones-de-control) y procedimiento paso a paso en [Sección 3.4.2.5: Submenú Roles](#3425-gestión-de-accesos-roles-y-permisos-submenú-roles)).
  * *Capacidad equivalente según asignación:* Si el Administrador le otorga permisos completos (activando todas las páginas, la creación y el borrado), el rol hijo adquiere las mismas facultades operativas que el rol Editor base.
  * *Control de componentes globales:* La modificación de la cabecera y pie de página compartidos permanece bloqueada por defecto, salvo concesión expresa del Administrador.
  * *Ciclo editorial de borradores:* Maqueta los bloques en las páginas asignadas y remite las versiones trabajadas a la sección de **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación definitiva por parte del Administrador.
  * *Asignación automática y delegación de nuevas páginas:* Cuando un rol hijo que cuenta con permiso de creación genera una nueva página, el sistema otorga permisos de edición inmediatos únicamente al Administrador, al rol padre Editor base y a su propio rol creador. Los demás roles hijos de editor quedan sin acceso a dicha página; si otro rol especializado necesita colaborar o editarla, el Administrador debe otorgarle el permiso de forma manual («a mano») desde la opción de editar rol en el Panel Administrativo (ver [Sección 3.4.2.5: Submenú Roles](#3425-gestión-de-accesos-roles-y-permisos-submenú-roles)).

* **Límites operativos y restricciones de seguridad:**
  * No tienen acceso al Panel Administrativo (`/admin`).
  * No pueden publicar páginas directamente en producción sin la aprobación del Administrador.
  * No pueden intervenir ni editar páginas o secciones ajenas a las asignadas de forma explícita en su perfil.
  * No pueden crear ni eliminar páginas a menos que cuenten con el permiso manual activado específicamente para ello.
  * No pueden intervenir ni eliminar las rutas no gestionables desde el editor visual (pantallas de inicio de sesión y rutas administrativas), ni gestionar usuarios, roles, auditoría o cargas masivas.

##### 3.2.2.2.4. Director / Subdirector
Corresponde al perfil directivo enfocado en el monitoreo gerencial, el análisis de indicadores del mercado laboral y la toma de decisiones estratégicas del observatorio.

* **Propósito del perfil:**
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

Por este motivo, **los únicos roles cuyos permisos son personalizables y editables son los roles hijos o derivados de Editor** (creados bajo el formato «Editor [Nombre]»). Para garantizar un control seguro y granular sobre las facultades de estos roles especializados, la plataforma del OLO organiza los permisos configurables en **5 secciones funcionales**, ordenadas de menor a mayor alcance operativo:

1. **Acceso:** Controla las puertas de entrada a los dos entornos del sistema (el Sitio Web Público y la Intranet del OLO). Sin estos permisos activos, la cuenta no podrá autenticarse ni visualizar el contenido del portal correspondiente.
2. **Editar (Plantilla / Globales):** Regula la intervención sobre los componentes estructurales envolventes compartidos por todas las páginas de un entorno, específicamente la cabecera (header con menús y logos) y el pie de página (footer con enlaces y redes sociales), aplicables de forma independiente para el Sitio Web y para la Intranet.
3. **Secciones del sitio web:** Define de forma granular y página por página el acceso de edición sobre los contenidos del portal público (tales como Inicio, Política de Privacidad y cada una de las páginas dinámicas creadas en el sitio).
4. **Secciones de la intranet:** Controla individualmente la facultad de maquetar y actualizar las páginas y módulos analíticos internos de la Intranet del OLO (Inicio, Tasa de vinculación, Matriz de tendencias, Encuestas y páginas dinámicas internas).
5. **Qué puede hacer dentro del editor:** Determina las capacidades de acción estructural que el usuario puede ejercer dentro del lienzo de trabajo interactivo, tales como la creación de nuevas páginas o la eliminación definitiva de páginas dinámicas existentes.

*(Nota: En la [Sección 3.4.2.5: Submenú Roles](#3425-gestión-de-accesos-roles-y-permisos-submenú-roles) se describe detalladamente cada permiso individual y se ilustra el procedimiento operativo paso a paso para activarlos o desactivarlos mediante interruptores en el Panel Administrativo al crear o editar roles derivados).*

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

El acceso al ecosistema tecnológico del Observatorio Laboral y Ocupacional (OLO) comprende los mecanismos de navegación pública abierta y los procedimientos de autenticación, recuperación de credenciales y administración de cuentas de usuario para el personal autorizado. Las cuentas institucionales se gestionan de forma centralizada y unificada: un mismo usuario y contraseña son compartidos entre el Sitio Web y la Intranet, siendo los permisos asignados los que determinan a qué entorno puede ingresar cada funcionario.

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

##### 3.2.3.1.3. Enlace a la Intranet (Botón Intranet)
El botón fijo **"Intranet"** ubicado en la cabecera del portal (extremo superior derecho) no corresponde al inicio de sesión del Sitio Web Público, sino que constituye el enlace directo permanente hacia la plataforma privada de la Intranet del OLO. Al pulsarlo, el usuario es dirigido al entorno de la Intranet, cuya plataforma requiere autenticación para los funcionarios.

#### 3.2.3.2. Intranet del OLO

##### 3.2.3.2.1. Inicio de Sesión en el Entorno Privado de la Intranet
La Intranet es una plataforma privada e independiente orientada al seguimiento gerencial, análisis ocupacional y trabajo interno del SENA:
* **Acceso restringido con autenticación obligatoria:** A diferencia del portal público, la Intranet no permite navegación anónima ni libre. Toda persona debe autenticarse para ingresar mediante su propio formulario de acceso.
* **Perfiles habilitados:**
  * *Administradores:* Ingresan para supervisar contenidos, maquetar secciones internas o fiscalizar el entorno según sus facultades globales de gobierno.
  * *Editores (y roles derivados autorizados):* Ingresan para maquetar y actualizar secciones internas autorizadas en su perfil.
  * *Directores y Subdirectores:* Ingresan con cuenta corporativa `@sena.edu.co` para consultar los módulos de información, matrices e indicadores ocupacionales en modalidad de **solo lectura**, manteniendo protegida la información al no contar con permisos de edición ni administración.
* **Credenciales y validación:** Correo corporativo `@sena.edu.co` y contraseña asignada (requiere autorización de acceso a la Intranet). Al iniciar sesión exitosamente, el sistema despliega el entorno privado de la Intranet con los tableros analíticos e indicadores configurados. *(Para consultar la guía visual paso a paso del acceso a la Intranet, ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).*

#### 3.2.3.3. Procedimiento de Recuperación de Contraseña (Preguntas de Seguridad)
El sistema del Observatorio Laboral y Ocupacional cuenta con un mecanismo autónomo de restablecimiento de contraseña ante olvidos o bloqueos, unificado para todos los funcionarios tanto en el Sitio Web como en la Intranet:
* **Autonomía sin dependencia de correo externo:** A diferencia de plataformas que envían enlaces o códigos a buzones de correo externos, el aplicativo comprueba la identidad del titular validando las **tres preguntas de seguridad** configuradas obligatoriamente durante el primer ingreso al sistema. Esto previene bloqueos por filtros de spam o falta de disponibilidad de servidores de correo externos.
* **Cuenta única y sincronización de clave:** Al tratarse de un usuario institucional único y compartido entre ambas plataformas, recuperar o actualizar la contraseña desde cualquiera de los dos portales sincroniza de forma automática e inmediata el acceso en ambos.
* **Política de seguridad:** Una vez validadas con éxito las respuestas correspondientes, el usuario puede establecer de inmediato una nueva contraseña que satisfaga los lineamientos de seguridad de la plataforma (longitud mínima de 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Guía operativa paso a paso:** Para consultar el procedimiento interactivo en pantalla con las capturas de cada paso, remitirse a la **[Sección 3.4.1.3: Procedimiento de Recuperación de Contraseña](#3413-procedimiento-de-recuperación-de-contraseña)**.

#### 3.2.3.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet. El procedimiento operativo paso a paso y la interfaz para llevar a cabo esta labor se explican a detalle en la **[Sección 3.4.2.4: Gestión de Accesos: Usuarios](#3424-gestión-de-accesos-usuarios-submenú-usuarios)** de este manual.

#### 3.2.3.5. Primer Ingreso al Sistema (Configuración Inicial de la Cuenta)

Cuando el Administrador crea una cuenta nueva, el funcionario debe completar obligatoriamente la configuración inicial de seguridad antes de poder operar en la plataforma.

##### 3.2.3.5.1. Recepción de Credenciales Iniciales

Al crear la cuenta (cuyo procedimiento paso a paso se detalla en la [Sección 3.4.2.4: Submenú Usuarios](#3424-gestión-de-accesos-usuarios-submenú-usuarios)), el Administrador establece una **contraseña temporal** y la comunica de forma manual al funcionario a través del canal corporativo que considere apropiado (correo electrónico, mensaje de chat interno u otro medio). **El sistema no envía ningún correo automático de bienvenida.** La contraseña temporal no tiene fecha de expiración: permanece activa hasta que el funcionario la use para completar su primer ingreso.

Al acceder por primera vez con estas credenciales provisorias, el sistema solicita de manera obligatoria al funcionario completar la configuración inicial de seguridad:
* **Establecimiento de contraseña definitiva:** Registro de una clave personal e intransferible que cumpla con los 5 requisitos de la política de contraseñas robustas (ver [Sección 3.2.1.3: Requisitos de Credenciales](#3213-requisitos-de-credenciales-y-cuentas-de-acceso)).
* **Parametrización de preguntas de seguridad:** Selección y respuesta obligatoria de tres preguntas que habilitan el mecanismo autónomo de recuperación de cuenta ante eventuales bloqueos u olvidos.

El procedimiento se efectúa según el portal de acceso utilizado por el funcionario (Sitio Web Público o Intranet del OLO). Una vez validados estos datos, el sistema guarda la configuración definitiva y concede el acceso formal al portal o sección correspondiente según el rol asignado. *(Para consultar la guía visual paso a paso con las capturas de pantalla de este procedimiento para ambos ámbitos, ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).*

#### 3.2.3.6. Cierre de Sesión y Expiración Preventiva

El cierre de sesión seguro es una práctica obligatoria para salvaguardar la privacidad de las cuentas y proteger la información del observatorio, especialmente al operar en estaciones de trabajo compartidas o redes abiertas:
* **Cierre de sesión en el Panel Administrativo:** Los administradores finalizan su sesión activa mediante el menú desplegable de perfil, ubicado en la parte inferior del menú lateral izquierdo en computadores o en la barra superior en dispositivos móviles.
* **Cierre de sesión en el Sitio Web Público:** Los usuarios autenticados disponen de un botón flotante de salida ubicado en la esquina inferior izquierda de la pantalla, que permite cerrar la sesión directamente; al finalizarla, los botones flotantes desaparecen y la vista vuelve a la modalidad de consulta ciudadana estándar.
* **Cierre de sesión en la Intranet:** Administradores, editores y directivos autenticados cierran su sesión mediante el botón de salida segura ubicado en la esquina superior derecha de la barra superior de la Intranet (disponible tanto en computador como en dispositivos móviles).
* **Finalización de la sesión:** Al presionar el botón de salida segura, el sistema finaliza la sesión activa en el navegador y redirige al usuario a la pantalla de inicio de sesión correspondiente.
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
> *Esquema general del Panel Administrativo mostrando los elementos fijos estructurales: el menú lateral permanente (sidebar con accesos de navegación y perfil) y el área central de trabajo. (Vista en dispositivo móvil).*

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
> *Esquema general del Sitio Web Público mostrando la franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Sitio Web (Móvil)]**
> *Esquema general del Sitio Web Público mostrando la franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página. (Vista en dispositivo móvil).*

3. **Intranet del OLO:**
   * **Propósito:** Entorno privado y protegido orientado al seguimiento estratégico, consulta de tableros de indicadores y trabajo interno de directivos y funcionarios del SENA.
   * **Elementos y páginas fijas del sistema:**
     * *Pantalla de bloqueo y acceso obligatorio:* Página fija que intercepta cualquier navegación no autenticada, forzando el ingreso exclusivo con cuenta corporativa `@sena.edu.co`.
     * *Control de salida:* Acceso seguro de cierre de sesión siempre disponible en la barra superior.
   * **Componentes ajustables de Cabecera y Pie internos:**
     * Al igual que en el sitio público, el marco superior e inferior de la Intranet está respaldado por componentes configurables que los editores pueden adaptar según las secciones internas del observatorio.
   * **Área central dinámica:** Lienzo donde se presentan las secciones analíticas e indicadores, con la posibilidad de incorporar componentes opcionales de visualización como tableros de Power BI.

> **[Captura: Elementos Fijos Intranet]**
> *Esquema general de la Intranet mostrando la barra superior con los controles fijos (buscador interno y botón de cierre de sesión), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Intranet (Móvil)]**
> *Esquema general de la Intranet mostrando la barra superior con los controles fijos (buscador interno y botón de cierre de sesión), el área de contenido dinámico central y el pie de página. (Vista en dispositivo móvil).*

#### 3.3.1.2. Botón Flotante de Edición: Despliegue Condicional por Sesión y Permisos

Uno de los elementos interactivos más importantes en el Sitio Web y la Intranet es el **Botón Flotante de Edición (Menú de Edición)**. Aunque forma parte de la estructura visual de las páginas, **su visualización en pantalla es estrictamente condicional**: el sistema comprueba en tiempo real si el usuario ha iniciado sesión y cuáles permisos específicos tiene asignados antes de mostrarlo:

* **Caso 1: Usuario no autenticado (Ciudadanía y visitantes anónimos):**
  * El botón flotante **no se muestra en pantalla** para los visitantes. La página pública se presenta completamente limpia, sin barras ni herramientas de edición, garantizando una lectura despejada y cómoda para la ciudadanía.

> **[Captura: Vista Ciudadana sin Botón Flotante]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla.*
>
> **[Captura: Vista Ciudadana sin Botón Flotante (Móvil)]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla. (Vista en dispositivo móvil).*

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
> *Despliegue condicional del botón flotante de edición en pantalla para un usuario autenticado con permisos activos. (Vista en dispositivo móvil).*

* **Caso 3: Usuario autenticado sin permisos de edición (Directores y Subdirectores):**
  * Al iniciar sesión con cuenta corporativa `@sena.edu.co`, el sistema identifica que el usuario posee un perfil configurado en modo de **solo lectura**. Debido a que no cuenta con facultades de edición ni administración, el botón flotante **permanece completamente oculto**, impidiendo que el personal directivo ingrese por error al modo de diseño o altere contenidos.

> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante]**
> *Pantalla de la Intranet para perfiles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto.*
>
> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante (Móvil)]**
> *Pantalla de la Intranet para perfiles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto. (Vista en dispositivo móvil).*

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
> *Conjunto de botones estandarizados de la plataforma: guardado, descarte/eliminación con confirmación modal y previsualización. (Vista en dispositivo móvil).*

---

### 3.3.3. Mensajes del Sistema y Notificaciones

La plataforma del Observatorio Laboral y Ocupacional (OLO) implementa un sistema unificado y consistente de retroalimentación visual, alertas y notificaciones en pantalla. Su función principal es guiar la experiencia del usuario, advertir sobre condiciones de riesgo, prevenir inconsistencias o pérdidas de información y confirmar el resultado de cada acción en tiempo real.

Esta sección presenta las convenciones visuales, formatos de notificación y código cromático adoptados en los tres entornos del sistema (**Sitio Web Público**, **Intranet** y **Panel Administrativo**), sirviendo como marco de referencia para identificar e interpretar adecuadamente los mensajes durante los procedimientos descritos en la [Sección 3.4: Funcionalidades](#34-funcionalidades).

#### 3.3.3.1. Tipos y Formatos de Notificaciones en Pantalla

El sistema clasifica sus avisos e interacciones en cuatro formatos principales según su nivel de criticidad e impacto en el flujo operativo:

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

#### 3.3.3.2. Código Cromático y Convenciones Visuales

La plataforma emplea una paleta estandarizada de colores e iconografía institucional para que el usuario identifique instantáneamente la naturaleza y gravedad del aviso:

| Tono / Color | Severidad | Ícono Asociado | Significado y Contexto de Uso |
| :--- | :--- | :---: | :--- |
| **Verde** | **Éxito (Success)** | Check en círculo (✓) | Operación procesada de manera correcta. Se presenta al guardar borradores, publicar páginas aprobadas, actualizar contraseñas o culminar cargas masivas. |
| **Rojo** | **Error / Restricción (Danger / Error)** | Cruz o exclamación en círculo (✕ / ⨂) | Error crítico, datos no válidos, autenticación fallida, permisos insuficientes o bloqueo por protección contra enlaces rotos. |
| **Amarillo / Ámbar** | **Advertencia (Warning)** | Triángulo de precaución (⚠) | Situación que demanda atención o cautela del usuario para prevenir pérdidas de información, como sesiones inactivas próximas a expirar o confirmación previa a la eliminación de registros. |
| **Azul** | **Informativo (Info)** | Círculo con letra "i" (ℹ) | Instrucciones de apoyo, estados en espera, guías de diligenciamiento o aclaraciones operativas sobre el funcionamiento de un módulo. |

> **[Captura: Tipos de Alertas y Notificaciones en Pantalla]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante (toast), mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal interactivo de confirmación.*
>
> **[Captura: Tipos de Alertas y Notificaciones en Pantalla (Móvil)]**
> *Muestra visual de los formatos de retroalimentación de la interfaz: notificación flotante (toast), mensaje de validación en línea bajo campo de formulario, banner destacado de restricción y modal interactivo de confirmación. (Vista en dispositivo móvil).*

---

> [!NOTE]
> **Consulta de Errores Específicos y Catálogo de Validaciones:**
> Para consultar el desglose detallado de validaciones campo a campo, los mensajes de error específicos de cada formulario, sus causas técnicas y las instrucciones de solución paso a paso, diríjase a la [Sección 3.5.1: Catálogo de Validaciones y Solución de Problemas](#351-catálogo-de-validaciones-y-solución-de-problemas).

---

## 3.4. Funcionalidades

Paso a paso de las operaciones y flujos de trabajo de la plataforma: autenticación, búsquedas y filtros, gestión integral de información (CRUD), generación de reportes en pantalla y exportación de datos.

---

### 3.4.1. Procedimientos de Autenticación y Acceso

Paso a paso de las cuatro operaciones fundamentales de acceso y salida de la plataforma: primer ingreso para cuentas nuevas, inicio de sesión habitual, recuperación autónoma de contraseña olvidada mediante preguntas de seguridad y procedimiento de cierre de sesión seguro en todos los entornos.

#### 3.4.1.1. Flujo de Primer Ingreso

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema asociadas a este proceso con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.1: Validaciones en el Primer Ingreso](#3511-validaciones-en-el-primer-ingreso)).*

Cuando el Administrador crea una cuenta de usuario en la plataforma (procedimiento detallado paso a paso en la [Sección 3.4.2.4: Submenú Usuarios](#3424-gestión-de-accesos-usuarios-submenú-usuarios)), el sistema genera una **contraseña temporal provisoria**. Dado que la plataforma no envía correos automáticos ni notificaciones de bienvenida, el Administrador es el responsable de hacer llegar al nuevo funcionario, a través del canal o medio de comunicación que considere más conveniente (correo del SENA, chat interno, mensajería u otro medio), tanto el **correo corporativo registrado** como dicha **contraseña temporal**. Todo funcionario nuevo del SENA (Administradores, Editores de Contenido y Directores o Subdirectores) debe realizar de manera obligatoria esta configuración inicial por única vez antes de poder operar normalmente en el aplicativo.

El sistema del Observatorio Laboral y Ocupacional dispone de dos formularios de inicio de sesión independientes (uno en el Sitio Web Público y otro en la Intranet del OLO). Cualquier usuario creado por el Administrador puede iniciar sesión o completar su primer ingreso desde cualquiera de los dos portales, siempre que su cuenta cuente con los permisos correspondientes para ese entorno:

* **[Primer Ingreso desde el Sitio Web Público](#primer-ingreso-desde-el-sitio-web-público):** Permite configurar la cuenta desde el inicio de sesión del Sitio Web del OLO. Tras ingresar, acceden a operar las cuentas con permisos de administración (Panel Administrativo) o de edición de páginas (quienes no dispongan de estos permisos recibirán la indicación del sistema).
* **[Primer Ingreso desde la Intranet del OLO](#primer-ingreso-desde-la-intranet-del-olo):** Permite configurar la cuenta desde el inicio de sesión de la Intranet del OLO. Tras ingresar, acceden las cuentas autorizadas con permiso de acceso interno a la Intranet, como Administradores, Editores de Contenido o Directores y Subdirectores para consulta de tableros (quienes no cuenten con dicho permiso recibirán la alerta correspondiente).

##### Primer Ingreso desde el Sitio Web Público

Este procedimiento describe el paso a paso para el funcionario que inicia sesión por primera vez a través del Sitio Web Público del OLO:

1. **Ubicación del acceso en el Sitio Web:** En la franja azul superior del Sitio Web del OLO (banner GOV.CO), el funcionario ubica en el extremo derecho el texto interactivo con la **fecha y hora en vivo**. Al posar el cursor sobre este elemento, el sistema despliega la indicación *"Iniciar sesión"*. Al hacer clic, se abre la pantalla de inicio de sesión (`/login`).

> **[Captura: Acceso a Inicio de Sesión Sitio Web]**
> *Ubicación del texto interactivo de fecha y hora en el banner GOV.CO del Sitio Web Público para acceder al inicio de sesión.*
>
> **[Captura: Acceso a Inicio de Sesión Sitio Web (Móvil)]**
> *Ubicación del texto interactivo de fecha y hora en el banner GOV.CO del Sitio Web Público para acceder al inicio de sesión. (Vista en dispositivo móvil).*

2. **Ingreso con credenciales temporales:** En el formulario de inicio de sesión, se debe ingresar el correo corporativo asignado (`@sena.edu.co`) y la contraseña temporal comunicada por el Administrador. Luego, se debe presionar el botón **"Ingresar"**.

> **[Captura: Formulario de Inicio de Sesión Sitio Web]**
> *Formulario de acceso del Sitio Web Público diligenciado con correo corporativo y contraseña provisoria.*
>
> **[Captura: Formulario de Inicio de Sesión Sitio Web (Móvil)]**
> *Formulario de acceso del Sitio Web Público diligenciado con correo corporativo y contraseña provisoria. (Vista en dispositivo móvil).*

3. **Pantalla de bienvenida y configuración obligatoria:** Al comprobar los datos de acceso, el sistema identifica que se trata del primer ingreso del funcionario y presenta de forma automática la pantalla de primer ingreso (`/first-login`). En esta vista se solicita actualizar la seguridad de la cuenta antes de continuar hacia el portal.

> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web]**
> *Pantalla de primer ingreso en el Sitio Web con saludo al funcionario y solicitud de actualización de seguridad.*
>
> **[Captura: Pantalla de Bienvenida y Configuración Inicial Sitio Web (Móvil)]**
> *Pantalla de primer ingreso en el Sitio Web con saludo al funcionario y solicitud de actualización de seguridad. (Vista en dispositivo móvil).*

4. **Establecimiento de la contraseña definitiva:** En la pantalla de cambio de clave, el funcionario debe registrar su nueva contraseña personal:
   * En el campo **"Contraseña temporal"**, se digita la clave provisoria recibida.
   * En el campo **"Nueva contraseña"**, se escribe la nueva clave personal. La interfaz cuenta con un validador interactivo que confirma en tiempo real el cumplimiento de los 5 requisitos de seguridad de la política de contraseñas del SENA (mínimo 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
   * En el campo **"Ingresa nuevamente la contraseña"**, se reescribe la nueva clave para certificar la coincidencia exacta.
   * Se hace clic en el botón **"Continuar"**.

> **[Captura: Contraseña Definitiva Sitio Web]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web.*
>
> **[Captura: Contraseña Definitiva Sitio Web (Móvil)]**
> *Campos de ingreso de contraseña temporal, nueva clave y confirmación con validador de políticas de seguridad en el Sitio Web. (Vista en dispositivo móvil).*

5. **Configuración de preguntas de seguridad:** En la pantalla "Protege el acceso a tu cuenta", se deben configurar obligatoriamente las tres preguntas de seguridad para habilitar la recuperación de la cuenta ante un posible olvido:
   * Se despliega el menú selector y se elige una pregunta de la lista predefinida del sistema.
   * Se escribe la respuesta correspondiente en el campo de texto (la respuesta es confidencial y sensible a mayúsculas y caracteres).
   * Se pulsa el botón **"Continuar"** para repetir la selección con la segunda y tercera pregunta del catálogo.

> **[Captura: Preguntas de Seguridad Sitio Web]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad Sitio Web (Móvil)]**
> *Selector de preguntas del catálogo del sistema y registro de respuestas de seguridad en el Sitio Web. (Vista en dispositivo móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:** Al procesar las respuestas de seguridad, el sistema guarda la configuración definitiva y muestra el mensaje de confirmación **"¡Configuración completada!"**, recordando guardar las respuestas en un lugar seguro. Al presionar el botón **"Iniciar sesión"**, el sistema finaliza la sesión provisional y regresa a la pantalla de inicio de sesión (`/login`). El funcionario debe iniciar sesión con su contraseña definitiva recién creada, tras lo cual el aplicativo evalúa los permisos específicos de su cuenta:
   * **Administradores:** El sistema los redirige de forma directa al **Panel Administrativo** (`/admin/dashboard`) para gestionar usuarios, roles, bitácora de auditoría y revisión de contenidos.
   * **Editores de Contenido (y roles derivados autorizados):** El sistema los redirige a la **página de inicio del Sitio Web Público** (`/inicio`), donde se despliega de inmediato el **botón flotante de edición** en la esquina de la pantalla para maquetar páginas y gestionar contenidos autorizados.
   * **Directores y Subdirectores (cuentas sin permisos para este portal):** Al estar configurados exclusivamente para la consulta analítica en la Intranet y no poseer permisos de edición ni de acceso al panel en el Sitio Web, el sistema detiene el acceso y muestra la alerta: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolos a ingresar a través del portal de la Intranet (ver [Sección 3.5.1.1: Validaciones en el Primer Ingreso](#3511-validaciones-en-el-primer-ingreso)).

> **[Captura: Confirmación de Configuración Exitosa Sitio Web]**
> *Pantalla de éxito confirmando la configuración de la cuenta en el Sitio Web y botón para iniciar sesión.*
>
> **[Captura: Confirmación de Configuración Exitosa Sitio Web (Móvil)]**
> *Pantalla de éxito confirmando la configuración de la cuenta en el Sitio Web y botón para iniciar sesión. (Vista en dispositivo móvil).*

##### Primer Ingreso desde la Intranet del OLO

Este procedimiento lo ejecutan los funcionarios (Administradores, Editores autorizados y Directores o Subdirectores) que realizan su primer inicio de sesión directamente en el portal privado de la Intranet:

1. **Acceso a la Intranet:** El funcionario hace clic en el botón fijo **"Intranet"** ubicado en la esquina superior derecha de la cabecera del Sitio Web Público, o ingresa mediante la dirección web (URL) de la Intranet del OLO. Al tratarse de una plataforma privada que requiere autenticación, el sistema presenta la pantalla de bienvenida y acceso (`/login`), compuesta por un panel de bienvenida a la izquierda ("Bienvenido a NUESTRA INTRANET") y el formulario de inicio de sesión en el panel derecho.

> **[Captura: Acceso a la Intranet]**
> *Pantalla de acceso de la Intranet del OLO ('Bienvenido a NUESTRA INTRANET') con formulario en el panel derecho.*
>
> **[Captura: Acceso a la Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet del OLO con formulario en el panel derecho. (Vista en dispositivo móvil).*

2. **Ingreso con credenciales temporales:** En el formulario de la Intranet, se debe digitar el correo electrónico corporativo (`@sena.edu.co`) y la contraseña provisoria entregada por el Administrador. Luego, se debe presionar el botón principal **"Ingresar"** (o "Acceder a la Intranet").

> **[Captura: Formulario de Inicio de Sesión Intranet]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet.*
>
> **[Captura: Formulario de Inicio de Sesión Intranet (Móvil)]**
> *Diligenciamiento de correo corporativo del SENA y contraseña temporal en el formulario de la Intranet. (Vista en dispositivo móvil).*

3. **Bienvenida y pasos guiados de configuración:** Al verificar las credenciales temporales, el aplicativo reconoce que la cuenta requiere su configuración inicial y da paso a la pantalla de primer ingreso de la Intranet (`/first-login`). En esta vista se despliega un panel explicativo con el saludo y una barra de pasos guiados para orientar al funcionario durante el proceso.

> **[Captura: Pantalla de Pasos Guiados Intranet]**
> *Interfaz de primer ingreso de la Intranet con panel informativo izquierdo, formulario de configuración y barra de pasos inferior.*
>
> **[Captura: Pantalla de Pasos Guiados Intranet (Móvil)]**
> *Interfaz de primer ingreso de la Intranet con panel informativo, formulario de configuración y barra de pasos inferior. (Vista en dispositivo móvil).*

4. **Establecimiento de la contraseña definitiva:** En el formulario de cambio de clave, el usuario registra su nueva contraseña personal:
   * En el primer campo, se digita la clave provisoria en **"Contraseña temporal"**.
   * En el segundo campo, se escribe la **"Nueva contraseña"**. El recuadro interactivo de requisitos de seguridad comprueba en tiempo real el cumplimiento de los 5 lineamientos de seguridad (longitud mínima de 12 caracteres, mayúscula, minúscula, dígito y símbolo).
   * En el tercer campo, se reescribe la clave en **"Ingresa nuevamente la contraseña"**.
   * Se hace clic en el botón **"Continuar"** (o en el control de navegación siguiente) para validar la información y avanzar.

> **[Captura: Contraseña Definitiva Intranet]**
> *Formulario de actualización de contraseña de la Intranet con validador de requisitos de seguridad y controles de navegación.*
>
> **[Captura: Contraseña Definitiva Intranet (Móvil)]**
> *Formulario de actualización de contraseña de la Intranet con validador de requisitos de seguridad y controles de navegación. (Vista en dispositivo móvil).*

5. **Configuración de preguntas de seguridad:** En la pantalla "Escoge tus preguntas y respuestas":
   * Mediante el selector interactivo, se elige la primera pregunta de seguridad del catálogo oficial del sistema.
   * Se escribe la respuesta confidencial correspondiente en el campo de texto.
   * Se presiona el botón **"Continuar"** para responder secuencialmente la segunda y tercera pregunta.
   * Al completar la tercera respuesta, el botón principal cambia a **"Guardar"**. Al pulsarlo, el sistema almacena de forma segura las tres preguntas y respuestas de recuperación.

> **[Captura: Preguntas de Seguridad Intranet]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet.*
>
> **[Captura: Preguntas de Seguridad Intranet (Móvil)]**
> *Formulario de selección de preguntas y respuestas de seguridad con guía paso a paso en la Intranet. (Vista en dispositivo móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:** La pantalla presenta la confirmación: **"¡Configuración completada con éxito! Tu cuenta ya es segura."**, recordando que estas respuestas serán el único método para recuperar la cuenta ante olvidos. Al hacer clic en el botón **"Iniciar sesión"**, el sistema cierra la sesión provisional y regresa al formulario de acceso de la Intranet (`/login`). El usuario debe ingresar sus nuevas credenciales definitivas, momento en el cual el sistema valida su identidad y los permisos asignados:
   * **Administradores:** Acceden a la Intranet con plenas facultades de visualización, supervisión editorial y navegación global.
   * **Editores de Contenido (y roles derivados autorizados):** Acceden a la Intranet con el botón flotante habilitado para maquetar y actualizar las páginas internas autorizadas en su perfil.
   * **Directores y Subdirectores:** Ingresan a la **pantalla principal de la Intranet** (`/inicio`), habilitando la visualización interactiva de tableros de Power BI, indicadores ocupacionales y descarga de reportes en modalidad de **solo lectura**, sin menú de edición ni acceso al Panel Administrativo.
   * **Cuentas sin permiso para la Intranet:** Si el usuario no cuenta con autorización o permisos para ingresar a este portal, el sistema deniega la entrada mostrando la alerta: *"No tienes permisos para ingresar a la intranet."*

> **[Captura: Confirmación de Configuración Exitosa Intranet]**
> *Pantalla de éxito en la Intranet confirmando la correcta configuración y habilitando el botón para el inicio de sesión formal.*
>
> **[Captura: Confirmación de Configuración Exitosa Intranet (Móvil)]**
> *Pantalla de éxito en la Intranet confirmando la correcta configuración y habilitando el botón para el inicio de sesión formal. (Vista en dispositivo móvil).*

#### 3.4.1.2. Flujo de Inicio de Sesión Habitual

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema en el inicio de sesión con sus respectivas capturas de pantalla, remitirse a la [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).*

Una vez completado el primer ingreso y configurada la contraseña definitiva, los funcionarios autorizados acceden al sistema de forma habitual para sus labores operativas, editoriales o de consulta gerencial. Al igual que en la configuración inicial, la plataforma dispone de dos puntos de acceso independientes según el entorno de trabajo y el rol del usuario:

* **[Inicio de Sesión Habitual en el Sitio Web Público](#inicio-de-sesión-habitual-en-el-sitio-web-público):** Permite el acceso al personal con facultades de administración o de edición a través del enlace interactivo de fecha y hora en el banner GOV.CO.
* **[Inicio de Sesión Habitual en la Intranet del OLO](#inicio-de-sesión-habitual-en-la-intranet-del-olo):** Permite el ingreso a la plataforma privada para la consulta de módulos analíticos o labores de gestión interna según el rol asignado.

##### Inicio de Sesión Habitual en el Sitio Web Público

El portal web público no requiere inicio de sesión para la consulta de información abierta a la ciudadanía; para el personal del SENA con facultades administrativas o editoriales, la vía de entrada es el enlace interactivo de la franja superior del Estado:

*(Nota: Si el funcionario ingresa por primera vez con su contraseña temporal provisoria, el sistema reconocerá la configuración inicial pendiente y lo guiará de manera obligatoria por el flujo detallado en [Primer Ingreso desde el Sitio Web Público](#primer-ingreso-desde-el-sitio-web-público)).*

1. **Ubicación del enlace de acceso (Banner GOV.CO):** En la parte superior de la página, dentro de la franja azul oficial de GOV.CO, se ubica el texto interactivo de **fecha y hora** en la esquina derecha. Al colocar el cursor sobre el texto, se muestra la etiqueta flotante *"Iniciar sesión"*. Al hacer clic sobre dicho elemento, la pantalla se traslada directamente al formulario de ingreso (`/login`).
   *(Aclaración: El botón verde "Intranet" en el menú principal no es para iniciar sesión en la web, sino que conduce a la plataforma privada).*

> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO]**
> *Ubicación del texto interactivo de fecha y hora en el extremo derecho de la franja azul GOV.CO para acceder al inicio de sesión.*
>
> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO (Móvil)]**
> *Ubicación del texto interactivo de fecha y hora en la franja azul GOV.CO para acceder al inicio de sesión. (Vista en dispositivo móvil).*

2. **Visualización de la pantalla de inicio de sesión:** La pantalla presenta una tarjeta central de acceso limpia con el logotipo institucional del observatorio, dos casillas de texto para ingresar los datos y el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"** en la parte inferior para restablecer la clave en caso de pérdida.

> **[Captura: Formulario de Autenticación Sitio Web]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación.*
>
> **[Captura: Formulario de Autenticación Sitio Web (Móvil)]**
> *Pantalla de inicio de sesión del Sitio Web con las casillas de correo, contraseña y enlace de recuperación. (Vista en dispositivo móvil).*

3. **Diligenciamiento de correo y contraseña:** En el formulario de acceso, se completan ambas casillas:
   * En la casilla superior **"Correo electrónico"**, se escribe la cuenta corporativa institucional (`@sena.edu.co`).
   * En la casilla inferior **"Contraseña"**, se escribe la clave definitiva personal. Se puede hacer clic sobre el **ícono de ojo** situado a la derecha de la casilla para ver u ocultar los caracteres escritos y confirmar que la escritura sea correcta.

> **[Captura: Credenciales Definitivas en Sitio Web]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión.*
>
> **[Captura: Credenciales Definitivas en Sitio Web (Móvil)]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de inicio de sesión. (Vista en dispositivo móvil).*

4. **Clic en el botón Ingresar:** Se hace clic sobre el botón principal **"Ingresar"** (destacado con el color verde corporativo). La interfaz muestra una breve animación de carga mientras procesa el acceso hacia el portal.

> **[Captura: Ejecución de Inicio de Sesión Sitio Web]**
> *Botón 'Ingresar' activo para iniciar la sesión en el Sitio Web.*
>
> **[Captura: Ejecución de Inicio de Sesión Sitio Web (Móvil)]**
> *Botón 'Ingresar' activo para iniciar la sesión en el Sitio Web. (Vista en dispositivo móvil).*

5. **Validación de acceso según el perfil del usuario:** La plataforma comprueba el tipo de cuenta:
   * Si la cuenta corresponde a un Administrador o Editor, el sistema autoriza la entrada y da paso inmediato a la vista correspondiente.
   * Si se trata de un Director o Subdirector (cuyo perfil está destinado a la Intranet), la pantalla no avanza y muestra un recuadro de aviso con el mensaje: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, indicándole que debe ingresar por el portal de la Intranet (ver [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).

> **[Captura: Verificación de Autorización Sitio Web]**
> *Validación del tipo de usuario en pantalla para dar paso al entorno correspondiente o mostrar la indicación hacia la Intranet.*
>
> **[Captura: Verificación de Autorización Sitio Web (Móvil)]**
> *Validación del tipo de usuario en pantalla para dar paso al entorno correspondiente o mostrar la indicación hacia la Intranet. (Vista en dispositivo móvil).*

6. **Despliegue del entorno de trabajo en pantalla:** Al completarse el ingreso, la pantalla cambia automáticamente según el rol del funcionario:
   * **Administradores:** La pantalla muestra el **Panel Administrativo** (`/admin/dashboard`), con el menú lateral de fondo oscuro a la izquierda (Usuarios, Roles, Auditoría y Revisión) y las tarjetas de resumen informativo en el centro.
   * **Editores de Contenido:** El navegador regresa a la portada del **Sitio Web Público** (`/inicio`), donde aparece de inmediato en la esquina inferior derecha el **botón flotante circular de edición** (ícono de lápiz) para comenzar a maquetar y modificar páginas autorizadas.

> **[Captura: Redirección y Despliegue de Rol Sitio Web]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores.*
>
> **[Captura: Redirección y Despliegue de Rol Sitio Web (Móvil)]**
> *Entorno visible tras el inicio de sesión: Panel Administrativo con menú lateral para Administradores o portada pública con botón flotante de edición para Editores. (Vista en dispositivo móvil).*

##### Inicio de Sesión Habitual en la Intranet del OLO

La Intranet es una plataforma privada e independiente del Sitio Web Público, concebida para el seguimiento gerencial, análisis de indicadores y trabajo interno. Su sistema de inicio de sesión es totalmente independiente:

*(Nota: Si un nuevo funcionario (Administrador, Editor o Directivo) accede por primera vez con su contraseña temporal provisoria, el sistema activará de forma automática el flujo de primer ingreso descrito en [Primer Ingreso desde la Intranet del OLO](#primer-ingreso-desde-la-intranet-del-olo)).*

1. **Ubicación del botón de acceso a la Intranet:** Desde la página del Sitio Web Público, se hace clic sobre el botón destacado **"Intranet"** en la parte superior derecha de la cabecera, o bien se ingresa la dirección web oficial de la Intranet en el navegador.

> **[Captura: Botón Acceso Intranet en Cabecera]**
> *Botón 'Intranet' visible en la cabecera superior derecha del Sitio Web para dirigirse al entorno privado.*
>
> **[Captura: Botón Acceso Intranet en Cabecera (Móvil)]**
> *Botón 'Intranet' visible en la cabecera del Sitio Web para dirigirse al entorno privado. (Vista en dispositivo móvil).*

2. **Visualización de la pantalla de bienvenida y bloqueo:** Al tratarse de un espacio privado, se despliega una pantalla dividida en dos áreas: a la izquierda, un panel ilustrado de bienvenida institucional con el texto "Bienvenido a NUESTRA INTRANET"; a la derecha, el recuadro blanco con el formulario de ingreso.

> **[Captura: Pantalla Bloqueo Intranet]**
> *Pantalla de acceso de la Intranet con panel visual de bienvenida a la izquierda y formulario de ingreso a la derecha.*
>
> **[Captura: Pantalla Bloqueo Intranet (Móvil)]**
> *Pantalla de acceso de la Intranet con formulario de ingreso centrado en dispositivos móviles.*

3. **Diligenciamiento de credenciales en el formulario:** En el formulario de la Intranet, se completan ambas casillas:
   * En la casilla **"Correo electrónico"**, se escribe la cuenta corporativa `@sena.edu.co`.
   * En la casilla **"Contraseña"**, se digita la clave personal definitiva.

> **[Captura: Credenciales Definitivas Intranet]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de la Intranet.*
>
> **[Captura: Credenciales Definitivas Intranet (Móvil)]**
> *Casillas de correo corporativo y contraseña diligenciadas en el formulario de la Intranet. (Vista en dispositivo móvil).*

4. **Clic en el botón de ingreso:** Se presiona el botón verde principal **"Ingresar"** (o "Acceder a la Intranet") para enviar los datos e iniciar la comprobación.

> **[Captura: Botón Acceder Intranet]**
> *Acción de hacer clic sobre el botón 'Ingresar' en el formulario de la Intranet.*
>
> **[Captura: Botón Acceder Intranet (Móvil)]**
> *Acción de hacer clic sobre el botón 'Ingresar' en el formulario de la Intranet. (Vista en dispositivo móvil).*

5. **Comprobación de permiso de ingreso a la Intranet:** La plataforma confirma que la cuenta tenga habilitado el acceso a este entorno privado:
   * Si el funcionario tiene permiso concedido, el formulario da paso directo al interior de la Intranet.
   * Si la cuenta no cuenta con permiso asignado para ingresar a este portal, la pantalla muestra una alerta roja destacada: *"No tienes permisos para ingresar a la intranet."* (ver [Sección 3.5.1.2: Validaciones en el Inicio de Sesión Habitual](#3512-validaciones-en-el-inicio-de-sesión-habitual)).

> **[Captura: Verificación de Autorización en Intranet]**
> *Mensaje informativo en pantalla confirmando el acceso o mostrando la alerta de falta de permiso institucional.*
>
> **[Captura: Verificación de Autorización en Intranet (Móvil)]**
> *Mensaje informativo en pantalla confirmando el acceso o mostrando la alerta de falta de permiso institucional. (Vista en dispositivo móvil).*

6. **Despliegue de los módulos y herramientas según rol:** La interfaz se abre mostrando los contenidos correspondientes a cada perfil:
   * **Administradores:** Visualizan todas las secciones de la Intranet con libertad de navegación y herramientas de supervisión activas.
   * **Editores de Contenido:** Acceden a las páginas internas autorizadas, visualizando el **botón flotante de edición** para maquetar bloques de contenido.
   * **Directores y Subdirectores:** Ingresan directamente a la **pantalla principal de la Intranet** (`/inicio`), visualizando en pantalla los **tableros interactivos de Power BI**, indicadores del mercado laboral y botones de descarga de reportes en modalidad de **solo lectura** (sin botones de edición ni accesos administrativos).

> **[Captura: Inicio Exitoso Intranet]**
> *Pantalla principal de la Intranet mostrando los tableros analíticos de Power BI e indicadores gerenciales en pantalla.*
>
> **[Captura: Inicio Exitoso Intranet (Móvil)]**
> *Pantalla principal de la Intranet mostrando los tableros analíticos de Power BI e indicadores gerenciales en pantalla. (Vista en dispositivo móvil).*

#### 3.4.1.3. Procedimiento de Recuperación de Contraseña

*(Nota: Para consultar las posibles situaciones de error, validaciones de campos y alertas del sistema en este proceso, consulte la [Sección 3.5.1.3: Validaciones en la Recuperación de Contraseña](#3513-validaciones-en-la-recuperación-de-contraseña)).*

*(Aclaración — Cuenta única y sincronización de credenciales: Las cuentas de usuario son compartidas entre el Sitio Web y la Intranet; los permisos asignados determinan a qué entorno se puede ingresar. Restablecer la contraseña desde cualquiera de los dos portales actualiza de inmediato el acceso en ambos).*

Este procedimiento permite a cualquier funcionario restablecer de forma autónoma su clave de acceso ante olvidos o bloqueos, validando su identidad mediante las tres preguntas de seguridad configuradas durante el primer ingreso, sin requerir intervención del administrador ni depender del envío de correos electrónicos externos:

* **[Recuperación de Contraseña desde el Sitio Web Público](#recuperación-de-contraseña-desde-el-sitio-web-público):** Flujo de recuperación para funcionarios y editores a partir de la tarjeta de inicio de sesión del portal público.
* **[Recuperación de Contraseña desde la Intranet del OLO](#recuperación-de-contraseña-desde-la-intranet-del-olo):** Flujo de recuperación para directivos y personal interno desde la pantalla de bienvenida y acceso de la Intranet.

##### Recuperación de Contraseña desde el Sitio Web Público

1. **Ubicación del enlace de recuperación en el Sitio Web:** En la pantalla de inicio de sesión del Sitio Web (`/login`), a la cual se accede mediante el texto interactivo de fecha y hora de la franja GOV.CO, se ubica en la parte inferior de la tarjeta central el enlace interactivo **"*(¿Olvidaste tu contraseña?)*"**. Al hacer clic sobre él, el sistema traslada al usuario a la pantalla de recuperación (`/recovery`).

> **[Captura: Enlace de Recuperación en Sitio Web]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en la parte inferior del formulario de inicio de sesión del Sitio Web.*
>
> **[Captura: Enlace de Recuperación en Sitio Web (Móvil)]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en el formulario de inicio de sesión del Sitio Web. (Vista en dispositivo móvil).*

2. **Ingreso del correo corporativo institucional:** En la pantalla con el título *"¿Olvidaste tu contraseña?"*, se digita la cuenta de correo corporativo institucional (`@sena.edu.co`) en la casilla **"Correo SENA"** y se presiona el botón azul oscuro **"Continuar"**. El sistema valida el formato del correo y comprueba si la cuenta dispone de preguntas de seguridad configuradas.

> **[Captura: Ingreso de Correo de Recuperación Sitio Web]**
> *Casilla de correo institucional diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web.*
>
> **[Captura: Ingreso de Correo de Recuperación Sitio Web (Móvil)]**
> *Casilla de correo institucional diligenciada y botón 'Continuar' en el formulario de recuperación del Sitio Web. (Vista en dispositivo móvil).*

3. **Respuesta a las preguntas de seguridad:** En la pantalla *"Verifica tu identidad"*, la interfaz despliega una a una las tres preguntas de seguridad seleccionadas por el usuario durante su primer ingreso, indicando el avance mediante puntos indicadores. Se digita la respuesta confidencial correspondiente en el campo de texto y se pulsa el botón **"Continuar"** para avanzar entre preguntas hasta completar el cuestionario.

> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web]**
> *Cuestionario interactivo presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Sitio Web (Móvil)]**
> *Cuestionario interactivo presentando las preguntas de seguridad registradas y campo de respuesta en el Sitio Web. (Vista en dispositivo móvil).*

4. **Establecimiento de la nueva contraseña:** Al validar satisfactoriamente las respuestas, la pantalla *"Crea tu nueva contraseña"* habilita los campos **"Nueva contraseña"** y **"Confirmar contraseña"**. El usuario digita su nueva clave personal verificando que cumpla con los 5 requisitos de la política de seguridad del SENA y presiona el botón **"Guardar contraseña"**.

> **[Captura: Restablecimiento de Contraseña Sitio Web]**
> *Formulario de ingreso de nueva contraseña con validador interactivo de requisitos de seguridad en el Sitio Web.*
>
> **[Captura: Restablecimiento de Contraseña Sitio Web (Móvil)]**
> *Formulario de ingreso de nueva contraseña con validador interactivo de requisitos de seguridad en el Sitio Web. (Vista en dispositivo móvil).*

5. **Confirmación de actualización y retorno al acceso:** La interfaz presenta la pantalla de confirmación exitosa con la insignia verde y el mensaje: *"Tu contraseña se actualizó. Ya puedes entrar al panel con tu nueva contraseña."*. Al presionar el botón **"Ir a iniciar sesión"**, el sistema redirige automáticamente a la pantalla de acceso (`/login`) para ingresar con la nueva clave (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

> **[Captura: Confirmación de Clave Actualizada Sitio Web]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión.*
>
> **[Captura: Confirmación de Clave Actualizada Sitio Web (Móvil)]**
> *Pantalla de éxito indicando la actualización correcta de la contraseña y botón de retorno al inicio de sesión. (Vista en dispositivo móvil).*

##### Recuperación de Contraseña desde la Intranet del OLO

1. **Ubicación del enlace de recuperación en la Intranet:** En la pantalla de bienvenida y acceso privado de la Intranet (`/login`), se ubica bajo el formulario de credenciales el enlace interactivo **"¿Olvidaste tu contraseña?"**. Al hacer clic sobre dicho enlace, la pantalla se traslada a la vista de recuperación de la Intranet (`/recovery`).

> **[Captura: Enlace de Recuperación en Intranet]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet.*
>
> **[Captura: Enlace de Recuperación en Intranet (Móvil)]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en la tarjeta de acceso de la Intranet. (Vista en dispositivo móvil).*

2. **Ingreso del correo corporativo en la Intranet:** En la pantalla dividida de la Intranet, dentro de la tarjeta derecha con el título *"Ingresa tu correo SENA"*, se escribe la cuenta institucional `@sena.edu.co` en la casilla correspondiente y se pulsa el botón verde principal **"Comenzar"** para iniciar la comprobación de identidad.

> **[Captura: Ingreso de Correo de Recuperación Intranet]**
> *Tarjeta de recuperación de la Intranet con el campo de correo institucional y botón 'Comenzar'.*
>
> **[Captura: Ingreso de Correo de Recuperación Intranet (Móvil)]**
> *Tarjeta de recuperación de la Intranet con el campo de correo institucional y botón 'Comenzar'. (Vista en dispositivo móvil).*

3. **Respuesta a las preguntas de seguridad en la Intranet:** La plataforma presenta el asistente guiado de comprobación de identidad (`/security-questions`). El funcionario responde una a una las preguntas de seguridad registradas en su perfil y presiona el botón para avanzar hasta enviar la verificación final al sistema.

> **[Captura: Preguntas de Seguridad en Recuperación Intranet]**
> *Asistente guiado de preguntas de seguridad con indicador de avance en la Intranet.*
>
> **[Captura: Preguntas de Seguridad en Recuperación Intranet (Móvil)]**
> *Asistente guiado de preguntas de seguridad con indicador de avance en la Intranet. (Vista en dispositivo móvil).*

4. **Establecimiento de la nueva contraseña en la Intranet:** Superada la validación de identidad, la pantalla de restablecimiento (`/reset-password`) despliega las casillas para ingresar la nueva clave y certificar la coincidencia en la casilla de confirmación. Al verificarse los requisitos de seguridad, se hace clic sobre el botón verde **"Guardar contraseña"**.

> **[Captura: Restablecimiento de Contraseña Intranet]**
> *Campos de nueva clave y confirmación con panel de directivas de seguridad en la Intranet.*
>
> **[Captura: Restablecimiento de Contraseña Intranet (Móvil)]**
> *Campos de nueva clave y confirmación con panel de directivas de seguridad en la Intranet. (Vista en dispositivo móvil).*

5. **Confirmación y retorno al acceso de la Intranet:** Se despliega la pantalla ilustrada de confirmación (`/reset-success`) con el mensaje *"¡Genial, tu clave ha sido actualizada con éxito! Ya puedes ingresar a tu cuenta con tu nuevo código de acceso"*. Al presionar el botón de inicio, el sistema traslada al usuario a la pantalla de login de la Intranet para acceder a la plataforma (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)).

> **[Captura: Confirmación de Clave Actualizada Intranet]**
> *Pantalla de éxito institucional confirmando la actualización de la contraseña en la Intranet.*
>
> **[Captura: Confirmación de Clave Actualizada Intranet (Móvil)]**
> *Pantalla de éxito institucional confirmando la actualización de la contraseña en la Intranet. (Vista en dispositivo móvil).*

#### 3.4.1.4. Procedimiento de Cierre de Sesión

*(Nota: Para consultar el comportamiento ante el cierre involuntario por inactividad, la advertencia preventiva y las alertas de sesión expirada en la pantalla de acceso, remitirse a la [Sección 3.5.1.4: Cierre de Sesión por Inactividad y Alertas de Expiración](#3514-cierre-de-sesión-por-inactividad-y-alertas-de-expiración)).*

El sistema provee mecanismos específicos de salida segura según el entorno en el que se encuentre trabajando el usuario:

##### Cierre de Sesión desde el Panel Administrativo
1. **Acceso al menú de perfil:** Se debe hacer clic o pulsar sobre el nombre o foto de perfil del usuario, ubicado en la parte inferior del **menú lateral izquierdo** en computadores de escritorio, o en la **barra superior (Navbar)** al operar desde dispositivos móviles (ver capturas comparativas abajo).
2. **Selección de la opción:** En el menú desplegable que aparece (hacia arriba en el lateral de escritorio o hacia abajo en la barra móvil), seleccionar la opción **"Cerrar sesión"**.
3. **Confirmación:** El sistema cerrará la sesión activa y redirigirá automáticamente a la pantalla de inicio de sesión (`/login`).

> **[Captura: Cierre de Sesión Panel Admin]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo con la opción "Cerrar sesión" visible.*
>
> **[Captura: Cierre de Sesión Panel Admin (Móvil)]**
> *Menú desplegable de perfil en la barra superior del Panel Administrativo con la opción "Cerrar sesión" visible. (Vista en dispositivo móvil).*

##### Cierre de Sesión desde el Sitio Web Público
1. **Ubicación del control de salida flotante:** Al mantener una sesión activa, en la esquina inferior izquierda de la pantalla se despliega de manera fija el **botón flotante de cierre de sesión** (en contraposición al botón flotante de edición situado en la esquina inferior derecha; ver capturas abajo).
2. **Ejecución:** Hacer clic o pulsar sobre dicho botón flotante.
3. **Confirmación y retorno:** El sistema finaliza de inmediato la sesión activa en toda la plataforma; ambos botones flotantes (edición y cierre de sesión) desaparecen automáticamente y la pantalla se actualiza a la vista estándar de consulta ciudadana.

> **[Captura: Botón Flotante de Cierre de Sesión en Sitio Web]**
> *Ubicación del botón flotante de cierre de sesión en la esquina inferior izquierda del Sitio Web Público, en paralelo al botón flotante de edición en la esquina inferior derecha.*
>
> **[Captura: Botón Flotante de Cierre de Sesión en Sitio Web (Móvil)]**
> *Ubicación del botón flotante de cierre de sesión en la esquina inferior izquierda del Sitio Web Público, en paralelo al botón flotante de edición en la esquina inferior derecha. (Vista en dispositivo móvil).*

##### Cierre de Sesión desde la Intranet
1. **Ubicación del control de salida:** En la esquina superior derecha de la barra superior de la Intranet (tanto en la vista de escritorio como en la cabecera compacta móvil), ubicar el botón de salida segura identificado con el ícono de cerrar sesión (ver capturas abajo).
2. **Ejecución:** Hacer clic o pulsar sobre el botón **"Cerrar sesión"**.
3. **Confirmación:** El sistema finalizará la sesión activa y redirigirá de inmediato a la pantalla de inicio de sesión de la Intranet (`/login`).

> **[Captura: Cierre de Sesión Intranet]**
> *Botón de salida segura ('Cerrar sesión') en la barra superior de la Intranet.*
>
> **[Captura: Cierre de Sesión Intranet (Móvil)]**
> *Botón de salida segura ('Cerrar sesión') en la barra superior compacta de la Intranet. (Vista en dispositivo móvil).*

---

### 3.4.2. Panel Administrativo

El Panel Administrativo (`/admin`) constituye el centro de gobierno y control integral del Observatorio Laboral y Ocupacional (OLO), de acceso exclusivo para el rol **Administrador**. A continuación se detalla su estructura visual y se consolidan en una única secuencia operativa todos los procedimientos de gestión de usuarios, roles, aprobación editorial, seguridad, auditoría, respaldos y actualizaciones masivas de la plataforma.

#### 3.4.2.1. Estructura Visual, Navegación y Menú de Perfil
El entorno del Panel Administrativo está diseñado para facilitar la gestión eficiente del observatorio tanto en estaciones de trabajo como en dispositivos móviles:

1. **Barra Lateral de Navegación (Sidebar):**
   * **Retorno al Sitio Web:** En la parte superior, el logotipo institucional del OLO funciona como enlace permanente para regresar a la vista pública del portal.
   * **Navegación Modular:** Acceso directo al **Dashboard**, grupo colapsable **Accesos** (con los submenús *Usuarios* y *Roles y Permisos*), **Auditoría**, **Respaldos** y **Actualizaciones** (Carga Masiva).
   * **Indicador numérico de revisiones:** El ítem **"Páginas en revisión"** integra un contador rojo dinámico que muestra en tiempo real la cantidad de borradores remitidos por los editores pendientes de aprobación.
   * **Controles auxiliares:** En la parte inferior del menú se ubican el botón de **Búsqueda rápida** (que abre el modal interactivo de localización) y el alternador de tema (**Modo claro / Modo oscuro**).
2. **Menú de Perfil y Salida Segura:**
   * Al hacer clic sobre el nombre del usuario o foto en el pie de la barra lateral, se despliega el menú contextual con acceso directo a **"Mi perfil"** (gestión de datos personales y clave) y la opción de salida segura **"Cerrar sesión"**.
3. **Adaptabilidad en Dispositivos Móviles:**
   * En pantallas compactas, la barra superior reúne el selector de perfil, el botón de notificaciones (campana interactiva con modal de avisos por vencer), la lupa de búsqueda y el alternador de tema, complementado por una barra inferior fija para navegar rápidamente entre módulos.

> **[Captura: Navegación y Perfil Admin]**
> *Menú lateral mostrando el logo superior (retorno al sitio web), la alerta numérica roja en revisión y el menú desplegable de perfil.*
>
> **[Captura: Navegación y Perfil Admin (Móvil)]**
> *Menú lateral mostrando el logo superior (retorno al sitio web), la alerta numérica roja en revisión y el menú desplegable de perfil. (Vista en dispositivo móvil).*

---

#### 3.4.2.2. Buscador Interno del Panel Administrativo
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

#### 3.4.2.3. Tablero Principal y Métricas de Gestión (Dashboard)
Al ingresar al Panel Administrativo (`/admin/dashboard`), el Administrador visualiza el resumen consolidado de la actividad del observatorio:

1. **Tarjetas de métricas (Cards):** En la zona superior, una serie de tarjetas numéricas resumen el estado actual del sistema (ej. "Usuarios Activos", "Páginas Publicadas", "Borradores en Revisión").

> **[Captura: Paso 1]**
> *Evidencia visual de la acción descrita en el paso 1.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 1. (Vista en dispositivo móvil).*

2. **Gráficos de actividad:** En la zona central, diagramas de barras o líneas muestran el flujo de visitas al observatorio y la frecuencia de actualizaciones en las últimas semanas.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

3. **Actividad reciente:** En la parte inferior, un panel resumido muestra las últimas 5 acciones ejecutadas en la plataforma, permitiendo verificar de un vistazo quién está operando el sistema.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*

---

#### 3.4.2.4. Gestión de Accesos: Usuarios (Submenú: Usuarios)
En la barra lateral, bajo el grupo **"Accesos"**, se encuentra la administración centralizada de cuentas de usuario:

1. **Acceso al módulo:** En el menú lateral izquierdo, desplegar "Accesos" y hacer clic en **"Usuarios"**.

> **[Captura: Paso 1]**
> *Acceso al submenú Usuarios en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al submenú Usuarios en el menú lateral. (Vista en dispositivo móvil).*

2. **Botón "Nuevo Usuario":** En la esquina superior derecha, hacer clic en el botón de creación para abrir el modal de registro de funcionarios.

> **[Captura: Paso 2]**
> *Botón "Nuevo Usuario" en la cabecera del módulo.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Botón "Nuevo Usuario" en la cabecera del módulo. (Vista en dispositivo móvil).*

3. **Formulario de registro:** Se deben diligenciar los campos obligatorios del funcionario:
   * **Nombre completo**
   * **Correo electrónico institucional** (debe ser estrictamente `@sena.edu.co`)
   * **Rol asignado** (Administrador, Editor base o cualquier rol hijo derivado)

> **[Captura: Paso 3]**
> *Formulario modal de registro de nuevo usuario.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Formulario modal de registro de nuevo usuario. (Vista en dispositivo móvil).*

4. **Generación de credenciales temporales:** Al confirmar la creación mediante el botón **"Crear Usuario"**, el sistema genera automáticamente una **contraseña temporal provisoria** y la despliega en pantalla dentro de un recuadro destacado con botón de copiado rápido.
   * **Responsabilidad de comunicación:** El Administrador debe copiar dicha clave y hacérsela llegar al funcionario a través de los canales internos del SENA (correo electrónico institucional, chat institucional u otro medio formal). El sistema no envía correos de bienvenida de forma automática.
   * En el primer inicio de sesión del funcionario, el sistema le exigirá de forma obligatoria el cambio de clave y la configuración de sus preguntas de seguridad (ver [Sección 3.4.1.1: Flujo de Primer Ingreso](#3411-flujo-de-primer-ingreso)).

> **[Captura: Paso 4]**
> *Recuadro con la contraseña temporal generada y botón de copiado rápido.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Recuadro con la contraseña temporal generada. (Vista en dispositivo móvil).*

5. **Reenvío o reseteo manual de credenciales:** Si un usuario olvida su contraseña o no configuró sus preguntas, el Administrador puede hacer clic en el **ícono de llave** en la fila del usuario para regenerar una nueva contraseña temporal.

6. **Edición y suspensión de cuentas:** En la tabla general de usuarios:
   * **Editar:** Ícono de lápiz para modificar el nombre o el rol asignado.
   * **Suspender / Activar:** Interruptor o botón en la columna de estado. Suspender a un usuario revoca de inmediato todas sus sesiones activas e impide futuros inicios de sesión sin eliminar su historial de auditoría.

---

#### 3.4.2.5. Gestión de Accesos: Roles y Permisos (Submenú: Roles)
Permite al Administrador gestionar los roles del sistema y crear perfiles con permisos granulares:

1. **Acceso al módulo:** En el menú lateral izquierdo, bajo "Accesos", hacer clic en **"Roles"** (o "Roles y Permisos").

> **[Captura: Paso 1]**
> *Acceso al submenú Roles en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al submenú Roles en el menú lateral. (Vista en dispositivo móvil).*

2. **Roles del sistema:** La tabla muestra los roles existentes:
   * **Roles base predefinidos:** `Administrador` (superusuario de plataforma con control total no editable) y `Editor` (rol base de contenidos con permisos completos sobre el editor visual).
   * **Roles derivados (Hijos de Editor):** Perfiles personalizados creados por el Administrador para delimitar qué páginas específicas o qué acciones puede realizar un grupo de funcionarios.

> **[Captura: Paso 2]**
> *Listado de roles predefinidos y derivados en el sistema.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Listado de roles predefinidos y derivados en el sistema. (Vista en dispositivo móvil).*

3. **Creación o edición de roles con permisos granulares:**
   * **Botón "Nuevo Rol":** Abre el modal de configuración de perfiles.
   * **Nombre y descripción:** Asignar una denominación clara al rol derivado (ej. "Editor Regional Antioquia", "Revisor Prensa").
   * **Matriz de permisos:** El Administrador puede marcar o desmarcar permisos específicos organizados por categorías:
     * **Gestión de Páginas:** Crear páginas, editar borradores, enviar a revisión, eliminar páginas dinámicas.
     * **Componentes Globales:** Habilitar o restringir la edición de la Cabecera (Header) y Pie de página (Footer) de la plataforma.
     * **Secciones específicas:** Seleccionar exactamente sobre qué páginas dinámicas o estáticas del Sitio Web o de la Intranet tiene potestad el rol.
     * **Operaciones Especiales:** Autorización para realizar Carga Masiva en Excel o consulta de reportes analíticos.
     * En el pie del modal, se detalla un resumen de los cambios efectuados antes de confirmar.
     * Al hacer clic en el botón **"Guardar permisos"** (o **"Guardar Rol"**), los cambios se aplican de manera inmediata y afectarán a todos los usuarios asignados a dicho rol.
   
   * **Delegación de páginas nuevas a otros roles:** Cuando un editor crea una página nueva en el sistema, esta solo queda habilitada automáticamente para el Administrador, para el rol base Editor y para el rol creador. Si otros roles derivados requieren intervenir o editar esa página, el Administrador debe ingresar a este submenú, hacer clic en el ícono de lápiz sobre el rol correspondiente, buscar la página dentro de "Secciones del sitio web" o "Secciones de la intranet", y encender manualmente su interruptor de edición.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*

##### 3.4.2.5.1. Eliminación de Roles Derivados

1. **Verificación previa:** El Administrador debe confirmar que ningún usuario activo tenga ese rol asignado. Si existen usuarios con el rol, el sistema bloqueará la eliminación.

> **[Captura: Bloqueo Eliminar Rol]**
> *Alerta del sistema bloqueando la eliminación de un rol que aún tiene usuarios asignados.*
>
> **[Captura: Bloqueo Eliminar Rol (Móvil)]**
> *Alerta del sistema bloqueando la eliminación de un rol que aún tiene usuarios asignados. (Vista en dispositivo móvil).*

2. **Reasignación obligatoria:** Si el rol tiene usuarios asignados, el Administrador debe primero editar cada uno de esos usuarios (Sección 3.4.2.4, paso 6) y asignarles otro rol antes de continuar.

3. **Eliminación del rol:** Una vez el rol no tenga usuarios asignados, en la lista de roles se debe hacer clic en el **ícono de basurero** de la fila correspondiente.

4. **Confirmación:** El sistema mostrará una ventana de confirmación. Se debe hacer clic en **"Eliminar rol"** para confirmar. La acción quedará registrada en la bitácora de auditoría.

---

#### 3.4.2.6. Aprobación y Publicación de Contenidos: Páginas en Revisión
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

5. **Toma de decisión:** Se debe utilizar uno de los botones de acción: Botón Verde para **Aprobar** (pasa a producción), Botón Naranja para **Rechazar** (devuelve al editor con observaciones) o el Basurero para **Descartar**.

> **[Captura: Paso 5]**
> *Uso de los botones de decisión.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Uso de los botones de decisión. (Vista en dispositivo móvil).*

6. **Confirmación obligatoria para descarte:** Si se pulsa el botón de basurero para descartar un borrador no procedente o remitido por error, el sistema desplegará una ventana modal de seguridad. Es obligatorio registrar el motivo de la anulación para la bitácora de auditoría antes de confirmar la eliminación definitiva del borrador.

> **[Captura: Confirmación Descarte]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, mostrando la exigencia del registro obligatorio del motivo para auditoría.*
>
> **[Captura: Confirmación Descarte (Móvil)]**
> *Ventana modal de confirmación para el descarte de versiones en revisión, mostrando la exigencia del registro obligatorio del motivo para auditoría. (Vista en dispositivo móvil).*

---

#### 3.4.2.7. Auditoría y Bitácora de Eventos
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

##### 3.4.2.7.1. Exportación de la Bitácora de Auditoría

Tras aplicar los filtros deseados, el sistema permite exportar los registros visibles en la tabla:

1. **Botón de exportación:** En la parte superior derecha de la tabla de auditoría, se debe hacer clic en el botón **"Exportar"**.
2. **Selección de formato:** El sistema ofrecerá los formatos de descarga disponibles (`.xlsx` o `.csv`).
3. **Descarga:** El archivo se generará con los registros actualmente filtrados y se descargará automáticamente al dispositivo del Administrador.

> **[Captura: Exportar Auditoría]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles.*
>
> **[Captura: Exportar Auditoría (Móvil)]**
> *Botón de exportación en la tabla de auditoría y opciones de formato disponibles. (Vista en dispositivo móvil).*

> **Nota sobre retención de registros:** La bitácora conserva el historial de eventos de forma permanente e indefinida. Los registros no tienen fecha de expiración y no pueden ser eliminados por ningún rol.

##### 3.4.2.7.2. Tipos de Eventos Registrados en la Bitácora

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

#### 3.4.2.8. Respaldos y Restauración de Páginas (Versiones Puck)
El módulo de **Respaldos** (`/admin/respaldos`) constituye el centro de control de versiones históricas de todas las páginas creadas y administradas desde el Editor Visual (Puck), tanto para el Sitio Web Público como para la Intranet. Su propósito es permitir al Administrador auditar el historial de publicaciones, previsualizar versiones archivadas que fueron reemplazadas y restaurar cualquiera de ellas de manera atómica a producción en caso de errores o contingencias.

1. **Tabla de páginas con respaldo activo:**
   La interfaz lista de forma automática todas las páginas que cuentan con al menos una **versión anterior archivada** disponible para restaurar. Para cada registro se visualiza:
   * **Página:** Título de la página, distintivo de ámbito (*Sitio web* o *Intranet*) y número de versión activa actual.
   * **Editado por:** Nombre del editor que maquetó los cambios en el lienzo de Puck.
   * **Publicado por:** Nombre del administrador que aprobó y publicó la versión.
   * **Fechas:** Marcas de tiempo de edición y de publicación formal.
   * **Versión anterior:** Botón con ícono de **Ojo** (*Ver versión anterior*) para acceder al visor de respaldo.

> **[Captura: Paso 1]**
> *Tabla principal del módulo de Respaldos mostrando el listado de páginas con versiones archivadas disponibles.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Tabla principal del módulo de Respaldos mostrando el listado de páginas con versiones archivadas disponibles. (Vista en dispositivo móvil).*

2. **Barra de filtros de búsqueda:**
   Permite localizar rápidamente páginas respaldadas mediante criterios específicos:
   * **Ámbito:** Filtrar entre páginas del *Sitio web* o de la *Intranet*.
   * **Editor / Publicador:** Listas desplegables con los funcionarios que han intervenido en las publicaciones.
   * **Rango de fechas:** Selectores de calendario (*Publicado desde* / *Publicado hasta*).
   * **Limpiar filtros:** Botón para reiniciar los parámetros de búsqueda.

> **[Captura: Paso 2]**
> *Uso de la barra de filtros para ubicar versiones por ámbito, editor y fechas.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Uso de la barra de filtros para ubicar versiones por ámbito, editor y fechas. (Vista en dispositivo móvil).*

3. **Previsualización de la versión anterior archivada:**
   Al hacer clic en el ícono de **Ojo** de cualquier fila, el sistema despliega la ventana modal de consulta de respaldo:
   * Presenta los metadatos completos de la versión archivada (número de versión, autor, fecha y ámbito).
   * Proporciona un enlace interactivo directo para **abrir la vista previa de la página** en el visor Puck (`/preview/[slug]?versionId=...`), permitiendo al Administrador inspeccionar con total fidelidad cómo lucía el contenido antes de ser reemplazado.

> **[Captura: Paso 3]**
> *Ventana modal de vista previa de la versión anterior archivada con enlace interactivo.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ventana modal de vista previa de la versión anterior archivada con enlace interactivo. (Vista en dispositivo móvil).*

4. **Restauración atómica a producción:**
   Dentro del modal de consulta, el Administrador dispone del botón **"Restaurar versión anterior"**:
   * **Validación de concurrencia (Protección contra sobreescritura):** Antes de ejecutar la restauración, el sistema comprueba en tiempo real si algún editor está modificando la página en ese instante. Si detecta una sesión de edición activa, bloquea el proceso e informa el nombre del funcionario que la está interviniendo.
   * **Confirmación de seguridad:** Si la página no está bloqueada, se abre una ventana modal de confirmación advirtiendo que la versión archivada pasará a ser la versión activa del portal.
   * **Publicación inmediata:** Al confirmar, la versión anterior se publica automáticamente en el portal público o en la Intranet y el evento queda grabado de forma inmutable en la bitácora de auditoría.

> **[Captura: Paso 4]**
> *Ventana modal de confirmación y advertencia previa para restaurar la versión archivada a producción.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Ventana modal de confirmación y advertencia previa para restaurar la versión archivada a producción. (Vista en dispositivo móvil).*

5. **Depuración y limpieza de versiones antiguas:**
   En la cabecera superior del módulo, el botón rojo **"Depurar"** permite al Administrador abrir el asistente de depuración para eliminar versiones históricas obsoletas o borradores antiguos que ya no sean requeridos, optimizando el rendimiento y almacenamiento de la plataforma.

> **[Captura: Paso 5]**
> *Ventana modal de depuración de versiones históricas de páginas.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Ventana modal de depuración de versiones históricas de páginas. (Vista en dispositivo móvil).*

---

#### 3.4.2.9. Actualizaciones y Carga Masiva de Datos en Excel
Módulo de procesamiento masivo, accesible desde el menú lateral bajo **"Actualizaciones"** (o "Carga Masiva").

1. **Acceso al módulo:** En el menú lateral, se debe hacer clic en **"Actualizaciones"**.

> **[Captura: Paso 1]**
> *Acceso al módulo Carga Masiva en el menú lateral.*
>
> **[Captura: Paso 1 (Móvil)]**
> *Acceso al módulo Carga Masiva en el menú lateral. (Vista en dispositivo móvil).*

2. **Descarga de plantilla oficial:** Antes de subir cualquier dato, el usuario debe hacer clic en el botón **"Descargar Plantilla Excel"**. Esto asegura que las columnas, formatos de celda y encabezados coincidan de forma estricta con el esquema esperado por la base de datos.

> **[Captura: Paso 2]**
> *Botón para descargar la plantilla oficial en formato .xlsx.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Botón para descargar la plantilla oficial en formato .xlsx. (Vista en dispositivo móvil).*

3. **Diligenciamiento de la plantilla:** El usuario diligencia el archivo respetando los tipos de datos de cada columna sin alterar los nombres de las cabeceras.
4. **Carga del archivo:** Se debe arrastrar el archivo diligenciado al área punteada de carga (**"Arrastra tu archivo aquí"**) o hacer clic para seleccionarlo desde el explorador de archivos del sistema operativo (formatos permitidos: `.xlsx`, `.xls`; peso máximo: 10 MB).

> **[Captura: Paso 4]**
> *Zona de arrastre y selección del archivo Excel.*
>
> **[Captura: Paso 4 (Móvil)]**
> *Zona de arrastre y selección del archivo Excel. (Vista en dispositivo móvil).*

5. **Prevalidación automática:** El sistema analiza la estructura del archivo antes de impactar la base de datos. Si detecta campos vacíos obligatorios, tipos de datos incorrectos o filas duplicadas, mostrará una lista detallada con el **número de fila exacto** y el **error encontrado**. El botón de procesamiento permanecerá bloqueado hasta que el usuario corrija los errores y cargue el archivo corregido.

> **[Captura: Paso 5]**
> *Panel de prevalidación con la lista de errores encontrados por fila.*
>
> **[Captura: Paso 5 (Móvil)]**
> *Panel de prevalidación con la lista de errores encontrados por fila. (Vista en dispositivo móvil).*

6. **Confirmación y ejecución:** Con la prevalidación aprobada (0 errores), se habilitará el botón verde **"Procesar Carga"**. Al hacer clic, una barra de progreso indicará el avance del procesamiento.

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

---

#### 3.4.2.10. Perfil de Usuario ("Mi perfil" y "Configuración")
Accesible desde el menú desplegable de perfil ubicado en la parte inferior del menú lateral del Panel Administrativo. Permite al Administrador —y a cualquier usuario autenticado con acceso al panel— gestionar su información personal y preferencias.

##### 3.4.2.10.1. Sección "Mi Perfil"

Contiene la información de identificación del usuario dentro del sistema:

* **Nombre completo:** Nombre registrado en la cuenta. Puede ser actualizado por el propio usuario desde este campo.
* **Correo corporativo:** Muestra el correo `@sena.edu.co` vinculado a la cuenta. Este campo es de solo lectura y no puede ser modificado por el usuario; cualquier cambio de correo debe ser gestionado por el Administrador.
* **Foto de perfil:** Campo opcional. El usuario puede subir una imagen desde su dispositivo (formatos permitidos: `.jpg`, `.png`; tamaño máximo: 2 MB).
* **Rol asignado:** Muestra el rol activo del usuario en el sistema (solo lectura).
* **Cambio de contraseña:** Permite al usuario actualizar su contraseña actual sin necesidad de pasar por el flujo de recuperación. Para ello, se debe ingresar la contraseña actual, la nueva contraseña y su confirmación, cumpliendo la política de seguridad (Sección 3.2.1.3).

> **[Captura: Mi Perfil]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, foto, correo y cambio de contraseña.*
>
> **[Captura: Mi Perfil (Móvil)]**
> *Vista del módulo "Mi Perfil" en el Panel Administrativo con los campos de nombre, foto, correo y cambio de contraseña. (Vista en dispositivo móvil).*

Flujo para actualizar los datos:
1. El usuario modifica los campos deseados en el formulario.
2. Se debe hacer clic en el botón **"Guardar cambios"**.
3. El sistema muestra una notificación *toast* verde confirmando la actualización exitosa de la información.

##### 3.4.2.10.2. Sección "Configuración"

Contiene las preferencias operativas del usuario:

* **Actualización de preguntas de seguridad:** Permite al usuario reconfigurar sus tres preguntas y respuestas de seguridad. Requiere confirmar la contraseña actual antes de realizar cambios.
* **Notificaciones:** Activa o desactiva la recepción de alertas del sistema (ej. notificación cuando un borrador es aprobado o rechazado).

> **[Captura: Configuración Usuario]**
> *Vista del módulo "Configuración" en el Panel Administrativo con las opciones de preguntas de seguridad y notificaciones.*
>
> **[Captura: Configuración Usuario (Móvil)]**
> *Vista del módulo "Configuración" en el Panel Administrativo con las opciones de preguntas de seguridad y notificaciones. (Vista en dispositivo móvil).*

---

### 3.4.3. Gestión Editorial y Contenido Dinámico en el Editor Visual

Guía de operaciones para el diseño, maquetación y actualización de páginas y contenidos en el Sitio Web Público y la Intranet mediante el editor visual interactivo basado en bloques (Puck).

Esta sección aborda el uso de la herramienta del Editor Visual, disponible para usuarios con rol de Administrador o Editor (incluyendo roles derivados autorizados), mediante la cual se diseña y actualiza el contenido del portal.

#### 3.4.3.1. Acceso a las opciones de Edición (Botón Flotante)
1. **Visualización del botón:** Al iniciar sesión con un rol autorizado (Administrador o Editor), se debe ubicar el **botón circular flotante con un ícono de lápiz** en la pantalla del portal.

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

#### 3.4.3.2. Creación y Edición en el Lienzo
1. **Creación:** Se debe seleccionar la opción **"Crear página"** en el menú del botón flotante; el sistema solicitará digitar un título y una ruta URL. Al completar y confirmar el formulario, la nueva página se crea en estado de borrador.
   * *Asignación automática de permisos:* De forma inmediata, el sistema habilita el permiso de edición únicamente para el Administrador, para el rol padre Editor base y para el rol del editor que la creó. Los demás roles hijos de editor quedan sin acceso a la página a menos que un Administrador les conceda el permiso manualmente desde el Panel Administrativo (**Accesos > Roles > Editar Rol**).

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
> *Arrastre de un componente seleccionado hacia una nueva posición en el lienzo del Editor Visual. (Vista en dispositivo móvil).*

##### 3.4.3.3.2. Eliminar un Componente del Lienzo

1. **Selección:** Se debe hacer clic sobre el componente que se desea retirar del lienzo.
2. **Botón de eliminación:** En la barra de control superior del componente seleccionado, se debe hacer clic en el **ícono de basurero** (destacado en rojo).
3. **Resultado:** El componente se retira del lienzo de manera inmediata. Esta acción puede revertirse mediante la función Deshacer (Sección 3.4.3.3.3) mientras no se guarde el borrador.

> **[Captura: Eliminar Componente]**
> *Barra de control del componente seleccionado mostrando el ícono de basurero para su eliminación.*
>
> **[Captura: Eliminar Componente (Móvil)]**
> *Barra de control del componente seleccionado mostrando el ícono de basurero para su eliminación. (Vista en dispositivo móvil).*

##### 3.4.3.3.3. Deshacer y Rehacer Cambios

El Editor Visual dispone de un historial de acciones en sesión:

* **Deshacer (Ctrl + Z / Cmd + Z):** Revierte la última acción realizada en el lienzo. Puede aplicarse múltiples veces de forma consecutiva.
* **Rehacer (Ctrl + Y / Cmd + Shift + Z):** Vuelve a aplicar la acción que fue deshecha.

> **Nota importante:** El historial de deshacer/rehacer es exclusivo de la sesión activa de edición. Al hacer clic en **"Guardar Borrador"** o al cerrar el editor, el historial se reinicia y no es posible revertir los cambios guardados mediante esta función.

> **[Captura: Botones Deshacer Rehacer]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual.*
>
> **[Captura: Botones Deshacer Rehacer (Móvil)]**
> *Botones de deshacer y rehacer en la barra de herramientas superior del Editor Visual. (Vista en dispositivo móvil).*

##### 3.4.3.3.4. Edición de la Cabecera y Pie de Página Globales

La cabecera y el pie de página son componentes envolventes globales del portal. Su edición está disponible para el rol **Administrador**, el rol **Editor base** y para los **Roles hijos** a quienes el Administrador haya habilitado explícitamente este permiso.

1. **Acceso:** Desde el menú del botón flotante de edición en cualquier página, el usuario debe seleccionar la opción **"Editar cabecera"** o **"Editar pie"**.

> **[Captura: Menú Editar Cabecera]**
> *Opción de edición de cabecera en el menú flotante del editor.*
>
> **[Captura: Menú Editar Cabecera (Móvil)]**
> *Opción de edición de cabecera en el menú flotante del editor. (Vista en dispositivo móvil).*

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
> *Opción "Eliminar página" seleccionada en el menú flotante del editor visual. (Vista en dispositivo móvil).*

3. **Validación automática de enlaces activos (Protección contra enlaces rotos):** El sistema escanea en tiempo real todo el portal. Si la página está vinculada en el menú de navegación principal (cabecera o pie) o referenciada en enlaces de otras páginas, el borrado se bloquea inmediatamente y el sistema arroja una alerta roja impidiendo la eliminación (ver [Sección 3.5.1.5: Prevención de enlaces rotos](#3515-prevención-de-enlaces-rotos-bloqueos-de-eliminación) y [Sección 3.5.2.3: Bloqueo al intentar eliminar páginas](#3523-bloqueo-al-intentar-eliminar-páginas)). En tal caso, el usuario debe ingresar primero a la edición de la cabecera/pie ([Sección 3.4.3.3: Gestión Avanzada en el Editor Visual](#3433-gestión-avanzada-en-el-editor-visual)) o a las páginas enlazadas para retirar dichos vínculos antes de repetir el intento.

> **[Captura: Alerta Enlaces Rotos Bloqueo]**
> *Alerta del sistema bloqueando el borrado de la página debido a enlaces activos detectados en la plataforma.*
>
> **[Captura: Alerta Enlaces Rotos Bloqueo (Móvil)]**
> *Alerta del sistema bloqueando el borrado de la página debido a enlaces activos detectados en la plataforma. (Vista en dispositivo móvil).*

4. **Ventana modal de confirmación y digitación obligatoria del título:** Si no existen enlaces dependientes, el sistema desplegará la ventana modal de confirmación de seguridad. Para evitar eliminaciones accidentales, el usuario debe digitar de manera idéntica y exacta el título de la página en el campo de texto requerido.

> **[Captura: Modal Eliminar Página]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página.*
>
> **[Captura: Modal Eliminar Página (Móvil)]**
> *Ventana de confirmación de seguridad para la eliminación de páginas dinámicas con requisito de digitación exacta del título de la página. (Vista en dispositivo móvil).*

5. **Confirmación definitiva:** Una vez digitado el título idéntico, se activará el botón de confirmación en color rojo **"Eliminar definitivamente"**. Al hacer clic, la página y sus borradores quedarán eliminados del sistema.
6. **Constancia en auditoría:** La página desaparece de la vista pública y del editor, pero el evento queda grabado de forma automática e inmutable en la bitácora de auditoría del sistema (Sección 3.4.2.7), conservando el usuario ejecutor, la fecha, la hora y el registro de la acción.

---

### 3.4.4. Consultas Ciudadanas, Búsquedas y Visualizadores de Información

Procedimientos para la localización de contenidos en el portal público, consulta de tableros analíticos en la Intranet, visualización de documentos y descarga directa de información institucional.

#### 3.4.4.1. Búsquedas y Filtros en el Portal Público

##### 3.4.4.1.1. Uso del Buscador Global
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

##### 3.4.4.1.2. Búsqueda con Filtros Avanzados y Consulta de Información
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

---

#### 3.4.4.2. Visualizadores y Tableros Analíticos en Pantalla

##### 3.4.4.2.1. Uso de tableros BI en la Intranet (Power BI)
En las páginas o secciones de la Intranet que integren este componente maquetable, los directivos y funcionarios autorizados pueden consultar tableros analíticos interactivos de Power BI embebidos. Cabe destacar que este es un componente opcional en el catálogo de bloques del editor visual, por lo que su visualización depende de la maquetación definida por los editores para cada página. Cuando el componente está presente, los usuarios pueden utilizar sus controles internos (filtros por período, región o sector) para actualizar gráficos y tablas en tiempo real sin recargar la página.

> **[Captura: Tablero BI]**
> *Tablero interactivo de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis.*
>
> **[Captura: Tablero BI (Móvil)]**
> *Tablero interactivo de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis. (Vista en dispositivo móvil).*

##### 3.4.4.2.2. Visor de PDFs y Documentos Normativos
El componente de visor de documentos permite a los usuarios leer y revisar archivos PDF oficiales (boletines, resoluciones, manuales o informes) directamente dentro de la interfaz del portal, con controles integrados de navegación de páginas y opción de lectura inmersiva.

> **[Captura: Visor de PDF]**
> *Visor de documentos y publicaciones en PDF integrado en la página.*
>
> **[Captura: Visor de PDF (Móvil)]**
> *Visor de documentos y publicaciones en PDF integrado en la página. (Vista en dispositivo móvil).*

##### 3.4.4.2.3. Visor de Videos y Recursos Multimedia
A través del bloque de recursos visuales, los usuarios pueden reproducir contenidos audiovisuales, cápsulas informativas y videos del OLO directamente en la página, con controles de reproducción estándar y adaptabilidad a dispositivos móviles.

> **[Captura: Visor de Videos]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio.*
>
> **[Captura: Visor de Videos (Móvil)]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio. (Vista en dispositivo móvil).*

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
4. Se debe confirmar el nombre asignado a la aplicación y pulsar en **"Agregar"** en la esquina superior derecha.

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
> *Desviación involuntaria hacia la pantalla de acceso de la Intranet al pulsar el botón erróneo en el Sitio Web Público. (Vista en dispositivo móvil).*

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
> *Mensajes de validación de campos requeridos, dominio institucional y alerta general de credenciales erróneas en el Sitio Web. (Vista en dispositivo móvil).*

3. **Pantalla de bienvenida y verificación del estado de cuenta:**
   * *Situaciones anómalas y respuestas del sistema:*
     * **Sesión provisional expirada o no iniciada:** Si el usuario ingresa de forma manual a la ruta `/first-login` sin una sesión activa o si la sesión caducó por inactividad, la plataforma detiene la carga con la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`, facilitando el enlace directo para regresar a la pantalla de acceso.
     * **Cuenta sin configuraciones pendientes:** Si la cuenta ya había completado el proceso con anterioridad (por ejemplo, desde otra pestaña del navegador), el sistema no solicita credenciales temporales inexistentes; en su lugar, presenta el aviso: `"Tu cuenta ya está configurada. No hay nada pendiente: tu contraseña y tus preguntas de seguridad están al día."` junto con el botón `"Ir al panel"`.
   * *Acción de corrección:* Iniciar sesión nuevamente en el portal para que el aplicativo evalúe los pendientes activos del perfil.

> **[Captura: Alerta de Estado de Cuenta en Primer Ingreso Sitio Web]**
> *Aviso del sistema ante sesiones caducadas o mensaje informativo cuando la cuenta ya completó la configuración inicial.*
>
> **[Captura: Alerta de Estado de Cuenta en Primer Ingreso Sitio Web (Móvil)]**
> *Aviso del sistema ante sesiones caducadas o mensaje informativo cuando la cuenta ya completó la configuración inicial. (Vista en dispositivo móvil).*

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
> *Validador de requisitos de seguridad con condiciones incompletas y alerta por falta de coincidencia en la confirmación. (Vista en dispositivo móvil).*

5. **Configuración de preguntas de seguridad (Reglas de catálogo y respuestas):**
   * *Acciones erróneas y validaciones:*
     * **Omisión de pregunta:** Si el usuario no despliega el catálogo ni selecciona una pregunta, el sistema bloquea el paso indicando: `"Selecciona una pregunta"`.
     * **Respuesta vacía o con espacios:** Si no se escribe texto en el campo de respuesta o se ingresan únicamente espacios en blanco, se resalta: `"La respuesta es requerida"`.
     * **Preguntas repetidas:** El selector interactivo bloquea y desactiva automáticamente las preguntas seleccionadas en pasos anteriores para impedir la duplicación de ítems en el perfil.
   * *Acción de corrección:* Seleccionar una pregunta diferente en cada uno de los tres pasos y registrar una respuesta confidencial válida.

> **[Captura: Validaciones en Preguntas de Seguridad Sitio Web]**
> *Alertas por omisión de selección de pregunta del catálogo y validación de respuesta obligatoria en el Sitio Web.*
>
> **[Captura: Validaciones en Preguntas de Seguridad Sitio Web (Móvil)]**
> *Alertas por omisión de selección de pregunta del catálogo y validación de respuesta obligatoria en el Sitio Web. (Vista en dispositivo móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:**
   * *Acciones erróneas y alertas de perfil:*
     * **Uso indebido de la contraseña temporal anterior:** Tras finalizar la configuración e intentar iniciar sesión en `/login`, si el usuario digita la clave temporal previa en lugar de la nueva contraseña recién creada, el sistema rechaza el ingreso con `"Correo o contraseña incorrectos"`, ya que la clave provisional fue reemplazada de forma definitiva.
     * **Perfiles sin permisos para el Sitio Web (Directores / Subdirectores):** Si un funcionario con perfil directivo se autentica correctamente en este portal, el sistema comprueba que no cuenta con facultades de edición ni de acceso al panel administrativo y detiene el acceso mostrando la alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, orientándolo a ingresar por la Intranet.
   * *Acción de corrección:* Iniciar sesión estrictamente con la contraseña definitiva personal; si se trata de un perfil directivo, acceder a través de la Intranet del OLO.

> **[Captura: Alerta de Permisos y Acceso Denegado Sitio Web]**
> *Alerta desplegada al intentar acceder al Sitio Web con una cuenta configurada sin facultades de edición ni de administración.*
>
> **[Captura: Alerta de Permisos y Acceso Denegado Sitio Web (Móvil)]**
> *Alerta desplegada al intentar acceder al Sitio Web con una cuenta configurada sin facultades de edición ni de administración. (Vista en dispositivo móvil).*

##### Validaciones en el Primer Ingreso (Intranet del OLO)

1. **Acceso a la Intranet (Intento de acceso directo no autenticado):**
   * *Acción errónea:* Intentar acceder a secciones o tableros internos de la Intranet (ej. `/inicio`, `/tasas-vinculacion`) mediante enlaces guardados sin haber iniciado sesión previamente.
   * *Respuesta del sistema y validación:* El mecanismo de seguridad intercepta la navegación no autenticada y redirige automáticamente al usuario hacia el formulario de acceso (`/login`), bloqueando la visualización del entorno privado.
   * *Acción de corrección:* El funcionario debe ingresar a través de la pantalla oficial de acceso de la Intranet para iniciar su flujo de autenticación.

> **[Captura: Intercepción de Acceso No Autenticado Intranet]**
> *Pantalla de bloqueo y acceso obligatorio de la Intranet al interceptar un intento de navegación no autenticada.*
>
> **[Captura: Intercepción de Acceso No Autenticado Intranet (Móvil)]**
> *Pantalla de bloqueo y acceso obligatorio de la Intranet al interceptar un intento de navegación no autenticada. (Vista en dispositivo móvil).*

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
> *Alertas de campos obligatorios, validación de dominio institucional y mensaje de credenciales no coincidentes en la Intranet. (Vista en dispositivo móvil).*

3. **Bienvenida y pasos guiados de configuración (Control de sesión):**
   * *Situaciones anómalas y validaciones:*
     * **Caducidad de la sesión provisional:** Si el funcionario suspende el proceso y se supera el período de inactividad, el sistema interrumpe la configuración y muestra la alerta: `"No se pudo comprobar el estado de tu cuenta. Vuelve a iniciar sesión."`.
     * **Detección de avances parciales:** Si la cuenta ya había modificado su clave pero tenía pendientes las preguntas de seguridad, la barra guiada desactiva el primer paso y sitúa el formulario directamente en el paso 2 para evitar reprocesos innecesarios.
   * *Acción de corrección:* Reiniciar la sesión si esta caducó y continuar el diligenciamiento de los pasos indicados en la barra guiada.

> **[Captura: Control de Sesión y Pasos Guiados Intranet]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración.*
>
> **[Captura: Control de Sesión y Pasos Guiados Intranet (Móvil)]**
> *Alerta de expiración de sesión provisional y barra de avance guiado indicando el paso pendiente de configuración. (Vista en dispositivo móvil).*

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
> *Módulo de requisitos de contraseña con directivas pendientes y alerta por falta de coincidencia en la confirmación. (Vista en dispositivo móvil).*

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
> *Alertas de selección obligatoria de pregunta y campo de respuesta requerido en la Intranet. (Vista en dispositivo móvil).*

6. **Confirmación, cierre de sesión y evaluación de permisos:**
   * *Acciones erróneas y alertas de permisos:*
     * **Autenticación con contraseña temporal:** Si tras finalizar la configuración el usuario digita en el formulario de la Intranet la clave temporal anterior en lugar de la nueva contraseña personal, el sistema deniega el acceso con la alerta: `"Correo o contraseña incorrectos"`.
     * **Cuentas sin autorización para la Intranet:** Si el funcionario posee una cuenta activa pero no cuenta con el permiso institucional de acceso a la Intranet, el sistema invalida la sesión y despliega la alerta preventiva: *"No tienes permisos para ingresar a la intranet."*.
   * *Acción de corrección:* Iniciar sesión ingresando la nueva contraseña definitiva; si la cuenta no tiene habilitado el acceso a la Intranet, solicitar la asignación del permiso al Administrador del sistema.

> **[Captura: Alerta de Acceso Denegado Intranet]**
> *Alerta de falta de permisos para ingresar a la Intranet desplegada tras validar las credenciales de la cuenta.*
>
> **[Captura: Alerta de Acceso Denegado Intranet (Móvil)]**
> *Alerta de falta de permisos para ingresar a la Intranet desplegada tras validar las credenciales de la cuenta. (Vista en dispositivo móvil).*

#### 3.5.1.2. Validaciones en el Inicio de Sesión Habitual

Durante el inicio de sesión habitual (descrito operativamente en la [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)), el sistema ejecuta comprobaciones inmediatas de identidad, sintaxis de correo corporativo, vigencia de credenciales y autorización por perfil. Esta sección detalla de forma paralela las situaciones erróneas, los bloqueos de interfaz y las alertas emitidas por la plataforma en ambos entornos de acceso:

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
> *Redirección errónea hacia la pantalla de acceso de la Intranet por presionar el botón incorrecto en la cabecera. (Vista en dispositivo móvil).*

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
> *Mensajes de advertencia por campos requeridos, formato inválido y rechazo de dominios externos al SENA en el Sitio Web. (Vista en dispositivo móvil).*

4. **Ejecución y validación de la sesión (Validación de credenciales en el acceso):**
   * *Acción errónea y alerta del sistema:* Al hacer clic en el botón "Ingresar", si la contraseña o el correo no coinciden con los registros activos de la plataforma, se despliega la alerta en la parte superior del formulario: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* Comprobar que no esté activada la tecla Bloq Mayús, verificar los caracteres mediante el control de visualización (ícono de ojo) o hacer uso del enlace de recuperación *(¿Olvidaste tu contraseña?)*.

> **[Captura: Alerta de Credenciales Incorrectas en Sitio Web]**
> *Mensaje superior de credenciales incorrectas en el formulario de acceso del Sitio Web Público.*
>
> **[Captura: Alerta de Credenciales Incorrectas en Sitio Web (Móvil)]**
> *Mensaje superior de credenciales incorrectas en el formulario de acceso del Sitio Web Público. (Vista en dispositivo móvil).*

5. **Verificación de permisos y autorización del portal:**
   * *Acciones erróneas y alertas de permisos:*
     * **Directores y Subdirectores intentando entrar por el Sitio Web Público:** Los directivos no cuentan con facultades de edición ni de acceso al Panel Administrativo en este portal. Al autenticarse correctamente, el sistema detiene el paso y emite la alerta preventiva: *"Tu cuenta no tiene permisos de edición ni de acceso al panel."*, instruyendo al funcionario a dirigirse a la Intranet.
     * **Cuentas inactivas o suspendidas:** Si la cuenta fue desactivada preventivamente por el Administrador, el sistema interrumpe la entrada mostrando el aviso de suspensión correspondiente.
   * *Acción de corrección:* Si se trata de un directivo, hacer clic en el botón "Intranet" e ingresar por dicho portal; si se trata de un editor o administrador con problemas de perfil, solicitar la habilitación correspondiente al Administrador.

> **[Captura: Alerta de Falta de Permisos en Sitio Web]**
> *Alerta informativa impidiendo el acceso a cuentas directivas u operativas sin permisos de edición ni panel en el Sitio Web.*
>
> **[Captura: Alerta de Falta de Permisos en Sitio Web (Móvil)]**
> *Alerta informativa impidiendo el acceso a cuentas directivas u operativas sin permisos de edición ni panel en el Sitio Web. (Vista en dispositivo móvil).*

6. **Resultado y despliegue del entorno según rol:**
   * *Situaciones anómalas y restricciones de interfaz:* Si un editor ingresa exitosamente pero su rol no tiene permisos asignados sobre la página que está visualizando, las herramientas de edición no se renderizan; si no tiene permisos sobre ninguna sección maquetable, el botón flotante de edición permanece completamente oculto.
   * *Acción de corrección:* Solicitar al Administrador del sistema la asignación de los permisos específicos sobre las páginas o secciones requeridas.

> **[Captura: Restricción de Herramientas de Edición Sitio Web]**
> *Ocultamiento del botón flotante de edición ante falta de permisos sobre la página navegada en el Sitio Web.*
>
> **[Captura: Restricción de Herramientas de Edición Sitio Web (Móvil)]**
> *Ocultamiento del botón flotante de edición ante falta de permisos sobre la página navegada en el Sitio Web. (Vista en dispositivo móvil).*

##### Validaciones en el Inicio de Sesión Habitual (Intranet del OLO)

1. **Punto de enlace y acceso a la plataforma (Intercepción de navegación no autorizada):**
   * *Acción errónea:* Intentar acceder directamente a rutas privadas de la Intranet (como tableros de Power BI o indicadores en `/inicio`) a través de marcadores del navegador sin haber iniciado sesión previamente.
   * *Respuesta del sistema y validación:* El enrutador de seguridad intercepta la petición y redirige forzosamente al usuario a la pantalla de bloqueo y acceso (`/login`), impidiendo la exposición de datos protegidos.
   * *Acción de corrección:* Autenticarse de forma regular en el formulario presentado en la pantalla de bienvenida.

> **[Captura: Redirección Forzosa a Pantalla de Bloqueo Intranet]**
> *Bloqueo de acceso directo y redirección inmediata al formulario de inicio de sesión de la Intranet.*
>
> **[Captura: Redirección Forzosa a Pantalla de Bloqueo Intranet (Móvil)]**
> *Bloqueo de acceso directo y redirección inmediata al formulario de inicio de sesión de la Intranet. (Vista en dispositivo móvil).*

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
> *Alertas bajo las casillas de texto por omisión de datos o dominio no corporativo en la Intranet. (Vista en dispositivo móvil).*

4. **Ejecución y validación de la sesión (Validación de credenciales en el acceso):**
   * *Acción errónea y respuesta del sistema:* Si el correo electrónico o la clave no coinciden con los registros activos de la plataforma, el sistema emite la alerta general: `"Correo o contraseña incorrectos"`.
   * *Acción de corrección:* Verificar minuciosamente la clave ingresada mediante el control de visualización (ícono de ojo) o acceder al enlace de recuperación de contraseña *(¿Olvidaste tu contraseña?)*.

> **[Captura: Alerta de Credenciales Inválidas en Intranet]**
> *Mensaje de credenciales erróneas en el panel de acceso de la Intranet.*
>
> **[Captura: Alerta de Credenciales Inválidas en Intranet (Móvil)]**
> *Mensaje de credenciales erróneas en el panel de acceso de la Intranet. (Vista en dispositivo móvil).*

5. **Verificación de autorización de acceso a la Intranet:**
   * *Acciones erróneas y alertas de permisos:* Si el usuario cuenta con un usuario registrado en el OLO pero carece del permiso de acceso al entorno privado interno, el sistema detiene el acceso y despliega la alerta preventiva: *"No tienes permisos para ingresar a la intranet."*.
   * *Acción de corrección:* Solicitar al Administrador del sistema la asignación de permisos de acceso para la Intranet si el funcionario requiere consultar dichos tableros.

> **[Captura: Alerta de Acceso Denegado a la Intranet]**
> *Alerta indicando falta de permisos institucionales para acceder a los módulos internos de la Intranet.*
>
> **[Captura: Alerta de Acceso Denegado a la Intranet (Móvil)]**
> *Alerta indicando falta de permisos institucionales para acceder a los módulos internos de la Intranet. (Vista en dispositivo móvil).*

6. **Resultado y despliegue del entorno según perfil en la Intranet:**
   * *Acciones erróneas y control de interfaz:* Si un Director o Subdirector (rol de solo lectura) intenta forzar el acceso a herramientas de edición o maquetación, los controles simplemente no se renderizan, manteniendo el esquema protegido de solo consulta analítica.
   * *Acción de corrección:* Operar dentro del marco de solo lectura asignado al perfil o solicitar al Administrador del sistema permisos editoriales si se requiere participar en la creación o modificación de contenidos.

> **[Captura: Restricción de Solo Lectura en Intranet]**
> *Despliegue exclusivo de módulos analíticos y ocultamiento de herramientas de maquetación para perfiles directivos.*
>
> **[Captura: Restricción de Solo Lectura en Intranet (Móvil)]**
> *Despliegue exclusivo de módulos analíticos y ocultamiento de herramientas de maquetación para perfiles directivos. (Vista en dispositivo móvil).*

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
> *Ubicación del enlace interactivo de recuperación en la tarjeta de inicio de sesión del Sitio Web.*
>
> **[Captura: Enlace de Recuperación en Formulario Sitio Web (Móvil)]**
> *Ubicación del enlace interactivo de recuperación en la tarjeta de inicio de sesión del Sitio Web. (Vista en dispositivo móvil).*

2. **Ingreso y comprobación de la cuenta de correo corporativo:**
   * *Acciones erróneas y validaciones:*
     * **Correo obligatorio:** Si se presiona el botón "Continuar" con la casilla vacía, el sistema interrumpe el envío indicando: `"El correo es requerido"`.
     * **Formato o dominio ajeno:** Si se escribe un correo con formato inválido o fuera del dominio oficial (`@gmail.com`, `@hotmail.com`), el validador emite en tiempo real: `"El correo no tiene un formato válido"` o `"Debe ser un correo institucional @sena.edu.co"`.
     * **Cuenta sin preguntas de seguridad o inexistente:** Si el correo no cuenta con preguntas de seguridad configuradas en el sistema, la tarjeta despliega la alerta general: `"No hay preguntas de seguridad asociadas a ese correo. Contacta al administrador para restablecer tu acceso."`.
   * *Acción de corrección:* Verificar la correcta escritura del correo corporativo `@sena.edu.co` o solicitar soporte al Administrador si la cuenta nunca completó su configuración inicial de seguridad.

> **[Captura: Validaciones de Correo en Recuperación Sitio Web]**
> *Alertas de formato, dominio institucional y aviso de cuenta sin preguntas registradas en el Sitio Web.*
>
> **[Captura: Validaciones de Correo en Recuperación Sitio Web (Móvil)]**
> *Alertas de formato, dominio institucional y aviso de cuenta sin preguntas registradas en el Sitio Web. (Vista en dispositivo móvil).*

3. **Verificación de identidad mediante preguntas de seguridad:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta en blanco:** Si se pulsa "Continuar" sin redactar la respuesta a la pregunta activa, el formulario señala: `"La respuesta es requerida"`.
     * **Respuestas no coincidentes:** Al enviar el cuestionario, si las respuestas no coinciden con los registros guardados, el sistema bloquea el paso emitiendo la alerta: `"Las respuestas no coinciden con nuestros registros. Intenta nuevamente."`, restableciendo el cuestionario al inicio por seguridad.
     * **Navegación forzada sin correo previo:** Si el usuario intenta cargar directamente la ruta `/security-questions` sin haber validado su correo, el sistema lo reconduce de forma automática a `/recovery`.
   * *Acción de corrección:* Digitar con precisión la respuesta secreta configurada en el primer ingreso respetando caracteres y ortografía.

> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Sitio Web (Móvil)]**
> *Alerta general por respuestas de seguridad incorrectas y campo obligatorio en el Sitio Web. (Vista en dispositivo móvil).*

4. **Establecimiento de la nueva contraseña (Políticas y confirmación):**
   * *Acciones erróneas y validaciones:*
     * **Omisión o contraseña débil:** Si se intenta guardar dejando el campo vacío o incumpliendo alguno de los 5 requisitos de seguridad, el sistema resalta el requisito pendiente bajo el campo (ej. `"Al menos 12 caracteres"` o `"Combina 3 de 4: mayúsculas, minúsculas, números y símbolos"`), impidiendo el avance.
     * **Discrepancia en la confirmación:** Si el campo de repetición no coincide de manera exacta con la nueva clave, se despliega la advertencia: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Establecer una contraseña que satisfaga todos los indicadores en color verde y reescribirla con exactitud en la casilla de confirmación.

> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web]**
> *Validador interactivo de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web.*
>
> **[Captura: Validaciones de Contraseña en Recuperación Sitio Web (Móvil)]**
> *Validador interactivo de seguridad de contraseña y alerta de confirmación discrepante en el Sitio Web. (Vista en dispositivo móvil).*

5. **Confirmación y retorno seguro:**
   * *Situación de control:* Tras procesar el cambio en el servidor, la pantalla `/reset-success` confirma la operación y bloquea retornos involuntarios con el botón de retroceso del navegador, obligando a iniciar sesión formalmente.
   * *Acción de corrección:* Hacer clic sobre el botón "Ir a iniciar sesión" y autenticarse con la nueva contraseña definitiva.

> **[Captura: Pantalla de Éxito en Recuperación Sitio Web]**
> *Insignia de confirmación y botón para reanudar el acceso formal en el Sitio Web.*
>
> **[Captura: Pantalla de Éxito en Recuperación Sitio Web (Móvil)]**
> *Insignia de confirmación y botón para reanudar el acceso formal en el Sitio Web. (Vista en dispositivo móvil).*

##### Validaciones en la Recuperación de Contraseña (Intranet del OLO)

1. **Ubicación del enlace de recuperación en la Intranet:**
   * *Acción errónea:* Intentar acceder a la ruta privada de la Intranet sin conocer la clave en lugar de utilizar el asistente de restablecimiento.
   * *Respuesta del sistema y validación:* La tarjeta de acceso a la Intranet proporciona el enlace directo interactivo **"¿Olvidaste tu contraseña?"** para canalizar solicitudes de restablecimiento.
   * *Acción de corrección:* Hacer clic sobre dicho enlace ubicado bajo los campos de usuario y contraseña en la pantalla de bienvenida.

> **[Captura: Enlace de Recuperación en Formulario Intranet]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en la tarjeta de ingreso de la Intranet.*
>
> **[Captura: Enlace de Recuperación en Formulario Intranet (Móvil)]**
> *Ubicación del enlace '¿Olvidaste tu contraseña?' en la tarjeta de ingreso de la Intranet. (Vista en dispositivo móvil).*

2. **Ingreso y comprobación del correo en la Intranet:**
   * *Acciones erróneas y validaciones:*
     * **Campo vacío:** Si se presiona "Comenzar" sin haber escrito datos, el sistema resalta: `"El correo es requerido"`.
     * **Dominio no corporativo:** Si el correo no culmina en `@sena.edu.co`, el sistema bloquea con: `"Debe ser un correo institucional @sena.edu.co"`.
     * **Preguntas no configuradas:** Si la cuenta no posee preguntas de seguridad en la base de datos, se despliega el aviso: `"No se encontraron preguntas de seguridad para este correo."`.
   * *Acción de corrección:* Digitar el correo corporativo `@sena.edu.co` del funcionario o solicitar apoyo administrativo para la configuración inicial.

> **[Captura: Validaciones de Correo en Recuperación Intranet]**
> *Alertas de campo obligatorio, dominio institucional y preguntas no encontradas en la Intranet.*
>
> **[Captura: Validaciones de Correo en Recuperación Intranet (Móvil)]**
> *Alertas de campo obligatorio, dominio institucional y preguntas no encontradas en la Intranet. (Vista en dispositivo móvil).*

3. **Verificación asistida de preguntas de seguridad en la Intranet:**
   * *Acciones erróneas y validaciones:*
     * **Respuesta omitida:** Si no se introduce texto en el campo de respuesta, se señala: `"La respuesta es requerida"`.
     * **Respuestas erróneas:** Si alguna de las respuestas proporcionadas es incorrecta, la plataforma emite: `"Las respuestas no coinciden. Intenta de nuevo."`, reiniciando el paso al inicio para proteger los datos institucionales.
   * *Acción de corrección:* Ingresar las respuestas confidenciales tal como fueron registradas durante el primer ingreso.

> **[Captura: Alerta de Respuestas No Coincidentes Intranet]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet.*
>
> **[Captura: Alerta de Respuestas No Coincidentes Intranet (Móvil)]**
> *Mensaje informativo de respuestas no coincidentes en el asistente guiado de la Intranet. (Vista en dispositivo móvil).*

4. **Establecimiento de la nueva clave en la Intranet:**
   * *Acciones erróneas y validaciones:*
     * **Políticas incumplidas:** Si la nueva contraseña no cumple con los 5 requisitos de longitud y complejidad, los indicadores permanecen pendientes y se bloquea el guardado.
     * **Discrepancia en confirmación:** Si ambas casillas no son idénticas, se resalta: `"Las contraseñas no coinciden"`.
   * *Acción de corrección:* Registrar una contraseña robusta que satisfaga todos los criterios y confirmar su coincidencia exacta.

> **[Captura: Validaciones de Contraseña en Intranet]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet.*
>
> **[Captura: Validaciones de Contraseña en Intranet (Móvil)]**
> *Verificador de directivas de seguridad y aviso de falta de coincidencia en la confirmación en la Intranet. (Vista en dispositivo móvil).*

5. **Confirmación y retorno al inicio de sesión de la Intranet:**
   * *Situación de control:* Al completarse el restablecimiento, el sistema elimina las credenciales temporales de sesión y despliega la pantalla de éxito con el botón para ingresar a la Intranet.
   * *Acción de corrección:* Hacer clic sobre el botón de inicio de sesión y autenticarse con la nueva contraseña definitiva.

> **[Captura: Pantalla de Éxito en Recuperación Intranet]**
> *Confirmación institucional de clave actualizada con éxito en la Intranet.*
>
> **[Captura: Pantalla de Éxito en Recuperación Intranet (Móvil)]**
> *Confirmación institucional de clave actualizada con éxito en la Intranet. (Vista en dispositivo móvil).*

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
> *Ventana modal preventiva desplegada al minuto 14 de inactividad con cuenta regresiva en segundos y botón "Seguir trabajando". (Vista en dispositivo móvil).*

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
> *Recuadro informativo en la pantalla de bienvenida y acceso de la Intranet tras expirar la sesión. (Vista en dispositivo móvil).*

#### 3.5.1.5. Prevención de enlaces rotos (Bloqueos de eliminación)
Si un administrador o editor intenta eliminar una página hacia la cual apuntan otros botones en el portal, el sistema arrojará una alerta roja de bloqueo. No se permitirá la eliminación hasta que los enlaces entrantes sean retirados.

#### 3.5.1.6. Errores habituales y solución

**Situación:** Alerta de "Correo inválido" o dominio no corporativo.
**Posible causa:** Intento de inicio de sesión con un correo fuera del dominio `@sena.edu.co`.
**Acción recomendada:** El usuario debe ingresar estrictamente la cuenta corporativa oficial asignada por la entidad.

**Situación:** Alerta de "Credenciales incorrectas".
**Posible causa:** Se ha digitado mal la contraseña o el correo electrónico.
**Acción recomendada:** Se debe verificar la escritura correcta de los datos o hacer uso de la opción "Recuperar contraseña".

**Situación:** Mensaje de "Permisos insuficientes", *"Tu cuenta no tiene permisos de edición ni de acceso al panel."* o *"No tienes permisos para ingresar a la intranet."*.
**Posible causa:** (1) El rol asignado no cuenta con autorización para acceder a esa URL o ejecutar esa acción. (2) Cuentas con perfil de Director o Subdirector (u orientadas a la Intranet) que intentan ingresar a través del Sitio Web Público. (3) Cuentas de usuario que no tienen permisos asignados para ingresar al entorno privado de la Intranet.
**Acción recomendada:** Si se trata de un directivo que intentó ingresar desde el portal público, debe ingresar a través del portal de la Intranet (ver [Sección 3.4.1.2: Flujo de Inicio de Sesión Habitual](#3412-flujo-de-inicio-de-sesión-habitual)). Si se trata de un funcionario que requiere permisos para el portal web o para la Intranet, solicitar al Administrador del sistema la asignación de permisos correspondiente.

#### 3.5.1.7. Mensajes de Error Adicionales

**Situación:** Error al cargar el archivo en la Carga Masiva ("Formato de archivo no válido").
**Posible causa:** El archivo cargado no es un `.xlsx` válido, está corrupto o fue generado con una versión de Excel incompatible.
**Acción recomendada:** Se debe descargar nuevamente la plantilla oficial desde el módulo de carga, trasladar los datos al nuevo archivo y repetir la operación.

**Situación:** El componente de tablero analítico (Power BI) no carga o aparece en blanco en la página.
**Posible causa:** (1) La página contiene el bloque de Power BI pero la conexión a Internet es inestable o lenta. (2) La sesión o enlace del servicio embebido expiró internamente.
**Acción recomendada:** (1) El usuario debe verificar la conexión a Internet (se recomiendan al menos 10 Mbps para tableros analíticos). (2) Se debe recargar la página con la tecla F5. (3) Si la eventualidad persiste, se debe cerrar sesión y volver a iniciarla.

**Situación:** El Editor Visual no carga o aparece en blanco al intentar editar una página.
**Posible causa:** Caché del navegador desactualizado o incompatibilidad con una versión de navegador antigua.
**Acción recomendada:** Se debe limpiar la caché del navegador (Ctrl + Shift + Delete) y recargar la página, verificando que el navegador cumpla con los requisitos mínimos de la Sección 3.2.1.2.

**Situación:** Mensaje de "Cuenta suspendida".
**Posible causa:** El Administrador ha suspendido la cuenta del usuario.
**Acción recomendada:** El usuario debe contactar directamente al Administrador del sistema para conocer el motivo de la suspensión y solicitar la reactivación correspondiente.

---

### 3.5.2. Preguntas Frecuentes

#### 3.5.2.1. Problemas de acceso por bloqueo
**Situación:** El sistema bloquea el acceso por múltiples intentos fallidos.
**Posible causa:** Se ha ingresado repetidamente una contraseña incorrecta superando el límite de seguridad.
**Acción:** Se debe esperar 15 minutos para que el bloqueo expire automáticamente, o comunicarse con el Administrador para un desbloqueo manual.

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

