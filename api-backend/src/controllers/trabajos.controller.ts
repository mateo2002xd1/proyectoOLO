import { Request, Response } from 'express';
import { heavyJobsQueue } from '../infrastructure/redis/queue';
import { usuariosPolicies } from '../policies/usuarios.policies';
import { esDueno } from '../shared/autorizacion';

export const TrabajosController = {
  /**
   * Estado de un trabajo, solo si es tuyo.
   *
   * BullMQ reparte ids secuenciales ('1', '2', '3'…), así que sin esta comprobación
   * bastaba con contar desde uno para leer el `returnvalue` de las exportaciones de
   * todo el mundo. El id no es un secreto y nunca debió tratarse como tal: lo que
   * autoriza es el dueño guardado en el propio trabajo.
   *
   * Se responde 404 y no 403 porque un 403 confirmaría qué ids existen, que es
   * justamente lo que la enumeración busca averiguar.
   */
  async consultarEstado(req: Request, res: Response) {
    try {
      const job = await heavyJobsQueue.getJob(req.params.id as string);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const esAdministrador = usuariosPolicies.puedeAdministrarUsuarios(req.user?.role);
      if (!esAdministrador && !esDueno(job.data?.usuarioId, req.user?.id)) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      res.json({
        id: job.id,
        state,
        progress,
        result,
        failedReason
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching job status', error });
    }
  },

  async encolarTarea(req: Request, res: Response) {
    try {
      // Enqueue a job as a proof-of-concept
      const job = await heavyJobsQueue.add('export-data', {
        // El dueño sale de la sesión, nunca del cuerpo: si viniera de `req.body` el
        // que consulta podría encolar trabajos a nombre de otro y viceversa. `user`
        // se conserva porque es la etiqueta que ya leía el worker.
        usuarioId: req.user?.id,
        user: req.user?.email || req.body.user || 'anonymous',
        type: 'massive-export'
      });

      res.status(202).json({
        message: 'Job accepted for processing',
        jobId: job.id,
        statusUrl: `/api/jobs/${job.id}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Error starting job', error });
    }
  },
};
