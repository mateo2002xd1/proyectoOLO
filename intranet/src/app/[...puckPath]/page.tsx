import fs from 'fs';
import path from 'path';
import { EditButton } from "@/features/paginas";
import { ClientPuckRender } from '@/features/paginas/components/client-puck-render';

export default async function PaginaDinamica({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const slug = puckPath.join('/');

  const dataDir = path.join(process.cwd(), 'data', 'pages');
  const filePath = path.join(dataDir, `${slug}.json`);

  let data = null;
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  if (!data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <p>No se ha publicado contenido para la ruta: /{slug}</p>
      </div>
    );
  }

  return (
    <div className="pagina-slug">
      <EditButton slug={slug} hasPermission={true} />
      <ClientPuckRender data={data} />
    </div>
  );
}
