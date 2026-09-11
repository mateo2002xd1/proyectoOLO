'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  crearVigilanteDeInactividad,
  ModalInactividad,
  MOTIVO_INACTIVIDAD,
  MOTIVO_INACTIVIDAD_SIN_GUARDAR,
  type Vigilante,
} from '@olo/inactividad';
import { authApi } from '@/features/login/api/auth.api';

interface VigilanteSesionProps {
  /**
   * Si el reloj debe estar corriendo. Sirve para no empezar a contar mientras una
   * pantalla todavía se está montando, como el editor con su loader mínimo.
   */
  activo?: boolean;
  /**
   * Trabajo a rematar antes de cerrar — en el editor, guardar el borrador. Si lanza,
   * la sesión se cierra igual: dejar abierta una sesión inactiva porque un guardado
   * falló es el peor de los dos resultados. Se avisa en el login.
   */
  alExpirar?: () => Promise<void>;
}

/**
 * Cierra la sesión tras 15 minutos sin actividad, avisando un minuto antes.
 *
 * Gemelo del de `sitio-web`. El reloj y el modal vienen de `@olo/inactividad`, así que
 * las dos aplicaciones cuentan igual y muestran lo mismo; lo único propio es esto: a
 * qué se llama para cerrar y a dónde se va después.
 *
 * Se llama a `authApi.logout()` directamente en vez de al `logout` de `useAuth`: ese
 * hook verifica la sesión contra `/me` nada más montarse, y traerlo aquí añadiría una
 * petición por cada pantalla protegida solo para poder usar una de sus funciones.
 *
 * Recordatorio de lo que esto no es: quien robe la cookie no ejecuta este componente.
 * El cierre que de verdad cuenta lo hace la API comparando `ultimo_acceso_en`.
 */
export function VigilanteSesion({ activo = true, alExpirar }: VigilanteSesionProps) {
  const [msRestantes, setMsRestantes] = useState<number | null>(null);

  // En refs y no en dependencias del efecto: `alExpirar` cambia de identidad en cada
  // render del editor, y meterlo en las dependencias reiniciaría el reloj a cada
  // pulsación de tecla — con lo que la sesión no caducaría nunca.
  const alExpirarRef = useRef(alExpirar);
  alExpirarRef.current = alExpirar;

  const vigilanteRef = useRef<Vigilante | null>(null);
  const cerrandoRef = useRef(false);

  const cerrarSesion = useCallback(async (motivo: string) => {
    // Guardar y cerrar pueden dispararse a la vez desde el temporizador y desde el
    // botón; sin este pestillo se lanzarían dos cierres y dos navegaciones.
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;

    vigilanteRef.current?.detener();

    try {
      await authApi.logout();
    } catch {
      // Si la petición falla, la cookie sigue puesta y el servidor la rechazará por
      // inactividad de todos modos. Navegar es lo importante: deja de haber intranet.
    }

    // Dónde estaba parado cuando expiró, para volver ahí al reingresar. `pathname +
    // search` y no la URL completa: un `origin` distinto no tendría sentido después
    // de loguear.
    const ruta = `${window.location.pathname}${window.location.search}`;
    const destino = `/login?motivo=${motivo}&redirect=${encodeURIComponent(ruta)}`;

    // `window.location` y no `router.push`: hace falta que el navegador descarte el
    // árbol de React entero, y `replace` evita que «atrás» devuelva a una pantalla
    // que ya no tiene sesión detrás.
    window.location.replace(destino);
  }, []);

  const expirar = useCallback(async () => {
    if (cerrandoRef.current) return;

    let motivo = MOTIVO_INACTIVIDAD;
    try {
      await alExpirarRef.current?.();
    } catch {
      motivo = MOTIVO_INACTIVIDAD_SIN_GUARDAR;
    }
    await cerrarSesion(motivo);
  }, [cerrarSesion]);

  useEffect(() => {
    if (!activo) return;

    const vigilante = crearVigilanteDeInactividad({
      // Distinto del de sitio-web: en desarrollo comparten `localhost` y el
      // almacenamiento no separa por puerto, igual que las cookies.
      ambito: 'intranet',
      alAvisar: setMsRestantes,
      alCancelarAviso: () => setMsRestantes(null),
      alExpirar: () => {
        setMsRestantes(null);
        void expirar();
      },
    });

    vigilanteRef.current = vigilante;
    return () => {
      vigilante.detener();
      vigilanteRef.current = null;
    };
  }, [activo, expirar]);

  const seguir = useCallback(() => {
    setMsRestantes(null);
    vigilanteRef.current?.registrarActividad();
  }, []);

  return <ModalInactividad msRestantes={msRestantes} onSeguir={seguir} />;
}
