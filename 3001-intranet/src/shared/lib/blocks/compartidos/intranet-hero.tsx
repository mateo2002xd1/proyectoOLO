'use client';

interface IntranetHeroProps {
  imageSrc?: string;
  imageAlt?: string;
}

export function IntranetHero({
  imageSrc = '/assets/img/banner1.png',
  imageAlt = 'Banner principal de la intranet',
}: IntranetHeroProps) {
  return (
    <section className="intranet-hero" aria-label="Banner de la intranet">
      {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={imageAlt}
        width={1240}
        height={400}
        className="intranet-hero-banner"
      />
    </section>
  );
}
