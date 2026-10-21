import { Metadata } from 'next';
import { RevisionQueueView } from '@/features/editor';

export const metadata: Metadata = {
  title: 'Páginas en revisión',
  description: 'Aprobar o rechazar borradores enviados por editores',
};

export default function RevisionPage() {
  return <RevisionQueueView />;
}
