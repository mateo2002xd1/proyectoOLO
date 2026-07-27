import React from 'react';
import { Carousel } from '@/shared/ui/organisms/Carousel';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';

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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden">
      <IntranetTopbarWrapper />

      {/* Banner */}
      <section className="tasa-banner-wrapper">
        <div className="tasa-banner-content">
          <h1 className="tasa-banner-title">
            Tasa de<br /> <strong>Vinculación y Empleabilidad</strong>
          </h1>
          <img
            src="/assets/img/BannerTasa.png"
            alt="Matriz de Pertinencia Banner"
            className="tasa-banner-image"
          />
        </div>
      </section>

      {/* Qué es */}
      <div className="matriz-section-gray pt-12 md:pt-20 pb-8">
        <div className="matriz-content-container text-left">
          <h2 className="matriz-section-title !text-left mb-8">¿Qué es?</h2>
          <div className="matriz-section-intro !text-left">
            La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite<br className="hidden md:block" />
            a través de sus 5 variables :
          </div>

          <div className="matriz-section-list !text-left">
            <p><strong>i.</strong> vinculación laboral.</p>
            <p><strong>ii.</strong> tendencia de las ocupaciones.</p>
            <p><strong>iii.</strong> demanda social de los programas de oferta titulada.</p>
            <p><strong>iv.</strong> sector estratégico de los programas de formación</p>
            <p><strong>v.</strong> contrato de aprendizaje; comprender que tan bien se ajustan los programas<br className="hidden md:block" />
              ofrecidos por los centros de formación a la realidad del mercado laboral<br className="hidden md:block" />
              colombiano.</p>
          </div>
        </div>
      </div>

      {/* Sabías que (Imagen) */}
      <div className="matriz-section-white">
        <div className="matriz-sabias-que">
          <img
            src="/assets/img/Sabiasque.png"
            alt="Sabías que... La Matriz ofrece información desde 2011"
            className="w-full h-auto object-contain rounded-2xl shadow-sm"

          />
        </div>
      </div>

      {/* Carousel Section */}
      <div className="matriz-section-white">
        <div className="matriz-content-container-wide max-w-[1200px]">
          <Carousel images={carouselImages} />
        </div>
      </div>

      {/* Video Section */}
      <div className="matriz-section-white py-12">
        <div className="w-full max-w-[650px] mx-auto text-left px-4">
          <h2 className="text-[#1C2A48] text-2xl md:text-[34px] font-medium mb-4 leading-snug">
            ¿Ya sabes como acceder a la matriz de pertinencia en «CompromISO»?
          </h2>
          <p className="text-[#1C2A48] text-[20px]" style={{ marginTop: "10px", marginBottom: "25px" }}>
            Mira nuestro video
          </p>
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/4E7Sci4DAVQ"
              title="Video Matriz de Pertinencia"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Dashboard OLO - Matriz */}
      <div className="matriz-section-gray w-full flex justify-center py-10">
        <div className="w-full max-w-[1303px] px-4 md:px-6 flex flex-col items-start">
          <h2 className="text-[#0A1B3F] text-[32px] font-bold text-left mb-4" style={{ marginTop: "8rem", marginBottom: "4rem" }}>Dashboard OLO - Matriz</h2>
          <div className="text-[#0A1B3F] text-lg text-left mb-16 md:mb-20 max-w-[900px]" style={{ marginBottom: "4rem" }}>
            Resultados de vinculación laboral formal (titulada), con una periodicidad semestral.<br className="hidden md:block" />
            Genera un indicador de vinculación donde se relaciona el número de vinculados<br className="hidden md:block" />
            laboralmente en el mercado formal y el total de egresados, para un grupo de<br className="hidden md:block" />
            seguimiento particular.
          </div>

          <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden flex justify-center">
            <iframe
              title="Dashboard Vinculación OLO"
              width="100%"
              height="816"
              src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection14c82e0795ad03436073"
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-[600px] md:h-[816px] max-w-full"
            ></iframe>
          </div>
        </div>
      </div>


      {/* Descargas & Presentation */}
      <div className="matriz-section-white py-16">
        <div className="w-full max-w-[1303px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start">
            {/* Left Column: Descargas */}
            <div className="w-full md:w-1/3 mb-8 md:mb-0 md:pr-12">
              <h3 className="text-[#0A1B3F] text-[28px] font-bold mb-6">Descargas</h3>
              <ul className="list-disc pl-6 text-[#1C2A48] text-lg md:text-xl space-y-2 marker:text-[#0A1B3F]">
                <li><a href="#" className="hover:underline transition-colors">Matriz de pertinencia 2025</a></li>
                <li><a href="#" className="hover:underline transition-colors">Matriz de pertinencia 2024</a></li>
              </ul>
            </div>

            {/* Right Column: Presentation Viewer */}
            <div className="w-full md:w-2/3">
              <div className="w-full max-w-[850px] aspect-[1037/617] rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <iframe
                  src="/uploads/documents/"
                  title="Presentación Matriz de Pertinencia"
                  className="w-full h-full"
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <IntranetFooter block={{ id: 'static-footer', type: 'IntranetFooter' }} />
    </div>
  );
}
