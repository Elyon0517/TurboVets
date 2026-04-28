import { RolesGuard } from '../roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleType } from '@org/data';

function mockContext(role: RoleType): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { sub: 'user-1', email: 'test@test.com', role, organizationId: 'org-1' } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = mockContext(RoleType.VIEWER);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow OWNER to access admin-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const ctx = mockContext(RoleType.OWNER);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow ADMIN to access admin-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const ctx = mockContext(RoleType.ADMIN);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny VIEWER from admin-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const ctx = mockContext(RoleType.VIEWER);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny ADMIN from owner-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.OWNER]);
    const ctx = mockContext(RoleType.ADMIN);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should allow OWNER to access owner-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.OWNER]);
    const ctx = mockContext(RoleType.OWNER);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
