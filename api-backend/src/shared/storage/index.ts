// Shared - Storage
// Stub: Implementar para manejo de archivos

export const storage = {
  upload: async (file: Buffer, path: string) => ({ url: '' }),
  download: async (path: string) => Buffer.from(''),
  delete: async (path: string) => {},
};
