# Bitácora de sesiones — Proyecto OLO (SENA)

> Registro cronológico de las sesiones de trabajo: qué se movió, qué se creó, qué quedó pendiente.
> La sesión más reciente va primero.

---

## sesión 09-10-2026 (19.ª parte): respaldos — cada fila dice «Sitio web /inicio · versión 43»

**Qué se pidió.** En `/admin/respaldos`, la columna «Página» se leía «inicio Sitio web
· versión 43»: el título, después la etiqueta del ámbito y la versión. El usuario la quiere
en el orden ámbito → página o sección → versión: «Sitio web /inicio · versión 43».

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3000-sitio-web/.../respaldos/components/respaldos-view.tsx` | La etiqueta del ámbito va primero; en vez del título, la ruta (`/{slug}`), que es como ya la nombran los modales de restaurar y de vista previa y sirve igual para una página que para una sección; la versión al final |

**Cómo se probó.** `tsc --noEmit` y `eslint` del archivo, limpios. No se miró en el navegador:
la pantalla pide sesión de administrador.

> **Aviso.** El título de la página deja de verse en la fila. Si dos páginas se titulan
> distinto de su ruta y hace falta el título, puede volver como segunda línea.

**Pendiente al cierre.** Mirar `/admin/respaldos` con sesión, a 360 y 1280 (en el móvil la
fila pasa a tarjeta, `olo-tabla-apilable`).

---

## sesión 09-10-2026 (18.ª parte): los modales del panel y del editor con las medidas del acceso, y el editor en Poppins

**Qué se pidió.** Dar a todos los modales del panel y del editor (los de cerrar sesión, enviar
a revisión...) la misma simetría de las pantallas de acceso: los bordes de los campos y de los
botones, y llevar la letra del panel (Poppins) también al editor.

**Las medidas** (las de `auth-ui.tsx`): caja con esquinas de 32; título de 20 px Semibold en
`#001631`; texto de 16; etiquetas de 16 Medium; campos y botones de 44 px de alto con
esquinas de 32 y borde `#d9d9d9`; acción principal en `#001631` (en los modales deja de ser
verde); «Eliminar» sigue en rojo; áreas de texto y mensajes de estado con esquinas de 16.

**Lo que se hizo.** Se centralizó en vez de tocar botón por botón:

| Pieza | Cambio |
|---|---|
| `shared/ui/atoms/button.tsx` | `FormaDeModal` (contexto) y `useEnModal`. Dentro de un modal, `Button` toma las medidas y colores de modal; fuera, no cambia nada |
| `shared/ui/molecules/alert.tsx` | `Alert` pone `FormaDeModal`; caja de 32, título de 20, texto de 16; exporta `campoDeModalClass`, `areaDeModalClass` y `etiquetaDeModalClass` |
| `custom-select.tsx`, `date-picker.tsx` | Dentro de un modal, esquinas de 32, borde `#d9d9d9` y letra de 16 (con `useEnModal`; el `compacto` no cambia) |
| `roles-view.tsx` (Nuevo editor), `formulario-proyecto-inversion.tsx`, `modal-permisos.tsx` | Campos, áreas y etiquetas con las clases de `alert.tsx`; «Añadir permisos» pasa a `Button`; permisos usa `FormaDeModal` en su caja propia; el error del formulario de inversión pasa a banda de 16 |
| `modal-depurar-auditoria.tsx`, `modal-depurar-versiones.tsx`, `modal-diagrama-visitas.tsx`, Notificaciones (`panel-general.tsx`) | Caja de 32, título de 20 en `#001631`, botones de 44 con esquinas de 32; los rojos no parten el texto y el pie hace `wrap` |
| `buscador-modal.tsx` | El campo de búsqueda con esquinas de 32 y borde `#d9d9d9` |
| `globals.css` `.olo-modal-*` (Enviar a revisión, Guardar borrador, Hay cambios sin guardar) y `.nueva-seccion-*` (Cerrar sesión, Nueva página, Eliminar página) | Las mismas medidas en CSS; títulos con `font-family: inherit` (si no, `--font-heading` los dejaba en Arial) y botones sin partir el texto |
| `modal-cerrar-sesion.tsx`, `modal-nueva-seccion.tsx`, `modal-eliminar-seccion.tsx` | `poppins.className` en la caja: salen también en el portal público, donde no hay `LetraDelPanel` |
| `app/editor/[slug]/page.tsx` | Envoltorio `display: contents` con `poppins.className` y `--puck-font-family`, `--font-heading` y `--font-body` en Poppins: la interfaz de Puck (pedía Inter, que no se carga), la barra y los modales. El lienzo no cambia: Puck lo dibuja en un iframe y le copia las hojas de estilo, no los estilos en línea |
| `aviso-rechazo.tsx`, `editor-client.tsx` | Avisos de estado con esquinas de 16; el de rechazo en Poppins (sale por portal) |
| `manual-de-usuario-formato.md` | «Copiar» y «Editar permisos» pasan de «botón verde» a «botón azul oscuro» |

**Cómo se probó.** Con el arnés de siempre (componentes reales, API simulada, Chrome sin
ventana), sin tocar Neon ni el servidor de desarrollo: 8 modales (formulario en `Alert` con
campo, desplegable, fecha y área; permisos con rol y con la lista; depurar versiones; cerrar
sesión; nueva página; eliminar página; enviar a revisión del editor) a 360 y a 1280 px.

| Comprobación | Resultado |
|---|---|
| Caja | 32 px en los 8 |
| Título | 20 px, 600, `#001631`, Poppins pintada en los 8 |
| Campos, desplegables, fecha | 44 px, esquinas de 32, borde `#d9d9d9`, 16 px |
| Áreas de texto | Esquinas de 16 |
| Botones | 44 px, esquinas de 32; principal `#001631`, peligro rojo; Poppins pintada |
| Desborde horizontal, errores de consola | Ninguno |

En la primera pasada salieron dos fallos, ya corregidos: los títulos de los modales del editor y
de secciones en Arial, y «Crear y editar» y «Depurar 12 versiones» partidos en dos o tres
líneas a 360 px. Tipos de los 25 archivos tocados o afectados, limpios (con la API de
TypeScript archivo por archivo: el `tsc` completo se cortaba en los marcadores del merge, ya
resuelto). `eslint`, limpio salvo errores que ya estaban en `modal-permisos.tsx` y
`roles-view.tsx` (las mismas reglas en el último commit).

**Pendiente al cierre:**

- Los tres campos de texto de «Nuevo usuario» (`usuarios-view.tsx`) siguen con la forma vieja:
  el archivo tiene cambios de otra persona sin commitear y no se tocó. Sus botones,
  desplegable y fecha ya cambian solos. Falta poner `campoDeModalClass` y
  `etiquetaDeModalClass` cuando eso entre.
- No se probó en el navegador con sesión real (el editor completo con Puck).

---

## sesión 09-10-2026 (17.ª parte): merge de la PR #140 de Mateo con los cambios propios conservados

**Qué era.** Al traer `OLO/dev` (4 commits de Mateo, PR #140) chocaron 6 archivos. Mateo
pasó la recuperación de contraseña de la intranet (preguntas, nueva contraseña, pantalla de
éxito) a la maqueta del login (`login-page`, tarjeta blanca, logo y «INTRANET»), dio a
`PasswordField` y `PasswordRequisitos` una variante sin `classPrefix`, renombró «Editor» a
«Autor» en Respaldos, quitó el buscador de texto de la cola de revisión y devolvió los
enlaces de la política a `/politica-de-privacidad`, con un redirect desde
`/inicio/politica-de-privacidad`. Eso cierra el pendiente del 404 anotado el 25-09-2026.

**Cómo se resolvió.** Se conservan todas las líneas cambiadas aquí; de Mateo se toma solo lo
que aquí no se tocó.

| Archivo | Queda |
|---|---|
| `sitio-web/.../auth/components/login-view.tsx` | El diseño propio (texto 14 px `#737373`), con los enlaces de Mateo a `/politica-de-privacidad` |
| `intranet/.../login/components/login-view.tsx` | El título propio («Bienvenido a nuestra Intranet») y los colores propios del aviso, con los enlaces de Mateo |
| `auth-success-screen.tsx`, `reset-password-view.tsx`, `security-questions-view.tsx` | La maqueta de Mateo con el `cerrarSesion` propio en `ReturnToSiteLink` y `classPrefix="login"` (el de su maqueta) |
| `docs/manual-de-usuario-formato.md` | Los dos pasos del sitio web en su versión propia: «Correo SENA» y la recuperación con tres barras. El texto de Mateo («Verifica tu identidad», puntos) describía la intranet, no el sitio |

> **Ojo.** En `auth-success-screen.tsx` quedarse con «lo mío» tal cual borraba la tarjeta de
> Mateo y dejaba el JSX roto: el bloque en conflicto empezaba en mitad de su maqueta nueva.

**Cómo se probó.**

| Comprobación | Resultado |
|---|---|
| Marcadores de conflicto en los 6 archivos | Ninguno |
| `tsc --noEmit` de la intranet y del sitio | Limpios |

**Pendiente al cierre:**

- Probar en el navegador la recuperación de la intranet con la maqueta de Mateo (no se corrió).
- Lo que Mateo dejó en el manual sobre el aviso de privacidad del login del sitio
  (`/politica-de-privacidad`) no entró, porque chocaba con el paso propio; se puede añadir
  como viñeta aparte.

---

## sesión 09-10-2026 (16.ª parte): sin «(Pregunta 1 de 3)» a la vista

**Qué se pidió.** Quitar «(Pregunta 1 de 3)» de bajo el encabezado «Preguntas de seguridad».

**Lo que se hizo.** Se quitó en las dos pantallas que lo tenían, la recuperación
(`security-questions-view.tsx`) y el primer ingreso (`first-login-flow.tsx`), para que sigan
iguales. El avance lo siguen dando las tres barras (`AuthProgressDots`), y el lector de
pantalla sigue oyendo el número: en la recuperación, en el `sr-only` de la caja de la
pregunta; en el primer ingreso, en la etiqueta oculta del desplegable. Manual actualizado en los
dos pasos.

**Cómo se probó.** Arnés de siempre en Chrome sin ventana a 6 anchos, primer ingreso y
recuperación completos, sin errores en la consola. `tsc --noEmit` del sitio y `eslint` de los
dos archivos, limpios.

---

## sesión 09-10-2026 (15.ª parte): la contraseña temporal vence a las 72 horas (migración 043)

**Qué se pidió.** Lo que quedó abierto en la 13.ª parte: que la contraseña temporal no valga
para siempre. El usuario eligió **caducidad de 72 horas** frente a quemarla al primer uso.

**Cómo funciona.**

| Momento | Qué pasa con `password_temporal_vence_en` |
|---|---|
| Alta, «Restablecer contraseña», reactivación | Ahora + 72 h (`vencimientoDeTemporal`) |
| Primer ingreso completado, cambio voluntario, recuperación por preguntas | `NULL` |
| Login con la temporal vencida | 403 «Tu contraseña temporal venció (dura 72 horas). Pide al administrador que te genere una nueva.» — **después** de comprobar la contraseña, para no delatar el estado de la cuenta a quien no la sabe |
| Sesión abierta con la temporal cuando vence | `requireAuth` (las dos variantes) responde 401 con el mismo mensaje: el token dura 7 días y sin esto quien entró a las 71 h seguía |
| Fecha vacía con `debe_cambiar_password` | No vence (cuentas que no pasaron por la 043) |

La regla está una sola vez, en `shared/password-policy.ts` (`HORAS_DE_VIGENCIA_TEMPORAL`,
`vencimientoDeTemporal`, `temporalVencida`, `MENSAJE_TEMPORAL_VENCIDA`).

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/043-password-temporal-vence.ts` (nueva) + `index.ts`; modelo `user.ts` | Columna `password_temporal_vence_en`; las cuentas con temporal pendiente reciben 72 h desde que se aplica |
| API | `shared/password-policy.ts` | La regla y el mensaje |
| API | `use-cases/usuarios/listar-usuarios.usecase.ts` | Fija el vencimiento al crear y al restablecer o reactivar; lo vacía cuando llega `must_change_password: false` |
| API | `use-cases/auth/login.usecase.ts`, `middlewares/auth.middleware.ts` | Rechazan la temporal vencida |
| API | `use-cases/auth/first-login.usecase.ts` | Vacía la fecha al cambiar la contraseña |
| API | `use-cases/auth/security-questions.usecase.ts` | La recuperación apaga además `debe_cambiar_password`: con una temporal vencida, quien recuperaba seguía marcado y el login lo habría rechazado por una clave que ya no es la suya |
| Sitio | `usuarios-view.tsx`, `use-usuarios.ts` | El aviso de la contraseña temporal dice hasta cuándo vale |
| Docs | `11-base-de-datos.md`, `12-diccionario-de-datos.md`, `3-seguridad-del-proyecto.md` | Fila de la 043, columna 18 de `usuarios`, fila de S10 al día |

**Cómo se probó.**

| Prueba | Resultado |
|---|---|
| Login y `requireAuth` reales con repositorios, `jwt` y bcrypt simulados, sin base | ✅ vencida → 403 en el login y 401 en la sesión; vigente (71 h), sin fecha y ya cambiada pasan el control |
| `createUser` y `updateUser` con `reset_password` | ✅ 72 h; el cambio voluntario deja `null` |
| SQL de la 043 sobre una tabla **temporal** en Neon, dentro de una transacción deshecha | ✅ 72 h solo donde `debe_cambiar_password`; el `DROP` funciona; `usuarios` sin tocar |
| `tsc --noEmit` en la API y el sitio; `eslint` de los archivos del sitio | ✅ |

> **Aviso.** El modelo ya pide la columna: **hasta aplicar la 043 en Neon, cualquier consulta
> de usuarios falla** (login incluido). Primero `npm run migrate`, después reiniciar la API.

**Pendiente al cierre.**

- **`npm run migrate`** en `4000-api-backend`, reiniciar la API y `npm run db:verificar`.
- Probar con una cuenta real: crear un usuario (el aviso dice hasta cuándo vale), entrar con
  la temporal y completar el primer ingreso.
- La lista de usuarios no marca las temporales vencidas: el administrador lo sabe cuando la
  persona avisa. Se podría añadir una etiqueta «Temporal vencida» en la fila.

---

## sesión 09-10-2026 (15.ª parte): encabezado «Preguntas de seguridad» en el primer ingreso y en la recuperación

**Qué se pidió.** Un `h2` «Preguntas de seguridad» sobre la pregunta. Se hizo primero en el
primer ingreso (en lugar de la etiqueta del desplegable); el usuario aclaró después que lo
quería en la recuperación, en lugar de «Responde tus preguntas». Quedaron las dos iguales.

**Lo que se hizo.**

| Archivo | Cambio |
|---|---|
| `first-login-flow.tsx` | `h2` «Preguntas de seguridad» (20 px, Medium) con «(Pregunta 1 de 3)» debajo en 16 px sin negrita: el mismo patrón que «Responde tus preguntas» en la recuperación |
| `auth-ui.tsx` | `AuthSelectField` admite `etiquetaOculta`: la etiqueta queda solo para el lector de pantalla (`sr-only`), así el desplegable sigue teniendo nombre sin repetir lo que ya dice el encabezado |
| `security-questions-view.tsx` | «Responde tus preguntas» pasa a «Preguntas de seguridad», y el contador a «(Pregunta 1 de 3)» para no repetir «de seguridad» |
| `manual-de-usuario-formato.md` | El paso 2 del primer ingreso y el paso 3 de la recuperación nombran el encabezado |

**Cómo se probó.** Arnés de siempre en Chrome sin ventana a 6 anchos, primer ingreso y
recuperación completos, sin errores en la consola; capturas a 360 y 1280 con el encabezado y
el contador. `tsc --noEmit` del sitio y `eslint` de los dos archivos, limpios.

---

## sesión 09-10-2026 (14.ª parte): mitad izquierda en blanco y el número de la pregunta junto a la pregunta

**Qué se pidió.** En las pantallas de acceso del panel, que la mitad izquierda del escritorio,
donde está el logo, vaya sobre blanco. Y en la recuperación de contraseña, quitar
«(Pregunta de seguridad 1 de 3)» del título de la página y ponerlo bajo «Responde tus
preguntas».

**Lo que se hizo.**

| Archivo | Cambio |
|---|---|
| `marco-de-pasos.tsx` | Desde `xl` la mitad izquierda ya no es `#001631` con texto blanco: queda blanca con el texto en `#001631`, como en el móvil. Se quitaron los `xl:` que pasaban a blanco el título y el paginador. La mitad derecha (`#001a39`, esquinas de 32) no cambia. Afecta a todas las pantallas del marco: login, primer ingreso y recuperación |
| `security-questions-view.tsx` | El título queda en «Validación de identidad». El contador va dentro del `h2` «Responde tus preguntas», en una segunda línea de 16 px sin negrita, para que no compita con el encabezado |
| `manual-de-usuario-formato.md` | Primer ingreso, login y recuperación: la mitad izquierda va sobre blanco; dónde está ahora el número de la pregunta |

**Cómo se probó.** Con el arnés de siempre (componentes reales, `fetch` simulado, Chrome sin
ventana, a 360, 440, 768, 1032, 1280 y 1920 px), sin tocar Neon ni el servidor de desarrollo:
login, primer ingreso completo y recuperación completa hasta «Genial», sin errores en la
consola. En las capturas de 1280 y 1920 la mitad izquierda es blanca y el logo, el título y el
paginador se leen en `#001631`; la pregunta muestra «Validación de identidad» arriba y el
contador bajo «Responde tus preguntas» a 360 y a 1280. `tsc --noEmit` del sitio y `eslint` de
los dos archivos, limpios.

---

## sesión 09-10-2026 (13.ª parte): la sesión de primer ingreso solo sirve para terminarlo

**Qué se pidió.** Revisar qué pasa cuando alguien entra con un correo nuevo y la contraseña
temporal y sale de la pantalla sin cambiarla; que esa sesión sea «de un único uso», que el
primer ingreso vuelva a aparecer, y que también aparezca si la cuenta no tiene preguntas.

**Lo que se encontró.**

| Pregunta | Respuesta antes del cambio |
|---|---|
| ¿Vuelve a salir el primer ingreso al entrar otra vez con la temporal? | **Sí.** El login devuelve las marcas y las dos apps mandan a `/first-login` (sitio) o a la pantalla pendiente (intranet) |
| ¿Qué pasa al salir sin terminar? | «Regresar al sitio web» **no cerraba la sesión**. En el portal la cuenta seguía conectada, con los botones de edición a la vista (los decide la cookie de rol) |
| ¿La API exigía terminar? | **No.** `requireAuth` no miraba `must_change_password` ni `must_setup_security_questions`: solo los proxies redirigían pantallas, y cualquier llamada directa funcionaba con todo el rol |
| ¿Se detecta una cuenta sin preguntas? | **No.** Solo se miraba la marca, que se enciende al crear la cuenta o al restablecerlas. En Neon (solo `SELECT`): de 12 cuentas activas, 9 tienen sus 3 preguntas, 2 no y ya están marcadas, y **1 no las tiene y no está marcada**: nunca se le pedían |

**Lo que se hizo.**

| Capa | Archivo | Cambio |
|---|---|---|
| API | `middlewares/auth.middleware.ts` | `requireAuth` responde 403 `CONFIGURACION_PENDIENTE` si la fila tiene algo pendiente; `requireAuthConConfiguracionPendiente` para lo que hace falta para terminar; `req.user.must_*` salen de la fila, no del token; `tieneConfiguracionPendiente()` |
| API | `routes/auth.routes.ts`, `routes/security-question.routes.ts` | `first-login/status`, `first-login`, `me`, `change-password` y `security-questions/setup` usan la variante que admite pendiente |
| API | `use-cases/auth/login.usecase.ts`, `security-questions.repository.ts`, `first-login.usecase.ts` | El login cuenta las preguntas y, con menos de 3, enciende `debe_configurar_preguntas` antes de firmar el token (`countByUserId`, `TOTAL_PREGUNTAS` exportado) |
| API | `controllers/auth.controller.ts` | `/me` devuelve `configuracionPendiente` y, si lo está, `permisos: []` |
| Sitio | `marco-de-pasos.tsx`, `first-login-flow.tsx` | `cerrarSesionAlSalir`: en los cinco estados del primer ingreso, «Regresar al sitio web» cierra la sesión antes de salir |
| Sitio | `secciones.service.ts` | Si `/me` dice `configuracionPendiente`, el portal manda a `/first-login` en vez de pintar botones de edición |
| Intranet | `return-to-site-link.tsx` + `first-login-view`, `security-questions-view` (modo `setup`), `reset-password-view` (modo `forced`), `auth-success-screen` | `cerrarSesion`: cierra la sesión antes de ir al sitio |
| Docs | `3-seguridad-del-proyecto.md` | Fila nueva en la tabla de S10 |

**Cómo se probó.** El middleware y el login reales, con `jwt`, los repositorios y bcrypt
simulados y variables de entorno falsas (sin base ni token reales). `tsc --noEmit` en las tres
apps y `eslint` de los archivos tocados del sitio y de la intranet, limpios.

| Caso | Resultado |
|---|---|
| Cuenta configurada | ✅ pasa por `requireAuth` y por la variante |
| Contraseña temporal pendiente; solo preguntas pendientes | ✅ `requireAuth` → 403 `CONFIGURACION_PENDIENTE`; la variante pasa |
| Token viejo que dice «pendiente», fila ya al día | ✅ pasa |
| Login con 3, 1 y 0 preguntas | ✅ con 3 no toca nada; con 1 y 0 marca la cuenta y el token sale con la marca |

No se probó en el navegador con una cuenta real (hace falta sesión): queda para el usuario.

> **Aviso.** El token se firma al entrar y no cambia: tras terminar el primer ingreso sigue
> diciendo «pendiente». La API ya no se fía de él (mira la fila); los proxies sí, por eso las
> dos apps cierran la sesión al terminar y piden volver a entrar.

**Lo que se descartó (por ahora).**

- **Quemar la contraseña temporal al primer uso.** Es lo que más se parece a «un único uso»,
  pero quien cierra la pestaña por error se queda fuera hasta que un administrador le emita
  otra. Se dejó la temporal válida hasta que se cambie y se limitó lo que esa sesión puede
  hacer. Queda planteado al usuario junto con la alternativa de darle caducidad.

**Pendiente al cierre.**

- **Reiniciar la API** y probar: crear una cuenta, entrar con la temporal, pulsar «Regresar al
  sitio web» (debe salir sin sesión), volver a entrar (debe salir el primer ingreso).
- La cuenta activa sin preguntas verá la configuración en su próximo ingreso.
- Decidir si la contraseña temporal caduca o se quema al primer uso.

---

## sesión 09-10-2026 (12.ª parte): mensajes de estado y preguntas de seguridad con esquinas de 16 px

**Qué se pidió.** Esquinas de 16 px, y no las de 32 de los botones, en los mensajes de estado
(error, éxito, advertencia…) y en donde se muestran las preguntas de seguridad.

**Por qué parecían botones.** `globals.css` redefine la escala de radios en un `:root` sin capa,
que gana a la de Tailwind: en este sitio `rounded-xl` mide 16 px (12 en Tailwind) y `rounded-2xl`
mide 24 (16 en Tailwind). Las bandas del acceso y los avisos flotantes usaban `rounded-2xl`, 24, y
un botón de 44 px de alto con esquinas de 32 se ve con 22: casi igual.

**Cómo quedó.** Todos con `rounded-xl` (16 px), el mismo que ya llevaban las bandas de los
modales de Respaldos, Auditoría y Permisos.

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `auth/components/auth-ui.tsx` | `AuthGeneralError` y `AuthGeneralNotice`, de 24 a 16. `authPasosInputClass` admite otras esquinas, y el desplegable de preguntas del primer ingreso pasa `rounded-xl`. Va como parámetro y no como clase añadida: dos clases de radio en el mismo elemento las resuelve el orden del CSS |
| FE | `auth/components/security-questions-view.tsx` | La caja de la pregunta, de 32 a 16 |
| FE | `shared/ui/molecules/notification.tsx` | Los avisos flotantes (éxito, error, advertencia, información), de 24 a 16 |
| FE | `carga-criterios-clasificacion.tsx` (dos), `panel-general.tsx`, `usuarios-view.tsx`, `mi-perfil/components/profile.tsx` | Las bandas de estado del panel que iban a 12, a 16 |

Las respuestas siguen siendo campos, con esquinas de 32.

**Cómo se probó.** En el arnés, a 360 px, radio calculado con `getComputedStyle`. La banda
«Correo o contraseña incorrectos» del login, la caja de la pregunta y el desplegable de preguntas
dan 16 px; el campo de correo, el de la respuesta y los botones, 32. `tsc --noEmit` del sitio y
`eslint` de lo tocado: ✅.

---

## sesión 09-10-2026 (11.ª parte): simetría en las pantallas de acceso — escala tipográfica, campos y botones iguales, fondo blanco y el login en el diseño nuevo

**Qué se pidió.** Con dos imágenes: la escala tipográfica del usuario (Heading 1 a 5 en
60/50/40/30/24 Semibold, Headline 20, Body Large 18, Body 16, Footnote 14, Caption 13 y Small 12)
y los mockups de móvil (440 px) del login y de la recuperación. Darle simetría a todas las rutas
del acceso (login, primer ingreso, recuperación):

- títulos con los tamaños de la escala, en Poppins, y no en Work Sans ni en Inter;
- campos y botones del mismo largo y alto, con esquinas de 32 px, como la tarjeta, y con medidas
  responsivas;
- el primer ingreso sobre blanco, como la recuperación.

Durante el trabajo llegaron dos cosas más: el color de los botones (`#001631`) y los dos ojos del
campo de contraseña, en SVG.

**Lo que había** (medido con canvas sobre los mockups). En el móvil el campo medía 330 px en el
login, 320 en la recuperación y 283 en las preguntas, y el botón de la confirmación, 272. Los
campos eran de 40 px y los botones de 44 (40 en el escritorio), con esquinas de 4 a 6. El login
seguía con su marco viejo (`AuthSplitShell`, piel `tarjeta`) y el primer ingreso iba sobre azul.

**Cómo quedó.**

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `auth/components/auth-ui.tsx` | Un solo juego de medidas para todas las pantallas. Campos, caja de la pregunta y botones: 44 px de alto, a todo el ancho y con esquinas de 32. Formulario: sin tarjeta y de 330 px como máximo en el móvil; desde `md`, tarjeta de 452 con borde `#d9d9d9` y esquinas de 32. Etiquetas a 16 px en peso medio, encabezado del formulario a 20 (Headline Medium) y errores a 14. Botón y barras en `#001631`. Se quitan la piel `tarjeta`, el contexto `PielAuth`, `AuthSplitShell`, `AuthCardTitle` y las clases que solo usaba el login viejo |
| FE | `auth/components/marco-de-pasos.tsx` | Un solo tema: blanco con texto `#001631` por debajo de `xl` y las dos mitades azules desde `xl`. Título a 24 px en el móvil y 30 desde `md` (Heading 5 → 4, Semibold); texto a 18 (Body Large). `conLogo` para el login. El paginador se lee sobre blanco y sobre azul, con números redondos |
| FE | `auth/components/login-view.tsx` | El login pasa al marco nuevo, como el mockup de móvil: logo, «Panel de Administración» y el formulario con las mismas medidas. El límite de Suspense rodea solo el formulario, así que el marco llega ya en el HTML del servidor |
| FE | `first-login-flow.tsx`, `recovery-view.tsx`, `security-questions-view.tsx`, `reset-password-view.tsx`, `reset-success-view.tsx` | Sin `tema`: todo va sobre blanco. El título de las preguntas pierde su tamaño propio. La caja de la pregunta mide lo que un campo. El botón de la confirmación va en el mismo formulario (antes, 272 px) |
| FE | `app/(auth)/layout.tsx`, `auth/index.ts` | Sin `AuthSplitShell`: cada pantalla pinta su marco |
| FE | `public/assets/svg/eye-closed.svg`, `eye-open.svg` | Los ojos que pasó el usuario. El campo de contraseña los usa con `IconoMascara`: cerrado mientras la clave está oculta, abierto cuando se ve. Son los mismos archivos de los botones de «ver» de Respaldos y Revisión, que también cambian |
| FE | `style/globals.css` | El desplegable de preguntas (el select personalizable de Chrome) deja partir la pregunta en dos líneas y crece hacia abajo, como la caja de la recuperación: en una línea el recorte caía bajo la flecha. Su lista abierta, con esquinas de 16 |
| Docs | `manual-de-usuario-formato.md` §3.4.1.1 y §3.4.1.2 | El login nuevo, el primer ingreso sobre blanco y cómo se lee el ojo. Se corrige la casilla «Correo electrónico», que en pantalla es «Correo SENA» |

**Decisiones.**

- **Títulos de la escala, en Semibold, como ella:** 24 px (Heading 5) en el móvil y 30
  (Heading 4) desde la tablet, en todas las pantallas. En el mockup de móvil miden unos 32, y el
  de las preguntas ocupaba cuatro líneas; a 24 son cuatro como máximo.
- **Sin tarjeta en el móvil**, como en el mockup de móvil. Desde `md`, la tarjeta con esquinas
  de 32.
- **Etiquetas a 16 en peso medio** (Body Medium) en todas las pantallas. En el mockup unas iban
  en negrita y otras no. «Ingresa nuevamente la contraseña» cabe en una línea en todos los anchos.
- **«¿Olvidaste tu contraseña?» en `#001631`**, como los demás enlaces, y no en el gris claro del
  mockup (`#929292`, con 3,2:1, por debajo del 4,5:1 de AA).
- **«Passcode» sigue siendo «Contraseña».**

**Cómo se probó.** El arnés de la 9.ª parte, ahora con lo que monta el layout real
(`LetraDelPanel` y `FlujoDeRecuperacionProvider`). Ocho vistas a 360, 440, 768, 1032, 1280 y
1920 px, y los tres flujos con la API simulada.

| Prueba | Resultado |
|---|---|
| Medidas de campos y botones | ✅ En cada ancho, iguales en todas las pantallas: 328 px a 360, 330 a 440 y 386 desde 768. Todos de 44 de alto y con esquinas de 32. La caja de la pregunta crece a 66 cuando la pregunta ocupa dos líneas |
| Tarjeta | ✅ Ninguna por debajo de 768. Desde ahí, 452 px, borde `#d9d9d9` y esquinas de 32 |
| Letra | ✅ Títulos, etiquetas, botones y enlaces pintados en Poppins (`CSS.getPlatformFontsForNode`) |
| Tamaños | ✅ Título a 24/600 hasta 767 px y a 30/600 desde 768. Texto a 18, encabezado del formulario a 20/500, etiquetas a 16/500 y en una línea |
| Fondo | ✅ Blanco hasta 1279 px en todas las pantallas, también en el primer ingreso. Azul desde 1280 |
| Paginador | ✅ `#001631` sobre blanco y blanco sobre azul. El paso actual va relleno |
| Login | ✅ Vacío: los dos errores. Con un `@gmail.com`: «Debe ser un correo institucional @sena.edu.co». Con la API respondiendo 401: «Correo o contraseña incorrectos» |
| Primer ingreso y recuperación | ✅ Completos de punta a punta |
| Ojo | ✅ Cerrado con la clave oculta y abierto al mostrarla. El nombre accesible dice la acción |
| Desborde y consola | ✅ Sin desborde horizontal en ningún ancho, sin errores ni avisos |
| `/login` y `/recovery` en el dev | ✅ El diseño nuevo, en Poppins y con las mismas medidas |
| `tsc --noEmit` del sitio; `eslint` de lo tocado | ✅ |

**Queda.**

- Mirar el primer ingreso y la recuperación con una cuenta real.
- La intranet tiene sus propias pantallas de acceso: no se tocaron.

---

## sesión 09-10-2026 (10.ª parte): el panel y sus pantallas de acceso en Poppins, títulos incluidos y en negrita

**Qué se pidió.** Una sola letra para todo el panel de administración y sus pantallas de acceso.
Primero se pidió Work Sans; a mitad de camino, Inter, la de los mockups; y en la 11.ª parte,
Poppins, la que ya tenía el panel: «es mejor que Inter». Con una regla para el panel: los títulos
en negrita, cada uno a su tamaño, y las descripciones en un tamaño menor que su título.

**Cómo quedó.**

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `features/administracion/auth/components/letra-del-panel.tsx` (nuevo) | Pone Poppins (la de `shared/lib/fonts.ts`) en `<body>`, en `--font-heading` y `--font-body`, mientras el panel o una pantalla de acceso están montados. Va en `<body>` y no en el contenedor porque los modales y los avisos salen por portal a `<body>`. Al ir al sitio público o al editor se desmonta y vuelve la letra de antes |
| FE | `app/admin/layout.tsx`, `app/(auth)/layout.tsx`, `auth/index.ts` | Montan `LetraDelPanel` en lugar de poner `poppins.className` en su contenedor |
| FE | `style/globals.css` | `.admin-header` (títulos de página) y `.admin-subtitle` (de sección y de modal) pasan a negrita, igual que `.navegacion-mobile-hoja-titulo`. La regla queda escrita junto a ellas |
| FE | `carga-alertas-inversion`, `carga-criterios-clasificacion`, `carga-fuentes-futuras`, `carga-programa-sobresalientes`, `historial-cargas-tendencia`, `preferencia-sonido-avisos`, `detalle-registro`, `modal-bloqueo-restauracion`, `modal-confirmar-restauracion`, `alert`, `notification` | Los títulos escritos a mano pasan de `font-semibold`/`font-medium` a `font-bold` |
| FE | `shared/lib/fonts.ts` | Solo el comentario |

**Qué cambia de verdad.** El texto del panel ya era Poppins. Lo nuevo es que **los títulos** (los
h1–h6, `.admin-header` y `.admin-subtitle`) salían en la letra del sistema, Arial en Windows, por
el hallazgo de abajo, y ahora salen en Poppins.

**Decisiones.**

- **Inter se probó y se descartó.** Iba en su propio módulo, para no precargarse en el sitio
  público. Poppins se queda en `shared/lib/fonts.ts`, el único punto donde se declara.
- **No es título y se queda como estaba:** las cifras de las tarjetas del Dashboard (etiqueta
  pequeña y número grande en negrita), las etiquetas de campo y los nombres en listas y tablas.
- **Las descripciones ya eran menores** que su título en todo el panel: bajo el título de página
  van a 14 px, y bajo el de un modal o una tarjeta a 14 o 12. No hubo que cambiarlas.

**Hallazgo, sin tocar: los títulos del sitio público no salen en Work Sans.** `app/layout.tsx`
carga Work Sans en `--font-heading`, pero el `:root` de `globals.css` define esa misma variable
como `'Open Sans'`. Los dos van sin capa y con la misma especificidad, y en el CSS que arma Next
globals.css va después, así que gana el segundo (comprobado en `.next/dev`). Open Sans no se
carga en ningún lado, de modo que los títulos públicos salen en la letra del sistema: Arial en
Windows, Helvetica en Mac. Era también lo que les pasaba a los títulos del panel. Arreglarlo
cambia cómo se ve el sitio público, así que queda para que se decida aparte. El panel ya no
depende de esto, porque `LetraDelPanel` fija sus dos variables.

**Cómo se probó.** Con `CSS.getPlatformFontsForNode` de Chrome, que dice con qué letra se pintó
de verdad cada texto y no solo la que se pidió. Un segundo arnés monta `PanelGeneralLayout` con
una página de ejemplo; Puck, axios y echarts van simulados, porque sus paquetes son de Node.

| Prueba | Resultado |
|---|---|
| Panel a 1280, 768 y 360 | ✅ Barra lateral, barra superior, navegación de abajo en el móvil, título, subtítulo y párrafo pintados en Poppins |
| Aviso que sale por portal a `<body>` | ✅ En Poppins, en el panel y en el acceso |
| Sin `LetraDelPanel` (como estaba antes) | ✅ Se reproduce el fallo: el texto en Poppins y los títulos en Arial |
| Jerarquía en el panel | ✅ Título de página de 24 a 30 px a 700, con descripción de 14. Subtítulo de 17 a 20 a 700, con descripción de 14 |
| Consola | ✅ Sin errores ni avisos |
| `tsc --noEmit` del sitio; `eslint` de lo tocado | ✅ |

**Queda.**

- Mirar el panel en el navegador con una sesión real. El arnés monta el marco y una página de
  ejemplo, no cada pantalla con sus datos.
- Decidir los títulos del sitio público (el hallazgo de arriba).
- Visto al revisar `/login` en el dev: la página carga la hoja de estilos del editor Puck, con su
  `@import` de Inter desde `rsms.me`, un servidor externo. Llega por el barril de `auth`, que
  exporta `panel-general`, y este importa `@/features/paginas`, que incluye
  `puck-editor-wrapper.tsx`. Ya pasaba antes de estos cambios. No cambia la letra, pero el login
  descarga CSS que no usa.

---

## sesión 09-10-2026 (9.ª parte): la recuperación de contraseña del panel con el diseño nuevo (mockups de tablet)

**Qué se pidió.** Las cuatro pantallas de la recuperación (`/recovery`, `/security-questions`,
`/reset-password`, `/reset-success`) según seis mockups de tablet (1032 px), y el móvil a
partir de ellos. A diferencia del primer ingreso, van sobre **blanco**: título, texto y enlace
de regreso en `#001631`, tarjeta de 452 px con borde `#d9d9d9` y, en las preguntas, barras de
avance de 32 × 6 px (`#002237` / `#ccd3d7`). Colores medidos sobre los PNG con canvas.

**Cómo quedó.**

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `.../auth/components/marco-de-pasos.tsx` | `tema="claro"`: blanco y texto `#001631` por debajo de `xl`. Título como `ReactNode` con `text-balance`; descripción en uno o varios párrafos (`text-pretty`) |
| FE | `.../auth/components/auth-ui.tsx` | Las cuatro rutas pasan a `RUTAS_CON_MARCO_PROPIO`. En la piel `pasos`, `AuthProgressDots` son las barras del mockup, y también las ve el paso 2 del primer ingreso. `BackToSiteLink` en navy sobre blanco. Nuevos `authPasosCardHeadingClass` y los exportados `authPasosInputClass` y `authPasosErrorTextClass` |
| FE | `recovery-view.tsx` | «Recupera el acceso / a tu cuenta», «Ingresa tu correo SENA» en negrita, «Comenzar», «Iniciar sesión» |
| FE | `security-questions-view.tsx` | «Validación de identidad (Pregunta de seguridad n de 3)». La pregunta va en una caja con forma de campo, que es la `<label>` de la respuesta: pulsarla lleva al campo, y el lector la anuncia con «Pregunta n de 3». Debajo, «Respuesta», las barras y «Continuar» |
| FE | `reset-password-view.tsx` | «¡Enhorabuena, <nombre>!», «Crea tu nueva contraseña», «Guardar», requisitos al enfocar |
| FE | `reset-success-view.tsx` | Sin tarjeta, como el mockup: título, dos párrafos y «Iniciar sesión» de 272 px |
| FE | `hooks/use-requisitos-al-enfocar.ts` (nuevo) | La regla de cuándo se ve la lista de requisitos, compartida con el primer ingreso, que la tenía dentro |
| FE | `flujo-de-recuperacion.tsx`, `recuperacion.service.ts` | El nombre que da el servidor viaja al paso de la contraseña |
| API | `controllers/security-questions.controller.ts`, `routes/security-question.routes.ts` | `POST /api/security-questions/verify` devuelve también `nombre`, el primer nombre de la cuenta. Solo sale con las tres respuestas correctas, así que no sirve para averiguar de quién es un correo. Documentado en OpenAPI. La intranet ignora el campo |
| Docs | `manual-de-usuario-formato.md` §3.4.1.3 y §3.5.1.3 | Textos y botones nuevos de la recuperación del Sitio Web. Se corrigió además «Ir a iniciar sesión» |

**Decisiones sin mockup, y por qué.**

- **Escritorio:** no hubo mockup. Usa el del primer ingreso: dos mitades azules, con el logo,
  el título y el texto a la izquierda, y la tarjeta a la derecha. Así los dos flujos se ven
  iguales en pantalla grande. En la confirmación, el botón azul sobre el azul de la derecha no
  se distinguía: ahí va dentro de una tarjeta con la marca de hecho.
- **Móvil:** el de la tablet en 330 px. El subtítulo de las preguntas baja a 24 px, porque a 32
  el título ocupaba cuatro líneas en grande.
- **«coincidir exactamente»** pasa a «deben coincidir… No importan las mayúsculas»: el servidor
  compara con `trim().toLowerCase()`. **«passcode»** pasa a «contraseña» y **«Preguntas de
  Seguridad 1»** a «Pregunta de seguridad 1 de 3», en minúsculas como el resto del sitio.
- **En las preguntas 2 y 3** el mockup deja vacío el hueco del enlace. Ahí va «Volver a la
  pregunta anterior», que ya existía. En la 1, «Iniciar sesión».
- **El ojo de mostrar** es el relleno de la piel `pasos` y no el de pestañas del mockup de
  `/reset-password`, para que sea el mismo en todo el diseño nuevo.

**Cómo se probó.** El arnés de la 7.ª parte, ahora con un enrutador simulado que cambia de
página como el de Next dentro del mismo layout. Monta el layout real (`FlujoDeRecuperacionProvider`
+ `AuthSplitShell`) y recorre el flujo con la API simulada.

| Prueba | Resultado |
|---|---|
| Las cuatro pantallas a 360, 440, 768, 1032, 1280 y 1920 px | ✅ Sin desborde y un solo `h1` visible. Blanco y `#001631` hasta `xl`; azul y blanco desde `xl`, con logo. Tarjeta de 312/330/452/452/320/320. Botón de 44/40 |
| Correo vacío / sin preguntas | ✅ «El correo es requerido» / el aviso general de siempre |
| Preguntas | ✅ El nombre accesible de la respuesta es «Pregunta 1 de 3: …». Respuesta vacía: error con `aria-invalid`. «Volver a la pregunta anterior» conserva lo escrito |
| Verificación fallida | ✅ «Una o más respuestas son incorrectas», vuelve a la 1 y borra las respuestas |
| Contraseña nueva | ✅ «¡Enhorabuena, Prueba!» con el nombre que manda la API. Requisitos ocultos hasta enfocar. «Las contraseñas no coinciden». Un solo envío con correo, tres respuestas y la clave |
| Éxito | ✅ «¡Genial, tu clave ha sido actualizada con éxito!» y «Iniciar sesión» → `/login` |
| Abrir `/security-questions`, `/reset-password` o `/reset-success` a mano | ✅ Vuelven a `/recovery` |
| Primer ingreso tras el cambio | ✅ Sigue en azul, con el mismo tamaño de tarjeta |
| Consola | ✅ Sin errores ni avisos |
| `tsc --noEmit` del sitio y de la API; `eslint` de lo tocado | ✅ |

No se probó la API con una base: el cambio es una línea sobre el usuario que `verifyAnswers` ya
devolvía. **Hay que reiniciar la API** de desarrollo para que salga el nombre: `ts-node` no
recarga solo. Sin reiniciar, el título dice «¡Enhorabuena!» sin nombre.

**Queda.**

- Mirar el flujo con una cuenta real a 360 y 1032.
- Los mockups de escritorio de la recuperación, si los hay, y los del login.
- La intranet tiene su propia recuperación (`3001-intranet`), con su marco: no se tocó.

---

## sesión 09-10-2026 (8.ª parte): el manual de usuario pasa a `manual-de-usuario-formato.md`

**Qué pasó.** Al bajar `OLO/dev` llegó el PR #138 (rama `mateo`). En el commit `31873fe0` se borró
`docs/manual-de-usuario.md` y quedó `docs/manual-de-usuario-formato.md`, con otra numeración
(el manual empieza en §3) y el primer ingreso y el inicio de sesión separados por portal. Aquí, mientras
tanto, se había editado el manual viejo en la 6.ª y la 7.ª parte. El merge se detuvo con el
conflicto «deleted by them».

**Decisión del usuario.** Queda el manual nuevo. Lo de estas dos sesiones se pasa al nuevo y las
referencias al nombre viejo se cambian.

| Capa | Archivo | Cambio |
|---|---|---|
| Docs | `manual-de-usuario.md` | Se acepta el borrado del merge |
| Docs | `manual-de-usuario-formato.md` §3.4.1.1, «Primer Ingreso desde el Sitio Web Público», pasos 3 a 6 | El paginador, los requisitos al entrar en «Nueva contraseña», el ojo, «Continuar»/«Siguiente», las preguntas una a la vez sin repetir, «Atrás»/«Anterior», «Guardar» en la tercera y el enlace «Iniciar sesión» que sale sin guardar. Se corrige que la respuesta «es sensible a mayúsculas»: no distingue mayúsculas ni cuenta los espacios de los extremos (`trim().toLowerCase()`). La captura ya no dice «con saludo al funcionario», que se quitó en la 7.ª parte |
| Docs | `manual-de-usuario-formato.md` §3.4.2.9.2, «Configuración» | El punto «Sonido de los avisos». La captura describe el interruptor y los botones, que es lo que hay en la pantalla |
| Docs | `6-auditoria.md`, 6.ª y 7.ª parte | Las referencias a `manual-de-usuario.md` §8.5.2 y §10.9.2 apuntan a las secciones nuevas, con la antigua entre paréntesis |

**Lo que no se tocó.** El primer ingreso **de la intranet** (mismo §3.4.1.1) es otra pantalla y no
tiene el diseño nuevo: se deja como lo escribió Mateo.

**Verificación.**

| Prueba | Resultado |
|---|---|
| Búsqueda de `manual-de-usuario` (sin `-formato`) en el repositorio, sin `node_modules` | ✅ Solo quedan las menciones «era `manual-de-usuario.md`» de esta bitácora |
| Finales de línea del manual y la bitácora, medidos con node | ✅ CRLF entero en los dos, antes y después |

**Queda.**

- Acordar con Mateo que `manual-de-usuario-formato.md` es el manual oficial, y si conviene que
  vuelva a llamarse `manual-de-usuario.md`.
- §3.4.2.9.2 sigue describiendo «preguntas de seguridad» y «notificaciones» en Configuración, que
  no existen todavía (ya anotado en la 6.ª parte).

---

## sesión 09-10-2026 (7.ª parte): el primer ingreso del panel con el diseño nuevo (mockups de escritorio, tablet y móvil)

**Qué se pidió.** El usuario va a pasar los mockups de las pantallas del panel de una en una,
«con sus mensajes y experiencia de usuario». La primera es el primer ingreso (`/first-login`),
en tres tamaños:

- **Escritorio:** dos azules. A la izquierda, el logo, «Actualiza tu seguridad», el texto y un
  paginador «← Previous 1 2 3 Next →». A la derecha, una tarjeta blanca con borde, sin título,
  con los tres campos, «Continuar», el enlace «Iniciar sesión» y «Regresar al sitio web» debajo.
- **Tablet (1032) y móvil (440):** lo mismo en una columna, sin logo.

Colores medidos sobre el mockup de escritorio, píxel a píxel con un canvas en Chrome:

| Elemento | Color |
|---|---|
| Fondo izquierdo | `#001631` |
| Fondo derecho | `#001a39`, con las esquinas izquierdas redondeadas |
| Borde de la tarjeta y de los campos | `#d9d9d9` |
| Etiquetas | `#001a39` |
| Texto de ejemplo | `#b3b3b3` |
| Ojo | `#334861` |
| Botón | `#002237` |
| «Previous» apagado | blanco al 50 % |

**Cómo quedó.**

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3000-sitio-web/.../auth/components/marco-de-pasos.tsx` (nuevo) | `MarcoDePasos`: las dos mitades en `xl`, una columna por debajo, el título del paso como `h1`. Su `PaginadorDePasos` se puede ver en «Paginador», más abajo |
| FE | `.../auth/components/auth-ui.tsx` | La piel `pasos`: tarjeta de 330/452/320 px según el tamaño (los tres mockups), botón de 44 px por debajo de `xl` (§10.4) y 40 en escritorio, campos de 40 px con texto de 16, ojo relleno. La elige el marco con el contexto `PielAuth`, así que los campos (`PasswordField`, `AuthTextField`, `AuthSelectField`) y `BackToSiteLink` cambian solos. Sin el marco, la piel de siempre: login y recuperación no cambian. Los tres campos anuncian ya su error (`aria-invalid` + `aria-describedby`). `AuthSplitShell` deja pasar `/first-login` sin pintar su marco |
| FE | `.../auth/components/first-login-flow.tsx` | Sobre `MarcoDePasos`: título y texto de cada paso fuera de la tarjeta. Es el mismo flujo (lo que falta, las validaciones y el envío no cambian), con la tarjeta, los textos y el paginador nuevos |
| FE | `app/(auth)/first-login/page.tsx` | Sin el saludo por nombre, que el mockup no tiene |
| Docs | `manual-de-usuario-formato.md` §3.4.1.1 («Primer Ingreso desde el Sitio Web Público»; era `manual-de-usuario.md` §8.5.2) | El flujo como es: tres campos, requisitos, paginador, «Guardar» y el paso final. Se corrigió además que la respuesta «es sensible a mayúsculas»: el servidor la compara con `trim().toLowerCase()` |

**Paginador.**

- **«Anterior»** vuelve de las preguntas a la contraseña, que no se envía hasta el final, sin perder lo escrito.
- **«Siguiente»** envía el formulario del paso (`form=`), así que valida igual que «Continuar».
- **Los números** de los pasos que faltan no son botones, porque saltarse uno dejaría la cuenta a medias. Los anteriores sí.
- **Al terminar** se apaga todo.
- **Pasos según lo pendiente:** si a la cuenta solo le falta la contraseña o solo las preguntas, el paginador muestra 2 pasos.

**Lo que se adaptó del mockup, y por qué.**

- **«passcode» y «código de acceso» pasan a «contraseña»**, que es como lo llama el resto del sitio y la propia etiqueta «Contraseña temporal» del mockup. **«Previous / Next»** pasan a «Anterior / Siguiente».
- **«mínimo 8 caracteres» pasa a «Mínimo 12 caracteres»**, que es la política (`LONGITUD_MINIMA`). La temporal dice «La que te entregaron»: la da el administrador y no llega por correo.
- **Los requisitos de la contraseña** no salen en el mockup. Aparecen al entrar en «Nueva contraseña» (o si el navegador la rellena) y ya no se van: en reposo la pantalla es la del mockup, y nadie descubre las reglas a base de rechazos. Si se fueran al salir del campo, la tarjeta encogería justo al pulsar el de abajo.
- **El ojo para mostrar la contraseña** se mantiene en tablet y móvil, aunque esos mockups no lo dibujan.
- **Las etiquetas van a 15 px y no a 16.** La letra del mockup es más estrecha que Poppins: a 16, «Ingresa nuevamente la contraseña» mide 282 px y la tarjeta de escritorio tiene 270 por dentro. Poppins es la del panel, y el título usa Work Sans, la de los encabezados del sitio.
- **El enlace «Iniciar sesión»** de la tarjeta cierra la sesión temporal y lleva al login.

**Cómo se probó.** Al no poder abrir `/first-login` sin una sesión real, se montó el componente
real con React 19 de desarrollo, el CSS de la app compilado con su Tailwind, Poppins y Work Sans,
y la API simulada. Se empaquetó con un empaquetador de 70 líneas en el scratchpad (el proyecto
no tiene esbuild) y se recorrió en Chrome sin ventana.

| Prueba | Resultado |
|---|---|
| 360, 440, 768, 1032, 1280 y 1920 px | ✅ Sin desborde y un solo `h1`. Logo solo desde `xl`. Tarjeta de 312/330/452/452/320/320. «Anterior / Siguiente» con palabras desde 440 y solo flechas a 360. Botón de 44/40 |
| «Siguiente» con todo vacío | ✅ Los tres errores bajo sus campos, con `aria-invalid` y `aria-describedby`; sigue en el paso 1 |
| Requisitos | ✅ Ocultos en reposo, aparecen al enfocar, se marcan al escribir y siguen al pasar al campo de abajo |
| Contraseñas distintas, luego iguales | ✅ «Las contraseñas no coinciden», y después al paso 2 |
| «Anterior» desde el paso 2, luego «Siguiente» | ✅ Vuelve con los tres campos intactos y la revalida |
| Tres preguntas | ✅ No deja repetir una ya elegida. Un solo POST con la temporal, la nueva y las tres respuestas |
| Paso 3 | ✅ «¡Configuración completada!», con el paginador apagado |
| Solo preguntas / solo contraseña | ✅ Paginador de 2. Con solo la contraseña, «Continuar» envía directo |
| Nada pendiente / fallo al consultar | ✅ «Tu cuenta ya está configurada» con «Ir al panel» / «Configura tu acceso» con el error |
| Consola del navegador | ✅ Sin errores ni avisos de React |
| `tsc --noEmit` del sitio; `eslint` de los cuatro archivos | ✅ |

> **Trampa encontrada:** `3000-sitio-web/src/style/globals.css` define `.sr-only` **fuera de
> las capas** de Tailwind, y una regla sin capa gana a cualquier utilidad. Por eso
> `md:not-sr-only` o `@sm:not-sr-only` no hacen nada en este sitio. El paginador usa
> `aria-label` y `hidden @sm:inline`. Arreglarlo (meter la regla en `@layer utilities` o
> borrarla, porque Tailwind ya trae `sr-only`) toca todo el sitio y queda pendiente.

**Queda.**

- **Revisar con una cuenta real:** crear una cuenta de prueba y entrar con su temporal, a 360 y a 1032.
- **El resto de pantallas del flujo, con sus mockups:** login, recuperación, preguntas y restablecer. Cuando no quede ninguna con la piel `tarjeta`, sobran ella y `AuthSplitShell`.
- **La regla `.sr-only` sin capa** de `globals.css`.

---

## sesión 09-10-2026 (6.ª parte): los avisos de éxito, advertencia y error suenan, y Configuración deja de estar «en construcción»

**Qué se pidió.** Añadir sonido a los avisos de estado: error, aprobado (éxito) y advertencia.

**Lo que había.** Los avisos de estado no siguen un solo patrón:

- `Notification` (el aviso flotante del panel) es el único con los cuatro estados, y hoy solo lo usan Usuarios y Roles.
- Mi perfil, Revisión y las cargas muestran su propio mensaje dentro de la página. Al aprobar en Revisión no aparece ningún aviso de éxito.
- La intranet no tiene aviso flotante.

No había audio en ninguna de las dos apps. `/admin/dashboard/configuracion` era una página «en construcción» y el buscador del panel la excluía por eso.

**Decisión del usuario.**

- **Alcance:** solo suena el aviso flotante. Cualquier pantalla que pase a usarlo sonará sin cambiar nada más.
- **Control:** suena por defecto y se puede silenciar desde Configuración.

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3000-sitio-web/src/shared/lib/sonido-avisos/` (nuevo) | Tres tonos de menos de medio segundo, generados con Web Audio y sin archivos: éxito sube una quinta, advertencia repite un la, error baja un tritono. `info` no suena. La preferencia se guarda en `localStorage` (`olo-sonido-avisos`): solo se escribe `'apagado'`, y sin valor suena. Se sincroniza entre pestañas. Si el navegador tarda más de 300 ms en dejar sonar, no suena |
| FE | `3000-sitio-web/src/shared/ui/molecules/notification.tsx` | Suena con cada aviso nuevo, incluido el que cambia de texto sin desmontarse, y no con cada render. El `setTimeout` cancelable evita que el modo estricto de React lo toque dos veces |
| FE | `3000-sitio-web/src/features/administracion/configuracion/` (nuevo) y `app/admin/dashboard/configuracion/page.tsx` | La pantalla con `EncabezadoPanel`, un interruptor (el `Switch` de siempre) y los botones «Escuchar: Éxito / Advertencia / Error», que suenan aunque esté silenciado |
| FE | `features/administracion/buscador/lib/indice-panel.ts` | Configuración entra al buscador del panel («sonido», «silenciar», «preferencias»…) |
| Docs | `9-accesibilidad.md` §3.4, `2-convenciones` §10.5, `manual-de-usuario-formato.md` §3.4.2.9.2 (era `manual-de-usuario.md` §10.9.2), `scripts/mapa/descripciones.md` | La regla (el sonido acompaña, nunca es el único canal), `Notification` en las piezas compartidas, el manual y el mapa |

**Por qué en el navegador y no en la cuenta.** Se hizo igual que el tema oscuro (`CLAVE_TEMA`). Quien comparte oficina quiere silencio en ese equipo, no en todos. Además, así no hace falta columna, migración ni endpoint.

**Cómo se probó.**

| Prueba | Resultado |
|---|---|
| Módulo real en Chrome sin ventana, cada sonido renderizado con `OfflineAudioContext` | ✅ Duran 0,25–0,37 s, pico 0,18 sobre 1 y la primera nota a 660, 880 y 520 Hz (la esperada). Sin chasquidos: el salto máximo entre muestras es 0,023 |
| Preferencia en el mismo Chrome | ✅ Por defecto suena. Apagar guarda `'apagado'` y encender borra la clave. Silenciado no crea ni el contexto de audio. `info` no suena. La muestra suena aunque esté silenciado. El suscriptor se entera y deja de enterarse al quitarlo |
| Primer gesto (Safari solo deja arrancar el audio dentro de un clic) | ✅ Con sonido, el primer clic o tecla prepara el contexto una vez. Silenciado no crea nada |
| Navegador que tarda 400 ms en dejar sonar | ✅ Silencio en vez de un tono a destiempo |
| `Notification` real en `<StrictMode>` (React 19 de desarrollo, happy-dom) | ✅ Cada aviso suena una vez. Un render con el mismo aviso no repite. Otro aviso sin desmontar sí suena. `info` y el silenciado, no |
| Control de esa prueba: el mismo efecto sin el `setTimeout` | Suena dos veces al montar. La prueba sí detecta el doble montaje |
| `ConfiguracionView` real con el CSS de la app, a 360, 768, 1024 y 1440 px en claro y oscuro | ✅ Sin desborde, 16 px de margen en el móvil, el interruptor dentro de la tarjeta y los botones de 42 px de alto en una fila. A 360 px «Escuchar:» baja a su propia línea; antes, «Error» quedaba solo en una segunda fila |
| `tsc --noEmit` del sitio; `eslint` de lo tocado | ✅ |

No se probó con altavoces ni dentro del panel con sesión. Las dos cosas quedan para el usuario: escuchar los tonos en Configuración y crear o borrar algo en Usuarios.

**Queda.**

- Mi perfil, Revisión y las cargas siguen con sus mensajes propios, que no suenan. Si se quiere sonido ahí, que usen `Notification`, no un audio aparte (`9-accesibilidad` §3.4).
- El manual (`manual-de-usuario-formato.md` §3.4.2.9.2) describe en Configuración «preguntas de seguridad» y «notificaciones», que no existen todavía.

---

## sesión 09-10-2026 (5.ª parte): quitar la fecha de caducidad de un usuario no llegaba a la base

**Qué pasaba.** En `/admin/users`, al editar una cuenta y pulsar «Borrar» en el calendario de
la fecha de caducidad, se guardaba sin error pero la fecha seguía en la base: una cuenta con
caducidad ya no podía quedarse sin ella.

**Por qué.** Dos fallos, uno tapando al otro:

1. El formulario solo mandaba `expiration_date` si tenía valor (`if (expirationDate)`). Al
   borrarla, el campo no viajaba, y para un PATCH parcial «no viene» es «no se toca».
2. Aunque se hubiera mandado vacía, el validador dejaba pasar `''` tal cual hasta el modelo,
   y `''` no es una fecha válida para la columna `fecha_caducidad`.

El resto ya estaba preparado para el `null`: el esquema lo admitía, la regla de reactivar con
fecha vencida lo trata bien y la bitácora ya sabe decir «Se quitó la fecha de caducidad, que
era …».

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3000-sitio-web/.../auth/components/usuarios-view.tsx` | Al editar, `expiration_date` va siempre: la fecha o `null` |
| FE | `3000-sitio-web/.../auth/hooks/use-usuarios.ts` | `CambiosUsuario.expiration_date` admite `null` |
| API | `4000-api-backend/src/validators/usuarios.validators.ts` | `fechaOpcional` convierte la cadena vacía (y la de solo espacios) en `null`, en el alta y en la edición |

**Cómo se probó.**

| Prueba | Resultado |
|---|---|
| `actualizarUsuarioSchema` con fecha, `''`, `'  '`, `null`, sin el campo y un número | ✅ fecha intacta; `''`, `'  '` y `null` → `null`; sin campo no aparece; el número, rechazado |
| `crearUsuarioSchema` con `expiration_date: ''` | ✅ `null` |
| `tsc --noEmit` en el sitio y en la API; `eslint` de los dos archivos del sitio | ✅ |

No se probó de punta a punta contra Neon: hace falta una sesión de administrador real, así
que queda para el usuario.

> **Aviso.** Ahora cada edición manda la fecha aunque no cambie. No ensucia la auditoría:
> `cambioDeVerdad` compara la fecha por día y `null` con `null` como iguales.

**Pendiente al cierre.**

- **Reiniciar la API** (ts-node sin recarga) y probar en `/admin/users`: editar una cuenta con
  caducidad, «Borrar», guardar, y volver a abrirla; en la auditoría debe salir «Se quitó la
  fecha de caducidad».

---

## sesión 09-10-2026 (4.ª parte): acceso a la intranet en móvil y tablet

**Qué se pidió.** Lo mismo que en la 3.ª parte, para la intranet: el login con su propio
mockup de móvil y el resto del flujo (`/first-login`, `/recovery`, `/security-questions`,
`/reset-password`, `/reset-success`) igual que en el sitio web. En el mockup, todo va sobre
el azul: «Bienvenido a nuestra Intranet» en blanco arriba, el logo grande y atenuado debajo,
y el formulario sin tarjeta, con etiquetas blancas, campos blancos y botón blanco.

**Cómo está hecha la intranet.** No tiene un marco común como el sitio: cada pantalla trae
dos paneles (`.login-left`/`.login-right`, `.recovery-*`, `.sq-*`, `.rp-*`, `.fl-*`) en su
`globals.css`, y por debajo de `md` se apilaban. El panel de arriba ya pinta el título y la
descripción del paso en blanco, que es justo lo que muestran los mockups del flujo; bastaba
con subir el corte.

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3001-intranet/src/style/globals.css` | El apilado de los cinco pares de paneles pasa de `width < 48rem` a `width < 80rem` (`xl`); apilados, un solo azul de fondo, sin la esquina redondeada y centrados en vertical. El texto del cargador del login, en blanco por debajo de `xl` |
| FE | `3001-intranet/src/features/login/components/login-view.tsx` | Por debajo de `xl`: título arriba y en negrita, logo de 192/224 px al 30 % debajo; `TARJETA_LOGIN` sin tarjeta; etiquetas, aviso legal y enlaces en blanco; campos con `bg-white` y anillo de foco blanco; errores de campo en `red-300`; botón blanco con texto navy. Desde `xl`, todo como estaba |

**Cómo se probó.** Igual que la 3.ª parte: CDP contra el `next dev` de la intranet (3001).
`tsc --noEmit` y `eslint` del archivo, limpios.

| Ruta | 360 | 768 | 1032 | 1280 |
|---|---|---|---|---|
| `/login` | ✅ el mockup, sin desborde | ✅ | ✅ | ✅ dos columnas, como antes |
| `/recovery` | ✅ marca arriba, tarjeta debajo | ✅ | ✅ | ✅ dos columnas |

No se abrieron `/first-login`, `/security-questions`, `/reset-password` ni `/reset-success`:
piden sesión o lo que deja el paso anterior en `sessionStorage`. Usan las mismas reglas de
apilado que `/recovery`.

**Lo que se descartó.**

- **Pasar la intranet al marco del sitio (`AuthSplitShell`)**: es otra app con su identidad y
  su hoja (`2-convenciones` §10.5); el corte común se decide igual en las dos y se cita en
  ambos comentarios.

**Pendiente al cierre.**

- El botón principal sigue en 40 px de alto (§10.4 pide 44 en el móvil), como en el sitio.
- Mirar los pasos con sesión con una cuenta real a 360 y 1032.

---

## sesión 09-10-2026 (3.ª parte): acceso al panel de administración en móvil y tablet

**Qué se pidió.** Adaptar a móvil y tablet las pantallas de acceso del panel (`/login`,
`/first-login` y la recuperación: `/recovery`, `/security-questions`, `/reset-password`,
`/reset-success`) según los mockups del usuario: por debajo de la tablet grande (iPad Pro 13",
1032 × 1376) el login va sobre fondo blanco, con el logo a color y «Panel de Administración»
encima y el formulario sin tarjeta; el resto del flujo se apila en una columna sobre el azul.

**El corte.** El diseño partido empezaba en `md` (768), así que toda tablet lo recibía. La
tablet del mockup mide 1032 y `lg` empieza en 1024, de modo que `lg` tampoco servía: el
corte pasa a **`xl` (1280)**, el primero de la escala por encima (`2-convenciones` §10.1).
La misma tablet en horizontal (1376) sí ve el diseño partido.

| Capa | Archivo | Cambio |
|---|---|---|
| FE | `3000-sitio-web/.../auth/components/auth-ui.tsx` | `AuthSplitShell`: panel izquierdo y marca compacta de `md` a `xl`; mira la ruta y, en `/login`, fondo blanco y marca a color (logo + «Panel de / Administración») hasta `xl`. `authLoginCardClass` nueva (sin tarjeta hasta `xl`). `authSolidCardClass` con `px-6 py-8` en el móvil. `BackToSiteLink` con `sobreBlanco` (gris hasta `xl`) y `py-2.5` para el objetivo táctil |
| FE | `3000-sitio-web/.../auth/components/login-view.tsx` | El formulario y su estado de carga usan `authLoginCardClass` |

**Cómo se probó.** Chrome headless contra el `next dev` del usuario, con emulación de
dispositivo por CDP (la ventana de `--headless=new` no baja de ~500 px y falsea el ancho de
360). `tsc --noEmit` y `eslint` de los dos archivos, limpios.

| Ruta | 360 | 768 | 1032 | 1280 |
|---|---|---|---|---|
| `/login` | ✅ blanco, sin tarjeta, sin desborde | ✅ igual | ✅ igual (el mockup) | ✅ partido, tarjeta sobre azul |
| `/recovery` | ✅ azul, marca compacta, tarjeta | ✅ igual | ✅ igual | ✅ partido |

Se comprobó también el color del enlace de regreso (gris sobre blanco, blanco sobre azul) y
que solo hay un `h1` visible en cada ancho. No se miró el tema oscuro (estas pantallas pintan
su propio fondo y no llevan `dark:`) ni las pantallas que piden sesión o datos del paso
anterior (`/first-login`, `/security-questions`, `/reset-password`, `/reset-success`): usan
el mismo marco y la misma tarjeta, pero se mostraron sin abrirlas.

**Lo que se descartó.**

- **Un corte propio en 1033 px**: lo prohíbe §10.1; `xl` cubre la tablet sin salirse de la escala.
- **Sacar el título de cada paso fuera de la tarjeta**, en blanco, como en los mockups de la
  recuperación: `auth-ui.tsx` ya explica por qué va dentro (el texto oscuro sobre el azul se
  perdía) y el pedido para el resto del flujo era apilar, no rediseñar.
- **Los textos de los mockups** («Passcode», «Comenzar», «Validación de identidad»…): no se
  tocaron; el cambio es de maqueta.

**Pendiente al cierre.**

- El botón principal (`Button`, `py-2.5`) mide 40 px de alto; §10.4 pide 44 en el móvil para
  la acción principal. Es la pieza compartida de todo el sitio: cambiarlo es otra decisión.
- La intranet (`3001-intranet`, `features/login`) tiene el mismo diseño partido con sus propios
  cortes; no se tocó.
- Mirar `/first-login` y los pasos de recuperación con una cuenta real a 360 y 1032.

---

## sesión 09-10-2026 (2.ª parte): las cargas ya no duplican filas en las tablas maestras (migración 042)

**Qué se pidió.** Revisar que las cargas de «Programa + Sobresalientes», «Alertas de inversión»
y «Criterios» (tendencia ocupacional) no dupliquen datos en las tablas maestras —el ejemplo:
que `departamentos` no tenga «Vaupes» y «Vaúpes», «entendiendo que son 32 departamentos»— y
analizar esas tablas.

**Cómo se analizó.** El código de resolución de cada importador; los catálogos de Neon en
solo lectura (duplicados por nombre normalizado, distancia de edición ≤ 2, nombres que solo
cambian en artículos o sufijos societarios); y los Excel reales ya cargados
(`filesystem/cargas-datos/`), comparando códigos con nombres.

**Lo que se encontró.**

| Catálogo | Hallazgo |
|---|---|
| `departamentos` | Sin duplicados y bien protegido: los tres importadores y el alta manual resuelven por alias normalizado. Son **33** (32 + Bogotá D.C., código DANE 11), no 32 |
| `niveles_formacion`, `centros_formacion`, `programas_formacion` | Se resolvían por nombre exacto. «Tecnico» junto a «Técnico», un centro repetido con una errata, dos centros sin hechos. Y lo importante: **el nombre no identifica**. El Excel trae `Cod. Centro`, `Cod. Nivel` y `Cod. Programa` (el importador los ignoraba), y hay programas distintos con el mismo nombre: por nombre exacto se **sumaban** dos de ellos («Mantenimiento Electromecánico Industrial», 223201 + 223213) |
| `municipios` | Nombre exacto: «Medellín» y «Medellin» |
| `empresas` | Solo ignoraba mayúsculas: «Grupo Éxito» y «GRUPO EXITO» habrían sido dos |
| `ocupaciones`, CIIU, semillas de la tendencia | Sin duplicados: por código, con V3/V4 en la carga |

**La decisión.** La primera idea era deduplicar por nombre normalizado. Los códigos del Excel
lo descartaron: habría fundido programas que el SENA da como distintos. Se le preguntó al
usuario y eligió **el código SENA como identidad** de niveles, centros y programas. El nombre
normalizado queda solo donde la fuente no trae código (municipios y empresas).

**Lo que se hizo.**

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/042-catalogos-sin-duplicados.ts` (nuevo) + `index.ts` | `normalizar_nombre()` (gemela SQL de `normalizarParaComparar`); únicos sobre el nombre normalizado en `departamentos`, `municipios` y `empresas`; `CHECK` de los 33 códigos DANE; `codigo` con su único en niveles, centros y programas, sin los únicos por nombre; funde «Medellin»; borra 5 filas de catálogo sin hechos. Una transacción |
| API | `importar-programas-excel.usecase.ts` | Lee los cuatro códigos; exige que `Cod. Regional` sea el DANE del alias; rechaza códigos que se contradicen dentro del archivo; crea o actualiza los catálogos por código (`ON CONFLICT (codigo)`); agrupa las cohortes por código; borra lo que ningún hecho usa |
| API | `alertas-inversion.repository.ts`, `importar-excel.usecase.ts`, `crear-proyecto-manual.usecase.ts` | Empresas y municipios se resuelven con `normalizar_nombre()` en la consulta y devuelven si se crearon; el importador deja de repetir la búsqueda para contarlos |
| API | modelos de nivel, centro, programa, municipio y empresa; `shared/normalizar-texto.ts` | `codigo` en los modelos y los índices declarados al día; el normalizador avisa de su gemela |
| Docs | `11-base-de-datos.md`, `12-diccionario-de-datos.md` | D10 (identidad por la clave de la fuente), §4.6 y §4.7, I24 al día, I27 nueva, fila de la 042 y §9.5 con este análisis; fichas y cifras del diccionario |

**Cómo se probó.** Copia de Neon (ya con la 041) en un `postgres:18-alpine` desechable y la
API copiada al scratchpad sin `.env`.

| Prueba | Resultado |
|---|---|
| `up` de la 042 sobre la copia | ✅ hechos intactos (671; 21.663 certificados, 16.860 vinculados); 5 filas sin uso fuera; «Medellin» fundido con sus sedes |
| `normalizar_nombre()` frente a `normalizarParaComparar()` en los 1.201 nombres de la base y 17 casos difíciles | ✅ iguales salvo «Ā š», fuera del español, documentado |
| 8 intentos de duplicar («Vaupes» con otro código, un departamento 34, renombrar Vichada a «VAUPÉS», «MEDELLIN», «GRUPO  EXITO.», código SENA repetido, código no numérico) | ✅ los 8 rechazados |
| Válidos: «Medellín» en otro departamento, dos «Cocina» del mismo nivel con códigos distintos | ✅ |
| Importador real de sobresalientes con el Excel real | ✅ 672 hechos (los dos «Mantenimiento…» ya no se suman), mismos totales, 185 programas = 185 códigos, ninguna fila sin código |
| La misma carga otra vez; con un programa en mayúsculas | ✅ nada nuevo; solo cambia el nombre |
| Archivo que se contradice (código con dos nombres, regional con otro código, centro en dos regionales); «VAÚPES» | ✅ rechazado con la fila exacta y sin tocar nada; «VAÚPES» se resuelve |
| Importador real de alertas con empresas y ciudades en mayúsculas, sin tildes y con signos | ✅ 17 proyectos, 0 empresas y 0 municipios nuevos |
| Base vacía 001 → 042; `down` y `up` de la 042 | ✅ |
| `down` de la 042 sobre la copia ya recargada | Falla sin tocar nada (dos programas con el mismo nombre en un nivel), como dice la migración |
| `db:verificar` en las dos bases; `tsc --noEmit` | ✅ |

> **Trampa.** El nombre de un centro o de un programa del SENA **no lo identifica**: hay cinco
> «Centro de Comercio y Servicios» y dos «Apoyo administrativo en salud» (134507 y 134508).
> Cualquier cruce de datos del Observatorio va por código, nunca por nombre.

**Lo que se descartó.**

- **Deduplicar sobresalientes por nombre normalizado**: fundía programas distintos.
- **Resolver el departamento por `Cod. Regional` en vez de por alias**: el alias ya es el
  mecanismo de los tres importadores; el código se usa para comprobarlo.
- **`unaccent` para la función SQL**: es otra extensión que instalar en Neon y en el servidor,
  y no es `IMMUTABLE`; `translate` cubre el español y no depende del locale.

**Pendiente al cierre.**

- **Aplicar la 042 en Neon** (`npm run migrate`, reiniciar la API, `npm run db:verificar`) y
  **volver a subir el Excel de «Programa + Sobresalientes»** una vez: es lo que les pone código
  a los catálogos y separa los dos «Mantenimiento Electromecánico Industrial».
- El sitio no muestra el código del programa: dos programas del mismo centro con el mismo
  nombre se ven iguales.
- Un «municipio» llamado «Varios municipios» en Santander, y la empresa «Prueba 1» sin
  proyectos: decidir qué hacer con ellos.

---

## sesión 09-10-2026: revisión del esquema de la base — integridad, normalización e índices (migración 041)

**Qué se pidió.** Revisar todas las tablas, ver si se puede normalizar más y mejorar el
rendimiento, corregir lo que haga falta y dejar en `11-base-de-datos.md` qué información
guarda cada tabla. Primero el análisis, después las correcciones, al final el documento.

**Cómo se analizó.** Solo lectura sobre Neon (08-10-2026), en transacciones `READ ONLY`: el
catálogo (`pg_constraint`, `pg_index`, `information_schema`), los contadores de uso
(`pg_stat_user_tables`, `pg_stat_user_indexes`), ~40 consultas de coherencia sobre los datos
(duplicados, nulos, copias que no coinciden) y `EXPLAIN ANALYZE` del buscador ocupacional, el
listado de la bitácora, la matriz de cargas y la lectura de sobresalientes. Se contrastó cada
afirmación de `11` y `12` con lo que de verdad hay.

**Lo que se encontró.**

| Hallazgo | Gravedad |
|---|---|
| `UNIQUE` en `departamentos.nombre`, `niveles_formacion.nombre` y `ciiu_secciones.letra` documentados y **nunca creados**: la 026 y la 038 los pidieron con `unique: 'uq_…'` en `createTable`, que no crea nada | Alta: los importadores resuelven por nombre |
| Cuatro copias de datos (dependencias transitivas) sin nada que impida que se contradigan: `programas_sobresalientes.departamento_id` y `.nivel_formacion_id`, `proyectos_inversion.seccion_id`, `proyectos_inversion_ubicaciones.departamento_id`. Y `paginas.version_publicada_id` podía apuntar a la versión de otra página | Media (hoy coinciden en el 100 % de las filas) |
| `paginas_versiones.estado`, tres columnas de `usuarios`, `preguntas_seguridad.orden` y `auditoria_cambios.entidad_tipo` admitían `NULL`; esta última con `DEFAULT 'post'`, que su propio `CHECK` rechaza | Media |
| Dos índices únicos de correo; seis índices sin lecturas (tres en la tabla que se reescribe entera en cada importación); doce fechas y dos `id` sin `DEFAULT` en Neon | Baja (rendimiento y trampas de SQL plano) |
| Neon y una base nueva **no tienen el mismo esquema**: cuatro índices muy leídos solo existían en Neon (nombres de `sync`) y `_obsoleto_attachment` seguía viva en toda base nueva | Media: el servidor no tenía esos índices |
| `npm run respaldo`, el respaldo que el documento manda correr antes de migrar, tenía la lista de tablas de antes de la 005 y **fallaba en la primera** | Alta para quien vaya a migrar |
| `11-base-de-datos.md` describía tablas borradas (`contenidos`, `secciones`, `respaldos`…), invariantes de esas tablas, un mapa RF → tabla obsoleto y dos invariantes con el mismo número (I14) | Documental |

**Lo que se hizo.**

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/041-integridad-e-indices.ts` (nuevo) + `index.ts` | En una transacción propia: los cuatro `UNIQUE` (con `ciiu_clases.codigo`, la clave natural real); cinco FK compuestas con sus únicos de destino; `NOT NULL` y `DEFAULT`; `CHECK` de fecha de publicación, módulo de carga y correo en minúsculas; un solo único de correo; seis índices fuera, uno nuevo (`idx_sobresalientes_programa`) y cuatro unificados; `_obsoleto_attachment` fuera si está vacía. Funciona igual sobre Neon y sobre una base nueva (lo que depende de nombres de `sync` se resuelve por definición) |
| API | `models/ciiu-clase.ts`, `models/programa-sobresaliente.ts`, `repositories/alertas-inversion.repository.ts` | Los índices que declaran los modelos y un comentario, al día con la 041 |
| Scripts | `scripts/db/respaldo.ts` | Pide la lista de tablas a la base en cada ejecución |
| Scripts | `scripts/db/descripciones-tablas.ts` | Las siete tablas que le faltaban (alias y alertas) |
| Docs | `11-base-de-datos.md` | Reescrito: qué guarda cada una de las 33 tablas (§4), mapa de relaciones por dominio, invariantes renumeradas sin reutilizar números (I20–I26 nuevas, I5–I9 retiradas), mapa RF → tabla actual, migraciones 027/028/031/036/041 en §8.0, D6 y D9 nuevas, y la revisión completa en §9 |
| Docs | `12-diccionario-de-datos.md` | Cifras de cabecera reales, fichas afectadas por la 041, `secciones` retirada, FK compuestas en la matriz, y un «Alcance» que dice qué tablas no tienen ficha todavía |

**Cómo se probó.** Sin tocar Neon: una copia (`pg_dump` de solo lectura, sin los datos de la
bitácora ni de las preguntas de seguridad) restaurada en un `postgres:18-alpine` desechable, y
una API copiada al scratchpad, sin `.env`, contra esa base.

| Prueba | Resultado |
|---|---|
| `up` de la 041 sobre la copia de Neon; `down`; `up` otra vez | ✅ las tres |
| Base vacía migrada de la 001 a la 041 | ✅ |
| Comparar las dos bases por definición (restricciones, índices, columnas) | Iguales salvo nombres heredados de `sync` y `ON UPDATE CASCADE` sobre UUID: sin efecto |
| 15 intentos de romper las reglas nuevas (duplicados, copias incoherentes, página con versión ajena, publicado sin fecha, módulo desconocido, correo con mayúsculas…) | ✅ los 15 rechazados |
| 5 casos válidos: borrar la versión publicada deja la página sin puntero, mover un centro arrastra sus hechos, proyecto sin clase y sede sin municipio, `INSERT` en SQL plano sin fechas, login por índice | ✅ |
| Ciclo editorial con los casos de uso reales: crear sección, borrador, revisión, aprobar v1 y v2, rechazar v3, restaurar v1, eliminar la sección; escribir y listar la bitácora | ✅ en cada paso la publicada tiene fecha y es de su página |
| `db:verificar` en las dos bases | ✅ 23 modelos |
| Recarga de `programas_sobresalientes` (671 filas, mediana de 15), antes / después | 30,5 / 31,9 ms: igual dentro del ruido. Índices de la tabla: 496 → 352 kB |
| `npm run respaldo` arreglado, sobre la copia | ✅ 33 tablas |
| `tsc --noEmit` de la API | ✅ |

> **Trampa.** En `queryInterface.createTable`, `unique: 'uq_nombre'` (una cadena) **no crea
> ninguna restricción** y no avisa: solo `unique: true` lo hace. Para nombrarla, `addConstraint`
> o SQL. Después de migrar, comprobar en `pg_constraint`, no en el código de la migración.

> **Trampa.** Neon nació de `sequelize.sync()` y una base nueva de la 001: no son el mismo
> esquema aunque las dos tengan las mismas migraciones aplicadas. Una migración que quite o
> renombre algo creado por `sync` tiene que buscarlo por definición (como la 008), y conviene
> probarla en las dos.

**Lo que se descartó.**

- **Quitar las columnas copiadas** (tercera forma normal estricta): obliga a cambiar dos
  importadores y cada filtro; la FK compuesta da la misma garantía sin tocar código.
- **Quitar las FK simples** que la compuesta ya implica: se dejan, no cuestan y los diagramas
  las leen.
- **`tasa_vinculacion` como columna generada**: rompe el `bulkCreate` del importador. Y un
  `CHECK` que la compare con `vinculados / certificados` rechazaría una carga entera por una
  diferencia de redondeo del Excel. Queda en §9.4.
- **Conservar el único de `lower(email)` y cambiar el login a `lower(email) = …`**: cambia
  código; con el `CHECK` de minúsculas el único simple es equivalente y el login ya lo usa.
- **FK de `bloqueos_edicion` a `paginas`**: el latido de 45 s fallaría con error de base sobre
  un slug inexistente. El candado huérfano que hay (de una sección de prueba) está caducado y es
  inofensivo.
- **Renombrar los nombres heredados de `sync`** (`users_pkey`, `…_key61`): ruido sin efecto.
- **Fusionar «Tecnico» con «Técnico»**: es una decisión sobre los datos y debe ir con la
  normalización del nombre en el importador.

**Pendiente al cierre.**

- **Aplicar la 041 en Neon** (no lo hice): respaldo con `npm run respaldo -- <ruta.json>` (o una
  rama de Neon), `npm run migrate`, reiniciar `npm run dev` de la API y `npm run db:verificar`.
  Mientras no se aplique, el servidor de quien tenga este código se niega a arrancar. En el
  servidor la aplica `deploy.sh start`.
- Lo que quedó sin corregir, con su porqué, en `11-base-de-datos.md` §9.4: tasa de vinculación
  derivada, «Tecnico»/«Técnico», columnas sin uso (`layout`, `texto_alternativo`,
  `reemplazar`), el candado huérfano, el `CHECK` de entidades de la bitácora, el filtro por año
  de alertas y el coste lineal del listado de la bitácora.
- `12-diccionario-de-datos.md` no tiene ficha de 15 tablas (tendencia, `cargas_datos`, alertas).
- Los comentarios de `publicaciones.tsx` (sitio e intranet) citan la I5 y la tabla `contenidos`,
  que ya no existen.
- En Neon sobran dos filas en `migraciones_aplicadas` (nombres viejos de la 026 y la 040).

---

## sesión 07-10-2026: fase 0 del filesystem — verificación de punta a punta

**Cómo se probó.** En desarrollo, contra los servidores en marcha y sin escribir en la base.
En Docker, la pila de producción completa en este equipo con un `.env` de prueba (base propia,
semilla de contenido, una cuenta Superadmin de prueba), por nginx `8080`/`8081`.

| Prueba | Resultado |
|---|---|
| Desarrollo: la API lee `filesystem/`; el sitio reenvía `/uploads` y `/storage`; la intranet manda al login sin sesión; subir sin sesión | ✅ |
| `build` de las cuatro imágenes (incluye `next build` de las dos apps con los reenvíos nuevos) | ✅. Ninguna imagen de front trae `public/storage` |
| Subir por `/api/upload` (8080 y 8081), publicar, reemplazar: el viejo pasa a `backup/<página>/` | ✅ |
| Subida reemplazada antes de guardar: se borra del disco | ✅ |
| Servir: `immutable` en el sitio, `/backup/`, 404, `..` codificado | ✅ |
| Restaurar la versión anterior: los archivos se intercambian | ✅ |
| Intranet con sesión completa: 200 `private, no-cache`, `Range` 206, archivos migrados | ✅ (con una cuenta nueva, primero redirige a `/security-questions`: correcto) |
| Cargas: formato de solo lectura, fuentes futuras (el portal lee 3 registros), programas por la cola (el worker lee del filesystem), eliminar borra los Excel | ✅ |
| Recrear el contenedor de la API, `restart` de Redis (AOF activo, claves intactas), `down` + `up` | ✅ |
| `down -v` | Borró los volúmenes de la base, Redis y logs de prueba; **`olo-app_filesystem` quedó**, por ser externo |
| `deploy.sh restore-archivos` tras borrar un archivo a propósito | ✅ volvió |

**Error encontrado y corregido.** `deploy.sh migrar-archivos` creaba las carpetas y **copiaba 0
archivos**: el `cp` de BusyBox (imagen alpine) no copia nada con `cp -Rn origen/. destino/` si el
destino existe, y no da error. La simulación del 06-10 usó el `cp` de Git Bash, que sí lo hace.
En el servidor la mudanza habría terminado «bien» con el volumen vacío. Ahora copia archivo por
archivo; repetido dos veces, 14 y 14.

**Error encontrado, sin corregir (anterior a este cambio).** `seed/contenido-inicial.sql` inserta en
`configuraciones`, tabla que ya no existe: `deploy.sh sembrar` falla en una instalación nueva y,
como va en una transacción, no carga nada. Para la prueba se usó una copia sin ese bloque.

**Estado que quedó en este equipo:** imágenes `olo-web-app-*` construidas, pila apagada, volumen
`olo-app_filesystem` con los 14 archivos de la intranet más dos PNG de prueba del sitio.

---

## sesión 06-10-2026: los archivos subidos salen del webroot a un volumen de la API (§S1), y Redis con AOF

**Qué se pidió.** Un volumen de Docker para los PDF, imágenes, Excel y PowerPoint del
proyecto, que no se borre, organizado según la arquitectura. Y revisar el cambio de Redis a
AOF (`--appendonly yes`) que se había hecho en el compose.

**Lo que había.** Lo subido estaba repartido en tres carpetas del repositorio montadas en
los contenedores: `3000-sitio-web/public/storage`, `3001-intranet/public/storage` y
`4000-api-backend/uploads/cargas-datos`. Los route handlers `/api/upload` de los frontends
escribían en su `public/` y `/storage/[...ruta]` lo servía, en contra del §3.2 de la guía
(«ningún frontend toca el filesystem») y de §S1, que era la prioridad #1 pendiente de
seguridad. Catorce adjuntos de la intranet estaban versionados en git pese al `.gitignore`.

**Lo que se hizo.**

| Capa | Archivo | Cambio |
|---|---|---|
| API | `infrastructure/storage/filesystem.ts` | Nuevo. Raíz única (`FILESYSTEM_DIR`, por defecto `filesystem/` en la raíz del repo; `/filesystem` en la imagen) con `{sitio,intranet}/{uploads,backup}` y `cargas-datos/`. `resolverArchivoServible` decide qué se puede servir |
| API | `backup-uploads.service.ts` | `resolverDirectorioStorage` apunta al ámbito en el filesystem; fuera `CARPETA_DE_APP` y la resolución por profundidad de carpetas |
| API | `routes/archivos.routes.ts`, `controllers/archivos.controller.ts`, `use-cases/archivos/subir-archivo-de-pagina.usecase.ts` | Nuevos. `POST /api/archivos/{sitio,intranet}` (sesión + `puedeEditar`; antes bastaba cualquier sesión) y `GET /api/archivos/{ambito}/{uploads,backup}/...` (la intranet exige sesión + `puedeVer`). Montado antes del `limitadorGlobal` |
| API | `guardar-excel-de-carga.ts`, `eliminar-carga.usecase.ts`, `consultar-fuentes-futuras-actual.usecase.ts`, `scripts/archivos/*` | Los Excel de las cargas en `cargas-datos/`. `archivos.ruta_relativa` conserva `uploads/cargas-datos/…`: la base de dev es compartida |
| Fronts | `app/api/upload/route.ts`, `app/storage/[...ruta]/route.ts` (las dos apps) | Borrados. `next.config` reenvía `/api/upload`, `/uploads`, `/backup`, `/backend` y `/storage` a la API. El `DELETE` de esos handlers no lo llamaba nadie y no se trasladó |
| Docker | `docker-compose.servidor.yml`, `nginx.servidor.conf`, `Dockerfile` de la API, `.dockerignore` | Volumen `olo-app_filesystem` (externo: `down -v` no lo borra) solo en la API; sitio e intranet sin volúmenes. nginx 8080 manda los adjuntos directo a la API; las dos puertas, `/api/upload`. Los formatos de carga, montados de solo lectura |
| Docker | `deploy.sh` | Crea el volumen si falta; `migrar-archivos` (copia, no mueve, sin pisar; lee las carpetas de antes y, en un equipo de desarrollo, `filesystem/`); `backup` deja también `archivos_<fecha>.tar.gz`; `restore-archivos` |
| Dev | `scripts/sincronizar-paquetes-locales.mjs` | Paso 6: en `npm run dev` copia una vez lo de las carpetas de antes a `filesystem/` y deja una marca |

**Nombre.** El 07-10-2026, antes de desplegarlo y a pedido del usuario, pasó a llamarse
`filesystem` como en el diagrama de capas: volumen `olo-app_filesystem`, carpeta `filesystem/`,
variable `FILESYSTEM_DIR`, montaje `/filesystem` y módulo `filesystem.ts`. La carpeta que ya había
creado `npm run dev` en este equipo se renombró con sus 14 archivos y sus marcas.

**Caché.** Sitio, `uploads/` con nombre UUID: `public, max-age=31536000, immutable`. El resto
del sitio, `public, no-cache` con ETag/304. Intranet, `private, no-cache`. Se quita la CSP de
helmet en los archivos: su `object-src 'none'` puede dejar en blanco el visor de PDF, y solo
se sirven tipos de la lista blanca, con `nosniff`.

**Redis.** El `--appendonly yes` era correcto, pero la indicación que lo acompañaba no:
`deploy.sh restart` no aplica cambios del compose (hace falta `start`), y un Redis que arranca
con AOF sin tener todavía el archivo AOF **empieza vacío**: no lee el RDB que tenía. La guía
lleva el paso seguro (`CONFIG SET appendonly yes` en caliente antes de `start`).

**Probado** con un filesystem temporal y la API en un puerto libre, sin base ni Redis
(token `isLocal`): 29 casos, 28 a la primera. Servir con tipo, caché y CORP correctos,
`Range` 206, 404 sin caché, `..` codificado de tres formas, byte nulo y `cargas-datos/` en
404, intranet 401 sin sesión y 200 con ella, subida con nombre UTF-8, tipo falso 415, sin
archivo 400. El que falló fue el 304: el `fetch` de Node añade `cache-control: no-cache` a
una petición condicional; repetido con curl, 304 por ETag y por fecha. El paso 6 del script de `npm run dev`, en una copia falsa de
la intranet y la API. `tsc --noEmit` limpio en API, sitio e intranet. No probado: los
comandos de `deploy.sh` que levantan contenedores (Docker no estaba encendido en este equipo)
y un `next build`.

**Queda.**
- En el servidor, la actualización de una sola vez de `docker/guia-bash.md`, en orden.
- Sacar de git los 14 adjuntos de la intranet cuando todos los equipos hayan pasado por
  `npm run dev` o `migrar-archivos`. Hoy son la fuente de esa copia.
- Antivirus (§S1) y comprobar el estado de publicación antes de servir (RF-12): un archivo de
  un borrador se puede pedir si se conoce su UUID.

---

## sesión 03-10-2026 (3.ª parte): «Fuentes futuras de empleo» deja de ser un Excel quemado en disco y entra al ciclo de cargas

**Qué se reportó.** Que los archivos de `4000-api-backend/uploads/cargas-datos/` están
«quemados», a propósito de que toda carga de Actualizaciones debería limpiar su registro al
eliminarse.

**Lo que había.** Comprobado contra la base de dev (Neon) y el disco, los cinco Excel de esa
carpeta:

| Archivo | Estado |
|---|---|
| `0d1653a2…` (data2.xlsx) | Registrado — carga de tendencia viva |
| `5e42b9a8…` (formato-alertas-inversion.xlsx) | Registrado — carga de alertas viva |
| `c6a34897…` (Programas sobresalientes…) | Registrado — carga de programas viva |
| `b43c28b7…` | **Huérfano**: en disco, sin fila en `archivos` |
| `fuentes-futuras-de-empleo.xlsx` | **Quemado**: leído por nombre fijo, versionado en git, fuera del ciclo |

El mecanismo que se pedía **ya existía y funciona**: `eliminarArchivoSiQuedaSuelto` borra fila
y archivo, y lo comparten las tres cargas con cola. Lo que fallaba era lo que nunca entraba a
ese ciclo:

1. `consultar-fuentes-futuras-actual.usecase.ts` buscaba tres nombres fijos en disco y servía
   el primero que encontrara. Sin tarjeta en Actualizaciones, cambiar los datos del portal
   pedía reemplazar el archivo a mano y hacer commit (de ahí su excepción en `.gitignore`).
2. Nada limpiaba los huérfanos de `cargas-datos/`. La base de dev es compartida y la carpeta
   `uploads/` es de cada máquina: cuando alguien elimina una carga desde su equipo, la fila
   desaparece para todos y el Excel solo de *su* disco. En las demás queda sin dueño, porque
   ya no hay registro desde el que llegar a él. El único script que había
   (`limpiar-huerfanos-uploads.ts`) cubre los adjuntos de páginas, no esta carpeta.

**Lo que se hizo.** El módulo pasa al mismo ciclo que las demás tarjetas, sin crear tablas: el
Excel sigue siendo el dato, pero ahora es el de la **carga vigente**.

| Capa | Archivo | Cambio |
|---|---|---|
| API | `repositories/fuentes-futuras-empleo.repository.ts` | Nuevo. `cargas_datos` con `modulo = 'fuentes_futuras_empleo'`; `obtenerVigente` es la última completada |
| API | `use-cases/observatorio/fuentes-futuras/leer-excel-fuentes-futuras.ts` | Nuevo. Lectura por nombre de encabezado (no por posición), desde ruta o buffer; valida columnas y tope de 20 000 filas |
| API | `use-cases/observatorio/fuentes-futuras/consultar-fuentes-futuras-actual.usecase.ts` | Movido desde `observatorio/`. Resuelve la ruta por la carga vigente; caché de una entrada por ruta + `mtime` |
| API | `use-cases/observatorio/fuentes-futuras/{iniciar,listar,eliminar}-*.usecase.ts` | Nuevos. Subir valida **antes** de guardar; eliminar reusa `eliminarArchivoSiQuedaSuelto` |
| API | `controllers/fuentes-futuras-empleo.controller.ts` | Nuevo; el handler público sale de `ObservatorioController` |
| API | `routes/observatorio.routes.ts` | `GET/POST /fuentes-futuras-empleo/cargas` y `DELETE …/cargas/:id`, tras `requireAuth` + `puedeActualizarDatos` |
| API | `use-cases/observatorio/guardar-excel-de-carga.ts` | Opción `requiereCola` (por defecto `true`): esta carga no encola nada, así que no exige Redis |
| API | `use-cases/observatorio/formatos-de-carga.ts` + `uploads/formatos-carga/formato-fuentes-futuras.xlsx` | Formato de ejemplo descargable, generado del Excel real (encabezados + 3 filas) |
| API | `scripts/archivos/limpiar-huerfanos-cargas.ts` + `npm run cargas:limpiar-huerfanos` | Nuevo. Reporte por defecto, `--aplicar` para borrar; respeta la lista `PROTEGIDOS` |
| Sitio | `actualizaciones/components/carga-fuentes-futuras.tsx` + `hooks/use-cargas-fuentes-futuras.ts` + servicio y tipos | Tarjeta nueva. Sin barra de progreso: la respuesta del POST ya trae la carga terminada |
| Sitio | `actualizaciones/components/historial-cargas-grid.tsx` | `descripcionEliminar` opcional: aquí borrar **sí** cambia lo público, y el diálogo lo dice |
| Sitio | `actualizaciones/components/actualizaciones-view.tsx` | Vuelve la tarjeta, ahora con funcionalidad (el 01-10 se quitó el cartel «Próximamente», que no hacía nada) |

**Probado de punta a punta** con Postgres 18 desechable (40 migraciones), copia del backend en
el scratchpad y la API en el 4100 — sin tocar Neon, el dev ni Redis:

| Caso | Resultado |
|---|---|
| Público sin ninguna carga | 25 registros del respaldo heredado |
| Subir Excel válido | 201, 3 filas; el público pasa a las 3 nuevas |
| Subir Excel sin las columnas | 422 con el detalle de cuáles faltan, **sin** dejar archivo ni fila |
| Segunda carga | El público pasa a la nueva; historial con las dos |
| Eliminar la vigente | `cargas_datos` −1, `archivos` −1, Excel fuera del disco; el público vuelve a la anterior |
| Mismo Excel subido dos veces | 1 fila en `archivos`, 2 cargas; borrar una devuelve `archivoEliminado: false` y conserva el Excel |
| Eliminar la última | El público vuelve al respaldo heredado |
| `DELETE` de id inexistente / `POST` sin sesión | 404 / 401 |
| Descargar `formatos/fuentes-futuras` | 200 con `Content-Disposition`; `otro` y `..%2F..%2Fpackage.json` siguen en 404 |
| `cargas:limpiar-huerfanos` | Reporta 2 huérfanos y protege el heredado; con `--aplicar` los borra |

`tsc --noEmit` y `eslint` limpios en API y sitio.

> **El respaldo heredado sigue vivo a propósito.** `ARCHIVO_HEREDADO` lee
> `fuentes-futuras-de-empleo.xlsx` solo cuando no hay ninguna carga, para que el portal no se
> quede en blanco en los ambientes donde todavía nadie ha subido el Excel por el panel. Se
> retira —junto con la excepción del `.gitignore` y la lista `PROTEGIDOS` del script— cuando
> el archivo esté cargado en todas partes.

**Queda.** Borrar el huérfano real de este equipo:
`npm run cargas:limpiar-huerfanos -- --aplicar` (reporta `b43c28b7…`, 10 KB). No se corrió:
borrar es irreversible y es decisión del usuario.

---

## sesión 03-10-2026 (2.ª parte): por qué un Administrador no veía «Editar» y el botón pasa a llamarse «Editar página»

**Qué se reportó.** Con `dtejada@sena.edu.co` (rol Administrador) el lápiz flotante salía,
pero sin la opción de editar. La duda era si faltaban permisos o si había caché de por medio.

**No era ninguna de las dos.** Comprobado contra el dev real:

| Qué se miró | Resultado |
|---|---|
| Permisos del rol Administrador en la base | 28 claves: `acceso.sitio`, `acceso.intranet` y **todas** las de edición — 11/11 del sitio, 7/7 de la intranet |
| `/api/me` con un usuario real de ese rol | 200, devuelve las 28; el rol sale de la fila, no del token |
| Caché del navegador (`permisosDeLaSesion`, 60 s) | Se anula ante un 401; reproducido el peor caso —abrir el sitio sin sesión y que aparezca después, sin recargar— y el botón salió al instante |
| Caché del servidor (`require-permission`, 30 s) | Se invalida al escribir permisos, y `/api/me` ni la usa |

**Lo que pasaba de verdad.** `/clasificacion` y `/programas-sobresalientes` **no son secciones
de la base**: son páginas React escritas a mano. No tienen clave `editar.sitio.<slug>` en el
catálogo, así que nadie —Administrador incluido— puede editarlas con Puck, y el botón no se
pinta. Las 11 que sí son secciones (`inicio`, `empleo`, `tendencias`, `publicaciones`,
`metrica`, `cno`, `cuoc`, `politica-de-privacidad`, `mapa-del-sitio`, `alertas-inversion`,
`menu-y-pie`) salen bien: verificadas una a una en el navegador con la sesión de ese usuario.

| App | Archivo | Cambio |
|---|---|---|
| Sitio | `features/paginas/secciones/components/paginas-fab-speed-dial.tsx` | «Editar sección» pasa a «Editar página» —tooltip, `aria-label` y `title`—, como «Nueva página» y «Eliminar página» del mismo menú. La intranet se queda en «sección», que es coherente con las suyas |

> **Trampa, y lo que confundió.** Con rol Superadmin el botón **sí** aparece en esas dos rutas:
> `puedeEditarSeccion` corta por `esSuperadmin` sin mirar si el slug es una sección. Llevaría a
> un editor sin página detrás —la API responde 404 a `clasificacion` y a
> `programas-sobresalientes`—. No se tocó: el atajo existe porque `CLAVES_DEL_CATALOGO` es una
> lista fija de secciones de fábrica, así que quitarlo dejaría al superadmin sin poder editar
> las secciones creadas después. Arreglarlo pide preguntarle a la API si el slug existe.

**Hallazgo suelto.** `diego@sena.edu.co` recibe `401 Sesión cerrada por inactividad` (la API
corta a los 20 minutos, `MINUTOS_DE_INACTIVIDAD_API`). En una página pública el cliente atrapa
ese 401 y llama a `cerrarSesionLocal()`, que borra las cookies sin avisar y sin redirigir: el
lápiz desaparece entero y sin explicación. Es otro síntoma distinto del de arriba.

**Cómo se verificó sin contraseñas.** Chrome headless por CDP contra el dev, firmando tokens de
prueba con el `JWT_SECRET` local (la cuenta de `LOCAL_AUTH_*` y el id de un usuario real). Todo
lecturas; el único efecto fue refrescar `last_access_at`, lo mismo que navegar. Los tokens y el
perfil de Chrome se borraron al terminar.

**Pendiente al cierre.** Decidir si el botón debe esconderse para superadmin en rutas que no son
secciones, y si el cierre por inactividad debe avisar en vez de vaciar la interfaz.

---

## sesión 03-10-2026: la franja blanca bajo el panel y el punto de los desplegables

**Qué era.** En cualquier sección del panel sobraba una franja blanca al final: la ventana
entera hacía scroll por debajo del marco, que mide exactamente una pantalla. El panel está
pensado para que lo único que se desplace sea su `<main>`.

**Por qué pasaba.** `.sr-only` —las etiquetas que solo oye un lector de pantalla— es
`position: absolute`. Sin un ancestro posicionado, su bloque contenedor era `<body>`, no el
`<main>` que las contiene en el árbol. Y `overflow` solo recorta a los descendientes de los
que uno es bloque contenedor: cada `.sr-only` se quedaba en su posición estática —el final
del contenido, bastante más abajo que la pantalla— sin que el `overflow-y: auto` del
`<main>` la tocara, y estiraba el alto del documento. Como `.sr-only` está repartida por
todo el panel, el síntoma salía en todas las secciones.

| App | Archivo | Cambio |
|---|---|---|
| Sitio | `shared/ui/organisms/sidebar-layout.tsx` | `relative` en el `<main>`: pasa a ser el bloque contenedor de sus `.sr-only`, que vuelven a entrar en su recorte |
| Sitio | `shared/ui/molecules/custom-select.tsx` | Fuera el punto de cada opción del desplegable; queda solo el texto. La elegida se sigue distinguiendo por su fondo |

**Verificado** en Chrome headless contra el dev real (sesión de `LOCAL_AUTH_*`), ventana de
784 px de alto:

| Ruta | Documento antes | Documento después |
|---|---|---|
| `/admin/actualizaciones` | 1.306 px (sobran 522) | 784 px |
| `/admin/dashboard`, `/admin/users`, `/admin/auditoria`, `/admin/respaldos`, `/admin/revision` | — | 784 px, sin sobrante |

El scroll interno del `<main>` sigue intacto (p. ej. 1.444 px de contenido sobre 784 de
caja en Actualizaciones). `tsc --noEmit` limpio.

> **Trampa.** Un `overflow` no recorta a un descendiente `position: absolute` si no es su
> bloque contenedor. Cualquier caja con scroll que vaya a contener `.sr-only`, un menú
> absoluto o un tooltip necesita `position: relative`. Se descartó tocar `.sr-only` en
> `globals.css`: la receta (incluida la de Tailwind) es `position: absolute`, y cambiarla
> arrastraría a las dos apps y a las páginas públicas por un problema que es del contenedor.

**Pendiente al cierre.** No se revisó si otras cajas con scroll del proyecto —la columna de
la barra lateral, los modales con listas largas— tienen el mismo descuido.

---

## sesión 02-10-2026: botón «Salir de modo edición» y tooltips en el botón flotante

**Qué era.** El botón flotante del lápiz (`PaginasFabSpeedDial`) solo abría el menú de
acciones; quien editaba no tenía cómo salir de ese modo sin ir al panel. Se añade, debajo del
lápiz, un botón rojo de salir y se rotulan con tooltip los botones que no lo tenían.

| App | Archivo | Cambio |
|---|---|---|
| Sitio | `features/paginas/secciones/components/paginas-fab-speed-dial.tsx` | Botón «Salir de modo edición» siempre visible bajo el lápiz: `cerrarSesionLocal()` y recarga de la misma página, así el portal queda como lo ve un visitante. Tooltip «Opciones de edición» en el lápiz («Cerrar opciones» con el menú abierto; se quitó su `title` para no duplicar) |
| Intranet | `features/paginas/secciones/components/paginas-fab-speed-dial.tsx` | Igual, pero la salida hace `POST /api-backend/logout` y lleva a `/login?logout=1`, como el resto de salidas de la intranet |
| Ambas | `style/globals.css` | `.fab-speed-dial--con-salir` (columna), `.fab-speed-dial__btn--salir` (rojo `#b3261e`, icono blanco) y tooltip rojo para salir y para eliminar |

> **Trampa.** El menú desplegable está anclado con `bottom: calc(100% + …)` al contenedor;
> al apilar un segundo botón debajo, el contenedor creció y el menú quedaba flotando lejos del
> lápiz. Con `--con-salir` el ancla es `calc(100% - 3.5rem + 0.85rem)` (3.5 rem = alto del
> lápiz). Si se cambia el tamaño del lápiz hay que tocar las dos cifras.

**Descartado.** Usar `useAuth().logout` en la intranet: importar `features/login` desde
`features/paginas` cruza una frontera entre módulos; se llama al endpoint directamente, como
ya hace `login-view.tsx`. También se probó `#ff1f1f` para el botón y se volvió al rojo
anterior a petición del usuario.

**Pendiente al cierre.** No se probó en el navegador: solo `tsc --noEmit` sin errores en los
dos componentes.

---

## sesión 29-09-2026: módulo "Alertas de inversión" — carga de Excel, alta manual y sitio público

**Qué era.** La tarjeta "Alertas de inversión" de "Actualizaciones" llevaba desde la migración
`027-cargas-datos` como "Próximamente", sin Excel ni esquema. Se implementa completo: dos
catálogos nuevos, la tabla de hechos, las dos vías de entrada de datos (Excel y formulario
manual) y la página pública `/alertas-inversion` con el gráfico por sector.

| App | Archivo | Cambio |
|---|---|---|
| API | `infrastructure/db/migrations/038-alertas-inversion-catalogos.ts` | `ciiu_secciones` (A–U, semilla de las 21), `ciiu_clases`, `empresas` (única por `lower(nombre)`), `municipios` (catálogo **abierto**, a diferencia de `departamentos`) |
| API | `infrastructure/db/migrations/039-alertas-inversion-proyectos.ts` | `proyectos_inversion` (mismo ciclo `borrador/en_revision/publicado/rechazado` de `paginas_versiones`) y `proyectos_inversion_ubicaciones` (puente N:M, calcado de `roles_permisos`) |
| API | `infrastructure/db/models/{ciiu-seccion,ciiu-clase,empresa,municipio,proyecto-inversion,proyecto-inversion-ubicacion}.ts`, `models/index.ts` | Modelos nuevos y sus asociaciones, estilo `Departamento`/`CentroFormacion` (snake_case, sin `field:`) |
| API | `policies/alertas-inversion.policies.ts`, `middlewares/permisos.middleware.ts` | Familia de policy propia (`requierePermisoAlertasInversion`), no la de Observatorio: mismos roles (superadmin/administrador) pero módulo distinto |
| API | `repositories/alertas-inversion.repository.ts` | Cargas sobre `cargas_datos` con `modulo='alertas_inversion'` (reutiliza la tabla, no la duplica); resolución/creación de empresa y municipio; consultas del gráfico y el listado público |
| API | `use-cases/alertas-inversion/*` | `importar-excel.usecase.ts` (agrega, no vacía-y-recarga: cada fila es una noticia independiente; omite filas cuya "Fuente" ya esté registrada); `iniciar-carga`/`procesar-carga` (reutilizan `validarYGuardarExcel` de Observatorio); `crear-proyecto-manual`; `consultas-publicas` (gráfico, listado, opciones) |
| API | `infrastructure/redis/queue.ts` | Nuevo `job.name = 'importar-alertas-inversion-excel'` en la cola `heavy-jobs` |
| API | `routes/alertas-inversion.routes.ts`, `controllers/alertas-inversion.controller.ts`, `validators/alertas-inversion.validators.ts`, `app.ts` | `/api/alertas-inversion/{grafico,listado,opciones}` públicos; `/cargas`, `/formatos/plantilla`, `/proyectos` tras `requireAuth` |
| API | `use-cases/observatorio/formatos-de-carga.ts`, `uploads/formatos-carga/formatdata-alertas-inversion.xlsx` | Formato nuevo: Código, Actividad, Departamento, Ciudad, Empresa, Fecha, Fuente, Descripción, Tipo, Inversión COP, Empleos estimados, Medio |
| Sitio | `features/administracion/actualizaciones/components/carga-alertas-inversion.tsx` | Reemplaza la tarjeta "Próximamente": botón "Cargar Excel" + botón "Agregar manualmente", reutiliza `BarraDeProgreso` e `HistorialCargasGrid` tal cual |
| Sitio | `features/administracion/actualizaciones/components/formulario-proyecto-inversion.tsx` | Modal (`Alert`) con el formulario de alta manual, mismo patrón que "Nuevo Usuario" |
| Sitio | `features/administracion/actualizaciones/{hooks,services,types}.ts` | `use-cargas-alertas-inversion.ts`, funciones de servicio y tipos nuevos |
| Sitio | `features/sitio-web/alertas-inversion/*`, `app/(public)/alertas-inversion/page.tsx` | Página pública: gráfico de barras por sector (`echarts`, sin envoltorio — no está `echarts-for-react` entre las dependencias) con clic para filtrar, y listado paginado |

**Pendiente conocido.** El catálogo completo de clases CIIU (cientos de códigos del DANE) no
viene seedeado — solo las 21 secciones. Hasta que alguien lo cargue, el importador resuelve el
sector por letra de sección o por el nombre exacto de "Actividad"; un código de clase de 4
dígitos solo funciona si ya existe en `ciiu_clases`.

**Verificado.** `tsc --noEmit` limpio en la API y en el sitio; `eslint` limpio en los archivos
nuevos del sitio (dos avisos de `react-hooks/set-state-in-effect` corregidos). No se aplicó la
migración contra Neon ni se probó en el navegador — falta `npm run migrate` (lo deja el usuario,
ver `migraciones-en-neon-no-las-aplico.md`) y levantar Redis para el worker de `heavy-jobs`.

---

## sesión 28-09-2026: autoguardado del editor

**Qué era.** El usuario abría el editor, se le cerraba por error y perdía todo: el borrador
solo se guardaba al pulsar «Guardar borrador». Pide que ese mismo guardado ocurra solo, con
el intervalo que se recomiende.

**Cuándo guarda.** Cada **30 s** si hay cambios (intervalo fijo, no «30 s después de dejar
de escribir»: con una espera que se reinicia, quien edita sin pausas no guardaría nunca), al
**ocultarse la pestaña** y al **desmontarse el editor** sin pasar por «Salir» (el «atrás»
del navegador). Al cerrar o recargar la pestaña no se puede guardar —el navegador corta la
petición y `keepalive` no admite más de 64 KB—, así que el navegador **pregunta antes** si
queda algo pendiente. Treinta segundos: como mucho se pierde medio minuto, y como mucho son
dos guardados por minuto (cada uno sanea el árbol, escribe en la bitácora y gasta del
límite de 30 escrituras/min). WordPress guarda cada 60 s; Google Docs, al instante.

**No guarda** con un guardado o envío en curso, con un diálogo abierto (un autoguardado a la
vez que un envío podía devolver a borrador la versión recién enviada), sin candado, ni con
la versión **en revisión**: guardar encima la saca de la cola de quien aprueba, y eso lo
decide una persona pulsando «Guardar». Tras un fallo no reintenta hasta el siguiente cambio.

**Decisión del usuario: acción propia en la bitácora.** `autoguardar_borrador`, aparte de
`guardar_borrador` (que se lee «el usuario guardó»): mismo criterio que el 23/9 con los
guardados que nadie pulsó. Frase: «El editor guardó automáticamente el borrador · versión N
de «slug»». En el panel, «Autoguardado», con su propia opción en el filtro de acción (dentro
de «Edición» taparía lo que sí decidió una persona).

| App | Archivo | Cambio |
|---|---|---|
| API | `migrations/040-auditoria-autoguardado.ts` (+ `index.ts`) | Suma `autoguardar_borrador` al `CHECK` de `auditoria_cambios`. Al revertir, las filas pasan a `guardar_borrador` |
| API | `validators/paginas.validators.ts`, `controllers/pagina.controller.ts` | `POST /:slug/borrador` acepta `automatico: true`: mismo guardado, se registra como `autoguardar_borrador` |
| API | `use-cases/paginas/guardar-borrador.usecase.ts` | Con `automatico`, **409** si la última versión está en revisión (cubre el editor abierto en dos pestañas). Y **bug previo**: la limpieza de subidas corría antes del COMMIT, así que no veía la imagen recién metida en el borrador y podía borrarla del disco; ahora va en `afterCommit` (también al enviar a revisión) |
| API | `auditoria-resumen.ts`, `auditoria-categorias.ts`, `auditoria-dto.ts`, `listar-en-revision.usecase.ts`, `content-audit-log.ts`, OpenAPI | Verbo, frase, categoría editorial y autor de respaldo en la cola de revisión |
| Panel | `administracion/auditoria/types.ts` | Etiqueta «Autoguardado», píldora `brand`, opción de filtro propia |
| Sitio e intranet | `edicion/hooks/use-autoguardado.ts` (nuevo, gemelos) | El intervalo, la pestaña oculta, el desmontaje y el aviso antes de cerrar |
| Sitio e intranet | `edicion/components/puck-editor-wrapper.tsx` | Usa el hook; la cabecera dice «Guardando…», «Sin guardar» o «Guardado a las 10:42 a. m.» (`.olo-editor-aviso--guardado`, blanco atenuado, ~9:1). El guardado antes del cierre por inactividad también va como autoguardado, y marca la salida para que el aviso del navegador no frene la redirección al login |
| Sitio e intranet | `edicion.service.ts`, `use-pagina.ts` / `use-editor-actions.ts` | Pasan `automatico`. Los errores de guardado muestran el mensaje de la API y no el de axios; en el sitio, un guardado nuevo retira el aviso anterior (la intranet ya lo hacía) |

**Verificado.** `tsc` limpio en la API, el sitio y la intranet; `eslint` limpio en lo tocado
(queda el `any` que ya había en la normalización de `puck-editor-wrapper.tsx` del sitio).
La frase y la categoría nuevas, probadas con `ts-node` sin base. **La migración 040 no se ha
aplicado a ninguna base**: sin ella, cada autoguardado falla por el `CHECK` (la transacción
se deshace y el editor lo muestra como error). Sin probar en el navegador.

**Pendiente.**
- Aplicar la 040 (`npm run migrate` en `4000-api-backend`) y reiniciar la API de dev.
- Probar en el navegador: que abrir el editor sin tocar nada no autoguarde (si Puck
  apuntara algo en la historia al montar, crearía un borrador solo por abrir una página
  publicada); cambiar de pestaña con cambios; «atrás» del navegador; cerrar con cambios
  (debe preguntar); versión en revisión (no debe autoguardar); dos pestañas.
- `12-diccionario-de-datos.md` sigue con la lista de acciones de antes de la 031.

**Nota del merge con `BACKUP/main` (29-09-2026).** Las alertas de inversión trajeron sus
propias 038 y 039, así que la migración del autoguardado se renumeró a **040**
(`040-auditoria-autoguardado`). El runner identifica cada migración por su nombre: si la
antigua `038-auditoria-autoguardado` llegó a aplicarse en alguna base, la 040 vuelve a
correr sin efecto (recrea el mismo `CHECK`).

---

## sesión 27-09-2026: la pantalla de Auditoría del panel, igual que Respaldos

**Qué era.** Tras limpiar Respaldos, el usuario pasa a Auditoría y pide los mismos ajustes,
empezando por el botón de depurar.

| App | Archivo | Cambio |
|---|---|---|
| Panel | `auditoria/components/auditoria-view.tsx` | El botón «Depurar auditoría» del encabezado pasa a «Depurar» (lo cambió el usuario) y deja el fondo rojo: solo el texto y el icono en rojo (600; 400 en oscuro), con un tinte suave al pasar el ratón o tocar. Mismas clases que «Depurar» de Respaldos; conserva su papelera (se quitó por error y se devolvió: el usuario se refería a la del modal) |
| Panel | `auditoria/components/modal-depurar-auditoria.tsx` | Sale por `createPortal` al `<body>` con el fondo de `Alert` (`bg-[#0f172a]/40 backdrop-blur-sm`, antes `bg-black/60` dentro de la columna): la página entera se ve borrosa y la barra mobile queda debajo. Por debajo de `lg` deja libre `--navegacion-mobile-alto` y la caja mide como máximo `100dvh − 2rem − barra`. Medido a 360 × 650 y 1280 × 800: `blur(8px)`, z 50 sobre la barra, sin scroll lateral |
| Panel | ídem | Cabecera sin el cuadro con la papelera: quedan el título, el subtítulo y la X. Siguen las papeleras del «Paso 2» y de «Confirmar y eliminar registros» |
| Panel | `auth/components/panel-general.tsx` | «Actividad reciente» del dashboard: celdas de `py-3.5` a `py-2`, como las de Auditoría y Respaldos (el encabezado sigue en `py-3`) |
| Panel | `auth/components/usuarios-view.tsx`, `roles-view.tsx` | Filas de Usuarios (de `py-4`) y de Roles y permisos (de `py-3.5`) a `py-2`. Los encabezados y las filas de «cargando» y «sin datos» no cambian. `roles-view.tsx` ya tenía un error de lint (`any` en la línea 305) y dos avisos de dependencias, ajenos a esto |
| Panel | `auditoria/components/auditoria-view.tsx` | Tabla con la misma altura que la de Respaldos: celdas `py-2` (estaban en `py-1.5`) y encabezado `py-3.5` (estaba en `py-3`) |
| Sitio y panel | `shared/ui/molecules/paginacion.tsx`, `paginador.tsx` | Pie de las tablas: a la izquierda solo «Mostrando X-Y de Z»; a la derecha anterior/números/siguiente, «Ir a la página N de M» y, al final, **«Filas por página»** (antes iba junto al «Mostrando», en 12 px y más bajo). El selector y el campo de «Ir a la página» miden lo mismo que las casillas (32 px; 36 desde `sm`), con su borde, radio y paleta (`panel` o `publico`); el campo medía 2 px más. Con una sola página solo se ve «Filas por página». Afecta a las 8 tablas con `Paginador` (Auditoría, Usuarios, Roles, Revisión, actividad reciente y las tres tablas públicas); el historial de cargas usa `Paginacion` sin filas por página y no cambia. Medido a 360/768/1280, claro, oscuro y tono público: mismos altos y sin scroll lateral |
| Sitio y panel | `shared/ui/molecules/custom-select.tsx`, `paginacion.tsx` | «Filas por página» deja el `<select>` nativo (su lista la dibuja el navegador, sin bordes) por `CustomSelect`, con tres opciones nuevas: `compacto` (alto de las casillas, radio `rounded-lg`, flecha sin círculo y opciones sin el punto de la derecha: solo el número, con su hover y el fondo del elegido), `paleta` (el borde y fondo del botón cerrado; aquí, los de las casillas del tono) y `abrirArriba` (va al pie de la tabla). Los 21 `CustomSelect` de filtros no cambian: sin esas opciones pintan lo mismo que antes (medido: 44 px y radio 16). La lista abierta tiene borde, esquinas y sombra; el nombre accesible del botón lleva el valor («Filas por página: 15») |
| API | `use-cases/auditoria/analizar-depuracion-auditoria.usecase.ts` | **La retención pasa de 6 meses a 1 año**: se conserva el último año y se depura lo anterior. La fecha de corte sale de `fechaCorteDepuracion()` y el tamaño por fila de `BYTES_POR_REGISTRO_SQL`, los dos exportados desde aquí para que el análisis y el borrado no puedan discrepar (antes cada uno repetía el cálculo). El análisis añade `totalUltimoAnio` y `pesoUltimoAnioBytes` (una sola consulta con `COUNT/SUM … FILTER`) |
| API | `use-cases/auditoria/ejecutar-depuracion-auditoria.usecase.ts` | La comprobación dentro de la transacción usa la misma fecha de corte de un año. Sin cambios de ruta ni de permisos |
| API | `repositories/auditoria.repository.ts` | Comentario: «la depuración de seis meses» → «de un año» |
| Panel | `auditoria/services/auditoria.service.ts` | `AnalisisDepuracionAuditoriaDTO` con `totalUltimoAnio` y `pesoUltimoAnioBytes` |
| Panel | `auditoria/components/modal-depurar-auditoria.tsx` | Aviso «Criterio de retención de 1 año» con la fecha de corte de la API. Fuera la tarjeta «Fecha de corte» y «Espacio estimado»; quedan «Registros a depurar» (cantidad y tamaño), «Registros del último año» y «Registros de más de un año» (tamaño y cantidad). Botón limpio (sin fondo) «Exportar registros a depurar»: baja el mismo CSV que el Paso 1 y cuenta como su respaldo. El Paso 2 decía siempre «los 10 registros respaldados»: ahora dice los que son. Etiquetas de las tarjetas en bloque con `leading-tight` (a 360 px partían en dos líneas muy separadas) |
| Panel | ídem | Segunda pasada a pedido del usuario: el aviso pasa a «Importante: Se conserva el último año de la bitácora donde se depuran los registros posteriores con respaldo obligatorio previo en CSV.» (texto del usuario; ya no muestra la fecha de corte, que sigue en el mensaje de «no hay nada que depurar») y la cabecera queda solo con el título. Fuera «Exportar registros a depurar». Los dos pasos (tarjetas con icono) pasan a una línea «Descargar primero tu respaldo *» con un botón de solo texto verde (`#4C7A1C`, `#9ED65C` en oscuro; el `#7DB728` como texto sobre blanco no se lee: 2.42:1) y un tinte de ese verde al pasar el ratón o tocar; la línea del respaldo va sin caja (ni fondo ni borde) y el texto de las tres tarjetas, centrado. Última versión: la línea dice «Descarga aquí el Logs de respaldo *» y el botón es solo el icono (44 × 44) sobre `#7DB728`, pegado al texto, con el icono en blanco a pedido del usuario (2.42:1, bajo el 3:1 que pide un icono en `9-accesibilidad.md` §2.1; lo compensan el texto de al lado y el nombre accesible «Descargar el respaldo CSV»). Tras descargar, el icono pasa a una palomita sola (`Check`), sin círculo. El borrado sale de la tarjeta y va al pie, como en Respaldos: «Cancelar» y un botón rojo «Depurar N registros», deshabilitado hasta descargar el respaldo. En el móvil, márgenes menores, el icono del botón rojo oculto y el pie en dos filas a 320 px. Medido a 320/360/768/1280: ningún botón se sale ni parte su texto |

**Verificado.** `tsc` limpio en la API y el panel, `eslint` limpio en el panel. La consulta nueva se
probó en un Postgres 18 desechable (`docker`, puerto 55433, borrado al acabar) con cuatro filas
de 2 años, 13 meses, 11 meses y 1 día: 2 a depurar, 2 del último año, 300 bytes (167 + 133,
igual que la suma fila a fila). El modal se pintó con datos de ejemplo a 360 y 1280 px sin
scroll lateral. **La API de dev no recarga sola**: hay que reiniciarla para ver los tamaños
nuevos; sin reiniciar, las tarjetas del último año saldrían vacías (0 B). No probado con sesión.

**Datos de prueba en Neon (pendiente de borrar).** Para ver el modal con algo que depurar
(no había ningún registro real de más de un año: el más antiguo era del 05/08/2026), el usuario
corrió un script que copia 150 registros reales al azar con fechas de 13 a 30 meses atrás, todos
con `user_agent = 'olo-datos-de-prueba-depuracion'`. Se borran con
`DELETE FROM auditoria_cambios WHERE user_agent = 'olo-datos-de-prueba-depuracion'`; si se
depuran desde el panel, se van esos mismos, porque son los únicos de más de un año.

---

## sesión 27-09-2026: auditoría de la intranet, fase 3: comentarios, código muerto y basura

**Qué era.** Fase 3 de la auditoría por partes (fase 1 la API, fase 2 el sitio web,
sesiones anteriores): comentarios, código muerto y carpetas obsoletas, ahora en
`3001-intranet`. Inventario en
`auditorias/2026-09-27-intranet-comentarios-y-codigo-muerto.md` (no versionado);
corregido todo, sin decisiones pendientes del usuario en esta fase.

**De entrada, más limpia que el sitio web:** `tsc --noEmit` normal ya daba 0 errores
(no había ningún bug de tipos como el de `puck.config.tsx` del sitio) y `eslint src`
daba 0 errores, sin `react-hooks/set-state-in-effect` ni `any`. El `tsconfig.json` ya
tiene `strict: true` (el del sitio, `false`).

**Código muerto:** 16 avisos de `noUnusedLocals`/`noUnusedParameters` (sin contar el de
`ancho` en `texto-rico.tsx`, del paquete compartido, ya anotado en la fase 2 — mismo
archivo, no se repite el hallazgo). Entre ellos, `BLOQUES_COMUNES` en `puck.config.tsx`:
un array de 14 nombres de componentes declarado y nunca usado en el resto del archivo.
Mismo hallazgo que en el sitio web: `SeccionPestanasLaterales` se mencionaba en dos
sitios de `puck.config.tsx` sin que exista ese componente en ningún catálogo; se
quitaron las dos menciones.

**Dos archivos de una fase anterior al editor actual, nunca conectados, borrados:**
`use-pagina.ts` y `editorjs-wrapper.tsx` traían comentarios `TODO: Fase 3`/`TODO: Fase
6` de un plan anterior a Puck — el segundo renderiza literalmente un `<div>` que dice
"Editor.js (stub) — instalar @editorjs/editorjs para activar". El editor real ya es
Puck; ninguno de los dos se importaba desde ningún componente, solo se reexportaban sin
consumidor en `features/paginas/index.ts`. Se borraron los dos archivos y sus exports.

**Un `console.log` suelto en `src/proxy.ts`** (el middleware): registraba cada sesión
sin `acceso.intranet` en el log del contenedor, un caso normal, no una avería. Quitado.

**Archivos que nadie importa:** 7 candidatos, los 7 falsos positivos verificados uno por
uno (convención de Next, barrels por carpeta). El caso interesante fue `src/proxy.ts`:
no es un archivo sin usar, es que Next 16 renombró el middleware a `proxy.ts` y lo carga
por convención de nombre, igual que `page.tsx`/`layout.tsx`, sin que nada lo importe
explícitamente.

**Carpetas:** el hallazgo de `public/storage/{uploads,backup}` (14 archivos de la
intranet) ya se resolvió junto con el del sitio web en la fase 2, mismo commit y misma
regla de `.gitignore`. `public/docs/images/blog/` (436 KB) se revisó y no es basura: es
la imagen por defecto de `TarjetaArticulo` en `puck.config.tsx`.

**Verificado:** `tsc --noEmit` normal, 0→0. `noUnusedLocals`, 16→0 propios de la
intranet. `eslint src`, 0→0. Cero referencias a los dos archivos borrados en todo el
repositorio. Sin finales de línea mezclados.

**Pendiente al cierre:** ninguno propio de esta fase. Las tres fases de la auditoría por
partes (API, sitio web, intranet) quedan cerradas.

---

## sesión 27-09-2026: el modal «Depurar versiones antiguas» sin redundancia, sin saltos y con el fondo borroso de los demás

**Qué era.** En el móvil, el modal de Respaldos abría con un alto y crecía al llegar el
análisis; al crecer, la barra de abajo lo cortaba. El usuario pidió además quitar el icono
de basura y el subtítulo de la cabecera, dejar los nombres de página limpios (sin
«(/menu-pie)» ni «(intranet)») y que el fondo fuera el borroso de todos los modales, como
el de crear usuario.

| App | Archivo | Cambio |
|---|---|---|
| Panel | `respaldos/components/modal-depurar-versiones.tsx` | Sale por `createPortal` al `<body>` con el fondo de `Alert` (`bg-[#0f172a]/40 backdrop-blur-sm`, antes `bg-black/60` dentro de la columna del panel): la barra mobile ya no le queda encima y la página entera se ve borrosa. Por debajo de `lg` el fondo deja libre `--navegacion-mobile-alto` y la caja mide como máximo `100dvh − 2rem − barra`; lo que no cabe hace scroll dentro |
| Panel | ídem | Mientras llega el primer análisis se reserva el hueco del detalle por página (esqueleto de 112 px): la caja abre con su alto y no crece al cargar |
| Panel | ídem | Cabecera solo con el título y la X: fuera el icono de basura y «Libera espacio en la base de datos…» |
| Panel | ídem | El aviso «Respaldo siempre protegido» pasa arriba del todo y los filtros (ámbito y página) debajo de él |
| Panel | `respaldos/components/respaldos-view.tsx` | El botón «Depurar» del encabezado deja el fondo rojo: solo el texto y el icono en rojo (600; 400 en oscuro), con un tinte suave al pasar el ratón o tocar |
| Panel | ídem | Columna «Página» en una sola línea: título, etiqueta del ámbito y «· versión N». Fuera el `/slug` |
| Panel | ídem | Fuera el filtro «Página» (buscador por título o slug), con su campo `busqueda` y la función `normalizar`: quedan ámbito, editor, publicador y fechas |
| Panel | ídem | Tabla más compacta: celdas de `py-3` a `py-2` y el botón del ojo de `p-1.5` a `p-1.25` (la fila más alta pasa de 54 a 44 px; el usuario probó varias alturas y eligió esta); encabezado de `py-3` a `py-3.5` (un poco más alto) |
| Panel | ídem | Selector de página y detalle por página con el título solo. Si dos páginas se llaman igual (p. ej. «Inicio» del sitio y de la intranet), esas dos llevan « · Sitio web» / « · Intranet» para distinguirse |

**Verificado.** Render con datos de ejemplo y la barra del panel, en Chrome headless: a
360 × 650 la caja mide 538 px cargando y con datos (no salta) y termina 16 px por encima
de la barra; a 360 × 800, 768 × 1024 y 1280 × 800 cabe sin scroll lateral; el fondo es
`blur(8px)` con z 50 sobre la barra. `tsc` y `eslint` limpios. No probado en el móvil con
sesión.

**Pendiente.** `auditoria/components/modal-depurar-auditoria.tsx` es gemelo y tiene el
mismo fondo `bg-black/60` sin portal.

---

## sesión 27-09-2026: auditoría del sitio web, fase 2: comentarios, código muerto y basura

**Qué era.** Fase 2 de la auditoría por partes que pidió el usuario (fase 1 fue la API,
sesión anterior): mismos tres frentes —comentarios, código muerto, carpetas obsoletas—
aplicados a `3000-sitio-web`. Se entregó primero el inventario
(`auditorias/2026-09-27-sitio-web-comentarios-y-codigo-muerto.md`, no versionado) y se
corrigió todo salvo dos cosas fuera de alcance (abajo).

**Dos bugs de seguridad, no solo código muerto.** Al preguntar por qué dos imports
estaban "sin usar", resultó que la función existía para arreglar algo y nunca se llegó a
llamar:

- `conCabecerasDeCliente` (reenvía la IP real del visitante a la API) estaba importada
  pero nunca invocada en `shared/lib/backend-proxy.ts` —el BFF genérico de **12 rutas**:
  alertas, auditoría, permisos, roles, usuarios…— ni en
  `app/api/auth/first-login/route.ts`. Sin ella, esas peticiones salían con la IP del
  contenedor de Next y el límite de tasa por IP se volvía un cubo compartido por todos
  los visitantes. Corregido en los dos archivos.
- `getSessionPermissionsSnapshot()` (`shared/lib/session.ts`) pedía `/api/me` —que trae
  el rol resuelto desde la fila, fresco en cada petición— pero descartaba `user.role` y
  devolvía el de la cookie, fijado al iniciar sesión. Es la misma brecha que ya se cerró
  en la API ("Rol tomado del JWT", tabla de `3-seguridad-del-proyecto.md`), pero seguía
  abierta en el gate del editor del frontend. Corregido: `user?.role ?? session.role`.

**Un bug real de tipos, no cosmético.** `tsc --noEmit` —el normal del proyecto, sin
flags— fallaba con 2 errores en `puck.config.tsx`, y `next.config.mjs` no tiene
`typescript.ignoreBuildErrors`, así que esto tumbaba `npm run build`. Causa: el tipo de
Puck para `categories` es una intersección que hace que `Object.entries()` devuelva
`unknown`. Se anotó a mano la forma real de cada entrada. `tsc --noEmit` pasó de 2
errores a 0.

**Código muerto:** 27 avisos de `noUnusedLocals`/`noUnusedParameters` (sin contar los 2
de `conCabecerasDeCliente`, que eran el bug de arriba). `panel-general.tsx` tenía 6 en un
archivo — al revisarlo entero, dos eran funciones con sentido (`mensajeDeRevision`,
`colorDiasRestantes`) que nadie llamaba, no solo líneas sueltas. `ROLES_QUE_EDITAN`
estaba duplicada, sin usar, en dos archivos.

**5 archivos que nadie importaba, borrados:** `shared/lib/dashboard.ts`,
`shared/lib/blocks/{resaltar,intranet-hero,intranet-topbar,seccion-pestanas-laterales}.tsx`.
Se confirmó que la intranet tiene sus propias versiones reales y en uso de tres de ellos
— las del sitio web eran sobrantes de un cruce entre apps que nunca se conectó aquí.
`seccion-pestanas-laterales` además se mencionaba por nombre en una categoría de
`puck.config.tsx` sin estar registrada; se quitó también esa mención.

**Basura: `public/storage/backup/` y `public/storage/uploads/` iban al repositorio.** 69
archivos en el sitio + 14 en la intranet, 45 MB (adjuntos reales de páginas, con nombre
UUID). A diferencia de los Excel del backend, aquí no hay tabla con deduplicación por
hash que reconstruya el archivo si falta. El usuario confirmó que son pruebas de cuando
se armaba el editor: se borran de git y de disco en las dos apps, con la regla nueva en
`.gitignore`. `data_temporal/` (el catálogo CNO provisional) se revisó y está bien como
está, documentado en su propio comentario.

**Encontrado, no corregido:** el prop `ancho` de `TextoRico`
(`packages/blocks-renderer`) no hace nada — el render ignora la prop y siempre usa el
mismo ancho fijo. No se corrigió por no saber qué valores de diseño corresponden a cada
opción. Y 11 errores de ESLint (`react-hooks/set-state-in-effect` en tres vistas, un
`any` en `footer.tsx`) quedan fuera de esta auditoría: no son comentarios, código muerto
ni basura, y corregirlos puede cambiar el orden de renders.

**Verificado:** `tsc --noEmit` normal, 2→0 errores. `noUnusedLocals`, 27→2 avisos (los 2
que quedan son el bug de `ancho`, sin tocar, y `intranet-hero.tsx`, que se borró
entero). Cero referencias a los 5 archivos borrados en todo el repositorio. Sin finales
de línea mezclados.

**Pendiente al cierre:** el `git rm` de `public/storage/{uploads,backup}` en las dos
apps lo corre el usuario — el control de permisos de la sesión volvió a bloquear el
borrado, igual que con `/api/jobs` en la fase 1. Fase 3 (la intranet) cuando el usuario
lo pida.

---

## sesión 27-09-2026: la navegación mobile se oculta al bajar y vuelve al subir; el círculo del activo se ve al tocar (5.ª parte)

**Qué era.** El usuario pidió poder ocultar la barra de abajo con doble clic en la página.
Se le propuso otra cosa y la eligió: **ocultarla al bajar por la página y mostrarla al
subir**, con el dedo o con la rueda. Además, al ver el círculo del activo (4.ª parte)
dijo que no envolvía el icono: en el móvil no hay `:hover`, así que al tocar un destino no
se veía nada hasta cargar la página nueva, y con «Más» nunca.

| App | Archivo | Cambio |
|---|---|---|
| Las dos | `shared/lib/mobile/use-ocultar-al-bajar.ts` (nuevo, uno por app) | `useOcultarAlBajar`: escucha el `scroll` en captura (en el panel se desplaza el `<main>`, en la intranet la página) y atiende al contenedor que ocupa la pantalla; ignora listas pequeñas, diálogos y la hoja. La decisión va aparte, en `siguienteEstado`, sin React |
| Las dos | `shared/lib/mobile/navegacion-mobile.tsx` | Clase `es-oculta` según el hook; con la hoja abierta no se oculta, y al cambiar de página vuelve a verse |
| Las dos | `style/globals.css` | `.es-oculta` baja la barra lo que mide más 4rem (el logo sobresale 49 px); con el foco dentro vuelve; con «reducir movimiento» se desvanece |
| Las dos | `style/globals.css` | Corrección del usuario al verlo: el resaltado no es un círculo en el icono sino una **pastilla que envuelve icono y texto** (el destino entero, hasta 76 px, radio 1rem), con el activo, al tocar (`:active`), con su hoja abierta (`aria-expanded`) y con el ratón. El icono vuelve a su caja de 2rem; el logo y las etiquetas quedan donde estaban (medido: logo y = 659, etiquetas en la misma línea) |
| Intranet | `style/globals.css` | El hueco que el `<body>` reserva para la barra se pinta `#001631` (sombra interior del tamaño del hueco): al ocultarse la barra quedaba una franja blanca bajo el pie. En el móvil, sin la línea que separaba las columnas del pie; se deja el espacio |

| Panel | `style/globals.css` | Al ocultarse la barra quedaba una **franja blanca fija** al pie de la pantalla: la reserva de 72 px está en la columna, fuera del `<main>` que hace scroll. Con la barra oculta (y sin foco dentro) la reserva pasa a 0 con `body:has(.navegacion-mobile.es-oculta…)`. Medido con el CSS real: visible 72 px, oculta 0, oculta con foco 72 |

| Panel | `panel-general.tsx` (`ModalAlertas`) | Cada alerta sin fondo ni borde: solo la etiqueta («Por vencer», «En revisión») y el texto en el mismo color que ella (ámbar o azul 900; 100 en oscuro). El botón de marcar como solucionada lleva una flecha a la derecha en vez de la palomita, `type="button"` y nombre accesible (`aria-label`; antes solo `title`). La caja pierde su alto mínimo de 22rem (medía 352 px aunque hubiera dos alertas): ahora mide lo que su contenido, hasta el 88 % de la pantalla, con la lista en scroll; relleno menor en el móvil (`px-5 py-4`, `sm:` como antes) |

| Las dos | `style/globals.css` | La lista de la barra pasa de 72 a 80 px de alto (`--navegacion-mobile-alto` con ella, así que la reserva también es de 80). El botón del centro baja su relleno a 0.9375rem y el logo se separa 1rem de su etiqueta: medido a 320/360/768, etiquetas en la misma línea y el logo sobresale los mismos 49 px |
| Las dos | `style/globals.css` | La pastilla del destino se separa del borde de la barra: margen vertical de 0.25rem a 0.5rem, así que queda a 8 px arriba y abajo y mide 64 px (antes 72, pegada a 4 px). El logo del centro baja 12 px (`margin-bottom` de 1rem a 0.25rem, `margin-top` de -3.5625rem a -2.8125rem): sobresale 37 px y queda a 6 px de su etiqueta. Medido a 320/360/768 en claro y oscuro: etiquetas en la misma línea (y 749), sin scroll lateral. Se corrige el comentario de `.navegacion-mobile-inicio` que explica sus 15 px (margen 0.5rem + relleno 0.25rem + (3.5rem − 3.125rem) / 2). Aviso: el servidor de desarrollo de la intranet no recogió el cambio del logo y siguió sirviendo el CSS viejo hasta que el archivo se volvió a modificar |

> **Aviso:** en una vuelta intermedia se quitó la línea de arriba de la barra por error (el
> usuario se refería a la del pie). Se devolvió tal cual estaba en `HEAD`.

**Reglas de la decisión:** 12 px seguidos en una dirección para cambiar (los temblores del
dedo no la hacen parpadear); arriba del todo y al final siempre visible, lo que cubre
también el rebote elástico del iPhone.

**Se descartó el doble clic:** no se descubre, en el móvil el doble toque selecciona texto
o hace zoom (y iOS no lanza `dblclick` de forma fiable), se dispara sin querer al tocar dos
veces un botón y no se puede hacer con teclado ni lector de pantalla.

### Verificado

| Qué | Resultado |
|---|---|
| `tsc --noEmit` y `eslint` de `shared/lib/mobile` | Intranet sin errores; sitio, solo los 2 de siempre en `puck.config.tsx` |
| `siguienteEstado` con 7 recorridos (dedo lento, temblor, rueda, inercia, rebote arriba, final con rebote, subir y volver a bajar), en las dos apps | Los 7 dan lo esperado |
| CSS compilado del sitio | Salen `.es-oculta`, la variante sin movimiento y el círculo con `:active` y `aria-expanded` |
| El dev de las dos apps | Ya servía el círculo de 40 px de la 4.ª parte |
| El desplazamiento real con el dedo en un celular | **No se probó**: sin sesión no se llega a las pantallas. Queda para el usuario |

---

## sesión 27-09-2026: en el móvil de la intranet, «Salir» arriba y «Buscar» abajo; el activo de la barra es un círculo que envuelve el icono (4.ª parte)

**Qué era.** Tres pedidos del usuario sobre la navegación mobile: en la intranet,
intercambiar «Salir» (estaba abajo) y la lupa (estaba arriba), y dejar arriba a la
izquierda el nombre «Intranet»; quitar el `justify-content: center` de `.intranet-brand`;
y que el resaltado del destino activo (y del ratón) envuelva el icono, en el panel y en la
intranet.

| App | Archivo | Cambio |
|---|---|---|
| Intranet | `shared/lib/mobile/navegacion-mobile-intranet.tsx` | «Buscar» ocupa el sitio de «Salir» (y su fila en «Más»); abre el buscador de la barra de arriba con `onBuscar`. La prop `onLogout` sale |
| Intranet | `shared/lib/blocks/plantilla/intranet-topbar.tsx` | Pasa `onBuscar`. La alineación de la marca elegida en Puck va en variables (`--marca-horizontal`, `--marca-ancho-minimo`) y no en `justifyContent`/`minWidth` en línea, que no se podían anular desde el CSS. `aria-label` «Cerrar sesión» con tilde |
| Intranet | `style/globals.css` | Por debajo de `lg`: nombre a la izquierda (sin el logo, que ya está abajo, y siempre pegado a la izquierda) y el botón de salir a la derecha, redondo de 44 px y sin la píldora blanca; la lupa se oculta. En escritorio, igual que antes |
| Intranet | `public/assets/svg/mobile/` | Nuevo `buscar.svg` (provisional, mismo trazo que los demás); fuera `salir.svg`, que ya nadie usaba |
| Las dos | `style/globals.css` | `.navegacion-mobile-icono` pasa de píldora de 56 × 32 a círculo de 40 px (8 px de aire en los cuatro lados; a 320 px la píldora se salía 1 px de su casilla). Para que las etiquetas sigan en la misma línea y el logo no se mueva, el botón del centro baja su relleno a 0.4375rem y el logo se separa 1rem de su etiqueta |

### Verificado

| Qué | Resultado |
|---|---|
| `tsc --noEmit` y `eslint` de la intranet | Sin errores |
| Barra de arriba de la intranet (React SSR + CSS real, por HTTP) a 1024 y 1280, antes y después, con 4 menús distintos | Mismas cajas, estilos y capturas píxel a píxel |
| Marca centrada en Puck | A 1280, `center` y 180 px como antes; a 360, a la izquierda |
| Móvil a 320/360/768 | Arriba «Intranet» y salir; abajo Tasa · Matriz · logo · Encuestas · Buscar. Sin scroll horizontal, también con un nombre de 47 letras (se recorta con «…») |
| Círculo del activo, panel a 320 y 360 | Las cinco etiquetas en la misma línea (y = 757) y el logo en el mismo sitio que antes (y = 659); los círculos caben en su casilla |
| Con sesión real | **No se miró**. Queda para el usuario |

---

## sesión 27-09-2026: la navegación mobile sale del paquete compartido; cada frontend la tiene en su carpeta `mobile/` (3.ª parte)

**Qué era.** La barra de abajo de la 2.ª parte se hizo como paquete (`packages/navegacion-movil`,
con su CSS importado desde los dos `globals.css`), siguiendo la frase de §10.5 que mandaba
a `packages/` toda pieza que usaran las dos apps. El usuario lo corrigió: la navegación
mobile va **separada en cada frontend**, en una carpeta que diga `mobile`, con los iconos
en `public/assets/svg/mobile/` (no «barra-inferior») y los estilos en el `globals.css` de
cada app. Encaja con `1-guia` §4.4: `packages/` es para reglas que se deciden igual, y la
interfaz lleva la identidad de cada app.

| Capa | Archivo | Cambio |
|---|---|---|
| Panel | `src/shared/lib/mobile/navegacion-mobile.tsx` (nuevo) | `NavegacionMobile`: la barra y su hoja (`<dialog>`), con `next/link` directo; sin la prop `Enlace` ni `style`, que el panel no usa |
| Panel | `src/shared/lib/mobile/navegacion-mobile-panel.tsx` (nuevo), `index.ts` | `NavegacionMobilePanel`: los destinos que estaban dentro de `panel-general.tsx` (Accesos · Revisión · logo → Dashboard · Auditoría · Más) |
| Panel | `panel-general.tsx`, `sidebar-layout.tsx`, `notification.tsx` | Montan `<NavegacionMobilePanel pendientesRevision>`; la prop `barraInferior` pasa a `navegacionMobile`; `--navegacion-mobile-alto` |
| Panel | `src/style/globals.css` | Sección «NAVEGACIÓN MOBILE DEL PANEL»: estructura, paleta clara y oscura y la reserva de la columna. Fuera el `@import` del paquete |
| Intranet | `src/shared/lib/mobile/navegacion-mobile.tsx` (nuevo), `navegacion-mobile-intranet.tsx` (antes `blocks/plantilla/barra-inferior-intranet.tsx`), `index.ts` | La misma barra, con `style` para el fondo elegido en Puck, y `NavegacionMobileIntranet`, que la arma con el menú de la plantilla |
| Intranet | `intranet-topbar.tsx`, `config/puck.config.tsx` | Importan de `@/shared/lib/mobile`; el campo del editor se llama «Icono en la navegación del móvil» (las props guardadas, `icono` y `etiquetaMovil`, no cambian) |
| Intranet | `src/style/globals.css` | Sección «NAVEGACIÓN MOBILE DE LA INTRANET»; el `<body>` y el botón flotante usan `--navegacion-mobile-alto`. Fuera el `@import` |
| Intranet | `public/assets/svg/barra-inferior/` → `public/assets/svg/mobile/` | Los seis iconos provisionales, sin cambios |
| Las dos | `package.json`, `package-lock.json`, `next.config` | Vuelven a como estaban en `HEAD`: sin la dependencia ni `transpilePackages` |
| Repo | `packages/navegacion-movil/` | Borrado, con sus copias en `node_modules/@olo/` |
| Docs | `2-convenciones` §10.5, `1-guia` §4.3/§4.4, `scripts/mapa/descripciones.md` | La regla nueva (una pieza de interfaz no sube a `packages/`; lo del móvil va en `mobile/`) y las carpetas |

Nombres: clases `navegacion-mobile-*` y variables `--navegacion-mobile-*`, en vez de
`olo-barra-inferior-*`, `olo-hoja-inferior-*` y `--olo-barra-*`. Cada `globals.css` declara
toda su paleta, así que los valores por defecto de los `var(…, …)` sobraban y se quitaron.
El comentario del logo decía «5 × 5.5rem» y «sobresale 3.5rem»; medido: círculo de 80 × 80 px
que sobresale 49 px.

> **Aviso: las dos copias se parecen a propósito.** Un arreglo en la barra de una app se
> revisa en la otra. El auditor no lo marca como duplicación: está en `excepciones.md`.

### Verificado

| Qué | Resultado |
|---|---|
| `tsc --noEmit` | Intranet sin errores; sitio, solo los 2 de siempre en `puck.config.tsx:2233` |
| `eslint` de lo tocado | 0 errores; los avisos son los que ya tenían `panel-general.tsx` y `puck.config.tsx` |
| Antes/después con el CSS real de cada app y React (SSR): 12 estados (Dashboard, Revisión con 3 y 120, hojas «Más», «Accesos» y «Encuestas», tema oscuro, fondo de Puck, menú largo) a 320/360/768/1024 | Mismas cajas y mismos estilos calculados en los 48 casos; 47 capturas idénticas píxel a píxel |
| Iconos de la intranet servidos por HTTP (por `file://` Chrome no carga las máscaras) | Salen de `assets/svg/mobile/`; estilos y cajas iguales en los 20 casos. Las capturas que difieren cambian de caso en cada pasada: ruido de captura, no del cambio |
| Referencias a lo viejo en el código | Ninguna (`navegacion-movil`, `barra-inferior`, `olo-barra`, `olo-hoja-inferior`) |
| Panel e intranet reales con sesión | **No se miraron**: piden sesión. Queda para el usuario |

**Pendiente al cierre:**

- Mirar con una cuenta real la barra en el móvil (abrir y cerrar la hoja, Escape, «Salir»).
- Si en el editor de la plantilla se escribió a mano un icono con `/assets/svg/barra-inferior/…`,
  cambiarlo a `/assets/svg/mobile/…`. Sin elegir nada, cada sección toma el suyo solo.

---

## sesión 27-09-2026: el panel y la intranet se navegan como una app en el móvil (barra inferior con el logo al centro) (2.ª parte)

> **Rehecho en la 3.ª parte (arriba):** ya no hay paquete `navegacion-movil`; cada app tiene
> su navegación en `src/shared/lib/mobile/` y los iconos están en `public/assets/svg/mobile/`.

**Qué era.** Por debajo de 1024 px el panel escondía sus secciones tras una hamburguesa que
sacaba la barra lateral, con avisos y cuenta arriba; la intranet desplegaba su menú debajo
de la barra superior. Se pidió que las dos se vean como una app: **barra de navegación
abajo**, al alcance del pulgar, con los iconos del panel, el logo de OLO sin texto y, arriba,
solo buscar y el modo nocturno. Decisiones del usuario, tomadas con una maqueta delante:
el logo va **en el centro de la barra** como botón de inicio; el panel lleva **cuatro
destinos a la vista + «Más»**; la intranet, **solo buscar arriba** (no tiene modo oscuro, ver
Pendiente); y la intranet lleva **iconos provisionales** que el usuario cambiará.

| Capa | Archivo | Cambio |
|---|---|---|
| Paquete nuevo | `packages/navegacion-movil/` (`@olo/navegacion-movil`) | `BarraInferior`: destinos a los lados del logo, contador de pendientes, y una hoja desde abajo (`<dialog>` nativo) para los que tienen hijos. `barra-inferior.css`: estructura y la variable `--olo-barra-inferior-alto`; los colores, con `--olo-barra-*` que pone cada app. Se oculta desde `lg` por CSS |
| Panel | `shared/ui/organisms/sidebar-layout.tsx` | Fuera el menú lateral deslizable del móvil: la barra lateral es `hidden lg:flex`; la columna reserva el hueco de la barra (`olo-reserva-barra-inferior`) |
| Panel | `features/administracion/auth/components/panel-general.tsx` | Arriba en el móvil: a la izquierda, el nombre de quien está conectado con un desplegable (Mi perfil, Cerrar sesión; esquinas de arriba rectas, pegado a la barra) y la campana de notificaciones suelta a su lado; a la derecha, buscar y tema (todo a 44 px). Abajo: Accesos (hoja: Usuarios, Roles) · Revisión (con contador) · **logo → Dashboard** · Auditoría · Más (Actualizaciones, Respaldos, Configuración) |
| Panel | `shared/ui/molecules/dropdown.tsx` | El «clic fuera» mira el menú entero y no solo su botón (ver abajo); cierra también con Escape |
| Panel | `style/globals.css` (tema oscuro) | El logo del centro en blanco sobre un círculo oscuro (`--olo-barra-logo-fondo`, `--olo-barra-logo-filtro`), como hace la barra lateral con `dark:brightness-0 dark:invert` |
| Panel | `shared/ui/molecules/notification.tsx` | El aviso sale por encima de la barra en el móvil |
| Panel | `style/globals.css` | `@import` del CSS del paquete y colores de la barra en claro y oscuro |
| Intranet | `shared/lib/blocks/plantilla/barra-inferior-intranet.tsx` (nuevo) | Arma la barra con el **mismo menú de la plantilla** (Puck): «Inicio» pasa al logo; Tasa · Matriz · Encuestas (hoja con sus dos encuestas) · Salir. Con más de tres secciones, las que sobran van a «Más» |
| Intranet | `shared/lib/blocks/plantilla/intranet-topbar.tsx` | Exporta `ItemMenuIntranet` (con `icono` y `etiquetaMovil`), quita la hamburguesa y monta la barra inferior |
| Intranet | `config/puck.config.tsx` | Dos campos por enlace del menú: icono (el selector que ya existía, `campoIcono`) y texto corto para el móvil |
| Intranet | `style/globals.css` | Por debajo de `lg` la barra de arriba es solo el buscador (44 px); colores de la barra en el azul de la intranet; `body` reserva el hueco; el botón flotante de edición sube por encima de la barra. Fuera las reglas de la hamburguesa |
| Intranet | `public/assets/svg/barra-inferior/*.svg`, `public/assets/svg/olo-logo-none.svg` | Iconos **provisionales** (tasa, matriz, encuestas, salir, más, sección) y el logo sin texto, que la intranet no tenía |
| Las dos | `package.json`, `package-lock.json`, `next.config` | Dependencia `file:../packages/navegacion-movil` y `transpilePackages` |

**Cómo se cambian los iconos de la intranet.** Reemplazando el archivo en
`3001-intranet/public/assets/svg/barra-inferior/` con el mismo nombre: se pintan como
máscara (`IconoRenderer` de `@olo/blocks-renderer`), así que toman el color de la barra sea
cual sea el del SVG. O, por enlace, eligiendo otro en el editor de la plantilla («Icono en
la barra inferior del móvil»). Sin elegir nada, cada sección toma el suyo por la primera
parte de la ruta (`/tasa` → `tasa.svg`), y la que no está en la lista, `seccion.svg`.

**Por qué un paquete y no dos copias.** §10.5 de `2-convenciones`: lo que necesitan las dos
apps con el mismo comportamiento va a `packages/`. El corte es el de `@olo/inactividad`:
el comportamiento (cuántos destinos, la hoja, el foco, qué se anuncia) es uno; los destinos
y los colores, de cada app. Los estilos van en un `.css` del paquete importado por los dos
`globals.css` y no en utilidades de Tailwind, porque Tailwind no escanea `node_modules`.

**Se descartó:**

- **Todo en la barra, solo iconos** (8 destinos a 45 px, sin texto): el usuario eligió
  «4 + Más»; sin etiquetas no se sabe qué es cada icono.
- **Botón de tema en la intranet que solo oscurezca las barras**: el contenido seguiría en
  claro. Elegido por el usuario: solo buscar hasta que exista el modo oscuro.
- **Cerrar la hoja con `onMouseDown`** (lo que usan los modales del proyecto): la hoja
  desaparecía antes del `click` y ese `click` caía en el enlace de la página de debajo.
- **Desmontar la hoja al cerrarla**: el foco quedaba en un elemento borrado y `close()` lo
  devolvía a `<body>`, no al botón. Se deja montada y se cierra con `close()`.
- **Borde de 1 px arriba de la barra**: la barra medía 65 px y reservaba 64; la línea es
  sombra interior.

**Corrección del mismo día, a pedido del usuario al ver la primera versión:** «Más» se
queda solo con Actualizaciones, Respaldos y Configuración, en ese orden; Mi perfil y Cerrar
sesión pasan a un desplegable con el nombre del usuario, arriba a la izquierda, y
Notificaciones a una campana suelta junto a él. En oscuro, el círculo del logo era blanco
y el logo seguía en color: ahora es oscuro con el logo en blanco. En tres pasos más, a
pedido del usuario: la barra pasó de 64 a 72 px de alto con solo las esquinas de arriba
redondeadas (1.25rem), y el logo creció hasta 52 px de ancho (antes 28) sobre un fondo de
80 × 88 px (antes un círculo de 56): el logo es más alto que ancho y en un círculo le
quedaban 14 px a los lados y 10 arriba y abajo; así, 14 en los cuatro (medido). El fondo se
separa 12 px de «Dashboard» y sobresale 3.5625rem; «Dashboard» quedaba 5 px más abajo que
las demás etiquetas y ahora las cinco están en la misma línea (medido: 713–729 px). Vale también para la intranet, que usa el mismo
paquete. **Coste medido:** a 320 px las casillas de los lados quedan en ~55 px y «Auditoría»
se corta a «Audito…»; desde 360 px cabe entera.

> **Aviso: `Dropdown` (`shared/ui/molecules/dropdown.tsx`) cerraba al pulsar sus propias
> opciones.** El «clic fuera» miraba solo el botón, así que el `mousedown` sobre una opción
> contaba como fuera, cerraba el menú y lo desmontaba antes de su `click`. Se corrigió por
> lectura del código, al reutilizarlo en la barra superior; **no se reprodujo en pantalla**.
> Afecta también al menú del pie de la barra lateral (Mi perfil, Configuración, Cerrar sesión).

> **Aviso: las apps compilan contra la copia del paquete, no contra `packages/`.** Con
> `install-links=true`, `node_modules/@olo/navegacion-movil` es una copia. Tras cambiar el
> paquete, el `predev` (`sincronizar-paquetes-locales.mjs`) la rehace al arrancar; con el
> dev ya corriendo, el cambio no se ve hasta reiniciar. En esta sesión se copió a mano.

> **Aviso: la hoja se cierra sola al pasar a escritorio.** Al girar una tablet a más de
> 1024 px la barra se oculta con `display: none` y la hoja con ella; sin ese cierre el
> `<dialog>` seguiría abierto e invisible, con la página inerte.

### Verificado

| Qué | Resultado |
|---|---|
| `tsc` del paquete | Sin errores |
| `tsc --noEmit` de la intranet | Sin errores |
| `tsc --noEmit` del sitio | 2 errores en `src/config/puck.config.tsx:2233`, de un cambio en paralelo de ese archivo (no tocado aquí); ninguno en lo de esta entrega |
| `eslint` de los archivos tocados, en las dos apps | 0 errores (solo avisos que ya estaban) |
| `npm run build` de la intranet (dev apagado) | Compila; la barra está en el CSS y el JS finales. `next-env.d.ts` sin cambios |
| CSS real de cada app compilado con su Tailwind | El `@import "@olo/navegacion-movil/…"` se resuelve en las dos |
| Chrome headless: barra y hoja reales (React SSR) con el CSS real, panel a 320/360/768/1024/1280 (claro y oscuro, con el desplegable abierto y un nombre de 30 letras), intranet a 320/360/768/1024/1280 | Sin scroll horizontal en ninguno; barra visible hasta 768 y oculta desde 1024; el final del contenido y el pie quedan encima de la barra; todos los botones de la barra, la hoja y buscar/tema ≥ 44 px; en la intranet, arriba solo buscar; iconos de la intranet pintados por máscara; en escritorio la intranet queda como estaba |
| Panel e intranet reales con sesión | **No se miraron**: los servidores de dev estaban apagados al terminar y las pantallas piden sesión (no se firman tokens propios). Queda para el usuario |

**Pendiente al cierre:**

- Mirar con una cuenta real el panel y la intranet en el móvil: la hoja «Más», el
  desplegable del nombre (Mi perfil y Cerrar sesión), la campana y «Salir» de la intranet.
  Y en escritorio, que el menú del pie de la barra lateral siga abriendo sus opciones.
- Cambiar los iconos provisionales de la intranet (arriba, cómo).
- Modo oscuro de la intranet: no existe (4 usos de `dark:` en toda la app). Cuando exista,
  el botón de tema va junto al buscador.
- `13-mapa-del-proyecto.md` lo regenera el `pre-commit` con el paquete nuevo.

---

## sesión 27-09-2026: se corrige lo que encontró la auditoría de la API (fase 1: comentarios, código muerto y basura)

**Qué era.** La auditoría del 26-09 (3.ª parte) dejó el inventario; el usuario pidió
corregirlo todo antes de pasar al sitio web. Se hizo todo salvo lo que por norma no se toca
(las migraciones aplicadas); `/api/jobs` se retiró en un segundo paso, cuando el usuario lo
decidió (abajo).

| Frente | Qué se hizo |
|---|---|
| Bug | `escaparGlob` (`invalidar-cache.listener.ts`) escapa de verdad: `` `\\${caracter}` ``. Con una sola barra devolvía el texto literal `${caracter}` |
| Comentarios | Las 238 funciones sin comentario de `src/` y `scripts/` tienen su JSDoc (una línea de qué hace; `@throws` en los casos de uso), y 14 modelos dicen qué tabla son. Cobertura: 671 → 622 funciones, **44 sin comentario, todas `up`/`down` de migraciones**. 20 comentarios desactualizados, los 4 archivos con comentarios en inglés, las cabeceras de plantilla y la línea de código comentado |
| Código muerto | Fuera `shared/cache/` y `shared/errors/`, `requireRole`, `verifyTokenUseCase`, `resolverHrefIntranet`, `exigirPropiedad`/`exigirPertenencia`, `MINUTOS_ENTRE_LATIDOS`, el tipo `Limitador`, `conservarUltimo`, `RolePermissionRepository.revokeAll` y `dt`. El parámetro `next` sin usar pasa a `_next` |
| Endpoints | Retirados `GET /api/audit-logs/:contentType/:contentId` y el `POST`/`GET :id`/`PATCH`/`DELETE` de `/api/permissions`, con sus casos de uso y métodos. El proxy de `3000-sitio-web/app/api/permissions` pierde su `POST`. `/api/permissions` queda de solo lectura |
| Duplicados | `toUUID` + `UUID_RE` (9 copias) → `shared/uuid.ts` (`uuidONulo`, `esUuid`). `normalizar`/`tieneRol` de las 4 policies y 4 comparaciones sueltas con 'superadmin' → `normalizarRol`/`tieneRol` en `shared/autorizacion.ts`. «Permisos de un rol, con el catálogo entero para Superadmin», repetido en el login y en `GET /api/me` → `permisosDeRol`. Los dos diccionarios de tablas de los generadores de esquema → `scripts/db/descripciones-tablas.ts` |
| Nombres | `rolePermission.routes.ts` → `role-permission.routes.ts`, `securityQuestion.routes.ts` → `security-question.routes.ts` |
| Basura | Fuera `migrations/_obsoletas/` (y su excepción en `.gitignore`), 7 scripts de un solo uso, los 4 `base-tendencia-*.xlsx` y, del repositorio (no del disco), los 4 Excel con nombre UUID; `uploads/cargas-datos/*` queda ignorado salvo `fuentes-futuras-de-empleo.xlsx`. `dist/` local borrado |
| Dependencias | Fuera `nodemon`, `@types/exceljs`, `@types/dompurify` y `@types/express-rate-limit` |
| Configuración | `.env.example` documenta las 9 variables que el código leía sin estar ahí; `JWT_SITE_SECRET` sale del `.env` local |
| Scripts | 7 registrados en `package.json` (`db:exportar-esquema`, `db:esquema-*`, `uploads:limpiar-huerfanos`, `uploads:renombrar-carpeta`) y sus textos de uso apuntan a `npm run` |

**Tres cosas que no eran lo que parecían:**

- **Los Excel con UUID sí cumplían una función.** La base de desarrollo es compartida, y
  `guardar-excel-de-carga.ts` reutilizaba por hash la fila de `archivos` **sin mirar si el
  archivo estaba en ese disco**: volver a subir en otro equipo un Excel ya cargado hacía
  fallar al worker. Por eso se versionaron. Se arregló la causa —`restaurarSiFalta` lo
  reescribe con los bytes que acaban de llegar— y entonces sí salieron de git.
- **`limpiar-permisos-huerfanos.ts` era redundante**, no solo puntual:
  `npm run sembrar:permisos` ya retira las claves de secciones borradas, y con más cuidado.
- **`update-uploads-seq.js` también sobraba:** corregía rutas de adjuntos del CMS viejo,
  cuyas tablas borró la 036, y después `reorganizar-uploads-por-tipo` movió todo otra vez.

> **Hallazgo de seguridad, corregido en un segundo paso cuando el usuario lo decidió.** El
> comentario de `revalidar-isr.listener.ts` y la tabla de `3-seguridad` §S11 decían que
> `/api/revalidar` del sitio no se alcanza desde fuera. Ya no era verdad: `nginx.servidor.conf`
> manda `/api-backend/` a la API y **todo lo demás al sitio**, así que la ruta se alcanzaba
> por el túnel y la protegía solo `REVALIDAR_SECRET`. Es exactamente lo que §S11 anticipaba
> («el día que se arregle ese prefijo… conviene decidirlo a propósito»). **Se cortó en
> nginx:** `location ^~ /api/revalidar { return 404; }` en la puerta 8080. `^~` cubre también
> la variante con barra final y gana a cualquier otra regla. La intranet no tiene esa ruta,
> y la API llama al sitio por `http://sitio-web:3000`, sin pasar por nginx, así que la
> revalidación sigue funcionando. El comentario del oyente y §S11 dicen ahora lo que hay.

**`/api/jobs` retirado (segundo paso, a pedido del usuario).** Era la prueba de concepto de
la cola: encolaba una «exportación» que solo esperaba 5 s. Se comprobó otra vez que ni el
sitio, ni la intranet, ni nginx lo llaman; las cargas de Excel encolan desde sus propios
casos de uso (`iniciar-carga*.usecase.ts`) y no pasan por esta ruta. Salen el montaje en
`app.ts`, `limitadorDeTrabajos`, la etiqueta `Trabajos` y el esquema `EstadoTrabajo` del
OpenAPI, y su línea en `verificar-propiedad.ts`. El worker ya no simula: un trabajo con un
nombre desconocido **falla** con un mensaje que lo dice, en vez de darse por bueno. En
`3-seguridad` la fila de `GET /api/jobs/:id` queda como histórica. **Los dos archivos
(`routes/job.routes.ts`, `controllers/trabajos.controller.ts`) los borró el usuario con
`git rm`**, en un commit propio: el control de permisos de la sesión volvió a bloquear el
borrado. Entre el `refactor(api)` y ese commit, `tsc` falla en `job.routes.ts`, que importa
el limitador retirado.

**Se descartó:** tocar las migraciones aplicadas (el `queryInterface` sin usar de la 036,
las citas a `criterios/` de la 033, sus `up`/`down` sin JSDoc): ARQ-03.

### Verificado

| Qué | Resultado |
|---|---|
| `tsc --noEmit` de la API | 0 errores |
| `tsc` con `noUnusedLocals`/`noUnusedParameters`, `src/` + `scripts/` | 1 aviso, el de la migración 036 (antes 11, y el de `pg` sin tipos desapareció con `update-uploads.ts`) |
| Exports sin uso y archivos que nadie carga | Ninguno (queda `express.d.ts`, tipos globales, y `listar-versiones-archivadas`, que usa `probar:versionamiento`) |
| Métodos de objetos exportados sin uso | Solo `revokeAll`, quitado; el resto se usa por clave de texto |
| App de Express cargada sin servidor, rutas listadas | 73 rutas; `/api/permissions` solo `GET`, sin la de auditoría por contenido, las dos rutas renombradas montadas. Tras retirar `/api/jobs`: 71, y la diferencia son exactamente sus dos rutas |
| `tsc` de `src/` + `scripts/` sin los dos archivos de `/api/jobs` | 0 errores: nada más los importa |
| Policies y helpers nuevos, 18 casos (roles con mayúsculas y espacios, permisos sueltos, `local-auth`) | 18/18 |
| `npm run email:verificar`, `password:verificar` | Todo correcto |
| `escaparGlob('pag*ina?[x]')` | `pag\*ina\?\[x\]` |
| `npm run db:esquema-sql` (script registrado) | Genera el SQL |
| Finales de línea de todo lo tocado | Ninguno mezclado |
| `./docker/deploy.sh start` con la pila completa; `POST /api/revalidar` en `127.0.0.1:8080` (la puerta que ve el túnel) | 404, con y sin barra final |
| La misma llamada en `127.0.0.1:8081` (intranet) | 307 a `/login`: esa app no tiene la ruta, nginx no necesitaba tocarse ahí |
| Desde dentro del contenedor `api`, `POST http://sitio-web:3000/api/revalidar` con el secreto real (la llamada que hace la API de verdad, sin pasar por nginx) | 200, `{"revalidado":"pagina:sitio:inicio"}` |
| `/` del sitio y `/api-backend/health` por nginx, tras el cambio | Sin romperse: 307 a `/inicio` (normal) y 200 |

**Sin probar:** `restaurarSiFalta` contra una base y un Redis reales (necesita subir un
Excel ya registrado en otro equipo), y las verificaciones que escriben en la base
(`permisos:verificar`, `propiedad:verificar`, `auditoria:verificar`), porque la API de
desarrollo apunta a Neon.

**Pendiente al cierre:**

- Los cuatro scripts de semillas repiten el mismo «borrador → revisión → aprobación →
  comprobar» y `bloque()` está copiado dos veces: candidato a un helper común.
- Los modelos de catálogo (`departamento`, `centro-formacion`…) usan `export default`
  (§5 pide export nombrado). No era parte de esta fase.
- Fases 2 y 3: el sitio web y la intranet.

---

## sesión 26-09-2026: las reglas responsive pasan a convenciones y al auditor; la intranet y el sitio público se adaptan (4.ª parte)

**Qué era.** Sigue a la 1.ª parte (el panel). El usuario pidió dos cosas: dejar las reglas
responsive en las convenciones, con los agentes ajustados a ellas, y seguir con la intranet
y el sitio público.

### La norma y quién la revisa

| Dónde | Cambio |
|---|---|
| `docs/2-convenciones-del-proyecto.md` §10 (nueva) | Seis reglas con código: cortes solo de la escala de Tailwind (`RESP-01`), `dvh` y anchos que no desbordan (`RESP-02`, `RESP-03`), medir el contenedor (`RESP-04`), táctil (`RESP-05`) y piezas compartidas (`RESP-06`). Más cómo se verifica. Casilla nueva en el checklist §9 |
| `docs/1-guia-del-proyecto.md` §6 | Convención no negociable 13 y su fila de estado (🟡: el panel cumple, lo demás en curso) |
| `.claude/skills/auditar/reglas.md` | `RESP-01`…`RESP-06` en el inspector de carpetas, con su fuente en §10 |
| `.claude/skills/auditar/scripts/chequeo-automatico.mjs` | Señales sin IA: `@media` fuera de la escala o con la sintaxis vieja, `vh`/`h-screen`, `w-[Npx]` ≥ 400 sin salida y `<table>` sin `olo-tabla-apilable` |
| `.claude/agents/auditor-carpetas.md` | Revisa `RESP-*` en toda interfaz: ventana o contenedor, táctil, piezas compartidas |
| `.claude/agents/auditor-arquitectura.md` | Los bloques de Puck que miden la ventana (`RESP-04`), y cuándo una pieza responsive se sube a `packages/` |
| `.claude/agents/auditor-verificador.md` | Cómo refutar un `RESP-*`: `vh` con su `dvh` al lado, `lg:h-screen`, `min-w` en tabla apilable, ancho fijo con prefijo |
| `.claude/skills/auditar/excepciones.md` | Esos mismos casos, como decisiones escritas |

`auditor-seguridad` no cambia: nada de esto es de su área. **`.claude/` no se versiona**
(decisión del 2026-09-25): lo del auditor queda solo en esta máquina.

### Intranet

| Qué | Cambio |
|---|---|
| Barra superior | El menú pasa a hamburguesa por debajo de `lg`, el mismo corte que ya usaba su JSX (antes el CSS cambiaba en 720 y 1060 px). «Encuestas» se despliega con clic, toque o teclado (`aria-expanded`); antes solo con `:hover`. En el menú del móvil el submenú se abre en línea |
| Login | Logo de 96/150/210 px y título de 24/30/36 px por corte: en el móvil el formulario queda en la primera pantalla |
| Carruseles (`Carousel`, «Últimas publicaciones») | Muestran las piezas que caben en su hueco (`use-cuantos-caben.ts`, nuevo): 1 en el móvil, 2 en tablet, 3-4 en escritorio. Antes, siempre las N de Puck: en el móvil eran dos imágenes de 80 px, o cuatro tarjetas apiladas (~1600 px) con las flechas en medio. El arrastre usa eventos de puntero y `touch-pan-y`: con `onMouseMove` no respondía al dedo |
| `globals.css` | 34 `@media` a la escala; `vh` → `dvh` con respaldo; títulos de Tasa con `clamp()`; justificado solo desde `md`; pie a 14 px (bajaba a 12) |
| Recursos visuales | Reproductor y lista lado a lado desde `lg`, igual que en el sitio: a 768 px la lista hacía 14 px de scroll lateral |

### Sitio público

| Qué | Cambio |
|---|---|
| Tablas de tendencia, fuentes futuras y programas sobresalientes | `olo-tabla-apilable`. El nombre (ocupación, sector, programa) encabeza la tarjeta con `data-titulo` aunque en la tabla vaya tercero. Los totales (`tfoot`) también pasan a tarjeta |
| `.olo-tabla-apilable` | Admite `tfoot` y `data-titulo`. La etiqueta pasa a una rejilla (ver abajo) |
| Encabezado | Hamburguesa por debajo de `lg` (era 900). Entre `lg` y `xl`, los enlaces con menos relleno: a 1024 px «Intranet» se salía 6 px, y ya se salía entre 901 y ~1030 con el corte de antes |
| `globals.css` | 28 `@media` a la escala; `vh` → `dvh` en el CSS y en 8 componentes |

### Decisiones y lo descartado

- **La etiqueta de la tarjeta, tercera versión.** 1.ª: en posición absoluta. Una etiqueta
  de dos líneas («NIVEL OCUPACIONAL») pisaba la siguiente, porque la celda no crecía con
  ella. 2.ª: rejilla con la etiqueta en `grid-row: 1 / span 20`. Con un valor con
  `line-clamp`, Chrome repartía 0,875 px en cada fila vacía: 17 px de hueco. Queda una
  rejilla con la etiqueta en la fila 1 y `justify-items: start`, porque sin esto las
  píldoras se estiraban a todo el ancho. El límite, escrito en el CSS: un texto suelto que
  va *detrás* de un elemento caería en la columna de la etiqueta.
- **Carrusel: medir con JS, no con CSS.** Ocultar con `@container` las imágenes que sobran
  era posible, pero cada flecha avanza tantas como se ven. Con CSS, en el móvil se veía una
  y la flecha saltaba tres.
- **Cortes elegidos donde había que mover uno.** El 900 pasó a `lg` en los casos con
  imagen o menú al lado: hasta 1023 px queda la disposición de móvil, que es la segura. El
  login de la intranet pasó a `md`: a 768 px los dos paneles caben. El apaisado bajo
  (`min-width: 901px`) pasó a `lg` y no a `md`: un teléfono apaisado mide 800-930 px y le
  crecería el logo.
- **No se tocaron** los primitivos de Puck (`.olo-grid`, `.olo-flex`, pestañas) más allá de
  la sintaxis: siguen midiendo la ventana (ver Pendiente).

### Verificado

Sin sesión y sin servidores (el `next dev` estaba apagado y la API caída). Las páginas se
pintaron en estático con el código real: `ts.transpileModule` sobre el TSX; sustitutos
solo para `next/navigation`, `next/image`, `next/dynamic` y `next/font`. Por dentro, el
`Render` de Puck de cada app con su config y el contenido de las semillas (`sembrar-*`),
y encima el CSS compilado con el Tailwind de cada app.

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` intranet / sitio | 0 errores / los 2 de siempre en `puck.config.tsx` |
| ESLint de cada archivo tocado, contra su versión de `HEAD` | Mismos errores y avisos; los archivos nuevos, limpios |
| Chequeo automático sobre `HEAD~40..HEAD` | Corre. Encontró justo las dos tablas públicas sin apilar (`RESP-04`), arregladas después. Avisa `REGLAS DESACTUALIZADAS` para `RESP-*` hasta que se commitee §10: lee los `.md` del último commit |
| Las señales `RESP` sobre las apps enteras | Intranet: ninguna (un falso positivo en un comentario JSX). Sitio: solo `--app-vh: 100vh`, que tiene su `dvh` en un `@supports` debajo |
| 10 páginas × 360/768/1024/1280 px: 5 secciones y 2 pantallas de acceso de la intranet, inicio del sitio, sus 3 tablas con filas de ejemplo, el banco del panel | Sin desborde ni scroll lateral interno en ninguna |
| Menú de la intranet abierto, con el submenú desplegado (clases puestas a mano) | En línea en el móvil, flotante en escritorio |
| **En un navegador real** | **No verificado:** lo que depende de JS (el conteo de los carruseles, el arrastre con el dedo, abrir «Encuestas» con toque y teclado) y las páginas con datos reales |

> **Trampa:** el HTML estático no ejecuta JS, así que un carrusel sale con el máximo de
> Puck, que es lo que pinta el servidor. El estado del móvil se comprobó sustituyendo
> `useCuantosCaben` por lo que devolvería a 360 px. Esa cuenta, con las medidas del CSS,
> da 1 a 360/390, 2 a 768 y 3-4 desde 1024.

**Pendiente al cierre:**

- **Mirarlo en real**, con cuenta: los dos carruseles de inicio de la intranet a 360, 768 y
  1280, deslizar «Últimas publicaciones» con el dedo, abrir «Encuestas» con toque y con Tab.
- **Imágenes con texto** («Sabías que…», «Dato OLO de la semana»): en el móvil se encogen
  hasta no leerse. Hace falta un campo «imagen para móvil» en el bloque (`<picture>`): es
  una decisión de contenido.
- **Primitivos de Puck a `@container`** (`.olo-grid`, `.olo-flex`, pestañas) en las dos
  apps, que hoy miden la ventana (`RESP-04`).
- **CSS de bloques copiado entre las dos apps** (`rv-*`, `publicaciones-*`: el del sitio
  dice «portado del global de la intranet»). Es duplicación (`ARQ-06`): conviene moverlo
  junto a `@olo/blocks-renderer`.
- Las piezas `BarraFiltros`, `EncabezadoPanel` y la tabla apilable viven solo en el sitio.
  Si la intranet las necesita, suben a `packages/` (`RESP-06`).

---

## sesión 26-09-2026: auditoría de la API, fase 1: comentarios, código muerto y basura (3.ª parte)

**Qué era.** Primera de tres auditorías por fases (API → sitio web → intranet), con tres
preguntas: ¿cada función dice qué hace, según `2-convenciones-del-proyecto.md` §3?, ¿qué
código ya no usa nadie? y ¿qué carpetas o archivos dejaron atrás los agentes y las
personas que trabajan en paralelo? **No se cambió código**: es el inventario para decidir
qué se corrige. El detalle, con enlace a cada línea, está en
`auditorias/2026-09-26-api-comentarios-y-codigo-muerto.md` (carpeta local, no se versiona).

Nada se midió a ojo: `tsc` con `noUnusedLocals`/`noUnusedParameters` sobre `src/` y
`scripts/` juntos, `findReferences` del servicio de lenguaje sobre cada `export`, el grafo
de imports desde `server.ts`, la tabla de endpoints de `13-mapa` contra las URLs y los
proxies de los dos frontends, y el AST para contar funciones con y sin comentario.

| Frente | Resultado |
|---|---|
| Comentarios | 343 de 671 funciones sin comentario. **51 incumplen hoy la §3** (públicas de `use-cases/` y `shared/`); el resto son controladores (53), repositorios (55), policies, modelos y scripts, que la §3 no exige. 20 comentarios citan archivos o rutas que ya no existen (`7-despliegue.md`, `sitio-web/src` sin el número, `criterios/`, `editor.types.ts`). 4 archivos con comentarios en inglés. 1 línea de código comentado. 0 `TODO` anónimos |
| Código muerto | `shared/cache/` y `shared/errors/` (stubs que nadie importa); `requireRole`, `verifyTokenUseCase`, `resolverHrefIntranet`, el tipo `Limitador`; `conservarUltimo` en los dos casos de uso de depuración. `exigirPropiedad`/`exigirPertenencia` quedaron sin uso con la migración 036, pero `3-seguridad` §S10 aún los cita |
| Endpoints sin consumidor | `/api/jobs/*` (la prueba de concepto de la cola, con su espera de 5 s), `GET /api/audit-logs/:contentType/:contentId` y el CRUD de `/api/permissions` salvo el `GET` |
| Dependencias | `nodemon` (nadie lo llama) y tres `@types/*` de paquetes que ya traen sus tipos |
| Basura | `migrations/_obsoletas/` se compila y va dentro de la imagen; 8 Excel sin uso en `uploads/cargas-datos/` (uno idéntico a un formato de carga); 6 scripts de un solo uso ya ejecutados; `dist/` local con el CMS borrado |

**Un bug real, salido de «variable sin usar»:** `escaparGlob` en
`invalidar-cache.listener.ts:13` escribe `` `\${caracter}` ``, que produce el texto literal
`${caracter}` en vez de anteponer `\` a los comodines de Redis. Hoy no hace daño porque
`@olo/slug-policy` no deja pasar esos caracteres, pero la protección que promete su
comentario no existe. Se arregla con `` `\\${caracter}` ``.

> **Dos cosas que parecen muertas y no lo son.** `pg-hstore` no se importa en ninguna
> parte, pero Sequelize lo carga por dentro con Postgres. Y en `uploads/` se quedan
> `fuentes-futuras-de-empleo.xlsx` y `formatos-carga/`: los leen
> `consultar-fuentes-futuras-actual.usecase.ts` y `formatos-de-carga.ts`.

**Se descartó:**

- **Comentar línea a línea.** La §3 lo prohíbe expresamente («no comentar lo evidente»).
  La propuesta es una línea de JSDoc por función exportada en todas las capas; si se
  adopta, la §3 tiene que decirlo, y esa redacción es del usuario.
- **Corregir las migraciones** (el parámetro sin usar de la 036, las citas a `criterios/`
  de la 033): una migración aplicada no se edita (ARQ-03).

### Verificado

| Qué | Resultado |
|---|---|
| `tsc --noEmit` de la API | 0 errores |
| `tsc` con `noUnusedLocals` + `noUnusedParameters`, `src/` y `scripts/` | 11 avisos; 1 de ellos es el bug de arriba |
| `escaparGlob('pag*ina?[x]')` evaluado con node | `pag${caracter}ina${caracter}${caracter}x${caracter}` |
| Grafo de imports desde `server.ts` | 5 archivos de `src/` que no carga nadie: los dos stubs, los dos `.ts` de `_obsoletas/` y `express.d.ts` (tipos globales, correcto) |
| Cada candidato contra esta bitácora | `listar-versiones-archivadas` sigue vivo (lo usa `probar:versionamiento`, 16-09); `_obsoletas/script.sql` se conserva a propósito según `.gitignore` |
| `docker-compose.servidor.yml` | Ya no monta `script.sql`: `11-base-de-datos.md:468` dice lo contrario |

**Pendiente al cierre:**

- Aplicar las correcciones en el orden del informe: primero lo que no tiene riesgo (el
  bug, las variables, los stubs, los comentarios rotos), luego el JSDoc de las 51
  funciones que la §3 ya exige.
- Decisiones del usuario: los endpoints sin consumidor, `_obsoletas/`, los Excel de
  `uploads/cargas-datos/` y los scripts de un solo uso. Confirmar con Samuel
  `update-uploads-seq.js` y con Mateo `importar-excel-sobresalientes.ts`.
- `11-base-de-datos.md:468` y `3-seguridad-del-proyecto.md:127` describen cosas que ya no
  existen.
- Fases 2 y 3: el sitio web y la intranet.

---

## sesión 26-09-2026: el reloj de la cabecera del sitio sigue el país del visitante y guarda una firma oculta (2.ª parte)

**Qué era.** El reloj de la barra superior del sitio público (`header.tsx`) mostraba
`26/09/2026 | 09:50:12 p. m.` a todo el mundo: día primero, año de cuatro cifras,
segundos y el «p. m.» que pone `toLocaleTimeString('es-CO')`. Se pidió, en tres pasos:
sin segundos; en Colombia `dd-mm-aa` (`26-09-26 - 09:50 pm`); fuera de Colombia la hora y
el formato del país de quien visita. Y una firma oculta: al teclear un código, el reloj se
cambia por «Diseñado y desarrollado por el Ingeniero David Tejada» y a los 18 s se
desvanece.

| Capa | Archivo | Cambio |
|---|---|---|
| Bloque público | `3000-sitio-web/src/shared/lib/blocks/header.tsx` | Reloj: si la zona horaria del equipo es `America/Bogota` (la única de Colombia), `26-09-26 - 09:50 pm` armado a mano con `padStart`. Si no, fecha y hora con `Intl.DateTimeFormat` en el idioma y la región del navegador, unidas con « - » |
| Bloque público | `3000-sitio-web/src/shared/lib/blocks/header.tsx` | Firma oculta: teclear **50849501** en cualquier parte de la página, sin pausas de más de 2 s. Sirven la fila de números y el teclado numérico (se compara `key`). Se queda 18 s y se desvanece en 1 s (`transition-opacity`, sin animación con `prefers-reduced-motion`); repetir el código reinicia la cuenta. En el móvil el texto se parte en dos líneas |

**Descartado:**

- **Ubicar al visitante por su IP.** Hace falta un servicio externo que recibiría la IP de
  cada visitante del sitio (dato personal, Ley 1581) y falla con una VPN. No hace falta:
  el reloj se pinta en el navegador con `new Date()`, que ya da la hora de la zona del
  equipo. La zona también dice si se está en Colombia.
- **Decidir el país por el idioma del navegador.** Un equipo en Colombia con el navegador
  en inglés saldría con el formato de EE. UU. Por eso Colombia se decide por la zona y el
  idioma solo elige el formato fuera de ella.
- **`toLocale*` con `'es-CO'` para Colombia.** Separa con «/» y escribe «p. m.».
- **Atajos con modificadores (Ctrl + D, T, V; Ctrl + Alt + D, T, V; ⌘ + ⌥ + D, T, V).** Ctrl + T
  abre una pestaña nueva antes de que la página se entere, y ninguna página lo puede
  anular. ⌘ + ⌥ + D lo toma macOS para ocultar el Dock. Ctrl + Alt + T abre la terminal en
  Ubuntu. Llegó a estar hecho con Ctrl + Alt y se cambió por el código, que funciona igual
  en todos los sistemas.

> **Aviso.** El código viaja en el JavaScript público del sitio y queda en el repositorio:
> quien lea el código fuente de la página lo encuentra. No es un secreto.

El intervalo del reloj sigue en 1 s: sin segundos el texto solo cambia una vez por minuto
y React no vuelve a pintar si el estado recibe la misma cadena, así que el minuto cambia a
tiempo sin coste.

| Verificación | Resultado |
|---|---|
| `npx tsc --noEmit` y `eslint` de `header.tsx` | Sin errores (solo los dos avisos de `<img>` que ya estaban) |
| Chrome headless contra el `next dev` del 3000, zona y idioma forzados por CDP: Bogotá + `es-CO`, 360 px | `26-09-26 - 09:20 pm`, sin desborde |
| Ídem: Bogotá + `en-US` (navegador en inglés en Colombia) | `26-09-26 - 09:20 pm` |
| Ídem: Nueva York + `en-US` | `09/26/26 - 10:20 PM` |
| Ídem: Madrid + `es-ES` / Berlín + `de-DE` | `27/09/26 - 04:20` / `27.09.26 - 04:20` |
| Ídem: Lima + `es-PE` (misma hora que Colombia, otro país) | `26/09/26 - 09:20 p. m.`: no lo toma por Colombia |
| Código `50849501` tecleado, con cifras de más delante (`1250849501`) | Aparece la firma, sin desborde a 360 px |
| Código desde el teclado numérico | Aparece la firma |
| Con una letra en medio / con una pausa de 2,6 s / con Ctrl pulsado / Ctrl + Alt + D, T, V | No se activa |
| Firma a los 17 s / 18,4 s / 19,5 s (prueba anterior con el atajo; la parte que la oculta no cambió) | Visible / desvaneciéndose (`opacity-0`) / vuelve el reloj |
| Peticiones que no eran GET durante las pruebas | Bloqueadas con CDP para no registrar visitas en Neon |
| Finales de línea de `header.tsx` | Todo CRLF, como estaba |

**Pendiente al cierre.**

- No se probó en un Mac real. El código es de cifras sin modificadores, así que no debería
  cambiar nada.
- En Windows, Colombia, Perú y Ecuador comparten la zona «(UTC-05:00) Bogotá, Lima, Quito».
  El navegador la traduce a `America/Bogota` o a la del país según la región configurada en
  Windows. Un equipo de Perú con la región sin configurar vería el formato de Colombia.
- La intranet no tiene reloj en su barra superior, así que allí no hay nada que igualar.

---

## sesión 26-09-2026: el panel se adapta al móvil (tablas que pasan a tarjetas, filtros plegables, modales que caben)

**Qué era.** El objetivo es que el panel, el sitio público y la intranet funcionen en
cualquier pantalla. Antes de tocar nada se midió el estado real con capturas de Chrome
headless a 360, 768 y 1280 px y un detector de desbordes. Salió esto:

| Dónde | Qué pasaba |
|---|---|
| Todo el proyecto | 16 cortes distintos en los `@media` (480, 600, 640, 720, 767, 768, 850, 900, 1024, 1060, 1200, 1600…) y el JSX con los de Tailwind. No hay una escala común |
| Intranet, barra superior | El CSS cambia de diseño en 720 y 1060 px y el JSX usa `lg:` (1024). **Entre 720 y 1024 cada enlace ocupa todo el ancho y el menú se apila en vertical**, media pantalla de alto en una tablet |
| Panel, Roles | El contenedor es `overflow-hidden`: en el móvil **se cortaban las columnas Permisos y Acciones**. No se podía editar un rol desde el teléfono |
| Panel, Auditoría, Respaldos, Revisión | La tabla hace scroll lateral con la columna importante fuera. Los filtros son de 176 px fijos (`w-44`) y en el móvil ocupan la pantalla entera antes de la primera fila |
| Panel, Actualizaciones | La tabla del historial vive en una tarjeta de 300 px **también en escritorio**: scroll lateral en un monitor |
| Panel, modales de depuración | Cabecera + cuerpo de `80vh` + pie. En un teléfono, `vh` incluye la barra del navegador y el pie (Cancelar) quedaba fuera, sin scroll |
| Panel, Nuevo Usuario | El formulario va en `Alert`, que no tiene scroll: en un teléfono bajo, la parte de abajo no se alcanzaba |
| Panel, títulos | 30px fijos: «Gestion de Roles» en dos líneas apretando el botón de al lado |
| Panel, CSS | 330 líneas de clases `admin-*` sin uso, incluida una regla «Admin Responsive» que ponía la barra lateral a 20px |
| Sitio, tabla de ocupaciones | Scroll lateral con el nombre de la ocupación cortado |
| Intranet, login | El logo ocupa media pantalla del móvil y el formulario queda debajo del pliegue |

Esta sesión cubre el panel. Lo demás queda en **Pendiente**.

### Qué se hizo

| Capa | Archivo | Cambio |
|---|---|---|
| Estilos | `3000-sitio-web/src/style/globals.css` | `.olo-tabla-apilable`: la tabla pasa a tarjetas cuando **su contenedor** mide menos de 48rem. Títulos `admin-header`/`admin-subtitle` con `clamp()`. Fuera las clases `admin-*` sin uso |
| UI compartida | `shared/ui/molecules/encabezado-panel.tsx` (nuevo) | Título, descripción y acciones de cada pantalla. Apila por debajo de `sm` |
| UI compartida | `shared/ui/molecules/barra-filtros.tsx` (nuevo) | `BarraFiltros` + `CampoFiltro`. Por debajo de `lg` los filtros se pliegan tras un botón «Filtros (n)». Sustituye las **tres copias** de `Campo` de Auditoría, Respaldos y Revisión |
| UI compartida | `shared/ui/molecules/alert.tsx` | El fondo hace scroll y alinea con `items-*-safe`: si el cuadro no cabe, empieza arriba en vez de salirse |
| UI compartida | `shared/ui/organisms/sidebar-layout.tsx` | `h-screen` → `h-dvh` |
| Vistas | Auditoría, Respaldos, Revisión, Roles, Usuarios, Dashboard, Actualizaciones (2 tablas) | Las tres piezas de arriba. Usuarios ya apilaba, con un `<span className="md:hidden">` por celda: pasa a la clase compartida |
| Vistas | Revisión | Con la tabla en tarjetas, los cuatro botones dicen lo que hacen (rejilla 2×2, 44px de alto). Tonos 600-700: el blanco sobre verde o amarillo 500 no llegaba a 3:1 ni para un icono |
| Modales | Depurar auditoría, Depurar versiones | Caja `max-h-[calc(100dvh-2rem)]` en columna y cuerpo `flex-1`, en vez de cuerpo de `80vh` |
| Modales | Detalle, Vista previa, Permisos, Diagrama de visitas, Rol, Visor de documentos | `vh` → `dvh`. Los `min-h` fijos, con tope en la pantalla |

### Decisiones

- **La tabla mide su contenedor, no la ventana** (`@container`). La misma tabla va a
  pantalla completa en Auditoría y en una tarjeta de 300px en Actualizaciones. Con `md:` de
  la ventana, la segunda seguía siendo tabla en un monitor. El contenedor se declara solo:
  `:where(:has(> .olo-tabla-apilable))`. Así basta con poner la clase en la tabla.
- **Dentro de una tabla apilable se usa `@3xl:`, no `md:`.** Es el mismo 48rem, medido
  sobre el mismo contenedor. Si no, entre 1024 y ~1150 px (con la barra lateral) la tabla
  sería tarjetas y los botones seguirían en modo tabla.
- **Cortes: los de Tailwind y ningún otro** (640 · 768 · 1024 · 1280 · 1536). En CSS, con
  sintaxis de rango (`width < 48rem`), que es lo que genera `max-md:`.
- **Descartado: etiqueta y valor en una rejilla de dos columnas.** Con `display: grid` cada
  nodo de texto suelto de la celda es un elemento de la rejilla, y «Nombre
  `<span>`correo`</span>`» se partía en filas. La etiqueta va en posición absoluta sobre el
  relleno izquierdo y el contenido fluye normal.
- **Descartado por ahora: un componente `Modal` único.** Hay 10 modales con estructuras
  distintas (`<dialog>` nativo, portal, `fixed`). Unificarlos es un cambio más grande que
  el problema. Se corrigió la altura en cada uno.

> **Trampa:** el CSS de `globals.css` que no está en ninguna `@layer` **le gana a
> cualquier utilidad** de Tailwind, sin importar la especificidad. Por eso
> `.olo-tabla-apilable` puede anular el `min-w-[52rem]` de la tabla. Pero también anula
> un `line-clamp-3` o un `text-right` que se ponga en la celda: lo que haya que cambiar
> en modo tarjeta va en un `<span>` dentro de la celda (como el resumen de Cambios).

### Verificado

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` del sitio | 2 errores en `puck.config.tsx`, los mismos de antes. Ninguno nuevo |
| ESLint de los 18 archivos tocados, contra su versión de `HEAD` | Mismos errores y avisos que antes, archivo por archivo. Los 2 nuevos, limpios |
| CSS compilado con el Tailwind del proyecto | Genera `.olo-tabla-apilable`, las variantes `@3xl:` / `@max-3xl:` y `items-*-safe` |
| Página de prueba con el marcado de las vistas y ese CSS, a 360, 768, 1024 y 1280 px, claro y oscuro | Sin desborde. Tarjetas por debajo de 48rem de contenedor, tabla por encima. La tarjeta de 300px de Actualizaciones apila también a 1280 |
| **El panel real con sesión** | **No verificado.** La página de prueba cubre el CSS, no los componentes montados. Falta mirarlo con una cuenta real |

**Pendiente al cierre:**

- **Mirar el panel real** en el móvil y la tablet (Usuarios, Roles, Auditoría, Respaldos,
  Revisión, Actualizaciones, Dashboard, y el modal de Nuevo Usuario). También re-medir
  `/admin/actualizaciones` y `/admin/auditoria` en el móvil: antes del cambio el navegador
  ensanchaba la ventana a ~880px. La causa probable eran las tablas con `min-w`.
- **Intranet:** la barra superior entre 720 y 1024 px, el logo del login en el móvil, y
  pasar sus `@media` (720, 1060, 900…) a la escala de Tailwind.
- **Sitio público:** la tabla de ocupaciones de `/inicio` (a tarjetas), el icono que falta
  en una red social del pie, y los `@media` sueltos (600, 850, 900, 1200).
- **Bloques de Puck** (`@olo/blocks-renderer`): revisar con contenido real.
- **Llevar la escala de cortes a `2-convenciones-del-proyecto.md`.** La norma la decide el
  usuario: aquí solo se propone.

---

## sesión 25-09-2026: el trabajo local en 7 commits por tema y los cambios de Mateo (#130) integrados (12.ª parte)

**Qué era.** Un `git pull OLO dev` falló. El índice tenía el `git mv` y el `git rm` del refactor
de borrado de archivos, y git no mezcla con cambios en el índice. Antes de rendirse, guardó el
estado, reseteó y lo volvió a aplicar. No se perdió nada, pero dejó una copia suelta de
`backup-uploads.service.ts` en `api-backend/`, que se borró. Había más de 840 archivos sin
commitear de nueve sesiones del día, varios archivos mezclaban dos sesiones, y otra sesión
seguía trabajando en el XSS.

### Qué quedó

| Commit | Qué lleva |
|---|---|
| `refactor(api)` | El refactor de borrado (4.ª parte), en las rutas de antes de la mudanza. `backup-uploads.service.ts`, `probar-versionamiento.ts` y el compose, con solo lo del refactor |
| `refactor` | La mudanza completa (10.ª parte), sin lo de los commits siguientes |
| `chore(gitignore)` | 9.ª parte |
| `feat(mapa)` | 4.ª parte, la del mapa. Los hooks quedan ejecutables (`100755`) para que corran también en Linux y Mac |
| `feat(dev)` | 8.ª parte |
| `docs(guia)` | 6.ª parte. La guía del commit de mudanza lleva los dibujos en texto; este los cambia por los SVG |
| `docs(auditoria)` | 3.ª, 5.ª y 7.ª partes. Solo es la bitácora: el auditor es local |
| Merge de `OLO/dev` | Lo de Mateo, llevado a las carpetas nuevas |

Cada commit lleva su entrada de esta bitácora.

En el merge, git llevó solo a las carpetas nuevas casi todo lo de Mateo. Hubo tres casos a mano:

- **`politica-de-privacidad/page.tsx`.** Mateo la sacó de `inicio/` y la mudanza la llevó a `3000-sitio-web/`. Queda en `3000-sitio-web/src/app/(public)/politica-de-privacidad/`.
- **Sus 5 imágenes de `uploads/img/`.** Git proponía llevarlas al `backup/` de otra página, porque hay imágenes idénticas en los dos sitios. Quedan en `3000-sitio-web/public/storage/uploads/img/`.
- **Sus 4 imágenes de `backup/cb8b3487…/`.** Git las dejaba, sin avisar, en `sitio-web/`, la carpeta vieja. Quedan en `3000-sitio-web/public/storage/backup/cb8b3487…/`.

**Se dejó fuera a propósito** lo que la otra sesión editaba mientras tanto (11.ª parte). Los
commits salen de una foto del estado de las 17:45, anterior a ese trabajo, que sigue sin
commitear.

### Verificado

| Prueba | Resultado |
|---|---|
| Índice y árbol de trabajo tras el pull fallido, contra el stash interno de git | Idénticos |
| Árbol del último commit contra la foto del estado local | Idéntico, salvo el modo ejecutable de los tres hooks |
| Cada archivo de Mateo contra su commit | Iguales. `next.config.mjs` e `intranet-footer.tsx` cambiaron en los dos lados y se mezclaron sin conflicto |
| `tsc --noEmit` de la intranet | 0 errores |
| `tsc --noEmit` del sitio | 2 errores en `puck.config.tsx` (`categories` como `unknown`), los mismos que antes del merge |
| `node --check` de `next.config.mjs` | Válido |

> **Respaldo:** `refs/respaldo/estado-local-2026-09-25` guarda el estado completo de antes de
> organizar. Es local: no se sube. Se borra con
> `git update-ref -d refs/respaldo/estado-local-2026-09-25`.

**Pendiente al cierre:**

- **`/inicio/politica-de-privacidad` da 404 desde el cambio de Mateo.** La página volvió a
  `/politica-de-privacidad` y se quitó el redirect. Pero siguen enlazando a la ruta vieja el
  pie (`footer.tsx`), los dos login, `sitio-busqueda-fallback.ts`, la semilla del pie y lo
  que ya esté guardado en el pie publicado de la base. Falta un redirect de la ruta vieja a la
  nueva, o corregir los enlaces.
- Los 2 errores de tipos de `puck.config.tsx` del sitio.
- `git push OLO dev`, cuando el usuario lo decida.

---

## sesión 25-09-2026: el saneo del contenido cubre todo (texto enriquecido, `intro`, `zones`) y Docker construye con las carpetas nuevas (11.ª parte)

**Qué era.** La 7.ª parte encontró un XSS almacenado real en el bloque «Texto
enriquecido». Al arreglarlo aparecieron cuatro huecos más en el mismo limpiador
(`sanitizar-contenido.ts`), todos por la misma causa: saneaba solo los campos de una
lista de nombres, y la lista se quedaba atrás de los bloques.

| Hueco | Por qué pasaba |
|---|---|
| Texto enriquecido (EditorJS) | `content` guarda un objeto (`{ blocks: [{ data: { text, items } }] }`) y `sanitizarHtml` devolvía intacto todo lo que no era texto. `editorjs-wrapper.tsx` lo pinta con `dangerouslySetInnerHTML` |
| Campos `intro` | Son `richtext` en dos bloques del sitio y no estaban en la lista |
| `zones` | Los bloques de una `DropZone` (`seccion-botones-icono`) viven ahí, y solo se recorrían `content` y `root`. El validador acepta cualquier bloque en `zones` |
| `backgroundImage`, `imageUrl` | La clave se pasaba a minúsculas y la lista las tenía con mayúsculas: nunca coincidían |
| Restaurar y aprobar | Publicaban la versión tal cual. Una guardada antes del arreglo volvía a salir sin limpiar |

### Qué cambió

| Qué | Cómo |
|---|---|
| Regla del saneo | Se sanea **todo texto que tenga `<`**, en todo el JSON (`content`, `root`, `zones` y a cualquier profundidad). Sin `<` no hay etiqueta que inyectar, así que ya no hace falta saber qué campo es HTML. Se quitó la lista `CAMPOS_HTML` |
| Enlaces dentro del HTML | `ALLOWED_URI_REGEXP` acepta http(s), mailto, tel y rutas relativas. Con el patrón anterior, `<a href="/estudios">` perdía el href, y al sanear el texto enriquecido se habrían roto sus enlaces. `javascript:` sigue fuera |
| Campos de URL sueltos | Aceptan también `mailto:`, `tel:`, `#ancla` y `?query`. Antes quedaban vacíos |
| Publicar | `aprobar-pagina` y `restaurar-version-anterior` sanean la versión al publicarla |
| Lo ya guardado | `npm run contenido:revisar` (`scripts/puntuales/revisar-contenido-guardado.ts`) lista las versiones con HTML peligroso y sale con 1. Con `-- --aplicar` las sanea. Usa `htmlPeligrosoEn()`, que cuenta solo lo peligroso (`<script>`, `on…`, `javascript:`), no un `style` |
| Docs | `3-seguridad-del-proyecto.md` §4.4 y la fila RF-01 |

### Verificado

| Qué | Resultado |
|---|---|
| 23 comprobaciones con el limpiador real (ts-node): ataques y contenido legítimo | 23/23, detalle abajo |
| Las 9 versiones reales de la semilla, limpiador viejo contra nuevo | **0 textos distintos**: el contenido legítimo no cambia. 0 con HTML peligroso |
| Postgres 18 desechable (Docker, puerto 55432) con una copia de la API **sin `.env`** | Las 37 migraciones corren con `scripts/db/migrate.ts` desde su carpeta nueva |
| En esa base, `contenido:revisar` con 3 versiones (2 con ataques y 1 limpia) | Encuentra las 2 y sale con 1. `--aplicar` las sanea sin cambiar la forma del JSON. Al revisar otra vez da 0. La limpia queda idéntica (comparada sin el orden de claves, que JSONB reordena) |
| `aprobarPagina` y `restaurarVersionAnterior` reales sobre versiones con `onerror` guardadas directo en la base | Las dos quedan publicadas sin el `onerror` |
| `tsc` de `src/` y los scripts juntos | Sin errores nuevos. Queda solo `pg` sin tipos en `puntuales/update-uploads.ts`, que ya estaba |
| **Docker:** las 4 imágenes (`api`, `migraciones`, `sitio`, `intranet`) construidas con tags de prueba y borradas después | Las 4 construyen. En la de migraciones, `migrate`, `sembrar:permisos`, `crear:superadmin` y `db:verificar` encuentran su script. La API compilada resuelve `/3000-sitio-web/public/storage/uploads`, lo mismo que monta el compose |

Las 23 comprobaciones cubren:

- **Ataques que tienen que salir limpios (10):**
  - EditorJS: párrafo, encabezado, lista de textos, lista anidada y cita;
  - `intro`;
  - `zones`;
  - `root`;
  - `backgroundImage` y `href` con `javascript:`.
- **Contenido legítimo que tiene que sobrevivir (10):**
  - `&`;
  - enlaces relativos, ancla y `mailto`;
  - imagen de `/uploads`;
  - negrita;
  - EditorJS sin HTML, idéntico.
- **Detección de `htmlPeligrosoEn` (3).**

> **Lo guardado antes de hoy puede tener HTML peligroso publicado.** Hay que correr
> `npm run contenido:revisar` en `4000-api-backend/` contra Neon, y en el servidor con
> `docker compose … run --rm migraciones npm run contenido:revisar`. Sin `--aplicar` no
> cambia nada.

**Pendiente al cierre:**

- **Correr `contenido:revisar` en el servidor**, y `--aplicar` si encuentra algo. En Neon ya
  se corrió el 26-09. Revisó 127 versiones de 18 páginas y encontró 1 con HTML peligroso:
  la versión 22, archivada, de `intranet/menu-y-pie`, que tenía un `<svg>`. Ninguna
  publicada. Con `--aplicar` quedó saneada, y la segunda revisión dio 0.
- **Content-Security-Policy.** La tercera medida de §S2 sigue sin revisarse en el sitio.
- **Textos con `<` que no son HTML** (por ejemplo `a < b`) se guardan como `a &lt; b`. Si
  un bloque los pinta como texto de React, se ve `&lt;`. No hay ninguno en la semilla.

---

## sesión 25-09-2026: todo apunta a las carpetas nuevas (`3000-sitio-web`, `3001-intranet`, `4000-api-backend`, `docs/`) y los scripts de la API por carpeta (10.ª parte)

**Qué era.** Las apps se renombraron con su puerto delante y los `.md` numerados pasaron a
`docs/`. Los archivos se mudaron bien: 801 de 806, y los 5 que faltan eran borrados a
propósito. Pero siguieron apuntando a los nombres viejos:

- la API, que armaba a mano la ruta `sitio-web/public/storage`;
- los Dockerfile, el compose y `deploy.sh`;
- el mapa y el auditor;
- 25 enlaces de la documentación.

Además, los scripts de la API estaban sueltos: 36 en `scripts/` y 4 en la raíz de la API.

### Qué cambió

| Paso | Qué |
|---|---|
| 1. API | El nombre de cada carpeta vive en un solo lugar: `CARPETA_DE_APP` en `backup-uploads.service.ts`, junto a `resolverDirectorioStorage()`. Los tres scripts de uploads y el importador de Excel lo toman de ahí, en vez de repetir `'sitio-web'` y de subir niveles con `__dirname` |
| 2. Docker | `COPY` de los tres Dockerfile, `dockerfile:` y volúmenes del compose (dentro del contenedor de la API, `/3000-sitio-web/public/storage`, igual que `CARPETA_DE_APP`), la semilla de `deploy.sh` y `.dockerignore`. Los nombres de servicio (`api-backend:4000`, `sitio-web`) y el prefijo `/api-backend/` de nginx **no** cambian: no son carpetas |
| 3. Mapa | Escribe en `docs/13-mapa-del-proyecto.md` y lee las apps con o sin número. Al comparar antes y después de un pull, una carpeta renombrada no cuenta como nueva: 10 cambios reales en vez de cientos. `descripciones.md`, con los nombres nuevos y `docs/` |
| 3. Auditor | Acepta los dos nombres (`FRONT`/`API` en `alcance.mjs`) y busca los `.md` en `docs/` o en la raíz. Con el commit de mudanza deja de fallar en cuatro cosas, detalladas debajo de la tabla. La comprobación de fuentes de `reglas.md` compara sin el número |
| 3. `.gitignore` | `/sitio-web/`, `/intranet/` y `/api-backend/`: la carpeta vieja que queda en cada PC después del pull no se vuelve a subir con un `git add .` |
| 4. Docs | 82 líneas en el README, en `docs/` (salvo esta bitácora y el mapa) y en `docker/*.md`: enlaces relativos desde `docs/`, rutas de las apps y las guías `guia-bash.md` y `guia-pws.md` |
| 5. Servidor | `docker/guia-bash.md` → «Una sola vez: la actualización que renombra las carpetas»: apagar y respaldar, `pull`, pasar lo subido con `cp -rn`, reconstruir y comprobar |
| 6. Scripts de la API | Cinco carpetas: `db/`, `semillas/`, `verificaciones/`, `archivos/` y `puntuales/`. Se ajustaron los imports (`../../src`), las 4 rutas con `__dirname`, los mensajes de uso, los 24 comandos de `package.json` y las menciones en docs y comentarios. `cleanup.ts` pasó a `puntuales/limpiar-permisos-huerfanos.ts`. **Borrados:** `update-uploads.js` (copia exacta del `.ts`), `check-tables.js` (lo mismo que `db:verificar`), `test-campos.ts` (tenía un nombre y un correo escritos a mano) y `test-perms.ts` |

Lo que el auditor dejaba de hacer mal con el commit de mudanza:

- **Nombres ajenos.** Ya no le cobra a quien mueve una carpeta los nombres ni los
  duplicados de otros.
- **Archivos idénticos.** Git puede emparejar `intranet/src/x` con `3000-sitio-web/src/x`
  cuando los dos archivos son iguales; eso ya no cuenta como archivo nuevo.
- **Rutas dentro de rutas.** `sitio-web/x` ya no se encuentra dentro de `3000-sitio-web/x`.
- **Docs hermanos.** Nombrar un doc de `docs/` desde otro doc de `docs/` ya no se marca.

**Se descartó:**

- **Cambiar `update-uploads-seq.js`.** Parecía una tercera copia, pero corrige la tabla
  `archivos` y no las páginas.
- **Poner los números en las menciones de `sitio-web` como nombre de la app.** Es el nombre
  del servicio de Docker y de la app, no una ruta.

### Verificado

| Qué | Resultado |
|---|---|
| `resolverDirectorioUploads('sitio' / 'intranet')` con ts-node | Resuelve las dos carpetas nuevas, que existen |
| `tsc --noEmit` de la API; `src/` y los 35 scripts juntos | 0 errores, salvo `pg` sin tipos en `puntuales/update-uploads.ts`, que ya estaba |
| Rutas que usan los Dockerfile, el compose y `deploy.sh` | 48/48 existen; `docker compose config` válido |
| `npm run` de la API | Los 27 apuntan a un archivo que existe. `scripts/db/generar-esquema-sql.ts` corre desde su carpeta: 1276 líneas de SQL, sin base |
| Mapa | Se genera en `docs/`. Quedan solo las 2 carpetas sin describir que ya estaban; lee `OLO/dev` con los nombres viejos |
| Auditor, equipo desde el 2026-09-01, en `OLO/dev` | 202 señales (antes 203: `contenido.ts` se encontraba dentro de `sanitizar-contenido.ts`) y 0 reglas desactualizadas |
| Auditor sobre un commit de prueba con toda la mudanza (`commit-tree`, sin rama) | 1 señal, real: ARQ-04 en `limpiar-subidas-pendientes.usecase.ts:2`, del trabajo en curso |
| Enlaces rotos en README, `docs/` y `docker/` | 25 → 3 |
| `cp -rn` de la guía del servidor | Copia lo que falta y no pisa lo que existe |

> **En el servidor, el `git pull` de esta versión no basta.** Lo que subieron los usuarios
> se queda en las carpetas viejas: hay que seguir la sección nueva de `docker/guia-bash.md`
> antes de reconstruir. En los PC del equipo lo resuelve el primer `npm run dev` (8.ª parte).

**Pendiente al cierre:**

- **`docs/5-tableros-bi.md`.** Sus 3 enlaces apuntan a `MatrizView.tsx` y `TasaView.tsx`,
  que ya no existen, y sus `pageName` de Power BI no aparecen en el código. Hay que
  reescribirlo con lo que hay hoy.
- **44 comentarios de código** nombran rutas viejas. No afectan nada; se corrigen al tocar
  cada archivo.
- **`importar-excel-sobresalientes.ts` llama a `sequelize.sync()`.** Crea tablas por fuera
  de las migraciones: ARQ-03.

---

## sesión 25-09-2026: `.gitignore` ordenado, al día con las carpetas renombradas y con `.claude/` otra vez local (9.ª parte)

**Qué era.** El usuario pidió ordenar el `.gitignore`. Tenía `auditorias/` dos veces, `.agent/` metido en
medio del bloque de `.claude/` y había perdido `openspec/`: la segunda `auditorias/` quedó donde estaba.
Al revisarlo apareció algo más serio. Las carpetas se renombraron a `3000-sitio-web/`, `3001-intranet/` y
`4000-api-backend/`, y las excepciones de `*.sql` seguían apuntando a `api-backend/`. Al commitear el
renombre, **la semilla de contenido** (`seed/*.sql`) y `migrations/_obsoletas/script.sql` habrían salido del
repositorio sin aviso: `git add` no añade lo que está ignorado.

Después pidió que `.claude/` se quedara solo en su máquina, porque creía que estaba en el remoto. No lo
estaba: salió del repositorio el 2026-07-20 (`c58ebd9`) y ninguna rama de `OLO`, `UST` ni `BACKUP` lo
tiene. Lo que sí lo dejaba a punto de subir era el propio `.gitignore`. Las excepciones del auditor
(`!.claude/agents/`, `!.claude/skills/auditar/`, de la sesión de `/auditar`) dejaban 11 archivos listos
para el próximo `git add .`.

### Qué quedó

| Bloque | Cambio |
|---|---|
| Dependencias y compilados | `*.tsbuildinfo` pasa aquí desde un bloque suelto |
| SQL | Excepciones con las rutas nuevas. La de `migrations/script.sql`, que no cubría nada, pasa a `migrations/_obsoletas/script.sql`, donde está el archivo |
| Asistentes de IA | `.agent/`, `.agents/`, `openspec/` (recuperado) y `auditorias/` una sola vez. `.claude/` se ignora entero, sin excepciones |
| `scripts/mapa/descripciones.md` | Sin la línea de `.claude/`: el mapa lista con `--exclude-standard` y ya no la ve. `13-mapa-del-proyecto.md` regenerado |

**Consecuencia para el equipo:** `/auditar` y su `chequeo-automatico.mjs` ya no les llegan a los
compañeros. Si el chequeo sin IA tiene que poder correrlo cualquiera, hay que sacarlo de `.claude/` a
`scripts/`.

### Verificado

| Prueba | Resultado |
|---|---|
| 46 rutas de prueba con `git check-ignore --no-index`, en un repo desechable con el archivo viejo y otro con el nuevo | Solo cambian las rutas de las excepciones de SQL (de `api-backend/` a `4000-api-backend/`) y `openspec/` |
| Archivos reales ignorados, antes y después | Solo dejan de estar ignorados los dos `.sql` de la semilla en su carpeta nueva |
| Archivos trackeados en las carpetas viejas que quedarían ignorados en las nuevas | Antes: los dos de la semilla y `_obsoletas/script.sql`. Después: ninguno |
| `git add -A --dry-run -- .claude` | Antes: 11 archivos (4 agentes y 7 de la skill). Después: ninguno; git avisa que está ignorado |
| `git check-ignore -v` sobre agentes, skill, `settings.local.json` y `.claude/SKILL.md` | Los cuatro caen en `.claude/` |
| `git ls-tree` de `.claude/` en las ramas locales y de los tres remotos | 0 archivos en todas. El historial anterior al 2026-07-20 guarda un `settings.json` con permisos de comandos, sin secretos |

> **Aviso:** `test/` está ignorada, pero sus 8 archivos de `pruebas-carga/` se añadieron antes de la regla y
> siguen trackeados. Un archivo nuevo ahí no entra sin `git add -f`.

**Pendiente al cierre:** nada del `.gitignore`. Lo que el renombre rompía (`backup-uploads.service.ts`,
`docker-compose.servidor.yml`, `generar-mapa.mjs`) ya usa los nombres nuevos.

---

## sesión 25-09-2026: `npm run dev` deja la app lista sola, también después del cambio de nombre de carpetas (8.ª parte)

**Qué era.** Las apps pasaron a llamarse `3000-sitio-web`, `3001-intranet` y
`4000-api-backend`. Git solo muda lo que está en el repositorio: al hacer `git pull`,
cada compañero se queda con sus `.env`, sus archivos subidos y su `node_modules` en la
carpeta vieja, y la app nueva arranca sin configuración. Se pidió que `npm run dev` lo
resolviera sin que nadie configure nada.

### Qué cambió en `scripts/sincronizar-paquetes-locales.mjs`

Ya corría en el `predev` y el `prebuild` de las tres apps (`npm run sync:paquetes`).
Ahora hace cinco pasos, cada uno solo si hace falta:

| Paso | Cuándo actúa | Qué hace |
|---|---|---|
| 1. Carpeta vieja | Existe `../sitio-web` (u `intranet`, `api-backend`) **sin** `package.json` | Mueve `node_modules`. Copia sin pisar nada lo demás: los `.env`, `public/storage` y `uploads/`. No trae `.next` ni `dist`. Deja `CARPETA-MUDADA.txt` para no repetirse |
| 2. `dist/` de `@olo/*` | `src/` más nuevo que `dist/` | Lo de antes, sin cambios |
| 3. Instalar | `node_modules/.package-lock.json` (lo que npm instaló) no coincide con `package-lock.json`, una librería de `package.json` no está instalada, o la copia de `@olo/*` difiere de `packages/` | Un solo `npm install` para todo |
| 4. `.next` | Es de otra carpeta, de otra versión de Next o de otro `package-lock.json`, o no tiene sello | Lo borra. El sello queda en `.next/cache/olo-sello.json`, que `next build` no vacía |
| 5. Hooks | Existe `.githooks` y el clon no tiene `core.hooksPath` | `git config core.hooksPath .githooks` |

**Descartado: borrar `.next` en cada arranque**, que fue lo que se pidió al principio.
Cada página compilaría de cero en cada `npm run dev`, y eso son segundos cada vez. Con el
sello se borra justo cuando puede estar viejo.

### Verificado

| Qué | Resultado |
|---|---|
| Comparación contra el `package-lock` en las tres apps reales | 0 diferencias, 4–7 ms. Se saltan 90 opcionales de otros sistemas operativos, que npm nunca instala aquí y harían reinstalar en cada arranque |
| 10 escenarios en un repo de prueba en el scratchpad, con un npm falso que registra las llamadas | **10/10**, detalle abajo |

Los 10 escenarios fueron:

- el primer arranque tras el pull;
- el segundo arranque, sin hacer nada;
- una librería nueva en el lock;
- una librería nueva solo en `package.json`;
- un cambio en `@olo`;
- una versión nueva de Next;
- la app movida de carpeta;
- `OLO_SKIP_SYNC=1`;
- una carpeta vieja que es una rama anterior;
- un clon con hooks propios.

> **El primer `npm run dev` de cada uno borra `.next` una vez**, porque todavía no tiene
> sello. Es a propósito: en quien movió las carpetas, esa caché guarda las rutas viejas.

**Pendiente al cierre:**

- **El paso 5 activa hooks que todavía usan rutas viejas.** El `pre-commit` del mapa no
  bloquea el commit, pero:
  - hasta que se ponga al día con `docs/` y los nombres nuevos, imprime «no se pudo
    regenerar»;
  - o, si la mudanza no está en staging, deja un `13-mapa-del-proyecto.md` en la raíz.
- **Nombre del script.** Ya no solo sincroniza paquetes. Renombrarlo a algo como
  `preparar-app.mjs` toca los tres `package.json` y los comentarios de los Dockerfile.

---

## sesión 25-09-2026: el chequeo sin IA deja dos falsos positivos y encuentra un XSS real (7.ª parte)

**Qué era.** Al explicar en palabras sencillas el informe del equipo desde el 2026-09-01,
se revisaron a mano las señales altas. Dos patrones eran culpa del script, no del código.
Una de las señales de seguridad resultó real.

### Qué cambió en `chequeo-automatico.mjs`

| Qué | Antes → ahora |
|---|---|
| Excepciones que terminan en `**` | `**/src/app/**` solo cubría un nivel. El `.*` del `**` pasaba después por el reemplazo de `*` y quedaba `.[^/]*`. Por eso los `page.tsx` y `layout.tsx` de subcarpetas salían como CAR-09, cuando Next exige su `export default`. Ahora `**` pasa por un marcador y se traduce al final |
| SEG-11 con constantes | `` `SELECT pg_advisory_xact_lock(${CANDADO_CELDA})` `` salía como «SQL armado a mano». `CANDADO_CELDA` es texto fijo del módulo y los valores van por `replacements`. Ahora no cuenta una interpolación que sea un nombre en MAYÚSCULAS |

### Verificado

| Qué | Resultado |
|---|---|
| Mismo alcance (`OLO/dev` en `95e8516`, 286 commits) | 220 → **203 señales**, y 9 → 25 filtradas por excepciones. La crítica y las demás altas siguen igual |
| `sanitizarContenidoPuck` con un bloque de texto enriquecido y otro con `titulo`, ambos con `<img src=x onerror=…>` | El `titulo` sale limpio (`<img>`). El texto enriquecido sale **intacto**, con el `onerror` |

> **XSS almacenado en el bloque «Texto enriquecido» (`RichTextBlock`).**
>
> - **Por qué no se sanea.** Su prop se llama `content` y guarda el objeto de EditorJS
>   (`{ blocks: [...] }`), no un texto. `content` está en `CAMPOS_HTML` de
>   `api-backend/src/shared/sanitizar-contenido.ts`, así que pasa por `sanitizarHtml`, que
>   devuelve sin tocar todo lo que no es string.
> - **Dónde se pinta.** `editorjs-wrapper.tsx` pinta después su `text` y sus `items` con
>   `dangerouslySetInnerHTML` en el sitio público.
> - **Qué puede pasar.** Es el vector de §S2 de `3-seguridad-del-proyecto.md`: una cuenta
>   de editor comprometida mete un `onerror`, y ese código corre en el navegador de quien
>   aprueba y después en el de cada visitante.
> - **Un hueco más.** Los strings sueltos dentro de un arreglo (los `items` de una lista
>   de EditorJS) tampoco se sanean en ninguna rama.

**Pendiente al cierre:**

- **Arreglar el saneo.**
  - Un campo de `CAMPOS_HTML` que traiga un objeto o un arreglo se recorre.
  - Los strings de un arreglo se sanean según la clave del padre.
  - Revisar si ya hay contenido guardado con HTML peligroso.
- **Rutas de los `.md` numerados.** Pasaron a `docs/`, pero todavía los buscan en la raíz:
  - `SALIDA` de `generar-mapa.mjs` y el `git add` del hook `pre-commit`;
  - las fuentes de `reglas.md` y `auditor-arquitectura.md`;
  - DOC-01/02 en `chequeo-automatico.mjs`.

---

## sesión 25-09-2026: los diagramas de la §3 de la guía se ven en cualquier visor (6.ª parte)

**Qué era.** Los §3.1 (capas), §3.3 (lectura pública) y §3.4 (edición y publicación) de
`1-guia-del-proyecto.md` eran dibujos en texto. Primero se probó un bloque Mermaid. Pero el
visor de Markdown de Antigravity (un fork de VS Code), igual que el de VS Code, no dibuja
Mermaid sin una extensión, y el usuario lo veía como código. Lo que sí muestran todos los
visores sin instalar nada es una imagen.

### Qué quedó

| Pieza | Qué es |
|---|---|
| `diagramas/3-1-capas.mmd` + `.svg` | Diagrama de capas (flowchart) |
| `diagramas/3-3-lectura-publica.mmd` + `.svg` | Diagrama de secuencia con las dos ramas, HIT y MISS |
| `diagramas/3-4-edicion-y-publicacion.mmd` + `.svg` | Diagrama de secuencia: borrador → revisión → aprobación, con los oyentes de `ContenidoPublicado` agrupados. Las personas a la izquierda y los sistemas a la derecha |
| `1-guia-del-proyecto.md` §3.1, §3.3, §3.4 | Cada imagen con un texto alternativo que cuenta el diagrama entero, y un enlace a su fuente. Los párrafos del §3.4 no se tocaron |

Los `.mmd` son la fuente editable, con el mismo contenido que los dibujos en texto y los
colores de la marca (`#7DB828`, `#001A39`). Los `.svg` se generaron con Mermaid 11; llevan
fondo blanco para leerse en temas oscuros, y título y descripción accesibles
(`accTitle` / `accDescr`).

**Decisiones:**

- **Imagen y no bloque Mermaid.** Se ve sin extensiones en Antigravity, VS Code y GitHub. Tener las dos cosas en el `.md` haría que GitHub mostrara cada diagrama dos veces.
- **Rótulos como texto SVG** (`htmlLabels: false`), para no depender de HTML incrustado dentro del SVG.
- **Las dos fases del §3 en secuencia, no en flujo:** lo que cuentan es quién habla con quién y en qué orden.

**Descartado:** instalar la extensión de Mermaid. Arregla el visor de una persona, no el de
todo el equipo.

> **Trampa al editar los `.mmd` de secuencia:** en Mermaid el `;` separa instrucciones,
> también dentro de una nota o un mensaje. Una nota con «publicada; la nueva…» no compila.

**Hallazgo, sin tocar:** el diagrama de capas y el §3.2 dicen que ningún frontend toca el
sistema de archivos. Pero `app/api/upload/route.ts`, en las dos apps, escribe y borra con
`fs` en `public/storage/uploads`, sin pasar por la API. La fila RF-02 del §5 ya lo insinúa.
Hay que decidir si el diagrama muestra esa excepción o si se corrige el código.

### Verificado

| Prueba | Resultado |
|---|---|
| Los tres SVG cargados como `<img>` (como los inserta el visor) sobre fondo claro y oscuro, en Chrome headless | Se leen enteros; en oscuro quedan como tarjetas blancas |
| Rótulos con HTML incrustado (`foreignObject`) | 0 en los tres |
| Ancho del §3.4 | Bajó de 1436 a 1334 px al reordenar los actores y ajustar márgenes; legible a unos 850 px |

**Pendiente al cierre:** el hallazgo de arriba. Para regenerar un SVG: pegar su `.mmd` en
mermaid.live y exportarlo como SVG, o pedírselo a Claude.

---

## sesión 25-09-2026: un solo criterio para borrar archivos de páginas (4.ª parte)

**Qué era.** Al integrar `OLO/dev` (merge `6bebc71`) entró el borrado de archivos de
Mateo al eliminar una sección (`c57d8c0`). El usuario notó que ya había resuelto lo mismo
el 10-09 con `024-subidas-pendientes` (`7e25b89`): borrar al publicar solo lo que ninguna
versión de ninguna página usa. Pidió reutilizarlo y ordenar cada cosa según su
competencia, para no tener desarrollo duplicado ni disperso. Había tres criterios distintos
para decidir si se podía borrar o mover un archivo:

| Flujo | Antes de sacar un archivo, ¿miraba si otra página lo usa? | Cómo lo borraba |
|---|---|---|
| Subidas pendientes (10-09) | Sí: `LIKE` en todas las versiones del ámbito, una consulta por archivo | Su propio `fs.rm` |
| Publicar / restaurar (02-09) | No: solo la versión vieja contra la nueva de la misma página | Lo movía a `backup/` |
| Eliminar sección (25-09) | No miraba nada, y borraba **antes** de confirmar la transacción | Su propio `unlinkSync` |

### Qué quedó

| Capa | Pieza | Qué hace |
|---|---|---|
| Repositorio | `PaginaRepository.rutasEnUso(rutas, ambito, { excluirPaginaId?, tx? })` | La única respuesta a «¿alguna versión de alguna página nombra este archivo?». Es la consulta de las subidas pendientes, generalizada y en una sola consulta |
| Infraestructura | `infrastructure/storage/backup-uploads.service.ts` (antes `shared/storage/`) | El disco: resolver carpetas, mover, copiar, borrar. `borrarDeUploads` sustituye a los dos borrados anteriores y descarta cualquier ruta que, ya resuelta, caiga fuera de `uploads/` |
| Caso de uso | `use-cases/paginas/borrar-archivos-huerfanos.usecase.ts` | La única puerta para borrar archivos de páginas: pregunta a `rutasEnUso` y borra con `borrarDeUploads` |
| Shared | `shared/rutas-uploads-en-contenido.ts` | `extraerRutasUploads`, que es solo lectura del JSON, sale del almacenamiento y queda junto a `enlaces-en-contenido.ts` y `extraer-textos-puck.ts` |

Quién la usa:

- **`limpiarSubidasPendientes`** (subidas pendientes): mismo comportamiento que antes. Se queda con lo suyo, la guarda del bloqueo y el registro de `subidas_pendientes`, y delega el resto.
- **`eliminarSeccion`**: lee los archivos dentro de la transacción y los limpia en su `afterCommit`. Si la baja no se confirma, no se toca el disco, y lo que otra página enlaza se conserva.
- **`aprobarPagina` y `restaurarVersionAnterior`**: pasan a `respaldar`/`restaurar` el nuevo parámetro `conservarEnUploads`, que es `rutasEnUso` excluyendo la propia página. Así lo que otra página enlaza se copia al backup en vez de moverse.
- **El stub `shared/storage/index.ts`** (tres funciones vacías que nadie importaba) se borró.

**Decisiones:**

- `strpos` y no `LIKE`, para que un `_` o un `%` del nombre no hagan de comodín.
- Cada ruta se busca también codificada (`mi%20foto.png`), porque `extraerRutasUploads` descodifica.
- `WITH … AS MATERIALIZED` convierte cada versión a texto una sola vez para todas las rutas.

**Descartado:**

- **Unirlo con la deduplicación SHA-256 de `archivos`.** Parecen lo mismo, pero no lo son. Los Excel de las cargas son privados y cada carga apunta a su archivo con una llave foránea, así que contar referencias es exacto. Los archivos de páginas son públicos y su referencia vive dentro del JSON del contenido. Registrarlos en `archivos` obligaría a mantener una tabla de relación sincronizada en cada guardado.
- **Resolver las carpetas desde una variable de entorno.** Se mantuvo la subida de cuatro niveles, y el archivo se movió a la misma profundidad. Así el despliegue no cambia.

> **Trampa (Sequelize 6.37):** `transaction.afterCommit` se ejecuta en un `finally`,
> **también cuando el COMMIT falla**. Por eso la limpieza de eliminar sección comprueba
> primero contra la base que la página ya no existe, y nunca lanza: un error en el gancho
> hace fallar la petición de una baja que sí se confirmó.
> **Segunda trampa:** `backup-uploads.service.ts` encuentra `public/storage` subiendo cuatro
> niveles desde su directorio. Si se mueve a otra profundidad, publicar y restaurar fallan
> solo en el servidor.

### Verificado

Postgres 18 desechable en Docker (puerto 55432), con las 37 migraciones aplicadas con el
runner real. El backend se ejecutó desde una copia en el scratchpad, sin `.env`, así que
las carpetas `public/storage` eran las de la copia. No se tocó Neon, ni el disco del
proyecto, ni la API de desarrollo.

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` de api-backend, sitio-web e intranet sobre el árbol del merge, antes de cerrarlo | Limpios |
| `tsc --noEmit` de api-backend tras el cambio, y de `scripts/probar-versionamiento.ts` con el tsconfig del proyecto | Limpios |
| `rutasEnUso`: usadas / codificada / `_` no es comodín / `excluirPaginaId` / otro ámbito | 5 de 5 |
| Eliminar sección con ROLLBACK (la bitácora falla) | La página vuelve y sus archivos y su backup siguen |
| Eliminar sección con **COMMIT fallido** (conexión terminada con `pg_terminate_backend`) | Ídem. Sequelize avisa «Committing transaction … failed» |
| Eliminar sección confirmada | Borra lo que solo usaba ella y su backup; conserva lo compartido, también si la otra página lo guarda codificado |
| Subidas pendientes | Borra la reemplazada, conserva la usada; en `subidas_pendientes` queda solo la usada |
| Publicar | Lo que usa otra página se queda en `uploads/` (y se copia al backup); lo exclusivo se mueve |
| Restaurar | Lo que usa otra página se queda en `uploads/`; lo restaurado vuelve |
| **Control con el código de antes** (merge `6bebc71`), mismos escenarios | Los tres fallos se reproducen: tras el ROLLBACK los archivos ya no estaban, se borró el archivo compartido y publicar sacó de `uploads/` el de otra página |

Total: 29 de 29 comprobaciones con el código nuevo.

**Pendiente al cierre:**

- Reiniciar `npm run dev` en api-backend.
- **Sin cambiar, anterior a esto:** publicar y restaurar mueven archivos **antes** de escribir en la base. Si esa escritura falla, el disco queda por delante. Se arreglaría igual que eliminar sección, llevando la parte de disco a un `afterCommit`.
- `SubidaPendiente` sigue sin repositorio propio (ya anotado en la guía).
- `11-base-de-datos.md` §archivos todavía dice «los que suba el `shared/storage` de RF-02». Se dejó así porque es la historia de esa migración.

---

## sesión 25-09-2026: el chequeo sin IA de `/auditar`, para todo el equipo y por persona (5.ª parte)

**Qué era.** El usuario preguntó si el chequeo automático de `/auditar` podía correr
sobre todo el equipo sin IA. Podía (`desde=` sin `autor`), pero al probarlo con
septiembre salieron tres problemas: tardaba 4 min 17 s, no decía de quién era cada
señal y solo mostraba 40 líneas en pantalla, con el resto en un JSON.

### Qué cambió

| Qué | Antes → ahora |
|---|---|
| Tiempo, 286 commits y 530 archivos | 4 min 17 s → **54 s**. Los `git blame` y los `git show` corren en paralelo (`enLotes`), y el texto de la punta se lee con un solo `git cat-file --batch` en vez de mil llamadas de ~65 ms cada una en Windows |
| De quién es cada señal | Cada una lleva su persona. Las firmas que comparten nombre o correo se juntan: «David Tejada / ingdave» (mismo correo) y los dos correos de diegorioz |
| Salida | Tabla por persona en pantalla, las críticas y altas, y un informe legible en `auditorias/<fecha>-equipo-desde-<fecha>-sin-ia.md`: por persona, por regla (con lo que pide cada una) y cada señal con su enlace al archivo |
| Falso positivo SEG-01 (crítico) | `password: 'contraseña'`, una etiqueta de la interfaz en `auditoria-resumen.ts`, salía como secreto. Ahora una asignación suelta solo cuenta si el valor no es una palabra |
| Falso positivo SEG-10 | `console.log('[Auth] Token verify failed:', err.name)` salía como «log con token». Ahora solo cuenta lo que se imprime, no el texto del mensaje |

### Verificado

Chequeo de todo el equipo desde el 2026-09-01 sobre `OLO/dev` (`95e8516`): 286 commits,
220 señales (1 crítica, 14 altas, 157 medias, 48 bajas), 9 filtradas por excepciones.
Mismo resultado antes y después de paralelizar, salvo los dos falsos positivos.

> **La crítica que queda es real y conviene mirarla:** `021-bloqueos-edicion.ts` cambió
> su `nombre` de `020-…` a `021-…` el mismo día en que se creó (`df49d88`). El runner
> reconoce las migraciones aplicadas por ese nombre: si en algún entorno se aplicó con el
> nombre viejo, la ve como nueva e intenta correrla otra vez.

**Pendiente al cierre:** confirmar en Neon y en el servidor con qué nombre quedó
registrada la 021.

---

## sesión 25-09-2026: `13-mapa-del-proyecto.md`, el plano de cómo está el proyecto, al día en cada commit (4.ª parte)

**Qué era.** El usuario notó que la arquitectura de carpetas no está bien definida y pidió
«un mapa del proyecto» que se actualice solo cada vez que aparezca una carpeta, una
librería o un renombre, corriendo al hacer `git status`. Se separaron dos planos que la
documentación venía mezclando: **cómo debe estar** el proyecto (norma: lo deciden
personas, en los `.md`) y **cómo está** (estado: lo puede escribir un script). El mapa es
el segundo. Eligió: actualizar en commit y en pull, versionado para el equipo, con
carpetas, rutas, endpoints, librerías y base de datos, y que las carpetas nuevas salgan
marcadas hasta que alguien diga para qué son.

### Qué quedó

| Pieza | Qué hace |
|---|---|
| `scripts/mapa/generar-mapa.mjs` | Escribe `13-mapa-del-proyecto.md` a partir del código, en 0,3 s y sin dependencias. Lee del árbol de trabajo, del índice o de un commit (`git cat-file --batch`, una sola llamada). Sin fecha ni hash a propósito: solo cambia cuando cambia la estructura |
| `13-mapa-del-proyecto.md` | Resumen por app; carpetas sin descripción; árbol de carpetas con el propósito de cada una; features y su anatomía; rutas de Next con su URL; endpoints de la API con sus protecciones (🔓 si no hay sesión ni permiso a la vista); librerías por app y quién usa cada paquete de `packages/`; migraciones en el orden del manifiesto (avisa si una no está registrada) y modelos con su tabla |
| `scripts/mapa/descripciones.md` | Para qué es cada carpeta, una línea por carpeta, escrito por personas. Sembrado con lo que ya decían `1-guia` y el código. `components/`, `hooks/`, `services/`, `lib/` y `model/` dentro de una feature ya los define la anatomía de `2-convenciones` §2.4 |
| `.githooks/pre-commit` | Regenera el mapa **con lo que está en staging** y lo mete en el mismo commit. Nunca bloquea un commit. En `git commit -- rutas` se salta (el índice temporal quedaría descuadrado) y lo pone al día el commit siguiente |
| `.githooks/post-merge` y `post-rewrite` | Después de un `pull` (con merge o con rebase) dicen qué cambió: carpetas, rutas, endpoints, migraciones y librerías (nuevas o de otra versión), y dejan el mapa al día |
| `.gitattributes` | `.githooks/*` en LF: con CRLF el `sh` de Git falla igual que los `.sh` de Docker |
| `README.md` | El mapa en la tabla de documentación, con el comando de activación |
| `auditor-arquitectura` | Usa el mapa para ubicarse y trata una carpeta nueva sin descripción como una carpeta sin lugar definido |

**`git status` no se puede enganchar**: Git no tiene hook para un comando que solo mira.
Commit y pull son mejores momentos: el mapa cambia en el mismo commit que cambió la
estructura, y su diff dice qué entró.

**Un script y no un agente de IA**: tarda 0,3 s en vez de minutos por commit, no cuesta
nada, y da el mismo resultado para el mismo código, así que su diff solo muestra lo que
de verdad cambió.

**Corregido de paso en `/auditar`:** el chequeo de rutas buscaba `validar(`, pero el
middleware se llama `validarCuerpo(`. Habría marcado como «sin validar» cada `POST` que
sí valida.

### Verificado

| Prueba | Resultado |
|---|---|
| Generar en el repo | 0,3 s; 108 carpetas en las tres apps, 5 features, 67 rutas de Next, 77 endpoints, 37 migraciones, 17 modelos |
| Hooks en una **copia desechable** del repo (no en el de trabajo, que tenía cambios en staging) | Commit con una feature nueva: el mapa entró en el mismo commit con `reportes/` marcada «⚠ sin descripción» y el árbol quedó limpio |
| `git commit -- ruta` | Se salta con aviso; el commit siguiente pone el mapa al día |
| `git commit -a` | El mapa entra en el mismo commit (`zod` nuevo en la intranet) |
| `git merge` de una rama con cambios de estructura | Imprime `+ ruta /reportes`, `+ endpoint GET /api/audit-logs/resumen`, `+ migración 038-reportes`, `+ librería chart.js@^4.4.0`, `~ librería next: ^16.3.0 → ^16.4.0`; la migración sin registrar sale en el mapa como «no corre» |

**Tres carpetas quedaron sin descripción, a propósito:** no están documentadas en ningún
lado. `sitio-web/data_temporal/` (los catálogos JSON de la CNO que lee el buscador de
ocupaciones), `sitio-web/src/features/sitio-web/fuentes-futuras-empleo/` e
`intranet/data/`, que además versiona `intranet.db-shm` e `intranet.db-wal`, archivos
temporales de SQLite.

> **Los hooks no llegan solos con el `pull`.** Viven en la configuración local de cada
> clon: cada persona corre una vez `git config core.hooksPath .githooks`. Quien no lo
> active no rompe nada, pero sus commits llevan el mapa viejo; el siguiente que lo tenga
> activo lo pone al día.

**Pendiente al cierre:**
- Activar los hooks en cada clon (`git config core.hooksPath .githooks`).
- Describir las tres carpetas de arriba y decidir si `intranet/data/*.db-*` sale del repo.
- Cuando se defina la arquitectura de carpetas en los `.md`, revisar `descripciones.md`
  con esa definición: hoy es una transcripción de la guía, no una decisión nueva.
- Opcional: que `1-guia` §4 deje de copiar árboles a mano y apunte al mapa, que se
  desactualiza solo mucho menos (la guía dice 26 migraciones; hay 37).

---

## sesión 25-09-2026: `/auditar`, un auditor de código contra las reglas de los `.md` (3.ª parte)

**Qué era.** El usuario pidió un agente que, al llamarlo, audite lo que hicieron otras
personas en el repositorio y marque dónde se apartan de las convenciones de los `.md` y
de las recomendaciones de otros agentes, con otra forma de hacerlo en tres frentes:
arquitectura del proyecto, arquitectura de carpetas y seguridad. Eligió: auditar
**commits por persona y fechas** (con `git`, sin la CLI de GitHub, que no está instalada),
un informe `.md` **privado e ignorado por git**, el auditor **versionado para el equipo**,
y cuatro extras: chequeo automático sin IA, verificador de falsos positivos, duplicación
sitio-web ↔ intranet y documentación y bitácora al día.

### Qué quedó

| Pieza | Qué hace |
|---|---|
| `.claude/skills/auditar/SKILL.md` | `/auditar autor=… desde=… [hasta=…] [rama=OLO/dev]` o `rango=a..b`. Solo corre si alguien lo escribe (`disable-model-invocation`). Dirige los seis pasos y escribe el informe en `auditorias/<fecha>-<alcance>.md` |
| `scripts/preparar-alcance.mjs` (+ `alcance.mjs`) | `git fetch`, los commits del filtro y, con `git blame -w` sobre la punta, **solo las líneas de esa persona que siguen vivas**. Deja una copia de la rama en `%TEMP%\olo-auditoria\<id>` (sin `storage/` ni `uploads/`: 34 MB, menos de 2 s) armada con un índice temporal, sin tocar el árbol de trabajo ni el índice |
| `scripts/chequeo-automatico.mjs` | Lo que no necesita IA: kebab-case, `ui/`/`api/` en features, imports que cruzan fronteras, `any`, `TODO` anónimos, `catch` vacíos, `eslint-disable` sin motivo, capas de la API, rutas sin sesión o sin `validar()`, migraciones editadas o fuera del manifiesto, secretos en lo añadido (aunque ya se hayan borrado), duplicación entre las dos apps, días de código sin entrada en esta bitácora y documentación que nombra archivos que este trabajo borró o renombró. También sirve suelto: `rango=OLO/dev..HEAD --estricto` sale con 1 si hay algo crítico o alto |
| `reglas.md` | 51 reglas con código fijo (`ARQ-*`, `CAR-*`, `CONV-*`, `A11Y-01`, `SEG-*`, `DOC-*`) y la fuente exacta de cada una: archivo y encabezado. Lo que no sale de un `.md` se reporta como `REC`, recomendación |
| `excepciones.md` | Lo que parece error y es una decisión documentada. Un bloque que el script filtra solo y una tabla para los inspectores |
| `.claude/agents/auditor-{arquitectura,carpetas,seguridad}.md` | Tres inspectores en paralelo (Sonnet), solo lectura, cada uno con sus reglas. Si la sesión tiene las skills `senior-architect`, `frontend-senior`/`backend-senior` o `senior-security`, las cargan; si chocan con un `.md`, gana el `.md` |
| `.claude/agents/auditor-verificador.md` | Intenta refutar cada hallazgo: el código dice eso, la línea es de esta persona, la regla lo exige, no es una decisión escrita, la severidad es proporcional |
| `plantilla-informe.md` | Resumen de 30 segundos, hallazgos con qué pasa / por qué importa / cómo hacerlo / ejemplo del propio repo / cita de la regla, propuestas de fondo, hábitos «para la próxima» y lo que el verificador descartó |
| `.gitignore` | `.claude/` estaba ignorado entero desde el 2026-07-20: ahora se versionan solo `.claude/agents/` y `.claude/skills/auditar/`. Se ignora `auditorias/` |

**Se revisa lo vivo, no el diff.** Si otra persona ya reescribió una línea, reportarla
sería pedirle a quien la escribió que arregle algo que ya no existe. Por la misma razón,
la documentación desactualizada solo se le atribuye a quien borró o renombró el archivo,
no a quien lo tocó antes.

**Descartado:** revisar las PR con `gh` (no está instalado; queda para cuando lo esté) y
guardar memoria por agente (`memory: project`): acumularía en el repo versionado juicios
sobre el trabajo de cada persona, que el usuario quiere privados.

### Verificado

Solo la parte sin IA: los inspectores y el verificador no se corrieron en esta sesión.

| Prueba | Resultado |
|---|---|
| `preparar-alcance.mjs` sobre 6 commits reales de una persona (10 días) | 42 archivos, 728 líneas vivas, copia de 34 MB; 8 s |
| `chequeo-automatico.mjs` sobre ese alcance | 7 señales, para que las juzgue un inspector: un `POST` sin sesión ni `validar()` (¿público a propósito?), un `any`, un use-case que usa un modelo sin su repositorio, `mensaje-de-cierre.ts` idéntico en las dos apps y 17 menciones en los `.md` de `middleware.ts`, que en esa rama ya es `proxy.ts` |
| Modo rápido, `rango=HEAD~11..HEAD --estricto` | 3 señales, 2 filtradas por excepciones, exit 0. Entre ellas, que el `registrar-service-worker.tsx` de la PWA está duplicado en las dos apps (cierto) |
| Falso positivo encontrado y corregido | `033-tendencia-ocupacional.ts` salía como «migración aplicada editada» (crítica); el cambio era solo de comentarios (`36e6019`). Ahora eso baja a `revisar`/baja |
| Autocomprobación de `reglas.md` | Las 59 citas (36 encabezados distintos) existen; con uno inventado, avisa `REGLAS DESACTUALIZADAS` |
| YAML de la skill y los 4 agentes; `node --check` de los 3 scripts | Correctos |

> **Dos avisos para quien lo use.** Los agentes nuevos se cargan al abrir la sesión: si
> `/auditar` no los encuentra, hay que reiniciar Claude Code. Y la regla 1 de
> `1-guia-del-proyecto.md` §6 y la 9 de `4-reglas.md` dicen que `proxy.ts` es un nombre
> que Next ignora: desde Next 16 es al revés. `reglas.md` ya lo trata como documentación
> desactualizada (DOC-02), pero los dos `.md` siguen diciéndolo.

**Pendiente al cierre:**
- Primera corrida real de `/auditar` con los inspectores y el verificador, y ajustar los
  agentes con lo que salga.
- Corregir en `1-guia` y `4-reglas` lo de `middleware.ts` → `proxy.ts`, y las 17
  menciones en los `.md` cuando se confirme la migración a `proxy.ts`.
- Opcional: `winget install GitHub.cli` para auditar PR; un hook `pre-push` con el modo
  rápido; mover `.claude/SKILL.md` (el `llm-council`) a `.claude/skills/llm-council/`,
  que es donde Claude Code lo encuentra.

---

## sesión 25-09-2026: «Descargar formato» en Actualizaciones (2.ª parte)

**Qué era.** Quien carga datos en Actualizaciones no tenía de dónde sacar el Excel con las
hojas y columnas que espera cada carga. El usuario dejó los dos formatos en
`api-backend/uploads/formatos-carga/` y pidió un botón para descargarlos. Ahora cada tarjeta
que ya carga tiene su «Descargar formato» junto al título.

### Qué quedó

| Capa | Cambio |
|---|---|
| Archivos (`api-backend/uploads/formatos-carga/`) | `formatdata-sobresalientes.xlsx` (Programa + Sobresalientes) y `formatdata-criterios-tendencias.xlsx` (Criterios de clasificación). Entran al repositorio como el resto de `uploads/` |
| Caso de uso (`use-cases/observatorio/formatos-de-carga.ts`) | Lista cerrada `id → archivo` y `resolverFormatoDeCarga`: 404 si el id no está en la lista o el archivo falta en disco |
| Ruta (`GET /api/observatorio/formatos/:formato`) | Detrás de `requireAuth` + `puedeActualizarDatos`, como las cargas. Ids: `programas-sobresalientes` y `tendencia-ocupacional`. Responde el Excel como adjunto `formato-<id>.xlsx`, con `Cache-Control: private, no-cache`. Documentada en Swagger |
| Servicio (`sitio-web/.../actualizaciones/services/observatorio.service.ts`) | `descargarFormatoDeCarga` pide el archivo como Blob. Si falla, lee el Blob del error como JSON, para que `mensajeDeErrorApi` muestre el `{ error }` de la API |
| Componente (`components/descargar-formato.tsx`) | Botón con contorno gris e ícono verde; el error sale debajo con `role="alert"`. Solo lo ven Administrador y Superadmin, los mismos que pueden cargar |

**Por qué por la API y con una lista cerrada.** La URL lleva un identificador, nunca un
nombre de archivo, así que por aquí no se puede pedir nada más de `uploads/`. Descartados:

- **Servir `uploads/` con `express.static`.** Dejaría a la vista los Excel subidos en
  `uploads/cargas-datos/`.
- **Ponerlos en `sitio-web/public/`.** Quedarían públicos, sin sesión, y cambiar un formato
  obligaría a recompilar el sitio. En `uploads/`, que el servidor monta en el contenedor,
  basta con reemplazar el archivo con el mismo nombre.
- **Un `<a href>` directo a la API.** Con la sesión vencida, el navegador abriría el JSON
  del 401 como página. Por `axios`, el error sale en la misma tarjeta.

**Por qué el texto del botón no va en verde.** El verde de la marca (`#7DB828`) tiene un
contraste de unos 2,4:1 sobre blanco, por debajo del 4,5:1 que pide AA para texto. El verde
queda solo en el ícono.

**Hallazgo: los formatos traen datos completos.** No son plantillas vacías.
`formatdata-sobresalientes.xlsx` tiene 672 filas en «Superan el margen».
`formatdata-criterios-tendencias.xlsx` (1,5 MB) tiene 611 filas en «percentiles nacional» y
20.163 en «percentiles departamental». Sirven de ejemplo tal cual. Si se prefiere una
plantilla vacía, basta con reemplazar los archivos.

### Verificado

El router real se montó en un Express aparte con un token de la cuenta local (`isLocal`, que
no consulta la base). No se tocó Neon ni la API de desarrollo. La pantalla se probó con
`next dev` en el puerto 3200, una API de prueba en el 4100 (el router real, más stubs vacíos
para `/api/me` y los historiales) y Chrome headless por CDP.

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` en api-backend y sitio-web; ESLint sobre la feature | Limpios |
| Sin sesión | 401 |
| Rol Editor | 403 |
| Superadmin (cookie `sitio_token`) → `programas-sobresalientes` | 200, 66.832 B, mismo SHA-256 que el archivo; `Content-Disposition: attachment; filename="formato-programas-sobresalientes.xlsx"`; `private, no-cache` |
| Administrador (Bearer) → `tendencia-ocupacional` | 200, 1.582.605 B, mismo SHA-256 |
| `otro`, `toString`, `..%2Fcargas-datos%2F…`, `..%252F..%252Fpackage.json` | 404 `Formato no encontrado.` en los cuatro |
| En el navegador: clic en los dos botones | Dos descargas completas con el nombre y el tamaño de cada archivo; ningún error visible |
| Capturas a 1440 px (claro y oscuro) y 390 px | Revisadas. En la tarjeta angosta el botón baja bajo el título, encima de «Cargar». Sin scroll horizontal en móvil |

No se probó el caso «el id existe pero falta el archivo en disco» (404 y aviso en el log).

> **Trampa para quien pruebe el sitio-web con `next dev`:** esta versión de Next crea
> `sitio-web/AGENTS.md` y `sitio-web/CLAUDE.md` al arrancar («Generated AGENTS.md and
> CLAUDE.md for AI agents»). Si se borran, vuelve a crearlos. Se apaga con
> `agentRules: false` en `next.config.mjs`.

**Pendiente al cierre:**

- Reiniciar `npm run dev` en api-backend: sin eso la ruta nueva da 404.
- Decidir qué hacer con `sitio-web/AGENTS.md` y `sitio-web/CLAUDE.md`, que creó la prueba.
- En el servidor: `git pull` + `./docker/deploy.sh build` + `start`. Los Excel llegan con el
  repositorio, y la carpeta ya está montada.
- «Alertas de inversión» y «Fuentes futuras de empleo» no tienen botón: todavía no cargan
  ni tienen formato.

---

## sesión 25-09-2026: el sitio y la intranet se pueden instalar como app (PWA)

**Qué era.** El usuario pidió volver PWA el proyecto: que se pueda instalar como app en el
celular o el computador y que funcione sin conexión. Eligió las dos apps, con una regla
distinta en cada una. El **sitio-web** guarda copias de sus páginas públicas para verlas sin
internet. La **intranet** es instalable pero no guarda ninguna página: todo en ella es
privado, y una copia en el dispositivo seguiría ahí después de cerrar sesión, a la vista de
quien use después el mismo equipo.

### Qué quedó

| Parte | Sitio-web | Intranet |
|---|---|---|
| Manifiesto (`app/manifest.ts` → `/manifest.webmanifest`) | «OLO SENA APP», abre en `/inicio`, sin barra del navegador | «Intranet OLO», abre en `/inicio` (sin sesión, el middleware lo manda al login) |
| Íconos (`public/assets/pwa/`) | 192, 512, 512 enmascarable y 180 de Apple: el favicon blanco sobre `#001A39`, generados con el `sharp` que trae Next | Los mismos archivos |
| `<head>` (`app/layout.tsx`) | `viewport.themeColor`, `appleWebApp` e `icons.apple` (iOS no lee el manifiesto para eso) | Igual |
| Service worker (`public/sw.js`) | Red primero. Guarda copia de las páginas públicas (tope 50) y de las imágenes (80). `/_next/static/` sale de la copia (200) | Solo guarda `/_next/static/` y la página sin conexión. Las páginas van siempre a la red |
| Página sin conexión (`public/assets/pwa/sin-conexion.html`) | HTML plano, sin scripts: «Intentar de nuevo» e «Ir al inicio» | Igual, con su propio texto y solo «Intentar de nuevo» |
| Registro (`shared/lib/pwa/`) | `RegistrarServiceWorker` en el layout raíz. Solo en producción; en `next dev` desinstala y borra lo que haya quedado de un build probado en el mismo puerto | Igual |
| `next.config` | `/sw.js` sin caché y con su propia CSP (`default-src 'self'`) | Igual, más `worker-src 'self'` y `manifest-src 'self'` en la CSP general |
| `middleware.ts` | Sin cambios: su `matcher` es una lista explícita y no toca estas rutas | El `matcher` deja pasar `sw.js` y `manifest.webmanifest`. Sin eso el navegador los recibía redirigidos al login y la intranet no se podía instalar |

**Por qué red primero y no copia primero.** El sitio lo editan personas que publican y
recargan esperando ver su cambio. Si el service worker sirviera primero la copia, verían la
versión anterior. Con internet, todo sale de la red como antes; la copia solo se usa cuando
la red falla. La excepción es `/_next/static/`: Next pone un hash en el nombre de esos
archivos, así que un nombre nunca cambia de contenido.

**Qué no se guarda nunca en el sitio-web.** `/admin`, `/editor`, `/preview`, `/api`,
`/api-backend` y las pantallas de acceso (`RUTAS_PRIVADAS` en `sw.js`). De respaldo, tampoco
ninguna respuesta con `no-store` o `private`, que es como Next marca las páginas que leen la
sesión. Así, si mañana aparece una ruta privada nueva (el middleware ya anuncia `/portal` y
`/mi-cuenta`) y nadie la añade a la lista, igual no se guarda.

**Descartado: `next-pwa` o una librería parecida.** `next-pwa` se engancha al build de
webpack y este proyecto compila con Turbopack. Además, el service worker propio son unas 150
líneas que se leen de una vez: se ve exactamente qué se guarda. Una dependencia más no
aportaba.

### Hallazgo: cuatro páginas públicas no se pueden guardar

`/[slug]`, `/clasificacion/cno`, `/clasificacion/cuoc` e `/inicio/politica-de-privacidad`
llaman en el servidor a `puedeEditarPaginas()`, que lee la cookie de sesión. Por eso Next las
compila como dinámicas (ƒ en la tabla del build) y responde
`Cache-Control: private, no-cache, no-store`, así que la red de seguridad las deja fuera. No
es un error del service worker: la página puede cambiar según quién la mire (a un editor le
muestra «Editar sección» si está vacía). Hoy, sin conexión solo abren las ISR ya visitadas:
`/inicio`, `/clasificacion` y `/programas-sobresalientes`. El texto de la página sin
conexión lo dice así («Algunas páginas que ya visitaste, como el inicio…»).

El arreglo, si se quiere, es resolver ese permiso en el navegador, como ya lo hace
`PaginasFabSpeedDial` en el layout público. Así esas páginas pasarían a ISR: se podrían
guardar y además cargarían más rápido, porque hoy cada visita consulta la API.

### Verificado

`next build` de producción de las dos apps; `next start` en los puertos 3200 y 3201 (los de
desarrollo no se tocaron) y Chrome headless por CDP. Para simular la falta de red se apagó el
servidor. La API estaba apagada, así que las páginas públicas se pintaron con su contenido de
respaldo.

| Prueba | Sitio-web | Intranet |
|---|---|---|
| `tsc --noEmit` y ESLint sobre lo tocado | Limpios | Limpios |
| `next build` | Exit 0; `/manifest.webmanifest` estático (○) | Exit 0; ídem |
| `GET /manifest.webmanifest` sin sesión | 200 `application/manifest+json` | 200, **no** redirige al login |
| `GET /sw.js` | 200, `no-cache, no-store` y su CSP | Igual |
| Primera visita | Service worker `activated`, controla la página | Igual (desde `/login`, sin sesión) |
| `Page.getAppManifest` / `Page.getInstallabilityErrors` | Sin errores / `[]` | Sin errores / `[]` |
| Qué guardó tras visitar páginas públicas, `/login` y `/admin/dashboard` | Páginas: solo `/inicio` y `/clasificacion`. Nada de `/login` ni del panel. 12 imágenes, 29 estáticos | Solo la página sin conexión, su ícono y 19 estáticos. Ninguna página |
| Sin red: página visitada | `/inicio` y `/clasificacion` desde la copia, con su URL | «Estás sin conexión» |
| Sin red: página dinámica, privada o no visitada | «Estás sin conexión» (`/clasificacion/cno`, `/admin/dashboard`, `/login`, `/programas-sobresalientes`) | «Estás sin conexión» en todas |
| Captura a 390 px de la página sin conexión | Revisada: logo, título, dos botones de 44 px | Revisada |

No se comprobó con un 200 real que la red de seguridad `no-store` deje fuera una página
dinámica: sin la API, esas rutas daban 404, y un 404 tampoco se guarda. Sí se comprobó la
cabecera que la activa: `private, no-cache, no-store, max-age=0, must-revalidate` en
`/clasificacion/cno` y en `/inicio/politica-de-privacidad`.

> **Trampa para quien pruebe esto con Chrome headless en este equipo:** si el perfil
> (`--user-data-dir`) queda en una ruta larga como el scratchpad, el service worker nunca se
> instala, y sin ningún error en la página. El motivo es que CacheStorage anida unos 140
> caracteres dentro del perfil y se pasa del límite de 260 de Windows. Solo lo delata el
> dominio `ServiceWorker` de CDP: `Failed to execute 'open' on 'CacheStorage': Unexpected
> internal error`. Con el perfil en `%LOCALAPPDATA%\Temp\olo-pwa-<puerto>` funciona.

**Pendiente al cierre:**
- Probar la instalación en el servidor real, por el túnel (https) y desde un celular.
  Falta confirmar que el aviso de Microsoft (*You are about to connect to a developer
  tunnel*) no se pone en lugar del manifiesto: el navegador lo pide sin cookies.
  `docker/7-despliegue.md` tiene las filas de A8 y una entrada en «Solución de problemas».
- Si se quiere que `/[slug]` y las otras tres se vean sin conexión, pasarlas a ISR (arriba).
- Si un cambio en un `sw.js` altera qué se guarda, subir su `VERSION`: así la versión nueva
  borra las cachés de la anterior al activarse.

---

## sesión 24-09-2026 (8.ª parte): menos texto y un flag de color por estado en «Criterios de clasificación»

**Qué era.** El usuario pidió bajar la carga cognitiva de la tarjeta: quitar texto redundante,
mensajes más claros y limpios, y estados con flags de color. Lo que se repetía: el año y periodo
salían hasta cuatro veces en el recuadro de resultado (título, mensaje, explicación y botón); la
idea «borrador / el sitio solo muestra lo publicado» se explicaba en la descripción, en el aviso
de pendientes y en el resultado; el historial tenía dos columnas de estado («Estado: Completada» y
«En el sitio: Borrador») y un resultado que repetía año, periodo y «quedó en borrador».

### Qué quedó

| Parte | Antes → ahora |
|---|---|
| `EstadoFlag` (`components/estado-flag.tsx`) | Nuevo. Un color por estado, el mismo en toda la tarjeta, **siempre con texto**: Libre (gris), En curso / Procesando % (azul, pulsa), Borrador (ámbar), Publicado (verde), Con errores (rojo), Inactiva (gris apagado). Lo que no cabe (fecha de publicación, por qué está inactiva) va en el `title`. `estadoDeCelda`, `estadoDeCarga` y `resumenDeFilas` concentran la traducción |
| Descripción | 3 frases → «Percentiles de inscritos y vacantes para Tendencia Ocupacional. Un archivo .xlsx por año y periodo.» Lo de las hojas pasó al `title` del campo de archivo; la regla de periodo ocupado la dice el formulario cuando aplica |
| Aviso de pendientes | Título + párrafo + lista → una línea: flag «Sin publicar», las celdas con su «Publicar» y «Publicar todos» |
| Estado de la celda elegida | Frase larga con icono → flag + «2026 · Tercer trimestre» y, solo si está ocupada, «Ya tiene datos: para cambiarlos, elimine su carga. Ver en el historial» |
| Avisos del nombre del archivo | «Año y periodo tomados del nombre del archivo.» / «El nombre del archivo sugiere 2025 · Anual.» |
| Resultado de la carga | 4 líneas → una: flag + celda + «20.774 filas (611 nacionales · 20.163 departamentales)» + «Publicar en el sitio». El flag sale de la matriz, así que pasa a «Publicado» al publicar. Tras subir se limpia el periodo (se queda el año): el estado de la celda repetía lo que ya dice el resultado |
| Historial | «Estado» + «En el sitio» → un solo flag. «Resultado»: las filas (de `filasNacional`/`filasDepartamental`, no del mensaje guardado); en error, el mensaje. Acciones juntas al final: Publicar, Despublicar, papelera. Fuera «Con «reemplazar»» |
| Diálogos | Eliminar: qué se borra, lo que depende del caso y al final «No se puede deshacer». Despublicar: «El sitio deja de mostrarlo. Los datos quedan en borrador y se pueden volver a publicar.» |
| Aviso tras eliminar | «2023 · Primer semestre: se eliminó la carga y su archivo.» (+ «Ya no se ve en el sitio.» o «El archivo se conservó: lo usa otra carga.» solo si aplica) |
| API: mensaje de error | «No se cargó: V1 · … El detalle está en el reporte de la carga.» → «V1 · Departamento no reconocido (1).» (el flag y «Ver reporte» ya decían lo demás). Las cargas viejas conservan su texto |

### Verificado

Postgres 18 desechable con todos los estados a la vez (publicado, borrador, con errores e inactiva
—esta hecha por SQL, porque la API ya no la produce—), API de prueba en el 4100 y el panel real en
el 3000 con Chrome headless: textos leídos uno a uno y tres capturas (arriba, resultado, historial).

| Pantalla | Lo que se lee |
|---|---|
| Aviso | «Sin publicar · 2027 · Primer trimestre [Publicar] · 2025 · Anual [Publicar] · Publicar todos» |
| Celda ocupada | «Publicado · 2026 · Tercer trimestre · Ya tiene datos: para cambiarlos, elimine su carga. Ver en el historial» |
| Celda libre | «Libre · 2028 · Primer trimestre» |
| Resultado | «Borrador · 2028 · Primer trimestre · 20.774 filas (611 nacionales · 20.163 departamentales) · Publicar en el sitio», sin el estado repetido arriba |
| Historial | Publicado / Con errores («V1 · Departamento no reconocido (1).» + Ver reporte) / Inactiva / Borrador, con sus acciones |
| Diálogos y aviso | Como en la tabla de arriba |
| `tsc --noEmit` | Limpio en la API y el sitio-web; ESLint limpio en el sitio-web |

Limpieza: contenedor y API de prueba detenidos, Redis base 7 vaciada, los 3 Excel de prueba que
quedaban borrados (siguen los 10 del usuario).

**Visto y no tocado:** el historial muestra el nombre del **primer** archivo con ese contenido, no el
de cada subida: los Excel se deduplican por contenido y `archivos` guarda un solo nombre. Subir
«1er trimestre 2024.xlsx» con el mismo contenido que «percentiles_2024_ANUAL.xlsx» aparece con este
último. Ahora que el mismo archivo va a varios periodos se nota más; arreglarlo pide guardar el
nombre en cada carga (una columna en `cargas_datos`, migración nueva).

**Pendiente al cierre:** reiniciar la API (el mensaje de error nuevo es del backend). Sin migración nueva.

---

## sesión 24-09-2026 (7.ª parte): el año se elige en un calendario y es libre (proyecciones incluidas)

**Qué era.** El usuario pidió cambiar el desplegable de años por un selector «tipo calendario»,
en el panel y en la consulta del sitio, y preguntó cómo elegir 2027. Mientras se hacía, pidió una
«proyección futura de muchos años» y luego, al ver «El año debe estar entre 2012 y 2026», que el
año **no tenga regla de rango**: elegir libremente el archivo y asociarle su año. El año venía
acotado en cuatro lugares: la lista del panel (la matriz, 2012..año actual), el validador de la
API (2012–2100), la comprobación de la subida (2012..año actual) y el CHECK de la base (2012–2100).

### Qué quedó

| Parte | Qué hace |
|---|---|
| `YearPicker` (`shared/ui/molecules/year-picker.tsx`) | Hermano de `DatePicker`, mismo campo y mismo panel: una década en rejilla de 3 × 4 (con el año anterior y el siguiente apagados, como los días de otro mes), flechas de década, «Este año», y una casilla **para escribir el año** (solo cifras; con cuatro salta a su década; Enter o «Elegir» lo eligen, y avisa si está fuera de rango o sin datos). Opcional: `disponibles` (solo esos años) y `textoSinAnio` («Todos los años») |
| Panel | Año del formulario y filtro del historial con el calendario. Cualquier año de cuatro cifras (`RANGO_ANIOS_TENDENCIA`). Un año que la matriz aún no trae (uno futuro antes de cargarlo) cuenta como libre |
| Sitio | El filtro de año del bloque de Tendencia Ocupacional usa el calendario: entre el primer y el último año publicado, y los de en medio sin datos apagados |
| API | `anio` del validador: 1000–9999 (buscador, historial y subida). La subida ya no compara con el año actual |
| Migración 035 | `035-tendencia-anio-libre`: quita los CHECK de `anio` de `cortes_ocupacionales` y `cargas_datos_ocupacionales` **por definición** (como la 008) y pone «cuatro cifras»; la matriz `v_estado_cargas_ocupacional` va del menor al mayor año con corte **o carga** (antes no veía un 2005, ni un año futuro con la carga en curso o fallida). En su propia transacción, como la 032 |
| Año por defecto del sitio | `/opciones` sin año propone el más reciente **que no sea futuro** (si solo hay futuros, el más cercano): con proyecciones publicadas, quien llega ve primero los datos de hoy. Antes era el mayor, que con una proyección a 2040 abría el sitio en 2040 |

### Verificado

Postgres 18 desechable, API de prueba en el 4100 con Redis en la base 7, panel real en el 3000 y
el **inicio real** del sitio: allí solo las peticiones de tendencia fueron a la API de prueba, el
resto a la del usuario, y cualquier escritura se bloqueó (solo hubo una: el contador de visitas).

| Prueba | Resultado |
|---|---|
| Migración 035 sobre una base con 033–034 y datos | CHECK nuevos `ck_*_anio` (1000–9999) en las dos tablas |
| Año 999 / 10000 | 400 |
| Cargar 1998 · T1 y 2150 · S2 (y antes 2035, 2040) | Cargan; la matriz va de 1998 a 2150 (1.071 celdas) |
| `/opciones` con 1998, 2024, 2026, 2035, 2040 y 2150 publicados | Ofrece los seis; año por defecto **2026** |
| Revertir la 035 con 1998 y 2150 cargados | Falla sin tocar nada: siguen los CHECK nuevos y la 035 aplicada |
| Panel: calendario del año | Abre en 2020–2029; «0999» → «Elija un año entre 1000 y 9999.»; «2045» salta a 2040–2049 y Enter lo elige → «2045 · Primer trimestre: Libre» |
| Panel: 1998 · Primer trimestre | «Ya tiene datos publicados… No admite otro archivo» |
| Panel: filtro del historial | «Todos los años» → escribir 2150 → una fila → «Todos los años» → todas |
| Sitio: por defecto | 2026 · Tercer trimestre |
| Sitio: calendario | En 2020–2029 solo 2024 y 2026 elegibles; «2030» → «2030 no tiene datos.»; «2150» + Enter → 2150 · Segundo semestre, 81 registros |
| `tsc --noEmit` | Limpio en la API y el sitio-web; ESLint limpio en el sitio-web |

Durante las pruebas se vio que faltaba `fccc6e2e…xlsx` (el `data2.xlsx` del usuario) en
`uploads/cargas-datos`: no lo borró la limpieza (estaba en la lista de antes de la prueba 4 y no entre
los 6 que esa limpieza borró); desapareció después, junto con dos archivos nuevos del usuario (07:28
y 07:30), lo que corresponde a que eliminó esa carga desde el panel. Limpieza de esta ronda:
contenedor y API de prueba detenidos, Redis base 7 vaciada, los 3 Excel de la prueba borrados
(quedan los 10 que había).

**Pendiente al cierre:** `npm run migrate` (aplica la 035, y la 034 si faltaba) y **después** reiniciar la
API: el «El año debe estar entre 2012 y 2026» que vio el usuario sale de la API sin reiniciar.

---

## sesión 24-09-2026 (6.ª parte): un año y periodo con datos no admite otra carga

**Qué era.** El usuario definió la regla: si un periodo ya está cargado (por ejemplo 2026 · Tercer
trimestre), no se puede volver a subir un archivo a ese mismo periodo; si está libre, se guarda
normal. Hasta ahora una celda en borrador se sobrescribía sin más, y una publicada con la casilla
«Reemplazar los datos publicados».

### Qué quedó

| Parte | Cambio |
|---|---|
| Formulario | Se quitó la casilla «reemplazar». Con el año elegido, el desplegable de periodo marca «· ya cargado» (o «· en curso») los ocupados. Al elegir uno, aviso ámbar («Ya tiene datos en borrador/publicados. No admite otro archivo: para cambiarlo, elimine primero su carga desde el historial») con **«Ver en el historial»**, que filtra el historial por esa celda; «Cargar» queda deshabilitado. Una celda sin datos o cuyo último intento falló sale como «Libre» |
| Subida (API) | `iniciarCargaTendencia` responde 409 si la celda tiene corte o una carga en curso, **antes** de guardar el Excel. `reemplazar` salió del validador (`.strict()`: enviarlo da 400), del controlador y de `crearCarga` |
| Worker | Con el candado de la celda tomado, comprueba otra vez que esté libre y, si no, termina en error con el mismo mensaje (`CONFLICTO`), sin validar las 20.000 filas. Cubre dos subidas simultáneas a la misma celda vacía, que pasan las dos el primer control |
| Corte | `crearOObtenerCorte` (upsert) → `crearCorte` (`INSERT` sin `ON CONFLICT`); `reemplazarIndicadores` → `guardarIndicadores` (sin el `DELETE`). El mensaje de la carga es siempre «…; quedó en borrador» |
| Texto compartido | `mensajeCeldaOcupada` en `reporte-carga.ts`, para que la subida y el worker digan lo mismo |
| Historial | Sin cambios: «Con «reemplazar»» sigue apareciendo en las cargas viejas que lo usaron |

**Arreglo de paso** (encontrado al probar): `validarYGuardarExcel`, compartido con «Programa +
Sobresalientes». Si se subía el mismo Excel nuevo dos veces a la vez, las dos peticiones pasaban la
búsqueda por hash y la segunda chocaba con `archivos.hash_sha256 UNIQUE`: respondía 500 y dejaba
una copia huérfana en disco. Ahora borra su copia y usa la fila de la primera.

### Verificado

Postgres 18 desechable (001–034), API de prueba en el 4100 con Redis en la base 7, y el panel real
(`next dev` en el 3000) contra esa API.

| Prueba | Resultado |
|---|---|
| 2026 · T3 libre | Carga normal, «quedó en borrador» |
| Otra vez 2026 · T3 (borrador) | 409 «2026 · Tercer trimestre ya tiene datos en borrador. Para subir otro archivo, elimine primero su carga desde el historial.»; ni archivo nuevo en disco ni carga |
| 2026 · T3 publicado | 409 «…ya tiene datos publicados…» |
| Enviar `reemplazar=true` | 400 (campo desconocido) |
| 2026 · T2 libre | Carga normal |
| Dos subidas a la vez a una celda vacía (mismo Excel y Excel distintos) | Las dos 202; una completa y la otra termina en error «…ya tiene datos en borrador…»; un solo corte |
| Eliminar la carga de 2026 · T3 y volver a subir | Admite el archivo y carga |
| Mismo Excel nuevo subido dos veces a la vez | Antes: 500 y copia huérfana. Ahora: 202 y 202, una fila en `archivos`, un solo archivo en disco |
| Panel: año 2026 | Periodos «Segundo trimestre · ya cargado», «Tercer trimestre · ya cargado»; los demás limpios |
| Panel: Tercer trimestre + archivo | Aviso ámbar con «Ver en el historial»; «Cargar» deshabilitado; el filtro del historial queda en 2026 · Tercer trimestre |
| Panel: Primer trimestre | «Libre: todavía no tiene datos.»; «Cargar» habilitado |
| `tsc --noEmit` | Limpio en la API y el sitio-web; ESLint limpio en el sitio-web |

La primera captura cortaba «Tercer trimestre · ya ca…»; la columna de periodo pasó de 14 a 18 rem.
Limpieza: contenedor y API de prueba detenidos, Redis base 7 vaciada, los 6 archivos de la prueba
borrados de `uploads/cargas-datos` (quedan los 9 que había).

**Pendiente al cierre:** reiniciar la API. No hay migración nueva (la 034 sigue pendiente si no se aplicó).

---

## sesión 24-09-2026 (5.ª parte): eliminar cargas de tendencia del historial, con su Excel

**Qué era.** El usuario pidió un botón para eliminar cargas del historial de «Criterios de
clasificación de resultados» y que su archivo se borre del almacenamiento. Hasta ahora esas cargas
no se borraban (la ruta de programas respondía 409).

### Qué quedó

| Parte | Qué hace |
|---|---|
| Botón | Papelera al final de cada fila del historial (mismo estilo que el de «Programa + Sobresalientes»), solo para quien puede actualizar. Confirma con un texto que cambia según el caso: reemplazada o fallida («los datos no cambian»), **vigente** («también se borran los datos de 2026 · T3», y si está publicada, «el sitio deja de mostrar ese periodo»), o «procesando» |
| Aviso | Tras eliminar: qué se borró, si se fueron los datos y si el Excel salió del almacenamiento o se conservó porque otra carga usa el mismo archivo |
| API | `DELETE /api/observatorio/tendencia-ocupacional/cargas/:id` (`puedePublicarDatos`, porque puede quitar datos publicados): responde `{ datosEliminados, archivoEliminado }`. 404 si no existe, 409 si una carga está guardando en esa celda |
| Vigente | Si la carga es la que puso los datos del corte, se borra el corte con sus indicadores (CASCADE) y la celda vuelve a «sin datos». Dejar los datos sin su carga los dejaría sin origen, y Publicar/Despublicar pasaría a una carga anterior cuyos datos ya no están |
| Excel | `eliminarArchivoSiQuedaSuelto` (extraída de `eliminarCargaObservatorio`, la usan las dos): se borra de `uploads/cargas-datos/` y de `archivos` solo si nadie más lo usa. Importa ahora que el mismo Excel puede ir a varios periodos: es **un** archivo compartido |
| Carreras | El borrado toma el candado de la celda sin esperar (`pg_try_advisory_xact_lock`, misma llave que la carga, ahora en `CANDADO_CELDA`). El cargador lee el Excel *antes* de tomar el candado, así que con el candado ya tomado comprueba que su carga siga existiendo (`carga.sigueExistiendo`); si se eliminó en ese rato, no guarda nada |
| `vigente` | La regla pasó a `ES_VIGENTE`, compartida por el historial y el borrado, y ahora exige que el corte siga en pie |

La ruta genérica `DELETE /api/observatorio/cargas/:id` sigue rechazando las de tendencia (409),
ahora indicando la ruta correcta: no sabe borrar el corte.

### Verificado

Postgres 18 desechable (001–034), API de prueba en el 4100 con Redis en la base 7, el `data2.xlsx`
real del usuario y los Excel de prueba; y el panel real (`next dev` en el 3000) contra esa API.

| Prueba | Resultado |
|---|---|
| Mismo Excel en 2026 · T3 y T2 | Un solo archivo compartido |
| Eliminar la vigente de T2 (borrador) | Se va el corte de T2; T3 intacto (20.774 filas); el Excel **se conserva** (lo usa T3): `archivoEliminado: false` |
| Eliminar una reemplazada de 2025 · Anual | Los datos no cambian, la v2 sigue vigente, su Excel sale del disco |
| Eliminar la vigente publicada de 2026 · T3 | `estabaPublicado: true`; `/opciones` deja de ofrecer 2026; el Excel, ya sin dueños, sale del disco; la celda vuelve a «pendiente» |
| Eliminar una fallida | Se borra con su Excel |
| Candado de la celda tomado por otra sesión | 409 «Hay una carga guardando datos en 2025 · Anual…»; la carga sigue |
| Eliminar recién subida (el worker abriendo el Excel), dos veces | 200; el worker registra «La carga se eliminó del historial antes de guardarse» y no deja corte |
| Borrar con la carga ya guardando | 409 (el primer intento de esta prueba cayó ahí: el progreso en la base va detrás) |
| Ruta de programas con una de tendencia / sin sesión / id inválido | 409 / 401 / 400 |
| Panel: papelera en una reemplazada | Diálogo «Los datos de 2025 · Anual no cambian»; Cancelar |
| Panel: papelera en la vigente 2024 · T1 | Diálogo «Es la carga vigente: también se borran los datos…»; al eliminar, aviso con lo borrado, la fila se va y 2024 · T1 sale de «pendientes de publicar» |
| `tsc --noEmit` | Limpio en la API y el sitio-web; ESLint limpio en el sitio-web |

Limpieza: contenedor y API de prueba detenidos, Redis base 7 vaciada, `uploads/cargas-datos` con los
mismos 10 archivos de antes (la prueba dejó uno, que se borró; los demás ya los había borrado la
propia función).

**Pendiente al cierre:** reiniciar la API (sin migración nueva; la 034 sigue pendiente si no se aplicó).
Eliminar no deja fila en `auditoria_cambios`, igual que publicar y despublicar.

---

## sesión 24-09-2026 (4.ª parte): el mismo archivo se puede cargar en varios periodos (sin V10)

**Qué pasó.** Al cargar el mismo Excel en otro periodo, la carga fallaba con «Este mismo
contenido ya está cargado en 2026 · Tercer trimestre. Revise que el archivo corresponda a la celda
elegida.» Era V10 de la especificación, que suponía que dos celdas con el mismo contenido son un
error de archivo. El usuario pidió quitarla: los datos pueden repetirse entre periodos, y lo que
importa es que cada periodo quede guardado y se muestre.

### Qué quedó

| Parte | Cambio |
|---|---|
| Cargador | `importarPercentilesExcel` ya no compara la huella con otras celdas; se quitó `celdaConMismaHuella` del repositorio y `V10` del catálogo de validaciones. La huella se sigue calculando y guardando en el corte |
| Migración 034 | `034-cortes-ocupacionales-huella-repetible`: `DROP CONSTRAINT IF EXISTS uq_cortes_ocupacionales_huella`. Sin ella, quitar la validación no alcanzaba: la base habría rechazado el corte al guardarlo. `down`: deja en NULL las huellas repetidas salvo la del corte más antiguo y recrea el `UNIQUE` |
| Cargas viejas | La que falló con V10 sigue en el historial con su reporte (cada hallazgo guarda su descripción). No se borra: es trazabilidad |
| Textos | «V1–V10» → «V1–V9» en la barra de progreso, la ruta documentada y comentarios; la 033 anota que la 034 quitó el `UNIQUE` |
| Docs | `11-base-de-datos.md`: I19 tachada como retirada, fila de la 034, §4.6.1. `12-diccionario-de-datos.md` §3.17 y `1-guia-del-proyecto.md` |

Es una desviación consciente de `criterios/002_carga_y_validaciones.sql` (bloque V10), que no se tocó.

### Verificado

Postgres 18 desechable con 001–034 aplicadas desde cero, llamando al cargador directamente con el
`data2.xlsx` real del usuario:

| Prueba | Resultado |
|---|---|
| Restricciones únicas de `cortes_ocupacionales` tras la 034 | Solo `(anio, periodo_id)` |
| El mismo archivo en 2026 · T3, 2026 · T2 y 2025 · Anual | Las tres cargan: 20.774 filas cada una, misma huella `a26ad71f…` |
| `migrate:down` con esas tres huellas repetidas | Revierte: T3 conserva la huella, T2 y Anual quedan en NULL, vuelve el `UNIQUE` |
| `migrate up` otra vez | Aplica la 034 sin error |
| `tsc --noEmit` | Limpio en la API y el sitio-web; ESLint limpio en el sitio-web (la API no tiene configuración de ESLint) |

**Pendiente al cierre:** `npm run migrate` en `api-backend` (aplica la 034 en Neon) y **después**
reiniciar la API. En otro orden, el archivo repetido fallaría con un error de llave duplicada en vez
del mensaje de V10.

---

## sesión 24-09-2026 (3.ª parte): lo cargado sin publicar se ve, y se publica, desde la tarjeta

**Qué pasó.** El usuario cargó `data2.xlsx` (2026 · Tercer trimestre), recargó el inicio y los
bloques de Tendencia Ocupacional seguían sin datos. La carga había salido bien —20.774 filas,
611 nacionales y 20.163 departamentales, con los cuatro criterios poblados (54, 30, 37 y 457
ocupaciones nacionales con registros)—, pero el corte quedó en **borrador**, y la consulta pública
exige `corte_estado = 'publicado'` (`tendencia-ocupacional.repository.ts`). Para el sitio no había
ningún año con datos: `GET …/opciones` devolvía `anios: []` y el bloque decía «Todavía no hay datos
publicados». No era un fallo del cargador sino de la tarjeta: el recuadro verde «Carga completada»
se leía como el final, y el botón de publicar pasaba desapercibido (y desaparece al recargar la página).

### Qué quedó

| Parte | Qué hace |
|---|---|
| Aviso de pendientes | Arriba de la tarjeta, en ámbar, siempre que haya cortes en borrador: «Hay N periodos cargados que el sitio todavía no muestra», cada uno con «Publicar», y «Publicar los N» si hay más de uno (la API ya aceptaba una lista). Sale de la matriz `/estado`, así que sobrevive a recargar la página. En solo lectura dice que un Administrador debe publicarlos |
| Resultado de la carga | Si quedó en borrador pasa a ámbar: «Carga completada, falta publicarla», con «El sitio todavía no muestra estos datos» y el botón. Al publicar, verde: «Carga completada y publicada · Ya se ve en los bloques del sitio». Ese corte no se repite en el aviso de arriba |
| Hook | `publicar(...corteIds)` publica varios en una llamada; `corteEnAccion` pasó a `cortesEnAccion: number[]` |

No se cambió el flujo: la carga sigue quedando en borrador para revisar el reporte (V6–V9) antes
de publicarla, como pide la especificación.

### Verificado

Panel real (`next dev` del usuario en el 3000) contra la API real (4000, Neon) con Chrome headless
por CDP, **sin escribir en Neon**: las lecturas pasan; `POST …/cortes/publicar` y la subida se
contestan desde el navegador; cualquier otra escritura se bloquea (no hubo ninguna). A `/estado`
se le inyectó un 2025 · Anual en borrador inventado.

| Prueba | Resultado |
|---|---|
| Al entrar | Aviso con «2026 · Tercer trimestre» (el real) y «2025 · Anual», y «Publicar los 2» |
| Publicar 2025 · Anual desde el aviso | Queda «Hay un periodo…» solo con 2026 · Tercer trimestre, sin «Publicar los» |
| Subida simulada de 2024 · T1 | Recuadro ámbar «Carga completada, falta publicarla» con su botón; 2024 · T1 no se repite en el aviso |
| Publicar desde el resultado | «Carga completada y publicada … Ya se ve en los bloques de Tendencia Ocupacional del sitio» |
| `tsc --noEmit` y ESLint | Limpios en el sitio-web |

**Pendiente al cierre:** publicar 2026 · Tercer trimestre. Lo hace el usuario desde la tarjeta:
es su decisión y queda a su nombre. Lo demás, igual que en la entrada anterior.

---

## sesión 24-09-2026 (2.ª parte): formulario de carga por año y periodo, e historial, en «Criterios de clasificación de resultados»

**Qué era.** La tarjeta «Criterios de clasificación de resultados» de Actualizaciones decía
«Próximamente», y los percentiles solo se podían cargar por Swagger o `curl` (ver la entrada
anterior). El usuario pidió un formulario para cargar cada archivo con su año y periodo, y un
historial que dé trazabilidad de cada año y periodo.

### Qué quedó

La tarjeta ocupa todo el ancho de la página (lleva formulario y tabla); las otras tres pasan a
una fila de tres.

| Parte | Qué hace |
|---|---|
| Formulario | Año y periodo salen de la matriz de la API (2012..año actual × 7), nada fijo. Si el archivo se llama como `percentiles_2025_T1.xlsx` o «1er trimestre 2019», se **proponen** solos (`lib/detectar-celda.ts`, el detector de la especificación §8, con sus 11 casos de prueba) y se avisa; si el nombre contradice la celda elegida, se advierte |
| Estado de la celda | Debajo de los desplegables dice qué tiene ya: sin datos, en borrador, publicada, fallida o en curso. Una celda **publicada** exige marcar «Reemplazar los datos publicados»; sin eso el botón no se habilita (la API respondería 409). Con una carga en curso en esa celda, tampoco |
| Carga | Barra de progreso real (fases del worker: leer, preparar, validar V1–V10, guardar) y resultado con el mensaje y el reporte de validaciones desplegable, con filas de ejemplo («fila 102 · departamento: Amazonía»). Si quedó en borrador, botón «Publicar en el sitio» ahí mismo |
| Historial | Una fila por archivo subido: año y periodo, archivo, quién y cuándo, estado, resultado + reporte, y **qué ve hoy el sitio**. Filtros por año y periodo, paginado de a 10. Solo la carga **vigente** de cada celda (la más reciente que terminó bien) lleva Publicar/Despublicar; las anteriores dicen «Reemplazada». Despublicar pide confirmación |

**Backend.** `GET …/tendencia-ocupacional/cargas` pasó a `{ cargas, total, pagina, porPagina,
totalPaginas }` con filtros `anio`, `periodo`, y cada carga trae `subidoPorNombre`,
`corteEstado`, `cortePublicadoEn` y `vigente`. La ruta de borrado de programas rechaza las
cargas de tendencia (409): son el historial y no se borran. El mensaje de cada carga pasó a
«…; quedó en borrador» / «…; reemplazó los datos publicados»: queda escrito y describe lo que
pasó al cargar, y «en borrador» se leía como el estado actual aunque luego se publicara.

**Refactor de paso:** la barra de progreso de «Programa + Sobresalientes» pasó a
`components/barra-de-progreso.tsx` con la fase como prop, para las dos tarjetas.

### Verificado

Otra vez sobre un Postgres 18 local desechable (001–033 + tablas de programas de Neon), la API
de prueba en el 4100 con Redis en la base 7, y el panel real (`next dev` del usuario en el 3000)
conducido con Chrome headless por CDP con una sesión de la cuenta maestra local.

| Prueba | Resultado |
|---|---|
| «1er trimestre 2024.xlsx» sin elegir celda | Propone 2024 · Primer trimestre, lo avisa, carga, barra de progreso, resultado con «Publicar» |
| 2025 · Primer trimestre + archivo «percentiles_2025_ANUAL» | Aviso: el nombre sugiere 2025 · Anual. Al elegir Anual, el aviso se va |
| Publicar desde el resultado | El historial pasa a «Publicado desde …» con «Despublicar» |
| Otro archivo para 2025 · Anual (publicada) | Botón deshabilitado hasta marcar «reemplazar»; carga; la fila anterior queda «Reemplazada» y la nueva sigue publicada |
| Archivo con «Amazonía» | Resultado rojo: V1 con la fila 102, y V9 como advertencia |
| Filtro del historial por 2025 | 2 filas |
| API: `?periodo=T9` | 400 |
| API: `DELETE /api/observatorio/cargas/:id` con una carga de tendencia | 409; las cargas siguen ahí |
| Nombre de quien carga | «Ana María Rojas» con un usuario real; «Cuenta local» con la maestra |
| `tsc --noEmit` y ESLint | Limpios en la API y en el sitio-web |

Tras la primera captura la columna «En el sitio» quedaba cortada y exigía desplazar la tabla
de lado justo donde está el botón; se ajustaron anchos y se partió «Borrador · no visible» en dos
líneas. Segunda captura: la tabla cabe entera a 1440 px.

**Pendiente al cierre:**

- Lo mismo de la entrada anterior: `npm run migrate` + reiniciar la API, y `next build` con el dev
  detenido.
- La **matriz visual** año × periodo y la **carga masiva** de varios archivos (§8 de la
  especificación): la API ya los sostiene (`/estado`, detector de celda en el front); falta la pantalla.
- Publicar y despublicar siguen sin fila en `auditoria_cambios`; el historial de cargas sí guarda
  quién cargó, pero no quién publicó.

---

## sesión 24-09-2026: la tendencia ocupacional lee de la base, por criterio, y un solo catálogo de departamentos

**Qué era.** El bloque "Tendencia Ocupacional" del sitio pedía `GET /api/observatorio/tendencia-ocupacional?tipo=…`
y la API leía uno de cuatro Excel sueltos de `uploads/cargas-datos/` (`base-tendencia-1..4.xlsx`,
uno por cuadrante) y los devolvía enteros; el front filtraba en memoria. Los años y periodos
salían de lo que trajera el archivo, y había un "todos" que sumaba periodos distintos. La base
para reemplazarlo estaba planeada en `criterios/` (análisis del Excel real, DDL y SQL de carga,
probados con el archivo completo): se implementó eso.

**Alcance acordado con el usuario:** consulta + cargador en el backend; el panel con la matriz
año × periodo queda para la siguiente entrega. Un solo catálogo de departamentos para los dos
módulos sin romper la carga ni los buscadores de ninguno. Las filas con 0 inscritos y 0 vacantes
se ocultan por defecto, con un interruptor para verlas. La carga pasa por el mismo sistema de
"Programa + Sobresalientes".

### Un catálogo de departamentos, depurado en su sitio (migración 032)

`departamentos` lo llenaba el importador de programas con el nombre tal como viniera: en Neon
tenía «Distrito Capital», «Valle», «Guajira», **tres Vaupés** («Vaupes», «Vaupés» y «Vupes», este
sin código) y le faltaban Caquetá, Chocó y Vichada. La especificación pedía reutilizar la tabla
si existía; se depuró **conservando los UUID**, así que ninguna FK de programas cambió:

| Paso | Qué hace | Con los datos de Neon |
|---|---|---|
| Resolver | Cada fila a su código DANE por nombre normalizado (alias) o el código que ya tenía | 31 resuelven; «Vupes» no |
| Sin código | Se borra con sus centros **si no tiene datos**; si los tuviera, la migración se detiene | «Vupes» y su centro vacío («…Agropecuarioss…») |
| Duplicados | Sobrevive el que ya tiene el nombre oficial; los otros le pasan centros y datos. Si dos variantes tienen un centro con el mismo nombre, se detiene | «Vaupes» → «Vaupés» (su centro, sin datos, pasa con él) |
| Nombres | Oficiales; se insertan los que faltan | 33 departamentos |
| Restricciones | `codigo_dane` CHAR(2) obligatorio, único y de dos dígitos | — |
| Alias | `departamentos_alias`: los nombres de los Excel reales de los dos módulos | 41 alias |

El importador de programas **ya no crea departamentos**: los resuelve por alias antes de agrupar
(así «Valle» y «Valle del Cauca» en un mismo archivo no chocan) y un nombre desconocido rechaza
la carga con la fila. `departamentos-dane.ts` (la lista en código) se borró: la verdad es la base.

### Tendencia ocupacional (migración 033)

El DDL de `criterios/001_percentiles_ocupacionales.sql` con tres ajustes: tablas en plural
(convención), el catálogo de departamentos de la 032 (UUID; `NULL` = nacional) y la bitácora en
`cargas_datos` + `cargas_datos_ocupacionales` en vez de una tabla propia. Detalle de tablas,
invariantes I16–I19 y vistas en `11-base-de-datos.md` §4.6.1 y `12-diccionario-de-datos.md` §3.17.

| Capa | Qué hay |
|---|---|
| Rutas públicas | `GET /api/observatorio/tendencia-ocupacional` (anio, periodo, departamento, criterio, nivel, q, incluirSinRegistros, pagina, porPagina) y `…/opciones?anio=` |
| Rutas del panel | `POST/GET …/cargas`, `GET …/cargas/:id` (con el reporte), `GET …/estado` (matriz), `POST …/cortes/publicar`, `PATCH …/cortes/:id/despublicar`. Publicar exige `puedePublicarDatos`, permiso aparte de cargar (hoy los mismos roles) |
| Carga | `validarYGuardarExcel` (sacado de `iniciar-carga`, lo usan los dos módulos) → `cargas_datos` + detalle en una transacción → cola `heavy-jobs` → `importar-percentiles-excel`: candado por celda, tabla temporal con `unnest` por lotes, V1–V5 abortan, V6–V9 advierten, huella y V10, catálogo, corte, reemplazo atómico |
| Consulta | `WHERE` armado según los filtros (no el `($n IS NULL OR …)` de referencia), paginación y totales en SQL, solo cortes publicados, y los códigos DANE con resultados para pintar el mapa |
| Front | Un criterio por bloque: `tipoTendencia` (guardado en el JSON de Puck, no se renombró) → `CRITERIO_POR_TIPO`. Los desplegables salen de `/opciones`: años con datos publicados, los 7 periodos (los que no tienen datos, visibles pero deshabilitados y con «(sin datos)»), niveles con su etiqueta, "Nacional" + 33. Arranca en el año más reciente y su periodo de mayor cobertura |

### Verificado

Todo contra un **Postgres 18 local desechable** (misma versión que Neon) con las migraciones
001–031 y una copia de solo lectura de las tablas de programas de Neon; Redis en la base 7 para
no cruzarse con el worker de la API del usuario. El archivo real de percentiles no está en el
repo: se probó con uno **sintético** de la misma anatomía (611 ocupaciones × 33 departamentos,
encabezados con las rarezas del real, vacíos = 0, departamentos «Guajira, La»/«Bogotá D.C.»,
percentiles calculados con la metodología, «X» como fórmulas).

| Prueba | Resultado |
|---|---|
| 032 sobre los datos de Neon | 33 departamentos oficiales, los 671 hechos de programas intactos con los mismos conteos por departamento, 41 alias. `down` + `up` otra vez: bien |
| Excel real de programas por el importador nuevo | 671 filas, **0 centros nuevos** (cada departamento resolvió al mismo UUID) |
| Carga válida (20.774 filas) | Completa en ~4,6 s; conteos por criterio nacionales y departamentales iguales a los calculados por el generador; sumas nacionales; sin V6/V7 |
| Criterios de aceptación de `criterios/…md` §10 | Recarga sin duplicar; mismo archivo en otra celda → V10 nombrando la celda; publicado sin «reemplazar» → 409; con «reemplazar» sigue publicado; matriz vacía → 105 `pendiente` |
| Negativas | «Amazonía» → V1; N.C. 1 en `0012` → V2; nacional ≠ suma → V5 (y no crean corte); código `13` numérico → `0013`; percentil alterado → V6 (1); columnas X sin caché → carga; nombre de 2013 → V8 y conserva el de 2025; nombre de 2026 → lo toma |
| HTTP (API de prueba en el 4100) | 22 comprobaciones: 400 de validación, 401 sin sesión, `.strict()` en la subida, 415 a lo que no es Excel, 202 → worker → `completado`, publicar/despublicar |
| Front en Chrome headless (páginas `metrica` e `inicio` de Neon, llamadas de tendencia redirigidas al 4100) | Los cuatro bloques muestran su criterio (81/44/405/81 = el SQL); periodos sin datos deshabilitados; cambiar de año salta al periodo con datos; filtros, paginación, limpiar; en el mapa, clic en Santander → 33 filas de Santander (código 68) |
| `tsc --noEmit` | Limpio en la API y en el sitio-web |
| ESLint del módulo | Limpio (el archivo de la vista traía 2 errores `set-state-in-effect`; se corrigieron junto con el nuevo) |

> **Aviso — 032 no es aditiva.** Cambia nombres y borra filas de `departamentos`. Con ella
> aplicada, el importador **viejo** de programas falla en cuanto el Excel traiga un nombre que ya
> no existe tal cual («Distrito Capital» → choca con el código único). Aplicar la migración y
> desplegar este código **juntos**. Y mientras no se aplique, la API nueva no arranca.

### Descartado

- **Una tabla de departamentos nueva** (la `departamento` con PK = código DANE de la
  especificación): habrían sido dos catálogos de lo mismo, justo lo que se pidió evitar.
- **Cambiar el PK de `departamentos` a código DANE**: obligaba a reescribir las FK de
  `centros_formacion` y `programas_sobresalientes`. Conservar el UUID da lo mismo con
  `codigo_dane` único.
- **Migrar los cuatro `base-tendencia-*.xlsx`**: son muestras de 10 a 23 filas sin percentiles;
  el criterio se calcula de ellos, así que no hay de dónde sacarlo.
- **Respuesta síncrona 201/422 de la especificación**: la carga va por la cola como la de
  programas (202 + sondeo). El 409 sí se responde en el acto, antes de guardar el archivo.
- **`next build` para verificar**: el `next dev` del usuario estaba corriendo sobre la misma
  carpeta y no se confirmó que el build respete `.next/dev`.

**De paso:** `ObservatorioController.subir` mandaba `req.user.id` a `cargas_datos.subido_por`; con
la cuenta maestra local (`'local-auth'`, no es UUID) la subida de programas daba 500. Ahora usa
`idReferenciable` (exportado de `shared/auditoria-request.ts`), igual que la nueva. Y
`MapaTendencia` casaba nombres con `includes()` («Santander» ⊂ «Norte de Santander», «Cauca» ⊂
«Valle del Cauca»): ganó un modo por código DANE que usa la tendencia; fuentes futuras sigue con el de nombres.

**Pendiente al cierre:**

- **El usuario:** `npm run migrate` en `api-backend` (032 y 033 en Neon) y reiniciar la API. Hasta
  entonces el sitio en dev ya muestra el front nuevo y los bloques dicen «No se pudieron consultar
  los datos». Después, «Todavía no hay datos publicados» hasta la primera carga.
- `next build` del sitio-web con el dev detenido.
- **Probar con el Excel real** (`data2.xlsx`) contra los conteos de §10 de la especificación.
- **Panel de Actualizaciones** para percentiles: la matriz, la carga masiva con detección de celda
  por nombre de archivo y la publicación en bloque. La API ya lo tiene todo; mientras tanto se carga
  por Swagger (`/api/docs`, en dev) o `curl`.
- Publicar/despublicar no deja fila en `auditoria_cambios` (tampoco la carga de programas); sumar
  la entidad al `CHECK` de la bitácora si se quiere.
- Decisiones de negocio de §11 de la especificación: empates que cruzan el 80 %, grupos con una sola
  ocupación, descripción del nivel 0, si existe el N.C. 5.
- `fuentes-futuras-empleo` importa `MapaTendencia` desde dentro de otra feature (regla 12); ya
  estaba así.

---

## sesión 23-09-2026 (6.ª parte): la bitácora registra los bloqueos de cuenta y las preguntas de seguridad

**Qué era.** Dos hechos de seguridad ocurrían sin dejar rastro:

- **Bloqueo de cuenta.** Cinco inicios de sesión fallidos bloquean la cuenta 15 minutos
  (`registrarFalloDeLogin`), y tres respuestas incorrectas a las preguntas de seguridad, 30
  (`verifyAnswers`). Nadie podía saber que alguien había estado probando contraseñas o
  respuestas contra una cuenta.
- **Verificación de preguntas de seguridad.** Ni los aciertos ni los fallos quedaban.

### Dos acciones nuevas, y una migración

| Acción | Etiqueta | Se lee |
|---|---|---|
| `bloquear` | Bloqueo | Se bloqueó la cuenta de … por 15 minutos tras 5 intentos fallidos de inicio de sesión |
| | | Se bloqueó la cuenta de … por 30 minutos tras 3 respuestas incorrectas a las preguntas de seguridad |
| `verificar_preguntas` | Preguntas de seguridad | Respondió correctamente las preguntas de seguridad de la cuenta … |
| | | Respuestas incorrectas a las preguntas de seguridad de la cuenta … · intento 2 de 3 |

Las dos van en la categoría **Seguridad**, con su propia opción en el filtro. Bloqueo lleva el
rojo de inactivar, porque también cierra un acceso; la verificación, el de rutina, porque el
resultado lo dice la frase.

La base acepta solo una lista cerrada de acciones, así que hace falta la **migración 031**
(`031-bloqueo-y-preguntas-auditoria.ts`), que recrea el `CHECK` con las dos nuevas, igual que la 030.
**No se aplicó**: la base de desarrollo es Neon y las migraciones las corre el usuario. Su SQL se
probó sobre una tabla temporal dentro de una transacción revertida: acepta las dos acciones nuevas,
rechaza las inventadas y la tabla real quedó intacta.

**La API no arranca mientras la migración esté pendiente**: `server.ts` lo comprueba al
inicio y se detiene. Se reinició la API después del cambio sin prever esto, y quedó caída hasta
que el usuario corra `npm run migrate`. La migración es **aditiva** —solo amplía la lista de
acciones—, así que aplicarla no rompe a nadie que tenga el código anterior.

### Decisiones

- **Quién aparece como actor.** El bloqueo lo hace el sistema («Sistema (bloqueo por intentos
  fallidos)»): los intentos pueden ser de la propia persona o de alguien atacando la cuenta, y la
  fila no puede saber cuál. Lo que sí guarda es la **IP y el navegador** del intento que disparó el
  bloqueo, que es lo primero que se mira ante un ataque.
- **Acertar demuestra quién es; fallar, no.** El acierto lleva a la persona como actor, igual que
  la recuperación de contraseña. El fallo no: ponerle el nombre del dueño a quien quizá está
  intentando robarle la cuenta sería atribuirle algo que no hizo. Sale como «Sin sesión
  (recuperación de contraseña)».
- **Sin aciertos repetidos.** Las dos pantallas de recuperación verifican las respuestas en un paso
  y, al guardar la contraseña nueva, la API las vuelve a verificar. El acierto se registra solo en
  el primer paso: el segundo ya lo cuenta la fila del cambio de contraseña. Los **fallos** se
  registran siempre, vengan de donde vengan, porque cada uno gasta un intento.
- **Cada fallo de login suelto sigue sin registrarse**, como se decidió el 19-09: solo el bloqueo,
  que es lo que cambia algo.
- **Las respuestas no llegan nunca a la bitácora**, solo el resultado.

**Algo que ya existía y no se tocó:** tras un bloqueo por preguntas, el contador de fallos no vuelve
a cero, así que el siguiente fallo bloquea otra vez al instante. La frase lo cuenta como «intento 4,
ya por encima del máximo de 3» en vez de «intento 4 de 3». El inicio de sesión sí reinicia su
contador al bloquear. Unificarlo cambiaría la política de seguridad, y no estaba pedido.

**Verificado:** el SQL de la migración sobre una tabla temporal, y las cinco frases. `tsc --noEmit`
limpio en la API y en el sitio-web. **No verificado:** un bloqueo real de punta a punta, que exige
la migración aplicada y fallar a propósito contra una cuenta.

**Archivos.** API: la migración nueva y `migrations/index.ts`, `models/content-audit-log.ts`,
`shared/auditoria-dto.ts`, `shared/auditoria-categorias.ts`, `shared/auditoria-resumen.ts`,
`use-cases/auditoria/audit.usecase.ts` (`logBloqueoDeCuenta`, `logVerificacionDePreguntas`),
`use-cases/auth/login.usecase.ts`, `use-cases/auth/security-questions.usecase.ts`,
`controllers/security-questions.controller.ts`, `docs/openapi.ts`, `routes/audit.routes.ts` y
`scripts/verificar-auditoria.ts`. Sitio-web: `auditoria/types.ts`.

---

## sesión 23-09-2026 (5.ª parte): Docker igual al proyecto real, con los datos de Neon y publicado por túnel

**Qué era.** El servidor (Windows, usuario SERVIDOR, publicado con el túnel de VS Code) iba
lento al cambiar de sección. Diagnóstico medido: `sitio-web` corría `next dev --webpack`,
porque la pila se levantó con `docker compose up` dentro de `docker/` y Compose suma solo
`docker-compose.override.yml`. Además usaba 2,8 GB de RAM y había escrito 1,29 GB en disco.
La API respondía en 135 ms; `localhost:3000/inicio` tardaba unos 420 ms, y por el túnel
entre 2 y 8 s. Al revisar qué impedía que Docker fuera igual al proyecto real salieron
varios fallos que en `next dev` no se ven.

El usuario decidió: los datos salen de **Neon**; viaja todo **menos las cuentas y la
bitácora**; se sigue publicando con **devtunnel**.

### Qué se hizo

| Capa | Cambio |
|---|---|
| `docker/docker-compose.servidor.yml` (nuevo) | Pila de producción sin dominio. Postgres 18 como Neon, con el volumen en `/var/lib/postgresql` (la 18 cambió la ruta). nginx es la única entrada, en `127.0.0.1:8080` (sitio) y `:8081` (intranet). Las URL públicas salen de `SITIO_WEB_URL_PUBLICA` / `INTRANET_URL_PUBLICA`. Monta del repo `*/public/storage` y `api-backend/uploads`. |
| `docker/nginx/nginx.servidor.conf` (nuevo) | Dos puertas; `/api-backend/` va a la API. Toma la IP real del visitante de `X-Forwarded-For`: sin eso, el límite de 20 r/s era para todos los usuarios juntos. Reenvía el host público para las Server Actions. |
| `deploy.sh importar` + `docker/sql/importar-*.sql` (nuevos) | `pg_dump` 18 en un contenedor desechable → vaciar, cargar, dejar en NULL las columnas que apuntan a `usuarios` (leídas del catálogo), corregir rutas con `\` y comprobar **todas** las llaves foráneas. Todo en **una transacción**. Al final compara filas por tabla con el origen. |
| `deploy.sh` | Modo servidor con validación de URLs. `build` ahora incluye `--profile tools`: sin eso, la imagen `migraciones` se quedaba con el código de su primer build y las migraciones nuevas no se aplicaban. |
| `sitio-web` + `intranet`: `app/storage/[...ruta]/route.ts` (nuevo) | En producción, Next lee la lista de `public/` una sola vez al arrancar (`router-utils/filesystem.js`), así que una subida nueva daba 404 hasta reiniciar. La ruta sirve desde disco lo que Next no conoce. Qué tipos se sirven lo decide `mimeParaServir` en `@olo/upload-policy`, derivado de lo que se puede subir; sin SVG. |
| `sitio-web/shared/lib/url-de-la-api.ts` (nuevo) + 9 servicios | Leían la API con `NEXT_PUBLIC_API_URL`, la URL **del navegador**, también desde el servidor. En el contenedor, todas las páginas del comodín `[slug]` daban 404; detrás del túnel, cada lectura habría salido a internet. Ahora en el servidor se usa `BACKEND_URL`. |
| Botón «Intranet» (`header.tsx`, Puck, cabecera por defecto, semilla) | El menú publicado en Neon guarda `intranetUrl: http://localhost:3001`, y lo guardado ganaba a la variable. Ahora sale siempre de `NEXT_PUBLIC_INTRANET_URL`, y el campo salió del editor. |
| `intranet` `registrarVisita` | Iba a `localhost:4000` desde el navegador; ahora pasa por el proxy `/api-backend`. |
| `intranet/config/puck.config.tsx` | 4 usos de `ArchivoUploaderField` le pasaban a Puck el nombre del archivo como `uiState`. En `next dev` no se nota; **el build de producción de la intranet no compilaba** en `dev`. |
| `scripts/crear-superadmin.ts` | Aceptaba cualquier dominio, y el login solo acepta `@sena.edu.co`: la única cuenta de una instalación nueva podía quedar sin poder entrar. Ahora usa `exigirEmailInstitucional`. |
| `docker/7-despliegue.md` | Reescrita desde cero para Windows + Git Bash + devtunnel, con glosario. `.env.example` y `.gitignore` (`!docker/sql/*.sql`). |
| `docker/` queda solo con la forma servidor | A pedido del usuario, «para no confundir», se borraron `docker-compose.prod.yml`, `nginx/nginx.conf.template` e `init-ssl.sh` (dominio + SSL), y `docker-compose.yml`, `docker-compose.override.yml` y `dev-entrypoint.sh` (desarrollo). Se recuperan con `git checkout ce29d80 -- docker/<archivo>`. `deploy.sh` usa siempre `docker-compose.servidor.yml` (sin `COMPOSE_FILE`) y pierde `ssl`/`renovar`. `.env.example` pierde los dominios y `LOCAL_AUTH_*`, y `JWT_EXPIRES_IN` pasa de `7d` a `8h`: con 7d, un token robado servía una semana, frente a la jornada que fijan la API y la cookie del sitio. |
| Los compose | A pedido del usuario, el proyecto pasa de `olo-app` a **`olo-web-app`** y redis tiene nombre fijo (`redis`). Los volúmenes llevan `name: olo-app_…` para que el cambio de nombre no cree volúmenes nuevos y vacíos. Probado: al recrear la pila con el nombre nuevo, las 17 páginas y la cuenta siguieron ahí, y no se creó ningún volumen `olo-web-app_*`. |

### Verificación (en local, Docker Desktop 29.7.2, pila servidor)

| Prueba | Resultado |
|---|---|
| Build de las 4 imágenes con `deploy.sh` | OK, tras arreglar los tipos de la intranet |
| `deploy.sh start` | 6 servicios arriba; `sitio-web` con `node server.js`; 88 MB de RAM |
| Postgres 18: datos dentro del volumen | `PGDATA=/var/lib/postgresql/18/docker`, un solo montaje |
| `deploy.sh importar` desde Neon | Primer intento: **falló y se deshizo entero** (FK revalidada en el UPDATE, ver aviso). Segundo: todas las tablas coinciden (17 páginas, 115 versiones, 671 programas sobresalientes…) |
| `crear-admin` con `@olo.local` / `@sena.edu.co` | Rechazado / creado |
| Login del sitio y de la intranet por nginx | 200; la intranet lleva a `/security-questions` (cuenta nueva) |
| Subir una imagen y pedirla sin reiniciar | 200 `image/png`; el archivo queda en la carpeta del repo |
| `..%2F`, archivo inexistente, otra carpeta, `.svg` | 400 / 404 / 404 / 404 |
| Botón Intranet en el HTML | `http://localhost:8081` (de la variable) |
| Observatorio: tendencias y fuentes futuras | Devuelven datos; antes, en Docker, vacíos (los Excel no estaban en la imagen) |
| Páginas del sitio por nginx | 200 en 0,24–0,98 s; `/ape` da 404 porque no existe en Neon |
| `stop` (borra contenedores) + `start` | Imagen, páginas, login y 115 versiones siguen |

> **Trampa del traspaso.** Una fila insertada en la misma transacción revalida **todas** sus
> llaves foráneas en cualquier UPDATE, aunque la columna que cambia sea otra. Vaciar
> `revisor_id` fallaba porque `publicado_por` todavía apuntaba a un usuario ausente. Los
> vaciados corren con `session_replication_role = replica`, y la comprobación manual de
> todas las llaves va después.

**Descartado.**
- Publicar el túnel directo al 3000: haría falta un tercer túnel para la API y más CORS.
- Volúmenes de Docker para los archivos: si la API monta primero, la copia inicial desde
  la imagen no se hace. Se usan carpetas del repo, visibles en el Explorador.
- Seguir en Postgres 16 limpiando el volcado de la 18 (`transaction_timeout`, `\restrict`).

**Pendiente al cierre.**
- Llevarlo al servidor siguiendo `7-despliegue.md`. No se probó con un devtunnel real: no se
  pudo confirmar si el túnel reescribe `Host`. nginx cubre los dos casos.
- `docker-compose.prod.yml` sigue con Postgres 16 y sin montar las carpetas de archivos.
- `/ape` está en el menú y no existe como página.
- En Neon falta `_obsoleto_attachment`, que las migraciones sí crean (0 filas, sin efecto).
- El sincronizador de permisos quita `acceso.panel` a un rol que en Neon lo tiene.
- La latencia del túnel de Microsoft (1,5–7 s por petición) no depende del código.

---

## sesión 23-09-2026 (4.ª parte): todas las acciones de la bitácora dicen qué pasó

**Qué era.** El usuario pidió frases claras para las once acciones del filtro, con dos ejemplos de
filas que no decían nada:

> Modificación · `name: David · apellidos: Vargas · email: dtejada@sena.edu.co`
> Cambio de contraseña · `via: cambio-voluntario`

En la primera no se sabía **qué** había cambiado: el formulario manda siempre esos tres campos,
cambien o no. En la segunda, `cambio-voluntario` es un código interno.

**Ahora se leen:**

> Se modificó el usuario dtejada@sena.edu.co · apellidos de «Tejada» a «Vargas»
> Cambió su contraseña de la cuenta dtejada@sena.edu.co

### Cómo se hizo

Antes de redactar se sacaron de la base **todas las formas de fila que existen**: 42 combinaciones
de acción, entidad y campos. `shared/auditoria-resumen.ts` se reescribió **por acción**, en el orden
del filtro, conservando literalmente las frases que el usuario ya había definido en las fases 1 a 6.

| Acción | Ejemplo real |
|---|---|
| Creación | Se creó la página «Mapa del sitio» (/mapa-del-sitio) en el sitio web · pueden editarla: Administrador, Editor |
| Edición | El usuario envió su edición a revisión · versión 36 de «inicio» · «Se actuliza la sección de inicio» |
| Rechazo | Se rechazó la versión 7 de «empleo» · Su comentario: «trestes tt» · Motivo del rechazo: «tEST» |
| Publicación | Se aprobó y publicó la versión 36 de «inicio» · «…» / Se restauró y publicó la versión 2 de «empleo» |
| Archivado | Se archivó la versión 35 al publicar la 36 · Comentario de la archivada: «…» |
| Autenticación | Inició sesión en el sitio web |
| Modificación | Se modificó el usuario p@sena.edu.co · rol de «Editor inicio» a «Editor prueba» |
| Modificación (rol) | Se concedió al rol «Editor prueba» el permiso de editar la sección «Inicio» del sitio web |
| Expiró | La cuenta de … pasó a inactiva al cumplirse su fecha de caducidad |
| Inactivación | Se inactivó el usuario … |
| Cambio de contraseña | Cambió la contraseña temporal en su primer ingreso · cuenta … |
| Eliminación | Se descartó la versión 1 de «afliknd» · Motivo: «dfsd» · la página también se eliminó, porque era su única versión |

Decisiones que conviene conocer:

- **Solo se nombra lo que cambió de verdad.** Se compara el antes con el después; si no cambió
  nada, se dice «Se guardó el usuario … sin cambios».
- **El cambio de contraseña corriente se dice sin adornos**, como lo pidió el usuario: «Cambió su
  contraseña de la cuenta …». Solo el primer ingreso y la recuperación llevan explicación, porque
  cuentan algo distinto.
- **El rechazo lleva su «commit»**, el motivo, con su nombre delante para no confundirlo con el
  comentario de quien envió la versión.
- **Los roles y los permisos se nombran como los ve una persona.** Un `role_id` sale como «Editor»
  y `secciones.crear` como «Crear secciones nuevas», leídos del catálogo de permisos.
- **Filas antiguas sin valores anteriores:** dos modificaciones de usuario guardaron todos los
  «antes» vacíos. En vez de fingir que cambió todo, dicen que el registro no guardó lo que había.
- **Una red de seguridad para lo demás.** Si una fila no encaja en ninguna frase propia —hoy los
  contenidos, que no tienen filas, o un slug que cambia—, una frase genérica nombra cada campo en
  español con su antes y su después. `resumen` **siempre viene** y ninguna fila sale en crudo.

### Dos cosas que la bitácora no podía decir, y ahora sí

Al eliminar un usuario o un rol, la fila solo guardaba el id de algo que dejaba de existir: la
bitácora decía «se eliminó una cuenta» sin poder saber cuál. `usuarios.controller.ts` y
`roles.controller.ts` ahora leen el registro **antes** de borrarlo y guardan su correo y nombre, o el
nombre del rol, como «antes». Las 19 eliminaciones que ya existen no lo llevan y lo dicen: «el
registro no guardó cuál».

### Un fallo que la prueba atrapó

La primera versión leía los nombres de los roles con `SELECT id, name FROM roles`. La columna se
llama `nombre`; el modelo la expone como `name`. Falló contra la base real antes de llegar a la
pantalla, y se cambió por el modelo, que es quien sabe traducirla.

**Verificado:** las 42 formas reales pasadas por el código, frase por frase; las **1297 filas
visibles** tienen frase; los dos ejemplos del usuario salen como arriba. Además, 16 casos para lo que
la base todavía no tiene: las otras dos vías de contraseña, un usuario y un rol borrados con el cambio
nuevo, una página del sitio web eliminada, un permiso de sección y la red de seguridad. `tsc --noEmit`
limpio en la API y en el sitio-web.

**Archivos.** API: `shared/auditoria-resumen.ts` (reescrito), `shared/auditoria-dto.ts`,
`use-cases/auditoria/audit.usecase.ts`, `controllers/usuarios.controller.ts`,
`controllers/roles.controller.ts` y `docs/openapi.ts`. La pantalla no se tocó.

---

## sesión 23-09-2026 (3.ª parte): los guardados automáticos antiguos salen de los listados

**Qué era.** Tras la fase 6, la edición del usuario en «inicio» se leía en tres filas, y la del medio
llevaba su propia frase:

> 4:45:00 · El usuario envió su edición a revisión · versión 36 de «inicio» · «Se actuliza la sección de inicio»
> 4:44:59 · **Guardado automático al enviar a revisión** · versión 36 de «inicio»
> 4:44:33 · El usuario guardó su edición en borrador · versión 36 de «inicio»

El usuario preguntó si se estaban guardando dos borradores. **No**: en `paginas_versiones` hay una
sola versión 36. Cada edición es una fila que cambia de estado —borrador, en revisión, publicada, y
archivada cuando otra la sustituye— y los dos guardados escribieron sobre esa misma fila. Solo se
crea una versión nueva cuando la última ya está publicada o archivada. Aprobar publica esa misma fila
(`aprobar-pagina.usecase.ts`); no hay copias en ningún paso.

Lo que pidió es que la fila automática **no se muestre**: el envío la sustituye, porque dice la misma
versión y además trae el comentario.

### Qué se hizo

Se propuso ocultarlas de la tabla y conservarlas en el CSV, por ser el respaldo previo a depurar. El
usuario lo descartó: no quiere que aparezcan en ningún listado. Queda así:

- **Fuera de todos los listados**: la tabla, el CSV (sale del mismo endpoint), el panel de
  actividad reciente y el historial de un objeto. También del **total**, así que la paginación
  cuadra.
- **No se borran de la base.** La depuración de seis meses se las lleva igual que al resto, y por
  eso el **análisis previo a depurar sí las cuenta y las enseña** con su frase: es lo que se va a
  borrar de verdad, y ahí esconderlas falsearía el recuento.

Las 178 son todas del mismo tipo que la de las 4:44:59. No hay forma de quitar solo esa sin una
regla, y la regla las recoge a todas.

La regla vive ahora en **un solo sitio**, `SQL_IDS_GUARDADOS_AUTOMATICOS` en
`repositories/auditoria.repository.ts`, y la leen las dos cosas que no pueden discrepar: el filtro de
los listados y la detección del análisis de depuración (`guardadosPreviosAEnvio`). La ventana de tres
segundos y su medición se movieron con ella.

**Verificado contra la base con el repositorio real:** 1473 filas en la tabla, 178 automáticas, y el
listado da un total de **1295**, que es exactamente la diferencia. La edición del usuario sale en dos
filas. El análisis de depuración sigue reconociendo las 178. `tsc --noEmit` limpio en la API.

**Archivos.** `repositories/auditoria.repository.ts`, `use-cases/auditoria/audit.usecase.ts` y
`routes/audit.routes.ts` (OpenAPI). La pantalla no se tocó.

**Queda pendiente, como propuesta:** `paginas_versiones` no guarda cuándo se modificó una versión por
última vez, solo cuándo nació. La versión 36 dice 22/9 aunque se editó el 23/9. Añadirlo necesita una
migración.

---

## sesión 23-09-2026 (2.ª parte): fase 6, una edición deja dos filas y no tres

**Qué era.** El usuario hizo un solo cambio en «inicio», lo guardó una vez y lo envió a
revisión una vez. La bitácora mostró **dos «guardar borrador» idénticos** y el envío:

| Hora | Qué pasó de verdad |
|---|---|
| 4:44:33 | Pulsó «Guardar» |
| 4:44:59 | Pulsó «Enviar a revisión», y el editor **guardó antes por su cuenta** |
| 4:45:00 | El envío, con su comentario |

Los dos editores —sitio-web e intranet— hacían dos peticiones al enviar: guardar el borrador y
luego enviarlo. La idea era buena (se envía lo que se ve, no una versión vieja), pero cada envío
dejaba un «guardar borrador» que nadie había pulsado. Pasaba en **todos** los envíos: de 251 que
hay en la base, 178 llevan pegado un guardado a menos de tres segundos.

**Lo que decidió el usuario**, para no confundir a quien audita: deben quedar **dos filas**. El
guardado que alguien pulsó, que diga que el usuario guardó su edición en borrador; y el envío con
su «commit». El guardado automático sobra.

### Dónde se quita, y por qué ahí

El contenido del editor ahora **viaja con el envío** (`contenido`, opcional, en
`PATCH /enviar-revision`) y la API lo guarda y lo envía en **una sola transacción**, sin fila
propia para el guardado. Los dos editores dejaron de guardar aparte antes de enviar.

Se descartaron dos caminos:

- **Una marca en la ruta de guardar** («este guardado es previo a un envío, no lo audites»). La
  podría mandar cualquiera para guardar sin dejar rastro.
- **Esconder la fila al leer.** La bitácora es evidencia: lo que la API recibió, lo dice.

Dentro del envío no hay hueco: el guardado solo ocurre como parte de uno, y el envío sí queda
registrado con versión y comentario. Si el envío falla —comentario inválido, accesibilidad— la
transacción deshace **también** el guardado, así que no puede quedar contenido cambiado sin una
fila que lo cuente. Las dos rutas pasan por los mismos controles (límite de escritura, permiso de
página y de sección), y el contenido se valida con el mismo esquema que el guardado.

**Cambio de comportamiento a tener en cuenta:** antes, si el envío fallaba, el borrador quedaba
guardado igual. Ahora no queda nada, y el editor sigue contando esos cambios como pendientes
(avisa al salir). Es lo coherente con «una operación», pero es distinto.

### Las frases

| Fila | Se lee |
|---|---|
| Guardado a mano | El usuario guardó su edición en borrador · versión 36 de «inicio» |
| Envío | El usuario envió su edición a revisión · versión 36 de «inicio» · «Se actuliza la sección de inicio» |
| Guardado automático **antiguo** | Guardado automático al enviar a revisión · versión 36 de «inicio» |

La frase del guardado es una sola, la que pidió el usuario. Las variantes de la fase 5 («se creó»,
«tras su rechazo», «y salió de revisión») se retiraron: el detalle sigue enseñando el antes y el
después de cada campo.

### Las 178 filas automáticas que ya existen

No se borran. Pero decir de ellas «el usuario guardó su edición» sería falso: nadie pulsó nada. Las
reconoce al leer `guardadosPreviosAEnvio` (`audit.usecase.ts`), con una consulta por página de
resultados: un guardado es automático si la misma persona envió esa misma página a revisión en los
**tres segundos** siguientes y no hubo otro guardado en medio. Así, si alguien guardó a mano y el
editor volvió a guardar antes de enviar, solo el segundo se marca.

La ventana está medida: de los 178, 169 estaban a menos de un segundo, 7 entre uno y dos, 2 entre
dos y tres, y **ninguno** entre tres y diez. Con dos segundos se escapaban esos 2, y se habrían
leído como guardados a mano. Un guardado a mano seguido de un envío no cabe en tres segundos:
entre medias hay que escribir un comentario de 10 a 100 caracteres.

**Verificado contra la base:** la edición del usuario sale con sus tres frases exactas; las 536
filas de borrador y envío tienen frase (251 envíos, 178 automáticos, 107 guardados a mano). Y 16
casos sintéticos en verde, cuatro de ellos de las fases anteriores. `tsc --noEmit` limpio en la API
y el sitio-web; la intranet sigue solo con sus cuatro errores previos de `puck.config.tsx`.

**No verificado aquí:** un envío real de punta a punta. Escribiría en la base compartida y dejaría
una página en revisión, así que queda para la prueba del usuario.

**Archivos.** API: `validators/paginas.validators.ts`, `controllers/pagina.controller.ts`,
`routes/pagina.routes.ts` (OpenAPI), `shared/auditoria-resumen.ts`, `shared/auditoria-dto.ts`,
`use-cases/auditoria/audit.usecase.ts`, `controllers/auditoria.controller.ts` y
`use-cases/auditoria/analizar-depuracion-auditoria.usecase.ts`. Sitio-web y la intranet, en los dos:
`paginas/edicion/services/edicion.service.ts`, el hook de acciones del editor y
`components/puck-editor-wrapper.tsx`.

**Orden de despliegue: primero la API.** El esquema del envío es estricto: una API sin este cambio
rechaza el campo `contenido` con un 400, y los editores nuevos no podrían enviar a revisión.

---

## sesión 23-09-2026 (1.ª parte): fase 5, guardar un borrador dice qué se guardó y de dónde venía

**Qué era.** El usuario señaló esta fila:

> `22/9/2026, 4:01:38 p. m.` · Mateo Pelaez Holguin · **Edición** · Página ·
> `slug: menu-y-pie · version: 9 · estado: borrador`

Es un `guardar_borrador`, y la columna enseñaba los tres **«después»** crudos. Pero lo que
distingue un guardado de otro está en los **«antes»**, que no se veían. Mirando las 283 filas de
borrador que hay en la base salen cinco situaciones distintas que hasta ahora se pintaban igual:

| Qué dicen los datos | Qué pasó | Cómo se lee ahora |
|---|---|---|
| misma versión, venía de borrador | se volvió a guardar un borrador que ya existía | Se guardó el borrador de la versión 7 de «empleo» |
| versión distinta | se abrió un borrador nuevo | Se creó el borrador de la versión 9 de «menu-y-pie» |
| sin versión anterior | primera versión de una página nueva | Se creó el borrador de la versión 1 de «mapa-del-sitio» |
| misma versión, venía rechazada | se retomó tras el rechazo | Se guardó el borrador de la versión 7 de «empleo» tras su rechazo |
| misma versión, venía en revisión | guardarla la sacó de revisión | Se guardó el borrador de la versión 7 de «empleo» y salió de revisión |

### El «antes» no es la versión publicada

En la fila del ejemplo el «antes» es `version 8, archivado`. Tentaba escribir «sobre la versión
8», pero la publicada en ese momento era la **6**: el «antes» que guarda `guardarBorrador` es la
última versión que existía, sea cual sea su estado. Por eso la frase de un borrador nuevo no dice
de dónde partió: lo que diría sería falso.

### Lo que no encaja se deja sin redactar

Con la misma regla de las fases anteriores —mejor el texto feo que una frase que cuente la mitad—
se devuelve `null`, y la pantalla sigue con la lista de campos, cuando:

- aparece un campo que `guardarBorrador` no escribe;
- el slug cambia entre el antes y el después, que sería un renombre escondido;
- el estado final no es borrador;
- la misma versión venía **publicada** o **archivada**. No aparece en la base y no se sabe qué
  significaría, así que en vez de adivinar no se redacta.

Las filas más viejas, sin campo `estado`, se leen como un guardado normal.

**Verificado contra la base real:** un ejemplo de cada una de las siete formas que existen —las
cinco de la tabla más las dos de filas viejas sin estado— sale con la frase esperada, y las **283
filas** de borrador reciben frase. Además, 24 casos sintéticos en verde: los catorce de las fases 1
a 4, para que nada se rompiera, y diez de esta con sus casos límite. `tsc --noEmit` limpio en la API.

**Archivo.** Solo `api-backend/src/shared/auditoria-resumen.ts` (`fraseDeBorrador`). La pantalla no
se tocó.

**Queda para otra fase, sin hacer por no estar pedido:** las demás filas de «Edición» de páginas.
Las 165 de `actualizar` anteriores a `guardar_borrador` siguen con `slug · version` crudo, y
`enviar_revision`, `aprobar` y `rechazar` enseñan el comentario pero **no dicen de qué página ni de
qué versión**: la columna «Entidad» solo pone «Página».

---

## sesión 22-09-2026 (2.ª parte): fase 4, «Archivado» deja de parecer una decisión de alguien

**Qué era.** El usuario señaló esta fila y pidió analizarla antes de tocar nada:

> `22/9/2026, 4:02:35 p. m.` · Mateo Pelaez Holguin · **Archivado** · Página ·
> `Sin comentario · Archivada al publicar versión 9`

De ahí se entendían dos cosas, y las dos falsas:

- **Que alguien archivó una página.** No existe esa función. Aprobar una versión *es*
  publicarla, y al publicarla la que estuviera en la vista pasa a archivada. La API escribe
  **dos filas por esa única acción**: una «Publicación» de la versión que entra y una
  «Archivado» de la que sale, con el mismo actor y el mismo segundo.
- **Que la versión 9 se publicó sin comentario.** Ese «Sin comentario» es el de la versión
  **archivada**, no el de la 9. En las filas de archivado la columna enseña a propósito el
  comentario de la que salió, porque es de ella de lo que trata la fila. Pero la tabla no lo
  dice: la línea que lo explica solo está dentro del detalle, y sin ella se lee al revés.

**Ahora se lee:** `Se archivó la versión 8 al publicar la 9`. Si la archivada llevaba
comentario se añade detrás `Comentario de la archivada: «…»`, diciendo de quién es en vez de
dejarlo suelto. Como las fases 1 y 2, se calcula al leer, así que las filas de meses atrás
quedan explicadas sin migrar nada.

### El número de la versión que entra solo vive dentro del motivo

La fila guarda en `version` el número de la **archivada**, en las dos puntas. El de la que la
sustituye no está en ningún campo: está dentro del texto del motivo, que lo genera la API
(«Archivada al publicar versión 9»). Para armar la frase hay que sacarlo de ahí.

Eso ata la lectura a una redacción, y esa atadura rompe **en silencio**: cambiar el texto en el
controlador dejaría la expresión sin coincidir, el resumen devolvería `null` y la pantalla
volvería al texto de antes sin que nadie supiera por qué. Por eso los dos motivos pasaron a
tener **una sola definición**, `MOTIVO_DE_ARCHIVADO` en `auditoria-resumen.ts`, pegada a la
expresión que los vuelve a leer; los dos sitios que los escribían ahora los importan de ahí.

La expresión exige `\d+` y no cualquier cosa: si el número llegara en blanco, el motivo diría
«versión undefined» y la frase saldría con esa palabra dentro. Sin coincidencia se devuelve
`null` y la pantalla enseña el motivo crudo, que es feo pero cierto.

### Solo páginas

Un **contenido** —un banner, un estudio— sí se archiva a mano: alguien le pone
`estado: archivado` y eso es una decisión de verdad. Esas filas no se tocan y siguen con su
lista de campos. La frase se arma solo cuando la entidad es `pagina`, que es donde archivar
nunca lo decide nadie.

**Verificado:** catorce casos contra `resumenDeRegistro`, cinco de las fases anteriores para
que no se rompieran y nueve de esta, entre ellos la fila exacta del usuario, la restauración
de una versión anterior, el comentario de la archivada frente al de la nueva, el número en
blanco, un motivo con otra redacción, la falta del campo `version`, un contenido archivado a
mano y una publicación. Todos en verde, y `tsc --noEmit` limpio en la API.

**Archivos.** `shared/auditoria-resumen.ts` (`MOTIVO_DE_ARCHIVADO` y `fraseDeArchivado`),
`controllers/pagina.controller.ts` y `use-cases/paginas/restaurar-version-anterior.usecase.ts`,
estos dos solo para tomar el motivo de la definición única. La pantalla no se tocó: ya prefiere
lo que manda la API desde la fase 1.

**Queda pendiente, y no se hizo por no estar pedido:** la píldora sigue diciendo «Archivado»
con el color de actividad rutinaria, y el actor sigue siendo quien publicó. La frase ya aclara
qué pasó, pero quien solo mire la columna «Acción» puede seguir leyéndolo como una retirada.

---

## sesión 22-09-2026 (1.ª parte): fase 3, la bitácora dice en cuál de los dos portales se inició sesión

**Qué era.** Una fila de autenticación decía «Inició sesión» y nada más. El sistema tiene dos
puertas —el sitio web y la intranet— y la bitácora no distinguía cuál se usó, que es justo lo que
quiere saber quien revisa un acceso.

| Antes | Ahora |
|---|---|
| Inició sesión | **Inició sesión en el sitio web** |
| Inició sesión | **Inició sesión en la intranet** |

### Por qué esta fase no se parece a las dos anteriores

**El dato no existía.** Las dos aplicaciones entran por el mismo `POST /api/login`, y vistas desde
la API las dos peticiones son idénticas: misma ruta, mismo cuerpo. En el sitio-web la petición la
abre además el servidor de Next y no el navegador, así que ni la IP ni el `Origin` sirven para
separarlas.

Las fases 1 y 2 se resuelven **al leer**, y por eso explicaron también las filas viejas. Esta hay
que **escribirla**: cada aplicación se identifica con la cabecera `X-Origen-App` al llamar al
login, y la API la guarda en el campo `origen` de la fila. Los logins anteriores a este cambio no
lo llevan y siguen diciendo «Inició sesión» a secas, que es verdad aunque diga menos.

### Que lo mande el cliente obliga a no fiarse

`/api/login` es la ruta más expuesta del sistema y no pide sesión: cualquiera puede mandar la
cabecera con lo que quiera. Por eso el valor **se comprueba contra la lista** (`sitio-web`,
`intranet`) y lo que no esté queda en `null` en vez de guardarse. Lo que escriba un cliente no
puede acabar copiado dentro de la tabla que sirve de evidencia.

Dos detalles que estaban a un paso de romperlo:

- **Guiones, no guiones bajos.** nginx descarta por defecto las cabeceras con guion bajo
  (`underscores_in_headers off`), así que `X_Origen_App` habría funcionado en desarrollo y
  desaparecido detrás de nginx. `X-Origen-App` pasa.
- **Una cabecera repetida llega como lista.** Node entrega `['sitio-web','intranet']`, que no está
  en el catálogo, así que queda en `null` en vez de guardar algo raro.

### Por dónde viaja cada una

| Aplicación | Camino hasta la API | Dónde se marca |
|---|---|---|
| **sitio-web** | navegador → route handler de Next → `fetch` a la API | `app/api/auth/login/route.ts`, junto a las cabeceras de cliente que ya reenviaba |
| **intranet** | navegador → rewrite `/api-backend/*` de `next.config` → API | `features/login/services/auth.service.ts`, en la llamada del login |

**Verificado:** catorce casos contra `resumenDeRegistro` —los once de las fases 1 y 2 más los tres
de esta— y nueve contra la lectura de la cabecera: valor en mayúsculas, con espacios, ausente,
vacío, un portal inventado, texto con etiquetas HTML y la cabecera repetida. Todos en verde.
`tsc --noEmit` limpio en la API y en el sitio-web; la intranet arrastra cuatro errores previos en
`config/puck.config.tsx`, ninguno en lo que se tocó.

**Falta probarlo en el navegador.** Que el rewrite de la intranet reenvíe la cabecera no se puede
comprobar sin levantar las dos aplicaciones, y es lo único de esta entrega que no se verificó aquí.
Si no llegara, la fila se escribiría sin `origen` y la pantalla seguiría diciendo «Inició sesión»:
falla hacia el lado seguro, no rompe el login.

**Archivos.** API: `shared/auditoria-request.ts` (`aplicacionDeLaPeticion`),
`controllers/auth.controller.ts`, `use-cases/auth/login.usecase.ts`, `shared/auditoria-resumen.ts`
y `routes/auth.routes.ts` (OpenAPI). Sitio-web: `app/api/auth/login/route.ts`,
`auditoria/types.ts` y `auditoria/components/detalle-registro.tsx`. Intranet:
`features/login/services/auth.service.ts`.

---

## sesión 19-09-2026 (4.ª parte): la API redacta lo que pasó, y «Cambios» deja de enseñar códigos

**Qué era.** La columna «Cambios» enseñaba el campo crudo. Inactivar una cuenta se leía
`status: inactive`; mover su caducidad, `expiration_date: 2026-09-20T00:00:00.000Z`. Ninguna de las
dos decía **sobre quién**: `entidad_id` guarda el id del usuario, no su correo. El usuario pidió dos
frases, por fases:

| Fase | Cambio | Lo que se lee ahora |
|---|---|---|
| **1** | `status` | «Se activó el usuario fallip@sena.edu.co» / «Se inactivó el usuario fallip@sena.edu.co» |
| **2** | `expiration_date` | «Se actualizó la fecha de caducidad de 19/09/2026 a 20/09/2026» |

**Lo redacta el backend**, que es lo que se pidió —«organizar cómo el back entrega los cambios»— y
además es el único sitio donde se puede: el correo no está en la fila. La frase viaja en un campo
nuevo del registro, `resumen`; la pantalla lo prefiere a todo lo demás y, cuando llega `null`, sigue
por el camino de siempre. Así ninguna fila se queda sin explicación mientras las fases avanzan.

### Se calcula al leer, no al escribir

`campos_modificados` **no se toca**: es la evidencia —qué campo cambió, de qué a qué— y meterle texto
de presentación, o un correo que nadie modificó, la deja sin servir como prueba. El resumen se arma
en `shared/auditoria-resumen.ts` cada vez que se lee, y eso trae un efecto que no se pidió y sí
importa: **las filas de meses atrás también quedan explicadas**, sin migrar ni reescribir nada.

Los correos se resuelven de **una consulta por página** (`UserRepository.findEmailsByIds`), no una
por fila: sobre la tabla que más crece del sistema, y con el tope de 200 filas, lo segundo serían
200 idas a la base para pintar una tabla. Una cuenta ya borrada no aparece —`entidad_id` no tiene
clave foránea contra `usuarios`, así que sus filas sobreviven al borrado—; entonces se usa el correo
que la propia fila recuerda, y si tampoco lo hay la frase queda «Se inactivó la cuenta».

### Tres trampas que había que esquivar

| Trampa | Qué habría pasado |
|---|---|
| **La fecha, leída en local** | `fecha_caducidad` es un `TIMESTAMP` que guarda un día suelto: el panel manda `2026-09-20` y se almacena como la medianoche **UTC** de ese día. Con los getters locales, en Colombia (UTC-5), sale el **19** — un día menos que el que se eligió, justo en la pantalla que existe para demostrar qué se eligió. Se formatea en UTC |
| **El formulario manda campos que no cambiaron** | Editar solo la fecha manda además `name`, `apellidos`, `email` y `role_id` idénticos a como estaban. Sin comparar «antes» contra «después» no habría encajado ninguna frase. Y la fecha se compara **por día**: el «antes» llega como `2026-09-19T00:00:00.000Z` y el «después» como `2026-09-19`, el mismo día escrito de dos formas |
| **`expirar` también deja `status: inactive`** | Caducar no lo decidió nadie: se cumplió una fecha. Redactarlo como «se inactivó el usuario» le atribuiría a una persona algo que hizo el sistema. La frase solo se arma para `actualizar` e `inactivar` |

### Si el cambio toca algo más, no se redacta

Basta con que el cambio real toque un campo fuera de `status` y `expiration_date` para que `resumen`
venga `null` y la pantalla enseñe la lista de campos de siempre. Es a propósito: una frase que hable
de la fecha y se calle que también cambió el rol es peor que el texto feo, porque **se lee como
completa**. Cada fase nueva mueve un caso más a este lado.

**Descartado.** El primer intento escribía el correo dentro de `campos_modificados` como un campo
`_email` y redactaba la frase en la pantalla. Se deshizo por tres razones: ensucia la evidencia con
un campo que nadie modificó, no sirve para las filas ya escritas, y deja la lógica en el sitio que
el usuario pidió expresamente evitar. Arrastraba además dos fallos: la fecha se leía en la zona del
navegador (un día menos) y la frase de inactivar **no se veía nunca**, porque `RESUMEN_FIJO` cortaba
antes de llegar a ella.

**Sin tocar:** las frases de `autenticar` y `expirar` siguen viviendo en la pantalla. No estaban en
lo pedido, y la API devuelve `null` para las dos, así que se leen igual que ayer.

**Verificado:** once casos contra `resumenDeRegistro` —activar, inactivar, cuenta borrada, fecha
cambiada con cuatro campos iguales al lado, la misma fecha en dos formatos, primera fecha asignada,
las dos frases juntas, `expirar`, un cambio que además toca el nombre, un login y una página—, todos
en verde. `tsc --noEmit` limpio en la API y en el sitio-web.

**Archivos.** Nuevo: `api-backend/src/shared/auditoria-resumen.ts`. Tocados: `auditoria-dto.ts`
(campo `resumen` y contexto de lectura), `auditoria.controller.ts`, `audit.usecase.ts`,
`usuarios.repository.ts`, `analizar-depuracion-auditoria.usecase.ts`, `docs/openapi.ts`, y en el
sitio-web `auditoria/types.ts` y `auditoria/lib/cambios.ts`.

**Pendiente:** el usuario anunció más fases. Añadir una es una entrada más en `CAMPOS_CON_FRASE` con
su frase al lado, sin tocar la pantalla.

---

## sesión 19-09-2026 (3.ª parte): el filtro de Auditoría pasa a tres categorías

**Qué era.** El usuario pidió reorganizar el filtro «Categoría» (que en la 2.ª parte tenía dos
opciones) en tres, con estas acciones en cada una:

| Categoría | Acciones |
|---|---|
| **Contenido editorial** | Creación (solo de **páginas**, no de usuarios ni nada relacionado), Edición (de secciones o páginas, desde el editor) |
| **Administración** | Rechazo, Publicación, Archivado |
| **Seguridad** | Autenticación, Modificación, Expiró, Inactivación, Cambio de contraseña, Eliminación |

Reemplaza el mapeo de la 2.ª parte (que repartía por entidad: contenido / seguridad y administración).

### Por qué no bastaba con reordenar el desplegable

La categoría ya no puede salir de la **entidad**. Rechazo, Publicación y Archivado caen sobre las
mismas entidades (`pagina`, `contenido`) que Creación y Edición y, sin embargo, son de otra
categoría; y `crear` y `actualizar` sirven igual para una página que para una cuenta. Además,
«Seguridad» junta cosas que dependen del verbo (Eliminación, de cualquier entidad) con cosas que
dependen de la entidad (Modificación, solo de cuentas y roles). El filtro anterior —una lista de
entidades «y» una lista de verbos— no puede decir eso.

Por eso la regla pasó a la **API**, en un solo sitio: `shared/auditoria-categorias.ts`, una tabla
por categoría de «acción en (…) y, si hace falta, entidad en (…)». La usan las dos cosas que antes
podían discrepar: el filtro (`?categoria=`, que se suma con «y» a `accion`) y cada fila que la API
entrega (`categoria` en el registro), que es lo que decide si una píldora dice «Edición» o
«Modificación». La pantalla ya no repite la regla: se borró `ENTIDADES_POR_CATEGORIA`.

### Decisiones que tomé y conviene revisar

- **Eliminación está en Seguridad para *cualquier* entidad**, porque el usuario la puso solo ahí y
  es una sola etiqueta. Hoy son 73 filas: **52 de páginas** (borrar una página, depurar versiones),
  16 de usuarios, 3 de roles y 2 de configuración (la depuración de la propia bitácora). Si las de
  páginas deben verse en otro lado, es cambiar una línea de la tabla.
- **Crear un usuario o un rol** (21 filas) ya no aparece como «Creación» en el desplegable —la
  Creación es solo de páginas—, pero **siguen en la categoría Seguridad**: se ven al elegirla con
  «Todas» las acciones. Sin esto habrían quedado sin lugar en ninguna categoría.
- Una fila que no encaje en ninguna (`seccion`, `marca`, `archivo`; ningún código las escribe) tiene
  `categoria: null` y solo se ve sin filtrar por categoría. Hoy son **0**.

### Un hueco que ya tenía la versión anterior

Al quitar la categoría («Todas») con una acción elegida, la acción se quedaba sin categoría, y
`actualizar` sin ella da 286 filas mezcladas de ediciones y modificaciones. Ahora **volver a «Todas»
categorías vuelve también a «Todas» las acciones** (`lib/filtros.ts`). Lo destapó la prueba de la
función pura.

### Capas tocadas

| Capa | Archivo | Cambio |
|---|---|---|
| API | `shared/auditoria-categorias.ts` (nuevo) | Las reglas y `categoriaDe` |
| API | `repositories/auditoria.repository.ts`, `shared/auditoria-dto.ts` | Filtro `categoria`; el registro trae `categoria` |
| API | `routes/audit.routes.ts`, `docs/openapi.ts` | Parámetro y campo documentados; de paso el enum de `accion` del esquema, que no traía seis verbos |
| API | `scripts/verificar-auditoria.ts` | Comprobaciones de las reglas y una que compara el SQL del filtro contra la regla, sobre la bitácora real |
| Pantalla | `types.ts`, `lib/filtros.ts`, `services/auditoria.service.ts`, `auditoria-view.tsx`, `detalle-registro.tsx`, `lib/csv.ts`, `panel-general.tsx` | Tres categorías, cada acción en una sola, la etiqueta sale de `registro.categoria` |

**Sin tocar:** la base de datos (no hay migración nueva) y los colores de las píldoras.

### Verificación

| Qué | Resultado |
|---|---|
| `tsc --noEmit` en api-backend y sitio-web | Sin errores |
| ESLint en la feature de auditoría y `panel-general.tsx` | Sin errores; los mismos 8 avisos que ya tenía |
| Filtro SQL contra la regla en JS, sobre las **1.238 filas reales** (solo lectura) | Coincide: Contenido editorial 617, Administración 383, Seguridad 238, sin categoría 0 |
| Cada una de las 11 opciones del desplegable contra su conteo por `GROUP BY` | Coincide (Creación 32, Edición 585, Rechazo 21, Publicación 215, Archivado 147, Modificación 121, Cambio de contraseña 23, Eliminación 73; Autenticación, Expiró e Inactivación en 0 hasta aplicar la 030) |
| Categoría inventada en el querystring | Se descarta: es como no filtrar |
| Acciones por categoría en el desplegable | Editorial: 2; Administración: 3; Seguridad: 6; sin categoría: las 11, sin etiquetas repetidas |
| `aplicarCambioDeFiltro` (elegir acción fija categoría; cambiar de categoría descarta la que no cabe; volver a «Todas» limpia la acción) | Correcto |
| OpenAPI regenerado | 52 rutas; `categoria` sale como parámetro y en el esquema del registro |
| Recorrido en el navegador con sesión | **No se hizo**: el servidor no arranca con la 029 y la 030 sin aplicar |

**Pendiente:** el mismo de la 2.ª parte —aplicar la 029 y la 030 con `npm run migrate`, reiniciar la
API (no recarga sola) y recorrer las tres categorías con sesión—. Hasta entonces el proceso que
corre sigue con el código anterior.

---

## sesión 19-09-2026 (2.ª parte): filtros de Auditoría por categoría y acción, tres eventos que no se registraban y badges por severidad

**Qué era.** El filtro «Entidad» confundía: ofrecía ocho opciones (`contenido`, `pagina`,
`seccion`, `usuario`, `rol`, `marca`, `configuracion`, `archivo`), de las que **`seccion`,
`marca` y `archivo` no las escribe ningún código**, y ninguna decía *qué se hizo*. El usuario
propuso organizar la bitácora en dos mundos —cambios de contenido, y seguridad y
administración— con un nombre propio para cada acción, y pidió que los badges usaran
`danger`, `success`, `warning` y `brand` según la severidad. Antes de tocar nada se presentó
el plan y se confirmó (Categoría reemplaza a Entidad; instrumentar de verdad lo que faltaba).

### Lo que no era relabeling: tres eventos que no dejaban rastro

Al revisar el código para el mapeo aparecieron tres huecos. Los tres se cerraron:

| Evento | Qué pasaba | Ahora |
|---|---|---|
| **Autenticación** | El login **nunca** se auditaba, ni en el sitio ni en la intranet | `login.usecase.ts` escribe `autenticar`. Sitio-web e intranet llegan al mismo `AuthController.login`, así que un solo punto cubre los dos |
| **Expiró** | Al caducar una cuenta se pasaba a `inactive` en silencio, en dos sitios: al intentar entrar y en el barrido `deactivateExpiredUsers` (que corre al listar usuarios) | Los dos escriben `expirar`, con actor «Sistema (fecha de caducidad cumplida)» y `usuarioId` en null: nadie lo decidió, se cumplió una fecha |
| **Inactivación** | Inactivar desde el panel era un `actualizar` más | `PATCH /users/:id` escribe `inactivar` cuando el estado pasa de activo a inactivo. Mandar `inactive` sobre una cuenta ya inactiva no cuenta |

Además, publicar un **contenido** (banner, estudio) caía en `actualizar`; ahora escribe `publicar`
(`contenido.controller.ts`), como ya hacían las páginas con `aprobar`.

**Descartado:** auditar también el login fallido. No estaba en lo pedido («si alguien se
autenticó») y es otra decisión —volumen, y qué hacer con un correo que no existe—. **Cuenta
maestra de `.env`:** su propio login no deja fila, porque `entidad_id` es una FK obligatoria
contra `usuarios` y ella no tiene fila. El resto de sus acciones sí quedan (ya era así).

### El mapeo

| Categoría | Etiqueta | Verbos de la base |
|---|---|---|
| Contenido (`pagina`, `contenido`) | **Creación** | `crear` |
| | **Edición** | `guardar_borrador`, `enviar_revision`, y `actualizar` sobre una página o contenido |
| | **Rechazo** | `rechazar` |
| | **Publicación** | `aprobar`, `publicar` |
| Seguridad y administración (`usuario`, `rol`, `configuracion`) | **Autenticación** | `autenticar` (nuevo) |
| | **Creación** | `crear` (cuentas) |
| | **Modificación** | `actualizar` sobre un usuario o un rol: su rol, sus permisos, sus datos |
| | **Expiró** | `expirar` (nuevo) |
| | **Inactivación** | `inactivar` (nuevo) |

**Sin tocar, porque no estaba en la lista:** Eliminación, Archivado (`despublicar`) y Cambio de
contraseña. `configuracion` entró en seguridad porque es lo que deja la depuración de la propia
bitácora; sin lugar en ninguna categoría esas filas solo se veían con «Todas».

> **La trampa:** `actualizar` es el mismo verbo para dos etiquetas distintas. Con solo el verbo no
> se distingue «Edición» de «Modificación»; hace falta la entidad. Por eso la etiqueta pasó de un
> diccionario `verbo → texto` a `etiquetaDeAccion(verbo, entidad)`, y decide por la **categoría** de la
> entidad, la misma que usa el filtro. Hay **165 filas de `pagina` con `actualizar`** de antes de que
> existiera `guardar_borrador`: la primera versión solo miraba `contenido` y esas filas decían
> «Actualización» mientras el filtro «Edición» las contaba. Lo destapó comparar el filtro contra
> los conteos reales de la base.

### El filtro

«Entidad» se reemplazó por **«Categoría»** (2 opciones). «Acción» depende de ella: con una categoría
elegida solo ofrece lo que le corresponde, y con «Todas» ofrece las once. Dos reglas, en
`lib/filtros.ts` como función pura para poder probarla:

- Elegir una acción propia de una categoría **fija también la categoría** (quien busca «Autenticación»
  no espera seguir viendo contenido).
- Cambiar de categoría **descarta la acción que ya no cabe**, en vez de dejar un filtro invisible que
  vacía la tabla sin explicación.

Sin acotar la entidad, «Edición» y «Modificación» traerían las filas de la otra: `actualizar` sin
categoría da 284 filas mezcladas.

Del lado de la API, `accion` y `entidadTipo` aceptan **listas separadas por coma** (`Op.in`); con un
solo valor la consulta sigue siendo `= valor`. De paso apareció un fallo viejo: `cambiar_password`
**no estaba en la lista de verbos que acepta el filtro** de `auditoria-dto.ts`, así que filtrar por
él se descartaba en silencio y devolvía toda la bitácora.

### Badges por severidad

Antes, nueve acciones con nueve colores sin más orden que ser distintos. Ahora cuatro niveles con los
nombres que pidió el usuario (`VARIANTE_ACCION` en `types.ts`), y **una etiqueta, un color** —hay
etiquetas que agrupan varios verbos, y no pueden verse en dos tonos—:

| Nivel | Significa | Acciones |
|---|---|---|
| `brand` | Rutina: nada que mirar | Creación, Edición, Modificación, Autenticación, Archivado, Cambio de contraseña |
| `success` | Logro: ya lo ve el público | Publicación |
| `warning` | Atención: nada se perdió, pero alguien debe actuar | Rechazo, Expiró |
| `danger` | Crítico: se cierra un acceso, y se puede revertir | Inactivación |
| `dangerFuerte` | Crítico y no se deshace: el único relleno sólido | Eliminación |

Los contrastes se midieron con la paleta de Tailwind v4 y, en oscuro, componiendo el fondo translúcido
sobre el del panel: entre 6.3 y 11.5, todos sobre el 4.5 de AA. El verde de marca (`#7DB828`) es de tono
medio y su texto no llega a AA sobre su propio fondo, así que el texto va en `#365812` (claro) y
`#9ED65C` (oscuro). **La primera versión tenía el fondo claro al 10 % y la píldora casi no se veía**: se
subió al 20 % y se cambió el texto. Se dibujó una vista previa en Chrome en claro y oscuro para juzgarlo
a la vista y no solo por números.

### Capas tocadas

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/030-acciones-seguridad-auditoria.ts` + `index.ts` | `CHECK ck_auditoria_accion` suma `autenticar`, `expirar`, `inactivar` |
| Modelo | `models/content-audit-log.ts` | El tipo `AccionAuditable` |
| Login | `auth.controller.ts`, `login.usecase.ts`, `shared/auditoria-request.ts` | `autenticar` y `expirar`; `origenDeLaPeticion` (ip y navegador) sale a una función |
| Usuarios | `listar-usuarios.usecase.ts`, `usuarios.controller.ts` | `expirar` en el barrido; `inactivar`. Se quitaron los `console.log('--- DEBUG AUDITORIA ---')` que había en ese mismo bloque |
| Contenido | `contenido.controller.ts` | Publicar escribe `publicar` |
| Consulta | `auditoria.repository.ts`, `shared/auditoria-dto.ts`, `audit.routes.ts` | Listas en `accion` y `entidadTipo`, verbos nuevos, OpenAPI al día (el parámetro se documentaba como `entidad` y el código lee `entidadTipo`) |
| Pantalla | `types.ts`, `lib/filtros.ts` (nuevo), `lib/cambios.ts`, `hooks/use-auditoria.ts`, `services/auditoria.service.ts`, `auditoria-view.tsx`, `detalle-registro.tsx`, `lib/csv.ts`, `panel-general.tsx` | Categoría, opciones de acción, etiquetas por entidad, severidad. La columna «Cambios» dice «Inició sesión», «La cuenta pasó a inactiva al cumplirse su fecha de caducidad» y «Cuenta inactivada desde el panel de usuarios» en vez de `status: inactive` |

### Verificación

| Qué | Resultado |
|---|---|
| `tsc --noEmit` en api-backend, sitio-web e intranet | Sin errores |
| ESLint en la feature de auditoría | Sin errores; `panel-general.tsx` conserva 8 avisos que ya tenía |
| `filtrosDesdeQuery` con 9 casos (suelto, lista, espacios, valores inventados, alias viejo) | Correcto |
| Cada opción de «Acción» y cada categoría llega **completa** a la API | Correcto (11 opciones, 2 categorías) |
| El filtro contra la base real, en solo lectura, comparado con los conteos por `GROUP BY` | **Coincide en las cinco consultas** (Contenido 1052, Seguridad, Contenido+Edición 585, Seguridad+Modificación, listas vacías = sin filtro) |
| Una etiqueta, un color, sobre todas las combinaciones de verbo y entidad | Correcto |
| `aplicarCambioDeFiltro` con 13 casos | Correcto |
| Escrituras con los repositorios sustituidos (sin tocar Neon): login correcto, contraseña incorrecta, cuenta expirada, cuenta maestra, barrido con un administrador exento, PATCH activo→inactivo / inactivo→inactivo / reactivar / cambiar datos / cambiar rol, contenido publicado / archivado / editado | Las 30 comprobaciones correctas |
| Que el login **siga funcionando aunque la escritura de la bitácora falle** (la 030 sin aplicar) | Correcto: `logAudit` se traga el error y lo deja en el log |
| SQL de la 030 sobre una **copia temporal** de la tabla | Antes rechaza los tres verbos; después los acepta y rechaza uno inventado; `down()` vuelve las filas nuevas a `actualizar` |
| OpenAPI regenerado con las anotaciones nuevas | 52 rutas, los dos parámetros salen bien |
| Vista previa de las píldoras en Chrome, claro y oscuro | Revisada; de aquí salió el ajuste del verde de marca |
| Recorrido en el navegador con sesión | **No se hizo**: la 030 no está aplicada |

> **La 030 no está aplicada, a propósito** (la API apunta a la base de Neon compartida). El
> orden importa: el servidor **no arranca** con migraciones pendientes (`server.ts`), así que
> primero `npm run migrate` en `api-backend` —aplica la 029 y la 030— y después se reinicia
> `npm run dev`, que no recarga solo. El proceso que ya corre sigue con el código anterior, y
> con él nada de esto está activo. Las filas viejas no se reescriben: los `actualizar` de
> usuarios que en su día fueron inactivaciones seguirán diciendo «Modificación».

**Pendiente al cierre:**
- Aplicar la 029 y la 030 y recorrerlo con sesión: iniciar sesión (debe salir «Autenticación»),
  inactivar una cuenta de prueba, y filtrar por cada categoría y acción.
- El filtro «Usuario» sobre `autenticar` muestra a quien entró; para `expirar` el actor es «Sistema» y
  la persona afectada está en el detalle (`entidad_id`), no en el filtro.
- Sigue sin auditarse el login fallido ni el bloqueo por intentos; si se quiere, es un verbo más.

---

## sesión 19-09-2026 (1.ª parte): la tabla «Actividad reciente» del dashboard muestra lo que cambió y se rediseña

**Qué era.** La columna «Cambios» del dashboard seguía usando `camposTocados`, que solo unía los
**nombres** de los campos (`comentario, slug, version, estado`), mientras la tabla de Auditoría ya
mostraba el comentario del envío desde la sesión anterior. Era el pendiente que había quedado
anotado en la 16.ª parte de ayer. Ahora usa `resumenDeCambios`, la misma función, exportada por el
barrel de la feature para no saltarse la regla 12.

**El rediseño.** El usuario pasó un componente de Flowbite (caption con título y subtítulo, cabecera
con banda propia, filas espaciadas). Sus clases (`neutral-primary-soft`, `text-heading`, `fg-brand`…)
**no existen en este Tailwind**, así que se copió la estructura y se mapeó a la paleta zinc/dark que ya
usa el panel y al verde de marca del enlace «Ver más». Título, subtítulo y enlace van en un `<caption>`
real (`CabeceraActividad`, que se repite igual en los tres estados de la tarjeta); la tarjeta perdió su
`p-4` para que la tabla vaya a ancho completo; la cabecera dejó las mayúsculas y ganó una banda propia
(en oscuro se confundía con el fondo de la tarjeta); «Usuario» va en negrita.

**Descartado:** cambiar la columna «Usuario» a `<th scope="row">` como en el ejemplo. La tabla completa
de Auditoría usa `<td>` en todas las celdas, y una sola tabla distinta rompía la coherencia.

Verificación: `tsc` sin errores; ESLint sin errores nuevos (los 8 avisos ya estaban, comparado contra
el estado previo); `resumenDeCambios` probado con los cuatro tipos de registro que trae esa tarjeta.
No se vio en el navegador: el dashboard exige sesión.

---
## sesión 18-09-2026 (17.ª parte): integrar la PR #114 de Mateo, revertir 4cf3734 y hacer bien lo que buscaba

**Qué había.** La PR #114 (rama `mateo`) ya estaba fusionada en `OLO/dev`, y el `dev`
local iba 11 commits por delante sin tenerla. El usuario pidió revisarla, omitir lo que
rompiera o empeorara, arreglar lo que debió hacerse de otra forma y subir lo local con
prioridad.

**Qué traía la PR.** Seis commits de Mateo:
- el bloque «Fuentes futuras de empleo», con endpoint público
  `GET /api/observatorio/fuentes-futuras-empleo` que lee un Excel de `uploads/cargas-datos/`;
- en programas sobresalientes, departamento por lista o por mapa y «Limpiar filtros»;
- mapas usables dentro del editor Puck;
- 4cf3734: que una página inexistente no ofrezca «Editar sección».

### Lo que se hizo

| Commit | Qué |
|---|---|
| `Merge remote-tracking branch 'OLO/dev'` | Sin conflictos de texto, pero **no compilaba**: `tabla-fuentes-futuras.tsx` importaba `tendencia-ocupacional/components/paginador`, que ddd14ab borró al unificar la paginación, y además era un import interno de otra feature (regla 12). Se resolvió dentro del merge con `shared/ui/molecules/paginacion`, igual que `tabla-tendencia` |
| `revert(sitio-web): deshacer 4cf3734` | Revert y no reescritura de `dev`: ya estaba en GitHub y otros tienen esa historia. El cambio a `politica-de-privacidad/page.tsx` no se revierte: ese archivo ya no existe en `dev` (el merge de Mateo ya lo había perdido) |
| `fix(sitio-web): 404 real y 'Editar seccion' solo si…` | Ver abajo |
| `fix(sitio-web): tema oscuro solo en el panel…` | Ver abajo |

**Por qué 4cf3734 empeoraba, y cómo se hizo bien.**

- **El 404.** Para no enseñar el botón en URLs inventadas, 4cf3734 cambió `notFound()`
  por un `<div>` «Página no encontrada» con **200 para todos**, visitantes incluidos (soft
  404: los buscadores pueden indexar cualquier URL). También quitó la entrada al editor de
  una sección creada y vacía. Y ni siquiera cerraba el caso: el menú flotante seguía
  ofreciendo «Editar sección» al Superadmin. El problema de fondo era real: con solo el
  rol, cualquier editor veía el botón en `/lo-que-sea`, y editar ahí crea la página al
  guardar. **Arreglo:** `puedeEditarSeccion(slug)` en `shared/lib/session.ts` pregunta a
  `GET /api/paginas/:slug/editable`, que pasa por la misma guardia que el editor
  (`requierePermisoDeSeccion`: 404 si no existe, 403 si no es suya). Solo se llama cuando
  no hay nada publicado y el rol ya permite editar, así que a un visitante no le cuesta
  ninguna petición.
- **El tema.** 4cf3734 quitó del `<head>` el script que aplica el tema antes de pintar y
  lo pasó a un `useEffect` de `ThemeToggle`. El problema que resolvía también era real:
  el script ponía `.dark` en **todo** el sitio, y como `body` usa `var(--background)`,
  quien eligió oscuro en el panel veía el portal público con fondo `#0b1121`. Pero el
  arreglo tuvo tres efectos malos: el panel parpadeaba en claro en cada carga, las
  pantallas sin el botón dejaban de aplicar el tema y se perdía el «volver arriba al
  recargar». **Arreglo:** se conserva el script, limitado a `/admin` (`shared/lib/tema/`).
  `SincronizarTema`, en el layout raíz, repite la regla en cada cambio de ruta, porque al
  ir del panel al sitio con un enlace de Next no hay recarga y `.dark` se quedaba.

**Qué se dejó como estaba, a propósito.**
- Que «Fuentes futuras» devuelva `[]` ante un Excel dañado: es lo mismo que hace tendencia,
  así que no es una regresión de esta PR.
- La etiqueta «Elegido en mapa ×» quitada en tendencia: el departamento se sigue pudiendo
  quitar haciendo clic otra vez en el mapa.
- El select de departamento en programas sobresalientes: es un cambio de producto, no un
  error.

### Verificación

| Qué | Resultado |
|---|---|
| `git merge-tree` antes de fusionar | Sin conflictos de texto |
| Imports del código de Mateo contra lo que borraron los commits locales | Un solo roto (el paginador), corregido en el merge |
| `tsc --noEmit` en sitio-web y api-backend tras el merge y tras los arreglos | Sin errores |
| ESLint en los archivos tocados | Sin errores; un aviso previo en `session.ts:46` (`user` sin usar) |
| Script del `<head>` ejecutado con un DOM simulado en 8 rutas | `.dark` solo en `/admin` y `/admin/*` con «dark» guardado; nunca en `/`, `/inicio`, `/login`, `/editor/…` ni `/administrador-falso` |
| `curl` al sitio local en `/pagina-que-no-existe-xyz` sin sesión | **404**, con la página de Next; `/inicio` sigue en 200 |
| El caso con sesión de editor (sección vacía, sí; URL inventada, 404) | **No probado**: hace falta iniciar sesión en el navegador |

> **Fuera del commit a propósito:** `sitio-web/next-env.d.ts` (lo reescribe `next dev`) y
> `api-backend/uploads/cargas-datos/c6a34897-….xlsx` (una carga hecha desde el panel, no
> código).

**Pendiente al cierre:**
- Con sesión de editor: abrir una sección recién creada y vacía (debe salir «Editar
  sección») y una URL inventada (debe dar 404).
- En el panel con modo oscuro: recargar (sin destello claro) e ir al sitio con un enlace
  (debe quedar claro).
- Sigue pendiente aplicar la 029 (16.ª parte).

---

## sesión 18-09-2026 (16.ª parte): comentario de cambios obligatorio al enviar a revisión, y la auditoría lo muestra

**Qué era.** La columna «Cambios» de Auditoría enseñaba `slug: inicio · version: 7 ·
estado: en_revision`, y el detalle («Campos modificados») la misma lista con antes y
después. Todo correcto y nada útil: no decía **qué** se había cambiado. El usuario pidió
un flujo tipo GitHub, en cuatro puntos:

1. Al enviar a revisión, el editor escribe sí o sí el comentario de los cambios
   (el «commit»), específico y de máximo 100 caracteres.
2. En los dos editores, el modal de confirmación lleva un textarea y el botón no se
   activa sin el comentario.
3. Se apruebe o no, todo queda en la columna «Cambios» de la auditoría.
4. En el detalle, «Campos modificados» muestra «Comentario anterior» y «Comentario
   después» en lugar de lo que mostraba.

**Decisión principal: el comentario va en la versión, no solo en la bitácora.** Columna
nueva `paginas_versiones.comentario_cambios VARCHAR(100)` (migración 029). Aprobar,
rechazar y descartar pasan después, las hace otra persona y cada una escribe su propia
fila en `auditoria_cambios`; con el comentario en la versión lo registran de primera
mano. **Descartado:** guardarlo solo en la fila de `enviar_revision` y que aprobar lo
buscara en la bitácora — depende de que el último envío de esa página sea el de esa
versión, y un rechazo seguido de reenvío ya rompe esa suposición.

**Qué significan «anterior» y «después».** Un sentido fijo para todas las acciones, para
que la pantalla no tenga que interpretar cada una:

| Acción | Comentario anterior | Comentario después |
|---|---|---|
| `enviar_revision` | el de lo publicado en ese momento | el que se acaba de escribir |
| `aprobar` | el de la versión que se reemplaza | el de la que se publica |
| `despublicar` (automático al aprobar o restaurar) | el de la que se archiva | el de la que la sustituye |
| `rechazar` / `eliminar` (descartar) | el de lo que sigue publicado | el de la versión rechazada o descartada |
| `publicar` (restaurar) | el de lo publicado | el de la versión restaurada |

La columna «Cambios» muestra el comentario de la versión de la que habla la fila (en
`despublicar`, el de la archivada) y, detrás, el motivo si lo hay. El detalle enseña una
línea que explica los dos lados según la acción: sin ella, un rechazo se leía como si el
comentario rechazado hubiera quedado publicado.

**Regla del comentario.** De 10 a 100 caracteres, normalizado a una línea (saltos y
espacios dobles se juntan, se quitan caracteres de control), contado en caracteres y no
en unidades UTF-16 — así cuenta PostgreSQL el `VARCHAR`. El mínimo de 10 no lo pidió el
usuario: es la forma barata de que «ok» o «cambios» no pasen por «específico». Está en
una constante (`COMENTARIO_MIN`) si hay que moverlo.

### Capas tocadas

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/029-comentario-cambios-versiones.ts` (nuevo) + `index.ts` | Columna, relleno de las que estuvieran en revisión y `CHECK ck_paginas_versiones_comentario` (invariante I14) |
| Modelo | `models/pagina-version.ts` | `comentarioCambios` |
| Regla | `shared/comentario-cambios.ts` (nuevo) | Topes, normalización y mensajes; la usan Zod y el caso de uso |
| Ruta | `pagina.routes.ts`, `validators/paginas.validators.ts` | `validarCuerpo(enviarARevisionSchema)`, `.strict()`; OpenAPI con `requestBody` y el 400 |
| Casos de uso | `enviar-a-revision`, `rechazar-pagina`, `eliminar-version`, `restaurar-version-anterior`, `listar-en-revision` | Guardan o devuelven el comentario; los que registran leen el de lo publicado para el «antes» |
| Controlador | `pagina.controller.ts` | `campoComentario()` en `enviar_revision`, `aprobar`, `despublicar`, `rechazar` y `eliminar` |
| Depuración | `analizar-depuracion-versiones`, `depurar-versiones` | La columna nueva entra en la suma del peso por fila |
| Scripts | los 6 `sembrar-*`/`migrar-plantilla-intranet` | Pasan un comentario que dice que la versión la sembró un script |
| sitio-web editor | `puck-editor-wrapper.tsx`, `use-pagina.ts`, `edicion.service.ts`, `globals.css` | Textarea en el modal con contador, botón apagado hasta que vale, Enter envía; el error de la API se enseña con su motivo y no con el «Request failed…» de axios |
| intranet editor | `puck-editor-wrapper.tsx`, `use-editor-actions.ts`, `edicion.service.ts`, `globals.css` | Lo mismo |
| Cola de revisión | `revision-queue-view.tsx`, `pagina.types.ts` | El comentario bajo el título; el buscador también lo encuentra |
| Auditoría | `lib/cambios.ts` (nuevo), `auditoria-view.tsx`, `detalle-registro.tsx`, `csv.ts`, `types.ts` | Columna «Cambios», detalle con comentario anterior/después y motivo; el CSV suma la columna «Cambios» y conserva «Campos modificados» entera (es el respaldo previo a depurar) |

**Dos arreglos de paso en la intranet**, los dos en `use-editor-actions.ts`:
- `handleEnviarRevision` se tragaba el error y el editor enseñaba «Tu edición se envió
  con éxito» aunque la API lo hubiera rechazado. Ahora lo relanza, como ya hacía
  `handleGuardarBorrador`.
- La guarda `if (!versionId)` leía un `versionId` del render anterior: en una sección
  nueva, guardar y enviar van en el mismo clic, así que el primer envío se cortaba en
  silencio. Se quitó; si no hay borrador, lo dice la API.

**Qué no cambió a propósito.** Los registros que no son del ciclo editorial (usuarios,
roles, depuraciones, `guardar_borrador`, crear o eliminar secciones) siguen enseñando
su lista de campos: ahí no hay comentario que mostrar y quitarla dejaría el detalle
vacío. Los registros editoriales anteriores a esta sesión dicen «Sin comentario
(registro anterior a los comentarios obligatorios)» en vez de la lista vieja. El JSON
de la bitácora sigue guardando `slug`, `version` y `estado`: la pantalla no los
enseña, pero siguen ahí para consultas y para el CSV.

### Verificación

| Qué | Resultado |
|---|---|
| `tsc --noEmit` en api-backend (src) y en los 6 scripts de siembra | Sin errores |
| `tsc --noEmit` en sitio-web e intranet | Sin errores |
| ESLint en los archivos tocados | Intranet limpio. sitio-web: 1 error y 1 aviso que **ya estaban en `HEAD`** (`item: any` en `puck-editor-wrapper.tsx`, `Ambito` sin usar en `revision-queue-view.tsx`) |
| Esquema Zod con 11 casos (sin cuerpo, vacío, espacios, 7 caracteres, saltos de línea, 100, 101, 100 emojis, número, campo extra) | Cada uno da lo esperado; «  Actualicé   las cifras\n de agosto  » se guarda como «Actualicé las cifras de agosto» |
| SQL de la 029 sobre una tabla **temporal** clonada de `paginas_versiones` (solo de la sesión, sin tocar la real) | Relleno aplicado; el `CHECK` rechaza `en_revision` sin comentario, con solo espacios y el paso `borrador → en_revision` sin comentario; 101 caracteres los rechaza el `VARCHAR` |
| `lib/cambios.ts` con 8 registros de ejemplo (nuevos, antiguos y de usuarios) | Columna, detalle y línea de ayuda correctos; de aquí salió el ajuste de `despublicar` |
| Recorrido completo en el navegador | **No se hizo**: la migración no está aplicada (ver aviso) |

> **La 029 no está aplicada, a propósito.** La API apunta a la base de Neon, que
> comparte el equipo. Con el `CHECK` puesto, quien siga con el código anterior no puede
> enviar a revisión (su petición no manda comentario y la base la rechaza). Aplicarla
> cuando esto esté en `dev`: `npm run migrate` en `api-backend` y reiniciar
> `npm run dev` (no recarga solo). Hoy no hay ninguna versión en `en_revision`, así que
> el relleno no toca filas. `migrate:status` la da como la única pendiente.

**Pendiente al cierre:**
- Aplicar la 029 y probar el recorrido completo: enviar desde sitio-web y desde la
  intranet, aprobar uno, rechazar otro, descartar un tercero, y mirar las cuatro filas en
  Auditoría.
- El resumen «Actividad reciente» de `panel-general.tsx` sigue listando nombres de campo
  (`comentario, slug, version, estado`); podría enseñar `resumenDeCambios` como la tabla.
- Respaldos lista versiones archivadas sin su comentario; sería el «git log» natural de
  cada página.
- Los topes 10/100 están en la API y repetidos en los dos editores. Si se tocan, son
  tres sitios (lo dice el comentario de `shared/comentario-cambios.ts`).

---

## sesión 18-09-2026 (15.ª parte): un solo diseño de paginación en todas las tablas

El usuario pegó un paginador de Flowbite y pidió aplicarlo a todas las tablas con
los colores actuales, no con los del ejemplo. El ejemplo es un grupo de casillas
unidas (Previous, números, Next) y un campo «Go to [ ] page».

**Qué había.** De las 9 tablas del sitio, 7 paginan, y lo hacían con tres componentes:
- `shared/ui/molecules/paginador.tsx`: el del panel. Lo usan Roles, Usuarios, Actividad
  Reciente, Auditoría y Revisión.
- `programas-sobresalientes/components/paginador.tsx` y
  `tendencia-ocupacional/components/paginador.tsx`: copias idénticas para las tablas
  públicas (la segunda, sin los comentarios).

Las otras dos tablas no tienen paginador y no se tocaron. **Respaldos** filtra en memoria
lo ya cargado; el **historial de cargas** es corto.

**Qué se hizo.**
- **Un componente nuevo, `shared/ui/molecules/paginacion.tsx` (`Paginacion`)**, con el
  diseño pedido:
  - casillas unidas (`-space-x-px`) con «Anterior» y «Siguiente» en los extremos;
  - el campo «Ir a la página [ ] de N».
  La paleta sale de la prop `tono`, que conserva los colores de cada zona:
  - `panel`: grises zinc con tema oscuro, y la página actual en `brand-interactive`, como
    antes;
  - `publico`: `#344054`, bordes `#d0d5dd`, hover `#f2f4f7`, y la página actual en
    `#001631`, como antes.
- **`Paginador` (panel)** conserva «Mostrando X-Y de Z» y las filas por página. La
  paginación de la derecha pasa a ser `Paginacion`.
- **Las dos copias públicas se borran**, y sus tablas usan `Paginacion` directamente.
  Mantener tres implementaciones del mismo diseño era garantizar que divergieran.

**Diferencias con el ejemplo, a propósito.**
- **Foco visible.** El ejemplo pone `focus:outline-none` y nada a cambio. Aquí va el
  anillo `brand-focus` (3:1, SC 1.4.11, `9-accesibilidad.md`), con `z-10` para que las
  casillas vecinas no lo tapen.
- **Móvil.** Por debajo de `sm`, «Anterior» y «Siguiente» se vuelven flechas y las
  casillas miden 32px. Con los textos, la fila no cabía en un teléfono de 375px.
- **El campo.** Es de texto numérico y no `type="number"`, porque sus flechas no caben en
  ese ancho. Lleva `w-12` en vez de `w-10`, para que quepan tres cifras (Auditoría puede
  pasar de cien páginas). Si el número está fuera de rango, se va al extremo más cercano.
- **Qué números se ven en el panel.** Antes, con más de 7 páginas, el panel mostraba una
  cantidad de casillas que variaba según la página actual. Ahora usa el criterio que ya
  tenían las tablas públicas: siempre 7 posiciones, para que las flechas no se muevan
  bajo el cursor.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `shared/ui/molecules/paginacion.tsx` | Nuevo: el diseño, con `tono` `panel` / `publico` |
| Frontend | `shared/ui/molecules/paginador.tsx` | Usa `Paginacion`; se va `rangoDePaginas` |
| Frontend | `programas-sobresalientes/components/paginador.tsx`, `tendencia-ocupacional/components/paginador.tsx` | Se borran |
| Frontend | `resultados-programas-sobresalientes.tsx`, `tabla-tendencia.tsx` | Usan `Paginacion` con `tono="publico"` |
| Frontend | `programas-sobresalientes/index.ts` | Comentario: el paginador ya no es pieza propia |
| Docs | `1-guia-del-proyecto.md` | Árbol de `shared/ui/molecules/`: eran 11 y decía 10; ahora 12 |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| `eslint` de los archivos tocados | sin avisos |
| `Paginacion` pintada a HTML con `react-dom/server` | 3 páginas: las 3. 112 páginas en la 1, la 5, la 110 y la 112: siempre 7 posiciones. «Anterior» desactivada en la primera y «Siguiente» en la última; el campo dice «de 112» |
| Tono `panel` | página actual en `bg-brand-interactive`, clases `dark:` presentes, anillo de foco presente |
| `curl /programas-sobresalientes` en desarrollo | 200, sin errores de compilación |
| `next build` en una copia aparte | exit 0 |

**Pendiente al cierre:**
- **Mirarlo en el navegador** (no se pudo desde aquí): una tabla del panel en tema claro y
  oscuro, Programas Sobresalientes y Tendencia Ocupacional en escritorio y a 375px, y
  recorrer la paginación con Tab para ver el anillo de foco.
- El bloque «Publicaciones» (`shared/lib/blocks/publicaciones.tsx`) tiene su propia
  paginación de tarjetas. No es una tabla y no se tocó.

## sesión 18-09-2026 (14.ª parte): pantallas de acceso en `app/(auth)/`, con las mismas carpetas en la intranet y en el sitio-web

El usuario pidió renombrar `intranet/src/app/login/` a `app/(auth)/`, con el login y las
demás carpetas dentro, y que el sitio-web quedara igual a nivel de carpetas: le parecía que
el sitio no tenía ese flujo. Sí lo tenía, pero en dos pantallas con pasos internos:
`/admin/recuperar` hacía lo de `recovery`, `security-questions`, `reset-password` y
`reset-success`, y `/admin/cambiar-contrasena` lo de `first-login`.

**Lo que se le preguntó y lo que eligió.**
- *Intranet:* ¿los pasos quedan como hermanos de `login/` o dentro de él? **Hermanos.**
  `(auth)` es un grupo de rutas y no añade segmento a la URL, así que `/login/recovery`
  pasa a ser `/recovery`, y lo mismo con los otros cuatro pasos. `/login` no cambia.
- *Sitio-web:* ¿una pantalla por paso, solo renombrar las dos que había, o dejarlo? **Una
  pantalla por paso, y en `(auth)/` sin el segmento `admin`**, con las mismas carpetas que
  la intranet. El login pasa de `/admin/login` a `/login`.

**Intranet.** Solo cambian las carpetas y las rutas; la lógica queda igual.
- `app/login/*` pasa a `app/(auth)/*`: la página del login a `(auth)/login/`, el
  `template.tsx` (la animación de deslizamiento) a la raíz del grupo, y los cinco pasos al
  lado del login.
- **El middleware ya no puede mirar el prefijo `/login`**, que era como distinguía las
  pantallas públicas. Sin cambiarlo, quien va a `/recovery` sin sesión habría rebotado al
  login. Ahora usa dos listas explícitas: las 6 pantallas de acceso, y las 4 que se pueden
  abrir con una configuración pendiente.
- `next.config.ts` estrena `redirects()`: `/login/<paso>` → `/<paso>`. El `<paso>` sale de
  una lista cerrada de los cinco, no de un comodín, que habría mandado cualquier
  `/login/<algo>` a la raíz, donde el comodín de secciones podría servir una página.

**Sitio-web.** Aquí sí cambió la forma: de 2 pantallas con pasos se pasa a 6 rutas.
- **Los datos de un paso al siguiente viven en memoria, no en `sessionStorage`.** La
  intranet se pasa el correo, las preguntas y **las respuestas de seguridad en claro** por
  `sessionStorage`. Por eso el sitio tenía el flujo en una sola pantalla. Para partirlo sin
  heredar ese problema, `flujo-de-recuperacion.tsx` guarda el estado en un contexto que
  monta `app/(auth)/layout.tsx`. Next conserva un layout mientras se navega entre sus
  páginas, así que los datos sobreviven al cambio de ruta y se pierden solos al salir o
  recargar. Es un estado por etapas (`preguntas` → `nueva-contrasena` → `terminada`), y
  al terminar suelta el correo y las respuestas.
- **Cada paso comprueba que le toca.** `security-questions`, `reset-password` y
  `reset-success` abiertos sueltos (a mano o tras recargar) devuelven a `/recovery`. Sin
  eso, `reset-success` diría que se cambió una contraseña que nadie tocó.
- **`recuperar-password-flow.tsx` se reparte en 4 vistas** (`recovery-view`,
  `security-questions-view`, `reset-password-view`, `reset-success-view`), con los mismos
  textos y reglas. Se mantienen dos: se verifican las tres respuestas de golpe y no de una
  en una, y un fallo vuelve a la primera pregunta.
- **`/first-login` sigue resolviendo todas las combinaciones pendientes** (contraseña,
  preguntas o las dos), con el `FirstLoginFlow` de antes. En la intranet, cuando solo falta
  una cosa, se usan `security-questions` y `reset-password` en «modo configuración». En el
  sitio esas dos rutas son solo pasos de la recuperación. Las carpetas son las mismas, pero
  el reparto no es idéntico, a propósito: no se reescribió lógica que ya funcionaba.
- **El login ya no pinta el primer ingreso dentro de su pantalla**: navega a `/first-login`.
  El saludo («Hola …») sale ahora de la cookie `sitio_userName`, que el login ya escribía,
  así que aguanta una recarga. Antes solo aparecía cuando se llegaba desde el login.
- **`AuthSplitShell` pasa al layout del grupo.** Antes lo montaba cada pantalla. Así queda
  uno solo y no parpadea entre pasos (se comprobó que el `h1` del marco sale una sola vez).
- `next.config.mjs`: se quita `/login` → `/admin/login`, que ahora sería un bucle. Se
  añaden `/admin/login` → `/login`, `/admin/recuperar` → `/recovery` y
  `/admin/cambiar-contrasena` → `/first-login`. `/auth/login` y `/admin/auth` van a
  `/login`.
- `middleware.ts`: el login y la configuración pendiente pasan a `/login` y `/first-login`,
  también en el `matcher`. Los cuatro pasos de la recuperación quedan fuera a propósito,
  porque quien recupera su contraseña no tiene sesión.

**Slugs reservados.** Los cinco pasos ocupan ahora la raíz en las dos apps, y en Next una
carpeta concreta le gana al comodín de secciones. Por eso se añadieron a
`SLUGS_RESERVADOS` de `@olo/slug-policy`. Su `dist/` no está en git: se recompiló y se
copió a los `node_modules/@olo/slug-policy` de las tres apps (`install-links=true` hace
copias, no enlaces).

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend (intranet) | `app/login/*` | Pasa a `app/(auth)/*`; la página del login, a `(auth)/login/` |
| Frontend (intranet) | `(auth)/template.tsx`, `login-view`, `recovery-view`, `security-questions-view`, `reset-password-view` | Rutas sin `/login/` delante |
| Frontend (intranet) | `middleware.ts` | Listas `RUTAS_DE_ACCESO` y `RUTAS_DE_CONFIGURACION_PENDIENTE` en vez del prefijo `/login` |
| Frontend (intranet) | `next.config.ts` | `redirects()`: `/login/<paso>` → `/<paso>` |
| Frontend (sitio) | `app/(auth)/admin/login/` | Pasa a `app/(auth)/login/` |
| Frontend (sitio) | `app/(auth)/admin/recuperar/`, `cambiar-contrasena/` | Se borran; en su lugar `(auth)/recovery`, `security-questions`, `reset-password`, `reset-success` y `first-login` |
| Frontend (sitio) | `app/(auth)/layout.tsx` | Monta `AuthSplitShell` y `FlujoDeRecuperacionProvider` |
| Frontend (sitio) | `auth/components/recuperar-password-flow.tsx` | Se borra; se reparte en `flujo-de-recuperacion.tsx` y las 4 vistas nuevas |
| Frontend (sitio) | `login-view.tsx`, `first-login-flow.tsx`, `auth/index.ts` | Navega a `/first-login`; sin marco propio; exporta las vistas nuevas |
| Frontend (sitio) | `middleware.ts`, `next.config.mjs` | Rutas y alias nuevos |
| Frontend (sitio) | `editor/[slug]/page.tsx`, `api-client.ts`, `vigilante-sesion.tsx`, `header.tsx`, `panel-general.tsx` | Enlaces a `/login` |
| Paquete | `@olo/slug-policy` | 5 slugs reservados más |
| Comentarios | `admin/layout.tsx`, `(secciones)/layout.tsx`, `features/login/index.ts`, `auth-cookies.ts`, `api/auth/login` y `api/auth/first-login`, `@olo/inactividad`, `crear-superadmin.ts` | Rutas nuevas |
| Docs | `1-guia-del-proyecto.md` (los dos árboles de `app/`, alias, RF-16), `4-reglas.md` (regla 8) | Estructura nueva. La regla 8 decía que la intranet no usaba grupos de rutas: ya no era cierto con `(secciones)` |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en las dos apps, tras `next typegen` | exit 0 |
| `eslint` de los archivos tocados | 0 errores; los avisos son todos de código anterior (imports sin usar en `panel-general`, `roles-view`, `reset-password-view`…) |
| `next build` en una copia aparte, las dos apps | exit 0. Intranet: `/login`, `/first-login`, `/recovery`, `/security-questions`, `/reset-password`, `/reset-success`, estáticas. Sitio: las mismas; `/first-login` es dinámica (lee la cookie del nombre) |
| `curl` sitio: las 6 pantallas | 200; `/first-login` sin sesión, 307 a `/login?redirect=/first-login` |
| `curl` sitio: `/admin/login?redirect=/admin/users`, `/admin/recuperar`, `/admin/cambiar-contrasena`, `/admin/auth`, `/auth/login` | 307 a `/login` (conservando la query), `/recovery` y `/first-login` |
| `curl` sitio: `/admin/dashboard`, `/editor/inicio` sin sesión | 307 a `/login?redirect=…` |
| `curl` intranet: las 6 pantallas sin sesión | 200 (públicas, como antes) |
| `curl` intranet: `/login/recovery` y los otros cuatro | 307 a `/recovery`, etc. `/login/otra-cosa` va al login como cualquier ruta protegida |
| HTML del sitio | el marco sale una vez por página; `/security-questions` sin datos no pinta tarjeta |
| Finales de línea | ninguno mezclado. `sed -i` había pasado a LF los archivos CRLF que tocó; se devolvieron a CRLF |

**Pendiente al cierre:**
- **Probar en el navegador con una cuenta real** (no se pudo desde aquí). En el sitio: la
  recuperación entera por las 4 pantallas, el botón «Atrás» del navegador entre pasos, y
  entrar con una cuenta que deba el primer ingreso para confirmar que el login lleva a
  `/first-login` con el saludo. En la intranet: los mismos flujos por sus rutas nuevas.
- **Reiniciar la API** (ts-node sin *watch*): hasta entonces sigue con la lista vieja de
  slugs reservados y dejaría crear una sección llamada `recovery`.
- **Avisar al equipo:** tras el `pull`, cada quien debe correr `npm install` en
  `sitio-web`, `intranet` y `api-backend` (o recompilar `packages/slug-policy`). Además,
  el login del sitio ahora es `/login`, no `/admin/login`.
- La intranet sigue guardando las respuestas de seguridad en `sessionStorage`. No se tocó
  porque no se pidió, pero el sitio ya muestra cómo evitarlo.

## sesión 18-09-2026 (13.ª parte): `app/admin` sin `(shell)`, y el editor y la vista previa fuera de `/admin`

El usuario pidió dos cosas en `sitio-web/src/app`:
- subir el contenido de `admin/(shell)/` (páginas y `layout.tsx`) a `admin/` y borrar el grupo;
- sacar `admin/editor/` y `admin/preview/` a la raíz de `app/`.

**El choque con el login, y cómo se resolvió.** `(shell)/layout.tsx` es el marco del panel:
barra lateral, sesión y vigilante de inactividad. En Next un `layout.tsx` envuelve todo lo
que cuelga de su carpeta, y una página no puede saltárselo. Si se subía a
`admin/layout.tsx` tal cual, envolvía también `admin/(auth)/`: el login, recuperar y
cambiar contraseña habrían salido con la barra lateral y con el vigilante, sin sesión. Se
le plantearon tres salidas: sacar `(auth)` a la raíz, mover el login fuera de `/admin`
(cambia su URL y todo lo que la usa) o dejar `(shell)` como estaba. **Eligió la primera**:
las pantallas de acceso pasan a `app/(auth)/admin/…`. La URL no cambia (`/admin/login`),
pero quedan en otra rama del árbol y el marco del panel no las alcanza. Next acepta que
`app/admin/` y `app/(auth)/admin/` compartan el segmento `admin` porque ninguna ruta
completa se repite; se comprobó con el build.

**Editor y vista previa.** Pasan de `/admin/editor/<slug>` y `/admin/preview/<slug>` a
`/editor/<slug>` y `/preview/<slug>`, la misma ruta que en la intranet. Antes de moverlos
se comprobó:
- las cookies de sesión llevan `path: '/'`, así que siguen llegando fuera de `/admin`;
- `editor` y `preview` ya eran slugs reservados en `@olo/slug-policy`, así que no chocan
  con el comodín público `[slug]`;
- el login acepta volver a cualquier ruta interna, no solo a `/admin`.

`next.config.mjs` redirige lo viejo a lo nuevo y conserva la query (`?volver=`). El
`middleware.ts` protege ahora `/editor/:path*`. `/preview` sigue sin estar en su lista,
como antes: la propia página devuelve 404 a quien no puede editar.

**Cómo se movió.** Renombrar las carpetas falló con `Permission denied`: el servidor de
desarrollo las tenía abiertas. Un script copió cada archivo, comprobó que la copia fuera
idéntica byte a byte, y solo entonces borró los originales y las carpetas vacías. Solo
podía sobrescribir `admin/layout.tsx`, y solo si era el `<>{children}</>` que había.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `app/admin/(shell)/*` | Pasa a `app/admin/*`; su `layout.tsx` sustituye al passthrough de `admin/` |
| Frontend | `app/admin/(auth)/*` | Pasa a `app/(auth)/admin/*` (el `layout.tsx` del grupo, a `app/(auth)/`) |
| Frontend | `app/admin/editor/`, `app/admin/preview/` | Pasan a `app/editor/`, `app/preview/` |
| Frontend | `middleware.ts` | Regla y `matcher` de `/editor`; la redirección de un editor sin panel apunta a `/editor` |
| Frontend | `next.config.mjs` | Redirecciones `/admin/editor/*` → `/editor/*` y `/admin/preview/*` → `/preview/*` |
| Frontend | `paginas/model/rutas.ts`, `revision-queue-view.tsx`, `vista-previa-version.tsx`, `buscador/lib/indice-panel.ts`, `editor/[slug]/page.tsx` | Enlaces a las rutas nuevas |
| Frontend y API | Comentarios en 10 archivos (los tres `layout.tsx` de `app/`, `preview/[slug]/page.tsx`, `(public)/[slug]/page.tsx`, `puck.config.tsx`, `menu-y-pie.ts`, `session.ts`, `sembrar-permisos-roles.ts`, `sembrar-plantilla-sitio.ts`) | Rutas y estructura nuevas |
| Docs | `1-guia-del-proyecto.md` (árbol de `app/`), `4-reglas.md` (regla 8), `8-ciclo-editorial.md` | Estructura nueva |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` tras `next typegen` | exit 0 |
| `eslint` de los archivos tocados | 2 avisos, **anteriores** (`puedeEditarPaginas` y `Ambito` sin usar) |
| `next build` | exit 0. Rutas: `/(auth)/admin/login` → `/admin/login` y sus dos hermanas, estáticas (no leen la sesión del panel); las 11 del panel, dinámicas; `/editor/[slug]` y `/preview/[slug]` |
| `curl` `/admin/login`, `/admin/recuperar` | 200, **sin** marcas del panel en el HTML («Cerrar sesión») |
| `curl` `/admin/dashboard`, `/admin/revision`, `/admin/cambiar-contrasena`, `/editor/inicio` sin sesión | 307 al login, con `?redirect=` a la ruta pedida |
| `curl` `/admin/editor/inicio`, `/admin/editor/menu-y-pie?volver=%2Finicio`, `/admin/preview/inicio` | 307 a `/editor/…` y `/preview/…`, con la query intacta |
| Simulación del `pull` con `OLO/dev` | sin conflictos; el cambio de Samuel (`acceso.sitio`) y el de Mateo (`setError`) caen en `app/editor/[slug]/` |
| Finales de línea de los 125 archivos cambiados | ninguno mezclado |

> **Error que ya existía.** Si alguien con permisos de edición pero sin `acceso.panel` entra a
> `/admin/dashboard`, el middleware lo manda al editor **sin slug**. Esa ruta nunca tuvo
> página: antes daba 404 en `/admin/editor` y ahora lo da en `/editor`. Se tradujo la ruta
> sin cambiar el comportamiento, porque decidir a dónde debe ir esa persona es una
> decisión aparte.

**Pendiente al cierre:**
- Tras el `pull`, `shared/lib/blocks/publicaciones.tsx` (de Diego) todavía busca
  `/admin/editor` en la URL. Es un respaldo que no se usa, porque `puck.config` siempre
  le pasa `esEdicion`, pero hay que cambiarlo a `/editor`.
- Con sesión: entrar al panel y comprobar la barra lateral en cada sección; abrir el
  editor desde el botón flotante y salir con «Salir»; abrir «Ver» en la cola de revisión.

---

## sesión 18-09-2026 (12.ª parte): revisión de lo que subió a `dev` (PR #110, #112 y #113)

Con la reorganización todavía sin commitear, entraron a `OLO/dev` tres pull requests:
Mateo (#110, tendencia ocupacional y editor), Samuel (#112, permisos) y Diego (#113,
errores del editor). El usuario pidió revisar si dañaban o sobrescribían algo que ya
funcionaba.

**Cómo se comprobó sin tocar la rama del usuario.** Se armó en memoria un commit con el
trabajo sin commitear: un índice temporal (`GIT_INDEX_FILE`), `write-tree` y
`commit-tree`, sin mover ninguna rama. Después se mezcló con `git merge-tree
--write-tree` contra `OLO/dev`. El resultado se extrajo con `git archive` a una carpeta
temporal y ahí se compilaron las tres apps.

**Resultado: la mezcla es limpia.** Git reconoció los movimientos de carpeta y metió cada
cambio de los compañeros en la ruta nueva: el botón flotante de Samuel en
`paginas/secciones/components/` de las dos apps, el `editorjs-wrapper` de Diego y el
`use-pagina` de Mateo en `edicion/`. No reapareció ninguna carpeta vieja. Nadie añadió
imports a rutas internas antiguas. El arreglo del donut de `tarjeta-usuarios.tsx` que
trae `dev` es **idéntico** al restaurado en la 1.ª parte, así que ese commit ya no hace
falta.

**Hallazgos (nada roto hoy, tres cosas que decidir):**

- **Permisos (Samuel).** Editar pasa a exigir `acceso.sitio` / `acceso.intranet`, en la
  API (`requierePermisoDeSeccion`), en las dos páginas del editor y en los dos botones
  flotantes. En la base, Administrador y Editor tienen las dos llaves. El rol **«Editor
  inicio»** (1 usuario, creado desde el panel) no tiene ninguna y tiene
  `editar.sitio.menu-y-pie`. En la intranet ya no entraba (su `middleware.ts` exige
  `acceso.intranet`), pero en el sitio `/admin/editor` sí lo dejaba pasar: **pierde la
  edición del «Menú y pie» del sitio**. Si es intencional, no hay nada que hacer; si no,
  hay que darle `acceso.sitio` desde el panel. El comentario de
  `api-backend/src/shared/ambito.ts` que desaconsejaba esta comprobación («dejaría fuera
  al Administrador») ya no describe la base: hoy el Administrador sí tiene las dos llaves.
- **Texto enriquecido (Diego).** En modo lectura, que es también como se pinta en el sitio
  público, un bloque vacío muestra «Escribe o edita el contenido desde el panel lateral
  derecho». Hoy no afecta a nadie: hay 0 bloques `RichText` en las 14 páginas publicadas
  (consulta de solo lectura). Además, los bloques nuevos de texto enriquecido y
  «Publicaciones» nacen con contenido de ejemplo (un párrafo y 4 PDF, que sí existen en
  el repo); si se publican sin editar, ese ejemplo sale al público.
- **Archivos subidos por error (Mateo).** Tres PNG de `sitio-web/public/storage/backup/`
  (respaldos que genera la app; `storage/` no está en `.gitignore`) y `next-env.d.ts`, que
  Next reescribe solo. Ninguno rompe nada. `mostrarBannerDepartamento` se fuerza a `false`
  y no tiene campo en el editor, así que el banner nuevo no se puede activar todavía.

| Verificación | Resultado |
|---|---|
| `git merge-tree --write-tree` (trabajo local + `OLO/dev`) | sin conflictos |
| Rutas viejas en el árbol mezclado (`gestor-secciones`, `paginas/components`, `login/api`…) | ninguna |
| `tsc --noEmit` sobre el árbol mezclado | exit 0 en `sitio-web`, `intranet` y `api-backend` |
| `next build` sobre el árbol mezclado | exit 0 en `sitio-web` e `intranet` |
| Roles y llaves `acceso.*` en la base (solo lectura) | Administrador y Editor: las dos; «Editor inicio»: ninguna |
| Bloques `RichText` publicados vacíos (solo lectura) | 0 de 0 |

> **Trampa de la simulación.** Turbopack rechaza un `node_modules` que sea un *junction*
> hacia fuera de la raíz del proyecto («Symlink … points out of the filesystem root»).
> En la copia temporal hubo que apuntar `turbopack.root` y `outputFileTracingRoot` a un
> ancestro común. El build `standalone` **copia los junctions** dentro de `.next/`; antes
> de borrar la carpeta temporal hay que quitar todos los enlaces (se hizo con
> `DirectoryInfo.Delete()` y comprobando que no quedara ninguno), o el borrado recursivo
> podría entrar en el `node_modules` real.

**Pendiente al cierre:**
- Decidir si «Editor inicio» debe conservar la edición del menú del sitio.
- Pedir a Diego que el aviso de bloque vacío solo salga dentro del editor.
- Tras el `push`, avisar al equipo de que `gestor-secciones/` pasó a `paginas/` y de que
  `features/paginas` del sitio está por etapa: una rama que cree un archivo nuevo en una
  carpeta vieja la haría reaparecer.

---

## sesión 18-09-2026 (11.ª parte): la intranet copia el orden del sitio (`gestor-secciones/` → `paginas/`)

El usuario pidió analizar la intranet y aplicarle la misma lógica que al sitio. Las rutas
no necesitaban cambios: el comodín `(secciones)/[...puckPath]` sirve cualquier
profundidad (`/encuestas/calidad-de-formacion` llega entero) y ya cortaba `/menu-y-pie`
con un 404. El sitio necesitó carpetas para `clasificacion/cno` porque su comodín
`[slug]` solo cubre un segmento; la intranet no. El trabajo estaba en `features/`: era
la fase 4 de `8-ciclo-editorial.md` §5, anotada como pendiente desde agosto.

**Nombre: `paginas/`.** `gestor-secciones/` era la gemela de `sitio-web/.../paginas/` con
otro nombre, y la guía pedía elegir uno para las dos. Se eligió `paginas/` porque ya lo
usan el sitio, `use-cases/paginas/` y la tabla `paginas`: renombrar la intranet tocaba
una carpeta; renombrar el resto, tres capas.

**Árbol, con las mismas decisiones que el sitio:** `model/` (plana), `publicacion/`,
`edicion/` y `secciones/` con subcarpetas por tipo, `menu-y-pie/` (plana), `index.ts` y
`client.ts`. No hay `revision/`: la intranet se aprueba desde el panel del sitio.

- `api/paginas.api.ts` se partió por etapa: `publicacion.service.ts` (publicada, índice
  de búsqueda y `registrarVisita`, que antes era un `fetch` dentro de
  `rastreador-visitas.tsx`; es la misma petición que hace el sitio),
  `edicion.service.ts` (editable, borrador, enviar a revisión, candado, subidas) y
  `secciones.service.ts` (crear, analizar y borrar, y `pedirPermisosDeLaSesion`, que
  antes era un `apiClient.get('/me')` dentro del botón flotante). Se llama distinto de
  `permisosDeLaSesion` de `shared/lib/sesion.ts`, que lee cookies y solo sirve en el
  servidor, para no confundir las dos.
- `types/editor.types.ts` → `model/pagina.types.ts`, al que subieron también
  `PaginaPublicada`, `VersionEditable` y los tipos del índice de búsqueda. Las props de
  `PuckEditorWrapper` y `EditorJsWrapper` pasaron a su propio componente. `model/`
  importaba `Rechazo` de un componente del editor, y eso rompe la regla 1 de §3.2.
- `lib/ruta-de-vuelta.ts` → `model/rutas.ts`, con `slugDeRutaPublica` (URL → slug) y
  `rutaPublicaDeSlug` (slug → URL, espejo de la rama intranet de `resolverHref` en la
  API: `encuestas-*` cuelga de `/encuestas/`). El rastreador y el botón flotante
  dejaron su copia local de la regla. El editor, al salir sin `?volver=`, va a la ruta
  canónica y no a `/{slug}`.
- `lib/plantilla.ts` → `menu-y-pie/menu-y-pie.ts`; `components/marco-secciones.tsx` →
  `menu-y-pie/marco-secciones.tsx`.
- `client.ts` nuevo: la barra (`intranet-topbar.tsx`) es un bloque de `puck.config` y
  leía el índice de búsqueda directo de `api/paginas.api.ts`. Por el `index.ts` cerraría
  el ciclo `index` → `ClientPuckRender` → `puck.config` → barra; `client.ts` no depende
  de `puck.config`. Es el mismo arreglo del sitio.
- `login/api/auth.api.ts` → `login/services/auth.service.ts` (convención 8).
- Borrados los mismos cuatro botones sin uso que en el sitio (`edit-button`,
  `plantilla-edit-button`, `nueva-seccion-button`, `eliminar-seccion-button`), el tipo
  `EditButtonProps` y sus estilos: `.edit-button`, `--plantilla`, `--nueva`,
  `--eliminar`, sus `:hover` y `olo-boton-flotante-aparece` (2.721 caracteres de
  `globals.css`).

**Bug corregido de paso.** `slugDeOrigen` quitaba las barras de los extremos pero no unía
los segmentos. Al abrir «Menú y pie» desde `/encuestas/calidad-de-formacion` pedía el slug
`encuestas/calidad-de-formacion`. Ese slug no existe (la API lo expone como
`/paginas/publica/:slug`, que no cruza barras), y el editor de la plantilla se abría sin
la sección de referencia debajo. Con `?volver=/tasa?x=1` pasaba lo mismo. Ahora usa
`slugDeRutaPublica`.

**Una decisión que se deshizo en la misma sesión.** Se probó que el comodín
`[...puckPath]` usara también `slugDeRutaPublica`. Se volvió a `puckPath.join('-')`:
Next entrega los segmentos ya decodificados, así que `/inicio%3Fx` llegaría como
`inicio?x`, la función cortaría en el `?` y mostraría `/inicio`. El comentario del
archivo explica por qué es la misma regla aunque no llame a la función.

**Cómo.** Un script de Node, adaptado del de la 10.ª parte, movió 24 archivos (23 de la
feature y `auth.api.ts`) y reescribió 51 imports, relativos y con `@/`, después de
correrlo en seco. Las únicas 4 líneas que no resolvió fueron las del `index.ts` que
apuntaban a los botones ya borrados; el `index.ts` se reescribió entero. El servicio se
partió a mano.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `intranet/src/features/gestor-secciones/` | Pasa a `features/paginas/`, por etapa y tipo |
| Frontend | `paginas/{publicacion,edicion,secciones}/services/*.service.ts` | Nuevos, desde `api/paginas.api.ts` |
| Frontend | `paginas/model/pagina.types.ts`, `model/rutas.ts` | Tipos de datos únicamente; regla URL ↔ slug; `slugDeOrigen` corregido |
| Frontend | `paginas/client.ts` | Nuevo, para la barra de navegación |
| Frontend | `paginas/index.ts` | Reescrito, agrupado por carpeta |
| Frontend | 4 componentes sin uso | Borrados |
| Frontend | `features/login/services/auth.service.ts` | Antes `api/auth.api.ts` |
| Frontend | `app/(secciones)/layout.tsx`, `[...puckPath]/page.tsx`, `editor/[slug]/*`, `preview/[slug]/page.tsx` | Import a `@/features/paginas`; comentarios |
| Frontend | `config/puck.config.tsx`, `shared/lib/blocks/plantilla/intranet-topbar.tsx`, `shared/lib/inactividad/vigilante-sesion.tsx` | Rutas de import nuevas |
| Frontend | `style/globals.css` | Sin `.edit-button*` ni su animación |
| Docs | `1-guia-del-proyecto.md` | §4.3 con el árbol nuevo; convenciones 8 y 9 pasan a ✅; duplicación medida (22 archivos en la misma ruta en las dos apps) |
| Docs | `8-ciclo-editorial.md` | §5.0: fases 1 a 4 cerradas (la tabla seguía de agosto); fase 4 reescrita con cómo se cerró |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `intranet` | exit 0 |
| Reglas de dependencia | `model` → etapas: 0; `edicion` ↔ `publicacion`: 0; imports internos desde fuera: solo `puck.config` (uploaders), la barra (`client.ts`) y `vigilante-sesion` (`auth.service`, ya era así) |
| `eslint src` | 0 errores, 9 avisos, **todos anteriores** (comprobados contra `HEAD`: `esSuperadmin` sin usar en el FAB, imports sin usar en `puck.config`, `login` y `editor/[slug]/page.tsx`) |
| `npm run build` | exit 0; `next-env.d.ts` sin cambios |
| Prueba de `model/rutas.ts` con `tsx` | 15/15, incluido el caso del bug |
| Llaves de `globals.css` | 766 `{` / 766 `}` |
| Finales de línea de los 39 archivos de la intranet que existen tras el cambio | ninguno mezclado |
| `curl` a la intranet en `:3001` sin sesión | `/login` 200; `/`, `/inicio`, `/encuestas/calidad-de-formacion`, `/menu-y-pie`, `/editor/tasa`, `/preview/tasa` → 307 al login |

**Pendiente al cierre:**
- Con el backend levantado y sesión en la intranet: abrir `/inicio` y una encuesta,
  buscar en la barra, editar una sección (guardar, subir imagen, enviar a revisión),
  abrir «Menú y pie» desde `/encuestas/calidad-de-formacion` y comprobar que la encuesta
  aparece debajo, y crear y eliminar una sección desde el botón flotante.
- `vigilante-sesion.tsx` puede importar `authApi` desde `@/features/login`, que ya lo
  exporta. No se cambió porque no hacía falta para esto.
- `use-pagina.ts` y `editorjs-wrapper.tsx` de la intranet son esqueletos sin uso (`TODO:
  Fase 3/6`). Se conservaron porque en el sitio siguen vivos y son parte de la lista de
  `editor-core`.

---

## sesión 18-09-2026 (10.ª parte): subcarpetas por tipo dentro de cada etapa de `paginas/`

Con las cuatro fases hechas, el usuario preguntó si convenía separar dentro de cada etapa
los `.tsx`, los `.ts` y los `.service.ts`. Se le recomendó no hacerlo todavía, por tres
motivos: las etapas tienen 3 a 11 archivos, en `revision/` quedarían tres carpetas de un
archivo cada una, y el sufijo del nombre (`*.service.ts`, `use-*.ts`, `*.tsx`) ya dice el
tipo. Se le aclaró también que lo hecho no es Clean Architecture (esa es la del backend),
sino organización por etapa dentro de un frontend *feature-based*. **Decidió organizarlo
igual**, y se aplicó.

**Qué quedó.** `publicacion/`, `edicion/`, `revision/` y `secciones/` tienen dentro
`components/`, `hooks/`, `services/` y `lib/` (la anatomía de §4.0, con `lib/` para lógica y
datos que no son servicio). `model/` y `menu-y-pie/` quedaron planas, porque solo tienen
archivos `.ts` de un mismo tipo. `pagina-en-edicion.tsx` fue a `edicion/lib/` y no a
`components/`: es un contexto de React, no algo que se pinte.

**Cómo.** Un script de Node movió los 26 archivos y reescribió los 72 imports afectados,
tanto relativos como con alias `@/`. Para cada import resolvía el archivo real al que
apuntaba (probando `.ts`, `.tsx` e `index`) y calculaba la ruta nueva desde la nueva
ubicación del archivo que importa. Se corrió primero en seco para revisar la lista. Solo
quedó un comentario con la ruta vieja (`model/api-con-sesion.ts`), que se corrigió a mano.

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| Reglas de dependencia con la nueva profundidad | etapas entre sí: 0; `publicacion` → `api-con-sesion`: 0; `model` → fuera: 0 |
| `eslint` sobre `features/paginas` y `puck.config.tsx` | los mismos 6 hallazgos anteriores, ninguno nuevo |
| `npx next build` | exit 0 |
| `curl` `/inicio`, `/clasificacion/cno`, `/inicio/politica-de-privacidad` | 200 |
| `curl` `/menu-y-pie` y `/admin/editor/tendencias` | 404 y 307 al login |

**Pendiente al cierre:** el mismo de la 9.ª parte. Levantar el backend y probar de punta a
punta: `/tendencias`, el buscador, el editor, la cola de revisión y el botón flotante.

---

## sesión 18-09-2026 (9.ª parte): fase 4 de `paginas/` (`revision/` y `secciones/`) y borrado de los cuatro componentes sin uso

Última fase del reordenamiento por etapa. Con ella desaparecen `components/`, `hooks/` y
`services/`, y `features/paginas` queda exactamente como el árbol de
`8-ciclo-editorial.md` §3.2, que se reescribió con la estructura real.

**`revision/`**: `revision.service.ts` (`listarEnRevision`, `aprobarPagina`,
`rechazarPagina`, `eliminarVersion` y su helper `cabeceraDeAmbito`),
`revision-queue-view.tsx` y `use-revision-queue.ts`.

**`secciones/`**: `secciones.service.ts` (`crearSeccion`, `analizarEliminacion`,
`eliminarSeccion`, `permisosDeLaSesion` y `resumenDePaginasPublicadas` con sus tipos),
`paginas-fab-speed-dial.tsx`, `modal-nueva-seccion.tsx`, `modal-eliminar-seccion.tsx`,
`aviso-seccion-nueva.tsx` y `use-permiso-de-seccion.ts`. `resumenDePaginasPublicadas`
podía ir a `revision/` o a `secciones/`: se puso en `secciones/` porque cuenta y enlaza las
secciones publicadas, no las versiones pendientes.

El servicio viejo se partió con el mismo script de la fase 3, cortando el texto exacto
entre dos marcadores, y después se borró. `index.ts` quedó agrupado por carpeta, sin
bloque de pendientes.

**Borrado, a pedido del usuario:** `edit-button.tsx`, `plantilla-edit-button.tsx`,
`nueva-seccion-button.tsx` y `eliminar-seccion-button.tsx`, sin uso desde `40d4508`
(09-09-2026, los reemplazó el botón flotante), junto con sus cuatro exportaciones del
`index.ts`. También se quitaron sus estilos, que quedaron sin ningún uso: `.edit-button`,
`--plantilla`, `--nueva`, `--eliminar`, sus `:hover` y la animación
`olo-boton-flotante-aparece`, unos 1.700 caracteres de `globals.css`. Los
`.nueva-seccion-*` se conservan: los usan los modales del botón flotante. El comentario
de `globals.css` que explicaba, con `.edit-button` de ejemplo, por qué la transición de
ruta anima con `margin-top` y no con `transform`, se reescribió como regla general, con
el caso del botón como antecedente.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `features/paginas/revision/` (nueva) | `revision.service.ts` + 2 movidos |
| Frontend | `features/paginas/secciones/` (nueva) | `secciones.service.ts` + 5 movidos |
| Frontend | `features/paginas/components/`, `hooks/`, `services/` | Eliminadas (vacías) |
| Frontend | 4 componentes sin uso | Borrados |
| Frontend | `features/paginas/index.ts` | Grupos `revision/` y `secciones/`; sin los 4 borrados |
| Frontend | `style/globals.css` | Sin `.edit-button*` ni su animación; comentario de la transición generalizado |
| Frontend | `app/api/auth/login/route.ts`, `administracion/actualizaciones/services/observatorio.service.ts`, `paginas/client.ts`, `model/*`, `publicacion/publicacion.service.ts` | Comentarios que citaban rutas o componentes que ya no existen |
| Docs | `1-guia-del-proyecto.md` | Árbol final de `paginas/` y párrafo del reordenamiento terminado |
| Docs | `8-ciclo-editorial.md` | §3.2 con el árbol real; §3.1 sin `contenidos/` |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| Reglas de dependencia (búsqueda de imports) | `revision` → `publicacion`/`edicion`: 0; `edicion` → `revision`/`secciones`: 0; `publicacion` → cualquier otra carpeta: 0; `publicacion` → `api-con-sesion`: 0; `model` → fuera de `model`: 0 |
| `.edit-button*` en ts/tsx tras el borrado | 0 menciones (tampoco armadas con texto dinámico) |
| Llaves de `globals.css` | 595 `{` / 595 `}` |
| `eslint` sobre `features/paginas` y los comentarios tocados | 1 error y 3 avisos, **anteriores** (`any` en `puck-editor-wrapper`, `Ambito` sin usar en `revision-queue-view`, `ROLES_QUE_EDITAN` en el FAB y en `use-permiso-de-seccion`) |
| `npx next build` | exit 0. En el registro: «Failed to fetch home page data» (el backend estaba apagado; la portada cae a su respaldo, como está previsto) y «Error decoding token for user profile», que viene de un `catch` de `shared/lib/session.ts` (no tocado; imprime el aviso normal de Next cuando una ruta lee cookies) |
| `curl` `/inicio`, `/clasificacion/cno`, `/inicio/politica-de-privacidad` | 200 con menú y pie |
| `curl` `/menu-y-pie` | 404 |
| `curl` `/admin/revision`, `/admin/editor/tendencias` sin sesión | 307 → login |
| `curl /tendencias` | 404: **el backend sigue apagado** (`:4000` sin conexión) |

> **Line endings.** `1-guia-del-proyecto.md` se guarda con LF en Git y en la copia de
> trabajo está en CRLF (`core.autocrlf`). Un reemplazo hecho con un script de Node metió
> 40 líneas solo con LF y dejó el archivo mezclado; se normalizó a CRLF y se revisaron
> los 63 archivos cambiados: ninguno quedó mezclado. Al editar por script, conservar el
> salto de línea del archivo.

**Pendiente al cierre:**
- Levantar el backend y comprobar `/tendencias`, el índice de búsqueda con las rutas nuevas
  y el editor de punta a punta con sesión: abrir, guardar borrador, subir imagen, enviar
  a revisión, aprobar desde `/admin/revision`, crear y eliminar una sección desde el botón
  flotante.

---

## sesión 18-09-2026 (8.ª parte): fase 3 de `paginas/`, `edicion/`

Tercera fase del reordenamiento por etapa (`8-ciclo-editorial.md` §3.2).

**`edicion/`** reúne el editor y todo lo que usa. Se movieron 10 archivos:
- de `components/`: `puck-editor-wrapper`, `editorjs-wrapper`, `image-uploader-field`,
  `archivo-uploader-field`, `aviso-rechazo` y `aviso-editor-ocupado`;
- de `hooks/`: `use-pagina` y `use-bloqueo-de-edicion`;
- de `lib/`: `page-seeds` y `pagina-en-edicion`. `lib/` quedó vacía y se borró.

Además, un servicio nuevo, `edicion.service.ts`, con `obtenerPaginaEditable`,
`guardarBorrador`, `registrarSubidaPendiente`, `enviarARevision` y el candado
(`EstadoDelBloqueo`, `adquirirBloqueo`, `liberarBloqueo`). Esas funciones se cortaron de
`services/paginas.service.ts` con un script que copia el texto exacto, sin reescribirlo a
mano; el servicio viejo pasó de 306 a 204 líneas.

**Tres piezas subieron a `model/`** porque las usan dos etapas y la regla 2 del plan
prohíbe que una etapa importe de otra:

| Pieza | La usan | Antes |
|---|---|---|
| `api-con-sesion.ts` (axios `withCredentials`) | `edicion/` y `services/` | constante privada del servicio |
| `eventos.ts` (`notificarRevisionActualizada`) | `edicion/` (enviar), `services/` y `hooks/use-revision-queue` (aprobar, rechazar, descartar) | exportada por el servicio |
| `home-fallback-data.ts` | `publicacion/` (portada de respaldo) y `edicion/page-seeds` (semilla) | `publicacion/` |

La última resuelve el choque que el propio árbol del plan tenía y que se anotó en la 7.ª
parte.

**Los cuatro componentes sin uso** siguen en `components/`, sin mover ni borrar: el
usuario no ha decidido todavía. `edit-button` y `plantilla-edit-button` habrían ido a
`edicion/`, pero no tiene sentido mudar código que no se ejecuta.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `features/paginas/edicion/` (nueva) | `edicion.service.ts` + 10 archivos movidos |
| Frontend | `features/paginas/model/` | `+ api-con-sesion.ts`, `+ eventos.ts`, `+ home-fallback-data.ts` (desde `publicacion/`) |
| Frontend | `features/paginas/services/paginas.service.ts` | Sin lo de edición; usa `model/` |
| Frontend | `features/paginas/hooks/use-revision-queue.ts`, `publicacion/publicacion.service.ts` | Imports a `model/` |
| Frontend | `features/paginas/index.ts` | Grupo `edicion/`; mismas exportaciones |
| Frontend | `config/puck.config.tsx` | Los tres campos del editor desde `features/paginas/edicion/` |
| Backend | `scripts/sembrar-inicio-sitio.ts` | Comentario con la ruta nueva |
| Docs | `1-guia-del-proyecto.md`, `8-ciclo-editorial.md` | Árbol, fases, choque resuelto y por qué `puck.config` no puede usar el `index.ts` |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| Reglas de dependencia (búsqueda de imports) | `edicion` → `publicacion`: 0; `publicacion` → `edicion`: 0; `model` → cualquier otra carpeta: 0; `publicacion` → `api-con-sesion`: 0 |
| `eslint` sobre `features/paginas`, `app/admin/editor` y `puck.config.tsx` | 1 error y 6 avisos, **todos anteriores** (comprobados contra `HEAD`: `any` en `puck-editor-wrapper`, y variables o imports sin usar en `editor/[slug]/page.tsx`, `puck.config.tsx`, el FAB, `revision-queue-view` y `use-permiso-de-seccion`) |
| `npx next build` de producción | exit 0; compila todas las rutas, `/admin/editor/[slug]` y `/admin/preview/[slug]` incluidas. Es lo que cubre el editor, que con `curl` no se puede abrir sin sesión. `next-env.d.ts` restaurado después |
| `curl` `/inicio`, `/clasificacion/cno` | 200 |
| `curl /tendencias` | **404, porque el backend no responde** (`:4000/health` → sin conexión). Sin backend, `obtenerPagina` devuelve `null` y el comodín da 404; `/inicio` y `/clasificacion/cno` siguen en 200 por su respaldo y su caché. No viene de esta fase |

> **`next build` y `next dev` pueden convivir en Next 16.** El servidor de desarrollo
> escribe en `.next/dev/` y el build en `.next/`, así que compilar para producción no tumba
> el dev server. Solo reescribe `next-env.d.ts`; hay que restaurarlo.

**Pendiente al cierre:**
- Levantar el backend y comprobar `/tendencias` (200) y el índice de búsqueda con las rutas
  nuevas (`/clasificacion/cno`, `/clasificacion/cuoc`, `/inicio/politica-de-privacidad`).
- Probar el editor con sesión: abrir, guardar borrador, subir una imagen y enviar a
  revisión. El build garantiza que compila, no que funcione de punta a punta.
- Fase 4 (`revision/` y `secciones/`).
- Decidir si se borran los cuatro componentes sin uso.

---

## sesión 18-09-2026 (7.ª parte): fase 2 de `paginas/`, `model/` y `publicacion/`

Segunda fase del reordenamiento de `features/paginas` por etapa del ciclo editorial
(`8-ciclo-editorial.md` §3.2).

**`model/`**, el vocabulario que comparten las etapas:
- `pagina.types.ts`, antes `types.ts`.
- `rutas.ts`, antes `lib/ruta-de-vuelta.ts`. El nombre viejo ya no alcanzaba: además de la
  ruta de vuelta del editor, guarda `RUTAS_PROPIAS` y la traducción slug ↔ URL.
- `ambito.ts` (nuevo), con la cabecera `X-Ambito: sitio`, que antes era una constante
  privada del servicio y ahora la usan los dos servicios.

No se creó el `estado.ts` que proponía el plan: todavía no hay transiciones que modelar
en el cliente.

**`publicacion/`**, lo que ve quien visita. Tiene un servicio nuevo,
`publicacion.service.ts`, con las cinco lecturas públicas que estaban mezcladas en
`services/paginas.service.ts`: `obtenerPagina`, `obtenerPaginaPublicadaCacheada`,
`obtenerPaginaInicio`, `registrarVisita` y `obtenerIndiceBusqueda`. Se sumaron
`client-puck-render`, `pagina-puck-fija` y `rastreador-visitas` (antes en `components/`) y
`home-fallback-data`, `sitio-busqueda-fallback` y `etiquetas-cache` (antes en `lib/`).
`services/paginas.service.ts` pasó de 408 a 306 líneas y quedó **solo** con llamadas que
van con sesión.

**Un cambio de comportamiento, deliberado.** `obtenerPagina` y `obtenerIndiceBusqueda` iban
por el axios con `withCredentials: true`. En `publicacion/` van por un axios **sin**
credenciales, como pide la regla 3 del plan («publicación nunca usa el cliente
autenticado»). Antes se comprobó que no rompe nada:
- `/api/paginas/publica/:slug` y `/api/paginas/indice-busqueda` están declaradas antes del
  `requireAuth` de `pagina.routes.ts`.
- `curl` sin cookies y con `Origin: http://localhost:3000` → 200 con
  `Access-Control-Allow-Origin` correcto.

**De paso,** `app/admin/editor/[slug]/editor-client.tsx` importaba seis cosas del módulo
por rutas internas (`@/features/paginas/components/…`, `/hooks/…`, `/lib/…`, `/types`),
contra la regla §0.3. Dos de esas rutas dejaban de existir; ahora las seis entran por el
`index.ts`, y la fase 3 ya no tendrá que tocar este archivo. `index.ts` se reescribió
agrupado por carpeta, **con las mismas exportaciones** (no se quitó ninguna, tampoco las
de los cuatro componentes sin uso).

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `features/paginas/model/` (nueva) | `pagina.types.ts`, `rutas.ts`, `ambito.ts` |
| Frontend | `features/paginas/publicacion/` (nueva) | `publicacion.service.ts` + 6 archivos movidos |
| Frontend | `features/paginas/services/paginas.service.ts` | Sin las lecturas públicas; usa `model/` |
| Frontend | `features/paginas/index.ts` | Reescrito por carpeta, mismas exportaciones |
| Frontend | `components/*`, `hooks/*`, `lib/page-seeds.ts`, `menu-y-pie/menu-y-pie.ts` | Imports a `model/` y `publicacion/` |
| Frontend | `app/admin/editor/[slug]/editor-client.tsx` | Todo por el `index.ts` |
| Frontend | `app/(public)/…` (política, CNO, CUOC) | Comentarios con la ruta nueva de `rutas.ts` |
| Backend | `shared/extraer-textos-puck.ts`, `scripts/sembrar-inicio-sitio.ts` | Comentarios con las rutas nuevas |
| Docs | `1-guia-del-proyecto.md`, `8-ciclo-editorial.md` | Árbol, fases y el conflicto de dependencias de la fase 3 |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` (tras `next typegen`; `next-env.d.ts` restaurado) | exit 0 |
| `eslint` sobre `model/`, `publicacion/`, `services/`, `menu-y-pie/`, `lib/`, `hooks/`, `index.ts`, `editor-client.tsx` y `app/(public)` | 0 errores; 1 aviso anterior (`ROLES_QUE_EDITAN` sin usar en el FAB) |
| `curl` `/inicio`, `/tendencias`, `/clasificacion/cno`, `/inicio/politica-de-privacidad` | 200 con menú y pie |
| `curl` `/menu-y-pie`, `/no-existe-xyz` | 404 |
| `curl /admin/editor/tendencias` sin sesión | 307 → `/admin/login?redirect=…` |
| `curl /api/paginas/indice-busqueda` (proxy del sitio) | 200, siete páginas |

> **El backend de desarrollo no recarga solo.** `npm run dev` es `ts-node src/server.ts`,
> sin modo vigilancia: los cambios de la API de la 2.ª y la 3.ª parte (`resolverHref` y el
> análisis de borrado) no están activos hasta reiniciarlo. Se notó porque el índice de
> búsqueda seguía devolviendo `/cno`, `/cuoc` y `/politica-de-privacidad` con
> `X-Cache: BYPASS`, así que no era la caché de Redis. Los redirects cubren esos enlaces
> mientras tanto.

**Pendiente al cierre:**
- Reiniciar el backend de desarrollo y comprobar que el índice de búsqueda devuelve
  `/clasificacion/cno`, `/clasificacion/cuoc` e `/inicio/politica-de-privacidad`.
- Fases 3 (`edicion/`) y 4 (`revision/` y `secciones/`), con el conflicto de
  dependencias de `page-seeds` anotado en `8-ciclo-editorial.md`.
- Decidir si se borran los cuatro componentes sin uso.

---

## sesión 18-09-2026 (6.ª parte): `paginas/menu-y-pie/` y fin de `identidad-visual`

El usuario aprobó reorganizar `features/paginas` **por etapa del ciclo editorial**, como
ya proponía `8-ciclo-editorial.md` §3.2 y nunca se aplicó, más dos carpetas que ese plan
no tenía: `secciones/` y `menu-y-pie/`. Pidió que la carpeta de la cabecera y el pie se
llamara `menu-y-pie` (en la propuesta figuraba como `plantilla/`). Se aplica en cuatro
fases, cada una con su commit. Esta es la **fase 1**.

**Qué se hizo.** Se creó `features/paginas/menu-y-pie/` con tres archivos:

- `menu-y-pie.ts`, antes `lib/plantilla.ts` (`obtenerPlantilla`, `SLUG_PLANTILLA` y los tipos).
- `menu-y-pie-fallback-data.ts`, antes `lib/plantilla-fallback-data.ts`.
- `cabecera-por-defecto.ts`, que une los tipos y los valores de la antigua
  `identidad-visual`.

`features/sitio-web/identidad-visual/` se borró entera, **incluido su servicio**, el que
pedía la ruta inexistente `GET /api/identidad-visual` (404) cada vez que el servidor
armaba una página. Ahora `obtenerPlantilla` parte de la constante `CABECERA_POR_DEFECTO`
y no hace esa petición. El papel de `identidad-visual/client.ts` (dar los valores por
defecto a `puck.config.tsx` sin cargar axios en el navegador) lo toma
`features/paginas/client.ts`.

**Nombres que no cambiaron, a propósito.** `obtenerPlantilla`, `SLUG_PLANTILLA`,
`Plantilla`, `PropsCabecera` y `PropsPie` siguen igual: la API y la intranet comparten el
concepto «plantilla» y en la 4.ª parte se decidió no renombrarlo. Cambiaron la carpeta,
los nombres de archivo y los de la antigua `identidad-visual`, que no usaba nadie más:
`defaultIdentidadVisual` → `CABECERA_POR_DEFECTO`, `IdentidadVisual` → `CabeceraPorDefecto`
y `plantillaFallbackData` → `menuYPieFallbackData`. De paso, `editor-client.tsx` importa el
tipo `Plantilla` por el `index.ts` del módulo y no por su ruta interna.

**Hallazgo: cuatro componentes sin uso.** `edit-button`, `plantilla-edit-button`,
`nueva-seccion-button` y `eliminar-seccion-button` solo se nombran en su propio archivo y
en `index.ts`. Los reemplazó el botón flotante (`paginas-fab-speed-dial` +
`modal-nueva-seccion` + `modal-eliminar-seccion`) en `40d4508` (09-09-2026).
**No se borraron**: queda a decisión del usuario. `plantilla-edit-button` tampoco se movió
a `menu-y-pie/`, porque no tiene sentido mudar código muerto.

> **Corrección a la 2.ª parte.** La tabla de «lo que se rompía» listaba
> `eliminar-seccion-button.tsx` como el botón de eliminar. Ese componente es uno de los
> cuatro sin uso: el borrado real pasa por el botón flotante, que sí se corrigió en esa
> misma parte. No hubo daño, pero ese renglón describía código que no se ejecuta.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `features/paginas/menu-y-pie/` (nueva) | `menu-y-pie.ts`, `menu-y-pie-fallback-data.ts`, `cabecera-por-defecto.ts` |
| Frontend | `features/paginas/client.ts` (nuevo) | Segunda puerta sin axios: `CABECERA_POR_DEFECTO` |
| Frontend | `features/sitio-web/identidad-visual/` | Borrada (servicio al 404 incluido) |
| Frontend | `features/paginas/index.ts`, `lib/page-seeds.ts`, `components/paginas-fab-speed-dial.tsx`, `components/plantilla-edit-button.tsx` | Imports a `menu-y-pie/` |
| Frontend | `config/puck.config.tsx`, `app/admin/editor/[slug]/editor-client.tsx`, `app/(public)/layout.tsx` | Imports y comentarios |
| Backend | `scripts/sembrar-plantilla-sitio.ts` | Comentarios con el nombre y la ruta nuevos |
| Docs | `1-guia-del-proyecto.md` | Árbol de `paginas/` y de `sitio-web/` (vuelve a cuatro hijas), párrafo del reordenamiento por fases, fila RF-03 |
| Docs | `8-ciclo-editorial.md` §3.2 | Estructura objetivo con `secciones/` y `menu-y-pie/`, y el plan de cuatro fases |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| `eslint` sobre los archivos nuevos o tocados | 0 errores; 2 avisos anteriores (`useState` y `createPortal` sin usar en `puck.config.tsx`, ya estaban en `HEAD`) |
| `curl` `/inicio`, `/tendencias`, `/clasificacion/cno`, `/inicio/politica-de-privacidad` | 200, con menú («Clasificaciones»), enlace a la intranet y pie |
| `curl /menu-y-pie` | 404 |

**Pendiente al cierre:**
- Fases 2 a 4 del reordenamiento.
- Decidir si se borran los cuatro componentes sin uso.
- El menú por defecto sigue copiado en tres sitios: `cabecera-por-defecto.ts`, el
  respaldo interno de `shared/lib/blocks/header.tsx` y la siembra del backend.
  `header.tsx` no puede importar de `features/` (la dependencia va de `features` a
  `shared`, no al revés), así que unificarlo pide mover la constante a `shared/`.

---

## sesión 18-09-2026 (5.ª parte): `identidad-visual` pasa a `features/sitio-web/`

`features/identidad-visual/` estaba en la raíz de `features/`, al mismo nivel que
`paginas/`, y la guía la describía como «tipografías, colores, marca (RF-03)». Revisada,
**no contiene nada de eso**: son los valores por defecto de la cabecera del sitio público
(franja gov.co, texto y URL de la intranet, enlaces del menú). Los usan dos sitios:
`paginas/lib/plantilla.ts`, como base sobre la que se aplica el bloque `Header` guardado
en «Menú y pie», y `config/puck.config.tsx`, como `defaultProps` del bloque. La intranet
tiene su propia cabecera. A pedido del usuario se movió a
`features/sitio-web/identidad-visual/`, el agrupador de lo público.

**Hallazgo, sin tocar:** el servicio pide `GET /api/identidad-visual` y **esa ruta no
existe en la API**: devuelve 404 en local y no aparece en `api-backend/src/routes`. El
`catch` cae siempre al valor por defecto, así que el sitio funciona, pero
`obtenerPlantilla()` hace esa petición inútil cada vez que el servidor arma una página
pública. Tampoco existe la tabla de RF-03: `marca_versiones` se eliminó en la migración
020 sin haberse usado. Se le propuso al usuario que el servicio devuelva el valor por
defecto sin llamar a la API; queda pendiente de su decisión.

**Guía al día.** El árbol decía que `features/sitio-web/` tenía «solo dos hijas»; tiene
**cinco**: `inicio/`, `buscador-ocupaciones/`, `programas-sobresalientes/` y
`tendencia-ocupacional/` (estas dos sin documentar hasta hoy), más `identidad-visual/`.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `features/identidad-visual/` → `features/sitio-web/identidad-visual/` | Movida sin cambios de contenido, salvo la ruta que cita su `index.ts` |
| Frontend | `config/puck.config.tsx`, `features/paginas/lib/plantilla.ts` | Import a la ruta nueva |
| Backend | `scripts/sembrar-plantilla-sitio.ts` | Comentario con la ruta nueva |
| Docs | `1-guia-del-proyecto.md` | Árbol de `features/` (cinco hijas de `sitio-web/`), párrafo de los dos niveles y fila RF-03 del mapa |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| `eslint` sobre `identidad-visual/` y `plantilla.ts` | limpio |
| `curl` `/inicio`, `/tendencias`, `/clasificacion/cno` | 200, con el menú «Clasificaciones» en la cabecera |
| `curl` `:4000/api/identidad-visual` | 404 (el hallazgo de arriba) |

> **`npx next typegen` reescribe `sitio-web/next-env.d.ts`** (sus imports pasan de
> `.next/dev/types/…` a `.next/types/…`). Es un archivo versionado que Next alterna solo
> entre `dev` y `build`; se restauró con `git restore` para no ensuciar el commit.

---

## sesión 18-09-2026 (4.ª parte): el corte de `/menu-y-pie` pasa de carpeta al comodín

`menu-y-pie` es una fila real de `paginas` que guarda la cabecera y el pie de todo el
sitio. Si alguien visitara `/menu-y-pie`, el comodín `[slug]` la encontraría en la base y la
mostraría como una página, con cabecera y pie duplicados. Hasta ahora lo impedía una carpeta
`app/(public)/menu-y-pie/` cuyo `page.tsx` solo llamaba a `notFound()`: una ruta fija le
gana al comodín.

Se quitó la carpeta y el corte pasó a la primera línea de `(public)/[slug]/page.tsx`
(`if (slug === SLUG_PLANTILLA) notFound()`), antes de consultar la API. El efecto es el
mismo, pero la regla queda junto al código que causa el problema, `app/(public)/` solo
tiene carpetas que son páginas, y el sitio queda igual que el comodín de la intranet, que
ya lo hacía así. `/admin/preview/menu-y-pie` no cambia: vive fuera de `(public)`.

**Se descartó en esta misma parte** renombrar `menu-y-pie`. Se relevó el alcance: el slug
vive en la base en los dos ámbitos, en las claves de permiso `editar.{ambito}.menu-y-pie`,
en `SLUG_PLANTILLA` de la API y de los dos frontends, y en `@olo/slug-policy`; además el
código llama «plantilla» al mismo concepto (`obtenerPlantilla`, `PlantillaEditButton`,
`plantilla.ts`…). En total, 118 apariciones en 41 archivos, más una migración como la 014
(`UPDATE permisos SET clave`, nunca borrar e insertar). El usuario decidió omitirlo.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `app/(public)/[slug]/page.tsx` | `notFound()` para `SLUG_PLANTILLA` antes de pedir la página |
| Frontend | `app/(public)/menu-y-pie/page.tsx` | Borrado |
| Docs | `1-guia-del-proyecto.md` | Árbol de `(public)/` y párrafo de las rutas que no sirven nada |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0. El primer intento falló en `.next/types/validator.ts`: son tipos generados que aún referenciaban la carpeta borrada. Se regeneraron con `npx next typegen` (`.next/` está en `.gitignore`) |
| `eslint` sobre `[slug]/page.tsx` | limpio |
| `curl /menu-y-pie` | 404. Sin el corte habría dado 200, porque la fila existe y está publicada |
| `curl /tendencias`, `/clasificacion/cno`, `/inicio` | 200 |

> Después de borrar o mover una carpeta de `app/`, `tsc` puede fallar en
> `.next/types/validator.ts` por una ruta que ya no existe, aunque el servidor de
> desarrollo esté corriendo: Next no regenera esos tipos al instante. No es un error del
> código; `npx next typegen` los regenera.

---

## sesión 18-09-2026 (3.ª parte): CNO y CUOC pasan a `/clasificacion/cno` y `/clasificacion/cuoc`

Segundo paso del reordenamiento de rutas del `sitio-web`. `cno` y `cuoc` eran páginas de
Puck sin carpeta (las servía el comodín `[slug]` en `/cno` y `/cuoc`); ahora viven junto al
buscador de ocupaciones, bajo `/clasificacion/`. Se aplicó el mecanismo `RUTAS_PROPIAS` de
la 2.ª parte: los slugs no cambian y la base de datos no se toca.

**Se descartó `/clasificacion?tipo=cno`.** El usuario lo planteó como alternativa. En el
buscador, `?tipo=` solo cambia dos rótulos (el tercer nivel de la ruta de navegación y el
título de la ventana de resultados); la búsqueda es idéntica. Usarlo habría dejado
huérfanas las páginas de Puck `cno` y `cuoc` —texto y pestañas laterales, que es lo que
enlaza el menú publicado—, y el botón de editar habría apuntado a `clasificacion`, que no
es una página de la base. También se descartaron un comodín `clasificacion/[slug]` (hay
que blindarlo para que `/clasificacion/tendencias` no sirva cualquier página) y renombrar
los slugs a `clasificacion-cno` con comodín multinivel (exige migración de slugs,
permisos y concesiones; solo compensa si se van a anidar muchas páginas).

**`PaginaPuckFija`.** Con CNO y CUOC habría tres `page.tsx` casi idénticos (política, CNO,
CUOC). Se sacó el cuerpo común a `features/paginas/components/pagina-puck-fija.tsx`:
lee la versión publicada del slug y, si no hay, da 404 a quien visita o la entrada al
editor a quien puede editar. Cada `page.tsx` queda en su `metadata` y una línea.
`puedeEditar` lo pasa la página y no lo resuelve el componente porque `puedeEditarPaginas()`
lee cookies con `next/headers`, y el componente sale por el `index.ts` del módulo, que
también importan componentes de cliente.

**Menús de respaldo.** `header.tsx`, `default-identidad-visual.ts` y la siembra
`sembrar-plantilla-sitio.ts` enlazaban CNO y CUOC como `/clasificacion?tipo=…`. Pasan a
las rutas nuevas, para que el menú de respaldo y el publicado lleven al mismo sitio. La
lógica de `?tipo=` del buscador se conserva por los enlaces ya repartidos.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `app/(public)/clasificacion/cno/page.tsx`, `…/cuoc/page.tsx` (nuevos) | Metadata propia + `PaginaPuckFija` |
| Frontend | `features/paginas/components/pagina-puck-fija.tsx` (nuevo), `index.ts` | Cuerpo común de las páginas Puck con carpeta propia |
| Frontend | `app/(public)/inicio/politica-de-privacidad/page.tsx` | Pasa a usar `PaginaPuckFija` |
| Frontend | `features/paginas/lib/ruta-de-vuelta.ts` | `cno` y `cuoc` en `RUTAS_PROPIAS` |
| Frontend | `next.config.mjs` | Redirects `/cno` y `/cuoc` → `/clasificacion/…` |
| Frontend | `shared/lib/blocks/header.tsx`, `identidad-visual/lib/default-identidad-visual.ts` | Menú de respaldo a las rutas nuevas |
| Frontend | `buscador-ocupaciones/components/buscador-ocupaciones-view.tsx` | Comentario de `?tipo=` al día |
| Backend | `shared/extraer-textos-puck.ts` | `cno` y `cuoc` en `RUTAS_PROPIAS_SITIO` |
| Backend | `scripts/sembrar-plantilla-sitio.ts` | Menú sembrado a las rutas nuevas |
| Docs | `1-guia-del-proyecto.md` | Árbol de `(public)/` según el plan acordado; nueva §4.2.1 (cómo se arma una URL, las tres clases de página, los cuatro pasos para anidar, ruta frente a parámetro) |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` y `api-backend` | exit 0 los dos |
| `eslint` sobre los 8 archivos nuevos o tocados del sitio en esta parte | limpio |
| Script con 10 casos (`rutaPublicaDeSlug`, `slugDeRutaPublica`, `slugDeOrigen`, `resolverHref`) | 10/10 |
| `curl` `/cno`, `/cuoc` | 307 → `/clasificacion/cno`, `/clasificacion/cuoc` |
| `curl` `/clasificacion/cno`, `/clasificacion/cuoc` | 200 con su `<title>` propio y contenido publicado |
| `curl` `/clasificacion` | 200, sigue siendo el buscador |
| `curl` `/inicio/politica-de-privacidad` tras pasar a `PaginaPuckFija` | 200 con su `<title>` y contenido |
| `curl` `/clasificacion/tendencias` | 404: la carpeta no abre la puerta a otras páginas |

**Pendiente al cierre:**
- El menú **publicado** en la base enlaza `/cno` y `/cuoc`. Los redirects lo cubren;
  conviene corregirlo desde el editor de «Menú y pie» para quitar el salto.
- Nada de esto está en un commit (el usuario commitea; ver la lista entregada en la
  sesión).

---

## sesión 18-09-2026 (2.ª parte): la política de privacidad pasa a `/inicio/politica-de-privacidad`

Primer paso de una sesión dedicada a ordenar carpetas y rutas del `sitio-web`. Se movió
`app/(public)/politica-de-privacidad/` a `app/(public)/inicio/politica-de-privacidad/`,
así que la URL pasa a ser `/inicio/politica-de-privacidad`.

**Lo que el `git mv` no resolvía solo.** En Next la URL la da la carpeta, pero en este
sitio **el slug de una página se deduce de la URL** en cuatro sitios distintos, y los
cuatro usaban la misma regla (segmentos unidos con guion: `/encuestas/tasa` →
`encuestas-tasa`). Con la ruta nueva calculaban `inicio-politica-de-privacidad`, una
página que no existe:

| Dónde | Qué se rompía |
|---|---|
| `paginas-fab-speed-dial.tsx` (botón flotante) | Comprobaba `editar.sitio.inicio-politica-de-privacidad`: sin botón de editar, o el editor abría una página vacía |
| `eliminar-seccion-button.tsx` | Analizaba el borrado de un slug inexistente |
| `rastreador-visitas.tsx` | Las visitas de la política dejaban de sumarse a su fila |
| `slugDeOrigen` (editor de menú y pie) | Daba `inicio/politica-de-privacidad`, con barra, y no cargaba la página de fondo |

Además, la URL vieja **no daba 404**: la atrapaba el comodín `[slug]`, que busca por
slug y el slug no cambió, así que servía la misma página por segunda vez y sin su
metadata.

**Decisión: el slug no cambia, la URL sí.** El slug es la llave del contenido en
`paginas`, del permiso `editar.sitio.{slug}`, de las visitas y de la etiqueta de caché.
Renombrarlo a `inicio-politica-de-privacidad` para que encajara con la regla habría
exigido una migración de datos (página, permiso, concesiones), y además **no alcanzaba**:
el camino inverso (slug → URL) seguiría siendo ambiguo, porque el guion también existe
dentro de los slugs. Se descartó.

En su lugar hay una tabla `RUTAS_PROPIAS` (slug → URL) en
`features/paginas/lib/ruta-de-vuelta.ts`, con su inversa `slugDeRutaPublica()`. Los cuatro
cálculos sueltos se reemplazaron por esa función. **Mover otra página a una subcarpeta es
añadir una línea a esa tabla**, más su copia en la API (ver aviso abajo) y su redirect.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `app/(public)/inicio/politica-de-privacidad/page.tsx` | Movido (por el usuario). El enlace al editor y el aviso de «sin contenido» usan la ruta nueva |
| Frontend | `features/paginas/lib/ruta-de-vuelta.ts` | `RUTAS_PROPIAS`, `rutaPublicaDeSlug` la consulta, nueva `slugDeRutaPublica`; `slugDeOrigen` la usa |
| Frontend | `paginas-fab-speed-dial.tsx`, `eliminar-seccion-button.tsx`, `rastreador-visitas.tsx` | Su cálculo propio de slug → `slugDeRutaPublica` |
| Frontend | `puck-editor-wrapper.tsx` | La cabecera del editor muestra la URL real, no `/{slug}` |
| Frontend | `next.config.mjs` | Redirect `/politica-de-privacidad` → `/inicio/politica-de-privacidad`; `/privacidad` va directo a la nueva, sin doble salto |
| Frontend | `login-view.tsx` (sitio e intranet), `footer.tsx`, `sitio-busqueda-fallback.ts` | Enlaces a la ruta nueva |
| Backend | `shared/extraer-textos-puck.ts` | `resolverHref` (enlaces del buscador) conoce la ruta nueva |
| Backend | `use-cases/paginas/eliminar-seccion.usecase.ts` | Al comprobar si algo enlaza a la página que se quiere borrar, busca `/{slug}` **y** su ruta real. Antes solo `/{slug}`, así que no habría visto los enlaces nuevos del pie |
| Backend | `scripts/sembrar-plantilla-sitio.ts` | Enlaces del pie sembrado a la ruta nueva |
| Docs | `1-guia-del-proyecto.md` | Árbol de `(public)/` y párrafo de alias |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web`, `api-backend` e `intranet` | exit 0 los tres |
| `eslint` sobre los 11 archivos tocados del sitio | 1 error y 7 avisos, **todos anteriores** a este cambio (comprobado contra `HEAD`: `any` en `puck-editor-wrapper.tsx:514`, `ROLES_QUE_EDITAN` sin uso, `<img>` en `footer.tsx`) |
| Script con 13 casos sobre `rutaPublicaDeSlug`, `slugDeRutaPublica`, `slugDeOrigen` y `resolverHref` | 13/13 |
| `curl` al dev server: `/politica-de-privacidad` y `/privacidad` | 307 → `/inicio/politica-de-privacidad` |
| `curl` a `/inicio/politica-de-privacidad` | 200, `<title>` propio, contenido real de la política, 2 enlaces del pie a la ruta nueva y 0 a la vieja |

> **La tabla `RUTAS_PROPIAS` está en dos repositorios:** en `sitio-web` (`ruta-de-vuelta.ts`)
> y en la API (`RUTAS_PROPIAS_SITIO` en `extraer-textos-puck.ts`), porque los enlaces del
> buscador se arman en la API. Si se actualiza solo una, el buscador enlaza la URL vieja.
> El redirect lo tapa (funciona, con un salto de más), así que el síntoma no se ve: hay
> que acordarse.

**Pendiente al cierre:**
- El pie **ya publicado en la base** puede seguir enlazando `/politica-de-privacidad`. El
  redirect lo cubre; se corrige editando «Menú y pie» cuando se quiera.
- `intranet-footer.tsx` enlaza `/politica-de-privacidad` como ruta **relativa**, o sea a
  la intranet, donde esa página no existe. El error ya estaba antes de este cambio (el
  login de la intranet ya lo había corregido con `SITE_URL`); no se tocó.
- El árbol de `(public)/` en la guía todavía lista `publicaciones/`, que no existe, y no
  lista `programas-sobresalientes/`. Se dejó así por decisión del usuario.

### Borrado de `sitio-web/src/features/contenidos/`

Un módulo de 5 archivos (vista «Publicaciones», hook, servicio contra
`GET /api/contenidos/publica` y tipo `Contenido`) creado el 22-07-2026 (`ac6157b`) y
nunca conectado: **ninguna ruta ni componente lo importaba**. Antes de borrarlo se
comprobó que ningún archivo de `sitio-web`, `intranet`, `packages` ni `api-backend` lo
importaba, y que `tsc --noEmit` pasaba sin la carpeta. Lo borró el usuario; se limpiaron
las referencias que quedaban:

| Archivo | Cambio |
|---|---|
| `1-guia-del-proyecto.md` | Sale del árbol de `features/` y de las filas RF-01 y RF-10 del mapa RF → código (RF-10 queda sin frontend) |
| `11-base-de-datos.md` | El ejemplo de «frontend que no se entera» ya no cita su `types.ts` |
| `api-backend/.../models/contenido.ts` | El comentario sobre el contrato en inglés cita la API, no el archivo borrado |

`GET /api/contenidos/publica` **se queda**: hoy no lo consume ningún frontend, pero es
parte de la API documentada y es lo que usaría el bloque «Publicaciones» el día que lea de
la tabla `contenidos` en vez de su lista a mano. Si se necesita el módulo, se recupera
desde `ac6157b`.

Verificado: `tsc --noEmit` en `sitio-web` con la carpeta ya borrada → exit 0.

---

## sesión 18-09-2026: donut de «Usuarios» roto por un merge (`opcion is not defined`)

Al hacer `git pull` de `dev` (entraron los PR #108 y #109), el dashboard de `sitio-web`
reventó en runtime con `ReferenceError: opcion is not defined` en
`auth/components/tarjeta-usuarios.tsx`.

**Causa.** Dos cambios paralelos sobre el mismo bloque del mismo archivo:
- `9cf385e` (ingdave, 17-09) reemplazó el donut hecho con `conic-gradient` por un pie de
  ECharts: borró `gradientStops` y agregó el objeto `opcion` que recibe `<GraficoEcharts>`.
- `76916a9` (Samuel, 17-09, en la rama `samuel`, que aún tenía la versión vieja) ajustó ese
  mismo `gradientStops` para que el `conic-gradient` fuera compatible (porcentajes en vez
  de grados, sin paradas de color de doble posición).

En el merge `930eb35` («Merge branch 'dev' into samuel»), el conflicto se resolvió
quedándose con el `gradientStops` de `samuel` arriba y el JSX de `dev` abajo: se perdió la
definición de `opcion`, pero se mantuvo el `<GraficoEcharts option={opcion} />` que la
usa. Así entró a `dev` con el PR #108.

**Arreglo.** Se restauró el archivo a la versión de `9cf385e`
(`git restore --source=9cf385e`). Se comparó antes con la versión rota: la única diferencia
era ese bloque, y el ajuste de Samuel solo tenía sentido para el `conic-gradient`, que ya
no existe. No se pierde nada de su trabajo.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `sitio-web/src/features/administracion/auth/components/tarjeta-usuarios.tsx` | Vuelve la definición de `opcion` (pie de ECharts); sale el `gradientStops` sin uso |

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | exit 0 |
| `tsc --noEmit` en `intranet` | exit 0 |
| `eslint` sobre `tarjeta-usuarios.tsx` | exit 0 |

> **Al resolver un conflicto, no mezclar la mitad de cada lado.** Este archivo quedó con el
> cálculo de una versión y el dibujo de la otra. Git lo aceptó porque ya no quedaban
> marcas `<<<<<<<`, pero el código no funcionaba. Correr `tsc --noEmit` antes de cerrar el
> merge lo habría detectado (`Cannot find name 'opcion'`).

**Pendiente al cierre:** no se ha hecho push. En `dev` quedan el merge del pull
(`d58727d`) y este arreglo sin commitear. No se revisó `api-backend` con `tsc`: el mismo
pull trajo cambios de permisos y de secciones.

---

## sesión 17-09-2026 (4.ª parte): buscador, sidebar «Accesos», gráficos con ECharts y carga de Excel sin Handsontable

Cuatro cambios de UI en el panel administrativo, pedidos en la misma sesión:

**Buscador del panel** (`buscador/components/buscador-modal.tsx`). El botón de cerrar
usaba `XMarkIcon` de Heroicons; se cambió por el SVG de flecha que trajo el usuario. Al
abrir el buscador, la flecha entra deslizándose de izquierda a derecha
(`transition-transform`, arranca en `-translate-x-2` y se suelta a `translate-x-0` en el
siguiente frame tras montar). No lleva efecto de hover: se pidió quitarlo dos veces —
primero el desplazamiento al pasar el mouse, después el fondo/color de hover del botón—,
así que el único movimiento es el de entrada.

**Sidebar** (`auth/components/panel-general.tsx`). El grupo que agrupa `/admin/users` y
`/admin/roles` pasó de llamarse «Usuarios» a **«Accesos»**; sigue conteniendo los mismos
dos ítems («Usuarios» y «Roles y Permisos»).

**Gráficos del dashboard y del modal de visitas.** Se agregó `echarts` (`^6.1.0`) como
dependencia de `sitio-web` y un envoltorio propio en
`shared/ui/molecules/grafico-echarts.tsx`: crea/destruye la instancia sobre un `<div>`,
la redimensiona con `ResizeObserver` (no con la ventana, porque vive dentro de tarjetas y
modales que cambian de tamaño solos) y expone `useEsOscuro()` —mismo mecanismo que
`ThemeToggle`, un `MutationObserver` sobre la clase `dark` de `<html>`— porque los colores
de ECharts no son CSS y no heredan el tema solos. Se usó en tres sitios:
- El donut de «Usuarios» del dashboard (antes `conic-gradient` a mano + leyenda hecha con
  `<div>`s) → pie/donut de ECharts con tooltip y leyenda nativa.
- La tarjeta «Visitas» del dashboard (antes barras CSS por página) → línea suavizada con
  área degradada (verde Sitio / azul Intranet). No hay serie temporal real detrás —sigue
  siendo «visitas por página»— solo cambió la forma de dibujarlo, a pedido explícito
  aunque no hubiera dato de tiempo que lo justificara del todo.
- El modal de diagrama de visitas (antes barras de progreso CSS) → barras horizontales de
  ECharts con degradado y tooltip (slug + % del total). De paso se quitó la tarjeta KPI
  «Más Concurrida», el badge «N páginas» de cada gráfico, el botón ❌ de cerrar del header
  (queda «Cerrar ventana», clic fuera del panel y Escape) y el texto del header se
  reemplazó por «Flujo de visitas a las páginas públicas del portal y de intranet.».

**Se descartó** usar ECharts para el mapa de Colombia por departamento
(`sitio-web/programas-sobresalientes/components/mapa-departamentos.tsx`): cada
departamento es un `<path>` con `role="button"`, `tabIndex` y navegación por teclado real
(§9 accesibilidad), y ECharts pinta todo en canvas sin dar eso gratis — habría que
reconstruir la accesibilidad a mano igual, y de paso convertir los 33 `path` ya calculados
a GeoJSON. Queda como está; se revisita solo si el dato pasa de binario (tiene/no tiene
datos) a un conteo continuo por departamento.

**Panel de carga de Excel** (`actualizaciones/components/*`). El historial de cargas
usaba `handsontable` —una grilla de hoja de cálculo completa para 4 columnas de solo
lectura—: sin modo oscuro, y su scroll interno recortaba la columna de borrar en tarjetas
angostas. Se reemplazó por una tabla nativa con el mismo estilo que Auditoría/Actividad
Reciente (píldoras de estado con color y etiqueta, según §9 el color nunca es el único
indicador) y un botón de borrar con `TrashIcon` de Heroicons en vez del `✕` de texto que
traía el renderer de Handsontable. Se le agregó **modo oscuro a toda la sección
«Actualizaciones»**, que no tenía ninguna clase `dark:` en ningún archivo (quedaba una
caja blanca deslavada con el resto del panel en oscuro). El botón de subir ganó un ícono
(`ArrowUpTrayIcon`) y el texto suelto «Formato admitido: .xlsx» pasó a una píldora azul de
mensaje de estado (con `flex w-fit`, no `inline-flex`, para que quede en su propia línea
debajo del botón y no compita por espacio con él).

> **`handsontable` queda instalado sin que nada lo importe** — vuelve al mismo estado en
> que estaba antes de que esta función lo empezara a usar. No se desinstaló por si se
> tenía reservado para otra cosa; pendiente decidir.

| Capa | Archivo | Cambio |
|---|---|---|
| Frontend | `buscador/components/buscador-modal.tsx` | Ícono de cerrar (SVG flecha) + animación de entrada, sin hover |
| Frontend | `auth/components/panel-general.tsx` | Grupo del sidebar «Usuarios» → «Accesos» |
| Frontend | `shared/ui/molecules/grafico-echarts.tsx` (nuevo) | Envoltorio de ECharts + `useEsOscuro()` |
| Frontend | `auth/components/tarjeta-usuarios.tsx` | Donut CSS → pie de ECharts |
| Frontend | `auth/components/tarjeta-visitas.tsx` | Barras CSS → línea de ECharts |
| Frontend | `auth/components/modal-diagrama-visitas.tsx` | Barras CSS → barras de ECharts; KPI y botones quitados |
| Frontend | `actualizaciones/components/historial-cargas-grid.tsx` | Handsontable → tabla nativa + `TrashIcon` |
| Frontend | `actualizaciones/components/carga-programa-sobresalientes.tsx` | Modo oscuro, ícono de subida, píldora de estado |
| Frontend | `actualizaciones/components/actualizaciones-view.tsx` | Modo oscuro |
| Dependencias | `sitio-web/package.json` | `+ echarts ^6.1.0` |

**Verificado:** `tsc --noEmit` limpio y `eslint` limpio sobre cada archivo tocado (varias
veces, después de cada tanda de cambios); `npm run build` de producción con exit code 0,
dos veces (antes y después de quitar `handsontable` de `historial-cargas-grid.tsx`), sin
errores de bundling con las importaciones ESM de `echarts/core`.

**No verificado en pantalla:** ninguno de estos cambios se abrió en un navegador durante
la sesión —ni el buscador, ni los gráficos, ni el panel de carga—; toda la verificación
fue tipos + lint + build. Falta la pasada visual (claro/oscuro, hover, responsive) antes
de darlo por cerrado del todo.

**Pendiente al cierre:**
- Verificación visual en navegador de los cinco puntos de esta entrada.
- Decidir si se desinstala `handsontable` (sin uso de nuevo) o se deja para otra función.
- Los commits de este bloque quedaron sin subir a pedido del usuario («yo copio los
  commits, no tú») — ver mensajes sugeridos en la conversación, no reproducidos aquí.

---

## sesión 17-09-2026 (3.ª parte): la carga de Excel vuelve a exigir Redis, y avisa cuando no está

Al apagar el contenedor `olo-redis-dev`, la carga de Excel siguió funcionando. La causa:
el commit `c69ee32` (Mateo, 16-09) había cambiado `iniciar-carga.usecase.ts` para
preguntar `redisEstaListo()` antes de encolar y, si Redis no respondía, procesar el
archivo dentro del mismo proceso con `setImmediate` —sin pasar por BullMQ—.

**Decisión (pedida explícitamente): se revierte ese cambio** y el archivo vuelve a la
versión de `c6ddc1e`, que encola siempre en `heavy-jobs`. Se restauró solo ese archivo
(`git restore --source=c69ee32^`); el resto del commit de Mateo —mapa, vista, config de
Puck— no se tocó. Era el único cambio que el archivo había tenido desde entonces.

Lo que el respaldo sin Redis perdía, y por lo que se prefiere exigirlo: un trabajo que
solo vive en memoria desaparece si el backend se reinicia a mitad de carga, y sin la cola
dos cargas simultáneas no se ponen en fila —corren a la vez, y como cada una vacía y
recarga la tabla, pueden pisarse—.

**Y se le añadió un rechazo claro (pedido a continuación).** La versión de `c6ddc1e`, con
Redis caído, no fallaba: **se colgaba**. Con `maxRetriesPerRequest: null` (lo exige
BullMQ) el `heavyJobsQueue.add()` espera para siempre, y como `crearCarga` ya se había
ejecutado, en el historial quedaba una fila en «procesando 0 %» que no avanzaba nunca —la
trampa que ya describe la entrada del 15-09 (3.ª parte)—. Ahora lo **primero** que hace
`iniciarCargaObservatorio` es preguntar `redisEstaListo()`, y si no lo está lanza
`ErrorDeSubida` con 503 y el mensaje «Redis no está disponible. La carga no se puede
procesar en este momento; inténtalo de nuevo cuando el servicio esté activo.». Va antes de
validar, de escribir el archivo y de crear la carga, así que un rechazo no deja nada a
medias. El controller ya traducía `ErrorDeSubida` a `{ error }` con su status, y la
tarjeta de carga ya mostraba ese campo (`mensajeDeErrorApi`): no hubo que tocar el
frontend.

> **Sobre §6 («sin filtrar detalles internos»):** el mensaje nombra a Redis a propósito,
> y así quedó comentado en el código. El endpoint solo lo usa un Administrador
> autenticado, y lo que necesita es saber qué servicio levantar. §6 prohíbe stack
> traces, nombres de tabla y errores crudos de Sequelize; esto es un aviso operativo
> redactado a mano.
>
> **Queda un hueco pequeño:** si Redis se cae justo entre la comprobación y el `add()`,
> ese `add()` se sigue colgando. Cerrarlo pediría ponerle un tiempo límite al encolado.

**Verificado**, llamando al use-case directamente y sin tocar el backend en marcha:

| Redis | Resultado |
|---|---|
| Caído (proceso de prueba apuntado a un puerto vacío con `REDIS_URL`) | `ErrorDeSubida` 503 en 2 ms, el mensaje exacto, y cargas/archivos en la base 1/1 antes y 1/1 después: no se creó nada |
| Encendido (el contenedor real) | La comprobación deja pasar, y el rechazo lo da la validación del archivo (415, se mandaron bytes que no son un Excel) |

`tsc --noEmit` limpio. **No verificado en pantalla:** el backend en marcha arrancó 18 s
antes del cambio y corre con `ts-node` sin recarga automática, así que no lo tiene hasta
reiniciarlo. Durante la verificación apareció un segundo proceso en el puerto 6379
(`wslrelay.exe`): no es otro Redis, es el reenvío de Docker Desktop hacia `::1`.

---

## sesión 17-09-2026 (cont.): el paginador de `/programas-sobresalientes` deja de listar todas las páginas

Con el Excel completo de nuevo cargado (671 registros, 112 páginas), el paginador pintaba
los 112 números seguidos y la fila se salía del ancho de la tabla hasta meterse bajo el
mapa. `components/paginador.tsx` listaba `Array.from({ length: totalPaginas })` sin
recorte.

Ahora muestra **siete posiciones fijas** entre las flechas: primera y última página, la
actual con sus vecinas, y `…` en los huecos (`‹ 1 … 6 [7] 8 … 112 ›`).

**Por qué no se reutilizó el `Paginador` del panel** (`shared/ui/molecules/paginador.tsx`,
que ya recorta con `…`): su recorte varía de ancho —cuatro números en la página 1, siete
en la 5— y en el panel no importa, pero en una tabla pública en la que se avanza a golpe
de flecha, la flecha «siguiente» se corría bajo el cursor y el siguiente clic caía en otro
botón. Además trae el selector «Filas por página» y la estética del panel. El de aquí
fija el número de posiciones, y un `…` nunca tapa una sola página. Los números llevan
`aria-label="Página N"` y los `…` son `aria-hidden`.

De paso, en los encabezados de la víspera el «%» de «Vinculación %» quedaba solo en una
segunda línea: la unidad va ahora unida a la palabra con un espacio duro.

**Verificado en el navegador** (Chromium headless contra el servidor de desarrollo, a
1920, 1366 y 375px), pulsando de verdad: página 1, seis veces «siguiente», la última y
«anterior». En los tres anchos son siempre 9 elementos, la flecha «siguiente» no cambia
de coordenada entre páginas, la página no desborda y el paginador queda dentro del ancho
de la tabla. A 375px los botones bajan a 32px y la fila ocupa 343px de los 343 útiles.
`tsc --noEmit` y ESLint limpios.

---

## sesión 17-09-2026: la tabla de `/programas-sobresalientes` pasa al vocabulario del observatorio

Pedido: la tabla mostraba `Centro · Formación Académica · Programa · Género · Certificados ·
Vinculados · Tasa de Vinculación · Salario Promedio` y debe mostrar `Departamento · Centro ·
Modalidad · Programa · Género · Egresados · Vinculación % · Promedio de Salario $`. Los
«certificados» del Excel son en realidad los egresados, y «vinculados» no debe verse.

**Antes de tocar nada se abrió el Excel real.** No trae columnas «Modalidad» ni
«Egresados»: sus encabezados son `Regional · Centro · Nivel de Formación · Programa · Sexo ·
Certificados · Vinculados · Tasa de vinculación · Salario promedio`. Así que el cambio es
**solo de presentación** — no hay dato nuevo que importar ni dato que se pierda:

| Se muestra | Campo | Columna del Excel |
|---|---|---|
| Departamento | `departamento` | Regional |
| Modalidad | `nivelFormacion` | Nivel de Formación |
| Egresados | `certificados` | Certificados |
| Vinculación % | `tasaVinculacion` | Tasa de vinculación |
| Promedio de Salario $ | `salarioPromedio` | Salario promedio |

**Decisión: los campos conservan el nombre del Excel.** Renombrar `certificados` a
`egresados` en la base y en la API obligaría a una migración y a que el importador
tradujera un encabezado que SENA sigue llamando "Certificados". La traducción vive en un
solo sitio, `resultados-programas-sobresalientes.tsx`, con la tabla de equivalencias en su
comentario. `vinculados` se sigue importando y guardando —la tasa se calcula con él—, solo
deja de mostrarse. Departamento pasa de ser una línea gris bajo el centro (y solo sin
filtro activo) a columna propia, siempre visible. El filtro «Formación Académica» se
renombró a «Modalidad» para que se llame igual que la columna que filtra.

| Archivo | Cambio |
|---|---|
| `components/resultados-programas-sobresalientes.tsx` | Encabezados nuevos, columna Departamento, fuera Vinculados |
| `components/filtros-programas-sobresalientes.tsx` | Etiqueta y `aria-label` → «Modalidad» |
| `types.ts` | Cada campo documenta con qué nombre se muestra |

**Verificado:** `tsc --noEmit` y ESLint limpios; en el navegador (Chromium headless contra
el servidor de desarrollo) los ocho encabezados salen en el orden pedido, sin scroll
horizontal ni a 1920 ni a 1366px.

> **Lo que se vio al verificar, y no es un fallo:** la página muestra **un solo
> registro**. La última carga (17-09, 00:04, `5cf44955-….xlsx`) trae una fila de datos, y
> cada carga vacía y recarga la tabla entera. Ese archivo, además, viene en un formato
> nuevo con columnas de código (`Cod. Regional`, `Cod. Centro`, `Cod. Nivel de formación`,
> `Cod. Programa`) — el importador lo aceptó porque busca los encabezados por nombre e
> ignora los que no conoce. Esos códigos **no se guardan** hoy.

**Pendiente al cierre:** volver a subir el Excel completo para que la página vuelva a
mostrar todos los registros. Si
el formato con códigos es el que va a llegar de ahora en adelante, decidir si se guardan
—serían la clave natural para cruzar con otras fuentes del SENA, más fiable que el nombre—.
Y `api-backend/uploads/` no está en `.gitignore`: los Excel subidos aparecen en `git status`
y uno ya llegó a estar versionado.

---

## sesión 16-09-2026: se cierran las cinco deudas que quedaban abiertas del repaso de código muerto

Continuación del repaso de la víspera (commits `4e9e5e6`…`52d7975`: el BOLA del candado
de página, `errores-api.ts`, la ref de `vigilante-sesion`, la copia vieja de
`use-usuarios` y cuatro huérfanos de intranet). Aquella tanda dejó cinco cosas señaladas
y **sin tocar**, cada una porque pedía una decisión antes que un parche. Esta sesión las
cierra todas.

**1. Los 8 `react-hooks/set-state-in-effect` de `sitio-web` no eran un solo problema.**
Cuatro eran efectos que arrancan una petición: ahí el `setState` sale de la respuesta y
no puede estar en el estado inicial, así que llevan `eslint-disable-next-line` **con el
motivo escrito al lado** (`use-cargas-programa-sobresalientes`, `use-respaldos`,
`modal-eliminar-seccion`, el debounce de `modal-depurar-versiones`). Los otros cuatro
eran «vaciar el modal cuando se abre», y eso sí se corrigió de raíz: el padre cambia la
`key` en cada apertura y el modal se monta limpio.

| Modal | Padre que ahora pone la `key` | Forma de la `key` |
|---|---|---|
| `ModalNuevoEditor` (roles) | `roles-view.tsx` | Contador de aperturas — cambia al abrir, no al cerrar, para no cortar la animación de salida del `Alert` |
| `ModalDepurarVersiones` | `respaldos-view.tsx` | Contador de aperturas |
| `VistaPreviaVersion` | `respaldos-view.tsx` | `seleccionado?.id ?? 'cerrado'` |
| `ModalAccionConMotivo` ×2 | `revision-queue-view.tsx` | `` `${accion}-${modalState.pagina?.id ?? 'cerrado'}` `` |

Efecto lateral que no se buscaba pero se gana: `ModalDepurarVersiones` recalcula
`fechaMaximaPermitida` en cada apertura. Antes su `useMemo` sin dependencias se quedaba
con la fecha del primer montaje, así que en una pestaña abierta varios días la fecha de
corte envejecía sola.

**2. `@next/next/no-html-link-for-pages`**: excepción declarada para
`src/shared/lib/blocks/**` en **las dos** configs de ESLint (§8 exige que no diverjan).
Los bloques Puck se pintan dentro del lienzo del editor; un `<Link>` ahí navegaría del
lado del cliente y se llevaría el editor por delante con el borrador sin guardar.

**3. `ambito:verificar` fallaba, y no era código.** Su bloque C daba por hecho que la
página `inicio` de intranet «arranca vacía», y esa página ya tiene contenido real en
`en_revision`. La prueba medía el estado de la base, no el aislamiento por ámbito. Ahora
se crea su propio dato (`__prueba-solo-en-sitio__`) en un solo ámbito y comprueba que no
se filtra al otro, que es lo que siempre quiso demostrar. De paso se quitaron sus cuatro
`as any` (§4). **Pasa.**

**4. `listar-versiones-archivadas.usecase.ts` no era código muerto.** Lo consume
`scripts/probar-versionamiento.ts`, un CLI real con `listar`/`estado`/`restaurar`. Lo que
no tenía era entrada en `package.json`, así que nadie podía encontrarlo. Se registró como
`probar:versionamiento` y se corrigió su texto de ayuda, que seguía diciendo
`npx ts-node scripts/…`.

**5. La migración a kebab-case (fase 5 de `8-ciclo-editorial.md`) se completó.**
72 archivos renombrados y 102 referencias reescritas en 31 archivos. El alcance real fue
mayor que los ~45 previstos: al recuento original le faltaban los 20 modelos Sequelize
del backend. Los renombres van con `git mv` en dos pasos porque Git en Windows no detecta
un cambio que solo altera mayúsculas.

> **Lo que había que no romper, y no se rompió:** la **clave** de cada bloque en
> `puck.config.tsx` (`TasaVideo`, `IntranetTopbar`…). El contenido ya guardado en
> `paginas_versiones` lleva `type: "TasaVideo"` escrito dentro, y el renderizador
> devuelve `null` ante un tipo desconocido en un punto y revienta en otro. Se comprobó
> explícitamente que el diff de los dos `puck.config.tsx` **solo** contiene líneas de
> `import`. Igual sigue en pie el selector `[data-puck-component*="IntranetTopbar"]` de
> `globals.css`, que también depende de la clave y no del archivo.

**De paso, intranet tenía 11 errores propios de ESLint que nadie había contado** (la nota
de §8 solo hablaba de `sitio-web`). Se arreglaron: el `any` de `LoginView` sobraba porque
`User` ya declara `permisos`; el de `PptxViewer` se cambió por una comprobación en tiempo
de ejecución de `destroy()`, que la librería no declara en sus tipos; los tres
`prefer-const` de `IntranetTopbar` eran tres `setTimeout` que solo se asignan una vez; y
su `vigilante-sesion.tsx` tenía la misma escritura de ref en render que ya se había
corregido en `sitio-web` la víspera —la copia que no se tocó cuando se tocó la otra, que
es exactamente el motivo por el que existe `packages/`—.

**Verificado, en este orden:** `tsc --noEmit` limpio en los cuatro proyectos
(`api-backend`, `sitio-web`, `intranet`, `blocks-renderer`); ESLint **0 errores** en las
dos apps (antes 11 y 11; quedan 31 y 9 advertencias, casi todas `no-img-element`);
`npm run build` de producción correcto en las dos apps —que es donde aparecería el fallo
de mayúsculas al desplegar sobre Linux—; y los cinco scripts del backend
(`db:`, `propiedad:`, `permisos:`, `auditoria:`, `ambito:verificar`) en verde, los cinco,
por primera vez.

**Pendiente al cierre:** sigue sin contestar el volumen persistente para
`api-backend/uploads/` en el compose de producción — hoy no monta ninguno, así que las
subidas se pierden en cada redespliegue. Y la fase 6 (`packages/editor-core`) sigue sin
empezar; la duplicación entre las dos apps no bajó, se movió.

---

## sesión 15-09-2026 (3.ª parte): layout mapa+tabla del observatorio, y loader real de progreso para la carga de Excel

**Layout de `/programas-sobresalientes`** (`sitio-web/src/features/sitio-web/programas-sobresalientes/`): pedido en varias vueltas — mapa a la izquierda fijo (sticky) al hacer scroll, más grande, sin cortarse con el header del sitio, y la tabla de resultados con sus 8 columnas visibles sin scroll horizontal. Encontrado en el camino: `.olo-header` es `sticky top:0` con `z-index:1000` y 90px de alto (`globals.css`), así que un `top` menor que eso queda tapado — se ajustó a `top-[104px]`. Y con `whitespace-nowrap` en los encabezados de la tabla (sin `table-layout:fixed`) el navegador expande las columnas para que el texto quepa en una línea, aunque haya `min-width` explícito — de ahí el scroll horizontal que se pidió quitar. Se resolvió dejando envolver el texto de encabezados y de "Formación Académica" (puede traer "Profundización Técnica"), y moviendo el punto donde aparece el layout de dos columnas de `lg` (1024px) a `2xl` (1536px): por debajo de eso, mapa arriba a ancho completo y tabla debajo a ancho completo (nunca compiten por espacio); de ahí para arriba, mapa fijo de 440px a la izquierda. Verificado sin scroll horizontal en 1024, 1280, 1366, 1440, 1536 y 1920px con capturas vía Chromium headless (CDP) — no había `chromium-cli` disponible en este entorno.

**Loader real de progreso en "Actualizaciones" → Programa + Sobresalientes** (pedido explícito: "un loader real que me diga cuánto va de porcentaje", no simulado). El worker de `heavy-jobs` ahora reporta avance real en dos fases de `importarProgramasExcel` (`api-backend/src/use-cases/observatorio/importar-programas-excel.usecase.ts`): 0-60% leyendo y validando las filas del Excel (cada 100 filas), 60-100% escribiéndolas en `programas_sobresalientes` en lotes de 2.000 (antes un único `bulkCreate` con todas las filas de golpe, sin forma de medir avance). `procesar-carga.usecase.ts` recibe ese callback y escribe en `cargas_datos` sin esperar (`.catch` sin `await`) y sin más seguido que cada 500ms, para no saturar la base en un archivo de 100.000 filas.

| Capa | Archivo | Cambio |
|---|---|---|
| DB | `migrations/028-cargas-datos-progreso.ts` | Columnas `progreso` (0-100, `CHECK`) y `filas_totales` en `cargas_datos` |
| Backend | `importar-programas-excel.usecase.ts` | `onProgreso` opcional; lectura por fila, escritura por lote de 2.000 |
| Backend | `procesar-carga.usecase.ts` | Throttle de escritura (500ms) hacia `cargas_datos`, fuera de la transacción grande |
| Backend | `repositories/observatorio.repository.ts` | `actualizarProgreso()`; `marcarCargaCompletada` ahora fija `progreso:100` |
| Frontend | `actualizaciones/hooks/use-cargas-programa-sobresalientes.ts` | Sondeo de 3s → 1s; expone `cargaEnProceso` |
| Frontend | `actualizaciones/components/carga-programa-sobresalientes.tsx` | Barra de progreso real (`role="progressbar"`, "N de M filas") |
| Frontend | `actualizaciones/components/historial-cargas-grid.tsx` | "Procesando... N%" en la grilla de historial |

> **Trampa para quien retome esto:** Redis no estaba corriendo en este entorno de desarrollo (nada en el puerto 6379) — sin él, `heavyJobsQueue.add()` se queda esperando para siempre y cualquier carga de Excel se cuelga en "procesando" al 0%, sin importar qué tan bien esté el loader. Se resolvió por esta sesión con un contenedor suelto (`docker run -d --name olo-redis-dev -p 6379:6379 --restart unless-stopped redis:7-alpine`, arrancando primero Docker Desktop) — no forma parte de ningún script del proyecto y no sobrevive a un reinicio de Windows si Docker Desktop no arranca solo. Detalle completo en memoria (`redis-no-arranca-solo-en-dev`).

**Verificado:** `tsc --noEmit` limpio en `api-backend` y `sitio-web` tras todos los cambios. Migración `028` aplicada contra la base real (`npm run migrate`). Backend reiniciado (usa `ts-node` plano, sin recarga automática) y confirmado arriba con el worker conectado a Redis (`connected_clients:7` en el contenedor). **No verificado todavía:** una carga real de Excel de punta a punta — quedó lista la infraestructura (Redis, migración, backend reiniciado) justo cuando el usuario iba a intentarlo.

**Pendiente al cierre:** confirmar con una carga real que el porcentaje avanza como se espera y que el resultado final coincide con `filasCargadas`; decidir si el contenedor Redis suelto se reemplaza por el `docker-compose.yml` del proyecto (ya trae su propio servicio `redis`) para no depender de un contenedor creado a mano.

---

## sesión 15-09-2026 (cont.): se reconcilia con el "observatorio" de Mateo, que llegó en paralelo

Mismo día, después de la entrada de abajo: al bajar cambios de `dev`, apareció un `git
stash pop` con conflicto real en 4 archivos (`app.ts`, `migrations/index.ts`,
`models/index.ts`, `package-lock.json`) — Mateo había construido, en paralelo y sin
coordinar, su propia versión completa del mismo módulo: migración
`026-observatorio-programas-sobresalientes` (tablas `departamentos`, `centros_formacion`,
`niveles_formacion`, `programas_formacion`, **`programas_sobresalientes`** — no
`formacion_sobresalientes` como se había nombrado aquí), modelos Sequelize, un use-case de
importación (`importar-programas-excel.usecase.ts`), controller, rutas bajo
`/api/observatorio`, y hasta un campo de subida **dentro de un bloque Puck**
(`ImportadorExcelBloque` + `ImportadorExcelUploaderField`), con su propio proxy en
`sitio-web/src/app/api/observatorio/importar/route.ts`.

**Decisión (pedida explícitamente):** se adopta el nombre de tabla/modelo de Mateo
(`programas_sobresalientes` / `ProgramaSobresaliente`, sin tocar su migración) para no
generar un choque de nombres con su rama, y se organiza todo lo demás bajo ese mismo
paraguas de nombres (`/api/observatorio`, `use-cases/observatorio/`,
`policies/observatorio.policies.ts`). Se retiran por completo las piezas con nombre
`formacion-sobresalientes` de la sesión anterior (migraciones 025-027 viejas, modelos
`FormacionSobresaliente`/`FormacionActual`, controller, rutas, repositorio) — quedaban
duplicadas y con un diseño (`carga_id` + vista `v_formacion_actual`) que ya no aplica: la
tabla de Mateo tiene `UNIQUE(centro_id, programa_id, sexo)` sin columna de carga, así que
la estrategia correcta es la que él ya había implementado — **vaciar y recargar completo
en cada importación**, no versionar por carga.

**Se mantiene la arquitectura acordada en sesión (D1-D11 de `plan-programa-sobresalientes.md`), no la de Mateo, donde chocan:**
- Sin campo de Excel dentro de un bloque Puck — se borra `ImportadorExcelBloque`, su
  campo, y el proxy de Next. El bloque Puck sigue siendo de solo lectura.
- Solo Administrador/Superadmin sube, no cualquiera con `contenidos.editar` (que es lo que
  dejaba subir la versión de Mateo).
- Subida validada por magic bytes vía `@olo/upload-policy` (antes: `express.raw` de
  cualquier `application/octet-stream`, sin comprobar que fuera real un Excel).
- Procesamiento asíncrono en `heavy-jobs` (antes: síncrono, bloqueando la respuesta HTTP).
- Auditoría de cada carga en `cargas_datos` (tabla nueva, sin relación de esquema con
  `programas_sobresalientes` — pura bitácora de quién subió qué y con qué resultado).

**Dos errores reales corregidos en la lógica de importación de Mateo** (su propio código,
nunca antes probado contra el archivo real — se detectaron al portar la lógica de parseo
ya verificada contra la estructura real del Excel):
1. Leía `worksheets[0]` (la primera hoja) en vez de buscar la hoja **"Superan el margen"**
   por nombre. El archivo real tiene 31 hojas ("Mujer", "Hombre", 28 por departamento);
   nada garantiza que la correcta sea la primera.
2. Leía las columnas por **posición fija** (A=Regional, B=Centro...), asumiendo 9 columnas
   sin las de código. La estructura real tiene 13 columnas con pares código+nombre
   intercalados (`Cod. Regional, Regional, Cod. Centro, Centro...`) — la lectura posicional
   habría leído columnas equivocadas en cada fila. Se corrigió a lectura por **nombre de
   encabezado**, igual que ya estaba verificado en la sesión anterior.

**Ambigüedad marcada, no adivinada:** el `CHECK` de Mateo exige `tasa_vinculacion` como
fracción (0-1), pero ninguna versión (ni la suya ni la nuestra) sabe con certeza si el
Excel real trae el valor ya como fracción o como porcentaje entero. Se normalizó de forma
defensiva (`> 1` ⇒ dividir entre 100) en vez de asumir un formato — más barato que fallar
en producción por una fila con dato válido. **Queda pendiente confirmar contra el archivo
real** la primera vez que alguien lo cargue.

**Verificado:** `tsc --noEmit` limpio en las dos apps tras la reconciliación completa; los
4 archivos en conflicto se resolvieron y quedaron en `git add` (sin commit — no se pidió).

---

## sesión 15-09-2026: módulo "Programa + Sobresalientes" completo — de la evaluación al código

Implementado de punta a punta el plan acordado en `plan-programa-sobresalientes.md` (el
propio documento de planeación, creado en esta misma sesión, tiene el detalle completo de
hallazgos y decisiones — aquí solo el resumen de lo que quedó escrito en el repo).

**Hallazgo que arrancó todo:** las 5 tablas de catálogo (`departamentos`, `centros_formacion`,
`niveles_formacion`, `programas_formacion`, y la de hechos que en realidad no existía) se
habían creado a mano en Neon, fuera del runner de migraciones — invisibles para
`11-base-de-datos.md`, para `db:verificar` y para cualquiera que levante una base nueva desde
cero. Dos de sus restricciones (`centros_formacion.departamento_id UNIQUE`,
`programas_formacion.nivel_formacion_id UNIQUE`) además impedían cargar el Excel real, que
trae varios centros por departamento y varios programas por nivel.

**Base de datos** (`api-backend/src/infrastructure/db/migrations/025` a `027`): las dos
restricciones rotas se localizan y eliminan por `information_schema`, no por nombre
adivinado — este proyecto ya se quemó una vez con eso (008/009). Los 4 catálogos ganan una
columna `codigo` (llave natural del Excel, único aparte del `UUID` que sigue siendo PK — D3
del proyecto no se toca). Tablas nuevas: `cargas_datos` (auditoría de cada carga, con
columna `modulo` pensada para las otras 3 tarjetas de "Actualizaciones" cuando se
especifiquen) y `formacion_sobresalientes` (hechos, append-only por `carga_id`), más la
vista `v_formacion_actual` (última carga `completado`).

**Backend**: modelos Sequelize + `repositories/formacion-sobresalientes.repository.ts` +
`use-cases/formacion-sobresalientes/` (ingesta con `exceljs`, transaccional, upsert de
catálogos por código; consulta pública; historial). La ingesta corre en `heavy-jobs`
(BullMQ) — subir el archivo ya no bloquea la respuesta HTTP. Nuevo endpoint público
`GET /api/formacion-sobresalientes` y endpoints de administración bajo
`/api/formacion-sobresalientes/cargas` (solo Administrador/Superadmin,
`policies/formacion-sobresalientes.policies.ts`). Dependencias nuevas en `api-backend`:
`exceljs`, `multer`, `@olo/upload-policy` (antes solo la usaban los frontends —
completa la promesa de "política única" a las tres apps), `file-type@16` fijado así
—no `^22` como en `sitio-web`— porque desde la v17 el paquete es ESM puro y este backend
compila a CommonJS.

**Decisión de sesión que simplificó todo:** sin editor en este flujo. Solo el Administrador
sube el Excel y la base se actualiza de inmediato — se descartó el flujo
editor-sube/admin-aprueba (sin `pendiente_aprobacion`, sin `motivo_rechazo`).

**Admin (`sitio-web`)**: el enlace "Soporte" del sidebar (`/admin/dashboard/soporte`, un 404
disfrazado de item de menú — no tenía página real detrás) se repurpuso como
"Actualizaciones" (`/admin/actualizaciones`, ícono `ArrowUpTrayIcon`). Cuatro tarjetas; solo
"Programa + Sobresalientes" es funcional (sube, ve el historial en una grilla de
`handsontable` — dependencia instalada desde antes sin un solo uso real). Las otras tres
(Alertas de inversión, Fuentes futuras de empleo, Criterios de clasificación de resultados)
quedan "Próximamente": no tienen Excel ni esquema de datos especificado todavía.

**Público (`sitio-web`)**: `use-programas-sobresalientes.ts` deja de leer el fixture
(`programas-sobresalientes-temporal.ts`, borrado — quedó muerto) y llama al endpoint real.
Se quitó el filtro de Centro (sigue en la tabla de resultados, ya no como selector); los 5
niveles de formación se corrigieron a los reales (traía "Especialización", el Excel real
dice "Profundización Técnica"). El bloque Puck `ProgramasSobresalientes` quedó de solo
lectura, sin campo de archivo — se registra en `puck.config.tsx` igual que `Footer` (sin
`fields`), porque los datos viven en Postgres, no en el JSON de la página.

**Verificado:** `tsc --noEmit` limpio en las dos apps. **No verificado / pendiente para quien
retome:** correr `npm run migrate` contra el Neon real (las migraciones no se ejecutaron
desde aquí — no hay acceso a la base), y probar la carga con el Excel real de SENA
(`npm run probar:carga-formacion -- <ruta>`, script nuevo que corre la ingesta sin pasar por
HTTP ni por la cola, para revisar rápido sin depender de Redis).

---

## sesión 11-09-2026: reset a `OLO/main` y el `dist/` desactualizado que dejó

Sesión con dos partes encadenadas: primero poner el `main` local igual al remoto sin perder
trabajo propio, y después diagnosticar un 500 al subir archivos que el propio reset provocó.

### 1. `main` local = `OLO/main`, sin perder los 3 commits propios

Un `git pull` había dejado un merge a medias (cientos de archivos auto-fusionados más un
conflicto real en `sitio-web/src/features/paginas/components/revision-queue-view.tsx`), con
`main` local y remoto divergidos en 3 commits propios contra 41 del remoto. A pedido
explícito de traer todo el remoto y descartar la estructura local, sin perder nada:

1. `git merge --abort` — vuelve al estado justo antes del pull.
2. `git branch backup-local-2026-09-11` — conserva los 3 commits propios (`46f2e5d` y
   anteriores) para revisión posterior; no se ha vuelto a tocar esa rama.
3. `git stash` no encontró nada que guardar: los cambios sueltos que aparecían en el estado
   inicial de la sesión (`revision-queue-view.tsx`, `sidebar.tsx`) ya estaban commiteados en
   `46f2e5d`.
4. `git reset --hard OLO/main` — deja `main` en `ce9725f`.
5. Limpieza de 3 carpetas huérfanas que el checkout no borra solo por quedar vacías
   (`sitio-web/public/backend/`, `sitio-web/src/shared/animations/`,
   `sitio-web/src/shared/ui/templates/`): confirmado que no tenían contenido antes de
   borrarlas, no eran `código muerto` con datos, solo directorios vacíos.

No se tocó nada bajo `.gitignore` (`node_modules`, `.next`, `dist`, `.env*`): son artefactos
de build y configuración local de cada máquina, no carpetas «muertas» del proyecto.

### 2. El 500 al subir el PDF en el bloque «Publicaciones» — causa raíz

Reportado en `/admin/editor/inicio`: `POST /api/upload` devolvía `Error interno del servidor
al procesar el archivo.` para cualquier archivo.

`sitio-web/src/app/api/upload/route.ts` llama a `resolverCarpetaPorExtension()` de
`@olo/upload-policy`. Esa función existe en `packages/upload-policy/src/index.ts`, pero no en
`packages/upload-policy/dist/index.js` (el build de 04-09-2026, once días más viejo que el
`src/` que trajo el reset) — `dist/` está en `.gitignore`, así que el reset cambió el fuente
y dejó el compilado intacto. El `TypeError` resultante caía en el `catch` genérico de la ruta
y salía como 500 sin pista de la causa real.

Agravante encontrado de paso: en las tres apps, `@olo/*` se instala como `file:../packages/*`
con `install-links=true` (ver comentario en `scripts/sincronizar-paquetes-locales.mjs`), que
copia en vez de enlazar — así que ni reconstruir el paquete alcanza: hay que refrescar
también la copia dentro de cada `node_modules`. `packages/slug-policy` tenía el mismo
problema (`src/` del reset, `dist/` sin recompilar); `accessibility-policy`, `email-policy` y
`password-policy` sí estaban al día.

### 3. Por qué volvería a pasar: `sincronizar-paquetes-locales.mjs` solo avisaba

El script ya existe y ya corre solo como `predev`/`prebuild` en las tres apps — es
infraestructura del propio equipo (commit `9e27647`), no algo nuevo de esta sesión. Pero su
paso 3 original, al detectar `src/` más nuevo que `dist/`, **solo imprimía un `AVISO`** por
consola y seguía. Entre el resto del log de arranque de Next, pasó desapercibido: exactamente
lo que le ocurrió al bug de esta sesión.

Se cambió esa parte para que compile en vez de avisar: si detecta `src/` más nuevo que
`dist/` (o `dist/` ausente), instala las `devDependencies` propias del paquete si hace falta
(`node_modules` no existía en ninguno de los 5 paquetes que compilan a `dist/`) y corre su
`npm run build`, **antes** de comparar copia contra origen — si se recompilara después de
comparar, la resincronización de esa misma vuelta no vería el `dist/` nuevo. Si el paquete no
declara `build`, o la compilación falla, corta con `process.exit(1)` en vez de dejar
arrancar la app contra una copia que ya sabe que está mal — mismo criterio de «fallo ruidoso»
que ya usaba el resto del script para el paso de resincronización.

No hace falta ningún comando nuevo de parte del equipo: con el `predev`/`prebuild` ya
enganchado, alcanza con `npm run dev` como siempre. El primer `npm install` dentro de cada
`packages/*` (para tener `typescript`) es un costo único por paquete y por máquina.

**Descartado:** pasar `@olo/*` a symlinks reales (`npm workspaces`, o exigir modo
desarrollador de Windows) para que este problema no pueda repetirse estructuralmente. No se
intentó: es un cambio de infraestructura mayor —afecta cómo instalan las tres apps y el
`Dockerfile`— fuera del alcance de un arreglo de sesión: queda anotado para quien quiera
evaluarlo con más tiempo.

### Inventario de lo tocado

| Archivo | Cambio |
|---|---|
| `scripts/sincronizar-paquetes-locales.mjs` | Paso 3 pasa de avisar a compilar (`npm install` + `npm run build` por paquete si `dist/` está viejo), antes del diff de sincronización. |
| `packages/upload-policy/dist/` | Recompilado; ya exporta `resolverCarpetaPorExtension`. |
| `packages/slug-policy/dist/` | Recompilado (mismo síntoma, sin bug reportado todavía). |
| `sitio-web/node_modules/@olo/{upload-policy,slug-policy}` | Copia resincronizada a mano primero, y verificada luego por el script ya corregido. |
| `intranet/`, `api-backend/` node_modules equivalentes | Igual. |

### Verificación
- `node ../scripts/sincronizar-paquetes-locales.mjs` corrido a mano desde `sitio-web`,
  `intranet` y `api-backend`: las tres salen limpias (`exit 0`, sin diferencias pendientes).
- Prueba deliberada del camino nuevo: se tocó el `mtime` de `packages/upload-policy/src/index.ts`
  para simular un `dist/` desactualizado y se volvió a correr el script — detectó la
  desactualización, instaló `typescript` en el paquete, compiló y confirmó la copia al día.
  Una segunda corrida inmediata no hizo nada (camino rápido intacto).
- `resolverCarpetaPorExtension` confirmado presente en los tres `dist/index.js` copiados
  (`grep` directo, no solo lectura del build log).
- **No se probó en el navegador.** Quedó pendiente que alguien reinicie su `next dev` (Next no
  recarga `node_modules` en caliente) y repita la subida del PDF en el bloque Publicaciones
  para confirmar el flujo completo end-to-end.

> Trampa para quien lea esto después: si un paquete de `packages/` empieza a fallar con un
> export que «debería estar» y no está, mirar primero `node_modules/@olo/<paquete>/dist/` en
> la app que falla, no `packages/<paquete>/src/`. El error casi nunca señala esa ruta.

### Pendiente al cierre
- Confirmar en el navegador que la subida de PDF en «Publicaciones» funciona tras reiniciar
  `next dev`.
- `packages/upload-policy/package-lock.json` quedó modificado por el `npm install` que le
  agregó `typescript` como dependencia instalada (antes tenía el lockfile sin `node_modules`
  correspondiente). Nada más cambió en él; falta decidir si se commitea junto con el resto.
- La rama `backup-local-2026-09-11` con los 3 commits que reemplazó el reset sigue sin
  revisar.
- Nada de esta sesión se ha commiteado todavía — se dejó así a propósito, a la espera de
  confirmación.

---

## sesión 08-09-2026: dos retoques en el panel — el modal de alertas y la actividad reciente

Dos encargos pequeños sobre capturas del panel administrativo, ambos en el mismo archivo:
`sitio-web/src/features/administracion/auth/components/panel-general.tsx`.

### A. «Actividad Reciente»: más registros y sin el marco de la tabla

- **De 7 a 15 registros.** Es la constante `CAMBIOS_RECIENTES`, que viaja como tercer
  argumento de `listarAuditoria(filtros, pagina, porPagina)`. Se comprobó antes de subirla que
  la API lo admite: `audit.routes.ts` documenta el parámetro como `minimum: 1, maximum: 200,
  default: 50`, así que 15 entra de sobra y no hace falta tocar el backend.
- **Fuera el marco de la tabla interna**: el contenedor pierde `border border-zinc-200
  dark:border-[#7db828]/30` y se queda con `overflow-x-auto rounded-lg`. El scroll horizontal
  y el redondeo siguen, que son los que evitan que la tabla se apriete en pantallas estrechas.
- **Las líneas entre filas se quedan.** El `divide-y` del `<tbody>` no es «el borde de la
  tabla»: es lo que separa un registro del siguiente, y sin él quince filas seguidas se leen
  como un bloque. Si la idea era dejarlo completamente liso, es un cambio de una clase.

Efecto lateral que conviene mirar: en modo oscuro la cabecera de la tabla usa `bg-[#131b2f]`,
el mismo color que la tarjeta. Con el marco puesto se notaba dónde empezaba la tabla; sin él,
la cabecera queda a ras del fondo. Es exactamente lo pedido, pero se anota por si al verlo se
prefiere otra cosa.

### B. El modal de alertas, más grande y sin el triángulo

Encargo, sobre una captura del modal «Notificaciones» del panel administrativo: agrandarlo y
quitar el icono de alerta.

Vive en `sitio-web/src/features/administracion/auth/components/panel-general.tsx`, en el
componente del diálogo de alertas. Cambios, todos de clases de Tailwind salvo el borrado del
icono:

- **Ancho** de `max-w-lg` a `max-w-2xl` (de 32 a 42 rem), y `min-h-[22rem]`. Lo segundo es
  por lo que se ve en la captura: con una sola alerta el diálogo quedaba tan bajo que parecía
  cortado. El `max-h-[88vh]` y el scroll interno siguen igual, así que con muchas alertas se
  comporta como antes.
- **Aire y tamaños**: cabecera `px-6 py-5` → `px-8 py-6`, cuerpo `p-6` → `p-8`, tarjetas
  `p-4` → `p-5`. Título a `text-xl` y los rótulos de cada tarjeta a `text-base`; la línea
  secundaria («Vence en N días») se queda en `text-sm` para que siga leyéndose como
  subordinada y no compita con el titular.
- **Fuera el triángulo de advertencia** de la tarjeta ámbar: se quitaron el `<span>` del
  círculo y su `<svg>`, y con ellos el envoltorio `flex items-center gap-3` que ya no tenía
  nada que alinear. El texto pasa a ocupar todo el ancho.
- El botón de descartar («Marcar como solucionada») no se tocó, pero su hueco reservado pasa
  de `pr-12` a `pr-14` para acompañar el nuevo `p-5`.

### Decisiones
- **Solo se quitó el icono de la tarjeta ámbar.** El diálogo tiene un segundo tipo de tarjeta,
  la azul de «Página en revisión», que lleva un `ClipboardDocumentCheckIcon`. Ése no es un
  icono de alerta, así que se dejó; sí se le igualaron el relleno y el tamaño de letra para
  que las dos tarjetas midan lo mismo. Queda pendiente de confirmar con quien lo pidió: ahora
  una tarjeta tiene círculo con icono y la otra no.

### Verificación (de los dos retoques)
- `npx tsc --noEmit` en `sitio-web`: sin errores.
- `npx eslint` sobre el archivo: 0 errores. Los 6 avisos que salen (`colorDiasRestantes`,
  `mensajeDeRevision`, `enlaceAlEditor` sin usar, y el `<img>`) **ya estaban en `HEAD`**; se
  comprobó contra la versión publicada para no atribuirlos a estos cambios.
- El tope de la API se leyó en `api-backend/src/routes/audit.routes.ts` antes de subir el
  límite, en vez de suponerlo.
- **No se revisó ninguno en el navegador**: las dos pantallas están detrás del login del panel.
  Son cambios de clases de Tailwind y una constante, pero el aspecto final conviene mirarlo —
  sobre todo cuántas de las 15 filas caben sin que la tarjeta crezca de más.

---

## sesión 08-09-2026: el buscador de ocupaciones ya consulta el catálogo CNO (2.ª parte)

Encargo: con el archivo maestro de la Clasificación Nacional de Ocupaciones volcado a JSON
en `sitio-web/data_temporal/`, montar las dos vistas de consulta —la tabla de resultados y
el detalle ampliado— y hacer que el banner de `/clasificacion` consulte de verdad esos
datos.

### 1. Lo que había: un buscador que no podía encontrar nada

`/clasificacion` pintaba el banner y, debajo, una lista de tarjetas. Nunca mostró una sola:
el service llamaba por `axios` a `http://localhost:4000/api/ocupaciones/buscar`, un endpoint
que **el backend no tiene** —no existe módulo de ocupaciones en `api-backend/`—, y el
`catch` devolvía `[]`. El tipo `Ocupacion` (`codigoCno`, `codigoCuoc`, `denominacion`) era
una maqueta, no el contrato del archivo maestro.

### 2. Dónde se resuelven las uniones, y por qué ahí

El volcado son once hojas de Excel, ~6 MB de JSON, con los encabezados literales de la hoja:
`cod_ocupacion_cno` en unas tablas y `"Código de la ocupación - C.N.O."` —con espacios,
tildes y puntos— en `relacionada_cno` y `conocimientos_cno`. Las uniones se resuelven **en
el servidor**, dentro de un route handler de Next (`app/api/ocupaciones/`), leyendo los JSON
con `fs`.

Se descartaron dos alternativas más cortas:

- **Importar los JSON con `import datos from '…/ocupaciones.json'`** (`resolveJsonModule` ya
  está activo en el `tsconfig`). Obliga a mover la carpeta dentro de `src/` y mete los 6 MB
  en el grafo de módulos, donde cualquier import descuidado desde un componente de cliente
  se los lleva al bundle del navegador.
- **Servirlos desde `public/`.** Publica el archivo maestro entero y obliga al navegador a
  descargar 6 MB para resolver una búsqueda que en el servidor cuesta un recorrido de 611
  ocupaciones.

El handler devuelve ya la forma final (`ResultadoOcupacion`, `DetalleOcupacion`), en
`camelCase` y con las uniones hechas. Es el contrato que consumirá la UI cuando el catálogo
esté en la base de datos: ese día cambia el origen dentro del handler —pasa a ser un
`proxyToBackend`— y no cambia nada del hook hacia arriba.

El catálogo se lee una vez por proceso y se cachea la **promesa**, no el resultado, para que
dos peticiones simultáneas durante el arranque compartan la misma lectura. Si la lectura
falla, la promesa cacheada se descarta: sin eso, un JSON ausente dejaría el buscador roto
hasta reiniciar el servidor.

### 3. Las dos vistas

Un **único** diálogo modal que cambia de contenido, no dos apilados. Dos diálogos a la vez
se disputan el foco y el bloqueo del scroll, y el de atrás sigue siendo alcanzable con el
tabulador aunque no se vea; con uno solo, "volver a los resultados" es un cambio de estado.
Colores de marca (`#001631` en el encabezado, `#7DB828` en acentos y foco) y esquinas de
16px, las mismas del banner.

Un diálogo que cambia de contenido tiene una trampa que uno que se desmonta no tiene: la
fila que abre el detalle desaparece en el mismo instante en que se pulsa, el foco cae al
`<body>` y a partir de ahí ni el tabulador ni Escape llegan al diálogo. Por eso
`ModalOcupaciones` recibe una `claveContenido` y devuelve el foco al panel cada vez que
cambia. El "foco previo" que se restaura al cerrar se guarda en un efecto aparte, atado solo
a `abierto`: si dependiera también del contenido, guardaría como previo un elemento del
propio diálogo.

El diálogo salió con `z-50` de Tailwind y la cabecera lo recortaba por arriba: `.olo-header`
es `sticky` con **`z-index: 1000`**, y `z-50` son 50. Se subió a `z-[2000]`, la misma capa
que ya usa `.olo-search-modal` para ponerse sobre la cabecera, y además se pinta con
`createPortal` colgando de `<body>`. El portal no es redundante con el `z-index`: el diálogo
se escribe dentro de `<main>`, y ahí cualquier antepasado con `transform`, `filter` u
`opacity < 1` se vuelve el marco de referencia de sus descendientes `fixed` y los encierra en
su apilamiento —exactamente lo que le pasó al botón «Editar sección» con
`.olo-route-transition`, contado en `globals.css`—. Sacarlo del árbol de la página es lo que
impide que vuelva a pasar cuando alguien añada una animación al contenido.

**Tamaño del panel: `sm:w-[75vw]` y `sm:max-h-[80dvh]`.** Las dos vistas comparten medida;
antes cada una traía la suya (`max-w-3xl` los resultados, `max-w-4xl` el detalle) por un prop
`ancho` que se eliminó, y el panel daba un salto de anchura al pasar de una a otra. El 75%
arranca en `sm`: por debajo, el panel ocupa todo lo que el relleno del fondo le deja, porque
tres cuartos de la pantalla de un móvil dejan la tabla de resultados en una columna
inservible. El alto es un **máximo** y no una altura fija —una búsqueda con dos resultados no
tiene por qué pintar un panel medio vacío— y va en `dvh`, no en `vh`, para que la barra del
navegador móvil no lo desborde. Sin tope superior: en un monitor muy ancho el panel crece con
la ventana, que es lo que se pidió.

Los contadores de cada apartado plegable pasaron a 32px de alto con `rounded-[16px]`, a
juego con el resto del diálogo. **No parecen tener 16px y los tienen**: el radio se recorta a
la mitad de la dimensión menor, y en una cápsula de 32px de alto esa mitad son justo 16px, así
que el resultado es una píldora. Para que se viera como un rectángulo redondeado habría que
subir la altura por encima de 32px, y un contador de dos cifras no lo justifica. Llevan
`min-w-10` porque van apilados y con el ancho ajustado al contenido el borde derecho de la
pila queda dentado; y el `<summary>` lleva `min-h-14` para que los apartados sin contador
—normas asociadas, correlativa CUOC— no queden más bajos que los demás.

El "¿ya estoy en el navegador?" que necesita el portal va con `useSyncExternalStore` y no
con el `useState(false)` + `useEffect(setMontado(true))` de costumbre: la regla
`react-hooks/set-state-in-effect` que trae la configuración de ESLint del proyecto lo
rechaza como error, no como aviso.

| Vista | Muestra |
|---|---|
| 1 · Resultados | Dos columnas: **Ocupación** (`cod_ocupacion_cno` + `nomb_ocupacion_cno`) y **Denominación** (`descr_denominacion_cno` unidas por el código). Cada fila es un `<button>` que abre la vista 2. Iba con una flecha «›» al final de cada fila; se quitó por petición del usuario, así que el único indicio visual de que la fila se puede pulsar es el cambio de fondo al pasar el ratón —el `<button>` y su `aria-label` siguen ahí, de modo que con teclado y con lector de pantalla no cambia nada |
| 2 · Detalle | Título `cod` + `nomb`; **Descripción** (`desc_ocupacion_cno`); **Ubicación en la estructura** (área de desempeño, nivel de cualificación, área ocupacional, campo ocupacional); **Ampliar información** (funciones, normas asociadas, denominaciones, ocupaciones relacionadas, habilidades, conocimientos, correlativa CUOC) |

Los cuatro apartados que el archivo maestro no puede llenar —área ocupacional, campo
ocupacional, normas asociadas y correlativa CUOC— se pintan con su rótulo y el aviso de que
no hay datos, en vez de omitirse: la estructura de la clasificación tiene que verse completa
y quien consulta necesita saber que ese apartado existe.

### 4. Capas tocadas

| Capa | Archivo | Qué |
|---|---|---|
| Datos (temporal) | `sitio-web/src/features/sitio-web/buscador-ocupaciones/lib/catalogo-cno-temporal.ts` | Nuevo. Lee los once JSON, indexa por `cod_ocupacion_cno` y resuelve las uniones |
| API | `sitio-web/src/app/api/ocupaciones/route.ts` | Nuevo. `GET ?q=` — búsqueda por código, nombre o denominación |
| API | `sitio-web/src/app/api/ocupaciones/[codigo]/route.ts` | Nuevo. `GET` — detalle con todas las uniones; 404 si no existe |
| Service | `…/services/buscador-ocupaciones.service.ts` | Reescrito: apunta a `/api/ocupaciones` (ruta relativa), sin `withCredentials` — el catálogo es público |
| Hooks | `…/hooks/use-buscador-ocupaciones.ts` | Reescrito: guarda el término consultado y protege contra respuestas fuera de orden |
| Hooks | `…/hooks/use-detalle-ocupacion.ts` | Nuevo |
| UI | `…/components/modal-ocupaciones.tsx` | Nuevo. Diálogo común: Escape, foco encerrado y devuelto, scroll bloqueado |
| UI | `…/components/resultados-ocupaciones.tsx` | Nuevo. Vista 1 |
| UI | `…/components/detalle-ocupacion.tsx` | Nuevo. Vista 2 |
| UI | `…/components/buscador-ocupaciones-view.tsx` | Orquesta banner + diálogo |
| UI | `sitio-web/src/shared/ui/molecules/ocupacion-search-banner.tsx` y `src/style/globals.css` | Clase `.olo-sin-boton-limpiar`: quita la «×» nativa del `input[type="search"]`, que se montaba sobre el botón de lupa. El `type` sigue siendo `search` —teclado móvil y lectores de pantalla—; lo que se quita es el adorno |
| Contratos | `…/types.ts`, `…/index.ts` | `ResultadoOcupacion`, `DetalleOcupacion`, `OcupacionRelacionada`. `lib/` **no** se reexporta: usa `fs` |

### 5. Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` en `sitio-web` | Sin errores |
| `npx eslint` sobre los archivos nuevos | Sin avisos |
| `GET /api/ocupaciones?q=alcalde` | 1 ocupación (`0011`), 15 denominaciones, `Alcalde` marcada como coincidente |
| `GET /api/ocupaciones?q=2141` | Encuentra por código |
| `GET /api/ocupaciones?q=diseno grafico` | Encuentra sin tildes: la normalización NFD funciona |
| `GET /api/ocupaciones/0011` | Descripción, área, nivel, 5 funciones, 15 denominaciones, 5 habilidades, 5 conocimientos |
| `GET /api/ocupaciones/0012` | 4 ocupaciones relacionadas — confirma la unión por `"Código de la ocupación - C.N.O."` |
| `GET /api/ocupaciones/9999` | 404 |
| `GET /clasificacion?tipo=cno` | HTTP 200 |
| Diálogo por encima de la cabecera | El usuario reportó el recorte en el navegador; se corrigió con `z-[2000]` + portal. **La corrección está sin confirmar visualmente** |
| `.olo-sin-boton-limpiar` llega al navegador | Sí: la clase aparece en el HTML de `/clasificacion` y las dos reglas `::-webkit-search-cancel-button` / `::-webkit-search-decoration` están en la hoja servida |
| Resto de la revisión visual del diálogo | **No se hizo por mi parte.** No hay Playwright ni Puppeteer en el proyecto y no se instaló nada por esto |

> **Aviso 1 — `data_temporal/` no está versionada ni se despliega.** Vive fuera de `public/`
> y fuera de `src/`, sin seguimiento en Git. En cuanto el sitio se construya en Docker sin
> copiar esa carpeta, los dos endpoints responden 500 con `[api/ocupaciones] No se pudo leer
> el catálogo CNO temporal` en el log. Es deliberado: el origen definitivo es la base de
> datos.

> **Aviso 2 — el nivel de cualificación que se muestra es el que trae el archivo, y está
> mal en origen.** La hoja `nivel_cualificacion` tiene en `nombre_cualificacion_cno` los
> nombres de las **áreas de desempeño** (Dirección y Gerencia, Finanzas y Administración…),
> no los de los niveles; por eso el nivel `0` describe "Ocupaciones de direccion y gerencia".
> La unión es correcta —`ocupaciones.cod_cualificacion_cno` → `nivel_cualificacion`—; lo que
> está descuadrado es la hoja. Además, las 611 ocupaciones solo usan seis códigos de nivel
> (0–4 y 6) de los diez que define la tabla. Antes de conectar el catálogo real hay que
> pedir la hoja corregida.

> **Aviso 3 — hay una columna duplicada en `ocupaciones`.** La hoja trae dos columnas
> llamadas `cod_cualificacion_cno`; el volcado renombró la segunda a `cod_cualificacion_cno.1`
> y **contiene un nombre, no un código**. La unión usa la primera. Si alguien reordena el
> Excel, ese `.1` cambia de sitio en silencio.

### 6. Pendiente al cierre

- **El módulo de ocupaciones en `api-backend/`.** Migración, modelos, repositorio y
  `/api/ocupaciones`. Hecho eso, `app/api/ocupaciones/*/route.ts` pasa a `proxyToBackend` y
  `lib/catalogo-cno-temporal.ts` se borra.
- **Los cuatro apartados vacíos.** Área ocupacional, campo ocupacional, normas asociadas y
  correlativa CUOC no tienen tabla de origen en el archivo maestro. Hay que pedir esas hojas
  o decidir que no van.
- **CUOC.** `/clasificacion?tipo=cuoc` sigue mostrando el mismo buscador que `?tipo=cno`; el
  `tipo` solo cambia la ruta de navegación. Cuando exista el catálogo CUOC habrá que filtrar
  por él.
- **Filas no activas.** Se descartan las 21 ocupaciones, 380 denominaciones y 52 funciones
  con `activa_* = false`, por ser material retirado de la clasificación. Si el negocio
  quiere consultarlas, es un filtro en `cargarCatalogo()`.
- **Sin caché HTTP.** Los dos endpoints van con `dynamic = 'force-dynamic'`. Para el
  catálogo real conviene `cache.middleware.ts` o `revalidate`: es contenido público que
  cambia una vez al año.

---

## sesión 08-09-2026: el paquete local se quedó congelado en `node_modules`, y tres avisos de npm

Encargo: arreglar un `Build Error` de `sitio-web` y cerrar los tres avisos de seguridad
(2 altos, 1 crítico) que salían al instalar en las dos apps.

### 1. El error: un export que sí existía

El mensaje era desconcertante porque señalaba a algo cierto y falso a la vez:

```
Export ResaltadorDeBusqueda doesn't exist in target module
  ./sitio-web/src/shared/ui/atoms/ResaltadorBusquedaClient.tsx
  → sitio-web/node_modules/@olo/blocks-renderer/src/index.ts
```

`packages/blocks-renderer/src/index.ts` **sí** exporta `ResaltadorDeBusqueda`. Lo que no lo
exportaba era la copia dentro de `node_modules`, y esa es la que lee el compilador: fíjese en
que la ruta del error no es la del paquete, es la de la copia.

La causa está en el `.npmrc` de cada app, con `install-links=true`. Esa opción se puso a
propósito —en Windows, sin modo desarrollador, npm no puede crear el symlink de un
`file:../packages/*` y deja la carpeta vacía—, pero tiene un efecto que hasta ahora no había
mordido: npm **copia** el paquete en lugar de enlazarlo, y solo vuelve a copiarlo cuando
cambia la versión declarada. `@olo/blocks-renderer` sigue en `0.1.0` desde siempre, así que
npm da el árbol por bueno y responde `up to date` sin mirar el contenido.

Resultado: la copia se quedó fija en el 03-09 mientras el paquete seguía creciendo. Le
faltaba entera la carpeta `src/busqueda/` (el `ResaltadorDeBusqueda` y `busqueda-scroll`) y
tenía versiones viejas de `index.ts` y `controles-de-caja.tsx`. Por eso `npm install
../packages/blocks-renderer` no arreglaba nada: para npm no había nada que hacer.

No era solo `blocks-renderer` ni solo `sitio-web`. También estaba desfasado
`@olo/accessibility-policy`, y ambas apps tenían las dos copias viejas.

**Arreglo:** borrar `node_modules/@olo` y reinstalar, en `sitio-web` y en `intranet`. Al no
existir la carpeta, npm se ve obligado a copiar de nuevo desde `packages/`.

### 2. Los tres avisos de npm

Ninguno venía de código propio; los tres entran por dependencias de Next.

| Paquete | Aviso | Cómo entra |
|---|---|---|
| `next` 16.3.0 | **crítico**, dos avisos: ejecución remota de código sin autenticar en servidores Windows (recorrido de rutas, CVSS 9.0) y otra por la API de optimización de imágenes al procesar archivos AVIF | directa |
| `sharp` <0.35.4 | **alto**, desbordamiento de memoria en `libheif` al decodificar HEIF/AVIF | transitiva, vía `next` |
| `js-yaml` 4.0.0–4.3.1 | **alto**, denegación de servicio: `maxTotalMergeKeys` no frena el consumo de CPU cuando las claves de fusión vienen vacías | transitiva |

Los dos primeros son la misma historia contada dos veces: el decodificador de AVIF. `next`
optimiza imágenes con `sharp`, `sharp` decodifica AVIF/HEIF con `libheif`, y una imagen
preparada a mano puede corromper memoria ahí. El aviso crítico de Windows además nos toca de
cerca, porque el desarrollo se hace justamente en Windows.

**Arreglo:** `npm audit fix` **sin** `--force`. Los tres parches caen dentro del rango que ya
declara `package.json` (`next: ^16.3.0` → 16.3.4, `sharp` → 0.35.4), así que no hay cambio de
versión mayor ni nada que reescribir a mano. Se usó la versión sin `--force` a conciencia,
por lo que pasó el 04-09 en `api-backend`: `--force` autoriza a npm a *retroceder* versiones
y allí degradó Sequelize tres mayores.

### 3. La automatización, para que no vuelva a pasar

Reinstalar a mano cierra el incidente pero no la causa: el mismo despiste vuelve con la
siguiente edición de `packages/`. Se añadió **`scripts/sincronizar-paquetes-locales.mjs`**,
enganchado como `predev` y `prebuild` en las tres apps.

Compara el **contenido real** de cada paquete con el de su copia —sha1 archivo a archivo— y
solo si difieren borra `node_modules/@olo` y reinstala. Se descartó la alternativa de guardar
una huella en un archivo de estado: comparar de verdad acierta también tras un `git pull`, un
cambio de rama o un borrado manual de `node_modules`, y no hay estado que se desincronice.
Cuando todo coincide cuesta unos 130 ms y no imprime nada.

Tres detalles que no son adorno:

- **Los enlaces se quitan con `unlink`, nunca con borrado recursivo.** En Linux, o en Windows
  con modo desarrollador, esas entradas son symlinks a `packages/`: un `rm -rf` los seguiría
  y borraría el código fuente del repositorio.
- **Avisa, pero no compila, cuando `dist/` está más viejo que `src/`.** Cinco de los siete
  paquetes se consumen por `dist/`, y ahí una copia vieja **no** da error: la app arranca y
  ejecuta la lógica anterior, que es mucho peor que un fallo ruidoso. No se compila solo
  porque `dist/` está en `.gitignore` y haría falta instalar antes las dependencias del
  paquete; el aviso lleva el comando exacto.
- **Comprueba que la reinstalación sirvió.** Si tras reinstalar la copia sigue sin coincidir,
  sale con error en vez de dejar arrancar la app contra la copia vieja.

En Docker no debe correr: el Dockerfile ya deja la copia buena compilando los `dist/` y
repitiendo `npm ci`, y un `npm install` ahí dentro tocaría el `package-lock` y rompería el
determinismo de `npm ci`. Los tres Dockerfiles fijan `OLO_SKIP_SYNC=1`, y además copian
`scripts` a `/scripts` —la misma razón por la que `packages` va a `/packages`: npm resuelve
las rutas relativas desde `/app`—, porque sin el archivo `node ../scripts/...` abortaría el
build de la imagen aunque el interruptor esté puesto.

### Qué se modificó
- **`scripts/sincronizar-paquetes-locales.mjs`** — nuevo, sin dependencias.
- Los tres `package.json` (`sitio-web`, `intranet`, `api-backend`): `sync:paquetes` para
  lanzarlo a mano, más `predev` y `prebuild` que lo llaman.
- Los tres `Dockerfile`: `COPY scripts /scripts` y `ENV OLO_SKIP_SYNC=1` antes del
  `RUN npm run build`.
- Los dos `package-lock.json` de las apps web: 10 paquetes actualizados en cada una
  (`next` 16.3.0 → 16.3.4, `sharp` → 0.35.4, `js-yaml` → 4.3.2, y sus arrastres).
- **Ningún `package.json` cambió por el parcheo de seguridad**, y esa es la señal de que fue
  limpio: `^16.3.0` ya admitía 16.3.4, así que no hubo que ampliar ningún rango.
- No se tocó ningún archivo de código de las apps. El error de compilación no estaba en el
  código.

### Verificación
- `npm run build` correcto en `sitio-web`. Se comprobó con el build completo y no solo con
  `tsc --noEmit` (que también pasa limpio) porque el error original lo daba el empaquetador
  al resolver el módulo, no el chequeo de tipos: son dos cosas distintas.
- `npm audit` en las dos apps: `found 0 vulnerabilities`.
- `src/busqueda/` presente en las dos copias de `node_modules`, y `diff -rq` contra
  `packages/` sin diferencias en `blocks-renderer` ni en `accessibility-policy`.
- El script se probó en los cuatro casos, no solo en el bueno: sin cambios (calla, 130 ms);
  con `api-backend` de verdad desfasado (detectó `@olo/accessibility-policy` y lo arregló);
  con una edición inventada en `packages/blocks-renderer/src/index.ts` y revertida después
  (detectó los dos sentidos del cambio); y con `OLO_SKIP_SYNC=1` (sale sin hacer nada).
- La prueba de punta a punta fue un `npm run build` real de `sitio-web` con `packages/`
  editado: el `prebuild` saltó, resincronizó y el build terminó correcto.
- `git status packages/` limpio al acabar: las ediciones de prueba no quedaron en el árbol.

### Pendiente
- `api-backend` tenía **también** su copia de `@olo/accessibility-policy` desfasada, y salió a
  la luz al probar el script. Conviene mirar si algo de lo que se dio por probado allí corrió
  contra la versión vieja.
- No se ejecutó `next build` completo en `intranet`; sigue en pie el fallo de type check en
  `Carousel.tsx` / `SeccionCarrusel.tsx` anotado el 04-09.
- Los `Dockerfile` se modificaron pero **no se construyó ninguna imagen** para comprobarlo: no
  se probó `docker compose build`. El cambio son dos líneas por archivo y sigue el patrón que
  ya usaba `COPY packages /packages`, pero conviene confirmarlo en el próximo despliegue.

---

## sesión 04-09-2026 (7.ª parte): `npm audit fix --force` había degradado Sequelize tres versiones mayores

Encargo: corregir el resultado de un `npm audit fix --force` ejecutado en `api-backend`.
Lo que ese comando dejó no era un arreglo: era una regresión mucho más grave que las
vulnerabilidades que decía cerrar.

### 1. El daño: de Sequelize 6 a Sequelize 3

`--force` autoriza a npm a resolver avisos **retrocediendo** versiones. Aquí bajó
`sequelize` de `^6.37.5` a `^3.30.0` —tres versiones mayores hacia atrás, una librería
de 2016— y lo escribió en `package.json`. Sequelize 3 no tiene la API que usa todo el
backend, así que el proyecto habría dejado de arrancar por completo.

Y ni siquiera resolvía nada: el informe de vulnerabilidades que quedó a la vista
(`lodash` crítico, `validator`, `dottie`) **lo causaba la propia degradación**, porque
Sequelize 3 arrastra `lodash` 3.x y `validator` 3.x, que llevan años sin parches. El
comando fabricó los agujeros que después informaba.

`package-lock.json` del repositorio ya tenía la versión correcta y parcheada,
`sequelize@6.37.8`. Bastó con devolver ambos archivos a su estado publicado
(`git checkout --`) y reinstalar para deshacerlo.

### 2. Lo que había de verdad, una vez restaurado

Con Sequelize 6 de vuelta el informe real eran cuatro avisos, ninguno crítico:

| Paquete | Aviso | Cómo entra |
|---|---|---|
| `fast-uri` 3.1.5 | confusión de anfitrión y SSRF (alta) | transitiva |
| `qs` 6.15.3 | dos formas de denegación de servicio (media) | transitiva |
| `uuid` 8.3.2 | falta de chequeo de límites en v3/v5/v6 (media) | vía `sequelize` |

Los dos primeros los cierra `npm audit fix` **sin** `--force`: son actualizaciones de
parche que no tocan ninguna versión mayor. Quedaron en `fast-uri` 3.1.7 y `qs` 6.16.0.

### 3. El caso de `uuid`, que es el que tienta a usar `--force`

Para `uuid` npm no ofrece camino limpio: su única propuesta era, otra vez, bajar
`sequelize` a 3.30.0. La trampa está en que **el aviso ni siquiera es alcanzable aquí**:
el fallo aparece al pasar un búfer propio a `uuid.v3/v5/v6`, y Sequelize solo llama a
`v1()` y `v4()` sin argumentos, en cinco puntos del generador de consultas.

Se resolvió con un `overrides` acotado en `package.json`, que fuerza `uuid` a `^11.1.1`
solo dentro de Sequelize. Se comprobó antes que `uuid` 11 conserva los exports de
CommonJS (`require('uuid').v1` y `.v4`) que Sequelize necesita: v9 quitó el export por
defecto, pero no los nombrados, que son los únicos que se usan.

`uuid` es dependencia de un solo paquete en todo el proyecto, así que el override no
alcanza a nada más.

### Qué se modificó
- `api-backend/package.json`: se revirtió `sequelize` a `^6.37.5` y se añadió el bloque
  `overrides` para `uuid`. Cinco líneas nuevas; nada más cambió.
- `api-backend/package-lock.json`: tres subidas transitivas —`fast-uri` 3.1.5 → 3.1.7,
  `qs` 6.15.3 → 6.16.0, `uuid` 8.3.2 → 11.1.1—. `sequelize` sigue en 6.37.8.

### Decisiones
- **No usar `--force` en este proyecto.** No es una versión más agresiva del arreglo: es
  permiso para retroceder versiones mayores, y con dependencias antiguas eso suele
  empeorar el recuento de vulnerabilidades en vez de bajarlo, además de romper el código.
- **Override acotado a `sequelize`, no global.** Escrito como `{ sequelize: { uuid } }`
  y no como `{ uuid }`, para que si mañana entra otro paquete que dependa de `uuid` no
  se le imponga una versión mayor por la puerta de atrás.
- **Se subió `uuid` aunque el fallo no fuese explotable.** Costaba un override y una
  comprobación; dejar el aviso abierto obliga a volver a razonarlo en cada revisión.

### Verificación
- `npm audit`: **0 vulnerabilidades**.
- `npm run typecheck` correcto en `api-backend`.
- Prueba de humo de las rutas que tocan `uuid` dentro de Sequelize: se generaron
  identificadores con `DataTypes.UUIDV4` y `DataTypes.UUIDV1` como valor por defecto de un
  modelo, y un identificador de transacción con `generateTransactionId()`. Los tres
  devuelven UUID válidos con `uuid` 11.
- Generación de SQL correcta (`selectQuery` con un `Op.eq`), para descartar que el
  override rompiera el generador de consultas.

### Pendiente
- Los cambios están en el árbol de trabajo, **sin commitear**.
- `npm audit` en el resto de espacios del monorepo (`intranet`, `sitio-web`, `packages`):
  esta revisión solo cubrió `api-backend`.
- Al actualizar Sequelize en el futuro, revisar si ya declara `uuid` 11 o superior y
  retirar entonces el `overrides`, que es un parche y conviene que no se quede fósil.

---

## sesión 04-09-2026 (7.ª parte): «entro al panel y no carga nada» — el middleware no verificaba la firma

Reporte: con los tres servicios en `npm run dev`, el panel administrativo dejaba entrar
pero no cargaba usuarios ni auditoría, y en el sitio aparecía «Editar» pero no «Eliminar»
ni «Nueva sección». Se sospechaba de la base de datos.

No era la base. Reproducido de punta a punta: la API respondía `/health` 200, los
secretos coincidían entre las tres aplicaciones, sin credenciales devolvía 401 y con una
sesión buena entregaba los datos. El fallo estaba en cómo el frontend decide que hay
sesión.

### 1. Dos fuentes de verdad que se separan

El login emite cuatro cookies con el mismo vencimiento: `sitio_token` (HttpOnly, la
sesión real, la valida la API) y `sitio_role` / `sitio_userName` / `sitio_userEmail`
(legibles por JavaScript, con las que se pinta la interfaz).

El middleware daba la sesión por buena con `decodeJwt` —**descodifica sin comprobar la
firma**— y solo miraba el `exp`. Cuando la API dejaba de aceptar el token, el middleware
seguía viéndolo vigente: el caparazón del panel se pintaba, y cada petición de datos
recibía un 401 que **nadie manejaba** (no había una sola rama de 401 en
`features/administracion`). De ahí la pantalla muda.

La asimetría de los botones es el mismo fallo visto de lado: «Editar» se decide con la
cookie de rol —sigue ahí— y «Eliminar»/«Nueva sección» preguntan los permisos a la API
—401—. Lo dice el propio comentario de `nueva-seccion-button.tsx`: *«`secciones.crear` no
está en ninguna cookie»*.

### 2. El agujero de seguridad que había debajo

Como no se comprobaba la firma **y** el rol se leía de `sitio_role` —cookie no HttpOnly,
que el usuario edita—, se probó contra la instancia local con un token de firma basura:

| Prueba | Antes | Ahora |
|---|---|---|
| `/admin/users` con token forjado + `sitio_role=Superadmin` | **200** | 307 → login |
| `/admin/auditoria` ídem | **200** | 307 → login |
| intranet `/inicio` con token **sin `exp`** | **200** | 307 → login |
| API `/api/users` con ese token | 401 | 401 |

La API nunca entregó un dato —es quien de verdad autoriza y aguantó—, pero el control de
acceso a las pantallas era decorativo: un Editor podía abrir usuarios y auditoría
editando una cookie. La intranet tenía además `if (!decoded.exp || ...)`, que daba por
válido un token **sin caducidad**.

> **La razón que justificaba `decodeJwt` ya no existía.** El comentario decía «sin
> requerir JWT_SECRET en frontend», pero `JWT_SECRET` sí está disponible en las dos
> aplicaciones: lo declaran sus `.env.local` y lo inyectan los dos compose.

### 3. Qué se hizo

| Archivo | Cambio |
|---|---|
| `sitio-web/src/shared/lib/verificar-sesion.ts` · `intranet/…/verificar-sesion.ts` | **Nuevos.** `jwtVerify` con firma; exigen `exp`; **fallan cerrado** si no hay `JWT_SECRET` |
| `sitio-web/src/middleware.ts` | Verifica firma; el rol sale del **token verificado**, no de la cookie; al invalidarse borra **todas** las cookies y añade `motivo=sesion-expirada` |
| `intranet/src/middleware.ts` | Ídem; se elimina el `!decoded.exp` que admitía sesiones eternas |
| `sitio-web/src/shared/lib/auth-cookies.ts` | Lista única `AUTH_COOKIES` + constantes del motivo |
| `sitio-web/src/shared/lib/api-client.ts` | Era un **stub que devolvía `null`**. Ahora cliente real: 401 → cierra y va al login; 403 → se marca `sinPermiso` y **no** redirige |
| `…/auth/logout/route.ts` | Usa la lista única: le faltaban `sitio_userEmail` y `sitio_refreshToken` |
| `use-usuarios.ts`, `auditoria.service.ts`, `paginas.service.ts` | Pasan por el manejo central; en páginas públicas se cierra sesión **sin** redirigir |
| `mensaje-de-cierre.ts` | Mensaje para `sesion-expirada`, por la vía segura que ya filtraba motivos |
| `config/index.ts`, `.env`, `api-backend/.env`, ambos compose, `login/route.ts` | Sesión de **7 días → 8 horas** |

**Por qué el 403 no redirige.** 401 es «no sé quién eres» y se arregla volviendo a
entrar; 403 es «sé quién eres y esto no te toca», que no se arregla entrando otra vez —
mandar al login ahí crea un bucle. Es el criterio que `auditoria.service.ts` ya aplicaba.

**Por qué 8 horas y no menos.** `@olo/inactividad` ya cierra a los 15 minutos sin
actividad; los 7 días no eran el tiempo de trabajo sino el tiempo que un token robado
seguía sirviendo. 8 h es el techo de la jornada y no se nota en el uso diario.

### Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en las tres aplicaciones | limpio |
| Token forjado contra `/admin/users`, `/admin/auditoria`, `/admin/dashboard` | 307 → login (antes 200) |
| Token sin `exp` contra la intranet | 307 → login (antes 200) |
| Login legítimo por sitio-web | 200 |
| `/api/users`, `/api/audit-logs`, `/api/permissions`, `/api/roles` con sesión buena | 200 |
| `/admin/users`, `/admin/auditoria` con sesión buena | 200 |
| Intranet con token real / sin token | 200 / 307 → login |
| `Max-Age` de la cookie de sesión | 28800 (8 h) |

### Pendiente al cierre

- **El API en marcha sigue emitiendo tokens de 7 días.** Cargó su `.env` al arrancar y no
  lo ha releído: la cookie ya dura 8 h pero el token no. No es inseguro de inmediato —la
  cookie caduca antes, así que el navegador deja de mandarlo— pero **hasta reiniciar el
  proceso el token robado sigue valiendo una semana**.
- **No se comprobó en un navegador real.** Todo se verificó con `curl` sobre el stack
  vivo: falta ver el aviso «Tu sesión expiró» pintado en el login y la redirección
  ocurriendo desde una pantalla del panel.
- **Solo se migraron al cliente común los servicios del síntoma** (usuarios, auditoría,
  permisos de sección). Los demás de `features/administracion` —dashboard, respaldos,
  mi-perfil, alertas de caducidad— siguen con su `fetch` propio y sin manejo de 401.
- **La intranet no tiene el equivalente del cliente común.** Se le arregló el middleware,
  no el manejo de 401 en sus pantallas.
- `NEXT_PUBLIC_INTRANET_URL` y `NEXT_PUBLIC_INTRANET_EDITOR_URL` las lee `sitio-web` pero
  **no las define ninguna configuración**: caen siempre a `localhost:3001`, el mismo
  fallo silencioso que se corrigió en `SITE_URL` en la 6.ª parte. Quedó sin tocar.

---

## sesión 04-09-2026 (6.ª parte): la API no arrancaba tras el merge — y no era culpa del merge

Encargo: revisar si el merge de `main` (`cd70e7e`) rompió algo, cruzando los cambios
propios contra los que ya estaban publicados. La revisión encontró la API **caída**, más
dos fallos que el merge no causó pero que estaban tapados.

### 1. El bloqueante: `aprobar` pedía algo que su caso de uso no devolvía

`pagina.controller.ts` (líneas 307-308) leía `result.versionAnterior`, y
`aprobar-pagina.usecase.ts` devolvía solo `{ pagina, version, versionArchivada }`. Bajo
`ts-node` —el modo de la pila de desarrollo— eso no es un aviso: el módulo no compila y
el proceso muere al cargar. `nodemon` quedaba en «app crashed» y `/health` no respondía.

**El merge no lo introdujo.** Los dos archivos son byte a byte idénticos a los del lado
publicado (`git hash-object` de `cd70e7e:<archivo>` contra `cd70e7e^2:<archivo>`), y
ninguno de los dos aparece entre los cambios propios. Llegó ya roto desde `main`.

**El arreglo va en el caso de uso, no en el controlador.** Los otros tres pasos del ciclo
editorial —`guardar-borrador`, `enviar-a-revision`, `rechazar-pagina`— devuelven
`{ …, paginaAnterior, versionAnterior }`. `aprobar-pagina` **calculaba las dos copias**
(líneas 13 y 17) y no las devolvía: era el único fuera del patrón, y el controlador
estaba escrito dando por hecho que el patrón se cumplía.

> **Se descartó** cambiar el controlador a `result.versionArchivada`, que era lo primero
> que parecía. `versionArchivada` es la versión que **estaba publicada antes** y pasa a
> archivada: su `estado` es el de *otra* versión. La bitácora habría registrado
> «antes: publicado/archivado» donde la verdad es «antes: en_revision» — el estado de la
> versión que se aprueba, que solo conserva el `toJSON()` tomado antes de mutarla.

### 2. `migrate:status` mentía: decía «sin pendientes» habiendo dos

La renumeración de la migración de política de privacidad (`022` → `023`, por colisión
con la `022-auditoria-guardar-borrador` que traía `main`) estaba **bien hecha**: el
`nombre` interno se actualizó junto con el archivo, que es lo que se suele olvidar.

Lo que engañaba era la comprobación. El servicio `migraciones` **no está en
`docker-compose.override.yml`**, así que no recibe el código montado: corre desde la
imagen, y la imagen construida antes del merge solo conocía hasta `021`. Con todo lo que
ella conocía ya aplicado, respondía «Sin migraciones pendientes». Reconstruida la imagen,
aparecieron las dos reales.

### 3. `SITE_URL` leía una variable que no define nadie

`intranet/src/shared/lib/constants.ts` leía `NEXT_PUBLIC_SITE_URL`. Los dos compose
inyectan `NEXT_PUBLIC_SITIO_WEB_URL`. Ese nombre no aparece en ningún compose, Dockerfile
ni `.env` —solo en `3-seguridad-del-proyecto.md`—, así que `SITE_URL` caía **siempre** al
valor por defecto. En desarrollo coincide con el bueno y el fallo pasaba inadvertido; en
producción el enlace «Regresar al sitio web del Observatorio» habría mandado a cada
visitante al `localhost` de su propia máquina.

De paso, los dos enlaces de privacidad del login de la intranet eran relativos
(`/politica-de-privacidad`, `/privacidad`): rutas que la intranet no tiene, así que el
middleware devolvía al propio login del que se venía. Ahora salen al portal público por
`SITE_URL`. Preexistentes los dos: ya estaban así en el merge-base.

### Capas tocadas

| Archivo | Qué cambió |
|---|---|
| `api-backend/src/use-cases/paginas/aprobar-pagina.usecase.ts` | Devuelve `paginaAnterior` y `versionAnterior`, como los otros tres del ciclo |
| `intranet/src/shared/lib/constants.ts` | `NEXT_PUBLIC_SITE_URL` → `NEXT_PUBLIC_SITIO_WEB_URL` |
| `intranet/src/features/login/components/LoginView.tsx` | Los dos enlaces de privacidad salen al portal por `SITE_URL` |
| `intranet/Dockerfile` | `ARG`/`ENV NEXT_PUBLIC_SITIO_WEB_URL` antes del `npm run build` |
| `docker/docker-compose.yml` · `docker-compose.prod.yml` | La misma variable como `build.args`, no solo como entorno |

> **La trampa que cuesta tiempo:** `NEXT_PUBLIC_*` se incrusta en el bundle **al
> compilar**. Ponerla solo en `environment:` llega tarde — el bundle ya se compiló con el
> valor por defecto. Por eso va también en `build.args`, igual que la `NEXT_PUBLIC_API_URL`
> de sitio-web, que ya lo documentaba en su comentario.

### Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` api-backend | limpio (antes: 2 × TS2339) |
| `tsc --noEmit` intranet | limpio |
| `migrate:status` con imagen reconstruida | `Pendientes (2)` — antes mentía con «ninguna» |
| `npm run migrate` | aplicadas `022-auditoria-guardar-borrador` y `023-permiso-politica-privacidad-sitio` |
| `editar.sitio.politica-de-privacidad` en BD | existe, con 3 roles (Superadmin, Administrador, Editor) |
| API `/health` | 200 (antes: sin respuesta) |
| sitio `/politica-de-privacidad` · `/privacidad` | 200 · 307 → 200 |
| intranet `/login` | 200, y el `href` renderiza `http://localhost:3000/politica-de-privacidad` |

### Pendiente al cierre

- **El fallo del controlador vive también en `main`.** Aquí quedó corregido, pero como
  llegó desde publicado conviene que el arreglo suba, o el siguiente que integre `main`
  se encuentra la API caída otra vez.
- **`migraciones_aplicadas` tiene una fila huérfana**: `022-permiso-politica-privacidad-sitio`,
  el nombre anterior a la renumeración. No corresponde a ningún archivo y no molesta al
  runner —solo compara contra los nombres del código—, pero está de más. Solo afecta a
  esta máquina; una instalación nueva no la tiene.
- **El flujo de aprobación no se ejerció de punta a punta.** Se comprobó que compila,
  arranca y responde, no que la bitácora de un `aprobar` real registre ahora
  `antes: en_revision`. Hace falta una sesión con permisos y una página en revisión.
- **El build de producción de la intranet no se corrió** con el `ARG` nuevo: se verificó
  en la pila de desarrollo, donde `next dev` lee la variable del entorno del contenedor.
- Los dos enlaces del login apuntan ahora a la **misma** página («política de privacidad»
  y «protección de datos»). Es lo que ya ocurría de hecho —`/privacidad` redirige a
  `/politica-de-privacidad`—, pero si se quieren dos destinos distintos hay que crear la
  segunda página; es decisión de contenido, no técnica.

---

## sesión 04-09-2026 (5.ª parte): entrada corta para los cuatro botones flotantes, en las dos apps

Pregunta del usuario, a raíz de la parte anterior: por qué «Editar sección»
"no se recarga como los otros botones" al recargar la página. Respuesta (no
es por permisos — el suyo se resuelve en el servidor, es el más fiable de
los cuatro): al vivir dentro de `RouteTransition` (única forma de que su
permiso, calculado por página, llegue server-side), se desvanece con la
animación de esa página; los otros tres, al vivir en el layout compartido de
sitio-web, aparecen de golpe en cuanto resuelve la comprobación del cliente.
Se ofrecieron dos salidas (igualarlo a los demás perdiendo su ventaja de
venir listo en el HTML inicial, o dejarlo así) y el usuario pidió una
tercera: que los cuatro tengan una animación de aparición corta, en sitio-web
y en intranet.

### Qué se añadió

Un `@keyframes olo-boton-flotante-aparece` (opacidad 0→1 + `translateY(6px)→0`,
180ms `ease-out`, `both`) aplicado directamente a `.edit-button` en el CSS
global de las dos apps — cubre las cuatro variantes (`--plantilla`, `--nueva`,
`--eliminar` heredan de la clase base). El `transform` va en el propio botón,
no en un contenedor que lo envuelva: la lección de la parte 4.ª era que un
`transform` en un **antepasado** de un `position: fixed` rompe su anclaje al
viewport, pero estos botones no tienen descendientes `position: fixed`
propios, así que animarse a sí mismos con `transform` es seguro — no hay
ningún *containing block* que puedan corromper. `prefers-reduced-motion:
reduce` la apaga, mismo criterio que ya usa `.olo-route-transition`.

En sitio-web esto **suaviza además un salto que ya existía**: «Menú y pie»,
«Nueva página» y «Eliminar página» aparecían de golpe en el DOM en cuanto
`usePermisoDeSeccion`/la cookie de rol resolvían, sin ninguna transición — la
animación nueva los hace entrar igual de suave que a «Editar sección». En
intranet los cuatro botones ya se resolvían juntos en el servidor
(`(secciones)/layout.tsx`), así que ahí el cambio es puramente estético: entran
los cuatro a la vez, con el mismo desvanecido corto.

### Verificación

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` e `intranet` | Limpio en las dos |
| `getComputedStyle(...).animationName` en los 4 botones de `/politica-de-privacidad` (sitio-web) | Los 4 llevan `olo-boton-flotante-aparece`, `0.18s` |
| Posición (`getBoundingClientRect`) de los 4 botones tras el cambio, sitio-web e intranet | Sin cambios respecto a la parte 4.ª — misma pila, sin solaparse |

---

## sesión 04-09-2026 (4.ª parte): «Editar» pasa a «Editar sección», y un `transform` en `RouteTransition` lo tenía mal anclado

Pedido: renombrar el botón «Editar» de sitio-web a «Editar sección» (para que
coincida con el texto que ya usa intranet) y confirmar que queda por debajo
del botón «Menú y pie» en la pila de botones flotantes.

### El renombrado

`sitio-web/src/features/paginas/components/edit-button.tsx`: `<span>Editar</span>`
→ `<span>Editar sección</span>`, y `title`/`aria-label` de "Editar esta página" a
"Editar esta sección", igual que ya dice `intranet/.../edit-button.tsx`.

### El bug que apareció al verificar la posición

El pedido de "que quede debajo de Menú y pie" ya lo cumplía el CSS
(`.edit-button` tiene `bottom: 1.5rem`, menor que los `4.6rem` de
`.edit-button--plantilla` — más cerca del borde inferior es más abajo en
pantalla). Pero al medir la posición real con Playwright, el botón «Editar
sección» aparecía en un punto **distinto en cada página** (a 3478px del tope en
`/inicio`, a 1630px en `/politica-de-privacidad`), mientras los otros tres
botones coincidían pixel a pixel en las dos.

Causa: `EditButton` es el único de los cuatro que se monta **dentro** de
`{children}` de `(public)/layout.tsx` (lo pinta cada `page.tsx`, no el layout
compartido — a propósito, porque su permiso se resuelve en el servidor por
página, ver el comentario del propio archivo). `{children}` pasa por
`<RouteTransition>`, cuyo `.olo-route-transition` tiene una animación de
entrada con `transform: translateY(...)`. Con `animation-fill-mode: both` ese
`transform` se queda puesto —como `translateY(0)`, que **no** es `none`— para
siempre, no solo mientras anima. Cualquier `transform` en un antepasado
convierte a ese antepasado en el *containing block* de sus descendientes
`position: fixed`: el botón dejó de anclarse a la ventana y pasó a anclarse al
alto de esa página, que es justo lo que explica que variara según el
contenido. Confirmado con `getComputedStyle(...).transform` → `matrix(1,0,0,1,0,0)`
en reposo, no `none`.

**Arreglo:** `sitio-web/src/style/globals.css`, `@keyframes olo-route-in`
—`transform: translateY(8px) → translateY(0)`, cambiado a
`margin-top: 8px → 0`. Mismo efecto visual de deslizamiento al entrar, sin
`transform`, así que ya no atrapa ningún `position: fixed` de dentro. Afecta a
`RouteTransition` entero (toda transición de página), no solo a este botón —
era la única forma de arreglarlo sin convertir `EditButton` en un componente
de cliente con portal, que habría sacrificado que se pinte en el HTML inicial
(la razón por la que hoy es un Server Component, ver su propio comentario).

### Verificación

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` | Limpio |
| Playwright, sesión real de Superadmin, `/inicio` y `/politica-de-privacidad`: posición (`getBoundingClientRect`) de los 4 botones | Idéntica en las dos páginas, sin solapar: Eliminar página (505–547) → Nueva página (555–597) → Menú y pie (606–646) → **Editar sección (656–696)**, de arriba a abajo |
| Texto del botón | «Editar sección» en las dos páginas |

### Pendiente al cierre

- Sigue sin probarse con una sesión real de Administrador o Editor (arrastrado
  de las partes 2.ª y 3.ª de hoy).
- No se revisó si `.olo-route-transition` se usa también en `intranet` con el
  mismo patrón de `transform` + `fill-mode: both` — si comparte el componente
  o el CSS, podría tener el mismo bug latente ahí. No se tocó porque no se
  pidió y no se confirmó que exista.

---

## sesión 04-09-2026 (3.ª parte): «Eliminar sección» ya no distingue páginas de fábrica

Pedido explícito, tras confirmar el riesgo: que «Eliminar sección/página» aparezca en
**todas** las páginas, incluidas las de fábrica (`inicio`, `menu-y-pie`,
`politica-de-privacidad` en sitio-web; las 5 de intranet), en las dos apps.

### Qué se quitó

La guarda «nunca una sección de fábrica» tenía tres capas, ahora en dos:

- **Backend** (`api-backend/src/use-cases/paginas/eliminar-seccion.usecase.ts`, **compartido
  por las dos apps** — es ambito-agnóstico): se quitó la rama `esSeccionDeFabrica(...)` de
  `analizarEliminacion` y el `throw` correspondiente en `eliminarSeccion`. El motivo
  `'de-fabrica'` desapareció del tipo `AnalisisDeEliminacion` (ahora solo
  `'tiene-enlaces' | null`) — se actualizó también en los dos clientes tipados
  (`sitio-web/.../paginas.service.ts`, `intranet/.../paginas.api.ts`).
- **Frontend** (`eliminar-seccion-button.tsx` en las dos apps): se quitó el filtro
  `esSeccionDeFabrica(slug)` que ocultaba el botón, y la rama muerta del diálogo que
  explicaba «es una página del sistema».
- **`esSeccionDeFabrica`/`SLUGS_DE_FABRICA` del *frontend*** (`puck.config.tsx` de las dos
  apps) quedaron sin ningún consumidor — se borraron enteros, no solo la llamada. (La
  versión del *backend*, en `catalogo-permisos.ts`, sigue viva: la usa
  `esSeccionConocida()` para otra cosa —el portón del editor—, ajena a esto.)

Lo que **no** se tocó: la guarda de «nada puede estar enlazando a la ruta»
(`buscarEnlacesA`) y la de «hay que teclear el título» siguen exactamente igual. Borrar
`inicio` hoy sigue rechazándose, pero por la razón correcta: el menú (`menu-y-pie`) tiene
un enlace «Inicio» apuntando ahí. Quitar ese enlace primero lo destraba.

### El riesgo, con lo que de verdad pasa después

- **`menu-y-pie` (las dos apps) e `inicio` (solo sitio-web)** tienen *fallback* de código:
  si se borran, `obtenerPlantilla()`/`obtenerPaginaInicio()` devuelven los valores por
  defecto (identidad visual sola / `homeFallbackData`) en vez de romper el árbol. El sitio
  sigue de pie, solo que con el contenido de fábrica en vez del editado.
- **`inicio` en intranet** y **`politica-de-privacidad`** (y cualquier otra página de
  fábrica futura) **no tienen ese colchón**: si se borran, la ruta pasa a servir «sin
  contenido» (404 para quien no puede editar, el aviso de siempre para quien sí) hasta que
  alguien la vuelva a crear con «Nueva sección»/«Nueva página». El historial de versiones
  se pierde (`paginas_versiones` cae en cascada), la bitácora no.

### Verificación

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web`, `api-backend` e `intranet` (dentro de los contenedores) | Limpio en los tres |
| `GET /api/paginas/{slug}/eliminable` con sesión de Superadmin, antes solo devolvía `puedeEliminarse:false, motivo:"de-fabrica"` para las de fábrica | Ahora: `menu-y-pie` y `politica-de-privacidad` (sitio) → `puedeEliminarse:true`; `inicio` (sitio e intranet) → `puedeEliminarse:false, motivo:"tiene-enlaces"` (el enlace real del menú, guarda intacta) |
| Playwright, sesión real de Superadmin: botones visibles en `/inicio` y `/politica-de-privacidad` (sitio-web) y `/inicio` (intranet) | Los cuatro aparecen: Editar, Menú y pie, Nueva página/sección, **Eliminar página/sección** |
| No se ejecutó ningún borrado real | A propósito — se verificó con el endpoint de análisis (`/eliminable`, de solo lectura) para no destruir contenido de verdad en la base compartida de desarrollo |

### Pendiente al cierre

- No se probó el flujo de borrado de punta a punta (abrir el diálogo, teclear el nombre,
  confirmar) contra una página de fábrica real, para no perder contenido de la base de
  desarrollo sin necesidad. El mecanismo se verificó por partes: el guard ya no bloquea
  (`/eliminable`), el botón ya aparece, y el resto del flujo (`eliminarSeccion`,
  confirmación por nombre, `buscarEnlacesA`) no se tocó y ya estaba probado antes.
- Sigue pendiente lo de la 2.ª parte: confirmar con una sesión real de Administrador o
  Editor (no solo Superadmin) que todo lo de hoy funciona igual para esos roles.

---

## sesión 04-09-2026 (2.ª parte): `politica-de-privacidad` pasa a ser una sección Puck editable

Pedido: que el botón «Editar» (junto con Menú y pie / Nueva página / Eliminar
página) aparezca en todas las rutas públicas de sitio-web, salvo el panel
admin. Diagnóstico: tres de los cuatro botones ya aparecían en todas las
rutas públicas (`(public)/layout.tsx`) y nunca en `/admin/*` — solo faltaba
«Editar» por página, que solo tiene sentido donde hay contenido de la CMS
detrás. De las cuatro rutas sin él, dos son herramientas con datos en vivo
(`/clasificacion`, `/publicaciones` — quedan igual) y dos eran la misma
página de texto legal duplicada bajo dos URLs (`/politica-de-privacidad`,
`/privacidad`). El usuario eligió convertir esa página en una sección Puck
editable de verdad.

### Qué se construyó

`politica-de-privacidad` pasa a ser una sección de fábrica (como `inicio` o
`menu-y-pie`), con tres bloques Puck nuevos en
`sitio-web/src/config/puck.config.tsx` (componentes en `shared/lib/blocks/`):

- **`PoliticaPrivacidadEncabezado`** — título (`h1`) + intro, reemplaza el
  banner hardcodeado.
- **`VisorDocumentosNormativos`** — selector de pestañas + visor de PDF
  (reutiliza `VisorDocumento`, movido de la feature a
  `shared/ui/molecules/` porque ahora lo usa un bloque, no solo esa
  pantalla). Las URLs (proxy interno y CompromISO externa) se calculan del
  `documentoId` que teclea quien edita — no son un campo de texto libre, para
  que nadie las escriba mal.
- **`CanalesAtencion`** — tarjeta de contacto (Habeas Data), con un array de
  canales editable.

`TituloRico` (el envoltorio que evita meter un `<div>` de `richtext` dentro
de un encabezado — ver su propio comentario) amplió su prop `nivel` de
`2 | 3 | 4` a `1 | 2 | 3 | 4` para poder usarlo en el único `<h1>` de la
página.

### Catálogo, permisos y accesibilidad

- `COMPONENTES_POR_SLUG` (frontend) y `SECCIONES_POR_AMBITO.sitio` +
  `ETIQUETAS_DE_SECCION` (`catalogo-permisos.ts`, backend) — el mismo par que
  documenta el código como mirror obligado.
- Migración `022-permiso-politica-privacidad-sitio.ts`, calcada de `016`/`019`
  pero con **`ROLES = ['Superadmin', 'Administrador', 'Editor']`** (no solo
  los dos primeros): esto concede *editar la página*, como
  `editar.sitio.inicio`, no *crear/eliminar secciones*. Copiar la lista de
  aquellas dos sin pensarlo habría dejado al Editor sin poder tocarla.
- `MANIFIESTO_SITIO` (`packages/accessibility-policy`) — regla
  `titulo-array` para `VisorDocumentosNormativos`: cada documento pinta un
  `<iframe title={titulo}>`, así que uno sin título no puede pasar a
  revisión.

### Contenido y rutas

Script `sembrar-politica-privacidad-sitio.ts` (calcado de
`sembrar-inicio-sitio.ts`: `guardarBorrador` → `enviarARevision` →
`aprobarPagina`, no INSERTs a mano) publicó el contenido literal que antes
estaba en el JSX. `(public)/politica-de-privacidad/page.tsx` se reescribió
con el patrón de `[slug]/page.tsx` (`obtenerPaginaPublicadaCacheada` +
`puedeEditarPaginas()` + `EditButton` + `ClientPuckRender`) conservando su
`metadata` propia, más específica que la que da el comodín.
`admin/(shell)/dashboard/privacidad/page.tsx` pasó a leer el mismo contenido
publicado en vez de tener su propia copia hardcodeada — ya no pueden
divergir. `/privacidad` (alias sin contenido propio) se borró y pasó a ser
un `redirect` en `next.config.mjs` hacia la URL canónica, mismo estilo que
`/` → `/inicio`.

### Verificación

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en `sitio-web` y `api-backend` (dentro de los contenedores) | Limpio |
| `npm run migrate` aplica la 022 | OK — `server.ts` la exigía antes de arrancar, como diseñado |
| `npm run permisos:verificar` | Todo correcto (5 roles + casos límite) |
| Seed script (`ts-node scripts/sembrar-politica-privacidad-sitio.ts`, dentro del contenedor `api`) | Publicó los 3 bloques; pasó `validarAccesibilidad` sin violaciones |
| Playwright headless, sesión real de Superadmin: `/privacidad` → redirige a `/politica-de-privacidad` (200); contenido visualmente igual al original (título, intro, 2 pestañas de documentos, canales de contacto); footer y navegación intactos | OK — capturas revisadas |
| Los tres botones que le tocan a esta página (Editar, Menú y pie, Nueva página) se apilan flotantes en la esquina inferior derecha sin superponerse; «Eliminar página» no aparece — mismo comportamiento que `/inicio` | OK |
| Clic en «Editar» abre `/admin/editor/politica-de-privacidad`, paleta con exactamente los 3 bloques nuevos (nada de la portada ni de la intranet), lienzo con el contenido publicado | OK |
| `/admin/dashboard/privacidad` (panel) muestra el mismo contenido que la ruta pública | OK |
| Sin errores de consola/página en ningún caso de arriba | OK |

> **No se probó con una sesión real de Administrador o Editor** (solo con
> Superadmin, que pasa por bypass, y con la API de permisos). El único
> usuario Administrador real de la base (`dtejada@sena.edu.co`) no tiene
> contraseña conocida en esta sesión — mismo punto pendiente que quedó
> abierto en la 1.ª parte de hoy con `/monitoreo`.

### Pendiente al cierre

- Confirmar de punta a punta con una sesión real de Administrador o Editor
  (no solo con la API de permisos) que `/admin/editor/politica-de-privacidad`
  abre y guarda correctamente.
- `login-view.tsx` tiene dos enlaces de consentimiento separados —uno a
  `/politica-de-privacidad`, otro a `/privacidad`—; el segundo ahora hace un
  salto extra por el redirect. Funciona, pero se podría colapsar a la URL
  canónica si alguien toca ese archivo por otro motivo.
- Los cambios sin commitear que ya estaban en el working tree al empezar hoy
  (Dockerfiles/`.npmrc`, borrado de `intranet_editor.html`) siguen ajenos a
  este trabajo y se dejaron como estaban.

---

## sesión 04-09-2026: el botón «Editar» de `/monitoreo` no cargaba para Administrador ni Editor

Pedido: "arregla el boton de editar seccion en sitio web que no aparece no carga".

### Diagnóstico

El botón sí se pinta (`EditButton` solo mira el rol vía `puedeEditarPaginas()`), y
`/admin/editor/monitoreo` respondía 200. El fallo estaba un paso más adentro:
`EditorPage` (`sitio-web/src/app/admin/editor/[slug]/page.tsx`) exige, para cualquier rol
que no sea Superadmin, la clave granular `editar.sitio.{slug}` — y esa clave no existía
en `permisos` para `monitoreo` (ni para `prueba`, una segunda página huérfana del mismo
tipo, sin publicar). Sin la clave, cualquier Administrador o Editor que pulsara «Editar»
recibía un `redirect(rutaPublicaDeSlug(slug))` silencioso: volvía a `/monitoreo` sin
ningún aviso, indistinguible de "no carga".

Confirmado en la base real (contenedor `db`, stack de `docker/docker-compose.yml` +
`docker/docker-compose.override.yml`, ya arriba al empezar la sesión):

- `paginas`: `monitoreo` (con `version_publicada_id` — publicada de verdad) y `prueba`
  (sin publicar), ambas con `creado_por` en blanco y **sin fila en `permisos`** para
  `editar.sitio.monitoreo` / `editar.sitio.prueba`.
- Ninguna de las dos tiene entrada en `auditoria_cambios` con `entidad_tipo='seccion'`.
- `SECCIONES_POR_AMBITO.sitio` (`catalogo-permisos.ts`) solo trae `['menu-y-pie',
  'inicio']` — ni `monitoreo` ni `prueba` son de fábrica.

Eso descarta las dos rutas normales de creación:

- `crear-seccion.usecase.ts` (el botón «Nueva sección») crea `paginas` + `permisos` +
  `roles_permisos` **en una sola transacción** — si la página existe, la clave también
  existiría.
- El *fallback* de `guardar-borrador.usecase.ts` (crea la fila de `paginas` si falta al
  guardar el primer borrador) queda bloqueado por `requierePermisoDeSeccion()` en
  `POST /:slug/borrador`: un slug que no es de fábrica y no tiene fila en `paginas`
  responde 404 **antes** de llegar al use-case, para cualquier rol, Superadmin incluido.

La única explicación que cuadra con los datos: la fila de `paginas` se insertó
directamente en Postgres (fuera de la API), y el resto del ciclo editorial —borrador,
envío a revisión, aprobación— se hizo con la cuenta local de Superadmin, que no pasa por
`requierePermisoDeSeccion()` (bypass en `resolverPermisos`). Nadie lo notó porque esa
cuenta nunca necesitó la clave granular.

### El arreglo

Dos `INSERT` idempotentes contra la base del contenedor `db` (aprobados por el usuario
antes de correrlos — el classifier de auto mode bloqueó el primer intento por escribir
directo a la base):

```sql
INSERT INTO permisos (id, clave, created_at, updated_at)
SELECT gen_random_uuid(), 'editar.sitio.' || slug, now(), now()
FROM paginas
WHERE ambito = 'sitio' AND slug IN ('monitoreo','prueba')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
JOIN permisos p ON p.clave IN ('editar.sitio.monitoreo','editar.sitio.prueba')
WHERE r.nombre IN ('Administrador','Editor')
ON CONFLICT DO NOTHING;
```

Reproduce exactamente lo que `crear-seccion.usecase.ts` habría creado, concediendo a
Administrador y Editor lo mismo que ya tienen sobre `inicio`/`menu-y-pie`. No se tocó
código: el mecanismo de permisos ya funciona como debe (transaccional, con la excepción
de `sembrar-permisos-roles.ts` que protege las claves de secciones creadas en caliente
mientras su página exista) — lo que faltaba era solo el dato.

### Verificación

| Comprobación | Resultado |
|---|---|
| Login real vía UI (Playwright headless, cuenta `LOCAL_AUTH_*`) en `/inicio`, botón `.edit-button` presente, visible, clic navega a `/admin/editor/inicio` y Puck carga | OK — este flujo nunca estuvo roto, era específico de `monitoreo`/`prueba` |
| `curl` con sesión de Superadmin a `/inicio`: HTML servido trae `class="edit-button"` con `href="/admin/editor/inicio?volver=%2Finicio"` | OK |
| `SELECT` sobre `roles_permisos`/`permisos` tras el fix: `Administrador` y `Editor` listados en `editar.sitio.monitoreo` y `editar.sitio.prueba` | OK |
| `GET /api/roles/{id}` (lo que consulta `getSessionPermissionsSnapshot`, el mismo chequeo que hace `EditorPage`) para el rol `Administrador`: `permissions` incluye `editar.sitio.monitoreo` y `editar.sitio.prueba` | OK |
| Reproducir el clic como Administrador/Editor de verdad (sesión real, no solo el permiso en la API) | **No se hizo** — el único usuario `Administrador` en la base (`dtejada@sena.edu.co`) no tiene contraseña conocida en esta sesión |

> **`prueba` sigue sin publicar y sin dueño.** Recibió el mismo arreglo que `monitoreo`
> por consistencia (ambas nacieron huérfanas del mismo modo), pero probablemente sea un
> resto de pruebas manuales de una sesión anterior. Queda pendiente decidir si se borra
> con el botón «Eliminar sección» — no se tocó porque no era parte de lo pedido.

### Pendiente al cierre

- Verificar con una sesión real de Administrador o Editor (no solo con la API de
  permisos) que `/admin/editor/monitoreo` abre el editor de punta a punta.
- Decidir si `prueba` (página de sitio-web, sin publicar) se elimina.
- Los cambios sin commitear que ya estaban en el working tree al empezar esta sesión
  (`api-backend/Dockerfile`, `intranet/Dockerfile`, `sitio-web/Dockerfile` — el fix de
  `install-links`/`.npmrc` para que `dist/` de los `@olo/*` llegue al `npm ci` final— y
  el borrado de `intranet_editor.html`) son ajenos a este arreglo y se dejaron como
  estaban.

---

## sesión 02-09-2026 (2.ª parte): todo lo de Docker/despliegue, junto en `docker/`

Pedido explícito: sacar de la raíz del repo los `docker-compose*.yml`, `deploy.sh`,
`init-ssl.sh`, `nginx/` y `7-despliegue.md`, y meterlos todos en `docker/` — evaluando
antes que no rompiera nada.

### Qué se movió

`git mv` para los cinco archivos/carpetas versionados (quedan como rename, no
borrar+crear) más un `mv` normal para `docker-compose.override.yml` (aún sin
versionar):

```
docker-compose.yml          → docker/docker-compose.yml
docker-compose.prod.yml     → docker/docker-compose.prod.yml
docker-compose.override.yml → docker/docker-compose.override.yml
deploy.sh                   → docker/deploy.sh
init-ssl.sh                 → docker/init-ssl.sh
nginx/                      → docker/nginx/
7-despliegue.md             → docker/7-despliegue.md
```

`.env`, `.env.example`, `.dockerignore` y `.gitattributes` se quedan en la raíz a
propósito: `.env`/`.env.example` porque `deploy.sh` y `init-ssl.sh` ya los leen ahí, y
`.dockerignore` porque el contexto de build sigue siendo la raíz — moverlo con los
compose no habría hecho nada, `.dockerignore` se lee del contexto, no de al lado del
compose. `.gitattributes` no necesitaba tocarse: sus patrones (`*.sh`,
`docker-compose*.yml`) son por nombre de archivo, sin ruta, y ya cazaban estos
archivos en cualquier carpeta.

### El problema técnico real, y cómo se resolvió sin tocar las rutas de los YAML

Los tres compose tienen `context: .`, `env_file: - .env` y (el de producción) un
volumen `./nginx/...` — todos pensados para un compose que vive en la raíz. Compose
resuelve esas rutas relativas contra la carpeta **del propio archivo compose**, no
contra el directorio desde el que se invoca `docker compose`: mover el archivo a
`docker/` sin más habría hecho que `context: .` apuntara a `docker/` y el build dejara
de encontrar `api-backend/`, `sitio-web/`, `packages/`, etc.

Se evaluaron dos soluciones y se descartó una:

- **Reescribir cada ruta a `../`** (`context: ..`, `env_file: - ../.env`...) — se
  descartó: son ~15 líneas repartidas en los tres archivos, cada una un candidato a
  error de tipeo, y además entra en conflicto con la otra ruta de invocación (ver
  abajo): unas rutas sirven para "compose vive en `docker/`" y otras para "compose se
  invoca con `--project-directory` a la raíz" — no pueden convivir en el mismo archivo
  con las dos interpretaciones a la vez.
- **`--project-directory <raíz>`** (la que se usó): le dice a Compose que resuelva
  *todas* las rutas relativas contra la raíz, sin importar dónde viva el archivo
  compose. Cero cambios de contenido en `docker-compose.yml`/`docker-compose.prod.yml`
  salvo la única ruta que de verdad se movió (`./nginx/...` → `./docker/nginx/...`,
  porque `nginx/` sí cambió de sitio).

`deploy.sh` e `init-ssl.sh` ya lo hacen solos: los dos arrancan con
`cd "$(dirname "${BASH_SOURCE[0]}")/.."` (funcionan igual invocados desde la raíz, desde
dentro de `docker/` o desde cualquier otro sitio) y su `componer()` pasa
`--project-directory .` de forma explícita. Para invocar Compose a mano (el modo
hot-reload, que `deploy.sh` no cubre — pasa `-f` con un solo archivo) hace falta
nombrar la bandera:

```bash
docker compose --project-directory . -f docker/docker-compose.yml -f docker/docker-compose.override.yml up -d --build
```

Es más largo que el `docker compose up -d --build` de la sesión anterior — la carga
automática del override sin `-f` solo pasaba porque el archivo vivía en la raíz. Se
documentó así en `docker/7-despliegue.md` en vez de esconder la diferencia.

### Verificación

| Qué | Resultado |
|---|---|
| `docker compose --project-directory . -f docker/docker-compose.yml -f docker/docker-compose.override.yml config` | Sin errores |
| `docker compose --project-directory . -f docker/docker-compose.prod.yml config` | Sin errores |
| `./docker/deploy.sh help` / `... status` desde la raíz | Corren bien, `status` lista los 5 contenedores reales |
| Build completo (`builder` y también la imagen final de producción) de las tres apps, desde las rutas nuevas | Compila y exporta imagen |
| Stack completo levantado con las rutas nuevas | Compose reconoce que ya coincide con lo que había (no recrea contenedores) — confirma que el movimiento es transparente |
| `/health`, `/inicio`, `/login` tras el movimiento | 200 los tres |

### Referencias actualizadas

`README.md` (el link de la tabla de documentación), `11-base-de-datos.md` (una mención
a `7-despliegue.md`) y el propio `docker/7-despliegue.md` (todos los ejemplos de
comandos, la nota de verificación de arriba del todo y el árbol de "Estructura de
archivos"). Se dejaron sin tocar las menciones sueltas a `deploy.sh`/`docker-compose`
que son prosa o nombran el concepto sin ser un comando para copiar y pegar
(`3-seguridad-del-proyecto.md`, `8-ciclo-editorial.md`, los `Dockerfile`, comentarios en
código) — no son enlaces rotos, son texto descriptivo, y tocar todos habría sido
alcance de más.

### Segundo punto del pedido: imágenes al día

No hay ningún commit hecho hoy (`git log` lo confirma) — todo el trabajo de la sesión,
incluida esta reorganización, sigue sin commitear. Las imágenes en Docker sí están al
día con el estado actual del working tree: se reconstruyeron las tres apps después de
mover los archivos y Compose las encontró ya equivalentes a lo que tenía corriendo, sin
necesidad de recrear contenedores.

### Pendiente

- Nada roto detectado. Si se prefiere volver a poder invocar `docker compose up` a
  secas sin `--project-directory`, la alternativa sería reescribir las rutas a `../`
  (la opción descartada arriba) — no se hizo porque complica más de lo que simplifica.

## sesión 02-09-2026: Docker con hot-reload, y tres roturas de build que estaban esperando

Se pidió que los contenedores reflejaran los cambios de código sin reconstruir la imagen
en cada edición. Antes de poder probar eso hizo falta arreglar el build de Docker en sí,
que llevaba roto desde hace días sin que nadie lo hubiera corrido de punta a punta.

### 1. `docker-compose.override.yml`: hot-reload real, con `nodemon`/webpack a propósito

Compose carga este archivo solo (comportamiento de fábrica sin `-f` explícito) y monta
`src/` de cada app en vivo, con el comando cambiado a modo desarrollo (`nodemon` +
`ts-node` en `api-backend`, `next dev --webpack` en `sitio-web`/`intranet`). No lo usan
ni `./deploy.sh` ni `COMPOSE_FILE=docker-compose.yml ./deploy.sh start`: pasan `-f`
explícito, que desactiva la carga automática.

**Por qué `nodemon --legacy-watch` y no `node --watch`, y por qué `--webpack` y no
Turbopack (el default de `next dev` en Next 16):** en Windows, el bind-mount de Docker
Desktop no propaga los eventos de inotify hacia el contenedor. Se verificó con el stack
real: `node --watch` no reiniciaba al tocar `server.ts` desde el host (`docker exec`
confirmaba que el archivo SÍ cambiaba dentro del contenedor — el bind-mount funciona bien
para lectura/escritura, solo no dispara el evento), y `next dev` con Turbopack tampoco
recompilaba. El sondeo (`--legacy-watch`, `WATCHPACK_POLLING=true`) no depende de ese
evento y sí detecta el cambio — confirmado editando `server.ts` (nodemon reinició el
proceso hijo, PID distinto) y el `<title>` de `/inicio` (cambió en la respuesta HTTP tras
editar `page.tsx`, sin tocar el contenedor).

Los paquetes compartidos `packages/*` se recompilan una vez al arrancar el contenedor
(`docker/dev-entrypoint.sh`, mismo criterio que ya usan los Dockerfile: salta los que
tienen `"noEmit": true`) pero no se vigilan en caliente — tocar uno pide
`docker compose restart <servicio>`.

### 2. Tres roturas de build preexistentes, encontradas al intentar levantar el stack

Ninguna las causó este cambio; las tres bloqueaban ya `docker compose build` en cualquier
modo (dev u override), incluida la ruta de producción que `7-despliegue.md` daba por
"verificada de punta a punta el 2026-08-23".

| # | Dónde | Qué pasaba | Causa |
|---|---|---|---|
| 1 | `api-backend/package-lock.json` | `npm ci` fallaba: "Missing: @olo/accessibility-policy, @olo/slug-policy from lock file" | Commit `b83e474` (install-links para Windows) borró las entradas `"../packages/..."` de nivel superior que `npm ci` exige; `npm install` normal no las repone (solo `npm ci` las valida) |
| 2 | `sitio-web/package-lock.json` e `intranet/package-lock.json` | Mismo error, con los 7 paquetes `@olo/*` | El mismo commit `b83e474` tocó los tres lockfiles por igual |
| 3 | `api-backend/src/infrastructure/db/models/index.ts` | `tsc` fallaba: "Merge conflict marker encountered" — marcadores `<<<<<<<`/`=======`/`>>>>>>>` commiteados tal cual | El merge `a6d427d` ("fix-resolved: conflictos en index") no se resolvió de verdad: dejó los marcadores en el archivo |

El fix de los lockfiles fue restaurar exactamente las entradas que `b83e474` quitó (están
en su diff, `git show b83e474 -- <archivo>`). El de `index.ts` fue leer las dos ramas del
merge (`1cb9654`, que borra 8 modelos inactivos, y `eba87860`, que trae `BloqueoEdicion`
de la migración 021) y quedarse con las dos cosas: sin los 8 modelos borrados, con
`BloqueoEdicion` importado y exportado.

Un cuarto problema, ya no de Docker sino de tipos: `sitio-web/.../panel-general.tsx`
pasaba `as="button"` a `NavbarItem`/`SidebarItem`, una prop que esos componentes locales
nunca tuvieron (detectan botón vs. enlace por la presencia de `href`). `SidebarItem` ya
declaraba `onClick`; `NavbarItem` no, así que se le agregó. Se quitó el `as="button"` de
las dos llamadas, que no hacía nada.

### Verificación

| Qué | Resultado |
|---|---|
| `docker compose build` (las tres apps, target `builder`) | Compila y exporta imagen, las tres |
| `api-backend` con `nodemon`, editando `server.ts` en vivo | `[nodemon] restarting due to changes...`, PID del proceso hijo cambia |
| `sitio-web` con `next dev --webpack`, editando `page.tsx` de `/inicio` en vivo | El `<title>` de la respuesta HTTP cambia sin reiniciar el contenedor |
| `docker compose run migraciones` sobre la base real | Aplicó `020-depuracion-y-optimizacion-esquema` y `021-bloqueos-edicion`, pendientes desde el 31-08 |
| Stack completo (`api`, `sitio-web`, `intranet`, `db`, `redis`) | Los tres HTTP responden 200 (`/health`, `/inicio`, `/login`) ya en modo dev |

> `api-backend/package.json` suma `nodemon` como devDependency (`^3.1.14`) — hace falta
> para el sondeo; no se toca ninguna dependencia de producción.

### Pendiente

- `sitio-web` e `intranet` quedaron corriendo en modo dev (contenedores recreados sobre
  el stack real, que ya estaba arriba con tráfico). Si se prefiere volver al build de
  producción: `docker compose down && docker compose -f docker-compose.yml up -d --build`
  (sin el override).
- Se encontró (no se tocó) un `backlog.csv` borrado del working tree y un `pruebas-carga/`
  movido a `test/pruebas-carga/`, ajenos a este trabajo — ver el aviso en el chat.

## sesión 30-08-2026: el editor enseña la página entera, y solo la edita una persona a la vez

Dos frentes distintos de la mesa de trabajo, en `sitio-web` y en `intranet`.

### 1. El lienzo mostraba un trozo suelto, no una página

Al editar una sección no se veían el menú ni el pie; al editar `menu-y-pie` no se veía ninguna sección real. Quien editaba no podía juzgar cómo quedaba su cambio dentro de una página de verdad.

**Un primer intento —un panel lateral de solo lectura— se descartó y se revirtió entero.** Conviene dejarlo escrito para que nadie lo vuelva a intentar: Puck fija el alto de su propio layout a `100dvh` en su CSS interno (`_PuckLayout`, en `@puckeditor/core/dist/index.css`), sin mirar cuánto espacio le deje su contenedor. Cualquier cosa apilada encima o debajo del editor queda tapada, y repartir el ancho en un panel lateral parte la pantalla en dos columnas estrechas que no se parecen a la página. **El contexto tiene que ir DENTRO del lienzo, no alrededor.**

La solución es `config.root.render`, que envuelve el contenido del lienzo y **es decorado del config, no datos**: nada de lo que se pinta ahí entra en el JSON que se guarda. Ninguno de los dos `puck.config.tsx` definía `root`, así que el hueco estaba libre.

| Qué se edita | Qué pinta el lienzo |
|---|---|
| Una sección | barra/cabecera publicada → **contenido editable** → pie publicado |
| `menu-y-pie` | **barra editable** → sección publicada de la que se vino → **pie editable** |

En el segundo caso la sección tiene que quedar **entre** los dos bloques editables, y `root.render` solo sabe envolver, no intercalar. Se resuelve envolviendo el `render` del bloque del pie —solo dentro de `configDeEdicion`, nunca en `puckConfig`—, porque el pie es por definición lo último de la página. **Efecto conocido y aceptado:** si alguien borra el bloque del pie mientras edita, el contexto desaparece hasta que lo vuelva a poner.

De qué sección se trata sale del `?volver=` que el botón «Menú y pie» ya mandaba desde antes; sin él se cae a `inicio` (`slugDeOrigen`, en los dos `lib/ruta-de-vuelta.ts`).

Lo no editable va en un `<div class="olo-chrome-inerte" inert>`. **Lo que de verdad lo apaga es el atributo `inert`** —quita clic, foco y lectura por lectores de pantalla de una vez—; la opacidad reducida y el gris son solo la señal visual, y la etiqueta de la esquina va fuera de esa capa para que no herede la opacidad.

### 2. Dos personas podían editar lo mismo y pisarse

El editor no guarda nada hasta que alguien pulsa «Guardar borrador», así que dos personas sobre la misma página producían dos versiones completas del contenido y la segunda en guardar borraba el trabajo de la primera sin que nadie se enterara.

**Esto revierte una decisión de diseño anterior.** `permisos.middleware.ts` y `guardar-borrador.usecase.ts` decían «la edición es colaborativa a propósito»; los dos comentarios se actualizaron para no dejar la documentación contradiciendo el comportamiento.

| Capa | Qué |
|---|---|
| Base de datos | `020-bloqueos-edicion` — tabla `bloqueos_edicion`, PK `(ambito, slug)` |
| Modelo | `infrastructure/db/models/BloqueoEdicion.ts` (sin asociaciones, a propósito) |
| Repositorio | `repositories/bloqueo-edicion.repository.ts` |
| Use-cases | `use-cases/paginas/adquirir-bloqueo.usecase.ts`, `liberar-bloqueo.usecase.ts` |
| Rutas | `POST` y `DELETE /api/paginas/:slug/bloqueo` |
| Frontend | `use-bloqueo-de-edicion.ts` y `aviso-editor-ocupado.tsx` en cada app |

Cuatro decisiones que no conviene deshacer sin querer:

- **Va en Postgres, no en Redis.** Redis tiene TTL nativo y sería lo natural, pero aquí es opcional —la caché degrada a BYPASS cuando no está, y en desarrollo local no está—, y un candado que no cierra cuando falta Redis es peor que no tener candado: da una garantía que no se cumple justo cuando nadie mira.
- **`usuario_id` es `TEXT` sin clave foránea.** La cuenta maestra de desarrollo (`LOCAL_AUTH_*`) no vive en `usuarios`: su token lleva `id: 'local-auth'`, que no es un UUID. Con `UUID REFERENCES usuarios(id)` el candado reventaría precisamente en el entorno donde más se prueba. `usuario_nombre` se desnormaliza por lo mismo: hay que poder decir quién está dentro sin un JOIN que para esa cuenta no existiría.
- **Se adquiere con un único `INSERT ... ON CONFLICT ... WHERE`.** Comprobar primero y escribir después deja una ventana —corta, pero real— por la que dos personas leen «libre» y entran las dos, que es exactamente el problema que el candado existe para evitar.
- **Dos minutos de vida, latido cada 45 segundos.** El margen es lo que impide que se le caiga a quien está trabajando, y lo que hace que una pestaña cerrada de golpe se libere sola. Al salir se suelta con `fetch(..., { keepalive: true })` desde `pagehide`; `sendBeacon` no sirve porque solo sabe hacer POST.

**Toma de control:** `forzar: true` solo lo obedece quien puede aprobar (`paginasPolicies.puedeForzarBloqueo`, los mismos roles que `puedePublicar`). A quien le quitan el candado no se le echa de la pantalla —para que pueda copiarse lo que llevara— pero se le desactivan «Guardar borrador» y «Enviar a revisión», con un aviso en la cabecera diciendo quién tomó el control.

### Verificación

Se probó ejecutando de verdad las tres capas, no solo compilando.

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` en `api-backend`, `sitio-web` e `intranet` | limpio |
| `eslint` sobre lo tocado en las dos apps | limpio |
| `npm run migrate` | `020-bloqueos-edicion` aplicada |
| Editor de sección, las dos apps | 2 bloques inertes, etiquetas correctas, `inert` presente en los 2 |
| Editor de `menu-y-pie` con `?volver=`, las dos apps | 1 bloque inerte con la sección real; barra y pie a todo color |
| **Guardar en `menu-y-pie`** | el cuerpo enviado lleva **solo** `["IntranetTopbar","IntranetFooter"]` — el contexto inerte **no** se filtra al JSON |
| Candado: adquirir / renovar / liberar / liberar dos veces | 200 · 200 · `liberado:true` · `liberado:false` |
| Candado ajeno vigente | **409** con `bloqueadoPor.nombre` y `puedeForzar` |
| `DELETE` de un candado ajeno | `liberado:false` — no lo suelta |
| Candado ajeno **caducado**, sin forzar | 200, `propio:true` |
| «Entrar de todos modos» en el navegador, las dos apps | pantalla de ocupado → editor montado |
| Cierre del navegador con candado propio | la fila desaparece: el `pagehide` con `keepalive` llega |

> **Aviso sobre Turbopack y el CSS.** Dos veces el dev server siguió sirviendo una versión vieja de `globals.css` después de editarlo: las reglas nuevas no estaban en la hoja servida aunque sí en el archivo, y la pantalla salía sin estilos. No es un bug del código. **Si un estilo recién añadido no aparece, reinicia el dev server (y borra `.next/cache`) antes de buscar la causa en otro sitio.**

### Pendiente al cierre

- **Sin commit.** Se dejaron los dos mensajes preparados: uno para `api-backend/` y otro para el frontend. No se pueden partir por etapa porque varios archivos del frontend (los `index.ts`, los `puck-editor-wrapper`, los `globals.css`) llevan código de los dos frentes.
- **`AGENTS.md` y `CLAUDE.md` sin seguimiento** en `intranet/` y `sitio-web/`. Los genera `next dev` solo, no son de este trabajo: hay que decidir si se commitean o se ignoran.
- El candado corta **en la puerta**: no hay fusión de cambios ni aviso en vivo a quien está dentro de que alguien quiere entrar. Si eso hiciera falta, es otra tanda.

---

## sesión 18-08-2026 (2.ª parte): se elimina `usuarios_sitio` — `usuarios` queda como única identidad

### Qué era y por qué se va

`usuarios_sitio` era la segunda tabla de usuarios que el §2.1 de `11-base-de-datos.md` señalaba como sobrante desde la fase 4. No se había fusionado porque tenía **su propio login con un segundo secreto JWT** (`JWT_SITE_SECRET`), y eso convertía la unificación en un cambio de autenticación, no en un renombrado, así que estaba aplazada.

La auditoría previa al borrado encontró que el argumento ya no se sostenía:

- **La tabla estaba vacía** (0 filas). No había datos personales de ciudadanos que trasladar ni respaldar.
- **Ningún frontend la consumía.** `grep` sobre `sitio-web/src` e `intranet/src` no devuelve una sola llamada a `/api/sitio-users`. El panel del sitio siempre entró por `/api/auth/login`, que valida contra `usuarios`.
- **Su código era autocontenido**: modelo, repositorio, use-case, controller y router, sin una sola relación en `models/index.ts`.

### Qué se eliminó

| Capa | Qué |
|---|---|
| Base de datos | `013-eliminar-usuarios-sitio` — `DROP TABLE usuarios_sitio` |
| Modelo | `infrastructure/db/models/SitioUser.ts` (+ su import y export en `models/index.ts`) |
| Repositorio | `repositories/sitio-users.repository.ts` |
| Use-case | `use-cases/usuarios/sitio-users.usecase.ts` |
| Controller | `controllers/sitio-users.controller.ts` |
| Rutas | `routes/sitioUser.routes.ts` (+ su import y `app.use('/api/sitio-users', …)` en `app.ts`) |
| Configuración | `jwtSiteSecret` y la validación fatal de `JWT_SITE_SECRET` en `config/index.ts`; la variable en `.env.example`, `docker-compose.yml`, `docker-compose.prod.yml` y la tabla de `7-despliegue.md` |
| Scripts | `usuarios_sitio` sale de `TABLAS` en `respaldo.ts` (habría fallado al consultar una tabla inexistente) y de los diccionarios de `generar-esquema-comentado.ts` y `generar-pdf-esquema.ts` |

**La migración lleva guarda y no es decorativa.** Antes del `DROP` cuenta las filas y **aborta con `RAISE EXCEPTION` si hay alguna**: son datos personales bajo Ley 1581 y una migración no decide borrarlos. En un entorno donde la tabla tenga cuentas, esto falla y deja la base intacta. El `down` recrea la tabla vacía apuntando a `usuarios(id)`, no a `users(id)`, porque `005-identidad` ya renombró la tabla y una reversión no resucita el nombre viejo.

### Lo que **no** se tocó, a propósito

- **`001-esquema-base` sigue creando la tabla.** Las migraciones son historia y no se reescriben: sobre una base nueva, la 001 la crea y la 013 la elimina. Lo mismo con la mención en `003-restricciones-e-indices`, que es un `relname IN (…)` inofensivo cuando la tabla no existe.
- **La fila 5 del §2.1 de `11-base-de-datos.md`** conserva `usuarios_sitio.email` porque describe lo que el esquema viejo *hacía*, no lo que hay hoy.
- **El registro del BOLA en `3-seguridad-del-proyecto.md`** mantiene la fila de `/api/sitio-users/:id`; se le añadió que la ruta ya no existe. Borrar el hallazgo borraría la trazabilidad de su cierre.

### Verificación

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | limpio |
| `npm run build` | limpio |
| `npm run migrate` | `013-eliminar-usuarios-sitio` aplicada |
| `npm run db:verificar` | **los 20 modelos** coinciden con las columnas reales (eran 21) |
| `to_regclass('public.usuarios_sitio')` | `NULL` — la tabla no existe; `usuarios` conserva sus 6 filas |
| `permisos` / `propiedad` / `auditoria` / `email` / `password` `:verificar` | los cinco «Todo correcto» |
| Arranque real **sin `JWT_SITE_SECRET` en el entorno** | `/health` 200 · `GET /api/sitio-users` **404** · `POST /api/sitio-users/login` **404** · `GET /api/users` 401 |

> **Aviso sobre la prueba de humo.** El primer intento respondió 401 y 500 en vez de 404, y no era un residuo: el puerto 4000 lo ocupaba un `ts-node src/server.ts` **anterior a los cambios**, sirviendo código viejo desde memoria. Repetida en el 4100 con `node dist/server.js`, las dos rutas dan 404. **Cualquier dev server que estuviera corriendo antes de esta sesión hay que reiniciarlo**, o seguirá respondiendo `relation "usuarios_sitio" does not exist`.

### Pendiente al cierre

- **`.env` local**: se le quitó `JWT_SITE_SECRET`. En despliegue, la variable puede retirarse del gestor de secretos — ya no la lee nadie y su ausencia no impide arrancar.
- De ese frente queda **solo** la caducidad de cuentas; la parte de unificar identidades está cerrada.
- Los frontends no se recompilaron: ninguno de los dos referenciaba la tabla ni sus rutas.

---

## sesión 11-08-2026 (3.ª parte): el primer ingreso era todo-o-nada

### El fallo

Un administrador puede restablecer la contraseña, las preguntas de seguridad, o ambas. Pero `firstLoginUseCase` **exigía siempre las tres cosas**: contraseña temporal, contraseña nueva y tres preguntas.

Con `reset_security_questions` sin `reset_password`, el usuario no tiene ninguna contraseña temporal —la suya sigue siendo válida— y aun así el formulario se la pedía, y le obligaba a cambiar la contraseña otra vez. Quedaba atascado en una pantalla que le pedía algo que no existe.

### El arreglo: lo decide el servidor

`firstLoginUseCase` ahora lee `must_change_password` y `must_setup_security_questions` **de la base** y exige exactamente lo pendiente. Que lo decida el servidor y no el formulario es lo que impide, de paso, que alguien se salte el cambio de contraseña simplemente no enviándolo. Es idempotente: sin nada pendiente no falla, informa.

- **Endpoint nuevo `GET /api/first-login/status`** (+ su proxy). El formulario lo consulta antes de pintarse. **No se leen las cookies** `mustChangePassword` / `mustSetupSecurityQuestions`: se escriben al iniciar sesión y se quedan congeladas, así que después de completar un paso siguen diciendo lo de antes.
- **Las preguntas se preparan antes de escribir nada.** Si vienen mal, no puede quedar la contraseña cambiada a medias y el usuario sin saber en qué estado está.
- **Solo se audita `cambiar_password` si de verdad hubo cambio.** Configurar únicamente las preguntas no lo es.
- **El proxy borra las dos cookies al terminar.** `middleware.ts` decide con ellas a quién manda a `/admin/auth/cambiar-contrasena`; sin borrarlas, quien acababa de completar su configuración volvía a la misma pantalla en cada navegación, en un bucle del que solo se salía cerrando sesión.
- **La pantalla se adapta**: si solo faltan preguntas entra directo al paso 2, con un texto que explica por qué se le piden y aclara que su contraseña no cambia; si solo falta la contraseña, no hay segundo paso; si no falta nada (se llegó por URL, o se completó en otra pestaña) lo dice en vez de pintar el formulario.

### Un fallo aparte, encontrado al revisar

**`reset_security_questions` marcaba la bandera pero no borraba las preguntas.** Las viejas seguían sirviendo para recuperar la cuenta hasta que el usuario eligiera otras — y un administrador que las restablece suele hacerlo justo porque dejaron de ser de fiar. Ahora se borran: la recuperación queda cerrada hasta que configure las nuevas, que es lo correcto.

### Verificación

Script de escenario contra la base real (cuenta temporal creada y borrada), 15 comprobaciones, todas OK: alta con todo pendiente → primer ingreso completo → **restablecer solo preguntas** (la contraseña no cambia, las viejas se borran, se configuran las nuevas sin contraseña temporal) → **restablecer solo contraseña** (sin exigir preguntas, conserva las que tenía) → idempotencia. `tsc` limpio y `next build` correcto en las dos apps.

### La intranet, alineada en la misma sesión

Tenía el mismo fallo, y el arreglo del backend lo habría empeorado: con el servidor ignorando los campos de contraseña cuando no hay nada que cambiar, su formulario habría dicho «completado» sin cambiarla. Se le aplicó el mismo patrón (`firstLoginStatus`, pasos condicionales, guardas de carga y de «nada pendiente»).

Un detalle que solo aparece allí: **la paginación permitía retroceder al paso 1**. Sin acotarla, quien solo tenía que configurar preguntas podía volver atrás y encontrarse otra vez el formulario de contraseña temporal — el mismo fallo por la puerta de atrás. Los pasos se acotan ahora al primero aplicable y se numeran por posición, para no mostrar un «2 3» suelto.

### Pendiente al cierre

- **No se ejerció desde el navegador** en ninguna de las dos apps: se verificó por use-case contra la base, por tipos y por build, no pulsando la pantalla.
- **`GET /api/first-login/status` sí se comprobó servido**: responde 401 sin sesión (no 404), así que la ruta está montada y protegida.

---

## sesión 11-08-2026 (2.ª parte): dominio institucional y recuperación de contraseña en el sitio web

### 1. Restricción a `@sena.edu.co`

Autoridad en `api-backend/src/shared/email-policy.ts`, aplicada en **tres** puntos —login, alta y **cambio** de correo—. El tercero no estaba en el encargo pero sin él la regla no se sostiene: bastaría con crear la cuenta con un correo válido y cambiarlo después.

- **La comparación es `endsWith('@sena.edu.co')`, no `includes`.** `atacante@sena.edu.co.dominio-falso.com` contiene el dominio sin pertenecer a él, y `alguien@nosena.edu.co` termina en `sena.edu.co`. La arroba es lo que descarta ambos. Los tres casos están en el script de verificación.
- **En el login no se devuelve el motivo.** Un dominio ajeno recibe el mismo `401 Credenciales inválidas` que un usuario inexistente, y se rechaza antes de consultar la base. Decir «dominio no permitido» convertiría el login en un detector de dominios. En el alta sí se da el motivo real: quien la usa es un administrador autenticado.
- **Antes de aplicarlo se comprobó a quién dejaba fuera.** Había un usuario `dd@dd.co` (rol Administrador, activo, con acceso ese mismo día) que habría quedado bloqueado. Se verificó que no tenía **ninguna** fila asociada en las 19 tablas con clave foránea contra `usuarios`, y se eliminó por decisión del responsable. La cuenta maestra (`LOCAL_AUTH_EMAIL`) sí cumple el dominio, así que no se vio afectada. Tras el cambio: 8 usuarios, todos institucionales.

### 2. Recuperación de contraseña en `sitio-web` (RF-05)

Existía en la intranet y no en el sitio. Se añadió `/admin/auth/recuperar` + el enlace «¿Olvidaste tu contraseña?» en el login, sin tocar el backend: los tres endpoints ya existían y solo faltaban los proxies (`user-questions`, `verify`, `recover-password`).

- **Un componente con pasos internos, no cuatro rutas.** La intranet reparte el flujo en cuatro páginas y arrastra el estado por `sessionStorage` — **incluidas las respuestas de seguridad en claro**, que quedan escritas en el navegador. Aquí el estado vive en el componente: al salir desaparece solo. Es además el idioma que ya usaba `first-login-flow.tsx`.
- **Las tres respuestas se verifican juntas, no una a una**, o la pantalla diría cuál se falló. Al fallar se vacía el cuestionario y se vuelve a la primera: dejar las respuestas puestas invitaría a ir cambiando una hasta acertar.
- **`/admin/auth/recuperar` es pública sin tocar `middleware.ts`**, porque el `matcher` es una lista explícita y la ruta no entra en ella. Conviene saberlo: la protección de `/admin/*` no es por prefijo.

### 3. Un aviso sobre cómo se verifica

La primera tanda de pruebas contra `localhost:4000` **no probaba nada**: ese proceso se había arrancado antes de los cambios y `npm run dev` es `ts-node` sin watch, así que servía código viejo. Los cuatro correos de prueba no existían en la base, y el `401` idéntico que devolvía era el comportamiento de siempre. Se detectó porque un error de política que debía salir como 400 salió como 401. **Para probar cambios del backend hay que reiniciarlo**; aquí se levantó una segunda instancia en `:4001` para no tocar la del entorno.

### 4. Verificación

- **`npm run email:verificar` (script nuevo, 15 comprobaciones)**: dominio, normalización y las tres formas de evasión.
- **En ejecución, contra la base real**: el error de política en recuperación sale como **400 con el motivo concreto**, y un correo inexistente con contraseña válida sigue dando el **401 genérico** — la excepción de `CODIGO_PASSWORD_INVALIDA` funciona sin romper la anti-enumeración.
- **El bloqueo de §3, probado de punta a punta** con una cuenta temporal creada y borrada después: los intentos 1–4 incrementan el contador sin bloquear, el 5.º escribe `bloqueado_hasta`, y con la cuenta bloqueada **ni la contraseña correcta entra** (423). Esto cierra el pendiente «sin probar en ejecución» de la primera parte de la sesión.
- **`createUser` rechaza** tanto el dominio ajeno como la evasión por subcadena.
- `tsc --noEmit` limpio en los tres proyectos; `next build` correcto en ambas apps, con `/admin/auth/recuperar` y los tres proxies nuevos en la tabla de rutas.

### Pendiente al cierre

- **El flujo de recuperación no se ejerció desde el navegador**: se verificaron los endpoints y el build, no la pantalla con un usuario real que tenga preguntas configuradas.
- **La intranet conserva las respuestas de seguridad en `sessionStorage`** (`RecoveryView` → `SecurityQuestionsView` → `ResetPasswordView`). No se tocó para no rehacer un flujo que funciona, pero es la misma debilidad que aquí se evitó.
- **`@sena.edu.co` está escrito como constante en dos sitios** (backend y `@olo/email-policy`). Si algún día se admite otro dominio —`@misena.edu.co` para aprendices, por ejemplo— hay que cambiarlo en ambos.

---

## sesión 11-08-2026: la política de contraseñas, y un bloqueo por intentos que nunca podía dispararse

Fase A de las Directivas de Contraseñas (§1 composición, §3 protección, y la trazabilidad de la consideración 2). §2 —historial de 5 y expiración a 90 días— queda fuera a propósito; el porqué está en «Pendiente al cierre».

### 1. Lo que la política daba por hecho y no existía

La auditoría previa importaba más que el código: tres de las cuatro afirmaciones de partida eran falsas contra el repositorio real.

- **El bloqueo de §3 no existía, y no podía existir.** `login.usecase.ts` *leía* `bloqueado_hasta` pero **nunca lo escribía**: la comprobación estaba escrita y era inalcanzable, así que fallar mil veces seguidas no tenía ninguna consecuencia. Lo que sí había es un `rateLimit` **por IP** (10/15min) en `auth.routes.ts`, que es otro control —un atacante que rote direcciones lo esquiva y no protege una cuenta concreta— y que se confunde fácil con este.
- **`intentos_fallidos` no era del login.** Es de las preguntas de seguridad (3 intentos, 30 minutos). Reutilizarla para §3 (5 intentos, 15 minutos) habría mezclado dos contadores con umbrales distintos y bloqueado a destiempo en ambos flujos. De ahí la columna aparte.
- **El cron con el que la consideración 3 pedía integrarse no existe.** `revisar-caducidad.job.ts` y `usuario-caducado.event.ts` son stubs con TODOs, y `deactivateExpiredUsers()` está escrita pero **no la llama nadie**. No había dónde engancharse: habría que construirlo.
- **Cinco caminos escribían un hash, con cinco criterios distintos.** Cuatro comprobaban `length < 8`; el quinto —`updateUser`, por donde un administrador fija la contraseña de otro— **no comprobaba absolutamente nada**, ni la longitud.

### 2. Lo que se construyó

- **`api-backend/src/shared/password-policy.ts`**, la autoridad única. Longitud, categorías, caracteres, normalización, hasheo, comparación y generación de temporales. Los cinco puntos de escritura pasan ahora por aquí.
- **`packages/password-policy/`**, paquete compartido por las dos apps siguiendo el patrón de `blocks-renderer` (`main` a `src/index.ts`, sin build). Solo valida y explica: no importa `bcrypt` ni `crypto` porque corre en el navegador. Son dos copias con responsabilidades separadas —una decide, otra explica—, que es manejable; cinco que deciden, no.
- **Migración `011-politica-passwords`**: la columna `intentos_fallidos_login` y el verbo `cambiar_password` en el CHECK de `auditoria_cambios`.
- **`logCambioDePassword`** en el use-case de auditoría, con `via` (`primer-inicio` / `cambio-voluntario` / `recuperacion`). Los tres caminos por los que un usuario cambia su propia contraseña **no escribían ninguna fila**: se auditaba solo el cambio hecho por un administrador, por ser el único que pasaba por `usuarios.controller.ts` — justo al revés de lo que la Ley 1581 necesita.
- **`PasswordRequisitos`** en las dos apps (Tailwind en `sitio-web`, convención `classPrefix` + CSS en `intranet`): la lista de §1 marcando lo que ya se cumple, visible desde el campo vacío.

### 3. Decisiones que no son obvias

- **El máximo real es 72 bytes, no los 256 que dice §1.** bcrypt ignora todo lo que pase de ahí: dos contraseñas que compartan los primeros 72 bytes abren la misma cuenta. Se valida el límite verdadero y se rechaza antes de hashear en vez de truncar en silencio. **§1 del documento de directivas debería corregirse**; la alternativa era migrar a argon2 (que §3 permite) y se descartó por el rehash progresivo que implica.
- **Se admiten `ñ` y tildes, contra la letra de §1.** Prohibir Unicode entero rechazaría `Contraseña2026!` en un producto del SENA. Se bloquea lo que de verdad no se puede volver a teclear: emojis, categorías `\p{C}` (control, formato, ancho cero) y todo espacio que no sea U+0020 —un NBSP copiado desde Word es invisible y deja a alguien fuera de su cuenta sin explicación posible—.
- **Se normaliza a NFC y se hashea la forma normalizada.** `exigirPasswordValida` **devuelve** la contraseña a propósito, para forzar a quien llama a hashear lo que salió y no lo que entró. `compararPassword` prueba primero el texto crudo y solo después el normalizado: las contraseñas anteriores a este módulo se hashearon sin normalizar, y comparar solo NFC habría dejado fuera a quien tuviera una tilde descompuesta guardada.
- **Los formularios de *inicio de sesión* no validan la política.** Es el cambio más delicado de la sesión: `LoginView.tsx` de intranet exigía 8 caracteres, y subirlo a 12 habría dejado a **todos los usuarios actuales con contraseña de 8–11 caracteres sin poder ni enviar el formulario** —ni llegar a recuperación, que está detrás—. La política se aplica donde se *elige* contraseña. Por lo mismo, la contraseña temporal del primer ingreso tampoco se mide contra §1: se comprueba, no se elige.
- **La recuperación devuelve el error de política tal cual.** `recoverPasswordCtrl` sustituye a propósito cualquier error por un mensaje genérico para no delatar si un correo existe. Un incumplimiento de §1 habla de lo que el usuario acaba de teclear y se valida **antes** de tocar la base, así que no revela nada de la cuenta; sin la excepción, quien eligiera una contraseña débil vería «verifica los datos» sin forma de saber qué corregir. De ahí `CODIGO_PASSWORD_INVALIDA`.
- **Las temporales se generan y se comprueban.** `base64url` no garantiza 3 categorías por sí solo. Daba igual cuando nadie validaba; ahora una temporal que incumpla §1 sería una clave que el sistema emite y luego rechaza.
- **Un restablecimiento y una recuperación con éxito limpian el bloqueo.** Devolver el acceso es justo su función: dejar la cuenta bloqueada haría inútil la contraseña recién emitida.

### 4. Verificación

- **`npm run password:verificar` (script nuevo, 18 comprobaciones, todas OK)**: los casos de §1 —incluidos `ñ`, tilde, emoji, NBSP, ancho cero y el desbordamiento de 72 bytes con 40 `ñ`—, 500 temporales generadas que cumplen la política, y el ida y vuelta de hasheo con la forma descompuesta.
- **Migración aplicada contra la base real (Neon)** y comprobada después: `intentos_fallidos` e `intentos_fallidos_login` conviven como columnas separadas, y `ck_auditoria_accion` admite `cambiar_password`.
- `tsc --noEmit` limpio en los tres proyectos; `next build` correcto en `sitio-web` e `intranet`.

### Pendiente al cierre

- **§2 entero, sin empezar**: historial de las últimas 5 (necesita tabla nueva), expiración a 90 días (necesita `password_changed_at` — **ojo: `expiration_date` es la caducidad de la *cuenta*, RF-16, no de la contraseña**; mezclarlas rompería RF-16) y el evento `ContrasenaPorExpirar`.
- **El cron diario no existe** y hay que construirlo, no integrarse con él. `deactivateExpiredUsers()` ya está escrita y sin llamar: es el punto de partida.
- **Sin probar en ejecución**: el bloqueo de 5 intentos y las tres escrituras nuevas de bitácora se verificaron por tipos y esquema, no ejerciendo los endpoints contra la base.
- **Los roles son 6, no los 3 de la consideración 5**: falta decidir qué hacen `superadmin` y `visitante_interno` cuando se implemente la expiración de §2.

*(Cerrado en esta misma sesión: `4-reglas.md` se actualizó para que las directivas digan lo que el sistema hace de verdad — el tope real de 72 bytes, la admisión de `ñ` y tildes, la distinción entre el bloqueo por cuenta y el límite por IP, dónde se aplica la política y dónde no, y la consideración 3 corregida: el cron no existe, hay que construirlo. Se añadió además §5 con el estado de implementación por sección.)*

---

## sesión 04-08-2026: la pantalla `/admin/auditoria`, y dos administradores que no dejaban rastro

La sesión anterior dejó la bitácora escribiendo y su lectura cerrada por rol, pero **sin pantalla**: el enlace «Auditoría» del sidebar llevaba a un 404. Esta sesión construye la pantalla y cierra los huecos de registro que la habrían dejado medio vacía.

### 1. Lo que faltaba registrar (9 escrituras nuevas)

- **Usuarios** (`crear`, `actualizar`, `eliminar`), **roles** (`crear`, `actualizar`, `eliminar`) y **permisos de rol** (`assign`/`revoke`, como `actualizar` sobre la entidad `rol`, que es la pregunta que se le hace a una auditoría). Nada de esto dejaba huella: se podía cambiar quién puede publicar sin que constara en ningún sitio.
- **Eliminar una versión de página**, la única acción del ciclo editorial que destruye trabajo. No se podía registrar porque el use-case no devolvía el id de la página (`entidad_id` es NOT NULL); ahora devuelve `pagina` y `version` —cambio aditivo— y el controlador usa el `registrar(...)` que ya aceptaba `'eliminar'` sin que nadie lo invocara.

### 2. Dos hallazgos que no estaban en ninguna lista

- **`usuario_id` tiene clave foránea contra `usuarios`, `ON DELETE SET NULL`.** No era evidente hasta que una fila de prueba con un id inventado la hizo saltar. La consecuencia buena: borrar una cuenta **no** borra su rastro, y `usuario_nombre` (la única desnormalización del esquema) lo mantiene legible. Queda comprobado en el script para que nadie la cambie a `CASCADE` sin enterarse.
- **La cuenta maestra local no dejaba rastro de nada.** `login.usecase.ts` la autentica con `id: 'local-auth'`, que no es un UUID ni existe en `usuarios`: cada INSERT de auditoría reventaba contra esa foránea y `logAudit` se lo tragaba (por diseño: la bitácora no debe tumbar la petición). O sea que el administrador con más poder del sistema era el único sin bitácora. Se vio **en ejecución**, con el log de la API delante: `[Auditoría] No se pudo registrar «crear» sobre usuario …`. Arreglado en `datosDeAuditoria`: si el id no es referenciable va `null`, y el nombre se conserva.

### 3. Lo que se construyó

- **`shared/auditoria-campos.ts`**: el `camposDe` que vivía dentro de `contenido.controller.ts`, ahora compartido y con **lista de campos sensibles**. Era obligatorio antes de auditar usuarios: `updateUser` acepta `password` en el cuerpo, y sin esto la primera vez que un administrador cambiara una contraseña la bitácora la habría guardado en claro. No se omite el campo —que alguien cambió la clave es justo lo que hay que saber—, se sustituye el valor.
- **Repositorio**: filtros tipados (`FiltrosAuditoria`), **rango de fechas** y **tope de 200 filas por petición**. Antes `?limit=1000000` era una petición válida contra la tabla que más crece.
- **`shared/auditoria-dto.ts`**: la fila en snake_case pasa a camelCase (`entidadTipo`, `camposModificados`, `userAgent`, `fecha`), como el resto de la API. Se hizo ahora porque esta pantalla es el **primer** consumidor de `/api/audit-logs` y era la última oportunidad sin romper a nadie. Incluye la validación del querystring: lo que no encaja se descarta, ni filtra ni revienta.
- **`sitio-web/src/features/auditoria/`** (la feature que la guía listaba y no existía en disco) + **`app/admin/(shell)/auditoria/page.tsx`** + el proxy **`app/api/audit-logs/route.ts`**. Filtros por usuario, acción, entidad y fechas; paginación real; detalle en `<dialog>` nativo con campos modificados, IP y user-agent; exportación a CSV.
- **`middleware.ts`**: `/admin/auditoria` **no estaba en el `matcher`**, así que ni sesión exigía. Ahora entra y se limita a Superadmin/Administrador, espejo de `auditoria.policies.ts`.

### 4. Decisiones que no son obvias

- **El CSV escapa las fórmulas.** Una celda que empieza por `=`, `+`, `-` o `@` la abre Excel como fórmula, y este archivo se arma con texto que escribieron usuarios (nombres, motivos de rechazo). Un archivo de evidencia no puede ejecutar nada al abrirse.
- **La exportación recorre páginas (tope 4.000 filas) en vez de pedir una gigante.** Si no cabe, el aviso lo dice; no se miente por omisión.
- **El desplegable de usuarios sale de `/api/users`, no del hook de `administracion`.** Un filtro no justifica arrastrar el CRUD de usuarios a esta feature.
- **Se pasa por el proxy de Next y no por axios contra `:4000`** (el patrón de `paginas.service.ts`): el token vive en una cookie HTTPOnly que el proxy lee en servidor.
- **`antes` sigue en `null`**: el detalle dice «sin registro» en vez de fingir un valor anterior.

### 5. Verificación

- **`npm run auditoria:verificar`: 50 comprobaciones contra Postgres real, todas OK.** Nuevas: que la contraseña no llega a la bitácora, que la cuenta local sí deja rastro, la validación del querystring, el DTO, los filtros de fecha, el tope de límite, la paginación y la clave foránea.
- **En ejecución, contra la base real** (Neon; no hace falta Docker): la API responde el DTO nuevo, el tope de 200 se aplica, una acción inválida se descarta, un rango de 2020 devuelve 0, **Editor recibe 403 y un anónimo 401**. Se creó, editó y borró un usuario de prueba: las entradas quedaron con el nombre del administrador, con `password` como «valor omitido» y sin rastro de la contraseña en toda la tabla. Las filas de esa prueba se borraron después.
- **La ruta, servida**: sin sesión y como Editor redirige a `/admin/auth/login?redirect=/admin/auditoria`; como Administrador responde 200 con la vista.
- `tsc --noEmit` limpio en api-backend; `next build` correcto en sitio-web, con `/admin/auditoria` y `/api/audit-logs` en la tabla de rutas; ESLint limpio.

### Pendiente al cierre

- **No se abrió en un navegador de verdad.** La comprobación llegó hasta el HTML servido y el JSON de la API: falta ver la tabla pintada, abrir el detalle y descargar el CSV con una sesión real.
- **`packages/blocks-renderer` no tenía `node_modules`** y por eso el build de sitio-web fallaba con 12 errores ajenos a este cambio; se instalaron sus dependencias. Conviene que quede en el arranque del proyecto.
- **La API que corre en `:4000` en esta máquina es anterior a estos cambios**: hay que reiniciarla para que la pantalla lea el DTO nuevo.
- **`antes` con el valor real**, **escritura transaccional**, **bitácora *append-only*** y **registro de inicios de sesión** (necesita migración de `auditoria_accesos`) siguen abiertos.
- **Señalado, no tocado**: `/admin/revision` tampoco está en el `matcher` del middleware, y `/api/users` en el backend solo exige `requireAuth` sin filtro de rol — cualquier sesión puede listar usuarios.

---

## sesión 03-08-2026: `(admin)` pierde los paréntesis en sitio-web — se corrigen las rutas que quedaron colgando

El usuario quitó los paréntesis a la carpeta `(admin)` de `sitio-web` (ahora `app/admin/`), con lo que ese segmento pasa de ser un route group invisible a un tramo real de la URL: `/dashboard` pasó a vivir en `/admin/dashboard`, `/editor/[slug]` en `/admin/editor/[slug]`, etc. El cambio de carpeta no toca ningún string hardcodeado — así que todo lo que redirigía, enlazaba o protegía por la ruta vieja quedó apuntando a una URL que ya no existe.

### 1. Qué se corrigió

Barrido completo de `sitio-web/src` buscando toda referencia a las rutas viejas (`/dashboard`, `/users`, `/usuarios`, `/editor`, `/preview`, `/revision`, `/auditoria`, `/auth/login`, `/auth/cambiar-contrasena`) fuera de `app/admin/` mismo:

- **`middleware.ts`**: el `matcher` completo y todos los `pathname.startsWith(...)` / `NextResponse.redirect(...)` — sin este archivo, el gate de autenticación entero dejaba de proteger nada.
- **`shared/lib/session.ts`**: `resolveFirstAccessibleRoute` mandaba a los 5 roles a `/dashboard`.
- **`features/paginas/components/edit-button.tsx`** y **`lib/ruta-de-vuelta.ts`**: el botón de editar y el "volver" del editor.
- **`features/paginas/components/revision-queue-view.tsx`**: el enlace de vista previa del sitio (el de intranet, con `URL_INTRANET`, no cambia — esa app no tocó sus rutas).
- **`features/administracion/components/first-login-flow.tsx`** y **`panel-general.tsx`**: el logout, y los 15 enlaces del sidebar/navbar del panel (dashboard, usuarios, revisión, auditoría, y los de perfil/configuración/privacidad que hoy no tienen página propia — se dejaron como placeholders con el prefijo correcto, igual que ya lo eran antes).
- **`app/admin/auth/login/page.tsx`**: los 4 redirects internos post-login (dashboard, elección de editor, logout).

### 2. Una corrección de más

`panel-general.tsx` enlazaba **Auditoría** a `/dashboard/auditoria`. Eso ya estaba mal antes de este cambio: `auditoria` es hermana de `dashboard` bajo `(shell)`, nunca estuvo anidada. Se corrigió a `/admin/auditoria` en vez de perpetuar el anidamiento falso con `/admin/dashboard/auditoria`.

### 3. Verificación

- `next build`: limpio. La tabla de rutas confirma `/admin/dashboard`, `/admin/users`, `/admin/revision`, `/admin/editor/[slug]`, `/admin/preview/[slug]`, `/admin/auth/login`, `/admin/auth/cambiar-contrasena`.
- Grep final sin coincidencias sin prefijo salvo las correctas: rutas de `/api/users` (backend, ajeno a este route group), la URL del editor de intranet (`localhost:3001/editor/inicio`, otra app) y nombres de rol.

### Pendiente al cierre

- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms` (intranet), el renombrado de los bloques `Tasa*`, la divergencia de `IntranetTopbar`, `features/auth/api/` sin renombrar a `services/` (intranet), los permisos en servidor de `app/editor/[slug]/page.tsx`, y los enlaces placeholder de `panel-general.tsx` (buscar, inbox, mi-perfil, configuración, privacidad, soporte) que no tienen página propia todavía.

---

## sesión 03-08-2026: Las 5 secciones colapsan al comodín `[...puckPath]` (intranet)

`app/(secciones)/{inicio,tasa,matriz}/page.tsx` y las dos de `encuestas/` eran ~30 líneas cada una, casi idénticas entre sí y al comodín `[...puckPath]/page.tsx` que ya existía: mismo `obtenerPaginaPublicada(slug)` + `EditButton` + `ClientPuckRender`. En Next.js un segmento concreto gana al comodín, así que las cinco carpetas eran duplicación pura — el comodín podía hacer su trabajo, solo le faltaban dos cosas.

### 1. Por qué no era un borrado directo

El comodín arma el slug con `puckPath.join('/')`. Para `/matriz` (un segmento) eso ya coincidía con el slug real. Pero para `/encuestas/calidad-de-formacion` (dos segmentos) daba `'encuestas/calidad-de-formacion'` **con barra**, y el slug guardado en BD es `'encuestas-calidad-de-formacion'` **con guion** — a propósito, porque la API expone `/paginas/publica/:slug` y un parámetro de Express no cruza una barra (trampa ya documentada en la sesión del 31-07). Sin arreglar esto, borrar las dos carpetas de encuestas las habría dejado en 404 silencioso.

### 2. Qué se hizo

- **`puckPath.join('/')` → `puckPath.join('-')`** en el comodín. Para un segmento no cambia nada (`'matriz'` sigue siendo `'matriz'`); para dos, `'encuestas-calidad-de-formacion'` ya coincide con el slug real.
- **`generateMetadata` nuevo**, con un mapa `METADATA_POR_SLUG` que migra tal cual los 5 títulos/descripciones que tenía cada archivo. Un slug fuera del mapa (sección nueva, creada sin tocar código) cae al `titulo` real que ya devuelve la API (`PaginaPublicada.titulo`), en vez de quedarse sin metadata.
- **`obtenerPaginaPublicada` envuelto en `cache()`** de React — es la primera vez que se usa en el proyecto. Sin esto, `generateMetadata` y la página habrían pedido la misma página dos veces a la API en cada visita.
- **Mapa `ENVOLTORIO_POR_SLUG`** para la etiqueta (`div`/`main`) y clase de cada sección, migrado tal cual de los 5 archivos — incluido el `overflow-x-hidden` que traía matriz. Un slug fuera del mapa usa el `.pagina-slug` genérico que ya existía.
- **Borradas** las 5 carpetas: `inicio/`, `tasa/`, `matriz/`, `encuestas/calidad-de-formacion/`, `encuestas/seguimiento-laboral/` (y `encuestas/` misma, ya vacía). `app/(secciones)/` queda con `layout.tsx`, `[...puckPath]/` y `preview/[slug]/`.

### 3. Por qué esto sí es la escalabilidad que se buscaba

Antes, aunque el contenido ya fuera 100% editable desde BD, **agregar una sección nueva seguía exigiendo que alguien creara un `page.tsx`**. Con este cambio deja de ser así: una sección nueva se crea publicando una página con un slug nuevo desde el editor, sin tocar `app/` ni desplegar código — que es exactamente lo que pide el RF-01 ("el propio equipo del OLO edite y reorganice el contenido... sin intervención técnica").

### 4. Verificación

- `next build`: limpio, TypeScript incluido. La tabla de rutas ya no lista `/inicio`, `/tasa`, `/matriz` ni `/encuestas/*` como rutas propias — todo cuelga de `ƒ /[...puckPath]`.
- **No se pudo probar en navegador con datos reales.** Docker no está disponible en esta máquina (mismo bloqueo que la sesión anterior), así que no hay forma de levantar API + BD para confirmar visualmente que las 5 secciones siguen viéndose igual — en particular, que `ENVOLTORIO_POR_SLUG` reprodujo bien las clases de cada una. Pendiente de abrir con una sesión real.

### Pendiente al cierre

- **Abrir las 5 secciones en un navegador con sesión real** para confirmar visualmente el envoltorio y la metadata.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms`, el renombrado de los bloques `Tasa*`, la divergencia de `IntranetTopbar`, `features/auth/api/` sin renombrar a `services/`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 03-08-2026: La auditoría empieza a registrar, y se cierra su lectura

La decisión de cómo abordar la sección `/auditoria` que pidió el cliente se pasó por el council (`.claude/SKILL.md`, 5 asesores + revisión cruzada + presidente). El veredicto fue unánime en un punto: **construir la pantalla primero era construir sobre una tabla vacía**. Esta sesión hizo el backend; la pantalla queda para la siguiente.

También se completó el renombrado de carpetas `login/` → `auth/` que quedó a medias, y que tenía el login **inalcanzable en las dos apps**.

### 1. El diagnóstico, corregido

El registro de cambios (RF-07) se daba por casi terminado —«modelo, repositorio, listener, use-case y rutas están escritos y correctos»—. Verificando contra el código, eso era falso por tres motivos distintos:

- **`contenido.controller.ts` mandaba la acción en inglés** (`'create'`, `'update'`, `'delete'`), y la migración 006 dejó un `CHECK` que solo admite los verbos en español. Cada intento de registro violaba la restricción.
- **Nadie esperaba la promesa del INSERT.** El `try/catch` que lo envolvía era código muerto: no puede atrapar lo que no espera. El rechazo se perdía como *unhandled rejection*, sin excepción, sin log y sin rastro. Las dos causas juntas explican por qué nadie se enteró en meses.
- **`auditoria.listener.ts` escribía los nombres de columna anteriores a la 006** (`content_id`, `action_type`). Habría fallado por `entidad_id NOT NULL` si alguien lo hubiera invocado — pero no lo invocaba nadie, porque el `event-bus.ts` no lo importaba ningún módulo.

Y un hallazgo que no estaba en ninguna lista: **`/api/audit-logs` solo exigía `requireAuth`**. Sin control de rol, cualquier usuario autenticado —un `visitante_interno` incluido— podía leer la bitácora completa de todos sus compañeros, con IP y user-agent. Estaba así en producción.

### 2. Qué se hizo

- **Se cerró la lectura.** `auditoria.policies.ts` nuevo (superadmin y administrador, nadie más) + `requierePermisoAuditoria` en `permisos.middleware.ts`, aplicado con `router.use` para que ninguna ruta que se añada después pueda saltárselo.
- **`AuditRepository.create` dejó de recibir `any`.** `DatosAuditoria` ata `accion` a `AccionAuditable` y `entidadTipo` a `EntidadAuditable`. Mandar `'create'` en vez de `'crear'` **ya no compila**. La traducción a snake_case vive solo en el repositorio.
- **`logAudit` es `async`, se espera, y su error se registra** con la acción y la entidad. No se relanza: si la bitácora falla, la publicación no debe caerse — pero deja de fallar en silencio.
- **Las páginas registran por fin.** `guardarBorrador`, `enviarARevision`, `aprobar` y `rechazar` escriben su entrada. El rechazo guarda el motivo, que es la única explicación de por qué una versión volvió a borrador.
- **`ip` y `user_agent` se rellenan.** Las columnas existían desde la 006 y todas las filas las habrían tenido en NULL. `datosDeAuditoria(req)` las extrae en el borde; hacia los use-cases solo viajan datos, nunca el `Request`.
- **Borrados** `auditoria.listener.ts` y `event-bus.ts`, comprobado antes que no los importaba nadie.
- **Rutas `auth/` terminadas**: 30 referencias en 15 archivos. Intranet usa `/auth`, `/auth/recovery`…; sitio-web usa `/auth/login` y `/auth/cambiar-contrasena`, incluido el `matcher` del middleware.

### 3. Decisiones que no son obvias

- **El registro se quitó de `crearContenido`.** Escribía bien (con los valores post-006), mientras el controlador escribía mal. Al arreglar el controlador, mantener ambos habría **duplicado cada alta**. Manda el controlador porque es el único que ve la petición, y sin ella no hay IP ni nombre de usuario.
- **Se resolvió por rol y no con `requirePermission('auditoria.ver')`.** En `permisos` solo están sembrados `acceso.sitio` y `acceso.intranet`: exigir una clave inexistente habría dejado fuera a todo el mundo salvo al superadmin (que tiene bypass) hasta correr una migración.
- **Ni editor, ni director, ni subdirector leen la bitácora.** Guarda IP y user-agent de cada editor: es un registro sobre las personas que trabajan en el sistema. HU-07 la pide para el Administrador.
- **La escritura NO es transaccional todavía**, que es lo que el council señaló como correcto para una entidad pública. `PaginaRepository` no acepta `transaction` en ninguna operación, así que hacerlo bien exige refactorizarlo entero. Queda anotado en el propio `logAudit` como el siguiente paso, no como algo resuelto.

### 4. Verificación

- **`npm run auditoria:verificar` (nuevo): 19 comprobaciones contra Postgres real, todas OK.** Escribe una fila de verdad, la lee, comprueba acción, entidad, usuario, IP, user-agent, campos modificados y fecha, y la borra. Incluye que el `CHECK` sigue rechazando `'create'` — la red que atrapó el bug original. Sigue el patrón de `permisos:verificar` en vez de introducir Jest: el proyecto no tiene framework de tests.
- El tipado nuevo **encontró por sí solo una cuarta escritura** que nadie había señalado, en `contenido.usecase.ts`. Esa era exactamente su razón de ser.
- `tsc --noEmit` y `build` limpios en api-backend, intranet y sitio-web. `permisos:verificar` sigue en verde.

### Pendiente al cierre

- **La pantalla `/auditoria`.** La carpeta `(admin)/(shell)/auditoria/` ya existe vacía y el enlace del sidebar apunta a `/dashboard/auditoria`, que es 404: al crear el `page.tsx` hay que corregir ese `href` (`panel-general.tsx:125`).
- **Campos modificados de verdad.** Hoy `antes` va en `null` porque el controlador no tiene el estado anterior; hace falta que el use-case devuelva la versión previa y comparar el JSONB por rama.
- **Escritura transaccional** de la bitácora (requiere que `PaginaRepository` acepte `transaction`).
- **La bitácora no es *append-only*.** Si el rol de la aplicación puede `UPDATE`/`DELETE` sobre `auditoria_cambios`, no tiene valor probatorio. Falta revocar permisos o poner un trigger, y definir plazos de conservación.
- **Visitas y accesos de directores** siguen sin existir. `auditoria_accesos` no admite registrar inicios de sesión: su `CHECK` limita `recurso_tipo` a `archivo|pagina_interna|tablero` y `accion` a `ver|descargar`, con `recurso_id` NOT NULL. Registrar logins ahí exige una migración, no «un INSERT».
- Sigue en pie: migración de `shared/lib/blocks/` a `shared/ui/`, renombrado de los bloques `Tasa*`, divergencia de `IntranetTopbar`, permisos en servidor de `app/editor/[slug]/page.tsx`.

---

## sesión 02-08-2026: `auth/` y `login/` se fusionan (intranet)

Eran dos features del mismo dominio partidas por tipo técnico — lo documentaba ya `1-guia-del-proyecto.md` §4.3 y el propio comentario de cabecera de `features/login/index.ts` ("se fusionan en la fase 4"). `auth/` tenía el cliente HTTP y el hook; `login/` las ocho vistas que enruta `app/login/`.

### 1. Qué se hizo

- **Los 8 archivos de `features/login/ui/`** (`LoginView`, `FirstLoginView`, `RecoveryView`, `ResetPasswordView`, `ResetSuccessView`, `SecurityQuestionsView`, `QuestionPicker`, `AuthSuccessScreen`) se movieron a **`features/auth/components/`**, sin tocar su contenido — todas las referencias cruzadas entre ellas ya eran relativas (`./QuestionPicker`, `./AuthSuccessScreen`), así que siguieron resolviendo igual al moverse juntas.
- **`features/auth/index.ts`** absorbió los exports de `features/login/index.ts`: sigue exportando `authApi`, `useAuth` y el tipo `User`, y ahora también las seis vistas que enruta `app/login/` (`QuestionPicker` y `AuthSuccessScreen` se quedan sin exportar, como ya estaban — son piezas internas, no puntos de entrada).
- **Los 6 imports en `app/login/*/page.tsx`** pasaron de `@/features/login` a `@/features/auth`.
- **`features/login/` se borró completa.** `features/` de intranet queda con solo `auth` y `paginas` — los dos dominios que le quedan a la app fuera del catálogo de bloques.
- Se usó `components/` (no `ui/`) para el nombre de la carpeta nueva, según la convención de `1-guia-del-proyecto.md` §4.0 — `ui/` es el nombre reservado al sistema de diseño. No se tocó `features/auth/api/`; renombrarla a `services/` (la otra desviación que señala el mismo documento) no se pidió en esta pasada.

### 2. Verificación

- `next build`: limpio. Las 6 rutas de login (`/login`, `/login/first-login`, `/login/recovery`, `/login/reset-password`, `/login/reset-success`, `/login/security-questions`) siguen compilando y listadas en el build.
- `grep` confirma cero referencias restantes a `features/login` en todo `intranet/src`.

### Pendiente al cierre

- **`features/auth/api/` sigue llamándose `api/`, no `services/`** — la segunda desviación de convención que señala `1-guia-del-proyecto.md` §4.3 para este mismo módulo, no incluida en el pedido de esta sesión.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms`, el renombrado de los bloques `Tasa*` mal nombrados, la divergencia de `IntranetTopbar`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 02-08-2026: Espaciado y disposición configurables en todo el catálogo

Quien edita ya puede ajustar **relleno, separación, ancho y dirección** de los bloques desde el panel del editor, en las dos apps. Antes solo se podía elegir entre las variantes que cada bloque hubiera previsto (`fondo: blanco|gris`, `ancho: estrecho|ancho`); todo lo demás exigía tocar CSS y desplegar.

La pieza vive en `packages/blocks-renderer` (`primitives/controles-de-caja.tsx`), así que **es la misma en intranet y en sitio-web** — que era el punto de partida del encargo.

### 1. Qué se hizo

- **`conCaja(config)`** envuelve un `ComponentConfig` de Puck: le añade el grupo de campos «Espaciado y ancho» y mete su render en un `<div>` con los estilos resueltos. **`conCajaEnTodos(catalogo, { excepto })`** hace lo propio con un catálogo entero.
- **Las dos apps lo aplican sobre su catálogo completo**: `puckConfig` pasó a ser `puckConfigBase` + una pasada de `conCajaEnTodos`. Ningún bloque declara esos campos a mano.
- **Los primitivos se rehicieron sobre la misma escala.** `Grid` pasó a `Columnas` (con alineación vertical), `Flex` a `Fila o columna flexible` (con apilado en móvil), `Space` a `Espacio en blanco`. Las **claves de los componentes no cambiaron** — solo las etiquetas, por la regla de la sesión del 31-07.
- **CSS nuevo** (`.olo-caja`, `.olo-flex`, `.olo-grid` ampliada) en el `globals.css` de cada app.

### 2. Decisiones que no son obvias

- **Todo cuelga de un único campo `object` llamado `caja`.** Con campos sueltos habría choque inmediato: `TextoRico` ya tiene `ancho` y media intranet tiene `fondo`. Agrupado no hay colisión posible, ni con los bloques de hoy ni con los de mañana, y en el JSONB queda todo bajo `props.caja`.
- **Sin valores puestos NO se pinta el `<div>` envolvente.** Es lo que permite aplicar esto a los veintitantos bloques sin revisar página por página: mientras nadie toque los campos nuevos, el HTML publicado es byte a byte el de antes. `estiloDeCaja` decide con `aplica`.
- **`conCaja` es idempotente** (marca `__oloConCaja`). No es paranoia: `primitiveComponents` ya entrega `Grid` y `Flex` envueltos, y encima cada app pasa `conCajaEnTodos`. Sin la marca, el bloque acababa con **dos divs anidados leyendo el mismo valor** y el espaciado salía duplicado, sin que nada lo delatara en el editor.
- **Escala con nombres, no píxeles libres.** «Medio» y no «24px»: mantiene las secciones coherentes entre sí y encaja con el lenguaje sin jerga del resto del editor. `pixelesDeEspacio` acepta igualmente un número, así que un `gap: 24` guardado con la versión anterior de `Grid`/`Flex` sigue midiendo 24.
- **La barra y el pie quedan excluidos** (`BLOQUES_SIN_CAJA`). La barra es `position: sticky`: encerrarla en un div que mide lo mismo que ella la deja sin recorrido donde pegarse al hacer scroll. Además las coloca la plantilla, no las secciones.
- **El espaciado se aplica con variables CSS sobre una clase, no inline.** En móvil se reduce al 60 % y las filas se apilan; un estilo inline no puede llevar media queries. Por eso el paquete dice *cuánto* espacio se pidió y la app decide *cómo* se ve en cada tamaño.
- **Regla 10 (`4-reglas.md`) revisada: no hace falta migración.** El cambio al JSONB de `layout` es aditivo (`props.caja` nuevo) y retrocompatible en los dos sentidos; se comprobó además que **ningún contenido sembrado usa `Grid`, `Flex` ni `Space`**, que son los únicos bloques cuyos valores cambiaron de forma (número → clave de escala).

### 3. Verificación

- **18 comprobaciones de la lógica pura** (escala, resolución de estilos, idempotencia, exclusiones) ejecutadas con ts-node: todas pasan. Incluye el caso «caja por defecto no genera envoltorio».
- **20 comprobaciones sobre el HTML real**, pasando el `Render` de Puck por `renderToStaticMarkup`: verifican el slot (que solo existe dentro de Puck), las variables CSS emitidas, el apilado en móvil, que un bloque sin `caja` no genera envoltorio y que **no hay doble envoltorio**. Este es el HTML que produce una fila flexible con dos bloques dentro:

  ```html
  <div class="olo-caja" style="--olo-caja-interior-y:40px;--olo-caja-ancho:1200px">
    <div class="olo-flex olo-flex--apilar" style="--olo-flex-dir:row;--olo-flex-justify:space-between;--olo-flex-align:center;--olo-flex-gap:40px;--olo-flex-wrap:wrap">
      <p>izquierda</p><p>derecha</p>
    </div>
  </div>
  ```
- `tsc --noEmit`: limpio en las dos apps. En el paquete queda **un error preexistente y ajeno** en `registry.ts` (`Hero` vs. `BlockType`), que ya estaba antes de esta sesión.
- `next build`: correcto en las dos apps. Se comprobó en el CSS compilado que `.olo-caja`, `.olo-caja--derecha` y `.olo-flex--apilar` llegan al bundle con sus variables y su media query.
- ESLint limpio en los dos `puck.config.tsx`.

### Pendiente al cierre

- **No se ha abierto el editor en un navegador.** Falta ver el grupo «Espaciado y ancho» desplegado en el panel y arrastrar un bloque dentro de una fila flexible con una sesión real. No se pudo levantar el entorno: `docker` no está disponible en esta máquina, y sin API ni base de datos el editor no llega a montarse.
- Los campos se ofrecen en **todos** los bloques del catálogo. Si en la práctica resulta ruidoso en los que ya traen su propio espaciado (`TextoRico`, `TextoConImagen`), la lista `BLOQUES_SIN_CAJA` es el sitio para recortarlo.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/`, la divergencia de `IntranetTopbar`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 02-08-2026: Se borra el código muerto de la migración a Puck (intranet)

Las cinco secciones (`inicio`, `tasa`, `matriz`, las dos encuestas) llevaban desde la sesión del 31-07 leyendo su contenido de la base de datos. Los componentes React fijos que las generaban antes (`InicioView`, `MatrizView`, `TasaView`, `CalidadFormacionView`, `SeguimientoLaboralView`) quedaron sin ninguna referencia desde `app/`, pendientes de borrar desde esa misma sesión (§ Pendiente).

La decisión de **cómo** organizar el reemplazo (`shared/lib/blocks/` plano vs. carpeta por sección vs. alinear con `shared/ui/organisms` de `sitio-web`) se pasó por el council (`.claude/SKILL.md`, 5 asesores + revisión cruzada + presidente). Veredicto: no organizar por sección consumidora — la mayoría de los 25 bloques son transversales o se reutilizan en 2-4 secciones (`TasaDashboards`/`TasaPresentacion` nacieron en tasa y hoy también viven en matriz y las dos encuestas, sin tocar el archivo), así que "carpeta por sección" genera reorganizar cada vez que el negocio reutiliza algo. La migración completa a `shared/ui/organisms` queda pendiente de ejecutar; esta sesión solo cubrió el borrado seguro.

### 1. Qué se hizo

- **`PptxViewer.tsx` se movió** de `features/tasa/ui/` a `shared/lib/blocks/`, con sus dos imports (`DescargasConPresentacion.tsx`, `TasaPresentacion.tsx`) actualizados a ruta relativa. Era la única dependencia viva que un bloque nuevo tenía sobre una vista vieja — sin este paso, borrar `features/tasa` rompía el build.
- **Borrado**: `features/tasa/`, `features/inicio/`, `features/matriz/`, `features/encuestas/` completas (vistas + `index.ts` + carpeta). `features/` queda con solo `auth`, `login` y `paginas` — los tres dominios que sí siguen vivos.
- **Borrado**: `app/preview/[slug]/` vacía, resto del `git mv` a `app/(secciones)/` de la sesión del 01-08. `app/encuestas/` ya no existía (se limpió sola en un paso anterior).

### 2. Decisiones que no son obvias

- **No se tocó la ubicación de los otros 24 bloques.** El council recomendó migrar `shared/lib/blocks/` completo a `shared/ui/organisms/` (alineado con `sitio-web`) y renombrar `TasaDashboards`/`TasaPresentacion` (ya no son solo de tasa), pero eso es una reorganización aparte con más superficie de cambio (~25 imports en `puck.config.tsx`). Esta sesión resolvió solo lo que bloqueaba el borrado de código muerto.
- **Los revisores del council, verificando contra el repo, encontraron un bug no relacionado que sigue abierto**: `shared/lib/blocks/IntranetTopbar.tsx` (copia local) ya divergió de la versión en `packages/blocks-renderer` que sí consume `sitio-web` — props distintas (`menuItems` con submenús vs. stub simple). No se tocó en esta sesión; queda para cuando se aborde la migración a `shared/ui/organisms`.
- **Búsqueda de referencias antes de borrar**: se confirmó con grep que las únicas coincidencias externas a las 4 carpetas eran comentarios de documentación en `Publicaciones.tsx` y `RecursosVisualesBloque.tsx` ("viene de `features/inicio/ui/...`"), no imports.

### 3. Verificación

- `tsc --noEmit`: limpio, cero errores.
- `next build`: compiló en 7.7s, generó las 15 páginas estáticas/dinámicas, incluidas `/inicio`, `/tasa`, `/matriz`, `/encuestas/calidad-de-formacion`, `/encuestas/seguimiento-laboral` desde `(secciones)/`. Único warning: `middleware.ts` deprecado en Next.js 16 (preexistente, no relacionado).

### Pendiente al cierre

- Migrar `shared/lib/blocks/` → `shared/ui/{atoms,molecules,organisms}`, con subcarpeta por sección solo para los bloques genuinamente exclusivos (`MatrizBanner`, `EncuestaBanner`, `Publicaciones`, `RecursosVisualesBloque`, `PreguntasFrecuentes`).
- Renombrar `TasaDashboards` → `TableroPowerBi`, `TasaPresentacion` → `PresentacionPptx`, `TasaVideo` → `VideoEmbebido` (ya no son exclusivos de tasa).
- Resolver la divergencia entre `shared/lib/blocks/IntranetTopbar.tsx` y `packages/blocks-renderer` antes de que alguien edite una copia asumiendo que son la misma.
- Sigue en pie de sesiones anteriores: permisos en servidor en `app/editor/[slug]/page.tsx`, conectar `Publicaciones` a `contenidos`, los 4 enlaces sembrados sin URL.

---

## sesión 01-08-2026: El menú y el pie pasan a ser una plantilla única

Hasta hoy la barra de navegación y el pie **no eran un layout**: eran dos bloques de Puck guardados **dentro del contenido de cada sección**, uno por página. Cinco copias independientes en la base de datos. Editar el menú desde `/inicio` solo cambiaba `/inicio`, y con el tiempo divergieron.

**La divergencia ya había ocurrido y se puede señalar con el dedo:** `sembrar-pagina-tasa.ts` sembraba `bloque('IntranetTopbar', 'tasa-topbar')` **sin props**, así que caían los `defaultProps` de `puck.config.tsx` —que traen «Encuestas» como desplegable con sus dos hijos—. `sembrar-paginas-intranet.ts`, en cambio, sobrescribía `menuItems` con un `MENU` plano donde «Encuestas» era un enlace suelto a Calidad de Formación. Resultado: el desplegable **solo existía en `/tasa`**, y esa era la versión buena.

### 1. Qué se hizo

Se eligió sacar el marco del contenido en vez de sincronizar las cinco copias, porque el problema no era que estuvieran desincronizadas: era que existían cinco.

- **Página `plantilla` nueva** (`ambito='intranet'`): guarda un `IntranetTopbar` y un `IntranetFooter`, una sola vez. Se edita en `/editor/plantilla` con el mismo ciclo que cualquier página —borrador, revisión, aprobación—, sin tocar API ni permisos.
- **`app/(secciones)/layout.tsx`** (nuevo): lee la plantilla y pinta la barra y el pie alrededor de las cinco secciones. El login y el editor quedan fuera porque viven fuera del grupo de rutas.
- **`features/paginas/lib/plantilla.ts`** (nuevo): `obtenerPlantilla()` extrae las props del bloque guardado. **No lanza nunca** — esto envuelve toda la intranet, y si la API no responde debe quedar la barra por defecto en vez de romper el árbol desde el layout.
- **`migrar-plantilla-intranet.ts`** (nuevo, `npm run migrar:plantilla`): publica la plantilla con el menú de `/tasa` y quita los dos bloques del contenido publicado de las cinco secciones. Pasa por el ciclo editorial, no toca filas a mano.
- **Los dos scripts de siembra dejan de sembrar barra y pie**, o volverían a meter las copias en la siguiente ejecución.
- **`PlantillaEditButton`** (nuevo): segundo botón flotante, apilado sobre el de la sección y en tono más apagado. Es cliente solo para saber desde dónde se abrió y poder volver: `/plantilla` no es una página visitable.

### 2. Decisiones que no son obvias

- **`IntranetTopbar` e `IntranetFooter` siguen registrados en `puckConfig`** pero salieron de `BLOQUES_COMUNES`: ya no se ofrecen al editar una sección, porque ofrecerlos sería volver a permitir una barra distinta por página. Se quedan registrados porque puede haber contenido guardado que los use, y un `type` desconocido desaparece sin avisar (trampa ya documentada en la sesión del 31-07).
- **La plantilla se sembró con las props escritas enteras**, no vacías como en `/tasa`. El layout lee esas props **directamente de la base, sin pasar por Puck**, y es Puck quien rellena los `defaultProps`: dejarlas vacías habría dado una barra sin menú.
- **`min-h-screen` fuera de las cinco páginas.** Con el pie ya fuera del contenido, sumaba una pantalla de más y obligaba a desplazarse siempre. Ahora el alto lo gobierna `.intranet-contenido { flex: 1 }` del layout.
- **`/plantilla` devuelve 404** desde el comodín `[...puckPath]`: sin ese corte mostraría la barra y el pie otra vez, duplicados dentro del marco que ya los pinta.
- **Vista previa:** al quedar dentro de `(secciones)` hay dos barras pegajosas peleando por `top: 0`. Manda el aviso de «sin publicar» y la navegación deja de ser fija ahí (`body:has(.preview-page) .intranet-topbar`).

### 3. Verificación

- `tsc --noEmit` del backend limpio; `next build` de la intranet limpio, TypeScript incluido. *(Un `tsc` suelto en la intranet da 7 errores de `.next/types/validator.ts` apuntando a rutas anteriores al grupo `(secciones)`: es caché obsoleta, el build la regenera.)*
- **Migración ejecutada contra la base local.** Las cinco secciones bajaron de 9/9/7/7/6 bloques a 7/7/5/5/4, y apareció `plantilla` con 2. Segunda ejecución: «ya estaba limpia» en las cinco — idempotente.
- **Render comprobado con el servidor arrancado**: las cinco rutas responden 200 y cada una trae **exactamente un** topbar, **un** footer y **un** desplegable de Encuestas. Antes el desplegable estaba solo en `/tasa`. `/plantilla` responde 404 y `/editor/plantilla` responde 200.

### 4. Rediseño de la cabecera del editor

Segunda petición de la misma sesión: oscurecer el editor y dejar clara la acción que destruye trabajo.

- **Cabecera y barra de complementos en `#001631`.** Se hizo con las **variables de tema de Puck** (`--puck-header-color-bg`, `--puck-header-color-text`, `--puck-pluginbar-color-bg` y sus cuatro compañeras de texto/hover), no tocando `_PuckLayout-nav_mr27u_197`: ese nombre lleva un hash de CSS modules que cambia al actualizar el paquete y dejaría los estilos colgando sin que nada falle. Las dos únicas reglas que sí miran a clases de Puck lo hacen **por subcadena** (`[class*="PuckHeader-inner"]`), que sobrevive al hash.
- **Botones**: «Salir» pasa a rojo `#dc2626`, «Enviar a revisión» al verde pedido `#7DB828`, «Guardar borrador» se queda en el azul que tenía. Los estilos en línea se movieron a clases `.olo-editor-btn--*`.
- **Modal de salida** en vez de `window.confirm`: explica que se pierde lo editado desde el último guardado, que no se recupera y que la página seguirá mostrando la versión publicada. Es un **`<dialog>` nativo** — se pinta en la capa superior del navegador, así que no hay que pelear con el apilamiento del editor, y trae el foco atrapado y el cierre con Escape sin código extra. El botón enfocado por defecto y el clic fuera son «Seguir editando»: ante la duda, la opción que no borra nada.
- **Colores de estado aclarados** (`#fbbf24`, `#7dd3fc`, `#86efac`, `#fca5a5`): los planos anteriores eran ilegibles sobre azul marino.
- **El texto de «Enviar a revisión» va en `#001631`, no en blanco.** Blanco sobre `#7DB828` da 2.4:1; con el azul marino sube a 7.6:1 **sin cambiar el color pedido**. Es el mismo `#7db728` que la sesión del 26-07 midió como el peor de la paleta.

Verificado: `next build` y `eslint` limpios, y las variables confirmadas en el CSS compilado (`.olo-editor{--puck-header-color-bg:#001631;…}`) contra los nombres que consume el paquete instalado.

### Pendiente al cierre

- **La cabecera del editor no se vio en un navegador.** El editor solo se monta en cliente tras cargar datos de la API con sesión, así que la comprobación llegó hasta el CSS compilado. Falta abrirlo con una sesión real para juzgar el resultado.
- **`/preview/[slug]` no se pudo probar en ejecución.** El servidor devuelve 500 porque la API rechaza (401) los tokens de prueba: el middleware busca el usuario en la base y el sintético no existe. El archivo es **idéntico byte a byte** al de antes de esta sesión (solo cambió de carpeta), así que el 500 es del token, no de la migración — pero **conviene abrirla con una sesión real** para confirmar que el marco se ve bien con el aviso amarillo encima.
- Sigue en pie lo de la sesión anterior: borrar las `*View.tsx` sin uso, permisos en servidor en `app/editor/[slug]/page.tsx`, conectar `Publicaciones` a `contenidos` y los 4 enlaces sembrados sin URL.

---

## sesión 31-07-2026: Inicio, Matriz y Encuestas migradas al editor
Update Todos
Crear los bloques Puck nuevos en shared/lib/blocks/
Registrarlos en puck.config.tsx y filtrar el catálogo por página
Script de siembra para las 4 páginas
Cambiar los 4 page.tsx a leer de BD con EditButton
Limpiar la semilla obsoleta de inicio y reetiquetar bloques Tasa
Verificar: typecheck, lint, build y render de las 4 páginas
Actualizar 6-auditoria.md con lo implementado


`/inicio`, `/matriz`, `/encuestas/calidad-de-formacion` y `/encuestas/seguimiento-laboral` **ya tienen botón «Editar» y ciclo de versiones**, igual que `/tasa`. Las cuatro leen su contenido de la base de datos.

La sesión empezó como análisis; la decisión se pasó por el council (`.agent/SKILL.md`) y después se contrastó cada afirmación contra el código —**dos conclusiones del council resultaron falsas al verificarlas**, y una tercera cambió el plan por completo (Puck ya traía campo de texto enriquecido). Lo implementado está en el §6.

### 1. Estado de partida (verificado en el código, no supuesto)

Lo que Tasa dejó montado y que las cuatro páginas restantes **heredan sin trabajo adicional**:

| Pieza | Dónde | Sirve tal cual |
|---|---|---|
| Botón editar por slug | `features/paginas/components/edit-button.tsx` | Sí |
| Lectura de la versión publicada | `paginas.api.ts` → `obtenerPaginaPublicada(slug)` | Sí |
| Pintado de bloques | `client-puck-render.tsx` | Sí |
| Editor + guardar/enviar a revisión | `app/editor/[slug]/`, `use-editor-actions.ts` | Sí |
| Vista previa de lo no publicado | `app/preview/[slug]/page.tsx` | Sí |
| Cola de aprobación | `sitio-web/src/app/(admin)/(shell)/revision/` | Sí |
| Permisos por rol | `permisos.middleware.ts`, `paginas.policies.ts` | Sí |
| Separación por ámbito | cabecera `X-Ambito: intranet` en `api-client.ts` | Sí |

**Consecuencia: la migración es 100 % trabajo de frontend.** No hay que tocar la API, ni la base de datos, ni el ciclo editorial. Todo lo que falta es (a) convertir secciones fijas en bloques de Puck, (b) registrarlos en `config/puck.config.tsx`, (c) un script de siembra por página y (d) cambiar cada `page.tsx` para que lea de la BD.

**Corrección a una nota anterior:** la cola de revisión de la intranet **no existe como pantalla propia**. Es la de `sitio-web`, que ya distingue ámbito, etiqueta cada fila como «Sitio web» / «Intranet» y abre la vista previa de las páginas de intranet contra `NEXT_PUBLIC_INTRANET_URL`. No hay que crear nada.

### 2. Inventario: qué se convierte en bloque y qué ya está hecho

**`/matriz`** (`MatrizView.tsx`, 142 líneas) — la más barata con diferencia. Sus secciones de video, tablero y presentación **ya usan las clases `.tasa-video-*`, `.tasa-dashboards-*` y `.tasa-ppt-*`**, así que los bloques `TasaVideo`, `TasaDashboards` y `TasaPresentacion` que ya existen la cubren sin escribir un componente nuevo. Bloques nuevos que necesita: banner propio, texto con lista, imagen destacada, carrusel, lista de descargas.

**`/encuestas/calidad-de-formacion`** (147 líneas) — reutiliza `IntranetHero`, `.tasa-video-*` y `.tasa-ppt-*`. Nuevos: bloque de texto en dos columnas con imagen, botón de descarga de archivo.

**`/encuestas/seguimiento-laboral`** (137 líneas) — hero propio con degradado, texto, dos imágenes de resultados, sección de dos columnas.

**`/inicio`** (`InicioView.tsx`, 478 líneas) — la más cara y la única con deuda técnica de fondo. Ocho secciones: hero, dos carruseles, imagen #datoOLO, playlist de YouTube (`RecursosVisuales`), «Últimas publicaciones», «Preguntas frecuentes», footer.

**El carrusel es el bloque con mayor retorno:** el mismo componente `shared/ui/organisms/Carousel` aparece **tres veces** (dos en inicio, una en matriz) con distinta configuración. Un solo bloque con un `array` de imágenes y campos `itemsPerPage` / `autoplay` / `showButtons` cubre los tres casos.

### 3. Decisiones tomadas

**(a) Bloques compartidos, catálogo filtrado por página — no bloques por página.**
`puck-editor-wrapper.tsx` importa `puckConfig` directamente (línea 19) y lo fija en `config={puckConfig}` (línea 277). Hoy el catálogo es el mismo para todas las páginas, así que un funcionario editando Inicio ve cinco bloques «Tasa · …» que no le sirven. Resolver esto **no exige duplicar bloques**: basta con resolver la config por slug en ese punto y filtrar las categorías. El dilema «genérico vs. específico» era falso.

**Etiquetas sí, identificadores no.** Lo que el funcionario lee es el `label` (`'Tasa · Video'`), no la clave del componente (`TasaVideo`). Cambiar los `label` a «Video embebido», «Tablero Power BI», «Presentación descargable» cuesta minutos y **riesgo cero**. Cambiar las claves sí rompe: el JSON guardado en `paginas_versiones` lleva `type: "TasaVideo"`, y en el renderizador de Puck (`dist/index.js`) hay un punto que devuelve `null` ante un tipo desconocido y otro que accede a `Component.fields` sin comprobar — o la sección desaparece sin avisar, o la página revienta. Renombrar claves solo con re-siembra (`sembrar-pagina-tasa.ts` es idempotente y está pensado para eso), y aun así las versiones antiguas en borrador o rechazadas quedarían rotas. **Se cambian etiquetas, no claves.**

**(b) Texto rico: campo nativo de Puck, no `EditorJsWrapper` ni troceado en fragmentos.**
Los párrafos de encuestas llevan negritas a mitad de frase, y el truco de Tasa (partir el título en `tituloInicio` + `tituloDestacado`) no escala a eso. **Puck 0.22.2 ya trae `type: "richtext"` de serie** — `RichtextField` con `renderMenu` / `renderInlineMenu`, y el paquete exporta `RichTextMenu`. Está en `node_modules/@puckeditor/core/dist/actions-*.d.ts:219`. No hace falta enchufar `EditorJsWrapper` (proyecto aparte) ni inventar un `array` de `{texto, negrita}` que convertiría cada párrafo en un formulario ilegible. **Antes de comprometerse con encuestas hay que probar el campo `richtext` en un bloque de juguete**, porque toda la estimación depende de que funcione.

**(c) «Últimas publicaciones» sale del alcance de esta migración.**
Son 7 PDFs escritos a mano en `InicioView.tsx`, con miniaturas generadas por pdf.js **cargado por `<script>` desde un CDN de Cloudflare** y cacheadas en `sessionStorage`. Convertir eso en un `array` editable institucionaliza el problema: el funcionario tendría que repegar enlaces a mano cada vez que salga una publicación, para siempre. Y no hace falta: **la base de datos ya está diseñada para servir esto**. La tabla `contenidos` tiene `estado` y `publicado_en`, y la invariante I5 de `11-base-de-datos.md` existe literalmente por este motivo — «RF-10 y "Últimas publicaciones" no pueden ordenar por `NULL`». O sea que hay una copia a mano de algo que el backend ya sabe servir.
→ En esta migración entra como bloque **sin campos editables**, que pinta el componente actual tal cual. Conectarlo a `contenidos` es tarea aparte, y el bloque, una vez exista, se podrá poner en cualquier página.

**(d) Orden: Matriz → Encuestas → Inicio.**
Matriz primero porque es la única que no estrena ningún problema: valida el patrón, y de paso **migra el token del informe a dato configurable**, con lo que deja de quedar ninguna URL de Power BI literal en archivos `.tsx`. Encuestas después, las dos juntas porque comparten estructura, una vez probado `richtext`. Inicio al final y recortada.

**Corrección sobre (c) al implementar:** «Últimas publicaciones» sí quedó con la lista editable, en contra de lo decidido arriba. El motivo: dejarla sin campos mantenía el estado de hoy, donde publicar un boletín exige un desarrollador y un despliegue. Con el campo `array` pasa a exigir un funcionario y una aprobación, que es estrictamente mejor y no estorba a la integración con `contenidos` — cuando esa llegue, la lista queda como respaldo. El resto de la decisión (que la fuente real debe ser `contenidos`) sigue en pie.

### 4. Lo que se arregla de paso (y que hoy está roto en producción)

- `InicioView.tsx` tiene **`href="AQUI_VA_LINK_1"` y `href="AQUI_VA_LINK_2"`** en las tarjetas de Preguntas Frecuentes. Están así en producción.
- `MatrizView.tsx` tiene **dos `href="#"`** en la sección «Descargas» (Matriz de pertinencia 2025 y 2024).
- Sembrar esos marcadores tal cual sería heredar un botón roto con una interfaz bonita encima. Se piden los enlaces reales antes de sembrar; si no los hay, el bloque se siembra sin la tarjeta en vez de con un enlace muerto.
- La migración es también el momento natural para los dos pendientes de accesibilidad de los iframes: **`sandbox`** (hoy sin aplicar) y **`title` obligatorio** (hoy a medias). Los dos se aplican en `config/puck.config.tsx` y en el bloque nuevo.

### 5. Riesgos y cabos sueltos detectados

- **`app/editor/[slug]/page.tsx` no verifica permisos en servidor.** Sigue el `TODO` de fase 4-5: cualquier usuario autenticado abre `/editor/<slug>`. La API responde 403 al guardar, así que no se puede escribir nada, pero el editor se abre y carga el contenido. Con cinco páginas editables en vez de una, esto pasa de detalle a agujero.
- **`features/paginas/lib/page-seeds.ts` tiene una semilla de `inicio` obsoleta** (3 bloques: topbar, hero, footer) que no se parece a la página real de 8 secciones. Su propio comentario lo admite. Al migrar inicio hay que sustituirla o borrarla, o el editor arrancará pre-llenado con una página que no es.
- **Verificación de la siembra.** El script copia el contenido a mano; transcribir párrafos con negritas o URLs de Power BI es propenso a error. La siembra pasa por revisión, así que quien apruebe debe comparar contra la página anterior — conviene sembrar y comparar en `/preview/<slug>` **antes** de cambiar el `page.tsx` a leer de BD, que es lo que hace el cambio visible.
- El renderizado del carrusel de publicaciones depende de un **CDN externo** (`cdnjs.cloudflare.com`). Si no responde, no hay miniaturas y el funcionario no tiene forma de saberlo. No lo resuelve Puck; queda anotado.

### 6. Lo implementado

**11 bloques nuevos** en `shared/lib/blocks/`, pensados para compartirse en vez de uno por sección:

| Bloque | Lo usan |
|---|---|
| `SeccionCarrusel` | inicio ×2, matriz |
| `ImagenDestacada` | inicio, matriz, seguimiento laboral ×2 |
| `TextoRico` (richtext) | matriz, seguimiento laboral |
| `TextoConImagen` (richtext) | calidad de formación, seguimiento laboral |
| `DescargasConPresentacion` | matriz, calidad de formación |
| `MatrizBanner`, `EncuestaBanner` | su sección |
| `RecursosVisualesBloque`, `Publicaciones`, `PreguntasFrecuentes` | inicio |
| `resaltar()` | ayudante compartido por todos |

`TasaVideo` ganó una descarga opcional en vez de duplicarse: es lo que necesitaba la encuesta de calidad, que tiene el botón de XLSX dentro de la franja del video. Sus estilos en línea y los `onMouseOver` del JSX pasaron a CSS (`.tasa-video-descarga`).

**Títulos con una sola regla.** Los titulares llevan negrita en sitios distintos («**OLO**tecuenta», «#dato**OLO**», «**Recursos** visuales»). En vez de dos campos por título como en Tasa —que obliga a un campo nuevo por cada negrita—, `resaltar()` interpreta `**` y respeta los saltos de línea. Un campo, una regla que recordar.

**Catálogo filtrado por sección.** `configDeEdicion(slug)` en `puck.config.tsx` recorta el selector a los bloques que tienen sentido en cada página. `ClientPuckRender` sigue usando el catálogo **completo**: si se pinta con una config recortada, un bloque guardado que no esté en ella desaparece sin avisar. Los bloques heredados del sitio público siguen registrados por eso mismo, pero ya no se ofrecen en la intranet.

**Etiquetas cambiadas, claves intactas.** `TasaVideo` → «Video embebido», `TasaDashboards` → «Tableros Power BI», `TasaPresentacion` → «Presentación (PPTX)». Las claves no se tocan, así que el contenido ya publicado de Tasa sigue pintándose.

**Siembra:** `api-backend/scripts/sembrar-paginas-intranet.ts` (`npm run sembrar:intranet`, o con un slug para sembrar solo una). Pasa por el ciclo real borrador → revisión → aprobación y es idempotente. Se añadió también `npm run sembrar:tasa`, que existía como script suelto.

**Los enlaces rotos ya no se heredan.** Las dos tarjetas de FAQ y las dos descargas de matriz se sembraron **sin URL**: se leen, pero no fingen ser pulsables. Rellenarlos es ahora una edición, no un despliegue.

**Semilla obsoleta eliminada.** `page-seeds.ts` tenía una semilla de `inicio` de 3 bloques que no se parecía a la página real de 9; abrir el editor con ella habría hecho creer que ese era el contenido.

**Verificación ejecutada:** `tsc --noEmit` limpio en intranet y api-backend; `next build` correcto (las 4 rutas pasan a dinámicas, como `/tasa`); `eslint` sin ningún problema nuevo —los 3 errores de `PptxViewer` son previos y ese archivo no se tocó—; siembra corrida dos veces para comprobar que es idempotente; y las 5 páginas servidas y comprobadas contra el servidor real:

| Ruta | HTTP | Botón editar | Contenido comprobado |
|---|---|---|---|
| `/inicio` | 200 | `/editor/inicio` | carrusel, publicaciones, playlist, FAQ |
| `/matriz` | 200 | `/editor/matriz` | carrusel, texto rico, iframe Power BI |
| `/encuestas/calidad-de-formacion` | 200 | `/editor/encuestas-calidad-de-formacion` | texto rico, botón de descarga |
| `/encuestas/seguimiento-laboral` | 200 | `/editor/encuestas-seguimiento-laboral` | texto rico |
| `/tasa` | 200 | `/editor/tasa` | sin cambios |

Las cuatro rutas `/editor/<slug>` responden 200.

**Los slugs de encuestas no llevan barra** (`encuestas-calidad-de-formacion`). La API expone `/paginas/publica/:slug` y un parámetro de Express no cruza una barra: con slug jerárquico la petición no encontraría la ruta.

### Pendiente al cierre

- **Los `View` antiguos siguen en el árbol** (`InicioView`, `MatrizView`, `CalidadFormacionView`, `SeguimientoLaboralView`) y ya no los importa nadie. Se dejan igual que se dejó `TasaView`, por la regla 5 de `4-reglas.md`: no se borra lo viejo en el mismo paso en que se crea su reemplazo. Borrarlos es el siguiente paso, y con ellos se van 6 de las 9 advertencias `no-img-element`.
- Conseguir los cuatro enlaces reales (2 de FAQ en inicio, 2 de descargas en matriz) y ponerlos desde el editor.
- `app/editor/[slug]/page.tsx` sigue sin verificar permisos en servidor. Ahora son 5 páginas editables.
- Conectar `Publicaciones` a la tabla `contenidos` (hoy la lista se mantiene a mano, aunque ya sin tocar código).
- `sandbox` en los iframes y el `title` obligatorio siguen sin hacerse; los iframes ahora viven en bloques, que es donde toca aplicarlos.
- Sigue abierto todo lo pendiente de la sesión del 26-07.

---

## sesión 26-07-2026:

### 1. Refactor de autenticación y tokenización de marca (sitio-web)
- Se extrajeron las primitivas duplicadas de las tres pantallas de autenticación a `features/administracion/components/auth-ui.tsx` (`AuthPageShell`, `AuthCardHeader`, `PasswordField`, `AuthGeneralError`, `BackToSiteLink`).
- `login/page.tsx` pasó de 428 a 223 líneas y de 33 `style={{}}` inline a cero.
- El verde de marca `#7DB728` se promovió a token de Tailwind en un bloque `@theme` de `globals.css` (`--color-brand`, `--color-brand-hover`, `--color-brand-focus`, `--color-brand-blue`). Los tokens previos de `:root` quedaron como alias, porque `:root` no genera utilidades en Tailwind v4 y `@theme` sí.
- Se corrigió el `TS2322` de `puck.config.tsx`: la causa era la *weak type detection* de TypeScript sobre un tipo con todas las propiedades opcionales. Se resolvió con `CustomFieldRender<T>` y `BlockRender<T>`.

### 2. ESLint configurado en las dos apps
- Se creó `sitio-web/eslint.config.mjs` (no existía) y se corrigieron sus **74 problemas**; se corrigieron los **69 de la intranet**, que bajaron a 9 advertencias y 0 errores.
- Correcciones de fondo, no cosméticas: estado externo migrado a `useSyncExternalStore` (tema, cookies, `sessionStorage`), lecturas de `ref` durante el render sustituidas por el patrón de ajuste de estado, tipos PDF.js declarados en vez de `window as any`, `listbox.tsx` hecho genérico de verdad.
- Se eliminó UI inalcanzable en `RecoveryView.tsx` que describía un flujo por correo ya obsoleto.
- Se documentó en `2-convenciones` §8 por qué hay **una config por frontend** y no una compartida en la raíz.

### 3. Documentación: gobernanza y anatomía de dominio
- Se creó **`8-ciclo-editorial.md`**: el ciclo `borrador → en_revision → publicado`, la invariante de que lo público solo cambia al aprobar, la anatomía canónica de una feature (plana y por etapas), las tres decisiones de convención que estaban divergentes entre apps, y un plan de migración en 6 fases.
- Se reescribieron `1-guia`, `2-convenciones`, `4-reglas` y `README` para que apunten a ese esquema.

### 4. Frontera de módulos cerrada en la intranet (fase 4, paso 1)
- Se crearon los `index.ts` que faltaban en `login`, `inicio`, `encuestas`, `matriz` y `tasa`; cinco de siete features no tenían puerta pública.
- Se reescribieron **15 imports** de `app/` que alcanzaban rutas internas. Hoy `app/` no importa ninguna ruta interna de ninguna feature.
- Se corrigieron los `@see` de `auth/index.ts` y `paginas/index.ts`, que apuntaban a `ARQUITECTURA_MAESTRA_OLO.md` — eliminado en la sesión del 20-07.

### 5. Revisión de coherencia de la documentación (1 al 8)
Se verificó cada afirmación estructural contra el código. Corregido:
- **`4-reglas` regla 10 eliminada**: exigía un `@source` por route group en Tailwind v4. Es falso — ningún `globals.css` tiene `@source` y las clases se generan igual (verificado con `flex-grow`, usada solo en `(public)/layout.tsx`).
- **`4-reglas` regla 8 reescrita**: mencionaba un route group `(editor)` y `features/editorial/` que no existen.
- **`middleware.ts` estaba mal ubicado en los dos árboles** de la guía: va en `src/`, no en `src/app/`.
- **Árbol de `sitio-web` sincronizado con el disco** y resuelta la contradicción interna entre §4.2 y §5 (el §5 tenía razón: existen `administracion/`, `contenidos/`, `identidad-visual/`, no `dashboard/` ni `auth/`).
- **`[slug]/page.tsx` estaba etiquetado "Mesa de trabajo Puck"**; es la página pública. La mesa de trabajo es `(admin)/editor/[slug]/`.
- **H1 de `1-guia` cambiado** de "Arquitectura Maestra" a "Guía del Proyecto", que es como lo cita todo lo demás.
- **README adelgazado** a puerta de entrada: duplicaba §1–§3 de la guía y ya había divergido (diagrama roto incluido).
- **`5-tablerosBI.md` → `5-tableros-bi.md`**: era una URL suelta; ahora documenta el informe, dónde está embebido, por qué RF-08 sigue sin cumplirse y los cuatro controles S6 que faltan.

### 6. Accesibilidad: documento nuevo y fase 1 ejecutada
- Se creó **`9-accesibilidad.md`**: nivel AA y Resolución 1519 de 2020 (RF-14), con alcance declarado **solo para `sitio-web`** — la intranet no es canal de información pública, aunque queda anotado el matiz laboral de la Ley 1618.
- **Auditoría de contraste medida, no estimada.** Los cuatro tokens de marca fallaban AA contra blanco: `#7db728` a 2.42:1, `#1face3` a 2.60:1, `#39a900` a 3.07:1, `#6da020` a 3.13:1. El botón `primary`/`success` del sitio estaba a 2.42:1 contra un mínimo de 4.5:1.
- El barrido destapó cuatro focos más: las variantes `success`, `warning` e `info` de `notification.tsx` —la amarilla con texto blanco a **1.48:1**, el peor del sistema— y `.admin-btn-primary` en `globals.css`.
- **Fase 1 ejecutada.** La paleta se partió por rol: tokens de identidad (sin texto encima) y tokens interactivos (`#2a7d00` a 5.21:1, `#1f5c00` a 8.11:1, `#0b6d8f` a 5.84:1). Se corrigieron `button.tsx`, `notification.tsx` (color de texto ahora por variante), `globals.css`, `custom-select.tsx`, `switch.tsx`, `auth-ui.tsx` y `first-login-flow.tsx`.
- Se corrigió en `1-guia` y `README` la afirmación de que la identidad y la accesibilidad se cumplían "por construcción": la arquitectura lo habilita, pero los átomos incumplían.
- **Verificación:** `tsc --noEmit` limpio, `eslint` limpio, `npm run build` correcto, utilidades nuevas confirmadas en el CSS compilado, barrido posterior sin combinaciones fallidas.

### Pendiente al cierre
- Fases 2 a 6 de `8-ciclo-editorial.md` §5 sin ejecutar.
- Fases 2 a 6 de `9-accesibilidad.md` §4 sin ejecutar; la 2 (reglas `jsx-a11y`) es la que impide reintroducir lo corregido.
- La decisión de paleta del §3.1 espera visto bueno de quien administra la identidad SENA.
- 9 advertencias `no-img-element` en la intranet, deliberadas.
- Prettier y Husky + lint-staged sin instalar.
- `sitio-web/src/features/auditoria/` no tiene `index.ts`.

---

## sesión 20-07-2026:
1. Limpieza y Reestructuración en sitio-web (App Router y Feature-Sliced)
### Consolidación de Rutas Públicas:
- Se eliminó el page.tsx suelto en la raíz que tenía lógica pesada y colisionaba.
- Se movió la lógica a src/app/(public)/page.tsx para respetar el enrutamiento limpio.
- Se movió la ruta dinámica de Puck src/app/[slug]/page.tsx hacia src/app/(public)/[slug]/page.tsx.
### Saneamiento de Componentes y Estilos:
- Se eliminaron los componentes duplicados sueltos en src/shared/ui que ya estaban correctamente ubicados dentro de atoms/, molecules/ y organisms/.
- Se eliminó la carpeta obsoleta src/styles (y su auth-loader.module.css que no se utilizaba).
### Limpieza General:
- Se eliminaron múltiples layouts y vistas deprecadas (como src/app/panel-general, src/features/paginas, src/components/, etc.) que ya habían sido migradas a features/.
2. Cumplimiento de Clean Architecture en api-backend
### Nuevos Repositorios (Data Access):
- Se creó pagina.repository.ts para aislar las consultas a los modelos Sequelize de las páginas (antes los use-cases tocaban la BD directamente, lo cual violaba la arquitectura).
- Se renombró paginas.repository.ts a contenido.repository.ts (ya que realmente manejaba el modelo de Contenidos/Posts).
### Refactorización de Nomenclatura (Posts → Contenidos):
- Se renombraron los modelos, rutas, controladores y casos de uso de "Posts" a "Contenidos" (Contenido.ts, contenido.controller.ts, contenido.routes.ts, contenido.usecase.ts) para alinear el backend con el lenguaje del dominio (Ubiquitous Language).
### Separación de Casos de Uso (Use Cases):
- Se independizaron los casos de uso en las carpetas correctas: /paginas (para la gobernanza de Puck) y /contenidos (para adjuntos, secciones e informes).
### Delegación de Controladores:
- Se movió la lógica de colas BullMQ desde las rutas hacia el nuevo trabajos.controller.ts, garantizando que las rutas (.routes.ts) sigan siendo archivos con "cero lógica".
### Consolidación de la Documentación (Raíz del Proyecto):
- Se reescribieron e integraron las reglas clave arquitectónicas directamente en 1-guia-del-proyecto.md, 2-convenciones-del-proyecto.md, etc., eliminando los archivos duplicados o desactualizados (guia-del-proyecto.md, SEGURIDAD_OLO.md, CONVENCIONES_CODIGO_OLO.md).
- Se detalló formalmente en la documentación la dependencia unidireccional del backend y el concepto de rutas "delgadas" para Next.js.
- Todo quedó respaldado en GitHub bajo el mensaje: "Refactor: Limpieza de sitio-web y api-backend, consolidación de docs"

---

## sesión 17-08-2026: autorización a nivel de objeto (BOLA)

Se cierra el hallazgo histórico «RBAC definido en BD pero nunca aplicado en código» para
todo lo que quedaba fuera del dominio de páginas, y se añade la comprobación de propiedad
que faltaba en toda la API. Detalle completo en `3-seguridad-del-proyecto.md` §S10.

### Qué estaba abierto
- `PATCH /api/users/:id` sin filtro de rol: cualquier sesión válida —un `visitante_interno`
  incluido— cambiaba el `role_id` de cualquiera a Superadmin. Con `reset_password: true` la
  respuesta devolvía además la contraseña temporal de la víctima.
- `/api/roles`, `/api/permissions`, `/api/role-permissions`, `/api/sections`,
  `/api/sitio-users` y `/api/alerts`: solo `requireAuth`.
- `/api/jobs/:id`: **sin autenticación ninguna**, con ids secuenciales de BullMQ.
- `DELETE /api/attachments/:id`: cargaba el archivo por id y hacía `fs.unlinkSync` sobre su
  ruta sin comprobar de qué contenido era.
- `GET /api/contenidos/:id` y `GET /api/contenidos`: devolvían borradores y material
  rechazado a cualquier sesión.
- El rol se leía del JWT (7 días de vida) y no de la fila, así que degradar a alguien no
  tenía efecto hasta que caducara su token.

### Qué se creó
- `src/policies/usuarios.policies.ts` y `src/policies/contenidos.policies.ts`, con la forma
  de `paginas.policies.ts`.
- `src/shared/autorizacion.ts`: `esDueno`, `exigirPropiedad`, `exigirPertenencia` y la marca
  que permite al verificador reconocer un guardia.
- `scripts/verificar-propiedad.ts` + `npm run propiedad:verificar`.

### Qué se modificó
- `auth.middleware.ts`: el rol y el `role_id` salen de la fila del usuario, que ya estaba
  cargada para comprobar estado y caducidad — sin consulta adicional. `requireRole`, que
  comparaba literal y por eso no habría funcionado nunca, ahora normaliza.
- `permisos.middleware.ts`: las cuatro fábricas de guardias, que tenían el mismo cuerpo
  repetido, salen de un único `construirGuardia`.
- Routers de `users`, `roles`, `permissions`, `role-permissions`, `sections`, `contenidos`,
  `sitio-users`, `attachments`, `jobs` y `/api/alerts` en `app.ts`.
- `listar-usuarios.usecase.ts`: lista blanca de autoservicio (`name`, `apellidos`, `email`),
  nadie se cambia su propio rol ni su propio estado, no se degrada al último Superadmin
  activo, nadie se borra a sí mismo.
- `contenido.usecase.ts`, `adjuntos.usecase.ts`, `trabajos.controller.ts`: comprobación de
  dueño y de pertenencia al padre.
- `guardar-borrador.usecase.ts`: se escribe `creadoPor` en cada versión. La columna existía
  desde la migración 007 y no la rellenaba nadie, así que RF-07 no sabía decir quién editó.
- `shared/ambito.ts`: `exigirAmbito` para las rutas que escriben. Antes, una cabecera
  `X-Ambito` ausente o mal escrita caía en silencio sobre el sitio público.

### Decisiones
- **La edición es colaborativa**: cualquier Editor trabaja sobre el borrador de otro. La
  autoría se registra para la bitácora, no restringe. Lo que sí mira al dueño es borrar, la
  cuenta propia, los adjuntos y los trabajos en cola.
- **`puedeAdministrarSeguridad` incluye a Administrador**, no solo a Superadmin, porque el
  panel de roles y permisos lo abren los dos (`sitio-web/src/middleware.ts`). Estrecharlo es
  cambiar una lista en la policy.
- **El ámbito no se gateó por `acceso.sitio`/`acceso.intranet`** como preveía el plan: la
  cola de revisión es deliberadamente cruzada entre las dos aplicaciones, esos permisos solo
  están sembrados para Editor, y todos los roles que editan editan en ambos ámbitos por
  diseño. Gatearlo habría dejado al Administrador sin poder aprobar páginas de intranet sin
  cerrar nada real.

### Verificación
- `npm run typecheck` limpio.
- `npm run propiedad:verificar`: 28 comprobaciones de policy y 31 rutas barridas, todas con
  guardia o con su comprobación declarada. Todo correcto.
- `npm run permisos:verificar`, `password:verificar` y `email:verificar` siguen en verde.

### Pendiente
- Pruebas manuales con dos sesiones reales (tabla de comprobaciones en §S10) contra un
  entorno con Redis levantado — el `propiedad:verificar` no ejerce la API, solo la inspecciona.
- `GET /api/contenidos` ahora oculta lo no publicado a quien no puede verlo; conviene
  confirmar que ninguna pantalla contaba con el comportamiento anterior.
- El endpoint de descarga de fichero de RF-12 sigue sin existir; cuando se construya, hereda
  la regla de S8.

---

## sesión 18-08-2026: cierre de sesión por inactividad

Una sesión duraba 7 días y nada la cerraba por dejar de usarse: ni un `setTimeout`, ni un
listener de actividad, ni una comprobación en la API. Un equipo compartido del SENA con el
panel abierto quedaba accesible a quien pasara por ahí una semana después.

### Qué se creó
- **`packages/inactividad/`** — paquete nuevo, consumido por las dos apps. Dentro:
  - `crearVigilanteDeInactividad()`: el reloj. Guarda **el instante** de la última
    actividad y compara contra `Date.now()` en cada disparo, en vez de descontar con un
    `setInterval` — así un portátil que estuvo dormido tres horas despierta con la sesión
    ya vencida en lugar de con el contador a medias.
  - La actividad se anota en `localStorage`, que se comparte entre pestañas. Sin eso,
    trabajar en una cerraba la sesión desde la otra, y como la cookie es una sola se
    llevaba las dos por delante.
  - `ModalInactividad`: el diálogo del aviso. Vive en el paquete y no en cada app porque
    las dos lo pintan igual (`.olo-modal*` existe en los dos `globals.css`); lo único que
    difiere es a quién se llama para cerrar, y eso se queda en cada `vigilante-sesion.tsx`.
  - No usa `mousemove` a propósito: un ratón apoyado en una mesa que tiembla mantendría la
    sesión viva sin nadie delante, que es justo lo que esto evita.
- **`{sitio-web,intranet}/src/shared/lib/inactividad/`** — el `VigilanteSesion` de cada app
  y el traductor del motivo que llega por la URL.

### Qué se modificó
- `api-backend/src/middlewares/auth.middleware.ts`: **la mitad que de verdad cierra la
  sesión.** `usuarios.ultimo_acceso_en` existía y solo se escribía al iniciar sesión, así
  que no medía nada; ahora se compara en cada petición y se refresca como mucho una vez
  por minuto —sin el freno sería un `UPDATE` por cada lectura del panel—.
- `api-backend/src/shared/password-policy.ts`: los dos umbrales nuevos, junto a los de §3.
- Los dos `puck-editor-wrapper.tsx`: puente para leer la historia de Puck desde fuera de su
  árbol. Sin él, guardar antes de cerrar habría que hacerlo a ciegas, creando una versión
  nueva en cada cierre aunque nadie hubiera tocado nada.
- Los dos `LoginView`: leen `?motivo=` y pintan un aviso **informativo, no de error**.
  Cerrar por inactividad es el sistema funcionando; en rojo, junto a «Credenciales
  inválidas», hace creer que uno se equivocó. Se añadieron `AuthGeneralNotice`
  (sitio-web) y `.login-general-notice` con tokens `--color-info-*` (intranet).
- `intranet/.../LoginView.tsx` se partió en `LoginForm` + envoltorio con `Suspense`:
  `useSearchParams` lo exige y sin él **el build fallaba** al prerenderizar `/login`.

### Decisiones
- **15 minutos en el cliente, 20 en la API.** No es un descuido: el navegador tiene que
  cerrar siempre primero para que se vea el aviso en vez de un 401 seco a mitad de un clic.
  La holgura absorbe relojes desfasados y pestañas de fondo, donde el navegador ralentiza
  los temporizadores.
- **En el editor se guarda el borrador antes de cerrar.** `PuckEditorWrapper` no tiene
  autoguardado —`guardarBorrador` solo se dispara al pulsar el botón—, así que un cierre
  sin guardar sería exactamente la pérdida contra la que avisa su propio `ModalSalir`.
  Si el guardado falla, se cierra igual y el login lo dice con otro motivo.
- **El motivo de la URL no se pinta tal cual.** `mensajeDeCierre` solo reconoce claves
  propias; imprimir el parámetro dejaría poner cualquier texto sobre el formulario de
  acceso con solo preparar un enlace.

### Verificación
- `npm run build` correcto en `sitio-web`.
- `npm run typecheck` y `propiedad:verificar` / `permisos:verificar` correctos en `api-backend`.
- La intranet **compila** (`✓ Compiled successfully`) pero su `next build` no termina: falla
  el type check en `Carousel.tsx` / `SeccionCarrusel.tsx` por un desajuste de `CarouselImage`
  que viene de trabajo en curso ajeno a esto, sin commitear.

### Pendiente
- Las pruebas manuales de la tabla de §S3: dos pestañas, suspender el equipo, y el caso del
  editor con y sin cambios (que no debe crear versión si no se tocó nada).
- Repasar el modal con teclado y lector de pantalla: la cuenta atrás se anuncia solo en los
  múltiplos de diez y los últimos cinco segundos, para no dejar el lector hablando encima
  de sí mismo.
- El aviso no aparece en las pantallas de `login/*` ni en el sitio público, que no tienen
  sesión que cerrar. Es lo correcto, pero conviene confirmarlo al probar.

---

## Sesión: Ingesta del Observatorio, Bloques de Acción en Puck y Actualización Integral de Documentación (2026-09-15)

### Contexto
Se requirió integrar un componente Puck para la carga masiva de estadísticas laborales en el portal del Observatorio, resolver la arquitectura de interacción dentro del editor visual, y alinear exhaustivamente la documentación técnica del proyecto que presentaba divergencias históricas tras las migraciones 020 a 025.

### Qué se implementó y modificó

1. **Arquitectura de Bloques Puck y Carga de Archivos (`sitio-web`):**
   - **`sitio-web/src/features/paginas/components/importador-excel-uploader-field.tsx`**: Componente de formulario para la barra lateral (sidebar) de Puck. Maneja la selección de archivos `.xlsx`, validación de tipo MIME y tamaño, retroalimentación de carga/error y envío en buffer crudo (`application/octet-stream`) hacia `/api/observatorio/importar`.
   - **`sitio-web/src/shared/lib/blocks/ImportadorExcelBloque.tsx`**: Refactorizado para actuar exclusivamente como representación visual e indicador de estado en el lienzo (canvas). Se eliminaron formularios interactivos que colisionaban con los eventos drag-and-drop de Puck, se suprimieron clases `dark:` no correspondientes al contexto público de `sitio-web` y se ajustó a los tokens institucionales.
   - **`sitio-web/src/config/puck.config.tsx`**: Integración del uploader como `custom field` en el panel lateral del bloque, eliminando campos redundantes de títulos y descripciones editables para concentrar la funcionalidad estrictamente en la ingesta de datos.

2. **Actualización de `11-base-de-datos.md`:**
   - Sincronización del inventario con la base real: paso de 12 a **19 tablas del dominio** con modelos Sequelize activos (20 tablas totales incluyendo `migraciones_aplicadas`).
   - Actualización del mapa de relaciones ASCII con el esquema en copo de nieve (Snowflake) del Observatorio (`departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`, `programas_sobresalientes`) y las tablas de gobernanza/concurrencia (`bloqueos_edicion`, `subidas_pendientes`).
   - Incorporación de las invariantes I10 a I15 en el esquema (idempotencia en `(centro_id, programa_id, sexo)`, consistencia `vinculados <= certificados`, acotamiento de tasas, restricciones estrictas de género y reglas de cascada).
   - Documentación de las migraciones 020 a 025 y actualización del balance de ejecución a 25 migraciones aplicadas.

3. **Actualización de `12-diccionario-de-datos.md`:**
   - Métricas globales actualizadas: 20 tablas base, 152 columnas, 26 llaves foráneas y 20 restricciones CHECK en motor.
   - Inclusión de la ficha técnica de `subidas_pendientes` (§3.15) con su estrategia de recolección de basura de archivos en borradores de páginas.
   - Especificación detallada de catálogos y tabla central de hechos del Observatorio (§3.16).
   - Actualización de la matriz de integridad referencial (Foreign Keys) incorporando las relaciones de las tablas de Observatorio y subidas pendientes con sus políticas `RESTRICT` y `CASCADE`.

4. **Actualización de `8-ciclo-editorial.md`:**
   - Incorporación de la **Sección 4.5 ("Bloques de Acción en Puck: Separación Canvas vs. Barra Lateral")**: define la regla de desarrollo de aislar formularios y botones transaccionales en custom fields del sidebar para prevenir interferencias con los overlays de Puck, y respetar la segregación de estilos por contexto (`sitio-web` vs `intranet`).

5. **Actualización de `1-guia-del-proyecto.md`:**
   - Sincronización de la estructura de `api-backend/`: 13 rutas, 13 controladores (incluyendo `observatorio.controller.ts`), 6 dominios de casos de uso (con `observatorio/importar-programas-excel.usecase.ts`), 11 repositorios y 19 modelos Sequelize activos sobre 25 migraciones aplicadas.

### Verificación
- Tipado TypeScript verificado en `sitio-web` (`npx tsc --noEmit` exitoso sin errores).
- Verificación del esquema de base de datos (`node check-tables.js` confirmando las 20 tablas presentes en PostgreSQL).

## Sesión 01-10-2026: botones de acción en /admin/revision

- Los cuatro botones de la cola de revisión usan los iconos de `public/assets/svg` (`eye-open`, `send`, `equiz`, `trash`) tintados por máscara CSS (`IconoMascara`) y los colores pedidos: ver #1FACE3/#002237, aprobar #7DB728/#004600, rechazar fondo #FFE9E9 con icono y borde #FF1F1F, eliminar #FF1F1F/#6A0000.
- Archivo: `3000-sitio-web/src/features/paginas/revision/components/revision-queue-view.tsx`.
- Sin verificar en navegador.

## Sesión 01-10-2026: se quita la tarjeta «Fuentes futuras de empleo» de Actualizaciones

- Era la única tarjeta «Próximamente» de `/admin/dashboard/actualizaciones`; se eliminó la constante `MODULOS_PROXIMAMENTE`, el bloque que la dibujaba y la mención en el comentario.
- Archivo: `3000-sitio-web/src/features/administracion/actualizaciones/components/actualizaciones-view.tsx`.
- No se toca el bloque público ni su endpoint de Puck.
- Sin verificar en navegador.
- Las dos tarjetas de arriba (Programa + Sobresalientes y Alertas de inversión) ocupan 50% y 50%: la grilla pasa de `lg:grid-cols-3` a 2 columnas desde `sm`; Criterios sigue a todo el ancho (`col-span-full`).

## Sesión 01-10-2026: borrar proyectos de Alertas de inversión desde Actualizaciones

- Problema: un proyecto agregado a mano (o importado de Excel) no se podía quitar; «Historial de cargas» solo borra la auditoría de la carga y las altas manuales ni aparecen ahí.
- API: `GET /api/alertas-inversion/proyectos` (100 más recientes, reutiliza el listado público) y `DELETE /api/alertas-inversion/proyectos/:id` (borra el proyecto; las ubicaciones caen por CASCADE). Mismo permiso `puedeActualizarDatos`. Caso de uso nuevo `eliminar-proyecto.usecase.ts`.
- Panel: sección «Proyectos registrados» en la tarjeta, con icono de basura y confirmación (`lista-proyectos-inversion.tsx`); se refresca al agregar uno a mano y al terminar una carga de Excel.
- Borrado físico, no lógico; si se borra una fila de un Excel y se vuelve a subir, se reimporta (la deduplicación es por URL de fuente).
- Sin verificar en navegador ni contra la base.

## Sesión 01-10-2026: el gráfico de Alertas de inversión a veces no cargaba

- Causa: `grafico-sectores.tsx` cargaba ECharts con `import()` dinámico en un efecto y aplicaba la opción en otro; si el módulo llegaba después del primer render, `instanciaRef` era `null`, no se pintaba nada y no había nada que lo volviera a intentar. Además el clic usaba los `datos` del primer render y el listener de `resize` nunca se quitaba.
- Arreglo: usa `GraficoEcharts` (shared/ui/molecules, init síncrono + ResizeObserver) con la opción en `useMemo`; a `GraficoEcharts` se le añadió `onClickElemento` opcional.
- Sin verificar en navegador.

## Sesión 01-10-2026: filtros Sector / Departamento / Año en Alertas de inversión

- La consulta pública ahora se filtra por sector, departamento y año (antes solo año y sector por clic en la barra; el gráfico ya aceptaba departamento en la API pero el sitio no lo enviaba y el listado lo ignoraba).
- API: `listarPublicados` filtra por departamento con `EXISTS` sobre las ubicaciones (mismo criterio del gráfico); `GET /opciones` devuelve también los departamentos del catálogo (`codigoDane`, `nombre`); `GET /listado` pasa `departamento` al repositorio.
- Sitio: tres selectores en ese orden en `alertas-inversion-view.tsx`; el clic en una barra sigue filtrando por sector y queda reflejado en el selector. Cambiar cualquier filtro vuelve a la página 1.
- Reiniciar la API para ver el cambio. Sin verificar en navegador ni contra la base.

## Sesión 01-10-2026: modal «Agregar manualmente» más ancho

- `Alert` (shared/ui/molecules) recibe `anchoMaximo` opcional (por defecto `max-w-md`, así los demás modales no cambian); el formulario de proyecto de inversión usa `max-w-3xl`. En móvil sigue a todo el ancho.
- Sin verificar en navegador.
- La «Fecha del anuncio» del mismo formulario usa el `DatePicker` del panel en vez del `<input type="date">` nativo; como ya no es `required` del navegador, se valida a mano («Elija la fecha del anuncio.»). Riesgo: el formulario hace scroll interno (`overflow-y-auto`) y el calendario desplegable podría recortarse en el borde inferior; sin verificar en navegador.
- El «Departamento» del formulario es un desplegable (`CustomSelect`) con los departamentos que devuelve `GET /api/alertas-inversion/opciones` (se envía el nombre, que la API resuelve por alias); se valida a mano que se elija uno. Requiere la API reiniciada: con la anterior la lista sale vacía. `obtenerSeccionesCiiu` pasa a `obtenerOpcionesProyectoInversion` (sectores + departamentos en una sola llamada).

## Sesión 01-10-2026: el filtro por departamento no respondía y la consulta se sentía lenta

- Departamento: no filtraba porque la API en ejecución era la anterior al cambio (su `/opciones` no traía `departamentos` y el listado ignoraba el parámetro). Se validó el código nuevo directo contra la base (solo SELECT): 33 departamentos y, p. ej., Antioquia 3, Bogotá 3, Santander 2 proyectos, ~115 ms por consulta. Falta reiniciar la API.
- Lentitud: la base responde rápido; lo lento era el sitio. Cada cambio de filtro ponía `cargando` y desmontaba el gráfico y la tabla ("Cargando datos..." y redibujo), pedía el gráfico de nuevo al cambiar de página o de sector aunque no depende de ellos, y una respuesta vieja podía pisar a una nueva.
- Arreglo en `use-alertas-inversion.ts`: un efecto para el gráfico (departamento, año) y otro para el listado (sector, departamento, año, página), con descarte de respuestas obsoletas; solo la primera carga muestra "Cargando"; después los datos anteriores quedan a la vista al 60% de opacidad (`actualizando`).
- Sin verificar en navegador.

## Sesión 01-10-2026: dos gráficas en Alertas de inversión (lineal + torta)

- Gráfica lineal nueva «Evolución de proyectos»: proyectos publicados por año, o por mes si hay un año elegido; respeta sector y departamento. API: `GET /api/alertas-inversion/evolucion` (público, mismos filtros que el gráfico; rellena con 0 los periodos vacíos). SQL probado contra la base (solo SELECT): 2024:1, 2025:1, 2026:13 en ese momento; Bogotá y sector C filtran bien; vista mensual de 2026 devuelve los 12 meses.
- «Proyectos por sector» tiene un botón Barras / Torta; el clic en una barra o porción filtra por sector en las dos vistas. En la torta solo salen sectores con proyectos y, con un sector elegido, el resto pasa a gris.
- Archivos: `grafico-evolucion.tsx` (nuevo), `grafico-sectores.tsx`, `alertas-inversion-view.tsx`, hook/servicio/tipos del sitio; `consultas-publicas.usecase.ts`, repositorio, validador, controlador y rutas de la API.
- Interpretación mía del pedido: «el lineal» = serie en el tiempo y «botón con torta» = alternar la vista del gráfico por sector. Requiere reiniciar la API. Sin verificar en navegador.

## Sesión 01-10-2026: «Limpiar» en el listado de proyectos y se quita la torta

- Panel Actualizaciones, «Proyectos registrados»: botón «Limpiar» (sin fondo, texto rojo) que borra todos los proyectos tras confirmar. API: `DELETE /api/alertas-inversion/proyectos` (mismo permiso `puedeActualizarDatos`; devuelve `{ eliminados }`; las ubicaciones caen por CASCADE). Es irreversible y deja el sitio público sin datos de alertas; las empresas y municipios creados se conservan.
- Se retira la vista de torta de «Proyectos por sector» (queda solo barras); la gráfica lineal de evolución se mantiene.
- Requiere reiniciar la API. Sin verificar en navegador.

## Sesión 01-10-2026: se elimina la gráfica «Evolución de proyectos»

- Se retira del sitio la gráfica lineal (componente, hook, servicio y tipos) y de la API el endpoint `GET /api/alertas-inversion/evolucion` con su consulta, validador y caso de uso, que ya nadie usaba. Queda «Proyectos por sector» (barras). Reiniciar la API; sin verificar en navegador.
- El botón de la lista se llama «Limpiar todo». El 404 al pulsarlo venía de una API iniciada antes de existir `DELETE /api/alertas-inversion/proyectos`; se resuelve reiniciándola.
- La API no arrancaba: en `alertas-inversion.routes.ts` la descripción del `GET /proyectos` llevaba comillas y dos puntos dentro de un comentario OpenAPI (YAML inválido). Corregido; se comprobó con `swagger-jsdoc` sobre todas las rutas. Lección: en los comentarios `@openapi` no usar `:` dentro de un valor sin comillas.

## Sesión 01-10-2026: descripción en la tabla de Alertas de inversión

- `listado-proyectos.tsx` (sitio público): columna nueva «Descripción» cortada a dos líneas (`line-clamp-2`); si pasa de 110 caracteres aparece «Ver más», que abre un modal solo con la descripción completa (título = empresa).
- El modal es el `ModalOcupaciones` del sitio público (Escape, foco atrapado, capa sobre la cabecera sticky, scroll de fondo bloqueado) en vez de uno nuevo; el `Alert` del panel no sirve aquí porque su `z-50` queda bajo la cabecera (`z-1000`). Ojo: es una importación entre features (`buscador-ocupaciones`); si se vuelve a reutilizar conviene moverlo a `shared/ui`.
- Sin verificar en navegador.

## Sesión 01-10-2026: botón «Actualizar sectores (CIIU)» con Excel de código y nombre

- Decisión (con el usuario): el Excel trae el **código numérico** CIIU y el nombre; los de 4 dígitos (clase, p. ej. 0111) se guardan en `ciiu_clases` (vacía hasta hoy, sin migración) y su sección se **deduce del prefijo**: los 2 primeros dígitos son la división y cada sección cubre un rango (`ciiu_secciones.divisiones`). Los de 2 y 3 dígitos (sector principal) se leen pero no se guardan, porque no hay tabla para ellos.
- API: `POST /api/alertas-inversion/sectores` (multipart `file`, mismo permiso `puedeActualizarDatos`), caso de uso `actualizar-sectores.usecase.ts`: síncrono, sin Redis ni cola; valida tipo por magic bytes (.xlsx); crea los nuevos, actualiza el nombre de los que cambian, nunca borra; las filas con problema (no numérico, sin nombre, repetido, división sin sección) se reportan y las demás se aplican en una transacción. `GET /opciones` devuelve también `clases`.
- Panel: botón «Actualizar sectores (CIIU)» junto a «Agregar manualmente» con resumen (nuevos / nombre cambiado / sin cambios / omitidos / errores por fila). Formulario manual: nuevo desplegable opcional «Actividad (CIIU)» con "código · nombre", filtrado por el sector elegido. Tabla pública: bajo el sector se ve "código · actividad" si el proyecto la tiene.
- Probado con un Excel generado (ejemplo de cultivos 011/0111–0119, 4711, repetido, no numérico, sin nombre) **sin escribir en Neon** (guardado simulado): 8 creados, 1 omitido y 3 errores bien reportados. Pendiente: primera carga real y verla en navegador; reiniciar la API.
- Trampa conocida: un código con cero inicial (0111) guardado en Excel como número llega como 111 y se omite; hay que guardarlo como texto. El resumen del panel lo avisa.

## Sesión 01-10-2026: formatos de Excel asociados a los botones de Alertas de inversión

- Los Excel de ejemplo de `uploads/formatos-carga/` se renombraron a `formato-*.xlsx` y `formatos-de-carga.ts` seguía pidiendo `formatdata-*`: las tres descargas daban 404. La tabla ahora apunta a `formato-sobresalientes.xlsx`, `formato-criterios-tendencias.xlsx` y `formato-alertas-inversion.xlsx`, y suma `actualizar-ciiu` → `formato-actualizar-CIIU.xlsx`. Verificado que los cuatro se resuelven en disco.
- «Actualizar sectores (CIIU)» tiene su botón «Descargar formato de sectores» (`GET /api/alertas-inversion/formatos/sectores`). La descarga de formatos del controlador se unificó en `enviarFormato`, y en el sitio `descargarExcelDeAlertas` sirve a los dos botones.
- El formato de proyectos trae el código sin cero inicial (`11` = grupo `011`, «Cultivos agrícolas transitorios»). El importador de proyectos ahora deduce la sección de cualquier código numérico por su división (`ciiu-divisiones.ts`, compartido con «Actualizar sectores»); antes solo aceptaba letra, clase de 4 dígitos ya cargada o el nombre exacto de la sección, y esa fila fallaba. Probado con las secciones reales: 11→A, 011→A, 0111→A, 4711→G, 1011→C, 9999→U.
- El formato de CIIU (`Código CIUU`, `Actividad`) solo trae el encabezado; el lector salta la primera fila si su código no es numérico, así que es compatible. Las filas de la hoja de proyectos con código de 3 dígitos enlazan a la sección pero no a una clase (no hay tabla de grupos).
- Git: los `formatdata-*` siguen versionados y en disco ya no están; incluirlos en el commit como renombrados.
- Reiniciar la API. Sin verificar en navegador.
- El botón de descarga del formato de sectores pasa del enlace de texto junto a «Actualizar sectores» al encabezado de la tarjeta, como botón igual al de «Descargar formato»: «Descargar formato» (proyectos) y «Descargar formato CIIU». Una sola función `descargarFormato(cual)` en `carga-alertas-inversion.tsx`; se quitó el enlace de `actualizar-sectores-ciiu.tsx`. Sin verificar en navegador.
