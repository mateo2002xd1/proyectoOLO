# Accesibilidad — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md` (arquitectura) y `3-seguridad-del-proyecto.md` (controles).
> Define el nivel de accesibilidad exigido por ley, el estado real hoy, y cómo se llega al cumplimiento **por construcción** en vez de por revisión manual.
> Cubre **RF-14** (accesibilidad para discapacidad visual: lectores de pantalla y alto contraste).

---

## 0. Qué obliga y a qué nivel

| Norma | Qué exige |
|---|---|
| **Resolución 1519 de 2020** (MinTIC), Anexo 1 | Directrices de accesibilidad para los sitios web de sujetos obligados. Es la norma que cita RF-14. |
| **NTC 5854** | Norma Técnica Colombiana de accesibilidad web, adopción de las pautas WCAG. Es la referencia técnica que la Resolución invoca. |
| **Ley 1618 de 2013** | Derechos de las personas con discapacidad; da el marco de derechos al que la Resolución da forma técnica. |
| **Ley 1712 de 2014** | Transparencia y acceso a la información pública; es el marco general de la Resolución 1519. |

**Nivel exigido: AA.** No A, no AAA. Todo este documento se escribe contra ese umbral.

### Alcance: `sitio-web`, no la intranet

Este documento aplica **solo al sitio público** (`3000-sitio-web/`). Es decisión deliberada de alcance, no un olvido.

El motivo: la Resolución 1519 cuelga de la Ley 1712 de transparencia, que rige la **información pública**. La intranet es una herramienta interna de directores y subdirectores, no un canal de información al ciudadano, así que no es donde está la exposición normativa.

Queda dicho el matiz para que nadie lo descubra tarde: si un director o subdirector tiene discapacidad visual, la intranet pasa a ser un asunto de accesibilidad **laboral** bajo la Ley 1618 de 2013. Ese caso no está cubierto aquí y habría que abrirlo como trabajo aparte.

**Excepción, desde 2026-08-18:** los campos obligatorios de la Fase 5 (alt de imagen, título de iframe) sí se exigen en las dos aplicaciones — ver esa fase más abajo. El resto de este documento (contraste, teclado, alto contraste) sigue auditando solo sitio-web; ampliar esas otras fases a intranet sigue siendo trabajo aparte, no decidido todavía.

> **Sobre las citas normativas:** los nombres y el nivel AA son firmes. Antes de una certificación formal, los artículos y numerales concretos deben verificarse contra el texto oficial publicado por MinTIC — este documento es la guía de ingeniería, no el dictamen jurídico.

### Por qué importa más aquí que en un sitio cualquiera

Este es un portal gubernamental cuyo contenido lo escriben **editores no técnicos** a través de un editor visual. Si la accesibilidad depende de que el editor "se acuerde" de poner un texto alternativo o de no usar un contraste bajo, se pierde el primer día. La única estrategia sostenible es que **el sistema no permita producir contenido inaccesible**.

---

## 1. La palanca que ya tiene este proyecto

`1-guia-del-proyecto.md` §4.2 establece el punto crítico de la arquitectura:

> `shared/ui/{atoms,molecules,organisms}` tiene doble rol. Es el sistema de diseño del código **Y** el catálogo de piezas que el editor registra en Puck.

Eso significa que **el editor solo puede componer con piezas que nosotros escribimos**. No puede escribir HTML crudo ni elegir colores arbitrarios. Si los átomos son accesibles, todo lo que el editor produzca hereda esa accesibilidad.

Es una ventaja arquitectónica enorme y hay que decir con claridad lo que implica:

> **La conformidad se logra en `shared/ui`, no en las páginas.**
> Arreglar un átomo arregla todas las páginas que lo usan, incluidas las que un editor cree mañana.

### El matiz incómodo

`README.md` y `1-guia` §2 ya afirman que la identidad y la accesibilidad se cumplen *"por construcción"*. **Hoy esa afirmación es prematura.** La arquitectura hace posible el cumplimiento; no lo garantiza todavía, porque los átomos mismos no cumplen. La sección 2 lo demuestra con números.

---

## 2. Estado real, auditado

### 2.1 Contraste — el hallazgo bloqueante

WCAG AA exige **4.5:1** para texto normal, **3:1** para texto grande (≥24 px, o ≥18.7 px en negrita) y **3:1** para componentes de interfaz y estados de foco (SC 1.4.3 y 1.4.11).

Ratios calculados sobre los tokens de marca de `3000-sitio-web/src/style/globals.css` (el
archivo salió de `app/` a `style/` en algún momento posterior a la auditoría original;
si un enlace de este documento no abre, esa es la razón):

| Token | Hex | vs. blanco | vs. negro | Veredicto |
|---|---|---|---|---|
| `--color-brand` | `#7DB728` | **2.42:1** | 8.68:1 | solo con texto oscuro |
| `--color-brand-hover` | `#6DA020` | **3.13:1** | 6.70:1 | solo con texto oscuro |
| `--color-brand-focus` | `#39A900` | **3.07:1** | 6.85:1 | solo con texto oscuro |
| `--color-brand-blue` | `#1FACE3` | **2.60:1** | 8.07:1 | solo con texto oscuro |
| `danger` | `#dc2626` | 4.83:1 | — | cumple con texto blanco |
| texto base | `#344054` | 10.46:1 | — | cumple holgado |
| borde de input | `#d0d5dd` | **1.47:1** | — | falla SC 1.4.11 |

**El ratio de contraste es simétrico.** No depende de cuál color sea texto y cuál fondo: un par sirve o no sirve. Por eso "verde de marca + texto blanco" falla exactamente igual que "texto verde sobre blanco".

**Consecuencia concreta**, tal como estaba en `button.tsx`:

```tsx
primary: "bg-brand text-white ..."
success: "bg-brand text-white ..."
```

El **botón principal de todo el sitio** estaba a 2.42:1 contra un mínimo de 4.5:1 — poco más de la mitad del umbral legal. El anillo de foco usaba `ring-brand-focus/40`: un color que ya fallaba a opacidad plena (3.07:1), reducido además al 40 %, contra el 3:1 que exige SC 1.4.11.

El barrido destapó cuatro focos más del mismo defecto:

| Dónde | Par | Ratio |
|---|---|---|
| `notification.tsx` variante `warning` | blanco sobre `#fdcf33` | **1.48:1** |
| `notification.tsx` variante `info` | blanco sobre `#1face3` | 2.60:1 |
| `notification.tsx` variante `success` | blanco sobre `#7db728` | 2.42:1 |
| `globals.css` `.admin-btn-primary` | blanco sobre `var(--brand-blue)` | 2.60:1 |

El amarillo de `warning` con texto blanco, a 1.48:1, era el peor contraste del sistema de diseño.

> **Estado: corregido en la fase 1** (ver §4). Los números de esta sección se conservan porque son la evidencia de por qué la paleta se partió por rol, no un pendiente.

### 2.2 Lo que sí está bien

| Control | Estado |
|---|---|
| `<html lang="es">` | correcto en [layout.tsx:44](../3000-sitio-web/src/app/layout.tsx#L44) |
| Landmarks `<main>`, `<nav>` | presentes en los layouts públicos y en el shell del panel |
| Color de texto base | 10.46:1, muy por encima del mínimo |
| Botón `danger` | 4.83:1, cumple |
| Botón `navy` (acceso al panel) | 18.22:1 con texto blanco |
| `eslint-plugin-jsx-a11y` | disponible (viene con `eslint-config-next`), pero **sin el set recomendado activado** — ver fase 2 |

> **La intranet declara `lang="en"`** en [layout.tsx:30](../3001-intranet/src/app/layout.tsx#L30)
> y todo su contenido está en español. Es SC 3.1.1, nivel **A**, y hace que un lector de
> pantalla pronuncie el español con fonética inglesa — el texto se vuelve casi
> ininteligible. Está fuera del alcance declarado en §0, así que no bloquea nada aquí,
> pero es una línea y se arregla sola: queda en §7 con los demás pendientes de la
> intranet.

### 2.3 Lo que falta

| Hueco | Criterio WCAG | Nota |
|---|---|---|
| No hay **enlace de salto al contenido** | SC 2.4.1 | Ninguna coincidencia de `skip`/`saltar` en `app/` ni `shared/` |
| Reglas a11y **no declaradas** en las configs | — | `core-web-vitals` activa un subconjunto pequeño; el set recomendado no está |
| Indicador de foco **por debajo de 3:1** | SC 1.4.11 | Ver §2.1 |
| Borde de input a 1.47:1 | SC 1.4.11 | Solo importa donde el borde es el único indicador del campo |
| Sin **modo de alto contraste** | RF-14 lo pide explícitamente | No existe hoy |
| ~~Bloques Puck sin **campo de texto alternativo obligatorio**~~ | SC 1.1.1 | **Resuelto 2026-08-18** — ver Fase 5 |

Las cinco filas que siguen abiertas se re-verificaron contra el código el **2026-08-21**
y ninguna se ha cerrado. La del indicador de foco, que la fase 1 había resuelto, volvió
a abrirse: ver el aviso de regresión en esa fase.

---

## 3. Decisiones

### 3.1 La paleta: la tensión entre identidad y ley

Los verdes institucionales **no admiten texto blanco a nivel AA**. Esto choca de frente con RF-03 (respetar el manual de identidad SENA) y hay que resolverlo explícitamente, no dejarlo pasar.

Tres caminos, con su costo real:

| Opción | Qué implica | Costo |
|---|---|---|
| **A. Verde más oscuro para superficies interactivas** | `#2A7D00` da 5.21:1 con texto blanco. Se lee como la misma familia de marca. | Desvía del hex exacto del manual |
| **B. Texto oscuro sobre el verde actual** | `#7DB728` con texto casi negro da 8.68:1. Conserva el hex exacto. | Cambia el aspecto del botón; poco convencional |
| **C. Dejarlo como está** | — | **Incumplimiento legal.** No es una opción |

**Recomendación: A**, con dos tokens separados por rol.

```css
@theme {
  /* Identidad visual: superficies grandes, decorativas, texto ≥24px */
  --color-brand: #7db728;

  /* Interactivo: botones, enlaces, foco — texto blanco encima, AA */
  --color-brand-interactive: #2a7d00;   /* 5.21:1 */
}
```

Separar por rol es lo correcto conceptualmente: el verde de identidad y el verde de acción resuelven problemas distintos, y hoy están colapsados en un solo token.

> **Esta decisión necesita visto bueno de quien administra el manual de identidad SENA.** No es una decisión de ingeniería: es un cambio de marca, aunque sea pequeño. Lo que sí es de ingeniería, y no admite discusión, es que la opción C está descartada.

### 3.2 Las reglas se automatizan

Lo que un linter puede atrapar, no se revisa a mano. Se activa el set recomendado de `jsx-a11y` en **las dos** configs — igual que ESLint, según `2-convenciones` §8: si divergen, la app que se quede corta deja de vigilarse.

Reglas mínimas a declarar: `alt-text`, `anchor-has-content`, `anchor-is-valid`, `aria-props`, `aria-role`, `label-has-associated-control`, `no-noninteractive-element-interactions`, `click-events-have-key-events`, `no-autofocus`, `heading-has-content`.

### 3.3 Dónde vive la accesibilidad

En `shared/ui`. Nunca en una página, nunca en un bloque suelto.

Si un componente necesita un `aria-label`, un `role` o un manejo de foco, eso vive en el átomo o el organismo, no en quien lo usa. La razón es la misma de la §1: el editor no toca código, así que todo lo que dependa de "acordarse" al componer se pierde.

### 3.4 El sonido acompaña al aviso, no lo reemplaza

Desde el 2026-10-09, `Notification` suena con los avisos de éxito, advertencia y error; con `info`, no. El tono sale de `shared/lib/sonido-avisos/` y se genera en el navegador, sin archivos de audio.

- **Nunca es el único canal.** El aviso se sigue viendo con su color y su texto, y lleva `role="alert"`: un lector de pantalla lo lee y quien no oye no pierde nada (SC 1.3.3).
- **Dura menos de medio segundo.** El control de audio del SC 1.4.2 es para lo que suena más de 3 s. Aun así, cada persona lo silencia en Configuración (`/admin/dashboard/configuracion`), y esa elección queda guardada en su navegador.
- **Una pieza nueva que quiera sonar usa `Notification` o `reproducirSonidoAviso`.** No trae su propio audio: así respeta el silencio que la persona ya eligió.

---

## 4. Plan por fases

Mismo criterio que `8-ciclo-editorial.md` §5: cada fase deja el proyecto compilable, y el orden va de mayor impacto y menor riesgo hacia lo contrario.

### Fase 1 — Contraste en los átomos ✅ HECHA (2026-07-26)

**Riesgo: bajo. Impacto: el más alto de todo el plan.**

La paleta quedó partida por rol en el bloque `@theme` de `globals.css`:

| Token | Hex | vs. blanco | Uso |
|---|---|---|---|
| `--color-brand` | `#7db728` | 2.42:1 | identidad: superficies, bordes, decoración. **Sin texto encima** |
| `--color-brand-hover` | `#6da020` | 3.13:1 | ídem |
| `--color-brand-blue` | `#1face3` | 2.60:1 | ídem |
| `--color-brand-interactive` | `#2a7d00` | **5.21:1** | botones y estados con texto blanco |
| `--color-brand-interactive-hover` | `#1f5c00` | **8.11:1** | hover de lo anterior |
| `--color-brand-blue-dark` | `#0b6d8f` | **5.84:1** | equivalente azul |
| `--color-brand-focus` | `#2a7d00` | **5.21:1** | anillo de foco, siempre a opacidad plena |

Cambios aplicados:

1. `button.tsx` — `primary` y `success` pasan a `bg-brand-interactive`; el anillo pierde el `/40` y gana `ring-offset-2`.
2. `notification.tsx` — el color de texto deja de ser global y pasa a ser **por variante**: no se puede usar `text-white` para todas cuando una de ellas es amarilla. `warning` lleva ahora texto `#1f2937` (9.89:1) e `info` pasa al azul oscuro.
3. `globals.css` — `.admin-btn-primary` pasa al azul interactivo.
4. `custom-select.tsx`, `switch.tsx`, `auth-ui.tsx`, `first-login-flow.tsx` — texto verde, anillos con opacidad e indicadores de estado reclasificados.

**Verificado en su momento:** `tsc --noEmit` limpio, `eslint` limpio, `npm run build` correcto, y las siete utilidades nuevas confirmadas en el CSS compilado. Barrido posterior sin combinaciones fallidas: cero `bg-brand` con `text-white`, cero `text-brand` como color de texto, cero anillos con opacidad.

**Pendiente de la fase:** el paso 4 dejó `hover:border-brand` en la pantalla de acceso y `bg-brand` en el interruptor de `globals.css`. Son bordes y superficies sin texto, que es exactamente para lo que existe el token de identidad — no son incumplimientos.

#### ⚠️ El valor se revirtió — verificado el 2026-08-21

**La estructura de la fase 1 sigue en pie; los colores volvieron atrás.** Los tokens
siguen separados por rol, `button.tsx` sigue usando `bg-brand-interactive` en lugar de
`bg-brand`, `notification.tsx` sigue teniendo color de texto por variante y los anillos
siguen a opacidad plena. Todo eso está bien y no hay que rehacerlo. Lo que cambió es el
hex que hay detrás del token interactivo:

| Token | Valor de la fase 1 | Valor hoy | Contraste real hoy | Lo que dice el comentario del CSS |
|---|---|---|---|---|
| `--color-brand-interactive` | `#2a7d00` (5.21:1) | **`#7DB828`** | **2.40:1** ❌ | `/* 5.21:1 */` |
| `--color-brand-interactive-hover` | `#1f5c00` (8.11:1) | **`#63a00d`** | **3.20:1** ❌ | `/* 8.11:1 */` |
| `--color-brand-focus` | `#2a7d00` (5.21:1) | **`#7DB828`** | **2.40:1** ❌ | `/* 5.21:1 */` |
| `--color-brand-blue-dark` | `#0b6d8f` | `#0b6d8f` | 5.84:1 ✅ | correcto |

`#7DB828` es, a un dígito de distancia, el verde de identidad `#7db728`. O sea que el
token interactivo y el de identidad volvieron a ser el mismo color, que es exactamente
la situación que la fase 1 fue a deshacer.

**Lo peor no es el número, son los comentarios.** Siguen anunciando 5.21:1 y 8.11:1 al
lado de valores que dan 2.40:1 y 3.20:1. Quien lea ese archivo para comprobar si la
paleta cumple, leerá que sí. Un comentario que miente es peor que no tener comentario.

Qué arrastra, porque el token no se usa en un solo sitio:

- `Button` variantes `primary` y `success` — el botón principal del sitio, otra vez a 2.40:1.
- El anillo de `focus-visible` de todos los botones: 2.40:1 contra el 3:1 que exige SC 1.4.11.
- `Notification` variante `success`, que hereda `bg-brand-interactive` con texto blanco.

**Qué hacer.** No es un refactor: son tres valores hex y sus tres comentarios en el
bloque `@theme` de `3000-sitio-web/src/style/globals.css`. Devolver `#2a7d00` / `#1f5c00`
restaura el cumplimiento sin tocar un solo componente — que es justamente la ventaja de
haber separado los tokens por rol, y la prueba de que separarlos valió la pena.

Lo que **no** hay que hacer es cambiar el comentario para que coincida con el color. La
opción C de la §3.1 sigue descartada.

> **Antes de revertirlo conviene preguntar por qué se cambió.** Si alguien lo hizo
> porque el verde oscuro se veía mal contra el diseño de la portada, la respuesta no es
> volver a un verde que incumple: es usar el token de identidad para esa superficie
> —para eso existe— y dejar el interactivo donde hay texto encima.

#### Un acierto de la misma pasada: `prefers-reduced-motion`

Las transiciones de ruta que se añadieron después (`route-transition.tsx` en las dos
apps) traen su regla de `@media (prefers-reduced-motion: reduce)` que apaga la
animación. Es SC 2.3.3 —nivel AAA, así que está por encima de lo exigido— y sobre todo
evita el mareo a quien declara esa preferencia en su sistema.

**Las dos apps lo resuelven de forma opuesta, y conviene saber cuál se está tocando:**

| App | Cómo |
|---|---|
| `intranet` | Un **catch-all global**: `*, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important }`. Cubre todo, incluido lo que se escriba mañana |
| `sitio-web` | **Reglas puntuales**, una por animación: la transición de ruta y las tarjetas del portal. No hay catch-all |

La consecuencia práctica es que en `sitio-web` **cada animación nueva necesita su propia
regla** o queda sin cubrir, y nadie lo va a notar — quien escribe la animación
normalmente no tiene la preferencia activada. Adoptar el catch-all de la intranet sería
una línea y cerraría la categoría entera; el argumento en contra es que un
`!important` global es difícil de exceptuar el día que una animación sí deba
sobrevivir. Sea cual sea la decisión, mejor tomarla a propósito que por omisión.

### Fase 2 — Reglas de linter — ⏳ SIN EMPEZAR (verificado 2026-08-21)

**Riesgo: bajo.** Activar `jsx-a11y` recomendado en las dos configs y corregir lo que destape. Es el paso que impide reintroducir los problemas.

Los dos `eslint.config.mjs` son hoy idénticos y contienen `nextVitals` + `nextTs` más
una única regla propia sobre variables sin usar. Ni una mención a `jsx-a11y`. El plugin
está instalado —viene con `eslint-config-next`—, así que esto es literalmente añadir el
set de reglas y arreglar lo que salga.

**Esta fase habría atrapado la regresión de la fase 1.** No del todo: ninguna regla de
`jsx-a11y` mide contraste, eso ninguna herramienta estática lo ve en un token de CSS.
Pero sí es el hábito que falta — el proyecto no tiene hoy ninguna comprobación
automática de accesibilidad, y por eso un cambio de tres hex pasó sin que nada chistara.
Si se quiere una red de verdad contra ese fallo concreto, es un script que lea los
tokens del `@theme` y calcule los ratios, en la línea de los `*:verificar` que ya tiene
`api-backend` (`3-seguridad-del-proyecto.md` §4.9). Ese sí lo habría cazado.

### Fase 3 — Navegación por teclado — ⏳ SIN EMPEZAR (verificado 2026-08-21)

**Riesgo: bajo-medio.**

- Enlace de salto al contenido (SC 2.4.1), visible al recibir foco. Sigue sin existir: ni una coincidencia de `skip` ni de `saltar` en `3000-sitio-web/src`.
- Verificar orden de tabulación y que ningún elemento interactivo sea inalcanzable.
- Foco visible en **todos** los controles, no solo en botones. Ojo con el punto anterior: hoy el anillo de foco está a 2.40:1, así que "visible" y "conforme" no son lo mismo.

### Fase 4 — Alto contraste (RF-14) — ⏳ SIN EMPEZAR

**Riesgo: medio.** Modo de alto contraste conmutable. Se apoya en el mismo mecanismo de tokens de la fase 1: si los colores son tokens, el modo es otro juego de valores, no otro CSS.

Es la única fase que cubre una parte de RF-14 explícitamente pedida por el requerimiento
y que hoy no existe de ninguna forma.

### Fase 5 — El editor no deja publicar contenido inaccesible
**Riesgo: medio-alto. Es la fase que hace real la promesa de "por construcción".**

- Todo bloque Puck con imagen: campo de texto alternativo **obligatorio**, validado en la API.
- Los bloques no exponen color libre: solo tokens del sistema, todos ya conformes.
- Bloque de video/Power BI: `title` obligatorio en el iframe (se cruza con `5-tableros-bi.md` §4).

**✅ HECHA (2026-08-18)**, para alt de imagen y título de iframe, en **sitio-web e intranet** (excepción explícita al alcance de §0 — ver ahí el porqué).

Puck no tiene ningún concepto nativo de campo obligatorio, así que la regla se construyó a mano en `packages/accessibility-policy` — manifiesto por ámbito (qué bloque, qué campo de imagen exige qué campo de alt; qué bloque de iframe exige título) más la función que lo recorre. Se aplica dos veces con la misma fuente de verdad, no dos implementaciones distintas:

- **Cliente** (`puck-editor-wrapper.tsx` de cada app): aviso inmediato al pulsar "Enviar a revisión", sin llamar a la API. No autoritativo.
- **Servidor** (`4000-api-backend/src/use-cases/paginas/enviar-a-revision.usecase.ts`): rechazo real con 400 y el detalle de qué falta. Esto es lo que de verdad impide publicar contenido inaccesible, aunque alguien llame a la API directo.

**Decisión de producto tomada junto con el cambio:** el bloqueo es en "Enviar a revisión", no en "Guardar borrador" — un borrador a medio llenar se puede seguir guardando sin perder trabajo; lo que no puede pasar a `en_revision` es contenido incompleto.

**Si agregás un bloque con imagen o iframe nuevo, sumalo al manifiesto de `packages/accessibility-policy` — no se detecta solo.**

**Lo que cambió desde entonces y afecta a esta fase.** Las secciones dejaron de ser una
lista fija: desde el 2026-08-20 cualquiera con `secciones.crear` estrena una página del
portal desde el propio editor, y esa página recibe el catálogo **completo** de bloques.
Antes, un bloque nuevo solo llegaba a producción por un despliegue, con su revisión de
código de por medio; ahora el catálogo se compone en caliente. La regla no se rompe —el
manifiesto es por tipo de bloque, no por página, así que una sección nueva hereda las
validaciones de todos los bloques que use— pero el olvido sí se vuelve más fácil de
cometer y más difícil de notar. Sigue siendo una lista a mano.

### Fase 6 — Verificación
**Riesgo: bajo, esfuerzo alto.**

- Automática: `axe-core` en CI sobre las rutas principales.
- **Manual con lector de pantalla real** (NVDA en Windows, VoiceOver en macOS). Ninguna herramienta automática detecta más de una parte de los criterios; el resto se prueba usando el sitio sin ver la pantalla.

---

## 5. Checklist para todo componente nuevo

Se suma al checklist de `2-convenciones` §9.

- [ ] Contraste ≥4.5:1 (texto normal) o ≥3:1 (texto grande y bordes de control), verificado con números, no a ojo.
- [ ] Alcanzable y operable **solo con teclado**; foco visible con ≥3:1.
- [ ] Toda imagen con `alt`; `alt=""` si es decorativa — nunca ausente.
- [ ] Todo input con `<label>` asociado; el `placeholder` no es una etiqueta.
- [ ] El color no es el **único** medio para transmitir información (SC 1.4.1).
- [ ] Jerarquía de encabezados sin saltos (`h1` → `h2` → `h3`).
- [ ] Si es interactivo y no es un elemento nativo, tiene `role` y manejo de teclado.
- [ ] Los mensajes de error se anuncian (`role="alert"` o `aria-live`).

---

## 6. Lo que ninguna herramienta detecta

Conviene decirlo para que nadie confunda "axe pasa" con "cumple":

- Si un texto alternativo **describe realmente** la imagen o es ruido.
- Si el orden de lectura tiene sentido para alguien que no ve la pantalla.
- Si un enlace "clic aquí" comunica su destino fuera de contexto.
- Si un formulario largo es realmente completable con lector de pantalla.

Estos se detectan usando el sitio con lector de pantalla, y esa prueba es parte de la fase 6, no opcional.

---

## 7. Pendientes conocidos

- **El token interactivo volvió al verde de identidad** y los comentarios del CSS
  siguen anunciando los ratios viejos. Es el pendiente más urgente del documento y el
  más barato de cerrar: tres hex. Detalle en la fase 1.
- **La decisión 3.1 sigue sin aprobación formal** de quien administra la identidad
  SENA. Es probablemente lo que explica la regresión de arriba: una decisión de marca
  que nunca se ratificó no aguanta la primera vez que alguien mira la pantalla y decide
  que el verde se ve apagado. Cerrarla con quien corresponde vale más que volver a
  cambiar el hex.
- **Nadie ha probado el sitio con lector de pantalla** hasta hoy. Sigue siendo cierto.
- **No hay ninguna comprobación automática de accesibilidad** en el proyecto: ni el set
  de `jsx-a11y` (fase 2), ni `axe-core` en CI (fase 6), ni un verificador de contraste
  sobre los tokens. El resto de reglas del proyecto sí se comprueban con scripts
  (`3-seguridad-del-proyecto.md` §4.9); estas no.
- **Las imágenes sin optimizar cambiaron de sitio, no de cantidad.** Las vistas
  estáticas de la intranet (`InicioView`, `MatrizView`, `TasaView`…) se borraron al
  migrar todo a contenido de base de datos, así que las advertencias
  `no-img-element` que colgaban de ellas se fueron con ellas — pero quedan 17 `<img>`
  en la intranet y 20 en el sitio, casi todos ya dentro de bloques Puck. Es de
  rendimiento, no de accesibilidad; lo que sí es de accesibilidad es que al convertirlas
  a `next/image` hay que revisar el `alt` de cada una, y los que vienen de un bloque los
  escribe un editor, no un desarrollador.
- **La intranet no está auditada** en este documento y ahora hay dos hallazgos
  concretos esperando: su paleta propia necesita el mismo cálculo de la §2.1, y su
  `<html>` declara `lang="en"` (SC 3.1.1, nivel A — ver §2.2). Es zona privada, pero
  RF-15 no exime de la Resolución.
- **`5-tableros-bi.md` §4** registra que los iframes de Power BI no llevan `sandbox`. El
  `title` sí quedó cubierto por la fase 5, que lo exige en el servidor para los bloques
  del manifiesto.
