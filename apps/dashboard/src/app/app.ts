import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from './store/auth/auth.actions';
import { AuthStorageService } from './core/services/auth-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  private readonly store = inject(Store);
  private readonly storage = inject(AuthStorageService);

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    if (this.storage.isLoggedIn()) {
      const user = this.storage.getUser();
      const token = this.storage.getToken();
      if (user && token) {
        this.store.dispatch(
          AuthActions.loginSuccess({
            auth: { accessToken: token, user },
          }),
        );
      }
    }
  }
}
