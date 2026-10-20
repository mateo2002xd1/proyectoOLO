import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

/** Se muestra dentro del panel mientras carga cualquier sección de `/admin-panel`. */
export default function AdminLoading() {
  return <CargandoSeccion label="Cargando sección..." />;
}
