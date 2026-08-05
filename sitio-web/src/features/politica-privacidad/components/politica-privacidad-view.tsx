'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ClockIcon,
  PhotoIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { VisorDocumento } from './visor-documento';
import { MapaProcesos } from './mapa-procesos';

type TabTipo = 'pdf-seguridad' | 'pdf-datos' | 'mapa-procesos';

export function PoliticaPrivacidadView() {
  const [tabActiva, setTabActiva] = useState<TabTipo>('pdf-seguridad');

  return (
    <div className="bg-[#f8fafc] text-gray-800 antialiased min-h-screen">
      {/* Banner de Encabezado Institucional */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00324D] via-[#044366] to-[#002235] py-12 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-xs text-emerald-200">
            <Link href="/" className="hover:text-white transition">Inicio</Link>
            <span>/</span>
            <span className="text-white font-medium">Política de Privacidad</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-300 backdrop-blur-md border border-white/15">
                <ShieldCheckIcon className="h-4 w-4 text-[#39A900]" />
                CompromISO SENA • Sistema Integrado de Gestión y Autocontrol
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Políticas de Seguridad, Privacidad y Tratamiento de Datos
              </h1>
              <p className="mt-3 text-sm text-slate-200 leading-relaxed max-w-2xl">
                Documentos normativos oficiales de seguridad de la información, protección de datos personales (Ley 1581 de 2012) y mapa institucional de macroprocesos del SENA - OLO.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/15 text-xs text-slate-100 min-w-[250px]">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-emerald-400" />
                <span>Estado: <strong>Vigente 2026</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4 text-emerald-400" />
                <span>CompromISO: <strong>ID 6701 & ID 6914</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 text-emerald-400" />
                <span>Entidad: <strong>SENA - OLO</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Presentación y Alcance */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00324D]/10 text-[#00324D] font-bold text-xs">
              1
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              Presentación y Alcance
            </h2>
          </div>
          <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
            <p>
              El <strong>Servicio Nacional de Aprendizaje (SENA)</strong>, a través del <strong>Observatorio Laboral y Ocupacional (OLO)</strong>, dispone para consulta ciudadana los lineamientos oficiales de la Política de Seguridad y Privacidad de la Información y la Política de Tratamiento para Protección de Datos Personales, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Sistema de Gestión CompromISO.
            </p>
            <p>
              A continuación, seleccione el documento normativo que desea consultar para leerlo directamente en formato PDF o descargar una copia oficial.
            </p>
          </div>
        </section>

        {/* Selector de Documentos Oficiales */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpenIcon className="h-5 w-5 text-[#39A900]" />
              <h2 className="text-lg font-bold text-gray-900">
                Documentos y Recursos Normativos Oficiales
              </h2>
            </div>

            {/* Pestañas de Selección de Documento */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-200/80 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTabActiva('pdf-seguridad')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                  tabActiva === 'pdf-seguridad'
                    ? 'bg-white text-[#00324D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4 text-[#39A900]" />
                <span>1. Seguridad y Privacidad (ID: 6701)</span>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('pdf-datos')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                  tabActiva === 'pdf-datos'
                    ? 'bg-white text-[#00324D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4 text-[#39A900]" />
                <span>2. Tratamiento de Datos (ID: 6914)</span>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('mapa-procesos')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                  tabActiva === 'mapa-procesos'
                    ? 'bg-white text-[#00324D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PhotoIcon className="h-4 w-4 text-[#39A900]" />
                <span>3. Mapa de Procesos 2026</span>
              </button>
            </div>
          </div>

          {/* Visor según la pestaña activa */}
          {tabActiva === 'pdf-seguridad' && (
            <VisorDocumento
              titulo="Política de Seguridad y Privacidad de la Información"
              descripcion="Documento oficial del Sistema Integrado de Gestión y Autocontrol CompromISO SENA. Lineamientos de seguridad digital y confidencialidad institucional."
              url="https://compromiso.sena.edu.co/mapa/descarga.php?id=6701"
              codigoCompromiso="CompromISO ID: 6701"
              fechaVigencia="Vigente 2026"
            />
          )}

          {tabActiva === 'pdf-datos' && (
            <VisorDocumento
              titulo="Política de Tratamiento para Protección de Datos Personales"
              descripcion="Régimen y garantías institucionales para el tratamiento, protección de datos personales y ejercicio de derechos de Habeas Data conforme a la Ley 1581 de 2012."
              url="https://compromiso.sena.edu.co/mapa/descarga.php?id=6914"
              codigoCompromiso="CompromISO ID: 6914"
              fechaVigencia="Vigente 2026"
            />
          )}

          {tabActiva === 'mapa-procesos' && (
            <MapaProcesos
              imageSrc="/asset/img/VF_blanco_Mapa_de_Procesos_2026.png"
            />
          )}
        </section>

        {/* Canales de Atención y Ejercicio de Derechos */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00324D]/10 text-[#00324D] font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              Canales de Atención y Ejercicio de Derechos (Habeas Data)
            </h2>
          </div>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Para ejercer sus derechos de conocer, actualizar, rectificar o suprimir sus datos personales, o para presentar cualquier consulta o reclamo relativo a la protección de datos, el SENA pone a disposición los siguientes canales oficiales:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <EnvelopeIcon className="h-5 w-5 text-[#39A900] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Correo Electrónico</h4>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    servicioalciudadano@sena.edu.co
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <PhoneIcon className="h-5 w-5 text-[#39A900] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Línea Gratuita Nacional</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    01 8000 910270 • (601) 343 0111
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <MapPinIcon className="h-5 w-5 text-[#39A900] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Dirección General</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Calle 57 No. 8 - 69, Bogotá D.C.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <ClockIcon className="h-5 w-5 text-[#39A900] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Tiempos de Respuesta</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    10 a 15 días hábiles (Ley 1581)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
