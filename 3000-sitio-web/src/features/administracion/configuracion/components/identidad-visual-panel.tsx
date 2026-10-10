'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, ArrowUturnLeftIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/ui/atoms/button';
import { Switch } from '@/shared/ui/atoms/switch';
import { Notification, type NotificationType } from '@/shared/ui/molecules/notification';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import {
  iconoDelPanel,
  iconoEnBlancoEnOscuro,
  logoDelPanel,
  logoEnBlancoEnOscuro,
  type IdentidadPanel,
} from '@/shared/lib/identidad-panel';
import {
  guardarBlancoEnModoOscuro,
  restablecerImagenDeIdentidad,
  subirImagenDeIdentidad,
  type PiezaDeIdentidad,
} from '../services/identidad-panel.service';
import { ColoresDeAcciones } from './colores-de-acciones';

const KB = 1024;

/**
 * Lo que acepta la API (`identidad-panel.usecase.ts`), repetido aquí solo para avisar
 * antes de subir: quien decide es la API.
 */
const PIEZAS: Record<
  PiezaDeIdentidad,
  { titulo: string; dondeAparece: string; recomendacion: string; limiteBytes: number }
> = {
  logo: {
    titulo: 'Logo',
    dondeAparece: 'Arriba de la barra lateral del panel.',
    recomendacion: 'PNG o JPG de hasta 1 MB, horizontal y mejor con fondo transparente.',
    limiteBytes: 1024 * KB,
  },
  icono: {
    titulo: 'Icono',
    dondeAparece: 'En la pestaña del navegador y en el centro de la barra del móvil.',
    recomendacion: 'PNG o JPG cuadrado de hasta 512 KB, de al menos 64 × 64 px.',
    limiteBytes: 512 * KB,
  },
};

const TIPOS_ACEPTADOS = ['image/png', 'image/jpeg'];

type Aviso = { type: NotificationType; title: string; message?: string };

/**
 * Configuración → Identidad visual del panel: el logo, el icono y el color de las
 * etiquetas de las acciones. Lo que se guarda aquí lo ven todas las personas del panel.
 *
 * Tras cada guardado, `router.refresh()`: el layout del panel (`app/admin/layout.tsx`)
 * vuelve a leer la identidad y la barra lateral, el favicon y los colores cambian sin
 * recargar la página.
 */
export function IdentidadVisualPanel({
  identidadInicial,
  puedeEditar,
}: {
  identidadInicial: IdentidadPanel;
  /** `configuracion.identidad`. Sin él se ve todo, pero nada se puede cambiar. */
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [identidad, setIdentidad] = useState(identidadInicial);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [guardandoModoOscuro, setGuardandoModoOscuro] = useState(false);

  const aplicar = (nueva: IdentidadPanel, titulo: string) => {
    setIdentidad(nueva);
    setAviso({ type: 'success', title: titulo });
    router.refresh();
  };

  const avisarError = (error: unknown, porDefecto: string) =>
    setAviso({ type: 'error', title: 'No se pudo guardar', message: mensajeDeErrorApi(error, porDefecto) });

  const subir = async (pieza: PiezaDeIdentidad, archivo: File) => {
    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      setAviso({ type: 'warning', title: 'Formato no admitido', message: 'Sube una imagen PNG o JPG.' });
      return;
    }
    if (archivo.size > PIEZAS[pieza].limiteBytes) {
      setAviso({
        type: 'warning',
        title: 'La imagen pesa demasiado',
        message: `El ${PIEZAS[pieza].titulo.toLowerCase()} puede pesar hasta ${PIEZAS[pieza].limiteBytes / KB} KB.`,
      });
      return;
    }
    try {
      aplicar(await subirImagenDeIdentidad(pieza, archivo), `${PIEZAS[pieza].titulo} actualizado`);
    } catch (error) {
      avisarError(error, `No se pudo subir el ${PIEZAS[pieza].titulo.toLowerCase()}.`);
    }
  };

  const restablecer = async (pieza: PiezaDeIdentidad) => {
    try {
      aplicar(await restablecerImagenDeIdentidad(pieza), `${PIEZAS[pieza].titulo} de fábrica restablecido`);
    } catch (error) {
      avisarError(error, `No se pudo restablecer el ${PIEZAS[pieza].titulo.toLowerCase()}.`);
    }
  };

  const cambiarModoOscuro = async (valor: boolean) => {
    setGuardandoModoOscuro(true);
    try {
      aplicar(await guardarBlancoEnModoOscuro(valor), 'Modo oscuro actualizado');
    } catch (error) {
      avisarError(error, 'No se pudo cambiar el modo oscuro.');
    } finally {
      setGuardandoModoOscuro(false);
    }
  };

  const haySubidas = Boolean(identidad.logo || identidad.icono);

  return (
    <section
      aria-labelledby="titulo-identidad-visual"
      className="@container rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-[#7db828]/30 dark:bg-[#131b2f]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <SwatchIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gray-500 dark:text-[#94a3b8]" />
        <div className="min-w-0">
          <h2 id="titulo-identidad-visual" className="font-bold text-[#001631] dark:text-[#f6f6f6]">
            Identidad visual del panel
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">
            El logo, el icono y el color de las etiquetas de las acciones. Lo que cambies aquí lo
            ven todas las personas que usan el panel.
          </p>
          {!puedeEditar && (
            <p className="mt-2 text-sm font-medium text-[#001631] dark:text-[#f6f6f6]">
              Solo puede cambiarla quien tenga el permiso «Identidad visual del panel».
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 @xl:grid-cols-2">
        <PiezaDeIdentidad
          pieza="logo"
          src={logoDelPanel(identidad)}
          enBlancoEnOscuro={logoEnBlancoEnOscuro(identidad)}
          personalizada={Boolean(identidad.logo)}
          puedeEditar={puedeEditar}
          onSubir={(archivo) => subir('logo', archivo)}
          onRestablecer={() => restablecer('logo')}
        />
        <PiezaDeIdentidad
          pieza="icono"
          src={iconoDelPanel(identidad)}
          enBlancoEnOscuro={iconoEnBlancoEnOscuro(identidad)}
          personalizada={Boolean(identidad.icono)}
          puedeEditar={puedeEditar}
          onSubir={(archivo) => subir('icono', archivo)}
          onRestablecer={() => restablecer('icono')}
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4 dark:border-[#2d3649]">
        <div className="min-w-0">
          <p id="etiqueta-blanco-oscuro" className="text-sm font-semibold text-[#001631] dark:text-[#f6f6f6]">
            Pasar a blanco en modo oscuro
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">
            Para un logo o un icono subidos que sean oscuros y con fondo transparente. Si tienen
            fondo propio, apágalo o saldrán como un bloque blanco. Los de fábrica siempre pasan a
            blanco.
            {!haySubidas && ' Ahora no hay ninguno subido.'}
          </p>
        </div>
        <Switch
          checked={identidad.blancoEnModoOscuro}
          onChange={cambiarModoOscuro}
          disabled={!puedeEditar || guardandoModoOscuro}
          aria-label="Pasar a blanco en modo oscuro el logo y el icono subidos"
        />
      </div>

      <ColoresDeAcciones
        identidad={identidad}
        puedeEditar={puedeEditar}
        onGuardado={(nueva) => aplicar(nueva, 'Colores guardados')}
        onError={(error) => avisarError(error, 'No se pudieron guardar los colores.')}
      />

      {aviso && (
        <Notification type={aviso.type} title={aviso.title} message={aviso.message} onClose={() => setAviso(null)} />
      )}
    </section>
  );
}

/**
 * Una de las dos imágenes: cómo se ve en modo claro y en oscuro, y los botones para
 * cambiarla. La subida empieza al elegir el archivo, sin un «Guardar» aparte.
 */
function PiezaDeIdentidad({
  pieza,
  src,
  enBlancoEnOscuro,
  personalizada,
  puedeEditar,
  onSubir,
  onRestablecer,
}: {
  pieza: PiezaDeIdentidad;
  src: string;
  enBlancoEnOscuro: boolean;
  personalizada: boolean;
  puedeEditar: boolean;
  onSubir: (archivo: File) => Promise<void>;
  onRestablecer: () => Promise<void>;
}) {
  const { titulo, dondeAparece, recomendacion } = PIEZAS[pieza];
  const entrada = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState<'subiendo' | 'restableciendo' | null>(null);
  const idTitulo = `titulo-pieza-${pieza}`;

  const conEspera = async (estado: 'subiendo' | 'restableciendo', accion: () => Promise<void>) => {
    setOcupado(estado);
    try {
      await accion();
    } finally {
      setOcupado(null);
    }
  };

  // El logo, a lo ancho; el icono, cuadrado como en la barra del móvil.
  const claseImagen = pieza === 'logo' ? 'max-h-12 max-w-full object-contain' : 'size-12 object-contain';

  return (
    <div role="group" aria-labelledby={idTitulo} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-[#2d3649]">
      <div>
        <h3 id={idTitulo} className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#001631] dark:text-[#f6f6f6]">
          {titulo}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-[#252f47] dark:text-[#b7c0d6]">
            {personalizada ? 'Personalizado' : 'De fábrica'}
          </span>
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">{dondeAparece}</p>
      </div>

      {/* Las dos vistas a la vez, con el filtro que aplicará el panel: así se ve si el modo
          oscuro le sienta bien antes de que nadie lo descubra en su pantalla. */}
      <div className="grid grid-cols-2 gap-2">
        <figure className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- vista previa de una imagen de /public o subida: next/image no aporta nada. */}
          <img src={src} alt={`${titulo} actual en modo claro`} className={claseImagen} />
          <figcaption className="text-xs text-zinc-600">Modo claro</figcaption>
        </figure>
        <figure className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-[#2d3649] bg-[#131b2f] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- ver arriba. */}
          <img
            src={src}
            alt={`${titulo} actual en modo oscuro`}
            className={`${claseImagen} ${enBlancoEnOscuro ? 'brightness-0 invert' : ''}`}
          />
          <figcaption className="text-xs text-[#b7c0d6]">Modo oscuro</figcaption>
        </figure>
      </div>

      <p className="text-xs text-gray-500 dark:text-[#94a3b8]">{recomendacion}</p>

      {puedeEditar && (
        <div className="flex flex-wrap gap-2">
          <input
            ref={entrada}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(evento) => {
              const archivo = evento.target.files?.[0];
              // Se vacía para que elegir el mismo archivo otra vez vuelva a disparar `change`.
              evento.target.value = '';
              if (archivo) void conEspera('subiendo', () => onSubir(archivo));
            }}
          />
          <Button
            type="button"
            className="min-h-11 gap-2"
            disabled={ocupado !== null}
            onClick={() => entrada.current?.click()}
          >
            <ArrowUpTrayIcon aria-hidden="true" className="size-4" />
            {ocupado === 'subiendo' ? 'Subiendo…' : `Subir ${titulo.toLowerCase()}`}
          </Button>
          {personalizada && (
            <Button
              type="button"
              plain
              className="min-h-11 gap-2"
              disabled={ocupado !== null}
              onClick={() => void conEspera('restableciendo', onRestablecer)}
            >
              <ArrowUturnLeftIcon aria-hidden="true" className="size-4" />
              {ocupado === 'restableciendo' ? 'Restableciendo…' : 'Volver al de fábrica'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
