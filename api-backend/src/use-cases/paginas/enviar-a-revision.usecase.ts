import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { validarAccesibilidad, mensajeDeViolacion, type ViolacionAccesibilidad } from '@olo/accessibility-policy';

/**
 * "Enviar a revisión" es el punto de la Fase 5 de `9-accesibilidad.md`: un
 * borrador puede guardarse incompleto (no se pierde trabajo a medio hacer),
 * pero no puede pasar a `en_revision` sin los campos obligatorios de
 * accesibilidad (alt de imagen, título de iframe). El controller mapea esto a
 * 400 con el detalle — no es un error genérico.
 */
export class ErrorValidacionAccesibilidad extends Error {
  violaciones: ViolacionAccesibilidad[];

  constructor(violaciones: ViolacionAccesibilidad[]) {
    super(violaciones.map(mensajeDeViolacion).join(' '));
    this.name = 'ErrorValidacionAccesibilidad';
    this.violaciones = violaciones;
  }
}

export const enviarARevision = async (slug: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) throw new Error('Página no encontrada');

  const ultimaVersion = await PaginaRepository.findVersionPorEstado(pagina.id, 'borrador');
  if (!ultimaVersion) throw new Error('No hay borrador para enviar a revisión');

  // `Ambito` de la API ('sitio' | 'intranet') coincide 1:1 con el de
  // `@olo/accessibility-policy` — son el mismo concepto en las dos apps.
  const violaciones = validarAccesibilidad(ultimaVersion.contenido, ambito);
  if (violaciones.length > 0) throw new ErrorValidacionAccesibilidad(violaciones);

  await PaginaRepository.actualizarVersion(ultimaVersion, { estado: 'en_revision' });

  return { pagina, version: ultimaVersion };
};
