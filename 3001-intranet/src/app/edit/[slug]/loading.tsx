import { GooLoader } from '@/shared/ui/atoms/goo-loader';

export default function EditorLoading() {
  return (
    <div className="editor-loading-overlay">
      <GooLoader label="Cargando editor..." />
    </div>
  );
}
