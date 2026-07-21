"use strict";
// Policies - Paginas
// Stub: Implementar según §2 (Mapeo definitivo de roles)
// Roles: administrador, editor, director
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginasPolicies = void 0;
exports.paginasPolicies = {
    puedeVer: (rol) => {
        return ['superadmin', 'administrador', 'editor', 'director', 'subdirector'].includes(rol);
    },
    puedeEditar: (rol) => {
        return ['superadmin', 'administrador', 'editor'].includes(rol);
    },
    puedePublicar: (rol) => {
        return ['superadmin', 'administrador'].includes(rol);
    },
    puedeRechazar: (rol) => {
        return ['superadmin', 'administrador'].includes(rol);
    },
};
//# sourceMappingURL=paginas.policies.js.map