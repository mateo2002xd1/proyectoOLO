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
     junto (components, hooks, api.ts, types.ts). No dupliques lógica de un
     dominio en dos features distintas.
   - `components/ui/` → SOLO componentes genéricos sin conocimiento de negocio
     (si un componente importa algo de `features/`, no pertenece aquí).
   - `lib/` → utilidades transversales reales (cliente HTTP, validaciones
     compartidas). Si algo solo lo usa un feature, no va en `lib/`.
5. **No mezcles zonas de acceso**: código de `(admin)` no debe importarse desde
   `(publico)`, y viceversa. `(editor)` puede compartir `features/editorial/`
   con `(admin)/revision`, pero no al revés.
6. **Verifica el nombre exacto de archivos especiales de Next.js** (`middleware.ts`,
   `layout.tsx`, `page.tsx`, `route.ts`) — un nombre mal escrito hace que Next
   ignore el archivo silenciosamente, sin error visible.
7. **Tailwind v4 + route groups**: cualquier carpeta nueva con paréntesis
   `(nombre)` requiere su directiva `@source` explícita en `globals.css`
   (sintaxis escapada `[(]nombre[)]`) o sus clases no se generarán.
8. **No cambies el contrato de datos sin migración**: cualquier cambio a los
   campos `layout` o `contenido` (JSONB) de la tabla `contenido` debe ir con
   su migración Sequelize correspondiente, nunca editando el modelo en caliente.
9. **JWT**: recuerda que en los frontends (`jose`) solo se decodifica el token,
   nunca se valida su firma ahí. No implementes lógica de autorización basada
   solo en el decode del cliente — la validación real siempre pasa por el API.
10. **Después de cada movimiento de carpetas**, corre: build, typecheck, y si
    existen, los tests. Reporta cualquier import roto antes de continuar.

## Al terminar cada fase
Entrega un resumen de:
- Qué se movió/creó/eliminó
- Qué imports se actualizaron
- Qué quedó pendiente o con TODO
- Resultado de build/typecheck