import { notFound } from 'next/navigation';
import { ClientPuckRender } from '@/features/paginas/components/client-puck-render';
import EditButton from '@/features/paginas/components/edit-button';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function getPagina(slug: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pagina = await getPagina(slug);

  if (!pagina || !pagina.contenido) notFound();

  return (
    <div className="publico-layout relative min-h-screen flex flex-col">
      {/* Botón flotante para administradores (SSR-safe, valida cookies) */}
      <EditButton slug={slug} />

      <main className="flex-grow">
        <ClientPuckRender data={pagina.contenido} />
      </main>
    </div>
  );
}
