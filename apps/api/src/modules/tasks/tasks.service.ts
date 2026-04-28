import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  IJwtPayload,
  AuditAction,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
} from '@org/data';
import {
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  getTaskScope,
} from '@org/auth';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(dto: CreateTaskDto, user: IJwtPayload, ip?: string): Promise<Task> {
    if (!canCreateTask(user.role)) {
      await this.auditLog.log({
        userId: user.sub,
        action: AuditAction.ACCESS_DENIED,
        resourceType: 'task',
        details: 'Attempted to create task without permission',
        ipAddress: ip,
        success: false,
      });
      throw new ForbiddenException('You do not have permission to create tasks');
    }

    const maxOrder = await this.taskRepo
      .createQueryBuilder('task')
      .select('MAX(task.order)', 'max')
      .where('task.organizationId = :orgId', { orgId: user.organizationId })
      .getRawOne<{ max: number | null }>();

    const task = this.taskRepo.create({
      ...dto,
      ownerId: user.sub,
      organizationId: user.organizationId,
      order: dto.order ?? (maxOrder?.max ?? 0) + 1,
    });

    const saved = await this.taskRepo.save(task);

    await this.auditLog.log({
      userId: user.sub,
      action: AuditAction.TASK_CREATE,
      resourceType: 'task',
      resourceId: saved.id,
      ipAddress: ip,
      success: true,
    });

    return saved;
  }

  async findAll(user: IJwtPayload, filter: TaskFilterDto, ip?: string) {
    const scope = getTaskScope(user.role);

    const where: FindOptionsWhere<Task> = {};

    if (scope === 'own') {
      where.ownerId = user.sub;
    } else if (scope === 'org') {
      where.organizationId = user.organizationId;
    }

    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.category) where.category = filter.category;

    let tasks = await this.taskRepo.find({
      where,
      relations: ['owner', 'organization'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    if (filter.search) {
      const s = filter.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description?.toLowerCase().includes(s) ?? false),
      );
    }

    await this.auditLog.log({
      userId: user.sub,
      action: AuditAction.TASK_READ,
      resourceType: 'task',
      details: `Listed tasks (scope=${scope})`,
      ipAddress: ip,
      success: true,
    });

    return tasks;
  }

  async findOne(id: string, user: IJwtPayload, ip?: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['owner', 'organization'],
    });

    if (!task) throw new NotFoundException(`Task ${id} not found`);

    this.assertReadAccess(task, user, ip);

    await this.auditLog.log({
      userId: user.sub,
      action: AuditAction.TASK_READ,
      resourceType: 'task',
      resourceId: id,
      ipAddress: ip,
      success: true,
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: IJwtPayload, ip?: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    const isOwner = task.ownerId === user.sub;
    if (!canUpdateTask(user.role, isOwner)) {
      await this.auditLog.log({
        userId: user.sub,
        action: AuditAction.ACCESS_DENIED,
        resourceType: 'task',
        resourceId: id,
        details: 'Attempted to update task without permission',
        ipAddress: ip,
        success: false,
      });
      throw new ForbiddenException('You do not have permission to update this task');
    }

    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);

    await this.auditLog.log({
      userId: user.sub,
      action: AuditAction.TASK_UPDATE,
      resourceType: 'task',
      resourceId: id,
      ipAddress: ip,
      success: true,
    });

    return saved;
  }

  async remove(id: string, user: IJwtPayload, ip?: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    const isOwner = task.ownerId === user.sub;
    if (!canDeleteTask(user.role, isOwner)) {
      await this.auditLog.log({
        userId: user.sub,
        action: AuditAction.ACCESS_DENIED,
        resourceType: 'task',
        resourceId: id,
        details: 'Attempted to delete task without permission',
        ipAddress: ip,
        success: false,
      });
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepo.remove(task);

    await this.auditLog.log({
      userId: user.sub,
      action: AuditAction.TASK_DELETE,
      resourceType: 'task',
      resourceId: id,
      ipAddress: ip,
      success: true,
    });
  }

  async reorder(taskIds: string[], user: IJwtPayload): Promise<void> {
    if (!canCreateTask(user.role)) {
      throw new ForbiddenException('You do not have permission to reorder tasks');
    }
    for (let i = 0; i < taskIds.length; i++) {
      await this.taskRepo.update({ id: taskIds[i] }, { order: i });
    }
  }

  private assertReadAccess(task: Task, user: IJwtPayload, _ip?: string) {
    const scope = getTaskScope(user.role);
    if (scope === 'own' && task.ownerId !== user.sub) {
      throw new ForbiddenException('You can only view your own tasks');
    }
    if (scope === 'org' && task.organizationId !== user.organizationId) {
      throw new ForbiddenException('You can only view tasks in your organization');
    }
  }
}
