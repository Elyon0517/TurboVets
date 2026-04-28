import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, exhaustMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { TasksActions } from './tasks.actions';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      switchMap(({ filter }) =>
        this.api.getTasks(filter).pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((err: { error?: { message?: string } }) =>
            of(TasksActions.loadTasksFailure({ error: err.error?.message ?? 'Failed to load tasks' })),
          ),
        ),
      ),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      exhaustMap(({ dto }) =>
        this.api.createTask(dto).pipe(
          map((task) => TasksActions.createTaskSuccess({ task })),
          catchError((err: { error?: { message?: string } }) =>
            of(TasksActions.createTaskFailure({ error: err.error?.message ?? 'Failed to create task' })),
          ),
        ),
      ),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      switchMap(({ id, dto }) =>
        this.api.updateTask(id, dto).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((err: { error?: { message?: string } }) =>
            of(TasksActions.updateTaskFailure({ error: err.error?.message ?? 'Failed to update task' })),
          ),
        ),
      ),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      switchMap(({ id }) =>
        this.api.deleteTask(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((err: { error?: { message?: string } }) =>
            of(TasksActions.deleteTaskFailure({ error: err.error?.message ?? 'Failed to delete task' })),
          ),
        ),
      ),
    ),
  );

  reorderTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.reorderTasks),
      switchMap(({ taskIds }) =>
        this.api.reorderTasks(taskIds).pipe(
          map(() => TasksActions.reorderTasksSuccess()),
          catchError(() => of(TasksActions.reorderTasksSuccess())),
        ),
      ),
    ),
  );
}
