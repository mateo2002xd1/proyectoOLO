'use client';

import React, { useState } from 'react';
import { VisorDocumento } from './visor-documento';
import { MapaProcesos } from './mapa-procesos';

type TabTipo = 'pdf-seguridad' | 'pdf-datos' | 'mapa-procesos';

export function PoliticaPrivacidadView() {
  const [tabActiva, setTabActiva] = useState<TabTipo>('pdf-seguridad');

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0b1121] text-gray-800 dark:text-[#f6f6f6] antialiased min-h-screen transition-colors duration-200">
      {/* Banner de Encabezado Institucional con color azul oscuro sólido (#002237) */}
      <div className="relative overflow-hidden bg-[#002237] py-12 text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Políticas de Seguridad, Privacidad y Tratamiento de Datos
            </h1>
            <p className="mt-3 text-sm text-slate-200 leading-relaxed max-w-3xl">
              Documentos normativos oficiales de seguridad de la información, protección de datos personales (Ley 1581 de 2012) y mapa institucional de macroprocesos del SENA - OLO.
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Presentación y Alcance */}
        <section className="rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-colors">
          <div className="border-b border-gray-100 dark:border-[#1e293b] pb-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">
              Presentación y Alcance
            </h2>
          </div>
          <div className="space-y-2.5 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
            <p>
              El <strong className="text-gray-900 dark:text-white">Servicio Nacional de Aprendizaje (SENA)</strong>, a través del <strong className="text-gray-900 dark:text-white">Observatorio Laboral y Ocupacional (OLO)</strong>, dispone para consulta ciudadana los lineamientos oficiales de la Política de Seguridad y Privacidad de la Información y la Política de Tratamiento para Protección de Datos Personales, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Sistema de Gestión CompromISO.
            </p>
            <p>
              A continuación, seleccione el documento normativo que desea consultar para leerlo directamente en formato PDF o descargar una copia oficial.
            </p>
          </div>
        </section>

        {/* Selector de Documentos Oficiales */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-[#1e293b] pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">
                Documentos y Recursos Normativos Oficiales
              </h2>
            </div>

            {/* Pestañas de Selección de Documento */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-200/80 dark:bg-[#1e293b] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTabActiva('pdf-seguridad')}
                className={`rounded-lg px-3.5 py-1.5 transition ${tabActiva === 'pdf-seguridad'
                  ? 'bg-white dark:bg-[#00324D] text-[#00324D] dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                1. Seguridad y Privacidad (ID: 6701)
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('pdf-datos')}
                className={`rounded-lg px-3.5 py-1.5 transition ${tabActiva === 'pdf-datos'
                  ? 'bg-white dark:bg-[#00324D] text-[#00324D] dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                2. Tratamiento de Datos (ID: 6914)
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('mapa-procesos')}
                className={`rounded-lg px-3.5 py-1.5 transition ${tabActiva === 'mapa-procesos'
                  ? 'bg-white dark:bg-[#00324D] text-[#00324D] dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                3. Mapa de Procesos 2026
              </button>
            </div>
          </div>

          {/* Visor según la pestaña activa */}
          {tabActiva === 'pdf-seguridad' && (
            <VisorDocumento
              titulo="Política de Seguridad y Privacidad de la Información"
              descripcion="Documento oficial del Sistema Integrado de Gestión y Autocontrol CompromISO SENA. Lineamientos de seguridad digital y confidencialidad institucional."
              url="/api/docs/pdf?id=6701"
              urlExterna="https://compromiso.sena.edu.co/mapa/descarga.php?id=6701"
            />
          )}

          {tabActiva === 'pdf-datos' && (
            <VisorDocumento
              titulo="Política de Tratamiento para Protección de Datos Personales"
              descripcion="Régimen y garantías institucionales para el tratamiento, protección de datos personales y ejercicio de derechos de Habeas Data conforme a la Ley 1581 de 2012."
              url="/api/docs/pdf?id=6914"
              urlExterna="https://compromiso.sena.edu.co/mapa/descarga.php?id=6914"
            />
          )}

          {tabActiva === 'mapa-procesos' && (
            <MapaProcesos
              imageSrc="/asset/img/VF_blanco_Mapa_de_Procesos_2026.png"
            />
          )}
        </section>

        {/* Canales de Atención y Ejercicio de Derechos */}
        <section className="rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-colors">
          <div className="border-b border-gray-100 dark:border-[#1e293b] pb-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">
              Canales de Atención y Ejercicio de Derechos (Habeas Data)
            </h2>
          </div>
          <div className="space-y-4 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
            <p>
              Para ejercer sus derechos de conocer, actualizar, rectificar o suprimir sus datos personales, o para presentar cualquier consulta o reclamo relativo a la protección de datos, el SENA pone a disposición los siguientes canales oficiales:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo Electrónico</span>
                <p className="font-semibold text-gray-900 dark:text-[#f6f6f6] text-xs mt-1 truncate">
                  servicioalciudadano@sena.edu.co
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Línea Gratuita Nacional</span>
                <p className="font-semibold text-gray-900 dark:text-[#f6f6f6] text-xs mt-1">
                  01 8000 910270 • (601) 343 0111
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dirección General</span>
                <p className="font-semibold text-gray-900 dark:text-[#f6f6f6] text-xs mt-1">
                  Calle 57 No. 8 - 69, Bogotá D.C.
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempos de Respuesta</span>
                <p className="font-semibold text-gray-900 dark:text-[#f6f6f6] text-xs mt-1">
                  10 a 15 días hábiles (Ley 1581)
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
