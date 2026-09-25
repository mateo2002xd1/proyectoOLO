export type BlockType = 'header' | 'hero' | 'external-portals' | 'footer' | 'services';

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

export interface ExternalPortalsBlock extends BlockBase {
  type: 'external-portals';
}

export interface FooterBlock extends BlockBase {
  type: 'footer';
}

export interface ServicesBlock extends BlockBase {
  type: 'services';
}

export type Block = HeaderBlock | HeroBlock | ExternalPortalsBlock | FooterBlock | ServicesBlock;
