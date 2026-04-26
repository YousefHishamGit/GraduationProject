import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // فك تشفير الـ JWT يدويًا
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));

      console.log('Token Decoded Full:', decoded);

      // البحث عن الـ ID في الحقول المختلفة
      let userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                   decoded.sub ||
                   decoded.userId ||
                   decoded.id ||
                   decoded.nameid;

      console.log('Extracted User ID from Token:', userId);

      return userId || null;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}

