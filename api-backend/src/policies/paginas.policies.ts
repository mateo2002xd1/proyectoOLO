// Policies - Paginas
// Stub: Implementar según §2 (Mapeo definitivo de roles)
// Roles: administrador, editor, director

export const paginasPolicies = {
  puedeVer: (rol: string) => {
    return ['superadmin', 'administrador', 'editor', 'director', 'subdirector'].includes(rol);
  },

  puedeEditar: (rol: string) => {
    return ['superadmin', 'administrador', 'editor'].includes(rol);
  },

  puedePublicar: (rol: string) => {
    return ['superadmin', 'administrador'].includes(rol);
  },

  puedeRechazar: (rol: string) => {
    return ['superadmin', 'administrador'].includes(rol);
  },
};
