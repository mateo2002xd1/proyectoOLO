/** Icono de /assets/svg tintado con el color del texto (el SVG solo aporta la forma). */
export function IconoMascara({ nombre, tamano = 'h-4 w-4' }: { nombre: string; tamano?: string }) {
  const url = `url(/assets/svg/${nombre}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${tamano} shrink-0 bg-current`}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}
