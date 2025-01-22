import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, first, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from "jwt-decode";
import { PoNotificationService } from '@po-ui/ng-components';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user$ = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.baseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private poNotification: PoNotificationService
  ) {
    this.poNotification.setDefaultDuration(2500)
  }


  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // recoverPassword(email: string): Promise<any> {
  //     const body = { email };
  //     const result = this.http.post(`${this.baseUrl}/auth/recovery-password`, body)
  //     return firstValueFrom(result)
  // }


  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const now = new Date().getTime() / 1000;
    return decoded.exp < now;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  async login(email: string, password: string): Promise<any> {
    try {
      email = email.trim();
      password = password.trim();
      const body = { email, password };
      this.http
        .post(`${this.baseUrl}/auth/login`, body)
        .subscribe({
          next: (res: any) => {
            this.user$.next(true);
            localStorage.setItem('access_token', res.access_token)
            localStorage.setItem('user', JSON.stringify(res.user))
            this.router.navigate(['/menu/invoice']);
          },
          error: (err) => {
            if(err.error.statusCode === 401){
              this.poNotification.error('Usuário ou senha inválidos');
            }
            console.error('Error logging in:', err);
          },
        });
      return;
    } catch (error) {
      console.error('Erro no login:', error);
      this.poNotification.error(`Erro no login: ${error}`,)
    }
  }

  async logout(): Promise<void> {
    try {
      this.user$.next(false);
      // Remove o estado de login do localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

}
