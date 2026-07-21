"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
const role_permissions_repository_1 = require("../repositories/role-permissions.repository");
// Cache de permisos por rol con TTL
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;
function requirePermission(permissionName) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const role = req.user.role;
        if (!role) {
            return res.status(403).json({ error: 'Permiso denegado' });
        }
        // Superadmin bypass
        if (role === 'Superadmin') {
            return next();
        }
        let entry = cache.get(role);
        if (!entry || entry.expires < Date.now()) {
            try {
                const perms = await role_permissions_repository_1.RolePermissionRepository.getPermissionsByRole(role);
                entry = { perms, expires: Date.now() + TTL_MS };
                cache.set(role, entry);
            }
            catch (error) {
                return next(error);
            }
        }
        if (!entry.perms.includes(permissionName)) {
            return res.status(403).json({ error: 'Permiso denegado' });
        }
        next();
    };
}
//# sourceMappingURL=require-permission.middleware.js.map