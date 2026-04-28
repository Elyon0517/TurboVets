import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IJwtPayload, CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '@org/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    return this.tasksService.create(dto, user, req.ip);
  }

  @Get()
  findAll(
    @CurrentUser() user: IJwtPayload,
    @Query() filter: TaskFilterDto,
    @Req() req: Request,
  ) {
    return this.tasksService.findAll(user, filter, req.ip);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    return this.tasksService.findOne(id, user, req.ip);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    return this.tasksService.update(id, dto, user, req.ip);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    return this.tasksService.remove(id, user, req.ip);
  }

  @Post('reorder')
  reorder(
    @Body() body: { taskIds: string[] },
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.tasksService.reorder(body.taskIds, user);
  }
}
