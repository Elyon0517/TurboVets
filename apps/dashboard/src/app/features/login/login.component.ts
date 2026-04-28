import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectLoading, selectError } from '../../store/auth/auth.reducer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Turbo Tasks</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Secure Task Management</p>
        </div>

        <div class="card p-8 animate-slide-up">
          <div class="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
            <button
              (click)="mode = 'login'"
              [class.bg-white]="mode === 'login'"
              [class.dark:bg-gray-800]="mode === 'login'"
              [class.shadow-sm]="mode === 'login'"
              [class.text-gray-900]="mode === 'login'"
              [class.dark:text-white]="mode === 'login'"
              [class.text-gray-500]="mode !== 'login'"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-150"
            >
              Sign In
            </button>
            <button
              (click)="mode = 'register'"
              [class.bg-white]="mode === 'register'"
              [class.dark:bg-gray-800]="mode === 'register'"
              [class.shadow-sm]="mode === 'register'"
              [class.text-gray-900]="mode === 'register'"
              [class.dark:text-white]="mode === 'register'"
              [class.text-gray-500]="mode !== 'register'"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-150"
            >
              Register
            </button>
          </div>

          @if (error$ | async; as error) {
            <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error }}
            </div>
          }

          @if (mode === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
              <div>
                <label class="label">Email address</label>
                <input
                  type="email"
                  formControlName="email"
                  class="input"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
              </div>
              <div>
                <label class="label">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
              <button
                type="submit"
                class="btn-primary w-full mt-2"
                [disabled]="loginForm.invalid || (loading$ | async)"
              >
                @if (loading$ | async) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                } @else {
                  Sign In
                }
              </button>
            </form>
          }

          @if (mode === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">First name</label>
                  <input type="text" formControlName="firstName" class="input" placeholder="Alice" />
                </div>
                <div>
                  <label class="label">Last name</label>
                  <input type="text" formControlName="lastName" class="input" placeholder="Smith" />
                </div>
              </div>
              <div>
                <label class="label">Email address</label>
                <input type="email" formControlName="email" class="input" placeholder="you@example.com" />
              </div>
              <div>
                <label class="label">Password</label>
                <input type="password" formControlName="password" class="input" placeholder="Min 8 characters" />
              </div>
              <div>
                <label class="label">Organization ID</label>
                <input type="text" formControlName="organizationId" class="input" placeholder="Enter organization UUID" />
                <p class="text-xs text-gray-500 mt-1">Ask your admin for the organization ID</p>
              </div>
              <div>
                <label class="label">Role</label>
                <select formControlName="roleType" class="input">
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <button
                type="submit"
                class="btn-primary w-full mt-2"
                [disabled]="registerForm.invalid || (loading$ | async)"
              >
                @if (loading$ | async) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                } @else {
                  Create Account
                }
              </button>
            </form>
          }

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-center text-gray-500 dark:text-gray-400 mb-3 font-medium">Demo Credentials</p>
            <div class="grid grid-cols-3 gap-2">
              @for (demo of demoUsers; track demo.email) {
                <button
                  (click)="fillDemo(demo.email)"
                  class="text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <span class="block font-semibold capitalize">{{ demo.role }}</span>
                  <span class="block truncate">{{ demo.email }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  mode: 'login' | 'register' = 'login';

  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  demoUsers = [
    { email: 'owner@acme.com', role: 'owner' },
    { email: 'admin@acme.com', role: 'admin' },
    { email: 'viewer@acme.com', role: 'viewer' },
  ];

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    organizationId: ['', Validators.required],
    roleType: ['viewer', Validators.required],
  });

  ngOnInit() {}

  fillDemo(email: string) {
    this.mode = 'login';
    this.loginForm.setValue({ email, password: 'Password123!' });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.store.dispatch(
        AuthActions.login({
          dto: {
            email: this.loginForm.value.email!,
            password: this.loginForm.value.password!,
          },
        }),
      );
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.store.dispatch(
        AuthActions.register({
          dto: {
            firstName: this.registerForm.value.firstName!,
            lastName: this.registerForm.value.lastName!,
            email: this.registerForm.value.email!,
            password: this.registerForm.value.password!,
            organizationId: this.registerForm.value.organizationId!,
            roleType: this.registerForm.value.roleType!,
          },
        }),
      );
    }
  }
}
