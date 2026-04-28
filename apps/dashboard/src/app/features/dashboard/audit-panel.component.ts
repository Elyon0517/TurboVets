import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { IAuditLog } from '@org/data';

@Component({
  selector: 'app-audit-panel',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="fixed inset-0 bg-black/50 z-40 flex justify-end" (click)="close.emit()">
      <div
        class="w-full max-w-lg bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 class="font-semibold text-gray-900 dark:text-white">Audit Log</h2>
          <button (click)="close.emit()" class="btn-ghost p-1.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="flex-1 p-4">
          @if (loading) {
            <div class="flex justify-center py-8">
              <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (logs.length === 0) {
            <p class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No audit logs found</p>
          } @else {
            <div class="space-y-2">
              @for (log of logs; track log.id) {
                <div class="p-3 rounded-lg border text-sm"
                  [class.border-green-200]="log.success"
                  [class.bg-green-50]="log.success"
                  [class.dark:border-green-800]="log.success"
                  [class.dark:bg-green-900/10]="log.success"
                  [class.border-red-200]="!log.success"
                  [class.bg-red-50]="!log.success"
                  [class.dark:border-red-800]="!log.success"
                  [class.dark:bg-red-900/10]="!log.success"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-mono font-medium text-xs" [class.text-green-700]="log.success" [class.dark:text-green-300]="log.success" [class.text-red-700]="!log.success" [class.dark:text-red-300]="!log.success">
                      {{ log.action }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{ log.createdAt | date:'MMM d, h:mm a' }}</span>
                  </div>
                  <div class="text-gray-600 dark:text-gray-400 text-xs">
                    <span class="font-medium">{{ log.user?.email ?? 'anonymous' }}</span>
                    @if (log.details) { · {{ log.details }} }
                  </div>
                </div>
              }
            </div>
            @if (total > logs.length) {
              <button (click)="loadMore()" class="btn-secondary w-full mt-4 text-sm">
                Load more ({{ total - logs.length }} remaining)
              </button>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class AuditPanelComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private readonly api = inject(ApiService);

  logs: IAuditLog[] = [];
  loading = true;
  total = 0;
  page = 1;

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.api.getAuditLog(this.page).subscribe({
      next: (res) => {
        this.logs = [...this.logs, ...res.data];
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  loadMore() {
    this.page++;
    this.loadLogs();
  }
}
