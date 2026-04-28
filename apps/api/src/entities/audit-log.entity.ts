import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditAction } from '@org/data';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'varchar' })
  userId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'varchar' })
  action!: AuditAction;

  @Column()
  resourceType!: string;

  @Column({ nullable: true, type: 'varchar' })
  resourceId!: string | null;

  @Column({ nullable: true, type: 'text' })
  details!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  ipAddress!: string | null;

  @Column({ default: true })
  success!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
