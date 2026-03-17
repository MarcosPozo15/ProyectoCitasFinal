import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { StorageService } from './storage.service';

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPERADMIN' | 'BUSINESS_ADMIN' | 'EMPLOYEE';
    isActive: boolean;
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.storage.setAccessToken(response.accessToken);
          localStorage.setItem('citas_saas_user', JSON.stringify(response.user));
        }),
      );
  }

  logout(): void {
    this.storage.clearAccessToken();
    localStorage.removeItem('citas_saas_user');
  }

  isAuthenticated(): boolean {
    return !!this.storage.getAccessToken();
  }

  getToken(): string | null {
    return this.storage.getAccessToken();
  }

  getStoredUser():
    | LoginResponse['user']
    | null {
    const raw = localStorage.getItem('citas_saas_user');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LoginResponse['user'];
    } catch {
      return null;
    }
  }
}