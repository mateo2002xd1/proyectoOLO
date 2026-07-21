"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrabajosController = void 0;
const queue_1 = require("../infrastructure/redis/queue");
exports.TrabajosController = {
    async consultarEstado(req, res) {
        try {
            const job = await queue_1.heavyJobsQueue.getJob(req.params.id);
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
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching job status', error });
        }
    },
    async encolarTarea(req, res) {
        try {
            // Enqueue a job as a proof-of-concept
            const job = await queue_1.heavyJobsQueue.add('export-data', {
                user: req.body.user || 'anonymous',
                type: 'massive-export'
            });
            res.status(202).json({
                message: 'Job accepted for processing',
                jobId: job.id,
                statusUrl: `/api/jobs/${job.id}`
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error starting job', error });
        }
    },
};
//# sourceMappingURL=trabajos.controller.js.map