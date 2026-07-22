import { AuthSuccessScreen } from './AuthSuccessScreen';

export function ResetSuccessView() {
  return (
    <AuthSuccessScreen
      title="¡Genial, tu clave ha sido actualizada con éxito!"
      subtitle="Ya puedes ingresar a tu cuenta con tu nuevo código de acceso."
      hint="¡Tu seguridad es nuestra prioridad!"
    />
  );
}
