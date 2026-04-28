import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IAuthResponse, LoginDto, CreateUserDto } from '@org/data';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ dto: LoginDto }>(),
    'Login Success': props<{ auth: IAuthResponse }>(),
    'Login Failure': props<{ error: string }>(),

    'Register': props<{ dto: CreateUserDto }>(),
    'Register Success': props<{ auth: IAuthResponse }>(),
    'Register Failure': props<{ error: string }>(),

    'Logout': emptyProps(),
    'Restore Session': emptyProps(),
  },
});
