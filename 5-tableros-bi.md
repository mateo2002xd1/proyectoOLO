# Tableros Power BI — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md`. Registra qué tableros Power BI están embebidos, dónde, y qué controles les faltan.
> Cubre RF-08 (insertar tableros configurables desde el CMS, sin código).

---

## 1. El informe

Hoy existe **un solo informe Power BI**, publicado con *Publish to web* (`app.powerbi.com/view`). Todas las vistas apuntan al mismo informe y cambian de página con el parámetro `pageName`.

```
https://app.powerbi.com/view?r=<token>&pageName=<seccion>
```

| Token | Valor |
|---|---|
| `r` (informe) | `eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9` |
| Tenant (`t`, decodificado) | `cbc2c381-2f2e-4d93-91d1-506c9316ace7` |

---

## 2. Dónde está embebido

| Vista | Archivo | `pageName` |
|---|---|---|
| Matriz de formación | [MatrizView.tsx:113](intranet/src/features/matriz/ui/MatrizView.tsx#L113) | `ReportSection14c82e0795ad03436073` |
| Tasa — Vinculación | [TasaView.tsx:109](intranet/src/features/tasa/ui/TasaView.tsx#L109) | `ReportSection` |
| Tasa — Empleabilidad | [TasaView.tsx:129](intranet/src/features/tasa/ui/TasaView.tsx#L129) | `cfd70c690d894046a8d8` |

Los tres están **solo en la intranet**, que es zona 100% protegida.

---

## 3. Lo que falta para cumplir RF-08

RF-08 pide *"insertar tableros Power BI mediante contenedores configurables **desde el CMS, sin código**"*. Hoy las URLs están **escritas a mano dentro de los componentes**, así que cambiar un tablero exige tocar código y desplegar. El requerimiento no está cumplido.

Para cerrarlo:

1. Un **bloque Puck "Contenedor Power BI"** en `config/puck.config.tsx`, con la URL como campo editable.
2. **Validación de la URL en el servidor** antes de guardarla: esquema `https` y dominio en lista blanca (`app.powerbi.com` y dominios SENA autorizados). Ver `3-seguridad-del-proyecto.md` §S6.
3. El token del informe deja de estar en el código y pasa a ser dato, editable desde el panel.

---

## 4. Controles de seguridad pendientes

`3-seguridad-del-proyecto.md` clasifica los iframes como superficie **S6** (clickjacking, contenido malicioso) y exige varios controles. Estado real hoy:

| Control exigido (S6) | Estado |
|---|---|
| Lista blanca de dominios | **falta** — no hay validación, las URLs son literales |
| Validar la URL en el servidor | **falta** — no pasan por la API |
| Atributo `sandbox` en los iframes | **falta** — los tres solo llevan `allowFullScreen` |
| CSP `frame-src` restrictiva | **falta** |

Que hoy las URLs sean literales de confianza mitiga el riesgo, pero **esa mitigación desaparece en cuanto se implemente el punto 3 de la sección anterior**: en el momento en que un editor pueda escribir la URL, los cuatro controles pasan a ser obligatorios antes de exponer la funcionalidad.

---

## 5. Nota sobre *Publish to web*

`app.powerbi.com/view` es un enlace **público**: cualquiera con la URL ve el informe, sin autenticación, aunque esté embebido en la intranet protegida. Si el contenido de estos tableros llega a considerarse información interna restringida (RF-15), *Publish to web* no es el mecanismo adecuado y habría que migrar a *Embed for your organization* con autenticación Azure AD.

Queda registrado como decisión a validar con el cliente, no como defecto.
