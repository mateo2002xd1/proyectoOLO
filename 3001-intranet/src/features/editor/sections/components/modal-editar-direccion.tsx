'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCierreAnimado } from '@/shared/lib/modals/use-cierre-animado';
import { poppins } from '@/shared/lib/typography/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { ApiError } from '@/shared/lib/api/api-client';
import {
  cambiarDireccion,
  consultarUsoDeDireccion,
  validarNuevaDireccion,
  type UsoDeLaDireccion,
  type ValidacionDeDireccion,
} from '../services/secciones.service';
import { agruparUbicaciones, unirConY } from '../lib/ubicacion-de-enlaces';
import { rutaPublicaDeSlug } from '../../model/rutas';

/** Cuánto se espera tras la última tecla antes de preguntar si la dirección sirve. */
const MS_DE_ESPERA = 350;

/** El texto de error que mandó la API, o el de respaldo. */
const mensajeDeError = (fallo: unknown, respaldo: string): string => {
  if (fallo instanceof ApiError) return fallo.message;
  if (fallo instanceof Error) return fallo.message;
  return (fallo as { response?: { data?: { error?: string } } })?.response?.data?.error ?? respaldo;
};

export interface ModalEditarDireccionProps {
  slug: string;
  abierto: boolean;
  alCerrar: () => void;
}

/**
 * «Editar dirección»: cambia el slug de la página y, si otras páginas la enlazan, actualiza esos
 * enlaces en el mismo paso.
 *
 * El diálogo no deja cambiar nada a ciegas. Al abrirse pide a la API dónde se usa la
 * dirección actual y quién tiene abierto el editor; al escribir, comprueba (con espera) que la
 * nueva sirve y está libre. Con eso muestra **un solo estado a la vez**, sin iconos —el color
 * de la tarjeta ya dice si avisa o impide—:
 *
 *  - la dirección no sirve → error con el motivo;
 *  - alguien tiene abierto el editor → error, hay que esperar;
 *  - hay enlaces → advertencia con la lista de dónde están; el botón, blanco con borde y
 *    relleno amarillo (el color del estado), dice que los actualiza (es el consentimiento: sin
 *    él la API rechaza el cambio);
 *  - no hay ninguno → éxito, el botón solo cambia la dirección.
 *
 * Los dos botones miden lo mismo (`nueva-seccion-acciones--simetricas`). El servidor repite
 * todas las comprobaciones al cambiar: lo de aquí informa, no autoriza. Si responde 409 es
 * que algo cambió desde que se abrió el diálogo (alguien enlazó la página, abrió el editor o
 * tomó la dirección): se vuelve a pedir el uso para que lo que se ve sea lo que hay.
 */
export function ModalEditarDireccion({ slug, abierto, alCerrar }: ModalEditarDireccionProps) {
  const router = useRouter();
  const [uso, setUso] = useState<UsoDeLaDireccion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [nueva, setNueva] = useState('');
  // Lo que respondió la API y para qué texto: si el texto cambió, esa respuesta ya no vale.
  const [validacion, setValidacion] = useState<{
    texto: string;
    resultado: ValidacionDeDireccion;
  } | null>(null);
  const [cambiando, setCambiando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El formulario se vacía al abrir y no al cerrar: al cerrar sigue a la vista lo que dura su
  // salida. Es el ajuste de estado durante el render que recomienda React para «cuando
  // cambia una prop», sin efecto.
  const [estabaAbierto, setEstabaAbierto] = useState(abierto);
  if (abierto !== estabaAbierto) {
    setEstabaAbierto(abierto);
    if (abierto) {
      setNueva('');
      setValidacion(null);
      setError(null);
    }
  }

  // Dónde se usa la dirección actual, al abrir. Los `setState` de un efecto son aquí a
  // propósito: el dato viene de la API y no puede estar en el estado inicial (§9 de
  // 2-convenciones-del-proyecto.md).
  useEffect(() => {
    if (!abierto || !slug) return;

    let vigente = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setUso(null);

    consultarUsoDeDireccion(slug)
      .then((resultado) => {
        if (vigente) setUso(resultado);
      })
      .catch((fallo) => {
        if (vigente) setError(mensajeDeError(fallo, 'No se pudo consultar la página.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, slug]);

  // Vuelve a pedir dónde se usa la dirección, sin vaciar lo que ya se ve: tras un 409 la lista y
  // el botón se ajustan a lo que cambió, y quien editaba puede confirmar de nuevo sin cerrar.
  const refrescarUso = () => {
    consultarUsoDeDireccion(slug)
      .then(setUso)
      .catch(() => undefined);
  };

  const texto = nueva.trim();

  // ¿Sirve lo escrito? Con espera: una consulta por pausa al teclear, no por tecla.
  useEffect(() => {
    if (!abierto || !uso || uso.protegida || !texto) return;

    let vigente = true;
    const temporizador = setTimeout(() => {
      validarNuevaDireccion(slug, texto)
        .then((resultado) => {
          if (vigente) setValidacion({ texto, resultado });
        })
        .catch(() => {
          if (!vigente) return;
          setValidacion({
            texto,
            resultado: {
              valor: '',
              valida: false,
              motivo: 'invalida',
              mensaje: 'No se pudo comprobar la dirección. Inténtalo de nuevo.',
            },
          });
        });
    }, MS_DE_ESPERA);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [abierto, uso, slug, texto]);

  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado) return null;

  const cerrar = () => {
    if (cambiando) return;
    alCerrar();
  };

  const resultado = validacion && validacion.texto === texto ? validacion.resultado : null;
  const comprobando = Boolean(texto) && !resultado;
  const referencias = uso?.referencias ?? [];
  const ubicaciones = agruparUbicaciones(referencias);
  const enEdicion = uso?.enEdicion ?? [];
  const hayEnlaces = referencias.length > 0;
  const puedeCambiar = Boolean(resultado?.valida) && enEdicion.length === 0 && !cambiando;

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!resultado?.valida || !puedeCambiar) return;

    setCambiando(true);
    setError(null);
    try {
      const cambio = await cambiarDireccion(slug, resultado.valor, hayEnlaces);
      alCerrar();
      // En la intranet, la URL canónica la da `rutaPublicaDeSlug(slug)`.
      router.push(rutaPublicaDeSlug(cambio.slug));
      router.refresh();
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No se pudo cambiar la dirección.'));
      setCambiando(false);
      const status = fallo instanceof ApiError ? fallo.status : (fallo as { response?: { status?: number } })?.response?.status;
      if (status === 409) refrescarUso();
    }
  };

  return (
    <div
      className="nueva-seccion-fondo olo-anim-fondo"
      data-cerrando={cerrando || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-direccion-titulo"
      // Cerrar al pulsar fuera, pero solo si el clic empieza en el fondo: arrastrar desde
      // dentro hasta soltarlo fuera no debe cerrarlo.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') cerrar();
      }}
    >
      {/* Poppins, como todos los modales del panel y del editor. */}
      <form
        className={`nueva-seccion-caja nueva-seccion-caja--ancha olo-anim-caja ${poppins.className}`}
        onSubmit={enviar}
      >
        <h2 id="editar-direccion-titulo" className="nueva-seccion-titulo">
          {uso ? (
            <>
              Editar dirección de «<span className="break-words">{uso.titulo}</span>»
            </>
          ) : (
            'Editar dirección'
          )}
        </h2>

        {cargando && <p className="nueva-seccion-ruta">Comprobando…</p>}

        {uso?.protegida && (
          <MensajeEstado tipo="advertencia" rol="note" sinIcono className="nueva-seccion-estado">
            <p className="font-semibold">Dirección del sistema</p>
            <p className="mt-0.5">
              La dirección <code>/{uso.slug}</code> la usa el sistema y no se puede cambiar.
            </p>
          </MensajeEstado>
        )}

        {uso && !uso.protegida && (
          <>
            <p className="nueva-seccion-ruta !mt-0">
              Dirección actual <code>/{uso.slug}</code>
            </p>

            <label className="nueva-seccion-etiqueta mt-4" htmlFor="editar-direccion-nueva">
              Nueva dirección
            </label>
            <input
              id="editar-direccion-nueva"
              className="nueva-seccion-campo"
              value={nueva}
              onChange={(evento) => setNueva(evento.target.value)}
              placeholder="bolsa-de-empleo"
              maxLength={200}
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={cambiando}
              aria-describedby="editar-direccion-estado"
            />

            {/* Un solo estado a la vez. `aria-live` para que se anuncie al cambiar: quien usa un
                lector de pantalla no ve la tarjeta aparecer. */}
            <div id="editar-direccion-estado" className="mt-4 min-h-[3.25rem]" aria-live="polite">
              {comprobando && <p className="nueva-seccion-ruta !mt-0">Comprobando la dirección…</p>}

              {resultado && !resultado.valida && (
                <MensajeEstado tipo="error" rol="note" sinIcono className="nueva-seccion-estado">
                  {resultado.mensaje}
                </MensajeEstado>
              )}

              {resultado?.valida && enEdicion.length > 0 && (
                <MensajeEstado tipo="error" rol="note" sinIcono className="nueva-seccion-estado">
                  <p className="font-semibold">No se puede cambiar ahora</p>
                  <p className="mt-0.5">
                    {unirConY(
                      enEdicion.map((pagina) => (
                        <span key={pagina.slug}>
                          <strong className="font-semibold">«{pagina.titulo}»</strong> ({pagina.usuario})
                        </span>
                      ))
                    )}{' '}
                    {enEdicion.length > 1 ? 'tienen' : 'tiene'} abierto el editor. Espera a que{' '}
                    {enEdicion.length > 1 ? 'lo cierren' : 'lo cierre'} e inténtalo de nuevo.
                  </p>
                </MensajeEstado>
              )}

              {resultado?.valida && enEdicion.length === 0 && hayEnlaces && (
                <MensajeEstado tipo="advertencia" rol="note" sinIcono className="nueva-seccion-estado">
                  <p className="font-semibold">La dirección actual está en uso</p>
                  <p className="mt-0.5">
                    {referencias.length === 1
                      ? 'Hay 1 enlace'
                      : `Hay ${referencias.length} enlaces`}{' '}
                    a <code>/{uso.slug}</code> en{' '}
                    {uso.paginasConEnlaces === 1 ? '1 página' : `${uso.paginasConEnlaces} páginas`}. Al
                    continuar se actualizan a <code>/{resultado.valor}</code>:
                  </p>
                  <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5">
                    {ubicaciones.map((ubicacion, indice) => (
                      <li key={indice}>
                        <span className="first-letter:uppercase">{ubicacion.lugar}</span>
                        {ubicacion.bloque && (
                          <>
                            {': '}
                            <strong className="font-semibold">«{ubicacion.bloque}»</strong>
                            {ubicacion.campo && (
                              <>
                                {' › '}
                                <strong className="font-semibold">«{ubicacion.campo}»</strong>
                              </>
                            )}
                          </>
                        )}
                        {ubicacion.textos.length > 0 && (
                          <> — {unirConY(ubicacion.textos.map((enlace) => `«${enlace}»`))}</>
                        )}
                        {ubicacion.enBorrador && ' (también en borrador o en revisión)'}
                      </li>
                    ))}
                  </ul>
                </MensajeEstado>
              )}

              {resultado?.valida && enEdicion.length === 0 && !hayEnlaces && (
                <MensajeEstado tipo="exito" rol="note" sinIcono className="nueva-seccion-estado">
                  <p className="font-semibold">Dirección disponible</p>
                  <p className="mt-0.5">
                    <code>/{resultado.valor}</code> está libre y ningún enlace del portal apunta a{' '}
                    <code>/{uso.slug}</code>.
                  </p>
                </MensajeEstado>
              )}
            </div>

            {/* Sin tarjeta: es una nota fija, no el estado de lo escrito. */}
            <p className="nueva-seccion-nota">
              Los enlaces de fuera del portal (correos, otros sitios, marcadores) a la dirección
              actual dejarán de funcionar.
            </p>
          </>
        )}

        {error && <p className="nueva-seccion-error">{error}</p>}

        <div
          className={`nueva-seccion-acciones nueva-seccion-acciones--simetricas${
            uso?.protegida || (!cargando && !uso) ? ' nueva-seccion-acciones--una' : ''
          }`}
        >
          {uso?.protegida || (!cargando && !uso) ? (
            <button
              type="button"
              onClick={cerrar}
              className="nueva-seccion-boton nueva-seccion-boton--principal"
            >
              Entendido
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cerrar}
                className="nueva-seccion-boton"
                disabled={cambiando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`nueva-seccion-boton ${
                  hayEnlaces ? 'nueva-seccion-boton--aviso' : 'nueva-seccion-boton--principal'
                }`}
                disabled={!puedeCambiar}
              >
                {cambiando
                  ? 'Cambiando…'
                  : hayEnlaces
                    ? 'Actualizar enlaces y cambiar'
                    : 'Cambiar dirección'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
