import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TasksService } from '../tasks.service';
import { Task } from '../../../entities/task.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { RoleType, TaskStatus, TaskPriority, TaskCategory } from '@org/data';

const mockTask = (): Task => ({
  id: 'task-1',
  title: 'Test Task',
  description: null,
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  category: TaskCategory.WORK,
  order: 1,
  ownerId: 'user-1',
  owner: null as unknown as any,
  organizationId: 'org-1',
  organization: null as unknown as any,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockUser = (role: RoleType = RoleType.ADMIN) => ({
  sub: 'user-1',
  email: 'test@test.com',
  role,
  organizationId: 'org-1',
});

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let auditLog: jest.Mocked<AuditLogService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
            }),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get(getRepositoryToken(Task));
    auditLog = module.get(AuditLogService);
  });

  describe('create', () => {
    it('should create task successfully as ADMIN', async () => {
      const task = mockTask();
      const user = mockUser(RoleType.ADMIN);
      taskRepo.create.mockReturnValue(task);
      taskRepo.save.mockResolvedValue(task);

      const result = await service.create({ title: 'Test Task' }, user);

      expect(result).toEqual(task);
      expect(taskRepo.save).toHaveBeenCalled();
      expect(auditLog.log).toHaveBeenCalled();
    });

    it('should deny task creation for VIEWER', async () => {
      const user = mockUser(RoleType.VIEWER);

      await expect(service.create({ title: 'Test Task' }, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should scope tasks to own for VIEWER', async () => {
      const user = mockUser(RoleType.VIEWER);
      taskRepo.find.mockResolvedValue([]);

      await service.findAll(user, {});

      expect(taskRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 'user-1' }),
        }),
      );
    });

    it('should scope tasks to org for ADMIN', async () => {
      const user = mockUser(RoleType.ADMIN);
      taskRepo.find.mockResolvedValue([]);

      await service.findAll(user, {});

      expect(taskRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: 'org-1' }),
        }),
      );
    });

    it('should return all tasks for OWNER', async () => {
      const user = mockUser(RoleType.OWNER);
      taskRepo.find.mockResolvedValue([]);

      await service.findAll(user, {});

      expect(taskRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('update', () => {
    it('should allow ADMIN to update any task', async () => {
      const task = mockTask();
      const user = mockUser(RoleType.ADMIN);
      taskRepo.findOne.mockResolvedValue(task);
      taskRepo.save.mockResolvedValue({ ...task, title: 'Updated' });

      const result = await service.update('task-1', { title: 'Updated' }, user);

      expect(result.title).toBe('Updated');
    });

    it('should deny VIEWER from updating others tasks', async () => {
      const task = { ...mockTask(), ownerId: 'other-user' };
      const user = mockUser(RoleType.VIEWER);
      taskRepo.findOne.mockResolvedValue(task);

      await expect(service.update('task-1', { title: 'Updated' }, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow VIEWER to update their own task', async () => {
      const task = mockTask();
      const user = mockUser(RoleType.VIEWER);
      taskRepo.findOne.mockResolvedValue(task);
      taskRepo.save.mockResolvedValue({ ...task, title: 'Updated' });

      const result = await service.update('task-1', { title: 'Updated' }, user);

      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException for missing task', async () => {
      taskRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-id', {}, mockUser()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should allow OWNER to delete any task', async () => {
      const task = { ...mockTask(), ownerId: 'other-user' };
      const user = mockUser(RoleType.OWNER);
      taskRepo.findOne.mockResolvedValue(task);
      taskRepo.remove.mockResolvedValue(task);

      await expect(service.remove('task-1', user)).resolves.toBeUndefined();
    });

    it('should deny VIEWER from deleting tasks', async () => {
      const task = mockTask();
      const user = mockUser(RoleType.VIEWER);
      taskRepo.findOne.mockResolvedValue(task);

      await expect(service.remove('task-1', user)).rejects.toThrow(ForbiddenException);
    });
  });
});
