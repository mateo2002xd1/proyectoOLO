import type { ReactNode } from 'react';
import { TituloRico } from './titulo-rico';

export interface PortalItem {
  id: string;
  label: ReactNode;
  /** Texto enriquecido: llega como nodos desde el campo `richtext` de Puck. */
  description: ReactNode;
  href: string;
  /** Degradado en CSS. Heredado: lo sustituyen `colorInicio` y `colorFin`. */
  gradient?: string;
  colorInicio?: string;
  colorFin?: string;
  /** Ilustración de fondo. Se pinta al 60% sobre el degradado. */
  imagen?: string;
}

interface ExternalPortalsProps {
  block: { id: string };
  /** Campo `richtext` de Puck: llega ya convertido en nodos. */
  title?: ReactNode;
  subtitle?: ReactNode;
  colorTitle?: string;
  colorSubtitle?: string;
  portals?: PortalItem[];
}

/**
 * Fondo de una tarjeta.
 *
 * Los dos colores mandan cuando están puestos; si no, se usa el `gradient` que
 * la tarjeta trajera escrito a mano. Ese respaldo es lo que permite añadir los
 * selectores sin migrar las tarjetas ya guardadas de golpe: las viejas siguen
 * pintándose igual hasta que alguien las abra y elija colores.
 *
 * Se mantiene el mismo ángulo de 135° que usaban todos los degradados escritos
 * a mano, para que las tarjetas nuevas queden alineadas con las existentes.
 */
function fondoDePortal(portal: PortalItem): string | undefined {
  const { colorInicio, colorFin, gradient } = portal;
  if (colorInicio && colorFin) {
    return `linear-gradient(135deg, ${colorInicio} 0%, ${colorFin} 100%)`;
  }
  return gradient;
}

const DEFAULT_PORTALS: PortalItem[] = [
  {
    id: 'pqrs',
    label: 'PQRS',
    description:
      (
        <>
          <strong>Registrar tus peticiones, quejas, reclamos y sugerencias</strong>. Tu
          participación es fundamental para seguir mejorando.
        </>
      ),
    href: '#',
    gradient: 'linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)',
    imagen: '/assets/img/pqrs.png',
  },
  {
    id: 'denuncias',
    label: 'Denuncias por corrupción',
    description:
      (
        <>
          <strong>Reportar actos de corrupción</strong> por un canal seguro. Tu identidad
          será protegida en todo momento.
        </>
      ),
    href: '#',
    gradient: 'linear-gradient(135deg, #0d1526 0%, #1a2e50 100%)',
    imagen: '/assets/img/corrupcion.png',
  },
  {
    id: 'transparencia',
    label: 'Transparencia',
    description:
      (
        <>
          <strong>Consultar información pública</strong> y datos abiertos del observatorio,
          con rendición de cuentas al día.
        </>
      ),
    href: '#',
    gradient: 'linear-gradient(135deg, #1478c6 0%, #0d4f8b 100%)',
    imagen: '/assets/img/transparencia.png',
  },
];

/**
 * Rejilla de portales externos.
 *
 * Cada tarjeta lleva un degradado y una ilustración de fondo opcional. La imagen va
 * como `background-image` en un div propio y no como `<img>` porque es decorativa
 * —lo que dice la tarjeta ya está en el título y la descripción—, así un lector de
 * pantalla la salta en vez de anunciar una imagen sin información (SC 1.1.1).
 */
export function ExternalPortals({
  block,
  title = (
    <>
      <strong>Portales externos</strong> de la ciudadanía
    </>
  ),
  subtitle,
  colorTitle,
  colorSubtitle,
  portals = DEFAULT_PORTALS,
}: ExternalPortalsProps) {
  return (
    <section className="olo-portals" id="external-portals" aria-label="Portales externos" data-block-id={block.id}>
      <div className="olo-portals-inner">
        <div className="olo-portals-header">
          {title && (
            <TituloRico
              className="olo-portals-title"
              style={colorTitle ? { color: colorTitle } : undefined}
            >
              {title}
            </TituloRico>
          )}
          {subtitle && (
            <p
              className="olo-portals-subtitle"
              style={colorSubtitle ? { color: colorSubtitle } : undefined}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="olo-portals-grid">
          {portals.map((portal) => (
            <a
              key={portal.id}
              href={portal.href}
              className="olo-portal-card"
              id={`portal-${portal.id}`}
              style={{ background: fondoDePortal(portal) }}
            >
              {portal.imagen && (
                <span
                  className="olo-portal-bg"
                  style={{ backgroundImage: `url(${portal.imagen})` }}
                  aria-hidden="true"
                />
              )}

              <span className="olo-portal-content">
                <span className="olo-portal-label">{portal.label}</span>
                <div className="olo-portal-description">{portal.description}</div>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
