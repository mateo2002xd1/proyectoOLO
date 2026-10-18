import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  /** Si no trae `href`, el ítem se pinta como el actual (no es un enlace). */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Ruta de navegación (breadcrumb) siguiendo el patrón WAI-ARIA APG: `nav`
 * rotulado + lista ordenada, separadores decorativos fuera del texto de los
 * enlaces, y el último ítem como texto plano con `aria-current="page"` en vez
 * de un enlace a la página en la que ya se está.
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className={className}>
      {/* Todo en #001145: la página actual en negrita y a tono pleno; lo demás en letra fina
          y más suave (#001145 al 70 %, unos 7:1 sobre blanco, holgado para AA). Sin
          subrayado, a pedido del usuario (2026-10-18): el enlace se distingue por el peso. */}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-light text-[#001145]/70">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = Boolean(item.href) && !isLast;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-[#001145]/40">
                  /
                </span>
              )}
              {!isLink ? (
                <span
                  className={isLast ? 'font-bold text-[#001145]' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                // `Link` y no `<a>`: desde que las migas van en todo el sitio, volver a una
                // sección no recarga la página entera.
                <Link
                  href={item.href!}
                  className="rounded-sm transition-colors hover:text-[#001145] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus focus-visible:ring-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
