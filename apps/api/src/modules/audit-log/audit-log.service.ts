import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditAction } from '@org/data';

interface LogParams {
  userId?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  success?: boolean;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<void> {
    const entry = this.auditRepo.create({
      userId: params.userId ?? null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
      success: params.success ?? true,
    });

    await this.auditRepo.save(entry);

    this.logger.log(
      `[AUDIT] ${params.action} | resource=${params.resourceType}:${params.resourceId ?? 'n/a'} | user=${params.userId ?? 'anon'} | success=${params.success ?? true}`,
    );
  }

  async findAll(page = 1, limit = 50) {
    const [data, total] = await this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { data, total, page, limit };
  }
}
