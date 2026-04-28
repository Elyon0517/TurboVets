import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { ITask, TaskFilterDto } from '@org/data';
import { TasksActions } from './tasks.actions';

export interface TasksState extends EntityState<ITask> {
  loading: boolean;
  error: string | null;
  filter: Partial<TaskFilterDto>;
  selectedTask: ITask | null;
}

export const adapter: EntityAdapter<ITask> = createEntityAdapter<ITask>({
  sortComparer: (a, b) => a.order - b.order,
});

const initialState: TasksState = adapter.getInitialState({
  loading: false,
  error: null,
  filter: {},
  selectedTask: null,
});

const tasksReducer = createReducer(
  initialState,

  on(TasksActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),
  on(TasksActions.loadTasksSuccess, (state, { tasks }) =>
    adapter.setAll(tasks, { ...state, loading: false }),
  ),
  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(TasksActions.createTaskSuccess, (state, { task }) =>
    adapter.addOne(task, state),
  ),
  on(TasksActions.createTaskFailure, (state, { error }) => ({ ...state, error })),

  on(TasksActions.updateTaskSuccess, (state, { task }) =>
    adapter.upsertOne(task, state),
  ),
  on(TasksActions.updateTaskFailure, (state, { error }) => ({ ...state, error })),

  on(TasksActions.deleteTaskSuccess, (state, { id }) =>
    adapter.removeOne(id, state),
  ),
  on(TasksActions.deleteTaskFailure, (state, { error }) => ({ ...state, error })),

  on(TasksActions.setFilter, (state, { filter }) => ({ ...state, filter })),
  on(TasksActions.setSelectedTask, (state, { task }) => ({
    ...state,
    selectedTask: task,
  })),
  on(TasksActions.clearError, (state) => ({ ...state, error: null })),
);

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: tasksReducer,
  extraSelectors: ({ selectTasksState }) => {
    const { selectAll, selectEntities, selectTotal } =
      adapter.getSelectors(selectTasksState);
    return { selectAll, selectEntities, selectTotal };
  },
});

export const {
  selectTasksState,
  selectLoading,
  selectError,
  selectFilter,
  selectSelectedTask,
  selectAll: selectAllTasks,
} = tasksFeature;

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectFilter,
  (tasks, filter) => {
    let result = [...tasks];
    if (filter.status) result = result.filter((t) => t.status === filter.status);
    if (filter.priority) result = result.filter((t) => t.priority === filter.priority);
    if (filter.category) result = result.filter((t) => t.category === filter.category);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description?.toLowerCase().includes(s) ?? false),
      );
    }
    return result;
  },
);
