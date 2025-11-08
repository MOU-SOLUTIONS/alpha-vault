import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated() now validates token expiration
  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Clear any stale auth data
    authService.logout();
    router.navigate(['/auth/login'], {
      queryParams: { 
        returnUrl: router.url,
        expired: 'true'
      }
    });
    return false;
  }
};
