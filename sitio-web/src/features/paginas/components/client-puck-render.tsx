'use client';

import { Render } from '@puckeditor/core';
import { puckConfig } from '@/config/puck.config';
import { Data } from '@puckeditor/core';

export function ClientPuckRender({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />;
}
