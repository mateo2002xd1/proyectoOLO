"use client";

import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import Image from 'next/image';

export function SeguimientoLaboralView() {
  return (
    <main className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <IntranetTopbarWrapper />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[#001631] to-[#001A39] flex justify-center py-10 md:py-14 px-6 md:px-12">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Texto */}
          <div className="text-white text-center md:text-left">
            <p className="text-lg md:text-xl font-light tracking-wide mb-1 opacity-90">
              Encuesta de
            </p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-wide">
              SEGUIMIENTO LABORAL
            </h1>
          </div>

          {/* Ilustración */}
          <div className="flex-shrink-0">
            <Image
              src="/assets/img/banner-seguimiento-laboral.png"
              alt="Ilustración Seguimiento Laboral"
              width={260}
              height={200}
              className="object-contain"
              style={{ transform: 'scaleX(-1)' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-4 md:px-12 flex justify-center bg-[#f4f5f7]" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-7xl w-full flex flex-col items-center">
          <div className="w-full max-w-5xl px-4 md:px-8 text-justify">
            <h2 className="text-3xl md:text-4xl text-[#002240]" style={{ marginBottom: '2.5rem' }}>
              ¿Cuál es el <span className="font-bold">objetivo</span>?
            </h2>
            <p className="text-lg md:text-xl text-[#002240] mb-8 text-justify">
              Conocer la transición de nuestros egresados después de su certificación y hacer seguimiento un año después a su proceso de vinculación al mercado laboral
            </p>
<br />
            <h3 className="text-xl md:text-2xl font-bold text-[#002240] mb-4">
              Puntos Específicos:
            </h3>
            <br />
            <ul className="list-none pl-0 text-lg text-[#002240] mb-8 space-y-2 text-justify">
              <li>Conocer las actividades en que se desempeñaron los egresados el último año.</li>
              <li>Entender en que actividades productivas se encuentran laborando los egresados después de su certificación.</li>
              <li>Saber como el aprendizaje impartido por el SENA ha contribuido a su vida e intereses en general.</li>
            </ul>

            <h3 className="text-xl md:text-2xl font-bold text-[#002240] mb-4" style={{ marginTop: '2.5rem' }}>
              ¿Qué encontrarás aquí?
            </h3>
            <br />
            <ul className="list-none pl-0 text-lg text-[#002240] space-y-3 text-justify" style={{ marginBottom: '3.5rem' }}>
              <li>Una <span className="font-bold">explicación detallada de la metodología de la encuesta</span> realizada.</li>
              <li>Los <span className="font-bold">principales resultados</span> presentados de forma concisa y visual en una <span className="font-bold">presentación</span>.</li>
              <li>El <span className="font-bold">conjunto de datos brutos</span> para que pueda realizar su propia exploración y análisis a profundidad.</li>
            </ul>
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
            <h2 className="text-2xl md:text-3xl font-bold text-[#002240] mb-6">
              Portal de aprendizaje
            </h2>
            <br />
            <ul className="list-none pl-0 text-lg text-[#002240] space-y-2 text-justify">
              <li>Orientación a los nuevos empleados.</li>
              <li>Rendimiento y desarrollo.</li>
              <li>Habilidades y aprendizaje.</li>
              <li>Promociones.</li>
              <li>Trabajos internos y referencias.</li>
              <li>Herramientas y métodos.</li>
            </ul>
          </div>

          {/* Right Column (Video) */}
          <div className="flex-1 w-full max-w-2xl relative rounded-xl overflow-hidden shadow-lg bg-black flex justify-center items-center">
            <div className="w-full aspect-video bg-gray-800 flex items-center justify-center relative">
              <Image
                src="/assets/img/Seguimiento-laboral.png"
                alt="Video Portal de Aprendizaje"
                layout="fill"
                objectFit="cover"
                className="z-10 opacity-80"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          </div>
        </div>
      </section>

      <IntranetFooter block={{ id: 'footer-seguimiento-laboral', type: 'IntranetFooter' }} />
    </main>
  );
}
