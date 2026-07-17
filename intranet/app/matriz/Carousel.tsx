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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.9567 12.3541C10.9101 12.3077 10.8732 12.2525 10.848 12.1918C10.8228 12.131 10.8098 12.0659 10.8098 12.0001C10.8098 11.9344 10.8228 11.8692 10.848 11.8085C10.8732 11.7477 10.9101 11.6926 10.9567 11.6461L15.5427 7.06113C15.8241 6.77986 15.9822 6.39834 15.9823 6.00048C15.9824 5.60262 15.8244 5.22102 15.5432 4.93963C15.2619 4.65823 14.8804 4.50009 14.4825 4.5C14.0847 4.49991 13.7031 4.65786 13.4217 4.93913L8.83568 9.52513C8.18045 10.1822 7.8125 11.0722 7.8125 12.0001C7.8125 12.928 8.18045 13.8181 8.83568 14.4751L13.4217 19.0611C13.7031 19.3424 14.0847 19.5003 14.4825 19.5003C14.8804 19.5002 15.2619 19.342 15.5432 19.0606C15.8244 18.7792 15.9824 18.3976 15.9823 17.9998C15.9822 17.6019 15.8241 17.2204 15.5427 16.9391L10.9567 12.3541Z" fill="#001631" />
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.7501 9.52513L11.1641 4.93913C10.8827 4.65786 10.5011 4.49991 10.1033 4.5C9.70543 4.50009 9.3239 4.65823 9.04264 4.93963C8.76138 5.22102 8.60342 5.60262 8.60352 6.00048C8.60361 6.39834 8.76175 6.77986 9.04314 7.06113L13.6291 11.6461C13.6757 11.6926 13.7126 11.7477 13.7378 11.8085C13.7631 11.8692 13.776 11.9344 13.776 12.0001C13.776 12.0659 13.7631 12.131 13.7378 12.1918C13.7126 12.2525 13.6757 12.3077 13.6291 12.3541L9.04314 16.9391C8.76175 17.2204 8.60361 17.6019 8.60352 17.9998C8.60342 18.3976 8.76138 18.7792 9.04264 19.0606C9.3239 19.342 9.70543 19.5002 10.1033 19.5003C10.5011 19.5003 10.8827 19.3424 11.1641 19.0611L15.7501 14.4751C16.4054 13.8181 16.7733 12.928 16.7733 12.0001C16.7733 11.0722 16.4054 10.1822 15.7501 9.52513Z" fill="#001631" />
        </svg>


      </button>
    </div>
  );
}
