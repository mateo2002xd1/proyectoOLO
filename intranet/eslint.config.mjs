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
    // Los bloques de Puck se pintan dentro del lienzo del editor, no solo en la página
    // publicada. Ahí un `<Link>` navegaría del lado del cliente y se llevaría por
    // delante el editor entero con el borrador sin guardar; el `<a href>` recarga, que
    // dentro del editor es el fallo seguro.
    // Va también aquí, y no solo en `sitio-web`, porque §8 de
    // 2-convenciones-del-proyecto.md exige que las dos configs no diverjan.
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
