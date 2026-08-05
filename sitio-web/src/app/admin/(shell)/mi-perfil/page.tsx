import { ProfileForm } from '@/features/profile';

export const metadata = {
  title: 'Mi Perfil - Observatorio Laboral y Ocupacional',
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <ProfileForm />
    </main>
  );
}
