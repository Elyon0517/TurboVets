import { RoleType } from '@org/data';

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  [RoleType.OWNER]: 3,
  [RoleType.ADMIN]: 2,
  [RoleType.VIEWER]: 1,
};

export function hasRoleOrAbove(userRole: RoleType, requiredRole: RoleType): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canCreateTask(role: RoleType): boolean {
  return hasRoleOrAbove(role, RoleType.ADMIN);
}

export function canUpdateTask(role: RoleType, isOwner: boolean): boolean {
  if (hasRoleOrAbove(role, RoleType.ADMIN)) return true;
  return isOwner;
}

export function canDeleteTask(role: RoleType, isOwner: boolean): boolean {
  if (role === RoleType.OWNER) return true;
  if (role === RoleType.ADMIN && isOwner) return true;
  return false;
}

export function canViewAuditLog(role: RoleType): boolean {
  return hasRoleOrAbove(role, RoleType.ADMIN);
}

export function getTaskScope(role: RoleType): 'all' | 'org' | 'own' {
  if (role === RoleType.OWNER) return 'all';
  if (role === RoleType.ADMIN) return 'org';
  return 'own';
}
