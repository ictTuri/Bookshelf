import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthStateService } from '../../service/auth/auth-state.service';
import { LoginService } from '../../service/auth/login.service';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements AfterViewInit {
  registerForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private loginService: LoginService,
              private authState: AuthStateService,
              private router: Router){
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: '6849787957-l9rd48diu3rj4517gtgo6fm7053gsi6p.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response)
    });
    google.accounts.id.renderButton(
      document.getElementById('google-signup-btn'),
      { theme: 'outline', size: 'large', text: 'signup_with' }
    );
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loginService.register(this.registerForm.value)
        .subscribe({
          next: () => {
            this.router.navigate(['/auth/confirm-account'], { queryParams: { email: this.registerForm.value.email } });
          },
          error: (error) => {
            console.error('Registration failed:', error);
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
