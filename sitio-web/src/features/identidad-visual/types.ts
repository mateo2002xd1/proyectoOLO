export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface IdentidadVisual {
  govBannerEnabled: boolean;
  govBannerImageUrl?: string;
  mainLogoUrl?: string;
  intranetText: string;
  intranetUrl: string;
  navLinks: NavLink[];
}
