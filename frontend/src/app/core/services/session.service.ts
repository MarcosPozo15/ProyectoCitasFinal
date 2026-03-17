import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';

export type MyBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  status: string;
  timezone: string;
  currency: string;
  adminUserId: string;
};

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getCurrentRole(): 'SUPERADMIN' | 'BUSINESS_ADMIN' | 'EMPLOYEE' | null {
    return this.authService.getStoredUser()?.role ?? null;
  }

  isSuperadmin(): boolean {
    return this.getCurrentRole() === 'SUPERADMIN';
  }

  isBusinessAdmin(): boolean {
    return this.getCurrentRole() === 'BUSINESS_ADMIN';
  }

  getMyBusiness(): Observable<MyBusinessResponse> {
    return this.http.get<MyBusinessResponse>(`${API_BASE_URL}/my-business`);
  }
}