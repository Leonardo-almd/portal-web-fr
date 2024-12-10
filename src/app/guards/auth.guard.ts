import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    if(state.url === '/auth') {
      router.navigate(['/']);
    }
    return true;
  } else {
    if(state.url !== '/auth') {
      return false
    } else {
      return true;
    }
  }
};
