## sesión 20-07-2026:
1. Limpieza y Reestructuración en sitio-web (App Router y Feature-Sliced)
### Consolidación de Rutas Públicas:
- Se eliminó el page.tsx suelto en la raíz que tenía lógica pesada y colisionaba.
- Se movió la lógica a src/app/(public)/page.tsx para respetar el enrutamiento limpio.
- Se movió la ruta dinámica de Puck src/app/[slug]/page.tsx hacia src/app/(public)/[slug]/page.tsx.
### Saneamiento de Componentes y Estilos:
- Se eliminaron los componentes duplicados sueltos en src/shared/ui que ya estaban correctamente ubicados dentro de atoms/, molecules/ y organisms/.
- Se eliminó la carpeta obsoleta src/styles (y su auth-loader.module.css que no se utilizaba).
### Limpieza General:
- Se eliminaron múltiples layouts y vistas deprecadas (como src/app/panel-general, src/features/paginas, src/components/, etc.) que ya habían sido migradas a features/.
2. Cumplimiento de Clean Architecture en api-backend
### Nuevos Repositorios (Data Access):
- Se creó pagina.repository.ts para aislar las consultas a los modelos Sequelize de las páginas (antes los use-cases tocaban la BD directamente, lo cual violaba la arquitectura).
- Se renombró paginas.repository.ts a contenido.repository.ts (ya que realmente manejaba el modelo de Contenidos/Posts).
### Refactorización de Nomenclatura (Posts → Contenidos):
- Se renombraron los modelos, rutas, controladores y casos de uso de "Posts" a "Contenidos" (Contenido.ts, contenido.controller.ts, contenido.routes.ts, contenido.usecase.ts) para alinear el backend con el lenguaje del dominio (Ubiquitous Language).
### Separación de Casos de Uso (Use Cases):
- Se independizaron los casos de uso en las carpetas correctas: /paginas (para la gobernanza de Puck) y /contenidos (para adjuntos, secciones e informes).
### Delegación de Controladores:
- Se movió la lógica de colas BullMQ desde las rutas hacia el nuevo trabajos.controller.ts, garantizando que las rutas (.routes.ts) sigan siendo archivos con "cero lógica".
### Consolidación de la Documentación (Raíz del Proyecto):
- Se reescribieron e integraron las reglas clave arquitectónicas directamente en 1-guia-del-proyecto.md, 2-convenciones-del-proyecto.md, etc., eliminando los archivos duplicados o desactualizados (guia-del-proyecto.md, SEGURIDAD_OLO.md, CONVENCIONES_CODIGO_OLO.md).
- Se detalló formalmente en la documentación la dependencia unidireccional del backend y el concepto de rutas "delgadas" para Next.js.
- Todo quedó respaldado en GitHub bajo el mensaje: "Refactor: Limpieza de sitio-web y api-backend, consolidación de docs"