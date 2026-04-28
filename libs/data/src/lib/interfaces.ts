import { RoleType, TaskCategory, TaskPriority, TaskStatus, AuditAction } from './enums.js';

export interface IOrganization {
  id: string;
  name: string;
  parentId?: string;
  parent?: IOrganization;
  children?: IOrganization[];
  createdAt: Date;
}

export interface IRole {
  id: string;
  name: RoleType;
  organizationId: string;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleId: string;
  role?: IRole;
  organization?: IOrganization;
  createdAt: Date;
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  order: number;
  ownerId: string;
  owner?: IUser;
  organizationId: string;
  organization?: IOrganization;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  id: string;
  userId: string;
  user?: IUser;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  success: boolean;
  createdAt: Date;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: RoleType;
  organizationId: string;
  iat?: number;
  exp?: number;
}

export interface IAuthResponse {
  accessToken: string;
  user: Omit<IUser, 'organization' | 'role'> & {
    role: RoleType;
    organizationName: string;
  };
}
