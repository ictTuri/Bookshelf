import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'http://localhost:8088/api/v1/auth/authenticate';
  private registerUrl = 'http://localhost:8088/api/v1/auth/register';

  constructor(private http: HttpClient) {}

  authenticate(authRequest: AuthRequest): Observable<any> {
    return this.http.post<any>(this.loginUrl, authRequest);
  }

  register(authRequest: AuthRequest): Observable<any> {
    return this.http.post<any>(this.registerUrl, authRequest);
  }
}
