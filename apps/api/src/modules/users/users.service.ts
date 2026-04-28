import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findAll(organizationId?: string): Promise<User[]> {
    const where = organizationId ? { organizationId } : {};
    return this.userRepo.find({
      where,
      relations: ['role', 'organization'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role', 'organization'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
