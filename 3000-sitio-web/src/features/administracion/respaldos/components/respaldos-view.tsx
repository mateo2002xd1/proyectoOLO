'use client';

import { useMemo, useState } from 'react';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { BotonOjo } from '@/shared/ui/atoms/boton-ojo';
import { COLOR_DE_ACCION } from '@/shared/lib/identidad-panel';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { BotonDeFila, CeldaDePagina, FechaDeCelda, fechaDeFila, RESALTE_DE_FILA, ResumenDeFila, useFilasAbiertas } from '@/shared/ui/molecules/fila-acordeon';
import { rutaPublicaDeSlug } from '@/features/paginas';
import { useRespaldos } from '../hooks/use-respaldos';
import { VistaPreviaVersion } from './vista-previa-version';
import { ModalDepurarVersiones } from './modal-depurar-versiones';
import type { RegistroRespaldo } from '../types';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

const FILTROS_VACIOS = { ambito: '', editor: '', publicador: '', desde: '', hasta: '' };

/**
 * Historial de publicaciones de página (respaldos).
 *
 * Cada fila es una publicación: qué versión quedó activa, quién la editó y quién
 * la publicó, y —si existía una versión previa— un acceso a su vista previa.
 * Por ahora la lista sale de datos de ejemplo (`respaldos.service.ts`); esta
 * pantalla es solo el frontend, sin conexión a la base de datos todavía.
 *
 * Los filtros son sobre lo ya cargado, no contra un endpoint: no hay `porPagina`
 * que enviar al servidor porque el servidor todavía no sabe filtrar esto.
 */
export function RespaldosView() {
  const { registros, isLoading, isRefreshing, error, recargar } = useRespaldos();
  const [seleccionado, setSeleccionado] = useState<RegistroRespaldo | null>(null);
  const { estaAbierta, alternar } = useFilasAbiertas();
  const [modalDepurarAbierto, setModalDepurarAbierto] = useState(false);
  // Contador de aperturas usado como `key` del modal de depuración: cambiarlo al abrir
  // lo monta de cero, que es la forma de que los filtros y el resultado empiecen
  // limpios sin un efecto que los borre después del primer pintado.
  const [aperturaDepurar, setAperturaDepurar] = useState(0);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  const cambiarFiltro = (campo: keyof typeof FILTROS_VACIOS, valor: string) =>
    setFiltros((previos) => ({ ...previos, [campo]: valor }));

  // Filtrar para que la lista únicamente contenga elementos con versión anterior disponible para restaurar
  const registrosRestaurables = registros.filter(
    (registro) => registro.versionAnteriorNumero !== null && Boolean(registro.versionAnteriorId || registro.versionAnteriorNumero)
  );

  // Las opciones de Editor/Publicador salen de lo cargado, no de un catálogo aparte:
  // Respaldos no tiene (todavía) un endpoint propio de usuarios como sí tiene Auditoría.
  const editores = useMemo(
    () => [...new Set(registrosRestaurables.map((r) => r.editadoPor.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
    [registrosRestaurables]
  );
  const publicadores = useMemo(
    () => [...new Set(registrosRestaurables.map((r) => r.publicadoPor.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
    [registrosRestaurables]
  );

  const registrosFiltrados = useMemo(() => {
    return registrosRestaurables.filter((r) => {
      if (filtros.ambito && r.ambito !== filtros.ambito) return false;
      if (filtros.editor && r.editadoPor.nombre !== filtros.editor) return false;
      if (filtros.publicador && r.publicadoPor.nombre !== filtros.publicador) return false;
      // Comparación de texto sobre `YYYY-MM-DD...`: válida porque la fecha es la
      // parte más significativa al principio del ISO, sin necesidad de parsear.
      if (filtros.desde && r.publicadoEn.slice(0, 10) < filtros.desde) return false;
      if (filtros.hasta && r.publicadoEn.slice(0, 10) > filtros.hasta) return false;
      return true;
    });
  }, [registrosRestaurables, filtros]);

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Respaldos"
        descripcion="Historial de publicaciones con versión anterior archivada: páginas con respaldo disponible para consultar y restaurar."
        acciones={
          <>
            {isRefreshing && (
              <span className="text-xs font-medium text-brand-interactive animate-pulse">
                Actualizando respaldos…
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setAperturaDepurar((n) => n + 1);
                setModalDepurarAbierto(true);
              }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-[16px] px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 dark:active:bg-red-950/60"
            >
              <IconoMascara nombre="trash" tamano="h-5 w-5" />
              Depurar
            </button>
          </>
        }
      />

      {!isLoading && registrosRestaurables.length > 0 && (
        <BarraFiltros activos={Object.values(filtros).filter(Boolean).length}>
          {/* «Página» y no «Ámbito», como en «Páginas en revisión» (pedido del usuario,
              2026-10-12): el ámbito va en la columna Página. Por dentro sigue filtrando `ambito`. */}
          <CampoFiltro etiqueta="Página">
            <CustomSelect
              ariaLabel="Página"
              value={filtros.ambito}
              onChange={(valor) => cambiarFiltro('ambito', valor)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sitio', label: 'Sitio web' },
                { value: 'intranet', label: 'Intranet' },
              ]}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Autor">
            <CustomSelect
              ariaLabel="Autor"
              value={filtros.editor}
              onChange={(valor) => cambiarFiltro('editor', valor)}
              options={[{ value: '', label: 'Todos' }, ...editores.map((n) => ({ value: n, label: n }))]}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Publicado por">
            <CustomSelect
              ariaLabel="Publicado por"
              value={filtros.publicador}
              onChange={(valor) => cambiarFiltro('publicador', valor)}
              options={[{ value: '', label: 'Todos' }, ...publicadores.map((n) => ({ value: n, label: n }))]}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Publicado desde">
            <DatePicker
              ariaLabel="Publicado desde"
              value={filtros.desde}
              max={filtros.hasta || undefined}
              onChange={(valor) => cambiarFiltro('desde', valor)}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Publicado hasta">
            <DatePicker
              ariaLabel="Publicado hasta"
              value={filtros.hasta}
              min={filtros.desde || undefined}
              onChange={(valor) => cambiarFiltro('hasta', valor)}
            />
          </CampoFiltro>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VACIOS)}
              className="h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]"
            >
              Limpiar filtros
            </button>
          )}
        </BarraFiltros>
      )}

      {error && !registros.length ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading ? (
        <CargandoSeccion label="Cargando respaldos..." />
      ) : registrosRestaurables.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay páginas con versiones anteriores disponibles para restaurar.</p>
      ) : registrosFiltrados.length === 0 ? (
        <p className="text-sm text-zinc-500">Ningún registro coincide con los filtros aplicados.</p>
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30 transition-opacity ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          {/* En el móvil y la tablet, acordeón, como «Páginas en revisión» y «Auditoría»:
              cada publicación es una frase («Carlos Ruiz publicó la versión 43 de /inicio») y
              al tocarla se completa con el ámbito, las fechas y quién la editó, y debajo
              sale «Ver versión 42». Piezas en `fila-acordeon.tsx`; reglas en globals.css
              (`olo-tabla-acordeon`). */}
          <table className="olo-tabla-apilable olo-tabla-acordeon w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-medium">Página</th>
                <th scope="col" className="px-4 py-3.5 font-medium">Autor</th>
                <th scope="col" className="px-4 py-3.5 font-medium">Publicado por</th>
                <th scope="col" className="px-4 py-3.5 font-medium">Editado el</th>
                <th scope="col" className="px-4 py-3.5 font-medium">Publicado el</th>
                <th scope="col" className="px-4 py-3.5 text-center font-medium">Versión anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {registrosFiltrados.map((registro) => {
                const abierta = estaAbierta(registro.id);
                return (
                <tr key={registro.id} data-abierta={abierta || undefined} className="bg-white dark:bg-[#0f1626]">
                  {/* Solo en acordeón: la frase. Plegada, quién publicó qué versión de qué
                      sección; desplegada, una sola frase con el ámbito, la fecha y quién la
                      editó: «… de la sección /inicio del sitio web el 10 de octubre de 2026
                      a las 9:00 a. m., editada por Ana Gómez el 9 de octubre…». */}
                  <td data-resumen>
                    <ResumenDeFila abierta={abierta} onAlternar={() => alternar(registro.id)}>
                      <span className={RESALTE_DE_FILA}>{registro.publicadoPor.nombre}</span> publicó la versión{' '}
                      {registro.numeroVersion} de{' '}
                      {abierta ? (
                        <>
                          la sección <span className={RESALTE_DE_FILA}>{rutaPublicaDeSlug(registro.slug)}</span>
                          {registro.ambito && (
                            <>
                              {registro.ambito === 'intranet' ? ' de la ' : ' del '}
                              <span className={RESALTE_DE_FILA}>{registro.ambito === 'intranet' ? 'intranet' : 'sitio web'}</span>
                            </>
                          )}{' '}
                          el <span className={RESALTE_DE_FILA}>{fechaDeFila(registro.publicadoEn)}</span>, editada por{' '}
                          <span className={RESALTE_DE_FILA}>{registro.editadoPor.nombre}</span> el{' '}
                          <span className={RESALTE_DE_FILA}>{fechaDeFila(registro.editadoEn)}</span>
                        </>
                      ) : (
                        <span className={RESALTE_DE_FILA}>{rutaPublicaDeSlug(registro.slug)}</span>
                      )}
                    </ResumenDeFila>
                  </td>
                  {/* Solo en acordeón y desplegada: la versión anterior con su nombre (el ojo
                      solo no se entiende en una pantalla táctil), del color de «Ver detalle». */}
                  <td data-detalle>
                    <div className="mb-1">
                      <BotonDeFila color={COLOR_DE_ACCION['ver-detalle']} onClick={() => setSeleccionado(registro)}>
                        <IconoMascara nombre="eye-closed" tamano="h-6 w-6" />
                        Ver versión {registro.versionAnteriorNumero}
                      </BotonDeFila>
                    </div>
                  </td>
                  <td data-solo-tabla className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {/* En dos líneas (pedido del usuario, 2026-10-12): arriba dónde (el ámbito)
                        y debajo qué página o sección con la versión, sin la barra y más fino
                        desde el 2026-10-15: «Sitio web» / «inicio · versión 43». */}
                    <CeldaDePagina ambito={registro.ambito} slug={registro.slug} version={registro.numeroVersion} />
                  </td>
                  <td data-solo-tabla data-etiqueta="Autor" className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{registro.editadoPor.nombre}</td>
                  <td data-solo-tabla data-etiqueta="Publicado por" className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{registro.publicadoPor.nombre}</td>
                  <td data-solo-tabla data-etiqueta="Editado el" className="whitespace-nowrap px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    <FechaDeCelda iso={registro.editadoEn} />
                  </td>
                  <td data-solo-tabla data-etiqueta="Publicado el" className="whitespace-nowrap px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    <FechaDeCelda iso={registro.publicadoEn} />
                  </td>
                  <td data-solo-tabla data-etiqueta="Versión anterior" className="px-4 py-2 text-center">
                    {/* Como el ojo de Auditoría: verde #7DB728; el tooltip, del color de «Ver detalle». */}
                    <BotonOjo
                      etiqueta="Ver versión"
                      onClick={() => setSeleccionado(registro)}
                      className="rounded-lg p-1.5 text-[#7DB728] transition-colors hover:bg-[#7DB728]/10"
                      claseTooltip={COLOR_DE_ACCION['ver-detalle']}
                    />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/*
        `key` por versión seleccionada: cada respaldo estrena modal, así el error o el
        éxito de la restauración anterior no se ve un instante al abrir el siguiente.
        Con `'cerrado'` al no haber selección se evita además arrastrar ese estado
        entre una apertura y la siguiente.
      */}
      <VistaPreviaVersion
        key={seleccionado?.id ?? 'cerrado'}
        registro={seleccionado}
        onCerrar={() => setSeleccionado(null)}
        onRestaurado={recargar}
      />

      <ModalDepurarVersiones
        key={aperturaDepurar}
        abierto={modalDepurarAbierto}
        registros={registros}
        onCerrar={() => setModalDepurarAbierto(false)}
        onExito={() => {
          setModalDepurarAbierto(false);
          recargar();
        }}
      />
    </div>
  );
}
