import { Request, Response } from 'express';
import { heavyJobsQueue } from '../infrastructure/redis/queue';

export const TrabajosController = {
  async consultarEstado(req: Request, res: Response) {
    try {
      const job = await heavyJobsQueue.getJob(req.params.id as string);
      if (!job) {
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
        user: req.body.user || 'anonymous',
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
