"use strict";
// Domain Events - Event Bus
// Stub: Implementar según Fase 9 (Domain Events + Redis)
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
class EventBus {
    handlers = new Map();
    on(event, handler) {
        const handlers = this.handlers.get(event) || [];
        handlers.push(handler);
        this.handlers.set(event, handlers);
    }
    emit(event, data) {
        const handlers = this.handlers.get(event) || [];
        handlers.forEach(handler => handler(data));
    }
}
exports.eventBus = new EventBus();
//# sourceMappingURL=event-bus.js.map