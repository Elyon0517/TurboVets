import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../../entities/user.entity';
import { Role } from '../../../entities/role.entity';
import { Organization } from '../../../entities/organization.entity';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { RoleType } from '@org/data';

const mockOrg = { id: 'org-1', name: 'Test Org' };
const mockRole = { id: 'role-1', name: RoleType.ADMIN, organizationId: 'org-1' };
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  organizationId: 'org-1',
  roleId: 'role-1',
  role: mockRole,
  organization: mockOrg,
  createdAt: new Date(),
  validatePassword: jest.fn().mockResolvedValue(true),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let roleRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let orgRepo: { findOne: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    roleRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    orgRepo = { findOne: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return JWT on valid credentials', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.login({ email: 'test@example.com', password: 'Password123!' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(RoleType.ADMIN);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noone@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      userRepo.findOne.mockResolvedValue({
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should log failed login attempts', async () => {
      userRepo.findOne.mockResolvedValue(null);

      try { await service.login({ email: 'x@x.com', password: 'pass' }); } catch { /* */ }

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });
  });

  describe('register', () => {
    it('should throw ConflictException for duplicate email', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'pass',
          firstName: 'Test',
          lastName: 'User',
          organizationId: 'org-1',
          roleType: 'viewer',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for invalid org', async () => {
      userRepo.findOne.mockResolvedValue(null);
      orgRepo.findOne.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'new@example.com',
          password: 'pass',
          firstName: 'New',
          lastName: 'User',
          organizationId: 'invalid-org',
          roleType: 'viewer',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
