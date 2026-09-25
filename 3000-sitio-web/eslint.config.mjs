import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // El prefijo `_` marca un parámetro o variable deliberadamente sin usar
      // (p. ej. un argumento que la firma pública mantiene por compatibilidad).
      // Sin esto, la convención no tiene efecto y obliga a borrar la firma.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Los bloques de Puck se pintan dentro del lienzo del editor, no solo en el sitio
    // publicado. Ahí un `<Link>` navegaría del lado del cliente y se llevaría por
    // delante el editor entero con el borrador sin guardar; el `<a href>` recarga, que
    // dentro del editor es el fallo seguro. Es deliberado en los 14 bloques.
    // Si algún día se quiere navegación rápida en el sitio público, el arreglo no es
    // quitar esta excepción sino que el bloque consulte el modo edición de Puck y elija.
    files: ["src/shared/lib/blocks/**/*.tsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
