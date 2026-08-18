import { Archivo, ContenidoArchivo } from '../infrastructure/db/models';

/**
 * Los adjuntos de un contenido viven en dos tablas: `archivos` (el archivo en sí) y
 * `contenidos_archivos` (dónde aparece). El repositorio esconde ese par, así que los
 * casos de uso siguen hablando de "los adjuntos de un contenido".
 */
export const AttachmentRepository = {
  findByPost: (contenidoId: string) =>
    Archivo.findAll({
      include: [
        {
          model: ContenidoArchivo,
          attributes: [],
          where: { contenidoId },
          required: true,
        },
      ],
      order: [['createdAt', 'ASC']],
    }),

  findById: (id: string) => Archivo.findByPk(id),

  /**
   * El enlace entre un contenido y un archivo, o `null` si ese archivo no cuelga de
   * ese contenido. Es lo que permite comprobar la pertenencia antes de borrar: la
   * tabla `archivos` no sabe de qué contenido es cada fila, ese dato vive aquí.
   */
  findEnlace: (contenidoId: string, archivoId: string) =>
    ContenidoArchivo.findOne({ where: { contenidoId, archivoId } }),

  /** Crea el archivo y lo enlaza al contenido en una sola operación. */
  create: async (data: any) => {
    const { contenidoId, orden = 0, rol = 'adjunto', ...archivo } = data;
    const creado = await Archivo.create(archivo);
    if (contenidoId) {
      await ContenidoArchivo.create({ contenidoId, archivoId: creado.id, orden, rol });
    }
    return creado;
  },

  // El enlace se borra primero: `contenidos_archivos.archivo_id` es RESTRICT, para que
  // borrar un contenido nunca arrastre un archivo que otro esté usando.
  delete: async (id: string) => {
    await ContenidoArchivo.destroy({ where: { archivoId: id } });
    return Archivo.destroy({ where: { id } });
  },

  /** Desvincula los archivos de un contenido sin borrarlos del almacenamiento. */
  deleteByPost: (contenidoId: string) => ContenidoArchivo.destroy({ where: { contenidoId } }),
};
