## Contexto
Estás trabajando en el proyecto OLO (Observatorio Laboral y Ocupacional) para SENA.
Es una migración/refactor de un codebase parcialmente implementado — NO es un
proyecto desde cero. Antes de mover o crear nada, debes auditar lo que ya existe.

## Reglas antes de tocar carpetas

1. **No borres código funcional sin antes confirmar que su reemplazo funciona.**
   Mueve/copia primero, verifica que compila y corre, y solo después elimina el
   archivo/carpeta original.
2. **Haz el reordenamiento en pasos pequeños y verificables**, no en un solo commit
   masivo. Cada paso debe dejar el proyecto en estado compilable.
3. **Antes de mover un archivo, busca todas sus referencias** (imports, rutas
   dinámicas de Next, alias de tsconfig) y actualízalas en el mismo paso.
4. **Respeta la separación de responsabilidades**:
   - `app/` → SOLO enrutamiento y composición. Si encuentras lógica de negocio,
     fetch directo, o componentes grandes ahí, muévelos a `features/` o `lib/`.
   - `features/<dominio>/` → todo lo que pertenece a un dominio de negocio vive
     junto, con la anatomía fija de `1-guia-del-proyecto.md` §4.0:
     `components/`, `hooks/`, `services/`, `types.ts`, `index.ts`.
     **Nunca `ui/`** (ese nombre es del sistema de diseño) ni **`api/`** (ese es
     de los route handlers de Next). No dupliques lógica de un dominio en dos
     features distintas.
   - `shared/ui/` → SOLO componentes genéricos sin conocimiento de negocio
     (si un componente importa algo de `features/`, no pertenece aquí).
   - `shared/lib/` → utilidades transversales reales (cliente HTTP, validaciones
     compartidas). Si algo solo lo usa un feature, no va aquí.
5. **Un dominio con ciclo de vida se organiza por etapas, no por tipo técnico.**
   Si el dominio tiene estados con actores, permisos o políticas de caché
   distintos, cada etapa es su propia carpeta. Caso de referencia: `paginas/`
   (`model/`, `publicacion/`, `edicion/`, `revision/`). Ver `8-ciclo-editorial.md` §3.2.
   Esto no es estético: impide cachear por accidente una respuesta autenticada.
6. **Nada cruza la frontera de un módulo salvo por su `index.ts`.**
   Si necesitas algo de otra feature y no está exportado ahí, expórtalo — no
   importes su ruta interna.
7. **Todo archivo nuevo se nombra en `kebab-case`**, incluidos los componentes
   (`tabla-usuarios.tsx`, no `TablaUsuarios.tsx`). El identificador exportado
   sigue siendo `PascalCase`. Evita el bug que solo aparece al desplegar en
   Linux, donde el sistema de archivos sí distingue mayúsculas.
8. **No mezcles zonas de acceso.** `sitio-web` tiene dos route groups:
   `(public)` — abierto, ISR, sin credenciales — y `(admin)` — protegido por
   `middleware.ts` —, con `(admin)/(shell)/` agrupando las pantallas que
   comparten el chrome del panel (`dashboard`, `revision`, `users`). Código de
   `(admin)` no se importa desde `(public)` ni al revés; lo que ambos necesiten
   sube a `features/` o `shared/`. La intranet no usa route groups: es 100%
   protegida, así que no hay dos zonas que separar.
9. **Verifica el nombre y la ubicación de los archivos especiales de Next.js.**
   Un nombre mal escrito hace que Next ignore el archivo silenciosamente, sin
   error visible — y estar en la carpeta equivocada tiene el mismo efecto.
   `layout.tsx`, `page.tsx` y `route.ts` van dentro de `app/`; **`middleware.ts`
   va en `src/`, nunca en `src/app/`** (así está hoy en las dos apps).
10. **No cambies el contrato de datos sin migración**: cualquier cambio a los
   campos `layout` o `contenido` (JSONB) de la tabla `contenido` debe ir con
   su migración Sequelize correspondiente, nunca editando el modelo en caliente.
11. **JWT**: recuerda que en los frontends (`jose`) solo se decodifica el token,
   nunca se valida su firma ahí. No implementes lógica de autorización basada
   solo en el decode del cliente — la validación real siempre pasa por el API.
12. **Después de cada movimiento de carpetas**, corre: build, typecheck, y si
    existen, los tests. Reporta cualquier import roto antes de continuar.

> **Sobre Tailwind v4 y los route groups:** una versión anterior de este archivo
> exigía declarar un `@source` explícito en `globals.css` por cada carpeta con
> paréntesis. **Es falso y se eliminó.** Ninguno de los dos `globals.css` tiene
> un solo `@source` y las clases se generan igual: `flex-grow` se usa una única
> vez en todo `sitio-web/src`, dentro de `app/(public)/layout.tsx`, y aparece en
> el CSS compilado. Tailwind 4.3.2 detecta las fuentes por sí solo. No añadas
> esas directivas.

## Al terminar cada fase
Entrega un resumen y guardalo en `6-auditoria.md` con su fecha de sesion:
- Qué se movió/creó/eliminó
- Qué imports se actualizaron
- Qué quedó pendiente o con TODO
- Resultado de build/typecheck