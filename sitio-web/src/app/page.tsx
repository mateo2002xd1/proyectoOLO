import { ClientPuckRender } from '@/features/paginas/components/client-puck-render';
import { homeFallbackData } from '@/config/home-fallback-data';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function HomePage() {
  let data = homeFallbackData;
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const pageData = await res.json();
      if (pageData && pageData.contenido) {
        data = pageData.contenido;
      }
    }
  } catch {
    // If backend is down or page not found, keep fallback data
  }

  return (
    <div className="publico-layout min-h-screen flex flex-col">
      <main className="flex-grow">
        <ClientPuckRender data={data} />
      </main>
    </div>
  );
}
