import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ITask, CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '@org/data';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': props<{ filter?: Partial<TaskFilterDto> }>(),
    'Load Tasks Success': props<{ tasks: ITask[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    'Create Task': props<{ dto: CreateTaskDto }>(),
    'Create Task Success': props<{ task: ITask }>(),
    'Create Task Failure': props<{ error: string }>(),

    'Update Task': props<{ id: string; dto: UpdateTaskDto }>(),
    'Update Task Success': props<{ task: ITask }>(),
    'Update Task Failure': props<{ error: string }>(),

    'Delete Task': props<{ id: string }>(),
    'Delete Task Success': props<{ id: string }>(),
    'Delete Task Failure': props<{ error: string }>(),

    'Reorder Tasks': props<{ taskIds: string[] }>(),
    'Reorder Tasks Success': emptyProps(),

    'Set Filter': props<{ filter: Partial<TaskFilterDto> }>(),
    'Set Selected Task': props<{ task: ITask | null }>(),
    'Clear Error': emptyProps(),
  },
});
