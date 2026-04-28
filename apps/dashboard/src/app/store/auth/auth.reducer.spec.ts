import { authFeature, AuthState } from './auth.reducer';
import { AuthActions } from './auth.actions';
import { RoleType } from '@org/data';

const mockAuth = {
  accessToken: 'mock-token',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    organizationId: 'org-1',
    roleId: 'role-1',
    role: RoleType.ADMIN,
    organizationName: 'Test Org',
    createdAt: new Date(),
  },
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

describe('Auth Reducer', () => {
  it('should return initial state', () => {
    const state = authFeature.reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('should set loading on login action', () => {
    const state = authFeature.reducer(
      initialState,
      AuthActions.login({ dto: { email: 'test@test.com', password: 'pass' } }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set user and token on login success', () => {
    const state = authFeature.reducer(
      { ...initialState, loading: true },
      AuthActions.loginSuccess({ auth: mockAuth }),
    );
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockAuth.user);
    expect(state.token).toBe('mock-token');
    expect(state.error).toBeNull();
  });

  it('should set error on login failure', () => {
    const state = authFeature.reducer(
      { ...initialState, loading: true },
      AuthActions.loginFailure({ error: 'Invalid credentials' }),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.user).toBeNull();
  });

  it('should clear state on logout', () => {
    const loggedInState: AuthState = {
      user: mockAuth.user,
      token: 'mock-token',
      loading: false,
      error: null,
    };
    const state = authFeature.reducer(loggedInState, AuthActions.logout());
    expect(state).toEqual(initialState);
  });
});
