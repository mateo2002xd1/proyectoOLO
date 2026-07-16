import { Header } from './blocks/Header';
import { Hero } from './blocks/Hero';
import { Services } from './blocks/Services';
import { ExternalPortals } from './blocks/ExternalPortals';
import { Footer } from './blocks/Footer';
import type { BlockType } from './types';

import { IntranetTopbar } from './blocks/IntranetTopbar';
import { IntranetHero } from './blocks/IntranetHero';

export const blockRegistry: Record<BlockType, React.ComponentType<{ block: { id: string; type: BlockType } }>> = {
  'header': Header,
  'hero': Hero,
  'services': Services,
  'external-portals': ExternalPortals,
  'footer': Footer,
  'IntranetTopbar': IntranetTopbar as any,
  'IntranetHero': IntranetHero as any,
};
