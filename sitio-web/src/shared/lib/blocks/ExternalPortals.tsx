import { resaltar } from './resaltar';

export interface PortalItem {
  id: string;
  label: string;
  description: string;
  href: string;
  gradient: string;
  /** Ilustración de fondo. Se pinta al 60% sobre el degradado. */
  imagen?: string;
}

interface ExternalPortalsProps {
  block: { id: string };
  title?: string;
  subtitle?: string;
  portals?: PortalItem[];
}

const DEFAULT_PORTALS: PortalItem[] = [
  {
    id: 'pqrs',
    label: 'PQRS',
    description:
      '**Registrar tus peticiones, quejas, reclamos y sugerencias**. Tu participación es fundamental para seguir mejorando.',
    href: '#',
    gradient: 'linear-gradient(135deg, #0b4ea2 0%, #0a2f6b 100%)',
    imagen: '/assets/img/pqrs.png',
  },
  {
    id: 'denuncias',
    label: 'Denuncias por corrupción',
    description:
      '**Reportar actos de corrupción** por un canal seguro. Tu identidad será protegida en todo momento.',
    href: '#',
    gradient: 'linear-gradient(135deg, #0d1526 0%, #1a2e50 100%)',
    imagen: '/assets/img/corrupcion.png',
  },
  {
    id: 'transparencia',
    label: 'Transparencia',
    description:
      '**Consultar información pública** y datos abiertos del observatorio, con rendición de cuentas al día.',
    href: '#',
    gradient: 'linear-gradient(135deg, #1478c6 0%, #0d4f8b 100%)',
    imagen: '/assets/img/transparencia.png',
  },
];

/**
 * Los tres canales de atención a la ciudadanía, como tarjetas enlazadas.
 *
 * Cada tarjeta es un único `<a>` que envuelve todo su contenido: se puede pulsar
 * en cualquier punto, no solo sobre un texto o una flecha. Antes llevaba además
 * una flecha decorativa en una esquina, que sugería que *ese* era el botón —
 * quitarla deja claro que la tarjeta entera es el destino.
 *
 * El fondo son dos capas: el degradado, que da el color y garantiza el contraste
 * del texto blanco, y encima la ilustración al 60% de opacidad. La ilustración va
 * como `background-image` en un div propio y no como `<img>` porque es decorativa
 * —lo que dice la tarjeta ya está en el título y la descripción—, así un lector de
 * pantalla la salta en vez de anunciar una imagen sin información (SC 1.1.1).
 */
export function ExternalPortals({
  block,
  title = '**Portales externos** de la ciudadanía',
  subtitle,
  portals = DEFAULT_PORTALS,
}: ExternalPortalsProps) {
  return (
    <section className="olo-portals" id="external-portals" aria-label="Portales externos" data-block-id={block.id}>
      <div className="olo-portals-inner">
        <div className="olo-portals-header">
          {title && <h2 className="olo-portals-title">{resaltar(title)}</h2>}
          {subtitle && <p className="olo-portals-subtitle">{subtitle}</p>}
        </div>

        <div className="olo-portals-grid">
          {portals.map((portal) => (
            <a
              key={portal.id}
              href={portal.href}
              className="olo-portal-card"
              id={`portal-${portal.id}`}
              style={{ background: portal.gradient }}
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
                <span className="olo-portal-description">{resaltar(portal.description)}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
