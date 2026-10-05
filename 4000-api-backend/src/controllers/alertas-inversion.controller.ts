import { Request, Response } from 'express';
import { iniciarCargaAlertasInversion, ErrorDeSubida } from '../use-cases/alertas-inversion/iniciar-carga.usecase';
import { listarCargasAlertasInversion, obtenerCargaAlertasInversion } from '../use-cases/alertas-inversion/listar-cargas.usecase';
import { eliminarCargaAlertasInversion, ErrorAlEliminarCarga } from '../use-cases/alertas-inversion/eliminar-carga.usecase';
import { actualizarSectoresCiiu, ErrorAlActualizarSectores } from '../use-cases/alertas-inversion/actualizar-sectores.usecase';
import { crearProyectoInversionManual, ErrorDeAltaManual } from '../use-cases/alertas-inversion/crear-proyecto-manual.usecase';
import {
  eliminarProyectoInversion,
  eliminarTodosLosProyectosInversion,
  ErrorAlEliminarProyecto,
} from '../use-cases/alertas-inversion/eliminar-proyecto.usecase';
import {
  consultarGraficoAlertasInversion,
  consultarListadoAlertasInversion,
  consultarOpcionesAlertasInversion,
} from '../use-cases/alertas-inversion/consultas-publicas.usecase';
import { resolverFormatoDeCarga, ErrorDeFormato } from '../use-cases/observatorio/formatos-de-carga';
import { idReferenciable } from '../shared/auditoria-request';
import { filtroPublicoSchema, listadoPublicoSchema } from '../validators/alertas-inversion.validators';

/** Sirve uno de los Excel de ejemplo de `uploads/formatos-carga/` (lista cerrada en `formatos-de-carga.ts`). */
async function enviarFormato(res: Response, formato: string) {
  try {
    const { ruta, nombreDescarga } = await resolverFormatoDeCarga(formato);
    res.set('Cache-Control', 'private, no-cache');
    res.download(ruta, nombreDescarga, { cacheControl: false }, (error) => {
      if (!error) return;
      console.error(`[alertas-inversion] Error al enviar el formato ${formato}:`, error);
      if (!res.headersSent) res.status(500).json({ error: 'Error al descargar el formato.' });
    });
  } catch (error) {
    if (error instanceof ErrorDeFormato) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(`[alertas-inversion] Error al descargar el formato ${formato}:`, error);
    res.status(500).json({ error: 'Error al descargar el formato.' });
  }
}

export const AlertasInversionController = {
  /** Sube el Excel y arranca la carga de inmediato — sin paso de aprobación. */
  async subir(req: Request, res: Response) {
    try {
      const archivo = (req as any).file as Express.Multer.File | undefined;
      if (!archivo) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }

      const { cargaId } = await iniciarCargaAlertasInversion(
        archivo.buffer,
        archivo.originalname,
        idReferenciable(req.user)
      );

      res.status(202).json({ cargaId, message: 'Archivo recibido, procesando...' });
    } catch (error) {
      if (error instanceof ErrorDeSubida) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al subir el archivo:', error);
      res.status(500).json({ error: 'Error al procesar el archivo.' });
    }
  },

  async listarCargas(_req: Request, res: Response) {
    try {
      res.json(await listarCargasAlertasInversion());
    } catch (error) {
      console.error('[alertas-inversion] Error al listar cargas:', error);
      res.status(500).json({ error: 'Error al listar las cargas.' });
    }
  },

  async obtenerCarga(req: Request, res: Response) {
    try {
      const carga = await obtenerCargaAlertasInversion(req.params.id as string);
      if (!carga) return res.status(404).json({ error: 'Carga no encontrada.' });
      res.json(carga);
    } catch (error) {
      console.error('[alertas-inversion] Error al consultar la carga:', error);
      res.status(500).json({ error: 'Error al consultar la carga.' });
    }
  },

  async eliminarCarga(req: Request, res: Response) {
    try {
      await eliminarCargaAlertasInversion(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ErrorAlEliminarCarga) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al eliminar la carga:', error);
      res.status(500).json({ error: 'Error al eliminar la carga.' });
    }
  },

  /** Excel de ejemplo de la carga de proyectos. */
  descargarFormato: (_req: Request, res: Response) => enviarFormato(res, 'alertas-inversion'),

  /** Excel de ejemplo de «Actualizar sectores (CIIU)». */
  descargarFormatoSectores: (_req: Request, res: Response) => enviarFormato(res, 'actualizar-ciiu'),

  /** Alta manual — la segunda vía de entrada, junto a la carga de Excel. */
  async crearManual(req: Request, res: Response) {
    try {
      const proyecto = await crearProyectoInversionManual(req.body, idReferenciable(req.user));
      res.status(201).json({ id: proyecto.get('id') });
    } catch (error) {
      if (error instanceof ErrorDeAltaManual) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al crear el proyecto:', error);
      res.status(500).json({ error: 'Error al crear el proyecto.' });
    }
  },

  /** Actualiza el catálogo de sectores (CIIU) desde un Excel de código y nombre. */
  async actualizarSectores(req: Request, res: Response) {
    try {
      const archivo = (req as any).file as Express.Multer.File | undefined;
      if (!archivo) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }
      res.json(await actualizarSectoresCiiu(archivo.buffer));
    } catch (error) {
      if (error instanceof ErrorAlActualizarSectores) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al actualizar los sectores:', error);
      res.status(500).json({ error: 'Error al actualizar los sectores.' });
    }
  },

  /** Proyectos publicados, para que el panel pueda listarlos y borrarlos. */
  async listarProyectos(_req: Request, res: Response) {
    try {
      const { proyectos } = await consultarListadoAlertasInversion({
        seccionLetra: null,
        anio: null,
        pagina: 1,
        porPagina: 100,
      });
      res.json(proyectos);
    } catch (error) {
      console.error('[alertas-inversion] Error al listar los proyectos:', error);
      res.status(500).json({ error: 'Error al listar los proyectos.' });
    }
  },

  async eliminarTodosLosProyectos(_req: Request, res: Response) {
    try {
      res.json({ eliminados: await eliminarTodosLosProyectosInversion() });
    } catch (error) {
      console.error('[alertas-inversion] Error al limpiar los proyectos:', error);
      res.status(500).json({ error: 'Error al limpiar los proyectos.' });
    }
  },

  async eliminarProyecto(req: Request, res: Response) {
    try {
      await eliminarProyectoInversion(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ErrorAlEliminarProyecto) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al eliminar el proyecto:', error);
      res.status(500).json({ error: 'Error al eliminar el proyecto.' });
    }
  },

  /** Público, sin sesión: conteo de proyectos publicados por sector. */
  async grafico(req: Request, res: Response) {
    const consulta = filtroPublicoSchema.safeParse(req.query);
    if (!consulta.success) {
      return res.status(400).json({ error: 'Filtros inválidos.', detalles: consulta.error.issues });
    }
    try {
      const datos = await consultarGraficoAlertasInversion({
        codigoDaneDepartamento: consulta.data.departamento ?? null,
        anio: consulta.data.anio ?? null,
      });
      res.json(datos);
    } catch (error) {
      console.error('[alertas-inversion] Error al consultar el gráfico:', error);
      res.status(500).json({ error: 'Error al consultar el gráfico.' });
    }
  },

  /** Público, sin sesión: listado paginado que acompaña al gráfico. */
  async listado(req: Request, res: Response) {
    const consulta = listadoPublicoSchema.safeParse(req.query);
    if (!consulta.success) {
      return res.status(400).json({ error: 'Filtros inválidos.', detalles: consulta.error.issues });
    }
    try {
      const datos = await consultarListadoAlertasInversion({
        seccionLetra: consulta.data.seccion ?? null,
        codigoDaneDepartamento: consulta.data.departamento ?? null,
        anio: consulta.data.anio ?? null,
        pagina: consulta.data.pagina,
        porPagina: consulta.data.porPagina,
      });
      res.json(datos);
    } catch (error) {
      console.error('[alertas-inversion] Error al consultar el listado:', error);
      res.status(500).json({ error: 'Error al consultar el listado.' });
    }
  },

  /** Público: catálogo de secciones activas y años con datos, para los filtros del sitio y el formulario del panel. */
  async opciones(_req: Request, res: Response) {
    try {
      res.json(await consultarOpcionesAlertasInversion());
    } catch (error) {
      console.error('[alertas-inversion] Error al consultar las opciones:', error);
      res.status(500).json({ error: 'Error al consultar las opciones.' });
    }
  },
};
