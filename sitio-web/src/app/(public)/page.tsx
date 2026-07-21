import { ClientPuckRender } from '@/features/paginas/components/client-puck-render';
import { homeFallbackData } from '@/features/paginas/lib/home-fallback-data';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function HomePage() {
  let data = homeFallbackData;
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000), // 5s max — never block the homepage
    });
    if (res.ok) {
      const pageData = await res.json();
      if (pageData && pageData.contenido) {
        if (typeof pageData.contenido === 'string') {
          try {
            data = JSON.parse(pageData.contenido);
          } catch (e) {
            console.error('Failed to parse pageData.contenido', e);
            data = homeFallbackData;
          }
        } else {
          data = pageData.contenido;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch home page data:', err);
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