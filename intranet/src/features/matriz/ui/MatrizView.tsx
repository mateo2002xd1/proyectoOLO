import React from 'react';
import { Carousel } from '@/shared/ui/organisms/Carousel';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { PptxViewer } from '@/features/tasa/ui/PptxViewer';

const carouselImages = [
  "/assets/img/Carrusel1.png",
  "/assets/img/Carrusel2.png",
  "/assets/img/Carrusel3.png",
  "/assets/img/Carrusel4.png",
  "/assets/img/Carrusel5.png",
  "/assets/img/Carrusel6.png",
];

export function MatrizView() {
  return (
    <div className="w-full bg-[#F8F9FA] flex flex-col items-center min-h-screen">
      <IntranetTopbarWrapper />

      <main className="w-full flex flex-col items-center flex-1 pb-0">
        {/* Banner */}
        <section className="tasa-banner-wrapper">
          <div className="tasa-banner-content">
            <h1 className="tasa-banner-title">
              Matriz de <br /> <strong>PERTINENCIA</strong>
            </h1>
            <img
              src="/assets/img/BannerOficial.png"
              alt="Matriz de Pertinencia Banner"
              className="tasa-banner-image"
            />
          </div>
        </section>

        {/* Qué es & Sabías que */}
        <section className="tasa-concepts-wrapper">
          <div className="tasa-concept-row">
            <div className="tasa-concept-text">
              <h2 className="tasa-concept-title">
                ¿Qué es?
              </h2>
              <div className="tasa-concept-desc">
                <p className="mb-4">
                  La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite
                  a través de sus 5 variables :
                </p>
                <div className="space-y-2">
                  <p><strong>i.</strong> vinculación laboral.</p>
                  <p><strong>ii.</strong> tendencia de las ocupaciones.</p>
                  <p><strong>iii.</strong> demanda social de los programas de oferta titulada.</p>
                  <p><strong>iv.</strong> sector estratégico de los programas de formación.</p>
                  <p><strong>v.</strong> contrato de aprendizaje; comprender qué tan bien se ajustan los programas ofrecidos por los centros de formación a la realidad del mercado laboral colombiano.</p>
                </div>
              </div>
            </div>
            <div className="tasa-concept-visual">
              <img
                src="/assets/img/Sabiasque.png"
                alt="Sabías que... La Matriz ofrece información desde 2011"
                className="tasa-concept-image"
              />
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="w-full flex justify-center mb-16 px-6 max-w-[1240px]">
          <div className="w-full">
            <Carousel images={carouselImages} />
          </div>
        </section>

        {/* Video Section */}
        <section className="tasa-video-wrapper">
          <div className="tasa-video-header">
            <h2 className="tasa-video-title">
              ¿Ya sabes como acceder a la matriz de pertinencia en <br className="hidden md:block" />
              <span>«CompromISO»?</span>
            </h2>
          </div>
          <div className="tasa-video-container">
            <iframe
              className="tasa-video-iframe"
              src="https://www.youtube.com/embed/4E7Sci4DAVQ"
              title="Video Matriz de Pertinencia"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Dashboard OLO - Matriz */}
        <section className="tasa-dashboards-section">
          <div className="tasa-dashboards-grid">
            <div className="tasa-dashboard-card">
              <div className="tasa-dashboard-header">
                <h2 className="tasa-dashboard-title">
                  Dashboard OLO - Matriz
                </h2>
                <p className="tasa-dashboard-desc">
                  Resultados de vinculación laboral formal (titulada), con una periodicidad semestral.
                  Genera un indicador de vinculación donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.
                </p>
              </div>
              <div className="tasa-dashboard-iframe-wrapper">
                <iframe
                  title="Dashboard Vinculación OLO"
                  src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection14c82e0795ad03436073"
                  allowFullScreen={true}
                  className="tasa-dashboard-iframe"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Descargas & Presentation */}
        <section className="tasa-ppt-section">
          <div className="tasa-ppt-container">
            <div className="tasa-ppt-text">
              <h2 className="tasa-ppt-title" style={{ marginBottom: '1.5rem' }}>
                <strong>Descargas</strong>
              </h2>
              <ul className="list-disc pl-6 text-[#1C2A48] text-lg md:text-xl space-y-2 marker:text-[#0A1B3F]">
                <li><a href="#" className="hover:underline transition-colors">Matriz de pertinencia 2025</a></li>
                <li><a href="#" className="hover:underline transition-colors">Matriz de pertinencia 2024</a></li>
              </ul>
            </div>
            <div className="tasa-ppt-viewer-wrapper">
              <PptxViewer fileUrl="/uploads/documents/Presentación1.pptx" />
            </div>
          </div>
        </section>
      </main>

      <div className="w-full mt-auto">
        <IntranetFooter block={{ id: 'static-footer', type: 'IntranetFooter' }} />
      </div>
    </div>
  );
}
