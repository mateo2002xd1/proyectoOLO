import { InicioView } from '@/features/sitio-web/inicio';
import { obtenerPaginaInicio } from '@/features/paginas';

export default async function HomePage() {
  const data = await obtenerPaginaInicio();

  return <InicioView data={data} />;
}
