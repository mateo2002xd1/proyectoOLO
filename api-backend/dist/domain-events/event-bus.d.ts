type EventHandler = (data: any) => void;
declare class EventBus {
    private handlers;
    on(event: string, handler: EventHandler): void;
    emit(event: string, data: any): void;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=event-bus.d.ts.map