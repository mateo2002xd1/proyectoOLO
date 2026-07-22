import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';

export function InicioView() {
  return (
    <main className="intranet-home">
      <IntranetTopbarWrapper />

      <IntranetHero />

      <section className="intranet-construction" aria-label="Contenido principal">
        <h1 className="intranet-construction-title">
          <span>Inicio</span> en construccion
        </h1>
      </section>

      {/* @ts-ignore - Bypass strict typing for static use case */}
      <IntranetFooter block={{ id: 'footer-1' }} />
    </main>
  );
}
