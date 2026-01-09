import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dmsAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isDmsAuthenticated()) {
    return true;
  }

  router.navigate(['/dms']);
  return false;
};

