# Convenciones de Código — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md`. Define cómo se escribe el código, para que tres repos y varios desarrolladores mantengan un estilo único. Aplica desde la primera línea; no es negociable una vez adoptado.

---

## 1. Nomenclatura (el resumen de una mirada)

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | `camelCase` | `usuarioActual`, `obtenerPaginaPublica()` |
| Componentes React | `PascalCase` | `TablaUsuarios`, `BloqueContenido` |
| Clases, modelos, tipos, interfaces | `PascalCase` | `Contenido`, `PaginaVersion`, `LockInfo` |
| Constantes globales / de entorno | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `JWT_SECRET` |
| **Todo archivo** (componentes, hooks, services, utils) | `kebab-case` | `tabla-usuarios.tsx`, `use-pagina.ts`, `paginas.service.ts` |
| Archivos de rutas/config Next | nombre exacto de Next | `page.tsx`, `layout.tsx`, `middleware.ts` |
| Carpetas | `kebab-case` | `edicion-concurrente/`, `buscador-ocupaciones/` |
| Tablas en base de datos | `snake_case` plural | `content_audit_logs`, `paginas` |
| Columnas en base de datos | `snake_case` | `content_id`, `created_at` |
| Endpoints REST | `kebab-case` plural | `/api/paginas`, `/api/role-permissions` |

**Regla base:** el **archivo** siempre va en `kebab-case`; el **identificador que exporta** siempre en su caso natural. Archivo `tabla-usuarios.tsx` → componente `TablaUsuarios`. Archivo `use-pagina.ts` → hook `usePagina()`.

> **Cambio respecto a la versión anterior de este documento.** Antes esta tabla pedía `PascalCase.tsx` para componentes. Se unificó todo en `kebab-case` por dos razones:
>
> 1. **Elimina una clase de bug que solo aparece en producción.** Se desarrolla en Windows, cuyo sistema de archivos no distingue mayúsculas, y se despliega en Docker sobre Linux, que sí. Un `import './userProfile'` cuando el archivo es `UserProfile.tsx` compila en la máquina del desarrollador y falla al desplegar. Con una única grafía válida en minúsculas, el error no se puede introducir.
> 2. **La regla queda sin excepciones que recordar.** Antes había que distinguir "componentes en Pascal, lógica en kebab", y en la práctica se violaba más de lo que se cumplía.
>
> **La migración se completó el 2026-09-16**: 72 archivos renombrados —los bloques Puck de las dos apps, las vistas de `login/`, los átomos y moléculas de `shared/ui/`, `blocks-renderer` y los 20 modelos Sequelize del backend— y 102 referencias reescritas. No queda ningún archivo `.ts`/`.tsx` en PascalCase. Los renombres se hicieron con `git mv` en dos pasos porque Git en Windows no detecta un cambio que solo altera mayúsculas. **La clave de cada bloque en `puck.config.tsx` no se tocó**: el contenido guardado en `paginas_versiones` lleva `type: "TasaVideo"` escrito dentro. Ver `8-ciclo-editorial.md` §5, fase 5.

### Idioma
- **Dominio en español** (es un proyecto SENA): `Pagina`, `Contenido`, `guardarBorrador`, `usuarioActual`. Los nombres de negocio se leen igual que los requerimientos.
- **Términos técnicos universales en inglés**: `id`, `slug`, `createdAt`, `handler`, `middleware`, `repository`. No traducir lo que ya es estándar.
- **No mezclar** dentro de un mismo identificador: `obtenerUserById` está mal → `obtenerUsuarioPorId`.

---

## 2. Convenciones por tipo de archivo

### 2.1 Componentes React (`.tsx`)
- Un componente por archivo; el archivo es la versión `kebab-case` del nombre del componente (`TablaUsuarios` → `tabla-usuarios.tsx`).
- Props tipadas con una interface `PascalCase` + sufijo `Props`: `interface TablaUsuariosProps { ... }`.
- Componentes de servidor por defecto (Next 16 App Router); marcar `'use client'` solo cuando se necesite estado/efectos/eventos.
- Orden interno: imports → tipos/interfaces → componente → export.

```tsx
// tabla-usuarios.tsx
import { DataTable } from '@/shared/ui/organisms/data-table';
import { useUsuarios } from '../hooks/use-usuarios';

interface TablaUsuariosProps {
  filtroRol?: string;
}

export function TablaUsuarios({ filtroRol }: TablaUsuariosProps) {
  const { usuarios, isLoading } = useUsuarios(filtroRol);
  // ...
}
```

### 2.2 Hooks (`use-*.ts`)
- Nombre de archivo `kebab-case`, nombre de función `camelCase` con prefijo `use`: archivo `use-pagina.ts` → función `usePagina()`.
- Un hook por archivo. Devolver objeto nombrado (`{ pagina, isLoading, error }`), no una tupla posicional salvo que imite la API de React.

### 2.3 Services (`*.service.ts`)
- La única capa del frontend que llama a la API. Nombre por dominio: `paginas.service.ts`.
- Viven en `services/`, **nunca** en `api/`: ese nombre está tomado por `app/api/`, los route handlers de Next que hacen de proxy hacia la API :4000. El proxy y el cliente que lo consume no deben compartir nombre.
- Funciones `camelCase` que describen la acción de negocio: `obtenerPaginaPublica`, `guardarBorrador`.
- Nunca meter JSX ni estado de React aquí — es lógica pura de datos.
- **Un servicio no mezcla públicos.** Si unas funciones son anónimas y cacheables y otras exigen sesión, van en servicios distintos. Ver `8-ciclo-editorial.md` §2.

### 2.4 Carpetas de una feature
- `components/` para la UI del dominio. **Nunca `ui/`**: en este proyecto `shared/ui/` es el sistema de diseño institucional y además el catálogo de bloques del editor. La misma palabra no puede significar dos cosas.
- `hooks/`, `services/`, `types.ts`, `index.ts` según §4.0 de la guía.
- Si el dominio tiene ciclo de vida (estados con actores o permisos distintos), se organiza por etapa. Ver `8-ciclo-editorial.md` §3.2.

### 2.5 Backend — capas (Clean Architecture)
- `*.controller.ts` → objeto `PascalCase` + `Controller`: `export const PaginaController = { ... }`. Métodos `camelCase`. Traduce `req/res`, no contiene lógica.
- `*.usecase.ts` → funciones `camelCase` exportadas, una acción de negocio por función: `export const aprobarPagina = async (...) => { ... }`.
- `*.repository.ts` → objeto `PascalCase` + `Repository`. Única capa que toca Sequelize.
- `*.routes.ts` → solo define endpoints, cero lógica.
- Modelos Sequelize → clase `PascalCase` singular (`Contenido`), tabla `snake_case` plural (`contenidos`).

---

## 3. Comentarios

**Principio: el código explica el *qué*; los comentarios explican el *por qué*.** Un comentario que repite lo que el código ya dice es ruido.

- **Sí comentar:** decisiones no obvias, workarounds, restricciones de negocio, advertencias de seguridad.
  ```ts
  // El JWT aquí solo se decodifica, NO se valida la firma.
  // La validación real ocurre en la API (auth.middleware.ts). No confiar en esto para autorización.
  const decoded = decodeJwt(token);
  ```
- **No comentar** lo evidente:
  ```ts
  //  incrementa el contador en 1
  contador++;
  ```
- **JSDoc** en funciones públicas de use-cases, services y utilidades compartidas: describir propósito, parámetros y qué lanza.
  ```ts
  /**
   * Aprueba un borrador: reemplaza la versión publicada y emite ContenidoPublicado.
   * @throws {Error} 403 si el usuario no es Administrador
   */
  export const aprobarPagina = async (slug: string, usuarioId: string) => { ... };
  ```
- **`TODO` / `FIXME`** siempre con contexto y, si aplica, referencia a la fase: `// TODO(Fase 6): integrar con el lock de edición concurrente`. Nunca dejar un `TODO` anónimo.
- **Comentarios en español** (coherente con el dominio); JSDoc igual.

---

## 4. TypeScript

- **`strict: true`** en los tres `tsconfig`. Sin excepciones.
- **Prohibido `any` implícito.** Si un tipo es genuinamente desconocido, usar `unknown` y estrechar. `any` explícito solo con comentario justificando por qué.
- **Tipos compartidos en un solo lugar** (`@olo/types` cuando exista): `Pagina`, `Contenido`, `Usuario`, `Rol`. No redefinir el mismo tipo en dos repos.
- **`interface` para formas de objeto** (props, modelos, contratos); **`type` para uniones y utilidades** (`type Estado = 'borrador' | 'en_revision' | 'publicado'`).
- **Evitar enums de TS**; preferir uniones de string literales o `as const` (mejor tree-shaking y serializan directo a JSON/JSONB).
- **Nombrar los estados como en la BD**: `'en_revision'` (snake_case) porque así viaja el dato; no `'enRevision'` en un lado y `'en_revision'` en otro.

---

## 5. Imports y estructura de archivo

- **Orden de imports** (separados por línea en blanco): (1) librerías externas, (2) alias internos `@/…`, (3) relativos `./…`, (4) tipos (`import type`).
- **Usar el alias `@/`** para imports internos del repo; relativos solo dentro de la misma feature.
- **Un export nombrado por archivo** como regla; `export default` solo donde Next lo exige (`page.tsx`, `layout.tsx`).
- **Barrel files (`index.ts`)** por feature para exponer su API pública, cuidando no crear ciclos de importación.
- **Dirección de dependencia** (recordatorio del maestro): `app → features → shared`; `shared` nunca importa de `features`.

---

## 6. Manejo de errores

- **Backend**: los use-cases lanzan errores con `status` (`throw Object.assign(new Error('Rol no encontrado'), { status: 404 })`); un único `error.middleware.ts` los traduce a respuesta HTTP. Los controllers usan `try/catch` que delega a `next(err)`, nunca arman la respuesta de error a mano.
- **Frontend**: los services propagan errores tipados; los componentes los manejan vía `error.tsx` de Next o estado local con feedback al usuario. Nunca `catch` vacío que silencie el error.
- **Mensajes al usuario en español y sin filtrar detalles internos** (no exponer stack traces, nombres de tablas, ni el error crudo de Sequelize).

---

## 7. Rendimiento (reglas de código, no solo arquitectura)

- **Server Components por defecto**; `'use client'` solo lo estrictamente interactivo, lo más abajo posible en el árbol.
- **`next/dynamic` con `ssr: false`** para librerías pesadas de uso puntual: Handsontable, xlsx, docx-preview, gráficos. No van en el bundle inicial.
- **Memoización con criterio**: `useMemo`/`useCallback` solo cuando hay costo real medible o para estabilizar dependencias; no por defecto.
- **Listas siempre con `key` estable** (nunca el índice del array si la lista puede reordenarse).
- **Queries del backend acotadas**: seleccionar solo las columnas necesarias, paginar listados (buscador, "Últimas publicaciones"), nunca `findAll` sin límite en tablas que crecen.

---

## 8. Herramientas que hacen cumplir esto

Estas convenciones no se vigilan a mano — se automatizan:

- **ESLint: una configuración por frontend.** La arquitectura tiene **dos aplicaciones Next.js independientes** — `3000-sitio-web/` y `3001-intranet/` — cada una con su propio `package.json`, su propio build y su propio despliegue. Por eso cada una lleva su **`eslint.config.mjs` en su raíz**, no una config compartida en la raíz del monorepo:
  - `3000-sitio-web/eslint.config.mjs`
  - `3001-intranet/eslint.config.mjs`

  Ambas extienden el mismo preset (`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`), así que las reglas son idénticas; lo que no se comparte es el archivo. Esto es lo que espera Next.js: el linter resuelve la config desde el directorio del proyecto, y una config en la raíz del monorepo no se aplicaría sin declarar workspaces de npm (hoy no existe un `package.json` raíz).

  **Al tocar las reglas hay que actualizar los dos archivos.** Si divergen, la app que se quede corta deja de vigilar sus propias convenciones — que fue exactamente lo que pasó cuando `sitio-web` se quedó sin config y acumuló 74 problemas sin que nadie se enterara.

  El paquete compartido `packages/blocks-renderer/` no es una app Next.js y hoy no se lintea por separado.

- **Prettier**: formato único (comillas, comas finales, ancho de línea). Nadie discute estilo en los PR; lo decide Prettier.
- **Husky + lint-staged**: corren ESLint y Prettier en pre-commit sobre los archivos tocados, para que no entre código sin formatear.
- **`tsc --noEmit`** en CI: el build falla si hay error de tipos.

> Estado real (2026-09-16): **las dos apps están en 0 errores.** `sitio-web` deja 31
> advertencias y `intranet` 9, casi todas `@next/next/no-img-element` sobre imágenes
> ráster estáticas, dejadas visibles a propósito hasta convertirlas a `next/image` con
> verificación visual. **Prettier y Husky + lint-staged todavía no están instalados** en
> ningún proyecto; el checklist de la sección 9 los da por hechos, pero hoy hay que
> verificarlos a mano.
>
> **Dos excepciones quedaron declaradas, y conviene saber por qué:**
>
> - **`react-hooks/set-state-in-effect`** está silenciada línea a línea —nunca a nivel de
>   regla— en los cinco efectos que arrancan una petición. La regla marca cualquier
>   `setState` alcanzable desde un efecto, incluido el que ocurre *después* del `await`, y
>   un dato que llega por red no puede estar en el estado inicial. Cada `eslint-disable`
>   lleva el motivo escrito al lado; uno sin motivo es un error de revisión.
>   El otro patrón que la disparaba —"vaciar el modal cuando se abre"— **sí se corrigió**:
>   el padre cambia la `key` en cada apertura y el modal se monta limpio, sin efecto y sin
>   el frame en que se veían los datos de la vez anterior.
> - **`@next/next/no-html-link-for-pages`** está apagada para `src/shared/lib/blocks/**`
>   en las dos configs. Los bloques Puck se pintan dentro del lienzo del editor, donde una
>   navegación client-side se llevaría el editor por delante con el borrador sin guardar;
>   la recarga del `<a href>` es ahí el fallo seguro.

---

## 9. Checklist rápido antes de un commit

- [ ] Archivos en `kebab-case`; identificadores según la tabla de la sección 1.
- [ ] Sin `any` implícito; tipos compartidos no duplicados.
- [ ] Comentarios explican *por qué*, no *qué*; sin `TODO` anónimos.
- [ ] `app/` sin lógica de negocio; `shared/` sin imports de `features/`.
- [ ] La feature usa `components/` y `services/` (no `ui/` ni `api/`).
- [ ] Nada se importa de una ruta interna de otra feature; solo de su `index.ts`.
- [ ] Ninguna función anónima y cacheable comparte servicio con una que exige sesión.
- [ ] Errores manejados y con mensaje en español sin filtrar internals.
- [ ] Librerías pesadas con carga diferida.
- [ ] Si tocaste `shared/ui`: contraste ≥4.5:1, operable con teclado, foco visible, `alt` en toda imagen. Checklist completo en `9-accesibilidad.md` §5.
- [ ] Si tocaste interfaz: cortes de la escala de Tailwind, alturas en `dvh`, sin anchos fijos que desborden, y mirado a 360, 768, 1024 y 1280 px sin scroll horizontal (§10).
- [ ] Pasa ESLint y `tsc --noEmit`.

> Nota de estado (2026-07-26): **Prettier y Husky + lint-staged aún no están instalados** en ningún proyecto, pese a lo que dice §8. Hasta que lo estén, las dos últimas casillas se verifican a mano corriendo `npx eslint .` y `npx tsc --noEmit` en el proyecto tocado.

---

## 10. Diseño responsive

Aplica a las tres superficies —el sitio público, el panel (`3000-sitio-web/src/app/admin/`)
y la intranet— y a los bloques de `packages/blocks-renderer/`. El objetivo es que cada
pantalla funcione de 320 px a un monitor ancho, con una experiencia pensada para cada
tamaño y no una versión de escritorio encogida. **Las reglas son las mismas para quien
escriba el código, sea una persona o un agente**, y el auditor (`/auditar`) las revisa con
los códigos `RESP-*`.

> **Por qué hay reglas y no solo buen criterio.** El 2026-09-26 se midió el proyecto a 360,
> 768 y 1280 px: 16 cortes distintos en los `@media`, un menú que se apilaba en vertical en
> tablet porque el CSS cambiaba en 720 px y el JSX en 1024, columnas de Roles cortadas en el
> móvil (no se podía editar un rol desde el teléfono) y modales con el botón de guardar fuera
> de la pantalla. Detalle en `6-auditoria.md`, sesión 26-09-2026.

### 10.1 Cortes: la escala de Tailwind y ninguna otra (`RESP-01`)

| Prefijo | Desde | Pensado para |
|---|---|---|
| (ninguno) | 0 | Móvil. Se diseña primero para aquí |
| `sm:` | 640 px (40rem) | Móvil grande, tablet vertical pequeña |
| `md:` | 768 px (48rem) | Tablet |
| `lg:` | 1024 px (64rem) | Portátil. Desde aquí aparece la barra lateral del panel |
| `xl:` | 1280 px (80rem) | Escritorio |
| `2xl:` | 1536 px (96rem) | Monitor ancho |

- **Móvil primero:** los estilos sin prefijo son los del móvil y se añade hacia arriba
  (`w-full md:w-1/2`). No al revés.
- **En CSS**, los mismos valores con sintaxis de rango, que es lo que genera Tailwind:
  `@media (width >= 48rem)` equivale a `md:` y `@media (width < 48rem)` a `max-md:`. Así
  una regla de `globals.css` y un prefijo del JSX cambian en el mismo píxel.
- **Prohibido** cualquier otro ancho: 480, 600, 720, 767, 850, 900, 1060, 1200… Si un
  diseño «necesita» 900 px, lo que necesita es medir su contenedor (§10.3).
- Sí valen las consultas que no son de ancho: `prefers-reduced-motion`,
  `prefers-color-scheme`, `orientation` y `height` (pantallas apaisadas bajas).
- Los `@media` antiguos se pasan a la escala **cuando se toca ese bloque**, no en una
  migración masiva a ciegas.

### 10.2 Medidas que se adaptan (`RESP-02`, `RESP-03`)

- **Alturas de pantalla con `dvh`**, nunca `vh` ni `h-screen`/`min-h-screen`. En el móvil,
  `100vh` incluye la barra del navegador y lo último de la pantalla queda tapado. Tailwind:
  `h-dvh`, `min-h-dvh`, `max-h-[80dvh]`.
- **Anchos fluidos:** `w-full` con `max-w-*`. Un ancho fijo en píxeles (`w-[440px]`,
  `min-w-[820px]`) solo con salida para pantallas estrechas (`max-w-full`, o fijo solo desde
  un corte: `md:w-[440px]`). La página **nunca** hace scroll horizontal a 320 px (criterio
  1.4.10 de WCAG, nivel AA; ver `9-accesibilidad.md`).
- **Títulos con `clamp()`** o con la escala de Tailwind por corte (`text-2xl md:text-3xl`),
  no con un tamaño grande fijo. El texto de lectura no baja de 14 px; las etiquetas de 11 px
  solo en píldoras y encabezados de tabla.
- **Flex que envuelve:** una fila con varios elementos lleva `flex-wrap` o pasa a columna en
  el móvil (`flex-col sm:flex-row`). Un hijo con texto largo lleva `min-w-0` para poder
  encogerse.
- **Imágenes y vídeos:** `max-w-full h-auto`, o `object-cover` dentro de una caja con
  `aspect-*`. Nunca un alto fijo que deforme.

### 10.3 Componentes que miden su contenedor (`RESP-04`)

Un componente que puede vivir en huecos de anchos distintos —una tarjeta, una columna de un
bloque de Puck, un modal— responde a **su contenedor** (`@container` y las variantes `@sm:`,
`@3xl:`…), no a la ventana. La ventana (`md:`, `lg:`) es para la maqueta de la página.

- **Tablas:** clase `olo-tabla-apilable` en la `<table>` y `data-etiqueta` en cada `<td>`.
  Cuando su contenedor mide menos de 48rem, cada fila pasa a tarjeta «ETIQUETA · valor». La
  celda sin `data-etiqueta` ocupa el ancho entero (el título de la fila o las acciones).
  **Dentro de esa tabla se usa `@3xl:`, no `md:`**: es el mismo corte medido sobre el mismo
  contenedor. Hoy existe en el sitio (`globals.css`, «RESPONSIVE: PIEZAS COMPARTIDAS»).
- Una tabla que de verdad necesita todas sus columnas a la vez (una hoja de datos) puede
  quedarse con scroll lateral **dentro de su caja**, nunca de la página, y con un comentario
  que diga por qué.
- El CSS sin `@layer` de `globals.css` le gana a cualquier utilidad de Tailwind. Lo que deba
  cambiar en modo tarjeta va en un elemento dentro de la celda, no en la celda.

### 10.4 Táctil (`RESP-05`)

- **Nada depende solo de `hover` o de `title`**: en una pantalla táctil no existen. Un menú
  desplegable se abre con clic o toque; una acción con solo icono lleva nombre accesible
  (`aria-label` o texto `sr-only`) y, en el móvil, texto visible si es una acción de fila.
- **Objetivos táctiles** de al menos 24 × 24 px (criterio 2.5.8, AA) y de 44 px de alto
  para las acciones principales en el móvil.
- Los modales en el móvil salen desde abajo o a pantalla completa, y **siempre caben**: caja
  con `max-h-[calc(100dvh-2rem)]` en columna y cuerpo `min-h-0 flex-1 overflow-y-auto`, o
  fondo con `overflow-y-auto` y `items-center-safe`/`items-end-safe`.

### 10.5 Piezas compartidas: se reutilizan, no se reescriben (`RESP-06`)

| Pieza | Dónde | Para |
|---|---|---|
| `olo-tabla-apilable` | `3000-sitio-web/src/style/globals.css` | Tablas que pasan a tarjetas (§10.3) |
| `BarraFiltros` + `CampoFiltro` | `3000-sitio-web/src/shared/ui/molecules/barra-filtros.tsx` | Filtros de una tabla: fila en escritorio, plegados tras «Filtros (n)» por debajo de `lg` |
| `EncabezadoPanel` | `3000-sitio-web/src/shared/ui/molecules/encabezado-panel.tsx` | Título, descripción y acciones de cada pantalla del panel |
| `MarcoDePasos` (sitio) y `MarcoAcceso` (intranet) | `3000-sitio-web/src/features/administracion/auth/components/marco-de-pasos.tsx` y `3001-intranet/src/features/login/components/marco-acceso.tsx` | Toda pantalla de acceso (login, primer ingreso, recuperación). Misma maqueta, anchos y huecos; el sitio en blanco con tarjeta, la intranet en azul sin tarjeta (`acceso-ui.ts`). Un cambio de medidas en uno se revisa en el otro |
| `Alert` | `3000-sitio-web/src/shared/ui/molecules/alert.tsx` | Diálogo corto: hoja inferior en el móvil, centrado desde `sm` |
| `olo-anim-dialogo`, `olo-anim-fondo` + `olo-anim-caja`, `useCierreAnimado` | `src/style/globals.css` y `src/shared/lib/use-cierre-animado.ts` de cada frontend | Entrada y salida de un modal con `@starting-style`: la primera clase en un `<dialog>` nativo; las otras dos (velo y cuadro) y el hook en uno que monta React. `Alert` ya las lleva |
| `Notification` | `3000-sitio-web/src/shared/ui/molecules/notification.tsx` | Aviso flotante de éxito, advertencia, error o información. Los tres primeros suenan, salvo que se silencien en Configuración (`9-accesibilidad` §3.4) |
| `NavegacionMobile` | `src/shared/lib/mobile/` de cada frontend | Por debajo de `lg`, las secciones en una barra abajo con el logo al centro y una hoja para lo que no cabe |

Antes de escribir una tabla, una banda de filtros o un encabezado, se usa la pieza. Si no
alcanza, se amplía la pieza; no se copia al lado. **Una pieza de interfaz no sube a
`packages/` aunque la usen las dos apps**: cada una lleva su identidad (`1-guia` §4.4), y
`packages/` es para reglas que las dos deciden igual.

**Lo que solo existe en el móvil va en la carpeta `mobile/` de cada frontend** (decisión
del usuario, 2026-09-27): el código en `src/shared/lib/mobile/`, los iconos en
`public/assets/svg/mobile/` y los estilos en el `globals.css` de esa app, con el nombre
«mobile» y no el de su posición («barra inferior»). Hoy es la navegación mobile:
`NavegacionMobilePanel` en el panel y `NavegacionMobileIntranet` en la intranet, cada una
sobre su propio `NavegacionMobile` y con clases `navegacion-mobile-*`. Las dos copias se
parecen a propósito: un arreglo en una se revisa en la otra.

### 10.6 Cómo se verifica antes de entregar

- Mirar la pantalla a **360, 768, 1024 y 1280 px**, en claro y en oscuro (DevTools → modo
  dispositivo). En el sitio público, también a 1920 px.
- Sin scroll horizontal de la página en ningún ancho. Probar con `document.documentElement.scrollWidth > innerWidth`
  en la consola.
- Si la pantalla tiene modales, abrir cada uno en el móvil y llegar a su último botón.
- En la entrada de `6-auditoria.md`, decir qué anchos se miraron y cuáles no.
