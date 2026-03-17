import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'citas_saas_access_token';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}