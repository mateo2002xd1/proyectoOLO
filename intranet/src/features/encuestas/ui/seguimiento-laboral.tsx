"use client";

import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import Image from 'next/image';
import { PptxViewer } from '@/features/tasa/ui/PptxViewer';

export function SeguimientoLaboralView() {
  return (
    <main className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <IntranetTopbarWrapper />

      {/* Hero Section */}
      <section className="tasa-banner-wrapper">
        <div className="tasa-banner-content">
          <h1 className="tasa-banner-title">
            Encuesta de<br /> <strong>SEGUIMIENTO LABORAL</strong>
          </h1>
          <img
            src="/assets/img/banner-seguimiento-laboral.png"
            alt="Ilustración Seguimiento Laboral"
            className="tasa-banner-image"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-4 md:px-12 flex justify-center bg-[#f4f5f7]" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-7xl w-full flex flex-col items-center">
          <div className="w-full max-w-5xl px-4 md:px-8 text-justify">
            <h2 className="tasa-concept-title mb-4">
              ¿Cuál es el <strong>objetivo</strong>?
            </h2>
            <p className="tasa-concept-desc mb-8">
              Conocer la transición de nuestros egresados después de su certificación y hacer seguimiento un año después a su proceso de vinculación al mercado laboral
            </p>
            <h3 className="tasa-concept-title mb-4" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>
              Puntos Específicos:
            </h3>
            <div className="tasa-concept-desc space-y-4">
              <p>Conocer las actividades en que se desempeñaron los egresados el último año.</p>
              <p>Entender en que actividades productivas se encuentran laborando los egresados después de su certificación.</p>
              <p>Saber como el aprendizaje impartido por el SENA ha contribuido a su vida e intereses en general.</p>
            </div>

            <h3 className="tasa-concept-title mb-4" style={{ fontSize: '1.75rem', marginTop: '2.5rem' }}>
              ¿Qué encontrarás aquí?
            </h3>
            <div className="tasa-concept-desc space-y-4" style={{ marginBottom: '3.5rem' }}>
              <p>Una <span className="font-bold">explicación detallada de la metodología de la encuesta</span> realizada.</p>
              <p>Los <span className="font-bold">principales resultados</span> presentados de forma concisa y visual en una <span className="font-bold">presentación</span>.</p>
              <p>El <span className="font-bold">conjunto de datos brutos</span> para que pueda realizar su propia exploración y análisis a profundidad.</p>
            </div>
          </div>

          {/* First Dashboard Image */}
          <div className="w-full max-w-5xl flex justify-center" style={{ marginTop: '4rem' }}>
            <Image
              src="/assets/img/encuesta-seguimiento.png"
              alt="Resultados Encuesta"
              width={1200}
              height={700}
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Second Dashboard Image Section */}
      <section className="px-4 md:px-12 flex justify-center bg-white" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="w-full max-w-5xl flex justify-center">
          <Image
            src="/assets/img/encuesta-de-seguimiento-laboral-2.png"
            alt="Más Resultados"
            width={1200}
            height={500}
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Portal de Aprendizaje Section */}
      <section className="px-4 md:px-12 flex justify-center bg-[#f4f5f7]" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
          {/* Left Column */}
          <div className="flex-1 w-full md:max-w-md px-4 text-justify">
            <h2 className="tasa-concept-title mb-4" style={{ fontSize: '2rem' }}>
              Portal de aprendizaje
            </h2>
            <div className="tasa-concept-desc space-y-2">
              <p>Orientación a los nuevos empleados.</p>
              <p>Rendimiento y desarrollo.</p>
              <p>Habilidades y aprendizaje.</p>
              <p>Promociones.</p>
              <p>Trabajos internos y referencias.</p>
              <p>Herramientas y métodos.</p>
            </div>
          </div>

          {/* Right Column (Presentation) */}
          <div className="tasa-ppt-viewer-wrapper">
            <PptxViewer fileUrl="/uploads/documents/Presentación1.pptx" />
          </div>
        </div>
      </section>

      <IntranetFooter block={{ id: 'footer-seguimiento-laboral', type: 'IntranetFooter' }} />
    </main>
  );
}
