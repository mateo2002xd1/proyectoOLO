import { config } from './config';
import sequelize from './config/database';

// Import models to register associations
import './infrastructure/db/models';
import { listarPendientes } from './infrastructure/db/migrations';
import { cerrarCola, setupWorker } from './infrastructure/redis/queue';
import { describirErrorParaLog } from './shared/errores';

/**
 * Proceso propio para el worker de la cola `heavy-jobs` (SUB-01, Fase 3).
 *
 * Hasta el 2026-10-25 `setupWorker()` se llamaba desde `server.ts`: el mismo proceso que
 * atiende login y páginas públicas abría el Excel de una carga del Observatorio y lo
 * cargaba entero en memoria (`exceljs`, sin streaming). El tope de tamaño descomprimido
 * que se agregó esa misma sesión (`guardar-excel-de-carga.ts`) cierra el vector conocido,
 * pero no la causa: mientras parsear un archivo subido por alguien corra en el mismo
 * proceso que sirve tráfico público, cualquier otro agotamiento de memoria —una librería
 * nueva, un archivo distinto, no necesariamente un Excel— sigue pudiendo tumbar la API
 * entera. Separarlo es la decisión que recomendó `llm-council` el 2026-10-25 (ver
 * `6-auditoria.md`, sesión del "SOLUCIONA TODO"): un bug o un OOM aquí tumba solo este
 * proceso, que Docker reinicia (`restart: unless-stopped` en `docker-compose.servidor.yml`,
 * servicio `worker`), sin llevarse por delante el login ni las páginas públicas.
 *
 * Por eso el `unhandledRejection` de abajo SÍ mata el proceso sin matices, a diferencia
 * de la discusión que generó en `server.ts`: ahí el consejo no se puso de acuerdo porque
 * matar ese proceso apagaba también la API pública. Aquí el radio de la explosión es
 * solo este worker, así que "morir rápido y que Docker reinicie" vuelve a ser la
 * respuesta simple y correcta.
 *
 * Nada de HTTP: sin `app.listen`, sin `/health`, sin los limitadores (viven en
 * `rate-limit.middleware.ts`, que este archivo nunca importa). Docker no tiene una
 * sonda de vida para este servicio — ver la nota en `docker-compose.servidor.yml`—, así
 * que un cuelgue silencioso (no un crash) no se detecta solo; lo que sí se detecta es
 * una carga que nunca avanza de "procesando" en el panel.
 */
process.on('unhandledRejection', (reason) => {
  console.error('[worker] UNHANDLED REJECTION — crashing:', describirErrorParaLog(reason));
  process.exit(1);
});

const start = async () => {
  try {
    console.log('[worker] Connecting to database...');
    await sequelize.authenticate();
    console.log('[worker] Database connected.');

    // Misma comprobación que `server.ts`, y por la misma razón: un worker que arranca
    // contra un esquema viejo falla de formas difíciles de leer, no con un error claro.
    const pendientes = await listarPendientes();
    if (pendientes.length > 0) {
      throw new Error(
        `Hay ${pendientes.length} migración(es) sin aplicar: ${pendientes.join(', ')}. ` +
          'Ejecutar `npm run migrate` antes de arrancar.'
      );
    }
    console.log('[worker] Database schema up to date.');

    setupWorker();
    console.log(`[worker] Heavy-jobs worker started (${config.esProduccion ? 'production' : 'development'}).`);

    const apagar = async (senal: string) => {
      console.log(`[worker] ${senal} recibida — cerrando...`);
      // Espera a que el trabajo en curso termine (`Worker.close()`, dentro de
      // `cerrarCola`) en vez de cortarlo a medias: la misma razón por la que
      // `server.ts` ya hacía esto antes de este cambio.
      await cerrarCola();
      process.exit(0);
    };
    process.on('SIGTERM', () => void apagar('SIGTERM'));
    process.on('SIGINT', () => void apagar('SIGINT'));
  } catch (error) {
    console.error('[worker] Failed to start:', describirErrorParaLog(error));
    process.exit(1);
  }
};

start();
