import fs from 'fs/promises';
import path from 'path';

/**
 * Excel de ejemplo que "Actualizaciones" ofrece junto a cada tarjeta de carga: las hojas y
 * columnas que espera su importador, para llenarlo antes de subirlo.
 *
 * Lista cerrada a propósito: la URL trae un identificador, nunca un nombre de archivo, así
 * que por aquí no se puede pedir nada de `uploads/` que no esté en esta tabla (ni los Excel
 * de las cargas, ni un `../`). Viven en `uploads/formatos-carga/`, la carpeta que el
 * servidor monta en el contenedor (`docker-compose.servidor.yml`): para cambiar un formato
 * basta con reemplazar el archivo con el mismo nombre, sin volver a desplegar.
 */
const FORMATOS = new Map<string, string>([
  ['programas-sobresalientes', 'formato-sobresalientes.xlsx'],
  ['tendencia-ocupacional', 'formato-criterios-tendencias.xlsx'],
  ['alertas-inversion', 'formato-alertas-inversion.xlsx'],
  ['actualizar-ciiu', 'formato-actualizar-CIIU.xlsx'],
  ['fuentes-futuras', 'formato-fuentes-futuras.xlsx'],
]);

const DIRECTORIO_FORMATOS = path.join(process.cwd(), 'uploads', 'formatos-carga');

export class ErrorDeFormato extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Ruta en disco del formato pedido y el nombre con el que se descarga (`formato-<id>.xlsx`). */
export async function resolverFormatoDeCarga(formato: string): Promise<{ ruta: string; nombreDescarga: string }> {
  const archivo = FORMATOS.get(formato);
  if (!archivo) {
    throw new ErrorDeFormato('Formato no encontrado.', 404);
  }

  const ruta = path.join(DIRECTORIO_FORMATOS, archivo);
  try {
    await fs.access(ruta);
  } catch {
    console.warn(`[observatorio] Falta el formato de carga ${ruta}`);
    throw new ErrorDeFormato('Este formato no está disponible en el servidor.', 404);
  }

  return { ruta, nombreDescarga: `formato-${formato}.xlsx` };
}
