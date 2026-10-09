'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import { crearProyectoInversionManual, obtenerOpcionesProyectoInversion } from '../services/observatorio.service';
import type { ClaseCiiu, SeccionCiiu } from '../types';

const CAMPO =
  'w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white';
const ETIQUETA = 'mb-1 block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]';

const ESTADO_INICIAL = {
  tipo: 'nuevo' as 'nuevo' | 'expansion',
  descripcion: '',
  empresa: '',
  seccionId: '',
  claseId: '',
  fechaAnuncio: '',
  fuenteUrl: '',
  fuenteMedio: '',
  inversionCop: '',
  empleosEstimados: '',
  departamento: '',
  ciudad: '',
};

interface FormularioProyectoInversionProps {
  open: boolean;
  onClose: () => void;
  /** Refresca el historial de cargas tras crear el proyecto (aparece con `modulo` propio). */
  onCreado: () => void;
}

/**
 * "Agregar manualmente" de "Alertas de inversión": la segunda vía de entrada de datos,
 * junto a la carga de Excel. Mismo patrón de modal + formulario que "Nuevo Usuario"
 * (`usuarios-view.tsx`): `Alert` + `<form>` propio, sin librería de formularios.
 */
export function FormularioProyectoInversion({ open, onClose, onCreado }: FormularioProyectoInversionProps) {
  const [secciones, setSecciones] = useState<SeccionCiiu[]>([]);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [clases, setClases] = useState<ClaseCiiu[]>([]);
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDatos(ESTADO_INICIAL);
    setError(null);
    obtenerOpcionesProyectoInversion()
      .then((opciones) => {
        setSecciones(opciones.secciones);
        setDepartamentos(opciones.departamentos.map((d) => d.nombre));
        setClases(opciones.clases);
      })
      .catch(() => setError('No se pudieron cargar los sectores y departamentos.'));
  }, [open]);

  const actualizar = <K extends keyof typeof ESTADO_INICIAL>(campo: K, valor: (typeof ESTADO_INICIAL)[K]) =>
    setDatos((actual) => ({ ...actual, [campo]: valor }));

  const clasesDelSector = clases.filter((k) => k.seccionId === datos.seccionId);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    // El selector de fecha propio no es un <input required>: se valida a mano.
    if (!datos.departamento) {
      setError('Elija el departamento.');
      return;
    }
    if (!datos.fechaAnuncio) {
      setError('Elija la fecha del anuncio.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await crearProyectoInversionManual({
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        empresa: datos.empresa,
        seccionId: datos.seccionId,
        claseId: datos.claseId || null,
        fechaAnuncio: datos.fechaAnuncio,
        fuenteUrl: datos.fuenteUrl,
        fuenteMedio: datos.fuenteMedio || null,
        inversionCop: datos.inversionCop ? Number(datos.inversionCop) : null,
        empleosEstimados: datos.empleosEstimados ? Number(datos.empleosEstimados) : null,
        departamento: datos.departamento,
        ciudad: datos.ciudad || null,
      });
      onCreado();
      onClose();
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudo crear el proyecto.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Alert open={open} onClose={(abierto) => !enviando && !abierto && onClose()} anchoMaximo="max-w-3xl">
      <AlertTitle>Agregar proyecto de inversión</AlertTitle>
      <AlertDescription>Se publica de inmediato en /alertas-inversion, sin paso de aprobación.</AlertDescription>

      <form onSubmit={enviar} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className={ETIQUETA}>Descripción</label>
          <textarea
            required
            maxLength={2000}
            rows={3}
            value={datos.descripcion}
            onChange={(e) => actualizar('descripcion', e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={ETIQUETA}>Empresa</label>
            <input
              type="text"
              required
              maxLength={200}
              value={datos.empresa}
              onChange={(e) => actualizar('empresa', e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETIQUETA}>Tipo</label>
            <CustomSelect
              ariaLabel="Tipo"
              value={datos.tipo}
              onChange={(v) => actualizar('tipo', v as 'nuevo' | 'expansion')}
              options={[
                { value: 'nuevo', label: 'Nuevo' },
                { value: 'expansion', label: 'Expansión' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className={ETIQUETA}>Sector (CIIU)</label>
          <CustomSelect
            ariaLabel="Sector"
            value={datos.seccionId}
            // Al cambiar de sector, la actividad elegida ya no le pertenece.
            onChange={(v) => setDatos((actual) => ({ ...actual, seccionId: v, claseId: '' }))}
            placeholder="Selecciona un sector"
            options={secciones.map((s) => ({ value: s.id, label: `${s.letra} · ${s.nombre}` }))}
          />
        </div>

        {clasesDelSector.length > 0 && (
          <div>
            <label className={ETIQUETA}>Actividad (CIIU, opcional)</label>
            <CustomSelect
              ariaLabel="Actividad"
              value={datos.claseId}
              onChange={(v) => actualizar('claseId', v)}
              placeholder="Sin actividad específica"
              options={[
                { value: '', label: 'Sin actividad específica' },
                ...clasesDelSector.map((k) => ({ value: k.id, label: `${k.codigo} · ${k.nombre}` })),
              ]}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={ETIQUETA}>Departamento</label>
            <CustomSelect
              ariaLabel="Departamento"
              value={datos.departamento}
              onChange={(v) => actualizar('departamento', v)}
              placeholder="Selecciona un departamento"
              options={departamentos}
            />
          </div>
          <div>
            <label className={ETIQUETA}>Ciudad (opcional)</label>
            <input
              type="text"
              maxLength={120}
              value={datos.ciudad}
              onChange={(e) => actualizar('ciudad', e.target.value)}
              className={CAMPO}
            />
          </div>
        </div>

        <div>
          <label className={ETIQUETA}>Fecha del anuncio</label>
          <DatePicker
            ariaLabel="Fecha del anuncio"
            value={datos.fechaAnuncio}
            onChange={(valor) => actualizar('fechaAnuncio', valor)}
          />
        </div>

        <div>
          <label className={ETIQUETA}>Fuente (URL de la noticia)</label>
          <input
            type="url"
            required
            placeholder="https://..."
            value={datos.fuenteUrl}
            onChange={(e) => actualizar('fuenteUrl', e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={ETIQUETA}>Medio (opcional)</label>
            <input
              type="text"
              maxLength={120}
              placeholder="Portafolio..."
              value={datos.fuenteMedio}
              onChange={(e) => actualizar('fuenteMedio', e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETIQUETA}>Inversión COP (opcional)</label>
            <input
              type="number"
              min={0}
              value={datos.inversionCop}
              onChange={(e) => actualizar('inversionCop', e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETIQUETA}>Empleos estimados (opcional)</label>
            <input
              type="number"
              min={0}
              value={datos.empleosEstimados}
              onChange={(e) => actualizar('empleosEstimados', e.target.value)}
              className={CAMPO}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <AlertActions>
          <Button type="button" plain onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando || !datos.seccionId}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </Button>
        </AlertActions>
      </form>
    </Alert>
  );
}
