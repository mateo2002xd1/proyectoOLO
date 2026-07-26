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
> La migración de los archivos existentes está planificada en `8-ciclo-editorial.md` §5, fase 5, con la advertencia de que Git en Windows no detecta por defecto un renombre que solo cambia mayúsculas.

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

- **ESLint: una configuración por frontend.** La arquitectura tiene **dos aplicaciones Next.js independientes** — `sitio-web/` y `intranet/` — cada una con su propio `package.json`, su propio build y su propio despliegue. Por eso cada una lleva su **`eslint.config.mjs` en su raíz**, no una config compartida en la raíz del monorepo:
  - `sitio-web/eslint.config.mjs`
  - `intranet/eslint.config.mjs`

  Ambas extienden el mismo preset (`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`), así que las reglas son idénticas; lo que no se comparte es el archivo. Esto es lo que espera Next.js: el linter resuelve la config desde el directorio del proyecto, y una config en la raíz del monorepo no se aplicaría sin declarar workspaces de npm (hoy no existe un `package.json` raíz).

  **Al tocar las reglas hay que actualizar los dos archivos.** Si divergen, la app que se quede corta deja de vigilar sus propias convenciones — que fue exactamente lo que pasó cuando `sitio-web` se quedó sin config y acumuló 74 problemas sin que nadie se enterara.

  El paquete compartido `packages/blocks-renderer/` no es una app Next.js y hoy no se lintea por separado.

- **Prettier**: formato único (comillas, comas finales, ancho de línea). Nadie discute estilo en los PR; lo decide Prettier.
- **Husky + lint-staged**: corren ESLint y Prettier en pre-commit sobre los archivos tocados, para que no entre código sin formatear.
- **`tsc --noEmit`** en CI: el build falla si hay error de tipos.

> Estado real (2026-07-26): ESLint está configurado en las dos apps y **ambas pasan sin errores** — `sitio-web` limpio, `intranet` con 9 advertencias de `@next/next/no-img-element` sobre imágenes ráster estáticas, dejadas visibles a propósito hasta convertirlas a `next/image` con verificación visual. **Prettier y Husky + lint-staged todavía no están instalados** en ningún proyecto; el checklist de la sección 9 los da por hechos, pero hoy hay que verificarlos a mano.

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
- [ ] Pasa ESLint y `tsc --noEmit`.

> Nota de estado (2026-07-26): **Prettier y Husky + lint-staged aún no están instalados** en ningún proyecto, pese a lo que dice §8. Hasta que lo estén, las dos últimas casillas se verifican a mano corriendo `npx eslint .` y `npx tsc --noEmit` en el proyecto tocado.
