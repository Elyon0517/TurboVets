import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ITask, TaskStatus, TaskPriority, TaskCategory, RoleType } from '@org/data';
import { AuthStorageService } from '../../core/services/auth-storage.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div
      class="task-card card p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-150 animate-fade-in"
      [class.opacity-60]="task.status === 'done'"
    >
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug flex-1" [class.line-through]="task.status === 'done'">
          {{ task.title }}
        </h3>
        <div class="flex items-center gap-1 shrink-0">
          @if (canEdit) {
            <button
              (click)="edit.emit(task)"
              class="btn-ghost p-1 rounded-lg"
              title="Edit task (E)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          }
          @if (canDelete) {
            <button
              (click)="delete.emit(task.id)"
              class="btn-ghost p-1 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete task (Del)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          }
        </div>
      </div>

      @if (task.description) {
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ task.description }}</p>
      }

      <div class="flex flex-wrap gap-1.5 mb-3">
        <span [class]="statusClass">{{ statusLabel }}</span>
        <span [class]="priorityClass">{{ task.priority }}</span>
        <span [class]="categoryClass">{{ task.category }}</span>
      </div>

      <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          {{ task.owner?.firstName ?? 'Unknown' }}
        </span>
        @if (task.dueDate) {
          <span class="flex items-center gap-1" [class.text-red-500]="isOverdue">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ task.dueDate | date:'MMM d' }}
          </span>
        }
        @if (canEdit) {
          <button
            (click)="toggleStatus.emit(task)"
            class="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {{ task.status === 'done' ? 'Reopen' : 'Complete' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: ITask;
  @Output() edit = new EventEmitter<ITask>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleStatus = new EventEmitter<ITask>();

  private readonly storage = inject(AuthStorageService);

  get currentUser() {
    return this.storage.getUser();
  }

  get canEdit(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const role = user.role as RoleType;
    if (role === RoleType.OWNER || role === RoleType.ADMIN) return true;
    return this.task.ownerId === user.id;
  }

  get canDelete(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const role = user.role as RoleType;
    if (role === RoleType.OWNER) return true;
    if (role === RoleType.ADMIN) return this.task.ownerId === user.id;
    return false;
  }

  get statusLabel(): string {
    const map: Record<TaskStatus, string> = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
    };
    return map[this.task.status] ?? this.task.status;
  }

  get statusClass(): string {
    const map: Record<TaskStatus, string> = {
      todo: 'badge-todo',
      in_progress: 'badge-in-progress',
      done: 'badge-done',
    };
    return map[this.task.status] ?? 'badge';
  }

  get priorityClass(): string {
    const map: Record<TaskPriority, string> = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
    };
    return map[this.task.priority] ?? 'badge';
  }

  get categoryClass(): string {
    const map: Record<TaskCategory, string> = {
      work: 'badge-work',
      personal: 'badge-personal',
      other: 'badge-other',
    };
    return map[this.task.category] ?? 'badge';
  }

  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === 'done') return false;
    return new Date(this.task.dueDate) < new Date();
  }
}
