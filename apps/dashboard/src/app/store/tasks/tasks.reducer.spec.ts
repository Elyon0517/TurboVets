import { tasksFeature, TasksState, selectFilteredTasks } from './tasks.reducer';
import { TasksActions } from './tasks.actions';
import { ITask, TaskStatus, TaskPriority, TaskCategory } from '@org/data';

const mockTask = (overrides: Partial<ITask> = {}): ITask => ({
  id: 'task-1',
  title: 'Test Task',
  description: null,
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  category: TaskCategory.WORK,
  order: 1,
  ownerId: 'user-1',
  owner: undefined as unknown as any,
  organizationId: 'org-1',
  organization: undefined as unknown as any,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const initialState: TasksState = tasksFeature.reducer(undefined, { type: '@@INIT' });

describe('Tasks Reducer', () => {
  it('should return initial state', () => {
    expect(initialState.loading).toBe(false);
    expect(initialState.error).toBeNull();
  });

  it('should set loading on loadTasks', () => {
    const state = tasksFeature.reducer(initialState, TasksActions.loadTasks({}));
    expect(state.loading).toBe(true);
  });

  it('should populate tasks on loadTasksSuccess', () => {
    const tasks = [mockTask(), mockTask({ id: 'task-2', title: 'Task 2' })];
    const state = tasksFeature.reducer(
      { ...initialState, loading: true },
      TasksActions.loadTasksSuccess({ tasks }),
    );
    expect(state.loading).toBe(false);
    expect(Object.keys(state.entities)).toHaveLength(2);
  });

  it('should add task on createTaskSuccess', () => {
    const task = mockTask();
    const state = tasksFeature.reducer(
      initialState,
      TasksActions.createTaskSuccess({ task }),
    );
    expect(state.entities['task-1']).toEqual(task);
  });

  it('should update task on updateTaskSuccess', () => {
    const task = mockTask();
    const stateWithTask = tasksFeature.reducer(
      initialState,
      TasksActions.createTaskSuccess({ task }),
    );
    const updated = { ...task, title: 'Updated Title' };
    const finalState = tasksFeature.reducer(
      stateWithTask,
      TasksActions.updateTaskSuccess({ task: updated }),
    );
    expect(finalState.entities['task-1']?.title).toBe('Updated Title');
  });

  it('should remove task on deleteTaskSuccess', () => {
    const task = mockTask();
    const stateWithTask = tasksFeature.reducer(
      initialState,
      TasksActions.createTaskSuccess({ task }),
    );
    const finalState = tasksFeature.reducer(
      stateWithTask,
      TasksActions.deleteTaskSuccess({ id: 'task-1' }),
    );
    expect(finalState.entities['task-1']).toBeUndefined();
  });

  it('should update filter on setFilter', () => {
    const state = tasksFeature.reducer(
      initialState,
      TasksActions.setFilter({ filter: { status: TaskStatus.DONE } }),
    );
    expect(state.filter.status).toBe(TaskStatus.DONE);
  });
});

describe('selectFilteredTasks', () => {
  it('should filter tasks by status', () => {
    const tasks = [
      mockTask({ id: '1', status: TaskStatus.TODO }),
      mockTask({ id: '2', status: TaskStatus.DONE }),
    ];
    const state = tasksFeature.reducer(
      { ...initialState, filter: { status: TaskStatus.DONE } },
      TasksActions.loadTasksSuccess({ tasks }),
    );

    const filtered = selectFilteredTasks.projector(
      Object.values(state.entities) as ITask[],
      state.filter,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe(TaskStatus.DONE);
  });

  it('should filter tasks by search', () => {
    const tasks = [
      mockTask({ id: '1', title: 'Buy groceries' }),
      mockTask({ id: '2', title: 'Review PR' }),
    ];
    const state = tasksFeature.reducer(
      { ...initialState, filter: { search: 'groceries' } },
      TasksActions.loadTasksSuccess({ tasks }),
    );

    const filtered = selectFilteredTasks.projector(
      Object.values(state.entities) as ITask[],
      state.filter,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Buy groceries');
  });
});
