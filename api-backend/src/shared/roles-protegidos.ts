/**
 * Roles cuyos permisos define el sistema, no un formulario.
 *
 * `Administrador` y `Director/Subdirector` reciben en `sembrar-permisos-roles.ts`
 * exactamente lo que `4-reglas.md` y las policies (`paginas.policies.ts`,
 * `usuarios.policies.ts`) ya les dan por nombre de rol. Dejar que el panel de
 * `/admin/roles` mueva esos mismos interruptores no añade control: solo permite
 * desincronizar la tabla `roles_permisos` de lo que el propio código ya decidió, y
 * de ahí salía el síntoma real — un Administrador al que le faltaba un `editar.*`
 * porque alguien lo había revocado desde el panel sin saber que las policies seguían
 * tratándolo como si lo tuviera.
 *
 * `Director` y `Subdirector` compartían los mismos permisos siendo dos roles
 * distintos; se fusionaron en uno solo (`Director/Subdirector`) para que no se
 * pudieran editar por separado.
 *
 * `Superadmin` no necesita este candado para funcionar — `resolverPermisos` en
 * `require-permission.middleware.ts` le da bypass antes de mirar `roles_permisos` —
 * pero se incluye para que nadie pueda vaciar su fila y dejar el panel diciendo lo
 * contrario.
 *
 * Se compara en minúsculas por lo mismo que las policies: en la tabla `roles` los
 * nombres están capitalizados.
 */
export const ROLES_PROTEGIDOS = ['superadmin', 'administrador', 'director/subdirector'];

export const esRolProtegido = (nombre: string | null | undefined): boolean =>
  ROLES_PROTEGIDOS.includes((nombre ?? '').trim().toLowerCase());
