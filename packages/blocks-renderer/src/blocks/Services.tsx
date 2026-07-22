import type { ServicesBlock } from '../types';
// Interfaz que define exactamente qué datos requiere cada tarjeta de servicio
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  link: string;
}
// Interfaz que define las propiedades que recibe el componente visual de Puck
interface ServicesProps {
  block: ServicesBlock;
  sectionTitle?: string;  // Propiedad opcional
  services?: ServiceItem[]; // Arreglo del tipo ServiceItem definido arriba
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'platform',
    title: 'Plataforma del Observatorio Laboral y Ocupacional',
    description: 'Accede a datos actualizados del mercado laboral colombiano con herramientas interactivas de analisis y visualizacion.',
    link: 'Explorar plataforma',
  },
  {
    id: 'materials',
    title: 'Materiales y publicaciones',
    description: 'Consulta informes, estudios sectoriales y boletines sobre tendencias del empleo y las ocupaciones en el pais.',
    link: 'Ver publicaciones',
  },
  {
    id: 'knowledge',
    title: 'Generacion de conocimiento',
    description: 'Investigacion aplicada y analisis prospectivo sobre las necesidades del mercado laboral y formacion de capital humano.',
    link: 'Conocer mas',
  },
];

export function Services({
  block,
  sectionTitle = 'Que hacemos?',
  services = DEFAULT_SERVICES,
}: ServicesProps) {
  return (
    <section className="olo-services" id="services-section" aria-label="Servicios del observatorio" data-block-id={block.id}>
      <div className="olo-services-inner">
        <h2 className="olo-services-title">
          {sectionTitle}
        </h2>

        <div className="olo-services-grid">
          {services.map((service) => (
            <article key={service.id} className="olo-service-card" id={`service-${service.id}`}>
              <div className="olo-service-icon-wrapper">
                <span className="olo-service-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {service.id === 'platform' && (
                      <>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                        <polyline points="6 8 10 12 14 9 18 13"/>
                      </>
                    )}
                    {service.id === 'materials' && (
                      <>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        <line x1="8" y1="7" x2="16" y2="7"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                      </>
                    )}
                    {service.id === 'knowledge' && (
                      <>
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </>
                    )}
                    {!['platform', 'materials', 'knowledge'].includes(service.id) && (
                      <>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </>
                    )}
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="olo-service-title">{service.title}</h3>
                <p className="olo-service-description">{service.description}</p>
                <a href="#" className="olo-service-link">
                  {service.link}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
