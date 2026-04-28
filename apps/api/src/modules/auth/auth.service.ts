import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RoleType, AuditAction, IJwtPayload, IAuthResponse, LoginDto, CreateUserDto } from '@org/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly auditLog: AuditLogService,
  ) {}

  async login(dto: LoginDto, ip?: string): Promise<IAuthResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['role', 'organization'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        organizationId: true,
        roleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      await this.auditLog.log({
        userId: null,
        action: AuditAction.USER_LOGIN,
        resourceType: 'auth',
        details: `Failed login attempt for ${dto.email}`,
        ipAddress: ip,
        success: false,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await user.validatePassword(dto.password);
    if (!valid) {
      await this.auditLog.log({
        userId: user.id,
        action: AuditAction.USER_LOGIN,
        resourceType: 'auth',
        details: `Invalid password for ${dto.email}`,
        ipAddress: ip,
        success: false,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      organizationId: user.organizationId,
    };

    await this.auditLog.log({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      resourceType: 'auth',
      ipAddress: ip,
      success: true,
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        roleId: user.roleId,
        role: user.role.name,
        organizationName: user.organization.name,
        createdAt: user.createdAt,
      },
    };
  }

  async register(dto: CreateUserDto, ip?: string): Promise<IAuthResponse> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
    if (!org) {
      throw new ConflictException('Organization not found');
    }

    let role = await this.roleRepo.findOne({
      where: { name: dto.roleType as RoleType, organizationId: dto.organizationId },
    });

    if (!role) {
      role = this.roleRepo.create({
        name: dto.roleType as RoleType,
        organizationId: dto.organizationId,
      });
      role = await this.roleRepo.save(role);
    }

    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationId: dto.organizationId,
      roleId: role.id,
    });

    await this.userRepo.save(user);

    await this.auditLog.log({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      resourceType: 'auth',
      details: `User registered: ${dto.email}`,
      ipAddress: ip,
      success: true,
    });

    return this.login({ email: dto.email, password: dto.password }, ip);
  }

  async getProfile(userId: string): Promise<Omit<User, 'password' | 'hashPassword' | 'validatePassword'>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'organization'],
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
