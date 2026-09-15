import { User } from './User';
import { Role } from './Role';
import { Permission } from './Permission';
import { RolePermission } from './RolePermission';
import { SecurityQuestion } from './SecurityQuestion';
import { Section } from './Section';
import { Contenido } from './Contenido';
import { Archivo } from './Archivo';
import { ContenidoArchivo } from './ContenidoArchivo';
import { ContentAuditLog } from './ContentAuditLog';
import { Pagina } from './Pagina';
import { PaginaVersion } from './PaginaVersion';
// Sin asociaciones: `usuario_id` es texto libre a propósito (la cuenta maestra de
// desarrollo no tiene fila en `usuarios`). Ver `020-bloqueos-edicion`.
import { BloqueoEdicion } from './BloqueoEdicion';
import { SubidaPendiente } from './SubidaPendiente';

import Departamento from './Departamento';
import CentroFormacion from './CentroFormacion';
import NivelFormacion from './NivelFormacion';
import ProgramaFormacion from './ProgramaFormacion';
import ProgramaSobresaliente from './ProgramaSobresaliente';

Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, as: 'roles', foreignKey: 'permission_id', otherKey: 'role_id' });

User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
Role.hasMany(User, { as: 'users', foreignKey: 'role_id' });

SecurityQuestion.belongsTo(User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SecurityQuestion, { as: 'securityQuestions', foreignKey: 'user_id', onDelete: 'CASCADE' });

Contenido.belongsTo(Section, { as: 'section', foreignKey: 'sectionId' });
Section.hasMany(Contenido, { as: 'contenidos', foreignKey: 'sectionId' });

// El árbol de secciones de RF-11: máximo tres niveles, impuesto por la base.
Section.belongsTo(Section, { as: 'padre', foreignKey: 'padreId' });
Section.hasMany(Section, { as: 'hijas', foreignKey: 'padreId' });

Contenido.belongsTo(User, { as: 'author', foreignKey: 'authorId', onDelete: 'SET NULL' });
User.hasMany(Contenido, { as: 'contenidos', foreignKey: 'authorId', onDelete: 'SET NULL' });

// Un archivo puede estar en varios contenidos y puede no estar en ninguno: por eso
// la relación es N:M con tabla puente y no una clave foránea en el archivo.
Contenido.belongsToMany(Archivo, {
  through: ContenidoArchivo,
  as: 'attachments',
  foreignKey: 'contenidoId',
  otherKey: 'archivoId',
});
Archivo.belongsToMany(Contenido, {
  through: ContenidoArchivo,
  as: 'contenidos',
  foreignKey: 'archivoId',
  otherKey: 'contenidoId',
});

Archivo.belongsTo(User, { as: 'autor', foreignKey: 'subidoPor', onDelete: 'SET NULL' });

Pagina.belongsTo(User, { as: 'creador', foreignKey: 'creadoPor', onDelete: 'SET NULL' });
User.hasMany(Pagina, { as: 'paginas', foreignKey: 'creadoPor', onDelete: 'SET NULL' });

Pagina.hasMany(PaginaVersion, { as: 'versiones', foreignKey: 'paginaId' });
PaginaVersion.belongsTo(Pagina, { as: 'pagina', foreignKey: 'paginaId' });

PaginaVersion.belongsTo(User, { as: 'revisor', foreignKey: 'revisorId', onDelete: 'SET NULL' });
PaginaVersion.belongsTo(User, { as: 'publicador', foreignKey: 'publicadoPor', onDelete: 'SET NULL' });
PaginaVersion.belongsTo(User, { as: 'autor', foreignKey: 'creadoPor', onDelete: 'SET NULL' });


// Relaciones Observatorio
Departamento.hasMany(CentroFormacion, { as: 'centros', foreignKey: 'departamento_id' });
CentroFormacion.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

NivelFormacion.hasMany(ProgramaFormacion, { as: 'programas', foreignKey: 'nivel_formacion_id' });
ProgramaFormacion.belongsTo(NivelFormacion, { as: 'nivelFormacion', foreignKey: 'nivel_formacion_id' });

ProgramaSobresaliente.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });
ProgramaSobresaliente.belongsTo(CentroFormacion, { as: 'centro', foreignKey: 'centro_id' });
ProgramaSobresaliente.belongsTo(NivelFormacion, { as: 'nivelFormacion', foreignKey: 'nivel_formacion_id' });
ProgramaSobresaliente.belongsTo(ProgramaFormacion, { as: 'programa', foreignKey: 'programa_id' });

export {
  User,
  Role,
  Permission,
  RolePermission,
  SecurityQuestion,
  Section,
  Contenido,
  Archivo,
  ContenidoArchivo,
  ContentAuditLog,
  Pagina,
  PaginaVersion,
  BloqueoEdicion,
  SubidaPendiente,
  Departamento,
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  ProgramaSobresaliente,
};
