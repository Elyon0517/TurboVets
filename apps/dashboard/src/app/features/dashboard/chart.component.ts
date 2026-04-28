import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITask, TaskStatus } from '@org/data';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Task Completion</h3>
      <div class="flex items-end gap-4">
        <div class="flex-1 flex items-end gap-3 h-24">
          @for (bar of bars; track bar.label) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-bold" [class]="bar.textColor">{{ bar.count }}</span>
              <div
                class="w-full rounded-t-md transition-all duration-500"
                [class]="bar.bgColor"
                [style.height.px]="bar.height"
              ></div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ bar.label }}</span>
            </div>
          }
        </div>

        <div class="flex flex-col items-center gap-1">
          <div class="relative w-20 h-20">
            <svg class="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" stroke-width="3" class="text-gray-200 dark:text-gray-700"/>
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                [attr.stroke-dasharray]="completionDash"
                stroke-linecap="round"
                class="text-green-500 transition-all duration-700"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold text-gray-700 dark:text-gray-200">{{ completionPct }}%</span>
            </div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">Complete</span>
        </div>

        <div class="space-y-2 min-w-[100px]">
          @for (p of priorities; track p.label) {
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" [class]="p.dot"></span>
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ p.label }}</span>
              </div>
              <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ p.count }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ChartComponent implements OnChanges {
  @Input() tasks: ITask[] = [];

  bars: { label: string; count: number; height: number; bgColor: string; textColor: string }[] = [];
  completionPct = 0;
  completionDash = '0 100';
  priorities: { label: string; count: number; dot: string }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks']) {
      this.update();
    }
  }

  update() {
    const todo = this.tasks.filter((t) => t.status === TaskStatus.TODO).length;
    const inProgress = this.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const done = this.tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const total = this.tasks.length || 1;
    const maxCount = Math.max(todo, inProgress, done, 1);

    this.bars = [
      { label: 'To Do', count: todo, height: Math.max((todo / maxCount) * 80, 4), bgColor: 'bg-gray-400 dark:bg-gray-600', textColor: 'text-gray-600 dark:text-gray-400' },
      { label: 'Active', count: inProgress, height: Math.max((inProgress / maxCount) * 80, 4), bgColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
      { label: 'Done', count: done, height: Math.max((done / maxCount) * 80, 4), bgColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
    ];

    this.completionPct = Math.round((done / total) * 100);
    const circumference = 100;
    const filled = (done / total) * circumference;
    this.completionDash = `${filled} ${circumference - filled}`;

    this.priorities = [
      { label: 'High', count: this.tasks.filter((t) => t.priority === 'high').length, dot: 'bg-red-500' },
      { label: 'Medium', count: this.tasks.filter((t) => t.priority === 'medium').length, dot: 'bg-yellow-500' },
      { label: 'Low', count: this.tasks.filter((t) => t.priority === 'low').length, dot: 'bg-gray-400' },
    ];
  }
}
