'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  crearVigilanteDeInactividad,
  ModalInactividad,
  MOTIVO_INACTIVIDAD,
  MOTIVO_INACTIVIDAD_SIN_GUARDAR,
  type Vigilante,
} from '@olo/inactividad';

interface VigilanteSesionProps {
  /**
   * Si el reloj debe estar corriendo. Sirve para no empezar a contar mientras una
   * pantalla todavía se está montando: el editor de páginas tarda ocho segundos en
   * aparecer (`MIN_LOADER_MS`), y contarlos como inactividad le robaría ese tiempo a
   * quien acaba de abrirlo.
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
 * Se monta una vez por árbol de rutas protegido. El reloj y la detección de actividad
 * viven en `@olo/inactividad`, compartidos con la intranet; aquí solo está lo propio de
 * esta aplicación: a qué endpoint se llama para cerrar y a dónde se va después.
 *
 * Recordatorio de lo que esto no es: quien robe la cookie no ejecuta este componente.
 * El cierre que de verdad cuenta lo hace la API comparando `ultimo_acceso_en`.
 */
export function VigilanteSesion({ activo = true, alExpirar }: VigilanteSesionProps) {
  const [msRestantes, setMsRestantes] = useState<number | null>(null);

  // En refs y no en dependencias del efecto: `alExpirar` cambia de identidad en cada
  // render del editor, y meterlo en las dependencias reiniciaría el reloj a cada
  // pulsación de tecla — con lo que la sesión no caducaría nunca.
  //
  // La asignación va dentro de un efecto y no suelta en el cuerpo del componente:
  // escribir una ref durante el render rompe las garantías de React (`react-hooks/refs`)
  // y con renderizado concurrente puede quedarse con el valor de un render descartado.
  // Aquí es seguro hacerlo después del pintado porque `alExpirarRef.current` solo se
  // lee dentro de `expirar()`, que corre desde el temporizador y nunca durante el render.
  const alExpirarRef = useRef(alExpirar);
  useEffect(() => {
    alExpirarRef.current = alExpirar;
  }, [alExpirar]);

  const vigilanteRef = useRef<Vigilante | null>(null);
  const cerrandoRef = useRef(false);

  const cerrarSesion = useCallback(async (motivo: string) => {
    // Guardar y cerrar pueden dispararse a la vez desde el temporizador y desde el
    // botón; sin este pestillo se lanzarían dos cierres y dos navegaciones.
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;

    vigilanteRef.current?.detener();

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Si la petición falla, la cookie sigue puesta y el servidor la rechazará por
      // inactividad de todos modos. Navegar es lo importante: deja de haber panel.
    }

    // Dónde estaba parado cuando expiró, para volver ahí al reingresar. El login ya
    // sabe leer `redirect` (lo usa quien entra desde un enlace protegido); esto solo
    // lo alimenta también para el cierre por inactividad. `pathname + search` y no
    // la URL completa: un `origin` distinto no tendría sentido después de loguear.
    const ruta = `${window.location.pathname}${window.location.search}`;
    const destino = `/login?motivo=${motivo}&redirect=${encodeURIComponent(ruta)}`;

    // `replace` y no `push`: el botón «atrás» no debe devolver a una pantalla del
    // panel que ya no tiene sesión detrás.
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
      ambito: 'sitio',
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
