'use client';

import { Puck } from '@puckeditor/core';
import { puckConfig } from '@/config/puck.config';
import { use, useEffect, useState } from 'react';
import '@puckeditor/core/dist/index.css';

export default function EditorPage({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = use(params);
  const slugPath = puckPath.join('/');
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/editor/${slugPath}`)
      .then((res) => res.json())
      .then((data) => {
        if (Object.keys(data).length === 0) {
          setInitialData({});
        } else {
          setInitialData(data);
        }
      })
      .catch(() => setInitialData({}));
  }, [slugPath]);

  const handlePublish = async (data: any) => {
    try {
      await fetch(`/api/editor/${slugPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      alert('Página guardada con éxito.');
    } catch (error) {
      alert('Error al guardar la página.');
    }
  };

  if (!initialData) return <div>Cargando editor...</div>;

  return (
    <Puck
      config={puckConfig}
      data={initialData}
      onPublish={handlePublish}
    />
  );
}
