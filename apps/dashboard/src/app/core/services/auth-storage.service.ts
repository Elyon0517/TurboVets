import { Injectable } from '@angular/core';
import { IAuthResponse } from '@org/data';

const TOKEN_KEY = 'turbo_tasks_token';
const USER_KEY = 'turbo_tasks_user';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  setAuth(auth: IAuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): IAuthResponse['user'] | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IAuthResponse['user'];
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
