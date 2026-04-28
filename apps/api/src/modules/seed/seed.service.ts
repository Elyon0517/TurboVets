import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Organization } from '../../entities/organization.entity';
import { RoleType } from '@org/data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const count = await this.orgRepo.count();
    if (count > 0) return;

    this.logger.log('Seeding database with initial data...');

    const parentOrg = await this.orgRepo.save(
      this.orgRepo.create({ name: 'Acme Corp' }),
    );
    const childOrg = await this.orgRepo.save(
      this.orgRepo.create({ name: 'Engineering', parentId: parentOrg.id }),
    );

    const ownerRole = await this.roleRepo.save(
      this.roleRepo.create({ name: RoleType.OWNER, organizationId: parentOrg.id }),
    );
    const adminRole = await this.roleRepo.save(
      this.roleRepo.create({ name: RoleType.ADMIN, organizationId: childOrg.id }),
    );
    const viewerRole = await this.roleRepo.save(
      this.roleRepo.create({ name: RoleType.VIEWER, organizationId: childOrg.id }),
    );

    const owner = this.userRepo.create({
      email: 'owner@acme.com',
      password: 'Password123!',
      firstName: 'Alice',
      lastName: 'Owner',
      organizationId: parentOrg.id,
      roleId: ownerRole.id,
    });
    await this.userRepo.save(owner);

    const admin = this.userRepo.create({
      email: 'admin@acme.com',
      password: 'Password123!',
      firstName: 'Bob',
      lastName: 'Admin',
      organizationId: childOrg.id,
      roleId: adminRole.id,
    });
    await this.userRepo.save(admin);

    const viewer = this.userRepo.create({
      email: 'viewer@acme.com',
      password: 'Password123!',
      firstName: 'Carol',
      lastName: 'Viewer',
      organizationId: childOrg.id,
      roleId: viewerRole.id,
    });
    await this.userRepo.save(viewer);

    this.logger.log('Seed complete. Demo users: owner@acme.com, admin@acme.com, viewer@acme.com (all pw: Password123!)');
  }
}
