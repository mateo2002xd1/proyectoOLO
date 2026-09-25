'use client';

import React from 'react';

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
