import { Component } from '@angular/core';

@Component({
  selector: 'app-authentication',
  standalone: false,
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {
isLoginView = true;

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }
}
