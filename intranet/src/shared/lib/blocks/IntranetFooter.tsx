import type { IntranetFooterBlock } from '../types';

interface IntranetFooterProps {
  block?: IntranetFooterBlock;
}

export function IntranetFooter({ block }: IntranetFooterProps) {
  return (
    <footer className="intranet-footer" aria-label="Pie de pagina" data-block-id={block?.id}>
      <div className="intranet-footer-inner">
        <div className="intranet-footer-col intranet-footer-brand-col">
          <div className="intranet-footer-brand">
            <img
              src="/assets/svg/logo-sena.svg"
              alt="Logo Observatorio"
              width={56}
              height={56}
            />
            <span>|</span>
            <img
              src="/assets/svg/olo-logo-horizontal.svg"
              alt="Logo Observatorio"
              width={150}
              height={150}
            />
          </div>
        </div>

        <div className="intranet-footer-col">
          <h2>Observatorio Laboral y Ocupacional SENA</h2>
          <p>Direccion: Calle 57 No. 8 - 69 Bogota D.C. (Cundinamarca), Colombia.</p>
          <p>Horario de atencion: Lunes a viernes de 8:00 am a 5:30 pm</p>
          <p className="intranet-footer-social">@SENACOMUNICA  @SENATV</p>
        </div>

        <div className="intranet-footer-col">
          <h2>Contacto:</h2>
          <p>PBX (+57) 1 5461500 IP: 13037</p>
          <p>olaboryocupacional@sena.edu.co</p>
          <a href="#">Politica de seguridad y privacidad de la informacion</a>
          <a href="#">Politica de Tratamiento para Proteccion de Datos Personales</a>
          <a href="#">Mapa del sitio</a>
        </div>
      </div>
    </footer>
  );
}
