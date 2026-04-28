import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ITask, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, TaskCategory } from '@org/data';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="card w-full max-w-lg p-6 z-50 animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ task ? 'Edit Task' : 'New Task' }}
          </h2>
          <button (click)="close.emit()" class="btn-ghost p-1.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="label">Title <span class="text-red-500">*</span></label>
            <input
              type="text"
              formControlName="title"
              class="input"
              placeholder="What needs to be done?"
              autofocus
            />
            @if (form.get('title')?.touched && form.get('title')?.invalid) {
              <p class="text-xs text-red-500 mt-1">Title is required</p>
            }
          </div>

          <div>
            <label class="label">Description</label>
            <textarea
              formControlName="description"
              class="input resize-none"
              rows="3"
              placeholder="Add more details..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Status</label>
              <select formControlName="status" class="input">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label class="label">Priority</label>
              <select formControlName="priority" class="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Category</label>
              <select formControlName="category" class="input">
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="label">Due Date</label>
              <input
                type="date"
                formControlName="dueDate"
                class="input"
              />
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button type="button" (click)="close.emit()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  @Input() task: ITask | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateTaskDto | UpdateTaskDto>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: [TaskStatus.TODO],
    priority: [TaskPriority.MEDIUM],
    category: [TaskCategory.WORK],
    dueDate: [''],
  });

  ngOnInit() {
    if (this.task) {
      const dueDate = this.task.dueDate
        ? new Date(this.task.dueDate).toISOString().split('T')[0]
        : '';
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description ?? '',
        status: this.task.status,
        priority: this.task.priority,
        category: this.task.category,
        dueDate,
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;
      const dto: CreateTaskDto = {
        title: value.title!,
        description: value.description ?? undefined,
        status: value.status as TaskStatus,
        priority: value.priority as TaskPriority,
        category: value.category as TaskCategory,
        dueDate: value.dueDate ?? undefined,
      };
      this.save.emit(dto);
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('backdrop-blur-sm')) {
      this.close.emit();
    }
  }
}
