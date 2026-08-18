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

Este documento aplica **solo al sitio público** (`sitio-web/`). Es decisión deliberada de alcance, no un olvido.

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

Ratios calculados sobre los tokens de `sitio-web/src/app/globals.css`:

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
| `<html lang="es">` | correcto en [layout.tsx:51](sitio-web/src/app/layout.tsx#L51) |
| Landmarks `<main>`, `<nav>` | presentes en los layouts públicos y en `sidebar-layout` |
| Color de texto base | 10.46:1, muy por encima del mínimo |
| Botón `danger` | 4.83:1, cumple |
| `eslint-plugin-jsx-a11y` | disponible (viene con `eslint-config-next`) |

### 2.3 Lo que falta

| Hueco | Criterio WCAG | Nota |
|---|---|---|
| No hay **enlace de salto al contenido** | SC 2.4.1 | Ninguna coincidencia de `skip`/`saltar` en `app/` ni `shared/` |
| Reglas a11y **no declaradas** en las configs | — | `core-web-vitals` activa un subconjunto pequeño; el set recomendado no está |
| Indicador de foco **por debajo de 3:1** | SC 1.4.11 | Ver §2.1 |
| Borde de input a 1.47:1 | SC 1.4.11 | Solo importa donde el borde es el único indicador del campo |
| Sin **modo de alto contraste** | RF-14 lo pide explícitamente | No existe hoy |
| ~~Bloques Puck sin **campo de texto alternativo obligatorio**~~ | SC 1.1.1 | **Resuelto 2026-08-18** — ver Fase 5 |

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

**Verificado:** `tsc --noEmit` limpio, `eslint` limpio, `npm run build` correcto, y las siete utilidades nuevas confirmadas en el CSS compilado. Barrido posterior sin combinaciones fallidas: cero `bg-brand` con `text-white`, cero `text-brand` como color de texto, cero anillos con opacidad.

**Pendiente de la fase:** el paso 4 dejó `hover:border-brand` en `(admin)/login/page.tsx` y `bg-brand` en el interruptor de `globals.css`. Son bordes y superficies sin texto, que es exactamente para lo que existe el token de identidad — no son incumplimientos.

### Fase 2 — Reglas de linter
**Riesgo: bajo.** Activar `jsx-a11y` recomendado en las dos configs y corregir lo que destape. Es el paso que impide reintroducir los problemas.

### Fase 3 — Navegación por teclado
**Riesgo: bajo-medio.**

- Enlace de salto al contenido (SC 2.4.1), visible al recibir foco.
- Verificar orden de tabulación y que ningún elemento interactivo sea inalcanzable.
- Foco visible en **todos** los controles, no solo en botones.

### Fase 4 — Alto contraste (RF-14)
**Riesgo: medio.** Modo de alto contraste conmutable. Se apoya en el mismo mecanismo de tokens de la fase 1: si los colores son tokens, el modo es otro juego de valores, no otro CSS.

### Fase 5 — El editor no deja publicar contenido inaccesible
**Riesgo: medio-alto. Es la fase que hace real la promesa de "por construcción".**

- Todo bloque Puck con imagen: campo de texto alternativo **obligatorio**, validado en la API.
- Los bloques no exponen color libre: solo tokens del sistema, todos ya conformes.
- Bloque de video/Power BI: `title` obligatorio en el iframe (se cruza con `5-tableros-bi.md` §4).

**✅ HECHA (2026-08-18)**, para alt de imagen y título de iframe, en **sitio-web e intranet** (excepción explícita al alcance de §0 — ver ahí el porqué).

Puck no tiene ningún concepto nativo de campo obligatorio, así que la regla se construyó a mano en `packages/accessibility-policy` — manifiesto por ámbito (qué bloque, qué campo de imagen exige qué campo de alt; qué bloque de iframe exige título) más la función que lo recorre. Se aplica dos veces con la misma fuente de verdad, no dos implementaciones distintas:

- **Cliente** (`puck-editor-wrapper.tsx` de cada app): aviso inmediato al pulsar "Enviar a revisión", sin llamar a la API. No autoritativo.
- **Servidor** (`api-backend/src/use-cases/paginas/enviar-a-revision.usecase.ts`): rechazo real con 400 y el detalle de qué falta. Esto es lo que de verdad impide publicar contenido inaccesible, aunque alguien llame a la API directo.

**Decisión de producto tomada junto con el cambio:** el bloqueo es en "Enviar a revisión", no en "Guardar borrador" — un borrador a medio llenar se puede seguir guardando sin perder trabajo; lo que no puede pasar a `en_revision` es contenido incompleto.

**Si agregás un bloque con imagen o iframe nuevo, sumalo al manifiesto de `packages/accessibility-policy` — no se detecta solo.**

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

- **La decisión 3.1 necesita aprobación formal** de quien administra la identidad SENA. La fase 1 ya se ejecutó con esa opción, así que hoy el sitio usa `#2a7d00` en botones. Si el manual de marca exige otro valor, se cambia **un token** y todo el sistema lo hereda — ese es justamente el punto de haberlo separado por rol. Lo que no puede volver es a un verde que falle AA.
- **Nadie ha probado el sitio con lector de pantalla** hasta hoy.
- **Las 9 advertencias `no-img-element`** de la intranet son de rendimiento, no de accesibilidad — pero al convertir esas imágenes a `next/image` hay que revisar el `alt` de cada una.
- **La intranet no está auditada** en este documento. Su paleta es propia y necesita el mismo cálculo de la §2.1. Es zona privada, pero RF-15 no exime de la Resolución.
- **`5-tableros-bi.md` §4** registra que los iframes de Power BI no llevan `sandbox`; también les falta verificar `title`, que sí es criterio de accesibilidad (SC 4.1.2).
