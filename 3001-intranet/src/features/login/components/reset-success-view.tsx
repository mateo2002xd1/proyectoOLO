'use client';

import { useEffect } from 'react';
import { AuthSuccessScreen } from './auth-success-screen';

export function ResetSuccessView() {
  useEffect(() => {
    sessionStorage.removeItem('recoveryEmail');
    sessionStorage.removeItem('recoveryQuestions');
    sessionStorage.removeItem('recoveryAnswers');
    sessionStorage.removeItem('recoveryName');
  }, []);

  return (
    // Textos del usuario (2026-10-12): el título a la izquierda y, desde `md`, los dos
    // párrafos dentro de la tarjeta blanca, sin la insignia del check. Antes, «Tu contraseña se
    // actualizó» y «Ya puedes entrar a la intranet con tu nueva contraseña.».
    <AuthSuccessScreen
      title="¡Genial, tu clave ha sido actualizada con éxito!"
      subtitle={[
        'Ya puedes ingresar a tu cuenta con tu nueva contraseña.',
        '¡Tu seguridad es nuestra prioridad!',
      ]}
      loginLabel="Ir a iniciar sesión"
      enBlanco
      descripcionEnTarjeta
      conInsignia={false}
    />
  );
}
