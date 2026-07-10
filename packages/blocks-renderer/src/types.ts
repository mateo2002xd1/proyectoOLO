export type BlockType = 'header' | 'hero' | 'services' | 'external-portals' | 'footer';

export interface BlockBase {
  id: string;
  type: BlockType;
}

export interface HeaderBlock extends BlockBase {
  type: 'header';
}

export interface HeroBlock extends BlockBase {
  type: 'hero';
}

export interface ServicesBlock extends BlockBase {
  type: 'services';
}

export interface ExternalPortalsBlock extends BlockBase {
  type: 'external-portals';
}

export interface FooterBlock extends BlockBase {
  type: 'footer';
}

export type Block = HeaderBlock | HeroBlock | ServicesBlock | ExternalPortalsBlock | FooterBlock;
