# Programa + Sobresalientes — Plan de implementación

> Documento de trabajo, no forma parte de la documentación numerada (`1-guia-del-proyecto.md` … `11-base-de-datos.md`) del proyecto. Registra el análisis y las decisiones tomadas en sesión de planeación, para retomar el trabajo desde cualquier máquina sin repetir el análisis.
>
> Última decisión registrada: 2026-09-15. Nada de este documento está implementado todavía — es el plan, no el estado del código. Antes de actuar sobre algo aquí, verificar contra el código real (puede haber avanzado desde que se escribió esto).

---

## 0. Qué es esto

"Programa + Sobresalientes" es una sección del sitio público del OLO: un mapa de Colombia por departamento con indicadores de formación SENA (certificados, vinculados, tasa de vinculación, salario promedio), filtrable por Formación académica, Género y Programa.

**Ya existe en frontend** (`sitio-web/src/features/sitio-web/programas-sobresalientes/`), pero corre 100% sobre un fixture estático (`lib/programas-sobresalientes-temporal.ts`) — sin base de datos ni backend detrás.

**Objetivo:** un administrador carga el Excel real de SENA desde el panel de administración, eso actualiza Postgres, y el mapa público consulta esos datos reales.

---

## 1. Estado real verificado (no asumido)

Todo lo de esta sección se comprobó leyendo el código o corriendo SQL contra Neon — no se adivinó nada, precisamente porque este proyecto ya se quemó antes adivinando esquemas (`11-base-de-datos.md` §8.4).

### 1.1 Frontend ya existente

- `sitio-web/src/app/(public)/programas-sobresalientes/page.tsx` — ruta pública.
- `sitio-web/src/features/sitio-web/programas-sobresalientes/`:
  - `components/programas-sobresalientes-view.tsx` — orquesta mapa + filtros + resultados.
  - `components/mapa-departamentos.tsx` — SVG de Colombia, cada `<path>` es un departamento seleccionable.
  - `components/filtros-programas-sobresalientes.tsx` — hoy tiene **4** filtros: Centro, Formación académica, Género, Programa.
  - `hooks/use-programas-sobresalientes.ts` — todo el estado en memoria, filtra el fixture con `useMemo`.
  - `lib/programas-sobresalientes-temporal.ts` — fixture estático, simula el esquema estrella.
  - `lib/departamentos-colombia.ts` — paths SVG + `codigoDane` por departamento (es la llave que conecta el mapa con los datos).
  - `types.ts` — declara `NivelFormacion = 'Técnico' | 'Tecnólogo' | 'Especialización' | 'Operario' | 'Auxiliar'` — **esto está mal**, ver §1.5.

### 1.2 Lo que NO existe (contradice supuestos iniciales del pedido)

- **No hay flujo de carga de Excel en el admin.** `handsontable` está instalado (`sitio-web/package.json:33`, `^18.0.0`) pero **cero archivos en `sitio-web/src` lo importan** — dependencia muerta. No hay `xlsx` ni `exceljs` en ningún `package.json` de las tres apps.
- **`/admin/dashboard/soporte` (sidebar "Soporte") es un enlace muerto.** Definido en `sitio-web/src/features/administracion/auth/components/panel-general.tsx:464-467`, pero no existe `page.tsx` en esa ruta — lo confirma el propio código en `sitio-web/src/features/administracion/buscador/lib/indice-panel.ts:9-11`. No se pierde nada real al repurposarlo.
- **`backlog.csv` ya no existe en el repo** (confirmado 2026-09-15 — no está en la raíz ni en ningún otro path). El trabajo de este módulo no está anclado a él.
- **Las 4 tablas de catálogo SÍ existen en Neon**, pero **no fueron creadas por el runner de migraciones de este proyecto** — no aparecen en ninguna de las 24 migraciones (`api-backend/src/infrastructure/db/migrations/001` … `024`) ni en `11-base-de-datos.md` (que documenta 20 tablas, sin estas). Se crearon a mano en Neon, fuera del control del proyecto — exactamente el patrón que el proyecto abandonó a propósito (`server.ts` se niega a arrancar con migraciones pendientes).
- **SVG sigue excluido de las subidas** (`packages/upload-policy/src/index.ts:31-33`) — es XML, admite `<script>`/`on*`, ejecuta JS inline. Decisión de sesión: este módulo no lo necesita, se mantiene la exclusión.

### 1.3 Esquema real en Neon (verificado por SQL)

Columnas (vía `information_schema.columns`):

| Tabla | Columnas |
|---|---|
| `departamentos` | `id uuid PK` · `nombre varchar NOT NULL` · `codigo_dane varchar NULLABLE` (❗sin `UNIQUE`) · `created_at` · `updated_at` |
| `centros_formacion` | `id uuid PK` · `departamento_id uuid NOT NULL` (FK → `departamentos`) · `nombre varchar NOT NULL` · `created_at` · `updated_at` |
| `niveles_formacion` | `id uuid PK` · `nombre varchar NOT NULL` · `created_at` · `updated_at` |
| `programas_formacion` | `id uuid PK` · `nivel_formacion_id uuid NOT NULL` (FK → `niveles_formacion`) · `nombre varchar NOT NULL` · `created_at` · `updated_at` |

Todas las PK son `UUID` con `gen_random_uuid()` — coincide con la convención D3 del proyecto (*"UUID en toda clave primaria, sin excepciones"*, `11-base-de-datos.md`).

**Tabla de hechos: no existe.** Ni `formacion_sobresalientes` ni `programa_sobresalientes` aparecieron en la consulta — hay que crearla desde cero (certificados, vinculados, tasa de vinculación, salario promedio, sexo + FKs a las 4 dimensiones).

### 1.4 Dos defectos de diseño detectados (bloquean la carga real)

| Restricción | Qué implica | Por qué es un problema |
|---|---|---|
| `centros_formacion.departamento_id` es `UNIQUE` | Máximo **un** centro de formación por departamento en todo el país | El Excel real (hoja "Superan el margen") trae varios centros por regional — la carga fallaría en la segunda fila de cada departamento |
| `programas_formacion.nivel_formacion_id` es `UNIQUE` | Máximo **un** programa por nivel de formación en todo el país | Mismo problema: hay varios programas Técnicos, varios Tecnólogos, etc. |

Ambas parecen puestas por error (se quiso decir "FK", no "FK + UNIQUE"). Hay que corregirlas con una migración antes de cargar datos reales. Las tablas están vacías/sin uso real hoy, así que el `ALTER TABLE` no tiene riesgo de datos.

**Detalle menor:** `departamentos.codigo_dane` es `NULLABLE` y sin `UNIQUE`. Es la llave que conecta el mapa SVG (`departamentos-colombia.ts`) con la fila real — debería ser `NOT NULL UNIQUE`.

### 1.5 Estructura real del Excel de origen

Archivo: `Programas_sobresalientes_por_sexo_y_por_regiones.xlsx`. 31 hojas:

- **"Mujer" y "Hombre"** — dataset crudo con columnas de cálculo de margen. **No se cargan.**
- **"Superan el margen"** — **la única hoja que se carga.** 672 filas, ya filtradas, columnas: `Cod. Regional`, `Regional`, `Cod. Centro`, `Centro`, `Cod. Nivel de formación`, `Nivel de Formación`, `Cod. Programa`, `Programa`, `Sexo`, `Certificados`, `Vinculados`, `Tasa de vinculación`, `Salario promedio`.
- **28 hojas por departamento** — la misma información de "Superan el margen" partida por regional, verificado fila por fila sin datos adicionales. **No se cargan** (redundantes).

Los códigos (`Cod. Regional`, `Cod. Centro`, `Cod. Nivel de formación`, `Cod. Programa`) son consistentes — cada código mapea siempre al mismo nombre. Sirven como llave natural para el upsert por código (no por nombre, que puede cambiar).

**5 niveles de formación reales:** Auxiliar, Operario, Técnico, Tecnólogo, **Profundización Técnica**. El `types.ts` actual del frontend dice "Especialización" en vez de "Profundización Técnica" — hay que corregirlo.

Sexo: solo `M`/`F`.

---

## 2. Decisiones tomadas en sesión

| # | Decisión | Alternativa descartada | Por qué |
|---|---|---|---|
| D1 | El Excel se sube desde una sección de admin propia ("Actualizaciones"), **no** como campo de un bloque Puck | Campo de archivo dentro del bloque, aprobado vía `/revision` (ciclo editorial de páginas) | El propio diseño de "última carga completada" no encaja con versionar páginas — no tiene sentido que revertir una versión de página revierta (o no) datos de un Excel |
| D2 | El bloque Puck de "Programa + Sobresalientes" queda **de solo lectura** | Bloque con campo de archivo | Consecuencia directa de D1 |
| D3 | Se repurpone el link muerto "Soporte" → "Actualizaciones" (`/admin/actualizaciones`, ícono `ArrowUpTrayIcon`) | Crear una ruta nueva desde cero | No se pierde nada real; alinea la URL con el patrón de las rutas que sí funcionan (`/admin/respaldos`, no `/admin/dashboard/respaldos`) |
| D4 | "Actualizaciones" tiene 4 tarjetas: Programa + Sobresalientes, Alertas de inversión, Fuentes futuras de empleo, Criterios de clasificación de resultados. **Solo la primera queda funcional** | Construir las 4 completas ahora | Las otras 3 no tienen Excel ni esquema de datos especificado todavía — quedan como "Próximamente" |
| D5 | **Sin editor en este flujo.** Solo el Administrador sube el Excel, y se procesa **de inmediato**, sin paso de aprobación | Editor sube → Administrador aprueba/rechaza con motivo (como el ciclo de páginas) | Simplificación pedida explícitamente en sesión — se cae toda la lógica de estados `pendiente_aprobacion`/`rechazado` y el campo `motivo_rechazo` |
| D6 | SVG sigue excluido de subidas | Habilitar SVG en `@olo/upload-policy` | Este módulo solo necesita `.xlsx`; abrir SVG es una decisión de seguridad que toca el paquete compartido de las tres apps, no algo para decidir de paso |
| D7 | Parseo del Excel con **`exceljs`** | `xlsx` / SheetJS clásico | CVEs conocidos de prototype pollution en SheetJS |
| D8 | Procesamiento async en la cola `heavy-jobs` (BullMQ) ya existente | Procesar síncrono en el request | 672 filas + validación + upsert transaccional no debe bloquear la respuesta HTTP; la cola ya está armada para esto (`api-backend/src/infrastructure/redis/queue.ts`) |
| D9 | Filtro de **Centro se quita** de la pantalla pública | Mantener los 4 filtros actuales | Pedido explícito: solo Departamento (mapa, eje principal) + Formación académica + Género + Programa. `centros_formacion` sigue mostrándose en la tabla de resultados, solo deja de ser selector |
| D10 | Catálogos ganan columna `codigo VARCHAR UNIQUE` (junto al `UUID` que sigue siendo PK) | Cambiar la PK a código natural | Preserva la convención D3 del proyecto ("UUID en toda clave primaria") y las FKs existentes; el código sirve para upsert idempotente por fila del Excel |
| D11 | Tabla de hechos **append-only** por `carga_id`; una vista `v_formacion_actual` filtra por la última carga `completado` | Staging schema separado + swap físico | Más simple: una carga mala nunca se "revierte", simplemente no llega a `completado` y la vista sigue mostrando la anterior |

---

## 3. Arquitectura objetivo

### 3.1 Base de datos (migraciones nuevas bajo `api-backend/src/infrastructure/db/migrations/`, siguiendo el runner — nunca a mano en Neon)

1. **`025-corregir-catalogos-formacion.ts`** — `DROP` de las dos `UNIQUE` rotas (§1.4); añade `codigo VARCHAR UNIQUE` a `departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`; promueve `departamentos.codigo_dane` a `NOT NULL UNIQUE`.
2. **`026-formacion-sobresalientes.ts`** — tabla de hechos: FKs `UUID` a las 4 dimensiones + `sexo CHECK IN ('M','F')` + `certificados`/`vinculados`/`tasa_vinculacion`/`salario_promedio` + `carga_id`.
3. **`027-cargas-datos.ts`** — `archivo_id` (FK a `archivos`, no duplicar metadatos de archivo), `estado CHECK IN ('procesando','completado','error')` (sin estado de aprobación — D5), `subido_por` (FK `usuarios`), `filas_procesadas`, `filas_error`, `mensaje`, `creado_en`, `completado_en`.
4. Vista `v_formacion_actual` — hechos de la carga `completado` más reciente.

### 3.2 Backend (`api-backend/`, patrón controllers → use-cases → repositories, igual que `paginas/` y `trabajos.controller.ts`)

- `repositories/formacion-sobresalientes.repository.ts` — única capa que toca los modelos Sequelize nuevos.
- `use-cases/formacion-sobresalientes/`: `cargarExcel` (parsea con `exceljs`, valida, upsert transaccional), `obtenerActual` (lee la vista).
- Worker: extiende (o usa) `heavy-jobs` — lee **solo** la hoja "Superan el margen", hace upsert de catálogos por `codigo` + insert masivo de hechos con el nuevo `carga_id`, todo en una transacción. Si falla cualquier fila: rollback completo, `estado='error'`, mensaje con la fila/columna exacta.
- Rutas: `POST /api/formacion-sobresalientes/cargas` (solo Administrador, sube y dispara el proceso de inmediato), `GET /api/formacion-sobresalientes/cargas` (historial), `GET /api/formacion-sobresalientes` (**pública**, sin auth, cacheable Redis — la que reemplaza el fixture).

### 3.3 Admin (frontend, `sitio-web`)

- `panel-general.tsx`: renombrar sidebar "Soporte" → "Actualizaciones", ícono `ArrowUpTrayIcon`, ruta `/admin/actualizaciones`.
- `app/admin/(shell)/actualizaciones/page.tsx` → `<ActualizacionesView />` en `features/administracion/actualizaciones/` (mismo patrón que `respaldos/page.tsx`).
- 4 tarjetas; solo "Programa + Sobresalientes" funcional (botón de carga, visible solo para rol Administrador, usa Handsontable para previsualizar las filas, muestra resultado y un historial de cargas). Las otras 3: "Próximamente".

### 3.4 Público (frontend, `sitio-web`)

- `use-programas-sobresalientes.ts` deja de leer el fixture, llama `GET /api/formacion-sobresalientes`.
- Se quita el filtro de Centro (D9); se corrigen los 5 niveles reales (§1.5); el bloque Puck queda de solo lectura (D2).

---

## 4. Historia → Criterios → Tareas (versión final acordada)

**Historia 1 — Carga y publicación de datos de Programas + Sobresalientes**

**Criterio 1.** Las tablas de catálogo aceptan los datos reales del Excel sin que la carga falle.
- 1.1 DB — Quitar la restricción que hoy solo permite un centro de formación por departamento.
- 1.2 DB — Quitar la restricción que hoy solo permite un programa por nivel de formación.
- 1.3 DB — Agregar un código único a cada catálogo (departamento, centro, nivel, programa) para identificar cada fila del Excel sin ambigüedad, aunque cambie el nombre.
- 1.4 DB — Crear la tabla de resultados de "Superan el margen" (certificados, vinculados, tasa de vinculación, salario promedio, sexo), enlazada a los 4 catálogos.
- 1.5 DB — Crear la tabla que registra cada carga de Excel: quién la subió, en qué estado está (procesando / completado / error), cuántas filas se procesaron, mensaje de resultado.
- 1.6 DB — Crear la consulta que siempre muestra los datos de la última carga completada, para que el sitio público nunca muestre una carga a medio procesar o fallida.

**Criterio 2.** El administrador sube el Excel y la base de datos se actualiza de inmediato, sin paso de aprobación.
- 2.1 FE — Renombrar la sección "Soporte" del panel (hoy sin uso real) a "Actualizaciones", con ícono nuevo.
- 2.2 FE — Dentro de "Actualizaciones", tarjeta "Programa + Sobresalientes" con el botón para subir el archivo, visible solo para el rol Administrador; las otras 3 tarjetas quedan como "Próximamente".
- 2.3 BE — Validar que el archivo sea un Excel real (no solo por su nombre) y no supere el tamaño permitido, reutilizando la regla de subida que ya comparten las tres apps.
- 2.4 BE — Al subir el archivo, guardarlo y poner en marcha de inmediato el proceso que actualiza la base de datos — sin estado de espera ni un segundo clic para confirmar.
- 2.5 FE — Mostrar en pantalla el resultado en cuanto termine: cuántas filas se cargaron bien, o el motivo si falló.
- 2.6 FE — Mostrar un historial de las cargas hechas (fecha, quién la subió, resultado).

**Criterio 3.** El proceso solo toma los datos correctos y no bloquea el sitio.
- 3.1 BE — Leer únicamente la hoja "Superan el margen" (ignorar las 28 hojas por departamento, que repiten la misma información).
- 3.2 BE — Procesar el Excel en la cola de tareas pesadas que ya existe en el proyecto, para que subir el archivo no deje esperando al administrador con la pantalla congelada.
- 3.3 BE — Actualizar catálogos + insertar las 672 filas en un solo bloque todo-o-nada: si algo falla a mitad de camino, la base de datos no queda a medias y sigue mostrando la última carga buena.

**Criterio 4.** El público consulta el mapa por departamento y filtra resultados reales.
- 4.1 BE — Publicar "la carga vigente" en una consulta pública, sin necesidad de sesión.
- 4.2 FE — Conectar el mapa y los filtros (Formación académica, Género, Programa) a esa consulta real, reemplazando los datos de prueba actuales.
- 4.3 FE — Quitar el filtro de "Centro" de la pantalla pública (se sigue mostrando en la tabla de resultados, pero no como selector).
- 4.4 FE — Corregir los niveles de formación a los 5 reales (Auxiliar, Operario, Técnico, Tecnólogo, Profundización Técnica).
- 4.5 FE — El bloque del editor de páginas deja de pedir un archivo — solo muestra el mapa con los datos ya publicados.

**Criterio 5.** Nada se rompe si el Excel trae una fila mala.
- 5.1 QA — Probar con un Excel al que le falte una columna y confirmar que la carga falla con un mensaje claro, sin tocar los datos publicados.
- 5.2 QA — Probar con dos centros en el mismo departamento y dos programas en el mismo nivel (el caso real de "Superan el margen") y confirmar que se guardan ambos sin error.
- 5.3 QA — Probar que mientras una carga se está procesando, el sitio público sigue mostrando la última carga completada.
- 5.4 QA — Confirmar que un usuario con rol Editor no ve el botón de carga en "Actualizaciones".

---

## 5. Próximo paso

Empezar por el **Criterio 1** (migraciones 025-027 + vista), porque todo lo demás depende de que el esquema de base de datos esté correcto.

Pendiente fuera de esta historia: especificar el Excel/esquema de los otros 3 módulos de "Actualizaciones" (Alertas de inversión, Fuentes futuras de empleo, Criterios de clasificación de resultados) antes de construirlos.
