import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType, IJwtPayload, AuditAction } from '@org/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @CurrentUser() user: IJwtPayload,
  ) {
    await this.auditLogService.log({
      userId: user.sub,
      action: AuditAction.AUDIT_LOG_READ,
      resourceType: 'audit_log',
      success: true,
    });

    return this.auditLogService.findAll(Number(page), Number(limit));
  }
}
