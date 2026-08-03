import { redirect } from "next/navigation";

/**
 * Página raíz de la intranet.
 * La intranet NO tiene zona pública — toda ruta está protegida.
 * Se redirige al login como punto de entrada por defecto.
 *
 * @see 1-guia-del-proyecto.md §4.3
 */
export default function HomePage() {
  redirect("/auth");
}
