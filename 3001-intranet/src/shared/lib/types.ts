export type BlockType = 'header' | 'hero' | 'services' | 'external-portals' | 'footer' | 'IntranetTopbar' | 'IntranetHero' | 'IntranetFooter';

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

export interface IntranetTopbarBlock extends BlockBase {
  type: 'IntranetTopbar';
}

export interface IntranetHeroBlock extends BlockBase {
  type: 'IntranetHero';
}

export interface IntranetFooterBlock extends BlockBase {
  type: 'IntranetFooter';
}

export type Block = HeaderBlock | HeroBlock | ServicesBlock | ExternalPortalsBlock | FooterBlock | IntranetTopbarBlock | IntranetHeroBlock | IntranetFooterBlock;
