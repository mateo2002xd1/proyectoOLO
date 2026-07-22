"use client";

import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import Image from 'next/image';

export function CalidadFormacionView() {
  return (
    <main className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <IntranetTopbarWrapper />

      {/* Hero Section */}
      <section className="bg-[#001631] text-white py-10 px-4 md:px-12 flex justify-center items-center overflow-hidden relative">
        {/* Dashed line background */}
        <div className="absolute left-0 right-0 top-1/2 border-t-[3px] border-dashed border-[#007aff] z-0 opacity-80" />
        
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative z-10">
          <div className="relative w-40 h-56 md:w-52 md:h-72 flex-shrink-0">
            <div className="w-full h-full bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/assets/img/Banner-encuesta.png')" }}></div>
          </div>
          <div className="flex flex-col text-center md:text-left bg-[#001631] px-4">
            <h2 className="text-xl md:text-2xl font-light tracking-wider mb-1">Encuesta de</h2>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wide">CALIDAD DE LA FORMACIÓN</h1>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 px-4 md:px-12 flex justify-center bg-[#f4f5f7]">
        <div className="max-w-7xl w-full">
          <h2 className="text-3xl md:text-4xl text-[#002240] mb-4">
            ¿Cuál es el <span className="font-bold">objetivo</span>?
          </h2>
          <p className="text-lg md:text-xl text-[#002240] mb-12 max-w-5xl">
            El objetivo principal es <span className="font-bold">evaluar la percepción de los empresarios sobre la contribución de los aprendices en sus organizaciones.</span>
          </p>

          <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
            {/* Left Column */}
            <div className="flex-1 space-y-10 max-w-3xl">
              <div>
                <h3 className="text-xl font-bold text-[#002240] mb-4">Puntos Específicos:</h3>
                <ol className="space-y-4 text-[#002240] text-lg font-medium list-decimal pl-5">
                  <li className="pl-2">Conocer las perspectivas de los empresarios frente al <span className="font-bold">rol de los aprendices</span> en sus labores.</li>
                  <li className="pl-2">Valorar los conocimientos y habilidades <span className="font-bold">de los aprendices en un contexto laboral real.</span></li>
                  <li className="pl-2"><span className="font-bold">Ofrecer información</span> sobre la <span className="font-bold">pertinencia de la formación</span> de los aprendices respecto a las demandas del mercado laboral.</li>
                  <li className="pl-2">Evaluar la disposición de los empresarios a <span className="font-bold">contratar aprendices</span> una vez finalizado su periodo de formación.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#002240] mb-4 italic">¿Qué encontrarás aquí?</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#002240] text-lg font-medium">
                  <li className="pl-2">Una <span className="font-bold">explicación detallada de la metodología de la encuesta</span> realizada.</li>
                  <li className="pl-2">Los <span className="font-bold">principales resultados</span> presentados de forma concisa y visual en una <span className="font-bold">presentación.</span></li>
                  <li className="pl-2">El <span className="font-bold">conjunto de datos brutos</span> para que pueda realizar su propia exploración y análisis a profundidad.</li>
                </ul>
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
              <p className="mt-4 text-[#2e7d32] font-bold text-center lg:text-right w-full max-w-lg pr-4">
                Resultado de encuesta calidad de la Formación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video and Download Section */}
      <section className="py-16 px-4 md:px-12 flex justify-center bg-gray-50">
        <div className="max-w-4xl w-full flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl text-[#002240] mb-8">
            Aquí te <span className="font-bold">contamos</span> todo sobre la encuesta
          </h2>
          
          <div className="relative w-full max-w-3xl mb-8 rounded-xl overflow-hidden shadow-lg group cursor-pointer flex justify-center">
            <Image 
              src="/assets/img/Video-encuesta.png" 
              alt="Video explicativo de la encuesta" 
              width={800}
              height={450}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-[#002240] border-b-[12px] border-b-transparent ml-2"></div>
              </div>
            </div>
          </div>

          <p className="text-xl text-[#002240] mb-6 font-medium">Descarga aquí los datos de la encuesta</p>
          
          <a 
            href="#" 
            className="inline-block bg-[#002240] text-white font-bold py-3 px-10 rounded-full hover:bg-[#001528] transition-colors shadow-md text-lg"
            onClick={(e) => {
              e.preventDefault();
              alert('Funcionalidad de descarga en desarrollo');
            }}
          >
            Descargar
          </a>
        </div>
      </section>

      {/* @ts-ignore - Bypass strict typing for static use case */}
      <IntranetFooter block={{ id: 'footer-calidad-formacion' }} />
    </main>
  );
}
