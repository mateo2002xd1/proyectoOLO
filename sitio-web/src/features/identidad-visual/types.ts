export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  /** Submenú desplegable. Si trae elementos, el enlace se pinta como un dropdown. */
  children?: NavLink[];
}

export interface IdentidadVisual {
  govBannerEnabled: boolean;
  govBannerImageUrl?: string;
  mainLogoUrl?: string;
  intranetText: string;
  intranetUrl: string;
  navLinks: NavLink[];
}
