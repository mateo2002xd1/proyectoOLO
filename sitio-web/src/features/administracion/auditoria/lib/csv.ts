import { etiquetaDeAccion, etiquetaDeEntidad, type RegistroAuditoria } from '../types';
import { resumenDeCambios } from './cambios';

/**
 * «Cambios» es lo mismo que enseña la tabla (el comentario de cambios y el motivo);
 * «Campos modificados» sigue saliendo entero porque este archivo es el respaldo que
 * se descarga antes de depurar la bitácora, y como evidencia no puede perder datos.
 */
const COLUMNAS = [
  'Fecha',
  'Usuario',
  'Acción',
  'Entidad',
  'Id de la entidad',
  'Cambios',
  'Campos modificados',
  'IP',
  'Navegador',
];

/**
 * Escapa una celda para CSV.
 *
 * El apóstrofo delante de `= + - @` no es decoración: Excel y LibreOffice tratan
 * una celda que empieza así como **fórmula**, y esta exportación sale de datos que
 * escribió un usuario (nombres, motivos de rechazo). Sin esto, un archivo de
 * evidencia puede ejecutar algo al abrirse.
 */
const celda = (valor: unknown): string => {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
};

const resumirCampos = (registro: RegistroAuditoria) =>
  registro.camposModificados
    .map(({ campo, despues }) => `${campo}: ${despues === null || despues === undefined ? '—' : typeof despues === 'string' ? despues : JSON.stringify(despues)}`)
    .join('\n');

export function aCsv(registros: RegistroAuditoria[]): string {
  const filas = registros.map((r) =>
    [
      new Date(r.fecha).toLocaleString('es-CO'),
      r.usuarioNombre ?? 'Sin usuario',
      etiquetaDeAccion(r.accion),
      etiquetaDeEntidad(r.entidadTipo),
      r.entidadId,
      resumenDeCambios(r, '\n'),
      resumirCampos(r),
      r.ip ?? '',
      r.userAgent ?? '',
    ].map(celda).join(','),
  );

  // El BOM va delante para que Excel abra el archivo como UTF-8 y no parta los
  // acentos ni la "ñ". 'sep=,' instruye a Excel a usar la coma como separador.
  return `\uFEFFsep=,\r\n${[COLUMNAS.map(celda).join(','), ...filas].join('\r\n')}`;
}

export function descargarCsv(nombre: string, contenido: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

export const nombreDeArchivo = () =>
  `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
