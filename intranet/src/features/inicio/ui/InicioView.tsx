"use client";

import React, { useState, useEffect } from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { Carousel } from '@/shared/ui/organisms/Carousel';
import { RecursosVisuales } from './RecursosVisuales';

const oloLeCuentaImages = [
  '/assets/img/iniciocar1.png',
  '/assets/img/iniciocar2.png',
  '/assets/img/iniciocar3.png',
  '/assets/img/iniciocar4.png',
];

const datoOloSemanaImages = [
  '/assets/img/poster1.png',
  '/assets/img/poster2.png',
  '/assets/img/poster3.png',
  '/assets/img/poster4.png',
];

const publicacionesData = [
  {
    id: 1,
    title: 'BOLETIN MERCADO LABORAL MAR 2026.pdf',
    image: '/assets/img/poster1.png',
    pdfUrl: '/upload/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 2,
    title: 'Guía de usuario SharePoint OLO.pdf',
    image: '/assets/img/poster2.png',
    pdfUrl: '/upload/Gu%C3%ADa%20de%20usuario%20SharePoint%20OLO.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 3,
    title: 'La mujer en el Mercado Laboral Colombiano II-2025.pdf',
    image: '/assets/img/poster3.png',
    pdfUrl: '/upload/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 4,
    title: 'Economía Popular.pdf',
    image: '/assets/img/poster4.png',
    pdfUrl: '/upload/Econom%C3%ADa%20Popular.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 5,
    title: 'Catálogo de Ocp. Campesina, Familiar y Comunitaria-1.pdf',
    image: '/assets/img/poster1.png',
    pdfUrl: '/upload/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 6,
    title: 'DICCIONARIO OLO.pdf',
    image: '/assets/img/poster2.png',
    pdfUrl: '/upload/DICCIONARIO%20OLO.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 7,
    title: 'VINCULACIÓN VICTIMAS II- SEM.pdf',
    image: '/assets/img/poster3.png',
    pdfUrl: '/upload/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
];

function PublicacionesCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;
  const totalItems = publicacionesData.length;

  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const prevPage = () => {
    setStartIndex((prev) => (prev - itemsPerPage + totalItems * itemsPerPage) % totalItems);
  };

  const nextPage = () => {
    setStartIndex((prev) => (prev + itemsPerPage) % totalItems);
  };

  useEffect(() => {
    if (totalItems <= itemsPerPage) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + itemsPerPage) % totalItems);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalItems]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = dragCurrentX - dragStartX;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        prevPage();
      } else {
        nextPage();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(dragCurrentX - dragStartX) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const currentSlides = [];
  for (let i = 0; i < itemsPerPage; i++) {
    currentSlides.push(publicacionesData[(startIndex + i) % totalItems]);
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto group/carousel flex items-center justify-center px-4 md:px-8">
      <div
        className="publicaciones-container w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="publicaciones-grid animate-fade-in select-none" key={startIndex}>
          {currentSlides.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              draggable={false}
              className="publicaciones-card group pointer-events-auto"
            >
              <div>
                <div className="publicaciones-card-img-wrapper pointer-events-none">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="publicaciones-card-img group-hover:scale-105"
                  />
                </div>
                <h3 className="publicaciones-card-title">
                  {item.title}
                </h3>
                <p className="publicaciones-card-hashtag">
                  {item.hashtag}
                </p>
              </div>

              <div className="publicaciones-card-footer">
                <div className="publicaciones-date-badge">
                  <span className="publicaciones-date-month">
                    {item.month}
                  </span>
                  <span className="publicaciones-date-day">
                    {item.day}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InicioView() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden">
      <IntranetTopbarWrapper />

      <IntranetHero />

      {/* OLO le cuenta (Carousel 1) */}
      <div className="matriz-content-container-datoolo max-w-[1200px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-12 md:py-16">
        {/* h2 a la izquierda */}
        <h2 className="md:w-1/3 px-4 text-center text-3xl md:text-5xl text-[#001631] tracking-tight">
          <strong>OLO</strong>tecuenta
        </h2>
        {/* Carrusel a la derecha */}
        <div className="md:w-2/3">
          <Carousel
            images={oloLeCuentaImages}
            itemsPerPage={1}
            showButtons={false}
            autoplay={true}
            autoplayInterval={4000}
          />
        </div>
      </div>

      {/* #datoOLO (Static Image) */}
      <div className="matriz-section-datoOLO w-full py-12">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">
            #dato<strong>OLO</strong>
          </h2>
          <div className="w-full">
            <img
              src="/assets/img/imginicioegresados.png"
              alt="#datoOLO - Egresados"
              className="w-full max-w-[1000px] mx-auto h-auto rounded-xl shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* #datoOLO de la semana (Carousel 2) */}
      <div className="matriz-section-white px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">#datoOLO de la semana</h2>
          <div className="w-full px-2 md:px-6">
            <Carousel images={datoOloSemanaImages} itemsPerPage={2} />
          </div>
        </div>
      </div>

      {/* Recursos visuales (Youtube Videos) */}
      <div className="matriz-section-gray px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">
            <strong>Recursos</strong> visuales
          </h2>
          <div className="w-full text-left px-2 md:px-6">
            <RecursosVisuales />
          </div>
        </div>
      </div>

      {/* Últimas publicaciones (Custom Cards Carousel) */}
      <div className="matriz-section-white py-12 md:py-16 px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl text-[#001631] font-normal mb-8 text-center w-full">
            <span className="font-extrabold">Ultimas</span> publicaciones
          </h2>
          <PublicacionesCarousel />
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      {/* Preguntas Frecuentes */}
      <div className="preguntas-section">
        <div className="matriz-content-container-wide max-w-[1200px] w-full text-center flex flex-col items-center">
          <h2 className="preguntas-title">
            <span className="preguntas-title-bold">Preguntas</span> Frecuentes
          </h2>
          <div className="preguntas-grid">

            {/* Tarjeta 1 */}
            <div className="preguntas-card">
              <a href="AQUI_VA_LINK_1" target="_blank" rel="noopener noreferrer" className="preguntas-card-link">
                <img src="/assets/img/holderpregunta1.png" alt="Primera Conferencia 2025" className="preguntas-card-img" />
              </a>
              <div className="preguntas-card-content">
                <p className="preguntas-card-text">Ir a respuestas preguntas frecuentes 1ra conferencia OLO</p>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="preguntas-card">
              <a href="AQUI_VA_LINK_2" target="_blank" rel="noopener noreferrer" className="preguntas-card-link">
                <img src="/assets/img/holderpregunta2.png" alt="Segunda Conferencia 2025" className="preguntas-card-img" />
              </a>
              <div className="preguntas-card-content">
                <p className="preguntas-card-text">Ir a respuestas preguntas frecuentes 2da conferencia OLO</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* @ts-ignore - Bypass strict typing for static use case */}
      <IntranetFooter block={{ id: 'static-footer' }} />
    </div>
  );
}
