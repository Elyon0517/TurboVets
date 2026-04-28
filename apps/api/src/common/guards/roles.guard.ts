import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType, IJwtPayload } from '@org/data';
import { hasRoleOrAbove } from '@org/auth';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as IJwtPayload;

    if (!user) {
      throw new ForbiddenException('No user in request');
    }

    const hasPermission = requiredRoles.some((role) => hasRoleOrAbove(user.role, role));

    if (!hasPermission) {
      throw new ForbiddenException(
        `Role '${user.role}' does not have the required permissions`,
      );
    }

    return true;
  }
}
