/**
 * Publica la página de política de privacidad del sitio web (`politica-de-privacidad`).
 *
 * Hasta esta siembra el contenido vivía hardcodeado en
 * `PoliticaPrivacidadView` (sitio-web) y se servía bajo dos rutas
 * (`/politica-de-privacidad` y `/privacidad`, alias sin contenido propio).
 * Ahora es una sección de fábrica más (ver `SECCIONES_POR_AMBITO.sitio` en
 * `catalogo-permisos.ts`), con sus tres bloques Puck
 * (`PoliticaPrivacidadEncabezado`, `VisorDocumentosNormativos`,
 * `CanalesAtencion`) y este script pone en la base exactamente el mismo texto
 * que antes estaba en el JSX, para que el día que se publique no cambie nada
 * a simple vista.
 *
 * Recorre el ciclo editorial real (borrador → revisión → aprobación) en
 * lugar de insertar filas a mano, igual que `sembrar-inicio-sitio.ts`: así la
 * versión queda registrada en la bitácora de RF-07 como cualquier otra.
 *
 * Es idempotente: volver a ejecutarlo publica una versión nueva con el mismo
 * contenido y archiva la anterior.
 *
 *   npm run sembrar:politica-privacidad:sitio
 */
import 'dotenv/config';
import sequelize from '../src/config/database';
import { guardarBorrador } from '../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../src/use-cases/paginas/aprobar-pagina.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';

const AMBITO = 'sitio' as const;
const SLUG = 'politica-de-privacidad';

const CONTENIDO_POLITICA_PRIVACIDAD = {
  content: [
    {
      type: 'PoliticaPrivacidadEncabezado',
      props: {
        id: 'politica-encabezado-static',
        titulo: 'Políticas de Seguridad, Privacidad y Tratamiento de Datos',
        intro:
          '<p>El <strong>Servicio Nacional de Aprendizaje SENA</strong>, a través del <strong>Observatorio Laboral y Ocupacional</strong>, dispone para consulta ciudadana los lineamientos oficiales de la Política de Seguridad y Privacidad de la Información y la Política de Tratamiento para Protección de Datos Personales, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Sistema de Gestión CompromISO.</p><p>A continuación, seleccione el documento normativo que desea consultar para leerlo directamente en formato PDF o descargar una copia oficial.</p>',
      },
    },
    {
      type: 'VisorDocumentosNormativos',
      props: {
        id: 'visor-documentos-static',
        titulo: 'Documentos y Recursos Normativos Oficiales',
        documentos: [
          {
            etiquetaTab: '1. Seguridad y Privacidad (ID: 6701)',
            titulo: 'Política de Seguridad y Privacidad de la Información',
            descripcion:
              'Documento oficial del Sistema Integrado de Gestión y Autocontrol CompromISO SENA. Lineamientos de seguridad digital y confidencialidad institucional.',
            documentoId: '6701',
          },
          {
            etiquetaTab: '2. Tratamiento de Datos (ID: 6914)',
            titulo: 'Política de Tratamiento para Protección de Datos Personales',
            descripcion:
              'Régimen y garantías institucionales para el tratamiento, protección de datos personales y ejercicio de derechos de Habeas Data conforme a la Ley 1581 de 2012.',
            documentoId: '6914',
          },
        ],
      },
    },
    {
      type: 'CanalesAtencion',
      props: {
        id: 'canales-atencion-static',
        titulo: 'Canales de Atención y Ejercicio de Derechos (Habeas Data)',
        intro:
          '<p>Para ejercer sus derechos de conocer, actualizar, rectificar o suprimir sus datos personales, o para presentar cualquier consulta o reclamo relativo a la protección de datos, el SENA pone a disposición los siguientes canales oficiales:</p>',
        canales: [
          { etiqueta: 'Correo Electrónico', valor: 'servicioalciudadano@sena.edu.co' },
          { etiqueta: 'Línea Gratuita Nacional', valor: '01 8000 910270 • (601) 343 0111' },
          { etiqueta: 'Dirección General', valor: 'Calle 57 No. 8 - 69, Bogotá D.C.' },
          { etiqueta: 'Tiempos de Respuesta', valor: '10 a 15 días hábiles (Ley 1581)' },
        ],
      },
    },
  ],
  root: {
    props: {},
  },
  zones: {},
};

const publicarPoliticaPrivacidad = async (): Promise<void> => {
  await guardarBorrador(SLUG, CONTENIDO_POLITICA_PRIVACIDAD, '', AMBITO);
  await enviarARevision(SLUG, '', AMBITO);
  await aprobarPagina(SLUG, '', AMBITO);

  const guardada = await PaginaRepository.findBySlug(SLUG, AMBITO);
  if (!guardada?.versionPublicadaId) {
    throw new Error('La página de política de privacidad quedó sin versión publicada.');
  }

  const bloques = CONTENIDO_POLITICA_PRIVACIDAD.content.map((b) => b.type).join(', ');
  console.log(`  ✓ ${SLUG} — publicada con ${CONTENIDO_POLITICA_PRIVACIDAD.content.length} bloques: ${bloques}`);
};

const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();
  console.log(`Política de privacidad del sitio web:`);
  await publicarPoliticaPrivacidad();
};

sembrar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
