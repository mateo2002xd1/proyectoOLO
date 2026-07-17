"use client";

import React, { useState } from 'react';

export default function Carousel() {
  const [currentPage, setCurrentPage] = useState(0);

  // Arreglo con las rutas de tus imágenes
  const slides = [
    "/assets/img/Carrusel1.png",
    "/assets/img/Carrusel2.png",
    "/assets/img/Carrusel3.png",
    "/assets/img/Carrusel4.png",
    "/assets/img/Carrusel5.png",
    "/assets/img/Carrusel6.png",
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(slides.length / itemsPerPage);

  const prevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const currentSlides = slides.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  return (
    <div className="matriz-carousel-wrapper">
      {/* Botón Anterior */}
      <button
        onClick={prevPage}
        className="matriz-carousel-btn prev"
        aria-label="Anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Contenedor Flex (Fila estricta) */}
      <div className="matriz-carousel-track">
        {currentSlides.map((src, index) => (
          <div key={index} className="matriz-carousel-slide">
            <img
              src={src}
              alt={`Imagen del carrusel ${index + 1}`}
              className="matriz-carousel-img"
            />
          </div>
        ))}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={nextPage}
        className="matriz-carousel-btn next"
        aria-label="Siguiente"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
