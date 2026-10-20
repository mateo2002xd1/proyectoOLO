import { useState } from 'react';

/**
 * Cuándo se ve la lista de requisitos de una contraseña nueva en el diseño nuevo del
 * acceso: al entrar en el campo, o si ya tiene algo (lo rellenó el navegador), y desde
 * entonces siempre.
 *
 * Los mockups no la muestran en reposo, pero descubrir las reglas a base de rechazos es
 * la forma segura de que alguien abandone. Si se ocultara al salir del campo, la tarjeta
 * encogería justo cuando se pulsa el de abajo y el clic caería en otro sitio.
 *
 * La usan el primer ingreso y la contraseña nueva de la recuperación.
 */
export function useRequisitosAlEnfocar(password: string) {
  const [enfocado, setEnfocado] = useState(false);
  return { visibles: enfocado || password !== '', alEnfocar: () => setEnfocado(true) };
}
