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
      <section className="w-full max-w-full relative overflow-hidden ">
        <div className="bannerOficialMatriz">
          <h1>Matriz <br /> <strong>de Pertinencia</strong></h1>
          <img
          src="/assets/img/BannerOficial.png"
          alt="Matriz de Pertinencia Banner"
          style={{ width: '350px', maxWidth: '100vw', height: 'auto', objectFit: 'cover'}}
          />
        </div>
      </section>

      {/* Qué es */}
      <div className="matriz-section-gray">
        <div className="matriz-content-container text-center">
          <h2 className="matriz-section-title">¿Qué es?</h2>
          <div className="matriz-section-intro">
            La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite a<br className="hidden md:block" />
            través de sus 5 variables :
          </div>

          <div className="matriz-section-list">
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

      {/* Dashboard OLO - Vinculación */}
      <div className="matriz-section-gray">
        <div className="matriz-content-container-wide">
          <h2 className="matriz-section-title text-center">Dashboard OLO - Vinculación</h2>
          <div className="matriz-section-intro text-center mb-10">
            Resultados de vinculación laboral formal (titulada), con una periodicidad semestral.<br className="hidden md:block" />
            Genera un indicador de vinculación donde se relaciona el número de vinculados<br className="hidden md:block" />
            laboralmente en el mercado formal y el total de egresados, para un grupo de<br className="hidden md:block" />
            seguimiento particular.
          </div>

          <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden flex justify-center">
            <iframe
              title="Dashboard Vinculación OLO"
              width="1303"
              height="816"
              src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection14c82e0795ad03436073"
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-[600px] md:h-[816px] max-w-full"
            ></iframe>
          </div>
        </div>
      </div>

      {/* @ts-ignore - Bypass strict typing for static use case */}
      <IntranetFooter block={{ id: 'static-footer' }} />
    </div>
  );
}
