export { Header } from './blocks/Header';
export { Hero } from './blocks/Hero';
export { Services } from './blocks/Services';
export { ExternalPortals } from './blocks/ExternalPortals';
export { Footer } from './blocks/Footer';
export { IntranetTopbar } from './blocks/IntranetTopbar';
export { IntranetHero } from './blocks/IntranetHero';

// ─── Primitivos de maquetación para Puck (compartidos entre apps) ───
export {
  gridConfig,
  flexConfig,
  spaceConfig,
  primitiveComponents,
  PRIMITIVE_COMPONENT_NAMES,
} from './primitives/layout-primitives';

export type {
  Block,
  BlockType,
  BlockBase,
  HeaderBlock,
  HeroBlock,
  ServicesBlock,
  ExternalPortalsBlock,
  FooterBlock,
} from './types';
