import { ProfileForm } from '@/features/admin-panel/profile/components/profile';

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
