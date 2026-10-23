/**
 * Comprueba que `sanitizarContenidoPuck` no deje pasar XSS almacenado.
 *
 * Existe por la auditoría del 2026-10-22 (`auditorias/2026-10-22-xss-almacenado-y-defensas.md`).
 * Tiene dos mitades porque el sanitizador tiene dos mecanismos distintos:
 *
 *   1. **HTML** (textos con `<`): pasa por DOMPurify. Se prueba con una batería de cargas
 *      clásicas y de mutación (mXSS), y se comprueba el resultado **parseándolo**, como lo
 *      haría un navegador, no buscando cadenas.
 *   2. **URLs sueltas** (textos sin `<`): solo se validan si la *clave* está en `CAMPOS_URL`.
 *      Aquí se prueba con los nombres de campo reales de los bloques (`urlBoton`,
 *      `urlPowerBi`, `descargaUrl`…), que acaban en un `href` o en el `src` de un `iframe`.
 *
 * También prueba los helpers compartidos de `@olo/url-policy` (los que usan los bloques al
 * pintar y las pantallas de acceso al redirigir), porque son la otra mitad de la defensa.
 *
 * No toca la base de datos ni Redis. Sale con código 1 si algo pasa.
 */
import { JSDOM } from 'jsdom';
import {
  enlaceSeguro,
  esEsquemaEjecutable,
  iframeSeguro,
  imagenSegura,
  rutaInternaSegura,
  directivaFrameSrc,
} from '@olo/url-policy';
import { sanitizarContenidoPuck } from '../../src/shared/sanitizar-contenido';

let fallos = 0;
let comprobaciones = 0;

const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

// ── 1. HTML ──────────────────────────────────────────────────────────────────

const ETIQUETAS_OK = new Set([
  'html', 'head', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'b', 'strong', 'i', 'em', 'u', 's', 'del',
  'mark', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span',
  'div', 'section', 'article', 'figure', 'figcaption',
]);
const PROTOCOLO_OK = /^(https?|mailto|tel):/i;

/** Qué hay de ejecutable en un HTML, mirándolo como lo mira un navegador. */
const peligrosoEn = (html: string): string[] => {
  const dom = new JSDOM(html);
  const hallazgos: string[] = [];
  dom.window.document.querySelectorAll('*').forEach((el) => {
    const nombre = el.localName;
    if (!ETIQUETAS_OK.has(nombre)) hallazgos.push(`<${nombre}>`);
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name)) hallazgos.push(`${attr.name}=`);
      if (['href', 'src'].includes(attr.name)) {
        const valor = attr.value.replace(/[\u0000- ]/g, '');
        if (/^[a-z][a-z0-9+.-]*:/i.test(valor) && !PROTOCOLO_OK.test(valor)) hallazgos.push(`${attr.name}="${attr.value.slice(0, 30)}"`);
      }
      if (attr.name === 'style' && !/^\s*text-align:\s*(left|center|right|justify)\s*;?\s*$/i.test(attr.value)) hallazgos.push(`style="${attr.value.slice(0, 30)}"`);
    }
  });
  return hallazgos;
};

const CARGAS_HTML: Array<[string, string]> = [
  ['img con onerror', '<img src=x onerror=alert(document.domain)>'],
  ['script', '<script>alert(1)</script>'],
  ['a con javascript:', '<a href="javascript:alert(1)">x</a>'],
  ['javascript: con tabulador', '<a href="java\tscript:alert(1)">x</a>'],
  ['javascript: con entidad', '<a href="&#106;avascript:alert(1)">x</a>'],
  ['javascript: con espacios', '<a href="   javascript:alert(1)">x</a>'],
  ['JavaScript: en mayúsculas', '<a href="JaVaScRiPt:alert(1)">x</a>'],
  ['svg onload', '<svg onload=alert(1)>'],
  ['svg dentro de a', '<a href="#"><svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg></a>'],
  ['iframe srcdoc', '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
  ['iframe javascript:', '<iframe src="javascript:alert(1)"></iframe>'],
  ['object/embed', '<object data="javascript:alert(1)"></object><embed src="javascript:alert(1)">'],
  ['form action', '<form action="javascript:alert(1)"><button>x</button></form>'],
  ['details ontoggle', '<details open ontoggle=alert(1)>x</details>'],
  ['body onload', '<body onload=alert(1)>'],
  ['img data:text/html', '<img src="data:text/html,<script>alert(1)</script>">'],
  ['a data:', '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>'],
  ['style con expresión', '<div style="background:url(javascript:alert(1))">x</div>'],
  ['style con posición', '<div style="position:fixed;top:0;left:0;width:100%;height:100%">tapa</div>'],
  ['<style>', '<style>@import "//evil.example/x.css";</style><p>x</p>'],
  ['meta refresh', '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'],
  ['base href', '<base href="//evil.example/"><a href="x">x</a>'],
  ['link stylesheet', '<link rel="stylesheet" href="//evil.example/x.css">'],
  ['mXSS: math/mtext/table/mglyph/style', '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;/mglyph&gt;&lt;img&Tab;src=1&Tab;onerror=alert(1)&gt;">'],
  ['mXSS: noscript', '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>'],
  ['mXSS: svg/style/desync', '<svg></p><style><a id="</style><img src=1 onerror=alert(1)>">'],
  ['mXSS: form anidado', '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>'],
  ['mXSS: textarea/title', '<textarea><img src=x onerror=alert(1)></textarea><title><img src=x onerror=alert(1)></title>'],
  ['etiqueta rota', '<scr<script>ipt>alert(1)</scr</script>ipt>'],
  ['img srcset', '<img src="/a.png" srcset="javascript:alert(1) 1x">'],
  ['a ping', '<a href="/x" ping="https://evil.example/log">x</a>'],
  ['atributo name (clobbering)', '<img name="cookie" id="location" src="/a.png">'],
  ['nombre de atributo con on', '<p onmouseover="alert(1)">x</p>'],
  ['audio/video onerror', '<video><source onerror="alert(1)"></video><audio src=x onerror=alert(1)>'],
];

/** Las mismas cargas, en las ubicaciones donde Puck y EditorJS guardan HTML. */
const ubicaciones: Array<[string, (carga: string) => unknown, (limpio: any) => string]> = [
  ['prop de un bloque', (c) => ({ content: [{ type: 'Texto', props: { texto: c } }], root: {} }), (l) => l.content[0].props.texto],
  ['EditorJS (data.text)', (c) => ({ content: [{ type: 'TextoEnriquecido', props: { content: { blocks: [{ type: 'paragraph', data: { text: c } }] } } }] }), (l) => l.content[0].props.content.blocks[0].data.text],
  ['EditorJS (items de lista)', (c) => ({ content: [{ type: 'T', props: { content: { blocks: [{ type: 'list', data: { items: [c] } }] } } }] }), (l) => l.content[0].props.content.blocks[0].data.items[0]],
  ['bloque dentro de una DropZone', (c) => ({ content: [], zones: { 'Bloque:zona': [{ type: 'Texto', props: { texto: c } }] } }), (l) => l.zones['Bloque:zona'][0].props.texto],
  ['root', (c) => ({ content: [], root: { props: { descripcion: c } } }), (l) => l.root.props.descripcion],
];

const verificarHtml = (): void => {
  console.log('\n=== HTML: cargas clásicas y de mutación (mXSS), en cada ubicación ===');
  for (const [lugar, armar, leer] of ubicaciones) {
    const peligrosas: string[] = [];
    for (const [nombre, carga] of CARGAS_HTML) {
      const hallazgos = peligrosoEn(leer(sanitizarContenidoPuck(armar(carga))));
      if (hallazgos.length > 0) peligrosas.push(`${nombre} [${hallazgos.slice(0, 3).join(' ')}]`);
    }
    informar(peligrosas.length === 0, `${lugar}: ${CARGAS_HTML.length} cargas`, peligrosas.join('; '));
  }

  console.log('\n=== HTML: lo legítimo se conserva ===');
  const bueno = '<p style="text-align: center">Hola <strong>mundo</strong> <a href="/estudios">ir</a> <a href="https://sena.edu.co" target="_blank" rel="noopener">sena</a> <img src="/uploads/a.png" alt="x"></p>';
  const limpio = (sanitizarContenidoPuck({ content: [{ type: 'T', props: { texto: bueno } }] }) as any).content[0].props.texto as string;
  informar(limpio.includes('text-align: center') && limpio.includes('href="/estudios"') && limpio.includes('<strong>') && limpio.includes('src="/uploads/a.png"'), 'alineación, enlace relativo, negrita e imagen sobreviven', limpio.slice(0, 80));

  console.log('\n=== HTML: `class` e `id` no se guardan (XSS-09) ===');
  const conClases =
    '<div class="fixed inset-0 z-50 bg-white" id="location"><p class="text-9xl" id="cookie">Hola <a class="absolute" id="x" href="/estudios">ir</a></p></div>';
  const sinClases = (sanitizarContenidoPuck({ content: [{ type: 'T', props: { texto: conClases } }] }) as any).content[0].props.texto as string;
  const restos = new JSDOM(sinClases).window.document.querySelectorAll('[class],[id]').length;
  informar(restos === 0, 'una clase de utilidad o un id (DOM clobbering) se quitan', sinClases.slice(0, 80));
  informar(sinClases.includes('Hola') && sinClases.includes('href="/estudios"'), 'el texto y el enlace de ese HTML se conservan');
};

// ── 2. URLs sueltas ──────────────────────────────────────────────────────────

/** Nombres de campo reales de los bloques cuyo valor acaba en un `href`, un `src` o un `iframe`. */
const CLAVES_DE_URL_REALES = [
  'src', 'href', 'url', 'link', 'backgroundImage', 'imageUrl',
  'urlBoton', 'urlEnlace', 'urlDestino', 'urlArchivo', 'descargaUrl', 'puntosAtencionUrl',
  'urlPowerBi', 'videoUrl', 'enlace', 'imagen', 'imagenSrc', 'miniatura', 'icono', 'logoUrl', 'archivo',
];
const CARGAS_URL = ['javascript:alert(document.domain)', '  JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html,<b>x</b>'];

const EJECUTABLE = /^[\u0000- ]*(javascript|vbscript|data):/i;
const sinControl = (s: string) => s.replace(/[\t\n\r]/g, '');

const verificarUrls = (): void => {
  console.log('\n=== URLs sueltas: ¿se descarta un esquema ejecutable sea cual sea el nombre del campo? ===');
  const conFuga: string[] = [];
  for (const clave of CLAVES_DE_URL_REALES) {
    const quedaron: string[] = [];
    for (const carga of CARGAS_URL) {
      const limpio = sanitizarContenidoPuck({ content: [{ type: 'Bloque', props: { [clave]: carga } }] }) as any;
      const valor = String(limpio.content[0].props[clave]);
      if (EJECUTABLE.test(sinControl(valor))) quedaron.push(JSON.stringify(carga).slice(0, 28));
    }
    if (quedaron.length > 0) conFuga.push(`${clave} (${quedaron.length}/${CARGAS_URL.length})`);
    informar(quedaron.length === 0, `campo «${clave}»`, quedaron.length ? `se guardó tal cual: ${quedaron.join(', ')}` : '');
  }
  console.log(`\n  Campos con fuga: ${conFuga.length} de ${CLAVES_DE_URL_REALES.length}${conFuga.length ? ` → ${conFuga.join(', ')}` : ''}`);

  console.log('\n=== URLs anidadas en objetos y listas ===');
  const anidado = sanitizarContenidoPuck({
    content: [{ type: 'Bloque', props: { tarjetas: [{ titulo: 'x', urlEnlace: 'javascript:alert(1)' }], boton: { texto: 'Ir', urlBoton: 'javascript:alert(1)' } } }],
  }) as any;
  const p = anidado.content[0].props;
  informar(!EJECUTABLE.test(p.tarjetas[0].urlEnlace), 'tarjetas[0].urlEnlace', p.tarjetas[0].urlEnlace);
  informar(!EJECUTABLE.test(p.boton.urlBoton), 'boton.urlBoton', p.boton.urlBoton);
};

// ── 3. Informativo: dónde puede apuntar un iframe ────────────────────────────

const verificarIframes = (): void => {
  console.log('\n=== iframe del bloque de tableros: ¿el servidor limita a qué sitio puede apuntar? ===');
  const limpio = sanitizarContenidoPuck({ content: [{ type: 'TasaDashboards', props: { tableros: [{ urlPowerBi: 'https://sitio-ajeno.example/login-falso' }] } }] }) as any;
  const url = String(limpio.content[0].props.tableros[0].urlPowerBi);
  informar(!url.includes('sitio-ajeno.example'), 'una URL https ajena a Power BI / SENA no debería quedar en un iframe', url);
};

// ── 4. Evasiones: formas de escribir el mismo esquema ────────────────────────

const car = (codigo: number) => String.fromCharCode(codigo);

const verificarEvasiones = (): void => {
  console.log('\n=== Evasiones del esquema ejecutable (en un campo cualquiera) ===');
  const evasiones: Array<[string, string]> = [
    ['mayúsculas y minúsculas', 'JaVaScRiPt:alert(1)'],
    ['espacios al principio', '   javascript:alert(1)'],
    ['tabulador en medio', 'java' + car(9) + 'script:alert(1)'],
    ['salto de línea en medio', 'java' + car(10) + 'script:alert(1)'],
    ['control al principio', car(1) + car(2) + 'javascript:alert(1)'],
    ['espacio sin ruptura (NBSP)', car(0xa0) + 'javascript:alert(1)'],
    ['ancho cero en medio', 'java' + car(0x200b) + 'script:alert(1)'],
    ['marca de orden de bytes', car(0xfeff) + 'javascript:alert(1)'],
    ['separador de línea Unicode', car(0x2028) + 'javascript:alert(1)'],
    ['espacio tras los dos puntos', 'javascript: alert(1)'],
    ['vbscript', 'vbscript:msgbox(1)'],
    ['data de HTML', 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
    ['data sin tipo', 'data:,alert(1)'],
    ['data de SVG', 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+'],
  ];
  // En un campo que no parece dirección ('titulo'), en otro que sí ('urlX') y dentro de listas.
  for (const [nombre, carga] of evasiones) {
    const sitios = ['titulo', 'urlX', 'descripcion'].map((clave) => {
      const limpio = sanitizarContenidoPuck({ content: [{ type: 'B', props: { [clave]: carga, lista: [{ [clave]: carga }] } }] }) as any;
      const p = limpio.content[0].props;
      return String(p[clave]) === '' && String(p.lista[0][clave]) === '';
    });
    informar(sitios.every(Boolean), nombre, sitios.every(Boolean) ? '' : 'quedó algo sin vaciar');
  }

  console.log('\n=== Lo legítimo no se toca ===');
  const intactos: Array<[string, string, string]> = [
    ['título con dos puntos', 'titulo', 'Nota: lee el reglamento'],
    ['título que empieza por «Data:»', 'titulo', 'Data: 2026'],
    ['enlace https', 'urlBoton', 'https://www.sena.edu.co/es-co/Paginas/default.aspx'],
    ['ruta del sitio', 'urlEnlace', '/estudios/becas'],
    ['ancla', 'urlDestino', '#contacto'],
    ['correo', 'enlace', 'mailto:observatorio@sena.edu.co'],
    ['teléfono', 'enlace', 'tel:+576015461500'],
    ['imagen subida', 'imagen', '/uploads/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.png'],
    ['imagen en data:', 'imagen', 'data:image/png;base64,iVBORw0KGgo='],
    ['archivo con nombre', 'archivo', 'Informe técnico 2026.pdf'],
    ['tablero de Power BI', 'urlPowerBi', 'https://app.powerbi.com/view?r=eyJrIjoiYWJjIn0%3D'],
    ['video de YouTube (barra)', 'videoUrl', 'https://www.youtube.com/watch?v=4E7Sci4DAVQ'],
    ['video de YouTube (corto)', 'videoUrl', 'https://youtu.be/4E7Sci4DAVQ'],
    ['micrositio de SENA', 'urlPowerBi', 'https://observatorio.sena.edu.co/tablero'],
  ];
  for (const [nombre, clave, valor] of intactos) {
    const limpio = sanitizarContenidoPuck({ content: [{ type: 'B', props: { [clave]: valor } }] }) as any;
    informar(limpio.content[0].props[clave] === valor, nombre, String(limpio.content[0].props[clave]));
  }
};

// ── 5. Los helpers que usan los bloques y las pantallas de acceso ─────────────

const verificarHelpers = (): void => {
  console.log('\n=== @olo/url-policy · enlaceSeguro (lo que se pinta en un href) ===');
  const ve = (valor: unknown, esperado: string, descripcion: string) =>
    informar(enlaceSeguro(valor) === esperado, descripcion, JSON.stringify(enlaceSeguro(valor)));
  ve('javascript:alert(1)', '', 'javascript:');
  ve('  JaVaScRiPt:alert(1)', '', 'javascript: disfrazado');
  ve('data:text/html,<b>x</b>', '', 'data: de HTML');
  ve('//sitio-ajeno.example', '', 'protocolo relativo');
  ve('/' + car(92) + 'sitio-ajeno.example', '', 'barra y barra invertida');
  ve(undefined, '', 'no es texto');
  ve({ toString: () => 'javascript:1' }, '', 'objeto con toString');
  ve('https://sena.edu.co/x', 'https://sena.edu.co/x', 'https');
  ve('/estudios', '/estudios', 'ruta del sitio');
  ve('#contacto', '#contacto', 'ancla');
  ve('mailto:a@sena.edu.co', 'mailto:a@sena.edu.co', 'mailto');
  ve('archivo.pdf', 'archivo.pdf', 'ruta relativa sin esquema');

  console.log('\n=== @olo/url-policy · imagenSegura ===');
  informar(imagenSegura('javascript:1') === '', 'javascript: en una imagen');
  informar(imagenSegura('mailto:a@b.co') === '', 'mailto: no es una imagen');
  informar(imagenSegura('/uploads/a.png') === '/uploads/a.png', 'imagen subida');

  console.log('\n=== @olo/url-policy · iframeSeguro ===');
  const vi = (valor: unknown, esperado: boolean, descripcion: string, opciones?: { alAguardar?: boolean }) =>
    informar((iframeSeguro(valor, opciones) !== '') === esperado, descripcion);
  vi('https://app.powerbi.com/view?r=abc', true, 'Power BI');
  vi('https://www.youtube-nocookie.com/embed/4E7Sci4DAVQ', true, 'YouTube sin cookies');
  vi('https://observatorio.sena.edu.co/x', true, 'subdominio de sena.edu.co');
  vi('https://sena.edu.co/x', false, 'el dominio a secas no es un subdominio');
  vi('https://app.powerbi.com.sitio-ajeno.example/x', false, 'host que empieza igual');
  vi('https://sitio-ajeno.example/app.powerbi.com', false, 'host ajeno con la ruta engañosa');
  vi('https://usuario:clave@app.powerbi.com/x', false, 'credenciales en la URL');
  vi('http://app.powerbi.com/x', false, 'http sin cifrar');
  vi('javascript:alert(1)', false, 'javascript:');
  vi('//app.powerbi.com/x', false, 'protocolo relativo');
  vi('/uploads/a.html', false, 'ruta relativa');
  vi('https://youtu.be/4E7Sci4DAVQ', false, 'youtu.be pintado tal cual (el bloque lo convierte antes)');
  vi('https://youtu.be/4E7Sci4DAVQ', true, 'youtu.be al guardar', { alAguardar: true });
  informar(directivaFrameSrc().includes('https://app.powerbi.com') && directivaFrameSrc().startsWith("'self'"), 'frame-src sale de la misma lista', directivaFrameSrc());

  console.log('\n=== @olo/url-policy · rutaInternaSegura (?redirect= tras el login) ===');
  const vr = (valor: unknown, esperado: string, descripcion: string) =>
    informar(rutaInternaSegura(valor, '/inicio') === esperado, descripcion, JSON.stringify(rutaInternaSegura(valor, '/inicio')));
  vr('/admin-panel/dashboard?x=1#y', '/admin-panel/dashboard?x=1#y', 'ruta con consulta y ancla');
  vr('//sitio-ajeno.example', '/inicio', '//host');
  vr('/' + car(92) + 'sitio-ajeno.example', '/inicio', '/\\host (barra invertida)');
  vr('/' + car(9) + '/sitio-ajeno.example', '/inicio', '/<tab>/host');
  vr('/' + car(10) + 'sitio-ajeno.example', '/inicio', '/<salto>host');
  vr('https://sitio-ajeno.example', '/inicio', 'URL absoluta');
  vr('javascript:alert(1)', '/inicio', 'javascript:');
  vr('', '/inicio', 'vacío');
  vr(null, '/inicio', 'null');
  informar(esEsquemaEjecutable('Data: 2026') === false, 'un texto «Data: 2026» no se confunde con un data:');
};

verificarHtml();
verificarUrls();
verificarIframes();
verificarEvasiones();
verificarHelpers();

console.log(`\n${comprobaciones} comprobaciones · ${fallos === 0 ? 'Todo correcto.' : `${fallos} fallaron.`}\n`);
process.exit(fallos === 0 ? 0 : 1);
