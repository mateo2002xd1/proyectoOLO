import { User } from './User';
import { Role } from './Role';
import { Permission } from './Permission';
import { RolePermission } from './RolePermission';
import { SecurityQuestion } from './SecurityQuestion';
import { Section } from './Section';
import { Contenido } from './Contenido';
import { Attachment } from './Attachment';
import { ContentAuditLog } from './ContentAuditLog';
import { SitioUser } from './SitioUser';
import { Pagina } from './Pagina';
import { PaginaVersion } from './PaginaVersion';

Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, as: 'roles', foreignKey: 'permission_id', otherKey: 'role_id' });

User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
Role.hasMany(User, { as: 'users', foreignKey: 'role_id' });

SecurityQuestion.belongsTo(User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SecurityQuestion, { as: 'securityQuestions', foreignKey: 'user_id', onDelete: 'CASCADE' });

Contenido.belongsTo(Section, { as: 'section', foreignKey: 'sectionId' });
Section.hasMany(Contenido, { as: 'contenidos', foreignKey: 'sectionId' });

Contenido.belongsTo(User, { as: 'author', foreignKey: 'authorId', onDelete: 'SET NULL' });
User.hasMany(Contenido, { as: 'contenidos', foreignKey: 'authorId', onDelete: 'SET NULL' });

Attachment.belongsTo(Contenido, { as: 'contenido', foreignKey: 'postId' });
Contenido.hasMany(Attachment, { as: 'attachments', foreignKey: 'postId' });

Pagina.belongsTo(User, { as: 'creador', foreignKey: 'creadoPor', onDelete: 'SET NULL' });
User.hasMany(Pagina, { as: 'paginas', foreignKey: 'creadoPor', onDelete: 'SET NULL' });

Pagina.hasMany(PaginaVersion, { as: 'versiones', foreignKey: 'paginaId' });
PaginaVersion.belongsTo(Pagina, { as: 'pagina', foreignKey: 'paginaId' });

PaginaVersion.belongsTo(User, { as: 'revisor', foreignKey: 'revisorId', onDelete: 'SET NULL' });
PaginaVersion.belongsTo(User, { as: 'publicador', foreignKey: 'publicadoPor', onDelete: 'SET NULL' });

export {
  User,
  Role,
  Permission,
  RolePermission,
  SecurityQuestion,
  Section,
  Contenido,
  Attachment,
  ContentAuditLog,
  SitioUser,
  Pagina,
  PaginaVersion,
};
