"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    const status = err.status || err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
        if (status === 500)
            console.error(err.stack);
    }
    else {
        // En producción, sanitizar errores 500 para no filtrar stack traces o detalles
        if (status === 500) {
            message = 'Error interno del servidor';
        }
    }
    res.status(status).json({ error: message });
}
//# sourceMappingURL=error.middleware.js.map