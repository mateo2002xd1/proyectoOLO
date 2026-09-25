/**
 * El tema oscuro es del panel (`/admin`), no del sitio público.
 *
 * El botón de tema solo existe en el panel, pero el script que lo aplicaba antes de
 * pintar corría en todo el sitio: quien había elegido oscuro en el panel veía el
 * portal público con el fondo de `.dark` (`--background: #0b1121`) y bloques sin
 * estilos oscuros encima. La PR #114 lo resolvió quitando el script, y eso trajo
 * otros problemas: el panel parpadeaba en claro en cada carga y se perdía el
 * «volver arriba al recargar». Aquí se conserva el script y se limita a la ruta.
 *
 * El script y `SincronizarTema` leen la misma regla de aquí para no discrepar.
 */

/** Dónde guarda el botón de tema la elección. */
export const CLAVE_TEMA = 'olo-theme';

/** Las rutas que tienen modo oscuro. */
export const RUTA_DEL_PANEL = '/admin';

export const esRutaDelPanel = (ruta: string) =>
  ruta === RUTA_DEL_PANEL || ruta.startsWith(`${RUTA_DEL_PANEL}/`);

/**
 * Corre en el `<head>`, antes de que se pinte nada:
 *
 * - aplica `.dark` solo en el panel y solo si se eligió, para que no parpadee;
 * - pone `.no-transition` durante dos frames, para que el cambio de tema no se anime
 *   al cargar;
 * - al recargar, vuelve arriba en vez de restaurar el scroll.
 *
 * Es texto y no una función porque va dentro de `dangerouslySetInnerHTML`: tiene que
 * funcionar sin React ni módulos. El `try` es por `localStorage`, que puede no estar
 * disponible (navegación privada, almacenamiento bloqueado).
 */
export const SCRIPT_TEMA_ANTES_DE_PINTAR = `(function(){try{if('scrollRestoration' in history){history.scrollRestoration='manual';}window.addEventListener('beforeunload',function(){if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);});var c=document.documentElement.classList;c.add('no-transition');var p=location.pathname;var panel=p===${JSON.stringify(RUTA_DEL_PANEL)}||p.indexOf(${JSON.stringify(`${RUTA_DEL_PANEL}/`)})===0;var s=localStorage.getItem(${JSON.stringify(CLAVE_TEMA)});if(panel&&s==='dark'){c.add('dark');}else{c.remove('dark');}requestAnimationFrame(function(){requestAnimationFrame(function(){c.remove('no-transition');});});}catch(e){}})();`;
