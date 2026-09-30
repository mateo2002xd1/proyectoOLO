# MANUAL DE USUARIO DEL SISTEMA
## Observatorio Laboral y Ocupacional (OLO) — SENA

---

*Nota de estilo: Las capturas de pantalla integradas deben tener un tamaño pequeño o mediano (optimizadas) para mantener el manual intuitivo sin saturar el documento.*

## 5. Público objetivo

El manual de usuario está dirigido a los diferentes perfiles que interactúan con la plataforma del Observatorio Laboral y Ocupacional (OLO):

### 5.1. Directores y Subdirectores
Personal directivo del SENA que inicia sesión con cuenta corporativa `@sena.edu.co` para consultar en modalidad de solo lectura matrices de pertinencia, indicadores del mercado laboral y tableros analíticos en la Intranet del OLO.

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

### 6.3. Requisitos de Credenciales y Cuentas de Acceso
Para acceder a los entornos privados (Panel Administrativo, Editor Visual e Intranet):
* **Cuenta de correo obligatoria:** Debe pertenecer estrictamente al dominio corporativo `@sena.edu.co`. Cualquier intento de autenticación o registro con dominios públicos o ajenos es rechazado automáticamente por la plataforma OLO (ver procedimiento de acceso en [Sección 10.1](#101-ingreso-y-recuperación-de-contraseña) y resolución de alertas en [Sección 15.1](#151-problemas-de-acceso-por-bloqueo)).
* **Contraseña robusta:** Debe satisfacer los 5 lineamientos de la política de seguridad de contraseñas de la plataforma:
  1. Longitud mínima de **12 caracteres**.
  2. Al menos una letra **mayúscula** (`A-Z`).
  3. Al menos una letra **minúscula** (`a-z`).
  4. Al menos un dígito **numérico** (`0-9`).
  5. Al menos un **carácter especial** o símbolo (`!@#$%^&*()_+-=[]{}|;:,.<>?`).
  *(El flujo de primer ingreso, la validación interactiva de credenciales y el procedimiento de recuperación se detallan en [Sección 10.1.1](#1011-flujo-de-primer-ingreso-al-sistema-onboarding-y-configuración-inicial) y [Sección 10.1.4](#1014-procedimiento-de-recuperación-de-contraseña-ambos-portales)).*

---

## 7. Roles y permisos

Esta sección detalla qué puede hacer cada tipo de usuario dentro del aplicativo, delimitando las capacidades de la consulta pública abierta y los perfiles autorizados del OLO.

### 7.1. Acceso Ciudadano General (Sin rol ni inicio de sesión)
El Sitio Web Público fue concebido como un portal abierto para toda la sociedad civil, la comunidad académica, el sector productivo y los buscadores de empleo:
1. **Sin necesidad de rol ni registro:** La ciudadanía no requiere una cuenta de usuario ni la asignación de un rol para interactuar con la plataforma.
2. **Consulta y descarga libre:** Cualquier persona puede navegar por todas las páginas públicas, realizar búsquedas mediante los componentes interactivos, consultar indicadores, reproducir contenidos en los visores de videos y acceder a documentos mediante los visores de PDFs o botones de descarga libre en formato PDF sin necesidad de iniciar sesión.
3. **Ámbito del control de accesos:** El inicio de sesión y la asignación de roles aplican de manera exclusiva para los funcionarios del SENA que acceden con cuenta corporativa (`@sena.edu.co`) a la Intranet del OLO, al editor visual de páginas o al Panel Administrativo.

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
  Inicia sesión mediante credenciales corporativas obligatorias (`@sena.edu.co`). Dispone de acceso exclusivo al Panel Administrativo (`/admin`), entorno inaccesible para los demás perfiles. Asimismo, puede navegar libremente por el Sitio Web público y por la Intranet del OLO con plenas facultades de visualización y edición en línea.

* **Funciones y facultades principales:**
  * *Gestión integral de cuentas de usuario:* Registra nuevas cuentas de usuario en el OLO, asigna o revoca roles, activa o suspende cuentas y ejecuta el restablecimiento de contraseñas ante eventualidades o bloqueos (ver paso a paso en [Sección 10.3.1](#1031-submenú-usuarios)).
  * *Creación de roles de editor y parametrización de permisos:* Crea perfiles personalizados exclusivamente bajo la tipología de editor (bajo la nomenclatura fija «Editor [Nombre]») y define manualmente («a mano») los accesos e interruptores de permisos sobre cada página o sección (ver paso a paso en [Sección 10.3.2](#1032-submenú-roles)).
  * *Aprobación y control en la bandeja de revisión:* Examina los borradores remitidos por los editores mediante la previsualización interactiva y dispone de tres decisiones operativas:
    * *Aprobar:* Autoriza la publicación inmediata de la versión revisada para su despliegue público o en la Intranet.
    * *Rechazar:* Devuelve la versión al editor responsable con las observaciones y justificación de los cambios requeridos.
    * *Descartar / Eliminar (ícono de basurero):* Elimina definitivamente el borrador no procedente o enviado por error. Esta acción exige registrar obligatoriamente el motivo para la bitácora de auditoría y depura los archivos e imágenes huérfanas sin alterar la versión publicada.
    *(Ver procedimiento operativo de revisión en [Sección 10.4](#104-panel-administrativo-páginas-en-revisión)).*
  * *Edición integral y gestión de páginas:* Accede al editor visual para maquetar directamente cualquier contenido en el Sitio Web o la Intranet, crear nuevas páginas y eliminar páginas dinámicas creadas por los editores (ver [Sección 12.2](#122-creación-y-edición-en-el-lienzo) y [Sección 12.4](#124-eliminación-de-páginas-dinámicas-paso-a-paso)).
  * *Carga masiva de información en Excel:* Importa y procesa actualizaciones masivas de datos ocupacionales, estadísticas e indicadores del observatorio mediante archivos en formato `.xlsx` (ver paso a paso en [Sección 10.7](#107-panel-administrativo-carga-masiva-de-datos-en-excel)).
  * *Supervisión mediante bitácora de auditoría:* Inspecciona el registro cronológico inmutable de eventos para verificar qué usuario realizó cada acción, los cambios ejecutados, las marcas de tiempo y las direcciones de origen (ver paso a paso en [Sección 10.5](#105-panel-administrativo-auditoría)).

* **Límites operativos y restricciones de seguridad:**
  * No puede modificar ni eliminar mediante el editor visual las rutas y vistas que no son gestionables desde el editor de páginas, tales como las interfaces de autenticación (inicio de sesión, recuperación de credenciales y preguntas de seguridad) y todas las rutas funcionales del Panel Administrativo (`/admin`), las cuales corresponden a la arquitectura fija de código del aplicativo.
  * No puede crear roles dentro de las jerarquías de Administrador ni de Director; la creación de roles nuevos se encuentra restringida exclusivamente a roles hijos de editor.
  * No puede omitir ni alterar el registro de auditoría; todas las acciones administrativas quedan grabadas de forma obligatoria e irreversible en la base de datos.

#### 7.2.2. Editor (Rol Base)
Corresponde al perfil técnico general facultado para la producción, maquetación y diseño de los contenidos del OLO.

* **Propósito del perfil:**
  Construir, actualizar y diseñar visualmente las páginas y boletines de la plataforma mediante el editor interactivo de bloques, manteniendo la pertinencia informativa y la identidad gráfica del observatorio.

* **Entorno de acceso y autenticación:**
  Inicia sesión con su cuenta corporativa (`@sena.edu.co`) desde el Sitio Web público o desde la Intranet del OLO. Al autenticarse, el sistema dirige al usuario a la página de inicio correspondiente según el ambiente donde ingresó. Al navegar por las diferentes páginas, se le despliega un menú flotante con los botones de acción para editar página, editar cabecera/pie, crear o eliminar páginas.

* **Funciones y facultades principales:**
  * *Maquetación interactiva con bloques:* Diseña y estructura contenidos directamente en el editor visual mediante su entorno de tres paneles: seleccionando bloques prediseñados del catálogo izquierdo (textos, imágenes, tarjetas de indicadores, carruseles, acordeones), arrastrándolos al lienzo central en tiempo real y personalizando sus propiedades en el panel lateral derecho (ver paso a paso en [Sección 12.2](#122-creación-y-edición-en-el-lienzo)).
  * *Cobertura total de edición:* Accede a la edición de cualquier página del portal o de la Intranet a través del botón flotante en pantalla (opción **"Editar página"**), disponiendo de permisos plenos sobre todos los contenidos existentes, sin importar qué editor los haya creado originalmente.
  * *Creación y eliminación de páginas dinámicas:* Gestiona páginas dinámicas desde el menú del botón flotante mediante las opciones **"Crear página"** (definiendo título y ruta URL) y **"Eliminar página"** (con validaciones de seguridad y protección contra enlaces rotos). (Ver paso a paso de creación en [Sección 12.2, Paso 1](#122-creación-y-edición-en-el-lienzo) y de eliminación en [Sección 12.4](#124-eliminación-de-páginas-dinámicas-paso-a-paso)).
  * *Flujo de trabajo mediante borradores:* Guarda su progreso de forma privada mediante el botón **"Guardar Borrador"** sin alterar el portal público, y traslada los cambios terminados mediante **"Enviar a revisión"** hacia la sección **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación final por parte del Administrador (ver paso a paso en [Sección 12.2, Paso 7](#122-creación-y-edición-en-el-lienzo)).

* **Límites operativos y restricciones de seguridad:**
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No puede publicar directamente en los entornos productivos; requiere obligatoriamente la aprobación previa de un Administrador.
  * No puede intervenir ni eliminar las rutas fijas del aplicativo (como las interfaces de inicio de sesión o las rutas administrativas), ya que corresponden a la estructura de código del sistema y no a páginas gestionables desde el editor visual.
  * Si bien está facultado para eliminar páginas dinámicas creadas en el sistema, no puede borrarlas si se encuentran vinculadas a algún elemento del menú de navegación del portal o a otros enlaces del sistema; en dichos casos, el sistema bloquea la acción y le exige retirar previamente esos enlaces desde la edición del menú para evitar enlaces rotos.
  * No puede crear, modificar ni gestionar cuentas de usuario ni roles.
  * No tiene acceso a la bitácora de auditoría ni al módulo de carga masiva de datos en Excel.

#### 7.2.3. Roles Hijos o Derivados de Editor
Corresponden a perfiles editoriales especializados creados por el Administrador para delimitar responsabilidades por dependencia o temática.

* **Propósito del perfil:**
  Permitir la participación distribuida de funcionarios en la maquetación y actualización de contenidos concretos, aplicando el principio de mínimo privilegio para limitar el alcance de su intervención únicamente a las páginas autorizadas.

* **Entorno de acceso y autenticación:**
  Inician sesión con credenciales corporativas (`@sena.edu.co`) en el Sitio Web público o en la Intranet del OLO. Al ingresar, el sistema redirige al usuario al inicio del portal y despliega el menú flotante de edición únicamente cuando navega por las páginas y secciones específicas que le hayan sido habilitadas.

* **Funciones y facultades principales:**
  * *Exclusividad de tipología:* Todo rol derivado creado en la plataforma pertenece obligatoriamente a la familia de editores y se registra bajo el formato estricto «Editor [Nombre]».
  * *Configuración manual de permisos («a mano»):* Nace sin ningún permiso predeterminado (privilegio cero). El Administrador habilita de forma selectiva los interruptores de acceso para las páginas, secciones o funciones específicas requeridas (ver paso a paso en [Sección 10.3.2, Paso 3](#1032-submenú-roles)).
  * *Capacidad equivalente según asignación:* Si el Administrador le otorga permisos completos (activando todas las páginas, la creación y el borrado), el rol hijo adquiere las mismas facultades operativas que el rol Editor base.
  * *Control de componentes globales:* La modificación de la cabecera y pie de página compartidos permanece bloqueada por defecto, salvo concesión expresa del Administrador.
  * *Ciclo editorial de borradores:* Maqueta los bloques en las páginas asignadas y remite las versiones trabajadas a la sección de **"Páginas en revisión"** del Panel Administrativo para la evaluación y aprobación definitiva por parte del Administrador.
  * *Asignación automática y delegación de nuevas páginas:* Cuando un rol hijo que cuenta con permiso de creación genera una nueva página, el sistema otorga permisos de edición inmediatos únicamente a su propio rol, al rol padre Editor base y al Administrador. Los demás roles hijos de editor quedan sin acceso a dicha página; si otro rol especializado necesita colaborar o editarla, el Administrador debe otorgarle el permiso de forma manual («a mano») desde la opción de editar rol en el Panel Administrativo (ver [Sección 10.3.2](#1032-submenú-roles)).

* **Límites operativos y restricciones de seguridad:**
  * No tienen acceso al Panel Administrativo (`/admin`).
  * No pueden publicar páginas directamente en producción sin la aprobación del Administrador.
  * No pueden intervenir ni editar páginas o secciones ajenas a las asignadas de forma explícita en su perfil.
  * No pueden crear ni eliminar páginas a menos que cuenten con el permiso manual activado específicamente para ello.
  * No pueden intervenir ni eliminar las rutas no gestionables desde el editor visual (pantallas de inicio de sesión y rutas administrativas), ni gestionar usuarios, roles, auditoría o cargas masivas.

#### 7.2.4. Director / Subdirector
Corresponde al perfil directivo enfocado en el monitoreo gerencial, el análisis de indicadores del mercado laboral y la toma de decisiones estratégicas del observatorio.

* **Propósito del perfil:**
  Facilitar la consulta directa, ágil y protegida de la información estadística, los indicadores del mercado laboral y los resultados de pertinencia educativa para respaldar la planeación y la gestión directiva.

* **Entorno de acceso y autenticación:**
  Inicia sesión mediante su cuenta corporativa (`@sena.edu.co`) directamente en la Intranet del OLO. El sistema valida su identidad y despliega el entorno privado con acceso inmediato a los módulos gerenciales.

* **Funciones y facultades principales:**
  * *Consulta gerencial en solo lectura:* Explora e interactúa con los módulos analíticos y tableros de indicadores integrados en las páginas de la Intranet (tasas de ocupación, matrices de pertinencia educativa e indicadores de encuestas a egresados y calidad formativa) (ver [Sección 13.1](#131-uso-de-tableros-bi-en-la-intranet-power-bi)).
  * *Descarga de presentaciones e informes internos:* Descarga informes analíticos, boletines ejecutivos y presentaciones en formato PDF o PowerPoint para comités de dirección y mesas de trabajo técnico (ver [Sección 13.4](#134-descarga-directa-de-archivos-y-boletines)).
  * *Monitoreo estratégico sin fricción operativa:* Realiza análisis comparativos y seguimiento a los indicadores y metas ocupacionales sobre información consolidada y oficial.

* **Límites operativos y restricciones de seguridad:**
  * No tiene acceso al Panel Administrativo (`/admin`).
  * No posee facultades de edición ni maquetación; no se despliega el menú flotante de edición ni tiene acceso al editor visual.
  * No puede crear, modificar ni eliminar páginas, menús ni contenidos de la plataforma.
  * No administra cuentas de usuario, no crea roles ni configura permisos.
  * No ejecuta cargas masivas de datos en Excel ni accede a la bitácora de auditoría técnica.

### 7.3. Matriz Comparativa de Acceso y Capacidades

| Capacidad / Entorno del Sistema | Director / Subdirector | Editor Base | Roles Hijos de Editor | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Navegar Sitio Web Público y descargar archivos** | Permitido | Permitido | Permitido | Permitido |
| **Inicio de sesión con cuenta SENA (`@sena.edu.co`)** | Permitido | Permitido | Permitido | Permitido |
| **Consultar contenidos y módulos analíticos en Intranet** | Permitido (Solo lectura) | Permitido | Permitido | Permitido |
| **Descargar informes y presentaciones internas** | Permitido | Permitido | Permitido | Permitido |
| **Ingresar al editor visual de páginas** | Sin acceso | Permitido | Permitido | Permitido |
| **Editar páginas asignadas del Sitio Web e Intranet** | Sin acceso | Permitido | Según asignación manual | Permitido |
| **Modificar cabecera y pie de página del portal** | Sin acceso | Permitido | No (Por defecto) | Permitido |
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

---

## 8. Acceso al sistema

El acceso al ecosistema tecnológico del Observatorio Laboral y Ocupacional (OLO) comprende los mecanismos de navegación pública abierta y los procedimientos de autenticación, recuperación de credenciales y administración de cuentas de usuario para el personal autorizado.

### 8.1. Sitio Web Público

#### 8.1.1. Portal Web Público (Cara visible)
El portal web público es la plataforma principal que refleja el trabajo del Observatorio Laboral y Ocupacional (OLO). Es un entorno dinámico y adaptable donde se publican las páginas maquetadas con diversos componentes interactivos (buscadores de ocupaciones, visores de videos, visores de documentos PDF, tarjetas de indicadores y enlaces de descarga). La apariencia y distribución de los contenidos varían según las prioridades informativas del observatorio. Aunque su contenido principal es público y consultado por la ciudadanía sin requerir autenticación, el personal editorial y administrativo utiliza este mismo entorno como punto de acceso al sistema.

#### 8.1.2. Inicio de Sesión en el Sitio Web Público (Banner GOV.CO)
El Sitio Web Público no cuenta con un botón directo de "Iniciar Sesión" para la ciudadanía, ya que la navegación por todos sus contenidos es totalmente libre y abierta. Para los funcionarios autorizados del SENA (Editores y Administradores), la vía de entrada para autenticarse en el Sitio Web es el enlace interactivo ubicado en la franja azul superior del Estado:
* **Punto de acceso institucional (Banner GOV.CO):** En la parte superior de la página, dentro de la franja azul de GOV.CO, se ubica a la derecha el reloj interactivo con la **fecha y hora en vivo**. Al hacer clic sobre este texto (identificado con el mensaje de ayuda *"Iniciar sesión"*), el sistema redirige a la pantalla de acceso corporativo (`/login`).
* **Credenciales requeridas:**
  * Correo electrónico corporativo con dominio `@sena.edu.co`.
  * Contraseña robusta configurada en la plataforma.
* **Redirección por rol (Exclusivo para el Sitio Web Público):**
  * *Editores (y roles derivados de Editor):* Al validar sus credenciales y permisos editoriales, el sistema los redirige de vuelta a la página de **Inicio del Sitio Web Público** (`/inicio`), donde se activa y despliega el botón circular flotante (Speed Dial) para maquetar páginas y gestionar cabecera y pie.
  * *Administradores:* Al contar con facultades de gobierno y acceso al panel (`acceso.panel`), el sistema los redirige de manera directa al **Panel Administrativo** (`/admin/dashboard`).
  * *(Si una cuenta no posee permisos de edición ni acceso al panel, el sistema detiene el ingreso indicando que no cuenta con autorizaciones para este entorno).*
* **Enlace de recuperación:** La pantalla de autenticación dispone del acceso directo para el restablecimiento de contraseñas ante olvidos *(¿Olvidaste tu contraseña?)*. *(Para consultar la guía visual paso a paso de este acceso, ver [Sección 10.1.2: Inicio de Sesión Habitual en el Sitio Web Público (Banner GOV.CO)](#1012-inicio-de-sesión-habitual-en-el-sitio-web-público-banner-govco)).*

#### 8.1.3. Enlace Institucional a la Intranet (Botón Intranet)
El botón fijo **"Intranet"** ubicado en la cabecera del portal (extremo superior derecho) no corresponde al inicio de sesión del Sitio Web Público, sino que constituye el enlace institucional permanente hacia el portal privado independiente de la Intranet del OLO. Al pulsarlo, el usuario es dirigido al entorno de la Intranet, cuya plataforma cuenta con su propio sistema de bloqueo y autenticación obligatoria para funcionarios.

### 8.2. Intranet del OLO

#### 8.2.1. Inicio de Sesión en el Entorno Privado de la Intranet
La Intranet es una plataforma privada e independiente orientada al seguimiento gerencial, análisis ocupacional y trabajo interno del SENA:
* **Acceso restringido con autenticación obligatoria:** A diferencia del portal público, la Intranet no permite navegación anónima ni libre. Toda persona debe autenticarse para ingresar mediante su propio formulario de acceso.
* **Perfiles habilitados:**
  * *Directores y Subdirectores:* Ingresan con cuenta corporativa `@sena.edu.co` para consultar los módulos de información, matrices e indicadores ocupacionales en modalidad de **solo lectura**, manteniendo protegida la información al no contar con permisos de edición ni administración.
  * *Editores y Administradores:* Ingresan para maquetar secciones internas autorizadas o supervisar contenidos según sus atribuciones.
* **Credenciales y validación:** Correo corporativo `@sena.edu.co` y contraseña asignada (requiere permiso de `acceso.intranet`). Al iniciar sesión exitosamente, el sistema despliega el entorno privado de la Intranet con los tableros analíticos e indicadores configurados. *(Para consultar la guía visual paso a paso del acceso a la Intranet, ver [Sección 10.1.3: Acceso e Inicio de Sesión Habitual en la Intranet del OLO](#1013-acceso-e-inicio-de-sesión-habitual-en-la-intranet-del-olo)).*

### 8.3. Procedimiento de Recuperación de Contraseña (Preguntas de Seguridad)
El sistema del Observatorio Laboral y Ocupacional cuenta con un mecanismo autónomo de restablecimiento de contraseña ante olvidos o bloqueos, unificado para todos los funcionarios tanto en el Sitio Web como en la Intranet:
* **Autonomía sin dependencia de correo externo:** A diferencia de plataformas que envían enlaces o tokens a buzones de correo externos, el aplicativo comprueba la identidad del titular validando las **tres preguntas de seguridad** parametrizadas obligatoriamente durante el primer ingreso (onboarding). Esto previene bloqueos por filtros de spam o falta de disponibilidad de servidores de correo externos.
* **Política de seguridad:** Una vez validadas con éxito las respuestas correspondientes, el usuario puede establecer de inmediato una nueva contraseña que satisfaga los lineamientos de seguridad de la plataforma (longitud mínima de 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Guía operativa paso a paso:** Para consultar el procedimiento interactivo en pantalla con las capturas de cada paso, remitirse a la **[Sección 10.1.4: Procedimiento de Recuperación de Contraseña (Ambos Portales)](#1014-procedimiento-de-recuperación-de-contraseña-ambos-portales)**.

### 8.4. Creación y Registro Centralizado de Usuarios (Exclusivo Administrador)
El sistema no cuenta con registro público autónomo; ninguna persona puede crear una cuenta por sí misma:
* **Facultad exclusiva de administración:** La creación, habilitación y asignación de roles para nuevos usuarios es responsabilidad exclusiva del rol **Administrador**.
* **Gestión centralizada desde el Panel Administrativo:** Aplica de forma unificada tanto para los usuarios que operan el Sitio Web como para quienes consultan la Intranet. El procedimiento operativo paso a paso y la interfaz para llevar a cabo esta labor se explican a detalle en la **Sección 10.3.1** de este manual.

## 8.5. Primer Ingreso al Sistema (Onboarding)

Cuando el Administrador crea una cuenta nueva, el funcionario debe completar obligatoriamente la configuración inicial de seguridad antes de poder operar en la plataforma.

### 8.5.1. Recepción de Credenciales Iniciales

Al crear la cuenta, el Administrador establece una **contraseña temporal** y la comunica de forma manual al funcionario a través del canal corporativo que considere apropiado (correo electrónico, mensaje de chat interno u otro medio). **El sistema no envía ningún correo automático de bienvenida.** La contraseña temporal no tiene fecha de expiración: permanece activa hasta que el funcionario la use para completar su primer ingreso.

Al acceder por primera vez con estas credenciales provisorias, el sistema interrumpe el flujo de navegación habitual y obliga al funcionario a completar el protocolo de configuración inicial:
* **Establecimiento de contraseña definitiva:** Registro de una clave personal e intransferible que cumpla con los 5 requisitos de la política de contraseñas robustas (ver [Sección 6.3](#63-requisitos-de-credenciales-y-cuentas-de-acceso)).
* **Parametrización de preguntas de seguridad:** Selección y respuesta obligatoria de tres preguntas que habilitan el mecanismo autónomo de recuperación de cuenta ante eventuales bloqueos u olvidos.

Una vez validados estos datos, el sistema guarda la configuración definitiva y concede el acceso formal al portal o sección correspondiente según el rol asignado. *(Para consultar la guía visual paso a paso con las capturas de pantalla de este procedimiento, ver [Sección 10.1.1: Flujo de Primer Ingreso al Sistema (Onboarding y Configuración Inicial)](#1011-flujo-de-primer-ingreso-al-sistema-onboarding-y-configuración-inicial)).*

## 8.6. Cierre de Sesión y Expiración Preventiva

El cierre de sesión seguro es una práctica obligatoria para salvaguardar la privacidad de las cuentas y proteger la información del observatorio, especialmente al operar en estaciones de trabajo compartidas o redes abiertas:
* **Cierre de sesión en el Panel Administrativo:** Los administradores finalizan su sesión activa mediante el menú desplegable de perfil ubicado en la parte inferior del menú lateral izquierdo.
* **Cierre de sesión en la Intranet:** Directivos, editores y administradores autenticados cierran su sesión mediante el botón de salida segura ubicado en la esquina superior derecha de la barra superior de la Intranet.
* **Efecto en el Sitio Web Público:** Dado que el portal público no dispone de controles de perfil ni botones de sesión en su cabecera, al cerrar sesión desde la Intranet o el Panel Administrativo el token de acceso queda invalidado de inmediato; al navegar nuevamente en el Sitio Web Público, el botón flotante de edición (Speed Dial) desaparece y la vista vuelve a la modalidad ciudadana estándar.
* **Invalidación de credenciales y tokens:** Al presionar el botón de salida segura, el sistema destruye el token de autenticación activo en el navegador y redirige al usuario a la pantalla de inicio de sesión correspondiente.
* **Expiración preventiva por inactividad:** Las sesiones inactivas expiran de manera automática tras **30 minutos** sin actividad detectada. En tal caso, el sistema suspende la sesión de forma preventiva y solicita al usuario autenticarse nuevamente para proteger los datos.

*(Para consultar la guía visual paso a paso con las capturas de pantalla del cierre de sesión, ver [Sección 10.1.5: Procedimiento de Cierre de Sesión (Logout)](#1015-procedimiento-de-cierre-de-sesión-logout)).*



---

## 9. Interfaz general: Páginas fijas, controles del sistema y lienzo editable

La plataforma del Observatorio Laboral y Ocupacional (OLO) articula su experiencia de navegación y administración mediante una clara diferenciación entre las **páginas y controles fijos del sistema**, los **componentes ajustables de cabecera y pie** y el **área central de contenido dinámico maquetable**. Esta sección detalla la disposición visual en los tres portales del ecosistema (**Sitio Web Público**, **Panel Administrativo** e **Intranet**), aclarando qué elementos son estructuralmente fijos, cómo operan los componentes configurables en el editor visual y bajo qué reglas se despliega el botón de edición.

### 9.1. Estructura y Elementos del Sistema en los Tres Portales

El sistema se compone de tres portales complementarios, cada uno con propósitos y características de interfaz claramente definidos:

1. **Sitio Web Público:**
   * **Propósito:** Portal de acceso abierto y consulta libre para la ciudadanía, investigadores y comunidad general, que sirve a su vez como punto de enlace institucional hacia el entorno privado del observatorio.
   * **Controles y páginas fijas del sistema:**
     * *Franja superior GOV.CO (Fecha y hora en vivo):* Barra azul fija superior donde se ubica el texto interactivo de fecha y hora, que sirve como punto de acceso para que el personal editorial y administrativo inicie sesión (`/login`) en el portal.
     * *Botón de Búsqueda (Buscador Global):* Control fijo e inamovible ubicado en la zona superior, diseñado para consultar en tiempo real ocupaciones, publicaciones y páginas de todo el observatorio sin depender de la maquetación de la página.
     * *Botón de Acceso a la Intranet:* Enlace fijo permanente ubicado en la esquina superior derecha del menú de navegación hacia el portal privado independiente de la Intranet del OLO.
     * *Páginas fijas del aplicativo:* Interfaces programadas de autenticación (`/login`, `/recuperar-password`) y pantallas de primer ingreso (onboarding), las cuales no forman parte de las páginas dinámicas y no pueden ser alteradas ni eliminadas desde el editor.
   * **Componentes ajustables de Cabecera y Pie de página:**
     * Tanto la cabecera como el pie de página funcionan mediante componentes maquetables del editor visual: los editores autorizados (a través de la opción de plantilla "Menú y pie") pueden personalizar los enlaces del menú, logos, redes y textos informativos. Estos componentes son flexibles y ajustables, pudiendo adaptarse a las necesidades informativas de la plataforma o configurarse según el diseño requerido.
   * **Área central dinámica:** Lienzo donde se despliegan los contenidos maquetados mediante bloques (artículos, cifras, visores y publicaciones).

> **[Captura: Elementos Fijos Sitio Web]**
> *Esquema general del Sitio Web Público mostrando la franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Sitio Web (Móvil)]**
> *Esquema general del Sitio Web Público mostrando la franja superior GOV.CO con el acceso por fecha y hora, los controles fijos (búsqueda e intranet), el área de contenido dinámico central y el pie de página. (Vista en dispositivo móvil).*

2. **Panel Administrativo (`/admin`):**
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

3. **Intranet del OLO:**
   * **Propósito:** Entorno privado y protegido orientado al seguimiento estratégico, consulta de tableros de indicadores y trabajo interno de directivos y funcionarios del SENA.
   * **Elementos y páginas fijas del sistema:**
     * *Pantalla de bloqueo y acceso obligatorio:* Página fija que intercepta cualquier navegación no autenticada, forzando el ingreso exclusivo con cuenta corporativa `@sena.edu.co`.
     * *Temporizador preventivo:* Módulo en segundo plano que finaliza la sesión automáticamente tras 30 minutos de inactividad técnica.
     * *Control de salida:* Acceso seguro de cierre de sesión siempre disponible en la barra superior.
   * **Componentes ajustables de Cabecera y Pie internos:**
     * Al igual que en el sitio público, el marco superior e inferior de la Intranet está respaldado por componentes configurables que los editores pueden adaptar según las secciones internas del observatorio.
   * **Área central dinámica:** Lienzo donde se presentan las secciones analíticas e indicadores, con la posibilidad de incorporar componentes opcionales de visualización como tableros de Power BI.

> **[Captura: Elementos Fijos Intranet]**
> *Esquema general de la Intranet mostrando la barra superior con los controles fijos (buscador interno y botón de cierre de sesión), el área de contenido dinámico central y el pie de página.*
>
> **[Captura: Elementos Fijos Intranet (Móvil)]**
> *Esquema general de la Intranet mostrando la barra superior con los controles fijos (buscador interno y botón de cierre de sesión), el área de contenido dinámico central y el pie de página. (Vista en dispositivo móvil).*

### 9.2. Botón Flotante de Edición: Despliegue Condicional por Sesión y Permisos

Uno de los elementos interactivos más importantes en el Sitio Web y la Intranet es el **Botón Flotante de Edición (Menú de Edición)**. Aunque forma parte de la estructura visual de las páginas, **su visualización en pantalla es estrictamente condicional**: el sistema comprueba en tiempo real si el usuario ha iniciado sesión y cuáles permisos específicos tiene asignados antes de mostrarlo:

* **Caso 1: Usuario no autenticado (Ciudadanía y visitantes anónimos):**
  * El botón flotante **no se muestra en pantalla** para los visitantes. La página pública se presenta completamente limpia, sin barras ni herramientas de edición, garantizando una lectura despejada y cómoda para la ciudadanía.

> **[Captura: Vista Ciudadana sin Botón Flotante]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla.*
>
> **[Captura: Vista Ciudadana sin Botón Flotante (Móvil)]**
> *Vista pública y limpia de la página para la ciudadanía y usuarios anónimos, donde el botón flotante de edición no se muestra en pantalla. (Vista en dispositivo móvil).*

* **Caso 2: Usuario autenticado sin permisos de edición (Directores y Subdirectores):**
  * Al iniciar sesión con cuenta corporativa `@sena.edu.co`, el sistema identifica que el usuario posee un perfil configurado en modo de **solo lectura**. Debido a que no cuenta con facultades de edición ni administración, el botón flotante **permanece completamente oculto**, impidiendo que el personal directivo ingrese por error al modo de diseño o altere contenidos.

> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante]**
> *Pantalla de la Intranet para perfiles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto.*
>
> **[Captura: Vista Directiva Solo Lectura sin Botón Flotante (Móvil)]**
> *Pantalla de la Intranet para perfiles directivos en modalidad de solo lectura, donde el botón flotante de edición permanece completamente oculto. (Vista en dispositivo móvil).*

* **Caso 3: Usuario autenticado con rol de Editor o Administrador:**
  * Si el funcionario cuenta con sesión activa y permisos editoriales, el sistema despliega el botón circular flotante en la esquina inferior de la pantalla. Al hacer clic o pasar el cursor, el botón despliega exclusivamente las opciones para las que el usuario está autorizado:
    * **"Editar sección":** Aparece si el usuario tiene asignado el permiso para editar esa página específica (del Sitio Web o de la Intranet) o si es Administrador.
    * **"Menú y pie":** Se activa únicamente si el rol posee el permiso explícito para editar la cabecera y el pie de página de la plantilla en el editor visual.
    * **"Nueva página":** Disponible si el usuario cuenta con la facultad de crear nuevas páginas en el sistema.
    * **"Eliminar página":** Se visualiza exclusivamente en páginas dinámicas creadas por usuarios, siempre que el rol tenga el permiso de borrado y la página no posea enlaces activos que generen enlaces rotos.
  * **Regla de restricción por página:** Si un editor con un rol personalizado navega por una página para la cual no tiene permisos asignados, las opciones no autorizadas no estarán visibles; si no tiene permisos para ninguna acción en dicha página, el botón flotante completo se oculta automáticamente.

> **[Captura: Botón Flotante de Edición]**
> *Despliegue condicional del botón flotante de edición en pantalla para un usuario autenticado con permisos activos.*
>
> **[Captura: Botón Flotante de Edición (Móvil)]**
> *Despliegue condicional del botón flotante de edición en pantalla para un usuario autenticado con permisos activos. (Vista en dispositivo móvil).*

### 9.3. Diferenciación entre Páginas Fijas y Lienzo Dinámico del Editor Visual

La frontera entre la infraestructura base y la gestión de contenido define la seguridad del sistema:
* **Límites de las páginas fijas del sistema:** Ningún usuario, independientemente de sus permisos, puede alterar mediante el editor visual las pantallas programadas fijas (como las interfaces de inicio de sesión o recuperación de credenciales), las validaciones de acceso de la sesión ni las vistas del Panel Administrativo.
* **Área central maquetable (Lienzo del Editor Visual):** Corresponde al lienzo central de trabajo de las páginas del Sitio Web y la Intranet. En esta zona, los editores autorizados pueden organizar y apilar bloques prediseñados:
  * *Textos y encabezados:* Párrafos enriquecidos, títulos y tarjetas de artículos.
  * *Multimedia y lectura:* **Visores de PDF** para documentos oficiales y **visores de videos** para cápsulas del observatorio.
  * *Analítica y datos:* **Tableros BI**, como componente opcional maquetable para embeber paneles interactivos de Power BI cuando la página lo requiera.
  * *Navegación e interacción:* Acordeones de preguntas, enlaces de descarga y botones de enlace.

### 9.4. Estandarización de Botones y Controles de Acción

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

## 10. Funcionalidades (Flujo Operativo Paso a Paso)

Esta sección detalla de forma exhaustiva los flujos de trabajo de la plataforma, guiando al usuario paso a paso desde la interacción con botones específicos en la interfaz hasta la ejecución de procesos centrales en el Panel Administrativo. *(Nota: El proceso de maquetación y edición de páginas mediante el Editor Visual se explica exclusivamente en la sección 12).*

### 10.1. Ingreso y Recuperación de Contraseña

#### 10.1.1. Flujo de Primer Ingreso al Sistema (Onboarding y Configuración Inicial)
Cuando el Administrador crea una cuenta nueva, asigna una contraseña temporal provisoria. Este procedimiento es de carácter obligatorio para todo funcionario nuevo del SENA (Editores, Administradores, Directores y Subdirectores) y se ejecuta una única vez antes de poder operar de forma habitual en la plataforma:

1. **Inicio de sesión con contraseña temporal:** El funcionario accede a la pantalla de acceso del portal correspondiente (Sitio Web Público o Intranet, según su rol) e ingresa su correo corporativo `@sena.edu.co` junto con la contraseña temporal comunicada manualmente por el Administrador.

> **[Captura: Login Primer Ingreso]**
> *Formulario de inicio de sesión con las credenciales temporales.*
>
> **[Captura: Login Primer Ingreso (Móvil)]**
> *Formulario de inicio de sesión con las credenciales temporales. (Vista en dispositivo móvil).*

2. **Detección automática del primer ingreso:** El sistema detecta que la cuenta tiene pendiente la configuración inicial de seguridad e interrumpe el flujo normal de redirección, mostrando obligatoriamente la pantalla de parametrización de cuenta (`/first-login`).

> **[Captura: Pantalla Configuración Inicial]**
> *Pantalla de configuración obligatoria que aparece tras el primer inicio de sesión.*
>
> **[Captura: Pantalla Configuración Inicial (Móvil)]**
> *Pantalla de configuración obligatoria que aparece tras el primer inicio de sesión. (Vista en dispositivo móvil).*

3. **Establecimiento de contraseña definitiva:** El sistema solicitará al funcionario crear su clave definitiva personal e intransferible. Se debe digitar la nueva contraseña en el primer campo y repetirla en el segundo campo de confirmación, cumpliendo estrictamente los 5 lineamientos de la política de seguridad (ver [Sección 6.3](#63-requisitos-de-credenciales-y-cuentas-de-acceso)).

> **[Captura: Nueva Contraseña Primer Ingreso]**
> *Campos de nueva contraseña y confirmación con indicador visual de cumplimiento de políticas de seguridad.*
>
> **[Captura: Nueva Contraseña Primer Ingreso (Móvil)]**
> *Campos de nueva contraseña y confirmación con indicador visual de cumplimiento de políticas de seguridad. (Vista en dispositivo móvil).*

4. **Configuración de preguntas de seguridad:** A continuación, el sistema solicitará parametrizar obligatoriamente **tres preguntas de seguridad**. Para cada una:
   * Desplegar el menú y seleccionar la pregunta deseada de la lista predefinida.
   * Digitar la respuesta en el campo de texto correspondiente (la validación es sensible a mayúsculas y caracteres).

> **[Captura: Configurar Preguntas de Seguridad]**
> *Formulario de configuración inicial de las tres preguntas de seguridad con sus respectivos campos de respuesta.*
>
> **[Captura: Configurar Preguntas de Seguridad (Móvil)]**
> *Formulario de configuración inicial de las tres preguntas de seguridad con sus respectivos campos de respuesta. (Vista en dispositivo móvil).*

5. **Confirmación y acceso formal:** Hacer clic en el botón **"Guardar y continuar"**. Una vez validados los datos, el sistema guardará las credenciales definitivas y concederá el acceso formal al portal o sección correspondiente según el rol asignado (Sitio Web con herramientas de edición para editores, Panel Administrativo para administradores o Intranet para directivos).

#### 10.1.2. Inicio de Sesión Habitual en el Sitio Web Público (Banner GOV.CO)
Una vez completado el primer ingreso, los funcionarios autorizados acceden al Sitio Web Público de forma habitual. El portal no requiere inicio de sesión para la consulta de información abierta a la ciudadanía; para el personal del SENA con facultades editoriales o administrativas, la vía de entrada es el enlace interactivo de la franja superior del Estado:

*(Nota: Si el funcionario ingresa por primera vez con su contraseña temporal provisoria, el sistema detectará el estado pendiente y lo guiará de manera obligatoria por el flujo de onboarding detallado en la [Sección 10.1.1](#1011-flujo-de-primer-ingreso-al-sistema-onboarding-y-configuración-inicial)).*

1. **Ubicación del acceso (Banner GOV.CO):** En la franja azul superior del portal del Estado (GOV.CO), ubicar en el extremo derecho el texto interactivo con la **fecha y hora en vivo**. Al pasar el cursor sobre este elemento, el sistema desplegará la etiqueta de ayuda *"Iniciar sesión"*; al hacer clic, redirigirá a la pantalla corporativa de inicio de sesión (`/login`).
   *(Nota importante: El botón "Intranet" ubicado en el menú de navegación no es para iniciar sesión en el portal público, sino que enlaza a la plataforma independiente de la Intranet).*

> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO]**
> *Ubicación del texto interactivo de fecha y hora en el extremo derecho de la franja azul GOV.CO para acceder al inicio de sesión.*
>
> **[Captura: Enlace de Inicio de Sesión en Banner GOV.CO (Móvil)]**
> *Ubicación del texto interactivo de fecha y hora en la franja azul GOV.CO para acceder al inicio de sesión. (Vista en dispositivo móvil).*

2. **Formulario de credenciales:** En la pantalla institucional de acceso (`/login`), ingresar el correo corporativo (estrictamente `@sena.edu.co`) en el primer campo de texto.

> **[Captura: Campo Correo Corporativo]**
> *Vista del formulario de ingreso resaltando el campo para digitar el correo corporativo.*
>
> **[Captura: Campo Correo Corporativo (Móvil)]**
> *Vista del formulario de ingreso resaltando el campo para digitar el correo corporativo. (Vista en dispositivo móvil).*

3. **Ingreso de Contraseña:** En el segundo campo, digitar la contraseña robusta asignada.

> **[Captura: Campo Contraseña]**
> *Vista del formulario de ingreso resaltando el campo de contraseña.*
>
> **[Captura: Campo Contraseña (Móvil)]**
> *Vista del formulario de ingreso resaltando el campo de contraseña. (Vista en dispositivo móvil).*

4. **Ejecución:** Hacer clic en el botón principal **"Ingresar"** (destacado con el color de marca del portal).

> **[Captura: Botón Ingresar]**
> *Acción de hacer clic sobre el botón principal para ejecutar el inicio de sesión.*
>
> **[Captura: Botón Ingresar (Móvil)]**
> *Acción de hacer clic sobre el botón principal para ejecutar el inicio de sesión. (Vista en dispositivo móvil).*

5. **Resultado y Redirección por Rol (Exclusivo para el Sitio Web Público):** Si las credenciales son válidas, el sistema evalúa los permisos específicos del funcionario para redirigirlo según las funciones de este portal:
   * **Editores (y roles derivados de Editor):** Al validar sus permisos de maquetación, el sistema los redirige de vuelta a la **página de inicio del Sitio Web Público** (`/inicio`), donde se despliega de inmediato el **botón circular flotante (Speed Dial)** en la esquina de la pantalla para maquetar páginas, agregar bloques o configurar el menú y pie.
   * **Administradores:** Al poseer facultades integrales y acceso al panel (`acceso.panel`), el sistema los redirige de manera directa al **Panel Administrativo** (`/admin/dashboard`), habilitando la gestión de usuarios, roles, auditoría y bandeja de revisión.
   *(Nota: Si una cuenta autenticada no posee permisos de edición ni acceso al panel, el sistema detendrá el acceso y presentará la alerta: "Tu cuenta no tiene permisos de edición ni de acceso al panel").*

> **[Captura: Redirección de Rol Sitio Web]**
> *Ejemplo visual del acceso según perfil en el Sitio Web Público: retorno al inicio con botón flotante para Editores o redirección al Dashboard para Administradores.*
>
> **[Captura: Redirección de Rol Sitio Web (Móvil)]**
> *Ejemplo visual del acceso según perfil en el Sitio Web Público: retorno al inicio con botón flotante para Editores o redirección al Dashboard para Administradores. (Vista en dispositivo móvil).*

#### 10.1.3. Acceso e Inicio de Sesión Habitual en la Intranet del OLO
La Intranet es una plataforma privada e independiente del Sitio Web Público, concebida para el seguimiento gerencial, análisis de indicadores y trabajo interno. Su sistema de inicio de sesión es totalmente independiente:

*(Nota: Si un directivo o funcionario nuevo accede por primera vez con su contraseña temporal provisoria, el sistema activará de forma automática el flujo de primer ingreso descrito en la [Sección 10.1.1](#1011-flujo-de-primer-ingreso-al-sistema-onboarding-y-configuración-inicial)).*

1. **Punto de enlace y acceso a la plataforma:** Desde el Sitio Web Público, ubicar y hacer clic en el botón fijo **"Intranet"** en la cabecera (esquina superior derecha), o ingresar directamente mediante la dirección web (URL) corporativa de la Intranet.

> **[Captura: Botón Acceso Intranet en Cabecera]**
> *Ubicación del botón 'Intranet' en la esquina superior derecha del Sitio Web Público como punto de enlace hacia el portal privado.*
>
> **[Captura: Botón Acceso Intranet en Cabecera (Móvil)]**
> *Ubicación del botón 'Intranet' en la cabecera del Sitio Web Público como punto de enlace hacia el portal privado. (Vista en dispositivo móvil).*

2. **Pantalla de bloqueo y autenticación obligatoria:** Al acceder a la Intranet, el sistema no permite navegación pública e intercepta al usuario con la pantalla de bloqueo y formulario propio de inicio de sesión (`/login`).

> **[Captura: Pantalla Bloqueo Intranet]**
> *Pantalla de bloqueo de la Intranet del OLO exigiendo autenticación obligatoria.*
>
> **[Captura: Pantalla Bloqueo Intranet (Móvil)]**
> *Pantalla de bloqueo de la Intranet del OLO exigiendo autenticación obligatoria. (Vista en dispositivo móvil).*

3. **Ingreso de credenciales:** Completar los campos con el correo corporativo (`@sena.edu.co`) y la contraseña correspondiente en el formulario de la Intranet.

> **[Captura: Credenciales Intranet]**
> *Ingreso de correo corporativo y contraseña en el portal de la Intranet.*
>
> **[Captura: Credenciales Intranet (Móvil)]**
> *Ingreso de correo corporativo y contraseña en el portal de la Intranet. (Vista en dispositivo móvil).*

4. **Ejecución:** Presionar el botón principal **"Ingresar"** (o "Acceder a la Intranet").

> **[Captura: Botón Acceder Intranet]**
> *Clic en el botón de acceso para enviar y validar las credenciales en la Intranet.*
>
> **[Captura: Botón Acceder Intranet (Móvil)]**
> *Clic en el botón de acceso para enviar y validar las credenciales en la Intranet. (Vista en dispositivo móvil).*

5. **Resultado y acceso según perfil en la Intranet:** El sistema verifica que la cuenta disponga del permiso de acceso interno (`acceso.intranet`):
   * **Directores y Subdirectores:** Ingresan a la pantalla principal de la Intranet para consultar tableros analíticos de Power BI, reportes e indicadores en modalidad de **solo lectura**, sin herramientas de edición ni acceso al panel administrativo.
   * **Editores y Administradores:** Acceden a los módulos y secciones internas según los permisos que tengan asignados en la plataforma.
   *(Nota: Si un usuario no posee el permiso de acceso interno a la intranet, el sistema denegará la entrada indicando: "No tienes permisos para ingresar a la intranet").*

> **[Captura: Inicio Exitoso Intranet]**
> *Pantalla de inicio exitosa en la Intranet mostrando los tableros analíticos y contenidos correspondientes al perfil.*
>
> **[Captura: Inicio Exitoso Intranet (Móvil)]**
> *Pantalla de inicio exitosa en la Intranet mostrando los tableros analíticos y contenidos correspondientes al perfil. (Vista en dispositivo móvil).*

#### 10.1.4. Procedimiento de Recuperación de Contraseña (Ambos Portales)
Este procedimiento permite a cualquier funcionario restablecer de forma autónoma su clave de acceso ante olvidos o bloqueos, validando su identidad mediante las preguntas de seguridad configuradas durante el primer ingreso:

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
> *Ingreso del correo corporativo en el campo de recuperación.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Ingreso del correo corporativo en el campo de recuperación. (Vista en dispositivo móvil).*

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

#### 10.1.5. Procedimiento de Cierre de Sesión (Logout)

El sistema provee mecanismos específicos de salida segura según el entorno en el que se encuentre trabajando el usuario:

##### A. Cierre de Sesión desde el Panel Administrativo
1. **Acceso al menú de perfil:** En la parte inferior del menú lateral izquierdo, hacer clic sobre el nombre o foto de perfil del usuario.
2. **Selección de la opción:** En el menú desplegable oscuro que aparece, hacer clic en **"Cerrar sesión"**.
3. **Confirmación:** El sistema cerrará la sesión activa, invalidará el token de autenticación y redirigirá automáticamente a la pantalla de acceso.

> **[Captura: Logout Panel Admin]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo con la opción "Cerrar sesión" visible.*
>
> **[Captura: Logout Panel Admin (Móvil)]**
> *Menú desplegable de perfil en el menú lateral del Panel Administrativo con la opción "Cerrar sesión" visible. (Vista en dispositivo móvil).*

##### B. Cierre de Sesión desde la Intranet
1. **Ubicación del control de salida:** En la esquina superior derecha de la barra superior de la Intranet, ubicar el botón de salida segura (ícono de cerrar sesión).
2. **Ejecución:** Hacer clic en el botón **"Cerrar sesión"**.
3. **Confirmación:** El sistema destruirá la sesión activa e invalidará el token en el navegador, redirigiendo de inmediato a la pantalla de inicio de sesión de la Intranet.

> **[Captura: Logout Intranet]**
> *Botón de salida segura ('Cerrar sesión') en la barra superior de la Intranet.*
>
> **[Captura: Logout Intranet (Móvil)]**
> *Botón de salida segura ('Cerrar sesión') en la barra superior de la Intranet. (Vista en dispositivo móvil).*

*(Nota sobre el Sitio Web Público: El portal público no posee menú de usuario ni botón de cierre de sesión en su cabecera. Al cerrar sesión en la Intranet o en el Panel Administrativo, la sesión queda destruida para todo el sistema, por lo que al volver a ingresar al Sitio Web Público el botón circular flotante de edición desaparece automáticamente).*

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

2. **Acceso al formulario de creación o edición de rol:**
   * **Para crear un nuevo rol:** Se debe hacer clic en el botón **"Crear Rol"** (o **"Nuevo Editor"**) ubicado en la esquina superior derecha.
   * **Para editar un rol existente y sus permisos:** En la tabla de roles, se debe ubicar la fila correspondiente y hacer clic en el ícono de **Lápiz ("Editar rol y permisos")**.

> **[Captura: Paso 2]**
> *Evidencia visual de la acción descrita en el paso 2.*
>
> **[Captura: Paso 2 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 2. (Vista en dispositivo móvil).*

3. **Formulario y Gestión de Permisos Granulares (Catálogo de 5 Secciones):** Al abrir el formulario modal, el Administrador puede definir el nombre del rol, su descripción funcional y pulsar el botón **"Editar rol"** para desplegar el catálogo interactivo de permisos. La interfaz incluye una barra de búsqueda para filtrar permisos en tiempo real.
   
   Los permisos configurables para los roles de editor se organizan rigurosamente en **5 secciones exclusivas**, cada una con un propósito y alcance específico dentro de la plataforma:

   * **1. Acceso (`acceso`):** Define las puertas de entrada al sistema. Si un rol no tiene activo el acceso al entorno respectivo, el usuario no podrá autenticarse ni visualizar su contenido:
     * *Sitio web público (`acceso.sitio`):* Habilita al usuario para autenticarse y disponer de facultades operativas sobre las páginas del portal público del OLO.
     * *Intranet (`acceso.intranet`):* Permite ingresar a la Intranet del OLO y consultar sus páginas y contenidos restringidos.
     *(Nota de seguridad: El acceso al Panel Administrativo `/admin` está restringido por código exclusivamente al Administrador y no se expone a los roles de editor).*

   * **2. Editar [Plantilla / Globales] (`plantilla`):** Agrupa los permisos para intervenir los componentes estructurales envolventes que comparten todas las páginas de un entorno determinado. No modifican una página aislada, sino la cabecera (header) y pie de página (footer) de forma global:
     * *Menú y pie de el sitio web (`editar.sitio.menu-y-pie`):* Otorga la facultad de maquetar y modificar la barra superior de navegación y el pie de página de todo el portal del OLO.
     * *Menú y pie de la intranet (`editar.intranet.menu-y-pie`):* Otorga la facultad de maquetar y modificar el menú y pie de página compartidos por todas las páginas de la Intranet.
     *(Por motivos de control y debido a su impacto global, estos interruptores no cuentan con botón de activación masiva).*

   * **3. Secciones del sitio web (`secciones-sitio`):** Habilita la edición granular de páginas específicas pertenecientes al portal web público:
     * *Inicio (`editar.sitio.inicio`):* Permite editar y reestructurar los bloques de contenido de la página principal del portal público.
     * *Política de privacidad (`editar.sitio.politica-de-privacidad`):* Permite editar el contenido legal y términos de privacidad del portal.
     * *Páginas dinámicas del sitio (`editar.sitio.[slug]`):* Cada página creada para el portal público se incorpora automáticamente como un permiso independiente, mostrando su nombre real para asignar o revocar su edición.
     *(Dispone de la opción rápida "Todas / Quitar todas" para conmutar el grupo completo en un solo clic).*

   * **4. Secciones de la intranet (`secciones-intranet`):** Habilita la edición granular de páginas específicas pertenecientes a la Intranet del OLO:
     * *Inicio (`editar.intranet.inicio`):* Permite maquetar y editar la portada de la intranet.
     * *Tasa de vinculación (`editar.intranet.tasa`):* Permite editar la página de indicadores y tasas de vinculación laboral.
     * *Matriz de tendencias (`editar.intranet.matriz`):* Permite editar el contenido de la matriz de tendencias ocupacionales.
     * *Encuestas de calidad de la formación (`editar.intranet.encuestas-calidad-de-formacion`):* Permite editar la sección de encuestas sobre la calidad formativa.
     * *Encuestas de seguimiento laboral (`editar.intranet.encuestas-seguimiento-laboral`):* Permite editar la sección de encuestas de seguimiento a egresados.
     * *Páginas dinámicas de la intranet (`editar.intranet.[slug]`):* Cada página creada dentro de la intranet se muestra de forma individual con su respectivo interruptor de edición.
     *(Dispone de la opción rápida "Todas / Quitar todas" para conmutar el grupo completo en un solo clic).*

   * **5. Qué puede hacer dentro del editor (`editor`):** Regula las facultades operativas y de gestión estructural que el editor puede ejercer sobre las páginas que tenga autorizadas:
     * *Crear secciones nuevas (`secciones.crear`):* Faculta al rol para crear nuevas páginas o rutas dinámicas en el portal o intranet.
     * *Eliminar secciones (`secciones.eliminar`):* Autoriza a borrar definitivamente páginas dinámicas creadas desde el editor, junto con su contenido e histórico de versiones (acción irreversible; las secciones de fábrica del sistema están protegidas y nunca se pueden eliminar).

   * **Manejo de interruptores, indicadores y guardado:**
     * Junto a cada permiso existe un **botón tipo interruptor (switch)** (encendido/apagado) operable con un clic o mediante teclado (tecla Espacio).
     * El sistema muestra etiquetas informativas en tiempo real (**"se añade"** o **"se quita"**) indicando las diferencias respecto a la configuración original.
     * En el pie del modal, se detalla un resumen de los cambios efectuados antes de confirmar.
     * Al hacer clic en el botón **"Guardar permisos"** (o **"Guardar Rol"**), los cambios se aplican de manera inmediata y afectarán a todos los usuarios asignados a dicho rol.
   
   * **Delegación de páginas nuevas a otros roles:** Cuando un editor crea una página nueva en el sistema, esta solo queda habilitada automáticamente para el rol creador, para el rol base Editor y para el Administrador. Si otros roles derivados requieren intervenir o editar esa página, el Administrador debe ingresar a este submenú, hacer clic en el ícono de lápiz sobre el rol correspondiente, buscar la página dentro de "Secciones del sitio web" o "Secciones de la intranet", y encender manualmente su interruptor de edición.

> **[Captura: Paso 3]**
> *Evidencia visual de la acción descrita en el paso 3.*
>
> **[Captura: Paso 3 (Móvil)]**
> *Evidencia visual de la acción descrita en el paso 3. (Vista en dispositivo móvil).*

#### 10.3.3. Eliminación de Roles (Submenú: Roles)

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

> **Advertencia:** Restaurar un respaldo eliminará de forma irreversible todos los cambios realizados después de la fecha del respaldo seleccionado. Esta acción no puede deshacerse.

Para solicitar la restauración, el Administrador debe contactar al equipo técnico responsable del servidor, ya que esta operación se ejecuta a nivel de infraestructura y no está disponible como botón de autoservicio dentro del Panel Administrativo.

### 10.7. Panel Administrativo: Carga Masiva de Datos en Excel

Módulo exclusivo del Administrador para importar o actualizar de forma masiva clasificaciones (CNO/CUOC), estadísticas e indicadores del observatorio.

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

La cabecera y el pie de página son componentes envolventes globales del portal. Su edición está disponible para el rol **Editor base** y para los **Roles hijos** a quienes el Administrador haya habilitado explícitamente este permiso.

1. **Acceso:** Desde el menú del botón flotante de edición en cualquier página, el usuario debe seleccionar la opción **"Editar cabecera"** o **"Editar pie"**.

> **[Captura: Menú Editar Cabecera]**
> *Opción de edición de cabecera en el menú flotante del editor.*
>
> **[Captura: Menú Editar Cabecera (Móvil)]**
> *Opción de edición de cabecera en el menú flotante del editor. (Vista en dispositivo móvil).*

2. **Lienzo de cabecera/pie:** Se abrirá el Editor Visual en modo de edición del componente global seleccionado. Los cambios aquí realizados se propagarán a **todas las páginas del portal simultáneamente**.

> **Advertencia:** Dado que la cabecera y el pie son globales, cualquier modificación aprobada afectará la apariencia de toda la plataforma. Se recomienda especial cuidado y la previsualización detallada antes de enviar a revisión.

3. **Guardado:** Al finalizar, se debe hacer clic en **"Guardar Borrador"** y enviar a revisión. El Administrador deberá aprobar los cambios antes de que sean visibles en el portal.

### 12.4. Eliminación de Páginas Dinámicas (Paso a Paso)

La eliminación de páginas dinámicas retira de forma definitiva la página y sus versiones del portal. Esta acción está disponible únicamente para el rol **Editor base**, el rol **Administrador** y aquellos **Roles hijos de editor** a los que se les haya concedido manualmente el permiso de eliminación sobre páginas.

1. **Acceso desde el botón flotante:** El editor debe navegar hacia la página dinámica que desea eliminar y hacer clic en el botón circular flotante con ícono de lápiz para desplegar el menú de opciones (sección 12.1).
2. **Selección de la opción:** En el menú desplegado, se debe hacer clic en la opción **"Eliminar página"**.

> **[Captura: Menú Flotante Eliminar Página]**
> *Opción "Eliminar página" seleccionada en el menú flotante del editor visual.*
>
> **[Captura: Menú Flotante Eliminar Página (Móvil)]**
> *Opción "Eliminar página" seleccionada en el menú flotante del editor visual. (Vista en dispositivo móvil).*

3. **Validación automática de enlaces activos (Protección contra enlaces rotos):** El sistema escanea en tiempo real todo el portal. Si la página está vinculada en el menú de navegación principal (cabecera o pie) o referenciada en enlaces de otras páginas, el borrado se bloquea inmediatamente y el sistema arroja una alerta roja impidiendo la eliminación (ver secciones 14.3 y 15.3). En tal caso, el usuario debe ingresar primero a la edición de la cabecera/pie (sección 12.3.4) o a las páginas enlazadas para retirar dichos vínculos antes de repetir el intento.

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
6. **Constancia en auditoría:** La página desaparece de la vista pública y del editor, pero el evento queda grabado de forma automática e inmutable en la bitácora de auditoría del sistema (sección 10.5), conservando el usuario ejecutor, la fecha, la hora y el registro de la acción.


## 13. Reportes y visualización de recursos

La plataforma ofrece múltiples formas de consultar y explorar la información generada por el observatorio. Dado que las páginas son editables mediante bloques, los editores pueden disponer estos componentes en distintas secciones según los requerimientos del momento:

### 13.1. Uso de tableros BI en la Intranet (Power BI)
En las páginas o secciones de la Intranet que integren este componente maquetable, los directivos y funcionarios autorizados pueden consultar tableros analíticos interactivos de Power BI embebidos. Cabe destacar que este es un componente opcional en el catálogo de bloques del editor visual, por lo que su visualización depende de la maquetación definida por los editores para cada página. Cuando el componente está presente, los usuarios pueden utilizar sus controles internos (filtros por período, región o sector) para actualizar gráficos y tablas en tiempo real sin recargar la página.

> **[Captura: Tablero BI]**
> *Tablero interactivo de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis.*
>
> **[Captura: Tablero BI (Móvil)]**
> *Tablero interactivo de Power BI embebido en una página de la Intranet, detallando los filtros de segmentación de datos disponibles para el análisis. (Vista en dispositivo móvil).*

### 13.2. Visor de PDFs y Documentos Normativos
El componente de visor de documentos permite a los usuarios leer y revisar archivos PDF oficiales (boletines, resoluciones, manuales o informes) directamente dentro de la interfaz del portal, con controles integrados de navegación de páginas y opción de lectura inmersiva.

> **[Captura: Visor de PDF]**
> *Visor de documentos y publicaciones en PDF integrado en la página.*
>
> **[Captura: Visor de PDF (Móvil)]**
> *Visor de documentos y publicaciones en PDF integrado en la página. (Vista en dispositivo móvil).*

### 13.3. Visor de Videos y Recursos Multimedia
A través del bloque de recursos visuales, los usuarios pueden reproducir contenidos audiovisuales, cápsulas informativas y videos del OLO directamente en la página, con controles de reproducción estándar y adaptabilidad a dispositivos móviles.

> **[Captura: Visor de Videos]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio.*
>
> **[Captura: Visor de Videos (Móvil)]**
> *Bloque de recursos audiovisuales con reproductor de video del observatorio. (Vista en dispositivo móvil).*

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

**Situación:** Alerta de "Correo inválido" o dominio no corporativo.
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

**Situación:** El componente de tablero analítico (Power BI) no carga o aparece en blanco en la página.
**Posible causa:** (1) La página contiene el bloque de Power BI pero la conexión a Internet es inestable o lenta. (2) La sesión o enlace del servicio embebido expiró internamente.
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
**Acción:** Las rutas fijas del sistema no son eliminables. Si se trata de una página de contenido, se deben retirar primero todos los enlaces activos que apunten hacia ella en el menú de navegación y en las demás páginas antes de proceder con el borrado.

### 15.4. Imposibilidad de crear nuevas secciones
**Situación:** Un editor no encuentra o no puede usar la opción para crear páginas nuevas.
**Posible causa:** Al usuario se le asignó un "Rol derivado de Editor" que no tiene activado el permiso manual de "Crear secciones".
**Acción:** El usuario debe solicitar al Administrador del sistema la activación de dicho permiso en el Panel Administrativo.

### 15.5. Timeout de Sesión y Pérdida de Trabajo No Guardado

**Situación:** El editor cierra el navegador o la sesión expira mientras tenía cambios sin guardar en el Editor Visual.
**Posible causa:** Se cerró el navegador accidentalmente, o la sesión expiró por inactividad antes de guardar el borrador.
**Acción:** Al volver a iniciar sesión y acceder a la página que se estaba editando, el sistema intentará recuperar el último borrador guardado. Los cambios realizados después del último guardado manual no podrán recuperarse. Se recomienda usar el botón **"Guardar Borrador"** con frecuencia durante sesiones de edición largas.

---

## 16. Glosario de términos técnicos y del observatorio

El presente glosario define y consolida de forma exhaustiva los términos, conceptos, siglas y herramientas de la plataforma OLO que aparecen a lo largo de las secciones del presente manual de usuario, organizados en estricto orden alfabético:

* **Bandeja de Revisión:** Módulo del Panel Administrativo donde el Administrador visualiza y gestiona las versiones y páginas enviadas por los editores para evaluar los cambios propuestos mediante vista previa, permitiendo aprobar su publicación, rechazarlas con observaciones de retroalimentación o descartar borradores mediante el botón de basurero.
* **Bitácora de Auditoría:** Historial cronológico permanente e inmutable que registra las acciones realizadas por los usuarios autenticados en la plataforma (quién ejecutó la acción, qué modificó, motivo del descarte, fecha y hora exacta), garantizando la trazabilidad operativa y la supervisión del sistema.
* **Bloque de Contenido:** Componente prediseñado de interfaz (textos, imágenes, tarjetas informativas, carruseles, acordeones, visores multimedia o tableros analíticos) que los editores configuran e incorporan en el editor visual para maquetar las páginas del Sitio Web y la Intranet.
* **Borrador (Modo de Borrador):** Estado de trabajo privado en el que los editores maquetan y estructuran una página sin que los cambios sean visibles al público o en la Intranet, hasta que sean enviados a revisión y aprobados por el Administrador.
* **Botón Flotante (Floating Action Button):** Botón circular interactivo visible en las páginas para usuarios con roles de editor autorizados, desde el cual se despliegan accesos rápidos a la edición, creación y eliminación de páginas.
* **Carga Masiva en Excel:** Función exclusiva del Administrador para ingresar o actualizar grandes volúmenes de datos ocupacionales, clasificaciones y estadísticas del observatorio mediante planillas de cálculo en formato `.xlsx`.
* **Contraseña (Contraseña Robusta):** Clave definitiva requerida para el inicio de sesión en el OLO, la cual debe cumplir estrictamente con los lineamientos de seguridad establecidos (mínimo 12 caracteres, mayúsculas, minúsculas, números y caracteres especiales).
* **Contraseña Temporal:** Clave provisoria asignada manualmente por el Administrador al registrar una nueva cuenta de usuario, válida únicamente para el primer acceso (onboarding) y sin caducidad automática de tiempo.
* **Dashboard (Tablero Principal):** Pantalla de inicio del Panel Administrativo que resume en tiempo real el estado del sistema mediante tarjetas de métricas numéricas y gráficos de actividad.
* **Descarte de Versión (Botón de Basurero):** Acción de control en la bandeja de revisión que permite al Administrador eliminar definitivamente un borrador no deseado o enviado por error. Exige registrar de forma obligatoria el motivo en la bitácora de auditoría y depura archivos huérfanos sin alterar la versión publicada.
* **Diseño Responsivo:** Capacidad de las interfaces del portal web y de la Intranet para adaptarse de manera automática y fluida a diferentes tamaños y resoluciones de pantalla, tanto en computadores de escritorio como en tabletas y dispositivos móviles.
* **Dominio Corporativo (`@sena.edu.co`):** Dominio de correo electrónico oficial del SENA exigido como requisito estricto y excluyente para la creación de cuentas, inicio de sesión y recuperación de contraseña del personal autorizado en el OLO.
* **Drag and Drop (Arrastrar y Soltar):** Acción interactiva que permite a los editores seleccionar un bloque de contenido con el ratón y moverlo hacia el lienzo de trabajo para maquetar la página.
* **Editor Visual:** Herramienta interactiva de maquetación basada en bloques que permite a editores y administradores estructurar, diseñar y actualizar visualmente las páginas del Sitio Web y la Intranet.
* **Exportación (Descarga PDF):** Funcionalidad que permite al usuario consolidar los resultados de una búsqueda o consulta en un documento descargable en formato PDF u hoja de cálculo.
* **Ficha Técnica / Vista en Detalle:** Pantalla o módulo que despliega la información detallada y completa de un registro seleccionado a través del buscador o catálogos interactivos.
* **Filtros Avanzados:** Herramientas de segmentación dinámica que permiten refinar las búsquedas por áreas temáticas, niveles, categorías o palabras clave.
* **Flujo Editorial (Revisión y Aprobación):** Ciclo formal de control en el que ningún cambio de contenido pasa a producción de manera directa, requiriendo que los borradores generados por los editores sean revisados, aprobados o rechazados por un Administrador.
* **Intranet del OLO:** Entorno privado del observatorio con autenticación obligatoria para directivos, editores y administradores, destinado a la consulta de módulos de información y tableros analíticos sobre el mercado laboral, descarga de informes internos y maquetación de secciones internas del OLO.
* **Lienzo de Edición:** Área interactiva de trabajo del editor visual donde los funcionarios autorizados estructuran, reordenan y configuran bloques de contenido mediante la interacción directa de arrastrar y soltar.
* **Modo de Solo Lectura:** Modalidad de acceso asignada a Directores y Subdirectores que les permite explorar tableros analíticos en la Intranet y descargar reportes, operando como usuarios autenticados pero sin facultades de edición ni acceso al Panel Administrativo.
* **OLO (Observatorio Laboral y Ocupacional):** Instancia del SENA encargada de recolectar, analizar y divulgar información y estadísticas sobre el mercado laboral, las ocupaciones y la pertinencia de la formación en Colombia.
* **Páginas Dinámicas y Gestionables:** Páginas y secciones de contenido del Sitio Web público y de la Intranet que pueden maquetarse y actualizarse mediante el editor visual, y que pueden ser eliminadas siempre que no cuenten con enlaces activos que provoquen enlaces rotos.
* **Panel Administrativo:** Entorno web privado y de acceso exclusivo para el rol Administrador (`/admin`), desde el cual se gestionan usuarios, se crean roles derivados de editor, se asignan permisos manuales, se gestiona la bandeja de revisión y se revisa la auditoría.
* **Permisos Granulares de Edición:** Conjunto de facultades específicas configurables por el Administrador al crear o modificar roles derivados de editor (editar cabecera/pie de página, crear páginas nuevas, eliminar páginas creadas, y asignación sobre páginas específicas del Sitio Web o la Intranet).
* **Plantilla Oficial de Carga (.xlsx):** Archivo predefinido en formato Excel disponible en el Panel Administrativo que contiene los encabezados y estructuras estandarizadas necesarias para efectuar la importación masiva de datos sin inconsistencias.
* **Power BI:** Plataforma externa de analítica y visualización de datos cuyas vistas pueden integrarse como un componente interactivo opcional (bloque de contenido) dentro de las páginas maquetadas del observatorio.
* **Preguntas de Seguridad:** Método autónomo de comprobación de identidad configurado por cada funcionario en su primer ingreso, utilizado para validar al titular de la cuenta durante el procedimiento de recuperación de contraseña ante olvidos.
* **Primer Ingreso (Onboarding):** Procedimiento obligatorio que realiza un funcionario nuevo al ingresar por primera vez con su contraseña temporal para registrar sus preguntas de seguridad y definir su contraseña robusta definitiva.
* **Protección contra Enlaces Rotos:** Validación automática que impide la eliminación de una página creada si existen menús u otras páginas que contengan enlaces activos hacia ella, evitando errores de navegación 404.
* **PWA (Aplicación Web Progresiva):** Tecnología que permite instalar la plataforma del observatorio en la pantalla de inicio de computadores o dispositivos móviles como una aplicación ligera e independiente desde el navegador web.
* **Respaldo de Base de Datos (Backup):** Copia de seguridad integral de la información del sistema generada desde el Panel Administrativo y empaquetada en un archivo comprimido con marca de tiempo.
* **Rol Hijo / Derivado de Editor:** Rol personalizado creado exclusivamente bajo la estructura de editor con el prefijo «Editor [Nombre]», el cual nace sin permisos por defecto y al que el Administrador le asigna manualmente permisos específicos sobre páginas o secciones.
* **Rutas Fijas del Aplicativo:** Vistas y pantallas programadas en el código base que no se gestionan a través del editor visual (como las interfaces de inicio de sesión, recuperación de credenciales y las rutas del Panel Administrativo), las cuales no pueden ser alteradas ni eliminadas desde el entorno de edición.
* **SENA (Servicio Nacional de Aprendizaje):** Entidad pública colombiana de formación técnica y profesional, titular de la plataforma tecnológica y responsable del Observatorio Laboral y Ocupacional.
* **Separación de Funciones:** Principio operativo y de seguridad del sistema donde los editores solo maquetan y proponen contenido en borrador, mientras que la aprobación, descarte y publicación final corresponde con exclusividad al Administrador.
* **Sitio Web Público:** Portal web del OLO de libre acceso y consulta abierta para la ciudadanía y comunidad en general, donde se consultan páginas dinámicas, boletines, estadísticas ocupacionales y publicaciones del observatorio.
* **Tablero BI (Power BI):** Componente maquetable opcional del editor visual que permite embeber paneles interactivos de análisis de datos en las páginas de la plataforma, facilitando la visualización de métricas dinámicas con filtros en tiempo real.
* **Visor de Documentos y PDFs:** Componente de interfaz que permite visualizar, leer y explorar documentos oficiales, boletines y publicaciones en formato PDF directamente en la pantalla sin descargarlos obligatoriamente.
* **Visor de Videos:** Componente interactivo para la reproducción de recursos audiovisuales y cápsulas de video integradas en las páginas del portal del OLO.
