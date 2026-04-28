import {
  hasRoleOrAbove,
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canViewAuditLog,
  getTaskScope,
} from '../rbac.js';
import { RoleType } from '@org/data';

describe('RBAC logic', () => {
  describe('hasRoleOrAbove', () => {
    it('should return true when user has exact role', () => {
      expect(hasRoleOrAbove(RoleType.ADMIN, RoleType.ADMIN)).toBe(true);
    });

    it('should return true when user has higher role', () => {
      expect(hasRoleOrAbove(RoleType.OWNER, RoleType.VIEWER)).toBe(true);
      expect(hasRoleOrAbove(RoleType.OWNER, RoleType.ADMIN)).toBe(true);
      expect(hasRoleOrAbove(RoleType.ADMIN, RoleType.VIEWER)).toBe(true);
    });

    it('should return false when user has lower role', () => {
      expect(hasRoleOrAbove(RoleType.VIEWER, RoleType.ADMIN)).toBe(false);
      expect(hasRoleOrAbove(RoleType.VIEWER, RoleType.OWNER)).toBe(false);
      expect(hasRoleOrAbove(RoleType.ADMIN, RoleType.OWNER)).toBe(false);
    });
  });

  describe('canCreateTask', () => {
    it('should allow OWNER and ADMIN to create tasks', () => {
      expect(canCreateTask(RoleType.OWNER)).toBe(true);
      expect(canCreateTask(RoleType.ADMIN)).toBe(true);
    });

    it('should deny VIEWER from creating tasks', () => {
      expect(canCreateTask(RoleType.VIEWER)).toBe(false);
    });
  });

  describe('canUpdateTask', () => {
    it('should allow OWNER/ADMIN regardless of ownership', () => {
      expect(canUpdateTask(RoleType.OWNER, false)).toBe(true);
      expect(canUpdateTask(RoleType.ADMIN, false)).toBe(true);
    });

    it('should allow VIEWER only if they own the task', () => {
      expect(canUpdateTask(RoleType.VIEWER, true)).toBe(true);
      expect(canUpdateTask(RoleType.VIEWER, false)).toBe(false);
    });
  });

  describe('canDeleteTask', () => {
    it('should allow OWNER to delete any task', () => {
      expect(canDeleteTask(RoleType.OWNER, false)).toBe(true);
      expect(canDeleteTask(RoleType.OWNER, true)).toBe(true);
    });

    it('should allow ADMIN to delete only their own tasks', () => {
      expect(canDeleteTask(RoleType.ADMIN, true)).toBe(true);
      expect(canDeleteTask(RoleType.ADMIN, false)).toBe(false);
    });

    it('should deny VIEWER from deleting any tasks', () => {
      expect(canDeleteTask(RoleType.VIEWER, true)).toBe(false);
      expect(canDeleteTask(RoleType.VIEWER, false)).toBe(false);
    });
  });

  describe('canViewAuditLog', () => {
    it('should allow OWNER and ADMIN to view audit log', () => {
      expect(canViewAuditLog(RoleType.OWNER)).toBe(true);
      expect(canViewAuditLog(RoleType.ADMIN)).toBe(true);
    });

    it('should deny VIEWER from viewing audit log', () => {
      expect(canViewAuditLog(RoleType.VIEWER)).toBe(false);
    });
  });

  describe('getTaskScope', () => {
    it('should return "all" for OWNER', () => {
      expect(getTaskScope(RoleType.OWNER)).toBe('all');
    });

    it('should return "org" for ADMIN', () => {
      expect(getTaskScope(RoleType.ADMIN)).toBe('org');
    });

    it('should return "own" for VIEWER', () => {
      expect(getTaskScope(RoleType.VIEWER)).toBe('own');
    });
  });
});
