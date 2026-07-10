import { Header } from './blocks/Header';
import { Hero } from './blocks/Hero';
import { ExternalPortals } from './blocks/ExternalPortals';
import { Footer } from './blocks/Footer';
import { Services } from './blocks/Services';
import type { BlockType } from './types';

export const blockRegistry: Record<BlockType, React.ComponentType<any>> = {
  'header': Header,
  'hero': Hero,
  'external-portals': ExternalPortals,
  'footer': Footer,
  'services': Services,
};
