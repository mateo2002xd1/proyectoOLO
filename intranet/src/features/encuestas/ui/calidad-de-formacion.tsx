"use client";

import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { PptxViewer } from '@/features/tasa/ui/PptxViewer';
import Image from 'next/image';

export function CalidadFormacionView() {
  return (
    <main className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <IntranetTopbarWrapper />

      {/* Hero Section */}
      <IntranetHero
        imageSrc="/assets/img/banner-encuesta.png"
        imageAlt="Banner Encuesta Calidad de la Formación"
      />

      {/* Main Content Section */}
      <section className="px-4 md:px-12 flex justify-center bg-[#f4f5f7]" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-7xl w-full">
          <h2 className="tasa-concept-title">
            ¿Cuál es el <strong>objetivo</strong>?
          </h2>
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
            {/* Left Column */}
            <div className="flex-1 space-y-10 max-w-3xl">
              <div>

                <p className="tasa-concept-desc">
                  El objetivo principal es <strong>evaluar la percepción de los empresarios sobre la contribución de los aprendices en sus organizaciones.</strong>
                </p>
             
                <h3 className="tasa-concept-title" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>Puntos Específicos:</h3>
               
                <div className="tasa-concept-desc space-y-4">
                  <p>Conocer las perspectivas de los empresarios frente al <strong>rol de los aprendices</strong> en sus labores.</p>
                  <p>Valorar los conocimientos y habilidades <strong>de los aprendices en un contexto laboral real.</strong></p>
                  
                  <p><strong>Ofrecer información</strong> sobre la <strong>pertinencia de la formación</strong> de los aprendices respecto a las demandas del mercado laboral.</p>
                  <p>Evaluar la disposición de los empresarios a <strong>contratar aprendices</strong> una vez finalizado su periodo de formación.</p>
                </div>
              </div>

              <div>
             
                <h3 className="tasa-concept-title" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>¿Qué encontrarás aquí?</h3>
              
                <div className="tasa-concept-desc space-y-4">
                  <p>Una <strong>explicación detallada de la metodología de la encuesta</strong> realizada.</p>
                  <p>Los <strong>principales resultados</strong> presentados de forma concisa y visual en una <strong>presentación.</strong></p>
                  <p>El <strong>conjunto de datos brutos</strong> para que pueda realizar su propia exploración y análisis a profundidad.</p>
                </div>
              </div>
            </div>

            {/* Right Column (Map Image) */}
            <div className="flex-1 w-full flex flex-col items-center lg:items-end">
              <div className="relative w-full max-w-lg h-auto rounded-xl overflow-hidden bg-white shadow-sm">
                <Image 
                  src="/assets/img/Resultado-de-encuesta.png" 
                  alt="Resultado de encuesta - Mapa de disponibilidad a contratar" 
                  width={600} 
                  height={600}
                  className="w-full h-auto object-contain"
                />
              </div>
              <br></br>
              <p className="mt-4 text-[#2e7d32] font-bold text-center lg:text-right w-full max-w-lg pr-4">
                Resultado de encuesta calidad de la Formación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video and Download Section */}
      <section className="tasa-video-wrapper">
        <div className="tasa-video-header">
          <h2 className="tasa-video-title">
            Aquí te contamos todo sobre la <br className="hidden md:block" />
            <span>encuesta de calidad de la formación</span>
          </h2>
        </div>
        <div className="tasa-video-container">
          <iframe
            className="tasa-video-iframe"
            src="https://www.youtube.com/embed/4E7Sci4DAVQ"
            title="Encuesta Calidad de la Formación"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <p className="text-gray-300 text-xl font-medium">Descarga aquí los datos de la encuesta</p>
          <a
            href="/uploads/documents/Encuesta Calidad Formación datos.xlsx"
            download
            className="inline-block transition-colors"
            style={{
              backgroundColor: '#ffffff',
              color: '#001631',
              fontWeight: 'bold',
              padding: '0.6rem 2.5rem',
              borderRadius: '12px',
              fontSize: '1.25rem',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            Descargar
          </a>
        </div>
      </section>

      {/* Web Observatorio Laboral Section */}
      <section className="px-4 md:px-12 flex justify-center bg-[#f4f5f7]" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
          {/* Left Column */}
          <div className="flex-1 w-full md:max-w-xs">
            <h2 className="tasa-concept-title" style={{ fontSize: '1.75rem' }}>
              Página Web Observatorio Laboral
            </h2>
            <br></br>
            <ul className="tasa-concept-desc list-disc pl-6 space-y-2">
              <li>Informes</li>
              <li>Resultados</li>
              <li>Boletines Tendencia</li>
            </ul>
          </div>
          
          {/* Right Column (Presentation) */}
          <div className="tasa-ppt-viewer-wrapper">
            <PptxViewer fileUrl="/uploads/documents/Presentación1.pptx" />
          </div>
        </div>
      </section>

      <IntranetFooter block={{ id: 'footer-calidad-formacion', type: 'IntranetFooter' }} />
    </main>
  );
}
