'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
  areaDeModalClass,
  areaDeModalConErrorClass,
  campoDeModalClass,
  campoDeModalConErrorClass,
  ErrorDeCampo,
  etiquetaDeModalClass,
} from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import { crearProyectoInversionManual, obtenerOpcionesProyectoInversion } from '../services/observatorio.service';
import type { ClaseCiiu, SeccionCiiu } from '../types';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

// Las medidas de todos los modales (`alert.tsx`): las de las pantallas de acceso.
const CAMPO = campoDeModalClass;
const ETIQUETA = etiquetaDeModalClass;

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

/** Los campos obligatorios, para marcar el que falta. */
type CampoObligatorio = 'descripcion' | 'empresa' | 'seccionId' | 'departamento' | 'fechaAnuncio' | 'fuenteUrl';
type Errores = Partial<Record<CampoObligatorio, string>>;

/** Si es una dirección web completa (`https://…`), como la pide la API. */
function esUrlWeb(texto: string): boolean {
  try {
    const url = new URL(texto);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

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
  // Lo que falta o está mal, campo por campo: borde rojo y aviso debajo al pulsar
  // «Guardar»; el de un campo se borra en cuanto se cambia.
  const [errores, setErrores] = useState<Errores>({});

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDatos(ESTADO_INICIAL);
    setError(null);
    setErrores({});
    obtenerOpcionesProyectoInversion()
      .then((opciones) => {
        setSecciones(opciones.secciones);
        setDepartamentos(opciones.departamentos.map((d) => d.nombre));
        setClases(opciones.clases);
      })
      .catch(() => setError('No se pudieron cargar los sectores y departamentos.'));
  }, [open]);

  const quitarError = (campo: string) =>
    setErrores((previos) => {
      if (!(campo in previos)) return previos;
      const siguientes = { ...previos };
      delete siguientes[campo as CampoObligatorio];
      return siguientes;
    });

  const actualizar = <K extends keyof typeof ESTADO_INICIAL>(campo: K, valor: (typeof ESTADO_INICIAL)[K]) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    quitarError(campo);
  };

  /** Atributos de un campo de texto según tenga error o no. */
  const propsDeCampo = (campo: CampoObligatorio, area = false) => ({
    id: `proyecto-${campo}`,
    className: errores[campo]
      ? area ? areaDeModalConErrorClass : campoDeModalConErrorClass
      : area ? areaDeModalClass : CAMPO,
    'aria-invalid': Boolean(errores[campo]) || undefined,
    'aria-describedby': errores[campo] ? `proyecto-${campo}-error` : undefined,
  });

  const avisoDe = (campo: CampoObligatorio) =>
    errores[campo] ? <ErrorDeCampo id={`proyecto-${campo}-error`}>{errores[campo]}</ErrorDeCampo> : null;

  const clasesDelSector = clases.filter((k) => k.seccionId === datos.seccionId);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    // Todo se revisa de una vez y cada falta se marca en su campo, en vez del globo del
    // navegador —que solo enseña el primero y no ve los desplegables ni la fecha, que son
    // propios— o de un mensaje al pie que no dice dónde está el problema.
    const nuevos: Errores = {};
    if (!datos.descripcion.trim()) nuevos.descripcion = 'Falta la descripción.';
    if (!datos.empresa.trim()) nuevos.empresa = 'Falta la empresa.';
    if (!datos.seccionId) nuevos.seccionId = 'Falta el sector.';
    if (!datos.departamento) nuevos.departamento = 'Falta el departamento.';
    if (!datos.fechaAnuncio) nuevos.fechaAnuncio = 'Falta la fecha del anuncio.';
    if (!datos.fuenteUrl.trim()) {
      nuevos.fuenteUrl = 'Falta la URL de la noticia.';
    } else if (!esUrlWeb(datos.fuenteUrl.trim())) {
      nuevos.fuenteUrl = 'Debe ser una dirección web completa (https://…).';
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

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

      {/* `noValidate`: las faltas las marca `enviar` en cada campo, no el globo del navegador. */}
      <form onSubmit={enviar} noValidate className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label htmlFor="proyecto-descripcion" className={ETIQUETA}>Descripción</label>
          <textarea
            required
            maxLength={2000}
            rows={3}
            value={datos.descripcion}
            onChange={(e) => actualizar('descripcion', e.target.value)}
            {...propsDeCampo('descripcion', true)}
          />
          {avisoDe('descripcion')}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="proyecto-empresa" className={ETIQUETA}>Empresa</label>
            <input
              type="text"
              required
              maxLength={200}
              value={datos.empresa}
              onChange={(e) => actualizar('empresa', e.target.value)}
              {...propsDeCampo('empresa')}
            />
            {avisoDe('empresa')}
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
            onChange={(v) => {
              setDatos((actual) => ({ ...actual, seccionId: v, claseId: '' }));
              quitarError('seccionId');
            }}
            placeholder="Selecciona un sector"
            options={secciones.map((s) => ({ value: s.id, label: `${s.letra} · ${s.nombre}` }))}
            invalido={Boolean(errores.seccionId)}
            ariaDescribedBy={errores.seccionId ? 'proyecto-seccionId-error' : undefined}
          />
          {avisoDe('seccionId')}
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
              invalido={Boolean(errores.departamento)}
              ariaDescribedBy={errores.departamento ? 'proyecto-departamento-error' : undefined}
            />
            {avisoDe('departamento')}
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
            invalido={Boolean(errores.fechaAnuncio)}
            ariaDescribedBy={errores.fechaAnuncio ? 'proyecto-fechaAnuncio-error' : undefined}
          />
          {avisoDe('fechaAnuncio')}
        </div>

        <div>
          <label htmlFor="proyecto-fuenteUrl" className={ETIQUETA}>Fuente (URL de la noticia)</label>
          <input
            type="url"
            required
            placeholder="https://..."
            value={datos.fuenteUrl}
            onChange={(e) => actualizar('fuenteUrl', e.target.value)}
            {...propsDeCampo('fuenteUrl')}
          />
          {avisoDe('fuenteUrl')}
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

        {error && (
          <MensajeEstado tipo="error" rol="alert">
            {error}
          </MensajeEstado>
        )}

        <AlertActions>
          <Button type="button" plain onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </Button>
        </AlertActions>
      </form>
    </Alert>
  );
}
