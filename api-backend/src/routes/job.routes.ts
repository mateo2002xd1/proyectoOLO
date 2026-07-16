import { Router } from 'express';
import { heavyJobsQueue } from '../infrastructure/redis/queue';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const job = await heavyJobsQueue.getJob(req.params.id);
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
});

router.post('/start-heavy-task', async (req, res) => {
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
});

export default router;
