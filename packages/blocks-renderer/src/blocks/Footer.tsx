import type { FooterBlock } from '../types';

interface FooterProps {
  block: FooterBlock;
}

export function Footer({ block }: FooterProps) {
  return (
    <>
      <footer className="olo-footer-wrapper" id="main-footer" role="contentinfo" data-block-id={block.id}>
        <div className="olo-footer-card">
          <div className="olo-logos-top">
            <div className="olo-logos-left">
              <img src="/ruta-logo-sena.png" alt="Logo SENA" className="olo-logo" />
              <img src="/ruta-logo-observatorio.png" alt="Logo Observatorio Laboral y Ocupacional" className="olo-logo" />
            </div>
            <div className="olo-logos-right">
              <img src="/ruta-logo-mintrabajo.png" alt="Logo Ministerio de Trabajo" className="olo-logo" />
            </div>
          </div>

          <div className="olo-content-blocks">
            <div className="olo-block">
              <h3 className="olo-title-main">Servicio Nacional de Aprendizaje SENA</h3>
              <p className="olo-text">Direccion: Calle 57 No. 8 - 69 Bogota D.C. (Cundinamarca), Colombia.</p>
              <p className="olo-text">El SENA brinda a la ciudadania, atencion presencial en las 33 Regionales y 118 Centros de Formacion</p>
              <a href="#" className="olo-link">Conozca aqui los puntos de atencion</a>
            </div>

            <div className="olo-block">
              <h4 className="olo-title">Linea de WhatsApp:</h4>
              <p className="olo-text">3112545028</p>
            </div>

            <div className="olo-block">
              <h4 className="olo-title">Lineas de atencion al ciudadanos, empresarios y linea PQRS:</h4>
              <p className="olo-text">Bogota +(57) 601 736 60 60 - Linea gratuita y resto del pais 018000 910270</p>
            </div>

            <div className="olo-block">
              <h4 className="olo-title">Mesa de ayuda:</h4>
              <p className="olo-text">PBX (+57) 1 5461500 IP: 13037</p>
              <p className="olo-text">olaboralyocupacional@sena.edu.co</p>
            </div>

            <div className="olo-block">
              <h4 className="olo-title">Horario de atencion:</h4>
              <p className="olo-text">Lunes a viernes de 8:00 am a 5:30 pm</p>
            </div>
          </div>

          <div className="olo-social-and-certs">
            <div className="olo-social-links">
              <div className="olo-social-item">
                <img src="/ruta-icono-x.png" alt="X" className="olo-social-icon" />
                <span className="olo-social-text">@SENAComunica</span>
              </div>
              <div className="olo-social-item">
                <img src="/ruta-icono-instagram.png" alt="Instagram" className="olo-social-icon" />
                <span className="olo-social-text">@senacomunica</span>
              </div>
              <div className="olo-social-item">
                <img src="/ruta-icono-youtube.png" alt="YouTube" className="olo-social-icon" />
                <span className="olo-social-text">@SENATV</span>
              </div>
              <div className="olo-social-item">
                <img src="/ruta-icono-linkedin.png" alt="LinkedIn" className="olo-social-icon" />
                <span className="olo-social-text">@SENA</span>
              </div>
              <div className="olo-social-item">
                <img src="/ruta-icono-facebook.png" alt="Facebook" className="olo-social-icon" />
                <span className="olo-social-text">@SENA</span>
              </div>
              <div className="olo-social-item">
                <img src="/ruta-icono-soundcloud.png" alt="SoundCloud" className="olo-social-icon" />
                <span className="olo-social-text">@senacolombia</span>
              </div>
            </div>

            <div className="olo-certifications">
              <img src="/ruta-logo-cert-1.png" alt="Certificacion 1" className="olo-cert-icon" />
              <img src="/ruta-logo-cert-2.png" alt="Certificacion 2" className="olo-cert-icon" />
              <img src="/ruta-logo-cert-3.png" alt="Certificacion 3" className="olo-cert-icon" />
              <img src="/ruta-logo-cert-4.png" alt="Certificacion 4" className="olo-cert-icon" />
              <img src="/ruta-logo-iqnet.png" alt="IQNET" className="olo-cert-icon" />
            </div>
          </div>

          <div className="olo-bottom-links">
            <div className="olo-links-row">
              <a href="#">Directorio SENA</a>
              <a href="#">Chat en linea</a>
              <a href="#">Notificaciones judiciales</a>
              <a href="#">Terminos y condiciones del portal web</a>
            </div>
            <div className="olo-links-row">
              <a href="#">Derechos de autor y/o autorizacion de uso sobre contenidos</a>
              <a href="#">Politica de Tratamiento para Proteccion de Datos Personales</a>
            </div>
            <div className="olo-links-row">
              <a href="#">Mapa del sitio</a>
              <a href="#">Politica de seguridad y privacidad de la informacion</a>
            </div>
          </div>
        </div>
      </footer>
      <div className="olo-gov-banner-bottom">
        <img src="/ruta-co-colombia.png" alt="CO Colombia" className="olo-co-logo" />
      </div>
    </>
  );
}
