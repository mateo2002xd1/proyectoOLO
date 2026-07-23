import { GooLoader } from '@/shared/ui/atoms/GooLoader';

export default function EditorLoading() {
  return (
    <div className="editor-loading-overlay">
      <GooLoader label="Cargando editor..." />
    </div>
  );
}
