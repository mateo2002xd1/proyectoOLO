import * as fs from 'fs';
import * as path from 'path';

/**
 * Convierte el HTML del esquema a PDF usando Puppeteer.
 * Instalación: npm install puppeteer
 */

async function convertirAPDF() {
  try {
    // Intentar cargar Puppeteer
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch {
      console.log('✗ Puppeteer no instalado.');
      console.log('\nOpciones:');
      console.log('1. Instala con: npm install puppeteer');
      console.log('2. O abre en Chrome/Edge y usa: Ctrl+P → Guardar como PDF');
      console.log('3. O instala: choco install wkhtmltopdf');
      console.log('   Luego: wkhtmltopdf esquema-diagrama.html esquema.pdf');
      process.exit(0);
    }

    const htmlPath = path.join(__dirname, '../../esquema-diagrama.html');
    const pdfPath = path.join(__dirname, '../../esquema-diagrama.pdf');

    if (!fs.existsSync(htmlPath)) {
      console.error(`✗ Archivo no encontrado: ${htmlPath}`);
      process.exit(1);
    }

    console.log('📄 Convirtiendo HTML a PDF...');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true
    });

    await browser.close();

    console.log(`✓ PDF generado: ${pdfPath}`);
    console.log(`  Tamaño: ${(fs.statSync(pdfPath).size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

convertirAPDF();
