import {
  Component,
  OnInit,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ITask, TaskStatus, TaskPriority, TaskCategory, RoleType, CreateTaskDto, UpdateTaskDto } from '@org/data';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectFilteredTasks, selectLoading, selectError } from '../../store/tasks/tasks.reducer';
import { selectUser } from '../../store/auth/auth.reducer';
import { AuthActions } from '../../store/auth/auth.actions';
import { TaskCardComponent } from '../../shared/components/task-card.component';
import { TaskFormComponent } from '../../shared/components/task-form.component';
import { AuditPanelComponent } from './audit-panel.component';
import { ChartComponent } from './chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskCardComponent, TaskFormComponent, AuditPanelComponent, ChartComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <span class="font-bold text-gray-900 dark:text-white">Turbo Tasks</span>
              <span class="hidden sm:inline text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                {{ (user$ | async)?.organizationName }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="hidden md:inline text-xs text-gray-400 dark:text-gray-500 mr-2">
                <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs">N</kbd> New &nbsp;
                <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs">E</kbd> Edit &nbsp;
                <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs">Del</kbd> Delete
              </span>

              @if (canViewAuditLog) {
                <button (click)="showAudit = !showAudit" class="btn-secondary text-xs" [class.bg-primary-50]="showAudit" [class.dark:bg-primary-900]="showAudit">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Audit Log
                </button>
              }

              <button (click)="toggleDark()" class="btn-ghost p-2" [title]="isDark ? 'Light mode' : 'Dark mode'">
                @if (isDark) {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                }
              </button>

              <div class="relative">
                <button (click)="showUserMenu = !showUserMenu" class="flex items-center gap-2 btn-ghost px-3 py-2">
                  <div class="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ userInitials }}
                  </div>
                  <span class="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">{{ (user$ | async)?.firstName }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                @if (showUserMenu) {
                  <div class="absolute right-0 mt-2 w-56 card p-1 z-50 animate-fade-in">
                    <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ (user$ | async)?.firstName }} {{ (user$ | async)?.lastName }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ (user$ | async)?.email }}</p>
                      <span class="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        [class.bg-yellow-100]="(user$ | async)?.role === 'owner'"
                        [class.text-yellow-700]="(user$ | async)?.role === 'owner'"
                        [class.bg-blue-100]="(user$ | async)?.role === 'admin'"
                        [class.text-blue-700]="(user$ | async)?.role === 'admin'"
                        [class.bg-gray-100]="(user$ | async)?.role === 'viewer'"
                        [class.text-gray-700]="(user$ | async)?.role === 'viewer'"
                      >{{ (user$ | async)?.role }}</span>
                    </div>
                    <button (click)="logout()" class="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @if (error$ | async; as error) {
          <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{{ error }}</span>
            <button (click)="dismissError()" class="text-red-400 hover:text-red-600">✕</button>
          </div>
        }

        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex gap-3">
            @for (stat of stats; track stat.label) {
              <div class="card px-4 py-3 min-w-[80px] text-center">
                <div class="text-2xl font-bold" [class]="stat.color">{{ stat.count }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ stat.label }}</div>
              </div>
            }
          </div>
          <div class="flex items-center gap-2">
            <button (click)="showChart = !showChart" class="btn-secondary text-xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              {{ showChart ? 'Hide' : 'Show' }} Chart
            </button>
            @if (canCreate) {
              <button (click)="openCreate()" class="btn-primary text-xs">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                New Task
              </button>
            }
          </div>
        </div>

        @if (showChart) {
          <div class="mb-6">
            <app-chart [tasks]="allTasks" />
          </div>
        }

        <div class="flex flex-wrap gap-2 mb-6">
          <input
            type="search"
            [(ngModel)]="search"
            (ngModelChange)="onSearch($event)"
            placeholder="Search tasks..."
            class="input w-48 text-sm"
          />
          <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()" class="input w-auto text-sm">
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select [(ngModel)]="priorityFilter" (ngModelChange)="applyFilter()" class="input w-auto text-sm">
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select [(ngModel)]="categoryFilter" (ngModelChange)="applyFilter()" class="input w-auto text-sm">
            <option value="">All categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
          @if (search || statusFilter || priorityFilter || categoryFilter) {
            <button (click)="clearFilters()" class="btn-ghost text-xs text-gray-500">
              Clear filters
            </button>
          }
        </div>

        @if (loading$ | async) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        @if (!(loading$ | async)) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (column of columns; track column.status) {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span [class]="column.dotClass" class="w-2.5 h-2.5 rounded-full"></span>
                    <h2 class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ column.label }}</h2>
                    <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                      {{ getColumnTasks(column.status).length }}
                    </span>
                  </div>
                  @if (canCreate && column.status === 'todo') {
                    <button (click)="openCreate()" class="text-xs text-primary-600 dark:text-primary-400 hover:underline">+ Add</button>
                  }
                </div>

                <div
                  cdkDropList
                  [id]="column.status"
                  [cdkDropListData]="getColumnTasks(column.status)"
                  [cdkDropListConnectedTo]="['todo', 'in_progress', 'done']"
                  (cdkDropListDropped)="onDrop($event, column.status)"
                  class="min-h-[120px] space-y-3 p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/30 transition-colors"
                  [class.bg-primary-50]="isDragOver === column.status"
                  [class.dark:bg-primary-900/10]="isDragOver === column.status"
                  (cdkDropListEntered)="isDragOver = column.status"
                  (cdkDropListExited)="isDragOver = null"
                >
                  @for (task of getColumnTasks(column.status); track task.id) {
                    <div cdkDrag [cdkDragData]="task">
                      <app-task-card
                        [task]="task"
                        (edit)="openEdit($event)"
                        (delete)="onDelete($event)"
                        (toggleStatus)="onToggleStatus($event)"
                      />
                      <div *cdkDragPlaceholder class="h-24 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/10"></div>
                    </div>
                  }
                  @if (getColumnTasks(column.status).length === 0) {
                    <div class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                      <svg class="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <span>No tasks</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>

    @if (showForm) {
      <app-task-form
        [task]="selectedTask"
        (close)="closeForm()"
        (save)="onSave($event)"
      />
    }

    @if (showAudit) {
      <app-audit-panel (close)="showAudit = false" />
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);

  tasks$ = this.store.select(selectFilteredTasks);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  user$ = this.store.select(selectUser);

  showForm = false;
  showAudit = false;
  showChart = false;
  showUserMenu = false;
  selectedTask: ITask | null = null;
  isDark = false;
  isDragOver: string | null = null;

  search = '';
  statusFilter = '';
  priorityFilter = '';
  categoryFilter = '';

  allTasks: ITask[] = [];

  columns = [
    { status: 'todo' as TaskStatus, label: 'To Do', dotClass: 'bg-gray-400' },
    { status: 'in_progress' as TaskStatus, label: 'In Progress', dotClass: 'bg-blue-500' },
    { status: 'done' as TaskStatus, label: 'Done', dotClass: 'bg-green-500' },
  ];

  get canCreate(): boolean {
    const role = this.currentRole;
    return role === RoleType.OWNER || role === RoleType.ADMIN;
  }

  get canViewAuditLog(): boolean {
    const role = this.currentRole;
    return role === RoleType.OWNER || role === RoleType.ADMIN;
  }

  get currentRole(): RoleType | null {
    let role: RoleType | null = null;
    this.user$.subscribe((u) => { role = (u?.role as RoleType) ?? null; }).unsubscribe();
    return role;
  }

  get userInitials(): string {
    let initials = '';
    this.user$.subscribe((u) => {
      if (u) initials = (u.firstName[0] + u.lastName[0]).toUpperCase();
    }).unsubscribe();
    return initials;
  }

  get stats() {
    const counts = { todo: 0, in_progress: 0, done: 0, total: 0 };
    this.tasks$.subscribe((tasks) => {
      counts.total = tasks.length;
      counts.todo = tasks.filter((t) => t.status === 'todo').length;
      counts.in_progress = tasks.filter((t) => t.status === 'in_progress').length;
      counts.done = tasks.filter((t) => t.status === 'done').length;
    }).unsubscribe();
    return [
      { label: 'Total', count: counts.total, color: 'text-gray-700 dark:text-gray-300' },
      { label: 'To Do', count: counts.todo, color: 'text-gray-500 dark:text-gray-400' },
      { label: 'Active', count: counts.in_progress, color: 'text-blue-600 dark:text-blue-400' },
      { label: 'Done', count: counts.done, color: 'text-green-600 dark:text-green-400' },
    ];
  }

  ngOnInit() {
    this.isDark = document.documentElement.classList.contains('dark');
    this.store.dispatch(TasksActions.loadTasks({}));
    this.tasks$.subscribe((tasks) => { this.allTasks = tasks; });
  }

  getColumnTasks(status: TaskStatus): ITask[] {
    return this.allTasks.filter((t) => t.status === status);
  }

  openCreate() {
    this.selectedTask = null;
    this.showForm = true;
  }

  openEdit(task: ITask) {
    this.selectedTask = task;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedTask = null;
  }

  onSave(dto: CreateTaskDto | UpdateTaskDto) {
    if (this.selectedTask) {
      this.store.dispatch(TasksActions.updateTask({ id: this.selectedTask.id, dto }));
    } else {
      this.store.dispatch(TasksActions.createTask({ dto: dto as CreateTaskDto }));
    }
    this.closeForm();
  }

  onDelete(id: string) {
    if (confirm('Delete this task?')) {
      this.store.dispatch(TasksActions.deleteTask({ id }));
    }
  }

  onToggleStatus(task: ITask) {
    const next = task.status === 'done' ? TaskStatus.TODO : TaskStatus.DONE;
    this.store.dispatch(TasksActions.updateTask({ id: task.id, dto: { status: next } }));
  }

  onDrop(event: CdkDragDrop<ITask[]>, targetStatus: string) {
    this.isDragOver = null;
    if (event.previousContainer === event.container) {
      const items = [...event.container.data];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      const ids = items.map((t) => t.id);
      this.store.dispatch(TasksActions.reorderTasks({ taskIds: ids }));
    } else {
      const task = event.item.data as ITask;
      this.store.dispatch(
        TasksActions.updateTask({
          id: task.id,
          dto: { status: targetStatus as TaskStatus },
        }),
      );
    }
  }

  onSearch(value: string) {
    this.store.dispatch(TasksActions.setFilter({ filter: { search: value || undefined } }));
  }

  applyFilter() {
    this.store.dispatch(
      TasksActions.setFilter({
        filter: {
          status: (this.statusFilter as TaskStatus) || undefined,
          priority: (this.priorityFilter as TaskPriority) || undefined,
          category: (this.categoryFilter as TaskCategory) || undefined,
          search: this.search || undefined,
        },
      }),
    );
  }

  clearFilters() {
    this.search = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.categoryFilter = '';
    this.store.dispatch(TasksActions.setFilter({ filter: {} }));
  }

  toggleDark() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  dismissError() {
    this.store.dispatch(TasksActions.clearError());
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.target as HTMLElement).tagName === 'INPUT' ||
        (event.target as HTMLElement).tagName === 'TEXTAREA' ||
        (event.target as HTMLElement).tagName === 'SELECT') return;

    switch (event.key.toLowerCase()) {
      case 'n':
        if (this.canCreate && !this.showForm) {
          event.preventDefault();
          this.openCreate();
        }
        break;
      case 'escape':
        this.closeForm();
        this.showAudit = false;
        this.showUserMenu = false;
        break;
    }
  }
}
