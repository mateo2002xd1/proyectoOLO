export interface PortalItem {
  id: string;
  label: string;
  description: string;
  href: string;
  gradient: string;
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
    description: 'Peticiones, quejas, reclamos y sugerencias. Tu opinion es importante para mejorar nuestros servicios.',
    href: '#',
    gradient: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
  },
  {
    id: 'denuncias',
    label: 'Denuncias por corrupcion',
    description: 'Canal seguro para reportar actos de corrupcion. Tu identidad sera protegida.',
    href: '#',
    gradient: 'linear-gradient(135deg, #0d1526 0%, #1a2e50 100%)',
  },
  {
    id: 'transparencia',
    label: 'Transparencia',
    description: 'Acceso a informacion publica, rendicion de cuentas y datos abiertos del observatorio.',
    href: '#',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  },
];

export function ExternalPortals({
  block,
  title = 'Portales externos',
  subtitle = 'Accede a los servicios y canales oficiales del gobierno',
  portals = DEFAULT_PORTALS,
}: ExternalPortalsProps) {
  return (
    <section className="olo-portals" id="external-portals" aria-label="Portales externos" data-block-id={block.id}>
      <div className="olo-portals-inner">
        <div className="olo-portals-header">
          <h2 className="olo-portals-title">
            {title}
          </h2>
          <p className="olo-portals-subtitle">
            {subtitle}
          </p>
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
              <svg
                className="olo-portal-image"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <rect width="400" height="300" fill="transparent"/>
                <circle cx="320" cy="60" r="80" fill="rgba(255,255,255,0.04)"/>
                <circle cx="80" cy="240" r="100" fill="rgba(255,255,255,0.03)"/>
                <circle cx="200" cy="150" r="50" fill="rgba(255,255,255,0.05)"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                <line x1="133" y1="0" x2="133" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                <line x1="266" y1="0" x2="266" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </svg>

              <div className="olo-portal-overlay">
                <span className="olo-portal-label">{portal.label}</span>
                <p className="olo-portal-description">{portal.description}</p>
                <span className="olo-portal-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
