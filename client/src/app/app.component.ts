import { Component } from '@angular/core';
import { AuthStateService, AuthUser } from './service/auth/auth-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  user$: Observable<AuthUser | null>;

  constructor(private authState: AuthStateService) {
    this.user$ = this.authState.user$;
  }

  logout() {
    this.authState.clearUser();
  }
}
