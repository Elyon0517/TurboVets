import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { AuthModule } from '../modules/auth/auth.module';
import { TasksModule } from '../modules/tasks/tasks.module';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { UsersModule } from '../modules/users/users.module';
import { AuditLogModule } from '../modules/audit-log/audit-log.module';
import { SeedModule } from '../modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_PATH') ?? 'turbo-tasks.sqlite',
        entities: [User, Role, Organization, Task, AuditLog],
        synchronize: true,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    TasksModule,
    OrganizationsModule,
    UsersModule,
    AuditLogModule,
    SeedModule,
  ],
})
export class AppModule {}
