import { User } from './user';
import { Role } from './role';
import { Permission } from './permission';
import { RolePermission } from './role-permission';
import { SecurityQuestion } from './security-question';
import { Archivo } from './archivo';
import { ContentAuditLog } from './content-audit-log';
import { Pagina } from './pagina';
import { PaginaVersion } from './pagina-version';
// Sin asociaciones: `usuario_id` es texto libre a propósito (la cuenta maestra de
// desarrollo no tiene fila en `usuarios`). Ver `020-bloqueos-edicion`.
import { BloqueoEdicion } from './bloqueo-edicion';
import { SubidaPendiente } from './subida-pendiente';
import { CargaDatos } from './carga-datos';

// Catálogos del observatorio ("Programa + sobresalientes") — tablas y modelos de
// Mateo (migración `026-observatorio-programas-sobresalientes`), con exportación
// `default` y atributos en snake_case tal como él los declaró. No se tocan sus
// archivos de modelo; `CargaDatos` (arriba) es la única pieza que agregamos
// nosotros, y es un archivo aparte, sin relación de esquema con estos.
import Departamento from './departamento';
import CentroFormacion from './centro-formacion';
import NivelFormacion from './nivel-formacion';
import ProgramaFormacion from './programa-formacion';
import ProgramaSobresaliente from './programa-sobresaliente';

Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, as: 'roles', foreignKey: 'permission_id', otherKey: 'role_id' });

User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
Role.hasMany(User, { as: 'users', foreignKey: 'role_id' });

SecurityQuestion.belongsTo(User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SecurityQuestion, { as: 'securityQuestions', foreignKey: 'user_id', onDelete: 'CASCADE' });



Archivo.belongsTo(User, { as: 'autor', foreignKey: 'subidoPor', onDelete: 'SET NULL' });

Pagina.belongsTo(User, { as: 'creador', foreignKey: 'creadoPor', onDelete: 'SET NULL' });
User.hasMany(Pagina, { as: 'paginas', foreignKey: 'creadoPor', onDelete: 'SET NULL' });

Pagina.hasMany(PaginaVersion, { as: 'versiones', foreignKey: 'paginaId' });
PaginaVersion.belongsTo(Pagina, { as: 'pagina', foreignKey: 'paginaId' });

PaginaVersion.belongsTo(User, { as: 'revisor', foreignKey: 'revisorId', onDelete: 'SET NULL' });
PaginaVersion.belongsTo(User, { as: 'publicador', foreignKey: 'publicadoPor', onDelete: 'SET NULL' });
PaginaVersion.belongsTo(User, { as: 'autor', foreignKey: 'creadoPor', onDelete: 'SET NULL' });

// Catálogos del observatorio — foreignKey en snake_case porque los atributos de
// estos modelos ya se llaman así (sin `field:` mapping, a diferencia del resto del
// proyecto). Ver `026-observatorio-programas-sobresalientes`.
Departamento.hasMany(CentroFormacion, { as: 'centros', foreignKey: 'departamento_id' });
CentroFormacion.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

NivelFormacion.hasMany(ProgramaFormacion, { as: 'programas', foreignKey: 'nivel_formacion_id' });
ProgramaFormacion.belongsTo(NivelFormacion, { as: 'nivelFormacion', foreignKey: 'nivel_formacion_id' });

ProgramaSobresaliente.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });
ProgramaSobresaliente.belongsTo(CentroFormacion, { as: 'centro', foreignKey: 'centro_id' });
ProgramaSobresaliente.belongsTo(NivelFormacion, { as: 'nivelFormacion', foreignKey: 'nivel_formacion_id' });
ProgramaSobresaliente.belongsTo(ProgramaFormacion, { as: 'programa', foreignKey: 'programa_id' });

// Auditoría de cargas de "Actualizaciones" (nuestra, sin relación de esquema con
// las tablas de arriba — ver `027-cargas-datos`).
CargaDatos.belongsTo(Archivo, { as: 'archivo', foreignKey: 'archivoId', onDelete: 'SET NULL' });
CargaDatos.belongsTo(User, { as: 'subidoPorUsuario', foreignKey: 'subidoPor', onDelete: 'SET NULL' });

export {
  User,
  Role,
  Permission,
  RolePermission,
  SecurityQuestion,
  Archivo,
  ContentAuditLog,
  Pagina,
  PaginaVersion,
  BloqueoEdicion,
  SubidaPendiente,
  CargaDatos,
  Departamento,
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  ProgramaSobresaliente,
};
