import type { ComponentType, ReactNode } from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

interface ServicesProps {
  block: { id: string };
  sectionTitle?: string;
  services?: ServiceItem[];
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'monitoreo',
    title: 'Monitoreo del Mercado',
    description: 'Seguimiento riguroso de fuentes de información laboral nacional',
  },
  {
    id: 'orientacion',
    title: 'Orientación y Formación',
    description: 'Apoyo a la definición de acciones de capacitación, emprendimiento y empleo',
  },
  {
    id: 'alertas',
    title: 'Generación de Alertas',
    description: 'Identificación de proyectos de inversión y alertas regionales y sectoriales',
  },
];

function IconMonitoreo() {
  return (
    <svg width="142" height="126" viewBox="0 0 142 126" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#olo-svc-filter-monitoreo)">
        <path d="M122.76 19.6621H107.864C106.91 19.6623 105.977 19.9432 105.183 20.4694C104.39 20.9955 103.771 21.7432 103.406 22.618C103.041 23.4928 102.945 24.4553 103.131 25.384C103.317 26.3126 103.777 27.1657 104.452 27.8353L109.694 33.0351L92.3847 50.2002C91.4651 51.0721 90.2419 51.5587 88.9698 51.5587C87.6976 51.5587 86.4745 51.0721 85.5548 50.2002L84.7342 49.3815C81.9763 46.7676 78.3086 45.3089 74.4942 45.3089C70.6797 45.3089 67.012 46.7676 64.2541 49.3815L39.6373 73.8005C38.7303 74.7027 38.2218 75.9254 38.2236 77.1996C38.2254 78.4738 38.7374 79.695 39.647 80.5947C40.5565 81.4944 43.1164 81.9066 43.1164 81.9066C43.1164 81.7921 45.5298 84.4152 47.9432 82.0212L72.0773 56.9849C72.9964 56.1119 73.2182 55.687 74.4907 55.687C75.7632 55.687 76.7177 56.1119 77.6368 56.9849L79.3175 58.081C82.0766 60.6927 85.1574 62.869 88.9711 62.869C92.7849 62.869 98.2791 60.6927 101.038 58.081L117.932 41.3229L121.794 45.0148C122.472 45.6734 123.33 46.1194 124.261 46.2973C125.192 46.4751 126.156 46.3768 127.031 46.0146C127.907 45.6525 128.655 45.0425 129.183 44.261C129.711 43.4794 129.995 42.5609 130 41.6201V26.8442C130 24.9394 129.237 23.1126 127.879 21.7657C126.522 20.4188 124.68 19.6621 122.76 19.6621Z" fill="#7DB728"/>
        <path d="M125.182 105.847H38.4894C34.6574 105.847 30.9823 104.325 28.2726 101.616C25.5629 98.9074 24.0406 95.2333 24.0406 91.4023V4.84921C24.0406 3.57221 24.0406 5.35959 24.0406 2.44174C24.0406 -0.476099 20.5017 0.0342812 19.2244 0.0342812C16.8163 0.0342812 16.8163 0.0342813 14.4081 0.0349871C12 0.0342813 12 2.44174 12 4.84921V91.4023C12.0076 97.785 14.7099 106.149 19.2244 110.662C23.7388 115.175 29.6969 117.992 36.0813 118L125.182 115.477C126.459 115.477 127.684 114.97 128.588 114.067C129.491 113.164 129.998 111.939 129.998 110.662C129.998 109.385 129.491 108.16 128.588 107.257C127.684 106.354 126.459 105.847 125.182 105.847Z" fill="#7DB728"/>
      </g>
      <defs>
        <filter id="olo-svc-filter-monitoreo" x="8" y="0" width="126" height="126" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}

function IconOrientacion() {
  return (
    <svg width="146" height="146" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#olo-svc-filter-orientacion-a)">
        <path d="M73 0C34.9488 0 4 30.9488 4 69C4 107.051 34.9488 138 73 138C111.051 138 142 107.051 142 69C142 30.9488 111.051 0 73 0ZM73 128.8C40.0272 128.8 13.2 101.973 13.2 69C13.2 36.0272 40.0272 9.2 73 9.2C105.973 9.2 132.8 36.0272 132.8 69C132.8 101.973 105.973 128.8 73 128.8Z" fill="#737373"/>
      </g>
      <g filter="url(#olo-svc-filter-orientacion-b)">
        <path d="M32.9544 105.394C32.2431 107.054 33.9211 108.732 35.5805 108.02L88.0527 85.5299C88.5247 85.3276 88.9008 84.9515 89.1031 84.4795L111.594 32.0073C112.305 30.3478 110.627 28.6698 108.967 29.3811L56.4952 51.8716C56.0232 52.0739 55.6471 52.45 55.4448 52.922L32.9544 105.394ZM59.6563 66.4663C60.2137 65.1658 61.9083 64.8395 62.9088 65.84L75.1439 78.0751C76.1444 79.0756 75.8181 80.7702 74.5176 81.3276L53.1061 90.5039C51.4467 91.2151 49.7688 89.5372 50.48 87.8778L59.6563 66.4663ZM86.5629 72.3422C86.0722 73.7251 84.3089 74.1263 83.2682 73.092L69.4974 59.4063C68.4733 58.3886 68.832 56.6543 70.1757 56.1263L91.8209 47.6205C93.4172 46.9932 95.0108 48.5344 94.4372 50.1508L86.5629 72.3422Z" fill="#737373"/>
      </g>
      <defs>
        <filter id="olo-svc-filter-orientacion-a" x="0" y="0" width="146" height="146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
        <filter id="olo-svc-filter-orientacion-b" x="28.7866" y="29.2129" width="86.9746" height="86.9756" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}

function IconAlertas() {
  return (
    <svg width="150" height="127" viewBox="0 0 150 127" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#olo-svc-filter-alertas)">
        <path d="M75 1.27832C99.4717 1.27832 119.453 20.5143 120.294 44.9257L120.319 46.4366V71.1052L128.658 90.1078C129.075 91.0585 129.291 92.0851 129.291 93.1232C129.291 97.2796 125.909 100.65 121.737 100.65L93.1277 100.659C93.1277 110.634 85.0119 118.722 75 118.722C65.3458 118.722 57.4545 111.202 56.9031 101.72L56.8696 100.645L28.3204 100.65C27.2852 100.65 26.2609 100.437 25.3112 100.026C21.4851 98.37 19.7306 93.9372 21.3926 90.1247L29.6809 71.1106V46.436C29.6845 21.4196 49.936 1.27832 75 1.27832ZM84.0608 100.645L65.9362 100.659C65.9362 105.646 69.9943 109.69 75 109.69C79.7114 109.69 83.5828 106.108 84.0221 101.528L84.0608 100.645ZM75 10.31C54.9378 10.31 38.7476 26.412 38.7447 46.4366V72.9874L30.6236 91.6179H119.428L111.255 72.9934L111.256 46.5141L111.234 45.1581C110.562 25.689 94.5875 10.31 75 10.31ZM129.383 38.933H141.468C143.971 38.933 146 40.9548 146 43.4488C146 45.7351 144.295 47.6244 142.083 47.9234L141.468 47.9647H129.383C126.88 47.9647 124.851 45.9429 124.851 43.4488C124.851 41.1626 126.556 39.2733 128.768 38.9743L129.383 38.933ZM8.53191 38.933H20.617C23.1199 38.933 25.1489 40.9548 25.1489 43.4488C25.1489 45.7351 23.444 47.6244 21.232 47.9234L20.617 47.9647H8.53191C6.029 47.9647 4 45.9429 4 43.4488C4 41.1626 5.70493 39.2733 7.91696 38.9743L8.53191 38.933ZM139.051 4.61269C140.416 6.42655 140.205 8.93073 138.651 10.4953L138.145 10.9349L126.06 19.9665C124.057 21.4629 121.216 21.0586 119.715 19.0634C118.35 17.2495 118.561 14.7453 120.115 13.1807L120.621 12.7412L132.706 3.70952C134.709 2.2131 137.549 2.61748 139.051 4.61269ZM17.2936 3.70952L29.3787 12.7412C31.381 14.2376 31.7869 17.0681 30.2851 19.0634C28.7833 21.0586 25.9427 21.4629 23.9404 19.9665L11.8553 10.9349C9.853 9.43843 9.44718 6.60791 10.9489 4.61269C12.4507 2.61748 15.2913 2.2131 17.2936 3.70952Z" fill="#1FACE3"/>
      </g>
      <defs>
        <filter id="olo-svc-filter-alertas" x="0" y="1.27832" width="150" height="125.443" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}

function IconGenerico() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

const SERVICE_ICONS: Record<string, ComponentType> = {
  monitoreo: IconMonitoreo,
  orientacion: IconOrientacion,
  alertas: IconAlertas,
};

function iconoDelServicio(id: string): ReactNode {
  const Icon = SERVICE_ICONS[id] ?? IconGenerico;
  return <Icon />;
}

/** Envuelve la última palabra del título en cursiva, como en el mockup ("¿Qué *hacemos*?"). */
function tituloConAcento(title: string): ReactNode {
  const trimmed = title.trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) return trimmed;
  return (
    <>
      {trimmed.slice(0, lastSpace)}{' '}
      <em className="olo-services-title-accent">{trimmed.slice(lastSpace + 1)}</em>
    </>
  );
}

export function Services({
  block,
  sectionTitle = '¿Qué hacemos?',
  services = DEFAULT_SERVICES,
}: ServicesProps) {
  return (
    <section className="olo-services" id="services-section" aria-label="Qué hacemos" data-block-id={block.id}>
      <div className="olo-services-inner">
        <h2 className="olo-services-title">{tituloConAcento(sectionTitle)}</h2>

        <div className="olo-services-grid">
          {services.map((service) => (
            <article key={service.id} className="olo-service-card" id={`service-${service.id}`}>
              <div className="olo-service-icon-wrapper" aria-hidden="true">
                {iconoDelServicio(service.id)}
              </div>
              <div className="olo-service-body">
                <h3 className="olo-service-title">{service.title}</h3>
                <p className="olo-service-description">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
