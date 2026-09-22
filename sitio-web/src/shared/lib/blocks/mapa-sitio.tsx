import { useState, useEffect, type ReactNode } from 'react';
import type { PaginaIndiceBusqueda } from '@/features/paginas/model/pagina.types';
import { obtenerIndiceBusqueda } from '@/features/paginas/publicacion/services/publicacion.service';

export interface MapaSitioProps {
  block?: { id: string };
  titulo?: string;
  mostrarTitulo?: boolean;
  mostrarDescripcion?: boolean;
  descripcion?: string;
  // Estos datos se inyectan dinámicamente mediante resolveData en puck.config.tsx
  paginas?: PaginaIndiceBusqueda[];
}

export const VALORES_MAPA_SITIO_POR_DEFECTO = {
  titulo: 'Mapa del Sitio',
  mostrarTitulo: true,
  mostrarDescripcion: false,
  descripcion: 'Encuentra de forma rápida todas las páginas y secciones públicas de nuestro sitio web.',
};

/**
 * Ordena alfabéticamente una lista de páginas.
 */
function ordenarPaginas(paginas: PaginaIndiceBusqueda[]) {
  return [...paginas].sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
}

export function MapaSitio({
  block,
  titulo = VALORES_MAPA_SITIO_POR_DEFECTO.titulo,
  mostrarTitulo = VALORES_MAPA_SITIO_POR_DEFECTO.mostrarTitulo,
  mostrarDescripcion = VALORES_MAPA_SITIO_POR_DEFECTO.mostrarDescripcion,
  descripcion = VALORES_MAPA_SITIO_POR_DEFECTO.descripcion,
  paginas,
}: MapaSitioProps) {
  const [paginasCargadas, setPaginasCargadas] = useState<PaginaIndiceBusqueda[]>(paginas || []);
  const [cargando, setCargando] = useState(!paginas || paginas.length === 0);

  useEffect(() => {
    let activo = true;
    
    // Si Puck ya inyectó páginas estáticamente o si SSR ya las tiene
    if (paginas && paginas.length > 0) {
      setPaginasCargadas(paginas);
      setCargando(false);
      return;
    }
    
    // Solo hacemos la petición una vez al montar
    obtenerIndiceBusqueda().then((datos) => {
      if (activo) {
        setPaginasCargadas(datos || []);
        setCargando(false);
      }
    });
    
    return () => { activo = false; };
  }, []); // ¡Dependencia vacía para que solo se ejecute al montar!

  const paginasOrdenadas = ordenarPaginas(paginasCargadas);

  return (
    <section 
      className="py-12 bg-white px-4 olo-mapa-sitio-wrapper" 
      data-block-id={block?.id || 'mapa-sitio'}
      aria-labelledby={`mapa-sitio-title-${block?.id}`}
    >
      <div className="max-w-7xl mx-auto">
        {mostrarTitulo && titulo && (
          <h2 id={`mapa-sitio-title-${block?.id}`} className="text-3xl font-bold text-[#002237] mb-4">
            {titulo}
          </h2>
        )}
        
        {mostrarDescripcion && descripcion && (
          <p className="text-gray-600 text-lg mb-8 max-w-3xl">
            {descripcion}
          </p>
        )}

        {cargando ? (
          <div className="p-4 text-gray-500 italic">Cargando mapa del sitio...</div>
        ) : paginasCargadas.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-500 italic">
            El mapa del sitio se generará automáticamente cuando haya páginas publicadas.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginasOrdenadas.map((pagina) => (
              <li 
                key={pagina.href}
                className="group border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-[#39A900]/40 transition-all flex flex-col justify-between"
              >
                <a 
                  href={pagina.href} 
                  className="flex flex-col p-4 w-full h-full text-[#002237] focus:outline-none focus:ring-2 focus:ring-[#39A900] rounded-xl"
                >
                  <span className="group-hover:text-[#39A900] font-semibold text-[1.05rem] leading-tight transition-colors">
                    {pagina.titulo}
                  </span>
                  {pagina.fechaActualizacion && (
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                      Actualizado: {new Date(pagina.fechaActualizacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
