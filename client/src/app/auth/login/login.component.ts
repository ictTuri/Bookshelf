import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../../service/auth/login.service';
import { AuthStateService } from '../../service/auth/auth-state.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authState: AuthStateService,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: '6849787957-l9rd48diu3rj4517gtgo6fm7053gsi6p.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response)
    });
    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large' }
    );
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginService.authenticate(this.loginForm.value)
        .subscribe({
          next: (response) => {
            this.authState.setUser({ email: this.loginForm.value.email, token: response.token });
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Login failed:', error);
          }
        });
    }
  }

  handleGoogleCredential(response: any) {
    const idToken = response.credential;
    this.http.post<any>('http://localhost:8088/api/v1/auth/google', { idToken })
      .subscribe({
        next: (res) => {
          this.authState.setUser({ email: res.email, token: res.token });
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Google login failed:', err);
        }
      });
  }
}
