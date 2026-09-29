import { Request, Response } from 'express';
import { iniciarCargaAlertasInversion, ErrorDeSubida } from '../use-cases/alertas-inversion/iniciar-carga.usecase';
import { listarCargasAlertasInversion, obtenerCargaAlertasInversion } from '../use-cases/alertas-inversion/listar-cargas.usecase';
import { eliminarCargaAlertasInversion, ErrorAlEliminarCarga } from '../use-cases/alertas-inversion/eliminar-carga.usecase';
import { crearProyectoInversionManual, ErrorDeAltaManual } from '../use-cases/alertas-inversion/crear-proyecto-manual.usecase';
import {
  consultarGraficoAlertasInversion,
  consultarListadoAlertasInversion,
  consultarOpcionesAlertasInversion,
} from '../use-cases/alertas-inversion/consultas-publicas.usecase';
import { resolverFormatoDeCarga, ErrorDeFormato } from '../use-cases/observatorio/formatos-de-carga';
import { idReferenciable } from '../shared/auditoria-request';
import { filtroPublicoSchema, listadoPublicoSchema } from '../validators/alertas-inversion.validators';

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

  async descargarFormato(_req: Request, res: Response) {
    try {
      const { ruta, nombreDescarga } = await resolverFormatoDeCarga('alertas-inversion');
      res.set('Cache-Control', 'private, no-cache');
      res.download(ruta, nombreDescarga, { cacheControl: false }, (error) => {
        if (!error) return;
        console.error('[alertas-inversion] Error al enviar el formato de carga:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Error al descargar el formato.' });
      });
    } catch (error) {
      if (error instanceof ErrorDeFormato) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[alertas-inversion] Error al descargar el formato de carga:', error);
      res.status(500).json({ error: 'Error al descargar el formato.' });
    }
  },

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
