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
    <AuthSuccessScreen
      title="Tu contraseña se actualizó"
      subtitle="Ya puedes entrar a la intranet con tu nueva contraseña."
      loginLabel="Ir a iniciar sesión"
    />
  );
}
