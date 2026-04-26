import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const userStr = localStorage.getItem('currentUser');

    if (!userStr) {
      router.navigate(['/login']);
      return false;
    }

    const user = JSON.parse(userStr);

    if (allowedRoles.includes(user.role)) return true;

    router.navigate(['/']);
    return false;
  };
};