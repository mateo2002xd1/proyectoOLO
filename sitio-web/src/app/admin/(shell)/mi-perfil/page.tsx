import { ProfileForm } from '@/features/mi-perfil/components/profile';

export const metadata = {
  title: 'Mi Perfil - Observatorio Laboral y Ocupacional',
};

export default function ProfilePage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <ProfileForm />
    </div>
  );
}
