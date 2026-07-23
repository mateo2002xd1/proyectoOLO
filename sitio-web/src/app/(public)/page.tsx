import { ClientPuckRender, obtenerPaginaInicio } from '@/features/paginas';

export default async function HomePage() {
  const data = await obtenerPaginaInicio();

  return <ClientPuckRender data={data} />;
}