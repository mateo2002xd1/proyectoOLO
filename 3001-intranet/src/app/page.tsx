import { redirect } from "next/navigation";
import { obtenerSesion } from "@/shared/lib/session/sesion";

/**
 * Página raíz de la intranet.
 * La intranet NO tiene zona pública — toda ruta está protegida.
 *
 * El botón "Intranet" del sitio público apunta aquí sin saber si hay sesión
 * (la cookie `token` es httpOnly, no la puede leer). Por eso la decisión se
 * toma acá: con sesión activa vamos directo a `/inicio`; sin ella, a `/login`.
 *
 * @see 1-guia-del-proyecto.md §4.3
 */
export default async function HomePage() {
  const sesion = await obtenerSesion();
  redirect(sesion ? "/inicio" : "/login");
}
