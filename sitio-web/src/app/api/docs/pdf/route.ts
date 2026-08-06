import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para servir los PDFs de CompromISO SENA desde el mismo origen.
 *
 * Problema: compromiso.sena.edu.co bloquea el embed en iframes externos:
 *   Content-Security-Policy: frame-ancestors 'self'
 *
 * Solución: este proxy reproduce el flujo que hace el navegador dentro de
 * los dominios SENA:
 *   1. Visita descarga.php?id=X → obtiene la sesión PHP (PHPSESSID).
 *   2. Usa esa sesión para descargar el PDF desde su URL directa en /documentos/docs_pdf/.
 *   3. Retorna el PDF desde el propio origen del sitio OLO (sin frame-ancestors).
 *
 * Uso:  GET /api/docs/pdf?id=6701
 */

const COMPROMISO_BASE = 'https://compromiso.sena.edu.co';

/**
 * Lista blanca de IDs → ruta del PDF dentro de compromiso.sena.edu.co.
 * Evita SSRF y facilita la actualización cuando CompromISO cambie la URL del archivo.
 */
const PDF_MAP: Record<string, string> = {
  '6701': '/documentos/docs_pdf/1739471996_GOR-POL-001PoliticadeSeguridadyPrivacidaddelaInformacionV02.docx.pdf',
  '6914': '/documentos/docs_pdf/1753114406_GOR-POL-006_Politica_de_Proteccion_Datos_Personales_V2_(1).docx.pdf',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id') ?? '';

  const pdfPath = PDF_MAP[id];
  if (!pdfPath) {
    return new NextResponse('ID de documento no válido.', { status: 400 });
  }

  try {
    // ── Paso 1: obtener la sesión PHP visitando el visor ──────────────────────
    const viewerRes = await fetch(
      `${COMPROMISO_BASE}/mapa/descarga.php?id=${id}`,
      {
        redirect: 'follow',
        headers: { 'User-Agent': UA },
      },
    );

    // Recopilar cookies de sesión (set-cookie puede ser uno o varios valores)
    const setCookieHeader = viewerRes.headers.get('set-cookie') ?? '';
    // Mantener solo la parte "nombre=valor" de cada cookie
    const cookieHeader = setCookieHeader
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');

    // ── Paso 2: descargar el PDF con la sesión obtenida ───────────────────────
    const pdfRes = await fetch(`${COMPROMISO_BASE}${pdfPath}`, {
      redirect: 'follow',
      headers: {
        Cookie: cookieHeader,
        Referer: `${COMPROMISO_BASE}/mapa/descarga.php?id=${id}`,
        'User-Agent': UA,
      },
    });

    if (!pdfRes.ok || !pdfRes.body) {
      console.error(
        `[api/docs/pdf] CompromISO devolvió ${pdfRes.status} para id=${id}`,
      );
      return new NextResponse('No se pudo obtener el documento.', {
        status: 502,
      });
    }

    const contentType =
      pdfRes.headers.get('content-type') ?? 'application/pdf';

    if (!contentType.includes('application/pdf')) {
      console.error(
        `[api/docs/pdf] Content-Type inesperado "${contentType}" para id=${id}`,
      );
      return new NextResponse('El recurso no es un PDF válido.', {
        status: 502,
      });
    }

    // ── Paso 3: retornar el PDF desde el mismo origen (sin frame-ancestors) ───
    return new NextResponse(pdfRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        // Cache 1 hora — los docs de CompromISO son estáticos
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (err) {
    console.error('[api/docs/pdf] Error al obtener el PDF de CompromISO:', err);
    return new NextResponse('Error interno al obtener el documento.', {
      status: 500,
    });
  }
}
