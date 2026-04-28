import { createFeature, createReducer, on } from '@ngrx/store';
import { IAuthResponse } from '@org/data';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: IAuthResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { auth }) => ({
    ...state,
    loading: false,
    user: auth.user,
    token: auth.accessToken,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { auth }) => ({
    ...state,
    loading: false,
    user: auth.user,
    token: auth.accessToken,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.restoreSession, (state) => state),
);

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
});

export const { selectAuthState, selectUser, selectToken, selectLoading, selectError } =
  authFeature;
