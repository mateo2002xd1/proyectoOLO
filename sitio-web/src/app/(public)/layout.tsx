import { Header, Footer } from '@olo/blocks-renderer';
import { obtenerIdentidadVisual } from '@/features/identidad-visual';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const identidad = await obtenerIdentidadVisual();

  return (
    <div className="publico-layout min-h-screen flex flex-col">

      <Header block={{ id: 'header-fijo', type: 'header' }} {...identidad} />
      <main className="flex-grow">{children}</main>
      <Footer block={{ id: 'footer-fijo', type: 'footer' }} />
    </div>
  );
}
