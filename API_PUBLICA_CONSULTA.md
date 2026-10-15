# API pública de consulta CNO / CUOC

Guía para integrar el buscador de ocupaciones de la página web con el catálogo CNO/CUOC.

- **Alcance:** solo lectura. Dos endpoints: buscador y ficha de ocupación.
- **Autenticación:** una API key por sistema, enviada en la cabecera `x-api-key`. No hay usuario ni sesión.
- **Formato:** JSON sobre HTTPS.

---

## 1. Datos de conexión

| Dato | Valor |
|---|---|
| URL base | `https://oloserver.tail033823.ts.net` |
| Ruta base de la API | `/api/public/consulta` |
| Cabecera de autenticación | `x-api-key: <su llave>` |
| Su llave | Se entrega por un canal aparte (ver sección 2) |

---

## 2. Cómo recibir y guardar la API key

La llave **no viene en este documento ni en el mismo correo**. Quien la entrega la envía por otro canal (mensaje directo cifrado, llamada, gestor de contraseñas compartido o enlace de un solo uso).

Al recibirla:

1. **Guárdela solo en variables de entorno del servidor**, nunca en el código ni en el repositorio.
2. **No la ponga en el código que llega al navegador** (JavaScript del front, variables `VITE_*`, `REACT_APP_*` o `NEXT_PUBLIC_*`). Cualquier visitante podría verla en las herramientas del navegador.
3. **No la comparta por chat abierto, correo ni capturas de pantalla.**
4. Si sospecha que se filtró, avise de inmediato. Se genera una nueva y la anterior deja de funcionar, sin afectar a otros sistemas.

### Dónde ponerla: archivo `.env` del servidor de su página

```env
# Conexión con la API pública CNO/CUOC
CNO_API_URL=https://oloserver.tail033823.ts.net
CNO_API_KEY=pegue_aqui_la_llave_recibida
```

Agregue `.env` al `.gitignore` si aún no está:

```gitignore
.env
```

---

## 3. Arquitectura recomendada

La página llama a **su propio servidor**, y este llama a la API de CNO/CUOC agregando la llave. El navegador nunca ve la llave.

```
Navegador  ──►  Su backend (/api/ocupaciones)  ──►  API CNO/CUOC
                 añade x-api-key desde .env
```

---

## 4. Endpoints

### 4.1 Buscador

```
GET /api/public/consulta/buscar?q=<texto>&limit=<n>
```

| Parámetro | Obligatorio | Descripción |
|---|---|---|
| `q` | No | Código, nombre o denominación. Máximo 120 caracteres. |
| `limit` | No | Cantidad máxima de resultados, de 1 a 50. Por defecto 20. |

Respuesta `200`: lista de ocupaciones.

```json
[
  {
    "tipo": "CNO",
    "codigo": "0211",
    "nombre": "Gerentes de ingeniería",
    "denominaciones": [
      { "codigo": "D-0001", "nombre": "Gerente de ingeniería civil" }
    ]
  }
]
```

- `tipo` es `CNO` o `CUOC`.
- `codigo` es **texto**, puede tener ceros a la izquierda. No lo convierta a número.

### 4.2 Ficha de una ocupación

```
GET /api/public/consulta/:codigo
```

Un código de 4 dígitos es CNO y uno de 5 dígitos es CUOC. Se detecta automáticamente.

Respuesta `200`:

```json
{
  "tipo": "CNO",
  "codigo": "0211",
  "nombre": "Gerentes de ingeniería",
  "descripcion": "…",
  "ubicacion": {
    "areaDesempeno":      { "codigo": "…", "nombre": "…" },
    "nivelCualificacion": { "codigo": "…", "nombre": "…" }
  },
  "funciones": [
    { "numero": "01", "codigo": "F-897", "descripcion": "…" }
  ],
  "normasAsociadas": [],
  "denominaciones": [ { "codigo": "…", "nombre": "…" } ],
  "ocupacionesRelacionadas": [ { "codigo": "…", "nombre": "…" } ],
  "habilidades": [ { "codigo": "…", "nombre": "…" } ],
  "conocimientos": [ { "codigo": "…", "nombre": "…" } ],
  "correlativa": {
    "tipo": "CUOC",
    "ocupaciones": [ { "codigo": "…", "nombre": "…" } ]
  }
}
```

- `ubicacion.areaDesempeno` y `ubicacion.nivelCualificacion` pueden ser `null`.
- `descripcion` puede ser `null`.
- `normasAsociadas` viene siempre vacío por ahora.
- `correlativa` trae las ocupaciones equivalentes de la clasificación contraria (si la ficha es CNO, vienen CUOC, y al revés).

---

## 5. Códigos de respuesta

| Código | Significado | Qué hacer |
|---|---|---|
| `200` | Correcto | — |
| `400` | Parámetros inválidos (`limit` fuera de 1–50 o `q` de más de 120 caracteres) | Corregir la petición |
| `401` | Falta la llave o no es válida | Revisar `CNO_API_KEY` y que la cabecera se llame exactamente `x-api-key` |
| `404` | La ocupación no existe | Mostrar "no encontrada" |
| `429` | Demasiadas peticiones | Esperar los segundos de la cabecera `Retry-After` |

**Límites:** 300 peticiones por minuto por llave. Quien lo supera queda bloqueado unos minutos. Además hay un límite por IP en el servidor.

Recomendaciones para no llegar al límite:
- Espere a que el usuario deje de escribir (debounce de 300 ms) antes de llamar al buscador.
- Guarde en caché del lado de su servidor las fichas ya consultadas.

---

## 6. Ejemplos de implementación

### 6.1 Prueba rápida con curl

```bash
curl -H "x-api-key: $CNO_API_KEY" \
  "https://oloserver.tail033823.ts.net/api/public/consulta/buscar?q=desarrollador&limit=10"
```

### 6.2 Thunder Client / Postman

```
GET  https://oloserver.tail033823.ts.net/api/public/consulta/buscar?q=desarrollador
Headers:
  x-api-key: <su llave>
```

La llave va en **Headers**. No use la pestaña Auth ni un Bearer Token.

### 6.3 Backend Node.js con Express (recomendado)

```js
// server.js
import 'dotenv/config';
import express from 'express';

const app = express();
const { CNO_API_URL, CNO_API_KEY } = process.env;

async function consultarCno(ruta, res) {
  try {
    const r = await fetch(`${CNO_API_URL}/api/public/consulta${ruta}`, {
      headers: { 'x-api-key': CNO_API_KEY },
    });
    if (r.status === 429) res.set('Retry-After', r.headers.get('Retry-After') ?? '60');
    res.status(r.status).json(await r.json());
  } catch {
    res.status(502).json({ message: 'Servicio de ocupaciones no disponible' });
  }
}

// Buscador: /api/ocupaciones?q=...&limit=...
app.get('/api/ocupaciones', (req, res) => {
  const qs = new URLSearchParams({
    q: String(req.query.q ?? ''),
    limit: String(req.query.limit ?? 20),
  });
  consultarCno(`/buscar?${qs}`, res);
});

// Ficha: /api/ocupaciones/0211
app.get('/api/ocupaciones/:codigo', (req, res) => {
  consultarCno(`/${encodeURIComponent(req.params.codigo)}`, res);
});

app.listen(4000);
```

### 6.4 Front (el navegador llama a su servidor, sin llave)

```js
export async function buscarOcupaciones(texto, limit = 20) {
  const r = await fetch(`/api/ocupaciones?q=${encodeURIComponent(texto)}&limit=${limit}`);
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
}

export async function fichaOcupacion(codigo) {
  const r = await fetch(`/api/ocupaciones/${encodeURIComponent(codigo)}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
}
```

---

## 7. Lista de verificación antes de salir a producción

- [ ] La llave está en `.env` del servidor y `.env` está en `.gitignore`.
- [ ] La llave no aparece en el código ni en las peticiones que ve el navegador.
- [ ] El front llama a su propio servidor, no directamente a `oloserver.tail033823.ts.net`.
- [ ] `codigo` se trata como texto.
- [ ] El buscador usa debounce y se maneja el `429`.
- [ ] Se muestran mensajes claros para `404` y para errores de red.

---

## 8. Soporte

Para pedir una llave nueva, reportar una filtración o informar de un error, escriba a: **munozvanegasy@gmail.com**
