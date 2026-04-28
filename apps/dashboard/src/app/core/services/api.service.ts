import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ITask,
  IAuthResponse,
  IAuditLog,
  LoginDto,
  CreateUserDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
  PaginatedResponse,
  IOrganization,
} from '@org/data';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  login(dto: LoginDto): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.base}/auth/login`, dto);
  }

  register(dto: CreateUserDto): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.base}/auth/register`, dto);
  }

  getMe(): Observable<IAuthResponse['user']> {
    return this.http.get<IAuthResponse['user']>(`${this.base}/auth/me`);
  }

  getTasks(filter: Partial<TaskFilterDto> = {}): Observable<ITask[]> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ITask[]>(`${this.base}/tasks`, { params });
  }

  createTask(dto: CreateTaskDto): Observable<ITask> {
    return this.http.post<ITask>(`${this.base}/tasks`, dto);
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<ITask> {
    return this.http.put<ITask>(`${this.base}/tasks/${id}`, dto);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }

  reorderTasks(taskIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/tasks/reorder`, { taskIds });
  }

  getAuditLog(page = 1, limit = 50): Observable<PaginatedResponse<IAuditLog>> {
    return this.http.get<PaginatedResponse<IAuditLog>>(
      `${this.base}/audit-log?page=${page}&limit=${limit}`,
    );
  }

  getOrganizations(): Observable<IOrganization[]> {
    return this.http.get<IOrganization[]>(`${this.base}/organizations`);
  }
}
