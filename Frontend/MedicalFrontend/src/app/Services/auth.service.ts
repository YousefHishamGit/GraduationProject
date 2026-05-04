import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponseDto } from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  getCurrentUser(): AuthResponseDto | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || payload['sub']
        || null;
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}