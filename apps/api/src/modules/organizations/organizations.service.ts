import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { CreateOrganizationDto } from '@org/data';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const org = this.orgRepo.create(dto);
    return this.orgRepo.save(org);
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepo.find({ relations: ['children', 'parent'] });
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async seed(): Promise<{ parent: Organization; child: Organization }> {
    let parent = await this.orgRepo.findOne({ where: { name: 'Acme Corp' } });
    if (!parent) {
      parent = await this.create({ name: 'Acme Corp' });
    }

    let child = await this.orgRepo.findOne({ where: { name: 'Engineering' } });
    if (!child) {
      child = await this.create({ name: 'Engineering', parentId: parent.id });
    }

    return { parent, child };
  }
}
