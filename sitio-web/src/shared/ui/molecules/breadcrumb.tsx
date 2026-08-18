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
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#667085]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = Boolean(item.href) && !isLast;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-[#98a2b3]">
                  /
                </span>
              )}
              {!isLink ? (
                <span className="font-medium text-[#344054]" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-brand-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus focus-visible:ring-offset-2"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
