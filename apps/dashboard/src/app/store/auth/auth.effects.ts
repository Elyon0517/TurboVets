import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly storage = inject(AuthStorageService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ dto }) =>
        this.api.login(dto).pipe(
          map((auth) => AuthActions.loginSuccess({ auth })),
          catchError((err: { error?: { message?: string } }) =>
            of(AuthActions.loginFailure({ error: err.error?.message ?? 'Login failed' })),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ auth }) => {
          this.storage.setAuth(auth);
          this.router.navigate(['/dashboard']);
        }),
      ),
    { dispatch: false },
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ dto }) =>
        this.api.register(dto).pipe(
          map((auth) => AuthActions.registerSuccess({ auth })),
          catchError((err: { error?: { message?: string } }) =>
            of(AuthActions.registerFailure({ error: err.error?.message ?? 'Registration failed' })),
          ),
        ),
      ),
    ),
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ auth }) => {
          this.storage.setAuth(auth);
          this.router.navigate(['/dashboard']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.storage.clear();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
